import {
  addDoc,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "./firestoreRest";
import { db } from "../firebaseConfig";
import { clean, typedCollection, withId } from "./firestore";
import type { Rating } from "../../types/models";

const ratingsCol = typedCollection<Rating>("ratings");

interface SubmitRatingArgs {
  projectId: string;
  projectTitle: string;
  expertId: string;
  smeId: string;
  raterId: string;
  stars: number;
  review: string;
}

/**
 * Records a rating and atomically updates the expert's denormalized reputation
 * aggregates (`ratingAverage`, `ratingCount`) in one transaction so the running
 * average can never drift from the underlying reviews.
 */
export async function submitRating(args: SubmitRatingArgs): Promise<void> {
  const expertRef = doc(db, "users", args.expertId);
  await addDoc(ratingsCol, clean({
    projectId: args.projectId,
    projectTitle: args.projectTitle,
    expertId: args.expertId,
    smeId: args.smeId,
    raterId: args.raterId,
    stars: args.stars,
    review: args.review,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }) as never);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(expertRef);
    if (!snap.exists()) return;
    const expert = snap.data()?.expert ?? {};
    const count = (expert.ratingCount ?? 0) + 1;
    const average =
      ((expert.ratingAverage ?? 0) * (count - 1) + args.stars) / count;
    tx.update(expertRef, {
      "expert.ratingCount": count,
      "expert.ratingAverage": Math.round(average * 10) / 10,
      updatedAt: serverTimestamp(),
    });
  });
}

/** All reviews for an expert, newest first (public profile). */
export async function listExpertRatings(expertId: string): Promise<Rating[]> {
  const snap = await getDocs(
    query(ratingsCol, where("expertId", "==", expertId), orderBy("createdAt", "desc")),
  );
  return snap.docs.map((d) => withId<Rating>(d));
}

/** Whether this SME already rated this project (prevents double-rating). */
export async function hasRated(projectId: string, raterId: string): Promise<boolean> {
  const snap = await getDocs(
    query(ratingsCol, where("projectId", "==", projectId), where("raterId", "==", raterId)),
  );
  return !snap.empty;
}


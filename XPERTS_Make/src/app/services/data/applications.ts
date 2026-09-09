import {
  addDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "./firestoreRest";
import { db } from "../firebaseConfig";
import { clean, typedCollection, withId } from "./firestore";
import { incrementApplicantCount } from "./projects";
import { calculateMatchScore } from "../matching";
import type {
  Application,
  ApplicationStatus,
  ExpertProfile,
  Project,
} from "../../types/models";

const applicationsCol = typedCollection<Application>("applications");
const applicationRef = (id: string) => doc(db, "applications", id);

interface ApplyArgs {
  project: Project;
  expertId: string;
  expert: ExpertProfile;
  coverLetter: string;
  proposedRate: number;
}

/**
 * Submits an application. Denormalizes project + expert snapshots so the SME
 * and expert dashboards each render from a single document, and bumps the
 * project's applicant counter.
 */
export async function applyToProject(args: ApplyArgs): Promise<string> {
  const { project, expertId, expert, coverLetter, proposedRate } = args;
  const ref = await addDoc(applicationsCol, clean({
    projectId: project.id,
    expertId,
    smeId: project.ownerId,
    status: "pending" as ApplicationStatus,
    coverLetter,
    proposedRate,
    matchScore: calculateMatchScore(project, expert),
    project: {
      title: project.title,
      category: project.category,
      budgetPerDay: project.budgetPerDay,
      durationDays: project.durationDays,
      locationType: project.locationType,
    },
    expert: {
      fullName: expert.fullName,
      headline: expert.headline,
      photoURL: undefined,
      dailyRate: expert.dailyRate,
      ratingAverage: expert.ratingAverage,
      ratingCount: expert.ratingCount,
      competencies: expert.competencies,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }) as never);
  await incrementApplicantCount(project.id);
  return ref.id;
}

/** Returns this expert's application to a project (if any) — for status + withdraw. */
export async function getMyApplication(
  projectId: string,
  expertId: string,
): Promise<Application | null> {
  const snap = await getDocs(
    query(
      applicationsCol,
      where("projectId", "==", projectId),
      where("expertId", "==", expertId),
    ),
  );
  return snap.empty ? null : withId<Application>(snap.docs[0]);
}

/** Realtime applications submitted by an expert (their tracking tab). */
export function subscribeExpertApplications(
  expertId: string,
  cb: (apps: Application[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    applicationsCol,
    where("expertId", "==", expertId),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => withId<Application>(d))),
    (e) => {
      console.error("subscribeExpertApplications failed:", e);
      onError?.(e);
    },
  );
}

/**
 * Realtime applications received for a given project (SME review).
 *
 * Filters by `smeId` as well as `projectId` so the query satisfies the
 * security rule (which authorizes reads by the owning SME) — Firestore rejects
 * queries it can't prove are scoped to authorized documents. Sorted by match
 * score client-side to avoid an extra composite index.
 */
export function subscribeProjectApplications(
  projectId: string,
  smeId: string,
  cb: (apps: Application[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    applicationsCol,
    where("projectId", "==", projectId),
    where("smeId", "==", smeId),
  );
  return onSnapshot(
    q,
    (snap) =>
      cb(snap.docs.map((d) => withId<Application>(d)).sort((a, b) => b.matchScore - a.matchScore)),
    (e) => {
      console.error("subscribeProjectApplications failed:", e);
      onError?.(e);
    },
  );
}

export async function setApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<void> {
  await updateDoc(applicationRef(id), { status, updatedAt: serverTimestamp() });
}

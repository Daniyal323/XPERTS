import {
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  addDoc,
} from "./firestoreRest";
import { db } from "../firebaseConfig";
import { clean, typedCollection, withId } from "./firestore";
import type {
  Project,
  ProjectInput,
  ProjectStatus,
  SMEProfile,
} from "../../types/models";

const projectsCol = typedCollection<Project>("projects");
const projectRef = (id: string) => doc(db, "projects", id);

interface CreateProjectArgs {
  ownerId: string;
  owner: Pick<SMEProfile, "companyName" | "logoURL">;
  input: ProjectInput;
}

export async function createProject({ ownerId, owner, input }: CreateProjectArgs): Promise<string> {
  const ref = await addDoc(projectsCol, clean({
    ownerId,
    ownerCompany: owner.companyName,
    ownerLogoURL: owner.logoURL,
    ...input,
    currency: "EUR",
    status: "open" as ProjectStatus,
    applicantCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }) as never);
  return ref.id;
}

export async function getProject(id: string): Promise<Project | null> {
  const snap = await getDoc(projectRef(id));
  return snap.exists() ? withId<Project>(snap as never) : null;
}

export function subscribeProject(
  id: string,
  cb: (p: Project | null) => void,
  onError?: (e: Error) => void,
): () => void {
  return onSnapshot(
    projectRef(id),
    (snap) => cb(snap.exists() ? withId<Project>(snap as never) : null),
    (e) => {
      console.error("subscribeProject failed:", e);
      onError?.(e);
    },
  );
}

/** True if a doc has the fields the current Project schema requires. */
function isValidProject(p: Project): boolean {
  return typeof p.budgetPerDay === "number" && typeof p.durationDays === "number" && !!p.title;
}

/**
 * Open projects for the expert opportunity feed (newest first).
 * Filters out legacy/malformed documents so the feed never renders broken cards.
 */
export async function listOpenProjects(): Promise<Project[]> {
  const snap = await getDocs(
    query(projectsCol, where("status", "==", "open"), orderBy("createdAt", "desc")),
  );
  return snap.docs.map((d) => withId<Project>(d)).filter(isValidProject);
}

/** All projects owned by an SME — realtime for the dashboard. */
export function subscribeOwnerProjects(
  ownerId: string,
  cb: (projects: Project[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    projectsCol,
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => withId<Project>(d))),
    (e) => {
      console.error("subscribeOwnerProjects failed:", e);
      onError?.(e);
    },
  );
}

export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<void> {
  await updateDoc(projectRef(id), { status, updatedAt: serverTimestamp() });
}

export async function setEngagedExpert(id: string, expertId: string): Promise<void> {
  await updateDoc(projectRef(id), {
    engagedExpertId: expertId,
    status: "in_progress" satisfies ProjectStatus,
    updatedAt: serverTimestamp(),
  });
}

/** Atomically bumps the applicant counter when an expert applies. */
export async function incrementApplicantCount(id: string, by = 1): Promise<void> {
  await updateDoc(projectRef(id), { applicantCount: increment(by) });
}

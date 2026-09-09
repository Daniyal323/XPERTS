import type { Timestamp } from "firebase/firestore";

/**
 * Domain model for the XPERTS marketplace.
 *
 * This is the single source of truth for the shapes persisted in Firestore.
 * The data layer (`services/data/*`) is responsible for converting raw
 * Firestore documents into these typed entities and back.
 *
 * Timestamps are stored as Firestore `Timestamp` values. UI code should use
 * the helpers in `lib/datetime.ts` to format them rather than touching the
 * `Timestamp` API directly.
 */

// ---------------------------------------------------------------------------
// Enums / unions
// ---------------------------------------------------------------------------

export type UserRole = "SME" | "EXPERT" | "ADMIN";

export type ProjectStatus =
  | "open" // accepting applications
  | "in_progress" // an expert has been engaged
  | "completed" // work finished, eligible for rating
  | "closed" // closed without engagement
  | "cancelled";

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type LocationType = "remote" | "onsite" | "hybrid";

export type Availability = "available" | "limited" | "unavailable";

export type Locale = "en" | "de";

export const CURRENCY = "EUR" as const;
export type Currency = typeof CURRENCY;

// ---------------------------------------------------------------------------
// Shared value objects
// ---------------------------------------------------------------------------

export interface GeoLocation {
  /** Human-readable place, e.g. "München, DE". */
  label: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

export interface Timestamps {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ---------------------------------------------------------------------------
// Accounts & profiles
// ---------------------------------------------------------------------------

/**
 * The root `users/{uid}` document. Holds identity + role; the role-specific
 * detail lives in the embedded `expert` / `sme` profile so a single read
 * hydrates everything the app needs.
 */
export interface UserAccount {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL?: string;
  locale: Locale;
  /** Onboarding completion flag — gates dashboard access. */
  profileComplete: boolean;
  /** Device push tokens (FCM). */
  fcmTokens?: string[];
  /** User preference: receive push notifications. Defaults to true when unset. */
  notificationsEnabled?: boolean;
  /** Days marked unavailable, as "YYYY-MM-DD" strings (availability calendar). */
  bookedDates?: string[];
  expert?: ExpertProfile;
  sme?: SMEProfile;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ExpertProfile {
  fullName: string;
  /** Short professional tagline, e.g. "Lean Production & OEE Specialist". */
  headline: string;
  bio: string;
  /** Free-text professional background / experience summary. */
  background: string;
  competencies: string[];
  industries: string[];
  yearsExperience: number;
  dailyRate: number;
  currency: Currency;
  availability: Availability;
  locationType: LocationType;
  location?: GeoLocation;
  languages: string[];
  linkedinUrl?: string;
  verified: boolean;
  // Reputation (denormalized aggregates maintained by the ratings service).
  ratingAverage: number;
  ratingCount: number;
  completedProjects: number;
}

export interface SMEProfile {
  companyName: string;
  contactName: string;
  industry: string;
  /** e.g. "1-10", "11-50", "51-200". */
  companySize: string;
  website?: string;
  bio: string;
  location?: GeoLocation;
  logoURL?: string;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface Project extends Timestamps {
  id: string;
  ownerId: string;
  /** Denormalized SME identity for fast listing rendering. */
  ownerCompany: string;
  ownerLogoURL?: string;
  title: string;
  description: string;
  category: string;
  competenciesRequired: string[];
  budgetPerDay: number;
  currency: Currency;
  durationDays: number;
  locationType: LocationType;
  location?: GeoLocation;
  status: ProjectStatus;
  /** Maintained by the applications service. */
  applicantCount: number;
  /** Expert engaged once status === "in_progress". */
  engagedExpertId?: string;
  startDate?: Timestamp;
}

export type ProjectInput = Omit<
  Project,
  | "id"
  | "ownerId"
  | "ownerCompany"
  | "ownerLogoURL"
  | "status"
  | "applicantCount"
  | "engagedExpertId"
  | "createdAt"
  | "updatedAt"
  | "currency"
>;

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export interface Application extends Timestamps {
  id: string;
  projectId: string;
  expertId: string;
  smeId: string;
  status: ApplicationStatus;
  coverLetter: string;
  proposedRate: number;
  /** 0–100 score computed at apply-time so SMEs see a stable ranking. */
  matchScore: number;
  /** Denormalized snapshots so each list renders from one document. */
  project: ApplicationProjectSnapshot;
  expert: ApplicationExpertSnapshot;
}

export interface ApplicationProjectSnapshot {
  title: string;
  category: string;
  budgetPerDay: number;
  durationDays: number;
  locationType: LocationType;
}

export interface ApplicationExpertSnapshot {
  fullName: string;
  headline: string;
  photoURL?: string;
  dailyRate: number;
  ratingAverage: number;
  ratingCount: number;
  competencies: string[];
}

// ---------------------------------------------------------------------------
// Ratings & reviews
// ---------------------------------------------------------------------------

export interface Rating extends Timestamps {
  id: string;
  projectId: string;
  projectTitle: string;
  expertId: string;
  smeId: string;
  raterId: string;
  /** 1–5. */
  stars: number;
  review: string;
}

// ---------------------------------------------------------------------------
// Messaging
// ---------------------------------------------------------------------------

export interface Conversation {
  id: string;
  participantIds: string[];
  /** uid -> denormalized display info, for rendering the chat list. */
  participants: Record<string, ConversationParticipant>;
  projectId?: string;
  projectTitle?: string;
  lastMessage?: string;
  lastSenderId?: string;
  lastMessageAt?: Timestamp;
  /** uid -> count of unread messages. */
  unread: Record<string, number>;
  createdAt: Timestamp;
}

export interface ConversationParticipant {
  displayName: string;
  photoURL?: string;
  role: UserRole;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
  readBy: string[];
}

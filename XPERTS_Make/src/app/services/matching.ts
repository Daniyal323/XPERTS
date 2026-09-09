import type { ExpertProfile, LocationType, Project } from "../types/models";

/**
 * Unified expert ↔ project matching.
 *
 * This is the ONE place match scores are computed — both the expert dashboard
 * ("opportunities for me") and the SME matching list ("experts for my project")
 * call it, so a 78% match means the same thing on both sides.
 *
 * Weighting (sums to 100):
 *  - Competency overlap      45
 *  - Budget compatibility    30
 *  - Location / work-mode    25
 */
const WEIGHTS = { competency: 45, budget: 30, location: 25 } as const;

export interface MatchBreakdown {
  score: number;
  competency: number;
  budget: number;
  location: number;
}

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

/** Tokenizes free text into meaningful (>2 char) keywords. */
function keywords(...parts: (string | undefined)[]): Set<string> {
  const out = new Set<string>();
  for (const part of parts) {
    if (!part) continue;
    for (const token of normalize(part).split(/[^a-zA-Z0-9äöüß]+/)) {
      if (token.length > 2) out.add(token);
    }
  }
  return out;
}

function competencyScore(project: Project, expert: ExpertProfile): number {
  const comps = expert.competencies?.map(normalize) ?? [];
  if (comps.length === 0) return WEIGHTS.competency * 0.4; // unknown → partial credit

  // Strong signal: explicit required competencies overlapping the expert's.
  const required = project.competenciesRequired?.map(normalize) ?? [];
  if (required.length > 0) {
    const hits = required.filter((req) =>
      comps.some((c) => c.includes(req) || req.includes(c)),
    ).length;
    return WEIGHTS.competency * (hits / required.length);
  }

  // Fallback: match competencies against title/description/category keywords.
  const kw = keywords(project.title, project.description, project.category);
  if (kw.size === 0) return WEIGHTS.competency * 0.4;
  const hits = comps.filter((c) =>
    [...kw].some((k) => c.includes(k) || k.includes(c)),
  ).length;
  return Math.min(WEIGHTS.competency, WEIGHTS.competency * (hits / Math.min(comps.length, 4)));
}

function budgetScore(project: Project, expert: ExpertProfile): number {
  const rate = expert.dailyRate ?? 0;
  const budget = project.budgetPerDay ?? 0;
  if (rate <= 0 || budget <= 0) return WEIGHTS.budget * 0.5;
  if (rate <= budget) return WEIGHTS.budget; // within budget → full marks
  const ratio = rate / budget; // over budget → degrade, zero past 1.5x
  if (ratio >= 1.5) return 0;
  return Math.max(0, WEIGHTS.budget * (1 - (ratio - 1) / 0.5));
}

function locationScore(projectMode: LocationType, expertMode: LocationType): number {
  if (projectMode === expertMode) return WEIGHTS.location;
  if (projectMode === "remote" && expertMode === "hybrid") return WEIGHTS.location;
  if (projectMode === "hybrid" || expertMode === "hybrid") return WEIGHTS.location * 0.7;
  // remote project vs onsite-only expert (or vice versa) → weak.
  return WEIGHTS.location * 0.2;
}

export function matchBreakdown(project: Project, expert: ExpertProfile): MatchBreakdown {
  const competency = competencyScore(project, expert);
  const budget = budgetScore(project, expert);
  const location = locationScore(project.locationType, expert.locationType);
  const score = Math.round(
    Math.min(100, Math.max(0, competency + budget + location)),
  );
  return {
    score,
    competency: Math.round(competency),
    budget: Math.round(budget),
    location: Math.round(location),
  };
}

export function calculateMatchScore(project: Project, expert: ExpertProfile): number {
  return matchBreakdown(project, expert).score;
}

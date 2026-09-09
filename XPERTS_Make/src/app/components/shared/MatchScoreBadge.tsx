import { cn } from "../ui/utils";

/** Tone thresholds shared by the pill and the ring. */
function tone(score: number): { text: string; bg: string; ring: string } {
  if (score >= 75) return { text: "text-success", bg: "bg-success-subtle", ring: "var(--success)" };
  if (score >= 50) return { text: "text-info", bg: "bg-info-subtle", ring: "var(--info)" };
  return { text: "text-warning", bg: "bg-warning-subtle", ring: "var(--warning)" };
}

/** Compact "82% Match" pill used on opportunity/expert cards. */
export function MatchScoreBadge({ score, className }: { score: number; className?: string }) {
  const c = tone(score);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        c.bg,
        c.text,
        className,
      )}
    >
      {score}% Match
    </span>
  );
}

/** Larger progress ring for the matching-list hero / detail header. */
export function MatchScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const c = tone(score);
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={c.ring}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={cn("absolute text-sm font-bold", c.text)}>{score}</span>
    </div>
  );
}

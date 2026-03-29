import { OpeningLine, UserProgress, ScoredLine } from "@/types";

const SECONDS_PER_HOUR = 3600;

/** Score a line for scheduling – higher score = higher priority. */
function scoreLine(
  line: OpeningLine,
  progress: UserProgress | null,
  now: number
): number {
  if (!progress) {
    // Never seen – new content gets medium priority + random
    return 3 + Math.random() * 2;
  }

  const overdueWeight =
    now > progress.nextDue ? (now - progress.nextDue) / SECONDS_PER_HOUR : 0;

  const randomFactor = Math.random() * 1.5;

  return (
    (1 - progress.successRate) * 5 +
    progress.mistakeCount * 0.5 +
    overdueWeight +
    randomFactor
  );
}

export interface DailyGoal {
  newCount: number;   // 2 new lines
  reviewCount: number; // 5 review lines
  trapCount: number;   // 3 trap lines
}

export const DAILY_GOAL: DailyGoal = {
  newCount: 2,
  reviewCount: 5,
  trapCount: 3,
};

/**
 * Select the best lines to practice in the current session.
 * Returns lines sorted by priority.
 */
export function selectNextLines(
  allLines: OpeningLine[],
  progressMap: Record<string, UserProgress>,
  now: number,
  limit = 8
): ScoredLine[] {
  const scored: ScoredLine[] = allLines.map((line) => {
    const progress = progressMap[line.id] ?? null;
    return {
      line,
      score: scoreLine(line, progress, now),
      isNew: !progress,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Select a single next lesson line (highest priority).
 */
export function selectNextLine(
  allLines: OpeningLine[],
  progressMap: Record<string, UserProgress>,
  now: number
): ScoredLine | null {
  const lines = selectNextLines(allLines, progressMap, now, 1);
  return lines[0] ?? null;
}

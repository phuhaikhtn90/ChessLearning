import { OpeningLine, UserProgress, ScoredLine } from "@/types";

const SECONDS_PER_HOUR = 3600;

export function getRecommendationScore(line: OpeningLine): number {
  const recommendationWeight = line.bookCoverage?.isBookAligned
    ? line.bookCoverage.priority
    : 0;
  const popularityWeight = line.tags.includes("giuoco_pianissimo")
    ? 40
    : line.tags.includes("slow_italian")
    ? 34
    : line.tags.includes("two_knights")
    ? 28
    : line.tags.includes("defense")
    ? 18
    : line.tags.includes("gambit")
    ? 14
    : 10;
  const easeWeight = (5 - line.difficulty) * 8;

  return recommendationWeight + popularityWeight + easeWeight;
}

export function sortLinesByRecommendation(allLines: OpeningLine[]): OpeningLine[] {
  return [...allLines].sort((a, b) => {
    const scoreDiff = getRecommendationScore(b) - getRecommendationScore(a);
    if (scoreDiff !== 0) return scoreDiff;

    const alignedDiff =
      Number(Boolean(b.bookCoverage?.isBookAligned)) - Number(Boolean(a.bookCoverage?.isBookAligned));
    if (alignedDiff !== 0) return alignedDiff;

    const difficultyDiff = a.difficulty - b.difficulty;
    if (difficultyDiff !== 0) return difficultyDiff;

    return a.name.localeCompare(b.name);
  });
}

/** Score a line for scheduling – higher score = higher priority. */
function scoreLine(
  line: OpeningLine,
  progress: UserProgress | null,
  now: number
): number {
  const baseRecommendation = getRecommendationScore(line) / 10;

  if (!progress) {
    return 20 + baseRecommendation;
  }

  const overdueWeight =
    now > progress.nextDue ? (now - progress.nextDue) / SECONDS_PER_HOUR : 0;

  return (
    baseRecommendation +
    (1 - progress.successRate) * 5 +
    progress.mistakeCount * 0.5 +
    overdueWeight -
    progress.correctStreak * 0.2
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

import { UserProgress } from "@/types";

const BASE_INTERVAL_SECONDS = 3600; // 1 hour

/**
 * Calculate when the line should next be reviewed.
 * nextDue = now + baseInterval * (1 + correctStreak)
 */
export function calcNextDue(
  now: number,
  correctStreak: number
): number {
  return now + BASE_INTERVAL_SECONDS * (1 + correctStreak);
}

/**
 * Update a UserProgress record after an attempt.
 * @param progress existing progress (or null for first attempt)
 * @param wasCorrect whether the entire line was completed without mistakes
 * @param now current unix timestamp (seconds)
 */
export function updateProgress(
  progress: UserProgress | null,
  lineId: string,
  userId: string,
  wasCorrect: boolean,
  now: number
): UserProgress {
  const base: UserProgress = progress ?? {
    userId,
    lineId,
    successRate: 0,
    mistakeCount: 0,
    correctStreak: 0,
    lastSeen: 0,
    nextDue: 0,
    confidence: 0,
  };

  const totalAttempts = Math.round(
    base.successRate > 0 && base.successRate < 1
      ? base.mistakeCount / (1 - base.successRate) + base.mistakeCount
      : base.mistakeCount + 1
  );

  const newMistakeCount = wasCorrect
    ? base.mistakeCount
    : base.mistakeCount + 1;

  const newCorrectStreak = wasCorrect ? base.correctStreak + 1 : 0;

  const successCount = wasCorrect
    ? totalAttempts * base.successRate + 1
    : totalAttempts * base.successRate;
  const newSuccessRate = Math.min(
    1,
    successCount / (totalAttempts + 1)
  );

  const newConfidence = Math.min(
    1,
    newSuccessRate * 0.7 + (newCorrectStreak / 10) * 0.3
  );

  return {
    ...base,
    successRate: newSuccessRate,
    mistakeCount: newMistakeCount,
    correctStreak: newCorrectStreak,
    lastSeen: now,
    nextDue: calcNextDue(now, newCorrectStreak),
    confidence: newConfidence,
  };
}

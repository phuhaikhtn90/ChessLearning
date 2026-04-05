import { NextRequest, NextResponse } from "next/server";
import { AttemptLog, UserProgress } from "@/types";
import { updateProgress } from "@/lib/spacedRepetition";

const XP_CORRECT = 10;
const XP_MISTAKE = 2;
const XP_PERFECT = 20;

/**
 * POST /api/attempt
 * Body: { lineId, userId, moves, existingProgress? }
 * Returns: { progress, xpEarned }
 */
export async function POST(req: NextRequest) {
  let body: {
    lineId: string;
    userId?: string;
    moves: AttemptLog["moves"];
    existingProgress?: UserProgress | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { lineId, userId = "guest", moves, existingProgress = null } = body;

  if (!lineId || !Array.isArray(moves)) {
    return NextResponse.json(
      { error: "lineId and moves are required" },
      { status: 400 }
    );
  }

  const hasMistakes = moves.some((m) => !m.isCorrect);
  const wasCorrect = !hasMistakes;
  const wasPerfect = wasCorrect && moves.length > 0;

  const now = Math.floor(Date.now() / 1000);
  const progress = updateProgress(
    existingProgress,
    lineId,
    userId,
    wasCorrect,
    now
  );

  const xpEarned = wasPerfect ? XP_PERFECT : hasMistakes ? XP_MISTAKE : XP_CORRECT;

  const attempt: AttemptLog = {
    userId,
    lineId,
    timestamp: now,
    moves,
  };

  return NextResponse.json({ progress, xpEarned, attempt });
}

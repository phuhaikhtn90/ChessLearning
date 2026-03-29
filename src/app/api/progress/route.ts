import { NextRequest, NextResponse } from "next/server";
import italianGameLines from "@/data/openings/italian_game";
import { UserProgress } from "@/types";

/**
 * GET /api/progress
 * Query params:
 *   - progress: JSON-encoded Record<string, UserProgress>
 * Returns summary stats.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const progressParam = url.searchParams.get("progress");

  let progressMap: Record<string, UserProgress> = {};
  if (progressParam) {
    try {
      progressMap = JSON.parse(progressParam);
    } catch {
      // ignore
    }
  }

  const totalLines = italianGameLines.length;
  const seenLines = Object.keys(progressMap).length;
  const masteredLines = Object.values(progressMap).filter(
    (p) => p.successRate >= 0.8 && p.correctStreak >= 3
  ).length;

  const lines = italianGameLines.map((line) => ({
    id: line.id,
    name: line.name,
    trap: line.trap,
    difficulty: line.difficulty,
    progress: progressMap[line.id] ?? null,
  }));

  return NextResponse.json({
    totalLines,
    seenLines,
    masteredLines,
    lines,
  });
}

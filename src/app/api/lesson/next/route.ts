import { NextRequest, NextResponse } from "next/server";
import italianGameLines from "@/data/openings/italian_game";
import { selectNextLine } from "@/lib/contentSelection";
import { UserProgress } from "@/types";

/**
 * GET /api/lesson/next
 * Query params:
 *   - progress: JSON-encoded Record<string, UserProgress>
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const progressParam = url.searchParams.get("progress");

  let progressMap: Record<string, UserProgress> = {};
  if (progressParam) {
    try {
      progressMap = JSON.parse(progressParam);
    } catch {
      // ignore malformed progress
    }
  }

  const now = Math.floor(Date.now() / 1000);
  const next = selectNextLine(italianGameLines, progressMap, now);

  if (!next) {
    return NextResponse.json({ line: null }, { status: 200 });
  }

  return NextResponse.json({ line: next.line, isNew: next.isNew });
}

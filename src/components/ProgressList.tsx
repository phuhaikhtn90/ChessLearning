"use client";

import { UserProgress } from "@/types";
import italianGameLines from "@/data/openings/italian_game";

interface ProgressListProps {
  progressMap: Record<string, UserProgress>;
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80
      ? "bg-green-100 text-green-700"
      : pct >= 50
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {pct}%
    </span>
  );
}

export default function ProgressList({ progressMap }: ProgressListProps) {
  return (
    <div className="flex flex-col gap-2">
      {italianGameLines.map((line) => {
        const p = progressMap[line.id];
        return (
          <div
            key={line.id}
            className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                {line.trap && <span title="Có bẫy">🪤</span>}
                {line.name}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                Độ khó {line.difficulty}/4 · {line.moves.length} nước
              </span>
            </div>
            <div className="flex items-center gap-2">
              {p ? (
                <>
                  <ConfidenceBadge value={p.confidence} />
                  {p.correctStreak >= 3 && (
                    <span title="Streak!" className="text-base">🔥</span>
                  )}
                  {p.successRate >= 0.8 && p.correctStreak >= 3 && (
                    <span title="Mastered" className="text-base">⭐</span>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">Chưa học</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

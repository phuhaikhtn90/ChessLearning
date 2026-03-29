"use client";

import { DAILY_GOAL } from "@/lib/contentSelection";

interface DailyGoalCardProps {
  newDone: number;
  reviewDone: number;
  trapDone: number;
}

function GoalItem({
  emoji,
  label,
  done,
  total,
}: {
  emoji: string;
  label: string;
  done: number;
  total: number;
}) {
  const pct = Math.min(100, Math.round((done / total) * 100));
  const complete = done >= total;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-sm">
        <span>
          {emoji} {label}
        </span>
        <span className={complete ? "text-green-600 font-semibold" : "text-gray-500"}>
          {done}/{total} {complete ? "✓" : ""}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            complete ? "bg-green-400" : "bg-blue-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function DailyGoalCard({
  newDone,
  reviewDone,
  trapDone,
}: DailyGoalCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
        Mục tiêu hôm nay
      </h2>
      <div className="flex flex-col gap-3">
        <GoalItem
          emoji="🆕"
          label="Bài mới"
          done={newDone}
          total={DAILY_GOAL.newCount}
        />
        <GoalItem
          emoji="🔁"
          label="Ôn luyện"
          done={reviewDone}
          total={DAILY_GOAL.reviewCount}
        />
        <GoalItem
          emoji="🪤"
          label="Bẫy"
          done={trapDone}
          total={DAILY_GOAL.trapCount}
        />
      </div>
    </div>
  );
}

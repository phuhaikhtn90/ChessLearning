"use client";

import { UserStats } from "@/types";

interface XPBarProps {
  stats: UserStats;
}

export default function XPBar({ stats }: XPBarProps) {
  const currentLevelXP = stats.totalXP % 100;
  const pct = currentLevelXP;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-400 text-white font-bold text-sm shadow">
        {stats.level}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Level {stats.level}</span>
          <span>{currentLevelXP} / 100 XP</span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

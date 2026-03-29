"use client";

import { useEffect, useState, startTransition } from "react";
import ProgressList from "@/components/ProgressList";
import { loadProgressMap, loadUserStats } from "@/lib/progressTracker";
import { UserProgress, UserStats } from "@/types";
import XPBar from "@/components/XPBar";
import italianGameLines from "@/data/openings/italian_game";

export default function ProgressPage() {
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [stats, setStats] = useState<UserStats>({ totalXP: 0, level: 0, dailyStreak: 0 });

  useEffect(() => {
    startTransition(() => {
      setProgressMap(loadProgressMap());
      setStats(loadUserStats());
    });
  }, []);

  const seen = Object.keys(progressMap).length;
  const mastered = Object.values(progressMap).filter(
    (p) => p.successRate >= 0.8 && p.correctStreak >= 3
  ).length;
  const total = italianGameLines.length;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-gray-900">📊 Tiến độ học tập</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{seen}</div>
          <div className="text-xs text-gray-500 mt-1">Đã học</div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{mastered}</div>
          <div className="text-xs text-gray-500 mt-1">Thành thạo</div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-600">{total}</div>
          <div className="text-xs text-gray-500 mt-1">Tổng bài</div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <XPBar stats={stats} />
      </div>

      {/* Line list */}
      <div>
        <h2 className="text-sm font-semibold uppercase text-gray-500 tracking-wide mb-3">
          Danh sách khai cuộc
        </h2>
        <ProgressList progressMap={progressMap} />
      </div>
    </div>
  );
}

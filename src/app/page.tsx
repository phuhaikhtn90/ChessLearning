"use client";

import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import XPBar from "@/components/XPBar";
import DailyGoalCard from "@/components/DailyGoalCard";
import {
  loadUserStats,
  loadProgressMap,
  loadDailySession,
} from "@/lib/progressTracker";
import { UserStats, DailySession } from "@/types";

export default function HomePage() {
  const [stats, setStats] = useState<UserStats>({
    totalXP: 0,
    level: 0,
    dailyStreak: 0,
  });
  const [session, setSession] = useState<DailySession>({
    userId: "guest",
    date: "",
    items: [],
    completed: false,
  });

  useEffect(() => {
    startTransition(() => {
      setStats(loadUserStats());
      setSession(loadDailySession("guest"));
    });
  }, []);

  const progressMap = typeof window !== "undefined" ? loadProgressMap() : {};
  const totalMastered = Object.values(progressMap).filter(
    (p) => p.successRate >= 0.8 && p.correctStreak >= 3
  ).length;

  // Count daily goal completions
  const newDone = session.items.filter((i) => i.type === "new").length;
  const reviewDone = session.items.filter((i) => i.type === "review").length;
  const trapDone = session.items.filter((i) => i.type === "trap").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Xin chào! ♟</h1>
        <p className="text-blue-100 text-sm mb-4">
          Luyện tập khai cuộc cờ vua mỗi ngày để trở nên giỏi hơn.
        </p>
        <Link
          href="/practice"
          className="inline-block bg-white text-blue-700 font-semibold rounded-xl px-5 py-2.5 text-sm hover:bg-blue-50 transition-colors shadow"
        >
          Bắt đầu luyện tập →
        </Link>
      </div>

      {/* XP Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
          Điểm kinh nghiệm
        </h2>
        <XPBar stats={stats} />
        <div className="mt-3 text-xs text-gray-500 text-center">
          ⭐ Đã thành thạo {totalMastered} / 20 khai cuộc
        </div>
      </div>

      {/* Daily Goal */}
      <DailyGoalCard
        newDone={newDone}
        reviewDone={reviewDone}
        trapDone={trapDone}
      />

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/practice"
          className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center hover:bg-blue-100 transition-colors"
        >
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-sm font-semibold text-blue-800">Luyện tập</div>
          <div className="text-xs text-blue-600 mt-0.5">Thực hành khai cuộc</div>
        </Link>
        <Link
          href="/progress"
          className="rounded-2xl border border-purple-200 bg-purple-50 p-4 text-center hover:bg-purple-100 transition-colors"
        >
          <div className="text-2xl mb-1">📊</div>
          <div className="text-sm font-semibold text-purple-800">Tiến độ</div>
          <div className="text-xs text-purple-600 mt-0.5">Xem kết quả học tập</div>
        </Link>
      </div>

      {/* Tips */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
        <h3 className="font-semibold text-amber-800 text-sm mb-2">💡 Mẹo hôm nay</h3>
        <p className="text-amber-700 text-sm">
          Tập trung vào <strong>Italian Game</strong> – một trong những khai cuộc
          phổ biến nhất dành cho người mới bắt đầu.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import dynamic from "next/dynamic";
import { OpeningLine, UserProgress, UserStats, AttemptLog } from "@/types";
import italianGameLines from "@/data/openings/italian_game";
import { selectNextLine } from "@/lib/contentSelection";
import {
  loadProgressMap,
  loadUserStats,
  saveLineProgress,
  saveUserStats,
  saveAttempt,
  loadDailySession,
  saveDailySession,
  addXP,
  XP_CORRECT,
  XP_MISTAKE,
  XP_PERFECT,
} from "@/lib/progressTracker";
import { updateProgress } from "@/lib/spacedRepetition";
import XPBar from "@/components/XPBar";

// Dynamically import chess board to avoid SSR issues
const ChessBoardPractice = dynamic(
  () => import("@/components/ChessBoardPractice"),
  { ssr: false, loading: () => <div className="w-full max-w-[480px] aspect-square bg-gray-200 rounded-2xl animate-pulse" /> }
);

interface PracticeMove {
  ply: number;
  userMove: string;
  isCorrect: boolean;
}

export default function PracticePage() {
  const [currentLine, setCurrentLine] = useState<OpeningLine | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [stats, setStats] = useState<UserStats>({ totalXP: 0, level: 0, dailyStreak: 0 });
  const [isNew, setIsNew] = useState(false);
  const [lineKey, setLineKey] = useState(0); // force remount on new line
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  // Load data on mount
  useEffect(() => {
    startTransition(() => {
      const map = loadProgressMap();
      const s = loadUserStats();
      setProgressMap(map);
      setStats(s);
      const now = Math.floor(Date.now() / 1000);
      const next = selectNextLine(italianGameLines, map, now);
      if (next) {
        setCurrentLine(next.line);
        setIsNew(next.isNew);
      }
    });
  }, []);

  const handleComplete = useCallback(
    (moves: PracticeMove[], perfect: boolean) => {
      if (!currentLine) return;

      const hasMistakes = moves.some((m) => !m.isCorrect);
      const now = Math.floor(Date.now() / 1000);
      const existingProgress = progressMap[currentLine.id] ?? null;

      // Update progress
      const newProgress = updateProgress(
        existingProgress,
        currentLine.id,
        "guest",
        !hasMistakes,
        now
      );
      saveLineProgress(newProgress);
      const newMap = { ...progressMap, [currentLine.id]: newProgress };
      setProgressMap(newMap);

      // Update XP
      const xp = perfect ? XP_PERFECT : hasMistakes ? XP_MISTAKE : XP_CORRECT;
      setXpEarned(xp);
      const newStats = addXP(stats, perfect, hasMistakes);
      saveUserStats(newStats);
      setStats(newStats);

      // Save attempt log
      const attempt: AttemptLog = {
        userId: "guest",
        lineId: currentLine.id,
        timestamp: now,
        moves: moves.map((m) => ({
          ply: m.ply,
          userMove: m.userMove,
          isCorrect: m.isCorrect,
        })),
      };
      saveAttempt(attempt);

      // Update daily session
      const session = loadDailySession("guest");
      const itemType = currentLine.trap
        ? "trap"
        : isNew
        ? "new"
        : "review";
      session.items.push({ lineId: currentLine.id, type: itemType });
      saveDailySession(session);
    },
    [currentLine, progressMap, stats, isNew]
  );

  const handleNextLine = useCallback(() => {
    setXpEarned(null);
    const map = loadProgressMap();
    const now = Math.floor(Date.now() / 1000);
    const next = selectNextLine(italianGameLines, map, now);
    if (next) {
      setCurrentLine(next.line);
      setIsNew(next.isNew);
      setLineKey((k) => k + 1);
    }
  }, []);

  if (!currentLine) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">🎉</div>
        <p className="font-semibold text-lg">Bạn đã hoàn thành tất cả bài hôm nay!</p>
        <p className="text-sm mt-2">Quay lại sau để ôn luyện tiếp.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          {currentLine.trap && (
            <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
              🪤 Bẫy
            </span>
          )}
          {isNew && (
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
              🆕 Bài mới
            </span>
          )}
          <span className="text-xs text-gray-400">
            Độ khó {currentLine.difficulty}/4
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{currentLine.name}</h1>
        <p className="text-sm text-gray-500">{currentLine.opening}</p>
      </div>

      {/* XP earned notification */}
      {xpEarned !== null && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between">
          <span className="text-amber-700 text-sm font-medium">
            +{xpEarned} XP kiếm được!
          </span>
          <button
            onClick={handleNextLine}
            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg px-4 py-1.5 transition-colors"
          >
            Bài tiếp →
          </button>
        </div>
      )}

      {/* Chess board */}
      <ChessBoardPractice
        key={lineKey}
        line={currentLine}
        onComplete={handleComplete}
        correctStreak={progressMap[currentLine.id]?.correctStreak ?? 0}
      />

      {/* XP bar at bottom */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <XPBar stats={stats} />
      </div>

      {/* Line info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wide mb-2">
          Thông tin khai cuộc
        </h3>
        <div className="flex flex-wrap gap-1">
          {currentLine.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        {progressMap[currentLine.id] && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="font-semibold text-gray-800">
                {Math.round((progressMap[currentLine.id].successRate ?? 0) * 100)}%
              </div>
              <div className="text-gray-500">Tỉ lệ đúng</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="font-semibold text-gray-800">
                {progressMap[currentLine.id].mistakeCount}
              </div>
              <div className="text-gray-500">Sai lầm</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="font-semibold text-gray-800">
                {progressMap[currentLine.id].correctStreak}🔥
              </div>
              <div className="text-gray-500">Streak</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

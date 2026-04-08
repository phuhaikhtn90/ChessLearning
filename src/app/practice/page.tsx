"use client";

import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
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
import { buildLessonSegments, LessonSegment } from "@/lib/lessonFlow";
import XPBar from "@/components/XPBar";
import BranchExplorer from "@/components/BranchExplorer";

// Dynamically import chess board to avoid SSR issues
const ChessBoardPractice = dynamic(
  () => import("@/components/ChessBoardPractice"),
  { ssr: false, loading: () => <div className="w-full max-w-[420px] aspect-square bg-gray-200 rounded-2xl animate-pulse" /> }
);

interface PracticeMove {
  ply: number;
  userMove: string;
  isCorrect: boolean;
  segmentId?: string;
  segmentTitle?: string;
}

export default function PracticePage() {
  const [currentLine, setCurrentLine] = useState<OpeningLine | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [stats, setStats] = useState<UserStats>({ totalXP: 0, level: 0, dailyStreak: 0 });
  const [isNew, setIsNew] = useState(false);
  const [lineKey, setLineKey] = useState(0); // force remount on new line / mode change
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [lessonMoves, setLessonMoves] = useState<PracticeMove[]>([]);
  const [lessonHadMistake, setLessonHadMistake] = useState(false);
  const [adHocSegment, setAdHocSegment] = useState<LessonSegment | null>(null);

  const lessonSegments = useMemo(
    () => (currentLine ? buildLessonSegments(currentLine) : []),
    [currentLine]
  );
  const currentSegment = lessonSegments[segmentIndex] ?? null;
  const activeSegment = adHocSegment ?? currentSegment;
  const isFinalSegment = lessonSegments.length > 0 && segmentIndex === lessonSegments.length - 1;
  const isVariationPracticeSegment =
    activeSegment?.mode === "practice" &&
    (activeSegment.segmentType === "variation" || activeSegment.segmentType === "group_review");

  const resetLessonState = useCallback(() => {
    setSegmentIndex(0);
    setLineKey((k) => k + 1);
    setLessonMoves([]);
    setLessonHadMistake(false);
    setXpEarned(null);
    setAdHocSegment(null);
  }, []);

  // Load data on mount
  useEffect(() => {
    startTransition(() => {
      const map = loadProgressMap();
      const s = loadUserStats();
      setProgressMap(map);
      setStats(s);
      const now = Math.floor(Date.now() / 1000);
      const requestedLineId =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("lineId")
          : null;
      if (requestedLineId) {
        const requestedLine = italianGameLines.find((line) => line.id === requestedLineId) ?? null;
        if (requestedLine) {
          setCurrentLine(requestedLine);
          setIsNew(!map[requestedLine.id]);
          setSegmentIndex(0);
          return;
        }
      }
      const next = selectNextLine(italianGameLines, map, now);
      if (next) {
        setCurrentLine(next.line);
        setIsNew(next.isNew);
        setSegmentIndex(0);
      }
    });
  }, []);

  const handleTutorialComplete = useCallback(() => {
    setAdHocSegment(null);
    setSegmentIndex((index) => index + 1);
    setLineKey((k) => k + 1);
  }, []);

  const persistLessonResult = useCallback(
    (moves: PracticeMove[], hadMistakes: boolean, perfect: boolean) => {
      if (!currentLine) return;

      const now = Math.floor(Date.now() / 1000);
      const existingProgress = progressMap[currentLine.id] ?? null;

      const newProgress = updateProgress(
        existingProgress,
        currentLine.id,
        "guest",
        !hadMistakes,
        now
      );
      saveLineProgress(newProgress);
      const newMap = { ...progressMap, [currentLine.id]: newProgress };
      setProgressMap(newMap);

      const xp = perfect ? XP_PERFECT : hadMistakes ? XP_MISTAKE : XP_CORRECT;
      setXpEarned(xp);
      const newStats = addXP(stats, perfect, hadMistakes);
      saveUserStats(newStats);
      setStats(newStats);

      const attempt: AttemptLog = {
        userId: "guest",
        lineId: currentLine.id,
        timestamp: now,
        moves: moves.map((m) => ({
          ply: m.ply,
          userMove: m.userMove,
          isCorrect: m.isCorrect,
          segmentId: m.segmentId,
          segmentTitle: m.segmentTitle,
        })),
      };
      saveAttempt(attempt);

      const session = loadDailySession("guest");
      const itemType = currentLine.trap ? "trap" : isNew ? "new" : "review";
      session.items.push({ lineId: currentLine.id, type: itemType });
      saveDailySession(session);
    },
    [currentLine, isNew, progressMap, stats]
  );

  // ─── Practice completed ───────────────────────────────────────────────────────
  const handleComplete = useCallback(
    (moves: PracticeMove[], perfect: boolean) => {
      if (adHocSegment) {
        return;
      }

      const hasMistakes = moves.some((m) => !m.isCorrect);
      const annotatedMoves = moves.map((move) => ({
        ...move,
        segmentId: currentSegment?.id,
        segmentTitle: currentSegment?.title,
      }));
      const allMoves = [...lessonMoves, ...annotatedMoves];
      const overallHadMistake = lessonHadMistake || hasMistakes;

      setLessonMoves(allMoves);
      setLessonHadMistake(overallHadMistake);

      if (isFinalSegment) {
        persistLessonResult(allMoves, overallHadMistake, perfect && !overallHadMistake);
      }
    },
    [
      adHocSegment,
      currentSegment?.id,
      currentSegment?.title,
      isFinalSegment,
      lessonHadMistake,
      lessonMoves,
      persistLessonResult,
    ]
  );

  // ─── Next segment / lesson ────────────────────────────────────────────────────
  const handleNextSegment = useCallback(() => {
    if (isFinalSegment) {
      setXpEarned(null);
      const map = loadProgressMap();
      const now = Math.floor(Date.now() / 1000);
      const next = selectNextLine(italianGameLines, map, now);
      if (next) {
        setCurrentLine(next.line);
        setIsNew(next.isNew);
      } else {
        setCurrentLine(null);
      }
      resetLessonState();
      return;
    }

    setAdHocSegment(null);
    setSegmentIndex((index) => index + 1);
    setLineKey((k) => k + 1);
  }, [isFinalSegment, resetLessonState]);

  const handleNextLine = useCallback(() => {
    handleNextSegment();
  }, [handleNextSegment]);

  const handleVariationReplay = useCallback(() => {
    const replayPool = lessonSegments.filter((segment, index) => {
      if (index > segmentIndex || segment.mode !== "practice") return false;
      if (segment.segmentType !== "variation") return false;

      if (activeSegment?.segmentType === "group_review" && activeSegment.variationGroupId) {
        return segment.variationGroupId === activeSegment.variationGroupId;
      }

      return true;
    });

    if (replayPool.length === 0) return;

    const randomSegment = replayPool[Math.floor(Math.random() * replayPool.length)];
    setAdHocSegment({
      ...randomSegment,
      id: `${randomSegment.id}__mixed_replay__${Date.now()}`,
      title:
        activeSegment?.segmentType === "group_review" && activeSegment.title
          ? activeSegment.title
          : `Ôn hỗn hợp: ${randomSegment.line.name}`,
      summary: "Hệ thống sẽ chọn ngẫu nhiên một biến thể đã học để bé tự nhớ lại không cần báo trước.",
      nextActionLabel: "Tập luyện lại",
    });
    setLineKey((key) => key + 1);
  }, [activeSegment, lessonSegments, segmentIndex]);

  const handleSelectBranch = useCallback(
    ({ groupId, variationId }: { groupId: string; variationId?: string }) => {
      const targetIndex = lessonSegments.findIndex((segment) => {
        if (variationId) {
          return segment.variationId === variationId;
        }

        return (
          segment.variationGroupId === groupId &&
          (segment.segmentType === "variation" || segment.segmentType === "group_review")
        );
      });

      if (targetIndex === -1) return;

      setAdHocSegment(null);
      setXpEarned(null);
      setSegmentIndex(targetIndex);
      setLineKey((key) => key + 1);
    },
    [lessonSegments]
  );

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
      {/* ── Header ── */}
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
          <span className="text-xs text-gray-400">Độ khó {currentLine.difficulty}/4</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{currentLine.name}</h1>
        {currentLine.guide?.summary && (
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{currentLine.guide.summary}</p>
        )}
        <p className="text-sm text-gray-500">{currentLine.opening}</p>
      </div>

      {activeSegment?.mode === "tutorial" &&
        activeSegment.segmentType === "variation" &&
        activeSegment.title && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-800">{activeSegment.title}</p>
          </div>
        )}

      {/* ── Practice phase label ── */}
      {activeSegment?.mode === "practice" && (
        <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-sm font-semibold text-sky-800">
              {activeSegment.shortLabel === "Đánh lại"
                ? "Tự đánh lại để ghi nhớ"
                : `Tự đánh lại ${activeSegment.title}`}
            </p>
            {(activeSegment.summary ?? activeSegment.description) && (
              <p className="text-xs text-sky-700 mt-0.5">
                {activeSegment.summary ?? activeSegment.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── XP earned notification ── */}
      {xpEarned !== null && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between">
          <span className="text-amber-700 text-sm font-medium">+{xpEarned} XP kiếm được!</span>
          {isFinalSegment && (
            <button
              onClick={handleNextLine}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg px-4 py-1.5 transition-colors"
            >
              Bài tiếp →
            </button>
          )}
        </div>
      )}

      {currentLine.bookContent?.length ? (
        <BranchExplorer line={currentLine} onSelectBranch={handleSelectBranch} />
      ) : null}

      {/* ── Chess board ── */}
      {activeSegment && (
        <ChessBoardPractice
          key={lineKey}
          line={activeSegment.line}
          onComplete={handleComplete}
          onNextLine={handleNextLine}
          correctStreak={progressMap[currentLine.id]?.correctStreak ?? 0}
          mode={activeSegment.mode}
          onTutorialComplete={handleTutorialComplete}
          nextActionLabel={activeSegment.nextActionLabel}
          narrationText={activeSegment.narrationText}
          onReplayLine={isVariationPracticeSegment ? handleVariationReplay : undefined}
          replayActionLabel={isVariationPracticeSegment ? "Luyện tập lại" : undefined}
          secondaryActionLabel={
            isVariationPracticeSegment
              ? isFinalSegment
                ? "Hoàn thành bài học"
                : "Biến thể khác"
              : undefined
          }
        />
      )}

      {/* ── XP bar ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <XPBar stats={stats} />
      </div>

      {/* ── Line info ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wide mb-2">
          Thông tin khai cuộc
        </h3>
        <div className="flex flex-wrap gap-1">
          {currentLine.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
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

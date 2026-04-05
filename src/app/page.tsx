"use client";

import { useEffect, useMemo, useState, startTransition } from "react";
import Link from "next/link";
import italianGameLines from "@/data/openings/italian_game";
import { sortLinesByRecommendation } from "@/lib/contentSelection";
import {
  loadPlayerGoal,
  loadProgressMap,
  savePlayerGoal,
} from "@/lib/progressTracker";
import { OpeningLine, UserProgress } from "@/types";

function getLineProgress(progress?: UserProgress) {
  if (!progress) {
    return {
      label: "Chưa học",
      tone: "bg-slate-100 text-slate-600",
      mastery: 0,
    };
  }

  if (progress.successRate >= 0.8 && progress.correctStreak >= 3) {
    return {
      label: "Đã vững",
      tone: "bg-green-100 text-green-700",
      mastery: 100,
    };
  }

  if (progress.successRate >= 0.5) {
    return {
      label: "Đang nhớ dần",
      tone: "bg-amber-100 text-amber-700",
      mastery: Math.round(progress.successRate * 100),
    };
  }

  return {
    label: "Đang học",
    tone: "bg-rose-100 text-rose-700",
    mastery: Math.round(progress.successRate * 100),
  };
}

function getFamilySummary(lines: OpeningLine[], progressMap: Record<string, UserProgress>) {
  const learned = lines.filter((line) => progressMap[line.id]).length;
  const mastered = lines.filter((line) => {
    const progress = progressMap[line.id];
    return progress && progress.successRate >= 0.8 && progress.correctStreak >= 3;
  }).length;

  return { learned, mastered, total: lines.length };
}

export default function HomePage() {
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [goalDraft, setGoalDraft] = useState("");
  const [goalSaved, setGoalSaved] = useState(false);
  const [expandedFamilies, setExpandedFamilies] = useState<Record<string, boolean>>({
    "Italian Game": true,
  });

  useEffect(() => {
    startTransition(() => {
      setProgressMap(loadProgressMap());
      setGoalDraft(loadPlayerGoal());
    });
  }, []);

  const rankedLines = useMemo(() => sortLinesByRecommendation(italianGameLines), []);
  const rankingMap = useMemo(
    () => new Map(rankedLines.map((line, index) => [line.id, index + 1])),
    [rankedLines]
  );

  const openingFamilies = useMemo(() => {
    const groups = new Map<string, OpeningLine[]>();

    for (const line of rankedLines) {
      const existing = groups.get(line.opening) ?? [];
      existing.push(line);
      groups.set(line.opening, existing);
    }

    return Array.from(groups.entries()).map(([opening, lines]) => ({
      opening,
      lines,
      summary: getFamilySummary(lines, progressMap),
    }));
  }, [progressMap, rankedLines]);

  const topRecommendation = rankedLines[0] ?? null;

  const handleSaveGoal = () => {
    savePlayerGoal(goalDraft.trim());
    setGoalSaved(true);
    window.setTimeout(() => setGoalSaved(false), 1800);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[28px] bg-gradient-to-br from-sky-700 via-cyan-700 to-emerald-600 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
          Happy Kick
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight">Xin chào Kick</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-cyan-50">
          Mỗi ngày học một chút, nhớ một nhánh cờ thật chắc, rồi từng bước biến khai cuộc
          thành phản xạ tự nhiên.
        </p>

        {topRecommendation && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={`/practice?lineId=${topRecommendation.id}`}
              className="inline-flex items-center rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-sky-800 shadow transition-colors hover:bg-sky-50"
            >
              Học bài được khuyến nghị →
            </Link>
            <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
              Gợi ý lúc này: {topRecommendation.name}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Mục tiêu của Kick
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Ghi một mục tiêu ngắn để mỗi lần mở app bé nhớ mình đang cố gắng vì điều gì.
            </p>
          </div>
          {goalSaved && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Đã lưu
            </span>
          )}
        </div>

        <textarea
          value={goalDraft}
          onChange={(e) => setGoalDraft(e.target.value)}
          placeholder="Ví dụ: Con muốn nhớ thật chắc Italian chậm để vào trung cuộc tự tin hơn."
          className="mt-4 min-h-28 w-full rounded-2xl border border-emerald-200 bg-emerald-50/40 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Mục tiêu ngắn, rõ ràng sẽ giúp bé có động lực quay lại mỗi ngày.
          </p>
          <button
            onClick={handleSaveGoal}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            Lưu mục tiêu
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Danh sách khai cuộc chính
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Mở từng nhóm khai cuộc để xem các nhánh con, tiến độ và chọn đúng bài bé muốn học.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {openingFamilies.map((family) => {
            const isExpanded = expandedFamilies[family.opening] ?? false;
            return (
            <div
              key={family.opening}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedFamilies((current) => ({
                    ...current,
                    [family.opening]: !isExpanded,
                  }))
                }
                className="w-full cursor-pointer px-4 py-4 text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{family.opening}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Đã học {family.summary.learned}/{family.summary.total} nhánh · Đã vững{" "}
                      {family.summary.mastered} nhánh
                    </p>
                  </div>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                    {isExpanded ? "Đóng danh sách" : "Mở danh sách"}
                  </span>
                </div>
              </button>

              {isExpanded && (
              <div className="border-t border-slate-200 bg-white px-4 py-4">
                <div className="flex flex-col gap-3">
                  {family.lines.map((line) => {
                    const progress = progressMap[line.id];
                    const progressInfo = getLineProgress(progress);
                    const isRecommended = Boolean(line.bookCoverage?.isBookAligned);
                    return (
                      <div
                        key={line.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                                #{rankingMap.get(line.id)}
                              </span>
                              <h4 className="text-sm font-semibold text-slate-900">{line.name}</h4>
                              {isRecommended && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                  Nên học
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              Độ khó {line.difficulty}/4 · {line.moves.length} nước mẫu
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${progressInfo.tone}`}>
                            {progressInfo.label}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-sky-500 transition-all"
                              style={{ width: `${progressInfo.mastery}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-500">
                            {progressInfo.mastery}%
                          </span>
                        </div>

                        <div className="mt-3 flex justify-end">
                          <Link
                            href={`/practice?lineId=${line.id}`}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                              isRecommended
                                ? "bg-sky-600 text-white hover:bg-sky-700"
                                : "border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                            }`}
                          >
                            Học ngay
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}

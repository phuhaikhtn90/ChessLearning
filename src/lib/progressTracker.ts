"use client";

import { UserProgress, UserStats, AttemptLog, DailySession } from "@/types";

const PROGRESS_KEY = "chess_progress";
const STATS_KEY = "chess_stats";
const SESSION_KEY = "chess_session";
const ATTEMPTS_KEY = "chess_attempts";
const GOAL_KEY = "chess_player_goal";

// ─── UserProgress ─────────────────────────────────────────────────────────────

export function loadProgressMap(): Record<string, UserProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgressMap(map: Record<string, UserProgress>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
}

export function saveLineProgress(progress: UserProgress): void {
  const map = loadProgressMap();
  map[progress.lineId] = progress;
  saveProgressMap(map);
}

// ─── UserStats ────────────────────────────────────────────────────────────────

export const XP_CORRECT = 10;
export const XP_MISTAKE = 2;
export const XP_PERFECT = 20;

export function loadUserStats(): UserStats {
  if (typeof window === "undefined")
    return { totalXP: 0, level: 0, dailyStreak: 0 };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw
      ? JSON.parse(raw)
      : { totalXP: 0, level: 0, dailyStreak: 0 };
  } catch {
    return { totalXP: 0, level: 0, dailyStreak: 0 };
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function addXP(
  stats: UserStats,
  wasPerfect: boolean,
  hadMistakes: boolean
): UserStats {
  const earned = wasPerfect ? XP_PERFECT : hadMistakes ? XP_MISTAKE : XP_CORRECT;
  const totalXP = stats.totalXP + earned;
  const level = Math.floor(totalXP / 100);
  return { ...stats, totalXP, level };
}

// ─── Daily Session ─────────────────────────────────────────────────────────────

function todayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function loadDailySession(userId: string): DailySession {
  if (typeof window === "undefined")
    return { userId, date: todayDate(), items: [], completed: false };
  try {
    const raw = localStorage.getItem(`${SESSION_KEY}_${userId}`);
    if (!raw)
      return { userId, date: todayDate(), items: [], completed: false };
    const session: DailySession = JSON.parse(raw);
    // Reset if date changed
    if (session.date !== todayDate()) {
      return { userId, date: todayDate(), items: [], completed: false };
    }
    return session;
  } catch {
    return { userId, date: todayDate(), items: [], completed: false };
  }
}

export function saveDailySession(session: DailySession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `${SESSION_KEY}_${session.userId}`,
    JSON.stringify(session)
  );
}

// ─── Attempt Log ─────────────────────────────────────────────────────────────

export function loadAttempts(): AttemptLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: AttemptLog): void {
  const attempts = loadAttempts();
  attempts.push(attempt);
  // Keep only last 200 attempts to avoid excessive storage
  const trimmed = attempts.slice(-200);
  if (typeof window !== "undefined") {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(trimmed));
  }
}

// ─── Player Goal ──────────────────────────────────────────────────────────────

export function loadPlayerGoal(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(GOAL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function savePlayerGoal(goal: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GOAL_KEY, goal);
}

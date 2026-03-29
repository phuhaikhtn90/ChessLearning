// ─── Opening Line ────────────────────────────────────────────────────────────

export interface MoveNode {
  ply: number;
  side: "w" | "b";
  move?: string;
  validMoves: string[];
  tags?: string[];
  explain?: string;
  isTrapOpportunity?: boolean;
  next?: string[];
}

export interface OpeningLine {
  id: string;
  name: string;
  opening: string;
  fenStart: string;
  moves: MoveNode[];
  nodes?: Record<string, MoveNode>;
  difficulty: number;
  tags: string[];
  trap: boolean;
}

// ─── User Progress ────────────────────────────────────────────────────────────

export interface UserProgress {
  userId: string;
  lineId: string;
  successRate: number;
  mistakeCount: number;
  correctStreak: number;
  lastSeen: number;
  nextDue: number;
  confidence: number;
}

// ─── Attempt Log ─────────────────────────────────────────────────────────────

export interface AttemptMove {
  ply: number;
  userMove: string;
  isCorrect: boolean;
  evalBefore?: number;
  evalAfter?: number;
  delta?: number;
}

export interface AttemptLog {
  userId: string;
  lineId: string;
  timestamp: number;
  moves: AttemptMove[];
}

// ─── Daily Session ────────────────────────────────────────────────────────────

export interface SessionItem {
  lineId: string;
  type: "new" | "review" | "trap";
}

export interface DailySession {
  userId: string;
  date: string;
  items: SessionItem[];
  completed: boolean;
}

// ─── XP / Level ──────────────────────────────────────────────────────────────

export interface UserStats {
  totalXP: number;
  level: number;
  dailyStreak: number;
}

// ─── Mistake Classification ───────────────────────────────────────────────────

export type MistakeType = "inaccuracy" | "mistake" | "blunder";

// ─── Content selection score ──────────────────────────────────────────────────

export interface ScoredLine {
  line: OpeningLine;
  score: number;
  isNew: boolean;
}

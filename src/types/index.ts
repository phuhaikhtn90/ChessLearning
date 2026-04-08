// ─── Opening Line ────────────────────────────────────────────────────────────

export interface MoveNode {
  ply: number;
  side: "w" | "b";
  move?: string;
  validMoves: string[];
  tags?: string[];
  explain?: string;
  moveEval?: string;
  posEval?: string;
  isTrapOpportunity?: boolean;
  next?: string[];
}

export interface LessonOutcome {
  type: "middlegame" | "advantage";
  eval?: number;
  summary: string;
}

export interface OpeningVariation {
  id: string;
  name: string;
  description: string;
  startingPly: number;
  reviewPlies?: number;
  moves: MoveNode[];
  outcome: LessonOutcome;
  subVariations?: OpeningVariation[];
}

export interface VariationGroup {
  id: string;
  title: string;
  intro: string;
  variations: OpeningVariation[];
}

export interface OpeningGuideData {
  title: string;
  summary: string;
}

export interface BookReference {
  bookId: string;
  title: string;
  page?: number;
  note?: string;
}

export interface BookCoverage {
  isBookAligned: boolean;
  priority: number;
  references: BookReference[];
  summary: string;
}

export interface StrategicMotif {
  id: string;
  title: string;
  triggerPly: number;
  description: string;
  plans: string[];
  highlightSquares?: string[];
}

export interface PawnStructureInsight {
  id: string;
  title: string;
  triggerPly: number;
  description: string;
  highlightSquares: string[];
  dimBoard?: boolean;
  plans?: string[];
}

export interface CommonBlunder {
  id: string;
  title: string;
  description: string;
  triggerModes: Array<"wrong_move" | "warning_button">;
  targetPly?: number;
  wrongMoves?: string[];
  punishmentLine?: string[];
  refutation?: {
    blunderMove?: string;
    continuation: string[];
    summary?: string;
    finalEval?: number;
  };
  severity?: "mistake" | "blunder";
}

export interface PieceJourney {
  id: string;
  title: string;
  description: string;
  trigger: "hover_piece";
  originSquare: string;
  path: string[];
  recommendedPly?: number;
}

export interface OpeningLine {
  id: string;
  name: string;
  opening: string;
  fenStart: string;
  preferredLearnerSide?: "w" | "b";
  bookContent?: BookContentNode[];
  moves: MoveNode[];
  nodes?: Record<string, MoveNode>;
  guide?: OpeningGuideData;
  bookCoverage?: BookCoverage;
  outcome?: LessonOutcome;
  strategicMotifs?: StrategicMotif[];
  pawnStructures?: PawnStructureInsight[];
  commonBlunders?: CommonBlunder[];
  pieceJourneys?: PieceJourney[];
  variationGroups?: VariationGroup[];
  difficulty: number;
  tags: string[];
  trap: boolean;
  bookId?: string;
  bookTitle?: string;
  chapterNumber?: number;
}

export interface BookMove {
  ply: number;
  side: "w" | "b";
  move: string;
  moveEval?: string;
  posEval?: string;
  explain?: string;
}

export interface BookFlowTextNode {
  type: "text";
  content: string;
}

export interface BookFlowMoveNode {
  type: "move";
  notation: string;
  side: "w" | "b";
  moveEval?: string;
  posEval?: string;
}

export interface BookFlowVariationNode {
  type: "variation";
  id: string;
  title: string;
  flow: BookContentNode[];
}

export interface BookFlowVariationGroupNode {
  type: "variation_group";
  title: string;
  flow: BookContentNode[];
}

export type BookContentNode =
  | BookFlowTextNode
  | BookFlowMoveNode
  | BookFlowVariationNode
  | BookFlowVariationGroupNode;

export interface BookSubVariation {
  id: string;
  name: string;
  moves: BookMove[];
}

export interface BookVariation {
  id: string;
  name: string;
  moves: BookMove[];
  subVariations?: BookSubVariation[];
}

export interface BookVariationGroup {
  id: string;
  title: string;
  intro: string;
  moves?: BookMove[];
  variations?: BookVariation[];
}

export interface BookChapter {
  id: string;
  name: string;
  opening: string;
  fenStart: string;
  summary: string;
  content: BookContentNode[];
}

export interface OpeningBook {
  id: string;
  slug: string;
  title: string;
  description?: string;
  chapters: BookChapter[];
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
  segmentId?: string;
  segmentTitle?: string;
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

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Chessboard, PieceHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import type { Arrow } from "react-chessboard";
import { Chess, Move, Square } from "chess.js";
import { CommonBlunder, OpeningLine, MoveNode } from "@/types";
import { isCorrectMove } from "@/lib/moveValidation";
import {
  getMoveFeedback,
  getPreviewExplanation,
  getRewardMessage,
  MoveFeedback,
} from "@/lib/explanationEngine";

interface PracticeMove {
  ply: number;
  userMove: string;
  isCorrect: boolean;
}

interface ChessBoardPracticeProps {
  line: OpeningLine;
  onComplete: (moves: PracticeMove[], perfect: boolean) => void;
  onNextLine?: () => void;
  onReplayLine?: () => void;
  nextActionLabel?: string;
  replayActionLabel?: string;
  secondaryActionLabel?: string;
  correctStreak?: number;
  /** "tutorial" = guided demo (player plays both sides following arrows), "practice" = normal practice */
  mode?: "tutorial" | "practice";
  onTutorialComplete?: () => void;
}

type GamePhase = "playing" | "opponent" | "completed";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const OPPONENT_MOVE_DELAY_MS = 2000;
const MAIN_BOARD_WIDTH_CLASS = "max-w-[420px]";
const BLUNDER_BOARD_WIDTH_CLASS = "max-w-[240px]";
const BOARD_SQUARES = Array.from({ length: 8 }, (_, rankOffset) =>
  Array.from({ length: 8 }, (_, fileOffset) => {
    const file = String.fromCharCode("a".charCodeAt(0) + fileOffset);
    const rank = 8 - rankOffset;
    return `${file}${rank}`;
  })
).flat();

// TODO(next-ui):
// - Add a mini coach timeline / move recap rail so each mistake is tied to the larger opening plan.
// - Highlight the actual piece silhouettes, not only squares, for pawn structure and piece journey moments.
// - Animate piece journeys step-by-step on the board instead of drawing the full route at once.
// - Surface common blunders inline beside the exact move bubble or progress marker that triggered them.

/** Convert a SAN move to an Arrow object using the current chess instance */
function sanToArrow(chess: Chess, san: string): Arrow | null {
  const moves = chess.moves({ verbose: true });
  const found = moves.find((m) => m.san === san);
  if (!found) return null;
  return { startSquare: found.from, endSquare: found.to, color: "#10b981" };
}

function buildJourneyArrows(originSquare: string, path: string[]): Arrow[] {
  const arrows: Arrow[] = [];
  let from = originSquare;

  for (const to of path) {
    arrows.push({
      startSquare: from,
      endSquare: to,
      color: "rgba(245, 158, 11, 0.45)",
    });
    from = to;
  }

  return arrows;
}

function dedupeArrows(arrows: Arrow[]): Arrow[] {
  const arrowMap = new Map<string, Arrow>();

  for (const arrow of arrows) {
    arrowMap.set(`${arrow.startSquare}-${arrow.endSquare}`, arrow);
  }

  return Array.from(arrowMap.values());
}

function describeSquaresAsPieces(squares: string[]): string {
  if (squares.length === 0) return "";
  if (squares.length === 1) return `tốt ${squares[0]}`;
  return `${squares.slice(0, -1).map((square) => `tốt ${square}`).join(", ")} và tốt ${
    squares[squares.length - 1]
  }`;
}

function formatJourneySquares(originSquare: string, path: string[]): string {
  return [originSquare, ...path].join(" → ");
}

function getOverlayPosition(square: string, orientation: "white" | "black") {
  const fileIndex = square.charCodeAt(0) - "a".charCodeAt(0);
  const rankIndex = Number(square[1]) - 1;
  const leftIndex = orientation === "white" ? fileIndex : 7 - fileIndex;
  const topIndex = orientation === "white" ? 7 - rankIndex : rankIndex;

  return {
    left: `calc(${leftIndex * 12.5}% + 6.25%)`,
    top: `calc(${topIndex * 12.5}% + 6.25%)`,
  };
}

interface BlunderPreviewData {
  startFen: string;
  sequence: string[];
  blunderSquare: string | null;
  summary: string;
  finalEval?: number;
}

function buildBlunderPreview(line: OpeningLine, blunder: CommonBlunder): BlunderPreviewData | null {
  const previewMoves = line.moves
    .filter((move) => !blunder.targetPly || move.ply < blunder.targetPly)
    .map((move) => move.validMoves[0])
    .filter(Boolean);

  const chess = new Chess();
  for (const san of previewMoves) {
    try {
      chess.move(san);
    } catch {
      return null;
    }
  }

  const blunderMove = blunder.refutation?.blunderMove ?? blunder.wrongMoves?.[0];
  if (!blunderMove) return null;

  const verboseBlunder = chess.moves({ verbose: true }).find((move) => move.san === blunderMove);
  if (!verboseBlunder) return null;

  const continuation = blunder.refutation?.continuation ?? blunder.punishmentLine ?? [];

  return {
    startFen: chess.fen(),
    sequence: [blunderMove, ...continuation],
    blunderSquare: verboseBlunder.to,
    summary: blunder.refutation?.summary ?? blunder.description,
    finalEval: blunder.refutation?.finalEval,
  };
}

function buildBlunderFenStates(preview: BlunderPreviewData): string[] {
  const chess = new Chess(preview.startFen);
  const states = [preview.startFen];

  for (const san of preview.sequence) {
    try {
      chess.move(san);
      states.push(chess.fen());
    } catch {
      break;
    }
  }

  return states;
}

function buildBlunderFenStatesFromParts(startFen: string, sequenceKey: string): string[] {
  if (!startFen) return [];

  return buildBlunderFenStates({
    startFen,
    sequence: sequenceKey ? sequenceKey.split("|") : [],
    blunderSquare: null,
    summary: "",
  });
}

function BlunderVariationBoard({
  line,
  blunder,
  onClose,
}: {
  line: OpeningLine;
  blunder: CommonBlunder;
  onClose: () => void;
}) {
  const preview = buildBlunderPreview(line, blunder);
  const [stepIndex, setStepIndex] = useState(0);
  const previewStartFen = preview?.startFen ?? "";
  const previewSequenceKey = preview?.sequence.join("|") ?? "";
  const fenStates = buildBlunderFenStatesFromParts(previewStartFen, previewSequenceKey);
  const totalSteps = fenStates.length;

  useEffect(() => {
    if (totalSteps <= 1 || stepIndex >= totalSteps - 1) return;

    const timer = window.setTimeout(() => {
      setStepIndex((current) => Math.min(current + 1, totalSteps - 1));
    }, stepIndex === 0 ? 900 : 1200);

    return () => window.clearTimeout(timer);
  }, [stepIndex, totalSteps]);

  if (!preview || fenStates.length === 0) return null;

  const blunderBadgeVisible = stepIndex === 1 && preview.blunderSquare;
  const overlayStyle = preview.blunderSquare
    ? getOverlayPosition(preview.blunderSquare, "white")
    : null;
  const activeMoveIndex = Math.max(0, stepIndex - 1);

  return (
    <div className={`w-full ${MAIN_BOARD_WIDTH_CLASS} rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 px-4 py-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
            Biến Thể Cảnh Báo
          </p>
          <p className="mt-1 text-sm font-semibold text-rose-950">{blunder.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {typeof preview.finalEval === "number" && (
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-800">
              Eval {preview.finalEval > 0 ? `+${preview.finalEval.toFixed(1)}` : preview.finalEval.toFixed(1)}
            </span>
          )}
          <button
            onClick={() => setStepIndex(0)}
            className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-700"
          >
            Xem lại
          </button>
          <button
            onClick={onClose}
            className="text-xs font-medium text-rose-500 hover:text-rose-700"
          >
            Đóng
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className={`w-full ${BLUNDER_BOARD_WIDTH_CLASS}`}>
          <div className="relative overflow-hidden rounded-[14px] ring-2 ring-rose-200/80">
            {blunderBadgeVisible && overlayStyle ? (
              <div
                className="pointer-events-none absolute z-20 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-rose-600 text-sm font-black text-white shadow-lg"
                style={overlayStyle}
              >
                !
              </div>
            ) : null}
            <Chessboard
              options={{
                id: `blunder-board-${line.id}-${blunder.id}`,
                position: fenStates[stepIndex] ?? preview.startFen,
                boardOrientation: "white",
                allowDragging: false,
                squareStyles:
                  blunderBadgeVisible && preview.blunderSquare
                    ? {
                        [preview.blunderSquare]: {
                          background:
                            "radial-gradient(circle, rgba(251,113,133,0.78) 0%, rgba(251,113,133,0.34) 45%, transparent 70%)",
                          boxShadow: "inset 0 0 0 2px rgba(225,29,72,0.95)",
                        },
                      }
                    : {},
                boardStyle: {
                  borderRadius: "8px",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.14)",
                },
              }}
            />
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm leading-relaxed text-rose-900">{preview.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {preview.sequence.map((move, index) => (
              <div key={`${blunder.id}-${move}-${index}`} className="flex items-center gap-1.5">
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm ${
                    index === activeMoveIndex
                      ? "bg-rose-600 text-white"
                      : index === 0
                      ? "bg-rose-100 text-rose-900"
                      : "bg-white text-rose-800"
                  }`}
                >
                  {move}
                </span>
                {index < preview.sequence.length - 1 && (
                  <span className="text-xs font-semibold text-rose-300">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-rose-700">
            Dấu chấm than đỏ chỉ xuất hiện đúng ở nước đi sai và sẽ biến mất sau nước đáp trả tiếp theo.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChessBoardPractice({
  line,
  onComplete,
  onNextLine,
  onReplayLine,
  nextActionLabel = "Luyện tiếp",
  replayActionLabel = "Tập luyện lại",
  secondaryActionLabel,
  correctStreak = 0,
  mode = "practice",
  onTutorialComplete,
}: ChessBoardPracticeProps) {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState<string>(line.fenStart || STARTING_FEN);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [currentPlyIndex, setCurrentPlyIndex] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [feedback, setFeedback] = useState<MoveFeedback | null>(null);
  const [mistakeMove, setMistakeMove] = useState("");
  const [attemptMoves, setAttemptMoves] = useState<PracticeMove[]>([]);
  const [hadMistake, setHadMistake] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [learnerSide, setLearnerSide] = useState<"w" | "b">("w");
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [arrow, setArrow] = useState<Arrow[]>([]);
  const [hoverArrows, setHoverArrows] = useState<Arrow[]>([]);
  const [tutorialHint, setTutorialHint] = useState("");
  const [activeBlunderId, setActiveBlunderId] = useState<string | null>(null);
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);
  const [instructionText, setInstructionText] = useState("");
  const [isInstructionVisible, setIsInstructionVisible] = useState(false);
  const [isNarrationLocked, setIsNarrationLocked] = useState(false);
  const opponentMoveTimerRef = useRef<number | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const narrationHideTimerRef = useRef<number | null>(null);
  const narrationRunIdRef = useRef(0);

  const isTutorial = mode === "tutorial";

  const plies: MoveNode[] = line.moves;
  const currentPly: MoveNode | undefined = plies[currentPlyIndex];
  const completedPly = currentPlyIndex;
  const activeStrategicMotif = [...(line.strategicMotifs ?? [])]
    .sort((a, b) => b.triggerPly - a.triggerPly)
    .find((motif) => completedPly >= motif.triggerPly);
  const activePawnStructure = [...(line.pawnStructures ?? [])]
    .sort((a, b) => b.triggerPly - a.triggerPly)
    .find((structure) => completedPly === structure.triggerPly);
  const warningBlunders =
    currentPly && phase !== "completed"
      ? (line.commonBlunders ?? []).filter(
          (blunder) =>
            blunder.triggerModes.includes("warning_button") &&
            blunder.targetPly === currentPly.ply
        )
      : [];
  const activeBlunder =
    (line.commonBlunders ?? []).find((blunder) => blunder.id === activeBlunderId) ?? null;
  const availableJourneys = (line.pieceJourneys ?? []).filter(
    (journey) => currentPly?.ply === journey.recommendedPly
  );
  const activeJourney =
    availableJourneys.find((journey) => journey.id === activeJourneyId) ??
    availableJourneys[0] ??
    null;
  const journeyOriginSquares = availableJourneys.map((journey) => journey.originSquare);
  const currentPlyWarnings =
    currentPly && phase !== "completed"
      ? (line.commonBlunders ?? []).filter((blunder) => blunder.targetPly === currentPly.ply)
      : [];

  const clearOpponentTimer = useCallback(() => {
    if (opponentMoveTimerRef.current) {
      window.clearTimeout(opponentMoveTimerRef.current);
      opponentMoveTimerRef.current = null;
    }
  }, []);

  const clearNarration = useCallback(() => {
    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    if (narrationHideTimerRef.current) {
      window.clearTimeout(narrationHideTimerRef.current);
      narrationHideTimerRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const resetBoard = useCallback(() => {
    clearOpponentTimer();
    clearNarration();
    gameRef.current = new Chess(line.fenStart || STARTING_FEN);
    setFen(line.fenStart || STARTING_FEN);
    setPhase("playing");
    setCurrentPlyIndex(0);
    setExplanation("");
    setFeedback(null);
    setMistakeMove("");
    setAttemptMoves([]);
    setHadMistake(false);
    setLearnerSide("w");
    setSelectedSquare(null);
    setArrow([]);
    setHoverArrows([]);
    setTutorialHint("");
    setActiveBlunderId(null);
    setActiveJourneyId(null);
    setInstructionText("");
    setIsInstructionVisible(false);
    setIsNarrationLocked(false);
  }, [clearNarration, clearOpponentTimer, line.fenStart]);

  // ─── Advance logic ──────────────────────────────────────────────────────────

  const advanceAutoMoves = useCallback(
    (plyIndex: number, moves = attemptMoves, hadAnyMistake = hadMistake) => {
      clearOpponentTimer();

      const ply = plies[plyIndex];

      if (!ply) {
        // All plies done
        setPhase("completed");
        setArrow([]);
        if (isTutorial) {
          onTutorialComplete?.();
        } else {
          onComplete(moves, !hadAnyMistake);
        }
        return;
      }

      if (isTutorial) {
        // Tutorial: all plies are user-controlled
        setPhase("playing");
        setCurrentPlyIndex(plyIndex);
        setMistakeMove("");
        setTutorialHint("");
        setActiveBlunderId(null);
        // Compute and show arrow
        const arrowEntry = sanToArrow(gameRef.current, ply.validMoves[0] ?? "");
        setArrow(arrowEntry ? [arrowEntry] : []);
        return;
      }

      // ── Practice mode: original behaviour ──
      if (ply.side === learnerSide) {
        setPhase("playing");
        setCurrentPlyIndex(plyIndex);
        setMistakeMove("");
        setExplanation("");
        setActiveBlunderId(null);
        setFeedback(getPreviewExplanation(ply.explain, ply.tags));
        return;
      }

      setPhase("opponent");
      setCurrentPlyIndex(plyIndex);
      setFeedback(null);

      opponentMoveTimerRef.current = window.setTimeout(() => {
        const autoMove = ply.validMoves[0];
        if (!autoMove) {
          setPhase("playing");
          return;
        }
        try {
          gameRef.current.move(autoMove);
        } catch {
          setPhase("playing");
          return;
        }
        setFen(gameRef.current.fen());
        advanceAutoMoves(plyIndex + 1, moves, hadAnyMistake);
      }, OPPONENT_MOVE_DELAY_MS);
    },
    [attemptMoves, clearOpponentTimer, hadMistake, isTutorial, learnerSide, onComplete, onTutorialComplete, plies]
  );

  // ─── Board initialisation ────────────────────────────────────────────────────

  useEffect(() => {
    resetBoard();
    if (line.moves.length === 0) return;

    const firstPly = line.moves[0];
    const side = firstPly.side;

    if (isTutorial) {
      setBoardOrientation(side === "w" ? "white" : "black");
      setCurrentPlyIndex(0);
      setPhase("playing");
      // Compute arrow for the first ply
      const firstArrow = sanToArrow(gameRef.current, firstPly.validMoves[0] ?? "");
      setArrow(firstArrow ? [firstArrow] : []);
    } else {
      setLearnerSide(side);
      setBoardOrientation(side === "w" ? "white" : "black");
      setFeedback(getPreviewExplanation(firstPly.explain, firstPly.tags));
      if (side !== gameRef.current.turn()) {
        advanceAutoMoves(0);
      }
    }
    // We intentionally restart the board only when the lesson segment changes.
    // Including stateful callbacks here would reset the board after every move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.id, isTutorial]);

  useEffect(() => {
    if (!isTutorial || !currentPly || phase === "completed") {
      clearNarration();
      setInstructionText("");
      setIsInstructionVisible(false);
      setIsNarrationLocked(false);
      return;
    }

    const text = (currentPly.explain ?? "Đi theo mũi tên xanh trên bàn cờ nhé!").trim();
    if (!text) {
      setInstructionText("");
      setIsInstructionVisible(false);
      setIsNarrationLocked(false);
      return;
    }

    clearNarration();
    const runId = narrationRunIdRef.current + 1;
    narrationRunIdRef.current = runId;
    let typeDone = false;
    let speechDone = false;

    const finishNarrationIfReady = () => {
      if (!typeDone || !speechDone || narrationRunIdRef.current !== runId) return;
      narrationHideTimerRef.current = window.setTimeout(() => {
        if (narrationRunIdRef.current !== runId) return;
        setIsInstructionVisible(false);
        setIsNarrationLocked(false);
      }, 450);
    };

    setInstructionText("");
    setIsInstructionVisible(true);
    setIsNarrationLocked(true);

    let index = 0;
    typingTimerRef.current = window.setInterval(() => {
      index += 1;
      setInstructionText(text.slice(0, index));
      if (index >= text.length) {
        if (typingTimerRef.current) {
          window.clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        typeDone = true;
        finishNarrationIfReady();
      }
    }, 28);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "vi-VN";
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.onend = () => {
        speechDone = true;
        finishNarrationIfReady();
      };
      utterance.onerror = () => {
        speechDone = true;
        finishNarrationIfReady();
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      speechDone = true;
      finishNarrationIfReady();
    }

    return () => {
      clearNarration();
    };
  }, [clearNarration, currentPly, isTutorial, phase]);

  useEffect(() => {
    if (!activeJourneyId) return;
    const stillAvailable = availableJourneys.some((journey) => journey.id === activeJourneyId);
    if (!stillAvailable) {
      setActiveJourneyId(null);
      setHoverArrows([]);
    }
  }, [activeJourneyId, availableJourneys]);

  // ─── Move attempt ────────────────────────────────────────────────────────────

  const attemptMove = useCallback(
    (sourceSquare: string, targetSquare: string | null): boolean => {
      if (!targetSquare) return false;
      if (phase !== "playing" || !currentPly) return false;

      const game = gameRef.current;

      // Compute expected moves BEFORE making the move (needed for isSamePieceIdea)
      const legalMovesBefore = game.moves({ verbose: true });
      const expectedMoves = legalMovesBefore.filter((m) =>
        currentPly.validMoves.includes(m.san)
      );

      let moveResult: Move;
      try {
        moveResult = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      } catch {
        return false;
      }
      if (!moveResult) return false;

      const moveSan = moveResult.san;
      const correct = isCorrectMove(moveSan, currentPly.validMoves);
      setSelectedSquare(null);

      // ── Tutorial mode ──
      if (isTutorial) {
        if (!correct) {
          game.undo();
          setFen(game.fen());
          setTutorialHint("Hãy đi theo mũi tên xanh nhé! 😊");
          return false;
        }
        setTutorialHint("");
        setFen(game.fen());
        advanceAutoMoves(currentPlyIndex + 1, attemptMoves, hadMistake);
        return true;
      }

      // ── Practice mode ──
      const newMoves = [
        ...attemptMoves,
        { ply: currentPly.ply, userMove: moveSan, isCorrect: correct },
      ];
      setAttemptMoves(newMoves);

      if (!correct) {
        const isSamePieceIdea = expectedMoves.some(
          (m) => m.from === moveResult.from || m.piece === moveResult.piece
        );
        game.undo();
        setFen(game.fen());
        setPhase("playing");
        setHadMistake(true);
        setMistakeMove(moveSan);
        setExplanation(currentPly.explain ?? "");
        const matchedBlunder = (line.commonBlunders ?? []).find(
          (blunder) =>
            blunder.triggerModes.includes("wrong_move") &&
            (blunder.targetPly === currentPly.ply ||
              (blunder.wrongMoves ?? []).includes(moveSan))
        );
        setActiveBlunderId(matchedBlunder?.id ?? null);
        setFeedback(
          getMoveFeedback({
            level: isSamePieceIdea ? "close" : "wrong",
            explainText: currentPly.explain,
            tags: currentPly.tags,
            validMoves: currentPly.validMoves,
          })
        );
        return false;
      }

      setFeedback(
        getMoveFeedback({
          level: "correct",
          explainText: currentPly.explain,
          tags: currentPly.tags,
          validMoves: currentPly.validMoves,
        })
      );
      setMistakeMove("");
      setExplanation("");
      setActiveBlunderId(null);
      setFen(game.fen());

      const nextIndex = currentPlyIndex + 1;
      if (nextIndex >= plies.length) {
        setCurrentPlyIndex(nextIndex);
        setPhase("completed");
        onComplete(newMoves, !hadMistake);
      } else {
        advanceAutoMoves(nextIndex, newMoves, hadMistake);
      }

      return true;
    },
    [
      advanceAutoMoves,
      attemptMoves,
      currentPly,
      currentPlyIndex,
      hadMistake,
      isTutorial,
      line.commonBlunders,
      onComplete,
      phase,
      plies.length,
    ]
  );

  // ─── Drag & click handlers ────────────────────────────────────────────────────

  const onDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      piece: { isSparePiece: boolean; position: string; pieceType: string };
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => attemptMove(sourceSquare, targetSquare),
    [attemptMove]
  );

  // In tutorial: the current ply's side is whose turn it is
  const currentTurnSide = isTutorial
    ? (currentPly?.side ?? gameRef.current.turn() as "w" | "b")
    : learnerSide;

  const isUserTurn =
    phase === "playing" &&
    !isNarrationLocked &&
    !!currentPly &&
    (isTutorial
      ? gameRef.current.turn() === currentPly.side
      : currentPly.side === learnerSide && gameRef.current.turn() === learnerSide);

  const possibleTargets = selectedSquare
    ? gameRef.current
        .moves({ square: selectedSquare as Square, verbose: true })
        .map((m) => m.to)
    : [];

  const handlePieceClick = useCallback(
    ({ square }: PieceHandlerArgs) => {
      if (!isUserTurn || !square) return;
      const piece = gameRef.current.get(square as Square);
      if (!piece) return;
      if (piece.color !== currentTurnSide) return;
      setSelectedSquare(square);
    },
    [isUserTurn, currentTurnSide]
  );

  const handleSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      if (!isUserTurn || !square) return;
      if (!selectedSquare) {
        const piece = gameRef.current.get(square as Square);
        if (piece && piece.color === currentTurnSide) setSelectedSquare(square);
        return;
      }
      if (selectedSquare === square) { setSelectedSquare(null); return; }
      const clickedPiece = gameRef.current.get(square as Square);
      if (clickedPiece && clickedPiece.color === currentTurnSide) {
        setSelectedSquare(square);
        return;
      }
      void attemptMove(selectedSquare, square);
    },
    [attemptMove, isUserTurn, currentTurnSide, selectedSquare]
  );

  const handleSquareMouseOver = useCallback(
    ({ piece, square }: SquareHandlerArgs) => {
      if (!piece || !square) {
        setHoverArrows([]);
        setActiveJourneyId(null);
        return;
      }

      const matchingJourney = availableJourneys.find(
        (journey) => journey.originSquare === square
      );
      if (!matchingJourney) {
        setHoverArrows([]);
        setActiveJourneyId(null);
        return;
      }

      setHoverArrows(buildJourneyArrows(matchingJourney.originSquare, matchingJourney.path));
      setActiveJourneyId(matchingJourney.id);
    },
    [availableJourneys]
  );

  const handleSquareMouseOut = useCallback(() => {
    setHoverArrows([]);
    setActiveJourneyId(null);
  }, []);

  // ─── Square styles ────────────────────────────────────────────────────────────

  const pawnStructureStyles =
    activePawnStructure?.dimBoard
      ? Object.fromEntries(
          BOARD_SQUARES.map((sq) => [
            sq,
            activePawnStructure.highlightSquares.includes(sq)
              ? {
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(250,204,21,0.65) 38%, rgba(255,255,255,0.18) 100%)",
                  boxShadow: "inset 0 0 0 2px rgba(234,179,8,0.95)",
                }
              : {
                  backgroundColor: "rgba(15, 23, 42, 0.28)",
                },
          ])
        )
      : {};

  const squareStyles = {
    ...pawnStructureStyles,
    ...Object.fromEntries(
      journeyOriginSquares.map((square) => [
        square,
        {
          background:
            activeJourney?.originSquare === square
              ? "radial-gradient(circle, rgba(251,191,36,0.72) 0%, rgba(251,191,36,0.38) 45%, transparent 70%)"
              : "radial-gradient(circle, rgba(148,163,184,0.24) 0%, rgba(148,163,184,0.12) 38%, transparent 65%)",
          boxShadow:
            activeJourney?.originSquare === square
              ? "inset 0 0 0 2px rgba(245,158,11,0.9)"
              : "inset 0 0 0 1px rgba(100,116,139,0.45)",
        },
      ])
    ),
    ...(selectedSquare
      ? {
          [selectedSquare]: {
            backgroundColor: "rgba(59, 130, 246, 0.35)",
            boxShadow: "inset 0 0 0 2px rgba(37, 99, 235, 0.9)",
          },
        }
      : {}),
    ...Object.fromEntries(
      possibleTargets.map((sq) => [
        sq,
        {
          background:
            "radial-gradient(circle, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.18) 38%, transparent 40%)",
          boxShadow: "inset 0 0 0 1px rgba(5,150,105,0.35)",
        },
      ])
    ),
  };

  const displayedArrows = dedupeArrows([...hoverArrows, ...arrow]);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center gap-4">

      {/* ── Board ── */}
      <div className={`w-full ${MAIN_BOARD_WIDTH_CLASS}`}>
        <div
          className={`relative overflow-hidden rounded-[14px] transition-all ${
            activePawnStructure?.dimBoard
              ? "board-spotlight ring-2 ring-amber-300/70 shadow-[0_14px_40px_rgba(217,119,6,0.18)]"
              : ""
          } ${
            activeJourney ? "journey-preview ring-2 ring-amber-200/80" : ""
          }`}
        >
          {activePawnStructure?.dimBoard && (
            <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex justify-center">
              <div className="rounded-full bg-amber-100/95 px-3 py-1 text-[11px] font-semibold tracking-wide text-amber-900 shadow-sm">
                Đang làm nổi bật {describeSquaresAsPieces(activePawnStructure.highlightSquares)}
              </div>
            </div>
          )}
          {activeJourney && (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex justify-center">
              <div className="rounded-full bg-slate-900/88 px-3 py-1 text-[11px] font-semibold tracking-wide text-amber-200 shadow-sm">
                Xem lộ trình: {formatJourneySquares(activeJourney.originSquare, activeJourney.path)}
              </div>
            </div>
          )}
          {isInstructionVisible && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-slate-950/45 px-5">
              <div className="max-w-[85%] rounded-3xl border border-white/15 bg-white/96 px-5 py-4 text-center shadow-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">
                  {currentPly?.side === "w" ? "Lượt trắng" : "Lượt đen"} • nước {currentPly?.ply}
                </p>
                <p className="mt-3 text-base font-medium leading-relaxed text-slate-900 min-h-[4.5rem]">
                  {instructionText}
                  <span className="inline-block h-5 w-[2px] animate-pulse bg-emerald-500 align-middle ml-0.5" />
                </p>
                <p className="mt-3 text-xs font-medium text-slate-500">
                  Hãy đọc và nghe hết phần giải thích trước khi đi quân.
                </p>
              </div>
            </div>
          )}
        <Chessboard
          options={{
            id: `practice-board-${line.id}`,
            position: fen,
            onPieceDrop: onDrop,
            onPieceClick: handlePieceClick,
            onSquareClick: handleSquareClick,
            onMouseOverSquare: handleSquareMouseOver,
            onMouseOutSquare: handleSquareMouseOut,
            boardOrientation,
            allowDragging: phase === "playing" && !isNarrationLocked,
            dragActivationDistance: 6,
            canDragPiece: ({ piece }) =>
              !isNarrationLocked &&
              piece.pieceType.startsWith(isTutorial ? currentTurnSide : learnerSide),
            squareStyles,
            arrows: displayedArrows,
            boardStyle: {
              borderRadius: "8px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            },
          }}
        />
        </div>
      </div>

      {activePawnStructure && phase !== "completed" && (
        <div className={`w-full ${MAIN_BOARD_WIDTH_CLASS} rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100 px-4 py-4 shadow-sm`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Pawn Structure
              </p>
              <p className="mt-1 text-sm font-semibold text-amber-950">{activePawnStructure.title}</p>
            </div>
            <div className="rounded-full bg-amber-200/70 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
              Ply {activePawnStructure.triggerPly}
            </div>
          </div>
          <p className="mt-2 text-sm text-amber-900">{activePawnStructure.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activePawnStructure.highlightSquares.map((square) => (
              <span
                key={square}
                className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800"
              >
                {square}
              </span>
            ))}
          </div>
          {activePawnStructure.plans?.length ? (
            <div className="mt-3 space-y-1">
              {activePawnStructure.plans.map((plan) => (
                <p key={plan} className="text-xs text-amber-800">
                  • {plan}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {activeStrategicMotif && (
        <div className={`w-full ${MAIN_BOARD_WIDTH_CLASS} rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4 py-4 shadow-sm`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Strategic Motif
              </p>
              <p className="mt-1 text-sm font-semibold text-indigo-950">{activeStrategicMotif.title}</p>
            </div>
            <div className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-800">
              Ply {activeStrategicMotif.triggerPly}
            </div>
          </div>
          <p className="mt-2 text-sm text-indigo-900">{activeStrategicMotif.description}</p>
          {activeStrategicMotif.highlightSquares?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeStrategicMotif.highlightSquares.map((square) => (
                <span
                  key={square}
                  className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700"
                >
                  {square}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-2 space-y-1">
            {activeStrategicMotif.plans.map((plan) => (
              <p key={plan} className="text-xs text-indigo-800">
                • {plan}
              </p>
            ))}
          </div>
        </div>
      )}

      {warningBlunders.length > 0 && phase !== "completed" && (
        <div className={`w-full ${MAIN_BOARD_WIDTH_CLASS} flex justify-end`}>
          <button
            onClick={() =>
              setActiveBlunderId((current) =>
                current === warningBlunders[0].id ? null : warningBlunders[0].id
              )
            }
            className="rounded-full border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition-colors hover:bg-rose-50"
          >
            Cảnh báo
          </button>
        </div>
      )}

      {activeBlunder && (
        <BlunderVariationBoard
          key={activeBlunder.id}
          line={line}
          blunder={activeBlunder}
          onClose={() => setActiveBlunderId(null)}
        />
      )}

      {/* ── Status bar ── */}
      <div className={`w-full ${MAIN_BOARD_WIDTH_CLASS}`}>
        {/* Tutorial status */}
        {isTutorial && phase === "playing" && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            {tutorialHint && (
              <p className="text-xs font-medium text-amber-700 mb-2">{tutorialHint}</p>
            )}
            {currentPlyWarnings[0] && (
              <p className="text-xs font-medium text-amber-700">
                Điểm nhạy cảm: bạn có thể bấm `Cảnh báo` để xem bẫy hoặc sai lầm hay gặp ở nước này.
              </p>
            )}
          </div>
        )}

        {/* Practice status – playing */}
        {!isTutorial && phase === "playing" && (
          <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sky-800 font-semibold text-sm">
                🎯 Đến lượt {learnerSide === "w" ? "quân trắng" : "quân đen"}
              </p>
              {selectedSquare && (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-sky-700">
                  Đang chọn {selectedSquare}
                </span>
              )}
            </div>
            {feedback && !mistakeMove && (
              <div className="mt-2 rounded-lg bg-white/80 px-3 py-3">
                <p className="text-sm font-semibold text-sky-900">{feedback.title}</p>
                <p className="mt-1 text-sm text-sky-800">{feedback.message}</p>
                <p className="mt-1 text-sm text-sky-700">{feedback.detail}</p>
              </div>
            )}
            {activeJourney && (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Lộ Trình Quân Cờ
                </p>
                <p className="mt-1 text-sm font-semibold text-amber-950">{activeJourney.title}</p>
                <p className="mt-1 text-sm text-amber-900">{activeJourney.description}</p>
                <p className="mt-2 text-xs font-medium text-amber-800">
                  Di chuột vào ô {activeJourney.originSquare} để xem lộ trình {formatJourneySquares(
                    activeJourney.originSquare,
                    activeJourney.path
                  )}
                </p>
              </div>
            )}
            {currentPlyWarnings[0] && (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Điểm Nhạy Cảm
                </p>
                <p className="mt-1 text-sm text-amber-900">
                  Đây là một nước dễ sai hoặc dễ bỏ lỡ ý tưởng. Bạn có thể mở `Cảnh báo` trước khi đi.
                </p>
              </div>
            )}
            {activeStrategicMotif && completedPly >= activeStrategicMotif.triggerPly && (
              <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50/90 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  Motif Đang Kích Hoạt
                </p>
                <p className="mt-1 text-sm text-indigo-900">
                  {activeStrategicMotif.title}: {activeStrategicMotif.plans[0]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Practice status – wrong move */}
        {!isTutorial && feedback && mistakeMove && phase === "playing" && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-4">
            <p className="text-rose-700 font-semibold text-sm mb-1">
              {feedback.level === "close"
                ? `🙂 Nước ${mistakeMove} cũng có ý, nhưng chưa khớp bài`
                : `🌱 Nước ${mistakeMove} chưa đúng với line này`}
            </p>
            <p className="text-rose-700 text-sm">{feedback.message}</p>
            <p className="mt-2 text-sm text-rose-600">{feedback.detail}</p>
            {explanation && (
              <p className="mt-2 text-sm text-rose-600">Gợi ý của bài: {explanation}</p>
            )}
          </div>
        )}

        {/* Practice completed */}
        {!isTutorial && phase === "completed" && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-4 text-center">
            <p className="text-green-700 font-bold text-lg mb-1">
              {getRewardMessage(correctStreak)}
            </p>
            {!hadMistake && (
              <p className="text-green-600 text-sm mb-2">🌟 Hoàn hảo – không có sai lầm!</p>
            )}
            <p className="mt-2 text-sm text-green-600">Bé đã hoàn thành bài này rồi.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {onReplayLine && (
                <button
                  onClick={onReplayLine}
                  className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                >
                  {replayActionLabel}
                </button>
              )}
              {onNextLine && (
                <button
                  onClick={onNextLine}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                >
                  {secondaryActionLabel ?? nextActionLabel}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Move progress indicator ── */}
      {plies.length > 0 && (
        <div className={`w-full ${MAIN_BOARD_WIDTH_CLASS}`}>
          <div className="flex gap-1">
            {plies.map((ply, i) => {
              const isCurrent = i === currentPlyIndex;
              const isDone = i < currentPlyIndex;
              const hasPawnTrigger = (line.pawnStructures ?? []).some(
                (structure) => structure.triggerPly === ply.ply
              );
              const hasMotifTrigger = (line.strategicMotifs ?? []).some(
                (motif) => motif.triggerPly === ply.ply
              );
              const hasBlunderTrigger = (line.commonBlunders ?? []).some(
                (blunder) => blunder.targetPly === ply.ply
              );

              return (
                <div key={i} className="relative flex-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      isDone
                        ? isTutorial
                          ? "bg-emerald-400"
                          : "bg-green-400"
                        : isCurrent
                        ? isTutorial
                          ? "bg-emerald-300 animate-pulse"
                          : "bg-blue-400 animate-pulse"
                        : "bg-gray-200"
                    }`}
                  />
                  {(hasPawnTrigger || hasMotifTrigger || hasBlunderTrigger) && (
                    <div className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 gap-1">
                      {hasPawnTrigger && (
                        <span className="h-2 w-2 rounded-full bg-amber-400 ring-1 ring-white" />
                      )}
                      {hasMotifTrigger && (
                        <span className="h-2 w-2 rounded-full bg-indigo-400 ring-1 ring-white" />
                      )}
                      {hasBlunderTrigger && (
                        <span className="h-2 w-2 rounded-full bg-rose-400 ring-1 ring-white" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-medium text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Pawn structure
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Strategic motif
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Cảnh báo blunder
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

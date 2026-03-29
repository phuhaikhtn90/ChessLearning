"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { OpeningLine, MoveNode } from "@/types";
import { isCorrectMove } from "@/lib/moveValidation";
import { getExplanation, getRewardMessage } from "@/lib/explanationEngine";

interface PracticeMove {
  ply: number;
  userMove: string;
  isCorrect: boolean;
}

interface ChessBoardPracticeProps {
  line: OpeningLine;
  onComplete: (moves: PracticeMove[], perfect: boolean) => void;
  correctStreak?: number;
}

type GamePhase = "playing" | "mistake" | "completed";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function ChessBoardPractice({
  line,
  onComplete,
  correctStreak = 0,
}: ChessBoardPracticeProps) {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState<string>(STARTING_FEN);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [currentPlyIndex, setCurrentPlyIndex] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [mistakeMove, setMistakeMove] = useState("");
  const [attemptMoves, setAttemptMoves] = useState<PracticeMove[]>([]);
  const [hadMistake, setHadMistake] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");

  const plies: MoveNode[] = line.moves;
  const currentPly: MoveNode | undefined = plies[currentPlyIndex];

  const resetBoard = useCallback(() => {
    gameRef.current = new Chess();
    setFen(STARTING_FEN);
    setPhase("playing");
    setCurrentPlyIndex(0);
    setExplanation("");
    setMistakeMove("");
    setAttemptMoves([]);
    setHadMistake(false);
  }, []);

  const advanceAutoMoves = useCallback(
    (plyIndex: number, game: Chess) => {
      let idx = plyIndex;
      while (idx < plies.length) {
        const ply = plies[idx];
        const isUserTurn =
          (ply.side === "w" && game.turn() === "w") ||
          (ply.side === "b" && game.turn() === "b");

        if (isUserTurn) break;

        const autoMove = ply.validMoves[0];
        if (!autoMove) break;
        try {
          game.move(autoMove);
        } catch {
          break;
        }
        idx++;
      }
      setFen(game.fen());
      setCurrentPlyIndex(idx);

      if (idx >= plies.length) {
        setPhase("completed");
      }
    },
    [plies]
  );

  useEffect(() => {
    resetBoard();
    const game = gameRef.current;
    if (line.moves.length > 0) {
      setBoardOrientation(line.moves[0].side === "w" ? "white" : "black");
      const firstPly = plies[0];
      const isUserFirst =
        (firstPly.side === "w" && game.turn() === "w") ||
        (firstPly.side === "b" && game.turn() === "b");
      if (!isUserFirst) {
        advanceAutoMoves(0, game);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line]);

  const onDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      piece: { isSparePiece: boolean; position: string; pieceType: string };
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => {
      if (!targetSquare) return false;
      if (phase !== "playing" || !currentPly) return false;

      const game = gameRef.current;

      let moveResult;
      try {
        moveResult = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
      } catch {
        return false;
      }

      if (!moveResult) return false;

      const moveSan = moveResult.san;
      const correct = isCorrectMove(moveSan, currentPly.validMoves);

      const newMoves = [
        ...attemptMoves,
        { ply: currentPly.ply, userMove: moveSan, isCorrect: correct },
      ];
      setAttemptMoves(newMoves);

      if (!correct) {
        game.undo();
        setFen(game.fen());
        setPhase("mistake");
        setHadMistake(true);
        setMistakeMove(moveSan);
        setExplanation(getExplanation(currentPly.explain, currentPly.tags));
        return false;
      }

      const nextIndex = currentPlyIndex + 1;
      if (nextIndex >= plies.length) {
        setFen(game.fen());
        setCurrentPlyIndex(nextIndex);
        setPhase("completed");
        onComplete(newMoves, !hadMistake);
      } else {
        advanceAutoMoves(nextIndex, game);
      }

      return true;
    },
    [phase, currentPly, attemptMoves, currentPlyIndex, plies, hadMistake, onComplete, advanceAutoMoves]
  );

  function handleRetry() {
    setPhase("playing");
    setExplanation("");
    setMistakeMove("");
  }

  const isUserTurn =
    phase === "playing" &&
    currentPly &&
    ((currentPly.side === "w" && gameRef.current.turn() === "w") ||
      (currentPly.side === "b" && gameRef.current.turn() === "b"));

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Board */}
      <div className="w-full max-w-[480px]">
        <Chessboard
          options={{
            position: fen,
            onPieceDrop: onDrop,
            boardOrientation,
            allowDragging: phase === "playing",
            boardStyle: {
              borderRadius: "8px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            },
          }}
        />
      </div>

      {/* Status bar */}
      <div className="w-full max-w-[480px]">
        {phase === "playing" && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
            {isUserTurn ? (
              <span>
                🎯 <strong>Lượt của bạn</strong>{" "}
                – {currentPly?.side === "w" ? "Quân trắng" : "Quân đen"} đi
              </span>
            ) : (
              <span>⏳ Đang xử lý...</span>
            )}
          </div>
        )}

        {phase === "mistake" && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-4">
            <p className="text-red-700 font-semibold text-sm mb-1">
              ❌ Nước {mistakeMove} chưa đúng
            </p>
            <p className="text-red-600 text-sm mb-3">{explanation}</p>
            <button
              onClick={handleRetry}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              Thử lại →
            </button>
          </div>
        )}

        {phase === "completed" && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-4 text-center">
            <p className="text-green-700 font-bold text-lg mb-1">
              {getRewardMessage(correctStreak)}
            </p>
            {!hadMistake && (
              <p className="text-green-600 text-sm mb-2">
                🌟 Hoàn hảo – không có sai lầm!
              </p>
            )}
            <button
              onClick={resetBoard}
              className="mt-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              Luyện lại
            </button>
          </div>
        )}
      </div>

      {/* Move progress indicator */}
      {plies.length > 0 && (
        <div className="w-full max-w-[480px] flex gap-1">
          {plies.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i < currentPlyIndex
                  ? "bg-green-400"
                  : i === currentPlyIndex
                  ? "bg-blue-400 animate-pulse"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

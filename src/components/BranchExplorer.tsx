"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { BookFlowVariationGroupNode, BookFlowVariationNode, OpeningLine } from "@/types";

interface BranchMove {
  san: string;
  ply: number;
  side: "w" | "b";
  piece: "p" | "n" | "b" | "r" | "q" | "k";
  from: string;
  to: string;
  fenAfter: string;
}

function sanitizeSan(san: string) {
  return san.replace(/[!?]+/g, "");
}

interface BranchOption {
  id: string;
  title: string;
  groupId: string;
  variationId?: string;
  branchPointKey: string | null;
  moves: BranchMove[];
  displayMoves: BranchMove[];
  children: BranchOption[];
}

interface BranchGroup {
  id: string;
  title: string;
  options: BranchOption[];
}

interface BranchExplorerProps {
  line: OpeningLine;
  onSelectBranch: (selection: { groupId: string; variationId?: string }) => void;
  currentMoveKey?: string | null;
  onPreviewChange?: (preview: {
    move: BranchMove | null;
    forks: Array<{ from: string; to: string; label: string }>;
  }) => void;
}

function getBranchMoveKey(move: Pick<BranchMove, "ply" | "san">) {
  return `${move.ply}-${move.san}`;
}

function getStartingPlyFromFen(fen: string): number {
  const parts = fen.trim().split(/\s+/);
  const sideToMove = parts[1] as "w" | "b" | undefined;
  const fullmoveNumber = Number(parts[5] ?? 1);

  if (sideToMove === "b") {
    return (fullmoveNumber - 1) * 2 + 2;
  }

  return (fullmoveNumber - 1) * 2 + 1;
}

function applyMoveOrThrow(chess: Chess, san: string) {
  const result = chess.move(san);
  if (!result) {
    throw new Error(`Illegal SAN while building branch explorer: ${san}`);
  }

  return result;
}

function buildMoveNode(
  chess: Chess,
  san: string,
  ply: number,
  side: "w" | "b"
): BranchMove {
  const sanitizedSan = sanitizeSan(san);
  const result = applyMoveOrThrow(chess, sanitizedSan);
  return {
    san: sanitizedSan,
    ply,
    side,
    piece: result.piece,
    from: result.from,
    to: result.to,
    fenAfter: chess.fen(),
  };
}

function buildVariationOption(
  variation: BookFlowVariationNode,
  startFen: string,
  startPly: number,
  groupId: string,
  ancestorMoves: BranchMove[],
  branchPointKey: string | null
): BranchOption {
  const chess = new Chess(startFen);
  const moves = [...ancestorMoves];
  const displayMoves: BranchMove[] = [];
  const children: BranchOption[] = [];
  let currentPly = startPly;

  variation.flow.forEach((node) => {
    if (node.type === "move") {
      const builtMove = buildMoveNode(chess, node.notation, currentPly, node.side);
      moves.push(builtMove);
      displayMoves.push(builtMove);
      currentPly += 1;
      return;
    }

    if (node.type === "variation") {
      children.push(
        buildVariationOption(
          node,
          chess.fen(),
          currentPly,
          groupId,
          [...moves],
          moves.length > 0 ? getBranchMoveKey(moves[moves.length - 1]) : branchPointKey
        )
      );
    }
  });

  return {
    id: variation.id,
    title: variation.title,
    groupId,
    variationId: variation.id,
    branchPointKey,
    moves,
    displayMoves,
    children,
  };
}

function buildGroupOverview(
  group: BookFlowVariationGroupNode,
  startFen: string,
  startPly: number,
  groupId: string
): BranchGroup {
  const chess = new Chess(startFen);
  const prefixMoves: BranchMove[] = [];
  const options: BranchOption[] = [];
  let currentPly = startPly;

  group.flow.forEach((node) => {
    if (node.type === "move") {
      prefixMoves.push(buildMoveNode(chess, node.notation, currentPly, node.side));
      currentPly += 1;
      return;
    }

    if (node.type === "variation") {
      options.push(
        buildVariationOption(
          node,
          chess.fen(),
          currentPly,
          groupId,
          [...prefixMoves],
          prefixMoves.length > 0 ? getBranchMoveKey(prefixMoves[prefixMoves.length - 1]) : null
        )
      );
    }
  });

  if (options.length === 0 && prefixMoves.length > 0) {
    options.push({
      id: `${groupId}__main`,
      title: group.title,
      groupId,
      branchPointKey: prefixMoves.length > 0 ? getBranchMoveKey(prefixMoves[prefixMoves.length - 1]) : null,
      moves: prefixMoves,
      displayMoves: prefixMoves,
      children: [],
    });
  }

  return {
    id: groupId,
    title: group.title,
    options,
  };
}

function buildBranchGroups(line: OpeningLine): BranchGroup[] {
  const bookContent = line.bookContent ?? [];
  const startingPly = getStartingPlyFromFen(line.fenStart);
  let currentPly = 1;
  const chess = new Chess(line.fenStart);
  let groupIndex = 0;
  const groups: BranchGroup[] = [];

  bookContent.forEach((node) => {
    if (node.type === "move") {
      if (currentPly >= startingPly) {
        applyMoveOrThrow(chess, node.notation);
      }
      currentPly += 1;
      return;
    }

    if (node.type === "variation_group") {
      groups.push(
        buildGroupOverview(
          node,
          chess.fen(),
          currentPly,
          `group_${groupIndex}`
        )
      );
      groupIndex += 1;
    }
  });

  return groups;
}

function MoveSequence({
  moves,
  onPickMove,
  selectedMoveKey,
}: {
  moves: BranchMove[];
  onPickMove: (move: BranchMove) => void;
  selectedMoveKey: string | null;
}) {
  if (moves.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {moves.map((move) => (
        <button
          key={`${move.ply}-${move.san}`}
          onClick={() => onPickMove(move)}
          className={`rounded-md border px-1.5 py-0.5 text-left text-[10px] font-medium leading-4 transition-colors ${
            selectedMoveKey === `${move.ply}-${move.san}`
              ? "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-200"
              : ""
          } ${
            move.side === "w"
              ? "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700"
              : "border-slate-200 bg-slate-50/55 text-slate-600 hover:border-slate-400 hover:text-slate-800"
          }`}
          style={{ maxWidth: "100%" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`text-sm leading-none ${
                move.side === "w" ? "text-slate-900" : "text-slate-500"
              }`}
              aria-hidden="true"
            >
              {getPieceGlyph(move)}
            </span>
            <span>
              {move.ply % 2 === 1 ? `${Math.ceil(move.ply / 2)}.` : "..."} {move.san}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function getPieceGlyph(move: BranchMove) {
  const glyphs: Record<BranchMove["piece"], { w: string; b: string }> = {
    p: { w: "♙", b: "♟" },
    n: { w: "♘", b: "♞" },
    b: { w: "♗", b: "♝" },
    r: { w: "♖", b: "♜" },
    q: { w: "♕", b: "♛" },
    k: { w: "♔", b: "♚" },
  };

  return glyphs[move.piece][move.side];
}

function getSiblingForkPreview(
  options: BranchOption[],
  currentMoveKey: string
): { move: BranchMove | null; forks: Array<{ from: string; to: string; label: string }> } | null {
  const matchingIndex = options.findIndex(
    (option) => option.displayMoves[0] && getBranchMoveKey(option.displayMoves[0]) === currentMoveKey
  );

  if (matchingIndex >= 0) {
    const move = options[matchingIndex].displayMoves[0] ?? null;
    const forks = options
      .map((option, index) => {
        const firstMove = option.displayMoves[0];
        if (!firstMove) return null;
        return {
          from: firstMove.from,
          to: firstMove.to,
          label: String(index + 1),
        };
      })
      .filter((fork): fork is { from: string; to: string; label: string } => !!fork);

    return { move, forks };
  }

  for (const option of options) {
    const nested = getSiblingForkPreview(option.children, currentMoveKey);
    if (nested) return nested;
  }

  return null;
}

function BranchOptionCard({
  option,
  depth,
  onPickMove,
  onSelectBranch,
  selectedMoveKey,
  isLastChild = false,
}: {
  option: BranchOption;
  depth: number;
  onPickMove: (move: BranchMove) => void;
  onSelectBranch: (selection: { groupId: string; variationId?: string }) => void;
  selectedMoveKey: string | null;
  isLastChild?: boolean;
}) {
  return (
    <div className={`relative ${depth > 0 ? "pl-4" : ""}`}>
      {depth > 0 && (
        <>
          <div
            className={`absolute left-1.5 top-0 w-px bg-slate-300 ${
              isLastChild ? "h-4" : "h-full"
            }`}
          />
          <div className="absolute left-1.5 top-4 h-px w-3 bg-slate-300" />
          <div className="absolute left-[1px] top-[7px] text-[10px] text-slate-400">↳</div>
        </>
      )}

      <div className="rounded-lg bg-white/60 px-1.5 py-1">
        <button
          onClick={() =>
            onSelectBranch({
              groupId: option.groupId,
              variationId: option.variationId,
            })
          }
          className="w-full text-left"
        >
          <p className="text-[11px] font-semibold leading-5 text-slate-900 sm:text-xs">
            {option.title}
          </p>
        </button>

        <MoveSequence
          moves={option.displayMoves}
          onPickMove={onPickMove}
          selectedMoveKey={selectedMoveKey}
        />

        {option.children.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {option.children.map((child, index) => (
              <BranchOptionCard
                key={child.id}
                option={child}
                depth={depth + 1}
                onPickMove={onPickMove}
                onSelectBranch={onSelectBranch}
                selectedMoveKey={selectedMoveKey}
                isLastChild={index === option.children.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BranchExplorer({
  line,
  onSelectBranch,
  currentMoveKey,
  onPreviewChange,
}: BranchExplorerProps) {
  const branchGroups = useMemo(() => buildBranchGroups(line), [line]);
  const [selectedMoveKey, setSelectedMoveKey] = useState<string | null>(null);
  const activeMoveKey = currentMoveKey ?? selectedMoveKey;

  useEffect(() => {
    if (!currentMoveKey) return;

    for (const group of branchGroups) {
      const preview = getSiblingForkPreview(group.options, currentMoveKey);
      if (preview) {
        onPreviewChange?.(preview);
        return;
      }
    }
  }, [branchGroups, currentMoveKey, onPreviewChange]);

  if (branchGroups.length === 0) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-amber-50 p-2.5 shadow-sm">
      <div className="space-y-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Sơ đồ nhánh
          </p>
        </div>

        <div className="min-w-0 space-y-1.5">
          {branchGroups.map((group) => (
            <div key={group.id} className="w-full">
              <div className="flex items-start gap-1.5">
                <div className="pt-0.5 text-xs text-amber-700">┌</div>
                <div className="min-w-0">
                  <button
                    onClick={() => onSelectBranch({ groupId: group.id })}
                    className="text-left"
                  >
                    <p className="text-xs font-semibold leading-5 text-amber-950">
                      {group.title}
                    </p>
                  </button>
                </div>
              </div>

              <div className="mt-1.5 space-y-1.5 pl-3">
                {group.options.map((option) => (
                  <BranchOptionCard
                    key={option.id}
                    option={option}
                    depth={0}
                    onSelectBranch={onSelectBranch}
                    selectedMoveKey={activeMoveKey}
                    onPickMove={(move) => {
                      setSelectedMoveKey(getBranchMoveKey(move));
                      onPreviewChange?.({
                        move,
                        forks: option.children
                          .map((child, index) => {
                            const firstMove = child.displayMoves[0];
                            if (!firstMove) return null;
                            return {
                              from: firstMove.from,
                              to: firstMove.to,
                              label: String(index + 1),
                            };
                          })
                          .filter((fork): fork is { from: string; to: string; label: string } => !!fork),
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

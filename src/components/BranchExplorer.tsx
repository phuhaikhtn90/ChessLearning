"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import { BookFlowVariationGroupNode, BookFlowVariationNode, OpeningLine } from "@/types";

const StaticChessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  {
    ssr: false,
    loading: () => <div className="aspect-square w-full rounded-2xl bg-slate-200 animate-pulse" />,
  }
);

interface BranchMove {
  san: string;
  ply: number;
  side: "w" | "b";
  fenAfter: string;
}

interface BranchOption {
  id: string;
  title: string;
  groupId: string;
  variationId?: string;
  moves: BranchMove[];
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
}

function buildMoveNode(
  chess: Chess,
  san: string,
  ply: number,
  side: "w" | "b"
): BranchMove {
  applyMoveOrThrow(chess, san);
  return {
    san,
    ply,
    side,
    fenAfter: chess.fen(),
  };
}

function buildVariationOption(
  variation: BookFlowVariationNode,
  startFen: string,
  startPly: number,
  groupId: string,
  ancestorMoves: BranchMove[]
): BranchOption {
  const chess = new Chess(startFen);
  const moves = [...ancestorMoves];
  const children: BranchOption[] = [];
  let currentPly = startPly;

  variation.flow.forEach((node) => {
    if (node.type === "move") {
      moves.push(buildMoveNode(chess, node.notation, currentPly, node.side));
      currentPly += 1;
      return;
    }

    if (node.type === "variation") {
      children.push(
        buildVariationOption(node, chess.fen(), currentPly, groupId, [...moves])
      );
    }
  });

  return {
    id: variation.id,
    title: variation.title,
    groupId,
    variationId: variation.id,
    moves,
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
      options.push(buildVariationOption(node, chess.fen(), currentPly, groupId, [...prefixMoves]));
    }
  });

  if (options.length === 0 && prefixMoves.length > 0) {
    options.push({
      id: `${groupId}__main`,
      title: group.title,
      groupId,
      moves: prefixMoves,
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
}: {
  moves: BranchMove[];
  onPickMove: (move: BranchMove) => void;
}) {
  if (moves.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {moves.map((move) => (
        <button
          key={`${move.ply}-${move.san}`}
          onClick={() => onPickMove(move)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            move.side === "w"
              ? "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          {move.ply % 2 === 1 ? `${Math.ceil(move.ply / 2)}.` : "..."} {move.san}
        </button>
      ))}
    </div>
  );
}

function BranchOptionCard({
  option,
  depth,
  onPickMove,
  onSelectBranch,
}: {
  option: BranchOption;
  depth: number;
  onPickMove: (move: BranchMove) => void;
  onSelectBranch: (selection: { groupId: string; variationId?: string }) => void;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${
        depth > 0 ? "mt-3 ml-4" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{option.title}</p>
        </div>
        <button
          onClick={() =>
            onSelectBranch({
              groupId: option.groupId,
              variationId: option.variationId,
            })
          }
          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
        >
          Học nhánh này
        </button>
      </div>

      <MoveSequence moves={option.moves} onPickMove={onPickMove} />

      {option.children.length > 0 && (
        <div className="mt-3">
          {option.children.map((child) => (
            <BranchOptionCard
              key={child.id}
              option={child}
              depth={depth + 1}
              onPickMove={onPickMove}
              onSelectBranch={onSelectBranch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BranchExplorer({ line, onSelectBranch }: BranchExplorerProps) {
  const branchGroups = useMemo(() => buildBranchGroups(line), [line]);
  const [previewFen, setPreviewFen] = useState(line.fenStart);
  const [previewLabel, setPreviewLabel] = useState("Vị trí khởi đầu của chapter");

  if (branchGroups.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-amber-50 p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="lg:w-[320px] lg:flex-none">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Sơ đồ nhánh
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Bấm vào một nước đi để xem bàn cờ tại thời điểm đó, hoặc chọn thẳng nhánh bạn muốn học.
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <StaticChessboard
              options={{
                id: `branch-preview-${line.id}`,
                position: previewFen,
                boardOrientation: "white",
                allowDragging: false,
                boardStyle: {
                  borderRadius: "8px",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.14)",
                },
              }}
            />
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Preview
            </p>
            <p className="mt-1 text-sm text-slate-800">{previewLabel}</p>
            <button
              onClick={() => {
                setPreviewFen(line.fenStart);
                setPreviewLabel("Vị trí khởi đầu của chapter");
              }}
              className="mt-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Quay về ban đầu
            </button>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          {branchGroups.map((group) => (
            <div key={group.id} className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-amber-950">{group.title}</p>
                </div>
                <button
                  onClick={() => onSelectBranch({ groupId: group.id })}
                  className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                >
                  Học nhánh lớn
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {group.options.map((option) => (
                  <BranchOptionCard
                    key={option.id}
                    option={option}
                    depth={0}
                    onSelectBranch={onSelectBranch}
                    onPickMove={(move) => {
                      setPreviewFen(move.fenAfter);
                      setPreviewLabel(
                        `${move.side === "w" ? "Trắng" : "Đen"} vừa đi ${move.san} ở nước ${Math.ceil(
                          move.ply / 2
                        )}`
                      );
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

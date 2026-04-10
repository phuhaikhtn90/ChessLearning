import { Chess } from "chess.js";
import {
  BookContentNode,
  BookFlowVariationGroupNode,
  BookFlowVariationNode,
  MoveNode,
  OpeningLine,
} from "@/types";

export interface LessonSegment {
  id: string;
  line: OpeningLine;
  mode: "tutorial" | "practice";
  title: string;
  shortLabel: string;
  description: string;
  reminder?: string;
  nextActionLabel: string;
  summary?: string;
  hideSummaryInDialog?: boolean;
  narrationText?: string;
  segmentType?: "chapter-intro" | "main" | "variation" | "text" | "group_review";
  variationGroupId?: string;
  variationId?: string;
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

function cloneLine(
  line: OpeningLine,
  id: string,
  name: string,
  moves: MoveNode[],
  fenStart = line.fenStart
): OpeningLine {
  return {
    ...line,
    id,
    name,
    fenStart,
    moves,
    commonBlunders: [],
  };
}

function sanitizeSan(san: string) {
  return san.replace(/[!?]+/g, "");
}

function buildMoveNode(
  node: Extract<BookContentNode, { type: "move" }>,
  ply: number
): MoveNode {
  const sanitizedNotation = sanitizeSan(node.notation);
  return {
    ply,
    side: node.side,
    move: sanitizedNotation,
    validMoves: [sanitizedNotation],
    moveEval: node.moveEval,
    posEval: node.posEval,
  };
}

function applyMoveOrThrow(chess: Chess, san: string) {
  const result = chess.move(sanitizeSan(san));
  if (!result) {
    throw new Error(`Illegal SAN while building lesson flow: ${san}`);
  }
}

function hasLearnerMove(moves: MoveNode[], learnerSide: "w" | "b") {
  return moves.some((move) => move.side === learnerSide);
}

interface FlowBuildResult {
  segments: LessonSegment[];
  practiceCandidates: LessonSegment[];
}

function createTextSegment(
  line: OpeningLine,
  id: string,
  title: string,
  narrationText: string,
  fenStart: string,
  segmentType: LessonSegment["segmentType"],
  variationGroupId?: string,
  variationId?: string
): LessonSegment {
  return {
    id,
    line: cloneLine(line, id, title, [], fenStart),
    mode: "tutorial",
    title,
    shortLabel: "Đọc",
    description: "",
    nextActionLabel: "Tiếp tục",
    narrationText,
    segmentType,
    variationGroupId,
    variationId,
  };
}

function createMoveSegments(
  line: OpeningLine,
  idBase: string,
  lineName: string,
  title: string,
  moves: MoveNode[],
  fenStart: string,
  segmentType: LessonSegment["segmentType"],
  nextActionLabel: string,
  variationGroupId?: string,
  variationId?: string
): LessonSegment[] {
  const tutorialLine = cloneLine(line, `${idBase}__tutorial`, lineName, moves, fenStart);
  const practiceLine = cloneLine(line, `${idBase}__practice`, lineName, moves, fenStart);

  return [
    {
      id: `${idBase}__tutorial`,
      line: tutorialLine,
      mode: "tutorial",
      title,
      shortLabel: "Học",
      description: "",
      nextActionLabel: "Bắt đầu tự đánh lại",
      segmentType,
      variationGroupId,
      variationId,
    },
    {
      id: `${idBase}__practice`,
      line: practiceLine,
      mode: "practice",
      title,
      shortLabel: "Đánh lại",
      description: "",
      nextActionLabel,
      segmentType,
      variationGroupId,
      variationId,
    },
  ];
}

function buildFlowSegmentsFromNodes({
  line,
  nodes,
  startFen,
  startPly,
  displayTitle,
  lineNamePrefix,
  segmentType,
  variationGroupId,
  variationId,
}: {
  line: OpeningLine;
  nodes: BookContentNode[];
  startFen: string;
  startPly: number;
  displayTitle: string;
  lineNamePrefix: string;
  segmentType: LessonSegment["segmentType"];
  variationGroupId?: string;
  variationId?: string;
}): FlowBuildResult {
  const learnerSide = line.preferredLearnerSide ?? "w";
  const segments: LessonSegment[] = [];
  const practiceCandidates: LessonSegment[] = [];
  const chess = new Chess(startFen);
  let currentPly = startPly;
  let chunkStartFen = startFen;
  let chunkIndex = 0;
  let textIndex = 0;
  let chunkMoves: MoveNode[] = [];

  const flushChunk = (nextActionLabel = "Biến thể tiếp theo") => {
    if (chunkMoves.length === 0) return;

    const moveChunk = chunkMoves;
    const localChunkStartFen = chunkStartFen;

    chunkMoves = [];
    chunkStartFen = chess.fen();

    if (!hasLearnerMove(moveChunk, learnerSide)) {
      return;
    }

    const idBase = `${line.id}__${segmentType ?? "segment"}__${variationId ?? variationGroupId ?? "main"}__chunk_${chunkIndex}`;
    chunkIndex += 1;

    const moveSegments = createMoveSegments(
      line,
      idBase,
      lineNamePrefix,
      displayTitle,
      moveChunk,
      localChunkStartFen,
      segmentType,
      nextActionLabel,
      variationGroupId,
      variationId
    );
    segments.push(...moveSegments);
    practiceCandidates.push(moveSegments[1]);
  };

  nodes.forEach((node) => {
    if (node.type === "text") {
      flushChunk();
      segments.push(
        createTextSegment(
          line,
          `${line.id}__${segmentType ?? "segment"}__${variationId ?? variationGroupId ?? "main"}__text_${textIndex++}`,
          displayTitle,
          node.content.trim(),
          chess.fen(),
          "text",
          variationGroupId,
          variationId
        )
      );
      return;
    }

    if (node.type === "move") {
      if (chunkMoves.length === 0) {
        chunkStartFen = chess.fen();
      }
      chunkMoves.push(buildMoveNode(node, currentPly));
      applyMoveOrThrow(chess, node.notation);
      currentPly += 1;
      return;
    }

    if (node.type === "variation") {
      flushChunk();
      const result = buildVariationSegments(
        line,
        node,
        chess.fen(),
        currentPly,
        displayTitle,
        lineNamePrefix,
        variationGroupId
      );
      segments.push(...result.segments);
      practiceCandidates.push(...result.practiceCandidates);
    }
  });

  flushChunk("Biến thể tiếp theo");

  return { segments, practiceCandidates };
}

function buildVariationSegments(
  line: OpeningLine,
  variation: BookFlowVariationNode,
  startFen: string,
  startPly: number,
  groupTitle: string,
  lineNamePrefix: string,
  variationGroupId?: string
): FlowBuildResult {
  return buildFlowSegmentsFromNodes({
    line,
    nodes: variation.flow,
    startFen,
    startPly,
    displayTitle: groupTitle,
    lineNamePrefix: `${lineNamePrefix} - ${variation.title}`,
    segmentType: "variation",
    variationGroupId,
    variationId: variation.id,
  });
}

function buildVariationGroupSegments(
  line: OpeningLine,
  group: BookFlowVariationGroupNode,
  startFen: string,
  startPly: number,
  groupIndex: number,
  isLastGroup: boolean
): FlowBuildResult {
  const result = buildFlowSegmentsFromNodes({
    line,
    nodes: group.flow,
    startFen,
    startPly,
    displayTitle: group.title,
    lineNamePrefix: group.title,
    segmentType: "variation",
    variationGroupId: `group_${groupIndex}`,
  });

  const firstPracticeCandidate = result.practiceCandidates[0];
  if (firstPracticeCandidate) {
    result.segments.push({
      ...firstPracticeCandidate,
      id: `${line.id}__group_review__${groupIndex}`,
      title: group.title,
      shortLabel: "Ôn nhánh lớn",
      description: "",
      summary: undefined,
      nextActionLabel: isLastGroup ? "Kết thúc chương" : "Sang nhánh tiếp theo",
      segmentType: "group_review",
      variationGroupId: `group_${groupIndex}`,
    });
  }

  return result;
}

function buildContentDrivenLessonSegments(line: OpeningLine): LessonSegment[] {
  const bookContent = line.bookContent ?? [];
  if (bookContent.length === 0) return [];

  const segments: LessonSegment[] = [];
  const startingPly = getStartingPlyFromFen(line.fenStart);
  const chess = new Chess(line.fenStart);
  const totalVariationGroups = bookContent.filter(
    (contentNode) => contentNode.type === "variation_group"
  ).length;
  let currentPly = 1;
  let groupIndex = 0;

  bookContent.forEach((node) => {
    if (node.type === "text") {
      segments.push(
        createTextSegment(
          line,
          `${line.id}__chapter_text__${segments.length}`,
          line.name,
          node.content.trim(),
          chess.fen(),
          "chapter-intro"
        )
      );
      return;
    }

    if (node.type === "move") {
      if (currentPly >= startingPly) {
        applyMoveOrThrow(chess, node.notation);
      }
      currentPly += 1;
      return;
    }

    if (node.type === "variation_group") {
      const isLastGroup = totalVariationGroups === groupIndex + 1;

      const result = buildVariationGroupSegments(
        line,
        node,
        chess.fen(),
        currentPly,
        groupIndex,
        isLastGroup
      );
      segments.push(...result.segments);
      groupIndex += 1;
    }
  });

  return segments;
}

export function buildLessonSegments(line: OpeningLine): LessonSegment[] {
  if (line.bookContent?.length) {
    return buildContentDrivenLessonSegments(line);
  }

  if (line.moves.length === 0) {
    return [];
  }

  return createMoveSegments(
    line,
    `${line.id}__fallback`,
    line.name,
    line.name,
    line.moves,
    line.fenStart,
    "main",
    "Hoàn thành bài học"
  );
}

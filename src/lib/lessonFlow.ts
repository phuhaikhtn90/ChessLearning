import { Chess } from "chess.js";
import { CommonBlunder, OpeningLine, OpeningVariation, MoveNode, VariationGroup } from "@/types";

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
  segmentType?: "chapter-intro" | "main" | "variation";
  variationGroupId?: string;
  variationId?: string;
}

function cloneLine(line: OpeningLine, id: string, name: string, moves: MoveNode[]): OpeningLine {
  return {
    ...line,
    id,
    name,
    moves,
    commonBlunders: [],
  };
}

function cloneVariation(variation: OpeningVariation): OpeningVariation {
  return {
    ...variation,
    moves: [...variation.moves],
    subVariations: variation.subVariations?.map(cloneVariation),
  };
}

function getPreviewText(moves: MoveNode[], count = 6): string {
  const previewMoves = moves.slice(0, count).map((move) => move.validMoves[0] ?? "?");
  const formatted: string[] = [];

  for (let i = 0; i < previewMoves.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = previewMoves[i];
    const blackMove = previewMoves[i + 1];
    formatted.push(`${moveNumber}.${whiteMove}${blackMove ? ` ${blackMove}` : ""}`);
  }

  return formatted.join(" ");
}

function getReviewMoves(mainMoves: MoveNode[], variation: OpeningVariation): MoveNode[] {
  const reviewPlies = Math.max(1, variation.reviewPlies ?? 1);
  const fromPly = Math.max(1, variation.startingPly - reviewPlies);

  return mainMoves.filter(
    (move) => move.ply >= fromPly && move.ply < variation.startingPly
  );
}

function buildVariationMoves(mainMoves: MoveNode[], variation: OpeningVariation): MoveNode[] {
  return [...getReviewMoves(mainMoves, variation), ...variation.moves];
}

function buildBlunderVariation(line: OpeningLine, blunder: CommonBlunder): OpeningVariation | null {
  const targetPly = blunder.targetPly;
  const blunderMove = blunder.refutation?.blunderMove ?? blunder.wrongMoves?.[0];
  const continuation = blunder.refutation?.continuation ?? blunder.punishmentLine ?? [];

  if (!targetPly || !blunderMove) return null;

  const setupMoves = line.moves
    .filter((move) => move.ply < targetPly)
    .map((move) => move.validMoves[0])
    .filter(Boolean) as string[];

  const chess = new Chess();

  try {
    for (const san of setupMoves) {
      chess.move(san);
    }
  } catch {
    return null;
  }

  const sequence = [blunderMove, ...continuation];
  const moves: MoveNode[] = [];
  let currentPly = targetPly;

  for (let index = 0; index < sequence.length; index += 1) {
    const san = sequence[index];
    const side = chess.turn() as "w" | "b";

    moves.push({
      ply: currentPly,
      side,
      validMoves: [san],
      explain:
        index === 0
          ? `${blunder.description} Đây là nước sai mà mình muốn nhận ra thật nhanh.`
          : index === 1
          ? blunder.refutation?.summary ?? "Ngay lập tức phản công để khai thác nước đi sai này."
          : "Tiếp tục chuỗi refutation để biến lợi thế thành thế cờ rõ ràng hơn.",
      tags: index === 0 ? ["blunder", "punishment"] : ["punishment", "tactics"],
    });

    try {
      chess.move(san);
    } catch {
      return null;
    }

    currentPly += 1;
  }

  return {
    id: `blunder-${blunder.id}`,
    name: blunder.title,
    description: blunder.description,
    startingPly: targetPly,
    reviewPlies: 1,
    outcome: {
      type: "advantage",
      eval: blunder.refutation?.finalEval,
      summary: blunder.refutation?.summary ?? blunder.description,
    },
    moves,
  };
}

function buildVariationGroups(line: OpeningLine): VariationGroup[] {
  const groups = [...(line.variationGroups ?? [])];
  const blunderVariations = (line.commonBlunders ?? [])
    .map((blunder) => buildBlunderVariation(line, blunder))
    .filter((variation): variation is OpeningVariation => variation !== null);

  if (blunderVariations.length > 0) {
    groups.push({
      id: "common-blunders",
      title: "Các blunder thường gặp",
      intro: "Đây là những nhánh sai rất hay xuất hiện. Mình học chúng như một biến thể riêng để nhận ra và trừng phạt ngay khi đối thủ đi lệch.",
      variations: blunderVariations,
    });
  }

  return groups;
}

function buildVariationReminder(
  line: OpeningLine,
  variation: OpeningVariation,
  variationIndex: number,
  previousVariation?: OpeningVariation
): string {
  const reviewMoves = getReviewMoves(line.moves, variation);
  const reviewText = reviewMoves.length
    ? `Mình nhắc lại ${getPreviewText(reviewMoves, reviewMoves.length)} để nhớ thế cờ trước khi rẽ nhánh.`
    : "";
  const branchMove = variation.moves[0]?.validMoves[0];

  if (variationIndex === 0) {
    return `${variation.description} ${reviewText}`.trim();
  }

  const previousMove = previousVariation?.moves[0]?.validMoves[0];
  if (previousMove && branchMove) {
    return `${variation.description} Ở biến thể trước, nước rẽ nhánh là ${previousMove}; còn ở biến thể này là ${branchMove}. ${reviewText}`.trim();
  }

  return `${variation.description} ${reviewText}`.trim();
}

function buildMainSegments(line: OpeningLine): LessonSegment[] {
  if (line.moves.length === 0) {
    return [];
  }

  const preview = getPreviewText(line.moves);
  const hasVariations = buildVariationGroups(line).length > 0;

  return [
    {
      id: `${line.id}__main__tutorial`,
      line: cloneLine(line, `${line.id}__main__tutorial`, line.name, line.moves),
      mode: "tutorial",
      title: `Khai cuộc chính: ${line.name}`,
      shortLabel: "Khai cuộc chính",
      description: `Đi theo mũi tên để nắm line chính: ${preview}.`,
      reminder: line.outcome?.summary,
      nextActionLabel: "Bắt đầu tự đánh lại",
      summary: line.guide?.summary,
      hideSummaryInDialog: true,
      segmentType: "main",
    },
    {
      id: `${line.id}__main__practice`,
      line: cloneLine(line, `${line.id}__main__practice`, line.name, line.moves),
      mode: "practice",
      title: `Đánh lại khai cuộc chính: ${line.name}`,
      shortLabel: "Đánh lại",
      description: line.guide?.summary ?? "Hệ thống sẽ đi phía đối thủ, còn bạn tự tái hiện line chính để ghi nhớ.",
      reminder: line.outcome?.summary,
      nextActionLabel: hasVariations
        ? "Luyện các biến thể"
        : "Hoàn thành bài học",
      summary: line.guide?.summary,
      segmentType: "main",
    },
  ];
}

function buildVariationBranchSegments(
  line: OpeningLine,
  group: VariationGroup,
  variation: OpeningVariation,
  shortLabel: string,
  reminder: string
): LessonSegment[] {
  const variationMoves = buildVariationMoves(line.moves, variation);
  const variationLine = cloneLine(
    line,
    `${line.id}__${group.id}__${variation.id}`,
    `${group.title} - ${variation.name}`,
    variationMoves
  );

  const segments: LessonSegment[] = [
    {
      id: `${variationLine.id}__tutorial`,
      line: cloneLine(
        variationLine,
        `${variationLine.id}__tutorial`,
        variationLine.name,
        variationMoves
      ),
      mode: "tutorial",
      title: `${group.title}: ${variation.name}`,
      shortLabel,
      description: group.intro,
      reminder,
      nextActionLabel: "Bắt đầu tự đánh lại",
      summary: variation.outcome.summary,
      segmentType: "variation",
      variationGroupId: group.id,
      variationId: variation.id,
    },
    {
      id: `${variationLine.id}__practice`,
      line: cloneLine(
        variationLine,
        `${variationLine.id}__practice`,
        variationLine.name,
        variationMoves
      ),
      mode: "practice",
      title: `Đánh lại biến thể: ${variation.name}`,
      shortLabel,
      description: variation.outcome.summary,
      reminder: `${reminder} ${variation.outcome.summary}`.trim(),
      nextActionLabel: "Luyện biến thể tiếp theo",
      summary: variation.outcome.summary,
      segmentType: "variation",
      variationGroupId: group.id,
      variationId: variation.id,
    },
  ];

  if (variation.subVariations?.length) {
    variation.subVariations.forEach((subVariation, subIndex) => {
      const subReminder = buildVariationReminder(
        line,
        subVariation,
        subIndex,
        variation.subVariations?.[subIndex - 1]
      );
      segments.push(
        ...buildVariationBranchSegments(
          line,
          group,
          subVariation,
          `${shortLabel}.${subIndex + 1}`,
          subReminder
        )
      );
    });
  }

  return segments;
}

function buildVariationSegments(line: OpeningLine): LessonSegment[] {
  const segments: LessonSegment[] = [];

  buildVariationGroups(line).forEach((group) => {
    group.variations.forEach((variation, variationIndex) => {
      const previousVariation = group.variations[variationIndex - 1];
      const reminder = buildVariationReminder(
        line,
        variation,
        variationIndex,
        previousVariation
      );
      segments.push(
        ...buildVariationBranchSegments(
          line,
          group,
          cloneVariation(variation),
          `Biến thể ${variationIndex + 1}`,
          reminder
        )
      );
    });
  });

  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    lastSegment.nextActionLabel = "Hoàn thành bài học";
  }

  return segments;
}

export function buildLessonSegments(line: OpeningLine): LessonSegment[] {
  return [...buildMainSegments(line), ...buildVariationSegments(line)];
}

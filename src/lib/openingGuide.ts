import { OpeningGuideData, OpeningLine } from "@/types";

function buildFallbackGuide(line: OpeningLine): OpeningGuideData {
  return {
    title: `${line.name} là gì?`,
    summary:
      "Đây là một line trong Italian Game. Bé nên nhìn hình quân sau vài nước đầu để hiểu kế hoạch chính, rồi mới học thứ tự nước đi.",
  };
}

export function getOpeningGuide(line: OpeningLine): OpeningGuideData {
  return line.guide ?? buildFallbackGuide(line);
}

export function getMovePreview(line: OpeningLine, count = 6): string {
  const previewMoves = line.moves.slice(0, count).map((move) => move.validMoves[0] ?? "?");
  const formatted: string[] = [];

  for (let i = 0; i < previewMoves.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = previewMoves[i];
    const blackMove = previewMoves[i + 1];
    formatted.push(`${moveNumber}.${whiteMove}${blackMove ? ` ${blackMove}` : ""}`);
  }

  return formatted.join(" ");
}

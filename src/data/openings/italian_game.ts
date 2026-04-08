import {
  BookChapter,
  BookContentNode,
  BookFlowVariationGroupNode,
  BookFlowVariationNode,
  BookMove,
  OpeningBook,
  OpeningLine,
  OpeningVariation,
  VariationGroup,
} from "@/types";

function toMoveNode(move: BookMove) {
  return {
    ply: move.ply,
    side: move.side,
    move: move.move,
    validMoves: [move.move],
    explain: move.explain,
    moveEval: move.moveEval,
    posEval: move.posEval,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildEvalSummary(posEval?: string): string | null {
  if (!posEval) return null;
  if (posEval === "+-" || posEval === "∓") return "Trắng đã giành thế thắng rõ ràng.";
  if (posEval === "±" || posEval === "+=") return "Trắng giữ ưu thế rõ rệt sau nhánh này.";
  return `Đánh giá sau nhánh này: ${posEval}.`;
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

function buildOutcomeSummary(moves: BookMove[], texts: string[], fallback: string): string {
  const lastText = texts[texts.length - 1]?.trim();
  if (lastText) return lastText;

  return buildEvalSummary(moves[moves.length - 1]?.posEval) ?? fallback;
}

interface ParsedFlow {
  moves: BookMove[];
  texts: string[];
  variations: OpeningVariation[];
}

function parseFlow(nodes: BookContentNode[], startPly: number): ParsedFlow {
  const moves: BookMove[] = [];
  const texts: string[] = [];
  const variations: OpeningVariation[] = [];
  let currentPly = startPly;

  nodes.forEach((node) => {
    if (node.type === "text") {
      texts.push(node.content.trim());
      return;
    }

    if (node.type === "move") {
      moves.push({
        ply: currentPly,
        side: node.side,
        move: node.notation,
        moveEval: node.moveEval,
        posEval: node.posEval,
      });
      currentPly += 1;
      return;
    }

    if (node.type === "variation") {
      variations.push(parseVariation(node, currentPly));
    }
  });

  return { moves, texts, variations };
}

function parseVariation(node: BookFlowVariationNode, startPly: number): OpeningVariation {
  const parsed = parseFlow(node.flow, startPly);
  const fallback = buildEvalSummary(parsed.moves[parsed.moves.length - 1]?.posEval) ?? "";

  return {
    id: node.id,
    name: node.title,
    description: parsed.texts[0] ?? buildOutcomeSummary(parsed.moves, parsed.texts, fallback),
    startingPly: parsed.moves[0]?.ply ?? startPly,
    reviewPlies: 0,
    moves: parsed.moves.map(toMoveNode),
    outcome: {
      type: "advantage",
      summary: buildOutcomeSummary(parsed.moves, parsed.texts, fallback),
    },
    subVariations: parsed.variations,
  };
}

function withPrefixedMoves(prefixMoves: BookMove[], variation: OpeningVariation): OpeningVariation {
  return {
    ...variation,
    startingPly: prefixMoves[0]?.ply ?? variation.startingPly,
    moves: [...prefixMoves.map(toMoveNode), ...variation.moves],
  };
}

function parseVariationGroup(node: BookFlowVariationGroupNode, startPly: number): VariationGroup {
  const parsed = parseFlow(node.flow, startPly);
  const intro =
    parsed.texts.join(" ").trim() ||
    "Trắng nên phản ứng tự nhiên, chiếm trung tâm và khai thác việc Đen chậm phát triển.";

  const variations: OpeningVariation[] =
    parsed.variations.length > 0
      ? parsed.variations.map((variation) => withPrefixedMoves(parsed.moves, variation))
      : [
          {
            id: `${slugify(node.title)}__main`,
            name: node.title,
            description: intro,
            startingPly: parsed.moves[0]?.ply ?? startPly,
            reviewPlies: 0,
            moves: parsed.moves.map(toMoveNode),
            outcome: {
              type: "advantage",
              summary: buildOutcomeSummary(parsed.moves, parsed.texts, intro),
            },
          },
        ];

  return {
    id: slugify(node.title),
    title: node.title,
    intro,
    variations,
  };
}

function chapterToOpeningLine(book: OpeningBook, chapter: BookChapter, chapterIndex: number): OpeningLine {
  const rootMoves: BookMove[] = [];
  const introTexts: string[] = [];
  const variationGroups: VariationGroup[] = [];
  let currentPly = 1;

  chapter.content.forEach((node) => {
    if (node.type === "text") {
      introTexts.push(node.content.trim());
      return;
    }

    if (node.type === "move") {
      rootMoves.push({
        ply: currentPly,
        side: node.side,
        move: node.notation,
        moveEval: node.moveEval,
        posEval: node.posEval,
      });
      currentPly += 1;
      return;
    }

    if (node.type === "variation_group") {
      variationGroups.push(parseVariationGroup(node, currentPly));
    }
  });

  const startingPlyFromFen = getStartingPlyFromFen(chapter.fenStart);
  const lineMoves = rootMoves.filter((move) => move.ply >= startingPlyFromFen);

  return {
    id: chapter.id,
    name: chapter.name,
    opening: chapter.opening,
    fenStart: chapter.fenStart,
    preferredLearnerSide: "w",
    bookContent: chapter.content,
    moves: lineMoves.map(toMoveNode),
    guide: {
      title: chapter.name,
      summary: chapter.summary || introTexts.join(" "),
    },
    outcome: {
      type: "advantage",
      summary: chapter.summary || introTexts.join(" "),
    },
    variationGroups,
    difficulty: 2,
    tags: ["italian_game", "book_based", "chapter_study", `chapter_${chapterIndex + 1}`],
    trap: false,
    bookCoverage: {
      isBookAligned: true,
      priority: 100 - chapterIndex,
      references: [
        {
          bookId: book.id,
          title: book.title,
          note: chapter.name,
        },
      ],
      summary: chapter.summary || introTexts.join(" "),
    },
    bookId: book.id,
    bookTitle: book.title,
    chapterNumber: chapterIndex + 1,
  };
}

export const winningWithTheSlowButVenomousItalian: OpeningBook = {
  id: "winning-with-the-slow-but-venomous-italian",
  slug: "winning-with-the-slow-but-venomous-italian-9789056916749_compress",
  title: "Winning with the Slow but Venomous Italian",
  description: "Nội dung được tổ chức theo sách, mỗi chapter là một bài học lớn với nhiều nhánh con bên trong.",
  chapters: [
    {
      id: "wwsi_ch01",
      name: "Chương 1: Các biến phụ ở nước thứ 3 của Đen",
      opening: "Italian Game",
      fenStart: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
      summary:
        "Chương 1 tổng hợp các biến thể phụ của Đen sau 1.e4 e5 2.Nf3 Nc6 3.Bc4. Khi Đen chậm phát triển hoặc đi những nước nghi ngờ, Trắng nên phản ứng tự nhiên, chiếm trung tâm.",
      content: [
        {
          type: "text",
          content:
            "Trong chương đầu tiên này, chúng ta sẽ xem xét tất cả các nước đi hợp lý của Đen ngoại trừ 3...Bc5 và 3...Nf6. Ba trong số đó là 3...f5?!, 3...Nd4?! và 3...h6?! bị coi là đáng nghi vì Đen bỏ qua việc phát triển quân. Trắng sẽ giành ưu thế bằng các nước đi tự nhiên.",
        },
        { type: "move", notation: "e4", side: "w" },
        { type: "move", notation: "e5", side: "b" },
        { type: "move", notation: "Nf3", side: "w" },
        { type: "move", notation: "Nc6", side: "b" },
        { type: "move", notation: "Bc4", side: "w" },
        {
          type: "text",
          content: "Các nước đi sau đây chủ yếu được chơi ở cấp độ nghiệp dư.",
        },
        {
          type: "variation_group",
          title: "Nhánh A) 3...f5?! (Rousseau Gambit)",
          flow: [
            { type: "move", notation: "f5", side: "b", moveEval: "?!" },
            {
              type: "text",
              content:
                "Nước đi cực kỳ hung hăng này làm yếu cánh Vua và đi ngược lại các quy tắc chung trong khai cuộc. Trắng giành được ưu thế lớn với 4.d4 hoặc 4.d3.",
            },
            {
              type: "variation",
              id: "A1",
              title: "A1) Trắng phản công với 4.d4",
              flow: [
                { type: "move", notation: "d4", side: "w" },
                {
                  type: "variation",
                  id: "A11",
                  title: "A11) 4...fxe4",
                  flow: [
                    { type: "move", notation: "fxe4", side: "b" },
                    { type: "move", notation: "Nxe5", side: "w" },
                    { type: "move", notation: "d5", side: "b" },
                    { type: "move", notation: "Bb5", side: "w" },
                    { type: "move", notation: "Qd6", side: "b" },
                    { type: "move", notation: "c4", side: "w", moveEval: "!" },
                    { type: "move", notation: "a6", side: "b" },
                    {
                      type: "variation",
                      id: "A11_main",
                      title: "Nhánh chính: 8.Bxc6+",
                      flow: [
                        { type: "move", notation: "Bxc6+", side: "w", posEval: "±" },
                        { type: "move", notation: "bxc6", side: "b" },
                        { type: "move", notation: "O-O", side: "w" },
                        { type: "move", notation: "Nf6", side: "b" },
                        { type: "move", notation: "Nc3", side: "w" },
                        { type: "move", notation: "Be7", side: "b" },
                        { type: "move", notation: "Bf4", side: "w" },
                        { type: "move", notation: "Qe6", side: "b" },
                        { type: "move", notation: "f3", side: "w", posEval: "±" },
                        {
                          type: "text",
                          content: "Trắng đứng ưu theo ván Stanitz-Daenen, ICCF email 2009.",
                        },
                      ],
                    },
                    {
                      type: "variation",
                      id: "A11_sideline",
                      title: "Nhánh phụ: 8.Ba4",
                      flow: [
                        { type: "move", notation: "Ba4", side: "w" },
                        { type: "move", notation: "b5", side: "b" },
                        { type: "move", notation: "cxb5", side: "w" },
                        { type: "move", notation: "Nxe5", side: "b" },
                        { type: "move", notation: "dxe5", side: "w" },
                        { type: "move", notation: "Qxe5", side: "b" },
                        { type: "move", notation: "b6+", side: "w" },
                        { type: "move", notation: "Bd7", side: "b" },
                        { type: "move", notation: "Bxd7+", side: "w" },
                        { type: "move", notation: "Kxd7", side: "b" },
                        { type: "move", notation: "Be3", side: "w" },
                        { type: "move", notation: "Bb4+", side: "b" },
                        { type: "move", notation: "Nc3", side: "w" },
                        { type: "move", notation: "Bxc3+", side: "b" },
                        { type: "move", notation: "bxc3", side: "w" },
                        { type: "move", notation: "cxb6", side: "b" },
                        { type: "move", notation: "Bd4", side: "w", posEval: "±" },
                        {
                          type: "text",
                          content: "Trắng đứng ưu theo ván Wosch-Daenen, LSS email 2007.",
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "variation",
                  id: "A12",
                  title: "A12) 4...exd4",
                  flow: [
                    { type: "move", notation: "exd4", side: "b" },
                    { type: "move", notation: "e5", side: "w", moveEval: "!" },
                    {
                      type: "text",
                      content:
                        "Nước đi này rất thuyết phục, Vua Đen bị tấn công. Kết quả của ván đấu thư tín sau đây đã chấm dứt biến thể này.",
                    },
                    { type: "move", notation: "d6", side: "b" },
                    { type: "move", notation: "exd6", side: "w" },
                    { type: "move", notation: "Qxd6", side: "b" },
                    { type: "move", notation: "O-O", side: "w" },
                    // Nội dung bị mất
                  ],
                },
                {
                  type: "variation",
                  id: "A13",
                  title: "A13) 4...d6",
                  flow: [
                    { type: "move", notation: "d6", side: "b" },
                    { type: "move", notation: "Ng5", side: "w" },
                    { type: "move", notation: "h6", side: "b" },
                    { type: "move", notation: "d5", side: "w", moveEval: "!" },
                    { type: "move", notation: "Ne7", side: "b" },
                    { type: "move", notation: "Nc3", side: "w", posEval: "±" },
                  ],
                },
              ],
            },
            {
              type: "variation",
              id: "A2",
              title: "A2) Trắng củng cố với 4.d3",
              flow: [
                { type: "move", notation: "d3", side: "w" },
                { type: "move", notation: "Nf6", side: "b" },
                { type: "move", notation: "O-O", side: "w" },
                { type: "move", notation: "Bc5", side: "b" },
                { type: "move", notation: "Nc3", side: "w" },
                { type: "move", notation: "d6", side: "b" },
                { type: "move", notation: "Bg5", side: "w", moveEval: "!" },
                {
                  type: "text",
                  content: "Trắng đứng ưu ổn định theo ván Fryer-Lyell, Hastings 2003.",
                },
              ],
            },
          ],
        },
        {
          type: "variation_group",
          title: "Nhánh B) 3...Nd4?!",
          flow: [
            { type: "move", notation: "Nd4", side: "b", moveEval: "?!" },
            {
              type: "text",
              content:
                "Mặc dù nước 4.Nxe5?! Qg5! là một cạm bẫy cũ nổi tiếng, nhưng Trắng nên đáp trả một cách tự nhiên và bảo thủ hơn.",
            },
            { type: "move", notation: "Nxd4", side: "w" },
            { type: "move", notation: "exd4", side: "b" },
            { type: "move", notation: "O-O", side: "w" },
            { type: "move", notation: "Nf6", side: "b" },
            { type: "move", notation: "Re1", side: "w" },
            { type: "move", notation: "d6", side: "b" },
            { type: "move", notation: "c3", side: "w", posEval: "±" },
            {
              type: "text",
              content: "Trắng dẫn trước về phát triển và kiểm soát trung tâm.",
            },
          ],
        },
        {
          type: "variation_group",
          title: "Nhánh C) 3...h6?!",
          flow: [
            { type: "move", notation: "h6", side: "b", moveEval: "?!" },
            {
              type: "text",
              content:
                "Nước này thường thấy ở cấp độ nghiệp dư do lo sợ Mã nhảy lên g5, nhưng nó làm mất thời gian quý báu.",
            },
            { type: "move", notation: "O-O", side: "w" },
            { type: "move", notation: "Nf6", side: "b" },
            { type: "move", notation: "d4", side: "w", moveEval: "!" },
            {
              type: "text",
              content: "Khai thác thứ tự nước đi kém của Đen.",
            },
            { type: "move", notation: "exd4", side: "b" },
            { type: "move", notation: "e5", side: "w", moveEval: "!" },
            { type: "move", notation: "d5", side: "b" },
            { type: "move", notation: "Bb5", side: "w" },
            { type: "move", notation: "Ne4", side: "b" },
            { type: "move", notation: "Nxd4", side: "w" },
            { type: "move", notation: "Bd7", side: "b" },
            { type: "move", notation: "Bxc6", side: "w" },
            { type: "move", notation: "bxc6", side: "b" },
            { type: "move", notation: "f3", side: "w" },
            { type: "move", notation: "Ng5", side: "b" },
            { type: "move", notation: "f4", side: "w" },
            { type: "move", notation: "Ne4", side: "b" },
            { type: "move", notation: "Nc3", side: "w", moveEval: "!", posEval: "±" },
            {
              type: "text",
              content: "Trắng đe dọa tấn công cánh Vua bằng f4-f5.",
            },
          ],
        },
        {
          type: "variation_group",
          title: "Nhánh D) 3...d6",
          flow: [
            { type: "move", notation: "d6", side: "b" },
            {
              type: "text",
              content:
                "Sau nước đi khiêm tốn này, Trắng có thể quyết định chơi ngay để giành ưu thế khai cuộc bằng cách chinh phục trung tâm hoặc chuyển về nhánh chính trong Chương 3. Chúng tôi đề xuất 4.c3! vì nước này khách quan tốt hơn 4.O-O và dẫn đến ưu thế trong mọi nhánh quan trọng.",
            },
            { type: "move", notation: "c3", side: "w", moveEval: "!" },
            {
              type: "variation",
              id: "D1",
              title: "D1) 4...Nf6?!",
              flow: [
                { type: "move", notation: "Nf6", side: "b", moveEval: "?!" },
                { type: "move", notation: "Ng5", side: "w", moveEval: "!" },
                { type: "move", notation: "d5", side: "b" },
                { type: "move", notation: "exd5", side: "w" },
                {
                  type: "text",
                  content:
                    "Đây là một thế trận quen thuộc thường xuất hiện sau 3.Bc4 Nf6 4.Ng5 d5, nhưng ở đây Trắng có thêm một nhịp vì Đen đã đi d7-d6 rồi mới đi d6-d5.",
                },
                { type: "move", notation: "Nxd5", side: "b" },
                { type: "move", notation: "d4", side: "w" },
                { type: "move", notation: "Be7", side: "b" },
                { type: "move", notation: "Nxf7", side: "w" },
                { type: "move", notation: "Kxf7", side: "b" },
                { type: "move", notation: "Qf3+", side: "w" },
                { type: "move", notation: "Ke6", side: "b" },
                { type: "move", notation: "O-O", side: "w" },
                { type: "move", notation: "Rf8", side: "b" },
                { type: "move", notation: "Qe4", side: "w", posEval: "±" },
                {
                  type: "text",
                  content:
                    "Trắng có một cuộc tấn công khủng khiếp, điều này đã được xác nhận qua nhiều ván đấu thư tín.",
                },
              ],
            },
            {
              type: "variation",
              id: "D2",
              title: "D2) 4...Be7",
              flow: [
                { type: "move", notation: "Be7", side: "b" },
                { type: "move", notation: "Bb3", side: "w" },
                { type: "move", notation: "h6", side: "b" },
                {
                  type: "text",
                  content: "Nếu 5...Na5? thì 6.Bxf7+! Kxf7 7.Nxe5+ Kf8 8.Nxa5 và Trắng hơn hẳn một tốt.",
                },
                { type: "move", notation: "d4", side: "w" },
                { type: "move", notation: "O-O", side: "b" },
                {
                  type: "text",
                  content: "Nếu 6...Na5? thì 7.Qa4+ c6 8.Bxf7+! và Trắng giữ ưu thế rõ rệt.",
                },
                { type: "move", notation: "Bxh6", side: "w" },
                { type: "move", notation: "gxh6", side: "b" },
                {
                  type: "text",
                  content:
                    "Trắng có cấu trúc tốt hơn và hưởng ưu thế nhỏ. Ví dụ ván Mujunen-Zhuravlev, ICCF 2014 tiếp tục với 8.O-O a5 9.Qa4+ c6 10.Bxc4 Bg4 11.Nbd2 Bg5 12.Rfe1 c5 13.d3 Rc8 14.Nxg5 hxg5 15.Nf1 exd4 16.cxd4 Nf6 17.Ng3 f4 18.Re3 ±.",
                },
              ],
            },
            {
              type: "variation",
              id: "D3",
              title: "D3) 4...Bg4",
              flow: [
                { type: "move", notation: "Bg4", side: "b" },
                { type: "move", notation: "d4", side: "w" },
                { type: "move", notation: "Bxf3", side: "b" },
                { type: "move", notation: "Qxf3", side: "w" },
                { type: "move", notation: "f6", side: "b" },
                { type: "move", notation: "Be3", side: "w" },
                { type: "move", notation: "Qxf3", side: "b" },
                { type: "move", notation: "gxf3", side: "w", posEval: "±" },
              ],
            },
            {
              type: "variation",
              id: "D4",
              title: "D4) 4...h6",
              flow: [
                { type: "move", notation: "h6", side: "b" },
                { type: "move", notation: "O-O", side: "w" },
                { type: "move", notation: "Nf6", side: "b" },
                { type: "move", notation: "d4", side: "w" },
                { type: "move", notation: "Be7", side: "b" },
                {
                  type: "variation",
                  id: "D4_sub",
                  title: "Nhánh phụ: 6...Nxe4",
                  flow: [
                    { type: "move", notation: "Nxe4", side: "b" },
                    { type: "move", notation: "dxe5", side: "w" },
                    { type: "move", notation: "Be6", side: "b", moveEval: "?!" },
                    {
                      type: "text",
                      content:
                        "Nếu 7...Be7 thì 8.Re1 f5 9.d4! Nxd4 10.Nxd4 d5 11.Nxd5 Bc5 12.Qa4+ và Trắng giữ ưu thế rõ rệt.",
                    },
                    { type: "move", notation: "Bxe6", side: "w" },
                    { type: "move", notation: "fxe6", side: "b" },
                    { type: "move", notation: "d4", side: "w", moveEval: "!" },
                    { type: "move", notation: "Nxd4", side: "b" },
                    { type: "move", notation: "Qh5+", side: "w" },
                    { type: "move", notation: "Kd7", side: "b" },
                    { type: "move", notation: "cxd4", side: "w", posEval: "±" },
                    {
                      type: "text",
                      content: "Ván Zelcic-Krnic, Zadar 1994.",
                    },
                  ],
                },
                { type: "move", notation: "Re1", side: "w" },
                { type: "move", notation: "O-O", side: "b" },
                { type: "move", notation: "h3", side: "w", posEval: "±" },
              ],
            },
          ],
        },
        {
          type: "variation_group",
          title: "Nhánh E) 3...Be7",
          flow: [
            { type: "move", notation: "Be7", side: "b" },
            {
              type: "text",
              content:
                "Tương tự như sau 3...d6, Trắng có thể chọn giữa việc chuyển về Chương 3 hoặc cố gắng giành ưu thế bằng lối chơi lắt léo.",
            },
            { type: "move", notation: "d4", side: "w" },
            {
              type: "text",
              content:
                "Nếu Đen chơi 4...d6, nước 5.d5 là lựa chọn yêu thích của máy tính vì Trắng chiếm thêm không gian và đạt một phiên bản dễ chơi của cấu trúc King's Indian.",
            },
            { type: "move", notation: "exd4", side: "b" },
            { type: "move", notation: "c3", side: "w", moveEval: "!?" },
            {
              type: "text",
              content: "Sau nước đi này, Đen rất dễ đi sai đường.",
            },
            {
              type: "variation",
              id: "E1",
              title: "E1) 5...d6?!",
              flow: [
                { type: "move", notation: "d6", side: "b", moveEval: "?!" },
                { type: "move", notation: "Bb3", side: "w" },
                { type: "move", notation: "Na5", side: "b" },
                { type: "move", notation: "Bxf7+", side: "w" },
                { type: "move", notation: "Kxf8", side: "b" },
                { type: "move", notation: "Qa4", side: "w" },
                { type: "move", notation: "Nxf7", side: "b" },
                { type: "move", notation: "Qxa5", side: "w" },
                { type: "move", notation: "Nf6", side: "b" },
                { type: "move", notation: "cxd4", side: "w", posEval: "±" },
              ],
            },
            {
              type: "variation",
              id: "E2",
              title: "E2) 5...dxc3?!",
              flow: [
                { type: "move", notation: "dxc3", side: "b", moveEval: "?!" },
                { type: "move", notation: "d5", side: "w", moveEval: "!" },
                {
                  type: "text",
                  content:
                    "Nhiều ván đấu đã kết thúc bằng việc Đen đầu hàng tại đây, nhưng Đen vẫn có thể cố gắng chiến đấu với 6...Na5 7.Bd3.",
                },
              ],
            },
            {
              type: "variation",
              id: "E3",
              title: "E3) 5...d3",
              flow: [
                { type: "move", notation: "d3", side: "b" },
                { type: "move", notation: "Bb3", side: "w" },
                { type: "move", notation: "Na5", side: "b" },
                { type: "move", notation: "Bxf7+", side: "w" },
                { type: "move", notation: "Kxf8", side: "b" },
                { type: "move", notation: "Qa4", side: "w" },
                { type: "move", notation: "d5", side: "b" },
                { type: "move", notation: "Nxe5+", side: "w" },
                { type: "move", notation: "Kf8", side: "b" },
                { type: "move", notation: "Nxd5", side: "w" },
                { type: "move", notation: "Nxd5", side: "b" },
                { type: "move", notation: "exd5", side: "w", posEval: "±" },
              ],
            },
            {
              type: "variation",
              id: "E4",
              title: "E4) 5...Nf6?!",
              flow: [
                { type: "move", notation: "Nf6", side: "b", moveEval: "?!" },
                { type: "move", notation: "e5", side: "w" },
                { type: "move", notation: "Ne4", side: "b" },
                { type: "move", notation: "d5", side: "w", moveEval: "!", posEval: "±" },
              ],
            },
            {
              type: "variation",
              id: "E5",
              title: "E5) 5...Na5!",
              flow: [
                { type: "move", notation: "Na5", side: "b", moveEval: "!" },
                { type: "move", notation: "Be2", side: "w" },
                { type: "move", notation: "dxc3", side: "b" },
                {
                  type: "text",
                  content: "Nếu 6...d5 thì 7.Qa4+ c6 8.exd5 Nf6 9.dxc6 Nxc6 10.Nxd4 và Trắng giữ ưu thế.",
                },
                { type: "move", notation: "Nxc3", side: "w" },
                { type: "move", notation: "d6", side: "b" },
                { type: "move", notation: "O-O", side: "w" },
                { type: "move", notation: "Nf6", side: "b" },
                {
                  type: "text",
                  content:
                    "Ví dụ ván Ardelean-Pessi, Baile Olanesti 2010 tiếp tục với 8...Nc6 9.Bb3 Nf6 10.Rd1 d7 11.Be3 O-O 12.h3 Re8 13.Rac1.",
                },
                { type: "move", notation: "Qa4+", side: "w" },
                { type: "move", notation: "Nc6", side: "b" },
                { type: "move", notation: "e5", side: "w" },
                { type: "move", notation: "dxe5", side: "b" },
                {
                  type: "text",
                  content:
                    "Nếu 10...Nd7 thì 11.g4! Nf8 hoặc 11...O-O 12.Bxh6 g6 13.Bxf8, và trong nhiều đường khác Trắng vẫn duy trì thế chủ động.",
                },
                { type: "move", notation: "Nxe5", side: "w" },
                {
                  type: "text",
                  content:
                    "Ván A. Horvath-Pastor Alonso de Prado, Madrid 2012 cho thấy Trắng tiếp tục ép rất khó chịu trong thế trận này.",
                },
                { type: "move", notation: "Nxd7", side: "w", moveEval: "!", posEval: "±" },
                {
                  type: "text",
                  content: "Nếu 12...Qxd7 thì 13.Rd1 O-O 14.f4 Bd6 15.Bxd6 cxd6 16.Rd6 Qe7 17.Rad1 và Trắng vẫn hơn.",
                },
                { type: "move", notation: "Rd1", side: "w" },
                { type: "move", notation: "Qc8", side: "b" },
                {
                  type: "text",
                  content: "Nếu 13...Qd6?! thì 14.Bg5 O-O 15.Bxf6 gxf6 16.Ne4.",
                },
                { type: "move", notation: "f4", side: "w", posEval: "±" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const italianGameChapters: OpeningLine[] =
  winningWithTheSlowButVenomousItalian.chapters.map((chapter, index) =>
    chapterToOpeningLine(winningWithTheSlowButVenomousItalian, chapter, index)
  );

export default italianGameChapters;

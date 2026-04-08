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
          content: "Trong chương đầu tiên, chúng ta sẽ xem xét tất cả các nước đi hợp lý ở mức độ nhất định ngoài 3...Bc5 và 3...Nf6. Ba trong số đó – 3...f5?!, 3...Nd4?! và 3...h6?! – là đáng nghi (dubious) vì Đen bỏ qua việc phát triển quân. Trắng giành lợi thế bằng những nước đi tự nhiên. Sau 3...d6 và 3...Be7, Trắng có thể chuyển về Chương 3, nhưng chúng tôi cũng cung cấp một khả năng độc lập hứa hẹn lợi thế cho Trắng. 3...g6 là một nỗ lực thú vị để tránh các lộ trình lý thuyết cao. Kế hoạch của Đen hơi chậm, vì vậy Trắng phải chơi mạnh mẽ ở trung tâm. Với việc sẵn sàng hy sinh một tốt, Trắng giành quyền chủ động và có thế trận tốt hơn sau khai cuộc."
        },
        { type: "move", notation: "e4", side: "w" },
        { type: "move", notation: "e5", side: "b" },
        { type: "move", notation: "Nf3", side: "w" },
        { type: "move", notation: "Nc6", side: "b" },
        { type: "move", notation: "Bc4", side: "w" },
        { type: "text", content: "Các nước đi sau đây chủ yếu được chơi ở cấp độ nghiệp dư." },

        // NHÁNH A: 3...f5?!
        {
          type: "variation_group",
          title: "A) 3...f5?! (Rousseau Gambit)",
          flow: [
            { type: "move", notation: "f5", side: "b", moveEval: "?!" },
            { type: "text", content: "Nước đi cực kỳ hung hăng này làm yếu cánh Vua và đi ngược lại các quy tắc chung trong khai cuộc. Trắng giành ưu thế lớn với 4.d4 hoặc 4.d3." },
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
                        { type: "move", notation: "Bd4", side: "w" },
                        { type: "text", content: "Ván Wosch-Daenen, LSS email 2007." }
                      ]
                    }
                  ]
                },
                {
                  type: "variation",
                  id: "A12",
                  title: "A12) 4...exd4",
                  flow: [
                    { type: "move", notation: "exd4", side: "b" },
                    { type: "move", notation: "e5", side: "w", moveEval: "!" },
                    { type: "text", content: "Nước đi này rất thuyết phục, Vua Đen rơi vào tầm ngắm. Nước 5...d6 và các nước sau đó gần như bắt buộc." },
                    {
                      type: "variation",
                      id: "A12_sideline",
                      title: "Biến phụ 5...Bb4+?!",
                      flow: [
                        { type: "move", notation: "Bb4+", side: "b", moveEval: "?!" },
                        { type: "move", notation: "c3", side: "w", moveEval: "!" },
                        { type: "move", notation: "dxc3", side: "b" },
                        { type: "move", notation: "bxc3", side: "w" },
                        { type: "move", notation: "Bf8", side: "b", moveEval: "?" },
                        { type: "text", content: "(Nếu 7...d5 8.Bxd5 Bc5 9.Ba3 Bxa3 10.Nxa3 Nge7 11.c4 Trắng ưu thế ±)." },
                        { type: "move", notation: "Bg5", side: "w" },
                        { type: "move", notation: "Nge7", side: "b" },
                        { type: "move", notation: "Qb3", side: "w" },
                        { type: "move", notation: "d5", side: "b" },
                        { type: "move", notation: "exd6", side: "w" },
                        { type: "move", notation: "Qxd6", side: "b" },
                        { type: "move", notation: "Bf7+", side: "w" },
                        { type: "move", notation: "Kd8", side: "b" },
                        { type: "move", notation: "O-O", side: "w", posEval: "+-" },
                        { type: "text", content: "Ván Burk-Holwell, corr 1990." }
                      ]
                    },
                    { type: "move", notation: "d6", side: "b" },
                    { type: "move", notation: "exd6", side: "w" },
                    {
                      type: "variation",
                      id: "A12_6Bxd6",
                      title: "Biến 6...Bxd6",
                      flow: [
                        { type: "move", notation: "Bxd6", side: "b" },
                        { type: "move", notation: "O-O", side: "w" },
                        { type: "move", notation: "Nf6", side: "b" },
                        { type: "move", notation: "Re1+", side: "w" },
                        { type: "move", notation: "Kf8", side: "b" },
                        { type: "move", notation: "c3", side: "w", posEval: "±" }
                      ]
                    },
                    { type: "move", notation: "Qxd6", side: "b" },
                    { type: "move", notation: "O-O", side: "w" },
                    { type: "move", notation: "Be7", side: "b" },
                    { type: "move", notation: "Re1", side: "w" },
                    { type: "move", notation: "Bd7", side: "b" },
                    { type: "move", notation: "Ng5", side: "w" },
                    { type: "move", notation: "Nh6", side: "b" },
                    { type: "move", notation: "Ne6!", side: "w", moveEval: "!" },
                    { type: "move", notation: "Bxe6", side: "b" },
                    { type: "move", notation: "Rxe6", side: "w" },
                    { type: "move", notation: "Qc5", side: "b" },
                    { type: "move", notation: "b3!", side: "w", moveEval: "!" },
                    { type: "move", notation: "O-O-O", side: "b" },
                    { type: "move", notation: "Ba3", side: "w" },
                    { type: "move", notation: "Nb4", side: "b" },
                    { type: "move", notation: "Qe1!", side: "w", moveEval: "!" },
                    { type: "move", notation: "Nxc2", side: "b" },
                    { type: "move", notation: "Bxc5", side: "w" },
                    { type: "move", notation: "Nxe1", side: "b" },
                    { type: "move", notation: "Rxe7", side: "w" },
                    { type: "move", notation: "Nc2", side: "b" },
                    { type: "move", notation: "Na3", side: "w" },
                    { type: "move", notation: "Nxa1", side: "b" },
                    { type: "move", notation: "Nb5!", side: "w", moveEval: "!" },
                    {
                      type: "variation",
                      id: "A12_18d3",
                      title: "18...d3?",
                      flow: [
                        { type: "move", notation: "d3", side: "b", moveEval: "?" },
                        { type: "move", notation: "Bxa7!", side: "w", moveEval: "!", posEval: "+-" }
                      ]
                    },
                    {
                      type: "variation",
                      id: "A12_18Rhe8",
                      title: "18...Rhe8",
                      flow: [
                        { type: "move", notation: "Rhe8", side: "b" },
                        { type: "move", notation: "Be6+", side: "w" },
                        { type: "move", notation: "Kb8", side: "b" },
                        { type: "move", notation: "Bxa7+", side: "w" },
                        { type: "move", notation: "Ka8", side: "b" },
                        { type: "move", notation: "Rxe8", side: "w" },
                        { type: "move", notation: "Rxe8", side: "b" },
                        { type: "move", notation: "Nc7+", side: "w" },
                        { type: "move", notation: "Kxa7", side: "b" },
                        { type: "move", notation: "Nxe8", side: "w" },
                        { type: "move", notation: "d3", side: "b" },
                        { type: "move", notation: "Kf1", side: "w" },
                        { type: "move", notation: "g6", side: "b" },
                        { type: "move", notation: "Bc4", side: "w", posEval: "±" }
                      ]
                    },
                    { type: "move", notation: "b6", side: "b" },
                    { type: "move", notation: "Bb4", side: "w" },
                    { type: "move", notation: "d3", side: "b" },
                    { type: "move", notation: "Bd2", side: "w" },
                    { type: "move", notation: "g5?!", side: "b", moveEval: "?!" },
                    { type: "move", notation: "Nxc7", side: "w", posEval: "+-" },
                    { type: "text", content: "Ván Voracek-Vegjeleki, ICCF email 2007." }
                  ]
                },
                {
                  type: "variation",
                  id: "A13",
                  title: "A13) 4...d6",
                  flow: [
                    { type: "move", notation: "d6", side: "b" },
                    { type: "move", notation: "Ng5", side: "w" },
                    { type: "move", notation: "Nh6", side: "b" },
                    { type: "text", content: "(Ván Gardner-Jung, Brantford 1999)" },
                    { type: "move", notation: "d5!", side: "w", moveEval: "!" },
                    { type: "move", notation: "Ne7", side: "b" },
                    { type: "move", notation: "Nc3", side: "w" }
                  ]
                }
              ]
            },
            {
              type: "variation",
              id: "A2",
              title: "A2) Trắng củng cố với 4.d3",
              flow: [
                { type: "move", notation: "d3", side: "w" },
                {
                  type: "variation",
                  id: "A2_4Nf6",
                  title: "Nhánh 4...Nf6",
                  flow: [{ type: "move", notation: "Nf6", side: "b" }]
                },
                { type: "move", notation: "d6", side: "b" },
                { type: "move", notation: "O-O", side: "w" },
                {
                  type: "variation",
                  id: "A2_5f4",
                  title: "Biến 5...f4",
                  flow: [
                    { type: "move", notation: "f4", side: "b" },
                    { type: "move", notation: "d4!", side: "w", moveEval: "!" },
                    { type: "move", notation: "Bg4", side: "b" },
                    { type: "move", notation: "Bb5", side: "w" },
                    { type: "move", notation: "Nge7", side: "b" },
                    { type: "move", notation: "d5", side: "w" },
                    { type: "move", notation: "a6", side: "b" },
                    { type: "move", notation: "Be2", side: "w" }
                  ]
                },
                { type: "move", notation: "Be7", side: "b" },
                { type: "move", notation: "Nc3", side: "w" },
                { type: "move", notation: "Bf6", side: "b" },
                { type: "move", notation: "b4!?", side: "w", moveEval: "!?" },
                {
                  type: "variation",
                  id: "A2_7Nxb4",
                  title: "7...Nxb4",
                  flow: [
                    { type: "move", notation: "Nxb4", side: "b" },
                    { type: "move", notation: "Rb1", side: "w" },
                    { type: "move", notation: "Nc6", side: "b" },
                    { type: "move", notation: "exf5", side: "w" },
                    { type: "move", notation: "Bxf5", side: "b" },
                    { type: "move", notation: "d4", side: "w" },
                    { type: "move", notation: "Nge7", side: "b" },
                    { type: "move", notation: "dxe5", side: "w" },
                    { type: "move", notation: "dxe5", side: "b" },
                    { type: "move", notation: "Qe2", side: "w" }
                  ]
                },
                { type: "move", notation: "fxe4", side: "b" },
                { type: "move", notation: "dxe4", side: "w" },
                { type: "move", notation: "Nxb4", side: "b" },
                { type: "move", notation: "Rb1", side: "w" },
                { type: "move", notation: "Nc6", side: "b" },
                { type: "move", notation: "h3", side: "w" },
                { type: "text", content: "Trắng có thế trận tốt hơn." }
              ]
            }
          ]
        },

        // NHÁNH B: 3...Nd4?!
        {
          type: "variation_group",
          title: "B) 3...Nd4?!",
          flow: [
            { type: "move", notation: "Nd4", side: "b", moveEval: "?!" },
            { type: "text", content: "Nước 4.Nxe5?! Qg5! là một cạm bẫy cũ rất nổi tiếng. Dù thế cờ sau 5.Bxf7+ Kd8 6.O-O! Qxe5 7.c3 Ne6 8.d3 vẫn chưa rõ ràng, nhưng Trắng nên phản ứng một cách tự nhiên và thận trọng hơn." },
            { type: "move", notation: "Nxd4", side: "w" },
            { type: "move", notation: "exd4", side: "b" },
            { type: "move", notation: "O-O", side: "w" },
            { type: "move", notation: "Nf6", side: "b" },
            { type: "move", notation: "Re1", side: "w" },
            { type: "move", notation: "d6", side: "b" },
            { type: "move", notation: "c3", side: "w" },
            { type: "text", content: "Trắng dẫn trước về phát triển và kiểm soát trung tâm." }
          ]
        },

        // NHÁNH C: 3...h6?!
        {
          type: "variation_group",
          title: "C) 3...h6?!",
          flow: [
            { type: "move", notation: "h6", side: "b", moveEval: "?!" },
            { type: "text", content: "Nước này được chơi khá nhiều ở cấp độ nghiệp dư. Đen lo lắng về việc Mã nhảy lên g5, nhưng rõ ràng nước này làm mất thời gian quý báu." },
            { type: "move", notation: "O-O", side: "w" },
            {
              type: "variation",
              id: "C_4Bc5",
              title: "4...Bc5",
              flow: [
                { type: "move", notation: "Bc5", side: "b" },
                { type: "move", notation: "c3", side: "w" },
                { type: "text", content: "Tất nhiên, Trắng xây dựng một trung tâm mạnh mẽ." },
                { type: "move", notation: "d6", side: "b" },
                { type: "move", notation: "d4", side: "w" },
                {
                  type: "variation",
                  id: "C_6Bb6",
                  title: "6...Bb6",
                  flow: [
                    { type: "move", notation: "Bb6", side: "b" },
                    { type: "move", notation: "dxe5", side: "w" },
                    { type: "move", notation: "dxe5", side: "b" },
                    { type: "move", notation: "Qxd8+", side: "w" },
                    { type: "move", notation: "Nxd8", side: "b" },
                    { type: "move", notation: "Nxe5", side: "w", posEval: "±" }
                  ]
                },
                { type: "move", notation: "exd4", side: "b" },
                { type: "move", notation: "cxd4", side: "w" },
                { type: "move", notation: "Bb6", side: "b" },
                {
                  type: "variation",
                  id: "C_8Qb3",
                  title: "8.Qb3?!",
                  flow: [
                    { type: "move", notation: "Qb3", side: "w", moveEval: "?!" },
                    { type: "text", content: "(Ván Antonio-Ahmed, Ha Long City 2009)" },
                    { type: "move", notation: "Na5!", side: "b", moveEval: "!" },
                    { type: "move", notation: "Qa4+", side: "w" },
                    { type: "move", notation: "Bd7", side: "b" },
                    { type: "move", notation: "Bb5", side: "w" },
                    { type: "move", notation: "Nf6", side: "b", posEval: "∞" }
                  ]
                },
                { type: "move", notation: "Nc3", side: "w" },
                {
                  type: "variation",
                  id: "C_8Nf6",
                  title: "8...Nf6",
                  flow: [
                    { type: "move", notation: "Nf6", side: "b" },
                    { type: "move", notation: "h3", side: "w" },
                    { type: "move", notation: "O-O", side: "b" },
                    { type: "move", notation: "Re1", side: "w", posEval: "±" }
                  ]
                },
                {
                  type: "variation",
                  id: "C_8Bg4",
                  title: "8...Bg4",
                  flow: [
                    { type: "move", notation: "Bg4", side: "b" },
                    { type: "move", notation: "Bb5", side: "w", posEval: "±" }
                  ]
                },
                { type: "move", notation: "Nge7", side: "b" },
                { type: "move", notation: "h3", side: "w", posEval: "±" }
              ]
            },
            { type: "move", notation: "Nf6", side: "b" },
            { type: "move", notation: "d4!", side: "w", moveEval: "!" },
            { type: "text", content: "Khai thác thứ tự nước đi kém của Đen." },
            { type: "move", notation: "exd4", side: "b" },
            { type: "move", notation: "e5!", side: "w", moveEval: "!" },
            { type: "move", notation: "d5", side: "b" },
            { type: "move", notation: "Bb5", side: "w" },
            { type: "move", notation: "Ne4", side: "b" },
            { type: "move", notation: "Nxd4", side: "w" },
            { type: "move", notation: "Bd7", side: "b" },
            { type: "move", notation: "Bxc6", side: "w" },
            {
              type: "variation",
              id: "C_9e6",
              title: "9.e6!?",
              flow: [
                { type: "move", notation: "e6", side: "w", moveEval: "!?" },
                { type: "move", notation: "fxe6", side: "b" },
                { type: "move", notation: "Bxc6", side: "w" },
                { type: "move", notation: "bxc6", side: "b" },
                { type: "move", notation: "Qh5+", side: "w" },
                { type: "move", notation: "Ke7", side: "b" },
                { type: "move", notation: "Nd2", side: "w" },
                { type: "move", notation: "Nf6", side: "b" },
                { type: "text", content: "(Ván Antal-Sandi, Indianapolis 2009)" },
                { type: "move", notation: "Qe2!", side: "w", moveEval: "!" },
                { type: "text", content: "Dù vậy, không rõ Trắng có đủ bù đắp hay không." }
              ]
            },
            { type: "move", notation: "bxc6", side: "b" },
            { type: "text", content: "Dẫn đến một thế trận lý thuyết quen thuộc (thường sau 3...Nf6 4.d4), nơi Trắng có nước 0-0 hữu ích trong khi Đen mất thời gian với ...h7-h6." },
            { type: "move", notation: "f3", side: "w" },
            { type: "move", notation: "Ng5", side: "b" },
            { type: "move", notation: "f4", side: "w" },
            { type: "move", notation: "Ne4", side: "b" },
            { type: "move", notation: "Nc3!", side: "w", moveEval: "!" },
            { type: "text", content: "Phá hủy quân Mã mạnh ở e4." },
            {
              type: "variation",
              id: "C_12Nxc3",
              title: "12...Nxc3",
              flow: [
                { type: "move", notation: "Nxc3", side: "b" },
                { type: "move", notation: "bxc3", side: "w" },
                { type: "move", notation: "c5", side: "b" },
                { type: "move", notation: "e6!", side: "w", moveEval: "!", posEval: "±" }
              ]
            },
            {
              type: "variation",
              id: "C_12Bc5",
              title: "12...Bc5",
              flow: [
                { type: "move", notation: "Bc5", side: "b" },
                { type: "move", notation: "Nxe4", side: "w" },
                { type: "move", notation: "dxe4", side: "b" },
                { type: "move", notation: "Be3", side: "w" },
                { type: "move", notation: "O-O", side: "b" },
                { type: "move", notation: "Qe2", side: "w", posEval: "±" }
              ]
            },
            { type: "move", notation: "c5", side: "b" },
            { type: "move", notation: "Ne2", side: "w" },
            { type: "move", notation: "Nxc3", side: "b" },
            { type: "move", notation: "bxc3!", side: "w", moveEval: "!" },
            { type: "text", content: "Trắng đe dọa tấn công cánh Vua bằng f4-f5." }
          ]
        },

        // NHÁNH D: 3...d6
        {
          type: "variation_group",
          title: "D) 3...d6",
          flow: [
            { type: "move", notation: "d6", side: "b" },
            { type: "text", content: "Sau nước đi khiêm tốn này, Trắng có thể chọn chiếm trung tâm ngay hoặc chuyển về Chương 3. Nước 4.c3! khách quan tốt hơn 4.O-O vì nó dẫn đến ưu thế trong mọi nhánh." },
            {
              type: "variation",
              id: "D_4OO",
              title: "Biến 4.O-O",
              flow: [
                { type: "move", notation: "O-O", side: "w" },
                {
                  type: "variation",
                  id: "D_4Be7",
                  title: "4...Be7",
                  flow: [
                    { type: "move", notation: "Be7", side: "b" },
                    { type: "move", notation: "a4", side: "w" },
                    { type: "move", notation: "Nf6", side: "b" },
                    { type: "move", notation: "d3", side: "w" },
                    { type: "move", notation: "O-O", side: "b" },
                    { type: "move", notation: "Re1", side: "w" },
                    { type: "text", content: "Dẫn đến Chương 3." }
                  ]
                },
                { type: "move", notation: "Nf6", side: "b" },
                { type: "move", notation: "Re1", side: "w" },
                {
                  type: "variation",
                  id: "D_5Nxe4",
                  title: "5...Nxe4??",
                  flow: [
                    { type: "move", notation: "Nxe4", side: "b", moveEval: "??" },
                    { type: "move", notation: "Rxe4", side: "w" },
                    { type: "move", notation: "d5", side: "b" },
                    { type: "move", notation: "Nxe5!", side: "w", moveEval: "!", posEval: "+-" }
                  ]
                },
                { type: "move", notation: "Be7", side: "b" },
                { type: "move", notation: "a4!", side: "w", moveEval: "!" },
                { type: "text", content: "Nếu 6.d3 cho phép 6...Na5! và Trắng không thể tránh việc bị đổi mất quân Tượng ô trắng tốt." },
                {
                  type: "variation",
                  id: "D_6Nxe4",
                  title: "6...Nxe4",
                  flow: [
                    { type: "move", notation: "Nxe4", side: "b" },
                    { type: "move", notation: "Rxe4", side: "w" },
                    { type: "move", notation: "d5", side: "b" },
                    { type: "move", notation: "Bxd5", side: "w" },
                    { type: "move", notation: "Qxd5", side: "b" },
                    { type: "move", notation: "Nc3", side: "w" },
                    { type: "move", notation: "Qa5", side: "b" },
                    { type: "move", notation: "Rb1!", side: "w", moveEval: "!" },
                    { type: "move", notation: "O-O", side: "b" },
                    { type: "move", notation: "Nxe5!", side: "w", moveEval: "!" },
                    { type: "move", notation: "Nxe5", side: "b" },
                    { type: "move", notation: "b4", side: "w" },
                    { type: "move", notation: "Bxb4", side: "b" },
                    { type: "move", notation: "Rxb4", side: "w" },
                    { type: "move", notation: "Ng6", side: "b" },
                    { type: "move", notation: "Ba3", side: "w" },
                    { type: "move", notation: "Qa6", side: "b" },
                    { type: "move", notation: "h4", side: "w", posEval: "±" }
                  ]
                },
                { type: "move", notation: "O-O", side: "b" },
                { type: "move", notation: "d3", side: "w" },
                { type: "text", content: "Dẫn đến Chương 3." }
              ]
            },
            { type: "move", notation: "c3!", side: "w", moveEval: "!" },
            {
              type: "variation",
              id: "D1",
              title: "D1) 4...Nf6?!",
              flow: [
                { type: "move", notation: "Nf6", side: "b", moveEval: "?!" },
                {
                  type: "variation",
                  id: "D1_5Be6",
                  title: "5...Be6",
                  flow: [
                    { type: "move", notation: "Be6", side: "b" },
                    { type: "move", notation: "Nxe6!", side: "w", moveEval: "!" },
                    { type: "move", notation: "fxe6", side: "b" },
                    { type: "move", notation: "Qb3!", side: "w", moveEval: "!", posEval: "±" }
                  ]
                },
                { type: "move", notation: "Ng5!", side: "w", moveEval: "!" },
                { type: "move", notation: "d5", side: "b" },
                { type: "move", notation: "exd5", side: "w" },
                { type: "text", content: "Đây là thế trận quen thuộc sau 3.Bc4 Nf6 4.Ng5 d5. Ở đây Trắng có thêm nhịp vì Đen đã đi d7-d6 rồi mới d6-d5." },
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
                { type: "text", content: "Trắng có đòn tấn công cực mạnh, được xác nhận bởi nhiều ván thư tín." }
              ]
            },
            {
              type: "variation",
              id: "D2",
              title: "D2) 4...Be7",
              flow: [
                { type: "move", notation: "Be7", side: "b" },
                { type: "move", notation: "Qb3!", side: "w", moveEval: "!" },
                { type: "move", notation: "Nh6", side: "b" },
                {
                  type: "variation",
                  id: "D2_5Na5",
                  title: "5...Na5?",
                  flow: [
                    { type: "move", notation: "Na5", side: "b", moveEval: "?" },
                    { type: "move", notation: "Bxf7+", side: "w" },
                    { type: "move", notation: "Kf8", side: "b" },
                    { type: "move", notation: "Qa4", side: "w" },
                    { type: "move", notation: "Kxf7", side: "b" },
                    { type: "move", notation: "Qxa5", side: "w", posEval: "±" },
                    { type: "text", content: "Trắng hơn hẳn một tốt." }
                  ]
                },
                { type: "move", notation: "d4", side: "w" },
                { type: "move", notation: "O-O", side: "b" },
                {
                  type: "variation",
                  id: "D2_6Na5",
                  title: "6...Na5?",
                  flow: [
                    { type: "move", notation: "Na5", side: "b", moveEval: "?" },
                    { type: "move", notation: "Qa4+", side: "w" },
                    { type: "move", notation: "c6", side: "b" },
                    { type: "move", notation: "Be2", side: "w", posEval: "±" }
                  ]
                },
                { type: "move", notation: "Bxh6", side: "w" },
                { type: "move", notation: "gxh6", side: "b" },
                { type: "text", content: "Trắng có cấu trúc tốt hơn và ưu thế nhỏ. Ví dụ ván Mujunen-Zhuravlev, ICCF email 2014." },
                { type: "move", notation: "O-O", side: "w" },
                { type: "move", notation: "Na5", side: "b" },
                { type: "move", notation: "Qa4", side: "w" },
                { type: "move", notation: "Nxc4", side: "b" },
                { type: "move", notation: "Qxc4", side: "w" },
                { type: "move", notation: "Bg4", side: "b" },
                { type: "move", notation: "Nbd2", side: "w" },
                { type: "move", notation: "Bg5", side: "b" },
                { type: "move", notation: "Re1", side: "w" },
                { type: "move", notation: "c5", side: "b" },
                { type: "move", notation: "Qd3", side: "w" },
                { type: "move", notation: "Rc8", side: "b" },
                { type: "move", notation: "Nxg5", side: "w" },
                { type: "move", notation: "hxg5", side: "b" },
                { type: "move", notation: "Nf1", side: "w" },
                { type: "move", notation: "exd4", side: "b" },
                { type: "move", notation: "cxd4", side: "w" },
                { type: "move", notation: "Qf6", side: "b" },
                { type: "move", notation: "Qg3", side: "w" },
                { type: "move", notation: "Qf4", side: "b" },
                { type: "move", notation: "Ne3", side: "w", posEval: "±" }
              ]
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
                { type: "move", notation: "gxf3", side: "w", posEval: "±" }
              ]
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
                  id: "D4_6Nxe4",
                  title: "6...Nxe4",
                  flow: [
                    { type: "move", notation: "Nxe4", side: "b" },
                    { type: "move", notation: "dxe5", side: "w" },
                    {
                      type: "variation",
                      id: "D4_7Be7",
                      title: "7...Be7",
                      flow: [
                        { type: "move", notation: "Be7", side: "b" },
                        { type: "move", notation: "Re1", side: "w" },
                        { type: "move", notation: "Bf5", side: "b" },
                        { type: "move", notation: "Nd4!", side: "w", moveEval: "!" },
                        { type: "move", notation: "cxd4", side: "w", posEval: "±" },
                        { type: "text", content: "Ván Zelcic-Krnic, Zadar 1994." }
                      ]
                    },
                    { type: "move", notation: "Be6?!", side: "b", moveEval: "?!" }
                  ]
                },
                { type: "move", notation: "Re1", side: "w" },
                { type: "move", notation: "O-O", side: "b" },
                { type: "move", notation: "h3", side: "w" }
              ]
            }
          ]
        },

        // NHÁNH E: 3...Be7
        {
          type: "variation_group",
          title: "Nhánh E) 3...Be7",
          flow: [
            { type: "move", notation: "Be7", side: "b" },
            { type: "text", content: "Như sau 3...d6, Trắng có thể chọn chuyển sang Chương 3 hoặc tìm ưu thế bằng lối chơi lắt léo." },
            {
              type: "variation",
              id: "E_4OO",
              title: "Biến 4.O-O",
              flow: [
                { type: "move", notation: "O-O", side: "w" },
                { type: "move", notation: "Nf6", side: "b" },
                {
                  type: "variation",
                  id: "E_4d6",
                  title: "4...d6",
                  flow: [
                    { type: "move", notation: "d6", side: "b" },
                    { type: "move", notation: "a4", side: "w" },
                    { type: "move", notation: "Nf6", side: "b" },
                    { type: "move", notation: "d3", side: "w" },
                    { type: "move", notation: "O-O", side: "b" },
                    { type: "move", notation: "Re1", side: "w" }
                  ]
                },
                { type: "move", notation: "d3", side: "w" },
                { type: "move", notation: "O-O", side: "b" },
                { type: "move", notation: "Re1", side: "w" },
                { type: "text", content: "Dẫn đến Chương 3." }
              ]
            },
            { type: "move", notation: "d4", side: "w" },
            {
              type: "variation",
              id: "E_4d6_central",
              title: "4...d6",
              flow: [
                { type: "move", notation: "d6", side: "b" },
                { type: "move", notation: "d5", side: "w" },
                { type: "text", content: "Các máy tính thích nước này vì chúng thích chiếm không gian. Một lựa chọn khác là 5.dxe5 dxe5 6.Qxd8+ Bxd8 7.Nc3 (như ván Vasiukov-Gheorghiu, Manila 1974)." },
                { type: "move", notation: "Nb8", side: "b" },
                { type: "move", notation: "Bd3", side: "w" },
                { type: "move", notation: "Nf6", side: "b" },
                { type: "move", notation: "c4", side: "w" },
                { type: "move", notation: "Nbd7", side: "b" },
                { type: "move", notation: "Nc3", side: "w" },
                { type: "move", notation: "a5", side: "b" },
                { type: "move", notation: "h3", side: "w" },
                { type: "move", notation: "Nc5", side: "b" },
                { type: "move", notation: "Bc2", side: "w" },
                { type: "move", notation: "O-O", side: "b" },
                { type: "move", notation: "Be3", side: "w" },
                { type: "move", notation: "b6", side: "b" },
                { type: "move", notation: "a3", side: "w", posEval: "±" },
                { type: "text", content: "Trắng có một phiên bản tốt của cấu trúc 'King's Indian'." }
              ]
            },
            { type: "move", notation: "exd4", side: "b" },
            { type: "move", notation: "c3!?", side: "w", moveEval: "!?" },
            { type: "text", content: "Sau nước này, Đen rất dễ đi lạc lối." },
            {
              type: "variation",
              id: "E1",
              title: "E1) 5...d6?!",
              flow: [
                { type: "move", notation: "d6", side: "b", moveEval: "?!" },
                { type: "move", notation: "Qb3", side: "w" },
                { type: "move", notation: "Na5", side: "b" },
                { type: "move", notation: "Bxf7+", side: "w" },
                { type: "move", notation: "Kf8", side: "b" },
                { type: "move", notation: "Qa4", side: "w" },
                { type: "move", notation: "Kxf7", side: "b" },
                { type: "move", notation: "Qxa5", side: "w" },
                { type: "move", notation: "Nf6", side: "b" },
                { type: "move", notation: "cxd4", side: "w", posEval: "±" }
              ]
            },
            {
              type: "variation",
              id: "E2",
              title: "E2) 5...dxc3?!",
              flow: [
                { type: "move", notation: "dxc3", side: "b", moveEval: "?!" },
                { type: "move", notation: "Qd5!", side: "w", moveEval: "!" },
                { type: "text", content: "Nhiều ván đã bị đầu hàng ngay tại đây, nhưng Đen vẫn có thể cố chiến đấu tiếp." },
                { type: "move", notation: "Nh6", side: "b" },
                { type: "move", notation: "Bxh6", side: "w" },
                { type: "move", notation: "O-O", side: "b" },
                { type: "move", notation: "Bxg7", side: "w" },
                { type: "move", notation: "Kxg7", side: "b" },
                { type: "move", notation: "Nxc3", side: "w" },
                { type: "move", notation: "d6", side: "b" },
                { type: "move", notation: "Qd3", side: "w" }
              ]
            },
            {
              type: "variation",
              id: "E3",
              title: "E3) 5...d3",
              flow: [
                { type: "move", notation: "d3", side: "b" },
                { type: "move", notation: "Qb3", side: "w" },
                { type: "move", notation: "Na5", side: "b" },
                { type: "move", notation: "Bxf7+", side: "w" },
                { type: "move", notation: "Kf8", side: "b" },
                { type: "move", notation: "Qa4", side: "w" },
                { type: "move", notation: "Kxf7", side: "b" },
                { type: "move", notation: "Qxa5", side: "w" },
                { type: "move", notation: "d5", side: "b" },
                { type: "move", notation: "Ne5+", side: "w" },
                { type: "move", notation: "Kf8", side: "b" },
                { type: "move", notation: "Qxd5", side: "w" },
                { type: "move", notation: "Qxd5", side: "b" },
                { type: "move", notation: "exd5", side: "w", posEval: "±" }
              ]
            },
            {
              type: "variation",
              id: "E4",
              title: "E4) 5...Nf6?!",
              flow: [
                { type: "move", notation: "Nf6", side: "b", moveEval: "?!" },
                { type: "move", notation: "e5", side: "w" },
                { type: "move", notation: "Ne4", side: "b" },
                { type: "move", notation: "Bd5!", side: "w", moveEval: "!", posEval: "±" }
              ]
            },
            {
              type: "variation",
              id: "E5",
              title: "E5) 5...Na5!",
              flow: [
                { type: "move", notation: "Na5", side: "b", moveEval: "!" },
                { type: "move", notation: "Be2", side: "w" },
                {
                  type: "variation",
                  id: "E5_6d5",
                  title: "6...d5",
                  flow: [
                    { type: "move", notation: "d5", side: "b" },
                    { type: "move", notation: "Qa4+", side: "w" },
                    { type: "move", notation: "c6", side: "b" },
                    { type: "move", notation: "exd5", side: "w" },
                    { type: "move", notation: "Nf6", side: "b" },
                    { type: "move", notation: "dxc6", side: "w" },
                    { type: "move", notation: "Nxc6", side: "b" },
                    { type: "move", notation: "Nxd4", side: "w", posEval: "±" }
                  ]
                },
                { type: "move", notation: "dxc3", side: "b" },
                { type: "move", notation: "Nxc3", side: "w" },
                { type: "move", notation: "d6", side: "b" },
                { type: "move", notation: "O-O", side: "w" },
                {
                  type: "variation",
                  id: "E5_8Nc6",
                  title: "8...Nc6",
                  flow: [
                    { type: "move", notation: "Nc6", side: "b" },
                    { type: "move", notation: "Qb3", side: "w" },
                    { type: "move", notation: "Nf6", side: "b" },
                    { type: "move", notation: "Rd1", side: "w" },
                    { type: "move", notation: "Nd7", side: "b" },
                    { type: "move", notation: "Be3", side: "w" },
                    { type: "move", notation: "O-O", side: "b" },
                    { type: "move", notation: "h3", side: "w" },
                    { type: "move", notation: "Qe8", side: "b" },
                    { type: "move", notation: "Rac1", side: "w" },
                    { type: "text", content: "Ván Ardelean-Pessi, Baile Olanesti 2010." }
                  ]
                },
                { type: "move", notation: "Nf6", side: "b" },
                { type: "move", notation: "Qa4+", side: "w" },
                { type: "move", notation: "Nc6", side: "b" },
                { type: "move", notation: "e5", side: "w" },
                {
                  type: "variation",
                  id: "E5_10Nd7",
                  title: "10...Nd7",
                  flow: [
                    { type: "move", notation: "Nd7", side: "b" },
                    { type: "text", content: "(Ván Andriasyan-Erturan, Dresden Ech 2007)" },
                    { type: "move", notation: "Qg4!", side: "w", moveEval: "!" },
                    {
                      type: "variation",
                      id: "E5_11OO",
                      title: "11...O-O",
                      flow: [
                        { type: "move", notation: "O-O", side: "b" },
                        { type: "move", notation: "Bxh6", side: "w" },
                        { type: "move", notation: "g6", side: "b" },
                        { type: "move", notation: "Bxf8", side: "w", posEval: "+-" }
                      ]
                    },
                    {
                      type: "variation",
                      id: "E5_11Ndxe5",
                      title: "11...Ndxe5",
                      flow: [
                        { type: "move", notation: "Ndxe5", side: "b" },
                        { type: "move", notation: "Qxg7", side: "w" },
                        { type: "move", notation: "Bf6", side: "b" },
                        { type: "move", notation: "Qh6", side: "w", posEval: "+-" }
                      ]
                    },
                    { type: "move", notation: "Kf8", side: "b" },
                    { type: "move", notation: "exd6", side: "w" },
                    { type: "move", notation: "Bxd6", side: "b" },
                    { type: "move", notation: "Bg5", side: "w", posEval: "±" }
                  ]
                },
                { type: "move", notation: "dxe5", side: "b" },
                { type: "move", notation: "Nxe5", side: "w" },
                {
                  type: "variation",
                  id: "E5_11OO",
                  title: "11...O-O",
                  flow: [
                    { type: "move", notation: "O-O", side: "b" },
                    { type: "move", notation: "Rd1", side: "w" },
                    { type: "move", notation: "Bd6", side: "b" },
                    { type: "move", notation: "Nc4", side: "w" },
                    { type: "move", notation: "Be6", side: "b" },
                    { type: "move", notation: "Nxd6", side: "w" },
                    { type: "move", notation: "cxd6", side: "b" },
                    { type: "move", notation: "Qh4", side: "w" },
                    { type: "move", notation: "d5", side: "b" },
                    { type: "move", notation: "Bg5", side: "w" },
                    { type: "move", notation: "h6", side: "b" },
                    { type: "move", notation: "Bxf6", side: "w" },
                    { type: "move", notation: "Qxf6", side: "b" },
                    { type: "move", notation: "Qxf6", side: "w" },
                    { type: "move", notation: "gxf6", side: "b" },
                    { type: "move", notation: "Nxd5", side: "w", posEval: "±" }
                  ]
                },
                { type: "move", notation: "Bd7", side: "b" },
                { type: "text", content: "Ván A. Horvath-Pastor Alonso de Prado, Madrid 2012." },
                { type: "move", notation: "Nxd7!", side: "w", moveEval: "!" },
                {
                  type: "variation",
                  id: "E5_12Nxd7",
                  title: "12...Nxd7",
                  flow: [
                    { type: "move", notation: "Nxd7", side: "b" },
                    { type: "move", notation: "Rd1", side: "w" },
                    { type: "move", notation: "O-O", side: "b" },
                    { type: "move", notation: "Bf4", side: "w" },
                    { type: "move", notation: "Bd6", side: "b" },
                    { type: "move", notation: "Bxd6", side: "w" },
                    { type: "move", notation: "cxd6", side: "b" },
                    { type: "move", notation: "Rxd6", side: "w" },
                    { type: "move", notation: "Qe7", side: "b" },
                    { type: "move", notation: "Rad1", side: "w", posEval: "±" }
                  ]
                },
                { type: "move", notation: "Qxd7", side: "b" },
                { type: "move", notation: "Rd1", side: "w" },
                { type: "move", notation: "Qc8", side: "b" },
                {
                  type: "variation",
                  id: "E5_13Bd6",
                  title: "13...Bd6?!",
                  flow: [
                    { type: "move", notation: "Bd6", side: "b", moveEval: "?!" },
                    { type: "move", notation: "Bg5", side: "w" },
                    { type: "move", notation: "O-O", side: "b" },
                    { type: "move", notation: "Bxf6", side: "w" },
                    { type: "move", notation: "gxf6", side: "b" },
                    { type: "move", notation: "Qh4", side: "w", posEval: "±" }
                  ]
                },
                { type: "move", notation: "Bf4", side: "w", posEval: "±" }
              ]
            }
          ]
        },

        // 3...g6 (Bản Chi Tiết)
        {
          type: "variation_group",
          title: "Biến 3...g6",
          flow: [
            { type: "move", notation: "g6", side: "b" },
            { type: "text", content: "Một nỗ lực nghiêm túc để tránh lý thuyết. Đen muốn phát triển Tượng lên g7 và Mã lên e7." },
            { type: "move", notation: "d4!", side: "w", moveEval: "!" },
            { type: "text", content: "Một phản ứng tốt. Trắng ngay lập tức tấn công trung tâm do dẫn trước về phát triển." },
            { type: "move", notation: "exd4", side: "b" },
            {
              type: "variation",
              id: "g6_5Nxd4",
              title: "Biến 5.Nxd4",
              flow: [
                { type: "move", notation: "Nxd4", side: "w" },
                { type: "move", notation: "Bg7", side: "b" },
                { type: "move", notation: "Nxc6", side: "w" },
                { type: "move", notation: "bxc6", side: "b" },
                { type: "move", notation: "O-O", side: "w" },
                { type: "move", notation: "Ne7", side: "b" },
                { type: "move", notation: "Nc3", side: "w" },
                { type: "move", notation: "O-O", side: "b" },
                { type: "move", notation: "Bg5", side: "w" },
                { type: "move", notation: "d6", side: "b" },
                { type: "move", notation: "Qd2", side: "w" },
                { type: "move", notation: "Be6", side: "b" },
                { type: "move", notation: "Bb3", side: "w" },
                { type: "move", notation: "Qd7", side: "b" },
                { type: "move", notation: "Rfe1", side: "w" },
                { type: "move", notation: "Rfe8", side: "b" },
                { type: "text", content: "(Ván Ganguly-Mamedyarov, Doha 2014)" },
                { type: "move", notation: "Rad1", side: "w" },
                { type: "text", content: "Trắng đứng tốt hơn một chút." }
              ]
            },
            { type: "move", notation: "c3!", side: "w", moveEval: "!" },
            {
              type: "variation",
              id: "g6_A",
              title: "A) 5...Bg7",
              flow: [
                { type: "move", notation: "Bg7", side: "b" },
                { type: "move", notation: "cxd4", side: "w" },
                { type: "text", content: "Thế trận này hứa hẹn ưu thế cho Trắng nhờ khả năng kiểm soát trung tâm tốt hơn." },
                { type: "move", notation: "d6", side: "b" },
                {
                  type: "variation",
                  id: "g6_A_6Ne7",
                  title: "6...Ne7",
                  flow: [
                    { type: "move", notation: "Ne7", side: "b" },
                    { type: "text", content: "(Ván Lapshun-Guramishvili, Banyoles 2007)" },
                    { type: "move", notation: "d5!", side: "w", moveEval: "!" },
                    { type: "move", notation: "Na5", side: "b" },
                    {
                      type: "variation",
                      id: "g6_A_7Nb8",
                      title: "7...Nb8?!",
                      flow: [
                        { type: "move", notation: "Nb8", side: "b", moveEval: "?!" },
                        { type: "move", notation: "d6!", side: "w", moveEval: "!" }
                      ]
                    },
                    { type: "move", notation: "Be2", side: "w" },
                    { type: "move", notation: "O-O", side: "b" },
                    { type: "move", notation: "O-O", side: "w" },
                    { type: "move", notation: "d6", side: "b" },
                    { type: "move", notation: "Nc3", side: "w" }
                  ]
                },
                {
                  type: "variation",
                  id: "g6_A1",
                  title: "A1) 7.Qb3",
                  flow: [
                    { type: "move", notation: "Qb3", side: "w" },
                    { type: "move", notation: "Qd7", side: "b" },
                    { type: "text", content: "(Ván Flores-Pina Gomez, Villa Ballester 2004)" },
                    { type: "move", notation: "Bd2!", side: "w", moveEval: "!" },
                    { type: "move", notation: "a6", side: "b" },
                    {
                      type: "variation",
                      id: "g6_A1_8Nxd4",
                      title: "8...Nxd4",
                      flow: [
                        { type: "move", notation: "Nxd4", side: "b" },
                        { type: "move", notation: "Nxd4", side: "w" },
                        { type: "move", notation: "Bxd4", side: "b" },
                        { type: "move", notation: "Bxf7+", side: "w" },
                        { type: "move", notation: "Qxf7", side: "b" },
                        { type: "move", notation: "Qa4+", side: "w" },
                        { type: "move", notation: "Bd7", side: "b" },
                        { type: "move", notation: "Qxd4", side: "w" },
                        { type: "move", notation: "Nf6", side: "b" },
                        { type: "move", notation: "Nc3", side: "w" }
                      ]
                    },
                    { type: "move", notation: "d5", side: "w" },
                    { type: "move", notation: "Ne5", side: "b" },
                    { type: "move", notation: "Nxe5", side: "w" },
                    { type: "move", notation: "Bxe5", side: "b" },
                    { type: "move", notation: "O-O", side: "w" },
                    { type: "move", notation: "Qe7", side: "b" },
                    { type: "move", notation: "Re1", side: "w" },
                    { type: "move", notation: "Nf6", side: "b" },
                    { type: "move", notation: "f4", side: "w" },
                    { type: "move", notation: "Bd4+", side: "b" },
                    { type: "move", notation: "Be3", side: "w" },
                    { type: "move", notation: "Bxe3+", side: "b" },
                    { type: "move", notation: "Qxe3", side: "w" },
                    { type: "move", notation: "O-O", side: "b" },
                    { type: "move", notation: "Nc3", side: "w" }
                  ]
                },
                {
                  type: "variation",
                  id: "g6_A2",
                  title: "A2) 7.d5",
                  flow: [
                    { type: "move", notation: "d5", side: "w" },
                    { type: "move", notation: "Ne7", side: "b" },
                    { type: "text", content: "(Ván Ptacnikova-Hj.Gretarsson, Reykjavik 2015)" },
                    { type: "move", notation: "O-O!", side: "w", moveEval: "!" },
                    { type: "move", notation: "Nf6", side: "b" },
                    { type: "move", notation: "Nc3", side: "w" },
                    { type: "move", notation: "O-O", side: "b" },
                    { type: "move", notation: "Bf4", side: "w" }
                  ]
                },
                {
                  type: "variation",
                  id: "g6_A3",
                  title: "A3) 7.O-O",
                  flow: [
                    { type: "move", notation: "O-O", side: "w" },
                    {
                      type: "variation",
                      id: "g6_A31",
                      title: "A31) 7...Nf6",
                      flow: [
                        { type: "move", notation: "Nf6", side: "b" },
                        { type: "move", notation: "Nc3", side: "w" },
                        { type: "move", notation: "O-O", side: "b" },
                        { type: "move", notation: "h3", side: "w" },
                        {
                          type: "variation",
                          id: "g6_A31_9Na5",
                          title: "9...Na5",
                          flow: [
                            { type: "move", notation: "Na5", side: "b" },
                            { type: "move", notation: "Bd3", side: "w" },
                            { type: "move", notation: "c5", side: "b" },
                            { type: "move", notation: "dxc5", side: "w" },
                            { type: "text", content: "(Hoặc 11.Bf4!? cxd4 12.Nb5 a6 13.Nxd6 Be6 14.e5 Nd5 15.Bg3)" },
                            { type: "move", notation: "dxc5", side: "b" },
                            { type: "text", content: "(Ván Hendrickson-Finegold, St Louis 2013)" },
                            { type: "move", notation: "Bg5!", side: "w", moveEval: "!" },
                            { type: "move", notation: "h6", side: "b" },
                            { type: "move", notation: "Be3", side: "w" }
                          ]
                        },
                        { type: "move", notation: "Nxe4", side: "b" },
                        { type: "move", notation: "Nxe4", side: "w" },
                        { type: "move", notation: "d5", side: "b" },
                        { type: "move", notation: "Bg5", side: "w" },
                        { type: "move", notation: "f6", side: "b" },
                        { type: "move", notation: "Nxf6+", side: "w" },
                        { type: "move", notation: "Bxf6", side: "b" },
                        { type: "move", notation: "Bxf6", side: "w" },
                        { type: "move", notation: "Rxf6", side: "b" },
                        { type: "text", content: "(Ván Krivokapic-Batricevic, Tivat 2011)" },
                        { type: "move", notation: "Bb3!", side: "w", moveEval: "!" }
                      ]
                    },
                    {
                      type: "variation",
                      id: "g6_A32",
                      title: "A32) 7...Nge7",
                      flow: [
                        { type: "move", notation: "Nge7", side: "b" },
                        { type: "move", notation: "Nc3", side: "w" },
                        { type: "move", notation: "O-O", side: "b" },
                        { type: "move", notation: "h3", side: "w" },
                        { type: "move", notation: "h6", side: "b" },
                        { type: "text", content: "(Ván Ramnath-Sidhant, Mumbai 2014)" },
                        { type: "move", notation: "Re1", side: "w" }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: "variation",
              id: "g6_B",
              title: "B) 5...dxc3?!",
              flow: [
                { type: "move", notation: "dxc3", side: "b", moveEval: "?!" },
                { type: "text", content: "Nước đi đáng nghi này hầu như chưa được kiểm chứng trong thực tế, và điều đó hoàn toàn có cơ sở." },
                {
                  type: "variation",
                  id: "g6_B1",
                  title: "B1) 6.Nxc3",
                  flow: [
                    { type: "move", notation: "Nxc3", side: "w" },
                    {
                      type: "variation",
                      id: "g6_B11",
                      title: "B11) 6...Bg7?!",
                      flow: [
                        { type: "move", notation: "Bg7", side: "b", moveEval: "?!" },
                        { type: "move", notation: "Qb3!", side: "w", moveEval: "!" },
                        {
                          type: "variation",
                          id: "g6_B11_7Nh6",
                          title: "7...Nh6",
                          flow: [
                            { type: "move", notation: "Nh6", side: "b" },
                            { type: "move", notation: "Bxh6", side: "w" },
                            { type: "move", notation: "Bxh6", side: "b" },
                            { type: "move", notation: "Bxf7+", side: "w" },
                            { type: "move", notation: "Kf8", side: "b" },
                            { type: "move", notation: "Bd5", side: "w" }
                          ]
                        },
                        { type: "move", notation: "Qe7", side: "b" },
                        { type: "move", notation: "Nd5!", side: "w", moveEval: "!" },
                        { type: "move", notation: "Qxe4+", side: "b" },
                        { type: "move", notation: "Be2!", side: "w", moveEval: "!" },
                        { type: "move", notation: "Kd8", side: "b" },
                        { type: "move", notation: "O-O", side: "w" },
                        {
                          type: "variation",
                          id: "g6_B11_10Nge7",
                          title: "10...Nge7",
                          flow: [
                            { type: "move", notation: "Nge7", side: "b" },
                            { type: "move", notation: "Bg5", side: "w" },
                            { type: "move", notation: "h6", side: "b" },
                            { type: "move", notation: "Nxe7", side: "w" },
                            { type: "move", notation: "Nxe7", side: "b" },
                            { type: "move", notation: "Bd3", side: "w" },
                            { type: "move", notation: "Qc6", side: "b" },
                            { type: "move", notation: "Rac1", side: "w", posEval: "+-" }
                          ]
                        },
                        { type: "move", notation: "Qxe2", side: "b" },
                        { type: "move", notation: "Bg5+", side: "w" },
                        { type: "move", notation: "f6", side: "b" },
                        { type: "move", notation: "Rfe1", side: "w", posEval: "+-" },
                        { type: "text", content: "Máy tính đề nghị Đen hy sinh Hậu để tránh thua ngay lập tức." }
                      ]
                    },
                    {
                      type: "variation",
                      id: "g6_B12",
                      title: "B12) 6...d6",
                      flow: [
                        { type: "move", notation: "d6", side: "b" },
                        { type: "text", content: "(Ván Reinert-Hvenekilde, Allerod 1984)" },
                        { type: "move", notation: "O-O!", side: "w", moveEval: "!" },
                        { type: "move", notation: "Bg7", side: "b" },
                        { type: "move", notation: "Bg5", side: "w" },
                        { type: "move", notation: "Nge7", side: "b" },
                        { type: "move", notation: "Qb3", side: "w" },
                        { type: "move", notation: "O-O", side: "b" },
                        { type: "move", notation: "Nd5", side: "w" },
                        { type: "move", notation: "Kh8", side: "b" },
                        { type: "move", notation: "Nxe7", side: "w" },
                        { type: "move", notation: "Nxe7", side: "b" },
                        { type: "move", notation: "Bxf7", side: "w" }
                      ]
                    }
                  ]
                },
                {
                  type: "variation",
                  id: "g6_B2",
                  title: "B2) 6.Qb3!? (Lựa chọn của máy tính)",
                  flow: [
                    { type: "move", notation: "Qb3", side: "w", moveEval: "!?" },
                    {
                      type: "variation",
                      id: "g6_B2_6Nh6",
                      title: "6...Nh6?!",
                      flow: [
                        { type: "move", notation: "Nh6", side: "b", moveEval: "?!" },
                        { type: "move", notation: "O-O!", side: "w", moveEval: "!" },
                        { type: "move", notation: "Bg7", side: "b" },
                        { type: "move", notation: "Bxh6", side: "w" },
                        { type: "move", notation: "Bxh6", side: "b" },
                        { type: "move", notation: "Bxf7+", side: "w" },
                        { type: "move", notation: "Kf8", side: "b" },
                        { type: "move", notation: "Nxc3", side: "w" },
                        { type: "move", notation: "Kg7", side: "b" },
                        { type: "move", notation: "e5", side: "w" },
                        { type: "move", notation: "Rf8", side: "b" },
                        { type: "move", notation: "Bd5", side: "w" }
                      ]
                    },
                    { type: "move", notation: "Qe7", side: "b" },
                    { type: "move", notation: "Nxc3", side: "w" },
                    { type: "move", notation: "Na5", side: "b" },
                    { type: "move", notation: "Qb5", side: "w" },
                    { type: "move", notation: "Nxc4", side: "b" },
                    { type: "move", notation: "Qxc4", side: "w" },
                    { type: "move", notation: "c6", side: "b" },
                    { type: "move", notation: "O-O", side: "w" },
                    { type: "move", notation: "d6", side: "b" },
                    { type: "move", notation: "Bf4", side: "w" },
                    { type: "move", notation: "Bg4", side: "b" },
                    { type: "move", notation: "Rad1", side: "w" },
                    { type: "move", notation: "Bxf3", side: "b" },
                    { type: "move", notation: "gxf3", side: "w" },
                    { type: "move", notation: "Rd8", side: "b" },
                    { type: "move", notation: "Qd4", side: "w" },
                    { type: "move", notation: "f6", side: "b" },
                    { type: "move", notation: "Qxa7", side: "w" }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
  ],
};

export const italianGameChapters: OpeningLine[] =
  winningWithTheSlowButVenomousItalian.chapters.map((chapter, index) =>
    chapterToOpeningLine(winningWithTheSlowButVenomousItalian, chapter, index)
  );

export default italianGameChapters;

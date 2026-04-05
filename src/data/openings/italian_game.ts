import {
  BookChapter,
  BookMove,
  BookVariation,
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

function buildOutcomeSummary(moves: BookMove[], fallback: string): string {
  const explainedMove = [...moves].reverse().find((move) => move.explain);
  if (explainedMove?.explain) return explainedMove.explain;

  const finalEval = moves[moves.length - 1]?.posEval;
  return finalEval ? `Đánh giá sau nhánh này: ${finalEval}.` : fallback;
}

function normalizeVariation(
  variation: BookVariation,
  fallbackDescription: string
): OpeningVariation {
  const normalizedSubVariations = (variation.subVariations ?? []).map((subVariation) =>
    normalizeVariation(
      {
        id: `${variation.id}_${subVariation.id}`,
        name: subVariation.name,
        moves: [...variation.moves, ...subVariation.moves],
      },
      fallbackDescription
    )
  );

  return {
    id: variation.id,
    name: variation.name,
    description: fallbackDescription,
    startingPly: variation.moves[0]?.ply ?? 1,
    reviewPlies: 0,
    moves: variation.moves.map(toMoveNode),
    outcome: {
      type: "advantage",
      summary: buildOutcomeSummary(variation.moves, fallbackDescription),
    },
    subVariations: normalizedSubVariations,
  };
}

function normalizeVariationGroup(group: BookChapter["variationGroups"][number]): VariationGroup {
  const variations =
    group.variations?.map((variation) => normalizeVariation(variation, group.intro)) ??
    (group.moves
      ? [
          normalizeVariation(
            {
              id: `${group.id}_main`,
              name: group.title,
              moves: group.moves,
            },
            group.intro
          ),
        ]
      : []);

  return {
    id: group.id,
    title: group.title,
    intro: group.intro,
    variations,
  };
}

function chapterToOpeningLine(book: OpeningBook, chapter: BookChapter, chapterIndex: number): OpeningLine {
  return {
    id: chapter.id,
    name: chapter.name,
    opening: chapter.opening,
    fenStart: chapter.fenStart,
    moves: [],
    guide: {
      title: chapter.name,
      summary: chapter.summary,
      goals: [
        "Nhìn đúng hình cờ xuất phát của chương trước khi học từng nhánh phụ.",
        "Ghi nhớ vì sao các nước đi phụ của Đen bị xem là chậm hoặc thiếu chính xác.",
        "Chuyển từ ý tưởng trong sách sang phản xạ đi quân trên bàn cờ.",
      ],
      watchFor: [
        "Không cần đi lại phần hình thành Italian cơ bản, vì chương bắt đầu từ fen có sẵn.",
        "Ưu tiên hiểu ý tưởng trừng phạt ở trung tâm thay vì chỉ học thuộc nước.",
        "Khi một nhánh có nhiều phân nhánh con, hãy chú ý đúng nước rẽ nhánh đầu tiên.",
      ],
    },
    outcome: {
      type: "advantage",
      summary: chapter.summary,
    },
    variationGroups: chapter.variationGroups.map(normalizeVariationGroup),
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
      summary: chapter.summary,
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
      id: "wwsi_ch01_full",
      name: "Chương 1: Các biến phụ ở nước thứ 3",
      opening: "Italian Game",
      fenStart: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
      summary:
        "Chương này xem xét các nước đi ngoài 3...Bc5 và 3...Nf6. Các biến 3...f5?!, 3...Nd4?! và 3...h6?! được coi là yếu vì Đen chậm phát triển quân. Trắng sẽ giành ưu thế bằng các nước đi trung tâm mạnh mẽ.",
      variationGroups: [
        {
          id: "ch1_f5_rousseau",
          title: "Nhánh 3...f5?! (Rousseau Gambit)",
          intro: "Nước đi cực kỳ hung hăng này làm yếu cánh Vua. Trắng có ưu thế lớn với 4.d4 hoặc 4.d3.",
          variations: [
            {
              id: "ch1_f5_A1",
              name: "Biến A1: Phản công trung tâm với 4.d4",
              moves: [
                { ply: 6, side: "b", move: "f5", moveEval: "?!", explain: "Đen tấn công sớm nhưng làm yếu cấu trúc bảo vệ Vua." },
                { ply: 7, side: "w", move: "d4", moveEval: "!", explain: "Trắng lập tức đánh vào trung tâm để khai thác sự hở sườn của Đen." },
              ],
              subVariations: [
                {
                  id: "A11",
                  name: "Nhánh A11: 4...fxe4",
                  moves: [
                    { ply: 8, side: "b", move: "fxe4" },
                    { ply: 9, side: "w", move: "Nxe5" },
                    { ply: 10, side: "b", move: "d5" },
                    { ply: 11, side: "w", move: "Bb5" },
                    { ply: 12, side: "b", move: "Qd6" },
                    { ply: 13, side: "w", move: "c4", moveEval: "!", posEval: "+-", explain: "Trắng phá hủy cấu trúc tốt của Đen. Thế cờ Trắng thắng rõ sau d4 (±)." },
                  ],
                },
                {
                  id: "A12",
                  name: "Nhánh A12: 4...exd4",
                  moves: [
                    { ply: 8, side: "b", move: "exd4" },
                    { ply: 9, side: "w", move: "e5", moveEval: "!", posEval: "+-", explain: "Nước đi rất thuyết phục, Vua Đen sẽ bị tấn công mạnh mẽ." },
                    { ply: 10, side: "b", move: "d6" },
                    { ply: 11, side: "w", move: "exd6" },
                    { ply: 12, side: "b", move: "Bxd6" },
                    { ply: 13, side: "w", move: "O-O", posEval: "+-", explain: "Trắng hoàn tất phát triển và sẵn sàng tấn công trực diện." },
                  ],
                },
              ],
            },
            {
              id: "ch1_f5_A2",
              name: "Biến A2: Củng cố chắc chắn với 4.d3",
              moves: [
                { ply: 7, side: "w", move: "d3", explain: "Cách tiếp cận an toàn hơn để duy trì ưu thế ổn định." },
                { ply: 8, side: "b", move: "Nf6" },
                { ply: 9, side: "w", move: "O-O" },
                { ply: 10, side: "b", move: "d6" },
                { ply: 11, side: "w", move: "Ng5", moveEval: "!", posEval: "+-", explain: "Trắng tấn công vào ô f7, Đen gặp khó khăn lớn để phòng thủ." },
              ],
            },
          ],
        },
        {
          id: "ch1_nd4_sideline",
          title: "Nhánh 3...Nd4?!",
          intro: "Nước đi vi phạm nguyên tắc không di chuyển một quân quá nhiều lần trong khai cuộc.",
          moves: [
            { ply: 6, side: "b", move: "Nd4", moveEval: "?!", explain: "Đen muốn bẫy Trắng nhưng thực tế là đánh mất nhịp phát triển." },
            { ply: 7, side: "w", move: "Nxd4", moveEval: "!", explain: "Trắng đơn giản là đổi quân để giữ quyền kiểm soát trung tâm." },
            { ply: 8, side: "b", move: "exd4" },
            { ply: 9, side: "w", move: "O-O", posEval: "+=", explain: "Trắng dẫn trước về phát triển và có thế trận tốt hơn (+=)." },
          ],
        },
        {
          id: "ch1_h6_sideline",
          title: "Nhánh 3...h6?!",
          intro: "Nước đi phòng thủ thụ động thường thấy ở cấp độ nghiệp dư, làm phí thời gian.",
          moves: [
            { ply: 6, side: "b", move: "h6", moveEval: "?!", explain: "Đen ngăn chặn Ng5 nhưng lại chậm phát triển quân." },
            { ply: 7, side: "w", move: "O-O" },
            { ply: 8, side: "b", move: "Nf6" },
            { ply: 9, side: "w", move: "d4", moveEval: "!", posEval: "+=", explain: "Trắng lập tức mở trung tâm để trừng phạt sự chậm trễ của Đen." },
          ],
        },
        {
          id: "ch1_g6_sideline",
          title: "Nhánh 3...g6",
          intro: "Một nỗ lực tránh các biến lý thuyết sâu nhưng kế hoạch Fianchetto này hơi chậm.",
          moves: [
            { ply: 6, side: "b", move: "g6", explain: "Đen muốn đưa tượng lên g7." },
            { ply: 7, side: "w", move: "d4", moveEval: "!", explain: "Trắng phản ứng mạnh mẽ ở trung tâm." },
            { ply: 8, side: "b", move: "exd4" },
            { ply: 9, side: "w", move: "c3", moveEval: "!", posEval: "+=", explain: "Trắng sẵn sàng hy sinh một tốt để giành quyền chủ động và không gian." },
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

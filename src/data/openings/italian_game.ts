import { OpeningLine } from "@/types";

/**
 * Italian Game opening lines (~20 variations).
 * Each line is a sequence of plies from the starting position.
 * validMoves uses SAN notation (chess.js standard).
 */
export const italianGameLines: OpeningLine[] = [
  // ──────────────────────────────────────────────────
  // 1. Italian Game – Main Line (Giuoco Piano)
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_001",
    name: "Italian Game – Giuoco Piano",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 1,
    tags: ["opening", "italian", "e4"],
    trap: false,
    moves: [
      {
        ply: 1,
        side: "w",
        validMoves: ["e4"],
        explain: "Kiểm soát trung tâm bằng tốt e4",
        tags: ["center_control"],
      },
      {
        ply: 2,
        side: "b",
        validMoves: ["e5"],
        explain: "Đen cũng kiểm soát trung tâm",
        tags: ["center_control"],
      },
      {
        ply: 3,
        side: "w",
        validMoves: ["Nf3"],
        explain: "Phát triển mã, tấn công tốt e5",
        tags: ["development"],
      },
      {
        ply: 4,
        side: "b",
        validMoves: ["Nc6"],
        explain: "Bảo vệ tốt e5 bằng mã",
        tags: ["development"],
      },
      {
        ply: 5,
        side: "w",
        validMoves: ["Bc4"],
        explain: "Tượng nhắm vào f7, ô yếu của đen",
        tags: ["development", "king_safety"],
      },
      {
        ply: 6,
        side: "b",
        validMoves: ["Bc5"],
        explain: "Đen phát triển tượng đối xứng",
        tags: ["development"],
      },
      {
        ply: 7,
        side: "w",
        validMoves: ["c3"],
        explain: "Chuẩn bị d4 mở rộng trung tâm",
        tags: ["center_control", "pawn_structure"],
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["Nf6"],
        explain: "Phát triển mã, tấn công e4",
        tags: ["development"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["d4"],
        explain: "Mở rộng trung tâm",
        tags: ["center_control"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 2. Italian Game – Evans Gambit
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_002",
    name: "Italian Game – Evans Gambit",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 3,
    tags: ["opening", "italian", "gambit", "aggressive"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen kiểm soát trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ tốt e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      { ply: 6, side: "b", validMoves: ["Bc5"], explain: "Đen phát triển tượng" },
      {
        ply: 7,
        side: "w",
        validMoves: ["b4"],
        explain: "Gambit Evans – hy sinh tốt giành tempo",
        tags: ["gambit", "tempo"],
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["Bxb4"],
        explain: "Đen nhận gambit",
        tags: ["gambit"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["c3"],
        explain: "Tạo áp lực lên tượng đen",
        tags: ["gambit", "tempo"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 3. Italian Game – Two Knights Defense
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_003",
    name: "Two Knights Defense",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 2,
    tags: ["opening", "italian", "two_knights"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      {
        ply: 6,
        side: "b",
        validMoves: ["Nf6"],
        explain: "Hai mã – phòng thủ tích cực",
        tags: ["development", "counterattack"],
      },
      {
        ply: 7,
        side: "w",
        validMoves: ["Ng5"],
        explain: "Tấn công điểm yếu f7",
        tags: ["attack", "king_safety"],
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["d5"],
        explain: "Đen phản công trung tâm",
        tags: ["center_control", "counterattack"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["exd5"],
        explain: "Ăn tốt d5 mở cột e",
        tags: ["center_control"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 4. Italian Game – Fried Liver Attack (Trap)
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_004",
    name: "Fried Liver Attack",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 4,
    tags: ["opening", "italian", "trap", "sacrifice"],
    trap: true,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      { ply: 6, side: "b", validMoves: ["Nf6"], explain: "Hai mã" },
      { ply: 7, side: "w", validMoves: ["Ng5"], explain: "Tấn công f7" },
      { ply: 8, side: "b", validMoves: ["d5"], explain: "Phản công" },
      { ply: 9, side: "w", validMoves: ["exd5"], explain: "Ăn tốt" },
      { ply: 10, side: "b", validMoves: ["Nxd5"], explain: "Đen ăn lại" },
      {
        ply: 11,
        side: "w",
        validMoves: ["Nxf7"],
        explain: "Hy sinh mã vào f7 – Fried Liver!",
        tags: ["sacrifice", "attack", "king_safety"],
        isTrapOpportunity: true,
      },
      {
        ply: 12,
        side: "b",
        validMoves: ["Kxf7"],
        explain: "Vua đen buộc phải ăn",
        tags: ["king_safety"],
      },
      {
        ply: 13,
        side: "w",
        validMoves: ["Qf3+"],
        explain: "Chiếu vua, tiếp tục tấn công",
        tags: ["attack", "king_safety"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 5. Italian Game – Giuoco Pianissimo
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_005",
    name: "Giuoco Pianissimo",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 2,
    tags: ["opening", "italian", "quiet", "positional"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen kiểm soát trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      { ply: 6, side: "b", validMoves: ["Bc5"], explain: "Đen phát triển tượng" },
      {
        ply: 7,
        side: "w",
        validMoves: ["d3"],
        explain: "Pianissimo – chơi chậm, vững chắc",
        tags: ["positional", "pawn_structure"],
      },
      { ply: 8, side: "b", validMoves: ["Nf6"], explain: "Phát triển mã đen" },
      {
        ply: 9,
        side: "w",
        validMoves: ["Nc3"],
        explain: "Phát triển mã hậu",
        tags: ["development"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 6. Italian Game – Hungarian Defense
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_006",
    name: "Hungarian Defense",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 2,
    tags: ["opening", "italian", "defense"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      {
        ply: 6,
        side: "b",
        validMoves: ["Be7"],
        explain: "Phòng thủ Hungary – thụ động nhưng vững",
        tags: ["defense", "king_safety"],
      },
      {
        ply: 7,
        side: "w",
        validMoves: ["d4"],
        explain: "Tấn công trung tâm khi đen thụ động",
        tags: ["center_control", "tempo"],
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["d6"],
        explain: "Đen giữ vững vị trí",
        tags: ["defense"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 7. Italian Game – Scotch Gambit
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_007",
    name: "Scotch Gambit",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 3,
    tags: ["opening", "italian", "gambit"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      {
        ply: 5,
        side: "w",
        validMoves: ["d4"],
        explain: "Scotch – mở trung tâm ngay",
        tags: ["center_control", "gambit"],
      },
      {
        ply: 6,
        side: "b",
        validMoves: ["exd4"],
        explain: "Đen ăn tốt",
        tags: ["center_control"],
      },
      {
        ply: 7,
        side: "w",
        validMoves: ["Bc4"],
        explain: "Scotch Gambit – tượng Italy sau d4",
        tags: ["development", "gambit"],
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["Nf6"],
        explain: "Phát triển mã tấn công e4",
        tags: ["development", "counterattack"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 8. Italian Game – Jerome Gambit (Trap)
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_008",
    name: "Jerome Gambit",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 4,
    tags: ["opening", "italian", "gambit", "trap"],
    trap: true,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      { ply: 6, side: "b", validMoves: ["Bc5"], explain: "Đen phát triển tượng" },
      {
        ply: 7,
        side: "w",
        validMoves: ["Bxf7+"],
        explain: "Jerome Gambit – hy sinh tượng vào f7!",
        tags: ["sacrifice", "trap", "king_safety"],
        isTrapOpportunity: true,
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["Kxf7"],
        explain: "Vua đen nhận hy sinh",
        tags: ["king_safety"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["Nxe5+"],
        explain: "Mã chiếu vua, ăn thêm quân",
        tags: ["attack"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 9. Italian Game – Anti-Italian (d6 system)
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_009",
    name: "Anti-Italian – d6 System",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 2,
    tags: ["opening", "italian", "defense", "solid"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      {
        ply: 6,
        side: "b",
        validMoves: ["d6"],
        explain: "Hệ thống d6 – chơi chắc chắn",
        tags: ["defense", "pawn_structure"],
      },
      {
        ply: 7,
        side: "w",
        validMoves: ["Nc3"],
        explain: "Phát triển mã hậu",
        tags: ["development"],
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["Be7"],
        explain: "Chuẩn bị nhập thành",
        tags: ["king_safety"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["O-O"],
        explain: "Nhập thành an toàn",
        tags: ["king_safety"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 10. Italian Game – Giuoco Piano – Greco Attack
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_010",
    name: "Giuoco Piano – Greco Attack",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 3,
    tags: ["opening", "italian", "attack"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      { ply: 6, side: "b", validMoves: ["Bc5"], explain: "Đen phát triển tượng" },
      { ply: 7, side: "w", validMoves: ["c3"], explain: "Chuẩn bị d4" },
      {
        ply: 8,
        side: "b",
        validMoves: ["Nf6"],
        explain: "Tấn công e4",
        tags: ["counterattack"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["d4"],
        explain: "Greco Attack – mở trung tâm mạnh",
        tags: ["center_control", "attack"],
      },
      {
        ply: 10,
        side: "b",
        validMoves: ["exd4"],
        explain: "Đen ăn tốt",
        tags: ["center_control"],
      },
      {
        ply: 11,
        side: "w",
        validMoves: ["e5"],
        explain: "Đẩy e5 tạo áp lực lên mã f6",
        tags: ["attack", "tempo"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 11. Italian Game – Traps: Noah's Ark Trap
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_011",
    name: "Noah's Ark Trap",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 3,
    tags: ["opening", "italian", "trap"],
    trap: true,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      { ply: 6, side: "b", validMoves: ["Bc5"], explain: "Đen phát triển tượng" },
      { ply: 7, side: "w", validMoves: ["c3"], explain: "Chuẩn bị d4" },
      { ply: 8, side: "b", validMoves: ["Nf6"], explain: "Tấn công e4" },
      { ply: 9, side: "w", validMoves: ["d4"], explain: "Mở trung tâm" },
      { ply: 10, side: "b", validMoves: ["exd4"], explain: "Đen ăn tốt" },
      { ply: 11, side: "w", validMoves: ["cxd4"], explain: "Trắng lấy lại" },
      {
        ply: 12,
        side: "b",
        validMoves: ["Bb4+"],
        explain: "Chiếu tượng – đặt bẫy!",
        tags: ["trap", "tempo"],
        isTrapOpportunity: true,
      },
      {
        ply: 13,
        side: "w",
        validMoves: ["Bd2"],
        explain: "Trắng phải che chiếu",
        tags: ["defense"],
      },
      {
        ply: 14,
        side: "b",
        validMoves: ["Bxd2+"],
        explain: "Đen ăn tượng",
        tags: ["tactic"],
      },
      {
        ply: 15,
        side: "w",
        validMoves: ["Nbxd2"],
        explain: "Trắng lấy lại bằng mã",
        tags: ["defense"],
      },
      {
        ply: 16,
        side: "b",
        validMoves: ["d5"],
        explain: "Đen thắng tốt trung tâm!",
        tags: ["center_control", "tactic"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 12. Italian Game – Rousseau Gambit
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_012",
    name: "Rousseau Gambit",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 3,
    tags: ["opening", "italian", "gambit"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      {
        ply: 6,
        side: "b",
        validMoves: ["f5"],
        explain: "Rousseau Gambit – đen tấn công táo bạo",
        tags: ["gambit", "attack", "aggressive"],
      },
      {
        ply: 7,
        side: "w",
        validMoves: ["d4"],
        explain: "Trắng phản công trung tâm tốt nhất",
        tags: ["center_control", "counterattack"],
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["fxe4"],
        explain: "Đen ăn tốt e4",
        tags: ["gambit"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["Nxe5"],
        explain: "Trắng ăn lại e5",
        tags: ["tactic"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 13. Italian Game – Four Knights
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_013",
    name: "Four Knights – Italian Variation",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 2,
    tags: ["opening", "italian", "four_knights"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Nc3"], explain: "Phát triển mã hậu" },
      {
        ply: 6,
        side: "b",
        validMoves: ["Nf6"],
        explain: "Bốn mã – đối xứng hoàn toàn",
        tags: ["development", "symmetric"],
      },
      { ply: 7, side: "w", validMoves: ["Bc4"], explain: "Vào hệ Italy" },
      {
        ply: 8,
        side: "b",
        validMoves: ["Bc5"],
        explain: "Đen đối xứng",
        tags: ["development"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["O-O"],
        explain: "Nhập thành an toàn",
        tags: ["king_safety"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 14. Italian Game – Fishing Pole Trap
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_014",
    name: "Fishing Pole Trap",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 4,
    tags: ["opening", "italian", "trap", "sacrifice"],
    trap: true,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      { ply: 6, side: "b", validMoves: ["Nf6"], explain: "Hai mã" },
      { ply: 7, side: "w", validMoves: ["Ng5"], explain: "Tấn công f7" },
      {
        ply: 8,
        side: "b",
        validMoves: ["h6"],
        explain: "Fishing Pole – đặt bẫy cho mã trắng!",
        tags: ["trap", "tempo"],
        isTrapOpportunity: true,
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["Nxf7"],
        explain: "Trắng mắc bẫy – ăn f7?",
        tags: ["trap"],
      },
      {
        ply: 10,
        side: "b",
        validMoves: ["Ng4"],
        explain: "Đen tấn công vua trắng!",
        tags: ["attack", "king_safety"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 15. Italian Game – Canal Trap
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_015",
    name: "Canal Trap",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 3,
    tags: ["opening", "italian", "trap"],
    trap: true,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      { ply: 6, side: "b", validMoves: ["Bc5"], explain: "Đen phát triển tượng" },
      { ply: 7, side: "w", validMoves: ["O-O"], explain: "Nhập thành" },
      { ply: 8, side: "b", validMoves: ["Nf6"], explain: "Phát triển mã" },
      {
        ply: 9,
        side: "w",
        validMoves: ["d4"],
        explain: "Mở trung tâm",
        tags: ["center_control"],
      },
      {
        ply: 10,
        side: "b",
        validMoves: ["Nxe4"],
        explain: "Đen ăn tốt e4 – có vẻ tốt nhưng nguy hiểm",
        tags: ["tactic", "trap"],
        isTrapOpportunity: true,
      },
      {
        ply: 11,
        side: "w",
        validMoves: ["Re1"],
        explain: "Xe tấn công mã e4!",
        tags: ["attack", "pin"],
      },
      {
        ply: 12,
        side: "b",
        validMoves: ["d5"],
        explain: "Đen cố thoát",
        tags: ["defense"],
      },
      {
        ply: 13,
        side: "w",
        validMoves: ["Bxd5"],
        explain: "Trắng thắng quân!",
        tags: ["tactic", "winning"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 16. Italian Game – Knight Attack on f7 (quick trap)
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_016",
    name: "Early f7 Attack",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 2,
    tags: ["opening", "italian", "attack", "beginners"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      {
        ply: 6,
        side: "b",
        validMoves: ["Nd4"],
        explain: "Đen chơi mã ra d4 – sai lầm phổ biến",
        tags: ["mistake", "hanging_piece"],
      },
      {
        ply: 7,
        side: "w",
        validMoves: ["Nxe5"],
        explain: "Trắng ăn tốt e5 được tặng",
        tags: ["tactic", "winning"],
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["Qg5"],
        explain: "Đen tấn công mã và g2",
        tags: ["attack"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["Nxf7"],
        explain: "Mã nhảy vào f7 tấn công xe và hậu!",
        tags: ["fork", "tactic"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 17. Italian Game – Ruy Lopez comparison (similar start)
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_017",
    name: "Italian vs Ruy Lopez – Key Difference",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 1,
    tags: ["opening", "italian", "conceptual"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      {
        ply: 5,
        side: "w",
        validMoves: ["Bc4"],
        explain: "Italian: tượng nhắm f7. Khác Ruy Lopez (Bb5) – áp lực gián tiếp",
        tags: ["development", "conceptual"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 18. Italian Game – Morphy's Defense vs Italian
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_018",
    name: "Italian – Morphy Defense Variation",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 2,
    tags: ["opening", "italian", "morphy"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      { ply: 6, side: "b", validMoves: ["a6"], explain: "Ngăn mã nhảy b5" },
      {
        ply: 7,
        side: "w",
        validMoves: ["Nc3"],
        explain: "Phát triển mã hậu",
        tags: ["development"],
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["Nf6"],
        explain: "Phát triển mã",
        tags: ["development"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 19. Italian Game – Castling Trap
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_019",
    name: "Italian – Early Castling Trap",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 3,
    tags: ["opening", "italian", "trap", "king_safety"],
    trap: true,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      { ply: 6, side: "b", validMoves: ["Bc5"], explain: "Đen phát triển tượng" },
      { ply: 7, side: "w", validMoves: ["O-O"], explain: "Nhập thành cánh vua" },
      {
        ply: 8,
        side: "b",
        validMoves: ["O-O"],
        explain: "Đen cũng nhập thành",
        tags: ["king_safety"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["d3"],
        explain: "Củng cố trung tâm",
        tags: ["pawn_structure"],
      },
      {
        ply: 10,
        side: "b",
        validMoves: ["d6"],
        explain: "Đen giữ vững",
        tags: ["defense"],
      },
      {
        ply: 11,
        side: "w",
        validMoves: ["Bg5"],
        explain: "Ghim mã c6 – đặt bẫy!",
        tags: ["pin", "trap"],
        isTrapOpportunity: true,
      },
      {
        ply: 12,
        side: "b",
        validMoves: ["h6"],
        explain: "Đen đẩy tượng đi",
        tags: ["tempo"],
      },
      {
        ply: 13,
        side: "w",
        validMoves: ["Bh4"],
        explain: "Tượng rút về h4 – tiếp tục ghim",
        tags: ["pin"],
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // 20. Italian Game – Endgame Transition
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_020",
    name: "Italian – Queenside Expansion",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 3,
    tags: ["opening", "italian", "positional", "queenside"],
    trap: false,
    moves: [
      { ply: 1, side: "w", validMoves: ["e4"], explain: "Kiểm soát trung tâm" },
      { ply: 2, side: "b", validMoves: ["e5"], explain: "Đen chiếm trung tâm" },
      { ply: 3, side: "w", validMoves: ["Nf3"], explain: "Phát triển mã" },
      { ply: 4, side: "b", validMoves: ["Nc6"], explain: "Bảo vệ e5" },
      { ply: 5, side: "w", validMoves: ["Bc4"], explain: "Tượng Italy" },
      { ply: 6, side: "b", validMoves: ["Bc5"], explain: "Đen phát triển tượng" },
      { ply: 7, side: "w", validMoves: ["c3"], explain: "Chuẩn bị d4" },
      { ply: 8, side: "b", validMoves: ["Bb6"], explain: "Đen rút tượng tránh d4" },
      { ply: 9, side: "w", validMoves: ["d4"], explain: "Mở trung tâm" },
      {
        ply: 10,
        side: "b",
        validMoves: ["d6"],
        explain: "Đen giữ tốt e5",
        tags: ["defense", "pawn_structure"],
      },
      {
        ply: 11,
        side: "w",
        validMoves: ["O-O"],
        explain: "Nhập thành trước khi mở trung tâm",
        tags: ["king_safety"],
      },
      {
        ply: 12,
        side: "b",
        validMoves: ["O-O"],
        explain: "Đen cũng nhập thành",
        tags: ["king_safety"],
      },
      {
        ply: 13,
        side: "w",
        validMoves: ["a4"],
        explain: "Mở rộng cánh hậu – kế hoạch dài hạn",
        tags: ["queenside", "positional"],
      },
    ],
  },
];

export default italianGameLines;

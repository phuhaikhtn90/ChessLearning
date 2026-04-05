import { OpeningGuideData, OpeningLine } from "@/types";

export const italianGameGuideByLineId: Record<string, OpeningGuideData> = {
  line_italian_001: {
    title: "Slow Italian Main Line (Biến chính Italian chậm)",
    summary:
      "Đây là cách triển khai chắc chắn và dễ nhớ nhất của Italian hiện đại: Trắng đẩy tốt c lên c3, đẩy tốt d lên d3, nhập thành cánh vua, đưa xe sang e1 rồi chuyển mã b1 dần sang cánh vua để chuẩn bị trung cuộc.",
    goals: [
      "Ghi nhớ khung cơ bản: tốt c lên c3, tốt d lên d3, vua nhập thành cánh vua, xe sang e1",
      "Hiểu hành trình của mã b1 qua d2 rồi f1 để nhảy sang g3",
      "Chỉ mở trung tâm bằng cách đẩy tốt d từ d3 lên d4 khi quân đã đứng đúng chỗ",
    ],
    watchFor: [
      "Đừng vội mở trung tâm quá sớm chỉ vì thấy có thể đẩy tốt d lên d4",
      "Nếu đen đẩy tốt d lên d5 quá nhanh, Trắng thường có thể đổi tốt để mở thế khi đen chưa chuẩn bị xong",
      "Điều quan trọng là hiểu cấu trúc chậm, cách chuyển mã và thời điểm mở trung tâm",
    ],
  },
  line_italian_002: {
    title: "Evans Gambit (Gambit Evans)",
    summary:
      "Evans Gambit là lựa chọn rất chủ động: Trắng đẩy tốt b lên b4 để mời tượng đen ăn tốt, rồi dùng nhịp đó để phát triển quân nhanh và mở thế tấn công.",
    goals: [
      "Giành nhịp bằng tốt b4 rồi tốt c3",
      "Mở đường cho tượng, hậu và xe tham gia tấn công",
      "Tạo áp lực trước khi đen kịp ổn định",
    ],
    watchFor: [
      "Điểm mạnh là thế công nhanh và chủ động",
      "Điểm yếu là nếu không tận dụng được nhịp, trắng sẽ thiếu tốt",
      "Nếu đen không nhận tốt hoặc trả tượng về ô an toàn sớm, trắng cần ưu tiên phát triển tiếp chứ không nhất thiết ép tấn công ngay",
    ],
  },
  line_italian_003: {
    title: "Two Knights Defense (Phòng thủ Hai Mã)",
    summary:
      "Ở nhánh này, đen đưa mã g8 ra f6 rất sớm. Trắng không nhất thiết phải lao ngay vào điểm yếu f7, mà vẫn có thể giữ thế cờ chắc bằng cách đẩy tốt d lên d3 và phát triển tiếp.",
    goals: [
      "Hiểu vì sao đẩy tốt d lên d3 giúp thế cờ vẫn chắc và dễ chơi",
      "Nhận ra rằng cả tượng e7 lẫn tượng c5 của đen đều có thể dẫn tới trung cuộc chiến lược",
      "Biết khi nào nên phát triển tiếp thay vì lao vào f7",
    ],
    watchFor: [
      "Đừng mặc định rằng cứ gặp Hai Mã là phải nhảy mã lên g5 ngay",
      "Điểm chính là move order và chất lượng thế trận, không phải bẫy nhanh",
      "Nếu đen không đưa tượng ra c5, Trắng vẫn có thể giữ cùng triết lý: tốt d3, tốt c3, rồi nhập thành",
    ],
  },
  line_italian_004: {
    title: "Fried Liver Attack (Đòn Gan Chiên)",
    summary:
      "Đây là một đòn tấn công nổi tiếng: trắng hy sinh mã vào f7 để kéo vua đen ra giữa bàn cờ và tăng áp lực liên tục.",
    goals: [
      "Nhớ mô hình Nxf7 rồi Qf3+",
      "Nhận ra mục tiêu là làm vua đen mất an toàn",
      "Tập quan sát điểm yếu quanh vua đối thủ",
    ],
    watchFor: [
      "Điểm mạnh là tạo thế công rất mạnh nếu đối thủ sơ ý",
      "Điểm yếu là nếu nhớ sai thứ tự, trắng có thể hụt quân mà không đủ bù đắp",
      "Nếu đen không rơi đúng vào cấu trúc của bẫy, trắng không nên hy sinh chỉ vì đã thuộc tên đòn",
    ],
  },
  line_italian_005: {
    title: "Giuoco Pianissimo (Ván cờ thật yên)",
    summary:
      "Đây là kiểu Italian chậm và giàu kế hoạch nhất. Trắng xây vị trí từng chút một, giữ cấu trúc tốt chắc, rồi mới chọn thời điểm thích hợp để đổi nhịp và bước vào trung cuộc.",
    goals: [
      "Giữ cấu trúc tốt ổn định",
      "Đưa quân ra hài hòa trước khi tấn công",
      "Học cách chơi thế trận kiên nhẫn",
    ],
    watchFor: [
      "Điểm mạnh là rất an toàn và dễ kiểm soát",
      "Điểm yếu là nếu chơi quá hiền, thế cờ dễ trở nên ngang bằng",
      "Nếu đen chủ động mở trung tâm sớm, trắng phải phản ứng ngay chứ không nên cố giữ nhịp chậm bằng mọi giá",
    ],
  },
  line_italian_006: {
    title: "Hungarian Defense (Phòng thủ Hungary)",
    summary:
      "Hungarian Defense là cách đen đưa tượng f8 về e7 sớm để tránh va chạm chiến thuật quanh f7 và giữ thế rất chắc chắn.",
    goals: [
      "Nhận ra cấu trúc phòng thủ kín đáo của đen",
      "Tìm cách giữ sáng kiến mà không nóng vội",
      "Học cách phát triển quân khi đối thủ chơi chắc",
    ],
    watchFor: [
      "Điểm mạnh của đen là ít lộ sơ hở sớm",
      "Điểm yếu là đen có thể bị thiếu không gian nếu bị ép lâu dài",
      "Khi gặp cấu trúc này, trắng nên tích lũy thế hơn từng chút thay vì tìm đòn thắng nhanh không có thật",
    ],
  },
  line_italian_007: {
    title: "Scotch Gambit (Gambit Scotch)",
    summary:
      "Scotch Gambit mở trung tâm rất sớm. Trắng đổi kiểu chơi chậm của Italian lấy một thế cờ trực diện hơn, nơi từng nước phát triển đều gắn với sức ép ở trung tâm.",
    goals: [
      "Mở trung tâm đúng lúc bằng tốt d",
      "Phát triển quân đi kèm ý tưởng tấn công",
      "Tạo thế chủ động sớm trước khi đen kịp co cụm",
    ],
    watchFor: [
      "Điểm mạnh là ép đối thủ phải tính toán sớm",
      "Điểm yếu là cần hiểu rõ kế hoạch, không thể chỉ đánh theo cảm giác",
      "Nếu đen đổi cấu trúc theo hướng khác, trắng có thể đổi sang phát triển chắc thay vì cứ phải giữ tinh thần gambit",
    ],
  },
  line_italian_008: {
    title: "Jerome Gambit (Gambit Jerome)",
    summary:
      "Jerome Gambit là một line cực sắc: trắng hy sinh tượng rồi tiếp tục dồn quân vào vua đen. Đây là kiểu chơi mạo hiểm và thiên về bẫy.",
    goals: [
      "Nhớ mô hình hy sinh để mở vua đen",
      "Hiểu rằng mục tiêu là chủ động chứ không phải ăn quân đơn thuần",
      "Luyện khả năng nhìn đòn chiếu và phối hợp quân",
    ],
    watchFor: [
      "Điểm mạnh là gây bất ngờ rất mạnh",
      "Điểm yếu là nếu đen phòng thủ đúng, trắng dễ bị thiếu quân nặng",
      "Đây là line thiên về bẫy, nên nếu đối thủ không mắc sơ hở thì trắng phải biết dừng lại và chuyển sang cứu thế",
    ],
  },
  line_italian_009: {
    title: "Anti-Italian d6 System (Hệ thống ...d6 chống Italian)",
    summary:
      "Đen đẩy tốt d lên d6 để giữ tốt e5 chắc hơn và làm nhịp ván cờ chậm lại. Trắng cần kiên nhẫn xây vị trí thay vì cố tạo chiến thuật quá sớm.",
    goals: [
      "Nhận ra ý tưởng phòng thủ chắc của đen",
      "Tiếp tục phát triển quân đúng bài",
      "Giữ thế chủ động mà không overpush",
    ],
    watchFor: [
      "Điểm mạnh là thế cờ dễ hiểu và ít rủi ro",
      "Điểm yếu là đôi khi trắng khó tạo đột biến sớm",
      "Khi đen dựng d6 chắc chắn, trắng nên mở rộng từng bước thay vì sốt ruột tìm đòn chiến thuật ngay",
    ],
  },
  line_italian_010: {
    title: "Greco Attack (Đòn tấn công Greco)",
    summary:
      "Greco Attack thường xoay quanh việc đẩy tốt d lên d4 rồi đẩy tốt e lên e5 để đuổi mã đen ở f6. Đây là kiểu tấn công dùng nhịp và không gian để ép đối thủ lùi lại.",
    goals: [
      "Hiểu chuỗi tốt c3, tốt d4 và tốt e5 liên kết với nhau thế nào",
      "Dùng trung tâm để mở đòn tấn công",
      "Phát huy lợi thế không gian và tempo",
    ],
    watchFor: [
      "Điểm mạnh là đẩy đối thủ vào thế bị động",
      "Điểm yếu là nếu trung tâm vỡ sai lúc, trắng có thể lộ sơ hở",
      "Nếu đen chưa đặt mã ở f6 hoặc không khóa trung tâm như bài, nước e5 có thể không còn mạnh như trong mẫu này",
    ],
  },
  line_italian_011: {
    title: "Noah's Ark Trap (Bẫy Con tàu Noah)",
    summary:
      "Đây là bẫy chiến thuật nhắm vào việc nhốt quân trắng bằng chuỗi nước chính xác. Bé nên nhìn ý tưởng cái bẫy chứ không chỉ nhớ từng nước.",
    goals: [
      "Nhận ra cách đối thủ dùng tempo để gài bẫy",
      "Hiểu vì sao một quân có thể bị nhốt",
      "Tập cảnh giác khi phát triển quân quá sâu",
    ],
    watchFor: [
      "Điểm mạnh là rất dễ tạo bất ngờ",
      "Điểm yếu là nếu đối thủ biết bẫy, hiệu quả giảm rõ rệt",
      "Nếu đối thủ không đi vào ô nhốt quân như mong muốn, bé nên hiểu bẫy đã hết và quay lại chơi thế bình thường",
    ],
  },
  line_italian_012: {
    title: "Rousseau Gambit (Gambit Rousseau)",
    summary:
      "Rousseau Gambit là cách đen phản công nhanh bằng f5 thay vì chơi đều. Ván cờ trở nên sắc bén hơn và trắng phải phản ứng chính xác.",
    goals: [
      "Nhận ra dấu hiệu phản công sớm của đen",
      "Giữ bình tĩnh khi đối thủ chủ động",
      "Tìm nước phát triển vừa chắc vừa không mất nhịp",
    ],
    watchFor: [
      "Điểm mạnh của đen là tạo áp lực bất ngờ ngay đầu ván",
      "Điểm yếu là nước f5 cũng làm cấu trúc vua đen bớt an toàn",
      "Nếu trắng hóa giải được sức ép đầu tiên, lợi thế thường chuyển sang việc khai thác các ô yếu quanh vua đen",
    ],
  },
  line_italian_013: {
    title: "Four Knights - Italian Variation (Biến Italian trong Tứ Mã)",
    summary:
      "Đây là thế cờ rất bài bản: cả hai bên phát triển đủ mã trước rồi mới chuyển sang ý đồ sâu hơn. Nó phù hợp để luyện cảm giác khai cuộc chuẩn.",
    goals: [
      "Đưa quân ra đúng thứ tự cơ bản",
      "Làm quen thế cờ đối xứng và cân bằng",
      "Học cách tạo ý tưởng từ nền tảng chắc chắn",
    ],
    watchFor: [
      "Điểm mạnh là cấu trúc dễ hiểu và ít bẫy sớm",
      "Điểm yếu là lợi thế nhỏ khá khó chuyển hóa nếu thiếu kế hoạch",
      "Nếu đối thủ phá đối xứng sớm, bạn không cần cố giữ hình cờ y hệt ban đầu mà nên bám vào nguyên tắc phát triển quân",
    ],
  },
  line_italian_014: {
    title: "Fishing Pole Trap (Bẫy Cần Câu)",
    summary:
      "Fishing Pole Trap dụ đối thủ ăn quân sai lúc để rồi bị phản đòn quanh vua. Đây là một cái bẫy tâm lý rất điển hình.",
    goals: [
      "Nhìn ra mồi nhử trong khai cuộc",
      "Hiểu vì sao ăn quân chưa chắc đã tốt",
      "Luyện phản xạ kiểm tra an toàn vua trước khi tham ăn",
    ],
    watchFor: [
      "Điểm mạnh là rất dễ khiến người mới mắc bẫy",
      "Điểm yếu là nếu đối thủ không nhận mồi, kế hoạch này mất hiệu lực nhiều",
      "Nếu đối thủ từ chối mồi nhử, bé nên quay lại chơi chắc chứ không nên cố 'câu cá' bằng mọi giá",
    ],
  },
  line_italian_015: {
    title: "Canal Trap (Bẫy Canal)",
    summary:
      "Canal Trap là line chiến thuật nhấn vào thứ tự phát triển quân và điểm yếu quanh vua. Chỉ cần sai nhịp một chút là thế cờ đổi hẳn.",
    goals: [
      "Nhớ mô hình chiến thuật chính của bẫy",
      "Hiểu vì sao từng nước phải đi đúng thứ tự",
      "Tập nhìn đe dọa quanh vua đối thủ",
    ],
    watchFor: [
      "Điểm mạnh là tạo đòn rất nhanh",
      "Điểm yếu là nếu đối thủ biết đường tránh, trắng cần chuyển kế hoạch tốt",
      "Canal Trap chỉ sắc khi đối thủ đi đúng vào nhịp bẫy, còn nếu họ phòng thủ tỉnh táo thì trắng phải quay về phát triển quân",
    ],
  },
  line_italian_016: {
    title: "Early f7 Attack (Tấn công sớm vào f7)",
    summary:
      "Đây là kiểu line nhắm rất sớm vào f7, ô yếu tự nhiên của đen. Ý tưởng dễ hiểu nhưng cũng dễ quá tay nếu quân chưa đủ hỗ trợ.",
    goals: [
      "Nhận ra vì sao f7 là điểm yếu",
      "Tập cân bằng giữa tấn công và phát triển",
      "Chỉ tấn công khi quân phối hợp đủ tốt",
    ],
    watchFor: [
      "Điểm mạnh là dễ tạo áp lực tâm lý",
      "Điểm yếu là tấn công sớm quá có thể khiến trắng hụt nhịp phát triển",
      "Nếu chưa đủ quân hỗ trợ, việc lao vào f7 sẽ chỉ là đòn dọa suông chứ không phải kế hoạch tốt",
    ],
  },
  line_italian_017: {
    title: "Italian vs Ruy Lopez (Italian và Ruy Lopez khác nhau ở đâu)",
    summary:
      "Line này giúp người học nhìn rõ khác biệt ý tưởng: Italian thường phát triển tượng ra c4 để nhắm f7, còn Ruy Lopez lại gây sức ép lên mã c6 và cấu trúc tốt e5.",
    goals: [
      "Phân biệt mục tiêu chiến lược của hai khai cuộc",
      "Hiểu vì sao ô đặt tượng tạo ra kế hoạch khác nhau",
      "Xây cảm giác nhận diện khai cuộc bằng hình cờ",
    ],
    watchFor: [
      "Điểm mạnh là giúp bé hiểu bản chất thay vì chỉ nhớ tên",
      "Điểm yếu là line này thiên về nhận biết khái niệm hơn là chiến thuật mạnh",
      "Mục tiêu ở đây là hiểu vì sao đặt tượng khác ô sẽ tạo ra kế hoạch khác, chứ không phải buộc phải thuộc mọi nước như một cái bẫy",
    ],
  },
  line_italian_018: {
    title: "Morphy Defense Variation (Biến phòng thủ Morphy)",
    summary:
      "Đen chọn cách phòng thủ gọn gàng, ưu tiên phát triển và giữ cân bằng. Trắng cần tiếp tục chơi đúng bài để giữ thế dễ chịu.",
    goals: [
      "Giữ nhịp phát triển quân đều",
      "Không tấn công quá sớm khi đen đang rất chắc",
      "Tìm thời điểm tốt để mở trung tâm hoặc giành không gian",
    ],
    watchFor: [
      "Điểm mạnh là thế cờ gọn và ít sơ hở",
      "Điểm yếu là khó tạo đột phá nhanh nếu chỉ đi các nước chung chung",
      "Nếu đen cứ chơi thật chắc, trắng cần tìm lợi thế nhỏ như không gian hoặc trung tâm chứ không nên sốt ruột mở chiến thuật",
    ],
  },
  line_italian_019: {
    title: "Early Castling Trap (Bẫy nhập thành sớm)",
    summary:
      "Line này xoay quanh việc nhập thành sớm và khai thác cảm giác an toàn giả của đối thủ. Một nước tưởng rất tự nhiên đôi khi lại mở ra bẫy chiến thuật.",
    goals: [
      "Nhận ra vai trò của thời điểm nhập thành",
      "Hiểu rằng an toàn vua còn phụ thuộc vào quân xung quanh",
      "Quan sát đòn đánh bật mở khi đối thủ sơ hở",
    ],
    watchFor: [
      "Điểm mạnh là đánh vào thói quen đi quân máy móc",
      "Điểm yếu là nếu đối thủ cẩn thận, bẫy sẽ không còn sắc như ban đầu",
      "Nhập thành sớm không tự động là sai, cái quan trọng là quanh vua còn lỗ hổng hay không",
    ],
  },
  line_italian_020: {
    title: "Queenside Expansion (Mở rộng cánh hậu)",
    summary:
      "Ở nhánh này, Trắng đẩy tốt a lên a4 khá sớm để lấy không gian cánh hậu. Nhiều lúc mã b1 cũng đổi hướng sang a3 rồi c2 thay vì đi theo đường quen thuộc sang cánh vua.",
    goals: [
      "Ổn định vua và trung tâm trước khi mở rộng cánh hậu",
      "Hiểu rằng a4 nhằm chặn ...b5 và làm tượng b6 kém linh hoạt",
      "Tập chơi không gian thay vì lao vào chiến thuật ngay",
    ],
    watchFor: [
      "Điểm mạnh là thế trận rất có kế hoạch và ít rủi ro",
      "Điểm yếu là tác dụng đến chậm, nên bé cần kiên nhẫn và đi đúng ý tưởng",
      "Nếu tượng đen không đứng ở b6 hoặc trung tâm chưa ổn, a4 không phải lúc nào cũng là ưu tiên số một",
    ],
  },
};

/**
 * Italian Game opening lines (~20 variations).
 * Each line is a sequence of plies from the starting position.
 * validMoves uses SAN notation (chess.js standard).
 */
const italianGameLinesRaw: OpeningLine[] = [
  // ──────────────────────────────────────────────────
  // 1. Italian Game – Main Line (Giuoco Piano)
  // ──────────────────────────────────────────────────
  {
    id: "line_italian_001",
    name: "Italian Game – Slow Italian Main Line",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 1,
    tags: ["opening", "italian", "slow_italian", "giuoco_pianissimo", "e4"],
    trap: false,
    bookCoverage: {
      isBookAligned: true,
      priority: 100,
      summary: "Đây là line nhập môn nên học trước: dễ nhớ, rất phổ biến và dẫn tới trung cuộc rõ kế hoạch với tốt c3, tốt d3, nhập thành và xe sang e1.",
      references: [
        {
          bookId: "modernized-italian-game",
          title: "The Modernized Italian Game for White",
          page: 5,
          note: "Mục lục và phần mở đầu nhấn mạnh Giuoco Pianissimo, ý tưởng chiến lược và ảnh hưởng từ Spanish.",
        },
        {
          bookId: "winning-with-the-slow-italian",
          title: "Winning with the Slow (but Venomous!) Italian",
          page: 11,
          note: "Đề xuất setup c3, d3, O-O, Re1, Nbd2-f1-g3 là skeleton chính.",
        },
        {
          bookId: "italian-chess",
          title: "Italian Chess / Winning with the Slow Italian excerpt",
          page: 11,
          note: "Khẳng định main line hiện đại là Slow Italian thay cho d4 quá sớm.",
        },
      ],
    },
    outcome: {
      type: "middlegame",
      summary: "Sau 10...Re8, sơ đồ trung cuộc kiểu Italian/Spanish đã hiện rõ: trắng có thể tour mã sang g3 hoặc chuẩn bị d3-d4 đúng thời điểm.",
    },
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
        explain: "Đây là viên gạch đầu tiên của Slow Italian: giữ trung tâm linh hoạt và kiểm soát ô d4",
        tags: ["center_control", "pawn_structure"],
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["Nf6"],
        explain: "Đen phát triển mã tự nhiên và gây áp lực lên e4, buộc trắng phải chơi chính xác theo move order",
        tags: ["development"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["d3"],
        explain: "Đẩy tốt d3 để giữ trung tâm linh hoạt và chưa vội mở hết thế cờ khi các quân chưa vào vị trí đẹp",
        tags: ["center_control", "pawn_structure", "positional"],
      },
      {
        ply: 10,
        side: "b",
        validMoves: ["d6"],
        explain: "Đen củng cố e5 và chuẩn bị nhập thành, báo hiệu một trung cuộc giàu manoeuvre hơn là chiến thuật sớm",
        tags: ["center_control", "pawn_structure"],
      },
      {
        ply: 11,
        side: "w",
        validMoves: ["O-O"],
        explain: "Trắng đưa vua vào chỗ an toàn trước, để sau đó có thể dồn toàn bộ ý tưởng vào trung tâm và cánh vua",
        tags: ["king_safety"],
      },
      {
        ply: 12,
        side: "b",
        validMoves: ["O-O"],
        explain: "Đen cũng nhập thành, đưa ván cờ sang giai đoạn sắp hình thành sơ đồ trung cuộc chuẩn",
        tags: ["king_safety"],
      },
      {
        ply: 13,
        side: "w",
        validMoves: ["Re1"],
        explain: "Xe e1 vừa hỗ trợ đòn d3-d4 vừa sẵn sàng tạo sức ép trên trục e nếu trung tâm mở ra",
        tags: ["development", "center_control"],
      },
      {
        ply: 14,
        side: "b",
        validMoves: ["a6"],
        explain: "Đen chuẩn bị ...Ba7 hoặc ...Ba7 rồi ...Ba7 giữ tượng linh hoạt, đồng thời kiểm soát ô b5",
        tags: ["queenside", "development"],
      },
      {
        ply: 15,
        side: "w",
        validMoves: ["Bb3"],
        explain: "Tượng lùi về b3 để giữ đường chéo a2-g8 và tránh các nhịp ...Na5 đuổi tượng có lợi cho đen",
        tags: ["development", "king_safety"],
      },
      {
        ply: 16,
        side: "b",
        validMoves: ["Ba7"],
        explain: "Đen giữ tượng trên đường chéo dài và tránh việc bị đổi quá sớm",
        tags: ["development"],
      },
      {
        ply: 17,
        side: "w",
        validMoves: ["h3"],
        explain: "h3 chặn ...Bg4 và là một nước đệm quan trọng trước khi mã trắng bắt đầu tour sang g3",
        tags: ["king_safety", "positional"],
      },
      {
        ply: 18,
        side: "b",
        validMoves: ["h6"],
        explain: "Đen cũng lấy ô g5 khỏi tay trắng và giữ thế cờ cân bằng về nhịp",
        tags: ["king_safety", "positional"],
      },
      {
        ply: 19,
        side: "w",
        validMoves: ["Nbd2"],
        explain: "Mã ở b1 bắt đầu chuyển sang d2, rồi thường đi tiếp tới f1 và g3 để tăng sức ép lên cánh vua",
        tags: ["development", "positional"],
      },
      {
        ply: 20,
        side: "b",
        validMoves: ["Re8"],
        explain: "Đen đặt xe đối diện trung tâm, và từ đây cả hai bên bắt đầu tranh nhau thời điểm mở cờ hoặc chuyển quân sang cánh vua",
        tags: ["development", "center_control"],
      },
    ],
    strategicMotifs: [
      {
        id: "slow-italian-core-plan",
        title: "Italian/Spanish middlegame shell",
        triggerPly: 20,
        description: "Sau 10 nước đầu, cấu trúc chậm đã hoàn thiện. Trắng thường chọn giữa tour mã sang g3, đẩy d3-d4, hoặc mở rộng bằng a4 tùy phản ứng của đen.",
        plans: [
          "Tour mã Nbd2-f1-g3 để tăng lực lên f5, h5 và e4",
          "Chuẩn bị d3-d4 khi xe e1 và vua đã ổn định",
          "Giữ tượng b3 sống để hỗ trợ cánh vua hoặc đường chéo a2-g8",
        ],
        highlightSquares: ["e1", "d2", "f1", "g3"],
      },
    ],
    pawnStructures: [
      {
        id: "slow-italian-pawn-shell",
        title: "Khung tốt c3-d3",
        triggerPly: 9,
        description: "Khi c3 và d3 đã xuất hiện, trắng có cấu trúc Slow Italian điển hình: trung tâm chưa khóa cứng nhưng sẵn sàng hỗ trợ d4 về sau.",
        highlightSquares: ["c3", "d3"],
        dimBoard: true,
        plans: [
          "Giữ quyền chọn thời điểm d3-d4",
          "Cho tượng c4 và xe e1 nền hỗ trợ khi trung tâm mở",
        ],
      },
    ],
    commonBlunders: [
      {
        id: "early-d5-punish",
        title: "Đen đẩy ...d5 quá sớm",
        description: "Nếu đen đẩy tốt d5 quá sớm, trắng có thể mở trung tâm ngay và kéo các quân đen vào thế bị động.",
        triggerModes: ["wrong_move", "warning_button"],
        targetPly: 10,
        wrongMoves: ["d5"],
        punishmentLine: ["exd5", "Nxd5", "Qb3"],
        refutation: {
          blunderMove: "d5",
          continuation: ["exd5", "Nxd5", "Qb3", "Nf6", "Bxf7+", "Kf8", "d4"],
          summary: "Trắng mở trung tâm, kéo mã đen rời điểm tựa rồi đưa hậu và tượng vào thế gây áp lực mạnh lên vua đen.",
          finalEval: 1.1,
        },
        severity: "blunder",
      },
    ],
    pieceJourneys: [
      {
        id: "spanish-knight-tour",
        title: "Spanish Knight Tour",
        description: "Lộ trình quen thuộc của mã b1 là đi qua d2, f1 rồi sang g3 để tăng lực tấn công cánh vua.",
        trigger: "hover_piece",
        originSquare: "b1",
        path: ["d2", "f1", "g3"],
        recommendedPly: 19,
      },
    ],
    variationGroups: [
      {
        id: "black-repertoire-choices",
        title: "Các phản ứng thường gặp của đen",
        intro: "Đen có thể đổi thứ tự phát triển để thử làm chậm kế hoạch của trắng. Các nhánh dưới đây giúp bé nhớ cách giữ khung tốt vững và tiếp tục phát triển bình tĩnh.",
        variations: [
          {
            id: "two-knights-slow",
            name: "Two Knights without ...Bc5",
            description: "Đen đưa mã ra f6 sớm. Trắng vẫn có thể giữ kế hoạch chậm với tốt d3 thay vì lao ngay vào chiến thuật.",
            startingPly: 6,
            reviewPlies: 1,
            outcome: {
              type: "middlegame",
              summary: "Sau khi cả hai bên nhập thành và trắng dựng c3, thế cờ vẫn vào trung cuộc chiến lược cùng skeleton quen thuộc.",
            },
            moves: [
              {
                ply: 6,
                side: "b",
                validMoves: ["Nf6"],
                explain: "Đen chọn Two Knights move order để gây sức ép lên e4 và né cấu trúc đối xứng chuẩn",
                tags: ["development", "counterattack"],
              },
              {
                ply: 7,
                side: "w",
                validMoves: ["d3"],
                explain: "Trắng đẩy tốt d3 để giữ thế chắc và tiếp tục đi vào trung cuộc quen thuộc, không cần nóng vội đổi sang đánh chiến thuật ngay",
                tags: ["pawn_structure", "positional"],
              },
              {
                ply: 8,
                side: "b",
                validMoves: ["Be7"],
                explain: "Đen phát triển chắc để chuẩn bị nhập thành và giữ thế gọn gàng",
                tags: ["development", "king_safety"],
              },
              {
                ply: 9,
                side: "w",
                validMoves: ["O-O"],
                explain: "Trắng tiếp tục theo ưu tiên an toàn vua trước khi dựng c3 và Re1",
                tags: ["king_safety"],
              },
              {
                ply: 10,
                side: "b",
                validMoves: ["O-O"],
                explain: "Đen hoàn tất nhập thành và chuẩn bị tranh trung tâm sau",
                tags: ["king_safety"],
              },
              {
                ply: 11,
                side: "w",
                validMoves: ["c3"],
                explain: "Trắng dựng luôn cái khung quen thuộc c3-d3 để hướng về Re1 và d4",
                tags: ["pawn_structure", "center_control"],
              },
            ],
          },
          {
            id: "hungarian-defense",
            name: "Hungarian Defense",
            description: "Đen lùi tượng về e7 để dựng một thế rất kín và chắc chắn.",
            startingPly: 6,
            reviewPlies: 1,
            outcome: {
              type: "middlegame",
              summary: "Sau d3, O-O và c3, trắng giữ thế dễ chơi hơn nhờ không gian và kế hoạch rõ ràng hơn đen.",
            },
            moves: [
              {
                ply: 6,
                side: "b",
                validMoves: ["Be7"],
                explain: "Đen lùi tượng về e7 để tránh mọi motif quanh f7 và dựng một thế rất kín",
                tags: ["development", "king_safety"],
              },
              {
                ply: 7,
                side: "w",
                validMoves: ["d3"],
                explain: "Trắng vẫn trung thành với setup chậm vì đen chưa đưa ra lý do để phải mở cờ ngay",
                tags: ["pawn_structure", "positional"],
              },
              {
                ply: 8,
                side: "b",
                validMoves: ["Nf6"],
                explain: "Đen tiếp tục phát triển bình thường, nhưng trắng thường là bên có kế hoạch rõ hơn",
                tags: ["development"],
              },
              {
                ply: 9,
                side: "w",
                validMoves: ["O-O"],
                explain: "Hoàn tất an toàn vua trước khi dựng c3 và Re1",
                tags: ["king_safety"],
              },
              {
                ply: 10,
                side: "b",
                validMoves: ["O-O"],
                explain: "Đen đưa vua vào chỗ an toàn và ván cờ dần chuyển sang thế trận dài hơi",
                tags: ["king_safety"],
              },
              {
                ply: 11,
                side: "w",
                validMoves: ["c3"],
                explain: "Khung tốt c3-d3 xuất hiện và chuẩn bị cho d4 hoặc tour mã sang g3",
                tags: ["pawn_structure", "center_control"],
              },
            ],
          },
        ],
      },
      {
        id: "white-plan-choices",
        title: "Các kế hoạch chính của trắng",
        intro: "Khi đã dựng xong khung phát triển an toàn, trắng thường đi theo hai hướng lớn: mở rộng cánh hậu bằng tốt a4 hoặc chờ đúng lúc để đẩy tốt d4 vào trung tâm.",
        variations: [
          {
            id: "modern-a4-system",
            name: "Modern a4 System",
            description: "Ý tưởng a4 sớm nhằm giành không gian cánh hậu và nhiều khi chuẩn bị Na3-c2 thay vì tour mã truyền thống.",
            startingPly: 13,
            reviewPlies: 1,
            outcome: {
              type: "middlegame",
              summary: "Sau a4, trắng chuyển sang một trung cuộc positional nơi không gian cánh hậu và sự linh hoạt của mã trở thành chủ đề chính.",
            },
            moves: [
              {
                ply: 13,
                side: "w",
                validMoves: ["a4"],
                explain: "a4 chiếm không gian, chặn ý tưởng ...b5 và mở đường cho Na3-c2 trong một số cấu trúc",
                tags: ["queenside", "positional"],
              },
              {
                ply: 14,
                side: "b",
                validMoves: ["a6"],
                explain: "Đen phản ứng tương tự để giữ ô b5 và tránh bị bó cánh hậu quá mức",
                tags: ["queenside"],
              },
              {
                ply: 15,
                side: "w",
                validMoves: ["Na3"],
                explain: "Na3 là motif rất đặc trưng của nhánh a4: mã hướng tới c2 hoặc b5 tùy cấu trúc",
                tags: ["development"],
              },
              {
                ply: 16,
                side: "b",
                validMoves: ["Ba7"],
                explain: "Đen giữ tượng trên đường chéo lớn và theo dõi các ô trung tâm lẫn cánh hậu",
                tags: ["development"],
              },
            ],
          },
          {
            id: "timed-d4-break",
            name: "Timed d3-d4 Break",
            description: "Chỉ nên mở trung tâm bằng tốt d4 khi vua đã an toàn, xe đã sang e1 và các quân đã phối hợp đủ tốt.",
            startingPly: 13,
            reviewPlies: 1,
            outcome: {
              type: "middlegame",
              summary: "Khi d4 được đẩy đúng lúc, trắng bước vào trung cuộc với thế chủ động tự nhiên hơn và đen phải chứng minh sự phối hợp tốt của mình.",
            },
            moves: [
              {
                ply: 13,
                side: "w",
                validMoves: ["d4"],
                explain: "Bây giờ d4 mới thực sự mạnh vì vua đã an toàn và xe e1 đã hậu thuẫn trung tâm",
                tags: ["center_control"],
              },
              {
                ply: 14,
                side: "b",
                validMoves: ["Ba7"],
                explain: "Đen giữ tượng linh hoạt và đợi xem trung tâm sẽ mở theo cách nào",
                tags: ["development"],
              },
              {
                ply: 15,
                side: "w",
                validMoves: ["Nbd2"],
                explain: "Trắng vừa hỗ trợ e4 vừa giữ tùy chọn tour mã hoặc đổi quân sau khi trung tâm căng hơn",
                tags: ["development", "center_control"],
              },
              {
                ply: 16,
                side: "b",
                validMoves: ["Re8"],
                explain: "Đen đặt xe vào cột e, và từ đây cả hai bên sẽ tranh nhau chất lượng thời điểm mở trung tâm",
                tags: ["development"],
              },
            ],
          },
        ],
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
    name: "Two Knights without ...Bc5",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 2,
    tags: ["opening", "italian", "two_knights"],
    trap: false,
    bookCoverage: {
      isBookAligned: true,
      priority: 95,
      summary: "Nhánh này rất hữu ích để học cách giữ bình tĩnh trước 3...Nf6 và vẫn xây được thế chậm, dễ chơi.",
      references: [
        {
          bookId: "winning-with-the-slow-italian",
          title: "Winning with the Slow (but Venomous!) Italian",
          page: 26,
          note: "Chapter 3: Two Knights without ...Bc5.",
        },
        {
          bookId: "italian-chess",
          title: "Italian Chess / Winning with the Slow Italian excerpt",
          page: 26,
          note: "Mục riêng cho 3...Nf6 với 4.d3.",
        },
      ],
    },
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
        explain: "Đen chọn Two Knights move order để tăng nhịp phản công thay vì dựng đối xứng với ...Bc5",
        tags: ["development", "counterattack"],
      },
      {
        ply: 7,
        side: "w",
        validMoves: ["d3"],
        explain: "Đẩy tốt d3 để giữ ván cờ trong thế chậm, chắc và ít phụ thuộc vào việc phải nhớ thật nhiều đòn chiến thuật",
        tags: ["pawn_structure", "positional"],
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["Be7"],
        explain: "Một setup rất thực dụng của đen: nhập thành sớm rồi tranh trung tâm sau",
        tags: ["development", "king_safety"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["O-O"],
        explain: "Trắng vẫn ưu tiên an toàn vua trước khi dựng c3 và Re1",
        tags: ["king_safety"],
      },
      {
        ply: 10,
        side: "b",
        validMoves: ["O-O"],
        explain: "Đen hoàn tất phát triển an toàn để chuẩn bị ...d6 hoặc ...d5",
        tags: ["king_safety"],
      },
      {
        ply: 11,
        side: "w",
        validMoves: ["c3"],
        explain: "Cấu trúc c3-d3 giúp trắng đưa ván cờ về đúng skeleton quen thuộc của repertoire",
        tags: ["pawn_structure", "center_control"],
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
    commonBlunders: [
      {
        id: "fried-liver-sensitive-moment",
        title: "Cảnh báo ở nước 3...Nf6",
        description: "Đây là thời điểm nhạy cảm nhất của line Fried Liver. Nếu đen không biết đòn quanh f7, trắng có thể chuyển ngay sang tấn công chiến thuật mạnh.",
        triggerModes: ["warning_button", "wrong_move"],
        targetPly: 6,
        wrongMoves: ["Nf6"],
        punishmentLine: ["Ng5", "d5", "exd5", "Nxd5", "Nxf7"],
        refutation: {
          blunderMove: "Nf6",
          continuation: ["Ng5", "d5", "exd5", "Nxd5", "Nxf7", "Kxf7", "Qf3+"],
          summary: "Đây là nhịp rất nhạy cảm: nếu trắng chuyển sang tấn công ngay, vua đen dễ bị kéo ra giữa bàn bằng một chuỗi nước rất dễ nhớ.",
        },
        severity: "mistake",
      },
    ],
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
    name: "Giuoco Pianissimo – Classical Setup",
    opening: "Italian Game",
    fenStart: "startpos",
    difficulty: 2,
    tags: ["opening", "italian", "quiet", "positional"],
    trap: false,
    bookCoverage: {
      isBookAligned: true,
      priority: 98,
      summary: "Đây là khung phát triển mẫu để bé làm quen với cách chơi chậm, chắc và nhiều kế hoạch chuyển quân đẹp.",
      references: [
        {
          bookId: "modernized-italian-game",
          title: "The Modernized Italian Game for White",
          page: 51,
          note: "Chương lớn về strategic ideas & themes của Giuoco Pianissimo.",
        },
        {
          bookId: "winning-with-the-slow-italian",
          title: "Winning with the Slow (but Venomous!) Italian",
          page: 11,
          note: "Concept of the book đặt Pianissimo làm main repertoire.",
        },
      ],
    },
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
        validMoves: ["c3"],
        explain: "c3 giữ cho trung tâm linh hoạt và báo hiệu ngay cấu trúc Slow Italian",
        tags: ["pawn_structure", "center_control"],
      },
      {
        ply: 8,
        side: "b",
        validMoves: ["Nf6"],
        explain: "Đen chọn cách phát triển tự nhiên nhất và gây sức ép lên e4",
        tags: ["development"],
      },
      {
        ply: 9,
        side: "w",
        validMoves: ["d3"],
        explain: "d3 hoàn thiện khung tốt chính của Slow Italian và giữ lại đòn d4 cho lúc thuận lợi hơn",
        tags: ["positional", "pawn_structure"],
      },
      {
        ply: 10,
        side: "b",
        validMoves: ["d6"],
        explain: "Đen cũng củng cố trung tâm, hướng tới một cuộc đấu maneuver lâu dài",
        tags: ["pawn_structure"],
      },
      {
        ply: 11,
        side: "w",
        validMoves: ["O-O"],
        explain: "Nhập thành trước khi chọn giữa Re1, Nbd2-f1-g3 hoặc d4",
        tags: ["king_safety"],
      },
      {
        ply: 12,
        side: "b",
        validMoves: ["O-O"],
        explain: "Khi cả hai bên đã nhập thành, thế trận dài hơi bắt đầu hiện ra rõ hơn và kế hoạch chuyển quân trở nên quan trọng",
        tags: ["king_safety"],
      },
      {
        ply: 13,
        side: "w",
        validMoves: ["Re1"],
        explain: "Re1 là một mắt xích rất hay gặp trong repertoire vì nó vừa hỗ trợ d4 vừa tăng áp lực trục e",
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
    bookCoverage: {
      isBookAligned: true,
      priority: 88,
      summary: "Hungarian Defense là một nhánh phụ chắc chắn của đen và rất đáng học để bé không bị bất ngờ khi đối thủ chơi kín.",
      references: [
        {
          bookId: "winning-with-the-slow-italian",
          title: "Winning with the Slow (but Venomous!) Italian",
          page: 15,
          note: "Third move sidelines cho các lựa chọn sớm không vào main line.",
        },
      ],
    },
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
    bookCoverage: {
      isBookAligned: true,
      priority: 90,
      summary: "Nhánh đẩy tốt a4 sớm là lựa chọn rất hay để giành không gian cánh hậu và dẫn sang trung cuộc dễ lập kế hoạch.",
      references: [
        {
          bookId: "modernized-italian-game",
          title: "The Modernized Italian Game for White",
          page: 5,
          note: "Table of Contents có mục The Modern Line with a2-a4.",
        },
        {
          bookId: "winning-with-the-slow-italian",
          title: "Winning with the Slow (but Venomous!) Italian",
          page: 11,
          note: "Nhắc rõ modern approach với a4 và Na3-c2.",
        },
      ],
    },
    pieceJourneys: [
      {
        id: "na3-c2-route",
        title: "Modern Knight Route",
        description: "Trong nhánh a4, mã b1 thường đổi hướng sang a3 rồi c2 để hỗ trợ trung tâm và cánh hậu.",
        trigger: "hover_piece",
        originSquare: "b1",
        path: ["a3", "c2"],
        recommendedPly: 13,
      },
    ],
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
        validMoves: ["Nf6"],
        explain: "Đen phát triển mã để chuẩn bị hoàn thiện thế trận",
        tags: ["development"],
      },
      {
        ply: 13,
        side: "w",
        validMoves: ["a4"],
        explain:
          "Đi a4 để lấy thêm không gian cánh hậu, chặn ý tưởng ...b5 và làm tượng đen ở b6 bớt linh hoạt. Nước này mạnh vì trung tâm đã ổn và vua trắng đã an toàn.",
        tags: ["queenside", "positional"],
      },
      {
        ply: 14,
        side: "b",
        validMoves: ["a6"],
        explain: "Đen phản ứng đối xứng để giữ ô b5 và chuẩn bị giảm bớt sức nặng của a4",
        tags: ["queenside"],
      },
      {
        ply: 15,
        side: "w",
        validMoves: ["Na3"],
        explain: "Mã sang a3 để chuẩn bị nhảy tới c2, thay vì đi lộ trình d2-f1-g3 như ở các setup khác",
        tags: ["development", "queenside"],
      },
    ],
  },
];

export const italianGameLines: OpeningLine[] = italianGameLinesRaw
  .map((line) => ({
    ...line,
    guide: italianGameGuideByLineId[line.id],
  }))
  .sort((a, b) => {
    const aPriority = a.bookCoverage?.isBookAligned ? a.bookCoverage.priority : -1;
    const bPriority = b.bookCoverage?.isBookAligned ? b.bookCoverage.priority : -1;
    return bPriority - aPriority;
  });

export default italianGameLines;

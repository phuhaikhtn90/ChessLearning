# ChessLearning

ChessLearning la mot ung dung Next.js giup nguoi hoc luyen tap khai cuoc co vua theo kieu nho lap lai. Phien ban hien tai tap trung vao nhom khai cuoc `Italian Game`, ket hop ban co tuong tac, he thong XP/level, theo doi tien do va co che uu tien bai hoc dua tren lich on tap don gian.

## Muc tieu project

- Giup nguoi hoc nho cac bien the khai cuoc bang cach thuc hanh truc tiep tren ban co
- Tang kha nang ghi nho bang co che on tap lai theo streak va `nextDue`
- Tao trai nghiem hoc nhe, de tiep can, uu tien mobile va nguoi moi

## Tinh nang hien co

- Trang tong quan voi:
  - nut bat dau luyen tap
  - thanh XP / level
  - muc tieu hoc trong ngay
  - thong ke so khai cuoc da thanh thao
- Trang `practice`:
  - hien ban co tuong tac bang `react-chessboard`
  - kiem tra nuoc di bang `chess.js`
  - cho phep hoc tung line khai cuoc theo thu tu
  - tu dong danh nuoc cua doi thu khi den luot
  - thong bao sai va giai thich ngan gon
  - cong XP theo ket qua lam bai
- Trang `progress`:
  - tong hop so bai da hoc, da thanh thao, tong so line
  - hien do tu tin, streak, trap, do kho cua tung line
- Du lieu hoc:
  - hien dang co 20 bien the `Italian Game`
  - co line thuong va line dang `trap`
- Luu tien do local:
  - luu `progress`, `stats`, `daily session`, `attempt log` bang `localStorage`
  - khong can database de chay local

## Co che hoc hien tai

Project dang dung mot mo hinh don gian de xep lich bai hoc:

- Bai chua hoc duoc uu tien o muc trung binh va co them yeu to ngau nhien
- Bai da hoc duoc cham diem dua tren:
  - `successRate`
  - `mistakeCount`
  - thoi gian qua han `nextDue`
  - mot chut random de tranh lap lai qua cung
- Sau moi lan hoan thanh:
  - neu dung hoan toan, `correctStreak` tang
  - neu sai, streak reset ve `0`
  - `nextDue` duoc tinh lai dua tren streak
  - `confidence` duoc cap nhat tu ti le dung va streak

XP hien dang duoc tinh nhu sau:

- `20 XP` neu hoan thanh hoan hao
- `10 XP` neu hoan thanh dung nhung khong perfect
- `2 XP` neu co sai sot

Moi `100 XP` tang 1 level.

## Cong nghe su dung

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `chess.js`
- `react-chessboard`

## Cau truc thu muc

```text
src/
  app/
    page.tsx                # Trang tong quan
    practice/page.tsx       # Trang luyen tap
    progress/page.tsx       # Trang tien do
    api/                    # API routes don gian
  components/
    ChessBoardPractice.tsx  # Ban co va logic tuong tac
    XPBar.tsx
    ProgressList.tsx
    DailyGoalCard.tsx
  data/openings/
    italian_game.ts         # Danh sach cac line khai cuoc
  lib/
    contentSelection.ts     # Chon bai tiep theo
    spacedRepetition.ts     # Cap nhat tien do / nextDue
    progressTracker.ts      # Doc ghi localStorage
    moveValidation.ts       # Kiem tra nuoc di
    explanationEngine.ts    # Sinh thong diep giai thich
  types/
    index.ts                # Kieu du lieu chinh
```

## Cai dat va chay local

Yeu cau:

- `Node.js` 20 tro len
- `npm`

Chay project:

```bash
npm install
npm run dev
```

Sau do mo `http://localhost:3000`.

Lenh huu ich:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Cac route hien co

Giao dien hien tai chu yeu chay tren client, nhung project da co san mot so API route:

- `GET /api/lesson/next`
  - nhan `progress` qua query string
  - tra ve line tiep theo can hoc
- `POST /api/attempt`
  - nhan attempt va progress hien tai
  - tra ve progress moi, XP va attempt da chuan hoa
- `GET /api/progress`
  - nhan `progress` qua query string
  - tra ve thong ke tong hop va danh sach line

## Luu tru du lieu

Du lieu hien tai duoc luu o trinh duyet thong qua `localStorage`:

- `chess_progress`
- `chess_stats`
- `chess_attempts`
- `chess_session_<userId>`

Mac dinh app dang dung `userId = "guest"`.

## Gioi han hien tai

- Chua co dang nhap va dong bo du lieu giua nhieu thiet bi
- Chua co backend/database that su
- Noi dung bai hoc hien moi tap trung vao `Italian Game`
- API route moi o muc co ban, giao dien hien tai van doc/ghi local truoc
- Chua co test tu dong

## Huong mo rong goi y

- Them nhieu opening khac nhu `Sicilian`, `French`, `Queen's Gambit`
- Dong bo tien do len server
- Them phan tich loi nang cao va phan loai mistake tot hon
- Them dashboard lich su hoc tap theo ngay/tuan
- Them bai hoc theo mau chien thuat, middle game va endgame

## Ghi chu

Day la mot nen tang rat phu hop de phat trien thanh ung dung hoc co vua ca nhan hoa. Neu ban muon mo rong project, diem bat dau tot nhat la tach du lieu opening ra thanh nhieu module, sau do dua phan progress sang backend de co the dong bo giua cac phien hoc.

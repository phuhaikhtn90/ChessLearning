# Dieu khien project bang Discord tren mobile

Tai lieu nay huong dan cau hinh mot bot Discord de ban co the gui lenh tu dien thoai vao may dang chua repo nay. Bot se nhan slash command, chay `codex exec`, `npm run build`, `npm run dev`, va tra log ve Discord.

## 1. Cach no hoat dong

Luong tong quat:

1. Dien thoai cua ban gui lenh trong Discord.
2. Bot Discord dang chay tren may Mac/VPS cua ban nhan lenh.
3. Bot goi `codex exec` hoac lenh local trong repo `ChessLearning`.
4. Ket qua va log duoc gui lai vao Discord.

Dieu quan trong:

- Bot phai chay tren chinh may co repo va co cai `codex`.
- Bot nay khong tu dong mo UI tren may. No chi chay lenh terminal.
- De an toan, bot co allowlist theo `user id` va co the gioi han them theo `channel id`.

## 2. Nhung gi da duoc them vao repo

Repo da co san:

- Script bot: `scripts/discord-codex-bot.mjs`
- Mau env: `.env.discord.example`
- Script npm: `npm run discord:bot`

Lenh bot ho tro:

- `/help`
- `/status`
- `/build`
- `/dev_start`
- `/dev_stop`
- `/dev_logs`
- `/codex`
- `/logs`
- `/cancel`

Ngoai ra bot con nhan lenh text theo prefix, mac dinh la `!`, vi du:

- `!status`
- `!codex sua trang practice de hien opening name ro hon`

## 3. Tao bot trong Discord Developer Portal

Ban can tao bot mot lan:

1. Mo Discord Developer Portal.
2. Tao mot application moi.
3. Vao tab `Bot`.
4. Tao bot user cho application do.
5. Bat `MESSAGE CONTENT INTENT` neu ban muon dung lenh text prefix nhu `!codex ...`.
6. Sao chep `Bot Token` va luu an toan. Khong commit token vao git.
7. Lay `Application ID` trong tab `General Information`.

Khuyen nghi:

- Dung slash command la chinh, vi tren mobile de dung hon.
- Chi giu `MESSAGE CONTENT INTENT` neu ban can lenh text. Neu khong, co the tat.

## 4. Moi bot vao server Discord cua ban

Bot can vao mot server ma ban quan ly:

1. Trong Developer Portal, vao `OAuth2` -> `URL Generator`.
2. Chon scope:
   - `bot`
   - `applications.commands`
3. Chon bot permissions toi thieu:
   - `View Channels`
   - `Send Messages`
   - `Read Message History`
   - `Use Slash Commands`
4. Mo URL duoc tao ra.
5. Chon server Discord cua ban va authorize.

Sau khi moi xong, bot se xuat hien trong server.

## 5. Lay Discord IDs can thiet

Ban can 2 gia tri:

- `DISCORD_GUILD_ID`: ID cua server de dang ky slash command nhanh theo guild
- `DISCORD_ALLOWED_USER_IDS`: ID cua tai khoan Discord duoc phep ra lenh

Cach lay ID:

1. Trong Discord mobile hoac desktop, vao `Settings` -> `Advanced`.
2. Bat `Developer Mode`.
3. Quay lai server hoac tai khoan cua ban.
4. Nhan `Copy Server ID` va `Copy User ID`.
5. Neu muon khoa bot vao mot kenh duy nhat, copy them `Channel ID`.

## 6. Tao file env local

Trong repo nay:

```bash
cp .env.discord.example .env.discord.local
```

Mo `.env.discord.local` va dien:

```env
DISCORD_BOT_TOKEN=...
DISCORD_APP_ID=...
DISCORD_GUILD_ID=...
DISCORD_ALLOWED_USER_IDS=123456789012345678
DISCORD_ALLOWED_CHANNEL_IDS=123456789012345678
DISCORD_COMMAND_PREFIX=!
CODEX_MODEL=
CODEX_EXTRA_ARGS=
```

Ghi chu:

- `DISCORD_ALLOWED_CHANNEL_IDS` co the bo trong.
- `CODEX_MODEL` co the bo trong neu ban muon dung cau hinh Codex mac dinh.
- `CODEX_EXTRA_ARGS` dung khi ban muon them co dinh, vi du `--search`.

## 7. Cai dependency

Bot can them `discord.js`:

```bash
npm install
```

Neu may da co `node_modules` cu, van nen chay lai `npm install` de cap nhat dependency moi.

## 8. Chay bot

Chay thu local:

```bash
node --env-file=.env.discord.local scripts/discord-codex-bot.mjs
```

Hoac dung npm script:

```bash
NODE_OPTIONS="--env-file=.env.discord.local" npm run discord:bot
```

Neu thanh cong, terminal se in thong bao bot da `ready`.

## 9. Thu lenh tren mobile

Trong kenh Discord da cho phep, ban thu:

```text
/status
```

Sau do:

```text
/codex prompt:Sua README de them huong dan deploy len Vercel
```

Hoac lenh text:

```text
!codex sua giao dien trang practice cho mobile gon hon
```

Bot se:

1. Tao task trong `.discord-runtime/tasks/`
2. Chay `codex exec` ngay tren repo nay
3. Gui phan tom tat va log cuoi ve Discord

## 10. Cac lenh nen dung hang ngay

- `/status`: xem nhanh repo va job hien tai
- `/codex`: giao viec sua code
- `/build`: check project co build duoc khong
- `/logs`: xem log cua job build/Codex gan nhat
- `/dev_start`: mo Next dev server
- `/dev_logs`: doc log dev server
- `/dev_stop`: tat dev server
- `/cancel`: huy tac vu dang chay

## 11. Cach chay nen de dung lau dai

Neu ban muon bot luon online, dung `tmux`, `screen` hoac `launchd`.

### Cach nhanh bang `tmux`

```bash
tmux new -s chess-discord
cd /Users/haile/Documents/github/ChessLearning
node --env-file=.env.discord.local scripts/discord-codex-bot.mjs
```

Tach khoi session:

```bash
Ctrl+B, roi bam D
```

Quay lai:

```bash
tmux attach -t chess-discord
```

## 12. Gioi han va canh bao

- Bot nay co the sua code that su vi no goi `codex exec`.
- Chi nen allow user ID cua chinh ban.
- Nen khoa them theo `channel ID`.
- Khong nen dung bot nay trong server cong khai.
- Neu may Mac tat ngu hoac mat mang, bot se ngung nhan lenh.
- `codex exec --full-auto` co quyen sua file trong repo, nen ban can chap nhan rui ro nay.

## 13. Cach dung an toan hon

Neu ban muon chat hon, sua `scripts/discord-codex-bot.mjs` de:

- bo `/codex`, chi giu `/build` va `/status`
- hoac doi `--full-auto` thanh mode sandbox chat hon
- hoac bat buoc prompt phai bat dau bang mot tien to nhu `safe:`

## 14. Kiem tra loi thuong gap

### Bot online nhung khong co slash command

Kiem tra:

- `DISCORD_APP_ID` dung chua
- `DISCORD_GUILD_ID` dung chua
- bot da duoc moi vao dung server chua

### Dung duoc `/status` nhung `/codex` khong chay

Kiem tra:

- `codex` co trong `PATH` cua shell dang chay bot
- may da login `codex` chua
- bot co quyen ghi trong repo chua

Thu nhanh:

```bash
which codex
codex --help
```

### Bot bao khong duoc phep

Kiem tra:

- `DISCORD_ALLOWED_USER_IDS`
- `DISCORD_ALLOWED_CHANNEL_IDS`

### `/dev_start` chay nhung khong vao duoc app tu mobile

Bot chi bat dev server, khong tu dong public app ra internet. De mo tren dien thoai:

1. Neu cung wifi, dung IP LAN cua may Mac, vi du `http://192.168.1.x:3000`
2. Neu Next dev chi bind `localhost`, can chay app voi host `0.0.0.0`
3. Neu muon truy cap tu ngoai mang nha, dung reverse tunnel nhu Cloudflare Tunnel hoac Tailscale Funnel

## 15. Luong su dung toi khuyen nghi

1. Dung Discord chi de giao task, xem log, va chay build.
2. De Codex xu ly sua code qua `/codex`.
3. Truoc khi merge hay deploy, van quay lai may chinh de review diff.

Voi repo nay, day la cach de nhat de "ra lenh sua project tren mobile" ma khong can tu viet backend dieu khien phuc tap.

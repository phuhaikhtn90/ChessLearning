import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import {
  ActivityType,
  ChannelType,
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const runtimeDir = path.join(repoRoot, ".discord-runtime");
const tasksDir = path.join(runtimeDir, "tasks");
const logsDir = path.join(runtimeDir, "logs");

const token = requiredEnv("DISCORD_BOT_TOKEN");
const appId = requiredEnv("DISCORD_APP_ID");
const guildId = readOptionalSnowflake("DISCORD_GUILD_ID");
const prefix = (process.env.DISCORD_COMMAND_PREFIX || "!")
  .trim()
  .slice(0, 3);
const allowedUsers = parseSnowflakeCsv("DISCORD_ALLOWED_USER_IDS");
const allowedChannels = parseSnowflakeCsv("DISCORD_ALLOWED_CHANNEL_IDS");
const codexModel = process.env.CODEX_MODEL?.trim() || "";
const codexExtraArgs = parseShellWords(process.env.CODEX_EXTRA_ARGS || "");

const commandDefs = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Xem danh sach lenh Discord control"),
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Xem trang thai repo va job hien tai"),
  new SlashCommandBuilder()
    .setName("whoami")
    .setDescription("Hien user id, channel id va guild id hien tai"),
  new SlashCommandBuilder()
    .setName("build")
    .setDescription("Chay npm run build trong repo"),
  new SlashCommandBuilder()
    .setName("dev_start")
    .setDescription("Bat next dev server"),
  new SlashCommandBuilder()
    .setName("dev_stop")
    .setDescription("Tat next dev server"),
  new SlashCommandBuilder()
    .setName("dev_logs")
    .setDescription("Xem log gan nhat cua dev server")
    .addIntegerOption((option) =>
      option
        .setName("lines")
        .setDescription("So dong cuoi can xem")
        .setMinValue(10)
        .setMaxValue(150)
    ),
  new SlashCommandBuilder()
    .setName("codex")
    .setDescription("Gui yeu cau sua project cho Codex CLI")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Yeu cau can Codex thuc hien")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Xem log cua job Codex/build gan nhat")
    .addIntegerOption((option) =>
      option
        .setName("lines")
        .setDescription("So dong cuoi can xem")
        .setMinValue(10)
        .setMaxValue(150)
    ),
  new SlashCommandBuilder()
    .setName("tail")
    .setDescription("Xem phan cuoi cua log dang chay hoac log gan nhat")
    .addIntegerOption((option) =>
      option
        .setName("lines")
        .setDescription("So dong cuoi can xem")
        .setMinValue(10)
        .setMaxValue(150)
    ),
  new SlashCommandBuilder()
    .setName("cancel")
    .setDescription("Huy job Codex/build dang chay"),
].map((command) => command.toJSON());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const state = {
  currentJob: null,
  devServer: null,
  latestLogPath: null,
  latestTaskPath: null,
};

client.once("clientReady", async () => {
  await ensureRuntimeDirs();
  await registerCommands();
  client.user.setActivity("mobile project control", {
    type: ActivityType.Listening,
  });
  console.log(
    `Discord bot ready as ${client.user.tag}. Registered ${
      guildId ? "guild" : "global"
    } commands.`
  );
});

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (!isAuthorized(interaction.user.id, interaction.channelId)) {
    await interaction.reply({
      content: "Ban khong duoc phep dung bot nay.",
      ephemeral: true,
    });
    return;
  }

  try {
    switch (interaction.commandName) {
      case "help":
        await interaction.reply({
          content: helpText(),
          ephemeral: true,
        });
        break;
      case "status":
        await interaction.reply({
          content: await buildStatusText(),
          ephemeral: true,
        });
        break;
      case "whoami":
        await interaction.reply({
          content: buildWhoAmIText(
            interaction.user.id,
            interaction.channelId,
            interaction.guildId || ""
          ),
          ephemeral: true,
        });
        break;
      case "build":
        await startBuild(interaction);
        break;
      case "dev_start":
        await startDevServer(interaction);
        break;
      case "dev_stop":
        await stopDevServer(interaction);
        break;
      case "dev_logs":
        await sendDevLogs(interaction);
        break;
      case "codex":
        await startCodex(interaction);
        break;
      case "logs":
        await sendLatestLogs(interaction);
        break;
      case "tail":
        await sendTailLogs(interaction);
        break;
      case "cancel":
        await cancelCurrentJob(interaction);
        break;
      default:
        await interaction.reply({
          content: "Lenh chua duoc ho tro.",
          ephemeral: true,
        });
    }
  } catch (error) {
    const message = `Loi: ${error instanceof Error ? error.message : String(error)}`;
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guildId) {
    return;
  }
  if (!isAuthorized(message.author.id, message.channelId)) {
    return;
  }
  if (!message.content.startsWith(prefix)) {
    return;
  }

  const [rawCommand, ...rest] = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = rawCommand?.toLowerCase();
  const body = rest.join(" ").trim();

  if (!command) {
    return;
  }

  if (command === "help") {
    await message.reply(helpText());
    return;
  }

  if (command === "status") {
    await message.reply(await buildStatusText());
    return;
  }

  if (command === "whoami") {
    await message.reply(
      buildWhoAmIText(message.author.id, message.channelId, message.guildId || "")
    );
    return;
  }

  if (command === "logs") {
    await message.reply(await formatLogResponse(state.latestLogPath, 60));
    return;
  }

  if (command === "tail") {
    const logPath = state.currentJob?.logPath || state.latestLogPath;
    await message.reply(await formatLogResponse(logPath, 60));
    return;
  }

  if (command === "devlogs") {
    await message.reply(await formatLogResponse(state.devServer?.logPath, 60));
    return;
  }

  if (command === "cancel") {
    if (!state.currentJob) {
      await message.reply("Khong co job nao dang chay.");
      return;
    }
    state.currentJob.child.kill("SIGTERM");
    await message.reply(`Da gui yeu cau huy job \`${state.currentJob.name}\`.`);
    return;
  }

  if (command === "codex") {
    if (!body) {
      await message.reply(`Dung: \`${prefix}codex <yeu cau>\``);
      return;
    }
    await message.reply("Da nhan yeu cau. Toi dang chay Codex tren may nay.");
    await runCodexJob(message.channel, body, message.author.id);
    return;
  }
});

await client.login(token);

async function ensureRuntimeDirs() {
  await mkdir(tasksDir, { recursive: true });
  await mkdir(logsDir, { recursive: true });
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function readOptionalSnowflake(name) {
  const raw = process.env[name]?.trim() || "";
  if (!raw) {
    return "";
  }
  if (!/^\d{16,20}$/.test(raw)) {
    throw new Error(
      `Invalid ${name}: expected a Discord ID (snowflake), got "${raw}".`
    );
  }
  return raw;
}

function parseCsv(value) {
  return new Set(
    (value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function parseSnowflakeCsv(name) {
  const values = parseCsv(process.env[name]);
  for (const value of values) {
    if (!/^\d{16,20}$/.test(value)) {
      throw new Error(
        `Invalid ${name}: expected Discord ID values, got "${value}".`
      );
    }
  }
  return values;
}

function parseShellWords(value) {
  return value
    .match(/(?:[^\s"]+|"[^"]*")+/g)?.map((part) => part.replaceAll('"', "")) || [];
}

function isAuthorized(userId, channelId) {
  if (allowedUsers.size > 0 && !allowedUsers.has(userId)) {
    return false;
  }
  if (allowedChannels.size > 0 && !allowedChannels.has(channelId)) {
    return false;
  }
  return true;
}

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(token);
  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(appId, guildId), {
      body: commandDefs,
    });
    return;
  }

  await rest.put(Routes.applicationCommands(appId), {
    body: commandDefs,
  });
}

function helpText() {
  return [
    "Lenh slash:",
    "`/status` xem repo va job hien tai",
    "`/whoami` xem user id, channel id, guild id de debug",
    "`/build` chay build",
    "`/dev_start`, `/dev_stop`, `/dev_logs` dieu khien next dev",
    "`/codex prompt:<noi dung>` gui yeu cau sua code cho Codex",
    "`/logs` xem log job gan nhat",
    "`/tail` xem phan cuoi cua log dang chay hoac log gan nhat",
    "`/cancel` huy job dang chay",
    "",
    `Lenh text cung duoc ho tro: \`${prefix}help\`, \`${prefix}status\`, \`${prefix}whoami\`, \`${prefix}codex ...\`, \`${prefix}logs\`, \`${prefix}tail\`, \`${prefix}devlogs\`, \`${prefix}cancel\`.`,
  ].join("\n");
}

function buildWhoAmIText(userId, channelId, guildId) {
  return [
    `User ID: \`${userId}\``,
    `Channel ID: \`${channelId || "unknown"}\``,
    `Guild ID: \`${guildId || "unknown"}\``,
  ].join("\n");
}

async function buildStatusText() {
  const branch = await runShortCommand("git", ["branch", "--show-current"]);
  const gitStatus = await runShortCommand("git", ["status", "--short"]);
  const jobLine = state.currentJob
    ? `Job hien tai: ${state.currentJob.name} (${elapsed(state.currentJob.startedAt)})`
    : "Job hien tai: khong co";
  const devLine = state.devServer
    ? `Dev server: dang chay (${elapsed(state.devServer.startedAt)})`
    : "Dev server: dang tat";

  return [
    `Nhanh: \`${branch || "unknown"}\``,
    jobLine,
    devLine,
    "",
    "git status:",
    codeBlock(limitText(gitStatus || "Clean", 1800)),
  ].join("\n");
}

async function startBuild(interaction) {
  await interaction.reply({
    content: "Toi dang chay `npm run build`.",
    ephemeral: true,
  });
  await runManagedJob({
    name: "build",
    channel: interaction.channel,
    actorId: interaction.user.id,
    command: "npm",
    args: ["run", "build"],
  });
}

async function startCodex(interaction) {
  const prompt = interaction.options.getString("prompt", true);
  await interaction.reply({
    content: "Toi dang gui yeu cau nay vao `codex exec`.",
    ephemeral: true,
  });
  await runCodexJob(interaction.channel, prompt, interaction.user.id);
}

async function startDevServer(interaction) {
  if (state.devServer) {
    await interaction.reply({
      content: `Dev server da chay tu ${elapsed(state.devServer.startedAt)}.`,
      ephemeral: true,
    });
    return;
  }

  const logPath = path.join(logsDir, `dev-${Date.now()}.log`);
  const child = spawn("npm", ["run", "dev"], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });

  state.devServer = {
    child,
    logPath,
    startedAt: Date.now(),
  };
  state.latestLogPath = logPath;

  child.stdout.on("data", (chunk) => appendLog(logPath, chunk));
  child.stderr.on("data", (chunk) => appendLog(logPath, chunk));
  child.on("close", async (code, signal) => {
    await appendLog(
      logPath,
      `\n[dev server exited] code=${code ?? "null"} signal=${signal ?? "null"}\n`
    );
    state.devServer = null;
  });

  await interaction.reply({
    content: `Da bat dev server. Log: \`${path.relative(repoRoot, logPath)}\``,
    ephemeral: true,
  });
}

async function stopDevServer(interaction) {
  if (!state.devServer) {
    await interaction.reply({
      content: "Dev server dang tat.",
      ephemeral: true,
    });
    return;
  }

  state.devServer.child.kill("SIGTERM");
  await interaction.reply({
    content: "Da gui yeu cau tat dev server.",
    ephemeral: true,
  });
}

async function sendDevLogs(interaction) {
  const lines = interaction.options.getInteger("lines") || 60;
  await interaction.reply({
    content: await formatLogResponse(state.devServer?.logPath, lines),
    ephemeral: true,
  });
}

async function sendLatestLogs(interaction) {
  const lines = interaction.options.getInteger("lines") || 60;
  await interaction.reply({
    content: await formatLogResponse(state.latestLogPath, lines),
    ephemeral: true,
  });
}

async function sendTailLogs(interaction) {
  const lines = interaction.options.getInteger("lines") || 60;
  const logPath = state.currentJob?.logPath || state.latestLogPath;
  await interaction.reply({
    content: await formatLogResponse(logPath, lines),
    ephemeral: true,
  });
}

async function cancelCurrentJob(interaction) {
  if (!state.currentJob) {
    await interaction.reply({
      content: "Khong co job nao dang chay.",
      ephemeral: true,
    });
    return;
  }

  state.currentJob.child.kill("SIGTERM");
  await interaction.reply({
    content: `Da gui yeu cau huy job \`${state.currentJob.name}\`.`,
    ephemeral: true,
  });
}

async function runCodexJob(channel, prompt, actorId) {
  const taskPath = path.join(tasksDir, `task-${Date.now()}.md`);
  await writeFile(
    taskPath,
    [
      `# Discord Codex Task`,
      `- Created: ${new Date().toISOString()}`,
      `- Actor ID: ${actorId}`,
      "",
      prompt,
      "",
    ].join("\n"),
    "utf8"
  );
  state.latestTaskPath = taskPath;

  const args = [
    "exec",
    "--full-auto",
    "-C",
    repoRoot,
    "-o",
    taskPath.replace(/\.md$/, ".reply.txt"),
  ];
  if (codexModel) {
    args.push("--model", codexModel);
  }
  args.push(...codexExtraArgs, prompt);

  await runManagedJob({
    name: "codex",
    channel,
    actorId,
    command: "codex",
    args,
    replyFilePath: taskPath.replace(/\.md$/, ".reply.txt"),
    prompt,
  });
}

async function runManagedJob({
  name,
  channel,
  actorId,
  command,
  args,
  replyFilePath = "",
  prompt = "",
}) {
  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("Bot can mot text channel de tra ket qua.");
  }
  if (state.currentJob) {
    throw new Error(`Dang co job \`${state.currentJob.name}\` chay. Dung \`/cancel\` neu can.`);
  }

  const logPath = path.join(logsDir, `${name}-${Date.now()}.log`);
  state.latestLogPath = logPath;

  const child = spawn(command, args, {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });

  state.currentJob = {
    name,
    child,
    logPath,
    startedAt: Date.now(),
    actorId,
    lastProgressSize: 0,
    progressTimer: null,
  };

  child.stdout.on("data", (chunk) => appendLog(logPath, chunk));
  child.stderr.on("data", (chunk) => appendLog(logPath, chunk));

  await channel.send(
    [
      `Bat dau job \`${name}\` cho <@${actorId}>.`,
      prompt ? `Prompt: ${truncateInline(prompt, 180)}` : null,
      `Log: \`${path.relative(repoRoot, logPath)}\``,
    ]
      .filter(Boolean)
      .join("\n")
  );

  state.currentJob.progressTimer = setInterval(async () => {
    if (!state.currentJob || state.currentJob.logPath !== logPath) {
      return;
    }

    try {
      const progressText = await readIncrementalLog(
        logPath,
        state.currentJob.lastProgressSize,
        1200
      );
      if (!progressText) {
        return;
      }

      state.currentJob.lastProgressSize = progressText.nextOffset;
      const snippet = sanitizeProgressSnippet(progressText.content);
      if (!snippet) {
        return;
      }

      await sendDiscordMessage(
        channel,
        ["Tien do job:", codeBlock(limitText(snippet, 1600))].join("\n")
      );
    } catch {
      // ignore periodic progress read failures
    }
  }, 6000);

  child.on("close", async (code, signal) => {
    const currentJob = state.currentJob;
    const elapsedText = elapsed(currentJob?.startedAt || Date.now());
    if (currentJob?.progressTimer) {
      clearInterval(currentJob.progressTimer);
    }
    await appendLog(
      logPath,
      `\n[process exited] code=${code ?? "null"} signal=${signal ?? "null"}\n`
    );

    const summary = [
      `Job \`${name}\` da ket thuc sau ${elapsedText}.`,
      `Exit code: \`${code ?? "null"}\`${signal ? `, signal: \`${signal}\`` : ""}`,
    ];

    const messages = [summary.join("\n")];

    if (replyFilePath) {
      try {
        const replyText = await readFile(replyFilePath, "utf8");
        if (replyText.trim()) {
          messages.push(
            ["Tra loi cua Codex:", codeBlock(limitText(replyText.trim(), 1800))].join(
              "\n"
            )
          );
        }
      } catch {
        // ignore missing reply file
      }
    }

    messages.push(
      ["Log cuoi:", codeBlock(await tailFile(logPath, 50, 1800))].join("\n")
    );

    for (const message of messages) {
      await sendDiscordMessage(channel, message);
    }
    state.currentJob = null;
  });
}

async function appendLog(logPath, chunk) {
  const content = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
  await mkdir(path.dirname(logPath), { recursive: true });
  await writeFile(logPath, content, { flag: "a" });
}

async function formatLogResponse(logPath, lines) {
  if (!logPath) {
    const latest = await findLatestLogPath();
    if (!latest) {
      return "Chua co file log nao.";
    }
    logPath = latest;
  }

  const relative = path.relative(repoRoot, logPath);
  const content = await tailFile(logPath, lines, 1800);
  return `Log \`${relative}\`:\n${codeBlock(content)}`;
}

async function findLatestLogPath() {
  try {
    const entries = await readdir(logsDir);
    const stats = await Promise.all(
      entries.map(async (entry) => {
        const filePath = path.join(logsDir, entry);
        const fileStat = await stat(filePath);
        return { filePath, mtimeMs: fileStat.mtimeMs };
      })
    );
    return stats.sort((a, b) => b.mtimeMs - a.mtimeMs)[0]?.filePath || null;
  } catch {
    return null;
  }
}

async function tailFile(filePath, lineCount, maxChars) {
  try {
    const content = await readFile(filePath, "utf8");
    const lines = content.trimEnd().split("\n").slice(-lineCount).join("\n");
    return limitText(lines || "(log rong)", maxChars);
  } catch {
    return "Khong doc duoc log.";
  }
}

async function readIncrementalLog(filePath, fromOffset, maxChars) {
  try {
    const content = await readFile(filePath, "utf8");
    const slice = content.slice(fromOffset);
    if (!slice) {
      return null;
    }

    return {
      content: slice.slice(-maxChars),
      nextOffset: content.length,
    };
  } catch {
    return null;
  }
}

async function runShortCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    let output = "";
    let error = "";

    child.stdout.on("data", (chunk) => {
      output += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      error += chunk.toString("utf8");
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(error.trim() || `${command} failed with code ${code}`));
      }
    });
  });
}

function elapsed(startedAt) {
  const seconds = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}m${rest}s`;
}

function truncateInline(value, maxLength) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function limitText(value, maxChars) {
  return value.length > maxChars ? `${value.slice(0, maxChars - 4)}\n...` : value;
}

function codeBlock(value) {
  return `\`\`\`\n${value}\n\`\`\``;
}

function sanitizeProgressSnippet(value) {
  return value
    .replace(/\u001B\[[0-9;]*[A-Za-z]/g, "")
    .replace(/\r/g, "\n")
    .trim();
}

async function sendDiscordMessage(channel, content) {
  const chunks = splitDiscordMessage(content, 1900);
  for (const chunk of chunks) {
    await channel.send(chunk);
  }
}

function splitDiscordMessage(content, maxLength) {
  if (content.length <= maxLength) {
    return [content];
  }

  const chunks = [];
  let remaining = content;

  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf("\n", maxLength);
    if (splitAt < Math.floor(maxLength * 0.5)) {
      splitAt = maxLength;
    }
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).replace(/^\n+/, "");
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
}

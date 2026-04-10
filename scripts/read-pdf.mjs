import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swiftScript = resolve(__dirname, "read-pdf.swift");
const tempHome = "/tmp/chess-learning-swift-home";
const knownNoisePatterns = [/XType: Using static font registry\./];

mkdirSync(resolve(tempHome, ".cache/clang/ModuleCache"), {
  recursive: true,
});

const result = spawnSync("swift", [swiftScript, ...process.argv.slice(2)], {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
  env: {
    ...process.env,
    HOME: tempHome,
  },
});

const clean = (text = "") =>
  text
    .split("\n")
    .filter((line) => !knownNoisePatterns.some((pattern) => pattern.test(line)))
    .join("\n");

if (result.stdout) {
  process.stdout.write(clean(result.stdout));
}

if (result.stderr) {
  const cleanedStderr = clean(result.stderr);
  if (cleanedStderr.trim()) {
    process.stderr.write(cleanedStderr.endsWith("\n") ? cleanedStderr : `${cleanedStderr}\n`);
  }
}

if (typeof result.status === "number") {
  process.exit(result.status);
}

if (result.error) {
  console.error(`Failed to run swift PDF reader: ${result.error.message}`);
}

process.exit(1);

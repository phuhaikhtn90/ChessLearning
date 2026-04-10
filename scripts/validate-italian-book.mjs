#!/usr/bin/env node

import fs from "fs";
import path from "path";
import vm from "vm";
import { Chess } from "chess.js";

const ROOT = process.cwd();
const SOURCE_FILE = path.join(ROOT, "src/data/openings/italian_game.ts");

function sanitizeSan(san) {
  return String(san ?? "").replace(/[!?]+/g, "");
}

function getStartingPlyFromFen(fen) {
  const parts = fen.trim().split(/\s+/);
  const sideToMove = parts[1];
  const fullmoveNumber = Number(parts[5] ?? 1);
  return sideToMove === "b"
    ? (fullmoveNumber - 1) * 2 + 2
    : (fullmoveNumber - 1) * 2 + 1;
}

function extractObjectLiteral(source, exportName) {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error(`Could not find export ${exportName}`);
  }

  const equalsIndex = source.indexOf("=", start);
  if (equalsIndex === -1) {
    throw new Error(`Could not find '=' for export ${exportName}`);
  }

  const braceStart = source.indexOf("{", equalsIndex);
  if (braceStart === -1) {
    throw new Error(`Could not find object literal for export ${exportName}`);
  }

  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      stringChar = char;
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return source.slice(braceStart, index + 1);
    }
  }

  throw new Error(`Could not parse object literal for export ${exportName}`);
}

function loadBookData() {
  const source = fs.readFileSync(SOURCE_FILE, "utf8");
  const literal = extractObjectLiteral(source, "winningWithTheSlowButVenomousItalian");
  return vm.runInNewContext(`(${literal})`);
}

function validateMove(chess, san, contextPath, fenBefore, errors) {
  const normalizedSan = sanitizeSan(san);

  try {
    const result = chess.move(normalizedSan);
    if (!result) {
      errors.push({
        path: contextPath.join(" > "),
        san,
        normalizedSan,
        fenBefore,
        reason: "Move returned null",
      });
      return false;
    }
    return true;
  } catch (error) {
    errors.push({
      path: contextPath.join(" > "),
      san,
      normalizedSan,
      fenBefore,
      reason: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

function validateFlow(nodes, chess, currentPly, contextPath, errors) {
  for (const node of nodes) {
    if (node.type === "text") continue;

    if (node.type === "move") {
      const fenBefore = chess.fen();
      const ok = validateMove(
        chess,
        node.notation,
        [...contextPath, `${currentPly}.${node.notation}`],
        fenBefore,
        errors
      );
      if (!ok) return;
      currentPly += 1;
      continue;
    }

    if (node.type === "variation") {
      const branchChess = new Chess(chess.fen());
      validateFlow(node.flow, branchChess, currentPly, [...contextPath, node.title], errors);
      continue;
    }

    if (node.type === "variation_group") {
      const branchChess = new Chess(chess.fen());
      validateFlow(node.flow, branchChess, currentPly, [...contextPath, node.title], errors);
    }
  }
}

function validateChapter(chapter, errors) {
  const chess = new Chess(chapter.fenStart);
  const startingPly = getStartingPlyFromFen(chapter.fenStart);
  let currentPly = 1;

  for (const node of chapter.content) {
    if (node.type === "text") continue;

    if (node.type === "move") {
      if (currentPly >= startingPly) {
        const fenBefore = chess.fen();
        const ok = validateMove(
          chess,
          node.notation,
          [chapter.name, `${currentPly}.${node.notation}`],
          fenBefore,
          errors
        );
        if (!ok) return;
      }
      currentPly += 1;
      continue;
    }

    if (node.type === "variation_group") {
      const branchChess = new Chess(chess.fen());
      validateFlow(node.flow, branchChess, currentPly, [chapter.name, node.title], errors);
    }
  }
}

function main() {
  const book = loadBookData();
  const errors = [];

  for (const chapter of book.chapters ?? []) {
    validateChapter(chapter, errors);
  }

  if (errors.length === 0) {
    console.log("OK: No illegal SAN moves found in italian_game.ts");
    return;
  }

  console.error(`Found ${errors.length} illegal SAN move(s):`);
  for (const error of errors) {
    console.error("");
    console.error(`Path: ${error.path}`);
    console.error(`SAN: ${error.san}`);
    console.error(`Normalized SAN: ${error.normalizedSan}`);
    console.error(`FEN before: ${error.fenBefore}`);
    console.error(`Reason: ${error.reason}`);
  }

  process.exitCode = 1;
}

main();

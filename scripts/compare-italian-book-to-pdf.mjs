#!/usr/bin/env node

import fs from "fs";
import path from "path";
import vm from "vm";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const SOURCE_FILE = path.join(ROOT, "src/data/openings/italian_game.ts");
const DEFAULT_PDF = path.join(
  ROOT,
  "src/data/books/winning-with-the-slow-but-venomous-italian-chapter-1.pdf"
);

function sanitizeSan(san) {
  return String(san ?? "").replace(/[!?]+/g, "");
}

function extractObjectLiteral(source, exportName) {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error(`Could not find export ${exportName}`);
  }

  const equalsIndex = source.indexOf("=", start);
  const braceStart = source.indexOf("{", equalsIndex);
  if (equalsIndex === -1 || braceStart === -1) {
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

function normalizeBookText(text) {
  return text
    .replace(/♔/g, "K")
    .replace(/♕/g, "Q")
    .replace(/♖/g, "R")
    .replace(/♗/g, "B")
    .replace(/♘/g, "N")
    .replace(/♙/g, "")
    .replace(/0-0-0/g, "O-O-O")
    .replace(/0-0/g, "O-O")
    .replace(/–/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(text) {
  return normalizeBookText(text).replace(/\s+/g, "");
}

function normalizeTitle(title) {
  return title
    .replace(/^Nhánh\s+/i, "")
    .replace(/^Biến\s+/i, "")
    .replace(/^Nhánh phụ:\s+/i, "")
    .replace(/^Nhánh chính:\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleSearchKey(title) {
  const normalized = normalizeTitle(title);
  const headingRef = normalized.match(/^[A-E](?:\d+)?(?:\d+)?\)\s*\d+\.(?:\.\.)?[A-Za-z0-9O\-+=#x!?]+/);
  if (headingRef) {
    return headingRef[0];
  }

  const moveRefs = normalized.match(/\d+\.(?:\.\.)?[A-Za-z0-9O\-+=#x!?]+/g) ?? [];
  if (moveRefs.length > 0) {
    return moveRefs.join(" ");
  }

  const branchRef = normalized.match(/^[A-E](?:\d+)?(?:\d+)?\)\s*3\.\.\.[A-Za-z0-9!?+\-]+/);
  if (branchRef) {
    return branchRef[0];
  }

  const simpleBranchRef = normalized.match(/^[A-E](?:\d+)?(?:\d+)?\)/);
  if (simpleBranchRef) {
    return simpleBranchRef[0];
  }

  return normalized;
}

function tokenFromSan(san) {
  return sanitizeSan(san)
    .replace(/0-0-0/g, "O-O-O")
    .replace(/0-0/g, "O-O")
    .trim();
}

function extractSanTokens(text) {
  const normalized = normalizeBookText(text);
  const pattern =
    /\b(?:O-O-O|O-O|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|[a-h]x?[a-h][1-8](?:=[QRBN])?[+#]?|[KQRBN][a-h]?[1-8]?|[a-h][1-8])\b/g;
  return normalized.match(pattern) ?? [];
}

function findSubsequenceIndex(haystack, needle) {
  if (needle.length === 0) return 0;
  outer: for (let index = 0; index <= haystack.length - needle.length; index += 1) {
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (haystack[index + offset] !== needle[offset]) {
        continue outer;
      }
    }
    return index;
  }
  return -1;
}

function hasOrderedSubsequence(haystack, needle) {
  if (needle.length === 0) return true;
  let offset = 0;
  for (const token of haystack) {
    if (token === needle[offset]) {
      offset += 1;
      if (offset === needle.length) {
        return true;
      }
    }
  }
  return false;
}

function collectVariationEntries(nodes, contextPath = [], movePrefix = [], entries = []) {
  let runningMoves = [...movePrefix];

  for (const node of nodes) {
    if (node.type === "text") continue;

    if (node.type === "move") {
      runningMoves.push(tokenFromSan(node.notation));
      continue;
    }

    if (node.type === "variation" || node.type === "variation_group") {
      const branchPrefix = [...runningMoves];
      const nextPath = [...contextPath, node.title];
      const localMoves = node.flow
        .filter((child) => child.type === "move")
        .map((child) => tokenFromSan(child.notation));
      const branchMoves = collectVariationEntries(node.flow, nextPath, branchPrefix, entries);

      entries.push({
        kind: node.type,
        path: nextPath.join(" > "),
        title: node.title,
        normalizedTitle: normalizeTitle(node.title),
        titleKey: titleSearchKey(node.title),
        localMoves,
        moves: branchMoves,
      });
    }
  }

  return runningMoves;
}

function readPdfText(pdfPath) {
  const result = spawnSync("node", ["scripts/read-pdf.mjs", pdfPath], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || `Failed to read PDF: exit code ${result.status}`);
  }

  return result.stdout;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let pdfPath = DEFAULT_PDF;
  let chapterId = "wwsi_ch01";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--pdf") {
      pdfPath = path.resolve(ROOT, args[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--chapter") {
      chapterId = args[index + 1];
      index += 1;
      continue;
    }
  }

  return { pdfPath, chapterId };
}

function isWeakTitleKey(titleKey) {
  const compactKey = compact(titleKey);
  if (compactKey.length < 8) return true;
  if (/^\d+\.\.\.[A-Za-z0-9O\-+=#x!?]+$/.test(compactKey)) return true;
  if (/^\d+\.[A-Za-z0-9O\-+=#x!?]+$/.test(compactKey)) return true;
  if (/^[A-E](?:\d+)?(?:\d+)?\)$/.test(compactKey)) return true;
  return false;
}

function pickSequence(entry) {
  if (entry.localMoves.length >= 4) {
    return entry.localMoves.slice(0, 8);
  }

  if (entry.localMoves.length >= 2) {
    return entry.localMoves;
  }

  return entry.moves.slice(-6);
}

function main() {
  const { pdfPath, chapterId } = parseArgs();
  const book = loadBookData();
  const chapter = (book.chapters ?? []).find((item) => item.id === chapterId);

  if (!chapter) {
    throw new Error(`Could not find chapter '${chapterId}' in italian_game.ts`);
  }

  const entries = [];
  collectVariationEntries(chapter.content ?? [], [chapter.name], [], entries);

  const pdfText = readPdfText(pdfPath);
  const normalizedPdfText = normalizeBookText(pdfText);
  const compactPdfText = compact(pdfText);
  const pdfSanTokens = extractSanTokens(pdfText);

  const titleMatches = [];
  const titleMisses = [];
  const moveMatches = [];
  const moveMisses = [];

  for (const entry of entries) {
    const normalizedTitleKey = normalizeBookText(entry.titleKey);
    const titleFound =
      normalizedPdfText.includes(normalizedTitleKey) ||
      compactPdfText.includes(compact(entry.titleKey));
    const sequence = pickSequence(entry);
    const sequenceIndex =
      sequence.length >= 2 ? findSubsequenceIndex(pdfSanTokens, sequence) : -1;
    const orderedSequenceFound =
      sequence.length >= 2 && hasOrderedSubsequence(pdfSanTokens, sequence);
    const compactSequenceFound =
      sequence.length >= 2 && compactPdfText.includes(compact(sequence.join(" ")));
    const moveFound =
      sequence.length >= 2 &&
      (sequenceIndex >= 0 || orderedSequenceFound || compactSequenceFound);
    const weakTitleKey = isWeakTitleKey(entry.titleKey);

    if (titleFound || moveFound) {
      if (titleFound) titleMatches.push(entry.path);
      if (moveFound) moveMatches.push(entry.path);
      continue;
    }

    if (!weakTitleKey) {
      titleMisses.push(entry);
    }

    if (sequence.length >= 4) {
      moveMisses.push({ ...entry, sequence });
    }
  }

  console.log(`Chapter: ${chapter.name}`);
  console.log(`PDF: ${pdfPath}`);
  console.log(`Entries checked: ${entries.length}`);
  console.log(`Title matches: ${titleMatches.length}`);
  console.log(`Title misses: ${titleMisses.length}`);
  console.log(`Move-sequence matches: ${moveMatches.length}`);
  console.log(`Move-sequence misses: ${moveMisses.length}`);

  if (titleMisses.length > 0) {
    console.log("");
    console.log("Title mismatches:");
    for (const entry of titleMisses.slice(0, 20)) {
      console.log(`- ${entry.path}`);
      console.log(`  search: ${entry.titleKey}`);
    }
  }

  if (moveMisses.length > 0) {
    console.log("");
    console.log("Move-sequence mismatches:");
    for (const entry of moveMisses.slice(0, 20)) {
      console.log(`- ${entry.path}`);
      console.log(`  sequence: ${entry.sequence.slice(0, 12).join(" ")}`);
    }
  }

  if (titleMisses.length > 0 || moveMisses.length > 0) {
    process.exitCode = 1;
  }
}

main();

// Two Lines to Your Past Self — make.fun bounty entry.
//
// Writes exactly two lines to /output/entry.txt. The output is fully
// deterministic: fixed strings, no clock, no randomness, no input.
// A built-in self-check reads the file back and verifies the format
// the bounty gate requires before exiting.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LINE_ONE =
  "Don't leave the rooftop party early on 9 October 2017 — stay and tell her you love her before the night ends.";
const LINE_TWO =
  "That one sentence is why you married her instead of spending the next eight years wondering what would have happened.";

const TEXT = `${LINE_ONE}\n${LINE_TWO}`;

const OUT_DIR = "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

function countSentences(line) {
  // A sentence ends with ., ! or ? followed by end-of-line.
  // Internal abbreviations would break this; neither line has any.
  return (line.match(/[.!?]$/) ?? []).length;
}

function selfCheck(text) {
  const problems = [];
  if (typeof text !== "string" || text.length < 1 || text.length > 280) {
    problems.push(`length ${text.length} outside 1-280`);
  }
  if (text.trim().length === 0) problems.push("text is only whitespace");
  const lines = text.split("\n");
  if (lines.length !== 2) problems.push(`expected 2 lines, got ${lines.length}`);
  for (const [i, line] of lines.entries()) {
    if (line.trim().length === 0) problems.push(`line ${i + 1} is empty`);
    if (line !== line.trim()) problems.push(`line ${i + 1} has leading/trailing space`);
    if (countSentences(line) !== 1) {
      problems.push(`line ${i + 1} is not exactly one sentence`);
    }
  }
  if (lines[0] === lines[1]) problems.push("lines are identical");
  return problems;
}

const problems = selfCheck(TEXT);
if (problems.length > 0) {
  console.error(`self-check failed: ${problems.join("; ")}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, TEXT, "utf8");

// Read back and compare byte for byte.
const roundTripped = readFileSync(OUT_FILE, "utf8");
if (roundTripped !== TEXT) {
  console.error("self-check failed: read-back differs from written text");
  process.exit(1);
}
const backProblems = selfCheck(roundTripped);
if (backProblems.length > 0) {
  console.error(`self-check failed on read-back: ${backProblems.join("; ")}`);
  process.exit(1);
}

console.log(`wrote ${OUT_FILE} (${TEXT.length} chars, 2 lines)`);

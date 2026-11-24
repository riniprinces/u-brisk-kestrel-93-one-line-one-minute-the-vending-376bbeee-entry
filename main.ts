// One Line, One Minute: The Vending Machine Pickup Line Contest.
//
// The entry is a single pickup line spoken by a vending machine to a
// passing human. It lives in the machine's own world — coins, buttons,
// coils, snacks — and lands its punch in the last few words: the machine
// offers to drop the whole row for free, just for one more smile.
//
// This program writes that one line to the output path the kit names
// (/output/entry.txt, or $OUTPUT_PATH when set), with a validation gate
// in front: 1-200 characters, one line, UTF-8, no trailing newline.
// It then reads the file back and refuses to finish unless the bytes
// on disk are exactly the line it meant to write.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The line itself. Counted in code points, not UTF-16 units, so the
// em dash counts as one character, exactly as the gate counts it.
const LINE =
  "Insert coin, press B7, take the chocolate — or just smile at me again and I'll drop the whole row for free.";

// Where the grader looks for the entry. The kit rules name
// /output/entry.txt; $OUTPUT_PATH exists only so the same program can
// be exercised locally without touching the shared output directory.
const OUTPUT_PATH = process.env.OUTPUT_PATH ?? "/output/entry.txt";
const MAX_CHARS = 200;

function checkLine(line: string): number {
  const chars = Array.from(line).length;
  if (chars < 1) throw new Error("gate FAIL: entry is empty");
  if (chars > MAX_CHARS) {
    throw new Error(`gate FAIL: ${chars} chars exceeds ${MAX_CHARS}`);
  }
  if (line !== line.trim()) {
    throw new Error("gate FAIL: leading or trailing whitespace");
  }
  if (/[\r\n]/.test(line)) {
    throw new Error("gate FAIL: entry must be a single line");
  }
  return chars;
}

function main(): void {
  const chars = checkLine(LINE);
  console.log(`gate PASS: ${chars} chars, single line, within 1-${MAX_CHARS}`);

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, LINE, { encoding: "utf8" });

  const written = readFileSync(OUTPUT_PATH, "utf8");
  const bytes = Buffer.byteLength(written, "utf8");
  console.log(`wrote ${OUTPUT_PATH}: ${bytes} bytes, ${chars} chars`);
  if (written !== LINE) {
    throw new Error("verify FAIL: read-back does not match the line");
  }
  if (!written.includes("B7") || !written.includes("free")) {
    throw new Error("verify FAIL: read-back lost the machine's words");
  }
  console.log("verify PASS: read-back is byte-identical to the line");
}

main();

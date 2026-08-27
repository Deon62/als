#!/usr/bin/env node
/**
 * Strips em dashes and en dashes out of the site's copy.
 *
 *   node scripts/no-em-dash.mjs           rewrite the files
 *   node scripts/no-em-dash.mjs --check   report only, exit 1 if any are left
 *
 * Why it exists: a long dash reads as machine-written to a lot of people now,
 * and a sentence that leans on one is usually a sentence that wanted a comma
 * or a full stop. Rather than trusting everyone to remember, this makes it
 * mechanical. Run it before every deploy, or wire --check into CI.
 *
 * What it does not touch: the ordinary hyphen. Kebab-case class names, CSS
 * property values, hyphenated words and negative numbers all stay exactly as
 * they are. Only U+2014 and U+2013 are in scope.
 *
 * The replacement is deliberately dumb, because a clever one would be wrong
 * in ways nobody notices:
 *
 *   "10 - 20 pages"   a range between digits becomes the word "to"
 *   "text - more"     a dash between words becomes a comma
 *   "- opening"       a leading dash becomes nothing at all
 *
 * A comma is right far more often than it is wrong, and where it is wrong the
 * sentence still parses. Read the diff anyway. The script reports every line
 * it changed so that is one glance, not a hunt.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const EXTENSIONS = new Set([".html", ".css", ".js", ".mjs", ".md", ".txt", ".xml"]);
const SKIP = new Set(["node_modules", ".git", "assets/land.jpg"]);

const EM = "\u2014";
const EN = "\u2013";

/** Ordered: the range rule has to run before the general one. */
const RULES = [
  // 10 - 20  ->  10 to 20
  [new RegExp(`(\\d)\\s*[${EM}${EN}]\\s*(\\d)`, "g"), "$1 to $2"],
  // word - word  ->  word, word
  [new RegExp(`\\s*[${EM}${EN}]\\s+`, "g"), ", "],
  // anything left, including one opening a line
  [new RegExp(`\\s*[${EM}${EN}]\\s*`, "g"), " "],
];

const check = process.argv.includes("--check");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const rel = relative(ROOT, full).split("\\").join("/");
    if (SKIP.has(entry.name) || SKIP.has(rel)) continue;

    if (entry.isDirectory()) yield* walk(full);
    else if (EXTENSIONS.has(extname(entry.name))) yield full;
  }
}

let filesTouched = 0;
let dashesFound = 0;

for await (const file of walk(ROOT)) {
  const before = await readFile(file, "utf8");
  if (!before.includes(EM) && !before.includes(EN)) continue;

  const rel = relative(ROOT, file).split("\\").join("/");
  const lines = before.split("\n");

  let after = before;
  for (const [pattern, replacement] of RULES) {
    after = after.replace(pattern, replacement);
  }

  // Report by line, so the change is reviewable without a diff tool.
  lines.forEach((line, index) => {
    if (!line.includes(EM) && !line.includes(EN)) return;
    dashesFound += 1;
    console.log(`${rel}:${index + 1}`);
    console.log(`  ${line.trim()}`);
  });

  if (!check) {
    await writeFile(file, after, "utf8");
    filesTouched += 1;
  }
}

if (dashesFound === 0) {
  console.log("Clean. No em or en dashes anywhere.");
  process.exit(0);
}

if (check) {
  console.log(`\n${dashesFound} line(s) still carry a long dash.`);
  process.exit(1);
}

console.log(`\nRewrote ${filesTouched} file(s). Read the lines above before committing.`);

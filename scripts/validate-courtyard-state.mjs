import fs from "node:fs";
import path from "node:path";

const FILE = path.resolve("src/content/courtyard.state.json");

const ALLOWED_STATES = new Set(["open", "quiet", "closed"]);
const ALLOWED_SEASONS = new Set(["I", "II", "III", "IV", "V"]);

function fail(msg) {
  console.error(`\n[Courtyard Validator] FAIL: ${msg}\n`);
  process.exit(1);
}
function warn(msg) {
  console.warn(`[Courtyard Validator] WARN: ${msg}`);
}
function ok(msg) {
  console.log(`[Courtyard Validator] OK: ${msg}`);
}

let rawText;
try {
  rawText = fs.readFileSync(FILE, "utf8");
} catch {
  fail(`Missing file: ${FILE}`);
}

let data;
try {
  data = JSON.parse(rawText);
} catch (e) {
  fail(`Invalid JSON in ${FILE}: ${e.message}`);
}

if (typeof data !== "object" || data === null || Array.isArray(data)) {
  fail("State file must be a JSON object.");
}

// Required keys
for (const key of ["prev_state", "state", "steward", "season"]) {
  if (!(key in data)) fail(`Missing required key: "${key}"`);
}

// Types
if (typeof data.prev_state !== "string") fail(`"prev_state" must be a string.`);
if (typeof data.state !== "string") fail(`"state" must be a string.`);
if (typeof data.steward !== "boolean") fail(`"steward" must be boolean.`);
if (typeof data.season !== "string") fail(`"season" must be a string.`);

// Allowed values
if (!ALLOWED_STATES.has(data.prev_state)) {
  fail(`"prev_state" must be one of: open | quiet | closed. Got: ${JSON.stringify(data.prev_state)}`);
}
if (!ALLOWED_STATES.has(data.state)) {
  fail(`"state" must be one of: open | quiet | closed. Got: ${JSON.stringify(data.state)}`);
}
if (!ALLOWED_SEASONS.has(data.season)) {
  fail(`"season" must be one of: I | II | III | IV | V. Got: ${JSON.stringify(data.season)}`);
}

// Optional allowInput
if ("allowInput" in data && typeof data.allowInput !== "boolean") {
  fail(`"allowInput" must be boolean if present.`);
}

// Canon: Unstaffed cannot be open
if (data.steward === false && data.state === "open") {
  fail(`Unstaffed Courtyard cannot be "open". Set "steward": true or change "state" to "quiet"/"closed".`);
}

// Canon transition locks
if (data.prev_state === "open" && data.state === "closed") {
  fail(`Invalid transition: open → closed. Canon requires open → quiet.`);
}
if (data.prev_state === "closed" && data.state === "open") {
  fail(`Invalid transition: closed → open. Canon requires closed → quiet first.`);
}

// Mild warning
if (data.prev_state === data.state) {
  warn(`prev_state equals state (${data.state}). Allowed, but check you updated both intentionally.`);
}

ok(`Validated ${path.relative(process.cwd(), FILE)} (prev=${data.prev_state}, state=${data.state}, steward=${data.steward}, season=${data.season}).`);

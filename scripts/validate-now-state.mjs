import fs from "node:fs";
import path from "node:path";

const FILE = path.resolve("src/content/now.state.json");

const ALLOWED_MODES = new Set(["live", "quiet", "dark"]);
const ALLOWED_SEASONS = new Set(["I", "II", "III", "IV", "V"]);

function fail(msg) {
  console.error(`\n[Now Validator] FAIL: ${msg}\n`);
  process.exit(1);
}
function ok(msg) {
  console.log(`[Now Validator] OK: ${msg}`);
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

for (const key of ["mode", "season"]) {
  if (!(key in data)) fail(`Missing required key: "${key}"`);
}

if (typeof data.mode !== "string" || !ALLOWED_MODES.has(data.mode)) {
  fail(`"mode" must be one of: live | quiet | dark. Got: ${JSON.stringify(data.mode)}`);
}
if (typeof data.season !== "string" || !ALLOWED_SEASONS.has(data.season)) {
  fail(`"season" must be one of: I | II | III | IV | V. Got: ${JSON.stringify(data.season)}`);
}

if ("line" in data && typeof data.line !== "string") {
  fail(`"line" must be a string if present.`);
}

if (data.mode === "live") {
  if (!("line" in data)) fail(`mode=live requires "line".`);
  if ((data.line ?? "").trim().length === 0) fail(`mode=live requires non-empty "line".`);
}

ok(`Validated ${path.relative(process.cwd(), FILE)} (mode=${data.mode}, season=${data.season}).`);

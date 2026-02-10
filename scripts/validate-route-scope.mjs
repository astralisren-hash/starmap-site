import { readFileSync } from "node:fs";

const REG_PATH = "codex/site/surface-registry.json";

// Allowed top-level namespaces (first path segment)
const ALLOWED_TOP_LEVEL = new Set([
  "",          // root "/"
  "arrival",
  "current-sky",
  "edge",
  "field",
  "orientation",
  "seed",
  "walk",
  "courtyard",
  "discovery",
  "dream-guardian",
  "now",
  "admin",
  "dashboard",
  "track",
  "n",
]);

function die(msg) {
  console.error(`[Route Scope Validator] ERROR: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`[Route Scope Validator] OK: ${msg}`);
}

let reg;
try {
  reg = JSON.parse(readFileSync(REG_PATH, "utf8"));
} catch (e) {
  die(`Could not read/parse ${REG_PATH}. Run: npm run surface:registry\n${e.message}`);
}

if (!reg?.routes || !Array.isArray(reg.routes)) {
  die(`Invalid registry shape in ${REG_PATH} (missing routes array).`);
}

const unknown = new Map();

for (const r of reg.routes) {
  const path = r?.path;
  if (typeof path !== "string" || !path.startsWith("/")) continue;

  // get first segment: "/" -> "", "/track/mrs/arrival" -> "track"
  const seg = path === "/" ? "" : path.split("/").filter(Boolean)[0] ?? "";

  if (!ALLOWED_TOP_LEVEL.has(seg)) {
    if (!unknown.has(seg)) unknown.set(seg, []);
    unknown.get(seg).push(path);
  }
}

if (unknown.size) {
  console.error(`[Route Scope Validator] Found ${unknown.size} unknown top-level namespace(s):`);
  for (const [seg, paths] of unknown.entries()) {
    console.error(`- "${seg}" (e.g. ${paths[0]})`);
  }
  process.exit(1);
}

ok(`All routes are within allowed top-level namespaces (${ALLOWED_TOP_LEVEL.size}).`);

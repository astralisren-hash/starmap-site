import { readdirSync } from "node:fs";

function die(msg) {
  console.error(`[Dist Namespace Validator] ERROR: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`[Dist Namespace Validator] OK: ${msg}`);
}

const DIST = "dist";

// Allowed top-level directories in dist/
const ALLOW_DIRS = new Set([
  "_astro",
  "admin",
  "arrival",
  "courtyard",
  "current-sky",
  "dashboard",
  "discovery",
  "dream-guardian",
  "edge",
  "field",
  "images",
  "n",
  "now",
  "orientation",
  "seed",
  "track",
  "walk",
]);

// Allowed top-level files in dist/
const ALLOW_FILES = new Set([
  "index.html",
  "favicon.svg",
  "_redirects",
]);

let entries;
try {
  entries = readdirSync(DIST, { withFileTypes: true });
} catch (e) {
  die(`Missing "${DIST}/". Run a build first. (${e.message})`);
}

const errors = [];

for (const ent of entries) {
  const name = ent.name;

  if (name === ".DS_Store") continue;

  if (ent.isDirectory()) {
    if (!ALLOW_DIRS.has(name)) errors.push(`Unexpected top-level dir: /${name}`);
    continue;
  }

  if (ent.isFile()) {
    if (!ALLOW_FILES.has(name)) errors.push(`Unexpected top-level file: /${name}`);
    continue;
  }

  errors.push(`Unexpected top-level entry: /${name}`);
}

if (errors.length) {
  console.error(`[Dist Namespace Validator] Found ${errors.length} issue(s):`);
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

ok(`dist/ top-level namespaces match allowlist (${ALLOW_DIRS.size} dirs, ${ALLOW_FILES.size} files).`);

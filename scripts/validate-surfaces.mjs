import { readFileSync } from "node:fs";

const REG_PATH = "codex/site/surface-registry.json";

function die(msg) {
  console.error(`[Surface Validator] ERROR: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`[Surface Validator] OK: ${msg}`);
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

// --- POLICY (edit here) ---
const ALLOW = {
  STEWARD: new Set(["/admin", "/dashboard"]),
  SEMI: new Set(["/courtyard", "/discovery", "/dream-guardian", "/now"]),
  PUBLIC: new Set(["/", "/arrival", "/threshold", "/orientation", "/seed", "/current-sky", "/field", "/edge", "/walk"]),
};

// Canonical personal identities allowed under /track/<id>/*
const TRACK_IDENTITIES = new Set(["mrs", "adam"]);

// PERSONAL allowed patterns (HARD BREAK: legacy forbidden)
function isAllowedPersonal(path) {
  // canonical singleton
  if (path === "/n") return true;

  // canonical track namespace: /track/<id>/...
  if (path.startsWith("/track/")) {
    const m = path.match(/^\/track\/([^/]+)(\/|$)/);
    if (!m) return false;
    const id = m[1];
    return TRACK_IDENTITIES.has(id);
  }

  return false;
}

// Optional: block obviously risky surfaces anywhere
const BLOCKED_PATHS = new Set([
  // add any hard forbiddens here
]);

const errors = [];

// Validate each route entry
for (const r of reg.routes) {
  const path = r?.path;
  const tier = r?.classification?.tier;
  const surface = r?.classification?.surface;

  if (typeof path !== "string" || !path.startsWith("/")) {
    errors.push(`Bad path value: ${JSON.stringify(path)}`);
    continue;
  }

  if (BLOCKED_PATHS.has(path)) {
    errors.push(`Blocked path present: ${path}`);
    continue;
  }

  if (!tier) {
    errors.push(`Missing tier for ${path}`);
    continue;
  }

  // Force explicit classification (no silent public creep)
  if (surface === "PRESENCE-UNCLASSIFIED") {
    errors.push(
      `Unclassified PUBLIC surface detected: ${path} (PRESENCE-UNCLASSIFIED). ` +
        `Classify it in scripts/surface-registry.mjs`
    );
    continue;
  }

  if (tier === "STEWARD") {
    if (!ALLOW.STEWARD.has(path)) errors.push(`STEWARD route not allowlisted: ${path}`);
    continue;
  }

  if (tier === "PERSONAL") {
    const allowed = Array.from(TRACK_IDENTITIES).join("|");

    // Hard-break: legacy namespaces must not exist at all
    if (/^\/(mrs|adam)(\/|$)/.test(path)) {
      errors.push(`Legacy personal namespace is forbidden: ${path}`);
      continue;
    }

    if (!isAllowedPersonal(path)) {
      errors.push(
        `PERSONAL route outside allowed namespaces: ${path}. ` +
          `Allowed: /n, /track/(${allowed}).`
      );
      continue;
    }

    continue;
  }

  if (tier === "SEMI") {
    if (!ALLOW.SEMI.has(path)) errors.push(`SEMI route not allowlisted: ${path}`);
    continue;
  }

  if (tier === "PUBLIC") {
    // If you still want /N to exist as an ALIAS route, keep it out of PUBLIC and classify as PERSONAL/ALIAS (or remove it entirely).
    if (!ALLOW.PUBLIC.has(path)) errors.push(`PUBLIC route not allowlisted: ${path}`);
    continue;
  }

  errors.push(`Unknown tier "${tier}" for ${path}`);
}

if (errors.length) {
  console.error(`[Surface Validator] Found ${errors.length} issue(s):`);
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

ok(`Validated ${reg.routes.length} routes against allowlists.`);

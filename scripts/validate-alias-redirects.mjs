import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const REG_PATH = "codex/site/surface-registry.json";

function die(msg) {
  console.error(`[Alias Redirect Validator] ERROR: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`[Alias Redirect Validator] OK: ${msg}`);
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

function candidatesForRoute(routePath) {
// routePath like "/N" or other ALIAS routes
  const rel = routePath.replace(/^\//, ""); // remove leading slash
  const base = join("src/pages", rel);

  return [
    `${base}.astro`,
    `${base}.html`,
    join(base, "index.astro"),
    join(base, "index.html"),
  ];
}

function hasRedirectMarker(text) {
  // Accept either JS redirect or meta refresh
  return (
    /location\.replace\s*\(/i.test(text) ||
    /http-equiv\s*=\s*["']refresh["']/i.test(text)
  );
}

const aliasRoutes = reg.routes.filter((r) => r?.classification?.surface === "ALIAS");
// Hard-break legacy namespaces: no /mrs/* or /adam/* routes may exist at all
const legacyAlias = aliasRoutes.filter((r) => /^\/(mrs|adam)(\/|$)/.test(r.path));
if (legacyAlias.length) {
  console.error(`[Alias Redirect Validator] Found ${legacyAlias.length} legacy alias route(s) that must not exist:`);
  for (const r of legacyAlias) console.error(`- ${r.path}`);
  process.exit(1);
}
const failures = [];

for (const r of aliasRoutes) {
  const path = r.path;

  // root can't be ALIAS in this scheme; but just in case, skip it explicitly
  if (path === "/") continue;

  const cands = candidatesForRoute(path);
  const found = cands.find((p) => existsSync(p));

  if (!found) {
    failures.push(`ALIAS route has no matching source page file: ${path} (tried: ${cands.join(", ")})`);
    continue;
  }

  const text = readFileSync(found, "utf8");
  if (!hasRedirectMarker(text)) {
    failures.push(`ALIAS route file missing redirect marker: ${path} (file: ${found})`);
  }
}

if (failures.length) {
  console.error(`[Alias Redirect Validator] Found ${failures.length} issue(s):`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

ok(`Validated ${aliasRoutes.length} ALIAS route(s) contain redirect markers in src/pages.`);

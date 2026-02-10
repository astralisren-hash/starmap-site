import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROUTE_DIR = "codex/site/route-history";
const OUT_DIR = "codex/site/surface-diff";

function die(msg) {
  console.error(`[surface-diff] ERROR: ${msg}`);
  process.exit(1);
}

function latestTwoRouteMaps() {
  const files = readdirSync(ROUTE_DIR)
.filter((f) => /^ROUTE-MAP-\d{4}-\d{2}-\d{2}(?:_\d{4})?\.txt$/.test(f))
    .sort();
  if (files.length < 2) {
    die(`Need at least 2 route maps in ${ROUTE_DIR}. Create more with: npm run route:map`);
  }
  const prev = files[files.length - 2];
  const curr = files[files.length - 1];
  return { prev: join(ROUTE_DIR, prev), curr: join(ROUTE_DIR, curr), prevName: prev, currName: curr };
}

function extractRoutes(routeMapText) {
  const routes = new Set();
  for (const line of routeMapText.split("\n")) {
    const m = line.match(/└─\s+(\/.*)\/index\.html/);
    if (m && m[1]) routes.add(m[1]);
    const m2 = line.match(/└─\s+\/index\.html\b/);
    if (m2) routes.add("/");
  }
  return [...routes].sort((a, b) => a.localeCompare(b));
}

function setDiff(a, b) {
  // a - b
  const out = [];
  for (const x of a) if (!b.has(x)) out.push(x);
  return out.sort((x, y) => x.localeCompare(y));
}

function mdEscape(s) {
  return s.replace(/`/g, "\\`");
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const { prev, curr, prevName, currName } = latestTwoRouteMaps();
  const prevText = readFileSync(prev, "utf8");
  const currText = readFileSync(curr, "utf8");

  const prevRoutes = extractRoutes(prevText);
  const currRoutes = extractRoutes(currText);

  const prevSet = new Set(prevRoutes);
  const currSet = new Set(currRoutes);

  const added = setDiff(currSet, prevSet);
  const removed = setDiff(prevSet, currSet);

  const stampPrev = prevName.replace(/^ROUTE-MAP-/, "").replace(/\.txt$/, "");
  const stampCurr = currName.replace(/^ROUTE-MAP-/, "").replace(/\.txt$/, "");
  const outFile = join(OUT_DIR, `SURFACE-DIFF-${stampCurr}-vs-${stampPrev}.md`);

  const lines = [];
  lines.push(`# Surface Diff`);
  lines.push(``);
  lines.push(`- Current: \`${currName}\``);
  lines.push(`- Previous: \`${prevName}\``);
  lines.push(`- Current route count: **${currRoutes.length}**`);
  lines.push(`- Previous route count: **${prevRoutes.length}**`);
  lines.push(`- Added: **${added.length}**`);
  lines.push(`- Removed: **${removed.length}**`);
  lines.push(``);

  lines.push(`## Added`);
  lines.push(``);
  if (added.length === 0) {
    lines.push(`- (none)`);
  } else {
    for (const r of added) lines.push(`- \`${mdEscape(r)}\``);
  }
  lines.push(``);

  lines.push(`## Removed`);
  lines.push(``);
  if (removed.length === 0) {
    lines.push(`- (none)`);
  } else {
    for (const r of removed) lines.push(`- \`${mdEscape(r)}\``);
  }
  lines.push(``);

  lines.push(`## Notes`);
  lines.push(``);
  lines.push(`- This diff is route-level only (presence/absence).`);
  lines.push(`- For tag/tier changes, we can add a “registry diff” next.`);
  lines.push(``);

  writeFileSync(outFile, lines.join("\n"), "utf8");

  console.log(`[surface-diff] wrote ${outFile}`);
  console.log(`[surface-diff] added=${added.length} removed=${removed.length}`);
}

main();

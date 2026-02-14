import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROUTE_DIR = "codex/site/route-history";
const OUT_JSON = "codex/site/surface-registry.json";
const OUT_MD = "codex/site/surface-registry.md";

// Accept both:
// ROUTE-MAP-YYYY-MM-DD.txt
// ROUTE-MAP-YYYY-MM-DD_HHMM.txt
function latestRouteMapFile() {
  const files = readdirSync(ROUTE_DIR)
    .filter((f) => /^ROUTE-MAP-\d{4}-\d{2}-\d{2}(?:_\d{4})?\.txt$/.test(f))
    .sort(); // lexicographic works with YYYY-MM-DD and YYYY-MM-DD_HHMM
  if (files.length === 0) {
    throw new Error(`No route maps found in ${ROUTE_DIR}. Run: npm run build`);
  }
  return join(ROUTE_DIR, files[files.length - 1]);
}

function extractRoutes(routeMapText) {
  const routes = new Set();

  for (const line of routeMapText.split("\n")) {
    // Matches: "└─ /arrival/index.html"
    const m = line.match(/└─\s+(\/.*)\/index\.html/);
    if (m && m[1]) routes.add(m[1]);

    // Root index.html: "└─ /index.html"
    const m2 = line.match(/└─\s+(\/index\.html)\b/);
    if (m2) routes.add("/");
  }

  // Normalize any accidental "/index.html" entry to "/"
  if (routes.has("/index.html")) {
    routes.delete("/index.html");
    routes.add("/");
  }

  return [...routes].sort((a, b) => a.localeCompare(b));
}

// --- StarMap tagging rules (edit here to refine) ---
function classifyRoute(path) {
  // Steward/Ops first
  if (path === "/admin" || path === "/dashboard") {
    return { tier: "STEWARD", surface: "OPS" };
  }

  // Canonical personal namespace
  if (/^\/track\/(mrs|adam)(\/|$)/.test(path)) {
    return { tier: "PERSONAL", surface: "TRACK" };
  }

// Legacy personal namespaces (redirect-only)
    if (/^\/(mrs|adam)(\/|$)/.test(path)) {
      return { tier: "PERSONAL", surface: "ALIAS" };
    }
    if (path === "/N") return { tier: "PERSONAL", surface: "ALIAS" };
  // Personal singleton
  if (path === "/n") return { tier: "PERSONAL", surface: "TRACK" };

  // Semi-public / interaction-adjacent
  if (["/courtyard", "/discovery", "/dream-guardian", "/now"].includes(path)) {
    return { tier: "SEMI", surface: "INTERACTION" };
  }

  // Public presence
  if (["/", "/arrival", "/orientation", "/seed", "/current-sky", "/field", "/edge", "/walk", "/threshold"].includes(path)) {
    return { tier: "PUBLIC", surface: "PRESENCE" };
  }

  // Default: explicit failure category (caught by validator)
  return { tier: "PUBLIC", surface: "PRESENCE-UNCLASSIFIED" };
}

function tagsFor(path, cls) {
  const tags = [];

  tags.push(cls.tier);
  tags.push(cls.surface);

  // Common StarMap role tags
  if (path === "/") tags.push("ENTRY");
  if (path === "/arrival") tags.push("ENTRY");
  if (path === "/seed") tags.push("SEED");
  if (path === "/orientation") tags.push("ORIENT");
  if (path === "/courtyard") tags.push("COURTYARD");
  if (path === "/dream-guardian") tags.push("DG");

  if (path.startsWith("/track/mrs/")) tags.push("MRS");
  if (path.startsWith("/track/adam/")) tags.push("ADAM");
if (cls.surface === "ALIAS") tags.push("ALIAS");

    // legacy owner tags
    if (path.startsWith("/mrs/")) tags.push("MRS");
    if (path.startsWith("/adam/")) tags.push("ADAM");
    if (path === "/N") tags.push("N");

  if (cls.tier === "PUBLIC") tags.push("OBSERVATIONAL");

  return [...new Set(tags)];
}

function toMarkdown(reg) {
  const byTier = new Map();
  for (const p of reg.routes) {
    const key = p.classification.tier;
    if (!byTier.has(key)) byTier.set(key, []);
    byTier.get(key).push(p);
  }

  const tierOrder = ["PUBLIC", "SEMI", "PERSONAL", "STEWARD"];
  const lines = [];
  lines.push(`# Surface Registry`);
  lines.push(``);
  lines.push(`- Generated: ${reg.generated_at}`);
  lines.push(`- From: ${reg.source_route_map}`);
  lines.push(`- Route count: ${reg.routes.length}`);
  lines.push(``);

  for (const tier of tierOrder) {
    const items = byTier.get(tier) || [];
    if (items.length === 0) continue;
    lines.push(`## ${tier}`);
    lines.push(``);
    for (const it of items) {
      lines.push(`- \`${it.path}\` — ${it.tags.join(" · ")}`);
    }
    lines.push(``);
  }

  lines.push(`## Notes`);
  lines.push(``);
  lines.push(`- Tags are descriptive overlays. No behavior is implied by presence alone.`);
  lines.push(`- Adjust rules in \`scripts/surface-registry.mjs\` under "StarMap tagging rules".`);
  lines.push(``);
  return lines.join("\n");
}

function main() {
  mkdirSync("codex/site", { recursive: true });

  const source = latestRouteMapFile();
  const text = readFileSync(source, "utf8");
  const routes = extractRoutes(text);

  const reg = {
    generated_at: new Date().toISOString(),
    source_route_map: source,
    routes: routes.map((path) => {
      const classification = classifyRoute(path);
      return { path, classification, tags: tagsFor(path, classification) };
    }),
  };

  writeFileSync(OUT_JSON, JSON.stringify(reg, null, 2) + "\n", "utf8");
  writeFileSync(OUT_MD, toMarkdown(reg), "utf8");

  console.log(`[surface-registry] wrote ${OUT_JSON}`);
  console.log(`[surface-registry] wrote ${OUT_MD}`);
}

main();

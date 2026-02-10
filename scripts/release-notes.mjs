import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

function die(msg) {
  console.error(`[release-notes] ERROR: ${msg}`);
  process.exit(1);
}

function readVersion() {
  const p = "codex/site/VERSION.json";
  if (!existsSync(p)) die(`Missing ${p}`);
  const d = JSON.parse(readFileSync(p, "utf8"));
  const v = String(d.current ?? "").trim();
  if (!v) die(`Invalid ${p}: missing "current"`);
  return v;
}

function latestFile(dir, prefix) {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((f) => f.startsWith(prefix))
    .sort()
    .reverse();
  if (!files.length) return null;
  return join(dir, files[0]);
}

function safe(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function main() {
  const version = readVersion();

  const baselineDir = join("codex/site/baselines", version);
  if (!existsSync(baselineDir)) {
    die(`Baseline missing for ${version} (${baselineDir}). Run release (or baseline capture) first.`);
  }

  const regJsonPath = "codex/site/surface-registry.json";
  if (!existsSync(regJsonPath)) die(`Missing ${regJsonPath}. Run: npm run surface:registry`);

  const reg = JSON.parse(readFileSync(regJsonPath, "utf8"));
  const routeCount = Array.isArray(reg?.routes) ? reg.routes.length : 0;

  const latestRouteMap = latestFile("codex/site/route-history", "ROUTE-MAP-");
  const latestRegistrySnap = latestFile("codex/site/registry-history", "SURFACE-REGISTRY-");

  const createdAt = new Date().toISOString();

  // Optional git metadata (safe if repo isn't git)
  const gitCommit = safe("git rev-parse --short HEAD");
  const gitBranch = safe("git rev-parse --abbrev-ref HEAD");
  const gitDirty = safe("git status --porcelain") ? "yes" : "no";

  // Manual notes file (optional)
  const manualPath = "codex/site/RELEASE-NOTES.manual.md";
  const manual = existsSync(manualPath)
    ? readFileSync(manualPath, "utf8").trim()
    : "";

  const out = [];
  out.push(`# Release Notes — ${version}`);
  out.push("");
  out.push(`- Created: ${createdAt}`);
  if (gitCommit) out.push(`- Git: ${gitCommit}${gitBranch ? ` (${gitBranch})` : ""} · dirty=${gitDirty}`);
  out.push(`- Route count: ${routeCount}`);
  if (latestRouteMap) out.push(`- Route map: ${latestRouteMap}`);
  if (latestRegistrySnap) out.push(`- Registry snapshot: ${latestRegistrySnap}`);
  out.push("");

  out.push(`## Summary`);
  out.push("");
  if (manual) {
    out.push(manual);
  } else {
    out.push(`- (No manual summary yet)`);
    out.push(`- Tip: write a short bullet list in codex/site/RELEASE-NOTES.manual.md and rerun release-notes.`);
  }
  out.push("");

  // Save inside the baseline folder so it is version-immortal
  const outPath = join(baselineDir, "RELEASE-NOTES.md");
  writeFileSync(outPath, out.join("\n") + "\n", "utf8");

  console.log(`[release-notes] wrote ${outPath}`);
}

main();

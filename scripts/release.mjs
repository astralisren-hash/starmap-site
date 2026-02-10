// scripts/release.mjs
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

function die(msg) {
  console.error(`[release] ERROR: ${msg}`);
  process.exit(1);
}

function log(msg) {
  console.log(`[release] ${msg}`);
}

function sh(cmd, opts = {}) {
  if (!opts.quiet) console.log(`[release] ${cmd}`);
  return execSync(cmd, { stdio: "inherit" });
}

function mustExist(path, label = path) {
  if (!existsSync(path)) die(`Missing ${label} (${path})`);
}

function readJson(path, label = path) {
  mustExist(path, label);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    die(`Invalid JSON in ${label}: ${e.message}`);
  }
}

function readVersion() {
  const p = "codex/site/VERSION.json";
  const d = readJson(p, p);
  const v = String(d.current ?? "").trim();
  if (!v) die(`Invalid ${p}: missing "current"`);
  if (!/^R\d+\.\d+\.\d+$/.test(v)) die(`Bad VERSION.json current: ${v}`);
  return v;
}

function writeVersion(v) {
  const p = "codex/site/VERSION.json";
  writeFileSync(p, JSON.stringify({ current: v }, null, 2) + "\n", "utf8");
}

function baselineDirFor(version) {
  return join("codex/site/baselines", version);
}

function nextFreeVersion(current) {
  const m = String(current).match(/^R(\d+)\.(\d+)\.(\d+)$/);
  if (!m) die(`Bad VERSION.json current: ${current}`);
  const maj = Number(m[1]);
  const min = Number(m[2]);
  let patch = Number(m[3]);

  // Move forward until we find a baseline dir that does not exist
  while (existsSync(baselineDirFor(`R${maj}.${min}.${patch}`))) {
    patch += 1;
    if (patch > 9999) die("Patch bump runaway (>9999).");
  }
  return `R${maj}.${min}.${patch}`;
}

function latestRouteMapPath() {
  const dir = "codex/site/route-history";
  mustExist(dir, dir);

  const files = readdirSync(dir)
    .filter((f) => /^ROUTE-MAP-\d{4}-\d{2}-\d{2}(?:_\d{4})?\.txt$/.test(f))
    .sort();

  if (!files.length) return null;
  return join(dir, files[files.length - 1]);
}

function snapshotBaseline(version) {
  const dir = baselineDirFor(version);
  if (existsSync(dir)) die(`Baseline already exists for ${version} (${dir}). Bump version first.`);

  mkdirSync(dir, { recursive: true });

  // Require canonical artifacts
  mustExist("codex/site/surface-registry.json");
  mustExist("codex/site/surface-registry.md");

  const routeMap = latestRouteMapPath();
  if (!routeMap) die("No route-map found in codex/site/route-history. Run build first.");

  copyFileSync(routeMap, join(dir, "ROUTE-MAP.txt"));
  copyFileSync("codex/site/surface-registry.json", join(dir, "surface-registry.json"));
  copyFileSync("codex/site/surface-registry.md", join(dir, "surface-registry.md"));

  const note =
    `# Baseline ${version}\n\n` +
    `- Created: ${new Date().toISOString()}\n` +
    `- Source route-map: ${routeMap}\n`;

  writeFileSync(join(dir, "BASELINE.md"), note, "utf8");

  log(`baseline captured → ${dir}`);
}

function hasNpmScript(name) {
  const pkg = readJson("package.json", "package.json");
  return !!pkg?.scripts?.[name];
}

function main() {
  // Gate 0: required npm scripts exist
  if (!hasNpmScript("validate:all")) die(`Missing npm script "validate:all" in package.json`);
  if (!hasNpmScript("validate:dist")) die(`Missing npm script "validate:dist" in package.json`);
  if (!hasNpmScript("build")) die(`Missing npm script "build" in package.json`);

  // Pick next free version and write it immediately (so logs + baseline match)
  const current = readVersion();
  const version = nextFreeVersion(current);
  writeVersion(version);
  log(`using version ${version} (from ${current})`);

  // Gate 1: validators must be green BEFORE build
  sh("npm run validate:all");

  // Build (produces dist + route-history + registry-history)
  sh("npm run build");

  // Gate 2: dist namespace validator must be green AFTER build
  sh("npm run validate:dist");

  // Gate 3: baseline must be new for this version
  snapshotBaseline(version);

  // Optional: release notes (only if present)
  if (hasNpmScript("release:notes")) {
    sh("npm run release:notes");
  }

  // Upload/deploy step goes here if you want it inside release.mjs.
  // If your upload is handled elsewhere, leave it as-is.
  //
  // Example:
  // sh("node scripts/upload-r2.mjs");

  log(`SUCCESS → ${version}`);
}

main();

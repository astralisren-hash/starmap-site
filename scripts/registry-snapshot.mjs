// scripts/registry-snapshot.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const OUT_DIR = "codex/site/registry-history";
const SRC_JSON = "codex/site/surface-registry.json";
const SRC_MD = "codex/site/surface-registry.md";

function stamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}_${hh}${mi}`;
}

mkdirSync(OUT_DIR, { recursive: true });

// Ensure registry is fresh
console.log("[registry-snapshot] npm run surface:registry");
execSync("npm run surface:registry", { stdio: "inherit" });

const json = readFileSync(SRC_JSON, "utf8");
const md = readFileSync(SRC_MD, "utf8");

const s = stamp();
const outJson = join(OUT_DIR, `SURFACE-REGISTRY-${s}.json`);
const outMd = join(OUT_DIR, `SURFACE-REGISTRY-${s}.md`);

writeFileSync(outJson, json, "utf8");
writeFileSync(outMd, md, "utf8");

console.log(`[registry-snapshot] wrote ${outJson}`);
console.log(`[registry-snapshot] wrote ${outMd}`);

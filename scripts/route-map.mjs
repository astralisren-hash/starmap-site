import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function stamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}_${hh}${mi}`;
}
const outDir = "codex/site/route-history";
mkdirSync(outDir, { recursive: true });

const buildLog = execSync("npm run build:core", { encoding: "utf8" });

// Keep the route-relevant section; fall back to full log if markers differ.
let routes = buildLog;
const marker = "generating static routes";
const idx = buildLog.indexOf(marker);
if (idx >= 0) routes = buildLog.slice(idx);

const file = join(outDir, `ROUTE-MAP-${stamp()}.txt`);
writeFileSync(file, routes, "utf8");

console.log(`[route-map] wrote ${file}`);

import { readFileSync, writeFileSync } from "node:fs";

const path = "codex/site/VERSION.json";

const data = JSON.parse(readFileSync(path, "utf8"));
const cur = String(data.current ?? "R0");

// Expected: "R<major>.<minor>.<patch>" OR legacy "R<patch>"
function parse(v) {
  // legacy: R6 -> 0.0.6
  const legacy = v.match(/^R(\d+)$/);
  if (legacy) return { major: 0, minor: 0, patch: Number(legacy[1]) };

  const m = v.match(/^R(\d+)\.(\d+)\.(\d+)$/);
  if (!m) throw new Error(`Invalid VERSION.json current="${v}". Use R<maj>.<min>.<patch> or legacy R<number>.`);

  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

function format({ major, minor, patch }) {
  return `R${major}.${minor}.${patch}`;
}

const bump = process.argv[2] || "patch";
const v = parse(cur);

let next;
if (bump === "patch") next = { major: v.major, minor: v.minor, patch: v.patch + 1 };
else if (bump === "minor") next = { major: v.major, minor: v.minor + 1, patch: 0 };
else if (bump === "major") next = { major: v.major + 1, minor: 0, patch: 0 };
else throw new Error(`Unknown bump type "${bump}". Use: patch | minor | major`);

const nextStr = format(next);
data.current = nextStr;

writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Version bumped: ${cur} → ${nextStr}`);

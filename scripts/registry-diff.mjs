import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const HIST_DIR = "codex/site/registry-history";
const OUT_DIR = "codex/site/registry-diff";

function die(msg) {
  console.error(`[registry-diff] ERROR: ${msg}`);
  process.exit(1);
}

function latestTwo() {
  const files = readdirSync(HIST_DIR)
    .filter((f) => /^SURFACE-REGISTRY-\d{4}-\d{2}-\d{2}_\d{4}\.json$/.test(f))
    .sort();
  if (files.length < 2) {
    die(`Need at least 2 registry snapshots in ${HIST_DIR}. Create them with: npm run registry:snapshot`);
  }
  const prev = files[files.length - 2];
  const curr = files[files.length - 1];
  return { prev, curr, prevPath: join(HIST_DIR, prev), currPath: join(HIST_DIR, curr) };
}

function mapRegistry(reg) {
  const m = new Map();
  for (const r of reg.routes || []) {
    m.set(r.path, {
      tier: r.classification?.tier || null,
      surface: r.classification?.surface || null,
      tags: Array.isArray(r.tags) ? [...r.tags].sort() : [],
    });
  }
  return m;
}

function setEq(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const { prev, curr, prevPath, currPath } = latestTwo();
  const prevReg = JSON.parse(readFileSync(prevPath, "utf8"));
  const currReg = JSON.parse(readFileSync(currPath, "utf8"));

  const A = mapRegistry(prevReg);
  const B = mapRegistry(currReg);

  const allPaths = new Set([...A.keys(), ...B.keys()]);
  const added = [];
  const removed = [];
  const changedTier = [];
  const changedTags = [];

  for (const p of [...allPaths].sort((x, y) => x.localeCompare(y))) {
    const a = A.get(p);
    const b = B.get(p);

    if (!a && b) {
      added.push({ path: p, now: b });
      continue;
    }
    if (a && !b) {
      removed.push({ path: p, was: a });
      continue;
    }
    if (!a || !b) continue;

    if (a.tier !== b.tier || a.surface !== b.surface) {
      changedTier.push({ path: p, from: `${a.tier}:${a.surface}`, to: `${b.tier}:${b.surface}` });
    } else if (!setEq(a.tags, b.tags)) {
      const aSet = new Set(a.tags);
      const bSet = new Set(b.tags);
      const plus = [...bSet].filter((t) => !aSet.has(t)).sort();
      const minus = [...aSet].filter((t) => !bSet.has(t)).sort();
      changedTags.push({ path: p, plus, minus });
    }
  }

  const stampPrev = prev.replace(/^SURFACE-REGISTRY-/, "").replace(/\.json$/, "");
  const stampCurr = curr.replace(/^SURFACE-REGISTRY-/, "").replace(/\.json$/, "");
  const outFile = join(OUT_DIR, `REGISTRY-DIFF-${stampCurr}-vs-${stampPrev}.md`);

  const lines = [];
  lines.push(`# Registry Diff`);
  lines.push(``);
  lines.push(`- Current: \`${curr}\``);
  lines.push(`- Previous: \`${prev}\``);
  lines.push(`- Added routes: **${added.length}**`);
  lines.push(`- Removed routes: **${removed.length}**`);
  lines.push(`- Tier/surface changes: **${changedTier.length}**`);
  lines.push(`- Tag-only changes: **${changedTags.length}**`);
  lines.push(``);

  lines.push(`## Added`);
  lines.push(``);
  if (!added.length) lines.push(`- (none)`);
  else for (const x of added) lines.push(`- \`${x.path}\` — ${x.now.tier}:${x.now.surface} — ${x.now.tags.join(" · ")}`);
  lines.push(``);

  lines.push(`## Removed`);
  lines.push(``);
  if (!removed.length) lines.push(`- (none)`);
  else for (const x of removed) lines.push(`- \`${x.path}\` — was ${x.was.tier}:${x.was.surface} — ${x.was.tags.join(" · ")}`);
  lines.push(``);

  lines.push(`## Tier / Surface Changes`);
  lines.push(``);
  if (!changedTier.length) lines.push(`- (none)`);
  else for (const x of changedTier) lines.push(`- \`${x.path}\` — ${x.from} → ${x.to}`);
  lines.push(``);

  lines.push(`## Tag Changes`);
  lines.push(``);
  if (!changedTags.length) lines.push(`- (none)`);
  else {
    for (const x of changedTags) {
      const plus = x.plus.length ? `+${x.plus.join(", ")}` : "";
      const minus = x.minus.length ? `-${x.minus.join(", ")}` : "";
      const sep = plus && minus ? "  " : "";
      lines.push(`- \`${x.path}\` — ${plus}${sep}${minus}`);
    }
  }
  lines.push(``);

  lines.push(`## Notes`);
  lines.push(``);
  lines.push(`- Tier/surface changes are the highest-signal drift.`);
  lines.push(`- Tag changes are secondary drift (classification stable).`);
  lines.push(``);

  writeFileSync(outFile, lines.join("\n"), "utf8");

  console.log(`[registry-diff] wrote ${outFile}`);
  console.log(`[registry-diff] added=${added.length} removed=${removed.length} tierChanged=${changedTier.length} tagChanged=${changedTags.length}`);
}

main();

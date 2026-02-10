import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`[release] ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

const bump = process.argv[2];
if (!["patch", "minor", "major"].includes(bump)) {
  console.error(`[release] ERROR: Usage: node scripts/release-semver.mjs <patch|minor|major>`);
  process.exit(1);
}

// bump first (prevents baseline overwrite)
run(`npm run version:${bump}`);

// then gated release (validators + build + validate:dist + baseline lock)
run("npm run release");

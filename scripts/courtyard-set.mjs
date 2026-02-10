import fs from "node:fs";

const file = "src/content/courtyard.state.json";

const next = process.argv[2];         // open|quiet|closed
const stewardArg = process.argv[3];   // true|false (optional)
const seasonArg = process.argv[4];    // I|II|III|IV|V (optional)
const allowInputArg = process.argv[5];// true|false (optional)

if (!["open", "quiet", "closed"].includes(next)) {
  console.error("Usage: node scripts/courtyard-set.mjs open|quiet|closed [steward] [season] [allowInput]");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, "utf8"));

data.prev_state = data.state ?? "quiet";
data.state = next;

if (stewardArg !== undefined) data.steward = (stewardArg === "true");
if (seasonArg !== undefined) data.season = seasonArg;
if (allowInputArg !== undefined) data.allowInput = (allowInputArg === "true");

fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log("Updated courtyard.state.json:");
console.log(JSON.stringify(data, null, 2));

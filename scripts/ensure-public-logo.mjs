import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rootLogo = join(root, "bigpicture-logo.png");
const publicDir = join(root, "public");
const publicLogo = join(publicDir, "bigpicture-logo.png");

if (!existsSync(rootLogo)) {
  process.exit(0);
}

mkdirSync(publicDir, { recursive: true });
copyFileSync(rootLogo, publicLogo);
console.log("ensure-public-logo: synced ./bigpicture-logo.png → public/bigpicture-logo.png");

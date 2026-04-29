import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");
const src = join(projectRoot, "prototypes/independent/dist");
const dest = join(projectRoot, "dist/prototypes/independent");

if (!existsSync(src)) {
  console.warn(
    "copy-independent-dist: skip — prototypes/independent/dist missing.",
  );
  process.exit(0);
}

mkdirSync(dirname(dest), { recursive: true });
cpSync(src, dest, { recursive: true });
const idx = join(dest, "index.html");
const nf = join(dest, "404.html");
if (existsSync(idx)) {
  copyFileSync(idx, nf);
}
console.log("copy-independent-dist: merged into dist/prototypes/independent/");

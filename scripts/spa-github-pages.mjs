import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");
const indexHtml = join(projectRoot, "dist/index.html");
const notFoundHtml = join(projectRoot, "dist/404.html");

if (!existsSync(indexHtml)) {
  console.error("spa-github-pages: dist/index.html missing — build first.");
  process.exit(1);
}
copyFileSync(indexHtml, notFoundHtml);
console.log("spa-github-pages: copied dist/index.html → dist/404.html");

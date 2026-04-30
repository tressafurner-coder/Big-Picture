import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const indexHtml = join(root, "dist", "index.html");
let base = "/BigPicture/";
try {
  const html = readFileSync(indexHtml, "utf8");
  const m = html.match(/(?:src|href)="(\/[^"]+?)\/assets\//);
  if (m) base = `${m[1]}/`;
} catch {
  console.warn("vite-pages-preview: could not read dist/index.html, using default base");
}
console.error(`vite-pages-preview: npm run preview --base ${base}`);
const result = spawnSync("npx", ["vite", "preview", "--base", base], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});
process.exit(result.status ?? 1);

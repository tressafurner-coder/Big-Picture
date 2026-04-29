import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Nested GitHub Pages deploy under main site (/BigPicture/prototypes/independent/)
export default defineConfig({
  plugins: [react()],
  base:
    process.env.GITHUB_PAGES === "true"
      ? "/BigPicture/prototypes/independent/"
      : "/",
});

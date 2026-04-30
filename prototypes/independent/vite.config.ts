import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function gitHubPagesIndependentBase(): string {
  const slug = process.env.GITHUB_REPOSITORY?.split("/")?.[1];
  const segment = slug ?? "BigPicture";
  return `/${segment}/prototypes/independent/`;
}

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base:
    command === "build" && process.env.GITHUB_PAGES === "true"
      ? gitHubPagesIndependentBase()
      : "/",
}));

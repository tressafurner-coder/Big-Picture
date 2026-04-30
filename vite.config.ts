import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

/**
 * Project Pages asset URL is /<repo>/ — must match GitHub Pages path.
 * CI sets GITHUB_REPOSITORY=owner/repo; local pages builds fall back to BigPicture.
 *
 * Subdirectory `base` applies only to `vite build`. Using it during `vite dev`
 * would force the app under /BigPicture/ etc., so http://127.0.0.1:5175/risk-jira-mapping
 * would miss the shell and show a blank page if GITHUB_PAGES leaked into the shell env.
 */
function gitHubPagesBasePath(): string {
  const slug = process.env.GITHUB_REPOSITORY?.split('/')?.[1]
  const segment = slug ?? 'BigPicture'
  return `/${segment}/`
}

export default defineConfig(({ command }) => ({
  base:
    command === 'build' && process.env.GITHUB_PAGES === 'true'
      ? gitHubPagesBasePath()
      : '/',
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
}))

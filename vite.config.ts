import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

/** Set at each `vite build` / dev server start — shown as “Last update” in the UI. */
const appLastUpdate = new Date().toLocaleString('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default defineConfig({
  // GitHub Pages project site: https://<org>.github.io/<repo>/ e.g. fuegokit.github.io/BigPicture/
  base: process.env.GITHUB_PAGES === 'true' ? '/BigPicture/' : '/',
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

  define: {
    __APP_LAST_UPDATE__: JSON.stringify(appLastUpdate),
  },
})

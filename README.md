# AI Chatbot for BigPicture

Prototype UI for an AI chat assistant (Vite, React, Tailwind). The original design reference is in Figma: [AI Chatbot for BigPicture](https://www.figma.com/design/5Z0t2qca7nPIiHn1ZLKefh/AI-Chatbot-for-BigPicture).

## Repository

- **Organization:** [fuegokit](https://github.com/fuegokit)
- **This project:** [BigPicture](https://github.com/fuegokit/BigPicture)
- **SSH:** `git@github.com:fuegokit/BigPicture.git`
- **HTTPS:** https://github.com/fuegokit/BigPicture.git

## GitHub Pages (live demo)

Each push to `main` runs **Deploy to GitHub Pages** and publishes `dist/`.  
**You must turn Pages on once**, otherwise the deploy job fails with **404** (“Failed to create deployment”).

### One-time setup (required)

1. Open **https://github.com/fuegokit/BigPicture/settings/pages**
2. Under **Build and deployment** → **Source**, choose **GitHub Actions** (not “Deploy from a branch”).
3. Save if prompted, then run the workflow again: **Actions** → **Deploy to GitHub Pages** → **Run workflow**, or push any commit to `main`.

### Live URL

**https://fuegokit.github.io/BigPicture/** (after a successful run).

Local preview with the same URL shape as GitHub Pages (`/BigPicture/`):

```bash
npm run preview:pages
```

Then open **http://localhost:4173/BigPicture/** (Vite prints the exact URL).

## Running the code

1. Install dependencies: `npm i`
2. Start the dev server: `npm run dev` (served at `/` locally)
3. Production build: `npm run build` (default `base` is `/`; CI sets `GITHUB_PAGES=true` for `/BigPicture/`)

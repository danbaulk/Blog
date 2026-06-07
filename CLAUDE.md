# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at localhost:3000
npm run build      # Production build to /build
npm test           # Run tests in watch mode
npm test -- --watchAll=false  # Run tests once (CI mode)
```

## Architecture

This is a Create React App (React 19) personal blog/portfolio site. Routing is handled by `react-router-dom` with a top-level `App.js` that defines the layout (banner with logo and social links) and all routes.

**Adding a new blog post:**
1. Create `src/blogs/YourPost.js` — import `./blogs.css` for shared blog styling
2. Add a route in `src/App.js`: `<Route path="/your-post" element={<YourPost />} />`
3. Add a carousel card in `src/Home.js` linking to the new route
4. Drop any images into `src/assets/`

## Deployment

Merges to `main` trigger a GitHub Actions workflow (`.github/workflows/docker-image.yml`) that builds and pushes a Docker image to DockerHub as `danb173/blog:latest`. The Dockerfile is a two-stage build: Node 18 builds the static assets, then Nginx serves them on port 80.

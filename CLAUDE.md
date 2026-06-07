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

This is a Create React App (React 19) personal blog/portfolio site. Routing is handled by `react-router-dom` with a top-level `App.js` that defines the layout (sticky banner with the BAULK wordmark and inline-SVG social links) and all routes.

**Adding a new blog post:**
1. Create `src/blogs/YourPost.js` — import `./blogs.css` for shared blog styling
2. Add a route in `src/App.js`: `<Route path="/your-post" element={<YourPost />} />`
3. Add a project card in `src/Home.js`'s `<Carousel>` linking to the new route. Follow the existing `.project-card` markup: a `<Link className="project-card">` wrapping `.project-card__media` (the image) and `.project-card__body` (`<h3>`, description `<p>`, and a `.project-card__cta`)
4. Drop any images into `src/assets/`

## Styling

The site uses a dark theme driven by CSS custom properties — no CSS framework or styling library. Design tokens (colours, spacing scale, radii, shadows, fonts, layout widths) are defined once in `:root` in `src/index.css`; reference them with `var(--token)` rather than hardcoding values so new components stay consistent. Layout/banner/card styles live in `src/App.css`; blog-post styles in `src/blogs/blogs.css`. The Inter font is loaded via a `<link>` in `public/index.html`. Accent colour is indigo (`--accent: #6366f1`).

## Deployment

Merges to `main` trigger a GitHub Actions workflow (`.github/workflows/docker-image.yml`) that builds and pushes a Docker image to DockerHub as `danb173/blog:latest`. The Dockerfile is a two-stage build: Node 18 builds the static assets, then Nginx serves them on port 80.

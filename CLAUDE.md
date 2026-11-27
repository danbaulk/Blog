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

This is a Create React App (React 19) personal blog/portfolio site. Routing is handled by `react-router-dom` with a top-level `App.js` that defines the layout (sticky banner with a small black-hole mark + "Dan Baulk" name, and inline-SVG social links) and all routes.

**Adding a new blog post:**
1. Create `src/blogs/YourPost.js` — import `./blogs.css` for shared blog styling
2. Add a route in `src/App.js`: `<Route path="/your-post" element={<YourPost />} />`
3. Add an entry to `src/projects.js` (`id`, `title`, `route`, `blurb`, `thumb`, and a star `color`). That list is the only place projects are declared: it becomes a star in the home-page galaxy and a card in its no-WebGL fallback
4. Drop any images into `src/assets/`

## Styling

The site uses a dark theme driven by CSS custom properties — no CSS framework or styling library. Design tokens (colours, spacing scale, radii, shadows, fonts, layout widths) are defined once in `:root` in `src/index.css`; reference them with `var(--token)` rather than hardcoding values so new components stay consistent. Layout/banner/card styles live in `src/App.css`; blog-post styles in `src/blogs/blogs.css`. The Inter font is loaded via a `<link>` in `public/index.html`. Accent colour is indigo (`--accent: #6366f1`).

## Home page galaxy

The home page is a full-screen WebGL scene (`three`, lazy-loaded so post pages never download it): a black hole with one star per project spiralling around it. Hover a star (or tap, on touch) to see its card, click to open the post. It lives in `src/galaxy/`, split so each part has one job:

- `orbits.js` - pure maths, no three.js or DOM, tested in `orbits.test.js`. Tune spiral layout, rotation speed and the shadow occlusion here.
- `blackHoleShader.js` - GLSL: the ray-marched, gravitationally lensed black hole and accretion disk, the background starfield, and the ambient spiral particles (orbited on the GPU with the same speed curve as `orbits.js`).
- `GalaxyScene.js` - imperative three.js class (`start`/`dispose`/`pick`/`setHighlighted`). It creates its own canvas, renders the black hole at a reduced, self-adjusting resolution, and must free the WebGL context in `dispose()` because each home visit makes a new one.
- `Galaxy.js` - React: mounts the scene, moves the DOM labels and hover card each frame through refs (not state), and owns pointer, touch and keyboard input (a visually hidden project nav that appears on focus).

`prefers-reduced-motion` renders one still frame. If WebGL is unavailable or the context is lost, it falls back to a grid of `.project-card`s.

## Brand mark & icons

`public/brand-mark.svg` is the single source for the brand: the banner shows it, it's the SVG favicon, and `favicon.ico`, `logo192.png` and `logo512.png` are rasterised from it. It is a miniature of the home-page black hole (lensed arch, photon ring, accretion disk) drawn with plain shapes and no `<text>`, so it renders identically everywhere. After changing it, regenerate the raster icons and commit them:

```bash
npm --prefix scripts/icons install && npm --prefix scripts/icons run generate
```

The generator has its own `package.json` so `sharp` never enters the site build or Docker image.

## Deployment

Merges to `main` trigger a GitHub Actions workflow (`.github/workflows/docker-image.yml`) that builds and pushes a Docker image to DockerHub as `danb173/blog:latest`. The Dockerfile is a two-stage build: Node 18 builds the static assets, then Nginx serves them on port 80.

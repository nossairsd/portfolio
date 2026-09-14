# Nossair Sedki — Portfolio

Personal portfolio of Nossair Sedki, Full-Stack Software Engineer. Bilingual (French by
default, English), light "Studio Blue" design system shared with Meta Ads Report Studio, and
four scroll-driven 3D scenes that each explain something about the profile.

## Stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| UI | Tailwind CSS 4, Motion, Lucide, cmdk (command menu), NumberFlow, Sonner |
| Scroll & text | Lenis driven by GSAP's ticker, GSAP ScrollTrigger and SplitText |
| 3D | three.js, React Three Fiber, drei (`View`), one shared WebGL canvas |
| i18n | next-intl, `/fr` and `/en` |

## The 3D scenes

All scenes render into a single fixed canvas (`components/three/scene-canvas.tsx`) through
drei `View`s, so the page holds one WebGL context however many scenes it has. Views off screen
are skipped. Each scene reads a scroll progress value from `lib/use-scroll-progress.ts`.

| Scene | Section | What it shows |
| --- | --- | --- |
| `pipeline-scene.tsx` | Process | A feature travelling from requirement to production through six stations |
| `laptop-scene.tsx` | Projects | Meta Ads Report Studio on a laptop that opens and flips through its screens |
| `architecture-scene.tsx` | Stack | The stack as the four layers of a system, pulled apart by scrolling |
| `globe-scene.tsx` | Contact | Tangier, with routes to the European cities the mobility covers |

The globe's land dots are precomputed: `node scripts/generate-globe-dots.mjs` rewrites
`components/three/globe-dots.json` from Natural Earth data.

## Editing content

- **Text** lives in `messages/fr.json` and `messages/en.json`.
- **Links, email, CV files, start date at Kohler, city coordinates** live in `lib/site.ts`. The
  months of experience are computed from the start date; the home page is regenerated daily.
- **Portrait**: `public/images/nossair-sedki.png` (transparent PNG).
- **Project screenshots**: `public/images/projects/` (full size for the page) and
  `public/images/projects/screens/` (1600 px JPEGs used as laptop screen textures).

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000/fr. Press Ctrl+K (⌘K on macOS) for the command menu.

## Deploying

Import the repository into Vercel, then set `NEXT_PUBLIC_SITE_URL` to the final address so
canonical URLs, the sitemap and the share image point to it.

## Accessibility and performance

- `prefers-reduced-motion` turns off smooth scrolling, text reveals and idle 3D animation.
- three.js is loaded lazily and never rendered on the server. On phones the canvas renders at
  a lower pixel ratio without antialiasing, and a lost WebGL context hides the canvas instead
  of covering the page.
- Skip link, visible focus rings, real heading outline, and every 3D scene has its content
  mirrored in HTML next to it.

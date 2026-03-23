# HOWE_CREATIVE — Portfolio v2.0

Personal portfolio for **Stephen Howe**, Creative Systems Designer.
Operator/terminal aesthetic. Systems-first approach. Built to ship.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion (`motion/react`) |
| 3D / WebGL | Three.js, `@react-three/fiber`, `@react-three/drei` |
| Icons | Lucide React, React Icons (`react-icons/si`) |
| Routing | React Router 7 |
| Forms | Web3Forms via Vercel serverless function |
| Deployment | Vercel |

---

## Sections

| Section | Component | Description |
|---|---|---|
| Hero | `MatrixRainHero` | Canvas matrix rain + rotating wireframe shape. CSS fallback on iOS. |
| Operator Profile | `OperatorProfile` | Dossier-style about section with 3D GLTF portrait (WebGL), quick facts, and file cards. |
| Case Studies | `CaseStudies` | 6 projects with detail overlay panels (Brief, Problem, System Design, Outcome). |
| Tools & Skills | `MediaShowcase` | 26-item tool grid across Design, 3D, Motion, Audio, Frontend, Dev, and AI. |
| Contact | `ContactPanel` | Name / Email / Project Type / Brief — sends via Web3Forms relay. |
| Archive | `ArchiveSection` | Filterable timeline of prior work by tool. |

---

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

For local contact form testing (Vercel serverless):

```bash
vercel dev
```

---

## Scripts

```bash
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview production build
```

---

## Environment Variables

```bash
# .env
EMAIL_ACCESS_KEY=your_web3forms_access_key
```

Copy `.env.example` to `.env` and set your key. The Vercel serverless function at `api/contact.ts` reads this at runtime.

---

## Content

All copy and structured data lives in `site-content.json`. It is consumed via typed exports in `src/app/data/portfolio.ts`.

| Key | What it controls |
|---|---|
| `profile` | Brand, name, role, headline, social links |
| `navigation` | Nav labels and anchor targets |
| `hero` | Skill labels, scroll indicator copy |
| `operatorProfile` | Quick facts, file cards, portrait labels, notes |
| `caseStudies.projects` | Project data, tags, media, outcomes |
| `toolsSkills` | Tools grid (name, icon, color, category) |
| `contact` | Form field labels, status messages |
| `archive.entries` | Timeline entries with tool tags |
| `footer` | Links, availability status, location |

---

## Project Structure

```
src/
  app/
    components/       # All UI components and section layouts
    data/portfolio.ts # Typed content adapter (consumes site-content.json)
    lib/              # device.ts (iOS detection), webgl.ts (context detection)
    pages/Home.tsx    # Top-level page composition
    routes.ts         # React Router config
site-content.json     # Primary content model
public/               # Static assets (media, models, images)
api/                  # Vercel serverless routes (contact form)
docs/plans/           # Design and implementation docs
```

---

## iOS / Mobile Notes

iOS Safari has a hard limit of 8 simultaneous WebGL contexts. The site avoids crashes by:

- Skipping the hero Canvas on iOS — uses a CSS gradient fallback instead
- Switching matrix rain backdrops from WebGL to CSS on iOS
- Rendering the 3D portrait as a static image on iOS
- Disposing the WebGL detection test context immediately after use

If you add new `<Canvas>` components, add an `isIOSLike()` guard from `src/app/lib/device.ts`.

---

## Deployment

- Push to `main` — Vercel auto-deploys
- Ensure all media referenced in `site-content.json` exists in `public/`
- Run `npm run build` locally before merging to catch TypeScript or asset errors

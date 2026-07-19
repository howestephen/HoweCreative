# Howe Creative — Portfolio v2.0

Stephen Howe’s production portfolio for Creative Technologist, AI Designer, and Design Engineer roles. The active experience is a light-first editorial system that foregrounds shipped outcomes, career evidence, and automated creative pipelines.

## Stack

- React 19 and TypeScript
- Vite 6 and Tailwind CSS 4
- React Router 7
- Motion for interface animation
- Canvas 2D for the seeded plotter mark
- Three.js / React Three Fiber retained for the portfolio’s 3D experiments
- Web3Forms contact delivery
- Vercel deployment and serverless fallback

## Active experience

- `Masthead` — positioning, proof metrics, primary actions, and generative plotter mark
- `WorkIndex` — nine expandable, outcome-first case studies
- `Capabilities` — role and service fit
- `Method` — working principles and full 2005–present career history
- `ContactFoot` — contact form and conversion links
- `/cv` — standalone printable CV, loaded as a separate route chunk

The earlier dossier/WebGL implementation remains under `src/app/components/` for reference, but `src/app/pages/Home.tsx` composes the active editorial design from `src/app/concept/`.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Vite runs at `http://localhost:5173`.

Set the existing Web3Forms form identifier:

```bash
EMAIL_ACCESS_KEY=your_web3forms_access_key
```

The default `CONTACT_TRANSPORT=client` flow maps `EMAIL_ACCESS_KEY` into the browser build because Web3Forms’ free plan requires client-side submission and treats access keys as public form identifiers. `VITE_EMAIL_ACCESS_KEY` is also accepted for backwards compatibility.

Paid-plan server submission is explicitly separate: set `CONTACT_TRANSPORT=server` and `WEB3FORMS_SERVER_ACCESS_KEY`, then configure Web3Forms server-IP allowlisting. The private server key is never embedded in the client.

## Commands

```bash
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
```

Run all four verification commands before deployment. Use `vercel dev` only when testing the serverless fallback.

## Content and structure

Content ownership is intentionally split:

- `site-content.json` owns profile, project facts, project media, and detailed case-study copy.
- `src/app/concept/WorkIndex.tsx` owns concise editorial teasers derived from those projects.
- `src/app/concept/Method.tsx` owns the homepage career summary.
- `src/app/pages/CV.tsx` owns the application-focused CV and complete export content.

Career dates, titles, and metrics repeated across these files must be reviewed together. `src/app/data/portfolio.ts` exposes the structured JSON content to the UI.

```text
api/                         Vercel contact fallback and rate limiting
public/                      Fonts, social assets, case-study media
src/app/concept/             Active editorial homepage
src/app/components/          Shared and legacy portfolio components
src/app/data/portfolio.ts    Typed content adapter
src/app/pages/               Home and standalone CV
src/app/routes.ts            Route composition and code splitting
site-content.json            Primary structured content
docs/plans/                  Historical and current planning records
```

## Deployment

- Vercel must provide `EMAIL_ACCESS_KEY` at build time for the free Web3Forms flow.
- Confirm every media path in `site-content.json` exists under `public/`.
- Run tests, typecheck, lint, and production build before merging or deploying.

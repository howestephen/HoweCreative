
# HOWE_CREATIVE Portfolio Site

Cyberpunk-inspired portfolio site for Stephen Howe, built with React, TypeScript, and Vite.  
The project is content-driven through a single JSON source, with animated UI sections for profile, case studies, tools, contact, and archive.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (`motion/react`)
- Lucide + React Icons

## Project Structure

- `src/app/components`: UI components and section layouts
- `src/app/data/portfolio.ts`: typed content adapter layer
- `site-content.json`: primary content model for site copy and structured data
- `src/app/routes`: route-level pages
- `public`: static assets (images, media, icons)
- `api/`: Vercel serverless routes (e.g. contact form)
- `guidelines/`: design reference notes

## Quick Start

1. Install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Start the frontend dev server:

```bash
npm run dev
```

3. Open the local URL shown in terminal (typically `http://localhost:5173`).

4. For end-to-end local contact form testing (`/api/contact`), run via Vercel:

```bash
vercel dev
```

## Scripts

- `npm run dev`: start local development
- `npm run build`: production build
- `npm run preview`: preview production build locally

## Environment Variables

- `EMAIL_ACCESS_KEY`: Web3Forms access key used by the Vercel serverless function at `api/contact.ts`.

Copy `.env.example` to `.env` and set:

```bash
EMAIL_ACCESS_KEY=your_web3forms_access_key
```

## Content Editing Workflow

Most site copy and structured content are managed in `site-content.json`.

### Common updates

- **Brand/profile metadata**: `profile`
- **Navigation labels**: `navigation`
- **Hero labels**: `hero`
- **Operator profile cards + notes**: `operatorProfile`
- **Case studies/projects**: `caseStudies.projects`
- **Contact form labels/status text**: `contact`
- **Archive entries**: `archive.entries`
- **Footer links/state**: `footer`

After editing `site-content.json`, content is consumed through typed exports in `src/app/data/portfolio.ts`.

## Loading Screen

The loading experience is implemented in:

- `src/app/components/LoadingScreen.tsx`
- mounted from `src/app/components/Layout.tsx`

It runs once per page load and then fades out automatically.

## Deployment Notes

- Ensure media assets referenced in `site-content.json` exist in `public`.
- Run `npm run build` before deployment.
- Validate responsive behavior on desktop and mobile, especially for animated sections and modal/overlay content.
  
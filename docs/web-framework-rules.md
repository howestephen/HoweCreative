---
status: active
author: stephen+claude
level: L1+
updated: 2026-11-11
---

# Web framework rules

React, Tailwind, Vite and Next.js rules, moved out of `ENGINEERING.md` §3 to
keep it within its word budget. The cross-stack baseline stays there.

## React Rules

- Prefer functional components.
- Keep components small and composable.
- Move business logic into hooks, services, or domain modules.
- Avoid large smart components that parse data, enforce permissions, and render everything.
- Keep server and client boundaries explicit in Next.js.
- Avoid unnecessary client components in the App Router.
- Prefer derived state over duplicated state.
- Use reducers or state machines for complex flows.
- Treat props as explicit contracts.
- Avoid `dangerouslySetInnerHTML`.
- If raw HTML is unavoidable, sanitise it, isolate it, and document why it is safe enough.
- Never render untrusted markdown or HTML without sanitisation.

## Tailwind Rules

- Use design tokens for colour, spacing, typography, radius, and shadow.
- Avoid arbitrary values unless the design system needs them.
- Extract repeated patterns into components or variant helpers.
- Keep class strings readable.
- Prefer `clsx`, `cva`, or equivalent for controlled variants.
- Avoid one-off styling that is likely to repeat.
- Never inject untrusted user strings into class composition.
- Do not rely on dynamic classes the build cannot see unless they are deliberately safelisted.
- Keep tokens centralised.

## Vite Rules

- Validate all `import.meta.env` usage through a config module.
- Expose only intended public env vars with the correct prefix.
- Keep plugins minimal and understood.
- Review asset handling, aliases, dev-server exposure, CORS, proxy config, and preview server behaviour.
- Do not assume dev defaults are production-safe.
- Keep secrets out of client bundles.

## Next.js Rules

- Validate all data crossing server and client boundaries.
- Keep server-only code server-only.
- Do not import server-only modules into client components.
- Use route handlers, server actions, and loaders only with schema validation.
- Make caching behaviour explicit.
- Treat cookies, headers, and search params as untrusted input.
- Enforce auth on server-side paths, not just the UI.
- Verify ownership and tenant scope in server actions and route handlers.
- Sanitise redirect destinations.
- Be careful with image, file upload, and remote fetch configuration.
- Avoid leaking internal errors to clients.

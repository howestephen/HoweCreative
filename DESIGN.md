---
status: active
author: stephen+claude
level: L1+
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T13:59Z
generated_from: conversation
---

# DESIGN  -  Product Design and Visual System

Product design is a first-class dimension. This file defines the design POV, visual primitives, interaction principles, and content voice for the project.

At L1, this is bullet-mode and short. It expands through L2 to L3 as the project matures.

## L1  -  Build (bullet-mode)

### Design foundation (before UI)

Before any product screen, choose the libraries suited to the project, layer
by layer (see Library layers; shadcn/ui is one option, not a mandate) and a
visual direction taken from the brand. Build a basic design system and a
rendered reference page from them. Stephen signs off that reference before
product screens are built; later screens reuse it. Revisit it at each
lifecycle level change.

Copy and visual rules for the system:

- Use the shortest visible copy that helps someone act, understand a state or
  recover.
- Clear icons and visual cues by default; keep labels where clarity or
  accessibility needs them.
- Longer explanations go in expandable help or accessible tooltips. Critical
  instructions stay visible.

### Library layers

A design system has many layers, and one library rarely covers them all. Early
in the foundation, decide each layer that the product needs. Record the choice
in the project's DESIGN.md: the pick, one or two differentiated alternatives,
and the reason it solves the job quickest. When Stephen asks "what are we going
to use?", answer with a recommendation per layer, not a menu.

Layers to consider: UI primitives and components, styling and variants, icons,
toasts, drawers and sheets, command menu, forms and inputs, motion and
animation, charts, tables and virtualised lists, drag and drop, state, code
highlighting, theming.

Starting list: the `pick-ui-library` skill (manual: /pick-ui-library), or the
table below if the skill is absent. Check `package.json` first and keep what is
installed unless it fails the job. Say so when a layer is outside the list.
Products run on Cloudflare, not necessarily Next.js: Next-only picks are
flagged.

Motion and animation are a layer in their own right, decided at the
foundation, not added late. For that layer use the motion skills: `animate`,
`emil-design-eng`, `review-animations` and `animation-performance`. Plain CSS
transitions suffice for simple hover and fade; a library is for springs,
layout, exit and gesture animation.

The rendered reference page shows the chosen layers working together,
including their motion, and Stephen signs it off with the rest of the
reference.

Curated picks, after Emil Kowalski's pick-ui-library (MIT,
github.com/emilkowalski/skills):

| Layer | Pick | For |
| --- | --- | --- |
| Primitives | base-ui | Unstyled accessible dialogs, popovers, menus, selects |
| Command menu | cmdk | Cmd+K palettes |
| Toasts | Sonner | Toasts and notifications |
| Drawers, sheets | Vaul | Drawers and bottom sheets |
| OTP input | input-otp | Verification code fields |
| Control panels | Leva | Tweakable GUIs and debug panels |
| Motion | motion (Framer Motion) | Springs, layout, enter and exit, gestures |
| Numbers | NumberFlow | Animated counters, prices, stats |
| Animated text | torph | Text transitions |
| 3D globe | Cobe | Globes |
| OG images | Satori | HTML/CSS to SVG; Vercel-origin, check it on Cloudflare |
| Code highlighting | shiki | Syntax highlighting |
| Charts, live | Liveline | Streaming charts that scroll with time |
| Charts, general | recharts | Static and interactive charts |
| Drag and drop | dnd kit | Sortable lists, boards |
| Virtual lists, tables | Virtuoso | Long lists and large tables |
| State | zustand | Shared client state |
| Class strings | clsx | Conditional class names |
| Variants | cva | Typed variants for Tailwind components |
| Theming | next-themes | Dark mode without flash; Next-only, use a plain script or CSS variables elsewhere |

Not in the list, so choose per project and record why: icons, forms and
validation, data tables beyond virtualisation, dates, rich text.

### Design POV

- Who is this for: (one sentence  -  the primary user)
- What promise does the experience make: (one sentence  -  tone + core offer)
- What the experience is NOT: (one sentence  -  what to avoid)

### Visual primitives

- Colour tokens: (list 5 to 9 named tokens, hex values)
- Typography: (display, body, mono  -  font families + size scale)
- Spacing scale: (e.g. 4, 8, 12, 16, 24, 32, 48, 64)
- Radius: (e.g. 4, 8, 16  -  use one consistently per component type)
- Elevation: (1 to 3 shadow levels max at L1)

### States we always handle

Every screen or component must handle:

- loading
- empty
- error
- success

No state = no ship.

### Interaction principles

- (3 to 5 bullet rules for how the product feels  -  e.g. "feedback within 100ms", "destructive actions always confirmable", "keyboard-navigable from day one")

### Content / voice

- (2 to 3 bullet rules for writing  -  e.g. "second person", "no jargon", "sentence case")

### Component inventory

Track components as they emerge. Keep this list minimal at L1.

- (name)  -  (one-line purpose)
- (name)  -  (one-line purpose)

---

## L2  -  Launch-ready (consolidation)

Expand the L1 sections into prose where concepts have stabilised. Add examples. Formalise the component inventory with props and variants.

Add:

- **Layout patterns:** grid system, container widths, breakpoints
- **Naming conventions:** component, variant, prop names
- **Design-to-code handoff:** how Figma/design files map to components

### Quality and accessibility (L2)

Add:

- **Usability bar:** concrete criteria (e.g. task completion ≥ 80% in unmoderated test)
- **Accessibility basics (WCAG A):**
  - colour contrast ratios
  - keyboard operability
  - form label requirements
  - focus indicators
  - alt text requirements
- **Animation rules:** reduced-motion preference, duration limits, easing defaults
- **Error-state design library:** consistent shape across the product

### Hardening (L2)

Add:

- **Input design for destructive actions:** confirmations, undo, multi-step where risk warrants
- **Authentication + permission UX:** clarity of access states, tenant-switching, role boundaries visible
- **PII input design:** privacy notices at point of collection, minimum-necessary by default

## L3  -  Live

Add:

- **Consent UX:** cookie banners, consent granularity, preference centre
- **Subject access / deletion flows:** findable, usable, within legal timeframes
- **Data classification surfacing:** users see what's sensitive, what's shared

Detailed accessibility obligations move to `ACCESSIBILITY.md` (WCAG AA / EAA) at L4.

`DESIGN.md` keeps:

- Brand guidelines (final)
- Component library (complete, versioned)
- Design system governance (who owns changes, how they roll out)

## Revision log

- YYYY-MM-DD  -  initial POV + primitives (L1)
- YYYY-MM-DD  -  added component inventory entries
- YYYY-MM-DD  -  L2 consolidation pass: prose added for layout + naming

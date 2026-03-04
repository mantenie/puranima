# Puranima — Beicht-Helfer PWA

## Overview

Progressive Web App for Catholic examination of conscience (Gewissenserforschung).
Privacy-first, offline-capable, zero server communication for user data.

**UI language**: German
**Code language**: English (variables, comments, documentation, commits)

## Tech Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Markup | HTML5 | Maximum compatibility |
| Styling | Tailwind CSS v4 (CDN) | Utility-first, no build step |
| Logic | Vanilla JS (ES6+ modules) | No framework overhead, simple caching |
| Storage | IndexedDB + localStorage fallback | Robust local persistence |
| Content | Single JSON file | Entire question catalog |
| PWA | manifest.json + Service Worker | Offline capability, install prompt |

No React/Vue/Angular — intentional. Framework overhead hurts offline performance
and adds unnecessary complexity for this app size.

## Architecture

### File Structure

```
├── index.html              # SPA shell
├── css/app.css             # Custom styles (minimal)
├── js/
│   ├── app.js              # Entry point, bootstraps app
│   ├── router.js           # Hash-based SPA router
│   ├── storage.js          # IndexedDB + localStorage abstraction
│   ├── questions.js        # Question catalog loader/filter
│   ├── screens/            # One module per view
│   │   ├── welcome.js      # Onboarding + life state selection
│   │   ├── examination.js  # Card-based question flow
│   │   ├── summary.js      # Spickzettel (dark mode cheat sheet)
│   │   └── completion.js   # Post-confession + donation hint
│   └── components/
│       └── icons.js        # Inline SVG icon components
├── data/
│   └── questions.json      # Theological question catalog (versioned)
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (cache-first)
├── assets/icons/           # PWA icons (SVG)
└── docs/
    └── PRD.md              # Product Requirements Document
```

### Navigation

Hash-based routing: `#/welcome` → `#/examination` → `#/summary` → `#/completion`

Each screen module exports a single `render(container)` function that:
1. Reads state from storage
2. Renders HTML into the container
3. Attaches event listeners
4. Optionally returns a cleanup function

### Data Flow

1. `app.js` initializes storage + loads question catalog
2. Router dispatches to the correct screen based on URL hash
3. Screens read/write state via the storage module
4. Session data auto-wipes after 24 hours
5. "Panic Button" clears ALL local data instantly

### Storage Keys

| Key | Type | Scope | Description |
|-----|------|-------|-------------|
| `lifeState` | string | persistent | Selected life state |
| `answers` | object | session | Map of questionId → 'yes' \| 'unsure' |
| `currentIndex` | number | session | Current question position |
| `sessionTimestamp` | number | session | For auto-wipe calculation |

Session = cleared by auto-wipe (24h) or panic button.
Persistent = only cleared by panic button.

## Coding Conventions

### JavaScript

- ES6+ modules with native `import`/`export`
- Prefer functions and closures over classes (exception: `StorageManager`)
- `const` by default, `let` when reassignment needed, never `var`
- Template literals for HTML generation
- Early returns for guard clauses
- JSDoc comments for exported functions
- No semicolons (standardjs style) — actually, USE semicolons consistently

### CSS / Tailwind

- Tailwind utility classes for all styling
- Custom CSS only for animations and scrollbar styling (`css/app.css`)
- No inline `style` attributes in JS-generated HTML
- Dark mode on summary screen via class-based dark background

### HTML / Accessibility

- Semantic elements: `<main>`, `<section>`, `<header>`, `<footer>`, `<button>`
- ARIA labels on icon-only buttons
- Minimum touch target: 44×44px (Tailwind `p-3` or `py-4`)
- All interactive elements keyboard-accessible
- Focus-visible styles for keyboard navigation
- Color contrast: WCAG AA minimum

## Privacy Guarantee (Non-Negotiable)

- ZERO server calls for user data
- No analytics, tracking pixels, cookies, or fingerprinting
- Only external resource: Tailwind CSS CDN (cached by Service Worker)
- All user data in IndexedDB/localStorage only
- Open source on GitHub

## Running Locally

```sh
# Any static file server:
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:8000` (or whichever port).

## Deployment

Target: Cloudflare Pages (free tier)

1. Push to GitHub
2. Connect Cloudflare Pages to the repository
3. Build command: (none — no build step)
4. Output directory: `/` (root)

## Question Catalog

The catalog (`data/questions.json`) is versioned independently from the app.
It must be reviewed by a theologically trained priest before production launch.

See `docs/PRD.md` section 7 for the full catalog specification.

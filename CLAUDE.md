# beichtbar — Beicht-Helfer PWA

## Overview

Progressive Web App for Catholic examination of conscience (Gewissenserforschung).
Privacy-first, offline-capable, zero server communication for user data.

**UI language**: German
**Code language**: English (variables, comments, documentation, commits)

## Tech Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Markup | HTML5 | Maximum compatibility |
| Styling | Tailwind CSS v4 (local build) | Utility-first, compiled via @tailwindcss/cli |
| Logic | Vanilla JS (ES6+ modules) | No framework overhead, simple caching |
| Storage | IndexedDB + localStorage fallback | Robust local persistence |
| Content | Single JSON file | Entire question catalog |
| PWA | manifest.json + Service Worker | Offline capability, install prompt |
| Build | Node.js + esbuild + @tailwindcss/cli | CSS compilation + JS bundling |

No React/Vue/Angular — intentional. Framework overhead hurts offline performance
and adds unnecessary complexity for this app size.

## Build System

```sh
# Install dependencies
npm install

# Development build (with watch)
npm run dev

# Production build
npm run build
```

Build outputs go to `dist/` directory:
- `dist/css/app.css` — compiled Tailwind CSS
- `dist/js/app.js` — bundled JavaScript

The `index.html` references these compiled files from `dist/`.
Source CSS is in `css/app.css`, source JS entry point is `js/app.js`.

## Architecture

### File Structure

```
├── index.html              # SPA shell
├── css/app.css             # Source CSS (Tailwind directives + custom styles)
├── js/
│   ├── app.js              # Entry point, bootstraps app
│   ├── router.js           # Hash-based SPA router
│   ├── storage.js          # IndexedDB + localStorage abstraction
│   ├── questions.js        # Question catalog loader/filter
│   ├── pin.js              # PIN hashing, verification, numpad utilities
│   ├── utils.js            # Shared utilities (escapeHtml)
│   ├── screens/            # One module per view
│   │   ├── welcome.js      # Onboarding + life state selection + PIN icon
│   │   ├── preparation.js  # Opening prayer before examination
│   │   ├── examination.js  # Card-based question flow
│   │   ├── summary.js      # Spickzettel (dark mode cheat sheet)
│   │   ├── completion.js   # Post-confession + donation hint
│   │   ├── faq.js          # FAQ about confession
│   │   ├── impressum.js    # Legal notice
│   │   ├── datenschutz.js  # Privacy policy
│   │   ├── pin-setup.js    # PIN set/change/remove
│   │   └── pin-lock.js     # Blocking lock screen on app startup
│   └── components/
│       ├── icons.js            # Inline SVG icon components
│       ├── header-actions.js   # Shared Home + Lock header buttons
│       └── footer.js           # Shared footer (Impressum, Datenschutz, FaithOS)
├── data/
│   └── questions.json      # Theological question catalog (versioned)
├── dist/                   # Build output (gitignored)
│   ├── css/app.css
│   └── js/app.js
├── scripts/
│   └── build.js            # Build script (Tailwind + esbuild)
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (cache-first)
├── assets/icons/           # PWA icons (SVG + PNG)
└── docs/
    └── PRD.md              # Product Requirements Document
```

### Navigation

Hash-based routing: `#/welcome` → `#/preparation` → `#/examination` → `#/summary` → `#/completion`

Additional routes: `#/faq`, `#/impressum`, `#/datenschutz`, `#/pin-setup`

Each screen module exports a single `render(container)` function that:
1. Reads state from storage
2. Renders HTML into the container
3. Attaches event listeners
4. Optionally returns a cleanup function

### Data Flow

1. `app.js` initializes storage + loads question catalog in parallel
2. If PIN is set, shows blocking lock screen before router starts
3. Router dispatches to the correct screen based on URL hash
4. Screens read/write state via the storage module
5. "Panic Button" clears ALL local data instantly (including PIN)

### Storage Keys

| Key | Type | Scope | Description |
|-----|------|-------|-------------|
| `lifeState` | string | persistent | Selected life state |
| `answers` | object | session | Map of questionId → 'yes' \| 'unsure' |
| `currentIndex` | number | session | Current question position |
| `sessionTimestamp` | number | session | When session was started |
| `notes` | string | session | Free-text personal notes for confession |
| `pinHash` | string | persistent | SHA-256 hash of PIN (cleared with all data) |

Session = cleared by panic button or explicit user action (e.g. life state change).
Persistent = only cleared by panic button.

### PIN Protection

- Optional 4-digit PIN with SHA-256 hashing (salt: `beichtbar_`)
- Lock screen blocks app on startup when PIN is set
- 30-second cooldown after 3 failed attempts
- PIN is cleared when data is deleted (panic button) — by design
- Shared utilities in `js/pin.js`: hashPin, verifyPin, numpad UI

## Pre-Commit QA Checklist (Mandatory)

Before every commit, run these checks. **Do not skip any.**

1. **Validate JSON**: `python3 -c "import json; json.load(open('data/questions.json')); print('OK')"`
   - The question catalog is fetched at runtime — a single invalid character breaks the entire app
   - Watch out for German quotation marks „ " — the closing `"` (U+201C) looks like ASCII `"` (U+0022) and will break JSON. Use `\u201E` and `\u201C` escapes inside JSON strings.
2. **Build**: `npm run build` — must complete without errors
3. **Verify bundle size**: Check that JS/CSS sizes are reasonable (no accidental bloat)

### Common Pitfalls

- **German quotes in JSON**: `„` (U+201E) and `"` (U+201C) must be escaped as `\u201E` / `\u201C` in JSON string values. Editors sometimes auto-correct these to ASCII `"` which silently breaks JSON.
- **HTML in JSON explanation fields**: The `explanation` field in questions.json is rendered as text, not HTML. Don't use HTML tags there.
- **Template literal quotes**: When writing HTML in JS template literals, use single quotes for attributes (`class='...'`) or escape properly.

## Coding Conventions

### JavaScript

- ES6+ modules with native `import`/`export`
- Prefer functions and closures over classes (exception: `StorageManager`)
- `const` by default, `let` when reassignment needed, never `var`
- Template literals for HTML generation
- Early returns for guard clauses
- JSDoc comments for exported functions
- Use semicolons consistently

### CSS / Tailwind

- Tailwind utility classes for all styling
- Custom CSS only for animations and scrollbar styling (`css/app.css`)
- No inline `style` attributes in JS-generated HTML (exception: dynamic widths like progress bars)
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
- All assets served locally (no external CDN dependencies)
- All user data in IndexedDB/localStorage only
- Open source on GitHub

## Running Locally

```sh
npm install
npm run dev
# Open http://localhost:8000
```

## Deployment

Target: Cloudflare Pages (free tier)

1. Push to GitHub
2. Connect Cloudflare Pages to the repository
3. Build command: `npm run build`
4. Output directory: `/` (root — index.html references dist/ for compiled assets)

## Question Catalog

The catalog (`data/questions.json`) is versioned independently from the app.
All questions are phrased so that "Ja, trifft zu" consistently means "this is something to confess."
It must be reviewed by a theologically trained priest before production launch.

Each question has a `confessionText` field — a first-person declarative statement shown on the
Spickzettel (summary screen) instead of the question form. Rules for `confessionText`:
- **Always use past tense (Vergangenheitsform)** — confession looks back at past actions
- Perfekt for actions: "Ich habe gelogen", "Ich habe gestohlen"
- Präteritum for states: "Ich war neidisch", "Ich war überheblich"
- Never present tense: ~~"Ich lüge"~~, ~~"Ich bin neidisch"~~

See `docs/PRD.md` section 7 for the full catalog specification.

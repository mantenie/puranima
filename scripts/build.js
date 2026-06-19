/**
 * Build script — compiles CSS (Tailwind), bundles JS (esbuild), copies static assets,
 * generates public HTML pages for SEO, and creates the service worker.
 * Usage:
 *   node scripts/build.js          # Production build (minified)
 *   node scripts/build.js --watch  # Dev mode (watch + rebuild)
 */

import { execSync, spawn } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

const isWatch = process.argv.includes('--watch');

const BASE_URL = 'https://beichtbar.de';

// --- Helpers ---

function clean() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });
}

function copyStatic() {
  // Directories to copy as-is
  const dirs = ['data', 'assets'];
  for (const dir of dirs) {
    const src = resolve(ROOT, dir);
    if (existsSync(src)) {
      cpSync(src, resolve(DIST, dir), { recursive: true });
    }
  }

  // Individual files
  const files = ['manifest.json', 'robots.txt', 'sitemap.xml', '_redirects'];
  for (const file of files) {
    const src = resolve(ROOT, file);
    if (existsSync(src)) {
      cpSync(src, resolve(DIST, file));
    }
  }

  // Copy and process index.html (already updated to use compiled CSS)
  cpSync(resolve(ROOT, 'index.html'), resolve(DIST, 'index.html'));
}

// --- Public page generation for SEO ---

/**
 * Escape HTML special characters.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Generate a full HTML page for a public route.
 * Clones the index.html structure with page-specific meta tags, content, and optional JSON-LD.
 */
function generatePageHtml({ title, description, path, content, jsonLd }) {
  const url = `${BASE_URL}${path}`;
  const ogImage = `${BASE_URL}/assets/og-image.png`;

  // Read the index.html to get splash screen links and other shared head content
  const indexHtml = readFileSync(resolve(ROOT, 'index.html'), 'utf-8');

  // Extract iOS splash screen links
  const splashLinks = indexHtml.match(/<link rel="apple-touch-startup-image"[^>]+>/g) || [];

  const jsonLdBlock = jsonLd
    ? `\n  <script type="application/ld+json">\n  ${JSON.stringify(jsonLd, null, 2).split('\n').join('\n  ')}\n  </script>`
    : '';

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="Gewissenserforschung, Beichte, Beichtspiegel, Beichte vorbereiten, Beicht-App, katholisch, Beichtexamen, Reue, Sakrament, Buße">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#6b21a8">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">

  <title>${escapeHtml(title)}</title>

  <!-- Canonical -->
  <link rel="canonical" href="${url}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:locale" content="de_DE">
  <meta property="og:site_name" content="beichtbar">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImage}">

  <link rel="manifest" href="/manifest.json">
  <link rel="icon" type="image/svg+xml" href="/assets/icons/icon.svg">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">

  <!-- iOS Splash Screens -->
  ${splashLinks.join('\n  ')}

  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "beichtbar",
    "url": "${BASE_URL}/",
    "description": "Kostenlose Beicht-App für Katholiken. Geführte Gewissenserforschung mit Beichtspiegel — 100 % privat und offline.",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "inLanguage": "de",
    "author": {
      "@type": "Organization",
      "name": "FaithOS",
      "url": "https://faithos.de"
    }
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Startseite",
        "item": "${BASE_URL}/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "${escapeHtml(title.replace(/ — beichtbar$/, '').replace(/^.*\\| /, ''))}",
        "item": "${url}"
      }
    ]
  }
  </script>${jsonLdBlock}

  <!-- Compiled Tailwind CSS + custom styles (built via @tailwindcss/cli) -->
  <link rel="stylesheet" href="/css/app.css">
</head>
<body class="bg-purple-50/30 text-stone-800 min-h-screen font-sans antialiased">
  <div id="app" class="max-w-lg mx-auto min-h-screen">${content}</div>
  <script type="module" src="/js/app.js"></script>

  <!-- FaithOS Simon Widget (Spenden, Infos, Feedback) -->
  <script src="https://simon.faithos.de/simon-widget.min.js"></script>
  <simon-widget project-name="beichtbar"></simon-widget>
</body>
</html>
`;
}

function generatePublicPages() {
  // --- FAQ page ---
  const faqData = JSON.parse(readFileSync(resolve(ROOT, 'data/faq.json'), 'utf-8'));

  const faqContent = `
    <div class="min-h-screen flex flex-col px-5 py-6">
      <header class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <a href="/" class="p-2 -ml-2 text-stone-400 hover:text-stone-600" aria-label="Zurück">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </a>
          <h1 class="text-xl font-bold text-stone-800">Rund um die Beichte</h1>
        </div>
      </header>

      <p class="text-stone-600 text-sm mb-6 leading-relaxed">
        Alles, was Du über die Beichte wissen musst — ehrlich, praktisch und ohne Angst.
      </p>

      <main class="space-y-3">
        ${faqData.map(item => `
          <details class="group bg-white rounded-xl border border-stone-200 overflow-hidden">
            <summary class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors">
              <span class="font-medium text-stone-800 text-sm pr-4">${escapeHtml(item.question)}</span>
              <span class="text-stone-400 shrink-0 transition-transform group-open:rotate-180">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </span>
            </summary>
            <div class="px-4 pb-4 pt-1">
              <p class="text-sm text-stone-600 leading-relaxed whitespace-pre-line">${escapeHtml(item.answer)}</p>
            </div>
          </details>
        `).join('')}
      </main>

      <footer class="mt-8 pt-4 border-t border-stone-200 text-center">
        <a href="/" class="block w-full py-3 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800 active:bg-purple-900 transition-colors text-center">
          Gewissenserforschung starten
        </a>
      </footer>

      <nav class="flex items-center justify-center gap-4 pt-4 pb-2 text-xs text-stone-400">
        <a href="/impressum" class="hover:text-stone-600 transition-colors">Impressum</a>
        <span class="text-stone-300">&middot;</span>
        <a href="/datenschutz" class="hover:text-stone-600 transition-colors">Datenschutz</a>
        <span class="text-stone-300">&middot;</span>
        <a href="https://faithos.de" target="_blank" rel="noopener" class="hover:text-stone-600 transition-colors">FaithOS</a>
      </nav>
    </div>`;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqData.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer,
      },
    })),
  };

  const faqDir = resolve(DIST, 'faq');
  mkdirSync(faqDir, { recursive: true });
  writeFileSync(resolve(faqDir, 'index.html'), generatePageHtml({
    title: 'Häufige Fragen zur Beichte & Gewissenserforschung | beichtbar',
    description: 'Antworten auf die häufigsten Fragen: Wie bereite ich mich auf die Beichte vor? Was ist ein Beichtspiegel? Was soll ich beichten?',
    path: '/faq',
    content: faqContent,
    jsonLd: faqJsonLd,
  }));

  // --- Impressum page ---
  const impressumContent = `
    <div class="min-h-screen flex flex-col px-5 py-6">
      <header class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <a href="/" class="p-2 -ml-2 text-stone-400 hover:text-stone-600" aria-label="Zurück">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </a>
          <h1 class="text-xl font-bold text-stone-800">Impressum</h1>
        </div>
      </header>

      <main class="prose prose-stone prose-sm max-w-none space-y-6">
        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Angaben gemäß § 5 TMG</h2>
          <p class="text-stone-700 leading-relaxed">
            Stefan Verhey<br>
            Korbinianstr. 5 a<br>
            80807 München
          </p>
        </section>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Kontakt</h2>
          <p class="text-stone-700 leading-relaxed">
            Telefon: 089 24881108<br>
            E-Mail: <a href="mailto:stefan@faithos.de" class="text-purple-700 underline">stefan@faithos.de</a>
          </p>
        </section>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Inhaltlich verantwortlich gem. § 18 Abs. 1 MStV</h2>
          <p class="text-stone-700 leading-relaxed">Stefan Verhey</p>
        </section>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Haftung für Inhalte</h2>
          <p class="text-stone-600 text-sm leading-relaxed">
            Die Inhalte dieser App wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            Die theologischen Inhalte basieren auf anerkannten katholischen Quellen, ersetzen
            jedoch nicht die persönliche geistliche Begleitung.
          </p>
        </section>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Streitschlichtung</h2>
          <p class="text-stone-600 text-sm leading-relaxed">
            Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren
            vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <div class="pt-4 border-t border-stone-200">
          <p class="text-stone-400 text-xs">
            beichtbar ist ein
            <a href="https://faithos.de" target="_blank" rel="noopener" class="text-purple-700 underline">FaithOS</a>-Projekt.<br>
            © ${new Date().getFullYear()} FaithOS. Alle Rechte vorbehalten.
          </p>
        </div>
      </main>

      <nav class="flex items-center justify-center gap-4 pt-4 pb-2 text-xs text-stone-400">
        <a href="/impressum" class="hover:text-stone-600 transition-colors">Impressum</a>
        <span class="text-stone-300">&middot;</span>
        <a href="/datenschutz" class="hover:text-stone-600 transition-colors">Datenschutz</a>
        <span class="text-stone-300">&middot;</span>
        <a href="https://faithos.de" target="_blank" rel="noopener" class="hover:text-stone-600 transition-colors">FaithOS</a>
      </nav>
    </div>`;

  const impressumDir = resolve(DIST, 'impressum');
  mkdirSync(impressumDir, { recursive: true });
  writeFileSync(resolve(impressumDir, 'index.html'), generatePageHtml({
    title: 'Impressum — beichtbar',
    description: 'Impressum und Anbieterkennzeichnung für beichtbar, die kostenlose katholische Beicht-App von FaithOS.',
    path: '/impressum',
    content: impressumContent,
  }));

  // --- Datenschutz page ---
  const datenschutzContent = `
    <div class="min-h-screen flex flex-col px-5 py-6">
      <header class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <a href="/" class="p-2 -ml-2 text-stone-400 hover:text-stone-600" aria-label="Zurück">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </a>
          <h1 class="text-xl font-bold text-stone-800">Datenschutz</h1>
        </div>
      </header>

      <main class="space-y-6">
        <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <p class="text-sm text-emerald-800 font-medium">
            beichtbar erhebt, speichert und überträgt keinerlei personenbezogene Daten.
            Alles bleibt auf Deinem Gerät.
          </p>
        </div>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Verantwortlicher</h2>
          <p class="text-stone-700 text-sm leading-relaxed">
            Stefan Verhey, Korbinianstr. 5 a, 80807 München<br>
            E-Mail: <a href="mailto:stefan@faithos.de" class="text-purple-700 underline">stefan@faithos.de</a>
          </p>
        </section>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Grundsatz: Privacy by Design</h2>
          <p class="text-stone-600 text-sm leading-relaxed">
            beichtbar wurde von Grund auf so entwickelt, dass keine Nutzerdaten den Browser verlassen.
            Es gibt keinen Server, der Deine Eingaben empfängt, keine Datenbank, kein Analytics,
            kein Tracking und keine Cookies.
          </p>
        </section>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Lokale Datenspeicherung</h2>
          <p class="text-stone-600 text-sm leading-relaxed">
            Deine Antworten und der gewählte Lebensstand werden ausschließlich in der IndexedDB
            Deines Browsers gespeichert. Diese Daten verlassen Dein Gerät nie. Du kannst sie
            jederzeit über den „Alles löschen"-Button vollständig entfernen. Zusätzlich werden
            Session-Daten automatisch nach 24 Stunden gelöscht.
          </p>
        </section>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Hosting</h2>
          <p class="text-stone-600 text-sm leading-relaxed">
            Die App wird über Cloudflare Pages ausgeliefert. Beim Aufruf der Seite werden technisch
            notwendige Verbindungsdaten (z.B. IP-Adresse) von Cloudflare verarbeitet, um die Seite
            auszuliefern. Wir haben keinen Zugriff auf diese Daten und erheben keine eigenen
            Statistiken. Cloudflare verarbeitet diese Daten gemäß der eigenen
            <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener" class="text-purple-700 underline">Datenschutzerklärung</a>.
          </p>
        </section>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Simon-Widget</h2>
          <p class="text-stone-600 text-sm leading-relaxed">
            Für Spenden, Feedback und Projektinformationen wird das Simon-Widget von
            <a href="https://faithos.de" target="_blank" rel="noopener" class="text-purple-700 underline">FaithOS</a>
            eingebunden (simon.faithos.de). Dieses Widget wird ebenfalls über Cloudflare ausgeliefert.
            Es werden keine personenbezogenen Daten erhoben oder an Dritte weitergegeben.
          </p>
        </section>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Keine externen Dienste</h2>
          <p class="text-stone-600 text-sm leading-relaxed">
            beichtbar lädt keine externen Schriftarten, keine Analyse-Tools, keine Werbung
            und keine Social-Media-Plugins. Die gesamte App (einschließlich des CSS-Frameworks)
            wird lokal ausgeliefert und funktioniert nach dem ersten Laden vollständig offline.
          </p>
        </section>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Deine Rechte</h2>
          <p class="text-stone-600 text-sm leading-relaxed">
            Da wir keine personenbezogenen Daten erheben, gibt es keine Daten, auf die sich
            Auskunfts-, Berichtigungs- oder Löschungsansprüche beziehen könnten.
            Solltest Du dennoch Fragen haben, kannst Du Dich jederzeit an uns wenden:
            <a href="mailto:stefan@faithos.de" class="text-purple-700 underline">stefan@faithos.de</a>.
          </p>
        </section>

        <div class="pt-4 border-t border-stone-200">
          <p class="text-stone-400 text-xs">Stand: März 2026</p>
        </div>
      </main>

      <nav class="flex items-center justify-center gap-4 pt-4 pb-2 text-xs text-stone-400">
        <a href="/impressum" class="hover:text-stone-600 transition-colors">Impressum</a>
        <span class="text-stone-300">&middot;</span>
        <a href="/datenschutz" class="hover:text-stone-600 transition-colors">Datenschutz</a>
        <span class="text-stone-300">&middot;</span>
        <a href="https://faithos.de" target="_blank" rel="noopener" class="hover:text-stone-600 transition-colors">FaithOS</a>
      </nav>
    </div>`;

  const datenschutzDir = resolve(DIST, 'datenschutz');
  mkdirSync(datenschutzDir, { recursive: true });
  writeFileSync(resolve(datenschutzDir, 'index.html'), generatePageHtml({
    title: 'Datenschutzerklärung — beichtbar',
    description: 'Datenschutzerklärung für beichtbar. Keine Datenerhebung, kein Tracking, keine Cookies. Alle Daten bleiben auf Deinem Gerät.',
    path: '/datenschutz',
    content: datenschutzContent,
  }));

  console.log('   Generated: faq/index.html, impressum/index.html, datenschutz/index.html');
}

function generateServiceWorker() {
  const version = `beichtbar-${Date.now()}`;

  // Collect splash screen files
  const splashDir = resolve(ROOT, 'assets', 'splash');
  const splashFiles = existsSync(splashDir)
    ? readdirSync(splashDir).filter(f => f.endsWith('.png')).map(f => `/assets/splash/${f}`)
    : [];

  const assets = [
    '/',
    '/index.html',
    '/faq',
    '/impressum',
    '/datenschutz',
    '/css/app.css',
    '/js/app.js',
    '/data/questions.json',
    '/data/faq.json',
    '/manifest.json',
    '/assets/icons/icon.svg',
    '/assets/icons/apple-touch-icon.png',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png',
    ...splashFiles,
  ];

  const sw = `/**
 * Service Worker — cache-first strategy for full offline capability.
 * Auto-generated by build script.
 */

const CACHE_NAME = '${version}';

const ASSETS_TO_CACHE = ${JSON.stringify(assets, null, 2)};

// Allow the active tab to trigger immediate activation of a waiting SW
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// Install: pre-cache all local assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first, fall back to network
self.addEventListener('fetch', (event) => {
  // Don't cache external requests (Simon widget etc.)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(response => {
          if (!response || response.status !== 200) return response;

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return response;
        });
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          // Try to serve the specific page, fall back to index.html
          return caches.match(event.request.url) || caches.match('/index.html');
        }
      })
  );
});
`;

  writeFileSync(resolve(DIST, 'sw.js'), sw);
  // Also write to root so it's served correctly (Cloudflare serves from root)
  writeFileSync(resolve(ROOT, 'sw.js'), sw);
}

function buildCSS() {
  const input = resolve(ROOT, 'css/app.css');
  const output = resolve(DIST, 'css/app.css');
  mkdirSync(dirname(output), { recursive: true });

  const minifyFlag = isWatch ? '' : '--minify';
  execSync(
    `npx @tailwindcss/cli -i "${input}" -o "${output}" ${minifyFlag}`.trim(),
    { cwd: ROOT, stdio: 'inherit' }
  );
}

function buildJS() {
  const entry = resolve(ROOT, 'js/app.js');
  const outfile = resolve(DIST, 'js/app.js');
  mkdirSync(dirname(outfile), { recursive: true });

  const flags = [
    `--bundle`,
    `--format=esm`,
    `--outfile="${outfile}"`,
    `--target=es2020`,
  ];

  if (!isWatch) {
    flags.push('--minify');
  }

  execSync(
    `npx esbuild "${entry}" ${flags.join(' ')}`,
    { cwd: ROOT, stdio: 'inherit' }
  );
}

// --- Watch mode ---

function watchMode() {
  console.log('\n🔄 Watch mode — rebuilding on changes...\n');

  // Tailwind CSS watch (runs in background)
  const cssInput = resolve(ROOT, 'css/app.css');
  const cssOutput = resolve(DIST, 'css/app.css');
  mkdirSync(dirname(cssOutput), { recursive: true });

  const tailwind = spawn(
    'npx',
    ['@tailwindcss/cli', '-i', cssInput, '-o', cssOutput, '--watch'],
    { cwd: ROOT, stdio: 'inherit', shell: true }
  );

  // esbuild watch (runs in background)
  const jsEntry = resolve(ROOT, 'js/app.js');
  const jsOut = resolve(DIST, 'js/app.js');
  mkdirSync(dirname(jsOut), { recursive: true });

  const esbuild = spawn(
    'npx',
    ['esbuild', jsEntry, '--bundle', '--format=esm', `--outfile=${jsOut}`, '--target=es2020', '--watch'],
    { cwd: ROOT, stdio: 'inherit', shell: true }
  );

  // Handle termination
  process.on('SIGINT', () => {
    tailwind.kill();
    esbuild.kill();
    process.exit(0);
  });
}

// --- Main ---

console.log(isWatch ? '🔧 Building (dev)...' : '📦 Building (production)...');

clean();
copyStatic();
buildCSS();
buildJS();
generatePublicPages();
generateServiceWorker();

if (isWatch) {
  watchMode();
} else {
  // Report output size
  const cssSize = readFileSync(resolve(DIST, 'css/app.css')).length;
  const jsSize = readFileSync(resolve(DIST, 'js/app.js')).length;
  console.log(`\n✅ Build complete → dist/`);
  console.log(`   CSS: ${(cssSize / 1024).toFixed(1)} KB`);
  console.log(`   JS:  ${(jsSize / 1024).toFixed(1)} KB`);
}

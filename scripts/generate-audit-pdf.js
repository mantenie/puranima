/**
 * Audit-PDF Generator — creates a formatted PDF of the question catalog
 * for theological review by a priest.
 *
 * Usage:
 *   node scripts/generate-audit-pdf.js --initial          # All questions marked as new (first review)
 *   node scripts/generate-audit-pdf.js                    # Diff against HEAD~1
 *   node scripts/generate-audit-pdf.js --baseline v1.0.0  # Diff against tag/commit
 */

import PdfPrinter from 'pdfmake';
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// --- Colors ---

const C = {
  primary:  '#1e3a5f',
  accent:   '#8b5e3c',
  added:    '#16a34a',
  removed:  '#dc2626',
  changed:  '#d97706',
  schwer:   '#dc2626',
  muted:    '#6b7280',
  tableBg:  '#f3f4f6',
  addedBg:  '#f0fdf4',
  removedBg:'#fef2f2',
  changedBg:'#fffbeb',
};

// --- Font setup ---

function loadVfsFonts() {
  // pdfmake ships base64-encoded Roboto fonts in vfs_fonts.js (CJS module)
  const require = createRequire(import.meta.url);
  const vfsModule = require('pdfmake/build/vfs_fonts.js');
  const vfs = vfsModule.pdfMake?.vfs || vfsModule.vfs || vfsModule;
  return vfs;
}

function createPrinter() {
  const vfs = loadVfsFonts();

  // Convert base64 VFS entries to Buffers
  const toBuffer = (name) => Buffer.from(vfs[name], 'base64');

  const fonts = {
    Roboto: {
      normal:      toBuffer('Roboto-Regular.ttf'),
      bold:        toBuffer('Roboto-Medium.ttf'),
      italics:     toBuffer('Roboto-Italic.ttf'),
      bolditalics: toBuffer('Roboto-MediumItalic.ttf'),
    }
  };
  return new PdfPrinter(fonts);
}

// --- Data loading ---

function loadCurrentCatalog() {
  const raw = readFileSync(resolve(ROOT, 'data/questions.json'), 'utf-8');
  return JSON.parse(raw);
}

function loadBaselineCatalog(ref) {
  try {
    const raw = execSync(`git show ${ref}:data/questions.json`, {
      encoding: 'utf-8',
      cwd: ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return JSON.parse(raw);
  } catch {
    console.warn(`  Warnung: Baseline '${ref}' nicht ladbar. Changelog wird leer.`);
    return null;
  }
}

// --- CLI args ---

function parseArgs() {
  const args = process.argv.slice(2);
  let baseline = 'HEAD~1';
  let initial = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--baseline' && args[i + 1]) {
      baseline = args[i + 1];
    }
    if (args[i] === '--initial') {
      initial = true;
    }
  }
  return { baseline, initial };
}

// --- Changelog computation ---

const COMPARE_FIELDS = [
  'question', 'explanation', 'severity', 'source',
  'category', 'subcategory', 'confessionText',
];

function computeChangelog(current, baseline, initial = false) {
  if (initial) return { added: current.questions, removed: [], changed: [] };
  if (!baseline) return { added: [], removed: [], changed: [] };

  const currMap = new Map(current.questions.map(q => [q.id, q]));
  const prevMap = new Map(baseline.questions.map(q => [q.id, q]));

  const added = [];
  const removed = [];
  const changed = [];

  for (const [id, q] of currMap) {
    if (!prevMap.has(id)) added.push(q);
  }

  for (const [id, q] of prevMap) {
    if (!currMap.has(id)) removed.push(q);
  }

  for (const [id, curr] of currMap) {
    const prev = prevMap.get(id);
    if (!prev) continue;

    const diffs = [];
    for (const field of COMPARE_FIELDS) {
      if (curr[field] !== prev[field]) {
        diffs.push({ field, old: prev[field], new: curr[field] });
      }
    }
    if (JSON.stringify(curr.tags) !== JSON.stringify(prev.tags)) {
      diffs.push({ field: 'tags', old: prev.tags.join(', '), new: curr.tags.join(', ') });
    }
    if (diffs.length > 0) {
      changed.push({ id, question: curr.question, diffs });
    }
  }

  return { added, removed, changed };
}

// --- Readable labels ---

const FIELD_LABELS = {
  question: 'Frage',
  explanation: 'Erklärung',
  severity: 'Schweregrad',
  source: 'Quelle',
  category: 'Kategorie',
  subcategory: 'Unterkategorie',
  confessionText: 'Beichttext',
  tags: 'Lebensstand',
};

const SOURCE_LABELS = {
  wallner: 'Wallner (Heiligenkreuz)',
  ramm: 'Ramm FSSP',
  youcat: 'YOUCAT',
  'priester-beichtspiegel': 'Priester-Beichtspiegel',
  eigen: 'Eigene Formulierung',
};

const SEVERITY_LABELS = {
  normal: 'Normal',
  schwer: 'Schwere Sünde',
};

const LIFESTATE_LABELS = {
  allgemein: 'Allgemein',
  single: 'Single',
  verheiratet: 'Verheiratet',
  jugendlich: 'Jugendlich',
  kinder: 'Kinder',
  priester: 'Priester/Ordensleute',
};

// --- Document sections ---

function buildTitlePage(meta) {
  return [
    { text: '\n\n\n\n', fontSize: 30 },
    { text: 'Puranima', style: 'title' },
    { text: 'Fragenkatalog zur Gewissenserforschung', style: 'subtitle' },
    { text: 'Theologisches Audit-Dokument', style: 'subtitle', fontSize: 11, margin: [0, 5, 0, 0] },
    { text: '\n\n' },
    {
      table: {
        widths: [100, '*'],
        body: [
          [{ text: 'Version:', bold: true }, meta.version],
          [{ text: 'Datum:', bold: true }, meta.date],
          [{ text: 'Status:', bold: true }, { text: meta.status, color: C.changed, bold: true }],
        ]
      },
      layout: 'noBorders',
      margin: [60, 0, 60, 20],
    },
    { text: 'Quellen', style: 'h3', margin: [60, 10, 60, 5] },
    {
      ol: meta.sources.map(s => ({ text: s, fontSize: 9, color: C.muted })),
      margin: [60, 0, 60, 0],
    },
    { text: '', pageBreak: 'after' },
  ];
}

function buildStatisticsSection(catalog) {
  const qs = catalog.questions;
  const cats = catalog.meta.categories.sort((a, b) => a.order - b.order);

  // Category stats
  const catCounts = {};
  for (const q of qs) catCounts[q.category] = (catCounts[q.category] || 0) + 1;

  const catBody = [
    tableHeader(['Kategorie', 'Anzahl', 'Anteil']),
  ];
  for (const cat of cats) {
    const count = catCounts[cat.id] || 0;
    catBody.push([
      cat.label,
      { text: String(count), alignment: 'center' },
      { text: `${((count / qs.length) * 100).toFixed(1)}%`, alignment: 'center' },
    ]);
  }

  // Severity stats
  const sevCounts = { normal: 0, schwer: 0 };
  for (const q of qs) sevCounts[q.severity]++;

  const sevBody = [
    tableHeader(['Schweregrad', 'Anzahl', 'Anteil']),
    ['Normal', { text: String(sevCounts.normal), alignment: 'center' }, { text: `${((sevCounts.normal / qs.length) * 100).toFixed(1)}%`, alignment: 'center' }],
    [{ text: 'Schwere Sünde', color: C.schwer, bold: true }, { text: String(sevCounts.schwer), alignment: 'center' }, { text: `${((sevCounts.schwer / qs.length) * 100).toFixed(1)}%`, alignment: 'center' }],
  ];

  // Source stats
  const srcCounts = {};
  for (const q of qs) srcCounts[q.source] = (srcCounts[q.source] || 0) + 1;

  const srcBody = [tableHeader(['Quelle', 'Anzahl'])];
  for (const [src, count] of Object.entries(srcCounts).sort((a, b) => b[1] - a[1])) {
    srcBody.push([SOURCE_LABELS[src] || src, { text: String(count), alignment: 'center' }]);
  }

  // Lifestate stats
  const tagCounts = {};
  for (const q of qs) {
    for (const tag of q.tags) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }

  const tagBody = [tableHeader(['Lebensstand', 'Anzahl'])];
  for (const [tag, count] of Object.entries(tagCounts).sort((a, b) => b[1] - a[1])) {
    tagBody.push([LIFESTATE_LABELS[tag] || tag, { text: String(count), alignment: 'center' }]);
  }

  return [
    { text: 'Statistik', style: 'h1' },
    { text: `Gesamtanzahl Fragen: ${qs.length}`, fontSize: 14, bold: true, margin: [0, 5, 0, 10] },

    { text: 'Verteilung nach Kategorie', style: 'h2' },
    { table: { headerRows: 1, widths: ['*', 50, 50], body: catBody }, layout: 'lightHorizontalLines', margin: [0, 0, 0, 15] },

    { text: 'Verteilung nach Schweregrad', style: 'h2' },
    { table: { headerRows: 1, widths: ['*', 50, 50], body: sevBody }, layout: 'lightHorizontalLines', margin: [0, 0, 0, 15] },

    { text: 'Verteilung nach Quelle', style: 'h2' },
    { table: { headerRows: 1, widths: ['*', 50], body: srcBody }, layout: 'lightHorizontalLines', margin: [0, 0, 0, 15] },

    { text: 'Verteilung nach Lebensstand', style: 'h2' },
    { table: { headerRows: 1, widths: ['*', 50], body: tagBody }, layout: 'lightHorizontalLines', margin: [0, 0, 0, 15] },

    { text: '', pageBreak: 'after' },
  ];
}

function tableHeader(labels) {
  return labels.map(label => ({
    text: label, bold: true, fillColor: C.primary, color: 'white',
    alignment: label === labels[0] ? 'left' : 'center',
  }));
}

function buildChangelogSection(changelog, baselineRef) {
  const { added, removed, changed } = changelog;
  const total = added.length + removed.length + changed.length;

  const isInitial = baselineRef === 'Erstversion';
  const content = [
    { text: isInitial ? 'Alle Fragen (Erstversion)' : 'Changelog', style: 'h1' },
    {
      text: isInitial
        ? 'Vollständiger Katalog — alle Fragen zur theologischen Erstprüfung'
        : `Vergleich gegen: ${baselineRef}`,
      fontSize: 9, color: C.muted, margin: [0, 0, 0, 10],
    },
  ];

  if (total === 0) {
    content.push({ text: 'Keine Änderungen gegenüber der Vergleichsversion.', italics: true, margin: [0, 10, 0, 0] });
    content.push({ text: '', pageBreak: 'after' });
    return content;
  }

  content.push({ text: `${total} Änderung(en) insgesamt`, margin: [0, 0, 0, 10] });

  // Added
  if (added.length > 0) {
    content.push({ text: `Neu hinzugefügt (${added.length})`, style: 'h2', color: C.added });
    for (const q of added) {
      content.push({
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { text: `+ ${q.id}`, bold: true, color: C.added, fontSize: 9 },
              { text: q.question, margin: [0, 2, 0, 0] },
              { text: `Beichttext: ${q.confessionText}`, italics: true, fontSize: 9, margin: [0, 2, 0, 0] },
              { text: `${q.category} / ${q.subcategory} | ${SEVERITY_LABELS[q.severity]} | ${q.tags.join(', ')}`, fontSize: 8, color: C.muted, margin: [0, 2, 0, 0] },
            ],
            fillColor: C.addedBg,
            margin: [5, 5, 5, 5],
          }]],
        },
        layout: 'noBorders',
        margin: [0, 2, 0, 2],
      });
    }
  }

  // Removed
  if (removed.length > 0) {
    content.push({ text: `Entfernt (${removed.length})`, style: 'h2', color: C.removed });
    for (const q of removed) {
      content.push({
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { text: `- ${q.id}`, bold: true, color: C.removed, fontSize: 9 },
              { text: q.question, decoration: 'lineThrough', margin: [0, 2, 0, 0] },
            ],
            fillColor: C.removedBg,
            margin: [5, 5, 5, 5],
          }]],
        },
        layout: 'noBorders',
        margin: [0, 2, 0, 2],
      });
    }
  }

  // Changed
  if (changed.length > 0) {
    content.push({ text: `Geändert (${changed.length})`, style: 'h2', color: C.changed });
    for (const entry of changed) {
      const diffLines = entry.diffs.map(d => ({
        columns: [
          { text: `${FIELD_LABELS[d.field] || d.field}:`, width: 90, fontSize: 8, bold: true },
          {
            stack: [
              { text: String(d.old || '(leer)'), decoration: 'lineThrough', color: C.removed, fontSize: 8 },
              { text: String(d.new || '(leer)'), color: C.added, fontSize: 8, bold: true },
            ]
          },
        ],
        margin: [0, 1, 0, 1],
      }));

      content.push({
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { text: `~ ${entry.id}`, bold: true, color: C.changed, fontSize: 9 },
              { text: entry.question, margin: [0, 2, 0, 4] },
              ...diffLines,
            ],
            fillColor: C.changedBg,
            margin: [5, 5, 5, 5],
          }]],
        },
        layout: 'noBorders',
        margin: [0, 2, 0, 2],
      });
    }
  }

  content.push({ text: '', pageBreak: 'after' });
  return content;
}

function buildPrayersSection(prayers) {
  const content = [{ text: 'Gebete', style: 'h1' }];

  for (const [, prayer] of Object.entries(prayers)) {
    content.push(
      { text: prayer.title, style: 'h2' },
      { text: prayer.text, italics: true, margin: [20, 0, 20, 15] },
    );
  }

  content.push({ text: '', pageBreak: 'after' });
  return content;
}

function buildQuestionsSection(catalog) {
  const { questions, meta } = catalog;
  const cats = meta.categories.sort((a, b) => a.order - b.order);
  const content = [{ text: 'Fragenkatalog', style: 'h1' }];

  let questionNumber = 0;

  for (const cat of cats) {
    const catQuestions = questions.filter(q => q.category === cat.id);
    if (catQuestions.length === 0) continue;

    content.push({ text: `${cat.order}. ${cat.label}`, style: 'h2', margin: [0, 15, 0, 5] });

    // Group by subcategory, preserve order of first appearance
    const subgroups = new Map();
    for (const q of catQuestions) {
      if (!subgroups.has(q.subcategory)) subgroups.set(q.subcategory, []);
      subgroups.get(q.subcategory).push(q);
    }

    for (const [subcat, subQuestions] of subgroups) {
      content.push({ text: subcat, style: 'h3' });

      for (const q of subQuestions) {
        questionNumber++;
        content.push(buildQuestionBlock(q, questionNumber));
      }
    }
  }

  return content;
}

function buildQuestionBlock(q, num) {
  const stack = [];

  // Question header: number + ID + severity badge
  const headerParts = [
    { text: `${num}. `, bold: true, fontSize: 10, color: C.primary },
    { text: q.question, bold: true, fontSize: 10 },
  ];
  if (q.severity === 'schwer') {
    headerParts.push({ text: '  SCHWER', bold: true, fontSize: 7, color: C.schwer });
  }
  stack.push({ text: headerParts });

  // Confession text
  stack.push({
    text: [
      { text: 'Beichttext: ', fontSize: 9, italics: true, color: C.muted },
      { text: q.confessionText, fontSize: 9, italics: true },
    ],
    margin: [15, 2, 0, 0],
  });

  // Explanation (if present)
  if (q.explanation) {
    stack.push({
      text: q.explanation,
      fontSize: 8, color: C.muted,
      margin: [15, 2, 0, 0],
    });
  }

  // Metadata line
  const metaParts = [
    q.id,
    `Tags: ${q.tags.map(t => LIFESTATE_LABELS[t] || t).join(', ')}`,
    `Quelle: ${SOURCE_LABELS[q.source] || q.source}`,
  ];
  stack.push({
    text: metaParts.join(' | '),
    fontSize: 7, color: C.muted,
    margin: [15, 2, 0, 0],
  });

  return {
    stack,
    margin: [0, 4, 0, 8],
  };
}

// --- Document definition ---

function buildDocDefinition(catalog, changelog, baselineRef) {
  const { meta, prayers } = catalog;

  return {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 50],

    header: (currentPage) => {
      if (currentPage === 1) return null;
      return {
        columns: [
          { text: 'Puranima — Fragenkatalog Audit', fontSize: 8, color: C.muted },
          { text: `v${meta.version}`, fontSize: 8, color: C.muted, alignment: 'right' },
        ],
        margin: [40, 20, 40, 0],
      };
    },

    footer: (currentPage, pageCount) => ({
      text: `Seite ${currentPage} von ${pageCount}`,
      alignment: 'center',
      fontSize: 8,
      color: C.muted,
      margin: [0, 15, 0, 0],
    }),

    content: [
      ...buildTitlePage(meta),
      ...buildStatisticsSection(catalog),
      ...buildChangelogSection(changelog, baselineRef),
      ...buildPrayersSection(prayers),
      ...buildQuestionsSection(catalog),
    ],

    styles: {
      title:    { fontSize: 28, bold: true, color: C.primary, alignment: 'center' },
      subtitle: { fontSize: 14, color: C.accent, alignment: 'center', margin: [0, 5, 0, 0] },
      h1:       { fontSize: 18, bold: true, color: C.primary, margin: [0, 15, 0, 10] },
      h2:       { fontSize: 13, bold: true, color: C.accent, margin: [0, 10, 0, 5] },
      h3:       { fontSize: 11, bold: true, color: C.primary, margin: [0, 8, 0, 4] },
    },

    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
    },
  };
}

// --- PDF generation ---

function generatePdf(printer, docDefinition, outputPath) {
  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  return new Promise((resolve, reject) => {
    const chunks = [];
    pdfDoc.on('data', chunk => chunks.push(chunk));
    pdfDoc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      writeFileSync(outputPath, buffer);
      resolve(buffer.length);
    });
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}

// --- Main ---

async function main() {
  const { baseline, initial } = parseArgs();

  console.log('Lade aktuellen Fragenkatalog...');
  const catalog = loadCurrentCatalog();
  console.log(`  ${catalog.questions.length} Fragen geladen (v${catalog.meta.version})`);

  let baselineCatalog = null;
  let changelogLabel;

  if (initial) {
    console.log('Modus: Erstversion — alle Fragen als neu markiert');
    changelogLabel = 'Erstversion';
  } else {
    console.log(`Lade Baseline '${baseline}'...`);
    baselineCatalog = loadBaselineCatalog(baseline);
    changelogLabel = baseline;
  }

  console.log('Berechne Changelog...');
  const changelog = computeChangelog(catalog, baselineCatalog, initial);
  console.log(`  ${changelog.added.length} neu, ${changelog.removed.length} entfernt, ${changelog.changed.length} geändert`);

  console.log('Erstelle PDF...');
  const printer = createPrinter();
  const docDefinition = buildDocDefinition(catalog, changelog, changelogLabel);

  const outputFilename = `puranima-audit-v${catalog.meta.version}-${catalog.meta.date}.pdf`;
  const outputPath = resolve(ROOT, outputFilename);

  const size = await generatePdf(printer, docDefinition, outputPath);
  console.log(`\nPDF erstellt: ${outputFilename} (${(size / 1024).toFixed(1)} KB)`);
}

main().catch(err => {
  console.error('Fehler bei PDF-Generierung:', err);
  process.exit(1);
});

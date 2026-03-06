/**
 * Impressum (legal notice) screen.
 */

import { navigate } from '../router.js';
import { icons } from '../components/icons.js';
import { footerHtml, attachFooterListeners } from '../components/footer.js';
import { headerActionsHtml, attachHeaderActions } from '../components/header-actions.js';

export async function render(container) {
  container.innerHTML = `
    <div class="screen-enter min-h-screen flex flex-col px-5 py-6">

      <header class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <button id="btn-back" class="p-2 -ml-2 text-stone-400 hover:text-stone-600"
                  aria-label="Zurück">
            ${icons.arrowLeft}
          </button>
          <h1 class="text-xl font-bold text-stone-800">Impressum</h1>
        </div>
        ${headerActionsHtml()}
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
            E-Mail: <a href="mailto:stefan@faithos.de" class="text-amber-700 underline">stefan@faithos.de</a>
          </p>
        </section>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
            Inhaltlich verantwortlich gem. § 18 Abs. 1 MStV
          </h2>
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
            <a href="https://faithos.de" target="_blank" rel="noopener" class="text-amber-700 underline">FaithOS</a>-Projekt.<br>
            © ${new Date().getFullYear()} FaithOS. Alle Rechte vorbehalten.
          </p>
        </div>

      </main>

      ${footerHtml()}
    </div>
  `;

  container.querySelector('#btn-back').addEventListener('click', () => navigate('/welcome'));
  attachHeaderActions(container);
  attachFooterListeners(container);
}

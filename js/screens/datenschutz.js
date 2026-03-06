/**
 * Datenschutzerklärung (privacy policy) screen.
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
          <h1 class="text-xl font-bold text-stone-800">Datenschutz</h1>
        </div>
        ${headerActionsHtml()}
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
            E-Mail: <a href="mailto:stefan@faithos.de" class="text-amber-700 underline">stefan@faithos.de</a>
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
            <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener"
               class="text-amber-700 underline">Datenschutzerklärung</a>.
          </p>
        </section>

        <section>
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Simon-Widget</h2>
          <p class="text-stone-600 text-sm leading-relaxed">
            Für Spenden, Feedback und Projektinformationen wird das Simon-Widget von
            <a href="https://faithos.de" target="_blank" rel="noopener" class="text-amber-700 underline">FaithOS</a>
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
            <a href="mailto:stefan@faithos.de" class="text-amber-700 underline">stefan@faithos.de</a>.
          </p>
        </section>

        <div class="pt-4 border-t border-stone-200">
          <p class="text-stone-400 text-xs">Stand: März 2026</p>
        </div>

      </main>

      ${footerHtml()}
    </div>
  `;

  container.querySelector('#btn-back').addEventListener('click', () => navigate('/welcome'));
  attachHeaderActions(container);
  attachFooterListeners(container);
}

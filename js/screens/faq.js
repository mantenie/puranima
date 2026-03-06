/**
 * FAQ screen — important information about confession.
 */

import { navigate } from '../router.js';
import { icons } from '../components/icons.js';
import { footerHtml, attachFooterListeners } from '../components/footer.js';
import { headerActionsHtml, attachHeaderActions } from '../components/header-actions.js';

const FAQ_ITEMS = [
  {
    question: 'Was ist die Beichte?',
    answer: `Die Beichte (Sakrament der Versöhnung) ist eines der sieben Sakramente der katholischen Kirche.
      In ihr bekennt der Gläubige seine Sünden vor einem Priester, empfängt die Lossprechung (Absolution)
      und wird so mit Gott und der Kirche versöhnt. Jesus selbst hat den Aposteln die Vollmacht gegeben,
      Sünden zu vergeben (Joh 20,22–23).`
  },
  {
    question: 'Wer darf beichten?',
    answer: `Jeder getaufte Katholik darf und soll regelmäßig beichten. Ab der Erstkommunion
      (ca. 8–9 Jahre) sind Kinder zur Beichte eingeladen. Es gibt keine Obergrenze —
      auch wer seit Jahren oder Jahrzehnten nicht mehr gebeichtet hat, ist herzlich willkommen.
      Der Priester wird Dir helfen.`
  },
  {
    question: 'Warum soll ich beichten?',
    answer: `Die Beichte ist ein Geschenk, keine Strafe. Sie schenkt:
      inneren Frieden und Entlastung vom Gewissen,
      echte Vergebung durch Gott (nicht nur ein gutes Gefühl),
      die Gnade, es beim nächsten Mal besser zu machen,
      und die Wiederherstellung der vollen Gemeinschaft mit Gott und der Kirche.
      Papst Franziskus sagt: „Gott wird nie müde zu vergeben. Wir sind es, die müde werden, um Vergebung zu bitten."`
  },
  {
    question: 'Wie läuft eine Beichte ab?',
    answer: `1. Vorbereitung: Gewissenserforschung (dabei hilft Dir beichtbar!)
      2. Begrüßung: Du trittst zum Priester und bekreuzigst Dich. „Im Namen des Vaters…"
      3. Eröffnung: „Ich bekenne vor Gott dem Allmächtigen und vor Ihnen, Vater, meine Sünden. Meine letzte Beichte war vor…"
      4. Bekenntnis: Du nennst Deine Sünden — ehrlich, aber ohne Romane. Der Spickzettel hilft!
      5. Gespräch: Der Priester gibt Dir ggf. einen geistlichen Rat.
      6. Reue und Buße: Du betest das Reuegebet, der Priester gibt Dir eine Buße auf.
      7. Lossprechung: Der Priester spricht die Absolution. Deine Sünden sind vergeben!
      8. Dank: Ein kurzes Dankgebet nach der Beichte.`
  },
  {
    question: 'Was muss ich beichten?',
    answer: `Du musst alle schweren Sünden (Todsünden) beichten, die Dir bewusst sind — mit Art und Anzahl.
      Lässliche Sünden müssen nicht gebeichtet werden, es ist aber sehr empfehlenswert.
      Wenn Du unsicher bist, ob etwas eine Sünde ist, sprich es einfach an — der Priester hilft Dir.`
  },
  {
    question: 'Was ist, wenn ich etwas vergessen habe?',
    answer: `Keine Sorge! Wenn Du ehrlich Dein Gewissen erforscht hast und trotzdem etwas vergisst,
      ist es dennoch vergeben. Fällt es Dir später ein, kannst Du es bei der nächsten Beichte nennen.
      Wichtig ist nur, dass Du nichts bewusst verschweigst.`
  },
  {
    question: 'Ich schäme mich zu sehr. Was soll ich tun?',
    answer: `Scham ist ganz normal und sogar ein gutes Zeichen — sie zeigt, dass Dein Gewissen lebendig ist.
      Denk daran: Der Priester hat schon alles gehört. Er wird Dich nicht verurteilen.
      Er ist an das Beichtgeheimnis gebunden — das Strengste Verschwiegenheitsgebot, das es gibt.
      Und: Je größer die Scham, desto größer die Erleichterung danach.`
  },
  {
    question: 'Wie oft soll ich beichten?',
    answer: `Die Kirche empfiehlt die regelmäßige Beichte, mindestens einmal im Jahr (Osterbeichte).
      Viele Gläubige beichten monatlich. Bei schweren Sünden solltest Du möglichst bald beichten,
      bevor Du zur Kommunion gehst. Häufige Beichte ist ein kraftvolles Mittel des geistlichen Wachstums.`
  },
  {
    question: 'Wie hilft mir beichtbar?',
    answer: `beichtbar führt Dich durch eine systematische Gewissenserforschung mit theologisch geprüften Fragen.
      Die Fragen sind nach Lebensstand gefiltert und nach Kategorien geordnet.
      Am Ende erhältst Du einen übersichtlichen Spickzettel im Dark Mode — perfekt für den Beichtstuhl.
      Alles bleibt auf Deinem Gerät. Niemand außer Dir sieht Deine Antworten.`
  },
  {
    question: 'Ist beichtbar ein vollständiger Beichtspiegel?',
    answer: `beichtbar ist ein digitaler Beichtspiegel — eine Hilfe zur Gewissenserforschung. Die Fragen basieren auf bewährten
      katholischen Quellen (u.a. Karl Wallner, Gotteslob, YOUCAT), erheben aber keinen Anspruch auf Vollständigkeit.
      Es gibt verschiedene Beichtspiegel mit unterschiedlichen Schwerpunkten. Je nach Lebenssituation, Beruf oder
      geistlichem Weg kann ein anderer Beichtspiegel besser zu Dir passen.
      beichtbar ersetzt kein Seelsorgegespräch. Wenn Du unsicher bist oder tiefere Fragen hast, sprich mit einem Priester —
      er kann Dir persönlich weiterhelfen. Die App möchte Dir den Einstieg erleichtern, nicht das persönliche Gespräch ersetzen.`
  },
  {
    question: 'Was ist nach der Beichte?',
    answer: `Nach der Absolution sind Deine Sünden vergeben — wirklich und vollständig.
      Du kannst Deinen Spickzettel in beichtbar löschen, denn Jesus hat Deine Sünden vergessen.
      Es gibt eine berühmte Geschichte: Eine Mystikerin betete und sagte zu Jesus: „Herr, ich habe wieder gesündigt."
      Jesus antwortete: „Welche Sünden?" — Er hatte sie nach der Beichte vergessen.
      So radikal ist Gottes Vergebung. Was gebeichtet und losgesprochen ist, existiert nicht mehr.
      Vergib auch Dir selbst — und beginne mit Freude neu.`
  },
  {
    question: 'Wo finde ich Beichtgelegenheiten?',
    answer: `Die meisten Pfarreien bieten feste Beichtzeiten an (oft samstags vor der Vorabendmesse).
      Auf <a href="https://go.source-and-summit.de" target="_blank" rel="noopener" class="text-amber-700 underline underline-offset-2 hover:text-amber-900">Source&nbsp;&&nbsp;Summit</a> findest Du Beichtgelegenheiten, Messen, Anbetung und Rosenkranzgebete in Deiner Nähe — mit Bewertungen und Empfehlungen.
      Im Zweifelsfall ruf einfach im Pfarrbüro an oder sprich den Priester nach der Messe an —
      jeder Priester wird sich freuen, wenn jemand beichten möchte.`
  },
  {
    question: 'Was bedeutet der Name beichtbar?',
    answer: `beichtbar ist ein deutsches Wort — ganz einfach, ganz direkt.
      Es bedeutet: Das Leben ist beichtbar. Jede Schuld, jede Sünde, jede Last kann in die Beichte getragen werden.
      Nichts ist zu groß, zu dunkel oder zu beschämend, um vergeben zu werden.
      beichtbar steht dafür: Du kannst kommen, wie Du bist.`
  }
];

export async function render(container) {
  container.innerHTML = `
    <div class="screen-enter min-h-screen flex flex-col px-5 py-6">

      <header class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <button id="btn-back" class="p-2 -ml-2 text-stone-400 hover:text-stone-600"
                  aria-label="Zurück">
            ${icons.arrowLeft}
          </button>
          <h1 class="text-xl font-bold text-stone-800">Rund um die Beichte</h1>
        </div>
        ${headerActionsHtml()}
      </header>

      <p class="text-stone-600 text-sm mb-6 leading-relaxed">
        Alles, was Du über die Beichte wissen musst — ehrlich, praktisch und ohne Angst.
      </p>

      <main class="space-y-3">
        ${FAQ_ITEMS.map((item, i) => `
          <details class="group bg-white rounded-xl border border-stone-200 overflow-hidden">
            <summary class="flex items-center justify-between px-4 py-3 cursor-pointer
                           hover:bg-stone-50 transition-colors">
              <span class="font-medium text-stone-800 text-sm pr-4">${item.question}</span>
              <span class="text-stone-400 shrink-0 transition-transform group-open:rotate-180">
                ${icons.chevronDown}
              </span>
            </summary>
            <div class="px-4 pb-4 pt-1">
              <p class="text-sm text-stone-600 leading-relaxed whitespace-pre-line">${item.answer.trim()}</p>
            </div>
          </details>
        `).join('')}
      </main>

      <footer class="mt-8 pt-4 border-t border-stone-200 text-center">
        <button id="btn-start-examination"
                class="w-full py-3 rounded-xl bg-amber-700 text-white font-semibold
                       hover:bg-amber-800 active:bg-amber-900 transition-colors">
          Gewissenserforschung starten
        </button>
      </footer>

      ${footerHtml()}

    </div>
  `;

  container.querySelector('#btn-back').addEventListener('click', () => navigate('/welcome'));
  container.querySelector('#btn-start-examination').addEventListener('click', () => navigate('/welcome'));
  attachHeaderActions(container);
  attachFooterListeners(container);
}

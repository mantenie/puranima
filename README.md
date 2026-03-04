# Puranima — Beicht-Helfer PWA

Progressive Web App zur katholischen Gewissenserforschung. Datenschutz-orientiert, offline-fähig, keine Server-Kommunikation für Nutzerdaten.

## Quickstart

```sh
npm install
npm run dev
# http://localhost:8000
```

## Build

```sh
npm run build    # Produktions-Build (minified)
npm run dev      # Dev-Build mit Watch-Modus
```

## Audit-PDF für Priester

Der Fragenkatalog (`data/questions.json`) muss theologisch von einem Priester abgenommen werden. Das Audit-PDF-Tool generiert ein formatiertes PDF-Dokument mit allen Fragen, Statistiken und einem Changelog.

### PDF generieren

```sh
# Erstversion — alle Fragen als neu markiert (für die erste Abnahme)
npm run audit-pdf -- --initial

# Mit Diff — Vergleich gegen den letzten Commit
npm run audit-pdf
```

Das erzeugt eine Datei wie `puranima-audit-v1.0.0-2026-03-04.pdf` im Projektroot.

### Changelog (Änderungen sichtbar machen)

Das Tool vergleicht automatisch den aktuellen Fragenkatalog mit einer früheren Version aus Git und zeigt im PDF:

- **Neue Fragen** (grün markiert)
- **Geänderte Fragen** (gelb markiert, mit Alt/Neu-Vergleich pro Feld)
- **Gelöschte Fragen** (rot markiert, durchgestrichen)

Standardmässig wird gegen den letzten Commit verglichen (`HEAD~1`). Für andere Vergleichspunkte:

```sh
# Erstversion (alle Fragen als neu, kein Git-Diff)
npm run audit-pdf -- --initial

# Vergleich gegen einen bestimmten Commit
npm run audit-pdf -- --baseline abc1234

# Vergleich gegen einen Git-Tag
npm run audit-pdf -- --baseline v0.9.0

# Vergleich gegen einen Branch
npm run audit-pdf -- --baseline main

# Vergleich gegen 5 Commits zurück
npm run audit-pdf -- --baseline HEAD~5
```

### PDF-Inhalt

Das generierte PDF enthält:

1. **Titelseite** — Version, Datum, Status, Quellenangaben
2. **Statistik** — Verteilung nach Kategorie, Schweregrad, Quelle und Lebensstand
3. **Changelog** — Alle Änderungen gegenüber der Vergleichsversion
4. **Gebete** — Die drei Gebete (Eröffnung, Reue, Dank)
5. **Fragenkatalog** — Alle Fragen, gruppiert nach Kategorie und Unterkategorie

Pro Frage wird angezeigt: Fragetext, Beichttext (Spickzettel-Formulierung), Erklärung, Schweregrad, Lebensstände und Quelle.

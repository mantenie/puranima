# Product Requirements Document (PRD): Puranima

**Version:** 2.1
**Datum:** 04.03.2026
**Status:** MVP implementiert — theologische Abnahme ausstehend

---

## 1. Executive Summary

Puranima ist eine Progressive Web App (PWA) zur katholischen Gewissenserforschung.
Sie löst das Problem der fehlenden oder veralteten Vorbereitung auf das Sakrament der
Versöhnung durch eine radikal einfache, diskrete und rein lokal funktionierende Benutzeroberfläche.

Der Name "Puranima" kommt aus dem Sanskrit und bedeutet "Vollmond" — der Moment,
in dem das Licht die Dunkelheit vollständig überwindet.

Das Ziel ist nicht Profit, sondern Mission. Die Monetarisierung erfolgt ausschließlich über
freiwillige Spenden zur Kostendeckung.

## 2. Problem & Lösung

**Das Problem:** Gläubige wissen oft nicht mehr, wie man systematisch das Gewissen erforscht.
Analoge Beichtspiegel sind unübersichtlich, bestehende Apps sammeln Daten oder sind schlecht
bedienbar. Scham und Vergesslichkeit im Beichtstuhl verhindern eine vollständige Beichte.

**Die Lösung:** Eine im Browser laufende PWA im Card-Design. Sie führt den Nutzer durch
theologische Leitfragen — gefiltert nach Lebensstand — speichert die markierten Punkte
ausschließlich lokal auf dem Gerät und generiert einen übersichtlichen Spickzettel für den
Beichtstuhl.

## 3. Zielgruppen

- **Regelmäßige Kirchgänger:** Strukturierte, schnelle Routine für die monatliche Beichte.
- **Rückkehrer:** Theologische Erklärung und extrem niedrige Hemmschwelle.

### Segmentierung nach Lebensstand

| Lebensstand | Beschreibung | Besondere Themen |
|-------------|-------------|-----------------|
| allgemein | Kernfragen für jeden | Gottesbeziehung, Nächstenliebe, Wahrhaftigkeit |
| single | Ledige Erwachsene | Reinheit, Selbstbefriedigung, Beziehungsfähigkeit |
| verheiratet | Eheleute | Ehetreue, Offenheit für Kinder, Familienleben |
| jugendlich | Jugendliche / Firmkandidaten | Altersgemäße Sprache, Schule, Medienkonsum |
| kinder | Kinder ab Erstkommunion | Sehr einfache Sprache, Eltern/Geschwister-Fragen |
| priester | Priester und Ordensleute | Liturgische Pflichten, Gehorsam, Zölibat |

## 4. User Flow

### 4.1 Onboarding (Einmalig)

1. Startbildschirm mit Privacy-Versprechen und Lebensstand-Auswahl
2. Optionaler PIN-Schutz (4-stellig, SHA-256 gehasht)
3. Tooltip weist auf PIN-Funktion hin

### 4.2 Vorbereitung

1. Gebet vor der Gewissenserforschung
2. Kurze Erklärung des Ablaufs

### 4.3 Gewissenserforschung

1. Anzeige der Fragen als Karten — eine pro Bildschirm
2. Jede Karte zeigt die Frage und optional eine kurze theologische Erklärung
3. Alle Fragen so formuliert, dass "Ja, trifft zu" = Sünde/Verfehlung
4. Der Nutzer reagiert mit einem der drei Buttons:
   - "Ja, trifft zu" → Frage wird zur Zusammenfassung hinzugefügt
   - "Nein" → Weiter zur nächsten Frage
   - "Unsicher" → Wird separat markiert
5. Fortschrittsbalken zeigt Position im Fragenkatalog
6. Jederzeit zur Zusammenfassung springen

### 4.4 Zusammenfassung (Spickzettel)

1. Große, gut lesbare Schrift — optimiert für dunkle Lichtverhältnisse (Dark Mode)
2. Gliederung nach Kategorien
3. Markierte Fragen als kompakte Stichworte
4. Einleitungsgebet vor der Liste
5. Reuegebet am Ende

### 4.5 Abschluss

1. Nach der Absolution: "Panic Button" (Alles löschen, inkl. PIN)
2. Optional: Dankgebet nach der Beichte
3. Optional: Dezenter Spendenhinweis

## 5. Funktionale Anforderungen

### 5.1 Lebensstand-Filter

Einzelne JSON-Datei mit Tags pro Frage. Kernfragen (~60-70%) plus standspezifische Fragen.

### 5.2 Card-UI

Kein Swipe — nur Buttons. Begründung: Touch-Gesten fehleranfällig, Buttons besser
zugänglich, identisch auf Desktop und Mobile.

### 5.3 Spickzettel-Generator

- Mindestschriftgröße: 18px
- Hoher Kontrast (helle Schrift auf dunklem Grund)
- Einleitungsgebet und Reuegebet

### 5.4 PIN-Schutz (optional)

- 4-stelliger numerischer PIN
- SHA-256 Hashing mit Salt
- Sperrbildschirm beim App-Start
- 30 Sekunden Cooldown nach 3 Fehlversuchen
- PIN wird beim Löschen aller Daten zurückgesetzt (bewusste Entscheidung)
- PIN ändern / entfernen jederzeit über Schloss-Icon möglich

### 5.5 Panic Button / Auto-Wipe

- Prominenter Button, löscht alle lokalen Daten sofort (inkl. PIN)
- Kein Bestätigungsdialog (Schnelligkeit > Undo)
- Auto-Wipe: Sessiondaten nach 24 Stunden

### 5.6 Offline-Fähigkeit (PWA)

- manifest.json + Service Worker
- Cache-First-Strategie für alle Assets
- Alle Assets lokal (kein CDN)
- Kein Netzwerk-Fallback nötig

### 5.7 FAQ

- 12 Einträge rund um die Beichte
- Verlinkung zu Source & Summit für Beichtgelegenheiten
- Bedeutung des Namens "Puranima"

### 5.8 Rechtliche Seiten

- Impressum (faithos.de)
- Datenschutzerklärung (DSGVO-konform)
- Gemeinsamer Footer auf allen Unterseiten

## 6. Nicht-Funktionale Anforderungen

### 6.1 Privacy First (Dogma)

- Null Server-Calls für Nutzerdaten
- Kein Analytics, Tracking, Cookies
- Alle Assets lokal ausgeliefert
- Open Source auf GitHub

### 6.2 Tech Stack

HTML5 + Tailwind CSS v4 (lokal kompiliert) + Vanilla JavaScript + IndexedDB + esbuild

### 6.3 Datenhaltung

IndexedDB primär, localStorage als Fallback. Panic Button leert beide.

## 7. Inhaltsstruktur: Fragenkatalog

### 7.1 Quellen

- Karl Wallner (Stift Heiligenkreuz): Allgemeiner Beichtspiegel, 10. Auflage
- Gotteslob Nr. 598–601
- YOUCAT-Beichtspiegel
- Martin Ramm FSSP: Praktische Beichthilfe für Erwachsene
- Priester-Beichtspiegel (katholisch-informiert.ch)

### 7.2 Frage-Schema

```json
{
  "id": "gott-001",
  "category": "gottesverhältnis",
  "subcategory": "ehrfurcht",
  "question": "War mir Gott gleichgültig?",
  "explanation": "Das 1. Gebot ruft dazu auf...",
  "tags": ["allgemein"],
  "severity": "normal",
  "source": "wallner"
}
```

### 7.3 Konsistenzregel

Alle Fragen sind so formuliert, dass "Ja, trifft zu" immer eine Sünde/Verfehlung bestätigt.
Positiv formulierte Fragen (wo "Ja" = gut) wurden umgedreht.

### 7.4 Abnahme-Prozess

Theologische Prüfung durch mindestens einen Priester vor Launch erforderlich.

## 8. Implementierungsstatus

### Phase 1: MVP — FERTIG

- [x] Startseite mit Privacy-Text und Lebensstand-Auswahl
- [x] Vorbereitungsseite mit Eröffnungsgebet
- [x] Card-UI mit Buttons (Ja / Nein / Unsicher)
- [x] Spickzettel-Ansicht mit Dark Mode
- [x] Panic Button
- [x] Service Worker + manifest.json
- [x] Build-System (Tailwind CSS v4 + esbuild)

### Phase 2: Polish — FERTIG

- [x] Einleitungs- und Reuegebet im Spickzettel
- [x] Auto-Wipe nach 24h
- [x] Fortschrittsbalken
- [x] Theologische Erklärungen pro Karte (aufklappbar)
- [x] Optionaler PIN-Schutz
- [x] FAQ-Seite (12 Einträge)
- [x] Impressum + Datenschutz
- [x] Gemeinsamer Footer
- [x] Dark Mode Kontrast-Optimierung
- [x] Konsistente Frageformulierung (42 Fragen korrigiert)
- [x] Tailwind CSS lokal statt CDN

### Phase 3: Erweiterungen (ausstehend)

- [ ] Mehrsprachigkeit
- [ ] Anpassbare Schriftgröße
- [ ] QR-Code-Generator für Pfarreien
- [ ] PWA Install-Prompt

## 9. Offene Fragen

1. **Theologische Abnahme:** Wer übernimmt das Review des Fragenkatalogs?
2. **Domain:** puranima.de empfohlen
3. **Gebete:** Aktuell eigene Formulierungen, ggf. Gotteslob-Texte prüfen

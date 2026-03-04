# Product Requirements Document (PRD): Beicht-Helfer PWA

**Version:** 2.0
**Datum:** 04.03.2026
**Status:** Überarbeitet — bereit für Entwicklung

---

## 1. Executive Summary

Die Applikation ist eine Progressive Web App (PWA) zur katholischen Gewissenserforschung.
Sie löst das Problem der fehlenden oder veralteten Vorbereitung auf das Sakrament der
Versöhnung durch eine radikal einfache, diskrete und rein lokal funktionierende Benutzeroberfläche.

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

1. Startbildschirm mit kurzem Willkommenstext und Privacy-Versprechen
2. Auswahl des Lebensstands (im LocalStorage gespeichert, jederzeit änderbar)
3. Optionaler Hinweis: "Letzte Beichte war vor ca. ___" (kein Pflichtfeld)

### 4.2 Gewissenserforschung

1. Anzeige der Fragen als Karten — eine pro Bildschirm
2. Jede Karte zeigt die Frage und optional eine kurze theologische Erklärung
3. Der Nutzer reagiert mit einem der drei Buttons:
   - "Ja, trifft zu" → Frage wird zur Zusammenfassung hinzugefügt
   - "Nein" → Weiter zur nächsten Frage
   - "Unsicher / Merken" → Wird separat markiert
4. Fortschrittsbalken zeigt Position im Fragenkatalog
5. Jederzeit zur Zusammenfassung springen

### 4.3 Zusammenfassung (Spickzettel)

1. Große, gut lesbare Schrift — optimiert für dunkle Lichtverhältnisse (Dark Mode)
2. Gliederung nach Kategorien
3. Markierte Fragen als kompakte Stichworte
4. Einleitungsgebet vor der Liste
5. Reuegebet am Ende

### 4.4 Abschluss

1. Nach der Absolution: "Panic Button" (Alles löschen)
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

### 5.4 Panic Button / Auto-Wipe

- Prominenter Button, löscht alle lokalen Daten sofort
- Kein Bestätigungsdialog (Schnelligkeit > Undo)
- Auto-Wipe: Sessiondaten nach 24 Stunden

### 5.5 Offline-Fähigkeit (PWA)

- manifest.json + Service Worker
- Cache-First-Strategie für alle Assets
- Kein Netzwerk-Fallback nötig

## 6. Nicht-Funktionale Anforderungen

### 6.1 Privacy First (Dogma)

- Null Server-Calls für Nutzerdaten
- Kein Analytics, Tracking, Cookies
- Open Source auf GitHub

### 6.2 Tech Stack

HTML5 + Tailwind CSS (CDN) + Vanilla JavaScript + IndexedDB

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

### 7.3 Abnahme-Prozess

Theologische Prüfung durch mindestens einen Priester vor Launch erforderlich.

## 8. MVP-Scope

### Phase 1: MVP

- Startseite mit Privacy-Text und Lebensstand-Auswahl
- Card-UI mit Buttons (Ja / Nein / Unsicher)
- Spickzettel-Ansicht mit Dark Mode
- Panic Button
- Service Worker + manifest.json

### Phase 2: Polish

- Einleitungs- und Reuegebet im Spickzettel
- Auto-Wipe nach 24h
- Fortschrittsbalken
- PWA Install-Prompt
- Theologische Erklärungen pro Karte (aufklappbar)

### Phase 3: Erweiterungen

- Mehrsprachigkeit
- Anpassbare Schriftgröße
- Spendenintegration
- QR-Code-Generator für Pfarreien

## 9. Offene Fragen

1. Theologische Abnahme: Wer übernimmt das Review?
2. Domainname: Empfehlung puranima.de
3. Impressum/DSGVO: Verantwortlicher festlegen
4. Gebete: Aktuell eigene Formulierungen, ggf. Gotteslob-Texte

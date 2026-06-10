# 🧮 moJoe — Das interaktive Zwanzigerfeld

**moJoe** ist eine moderne, interaktive Webanwendung, die speziell für Grundschulkinder entwickelt wurde, um den spielerischen Übergang über die Zehnergrenze (**Zehnerübergang**) beim Addieren und Subtrahieren im Zahlenraum bis 20 zu erlernen und zu festigen. 

Mit ansprechenden Farben, klaren Strukturen und dynamischem Feedback wird das mathematische Verständnis visualisiert und gefördert.

---

## 🌟 Hauptfunktionen

### 1. Interaktives Zwanzigerfeld
- Zwei visuell getrennte Zehnerfelder (Zehnerpakete), um die Struktur von Zahlen und Zehnerbündeln intuitiv zu erfassen.
- Farblich kodierte Kreise veranschaulichen die mathematischen Operanden und Zwischenschritte.

### 2. Drei didaktische Schwierigkeitsstufen (Levels)
- **Level 1 (Voll-Visualisiert):** Die Aufgabe wird komplett grafisch dargestellt. Kinder zählen die Punkte ab, um das Ergebnis zu ermitteln.
- **Level 2 (Geführtes Legen):** Die erste Zahl ist vorgegeben. Die zweite Zahl (oder der Abzug) muss aktiv durch Anklicken der Felder gelegt werden.
- **Level 3 (Freies Legen):** Das Feld startet komplett leer. Kinder nutzen eine interaktive Farbpalette (inklusive Radiergummi), um die gesamte Rechnung selbstständig zu legen und darzustellen.

### 3. Spielerisches & Motivierendes Feedback
- **Konfetti-Effekt:** Belohnung bei einer vollkommen richtig gelösten Aufgabe (Zahleneingabe und grafische Darstellung müssen übereinstimmen).
- **Fehler-Indikation:** Visuelles Schütteln des Eingabefeldes und Hilfestellungen bei inkorrekten Antworten.
- **Soundeffekte:** Kindgerechte Audio-Rückmeldungen für Aktionen, Erfolge und Fehler (jederzeit stummschaltbar).
- **Sternen-Tracker:** Motiviert Kinder, Runden von 5 Aufgaben abzuschließen.

### 4. Personalisierung
- Farbpalette zur individuellen Gestaltung der Zehnerfelder (z. B. Rot, Blau, Gelb, Orange, Grün).
- Unterstützung von Plus- (+) und Minusaufgaben (-) mit automatischem Zehnerübergang.

---

## 🛠️ Technologie-Stack

- **Framework:** [React 19](https://react.dev/) mit [TypeScript](https://www.typescriptlang.org/)
- **Build-Tool:** [Vite](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (modernes Responsive Design, weiche Verläufe, Outfit-Schriftart)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Installation & Lokaler Start

### Voraussetzungen
Stelle sicher, dass [Node.js](https://nodejs.org/) (Version 18+) auf deinem System installiert ist.

### Schritt-für-Schritt-Anleitung

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```
   Öffne anschließend [http://localhost:5173](http://localhost:5173) in deinem Browser.

3. **Produktions-Build erstellen:**
   ```bash
   npm run build
   ```

4. **Linting ausführen:**
   ```bash
   npm run lint
   ```

---

## 📂 Projektstruktur

- `index.html` — Haupteinstiegspunkt mit SEO-Tags, Metadaten und Google-Fonts-Einbindung.
- `src/App.tsx` — Hauptanwendungskomponente mit Spielsteuerungs-Logik, Zustandsverwaltung und UI.
- `src/components/`
  - `TwentyField.tsx` — Die interaktive Zwanzigerfeld-Komponente.
  - `Confetti.tsx` — Canvas-basierter Konfetti-Effekt bei Erfolg.
- `src/utils/SoundManager.ts` — Verwaltung der Audioeffekte mit dem Web Audio API.
- `src/types.ts` — TypeScript-Typdefinitionen für Aufgaben, Zustände und Level.
- `src/index.css` — Globale CSS-Datei mit Tailwind-Direktiven und CSS-Animationen.

---

## 🔒 Barrierefreiheit & SEO
Die Anwendung nutzt semantisches HTML5, reaktive ARIA-Labels für Stummschaltung/Neustart und ein klares visuelles Kontrastverhältnis. Sie ist für Mobilgeräte (Smartphones, Tablets) sowie Desktop-Monitore optimiert.

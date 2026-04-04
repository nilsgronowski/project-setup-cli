# Sprint-1-Guide Node CLI Setup

Version: 1.0  
Stand: 30.03.2026  
Status: Arbeitsversion

## 1. Sprintziel

In Sprint 1 wird ein lauffaehiger End-to-End MVP erstellt, der einen ersten Stack vollstaendig automatisiert aufsetzt.

Empfehlung fuer Sprint 1:

1. Starte mit Angular Frontend als Referenz-Workflow.
2. Integriere bereits Resume-Logik und State-Persistenz.
3. Generiere Dockerfile und compose.yaml fuer diesen einen Stack.
4. Schliesse mit Pflichtvalidierung und Basis-Tests ab.

Ergebnis nach Sprint 1:

- Ein CLI-Durchlauf erzeugt reproduzierbar ein Projekt.
- Ein abgebrochener Run kann fortgesetzt werden.
- Das Ergebnis ist per Docker Compose validierbar.

## 2. Sprintumfang (In Scope / Out of Scope)

In Scope:

1. CLI-Grundstruktur und Command-Aufruf.
2. Konfigurationsmodell fuer einen Stack.
3. Step-Runner mit Checkpoints.
4. setup-state.json schreiben/lesen.
5. Ein vollstaendiger Referenz-Workflow (Angular).
6. Dockerfile-Template und compose.yaml-Render fuer Angular-Service.
7. Technische Pflichtvalidierung (compose config + Dateipruefungen).

Out of Scope fuer Sprint 1:

1. Mehrere Frameworks gleichzeitig.
2. Komplexe Rollback-Mechanismen.
3. Erweiterte UI/UX der Prompts.
4. Umfangreiche Integrationen ausserhalb des Setup-Prozesses.

## 3. Arbeitsreihenfolge fuer Sprint 1

### Schritt 1: Projektgrundlage und Verzeichnisstruktur

Ziel:

- Das CLI hat ein stabiles Grundgeruest und klare Ordnerstruktur.

Aufgaben:

1. Node.js Projekt initialisieren.
2. TypeScript, Linting und Test-Setup vorbereiten (minimal).
3. Ordnerstruktur anlegen:
   - src/cli
   - src/core
   - src/workflows
   - src/templates
   - src/state
4. Basis-Command definieren, z. B. setup.

Definition of Done:

- CLI startet lokal ohne Fehler.
- Ein einfacher setup-Aufruf ist moeglich.

### Schritt 2: Konfigurationsmodell und Validierung

Ziel:

- Einheitliches internes Konfigurationsobjekt, das alle weiteren Schritte nutzt.

Aufgaben:

1. Input-Parameter fuer den ersten Stack definieren.
2. Normalisierte Struktur festlegen (projectName, frontend type, port).
3. Zod-Schema fuer Validierung implementieren.
4. Fehlerausgaben bei ungueltiger Konfiguration standardisieren.

Definition of Done:

- Gueltige Konfiguration wird akzeptiert.
- Ungueltige Konfiguration wird mit klarer Meldung abgelehnt.

### Schritt 3: State-Persistenz und Resume-Basis

Ziel:

- Der Prozess ist unterbrechbar und fortsetzbar.

Aufgaben:

1. setup-state.json Struktur gemaess Konzept implementieren.
2. State lesen/schreiben in .tooling/setup-state.json.
3. completedSteps, currentStep, failedStep pflegen.
4. Bei Neustart vorhandenen State laden und Resume-Punkt bestimmen.

Definition of Done:

- Nach jedem erfolgreichen Schritt wird State aktualisiert.
- Nach simuliertem Abbruch kann der Lauf fortgesetzt werden.

### Schritt 4: Step-Runner und Step-Registry

Ziel:

- Sequentielle, robuste Ausfuehrung mit idempotenter Schrittlogik.

Aufgaben:

1. Step-Interface definieren (id, run, isDone).
2. Runner implementieren:
   - Schritte iterieren
   - isDone pruefen
   - run ausfuehren
   - Fehler abfangen und in State speichern
3. Registry fuer den Angular-Workflow anlegen.

Definition of Done:

- Runner fuehrt Schritte in richtiger Reihenfolge aus.
- Bereits erledigte Schritte werden bei Resume uebersprungen.

### Schritt 5: Angular Referenz-Workflow (MVP)

Ziel:

- Der erste echte Workflow ist Ende-zu-Ende lauffaehig.

Aufgaben:

1. Schritte implementieren:
   - check_target_dir
   - create_angular_project
   - install_frontend_deps
   - write_frontend_env
   - prepare_frontend_container
   - mark_frontend_ready
2. Idempotenz je Schritt sicherstellen.
3. Logging je Schritt mit Start/Success/Failure.

Definition of Done:

- Vollstaendiger Lauf funktioniert auf leerem Zielordner.
- Re-Run verursacht keine schaedlichen Doppeleffekte.

### Schritt 6: Dockerfile- und Compose-Generierung

Ziel:

- Der erzeugte Stack ist container-ready.

Aufgaben:

1. Template fuer Angular Dockerfile bereitstellen.
2. compose.yaml aus Konfiguration rendern.
3. Ausgabe an stabilen Pfaden speichern.
4. Optional .dockerignore erzeugen.

Definition of Done:

- Dockerfile existiert am erwarteten Ort.
- compose.yaml ist syntaktisch korrekt generiert.

### Schritt 7: Pflichtvalidierung, Tests und Sprint-Abschluss

Ziel:

- Technische Abnahmefaehigkeit fuer Sprint 1 herstellen.

Aufgaben:

1. Validierung ausfuehren:
   - docker compose config
   - Dateiexistenzpruefungen fuer Dockerfile/compose referenzierte Pfade
2. Kern-Tests ausfuehren:
   - Fresh Run
   - Abort/Resume
   - Re-Run
3. Sprint-Dokumentation aktualisieren (bekannte Grenzen, naechster Ausbau).

Definition of Done:

- Alle Pflichtvalidierungen erfolgreich.
- Testfaelle dokumentiert mit Ergebnis.
- Offene Risiken fuer Sprint 2 klar gelistet.

## 4. Praktischer 5-Tage-Plan (Vorschlag)

Tag 1:

1. Schritt 1 abschliessen.
2. Schritt 2 beginnen und abschliessen.

Tag 2:

1. Schritt 3 komplett umsetzen.
2. Resume-Verhalten mit simuliertem Abbruch pruefen.

Tag 3:

1. Schritt 4 abschliessen.
2. Runner gegen kleine Dummy-Steps testen.

Tag 4:

1. Schritt 5 (Angular Workflow) komplett implementieren.
2. Idempotenzchecks je Step nachziehen.

Tag 5:

1. Schritt 6 und 7 abschliessen.
2. End-to-End Testlauf protokollieren.
3. Sprint Review Vorbereitung.

## 5. Aufgabenboard fuer Sprint 1

Nutze diese Tickets direkt als Start-Backlog:

1. S1-T01: CLI-Grundgeruest und setup Command.
2. S1-T02: Konfigurationsschema mit zod.
3. S1-T03: setup-state schreiben/lesen.
4. S1-T04: Resume-Mechanik im Runner.
5. S1-T05: Step-Interface + Registry.
6. S1-T06: Angular Step check_target_dir.
7. S1-T07: Angular Step create_angular_project.
8. S1-T08: Angular Step install_frontend_deps.
9. S1-T09: Angular Step write_frontend_env.
10. S1-T10: Dockerfile Template Angular.
11. S1-T11: compose.yaml Rendering.
12. S1-T12: Pflichtvalidierung + Testprotokoll.

## 6. Abnahmekriterien fuer Sprint 1

Sprint 1 ist erfolgreich, wenn alle Punkte erfuellt sind:

1. Non-interaktiver Lauf funktioniert fuer Angular MVP.
2. setup-state wird kontinuierlich geschrieben.
3. Abbruch und Resume funktionieren reproduzierbar.
4. Dockerfile und compose.yaml werden generiert.
5. docker compose config liefert Erfolg.
6. Re-Run fuehrt nicht zu inkonsistentem Zustand.

## 7. Risiken und Gegenmassnahmen

Risiko 1: Schritt ist nicht idempotent.

- Gegenmassnahme: pro Step isDone-Pruefung und defensive Dateichecks.

Risiko 2: State ist nach Crash inkonsistent.

- Gegenmassnahme: State nach jedem Step atomar schreiben.

Risiko 3: Template passt nicht zur echten Projektstruktur.

- Gegenmassnahme: E2E-Test mit real erzeugtem Zielprojekt je Build.

Risiko 4: Resume-Versionierung spaeter inkompatibel.

- Gegenmassnahme: version Feld im State von Anfang an pflegen.

## 8. Sprint-Review Checkliste

1. Demo: Fresh Run durchfuehren.
2. Demo: Lauf absichtlich abbrechen und Resume zeigen.
3. Demo: compose.yaml + Dockerfile zeigen.
4. Nachweis: docker compose config erfolgreich.
5. Offene Punkte und Sprint-2 Fokus dokumentieren.

---

Dokumentname: Sprint-1-Guide-Node-CLI-Setup.md

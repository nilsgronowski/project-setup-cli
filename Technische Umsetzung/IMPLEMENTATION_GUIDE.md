# Project Setup CLI - Implementierungsleitfaden

## Ziel dieses Dokuments

Dieses Dokument erklaert, wie die aktuelle CLI aufgebaut ist, wie die Step-Engine funktioniert, warum bestimmte Designentscheidungen getroffen wurden und wie du den Code sicher erweitern kannst.

## Aktuelle Architektur

Der Ablauf ist in vier Schichten getrennt:

1. CLI-Eingabe und Orchestrierung

- Datei: src/cli.js
- Verantwortlich fuer Prompts, Zusammenbau der Eingaben, Start der Validierung und Start des Runners.

2. Konfiguration und Validierung

- Dateien: src/core/config.schema.js, src/core/config.validate.js
- Verantwortlich fuer Typpruefung, Regeln, Defaults und Normalisierung.

3. Step-Laufzeit

- Dateien: src/core/step.interface.js, src/core/step-registry.js, src/core/step-runner.js
- Verantwortlich fuer den einheitlichen Step-Vertrag, geordnete Step-Listen und sequentielle Ausfuehrung.

4. Workflow-Implementierungen

- Dateien: src/workflows/react/index.js und src/workflows/react/steps/\*.js
- Verantwortlich fuer konkrete Arbeitsschritte je Framework.

## End-to-End Ablauf

1. Der Benutzer beantwortet die Prompts in src/cli.js.
2. Daraus wird ein userInput-Objekt gebaut.
3. validateConfig(userInput) prueft und normalisiert das Objekt.
4. Je nach frontend.type wird eine Registry geladen.
5. runSteps(...) fuehrt die Steps in Reihenfolge aus:

- isDone pruefen
- bei true: Step skippen
- bei false: run ausfuehren
- bei Fehler: sofort abbrechen und Fehler zurueckgeben

6. Die CLI zeigt Ergebnis und beendet sich mit Exit-Code 0 oder 1.

Der aktuelle CLI-Ablauf ist zweistufig orchestriert:

- Nach der Frontend-Auswahl wird der Frontend-Workflow sofort validiert und ausgefuehrt.
- Erst nach erfolgreichem Frontend-Setup folgen die Backend-Prompts.
- Nach der Backend-Auswahl wird auch der Backend-Workflow sofort validiert und ausgefuehrt.
- Erst danach folgen weitere Prompts wie Datenbank-Auswahl.
- Im Datenbank-Schritt koennen Credentials eingegeben werden; ohne Eingabe werden Default-Werte verwendet.
- Nach der Generierung liegt die zentrale Projektkonfiguration in der Root-Datei .env, die von Compose und vom Backend mitgeladen wird.

## Warum diese Struktur sinnvoll ist

1. Geringe Kopplung

- Die CLI kennt nur den allgemeinen Ablauf.
- Der Runner kennt keine Framework-Details.
- Die Steps enthalten nur konkrete Datei-/Projektlogik.

2. Idempotenz faehig

- Jeder Step hat isDone und run.
- Wiederholte Ausfuehrung ist dadurch kontrolliert moeglich.

3. Erweiterbar

- Neue Workflows koennen ueber neue Registry + Step-Dateien eingebaut werden.
- Der Runner bleibt unveraendert.

## Konfigurationsmodell

### Schema (src/core/config.schema.js)

Das Schema definiert:

- project
- stack.frontend/backend/database
- container
- generation
- execution

Wichtige Regeln:

- Portfelder werden auf Number gecastet und auf 1..65535 begrenzt.
- Strings werden getrimmt.
- Mehrere Felder haben Defaults.

### Validierung (src/core/config.validate.js)

validateConfig macht zwei Dinge:

1. safeParse mit Zod
2. Nach erfolgreicher Validierung fehlende Ports ergaenzen (framework-spezifische Defaults)

Rueckgabeformat:

- success: boolean
- data: normalisierte Config oder null
- errors: formatierte Fehlerliste

## Step-System

### Step-Vertrag (src/core/step.interface.js)

Ein Step braucht:

- id: eindeutige Kennung
- isDone(context): Promise<boolean>
- run(context): Promise<void>

StepContext enthaelt:

- config
- projectRoot
- log

assertStep und assertStepList sorgen dafuer, dass defekte Steps frueh auffallen.

### Registry (src/core/step-registry.js)

StepRegistry kapselt die Reihenfolge von Steps und bietet:

- getAllSteps()
- getStepById(stepId)

### Runner (src/core/step-runner.js)

runSteps arbeitet sequentiell:

- startet jeden Step in der registrierten Reihenfolge
- skippt bei isDone === true
- fuehrt run aus, falls noch nicht done
- stoppt beim ersten Fehler
- liefert strukturiertes Ergebnis mit completed/skipped/failed

## React Workflow

### Registry

- Datei: src/workflows/frontend/react/index.js
- Definiert die feste Reihenfolge der React-Steps.

### Schritte

1. check_target_dir

- Datei: src/workflows/frontend/react/steps/check-target-dir.step.js
- Zweck: Zielordner sicherstellen.

2. create_react_project

- Datei: src/workflows/frontend/react/steps/create-react-project.step.js
- Zweck: package.json fuer Vite/React erzeugen.

3. install_frontend_deps

- Datei: src/workflows/frontend/react/steps/install-frontend-deps.step.js
- Zweck: Frontend-Dependencies per npm installieren.

4. write_frontend_env

- Datei: src/workflows/frontend/react/steps/write-frontend-env.step.js
- Zweck: .env mit PORT schreiben.

5. prepare_frontend_container

- Datei: src/workflows/frontend/react/steps/prepare-frontend-container.step.js
- Zweck: Dockerfile generieren.

6. mark_frontend_ready

- Datei: src/workflows/frontend/react/steps/mark-frontend-ready.step.js
- Zweck: .tooling/frontend-ready.json als Abschlussmarker schreiben.

## Vue Workflow

### Registry

- Datei: src/workflows/frontend/vue/index.js
- Definiert die feste Reihenfolge der Vue-Steps.

### Schritte

1. check_target_dir

- Datei: src/workflows/frontend/vue/steps/check-target-dir.step.js
- Zweck: Zielordner sicherstellen.

2. create_frontend_dir

- Datei: src/workflows/frontend/vue/steps/create-frontend-dir.step.js
- Zweck: frontend-Unterordner anlegen.

3. create_vue_project

- Datei: src/workflows/frontend/vue/steps/create-vue-project.step.js
- Zweck: das Frontend mit Vite + Vue scaffolden.

4. install_frontend_deps

- Datei: src/workflows/frontend/vue/steps/install-frontend-deps.step.js
- Zweck: Frontend-Dependencies per npm installieren.

5. write_frontend_env

- Datei: src/workflows/frontend/vue/steps/write-frontend-env.step.js
- Zweck: .env mit PORT schreiben.

6. prepare_frontend_container

- Datei: src/workflows/frontend/vue/steps/prepare-frontend-container.step.js
- Zweck: Dockerfile fuer Vue generieren.

7. mark_frontend_ready

- Datei: src/workflows/frontend/vue/steps/mark-frontend-ready.step.js
- Zweck: .tooling/frontend-ready.json als Abschlussmarker schreiben.

## Backend Workflow

### Express Registry

- Datei: src/workflows/backend/express/index.js
- Definiert die feste Reihenfolge der Express-Backend-Steps.

### Express Schritte

1. create_backend_dir

- Datei: src/workflows/backend/express/steps/create-backend-dir.step.js
- Zweck: backend-Unterordner anlegen.

2. create_express_project_files

- Datei: src/workflows/backend/express/steps/create-express-project-files.step.js
- Zweck: das Backend mit express-generator scaffolden und die Standardstruktur erzeugen.

3. install_backend_deps

- Datei: src/workflows/backend/express/steps/install-backend-deps.step.js
- Zweck: die vom Generator vorgesehenen Dependencies per npm installieren und dotenv ergaenzen.

4. write_backend_env

- Datei: src/workflows/backend/express/steps/write-backend-env.step.js
- Zweck: backend/.env mit PORT schreiben.

5. prepare_backend_container

- Datei: src/workflows/backend/express/steps/prepare-backend-container.step.js
- Zweck: Dockerfile fuer das Backend generieren.

6. mark_backend_ready

- Datei: src/workflows/backend/express/steps/mark-backend-ready.step.js
- Zweck: .tooling/backend-ready.json als Abschlussmarker schreiben.

### Django Registry

- Datei: src/workflows/backend/django/index.js
- Definiert die feste Reihenfolge der Django-Backend-Steps.

### Django Schritte

1. create_backend_dir

- Datei: src/workflows/backend/django/steps/create-backend-dir.step.js
- Zweck: backend-Unterordner anlegen.

2. create_django_project_files

- Datei: src/workflows/backend/django/steps/create-django-project-files.step.js
- Zweck: Django-Projektdateien (manage.py, config/, app/, requirements.txt) erzeugen.

3. install_backend_deps

- Datei: src/workflows/backend/django/steps/install-backend-deps.step.js
- Zweck: Python-Dependencies aus requirements.txt installieren.

4. write_backend_env

- Datei: src/workflows/backend/django/steps/write-backend-env.step.js
- Zweck: backend/.env fuer Django schreiben.

5. prepare_backend_container

- Datei: src/workflows/backend/django/steps/prepare-backend-container.step.js
- Zweck: Dockerfile fuer Django erzeugen.

6. mark_backend_ready

- Datei: src/workflows/backend/django/steps/mark-backend-ready.step.js
- Zweck: .tooling/backend-ready.json als Abschlussmarker schreiben.

## Idempotenz-Muster

Jeder Step folgt demselben Muster:

1. isDone prueft ein klares Artefakt

- Datei existiert, Marker existiert, etc.

2. run erstellt genau diese Artefakte

- Keine globalen Seiteneffekte ausserhalb des eigenen Schritts.

Warum das wichtig ist:

- Re-Runs sind sicherer.
- Steps werden nur ausgefuehrt, wenn noetig.

## Aktueller Status und bekannte Grenzen

1. React ist implementiert.
2. Express als Backend-Workflow ist implementiert.
3. Vue ist als Frontend-Workflow implementiert.
4. Django ist als Backend-Workflow implementiert.
5. Root-Compose und Datenbank-Compose werden weiterhin ueber den Datenbank-Workflow erzeugt und greifen auf frontend/backend Dockerfiles zu.
6. Die Dependency-Installation erfolgt fuer Frontend/Express per npm und fuer Django per pip.

## Wie du sauber weiter ausbaust

1. Schrittweise technische Qualitaet erhoehen

- pro Step kleine Tests fuer isDone/run.
- Runner-Tests fuer Reihenfolge, Skip, Fehlerabbruch.

2. Optional spaeter Resume/State nachziehen

- Runner-Events um onStepStart/onStepSuccess/onStepFailure erweitern.
- State-Schicht getrennt halten, damit der Runner selbst simpel bleibt.

## Debug-Checkliste

Wenn ein Workflow nicht laeuft:

1. Ist die Registry-Datei vorhanden und exportiert create...StepRegistry?
2. Haben alle Steps eindeutige IDs?
3. Liefert isDone wirklich boolean?
4. Wirft run im Fehlerfall eine klare Error-Nachricht?
5. Ist config nach validateConfig vollstaendig (insb. Ports)?
6. Stimmen Importpfade in cli.js mit echten Dateien ueberein?

## Kurzfazit

Die aktuelle Struktur ist ein solides MVP-Fundament:

- klare Trennung von Input, Validierung, Runner und Workflows
- idempotente Step-Logik
- einfache Erweiterbarkeit auf weitere Frameworks

Der naechste sinnvolle Ausbau ist, den Angular-Pfad zu vervollstaendigen und die Platzhalter-Install-Logik auf echte Befehle umzustellen.

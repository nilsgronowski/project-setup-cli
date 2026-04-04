# Methoden-Dokumentation Node CLI Setup

Version: 1.0  
Stand: 27.03.2026  
Status: Freigegebene Konzeptversion

## 1. Ziel und Umfang

Diese Dokumentation beschreibt die Zielarchitektur fuer ein Node.js CLI, das projektbezogene Stacks automatisiert aufsetzt, Setup-Schritte speichert und bei Unterbrechungen fortsetzen kann.

Primare Ziele:

1. Non-interaktive, reproduzierbare Projektinitialisierung.
2. Persistenter Fortschritt mit Resume-Funktion.
3. Automatische Erzeugung von Dockerfiles und compose.yaml passend zur gewaehlten Konfiguration.
4. Einfache Erweiterbarkeit um weitere Frameworks.

## 2. Architekturprinzip

Das CLI basiert auf einer Step-Registry mit Checkpoint-Status.

Kernbausteine:

1. Workflow-Registry mit eindeutig benannten Schritten.
2. Runner fuer sequentielle Ausfuehrung und Fehlerbehandlung.
3. Persistenter State im Zielprojekt.
4. Idempotenz-Checks pro Schritt.
5. Template-Engine fuer Quellcode-, Dockerfile- und Compose-Generierung.

## 3. Speicherung von Ablaufen

Es gibt zwei Speicherorte mit klarer Trennung.

1. Statische Workflow-Definitionen im CLI-Quellcode

- Enthalten Reihenfolge, Logik und Bedingungen je Framework.
- Werden mit dem CLI versioniert.
- Beispielpfade:
  - src/workflows/angular.ts
  - src/workflows/django.ts
  - src/workflows/index.ts

2. Laufzeitstatus im generierten Projekt

- Enthalten den konkreten Fortschritt eines Runs.
- Empfehlungspfad: .tooling/setup-state.json
- Optionaler Logpfad: .tooling/setup.log

Beispiel fuer setup-state.json:

```json
{
  "runId": "2026-03-27T18-50-00Z",
  "workflow": "angular-frontend",
  "version": "1.0.0",
  "currentStep": "install_frontend_deps",
  "completedSteps": ["check_target_dir", "create_angular_project"],
  "failedStep": null,
  "lastError": null,
  "updatedAt": "2026-03-27T18:52:31Z"
}
```

Resume-Verhalten:

1. Beim Start wird der vorhandene State geladen.
2. Erledigte Schritte werden uebersprungen.
3. Die Ausfuehrung startet beim ersten offenen Schritt.
4. Nach jedem erfolgreichen Schritt wird der State sofort geschrieben.

## 4. Workflow-Beispiele

### 4.1 Angular Frontend

Standardschritte:

1. check_target_dir
2. create_angular_project
3. install_frontend_deps
4. write_frontend_env
5. prepare_frontend_container
6. mark_frontend_ready

Typischer non-interaktiver Befehl:

```bash
npx -y @angular/cli@latest new my-frontend --defaults --skip-git --routing --style=scss
```

### 4.2 Django Backend

Standardschritte:

1. check_python_runtime
2. create_venv
3. install_django
4. create_django_project
5. write_backend_env
6. prepare_backend_container
7. mark_backend_ready

Typische Befehle:

```bash
python -m venv .venv
.venv/bin/pip install django
.venv/bin/django-admin startproject my_backend backend
```

## 5. Dockerfile- und Compose-Generierung

Ziel: Das Ergebnisprojekt soll nach Abschluss direkt per Docker Compose startbar sein.

### 5.1 Generierungsprinzip

1. Nutzer waehlt Stack.
2. CLI erstellt eine normalisierte Konfiguration.
3. Pro Service wird das passende Dockerfile-Template gerendert.
4. compose.yaml wird aus allen gewaehlten Services zusammengebaut.
5. Netzwerk, Ports, Volumes und depends_on werden aus der Konfiguration gesetzt.

### 5.2 Empfohlene Template-Struktur

1. templates/docker/angular/Dockerfile.ejs
2. templates/docker/django/Dockerfile.ejs
3. templates/docker/postgres/compose-service.ejs
4. templates/compose/compose.yaml.ejs

### 5.3 Beispielkonfiguration

```json
{
  "frontend": { "type": "angular", "port": 4200 },
  "backend": { "type": "django", "port": 8000 },
  "database": { "type": "postgres", "port": 5432 },
  "projectName": "my-stack"
}
```

### 5.4 Beispielausgabe compose.yaml

```yaml
services:
	frontend:
		build: ./frontend
		ports:
			- "4200:4200"
		depends_on:
			- backend

	backend:
		build: ./backend
		ports:
			- "8000:8000"
		environment:
			- DATABASE_URL=postgresql://postgres:postgres@db:5432/app
		depends_on:
			- db

	db:
		image: postgres:16-alpine
		ports:
			- "5432:5432"
		environment:
			- POSTGRES_DB=app
			- POSTGRES_USER=postgres
			- POSTGRES_PASSWORD=postgres
		volumes:
			- db_data:/var/lib/postgresql/data

volumes:
	db_data:
```

### 5.5 Container-Steps im Workflow

1. select_container_templates
2. render_dockerfiles
3. render_compose_file
4. write_dockerignore_files
5. validate_compose_config
6. mark_container_ready

### 5.6 Pflichtvalidierung vor Abschluss

1. docker compose config muss erfolgreich sein.
2. Dockerfiles fuer alle gewaehlten Services muessen existieren.
3. Alle in compose referenzierten Pfade muessen vorhanden sein.

## 6. Erweiterbarkeit und Erweiterungs-Workflow

Ja, die Architektur ist bewusst einfach erweiterbar. Ein neues Framework wird in der Regel ohne Umbau der Kernengine integrierbar, wenn Workflow, Auswahl und Templates sauber hinterlegt sind.

### 6.1 Was fuer ein neues Framework mindestens noetig ist

1. Neue Auswahloption im CLI Prompt.
2. Neuer Workflow in der Registry.
3. Dockerfile-Template fuer den neuen Service.
4. Compose-Mapping fuer Ports, Volumes, Environment und Abhaengigkeiten.
5. Konfigurationsvalidierung um neue Felder erweitern.

### 6.2 Standardisierter Erweiterungs-Workflow

1. Frameworkprofil definieren

- Name, Runtime, Build- und Startkommando, Healthcheck, Standardport.

2. Workflowdatei anlegen

- Schrittkette mit eindeutigen Step-IDs und Idempotenzregeln.

3. CLI-Auswahl erweitern

- Neue Option in den Prompts und Mapping auf das Profil.

4. Templates erstellen

- Dockerfile, dockerignore und optionale App-Templates fuer den Service.

5. Compose-Assembler erweitern

- Serviceblock, depends_on, Volumes, Netzwerke und Environment aufnehmen.

6. Resume-Kompatibilitaet pruefen

- setup-state Version und Migrationslogik bei neuen Feldern absichern.

7. Tests ausfuehren

- Fresh Run, Abort/Resume, Re-Run, docker compose config.

8. Dokumentation aktualisieren

- Neuer Stack, bekannte Grenzen und Beispielkonfiguration ergaenzen.

## 7. Empfohlener Technologie-Stack fuer Release 1.0

1. commander fuer CLI-Parsing.
2. @clack/prompts fuer interaktive Nutzerfuehrung.
3. execa fuer robuste Prozessausfuehrung.
4. zod fuer Konfigurationsvalidierung.
5. pino fuer strukturiertes Logging.
6. fs-extra fuer Dateisystemoperationen.

## 8. Qualitaetskriterien und Abnahme

1. Projekte koennen non-interaktiv erstellt werden.
2. Unterbrochene Runs setzen korrekt fort.
3. Wiederholte Runs verursachen keine schaedlichen Doppeleffekte.
4. Fehler sind im State und im Log nachvollziehbar.
5. Docker Compose Konfiguration ist nach Generierung validierbar.
6. Neue Frameworks lassen sich nach dem Erweiterungs-Workflow integrieren.

## 9. Umsetzung in 7 Startschritten

1. CLI-Grundgeruest aufsetzen.
2. Prompt-Flow und Konfigurationsmodell implementieren.
3. Step-Registry fuer Basisstacks anlegen.
4. setup-state schreiben und Resume aktivieren.
5. Dockerfile- und Compose-Templating integrieren.
6. Validierung und Logging vervollstaendigen.
7. End-to-End Tests fuer alle Kernfaelle durchfuehren.

---

Dokumentname: Methoden-Dokumentation-Node-CLI-Setup.md

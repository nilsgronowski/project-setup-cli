# UML Komponentendiagramm - Sollkonzept

## Architektur-Übersicht

Das Komponentendiagramm zeigt die Struktur der CLI-Anwendung basierend dem Soll-Konzept mit drei Hauptschichten:

### 1. **Presentation Layer** (Benutzerinteraktion)

- **CLI Entry Point** (oclif): Einstiegspunkt der Anwendung
- **Configuration Wizard** (@clack/prompts): Interaktive Benutzerführung

### 2. **Business Logic Layer** (Verarbeitung)

- **Configuration Module**: Validierung und Schema-Verwaltung
- **Template Engine** (EJS): Template-Rendering für Projektdateien
- **Project Generator**: Orchestrierung der Projektgenerierung

### 3. **Infrastructure Layer** (Ausführung)

- **Container Module** (podman-compose): Container-Management
- **File System** (fs/promises): Dateisystem-Operationen
- **Automation Module** (execa): Script-Ausführung

### 4. **External Services** (Externe Abhängigkeiten)

- **Podman Runtime**: Container-Virtualisierung
- **File System**: Persistente Speicherung
- **Terminal/Console**: Benutzer-Ausgabe

## Datenfluss

```
1. User Input
   └─> CLI Entry Point
       └─> Configuration Wizard
           └─> Configuration Module (Validierung)
               └─> Project Generator
                   ├─> Template Engine (Dateien generieren)
                   ├─> File System (Speichern)
                   ├─> Container Module (Container konfigurieren)
                   └─> Automation Module (Scripts ausführen)
```

## Schnittstellen

| Von             | Nach            | Daten              | Format               |
| --------------- | --------------- | ------------------ | -------------------- |
| CLI             | Wizard          | Nutzerinteraktion  | Parameter            |
| Wizard          | ConfigModule    | Eingaben           | JSON-Objekt          |
| ConfigModule    | ProjectGen      | Validierte Config  | Konfigurationsobjekt |
| ProjectGen      | TemplateEngine  | Template-Daten     | Datenpfade           |
| ProjectGen      | FileSystem      | Projektstruktur    | Pfade/Dateien        |
| ProjectGen      | ContainerModule | Container-Config   | YAML                 |
| ProjectGen      | Automation      | Befehle            | Shell-Scripts        |
| TemplateEngine  | FileSystem      | Generierte Dateien | Textdateien          |
| ContainerModule | Podman          | Container-Commands | CLI-Parameter        |
| Automation      | Terminal        | Skript-Output      | Logs                 |

## Konfigurationsobjekt (Datenschema)

```json
{
  "projectName": "string",
  "projectType": "string", // z.B. "fullstack"
  "frontend": {
    "framework": "string", // z.B. "React", "Vue"
    "port": "number"
  },
  "backend": {
    "framework": "string", // z.B. "Node.js", "Python"
    "port": "number"
  },
  "database": {
    "type": "string", // z.B. "PostgreSQL", "MongoDB"
    "port": "number"
  },
  "containerConfig": {
    "baseImage": "string",
    "ports": "object"
  }
}
```

## Externe Abhängigkeiten

- **Framework**: oclif (CLI Framework)
- **UI-Library**: @clack/prompts (Terminal UI)
- **Template-Engine**: EJS
- **Container-Tool**: podman & podman-compose
- **Script-Execution**: execa
- **File-Operations**: Node.js fs/promises API

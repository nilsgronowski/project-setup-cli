# Nutzwertanalyse Technologieauswahl fuer den CLI-Prototyp

Version: 1.0  
Stand: 27.03.2026  
Status: Entscheidungsgrundlage fuer Prototypumfang

## 1. Ziel

Diese Nutzwertanalyse bewertet, welche Technologien im Prototyp des CLI-Tools priorisiert unterstuetzt werden sollen.

Bewertet werden vier Kategorien:

1. Frontend-Frameworks
2. Backend-Frameworks
3. SQL-Datenbanken
4. NoSQL-Datenbanken

Ergebnisziel:

1. Zwei Frontend-Frameworks fuer den Prototyp
2. Zwei Backend-Frameworks fuer den Prototyp
3. Eine SQL-Datenbank als Standardoption
4. Eine NoSQL-Datenbank als Standardoption

## 2. Bewertungsmethode

Skala je Kriterium:

1. 1 = unguenstig
2. 2 = eher unguenstig
3. 3 = neutral/ausreichend
4. 4 = gut
5. 5 = sehr gut

Berechnung:
Gesamtwert = Summe aus (Gewicht x Punktzahl).  
Maximalwert pro Kategorie = 500 Punkte (bei 100 Gesamtgewicht und 5 Punkten je Kriterium).

Hinweis:
Die Gewichtung ist auf die Ziele eines automatisierten CLI-Prototyps ausgerichtet: schnelle Integration, robuste Automatisierung, gute Developer Experience und Containerfaehigkeit.

## 3. Frontend-Frameworks (6 Optionen)

### 3.1 Gewichtung

1. CLI-Automatisierbarkeit (Scaffolding, Non-Interactive): 25
2. Lernkurve und Teamproduktivitaet: 15
3. Oekosystem und Community: 20
4. Docker-Build und Deployment-Einfachheit: 15
5. Laufzeitperformance: 10
6. Wartbarkeit und Strukturierung: 15

### 3.2 Bewertungsmatrix

| Option  | CLI Auto 25 | Lernkurve 15 | Oekosystem 20 | Docker 15 | Performance 10 | Wartbarkeit 15 | Gesamt |
| ------- | ----------: | -----------: | ------------: | --------: | -------------: | -------------: | -----: |
| React   |           5 |            4 |             5 |         5 |              4 |              4 |    460 |
| Vue     |           4 |            5 |             4 |         5 |              4 |              4 |    430 |
| Angular |           4 |            3 |             4 |         4 |              3 |              5 |    390 |
| Svelte  |           4 |            4 |             3 |         5 |              5 |              3 |    390 |
| Next.js |           4 |            3 |             5 |         3 |              4 |              4 |    390 |
| SolidJS |           3 |            3 |             2 |         4 |              5 |              3 |    315 |

### 3.3 Ergebnis Frontend

Rangfolge:

1. React (460)
2. Vue (430)
3. Angular/Svelte/Next.js (je 390)

Empfehlung fuer den Prototyp:

1. React
2. Vue

Begruendung:
Hohe Automatisierbarkeit, breite Community-Unterstuetzung und sehr gutes Verhaeltnis aus Umsetzungsaufwand und Zukunftssicherheit.

## 4. Backend-Frameworks (6 Optionen)

### 4.1 Gewichtung

1. CLI-Automatisierbarkeit (Projektstart, Standardstruktur): 20
2. Entwicklerproduktivitaet: 20
3. Performance und Skalierbarkeit: 20
4. Oekosystem und Bibliotheken: 15
5. Lernkurve: 10
6. Docker/Operations-Fit: 15

### 4.2 Bewertungsmatrix

| Option      | CLI Auto 20 | Produktivitaet 20 | Performance 20 | Oekosystem 15 | Lernkurve 10 | Docker Fit 15 | Gesamt |
| ----------- | ----------: | ----------------: | -------------: | ------------: | -----------: | ------------: | -----: |
| Express     |           5 |                 4 |              3 |             5 |            5 |             5 |    440 |
| Django      |           4 |                 5 |              3 |             5 |            4 |             5 |    430 |
| Fastify     |           4 |                 4 |              5 |             3 |            4 |             5 |    420 |
| FastAPI     |           4 |                 5 |              4 |             4 |            4 |             4 |    420 |
| NestJS      |           4 |                 4 |              4 |             4 |            3 |             5 |    405 |
| Spring Boot |           3 |                 3 |              4 |             5 |            2 |             3 |    340 |

### 4.3 Ergebnis Backend

Rangfolge:

1. Express (440)
2. Django (430)
3. Fastify/FastAPI (je 420)

Empfehlung fuer den Prototyp:

1. Express
2. Django

Begruendung:
Express deckt den schnellen Node.js-Pfad sehr gut ab; Django ergaenzt als starkes Python-Framework mit hoher Produktivitaet und klarer Containerisierung.

## 5. SQL-Datenbanken (6 Optionen)

### 5.1 Gewichtung

1. Einfachheit im Local Setup: 20
2. Docker-Compose-Fit: 20
3. Feature-Tiefe (ACID, Migrationsfaehigkeit): 20
4. Performance und Wachstumspfad: 15
5. Oekosystem und ORM-Unterstuetzung: 15
6. Betriebsaufwand (je hoeher, desto einfacher): 10

### 5.2 Bewertungsmatrix

| Option        | Local Setup 20 | Docker Fit 20 | Features 20 | Performance 15 | Oekosystem 15 | Ops 10 | Gesamt |
| ------------- | -------------: | ------------: | ----------: | -------------: | ------------: | -----: | -----: |
| PostgreSQL    |              4 |             5 |           5 |              4 |             5 |      4 |    455 |
| MySQL         |              4 |             5 |           4 |              4 |             5 |      4 |    435 |
| MariaDB       |              4 |             5 |           4 |              4 |             4 |      4 |    420 |
| SQLite        |              5 |             5 |           2 |              2 |             4 |      5 |    380 |
| MS SQL Server |              3 |             4 |           5 |              4 |             4 |      2 |    380 |
| CockroachDB   |              2 |             3 |           5 |              5 |             3 |      2 |    340 |

### 5.3 Ergebnis SQL

Rangfolge:

1. PostgreSQL (455)
2. MySQL (435)
3. MariaDB (420)

Empfehlung fuer den Prototyp:

1. PostgreSQL

Begruendung:
Bestes Gesamtpaket aus Funktionstiefe, Docker-Eignung, Community, Stabilitaet und spaeterer Skalierbarkeit.

## 6. NoSQL-Datenbanken (6 Optionen)

### 6.1 Gewichtung

1. Use-Case-Fit fuer Web/CLI-Prototypen: 20
2. Local-Setup-Einfachheit: 20
3. Docker-Compose-Fit: 15
4. Datenmodellierungs- und Query-Flexibilitaet: 15
5. Treiber/Oekosystem-Unterstuetzung: 15
6. Betriebsaufwand (je hoeher, desto einfacher): 15

### 6.2 Bewertungsmatrix

| Option         | Use-Case 20 | Local Setup 20 | Docker Fit 15 | Flexibilitaet 15 | Oekosystem 15 | Ops 15 | Gesamt |
| -------------- | ----------: | -------------: | ------------: | ---------------: | ------------: | -----: | -----: |
| MongoDB        |           5 |              4 |             5 |                4 |             5 |      4 |    450 |
| Redis          |           3 |              5 |             5 |                2 |             5 |      4 |    400 |
| DynamoDB Local |           4 |              3 |             4 |                3 |             4 |      3 |    350 |
| Neo4j          |           3 |              3 |             4 |                4 |             3 |      3 |    330 |
| CouchDB        |           3 |              3 |             4 |                3 |             3 |      3 |    315 |
| Cassandra      |           3 |              2 |             3 |                4 |             3 |      1 |    265 |

### 6.3 Ergebnis NoSQL

Rangfolge:

1. MongoDB (450)
2. Redis (400)
3. DynamoDB Local (350)

Empfehlung fuer den Prototyp:

1. MongoDB

Begruendung:
Sehr gute Balance aus Setup-Einfachheit, Flexibilitaet, Docker-Fit und breiter Unterstuetzung in JavaScript- und Python-Oekosystemen.

## 7. Endgueltige Technologieauswahl fuer den Prototyp

Frontend (2):

1. React
2. Vue

Backend (2):

1. Express
2. Django

Datenbanken:

1. SQL: PostgreSQL
2. NoSQL: MongoDB

## 8. Auswirkungen auf dein CLI-Design

Um diese Auswahl umzusetzen, sollte das CLI folgende Module enthalten:

1. Framework-Selection-Prompts fuer 2 Frontend- und 2 Backend-Optionen.
2. Workflow-Registry-Eintraege je ausgewaehlter Technologie.
3. Dockerfile-Templates fuer React, Vue, Express und Django.
4. Compose-Service-Templates fuer PostgreSQL und MongoDB.
5. Validierungsregeln fuer erlaubte Stack-Kombinationen.

## 9. Risiken und Gegenmassnahmen

1. Risiko: Zu fruehe Festlegung auf wenige Technologien.
   Gegenmassnahme: Erweiterungsworkflow vorsehen und neue Optionen als Plugins/Registry-Eintraege integrieren.

2. Risiko: Bewertungsbias durch aktuelle Teamkenntnisse.
   Gegenmassnahme: Gewichtung transparent halten und quartalsweise neu bewerten.

3. Risiko: Unterschiede zwischen lokaler und produktiver Umgebung.
   Gegenmassnahme: Standardisierte Docker- und Compose-Validierung im CLI-Lauf.

## 10. Empfehlung fuer die naechste Iteration

1. Diese Matrix als Baseline fuer Sprint 1 fixieren.
2. Nach dem ersten End-to-End Prototyp Laufzeitdaten sammeln.
3. Werte fuer Produktivitaet und Ops-Aufwand mit realen Messdaten nachschaerfen.
4. Entscheidung in Version 1.1 mit empirischen Ergebnissen aktualisieren.

---

## Gesamtuebersicht aller Bewertungen

| Kategorie       | Option         | Gesamt | Empfohlen |
| --------------- | -------------- | -----: | :-------: |
| Frontend        | React          |    460 |     ✓     |
| Frontend        | Vue            |    430 |     ✓     |
| Frontend        | Angular        |    390 |           |
| Frontend        | Svelte         |    390 |           |
| Frontend        | Next.js        |    390 |           |
| Frontend        | SolidJS        |    315 |           |
| Backend         | Express        |    440 |     ✓     |
| Backend         | Django         |    430 |     ✓     |
| Backend         | Fastify        |    420 |           |
| Backend         | FastAPI        |    420 |           |
| Backend         | NestJS         |    405 |           |
| Backend         | Spring Boot    |    340 |           |
| SQL-Datenbank   | PostgreSQL     |    455 |     ✓     |
| SQL-Datenbank   | MySQL          |    435 |           |
| SQL-Datenbank   | MariaDB        |    420 |           |
| SQL-Datenbank   | SQLite         |    380 |           |
| SQL-Datenbank   | MS SQL Server  |    380 |           |
| SQL-Datenbank   | CockroachDB    |    340 |           |
| NoSQL-Datenbank | MongoDB        |    450 |     ✓     |
| NoSQL-Datenbank | Redis          |    400 |           |
| NoSQL-Datenbank | DynamoDB Local |    350 |           |
| NoSQL-Datenbank | Neo4j          |    330 |           |
| NoSQL-Datenbank | CouchDB        |    315 |           |
| NoSQL-Datenbank | Cassandra      |    265 |           |

Maximalpunktzahl je Kategorie: 500 Punkte. Die Detailkriterien und Gewichtungen je Kategorie sind in den Abschnitten 3–6 dokumentiert.

Dateiname: Nutzwertanalyse-Technologieauswahl-Prototyp.md

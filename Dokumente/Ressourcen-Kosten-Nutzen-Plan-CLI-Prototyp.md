# Ressourcen-, Kosten- und Nutzenplan fuer den CLI-Prototyp

Version: 1.0  
Stand: 27.03.2026  
Status: Planungs- und Entscheidungsdokument

## 1. Ziel des Dokuments

Dieses Dokument beschreibt:

1. den Ressourcenplan fuer ein auf 80 Stunden begrenztes Projekt,
2. den Kostenplan bei ausschliesslich Personalkosten,
3. den monetaren und nicht-monetaren Nutzen,
4. eine Kosten-Nutzen-Pruefung als Entscheidungsgrundlage.

## 2. Projektgrenzen und Annahmen

Rahmenbedingungen:

1. Gesamtbudget in Zeit: 80 Stunden.
2. Keine Sachkosten, Lizenzkosten oder Infrastrukturkosten im Projektbudget.
3. Kostenart: ausschliesslich Personalkosten.
4. Ergebnis: funktionsfaehiger CLI-Prototyp mit ausgewaehlten Technologie-Workflows.

Wesentliche Annahmen fuer die Wirtschaftlichkeitsrechnung:

1. Interner Stundensatz (Basisszenario): 45 EUR/h.
2. Nutzungszeitraum der Bewertung: 12 Monate nach Prototyp-Fertigstellung.
3. Nutzen entsteht vor allem durch Zeitersparnis und Standardisierung bei Projekt-Setups.

Hinweis:
Alle finanziellen Werte sind planungsorientierte Schaetzwerte und koennen mit deinen realen Stundensaetzen und Nutzungszahlen direkt neu berechnet werden.

## 3. Ressourcenplan (80 Stunden)

### 3.1 Teilprojekte und Stundenverteilung

| Arbeitspaket                    | Inhalt                                               | Stunden |
| ------------------------------- | ---------------------------------------------------- | ------: |
| 1 Analyse- und Definitionsphase | Ziele, Scope, Anforderungen, Abgrenzung              |      10 |
| 2 Planungs- und Entwurfsphase   | Architektur, Workflow-Design, Datenmodell, Metriken  |      12 |
| 3 Implementierung               | CLI-Logik, Workflows, Templates, Compose-Generierung |      30 |
| 4 Testphase                     | End-to-End Tests, Fehlerfaelle, Resume-Tests         |      10 |
| 5 Dokumentation                 | Technische Doku, Nutzwertanalyse, Bedienhinweise     |       8 |
| 6 Projektabschluss              | Review, Korrekturen, Abgabevorbereitung              |       5 |
| 7 Puffer                        | Risiko- und Aenderungsreserve                        |       5 |
| **Summe**                       |                                                      |  **80** |

### 3.2 Meilensteine

1. M1 (10h): Analyse und Definition abgeschlossen.
2. M2 (22h): Planung und Entwurf abgeschlossen.
3. M3 (52h): Implementierung in Kernfunktionen abgeschlossen.
4. M4 (62h): Testphase abgeschlossen.
5. M5 (75h): Dokumentation und Projektabschluss abgeschlossen.
6. M6 (80h): Pufferverbrauch und finale Abgabe abgeschlossen.

### 3.3 Kapazitaetsplanung (Beispiel)

Bei 20 Stunden pro Woche:

1. Woche 1: 20h
2. Woche 2: 20h
3. Woche 3: 20h
4. Woche 4: 20h

## 4. Kostenplan (nur Personalkosten)

### 4.1 Basiskalkulation

Formel:
Gesamtkosten = Projektstunden x Stundensatz

Basisszenario:
80h x 45 EUR/h = 3.600 EUR

### 4.2 Sensitivitaet nach Stundensatz

| Stundensatz | Kosten bei 80h |
| ----------: | -------------: |
|    35 EUR/h |      2.800 EUR |
|    45 EUR/h |      3.600 EUR |
|    70 EUR/h |      5.600 EUR |

## 5. Monetarer Nutzen

Der monetare Nutzen entsteht durch reduzierte Setup-Zeit, weniger Wiederholungsfehler und schnellere Standardisierung.

### 5.1 Nutzenquellen

1. Zeitersparnis je neuem Projektsetup.
2. Reduktion von Fehlerkorrekturen nach inkonsistenten Setups.
3. Schnellere Einarbeitung durch standardisierte Projektstruktur.

### 5.2 Berechnungsmodell

Monetarer Jahresnutzen = (Zeitersparnis je Setup in Stunden) x (Anzahl Setups pro Monat) x 12 x (Stundensatz)

### 5.3 Szenarien (12 Monate, 45 EUR/h)

| Szenario     | Zeitersparnis je Setup | Setups pro Monat | Jahresnutzen |
| ------------ | ---------------------: | ---------------: | -----------: |
| Konservativ  |                   1,0h |                4 |    2.160 EUR |
| Realistisch  |                   2,0h |                8 |    8.640 EUR |
| Ambitioniert |                   3,0h |               10 |   16.200 EUR |

## 6. Nicht-monetarer Nutzen

Nicht-monetare Effekte sind fuer den Prototyp besonders relevant, da sie Qualitaet, Skalierbarkeit und Teamwirksamkeit verbessern.

### 6.1 Nutzenkategorien

1. Standardisierung und Governance

- Konsistente Projektstruktur und reproduzierbare Setups.

2. Qualitaetssteigerung

- Weniger manuelle Abweichungen und geringere Fehleranfaelligkeit.

3. Wissenssicherung

- Implizites Setup-Wissen wird explizit in Workflows und Templates dokumentiert.

4. Teamproduktivitaet

- Schnellere Einarbeitung neuer Teammitglieder.

5. Technische Erweiterbarkeit

- Neue Frameworks koennen strukturiert ueber Workflow-Registry und Templates ergaenzt werden.

### 6.2 Qualitative Bewertung (Nutzwert 1-5)

| Kriterium               | Bewertung |
| ----------------------- | --------: |
| Standardisierung        |         5 |
| Fehlerreduktion         |         4 |
| Wissenstransfer         |         4 |
| Team-Onboarding         |         4 |
| Erweiterbarkeit         |         5 |
| **Gesamteinschaetzung** |  **hoch** |

## 7. Kosten-Nutzen-Pruefung

### 7.1 Kennzahlen

1. Return on Investment (ROI)
   Formel: ROI = (Nutzen - Kosten) / Kosten

2. Payback-Zeit
   Formel: Payback in Monaten = Kosten / monatlicher Nutzen

### 7.2 Ergebnis je Szenario (Kosten = 3.600 EUR)

| Szenario     | Jahresnutzen | ROI (12 Monate) |     Payback |
| ------------ | -----------: | --------------: | ----------: |
| Konservativ  |    2.160 EUR |            -40% | 20,0 Monate |
| Realistisch  |    8.640 EUR |            140% |  5,0 Monate |
| Ambitioniert |   16.200 EUR |            350% |  2,7 Monate |

### 7.3 Interpretation

1. Im konservativen Szenario amortisiert sich der Prototyp innerhalb von 12 Monaten nicht vollstaendig.
2. Im realistischen Szenario ist die Wirtschaftlichkeit klar positiv.
3. Im ambitionierten Szenario ist der Nutzen sehr deutlich hoeher als die Entwicklungskosten.
4. Aufgrund der starken nicht-monetaren Effekte ist bereits bei mittlerer Nutzung ein strategischer Mehrwert gegeben.

## 8. Entscheidungsempfehlung

Empfehlung: Umsetzung des Prototyps ist wirtschaftlich sinnvoll, wenn mindestens das realistische Nutzungsszenario erreicht wird.

Mindestbedingungen fuer einen Go-Entscheid:

1. Mindestens 8 Setups pro Monat im Zielteam oder in mehreren Projekten.
2. Durchschnittliche Zeitersparnis mindestens 2 Stunden pro Setup.
3. Kontinuierliche Pflege der Workflow- und Docker-Templates.

## 9. Nachverfolgung nach Projektabschluss

Zur Validierung der Planung sollten ab Go-Live monatlich folgende KPIs erhoben werden:

1. Anzahl generierter Projekte pro Monat.
2. Durchschnittliche Setup-Dauer vorher/nachher.
3. Fehlerquote bei Erststart der generierten Projekte.
4. Anteil erfolgreicher Docker-Compose Starts beim ersten Versuch.
5. Anzahl notwendiger manueller Nacharbeiten pro Projekt.

## 10. Kurzfazit

Bei einem reinen Personalkostenprojekt mit 80 Stunden liegt der Kostenblock im Basisszenario bei 3.600 EUR.  
Bereits bei realistischer Nutzung wird ein klar positiver monetarer Nutzen erzielt.  
Zusammen mit den nicht-monetaren Effekten (Standardisierung, Qualitaet, Erweiterbarkeit) ist der Prototyp aus wirtschaftlicher und technischer Sicht nachvollziehbar begruendet.

---

Dateiname: Ressourcen-Kosten-Nutzen-Plan-CLI-Prototyp.md

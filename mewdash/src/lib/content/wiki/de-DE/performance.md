---
title: Leistung
slug: performance
summary: Eine Dashboard-Seite nur für Bot-Owner mit CPU, Speicher, Laufzeit, den langsamsten Methoden sowie der Anzahl der Discord-Ereignisse, die jedes Modul verarbeitet und dabei fehlschlägt.
icon: fa-clock
category: Analytics
dashboard: /owner/performance
tags: [performance, metrics, cpu, memory, latency, monitoring, uptime, events, modules, owner, Leistung, Metriken, Speicher, Latenz, Überwachung, Laufzeit, Ereignisse, Module, Owner]
related: [analytics, leave-feedback, administration]
---

## Was es macht

Leistung ist eine Überwachungsseite für alle, die den Bot betreiben. Sie ist nur für Bot-Owner sichtbar: Die Seitenleiste blendet sie für alle anderen aus, und wer die URL direkt aufruft, wird zurück zur Startseite des Dashboards geschickt. Hier gibt es nichts für das Team des Servers einzurichten.

Die Seite liest Live-Werte aus dem laufenden Bot-Prozess. Ein Tab zeigt die Systemressourcen, einer listet die Methoden mit der meisten CPU-Zeit, und zwei schlüsseln die Verarbeitung von Discord-Ereignissen nach Ereignistyp und nach Bot-Modul auf, jeweils mit Anzahl, durchschnittlicher Ausführungszeit und Fehlerrate. Alles aktualisiert sich selbstständig, solange die Seite geöffnet ist.

Die Ereignis- und Modulwerte stammen vom internen Ereignis-Handler des Bots, der jedes Gateway-Ereignis erfasst, das er verteilt. Die Zeitmessungen der Methoden stammen vom Leistungsmonitor, der die überwachten Methoden umschließt. Beides wird nur im Arbeitsspeicher gehalten und daher bei jedem Neustart des Bots zurückgesetzt; die Ereignismetriken setzen sich außerdem jede Stunde selbst zurück. Für die gespeicherte Historie derselben Werte verwende [Analysen](/wiki/analytics).

## Wofür du es nutzen kannst

- Der Bot fühlt sich träge an, und du willst sehen, ob CPU, Speicher oder eine langsame Methode schuld ist.
- Ein Modul wirft Fehler, und du willst die Fehlerrate pro Modul sehen, ohne Logs zu lesen.
- Du willst nach einem Deployment über ein paar Minuten bestätigen, dass der Speicher stabil bleibt.
- Du brauchst die Laufzeit und die Thread-Anzahl für eine Support-Anfrage.

## Tabs

| Tab | Abschnitt | Was er zeigt | Aktualisierung |
| --- | --- | --- | --- |
| Übersicht | Systemressourcen | **CPU-Auslastung**, **Speicherauslastung** (genutzt und gesamt), **Laufzeit**, **Thread-Anzahl** und **CPU-intensivste Methoden** mit ihrer Durchschnittszeit | Alle 5 Sekunden |
| Methoden | Methodenleistung | Jede überwachte Methode mit **Aufrufe**, **Ø Zeit**, **Gesamtzeit** und **Zuletzt ausgeführt**; sortierbar nach jeder Spalte, mit einem Button, der die gesammelten Daten leert | Alle 30 Sekunden |
| Ereignisse | Ereignismetriken | **Ereignisse gesamt**, **Fehler gesamt**, **Ereignistypen** und **Ø Fehlerrate**, darunter jeder Discord-Ereignistyp mit verarbeiteter Anzahl, Fehlern, Ausführungszeit und Fehlerrate | Alle 10 Sekunden |
| Module | Modulmetriken | **Aktive Module**, **Ereignisse gesamt**, **Fehler gesamt** und **Ø Fehlerrate**, darunter jedes Modul mit verarbeiteten Ereignissen, Fehlern, Ausführungszeit und Fehlerrate | Alle 10 Sekunden |

Die CPU-Auslastung wird bei jeder Aktualisierung der Übersicht über eine halbe Sekunde gemessen und betrifft nur den Bot-Prozess, nicht die ganze Maschine. Der Speicher ist der Working Set des Prozesses. Der Gesamtspeicher wird unter Windows und Linux vom Host ausgelesen und wird anderswo als 0 angezeigt.

> [!NOTE]
> Der Methoden-Tab ist leer, solange keine überwachten Methoden gelaufen sind. Lass den Bot eine Weile laufen und schau dann wieder vorbei.

## Einstellungen

Es gibt keine Einstellungen. Die einzige Aktion ist der Leeren-Button im Methoden-Tab, der die Zeitmessungen der Methoden löscht. Ereignis- und Modulmetriken lassen sich nicht von Hand leeren; sie werden stündlich zurückgesetzt.

## Einrichtung Schritt für Schritt

1. Melde dich mit einem Bot-Owner-Konto im Dashboard an.
2. Öffne **Leistung** aus der Seitenleiste. Sie erscheint nur für Owner.
3. Lass die **Übersicht** eine Minute offen, damit du siehst, wie sich CPU und Speicher einpendeln.
4. Wechsle zu **Modul** und sortiere nach Fehlern, um Auffälligkeiten zu finden, dann zu **Ereignisse**, um zu sehen, welche Ereignistypen am meisten Last erzeugen.
5. Nutze **Methoden**, um langsame Methoden zu finden, und leere den Tab nach einer Korrektur, um erneut zu messen.

## Befehle

Die Seite Leistung gibt es nur im Dashboard; ein passendes Bot-Modul existiert nicht. Ein paar Owner-Befehle decken verwandte Bereiche im Chat ab. Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `stats` | | Niemand | Bot-Version, ausgeführte Befehle pro fünf Sekunden, Speicher, Cache-Zähler, Shard und Laufzeit |
| `commandstats` | `cstats` | Bot-Owner | Meistgenutzter Befehl, Modul, Server und Nutzer |
| `shardstats` | | Bot-Owner | Status jedes Shards |

## Tipps und Stolperfallen

- Die Seite prüft die Berechtigung über den Bot. Ein Konto, das auf einer Bot-Instanz Owner ist, auf einer anderen aber nicht, wird auf der zweiten zurückgeleitet.
- Die Werte gelten pro Prozess. Bei einem geshardeten Bot, der auf mehrere Prozesse verteilt läuft, siehst du nur den Prozess, mit dem das Dashboard verbunden ist.
- Auf dieser Seite wird nichts gespeichert. Brauchst du eine Historie, notiere dir die Werte oder mach Screenshots.
- Eine hohe Fehlerrate bei einem Ereignistyp weist meist auf ein Modul hin, das auf dieses Ereignis hört. Prüfe als Nächstes den Tab Module.

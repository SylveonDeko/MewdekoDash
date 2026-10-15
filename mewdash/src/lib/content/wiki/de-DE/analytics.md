---
title: Analysen
slug: analytics
summary: Eine Dashboard-Seite nur für Bot-Owner mit gespeichertem Verlauf zu Befehlen, Gateway-Events, Latenz, Fehlern, Serverwachstum, Funktionsnutzung, KI- und Musiknutzung, Website-Traffic und Webhook-Alarmregeln.
icon: fa-chart-simple
category: Analytics
dashboard: /owner/analytics
tags: [analytics, metrics, telemetry, commands, events, latency, errors, growth, alerts, shards, owner, Analysen, Metriken, Telemetrie, Befehle, Ereignisse, Latenz, Fehler, Wachstum, Warnmeldungen, Alarme, Owner]
related: [performance, leave-feedback, administration]
---

## Was es macht

Analysen ist die Verlaufsseite für alle, die den Bot betreiben. Sie ist nur für Bot-Owner sichtbar: Die Seitenleiste blendet sie für alle anderen aus, und das direkte Öffnen der URL schickt Nicht-Owner zurück zur Startseite des Dashboards. Hier gibt es nichts, was das Server-Team konfigurieren müsste.

Während [Leistung](/wiki/performance) den laufenden Prozess zeigt und bei einem Neustart alles vergisst, liest Analysen, was der Bot in seine eigene Datenbank geschrieben hat. Jede laufende Instanz erfasst Befehle, Gateway-Events, Shard-Latenz, REST-Aufrufe, Datenbank-Laufzeiten, Prozess-Messwerte, Ausnahmen, Funktionsnutzung, KI- und Musikaktivität sowie Dashboard-Seitenaufrufe. Die Zahlen werden pro Minute im Speicher aggregiert, jede Minute geschrieben, in 5-Minuten- und Stunden-Intervalle zusammengefasst und nach einem festen Zeitplan bereinigt, sodass du dir die letzte Woche ansehen, sie mit der Woche davor vergleichen und nach Instanz, Shard oder Server filtern kannst.

Ein wöchentlicher Digest kann an einen Discord-Webhook gepostet werden, und Alarmregeln auf jeder gespeicherten Metrik benachrichtigen einen Webhook, wenn ein Schwellenwert überschritten wird.

## Wofür du es brauchst

- Du willst wissen, ob ein Fehleranstieg vor oder nach einem Deploy begann, nicht nur, was gerade fehlschlägt.
- Ein Server meldet, dass der Bot langsam ist, und du willst Befehlslatenz, Aktivität und Sicherheitsevents für einen Zeitraum sehen.
- Du willst sehen, welche Funktionen Server tatsächlich konfigurieren und nutzen und wie sich das über Monate geändert hat.
- Du brauchst einen Discord-Ping, wenn Shard-Latenz, Fehlerrate oder REST-429er eine Grenze überschreiten, ohne eine Seite beobachten zu müssen.
- Du willst eine Montagszusammenfassung zu Wachstum, Befehlen, Fehlern und Top-Funktionen in einem Kanal.

## Tabs

| Tab | Was er zeigt |
| --- | --- |
| Übersicht | Kacheln für **Server**, **Nutzer**, **Befehle / Min.**, **Gateway-Events**, **REST-Anfr. / s**, **Unbehandelte Fehler** (führt zu Ausnahmegruppen), **Schlechteste Shard-Latenz** und **Musik-Player**; Shard-Latenz mit Alarmbändern; aktuell ausgelöste Alarme; Befehle und Gateway-Events pro Sekunde nach Art und Typ; tägliche Server-Snapshots; REST-Rate; Prozessspeicher |
| Befehle | Auswahlen für Art, Modul und Ergebnis; **Aufrufe**, **Fehler**, **Dauer p95** und **p50**; Aufrufe nach Modul; Fehler nach Klasse; Dauer p50, p95, p99; Aufrufe nach Art; eine Heatmap UTC-Stunde × Servergröße; **Top-Befehle**, ein seitenweises **Aufrufprotokoll**, **Am häufigsten fehlschlagende Befehle**, wobei eine Zeile ihre letzten Fehler-Stichproben öffnet |
| Ereignisse | Gateway-Events pro Sekunde nach Typ; Anzahl im Zeitraum und eine Tabelle pro Typ; Events pro Shard; Handler p95 nach Typ; Handler-Fehler nach Modul und nach Event-Typ |
| Latenz | **REST p95**, **REST 5xx**, **REST 429**, **Ratelimit-Treffer**, **DB p95**, **DB-Fehler**, **Shard-Neuverbindungen**, **Unbehandelte Fehler**; REST-Latenz und -Rate nach Route; Rate-Limit-Treffer nach Route; Datenbank p95 und Fehler nach Operation; CPU, RSS, Threads und Gen-2-GCs; eine Tabelle pro Shard mit Status, Latenz, Spitze, Servern und Neuverbindungen; unbehandelte Ausnahmegruppen, wobei eine Zeile ihre Vorkommen öffnet; Fehler nach Typ |
| Server | **Server**, **Nutzer**, **Beigetreten**, **Verlassen**, **Netto**; 30-Tage-Snapshots von Servern und Nutzern; Beitritte und Abgänge pro Tag; Abwanderung mit Absprungrate und Beitritte und Abgänge nach Größe; Bindung nach Beitrittstag; Beitritte nach Größe; Tabellen **Abgesprungene Server** und **Verstummt**, wobei eine Zeile die Serverkarte öffnet |
| Server (Einzelansicht) | Auswahl der Event-Art und eine Mindestanzahl Events pro Stunde; eine Server-ID öffnet die **Serverkarte**, eine Heatmap Aktivität nach Typ und Stunde und ein seitenweises, filterbares Protokoll der **Sicherheitsevents**; **Top-Server nach Events**; **Ungewöhnliche Aktivität**, bewertet gegen dieselbe Stunde der vorherigen 14 Tage |
| Funktionen | **Feature-Verbreitung** mit Zahlen zu konfiguriert und aktiviert aus dem nächtlichen Zensus, aktiven Servern, Aktivität und Fehlerrate; Funktionen pro Server; Servergröße gegen genutzte Funktionen; für die gewählte Funktion die **Einstellungsnutzung** aus dem neuesten Zensus und eine Zensus-Reihe für konfiguriert oder aktiviert über 90, 180 oder 365 Tage |
| KI | **Anfragen**, **Tokens ein**, **Tokens aus**, **Gesch. Kosten** zu Listenpreisen für Modelle mit Preis; eine Tabelle pro Modell mit Fehlschlägen, Tokens, p95 und Kosten; Anfragen, Tokens und p95 nach Modell; Top-Server nach KI-Chat-Nutzung |
| Musik | **Spieler**, **Gestartete Tracks**, **Fehler**; Player nach Node; gestartete Tracks nach Quelle; Fehler nach Art; Node-Status; beendete Tracks nach Grund |
| Website | **Seitenaufrufe**, **Besucher**, **Anfrage p95**, **5xx**; Aufrufe nach Route; Anfragedauer; eine Tabelle pro Route mit Besuchern, p95 und 5xx; 4xx und 5xx nach Route; ein Login-Funnel von Login über OAuth-Callback bis Dashboard mit Absprüngen |
| Warnmeldungen | Ausgelöste Gruppen; die Regeltabelle mit Aktivieren, Testen, 1 Stunde stummschalten und Löschen; ein seitenweises Ereignisprotokoll der Statusübergänge mit dem Wert gegen den Schwellenwert und ob ein Webhook gesendet wurde; **Neue Regel** und **Digest jetzt senden** |
| Pipeline | Eine Status-Pille; **Letzter Flush**, **Letzter Rollup**, **Letzte Wartung**, **Ausstehende Reihen**, **Ausstehende Zeilen**; der letzte Flush-Fehler, falls vorhanden; Zeilenzahlen und neueste Zeile pro Tabelle; registrierte Instanzen mit Heartbeat und letzter Serveranzahl; Flush-Dauer und Zeilen pro Flush |

Der Pipeline-Status ist `healthy`, wenn der letzte Flush höchstens 60 Sekunden alt ist, der letzte Rollup höchstens 10 Minuten alt ist und es keinen Flush-Fehler gibt; sonst `flush stale` und `rollup stale`, `error`, wenn ein Flush fehlgeschlagen ist, und `disabled`, wenn Analysen in der Bot-Konfiguration ausgeschaltet sind. Eine Instanz, deren letzte Serveranzahl älter als 3 Minuten ist, wird gelb markiert, älter als 10 Minuten rot.

> [!NOTE]
> Alles ist UTC. Snapshots, Zensus-Zeilen und Tagessummen werden einmal pro Nacht geschrieben, daher sind die Tabs Server und Funktionen leer, bis der Bot mindestens einmal über 00:05 UTC hinaus gelaufen ist.

### Filterleiste

Die Leiste über den Tabs gilt für jeden Tab und wird in der URL gehalten, sodass das Wechseln der Tabs, Neuladen oder Teilen des Links dieselbe Ansicht behält.

| Steuerelement | Was es macht |
| --- | --- |
| Zeitraum | `15m`, `1h`, `6h`, `24h`, `7d`, `30d` oder ein eigener UTC-Start und -Ende von bis zu 31 Tagen |
| vergleichen | Legt dieselbe Breite eine Periode früher über Diagramme und Kacheln, die es unterstützen |
| Bot | Eine Instanz, entnommen aus den Instanzen, die die Pipeline kennt, oder alle |
| Shard | Eine Shard-ID oder alle |
| Server-ID | Beschränkt die Rohtabellen und Serveransichten auf einen Server; drücke Enter zum Anwenden |
| Aktualisieren | Alles lädt alle 30 Sekunden neu, solange der Tab sichtbar ist; der Button erzwingt es |
| Link kopieren | Kopiert die aktuelle URL mit allen Filtern |

Kacheln öffnen eine Detailansicht mit Aufschlüsselungen ihrer Metrik. Diagramme können die kleineren Reihen in **Andere** zusammenfassen, eine laufende Summe umschalten, mit den Bereichsreglern gezoomt werden und per Rechtsklick auf den Legendeneintrag eine einzelne Reihe isolieren.

## Einstellungen

Die Seite selbst hat keine Einstellungen. Alarmregeln und drei Bot-Konfigurationsschlüssel sind alles, was sich konfigurieren lässt.

### Alarmregeln

Jede Regel überwacht eine Metrik. Die Felder des Editors sind:

| Feld | Bedeutung |
| --- | --- |
| Name, Description, Severity, enabled | Bezeichnung und `info`, `warning` oder `critical`, was Farbe und Titel des Webhooks bestimmt |
| Metric, Filters, Group by | Eine beliebige gespeicherte Metrik, optionale Label-Filter und ein optionales Label, um jeden Wert getrennt auszuwerten, zum Beispiel pro `shard` |
| Agg, Window | `sum`, `avg`, `min`, `max`, `last`, `rate`, `count`, `p50`, `p95` oder `p99` über 1 Minute bis 1 Tag |
| Comparator, Threshold, High | `gt`, `gte`, `lt`, `lte`, `outside` (unter Threshold oder über High), `pct_change` (Prozent gegenüber demselben Fenster eine Basislinie früher), `deviates` (z-Wert gegen den Mittelwert der letzten N Tage), `nodata` (im Fenster wurde nichts gemeldet) |
| Baseline, Direction | Für `pct_change` und `deviates`: gestern oder letzte Woche, und `up`, `down` oder `both` |
| For | Wie lange die Überschreitung anhalten muss, bevor die Regel auslöst; `immediately` überspringt den Zustand „ausstehend“ |
| Cooldown | Mindestabstand zwischen auslösenden Benachrichtigungen |
| Repeat | Erneut benachrichtigen, solange sie ausgelöst ist, oder einmal |
| Min samples | Auswertung überspringen, wenn das Fenster weniger Stichproben enthält |
| Webhook URL, Mention role id, Thread id | Ein Discord-Webhook, eine optionale Rolle, die beim Auslösen gepingt wird, ein optionaler Thread, in den gepostet wird |
| Quiet from, Quiet to | Ein UTC-Fenster, das über Mitternacht reichen darf und in dem nichts gesendet wird |
| notify on resolve | Auch posten, wenn die Gruppe zum Normalzustand zurückkehrt |

Das Vorschaudiagramm rechts zeichnet den Entwurf-Schwellenwert für die absoluten Vergleiche als gestricheltes Band.

Regeln werden jede Minute ausgewertet. Jede Gruppe wechselt von `ok` zu `pending` (nur wenn For gesetzt ist) zu `firing` und zurück zu `ok`; das Ereignisprotokoll verzeichnet den Übergang `firing` zu `ok` als `resolved`. Stummschalten aus der Tabelle schaltet eine Regel für 1 Stunde stumm; die API erlaubt bis zu 30 Tage. Stummgeschaltete Regeln und Ruhefenster ändern weiterhin ihren Zustand, posten nur nicht. **Test senden** postet eine Testnachricht an den Webhook der Regel.

### Bot-Konfigurationsschlüssel

Lege diese in `bot.yml` oder mit dem Owner-Befehl `config` fest. Alle haben standardmäßig an, 30 und leer.

| Schlüssel | Bedeutung |
| --- | --- |
| `analyticsEnabled` | `false` macht den Collector zu einer leeren Operation; der Tab Pipeline zeigt `disabled` |
| `analyticsRetentionDays` | Tage, die rohe Befehlszeilen, Seitenaufrufe und das Server-Eventprotokoll aufbewahrt werden |
| `analyticsDigestWebhook` | Discord-Webhook, an den der wöchentliche Digest gepostet wird; leer deaktiviert den Digest |

### Was wie lange aufbewahrt wird

| Daten | Aufbewahrt |
| --- | --- |
| 1-Minuten-Intervalle | 48 Stunden |
| 5-Minuten-Intervalle | 14 Tage |
| 1-Stunden-Intervalle | 400 Tage |
| Befehlsaufrufe, Seitenaufrufe, Server-Sicherheitsevents | `analyticsRetentionDays` |
| Fehler-Stichproben, stündliche Funktions- und Event-Aktivität pro Server | 90 Tage |
| Alarm-Events | 180 Tage |
| Tägliche Snapshots, Zensus, Tagessummen | Nicht bereinigt |

Rohzeilen werden alle 15 Sekunden geschrieben, Minuten-Intervalle jede Minute; 1-Minuten-Intervalle werden alle 5 Minuten in 5-Minuten-Intervalle und diese in Stunden-Intervalle zusammengefasst, und die Bereinigung läuft alle 6 Stunden.

### Was nie gespeichert wird

- Nachrichteninhalt. Befehlszeilen enthalten den Befehlsnamen, das Modul, die Art, das Ergebnis, Laufzeiten und bei einem Fehler die Ausnahmeklasse und bis zu 200 Zeichen ihrer Meldung.
- Nutzer-IDs. Nichts in Analysen ist danach geschlüsselt, wer einen Befehl ausgeführt hat.
- Client-IPs. Seitenaufrufe behalten einen Besucher-Hash aus IP und User-Agent mit einem täglich wechselnden Salt, sodass ein Besucher nicht über Tage verfolgt werden kann. Anfragen an `/api/`, `/cdn/`, statische Assets und die Analysen-Seite selbst werden nicht erfasst.

Server und Nutzer, die sich von Statistiken abgemeldet haben, werden respektiert: Ihr Befehl zählt weiterhin im Aggregat, aber die Rohzeile wird ohne Server-ID und Servergröße geschrieben.

## Einrichtung Schritt für Schritt

1. Melde dich mit einem Bot-Owner-Konto im Dashboard an und öffne **Analysen** in der Seitenleiste. Sie erscheint nur für Owner.
2. Öffne zuerst **Pipeline**. Die Pille sollte `healthy` anzeigen, und jede Instanz sollte einen aktuellen Heartbeat haben; ein veralteter Flush bedeutet, dass der Bot nicht schreibt.
3. Wähle einen Zeitraum und, wenn du mehr als eine Instanz betreibst, einen Bot in der Filterleiste. Hake **vergleichen** an, um die vorherige Periode zu sehen.
4. Gehe zu **Warnmeldungen**, drücke **Neue Regel**, wähle eine Metrik wie `shard.latency` mit `max` über 5 Minuten, `gt` deinem Limit, gruppiert nach `shard`, füge einen Webhook ein und drücke in der gespeicherten Zeile **Test senden**.
5. Setze `analyticsDigestWebhook` in der Bot-Konfiguration und drücke dann **Digest jetzt senden**, um zu sehen, wie der Beitrag am Montag aussehen wird.
6. Komm nach einer Nacht für **Server**, **Funktionen** und die Zensus-Reihen zurück.

## Befehle

Die Analysen-Seite gibt es nur im Dashboard; es gibt kein passendes Bot-Modul. Der Owner-Befehl `config` ändert die drei obigen Schlüssel, und ein paar Owner-Befehle decken verwandtes Gebiet im Chat ab. Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `config bot analyticsEnabled false` | `conf` | Bot-Owner | Das Erfassen von Analysen stoppen; `true` startet es wieder |
| `config bot analyticsRetentionDays 14` | `conf` | Bot-Owner | Ändern, wie lange Rohzeilen aufbewahrt werden |
| `config bot analyticsDigestWebhook <url>` | `conf` | Bot-Owner | Wohin der Montags-Digest geht |
| `stats` | | Niemand | Bot-Version, ausgeführte Befehle pro fünf Sekunden, Speicher, Cache-Zahlen, Shard und Laufzeit |
| `commandstats` | `cstats` | Bot-Owner | Meistgenutzter Befehl, Modul, Server und Nutzer |
| `shardstats` | | Bot-Owner | Status jedes Shards |

## Tipps und Stolperfallen

- Die Seite prüft die Owner-Eigenschaft über den Bot, sodass ein Konto, das bei einer Bot-Instanz Owner ist, bei einer anderen aber nicht, bei der zweiten umgeleitet wird.
- Der Digest geht montags um oder nach 09:00 UTC raus und deckt die vorherigen sieben Tage gegenüber den sieben davor ab: Server, Befehle, Fehler, Events, neue und verlorene Server, Seitenaufrufe, KI-Tokens, Musik-Tracks, plus die Top fünf der Befehle, Fehler und Funktionen.
- Reihen über einen langen Zeitraum stammen aus Stunden-Intervallen, sodass Perzentile geglättet werden; verengere den Zeitraum, um Minutendetails zu sehen, die es nur für die letzten 48 Stunden gibt.
- Füllt sich der Speicherpuffer des Collectors vor einem Flush, werden zusätzliche rohe Befehlszeilen für dieses Intervall verworfen, während die Aggregate weiterzählen; ein wachsender Wert bei **Ausstehende Zeilen** in der Pipeline ist das Anzeichen.
- Alarmregeln brauchen eine Discord-Webhook-URL; alles andere wird beim Speichern abgelehnt.
- Die geschätzten KI-Kosten decken nur Modelle mit bekanntem Listenpreis ab, die Summe ist also eine Untergrenze.

---
title: Aktivitätsstatistiken
slug: serverstats
summary: Nachrichten, Sprachzeit, Spiele und Mitgliederwachstum für den ganzen Server, ein Mitglied oder einen Kanal über beliebige Zeiträume bis neunzig Tage, mit Diagrammen, Ranglisten, Exporten und einer Datenschutz-Abmeldung.
icon: fa-chart-simple
category: Analytics
dashboard: /dashboard/serverstats
module: ServerStats
tags: [activity, stats, statistics, statbot, voice time, games, presence, lookback, top chatters, charts, member growth, status, snapshots, privacy, opt out, Aktivität, Statistiken, Sprachzeit, Spiele, Anwesenheit, Zeitraum, Top-Schreiber, Diagramme, Mitgliederwachstum, Status, Momentaufnahmen, Datenschutz, Abmeldung]
related: [messagestats, statroles, liveboards, statchannels, invites]
---

## Was es macht

Der Bot zählt bereits Nachrichten. Die Aktivitätsstatistiken fügen Sprachzeit, Spiele und Apps, stündliche Momentaufnahmen von Mitgliedern und Status hinzu und ermöglichen Abfragen zu all dem über einen Zeitraum: den letzten Tag, die letzte Woche, den letzten Monat, bis zu neunzig Tage oder die gesamte Zeit. Alles ist im Dashboard verfügbar, außerdem als Befehle, Diagramme, CSV und für Statistik-Rollen, Live-Boards, Berichte und Statistik-Kanäle.

## Was erfasst wird

| Daten | Wie |
| --- | --- |
| Nachrichten | Jede gezählte Nachricht mit Zeitstempel, neunzig Tage gespeichert, dazu Gesamtwerte pro Mitglied und Kanal |
| Sprachzeit | Ein Segment pro Mitglied und Kanal, das jedes Mal geteilt wird, wenn sich jemand bewegt, stummschaltet, taub schaltet, streamt oder die Kamera einschaltet; neunzig Tage gespeichert, dazu Gesamtwerte |
| Spiele und Apps | Ein Segment pro Mitglied und Aktivität (spielt, streamt, hört, schaut, tritt an), neunzig Tage gespeichert, dazu Gesamtwerte. Standardmäßig aus |
| Momentaufnahmen | Anzahl Mitglieder, Menschen, Bots, online, abwesend, nicht stören, offline und im Sprachkanal, jede Stunde, neunzig Tage gespeichert |
| Beitritte und Austritte | Jeder Beitritt und Austritt mit Zeitstempel |

Zeiträume bis neunzig Tage lesen die zeitgestempelten Daten. **Gesamte Zeit** liest die Gesamtwerte, funktioniert also auch dann noch, wenn die Daten der neunzig Tage bereits verfallen sind.

## Spiele und Apps

Die Spielerfassung ist aus, bis du sie einschaltest, weil sie der aufwendigste Tracker ist. Ist sie an, beobachtet der Bot die Anwesenheit jedes Mitglieds und erfasst, wie lange jedes Spiel, jeder Stream, jede Spotify-Sitzung oder jede beobachtete App dauert.

- **Aktivitäten verifizieren** (standardmäßig an) zählt nur Aktivitäten, die Discord selbst bestätigt: solche mit registrierter Anwendungs-ID, Spotify und Streams. Ein verändertes Programm kann behaupten, alles Mögliche zu spielen, deshalb werden einfach benannte Aktivitäten bei eingeschaltetem Schalter ignoriert.
- Der **Aktivitätsfilter** ist eine Liste von Spielnamen, entweder eine **Blacklist** (aufgelistete Spiele werden ignoriert) oder eine **Whitelist** (nur aufgelistete Spiele zählen).
- Eigene Status werden nie gezählt.

## Dashboard-Reiter

| Reiter | Was er zeigt |
| --- | --- |
| Übersicht | Nachrichten, Sprachzeit, Schreibende, Beitritte, Austritte, Nettowachstum, Mitglieder jetzt, der meistschreibende Nutzer, das aktivste Sprachmitglied, der belebteste Kanal und das meistgespielte Spiel, dazu Diagramme für Nachrichten, Sprachstunden, Mitglieder, Mitglieder-Status sowie Beitritte und Austritte |
| Ranglisten | Mitglieder und Kanäle nach Nachrichten, Sprach- oder Spielzeit sortiert, dazu die meistgespielten Spiele mit Spielerzahlen, als CSV exportierbar. Klicke auf ein Mitglied, einen Kanal oder ein Spiel, um es zu öffnen |
| Mitglied & Kanal | Nachrichten, Sprachzeit, Ränge, Gesamtwerte, Lieblingskanäle und -spiele eines Mitglieds; Aktivität und Top-Mitglieder eines Kanals; sowie **Wer spielt** für jedes Spiel |
| Einstellungen | Jeder Tracker, der Standardzeitraum, die Nachrichten-Abklingzeit, Bots, Sprachzustände, die nicht zählen, ignorierte Kanäle, Rollen und Mitglieder sowie der Aktivitätsfilter |

## Einstellungen

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Standardzeitraum | 14 Tage | Was Befehle und die Seite verwenden, wenn kein Zeitraum angegeben ist |
| Nachrichten-Abklingzeit | 0 | Sekunden zwischen gezählten Nachrichten eines Mitglieds. Verhindert, dass Spam die Zahlen aufbläht |
| Sprachzeit erfassen | an | Ob Sprachsegmente aufgezeichnet werden |
| Stündliche Momentaufnahmen | an | Ob Mitglieder- und Statuszahlen jede Stunde erfasst werden |
| Bots zählen | aus | Ob Bot-Accounts einbezogen werden |
| Spiele und Apps erfassen | aus | Ob Aktivitäten der Anwesenheit aufgezeichnet werden |
| Aktivitäten verifizieren | an | Nur von Discord bestätigte Aktivitäten zählen |
| Sprachzustände, die nicht zählen | keine | Beliebige aus: selbst stummgeschaltet, selbst taub, Server-stummgeschaltet, Server-taub, AFK-Kanal, allein, streamt, Kamera an |
| Ignorierte Kanäle, Rollen, Mitglieder | keine | Nichts von diesen wird gezählt |

## Datenschutz

Jedes Mitglied kann `statsprivacy` (oder `/serverstats privacy`) ausführen, um sich abzumelden. Die gespeicherten Nachrichten, Sprach- und Spielzeiten werden dann auf jedem Server gelöscht, den es mit dem Bot teilt, und es wird nichts Neues erfasst, bis es die Anmeldung erneut ausführt. Server-Admins können das nicht überschreiben.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast). Jeder Befehl gibt es auch unter `/serverstats`. `days` ist der Zeitraum; 0 bedeutet gesamte Zeit, und wenn du es weglässt, gilt der Standard des Servers.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `serveractivity [days]` | `sstats` | Niemand | Die Übersicht des Servers |
| `useractivity [@user] [days]` | `ustats`, `mystats` | Niemand | Nachrichten, Sprachzeit, Ränge, Gesamtwerte, Top-Kanäle und -Spiele eines Mitglieds |
| `channelactivity [#channel] [days]` | `cstats` | Niemand | Aktivität eines Kanals und seine Top-Mitglieder |
| `activitytop [Messages/Voice/Activity] [days] [@role]` | `topchatters`, `topvoice` | Niemand | Mitglieder einstufen |
| `activitytopchannels [Messages/Voice] [days]` | `topchannels` | Niemand | Kanäle einstufen |
| `topgames [days]` | `games` | Niemand | Die meistgespielten Spiele und Apps |
| `whoplays <game>` | | Niemand | Wer gerade in einem Spiel ist und wer es am meisten gespielt hat |
| `activitychart [Messages/Voice/Members/Status/Joins/Leaves/Growth/InVoice/Activities] [days]` | `graph` | Niemand | Ein Diagrammbild |
| `activityexport [Messages/Voice/Activity] [days]` | | Server verwalten | Eine CSV-Rangliste |
| `statssettings` | | Server verwalten | Die Einstellungen anzeigen |
| `statslookback <days>`, `statscooldown <seconds>` | `lookback` | Server verwalten | Standardzeitraum und Nachrichten-Abklingzeit |
| `statstrackvoice`, `statstracksnapshots`, `statscountbots`, `statstrackactivities`, `statsverifyactivities` | `trackvoice`, `trackgames` | Server verwalten | Jeden Tracker umschalten |
| `statsignorevoicestate <state>` | | Server verwalten | Umschalten, ob ein Sprachzustand zählt |
| `statsignore <#channel, @role or @user>`, `statsignored` | | Server verwalten | Ausschlüsse |
| `statsactivityfiltermode <Whitelist/Blacklist>`, `statsactivityfilter <game>`, `statsactivityfilters` | `gamefilter` | Server verwalten | Der Aktivitätsfilter |
| `statsprivacy` | `optoutstats` | Niemand | Überall von der Erfassung abmelden oder wieder anmelden |

## Tipps und Stolperfallen

- Mitglieder- und Statusdiagramme füllen sich erst eine Stunde, nachdem die Momentaufnahmen aktiviert wurden; davor gibt es keine Historie.
- Sprachzeit wird nur gezählt, während der Bot läuft. Ein Neustart schließt alle Sitzungen und öffnet sie neu, es geht also nichts verloren, die Segmentgrenzen verschieben sich aber.
- Einen Kanal auszuschließen blendet seine gesamte Historie aus jeder Abfrage aus und stoppt neue Zählungen, daher ändern sich auch alte Zahlen.
- Die Nachrichtenzählung selbst muss aktiv sein (der Schalter auf der Seite Nachrichtenstatistiken), damit Nachrichtenzahlen hier erscheinen.
- Spielnamen werden im Filter und bei `whoplays` ohne Berücksichtigung der Groß- und Kleinschreibung verglichen.

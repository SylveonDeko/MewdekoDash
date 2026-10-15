---
title: Nachrichtenstatistiken
slug: messagestats
summary: Zähle, wie viele Nachrichten jedes Mitglied in jedem Kanal schreibt, und sieh dir dann Ranglisten, Aufschlüsselungen pro Nutzer und Kanal sowie Diagramme zu den aktivsten Stunden und Tagen an.
icon: fa-envelope
category: Analytics
dashboard: /dashboard/messagestats
module: Utility
tags: [message stats, message count, activity, leaderboard, top users, analytics, busiest hours, activity graph, Nachrichtenstatistiken, Nachrichtenzähler, Aktivität, Rangliste, Top-Nutzer, Analysen, aktivste Stunden, Aktivitätsdiagramm]
related: [xp, utility, statchannels]
---

## Was es macht

Sobald die Nachrichtenzählung aktiviert ist, speichert der Bot jedes Mal einen Zähler pro Mitglied und Kanal, wenn ein Mensch eine Nachricht schreibt, die die Mindestlänge erreicht. Über den Inhalt wird nichts gespeichert, nur wer geschrieben hat, wo und wann. Die Zähler werden gesammelt und in Stapeln in die Datenbank geschrieben, damit belebte Server den Bot nicht ausbremsen.

Mitglieder können sich ihre eigenen Summen mit `usermessages` anzeigen lassen, mit `channelmessages` sehen, welcher Kanal am aktivsten ist, oder mit `servermessages` den gesamten Server prüfen. `topusers` gibt eine Top-Zehn-Rangliste mit dem Anteil jedes Mitglieds an allen Nachrichten aus. `activitygraph` erstellt ein Balkendiagramm als Bild mit den aktivsten Wochentagen oder Tagesstunden.

Das Dashboard zeigt dieselben Zahlen mit Diagrammen und erlaubt dem Team, die Zählung ein- oder auszuschalten, Zähler zurückzusetzen und die Daten als CSV oder JSON zu exportieren.

## Wofür du es nutzen kannst

- Finde deine aktivsten Mitglieder für Belohnungen, Rollen oder die Suche nach Moderatoren.
- Erkenne, welche Kanäle tot sind und welche florieren, bevor du den Server umstrukturierst.
- Wähle Eventzeiten anhand des Diagramms mit den aktivsten Stunden in deiner eigenen Zeitzone.
- Erkenne Bots und Spam-Accounts, indem du Nachrichtenzahlen mit der Qualität der Nachrichten vergleichst.

## Was gezählt wird

| Regel | Verhalten |
| --- | --- |
| Zählung aktiviert | Es wird nichts erfasst, bis `togglemsgcount` oder der Schalter im Dashboard eingeschaltet ist |
| Bots | Werden nie gezählt |
| DMs | Werden nie gezählt; nur Server-Kanäle |
| Mindestlänge | Nachrichten, die kürzer als **minimale Nachrichtenlänge** Zeichen sind, werden übersprungen; der Standard ist 0, also zählt alles |
| Zeitstempel | Nachrichtenzeiten werden 90 Tage lang gespeichert, um die Stunden- und Tagesdiagramme zu speisen; Summen werden unbegrenzt gespeichert |

Die minimale Länge akzeptiert Werte bis 4098. `minmsglength` ohne Zahl zeigt den aktuellen Wert an.

## Aktivitätsdiagramme

`activitygraph days` benötigt Daten für alle sieben Wochentage und betrachtet die letzten vier Wochen. `activitygraph hours` benötigt Daten für alle 24 Stunden der letzten sieben Tage. Für das stündliche Diagramm fragt der Bot zuerst nach einer Zeitzone und bietet eine Liste gängiger Zeitzonen an. Er akzeptiert jeden IANA-Zeitzonennamen und bricht ab, wenn du nicht antwortest. Das Diagramm wird als PNG gepostet.

## Einstellungen

Die Seite Nachrichtenstatistiken hat zwei Haupt-Tabs, **Statistiken** und **Verwaltung**. Unter Statistiken gibt es **Übersicht**, **Top-Nutzer** und **Top-Kanäle**. Unter Verwaltung gibt es **Einstellungen** und **Daten exportieren**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Nachrichtenzählung aktivieren | Aus | Ob neue Nachrichten erfasst werden |
| Minimale Nachrichtenlänge | 0 | Schieberegler von 0 bis 4098; kürzeste Nachricht, die zählt |
| Nachrichtenzähler zurücksetzen | | **Alle Serverzähler zurücksetzen** löscht nach einer Bestätigung jeden gespeicherten Zähler des Servers |
| Exportformat | CSV | CSV- oder JSON-Download der geladenen Statistiken |
| Nutzerstatistiken einbeziehen | An | Fügt die Zeilen der Top-Nutzer zum Export hinzu |
| Kanalstatistiken einbeziehen | An | Fügt die Zeilen der Top-Kanäle zum Export hinzu |
| Stündliche Aufschlüsselung einbeziehen | Aus | Fügt die Zeilen zu den aktivsten Stunden und aktivsten Tagen zum Export hinzu |

Der Tab **Übersicht** zeigt die Kacheln **Tägliche Nachrichten**, **Nachrichten gesamt**, **Zuletzt aktualisiert** und **Status**, den am wenigsten aktiven Nutzer und Kanal, ein Diagramm **24-Stunden-Aktivität** und ein Diagramm **Wochentrend**. **Top-Nutzer** zeigt die **Top-Nachrichtenschreiber**. **Top-Kanäle** zeigt die Liste **Aktivste Kanäle**.

> [!NOTE]
> Der Export wird in deinem Browser aus den Statistiken erstellt, die bereits auf der Seite geladen sind. Das Start- und das Enddatum, die du eingibst, werden in den Dateikopf geschrieben, filtern aber die Zeilen nicht.

## Einrichtung Schritt für Schritt

1. Öffne **Nachrichtenstatistiken** im Dashboard und wechsle zu **Verwaltung** und dann zu **Einstellungen**.
2. Aktiviere **Nachrichtenzählung aktivieren**.
3. Optional kannst du **Minimale Nachrichtenlänge** auf 5 setzen oder in Discord `minmsglength 5` ausführen, damit einzeichige Antworten ignoriert werden.
4. Lass den Server einen Tag lang chatten und schau dir dann unter **Statistiken** die ersten Zahlen an.
5. Führe nach einer Woche `activitygraph hours` aus und wähle deine Zeitzone, um zu sehen, wann der Server am aktivsten ist.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `usermessages [@user]` | `usermsg`, `umsg` | Niemand | Gesamtzahl sowie aktivster und am wenigsten aktiver Kanal für dich oder ein anderes Mitglied |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Niemand | Gesamtzahl sowie aktivstes und am wenigsten aktives Mitglied in einem Kanal |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg` | Niemand | Gesamtzahl des Servers mit dem aktivsten und am wenigsten aktiven Mitglied sowie Kanal |
| `topusers` | `topu` | Niemand | Top zehn Mitglieder nach Nachrichtenzahl mit Prozentangaben |
| `activitygraph [days or hours]` | `actgraph` | Niemand | Balkendiagramm der aktivsten Tage oder Stunden; Standard sind Tage |
| `minmsglength [number]` | `mmlength`, `minmlength` | Server verwalten | Zeigt die Mindestlänge für eine zu zählende Nachricht an oder setzt sie |
| `togglemsgcount` | `togglemessagecount` | Administrator | Zählung ein- oder ausschalten |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Nachrichten verwalten | Zähler für den ganzen Server, ein Mitglied, einen Kanal oder ein Mitglied in einem Kanal zurücksetzen, nach Bestätigung |

## Tipps und Stolperfallen

- Die Zählung beginnt erst ab dem Moment, in dem sie aktiviert wurde. Nachrichten davor werden nie nachträglich erfasst.
- Jeder Statistikbefehl und das Dashboard melden „deaktiviert“, bis die Zählung eingeschaltet ist, selbst wenn alte Daten vorhanden sind.
- Zähler werden in Stapeln von bis zu 100 Ereignissen geschrieben, daher kann eine Summe ein paar Sekunden hinter dem Live-Chat zurückliegen.
- Das Löschen eines Kanals löscht seine Zähler nicht. Verwende `resetmessagecounts #channel`, bevor der Kanal entfernt wird, wenn die Zähler verschwinden sollen.
- Das stündliche Diagramm ist nur so genau wie die gewählte Zeitzone. Speichere die Zeitzone des Servers mit dem Zeitzonen-Befehl in der Administration, damit sie für das ganze Team gleich ist.
- Das XP-System hat seine eigene Aktivitätserfassung und verwendet diese Zähler nicht.

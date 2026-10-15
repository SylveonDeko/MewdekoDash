---
title: Statistik-Rollen
slug: statroles
summary: Rollen, die Mitglieder durch Aktivität über einen Zeitraum verdienen und wieder verlieren, sobald sie aufhören. Bewertet wird anhand von Schwellenwerten, Top-Rängen, Top-Prozenten oder täglichen Serien bei Nachrichten, Sprachkanälen, Spielen, Einladungen, Zeit auf dem Server oder Kontoalter.
icon: fa-trophy
category: Community
dashboard: /dashboard/statroles
module: StatRoles
tags: [stat roles, statroles, activity roles, active member role, inactive role, top chatter role, voice role, invite rewards, message rewards, streak, statbot, Statistik-Rollen, Aktivitätsrollen, Rolle für aktive Mitglieder, Inaktiv-Rolle, Sprachrolle, Einladungsbelohnungen, Nachrichtenbelohnungen, Serie]
related: [serverstats, xp, invites, liveboards]
---

## Was es macht

XP-Levelrollen gelten nur in eine Richtung: einmal verdient, bleiben sie für immer. Eine Statistik-Rolle wird dagegen nach einem Zeitplan neu bewertet. Mitglieder, die die Bedingung erfüllen, bekommen die Rolle, Mitglieder, die sie nicht mehr erfüllen, verlieren sie. Eine Rolle „Aktives Mitglied“ bedeutet also *jetzt* aktiv. Mach die Rolle dauerhaft, wenn du das alte Verhalten willst, oder kehre die Regel um, um stattdessen inaktive Mitglieder zu markieren.

## Bedingungen

Jede Statistik-Rolle misst eine Sache über einen Zeitraum und wendet eine Grenze an.

| Messung | Was gezählt wird |
| --- | --- |
| Nachrichten | Nachrichten im Zeitraum, optional nur in ausgewählten Kanälen |
| Sprachminuten | Zeit in Sprachkanälen im Zeitraum, unter Berücksichtigung der Sprachstatus, die du bei den Aktivitätsstatistiken ausgeschlossen hast |
| Minuten in einem Spiel | Zeit in einem bestimmten Spiel oder einer App oder in beliebigen im Zeitraum. Erfordert aktivierte Spielerfassung |
| Einladungen | Die Nettozahl der Einladungen des Mitglieds |
| Tage auf dem Server | Seit dem Beitritt des Mitglieds |
| Kontoalter | Seit der Erstellung des Kontos |

| Grenze | Wer sich qualifiziert |
| --- | --- |
| Schwellenwert | Zwischen einem Minimum und einem optionalen Maximum |
| Top-Rang | Zwischen zwei Plätzen eingestuft, zum Beispiel die Top 10 |
| Top-Prozent | In den besten X Prozent der eingestuften Mitglieder, zum Beispiel die Top 5 % |
| Tägliche Serie | Hat ein tägliches Minimum an mindestens N Tagen innerhalb des Zeitraums erreicht, zum Beispiel 5 Nachrichten an 7 der letzten 7 Tage |

Der Zeitraum beträgt 1 bis 90 Tage oder die gesamte Zeit, außer bei einer Serie. Gleichstand teilt sich einen Rang.

## Filter und Optionen

| Option | Was sie bewirkt |
| --- | --- |
| Nur in Kanälen zählen | Beschränkt Nachrichten oder Sprache auf ausgewählte Kanäle |
| Erforderliche Rollen | Ein Mitglied braucht mindestens eine davon, um berücksichtigt zu werden |
| Ausgeschlossene Rollen | Ein Mitglied, das eine davon hat, wird nie berücksichtigt |
| Ignorierte Mitglieder | Diesen Mitgliedern wird die Rolle nie gegeben oder entzogen |
| Gruppe | Statistik-Rollen mit derselben Gruppe behalten nur die höchste Stufe, für die ein Mitglied sich qualifiziert, sodass sich Bronze, Silber und Gold nicht stapeln |
| Dauerhaft | Wird nach dem Verdienen nie wieder entzogen |
| Umkehren | Mitglieder, die *nicht* qualifiziert sind, bekommen die Rolle |
| Bots einbeziehen | Bot-Konten berücksichtigen |
| Auswerten alle | Wie oft die Regel läuft, mindestens alle 10 Minuten, standardmäßig alle 3 Stunden |
| Ankündigen in / Mitglied per DM informieren | Postet eine Nachricht, wenn die Rolle vergeben oder entzogen wird, mit `%user%`, `%role%`, `%action%` (verdient oder verloren), `%value%` und `%stat%` |

## Dashboard

Der Tab **Statistik-Rollen** listet jede Regel mit Bedingung, Zeitplan und letztem Lauf auf und lässt dich jede einzeln aktivieren, deaktivieren, bearbeiten, löschen, **Vorschau** anzeigen oder **Ausführen**. Eine Vorschau zeigt, wer die Rolle bekommen und wer sie verlieren würde, ohne etwas zu ändern. Ausführen wendet die Regel sofort an; manuelle Läufe sind auf einen pro zehn Minuten und Server begrenzt.

Der Tab **Erstellen / Bearbeiten** ist das Formular für alles oben Genannte.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Jeder Befehl existiert auch unter `/statrole`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `statroleadd <@role> <stat> <minimum> [days] [name]` | `sradd` | Rollen verwalten | Eine Schwellenwert-Regel |
| `statroletop <@role> <stat> <topEnd> [days] [name]` | `srtop` | Rollen verwalten | Eine Top-Rang-Regel für die Plätze 1 bis topEnd |
| `statrolepercent <@role> <stat> <percent> [days] [name]` | `srpercent` | Rollen verwalten | Eine Top-Prozent-Regel |
| `statrolestreak <@role> <stat> <perDay> <requiredDays> [days] [name]` | `srstreak` | Rollen verwalten | Eine tägliche Serien-Regel |
| `statrolelist` | `statroles` | Niemand | Jede Regel |
| `statroleinfo <id>` | `srinfo` | Niemand | Eine Regel vollständig |
| `statroleset <id> <setting> <value>` | `srset` | Rollen verwalten | Name, min, max, lookback, topstart, topend, days, permanent, invert, bots, group, interval, notifychannel, notifydm, message oder activity ändern |
| `statrolefilter <id> <#channel, @role [true], or @user>` | `srfilter` | Rollen verwalten | Einen Kanalfilter, eine erforderliche Rolle (oder eine ausgeschlossene Rolle mit `true`) oder ein ignoriertes Mitglied umschalten |
| `statroletoggle <id>` | `srtoggle` | Rollen verwalten | Aktivieren oder deaktivieren |
| `statrolepreview <id>` | `srpreview` | Rollen verwalten | Wer sie gewinnen und verlieren würde |
| `statrolerun <id>` | `srrun` | Rollen verwalten | Jetzt anwenden |
| `statroleremove <id>` | `srremove` | Rollen verwalten | Die Regel löschen; Mitglieder behalten, was sie haben |

## Tipps und Stolperfallen

- Die höchste Rolle des Bots muss über der verwalteten Rolle stehen, und er braucht die Berechtigung Rollen verwalten.
- Jede Discord-Rolle kann von nur einer Statistik-Rolle verwaltet werden. Lösche die alte Regel, bevor du eine neue auf dieselbe Rolle richtest.
- Eine Regel mit einem Minimum von 0 und ohne Maximum würde auf alle zutreffen; gib ihr ein Maximum oder verwende bewusst Umkehren.
- Mitglieder, die sich von den Aktivitätsstatistiken abgemeldet haben, haben keine Nachrichten, Sprachzeit oder Spielzeit und qualifizieren sich daher nie für diese Messungen.
- Prüfe die Vorschau, bevor du eine Regel auf einem großen Server aktivierst. Rollenänderungen werden zeitlich verteilt, um Ratenlimits einzuhalten. Eine Regel, die Tausende Mitglieder betrifft, braucht daher ein paar Minuten, bis sie vollständig angewendet ist.

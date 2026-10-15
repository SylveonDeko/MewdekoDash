---
title: Live-Boards
slug: liveboards
summary: Pinne eine Rangliste, ein Diagramm oder eine Übersicht in einen Kanal, und der Bot aktualisiert sie laufend. Außerdem kann er nach Zeitplan eine Zusammenfassung des Tages, der Woche oder des Monats posten.
icon: fa-thumbtack
category: Community
dashboard: /dashboard/liveboards
module: ServerStats
tags: [live boards, pinned leaderboard, pin leaderboard, auto updating, server report, weekly report, monthly report, digest, growth report, Live-Boards, angeheftete Rangliste, automatische Aktualisierung, Server-Bericht, Wochenbericht, Monatsbericht, Zusammenfassung, Wachstumsbericht]
related: [serverstats, invites, statchannels, statroles]
---

## Was es macht

Ein Live-Board ist eine Nachricht, die der Bot einmal postet, anheftet und dann in einem Intervall bearbeitet, damit immer aktuelle Zahlen angezeigt werden. Ein Server-Bericht ist ein einmaliges Embed mit einem Wachstumsdiagramm, das täglich, wöchentlich oder monatlich gepostet wird und zusammenfasst, was seit dem letzten Bericht passiert ist.

## Boards

| Board | Zeigt |
| --- | --- |
| Einladungs-Rangliste | Top-Einlader mit regulären, verlassenen und gefälschten Zählern |
| Nachrichten-Rangliste | Die aktivsten Schreiber |
| Sprach-Rangliste | Mitglieder mit der meisten Zeit in Sprachkanälen |
| Top-Spiele | Die meistgespielten Spiele und Apps mit Spielerzahlen (erfordert Spielerfassung) |
| Beitritts-Diagramm, Austritts-Diagramm, Wachstumsdiagramm | Beitritte und Austritte pro Tag |
| Mitgliederdiagramm | Mitgliederzahl aus den stündlichen Schnappschüssen |
| Nachrichtendiagramm | Nachrichten pro Tag |
| Server-Übersicht | Dieselbe Zusammenfassung wie `serveractivity` |
| Einladungsanalysen | Beitritte, Austritte, Verbleib, gefälschte Beitritte und Quellen |

Jedes Board hat ein **Zeitfenster** (letzter Tag, Woche, Monat oder gesamte Zeit; Diagramme nutzen für die gesamte Zeit bis zu 90 Tage), ein Aktualisierungsintervall von mindestens 5 Minuten, eine Zeilenanzahl für Ranglisten und einen Schalter zum Anheften. Ein Server kann bis zu 10 Boards haben. Das Löschen eines Boards löscht seine Nachricht. Löscht jemand die Nachricht von Hand, postet der Bot beim nächsten Aktualisieren eine neue.

## Server-Berichte

Lege einen Kanal und eine Häufigkeit fest. Der Bot postet einen Bericht, sobald der Zeitplan das erste Mal fällig ist, danach täglich um 00:00 UTC, wöchentlich montags oder am ersten jedes Monats. Ein Bericht enthält:

- Beitritte, Austritte, Nettowachstum und Verbleib im Zeitraum
- Nachrichten, Sprachzeit und aktive Mitglieder
- Mitgliederzahl und deren Veränderung
- Top-Einlader, Schreiber, Sprachmitglieder und die aktivsten Kanäle
- Top-Einladungscodes mit ihren Bezeichnungen und die Top-Spiele, wenn die Spielerfassung aktiviert ist
- Ein Diagramm mit Beitritten und Austritten

**Jetzt einen Bericht senden** postet sofort einen Bericht, ohne den Zeitplan zu ändern. Berichte schalten sich selbst ab, wenn der Bot die Berechtigung zum Posten im Kanal verliert.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Boards sind auch unter `/liveboard` zu finden, Berichte unter `/serverreport`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `liveboardadd <#channel> <board> [range] [rows] [minutes]` | `pinboard`, `pinleaderboard` | Server verwalten | Ein Board posten und anheften |
| `liveboardlist` | `liveboards` | Server verwalten | Alle Boards |
| `liveboardremove <id>` | `unpinboard` | Server verwalten | Ein Board und seine Nachricht löschen |
| `liveboardrefresh` | | Server verwalten | Alle Boards jetzt aktualisieren |
| `serverreportchannel [#channel]` | `reportchannel` | Server verwalten | Den Berichtskanal festlegen und Berichte aktivieren oder sie deaktivieren |
| `serverreportfrequency <Daily/Weekly/Monthly>` | `reportfrequency` | Server verwalten | Wie oft Berichte gepostet werden |
| `serverreportnow [frequency]` | `reportnow` | Server verwalten | Einen Bericht im aktuellen Kanal posten |

## Tipps und Stolperfallen

- Zum Anheften braucht der Bot die Berechtigung Nachrichten verwalten im Kanal. Ohne sie wird das Board trotzdem gepostet, bleibt aber ungeheftet.
- Boards bearbeiten immer dieselbe Nachricht. Ein Board in einem belebten Kanal rutscht daher schnell nach oben aus dem Blickfeld; lege Boards am besten in einen eigenen Statistik-Kanal oder verlass dich auf das Anheften.
- Ranglisten berücksichtigen die Ausschlüsse für Einladungen und Aktivität, daher erscheinen ausgeblendete oder ignorierte Mitglieder nie auf einem angehefteten Board.
- Statistik-Kanäle sind die andere Möglichkeit, Live-Zahlen zu zeigen: ein Zähler im Kanalnamen statt einer Nachricht.

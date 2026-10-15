---
title: Einstellungen
slug: settings
summary: Die serverweiten Grundlagen: Befehlspräfix, Sprache, Zeitzone, Log-Kanäle, Stummschalt-Rolle, Ablauf von Verwarnungen und einige Chat-Hilfsfunktionen.
icon: fa-cog
category: Settings
dashboard: /dashboard/settings
module: Administration
tags: [settings, prefix, language, locale, timezone, mute role, warn expire, command log, staff role, member role, snipe, link previews, delmsgoncmd, Einstellungen, Präfix, Sprache, Gebietsschema, Zeitzone, Stummschalt-Rolle, Verwarnung ablaufen lassen, Befehlslog, Teamrolle, Mitgliederrolle, Snipe, Link-Vorschau, Befehlsnachricht löschen]
related: [administration, logging, filter, suggestions]
---

## Was es macht

Die Seite Einstellungen enthält die wenigen Optionen, die alle Module gleichzeitig betreffen und nicht nur eine einzelne Funktion. Hier änderst du das Präfix, das Mitglieder vor Befehlen tippen, die Sprache, in der der Bot antwortet, die Zeitzone für Erinnerungen und geplante Nachrichten sowie die Kanäle, in denen Befehlsnutzung und Verwarnungen protokolliert werden.

Außerdem geht es um den Namen der Stummschalt-Rolle, ob einem stummgeschalteten Mitglied die übrigen Rollen entzogen werden, wie lange Verwarnungen gültig bleiben und um zwei Chat-Hilfsfunktionen: das Sniping gelöschter Nachrichten und Link-Vorschauen für Nachrichten.

Die meisten dieser Einstellungen haben einen passenden Textbefehl, sodass das Team sie auch direkt in Discord ändern kann. Einige Extras gibt es nur als Befehle: die Teamrolle, die Mitgliederrolle und das Löschen von Befehlsnachrichten pro Kanal.

## Wozu du es nutzt

- Dein Server nutzt `.` schon für einen anderen Bot, und du möchtest Mewdeko auf `!` oder `m!` legen.
- Deine Community spricht eine andere Sprache als Englisch, und du möchtest, dass die Antworten dazu passen.
- Erinnerungen und geplante Beiträge sollen zur richtigen Ortszeit erscheinen, nicht in UTC.
- Moderatoren möchten einen Kanal, der jeden ausgeführten Befehl und jede ausgesprochene Verwarnung festhält.
- Verwarnungen sollen nach einer bestimmten Anzahl von Tagen verfallen, statt sich endlos anzusammeln.
- Mitglieder sollen eine gelöschte Nachricht mit `snipe` wiederherstellen können, oder die Link-Vorschau soll in einem belebten Chat abgeschaltet werden.

## Präfix

Das Präfix ist der Text, den ein Mitglied vor einem Befehl tippt. Standardmäßig ist es `.`. Jeder kann `prefix` ohne Argument ausführen, um das aktuelle Präfix zu sehen. Administratoren ändern es mit `prefix <new>` oder im Dashboard über das Feld **Befehlspräfix**. Slash-Befehle sind vom Präfix nicht betroffen.

## Sprache

Jeder Server kann seine eigene Antwortsprache wählen, mit `languageset <code>`, zum Beispiel `languageset de`, oder über das Auswahlmenü **Sprache** im Dashboard. `languageset default` hebt die Überschreibung auf, sodass der Server der Standardsprache des Bots folgt. `languageslist` gibt jeden unterstützten Gebietscode aus. `langsetdefault` ohne Argument zeigt die Standardsprache des Bots. Diese Standardsprache zu ändern ist eine Aktion für die Bot-Besitzer.

## Zeitzone

Die Zeitzone des Servers steuert Erinnerungen, geplante Nachrichten und alle Zeitangaben. `timezone` allein zeigt den aktuellen Wert (UTC, falls keiner gesetzt ist). `timezone <id>` setzt ihn mit einer IANA- oder Windows-Zeitzonenkennung wie `Europe/London`. Mit `timezones` blätterst du durch die Kennungen, die der Bot akzeptiert. Im Dashboard wird **Server-Zeitzone** sofort gespeichert, sobald du einen Wert auswählst. Dafür musst du nicht auf **Änderungen speichern** warten.

## Log-Kanäle

**Befehlslog-Kanal** protokolliert die Befehlsnutzung. Setze ihn mit `commandlogchannel #channel`. Führst du den Befehl ohne Kanal aus, schaltest du das Protokollieren aus.

**Verwarnungs-Log-Kanal** protokolliert Verwarnungen, die über die Moderationsbefehle ausgesprochen werden. Dieser Kanal wird im Dashboard festgelegt.

## Verwarnungen

**Warnungsablauf** wird in Stunden gespeichert. Null bedeutet, dass Verwarnungen nie ablaufen. Der Befehl `warnexpire` arbeitet dagegen in Tagen und nimmt ein zweites Wort entgegen: `warnexpire 30 clear` markiert Verwarnungen, die älter als 30 Tage sind, als aufgehoben, `warnexpire 30 delete` entfernt sie. Der zulässige Bereich liegt zwischen 0 und 366 Tagen, und `warnexpire 0` schaltet den Ablauf aus.

## Stummschalt-Rolle und Entfernen von Rollen

**Stummschalt-Rolle** ist der Name der Rolle, die die Stummschalt-Befehle und Strafen verwenden. Existiert eine Rolle mit diesem Namen nicht, erstellt der Bot sie. Über Discord setzt `muterole @role` die Einstellung auf eine bestehende Rolle. Die Rolle muss unter deiner eigenen höchsten Rolle liegen, außer du bist der Server-Owner. Mit `muterole` ohne Argument siehst du die aktuelle Stummschalt-Rolle.

**Alle anderen Rollen entfernen, solange stummgeschaltet** entzieht einem Mitglied seine übrigen Rollen für die Dauer einer Stummschaltung und gibt sie danach zurück. Die Befehlsform ist `removeonmute y` oder `removeonmute n`.

## Chat-Hilfsfunktionen

| Einstellung | Befehl | Wirkung |
| --- | --- | --- |
| Nachrichten-Sniping | `snipeset enable` oder `snipeset disable` | Lässt Mitglieder die Snipe-Befehle nutzen, um kürzlich gelöschte oder bearbeitete Nachrichten wiederherzustellen. Standardmäßig aus. |
| Nachrichtenlink-Vorschauen | `previewlinks y` oder `previewlinks n` | Wenn jemand einen Link auf eine Discord-Nachricht postet, zeigt der Bot den Inhalt dieser Nachricht an. |

## Nur über Befehle einstellbar

Diese Optionen gehören zum selben Administration-Modul, haben aber keine Entsprechung im Dashboard.

**Teamrolle** (`staffrole @role`) markiert eine Rolle, deren Mitglieder von den Wort-, Link- und Einladungsfiltern sowie von den Spam-Prüfungen für Vorschläge ausgenommen sind. Führe `staffrole` ohne Rolle aus, um die aktuelle zu sehen, und `staffroledisable`, um sie zu entfernen.

**Mitgliederrolle** (`memberrole @role`) speichert eine Rolle für den Server. Sie wird gespeichert, aber derzeit von keiner Funktion genutzt.

**Befehlsnachricht löschen** (`delmsgoncmd`) entfernt die Nachricht, die einen Befehl ausgelöst hat, sobald der Befehl ausgeführt wird:

| Form | Wirkung |
| --- | --- |
| `delmsgoncmd` | Löschen für den gesamten Server umschalten |
| `delmsgoncmd list` | Die Servereinstellung und jede Kanal-Überschreibung anzeigen |
| `delmsgoncmd channel enable [#channel]` | In diesem Kanal immer löschen (ohne Angabe der aktuelle Kanal) |
| `delmsgoncmd channel disable [#channel]` | In diesem Kanal nie löschen |
| `delmsgoncmd channel inherit [#channel]` | Der Servereinstellung folgen |

## Einstellungen

Alles Folgende befindet sich auf der einzigen Seite **Bot-Einstellungen**. Drücke nach dem Bearbeiten auf **Änderungen speichern**. Nur **Server-Zeitzone** wird von selbst gespeichert.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Befehlspräfix | `.` | Text, der vor Befehlen getippt wird |
| Befehlslog-Kanal | keiner | Kanal, in dem die Befehlsnutzung protokolliert wird |
| Währungs-Emoji | keiner | Emoji, das für die Währung des Servers angezeigt wird |
| Verwarnungs-Log-Kanal | keiner | Kanal, in dem Verwarnungen protokolliert werden |
| Warnungsablauf | 0 (nie) | Stunden, bis Verwarnungen ablaufen |
| Sprache | Bot-Standard | Antwortsprache für diesen Server |
| Server-Zeitzone | UTC | Zeitzone für geplante Nachrichten, Erinnerungen und Zeitangaben |
| Stummschalt-Rolle | Muted | Name der Rolle, die bei Stummschaltungen und Strafen vergeben wird |
| Alle anderen Rollen entfernen, solange stummgeschaltet | Aus | Übrige Rollen für die Dauer einer Stummschaltung entfernen |
| Nachrichten-Sniping | Aus | Die Snipe-Befehle erlauben |
| Nachrichtenlink-Vorschauen | Aus | Discord-Nachrichtenlinks ausklappen |

> [!NOTE]
> Die Seite umfasst nur die gemeinsamen Grundlagen. Protokollierung, Moderation, Starboard und andere Funktionen haben eigene Seiten mit eigenen Einstellungen.

## Einrichtungsanleitung

1. Öffne **Einstellungen** im Dashboard.
2. Setze **Befehlspräfix**, falls `.` mit einem anderen Bot kollidiert.
3. Wähle eine **Sprache** und eine **Server-Zeitzone**.
4. Wähle einen **Befehlslog-Kanal** und einen **Verwarnungs-Log-Kanal**, die nur das Team lesen kann.
5. Lege den **Warnungsablauf** in Stunden fest, zum Beispiel `720` für dreißig Tage, oder lass ihn bei 0.
6. Prüfe, ob der Name der **Stummschalt-Rolle** zu der Rolle passt, die deine Moderatoren bereits nutzen, oder lass `Muted` stehen und den Bot die Rolle erstellen.
7. Aktiviere **Nachrichten-Sniping** oder **Nachrichtenlink-Vorschauen**, falls du sie möchtest.
8. Drücke auf **Änderungen speichern**.
9. Führe in Discord `staffrole @YourStaffRole` aus, damit Filter und Vorschlagslimits dein Team auslassen.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `prefix [new prefix]` | | Niemand zum Ansehen, Administrator zum Ändern | Befehlspräfix anzeigen oder setzen |
| `languageset <code>` | `langset` | Administrator | Antwortsprache des Servers setzen oder mit `default` aufheben |
| `langsetdefault` | `langsetd` | Niemand zum Ansehen, Bot-Besitzer zum Ändern | Bot-weite Standardsprache anzeigen oder setzen |
| `languageslist` | `langli` | Niemand | Unterstützte Gebietscodes auflisten |
| `timezone [id]` | | Niemand zum Ansehen, Administrator zum Ändern | Zeitzone des Servers anzeigen oder setzen |
| `timezones` | | Niemand | Durch die akzeptierten Zeitzonenkennungen blättern |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrator | Befehlslog-Kanal setzen oder ohne Kanal deaktivieren |
| `warnexpire <days> <clear or delete>` | `warne` | Administrator | Verwarnungen nach einer Anzahl von Tagen ablaufen lassen |
| `muterole [@role]` | `setmuterole` | Rollen verwalten | Stummschalt-Rolle anzeigen oder setzen |
| `removeonmute <y or n>` | | Administrator | Übrige Rollen während einer Stummschaltung entfernen |
| `snipeset <enable or disable>` | `setsnipe` | Administrator | Die Snipe-Befehle erlauben oder sperren |
| `previewlinks <y or n>` | `plinks` | Administrator | Discord-Nachrichtenlinks ausklappen |
| `staffrole [@role]` | | Administrator | Teamrolle anzeigen oder setzen |
| `staffroledisable` | | Administrator | Teamrolle entfernen |
| `memberrole [@role]` | | Administrator | Mitgliederrolle anzeigen oder setzen |
| `delmsgoncmd [list or channel <state> [#channel]]` | `dmc` | Administrator | Befehlsnachrichten serverweit oder pro Kanal löschen |

## Tipps und Stolperfallen

- `delmsgoncmd` braucht die Berechtigung Nachrichten verwalten für den Bot. Ohne sie verweigert der Befehl die Ausführung.
- Das Dashboard speichert den Warnungsablauf in Stunden, während `warnexpire` Tage verwendet. `warnexpire 1` und ein Dashboard-Wert von `24` bedeuten dasselbe.
- `muterole` vergleicht die übergebene Rolle mit deiner eigenen höchsten Rolle. Wenn ein Fehler wegen fehlender Berechtigungen erscheint, frage den Owner oder wähle eine niedrigere Rolle.
- Slash-Befehle ignorieren das Präfix vollständig. Eine Präfixänderung betrifft daher nur Textbefehle.
- Die Ausnahme für die Teamrolle gilt nur für Filter und die Spam-Prüfungen für Vorschläge. Sie gewährt keine Befehlsberechtigungen. Dafür ist das Modul Permissions zuständig.

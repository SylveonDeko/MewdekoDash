---
title: Wort des Tages
slug: wordoftheday
summary: Postet jeden Tag ein Vokabelwort mit Definition, Aussprache und Beispiel. Die Wörter stammen aus einem Wörterbuch, gefiltert nach Thema und Schwierigkeit, oder aus einer Liste, die der Server selbst schreibt.
icon: fa-book-open
category: Community
dashboard: /dashboard/wordoftheday
module: WordOfTheDay
tags: [word of the day, wotd, vocabulary, dictionary, definition, daily, datamuse, topic, schedule, Wort des Tages, Vokabeln, Wörterbuch, Definition, täglich, Thema, Zeitplan]
related: [birthday, utility]
---

## Was es macht

Einmal am Tag, zu einer Uhrzeit, die der Server in seiner eigenen Zeitzone festlegt, postet der Bot ein Wort in einem gewählten Kanal. Der Beitrag zeigt das Wort, wie es ausgesprochen wird, seine Wortart, eine Definition und, falls vorhanden, einen Beispielsatz. Eine Rolle kann bei jedem Beitrag gepingt werden.

Die Wörter stammen aus dem Datamuse-Wörterbuch und werden über drei Einstellungen gefiltert: ein **Thema**, zu dem die Wörter tendieren sollen, eine **Wortart** und eine **Schwierigkeit**, die sich danach richtet, wie oft das Wort im geschriebenen Englisch vorkommt. Der Bot vermeidet Wiederholungen von allem, was er in den letzten neunzig Tagen gepostet hat.

Server können außerdem mit `wotdadd` eine **eigene Liste** aufbauen. Lässt man die Definition weg, schlägt der Bot sie nach. Der **Quellmodus** legt fest, ob Beiträge aus dem Wörterbuch, aus der eigenen Liste kommen oder aus der eigenen Liste zuerst und aus dem Wörterbuch, sobald sie leer ist.

## Zeitplan nach Wochentag oder Monat

Regeln können Thema, Wortart und Schwierigkeit für einen bestimmten Wochentag oder Monat überschreiben. Eine Regel ändert nur die Felder, die sie setzt. Eine Montagsregel mit nur einem Thema verwendet also weiterhin die Grund-Wortart und die Grund-Schwierigkeit. Gelten beide, haben Wochentagsregeln Vorrang vor Monatsregeln, und Monatsregeln haben Vorrang vor den Grundeinstellungen.

Beispiele:

- `wotdday monday science` macht das Wort am Montag themenbezogen auf Wissenschaft.
- `wotddayfilter friday adjective rare` sorgt dafür, dass freitags seltene Adjektive kommen.
- `wotdmonth october spooky halloween` setzt den ganzen Oktober unter das Thema Halloween.
- `wotdschedule` zeigt jede Regel und welche Filter heute gelten.

## Diskussions-Thread

Ist er aktiviert, erstellt der Bot unter jedem täglichen Beitrag einen öffentlichen Thread und legt einen Startimpuls ab, der dazu einlädt, das Wort in einem Satz zu verwenden. Der Name des Threads kommt aus einer Vorlage (Standard `Word of the day: %wotd.word%`), die `%wotd.word%`, `%wotd.date%`, `%wotd.pos%` und die üblichen Platzhalter des Servers unterstützt. `wotdthread` schaltet ihn ein oder aus, `wotdthreadname` legt die Namensvorlage fest, zeigt sie an oder löscht sie, und `wotdthreadarchive` bestimmt, wie lange der Thread offen bleibt, bevor er automatisch archiviert wird (1 Stunde, 1 Tag, 3 Tage oder 1 Woche).

## Befehle

| Befehl | Was er macht |
| --- | --- |
| `wotd` | Zeigt das heutige Wort oder eine Vorschau, falls noch nichts gepostet wurde. |
| `wotdchannel #channel` | Legt den Kanal fest und schaltet das Posten ein. |
| `wotdtime 9` | Legt die lokale Stunde fest, zu der gepostet wird. |
| `wotdtimezone Europe/London` | Legt die Zeitzone fest. |
| `wotdtopic space` | Legt das Grundthema fest. |
| `wotdpos noun` | Beschränkt die Wortart. |
| `wotddifficulty rare` | Legt die Schwierigkeit fest. |
| `wotdmode mixed` | Wählt Wörterbuch, eigene Liste oder gemischt. |
| `wotdadd word [definition]` | Fügt ein eigenes Wort hinzu. |
| `wotdmessage` | Legt eine eigene Nachrichtenvorlage mit Platzhaltern oder Embed-JSON fest. |
| `wotdthread` | Schaltet den Diskussions-Thread unter jedem Beitrag ein oder aus. |
| `wotdthreadname [template\|clear]` | Legt die Namensvorlage des Threads fest, zeigt sie an oder löscht sie. |
| `wotdthreadarchive 1h\|24h\|3d\|7d` | Legt fest, wie lange der Thread offen bleibt, bevor er automatisch archiviert wird. |
| `wotdpost` | Postet sofort ein neues Wort. |

## Platzhalter für Nachrichten

`%wotd.word%`, `%wotd.definition%`, `%wotd.pos%`, `%wotd.example%`, `%wotd.phonetic%`, `%wotd.date%` und `%wotd.ping%` stehen in einer eigenen Vorlage zur Verfügung, zusammen mit den üblichen Platzhaltern des Servers.

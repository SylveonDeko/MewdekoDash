---
title: Highlights
slug: highlights
summary: Mitglieder wählen Wörter aus, auf die sie achten möchten, und erhalten eine DM mit Kontext, sobald im Server jemand eines davon schreibt.
icon: fa-bolt
category: Community
dashboard: /dashboard/highlights
module: Highlights
tags: [highlights, keywords, watch words, notifications, mentions, dm alerts, ignore channel, ignore user, Highlights, Schlüsselwörter, Benachrichtigungen, Erwähnungen, DM-Benachrichtigungen, Kanal ignorieren, Nutzer ignorieren]
related: [afk, utility]
---

## Was es macht

Ein Mitglied fügt mit `highlight add` ein Wort oder eine Wortgruppe hinzu. Ab dann schickt der Bot dem Mitglied eine DM, sobald eine Nachricht im Server dieses Wort enthält. Die DM nennt den Server und den Kanal, zeigt die letzten fünf Nachrichten davor sowie die passende Nachricht und hat einen Button **Zur Nachricht springen**.

Highlights sind persönlich. Jedes Mitglied verwaltet die eigene Liste, legt fest, welche Kanäle und Personen ignoriert werden, und kann Highlights ausschalten, ohne sie zu löschen. Das Team kann keine Highlights für andere hinzufügen, aber im Dashboard sehen, was beobachtet wird, und Einträge entfernen.

Mitglieder bekommen nur DMs für Kanäle, die sie tatsächlich sehen können. Wer im Server tippt, gilt als anwesend, daher pausieren Highlights für diese Person zwei Minuten lang.

## Wofür du es nutzen kannst

- Werde benachrichtigt, wenn dein Name, Spitzname oder Projekt genannt wird, ohne dass du direkt @erwähnt wirst.
- Verfolge ein Thema wie „Giveaway“ oder „Patchnotes“ über einen großen Server hinweg.
- Das Team kann auf Wörter wie „Hilfe“ oder „Melden“ achten, ohne jeden Kanal zu lesen.
- Moderatoren können prüfen, was Mitglieder verfolgen, und missbräuchliche oder spammige Einträge entfernen.

## So funktioniert der Abgleich

Der Bot prüft jede nicht leere Nachricht gegen jedes Highlight des Servers.

- Ein Highlight passt nur als ganzes Wort oder als ganze Wortgruppe. `cat` passt nicht auf „category“, wohl aber auf „the cat sat“.
- Der Abgleich unterscheidet Groß- und Kleinschreibung. Füge `Cat` und `cat` getrennt hinzu, wenn du beides willst.
- Jedes Mitglied bekommt pro Server höchstens eine DM alle zwei Minuten, egal wie viele Wörter passen.
- Wer irgendwo im Server tippt, startet dieselbe zweiminütige Pause, sodass du nicht über ein Gespräch benachrichtigt wirst, in dem du bereits bist.
- Nachrichten von ignorierten Nutzern und in ignorierten Kanälen werden für dieses Mitglied übersprungen.
- Die DM entfällt, wenn das Mitglied den Kanal nicht sehen kann oder DMs geschlossen hat.
- Nachrichten werden über eine Warteschlange geprüft, die alle zwei Sekunden eine Nachricht verarbeitet. Auf einem sehr ausgelasteten Shard können einige Nachrichten aus dieser Warteschlange verloren gehen.

`highlight match some text` prüft deine eigene Liste gegen einen Beispielsatz und sagt dir, welche deiner Wörter gepasst hätten. Diese Prüfung ignoriert Groß- und Kleinschreibung, ist also eine grobe Orientierung und keine exakte Kopie der Live-Regel.

## Einstellungen pro Mitglied

Jedes Mitglied hat eine Einstellungszeile, die beim ersten Umschalten einer Option angelegt wird.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Highlights an | an | `highlight toggle false` pausiert alle deine Highlights in diesem Server |
| Ignorierte Kanäle | keine | Kanäle, in denen deine Wörter nie eine DM auslösen |
| Ignorierte Nutzer | keine | Personen, deren Nachrichten nie deine Highlights auslösen |

## Einstellungen

Die Highlights-Seite im Dashboard ist für das Team gedacht. Sie fügt keine Highlights hinzu, sondern zeigt sie an und entfernt sie.

| Tab | Was er zeigt |
| --- | --- |
| Alle Highlights | Jedes Highlight des Servers, nach Mitglied gruppiert, mit einem Löschen-Button pro Wort und einem Button, um alle Wörter eines Mitglieds zu entfernen |
| Suche | Highlights finden, die ein Wort enthalten, über alle Mitglieder hinweg; die Suche ignoriert Groß- und Kleinschreibung |
| Deaktivierte Nutzer | Mitglieder, die ihre Highlights ausgeschaltet haben, mit der Anzahl der Kanäle und Nutzer, die sie ignorieren |
| Statistiken | Highlights gesamt, Aktive Nutzer, Top-Wort, Aktivster Nutzer sowie Meistmarkierte Wörter und Letzte Highlights |

## Einrichtung Schritt für Schritt

Es gibt nichts zu aktivieren. Highlights funktionieren, sobald der Bot im Server ist.

1. Führe als Mitglied `highlight add yourname` in einem beliebigen Kanal aus.
2. Führe `highlight list` aus, um zu prüfen, ob es gespeichert wurde.
3. Lass jemanden deinen Namen in einem anderen Kanal schreiben. Warte ein paar Sekunden und prüfe deine DMs.
4. Bekommst du zu viele Benachrichtigungen, führe `highlight toggleignore #busy-channel` oder `highlight toggleignore @user` aus.
5. Team: Öffne **Highlights** im Dashboard, prüfe den Tab **Alle Highlights** und entferne unerwünschte Einträge.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Dieselben Aktionen gibt es als einzelnen Slash-Befehl `/highlights manage`. Dessen Option `action` akzeptiert `Add`, `List`, `Delete`, `Match`, `ToggleUser`, `ToggleChannel` oder `ToggleGlobal`, zusätzlich gibt es die getrennten Optionen `words`, `user` und `channel`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `highlight add <word>` | `highlights`, `hl` | Niemand | Ein Wort oder eine Wortgruppe beobachten |
| `highlight list` | `highlights`, `hl` | Niemand | Deine Highlights durchblättern, zehn pro Seite |
| `highlight delete <number or word>` | `highlights`, `hl` | Niemand | Nach Listennummer oder exaktem Wort entfernen; `remove` macht dasselbe |
| `highlight match <text>` | `highlights`, `hl` | Niemand | Zeigt, welche deiner Wörter im Text vorkommen |
| `highlight toggleignore <#channel or @user>` | `highlights`, `hl` | Niemand | Einen Kanal oder eine Person zu deiner Ignorierliste hinzufügen oder davon entfernen |
| `highlight toggle <true or false>` | `highlights`, `hl` | Niemand | Alle deine Highlights in diesem Server ein- oder ausschalten |

## Tipps und Stolperfallen

- Der Bot muss den Kanal lesen können, um darin abzugleichen, und du brauchst geöffnete DMs von Servermitgliedern, um Benachrichtigungen zu erhalten.
- Ein Wort, das du bereits hast, wird abgelehnt. Die Dublettenprüfung ignoriert Groß- und Kleinschreibung, der Live-Abgleich aber nicht.
- Das Löschen per Nummer verwendet die Position aus `highlight list`, die sich nach jedem Entfernen ändert.
- Die Highlight-Liste und die Einstellungen werden pro Server dreißig Minuten lang zwischengespeichert. Einzelne Wörter, die über Befehle oder das Dashboard hinzugefügt oder gelöscht werden, wirken sofort. Wenn du im Dashboard alle Wörter eines Mitglieds entfernst, können bis zu dreißig Minuten vergehen, bis keine DMs mehr kommen.
- Wenn der Bot einen Server verlässt, werden seine Highlights und Einstellungen beim nächsten Neustart des Bots bereinigt.

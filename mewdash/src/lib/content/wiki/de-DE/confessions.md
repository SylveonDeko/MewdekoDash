---
title: Geständnisse
slug: confessions
summary: Mitglieder senden anonyme Geständnisse, die der Bot als nummerierte Embeds in einen Kanal postet, optional mit einem nur für das Team sichtbaren Log, das zeigt, wer jedes Geständnis geschickt hat.
icon: fa-comment
category: Community
dashboard: /dashboard/confessions
module: Confessions
tags: [confessions, confess, anonymous, secrets, confession channel, confession log, blacklist, Geständnisse, Geständnis, anonym, Geheimnisse, Geständniskanal, Geständnis-Log, Blacklist, Sperrliste]
related: [administration, moderation]
---

## Was es macht

Ein Mitglied führt `/confess` auf dem Server aus oder schreibt dem Bot eine DM mit `.confess <server id> "text"`, und der Bot postet die Nachricht im Geständniskanal als Embed mit dem Titel „Anonymous confession #N“. Der Name des Absenders erscheint im Kanal nie. Die Person erhält eine private Bestätigung, und die Nummer des Geständnisses steigt bei jedem Mal um eins.

Das Team kann einen separaten Log-Kanal festlegen. Jedes Geständnis wird dorthin mit Tag und ID des Absenders, der Nummer des Geständnisses und einem Sprunglink zur gesendeten Nachricht kopiert. Mitglieder erfahren in jeder Fußzeile eines Geständnisses, wie man ein Geständnis schickt, und in der Bestätigung, dass sie einen Server melden können, der die Funktion missbraucht.

Das Team kann außerdem einzelne Mitglieder auf die Blacklist setzen, damit ihre Geständnisse abgelehnt werden, und Geständnisse im Dashboard löschen, wobei auch die Discord-Nachricht entfernt wird.

## Wofür du es brauchst

- Frust- oder „Tee“-Kanäle, in denen Mitglieder sprechen wollen, ohne dass ein Name dranhängt.
- Kompliment- oder Wertschätzungskanäle, die anonym bleiben.
- Jeder anonyme Kanal, in dem das Team trotzdem einen Weg braucht, Belästigung nachzuverfolgen.

## Der Geständnis-Beitrag

Jedes Geständnis ist ein Embed im Geständniskanal:

| Teil | Inhalt |
| --- | --- |
| Autorenzeile | `Anonymous confession #N` mit dem Server-Icon |
| Beschreibung | Der Text des Geständnisses |
| Bild | Der Anhang, falls einer gesendet wurde |
| Fußzeile | `Do /confess or dm me .confess <server id> yourconfession to send a confession!` |
| Zeitstempel | Wann es gepostet wurde |

Die Nummerierung beginnt bei 1 und setzt beim letzten gespeicherten Geständnis fort. Wird ein Geständnis gelöscht, werden die anderen nicht neu nummeriert.

Anhänge werden in beide Richtungen unterstützt: Hänge eine Datei an `/confess` über die Option `attachment` an oder an die DM beim Textbefehl. Nur der erste Anhang wird verwendet.

## Der Log-Kanal

Ist ein **Log-Kanal** festgelegt, erzeugt jedes Geständnis dort zusätzlich ein rotes Embed mit **Nutzer** (Tag und ID), **Confession N** (dem Text), einem **Message Link** und einem Hinweis auf Missbrauch. Dies ist die einzige Stelle, an der der Absender offengelegt wird, beschränke ihn also auf Personen, denen du vertraust.

> [!WARNING]
> Der Log-Kanal existiert, damit das Team mit Belästigung umgehen kann. Wer den Absender eines Geständnisses weitergibt, riskiert, dass die Bot-Besitzer den Server auf die Blacklist setzen. Mitglieder können Missbrauch mit `/confessions report` melden.

## Blacklist

`confessionblacklist` setzt ein Mitglied auf die Blacklist des Servers, `confessionunblacklist` entfernt es wieder. Gesperrte Mitglieder erhalten die Meldung „you are blacklisted“ statt eines Beitrags. Geprüft wird über die Nutzer-ID.

Das Dashboard zeigt eine **Rollen-Blacklist** und speichert Rollen-IDs in derselben Liste. Der Bot vergleicht bei einem eingehenden Geständnis nur die Nutzer-ID des Absenders mit der Liste, Rollen, die im Dashboard ausgewählt werden, sperren also derzeit niemanden. Nutze die Befehle, um bestimmte Mitglieder zu sperren.

## Einstellungen

Die Seite **Geständnisse** hat drei Reiter: **Konfiguration**, **Geständnisse** und **Statistiken**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Geständniskanal | keiner | Wo anonyme Geständnisse gepostet werden; Geständnisse sind aus, bis er festgelegt ist |
| Log-Kanal (zeigt Nutzer-IDs) | keiner | Wohin die identifizierende Kopie jedes Geständnisses geht |
| Rollen-Blacklist | keine | Siehe Abschnitt Blacklist oben |

**Geständnisse** listet jedes gespeicherte Geständnis, das neueste zuerst, mit Nummer und Datum. Der Inhalt bleibt verborgen, bis du ihn aufklappst, und **Geständnis löschen** entfernt es aus der Datenbank und löscht die Nachricht in Discord, falls sie noch existiert.

**Statistiken** zeigt **Geständnisse gesamt**, **Diesen Monat**, **Heute** und **Letzte Nummer**.

## Einrichtung Schritt für Schritt

1. Erstelle einen Kanal, in dem der Bot Send Messages und Embed Links hat und Mitglieder lesen, aber idealerweise nicht schreiben können.
2. Öffne **Geständnisse** im Dashboard und wähle diesen Kanal als **Geständniskanal**.
3. Wähle optional einen privaten Team-Kanal als **Log-Kanal**.
4. Klicke auf **Konfiguration speichern**.
5. Führe `/confess` mit einem Mitgliedskonto aus und prüfe, dass das Embed mit `#1` erscheint.
6. Wenn jemand missbraucht, finde ihn im Log-Kanal und führe `confessionblacklist @user` aus.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast). Die Slash-Versionen liegen unter `/confessions`, außer `/confess`, das auf oberster Ebene steht.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `confess <server id> <"text">` | | Niemand | Nur per DM. Ein Geständnis auf dem angegebenen Server posten; Text aus mehreren Wörtern in Anführungszeichen setzen |
| `confessionchannel [#channel]` | `confesschannel` | Kanäle verwalten | Den Geständniskanal festlegen oder Geständnisse ohne Kanal ausschalten |
| `confessionlogchannel [#channel]` | `confesslogchannel`, `confessionlogchnl` | Administrator | Den Log-Kanal festlegen |
| `confessionblacklist <@user>` | `confessblacklist`, `confessbl` | Kanäle verwalten | Verhindern, dass ein Mitglied gesteht |
| `confessionunblacklist <@user>` | `confessunblacklist`, `confessunbl` | Kanäle verwalten | Einem gesperrten Mitglied erlauben, wieder zu gestehen |

`/confessions report <server id> <description>` sendet eine Meldung an die Bot-Besitzer über einen Server, der Geständnisse missbraucht. Eine Textversion gibt es dafür nicht.

## Tipps und Stolperfallen

- Der Bot braucht Send Messages und Embed Links sowohl im Geständniskanal als auch im Log-Kanal. Die Kanalbefehle warnen, wenn sie fehlen, speichern die Einstellung aber trotzdem.
- Der Textbefehl `confess` funktioniert nur per DM und nimmt das Geständnis als ein einziges Argument, sodass `confess 123456789 "I like pineapple on pizza"` funktioniert, die Variante ohne Anführungszeichen aber nur das erste Wort postet. Für Mitglieder ist `/confess` im Server einfacher.
- `confess` per DM funktioniert nur für Server, die du mit dem Bot teilst; andere Server-IDs werden abgelehnt.
- Der Textbefehl `confessionlogchannel` ohne Kanal leert den Geständniskanal statt des Log-Kanals. Leere den Log-Kanal stattdessen im Dashboard.
- Geständnisse werden mit der Nutzer-ID des Absenders gespeichert, auch ohne Log-Kanal, und das Dashboard kann den Absender eines einzelnen Geständnisses nachschlagen. Behandle den Dashboard-Zugriff als reserviert für das Team.
- Das Löschen im Dashboard entfernt den gespeicherten Eintrag, die Kopie im Log-Kanal ist also deine einzige verbleibende Spur.

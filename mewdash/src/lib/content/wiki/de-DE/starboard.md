---
title: Starboard
slug: starboard
summary: Lass Mitglieder die besten Nachrichten mit einer Reaktion bewerten und alles, was die Schwelle erreicht, in einen eigenen Highlight-Kanal erneut posten.
icon: fa-star
category: Community
dashboard: /dashboard/starboard
module: Starboard
tags: [starboard, stars, highlights, best of, reactions, pins, repost, threshold, Sterne, Bestenliste, Reaktionen, Anheften, erneut posten, Schwelle]
related: [settings, logging]
---

## Was es macht

Ein Starboard ist ein Kanal, in dem der Bot Nachrichten erneut postet, die genug Leute mit einem gewählten Emote reagiert haben. Mitglieder reagieren auf etwas Lustiges oder Nützliches; sobald die Anzahl der Reaktionen die Schwelle erreicht, kopiert der Bot die Nachricht in den Starboard-Kanal, mit dem Namen des Autors, dem Text, allen Bildern oder Videos, den aktuellen Reaktionszahlen und einem Button **Zu Nachricht springen**.

Der Beitrag wird laufend aktualisiert, während Reaktionen hinzukommen oder wegfallen. Fällt die Anzahl unter die Schwelle, kann der Beitrag entfernt werden. Wird die ursprüngliche Nachricht gelöscht oder werden ihre Reaktionen entfernt, kann der Beitrag ebenfalls entfernt werden.

Ein Server kann mehrere Starboards gleichzeitig betreiben, jedes mit eigenem Kanal, eigenem Emote oder eigenen Emotes, eigener Schwelle und eigenen Regeln. Ein Board „Beste Memes“, das ein Emote beobachtet, und ein Board „Hilfreiche Antworten“, das ein anderes beobachtet, können nebeneinander laufen.

## Wofür du es verwenden würdest

- Der Community eine Möglichkeit geben, die besten Inhalte hervorzuheben, ohne dass das Team sie kuratieren muss.
- Einen langlebigen Highlight-Kanal führen, durch den neue Mitglieder scrollen können.
- Getrennte Boards für Humor, Kunst oder hilfreiche Antworten betreiben, jeweils mit anderen Emotes.
- Festlegen, welche Kanäle in das Board einspeisen, damit Bot-Spam und themenfremde Kanäle draußen bleiben.

## Mehrere Starboards und Emotes

Jedes Starboard wird durch eine numerische ID identifiziert, die von `liststarboards` und in der Dashboard-Liste angezeigt wird. Befehle nehmen diese ID als erstes Argument.

Ein Starboard startet mit einem Emote, es können aber weitere hinzugefügt werden. Jedes seiner Emotes zählt zur gleichen Gesamtsumme, und der Beitrag zeigt für jedes Emote eine eigene Anzahl. Ein Emote kann auf dem Server nur zu einem Starboard gehören; wenn du es erneut verwendest, schlägt das mit „emote already in use“ fehl. Ein Starboard muss mindestens ein Emote behalten, daher kann das letzte nicht entfernt werden.

Eigene Emotes funktionieren genauso wie Unicode-Emotes. Der Bot prüft das Emote, indem er auf deine Befehlsnachricht reagiert, es muss also eines sein, das der Bot verwenden kann.

## Schwellen und Zählung

Die **Stern-Schwelle** gibt an, wie viele Reaktionen eine Nachricht braucht, bevor sie gepostet wird. Der Standardwert im Befehl ist 1; das Dashboard verlangt mindestens 1.

Beim Zählen gilt:

- Reaktionen von Bot-Konten werden ignoriert.
- Die Reaktionen aller Emotes, die zu diesem Starboard gehören, werden zusammengezählt.
- Die eigene Reaktion des Autors wird mitgezählt. Eine Selbst-Markierung ist nicht ausgeschlossen.
- Der Bot reagiert nur auf Nachrichten mit Text oder Anhang. Eine Nachricht ohne beides wird übersprungen.

Liegt die Gesamtzahl unter der Schwelle und existiert bereits ein Beitrag, wird der Beitrag gelöscht, wenn **Unter Schwelle entfernen** aktiv ist. Andernfalls bleibt der Beitrag unverändert.

## Bot-Nachrichten

Standardmäßig werden Nachrichten von Bots nie gepostet. Aktiviere **Bot-Nachrichten erlauben**, um sie einzuschließen. Bei einer Bot-Nachricht stammt der Text aus der Beschreibung des ersten Embeds, falls vorhanden, andernfalls aus dem einfachen Inhalt; das Bild stammt aus dem ersten Anhang oder dem ersten Embed-Bild. Wenn Bot-Nachrichten erlaubt sind, werden auch Bot-Reaktionen in den Zahlen pro Emote auf dem Beitrag mitgezählt.

## Repost-Schwelle

Normalerweise bearbeitet der Bot den bestehenden Starboard-Beitrag direkt, sobald sich die Anzahl ändert. Sobald ein Board stark genutzt wird, kann dieser Beitrag weit oben im Kanal liegen, wo niemand die aktualisierte Anzahl sieht.

Die **Repost-Schwelle** behebt das. Setze sie auf eine Zahl N, dann prüft der Bot bei jeder Aktualisierung die letzten N Nachrichten im Starboard-Kanal. Befindet sich der bestehende Beitrag darunter, wird er bearbeitet. Ist er weiter zurückgerutscht, wird der alte Beitrag gelöscht und unten ein neuer gesendet. Setze den Wert auf 0, um das erneute Posten zu deaktivieren und immer direkt zu bearbeiten.

## Kanalfilterung

Jedes Starboard hat eine Kanalliste und einen Modus:

| Modus | Wirkung |
| --- | --- |
| Whitelist (Standard) | Nur Nachrichten in den aufgeführten Kanälen werden berücksichtigt. Eine leere Liste bedeutet alle Kanäle. |
| Blacklist | Nachrichten in den aufgeführten Kanälen werden ignoriert. Alles andere wird berücksichtigt. |

`starboardchtoggle <id> #channel` fügt einen Kanal zur Liste hinzu oder entfernt ihn. Die Aktion **Kanäle verwalten** im Dashboard macht dasselbe.

## Der Starboard-Beitrag

Der Beitrag wird aus Komponenten statt aus einem klassischen Embed aufgebaut:

- Eine Zeile über dem Container mit jedem Emote und seiner Anzahl.
- Der Name des Autors, verlinkt mit seinem Profil.
- Der Nachrichtentext.
- Eine Mediengalerie mit Bild- und Videoanhängen.
- Bis zu drei weitere Anhänge, die im Starboard-Kanal erneut hochgeladen werden. Schlägt ein Download fehl, werden stattdessen Dateiname und Größe angezeigt.
- Ein Link-Button **Zu Nachricht springen**.

Erwähnungen im erneut geposteten Text werden unterdrückt, damit eine markierte Nachricht niemanden ein zweites Mal benachrichtigt.

## Entfernungsregeln

| Regel | Standard | Wann sie greift |
| --- | --- | --- |
| Beim Löschen entfernen | An | Die ursprüngliche Nachricht wird gelöscht. Der Bot braucht die Berechtigung Nachrichten verwalten im Quellkanal. |
| Beim Leeren der Reaktionen entfernen | An | Ein Moderator entfernt alle Reaktionen von der Originalnachricht. |
| Unter Schwelle entfernen | An | Die Gesamtzahl fällt nach dem Entfernen einer Reaktion unter die Schwelle. |

## Statistiken

`starboardstats` zeigt Gesamtwerte für den Server: Anzahl markierter Nachrichten, Sterne insgesamt, das meistmarkierte Mitglied, den aktivsten Kanal und den aktivsten Markierer. `starboarduserstats [@user]` zeigt für ein Mitglied die Anzahl markierter Nachrichten, erhaltene Sterne, vergebene Sterne, seine Top-Beiträge, wer es am häufigsten markiert und wen es selbst am häufigsten markiert. Beide sind für alle nutzbar.

## Einstellungen

Die Starboard-Seite hat zwei Abschnitte: **Neues Starboard erstellen** und **Starboards verwalten**. Jeder Eintrag in der Liste zeigt Kanal, Emote, Schwelle und Repost-Schwelle, mit Buttons für **Starboard-Einstellungen**, **Kanäle verwalten** und **Löschen**.

Innerhalb von **Starboard-Einstellungen**:

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Stern-Schwelle | Bei der Erstellung festgelegt | Reaktionen, die nötig sind, bevor eine Nachricht gepostet wird |
| Repost-Schwelle | 0 (deaktiviert) | Wie viele aktuelle Nachrichten durchsucht werden, bevor unten neu gepostet wird |
| Stern-Emotes | Das Emote der Erstellung | Emotes hinzufügen oder entfernen, die für dieses Board zählen |
| Bot-Nachrichten erlauben | Aus | Von Bots geschriebene Nachrichten einschließen |
| Beim Löschen entfernen | An | Den Beitrag entfernen, wenn das Original gelöscht wird |
| Beim Leeren der Reaktionen entfernen | An | Den Beitrag entfernen, wenn Reaktionen geleert werden |
| Unter Schwelle entfernen | An | Den Beitrag entfernen, wenn die Anzahl unter die Schwelle fällt |
| Kanalmodus | Whitelist | Ob die Kanalliste eine Whitelist oder eine Blacklist ist |

> [!TIP]
> Starte auf einem aktiven Server mit einer Schwelle von 3 bis 5. Eine Schwelle von 1 macht aus jeder versehentlichen Reaktion einen Beitrag.

## Einrichtung Schritt für Schritt

1. Erstelle einen Kanal für Highlights und stelle sicher, dass der Bot dort Nachrichten senden, Links einbetten und Dateien anhängen kann.
2. Öffne **Starboard** im Dashboard.
3. Wähle unter **Neues Starboard erstellen** den Kanal, wähle ein Emote aus den Schnellauswahlen oder gib ein eigenes ein, setze **Schwelle (benötigte Reaktionen)** und drücke **Starboard erstellen**.
4. Öffne **Starboard-Einstellungen** beim neuen Eintrag. Füge unter **Stern-Emotes** weitere Emotes hinzu und setze eine **Repost-Schwelle** wie 20, wenn das Board stark genutzt wird.
5. Nutze **Kanäle verwalten**, um die Kanäle auf die Whitelist zu setzen, die das Board speisen sollen, oder stelle **Kanalmodus** auf Blacklist um und liste die Kanäle auf, die ausgeschlossen werden sollen.
6. Reagiere auf eine Testnachricht so oft mit dem Emote, bis die Schwelle erreicht ist, und prüfe, ob der Beitrag erscheint.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). `<id>` ist die Starboard-ID aus `liststarboards`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `createstarboard #channel <emote> [threshold]` | `addstarboard`, `newstarboard` | Kanäle verwalten | Ein Starboard erstellen, die Schwelle ist standardmäßig 1 |
| `deletestarboard <id>` | `removestarboard`, `delstarboard` | Kanäle verwalten | Eine Starboard-Konfiguration entfernen |
| `liststarboards` | `starboardlist`, `starboards` | Niemand | Durch alle Starboards und ihre Einstellungen blättern |
| `setstarthreshold <id> <number>` | `starthreshold` | Kanäle verwalten | Die benötigten Reaktionen festlegen |
| `setrepostthreshold <id> <number>` | `starboardrepost`, `repostthreshold` | Kanäle verwalten | Das Repost-Fenster festlegen, 0 deaktiviert es |
| `addstarboardemote <id> <emote>` | `addstaremote`, `starboardaddemote`, `asbe` | Kanäle verwalten | Ein Emote zu einem Starboard hinzufügen |
| `removestarboardemote <id> <emote>` | `removestaremote`, `starboardremoveemote`, `rsbe` | Kanäle verwalten | Ein Emote entfernen, das letzte kann nicht entfernt werden |
| `starboardallowbots <id> <true or false>` | `starbots`, `starbotsallow`, `starbab` | Kanäle verwalten | Von Bots geschriebene Nachrichten erlauben |
| `starboardremoveondelete <id> <true or false>` | `starboarddelete`, `stardelete`, `srod` | Kanäle verwalten | Den Beitrag entfernen, wenn das Original gelöscht wird |
| `starboardremoveonreactionsclear <id> <true or false>` | `starboardreactionclear`, `starclear` | Kanäle verwalten | Den Beitrag entfernen, wenn Reaktionen geleert werden |
| `starboardremoveonbelowthreshold <id> <true or false>` | `starboardbelowthreshold`, `starbelow`, `srobt` | Kanäle verwalten | Den Beitrag entfernen, wenn er unter die Schwelle fällt |
| `starboardwlmode <id> <whitelist or blacklist>` | `starboardmode`, `starboardwhitelist`, `swm` | Kanäle verwalten | Festlegen, wie die Kanalliste behandelt wird |
| `starboardchtoggle <id> #channel` | `starboardchannel`, `togglestarboardchannel`, `scht` | Kanäle verwalten | Einen Kanal zur Liste hinzufügen oder daraus entfernen |
| `starboardstats` | `starstats`, `starboardstatistics`, `sbstats` | Niemand | Serverweite Starboard-Statistiken |
| `starboarduserstats [@user]` | `staruserstats`, `userstarstats`, `sbuserstats` | Niemand | Statistiken für ein Mitglied |

Die Slash-Entsprechungen findest du unter `/starboard`.

## Tipps und Stolperfallen

- Der Bot tut stillschweigend nichts, wenn er im Starboard-Kanal nicht senden kann. Prüfe zuerst die Kanalberechtigungen.
- Beim Löschen entfernen funktioniert nur, wenn der Bot im Kanal der Originalnachricht die Berechtigung Nachrichten verwalten hat.
- Reaktionen von Bots zählen nie zur Schwelle, daher kann ein anderer Bot, der automatisch reagiert, keine Nachrichten auf das Board schieben.
- Das Löschen eines Starboards entfernt nur seine Konfiguration. Bestehende Beiträge im Kanal bleiben erhalten.
- Dasselbe Emote kann nicht von zwei Boards gemeinsam genutzt werden. Wähle für jedes Board eigene Emotes.
- Sehr große Anhänge lassen sich unter Umständen nicht erneut hochladen; der Beitrag listet dann stattdessen den Dateinamen auf.

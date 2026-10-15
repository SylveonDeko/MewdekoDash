---
title: Hilfe und Befehle
slug: help
summary: So findest du die Befehle des Bots direkt in Discord und verstehst sie: das Hilfemenü nach Kategorien, Modulübersichten, Hilfeseiten für einzelne Befehle, Befehlssuche und den Einrichtungsassistenten im Dashboard, auf den der Bot beim Beitritt verlinkt.
icon: fa-life-ring
category: General
module: Help
tags: [help, commands, modules, search command, slash commands, prefix, setup wizard, invite, guide, source, donate, vote, Hilfe, Befehle, Module, Befehl suchen, Slash-Befehle, Präfix, Einrichtungsassistent, Einladung, Anleitung, Quellcode, Spenden, Voten]
related: [permissions, administration, userprofile]
---

## Was es macht

Das Hilfe-Modul zeigt Mitgliedern, was der Bot alles kann. `help` (oder `cmds`) öffnet ein Menü mit den Befehlskategorien, jeweils mit Anzahl der Module und Befehle, dazu ein Auswahlmenü, um eine Kategorie zu öffnen. Wählst du eine Kategorie, werden ihre Module angezeigt. Wählst du ein Modul, siehst du seine Befehle zehn pro Seite mit kurzen Beschreibungen. Bei sehr großen Modulen erscheint zuerst eine Übersicht, die die Befehle in Abschnitte unterteilt.

`help <command>` zeigt einen einzelnen Befehl: Name und ersten Alias, was er tut, die Discord-Berechtigungen, die du und der Bot brauchen, eine Abklingzeit (falls vorhanden), den passenden Slash-Befehl, jeden Parameter, alternative Schreibweisen, Verwendungsbeispiele und einen Link zur Dokumentation. Mit dem Button **Ausführen** startest du den Befehl direkt von der Hilfeseite aus. Hat er Argumente, öffnet sich zuerst ein Formular dafür.

`searchcommand <term>` findet Befehle, deren Name oder Beschreibung den Begriff enthält. Wenn du den Bot ohne Text erwähnst, antwortet er mit dem aktuellen Präfix und einem Hinweis auf `cmds`.

Jeder Befehl gibt es als Textversion, die mit dem Server-Präfix verwendet wird, und in den meisten Fällen auch als Slash-Version. Das Hilfemenü und die Befehlsseiten sind in beiden Fällen gleich. `/help`, `/search` und `/invite` sind die Slash-Einstiegspunkte.

## Wozu du es nutzt

- Ein neues Mitglied tippt `.help` und braucht einen sinnvollen Einstieg.
- Das Team will genau wissen, welche Berechtigung ein Befehl braucht, bevor es sie vergibt.
- Jemand erinnert sich nur an die Hälfte eines Befehlsnamens und möchte danach suchen.
- Du hast den Bot gerade eingeladen und willst eine geführte Einrichtung, statt die Doku jedes Moduls zu lesen.

## Das Hilfemenü

`help`, `commands` oder `modules` ohne Argumente öffnet die oberste Ebene. Die Beschreibung des Embeds erklärt die zwei Wege: eine Kategorie im Auswahlmenü wählen oder `h commandname` für einen einzelnen Befehl nutzen. Außerdem enthält es Links zur Dokumentation, zum Support-Server, zur Einladungsseite und zur Spendenseite.

| Kategorie | Enthält |
| --- | --- |
| Moderation & Admin | Administration, Moderation, Permissions, Server Management, Role States, Status Roles, Counting Moderation |
| Server-Einrichtung | MultiGreets, Role Greets, Starboard, Stat Channels, Suggestions, Tickets, Confessions, Channel Access, Custom Voice, Chat Triggers, Polls, Giveaways |
| Spaß & Spiele | Games, Counting, NSFW, Searches, Minecraft, Switch |
| Wirtschaft & Level | Currency, XP, Reputation, Vote, Patreon |
| Musik | Music |
| Nützliches | Utility, Help, AFK, Todo, User Profile, Birthday, Highlights, Copr Monitoring |
| Bot-Besitzer | Nur für Bot-Besitzer gedachte Module |
| Sonstiges | Alles, was oben nicht einsortiert ist |

Ein Button **Beschreibungen umschalten** wechselt zwischen der kompakten Liste und einer längeren Ansicht. Dort wird jedes Modul unter seiner Kategorie aufgeführt, mit einem Haken oder Kreuz, das zeigt, ob es für dich im aktuellen Kanal aktiviert ist. Ein Globus mit Kreuz bedeutet, dass die Bot-Besitzer das Modul überall deaktiviert haben.

### Modulseiten

`commands <module>` springt direkt zu einem Modul. Der Name kann exakt oder ein eindeutiger Präfix sein. `cmds mod` öffnet also Moderation, während `cmds s` meldet, dass mehrere Module passen. Füge ein Wort nach dem Modul hinzu, um zu filtern: `cmds utility remind` listet nur Befehle aus Utility, deren Name oder Beschreibung „remind“ enthält.

Module mit mehr als 30 Befehlen und mindestens drei Abschnitten zeigen zuerst eine Übersicht: die Modulbeschreibung, ein Feld pro Abschnitt mit der Anzahl der Befehle, ein Auswahlmenü zum Öffnen eines Abschnitts, einen Button **Alle Befehle**, einen Button **Suchen**, der ein Formular öffnet, und **Zurück**. Kleinere Module gehen direkt zur seitenweisen Liste. Seiten enthalten zehn Befehle, nach Abschnitten gruppiert, mit Buttons für Erste, Vorherige, Springen, Nächste, Letzte, Zurück und Schließen. Die Seitennavigation bleibt eine Stunde aktiv.

## Befehlsseiten

`help <command>` findet den exakten Namen oder einen beliebigen Alias. Das Embed enthält:

- Den Befehl mit Präfix und erstem Alias sowie seine Beschreibung.
- **User Permissions**: was du brauchst. Wenn eine Discord-Berechtigungsüberschreibung aus dem Administration-Modul die eingebaute Anforderung ersetzt, wird das Original durchgestrichen angezeigt und die Überschreibung danach aufgelistet.
- **Bot Permissions**: was der Bot braucht.
- **Documentation**: ein Link zur Befehlsseite auf der Dokumentationsseite.
- **Abklingzeit**: nur angezeigt, wenn der Befehl eine Abklingzeit hat.
- **Slash Command**: eine anklickbare Erwähnung der Slash-Version, falls vorhanden.
- **Parameters**, **Overloads** und **Auslastung** aus der Befehlsdokumentation. Sie listen jedes Argument auf, ob es optional ist und welchen Standardwert es hat.
- Eine Fußzeile mit Modul, Untermodul und Methodenname, nützlich beim Melden von Fehlern.

Der Button **Ausführen** führt den Befehl so aus, als hättest du ihn getippt. Braucht er Argumente, fragt zuerst ein Formular danach. Administratoren sehen außerdem einen Button **Berechtigungen**, der das Schnellmenü für Befehlsberechtigungen für diesen Befehl öffnet. Er wird im Artikel zu den Befehlsberechtigungen beschrieben.

## Slash- versus Textbefehle

Textbefehle verwenden das Server-Präfix, standardmäßig `.`, und die exakten Namen aus dem Hilfemenü. Slash-Befehle sind gruppiert. Ein Textbefehl wie `setprivacy` erscheint also als `/setprivacy`, während Berechtigungsbefehle unter `/permissions servercommand` liegen. Die Befehlsseite zeigt die Slash-Erwähnung, damit du sie anklicken kannst. Beide Formen unterliegen denselben Berechtigungsregeln.

## Wenn der Bot beitritt

Wird der Bot einem Server hinzugefügt, ermittelt er über das Audit-Log, wer ihn eingeladen hat (dafür braucht er die Berechtigung Audit-Log anzeigen), und schickt dieser Person eine DM. Die Nachricht enthält einen Button **Mewdeko einrichten**, der zum Einrichtungsassistenten im Dashboard für diesen Server führt. Außerdem gibt es eine dreistufige Erinnerung an `cmds`, `cmds mod` und `h purge` sowie den Link zum Support-Server. Lässt sich der Einlader nicht ermitteln oder hat er DMs geschlossen, wird nichts gesendet. Eine Ankündigung im Kanal gibt es nicht.

## Der Einrichtungsassistent

Der Assistent liegt unter `/wizard?guild=<id>` im Dashboard. Der Link in der Willkommens-DM öffnet die Schnelleinrichtung. Das Dashboard selbst kann die Ersteinrichtung anbieten, die am Anfang eine Berechtigungsprüfung enthält.

| Schritt | Was passiert |
| --- | --- |
| Willkommen | Erklärt, was gleich passiert |
| Berechtigungen | Nur beim ersten Mal: prüft, ob der Bot alles hat, was er braucht |
| Server-Grundlagen | Präfix, Bot-Sprache und Server-Zeitzone |
| Funktionen auswählen | Wähle, was eingerichtet werden soll. Funktionen sind als vollständige Einrichtung oder Schnellaktivierung markiert |
| Ein Schritt pro Funktion mit vollständiger Einrichtung | Geführte Konfiguration für diese Funktion |
| Schnelleinrichtung | Aktiviert die übrigen Funktionen mit ihren Standardwerten |
| Abgeschlossen | Zusammenfassung, inklusive allem, was nicht gespeichert werden konnte |

Der Fortschritt wird pro Server gespeichert. Wenn du gehst und zurückkommst, machst du dort weiter. Ein Server kann als übersprungen markiert werden, damit der Assistent sich nicht mehr anbietet. Auf der Seite **Meine Einstellungen** gibt es einen Schalter, ob du die geführte Einrichtung bevorzugst, sowie einen Reset für den Assistenten-Status eines Servers.

## Einstellungen

Für die Hilfe selbst gibt es nichts zu konfigurieren. Das Präfix wird über das Administration-Modul gesetzt und in jedem Hilfe-Embed angezeigt.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Präfix | `.` | Das Präfix, das im Hilfetext angezeigt und für den Button **Ausführen** verwendet wird |
| Ausführliche Berechtigungen | aus | Ob ein blockierter Befehl erklärt, welche Berechtigungsregel ihn blockiert hat (siehe Befehlsberechtigungen) |

## Einrichtungsanleitung

1. Führe `help` aus und öffne eine Kategorie im Auswahlmenü, um zu sehen, wie Module gruppiert sind.
2. Führe `cmds mod` aus, um das Moderation-Modul zu sehen, und danach `h purge`, um einen Befehl vollständig zu sehen.
3. Probiere den Button **Ausführen** bei einem harmlosen Befehl wie `h ping`.
4. Führe `searchcommand role` aus, um zu sehen, wie die Suche die Ergebnisse eingrenzt.
5. Wenn du den Bot gerade eingeladen hast, folge dem Link **Mewdeko einrichten** aus der Willkommens-DM oder öffne `/wizard?guild=<your server id>` im Dashboard.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `help [command]` | `h` | Niemand | Hilfemenü oder Hilfe für einen Befehl |
| `commands [module] [term]` | `cmds` | Niemand | Modulliste, Befehle eines Moduls oder eine gefilterte Liste |
| `modules` | `mdls` | Niemand | Dasselbe oberste Menü wie `help` |
| `searchcommand <term>` | | Niemand | Befehlsnamen und Beschreibungen durchsuchen, bis zu 20 Ergebnisse |
| `guide` | `readme` | Niemand | Link zur Anleitung für den Einstieg |
| `source` | `github`, `repo`, `gitlab`, `bitbucket` | Niemand | Link zum Quellcode |
| `donate` | | Niemand | Wie du den Bot unterstützen kannst |
| `vote` | | Niemand | Link, um für den Bot zu voten |
| `exportcommandsjson` | `exportcommands`, `excj` | Niemand | Alle Befehle als JSON-Datei exportieren (einmal pro Minute) |

Nur Slash: `/search <command>` mit Autovervollständigung und `/invite`. `/help`, `/commands <module> [filter]`, `/donate`, `/guide`, `/source` und `/vote` spiegeln die Textbefehle.

## Tipps und Stolperfallen

- Wenn `help` bei einem Modul für dich ein Kreuz zeigt, blockiert eine Berechtigungsregel das Modul, oder die Bot-Besitzer haben es in diesem Kanal deaktiviert. Bitte das Team, `listperms` zu prüfen.
- Hilfeseiten spiegeln die tatsächlichen Voraussetzungen des Befehls wider. Eine dort aufgeführte Berechtigung ist daher maßgeblich, auch wenn die Dokumentationsseite hinterherhinkt.
- Der Button **Ausführen** nutzt deine eigenen Berechtigungen, nicht die des Bots. Er ist eine Bequemlichkeit, keine Umgehung.
- Die Modulsuche per Präfix ist bei kurzen Präfixen oft mehrdeutig. Verwende mindestens drei oder vier Buchstaben.
- Der Bot schreibt dem Einlader nur beim Beitritt eine DM. Wenn du ihn über einen geteilten Link eingeladen hast und nichts bekommen hast, öffne stattdessen den Assistenten über das Dashboard.

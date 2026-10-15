---
title: Minecraft
slug: minecraft
summary: Registriere deine Minecraft-Server, poste Live-Status-Embeds, die sich selbst aktualisieren, erhalte Online- und Offline-Warnungen, führe RCON-Befehle aus und verbinde den Ingame-Chat, Beitritte, Tode und Fortschritte mit Discord über das Begleit-Plugin.
icon: fa-server
category: Entertainment
dashboard: /dashboard/minecraft
module: Minecraft
tags: [minecraft, mc, server status, bridge, rcon, whitelist, chat bridge, java, bedrock, geyser, player lookup, skin, Serverstatus, Brücke, Whitelist, Chat-Brücke, Spielersuche]
related: [statchannels, logging, utility]
---

## Was es macht

Das Team registriert einen oder mehrere Minecraft-Server mit Name und Adresse. Jedes Mitglied kann dann `mcstatus` ausführen, um zu sehen, ob der Server läuft, wie sein MOTD, seine Version, seine Latenz und die Online-Spieler lauten. Ein Server kann auch überwacht werden: Der Bot postet ein Status-Embed in einen Kanal und aktualisiert es per Timer oder schreibt die Spielerzahl in das Kanalthema und meldet, wenn der Server ausfällt oder zurückkommt.

Hat der Server RCON aktiviert, kann das Team Konsolenbefehle senden und die Whitelist von Discord oder der Dashboard-Konsole aus verwalten, ohne dem Spiel beizutreten.

Das optionale Begleit-Plugin macht die Verbindung zu einer Brücke in beide Richtungen. Spielerchat, Beitritte, Austritte, Tode und Fortschritte werden in Discord-Kanäle deiner Wahl gepostet, und Nachrichten, die im Brücken-Kanal getippt werden, werden an die Spieler im Spiel übertragen.

## Wofür du es nutzen kannst

- Ein Live-Embed „Wer ist online" zeigen, damit Mitglieder wissen, wann sich das Einloggen lohnt.
- Die Community in dem Moment warnen, in dem der Server abstürzt oder nach Wartungsarbeiten zurückkommt.
- Neue Mitglieder von Discord aus auf die Whitelist setzen, ohne die Serverkonsole zu öffnen.
- Mitglieder, die nur auf Discord sind, mit Ingame-Chat, Toden und Fortschritten auf dem Laufenden halten.
- Die UUID oder das Skin-Rendering eines Spielers nachschlagen, während man eine Bewerbung oder Meldung bearbeitet.

## Servertypen

| Typ | Standard-Port | Wie er abgefragt wird |
| --- | --- | --- |
| Java Edition | 25565 | Server-List-Ping; das Query-Protokoll wird zusätzlich genutzt, wenn der **Query-Port** gesetzt ist und `enable-query=true` gilt |
| Bedrock Edition | 19132 | Bedrock-Ping |
| Geyser (Java + Bedrock) | 25565 | Java-Ping, als Geyser markiert |

Jeder Server hat einen Namen, der kleingeschrieben gespeichert wird, und der erste Server, den du hinzufügst, wird zum Standard, den `mcstatus` ohne Argumente verwendet. Private, reservierte und Loopback-Adressen werden abgelehnt, sofern der Bot-Host sie nicht erlaubt hat.

## Einen Server überwachen

Lege einen **Überwachungskanal** fest, und der Bot fragt den Server alle **Überwachungsintervall**-Minuten ab (Standard 5, Minimum 1). Was er mit dem Ergebnis macht, hängt vom **Überwachungsmodus** ab.

| Modus | Verhalten |
| --- | --- |
| Embed (an Ort und Stelle bearbeiten) | Postet ein Status-Embed und bearbeitet es bei jedem Durchlauf; postet es neu, wenn die Nachricht gelöscht wird |
| Kanalthema | Schreibt eine kurze Statuszeile in das Kanalthema, höchstens einmal alle fünf Minuten |
| Beides | Macht beides oben Genannte |

Jeder Durchlauf speichert außerdem eine Momentaufnahme von Online-Status, Spielerzahl, Latenz und Version. Der Dashboard-Tab **Verlauf** stellt diese über die Zeit grafisch dar.

Wechselt der Online-Status, postet der Bot im Überwachungskanal eine Warnung: standardmäßig ein grünes „kam online"- oder rotes „ging offline"-Embed, oder deine eigenen Vorlagen für **Server-Online-Warnung** und **Server-Offline-Warnung**.

### Status-Platzhalter

Das **Eigene Überwachungs-Embed** und beide Warnungsvorlagen laufen durch den Embed-Parser und unterstützen diese Platzhalter.

| Platzhalter | Wert |
| --- | --- |
| `%mc.server.name%` | Der registrierte Name |
| `%mc.server.address%` | Hostname oder IP |
| `%mc.server.port%` | Port |
| `%mc.online%` | `Online` oder `Offline` |
| `%mc.players.online%` | Aktuelle Spielerzahl |
| `%mc.players.max%` | Spielerplätze |
| `%mc.player.list%` | Namen der Online-Spieler |
| `%mc.motd%` | Das MOTD ohne Formatierungscodes |
| `%mc.version%` | Gemeldete Version |
| `%mc.latency%` | Ping, zum Beispiel `42ms` |
| `%mc.favicon%` | URL des Servericons |
| `%mc.map%` | Weltname, nur Query-Protokoll |
| `%mc.gamemode%` | Spielmodus, nur Query-Protokoll |
| `%mc.software%` | Server-Software, nur Query-Protokoll |
| `%mc.plugins%` | Plugin-Liste, nur Query-Protokoll |
| `%mc.query%` | `Yes`, wenn die erweiterte Query geantwortet hat |
| `%mc.geyser%` | `Yes`, wenn Geyser erkannt wurde |

## RCON und die Whitelist

Schalte **RCON-Einstellungen** für einen Server ein und gib den **RCON-Port** und das **RCON-Passwort** aus der `server.properties` ein. `mcrcon` sendet dann beliebige Konsolenbefehle und gibt die Ausgabe zurück. `mcwhitelist` kapselt die Whitelist-Befehle mit den Aktionen `add`, `remove`, `list`, `on`, `off` und `reload`. Das Dashboard zeigt die Whitelist als Liste mit Buttons zum Hinzufügen und Entfernen, und der Tab **Konsole** bietet eine Eingabeaufforderung für Server mit aktiviertem RCON.

> [!WARNING]
> RCON gibt vollen Konsolenzugriff. Beschränke `mcrcon` auf Administratoren und behandle das Passwort wie jede andere Server-Zugangsinformation.

## Die Brücke über das Begleit-Plugin

Die Brücke braucht das MewdekoMC-Plugin auf dem Spielserver: ein Paper-Plugin für Paper 1.21+ oder eine NeoForge-Mod für 21.1.x, beide auf Java 21. Öffne im Dashboard den Bereich **Begleit-Plugin** des Servers und erzeuge einen Schlüssel. Kopiere die **API-URL** und den **API-Schlüssel** in die `config.yml` des Plugins (Paper) oder `config/mewdeko-server.toml` (NeoForge), dann starte neu oder führe `/mewdeko reconnect` aus. Der Schlüssel wird nur einmal angezeigt; erzeuge einen neuen, um ihn zu ersetzen.

Sobald es verbunden ist, streamt das Plugin Ereignisse über einen WebSocket, und der Bot leitet sie an Kanäle weiter.

| Ereignis | Geht an | Standard-Aussehen |
| --- | --- | --- |
| Spielerbeitritt | Kanal **Beitritt/Austritt** | Grünes Embed mit Name und Avatar des Spielers |
| Spieleraustritt | Kanal **Beitritt/Austritt** | Rotes Embed mit Name und Avatar des Spielers |
| Chat | Kanal **Chat-Brücke** | `**player**: message` |
| Tod | Kanal **Tode** | Graues Embed mit der Todesnachricht |
| Fortschritt | Kanal **Fortschritte** | Grünes Embed mit dem Namen des Fortschritts |
| Serverstatus | Nirgendwohin; wird als Verlaufs-Momentaufnahme mit TPS und Speicher gespeichert | |

Jeder leer gelassene Ereigniskanal fällt auf den **Überwachungskanal** zurück. Nachrichten von Nicht-Bot-Nutzern im Chat-Brücken-Kanal (oder im Überwachungskanal, wenn keiner festgelegt ist) werden standardmäßig als `[Discord] user: message` an das Spiel weitergeleitet. Die eigene Konfiguration des Plugins kann jede Ereigniskategorie ausschalten, und das Streamen der Konsole ist standardmäßig aus und wird vom Bot nicht angezeigt.

### Vorlagen für Brücken-Ereignisse

Jedes an Discord gerichtete Ereignis kann unter **Brücken-Ereignisvorlagen** eine eigene Vorlage haben. Sie akzeptieren Ausgaben des Embed-Builders, Erwähnungen werden entschärft, und diese Platzhalter werden ersetzt.

| Vorlage | Platzhalter |
| --- | --- |
| Spielerbeitritt (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Spieleraustritt (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Chatnachricht (Discord) | `%mc.player%`, `%mc.message%`, `%mc.avatar%` |
| Todesnachricht (Discord) | `%mc.player%`, `%mc.death.message%`, `%mc.avatar%` |
| Fortschritt (Discord) | `%mc.player%`, `%mc.advancement%`, `%mc.avatar%` |
| Chat von Discord (Ingame-Format) | `%user%`, `%message%`, `%channel%`; verwende die Farbcodes mit Minecrafts Paragraphenzeichen |

## Einstellungen

Die Minecraft-Seite hat einen Tab **Server**, einen Tab **Server hinzufügen**, **Verlauf**, **Konsole** und einen nach dem ausgewählten Server benannten Tab zum Bearbeiten.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Name | | Kurze Kennung, die in Befehlen verwendet wird, zum Beispiel `survival` |
| Adresse | | Hostname oder IP |
| Port | 25565 | Spiel-Port; 19132 für Bedrock |
| Typ | Java Edition | Java, Bedrock oder Geyser |
| Query-Port (0 = Spiel-Port) | 0 | Port für das erweiterte Query-Protokoll |
| Überwachungskanal | keiner | Kanal, der das Status-Embed und die Warnungen erhält |
| Überwachungsintervall (Minuten) | 5 | Wie oft der Server abgefragt wird |
| Überwachungsmodus | Embed | Embed, Kanalthema oder Beides |
| Eigenes Überwachungs-Embed | Standard-Embed | Dein eigenes Status-Embed mit den oben genannten Platzhaltern |
| Server-Online-Warnung | Standard-Embed | Wird gepostet, wenn der Server zurückkommt |
| Server-Offline-Warnung | Standard-Embed | Wird gepostet, wenn der Server ausfällt |
| Ereigniskanäle | Überwachungskanal | Chat-Brücke, Beitritt/Austritt, Tode, Fortschritte |
| Brücken-Ereignisvorlagen | Standard | Die oben aufgeführten Vorlagen pro Ereignis |
| RCON-Einstellungen | aus | Aktiviert-Schalter, RCON-Port, RCON-Passwort |
| Begleit-Plugin | kein Schlüssel | Den API-Schlüssel des Plugins erzeugen oder widerrufen und die API-URL kopieren |

## Einrichtung Schritt für Schritt

1. Öffne **Minecraft** im Dashboard und gehe zu **Server hinzufügen**.
2. Gib einen **Namen**, die **Adresse** und den **Port** ein, wähle den **Typ** und einen **Überwachungskanal** und **Überwachungsmodus**. Speichere.
3. Prüfe den Tab **Server**: Die Statuskarte sollte den Server innerhalb weniger Sekunden als online anzeigen.
4. Bearbeite den Server, um die **RCON-Einstellungen** zu aktivieren, wenn du Konsolen- und Whitelist-Zugriff willst, und probiere dann den Tab **Konsole** aus.
5. Lege für die Chat-Brücke die **Ereigniskanäle** fest, erzeuge unter **Begleit-Plugin** einen Schlüssel, installiere das Plugin auf dem Spielserver und füge die URL und den Schlüssel in dessen Konfiguration ein.
6. Betritt das Spiel und sag etwas: Es sollte im Chat-Brücken-Kanal erscheinen, und eine Antwort dort sollte im Spiel erscheinen.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Slash-Versionen liegen unter `/minecraft`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `mcstatus [name or address]` | `mcs` | Niemand | Status des Standard-Servers, eines registrierten Servers oder eines beliebigen `host:port`, den du eintippst |
| `mcadd <name> <address[:port]>` | | Server verwalten | Einen Server registrieren; stelle der Adresse für Bedrock `bedrock:` voran |
| `mcremove <name>` | `mcrm` | Server verwalten | Einen registrierten Server löschen |
| `mclist` | `mcl` | Niemand | Registrierte Server mit Typ, Standard-Markierung und Überwachungskanal auflisten |
| `mcdefault <name>` | `mcdef` | Server verwalten | Den Server wählen, den `mcstatus` standardmäßig verwendet |
| `mcwatch <name> [#channel]` | `mcw` | Server verwalten | Beginnen, den Status in einen Kanal zu posten, oder ohne Kanal beenden |
| `mcwatchmode <name> <embed, channeltopic or both>` | `mcwm` | Server verwalten | Wählen, wie die Überwachung den Status zeigt |
| `mcembed <name> [template]` | `mce` | Server verwalten | Ein eigenes Status-Embed festlegen, oder `-` zum Zurücksetzen |
| `mcplayer <username>` | `mcp` | Niemand | UUID, Avatar und Skin eines Spielers anzeigen |
| `mcskin <username>` | | Niemand | Das Skin-Rendering eines Spielers anzeigen |
| `mcrcon <name> <command>` | | Administrator | Einen Konsolenbefehl über RCON ausführen |
| `mcwhitelist <name> <action> [player]` | `mcwl` | Server verwalten | `add`, `remove`, `list`, `on`, `off` oder `reload` |

## Tipps und Stolperfallen

- `mcstatus` ist auf zehn Abfragen pro Minute und Discord-Server begrenzt, geteilt von allen Mitgliedern.
- Direkte Adressabfragen mit `mcstatus play.example.com:25565` funktionieren ohne Registrierung, aber private und lokale Adressen werden blockiert.
- Der Bot braucht **Kanäle verwalten** im Überwachungskanal für den Modus Kanalthema, und Discord selbst begrenzt Themenänderungen, sodass der Themenmodus nie öfter als alle fünf Minuten aktualisiert.
- Erweiterte Details wie Karte, Spielmodus und Plugins erscheinen nur, wenn `enable-query=true` in der `server.properties` gesetzt ist und der **Query-Port** passt.
- Wird das Überwachungs-Embed gelöscht, postet der nächste Durchlauf ein neues, statt zu scheitern.
- Brücken-Nachrichten entschärfen `@everyone`, `@here` und Nutzererwähnungen, sodass Spieler Discord nicht aus dem Spiel heraus pingen können.

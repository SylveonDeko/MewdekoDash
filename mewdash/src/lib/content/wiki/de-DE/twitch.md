---
title: Twitch-Bot
slug: twitch
summary: Lass Mewdeko in deinem eigenen Twitch-Chat laufen, mit eigenen Befehlen, Timern, Zitaten und Zählern, und leite Subs, Raids, Kanalpunkte-Einlösungen und Live-Gänge nach Discord weiter.
icon: fa-brands fa-twitch
category: Community
dashboard: /dashboard/twitch
module: Twitch
tags: [twitch, chat bot, streamer, commands, timers, quotes, counters, channel points, redemptions, subs, raids, account link, role sync, eventsub, Chat-Bot, Streamer, Befehle, Timer, Zitate, Zähler, Kanalpunkte, Einlösungen, Konto-Verknüpfung, Rollen-Sync]
related: [streams, administration]
---

## Was es macht

Der Twitch-Bot verbindet einen Twitch-Kanal mit deinem Discord-Server und lässt Mewdeko als Chat-Bot in diesem Kanal agieren. Zuschauer tippen `!ping`, `!quote`, `!counter deaths` oder deine eigenen Befehle im Twitch-Chat, und der Bot antwortet dort. Timer posten wiederkehrende Nachrichten, solange du live bist, Zitate und Zähler werden pro Server gespeichert, und Kanalpunkte-Belohnungen können eine Chat-Antwort oder einen Discord-Post auslösen.

Ereignisse aus dem Kanal fließen zurück nach Discord. Wenn der Kanal live geht, wird ein Live-Post in einen Discord-Kanal gesendet; Abos, verschenkte Abos und Raids können jeweils mit deiner eigenen Vorlage in einen eigenen Kanal posten, und ein Rückblick nach dem Stream kann Dauer, Spitzen-Zuschauerzahl, Chat-Nachrichten, Subs und Raids zusammenfassen.

Zuschauer können ihr Twitch-Konto mit ihrem Discord-Konto verknüpfen. Nach der Verknüpfung weiß der Bot, welches Discord-Mitglied auf Twitch chattet, und der Rollen-Sync kann Discord-Rollen an Abonnenten, VIPs, Mods oder den Streamer vergeben.

> [!NOTE]
> Das ist nicht dasselbe wie Stream-Benachrichtigungen. Stream-Benachrichtigungen beobachten nur öffentliche Kanäle auf mehreren Plattformen und kündigen an, wenn sie live gehen. Der Twitch-Bot setzt voraus, dass du dein eigenes Twitch-Konto autorisierst, und gibt dem Bot eine Präsenz in deinem Chat. Sind beide für denselben Twitch-Kanal eingerichtet, ersetzt der Live-Post des Twitch-Bots den der Stream-Benachrichtigungen, damit es keine Duplikate gibt.

## Wofür du es nutzen kannst

- Du streamst auf Twitch und willst einen Bot für Discord und Twitch-Chat, mit denselben eigenen Befehlen und Social-Links an beiden Orten.
- Du willst, dass Subs und Raids in Discord sofort gefeiert werden.
- Du willst Abonnenten- oder VIP-Rollen auf Discord, ohne sie von Hand zu vergeben.
- Du willst, dass eine Kanalpunkte-Belohnung wie „Trinken" oder „Dehnen" tatsächlich etwas im Chat sagt und in Discord protokolliert wird.
- Deine Mods brauchen einen Shoutout-Befehl, eine Raid-Zielauswahl und eine Zitateliste, die zwischen Streams erhalten bleibt.

## Verbinden

Es sind zwei Twitch-Autorisierungen beteiligt, beide im Tab **Einrichtung**, Unter-Tab **Verbinden**.

| Autorisierung | Wer sie durchführt | Was sie gewährt |
| --- | --- | --- |
| Bot-Konto | Nur der Bot-Owner | Das Twitch-Konto, als das der Bot chattet. Scopes `user:read:chat`, `user:write:chat`, `user:bot`. Eine gemeinsame Identität für alle Server. |
| Streamer-Kanal | Du, der Streamer | Zugriff auf die Ereignisse deines Kanals. Scopes `channel:bot`, Abos, Bits, Einlösungen, Umfragen, Vorhersagen, Verwaltung der Übertragung, Clip-Bearbeitung und Moderation. |

Die Integration gilt als konfiguriert, wenn ein Bot-Konto existiert, dein Kanal autorisiert ist und die Konfiguration aktiviert ist. Das Panel **Zustand** zeigt den Transportweg (EventSub-WebSocket oder altes IRC), das zuletzt empfangene Ereignis, den Ablauf der Tokens beider Konten und unter **Erweiterte Diagnose** fehlende Scopes sowie die gespeicherten EventSub-Abonnements.

Wenn du den Kanal trennst, wird deine Autorisierung gelöscht und die Integration deaktiviert. Das Bot-Konto kann nur von einem Bot-Owner getrennt werden.

## Chat-Befehle in Twitch

Jeder verbundene Kanal bekommt diese eingebauten Befehle. Das Präfix ist standardmäßig `!` und kann bis zu fünf Zeichen lang geändert werden. Eigene Befehle werden nur gesucht, wenn kein eingebauter Befehl zum Namen passt.

| Befehl | Wer ihn nutzen kann | Was er macht |
| --- | --- | --- |
| `!ping` | Alle | Antwortet mit einem Pong |
| `!uptime` | Alle | Wie lange der Bot-Prozess schon läuft |
| `!commands` | Alle | Listet eingebaute und aktivierte eigene Befehle auf |
| `!discord` | Alle | Zeigt, welches Discord-Konto mit dem Aufrufer verknüpft ist |
| `!link` | Alle | Erzeugt einen sechsstelligen Code zur Kontoverknüpfung |
| `!rank` | Alle | Zeigt den ermittelten Rang des Aufrufers |
| `!stream` | Alle | Live-Status, Titel, Kategorie, Zuschauer und Laufzeit, oder „offline" |
| `!schedule` | Alle | Postet die vom Team festgelegte Zeitplan-Nachricht |
| `!socials` | Alle | Postet die vom Team festgelegte Social-Links-Nachricht |
| `!quote [id]` | Alle | Ein zufälliges Zitat oder ein bestimmtes anhand der Nummer |
| `!quote add <text> [-- author]` | Mod | Speichert ein Zitat, optional mit einem Autor nach `--` |
| `!quote remove <id>` | Mod | Löscht ein Zitat (`delete` funktioniert ebenfalls) |
| `!counter <name>` | Alle | Zeigt den Wert eines Zählers |
| `!counter <name> +` | Mod | Addiert eins (`++` oder `add` funktionieren ebenfalls); `-`, `--` oder `sub` ziehen eins ab; `reset` setzt auf 0; eine Zahl setzt direkt den Wert |
| `!so <user>` | Mod | Gibt einem anderen Twitch-Kanal einen Shoutout |
| `!raidtarget` | Mod | Schlägt einen zufälligen Kanal aus der Raid-Zielliste vor |

### Ränge

Der Rang eines Chatters ergibt sich aus seinen Twitch-Badges. Streamer ist am höchsten, dann Mod, VIP, Abonnent (Founder-Badges zählen als Abonnent), dann Alle. Befehle, eigene Befehle und der Rollen-Sync vergleichen alle gegen diese Reihenfolge, daher kann ein Mod alles ausführen, was auf VIP, Abonnent oder Alle gesetzt ist.

## Eigene Befehle

Eigene Befehle werden im Dashboard unter **Befehle**, **Eigene Befehle** oder mit `/twitch commands add` hinzugefügt. Namen werden kleingeschrieben, dürfen bis zu 32 Zeichen lang sein und Buchstaben, Ziffern, Bindestriche und Unterstriche enthalten. Jeder Befehl hat eine **Berechtigung** (Alle, Abonnent, VIP, Mod, Streamer), einen Wert für die **Abklingzeit in Sekunden** von 0 bis 86400, einen Schalter **Aktiviert** und eine **Antwort**. Die Abklingzeit gilt für den ganzen Kanal, nicht pro Nutzer. Die Nutzungszahlen werden erfasst und in der Liste angezeigt.

Das Dashboard hat außerdem ein Feld **Test-Argumente** und eine Vorschau, damit du die gerenderte Antwort vor dem Speichern sehen kannst.

### Platzhalter in Antworten

| Platzhalter | Wert |
| --- | --- |
| `%user%` | Der Twitch-Login des Chatters |
| `%display%` | Der Anzeigename des Chatters |
| `%channel%` | Der Login deines Twitch-Kanals |
| `%args%` | Alles, was nach dem Befehlsnamen getippt wurde |
| `%target%` | Das erste Wort nach dem Befehlsnamen |
| `%discord%` | Die verknüpfte Discord-Nutzer-ID des Chatters oder leer |
| `%random:a\|b\|c%` | Eine zufällig gewählte Option |
| `%count:name%` | Aktueller Wert des benannten Zählers |
| `%stream%` | Dieselbe Zusammenfassung wie bei `!stream` |

> [!EXAMPLE]
> `!hug` mit der Antwort `%display% hugs %target%! That is hug number %count:hugs%.`

## Timer

Timer posten nach Zeitplan eine Nachricht in den Twitch-Chat. Verwalte sie unter **Befehle**, **Timer** oder mit `/twitch timers`.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Timer-Name | | Dieselben Namensregeln wie bei Befehlen |
| Intervall in Minuten | 10 | 1 bis 1440 Minuten zwischen den Posts |
| Mindestanzahl Chat-Nachrichten | 5 | Chat-Nachrichten, die seit dem letzten Post eingegangen sein müssen, bevor erneut gepostet wird; 0 deaktiviert die Prüfung |
| Nur online | an | Nur posten, solange der Kanal live ist |
| Zufällige Reihenfolge | aus | Eine zufällige Zeile wählen, statt der Reihe nach durchzugehen |
| Aktiviert | an | Ob der Timer läuft |
| Nachrichten | | Eine Nachricht pro Zeile |

Der Scheduler prüft Timer alle 30 Sekunden. Timer-Zeilen unterstützen `%channel%`, `%url%`, `%stream%`, `%count:name%` und `%random:a|b|c%`. `/twitch timers test` (oder die Test-Schaltfläche im Dashboard) postet einen Timer sofort.

## Zitate und Zähler

Zitate werden mit ihrem Text, optionalem Autor und der Person, die sie hinzugefügt hat, gespeichert. Im Unter-Tab **Zitate** des Dashboards kann das Team sie hinzufügen, durchsuchen und entfernen; Zuschauer nutzen `!quote`. Zähler sind einfache benannte Ganzzahlen, die Mods aus dem Chat hochzählen; das Team kann Werte mit `/twitch commands counter-set` setzen und sie mit `counter-list` auflisten.

## Ereignisse nach Discord

Der Tab **Ereignisse**, Unter-Tab **Warnmeldungen** enthält die Einstellungen für Subs, Raids und Kanalpunkte. Der Live-Post liegt unter **Einrichtung**, **Bot-Einstellungen**, **Event-Weiterleitung**.

### Live-Gang und Offline

Wenn der Kanal live geht, postet der Bot in den **Discord-Kanal für Live-Gänge**. Ohne **Live-Nachricht** sendet er ein Standard-Embed: den Streamernamen mit Link zum Kanal, den Titel als Autorenzeile, Status, Zuschauerzahl, Kategorie und ein Vorschaubild. Eine eigene Nachricht läuft durch den Embed-Builder, daher funktionieren vollständige Embeds und Komponenten. Wenn der Kanal offline geht, wird ein kurzes rotes „Offline"-Embed in denselben Kanal gepostet.

| Platzhalter | Wert |
| --- | --- |
| `%streamer%` | Der Anzeigename des Streamers |
| `%title%` | Stream-Titel |
| `%game%` | Kategoriename |
| `%url%` | `https://twitch.tv/<channel>` |
| `%viewers%` | Aktuelle Zuschauerzahl |

### Abos und Raids

Das sind reine Textnachrichten. Standard-Sub-Nachricht: `%display% subscribed to %channel%!` oder `%display% received a gifted sub on %channel%!` bei Geschenken. Standard-Raid-Nachricht: `%raider% raided %channel% with %viewers% viewers!`.

| Ereignis | Platzhalter |
| --- | --- |
| Sub | `%user%`, `%display%`, `%channel%`, `%tier%` |
| Raid | `%raider%`, `%channel%`, `%viewers%` |

Jede Warnmeldung hat im Dashboard eine Schaltfläche **Test senden**, und die Liste **Event history** zeigt aktuelle Ereignisse und Test-Sendungen.

### Kanalpunkte-Aktionen

Ordne unter **Kanalpunkte-Aktionen** einen **Belohnungstitel** (ohne Beachtung der Groß- und Kleinschreibung abgeglichen) einer **Twitch-Antwort**, einem **Discord-Kanal** mit einer **Discord-Nachricht** oder beidem zu. Platzhalter: `%user%`, `%display%`, `%channel%`, `%reward%`, `%input%` (was der Zuschauer eingegeben hat) und `%url%`.

### Stream-Rückblick

`/twitch events recap-channel` legt einen Kanal fest, der am Ende des Streams ein Embed erhält: Dauer, Spitzen-Zuschauerzahl, Chat-Nachrichten, Subs, Raids sowie letzter Titel und letzte Kategorie. Rückblicke gibt es nicht im Dashboard.

## Kontoverknüpfung und Rollen-Sync

Es gibt zwei Wege, ein Discord-Mitglied mit einem Twitch-Login zu verknüpfen:

1. Selbstbedienung: Der Zuschauer tippt `!link` im Twitch-Chat, erhält einen sechsstelligen Code und führt innerhalb von zehn Minuten `/twitch claim <code>` in Discord aus.
2. Team: Der Tab **Konto-Verknüpfungen** oder `/twitch links add @user twitchlogin`.

Ein Twitch-Login pro Discord-Mitglied und Server. Nach der Verknüpfung wird `%discord%` für diesen Zuschauer befüllt und der Rollen-Sync greift.

Der Rollen-Sync ordnet mit `/twitch rolesync add` einem Twitch-Rang eine Discord-Rolle zu. Jedes Mal, wenn ein verknüpfter Zuschauer eine Chat-Nachricht sendet, fügt der Bot die Rolle hinzu, wenn sein Rang mindestens dem der Zuordnung entspricht, und entfernt sie, wenn er darunter liegt. Der Rollen-Sync ist nur über Slash-Commands verfügbar.

## Live-Tools

Der Tab **Ereignisse**, Unter-Tab **Live-Tools** bietet Aktionen für Stream-Betreiber, die deine Kanal-Autorisierung nutzen: eine Chat-Nachricht als Bot senden, eine Stream-Markierung erstellen, einen Clip erstellen, eine Umfrage starten (eine Option pro Zeile, Standard 60 Sekunden) sowie einen Timeout (Standard 600 Sekunden), Ban, Unban oder das Löschen einer Nachricht per ID. `/twitch stream-info` und `/twitch clip` erledigen die Teile für Titel, Kategorie und Clip von Discord aus.

## Einstellungen

Unter **Einrichtung**, **Bot-Einstellungen**:

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Befehlspräfix | `!` | Präfix für Twitch-Chat-Befehle, bis zu 5 Zeichen |
| Sprache überschreiben | Server-Standard | BCP-47-Tag wie `de-DE`, der für die Chat-Antworten des Bots verwendet wird |
| Twitch-Chat-Bot für diesen Server aktivieren | an | Hauptschalter; beim Deaktivieren bleibt die Konfiguration erhalten |
| EventSub für Chat-Events verwenden | an | Chat und Ereignisse über EventSub empfangen; wenn aus, laufen Chat-Befehle nicht |
| Discord-Kanal für Live-Gänge | keiner | Wohin Live- und Offline-Posts gehen |
| Live-Nachricht | Standard-Embed | Eigene Vorlage mit den Live-Platzhaltern |

Unter **Ereignisse**, **Warnmeldungen**: **Discord-Kanal für Subs**, **Sub-Nachricht**, **Discord-Kanal für Raids**, **Raid-Nachricht** und die Liste der Kanalpunkte-Aktionen.

## Einrichtung Schritt für Schritt

1. Öffne **Twitch-Bot** im Dashboard. Ein Bot-Owner muss zuerst das **Bot-Konto** verbunden haben; der Unter-Tab **Verbinden** zeigt, ob eines existiert.
2. Klicke auf **Kanal verbinden** und autorisiere mit deinem eigenen Twitch-Konto.
3. Lege in den **Bot-Einstellungen** das Präfix fest, schalte **Twitch-Chat-Bot für diesen Server aktivieren** ein, wähle einen **Discord-Kanal für Live-Gänge** und speichere.
4. Füge unter **Befehle** ein paar eigene Befehle und einen Social-Links-Timer hinzu. Prüfe die Platzhalter mit **Test-Argumenten** und der Vorschau.
5. Wähle unter **Ereignisse**, **Warnmeldungen** die Kanäle für Subs und Raids und drücke jeweils **Test senden**.
6. Tippe `!ping` in deinen Twitch-Chat, um zu bestätigen, dass der Bot zuhört, dann `!link` und `/twitch claim`, um dich selbst zu verknüpfen.
7. Führe optional `/twitch rolesync add Subscriber @Subs` aus, damit verknüpfte Abonnenten eine Rolle bekommen.

## Befehle

Dieses Modul besteht nur aus Slash-Commands. Tippe `/twitch` in Discord, um sie zu sehen. Antworten sind nur für dich sichtbar.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `/twitch set <channel> [prefix]` | | Server verwalten | Twitch-Kanal und Präfix festlegen und die Integration aktivieren |
| `/twitch remove` | | Server verwalten | Die Integration deaktivieren und den Kanal verlassen |
| `/twitch enable` | | Server verwalten | Die Integration wieder einschalten |
| `/twitch disable` | | Server verwalten | Sie ausschalten, ohne Einstellungen zu löschen |
| `/twitch config` | | Niemand | Kanal, Präfix, Aktivierungsstatus, Live-Kanal und Sprache anzeigen |
| `/twitch claim <code>` | | Niemand | Einen Verknüpfungscode von `!link` einlösen |
| `/twitch stream-info [title] [category]` | | Server verwalten | Stream-Titel oder Kategorie aktualisieren |
| `/twitch clip` | | Server verwalten | Einen Clip des aktuellen Streams erstellen |
| `/twitch status` | | Server verwalten | Zustandsübersicht: Konten, Tokens, EventSub-Status |
| `/twitch language <tag>` | | Server verwalten | Sprache für Chat-Antworten; leer setzt zurück |
| `/twitch prefix <prefix>` | | Server verwalten | Das Präfix der Chat-Befehle ändern |
| `/twitch commands add <name> <response> [permission] [cooldown]` | | Server verwalten | Einen eigenen Befehl hinzufügen oder aktualisieren |
| `/twitch commands remove <name>` | | Server verwalten | Einen eigenen Befehl löschen |
| `/twitch commands list` | | Niemand | Eigene Befehle mit Berechtigung, Abklingzeit und Nutzungszahl auflisten |
| `/twitch commands counter-set <name> <value>` | | Server verwalten | Einen Zähler setzen |
| `/twitch commands counter-list` | | Niemand | Zähler auflisten |
| `/twitch commands schedule-set <message>` | | Server verwalten | Die Antwort von `!schedule` festlegen |
| `/twitch commands schedule-clear` | | Server verwalten | Sie löschen |
| `/twitch commands socials-set <message>` | | Server verwalten | Die Antwort von `!socials` festlegen |
| `/twitch commands socials-clear` | | Server verwalten | Sie löschen |
| `/twitch timers add <name> <messages> [interval] [minchat] [onlineonly] [randomize]` | | Server verwalten | Einen Timer hinzufügen oder aktualisieren |
| `/twitch timers remove <name>` | | Server verwalten | Einen Timer löschen |
| `/twitch timers list` | | Niemand | Timer auflisten |
| `/twitch timers enable <name>` | | Server verwalten | Einen Timer aktivieren |
| `/twitch timers disable <name>` | | Server verwalten | Einen Timer deaktivieren |
| `/twitch timers test <name>` | | Server verwalten | Einen Timer jetzt posten |
| `/twitch events golive-channel <channel> [message]` | | Server verwalten | Live-Kanal und Vorlage festlegen |
| `/twitch events golive-clear` | | Server verwalten | Den Live-Kanal löschen |
| `/twitch events sub-channel <channel> [message]` | | Server verwalten | Sub-Kanal und Vorlage festlegen |
| `/twitch events sub-clear` | | Server verwalten | Sub-Posts deaktivieren |
| `/twitch events raid-channel <channel> [message]` | | Server verwalten | Raid-Kanal und Vorlage festlegen |
| `/twitch events raid-clear` | | Server verwalten | Raid-Posts deaktivieren |
| `/twitch events recap-channel <channel>` | | Server verwalten | Den Kanal für den Stream-Rückblick festlegen |
| `/twitch events recap-clear` | | Server verwalten | Rückblicke deaktivieren |
| `/twitch links add <@user> <twitchlogin>` | | Server verwalten | Ein Mitglied mit einem Twitch-Login verknüpfen |
| `/twitch links remove <@user>` | | Server verwalten | Die Verknüpfung eines Mitglieds entfernen |
| `/twitch links list` | | Niemand | Alle Verknüpfungen auflisten |
| `/twitch rolesync add <rank> <@role>` | | Server verwalten | Verknüpften Zuschauern ab einem Rang eine Rolle geben |
| `/twitch rolesync remove <rank> <@role>` | | Server verwalten | Eine Zuordnung entfernen |
| `/twitch rolesync list` | | Niemand | Zuordnungen auflisten |
| `/twitch redemptions add <reward> [twitchreply] [channel] [discordmessage]` | | Server verwalten | Eine Kanalpunkte-Aktion hinzufügen oder aktualisieren |
| `/twitch redemptions remove <reward>` | | Server verwalten | Eine entfernen |
| `/twitch redemptions list` | | Niemand | Aktionen auflisten |
| `/twitch raidtargets add <twitchlogin> [note]` | | Server verwalten | Einen Kanal zum Pool von `!raidtarget` hinzufügen |
| `/twitch raidtargets remove <twitchlogin>` | | Server verwalten | Einen entfernen |
| `/twitch raidtargets list` | | Niemand | Raid-Ziele auflisten |

## Tipps und Stolperfallen

- Das Bot-Konto wird von allen Servern des Bots gemeinsam genutzt. Hat niemand eines verbunden, können keine Chat-Antworten gesendet werden, egal was du konfigurierst.
- Chat-Befehle funktionieren nur, solange **EventSub für Chat-Events verwenden** eingeschaltet ist. Zeigt das Panel „Zustand" Legacy IRC an, schalte es wieder ein.
- Der Live-Status wird zusätzlich einmal pro Minute abgefragt, daher kann ein Live-Post dem tatsächlichen Start um bis zu eine Minute hinterherhinken.
- Die Abklingzeiten eigener Befehle gelten pro Kanal, nicht pro Zuschauer. Eine Abklingzeit von 30 Sekunden bedeutet eine Nutzung alle 30 Sekunden für alle.
- Der Rollen-Sync läuft, wenn ein verknüpfter Zuschauer chattet, nicht nach Zeitplan. Ein Abonnent, der nie im Chat schreibt, bekommt die Rolle nie, und ein ausgelaufener Abonnent behält sie, bis er wieder chattet.
- Rollenänderungen brauchen die Rolle des Bots über der synchronisierten Rolle sowie „Rollen verwalten".
- Unbekannte Ränge bei `rolesync` fallen auf Abonnent zurück, und unbekannte Berechtigungen bei `commands add` fallen auf Alle zurück.
- Verknüpfungscodes laufen nach zehn Minuten ab, und das Erzeugen eines neuen macht den alten ungültig.
- Timeouts und Bans aus den Live-Tools nutzen die Moderations-Scopes deines Kanals, erscheinen in Twitch also als Aktionen des autorisierten Kontos.
- Die Sprachüberschreibung ändert nur die Antworten im Twitch-Chat. Discord-Antworten behalten die Sprache des Servers.

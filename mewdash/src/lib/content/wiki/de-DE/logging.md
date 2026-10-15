---
title: Protokollierung
slug: logging
summary: Sende ein Protokoll von Beitritten, Austritten, Bearbeitungen, Löschungen, Bannen, Rollen- und Kanaländerungen und mehr an die Log-Kanäle deiner Wahl, mit Zuordnung pro Ereignis und Kanal-Ausnahmen.
icon: fa-file
category: Security
dashboard: /dashboard/logging
module: Administration
tags: [logging, logs, audit, events, message deleted, message edited, join leave, mod log, ignored channels, Protokollierung, Logs, Audit, Ereignisse, Nachricht gelöscht, Nachricht bearbeitet, Beitritt Austritt, Mod-Log, ignorierte Kanäle]
related: [moderation, administration, filter]
---

## Was es macht

Die Protokollierung beobachtet die Ereignisse, die Discord an den Bot sendet, und postet eine Zusammenfassung jedes Ereignisses in einen Textkanal deiner Wahl. Eine gelöschte Nachricht zeigt, wer sie geschrieben hat und was darin stand. Ein beitretendes Mitglied zeigt sein Konto-Alter. Eine Rollenänderung zeigt, welche Rollen hinzugefügt oder entfernt wurden. Wo der Bot das Audit-Log lesen kann, nennt er außerdem das Teammitglied, das die Aktion ausgeführt hat.

Jeder Ereignistyp hat eine eigene Kanaleinstellung. So kannst du Nachrichtenbearbeitungen in einen Kanal schicken, Moderationsaktionen in einen anderen und den Rest ausgeschaltet lassen. Es wird nichts protokolliert, bis du einen Kanal zugewiesen hast. Ein Ereignistyp ohne Kanal wird stillschweigend übersprungen.

Auch Kanäle lassen sich ausschließen. Ein ignorierter Kanal erzeugt überhaupt keine Nachrichten, Thread- oder Sprachprotokolle. So bleiben Team-Räume und Bot-Spam-Kanäle aus dem Protokoll heraus.

## Wozu du es nutzt

- Lege eine Kopie gelöschter und bearbeiteter Nachrichten an, damit Moderatoren nachvollziehen können, was entfernt wurde.
- Verfolge, wer beigetreten und ausgetreten ist, inklusive Konto-Erstellungsdatum, um Raids und Zweitaccounts zu erkennen.
- Halte Bans, Entbannungen und Stummschaltungen zusammen mit dem verantwortlichen Moderator fest, damit alles nachvollziehbar bleibt.
- Beobachte Rollen-, Kanal- und Berechtigungsänderungen durch andere Admins oder kompromittierte Konten.
- Verfolge Sprachaktivität auf Servern, auf denen Sprachkanäle der Haupttreffpunkt sind.

## Ereignistypen

Jeder Typ kann auf einen anderen Kanal zeigen oder ausgelassen werden. Dies sind die Werte, die `log` akzeptiert und die das Dashboard anzeigt.

| Typ | Dashboard-Bezeichnung | Protokolliert, wenn |
| --- | --- | --- |
| `MessageUpdated` | Nachricht bearbeitet | Der Inhalt einer Nachricht bearbeitet wird (Bot-Autoren und unveränderter Inhalt werden übersprungen) |
| `MessageDeleted` | Nachricht gelöscht | Eine Nachricht gelöscht wird |
| `MessagesBulkDeleted` | Nachrichten massenhaft gelöscht | Mehrere Nachrichten auf einmal entfernt werden, mit einer Anzahl der zwischengespeicherten Nachrichten |
| `ReactionEvents` | Reaktionsereignisse | Reaktionen hinzugefügt oder entfernt werden, pro Nachricht alle fünf Sekunden gebündelt |
| `ThreadCreated` | Thread erstellt | Ein Thread erstellt wird |
| `ThreadDeleted` | Thread gelöscht | Ein Thread gelöscht wird |
| `ThreadUpdated` | Thread aktualisiert | Der Name, der Archivstatus eines Threads oder Ähnliches sich ändert |
| `UsernameUpdated` | Nutzername geändert | Der globale Nutzername eines Mitglieds sich ändert |
| `NicknameUpdated` | Nickname geändert | Der Server-Nickname eines Mitglieds sich ändert |
| `UserUpdated` | Nutzer aktualisiert | Das Profil eines Mitglieds sich ändert, etwa Avatar oder globaler Anzeigename |
| `UserJoined` | Nutzer beigetreten | Ein Mitglied dem Server beitritt |
| `UserLeft` | Nutzer ausgetreten | Ein Mitglied den Server verlässt oder gekickt wird |
| `UserRoleAdded` | Nutzerrolle hinzugefügt | Einem Mitglied eine oder mehrere Rollen gegeben werden |
| `UserRoleRemoved` | Nutzerrolle entfernt | Einem Mitglied eine oder mehrere Rollen entzogen werden |
| `UserBanned` | Nutzer gebannt | Ein Mitglied gebannt wird |
| `UserUnbanned` | Nutzer entbannt | Ein Bann aufgehoben wird |
| `UserMuted` | Nutzer stummgeschaltet | Ein Mitglied im Sprach- oder Textchat stummgeschaltet wird |
| `VoicePresence` | Sprachpräsenz | Ein Mitglied im Sprachkanal beitritt, verlässt, wechselt, stummgeschaltet wird, sich taub stellt oder streamt |
| `VoicePresenceTts` | Sprachpräsenz TTS | Ein Mitglied im Sprachkanal möglicherweise Text-to-Speech genutzt hat; die Erkennung erfolgt nach bestem Bemühen |
| `ServerUpdated` | Server aktualisiert | Servereinstellungen wie Name, Icon oder Owner sich ändern |
| `EventCreated` | Event erstellt | Ein geplantes Server-Event erstellt wird |
| `InviteCreated` | Einladung erstellt | Eine Einladung erstellt wird, mit ihrer maximalen Dauer und Nutzungsanzahl |
| `InviteDeleted` | Einladung gelöscht | Eine Einladung gelöscht wird |
| `RoleCreated` | Rolle erstellt | Eine Rolle erstellt wird |
| `RoleDeleted` | Rolle gelöscht | Eine Rolle gelöscht wird |
| `RoleUpdated` | Rolle aktualisiert | Der Name, die Farbe oder die Berechtigungen einer Rolle sich ändern |
| `ChannelCreated` | Kanal erstellt | Ein Kanal erstellt wird |
| `ChannelDestroyed` | Kanal gelöscht | Ein Kanal gelöscht wird |
| `ChannelUpdated` | Kanal aktualisiert | Der Name, das Thema oder die Berechtigungen eines Kanals sich ändern |
| `Other` | Sonstiges | Verschiedene Ereignisse, die oben nicht abgedeckt sind |

Das Dashboard zeigt außerdem einen Eintrag **Avatar aktualisiert**. Er wird zusammen mit den anderen gespeichert und von den Kategorien Nutzer und Alle gesetzt. Er ist aber kein Wert, den du dem Befehl `log` übergeben kannst.

## Kategorien

`logcategory` setzt eine ganze Gruppe von Typen in einem Schritt auf einen Kanal. Führst du den Befehl ohne Kanal aus, werden alle Typen dieser Gruppe geleert.

| Kategorie | Gesetzte Typen |
| --- | --- |
| `All` | Alle Typen oben |
| `Users` | NicknameUpdated, AvatarUpdated, UsernameUpdated, UserRoleAdded, UserRoleRemoved, VoicePresence, UserJoined, UserLeft, UserUpdated |
| `Threads` | ThreadCreated, ThreadDeleted, ThreadUpdated |
| `Roles` | RoleCreated, RoleDeleted, RoleUpdated |
| `Server` | ServerUpdated, EventCreated, InviteCreated, InviteDeleted |
| `Channel` | ChannelCreated, ChannelDestroyed, ChannelUpdated |
| `Messages` | MessageDeleted, MessageUpdated, MessagesBulkDeleted, ReactionEvents |
| `Moderation` | UserMuted, UserBanned, UserUnbanned, Other |
| `None` | Leert alle Typen (wird vom Button **Alle deaktivieren** im Dashboard verwendet) |

## Ignorierte Kanäle

Jeder Kanal auf der Ignorierliste wird für Nachrichten-, Thread-, Kanal- und Sprachereignisse übersprungen, die in ihm stattfinden. Threads übernehmen die Einstellung von ihrem übergeordneten Kanal. Ignorierst du also einen Forum- oder Textkanal, werden auch dessen Threads ignoriert. Einen Sprachkanal zu ignorieren unterdrückt Sprachpräsenz-Protokolle für Beitritte zu diesem Kanal und Austritte aus ihm.

Einen Kanal zu ignorieren stoppt keine Mitglieds-, Rollen- oder Server-Ereignisse, da diese nicht an einen Kanal gebunden sind.

## Einstellungen

Die Seite Protokollierung hat zwei Tabs: **Log-Kanäle** und **Ignorierte Kanäle**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Log-Kanäle | keiner | Eine Kanalauswahl pro Ereignistyp, gruppiert nach Beliebt, Nutzer, Nachrichten, Moderation, Server, Kanäle, Rollen, Threads, Sprache und Alle Ereignisse |
| Kategorie leeren | | Leert jede Auswahl in der Gruppe, die du gerade ansiehst. Wirkt beim Klick auf **Konfiguration speichern** |
| Alle leeren | | Wird in der Gruppe **Alle Ereignisse** angezeigt. Leert jede Auswahl und wird beim Speichern angewendet |
| Alle deaktivieren | | Button in der Kopfzeile, der erscheint, solange ein Kanal gesetzt ist. Entfernt nach Bestätigung sofort jede Ereignis-Zuweisung und behält die ignorierten Kanäle |
| Ignorierte Kanäle | keiner | Kanäle, die vom Protokollieren ausgenommen sind, verschoben zwischen den Listen **Aktive Kanäle** und **Ignorierte Kanäle** |

> [!TIP]
> Die Gruppe **Beliebt** enthält Nutzer beigetreten, Nutzer ausgetreten, Nachricht gelöscht, Nachricht bearbeitet, Nutzer gebannt, Nutzer entbannt, Kanal erstellt und Kanal gelöscht. Sie ist ein guter Ausgangspunkt für die meisten Server.

## Einrichtungsanleitung

1. Erstelle einen oder mehrere private Log-Kanäle, die nur das Team lesen kann.
2. Öffne **Protokollierung** im Dashboard und bleibe im Tab **Log-Kanäle**.
3. Wähle in der Gruppe **Beliebt** deinen Log-Kanal für jedes gewünschte Ereignis und speichere.
4. Wechsle zu anderen Gruppen wie **Moderation** oder **Sprache** und weise Kanäle für alles Weitere zu.
5. Öffne den Tab **Ignorierte Kanäle** und verschiebe Team-Räume und Bot-Befehlskanäle in die Ignorierliste.
6. Lösche eine Testnachricht und prüfe, ob das Protokoll im richtigen Kanal erscheint.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Slash-Versionen liegen unter `/log`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `log <type> [#channel]` | | Administrator | Einen Ereignistyp an einen Kanal senden. Ohne Kanal wird der aktuelle Kanal verwendet |
| `log #channel [types...]` | | Administrator | Mehrere Typen an einen Kanal senden, oder ein Auswahlmenü mit allen Typen öffnen, wenn keine angegeben sind |
| `log "#channel:Type1,Type2" ...` | | Administrator | Mehrere Kanal- und Typ-Paare in einer Nachricht setzen |
| `logcategory <category> [#channel]` | `logcat` | Administrator | Eine ganze Kategorie auf einen Kanal legen oder ohne Kanal leeren |
| `logevents` | | Administrator | Jeden Ereignistyp und den Kanal auflisten, den er aktuell verwendet |
| `logignore [#channel]` | `lignore` | Administrator | Einen Kanal auf die Ignorierliste setzen oder davon entfernen; standardmäßig der aktuelle Kanal |
| `logignorelist` | `lignorel` | Administrator | Die Ignorierliste anzeigen |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrator | Die Nutzung von Bot-Befehlen in einen Kanal protokollieren oder ohne Kanal deaktivieren |

> [!EXAMPLE]
> `log "#mod-logs:UserBanned,UserUnbanned,UserMuted" "#message-logs:MessageDeleted,MessageUpdated"`

## Tipps und Stolperfallen

- Gib dem Bot die Berechtigung **Audit-Log anzeigen**. Ohne sie werden Protokolle weiterhin gepostet, können aber nicht sagen, welcher Moderator eine Nachricht gelöscht, jemanden gebannt oder eine Rolle geändert hat.
- Der Bot muss Nachrichten in jedem Log-Kanal sehen und senden können. Ein Log-Kanal, den er nicht sehen kann, wird ohne Fehlermeldung übersprungen.
- Protokolle gelöschter und bearbeiteter Nachrichten hängen vom Nachrichten-Cache des Bots ab. Nachrichten, die vor dem letzten Neustart des Bots gesendet wurden, oder Nachrichten aus Massenlöschungen können als nicht zwischengespeichert erscheinen.
- Reaktionsprotokolle werden gebündelt. Alle Reaktionsänderungen an einer Nachricht innerhalb von etwa fünf Sekunden erscheinen als ein einziger Eintrag, um belebte Server nicht zu überfluten.
- Die Auswahl, die `log #channel` öffnet, zeigt bis zu 25 Typen pro Menü und wählt die bereits in diesen Kanal gesendeten Typen vor.
- `logcategory` überschreibt jeden Typ der Kategorie, auch solche, die du anderswo zugewiesen hattest. Verwende danach `log` für einzelne Typen.

---
title: Statistik-Kanäle
slug: statchannels
summary: Sprachkanäle, deren Namen sich selbst aktualisieren und Live-Zahlen wie Mitgliederzahl, Boosts, offene Tickets oder die Twitch-Zuschauerzahl anzeigen.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/statchannels
module: StatChannels
tags: [stat channels, counter, member count, live stats, voice channel stats, countdown, member goal, boost count, twitch viewers, Statistik-Kanäle, Zähler, Mitgliederzahl, Live-Statistiken, Sprachkanal-Statistiken, Countdown, Mitgliederziel, Boost-Anzahl, Twitch-Zuschauer]
related: [counting, twitch, suggestions, xp, afk, starboard]
---

## Was es macht

Ein Statistik-Kanal ist ein gesperrter Sprachkanal, der oben in deiner Kanalliste steht und eine Zahl in seinem Namen zeigt, zum Beispiel „Members: 12,480“. Der Bot schreibt den Namen nach einem Zeitplan neu, damit die Zahl aktuell bleibt. Mitglieder können dem Kanal nicht beitreten; er existiert nur zum Ablesen.

Du wählst einen Zählertyp, eine Vorlage für den Namen, einen Stil für die Zahl und wie oft aktualisiert wird. Der Bot unterstützt mehrere Dutzend Zähler, die Serverfakten, Präsenz, Nitro-Boosts, Emoji-Slots, Mitgliederziele und Countdowns abdecken, dazu Werte aus anderen Mewdeko-Funktionen wie Tickets, Vorschlägen, Giveaways, XP, Zählen, dem Starboard und verknüpften Twitch- oder Minecraft-Servern.

Discord erlaubt nur zwei Umbenennungen eines Kanals alle zehn Minuten. Statistik-Kanäle umgehen das mit einer Auswahl an Aktualisierungsmechanismen, darunter einem, der den Kanal löscht und neu erstellt, sodass er jede Minute aktualisiert werden kann.

## Wofür du es nutzen kannst

- Zeige Mitglieder-, Menschen- und Bot-Zahlen oben auf dem Server an.
- Verfolge den Fortschritt zu einem Mitgliederziel mit einem Prozentwert oder einem Fortschrittsbalken.
- Zähle bis zu einem Event, einem Launch oder einem Jubiläum herunter.
- Zeige den Twitch-Live-Status und die Zuschauerzahl für den Server eines Streamers.
- Gib dem Team einen Live-Überblick über offene Tickets oder ausstehende Vorschläge, ohne ein Dashboard zu öffnen.
- Zeige Status und Spielerzahl eines Minecraft-Servers neben dem Einladungslink an.

## Zählertypen

Der folgende vollständige Katalog entspricht dem, was `statchanneltypes` und der Bereich **Verfügbare Zähler** im Dashboard auflisten. Jeder Typ akzeptiert die allgemeinen Platzhalter; manche bringen eigene mit. Standardvorlagen beginnen mit einem passenden Emoji, gefolgt vom gezeigten Text.

### Mitglieder

| Typ | Zeigt | Standardvorlage | Zusätzliche Platzhalter |
| --- | --- | --- | --- |
| `TotalMembers` | Jedes Mitglied, Bots eingeschlossen | `Members: %count%` | |
| `HumanMembers` | Mitglieder, die keine Bots sind | `Humans: %count%` | |
| `BotCount` | Bot-Konten | `Bots: %count%` | |
| `OnlineMembers` | Mitglieder mit beliebiger Präsenz außer offline | `Online: %count%` | |
| `IdleMembers` | Als abwesend markierte Mitglieder | `Idle: %count%` | |
| `DndMembers` | Als „Bitte nicht stören“ markierte Mitglieder | `DND: %count%` | |
| `StreamingMembers` | Mitglieder mit einer Streaming-Aktivität | `Streaming: %count%` | |
| `InVoiceMembers` | Mitglieder, die mit einem beliebigen Sprachkanal verbunden sind | `In Voice: %count%` | |
| `RoleMembers` | Mitglieder mit einer gewählten Rolle | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.color%` |
| `NewestMember` | Das zuletzt beigetretene Mitglied | `Newest: %member.name%` | `%member.name%`, `%member.id%` |
| `MembersJoinedToday` | In den letzten 24 Stunden beigetreten | `Joined Today: %count%` | |
| `MembersJoinedWeek` | In den letzten 7 Tagen beigetreten | `This Week: %count%` | |
| `MemberGoal` | Fortschritt zu einer Ziel-Mitgliederzahl | `%count% / %goal%` | `%goal%`, `%goal.raw%`, `%goal.percent%`, `%goal.remaining%`, `%goal.bar%` |
| `AfkCount` | Mitglieder, die über Mewdeko gerade AFK sind | `AFK: %count%` | |

### Server

| Typ | Zeigt | Standardvorlage | Zusätzliche Platzhalter |
| --- | --- | --- | --- |
| `Countdown` | Verbleibende Zeit bis zu einem Zieldatum | `%days%d %hours%h left` | `%days%`, `%hours%`, `%minutes%`, `%total.hours%` |
| `ChannelCount` | Jeder Kanal | `Channels: %count%` | |
| `TextChannelCount` | Textkanäle | `Text: %count%` | |
| `VoiceChannelCount` | Sprachkanäle | `Voice: %count%` | |
| `CategoryCount` | Kategorien | `Categories: %count%` | |
| `StageChannelCount` | Stage-Kanäle | `Stages: %count%` | |
| `ForumChannelCount` | Forum-Kanäle | `Forums: %count%` | |
| `ThreadCount` | Threads, die aktuell als aktiv im Cache sind | `Threads: %count%` | |
| `RoleCount` | Rollen | `Roles: %count%` | |
| `BoostCount` | Aktive Nitro-Boosts | `Boosts: %count%` | |
| `BoostLevel` | Boost-Stufe, 0 bis 3 | `Level %count%` | |
| `NextBoostGoal` | Noch benötigte Boosts für die nächste Stufe | `%count% to Tier %tier.next%` | `%tier.next%`, `%tier.current%` |
| `EmojiCount` | Alle benutzerdefinierten Emojis | `Emojis: %count%` | |
| `AnimatedEmojiCount` | Animierte benutzerdefinierte Emojis | `Animated: %count%` | |
| `StaticEmojiCount` | Statische benutzerdefinierte Emojis | `Static: %count%` | |
| `StickerCount` | Benutzerdefinierte Sticker | `Stickers: %count%` | |
| `EmojiSlotsUsed` | Belegte Emoji-Slots im Verhältnis zur Obergrenze der Stufe | `Slots: %count%/%slots.max%` | `%slots.max%`, `%slots.free%` |
| `ServerAge` | Tage seit der Erstellung des Servers | `Age: %count% days` | `%years%`, `%created%` |
| `EventCount` | Geplante Events | `Events: %count%` | |
| `BotUptime` | Wie lange Mewdeko schon läuft | `Uptime: %days%d %hours%h` | `%days%`, `%hours%`, `%minutes%` |
| `InviteCount` | Vom Einladungs-Tracking erfasste Einladungen | `Invites: %count%` | |

### Twitch

Diese lesen vom Twitch-Kanal, der über das Twitch-Modul verknüpft ist.

| Typ | Zeigt | Standardvorlage | Zusätzliche Platzhalter |
| --- | --- | --- | --- |
| `TwitchLiveStatus` | Ob der Kanal live ist | `%twitch.name%: %status%` | `%status%`, `%twitch.name%` |
| `TwitchViewers` | Aktuelle Zuschauer | `Viewers: %count%` | `%twitch.name%` |
| `TwitchGame` | Kategorie, die gestreamt wird | `%game%` | `%game%`, `%title%`, `%twitch.name%` |
| `TwitchUptime` | Wie lange der Stream schon live ist | `Live %hours%h %minutes%m` | `%hours%`, `%minutes%` |
| `TwitchFollowers` | Follower-Gesamtzahl | `Followers: %count%` | `%twitch.name%` |
| `TwitchSubs` | Abonnenten-Gesamtzahl | `Subs: %count%` | `%twitch.name%` |
| `TwitchCounter` | Ein benannter Twitch-Chat-Zähler | `%counter.name%: %count%` | `%counter.name%` |
| `TwitchLastRaider` | Der letzte Raider | `Last Raid: %raider%` | `%raider%`, `%raid.viewers%` |
| `TwitchRecentStreams` | In den letzten 14 Tagen gestartete Streams | `Streams: %count%` | |

### Weitere Mewdeko-Funktionen

| Typ | Kategorie | Zeigt | Standardvorlage | Zusätzliche Platzhalter |
| --- | --- | --- | --- | --- |
| `MinecraftPlayers` | Minecraft | Online-Spieler auf einem beobachteten Server | `Players: %count%/%players.max%` | `%players.max%`, `%server.version%` |
| `MinecraftStatus` | Minecraft | Ob ein beobachteter Server erreichbar ist | `%status%` | `%status%`, `%latency%` |
| `CountingCurrent` | Zählen | Aktuelle Zahl in einem Zählkanal | `Count: %count%` | |
| `CountingRecord` | Zählen | Höchste jemals erreichte Zahl | `Record: %count%` | |
| `OpenTickets` | Tickets | Offene, nicht archivierte Tickets | `Open Tickets: %count%` | |
| `TicketsToday` | Tickets | In den letzten 24 Stunden geöffnete Tickets | `Today: %count%` | |
| `PendingSuggestions` | Vorschläge | Vorschläge, die auf eine Entscheidung warten | `Pending: %count%` | |
| `ActiveGiveaways` | Giveaways | Aktuell laufende Giveaways | `Giveaways: %count%` | |
| `StarboardPosts` | Starboard | Starboard-Beiträge insgesamt | `Starred: %count%` | |
| `TopXpUser` | XP | Das Mitglied mit den meisten XP | `Top: %member.name%` | `%member.name%`, `%member.id%`, `%member.xp%` |
| `TotalGuildXp` | XP | Alle auf dem Server verdienten XP | `Total XP: %count%` | |
| `TotalCurrency` | Währung | Von Mitgliedern gehaltene Währung | `In Circulation: %count%` | |
| `ActivePolls` | Umfragen | Umfragen, die Stimmen annehmen | `Polls: %count%` | |
| `Clock` | Server | Datum und Uhrzeit in der Zeitzone des Servers | `%time% %tz%` | `%time%`, `%date%`, `%datetime%`, `%weekday%`, `%tz%` |
| `MessagesToday`, `MessagesWeek` | Aktivität | Nachrichten in den letzten 24 Stunden oder 7 Tagen | `Today: %count%` | |
| `VoiceHoursToday`, `VoiceHoursWeek` | Aktivität | Sprachstunden aller Mitglieder in den letzten 24 Stunden oder 7 Tagen | `Today: %count%h` | |
| `TopChatter` | Aktivität | Der aktivste Chatter der letzten 7 Tage | `Chatter: %member.name%` | `%member.name%`, `%member.id%`, `%member.messages%` |
| `TopVoiceMember` | Aktivität | Das Mitglied mit der meisten Sprachzeit in den letzten 7 Tagen | `Voice: %member.name%` | `%member.name%`, `%member.id%`, `%member.hours%` |
| `TopGame` | Aktivität | Das meistgespielte Spiel der letzten 7 Tage (braucht Spiele-Tracking) | `%game%` | `%game%`, `%hours%`, `%players%` |
| `PlayingNow` | Aktivität | Mitglieder, die gerade ein erfasstes Spiel spielen (braucht Spiele-Tracking) | `Playing: %count%` | |
| `RoleMembersOnline` | Mitglieder | Mitglieder mit einer Rolle, die nicht offline sind | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.total%` |
| `TopInviter` | Einladungs-Tracking | Das Mitglied mit den meisten Einladungen | `Inviter: %member.name%` | `%member.name%`, `%member.id%`, `%member.invites%` |
| `InvitesWeek` | Einladungs-Tracking | Beitritte, die Einladenden in den letzten 7 Tagen gutgeschrieben wurden | `This Week: %count%` | |
| `MembersLeftToday`, `MembersLeftWeek` | Mitglieder | Mitglieder, die in den letzten 24 Stunden oder 7 Tagen gegangen sind | `Left Today: %count%` | |
| `NetGrowthWeek` | Mitglieder | Beitritte minus Austritte der letzten 7 Tage | `Growth: %count%` | `%joins%`, `%leaves%` |

### Platzhalter, die für jeden Typ verfügbar sind

| Platzhalter | Wert |
| --- | --- |
| `%count%` | Der Wert, dargestellt im gewählten Anzeigestil |
| `%count.raw%` | Der Wert als reine Ziffern |
| `%server.name%` | Servername |
| `%server.id%` | Server-ID |
| `%server.members%` | Gesamte Mitgliederzahl |
| `%server.boostcount%` | Boost-Anzahl |
| `%server.boostlevel%` | Boost-Stufe |

Kanalnamen sind auf Discords Limit von 100 Zeichen begrenzt.

## Anzeigestile

Der **Zählerstil** bestimmt, wie `%count%` dargestellt wird. Er gilt nur für numerische Zähler; Textzähler wie `NewestMember` geben den Text unverändert aus, und Wahr-oder-falsch-Zähler wie `TwitchLiveStatus` geben Text im Stil von „LIVE“ oder „Offline“ aus.

| Stil | Beispiel für 1234 | Hinweise |
| --- | --- | --- |
| `Plain` | `1234` | Reine Ziffern |
| `Comma` | `1,234` | Tausendertrennzeichen. Die Vorgabe. |
| `Compact` | `1.2K` | Suffixe K, M, B, T, standardmäßig eine Nachkommastelle |
| `Padded` | `1234` | Mit Nullen auf feste Breite aufgefüllt, standardmäßig vier Stellen, sodass aus 42 `0042` wird |
| `Ordinal` | `1,234th` | Fügt st, nd, rd oder th an |
| `Percent` | `61.7%` | Wert als Prozentsatz des Zielwerts, standardmäßig eine Nachkommastelle |
| `ProgressBar` | ein Balken mit zehn Zellen | Gefüllte und leere Zellen in Richtung des Zielwerts, standardmäßig zehn Zellen |
| `EmojiDigits` | Keycap-Ziffern | Jede Ziffer als Keycap-Emoji |
| `Roman` | `MCCXXXIV` | Römische Ziffern für 1 bis 3999, sonst Rückfall auf den Comma-Stil |

`Percent` und `ProgressBar` brauchen einen Zielwert zum Vergleichen. Ohne einen zeigen sie `0%` oder einen leeren Balken.

## Aktualisierungsmechanismen

| Mechanismus | Bezeichnung im Dashboard | Wie er funktioniert |
| --- | --- | --- |
| `Rename` | Nur umbenennen | Bearbeitet den Kanalnamen. Discord erlaubt zwei Umbenennungen pro zehn Minuten und Kanal, daher wird das Aktualisierungsintervall auf mindestens 5 Minuten erzwungen. Die Kanal-ID ändert sich nie. |
| `Recreate` | Löschen und neu erstellen | Erstellt einen neuen Kanal mit demselben Namen, derselben Kategorie, Position und denselben Berechtigungsüberschreibungen und löscht dann den alten. Kann jede Minute aktualisieren, aber die Kanal-ID ändert sich bei jeder Aktualisierung, und jede Aktualisierung hinterlässt zwei Audit-Log-Einträge. |
| `Auto` | Automatisch (empfohlen) | Benennt um, solange das Budget von zwei Umbenennungen pro zehn Minuten es zulässt. Ist das Budget aufgebraucht und das Intervall unter 5 Minuten, wird stattdessen neu erstellt. Beträgt das Intervall 5 Minuten oder mehr, wartet er einfach auf den nächsten Umbenennungs-Slot. |

Die Vorgabe für neue Statistik-Kanäle ist **Automatisch** alle **5 Minuten**. Intervalle werden auf 1 Minute (bei Rename 5) bis 1440 Minuten begrenzt. Der Bot prüft alle 30 Sekunden, bei welchen Kanälen das Intervall abgelaufen ist.

> [!WARNING]
> Recreate ändert die Kanal-ID. Alles andere, das auf den Kanal verweist, etwa Berechtigungs-Setups in anderen Bots oder angeheftete Links, bricht bei jeder Aktualisierung. Nutze es nur dort, wo eine schnelle Aktualisierung wichtiger ist als eine stabile ID.

## Einstellungen

Die Seite hat drei Tabs, **Statistik-Kanäle**, **Hinzufügen** und **Standardwerte**, sowie in der Kopfzeile eine Schaltfläche **Aktualisieren**. **Statistik-Kanäle** listet jeden konfigurierten Kanal mit den Schaltflächen **Bearbeiten** und **Entfernen**.

**Statistik-Kanal hinzufügen** bietet **Neuen Kanal erstellen** oder **Vorhandenen Kanal verwenden** mit einer Auswahl **Sprachkanal**, danach:

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Kategorie (optional) | keine | Wo ein neu erstellter Kanal platziert wird |
| Zähler | keiner | Der Zählertyp aus dem Katalog |
| Vorlage | Standard des Typs | Kanalname mit Platzhaltern; klicke auf einen Platzhalter-Chip, um ihn einzufügen, die Vorschau aktualisiert sich beim Tippen |
| Zählerstil | Comma | Anzeigestil aus der Tabelle oben |
| Aktualisierungsmechanismus | Automatisch | Umbenennen, neu erstellen oder automatisch |
| Aktualisierungsintervall (Minuten) | 5 | Wie oft der Name aktualisiert wird |
| Rolle | keine | Wird bei `RoleMembers` angezeigt |
| Zieldatum | keines | Wird bei `Countdown` angezeigt |
| Zielwert | keiner | Wird bei `MemberGoal` angezeigt und von den Stilen Percent und ProgressBar verwendet |
| Name des Twitch-Zählers | keiner | Wird bei `TwitchCounter` angezeigt |
| Zählkanal | keiner | Wird bei den Zähl-Typen angezeigt |
| Minecraft-Server | keiner | Wird bei den Minecraft-Typen angezeigt |

**Standardwerte für neue Statistik-Kanäle** legt **Standardmechanismus**, **Standard-Zählerstil** und **Standardintervall (Minuten)** für später hinzugefügte Kanäle fest. Der Tab **Standardwerte** hat außerdem Referenzbereiche für **Zählerstile** und **Verfügbare Zähler**.

Ein neu erstellter Kanal verweigert `@everyone` die Berechtigung Verbinden, damit er als Beschriftung dient. Ein Kanal, den du selbst hinzufügst, behält die Berechtigungen, die er schon hat.

## Einrichtung Schritt für Schritt

1. Öffne **Statistik-Kanäle** im Dashboard und gehe zum Tab **Standardwerte**. Lass **Standardmechanismus** auf Automatisch und setze ein Intervall, mit dem du zufrieden bist.
2. Gehe zu **Hinzufügen**, wähle **Neuen Kanal erstellen** und wähle eine **Kategorie**, wenn du die Zähler gruppieren willst.
3. Wähle einen **Zähler**, zum Beispiel Total Members. Passe die **Vorlage** an und beobachte die Vorschau.
4. Wähle einen **Zählerstil** und speichere.
5. Wiederhole das für jeden Zähler. Für ein Mitgliederziel wähle `MemberGoal`, setze den **Zielwert** und probiere den Stil `ProgressBar`.
6. Ziehe die neuen Kanäle in Discord an den Anfang der Kanalliste, falls sie dort nicht gelandet sind.
7. Warte ein Aktualisierungsintervall ab und prüfe, ob sich die Namen aktualisieren.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Typen, Stile und Mechanismen sind die Namen aus den Tabellen oben, zum Beispiel `TotalMembers`, `Compact`, `Recreate`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `statchannelcreate <type> [template]` | `scnew` | Kanäle verwalten | Einen neuen gesperrten Sprachkanal erstellen, der diesen Zähler zeigt |
| `statchanneladd #voice <type> [template]` | `sca` | Kanäle verwalten | Einen bestehenden Sprachkanal in einen Statistik-Kanal verwandeln |
| `statchannelrole #voice @role [true] [template]` | `scr` | Kanäle verwalten | Einen Zähler für Mitglieder einer Rolle hinzufügen; `true` zählt nur Mitglieder, die nicht offline sind |
| `statchannelcountdown #voice <date> [template]` | `scc` | Kanäle verwalten | Einen Countdown zu einem Datum hinzufügen |
| `statchannelgoal #voice <number> [template]` | `scg` | Kanäle verwalten | Einen Mitgliederziel-Zähler hinzufügen |
| `statchanneltwitchcounter #voice <counter> [template]` | | Kanäle verwalten | Einen benannten Twitch-Chat-Zähler spiegeln |
| `statchannelmechanism #voice <mechanism> [minutes]` | | Kanäle verwalten | Rename, Recreate oder Auto setzen und optional das Intervall |
| `statchannelstyle #voice <style>` | | Kanäle verwalten | Den Anzeigestil setzen |
| `statchanneldefaults [mechanism] [minutes] [style]` | | Kanäle verwalten | Die Standardwerte für neue Statistik-Kanäle setzen |
| `statchanneltypes [category]` | | Keine | Jeden Zähler mit einem Beispiel durchsuchen, optional nach Kategorie |
| `statchannellist` | `scl` | Keine | Die Statistik-Kanäle dieses Servers mit Typ, Stil, Modus und Vorlage auflisten |
| `statchannelremove #voice` | `statchrm` | Kanäle verwalten | Das Verfolgen eines Kanals beenden |

`statchannelcreate` braucht außerdem, dass der Bot Kanäle verwalten hat. Slash-Entsprechungen findest du unter `/statchannel`.

## Tipps und Stolperfallen

- Der Bot braucht Kanäle verwalten, um einen Kanal umzubenennen oder neu zu erstellen.
- Ein Sprachkanal kann nur ein Statistik-Kanal sein. Ihn zweimal hinzuzufügen scheitert mit „already a stat channel“.
- Zähler für Zählen, Minecraft und Twitch brauchen diese Funktionen zuvor eingerichtet. Die Ziele für Zählen und Minecraft werden im Dashboard gewählt; es gibt dafür keinen Befehl.
- `statchannelremove` beendet nur das Verfolgen. Lösche den Sprachkanal selbst, wenn du ihn nicht mehr willst.
- Live-Werte wie Twitch-Zuschauer oder offene Tickets folgen weiterhin dem eigenen Intervall des Kanals. Senke das Intervall bei diesen Kanälen, nicht bei allen.
- Die Stile `Percent` und `ProgressBar` nutzen den eigenen Zielwert des Kanals. Setzt du sie bei einem Zähler ohne Ziel, wird immer null angezeigt.

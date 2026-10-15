---
title: Moderation
slug: moderation
summary: Mitglieder verwarnen, stummschalten, in den Timeout schicken, kicken und bannen, Strafen bei sich häufenden Verwarnungen automatisch eskalieren und festlegen, wie viele Tage an Nachrichten ein Bann löscht.
icon: fa-flag
category: Security
dashboard: /dashboard/moderation
module: Moderation
tags: [moderation, warn, warnings, warn punish, punishment ladder, mute, mute role, timeout, ban, softban, kick, ban purge, ban prune, purge, prune, dehoist, warnlog, Moderation, Verwarnung, Verwarnungen, Strafen, Stummschalten, Stummschalt-Rolle, Bann, Kick, Bereinigen, Löschen, Strafen-Stufenleiter]
related: [administration, filter, logging, auditlog]
---

## Was es macht

Moderation ist das Werkzeug, das das Team bei einzelnen Mitgliedern einsetzt. Kern sind die Verwarnungen: Ein Moderator führt `warn @user reason` aus, das Mitglied erhält eine DM mit dem Grund und wer es verwarnt hat, die Verwarnung wird gespeichert, und wenn der Server einen Verwarnungs-Log-Kanal hat, landet dort ein Embed mit der Verwarnungsanzahl und einer eventuell ausgelösten Strafe.

Verwarnungen summieren sich. Du kannst eine Strafen-Stufenleiter aufbauen, sodass das Erreichen einer bestimmten Anzahl aktiver Verwarnungen automatisch etwas auslöst: eine Stummschaltung, einen Timeout, einen Kick, einen Bann oder eine Rolle. Das Team muss sich die Regeln nicht merken; der Bot wendet sie in dem Moment an, in dem die Anzahl erreicht wird. Verwarnungen können später vergeben (erlassen) werden oder nach einer Anzahl von Tagen von selbst ablaufen.

Drumherum liegen die direkten Aktionen: Stummschalten (mit einer verwalteten Stummschalt-Rolle), Timeout, Kick, Softban, Bann, temporärer Bann, Massenkick, Nachrichten löschen und Nickname-Bereinigung für Mitglieder, die sich mit Sonderzeichen an die Spitze der Liste hieven. Jede Bann-Aktion hat außerdem eine konfigurierbare Bereinigung, also wie viele Tage an Nachrichten des Mitglieds Discord zusammen mit dem Bann löscht.

Die Dashboard-Seite deckt Verwarnungen, die Strafen-Stufenleiter, den Verwarnungs-Log-Kanal und die Bann-Bereinigungs-Einstellungen ab. Direkte Aktionen wie Stummschalten, Kick und Bann gibt es nur als Befehle.

## Wofür du es brauchst

- Du willst eine einheitliche „Drei-Strikes“-Regel, die unabhängig davon, welcher Moderator gerade Dienst hat, gleich greift.
- Mitglieder müssen schnell zum Schweigen gebracht werden, ohne Kanalberechtigungen von Hand anzufassen.
- Ein Spammer ist beigetreten und du willst, dass seine Nachrichten des letzten Tages mit dem Bann verschwinden, aber ein temporärer Bann für ein reguläres Mitglied soll dessen Verlauf nicht löschen.
- Das Team braucht eine durchsuchbare Aufzeichnung, wer verwarnt wurde, von wem und warum, die einen Moderatorenwechsel überdauert.
- Namen wie „!!! xXx“ schweben immer wieder an die Spitze der Mitgliederliste und du willst sie in einem Rutsch bereinigen.

## Verwarnungen

`warn <user> [reason]` braucht Mitglieder bannen. Der Bot versucht zuerst, dem Mitglied ein Embed mit dem Servernamen, dem Moderator und dem Grund per DM zu schicken. Schlägt die DM fehl, erhält die Bestätigung im Kanal eine Fußzeile, die das mitteilt. Die Verwarnung wird dann mit dem Namen des Moderators und dem Grund gespeichert, oder mit `-`, wenn keiner angegeben wurde.

Das Mitglied muss in der Rollenhierarchie unter dem Moderator und unter dem Bot stehen. Ist das nicht der Fall, verweigert der Befehl die Ausführung.

`warnlog <user>` zeigt eine seitenweise Liste, neun pro Seite, mit Datum, Moderator und Grund. Vergebene Verwarnungen werden durchgestrichen angezeigt, mit dem Namen dessen, der sie aufgehoben hat. `warnlogall` listet jedes Mitglied mit Verwarnungen als `aktiv (gesamt - vergeben)` auf.

`warnclear <user> [index]` markiert Verwarnungen als vergeben. Ohne Index oder mit `0` werden alle vergeben. Mit einem Index wird nur diese eine vergeben, nummeriert wie in `warnlog`. Vergebene Verwarnungen bleiben im Log, zählen aber nicht mehr für Strafen. Das Dashboard kann eine Verwarnung auch komplett löschen, wodurch sie dauerhaft entfernt wird.

### Ablauf von Verwarnungen

`warnexpire <days> <clear|delete>` legt fest, wie lange eine Verwarnung zählt. Tage können 0 bis 366 sein; 0 schaltet den Ablauf aus. Die Aktion bestimmt, was passiert, wenn eine Verwarnung abläuft:

| Aktion | Was passiert |
| --- | --- |
| Clear | Die Verwarnung wird als vergeben markiert und bleibt im Log |
| Delete | Die Verwarnung wird aus der Datenbank entfernt |

Der Ablauf wird alle zwölf Stunden geprüft und einmal sofort, wenn du ihn festlegst.

### Der Verwarnungs-Log-Kanal

Lege ihn mit `setwarnchannel #channel` oder der Auswahl **Verwarnungs-Log-Kanal** im Tab „Strafen“ des Dashboards fest. Jede Verwarnung postet dort ein Embed mit Name und ID des Mitglieds, seiner aktuellen Verwarnungsnummer, der ausgelösten Strafe (oder „None“), dem Grund und einem Sprunglink zur Nachricht, mit der die Verwarnung ausgesprochen wurde.

## Verwarnungs-Strafen

Die Stufenleiter ist eine Liste von Regeln „bei N aktiven Verwarnungen mache X“. Wird eine Verwarnung ausgesprochen, zählt der Bot die aktiven Verwarnungen des Mitglieds einschließlich der neuen und sucht eine Regel mit genau dieser Anzahl. Nur eine exakte Übereinstimmung löst aus: Ein Mitglied mit einer Regel bei 3, das irgendwie 4 erreicht, ohne dass es eine Regel bei 4 gibt, bekommt nichts zusätzlich.

Eine Regel legst du mit `warnpunish <number> <punishment> [time]` fest, oder mit `warnpunish <number> addrole <role> [time]` für die Rollenvariante. `warnpunish <number>` ohne alles andere entfernt die Regel. `warnpunishlist` zeigt die Stufenleiter.

| Strafe | Zeitlich begrenzt? | Was sie macht |
| --- | --- | --- |
| Mute | Optional | Weist die Stummschalt-Rolle zu, oder eine zeitlich begrenzte Stummschaltung, wenn eine Zeit angegeben ist |
| ChatMute | Optional | Nur Stummschalt-Rolle, keine Sprach-Stummschaltung |
| VoiceMute | Optional | Nur Sprach-Stummschaltung per Server |
| Timeout | Erforderlich, bis zu 28 Tage | Discord-Timeout |
| Kick | Nein | Kickt das Mitglied |
| Softban | Nein | Bannt und entbannt sofort wieder, um Nachrichten zu löschen |
| Ban | Optional | Dauerhafter Bann, oder ein zeitlich begrenzter Bann, wenn eine Zeit angegeben ist |
| AddRole | Optional | Fügt die gewählte Rolle hinzu, nach Ablauf der Zeit wieder entfernt, falls gesetzt |
| RemoveRoles | Nein | Entfernt die Rollen des Mitglieds |

Zeiten werden in Minuten gespeichert und können bis zu 49 Tage betragen. Softban, Kick und RemoveRoles lehnen eine Zeit ab. Timeout lässt sich ohne Zeit nicht speichern. Strafen laufen mit dem Grund „Warned too many times.“

Im Dashboard befindet sich dieselbe Stufenleiter im Tab **Strafen**: Wähle **Bei Warnung Nr.**, eine **Strafe**, optional eine **Dauer (Minuten)** und für die Rollenstrafe eine **Hinzuzufügende Rolle**, dann **Zur Stufenleiter hinzufügen**. Das Speichern einer Regel bei einer Anzahl, für die es schon eine gibt, ersetzt diese.

> [!EXAMPLE]
> `warnpunish 2 mute 1h`, `warnpunish 3 timeout 1d`, `warnpunish 5 ban`. Zwei Verwarnungen schalten für eine Stunde stumm, drei setzen für einen Tag in den Timeout, fünf bannen.

## Mini-Verwarnungen

Es gibt eine zweite, unabhängige Verwarnungsspur namens Mini-Verwarnungen, gedacht für kleinere Verstöße, die Nachwuchs-Teammitglieder bearbeiten. `mwarn` braucht nur Mute Members statt Mitglieder bannen. Sie hat ein eigenes Log (`mwarnlog`, `mwarnlogall`), einen eigenen Löschbefehl, einen eigenen Ablauf, eine eigene Strafen-Stufenleiter (`mwarnpunish`) und einen eigenen Log-Kanal (`setmwarnchannel`). Mini-Verwarnungen zählen nie für die Hauptstufenleiter und umgekehrt. Das Dashboard zeigt keine Mini-Verwarnungen an.

## Stummschaltungen und die Stummschalt-Rolle

Der Bot verwaltet eine Stummschalt-Rolle. Standardmäßig heißt sie `Mewdeko-mute`; ändere sie mit `muterole @role`, oder führe `muterole` allein aus, um die aktuelle zu sehen. Wird zum ersten Mal eine Stummschaltung gebraucht, erstellt der Bot die Rolle, falls sie nicht existiert, und geht dann jeden Textkanal durch und fügt eine Überschreibung hinzu, die Send Messages, Add Reactions, Attach Files, Send Messages in Threads und Create Public Threads verweigert. Threads werden übersprungen. Das kann in Servern mit vielen Kanälen einen Moment dauern.

| Befehl | Wirkung |
| --- | --- |
| `mute` | Volle Stummschaltung: fügt die Stummschalt-Rolle hinzu |
| `chatmute` | Fügt nur die Stummschalt-Rolle hinzu |
| `voicemute` | Schaltet das Mitglied nur im Sprachkanal per Server stumm |
| `stfu` | Verweigert Send Messages für dieses Mitglied nur im aktuellen Kanal, über eine Berechtigungs-Überschreibung |

Jeder hat eine zeitlich begrenzte Form. Volle Stummschaltungen laufen von einer Minute bis zu 90 Tagen; Chat- und Sprach-Stummschaltungen von einer Minute bis zu 49 Tagen. `stfu` mit einer Zeit hebt die Überschreibung auf, wenn die Zeit abgelaufen ist. Stummgeschaltete Mitglieder erhalten eine DM beim Stummschalten und beim Aufheben.

`removeonmute y` sorgt dafür, dass eine volle Stummschaltung auch die anderen Rollen des Mitglieds entfernt und speichert, und `unmute` gibt sie zurück. `removeonmute n` schaltet das aus. `unmuteall` entfernt nach einer Bestätigungsabfrage die Stummschalt-Rolle von allen, die sie haben, optional mit einem Grund.

## Timeouts

`timeout <time> <user> [reason]` nutzt Discords nativen Timeout, bis zu 28 Tage. Sowohl du als auch der Bot braucht Mitglieder moderieren. `untimeout <user>` hebt ihn auf. Der Grund landet im Audit-Log als `moderator | reason`.

## Banns, Kicks und Softbans

`ban <user> [reason]` schickt dem Mitglied zuerst eine DM und bannt dann. `ban <time> <user> [reason]` ist ein temporärer Bann, der sich selbst aufhebt, bis zu 49 Tage. `ban <pruneTime> <time> <user>` legt das Bereinigungsfenster und die Bann-Länge ausdrücklich fest. Das Bannen per ID funktioniert für Leute, die nicht auf dem Server sind. `unban <user or id>` macht es rückgängig.

`softban <user> [reason]` bannt und entbannt sofort wieder, also ein Kick, der auch aktuelle Nachrichten löscht. `kick <user> [reason]` kickt, und `masskick @a @b @c` kickt mehrere Leute auf einmal und meldet, wie viele erfolgreich waren. `masskill` ist nur für den Bot-Owner und bannt eine eingefügte Liste von IDs massenhaft.

### Die Bann-DM

Die Nachricht, die ein gebanntes Mitglied erhält, lässt sich mit `banmessage <text or embed code>` anpassen. Der Text läuft durch den Embed-Parser, es funktioniert also alles aus dem Embed-Builder. Setze sie auf `-`, um gar keine DM zu senden, und nutze `banmsgreset`, um zum Standard zurückzukehren. `banmsgtest [duration] [reason]` schickt dir die aktuelle Vorlage, damit du sie sehen kannst.

| Platzhalter | Wert |
| --- | --- |
| `%ban.mod%` | Der vollständige Name des Moderators |
| `%ban.mod.name%` | Der Benutzername des Moderators |
| `%ban.user%` | Der vollständige Name des gebannten Mitglieds |
| `%ban.user.name%` | Der Benutzername des gebannten Mitglieds |
| `%ban.reason%` oder `%reason%` | Der Grund, oder `-`, wenn keiner angegeben ist |
| `%ban.duration%` | Die Länge als `d.hh:mm`, oder `perma` |

Server-Platzhalter wie `%server.name%` funktionieren hier ebenfalls.

## Bann-Bereinigung

Jeder Bann trägt eine Bereinigung: die Anzahl der Tage an Nachrichten des Mitglieds, die Discord damit löscht, von 0 bis 7. Statt einer globalen Zahl hat jede Art von Bann ihren eigenen Standard, und du kannst jeden davon für den ganzen Server, für eine Kategorie oder für einen einzelnen Kanal überschreiben.

| Aktion | Schlüssel | Eingebauter Standard |
| --- | --- | --- |
| Bann | `ban` | 7 Tage |
| Bann per ID | `hackban` | 7 Tage |
| Temporärer Bann | `tempban` | keiner |
| Softban | `softban` | 7 Tage |
| Massenbann | `massban` | 7 Tage |
| Bann per Avatar-Hash | `banbyhash` | keiner |
| Bann in Rolle | `baninrole` | keiner |
| Bann nach Beitrittsalter | `banunder` | keiner |
| Verwarnungs-Strafe | `warnpunish` | keiner |
| Auto-Bann-Rolle | `autobanrole` | keiner |
| Rollen-Überwachung | `rolemonitor` | keiner |
| Filter | `filter` | keiner |
| Lockdown | `lockdown` | keiner |
| Dashboard | `dashboard` | keiner |

Bei einem Bann sucht der Bot die spezifischste Einstellung: den Kanal, in dem der Befehl ausgeführt wurde, dann die Kategorie dieses Kanals, dann den Server-Standard. Innerhalb jeder Ebene schlägt eine Einstellung für die genaue Aktion eine für „alle Aktionen“. Passt nichts, gilt der eingebaute Standard.

`banprune` zeigt, was ein Bann aus dem aktuellen Kanal bereinigen würde, plus jede konfigurierte Einstellung. `banpruneset <action|all> <days> [#channel or category]` legt eine fest, `banpruneclear <action|all> [#channel or category]` entfernt eine, und `banprunereset` löscht alle.

Der Tab **Ban-Bereinigung** des Dashboards listet unter **Server-Standards** jede Aktion mit je einem Tage-Feld auf, eine Ausweichzeile **Alle Aktionen** und einen Bereich **Überschreibungen**, in dem du einen **Geltungsbereich** (Kanal oder Kategorie), das Ziel, eine **Aktion** und **Bereinigen (Tage)** wählst.

## Nachrichten löschen

`purge [count] [flags]` löscht bis zu 1000 Nachrichten im aktuellen Kanal. Ohne Anzahl löscht es die letzten 100 Nachrichten des Bots selbst. `purge @user [count]` löscht nur die Nachrichten dieses Mitglieds aus den letzten zwei Wochen. Flags lassen sich kombinieren: `-s` überspringt angeheftete Nachrichten, `-nb` überspringt Bots, `-ob` nur Bots, `-he` nur Nachrichten mit Embeds, `-ne` nur ohne, `-c text` nur Nachrichten, die den Text enthalten, `-b date` vor einem Datum und `-a date` nach einem.

`purgeuser <user> <count>` durchsucht die letzten `count` Nachrichten (1 bis 1000) jedes Textkanals und löscht die Nachrichten dieses Nutzers in jedem davon.

## Nicknames

`dehoist <user>` und `sanitize <user>` schreiben den Nickname eines Mitglieds um, sodass führende Sonderzeichen oder ungewöhnliche Zeichen wegfallen. `dehoistall [nicksOnly]` und `sanitizeall` machen das nach einer Bestätigung für alle, als Hintergrundjob; `massnickprogress` meldet, wie weit er ist, und `massnickstop` bricht ihn ab. Die Einzelbefehle brauchen beim Bot Nicknamen verwalten; die „all“-Varianten brauchen beim Bot Administrator. In beiden Fällen muss die Rolle des Bots über den betroffenen Mitgliedern liegen.

## Einstellungen

Die Dashboard-Seite hat fünf Tabs: **Übersicht** (Verwarnungszahlen), **Verwarnungen**, **Strafen**, **Letzte Aktivität** und **Ban-Bereinigung**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Verwarnungs-Log-Kanal | keiner | Kanal, der für jede Verwarnung ein Embed erhält |
| Strafen-Stufenleiter | leer | Was bei welcher Verwarnungsanzahl ausgelöst wird |
| Ablauf von Verwarnungen | aus | Tage, bis eine Verwarnung vergeben oder gelöscht wird, nur per Befehl |
| Stummschalt-Rolle | `Mewdeko-mute` | Die Rolle, die Stummschalt-Befehle anwenden, nur per Befehl |
| Rollen beim Stummschalten entfernen | aus | Rollen rund um eine volle Stummschaltung entfernen und wiederherstellen, nur per Befehl |
| Bann-DM-Vorlage | Standard-Embed | Die DM, die ein gebanntes Mitglied erhält, nur per Befehl |
| Bann-Bereinigungs-Standards | pro Aktion | Tage an Nachrichten, die mit jeder Art von Bann gelöscht werden |
| Bann-Bereinigungs-Überschreibungen | keine | Bereinigung pro Kanal oder pro Kategorie |

Im Tab **Verwarnungen** kann das Team ein Mitglied per Nutzer-ID mit einem Pflichtgrund verwarnen, nach ID, Grund oder Moderator suchen, vergebene Verwarnungen ausblenden, eine Verwarnung vergeben, alle für ein Mitglied vergeben oder eine dauerhaft löschen.

> [!WARNING]
> Das Löschen einer Verwarnung im Dashboard entfernt sie für immer, und sie zählt nicht mehr. Das Vergeben behält den Eintrag und lässt sie ebenfalls nicht mehr zählen. Vergib lieber, außer du hast einen Grund, die Historie zu löschen.

## Einrichtung Schritt für Schritt

1. Öffne **Moderation** im Dashboard und gehe zu **Strafen**.
2. Wähle einen **Verwarnungs-Log-Kanal**, den nur das Team lesen kann.
3. Füge der Stufenleiter Regeln hinzu. Ein sanfter Start ist Mute für 60 Minuten bei 2, Timeout für 1440 Minuten bei 3, Ban bei 5.
4. Führe `muterole @Muted` aus, wenn du schon eine Stummschalt-Rolle hast, sonst lass den Bot `Mewdeko-mute` bei der ersten Verwendung erstellen.
5. Lege mit `warnexpire 90 clear` den Ablauf fest, damit alte Verwarnungen nach drei Monaten nicht mehr zählen.
6. Setze unter **Ban-Bereinigung** **Temporärer Bann** auf 0, wenn temporäre Banns keinen Verlauf löschen sollen, und füge Kanal-Überschreibungen hinzu, wenn ein Bot-Spam-Kanal mehr bereinigen soll.
7. Teste mit einem Alt: `warn @alt test`, prüfe den Log-Kanal, dann `warnclear @alt`.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `warn <user> [reason]` | | Mitglieder bannen | Ein Mitglied verwarnen und eine Stufenleiter-Strafe anwenden |
| `warnlog <user or id>` | | Mitglieder bannen | Die Verwarnungen eines Mitglieds anzeigen |
| `warnlogall` | | Mitglieder bannen | Verwarnungszahlen für alle anzeigen |
| `warnclear <user> [index]` | `warnc` | Mitglieder bannen | Alle Verwarnungen vergeben, oder eine nach Nummer |
| `warnexpire <days> <clear|delete>` | `warne` | Administrator | Verwarnungen nach einer Anzahl Tagen automatisch vergeben oder löschen |
| `warnpunish <number> <punishment> [time]` | `warnp` | Mitglieder bannen | Eine Stufenleiter-Regel festlegen, oder mit nur einer Zahl entfernen |
| `warnpunishlist` | `warnpl` | Niemand | Die Strafen-Stufenleiter anzeigen |
| `setwarnchannel <#channel>` | `warnchannel` | Administrator | Den Verwarnungs-Log-Kanal festlegen |
| `mwarn <user> [reason]` | `miniwarn` | Mute Members | Eine Mini-Verwarnung aussprechen |
| `mwarnlog [page] [user or id]` | | Mute Members, oder Niemand für die eigenen | Mini-Verwarnungen anzeigen |
| `mwarnlogall` | `mwarnlogs` | Mute Members | Mini-Verwarnungszahlen für alle |
| `mwarnclear <user or id> [index]` | `mwarnc` | Administrator | Mini-Verwarnungen vergeben |
| `mwarnexpire <days> [clear|delete]` | `mwarne` | Administrator | Ablauf von Mini-Verwarnungen |
| `mwarnpunish <number> <punishment> [time]` | `mwarnp` | Administrator | Eine Mini-Verwarnungs-Stufenleiter-Regel festlegen oder entfernen |
| `mwarnpunishlist` | `mwarnplist`, `mwarnpl` | Niemand | Die Mini-Verwarnungs-Stufenleiter anzeigen |
| `setmwarnchannel <#channel>` | `mwarnchannel` | Administrator | Den Mini-Verwarnungs-Log-Kanal festlegen |
| `timeout <time> <user> [reason]` | | Mitglieder moderieren | Ein Mitglied in den Timeout schicken, bis zu 28 Tage |
| `untimeout <user>` | | Mitglieder moderieren | Einen Timeout aufheben |
| `mute <user> [time] [reason]` | | Rollen verwalten oder Mute Members | Volle Stummschaltung, optional zeitlich begrenzt |
| `unmute <user> [reason]` | | Rollen verwalten oder Mute Members | Eine volle Stummschaltung aufheben |
| `chatmute [time] <user> [reason]` | | Rollen verwalten | Nur Stummschalt-Rolle |
| `chatunmute <user> [reason]` | | Rollen verwalten | Eine Chat-Stummschaltung aufheben |
| `voicemute [time] <user> [reason]` | | Mute Members | Nur Sprach-Stummschaltung |
| `voiceunmute <user> [reason]` | | Mute Members | Eine Sprach-Stummschaltung aufheben |
| `stfu [time] <user>` | `cmute`, `channelmute` | Mute Members | Das Senden nur im aktuellen Kanal verweigern |
| `unstfu <user>` | `unchannelmute` | Mute Members | `stfu` rückgängig machen |
| `muterole [role]` | `setmuterole` | Rollen verwalten | Die Stummschalt-Rolle anzeigen oder festlegen |
| `removeonmute <y|n>` | | Administrator | Rollen rund um volle Stummschaltungen entfernen und wiederherstellen |
| `unmuteall [reason]` | `umall` | Administrator | Alle mit der Stummschalt-Rolle entstummen |
| `kick <user or id> [reason]` | `k` | Mitglieder kicken | Ein Mitglied kicken |
| `masskick <users...>` | `mkick` | Mitglieder kicken | Mehrere Mitglieder kicken |
| `ban [time] <user or id> [reason]` | `b` | Mitglieder bannen | Bannen, oder temporär bannen bis zu 49 Tage |
| `unban <user or id>` | | Mitglieder bannen | Einen Bann aufheben |
| `softban <user or id> [reason]` | `sb` | Mitglieder kicken und Nachrichten verwalten | Bannen und wieder entbannen, um Nachrichten zu löschen |
| `banmessage [text]` | `banmsg`, `bantemplate`, `bantemp` | Mitglieder bannen | Die Bann-DM anzeigen oder festlegen, `-` zum Deaktivieren |
| `banmsgreset` | | Mitglieder bannen | Die Standard-Bann-DM wiederherstellen |
| `banmsgtest [time] [reason]` | | Mitglieder bannen | Dir die Bann-Vorlage per DM schicken |
| `masskill <ids and reasons>` | | Bot-Owner | Eine eingefügte Liste massenhaft bannen |
| `banprune` | `banpurge` | Mitglieder bannen | Wirksame und konfigurierte Bereinigungs-Einstellungen anzeigen |
| `banpruneset <action|all> <days> [channel]` | `banpurgeset` | Administrator | Eine Bereinigungs-Einstellung festlegen |
| `banpruneclear <action|all> [channel]` | `banpurgeclear` | Administrator | Eine Bereinigungs-Einstellung entfernen |
| `banprunereset` | `banpurgereset` | Administrator | Jede Bereinigungs-Einstellung entfernen |
| `purge [count or user] [count] [flags]` | `clear`, `prune` | Nachrichten verwalten | Nachrichten in diesem Kanal gesammelt löschen |
| `purgeuser <user> <count>` | `pruneuser` | Nachrichten verwalten | Die Nachrichten eines Nutzers in allen Kanälen löschen |
| `dehoist <user>` | | Nicknamen verwalten | Einen hochgehievten Nickname korrigieren |
| `dehoistall [nicksOnly]` | `dehoista` | Nicknamen verwalten | Jeden hochgehievten Nickname korrigieren |
| `sanitize <user>` | | Nicknamen verwalten | Einen Nickname normalisieren |
| `sanitizeall` | `sanitizea` | Nicknamen verwalten | Jeden Nickname normalisieren |
| `massnickprogress` | `mnickprogress`, `mnp` | Administrator | Fortschritt eines laufenden Dehoist oder Sanitize |
| `massnickstop` | `mnstop`, `mns` | Administrator | Einen laufenden Dehoist oder Sanitize stoppen |

## Tipps und Stolperfallen

- Die Rolle des Bots muss über jedem liegen, den er stummschaltet, kickt oder bannt, und über der Stummschalt-Rolle selbst. Die meisten „Strafe kann nicht angewendet werden“-Fehler sind Hierarchieprobleme.
- Der Bot braucht für die passenden Befehle Mitglieder bannen, Mitglieder kicken, Mitglieder moderieren, Rollen verwalten und Nachrichten verwalten; jeder Befehl prüft vor der Ausführung die eigene Berechtigung des Bots.
- Die Stufenleiter löst nur bei einer exakten Anzahl aus. Fülle jede Stufe aus, die dir wichtig ist, statt „3 oder mehr“ anzunehmen.
- Nur Verwarnungen, die über den Bot ausgesprochen wurden, zählen. Discords eigene Timeouts und Banns fügen keine Verwarnungen hinzu.
- Die Stummschalt-Rolle verweigert Berechtigungen pro Kanal. Kanäle, die nach dem Bestehen der Rolle erstellt wurden, erhalten die Überschreibung beim nächsten Stummschalten, nicht sofort.
- Discord erlaubt das gesammelte Löschen nur bis zu 14 Tage zurück. Ältere Nachrichten werden von den Lösch-Befehlen übersprungen.
- Die Bereinigung beim Bann ist von Discord auf 7 Tage begrenzt, egal was du konfigurierst.
- Verwarnungen aus dem Dashboard brauchen einen gültigen Grund und verwenden dein Dashboard-Konto als Moderatorennamen.

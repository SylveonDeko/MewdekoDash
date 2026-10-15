---
title: Serververwaltung
slug: servermanagement
summary: Massen-Werkzeuge für die Struktur deines Servers: Kanäle und Rollen erstellen und löschen, Hunderten Mitgliedern in einem Auftrag Rollen geben, den Server sperren, Kanal-Überschreibungen synchronisieren, Emotes stehlen und gefährliche Rollenänderungen überwachen.
icon: fa-server
category: Actions
module: ServerManagement
tags: [server management, roles, mass role, channels, lockdown, slowmode, lock channel, nuke, emotes, steal emotes, webhook, permcontrol, role monitor, role jobs, server icon, server banner, Serververwaltung, Rollen, Massenrolle, Kanäle, Sperrung, Slowmode, Kanal sperren, Emotes stehlen, Rollenüberwachung, Rollenaufträge, Servericon, Serverbanner]
related: [administration, permissions, moderation]
---

## Was es macht

Die Serververwaltung bündelt die Befehle, die die Struktur eines Servers verändern statt der Personen darin. Das Team kann in einer Zeile eine Kategorie samt aller Kanäle erstellen, Kanäle umbenennen oder löschen, Themen festlegen, NSFW umschalten, Slowmode setzen, einen Kanal sperren oder einen löschen und neu erstellen, um seinen Verlauf zu leeren.

Rollen bekommen die meiste Aufmerksamkeit. Einzelne Befehle erstellen, benennen um, färben um, heben hervor und löschen Rollen oder geben einem einzelnen Mitglied eine Rolle, optional mit Timer. Massenbefehle fügen eine Rolle für alle Mitglieder, alle Menschen, alle Bots, alle in einer anderen Rolle oder alle hinzu, die vor oder nach einem Stichtag beigetreten sind, oder entfernen sie. Diese laufen als Hintergrundaufträge, die du auflisten und stoppen kannst.

Das Modul deckt außerdem das Aussehen des Servers ab (Icon, Banner, Splash, Name), die Emote-Verwaltung einschließlich des Stehlens von Emotes von anderen Servern, Berechtigungs-Überschreibungen pro Kanal, das Verschieben in Sprachkanälen, drei Arten der Sperrung und eine Rollenüberwachung, die gefährliche Rollenänderungen rückgängig macht und bestraft.

Hier wird nichts im Dashboard konfiguriert. Alles läuft über Befehle.

## Wofür du es nutzen kannst

- Einen neuen Server einrichten und zehn Kanäle unter einer Kategorie haben wollen, ohne zehnmal durch die Discord-Oberfläche zu klicken.
- Zweitausend bestehenden Mitgliedern eine „Member"-Rolle geben, nachdem du die Rollenbeschränkung eingeschaltet hast.
- Den Server bei einem Raid sperren, damit niemand posten kann, und danach die alten Berechtigungen exakt wiederherstellen.
- Emotes vom Server eines Freundes mit einem Befehl kopieren.
- Verhindern, dass ein Moderator sich selbst Administrator gibt, indem er einer Rolle eine auf der schwarzen Liste stehende Berechtigung hinzufügt.

## Kanäle

### Erstellen und bearbeiten

`creatxtchanl <name>` und `creatvoichanl <name>` erstellen einen einzelnen Text- oder Sprachkanal. `deltxtchanl <#channel>` und `delvoichanl <channel>` löschen einen.

Die `cc...`-Familie erstellt mehrere auf einmal:

| Befehl | Was er erstellt |
| --- | --- |
| `ccatc <category name> <channel names...>` | Eine neue Kategorie und Textkanäle darin |
| `ccavc <category name> <channel names...>` | Eine neue Kategorie und Sprachkanäle darin |
| `cctc <existing category> <channel names...>` | Textkanäle in einer bereits bestehenden Kategorie |
| `ccvc <existing category> <channel names...>` | Sprachkanäle in einer bereits bestehenden Kategorie |

`renamechannel <channel> <name>` benennt einen beliebigen Kanal um, `setchanlname <name>` benennt den Kanal um, in dem du dich befindest, `settopic [text]` setzt oder löscht das Thema des aktuellen Kanals, und `nsfwtoggle` schaltet die NSFW-Markierung des aktuellen Kanals um.

### Slowmode, Sperren und Nuke

`slowmode` allein schaltet den aktuellen Kanal zwischen einer Minute und aus um. `slowmode <time>` wie `slowmode 30s` setzt ein bestimmtes Intervall, und beide Formen akzeptieren ein Kanal-Argument. Alles ab 21600 Sekunden (sechs Stunden) wird abgelehnt.

`lock [#channel]` fügt für die Rolle `@everyone` in diesem Kanal ein Verbot für „Nachrichten senden" hinzu; `unlock [#channel]` entfernt es. Bestehende Überschreibungs-Bits bleiben erhalten.

`nuke [#channel]` fragt nach einer Bestätigung, löscht den Kanal und erstellt einen neuen mit demselben Namen, derselben Position, demselben Thema, denselben Berechtigungs-Überschreibungen, derselben NSFW-Markierung, Kategorie und demselben Slowmode. Angeheftete Nachrichten, Webhooks und der Nachrichtenverlauf sind für immer weg.

### Berechtigungs-Überschreibungen

`permcontrol <channel> <allow|deny|inherit> <role or user> <permissions...>` bearbeitet die Überschreibung eines Ziels in einem Kanal, ohne dessen andere Bits anzufassen. `permview [@user or role]` listet auf, welche Berechtigungen du, ein Mitglied oder eine Rolle gerade haben.

`syncroletoall <role>` kopiert die Überschreibung der Rolle aus dem aktuellen Kanal in jeden Textkanal und jede Kategorie. `syncroletoallchannels` und `syncroletoallcategories` tun das nur für Kanäle oder nur für Kategorien. Die Rolle muss in dem Kanal, in dem du den Befehl ausführst, bereits eine Überschreibung haben.

### Webhooks

`createwebhook <#channel> <name> [avatar url]` erstellt einen Webhook. Ein angehängtes Bild wird als Avatar verwendet, wenn du keine URL angibst. Der Bot bestätigt im Kanal und schickt dir die Webhook-URL und das Token per DM.

## Sprache

- `moveto <voice channel>` verschiebt dich.
- `moveuserto @user <voice channel>` verschiebt jemand anderen.
- `grab @user` zieht jemanden in den Sprachkanal, in dem du bist.

## Sperrung

`lockdown [type] [action] [override]` und `liftlockdown [type]` benötigen Administrator.

| Typ | Was er macht |
| --- | --- |
| `Joins` | Wer beitritt, während sie aktiv ist, wird gekickt oder gebannt. Die Aktion ist standardmäßig `Ban`; `Kick` ist die einzige andere Option. |
| `Readonly` | Der Bot speichert die aktuelle `@everyone`-Überschreibung jedes Kanals und verweigert dann in Textkanälen „Nachrichten senden", das Erstellen von Threads und Antworten in Threads sowie in Sprachkanälen „Verbinden" und „Sprechen". Forenkanäle behalten „Nachrichten senden", damit bestehende Threads lesbar bleiben. |
| `Full` | Beides zusammen. |

Bevor eine schreibgeschützte Sperrung angewendet wird, prüft der Bot, ob er jeden Kanal bearbeiten kann. Fehlen bei einigen die Rechte, listet er sie auf und hält an, es sei denn, du gibst `true` als drittes Argument an, um trotzdem fortzufahren. Das Aufheben der Sperrung stellt die gespeicherten Überschreibungen wieder her. Beitritts-Sperrungen überstehen einen Neustart des Bots.

`unlockdown` ist ein separates, älteres Werkzeug: Es schaltet „Nachrichten senden" für die Rolle `@everyone` selbst wieder ein, für Server, die durch Bearbeiten dieser Rolle gesperrt wurden.

> [!WARNING]
> `lockdown` ohne Argumente ist eine schreibgeschützte Sperrung, und `lockdown joins` bannt Neuankömmlinge standardmäßig. Gib `kick` an, wenn du das willst.

## Rollen

### Befehle für einzelne Rollen

| Befehl | Was er macht |
| --- | --- |
| `createrole [name]` | Erstellt eine Rolle, nicht erwähnbar |
| `deleterole <role>` | Löscht eine Rolle unterhalb deiner eigenen höchsten Rolle |
| `renamerole <role> <name>` | Benennt eine Rolle um |
| `rolecolor <role> [colour]` | Zeigt die Farbe der Rolle an oder setzt sie |
| `rolehoist <role>` | Schaltet um, ob die Rolle in der Mitgliederliste separat angezeigt wird |
| `setrole <role> @user [time]` | Gibt eine Rolle, optional mit automatischem Entfernen nach `time`, etwa `2h` |
| `removerole <role> @user` | Nimmt eine Rolle weg |
| `removeallroles @user` | Entfernt alle nicht verwalteten Rollen eines Mitglieds |

Bei `setrole` und `removerole` können Rolle und Mitglied in beliebiger Reihenfolge angegeben werden.

### Mehrere Rollen oder Mitglieder auf einmal

- `createroles <names...>` erstellt nach Bestätigung der Liste eine Rolle pro Wort.
- `deleteroles <roles...>` löscht nach einer Bestätigung mehrere Rollen; verwaltete Rollen werden übersprungen.
- `setroles @user <roles...>` gibt einem Mitglied mehrere Rollen; `setroles @user <time> <roles...>` macht sie befristet.
- `removeroles @user <roles...>` entfernt mehrere Rollen von einem Mitglied.
- `adduserstorole <role> @user @user...` und `removeusersfromrole <role> @user @user...` wirken auf mehrere Mitglieder.

### Massen-Rollenaufträge

Diese gehen die gesamte Mitgliederliste durch und laufen als Hintergrundaufträge. Wegen der Rate-Limits von Discord pausiert der Bot kurz pro Mitglied und erlaubt nur fünf Aufträge gleichzeitig pro Server. Jeder Auftrag meldet, wie lange er voraussichtlich dauert.

| Befehl | Wer betroffen ist |
| --- | --- |
| `addtoall <role>` | Jedes Mitglied, das die Rolle nicht hat |
| `addtoallusers <role>` | Nur Menschen |
| `addtoallbots <role>` | Nur Bots |
| `addtousersover <time> <role>` | Mitglieder, die vor mindestens `time` beigetreten sind, zum Beispiel `30d` |
| `addtousersunder <time> <role>` | Mitglieder, die vor weniger als `time` beigetreten sind |
| `addroletorole <role> <role2>` | Gibt `role` allen in `role2` |
| `addthenremove <role> <role2>` | Gibt `role` allen in `role2` und entfernt danach `role2` |
| `removefromall <role>` | Alle, die die Rolle haben |
| `removefromallusers <role>` | Nur Menschen |
| `removefromallbots <role>` | Nur Bots |
| `removefromrole <role> <role2>` | Entfernt `role` von allen in `role2` |

`rolejobs` listet die laufenden Aufträge mit Typ, Auslöser, Fortschritt und Rollen auf. `stopjob <number>` bricht einen ab und meldet, wie weit er gekommen war.

### Export und Import

`exportrolelist` sendet eine Datei `rolelist.txt` mit einer Zeile `roleId,userId,roleName` pro Mitgliedschaft für jede Rolle, die der Bot verwalten kann. `importrolelist` liest eine solche an den Befehl angehängte Datei und wendet die Rollen erneut an; gib `true` an, um Rollen per Name zu erstellen, wenn die IDs nicht mehr existieren. `addroletolist <role>` liest eine angehängte Liste von Nutzer-IDs und gibt ihnen die Rolle.

## Serveraussehen und Emotes

`seticon <url>`, `setbanner <url>`, `setsplash <url>` und `setservername <name>` ändern den Server selbst und benötigen Administrator. `setguildavatar`, `setguildbanner` und `setguildbio` ändern nur, wie der Bot selbst auf diesem Server erscheint, und benötigen „Server verwalten".

Emote-Befehle benötigen „Ausdrücke verwalten" bei dir und beim Bot:

- `addemote <name> [url]` lädt ein Emote von einer URL oder aus einem angehängten Bild hoch.
- `removeemote <emote>` und `renameemote <emote> <name>` wirken auf Emotes dieses Servers.
- `stealemotes <emotes...>` kopiert jedes benutzerdefinierte Emote deiner Nachricht in diesen Server. `sfr <role> <emotes...>` tut dasselbe, beschränkt die Emotes aber auf eine Rolle.
- Ein Rechtsklick auf eine Nachricht und die Auswahl von **Steal Emotes** oder **Steal Sticker** im Apps-Menü macht dasselbe ohne Tippen.

## Rollenüberwachung

Die Rollenüberwachung beobachtet das Audit-Log. Wenn ein Mitglied eine Rolle von der schwarzen Liste bekommt oder eine Rolle eine Berechtigung von der schwarzen Liste erhält, macht der Bot die Änderung rückgängig und bestraft den Verursacher. Nur der Serverbesitzer kann sie konfigurieren.

- `addblacklistedrole <role> [punishment]` und `removeblacklistedrole <role>`.
- `addblacklistedpermission <permission> [punishment]` und `removeblacklistedpermission <permission>`, zum Beispiel `addblacklistedpermission Administrator Ban`.
- `setdefaultpunishment <punishment>` legt fest, was passiert, wenn ein Eintrag der schwarzen Liste keine eigene Strafe hat. Der Standard ist `None`.
- `addwhitelisteduser @user`, `addwhitelistedrole <role>` und ihre `remove...`-Gegenstücke nehmen Teammitglieder von der Überwachung aus. Änderungen von oder an Personen auf der weißen Liste werden ignoriert.
- `listblacklists` zeigt alles oben Genannte an.

Mögliche Strafen sind `None`, `Warn`, `Mute`, `ChatMute`, `VoiceMute`, `Timeout`, `Kick`, `Softban`, `Ban`, `RemoveRoles`, `AddRole` und `Delete`. Wenn mehrere Berechtigungen der schwarzen Liste gleichzeitig hinzugefügt werden, gilt die schwerste Strafe.

## Einstellungen

Es gibt keine Dashboard-Seite. Die einzigen gespeicherten Einstellungen gehören zur Rollenüberwachung und zum Sperrzustand.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Standardstrafe | None | Wird angewendet, wenn eine Rolle oder Berechtigung der schwarzen Liste keine Strafe hat |
| Rollen auf der schwarzen Liste | keine | Rollen, die beim Vergeben wieder entfernt werden, jeweils mit optionaler Strafe |
| Berechtigungen auf der schwarzen Liste | keine | Berechtigungen, die beim Hinzufügen zu einer Rolle rückgängig gemacht werden, jeweils mit optionaler Strafe |
| Nutzer und Rollen auf der weißen Liste | keine | Von der Überwachung ausgenommen |
| Aktion der Beitritts-Sperrung | Ban | Was mit Mitgliedern passiert, die während einer Beitritts-Sperrung beitreten |

## Einrichtung Schritt für Schritt

1. Prüfe, dass die Rolle des Bots über jeder Rolle steht, die er verwalten soll, und dass er „Rollen verwalten" und „Kanäle verwalten" hat.
2. Baue die Struktur: `ccatc Community general off-topic memes` erstellt die Kategorie und drei Kanäle.
3. Erstelle Rollen in einem Rutsch: `createroles Member Regular Veteran`.
4. Verteile die Basisrolle: `addtoallusers Member`, und beobachte es mit `rolejobs`.
5. Schütze den Server als Serverbesitzer: `addblacklistedpermission Administrator Ban` und `addwhitelistedrole Admin`.
6. Behalte `lockdown full kick` für Notfälle im Hinterkopf und teste danach an einem ruhigen Tag `liftlockdown full`.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `permview [@user or role]` | `pview` | Niemand | Erlaubte Berechtigungen auflisten |
| `setsplash <url>` | `setserversplash`, `setsplashimage` | Administrator | Den Einladungs-Splash festlegen |
| `seticon <url>` | `setservericon`, `seticonimage` | Administrator | Das Servericon festlegen |
| `setbanner <url>` | `setserverbanner` | Administrator | Das Serverbanner festlegen |
| `setservername <name>` | | Administrator | Den Server umbenennen |
| `setguildavatar [url]` | `sgav`, `setgav` | Server verwalten | Avatar des Bots auf diesem Server |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Server verwalten | Banner des Bots auf diesem Server |
| `setguildbio <text>` | `sgbio`, `setgbio` | Server verwalten | Bio des Bots auf diesem Server |
| `addemote <name> [url]` | `emoteadd`, `ae`, `ea` | Ausdrücke verwalten | Ein Emote hochladen |
| `removeemote <emote>` | `deleteemote`, `emoteremove`, `emotedelete` | Ausdrücke verwalten | Ein Emote löschen |
| `renameemote <emote> <name>` | `emoterename` | Ausdrücke verwalten | Ein Emote umbenennen |
| `stealemotes <emotes...>` | `steal` | Ausdrücke verwalten | Emotes in diesen Server kopieren |
| `sfr <role> <emotes...>` | | Ausdrücke verwalten | Emotes kopieren, auf eine Rolle beschränkt |
| `creatxtchanl <name>` | `ctch` | Kanäle verwalten | Einen Textkanal erstellen |
| `creatvoichanl <name>` | `cvch` | Kanäle verwalten | Einen Sprachkanal erstellen |
| `deltxtchanl <#channel>` | `dtch` | Kanäle verwalten | Einen Textkanal löschen |
| `delvoichanl <channel>` | `dvch` | Kanäle verwalten | Einen Sprachkanal löschen |
| `ccatc <category> <names...>` | | Kanäle verwalten | Neue Kategorie mit Textkanälen |
| `ccavc <category> <names...>` | | Kanäle verwalten | Neue Kategorie mit Sprachkanälen |
| `cctc <category> <names...>` | | Kanäle verwalten | Textkanäle in einer bestehenden Kategorie |
| `ccvc <category> <names...>` | | Kanäle verwalten | Sprachkanäle in einer bestehenden Kategorie |
| `renamechannel <channel> <name>` | `channelrename` | Kanäle verwalten | Einen Kanal umbenennen |
| `setchanlname <name>` | `schn` | Kanäle verwalten | Den aktuellen Kanal umbenennen |
| `settopic [text]` | `st` | Kanäle verwalten | Das aktuelle Thema festlegen oder löschen |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Kanäle verwalten | Die NSFW-Markierung umschalten |
| `slowmode [time] [#channel]` | | Kanäle verwalten | Slowmode umschalten oder festlegen |
| `lock [#channel]` | `channellock`, `lockchannel` | Nachrichten verwalten | „Nachrichten senden" für alle verweigern |
| `unlock [#channel]` | `channelunlock`, `unlockchannel` | Nachrichten verwalten | `lock` rückgängig machen |
| `nuke [#channel]` | `channelnuke`, `nukechannel` | Kanäle verwalten | Einen Kanal löschen und neu erstellen |
| `permcontrol <channel> <allow|deny|inherit> <role or user> <perms...>` | `permc` | Kanäle verwalten | Eine Kanal-Überschreibung bearbeiten |
| `syncroletoall <role>` | `synctoall` | Kanäle verwalten | Eine Überschreibung in alle Kanäle und Kategorien kopieren |
| `syncroletoallchannels <role>` | `srtch`, `srtach` | Kanäle verwalten | Eine Überschreibung in Textkanäle kopieren |
| `syncroletoallcategories <role>` | `srtc`, `srtac` | Kanäle verwalten | Eine Überschreibung in Kategorien kopieren |
| `createwebhook <#channel> <name> [avatar]` | `cwh` | Administrator | Einen Webhook erstellen |
| `moveto <voice channel>` | | Niemand | Dich selbst verschieben |
| `moveuserto @user <voice channel>` | `moveuto` | Kanäle verwalten | Jemanden verschieben |
| `grab @user` | `getoverhere` | Niemand | Jemanden in deinen Sprachkanal ziehen |
| `lockdown [joins|readonly|full] [kick|ban] [true]` | `lockdownserver` | Administrator | Eine Sperrung starten |
| `liftlockdown [type]` | `unlockserver` | Administrator | Eine Sperrung beenden |
| `unlockdown` | `endlockdown` | Kanäle verwalten | „Nachrichten senden" für `@everyone` wieder aktivieren |
| `createrole [name]` | `cr` | Rollen verwalten | Eine Rolle erstellen |
| `deleterole <role>` | `dr` | Rollen verwalten | Eine Rolle löschen |
| `renamerole <role> <name>` | `renr` | Rollen verwalten | Eine Rolle umbenennen |
| `rolecolor <role> [colour]` | `roleclr` | Rollen verwalten zum Setzen | Eine Rollenfarbe anzeigen oder setzen |
| `rolehoist <role>` | `rh` | Rollen verwalten | Hervorhebung umschalten |
| `setrole <role> @user [time]` | `sr`, `giverole` | Rollen verwalten | Eine Rolle geben, optional befristet |
| `removerole <role> @user` | `rr` | Rollen verwalten | Eine Rolle entfernen |
| `removeallroles @user` | `rar` | Rollen verwalten | Alle Rollen entziehen |
| `createroles <names...>` | `croles`, `crs` | Rollen verwalten | Mehrere Rollen erstellen |
| `deleteroles <roles...>` | `drs` | Rollen verwalten | Mehrere Rollen löschen |
| `setroles @user [time] <roles...>` | `srs` | Rollen verwalten | Mehrere Rollen geben |
| `removeroles @user <roles...>` | `rrs` | Rollen verwalten | Mehrere Rollen entfernen |
| `adduserstorole <role> @users...` | `autr` | Rollen verwalten | Eine Rolle an mehrere Mitglieder geben |
| `removeusersfromrole <role> @users...` | `rufr` | Rollen verwalten | Eine Rolle von mehreren Mitgliedern entfernen |
| `addtoall <role>` | `ata` | Rollen verwalten | Rolle an jedes Mitglied |
| `addtoallusers <role>` | `atau` | Rollen verwalten | Rolle an jeden Menschen |
| `addtoallbots <role>` | `atab` | Rollen verwalten | Rolle an jeden Bot |
| `addtousersover <time> <role>` | `atuo` | Rollen verwalten | Rolle an Mitglieder, die vor mindestens so langer Zeit beigetreten sind |
| `addtousersunder <time> <role>` | `atuu` | Rollen verwalten | Rolle an Mitglieder, die kürzlicher beigetreten sind |
| `addroletorole <role> <role2>` | `artr` | Rollen verwalten | Rolle an alle in einer anderen Rolle |
| `addthenremove <role> <role2>` | `atr` | Rollen verwalten | Eine Rolle gegen eine andere tauschen |
| `removefromall <role>` | `rfa` | Rollen verwalten | Von jedem Mitglied entfernen |
| `removefromallusers <role>` | `rfau` | Rollen verwalten | Von jedem Menschen entfernen |
| `removefromallbots <role>` | `rfab` | Rollen verwalten | Von jedem Bot entfernen |
| `removefromrole <role> <role2>` | `rfr` | Rollen verwalten | Von allen in einer anderen Rolle entfernen |
| `rolejobs` | `rj` | Rollen verwalten | Laufende Massen-Rollenaufträge auflisten |
| `stopjob <number>` | `sj` | Rollen verwalten | Einen Auftrag abbrechen |
| `exportrolelist` | `exportroles`, `erl` | Rollen verwalten | Rollenmitgliedschaften herunterladen |
| `importrolelist [true]` | `importroles`, `irl` | Rollen verwalten | Eine exportierte Liste erneut anwenden |
| `addroletolist <role>` | `artl` | Rollen verwalten | Eine Rolle an eine angehängte Liste von Nutzer-IDs geben |
| `setdefaultpunishment <action>` | `sdp`, `defaultpunishment`, `setdefpunishment` | Serverbesitzer | Ersatzstrafe der Rollenüberwachung |
| `addblacklistedrole <role> [action]` | `abr`, `blacklistrole`, `addbrole` | Serverbesitzer | Eine Rolle überwachen |
| `removeblacklistedrole <role>` | `rbr`, `unblacklistrole`, `removebrole` | Serverbesitzer | Eine Rolle nicht mehr überwachen |
| `addblacklistedpermission <permission> [action]` | `abp`, `blacklistpermission`, `addbpermission` | Serverbesitzer | Eine Berechtigung überwachen |
| `removeblacklistedpermission <permission>` | `rbp`, `unblacklistpermission`, `removebpermission` | Serverbesitzer | Eine Berechtigung nicht mehr überwachen |
| `addwhitelisteduser @user` | `awu`, `whitelistuser`, `addwuser` | Serverbesitzer | Ein Mitglied ausnehmen |
| `removewhitelisteduser @user` | `rwu`, `unwhitelistuser`, `removewuser` | Serverbesitzer | Eine Ausnahme entfernen |
| `addwhitelistedrole <role>` | `awr`, `whitelistrole`, `addwrole` | Serverbesitzer | Eine Rolle ausnehmen |
| `removewhitelistedrole <role>` | `rwr`, `unwhitelistrole`, `removewrole` | Serverbesitzer | Eine Ausnahme entfernen |
| `listblacklists` | `lbl`, `blacklists`, `listbws` | Serverbesitzer | Die Listen der Überwachung anzeigen |

## Tipps und Stolperfallen

- Rollenbefehle prüfen die Hierarchie doppelt: Deine höchste Rolle und die höchste Rolle des Bots müssen beide über der betreffenden Rolle stehen. Der Serverbesitzer überspringt die Prüfung auf seiner Seite.
- Massenaufträge brauchen ungefähr eine Sekunde pro Mitglied. Eine Rolle an fünftausend Mitglieder zu vergeben dauert deutlich über eine Stunde, und der Bot lehnt einen sechsten gleichzeitigen Auftrag ab.
- `syncroletoall` und seine Varianten benötigen eine bereits vorhandene Überschreibung der Rolle in dem Kanal, in dem du sie ausführst; genau diese Überschreibung wird kopiert.
- `nuke` kann nicht rückgängig gemacht werden, und die Bestätigungsabfrage ist die einzige Absicherung.
- Die schreibgeschützte Sperrung bearbeitet Überschreibungen in jedem Kanal, was auf großen Servern viele API-Aufrufe bedeutet. Hebe sie mit `liftlockdown` auf, nicht von Hand, damit die gespeicherten Überschreibungen wiederhergestellt werden.
- Die Rollenüberwachung stützt sich auf das Audit-Log, daher braucht der Bot „Audit-Log anzeigen" sowie die Berechtigung für die gewählte Strafe.
- Zum Stehlen von Emotes werden freie Emote-Plätze benötigt; Fehlschläge werden unter „Errored Emotes" aufgelistet.

---
title: Tickets
slug: tickets
summary: Support-Ticket-Panels mit Buttons und Auswahlmenüs, die private Kanäle öffnen, dazu Übernehmen, Prioritäten, Tags, Fälle, Transkripte und Team-Werkzeuge.
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, modmail, Hilfe, Helpdesk, Ticket-Panel, Transkripte, Fälle, Übernehmen, Priorität, Blacklist]
related: [administration, chat-triggers, auditlog]
---

## Was es macht

Tickets macht aus einem Kanal einen Helpdesk. Du postest ein Panel, also eine Nachricht mit einem Embed und einem oder mehreren Buttons oder einem Auswahlmenü. Wenn ein Mitglied auf einen Button klickt oder eine Option wählt, erstellt der Bot einen privaten Textkanal für es, setzt die Berechtigungen so, dass nur das Mitglied und deine Support-Rollen ihn sehen können, und postet eine Eröffnungsnachricht mit den Buttons **Übernehmen** und **Schließen**.

Aus Sicht des Mitglieds: klicken, optional ein kurzes Formular ausfüllen, und ein Kanal mit einem Namen wie `ticket-username-1` erscheint. Dort beschreibt es sein Anliegen. Wird das Ticket geschlossen, wird der Kanal in `closed-...` umbenannt, gesperrt und entweder in eine Archivkategorie verschoben oder nach einer Verzögerung gelöscht, je nachdem, wie du diesen Tickettyp eingerichtet hast.

Aus Sicht des Teams: Ein Ticket übernehmen, damit alle wissen, wer sich darum kümmert, eine Priorität setzen, Tags hinzufügen, Notizen hinterlassen, zusammengehörige Tickets zu einem Fall verknüpfen und es schließen. Jedes Schließen kann ein Transkript in einem Kanal und im Dashboard speichern. Das Dashboard zeigt außerdem Antwort- und Lösungszeiten, Tickets nach Priorität und eine Ansicht pro Teammitglied.

Jeder Button und jede Auswahloption ist ein eigener Tickettyp mit eigener Kategorie, eigenen Rollen, Limits, einem eigenen Formular, einer eigenen Eröffnungsnachricht und eigenem Verhalten beim Schließen.

## Wofür du es nutzen kannst

- Ein Support-Server möchte private Eins-zu-eins-Kanäle statt eines öffentlichen Hilfekanals.
- Du hast mehrere Teams (Abrechnung, Moderation, Partnerschaften) und willst ein Auswahlmenü, das zum richtigen Team weiterleitet.
- Du brauchst Moderator-Bewerbungen mit einem Formular, getrennt vom allgemeinen Support.
- Du willst eine Nachvollziehbarkeit: Transkripte, Team-Notizen und Fälle, die zusammengehörige Meldungen bündeln.
- Du willst bestimmte Mitglieder ganz daran hindern, Tickets zu öffnen.

## Panels, Buttons und Auswahlmenüs

Ein Panel ist eine Nachricht in einem Kanal. Die Panel-ID ist die ID dieser Nachricht. Ein Panel kann Buttons, Auswahlmenüs oder beides enthalten.

- **Buttons**: ein Tickettyp pro Button. Jeder hat ein Label, ein optionales Emoji und einen Stil (Primary, Secondary, Success oder Danger).
- **Auswahlmenüs**: ein Menü mit einem Platzhalter und einer Liste von Optionen. Jede Option ist ein Tickettyp mit Label, Beschreibung und Emoji. Ein Menü muss mindestens eine Option behalten.

Wird die Panel-Nachricht gelöscht, listet `checkpanels` auf, welche Panels fehlen, und `recreatepanel` oder `recreateallpanels` postet sie erneut und aktualisiert die gespeicherte Nachrichten-ID. Der Bot beobachtet außerdem, ob Panel-Nachrichten gelöscht werden.

`ticketduplicatepanel` kopiert ein Panel samt allen Komponenten in einen anderen Kanal. `ticketmovepanel` verschiebt es. `ticketupdatepanel` ersetzt das Embed durch neues Embed-JSON.

### Einstellungen des Tickettyps

Diese gibt es bei jedem Button und jeder Auswahloption. Im Dashboard erscheinen sie, wenn du einen Button oder eine Option hinzufügst oder bearbeitest.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Kanalnamen-Format | `ticket-{username}-{id}` | Name des erstellten Kanals; `{id}` ist die Ticketnummer des Mitglieds, max. 100 Zeichen |
| Ticket-Kategorie | keine | Kategorie, in der der Kanal erstellt wird |
| Archivkategorie | keine | Kategorie, in die der Kanal beim Schließen oder Archivieren verschoben wird |
| Support-Rollen | keine | Rollen, die das Ticket sehen, darin schreiben und es übernehmen können |
| Betrachter-Rollen | keine | Rollen, die lesen, aber nicht schreiben können |
| Max. aktive Tickets | 1 | Wie viele offene Tickets dieses Typs ein Mitglied haben darf |
| Automatisch schließen (Stunden) | keine | Wird pro Typ gespeichert und in `buttoninfo` angezeigt |
| Erforderliche Antwortzeit (Minuten) | keine | Wird pro Typ gespeichert und in `buttoninfo` angezeigt |
| Erlaubte Prioritäten | alle | Welche Prioritäten das Team bei diesem Typ setzen darf |
| Standardpriorität | keine | Priorität, mit der ein neues Ticket startet |
| Transkript speichern | aus | Beim Schließen des Tickets ein Transkript erzeugen |
| Beim Schließen sperren | an | Senden für alle außer den Support-Rollen verbieten |
| Beim Schließen umbenennen | an | Dem Kanalnamen `closed-` voranstellen |
| Ersteller entfernen | an | Beim Schließen den Zugriff des Erstellers entfernen |
| Beim Schließen löschen | aus | Den Kanal nach der Verzögerung löschen, statt ihn zu behalten |
| Löschverzögerung | 5 Minuten | Wartezeit vor dem Löschen, wenn Beim Schließen löschen an ist; das Dashboard-Feld nimmt Sekunden, `ticketclosebehavior` nimmt Minuten |
| Beim Schließen automatisch archivieren | aus | Das Ticket als Teil des Schließens archivieren |
| Beim Archivieren sperren | an | Den Kanal beim Archivieren schreibgeschützt machen |
| Beim Archivieren umbenennen | an | Dem Kanalnamen `archived-` voranstellen |
| Ersteller entfernen (Archiv) | aus | Beim Archivieren den Zugriff des Erstellers entfernen |
| Modal | keine | Ein Formular, das vor dem Erstellen des Tickets angezeigt wird |
| Eröffnungsnachricht | Standard-Embed | Eigene Eröffnungsnachricht mit Platzhaltern |

### Formulare (Modals)

Ein Tickettyp kann Fragen stellen, bevor der Kanal erstellt wird. Setze mit `setmodaltitle` einen Titel (Standard „Create Ticket“) und füge mit `addmodalfield` Felder hinzu. Ein Feld ist standardmäßig kurz und Pflicht; Optionen nach dem Label ändern das: `paragraph` für mehrzeilig, `optional`, sowie `min:X` oder `max:X` für Längenlimits bis 4000. Die Feld-ID ist das Label in Kleinbuchstaben, wobei Leerzeichen zu Unterstrichen werden.

Die Antworten werden mit dem Ticket gespeichert und können in der Eröffnungsnachricht als `%modal.<fieldId>%` verwendet werden.

### Die Eröffnungsnachricht

Standardmäßig postet der Bot ein Embed mit dem Titel „Support Ticket“, das das Mitglied begrüßt, die Ticket-ID und die Erstellungszeit zeigt und darum bittet, das Anliegen zu beschreiben. Die Buttons Übernehmen und Schließen sind angehängt.

Du kannst sie pro Tickettyp durch eigenen Text oder ein eigenes Embed ersetzen. Nutze dafür den Embed-Builder im Dashboard (**Eröffnungsnachricht des Tickets konfigurieren**). Hier verfügbare Platzhalter:

| Platzhalter | Wert |
| --- | --- |
| `%ticket.id%` | Die Ticketnummer |
| `%ticket.channel%` | Erwähnung des Ticket-Kanals |
| `%ticket.user%` | Der Nutzername des Erstellers |
| `%ticket.user.mention%` | Eine Erwähnung des Erstellers |
| `%ticket.user.avatar%` | Die Avatar-URL des Erstellers |
| `%ticket.user.id%` | Die Nutzer-ID des Erstellers |
| `%ticket.created%` | Wann das Ticket erstellt wurde |
| `%modal.<fieldId>%` | Die Antwort auf ein Formularfeld |

Der allgemeine Platzhalter-Satz wird auf diese Nachricht nicht angewendet; nur die oben genannten.

## Was passiert, wenn ein Ticket geöffnet wird

1. Mitglieder auf der Blacklist werden mit einer ephemeren Nachricht abgewiesen.
2. Die offenen Tickets des Mitglieds von diesem Typ werden gegen **Max. aktive Tickets** (Standard 1) gezählt.
3. Der Kanal wird in der Ticket-Kategorie erstellt, wobei `@everyone` verweigert wird, der Ersteller ansehen, senden, den Verlauf lesen, Dateien anhängen und Links einbetten darf, Support-Rollen dasselbe plus Nachrichten verwalten erhalten und Betrachter-Rollen nur lesen dürfen.
4. Die Eröffnungsnachricht wird mit den Buttons Übernehmen und Schließen gepostet.
5. Ist ein Log-Kanal gesetzt, wird dort ein Eintrag „neues Ticket“ gepostet.
6. Ein Ereignis **Ticket geöffnet** wird an die Chat-Trigger veröffentlicht.

## Übernehmen, Notizen, Prioritäten und Tags

**Übernehmen**: Ein Mitglied einer Support-Rolle oder ein Administrator übernimmt das Ticket mit dem Button oder `ticketclaim`. Der Kanal erhält ein Embed „übernommen von“. Nur der Übernehmende oder ein Administrator kann die Übernahme aufheben. Ein geschlossenes oder bereits übernommenes Ticket kann nicht übernommen werden.

**Notizen**: `ticketnote` fügt dem aktuellen Ticket eine Team-Notiz hinzu. Die Notiz wird mit dem Ticket gespeichert, im Dashboard angezeigt und im Ticket-Kanal als blaues Embed „Notiz hinzugefügt“ mit dem Autor in der Fußzeile gepostet.

**Prioritäten** sind serverweite Definitionen, die du mit `ticketaddpriority` oder im Tab **Konfiguration** erstellst. Jede hat eine ID, einen Anzeigenamen, ein Emoji, eine Stufe von 1 bis 5, eine Farbe, eine Antwortzeit und eine Option **Team benachrichtigen**. Wenn du bei einem Ticket eine Priorität setzt, wird ein Embed in dieser Farbe gepostet und, wenn die Option an ist, werden die Support-Rollen gepingt. Ein Tickettyp kann einschränken, welche Prioritäten erlaubt sind.

**Tags** sind serverweite Labels mit ID, Name, Beschreibung und Farbe. Füge sie einem Ticket mit `ticketaddtags` hinzu oder entferne sie mit `ticketremovetags`, jeweils über die Tag-IDs. Das Dashboard zeigt sie bei jedem Ticket an und lässt dich nach Tag suchen.

## Schließen, Archivieren und Transkripte

Beim Schließen wird das Ticket als geschlossen markiert und ein rotes Embed „Ticket geschlossen“ gepostet. Danach, der Reihe nach:

1. Ist **Transkript speichern** für den Typ aktiv und ein Transkript-Kanal gesetzt, werden die letzten 5000 Nachrichten gespeichert und ein Embed mit einem Link **Transkript ansehen** im Transkript-Kanal gepostet. Der Link öffnet das Transkript im Dashboard.
2. Ist Auto-Archivieren für den Typ aktiv oder hast du mit `ticketclose true` geschlossen, wird das Ticket archiviert (siehe unten).
3. Andernfalls laufen die Schließ-Verhaltensweisen ab: in `closed-...` umbenennen, den Ersteller entfernen, den Kanal sperren und dabei die Support-Rollen behalten, dann entweder in die Archivkategorie verschieben oder, mit **Beim Schließen löschen**, im Kanal warnen und das Löschen nach der Löschverzögerung planen. Geplante Löschungen werden einmal pro Minute verarbeitet.

Beim Archivieren wird der Kanal in `archived-...` umbenannt, in die Archivkategorie verschoben, für alle schreibgeschützt gemacht und das Ticket als archiviert markiert. `ticketarchive` macht das direkt bei einem offenen Ticket. Existiert der Kanal nicht mehr, wird das Ticket einfach als archiviert markiert.

Beim Schließen wird ein Ereignis **Ticket geschlossen** an die Chat-Trigger veröffentlicht.

> [!NOTE]
> Ein Transkript entsteht nur, wenn für den Typ **Transkript speichern** aktiviert ist und der Server einen Transkript-Kanal hat. Ohne Transkript-Kanal gelingt das Schließen trotzdem, es wird aber nichts gespeichert.

## Fälle

Ein Fall bündelt Tickets, die zusammengehören, zum Beispiel mehrere Meldungen über dieselbe Person. Erstelle einen mit `ticketcreatecase <title> <description>` oder im Tab **Fälle**, verknüpfe dann das aktuelle Ticket mit `ticketlinkcase <caseId>` und löse die Verknüpfung mit `ticketunlinkcase`. Fälle haben eigene Notizen, können geschlossen und wieder geöffnet werden und lassen sich im Dashboard oder über die Slash-Befehle `/tickets cases` bearbeiten.

## Blacklist

`ticketblock @user [reason]` hindert ein Mitglied daran, Tickets zu öffnen. Der Grund wird in den Log-Kanal geschrieben, falls einer gesetzt ist. `ticketunblock` hebt die Sperre auf. Der Tab **Erweitert** im Dashboard hat denselben Bereich **Blacklist-Verwaltung**, der eine Nutzer-ID entgegennimmt.

## Massen-Werkzeuge

- `ticketcloseinactive <hours>` schließt jedes offene Ticket, das so viele Stunden lang keine Aktivität hatte, postet in jedem ein Embed „automatisch geschlossen“ und archiviert es, wenn der Typ eine Archivkategorie hat. **Inaktive Tickets schließen** im Tab **Erweitert** macht dasselbe.
- `ticketmoveall <source category> <target category>` verschiebt jeden Ticket-Kanal zwischen Kategorien.

## Statistiken

`ticketstats` zeigt Summen, Anzahl offener und geschlossener Tickets, die durchschnittliche Antwortzeit in Minuten, die durchschnittliche Lösungszeit in Stunden sowie Aufschlüsselungen nach Typ und Priorität. `ticketuserstats [@user]` zeigt dasselbe für ein Mitglied plus dessen letzte Tickets. Der Tab **Übersicht** zeigt Antwortzeiten, Tickets nach Priorität und die Leistung des Teams.

## Einstellungen

Die Tickets-Seite hat sechs Tabs: **Übersicht**, **Tickets**, **Ticket-Panels**, **Konfiguration**, **Fälle** und **Erweitert**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Transkript-Kanal | keiner | Wo Transkript-Zusammenfassungen mit Links gepostet werden (Konfiguration) |
| Log-Kanal | keiner | Wo das Erstellen von Tickets und Blacklist-Einträge protokolliert werden (Konfiguration) |
| Prioritäten | keine | Serverweite Prioritätsdefinitionen (Konfiguration) |
| Tags | keine | Serverweite Tag-Definitionen (Konfiguration) |
| Panel-Embed | Titel „Support Tickets“ | Die Panel-Nachricht, erstellt im Embed-Editor (Ticket-Panels) |
| Einstellungen pro Typ | siehe Tabelle oben | Wird bei jedem Button oder jeder Auswahloption gesetzt (Ticket-Panels) |
| Blacklist | leer | Mitglieder, die keine Tickets öffnen können (Erweitert) |

Der Tab **Tickets** listet offene und geschlossene Tickets mit Suche nach Ticket, Nutzer, Kanal oder Tag. Von dort aus kann das Team übernehmen, die Übernahme aufheben, die Priorität setzen, Tags hinzufügen oder entfernen, eine Team-Notiz hinzufügen, mit optionalem Grund schließen, archivieren und das Transkript öffnen.

> [!PERMISSION]
> Der Bot braucht Kanäle verwalten und Rollen verwalten, damit er Ticket-Kanäle erstellen und festlegen kann, wer sie sehen darf. Seine Rolle muss die Ticket- und die Archivkategorien sehen können.

## Einrichtung Schritt für Schritt

1. Erstelle eine Kategorie für offene Tickets und optional eine für geschlossene. Erstelle einen Transkript-Kanal und einen Log-Kanal, die nur das Team sehen kann.
2. Öffne **Tickets** im Dashboard, gehe zu **Konfiguration** und setze **Transkript-Kanal** und **Log-Kanal**.
3. Erstelle weiterhin unter **Konfiguration** mindestens eine Priorität (zum Beispiel `urgent`, Stufe 5, Team benachrichtigen an) und alle Tags, die du möchtest.
4. Gehe zu **Ticket-Panels** und **Neues Panel erstellen**. Wähle den Kanal und gestalte das **Panel-Embed**.
5. Wähle das Panel aus und füge einen **Neuer Button** hinzu. Lege Label, Stil, **Ticket-Kategorie**, **Archivkategorie** und **Support-Rollen** fest und schalte **Transkript speichern** ein. Entscheide dich, ob geschlossene Kanäle in der Archivkategorie bleiben oder per **Beim Schließen löschen** mit Verzögerung gelöscht werden.
6. Öffne optional den Modal-Builder, um Formularfelder hinzuzufügen, und den Editor für die Eröffnungsnachricht, um die Begrüßung anzupassen.
7. Für mehrere Tickettypen in einem Dropdown füge stattdessen ein **Neues Auswahlmenü** hinzu und ergänze pro Typ eine Option mit denselben Einstellungen.
8. Öffne von einem anderen Konto aus ein Test-Ticket, übernimm es, setze eine Priorität, schließe es und prüfe den Transkript-Kanal.

In Discord führt dich `/tickets setup wizard #channel` mit Vorlagen (Basic Support, Department Support, Gaming Server, Business, Mod Applications) durch dieselben Schritte.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Panel-IDs sind Nachrichten-IDs; Button-, Menü- und Options-IDs stammen aus `panelinfo` oder `ticketlistpanel`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `ticketpanel <#channel> [embedJson]` | `tpanel` | Administrator | Ein Panel erstellen, mit Vorschau- oder Erstellen-Abfrage |
| `ticketpaneldelete <panelId> [force]` | `tpaneldelete` | Administrator | Ein Panel löschen; `true` erzwingt es auch mit angehängten Tickets |
| `ticketupdatepanel <panelId> <embedJson>` | `tupdatepanel` | Administrator | Das Panel-Embed ersetzen |
| `ticketmovepanel <panelId> <#channel>` | `tmovepanel` | Administrator | Ein Panel in einen anderen Kanal verschieben |
| `ticketduplicatepanel <panelId> <#channel>` | `tduplicatepanel` | Administrator | Ein Panel und seine Komponenten kopieren |
| `panellist` | `plist` | Administrator | Panels mit Anzahl der Komponenten auflisten |
| `panelinfo <panelId>` | `pinfo` | Administrator | Buttons und Menüs eines Panels mit IDs anzeigen |
| `ticketlistpanels` | `tlistpanels` | Kanäle verwalten | Detaillierte, seitenweise Liste aller Panels |
| `ticketlistpanel <panelId>` | `tlistpanel` | Kanäle verwalten | Alle Komponenten eines Panels mit Einstellungen |
| `checkpanels` | `tcheckpanels` | Administrator | Panels melden, deren Nachricht oder Kanal fehlt |
| `recreatepanel <panelId>` | `trecreate` | Administrator | Ein fehlendes Panel erneut posten |
| `recreateallpanels` | `trecreateall` | Administrator | Jedes fehlende Panel erneut posten |
| `setpaneltranscripts <panelId> <true or false>` | `sptranscripts` | Administrator | Transkripte für jeden Button eines Panels umschalten |
| `ticketaddbutton <panelId> <label> [style] [emoji]` | `taddbtn` | Administrator | Einen Button hinzufügen |
| `buttoninfo <buttonId>` | `binfo` | Administrator | Die Einstellungen eines Buttons anzeigen |
| `deletebutton <buttonId>` | `delbtn` | Administrator | Einen Button entfernen |
| `ticketcategory <buttonId> [category]` | `tcat` | Administrator | Die Ticket-Kategorie setzen oder löschen |
| `ticketarchivecategory <buttonId> [category]` | `tarchivecat` | Administrator | Die Archivkategorie setzen oder löschen |
| `ticketautoarchive <buttonId> [true or false]` | `tautoarchive` | Administrator | Beim Schließen automatisch archivieren |
| `ticketclosebehavior <buttonId> [autoArchive] [deleteOnClose] [lockOnClose] [renameOnClose] [deleteDelayMinutes]` | `tclosebehavior` | Administrator | Mehrere Schließ-Verhaltensweisen auf einmal setzen |
| `ticketautoclose <buttonId> [hours]` | `tautoclose` | Administrator | Die Stunden für automatisches Schließen setzen oder löschen |
| `setautoclose <buttonId> <hours>` | `sautoclose` | Administrator | Wie oben |
| `ticketresponsetime <buttonId> [minutes]` | `tresponsetime` | Administrator | Die erforderliche Antwortzeit setzen oder löschen |
| `setresponsetime <buttonId> <minutes>` | `sresponsetime` | Administrator | Wie oben |
| `setmodaltitle <buttonId> <title>` | `smodaltitle` | Administrator | Titel des Ticket-Formulars |
| `addmodalfield <buttonId> <label> [options]` | `addmfield` | Administrator | Ein Formularfeld hinzufügen, Optionen wie `paragraph,optional,max:500` |
| `removemodalfield <buttonId> <fieldId>` | `removemfield` | Administrator | Ein Formularfeld entfernen |
| `listmodalfields <buttonId>` | `listmfields` | Administrator | Formularfelder auflisten |
| `addselectmenu <panelId>` | `addsmenu` | Administrator | Ein Auswahlmenü über eine geführte Abfrage hinzufügen |
| `addoption <menuId> <label> [description] [emoji]` | `addopt` | Administrator | Einem Menü eine Option hinzufügen |
| `listoptions <menuId>` | `listopts` | Administrator | Die Optionen eines Menüs auflisten |
| `removeoption <menuId> <value>` | `removeopt` | Administrator | Eine Option per Wert bestätigen (siehe Stolperfallen) |
| `deleteselectoption <optionId>` | `delselectoption` | Administrator | Eine Option entfernen; die letzte kann nicht entfernt werden |
| `setplaceholder <menuId> <text>` | `splaceholder` | Administrator | Den Platzhalter des Menüs ändern |
| `deleteselectmenu <menuId>` | `delselectmenu` | Administrator | Ein Menü samt seinen Optionen entfernen |
| `ticketclaim` | `tclaim` | Keine | Das aktuelle Ticket übernehmen (Support-Rolle oder Administrator) |
| `ticketunclaim` | `tunclaim` | Keine | Deine Übernahme aufgeben (Übernehmender oder Administrator) |
| `ticketclose [archive]` | `tclose` | Keine | Das aktuelle Ticket schließen; `true` archiviert zusätzlich |
| `ticketarchive` | `tarchive` | Kanäle verwalten | Das aktuelle Ticket archivieren |
| `ticketnote <text>` | `tnote` | Keine | Eine Team-Notiz hinzufügen |
| `ticketpriority <priorityId>` | `tpriority` | Keine | Die Priorität des aktuellen Tickets setzen |
| `ticketaddtags <tagId...>` | `taddtags` | Keine | Dem aktuellen Ticket Tags hinzufügen |
| `ticketremovetags <tagId...>` | `tremovetags` | Keine | Vom aktuellen Ticket Tags entfernen |
| `ticketaddpriority <id> <name> <emoji> <level> <pingStaff> <responseTime> <color>` | `taddpriority` | Administrator | Eine Priorität definieren, zum Beispiel `taddpriority urgent Urgent :fire: 5 true 00:15:00 red` |
| `ticketremovepriority <id>` | `tremovepriority` | Administrator | Eine Prioritätsdefinition löschen |
| `ticketaddtag <id> <name> <description> <color>` | `taddtag` | Administrator | Einen Tag definieren |
| `ticketremovetag <id>` | `tremovetag` | Administrator | Eine Tag-Definition löschen |
| `ticketcreatecase <title> <description>` | `tcreatecase` | Nachrichten verwalten | Einen Fall erstellen |
| `ticketlinkcase <caseId>` | `tlinkcase` | Nachrichten verwalten | Das aktuelle Ticket mit einem Fall verknüpfen |
| `ticketunlinkcase` | `tunlinkcase` | Nachrichten verwalten | Die Verknüpfung des aktuellen Tickets lösen |
| `ticketblock @user [reason]` | `tblock` | Administrator | Ein Mitglied auf die Blacklist setzen |
| `ticketunblock @user` | `tunblock` | Administrator | Von der Blacklist entfernen |
| `tickettranscriptchannel [#channel]` | `ttranscriptch` | Administrator | Den Transkript-Kanal setzen oder löschen |
| `ticketlogchannel [#channel]` | `tlogch` | Administrator | Den Log-Kanal setzen oder löschen |
| `ticketcloseinactive <hours>` | `tcloseinactive` | Administrator | Tickets schließen, die so lange untätig waren |
| `ticketmoveall <category> <category>` | `tmoveall` | Administrator | Alle Tickets zwischen Kategorien verschieben |
| `ticketstats` | `tstats` | Keine | Ticket-Statistiken des Servers |
| `ticketuserstats [@user]` | `tuserstats` | Keine | Ticket-Statistiken eines Mitglieds |

Slash-Befehle findest du unter `/tickets` (Panel erstellen, Panels auflisten, übernehmen, schließen, Notiz, archivieren, Priorität, Gruppen für Panel und Einstellungen, Gruppe für Fälle) und `/tickets setup` (wizard, quick-button, quick-menu, from-template, templates).

## Tipps und Stolperfallen

- Befehle, die auf „das aktuelle Ticket“ wirken, funktionieren nur in einem Ticket-Kanal. Führe sie im Ticket aus, nicht in einem Team-Kanal.
- Jeder Tickettyp braucht Support-Rollen, sonst kann niemand außer Administratoren übernehmen, und sobald der Kanal gesperrt ist, kann niemand außer dem Ersteller schreiben.
- Das Standardlimit ist ein offenes Ticket pro Mitglied und Typ. Erhöhe **Max. aktive Tickets** bei Typen, bei denen wiederholte Tickets normal sind.
- **Automatisch schließen (Stunden)** und **Erforderliche Antwortzeit** werden beim Typ gespeichert und in `buttoninfo` angezeigt, aber das Einzige im Bot, das untätige Tickets schließt, ist `ticketcloseinactive` oder die Sammelaktion **Inaktive Tickets schließen**. Führe diese selbst regelmäßig aus, wenn du eine automatische Bereinigung willst.
- `removeoption` meldet derzeit nur Erfolg; nutze `deleteselectoption` mit der Options-ID, um eine Option tatsächlich zu entfernen.
- **Beim Schließen löschen** und **Beim Schließen sperren** beeinflussen sich: Ein Ticket, das gelöscht werden soll, wird nicht zuerst gesperrt, sondern wartet nur die Löschverzögerung ab.
- Das Panel-Embed-JSON muss gültige Ausgabe des Embed-Builders sein. Nutze den Editor im Dashboard und kopiere das JSON, wenn du lieber Befehle verwendest.
- Das Löschen eines Panels mit offenen Tickets wird abgelehnt, außer du übergibst `true`; das löscht die Verknüpfung der Tickets mit dem Panel.
- Transkripte erfassen höchstens 5000 Nachrichten, und der Link „Transkript ansehen“ öffnet das Transkript im Dashboard.

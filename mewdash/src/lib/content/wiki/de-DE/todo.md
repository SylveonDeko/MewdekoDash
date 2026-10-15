---
title: Todo-Listen
slug: todo
summary: Gemeinsame und persönliche Aufgabenlisten direkt in Discord, mit Prioritäten, Fälligkeitsdaten, Tags, Suche und Berechtigungen pro Person.
icon: fa-check
category: Community
dashboard: /dashboard/todo
module: Todo
tags: [todo, tasks, task list, checklist, project, due date, priority, tags, permissions, Aufgaben, Aufgabenliste, Checkliste, Projekt, Fälligkeitsdatum, Priorität, Tags, Berechtigungen]
related: [administration, tickets]
---

## Was es macht

Todo-Listen geben deinem Server Aufgabenlisten, die direkt im Bot leben. Ein Mitglied erstellt eine Liste, fügt Einträge hinzu, markiert sie als erledigt und kann anderen Zugriff geben, damit diese dieselbe Liste ansehen oder daran arbeiten können. Teammitglieder mit der Berechtigung Server verwalten können serverweite Listen erstellen, die jedes Mitglied sehen kann.

Jeder Eintrag hat einen Titel, eine optionale Beschreibung, eine Priorität von 1 bis 4, optionale Tags, ein optionales Fälligkeitsdatum und eine optionale Erinnerungszeit. Einträge behalten ihre Position, damit du sie neu anordnen kannst. Erledigte Einträge werden mit der Person und dem Zeitpunkt der Erledigung markiert.

Es gibt zwei Arten von Listen. Eine persönliche Liste gehört einem Mitglied und ist für alle anderen unsichtbar, sofern der Besitzer keinen Zugriff gewährt. Eine Server-Liste gehört dem Server. Sie ist standardmäßig öffentlich, sodass jeder sie ansehen kann, aber nur Personen mit ausdrücklicher Berechtigung können Einträge hinzufügen oder ändern.

Listen erscheinen in Discord als Embeds und im Dashboard als Karten. Für die gerade geöffnete Liste zeigt das Dashboard außerdem den Fortschritt, die Anzahl überfälliger Einträge und die Erledigungsquote.

## Warum du es nutzen würdest

- Ein Moderationsteam verfolgt offene Aufgaben in einer Server-Liste, statt in einer angehefteten Nachricht, die veraltet.
- Eventorganisatoren teilen eine Checkliste und haken Punkte nach und nach ab.
- Mitglieder führen eine private Liste mit Dingen, die sie auf dem Server nachverfolgen wollen.
- Ein Projektkanal möchte Tags und Prioritäten, damit sich „kritisch“-Einträge von „niedrig“ abheben.

## Listen und Berechtigungen

Jede Liste hat einen Besitzer, nämlich die Person, die sie erstellt hat. Der Besitzer darf alles auf dieser Liste. Andere Personen erhalten Zugriff über Berechtigungen, die pro Nutzer mit `todogrant` vergeben werden.

| Berechtigung | Was sie erlaubt |
| --- | --- |
| `view` | Liste und Einträge ansehen |
| `add` | Neue Einträge hinzufügen |
| `edit` | Einträge anderer bearbeiten, mit Tags versehen, neu anordnen und Daten setzen |
| `complete` | Einträge anderer als erledigt markieren |
| `delete` | Einträge anderer löschen |
| `manage` | Listeneinstellungen ändern, die Liste löschen, Zugriff gewähren und entziehen |
| `all` | Alle oben genannten Berechtigungen |

Mehrere Berechtigungen gibst du als kommagetrennten Text an, zum Beispiel `todogrant 12 @user view,add,complete`. Erneutes Gewähren ersetzt die bisherigen Berechtigungen dieses Nutzers. `todorevoke` entfernt alle.

Zwei Regeln gelten unabhängig von den Berechtigungen: Wer einen Eintrag erstellt hat, kann ihn immer bearbeiten, erledigen und löschen, und der Listenbesitzer darf immer alles.

Wer eine Liste sehen kann:

| Listentyp | Öffentlich | Wer sie ansehen kann |
| --- | --- | --- |
| Persönlich | beliebig | Besitzer, plus alle mit der Berechtigung `view` |
| Server | ja (Standard) | Alle auf dem Server |
| Server | nein | Besitzer, plus alle mit der Berechtigung `view` |

`todotoggleprivacy` schaltet eine Liste zwischen öffentlich und privat um. Das können nur der Besitzer oder jemand mit `manage`.

## Einträge

| Feld | Standard | Hinweise |
| --- | --- | --- |
| Titel | erforderlich | Wird in der Liste fett angezeigt |
| Beschreibung | keine | Wird unter dem Titel kursiv angezeigt |
| Priorität | 1 (Niedrig) über Befehle, Mittel im Dashboard | 1 Niedrig, 2 Mittel, 3 Hoch, 4 Kritisch. Werte außerhalb von 1 bis 4 werden auf den nächsten gültigen Wert begrenzt |
| Fälligkeitsdatum | keins | Wird als relativer Discord-Zeitstempel neben dem Titel angezeigt |
| Erinnerungszeit | keine | Wird am Eintrag gespeichert und mit `todosetreminder` gesetzt |
| Tags | keine | Groß- und Kleinschreibung wird ignoriert; einen bereits vorhandenen Tag erneut hinzuzufügen hat keine Wirkung |
| Position | Listenende | Ändern mit `todoreorder` |

`todoshow` listet offene Einträge, sortiert nach Position, dann Priorität, dann Erstellungszeit. Übergibst du `true` als zweites Argument, werden zusätzlich bis zu fünf erledigte Einträge mit ihrem Erledigungszeitpunkt angezeigt. Datumsangaben für `todosetdue` und `todosetreminder` werden großzügig gelesen, daher funktionieren sowohl `2026-10-01 18:00` als auch `October 1 2026`.

`todosearch` gleicht die Suchanfrage mit Titeln, Beschreibungen und Tags offener Einträge ab und zeigt bis zu zehn Ergebnisse. `todofilter` engt eine Liste auf einen einzelnen Tag (`todofilter 12 tag bug`) oder eine Priorität (`todofilter 12 priority 4`) ein.

Jede Liste kann eine Hex-Farbe haben, die mit `todosetcolor 12 #ff8800` gesetzt wird und für den Rahmen des Embeds verwendet wird. Standard ist `#7289da`.

## Einstellungen

Es gibt keine serverweiten Einstellungen. Alles wird pro Liste oder pro Eintrag festgelegt.

Die Seite Todo-Listen hat eine Ansicht. Links siehst du jede Liste, die du sehen kannst, mit einem Feld **Todo-Listen suchen**, einem Schalter **Erledigte Einträge anzeigen** und **Sortieren nach** (Priorität, Fälligkeitsdatum, Erstellt, Titel) mit einer Auswahl für die Reihenfolge. Wählst du eine Liste aus, werden ihre Einträge mit den Schaltflächen **Eintrag hinzufügen** und **Liste löschen** angezeigt, dazu ein Eintragseditor mit **Priorität** und **Fälligkeitsdatum** sowie pro Liste eine Schaltfläche **Berechtigungen verwalten**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Listenname und Beschreibung | erforderlich, keine | Wird beim Erstellen einer Liste über die Schaltfläche **Liste erstellen** festgelegt |
| Priorität (Eintrag) | Mittel | Die Priorität des Eintrags; wird als farbiger Chip angezeigt |
| Fälligkeitsdatum (Eintrag) | keins | Frist für den Zähler überfälliger Einträge |
| Erledigte Einträge anzeigen | aus | Ob erledigte Einträge in der Listenansicht erscheinen |

> [!NOTE]
> Listen, die über das Dashboard erstellt werden, sind immer Server-Listen. Persönliche Listen erstellst du in Discord mit `todocreatelist`.

## Einrichtung

1. Öffne **Todo-Listen** im Dashboard und klicke auf **Liste erstellen**.
2. Gib einen Namen und optional eine Beschreibung ein. Die Liste wird als öffentliche Server-Liste angelegt.
3. Klicke auf die Liste und dann auf **Eintrag hinzufügen**. Fülle **Was ist zu tun?**, optional eine Beschreibung und eine Priorität aus.
4. Nutze **Berechtigungen verwalten** auf der Listenkarte, um zu sehen, wer Zugriff hat. Gewähre den Zugriff in Discord mit `todogrant <listId> @user add,complete`, damit diese Personen daran arbeiten können.
5. Führe in Discord `todolists` aus, um die Listen-ID zu erhalten, und danach `todoshow <listId>`, um zu prüfen, ob sie korrekt angezeigt wird.
6. Markiere Einträge mit `todocomplete <itemId>` als erledigt. Die Eintrags-ID wird in `todoshow` in Backticks angezeigt.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Listen- und Eintrags-IDs erhältst du über `todolists` und `todoshow`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `todocreatelist <name> [description]` | `tcl` | Niemand | Eine persönliche Liste erstellen |
| `todocreateserverlist <name> [description]` | `tcsl` | Server verwalten | Eine serverweite Liste erstellen |
| `todolists [includeServer]` | | Niemand | Die Listen anzeigen, die du sehen kannst; mit `false` nur persönliche Listen |
| `tododeletelist <listId>` | `tdl` | Niemand | Eine Liste samt allen Einträgen löschen (Besitzer oder `manage`) |
| `todoshow <listId> [includeCompleted]` | `ts` | Niemand | Die Einträge einer Liste anzeigen |
| `todoadd <listId> <title> [description]` | `ta` | Niemand | Einen Eintrag mit niedriger Priorität hinzufügen |
| `todoaddpriority <listId> <priority> <title> [description]` | `tap` | Niemand | Einen Eintrag mit Priorität 1 bis 4 hinzufügen |
| `todoedit <itemId> <title> [description]` | `te` | Niemand | Titel und Beschreibung eines Eintrags ändern |
| `todocomplete <itemId>` | `tc` | Niemand | Einen Eintrag als erledigt markieren |
| `tododelete <itemId>` | `td` | Niemand | Einen Eintrag löschen |
| `todoreorder <itemId> <position>` | `tr` | Niemand | Einen Eintrag an eine Position ab 1 verschieben |
| `todosetdue <itemId> <date>` | `tsd` | Niemand | Ein Fälligkeitsdatum setzen |
| `todocleardue <itemId>` | `tcd` | Niemand | Das Fälligkeitsdatum entfernen |
| `todosetreminder <itemId> <date>` | `tsr` | Niemand | Eine Erinnerungszeit setzen |
| `todoclearreminder <itemId>` | `tcr` | Niemand | Die Erinnerungszeit entfernen |
| `todoaddtag <itemId> <tag>` | `tat` | Niemand | Einen Tag hinzufügen |
| `todoremovetag <itemId> <tag>` | `trt` | Niemand | Einen Tag entfernen |
| `todosearch <listId> <query>` | `tsearch` | Niemand | Offene Einträge nach Titel, Beschreibung oder Tag durchsuchen |
| `todofilter <listId> <tag or priority> <value>` | `tf` | Niemand | Offene Einträge nach einem Tag oder einer Priorität filtern |
| `todosetcolor <listId> <#hex>` | `tsc` | Niemand | Die Embed-Farbe setzen |
| `todotoggleprivacy <listId>` | `ttp` | Niemand | Eine Liste zwischen öffentlich und privat umschalten |
| `todogrant <listId> @user <perms>` | `tg` | Niemand | Kommagetrennte Berechtigungen gewähren |
| `todorevoke <listId> @user` | `trv` | Niemand | Alle Berechtigungen eines Nutzers entfernen |
| `todopermissions <listId>` | `tp` | Niemand | Anzeigen, wer welche Berechtigungen hat |

„Niemand“ bedeutet, dass keine Discord-Berechtigung geprüft wird. Die Berechtigungen der Liste selbst entscheiden, ob der Befehl funktioniert. Dieselben Befehle gibt es als Slash-Befehle unter `/todo`.

## Tipps und Fallstricke

- Erinnerungszeiten werden am Eintrag gespeichert, aber der Bot sendet derzeit keine Erinnerung, wenn diese Zeit erreicht ist. Betrachte sie vorerst als Notiz.
- `todoshow` meldet eine Liste als nicht gefunden, wenn du keinen `view`-Zugriff hast, selbst wenn die ID stimmt.
- Ein Listenname muss pro Besitzer und Typ eindeutig sein. Zwei Mitglieder können jeweils eine persönliche Liste „Einkauf“ haben, ein Mitglied aber nicht zwei.
- `todoreorder` nummeriert alle Einträge der Liste neu, damit die Positionen lückenlos bleiben.
- Öffentliche Server-Listen kann jeder lesen, aber außer dem Besitzer kann niemand Einträge hinzufügen, bis du `add` gewährst.
- Für den vollen Berechtigungssatz nutzt du `todogrant` in Discord. Die Ansicht **Berechtigungen verwalten** im Dashboard dient dazu, zu prüfen, wer Zugriff hat.
- Das Löschen einer Liste entfernt ihre Berechtigungen und Einträge auf einen Schlag und kann nicht rückgängig gemacht werden.

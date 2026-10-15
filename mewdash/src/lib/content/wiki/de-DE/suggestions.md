---
title: Vorschläge
slug: suggestions
summary: Gib Mitgliedern einen Kanal oder Button zum Einreichen von Ideen, lass den Server darüber abstimmen und das Team jede einzelne annehmen, ablehnen, prüfen oder umsetzen, jeweils mit Begründung.
icon: fa-lightbulb
category: Community
dashboard: /dashboard/suggestions
module: Suggestions
tags: [suggestions, ideas, feedback, voting, accept, deny, consider, implement, threads, suggest button, placeholders, Vorschläge, Ideen, Feedback, Abstimmung, annehmen, ablehnen, prüfen, umsetzen, Vorschlags-Button, Platzhalter]
related: [administration, afk]
---

## Was es macht

Ein Mitglied führt `suggest` mit seiner Idee aus, tippt sie direkt in den Vorschlagskanal oder drückt einen **Suggest Here!**-Button und füllt ein Formular aus. Der Bot löscht die ursprüngliche Nachricht, postet im Vorschlagskanal ein nummeriertes Vorschlags-Embed und hängt Abstimmungs-Emotes als Reaktionen oder Buttons an. Jeder Vorschlag bekommt eine Nummer, auf die sich das Team später beziehen kann.

Das Team bringt den Vorschlag dann durch vier Zustände: annehmen, ablehnen, prüfen oder umsetzen, jeweils mit optionaler Begründung. Der Bot ändert die ursprüngliche Vorschlagsnachricht in ein farbiges Status-Embed, schickt dem Mitglied, das den Vorschlag gemacht hat, das Ergebnis per DM und kann das Status-Embed pro Zustand in einen eigenen Kanal erneut posten, sodass angenommene Ideen an einem Ort liegen und abgelehnte an einem anderen.

Optional trägt jeder Vorschlag einen **Join/Create Discussion**-Button, der darunter einen öffentlichen oder privaten Thread öffnet. Wenn das Team den Zustand ändert, kann der Thread automatisch archiviert werden.

## Wofür du es nutzen kannst

- Feedback-Kanäle, in denen Ideen zwischen Antworten untergehen; jeder Vorschlag wird zu einer eigenen Nachricht mit Stimmenzahl.
- Communities, die Mitgliedern zeigen wollen, was angenommen und was abgelehnt wurde und warum, ohne dass das Team Ankündigungen schreiben muss.
- Server, die pro Idee eine Diskussion wollen statt Streit im Hauptkanal, mithilfe von Threads.
- Teammitglieder, die im Dashboard mit einem Begründungsfeld sortieren wollen, statt sich Vorschlagsnummern zu merken.

## Wie ein Vorschlag eingereicht wird

Es gibt drei Wege, und alle durchlaufen dieselben Längenprüfungen und landen im Vorschlagskanal.

| Methode | Was passiert |
| --- | --- |
| `suggest <text>` | Die Befehlsnachricht wird gelöscht und der Vorschlag gepostet. Funktioniert aus jedem Kanal. |
| Tippen im Vorschlagskanal | Jede Nachricht eines Nicht-Bots, die nicht mit dem Präfix beginnt, wird zu einem Vorschlag und das Original wird gelöscht. Mitglieder mit der Team-Rolle des Servers werden übersprungen, damit das Team normal im Kanal schreiben kann. |
| Der Vorschlags-Button | Eine Nachricht mit einem Button im **Vorschlags-Button-Kanal**. Beim Drücken öffnet sich ein Formular, dessen Längenlimits zu deinen Einstellungen passen. |

Ist der Text länger als die **Maximale Länge** oder kürzer als die **Mindestlänge**, wird er abgelehnt. Beim Befehl erscheint der Fehler im Kanal und wird nach fünf Sekunden gelöscht; im Vorschlagskanal wird die Nachricht gelöscht und das Mitglied per DM benachrichtigt. Erwähnungen im Vorschlag werden im geposteten Embed entschärft, und dem Mitglied wird mitgeteilt, dass der Vorschlag gesendet wurde.

Das Standard-Vorschlags-Embed zeigt das Mitglied als Autor, den Titel „Suggestion #N" und den Text als Beschreibung. Du kannst es durch ein eigenes Embed ersetzen (siehe Platzhalter unten).

### Der Vorschlags-Button

Die Button-Nachricht wird im **Vorschlags-Button-Kanal** gepostet, und der Bot hält sie ganz unten: Wenn andere Nachrichten sie nach oben schieben, löscht der Bot sie und postet sie erneut. Die Standardbeschriftung ist **Suggest Here!** ohne Emote und in Blurple. Die Nachricht über dem Button kann einfacher Text oder Embed-Code sein und ist standardmäßig eine kurze Aufforderung, einen Vorschlag zu machen.

## Abstimmung

Standardmäßig bekommt jeder Vorschlag einen Daumen hoch und einen Daumen runter. Du kannst stattdessen mit `suggestmotes` oder der Auswahl **Eigene Emotes** bis zu fünf eigene Emotes festlegen; der Bot muss sie verwenden können.

Der **Emote-Anzeigemodus** legt fest, wie Stimmen abgegeben werden.

| Modus | Verhalten |
| --- | --- |
| Reaktionen (Standard) | Der Bot fügt die Emotes als Reaktionen hinzu. Die Zählung folgt dem Hinzufügen und Entfernen von Reaktionen. |
| Buttons | Die Emotes werden zu Buttons, die einen Live-Zähler zeigen. Ein Mitglied kann pro Vorschlag eine Stimme halten: Erneutes Drücken desselben Buttons fragt, ob sie entfernt werden soll, das Drücken eines anderen, ob gewechselt werden soll. |

Im Button-Modus hat jeder der fünf Emote-Buttons seine eigene Farbe (**Button für Emote 1** bis **Button für Emote 5**). Die Farben sind Blau, Grau, Grün und Rot. Eine Farbänderung aktualisiert auch die Nachricht mit dem Vorschlags-Button.

`suggestinfo <number>` zeigt den Text, wer ihn vorgeschlagen hat, den aktuellen Zustand, wer ihn zuletzt geändert hat, wie oft sich der Zustand geändert hat und die Zahl pro Emote, mit Buttons für Annehmen, Ablehnen, Prüfen und Umsetzen darunter.

## Zustände

Jeder Vorschlag beginnt als Suggested (im Dashboard als Ausstehend angezeigt). Teammitglieder mit „Nachrichten verwalten" können ihn mit `accept`, `deny`, `consider` oder `implemented`, über die Buttons bei `suggestinfo` oder im Dashboard in einen von vier Zuständen bringen. Bei jedem Zustandswechsel mit Begründung wird diese angezeigt; ohne Begründung steht im Feld „none".

| Zustand | Embed-Farbe | Zusätzliche Optionen |
| --- | --- | --- |
| Angenommen | Blau | Annahme-Kanal, Annahme-Nachricht, bei Annahme archivieren |
| Abgelehnt | Rot | Ablehnungs-Kanal, Ablehnungs-Nachricht, bei Ablehnung archivieren |
| In Prüfung | Gold | Prüfungs-Kanal, Prüfungs-Nachricht, bei Prüfung archivieren |
| Umgesetzt | Grün | Umsetzungs-Kanal, Umsetzungs-Nachricht, bei Umsetzung archivieren |

Wenn sich ein Zustand ändert, tut der Bot Folgendes, in dieser Reihenfolge:

1. Archiviert den Diskussions-Thread, wenn der Archiv-Schalter für diesen Zustand an ist.
2. Ändert die ursprüngliche Nachricht im Vorschlagskanal in das Status-Embed und entfernt alle Reaktionen. Ist die ursprüngliche Nachricht verschwunden, wird eine neue gepostet.
3. Schickt dem Vorschlagenden per DM ein Embed mit dem Vorschlag, der Begründung und wer ihn geändert hat. Die Bestätigung für das Team sagt, ob die DM angekommen ist oder das Mitglied DMs deaktiviert hatte.
4. Speichert den neuen Zustand und wer ihn geändert hat.
5. Ist für diesen Zustand ein Kanal festgelegt, postet er das Status-Embed dort und löscht die vorherige Statusnachricht zu diesem Vorschlag, sodass ein Vorschlag, der von In Prüfung zu Angenommen wechselt, keine veraltete Kopie hinterlässt.

Ein Vorschlag kann beliebig oft zwischen Zuständen wechseln. Es gibt keinen Befehl, ihn zurück auf Ausstehend zu setzen.

### Die Statusnachricht

Das Standard-Status-Embed hat den Vorschlagenden als Autor, einen Titel wie „Suggestion #12 Accepted", den Vorschlagstext als Beschreibung und ein Feld **Grund**. Lege eigene mit `acceptmessage`, `denymessage`, `considermessage` oder `implementmessage` fest, oder mit den vier Editoren im Dashboard-Tab **Nachrichten**. Mit `-` gehst du zurück zum Standard. Eigener Text läuft durch den Embed-Parser; ist er kein gültiger Embed-Code, wird er als Embed-Beschreibung verwendet.

## Platzhalter

Die Vorschlagsnachricht (beim Einreichen gepostet) unterstützt diese sowie die allgemeinen Server-Platzhalter von der Platzhalter-Seite.

| Platzhalter | Wert |
| --- | --- |
| `%suggest.user%` | Vollständiger Benutzername des Vorschlagenden |
| `%suggest.user.name%` | Der Benutzername des Vorschlagenden |
| `%suggest.user.avatar%` | Die Avatar-URL des Vorschlagenden |
| `%suggest.message%` | Der Vorschlagstext, Erwähnungen entschärft |
| `%suggest.number%` | Die Vorschlagsnummer |

Die Nachrichten für Annahme, Ablehnung, Prüfung und Umsetzung unterstützen alle oben genannten, die allgemeinen Server-Platzhalter und diese zusätzlichen.

| Platzhalter | Wert |
| --- | --- |
| `%suggest.user.id%` | Die Nutzer-ID des Vorschlagenden |
| `%suggest.mod.user%` | Vollständiger Benutzername des Teammitglieds, das den Zustand geändert hat |
| `%suggest.mod.name%` | Benutzername dieses Teammitglieds |
| `%suggest.mod.avatar%` | Seine Avatar-URL |
| `%suggest.mod.Id%` | Seine Nutzer-ID (beachte das große I) |
| `%suggest.mod.message%` | Die angegebene Begründung oder „none" |
| `%suggest.emote1count%` bis `%suggest.emote5count%` | Stimmenzahl pro Emote zum Zeitpunkt der Änderung |

> [!EXAMPLE]
> Eine einfache Ablehnungsnachricht: `Suggestion #%suggest.number% by %suggest.user% was denied by %suggest.mod.name%: %suggest.mod.message%`

## Threads

Der **Thread-Typ** fügt jedem neuen Vorschlag eine zweite Button-Reihe hinzu.

| Typ | Button | Ergebnis |
| --- | --- | --- |
| Keine Threads (Standard) | keiner | Kein Diskussions-Button |
| Normale Threads | Join/Create Public Discussion | Erstellt einen öffentlichen Thread namens „Suggestion #N Discussion" an der Vorschlagsnachricht |
| Private Threads | Join/Create Private Discussion | Dasselbe, als privater Thread |

Der erste Druck erstellt den Thread und fügt sowohl den Vorschlagenden als auch die drückende Person hinzu. Spätere Drücke antworten, dass bereits ein Thread existiert, und verlinken ihn. Pro Vorschlag wird ein Thread verfolgt, und die vier **Bei … archivieren**-Schalter archivieren ihn, wenn der passende Zustand gesetzt wird. Das Ändern des Thread-Typs wirkt sich nur auf danach geposteten Vorschläge aus.

## Einstellungen

Die Dashboard-Seite hat zwei Tabs, **Vorschläge** und **Einstellungen**. Der Tab Einstellungen ist unterteilt in **Allgemein**, **Nachrichten**, **Kanäle**, **Archivieren** und **Emotes**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Mindestlänge | nicht gesetzt | Kürzester akzeptierter Vorschlag, in Zeichen (darf nicht 2048 oder mehr sein; das Dashboard-Feld endet bei 2000) |
| Maximale Länge | nicht gesetzt | Längster akzeptierter Vorschlag (muss über 0 liegen; das Dashboard-Feld endet bei 2000) |
| Thread-Typ | Keine Threads | Ob Vorschläge einen öffentlichen oder privaten Diskussions-Button bekommen |
| Vorschlags-Nachricht | Standard-Embed | Das Embed, das beim Einreichen eines Vorschlags gepostet wird |
| Annahme-/Ablehnungs-/Prüfungs-/Umsetzungs-Nachricht | Standard-Embed | Das Status-Embed für jeden Zustand |
| Vorschlagskanal | keiner (Funktion aus) | Wo Vorschläge gepostet werden und wo getippte Nachrichten zu Vorschlägen werden |
| Kanal für Angenommene / Abgelehnte / Geprüfte / Umgesetzte | keiner | Zusätzlicher Kanal, in den das jeweilige Status-Embed kopiert wird |
| Bei Annahme / Ablehnung / Prüfung / Umsetzung archivieren | aus | Den Diskussions-Thread bei diesem Zustand archivieren |
| Emote-Anzeigemodus | Reaktionen | Reaktionen oder Buttons zum Abstimmen |
| Eigene Emotes | Daumen hoch und runter | Bis zu fünf Emotes für die Abstimmung |
| Button-Beschriftung | Suggest Here! | Text auf dem Vorschlags-Button |
| Button-Emote | keines | Emote auf dem Vorschlags-Button |
| Button-Nachricht | Standard-Aufforderung | Text oder Embed, der über dem Vorschlags-Button gepostet wird |
| Farbe des Vorschlags-Buttons | Blurple | Farbe des Vorschlags-Buttons |
| Button für Emote 1 bis 5 | Blurple | Farbe jedes Abstimmungs-Buttons im Button-Modus |

> [!WARNING]
> Nichts funktioniert, bevor der **Vorschlagskanal** festgelegt ist. Bis dahin antwortet `suggest`, dass kein Kanal festgelegt ist, und löscht den Fehler nach drei Sekunden.

Der Tab **Vorschläge** listet jeden Vorschlag mit Status, Stimmenzahlen und Datum auf, sortierbar nach Datum oder Status. Jede Karte hat Buttons für **Annehmen**, **Ablehnen**, **Prüfen** und **Umsetzen** mit einem optionalen Begründungsfeld sowie einen Button **Löschen**, der den Eintrag aus der Datenbank entfernt, ohne die Discord-Nachricht anzufassen.

## Einrichtung Schritt für Schritt

1. Öffne **Vorschläge** im Dashboard und wechsle zum Tab **Einstellungen**.
2. Wähle unter **Kanäle** einen **Vorschlagskanal**. Optional wählst du getrennte Kanäle für angenommene, abgelehnte, geprüfte und umgesetzte Vorschläge.
3. Lege unter **Allgemein** die **Mindestlänge** und **Maximale Länge** fest, zum Beispiel 10 und 1000, und wähle einen **Thread-Typ**, wenn du eine Diskussion pro Idee möchtest.
4. Wähle unter **Emotes** **Reaktionen** oder **Buttons** und optional bis zu fünf **Eigene Emotes**. Wenn du einen Vorschlags-Button willst, lege hier Beschriftung, Emote und Nachricht fest und führe `suggestbuttonchannel #channel` in Discord aus, um ihn zu posten.
5. Schalte unter **Archivieren** die Archiv-Schalter für die Zustände ein, die die Diskussion beenden sollen.
6. Passe unter **Nachrichten** bei Bedarf die Status-Embeds an, mit den oben genannten Platzhaltern.
7. Speichere und teste dann: Führe `suggest test idea` aus, stimme darüber ab und führe `accept 1 looks good` aus, um das Status-Embed und die DM zu sehen.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `suggest <text>` | `suggestion` | Niemand | Einen Vorschlag einreichen |
| `suggestinfo <number>` | `suginfo` | Nachrichten verwalten | Details, Stimmenzahlen und Zustands-Buttons eines Vorschlags anzeigen |
| `accept <number> [reason]` | `suggestaccept`, `acceptsuggest` | Nachrichten verwalten | Einen Vorschlag als angenommen markieren |
| `deny <number> [reason]` | `suggestdeny`, `denysuggest` | Nachrichten verwalten | Einen Vorschlag als abgelehnt markieren |
| `consider <number> [reason]` | `suggestconsider`, `considersuggest` | Nachrichten verwalten | Einen Vorschlag als in Prüfung markieren |
| `implemented <number> [reason]` | `suggestimplement`, `implementsuggest` | Nachrichten verwalten | Einen Vorschlag als umgesetzt markieren |
| `setsuggestchannel [#channel]` | `suggestchannel`, `suggestchan` | Kanäle verwalten | Den Vorschlagskanal festlegen oder Vorschläge ohne Kanal deaktivieren |
| `suggestclear` | `suggestreset`, `resetsuggestions`, `clearsuggestions` | Administrator | Nach Bestätigung alle Vorschläge löschen und den Zähler zurücksetzen |
| `suggestmessage <text>` | `suggestmsg` | Administrator | Eigenes Vorschlags-Embed, `-` zum Zurücksetzen |
| `acceptmessage <text>` | `acceptmsg` | Administrator | Eigenes Annahme-Embed, `-` zum Zurücksetzen |
| `denymessage <text>` | `denymsg` | Administrator | Eigenes Ablehnungs-Embed, `-` zum Zurücksetzen |
| `considermessage <text>` | `considermsg` | Administrator | Eigenes Prüfungs-Embed, `-` zum Zurücksetzen |
| `implementmessage <text>` | `implementmsg` | Administrator | Eigenes Umsetzungs-Embed, `-` zum Zurücksetzen |
| `acceptchannel [#channel]` | | Administrator | Kanal für angenommene Vorschläge, none zum Deaktivieren |
| `denychannel [#channel]` | | Administrator | Kanal für abgelehnte Vorschläge, none zum Deaktivieren |
| `considerchannel [#channel]` | | Administrator | Kanal für geprüfte Vorschläge, none zum Deaktivieren |
| `implementchannel [#channel]` | | Administrator | Kanal für umgesetzte Vorschläge, none zum Deaktivieren |
| `minsuggestionlength <number>` | `minsuggestlength` | Administrator | Mindestanzahl Zeichen, muss unter 2048 liegen |
| `maxsuggestionlength <number>` | `maxsuggestlength` | Administrator | Höchstanzahl Zeichen, muss über 0 liegen |
| `suggestmotes <emotes>` | `smotes`, `suggestemotes` | Administrator | Bis zu fünf Abstimmungs-Emotes, oder `disable` für Daumen hoch und runter |
| `suggestmotesmode <reactions/buttons>` | | Administrator | Reaktionen oder Buttons zum Abstimmen |
| `suggestmotecolor <number> <colour>` | | Administrator | Farbe des Abstimmungs-Buttons 1 bis 5: `blurple`, `grey`, `green` oder `red` |
| `suggestthreadstype <none/public/private>` | `suggestthreads` | Administrator | Typ des Diskussions-Threads für neue Vorschläge |
| `archiveonaccept` | | Administrator | Thread-Archivierung bei Annahme umschalten |
| `archiveondeny` | | Administrator | Thread-Archivierung bei Ablehnung umschalten |
| `archiveonconsider` | | Administrator | Thread-Archivierung bei Prüfung umschalten |
| `archiveonimplement` | | Administrator | Thread-Archivierung bei Umsetzung umschalten |
| `suggestbuttonchannel <#channel>` | | Administrator | Den Vorschlags-Button in einem Kanal posten |
| `suggestbuttonmessage <text>` | | Administrator | Text oder Embed über dem Vorschlags-Button, `-` zum Zurücksetzen |
| `suggestbuttonlabel <text>` | | Administrator | Button-Beschriftung bis zu 80 Zeichen, `-` zum Zurücksetzen |
| `suggestbuttonemote [emote]` | | Administrator | Button-Emote, none zum Zurücksetzen |
| `suggestbuttoncolor <colour>` | | Administrator | Farbe des Vorschlags-Buttons: `blurple`, `grey`, `green` oder `red` |

Die Slash-Entsprechungen findest du unter `/suggestions` und `/suggestions customize`.

## Tipps und Stolperfallen

- Der Bot braucht „Nachrichten verwalten" im Vorschlagskanal, um Originale zu löschen, „Reaktionen hinzufügen" für den Reaktionsmodus und „Öffentliche oder private Threads erstellen" für Diskussionen. Status-Kanäle brauchen „Links einbetten", sonst wird die Kopie stillschweigend übersprungen.
- Lege beide Längenlimits fest, bevor du den Kanal öffnest. Der Weg über getippte Nachrichten löscht alles außerhalb der Limits, ein nicht gesetztes Maximum kann also jede Nachricht auffressen.
- Mitglieder mit der in der Administration festgelegten Team-Rolle können im Vorschlagskanal schreiben, ohne dass ihre Nachrichten zu Vorschlägen werden. Die Nachrichten aller anderen werden umgewandelt und gelöscht.
- Der Befehl `suggest` beachtet das Berechtigungssystem, du kannst ihn also mit den üblichen Berechtigungsbefehlen in Kanälen oder für Rollen blockieren, und der Weg über getippte Nachrichten beachtet dieselbe Regel.
- Eigene Emotes müssen solche sein, die der Bot verwenden kann. Der Befehl testet jedes Emote, indem er damit reagiert, und lehnt das Set ab, wenn eines fehlschlägt.
- **Löschen** im Dashboard entfernt nur den Datenbankeintrag. Die Discord-Nachricht und jeder Thread bleiben bestehen.
- `suggestclear` kann nicht rückgängig gemacht werden und setzt die Nummerierung auf 1 zurück.

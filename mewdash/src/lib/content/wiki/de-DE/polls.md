---
title: Umfragen
slug: polls
summary: Poste button-basierte Umfragen in einen Kanal, begrenze, wer abstimmen darf, plane sie im Voraus, verwende Vorlagen wieder und prüfe die Ergebnisse.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/polls
module: Games
tags: [poll, vote, survey, question, yes no, multiple choice, anonymous, scheduled poll, poll template, Umfrage, Abstimmung, Befragung, Frage, Ja Nein, Mehrfachauswahl, anonym, geplante Umfrage, Umfragevorlage]
related: [votes, games]
---

## Was es macht

Das Team stellt eine Frage mit zwei bis fünfundzwanzig Optionen. Der Bot sendet ein Embed mit einem Button pro Option oder ein Auswahlmenü, wenn es mehr als fünf sind, und Mitglieder stimmen durch Klicken ab. Das Embed zeigt die aktuelle Anzahl und den Prozentsatz jeder Option. Unter den Optionen stehen drei Verwaltungs-Buttons: **Statistiken**, **Schließen** und **Löschen**.

Mitglieder können ihre Stimme ändern, indem sie eine andere Option anklicken, oder sie zurücknehmen, indem sie dieselbe Option erneut anklicken, sofern Stimmänderungen für diese Umfrage nicht ausgeschaltet wurden. Jede Antwort des Bots auf einen Klick ist nur für die abstimmende Person sichtbar, damit der Kanal sauber bleibt.

Umfragen lassen sich von Hand schließen, nach einer festgelegten Dauer automatisch beenden und für später planen. Vorlagen speichern Frage und Optionen, sodass dieselbe Umfrage mit einem Befehl erneut gepostet werden kann. Das Dashboard bietet Auswertungen, CSV- und JSON-Export und einen Vergleich mehrerer Umfragen nebeneinander.

## Wofür du es brauchst

- Ein Datum oder ein Spiel für das nächste Community-Event auswählen.
- Vor einer Regeländerung kurz mit Ja oder Nein nachfragen.
- Eine heikle Frage anonym stellen, damit niemand sehen kann, wer wofür gestimmt hat.
- Nur eine Team-Rolle oder eine Booster-Rolle über Entscheidungen abstimmen lassen, die sie betreffen.
- Jeden Montag dieselbe wöchentliche Umfrage aus einer Vorlage posten oder sie im Voraus planen.

## Umfragetypen

| Typ | So funktioniert die Abstimmung |
| --- | --- |
| Ja / Nein | Zwei feste Optionen, Ja und Nein. Erstellt mit `poll` und `/poll yesno`. |
| Einzelauswahl | Eine Option pro Mitglied. Der Standard für `pollc`, Vorlagen und das Dashboard. |
| Mehrfachauswahl | Mitglieder dürfen mehrere Optionen wählen. Bei sechs oder mehr Optionen erlaubt das Auswahlmenü Mehrfachauswahl. |
| Anonym | Stimmen werden gespeichert, ohne den Abstimmenden in Statistiken oder Exporten zu zeigen. |
| Rollenbeschränkt | Nur Mitglieder mit einer der erlaubten Rollen können abstimmen. Alle anderen erhalten eine private Meldung „nicht erlaubt“. Nur im Dashboard. |

Jede Umfrage hat außerdem diese Schalter pro Umfrage, alle standardmäßig an: **Stimmänderungen erlauben**, **Live-Ergebnisse anzeigen** und **Fortschrittsbalken anzeigen**.

## Abstimmen, Schließen und Ablauf

- Eine Stimme für eine geschlossene oder abgelaufene Umfrage wird mit einer privaten Meldung abgelehnt.
- Sind Stimmänderungen aus, wird ein zweiter Klick als „bereits abgestimmt“ abgelehnt.
- Die Buttons **Schließen** und **Löschen** funktionieren für den Ersteller der Umfrage und für alle mit Nachrichten verwalten. **Löschen** verlangt, dass du `DELETE` in ein Bestätigungsformular tippst, und entfernt dann die Umfrage und ihre Nachricht.
- **Statistiken** zeigt Gesamtstimmen, eindeutige Abstimmende und die Aufschlüsselung pro Option, nur für die Person, die geklickt hat.
- Der Ablauf wird alle fünf Minuten geprüft. Läuft eine Umfrage ab, werden ihre Buttons entfernt und die Fußzeile zeigt, dass sie abgelaufen ist.
- Geplante Umfragen werden jede Minute geprüft. Eine geplante Umfrage muss in der Zukunft liegen und höchstens dreißig Tage entfernt sein. Sie kann eine Dauer in Minuten haben, nach der die gepostete Umfrage abläuft.

## Vorlagen

Eine Vorlage speichert einen Namen, eine Frage und ihre Optionen. `polltemplate <name>` postet sie als Einzelauswahl-Umfrage. Vorlagen listet `polltemplates` auf, du erstellst und löschst sie mit `/poll create-template` und `/poll delete-template` oder verwaltest sie im Dashboard auf dem Reiter **Vorlagen**, der sie auch als Datei exportieren und importieren kann. Eine Vorlage hat höchstens fünfundzwanzig Optionen.

## Einstellungen

Die Seite Umfragen hat fünf Reiter: **Umfragen**, **Erstellen**, **Geplant**, **Vorlagen** und **Analysen**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Frage | keine | Der Titel der Umfrage |
| Umfragetyp | Einzelauswahl | Einer der fünf Typen oben |
| Kanal | keiner | Wo die Umfrage gepostet wird |
| Optionen | zwei leere | Zwei bis fünfundzwanzig Optionen mit je bis zu 100 Zeichen. Bei Ja / Nein ausgeblendet |
| Rollen, die abstimmen dürfen | keine | Wird bei rollenbeschränkten Umfragen angezeigt |
| Dauer (Minuten) | offen bis zum Schließen | 1 bis 20160 Minuten. Wird beim Planen angewendet |
| Für später planen | keine | Datum und Uhrzeit. Leer lassen, um sofort zu posten |
| Stimmänderungen erlauben | an | Ob Mitglieder ihre Stimme wechseln oder zurücknehmen können |
| Live-Ergebnisse anzeigen | an | Ob Zahlen während der Umfrage sichtbar sind |
| Fortschrittsbalken anzeigen | an | Ob Balken neben den Zahlen gezeichnet werden |
| Auch als Vorlage speichern | aus | Speichert Frage und Optionen unter **Vorlagenname** |

Der Reiter **Umfragen** listet Umfragen mit einem Kontrollkästchen **Inaktive einbeziehen**. Beim Aufklappen einer Umfrage erscheinen eindeutige Abstimmende, Teilnahme, Stoßzeit und Erstellungszeit, außerdem der Button **Umfrage schließen**. Unter **Geplant** kannst du eine ausstehende Umfrage **abbrechen**. **Analysen** zeigt Umfragen in diesem Monat, abgegebene Stimmen, durchschnittliche Stimmen pro Umfrage, den beliebtesten Typ und ein Diagramm mit Umfragen pro Tag.

## Einrichtung Schritt für Schritt

1. Öffne **Umfragen** im Dashboard und wechsle zum Reiter **Erstellen**.
2. Gib die **Frage** ein, wähle einen **Umfragetyp** und den **Kanal**.
3. Fülle die **Optionen** aus. Mit dem Entfernen-Button löschst du überzählige; mindestens zwei sind nötig.
4. Bei einer rollenbeschränkten Umfrage wähle die **Rollen, die abstimmen dürfen**.
5. Setze optional den Haken bei **Auch als Vorlage speichern** und gib einen Namen an.
6. Klicke auf den Absende-Button. Die Umfrage wird sofort gepostet oder auf dem Reiter **Geplant** eingereiht, wenn du eine Zeit gesetzt hast.
7. Verfolge die Ergebnisse auf dem Reiter **Umfragen** und klicke danach auf **Umfrage schließen**.

> [!TIP]
> Für eine schnelle Abstimmung im Kanal brauchst du das Dashboard nicht. `poll Should we add a movie night?` postet in Sekunden eine Ja / Nein-Umfrage.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `poll <question>` | `ppoll` | Nachrichten verwalten | Eine Ja / Nein-Umfrage posten |
| `pollc <question;option1;option2;...>` | | Nachrichten verwalten | Eine Einzelauswahl-Umfrage mit zwei bis fünfundzwanzig Optionen posten |
| `pollm <question;option1;option2;...>` | | Nachrichten verwalten | Eine Mehrfachauswahl-Umfrage posten |
| `polla <question;option1;option2;...>` | | Nachrichten verwalten | Eine anonyme Umfrage posten |
| `polltemplate <name>` | `ptemplate` | Nachrichten verwalten | Eine Umfrage aus einer gespeicherten Vorlage posten |
| `polltemplates` | `ptemplates` | Niemand | Die Vorlagen des Servers auflisten |

Slash-Befehle unter `/poll` ergänzen `create` (bis zu zehn Optionen mit Schaltern für anonym und Mehrfachauswahl), `close`, `stats`, `list`, `create-template` und `delete-template`. `close`, `create-template` und `delete-template` brauchen Nachrichten verwalten.

## Tipps und Stolperfallen

- Der Bot braucht im Umfragekanal Send Messages und Embed Links. Die Textbefehle löschen außerdem deine Befehlsnachricht, wofür der Bot Nachrichten verwalten braucht.
- Optionen werden an Semikolons getrennt, eine Option kann also kein Semikolon enthalten.
- Button-Beschriftungen zeigen den Optionstext nur, wenn er zwölf Zeichen oder weniger hat; längere Optionen zeigen nur ihre Nummer, den vollen Text gibt es im Embed.
- Die Dauer wird vom Planer angewendet. Eine sofort gepostete Umfrage bleibt offen, bis jemand sie schließt. Plane sie daher eine Minute voraus, wenn du ein automatisches Ende brauchst.
- Eine geschlossene Umfrage lässt sich im Dashboard mit angehaktem **Inaktive einbeziehen** weiterhin ansehen und exportieren; eine gelöschte Umfrage ist weg.
- Rollenbeschränkte Umfragen prüfen die Rollen zum Zeitpunkt der Stimmabgabe. Wer die Rolle verliert, kann nicht mehr abstimmen, seine frühere Stimme bleibt aber erhalten.

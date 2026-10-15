---
title: Formulare
slug: forms
summary: Erstelle Bewerbungen, Umfragen, Banneinsprüche und Beitrittsbewerbungen im Dashboard, sammle Antworten über einen teilbaren Link und nimm sie in Discord oder in der Antwortwarteschlange an oder lehne sie ab.
icon: fa-clipboard
category: Community
dashboard: /dashboard/forms
module: Forms
tags: [forms, application, survey, questionnaire, ban appeal, join application, review, approve, reject, responses, csv, Formulare, Bewerbung, Umfrage, Fragebogen, Banneinspruch, Beitrittsbewerbung, Prüfung, annehmen, ablehnen, Antworten]
related: [administration, moderation, rolestates]
---

## Was es macht

Das Team baut im Dashboard ein Formular: einen Namen, eine Reihe von Fragen und Regeln dazu, wer antworten darf und was danach passiert. Beim Veröffentlichen entsteht ein dauerhafter Teilen-Link. Ein Mitglied öffnet den Link, meldet sich mit Discord an, füllt die Fragen Seite für Seite aus, prüft seine Antworten und sendet sie ab. Der Fortschritt wird beim Tippen als Entwurf gespeichert, sodass man später weitermachen kann.

Jede Einsendung wird als Embed in einem Kanal deiner Wahl gepostet, mit Buttons **Annehmen** und **Ablehnen**, wenn das Formular eine Entscheidung braucht. Prüfende drücken einen Button in Discord oder nutzen den Tab **Antworten** im Dashboard. Die einsendende Person bekommt per DM die Entscheidung samt Notizen und kann sie jederzeit auf einer Statusseite verfolgen.

Formulare gibt es in drei Typen. Ein normales Formular ist für Mitglieder. Ein Banneinspruch-Formular ist für Personen, die aktuell gebannt sind, und seine Annahme hebt den Bann auf. Eine Beitrittsbewerbung ist für Personen außerhalb des Servers, und ihre Annahme sendet ihnen eine einmalig nutzbare Einladung, bei der Rollen auf sie warten, wenn sie beitreten.

Es gibt keine Befehle für Formulare. Alles außer den beiden Prüf-Buttons geschieht im Dashboard.

## Wofür du es nutzen kannst

- Team-, Partner- oder Event-Bewerbungen mit einer richtigen Prüfwarteschlange statt eines DM-Haufens.
- Ein Banneinspruch-Verfahren mit Wartezeiten, Versuchslimits und automatischer Entbannung bei Annahme.
- Eine abgeschottete Community, in der Bewerber geprüft werden, bevor sie eine Einladung erhalten.
- Feedback-Umfragen mit Antwortlimit und CSV-Export.

## Formulartypen

| Typ | Wer einsenden kann | Bei Annahme |
| --- | --- | --- |
| Normales Formular | Mitglieder, oder alle, wenn **Personen außerhalb des Servers zulassen** an ist | Nur Rollenänderungen, falls konfiguriert |
| Banneinspruch | Personen, die aktuell vom Server gebannt sind | Der Bann wird aufgehoben |
| Beitrittsbewerbung | Personen, die nicht auf dem Server sind | Eine Einladung wird erstellt, und alle **Rollen beim Beitritt** werden als Rollenzustand gespeichert, sodass sie angewendet werden, wenn die Person beitritt |

Der Typ steht fest, sobald das Formular erstellt ist. Banneinsprüche und Beitrittsbewerbungen durchlaufen immer eine Prüfung; normale Formulare nur, wenn **Antworten müssen genehmigt werden** an ist.

## Fragen

Fragen werden im Builder unter **Fragen** hinzugefügt. Die Typen sind:

| Typ | Antwort | Optionen |
| --- | --- | --- |
| Kurzer Text | Eine Zeile | Minimal- und Maximallänge, bis zu 5000 |
| Langer Text | Mehrere Zeilen | Dieselben Längenlimits |
| Multiple Choice | Eine der aufgelisteten Optionen | Bis zu 25 Optionen |
| Kontrollkästchen | Mehrere Optionen | Bis zu 25 Optionen; **Minimalwert** und **Maximalwert** begrenzen, wie viele angehakt werden dürfen |
| Dropdown | Eine Option aus einer Liste | Bis zu 25 Optionen |
| Zahl | Eine Zahl | Minimal- und Maximalwert |
| E-Mail | Eine gültige E-Mail-Adresse | |
| URL | Eine `http`- oder `https`-Adresse | |
| Abschnittswechsel | Nichts; er beginnt eine neue Seite und kann einen Titel und eine Einleitung tragen | |

Der Fragetext ist auf 500 Zeichen begrenzt, Platzhalter auf 200 und jede Antwort auf 4000 Zeichen. Jede Frage kann eine Bild-URL haben und als Pflicht markiert werden. Eine Frage kann auch nur dann Pflicht sein, wenn eine frühere Antwort einer Bedingung entspricht.

### Antwort-Piping

Schalte das Antwort-Piping für eine Frage ein und schreibe `{{Q12}}` in ihren Text oder Platzhalter, wobei 12 die ID einer früheren Frage ist. Die frühere Antwort wird eingefügt, auf 100 Zeichen gekürzt. Wurde sie nicht beantwortet, erscheint stattdessen der Fragetext in Klammern. Eine Frage kann nur aus Fragen über ihr pipen.

### Bedingungen

Jede Frage kann nur angezeigt werden, wenn eine Bedingung zutrifft. Ausgeblendete Fragen werden auf der Seite übersprungen, und alle dafür gesendeten Antworten werden auf dem Server verworfen.

| Bedingungstyp | Angezeigt, wenn |
| --- | --- |
| Antwortbasiert | Eine frühere Antwort passt: **Ist gleich**, **Ist nicht gleich**, **Enthält**, **Größer als** oder **Kleiner als** |
| Rollenbasiert | Das Mitglied hat **Eine von**, **Alle von** oder **Keine von** den gewählten Rollen |
| Serverzugehörigkeit | Das Mitglied ist seit mindestens N Tagen auf dem Server, oder sein Konto ist mindestens N Tage alt |
| Boost/Nitro | Das Mitglied boostet. Die Nitro-Prüfung ist eine Schätzung anhand von Avatar- und Boost-Daten. |
| Berechtigungsbasiert | Das Mitglied hat alle gewählten Berechtigungen |
| Mehrere Bedingungen | Mehrere kombinierte Zeilen. Zeilen in derselben Gruppe müssen alle wahr sein (UND); ist irgendeine Gruppe wahr, wird die Frage angezeigt (ODER). |

Textvergleiche ignorieren Groß- und Kleinschreibung. Größer als und Kleiner als vergleichen Zahlen.

## Wer einsenden kann

Das Formular weist Personen mit einem Grund ab, in dieser Reihenfolge: Es ist noch ein Entwurf, es nimmt keine Antworten an, **Öffnet am** wurde noch nicht erreicht, **Schließt am** ist überschritten, das Konto ist jünger als das **Mindestalter des Discord-Kontos**, das Limit **Insgesamt akzeptierte Antworten** ist voll, die Person hat bereits geantwortet und mehrfaches Antworten ist aus, ihr fehlt die **Zum Absenden erforderliche Rolle**, und schließlich die oben genannte Typregel.

**Abgelehnte Personen erneut versuchen lassen** bedeutet, dass eine abgelehnte Antwort nicht mehr als „bereits beantwortet" zählt. Ist **Captcha verlangen** an, erscheint beim Prüfschritt eine Cloudflare-Turnstile-Prüfung.

Banneinsprüche bringen unter **Einspruchslimits** eigene Limits mit: eine Wartezeit nach dem Bann (gemessen ab dem Audit-Log-Eintrag des Banns), eine Höchstzahl an Einsprüchen, eine Wartezeit zwischen Einsprüchen und **Eine Ablehnung ist endgültig**. Ein noch offener Einspruch blockiert einen neuen.

## Ein Formular ausfüllen

Die öffentliche Seite verlangt eine Discord-Anmeldung. Antworten werden etwa anderthalb Sekunden nach dem letzten Tastenanschlag und beim Wechsel zur nächsten Seite als Entwurf gespeichert. Kommt man innerhalb von 30 Tagen zurück, wird der Entwurf mit einem Banner „Wir haben wiederhergestellt, was du schon geschrieben hattest" und einem Button **Neu starten** wiederhergestellt.

Eine Fortschrittsanzeige zeigt beantwortete Fragen. Die letzte Seite endet mit **Prüfen & Fortfahren**, das jede Antwort mit einem Link **Bearbeiten** auflistet, dann **Bestätigen & Senden**. Danach zeigt die Seite deine **Nachricht nach dem Absenden** (oder einen Standard pro Typ) und einen Link **Status prüfen**. Die Statusseite verlinkt außerdem auf **Meine Einsendungen** unter `/forms/submissions`, das jede nicht anonyme Antwort auflistet, die der angemeldete Nutzer serverübergreifend abgegeben hat.

Einsendende können ihre Antworten auf der Statusseite bearbeiten, solange die Antwort noch aussteht, das Formular nicht anonym ist und nicht geschlossen wurde. Frühere Antworten bleiben als Revisionen erhalten. Einsendende können eine Antwort nicht zurückziehen.

## Was beim Absenden passiert

1. Rollen unter **Rollen beim Absenden** und die **Rolle während der Prüfung** werden vergeben.
2. Ist **Wo Antworten gepostet werden** festgelegt, wird dort ein Embed gepostet, das den Nutzer (oder „Anonymous (login required)"), die Uhrzeit und bis zu 20 Antworten zeigt und **Pingen, wenn eine Antwort eingeht** pingt. Annehmen- und Ablehnen-Buttons werden angehängt, wenn das Formular geprüft wird.
3. Ist **An einen Webhook senden** festgelegt, wird dasselbe Embed ohne die Buttons an diesen Webhook gepostet. Wird die Antwort später angenommen oder abgelehnt, geht eine zweite Nachricht mit Ergebnis, Prüfer und Grund ebenfalls an den Webhook. Die URL muss ein Discord-Webhook sein; alles andere wird mit einer Warnung im Log des Bots ignoriert, und ein fehlschlagender Webhook blockiert die Einsendung nie.
4. Die Antwort erscheint im Tab **Antworten** mit dem Status Wartet auf Prüfung.

Anonyme Formulare speichern keine Nutzer-ID, können also keine Rollen ändern, und ihre Antworten können nicht bearbeitet werden.

## Der Prüfprozess

Antworten wechseln von Wartet auf Prüfung zu Angenommen oder Abgelehnt. **Wer annehmen oder ablehnen darf** benennt eine Rolle; wer „Server verwalten" oder Administrator hat, kann immer entscheiden. Ist keine Prüfer-Rolle festgelegt, können auch Inhaber der Annahme-Rollen entscheiden.

In Discord entscheidet **Annehmen** sofort. **Ablehnen** öffnet ein Modal, das nach einem Grund fragt, der Pflicht ist, weil er an die einsendende Person gesendet wird. In beiden Fällen wird das Embed umgefärbt, bekommt ein Feld **Angenommen** oder **Abgelehnt** mit Prüfer und Uhrzeit sowie dem Grund, falls vorhanden, und verliert seine Buttons. Im Dashboard wird dieselbe Entscheidung aus der Warteschlange mit einem Feld **Notizen für den Absender** getroffen.

Bei einer Entscheidung tut der Bot Folgendes:

- Fügt die Rollen unter **Bei Annahme hinzufügen**, **Bei Annahme entfernen**, **Bei Ablehnung hinzufügen** und **Bei Ablehnung entfernen** hinzu bzw. entfernt sie und entfernt immer die Rolle für die Wartezeit auf Prüfung. Eine Rolle, die auf beiden Seiten aufgeführt ist, wird entfernt.
- Entbannt den Nutzer bei einem angenommenen Banneinspruch oder erstellt die Einladung bei einer angenommenen Beitrittsbewerbung.
- Sendet der einsendenden Person per DM „Your response was approved" oder „Your response was not accepted" mit den Notizen, bei Annahme deine **Nachricht nach dem Absenden** sowie die Einladung. Schlägt die DM fehl, vermerken das das Embed und die Warteschlange.

Die Emotes der Prüf-Buttons stammen aus dem Formular, dann aus den **Server-Standards** im Tab **Einstellungen**, dann aus einem einfachen Haken und Kreuz.

## Versionen

Jedes Speichern eines Formulars behält eine Version, bis zu den letzten 20. Der **Versionsverlauf** zeigt jede einzelne mit einem Vergleich der Einstellungen und Fragen und einem Button **Wiederherstellen**. Das Wiederherstellen erstellt die Fragen mit neuen IDs neu und schreibt Bedingungen und Piping passend um.

## Einstellungen

Die Seite **Formulare** hat die Tabs **Formulare**, **Erstellen** und **Einstellungen** sowie **Bearbeiten** und **Antworten**, wenn ein Formular ausgewählt ist. Die Tabs Erstellen und Bearbeiten teilen sich ein Einstellungspanel.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Name | leer, erforderlich | Titel des Formulars, bis zu 255 Zeichen |
| Beschreibung | leer | Wird unter dem Titel und in Discord-Link-Vorschauen angezeigt |
| Wo Antworten gepostet werden | keiner | Kanal für das Einsendungs-Embed; leer lässt Antworten nur im Dashboard |
| Nachricht nach dem Absenden | keine | Text auf der Bestätigungsseite und in der DM bei Annahme |
| Entwurf | an bei neuen Formularen | An Entwürfe kann nichts gesendet werden |
| Nimmt Antworten an | an | Ausschalten, um zu schließen, ohne zu löschen |
| Zum Absenden erforderliche Rolle | Alle auf dem Server | Zugang per Rolle beschränken |
| Mindestalter des Discord-Kontos | Kein Limit | Tage |
| Personen außerhalb des Servers zulassen | aus | Nur normale Formulare |
| Anonym absenden | aus | Erfasst keine einsendende Person |
| Öffnet am, Schließt am | keine | Zeitfenster; eine Start-Ankündigung braucht eine Öffnungszeit |
| Insgesamt akzeptierte Antworten | Kein Limit | Limit über alle Personen hinweg |
| Mehr als eine Antwort pro Person erlauben | aus | |
| Abgelehnte Personen erneut versuchen lassen | aus | |
| Captcha verlangen | aus | Turnstile beim Prüfschritt |
| Öffnung ankündigen in, Mit der Ankündigung pingen, Ankündigungstext | keine | Start-Embed mit Countdown bis zum Schließen, gesendet innerhalb etwa einer Minute nach **Öffnet am** oder beim Veröffentlichen |
| Pingen, wenn eine Antwort eingeht | keine | Rolle, die bei jeder Einsendung erwähnt wird |
| Rollen beim Absenden | keine | Sofort vergeben |
| Rolle während der Prüfung | keine | Wird bei der Entscheidung entfernt |
| An einen Webhook senden | keiner | Discord-Webhook-URL, die ebenfalls jedes Einsendungs-Embed und jede Annahme- oder Ablehnungs-Entscheidung erhält |
| Antworten müssen genehmigt werden | aus | Fügt einem normalen Formular eine Prüfung hinzu |
| Wer annehmen oder ablehnen darf | nur Server verwalten | Prüfer-Rolle |
| Emote für Annehmen-Button, Emote für Ablehnen-Button | Server-Standard | |
| Bei Annahme hinzufügen/entfernen, Bei Ablehnung hinzufügen/entfernen | keine | Rollenänderungen bei der Entscheidung |
| Eine Ablehnung ist endgültig, Wartezeit nach dem Bann, Erlaubte Einsprüche, Wartezeit zwischen Einsprüchen | aus, Keine Wartezeit, Unbegrenzt, Keine Wartezeit | Nur Banneinsprüche |
| Wie oft die Einladung genutzt werden kann, Einladung läuft ab nach (Sekunden), Rollen beim Beitritt | 1, 86400, keine | Nur Beitrittsbewerbungen |

Einstellungen, die nicht zum Typ des Formulars passen, werden beim Speichern verworfen.

## Einrichtung Schritt für Schritt

1. Öffne **Formulare** im Dashboard und drücke **Erstellen**.
2. Wähle den **Formulartyp**. Er lässt sich später nicht ändern.
3. Fülle **Name** und **Beschreibung** aus und wähle **Wo Antworten gepostet werden**.
4. Füge unter **Fragen** Fragen hinzu, markiere die Pflichtfragen und teile lange Formulare mit **Seite hinzufügen** auf.
5. Lege fest, wer einsenden darf, und schalte, wenn du einen Prüfschritt willst, **Antworten müssen genehmigt werden** ein und wähle **Wer annehmen oder ablehnen darf**.
6. Drücke **Formular speichern**. Nutze **Vorschau** auf der Formularkarte, um es als Administrator durchzugehen.
7. Drücke **Veröffentlichen** auf der Karte, dann **Link kopieren**, und poste den Link dort, wo Bewerber ihn finden.
8. Beobachte den Tab **Antworten** oder den Einsendungs-Kanal und entscheide über jede Antwort.

## Befehle

Formulare haben keine Text- oder Slash-Commands. Die einzige Discord-Interaktion sind die Buttons **Annehmen** und **Ablehnen** an jedem Einsendungs-Embed.

## Tipps und Stolperfallen

- Der Bot braucht „Rollen verwalten", und seine Rolle muss über jeder Rolle stehen, die ein Formular vergibt oder entfernt. Rollen über dem Bot, verwaltete Rollen und „everyone" werden stillschweigend übersprungen.
- Banneinsprüche brauchen „Audit-Log anzeigen" für die Prüfung der „Wartezeit nach dem Bann". Zum Entbannen braucht es „Mitglieder bannen", und Einladungen für Beitrittsbewerbungen brauchen „Einladung erstellen" in einem für alle sichtbaren Kanal.
- Das Einsendungs-Embed zeigt höchstens 20 Antworten; die vollständige Antwort steht im Dashboard.
- **CSV exportieren** im Tab Antworten enthält eine Spalte pro Frage, wobei Mehrfachauswahl-Antworten durch Semikolons getrennt sind.
- Antwortfilter und Seite sind Teil der URL, sodass du „nur ausstehende" als Lesezeichen speichern und mit Prüfenden teilen kannst.
- Entwürfe werden nie validiert, daher kann ein wiederhergestellter Entwurf beim Absenden trotzdem an der Validierung scheitern.
- Abgelaufene Formulare werden von einer Prüfung geschlossen, die jede Minute läuft; die Berechtigung wird zusätzlich beim Absenden geprüft, sodass dazwischen nichts durchrutscht.

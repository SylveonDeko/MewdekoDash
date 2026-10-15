---
title: AFK-System
slug: afk
summary: Lass Mitglieder sich als abwesend markieren, erkläre allen, die sie anpingen, warum, und lösche den Status automatisch, wenn sie zurückkommen.
icon: fa-moon
category: Actions
dashboard: /dashboard/afk
module: Afk
tags: [afk, away, idle, status, brb, mention reply, timed afk, placeholders, abwesend, inaktiv, Status, bin gleich zurück, Erwähnungsantwort, zeitgesteuertes AFK, Platzhalter]
related: [utility, administration]
---

## Was es macht

Ein Mitglied führt `afk` mit einer optionalen Nachricht aus. Ab dann antwortet der Bot in dem Kanal jedes Mal, wenn jemand es erwähnt, mit der Nachricht und der Dauer der Abwesenheit. Kehrt das Mitglied zurück, wird der Status gelöscht, eine kurze „Willkommen zurück“-Mitteilung gepostet, die nach fünf Sekunden verschwindet, und der Spitzname wiederhergestellt.

Solange ein Mitglied abwesend ist, versucht der Bot außerdem, es in `[AFK] name` umzubenennen, gekürzt auf das Limit für Spitznamen von Discord. So ist der Status in der Mitgliederliste sichtbar.

Wird `afk` ohne Nachricht ausgeführt, wirkt es als Umschalter: Bist du nicht abwesend, wird AFK mit leerer Nachricht eingeschaltet. Bist du abwesend, wird es ausgeschaltet.

## Warum du es nutzen würdest

- Mitglieder in belebten Servern werden nicht immer wieder von Leuten angepingt, die ein „brb“ nicht gesehen haben.
- Das Team sieht auf einen Blick, wer da ist und wer nicht.
- Zeitgesteuertes AFK deckt „bin in zwei Stunden zurück“ ab, ohne dass jemand daran denken muss, es zu löschen.

## Wie ein Status endet

Der **AFK-Typ** entscheidet, was der Bot als Zurückkommen zählt. Es ist die wichtigste Einstellung auf dieser Seite.

| Typ | Status wird gelöscht, wenn |
| --- | --- |
| Selbst deaktivieren | Nur wenn das Mitglied `afk` erneut ausführt oder das Team es entfernt. Nichts passiert automatisch. |
| Bei Nachricht | Das Mitglied irgendwo auf dem Server eine Nachricht sendet. |
| Bei Tippen | Das Mitglied in irgendeinem Kanal zu tippen beginnt. |
| Beides | Eine Nachricht oder Tippen, je nachdem, was zuerst kommt. |

Der **AFK-Timeout** ist eine Schonfrist, gemessen ab dem Setzen des Status. Innerhalb dieses Fensters beendet Tippen oder das Senden einer Nachricht den Status nicht. So beendet die Nachricht „afk, brb“ selbst AFK nicht sofort. Der Standard ist 0, also keine Schonfrist. Setze sie mit `afktimeout` oder auf dem Tab **Erweiterte Einstellungen** im Dashboard.

Zeitgesteuertes AFK funktioniert anders: Es läuft, bis sein Timer abläuft, unabhängig vom Typ. Dazwischen zu reden beendet es nicht. Läuft der Timer ab, wird der Status gelöscht und der Spitzname ohne Hinweis im Kanal wiederhergestellt.

Eine Nachricht innerhalb von fünf Minuten nach dem Posten zu bearbeiten zählt wie das Senden einer neuen.

## Die Antwort auf eine Erwähnung

Wenn jemand ein abwesendes Mitglied erwähnt, prüft der Bot bis zu fünf erwähnte Nutzer pro Nachricht. Er ignoriert Bots und Selbst-Erwähnungen sowie Nachrichten, die mit dem Befehlspräfix beginnen, und überspringt Kanäle auf der Liste der deaktivierten Kanäle. Für jedes abwesende Mitglied, das er findet, postet er eine Antwort.

Standardmäßig ist die Antwort ein Embed. Die Autorzeile lautet „Nutzer ist gerade abwesend“ mit dem Avatar, die Beschreibung ist die AFK-Nachricht, und die Fußzeile zeigt, wie lange die Person abwesend ist. Ist der Bot so konfiguriert, dass er einen Einladungsbutton anzeigt, wird einer angehängt.

Du kannst das mit einer eigenen Nachricht oder einem eigenen Embed über `customafkmessage` ersetzen oder über den Editor **Eigene AFK-Embed-Nachricht** im Dashboard. Der Text durchläuft den Embed-Parser, daher funktioniert alles, was der Embed-Builder erzeugt. Setze `-`, um zum Standard zurückzukehren.

### Platzhalter

Diese werden in einer eigenen AFK-Nachricht ersetzt. Allgemeine Platzhalter von der Platzhalterseite sind hier nicht verfügbar, nur dieser Satz.

| Platzhalter | Wert |
| --- | --- |
| `%afk.message%` | Die AFK-Nachricht, mit neutralisierten Erwähnungen und auf die maximale Länge gekürzt |
| `%afk.user%` | Der Nutzername des abwesenden Mitglieds |
| `%afk.user.mention%` | Eine Erwähnung des abwesenden Mitglieds |
| `%afk.user.avatar%` | Die Avatar-URL des abwesenden Mitglieds |
| `%afk.user.id%` | Die Nutzer-ID des abwesenden Mitglieds |
| `%afk.triggeruser%` | Nutzername der Person, die es angepingt hat |
| `%afk.triggeruser.mention%` | Eine Erwähnung der Person, die es angepingt hat |
| `%afk.triggeruser.avatar%` | Avatar-URL der Person, die es angepingt hat |
| `%afk.triggeruser.id%` | Nutzer-ID der Person, die es angepingt hat |
| `%afk.time%` | Wie lange das Mitglied abwesend ist, in Worten wie „2 Stunden“ |

> [!EXAMPLE]
> Eine reine Textantwort: `%afk.user.mention% ist abwesend (%afk.time%): %afk.message%`

## Einstellungen

Alle diese Einstellungen findest du auf der Seite AFK-System unter den Tabs **Grundeinstellungen** und **Erweiterte Einstellungen**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Automatische Löschzeit | 0 (nie) | Sekunden, bis die Antwort des Bots auf eine Erwähnung sich selbst löscht |
| Max. Nachrichtenlänge | 128 | Längste AFK-Nachricht, die ein Mitglied setzen darf, 1 bis 4096. Längere werden abgelehnt |
| AFK-Entfernungstyp | Selbst deaktivieren | Einer der vier obigen Typen |
| AFK-Timeout | 0 (keiner) | Die Schonfrist nach dem Setzen von AFK, bis zu zwei Stunden |
| Deaktivierte Kanäle | keine | Kanäle, in denen eine Erwähnung eines abwesenden Mitglieds keine Antwort auslöst |
| Eigenes AFK-Embed | Standard-Embed | Deine eigene Antwort mit den obigen Platzhaltern |

> [!TIP]
> Setze die automatische Löschzeit auf etwa dreißig Sekunden. Die Person, die angepingt hat, sieht die Antwort, und der Kanal füllt sich nicht mit veralteten AFK-Hinweisen.

Der Tab **Nutzerverwaltung** listet jedes Mitglied auf, das gerade abwesend ist, und lässt das Team den Status für eine oder mehrere Personen auf einmal löschen.

## Einrichtung

1. Öffne **AFK-System** im Dashboard.
2. Wähle einen **AFK-Entfernungstyp**. „Bei Nachricht“ ist der sicherste Standard, „Beides“ ist am bequemsten.
3. Setze **Automatische Löschzeit** auf 30. Lass **Max. Nachrichtenlänge** auf 128, außer du willst längere Status.
4. Füge unter **Erweiterte Einstellungen** unter **Deaktivierte Kanäle** Bot-Befehlskanäle und Ankündigungskanäle hinzu.
5. Optional baust du im Embed-Editor eine eigene Antwort mit den obigen Platzhaltern.
6. Teste es: Führe `afk testing` aus, erwähne dich selbst von einem anderen Konto und sende dann eine Nachricht, um zu sehen, wie der Status gelöscht wird.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `afk [message]` | | Niemand | Deine AFK-Nachricht setzen oder AFK ohne Nachricht ein- und ausschalten |
| `timedafk <time> <message>` | `tafk` | Niemand | AFK, das von selbst endet, zum Beispiel `timedafk 2h dinner` |
| `getactiveafks` | `activeafks` | Niemand | Alle auflisten, die gerade AFK sind |
| `afkview [@user]` | `viewafk` | Nachrichten verwalten | Die aktuelle AFK-Nachricht einer Person anzeigen |
| `afkremove @user...` | `afkrm` | Nachrichten verwalten | Den Status eines oder mehrerer Mitglieder löschen |
| `afkdel [seconds]` | `afkdelete` | Server verwalten | Die automatische Löschzeit für die Antwort anzeigen oder setzen |
| `afklength <number>` | `maxafklength` | Administrator | Die Länge der AFK-Nachricht begrenzen |
| `afktype <type>` | | Administrator | `selfdisable`, `onmessage`, `ontype` oder `either` |
| `afktimeout <time>` | | Administrator | Die Schonfrist setzen, zum Beispiel `30s` |
| `afkdisable #channel...` | | Kanäle verwalten | Kanäle zur Liste ohne Antwort hinzufügen |
| `afkundisable #channel...` | | Kanäle verwalten | Kanäle von der Liste ohne Antwort entfernen |
| `afkdisabledlist` | | Kanäle verwalten | Die Liste ohne Antwort anzeigen |
| `customafkmessage <text>` | `afkmessage` | Administrator | Die eigene Antwort setzen, oder `-` zum Zurücksetzen |

## Tipps und Fallstricke

- Es gibt keinen Befehl, nur den eigenen Status zu löschen. Führe `afk` erneut ohne Nachricht aus oder warte, bis die Typregel ihn löscht.
- Spitznamen-Änderungen brauchen die Rolle des Bots über der höchsten Rolle des Mitglieds und die Berechtigung **Spitznamen verwalten**. Der Spitzname des Serverinhabers kann nie von einem Bot geändert werden. Inhaber behalten also ihren Namen, aber der Status funktioniert trotzdem.
- Der AFK-Dienst lädt seinen Cache kurz nach dem Start des Bots. Bis dahin antworten Befehle, dass AFK noch startet.
- Erwähnungen in der AFK-Nachricht werden in der Antwort neutralisiert, damit Mitglieder ihren Status nicht nutzen können, um Rollen oder alle zu pingen.

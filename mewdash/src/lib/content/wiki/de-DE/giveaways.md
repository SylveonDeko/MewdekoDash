---
title: Gewinnspiele
slug: giveaways
summary: Führe zeitlich begrenzte Gewinnspiele durch, an denen Mitglieder per Reaktion, Button oder Web-Captcha teilnehmen, mit Anforderungen an Rollen und Nachrichtenanzahl, zufälliger Gewinnerwahl, Neuauslosungen und DMs an Gewinner.
icon: fa-gift
category: Entertainment
dashboard: /dashboard/giveaways
module: Giveaways
tags: [giveaway, gstart, prize, raffle, winner, reroll, contest, entry, captcha, Gewinnspiel, Preis, Verlosung, Gewinner, neu auslosen, Wettbewerb, Teilnahme, Captcha]
related: [embedbuilder, chat-triggers, xp]
---

## Was es macht

Das Team startet ein Gewinnspiel mit einem Preis, einem Kanal, einer Anzahl an Gewinnern und einer Dauer. Der Bot postet ein Embed in diesem Kanal, das Preis, Veranstalter, Endzeitpunkt und alle Anforderungen zeigt. Mitglieder nehmen teil, indem sie mit dem Gewinnspiel-Emote des Servers reagieren, auf den Button **Enter** drücken oder auf dem Dashboard ein Captcha lösen; je nachdem, wie das Gewinnspiel gestartet wurde.

Wenn der Timer abläuft, wählt der Bot die Gewinner zufällig aus allen Teilnehmern, die die Anforderungen noch erfüllen. Er bearbeitet die ursprüngliche Nachricht, um die Gewinner anzuzeigen, postet im Kanal eine Glückwunschnachricht und, falls aktiviert, sendet jedem Gewinner eine DM mit einem Link zum Gewinnspiel. Das Team kann ein Gewinnspiel vorzeitig beenden oder nach dem Ende neu auslosen.

Anforderungen werden am Ende geprüft, nicht bei der Teilnahme. Wer reagiert hat, aber später eine erforderliche Rolle verloren hat, wird bei der Gewinnerauswahl übersprungen.

## Wofür du es verwenden würdest

- Spiele-Keys, Nitro oder Merch an aktive Mitglieder verlosen, ohne Namen von Hand auszuwählen.
- Leute belohnen, die tatsächlich schreiben, indem eine Mindestanzahl an Nachrichten verlangt wird.
- Einen Preis auf Booster oder Unterstützer-Rollen beschränken, indem diese Rollen verlangt werden.
- Alt-Accounts und Bots davon abhalten, Teilnahmen zu fluten, indem die Captcha-Teilnahme genutzt wird.

## Teilnahmemethoden

Jedes Gewinnspiel nutzt genau eine dieser Methoden. Der interaktive Assistent `gstart` fragt danach, der Slash-Befehl hat die Optionen `use_button` und `use_captcha`, und das Dashboard hat eine Auswahl **Teilnahmemethode**.

| Methode | So nehmen Mitglieder teil | Hinweise |
| --- | --- | --- |
| Reaktion | Mit dem Gewinnspiel-Emote des Servers reagieren | Der Standard. Der Bot liest beim Ende des Gewinnspiels die Reaktionsliste aus, bis zu 1000 Nutzer. |
| Button | Den Button **Enter** unter dem Embed drücken | Teilnahmen speichert der Bot selbst. Doppelte Teilnahme, Teilnahme nach dem Ende oder außerhalb des Servers wird abgelehnt. |
| Captcha | **Enter (Web Captcha)** drücken, im Dashboard anmelden und eine Cloudflare-Turnstile-Prüfung bestehen | Gleiche Speicherung wie bei der Button-Teilnahme. Die Teilnahme wird dem angemeldeten Discord-Konto zugeordnet. |

Das Gewinnspiel-Emote wird pro Server mit `gemote` festgelegt. Der Bot prüft es, indem er damit reagiert; ein eigenes Emote von einem anderen Server funktioniert also nur, wenn der Bot auch auf diesem Server ist. Reaktions-Gewinnspiele benötigen außerdem die Berechtigungen Reaktionen hinzufügen und Externe Emojis verwenden des Bots, und `gstart` verweigert den Start ohne sie.

## Anforderungen

| Anforderung | Festgelegt durch | Wirkung bei der Auslosung |
| --- | --- | --- |
| Erforderliche Rollen | Assistent, Slash-Option `required_roles`, Dashboard **Erforderliche Rollen** | Das Mitglied muss alle aufgeführten Rollen haben |
| Nachrichtenanzahl | Assistent, Slash-Option `required_messages`, Dashboard **Erforderliche Nachrichtenanzahl** | Die gezählten Nachrichten des Mitglieds auf diesem Server müssen mindestens diese Zahl erreichen. Der Dienst zur Nachrichtenzählung kennt nur Nachrichten, die seit seiner Aktivierung gezählt wurden. |

Bots sind immer ausgeschlossen, ebenso wer den Server verlassen hat. Anforderungen werden im Gewinnspiel-Embed als Zeile **Erforderliche Rollen** und als Zeile „N Messages Required“ aufgelistet.

## Die Gewinnspiel-Nachricht

Der Titel des Embeds ist der Preis. Die Beschreibung lautet „React with (emote) to enter!“, nennt den Veranstalter und zeigt den Endzeitpunkt als relativen und absoluten Discord-Zeitstempel. Die Fußzeile zeigt die Gewinneranzahl, den Servernamen und das Enddatum. Der Nachrichteninhalt ist die Ping-Rollen-Erwähnung, falls eine gesetzt ist.

Einstellungen zum Erscheinungsbild für den ganzen Server:

| Einstellung | Befehl | Wirkung |
| --- | --- | --- |
| Embed-Farbe | `gembedcolor` | Farbe des Gewinnspiel-Embeds, als Farbname oder `#hex` |
| Banner | `gbanner` | Bild, das bei jedem Gewinnspiel angezeigt wird. Assistent und Slash-Befehl können es pro Gewinnspiel mit einer URL oder einem Anhang überschreiben. |
| Ping-Rolle | keine, nur Überschreibung im Assistenten | Der Assistent bietet an, eine Rolle zu pingen; ist eine Server-Ping-Rolle gespeichert, fragt er, ob sie überschrieben werden soll |
| Gewinner per DM | `gdm` | Ob Gewinner eine DM erhalten. Standardmäßig an. |

### Wenn es endet

Gibt es genug berechtigte Teilnehmer, bearbeitet der Bot das Embed zu „Winner: @user“ mit dem Veranstalter, setzt die Fußzeile auf „Ended at (time)“, ändert den Inhalt zu „**Giveaway Ended!**“ und postet eine eigene Glückwunschnachricht mit einem Link zum Gewinnspiel und dem Befehl zur Neuauslosung. Hat niemand teilgenommen oder nehmen weniger berechtigte Personen teil, als Gewinner vorgesehen sind, wird das Embed durch „There were not enough participants!“ ersetzt und das Gewinnspiel als beendet markiert. Haben Leute teilgenommen, aber niemand erfüllte die Anforderungen, zeigt der Bot das stattdessen an.

Ein Gewinnspiel mit einem Gewinner löst außerdem das Ereignis `GiveawayWon` für Chat-Auslöser aus, sodass ein Auslöser auf einen Gewinn reagieren kann.

### Gewinner-DM

Ist **Gewinner per DM** aktiv, erhält jeder Gewinner eine DM. Der Standard ist ein Embed, das den Gewinn mitteilt, mit einem Link zur Gewinnspiel-Nachricht. Ist eine eigene Endnachricht gespeichert, wird stattdessen diese gesendet; sie kann zusätzlich zu den allgemeinen Server-, Benutzer- und Kanalplatzhaltern diese Platzhalter verwenden:

| Platzhalter | Wert |
| --- | --- |
| `%messagelink%` | Link zur Gewinnspiel-Nachricht |
| `%giveawayitem%` | Der Preis |
| `%giveawaywinners%` | Die Anzahl der Gewinner |

`gdmmessage` ohne Text bietet eine Vorschau der gespeicherten Nachricht mit Beispielwerten an; lehnst du die Vorschau ab, wird sie geleert. Wird der Befehl mit Text ausgeführt, wird die gespeicherte Nachricht ebenfalls geleert, statt die neue zu speichern.

## Einstellungen

Die Seite **Gewinnspiele** im Dashboard hat drei Reiter: **Aktive Gewinnspiele**, **Gewinnspiel erstellen** und **Beendete Gewinnspiele**. Die oben genannten Einstellungen für den ganzen Server (Emote, Farbe, Banner, DM-Schalter) gibt es nur über Befehle.

Das Formular **Gewinnspiel erstellen**:

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Gewinn | leer | Der Preis, angezeigt als Embed-Titel |
| Anzahl der Gewinner | 1 | Wie viele Gewinner gezogen werden; mindestens 1 |
| Kanal | keiner | Wo das Embed gepostet wird |
| Dauer | 24 Stunden | Wann das Gewinnspiel endet |
| Erforderliche Rollen | keine | Rollen, die ein Mitglied haben muss, um zu gewinnen |
| Erforderliche Nachrichtenanzahl | 0 | Mindestanzahl gezählter Nachrichten |
| Reaktions-Emoji | die Konfetti-Tröte | Emote für die Reaktionsteilnahme; ein eigenes Emote oder ein eingefügter Emote-Code funktioniert |
| Teilnahmemethode | Reaktion | Reaktion, Button oder Captcha |

**Aktive Gewinnspiele** listet jedes Gewinnspiel mit seinem Endzeitpunkt auf. Beim Aufklappen eines Eintrags siehst du Gewinner, Kanal, erforderliche Rollen, Nachrichtenanforderung und Teilnahmemethode, dazu einen Button **End Giveaway**. Neuauslosungen gibt es nur über Befehle.

## Einrichtung Schritt für Schritt

1. Führe `gemote` mit dem Emote aus, mit dem Mitglieder reagieren sollen, zum Beispiel `gemote :tada:`.
2. Setze optional `gembedcolor` und `gbanner`, damit Gewinnspiele zum Look deines Servers passen.
3. Öffne **Gewinnspiele** im Dashboard und dann **Gewinnspiel erstellen**.
4. Fülle **Gewinn**, **Anzahl der Gewinner**, **Kanal** und **Dauer** aus.
5. Füge **Erforderliche Rollen** oder eine **Erforderliche Nachrichtenanzahl** hinzu, wenn der Preis an etablierte Mitglieder gehen soll.
6. Wähle eine **Teilnahmemethode** und drücke **Gewinnspiel erstellen**.
7. Wenn es endet, prüfe den Kanal. Wurde die falsche Person gezogen oder reagiert sie nicht, führe `greroll <message id>` aus.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Dieselben Befehle gibt es als Slash-Befehle unter `/giveaways`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `gstart [#channel <time> <winners> <prize>]` | `giveawaystart` | Nachrichten verwalten | Ein Gewinnspiel starten. Ohne Argumente startet ein Assistent, der zusätzlich nach Veranstalter, Nachrichtenanforderung, Banner, Ping-Rolle, Teilnahmemethode und erforderlichen Rollen fragt. Die Zeit sieht so aus: `2d3h`. |
| `gend <message id>` | `giveawayend` | Nachrichten verwalten | Ein Gewinnspiel sofort beenden und Gewinner ziehen |
| `greroll <message id>` | `giveawayreroll`, `reroll` | Nachrichten verwalten | Erneut aus den Teilnehmern eines beendeten Gewinnspiels ziehen |
| `glist` | `giveaways`, `giveawaylist` | Nachrichten verwalten | Aktive Gewinnspiele mit Nachrichten-IDs, Preisen, Gewinneranzahl und Links auflisten |
| `gstats` | `giveawaystats` | Niemand | Summen aktiver und beendeter Gewinnspiele, Veranstalter und Anzahl pro Kanal |
| `gemote <emote>` | `giveawayemote` | Nachrichten verwalten | Das Emote für die Reaktionsteilnahme festlegen |
| `gembedcolor <colour>` | `giveawayembedcolor` | Nachrichten verwalten | Die Embed-Farbe des Gewinnspiels festlegen |
| `gwinembedcolor <colour>` | `giveawaywinembedcolor` | Nachrichten verwalten | Setzt denselben Farbwert wie `gembedcolor` |
| `gbanner <url>` | `giveawaybanner` | Nachrichten verwalten | Das Standard-Banner festlegen |
| `gdm` | `giveawaydm` | Nachrichten verwalten | DMs an Gewinner umschalten |
| `gdmmessage [text]` | `gdmmsg` | Nachrichten verwalten | Die eigene Gewinner-DM anzeigen oder leeren |

## Tipps und Stolperfallen

- Die Nachrichten-ID für `gend` und `greroll` ist die ID des Gewinnspiel-Embeds. Kopiere sie mit dem Entwicklermodus oder lies sie aus `glist`.
- Eine Neuauslosung zieht erneut aus den Teilnehmern mit denselben Anforderungen, daher kann der bisherige Gewinner erneut gewinnen.
- Nach einem Neustart plant der Bot Gewinnspiele, die in den nächsten 24 Stunden enden, sofort ein; spätere werden durch eine stündliche Prüfung aufgegriffen, sodass auch ein Gewinnspiel mit langer Dauer pünktlich endet.
- Kann der Bot bei einem Reaktions-Gewinnspiel die Reaktionen nicht lesen, greift er auf das aktuelle Server-Emote zurück. Wurde das Emote aber auf etwas geändert, womit niemand reagiert hat, findet die Auslosung keine Teilnehmer.
- Die Liste **Aktive Gewinnspiele** im Dashboard zeigt auch beendete Gewinnspiele, und der Reiter **Beendete Gewinnspiele** ist derzeit leer. Unterscheide sie anhand des Endzeitpunkts und des fehlenden Buttons **End Giveaway**.
- Captcha-Teilnahme setzt voraus, dass das Dashboard erreichbar ist und sich das Mitglied mit Discord anmeldet; die Teilnahme ist an dieses Konto gebunden, nicht an etwas, das auf der Seite eingetippt wird.
- Gewinner-DMs schlagen stillschweigend fehl, wenn der Gewinner DMs geschlossen hat. Die Ankündigung im Kanal wird trotzdem gesendet.

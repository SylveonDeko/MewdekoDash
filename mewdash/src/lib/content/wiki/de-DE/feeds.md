---
title: Feeds
slug: feeds
summary: Abonniere einen Kanal für einen RSS- oder Atom-Feed, und der Bot postet jeden neuen Eintrag, entweder als Standard-Embed oder in einer Nachricht, die du selbst gestaltest.
icon: fa-newspaper
category: Actions
dashboard: /dashboard/feeds
module: Searches
tags: [rss, atom, feed, news, blog, youtube, updates, subscriptions, feedadd, Nachrichten, Blog, Updates, Abonnements, Neuigkeiten, Abo]
related: [embedbuilder, utility]
---

## Was es macht

Du gibst dem Bot eine Feed-URL und einen Kanal. Ab dann prüft der Bot den Feed regelmäßig und postet alles, was seit der letzten Prüfung veröffentlicht wurde. Mitglieder sehen jedes Mal eine neue Nachricht im Kanal, wenn die Website etwas veröffentlicht, mit dem Titel des Eintrags, einem Link und, falls der Feed sie liefert, der Beschreibung und einem Bild.

Das Team kann bis zu zehn Feeds pro Server abonnieren und jedem eine eigene Nachricht geben. Die Nachricht läuft durch den Embed-Parser, ein Feed-Update kann also reiner Text, ein Embed oder ein Embed mit Buttons sein, und Platzhalter können Titel, Link, Autor und so weiter des Eintrags einfügen.

Von Mitgliedern wird nichts verlangt. Sie lesen einfach den Kanal.

## Wofür du es brauchst

- Den Blog, die Patch Notes oder das Changelog deiner Community automatisch in einen Ankündigungskanal posten.
- Den Feed einer Nachrichtenseite oder eines Subreddits in einen Diskussionskanal spiegeln.
- Einem YouTube-Kanal oder Podcast über seinen RSS-Feed folgen.
- Einen Status- oder Release-Feed sichtbar halten, ohne dass jemand Links von Hand kopiert.

## So werden Updates gepostet

Der Bot durchläuft jede abonnierte Feed-URL, lädt sie und wartet etwa zehn Sekunden, bevor er den nächsten Durchlauf startet. Beim ersten Abruf nach dem Start merkt er sich das Datum des neuesten Eintrags und postet nichts. Danach wird jeder Eintrag mit einem Veröffentlichungsdatum, das neuer als der zuletzt gesehene ist, gepostet, der älteste zuerst, und das gespeicherte Datum rückt vor. Bei Atom-Feeds wird das Aktualisierungsdatum des Eintrags verwendet, wenn kein Veröffentlichungsdatum vorhanden ist. Einträge ohne beides werden ignoriert.

Es gibt keine Obergrenze dafür, wie viele Einträge in einem Durchlauf gesendet werden. Ein Feed, der zwanzig rückdatierte Einträge auf einmal abwirft, erzeugt also zwanzig Nachrichten.

Feeds, die nicht geladen werden können, werden bis zum nächsten Durchlauf stillschweigend übersprungen. Sie werden nicht entfernt, und der Bot meldet den Fehler nicht.

### Die Standardnachricht

Hat ein Feed keine eigene Nachricht, sendet der Bot ein Embed mit:

| Teil | Wert |
| --- | --- |
| Titel | Der Titel des Eintrags, nach 256 Zeichen abgeschnitten |
| Beschreibung | Die Beschreibung des Eintrags ohne HTML, nach 2048 Zeichen abgeschnitten |
| URL | Der Link des Eintrags, damit der Titel anklickbar ist |
| Bild | Ein Bildanhang des Feeds oder ein Atom-Element `preview` bzw. `thumbnail`, falls vorhanden |
| Fußzeile | Die Feed-URL |

### Eigene Nachrichten und Platzhalter

Eine eigene Nachricht setzt du mit `feedmessage` oder dem Button **Nachricht bearbeiten** im Dashboard. Der Text läuft durch den Embed-Parser, es funktioniert also alles aus dem [Embed-Builder](/wiki/embedbuilder): reiner Text, Embed-JSON oder beides. Rollen- und Nutzererwähnungen im Textteil pingen.

Diese Platzhalter werden in der eigenen Nachricht ersetzt, zusätzlich zu den allgemeinen Server-, Kanal- und Bot-Platzhaltern von der Platzhalter-Seite.

| Platzhalter | Wert |
| --- | --- |
| `%title%` | Der Titel des Eintrags |
| `%author%` | Der Autor des Eintrags oder „Unknown“ |
| `%content%` | Die Beschreibung des Eintrags ohne HTML |
| `%url%` | Link zum Eintrag |
| `%feedurl%` | Die eigene URL des Feeds |
| `%image_url%` | Das Bild des Eintrags, falls der Feed eines liefert, sonst das Bild des Feeds |
| `%categories%` | Die Kategorien des Eintrags, durch Kommas getrennt |
| `%timestamp%` | Das Veröffentlichungsdatum als Discord-Zeitstempel |

> [!EXAMPLE]
> `feedmessage 1 New post: **%title%** by %author%
> %url%`

Setze die Nachricht auf `-`, um zum Standard-Embed zurückzukehren.

## Einstellungen

Feeds haben keine serverweiten Einstellungen. Jedes Abo hat einen Kanal und eine URL, die beim Hinzufügen gewählt werden, plus optional eine Nachricht. Die Dashboard-Seite heißt **RSS-Feeds** und hat drei Reiter.

| Reiter | Was er zeigt |
| --- | --- |
| RSS-Feeds | Jedes Abo mit Kanal, URL und Hinzufügedatum. **Nachricht bearbeiten** oder **Eigene Nachricht hinzufügen** öffnet ein Textfeld; eine Vorschau der Nachricht wird darunter gerendert. **Löschen** entfernt den Feed nach einer Bestätigung. |
| Feed hinzufügen | Eine Auswahl für den **Kanal** und ein Feld **RSS-Feed-URL** mit dem Button **RSS-Feed hinzufügen** |
| Statistiken | **Feeds gesamt**, **Einzigartige Feeds**, **Kanäle** und eine Aufschlüsselung **Feeds nach Kanal** |

Kanal und URL eines bestehenden Feeds lassen sich nicht ändern. Entferne den Feed und füge ihn erneut hinzu.

## Einrichtung Schritt für Schritt

1. Öffne **Feeds** im Dashboard und wechsle zu **Feed hinzufügen**.
2. Wähle den **Kanal**, in den die Updates sollen.
3. Füge die Feed-Adresse in **RSS-Feed-URL** ein und drücke **RSS-Feed hinzufügen**. Es muss eine vollständige `http`- oder `https`-Adresse zu einem RSS- oder Atom-Dokument sein, nicht die Startseite der Website.
4. Zurück auf **RSS-Feeds** drückst du **Eigene Nachricht hinzufügen**, wenn du eigene Formulierungen willst, und dann **Speichern**.
5. Führe `feedtest 1` in Discord aus, um den neuesten Eintrag zu posten und das Ergebnis zu prüfen. Die Nummer ist die Position des Feeds in `feedlist`.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast). Alle Feed-Befehle brauchen Nachrichten verwalten.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `feedadd <url> [#channel]` | `rss` | Nachrichten verwalten | Einen Kanal für einen Feed abonnieren. Standardmäßig der aktuelle Kanal. Der Bot lädt den Feed zuerst und lehnt ihn ab, wenn er nicht gelesen werden kann. |
| `feedlist` | `feeds` | Nachrichten verwalten | Die Abos auflisten, nummeriert, zehn pro Seite |
| `feedremove <number>` | `feedrm`, `feeddel` | Nachrichten verwalten | Ein Abo anhand seiner Nummer in der Liste entfernen |
| `feedmessage <number> <message>` | `rssmessage` | Nachrichten verwalten | Die eigene Nachricht für ein Abo festlegen |
| `rsstest <number>` | `feedtest` | Nachrichten verwalten | Den neuesten Eintrag des Feeds im aktuellen Kanal posten |

## Tipps und Stolperfallen

- Das Limit liegt bei zehn Feeds pro Server, und dieselbe URL kann nicht zweimal hinzugefügt werden. `feedadd` meldet einen gemeinsamen Fehler für einen nicht lesbaren Link, ein Duplikat und das Limit; prüfe also `feedlist`, wenn du dir nicht sicher bist, welcher Fall zutrifft.
- Ein Feed, der über das Dashboard hinzugefügt wird, wird vorher nicht getestet. Nutze danach `feedtest`, um sicherzugehen, dass der Bot ihn lesen kann.
- Die Nummern in `feedremove`, `feedmessage` und `feedtest` stammen aus `feedlist`, das Feeds nach ihrem Hinzufügedatum sortiert.
- Der Bot braucht im Zielkanal Send Messages und Embed Links. Ohne Embed Links erscheint das Standard-Embed nicht.
- Nur Einträge mit einem Veröffentlichungsdatum (bei Atom ein Aktualisierungsdatum) werden gepostet. Ein Feed, dessen Einträge kein Datum haben, erzeugt nie Updates.
- Der Bot postet nichts bei seinem ersten Durchlauf nach einem Neustart. Er beginnt beim neuesten Eintrag zu diesem Zeitpunkt, Einträge, die während seiner Offline-Zeit veröffentlicht wurden, werden also nicht nachgeholt.
- Da eine eigene Nachricht den Embed-Parser nutzt, gelten dieselben Regeln wie im Embed-Builder: gültiges JSON oder reiner Text.

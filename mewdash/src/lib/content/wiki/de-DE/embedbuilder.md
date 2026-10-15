---
title: Embeds
slug: embedbuilder
summary: Erstelle reichhaltige Discord-Nachrichten mit Embeds, Buttons und Auswahlmenüs, speichere sie als Vorlagen, sende sie in einen Kanal und verwende dasselbe JSON überall dort, wo der Bot eine individuelle Nachricht akzeptiert.
icon: fa-link
category: Actions
dashboard: /dashboard/embedbuilder
module: Utility
tags: [embed, embed builder, json, say, template, webhook, persona, buttons, select menu, custom message, Embed-Builder, Vorlage, Persona, Schaltflächen, Auswahlmenü, individuelle Nachricht]
related: [multigreets, chat-triggers, afk, feeds, giveaways, suggestions]
---

## Was es macht

Der Embed-Builder ist ein visueller Editor für Discord-Nachrichten. Du füllst Titel, Beschreibung, Farbe, Felder, Bilder sowie optionale Buttons oder Auswahlmenüs aus, siehst eine Live-Vorschau und erhältst am Ende einen JSON-Block. Dieses JSON ist das universelle Nachrichtenformat des Bots. Füge es in `say` ein, um es zu posten, speichere es als benannte Vorlage oder füge es in jede Funktion ein, die eine individuelle Nachricht akzeptiert, etwa Begrüßungen, Chat-Trigger, AFK-Antworten, Feed-Updates oder die Gewinner-DM bei Gewinnspielen.

Vorlagen können persönlich sein und sind dann nur für dich auf allen Servern sichtbar. Sie können auch mit einem Server geteilt werden, sodass jedes Teammitglied sie laden kann. Das Dashboard kann eine fertige Nachricht außerdem direkt in einen Kanal senden, optional über einen Webhook mit eigenem Namen und Avatar. Diesen Absender nennt man Persona.

Mitglieder bedienen den Builder nie selbst. Sie sehen nur die Nachrichten, die er erzeugt.

## Wozu du es nutzt

- Schreibe einen Regel- oder Infobeitrag mit sauberer Formatierung und aktualisiere ihn später mit `edit`.
- Gestalte eine Willkommensnachricht einmal und füge das JSON dann in Begrüßungen ein.
- Halte eine Reihe von Ankündigungsvorlagen bereit, damit das Team einheitlich aussehende Updates postet.
- Füge Buttons hinzu, die Chat-Trigger auslösen, oder ein Auswahlmenü, das über Trigger Rollen vergibt.
- Poste als „Server-News“ mit eigenem Avatar, ohne jemandem Webhook-Zugriff zu geben.

## Das JSON-Format

Der Parser sucht im Text nach der ersten `{` und liest bis zur passenden `}`. Gibt es kein JSON-Objekt oder lässt es sich nicht parsen, wird der gesamte Text als einfacher Inhalt behandelt. Eigenschaftsnamen unterscheiden nicht zwischen Groß- und Kleinschreibung.

| Schlüssel | Typ | Bedeutung |
| --- | --- | --- |
| `content` | Zeichenkette | Einfacher Text, der über den Embeds angezeigt wird |
| `embed` | Objekt | Ein einzelnes Embed. Ist es vorhanden, wird `embeds` ignoriert. |
| `embeds` | Array | Bis zu zehn Embed-Objekte |
| `components` | Array | Buttons und Auswahlmenüs |

Ein Embed-Objekt akzeptiert `title`, `description`, `url`, `color`, `author` (`name`, `url`, `icon_url`), `footer` (`text`, `icon_url`), `thumbnail` (`url`), `image` (`url`) und `fields` (Array aus `name`, `value`, `inline`). `color` kann eine Zahl oder eine Zeichenkette wie `#5865F2` sein. Feldnamen werden auf 256 Zeichen und Werte auf 1024 Zeichen gekürzt. Jede URL, die keine vollständige absolute Adresse ist, wird verworfen, ohne dass die ganze Nachricht fehlschlägt. Ein Schlüssel `timestamp` wird akzeptiert, aber nicht angezeigt.

Eine Komponente hat `row` (die Zeile, in der sie steht), `displayName` und entweder `url` für einen Link-Button oder `id` für einen Button, der an einen Chat-Trigger gebunden ist. `style` ist 1 bis 4 für die vier Discord-Button-Stile, und `emoji` ist optional. Setze `isSelect` auf true für ein Auswahlmenü und gib dann `options` an (jeweils mit `id`, `name`, `description`, `emoji`) sowie `minOptions` und `maxOptions` zwischen 0 und 25. Eine Komponente, die eine Regel verletzt, wird als deaktivierter roter Button dargestellt, dessen Beschriftung der Fehler ist. So siehst du in Discord, was schiefgelaufen ist.

> [!EXAMPLE]
> `{"content": "Welcome %user.mention%!", "embeds": [{"title": "Read the rules", "description": "See %channel.mention%", "color": "#57F287"}]}`

### Platzhalter

Der Button **%** im Builder fügt Platzhalter von der Platzhalter-Seite ein (Nutzer, Server, Kanal, Bot, Zeit und so weiter). Das Dashboard ersetzt sie nicht. Eine Nachricht, die über den Tab **Senden** verschickt wird, geht mit dem wörtlichen Text hinaus. Der Bot ersetzt sie, wenn JSON durch einen Befehl oder eine Funktion läuft, etwa bei `say`, `embedpreview`, Begrüßungen und Triggern. Jede Funktion ergänzt eigene Platzhalter, etwa `%afk.message%` oder `%giveawayitem%`, zusätzlich zu den allgemeinen.

## Vorlagen

Eine Vorlage besteht aus einem Namen und dem JSON. Es gibt zwei Geltungsbereiche.

| Geltungsbereich | Wer sie sieht | Erstellt durch |
| --- | --- | --- |
| Persönlich | Nur du, auf jedem Server und in DMs | `embedsave` oder **Speichern** im Dashboard mit deaktiviertem Teilen |
| Server-geteilt | Alle mit Zugriff auf diesem Server | `guildembedsave` (Nachrichten verwalten) oder **Speichern** mit aktiviertem **Mit allen in (Server) teilen** |

Namen müssen innerhalb eines Geltungsbereichs eindeutig sein. `embedpreview <name>` sucht zuerst deine persönliche Vorlage, danach die geteilte des Servers, ersetzt Platzhalter und postet sie im aktuellen Kanal.

Einige Befehle akzeptieren statt rohem JSON einen Verweis auf eine Vorlage: Schreibe `{template:name}` oder `{t:name}` als Nachricht. `multigreetmessage` unterstützt das. Gespeichert wird das aufgelöste JSON, nicht der Verweis. Spätere Änderungen an der Vorlage aktualisieren die Begrüßung daher nicht.

## Die Dashboard-Seite

Die Seite trägt den Titel **Discord Embed Builder** und hat sechs Tabs, dazu die Panels **Live-Vorschau** und **Probleme**. Die Schaltflächen **Rückgängig**, **Wiederholen**, **Änderungen verwerfen** und **JSON kopieren** befinden sich in der Kopfzeile.

| Tab | Was du dort tust |
| --- | --- |
| Vorlagen | Eine Vorlage aus einer Galerie mit Ausgangspunkten wählen oder **Von Grund auf starten** |
| Editor | **Nachrichteninhalt** plus bis zu zehn Embeds. Jedes Embed hat Titel, Beschreibung, URL, Farbe, Autor, Fußzeile, bis zu 25 Felder, Thumbnail und Bild, mit Zeichenzählern. |
| Komponenten | Bis zu fünf Zeilen und 25 Komponenten. Füge Buttons (Text, Stil, Emoji, URL oder Trigger) und Auswahlmenüs hinzu (Platzhalter, Optionen mit Trigger-Bindungen). |
| JSON | Die rohe Nutzlast. **Vom Builder aktualisieren** erzeugt sie neu. **Im Builder übernehmen** lädt eingefügtes JSON, entweder eine vollständige Nutzlast oder ein einzelnes Embed-Objekt. |
| Gespeichert | **Aktuelles Embed speichern** mit einem Namen und dem Teilen-Kästchen, danach Listen **In (Server) geteilt** und **Meine Embeds** mit **Laden** und **Löschen** |
| Senden | Kanal wählen, deine Berechtigungen dort prüfen, optional über einen Webhook als Persona oder mit eigenem Namen und Avatar-URL senden, danach **Nachricht senden** |

### Senden und Personas

Der Tab **Senden** listet nur Kanäle, in denen sowohl du als auch der Bot posten dürfen. Zum Senden von Embeds braucht ihr beide die Berechtigung Links einbetten. Fehlt dir die Berechtigung Jeden erwähnen, werden Erwähnungen von everyone, here und Rollen entfernt, und der Tab zeigt eine Warnung.

Zum Senden über einen Webhook brauchen du und der Bot die Berechtigung Webhooks verwalten. Eine **Persona** ist ein gespeicherter Name und Avatar, persönlich oder mit dem Server geteilt. **Verwalten** öffnet die Liste der Personas. Personas mit hochgeladenem Bild erhalten in jedem Kanal einen eigenen Webhook, daher kann ein Kanal höchstens fünfzehn davon haben. Die Option **Benutzerdefiniert** nimmt stattdessen einen Anzeigenamen und einen Avatar-Link entgegen. Jeder Versand wird im Audit-Log des Dashboards festgehalten.

Derselbe Builder öffnet sich als Popup in anderen Dashboard-Seiten (Begrüßungen, Trigger und weitere), dann aber nur mit den Tabs **Editor**, **Komponenten**, **JSON** und **Gespeichert**.

## Einstellungen

Der Builder hat keine Servereinstellungen. Alles gilt pro Nachricht oder pro Vorlage.

## Einrichtungsanleitung

1. Öffne **Embeds** im Dashboard und wähle eine Vorlage oder **Von Grund auf starten**.
2. Schreibe im **Editor** den Inhalt und fülle das Embed aus. Achte auf das Panel **Probleme** für alles, was Discord ablehnen würde.
3. Füge bei Bedarf Buttons oder Menüs unter **Komponenten** hinzu und binde jeden an einen Chat-Trigger oder eine URL.
4. Wechsle zu **Gespeichert**, gib einen Namen an, aktiviere **Mit allen in (Server) teilen**, falls das Team es verwenden soll, und drücke **Speichern**.
5. Um die Nachricht sofort zu posten, öffne **Senden**, wähle einen Kanal und drücke **Nachricht senden**. Um sie anderswo zu verwenden, drücke **JSON kopieren** und füge sie in die andere Funktion ein.
6. In Discord postet `embedpreview <name>` eine gespeicherte Vorlage mit ausgefüllten Platzhaltern.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `say [#channel] <text or JSON>` | | Nachrichten verwalten | Text oder Embed-JSON als Bot posten, mit ersetzten Platzhaltern. Eine `.txt`-Datei im Anhang kann die Nachricht liefern. |
| `edit #channel <message id> <text or JSON>` | | Nachrichten verwalten | Den Inhalt einer Nachricht ersetzen, die der Bot gesendet hat |
| `embedsave <name> <JSON>` | `esave` | Niemand | Eine persönliche Vorlage speichern |
| `embedlist` | `elist` | Niemand | Deine persönlichen Vorlagen auflisten |
| `embeddelete <name>` | `edel`, `edelete` | Niemand | Eine deiner persönlichen Vorlagen löschen |
| `guildembedsave <name> <JSON>` | `gesave`, `gembedsave` | Nachrichten verwalten | Eine mit diesem Server geteilte Vorlage speichern |
| `guildembedlist` | `gelist`, `gembedlist` | Niemand | Die geteilten Vorlagen des Servers auflisten |
| `guildembeddelete <name>` | `gedel`, `gembeddelete` | Nachrichten verwalten | Eine geteilte Vorlage löschen |
| `embedpreview <name>` | `epreview`, `eprev` | Niemand | Eine gespeicherte Vorlage im aktuellen Kanal posten |

## Tipps und Stolperfallen

- `say` übernimmt deine eigenen Erwähnungsrechte. Ohne Jeden erwähnen darf der Bot für dich nicht alle oder Rollen pingen.
- Ein Embed mit nur einem Titel und sonst nichts wird trotzdem gesendet. Das Dashboard lässt dich aber erst kopieren oder senden, wenn Titel, Beschreibung, Feld oder Inhalt vorhanden ist.
- Trigger-gebundene Buttons funktionieren nur auf dem Server, dessen Trigger-ID sie referenzieren. Lädst du eine geteilte Vorlage auf einem anderen Server, sind diese Buttons kaputt.
- Fehlerhafte URLs für Bilder, Thumbnails, Autoren und Fußzeilen werden stillschweigend verworfen. Fehlt ein Bild, prüfe, ob die URL mit `https://` beginnt.
- Discord begrenzt eine Nachricht auf zehn Embeds, 25 Felder pro Embed, fünf Komponentenzeilen und fünf Buttons pro Zeile. Der Builder erzwingt dieselben Werte.
- Das Löschen einer Persona entfernt nicht die Webhooks, die sie in Kanälen erstellt hat. Räume sie bei Bedarf in den Integrationseinstellungen des Kanals auf.

---
title: Chat-Speicher
slug: chatsaver
summary: Lade den letzten Verlauf eines Kanals ins Dashboard, lies ihn dort und bewahre benannte Schnappschüsse für später auf, oder exportiere per Befehl ein HTML-Transkript aus Discord.
icon: fa-folder
category: Security
dashboard: /dashboard/chatsaver
module: Utility
tags: [chat saver, chat log, save chat, transcript, export, archive, history, evidence, ticket transcript, Chat-Speicher, Chat-Log, Chat speichern, Transkript, Export, Archiv, Verlauf, Beweise, Ticket-Transkript]
related: [tickets, logging, auditlog]
---

## Was es macht

Der Chat-Speicher besteht aus zwei Teilen. Im Dashboard wählt das Team einen Kanal und einen Zeitraum, und der Bot ruft jede Nachricht aus diesem Zeitraum ab: Text, Autor, Anhänge und Embeds. Sie können den Verlauf auf der Seite lesen und, wenn er es wert ist, als benanntes Log speichern. Gespeicherte Logs liegen in der Datenbank des Bots und bleiben daher erhalten, auch wenn die ursprünglichen Nachrichten gelöscht werden.

In Discord führt `savechat` einen vollständigen Transkript-Export eines Kanals für die letzten Minuten, Stunden oder Tage aus und gibt dir einen Link zu einer HTML-Datei, die wie Discord aussieht und Medien enthält.

Auch Ticket-Transkripte landen hier. Wenn ein Ticket in einem Server geschlossen wird, in dem ein Kanal für Ticket-Transkripte festgelegt ist, speichert das Ticket-System die Unterhaltung als gespeichertes Log mit dem Namen `Ticket #<id> - <channel>`. Es erscheint dann unter **Gespeicherte Logs** zusammen mit allen anderen.

## Wofür du es nutzen kannst

- Beweise für einen Streit oder einen Regelverstoß sichern, bevor Leute ihre Nachrichten löschen.
- Einen Event-Kanal oder einen Ankündigungs-Thread archivieren, bevor er entfernt wird.
- Nachholen, was in einem Kanal über Nacht passiert ist, ohne in Discord zurückzuscrollen.
- Alte Ticket-Transkripte an einer Stelle lesen.

## Nachrichten abrufen

Wähle im Tab **Nachrichten abrufen** einen **Kanal**, eine **Zeitspanne** und eine **Zeiteinheit** und klicke dann auf **Nachrichten laden**. Der Bot liest den Kanal vom neuesten zum ältesten Beitrag und hört auf, sobald er Nachrichten erreicht, die älter als dein Zeitraum sind, oder 5000 Nachrichten gesammelt hat, je nachdem, was zuerst eintritt. Die Nachrichten werden im Tab **Nachrichten ansehen** vom ältesten zum neuesten angezeigt.

| Zeiteinheit | Maximum |
| --- | --- |
| Minuten | 4320 |
| Stunden | 72 |
| Tage | 3 |

Alle drei Grenzen entsprechen demselben Zeitraum von drei Tagen. Beim Abrufen wird nichts gespeichert; schließt du die Seite, ist alles weg.

## Ein Log speichern

Wenn Nachrichten geladen sind, klicke im Tab **Nachrichten ansehen** auf **Log speichern**. Das Log heißt `<channel> - <today's date>` und wird mit dem Kanal, dem Speichernden und der Nachrichtenanzahl abgelegt. Jedes gespeicherte Log enthält den Nachrichtentext, den Namen und das Avatar des Autors, den Zeitstempel, die Links zu Anhängen sowie die Titel, Beschreibungen und Vorschaubilder von Embeds.

Links zu Anhängen und Avataren verweisen auf das CDN von Discord. Entfernt Discord die Datei, funktioniert der Link im gespeicherten Log nicht mehr, der Text bleibt aber erhalten.

**HTML exportieren** neben **Log speichern** lädt die geladenen Nachrichten als eigenständiges HTML-Transkript herunter, das in deinem Browser erstellt wird. Auf dem Bot wird nichts gespeichert.

## Gespeicherte Logs

Der Tab **Gespeicherte Logs** listet jedes Log des Servers auf, das neueste zuerst, mit Kanal und Nachrichtenanzahl. Jeder Eintrag hat **Log ansehen**, **Log umbenennen** und **Log löschen**. Umbenennen ändert nur die Bezeichnung. Löschen ist endgültig und geschieht sofort, wenn du klickst; es gibt keine Bestätigungsabfrage.

Umbenennungen und Löschungen werden im Audit-Log des Dashboards vermerkt.

## Der Befehl savechat

`savechat` funktioniert anders als das Dashboard. Er führt DiscordChatExporter auf dem Host des Bots aus, schreibt eine HTML-Datei mit Medien und antwortet mit einem Link. Auf dem öffentlichen Mewdeko schickt er dir eine DM mit einem `cdn.mewdeko.tech`-Link; bei einem selbst gehosteten Bot postet er den lokalen Pfad im Kanal.

Der Zeitraum ist auf drei Tage begrenzt. Größere Werte werden abgelehnt. Der Export benötigt das konfigurierte Verzeichnis für gespeicherte Chats des Bots; existiert es nicht, bricht der Befehl mit einem Fehler ab.

> [!NOTE]
> `savechat`-Exporte erscheinen nicht unter **Gespeicherte Logs**. Es sind Dateien auf dem Host, keine Datenbankeinträge.

## Einstellungen

Der Chat-Speicher hat keine Konfiguration. Die Dashboard-Seite hat drei Tabs: **Nachrichten abrufen**, **Gespeicherte Logs** und **Nachrichten ansehen**.

| Steuerelement | Standard | Was es steuert |
| --- | --- | --- |
| Kanal | keiner | Der Textkanal, der gelesen wird |
| Zeitspanne | 1 | Wie weit zurück abgerufen wird |
| Zeiteinheit | Stunden | Minuten, Stunden oder Tage |

## Einrichtung Schritt für Schritt

1. Öffne **Chat-Speicher** im Dashboard.
2. Wähle im Tab **Nachrichten abrufen** den **Kanal** aus und stelle **Zeitspanne** und **Zeiteinheit** ein, zum Beispiel 6 Stunden.
3. Klicke auf **Nachrichten laden** und warte, bis die Nachrichtenanzahl erscheint.
4. Wechsle zu **Nachrichten ansehen**, um zu lesen, was zurückgekommen ist.
5. Klicke auf **Log speichern**, um es zu behalten. Es erscheint unter **Gespeicherte Logs**.
6. Nutze **Log umbenennen**, um ihm einen aussagekräftigen Namen zu geben, etwa den Vorfall oder das Datum.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `savechat <time> [#channel]` | | Nachrichten verwalten | Exportiert die letzte `<time>` eines Kanals als HTML, zum Beispiel `savechat 2h #general` |

## Tipps und Stolperfallen

- Der Bot muss den Kanal und seinen Nachrichtenverlauf lesen können. Kanäle, die er nicht sehen kann, liefern „Channel not found“ zurück.
- Das Abrufen stoppt bei 5000 Nachrichten. Verwende für einen sehr belebten Kanal einen kürzeren Zeitraum.
- Nachrichtenbearbeitungen und Löschungen, die vor dem Abrufen passiert sind, sind nicht sichtbar; der Bot liest, was zu diesem Zeitpunkt im Kanal steht. Für eine Live-Aufzeichnung nutze die Protokollierung.
- Gespeicherte Logs speichern Autorennamen so, wie sie zum Zeitpunkt des Speicherns waren. Eine spätere Namensänderung wird nicht übernommen.
- Jeder mit Dashboard-Zugriff auf den Server kann gespeicherte Logs lesen, einschließlich Ticket-Transkripten. Schränke den Dashboard-Zugriff entsprechend ein.
- `savechat` ist für das CDN des öffentlichen Bots gedacht. Selbst Hosting-Betreiber müssen in den Zugangsdaten einen Pfad für gespeicherte Chats festlegen und die DiscordChatExporter-Dateien neben dem Bot ablegen.

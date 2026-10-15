---
title: Repeater
slug: repeaters
summary: Poste eine Nachricht nach Zeitplan in einem Kanal, wenn der Kanal aktiv oder ruhig ist, oder halte sie als Sticky-Nachricht immer unten angeheftet.
icon: fa-sync
category: Actions
dashboard: /dashboard/repeaters
module: Utility
tags: [repeater, sticky, sticky message, recurring, scheduled message, auto post, reminder, forum sticky, Wiederholung, angeheftet, geplante Nachricht, automatischer Beitrag, Erinnerung, Forum-Sticky]
related: [utility, embedbuilder]
---

## Was es macht

Ein Repeater ist eine Nachricht, die der Bot immer wieder in einem Kanal postet. Der klassische Anwendungsfall ist eine zeitgesteuerte Erinnerung: „Lest die Regeln“ alle sechs Stunden. Jedes Mal, wenn sie ausgelöst wird, löscht der Bot zuerst seine vorherige Kopie, sodass der Kanal nie mit Duplikaten voll wird und die Nachricht immer weiter unten steht.

Repeater haben fünf Auslösemodi. Neben einem festen Intervall können sie direkt auslösen, sobald jemand anderes etwas postet (eine echte Sticky-Nachricht), nach einer bestimmten Anzahl an Nachrichten, wenn der Kanal aktiv ist oder wenn er ruhig geworden ist. Optionale Zeitfenster begrenzen sie auf Geschäftszeiten, Abende oder Wochenenden in der Zeitzone deines Servers, und Forum-Repeater können automatisch in jeden neuen Thread posten.

Die Nachricht unterstützt den vollständigen Embed-Builder, reinen Text, Komponenten und die allgemeinen Platzhalter, sodass ein Repeater eine aufwendige Ankündigung sein kann und nicht nur eine Textzeile. Erwähnungen bleiben nur erhalten, wenn die Person, die den Repeater erstellt, die Berechtigung Alle erwähnen hat; andernfalls werden sie entschärft.

## Wofür du es verwenden würdest

- Die Regeln oder einen Hinweis „So bekommst du Hilfe“ unten in einem belebten Kanal angeheftet halten.
- Eine tägliche Event-Erinnerung um 18:00 Uhr Serverzeit posten.
- Die Beitragsrichtlinien in jeden neuen Forum-Thread setzen, gefiltert nach Tag.
- Einen toten Kanal mit einem Gesprächsanstoß wiederbeleben, wenn er eine Stunde lang ruhig war.
- Eine Aktion nur während der Geschäftszeiten und nur für die nächsten sieben Tage laufen lassen.

## Auslösemodi

| Modus | Wann er postet |
| --- | --- |
| Zeitintervall | In jedem Intervall, optional an eine Startuhrzeit ausgerichtet. Standardmodus. |
| Sofort | Postet einmal und erneut, sobald seine Nachricht nicht mehr die letzte im Kanal ist. |
| Nach Nachrichten | Postet, sobald seit der letzten Auslösung die Schwelle an gesendeten Nachrichten erreicht ist. |
| Bei Aktivität | Postet, wenn der Kanal aktiv ist: Die Schwelle wird mit dem jüngsten Verkehr im Zeitfenster verglichen. |
| Bei keiner Aktivität | Postet, wenn im Kanal während des gesamten Zeitfensters keine Nachrichten gesendet wurden. |

Aktivitätsbasierte Modi werden einmal pro Minute geprüft und benötigen auf dem Server aktivierte Nachrichtenzählung. Das Intervall muss zwischen fünf Sekunden und 25000 Minuten liegen. Der Standard sind fünf Minuten, oder ein Tag, wenn du eine Uhrzeit angibst und kein Intervall. **Aktivitätsschwelle** hat standardmäßig 5 Nachrichten, **Zeitfenster** standardmäßig fünf Minuten; der Bereich des Zeitfensters liegt zwischen dreißig Sekunden und sechs Stunden.

## Bedingungen und Grenzen

- **Nicht wiederholen, wenn die Nachricht bereits die letzte im Kanal ist** (Redundanz): Der Bot überspringt einen Durchlauf, wenn seine letzte Kopie noch die neueste Nachricht ist.
- **Gesprächserkennung**: Wenn in der letzten Minute drei oder mehr Nachrichten eingegangen sind, wird der Durchlauf verzögert und nach dreißig Sekunden erneut geprüft.
- **Zeitplan**: `business` bedeutet montags bis freitags 09:00 bis 17:00 Uhr, `evening` bedeutet täglich 18:00 bis 23:00 Uhr, `weekend` bedeutet ganztägig Samstag und Sonntag. Die Zeiten richten sich nach der Serverzeitzone; lege zuerst eine fest, sonst geht der Bot von UTC aus und erinnert dich daran.
- **Automatisch löschen nach** und **Max. Anzeigen**: Der Repeater entfernt sich selbst nach einem maximalen Alter oder einer Anzahl an Beiträgen.
- **Benachrichtigungen unterdrücken**: Die Nachricht wird lautlos gesendet, damit sie niemandes Gerät benachrichtigt.
- **Priorität** wird pro Repeater als 0 bis 100 gespeichert, Standard 50, und wird in der Liste angezeigt.

## Threads und Foren

- **In neuen Threads automatisch erstellen**: Wird unter dem Kanal des Repeaters ein Thread erstellt, postet der Bot die Nachricht im Thread und hält sie unten, während Mitglieder antworten.
- **Nur-Thread-Modus**: Der Repeater postet nie im übergeordneten Kanal, nur in Threads. Das ist nötig, wenn das Ziel ein Forum-Kanal ist.
- **Forum-Tag-Filter**: Erforderliche und ausgeschlossene Tags entscheiden, welche Forenbeiträge die Sticky-Nachricht erhalten.

## Platzhalter

Die Nachricht durchläuft den allgemeinen Platzhalter-Satz. Die Benutzerplatzhalter beziehen sich auf den Bot selbst, da niemand einen Repeater auslöst. Nützliche sind:

| Platzhalter | Wert |
| --- | --- |
| `%server%`, `%server.name%` | Servername |
| `%server.members%` | Zwischengespeicherte Mitgliederanzahl |
| `%server.id%`, `%server.icon%` | Server-ID und Icon-URL |
| `%channel%`, `%channel.name%` | Erwähnung und Name des Repeater-Kanals |
| `%bot.name%`, `%bot.avatar%` | Name und Avatar des Bots |
| `%server.time%`, `%time.day%` | Serverzeit und aktueller Wochentag |

Reaktions-GIF-Platzhalter wie `%huggif%` werden ebenfalls ersetzt. Auslöser-Platzhalter wie `%user%` werden auf den Bot aufgelöst.

## Einstellungen

Die Repeater-Seite hat drei Reiter: **Übersicht**, **Repeater verwalten** und **Neu erstellen**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Zielkanal | keiner | Text- oder Forum-Kanal, in dem gepostet wird |
| Forum-Tag-Filter | keiner | Erforderliche und ausgeschlossene Tags, nur für Forum-Kanäle |
| Nachrichteninhalt | keiner | Öffnet den Embed-Builder |
| Trigger-Modus | Zeitintervall | Einer der fünf Modi |
| Wiederholen alle | 5 Minuten | Voreinstellungen von 1 Minute bis Täglich, oder ein eigenes `HH:MM:SS` |
| Nicht wiederholen, wenn die Nachricht bereits die letzte im Kanal ist | Aus | Redundanzprüfung |
| Erwähnungen von @everyone und @here erlauben | Aus | Massenerwähnungen in der Nachricht belassen statt sie zu entschärfen |
| Priorität (0-100) | 50 | Der Prioritätswert, der in der Liste angezeigt wird |
| Warteschlangenposition | 0 | Gespeicherter Sortierwert |
| Startzeit (HH:MM) | keine | Uhrzeit, an der ein Zeitintervall-Repeater ausgerichtet wird |
| Gesprächserkennung | Aus | Verzögerung, während Leute miteinander reden |
| Benachrichtigungen unterdrücken | Aus | Lautlos senden |
| In neuen Threads automatisch erstellen | Aus | Sticky im Thread, nur für Forum-Kanäle |
| Nur-Thread-Modus | Aus | Den übergeordneten Kanal überspringen, nur für Forum-Kanäle |
| Automatisch löschen nach (Tagen) | keiner | Maximales Alter als `d.hh:mm:ss`, zum Beispiel `7.00:00:00` |
| Max. Anzeigen | unbegrenzt | Anzahl der Beiträge vor dem Entfernen |
| Zeitplan | keiner | Voreinstellungs-Buttons oder ein eigener Zeitplan |
| Aktivitätsschwelle / benötigte Nachrichten | 5 | Nachrichten für die Aktivitätsmodi |
| Zeitfenster | 00:05:00 | Zeitfenster für die Aktivitätsmodi |

**Übersicht** zeigt Gesamtwerte, die Anzahl aktiver Repeater, Gesamtanzeigen, eine Aufschlüsselung nach Trigger-Modus und die aktivsten Repeater. **Repeater verwalten** listet jeden Repeater mit **Bearbeiten**, **Jetzt auslösen** und **Löschen** auf, dazu eine Schnellbearbeitung für Intervall, Schwelle, maximales Alter und maximale Auslösungen.

## Einrichtung Schritt für Schritt

1. Öffne **Repeater** im Dashboard und wähle **Neu erstellen**.
2. Wähle den **Zielkanal**. Bei einem Forum aktivierst du **Nur-Thread-Modus** und setzt die **Forum-Tag-Filter**.
3. Klicke auf das Feld **Nachrichteninhalt** und baue die Nachricht im Embed-Builder.
4. Wähle einen **Trigger-Modus**. Für eine Sticky-Nachricht wähle Sofort; für eine Erinnerung Zeitintervall mit einer Voreinstellung unter **Wiederholen alle**.
5. Öffne **Erweiterte Optionen**, wenn du Redundanz, stilles Senden, einen Zeitplan oder ein Ablaufdatum möchtest.
6. Klicke auf **Repeater erstellen** und nutze dann im Reiter Verwalten **Jetzt auslösen**, um ihn zu testen.

> [!NOTE]
> Zeitpläne benötigen eine Serverzeitzone. Lege sie mit dem Zeitzonen-Befehl fest, bevor du die Zeitfenster Geschäftszeiten, Abend oder Wochenende aktivierst.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Alle benötigen die Berechtigung Nachrichten verwalten. Repeater werden über ihre Nummer aus `repeatlist` angesprochen.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `repeat [time] [interval] <message>` | | Nachrichten verwalten | Einen Repeater im aktuellen Kanal erstellen, zum Beispiel `repeat 6h Read the rules` oder `repeat 18:00 Event tonight` |
| `repeatlist` | `replst`, `replist`, `repli` | Nachrichten verwalten | Repeater mit Kanal, Modus, Intervall und nächstem Durchlauf auflisten |
| `repeatinvoke <index>` | `repinv` | Nachrichten verwalten | Einen Repeater sofort auslösen und seinen Timer neu starten |
| `repeatremove <index>` | `reprm` | Nachrichten verwalten | Einen Repeater löschen |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Nachrichten verwalten | Aktivieren oder deaktivieren, ohne zu löschen |
| `repeatmessage <index> <message>` | `repmsg` | Nachrichten verwalten | Die Nachricht ersetzen |
| `repeatchannel <index> [#channel]` | `repchan` | Nachrichten verwalten | In einen Text- oder Forum-Kanal verschieben |
| `repeatredundant <index>` | `repeatredun`, `repred` | Nachrichten verwalten | Die Redundanzprüfung umschalten |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Nachrichten verwalten | `timeinterval`, `immediate`, `aftermessages`, `onactivity` oder `onnoactivity` |
| `repeatactivity <index> <threshold> <window>` | `repactivity`, `repact` | Nachrichten verwalten | Aktivitätsschwelle und Zeitfenster festlegen, zum Beispiel `10 5m` |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Nachrichten verwalten | Den Prioritätswert festlegen |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Nachrichten verwalten | `business`, `evening`, `weekend` oder `none` zum Entfernen |
| `repeatconversation <index>` | `repconversation`, `repconv` | Nachrichten verwalten | Gesprächserkennung umschalten |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Nachrichten verwalten | Stilles Senden umschalten |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Nachrichten verwalten | Das Posten in neuen Threads umschalten |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Nachrichten verwalten | Den Nur-Thread-Modus umschalten |
| `repeatforumtags <index> <add/remove/clear/list> [required/excluded] [tags]` | `repforumtags`, `repftags` | Nachrichten verwalten | Forum-Tag-Filter über die Tag-ID verwalten |

## Tipps und Stolperfallen

- Der Bot braucht Nachrichten senden, Links einbetten und Nachrichten verwalten im Kanal, da er seine vorherige Kopie löscht, bevor er erneut postet.
- Wird der Kanal gelöscht oder verliert der Bot den Zugriff, entfernt sich der Repeater selbst.
- Repeater werden kurz nach dem Start des Bots geladen. Befehle tun bis dahin stillschweigend nichts.
- Der Sofort-Modus postet bei jeder Nachricht von jemand anderem erneut, also vermeide ihn in sehr schnellen Kanälen oder kombiniere ihn mit der Gesprächserkennung.
- Nur ein Mitglied mit der Berechtigung Alle erwähnen kann einen Repeater erstellen, der alle oder eine Rolle pingt; andernfalls wird die Erwähnung maskiert.
- Die aktivitätsbasierten Modi hängen von der Nachrichtenzählung ab. Aktiviere sie, bevor du die Modi wechselst, sonst lehnt der Befehl den Wechsel ab.
- Das Ablaufdatum über Max. Anzeigen zählt jeden Beitrag mit, auch die, die du von Hand auslöst.

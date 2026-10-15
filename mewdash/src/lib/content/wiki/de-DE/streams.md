---
title: Stream-Benachrichtigungen
slug: streams
summary: Folge Streamern auf Twitch, YouTube, Kick und Picarto und poste eine Ankündigung in einem Kanal deiner Wahl, wenn sie live gehen oder offline gehen.
icon: fa-video
category: Community
dashboard: /dashboard/streams
module: Searches
tags: [streams, stream alerts, go live, live notifications, twitch, youtube, kick, picarto, trovo, streamadd, streamtemplate, Streams, Stream-Benachrichtigungen, live gehen, Live-Benachrichtigungen, Stream hinzufügen, Stream-Vorlage]
related: [twitch, utility, administration]
---

## Was es macht

Das Team fügt eine Stream-URL ein und wählt einen Discord-Kanal. Der Bot fragt dann die Plattform dieses Streamers ab und postet, sobald der Stream von offline auf online wechselt, eine Live-Nachricht im gewählten Kanal. Standardmäßig ist das ein Embed mit dem Namen des Streamers als Link zum Stream, dem Stream-Titel, dem Spiel oder der Kategorie, der Zuschaueranzahl, dem Avatar des Streamers und einem Vorschaubild.

Du kannst das Standard-Embed durch eine eigene Nachricht ersetzen. Es gibt eine serverweite Vorlage, die für alle gefolgten Streams gilt, und jeder Stream kann außerdem eine eigene Online-Nachricht und eine eigene Offline-Nachricht haben. Alle akzeptieren die unten aufgeführten `%stream.*%`-Platzhalter und können reiner Text oder ein vollständiges Embed sein, das im Embed-Editor des Dashboards gebaut wird.

Offline-Hinweise sind standardmäßig aus. Aktivierst du sie, postet der Bot auch dann, wenn ein gefolgter Stream endet: mit der Offline-Nachricht des Streams, falls eine gesetzt ist, andernfalls mit der Servervorlage, andernfalls mit dem Standard-Embed, das „Offline“ anzeigt.

> [!NOTE]
> Stream-Benachrichtigungen kündigen die Streams anderer Leute in deinem Discord an. Die separate Funktion Twitch-Bot verbindet den Bot mit deinem eigenen Twitch-Chat für Befehle, Timer und Ereignisse. Dafür siehe den Artikel zum Twitch-Bot.

## Wofür du es verwenden würdest

- Ein Community-Server möchte einen Kanal „Jetzt live“, der aufleuchtet, sobald einer seiner Creator zu streamen beginnt.
- Der Discord eines Streamers möchte eine automatische Erwähnung mit Titel und Kategorie, damit niemand sie von Hand posten muss.
- Ein Esport- oder Event-Server folgt mehreren Turnier-Kanälen auf Twitch und Kick an einem Ort.
- Ein Server möchte eine saubere Meldung „Stream beendet“, damit der Live-Beitrag nicht veraltet wirkt.

## Unterstützte Plattformen

Der Bot wählt die Plattform anhand der URL, die du angibst. Nur URLs, die einem dieser Muster entsprechen, können gefolgt werden.

| Plattform | URL-Format | Hinweise |
| --- | --- | --- |
| Twitch | `twitch.tv/username` | Nutzt die Twitch-Helix-API. Titel, Spiel, Zuschauer, Avatar und Vorschau werden alle gefüllt. |
| YouTube | `youtube.com/@handle` oder `youtube.com/channel/ID` | Wird durch Auslesen der Live-Seite des Kanals gelesen, daher können die Daten unvollständiger sein als bei Twitch. Eine URL mit Kanal-ID wird in den Handle umgewandelt. |
| Kick | `kick.com/slug` | Nutzt die öffentliche Kick-API. Der Platzhalter für den Avatar wird mit dem Kanal-Banner gefüllt. |
| Picarto | `picarto.tv/name` | Nutzt die Picarto-API. |

Trovo und Facebook erscheinen in der Plattformliste im Dashboard und in den gespeicherten Daten, aber im aktuellen Code gibt es für Trovo keinen funktionierenden URL-Abgleich und für Facebook keinen Anbieter. Diese URLs werden daher abgelehnt, wenn du versuchst, ihnen zu folgen.

## So funktioniert die Prüfung

Der Bot führt pro Plattform einen Tracker und fragt in einer Schleife bei jeder Plattform den Status jedes gefolgten Kanals ab, mit drei Sekunden Pause zwischen den Runden. Ein Stream wird als online angekündigt, sobald er zum ersten Mal live gesehen wird, nachdem er offline war.

Das Offline-Gehen wird sorgfältiger behandelt, weil Twitch während eines Live-Streams manchmal ein kurzes Offline-Flackern meldet. Ein Stream muss in zwei aufeinanderfolgenden Prüfungen als offline gesehen werden, bevor der Offline-Hinweis gesendet wird. Ist er dazwischen wieder online, wird nichts gepostet.

Alle dreißig Minuten sucht der Bot nach Streams, deren Abfragen der Plattform seit mehr als zwölf Stunden fehlschlagen, zum Beispiel gelöschte oder umbenannte Kanäle, und entfernt sie von allen Servern, die ihnen folgten.

Wurde der Benachrichtigungskanal eines gefolgten Streams gelöscht, wird der Stream beim nächsten Ausführen von `streamlist` entfernt.

## Die Nachricht, die gesendet wird

Ändert ein Stream seinen Status, wählt der Bot eine Nachricht in dieser Reihenfolge:

1. Die eigene **Online-Nachricht** oder **Offline-Nachricht** des Streams, je nachdem, welcher Status zutrifft.
2. Die serverweite **Globale Stream-Nachricht**-Vorlage.
3. Das eingebaute Embed.

Eine Nachricht pro Stream, die kein gültiges Embed-JSON ist, wird als reiner Text über dem eingebauten Embed gepostet. Eine globale Vorlage, die kein Embed-JSON ist, wird als reiner Text allein gepostet. Nachrichten, die gültiges Embed-JSON sind, wie es der Embed-Builder des Dashboards erzeugt, werden genau so gesendet, wie sie entworfen wurden, einschließlich Buttons.

Das eingebaute Embed hat den Namen des Streamers als verlinkten Titel, den Titel des Streams als Autorenzeile, ein Feld **Status** mit Online oder Offline, ein Feld **Zuschauer**, ein Feld **Streamt** für das Spiel oder die Kategorie, den Avatar als Miniaturbild und die Vorschau als großes Bild. Es ist grün, während der Stream läuft, und rot, wenn er offline ist.

### Platzhalter

In Stream-Nachrichten wird nur dieser Satz ersetzt. Die allgemeinen Server- und Benutzerplatzhalter von der Platzhalter-Seite sind hier nicht verfügbar.

| Platzhalter | Wert |
| --- | --- |
| `%stream.name%` | Anzeigename des Streamers oder `Unknown` |
| `%stream.username%` | Login-Name oder Handle des Streamers |
| `%stream.url%` | Direkter Link zum Stream, immer mit `https://` |
| `%stream.title%` | Aktueller Stream-Titel oder `No title` |
| `%stream.game%` | Spiel oder Kategorie oder `No category` |
| `%stream.viewers%` | Zuschaueranzahl mit Tausendertrennzeichen oder `-`, wenn offline |
| `%stream.platform%` | Name der Plattform, etwa `Twitch` oder `Youtube` |
| `%stream.avatar%` | URL des Avatars des Streamers |
| `%stream.preview%` | URL der Stream-Vorschau oder des Miniaturbilds |
| `%stream.status%` | `Online` oder `Offline`, jeweils mit einem farbigen Kreis davor |
| `%stream.channelid%` | Plattformspezifische Kanal-ID, sofern die Plattform eine bereitstellt |

> [!EXAMPLE]
> Eine einfache globale Vorlage: `%stream.name% is live on %stream.platform% playing %stream.game%: %stream.title% %stream.url%`

## Einstellungen

Die Seite Stream-Benachrichtigungen hat vier Reiter: **Streams**, **Stream folgen**, **Einstellungen** und **Statistiken**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Benachrichtigungskanal | keiner | Der Kanal, in den die Meldungen eines neuen Streams gehen, ausgewählt unter **Stream folgen** |
| Stream-URL | keine | Der Link, dem gefolgt wird, unter **Stream folgen** |
| Online-Nachricht | keine | Nachricht pro Stream, wenn er live geht; bearbeitet über die Karte des Streams unter **Streams** |
| Offline-Nachricht | keine | Nachricht pro Stream, wenn er endet; bearbeitet über dieselbe Karte |
| Globale Stream-Nachricht | keine | Serverweite Vorlage, die verwendet wird, wenn ein Stream keine eigene Nachricht hat, unter **Einstellungen** |
| Offline-Benachrichtigungen | Aus | Ob der Bot postet, wenn gefolgte Streams offline gehen, unter **Einstellungen** |

**Streams** listet jeden gefolgten Stream mit Plattform, Kanal und Datum der Hinzufügung auf, mit einem Löschen-Button auf jeder Karte und einem Button **Alle leeren**. **Statistiken** zeigt die Gesamtzahl der Streams, eindeutige Streamer, Kanäle mit Benachrichtigungen, verwendete Plattformen und eine Aufschlüsselung nach Plattform.

Ein Server kann höchstens zehn Streams folgen. Ein elfter Eintrag schlägt fehl.

## Einrichtung Schritt für Schritt

1. Öffne **Stream-Benachrichtigungen** im Dashboard und wechsle zum Reiter **Stream folgen**.
2. Wähle den **Benachrichtigungskanal**, füge die **Stream-URL** ein und klicke auf **Stream folgen**.
3. Baue unter **Einstellungen** eine **Globale Stream-Nachricht** im Embed-Editor mit den oben genannten Platzhaltern und klicke dann auf **Nachricht speichern**. Überspringe das, wenn du beim eingebauten Embed bleiben möchtest.
4. Aktiviere **Offline-Benachrichtigungen**, wenn du zusätzlich Beiträge „Stream beendet“ möchtest.
5. Zurück unter **Streams** öffnest du die Karte eines Streams, um ihm eine eigene **Online-Nachricht** oder **Offline-Nachricht** zu geben, wenn er etwas anderes braucht als die globale Vorlage.
6. Teste mit `streamcheck <url>`, ob der Bot den Stream lesen kann, und warte dann auf den nächsten Live-Start.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `streamadd <url>` | `sta`, `stadd` | Nachrichten verwalten | Einem Stream folgen und seine Meldungen in den aktuellen Kanal senden |
| `streamremove <index>` | `strm` | Nachrichten verwalten | Dem Stream an dieser Position in `streamlist` nicht mehr folgen |
| `streamsclear` | `stclear` | Administrator | Jedem Stream auf dem Server nicht mehr folgen |
| `streamlist` | `stl`, `streamslist` | Niemand | Seitenweise Liste der gefolgten Streams mit ihren Nummern, Plattformen und Kanälen |
| `streamoffline` | `sto`, `stoff` | Nachrichten verwalten | Offline-Benachrichtigungen umschalten |
| `streammessage <index> <message>` | `stm`, `stmsg` | Nachrichten verwalten | Die Online-Nachricht eines Streams setzen; eine leere Nachricht setzt sie zurück |
| `streamofflinemessage <index> <message>` | `stofmsg`, `stoffline` | Nachrichten verwalten | Die Offline-Nachricht eines Streams setzen; eine leere Nachricht setzt sie zurück |
| `streamtemplate [template]` | `stt`, `sttemplate` | Nachrichten verwalten | Die globale Vorlage und Platzhalter anzeigen, eine neue setzen oder `reset` zum Leeren verwenden |
| `streamcheck <url>` | `stc` | Niemand | Melden, ob ein Stream gerade live ist, und seine Zuschaueranzahl |

## Tipps und Stolperfallen

- `streamadd` verwendet den Kanal, in dem du es ausführst. Nutze das Dashboard, wenn du einen anderen Kanal wählen möchtest.
- Stream-Nummern stammen aus `streamlist` und beginnen bei 1. Sie verschieben sich, wenn ein Stream entfernt wird, also prüfe die Liste, bevor du nach Nummer entfernst.
- Der Bot braucht Nachrichten senden und Links einbetten im Benachrichtigungskanal. Meldungen an einen Kanal, den er nicht sehen kann, werden mit einem Log-Eintrag übersprungen.
- Ist auf deinem Server der Twitch-Bot mit einem Live-Kanal für denselben Twitch-Kanal verbunden, übernimmt diese Integration, und die Stream-Benachrichtigungen bleiben dafür stumm, sodass du keine doppelten Beiträge bekommst.
- YouTube-Daten werden ausgelesen statt über eine API bezogen. Titel, Kategorien und Zuschauerzahlen können fehlen oder als `Live Stream` erscheinen.
- Streams, deren Abfragen zwölf Stunden lang fehlschlagen, werden automatisch entfernt. Benennt ein Streamer seinen Kanal um, folge der neuen URL.

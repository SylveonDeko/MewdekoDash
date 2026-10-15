---
title: Status-Rollen
slug: statusroles
summary: Rollen automatisch vergeben oder entziehen, wenn der benutzerdefinierte Status eines Mitglieds einen bestimmten Text enthält, und optional in einem Kanal ankündigen.
icon: fa-user-circle
category: Actions
dashboard: /dashboard/statusroles
module: StatusRoles
tags: [status roles, custom status, vanity, auto role, presence, role automation, status text, Status-Rollen, benutzerdefinierter Status, Vanity, Auto-Rolle, Präsenz, Rollenautomatisierung, Statustext]
related: [administration, afk]
---

## Was es macht

Das Team fügt einen oder mehrere Texte hinzu, nach denen gesucht werden soll, zum Beispiel `discord.gg/yourserver` oder `playing minecraft`. Der Bot beobachtet Präsenz-Updates. Beginnt der benutzerdefinierte Status eines Mitglieds, diesen Text zu enthalten, entfernt der Bot die Rollen unter **Zu entfernende Rollen**, fügt die Rollen unter **Hinzuzufügende Rollen** hinzu und postet, falls ein Kanal und eine Nachricht festgelegt sind, dort eine Benachrichtigung.

Verschwindet der Text danach wieder aus dem Status, entscheiden zwei Schalter, was passiert. **Hinzugefügte entfernen** nimmt die vergebenen Rollen wieder weg. **Entfernte wieder hinzufügen** gibt die entzogenen Rollen zurück. Beide sind standardmäßig aus. Ohne Änderungen behält das Mitglied also einfach die Rollen, die es am Ende hat.

Geprüft wird nur der benutzerdefinierte Status, also der Text, den du unter „Benutzerdefinierten Status festlegen“ in Discord eingibst. Spiel-, Spotify- und Streaming-Aktivitäten werden ignoriert. Mitglieder, die offline oder unsichtbar sind, werden übersprungen. Der Abgleich ist eine einfache Teilstring-Prüfung. `mewdeko` trifft also auf `I love mewdeko` zu, ist aber groß- und kleinschreibungsabhängig.

Jeder Server kann beliebig viele Status-Rollen-Einträge haben, jeweils mit eigenen Rollen, eigenem Kanal und eigener Nachricht. Befehle verweisen auf einen Eintrag über seinen Index, also die Nummer, die `liststatusroles` anzeigt.

## Warum du es nutzen würdest

- Mitglieder belohnen, die deine Vanity-Einladung in ihrem Status tragen, mit einer Unterstützerrolle und deren Vorteilen.
- Eine Rolle „Streamt“ oder „Sucht Mitspieler“ vergeben, solange jemand dafür im Status wirbt, und sie wieder entfernen, sobald er damit aufhört.
- In einem Kanal ankündigen, wenn ein Mitglied beginnt, den Server im Status zu repräsentieren, damit das Team sich bedanken kann.
- Während ein Status aktiv ist, eine Rolle gegen eine andere tauschen, zum Beispiel ein Mitglied aus der Rolle „Keine Pings“ nehmen, solange es einen bestimmten Status zeigt.

## Abgleich und Rollenänderungen

| Situation | Was der Bot tut |
| --- | --- |
| Status bekommt den überwachten Text | Entfernt **Zu entfernende Rollen**, fügt **Hinzuzufügende Rollen** hinzu und sendet die Benachrichtigung, falls eingerichtet |
| Status enthält den überwachten Text weiterhin | Nichts, die Änderung wird nur einmal verarbeitet |
| Status verliert den überwachten Text, **Hinzugefügte entfernen** ist an | Entfernt alle **Hinzuzufügenden Rollen**, die das Mitglied noch hat |
| Status verliert den überwachten Text, **Entfernte wieder hinzufügen** ist an | Gibt alle **Zu entfernenden Rollen** zurück, die das Mitglied nicht mehr hat |
| Mitglied geht offline oder unsichtbar | Nichts, die Rollen bleiben, wie sie sind |

Der Bot vergleicht jedes Präsenz-Update mit dem zuletzt zwischengespeicherten Status dieses Nutzers. Ein Mitglied, das einen unbeteiligten Teil seines Status ändert, wird daher nicht erneut verarbeitet. Der überwachte Text muss pro Server eindeutig sein. Die Befehle begrenzen ihn auf 128 Zeichen, das Dashboard nicht.

## Die Benachrichtigungsnachricht

Hat ein Eintrag sowohl einen **Benachrichtigungskanal** als auch eine **Benachrichtigungsnachricht**, postet der Bot die Nachricht dort jedes Mal, wenn der Status eines Mitglieds zu passen beginnt. Der Text durchläuft den Embed-Parser, daher funktioniert alles, was der Embed-Builder erzeugt, einschließlich reinem Text, bis zu zehn Embeds und Komponenten. Passt der Status nicht mehr, wird nichts gepostet.

### Platzhalter

Die Nachricht durchläuft den Standard-Ersetzungssatz für das Mitglied, den Benachrichtigungskanal und den Server. Die nützlichsten stehen unten. Die vollständige Liste findest du auf der Platzhalterseite unter Nutzer, Server, Kanal, Bot und Zeit.

| Platzhalter | Wert |
| --- | --- |
| `%user.mention%` | Eine Erwähnung des Mitglieds |
| `%user.name%` | Der Nutzername des Mitglieds |
| `%user.fullname%` | Nutzername mit Discriminator |
| `%user.avatar%` | Die Avatar-URL des Mitglieds |
| `%user.id%` | Die Nutzer-ID des Mitglieds |
| `%server.name%` | Servername |
| `%server.icon%` | URL des Server-Icons |
| `%channel.mention%` | Erwähnung des Benachrichtigungskanals |
| `%server.time%` | Aktuelle Uhrzeit in der konfigurierten Zeitzone des Servers |

> [!NOTE]
> Der Editor im Dashboard listet einen Platzhalter `%status%`, aber der Bot ersetzt ihn nicht. Schreib den Statustext selbst in die Nachricht.

> [!EXAMPLE]
> `%user.mention% repräsentiert den Server jetzt in seinem Status, danke!`

## Einstellungen

Alles liegt auf der Seite Status-Rollen, die drei Tabs hat: **Status-Rollen**, **Neu hinzufügen** und **Statistiken**. Jeder Eintrag in der Liste klappt auf und zeigt seine Einstellungen.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Zu überwachender Statustext | keiner | Der Text, den ein benutzerdefinierter Status enthalten muss. Im Dashboard ohne Längenbegrenzung, über Befehle 128 Zeichen |
| Hinzuzufügende Rollen | keine | Durch Leerzeichen getrennte Rollen-IDs, die vergeben werden, wenn der Status passt. Speichern ersetzt die ganze Liste |
| Zu entfernende Rollen | keine | Durch Leerzeichen getrennte Rollen-IDs, die entfernt werden, wenn der Status passt. Speichern ersetzt die ganze Liste |
| Benachrichtigungskanal | keiner | Kanal, der die Benachrichtigungsnachricht erhält |
| Benachrichtigungsnachricht | keine | Text oder Embed, der mit Platzhaltern in den Kanal gesendet wird |
| Hinzugefügte entfernen | aus | Die hinzugefügten Rollen wieder entfernen, wenn der Status nicht mehr passt |
| Entfernte wieder hinzufügen | aus | Die entfernten Rollen zurückgeben, wenn der Status nicht mehr passt |

Der Tab **Statistiken** zeigt die Gesamtzahl der Einträge, wie viele davon Rollen ändern und wie viele einen Benachrichtigungskanal haben.

## Einrichtung

1. Öffne **Status-Rollen** im Dashboard und wechsle zum Tab **Neu hinzufügen**.
2. Gib den Text ein, nach dem gesucht werden soll, und drücke **Status-Rolle hinzufügen**.
3. Wechsle zum Tab **Status-Rollen** und klappe den neuen Eintrag auf.
4. Drücke **Einstellungen bearbeiten**, füge Rollen-IDs in **Hinzuzufügende Rollen** und **Zu entfernende Rollen** ein, wähle einen **Benachrichtigungskanal** und schreibe, falls gewünscht, eine **Benachrichtigungsnachricht**. Dann drückst du **Speichern**.
5. Nutze die beiden Schalter am Eintrag, um **Hinzugefügte entfernen** und bei Bedarf **Entfernte wieder hinzufügen** einzuschalten.
6. Teste es: Setze deinen eigenen benutzerdefinierten Status auf den Text und prüfe, ob die Rolle erscheint. Lösche ihn dann und prüfe, ob die Rolle wieder entfernt wird.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Jeder Befehl benötigt Server verwalten. `<index>` ist die Nummer, die `liststatusroles` anzeigt, beginnend bei 1. Slash-Versionen liegen unter `/statusroles`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `addstatusrole <text>` | `asr` | Server verwalten | Einen Statustext zum Überwachen hinzufügen |
| `removestatusrole <index>` | `rsr` | Server verwalten | Einen Eintrag löschen |
| `liststatusroles` | `lsr` | Server verwalten | Alle Einträge mit Index und Einstellungen durchblättern |
| `setaddroles <index> <@role...>` | `sar` | Server verwalten | Rollen zur Liste hinzufügen, die vergeben wird, wenn der Status passt |
| `setremoveroles <index> <@role...>` | `srr` | Server verwalten | Rollen zur Liste hinzufügen, die entfernt wird, wenn der Status passt |
| `removeaddroles <index> <@role...>` | `remar` | Server verwalten | Rollen von der Liste „Hinzuzufügende Rollen“ entfernen |
| `removeremoveroles <index> <@role...>` | `rmremoveroles` | Server verwalten | Rollen von der Liste „Zu entfernende Rollen“ entfernen |
| `setstatusrolechannel <index> <#channel>` | `statusrolechannel`, `ssrc` | Server verwalten | Den Benachrichtigungskanal festlegen |
| `setstatusroleembed <index> [text]` | `statusroleembed`, `asre` | Server verwalten | Die Benachrichtigungsnachricht festlegen, oder ohne Text die aktuelle anzeigen |
| `toggleremoveadded <index>` | `togglerma` | Server verwalten | **Hinzugefügte entfernen** umschalten |
| `togglereaddremoved <index>` | `togglermrm` | Server verwalten | **Entfernte wieder hinzufügen** umschalten |

`setaddroles` und `setremoveroles` hängen an die bestehende Liste an, statt sie zu ersetzen. Mit den `remove...`-Befehlen entfernst du Rollen wieder. Der Editor im Dashboard arbeitet umgekehrt: Was beim Speichern im Feld steht, wird zur vollständigen Liste. Ein geleertes Feld wird jedoch ignoriert, daher muss eine Liste komplett über die `remove...`-Befehle geleert werden.

## Tipps und Fallstricke

- Der Bot braucht **Rollen verwalten**, und seine höchste Rolle muss über jeder Rolle stehen, die er hinzufügt oder entfernt. Fehler werden nur protokolliert, das Mitglied sieht nichts.
- Der Bot braucht den Presence-Intent, um benutzerdefinierte Status überhaupt zu sehen. Wenn nichts passiert, wenn du deinen Status änderst, ist das der erste Punkt zum Prüfen.
- Der Abgleich ist groß- und kleinschreibungsabhängig und sucht überall im Statustext. Halte den überwachten Text kurz und eindeutig.
- Der Bot schaut nur auf die erste Aktivität in der Präsenz eines Mitglieds. Discord listet den benutzerdefinierten Status normalerweise zuerst. Wird davor eine andere Aktivität gemeldet, wird der Status nicht erkannt.
- Rollen werden nur bei einer Statusänderung angepasst. Ein Mitglied, das den Text bereits im Status hat, wenn du den Eintrag erstellst, wird erst verarbeitet, wenn sich sein Status ändert.
- Die Benachrichtigung wird jedes Mal gesendet, wenn der Status zu passen beginnt. Wer seinen Status wiederholt umschaltet, löst also wiederholt Nachrichten aus.
- Das Dashboard nimmt Rollen-IDs, keine Namen. Aktiviere den Entwicklermodus in Discord und klicke mit der rechten Maustaste auf eine Rolle, um ihre ID zu kopieren.

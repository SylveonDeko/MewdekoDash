---
title: Votes
slug: votes
summary: Belohne Mitglieder, die deinen Server auf top.gg voten, mit einer Dankesnachricht, einer Stimmenzahl und temporären oder dauerhaften Rollen.
icon: fa-thumbs-up
category: Community
dashboard: /dashboard/votes
module: Votes
tags: [votes, top.gg, vote rewards, vote roles, webhook, vote password, leaderboard, Votes, Stimmen, Vote-Belohnungen, Vote-Rollen, Webhook, Vote-Passwort, Bestenliste]
related: [administration, xp]
---

## Was es macht

Das ist keine Umfragefunktion. Votes erfasst die Stimmen, die dein Server auf top.gg erhält, und belohnt die Personen, die sie abgegeben haben. Wenn top.gg Mewdeko mitteilt, dass jemand gevotet hat, speichert der Bot die Stimme, postet eine Dankesnachricht in deinem Vote-Kanal mit dem laufenden Gesamtstand dieses Mitglieds und vergibt alle Rollen, die du als Vote-Belohnungen konfiguriert hast.

Aus Sicht eines Mitglieds: Es votet für den Server auf top.gg, dann erscheint im Vote-Kanal eine Nachricht, die es erwähnt und zeigt, wie oft es schon gevotet hat. Richtest du Vote-Rollen ein, erhält es diese gleichzeitig, entweder dauerhaft oder für eine festgelegte Dauer.

Aus Sicht des Teams: Du legst einen Vote-Kanal, ein Webhook-Passwort, optional eine eigene Nachricht und bis zu zehn Belohnungsrollen fest. Danach bearbeitet der Bot jede Stimme selbstständig. `votes` und `votesleaderboard` lassen jeden die Anzahl prüfen.

Die Verbindung zwischen top.gg und deinem Server ist das Vote-Passwort. top.gg sendet es im Authorization-Header seines Webhook-Aufrufs. Mewdeko gleicht diesen Header mit dem Passwort ab, das für jeden Server gespeichert ist, um herauszufinden, zu welchem Server die Stimme gehört.

## Warum du es nutzen würdest

- Du listest deinen Server auf top.gg und willst jedes Mal, wenn jemand votet, einen sichtbaren Dank.
- Du willst Votern eine Rolle „Voter“ geben oder eine temporäre Vorteilsrolle, die nach zwölf Stunden abläuft.
- Du willst eine monatliche Voter-Bestenliste, um eine Belohnung für den „Top-Voter“ zu vergeben.
- Mitglieder sollen ihre eigene Stimmenzahl prüfen können, ohne das Team zu fragen.

## Wie eine Stimme verarbeitet wird

1. top.gg sendet an den Webhook-Endpunkt `/votes/` des Bots, mit der Discord-ID des Voters und deinem Passwort im Authorization-Header.
2. Der Bot findet den Server, dessen gespeichertes Vote-Passwort passt. Passt keiner, wird die Stimme verworfen.
3. Die Stimme wird mit der ID des Voters und dem Zeitpunkt gespeichert.
4. Ist ein Vote-Kanal festgelegt, postet der Bot dort die Dankesnachricht. Ohne Vote-Kanal wird nichts gepostet und keine Rolle vergeben.
5. Jede Vote-Rolle wird dem Mitglied hinzugefügt. Rollen mit Timer werden wieder entfernt, sobald der Timer abläuft. Dafür gilt dasselbe System für zeitlich begrenzte Rollen wie bei Stummschaltungen.

> [!WARNING]
> Das Passwort ist das Einzige, das eine Stimme mit deinem Server verbindet. Wer es kennt, kann gefälschte Stimmen senden. Füge es nie in einen öffentlichen Kanal ein. Der Bot setzt es deshalb über ein privates Modal.

## Die Dankesnachricht

Standardmäßig sendet der Bot eine Erwähnung des Voters plus ein Embed mit dem Titel „Thanks for voting for <server>“, eine Zeile mit der Gesamtzahl seiner Stimmen und seinen Avatar als Thumbnail.

Du kannst das mit eigenem Text oder Embed ersetzen, über `votemessage` oder das Feld **Eigene Vote-Ankündigung** im Dashboard. Der Text durchläuft den Embed-Parser, daher funktioniert alles, was der Embed-Builder erzeugt. Setze im Befehl `-` oder leere das Feld im Dashboard, um zum Standard zurückzukehren.

### Platzhalter

Die eigene Nachricht unterstützt den allgemeinen Platzhalter-Satz (Nutzer-, Server-, Kanal-, Bot- und Zeitplatzhalter von der Platzhalterseite) plus zwei Vote-spezifische.

| Platzhalter | Wert |
| --- | --- |
| `%votestotalcount%` | Wie oft dieses Mitglied insgesamt gevotet hat |
| `%votesmonthcount%` | Wie oft es im aktuellen Kalendermonat gevotet hat |
| `%user.mention%`, `%user.name%`, `%user.id%`, `%user.avatar%` | Der Voter |
| `%server.name%`, `%server.id%`, `%server.icon%`, `%server.members%` | Dein Server |

> [!EXAMPLE]
> `Danke %user.mention% fürs Voten! Das ist Stimme Nummer %votestotalcount% (%votesmonthcount% in diesem Monat).`

Führst du `votemessage` ohne Text aus, wird die aktuelle Nachricht so angezeigt, wie sie für dich aussieht, mit deinen eigenen Stimmenzahlen.

## Vote-Rollen

Eine Vote-Rolle wird jedem Voter gegeben. Jede Rolle hat eine optionale Dauer in Sekunden. `0` bedeutet, dass die Rolle dauerhaft ist.

- Bis zu zehn Vote-Rollen pro Server.
- Die `@everyone`-Rolle kann nicht hinzugefügt werden.
- Eine Rolle kann nicht zweimal hinzugefügt werden. Nutze `voteroleedit`, um ihre Dauer zu ändern.
- Zeitlich begrenzte Rollen werden automatisch entfernt, wenn die Dauer abgelaufen ist.
- Kann der Bot eine Rolle nicht vergeben, weil sie etwa über der höchsten Rolle des Bots steht, überspringt er diese Rolle stillschweigend.

## Stimmenzahlen und Bestenliste

`votes` zeigt die Stimmen eines Mitglieds in diesem Monat und insgesamt, mit seinem Avatar. `votesleaderboard` rankt alle auf dem Server nach Gesamtstimmen, zwölf pro Seite. Übergibst du `true`, wird nur nach den Stimmen dieses Monats gerankt. Beide „Monats“-Werte vergleichen den Kalendermonat, nicht die letzten dreißig Tage.

## Einstellungen

Die Seite Votes hat drei Tabs: **Konfiguration**, **Vote-Rollen** und **Statistiken**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Kanal für Abstimmungsankündigungen | keiner | Wo Dankesnachrichten gepostet werden. Ohne ihn passiert nichts |
| API-Passwort (für Webhooks) | keins | Das Geheimnis, das top.gg im Authorization-Header senden muss |
| Eigene Vote-Ankündigung | Standard-Embed | Deine eigene Nachricht mit den obigen Platzhaltern. Leer bedeutet Standard |
| Zu vergebende Rolle | keine | Eine Rolle, die jedem Voter hinzugefügt wird (Tab Vote-Rollen) |
| Dauer (Sekunden, 0 für dauerhaft) | 0 | Wie lange eine Vote-Rolle gilt, bevor sie entfernt wird |

Der Tab **Statistiken** zeigt die Gesamtstimmen, die Anzahl der Vote-Rollen, die Stimmenzahl des besten Voters und eine Bestenliste der Top Ten.

## Einrichtung

1. Öffne **Votes** im Dashboard und bleib auf **Konfiguration**.
2. Wähle einen **Kanal für Abstimmungsankündigungen**. Ohne ihn werden Stimmen zwar erfasst, aber nichts gepostet und keine Rollen vergeben.
3. Trage ein **API-Passwort** ein. Mach es lang und zufällig und behandle es wie einen API-Schlüssel.
4. Optional schreibst du eine **Eigene Vote-Ankündigung** mit den obigen Platzhaltern und speicherst dann **Konfiguration speichern**.
5. Öffne auf der top.gg-Seite deines Servers den Bereich Webhooks. Setze die Webhook-URL auf den Endpunkt `/votes/` deines Bots und den Authorization-Wert auf dasselbe Passwort.
6. Wähle unter **Vote-Rollen** eine **Zu vergebende Rolle** und eine **Dauer**, dann **Vote-Rolle hinzufügen**. Wiederhole das für bis zu zehn Rollen.
7. Achte darauf, dass die Rolle des Bots in der Rollenliste über jeder Vote-Rolle steht.
8. Nutze den Testwebhook-Button von top.gg oder warte auf eine echte Stimme, und prüfe dann den Vote-Kanal.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `votechannel <#channel>` | | Server verwalten | Den Kanal für Dankesnachrichten festlegen |
| `votemessage [text]` | `votemsg` | Server verwalten | Die eigene Nachricht anzeigen, festlegen oder mit `-` zurücksetzen |
| `votepassword` | `votepass` | Server verwalten | Das Webhook-Passwort über ein privates Modal festlegen |
| `voteroleadd <@role> [time]` | `vra` | Server verwalten | Eine Vote-Rolle hinzufügen, optional mit Zeitlimit, zum Beispiel `voteroleadd @Voter 12h` |
| `voteroleedit <@role> <time>` | `vre` | Server verwalten | Ändern, wie lange eine Vote-Rolle gilt |
| `voteroleremove <@role>` | `vrr` | Server verwalten | Eine Vote-Rolle entfernen |
| `voteroleslist` | `vrl` | Server verwalten | Vote-Rollen und ihre Dauer auflisten |
| `voterolesclear` | `vrc` | Server verwalten | Alle Vote-Rollen nach Bestätigung entfernen |
| `votes [@user]` | | Niemand | Die monatlichen und die Gesamtstimmen eines Mitglieds anzeigen |
| `votesleaderboard [true]` | `voteslb` | Niemand | Voter nach Gesamtstimmen ranken, oder mit `true` nach diesem Monat |

Dieselben Befehle gibt es als Slash-Befehle unter `/votes`.

## Tipps und Fallstricke

- Es werden nur Server-Stimmen von top.gg unterstützt. Für andere Bot-Listen gibt es keine Integration, und diese Funktion erstellt keine Umfragen.
- Ohne Vote-Kanal gibt es weder Nachricht noch Rollen, obwohl die Stimme trotzdem gezählt wird.
- Der Bot braucht **Rollen verwalten**, und seine Rolle muss über jeder Vote-Rolle stehen. Sonst scheitern Rollenbelohnungen stillschweigend.
- Zeitlich begrenzte Vote-Rollen nutzen dasselbe System wie zeitlich begrenzte Stummschaltungen und erscheinen im Audit-Log mit dem Grund „Vote Role“.
- `voteroleedit` sucht die Rolle nur anhand der ID. Nutze es daher nur für Rollen, die du tatsächlich auf diesem Server hinzugefügt hast.
- Das Ändern des Passworts macht alte Stimmen nicht ungültig. top.gg wird aber nicht mehr passen, bis du dort ebenfalls den Header aktualisierst.

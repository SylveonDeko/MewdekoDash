---
title: Rollen-Begrüßungen
slug: rolegreets
summary: Schicke eine eigene Nachricht in einen Kanal, sobald ein Mitglied eine bestimmte Rolle erhält, mit Platzhaltern, Embeds, Webhooks und automatischem Löschen.
icon: fa-user
category: Actions
dashboard: /dashboard/rolegreets
module: RoleGreets
tags: [role greet, role greets, welcome, role message, role announcement, verification welcome, webhook greet, Rollen-Begrüßung, Rollen-Begrüßungen, Willkommen, Rollen-Nachricht, Rollen-Ankündigung, Verifizierung, Webhook-Begrüßung]
related: [multigreets, embedbuilder, administration]
---

## Was es macht

Eine Rollen-Begrüßung ist eine Nachricht, die der Bot postet, wenn ein Mitglied eine Rolle erhält. Du wählst eine Rolle und einen Kanal, schreibst die Nachricht, und ab dann postet der Bot sie in diesem Kanal, jedes Mal wenn die Rolle jemandem zugewiesen wird. Die Standardnachricht ist `Welcome %user.mention%!`.

Die Nachricht läuft durch den Embed-Parser, kann also reiner Text, ein vollständiges Embed oder ein Embed mit Buttons aus dem Dashboard-Editor sein. Platzhalter füllen Name, Avatar, Beitrittsdatum und Serverdetails des Mitglieds ein. Jede Begrüßung kann über einen Webhook mit eigenem Namen und Avatar posten und sich nach einer festgelegten Anzahl Sekunden selbst löschen.

Begrüßungen gelten pro Rolle und pro Kanal. Eine Rolle kann bis zu zehn Begrüßungen haben, jede in einem anderen Kanal oder mit einer anderen Nachricht, und eine Begrüßung lässt sich deaktivieren, ohne sie zu löschen.

## Wofür du es brauchst

- Neue Mitglieder erst im Hauptchat begrüßen, wenn sie die Verifizierung bestanden und die Rolle „Verified“ bekommen haben.
- Neue Booster in einem Dankeschön-Kanal ankündigen, sobald die Booster-Rolle erscheint.
- Jemandem, der sich eine Spielrolle genommen hat, sagen, wo die passenden Kanäle sind.
- Eine Einarbeitungs-Checkliste für das Team im Team-Kanal posten, wenn eine Moderatoren-Rolle vergeben wird.
- Mitglieder, die einer Giveaway- oder Event-Rolle hinzugefügt werden, mit den Regeln für dieses Event begrüßen.

## Wie eine Begrüßung auslöst

Der Bot achtet auf Mitglieder-Updates und vergleicht die Rollen vorher und nachher. Für jede hinzugefügte Rolle sucht er die Begrüßungen dieser Rolle und postet jede davon. Entfernte Rollen lösen nie etwas aus. Bots werden übersprungen, außer **Bots begrüßen** ist für diese Begrüßung aktiviert, und eine deaktivierte Begrüßung wird ignoriert.

Existiert der Kanal nicht mehr, löscht sich die Begrüßung selbst. Schlägt eine Webhook-Begrüßung fehl, weil der Webhook gelöscht wurde oder der Bot die Berechtigung verloren hat, wird die Begrüßung deaktiviert statt entfernt, damit du sie reparieren und wieder aktivieren kannst.

Mit gesetztem Webhook wird die Nachricht unter Name und Avatar des Webhooks gesendet. Das automatische Löschen funktioniert trotzdem: Der Bot holt die gerade gesendete Nachricht und entfernt sie nach der Verzögerung.

## Platzhalter

Rollen-Begrüßungen unterstützen die Platzhalter-Gruppen für Nutzer, Server und Bot. Kanal-Platzhalter sind nicht verfügbar.

| Platzhalter | Wert |
| --- | --- |
| `%user.mention%`, `%user%` | Erwähnung des Mitglieds, das die Rolle erhalten hat |
| `%user.name%`, `%username%` | Benutzername |
| `%user.fullname%` | Benutzername mit Tag |
| `%user.avatar%` | Avatar-URL |
| `%user.banner%` | Banner-URL |
| `%user.id%` | Nutzer-ID |
| `%user.created_date%`, `%user.created_time%` | Datum und Uhrzeit der Kontoerstellung |
| `%user.joined_date%`, `%user.joined_time%` | Datum und Uhrzeit des Serverbeitritts |
| `%server.name%`, `%server%` | Servername |
| `%server.members%` | Mitgliederzahl aus dem Cache |
| `%server.icon%`, `%server.banner%` | URLs von Server-Icon und Banner |
| `%server.boostlevel%`, `%server.boostcount%` | Boost-Stufe und Anzahl |
| `%server.time%`, `%time.day%` | Serverzeit und Wochentag |
| `%bot.name%`, `%bot.avatar%`, `%bot.id%` | Name, Avatar und ID des Bots |

Ist das Einladungs-Tracking auf dem Server aktiviert, werden auch die Einlader- und Einladungs-Platzhalter aus den Multi-Begrüßungen (`%inviter.username%`, `%inviter.mention%`, `%inviter.count%`, `%invite.code%`, `%invite.label%` und die übrigen) aus dem Einlader des Mitglieds gefüllt. Ist kein Einlader bekannt, steht dort `Unknown`.

> [!EXAMPLE]
> `Welcome to the team, %user.mention%! You are member number %server.members%. Check the pins in this channel first.`

## Einstellungen

Die Seite Rollen-Begrüßungen hat oben ein Formular **Neue Rollen-Begrüßung hinzufügen** und darunter eine Karte für jede Begrüßung.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Rolle | keine | Die Rolle, die die Begrüßung auslöst |
| Kanal | keiner | Wo die Nachricht gepostet wird |
| Nachricht | `Welcome %user.mention%!` | Öffnet den Embed-Editor |
| Löschzeit (Sekunden, 0 für nie) | 0 | Verzögerung für das automatische Löschen |
| Webhook-URL (optional) | keine | Über einen Webhook statt über den Bot posten |
| Bots begrüßen | aus | Auch Bot-Accounts begrüßen, die die Rolle erhalten |
| Aktiviert | an | Umschalter auf der Karte; deaktivierte Begrüßungen tun nichts |

## Einrichtung Schritt für Schritt

1. Öffne **Rollen-Begrüßungen** im Dashboard.
2. Wähle unter **Neue Rollen-Begrüßung hinzufügen** die **Rolle** und den **Kanal** und klicke auf **Rollen-Begrüßung hinzufügen**.
3. Klicke auf der neuen Karte in das Nachrichtenfeld, um den Editor zu öffnen, und schreibe deine Begrüßung mit den Platzhaltern von oben.
4. Lege **Löschzeit** fest, wenn der Kanal aufgeräumt bleiben soll, und füge eine **Webhook-URL** ein, wenn du einen eigenen Namen und Avatar willst.
5. Speichere die Karte, gib die Rolle einem Testkonto und prüfe den Kanal.
6. Mit dem Umschalter auf der Karte pausierst du eine Begrüßung, mit dem Löschen-Button entfernst du sie.

> [!TIP]
> In Discord zeigt `rolegreetmessage 1` ohne Text die aktuelle Nachricht und bietet einen Button **Vorschau**, der sie mit deinen eigenen Daten rendert.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast). Begrüßungen werden nach ihrer Position in `rolegreetlist` nummeriert.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `rolegreetadd <@role> [#channel]` | `rgadd`, `rga` | Administrator | Eine Begrüßung für eine Rolle hinzufügen, im aktuellen Kanal, falls keiner angegeben ist |
| `rolegreetlist` | `rglist`, `rgl` | Administrator | Alle Begrüßungen mit ihren Einstellungen seitenweise durchblättern |
| `rolegreetmessage <id> [message]` | `rgmsg`, `rgm` | Administrator | Die Nachricht festlegen oder ohne Text anzeigen und in der Vorschau prüfen |
| `rolegreetremove <id or @role>` | `rgrem`, `rgrm`, `rgr` | Administrator | Eine Begrüßung per Nummer löschen oder nach Bestätigung alle Begrüßungen einer Rolle |
| `rolegreetdelete <id> <time or seconds>` | `rgdel`, `rgd` | Administrator | Verzögerung für das automatische Löschen, zum Beispiel `30s` oder `30`; `0` schaltet sie aus |
| `rolegreetdisable <id> <true/false>` | `rgdisable`, `rgdis` | Administrator | Eine Begrüßung deaktivieren oder wieder aktivieren |
| `rolegreetgreetbots <id> <true/false>` | `rolegreetbots`, `rggb` | Administrator | Ob Bots diese Begrüßung auslösen |
| `rolegreetwebhook <id> [name] [avatar url]` | `rgwebhook`, `rghook`, `rgh` | Administrator | Einen Webhook im Begrüßungskanal mit diesem Namen und Avatar erstellen oder ohne Namen entfernen |

Slash-Befehle gibt es unter `/rolegreets` mit denselben Aktionen: `add`, `remove`, `removerole`, `message`, `delete`, `disable`, `greetbots`, `webhook` und `list`.

## Tipps und Stolperfallen

- Der Bot braucht im Begrüßungskanal Send Messages und Embed Links, für das automatische Löschen dort Nachrichten verwalten und für `rolegreetwebhook` die Berechtigung Webhooks verwalten.
- Das Limit liegt bei zehn Begrüßungen pro Rolle, nicht pro Server. Der Add-Befehl lehnt eine elfte ab.
- Begrüßungen lösen bei jeder Rollenvergabe aus, auch bei Reaction Roles, Level-Belohnungen und anderen Bots. Eine Rolle, die oft vergeben und wieder entfernt wird, flutet den Kanal.
- Liefert der Embed-Parser nichts, etwa bei einer Nachricht aus reinem Leerraum, wird nichts gesendet.
- `rolegreetremove` mit einer Rolle entfernt nach einer Ja/Nein-Abfrage alle Begrüßungen dieser Rolle; mit einer Nummer wird nur diese eine sofort entfernt.
- Nach dem Entfernen einer Begrüßung verschieben sich die Nummern. Führe vor dem Bearbeiten per Nummer `rolegreetlist` erneut aus.
- Rollen-Begrüßungen sind getrennt von den Beitritts-Begrüßungen auf der Seite Multi-Begrüßungen. Nutze Multi-Begrüßungen für Beitritte zum Server und Rollen-Begrüßungen für Rollen, die später dazukommen.

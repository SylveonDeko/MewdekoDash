---
title: Begrüßungen
slug: multigreets
summary: Poste Willkommensnachrichten in bis zu dreißig Kanälen, wenn jemand beitritt, plus klassische Abschieds-, Boost- und DM-Begrüßungen.
icon: fa-bell
category: Actions
dashboard: /dashboard/multigreets
module: MultiGreets
tags: [greets, multigreets, welcome, join message, goodbye, bye, leave message, boost message, greet dm, webhook, placeholders, Begrüßungen, Willkommen, Beitrittsnachricht, Abschied, Verlassen-Nachricht, Boost-Nachricht, Platzhalter]
related: [rolegreets, invites, administration]
---

## Was es macht

Wenn ein Mitglied beitritt, postet der Bot in jedem Kanal, den du als Begrüßung eingerichtet hast, eine Begrüßung. Jede Begrüßung hat ihre eigene Nachricht, ihren eigenen Lösch-Timer, ihre eigene Webhook-Identität und ihren eigenen Bot-Schalter. Du kannst alle gleichzeitig laufen lassen oder pro Beitritt zufällig eine auswählen.

Nachrichten laufen durch den Embed-Parser, eine Begrüßung kann also reiner Text sein, ein vollständiges Embed mit Buttons oder ein Webhook-Beitrag mit eigenem Namen und Avatar. Platzhalter füllen den Namen des Mitglieds, den Servernamen, die Mitgliederzahl und, wenn das Einladungs-Tracking an ist, ein, wer es eingeladen hat.

Das ältere System mit einer einzelnen Nachricht gibt es daneben weiterhin. Es kümmert sich um die Abschiedsnachricht, wenn jemand geht, die Boost-Ankündigung, wenn jemand boostet, und eine private Willkommens-DM. Diese gehören zum Verwaltungsmodul und werden weiter unten beschrieben.

## Wofür du es brauchst

- Ein öffentliches Willkommen in `#general` und eine ruhige Logzeile in `#staff-joins` vom selben Beitritt.
- Unterschiedliche Begrüßungsstile pro Kanal, zum Beispiel ein Embed in einem und eine Webhook-„Figur“ in einem anderen.
- Ein Pool von Begrüßungen, aus dem jedes neue Mitglied eine zufällig gewählte erhält.
- Ein kurzes Willkommen, das sich nach einer Minute selbst löscht, damit sich der Kanal nicht füllt.
- Eine Abschieds- oder Boost-Nachricht, ohne etwas anderes einrichten zu müssen.

## Begrüßungstypen

Der **Begrüßungstyp** gilt serverweit und bestimmt, was bei einem Beitritt passiert.

| Typ | Beschriftung im Dashboard | Was passiert |
| --- | --- | --- |
| MultiGreet | Alle Begrüßungen | Jede aktivierte Begrüßung löst aus, in der Reihenfolge, in der sie hinzugefügt wurden. Standard. |
| RandomGreet | Zufällige Begrüßung | Eine Begrüßung wird zufällig aus der Liste gewählt und löst aus. Deaktivierte Begrüßungen können gewählt und dann übersprungen werden. |
| Off | Deaktiviert | Es löst gar keine Begrüßung aus. |

## Was eine Begrüßung enthält

Jede Begrüßung ist an einen Kanal gebunden. Ein Kanal kann bis zu fünf Begrüßungen enthalten, und ein Server insgesamt dreißig. Begrüßungen werden nach ihrer Position in der Liste nummeriert, und diese Nummer verwenden die Befehle.

| Feld | Standard | Bedeutung |
| --- | --- | --- |
| Kanal | der Kanal, den du hinzugefügt hast | Wo diese Begrüßung gepostet wird |
| Nachricht | leer | Text- oder Embed-Vorlage. Eine leere Begrüßung sendet nichts. |
| Löschen nach | 0 (nie) | Sekunden, bis sich die Begrüßung selbst löscht |
| Bots begrüßen | aus | Ob die Begrüßung auslöst, wenn ein Bot-Account beitritt |
| Webhook | keiner | Über einen Webhook mit eigenem Namen und Avatar posten statt als der Bot |
| Aktiviert | an | Deaktivierte Begrüßungen werden übersprungen, ohne entfernt zu werden |

Wird der Kanal gelöscht, wird die Begrüßung beim nächsten Auslösen entfernt. Wird ein Webhook gelöscht oder verliert der Bot die Berechtigung zum Posten, wird die Begrüßung auf deaktiviert gesetzt, statt bei jedem Beitritt einen Fehler zu verursachen.

## Platzhalter

Begrüßungen werden mit den Platzhalter-Sets für Nutzer, Server und Bot erstellt. Einlader-Platzhalter funktionieren nur, solange das Einladungs-Tracking auf der Einladungen-Seite aktiviert ist.

| Platzhalter | Wert |
| --- | --- |
| `%user%`, `%user.mention%` | Erwähnung des neuen Mitglieds |
| `%user.name%`, `%username%` | Benutzername |
| `%user.fullname%`, `%userfull%` | Vollständiger Tag |
| `%user.id%`, `%id%` | Nutzer-ID |
| `%user.avatar%`, `%useravatar%` | Avatar-URL |
| `%user.banner%` | Banner-URL |
| `%user.created_date%`, `%user.created_time%` | Wann der Account erstellt wurde |
| `%user.joined_date%`, `%user.joined_time%` | Wann er diesem Server beigetreten ist |
| `%server%`, `%server.name%` | Servername |
| `%server.id%`, `%sid%` | Server-ID |
| `%server.icon%`, `%server.banner%` | URLs von Icon und Banner |
| `%server.members%`, `%members%` | Mitgliederzahl |
| `%server.boostlevel%`, `%server.boostcount%` | Boost-Stufe und Anzahl der Boosts |
| `%server.time%`, `%server.timestamp.longdatetime%` | Aktuelle Zeit, einfach oder als Discord-Zeitstempel |
| `%bot.name%`, `%bot.id%`, `%bot.avatar%` | Über den Bot selbst |
| `%inviter.username%`, `%inviter.mention%`, `%inviter.id%`, `%inviter.avatar%` | Die Person, deren Einladung verwendet wurde, oder `Unknown` |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | Die Einladungsbilanz des Einladers |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%` | Die verwendete Einladung, ihr Label und ob es eine Einladung, der Vanity-Link oder eine App war |
| `%user.joincount%`, `%user.leavecount%` | Wie oft dieses Mitglied beigetreten ist und verlassen hat |
| `%server.members.ordinal%` | Mitgliederzahl als 1., 2., 1.204. |
| `%user.joined.R%`, `%user.created.F%` (und die Stile t, T, d, D, f) | Beitritts- und Account-Erstellungszeiten als Discord-Zeitstempel |

> [!EXAMPLE]
> `Welcome %user.mention% to %server%! You are member #%server.members%.`

Die vollständige Liste der Server-, Kanal- und Bot-Platzhalter steht auf der Platzhalter-Seite. Kanal-Platzhalter werden bei Begrüßungen nicht gefüllt.

## Die klassischen Befehle für Begrüßung, Abschied und Boost

Diese gab es schon vor Multi-Begrüßungen und gehören zum Verwaltungsmodul. Es ist je eine Nachricht, gespeichert in der Serverkonfiguration und umgeschaltet aus dem Kanal, in dem du den Befehl ausführst.

| Nachricht | Löst aus, wenn | Platzhalter |
| --- | --- | --- |
| Bye | Ein Mitglied geht | Nutzer-, Server- und Bot-Sets, plus Kanal-Platzhalter. `%user%` erwähnt das Mitglied, das gegangen ist. |
| Boost | Ein Mitglied beginnt zu boosten oder boostet erneut | Nutzer-, Kanal-, Server-, Bot- und GIF-Sets |
| Begrüßungs-DM | Ein Mitglied tritt bei, gesendet als Privatnachricht | Nutzer-, Kanal-, Server-, Bot- und GIF-Sets |

Das Ausführen von `bye` oder `boost` schaltet diese Nachricht ein oder aus und setzt den Kanal auf den, in dem du getippt hast. `byedel` und `boostdel` legen einen Selbstlösch-Timer in Sekunden fest; `boostdel` ist auf 600 begrenzt. Die Nachrichtenbefehle ohne Text zeigen die aktuelle Nachricht. `leavehook` verpackt die Bye-Nachricht in einen Webhook mit eigenem Namen und Avatar, und `leavehook disable` entfernt ihn.

Begrüßungs-DMs erfordern Vorsicht. Der Bot bittet dich um Bestätigung, bevor du sie aktivierst, außer es ist ein verifizierter Bot, weil Massen-DMs von nicht verifizierten Bots dazu führen können, dass der Bot markiert wird. Jedes Mitglied kann diese DMs für sich selbst mit `greetdmoptout` blockieren, oder mit dem Schalter **Willkommens-DMs blockieren** auf der eigenen Profilseite im Dashboard.

Es gibt keinen klassischen Befehl für Kanal-Begrüßungen. Nutze für Kanal-Willkommensnachrichten eine Multi-Begrüßung.

## Einstellungen

Alles befindet sich auf der Seite Begrüßungen im Dashboard.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Begrüßungstyp | Alle Begrüßungen | Alle Begrüßungen, Zufällige Begrüßung oder Deaktiviert |
| Neue Begrüßung hinzufügen | | Wähle einen Kanal, dann klicke auf **Begrüßung hinzufügen** |
| Begrüßungsnachricht | leer | Der Embed-Builder für eine Begrüßung. Unterstützt Inhalt, bis zu zehn Embeds und Komponenten. |
| Löschen nach | Nie | Gib eine Zeit wie `1m30s` oder `45s` ein |
| Webhook | Nicht konfiguriert | Webhook-Name und optionale Avatar-URL |
| Bots begrüßen | aus | Auch für Bot-Accounts auslösen |
| Aktiviert | an | Eine Begrüßung ausschalten, ohne sie zu löschen |

Die Bye-, Boost- und Begrüßungs-DM-Nachrichten sind nicht auf dieser Seite. Lege sie mit den obigen Befehlen fest.

## Einrichtung Schritt für Schritt

1. Öffne **Begrüßungen** im Dashboard und lass den **Begrüßungstyp** auf **Alle Begrüßungen**.
2. Wähle unter **Neue Begrüßung hinzufügen** den Willkommenskanal und klicke auf **Begrüßung hinzufügen**.
3. Öffne auf der neuen Karte die **Begrüßungsnachricht** und baue deine Nachricht mit den obigen Platzhaltern. Speichere sie.
4. Lege optional **Löschen nach** fest, füge einen **Webhook**-Namen und Avatar hinzu und schalte **Bots begrüßen** ein, wenn Bot-Beitritte angekündigt werden sollen.
5. Wiederhole das für weitere Kanäle. Wechsle zu **Zufällige Begrüßung**, wenn du mehrere im selben Kanal hinzugefügt hast und Abwechslung willst.
6. Für eine Abschiedsnachricht führe `byemsg Goodbye %user%, we will miss you` im gewünschten Kanal aus und dann `bye`, um sie einzuschalten.
7. Für eine Boost-Nachricht führe `boostmsg Thanks for boosting, %user%!` und dann `boost` aus.
8. Teste mit `byetest` und `boosttest`. Multi-Begrüßungen haben eine Vorschau: Führe `multigreetmessage 1` aus und drücke **Vorschau**.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast). Multi-Begrüßungs-Befehle gibt es auch als `/multigreets add`, `/multigreets remove` und so weiter.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `multigreetadd [#channel]` | `mgadd`, `mga` | Administrator | Eine Begrüßung für einen Kanal hinzufügen, standardmäßig den aktuellen |
| `multigreetremove <number or #channel>` | `mgrem`, `mgrm`, `mgr` | Administrator | Eine Begrüßung per Nummer entfernen, oder nach Bestätigung jede Begrüßung in einem Kanal |
| `multigreetmessage <number> [message]` | `mgmsg`, `mgm` | Administrator | Den Text oder das Embed der Begrüßung festlegen; ohne Nachricht wird eine Vorschau oder die Rohvorlage angeboten |
| `multigreetdelete <number> <time or seconds>` | `mgdel`, `mgd` | Administrator | Selbstlösch-Timer, zum Beispiel `1m` oder `60`; `0` schaltet ihn aus |
| `multigreetdisable <number> <true or false>` | `mgdisable`, `mgdis` | Administrator | `true` deaktiviert die Begrüßung, `false` aktiviert sie |
| `multigreetgreetbots <number> <true or false>` | `multigreetbots`, `mggb` | Administrator | Ob diese Begrüßung für Bots auslöst |
| `multigreetwebhook <number> [name] [avatar url]` | `mgwebhook`, `mghook`, `mgh` | Administrator | Einen Webhook für die Begrüßung erstellen; ohne Namen wird er entfernt |
| `multigreettype <multigreet, randomgreet or off>` | `mgtype`, `mgt` | Administrator | Den serverweiten Begrüßungstyp ändern |
| `multigreetlist` | `mglist`, `mgl` | Administrator | Jede Begrüßung mit ihren Einstellungen seitenweise durchblättern |
| `bye` | | Server verwalten | Die Abschiedsnachricht in diesem Kanal umschalten |
| `byemsg [text]` | | Server verwalten | Die Abschiedsnachricht anzeigen oder festlegen |
| `byedel [seconds]` | | Server verwalten | Selbstlösch-Timer für den Abschied, Standard 30 |
| `byetest [@user]` | | Server verwalten | Die Abschiedsnachricht als Test senden |
| `leavehook [#channel] [name] [image url] [text]` | `byehook` | Server verwalten | Abschiede über einen Webhook senden, oder `leavehook disable` |
| `boost` | | Server verwalten | Die Boost-Nachricht in diesem Kanal umschalten |
| `boostmsg [text]` | `boostmessage` | Server verwalten | Die Boost-Nachricht anzeigen oder festlegen |
| `boostdel [seconds]` | `boostdelete` | Server verwalten | Selbstlösch-Timer für Boost, 0 bis 600, Standard 30 |
| `boosttest [@user]` | `testboost` | Server verwalten | Die Boost-Nachricht als Test senden |
| `greetdm` | | Server verwalten | Die Willkommens-DM umschalten |
| `greetdmmsg [text]` | | Server verwalten | Den Text der Willkommens-DM anzeigen oder festlegen |
| `greetdmtest [@user]` | | Server verwalten | Die Willkommens-DM als Test senden |
| `greetdmoptout` | `gdmoptout` | Niemand | Keine Willkommens-DMs mehr von diesem Bot erhalten, überall |

## Tipps und Stolperfallen

- `multigreetdelete` braucht, dass der Bot Nachrichten verwalten hat, und `multigreetwebhook` und `leavehook` brauchen Webhooks verwalten.
- Begrüßungsnummern sind Positionen in der Liste, das Entfernen einer verschiebt also die Nummern von allem danach. Führe `multigreetlist` aus, bevor du bearbeitest.
- Die Option `off` von `multigreettype`, `/multigreets type` und der Button **Deaktiviert** im Dashboard setzen alle denselben Begrüßungstyp, sodass jede davon das System ausschaltet, ohne deine Begrüßungen zu löschen.
- Einladungs-Platzhalter warten bis zu fünf Sekunden darauf, dass der Beitritt zugeordnet wird, bevor die Begrüßung rausgeht, sodass der Einlader auch dann stimmt, wenn mehrere Leute gleichzeitig beitreten.
- Die Willkommens-DM funktioniert nur, wenn das Mitglied DMs von Servermitgliedern erlaubt. Fehlgeschlagene DMs werden ignoriert.
- Rollen-Begrüßungen sind eine separate Funktion, die auslöst, wenn eine Rolle vergeben wird, statt beim Beitritt.

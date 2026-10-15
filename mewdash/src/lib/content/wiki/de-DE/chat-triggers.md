---
title: Trigger
slug: chat-triggers
summary: Automatische Antworten auf Nachrichten, Reaktionen, Slash-Commands und Bot-Ereignisse, mit Bedingungen, Kosten, Zählern, Rollenvergabe und einem vollständigen Satz an Platzhaltern.
icon: fa-comments
category: Actions
dashboard: /dashboard/chat-triggers
module: ChatTriggers
tags: [chat triggers, triggers, autoresponder, custom commands, auto reply, reaction roles, regex, counters, placeholders, event triggers, Chat-Trigger, Trigger, Auto-Antwort, eigene Befehle, Reaktionsrollen, Zähler, Platzhalter, Ereignis-Trigger]
related: [administration, xp, currency, tickets, giveaways]
---

## Was es macht

Ein Trigger ist ein Text, auf den der Bot achtet, und eine Antwort, die er sendet, sobald er ihn sieht. In der einfachsten Form schreibt ein Mitglied `hello` und der Bot antwortet `hi there`. Von dort aus kann ein Trigger an beliebiger Stelle in einer Nachricht oder per regulärem Ausdruck zutreffen, mit einem Embed antworten, mit Emoji reagieren, die Antwort als DM senden, die Nachricht des Mitglieds löschen, Rollen vergeben oder entfernen, eine Kopie in einen anderen Kanal oder an einen Webhook senden und nach dem Abschluss einen zweiten Trigger ausführen.

Trigger müssen keine Nachrichten sein. Derselbe Trigger kann als Slash-, Nachrichten- oder Nutzer-Kontextbefehl registriert werden, auslösen, wenn jemand eine bestimmte Reaktion hinzufügt oder entfernt, oder bei einem Bot-Ereignis auslösen, etwa einem Level-Up, einem Beitritt, dem Start eines Boosts, dem Öffnen eines Tickets oder dem Gewinn eines Gewinnspiels.

Jeder Trigger bringt seine eigenen Bedingungen mit: einen Cooldown pro Nutzer, Kanal oder Server, ein erforderliches XP-Level, Währungskosten oder eine Belohnung, aktive Uhrzeiten und Tage, ein Ablaufdatum, ein Nutzungslimit, ein Mindestalter des Kontos oder eine Mindestdauer auf dem Server sowie einen Zähler, der in einem bestimmten Bereich liegen muss. Schlägt eine Bedingung fehl, bleibt der Trigger stumm oder zeigt eine Nachricht, die du selbst geschrieben hast. Der Tester im Dashboard sagt dir genau, welche Regel eine Beispielnachricht blockieren würde.

Antworten können Werte aus dem Rest des Bots lesen: Level, Kontostand, Reputation oder Nachrichtenzahl des Mitglieds, den Text nach dem Trigger, die erwähnten Personen, die Nachricht, auf die geantwortet wurde, Capture-Gruppen aus einem regulären Ausdruck und serverweite Zähler, die eine Antwort lesen und erhöhen kann.

## Wofür du es nutzen kannst

- Häufige Fragen automatisch beantworten: `!rules` postet das Regel-Embed.
- Spaßbefehle, die Mitglieder kostenlos ausführen können, ohne den eingebauten Befehlssatz des Bots zu nutzen.
- Ein Trigger im Stil von `daily`, der pro Nutzer und Tag per Cooldown und Belohnung einmal Währung auszahlt.
- Ein „Verify"-Wort, das eine Rolle vergibt und die Nachricht löscht.
- Reaktionsrollen, die eine Rolle vergeben, wenn jemand mit einem bestimmten Emoji reagiert.
- Eigene Level-Up-, Willkommens- oder Boost-Ankündigungen in deinem Format, ausgelöst durch das Ereignis statt durch eine Nachricht.
- Laufende Zähler wie „Tage seit dem letzten Vorfall", die jeder mit einem Wort erhöhen kann.

## Trigger-Typen

Ein Trigger hat eine Menge aktivierter Typen. Ein Typ legt fest, was ihn auslösen kann. Nachricht ist standardmäßig aktiv; die anderen werden pro Trigger mit `chattriggervalidtype` oder den Schaltern im Dashboard aktiviert.

| Typ | Löst aus, wenn |
| --- | --- |
| Message | Eine Nachricht zum Trigger-Text passt |
| Interaction | Jemand den dafür registrierten Slash-, Nachrichten- oder Nutzerbefehl ausführt |
| Button | Eine Button-Komponente gedrückt wird, deren ID zum Trigger passt |
| Reactions | Jemand das Trigger-Emoji zu einer Nachricht hinzufügt |
| ReactionsRemoved | Jemand das Trigger-Emoji von einer Nachricht entfernt |
| Event | Eines der unten genannten Bot-Ereignisse eintritt |

### Nachrichtenabgleich

Standardmäßig muss die gesamte Nachricht in Kleinbuchstaben dem Trigger entsprechen. Zwei Optionen lockern das:

- **Überall in der Nachricht abgleichen** (`ctca`): Der Trigger muss irgendwo in der Nachricht als ganzes Wort vorkommen.
- **Ansprechen einer Person erlauben** (`ctat`): Die Nachricht darf mit dem Trigger beginnen, gefolgt von einem Leerzeichen und weiterem Text, der zu `%target%` wird.

Trigger mit **regulärem Ausdruck** (`addchattriggerregex`) gleichen die Nachricht mit dem Muster ab. Jedes Muster bekommt 100 Millisekunden; eines, das das Zeitlimit überschreitet, wird übersprungen. Benannte oder nummerierte Capture-Gruppen stehen in der Antwort als `%regex.1%` oder `%regex.name%` zur Verfügung.

Eine **Präfix-Anforderung** legt fest, ob die Nachricht vor dem Abgleich mit einem Präfix beginnen muss:

| Option | Verhalten |
| --- | --- |
| Kein Präfix nötig | Gleicht den reinen Text ab (Standard) |
| Globales Präfix | Muss mit dem globalen Präfix des Bots beginnen |
| Server-Präfix oder globales | Muss mit dem Server-Präfix beginnen, ersatzweise mit dem globalen |
| Server-Präfix, falls festgelegt | Muss mit dem Server-Präfix beginnen; trifft nie zu, wenn der Server keines hat |
| Ein eigenes Präfix | Muss mit dem Präfix beginnen, das mit `ctprefix` festgelegt wurde |

Treffen mehrere Trigger auf eine Nachricht zu, wird zufällig einer davon ausgewählt. Nachrichten von Bots und Webhooks werden ignoriert, es sei denn, bei einem Trigger ist **Nur Bots** (`ctallowbots`) aktiviert. Ein solcher Trigger antwortet dann nur auf Bot-Nachrichten. Der Bot antwortet nie auf seine eigenen Nachrichten.

### Interaktions-Trigger

`setctintertype` registriert den Trigger als Slash-, Nachrichten- oder Nutzer-Anwendungsbefehl. `setctintername` und `setctinterdesc` legen seinen Namen und seine Beschreibung fest; Namen müssen den Namensregeln für Discord-Befehle entsprechen. `ctinterephemeral` macht die Antwort nur für die Person sichtbar, die ihn ausgeführt hat. `ctintererrors` listet auf, warum die Registrierung fehlgeschlagen ist, etwa wegen doppelter Namen oder zu vieler Unterbefehle.

### Reaktions-Trigger

`addreactiontrigger <emoji> <response>` erstellt einen Trigger, dessen Text das Emoji ist. Aktiviere **Reaktion hinzugefügt** oder **Reaktion entfernt** als seine Typen. Die Antwort wird in dem Kanal gepostet, in dem die Nachricht mit der Reaktion steht. Rollenvergaben betreffen das reagierende Mitglied (oder bei **Erwähnte Personen** die Erwähnungen in der Nachricht, auf die reagiert wurde). Reaktionen von Bots werden ignoriert.

### Ereignis-Trigger

`ctevent <id> <event>` lässt einen Trigger bei einem Ereignis statt bei einer Nachricht auslösen und schaltet dafür den Typ Event ein. Ereignisse:

| Ereignis | Löst aus bei |
| --- | --- |
| XpLevelUp | Ein Mitglied steigt ein Level auf |
| XpLevelDown | Ein Mitglied fällt ein Level zurück |
| MemberJoin | Ein Mitglied tritt bei |
| MemberLeave | Ein Mitglied verlässt den Server |
| VoiceJoin | Ein Mitglied betritt einen Sprachkanal |
| VoiceLeave | Ein Mitglied verlässt einen Sprachkanal |
| Boost | Ein Mitglied beginnt zu boosten |
| BoostEnd | Ein Mitglied beendet den Boost |
| TicketOpened | Ein Ticket wird geöffnet |
| TicketClosed | Ein Ticket wird geschlossen |
| GiveawayWon | Ein Mitglied gewinnt ein Gewinnspiel |

Die Antwort geht in den Kanal, der mit `cteventchannel` festgelegt wurde, oder, falls keiner gesetzt ist, in den Kanal, in dem das Ereignis stattfand. Beitritte, Austritte, Sprach- und Boost-Ereignisse haben keinen eigenen Kanal, deshalb brauchen diese Trigger einen ausdrücklich angegebenen Kanal, sonst passiert nichts. Ereignis-Trigger durchlaufen dieselben Bedingungen und Wirtschaftsprüfungen wie Nachrichten-Trigger, und das Mitglied, um das es im Ereignis geht, gilt für Platzhalter und Rollenvergaben als Nutzer.

## Antworten

Die primäre Antwort ist der Text, der beim Erstellen des Triggers angegeben wird. Sie läuft durch den Embed-Parser und kann deshalb einfacher Text, ein Embed, mehrere Embeds oder im Embed-Editor des Dashboards gebaute Komponenten sein. Mit `ctaddresponse` lassen sich zusätzliche Antworten hinzufügen, und der **Antwortmodus** legt fest, welche gesendet werden:

| Modus | Verhalten |
| --- | --- |
| Single | Immer die erste Antwort (Standard) |
| Random | Eine zufällig ausgewählte; wiederhole eine Zeile, um sie stärker zu gewichten |
| RoundRobin | Der Reihe nach, eine pro Nutzung, serverweit geteilt |
| All | Jede Antwort, der Reihe nach |

Zustelloptionen, alle standardmäßig aus:

- **Auf die Nachricht antworten** (`ctreply`): Sendet die Antwort als Discord-Antwort.
- **Antwort als DM senden** (`ctdm`): Sendet sie privat an das Mitglied.
- **Auslösende Nachricht löschen** (`ctad`): Entfernt, was das Mitglied geschrieben hat.
- **Stattdessen auf die Nachricht reagieren** (`rtt`): Setzt das Emoji des Triggers auf die Nachricht des Mitglieds statt auf die Antwort. Lässt sich nicht mit Löschen kombinieren.
- **Gar keine Nachricht senden** (`ctnr`): Nützlich für Trigger, die nur Rollen vergeben.
- **Antwort löschen nach** (`ctdeleteafter`): Sekunden, bis die Antwort des Bots gelöscht wird; 0 behält sie.
- **Emoji für die Reaktion** (`ctreact`): Bis zu sechs Emoji, die im Sekundentakt hinzugefügt werden. Ohne Emoji wird die Liste geleert.

### Crossposting

`ctcpch` postet eine Kopie jeder Antwort in einen anderen Kanal des Servers. `ctcpwh` postet sie stattdessen über eine Webhook-URL, die auch auf einem anderen Server liegen kann. Crossposting findet auch dann statt, wenn **Gar keine Nachricht senden** aktiv ist.

### Rollen

**Zu vergebende Rollen** und **Zu entfernende Rollen** (`ctrgranttoggle`, `ctrremovetoggle`) werden angewendet, wenn der Trigger auslöst. Führst du den Schalter für dieselbe Rolle erneut aus, wird sie wieder aus der Liste entfernt. **Diese Rollen anwenden auf** (`chattriggerrolegranttype`) legt das Ziel fest:

| Ziel | Wer betroffen ist |
| --- | --- |
| Sender | Das Mitglied, das den Trigger ausgelöst hat (Standard) |
| Mentioned | Bis zu fünf in der Nachricht erwähnte Mitglieder |
| Both | Der Absender plus bis zu vier erwähnte Mitglieder |

Schließt das Ziel Erwähnungen ein, werden diese vor dem Abgleich aus der Nachricht entfernt, sodass `verify @someone` weiterhin zu einem Trigger `verify` passt.

### Verkettung

`ctchain <id> <nextId>` führt einen zweiten Trigger aus, nachdem der erste abgeschlossen ist. Der zweite wird nach seinen eigenen Regeln ausgewertet, einschließlich seiner Bedingungen und Kosten. Eine Kette endet nach fünf Schritten und besucht nie einen Trigger erneut, der bereits ausgeführt wurde.

## Bedingungen

All diese werden geprüft, bevor etwas abgebucht, gesendet oder gezählt wird. Eine fehlgeschlagene Bedingung bedeutet, dass der Trigger stillschweigend nicht auslöst. Ausnahmen sind die Level- und Währungsprüfungen, die die **Nachricht, wenn er nicht genutzt werden kann** anzeigen, falls du mit `ctreqmsg` eine festgelegt hast.

| Bedingung | Befehl | Standard | Verhalten |
| --- | --- | --- | --- |
| Cooldown | `ctcooldown <id> <seconds> [scope]` | keiner | Blockiert wiederholtes Auslösen für diese Anzahl Sekunden. Der Geltungsbereich ist `User`, `Channel` oder `Guild` |
| Erforderliches Level | `ctreqlevel <id> <level>` | 0 | Das XP-Level des Mitglieds muss mindestens so hoch sein |
| Kosten | `ctcost <id> <amount>` | 0 | Währung, die dem Mitglied abgezogen wird; kein Auslösen, wenn es nicht zahlen kann |
| Belohnung | `ctreward <id> <amount>` | 0 | Währung, die dem Mitglied beim Auslösen ausgezahlt wird |
| XP-Belohnung | `ctxpreward <id> <amount>` | 0 | XP, die beim Auslösen vergeben werden |
| Aktive Uhrzeiten | `cttime <id> <HH:mm> <HH:mm> [days...]` | immer | Löst nur innerhalb des Zeitfensters aus, in der Zeitzone des Servers. Liegt das Ende vor dem Start, läuft es über Nacht. Tage sind Namen oder 0 bis 6, wobei Sonntag 0 ist |
| Ablauf | `ctexpiry <id> [duration]` | nie | Löst nach der angegebenen Dauer ab jetzt nicht mehr aus, zum Beispiel `7d` |
| Nutzungslimit | `ctmaxuses <id> <uses>` | unbegrenzt | Hört nach dieser Anzahl an Auslösungen auf; 0 entfernt das Limit |
| Mindestalter des Kontos | `ctminage <id> [duration]` | keines | Das Konto muss mindestens so alt sein |
| Mindestdauer auf dem Server | `ctminmember <id> [duration]` | keine | Das Mitglied muss dem Server mindestens so lange beigetreten sein |
| Zählerbereich | `ctrequirecounter <id> <name> [min] [max]` | keiner | Der benannte Zähler muss im Bereich liegen; `clear` als Name entfernt ihn |

Der Cooldown startet erst, wenn alle anderen Bedingungen erfüllt sind, ein blockierter Versuch verbraucht ihn also nicht. Die Kosten werden abgezogen, bevor die Belohnung ausgezahlt wird, sodass ein Trigger, der sowohl kostet als auch auszahlt, nie jemandem etwas auszahlt, der ihn sich nicht leisten konnte. Serverweite Befehls-Cooldowns, die mit `cmdcd` festgelegt wurden, gelten zusätzlich zum eigenen Cooldown des Triggers auch für Trigger, und zwar pro Nutzer.

## Zähler

Zähler sind benannte Zahlen, die pro Server gespeichert werden. Sie werden beim ersten Mal erstellt, wenn eine Antwort sie verwendet, und können aus jeder Antwort gelesen oder geändert werden:

| Platzhalter | Wirkung |
| --- | --- |
| `%counter:name%` | Zeigt den Zähler an |
| `%counter:name+%` | Addiert eins und zeigt den neuen Wert an |
| `%counter:name-%` | Zieht eins ab und zeigt den neuen Wert an |
| `%usercounter:name%` | Zeigt den eigenen Wert des auslösenden Mitglieds für diesen Namen an |
| `%usercounter:name+%` | Addiert eins zum Wert des Mitglieds |
| `%usercounter:name-%` | Zieht eins vom Wert des Mitglieds ab |

Namen bestehen aus bis zu 64 Buchstaben, Ziffern, Unterstrichen oder Bindestrichen und unterscheiden nicht zwischen Groß- und Kleinschreibung. `ctcounters` listet sie auf, `ctcounterset` setzt einen auf einen genauen Wert, und `ctcounterdelete` entfernt ihn samt allen Werten pro Nutzer unter diesem Namen. Die Seitenleiste im Dashboard hat dafür ein **Zähler**-Panel.

## Platzhalter

Eine Antwort kann den allgemeinen Satz an Platzhaltern verwenden (Nutzer-, Server-, Kanal-, Bot- und Zeit-Platzhalter von der Platzhalter-Seite), die Trigger-Platzhalter und die Platzhalter, die andere Module beisteuern. `ctplaceholders` listet die beigesteuerten live auf.

| Platzhalter | Wert |
| --- | --- |
| `%target%` | Alles, was nach dem Trigger geschrieben wurde (benötigt **Ansprechen einer Person erlauben** oder Abgleich an beliebiger Stelle) |
| `%targetuser%` | Erwähnung der ersten in der Nachricht erwähnten Person |
| `%targetuser.id%`, `%targetuser.name%`, `%targetuser.avatar%` | ID, Benutzername und Avatar dieser Person |
| `%targetusers%`, `%targetusers.id%` | Alle Erwähnten, als Erwähnungen oder IDs |
| `%replied.content%` | Inhalt der Nachricht, auf die das Mitglied geantwortet hat |
| `%replied.author%`, `%replied.author.id%` | Autor dieser Nachricht |
| `%usecount%` | Wie oft dieser Trigger ausgelöst hat |
| `%regex.1%`, `%regex.name%` | Capture-Gruppen eines Regex-Triggers |
| `%img:tag%` | Ein zufälliges Imgur-Bild für diesen Tag |
| `%rng%` | Eine Zufallszahl aus dem allgemeinen Platzhalter-Satz |
| `%xp.level%`, `%xp.rank%`, `%xp.total%`, `%xp.current%`, `%xp.required%`, `%xp.remaining%`, `%xp.bonus%` | Die XP-Werte des Mitglieds |
| `%targetuser.xp.level%`, `%targetuser.xp.rank%`, `%targetuser.xp.total%` | Die XP-Werte der erwähnten Person |
| `%currency.balance%`, `%currency.bank%`, `%currency.total%`, `%currency.emote%` | Die Währung des Mitglieds |
| `%targetuser.currency.balance%`, `%targetuser.currency.bank%` | Die Währung der erwähnten Person |
| `%rep%`, `%rep.rank%`, `%targetuser.rep%`, `%targetuser.rep.rank%` | Reputation |
| `%messages%`, `%messages.channel%`, `%messages.server%`, `%targetuser.messages%` | Nachrichtenzahlen |
| `%invites%`, `%targetuser.invites%`, `%inviter%` | Einladungszahlen und wer das Mitglied eingeladen hat |
| `%targetuser.afk%` | Die AFK-Nachricht der erwähnten Person |
| `%counter:name%` und Verwandte | Zähler, wie oben |

Erwähnungen innerhalb von `%target%` werden entschärft, es sei denn, das Mitglied könnte selbst alle anpingen.

> [!EXAMPLE]
> Trigger `daily`, Antwort `%user.mention% claimed today's bonus. Balance: %currency.balance%`, mit `ctreward 12 100`, `ctcooldown 12 86400 User` und `ctreqmsg 12 Come back tomorrow.`

## Der Tester

`cttest <id> <sample message>` oder das Feld **Diesen Trigger testen** auf einer Trigger-Karte prüft, ob diese Nachricht den Trigger als du auslösen würde, ohne etwas zu senden, abzubuchen oder zu zählen. Es meldet, ob der Text zugetroffen hat, und, falls der Trigger nicht auslösen würde, welche Regel ihn stoppt: deaktiviert, nur Bots, kein Treffer, ein Berechtigungseintrag, eine Berechtigungs-Überschreibung, Ablauf, Cooldown, Zähler, Nutzungslimit, aktive Uhrzeiten, Kontoalter, Mitgliedsdauer, Level, Kontostand oder der Befehls-Cooldown des Servers.

## Kategorien und Organisation

`ctcategory <id> <name>` ordnet einen Trigger einer Kategorie zu. `ctcategorytoggle <name> <true or false>` aktiviert oder deaktiviert alle Trigger darin auf einmal, und die Seitenleiste im Dashboard filtert nach Kategorie. `cttoggle` pausiert einen einzelnen Trigger, ohne ihn zu löschen. `ctstats` zeigt, wie oft ein Trigger ausgelöst hat und wer ihn zuletzt ausgelöst hat.

`ctsexport` lädt alle Trigger als YAML-Datei herunter und `ctsimport` lädt eine aus einem Anhang oder einer URL. `ctsclear` löscht nach einer Bestätigung alle Trigger.

## Einstellungen

Alles gilt pro Trigger. Die Seite „Chat-Trigger" hat einen **Einfachen Modus** mit einem **Schnelleinrichtung**-Formular (Trigger-Text plus Antwort) und einen **Erweiterten Modus** mit **Erweiterte Trigger-Erstellung**, in dem du den **Mustertyp** (Normales Textmuster oder Muster als regulärer Ausdruck) und die Trigger-Typen wählst und einen Regex vor dem Speichern testen kannst.

Jede Trigger-Karte lässt sich aufklappen und zeigt **Trigger-Text**, den Editor für die **Antwortnachricht**, den Tester und ein Akkordeon mit nach Themen gruppierten Einstellungen:

| Gruppe | Einstellungen |
| --- | --- |
| Wann er zutrifft | Präfix-Anforderung, Eigenes Präfix, Überall in der Nachricht abgleichen, Ansprechen einer Person erlauben, Nur Bot-Owner |
| Wie er antwortet | Auf die Nachricht antworten, Antwort als DM senden, Auslösende Nachricht löschen, Stattdessen auf die Nachricht reagieren, Gar keine Nachricht senden, Emoji für die Reaktion, Antwort löschen nach, Zusätzliche Antworten, Bei mehreren Antworten |
| Rollen | Zu vergebende Rollen, Zu entfernende Rollen, Diese Rollen anwenden auf |
| Limits | Cooldown (Sekunden), Cooldown gilt für, Nach dieser Anzahl an Nutzungen stoppen, Nicht mehr auslösen nach, Mindestalter des Kontos (Minuten), Mindestdauer auf dem Server (Minuten), Nur zu bestimmten Uhrzeiten aktiv mit Von, Bis und An diesen Tagen |
| Kosten und Belohnungen | Kostet den Nutzer, Zahlt dem Nutzer, Vergibt XP, Erfordert Level, Nachricht, wenn er nicht genutzt werden kann |
| Zähleranforderung | Zählername, Mindestens, Höchstens |
| Bei einem Ereignis auslösen | Auslösen, wenn, Antworten in |
| Organisation | Kategorie, Danach Trigger ausführen, Auf Bots statt auf Personen antworten |

Die Seitenleiste listet Kategorien, **Zähler** und die Live-Liste der **Platzhalter** auf und hat ein Suchfeld für Trigger und Antworten.

## Einrichtung Schritt für Schritt

1. Öffne **Auslöser** im Dashboard. Gib im **Einfachen Modus** das Trigger-Wort ein, baue die Antwort im Editor und erstelle ihn dann.
2. Klappe die neue Karte auf. Aktiviere unter **Wann er zutrifft** die Option **Überall in der Nachricht abgleichen**, wenn das Wort auch mitten im Satz funktionieren soll.
3. Wähle unter **Wie er antwortet**, ob er antworten, eine DM senden oder die Nachricht des Mitglieds löschen soll.
4. Lege unter **Limits** einen Cooldown fest, damit er nicht gespammt werden kann.
5. Gib eine Beispielnachricht in **Diesen Trigger testen** ein und drücke **Testen**. Behebe, was laut Anzeige blockiert.
6. Für eine Level-Up-Ankündigung erstellst du einen Trigger mit beliebigem Text, setzt **Auslösen, wenn** auf „Mitglied steigt ein Level auf", lässt **Antworten in** leer, damit dort gepostet wird, wo das Mitglied geschrieben hat, und verwendest `%user.mention%` und `%xp.level%` in der Antwort.
7. Gib zusammengehörigen Triggern eine **Kategorie**, damit du sie gemeinsam pausieren kannst.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Trigger-IDs zeigt `listchattriggers` an.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `addchattrigger <trigger> <response>` | `act`, `acr` | Administrator | Einen Trigger erstellen; Trigger aus mehreren Wörtern in Anführungszeichen setzen |
| `addchattriggerregex <pattern> <response>` | `actr` | Administrator | Einen Regex-Trigger erstellen |
| `addreactiontrigger <emoji> <response>` | `addrt` | Administrator | Einen Reaktions-Trigger erstellen |
| `editchattrigger <id> <response>` | `ect` | Administrator | Die primäre Antwort ersetzen |
| `deletechattrigger <id>` | `dct` | Administrator | Einen Trigger löschen |
| `listchattriggers` | `lct` | Administrator | Trigger mit IDs auflisten |
| `listchattriggersgroup` | `lctg` | Administrator | Trigger nach Text gruppiert auflisten |
| `showchattrigger <id>` | `sct` | Administrator | Die Einstellungen eines Triggers anzeigen |
| `cttoggle <id>` | `chattriggertoggle` | Administrator | Einen Trigger pausieren oder fortsetzen |
| `ctca <id>` | | Administrator | Abgleich an beliebiger Stelle umschalten |
| `ctat <id>` | | Administrator | Ansprechen erlauben umschalten |
| `ctdm <id>` | | Administrator | DM-Antwort umschalten |
| `ctad <id>` | | Administrator | Löschen der auslösenden Nachricht umschalten |
| `rtt <id>` | `reactottrigger` | Administrator | Reagieren auf die Nachricht statt auf die Antwort umschalten |
| `ctnr <id>` | `chattriggernoresponse` | Administrator | Senden ohne Nachricht umschalten |
| `ctreply <id>` | `chattriggerreply` | Administrator | Antworten auf die Nachricht umschalten |
| `ctdeleteafter <id> <seconds>` | `chattriggerdeleteafter` | Administrator | Die Antwort nach einer Verzögerung löschen |
| `ctreact <id> [emoji...]` | `ctr` | Administrator | Bis zu sechs Reaktionen festlegen oder löschen |
| `ctaddresponse <id> <response>` | `chattriggeraddresponse` | Administrator | Eine zusätzliche Antwort hinzufügen |
| `ctclearresponses <id>` | `chattriggerclearresponses` | Administrator | Zusätzliche Antworten entfernen |
| `ctresponsemode <id> <mode>` | `chattriggerresponsemode` | Administrator | `Single`, `Random`, `RoundRobin` oder `All` |
| `ctprefixtype <id> <type>` | `chattriggersprefixtype` | Administrator | `None`, `Global`, `GuildOrGlobal`, `GuildOrNone` oder `Custom` |
| `ctprefix <id> <prefix>` | `chattriggersprefix` | Administrator | Das eigene Präfix festlegen |
| `chattriggervalidtype <id> <type> <true or false>` | `ctvalidtype`, `ctvt` | Administrator | Einen Trigger-Typ aktivieren oder deaktivieren |
| `ctallowbots <id>` | `chattriggerallowbots` | Administrator | Antworten nur auf Bot-Nachrichten umschalten |
| `ctrgranttoggle <id> @role` | `ctgt`, `ctgranttoggle` | Administrator | Eine zu vergebende Rolle umschalten |
| `ctrremovetoggle <id> @role` | `ctrt`, `ctremovetoggle` | Administrator | Eine zu entfernende Rolle umschalten |
| `chattriggerrolegranttype <id> <type>` | `ctrolegranttype`, `ctrgt` | Administrator | `Sender`, `Mentioned` oder `Both` |
| `chattriggerscrosspostchannel <id> <#channel>` | `ctcpch`, `ctcpchannel`, `ctcrosspostchannel`, `ctcrosspostch` | Administrator | In einen Kanal crossposten |
| `chattriggerscrosspostwebhook <id> <url>` | `ctcpwh`, `ctcpwebhook`, `ctcrosspostwebhook`, `ctcrosspostwh` | Administrator | Über einen Webhook crossposten |
| `setctintertype <id> <type>` | `ctitype`, `ctintertype` | Administrator | `None`, `Slash`, `Message` oder `User` |
| `setctintername <id> <name>` | `ctiname`, `ctrealname` | Administrator | Name des Anwendungsbefehls |
| `setctinterdesc <id> <description>` | `ctidesc`, `ctinterdesc` | Administrator | Beschreibung des Anwendungsbefehls |
| `ctinterephemeral <id> <true or false>` | `ctieph` | Administrator | Ephemere Antwort der Interaktion |
| `ctintererrors` | `ctierrors`, `ctie` | Administrator | Fehler bei der Befehlsregistrierung anzeigen |
| `ctevent <id> <event>` | `chattriggerevent` | Administrator | Bei einem Ereignis auslösen, oder `None` zum Beenden |
| `cteventchannel <id> [#channel]` | `chattriggereventchannel` | Administrator | Kanal für Ereignis-Antworten |
| `ctcooldown <id> <seconds> [scope]` | `chattriggercooldown` | Administrator | Cooldown pro Trigger |
| `ctreqlevel <id> <level>` | `chattriggerrequiredlevel` | Administrator | Erforderliches XP-Level |
| `ctcost <id> <amount>` | `chattriggercost` | Administrator | Währungskosten |
| `ctreward <id> <amount>` | `chattriggerreward` | Administrator | Währungsbelohnung |
| `ctxpreward <id> <amount>` | `chattriggerxpreward` | Administrator | XP-Belohnung |
| `ctreqmsg <id> [message]` | `chattriggerrequirementmessage` | Administrator | Nachricht, wenn eine Anforderung fehlschlägt |
| `cttime <id> <start> <end> [days...]` | `chattriggertime` | Administrator | Aktive Uhrzeiten, oder `cttime <id> clear` |
| `ctexpiry <id> [duration]` | `chattriggerexpiry` | Administrator | Ablauf, oder keine Angabe zum Löschen |
| `ctmaxuses <id> <uses>` | `chattriggermaxuses` | Administrator | Nutzungslimit, 0 für keines |
| `ctminage <id> [duration]` | `chattriggerminimumage` | Administrator | Mindestalter des Kontos |
| `ctminmember <id> [duration]` | `chattriggerminimummembership` | Administrator | Mindestdauer auf dem Server |
| `ctrequirecounter <id> <name> [min] [max]` | `chattriggerrequirecounter` | Administrator | Anforderung an den Zählerbereich |
| `ctcounters` | `chattriggercounters` | Niemand | Zähler auflisten |
| `ctcounterset <name> <value>` | `chattriggercounterset` | Administrator | Einen Zähler setzen |
| `ctcounterdelete <name>` | `chattriggercounterdelete` | Administrator | Einen Zähler löschen |
| `ctplaceholders` | `chattriggerplaceholders` | Niemand | Beigesteuerte Platzhalter auflisten |
| `ctcategory <id> [name]` | `chattriggercategory` | Administrator | Eine Kategorie festlegen oder entfernen |
| `ctcategorytoggle <name> <true or false>` | `chattriggercategorytoggle` | Administrator | Eine Kategorie aktivieren oder deaktivieren |
| `ctchain <id> <nextId>` | `chattriggerchain` | Administrator | Mit einem anderen Trigger verketten, 0 zum Entfernen |
| `cttest <id> <sample>` | `chattriggertest` | Administrator | Eine Beispielnachricht im Trockenlauf testen |
| `ctstats <id>` | `chattriggerstats` | Administrator | Anzahl der Auslösungen und letzte Nutzer |
| `ctsexport` | | Administrator | Trigger als YAML exportieren |
| `ctsimport [url]` | | Administrator | Aus einer URL oder einem Anhang importieren |
| `ctsmigrate` | `ctsconvert` | Administrator | Altes Embed-Format mit Backup konvertieren |
| `ctsclear` | | Administrator | Alle Trigger löschen |
| `ctsreload` | | Bot-Owner | Trigger aus der Datenbank neu laden |

## Tipps und Stolperfallen

- Trigger werden mit der kleingeschriebenen Nachricht abgeglichen, daher unterscheidet der Trigger-Text praktisch nicht zwischen Groß- und Kleinschreibung.
- Ein Trigger mit deaktiviertem **Überall in der Nachricht abgleichen** muss die gesamte Nachricht sein. `hello there` löst keinen Trigger `hello` aus, solange du die Option nicht einschaltest oder das Ansprechen aktivierst.
- Rollenvergaben brauchen „Rollen verwalten", und die Rolle des Bots muss über den betroffenen Rollen stehen. Der Befehl, der eine Rolle zur Liste hinzufügt, prüft außerdem, ob du sie verwalten darfst.
- Nur-Bots-Trigger antworten nie auf Menschen, und Trigger für Menschen antworten nie auf Bots; ein einzelner Trigger kann nicht beides.
- Cooldowns liegen im Arbeitsspeicher und werden beim Neustart des Bots zurückgesetzt. Nutzungslimits und Ablauf werden gespeichert und überstehen Neustarts.
- Die Round-Robin-Reihenfolge wird von allen auf dem Server geteilt und nicht pro Mitglied verfolgt.
- Die Einträge des Berechtigungssystems für das Modul `ActualChatTriggers` und jedes `permoverride` für den Trigger-Text werden vor den eigenen Bedingungen des Triggers geprüft.
- Interaktions-Trigger registrieren echte Anwendungsbefehle, deshalb gelten die Limits von Discord für Anzahl und Namen von Befehlen. Prüfe `ctintererrors`, wenn einer nicht auftaucht.
- Reaktionen auf die Antwort werden im Sekundentakt gesetzt, sechs Emoji brauchen also sechs Sekunden, bis sie erscheinen.
- Ereignis-Trigger für Beitritte, Austritte, Sprach- und Boost-Ereignisse tun stillschweigend nichts, bis du **Antworten in** festlegst.

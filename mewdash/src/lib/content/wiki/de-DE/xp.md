---
title: XP-System
slug: xp
summary: Belohne Mitglieder fürs Chatten und Sprechen im Sprachkanal mit Leveln, Rangkarten, Rollen- und Währungsbelohnungen sowie zeitlich begrenzten Events.
icon: fa-star
category: Community
dashboard: /dashboard/xp
module: Xp
tags: [xp, experience, levels, level up, rank, rank card, leaderboard, role rewards, voice xp, xp boost, competition, xp curve, Erfahrung, Level, Levelaufstieg, Rang, Rangkarte, Bestenliste, Rollenbelohnungen, Sprach-XP, XP-Boost, Wettbewerb, XP-Kurve]
related: [currency, achievements, administration, utility]
---

## Was es macht

Mitglieder sammeln XP, indem sie Nachrichten schreiben und in Sprachkanälen sprechen. XP summieren sich entlang einer Kurve, die du wählst, zu Leveln. Jeder kann `rank` ausführen, um eine gerenderte Rangkarte mit Level, Fortschrittsbalken, Serverrang und Avatar zu erhalten, oder `leaderboard`, um zu sehen, wer vorn liegt.

Steigt ein Mitglied im Level auf, kann der Bot eine Ankündigung im Kanal, in einem eigenen Level-Up-Kanal oder per DM posten. Du kannst eigene Level-Up-Nachrichten mit Platzhaltern schreiben oder das Standard-Embed übernehmen lassen. Das Erreichen eines Levels kann außerdem automatisch Rollen und Server-Währung vergeben.

Das Team steuert, wie schnell XP hereinkommen: XP pro Nachricht, Cooldown, Sprach-XP pro Minute, ein globaler Multiplikator sowie Multiplikatoren pro Kanal und pro Rolle. Zeitlich begrenzte Boost-Events vervielfachen für eine Weile alles, und Wettbewerbe veranstalten ein Rennen mit Belohnungen für die vorderen Plätze. Nutzer, Rollen und Kanäle lassen sich ausschließen, damit Bot-Spam-Kanäle und stummgeschaltete Rollen nichts verdienen.

## Wofür du es nutzen kannst

- Gib aktiven Mitgliedern sichtbaren Fortschritt und einen Grund, weiter zu chatten.
- Schalte bei bestimmten Leveln Rollen frei, damit langjährige Mitglieder Vorteile bekommen, ohne dass das Team es von Hand erledigt.
- Veranstalte ein Doppel-XP-Event am Wochenende oder ein Rennen „Wer erreicht zuerst Level 20“.
- Halte XP fair, indem du Befehlskanäle, AFK-Kanäle und Bot-Rollen ausschließt.
- Verknüpfe XP mit dem Währungsmodul, sodass ein Levelaufstieg auch etwas auszahlt.

## Wie XP verdient werden

### Text-XP

Jede Nachricht eines Mitglieds, das kein Bot ist, bringt einmal pro Cooldown-Fenster **XP pro Nachricht** (Standard 3, höchstens 50). Der **Nachrichten-XP-Cooldown** beträgt standardmäßig 60 Sekunden; ein Mitglied, das in diesem Fenster zehn Nachrichten schreibt, erhält einmal XP. Nachrichten in ausgeschlossenen Kanälen oder von ausgeschlossenen Nutzern und Rollen bringen nichts. Ist der gesamte Server ausgeschlossen, wird nichts gezählt.

Der Betrag wird anschließend multipliziert. Alle diese Multiplikatoren wirken zusammen:

| Multiplikator | Gesetzt mit | Hinweise |
| --- | --- | --- |
| Globaler Multiplikator | `setxpmultiplier` oder **Globaler XP-Multiplikator** | Gilt für jeden Gewinn |
| Kanal-Multiplikator | `setchannelxp` | Gilt für Gewinne in diesem Kanal |
| Rollen-Multiplikator | `setrolexp` | Hat ein Mitglied mehrere Rollen mit Multiplikatoren, zählt nur der höchste |
| Boost-Events | `xpboost` | Jedes aktive Event wird angewendet |

Das Ergebnis wird auf eine ganze Zahl abgerundet.

Der **Erstnachrichten-Bonus** ist eine separate einmalige Gutschrift für die erste Nachricht eines Mitglieds an jedem UTC-Tag. Er wird in den XP-Einstellungen gespeichert, aber nicht im Dashboard angezeigt.

### Sprach-XP

Sprach-XP werden pro Sitzung erfasst. Ein Mitglied verdient sie nur, solange es in einem Sprachkanal mit mindestens zwei teilnehmenden Personen ist (Bots zählen nicht) und weder selbst noch durch den Server stummgeschaltet oder taubgestellt ist. Zeit, in der es stummgeschaltet, taubgestellt oder allein ist, wird nicht gezählt.

Wenn die Sitzung endet, werden die berechtigten Minuten mit **Sprach-XP pro Minute** multipliziert (Standard 2, höchstens 10). Sitzungen unter 15 Sekunden bringen nichts. Der **Sprach-XP-Timeout** (Standard 60 Minuten) ist die maximale Anzahl Minuten, für die eine einzelne Sitzung vergütet wird. Multiplikatoren werden nur dann auf Sprach-XP angewendet, wenn der Grundbetrag mindestens 5 beträgt. Wenn du Sprach-XP pro Minute oder den Timeout auf 0 setzt, sind Sprach-XP aus.

### XP-Verfall

Der Verfall ist optional und standardmäßig aus. Ist er an, sucht der Bot alle zwölf Stunden Mitglieder, deren letzte Aktivität länger zurückliegt als die **Inaktivitätstage vor dem Verfall**, und entfernt den **Täglichen Verfallsprozentsatz** ihrer gesamten XP. Diese drei Einstellungen gibt es im XP-Einstellungsdatensatz, aber noch ohne Befehl oder Dashboard-Steuerung.

## Level und Kurven

Welches Level ein Mitglied hat, hängt vom **XP-Kurventyp** ab. Jede Kurve baut auf einer Basis von 36 XP für Level eins auf.

| Kurve | Befehlsname | Name im Dashboard | Benötigte XP für Level n |
| --- | --- | --- | --- |
| Standard | `Standard` | Standard | 36 x n zum Quadrat |
| Linear | `Linear` | Linear | 36 x n |
| Beschleunigt | `Accelerated` | Quadratisch | 36 x n hoch 1,25 |
| Verlangsamt | `Decelerated` | Exponentiell | 36 x n hoch 2,5 |
| Benutzerdefiniert | `Custom` | nicht angeboten | Wie Standard |
| Legacy | `Legacy` | Legacy | Jedes Level kostet 36 plus 9 pro vorherigem Level, die Summen werden aufaddiert |

Standard ist die Vorgabe. Wenn du die Kurve mit `setxpcurve` änderst, wird das Level aller neu berechnet, es sei denn, du übergibst `false` als zweites Argument. Eine Änderung der Kurve ändert niemandes XP-Summe, sondern nur, welchem Level diese Summe zugeordnet wird.

## Level-Up-Benachrichtigungen

Jedes Mitglied wählt mit `levelnotif` selbst, wie es über Levelaufstiege informiert wird: `None`, `Channel` oder `Dm`. Mitglieder können außerdem `leveluppings false` ausführen, damit der Bot sie nicht erwähnt; ihr Name wird dann als normaler Text angezeigt.

Kanalbenachrichtigungen gehen an den **Level-Up-Kanal**, wenn mit `levelupchannel` einer gesetzt ist, sonst in den Kanal, in dem die XP verdient wurden. Der Bot braucht dort Nachrichten senden.

Hat der Server keine eigenen Nachrichten, ist die Vorgabe ein Embed mit einer Level-Up-Nachricht als Titel, dem Avatar des Mitglieds als Thumbnail und Feldern für Gesamt-XP, Serverrang und neues Level. Hast du mit `addlevelupmessage` eigene Nachrichten hinzugefügt, wird jedes Mal zufällig eine aktivierte Nachricht ausgewählt. Eine eigene Nachricht kann einfacher Text oder Embed-JSON aus dem Embed-Builder sein. Teste jede Vorlage mit `testlevelupmessage`.

### Platzhalter

Diese funktionieren in eigenen Level-Up-Nachrichten, zusätzlich zu den allgemeinen Nutzer- und Server-Platzhaltern von der Platzhalter-Seite. Da Benachrichtigungen den Kanal und die auslösende Person nicht mitverfolgen, wird `%xp.channel.*%` zu „Unknown Channel“, `%xp.triggeruser.*%` zu „System“, und `%xp.gained%` ist immer 0.

| Platzhalter | Wert |
| --- | --- |
| `%xp.user%` | Nutzername und Tag, oder reiner Nutzername, wenn Pings aus sind |
| `%xp.user.mention%` | Erwähnung des Mitglieds, oder reiner Nutzername, wenn Pings aus sind |
| `%xp.user.name%` | Nutzername |
| `%xp.user.displayname%` | Anzeigename |
| `%xp.user.nickname%` | Nickname, ersatzweise Nutzername |
| `%xp.user.avatar%` | Avatar-URL |
| `%xp.user.id%` | Nutzer-ID |
| `%xp.user.created%` | Erstellungsdatum des Kontos |
| `%xp.user.joined%` | Beitrittsdatum zum Server |
| `%xp.level.old%` | Level vor dem Aufstieg |
| `%xp.level.new%` | Neues Level (`%xp.level.current%` ist dasselbe) |
| `%xp.level.next%` | Neues Level plus eins |
| `%xp.level.difference%` | Wie viele Level gewonnen wurden |
| `%xp.total%` | Gesamt-XP |
| `%xp.current%` | Im aktuellen Level verdiente XP |
| `%xp.needed%` | XP, die das aktuelle Level insgesamt erfordert |
| `%xp.remaining%` | XP, die für das nächste Level noch fehlen |
| `%xp.progress%` | Fortschritt im Level als Prozentwert |
| `%xp.rank%` | Serverrang als Zahl |
| `%xp.rank.ordinal%` | Rang in Worten, etwa „third“ |
| `%xp.rank.suffix%` | Nur das Suffix: st, nd, rd oder th |
| `%xp.guild%`, `%xp.guild.name%` | Servername |
| `%xp.guild.id%` | Server-ID |
| `%xp.guild.membercount%` | Ungefähre Mitgliederzahl |
| `%xp.guild.icon%`, `%xp.guild.banner%` | URLs von Server-Icon und -Banner |
| `%xp.time%`, `%xp.time.full%`, `%xp.date%` | Aktuelle UTC-Zeit, Zeit mit Datum und Datum |
| `%xp.timestamp%`, `%xp.timestamp.relative%` | Discord-Zeitstempel-Tags für jetzt |

> [!EXAMPLE]
> `addlevelupmessage %xp.user.mention% just hit level %xp.level.new% and is now %xp.rank.ordinal% on the leaderboard.`

Führe `levelupplaceholders` in Discord aus, um dieselbe Liste zu sehen.

## Rollenbelohnungen

`rolereward <level> <role>` vergibt eine Rolle, wenn ein Mitglied dieses Level erreicht. Ist **Exklusive Rollenbelohnungen** aus (Standard), behalten Mitglieder jede Belohnungsrolle für Level auf oder unter ihrem eigenen und verlieren alle für höhere Level. Ist es an (`setxpexclusive true`), wird nur die Belohnung für das höchste erreichte Level behalten und alle anderen Belohnungsrollen werden entfernt.

Belohnungen werden angewendet, wenn sich ein Level ändert. Mit `syncmyxproles`, `syncuserxproles` oder `syncallxproles` bringst du die Rollen in Einklang, nachdem du Belohnungen hinzugefügt oder XP importiert hast. Die Synchronisierung für alle Nutzer kann einmal pro Stunde laufen, und der Bot braucht Rollen verwalten, wobei seine Rolle über jeder Belohnungsrolle liegen muss.

## Währungsbelohnungen

`currencyreward <level> <amount>` zahlt Server-Währung aus dem Währungsmodul aus, wenn ein Mitglied dieses Level erreicht. Mit 0 wird die Belohnung entfernt. Sinkt das Level eines Mitglieds, zum Beispiel nach `setxp` oder durch Verfall, wird die Währung für die verlorenen Level zurückgenommen.

## Erfolge

[Erfolge](/wiki/achievements) sind ein eigenes System mit eigenen Punkten und Rängen, ein Erfolgsrang ist also kein XP-Level. Die beiden treffen sich an zwei Stellen: Das Erreichen von XP-Leveln schaltet Erfolge in der Kategorie Community frei, und Erfolge können XP zurückgeben, über eine XP-Belohnung pro Erfolg oder **XP pro Punkt** im Tab Einstellungen der Erfolge. Beides ist aus, bis du es einstellst.

## Boost-Events

`xpboost <time> <multiplier> <name>` startet ein zeitlich begrenztes Event, zum Beispiel `xpboost 2h 2.0 Weekend XP Event`. Jeder aktive Boost multipliziert Nachrichten- und Sprach-XP zusätzlich zu den anderen Multiplikatoren. `xpboosts` listet auf, was gerade läuft, und `cancelboost <id>` beendet einen vorzeitig.

## Wettbewerbe

`xpcompetition <time> <type> [targetLevel] [name]` startet ein zeitlich begrenztes Rennen. Mitglieder werden automatisch aufgenommen, sobald sie das erste Mal XP gewinnen, während es läuft.

| Typ | Gewinner |
| --- | --- |
| `MostGained` | Wer während des Wettbewerbs die meisten XP gewonnen hat |
| `ReachLevel` | Wer das Ziel-Level zuerst erreicht |
| `HighestTotal` | Wer bei Ende die höchste Gesamt-XP hat |

Füge Preise mit `addcompetitionreward <id> <position> <type> <reward>` hinzu, wobei der Typ `Role`, `XP` oder `Currency` ist. Rollenbelohnungen werden vergeben, XP-Belohnungen als Bonus-XP gutgeschrieben, und Währung wird über das Währungsmodul ausgezahlt. `competitionleaderboard <id>` zeigt den Zwischenstand, und `endcompetition <id>` beendet vorzeitig und verteilt die Belohnungen.

## Ausschlüsse

`xpexclude` und `xpinclude` akzeptieren einen Nutzer, eine Rolle oder einen Textkanal. Ausgeschlossene Nutzer und alle, die eine ausgeschlossene Rolle haben, verdienen nie XP; ausgeschlossene Kanäle bringen niemandem etwas. Das gilt auch für Sprachkanäle. `xpexcludelist users|roles|channels` zeigt die Listen. Die Slash-Versionen sind `/xp admin exclude`, `/xp admin include` (mit einer Option `user`, `role` oder `channel`) und `/xp exclude-list`. Der Schalter **Server-XP-Ausschluss** im Dashboard deaktiviert den XP-Gewinn für den ganzen Server auf einmal.

## Rangkarten

`rank [@user]` rendert eine PNG-Karte. `textrank [@user]` liefert dieselben Informationen als Text für Screenreader. Bots haben keinen Rang.

Die Karte wird aus der Vorlage des Servers aufgebaut: ein Hintergrundbild (dein eigenes über **Eigener XP-Karten-Hintergrund** oder das eingebaute) sowie Ebenen für Avatar und Namen des Nutzers, den Fortschrittsbalken, das Serverlevel, den Serverrang, die Zeit im aktuellen Level und vergebene Bonus-XP. Jede Ebene kann ein- oder ausgeblendet, verschoben, in der Größe verändert und umgefärbt werden, und der Fortschrittsbalken kann abgerundet, segmentiert oder radial sein und sich in jede Richtung füllen.

Der Tab **Vorlage** öffnet einen visuellen Editor. Auf Bildschirmen unter 768 Pixel Breite wechselt das Dashboard zu einem Touch-Editor mit denselben Ebenen, einem Bottom Sheet für Eigenschaften und einfachen Steuerelementen für Position und Größe. Auf breiteren Bildschirmen erhältst du den vollständigen Editor mit Ebenenliste, Raster, Einrasten, Linealen, Rückgängig und Wiederholen sowie Zoom.

## Bestenliste

`leaderboard [page]` zeigt die Rangliste des Servers. Nutzt der Server zusätzlich das Währungsmodul und ist Währung im Umlauf, fragt ein einfaches `leaderboard`, ob du XP oder Währung meinst; wer eine Seite angibt, meint immer XP. Der Tab **Bestenliste** im Dashboard zeigt dieselbe Rangliste mit einer Aktion **XP anpassen**, die XP eines Mitglieds erhöhen, setzen oder zurücksetzen kann, optional auch unter Löschung der Bonus-XP.

## Einstellungen

Das Dashboard hat sechs Tabs: **Einstellungen**, **Statistiken**, **Bestenliste**, **Belohnungen**, **Vorlage** und **Ausnahmen**. Diese Einstellungen befinden sich im Tab Einstellungen.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Server-XP-Ausschluss | aus | Stoppt jeden XP-Gewinn auf dem Server |
| XP pro Nachricht | 3 | Basis-XP pro Nachricht, höchstens 50 |
| Nachrichten-XP-Cooldown | 60 Sekunden | Mindestabstand zwischen Nachrichten-XP-Gutschriften pro Mitglied |
| Sprach-XP pro Minute | 2 | Basis-XP pro berechtigter Sprachminute, höchstens 10; 0 deaktiviert Sprach-XP |
| Sprach-XP-Timeout | 60 Minuten | Höchstzahl an Minuten, für die eine Sprachsitzung vergütet wird |
| Globaler XP-Multiplikator | 1 | Multipliziert jeden Gewinn |
| XP-Kurventyp | Standard | Welche Kurve XP den Leveln zuordnet |
| Eigener XP-Karten-Hintergrund | keiner | Bild-URL, die hinter den Rangkarten verwendet wird |

Der Tab **Belohnungen** verwaltet Rollen- und Währungsbelohnungen, und **Ausnahmen** verwaltet ausgeschlossene Kanäle und Rollen. **Statistiken** zeigt die Gesamtzahl der Nutzer, Gesamt-XP, durchschnittliches Level, höchstes Level und die jüngste XP-Aktivität.

Diese Felder gibt es auch im Datensatz `GuildXpSetting`, sie werden aber nur per Befehl gesetzt: `FirstMessageBonus`, `ExclusiveRoleRewards` (`setxpexclusive`), `LevelUpChannel` (`levelupchannel`), `LevelUpMessage` und die Verfallsfelder `EnableXpDecay`, `InactivityDaysBeforeDecay` und `DailyDecayPercentage`.

## Einrichtung Schritt für Schritt

1. Öffne **XP-System** im Dashboard und prüfe, dass **Server-XP-Ausschluss** aus ist.
2. Lass unter **Einstellungen** die Nachrichten- und Sprachwerte zunächst auf den Standardwerten, wähle eine Kurve und klicke dann auf **Änderungen speichern**.
3. Schließe unter **Ausnahmen** Befehlskanäle von Bots und alle stummgeschalteten oder Bot-Rollen aus.
4. Füge unter **Belohnungen** für ein paar Meilenstein-Level eine Rollenbelohnung hinzu. Achte darauf, dass die Rolle des Bots über diesen Rollen liegt.
5. Führe in Discord `levelupchannel #level-ups` aus und füge ein oder zwei Vorlagen per `addlevelupmessage` hinzu. Teste mit `testlevelupmessage`.
6. Öffne **Vorlage**, lade einen Hintergrund hoch und gestalte die Karte. Führe `rank` aus, um das Ergebnis zu sehen.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `rank [@user]` | | Keine | Eine Rangkarte anzeigen |
| `textrank [@user]` | | Keine | Rang-Informationen als Text |
| `leaderboard [page]` | `lb` | Keine | XP-Rangliste des Servers |
| `levelnotif <None\|Channel\|Dm>` | `lvlnotif` | Keine | Wählen, wie du über Levelaufstiege informiert wirst |
| `leveluppings <true\|false>` | `lvluppings` | Keine | Ob Level-Up-Nachrichten dich erwähnen dürfen |
| `xpsettings` | `xpconfig` | Server verwalten | Die aktuellen XP-Einstellungen anzeigen |
| `setmessagexp <amount>` | `setmsgxp` | Server verwalten | XP pro Nachricht |
| `setxpcooldown <seconds>` | `xpcd` | Server verwalten | Nachrichten-XP-Cooldown |
| `setvoicexp <amount>` | | Server verwalten | Sprach-XP pro Minute |
| `setvoicetimeout <minutes>` | | Server verwalten | Obergrenze der Sprachsitzung |
| `setxpmultiplier <number>` | `xpmult` | Server verwalten | Globaler Multiplikator |
| `setxpcurve <type> [recompute]` | | Server verwalten | Die Levelkurve ändern |
| `setxpexclusive <true\|false>` | `xpexclusive`, `exclusivexp`, `setxpexcl`, `xpexcl` | Server verwalten | Nur die höchste Belohnungsrolle behalten |
| `setchannelxp <#channel> <number>` | | Server verwalten | Kanal-Multiplikator |
| `setrolexp <role> <number>` | | Server verwalten | Rollen-Multiplikator |
| `addxp <@user> <amount>` | | Server verwalten | Einem Mitglied XP hinzufügen |
| `setxp <@user> <amount>` | | Server verwalten | Die XP eines Mitglieds setzen |
| `resetxp <@user> [resetBonus]` | | Server verwalten | Die XP eines Mitglieds auf null zurücksetzen |
| `resetxp` | | Administrator | XP des ganzen Servers zurücksetzen |
| `xpboost <time> <multiplier> <name>` | | Server verwalten | Ein Boost-Event starten |
| `xpboosts` | | Keine | Aktive Boosts auflisten |
| `cancelboost <id>` | | Server verwalten | Einen Boost vorzeitig beenden |
| `xpexclude <@user\|role\|#channel>` | | Server verwalten | Von XP ausschließen |
| `xpinclude <@user\|role\|#channel>` | | Server verwalten | Einen Ausschluss aufheben |
| `xpexcludelist [users\|roles\|channels]` | | Keine | Ausschlüsse anzeigen |
| `rolereward <level> <role>` | `rr` | Rollen verwalten | Eine Rollenbelohnung hinzufügen |
| `removerolereward <level>` | `removerr` | Rollen verwalten | Eine Rollenbelohnung entfernen |
| `rolerewards` | | Keine | Rollenbelohnungen auflisten |
| `currencyreward <level> <amount>` | `cr` | Server verwalten | Eine Währungsbelohnung hinzufügen |
| `removecurrencyreward <level>` | `removecr` | Server verwalten | Eine Währungsbelohnung entfernen |
| `currencyrewards` | | Keine | Währungsbelohnungen auflisten |
| `xpcompetition <time> <type> [targetLevel] [name]` | | Server verwalten | Einen Wettbewerb starten |
| `addcompetitionreward <id> <position> <Role\|XP\|Currency> <reward>` | | Server verwalten | Einen Preis für eine Platzierung hinzufügen |
| `xpcompetitions` | | Keine | Aktive Wettbewerbe auflisten |
| `competitionleaderboard <id>` | `complb` | Keine | Zwischenstand des Wettbewerbs |
| `endcompetition <id>` | | Server verwalten | Einen Wettbewerb beenden und auszahlen |
| `syncallxproles` | | Administrator | Belohnungsrollen für alle neu anwenden (einmal pro Stunde) |
| `syncmyxproles` | | Keine | Deine eigenen Belohnungsrollen neu anwenden (einmal pro fünf Minuten) |
| `syncuserxproles <@user>` | | Rollen verwalten | Die Belohnungsrollen eines Mitglieds neu anwenden |
| `levelupchannel [#channel]` | `lvlupchan` | Server verwalten | Wohin Kanalbenachrichtigungen gehen; ohne Kanal der aktuelle |
| `addlevelupmessage <text or embed JSON>` | `addlvlupmsg` | Server verwalten | Eine eigene Level-Up-Nachricht hinzufügen |
| `levelupmessages` | `lvlupmsgs` | Server verwalten | Eigene Nachrichten mit IDs auflisten |
| `removelevelupmessage <id>` | `remlvlupmsg` | Server verwalten | Eine eigene Nachricht löschen |
| `togglelevelupmessage <id> <true\|false>` | `togglelvlupmsg` | Server verwalten | Eine Nachricht aktivieren oder deaktivieren |
| `testlevelupmessage [template]` | `testlvlupmsg` | Server verwalten | Eine Vorlage oder eine zufällig gespeicherte in der Vorschau ansehen |
| `levelupplaceholders` | `lvlupplaceholders` | Server verwalten | Die obigen Platzhalter auflisten |

Slash-Entsprechungen findest du unter `/xp`, wobei die Team-Befehle gruppiert sind als `/xp admin` (add, set, reset, exclude, include, Rollen-Syncs), `/xp config` (Raten, Multiplikatoren, Kurve, exklusiv), `/xp rewards`, `/xp boost`, `/xp competition` und `/xp levelup`. `/xp admin reset` ohne Nutzer setzt die XP des ganzen Servers zurück; es braucht Administrator und `confirm: true`.

## Tipps und Stolperfallen

- Rollenbelohnungen und Rollen-Syncs brauchen Rollen verwalten beim Bot, und seine höchste Rolle muss über jeder Belohnungsrolle liegen. `syncallxproles` und `syncuserxproles` verweigern ohne das die Ausführung.
- Sprach-XP brauchen mindestens zwei nicht stummgeschaltete, nicht taubgestellte Menschen im Kanal. Ein Mitglied, das allein oder stummgeschaltet dasitzt, verdient nichts, egal wie lange es bleibt.
- XP-Gewinne werden gebündelt und im Hintergrund geschrieben, daher kann `rank` der letzten Nachricht einige Sekunden hinterherhinken.
- Das Senken der XP eines Mitglieds mit `setxp` oder `resetxp` kann sein Level senken, was Belohnungsrollen entfernt und Währungsbelohnungen für die verlorenen Level zurückfordert.
- Die Kurve `Custom` verhält sich genau wie Standard und wird im Dashboard nicht angeboten. Wähle Legacy nur, wenn du von einer älteren Einrichtung migrierst und bestehende Level zueinander passen sollen.
- Eigene Level-Up-Nachrichten ersetzen das Standard-Embed vollständig. Sind alle eigenen Nachrichten deaktiviert, kommt das Standard-Embed zurück.
- Boost-Events und Wettbewerbe werden nur per Befehl verwaltet; das Dashboard zeigt sie nicht.

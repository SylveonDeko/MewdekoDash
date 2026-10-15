---
title: Patreon
slug: patreon
summary: Verbinde eine Patreon-Kampagne, gib Unterstützern Discord-Rollen passend zu ihrer Stufe und poste einen monatlichen Dank mit aktuellen Zahlen zu Unterstützern und Einnahmen.
icon: fa-heart
category: Community
dashboard: /dashboard/patreon
module: Patreon
tags: [patreon, supporters, patrons, donations, premium, tier roles, role sync, announcement, oauth, Unterstützer, Spenden, Stufenrollen, Rollensynchronisierung, Ankündigung]
related: [administration, utility]
---

## Was es macht

Ein Server-Owner, der eine Patreon-Kampagne betreibt, verknüpft sie mit dem Bot, indem er sich mit seinem Creator-Konto anmeldet. Ab dann holt der Bot die Stufen und Unterstützer der Kampagne, hält sie synchron und kann Discord-Rollen danach vergeben, wie viel jeder Unterstützer zusagt. Ist das Discord-Konto eines Unterstützers bei Patreon bekannt, erfolgt die Verknüpfung automatisch; andernfalls kann das Team ein Mitglied von Hand mit einem Patreon-Nutzer verknüpfen.

Einmal im Monat, an einem Tag deiner Wahl, kann der Bot in einem Kanal eine Ankündigung posten, die den Unterstützern dankt. Die Nachricht kann reiner Text oder ein Embed sein und aktuelle Zahlen wie die Zahl aktiver Unterstützer, die monatlichen Einnahmen und wie viele Leute diesen Monat dazugekommen sind enthalten. Außerdem gibt es einen Anerkennungsbefehl, der für alle, die in der letzten Woche Unterstützer wurden, einen Shout-out postet.

Das Dashboard übernimmt den ganzen Ablauf: Verbinden, Unterstützer und Stufen ansehen, Stufen Rollen zuordnen und die Ankündigungseinstellungen bearbeiten. Befehle decken dasselbe Gebiet ab, plus Statistiken und Bestenlisten im Chat.

## Wofür du es brauchst

- Unterstützer sollen eine farbige Rolle und Zugang zu Patron-Kanälen erhalten, ohne dass das Team Patreon von Hand prüft.
- Stufen ändern Rollen automatisch, wenn jemand upgradet, downgradet oder die Zusage beendet.
- Du willst einen wiederkehrenden Beitrag „Danke an unsere 40 Unterstützer“, der korrekt bleibt, ohne dass Zahlen bearbeitet werden müssen.
- Das Team will innerhalb von Discord schnell sehen, wer unterstützt und auf welcher Stufe.

## Eine Kampagne verbinden

Das Verbinden nutzt Patreons OAuth-Ablauf. Die Karte **Patreon verbinden** im Dashboard oder der nur für Bot-Owner verfügbare Befehl `patreonsync` erzeugt einen Link „Authorize with Patreon“. Melde dich mit dem Konto an, dem die Kampagne gehört, bestätige den angeforderten Zugriff, und Patreon schickt dich zurück zur Patreon-Seite des Dashboards. Der Bot tauscht den Code gegen Tokens, speichert die erste gefundene Kampagne und führt sofort eine vollständige Synchronisierung von Stufen und Unterstützern aus.

Das verwendete Konto muss eine Kampagne besitzen. Hat es keine, schlägt der Callback mit „No Patreon campaigns found for this user“ fehl.

Der Tab **Übersicht** des Dashboards zeigt den Verbindungsstatus mit der **Kampagnen-ID**, der **Letzten Synchronisierung** und **Token läuft ab**, plus Übersichtskarten für aktive **Unterstützer**, monatliche **Einnahmen** und den **Kampagnen-Creator**. Tokens werden automatisch erneuert, wenn sie ablaufen; die **Schnellaktionen** im selben Tab sind **Alle Daten synchronisieren**, **Rollen synchronisieren**, **Ankündigung senden** und **Erneut anmelden**. Erneut anmelden trennt die Kampagne: Es löscht die Tokens, behält aber deine Kanal-, Nachrichten- und Zuordnungseinstellungen, sodass du dich wieder verbinden kannst. Die Kopfzeile der Seite hat außerdem die Buttons **Daten aktualisieren** und **Unterstützer synchronisieren**.

> [!NOTE]
> Die Patreon-Integration muss vom Host des Bots aktiviert werden. Hat der Bot keine Patreon-Client-ID konfiguriert, melden der Verbinden-Button und `patreonsync`, dass die Integration nicht konfiguriert ist.

## Unterstützer und Synchronisierung

Eine Synchronisierung holt jedes Mitglied der Kampagne mit seinem Zusagebetrag, Status und, wo der Unterstützer Discord mit Patreon verbunden hat, seiner Discord-Nutzer-ID. Aktive Unterstützer sind jene, die Patreon als aktiv meldet oder die eine laufende Zusage haben. Der Tab **Unterstützer** listet sie mit **Name** (und E-Mail, wo Patreon eine liefert), **Zusage**, **Beigetreten** und **Status** auf, und der Button **Unterstützer synchronisieren** oben auf der Seite aktualisiert die Liste.

`patreonsupporters` zeigt im Chat bis zu 15 aktive Unterstützer mit ihrer Zusage und Discord-Erwähnung, `patreontop [count]` reiht die Top 1 bis 20 nach Zusage, `patreonstats` fasst Unterstützerzahl, Anzahl verknüpfter, Gesamt- und Durchschnittseinnahmen und Stufenzahl zusammen, und `patreonanalytics` ergänzt ehemalige Unterstützer, Einnahmen über die gesamte Laufzeit, neue Unterstützer diesen Monat und die Stufenverteilung.

Ist das Discord-Konto eines Unterstützers auf Patreons Seite nicht verknüpft, nutze `patreonlink @member <patreonUserId>`, um ihn manuell zu verknüpfen. Die Patreon-Nutzer-ID ist die numerische ID des Patreon-Kontos des Unterstützers; die Unterstützerliste des Dashboards zeigt sie nicht an.

## Zuordnung von Stufen zu Rollen

Jede Patreon-Stufe kann einer Discord-Rolle zugeordnet werden. Wähle im Tab **Stufenzuordnung** eine **Patreon-Stufe** und eine **Discord-Rolle** und speichere. Die Liste **Verfügbare Stufen** zeigt jede veröffentlichte Stufe mit ihrem Preis und ob sie zugeordnet ist. Im Chat macht `patreontiermap <tierId> @role` dasselbe; Stufen-IDs erhältst du mit `patreonroles`.

Die Rollensynchronisierung ist aus, bis du sie mit `patreonrolesync` oder dem Kontrollkästchen **Rollensynchronisierung aktivieren** einschaltest. Ist sie an, ermittelt der Bot, welche Rolle ein Unterstützer haben sollte: die zugeordnete Stufe mit dem höchsten Preis, deren Betrag höchstens seiner Zusage entspricht. Alle anderen zugeordneten Patreon-Rollen, die er hält, werden entfernt, und die Zielrolle wird hinzugefügt. Ein Unterstützer, der die Zusage beendet, verliert alle zugeordneten Rollen.

Die Synchronisierung passiert, wenn ein Mitglied verknüpft wird und wenn du `patreonsyncall` oder die Dashboard-Aktion zum Synchronisieren der Rollen ausführst. Nur Unterstützer mit bekannter Discord-ID können synchronisiert werden.

> [!PERMISSION]
> Der Bot braucht Rollen verwalten, und seine eigene Rolle muss über jeder zugeordneten Rolle liegen. Rollen über dem Bot werden übersprungen.

## Monatliche Ankündigungen

Lege einen Kanal mit `patreonch #channel` oder der Auswahl **Ankündigungskanal** fest und einen Tag mit `patreonday <1..28>` oder **Ankündigungstag (1-28)**. Der Tag ist auf 28 begrenzt, damit der Februar nie einen Monat überspringt. Ankündigungen sind aus, bis du `patreontoggle` ausführst oder **Ankündigungen aktivieren** anhakst.

Der Bot prüft jede Stunde. Am gewählten Tag postet er, falls er diesen Monat noch nicht angekündigt hat, und hält die Zeit fest. War der Bot an dem Tag offline, holt er das beim Start nach, solange der Tag in diesem Monat bereits vorbei ist. `patreonannounce` postet sofort eine, was auch als Beitrag dieses Monats zählt.

Ohne eigene Nachricht postet der Bot einen Standard-Dank, der die Zahl aktiver Unterstützer und die monatlichen Einnahmen enthält. Lege mit `patreonmsg <text or embed code>` oder dem Nachrichteneditor für die Ankündigung im Dashboard deine eigene fest. Der Text läuft durch den Embed-Parser. Mit `-` kehrst du zum Standard zurück.

### Platzhalter

Diese funktionieren in der Ankündigungsnachricht neben den üblichen Server- und Kanal-Platzhaltern.

| Platzhalter | Wert |
| --- | --- |
| `%month%` | Name des aktuellen Monats |
| `%year%` | Aktuelles Jahr |
| `%patreon.link%` | `https://patreon.com` |
| `%supporter.count%` | Aktive Unterstützer |
| `%supporter.total%` | Alle jemals erfassten Unterstützer |
| `%supporter.new%` | Neue Unterstützer diesen Monat |
| `%supporter.former%` | Ehemalige Unterstützer |
| `%supporter.linked%` | Unterstützer mit verknüpftem Discord-Konto |
| `%revenue.monthly%` | Aktuelle monatliche Zusagen |
| `%revenue.average%` | Durchschnittliche Zusage |
| `%revenue.lifetime%` | Einnahmen über die gesamte Laufzeit |
| `%growth.new%` | Neue Unterstützer diesen Monat |
| `%top.supporter.name%` | Unterstützer mit der höchsten Zusage |
| `%top.supporter.amount%` | Seine Zusage |
| `%patron.name%` | Unterstützer mit der höchsten Zusage, wie `%top.supporter.name%` |
| `%patron.tier%` | Die Stufe, auf der dieser Unterstützer ist, oder „Unknown“, wenn Patreon keine gemeldet hat |
| `%patron.amount%` | Seine monatliche Zusage, wie `%top.supporter.amount%` |
| `%tiers.count%` | Anzahl der Stufen |
| `%tier.popular%` | Stufe mit den meisten Unterstützern |
| `%tier.popular.count%` | Wie viele darauf sind |
| `%supporters.summary%` | Fertiger Satz zur Unterstützerzahl |
| `%revenue.summary%` | Fertiger Satz zu den Einnahmen |
| `%growth.summary%` | Fertiger Satz zum Wachstum |

> [!EXAMPLE]
> `It's %month%! Thanks to %supporters.summary%%revenue.summary%!%growth.summary%` wird zu „It's December! Thanks to our 25 incredible supporters who help us raise $150/month! We gained 3 new supporters this month!“

## Neue Unterstützer würdigen

`patreonrecognize [#channel]` postet ein Willkommens-Embed für Unterstützer, deren Zusage in den letzten sieben Tagen begonnen hat, bis zu fünf pro Durchlauf, im angegebenen oder im aktuellen Kanal. Es ist ein manueller Befehl, kein Zeitplan, führe ihn also nach einer Synchronisierung aus. Zweimal ausgeführt postet er dieselben Leute zweimal.

## Einstellungen

Das Dashboard hat vier Tabs: **Übersicht**, **Unterstützer**, **Stufenzuordnung** und **Konfiguration**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Ankündigungskanal | keiner | Wohin der monatliche Beitrag geht; keiner bedeutet, dass Ankündigungen deaktiviert sind |
| Ankündigungstag (1-28) | keiner | Tag des Monats für den Beitrag; Ankündigungen lösen nicht aus, bis einer gesetzt ist |
| Ankündigungsnachricht | eingebauter Dank | Eigener Text oder Embed mit den obigen Platzhaltern |
| Ankündigungen aktivieren | aus | Ob der monatliche Beitrag gesendet wird |
| Rollensynchronisierung aktivieren | aus | Ob zugeordnete Rollen auf Unterstützer angewendet werden |
| Stufenzuordnungen | keine | Welche Rolle jede Stufe vergibt |

## Einrichtung Schritt für Schritt

1. Öffne **Patreon** im Dashboard und klicke auf den Verbinden-Button. Melde dich mit dem Konto des Kampagnen-Owners an und bestätige den Zugriff.
2. Warte auf die erste Synchronisierung und prüfe dann, ob der Tab **Unterstützer** deine Patrons zeigt.
3. Ordne unter **Stufenzuordnung** jede Stufe einer Rolle zu. Erstelle die Rollen zuerst und setze die Rolle des Bots darüber.
4. Hake **Rollensynchronisierung aktivieren** an und führe dann `patreonsyncall` aus, um Rollen auf alle bereits Verknüpften anzuwenden.
5. Wähle unter **Konfiguration** den **Ankündigungskanal** und den **Ankündigungstag**, schreibe eine Nachricht mit den Platzhaltern und hake **Ankündigungen aktivieren** an.
6. Führe einmal `patreonannounce` aus, um das Ergebnis im Kanal zu sehen.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `patreonsync` | `ptsync` | Bot-Owner | Den OAuth-Autorisierungslink posten |
| `patreonch [#channel]` | `ptch` | Administrator | Den Ankündigungskanal anzeigen oder festlegen |
| `patreondisable` | `ptdisable` | Administrator | Den Kanal löschen und damit Ankündigungen deaktivieren |
| `patreonmsg [text]` | `ptmsg` | Administrator | Die Ankündigungsnachricht anzeigen oder festlegen, `-` zum Zurücksetzen |
| `patreonday [day]` | `ptday` | Administrator | Den Tag des Monats anzeigen oder festlegen |
| `patreontoggle` | `pttoggle` | Administrator | Ankündigungen ein- oder ausschalten |
| `patreonconfig` | `ptconfig` | Administrator | Status, Kanal, Tag, Nachricht und letzten Beitrag anzeigen |
| `patreonannounce` | `ptannounce` | Administrator | Die Ankündigung jetzt senden |
| `patreonhelp` | `pthelp` | Niemand | Platzhalterliste und Befehlsübersicht |
| `patreonsupporters` | `ptsupporters` | Administrator | Aktive Unterstützer auflisten |
| `patreontop [count]` | `pttop` | Niemand | Top-Unterstützer nach Zusage |
| `patreonstats` | `ptstats` | Administrator | Zusammenfassung zu Unterstützern und Einnahmen |
| `patreonanalytics` | `ptanalytics` | Administrator | Detaillierte Analysen |
| `patreonlink <user> <patreonUserId>` | `ptlink` | Administrator | Ein Mitglied mit einem Patreon-Nutzer verknüpfen |
| `patreonrolesync` | `ptrolesync` | Rollen verwalten | Die automatische Rollensynchronisierung umschalten |
| `patreontiermap <tierId> <role>` | `pttiermap` | Rollen verwalten | Eine Stufe einer Rolle zuordnen |
| `patreonroles` | `ptroles` | Administrator | Stufen mit ihren IDs und Rollen auflisten |
| `patreonsyncall` | `ptsyncall` | Rollen verwalten | Rollen auf jeden verknüpften Unterstützer anwenden |
| `patreonrecognize [#channel]` | `ptrecognize` | Administrator | Unterstützer der letzten sieben Tage hervorheben |

## Tipps und Stolperfallen

- Nur Unterstützer, die in ihrem Patreon-Profil Discord verbunden haben oder mit `patreonlink` verknüpft wurden, können Rollen erhalten.
- Die Rollensynchronisierung wählt pro Unterstützer eine Rolle, die beste Stufe, die seine Zusage abdeckt. Das Stapeln mehrerer Stufenrollen wird nicht unterstützt.
- Ankündigungen werden höchstens einmal pro Kalendermonat gepostet. Führst du `patreonannounce` am 3. aus, entfällt in diesem Monat der geplante Beitrag am 15.
- Der Ankündigungstag gilt in UTC.
- Die monatliche Ankündigung betrifft die ganze Kampagne, daher beschreiben `%patron.name%`, `%patron.tier%` und `%patron.amount%` den aktiven Unterstützer mit der höchsten Zusage und nicht jeden Patron der Reihe nach. Nutze `patreonrecognize` für Shout-outs pro Unterstützer.
- Das erneute Verbinden mit einem anderen Patreon-Konto wechselt die Kampagne, behält aber alte Zuordnungen, prüfe also danach den Tab **Stufenzuordnung**.

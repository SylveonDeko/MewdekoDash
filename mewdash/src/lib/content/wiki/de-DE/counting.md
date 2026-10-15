---
title: Zählen
slug: counting
summary: Mach aus einem Kanal ein Zählspiel, in dem Mitglieder abwechselnd die nächste Zahl posten, mit Reaktionen, Serien, Bestenlisten, Speicherpunkten und optionalen Strafen fürs Verzählen.
icon: fa-list-numeric
category: Community
dashboard: /dashboard/counting
module: Counting
tags: [counting, count, numbers, game, channel, leaderboard, streak, milestones, save point, Zählen, Zahlen, Spiel, Kanal, Bestenliste, Serie, Meilensteine, Speicherpunkt]
related: [administration, xp]
---

## Was es macht

Das Team wählt einen Kanal und führt `countingsetup` aus. Ab dann beobachtet der Bot jede Nachricht in diesem Kanal. Ist eine Nachricht die nächste erwartete Zahl, reagiert der Bot mit einem Häkchen und verbucht die Zählung für dieses Mitglied. Ist es die falsche Zahl, reagiert der Bot mit einem Kreuz und löscht die Nachricht standardmäßig zwei Sekunden später, damit der Kanal sauber bleibt.

Der Bot merkt sich die aktuelle Zahl, die höchste jemals erreichte Zahl, die Gesamtzahl der Zählungen und wer zuletzt gezählt hat. Standardmäßig darf dasselbe Mitglied nicht zweimal hintereinander zählen, das Spiel braucht also mindestens zwei Personen. Mitglieder können ihre eigenen Statistiken, Serien und ihre Genauigkeit abrufen, und es gibt eine Bestenliste pro Kanal.

Für das Team gibt es Speicherpunkte, mit denen du den Zähler nach einem schlechten Lauf zurückrollen kannst, eine Moderationsebene, die falsche Zählungen pro Mitglied innerhalb eines Zeitfensters erfasst und gestaffelte Strafen verhängt, Zähl-Banns und Timeouts sowie Rollenregeln dafür, wer mitmachen darf. Mehrere Kanäle können gleichzeitig zählen, jeder mit eigenen Einstellungen.

## Wofür du es nutzen kannst

- Ein unkompliziertes Community-Spiel, das sich von selbst abspielt und Mitgliedern ein gemeinsames Ziel gibt.
- Große Server können einen Cooldown und die Regel gegen Wiederholungen ergänzen, damit niemand allein den Zähler farmt.
- Das Team kann den Zähler von einem Speicherpunkt wiederherstellen, statt darüber zu streiten, wer ihn verbockt hat.
- Wiederholungstäter, die den Zähler absichtlich immer wieder brechen, können automatisch stummgeschaltet oder vom Zählen gebannt werden.

## Wie eine Zählung geprüft wird

Wenn ein Mitglied in einem Zählkanal postet, führt der Bot diese Prüfungen der Reihe nach aus:

1. Mitglieder, die vom Zählen gebannt sind, werden komplett ignoriert.
2. Mitglieder mit einer gebannten Rolle, ohne eine der erforderlichen Rollen oder mit einer ignorierten Rolle werden übersprungen. Nachrichten von ignorierten Rollen werden gelöscht, wenn du das so eingestellt hast.
3. Sieht die Nachricht wie eine gültige Zahl aus, testet der Bot, ob er darauf reagieren kann. Scheitert die Reaktion, wertet der Bot das als Blockieren des Bots durch das Mitglied, löscht die Nachricht und postet eine kurze Warnung, die nach fünf Sekunden verschwindet.
4. Ein Mitglied, das noch im **Abklingzeit** ist, wird abgewiesen.
5. Ist **Wiederholte Nutzer erlauben** aus und dasselbe Mitglied hat zuletzt gezählt, wird die Nachricht abgewiesen.
6. Der Text wird mit dem Muster des Kanals geparst. Alles, was keine Zahl ist, wird nach den Nicht-Zahlen-Regeln unten behandelt.
7. Die Zahl muss der aktuellen Zahl plus der **Schrittweite** entsprechen. Eine falsche Zahl zählt als Fehler für dieses Mitglied, und ist **Zähler bei Fehler zurücksetzen** an, wird der Kanal auf die Startzahl zurückgesetzt.
8. Ist **Maximalzahl** gesetzt und die Zahl überschreitet sie, stoppt das Zählen und das Team wird benachrichtigt.

Eine richtige Zählung aktualisiert den Kanal, die Statistiken und die Serie des Mitglieds, startet dessen Cooldown, prüft Meilensteine und protokolliert das Ereignis.

Erfolgreiche Zählungen erhalten die Reaktion **Erfolgs-Emote** (standardmäßig ein Häkchen), Fehlschläge das **Fehler-Emote** (standardmäßig ein Kreuz). Beides kann ein Standard-Emoji oder ein benutzerdefiniertes Emote sein.

## Zählmuster

Das Muster bestimmt, wie Mitglieder Zahlen schreiben müssen. Der Bot parst diese Muster:

| Muster | Mitglieder tippen |
| --- | --- |
| Normal | Reine Ziffern: `1`, `2`, `3`. Bei einer anderen **Zahlenbasis** als 10 werden die Ziffern in dieser Basis gelesen. |
| Roman | Römische Ziffern: `I`, `II`, `III`, `IV` |
| Binary | `1`, `10`, `11`, `100` |
| Hexadecimal | `1` bis `9`, dann `A`, `B`, `C` |
| Words | Ausgeschriebene Wörter wie `twenty-one` oder `one hundred and five` |
| Ordinal | `1st`, `2nd`, `3rd`, `4th` |
| Fibonacci | Die Fibonacci-Folge: `1`, `1`, `2`, `3`, `5`, `8` |
| Primes | Nur Primzahlen: `2`, `3`, `5`, `7`, `11` |

Normal ist die Vorgabe. Das Muster wird im Dashboard gesetzt; es gibt dafür keinen Befehl.

> [!WARNING]
> Das Dropdown **Zählmuster** im Dashboard listet derzeit Sequential, Skip Multiples, Fibonacci, Primes und Powers of Two, und seine Werte stimmen nicht mit der Musterliste des Bots oben überein. Vorerst ist nur Sequential (Normal) sicher aus dem Dashboard wählbar.

## Meilensteine

Der Bot erfasst einen Meilenstein, wenn der Zähler zum ersten Mal auf einem Vielfachen von 100, 500, 1.000, 5.000 oder 10.000 landet. Meilensteine erscheinen im Tab **Statistiken** und in `countingstatus`.

Der Tab **Verwaltung** im Dashboard und `countingmilestones` lassen dich pro Kanal eine eigene Liste von Meilenstein-Zahlen speichern, derselbe Tab und `countingmilestonemessage` speichern eine Meilenstein-Nachricht, und `countingmilestonechannel` speichert einen Kanal für Meilenstein-Ankündigungen. Diese Werte werden gespeichert, aber der Bot postet noch keine Meilenstein-Ankündigung, betrachte sie also als reserviert für eine künftige Version.

## Statistiken und Bestenlisten

Jedes Mitglied hat Statistiken pro Kanal: Beiträge, aktuelle Serie, höchste Serie, Genauigkeit, Fehler, insgesamt gezählte Zahlen und letzter Beitrag. `countingstats` zeigt sie mit dem Rang des Mitglieds.

`countingleaderboard` und der Tab **Bestenliste** sortieren nach einem von vier Typen:

| Typ | Gerankt nach |
| --- | --- |
| `contributions` | Anzahl richtiger Zählungen (Standard) |
| `streak` | Höchste Serie |
| `accuracy` | Richtige Zählungen als Prozentwert |
| `totalnumbers` | Insgesamt gezählte Zahlen |

Der Befehl zeigt die Top 20, zehn pro Seite.

## Speicherpunkte

`countingsave` speichert die aktuelle Zahl mit einem optionalen Grund und gibt dir eine Speicher-ID. `countingrestore <id>` setzt den Kanal nach einer Bestätigungsabfrage auf diese Zahl zurück. `countingreset` setzt den Zähler direkt auf eine beliebige Zahl, mit Bestätigung, standardmäßig auf 0. Alle drei gibt es auch im Tab **Verwaltung**.

## Moderation

Die Zähl-Moderation ist aus, bis du sie aktivierst, entweder pro Kanal mit `countmodenable true` oder serverweit mit `countmoddefaults true`. Kanaleinstellungen überschreiben die Server-Standardwerte; `countmodreset` setzt einen Kanal auf die Standardwerte zurück.

Ist sie an, wird jede falsche Zahl dem Mitglied zugeschrieben und seiner Zählung falscher Zahlen für das **Zeitfenster** hinzugefügt (Standard 24 Stunden, 1 bis 168). Gestaffelte Strafen greifen, wenn die Zählung eines Mitglieds eine exakte Zahl erreicht: `countmodpunish 3 Mute 30` schaltet bei der dritten falschen Zahl für 30 Minuten stumm. Stufen, die mit einem Kanal gesetzt werden, gelten für diesen Kanal; Stufen ohne Kanal sind Server-Standardwerte, und Kanalstufen haben Vorrang. `Softban`, `Kick` und `RemoveRoles` können keine Dauer annehmen, und Dauern sind auf 49 Tage begrenzt. `AddRole` braucht eine Rolle.

Zwei zusätzliche Regeln gelten nur, wenn die Moderation an ist:

- **Nicht-Zahlen**: `countmodnonnumbers` legt fest, ob Chatnachrichten im Kanal gelöscht werden (Standard ja) und ob sie als Verstoß zählen (Standard nein).
- **Bearbeitungen**: `countmodedits` legt fest, ob das Bearbeiten einer Nachricht im Kanal sie löscht (Standard ja) und ob es als Verstoß zählt (Standard nein).

Rollenregeln: **Erforderliche Rollen** bedeutet, dass ein Mitglied mindestens eine davon braucht, um zu zählen, **Gebannte Rollen** blockiert Mitglieder, die eine davon haben, und `countmodignore` überspringt Mitglieder mit den aufgelisteten Rollen und löscht optional deren Nachrichten.

`countingban`, `countingtimeout` und `countingunban` blockieren ein einzelnes Mitglied in einem Kanal, dauerhaft oder für eine Dauer. Der Tab **Verwaltung** hat dieselben Steuerelemente per Nutzer-ID, dazu eine Schaltfläche **Kanaldaten löschen**, die `countingdisable` mit Purge entspricht.

## Einstellungen

Das Dashboard hat fünf Tabs: **Kanäle**, **Konfiguration**, **Statistiken**, **Bestenliste** und **Verwaltung**. Wähle zuerst unter **Kanäle** einen Kanal; die anderen Tabs wirken auf diesen Kanal.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Startzahl | 1 | Die Zahl, bei der das Zählen beginnt, bei der Einrichtung gesetzt |
| Schrittweite | 1 | Wie viel jede Zählung addiert; muss positiv sein |
| Zählmuster | Normal | Wie Zahlen geschrieben werden, siehe oben |
| Zahlenbasis | 10 | Basis, die das Muster Normal verwendet |
| Cooldown (Sekunden) | 0 | Wartezeit zwischen zwei Zählungen desselben Mitglieds, 0 bis 300 |
| Maximalzahl | 0 (unbegrenzt) | Das Zählen stoppt, wenn diese überschritten wird |
| Erfolgs-Emote | Häkchen | Reaktion auf eine richtige Zählung |
| Fehler-Emote | Kreuz | Reaktion auf eine falsche Zählung |
| Wiederholte Nutzer erlauben | Aus | Ein Mitglied darf zweimal hintereinander zählen |
| Zähler bei Fehler zurücksetzen | Aus | Eine falsche Zahl setzt den Kanal auf den Start zurück |
| Falsche Nachrichten löschen | An | Falsche Zahlen nach zwei Sekunden löschen |
| Erfolge aktivieren | An | Gespeicherte Option, die in `countingconfig` angezeigt wird |
| Wettbewerbe aktivieren | An | Gespeicherte Option, die in `countingconfig` angezeigt wird |
| Erforderliche Rollen | keine | Mitglieder brauchen eine davon, um zu zählen |
| Gebannte Rollen | keine | Mitglieder mit diesen können nicht zählen |

> [!NOTE]
> Der Befehl `countingfailurethreshold` speichert einen Wert von 1 bis 10 (Standard 3) und `countmodthreshold` speichert einen Schwellenwert für falsche Zahlen, aber Strafen greifen nur über die Stufen, die du mit `countmodpunish` setzt.

## Einrichtung Schritt für Schritt

1. Erstelle einen Kanal und gib dem Bot dort Kanal ansehen, Nachrichten senden, Reaktionen hinzufügen, Nachrichten verwalten und Nachrichtenverlauf lesen.
2. Öffne **Zählen** im Dashboard, wähle den Kanal unter **Neuen Zählkanal einrichten**, setze **Startzahl** und **Schrittweite** und speichere.
3. Setze in **Konfiguration** einen **Abklingzeit**, wenn du das Spiel verlangsamen willst, und wähle Emotes.
4. Füge optional **Erforderliche Rollen** oder **Gebannte Rollen** hinzu.
5. Wenn du automatische Strafen willst, führe `countmodenable true` im Kanal aus und füge Stufen mit `countmodpunish` hinzu.
6. Poste `1` von einem Konto und `2` von einem anderen, um zu bestätigen, dass die Reaktionen funktionieren.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `countingsetup [#channel] [start] [increment]` | `csetup`, `countsetup` | Kanäle verwalten | Das Zählen in einem Kanal starten |
| `countingstatus [#channel]` | `cstatus`, `countstatus` | Keine | Aktuelle Zahl, Rekord, Summen und aktive Regeln |
| `countingconfig [#channel]` | `cconfig`, `countconfig` | Kanäle verwalten | Die Konfiguration des Kanals anzeigen |
| `countingreset [#channel] [number] [reason]` | `creset`, `countreset` | Nachrichten verwalten | Den Zähler zurücksetzen, Standard 0, mit Bestätigung |
| `countingstats [@user] [#channel]` | `countstats` | Keine | Zählstatistiken und Rang eines Mitglieds |
| `countingleaderboard [type] [#channel]` | `cleaderboard`, `countleaderboard`, `clb` | Keine | Top 20 nach contributions, streak, accuracy oder totalnumbers |
| `countingsave [#channel] [reason]` | `csave`, `countsave` | Nachrichten verwalten | Einen Speicherpunkt erstellen |
| `countingrestore <saveId> [#channel]` | `crestore`, `countrestore` | Nachrichten verwalten | Auf einen Speicherpunkt zurückrollen |
| `countingdisable [#channel] [purge] [reason]` | `cdisable`, `countdisable` | Kanäle verwalten | Das Zählen beenden; `true` löscht zusätzlich alle Daten |
| `countinglist` | `clist`, `countlist` | Kanäle verwalten | Aktive Zählkanäle auflisten |
| `countingban <@user> [#channel] [duration] [reason]` | `cban`, `countban` | Nachrichten verwalten | Ein Mitglied vom Zählen bannen, dauerhaft, sofern keine Dauer angegeben ist |
| `countingunban <@user> [#channel] [reason]` | `cunban`, `countunban` | Nachrichten verwalten | Einen Zähl-Bann aufheben |
| `countingtimeout <@user> <duration> [#channel] [reason]` | `ctimeout`, `counttimeout` | Nachrichten verwalten | Vorübergehender Zähl-Bann |
| `countingcooldown [#channel] [seconds]` | `ccooldown`, `countcooldown` | Kanäle verwalten | Den Cooldown anzeigen oder setzen, 0 bis 300 |
| `countingmilestones [#channel] [50,100,...]` | `cmilestones`, `countmilestones` | Kanäle verwalten | Eigene Meilenstein-Zahlen anzeigen, setzen oder mit `-` zurücksetzen |
| `countingsuccessmessage [#channel] [text]` | `csuccessmessage`, `countsuccessmessage` | Kanäle verwalten | Eine Erfolgsvorlage speichern, `-` setzt zurück |
| `countingfailuremessage [#channel] [text]` | `cfailuremessage`, `countfailuremessage` | Kanäle verwalten | Eine Fehlschlagsvorlage speichern, `-` setzt zurück |
| `countingmilestonemessage [#channel] [text]` | `cmilestonemessage`, `countmilestonemessage` | Kanäle verwalten | Eine Meilensteinvorlage speichern, `-` setzt zurück |
| `countingmilestonechannel [#counting] [#target]` | `cmilestonechannel`, `countmilestonechannel` | Kanäle verwalten | Einen Meilenstein-Kanal speichern, ohne Angabe löschen |
| `countingfailurechannel [#counting] [#target]` | `cfailurechannel`, `countfailurechannel` | Kanäle verwalten | Einen Fehlschlag-Log-Kanal speichern, ohne Angabe löschen |
| `countingfailurethreshold [#channel] [1-10]` | `cfailurethreshold`, `countfailurethreshold` | Kanäle verwalten | Den Fehlschlag-Schwellenwert anzeigen oder setzen |
| `countmodshow [#channel]` | `cmshow`, `countmoderationshow` | Kanäle verwalten | Moderationskonfiguration und Server-Standardwerte anzeigen |
| `countmoddefaults <on/off> [threshold] [hours] [punishment] [minutes] [@role]` | `cmdefaults`, `countmoderationdefaults` | Administrator | Serverweite Moderations-Standardwerte |
| `countmodenable <on/off> [#channel]` | `cmenable`, `countmoderationenable` | Kanäle verwalten | Die Moderation für einen Kanal ein- oder ausschalten |
| `countmodthreshold <1-100> [#channel]` | `cmthreshold`, `countmoderationthreshold` | Kanäle verwalten | Den Schwellenwert für falsche Zahlen des Kanals setzen |
| `countmodwindow <1-168> [#channel]` | `cmwindow`, `countmoderationwindow` | Kanäle verwalten | Stunden, die eine falsche Zahl erfasst bleibt |
| `countmodpunishment <action> [minutes] [@role] [#channel]` | `cmpunishment`, `countmoderationpunishment` | Kanäle verwalten | Die Standardstrafe des Kanals setzen |
| `countmodpunish <count> <action> [minutes] [@role] [#channel]` | `cmpunish`, `countmoderationpunish` | Kanäle verwalten | Strafe bei einer exakten Zahl falscher Zählungen; ohne Kanal Server-Standard |
| `countmodunpunish <count> [#channel]` | `cmunpunish`, `countmoderationunpunish` | Kanäle verwalten | Eine Stufe entfernen |
| `countmodpunishlist [#channel]` | `cmpunishlist`, `countmoderationpunishlist` | Kanäle verwalten | Stufen auflisten |
| `countmodignore <delete> [#channel] [@roles...]` | `cmignore`, `countmoderationignore` | Kanäle verwalten | Rollen, die der Bot ignoriert, optional mit Löschen ihrer Nachrichten |
| `countmodrequired [#channel] [@roles...]` | `cmrequired`, `countmoderationrequired` | Kanäle verwalten | Rollen, die zum Zählen nötig sind |
| `countmodbanned [#channel] [@roles...]` | `cmbanned`, `countmoderationbanned` | Kanäle verwalten | Rollen, die nicht zählen können |
| `countmodnonnumbers <punish> [delete] [#channel]` | `cmnonnumbers`, `countmoderationnonnumbers` | Kanäle verwalten | Regeln für Chat im Kanal |
| `countmodedits <punish> [delete] [#channel]` | `cmedits`, `countmoderationedits` | Kanäle verwalten | Regeln für bearbeitete Nachrichten |
| `countmodreset [#channel]` | `cmreset`, `countmoderationreset` | Kanäle verwalten | Der Kanal geht auf die Server-Standardwerte zurück |
| `countmodclear <@user> [#channel]` | `cmclear`, `countmoderationclear` | Nachrichten verwalten | Die falschen Zählungen eines Mitglieds löschen |
| `countmodclearall [#channel]` | `cmclearall`, `countmoderationclearall` | Nachrichten verwalten | Die falschen Zählungen aller löschen |

## Tipps und Stolperfallen

- Der Bot braucht Reaktionen hinzufügen im Kanal. Ohne das bekommt nichts ein Häkchen oder Kreuz, und gültige Zählungen werden vom Bot-Block-Test übersprungen.
- Das Löschen falscher Zahlen und von Chat ohne Zahlen braucht Nachrichten verwalten.
- Mitglieder, die den Bot blockiert haben, können nicht zählen: ihre Zahl wird gelöscht und eine Warnung gepostet.
- Bei der Standardregel gegen Wiederholungen wird ein Mitglied, das zweimal hintereinander postet, abgewiesen, noch bevor die Zahl gelesen wird, und diese Abweisung zählt nicht als Fehler.
- **Zähler bei Fehler zurücksetzen** setzt auf die Startzahl zurück; bei einem Start von 1 ist die nächste erwartete Zahl also wieder 1.
- Moderationsstrafen nutzen dieselben Aktionen wie das Verwarnsystem (Mute, Ban, Kick, AddRole und so weiter), daher braucht der Bot die passenden Discord-Berechtigungen und eine Stummschalt-Rolle.
- `countingdisable` mit Purge entfernt Statistiken, Banns und Speicherpunkte dieses Kanals und lässt sich nicht rückgängig machen. Deaktivieren ohne Purge behält die Daten.

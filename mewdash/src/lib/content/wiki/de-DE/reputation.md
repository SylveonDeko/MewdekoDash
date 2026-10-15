---
title: Reputation
slug: reputation
summary: Lass Mitglieder sich gegenseitig mit Reputationspunkten danken, mit Cooldowns und Missbrauchsgrenzen, Rollenbelohnungen bei Schwellenwerten, Vergabe per Reaktion und optionalem Verfall für inaktive Mitglieder.
icon: fa-trophy
category: Community
dashboard: /dashboard/reputation
module: Reputation
tags: [reputation, rep, karma, thanks, role rewards, leaderboard, reaction rep, decay, cooldown, Danke, Rollenbelohnungen, Bestenliste, Reaktions-Reputation, Verfall]
related: [xp, administration]
---

## Was es macht

Ein Mitglied führt `rep @user` aus, um einen Reputationspunkt zu geben, optional mit einem Grund. Die Gesamtzahl des Empfängers steigt, die tägliche Serie des Gebers wird verfolgt, und der Verlauf hält fest, wer was und warum gegeben hat. Jeder kann mit `repcheck` Summen prüfen, mit `repleaderboard` die Rangliste des Servers ansehen und mit `rephistory` die letzten zehn Einträge lesen.

Das Team legt fest, wie frei Rep fließt: ein Cooldown pro Paar aus Geber und Empfänger, Tages- und Wochenlimits sowie ein Mindestalter des Kontos, eine Mindestzeit auf dem Server und eine Mindestanzahl Nachrichten, bevor jemand überhaupt geben darf. Kanäle können für Rep deaktiviert oder mit einem Multiplikator versehen werden. Reputation kann auch über Reaktionen verdient werden: Ein konfiguriertes Emoji unter einer Nachricht gibt deren Autor Punkte.

Bei gewählten Schwellenwerten vergibt der Bot Rollen, kündigt den Meilenstein in einem Kanal an und schickt dem Mitglied eine DM. Optionaler Verfall entfernt langsam Punkte von Mitgliedern, die eine Weile weder Rep gegeben noch erhalten haben, sodass die Bestenliste die aktuelle Aktivität widerspiegelt.

## Wofür du es nutzen kannst

- Würdige hilfsbereite Mitglieder in Support-Kanälen und gib ihnen eine sichtbare Rolle.
- Lass eine Daumen-hoch-Reaktion im Showcase-Kanal dem Künstler Punkte geben.
- Binde einen Befehl oder einen Kanal an ein Reputationslevel statt an eine manuell vergebene Rolle.
- Veranstalte ein Wochenend-Event, bei dem Rep in einem Kanal doppelt zählt.
- Halte eine Support-Bestenliste ehrlich, mit Verfall für Leute, die aufhören zu helfen.

## Reputation vergeben

Jedes `rep` gibt einen Punkt, multipliziert mit dem Kanal-Multiplikator, falls einer gesetzt ist. Du kannst weder dir selbst noch einem Bot Rep geben. Jeder Versuch durchläuft diese Prüfungen in dieser Reihenfolge, und das erste Scheitern wird dem Geber gemeldet:

| Prüfung | Standard | Was passiert |
| --- | --- | --- |
| System aktiviert | an | Alles wird abgelehnt, solange es aus ist |
| Kanalstatus | aktiviert | Ein Kanal mit dem Status `disabled` lehnt dort vergebenes Rep ab |
| Empfänger eingefroren | nein | Eingefrorene Mitglieder können kein Rep erhalten |
| Cooldown | 60 Minuten | Zeit, bevor derselbe Geber demselben Empfänger erneut Rep geben kann |
| Tageslimit | 10 | Rep, das ein Geber pro UTC-Tag vergeben darf |
| Wochenlimit | keines | Optionale Obergrenze pro Woche, ab Sonntag gezählt |
| Min. Kontoalter | 7 Tage | Alter des Discord-Kontos des Gebers |
| Min. Zeit auf dem Server | 24 Stunden | Wie lange der Geber schon auf dem Server ist |
| Min. Nachrichtenanzahl | 10 | Nachrichten, die der Geber gesendet hat, aus der Nachrichtenzählung |

Anonymes Rep verbucht den Eintrag als anonym, aber nur, wenn anonymes Geben in der Konfiguration aktiviert ist. Negative Reputation ist ein eigener Schalter; das Entfernen einer Reaktion nimmt die Punkte, die sie gegeben hat, ohnehin zurück.

### Serien und Statistiken

Rep an aufeinanderfolgenden Tagen aufzubauen erzeugt eine Serie; eine Lücke von mehr als anderthalb Tagen setzt sie zurück. `repstats` zeigt Gesamtzahl, Rang, gegeben, erhalten, aktuelle und längste Serie sowie die Zeitpunkte des letzten Gebens und Erhaltens.

### Eigene Typen

`reptypeadd helpful Helpful` erstellt einen benannten Typ. Mitglieder führen dann `rep @user helpful thanks for the fix` aus. Standard-Rep erhöht nur die Gesamtzahl; ein eigener Typ führt zusätzlich eine eigene Zählung pro Typ, auf die Befehlsvoraussetzungen zielen können.

## Reaktionen

`repreaction <emoji> [amount] [type]` lässt eine Reaktion dem Autor der Nachricht Rep geben. Der Reagierende darf kein Bot sein, und das Entfernen der Reaktion nimmt die Punkte zurück. Der Befehl vergibt standardmäßig einen Punkt Standard-Rep, und jede Reaktionskonfiguration hat ihren eigenen Cooldown.

## Rollenbelohnungen

`reprole @Role 100` gibt die Rolle, sobald ein Mitglied 100 Rep erreicht. Optionen: die Rolle wieder entfernen, wenn das Rep unter den Schwellenwert fällt (standardmäßig an), den Meilenstein in einem Kanal ankündigen und eine DM senden. Belohnungen werden nach jeder Rep-Änderung geprüft. Bonus-XP können bei einer Belohnung hinterlegt werden, werden aber noch nicht ausgezahlt.

Unabhängig von Rollenbelohnungen postet der Bot eine Meilenstein-Nachricht in den **Benachrichtigungskanal**, wenn ein Mitglied 50, 100, 250, 500, 1000, 2500, 5000 oder 10000 Rep überschreitet. Mitglieder bekommen außerdem eine DM, wenn sie zehn oder mehr Punkte auf einmal erhalten oder auf einem Vielfachen von zehn landen.

## Verfall

Ist er aktiviert, prüft der Bot jede Stunde, ob es Zeit für den Verfall ist. `daily` läuft um 02:00 UTC, `weekly` am Sonntag um 02:00 UTC, `monthly` am Ersten des Monats. Mitglieder, die im Inaktivitätszeitraum weder Rep gegeben noch erhalten haben, verlieren den Verfallsbetrag, entweder eine feste Zahl Punkte oder einen Prozentsatz ihrer Gesamtzahl, nie unter null. Eingefrorene Mitglieder werden übersprungen. Standardwerte: weekly, 1 Punkt, 30 inaktive Tage.

## Befehlsvoraussetzungen

`repcommandreq <command> <minimum> [type] [#channels]` blockiert einen Befehl, bis das Mitglied so viel Rep hat, optional von einem eigenen Typ und optional nur in bestimmten Kanälen. `repcommandbypass` nimmt Rollen aus, und mit `repcommandinfo` kann jeder sehen, was ein Befehl braucht.

## Einstellungen

Die Reputation-Seite hat vier Tabs: **Konfiguration**, **Rollenbelohnungen**, **Bestenliste** und **Statistiken**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Reputationssystem aktivieren | an | Hauptschalter |
| Cooldown (Minuten) | 60 | Pro Paar aus Geber und Empfänger |
| Tageslimit | 10 | Rep pro Geber und Tag |
| Wochenlimit (optional) | keines | Rep pro Geber und Woche |
| Min. Kontoalter (Tage) | 7 | Voraussetzung für Geber |
| Min. Zeit auf dem Server (Stunden) | 24 | Voraussetzung für Geber |
| Min. Nachrichtenanzahl | 10 | Voraussetzung für Geber |
| Benachrichtigungskanal (optional) | keiner | Wohin Meilenstein-Nachrichten gehen |
| Negative Reputation erlauben | aus | Aktiviert negative Beträge |
| Anonyme Reputation aktivieren | aus | Lässt `repanon` den Geber verbergen |

Der Verfall ist nicht im Dashboard; nutze die `repdecay*`-Befehle unten.

**Rollenbelohnungen** hat ein Formular mit **Rolle**, **Benötigte Reputation**, **Ankündigungskanal (optional)**, **Bonus-XP (optional)**, **Rolle entfernen, wenn die Reputation unter die Schwelle fällt** und **DM-Benachrichtigung senden**. **Bestenliste** zeigt die Rangliste und öffnet den Verlauf eines Mitglieds. **Statistiken** zeigt die Gesamtzahl der Nutzer, insgesamt vergebenes Rep, Transaktionen und durchschnittliches Rep.

## Einrichtung Schritt für Schritt

1. Öffne **Reputation** im Dashboard. Schalte unter **Konfiguration** **Aktiviert** ein.
2. Stelle **Abklingzeit**, **Tageslimit** und die drei Mindestvoraussetzungen passend zur Größe deines Servers ein.
3. Wähle einen **Benachrichtigungskanal** für Meilensteine und speichere.
4. Füge unter **Rollenbelohnungen** eine Rolle mit ihrer **Benötigte Reputation** hinzu und hake **Rolle entfernen, wenn die Reputation unter die Schwelle fällt** an, wenn sie dauerhaft verdient werden soll.
5. Führe in Discord `repreaction <emoji> 1` aus, um Reaktions-Rep zu aktivieren, und `repchannel #bot-spam disabled`, um Spam-Kanäle auszuschließen.
6. Teste mit einem zweiten Konto: `rep @you great help`, dann `repcheck @you`.

> [!WARNING]
> `represet all` löscht nach einer Bestätigung das Rep, den Verlauf und die Abzeichen aller Mitglieder des Servers. Es gibt kein Rückgängigmachen.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `rep <@user> [type] [reason]` | `+rep`, `giverep`, `gr`, `repgive` | Keine | Einen Punkt geben |
| `repanon <@user> [type] [reason]` | `anongiverep` | Keine | Anonym geben |
| `anonrep <@user> [type] [reason]` | | Keine | Wie `repanon` |
| `repcheck [@user]` | `myrep`, `checkrep` | Keine | Gesamtzahl und Rang anzeigen |
| `repleaderboard [page]` | `replb`, `reptop`, `toprep` | Keine | Rangliste, 25 pro Seite |
| `rephistory [@user]` | `rephist` | Keine | Die letzten zehn Rep-Einträge |
| `repstats [@user]` | `repstat` | Keine | Detaillierte Statistiken und Serien |
| `repcommandinfo <command>` | `repcmdinfo`, `rci` | Keine | Die Rep-Voraussetzung eines Befehls anzeigen |
| `repstatus` | `repsettings` | Administrator | Die Konfiguration anzeigen |
| `repconfig` | `repcfg` | Administrator | Interaktives Konfigurationsmenü |
| `repenable [true/false]` | `repe` | Administrator | Das System ein- oder ausschalten |
| `repcooldown <minutes>` | `repcd` | Administrator | 1 bis 1440 |
| `repdailylimit <n>` | `repdl` | Administrator | 1 bis 100 |
| `repweeklylimit [n]` | `repwl` | Administrator | 1 bis 500, oder ohne Angabe löschen |
| `repminage <days>` | `repma` | Administrator | 0 bis 365 |
| `repminmembership <hours>` | `repmm` | Administrator | 0 bis 720 |
| `repminmessages <n>` | `repminmsg` | Administrator | 0 bis 1000 |
| `repnegative <true/false>` | `repneg` | Administrator | Negatives Rep erlauben |
| `repanonymous <true/false>` | `repanonym` | Administrator | Anonymes Rep erlauben |
| `repnotificationchannel [#channel]` | `repnotify` | Administrator | Den Meilenstein-Kanal setzen oder löschen |
| `repchannel <#channel> [enabled/disabled/readonly] [multiplier]` | `repch` | Administrator | Status und Multiplikator pro Kanal |
| `repdecay <true/false>` | `repd` | Administrator | Verfall aktivieren |
| `repdecaytype <daily/weekly/monthly/fixed/percentage>` | `repdt` | Administrator | Verfallszeitplan oder Betragsart |
| `repdecayamount <n>` | `repda` | Administrator | 1 bis 100 Punkte oder Prozent |
| `repdecayinactive <days>` | `repdi` | Administrator | 1 bis 365 Tage vor dem Verfall |
| `reptake <@user> [amount]` | `-rep`, `takerep` | Administrator | Punkte entfernen |
| `repset <@user> <amount>` | `setrep` | Administrator | Eine Gesamtzahl setzen |
| `represet <@user or all>` | `resetrep` | Administrator | Ein Mitglied oder alle zurücksetzen |
| `repfreeze <@user>` | `freezerep` | Administrator | Ein Mitglied daran hindern, Rep zu erhalten |
| `repunfreeze <@user>` | `unfreeze`, `unfreezerep` | Administrator | Ein Einfrieren aufheben |
| `repreaction <emoji> [amount] [type]` | `repemoji`, `rre` | Administrator | Eine Reaktionsbelohnung hinzufügen oder aktualisieren |
| `repreactionremove <emoji>` | `repemojiremove`, `rrer` | Administrator | Eine Reaktionsbelohnung entfernen |
| `repreactionlist` | `repemojilist`, `rrel` | Administrator | Reaktionsbelohnungen auflisten |
| `reprole [@role] [rep] [removeOnDrop] [#channel] [dm] [xp]` | | Rollen verwalten | Rollenbelohnungen hinzufügen, aktualisieren oder auflisten |
| `reproleremove <@role>` | `reprr` | Rollen verwalten | Eine Rollenbelohnung entfernen |
| `reprolechannel <@role> [#channel]` | `reprc` | Administrator | Den Ankündigungskanal einer Belohnung setzen oder löschen |
| `repcommandreq <command> <min> [type] [#channels]` | `repcmdreq`, `rcr` | Administrator | Rep für einen Befehl verlangen |
| `repcommandbypass <command> <@roles>` | `repcmdbypass`, `rcb` | Administrator | Rollen, die die Voraussetzung überspringen |
| `repcommandreqremove <command>` | `repcmdreqremove`, `rcrr` | Administrator | Eine Voraussetzung entfernen |
| `repcommandreqlist` | `repcmdreqlist`, `rcrl` | Administrator | Voraussetzungen auflisten |
| `reptypeadd <name> <display name>` | `repaddtype`, `rta` | Administrator | Einen eigenen Typ hinzufügen |
| `reptyperemove <name>` | `repremovetype`, `rtr` | Administrator | Einen eigenen Typ entfernen |
| `reptypelist` | `replisttypes`, `rtl` | Administrator | Eigene Typen auflisten |
| `repeventcreate <name> <multiplier> <hours>` | `repec` | Administrator | Ein Multiplikator-Event erfassen |
| `repeventend <name>` | `repee` | Administrator | Ein Event vorzeitig beenden |
| `repexport` | `repex` | Administrator | Die Konfiguration als JSON exportieren |
| `repimport` | `repim` | Administrator | Eine an die Nachricht angehängte Konfigurationsdatei importieren |
| `repmilestonelost <@user> <@role> <threshold>` | | Administrator | Testnachricht für einen verlorenen Meilenstein |

Die Slash-Befehle `/rep` umfassen `give`, `check`, `leaderboard`, `history` und `stats`, dazu die Admin-Gruppen `/rep config`, `/rep decay`, `/rep manage`, `/rep reaction`, `/rep role`, `/rep type`, `/rep event` und `/rep require`, die die Einstellungsbefehle oben abbilden. `/rep role list` und `/rep role info` gibt es nur als Slash-Befehl.

## Tipps und Stolperfallen

- Rollenbelohnungen brauchen die Rolle des Bots über jeder Belohnungsrolle und die Berechtigung Rollen verwalten, und `reprole` lehnt Rollen über dem Bot ab.
- Die Mindestanzahl Nachrichten nutzt die Nachrichtenzählung. Ist das Zählen aus, können Mitglieder mit einer Zählung von null am Rep-Geben gehindert werden.
- Nur der Kanalstatus `disabled` blockiert das Geben. `readonly` wird vom Befehl akzeptiert, stoppt Rep in diesem Kanal aber derzeit nicht.
- Mit `repeventcreate` erstellte Events werden mit ihrem Multiplikator und ihrer Endzeit gespeichert, aber der Multiplikator wird derzeit nicht auf während des Events vergebenes Rep angewendet.
- Reaktions-Rep nutzt bei Standard-Emojis den Namen des Emojis und bei benutzerdefinierten dessen ID, daher passt ein benutzerdefiniertes Emoji von einem anderen Server nicht mehr, sobald es entfernt wurde.
- Verfallsprüfungen laufen zur vollen Stunde, ein `daily`-Verfall findet also einmal in der Stunde um 02:00 UTC statt.
- Der Cooldown gilt pro Paar. Ein Mitglied kann mehreren verschiedenen Leuten direkt nacheinander Rep geben, bis zum Tageslimit.

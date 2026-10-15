---
title: Kanalzugriff
slug: channel-access
summary: Schütze einen privaten Kanal mit einem Bewerbungsformular und lass die Mitglieder, die schon drin sind, darüber abstimmen, wer hineinkommt.
icon: fa-lock
category: Security
dashboard: /dashboard/channel-access
module: ChannelAccess
tags: [channel access, gate, application, apply, vote, private channel, locked channel, inner circle, blacklist, review, Kanalzugriff, Bewerbung, Abstimmung, privater Kanal, gesperrter Kanal, innerer Kreis, Prüfung]
related: [administration, tickets, forms]
---

## Was es macht

Das Team setzt ein „Gate“ auf einen Kanal, den die meisten Mitglieder nicht sehen können. Mitglieder klicken auf einen Button **Zugang beantragen** oder führen `channelaccessapply` aus und füllen ein kurzes Formular mit bis zu fünf Fragen aus. Die Bewerbung wird als Embed in einem Prüfkanal gepostet, mit den Buttons **Genehmigen**, **Ablehnen**, optional **Enthalten** und **Aufschlüsselung**.

Die Leute, die den Kanal bereits sehen können, stimmen ab. Sobald genug Zustimmungen eintreffen, wird der Bewerber eingelassen, entweder indem er eine Rolle erhält oder eine persönliche Berechtigungsüberschreibung für den Kanal bekommt. Genug Ablehnungen oder das Ende des Abstimmungszeitraums weisen ihn ab. Das Team kann jederzeit eines der beiden Ergebnisse erzwingen.

Der Bewerber erfährt das Ergebnis per DM, wenn das Gate es erlaubt, und abgelehnte Bewerber müssen einen Cooldown abwarten, bevor sie sich erneut bewerben. Alles wird in einem optionalen Log-Kanal protokolliert.

## Wofür du es nutzen kannst

- Eine Lounge nur für Mitglieder oder ein „innerer Kreis“, in dem bestehende Mitglieder entscheiden, wer beitritt.
- Ein Kanal für verifizierte Erwachsene, in dem eine kleine vertrauenswürdige Gruppe für Neulinge bürgt.
- Handels- oder Marktplatz-Kanäle, die eine Plausibilitätsprüfung wollen, bevor jemand posten kann.
- Jeder Kanal, für den du eine schriftliche Bewerbung willst, ohne dass das Team jede selbst lesen muss.

## Gates

Ein Gate ist ein Kanal plus seine Regeln. Jeder Kanal kann ein Gate haben. Ein Gate mit einer Rolle zu erstellen macht es zu einem **Rollen-Gate**; eines ohne Rolle zu erstellen macht es zu einem **Direkt-Gate**.

| Vergabemodus | Bezeichnung im Dashboard | Wie Zugang gegeben wird | Wer als „drinnen“ zählt |
| --- | --- | --- | --- |
| Role | Eine Rolle geben | Die Zugangsrolle wird dem Bewerber hinzugefügt | Jeder mit der Zugangsrolle |
| Channel permission | Direkt zum Kanal hinzufügen | Für dieses Mitglied wird eine Überschreibung mit Kanal ansehen erlaubt geschrieben | Jeder, der den Kanal aktuell sehen kann |

Genehmigte Mitglieder werden nie automatisch entfernt. Nimm die Rolle selbst weg oder lösche die Überschreibung selbst.

## Bewerbungen

Bevor eine Bewerbung geöffnet wird, prüft der Bot der Reihe nach: Das Gate nimmt Bewerbungen an, das Mitglied hat noch keinen Zugang, es ist nicht blockiert, sein Konto und sein Serverbeitritt sind alt genug, es hat keine offene Bewerbung für dieses Gate, und sein Cooldown für erneute Bewerbung ist abgelaufen. Scheitert eine Prüfung, kommt eine ephemere Nachricht mit dem Grund.

Hat das Gate Fragen, öffnet sich ein Modal mit einem Feld pro Frage. Fragen sind wegen Discords Modal-Limits auf 45 Zeichen begrenzt. Antwortfelder sind entweder einzeilig (200 Zeichen) oder mehrzeilig (1000 Zeichen) und können als erforderlich markiert werden. Ein Gate ohne Fragen wird sofort abgeschickt.

Die Prüfnachricht geht in den **Prüfkanal**, oder, wenn keiner gesetzt ist, in den gesperrten Kanal selbst. Sie zeigt den Bewerber, wann sein Konto erstellt wurde und wann er beigetreten ist, jede Frage mit Antwort, einen aktuellen Stimmenstand und eine Fußzeile, wann die Abstimmung endet. Ist **Bewerber bis zum Ende der Abstimmung verbergen** an, wird der Name solange die Bewerbung aussteht durch „Hidden until the vote closes“ ersetzt.

### Status

| Status | Bedeutung |
| --- | --- |
| Pending | Offen und in Abstimmung |
| Approved | Angenommen, Zugang wurde gewährt |
| Denied | Per Abstimmung, Ablauf oder vom Team abgelehnt |
| Withdrawn | Der Bewerber hat sie mit `channelaccesswithdraw` zurückgezogen |
| Expired | Wird von den aktuellen Ablaufregeln nicht verwendet; für den Verlauf behalten |

## Abstimmung

Wer abstimmen darf, hängt vom Gate ab. Ist eine **Abstimmungsrolle** gesetzt, dürfen nur Mitglieder mit dieser Rolle abstimmen. Andernfalls dürfen alle abstimmen, die bereits Zugang zum Kanal haben, sowie alle mit Rollen verwalten. Bewerber können nie über ihre eigene Bewerbung abstimmen.

Ein Klick auf einen Button erfasst eine Stimme. Ein Klick auf einen anderen Button ändert sie. Erneutes Klicken auf denselben Button entfernt sie. Der Stimmenstand wird nach jeder Änderung in der Nachricht aktualisiert.

Die Bewerbung wird entschieden, sobald die Zustimmungen **Benötigte Zustimmungen** erreichen oder die Ablehnungen **Benötigte Ablehnungen**. Wird einer der Schwellenwerte auf 0 gesetzt, ist diese Seite deaktiviert, sodass ein Gate mit **Benötigte Ablehnungen** auf 0 nur vom Team oder durch Ablauf abgelehnt werden kann.

**Aufschlüsselung** zeigt, wer wie abgestimmt hat, nur für Abstimmende. Ist **Verbergen, wer wie abgestimmt hat** an, können es nur Mitglieder mit Rollen verwalten sehen.

### Wenn der Zeitraum endet

Jede Minute läuft im Hintergrund eine Prüfung auf Bewerbungen, die über ihren **Abstimmungszeitraum** hinaus sind. Was dann passiert, wird pro Gate festgelegt:

| Option | Bezeichnung im Dashboard | Ergebnis |
| --- | --- | --- |
| Deny | Bewerbung ablehnen | Die Bewerbung wird abgelehnt. Standard. |
| Majority | Die Seite mit mehr Stimmen | Angenommen, wenn die Zustimmungen die Ablehnungen übersteigen, sonst abgelehnt |
| StayOpen | Für das Team offen lassen | Nichts passiert, bis das Team sie entscheidet |

Setze **Abstimmungszeitraum** auf 0 für kein Zeitlimit.

## Bewerber blockieren

Das Team kann einen Nutzer für ein Gate oder für jedes Gate auf dem Server blockieren. Blockierte Nutzer erhalten „You are blocked from applying for this channel“, wenn sie es versuchen. Blockaden haben einen optionalen Grund, der in der Blacklist angezeigt wird.

## Einstellungen

Die Seite **Kanalzugriff** hat drei Tabs: **Gates**, **Bewerbungen** und **Blockiert**.

**Gates** listet jedes Gate mit einem Schalter **Nimmt Bewerbungen an** und lässt sich aufklappen, um seine Einstellungen, **Bewerbungsfragen** und einen **Bewerbungs-Panel**-Poster anzuzeigen. Die Standardwerte unten gelten für neue Gates.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Gesperrter Kanal | erforderlich | Der Kanal, der per Gate geschützt wird |
| Wie Leute Zugang erhalten | Eine Rolle geben | Rollen-Gate oder Direkt-Gate |
| Rolle bei Genehmigung | keine | Die Zugangsrolle, bei Rollen-Gates |
| Benötigte Zustimmungen | 3 | Zustimmungen, die als angenommen entscheiden; 0 deaktiviert |
| Benötigte Ablehnungen | 3 | Ablehnungen, die als abgelehnt entscheiden; 0 deaktiviert |
| Abstimmungszeitraum (Stunden) | 72 | Zeit, bevor die Ablaufregel greift; 0 für kein Limit |
| Wenn der Zeitraum endet | Bewerbung ablehnen | Eine der drei Ablaufoptionen |
| Prüfkanal | der gesperrte Kanal selbst | Wo Bewerbungen zur Abstimmung gepostet werden |
| Log-Kanal | keine Protokollierung | Wo neue Bewerbungen und Ergebnisse protokolliert werden |
| Abstimmungsrolle | alle mit der Zugangsrolle | Das Abstimmen auf eine Rolle beschränken |
| Rolle bei neuen Bewerbungen pingen | kein Ping | Rolle, die erwähnt wird, wenn eine Bewerbung eintrifft |
| Min. Kontoalter (Tage) | 0 | Konten ablehnen, die jünger sind |
| Min. Zeit auf dem Server (Tage) | 0 | Mitglieder ablehnen, die kürzer beigetreten sind |
| Cooldown für erneute Bewerbung (Stunden) | 168 | Wartezeit nach einer Ablehnung oder einem Ablauf, bevor man sich erneut bewirbt |
| Button für Enthaltung anbieten | an | Fügt der Prüfnachricht einen Button Enthalten hinzu |
| Bewerber bis zum Ende der Abstimmung verbergen | aus | Anonymer Bewerber, solange die Bewerbung aussteht |
| Verbergen, wer wie abgestimmt hat | aus | Aufschlüsselung nur für Rollen verwalten |
| Bewerber bei einer Entscheidung per DM benachrichtigen | an | Sendet das Ergebnis per DM |

**Bewerbungen** listet Bewerbungen, gefiltert nach Gate und Status, mit dem Stimmenstand und den Buttons **Genehmigen** und **Ablehnen** für ausstehende. **Blockiert** listet blockierte Nutzer nach Geltungsbereich und lässt dich jemanden für ein Gate oder **Jedes Gate** **Blockieren**, mit optionalem Grund.

## Einrichtung Schritt für Schritt

1. Mache den Kanal in Discord privat und erstelle für ein Rollen-Gate die Rolle, die ihn sehen darf.
2. Öffne **Kanalzugriff** im Dashboard und nutze **Bewerbungen für einen Kanal öffnen**. Wähle den **Gesperrter Kanal**, wähle **Wie Leute Zugang erhalten** und wähle bei Bedarf die Rolle.
3. Klappe das Gate auf. Setze einen **Prüfkanal**, damit Bewerbungen nicht im gesperrten Kanal landen, und einen **Log-Kanal**, wenn du ein Protokoll willst.
4. Passe **Benötigte Zustimmungen**, **Benötigte Ablehnungen** und den **Abstimmungszeitraum** daran an, wie viele Abstimmende du erwartest.
5. Füge unter **Bewerbungsfragen** bis zu fünf Fragen hinzu. Hake **Erforderlich** und **Mehrzeilige Antwort** nach Bedarf an.
6. Wähle unter **Bewerbungs-Panel**, wohin der Button soll, und klicke auf **Panel posten**.
7. Bewirb dich von einem Testkonto, stimme von einem Mitglied mit Zugang ab und prüfe, ob der Bewerber hineinkommt.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Die Slash-Versionen findest du unter `/channelaccess`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `channelaccesssetup <#channel> [@role]` | `casetup` | Rollen verwalten | Ein Gate erstellen; ohne Rolle ein Direkt-Gate |
| `channelaccessremove <#channel>` | `caremove` | Rollen verwalten | Ein Gate samt Fragen und Verlauf löschen |
| `channelaccesslist` | `calist` | Keine | Gates mit Schwellenwerten, Zeitraum und Status auflisten |
| `channelaccessconfig <#channel> [setting] [value]` | `caconfig` | Rollen verwalten | Eine Einstellung ändern; ohne Einstellung ausführen, um die Liste zu sehen |
| `channelaccesspanel <#channel> [#target]` | `capanel` | Rollen verwalten | Den Bewerbungs-Button posten, standardmäßig im aktuellen Kanal |
| `channelaccessquestionadd <#channel> <question>` | `caqadd` | Rollen verwalten | Eine erforderliche mehrzeilige Frage hinzufügen |
| `channelaccessquestionremove <#channel> <position>` | `caqremove` | Rollen verwalten | Eine Frage über ihre aufgelistete Nummer entfernen |
| `channelaccessquestionlist <#channel>` | `caqlist` | Rollen verwalten | Die Fragen der Reihe nach anzeigen |
| `channelaccessapply <#channel>` | `caapply` | Keine | Den Bewerbungs-Button für dich selbst posten |
| `channelaccesswithdraw <id>` | `cawithdraw` | Keine | Deine eigene offene Bewerbung zurückziehen |
| `channelaccesshistory [@user]` | `cahistory` | Keine | Dein Bewerbungsverlauf; andere Nutzer brauchen Rollen verwalten |
| `channelaccesspending [#channel]` | `capending` | Keine | Offene Bewerbungen auflisten, optional für ein Gate |
| `channelaccessapprove <id> [reason]` | `caapprove` | Rollen verwalten | Unabhängig von den Stimmen genehmigen |
| `channelaccessdeny <id> [reason]` | `cadeny` | Rollen verwalten | Unabhängig von den Stimmen ablehnen |
| `channelaccessblacklistadd <@user> [#channel]` | `cabladd` | Rollen verwalten | Für ein Gate blockieren, oder ohne Kanal überall |
| `channelaccessblacklistremove <@user> [#channel]` | `cablremove` | Rollen verwalten | Eine Blockade aufheben; gib denselben Kanal an, für den sie gesetzt wurde |
| `channelaccessblacklist` | `cablacklist` | Rollen verwalten | Blockierte Nutzer auflisten |

Die von `channelaccessconfig` akzeptierten Einstellungen sind `enabled`, `approvals`, `denials`, `votehours`, `onexpiry` (`deny`, `majority`, `stayopen`), `reviewchannel`, `logchannel`, `voterrole`, `pingrole`, `anonymousapplicant`, `anonymousvotes`, `allowabstain`, `minaccountage`, `minserverage`, `reapplycooldown` und `dmondecision`.

> [!EXAMPLE]
> `caconfig #inner-circle approvals 5`, dann `caconfig #inner-circle onexpiry majority`.

## Tipps und Stolperfallen

- Der Bot braucht Rollen verwalten für Rollen-Gates und Kanäle verwalten (mit der Berechtigung, die Überschreibungen dieses Kanals zu bearbeiten) für Direkt-Gates. Seine oberste Rolle muss über der Zugangsrolle liegen.
- Ist kein **Prüfkanal** gesetzt, werden Bewerbungen im gesperrten Kanal gepostet. Das passt für „Mitglieder stimmen über Neulinge ab“, aber setze einen separaten Kanal, wenn stattdessen das Team abstimmen soll.
- Per Befehl hinzugefügte Fragen sind immer erforderlich und mehrzeilig. Nutze das Dashboard, um eine Frage optional oder einzeilig zu machen oder ihr einen Platzhaltertext zu geben.
- Das Löschen eines Gates entfernt seine Fragen, Bewerbungen und Stimmen dauerhaft.
- Mitglieder, die den Server verlassen, bevor die Abstimmung endet, erhalten keinen Zugang, auch wenn sie genehmigt wurden.
- Abstimmungs- und Ablaufergebnisse werden nur bei Zustimmungen und Ablehnungen per DM mitgeteilt. Zurückgezogene Bewerbungen erhalten keine DM.
- Ein blockierter Nutzer muss mit demselben Geltungsbereich entsperrt werden, mit dem die Blockade gesetzt wurde. Eine serverweite Blockade wird nicht durch ein Entsperren aufgehoben, das einen Kanal nennt.

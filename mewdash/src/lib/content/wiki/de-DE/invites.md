---
title: Einladungen
slug: invites
summary: Ordne jeden Beitritt einem Einladungscode, dem Vanity-Link oder einer App zu und zähle reguläre, verlassene, gefälschte und Bonus-Einladungen pro Mitglied. Vergib Labels für Codes und verfolge Wachstum, Bindung und Beitrittsquellen über die Zeit.
icon: fa-users
category: Community
dashboard: /dashboard/invites
module: Utility
tags: [invites, invite tracking, inviter, who invited, referrals, recruitment, leaderboard, fake invites, bonus invites, retention, vanity, labels, analytics, mass ban, Einladungen, Einladungs-Tracking, Einlader, Wer hat eingeladen, Empfehlungen, Rekrutierung, Bestenliste, Fake-Einladungen, Bonus-Einladungen, Bindung, Labels, Analysen, Massenbann]
related: [multigreets, statroles, liveboards, serverstats]
---

## Was es macht

Wenn jemand beitritt, vergleicht der Bot die Einladungslinks des Servers vor und nach dem Beitritt, um herauszufinden, welcher verwendet wurde. Wenn keiner passt, prüft er die Vanity-URL. Außerdem speichert er, wie das Mitglied gekommen ist: über die Einladung eines Mitglieds, über den Vanity-Link, als Bot, der über OAuth hinzugefügt wurde, oder unbekannt. Der Einlader erhält eine **reguläre** Einladung, es sei denn, der Beitritt ist als **gefälscht** markiert. Verlässt das eingeladene Mitglied den Server, steigt der Zähler **verlassen** des Einladers. Das Team kann **Bonus**-Einladungen vergeben. Die Gesamtzahl eines Mitglieds ist regulär minus verlassen minus gefälscht, plus Bonus.

Jeder beobachtete Beitritt wird aufbewahrt, auch nachdem das Mitglied gegangen ist. So kann die Seite Bindung (wie viele eingeladene Mitglieder noch da sind), Wiederbeitritte und die Codes zeigen, über die Leute kommen, die bleiben.

## Wozu du es nutzt

- Veranstalte einen Rekrutierungswettbewerb und zahle die Preise nach einer Bestenliste aus, die sich nicht mit Zweitaccounts oder Beitritts-und-Austritts-Schleifen austricksen lässt.
- Finde heraus, ob eine Twitter-Kampagne, ein Partnerserver oder ein YouTube-Link tatsächlich Mitglieder bringt, die bleiben, indem du jeden Code mit einem Label versiehst.
- Zeige den Einlader und den Code in der Willkommensnachricht.
- Finde und banne alle, die ein einzelner Einlader gebracht hat, wenn ein Raid über einen einzelnen Link kommt.

## So werden Beitritte zugeordnet

- Der Bot braucht die Berechtigung **Server verwalten**, um die Einladungsliste zu lesen. Ohne sie wird nichts erfasst.
- Beitritte werden pro Server nacheinander verarbeitet. Nutzen mehrere Personen denselben Code zwischen zwei Prüfungen, wird der Überschuss gemerkt und den nächsten Beitritten gutgeschrieben, sodass Ansturm-Spitzen nicht verloren gehen.
- Ein Beitritt über die Vanity-URL wird als **Vanity** ohne Einlader erfasst. Ein Bot, der über OAuth hinzugefügt wurde, wird als **Bot** erfasst.
- Ein Code mit Label und Besitzer schreibt die Gutschrift dem Besitzer zu und nicht dem, der die Einladung erstellt hat. So funktionieren die persönlichen Links aus `invitelink`.

## Erkennung gefälschter Beitritte

Ein Beitritt wird als gefälscht markiert, und der Einlader erhält eine gefälschte statt einer regulären Einladung, wenn einer dieser Gründe zutrifft:

| Grund | Wann |
| --- | --- |
| Selbst | Das Mitglied hat seine eigene Einladung benutzt |
| Neues Konto | Das Konto ist jünger als das **Mindestalter des Kontos** (0 deaktiviert die Prüfung) |
| Wiederbeitritt | Das Mitglied ist schon einmal beigetreten und **Wiederbeitritte zählen** ist aus |
| Kein Avatar | Das Mitglied hat keinen Avatar und **Mitglieder ohne Avatar markieren** ist aktiv |

Einlader auf der **Blacklist** oder mit einer Blacklist-Rolle erscheinen weiterhin als Einlader, erhalten aber nie eine Gutschrift. Mitglieder auf der Liste **verborgen** werden erfasst, aber nicht in den Bestenlisten aufgeführt.

## Dashboard-Tabs

| Tab | Was er zeigt |
| --- | --- |
| Übersicht | Beitritte, Austritte, Nettowachstum, Bindung, gefälschte Beitritte und Beitrittsquellen für den letzten Tag, die letzte Woche, den letzten Monat oder insgesamt, ein Diagramm mit Beitritten und Austritten, die besten Einlader und die besten Codes |
| Bestenliste | Jeder Einlader mit seinen regulären, verlassenen, gefälschten, Bonus- und Bindungszahlen, filterbar nach Zeitraum oder Rolle und als CSV exportierbar. Klicke auf eine Zeile oder wähle ein Mitglied, um die Aufschlüsselung zu sehen, reguläre, Bonus- oder gefälschte Einladungen hinzuzufügen oder zu entfernen oder sie zurückzusetzen |
| Mitglieder | Jeder beobachtete Beitritt, filterbar nach Einlader, Einladungscode oder Label, mit Angabe, wie die Person gekommen ist, ob sie markiert wurde und ob sie noch da ist. Als CSV exportierbar |
| Codes & Labels | Jeder Einladungscode des Servers mit Ersteller, Kanal und Nutzungen. Vergib ein Label und optional eine Rolle, die jeder erhält, der über den Code beitritt, oder lösche den Code |
| Einstellungen | Tracking, Entfernen beim Verlassen, Wiederbeitritte zählen, Markierung ohne Avatar, Mindestalter des Kontos, der Kanal, auf den persönliche Links zeigen, der Log-Kanal für Beitritte und Austritte, Blacklists, verborgene Mitglieder sowie die Werkzeuge für Import und Zurücksetzen |

## Einstellungen

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Einladungen verfolgen | an | Ob Beitritte überhaupt zugeordnet werden |
| Gutschrift entfernen, wenn Mitglieder gehen | an | Erhöht den Zähler „verlassen“ des Einladers um eins, wodurch sich seine Gesamtzahl verringert, wenn ein eingeladenes Mitglied geht |
| Wiederbeitritte zählen | an | Aus markiert ein Mitglied, das schon einmal beigetreten ist, als gefälschte Einladung |
| Mitglieder ohne Avatar markieren | aus | Beitritte von Konten ohne Avatar zählen als gefälscht |
| Mindestalter des Kontos | 0 Tage | Konten, die jünger sind als dies, werden als gefälscht markiert |
| Kanal für persönliche Links | System-Kanal | Wohin Einladungen zeigen, die über `invitelink` erstellt werden |
| Log-Kanal für Beitritte und Abgänge | keiner | Postet bei jedem Beitritt und jedem Austritt ein Embed, das sagt, wer wen eingeladen hat, mit dem Code, dem Konto-Alter und einer etwaigen Markierung als gefälscht |

**Nutzungen von Discord importieren** erhöht den regulären Gesamtwert jedes Einladers auf die Summe der Nutzungen seiner Codes und senkt ihn nie. Der Import kann daher nach einem Neustart oder einer frischen Installation erneut ausgeführt werden. **Verlassene Einlader zurücksetzen** löscht die Zählung aller, die nicht mehr auf dem Server sind. **Alles zurücksetzen** löscht jede Zählung und den Beitrittsverlauf.

## Begrüßungs-Platzhalter

Jede Begrüßung kann diese Platzhalter verwenden, sobald das Tracking aktiv ist. Unbekannte Werte fallen auf `Unknown` oder `0` zurück.

| Platzhalter | Wert |
| --- | --- |
| `%inviter.mention%`, `%inviter.username%`, `%inviter.id%`, `%inviter.avatar%` | Der gutgeschriebene Einlader |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | Die Zählung des Einladers |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%`, `%invite.fake%` | Die verwendete Einladung |
| `%user.joincount%`, `%user.leavecount%` | Wie oft dieses Mitglied beigetreten und gegangen ist |
| `%server.members.ordinal%` | Die Mitgliederzahl als 1., 2., 1.204. |
| `%user.joined.R%`, `%user.created.F%` sowie die übrigen Discord-Zeitstempelformate t, T, d, D, f, F, R | Beitritts- und Konto-Erstellungszeiten als Live-Zeitstempel |

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Jeder Befehl existiert auch unter `/invites`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `invites [@user]` | | Niemand | Die Gesamtzahl eines Mitglieds mit Aufschlüsselung nach regulär, verlassen, gefälscht und Bonus sowie seinen Rang |
| `whoinvited [@user]` | `invitedby` | Niemand | Wer ein Mitglied eingeladen hat, der Code und ob der Beitritt markiert wurde |
| `invitedusers [@user]` | `userinvites` | Niemand | Alle, die ein Mitglied eingeladen hat, mit Beitrittsdaten und Markierungen |
| `invitedbycode <code>` | | Niemand | Alle, die über einen Code beigetreten sind |
| `invitedbylabel <label>` | | Niemand | Alle, die über einen Code mit Label beigetreten sind |
| `inviteleaderboard [AllTime/Daily/Weekly/Monthly] [@role]` | `inviteslb` | Niemand | Die Bestenliste für einen Zeitraum, optional für eine Rolle |
| `invitestats [range]` | `growthstats` | Niemand | Beitritte, Austritte, Netto, Bindung, gefälschte Beitritte, Quellen, die besten Einlader und Codes |
| `invitecodes [@user]` | `mycodes` | Niemand | Die Einladungscodes eines Mitglieds und deren Nutzungen |
| `invitelink` | `findlink`, `mylink` | Niemand | Dein persönlicher, dauerhafter Link, wird erstellt, falls du noch keinen hast |
| `addinvites`, `removeinvites`, `addbonusinvites`, `removebonusinvites`, `addfakeinvites`, `removefakeinvites <@user> <amount>` | | Server verwalten | Die Zählung eines Mitglieds anpassen |
| `resetinvites <@user>` oder `resetinvites Server` oder `resetinvites LeftMembers` | | Server verwalten, für serverweite Aktionen Administrator | Zählungen zurücksetzen |
| `syncinvites [@user]` | | Server verwalten | Nutzungen von Discord importieren |
| `deleteinvite <code>` | `delinvite` | Server verwalten | Einen Code löschen |
| `purgeinvites [maxUses] [#channel]` | | Server verwalten | Jeden Code ohne Label löschen, der höchstens so oft genutzt wurde |
| `inviteblacklist <@user or @role>` | `invbl` | Server verwalten | Umschalten, ob jemand Gutschriften erhalten kann |
| `invitehide <@user>` | `invhide` | Server verwalten | Umschalten, ob jemand in Bestenlisten erscheint |
| `inviteexclusions` | | Server verwalten | Blacklists und verborgene Mitglieder auflisten |
| `invitelabelset <code> <label>`, `invitelabelrole <code> [@role]`, `invitelabelremove <code>`, `invitelabels` | | Server verwalten | Labels verwalten |
| `inviteexport [range]`, `invitedexport [@user]` | | Server verwalten | CSV-Exporte |
| `invitemassban <@user> [reason]`, `invitemassbancode <code> [reason]` | | Mitglieder bannen | Jeden bannen, der noch da ist und von einem Mitglied oder über einen Code eingeladen wurde, nach Bestätigung |
| `invitesettings`, `toggleinvitetracking`, `toggleremoveinviteonleave`, `togglecountrejoins`, `togglefakenoavatar`, `setminaccountage <days>`, `invitelinkchannel [#channel]`, `invitelogchannel [#channel]` | | Server verwalten | Einstellungen |

## Tipps und Stolperfallen

- Mitglieder, die vor dem Aktivieren des Trackings oder während der Bot offline war, beigetreten sind, haben keinen Beitrittseintrag. Führe **Nutzungen von Discord importieren** einmal aus, um die regulären Gesamtwerte aus Discords eigenen Zählungen zu übernehmen.
- Gefälschte Beitritte senken nie eine Gesamtzahl, wenn das Mitglied geht. Nur reguläre Einladungen werden zu verlassenen Einladungen.
- Ein Mitglied, das geht und zurückkehrt, bekommt einen neuen Beitrittseintrag. Mit aktivem **Wiederbeitritte zählen** erhält der Einlader wieder eine reguläre Einladung, die die verlassene Einladung von früher ausgleicht.
- Die Bindung auf der Bestenliste zählt nur Beitritte, die der Bot beobachtet hat. Sie beginnt daher bei 100 % und pendelt sich ein, sobald sich eine Historie aufbaut.
- Statistik-Rollen können Einladungszahlen belohnen, und Live-Boards können die Einladungs-Bestenliste in einem Kanal anheften.

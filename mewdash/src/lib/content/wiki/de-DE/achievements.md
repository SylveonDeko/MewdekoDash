---
title: Erfolge
slug: achievements
summary: Mitglieder schalten Erfolge frei für Chats, Voice, Reaktionen, Einladungen, Befehle, Level und Zeit auf dem Server, sammeln Punkte für einen eigenen Rang und tragen Abzeichen auf ihrem Profil. Getrennt von XP, mit optionaler Verbindung zwischen beiden.
icon: fa-trophy
category: Community
dashboard: /dashboard/achievements
module: Achievements
tags: [achievements, badges, points, ranks, grades, unlocks, milestones, achievement cards, xp per point, achievements bot, Erfolge, Abzeichen, Punkte, Ränge, Stufen, Freischaltungen, Meilensteine, Erfolgskarten, XP pro Punkt, Erfolgs-Bot]
related: [xp, currency, reputation, statroles]
---

## Was es macht

Erfolge sind Ziele, die Mitglieder durch die Nutzung deines Servers erreichen: die erste Nachricht schreiben, 250 Nachrichten erreichen, einem Voice-Kanal beitreten, mit vielen verschiedenen Emojis reagieren, monatelang bleiben oder boosten. Jeder Erfolg hat eine Stufe, jede Stufe ist Punkte wert, und die Punkte bestimmen den Erfolgsrang eines Mitglieds. Mitglieder zeigen, was sie verdient haben, mit bis zu vier Abzeichen auf ihrer Profilkarte.

Wenn du Erfolge einschaltest, werden bisherige Aktivitäten sofort gezählt. Mitglieder schalten alles frei, was ihre gespeicherten Nachrichten, Voice-Zeiten, Reaktionen, Einladungen, Level und ihre Zeit auf dem Server bereits eingebracht haben. Das passiert still, ohne eine einzige Ankündigung.

## Wie es mit XP zusammenpasst

Erfolge und XP sind zwei getrennte Systeme, die nebeneinander laufen. Keines braucht das andere, und wenn du eines abschaltest, bleibt das andere unberührt.

| | XP | Erfolge |
| --- | --- | --- |
| Verdient durch | Jede Nachricht und jede Minute im Voice-Kanal | Das Erreichen eines Ziels, einmalig |
| Steigt | Level, auf der XP-Kurve | Ein Erfolgsrang, von Neuling bis Champion |
| Gemessen in | XP | Punkten aus der Stufe jeder Freischaltung |
| Belohnungen | Level-Rollen und Währung | Rollen, Währung und XP pro Erfolg |

Sie sind an genau zwei Stellen verbunden:

1. **Level schalten Erfolge frei.** Die Kategorie Community hat Erfolge für das Erreichen von XP-Leveln. Ein Levelaufstieg kann daher Erfolge freischalten.
2. **Erfolge können XP geben, falls du möchtest.** Standardmäßig wird nichts gegeben. Vergib einem einzelnen Erfolg eine XP-Belohnung oder lege auf dem Tab Einstellungen **XP pro Punkt** fest, damit jede Freischaltung XP abhängig von ihren Punkten bringt. Eine Gold-Freischaltung ist 50 Punkte wert. Bei 2 XP pro Punkt sind das 100 XP.

Der Erfolgsrang ist nicht dein XP-Level. Ein Mitglied kann Level 40 und Rang Bronze haben oder Level 3 und Gold, weil das eine misst, wie viel jemand schreibt, und das andere, wie viele verschiedene Dinge es getan hat.

## Stufen, Punkte und Ränge

| Stufe | Punkte |
| --- | --- |
| Bronze | 10 |
| Silber | 25 |
| Gold | 50 |
| Smaragd | 100 |
| Amethyst | 250 |
| Champion | 500 |

Punkte summieren sich zu einem Rang:

| Rang | Benötigte Punkte |
| --- | --- |
| Neuling | 0 |
| Bronze | 100 |
| Silber | 500 |
| Gold | 1500 |
| Smaragd | 3500 |
| Amethyst | 7000 |
| Champion | 12000 |

Eigene Erfolge können jede Stufe nutzen und die Punkte überschreiben.

## Kategorien

Eingebaute Erfolge sind in Nachrichten, Voice, Reaktionen, Einladungen, Befehle, Treue, Boosts und Community gruppiert. Du kannst eine ganze Kategorie ausschalten oder eigene Kategorien mit eigenem Namen, eigener Beschreibung und eigenem Icon hinzufügen. Ziehe Kategorien auf dem Tab Kategorien, um ihre Reihenfolge überall zu ändern, wo Mitglieder sie sehen.

## Eigene Erfolge

| Art | Wird freigeschaltet, wenn |
| --- | --- |
| Ziel | Ein Zähler eine Zahl erreicht, zum Beispiel 1000 Nachrichten oder 30 Tage auf dem Server |
| Phrase | Ein Mitglied eine Phrase sagt |
| Reaktion | Ein Mitglied mit einem Emoji reagiert |
| Manuell | Das Team vergibt ihn |

Jeder Erfolg bekommt einen Namen, eine Beschreibung, eine Stufe, ein Icon (ein Emoji, ein Server-Emoji, ein Font-Awesome-Icon oder ein hochgeladenes Bild) und optionale Belohnungen: eine Rolle, Währung und XP. Markiere einen Erfolg als geheim, um seinen Namen und sein Ziel zu verbergen, bis er freigeschaltet ist.

## Ankündigungen

| Modus | Wo Freischaltungen gepostet werden |
| --- | --- |
| Automatisch | Der Log-Kanal, falls einer festgelegt ist, sonst der Kanal, in dem es passiert ist |
| Hier | Der Kanal, in dem es passiert ist |
| Log-Kanal | Nur der Log-Kanal |
| Nur DM | Die DMs des Mitglieds |
| Lautlos | Nirgendwo |

Mehrere gleichzeitige Freischaltungen teilen sich eine Nachricht. Ankündigungen enthalten eine Bildkarte in den Farben deines Servers. In Kanälen löschen sie sich nach 5 Sekunden selbst, außer du wählst eine längere Zeit oder Nie. DMs werden nie gelöscht. Mitglieder können Freischaltungs-DMs, Server-Nachrichten und Erwähnungen für sich selbst ausschalten.

Zwei Regeln halten Freischaltungen aus Kanälen heraus, in die sie nicht gehören:

| Regel | Was sie tut |
| --- | --- |
| Ruhige Kanäle | Kanäle, die du auswählst, zum Beispiel ein Ankündigungskanal. Mitglieder verdienen dort weiterhin Erfolge, aber die Freischaltung wird dort nie gepostet |
| Nur dort posten, wo das Mitglied schreiben darf | Standardmäßig aktiv. Eine Freischaltung wird nicht in einem Kanal gepostet, in dem das Mitglied keine Nachrichten senden darf, etwa einem reinen Lesekanal, in dem es reagiert hat |

Verhindert eine der beiden Regeln einen Post, geht die Freischaltung in den Log-Kanal, falls du einen festgelegt hast. Ansonsten wird sie übersprungen. Der Log-Kanal selbst wird nie übersprungen. Um einen Kanal gar nicht mehr zu zählen, nutzt du stattdessen die ausgeschlossenen Kanäle auf dem Tab Einstellungen.

## Karten

Der Tab **Karten** ist ein Designer für das Freischaltungsbild. Ziehe und skaliere Titel, Icon, Stufe, Fortschritt, Avatar und den Rest, füge Formen, Text, Bilder und Icons hinzu und nutze die Farben deines Servers als Token, damit eine Karte einem neuen Icon folgt. Speichere bis zu zwanzig Designs, wähle eines als Standard und weise andere einer Kategorie oder einem einzelnen Erfolg zu. Die spezifischste Zuweisung gewinnt.

## Mitgliedseinstellungen

Mitglieder wählen, wer ihre Profilkarte, die Liste freigeschalteter Erfolge, ihre Abzeichen und ihren Platz in der Bestenliste sehen kann, welche Abzeichen sie tragen und wie sie benachrichtigt werden möchten. Alles davon ist auch im Tab **Ich** der iOS- und Android-Apps zu finden.

## Dashboard

| Tab | Wofür er da ist |
| --- | --- |
| Übersicht | Sammeln starten oder pausieren, Freischaltungs-Summen und letzte Freischaltungen |
| Erfolge | Erfolge durchsuchen, suchen, aktivieren, bearbeiten und erstellen |
| Kategorien | Kategorien ordnen, umbenennen, umschalten und erstellen |
| Ankündigungen | Wo und wie Freischaltungen gepostet werden, die Nachricht und das automatische Löschen |
| Karten | Der Karten-Designer und die Zuweisungen |
| Mitglieder | Ein Mitglied nachschlagen, Erfolge gewähren, entziehen oder zurücksetzen |
| Einstellungen | Ausgeschlossene Rollen und Kanäle, XP pro Punkt und geheime Erfolge |

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Dieselben Befehle gibt es unter `/achievements`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `achievements [@user]` | `achoverview`, `achs` | Niemand | Rang, Punkte und letzte Freischaltungen |
| `achcard [@user]` | `achprofile` | Niemand | Die Profilkarte |
| `achlist [@user]` | `achall` | Niemand | Alle Erfolge und Fortschritt |
| `achcategory <category> [@user]` | `achcat` | Niemand | Eine Kategorie |
| `achview [@user] <achievement>` | `achimage` | Niemand | Ein Erfolg als Freischaltungskarte |
| `achsearch <query>` | | Niemand | Einen Erfolg finden |
| `achleaderboard [sort]` | `achlb` | Niemand | Die Bestenliste des Servers |
| `badges [@user]` | `badgeinv` | Niemand | Besessene Abzeichen |
| `badgeequip <slot> <badge>` | `equipbadge` | Niemand | Ein Abzeichen in Slot 1 bis 4 tragen |
| `achprivacy <area> <everyone or onlyme>` | | Niemand | Sichtbarkeit von Profil, Erfolgen, Abzeichen oder Bestenliste |
| `achnotify <dm, message or mention> <true or false>` | | Niemand | Deine Benachrichtigungen zu Freischaltungen |
| `achtoggle` | | Server verwalten | Sammeln starten oder pausieren |
| `achannounce <mode>` | | Server verwalten | Wo Freischaltungen gepostet werden |
| `achlogchannel [#channel]` | `achlog` | Server verwalten | Der Log-Kanal |
| `achxpperpoint <amount>` | | Server verwalten | XP pro Erfolgspunkt, 0 zum Ausschalten |
| `achcreate <metric> <goal> <grade> <name>` | | Server verwalten | Ein Zielerfolg |
| `achcreatephrase <phrase> <grade> <name>` | | Server verwalten | Ein Phrasen-Erfolg |
| `achcreatereaction <emoji> <grade> <name>` | | Server verwalten | Ein Reaktions-Erfolg |
| `achcreatemanual <grade> <name>` | | Server verwalten | Ein manueller Erfolg |
| `achrewardrole`, `achrewardcurrency`, `achrewardxp` | | Server verwalten | Eine Belohnung zu einem Erfolg hinzufügen |
| `achgrant <@user> <achievement>` | | Server verwalten | Einen Erfolg vergeben |
| `achrevoke <@user> <achievement>` | | Server verwalten | Einen Erfolg wieder entziehen |
| `achreset <@user>` | | Server verwalten | Die Erfolge eines Mitglieds zurücksetzen |

## Tipps und Fallstricke

- Belohnungen gelten auch für die Vergangenheit. Wenn du XP pro Punkt festlegst oder Belohnungen hinzufügst, bevor du Erfolge einschaltest, zahlt der erste Durchlauf sie für alles aus, was Mitglieder bereits erreicht haben. Setze sie danach, wenn du nur neue Freischaltungen belohnen willst.
- XP aus Erfolgen kann ein Mitglied im Level aufsteigen lassen. Ein neues Level kann wiederum einen Level-Erfolg freischalten, der mehr XP bringen kann. Das endet immer, weil jeder Erfolg nur einmal freigeschaltet wird.
- Mitglieder mit einer ausgeschlossenen Rolle oder Aktivität in einem ausgeschlossenen Kanal verdienen daraus nichts.

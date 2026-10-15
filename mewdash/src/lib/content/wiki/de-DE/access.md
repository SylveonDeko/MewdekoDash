---
title: Dashboard-Zugriff
slug: access
summary: Lass bestimmte Mitglieder oder Rollen das Dashboard deines Servers öffnen und nur die ausgewählten Bereiche ansehen oder verwalten, ohne sie zu Discord-Administratoren zu machen.
icon: fa-key
category: Security
dashboard: /dashboard/access
tags: [dashboard access, permissions, grant, staff, restrict, who can edit, view, manage, managers, delegation, Dashboard-Zugriff, Berechtigungen, Freigabe, Team, einschränken, wer darf bearbeiten, ansehen, verwalten, Zugriffsmanager, Delegation]
related: [auditlog, administration]
---

## Was es macht

Standardmäßig können nur der Server-Owner und Mitglieder mit der Berechtigung Administrator einen Server im Dashboard öffnen. Der Dashboard-Zugriff erweitert das. Du wählst ein Mitglied oder eine Rolle, legst fest, welche Dashboard-Bereiche sie bekommen, und ob jeder davon **Ansehen** oder **Verwalten** ist. Ab dann erscheint dieser Server in ihrer Serverliste im Dashboard, und die freigegebenen Bereiche funktionieren für sie; alles andere wird abgelehnt.

Die Prüfung findet in der API des Bots statt, nicht nur auf der Webseite. Jede Anfrage, die einen Server nennt, trägt die Identität des angemeldeten Nutzers. Ist die Person Owner oder Administrator, geht die Anfrage durch. Andernfalls sucht der Bot den Bereich, zu dem die Anfrage gehört, behandelt Lesezugriffe als **Ansehen** und jede Änderung als **Verwalten** und vergleicht das mit der höchsten Stufe, die der Nutzer direkt oder über eine seiner Rollen hat.

Der Server-Owner entscheidet außerdem, wer die Zugriffsliste selbst bearbeiten darf. Standardmäßig kann das nur der Owner. Er kann bestimmte Zugriffsmanager ernennen oder mit einem Schalter allen mit Administrator oder Server verwalten erlauben, das zu tun.

## Wofür du es brauchst

- Ein Community-Team betreibt Giveaways, Vorschläge und Tickets über das Dashboard, ohne Administrator in Discord zu haben.
- Eine Moderatoren-Rolle bekommt **Verwalten** bei Moderation und Logging und **Ansehen** bei allem anderen, kann also schauen, aber keine Einstellungen ändern, für die sie nicht zuständig ist.
- Einem Bot-Helfer wird vertraut, XP und Währung zu bearbeiten, aber nichts Sicherheitsrelevantes.
- Der Owner überträgt die Pflege der Zugriffsliste an eine Co-Owner-Rolle, ohne die Owner-Only-Funktionen abzugeben.

## Zugriffsstufen

| Stufe | Erlaubt |
| --- | --- |
| Keine | Nichts für diesen Bereich; der Bereich wird nicht freigegeben |
| Ansehen | Nur Leseanfragen, etwa das Öffnen der Seite und das Laden ihrer Daten |
| Verwalten | Alles, was Ansehen erlaubt, plus Erstellen, Bearbeiten und Löschen |

Passt ein Mitglied auf mehr als eine Freigabe, zum Beispiel eine persönliche und eine über eine Rolle, gewinnt pro Bereich die höchste Stufe. Ein Mitglied mit mindestens einem freigegebenen Bereich sieht den Server in seinem Server-Wechsler im Dashboard; ein Mitglied ohne jede Freigabe sieht ihn nicht.

Owner und Administratoren umgehen Freigaben vollständig und haben immer vollen Zugriff.

## Bereiche

Die Bereiche entsprechen der Seitenleiste im Dashboard. Jede Funktion in der Auswahl entspricht einem oder mehreren API-Bereichen des Bots. Wer also „Administration“ freigibt, erhält sowohl die Endpunkte der Verwaltung als auch die des Schutzes, und „Moderation“ umfasst auch den Schutz. Die Auswahl gruppiert die Bereiche nach Kategorie der Seitenleiste, und Funktionen, die globale Infrastruktur des Bots sind und keine Daten pro Server enthalten, etwa die Leistung, lassen sich nicht freigeben.

Deckt eine Freigabe eine Funktion ab, die auf mehrere Bereiche verteilt ist, zeigt die Auswahl die niedrigste Stufe, die sie alle teilen; das Setzen der Gruppe setzt alle ihre Bereiche auf einmal.

## Wer die Zugriffsliste verwalten kann

| Wer | Darf |
| --- | --- |
| Server-Owner | Alles: den Delegationsschalter, die Manager-Liste und alle Freigaben |
| Ernannte Zugriffsmanager | Freigaben hinzufügen, bearbeiten und entfernen |
| Mitglieder mit Administrator oder Server verwalten | Freigaben hinzufügen, bearbeiten und entfernen, aber nur solange der Delegationsschalter an ist |
| Alle anderen | Sehen „Du kannst den Dashboard-Zugriff hier nicht verwalten“ |

Zugriffsmanager können ein Mitglied oder eine Rolle sein. Nur der Owner kann die Manager-Liste und den Delegationsschalter sehen oder ändern; die API lehnt diese Aufrufe von allen anderen ab.

> [!WARNING]
> **Verwalten** für den Dashboard-Zugriff lässt sich nicht freigeben, weil der Zugriffs-Controller von den Bereichsprüfungen ausgenommen ist. Nutze stattdessen die Manager-Liste oder den Delegationsschalter, um die Kontrolle über die Liste weiterzugeben.

## Einstellungen

Alles befindet sich auf der einzigen Seite Dashboard-Zugriff.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Administratoren und Mitglieder mit Server verwalten den Dashboard-Zugriff verwalten lassen | Aus | Unter **Delegationseinstellungen**. Ist es an, dürfen Administratoren und Mitglieder mit Server verwalten Freigaben bearbeiten. Nur Owner. |
| Zugriffsmanager | keine | Mitglieder oder Rollen, die zum Bearbeiten von Freigaben ernannt wurden. Nur Owner. |
| Zugriffsfreigaben | keine | Ein Eintrag pro Mitglied oder Rolle mit einer Stufe pro Bereich. Manager und Owner. |

Das Formular **Eingeschränkten Zugriff erteilen** nimmt einen Zieltyp (Nutzer oder Rolle), das Ziel und eine Stufe pro Funktionsgruppe. Speicherst du eine zweite Freigabe für dasselbe Ziel, ersetzt sie die erste. Eine bestehende Freigabe öffnet dasselbe Formular als **Zugriffsfreigabe bearbeiten**.

## Einrichtung Schritt für Schritt

1. Öffne **Dashboard-Zugriff** im Dashboard als Server-Owner.
2. Entscheide, wer die Liste pflegt. Schalte entweder den Delegationsschalter unter **Delegationseinstellungen** ein oder füge unter **Zugriffsmanager** ein Mitglied oder eine Rolle hinzu.
3. Wähle unter **Eingeschränkten Zugriff erteilen** **Rolle** und deine Team-Rolle.
4. Setze **Verwalten** bei den Funktionen, die sie täglich nutzen, und **Ansehen** bei denen, die sie nur prüfen sollen. Lass den Rest auf **Keine**.
5. Klicke auf **Zugriff erteilen**. Die Freigabe erscheint unter **Zugriffsfreigaben**.
6. Bitte ein Mitglied mit dieser Rolle, sich im Dashboard anzumelden. Der Server sollte nun in seiner Liste auftauchen, mit nur den freigegebenen Seiten funktionsfähig.

## Befehle

Der Dashboard-Zugriff wird nur im Dashboard konfiguriert; dafür gibt es keine Bot-Befehle.

## Tipps und Stolperfallen

- Freigaben werden gegen die zwischengespeicherte Mitgliederliste des Bots geprüft. Ein Mitglied muss auf dem Server sein und für den Bot sichtbar sein, damit seine Freigabe wirkt.
- Rollen-Freigaben folgen den aktuellen Rollen des Mitglieds. Entfernst du die Rolle, entfällt der Zugriff sofort.
- Eine Freigabe, bei der alle Bereiche auf **Keine** stehen, zählt als keine Freigabe und wird verworfen; das Mitglied verliert den Server in seinem Wechsler.
- Administratoren behalten vollen Zugriff, egal was die Freigaben sagen. Um jemanden einzuschränken, entferne zuerst die Berechtigung Administrator in Discord und gib ihm dann hier, was er braucht.
- Der Dashboard-Proxy hängt jeder Anfrage einen gemeinsamen API-Schlüssel an, dieser Schlüssel allein gewährt aber nie Zugriff auf einen Server; die Identität des angemeldeten Nutzers ist immer erforderlich.
- Endpunkte, die nicht an einen Server gebunden sind, etwa die globale Befehlsliste, unterliegen keinen Bereichsprüfungen und funktionieren für eingeschränkte Nutzer weiterhin.

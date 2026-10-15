---
title: Rollenzustände
slug: rolestates
summary: Merkt sich die Rollen eines Mitglieds, wenn es den Server verlässt, und gibt sie automatisch zurück, wenn es wieder beitritt.
icon: fa-tag
category: Actions
dashboard: /dashboard/rolestates
module: RoleStates
tags: [role states, role persistence, restore roles, rejoin, saved roles, role backup, transfer roles, Rollenzustände, Rollen speichern, Rollen wiederherstellen, Wiederbeitritt, gespeicherte Rollen, Rollensicherung, Rollen übertragen]
related: [administration, statusroles]
---

## Was es macht

Wenn Rollenzustände aktiviert sind, beobachtet der Bot, wann Mitglieder den Server verlassen. Sobald jemand geht, speichert der Bot die Liste der Rollen, die diese Person zu diesem Zeitpunkt hatte. Tritt sie später wieder bei, fügt der Bot ihr jede gespeicherte Rolle wieder hinzu. Sie muss dann niemanden vom Team bitten, erneut verifiziert oder neu zugewiesen zu werden.

Aus Sicht des Mitglieds ändert sich beim Verlassen nichts. Beim Wiedereintritt sind die Rollen einfach wieder da, meist noch bevor es den Willkommenskanal zu Ende gelesen hat.

Das Team erhält pro Mitglied eine gespeicherte Rollenliste, die es ansehen, bearbeiten oder löschen kann. Dazu kommt eine Ausschlussliste für Rollen, die nie wiederhergestellt werden sollen, und eine Massenaktion „Alle speichern“. So gilt die Funktion auch für Mitglieder, die schon vor der Aktivierung auf dem Server waren.

## Warum du es nutzen würdest

- Verifizierte Mitglieder, die versehentlich oder um Benachrichtigungen loszuwerden gehen, kommen zurück, ohne Zugriff zu verlieren.
- Farb-, Ping- und Hobby-Rollen aus einem Reaktionsrollen-Menü überstehen einen Wiedereintritt.
- Server mit manuellem Verifizierungsprozess müssen Personen nicht erneut prüfen, die bereits freigegeben waren.
- Du kannst gezielt Rollen auswählen, die nie zurückkommen sollen, etwa eine temporäre Stummrolle oder eine Teamrolle.
- Beim Umzug einer Community auf einen neuen Server lassen sich Rollenzustände übertragen und Rollen mit gleichen Namen zuordnen.

## Wie ein Rollenzustand gespeichert wird

Wenn ein Mitglied den Server verlässt, prüft der Bot:

1. Rollenzustände sind für den Server aktiviert.
2. **Bots ignorieren** ist aus, oder das Mitglied ist kein Bot.
3. Das Mitglied steht nicht auf der Liste **Gesperrte Nutzer**.

Ist all das erfüllt, nimmt der Bot die aktuellen Rollen des Mitglieds, entfernt die `@everyone`-Rolle und alle verwalteten Rollen (Bot-Rollen, Booster-Rolle, Integrations-Rollen) und entfernt danach alles auf der Liste **Gesperrte Rollen**. Bleibt nichts übrig, wird nichts gespeichert. Andernfalls ersetzt die neue Liste, was vorher für dieses Mitglied gespeichert war.

Bans werden separat behandelt. Ist **Bei Bann löschen** aktiviert, löscht ein Bann den gespeicherten Zustand des Mitglieds. Entbannen und Wiedereintritt stellen dann nichts wieder her.

## Wie ein Rollenzustand wiederhergestellt wird

Beim Beitritt prüft der Bot erneut, ob die Funktion aktiviert ist, ob Bots nicht ignoriert werden (falls das Mitglied ein Bot ist) und ob der Nutzer nicht auf der Sperrliste steht. Dann fügt er jede gespeicherte Rolle in einer einzigen Anfrage hinzu. Rollen, die nicht mehr existieren oder über der höchsten Rolle des Bots stehen, lassen diese Anfrage fehlschlagen. Der Fehler wird nur protokolliert.

> [!PERMISSION]
> Der Bot braucht **Rollen verwalten**, und seine höchste Rolle muss über jeder Rolle stehen, die er zurückgeben soll.

### Auto-Zuweisungsrollen überspringen

Nutzt du zusätzlich Auto-Zuweisungsrollen aus dem Administrationsmodul, würde ein zurückkehrendes Mitglied normalerweise sowohl die gespeicherten Rollen als auch die Auto-Zuweisungsrollen erhalten. Mit dem Schalter **Auto-Zuweisung überspringen** über `togglerolestatesskipautoassign` überspringt der Bot die Auto-Zuweisungsrollen für alle mit gespeichertem Rollenzustand. Zurückkehrende Mitglieder bekommen dadurch nur, was sie vorher hatten. Dieser Schalter ist nur als Befehl verfügbar und steht nicht im Dashboard.

## Gespeicherte Zustände manuell verwalten

Teammitglieder können den Zustand eines Mitglieds erstellen oder anpassen, ohne auf dessen Austritt zu warten:

- `setuserrolestate` ersetzt die gespeicherte Liste eines Mitglieds durch die Rollen, die du angibst. Verwaltete Rollen und `@everyone` werden entfernt.
- `addrolestorolestate` und `removerolesfromrolestate` ändern eine bestehende gespeicherte Liste.
- `deleteuserrolestate` vergisst ein Mitglied vollständig.
- `saveallrolestates` erstellt einen Snapshot aller aktuellen Mitglieder auf einmal und wendet dieselben Bot- und Sperrfilter an wie eine automatische Speicherung.

Das Dashboard bietet eine Sache, die Befehle nicht haben: **Rollenzustand kopieren**. Damit werden die gespeicherten Rollen eines Mitglieds direkt auf ein anderes Mitglied angewendet, das gerade auf dem Server ist.

## Auf einen anderen Server übertragen

`transferrolestates <serverId>` kopiert jeden gespeicherten Zustand vom aktuellen Server auf einen anderen Server, auf dem der Bot ist. Rollen werden anhand des Namens abgeglichen, ohne Groß- und Kleinschreibung zu beachten. Verwaltete Rollen werden übersprungen. Mitglieder, deren gespeicherte Rollen auf dem Zielserver keinen Namens-Treffer haben, werden übersprungen. Auf dem Zielserver werden Rollenzustände automatisch aktiviert, falls sie es noch nicht waren. Hat der Zielserver keine eigenen Einstellungen, übernimmt er die Werte von **Bots ignorieren** und **Bei Bann löschen** vom Quellserver.

## Einstellungen

Der Tab **Einstellungen** auf der Seite Rollenzustände hat zwei Unter-Tabs: **Allgemein** und **Gesperrt**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Rollenzustände | Aus | Hauptschalter zum Speichern und Wiederherstellen |
| Bei Bann löschen | Aus | Löscht den gespeicherten Zustand eines Mitglieds, wenn es gebannt wird |
| Bots ignorieren | Aus | Speichert oder stellt keine Rollen für Bot-Konten wieder her |
| Aktuelle Zustände speichern | Schaltfläche | Snapshot der Rollen aller aktuellen Mitglieder jetzt erstellen |
| Gesperrte Rollen | keine | Rollen, die nie gespeichert werden und daher nie wiederhergestellt werden |
| Gesperrte Nutzer | keine | Mitglieder, deren Rollen nie gespeichert oder wiederhergestellt werden |

Der Tab **Verwaltung** enthält **Nutzerrollen verwalten** (ausgewählte Rollen zum gespeicherten Zustand eines Mitglieds hinzufügen oder daraus entfernen) und **Rollenzustand kopieren**. Der Tab **Rollenzustände** listet jeden gespeicherten Zustand mit Name, ID und Rollen des Mitglieds auf und lässt dich Details ansehen oder einen Eintrag löschen.

## Einrichtung

1. Stelle sicher, dass die Rolle des Bots über jeder Rolle steht, die er wiederherstellen soll.
2. Öffne **Rollenzustände** im Dashboard und aktiviere unter **Einstellungen**, **Allgemein** den Schalter **Rollenzustände**.
3. Aktiviere **Bots ignorieren**, außer du willst Bot-Rollen ausdrücklich merken.
4. Entscheide über **Bei Bann löschen**. Lass es aus, wenn entbannte Mitglieder ihre Rollen zurückbekommen sollen.
5. Füge unter **Gesperrt** Teamrollen, Strafrollen und alles Temporäre zu **Gesperrte Rollen** hinzu.
6. Drücke unter **Aktuelle Zustände speichern** auf **Alle speichern**, damit bestehende Mitglieder ab heute abgedeckt sind.
7. Prüfe den Tab **Rollenzustände**, um zu bestätigen, dass der Snapshot gefüllt wurde.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Jeder Befehl in diesem Modul benötigt Administrator.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `togglerolestates` | `trs` | Administrator | Rollenzustände ein- oder ausschalten |
| `viewrolestatessettings` | `vrss` | Administrator | Aktuelle Einstellungen und Sperrlisten anzeigen |
| `viewuserrolestates` | `viewrolestates`, `vurs` | Administrator | Alle gespeicherten Zustände durchblättern |
| `saveallrolestates` | `saveserverstates`, `backuprolestates` | Administrator | Jedes aktuelle Mitglied erfassen |
| `transferrolestates <serverId>` | `copyrolestates`, `moverolestates` | Administrator | Zustände auf einen anderen Server kopieren, Rollen anhand des Namens zuordnen |
| `togglerolestatesignorebots` | `trsib` | Administrator | Ignorieren von Bot-Konten umschalten |
| `togglerolestatesclearonban` | `trscob` | Administrator | Löschen eines Zustands beim Bann umschalten |
| `togglerolestatesskipautoassign` | `trssaa`, `rsskipautoassign` | Administrator | Überspringen von Auto-Zuweisungsrollen für Mitglieder mit gespeichertem Zustand umschalten |
| `rolestatesadddenyrole @role...` | `rsadr` | Administrator | Rollen zur Sperrliste hinzufügen |
| `rolestatesremovedenyrole @role...` | `rsrra` | Administrator | Rollen von der Sperrliste entfernen |
| `rolestatesadddenyuser @user...` | `rsadu` | Administrator | Mitglieder zur Sperrliste hinzufügen |
| `rolestatesremovedenyuser @user...` | `rolestatesremoveadduser`, `rsrau` | Administrator | Mitglieder von der Sperrliste entfernen |
| `setuserrolestate @user @role...` | `surs` | Administrator | Die gespeicherten Rollen eines Mitglieds ersetzen |
| `addrolestorolestate @user @role...` | `arsrs` | Administrator | Rollen zum gespeicherten Zustand eines Mitglieds hinzufügen |
| `removerolesfromrolestate @user @role...` | `rrfrs` | Administrator | Rollen aus dem gespeicherten Zustand eines Mitglieds entfernen |
| `deleteuserrolestate @user` | `dur` | Administrator | Den gespeicherten Zustand eines Mitglieds vergessen |

Die Slash-Entsprechungen liegen unter `/rolestates`.

## Tipps und Fallstricke

- Für Mitglieder, die schon auf dem Server waren, als du die Funktion aktiviert hast, wird nichts gespeichert, bis sie den Server verlassen oder du **Alle speichern** ausführst. Führe es direkt nach der Einrichtung einmal aus.
- Nur Austritte lösen eine Speicherung aus. Kicks zählen als Austritte. Bans zählen ebenfalls als Austritte, und der Zustand wird dann wieder entfernt, wenn **Bei Bann löschen** aktiviert ist.
- Die Wiederherstellung nutzt einen einzigen Aufruf zum Hinzufügen von Rollen. Eine fehlende oder zu hohe Rolle lässt die gesamte Wiederherstellung stillschweigend scheitern. Halte die Sperrliste daher aktuell, wenn du Rollen löschst oder neu anordnest.
- Verwaltete Rollen (Bot-Integrationsrollen, die Booster-Rolle) werden nie gespeichert. Discord vergibt sie selbst.
- `viewuserrolestates` zeigt drei Mitglieder pro Seite.
- Sowohl `setuserrolestate` als auch `deleteuserrolestate` akzeptieren einen Nutzer, der den Server bereits verlassen hat. So kannst du einen Zustand korrigieren, bevor jemand wieder beitritt.
- Gesperrte Nutzer betrifft nur automatisches Speichern und Wiederherstellen. Manuelle Befehle und **Rollenzustand kopieren** funktionieren bei diesen Mitgliedern weiterhin.

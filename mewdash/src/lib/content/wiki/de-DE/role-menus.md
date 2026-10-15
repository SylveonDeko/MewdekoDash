---
title: Rollenmenüs
slug: role-menus
summary: Postet eine Nachricht mit einem Dropdown oder Buttons, mit denen Mitglieder sich ihre Rollen selbst aussuchen.
icon: fa-list-ul
category: Actions
dashboard: /dashboard/role-menus
module: RoleMenus
tags: [role menus, self roles, dropdown, buttons, pronouns, colors, Rollenmenüs, Selbstzuweisung, Dropdown, Buttons, Pronomen, Farben]
related: [administration, embedbuilder, rolestates]
---

## Was es macht

Ein Rollenmenü ist eine Nachricht in einem Kanal, unter der ein **Dropdown** oder eine Reihe von **Buttons** steht. Jede Option des Menüs vergibt eine Rolle. Mitglieder wählen eine Option, um die Rolle zu bekommen, und wählen sie erneut, um sie wieder abzulegen. So kann ein Server die Leute ihre Pronomen, Farben, Pings oder Regionen selbst wählen lassen, ohne das Team zu fragen.

Jedes Menü hat einen Namen (nur das Team sieht ihn, und er ist der Titel der Standardnachricht), einen Kanal, eine Nachricht und bis zu 25 Optionen. Eine Option hat eine Rolle, den Namen, der im Menü angezeigt wird, ein optionales Emoji und eine optionale Beschreibung. Beschreibungen erscheinen unter jeder Dropdown-Option und in der Standardnachricht. Buttons haben außerdem eine Farbe: Blurple, Grau, Grün oder Rot.

Die Nachricht kann alles sein, was der Embed-Builder erstellt: reiner Text, ein oder mehrere Embeds oder beides. Lässt du sie leer, postet der Bot stattdessen den Namen des Menüs mit einer Zeile pro Option.

## Beliebig viele oder eine wählen

- **Beliebig viele wählen** lässt Mitglieder jede Rolle ein- oder ausschalten. Zwei Grenzen steuern, wie viele sie haben können: **Muss mindestens behalten** verhindert, dass sie nach der Auswahl unter eine Zahl fallen, und **Darf höchstens enthalten** begrenzt, wie viele Rollen aus dem Menü sie haben können (standardmäßig ohne Limit).
- **Eine wählen** tauscht Rollen: Wer eine neue Option wählt, verliert die bisherige. Schaltest du **Eine behalten, sobald gewählt** ein, können Mitglieder wechseln, ihre Wahl aber nicht aufheben.

## Limits

| Limit | Wert |
| --- | --- |
| Menüs pro Server | 50 |
| Optionen pro Menü | 25 |
| Buttons pro Reihe | 5 |
| Menüname | 100 Zeichen |
| Name im Menü | 80 Zeichen |
| Beschreibung | 100 Zeichen |
| Hinweistext im Dropdown | 150 Zeichen |
| Reine Textnachricht | 2000 Zeichen |

Jede Rolle darf nur einmal in einem Menü vorkommen. Der Bot kann nur Rollen unterhalb seiner eigenen höchsten Rolle vergeben, die keine Integration verwaltet, und das Team kann nur Rollen unterhalb der eigenen höchsten Rolle anbieten.

## Erforderliche Rolle

Ein Menü kann eine Rolle voraussetzen. Mitglieder ohne sie bekommen eine private Notiz, dass sie diese Rolle brauchen, und sonst ändert sich nichts.

## Bestätigung

Ist **Mitglieder über Änderungen informieren** aktiviert, bekommen Mitglieder eine private Notiz, die nur sie sehen, mit den hinzugefügten und entfernten Rollen. Ist sie ausgeschaltet, arbeitet das Menü leise. Mitglieder bekommen trotzdem eine private Notiz, wenn etwas schiefgeht, etwa wenn sie ein Limit erreichen oder der Bot eine Rolle nicht vergeben kann.

## Bearbeiten, Pausieren und erneut posten

Das Speichern einer Änderung baut dieselbe Nachricht an Ort und Stelle neu auf. Eine neue Nachricht wird nur gepostet, wenn sich der Kanal ändert oder die alte Nachricht nicht mehr existiert.

**Pausieren** graut das Dropdown oder die Buttons in Discord aus, bis das Menü fortgesetzt wird. **Erneut posten** postet eine frische Kopie und löscht die alte Nachricht. Das hilft, wenn ein Menü aus dem Blickfeld gescrollt ist oder von Hand gelöscht wurde. Wurde der Kanal eines Menüs gelöscht, bearbeite das Menü, wähle einen neuen Kanal und speichere, um es erneut zu posten.

Das Löschen eines Menüs löscht auch seine Nachricht. Mitglieder behalten die Rollen, die sie bereits gewählt haben.

## Ältere Setups verschieben

Ältere Emoji-Rollen-Setups verlangten, dass Mitglieder unter einer Nachricht ein Emoji hinzufügen, um eine Rolle zu bekommen. Der Tab **Ältere Setups verschieben** listet sie auf. Ein Setup zu verschieben erstellt ein Rollenmenü mit denselben Rollen und Emojis, als Dropdown oder Buttons, im selben oder einem anderen Kanal. Es kann den Text und die Embeds der alten Nachricht übernehmen und kann das alte Setup stilllegen, was es beendet und seine Emojis entfernt. Hat der Bot die ursprüngliche Nachricht gepostet, löscht das Stilllegen sie. Ein Setup, bei dem Mitglieder nur eine Rolle haben durften, wird zu einem Menü mit **Eine wählen**.

## Befehle

| Befehl | Was er macht |
| --- | --- |
| `rolemenus` | Listet jedes Menü mit Kanal, Typ, Anzahl der Optionen und Status auf. |
| `rolemenuinfo 3` | Zeigt alles zu einem Menü. |
| `rolemenucreate #roles dropdown @Role @Role` | Postet ein neues Menü mit einer Option pro Rolle. |
| `rolemenuadd 3 @Role [emoji] [name]` | Fügt einem Menü eine Rolle hinzu. |
| `rolemenuremove 3 @Role` | Entfernt eine Rolle aus einem Menü. |
| `rolemenuname 3 Pronouns` | Benennt ein Menü um. |
| `rolemenumessage 3 [message\|clear]` | Zeigt, setzt oder löscht die Nachricht über einem Menü. |
| `rolemenustyle 3 dropdown\|buttons` | Wechselt zwischen Dropdown und Buttons. |
| `rolemenumode 3 multi\|exclusive` | Wechselt zwischen Beliebig viele wählen und Eine wählen. |
| `rolemenulimits 3 0 2` | Legt fest, wie viele Rollen Mitglieder behalten müssen und haben dürfen. |
| `rolemenurequire 3 [@Role]` | Setzt oder löscht die erforderliche Rolle. |
| `rolemenureply 3 private\|silent` | Schaltet die private Notiz ein oder aus. |
| `rolemenupause 3` | Pausiert ein Menü oder setzt es fort, wenn es pausiert ist. |
| `rolemenurepost 3 [#channel]` | Postet eine frische Kopie und löscht die alte Nachricht. |
| `rolemenudelete 3` | Löscht ein Menü und seine Nachricht. |
| `rolemenuimport messageId [dropdown\|buttons]` | Verschiebt ein älteres Emoji-Rollen-Setup in ein neues Menü. |

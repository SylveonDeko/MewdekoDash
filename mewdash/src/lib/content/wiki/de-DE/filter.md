---
title: Nachrichtenfilter
slug: filter
summary: Löscht Nachrichten mit gesperrten Wörtern, Discord-Einladungen oder Links, warnt optional den Absender und bannt sofort bei einer separaten Liste von Auto-Ban-Wörtern.
icon: fa-filter
category: Security
dashboard: /dashboard/filter
module: Permissions
tags: [filter, word filter, invite filter, link filter, automod, auto ban, blacklist, banned words, regex, Filter, Wortfilter, Einladungsfilter, Linkfilter, AutoMod, Auto-Ban, Sperrliste, gesperrte Wörter, Regex]
related: [moderation, logging, administration]
---

## Was es macht

Der Filter prüft jede Nachricht, die ein Mitglied sendet oder bearbeitet, bevor andere Module sie sehen. Enthält die Nachricht ein gefiltertes Wort, eine Discord-Einladung oder einen Link an einer Stelle, an der dieser Filter aktiv ist, löscht der Bot sie. Du kannst außerdem veranlassen, dass der Bot über das Moderationssystem eine Verwarnung ausstellt und dem Mitglied eine DM schickt, die erklärt, was entfernt wurde.

Eine zweite Liste, Auto-Ban-Wörter, ist strenger. Eine Nachricht, die einem Auto-Ban-Wort entspricht, wird gelöscht und der Autor sofort gebannt, mit einer DM, die den Grund enthält, sofern der Bot sie senden kann.

Administratoren und alle, die die Team-Rolle des Servers haben (festgelegt mit `staffrole`), werden nie gefiltert. Auch Bot-Nachrichten werden nicht geprüft.

## Warum du es nutzen würdest

- Slurs und andere verbotene Begriffe aus dem Chat halten, ohne dass ein Moderator online sein muss.
- Verhindern, dass Mitglieder andere Server bewerben, indem sie Einladungslinks posten.
- Einen Kanal rein textbasiert machen, indem jede Nachricht mit einer URL entfernt wird, zum Beispiel in einem medienfreien Ankündigungschat.
- Konten, die bekannte Betrugsphrasen oder Raid-Muster posten, sofort bannen.

## Filtertypen

| Filter | Wo er greift | Was passiert |
| --- | --- | --- |
| Wortfilter | Nur in Kanälen auf der Kanalliste des Wortfilters | Nachricht gelöscht; Verwarnung und DM, wenn **Bei gefiltertem Wort verwarnen** aktiv ist |
| Einladungsfilter | Überall, wenn der Server-Schalter an ist und die Kanalliste leer ist, oder nur in aufgelisteten Kanälen, wenn die Liste Einträge hat | Nachricht gelöscht; Verwarnung und DM, wenn **Bei Einladungslink verwarnen** aktiv ist |
| Linkfilter | Überall, wenn der Server-Schalter an ist, plus alle Kanäle auf seiner Liste | Nachricht gelöscht, keine Verwarnung |
| Auto-Ban-Wörter | Überall | Nachricht gelöscht, Autor per DM benachrichtigt und gebannt |

Die drei Kanallisten sind die **Kanal-Überschreibungen** im Dashboard. Beachte, dass der Wortfilter vollständig von seiner Kanalliste gesteuert wird: Ein Kanal muss auf ihr stehen, damit dort Wörter geprüft werden.

## Wie Wörter abgeglichen werden

Gefilterte Wörter und Auto-Ban-Wörter werden als reguläre Ausdrücke behandelt und gegen den kleingeschriebenen Nachrichteninhalt geprüft. Ein einfaches Wort wie `example` wirkt als Teilstring-Treffer, sodass auch `examples` erfasst wird. Muster, die sich nicht kompilieren lassen, werden automatisch aus der Liste entfernt. Jedes Muster hat ein Zeitlimit von 250 Millisekunden.

Gefilterte Wörter werden kleingeschrieben gespeichert und groß- und kleinschreibungsunabhängig abgeglichen. Auto-Ban-Muster werden exakt so gespeichert, wie du sie eingibst, und gegen kleingeschriebenen Text geprüft. Schreib sie daher klein.

> [!WARNING]
> Auto-Ban-Muster sind mächtig. Ein kurzes Muster wie `ban` innerhalb eines längeren Wortes bannt Leute, die „banane“ tippen. Teste Muster zuerst als gefilterte Wörter.

## Verwarnungen

Aktivierst du **Bei gefiltertem Wort verwarnen** oder **Bei Einladungslink verwarnen**, fügt der Bot über das Moderationsmodul eine Verwarnung mit dem Grund „Wegen gefiltertem Wort verwarnt“ bzw. dem Grund für Einladungswarnungen hinzu und schickt dem Mitglied eine DM. Alle Verwarnungsstrafen, die auf der Moderationsseite eingerichtet sind, gelten wie üblich. Drei Filter-Treffer können also zu einer Stummschaltung oder einem Kick eskalieren, falls Verwarnungen so eingerichtet sind.

Auto-Bans nutzen die Einstellungen für das Löschen von Nachrichten aus dem Moderationsmodul für die Aktion „Filter“, um zu bestimmen, wie viele Tage Nachrichten gelöscht werden.

## Einstellungen

Die Seite Nachrichtenfilter hat vier Tabs: **Filter**, **Gefilterte Wörter**, **Auto-Ban-Wörter** und **Kanal-Überschreibungen**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Wortfilter | Aus | Server-weiter Schalter auf dem Tab Filter |
| Einladungsfilter | Aus | Löscht Discord-Einladungslinks. Nötig, damit die Kanalliste für Einladungen etwas bewirkt |
| Linkfilter | Aus | Löscht jede Nachricht mit einer URL, server-weit |
| Bei gefiltertem Wort verwarnen | Aus | Fügt eine Verwarnung hinzu und schickt dem Mitglied eine DM, wenn ein gefiltertes Wort entfernt wird |
| Bei Einladungslink verwarnen | Aus | Fügt eine Verwarnung hinzu und schickt dem Mitglied eine DM, wenn eine Einladung entfernt wird |
| Gefilterte Wörter | keine | Liste auf dem Tab Gefilterte Wörter, mit Entfernen pro Wort, einer Schaltfläche **Alle löschen**, die dasselbe tut wie `fwclear`, und einem Suchfeld, sobald mehr als zehn Wörter vorhanden sind |
| Auto-Ban-Wörter | keine | Liste auf dem Tab Auto-Ban-Wörter |
| Kanäle des Wortfilters | keine | Kanäle, in denen die Wortliste durchgesetzt wird |
| Kanäle des Einladungsfilters | keine | Beschränkt den Einladungsfilter auf diese Kanäle, wenn die Liste nicht leer ist |
| Kanäle des Linkfilters | keine | Zusätzliche Kanäle, in denen Links entfernt werden, auch wenn der Server-Schalter aus ist |

Oben auf der Seite stehen die Zähler für gefilterte Wörter, Auto-Ban-Wörter und Kanal-Überschreibungen.

## Einrichtung

1. Öffne **Nachrichtenfilter** im Dashboard.
2. Füge auf dem Tab **Gefilterte Wörter** jedes Wort oder jede Phrase hinzu und drücke Hinzufügen.
3. Füge unter **Kanal-Überschreibungen** unter **Kanäle des Wortfilters** jeden Kanal hinzu, in dem die Wortliste gelten soll.
4. Zurück auf **Filter**: Aktiviere **Einladungsfilter**, wenn Einladungen überall entfernt werden sollen, und **Bei Einladungslink verwarnen**, wenn das als Verwarnung zählen soll.
5. Optional fügst du auf dem Tab **Auto-Ban-Wörter** einige sehr zuverlässige Muster hinzu.
6. Führe `staffrole @Moderatoren` aus, damit dein Team ausgenommen ist. Poste dann mit einem normalen Konto ein gefiltertes Wort, um zu prüfen, dass es gelöscht wird.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `filterword <word>` | `fw` | Niemand | Ein Wort zur Filterliste hinzufügen oder entfernen, falls schon vorhanden |
| `lstfilterwords` | `lfw` | Niemand | Die Liste gefilterter Wörter durchblättern |
| `fwclear` | | Administrator | Alle gefilterten Wörter entfernen, die Kanalliste des Wortfilters leeren und den Server-Schalter ausschalten |
| `srvrfilterwords` | `sfw` | Niemand | Den server-weiten Wortfilter umschalten |
| `chnlfilterwords` | `cfw` | Niemand | Den aktuellen Kanal auf der Kanalliste des Wortfilters umschalten |
| `srvrfilterinv` | `sfi` | Niemand | Den server-weiten Einladungsfilter umschalten |
| `chnlfilterinv` | `cfi` | Niemand | Den aktuellen Kanal auf der Kanalliste des Einladungsfilters umschalten |
| `srvrfilterlin` | `sfl` | Niemand | Den server-weiten Linkfilter umschalten |
| `chnlfilterlin` | `cfl` | Niemand | Den aktuellen Kanal auf der Kanalliste des Linkfilters umschalten |
| `fwarn <y or n>` | `filteredwarn` | Administrator | Verwarnungen für gefilterte Wörter ein- oder ausschalten |
| `invwarn <y or n>` | `invitewarn` | Administrator | Verwarnungen für Einladungslinks ein- oder ausschalten |
| `autobanword <pattern>` | `autobanw` | Administrator | Ein Muster zur Auto-Ban-Liste hinzufügen oder entfernen, falls schon vorhanden |
| `autobanwordlist` | `autobwlist` | Administrator | Die Auto-Ban-Liste durchblättern |

> [!PERMISSION]
> Die Filterschalter und `filterword` haben keine eigene Berechtigungsprüfung. Nutze das Berechtigungsmodul, um sie einzuschränken, oder verwalte Filter über das Dashboard, wo die Zugriffsregeln des Dashboards gelten.

## Tipps und Fallstricke

- Der Bot braucht **Nachrichten verwalten** in jedem gefilterten Kanal und **Mitglieder bannen** für Auto-Ban-Wörter.
- Bearbeitete Nachrichten werden erneut geprüft. Ein Link, den du in eine alte Nachricht einfügst, wird daher trotzdem gelöscht.
- Filter gelten nicht für Administratoren, die Team-Rolle oder Bots. Teste nicht mit einem Administrator-Konto.
- `fwclear` tut mehr, als nur die Liste zu leeren: Es entfernt auch alle Kanal-Überschreibungen des Wortfilters.
- Ungültige Regex wird stillschweigend aus der Liste entfernt. Wenn ein Wort verschwindet, prüfe, ob es nicht maskierte Zeichen wie `(`, `[` oder `*` enthält.
- Wenn du ein Protokoll darüber willst, was der Filter entfernt hat, aktiviere das Logging für Nachrichtenlöschungen.

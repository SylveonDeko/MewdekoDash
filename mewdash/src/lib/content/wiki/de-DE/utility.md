---
title: Hilfsmittel
slug: utility
summary: Eine Werkzeugkiste für alltägliche Helfer, von Befehls-Aliasen, Zitaten und Erinnerungen über Auto-Veröffentlichen, Stream-Rollen und einen KI-Assistenten bis hin zu Nachrichtenzählung und Repeatern.
icon: fa-wrench
category: Actions
dashboard: /dashboard/utility
module: Utility
tags: [alias, quotes, auto publish, stream role, ai, chatbot, nsfw filter, role monitor, reminder, snipe, repeater, sticky, message count, invites, embed, calculator, userinfo, serverinfo, Aliase, Zitate, Auto-Veröffentlichen, Stream-Rolle, KI, NSFW-Filter, Rollenüberwachung, Erinnerung, Nachrichtenzähler, Einladungen, Rechner, Nutzerinfo, Serverinfo]
related: [repeaters, polls, invites, messagestats, embedbuilder, xp, administration, moderation]
---

## Was es macht

Hilfsmittel ist das Sammelmodul für kleine Funktionen, die fast jeder Server irgendwann haben möchte. Mitglieder bekommen Erinnerungen, Zitate, Würfelwürfe, einen Taschenrechner, Einheitenumrechnung und Info-Befehle zu Nutzern, Rollen, Kanälen und zum Server. Das Team bekommt Befehls-Aliase, wiederkehrende Nachrichten, Auto-Veröffentlichen für Ankündigungskanäle, eine Rolle, die Mitgliedern während des Streamens folgt, das „Sniping“ gelöschter Nachrichten, Nachrichtenzählung und Einladungs-Tracking.

Die Seite **Hilfsmittel** im Dashboard bündelt die Teile, die sich für ein Formular eignen: Aliase, Zitate, Auto-Veröffentlichen, Stream-Rolle, den KI-Assistenten, den NSFW-Tag-Filter und die Rollenüberwachung. Alles andere funktioniert nur per Befehl.

Weil dieses Modul so breit gefächert ist, wird jede Teilfunktion unten einzeln beschrieben. Die Befehlstabelle am Ende listet jeden Befehl des Moduls auf.

## Wofür du es nutzen kannst

- Kürze `play youtube` per Alias für den ganzen Server zu `yt` ab.
- Führe ein gemeinsames Zitatbuch, zu dem Mitglieder etwas hinzufügen und aus dem sie zufällige Zeilen abrufen können.
- Lass jeden Beitrag in deinem Ankündigungskanal automatisch an Follower veröffentlichen.
- Gib Mitgliedern nur dann eine „Live“-Rolle, wenn sie ein bestimmtes Spiel streamen.
- Poste alle paar Minuten Regeln oder einen angehefteten Hinweis, oder nur, wenn im Kanal etwas los ist.
- Lass Mitglieder Erinnerungen für sich selbst oder für einen Kanal setzen.
- Betreibe einen KI-Assistenten in einem Kanal mit deinem eigenen API-Schlüssel.

## Aliase

Ein Alias ist ein Auslöserwort, das der Bot vor der Ausführung in einen anderen Befehl umschreibt. `alias yt play youtube` bedeutet, dass `.yt lofi` als `.play youtube lofi` ausgeführt wird. Der Auslöser muss das erste Wort der Nachricht sein; alles danach wird an den zugeordneten Befehl angehängt. Längere Auslöser werden zuerst geprüft. Wenn du `alias <trigger>` ohne Zuordnung ausführst, wird der Alias entfernt, und `aliasesclear` entfernt alle.

Im Dashboard hat der Tab **Aliase** die Felder **Alias-Auslöser** und **Alias-Zuordnung**, ein Suchfeld und eine Liste, aus der du löschen kannst.

## Zitate

Zitate sind kurze Texte, die unter einem Stichwort abgelegt werden. `quoteadd <keyword> <text>` speichert eins, `quoteprint <keyword>` (oder `..`) zeigt ein zufälliges Zitat zu diesem Stichwort, und `quoteshow <id>` zeigt ein bestimmtes. `quotesearch` sucht in Stichwort und Text, `quoteid` zeigt, wer ein Zitat hinzugefügt hat, und `listquotes` blättert durch die Zitate, sortiert nach Stichwort oder Hinzufügedatum. Jeder kann Zitate hinzufügen. Ein Zitat kann vom Mitglied, das es hinzugefügt hat, oder von einem Administrator gelöscht werden; für das Löschen aller Zitate zu einem Stichwort, den Export als JSON und den Import aus einem JSON-Anhang brauchst du Administrator.

Im Tab **Zitate** kannst du Zitate hinzufügen, bearbeiten, suchen und löschen.

## Auto-Veröffentlichen

Bei Discord-Ankündigungskanälen muss jede Nachricht von Hand veröffentlicht werden. `addautopublish #channel` sorgt dafür, dass der Bot jede neue Nachricht in diesem Kanal veröffentlicht. Zwei Blacklists pro Kanal überspringen Nachrichten: `addpublishblacklist @user #channel` ignoriert einen Nutzer, und `addpublishblacklist #channel word` ignoriert jede Nachricht, die dieses Wort enthält (Groß- und Kleinschreibung egal). `getautopublishes` zeigt jeden Kanal mit seinen Blacklists.

Im Tab **Auto-Veröffentlichen** fügst du Kanäle hinzu und verwaltest die Listen **Nachrichten dieser Nutzer überspringen** und **Nachrichten mit diesen Wörtern überspringen**.

## Stream-Rolle

`streamrole <fromRole> <addRole>` gibt **addRole** an jedes Mitglied von **fromRole**, solange es streamt, und nimmt sie wieder weg, sobald es aufhört. `streamrolekeyword <keyword>` beschränkt das auf Streams, deren Titel das Stichwort enthält; ohne Stichwort ausgeführt wird es zurückgesetzt. Mitglieder auf der Whitelist erhalten die Rolle während des Streamens auch dann, wenn das Stichwort nicht passt, und Mitglieder auf der Blacklist erhalten sie nie. `streamrole` ohne Argumente schaltet die Funktion aus. Wenn der Bot die Berechtigung zum Verwalten der Rolle verliert oder die Rolle gelöscht wird, deaktiviert sich die Funktion von selbst.

Der Tab **Stream-Rolle** hat **Berechtigte Rolle**, **Rolle während des Streamens**, **Stichwort im Stream-Titel** sowie eine **Whitelist** und eine **Blacklist** nach Nutzer-ID.

## KI-Assistent

Der Assistent beantwortet jede Nachricht, die in einem gewählten Kanal gepostet wird, und behält als Kontext die letzten fünf Wortwechsel pro Mitglied. Wenn du in diesem Kanal `deletesession` schreibst, wird dein eigenes Gespräch gelöscht.

| Einstellung | Befehl | Was sie macht |
| --- | --- | --- |
| Kanal | `aichannel [#channel] [enabled]` | Der eine Kanal, in dem der Assistent mithört |
| Anbieter und Modell | `aimodel <OpenAi\|Groq\|Claude> [model]` | Welche API und welches Modell aufgerufen werden |
| API-Schlüssel | `aikey` | Dein eigener Schlüssel für diesen Anbieter; der Bot speichert ihn und zeigt ihn nicht wieder an |
| System-Prompt | `aiprompt <text>` | Anweisungen, denen das Modell folgt |
| Websuche | `aiwebsearch <true\|false>` | Erlaubt dem Modell, das Web zu durchsuchen (nur Claude) |
| Webhook | `aiwebhook [name] [avatarUrl]` | Antworten über einen Webhook mit eigenem Namen und Avatar posten |
| Eigenes Embed | `aicustomembed [template]` | Antworten in ein Embed packen; `%airesponse%` markiert, wo die Antwort steht |

`aiconfig` zeigt die aktuelle Konfiguration. Der Tab **KI-Assistent** hat **Assistent aktiviert**, **Kanal**, **Anbieter**, **Modell**, **API-Schlüssel**, **System-Prompt**, **Websuche erlauben** und **Hinweise zur Websuche („searching the web“) ausblenden**.

> [!WARNING]
> Der Assistent läuft über deinen API-Schlüssel und auf deine Rechnung. Ist kein Schlüssel gesetzt, bekommen Nachrichten im Kanal eine Fehlerantwort.

## NSFW-Filter

Der Tab **NSFW-Filter** listet blockierte Tags für die Bildsuchen des NSFW-Moduls. Gib einen Tag in **Zu blockierender Tag** ein, um ihn hinzuzufügen, oder klicke auf einen, um ihn zu entfernen. Der passende Befehl ist `nsfwtagbl [tag]` aus dem NSFW-Modul; ohne Tag listet er die aktuelle Blacklist auf.

## Rollenüberwachung

Der Tab **Rollenüberwachung** konfiguriert die Rollenüberwachung des Moduls Servermanagement. Sie reagiert, wenn eine Rolle oder Berechtigung, die du als geschützt markiert hast, vergeben wird. Wähle eine **Standardstrafe** (nur die Änderung rückgängig machen, verwarnen, alle Rollen entfernen, stummschalten, Timeout, kicken oder bannen), füge zu schützende Rollen und Berechtigungen hinzu und liste **Vertrauenswürdige Rollen** und **Vertrauenswürdige Mitglieder** auf, die ausgenommen sind. Die Befehle (`addblacklistedrole`, `addblacklistedpermission`, `whitelistuser`, `whitelistrole`, `setdefaultpunishment`, `listblacklists`) sind nur für den Server-Inhaber und gehören zum Servermanagement.

## Erinnerungen

`remind me <time> <message>` schickt dir später eine DM; `remind here <time> <message>` postet im aktuellen Kanal; `remind #channel <time> <message>` zielt auf einen anderen Kanal und erfordert Nachrichten verwalten. Die Zeit wird zum Beispiel als `2h30m`, `3 days`, `1w` oder `in 45 minutes` geschrieben und darf höchstens 60 Tage in der Zukunft liegen. `remindlist` zeigt deine Erinnerungen mit Indexnummern und `reminddelete <index>` entfernt eine. Erwähnungen in der Nachricht werden entschärft, es sei denn, du darfst in diesem Kanal alle erwähnen.

## Snipe

Sniping ist aus, bis ein Administrator `snipeset enable` ausführt. Sobald es aktiv ist, behält der Bot gelöschte und bearbeitete Nachrichten 30 Tage lang. `snipe [#channel] [@user]` zeigt die zuletzt gelöschte Nachricht, `editsnipe` die zuletzt bearbeitete, und `snipelist` und `editsnipelist` zeigen die letzten fünf (oder eine Anzahl, die du angibst), gefiltert nach Kanal oder Nutzer.

## Repeater

Ein Repeater postet eine Nachricht nach Zeitplan. `repeat <message>` nutzt ein Intervall von fünf Minuten; `repeat <interval> <message>` setzt eins zwischen 5 Sekunden und 25000 Minuten; `repeat <time of day> <message>` läuft einmal am Tag. Jeder Repeater hat einen Index, den `repeatlist` anzeigt.

| Auslösemodus | Verhalten |
| --- | --- |
| `timeinterval` | In jedem Intervall posten (Standard) |
| `onactivity` | Posten, nachdem der Kanal innerhalb eines Zeitfensters eine bestimmte Anzahl Nachrichten gesehen hat (`repeatactivity`) |
| `onnoactivity` | Posten, wenn der Kanal im Zeitfenster ruhig war |
| `immediate` | Sofort posten, danach dem Intervall folgen |
| `aftermessages` | Nach einer bestimmten Anzahl Nachrichten posten |

Weitere Schalter pro Repeater: `repeatredun` überspringt das Posten, wenn die Nachricht des Repeaters bereits die letzte im Kanal ist; `repeatschedule <business\|evening\|weekend\|custom>` begrenzt, wann er läuft; `repeatconversation` schaltet die Gesprächserkennung um; `repeatpriority` ordnet Repeater von 0 bis 100; `repeatthreadonly` und `repeatthreadautosticky` zielen auf Threads; `repeatforumtags` schränkt Forenbeiträge nach Tag ein; `repeatsuppressnotifications` sendet lautlos; `repeattoggle` pausiert.

## Nachrichtenzählung und Einladungen

`togglemsgcount` schaltet die Nachrichtenzählung ein. `usermessages`, `channelmessages`, `servermessages` und `topusers` melden Zählungen, `activitygraph` zeichnet die aktivsten Stunden oder Tage, und `minmsglength` ignoriert Nachrichten, die kürzer als eine bestimmte Länge sind. `resetmessagecounts` löscht nach einer Bestätigung die Zählungen für einen Nutzer, einen Kanal oder beides.

Das Einladungs-Tracking erfasst, wer jedes Mitglied eingeladen hat. `invites`, `whoinvited`, `invitedusers` und `inviteleaderboard` lesen die Daten aus. `toggleinvitetracking`, `toggleremoveinviteonleave` und `setminaccountage <days>` steuern es; Konten, die jünger als das Mindestalter sind, werden nicht mitgezählt.

## Einstellungen

Die Dashboard-Seite ist in Tabs unterteilt: **Aliase**, **Zitate**, **Auto-Veröffentlichen**, **Stream-Rolle**, **KI-Assistent**, **NSFW-Filter** und **Rollenüberwachung**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Alias-Auslöser und -Zuordnung | keine | Das Wort, das umgeschrieben wird, und der Befehl, der daraus wird |
| Zitat-Stichwort und -Text | keine | Ein gespeichertes Zitat |
| Auto-Veröffentlichen-Kanäle | keine | Ankündigungskanäle, in denen der Bot veröffentlicht |
| Nachrichten dieser Nutzer / mit diesen Wörtern überspringen | keine | Blacklists für das Veröffentlichen pro Kanal |
| Berechtigte Rolle | keine | Mitglieder, die die Stream-Rolle erhalten können |
| Rolle während des Streamens | keine | Die Rolle, die hinzugefügt und entfernt wird |
| Stichwort im Stream-Titel | jeder Stream | Nur Streams, deren Titel diesen Text enthält, zählen |
| Assistent aktiviert | aus | Ob der KI-Kanal antwortet |
| Anbieter, Modell, API-Schlüssel, System-Prompt | keine | KI-Konfiguration |
| Websuche erlauben | aus | Claude-Websuche |
| Hinweise zur Websuche („searching the web“) ausblenden | an | Unterdrückt die Statusmeldungen des Modells zur Websuche |
| Blockierte Tags | keine | NSFW-Suchtags, die gefiltert werden |
| Standardstrafe | Standard verwenden | Aktion der Rollenüberwachung |

Sniping, Nachrichtenzählung, Einladungs-Tracking, Repeater, Erinnerungen und Linkvorschauen haben keine Dashboard-Steuerung.

## Einrichtung Schritt für Schritt

1. Öffne **Hilfsmittel** im Dashboard.
2. Füge unter **Aliase** einen Auslöser wie `yt` hinzu, der auf `play youtube` zeigt. Teste ihn in Discord.
3. Füge unter **Auto-Veröffentlichen** deinen Ankündigungskanal hinzu. Trage Bot- oder Webhook-Nutzer in die Überspringen-Liste ein.
4. Wähle unter **Stream-Rolle** die berechtigte Rolle und die Rolle, die hinzugefügt werden soll, und optional ein Titel-Stichwort. Prüfe, dass die Rolle des Bots über der Rolle liegt, die er vergibt.
5. Wähle unter **KI-Assistent** einen Kanal, einen Anbieter und ein Modell, füge deinen Schlüssel ein, schreibe einen System-Prompt und aktiviere ihn.
6. Führe in Discord `snipeset enable` aus, wenn du das Sniping gelöschter Nachrichten willst, und `togglemsgcount` für Nachrichtenstatistiken.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `alias <trigger> [mapping]` | `cmdmap` | Administrator | Einen Alias hinzufügen, oder ohne Zuordnung entfernen |
| `aliaslist` | `cmdmaplist`, `aliases` | Keine | Aliase auflisten |
| `aliasesclear` | `aliasclear` | Administrator | Alle Aliase entfernen |
| `quoteadd <keyword> <text>` | `.` | Keine | Ein Zitat hinzufügen |
| `quoteprint <keyword>` | `..` | Keine | Zufälliges Zitat zu einem Stichwort |
| `quoteshow <id>` | | Keine | Ein Zitat per ID anzeigen |
| `quotesearch <keyword> <text>` | `qsearch` | Keine | Ein Zitat nach Stichwort und Text finden |
| `quoteid <id>` | `qid` | Keine | Wer ein Zitat hinzugefügt hat |
| `listquotes [page] [order]` | `liqu` | Keine | Durch Zitate blättern |
| `quotedelete <id>` | `qdel` | Keine (eigene Zitate) oder Administrator | Ein Zitat löschen |
| `delallquotes <keyword>` | `daq`, `delallq` | Administrator | Alle Zitate zu einem Stichwort löschen |
| `quoteexport` | `qexport` | Administrator | Zitate als JSON exportieren |
| `quoteimport` | `qimport` | Administrator | Zitate aus einer angehängten JSON-Datei importieren |
| `addautopublish <#channel>` | `addautopub`, `aap` | Administrator | Einen News-Kanal automatisch veröffentlichen |
| `removeautopublish <#channel>` | `removeautopub` | Administrator | Auto-Veröffentlichen beenden |
| `addpublishblacklist <@user> <#channel>` oder `<#channel> <word>` | `addpubbl` | Administrator | Einen Nutzer oder ein Wort überspringen |
| `removepublishblacklist <@user> <#channel>` oder `<#channel> <word>` | `removepubbl` | Administrator | Ein Überspringen aufheben |
| `getautopublishes` | `getaps` | Administrator | Auto-Veröffentlichen-Kanäle auflisten |
| `streamrole [fromRole] [addRole]` | | Rollen verwalten | Die Stream-Rolle setzen, oder ohne Rollen deaktivieren |
| `streamrolekeyword [keyword]` | `srkw` | Rollen verwalten | Ein Stichwort im Stream-Titel verlangen |
| `streamroleblacklist <add\|remove> <@user>` | `srbl` | Rollen verwalten | Dieses Mitglied nie die Rolle erhalten lassen |
| `streamrolewhitelist <add\|remove> <@user>` | `srwl` | Rollen verwalten | Diesem Mitglied während des Streamens immer die Rolle geben |
| `aichannel [#channel] [enabled]` | `aic` | Server verwalten | Den KI-Kanal festlegen |
| `aimodel <provider> [model]` | `aim` | Server verwalten | Anbieter und Modell |
| `aikey` | `ak` | Administrator | Den API-Schlüssel setzen |
| `aiprompt <text>` | `aip` | Server verwalten | System-Prompt |
| `aiwebsearch <true\|false>` | `aws` | Server verwalten | Claude-Websuche |
| `aiwebhook [name] [avatar]` | `aiw` | Administrator | Über einen Webhook antworten, oder ohne Namen deaktivieren |
| `aicustomembed [template]` | `aice` | Administrator | Embed-Vorlage für Antworten |
| `aiconfig` | `ac` | Keine | KI-Einstellungen anzeigen |
| `remind <me\|here> <time> <message>` | | Keine | Eine Erinnerung setzen |
| `remind <#channel> <time> <message>` | | Nachrichten verwalten | Erinnerung in einem anderen Kanal |
| `remindlist` | `remindl`, `remindlst` | Keine | Deine Erinnerungen |
| `reminddelete <index>` | `remindrm`, `reminddel` | Keine | Eine Erinnerung löschen |
| `snipeset <enable\|disable>` | `setsnipe` | Administrator | Sniping ein- oder ausschalten |
| `snipe [#channel] [@user]` | | Keine | Letzte gelöschte Nachricht |
| `editsnipe [#channel] [@user]` | | Keine | Letzte bearbeitete Nachricht |
| `snipelist [#channel] [@user] [amount]` | `slist` | Keine | Zuletzt gelöschte Nachrichten |
| `editsnipelist [#channel] [@user] [amount]` | `esnipelist` | Keine | Zuletzt bearbeitete Nachrichten |
| `repeat [time] [interval] <message>` | | Nachrichten verwalten | Einen Repeater erstellen |
| `repeatlist` | `replst`, `replist`, `repli` | Nachrichten verwalten | Repeater auflisten |
| `repeatremove <index>` | `reprm` | Nachrichten verwalten | Einen Repeater löschen |
| `repeatinvoke <index>` | `repinv` | Nachrichten verwalten | Ihn jetzt posten |
| `repeatmessage <index> <message>` | `repmsg` | Nachrichten verwalten | Den Text ändern |
| `repeatchannel <index> [#channel]` | `repchan` | Nachrichten verwalten | Ihn verschieben |
| `repeatredun <index>` | `repred` | Nachrichten verwalten | Die Redundanzprüfung umschalten |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Nachrichten verwalten | Auslösemodus aus der Tabelle oben |
| `repeatactivity <index> <messages> <window>` | `repactivity`, `repact` | Nachrichten verwalten | Aktivitätsschwelle |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Nachrichten verwalten | Priorität |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Nachrichten verwalten | Tageszeit-Zeitplan |
| `repeatconversation <index>` | `repconversation`, `repconv` | Nachrichten verwalten | Gesprächserkennung umschalten |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Nachrichten verwalten | Pausieren oder fortsetzen |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Nachrichten verwalten | In neuen Threads anheften |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Nachrichten verwalten | Nur in Threads posten |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Nachrichten verwalten | Lautlos senden |
| `repeatforumtags <index> <action> [tagType] [tags]` | `repforumtags`, `repftags` | Nachrichten verwalten | Regeln für Forum-Tags |
| `togglemsgcount` | `togglemessagecount` | Administrator | Nachrichtenzählung ein- oder ausschalten |
| `minmsglength [length]` | `mmlength`, `minmlength` | Server verwalten | Kurze Nachrichten ignorieren |
| `usermessages [@user]` | `usermsg`, `umsg` | Keine | Nachrichtenstatistik eines Mitglieds |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Keine | Nachrichtenstatistik eines Kanals |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg`, `gmsg` | Keine | Serverweite Statistik |
| `topusers` | `topu` | Keine | Top Ten nach Nachrichtenzahl |
| `activitygraph [days\|hours]` | `actgraph` | Keine | Diagramm der aktivsten Zeiten |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Nachrichten verwalten | Zählungen zurücksetzen |
| `invites [@user]` | | Keine | Einladungsanzahl |
| `whoinvited [@user]` | `invitedby` | Keine | Wer ein Mitglied eingeladen hat |
| `invitedusers [@user]` | `userinvites` | Keine | Mitglieder, die jemand eingeladen hat |
| `inviteleaderboard` | `inviteslb` | Keine | Top-Einlader |
| `invitesettings` | `inviteconfig` | Server verwalten | Einladungseinstellungen anzeigen |
| `toggleinvitetracking` | | Server verwalten | Tracking ein- oder ausschalten |
| `toggleremoveinviteonleave` | `triol` | Server verwalten | Einladungen nicht mehr zählen, wenn das eingeladene Mitglied geht |
| `setminaccountage <days>` | `inviteminage` | Server verwalten | Junge Konten ignorieren |
| `joinstats` | `jstats` | Beta-Flag (`dragon`) | Beitritts-Diagramm |
| `leavestats` | `lstats` | Beta-Flag (`dragon`) | Austritts-Diagramm |
| `joinstatscolor [r g b]` | `jstatscolor` | Beta-Flag (`dragon`) | Farbe des Beitritts-Diagramms, ohne Werte Gold |
| `leavestatscolor [r g b]` | `lstatscolor` | Beta-Flag (`dragon`) | Farbe des Austritts-Diagramms, ohne Werte Gold |
| `userinfo [@user]` | `uinfo` | Keine | Mitgliedsdetails |
| `serverinfo [name]` | `sinfo` | Keine | Serverdetails |
| `channelinfo [#channel]` | `cinfo` | Keine | Details zum Textkanal |
| `vinfo [channel]` | `voiceinfo` | Keine | Details zum Sprachkanal |
| `rinfo <role>` | `roleinfo` | Keine | Rollendetails |
| `fetch <id>` | | Keine | Einen beliebigen Nutzer per ID nachschlagen |
| `avatar [@user]` | `av` | Keine | Avatar, mit einer Schaltfläche für den Server-Avatar |
| `banner [@user]` | `userbanner` | Keine | Nutzerbanner |
| `userid [@user]` | `uid` | Keine | Nutzer-ID |
| `roleid <role>` | `rid` | Keine | Rollen-ID |
| `channelid` | `cid` | Keine | Kanal-ID |
| `serverid` | `sid` | Keine | Server-ID |
| `roles [@user]` | | Keine | Serverrollen oder die Rollen eines Mitglieds |
| `inrole <role>` | | Keine | Mitglieder mit einer Rolle |
| `inroles <role> <role>` | | Keine | Mitglieder mit beiden Rollen |
| `rolepermlist [and\|or] <permissions...>` | `roleperms` | Keine | Rollen mit bestimmten Berechtigungen |
| `channeltopic [#channel]` | `ct` | Keine | Kanalthema |
| `whosplaying <game>` | `whpl` | Keine | Mitglieder, die ein Spiel spielen |
| `emotelist [type]` | | Keine | Server-Emotes |
| `showemojis <emojis>` | `se` | Keine | Emojis vergrößern |
| `say [#channel] <text or embed JSON>` | | Nachrichten verwalten | Als Bot sprechen |
| `getjson <messageId> [#channel]` | | Nachrichten verwalten | Embed-JSON einer Nachricht |
| `embedsave <name> <json>` | `esave` | Keine | Eine persönliche Embed-Vorlage speichern |
| `guildembedsave <name> <json>` | `gesave`, `gembedsave` | Nachrichten verwalten | Eine Server-Embed-Vorlage speichern |
| `embedlist` / `guildembedlist` | `elist` / `gelist`, `gembedlist` | Keine | Vorlagen auflisten |
| `embeddelete <name>` / `guildembeddelete <name>` | `edel`, `edelete` / `gedel`, `gembeddelete` | Keine / Nachrichten verwalten | Eine Vorlage löschen |
| `embedpreview <name>` | `epreview`, `eprev` | Keine | Eine Vorlage in der Vorschau ansehen |
| `debugembed <text>` | `embeddebug` | Administrator | Embed-Parsing testen |
| `savechat <time> [#channel]` | | Nachrichten verwalten | Ein Chatprotokoll speichern und einen Link erhalten |
| `calculate <expression>` | `calc` | Keine | Mathematik auswerten |
| `calcops` | | Keine | Verfügbare mathematische Operationen |
| `plot <function> [start] [end]` | `graphfunction` | Keine | Eine Funktion als Graph zeichnen |
| `sym <expression>` | `symbolicmath` | Keine | Symbolische Mathematik |
| `convertunits <from> <to> <value>` | `unitconvert`, `units` | Keine | Einheitenumrechnung |
| `convertlist` | | Keine | Unterstützte Einheiten |
| `convert <format>` | | Keine | Eine angehängte Mediendatei konvertieren |
| `roll <dice>` | | Keine | Würfeln, DnD-Notation wird unterstützt |
| `owoify <text>` | `owo` | Keine | Text OwOifizieren |
| `vcheck [url]` | `viruscheck` | Keine | VirusTotal-Scan eines Links |
| `traceroute <host>` | `tracert`, `trcrt` | Keine | Die Route zu einem Host verfolgen |
| `pingip <ip> [count]` | | Keine | Eine Adresse anpingen, bis zu 10 Mal |
| `previewlinks <yes\|no>` | `plinks` | Administrator | Linkvorschauen umschalten |
| `verboseerror [true\|false]` | `ve` | Nachrichten verwalten | Ausführliche Befehlsfehler umschalten |
| `ping` | | Keine | Latenz des Bots |
| `stats` | | Keine | Statistiken des Bots |
| `invite` | | Keine | Einladungs- und Support-Links des Bots |
| `vote` | | Keine | Vote-Link |

## Tipps und Stolperfallen

- Ein Alias schreibt nur den Text um; der zugeordnete Befehl läuft weiterhin mit seinen eigenen Berechtigungsprüfungen.
- Auto-Veröffentlichen funktioniert nur in Discord-Ankündigungskanälen (News).
- Die Stream-Rolle braucht die Rolle des Bots über der Rolle, die er hinzufügt. Kann er die Rolle nicht verwalten, schaltet sich die Funktion selbst ab, statt bei jedem Stream stillschweigend zu scheitern.
- Sniping ist standardmäßig aus, und Snipes, die älter als 30 Tage sind, werden verworfen.
- Erinnerungen, die länger als 60 Tage dauern, werden abgelehnt.
- Der KI-Assistent antwortet nur im einen konfigurierten Kanal und ignoriert Bots. Sein Gedächtnis sind die letzten fünf Nachrichten pro Mitglied, daher geht bei langen Gesprächen früher Kontext verloren.
- Die Nachrichtenzählung muss eingeschaltet sein, bevor Statistiken entstehen; rückwirkend wird nichts gezählt.
- `joinstats` und `leavestats` können alle zehn Sekunden einmal ausgeführt werden.

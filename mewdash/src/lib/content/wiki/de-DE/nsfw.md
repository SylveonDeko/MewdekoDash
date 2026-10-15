---
title: NSFW
slug: nsfw
summary: Erwachsenen-Bildbefehle, die nur in als NSFW markierten Kanälen funktionieren, mit einer Tag-Blacklist pro Server und optionalem zeitgesteuertem automatischem Posten.
icon: fa-eye-slash
category: Entertainment
module: Nsfw
tags: [nsfw, hentai, booru, rule34, e621, danbooru, gelbooru, nhentai, reddit, tag blacklist, autohentai, nsfwtoggle, NSFW-Kanal, Tag-Blacklist, automatisches Posten, Zeitplan, Erwachseneninhalte, Bildboards]
related: [servermanagement, permissions, filter]
---

## Was es macht

Das NSFW-Modul holt auf Anfrage Erwachseneninhalte von Bildboards und Reddit. Jeder Befehl darin trägt Discords NSFW-Anforderung: Er läuft nur in einem Kanal, bei dem das NSFW-Flag gesetzt ist, und die meisten Bildboard-Befehle funktionieren auch per DM mit dem Bot. In jedem anderen Kanal wird der Befehl stillschweigend abgelehnt.

Das Team steuert zwei Dinge. `nsfwtoggle` (im Verwaltungsmodul) schaltet das NSFW-Flag des aktuellen Kanals um, wodurch die Befehle dort freigeschaltet werden. `nsfwtagbl` führt eine Liste von Tags, die aus jeder Bildboard-Suche auf diesem Server entfernt werden, damit ein Server das Modul erlauben und trotzdem Inhalte ausschließen kann, die er nicht will.

Mitglieder rufen einen Quellbefehl mit optionalen Tags auf und erhalten ein Bild mit Bewertung, Quelle und den ersten Tags. Die „Bomb“-Varianten posten gleich vier Bilder. Moderatoren können außerdem einen Timer starten, der alle paar Sekunden ein neues Bild in einen Kanal postet.

## Wofür du es brauchst

- Ein Server ab 18 möchte Bildbefehle auf seine markierten Kanäle beschränken.
- Das Team will bestimmte Tags serverweit sperren, ohne das Modul abzuschalten.
- Ein eigener Kanal soll per Timer ein neues Bild bekommen, ohne dass jemand etwas tippt.

## Kanalvoraussetzung

Discords NSFW-Flag gilt pro Kanal. Führe `nsfwtoggle` in einem Kanal aus, um es ein- oder auszuschalten; dafür brauchst du und der Bot Kanäle verwalten. Der Bot antwortet mit dem neuen Status. Dasselbe Flag kannst du auch in Discords Kanaleinstellungen setzen.

Wird ein Befehl in einem Nicht-NSFW-Kanal verwendet, passiert nichts. Mitglieder halten das manchmal für einen Fehler des Bots, deshalb hilft ein Hinweis in deinem Regelkanal.

## Quellen

| Befehl | Quelle | Hinweise |
| --- | --- | --- |
| `hentai [tags]` | Kombinierte Boards, nur explizit | Fünf Sekunden Abklingzeit |
| `yandere`, `konachan`, `sankaku`, `e621`, `rule34`, `danbooru`, `gelbooru`, `derpibooru`, `safebooru`, `realbooru` | Das jeweils genannte Board | Jeder nimmt optionale Tags |
| `hentaibomb [tags]` | Yandere, Danbooru, Konachan und Gelbooru | Vier Bilder auf einmal |
| `pornbomb [tags]` | Realbooru | Vier Bilder auf einmal |
| `redditnsfw <subreddit>` | Ein zufälliger Top-Beitrag aus diesem Subreddit | Zehn Sekunden Abklingzeit |
| `boobs`, `butts` | Feste Subreddits über `redditnsfw` | |
| `pussy`, `anal`, `porn`, `bondage`, `hentaigif` | Kategorie-Endpunkte | Nur NSFW-Kanal, keine DM |
| `nhentai <id>` | Eine bestimmte Galerie per Nummer | Lehnt Galerien mit den Tags lolicon oder shotacon ab |
| `nhentaisearch <query> [page] [type] [blacklist]` | Galerie-Suche | |

Tags werden durch Leerzeichen getrennt. Bei e621 und Derpibooru wird der Tag `yuri` automatisch in das entsprechende Tag dieses Boards übersetzt. Pro Server kann nur ein `hentaibomb` und ein `pornbomb` gleichzeitig laufen.

## Tag-Blacklist

`nsfwtagbl` ohne Argument listet die gesperrten Tags auf. `nsfwtagbl <tag>` fügt den Tag hinzu oder entfernt ihn, falls er schon auf der Liste steht. Ergebnisse mit einem gesperrten Tag werden bei jedem Bildboard-Befehl auf dem Server übersprungen. Dafür brauchst du Nachrichten verwalten.

## Automatisches Posten

`autohentai <seconds> [tags]`, `autoboobs <seconds>` und `autobutts <seconds>` starten einen Timer im aktuellen Kanal. Das Intervall muss bei `autohentai` und `autobutts` mindestens 20 Sekunden betragen; `autoboobs` erzwingt kein Minimum. Der Befehl mit `0` oder ganz ohne Intervall stoppt den Timer für diesen Kanal. Bei `autohentai` trennst du alternative Tag-Sets mit `|`, und der Bot wählt jedes Mal zufällig eines aus; lässt du die Tags weg, kommen zufällige Bilder. Dafür brauchst du Nachrichten verwalten, und der Kanal muss NSFW sein. Timer überleben keinen Neustart des Bots.

## Einstellungen

Für dieses Modul gibt es keine Dashboard-Seite.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| NSFW-Flag des Kanals | aus | Ob einer dieser Befehle in einem Kanal läuft |
| Tag-Blacklist | leer | Auf diesem Server aus Bildboard-Ergebnissen ausgeschlossene Tags |
| Timer für automatisches Posten | keine | Timer pro Kanal, gestartet mit den `auto...`-Befehlen |

## Einrichtung Schritt für Schritt

1. Wähle den Kanal aus und führe `nsfwtoggle` darin aus oder setze das Flag in Discords Kanaleinstellungen.
2. Nutze Befehlsberechtigungen, um das Modul überall sonst fernzuhalten, zum Beispiel `srvrmdl nsfw disable` gefolgt von `chnlmdl nsfw enable #adult`.
3. Füge unerwünschte Tags mit `nsfwtagbl <tag>` hinzu, einen pro Befehl.
4. Teste mit `hentai` oder `rule34 <tag>` im Kanal.
5. Optional startest du `autohentai 300 <tags>` und stoppst es später mit `autohentai 0`.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Kanäle verwalten | Das NSFW-Flag des aktuellen Kanals umschalten |
| `nsfwtagbl [tag]` | `nsfwtbl` | Nachrichten verwalten | Einen gesperrten Tag auflisten, hinzufügen oder entfernen |
| `hentai [tags]` | | Niemand | Ein explizites Bild aus den kombinierten Boards |
| `hentaibomb [tags]` | | Niemand | Vier Bilder von vier Boards |
| `pornbomb [tags]` | | Niemand | Vier Realbooru-Bilder |
| `yandere [tags]` | | Niemand | Yande.re |
| `konachan [tags]` | | Niemand | Konachan |
| `sankaku [tags]` | | Niemand | Sankaku |
| `e621 [tags]` | | Niemand | e621 |
| `rule34 [tags]` | `r34` | Niemand | Rule34 |
| `danbooru [tags]` | | Niemand | Danbooru |
| `gelbooru [tags]` | | Niemand | Gelbooru |
| `derpibooru [tags]` | `derpi` | Niemand | Derpibooru |
| `safebooru [tags]` | | Niemand | Safebooru |
| `realbooru [tags]` | `rb` | Niemand | Realbooru |
| `redditnsfw <subreddit>` | `nsfwsubreddit` | Niemand | Zufälliger Beitrag aus einem Subreddit |
| `boobs` | | Niemand | Reddit-Abkürzung |
| `butts` | `ass`, `butt` | Niemand | Reddit-Abkürzung |
| `pussy` | | Niemand | Kategoriebild |
| `anal` | | Niemand | Kategoriebild |
| `porn` | | Niemand | Kategoriebild |
| `bondage` | | Niemand | Kategoriebild |
| `hentaigif` | | Niemand | Kategorie-GIF |
| `nhentai <id>` | `nh` | Niemand | Eine Galerie per Nummer durchblättern |
| `nhentaisearch <query> [page] [type] [blacklist]` | `nhsearch`, `nhs` | Niemand | Galerien durchsuchen |
| `autohentai [seconds] [tags]` | | Nachrichten verwalten | Zeitgesteuertes Posten; `0` stoppt |
| `autoboobs [seconds]` | | Nachrichten verwalten | Zeitgesteuertes Posten; `0` stoppt; kein Mindestintervall |
| `autobutts [seconds]` | | Nachrichten verwalten | Zeitgesteuertes Posten; `0` stoppt |

## Tipps und Stolperfallen

- Die Altersprüfung besteht aus Discords Kanal-Flag und der Tag-Blacklist des Bots. Der Bot prüft weder das Alter noch Rollen der Mitglieder; dafür nutze Befehlsberechtigungen.
- Bot-Besitzer können das Modul auch global deaktivieren, dann erscheint es im Hilfemenü als gesperrt.
- Bildboards haben Ratenbegrenzungen und liefern bei sehr engen Tag-Kombinationen gelegentlich nichts; dann antwortet der Bot, dass kein Bild gefunden wurde.
- Timer gelten pro Kanal und liegen im Arbeitsspeicher. Nach einem Neustart musst du sie erneut starten.

---
title: Suchen
slug: searches
summary: Schlage Dinge nach, ohne Discord zu verlassen, von Wetter, Uhrzeit und Wörterbuchdefinitionen bis zu Anime, Filmen, Bildern, osu!-Profilen, Witzen und Reaktions-GIFs.
icon: fa-magnifying-glass
category: Entertainment
module: Searches
tags: [search, weather, time, define, urban dictionary, wikipedia, google, image search, anime, manga, movie, osu, pokemon, translate, xkcd, meme, reddit, hug, pat, ship, Suche, Suchen, Wetter, Uhrzeit, Definition, Wörterbuch, Bildersuche, Film, Übersetzen, Witze, Umarmung]
related: [streams, feeds, twitch, games, utility]
---

## Was es macht

Das Suchen-Modul ist eine Sammlung von Nachschlage-Befehlen, die etwas von einem externen Dienst holen und im Kanal posten. Mitglieder fragen nach dem Wetter in einer Stadt, der Uhrzeit irgendwo, der Definition eines Wortes, einem Anime oder Film, einer Wikipedia-Zusammenfassung, einer zufälligen Katze oder einem Reaktions-GIF für eine Umarmung oder eine Ohrfeige. Die meisten Ergebnisse kommen als Embed zurück, und Suchen mit vielen Ergebnissen sind in Seiten aufgeteilt.

Es gibt keine Dashboard-Seite. Fast jeder Befehl steht allen offen, und nur der Auto-Modus der Übersetzung braucht Team-Berechtigungen.

Stream-Benachrichtigungen und RSS-Feeds liegen im selben Bot-Modul, haben aber eigene Artikel. Siehe die Seiten zu Stream-Benachrichtigungen und Feeds für `streamadd`, `feedadd` und Verwandtes.

## Wofür du es brauchst

- Kläre „wie spät ist es bei dir?“ mit `time` statt mit Kopfrechnen.
- Prüfe vor einem Event die Vorhersage mit einer interaktiven `weather`-Karte.
- Schlage einen Anime, Manga oder Charakter nach, während ihr darüber chattet.
- Lass Mitglieder Umarmungen, Streicheleinheiten und High-Fives als GIFs senden.
- Übersetze eine Nachricht auf der Stelle oder übersetze einen Kanal für eine internationale Community automatisch.

## Wetter und Uhrzeit

`weather <place>` ermittelt die Koordinaten des Ortes mit Open-Meteo und zeigt die aktuellen Bedingungen: Temperatur, gefühlte Temperatur, Luftfeuchtigkeit, Windgeschwindigkeit und Böen, Luftdruck, Bewölkung, Sichtweite sowie Tageshöchst- und -tiefstwert. Buttons und ein Dropdown wechseln zur stündlichen Vorhersage, zu detaillierten stündlichen Bedingungen und zu einer Tagesansicht mit Höchst-, Tiefstwert und Niederschlag von heute und morgen.

`time <place>` sucht den Ort und zeigt die aktuelle Uhrzeit und Zeitzone. Passen mehrere Orte, bietet es die Kandidaten zur Auswahl an.

## Wörter und Wissen

| Befehl | Quelle | Ergebnis |
| --- | --- | --- |
| `define <word>` | Pearson-Wörterbuch | Definition, Wortart und ein Beispielsatz |
| `urbandict <term>` | Urban Dictionary | Definitionen, seitenweise |
| `wiki <query>` | Wikipedia | Zusammenfassung der ersten passenden Seite |
| `wikia <site> <query>` | Ein Fandom-Wiki | Zusammenfassung aus diesem Wiki |
| `google <query>` | Google, mit DuckDuckGo als Ausweichlösung | Web-Ergebnisse |
| `bible <book> <chapter:verse>` | Bible API | Der Verstext |
| `resolvetonetags <text>` | eingebaut | Erklärt Tone Tags wie `/j` oder `/s`, die im Text vorkommen |
| `translate <langs> <text>` | Übersetzungs-API | Übersetzter Text; langs ist `from>to`, zum Beispiel `translate en>fr hello` |
| `translangs` | Übersetzungs-API | Sprachen, die du nutzen kannst |

### Automatische Übersetzung

`autotranslate` schaltet die automatische Übersetzung für den aktuellen Kanal um und braucht Administrator. Übergib `del`, um die Originalnachricht nach dem Übersetzen zu löschen, oder `nodel` (der Standard), um sie zu behalten. Jedes Mitglied führt dann `autotranslang en>fr` aus, um sein eigenes Sprachpaar für diesen Kanal festzulegen, oder `autotranslang` ohne etwas, um es zu entfernen.

## Medien und Fandom

| Befehl | Was du bekommst |
| --- | --- |
| `anime <query>` | Anime-Suchergebnisse mit Details |
| `manga <query>` | Manga-Suchergebnisse |
| `charinfo <name>` | Namen, Beschreibung und Bild eines Charakters |
| `findanime [image]` | Erkennt einen Anime anhand eines Screenshots über trace.moe; hänge ein Bild an oder gib eine URL an |
| `mal <username or @user>` | Ein MyAnimeList-Profil mit Statistiken zu „Schaue ich“, „Abgeschlossen“ und weiteren |
| `movie <title>` | IMDb-Details über OMDb |
| `youtube <query>` | YouTube-Suchergebnisse |
| `steam <game>` | Link zur Steam-Store-Seite des Spiels |
| `pokemon <name>` | Pokemon-Details |
| `osu <user> [mode]`, `osu5 <user> [mode]` | osu!-Profil oder die Top fünf Plays; Modi sind standard, taiko, catch und mania |
| `gatari <user> [mode]` | osu!Gatari-Profil |
| `xkcd [number or latest]` | Ein xkcd-Comic, standardmäßig zufällig |

## Bilder

`image <query>` durchsucht Google und DuckDuckGo mit strenger Sichere Suche und lässt die Ergebnisse dann durch eine Sicherheitsprüfung laufen, bevor sie in einem seitenweisen Embed gezeigt werden. Es kann pro Mitglied einmal alle zwanzig Sekunden genutzt werden. `safebooru <tag>` holt ein verschlagwortetes Bild von Safebooru. `revimg <url>` und `revav [@user]` liefern Links zur umgekehrten Bildersuche bei Google, TinEye und Yandex für ein Bild oder einen Avatar. `color <hex...>` stellt Farbfelder für eine oder mehrere Hex-Farben dar.

Zufällige Bilder: `randomcat`, `randomdog`, `randomfood`, `randombird`, `randomneko`, `randomkitsune` und `randomwaifu`. `meme` postet ein zufälliges Meme aus einer Auswahl von Subreddits, und `randomreddit <subreddit>` postet einen zufälligen Beitrag aus einem Subreddit, nachdem geprüft wurde, dass er nicht als NSFW markiert ist. `memelist` zeigt Memegen-Vorlagen und `memegen <template> [text]` baut eines. `rip @user` erstellt ein Grabstein-Bild mit Namen und Avatar. `shorten <url>` kürzt einen Link.

## Witze

`randjoke`, `yomama`, `chucknorris`, `wowjoke` und `magicitem` holen jeweils einen Witz oder eine Gegenstandsbeschreibung aus ihrer jeweiligen API. `catfact` postet einen Katzenfakt.

## Reaktionsbefehle

Diese posten ein Anime-GIF zur Aktion. Befehle, die auf jemanden gerichtet sind, nehmen eine Erwähnung: `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold` und `highfive`. Befehle über dich selbst nehmen optionalen Text: `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave` und `wink`. Alle gibt es auch als Slash-Befehle.

`ship @user [@user2]` bewertet die Kompatibilität zweier Mitglieder (oder von dir und einem Mitglied) und postet ein Ship-Bild mit einem Kommentar.

## Einstellungen

Dieses Modul hat keine Dashboard-Seite und keine Servereinstellungen außer dem Schalter für die automatische Übersetzung. Mehrere Befehle stützen sich auf API-Schlüssel, die der Bot-Owner konfiguriert; fehlt ein Schlüssel, antwortet der Befehl mit einem Fehler statt mit Ergebnissen.

## Einrichtung Schritt für Schritt

1. Es muss nichts aktiviert werden. Führe `weather London` oder `define serendipity` aus, um zu bestätigen, dass der Bot im Kanal antworten kann.
2. Wenn du einen übersetzten Kanal willst, führe dort als Administrator `autotranslate` aus und lass Mitglieder dann `autotranslang en>es` oder Ähnliches festlegen.
3. Nutze das Berechtigungsmodul, wenn du die Reaktions- oder Bildbefehle auf bestimmte Kanäle beschränken willst.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `weather <place>` | `we` | Niemand | Interaktive Wetterkarte |
| `time <place>` | | Niemand | Aktuelle Uhrzeit und Zeitzone |
| `define <word>` | `def` | Niemand | Wörterbuchdefinition |
| `urbandict <term>` | `ud` | Niemand | Urban Dictionary |
| `wiki <query>` | `wikipedia` | Niemand | Wikipedia-Zusammenfassung |
| `wikia <site> <query>` | `fandom` | Niemand | Fandom-Wiki-Suche |
| `google <query>` | `g` | Niemand | Websuche |
| `bible <book> <chapter:verse>` | | Niemand | Bibelvers |
| `resolvetonetags <text>` | `tonetag`, `resolvetonetag`, `tonetags` | Niemand | Tone Tags erklären |
| `translate <langs> <text>` | `trans` | Niemand | Text übersetzen, zum Beispiel `translate en>fr hello` |
| `translangs` | | Niemand | Unterstützte Sprachen |
| `autotranslate [del\|nodel]` | `at`, `autotrans` | Administrator | Automatische Übersetzung im Kanal umschalten |
| `autotranslang [from>to]` | `atl` | Niemand | Dein Sprachpaar für die automatische Übersetzung |
| `anime <query>` | `ani`, `aq` | Niemand | Anime-Suche |
| `manga <query>` | `mang`, `mq` | Niemand | Manga-Suche |
| `charinfo <name>` | `characterinfo` | Niemand | Charakter-Suche |
| `findanime [image]` | `whatanime` | Niemand | Anime anhand eines Screenshots erkennen |
| `mal <username or @user>` | | Niemand | MyAnimeList-Profil |
| `movie <title>` | `omdb`, `imdb` | Niemand | Filmdetails |
| `youtube <query>` | `yt` | Niemand | YouTube-Suche |
| `steam <game>` | | Niemand | Steam-Store-Link |
| `pokemon <name>` | | Niemand | Pokemon-Details |
| `osu <user> [mode]` | | Niemand | osu!-Profil |
| `osu5 <user> [mode]` | | Niemand | Top fünf osu!-Plays |
| `gatari <user> [mode]` | | Niemand | osu!Gatari-Profil |
| `xkcd [number\|latest]` | | Niemand | xkcd-Comic |
| `image <query>` | `img`, `rimg` | Niemand | Sichere Bildersuche |
| `safebooru [tag]` | | Niemand | Safebooru-Bild |
| `revimg <url>` | | Niemand | Links zur umgekehrten Bildersuche |
| `revav [@user]` | | Niemand | Umgekehrte Suche nach einem Avatar |
| `color <hex...>` | `clr` | Niemand | Farbfelder |
| `randomcat` | `meow` | Niemand | Katzenbild |
| `randomdog` | `woof` | Niemand | Hundebild |
| `randomfood` | `yum` | Niemand | Essensbild |
| `randombird` | `birb`, `bird` | Niemand | Vogelbild |
| `randomneko` | `neko` | Niemand | Neko-Bild |
| `randomkitsune` | `kitsune` | Niemand | Kitsune-Bild |
| `randomwaifu` | `waifu` | Niemand | Waifu-Bild |
| `meme` | `randommeme` | Niemand | Zufälliges Reddit-Meme |
| `randomreddit <subreddit>` | `subreddit` | Niemand | Zufälliger Beitrag aus einem Subreddit |
| `memelist` | | Niemand | Memegen-Vorlagen |
| `memegen <template> [text]` | | Niemand | Ein Meme bauen |
| `rip <@user>` | | Niemand | Grabstein-Bild |
| `shorten <url>` | | Niemand | Einen Link kürzen |
| `randjoke` | | Niemand | Zufälliger Witz |
| `yomama` | `ym` | Niemand | Yo-mama-Witz |
| `chucknorris` | `cn` | Niemand | Chuck-Norris-Witz |
| `wowjoke` | | Niemand | World-of-Warcraft-Witz |
| `magicitem` | `mi` | Niemand | WoW-Zaubergegenstand |
| `catfact` | | Niemand | Katzenfakt |
| `ship <@user> [@user2]` | | Niemand | Bild mit Kompatibilitätswert |
| `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold`, `highfive <@user>` | | Niemand | Reaktions-GIF, auf jemanden gerichtet |
| `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave`, `wink [text]` | | Niemand | Reaktions-GIF über dich selbst |

## Tipps und Stolperfallen

- Diese Befehle rufen externe Dienste auf, die Ergebnisse hängen also davon ab, dass diese Dienste erreichbar sind und der Bot-Owner die richtigen API-Schlüssel hat.
- `image` ist auf eine Suche alle zwanzig Sekunden pro Mitglied begrenzt, und die Ergebnisse werden auch in NSFW-Kanälen auf Sicherheit gefiltert.
- `randomreddit` lehnt Subreddits ab, die als NSFW markiert sind. Nutze das NSFW-Modul für Inhalte für Erwachsene.
- Die automatische Übersetzung gilt pro Kanal und pro Mitglied: Der Kanal muss von einem Administrator aktiviert werden, und jedes Mitglied wählt sein eigenes Paar.
- Stream-Benachrichtigungen (`streamadd`, `streamlist`, `streamtemplate`) und RSS-Feeds (`feedadd`, `feedlist`) sind separat dokumentiert, obwohl sie sich dieses Modul teilen.

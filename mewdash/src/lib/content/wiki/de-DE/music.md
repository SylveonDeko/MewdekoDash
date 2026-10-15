---
title: Musik
slug: music
summary: Spiele Musik von YouTube, Spotify, SoundCloud und per Suche in einem Sprachkanal ab, mit Warteschlange, gespeicherten Playlists, Audiofiltern, einer DJ-Rolle, Text-to-Speech und Last.fm-Scrobbling.
icon: fa-music
category: Entertainment
dashboard: /dashboard/music
module: Music
tags: [music, play, queue, playlist, spotify, youtube, soundcloud, volume, skip, loop, repeat, dj role, filters, bass boost, nightcore, tts, text to speech, lastfm, scrobble, music links, Musik, abspielen, Warteschlange, Lautstärke, überspringen, Wiederholen, DJ-Rolle, Filter, Sprachausgabe, Musiklinks]
related: [utility, administration]
---

## Was es macht

Ein Mitglied tritt einem Sprachkanal bei und führt `play` mit einem Link oder einer Suche aus. Der Bot tritt bei, reiht den Titel ein und beginnt zu spielen. Links von YouTube, YouTube Music, SoundCloud und Spotify werden direkt aufgelöst; Spotify-Titel, -Alben und -Playlists werden mit YouTube abgeglichen. Eine einfache Suche zeigt bis zu 25 Ergebnisse in einem Auswahlmenü, damit das Mitglied den gemeinten Titel wählt.

Alle im Kanal teilen sich eine Warteschlange. Mitglieder können sie ansehen, zu einem Eintrag springen, Titel verschieben oder entfernen, mischen, einen Titel oder die ganze Warteschlange wiederholen und die Warteschlange als benannte Playlist speichern, um sie später wieder zu laden. Das Überspringen ist für Mitglieder mit der DJ-Rolle sofort möglich, für alle anderen per Abstimmung.

Das Team wählt einen Musikkanal, in den die Hinweise „Läuft gerade“ und „Warteschlange leer“ gehen, legt die DJ-Rolle, die Standardlautstärke und den Wiederholungsmodus fest und kann Audiofilter wie Bass-Boost oder Nightcore einschalten. Das Dashboard zeigt den Live-Player mit Warteschlange, Wiederholungs-Buttons und Filterschaltern, und derselbe Live-Feed treibt die Mobile-App an.

Zwei Extras gehören zum selben Modul. Text-to-Speech liest Chatnachrichten in einem Sprachkanal laut vor, mit Stimmen pro Nutzer und einer Sperrliste. Last.fm lässt Mitglieder scrobbeln, was der Bot abspielt, und Befehle im Stil von `fm` über ihr Hörverhalten ausführen.

## Wofür du es brauchst

- Ein Hangout-Sprachkanal will Hintergrundmusik, zu der jeder etwas beitragen kann, ohne dass eine Person die ganze Nacht DJ spielt.
- Das Team will eine DJ-Rolle, damit nur vertrauenswürdige Mitglieder sofort überspringen können, während alle anderen abstimmen.
- Eine Community pflegt ein paar Haus-Playlists, die zu Beginn jedes Events geladen werden.
- In einem Sprachkanal gibt es Mitglieder, die nicht sprechen können und möchten, dass ihre Nachrichten vorgelesen werden.
- Musikfans wollen einen gemeinsamen Ort, um Last.fm-Statistiken und „Wer kennt diesen Künstler“-Bestenlisten zu vergleichen.

## Abspielen und die Warteschlange

Du musst für fast jeden Musikbefehl in einem Sprachkanal sein. Spielt der Bot bereits in einem anderen Kanal, werden Befehle aus einem anderen Kanal abgelehnt.

`play <link or search>` akzeptiert:

| Eingabe | Was passiert |
| --- | --- |
| YouTube- oder YouTube-Music-Link | Direkt geladen, auch Playlists |
| SoundCloud-Link | Direkt geladen |
| Spotify-Titel-Link | Mit einem YouTube-Titel abgeglichen |
| Spotify-Album- oder -Playlist-Link | Jeder Eintrag wird mit YouTube abgeglichen und eingereiht, sobald er aufgelöst ist, mit einer Fortschrittsnachricht |
| Alles andere | Auf YouTube gesucht, bis zu 25 Ergebnisse in einem Auswahlmenü |

`play <number>` springt zu dieser Position in der Warteschlange. `search <query>` listet zehn Ergebnisse auf, ohne etwas einzureihen. `queue` zeigt eine seitenweise Ansicht, fünf pro Seite, mit einem Auswahlmenü für Optionen pro Titel. `nowplaying` zeigt den aktuellen Titel mit Anfragendem und Anbieter.

`songremove <number>` entfernt einen Eintrag, `movesong <from> <to>` ordnet um, `shuffle` mischt alles nach dem aktuellen Titel, und `clearqueue` leert die Warteschlange und stoppt. `seek mm:ss` springt innerhalb des aktuellen Titels. `volume 0..100` setzt die Lautstärke und speichert sie als Server-Standard.

`loop <type>` legt die Wiederholung fest: `none` (auch `off`), `track` (auch `song`) oder `queue` (auch `all`). Endet die Warteschlange bei ausgeschalteter Wiederholung, postet der Bot im Musikkanal einen Hinweis „Warteschlange leer“.

### Überspringen und die DJ-Rolle

`skip` beendet den aktuellen Titel sofort für den, der es ausführt. `voteskip` zählt Stimmen: Ein Mitglied mit der DJ-Rolle oder Administrator überspringt sofort, alle anderen geben eine Stimme ab, und der Titel wird übersprungen, wenn die Stimmen 70 Prozent der Nicht-Bot-Mitglieder im Sprachkanal erreichen.

Lege die DJ-Rolle mit `setdjrole @role` oder der Auswahl **DJ-Rolle** im Dashboard fest. Führe `setdjrole` ohne Rolle aus, um sie zu entfernen.

### Autoplay

`autoplay <0..5>` lässt den Bot so viele verwandte Titel hinzufügen, wenn die Warteschlange leer läuft, anhand von Spotify-Empfehlungen. 0 schaltet es aus. Das hängt davon ab, dass beim Bot Spotify-Zugangsdaten konfiguriert sind; fehlen sie, tut Autoplay nichts.

## Playlists

`saveplaylist <name>` speichert die aktuelle Warteschlange unter einem Namen, pro Server, mit dir als Autor. `loadplaylist <name> [true]` hängt sie an die Warteschlange an oder ersetzt die Warteschlange, wenn du `true` übergibst, und beginnt zu spielen, falls gerade nichts läuft. Titel werden beim Laden erneut auf YouTube aufgelöst, sodass nicht mehr existierende Einträge stillschweigend übersprungen werden. `playlists` listet sie mit Titelzahlen und Autoren auf, und `deleteplaylist <name>` entfernt eine.

## Audiofilter

Filter gelten für den laufenden Player und werden beim Trennen zurückgesetzt.

| Befehl | Wirkung |
| --- | --- |
| `bass <0..1>` | Hebt tiefe Frequenzen an; 0 schaltet aus |
| `nightcore [on/off]` | Schneller und höher |
| `vaporwave [on/off]` | Langsamer und tiefer |
| `karaoke [on/off]` | Unterdrückt zentrierten Gesang |
| `tremolo [on/off]` | Lautstärke-Wackeln |
| `vibrato [on/off]` | Tonhöhen-Wackeln |
| `eightd [on/off]` | Dreht den Klang um den Hörer |
| `distortion [on/off]` | Verzerrung |
| `stereowiden [on/off]` | Verbreitert das Stereobild |

`activefilters` listet auf, was an ist, und `resetfilters` setzt alle zurück. Die Karte **Läuft gerade** im Dashboard hat Schaltflächen für Bass-Boost, Nightcore, Vaporwave, Karaoke, Tremolo, Vibrato, 8D-Rotation und Verzerrung.

## Musiklink-Umwandlung

In Kanälen, in denen sie aktiviert ist, erhält das Posten eines Apple-Music-, Spotify-, YouTube-Music-, YouTube-, Amazon-Music-, Deezer-, Tidal-, Pandora- oder SoundCloud-Links ein Antwort-Embed mit Titel, Künstler und Cover des Titels plus Links zum selben Titel bei den anderen Anbietern. Schalte einen Kanal mit `musiclinkchannel [#channel]` (Server verwalten) um und liste sie mit `musiclinkchannels` auf. Im Dashboard ist das der Bereich **Musiklink-Umwandlung** im Tab „Musik-Einstellungen“.

## Text-to-Speech

TTS liest Nachrichten in einem Sprachkanal laut vor, in dem der Bot sitzt. Das Team aktiviert es pro Sprachkanal; Nachrichten von Mitgliedern in diesem Sprachkanal, getippt im Textchat des Sprachkanals oder in einem verknüpften Textkanal, werden eingereiht und gesprochen. Die Musik wird auf 15 Prozent abgesenkt, während eine Zeile gelesen wird, und kommt danach zurück. Die Warteschlange fasst standardmäßig 10 Nachrichten.

Mitglieder wählen ihre eigene Stimme mit `ttsvoice <name>` und stöbern mit `ttsvoices [search]`. Das Team legt eine Standardstimme, Geschwindigkeit (0,5 bis 3,0 im Dashboard, 0,5 bis 2,0 per Befehl), Lautstärke, eine erforderliche Rolle, Beitritts- und Verlassen-Ansagen mit eigenen Formaten fest und kann einzelne Nutzer blockieren. Der Tab **TTS-Einstellungen** im Dashboard hat dieselben Steuerelemente, aufgeteilt in **Allgemeine TTS-Einstellungen**, **TTS-Verhalten**, **Sprachkanal-TTS** und **Für TTS blockierte Nutzer**.

## Last.fm

Mitglieder verknüpfen ein Last.fm-Konto über die Seite `/me` des Dashboards (`lastfmlink` postet den Button). Nach der Verknüpfung werden Titel, die der Bot mindestens 30 Sekunden lang abspielt, auf ihr Konto gescrobbelt; `lastfmtoggle` pausiert das, und `lastfmstatus` zeigt den Zustand. Die `fm`-Befehlsfamilie funktioniert dann für jeden mit einem verknüpften Konto: zuletzt gehörte Titel, Top-Künstler, -Alben und -Titel nach Zeitraum, Künstler- und Album-Abfragen, „Wer kennt“-Bestenlisten über den Server, Kronen, Geschmacksvergleich und Collage-Diagramme.

## Einstellungen

Die Dashboard-Seite hat zwei Tabs, **Musik-Einstellungen** und **TTS-Einstellungen**. Der Musik-Tab zeigt außerdem eine Karte **Läuft gerade** mit der Länge der Warteschlange, Buttons zum Mischen und Leeren, Buttons für den Wiederholungsmodus und Filterschaltern, wenn der Bot spielt.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Standardlautstärke | 100 | Startlautstärke, 0 bis 100; `volume` speichert ebenfalls hier |
| Musikkanal | Alle Kanäle | Wo die Hinweise „Läuft gerade“ und zur Warteschlange gepostet werden |
| DJ-Rolle | Keine DJ-Rolle | Rolle, die sofort überspringt und die Abstimmung zum Überspringen umgeht |
| Wiederholungsmodus | None | None, Einzelner Titel oder Warteschlange |
| Automatisch trennen | Nie | Nie, Wenn Sprachkanal leer, Wenn Warteschlange leer oder Eine der Bedingungen |
| Ähnliche automatisch abspielen | Deaktiviert | Fügt verwandte Titel hinzu, wenn die Warteschlange leer wird; der Befehl erlaubt eine Anzahl bis 5 |
| Abstimmung zum Überspringen aktivieren | aus | Zeigt den Schwellenwert für die Abstimmung in der Player-Fußzeile |
| Schwellenwert fürs Überspringen | Prozent, 1 bis 100 | Angezeigter Wert; der Befehl `voteskip` selbst braucht immer 70 Prozent |
| Musiklink-Kanäle | keine | Kanäle, in denen Musiklinks ein anbieterübergreifendes Embed erhalten |
| TTS-Lautstärke | 100 | Lautstärke der gesprochenen Zeilen |
| TTS-Geschwindigkeit | 1.0 | 0,5 bis 3,0 |
| Max. Warteschlangengröße | 10 | Ausstehende TTS-Nachrichten, 1 bis 50 |
| Standardstimme | Standard des Anbieters | Stimme, die verwendet wird, wenn ein Mitglied keine gewählt hat |
| Erforderliche Rolle | Keine Rolle erforderlich | Nur Mitglieder mit dieser Rolle können TTS nutzen; Admins immer |
| Antwort-Kontext | aus | Liest vor Antworten „antwortet auf Nutzer“ vor |
| Anhänge ansagen | aus | Sagt gesendete Bilder, Videos und Dateien an |
| Aufeinanderfolgende gruppieren | aus | Überspringt den Namen, wenn dasselbe Mitglied mehrere Nachrichten hintereinander sendet |
| Sprachkanal-TTS | keine | Pro Sprachkanal: aktiviert, verknüpfter Textkanal, Beitritts- und Verlassen-Ansagen und Formate |
| Für TTS blockierte Nutzer | keine | Mitglieder, deren Nachrichten nie vorgelesen werden |

> [!NOTE]
> Der im Dashboard festgelegte Wiederholungsmodus gilt ab dem nächsten Player. `loop` ändert den laufenden Player sofort.

## Einrichtung Schritt für Schritt

1. Stelle sicher, dass der Bot in den Sprachkanälen, die er nutzen soll, Connect und Speak hat.
2. Öffne **Musik** im Dashboard. Lege einen **Musikkanal** fest, damit „Läuft gerade“-Embeds nicht im allgemeinen Chat landen.
3. Wähle eine **DJ-Rolle** für die Leute, die frei überspringen dürfen.
4. Setze die **Standardlautstärke** auf etwa 50; 100 ist laut.
5. Tritt einem Sprachkanal bei und führe `play never gonna give you up` aus, wähle ein Ergebnis, dann `queue` und `nowplaying`.
6. Baue eine Haus-Playlist auf, indem du Titel einreihst und `saveplaylist chill` ausführst.
7. Wenn du TTS willst, wechsle zu **TTS-Einstellungen**, füge den Sprachkanal unter **Sprachkanal-TTS** hinzu und lass Mitglieder mit `ttsvoice` eine Stimme wählen.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `join` | `j`, `mv` | Niemand | Deinem Sprachkanal beitreten |
| `leave` | `disconnect`, `d` | Niemand | Verlassen und die Warteschlange leeren |
| `play <link or search>` | `p`, `start` | Niemand | Einreihen und abspielen |
| `play <number>` | `p`, `start` | Niemand | Zu einer Position in der Warteschlange springen |
| `search <query>` | `find` | Niemand | Zehn Ergebnisse auflisten, ohne abzuspielen |
| `pause` | | Niemand | Pausieren oder fortsetzen |
| `nowplaying` | `np` | Niemand | Den aktuellen Titel anzeigen |
| `queue` | `q`, `yq`, `enqueue` | Niemand | Die Warteschlange anzeigen |
| `skip` | `next`, `n` | Niemand | Den aktuellen Titel überspringen |
| `voteskip` | `vskip` | Niemand | Für das Überspringen stimmen, sofort mit der DJ-Rolle |
| `songremove <number>` | `trackremove`, `srm` | Niemand | Einen Eintrag der Warteschlange entfernen |
| `movesong <from> <to>` | `ms`, `move` | Niemand | Die Warteschlange umordnen |
| `shuffle` | `playlistshuffle`, `sh`, `plsh` | Niemand | Die kommenden Titel mischen |
| `clearqueue` | `cq` | Niemand | Die Warteschlange leeren und stoppen |
| `volume <0..100>` | `vol` | Niemand | Die Lautstärke setzen und speichern |
| `seek <mm:ss>` | | Niemand | Innerhalb des aktuellen Titels springen |
| `loop <none|track|queue>` | `queuerepeat`, `qrp`, `rpl` | Niemand | Wiederholungsmodus festlegen |
| `autoplay <0..5>` | `ap` | Niemand | Verwandte Titel, wenn die Warteschlange leer wird |
| `setdjrole [role]` | `djrole` | Server verwalten | Die DJ-Rolle festlegen oder löschen |
| `setmusicchannel [#channel]` | `smch` | Niemand | Wohin Player-Hinweise gehen |
| `musicsettings` | `msettings` | Niemand | Autoplay, Lautstärke, Wiederholung und Kanal anzeigen |
| `musiclinkchannel [#channel]` | | Server verwalten | Die Linkumwandlung in einem Kanal umschalten |
| `musiclinkchannels` | | Niemand | Kanäle mit Linkumwandlung auflisten |
| `saveplaylist <name>` | `saveplist` | Niemand | Die Warteschlange speichern |
| `loadplaylist <name> [clear]` | `loadplist` | Niemand | Eine Playlist laden, `true` ersetzt die Warteschlange |
| `playlists` | `playlistshow`, `plshow` | Niemand | Gespeicherte Playlists auflisten |
| `deleteplaylist <name>` | `delplist` | Niemand | Eine Playlist löschen |
| `bass [0..1]` | | Niemand | Bass-Boost |
| `nightcore [on/off]` | `nc` | Niemand | Nightcore-Filter |
| `vaporwave [on/off]` | `vw` | Niemand | Vaporwave-Filter |
| `karaoke [on/off]` | | Niemand | Karaoke-Filter |
| `tremolo [on/off]` | | Niemand | Tremolo-Filter |
| `vibrato [on/off]` | | Niemand | Vibrato-Filter |
| `eightd [on/off]` | `8d` | Niemand | 8D-Rotationsfilter |
| `distortion [on/off]` | | Niemand | Verzerrungsfilter |
| `stereowiden [on/off]` | `swiden` | Niemand | Stereo-Verbreiterung |
| `resetfilters` | `resetfx` | Niemand | Alle Filter zurücksetzen |
| `activefilters` | `activefx` | Niemand | Aktive Filter auflisten |
| `lastfmlink` | `lflink` | Niemand | Den Link-Button für Last.fm erhalten |
| `lastfmunlink` | `lfunlink` | Niemand | Deine Last.fm-Verknüpfung entfernen |
| `lastfmtoggle` | `lftoggle` | Niemand | Scrobbling pausieren oder fortsetzen |
| `lastfmstatus` | `lfstatus` | Niemand | Den Zustand deiner Last.fm-Verknüpfung anzeigen |
| `fm [user]` | | Niemand | Läuft gerade oder letzter Scrobble |
| `fmrecent [user]` | `fmr` | Niemand | Letzte Scrobbles |
| `fmtopartists [period] [user]` | `fmta` | Niemand | Top-Künstler |
| `fmtopalbums [period] [user]` | `fmtal` | Niemand | Top-Alben |
| `fmtoptracks [period] [user]` | `fmtt` | Niemand | Top-Titel |
| `fmartist [artist]` | `fma` | Niemand | Künstlerinfo und deine Wiedergaben |
| `fmalbum [query]` | `fmal` | Niemand | Albuminfo |
| `fmwhoknows [artist]` | `whoknows`, `wk` | Niemand | Server-Bestenliste für einen Künstler |
| `fmwhoknowsalbum <query>` | `whoknowsalbum`, `wka` | Niemand | Server-Bestenliste für ein Album |
| `fmwhoknowstrack <query>` | `whoknowstrack`, `wkt` | Niemand | Server-Bestenliste für einen Titel |
| `fmcrowns [artist]` | `crowns` | Niemand | Künstler-Kronen |
| `fmtaste <user>` | `taste` | Niemand | Geschmack mit jemandem vergleichen |
| `fmchart [size] [period] [user]` | `chart` | Niemand | Album-Cover-Collage |
| `ttsenable` | `tts`, `ttson` | Server verwalten | TTS in deinem Sprachkanal aktivieren |
| `ttsremove` | `ttsoff` | Server verwalten | TTS in deinem Sprachkanal deaktivieren |
| `ttslink [#channel]` | `ttschannel` | Server verwalten | Einen Textkanal mit dem Sprachkanal verknüpfen |
| `ttsannounce` | `ttsjoinleave` | Server verwalten | Beitritts- und Verlassen-Ansagen umschalten |
| `ttsjoinformat [text]` | `ttsjoin` | Server verwalten | Text der Beitritts-Ansage |
| `ttsleaveformat [text]` | `ttsleave` | Server verwalten | Text der Verlassen-Ansage |
| `ttsvolume <0..100>` | `ttsvol` | Server verwalten | TTS-Lautstärke |
| `ttsspeed <0.5..2>` | | Server verwalten | TTS-Geschwindigkeit |
| `ttsdefaultvoice [voice]` | `ttsdefvoice` | Server verwalten | Standardstimme des Servers |
| `ttsvoice [voice]` | | Niemand | Deine eigene Stimme |
| `ttsvoices [search]` | `ttsvoicelist`, `ttsvoicesearch` | Niemand | Stimmen durchstöbern |
| `ttsblock <user>` | `ttsban` | Server verwalten | Die TTS-Sperre eines Mitglieds umschalten |
| `ttsblocklist` | `ttsbanlist`, `ttsblocked` | Server verwalten | Blockierte Mitglieder auflisten |
| `ttsrole [role]` | | Server verwalten | Eine Rolle für TTS verlangen |
| `ttsreplycontext` | `ttsreply` | Server verwalten | Antwort-Kontext umschalten |
| `ttsattachmentnarration` | `ttsattach` | Server verwalten | Ansage von Anhängen umschalten |
| `ttsconsecutivegrouping` | `ttsgroup` | Server verwalten | Überspringen des Namens bei aufeinanderfolgenden Nachrichten umschalten |
| `ttsmaxqueue <1..50>` | `ttsqueue` | Server verwalten | Limit für ausstehende TTS-Nachrichten |
| `ttssettings` | `ttsinfo` | Server verwalten | TTS-Einstellungen anzeigen |

## Tipps und Stolperfallen

- Der Bot braucht Connect und Speak im Sprachkanal und Send Messages im Musikkanal für Hinweise.
- Die meisten Befehle prüfen zuerst, ob du in einem Sprachkanal bist und ob es der ist, in dem der Bot ist.
- Die Lautstärke aus `volume` wird als Server-Standard gespeichert, sodass eine 10 spät in der Nacht zur Startlautstärke von morgen wird.
- Spotify-Playlists werden Titel für Titel über die YouTube-Suche umgewandelt, daher dauern lange Playlists eine Weile, und ein paar Treffer können falsch sein.
- Gespeicherte Playlists speichern Links, kein Audio. Wird ein Video von YouTube entfernt, wird der Eintrag beim Laden übersprungen.
- Die Abstimmung zum Überspringen zählt nur Menschen im Kanal. In einem Kanal mit nur einer Person reicht deine eigene Stimme.
- TTS liest nur Nachrichten von Mitgliedern, die im Sprachkanal sind, sodass Leute, die nur vom Text aus zusehen, es nicht auslösen können.

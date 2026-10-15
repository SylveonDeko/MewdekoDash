---
title: Muzyka
slug: music
summary: Odtwarzaj muzykę z YouTube, Spotify, SoundCloud i wyszukiwarki na kanale głosowym, z kolejką, zapisanymi playlistami, filtrami audio, rolą DJ-a, zamianą tekstu na mowę i scrobblowaniem Last.fm.
icon: fa-music
category: Entertainment
dashboard: /dashboard/music
module: Music
tags: [music, play, queue, playlist, spotify, youtube, soundcloud, volume, skip, loop, repeat, dj role, filters, bass boost, nightcore, tts, text to speech, lastfm, scrobble, music links, muzyka, odtwarzanie, kolejka, playlista, głośność, pomijanie, powtarzanie, rola DJ-a, filtry, zamiana tekstu na mowę, linki muzyczne]
related: [utility, administration]
---

## Co robi

Członek dołącza do kanału głosowego i uruchamia `play` z linkiem lub wyszukiwaniem. Bot dołącza, dodaje utwór do kolejki i zaczyna odtwarzać. Linki z YouTube, YouTube Music, SoundCloud i Spotify są rozpoznawane bezpośrednio; utwory, albumy i playlisty Spotify są dopasowywane do YouTube. Zwykłe wyszukiwanie pokazuje do 25 wyników w menu wyboru, by członek wybrał ten, o który mu chodziło.

Wszyscy na kanale dzielą jedną kolejkę. Członkowie mogą ją przeglądać, przeskakiwać do pozycji, przesuwać lub usuwać utwory, tasować, zapętlać utwór albo całą kolejkę i zapisywać kolejkę jako nazwaną playlistę do ponownego wczytania. Pomijanie jest natychmiastowe dla członków z rolą DJ-a albo odbywa się głosowaniem dla pozostałych.

Staff wybiera kanał muzyczny, na który trafiają powiadomienia o odtwarzanym utworze i pustej kolejce, ustawia rolę DJ-a, domyślną głośność i tryb powtarzania oraz może włączać filtry audio, takie jak bass boost czy nightcore. Panel pokazuje odtwarzacz na żywo z kolejką, przyciskami powtarzania i przełącznikami filtrów, a ten sam strumień na żywo zasila aplikację mobilną.

W tym samym module są dwa dodatki. Zamiana tekstu na mowę (TTS) czyta wiadomości z czatu na głos na kanale głosowym, z głosami dla poszczególnych użytkowników i listą blokad. Last.fm pozwala członkom scrobblować to, co gra bot, i używać komend w stylu `fm` dotyczących ich słuchania.

## Do czego się przydaje

- Kanał głosowy do spędzania czasu potrzebuje muzyki w tle, do której każdy może dodawać utwory, bez jednej osoby grającej DJ-a całą noc.
- Staff chce roli DJ-a, aby tylko zaufani członkowie mogli pomijać natychmiast, a pozostali głosowali.
- Społeczność ma kilka stałych playlist, które są wczytywane na początku każdego wydarzenia.
- Na kanale głosowym są członkowie, którzy nie mogą mówić i chcą, by ich wiadomości były czytane na głos.
- Fani muzyki chcą wspólnego miejsca do porównywania statystyk Last.fm i rankingów „kto zna tego artystę”.

## Odtwarzanie i kolejka

Prawie każda komenda muzyczna wymaga, byś był na kanale głosowym. Jeśli bot już gra na innym kanale, komendy z innego kanału są odrzucane.

`play <link or search>` akceptuje:

| Dane wejściowe | Co się dzieje |
| --- | --- |
| Link YouTube lub YouTube Music | Wczytywany bezpośrednio, wraz z playlistami |
| Link SoundCloud | Wczytywany bezpośrednio |
| Link do utworu Spotify | Dopasowywany do utworu na YouTube |
| Link do albumu lub playlisty Spotify | Każda pozycja jest dopasowywana do YouTube i dodawana do kolejki w miarę rozpoznawania, z wiadomością o postępie |
| Cokolwiek innego | Wyszukiwane na YouTube, do 25 wyników w menu wyboru |

`play <number>` przeskakuje do tej pozycji w kolejce. `search <query>` wypisuje dziesięć wyników bez dodawania czegokolwiek do kolejki. `queue` pokazuje widok stronicowany, po pięć na stronę, z menu wyboru opcji dla poszczególnych utworów. `nowplaying` pokazuje bieżący utwór wraz z osobą, która go zamówiła, i dostawcą.

`songremove <number>` usuwa pozycję, `movesong <from> <to>` zmienia kolejność, `shuffle` tasuje wszystko po bieżącym utworze, a `clearqueue` opróżnia kolejkę i zatrzymuje odtwarzanie. `seek mm:ss` przeskakuje w obrębie bieżącego utworu. `volume 0..100` ustawia głośność i zapisuje ją jako domyślną dla serwera.

`loop <type>` ustawia powtarzanie: `none` (także `off`), `track` (także `song`) lub `queue` (także `all`). Gdy kolejka się kończy przy wyłączonym powtarzaniu, bot publikuje na kanale muzycznym powiadomienie o pustej kolejce.

### Pomijanie i rola DJ-a

`skip` natychmiast kończy bieżący utwór dla każdego, kto go uruchomi. `voteskip` zlicza głosy: członek z rolą DJ-a lub Administratorem pomija od razu, pozostali dodają głos, a utwór jest pomijany, gdy głosy osiągną 70 procent członków niebędących botami na kanale głosowym.

Rolę DJ-a ustawisz komendą `setdjrole @role` albo selektorem **Rola DJ-a** w panelu. Uruchom `setdjrole` bez roli, aby ją usunąć.

### Autoplay

`autoplay <0..5>` sprawia, że bot dodaje tyle powiązanych utworów, gdy kolejka się wyczerpie, korzystając z rekomendacji Spotify. 0 to wyłącza. Zależy to od tego, czy bot ma skonfigurowane dane uwierzytelniające Spotify; jeśli ich brakuje, autoplay nic nie robi.

## Playlisty

`saveplaylist <name>` zapisuje bieżącą kolejkę pod nazwą, osobno dla każdego serwera, z Tobą jako autorem. `loadplaylist <name> [true]` dołącza ją do kolejki albo zastępuje kolejkę, jeśli podasz `true`, i zaczyna odtwarzać, jeśli nic nie gra. Utwory są ponownie rozpoznawane na YouTube przy wczytywaniu, więc pozycje, które już nie istnieją, są po cichu pomijane. `playlists` wypisuje je z liczbą utworów i autorami, a `deleteplaylist <name>` usuwa jedną.

## Filtry audio

Filtry działają na uruchomiony odtwarzacz i są resetowane po jego rozłączeniu.

| Komenda | Efekt |
| --- | --- |
| `bass <0..1>` | Podbija niskie częstotliwości; 0 wyłącza |
| `nightcore [on/off]` | Szybciej i wyższym tonem |
| `vaporwave [on/off]` | Wolniej i niższym tonem |
| `karaoke [on/off]` | Tłumi wokal ze środka |
| `tremolo [on/off]` | Falowanie głośności |
| `vibrato [on/off]` | Falowanie wysokości dźwięku |
| `eightd [on/off]` | Obraca dźwięk wokół słuchacza |
| `distortion [on/off]` | Zniekształcenie |
| `stereowiden [on/off]` | Poszerza obraz stereo |

`activefilters` wypisuje, co jest włączone, a `resetfilters` czyści wszystkie. Karta **Teraz odtwarzane** w panelu ma przyciski przełączające dla bass boost, nightcore, vaporwave, karaoke, tremolo, vibrato, obrotu 8D i distortion.

## Konwersja linków muzycznych

Na kanałach, na których jest włączona, opublikowanie linku z Apple Music, Spotify, YouTube Music, YouTube, Amazon Music, Deezer, Tidal, Pandora lub SoundCloud wywołuje odpowiedź z embedem z tytułem, wykonawcą i okładką utworu oraz linkami do tego samego utworu u innych dostawców. Kanał przełączasz komendą `musiclinkchannel [#channel]` (Zarządzanie serwerem), a wypisujesz je komendą `musiclinkchannels`. W panelu to sekcja **Konwersja linków muzycznych** na karcie Ustawienia muzyki.

## Zamiana tekstu na mowę

TTS czyta wiadomości na głos na kanale głosowym, na którym jest bot. Staff włącza go dla każdego kanału głosowego osobno; wiadomości od członków przebywających na tym kanale głosowym, napisane na czacie tekstowym kanału głosowego lub na powiązanym kanale tekstowym, trafiają do kolejki i są odczytywane. Muzyka ścisza się do 15 procent, gdy czytana jest linijka, i wraca po niej. Kolejka domyślnie mieści 10 wiadomości.

Członkowie wybierają własny głos komendą `ttsvoice <name>` i przeglądają je przez `ttsvoices [search]`. Staff ustawia domyślny głos, szybkość (od 0,5 do 3,0 w panelu, od 0,5 do 2,0 komendą), głośność, wymaganą rolę, ogłoszenia o dołączeniu i wyjściu z własnymi formatami oraz może blokować poszczególnych użytkowników. Karta **Ustawienia TTS** w panelu ma te same kontrolki, podzielone na **Ogólne ustawienia TTS**, **Zachowanie TTS**, **TTS kanału głosowego** i **Zablokowani użytkownicy TTS**.

## Last.fm

Członkowie łączą konto Last.fm ze strony `/me` w panelu (`lastfmlink` publikuje przycisk). Po połączeniu utwory odtwarzane przez bota przez co najmniej 30 sekund są scrobblowane na ich konto; `lastfmtoggle` to wstrzymuje, a `lastfmstatus` pokazuje stan. Rodzina komend `fm` działa wtedy dla każdego z połączonym kontem: ostatnie utwory, najpopularniejsi artyści, albumy i utwory według okresu, wyszukiwanie artystów i albumów, rankingi „kto zna” na całym serwerze, korony, porównanie gustów i kolaże z okładek.

## Ustawienia

Strona w panelu ma dwie karty, **Ustawienia muzyki** i **Ustawienia TTS**. Karta Muzyka pokazuje też kartę **Teraz odtwarzane** z długością kolejki, przyciskami tasowania i czyszczenia, przyciskami trybu powtarzania i przełącznikami filtrów, gdy bot gra.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Domyślna głośność | 100 | Głośność początkowa, od 0 do 100; `volume` też tu zapisuje |
| Kanał muzyczny | Wszystkie kanały | Gdzie publikowane są powiadomienia o odtwarzanym utworze i kolejce |
| Rola DJ-a | Brak roli DJ-a | Rola, która pomija natychmiast i omija pomijanie głosowaniem |
| Tryb powtarzania | Brak | Brak, Pojedynczy utwór lub Kolejka |
| Automatyczne rozłączanie | Nigdy | Nigdy, Gdy kanał głosowy jest pusty, Gdy kolejka jest pusta lub Dowolny warunek |
| Automatyczne odtwarzanie podobnych | Wyłączone | Dodaje powiązane utwory, gdy kolejka się opróżni; komenda dopuszcza liczbę do 5 |
| Włącz pomijanie głosowaniem | wyłączone | Pokazuje próg pomijania głosowaniem w stopce odtwarzacza |
| Próg pomijania głosowaniem | procent, od 1 do 100 | Wyświetlana wartość; sama komenda `voteskip` zawsze wymaga 70 procent |
| Kanały linków muzycznych | brak | Kanały, na których linki muzyczne dostają embed z różnymi dostawcami |
| Głośność TTS | 100 | Głośność czytanych linijek |
| Szybkość TTS | 1.0 | Od 0,5 do 3,0 |
| Maks. rozmiar kolejki | 10 | Oczekujące wiadomości TTS, od 1 do 50 |
| Domyślny głos | domyślny dostawcy | Głos używany, gdy członek nie wybrał własnego |
| Wymagana rola | Rola niewymagana | Tylko członkowie z tą rolą mogą używać TTS; admini zawsze mogą |
| Kontekst odpowiedzi | wyłączone | Czyta „odpowiedź do użytkownika” przed odpowiedziami |
| Narracja załączników | wyłączone | Ogłasza wysłane obrazy, filmy i pliki |
| Grupowanie kolejnych wiadomości | wyłączone | Pomija nazwę, gdy ten sam członek wysyła kilka wiadomości pod rząd |
| TTS kanału głosowego | brak | Dla każdego kanału głosowego: włączenie, powiązany kanał tekstowy, ogłoszenia o dołączeniu i wyjściu oraz formaty |
| Zablokowani użytkownicy TTS | brak | Członkowie, których wiadomości nigdy nie są czytane |

> [!NOTE]
> Tryb powtarzania ustawiony w panelu obowiązuje od następnego odtwarzacza. `loop` zmienia uruchomiony odtwarzacz od razu.

## Konfiguracja krok po kroku

1. Upewnij się, że bot ma Łączenie i Mówienie na kanałach głosowych, z których ma korzystać.
2. Otwórz **Muzykę** w panelu. Ustaw **Kanał muzyczny**, aby embedy z odtwarzanym utworem nie lądowały na czacie ogólnym.
3. Wybierz **Rolę DJ-a** dla osób, które mogą swobodnie pomijać.
4. Ustaw **Domyślną głośność** na około 50; 100 to głośno.
5. Dołącz do kanału głosowego i uruchom `play never gonna give you up`, wybierz wynik, a potem `queue` i `nowplaying`.
6. Zbuduj stałą playlistę, dodając utwory do kolejki i uruchamiając `saveplaylist chill`.
7. Jeśli chcesz TTS, przełącz się na **Ustawienia TTS**, dodaj kanał głosowy w **TTS kanału głosowego** i poproś członków o wybranie głosu komendą `ttsvoice`.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `join` | `j`, `mv` | Nikt | Dołącza do Twojego kanału głosowego |
| `leave` | `disconnect`, `d` | Nikt | Wychodzi i czyści kolejkę |
| `play <link or search>` | `p`, `start` | Nikt | Dodaje do kolejki i odtwarza |
| `play <number>` | `p`, `start` | Nikt | Przeskakuje do pozycji w kolejce |
| `search <query>` | `find` | Nikt | Wypisuje dziesięć wyników bez odtwarzania |
| `pause` | | Nikt | Wstrzymuje lub wznawia |
| `nowplaying` | `np` | Nikt | Pokazuje bieżący utwór |
| `queue` | `q`, `yq`, `enqueue` | Nikt | Pokazuje kolejkę |
| `skip` | `next`, `n` | Nikt | Pomija bieżący utwór |
| `voteskip` | `vskip` | Nikt | Głosuje za pominięciem, natychmiast z rolą DJ-a |
| `songremove <number>` | `trackremove`, `srm` | Nikt | Usuwa pozycję z kolejki |
| `movesong <from> <to>` | `ms`, `move` | Nikt | Zmienia kolejność w kolejce |
| `shuffle` | `playlistshuffle`, `sh`, `plsh` | Nikt | Tasuje nadchodzące utwory |
| `clearqueue` | `cq` | Nikt | Opróżnia kolejkę i zatrzymuje |
| `volume <0..100>` | `vol` | Nikt | Ustawia i zapisuje głośność |
| `seek <mm:ss>` | | Nikt | Przeskakuje w obrębie bieżącego utworu |
| `loop <none|track|queue>` | `queuerepeat`, `qrp`, `rpl` | Nikt | Ustawia tryb powtarzania |
| `autoplay <0..5>` | `ap` | Nikt | Powiązane utwory, gdy kolejka się opróżni |
| `setdjrole [role]` | `djrole` | Zarządzanie serwerem | Ustawia lub czyści rolę DJ-a |
| `setmusicchannel [#channel]` | `smch` | Nikt | Gdzie trafiają powiadomienia odtwarzacza |
| `musicsettings` | `msettings` | Nikt | Pokazuje autoplay, głośność, powtarzanie i kanał |
| `musiclinkchannel [#channel]` | | Zarządzanie serwerem | Przełącza konwersję linków na kanale |
| `musiclinkchannels` | | Nikt | Wypisuje kanały konwersji linków |
| `saveplaylist <name>` | `saveplist` | Nikt | Zapisuje kolejkę |
| `loadplaylist <name> [clear]` | `loadplist` | Nikt | Wczytuje playlistę, `true` zastępuje kolejkę |
| `playlists` | `playlistshow`, `plshow` | Nikt | Wypisuje zapisane playlisty |
| `deleteplaylist <name>` | `delplist` | Nikt | Usuwa playlistę |
| `bass [0..1]` | | Nikt | Bass boost |
| `nightcore [on/off]` | `nc` | Nikt | Filtr nightcore |
| `vaporwave [on/off]` | `vw` | Nikt | Filtr vaporwave |
| `karaoke [on/off]` | | Nikt | Filtr karaoke |
| `tremolo [on/off]` | | Nikt | Filtr tremolo |
| `vibrato [on/off]` | | Nikt | Filtr vibrato |
| `eightd [on/off]` | `8d` | Nikt | Filtr obrotu 8D |
| `distortion [on/off]` | | Nikt | Filtr distortion |
| `stereowiden [on/off]` | `swiden` | Nikt | Poszerzenie stereo |
| `resetfilters` | `resetfx` | Nikt | Czyści wszystkie filtry |
| `activefilters` | `activefx` | Nikt | Wypisuje aktywne filtry |
| `lastfmlink` | `lflink` | Nikt | Pobiera przycisk linku do Last.fm |
| `lastfmunlink` | `lfunlink` | Nikt | Usuwa Twoje połączenie z Last.fm |
| `lastfmtoggle` | `lftoggle` | Nikt | Wstrzymuje lub wznawia scrobblowanie |
| `lastfmstatus` | `lfstatus` | Nikt | Pokazuje stan Twojego połączenia z Last.fm |
| `fm [user]` | | Nikt | Aktualnie odtwarzane lub ostatni scrobble |
| `fmrecent [user]` | `fmr` | Nikt | Ostatnie scrobble |
| `fmtopartists [period] [user]` | `fmta` | Nikt | Najpopularniejsi artyści |
| `fmtopalbums [period] [user]` | `fmtal` | Nikt | Najpopularniejsze albumy |
| `fmtoptracks [period] [user]` | `fmtt` | Nikt | Najpopularniejsze utwory |
| `fmartist [artist]` | `fma` | Nikt | Informacje o artyście i Twoje odtworzenia |
| `fmalbum [query]` | `fmal` | Nikt | Informacje o albumie |
| `fmwhoknows [artist]` | `whoknows`, `wk` | Nikt | Ranking serwera dla artysty |
| `fmwhoknowsalbum <query>` | `whoknowsalbum`, `wka` | Nikt | Ranking serwera dla albumu |
| `fmwhoknowstrack <query>` | `whoknowstrack`, `wkt` | Nikt | Ranking serwera dla utworu |
| `fmcrowns [artist]` | `crowns` | Nikt | Korony artystów |
| `fmtaste <user>` | `taste` | Nikt | Porównuje gust z kimś |
| `fmchart [size] [period] [user]` | `chart` | Nikt | Kolaż z okładek albumów |
| `ttsenable` | `tts`, `ttson` | Zarządzanie serwerem | Włącza TTS na Twoim kanale głosowym |
| `ttsremove` | `ttsoff` | Zarządzanie serwerem | Wyłącza TTS na Twoim kanale głosowym |
| `ttslink [#channel]` | `ttschannel` | Zarządzanie serwerem | Łączy kanał tekstowy z kanałem głosowym |
| `ttsannounce` | `ttsjoinleave` | Zarządzanie serwerem | Przełącza ogłoszenia o dołączeniu i wyjściu |
| `ttsjoinformat [text]` | `ttsjoin` | Zarządzanie serwerem | Tekst ogłoszenia o dołączeniu |
| `ttsleaveformat [text]` | `ttsleave` | Zarządzanie serwerem | Tekst ogłoszenia o wyjściu |
| `ttsvolume <0..100>` | `ttsvol` | Zarządzanie serwerem | Głośność TTS |
| `ttsspeed <0.5..2>` | | Zarządzanie serwerem | Szybkość TTS |
| `ttsdefaultvoice [voice]` | `ttsdefvoice` | Zarządzanie serwerem | Domyślny głos serwera |
| `ttsvoice [voice]` | | Nikt | Twój własny głos |
| `ttsvoices [search]` | `ttsvoicelist`, `ttsvoicesearch` | Nikt | Przegląda głosy |
| `ttsblock <user>` | `ttsban` | Zarządzanie serwerem | Przełącza blokadę TTS członka |
| `ttsblocklist` | `ttsbanlist`, `ttsblocked` | Zarządzanie serwerem | Wypisuje zablokowanych członków |
| `ttsrole [role]` | | Zarządzanie serwerem | Wymaga roli dla TTS |
| `ttsreplycontext` | `ttsreply` | Zarządzanie serwerem | Przełącza kontekst odpowiedzi |
| `ttsattachmentnarration` | `ttsattach` | Zarządzanie serwerem | Przełącza narrację załączników |
| `ttsconsecutivegrouping` | `ttsgroup` | Zarządzanie serwerem | Przełącza pomijanie nazwy przy kolejnych wiadomościach |
| `ttsmaxqueue <1..50>` | `ttsqueue` | Zarządzanie serwerem | Limit oczekujących wiadomości TTS |
| `ttssettings` | `ttsinfo` | Zarządzanie serwerem | Pokazuje ustawienia TTS |

## Wskazówki i pułapki

- Bot potrzebuje Łączenia i Mówienia na kanale głosowym oraz Wysyłania wiadomości na kanale muzycznym dla powiadomień.
- Większość komend najpierw sprawdza, czy jesteś na kanale głosowym i czy jest to ten, na którym jest bot.
- Głośność z `volume` jest zapisywana jako domyślna dla serwera, więc późnonocne 10 staje się jutrzejszą głośnością startową.
- Playlisty Spotify są konwertowane utwór po utworze przez wyszukiwanie YouTube, więc długie playlisty trwają chwilę, a kilka dopasowań może być błędnych.
- Zapisane playlisty przechowują linki, a nie dźwięk. Jeśli film zostanie usunięty z YouTube, pozycja jest pomijana przy wczytywaniu.
- Pomijanie głosowaniem liczy tylko ludzi na kanale. Na kanale z jedną osobą wystarczy Twój własny głos.
- TTS czyta tylko wiadomości od członków, którzy są na kanale głosowym, więc osoby oglądające z poziomu tekstu nie mogą go wywołać.

---
title: Wyszukiwarki
slug: searches
summary: Sprawdzaj rzeczy bez wychodzenia z Discorda: od pogody, czasu i definicji słownikowych po anime, filmy, obrazy, profile osu!, żarty i reakcyjne GIF-y.
icon: fa-magnifying-glass
category: Entertainment
module: Searches
tags: [search, weather, time, define, urban dictionary, wikipedia, google, image search, anime, manga, movie, osu, pokemon, translate, xkcd, meme, reddit, hug, pat, ship, wyszukiwarki, wyszukiwanie, pogoda, czas, definicja, tłumaczenie, obrazy, żarty, memy]
related: [streams, feeds, twitch, games, utility]
---

## Co robi

Moduł Wyszukiwarki to zestaw komend wyszukujących, które pobierają coś z zewnętrznej usługi i publikują to na kanale. Członkowie pytają o pogodę w mieście, czas gdzieś na świecie, definicję słowa, anime lub film, streszczenie z Wikipedii, losowego kota albo reakcyjny GIF z przytuleniem lub policzkiem. Większość wyników wraca jako embed, a wyszukiwania z wieloma wynikami są stronicowane.

Nie ma strony w panelu. Prawie każda komenda jest otwarta dla wszystkich, a uprawnień staffu wymaga tylko tryb automatycznego tłumaczenia.

Powiadomienia o streamach i kanały RSS znajdują się w tym samym module bota, ale mają własne artykuły. Zobacz strony powiadomień o streamach i feedów w sprawie `streamadd`, `feedadd` i pokrewnych.

## Do czego się przydaje

- Rozstrzygnij „która jest u Ciebie godzina?” komendą `time` zamiast liczenia.
- Sprawdź prognozę przed wydarzeniem za pomocą interaktywnej karty `weather`.
- Wyszukaj anime, mangę lub postać w trakcie rozmowy o niej.
- Pozwól członkom wysyłać przytulenia, poklepania i piątki jako GIF-y.
- Przetłumacz wiadomość na miejscu albo automatycznie tłumacz kanał dla międzynarodowej społeczności.

## Pogoda i czas

`weather <place>` geokoduje miejsce przez Open-Meteo i pokazuje bieżące warunki: temperaturę, temperaturę odczuwalną, wilgotność, prędkość wiatru i porywy, ciśnienie, zachmurzenie, widoczność oraz dzienne maksimum i minimum. Przyciski i lista rozwijana przełączają na prognozę godzinową, szczegółowe warunki godzinowe i widok dzienny z maksimum, minimum i opadami na dziś i jutro.

`time <place>` wyszukuje miejsce i pokazuje bieżący czas oraz strefę czasową. Gdy pasuje kilka miejsc, oferuje kandydatów do wyboru.

## Słowa i wiedza

| Komenda | Źródło | Wynik |
| --- | --- | --- |
| `define <word>` | Słownik Pearson | Definicja, część mowy i przykładowe zdanie |
| `urbandict <term>` | Urban Dictionary | Definicje, stronicowane |
| `wiki <query>` | Wikipedia | Streszczenie pierwszej pasującej strony |
| `wikia <site> <query>` | Wiki Fandom | Streszczenie z tej wiki |
| `google <query>` | Google, z awaryjnym DuckDuckGo | Wyniki z sieci |
| `bible <book> <chapter:verse>` | Bible API | Tekst wersetu |
| `resolvetonetags <text>` | wbudowane | Wyjaśnia tone tagi, takie jak `/j` lub `/s`, znalezione w tekście |
| `translate <langs> <text>` | API tłumaczeń | Przetłumaczony tekst; langs to `from>to`, na przykład `translate en>fr hello` |
| `translangs` | API tłumaczeń | Języki, których możesz użyć |

### Automatyczne tłumaczenie

`autotranslate` przełącza automatyczne tłumaczenie dla bieżącego kanału i wymaga uprawnienia Administrator. Podaj `del`, aby usuwać oryginalną wiadomość po jej przetłumaczeniu, albo `nodel` (domyślnie), aby ją zachować. Następnie każdy członek uruchamia `autotranslang en>fr`, aby ustawić własną parę języków dla tego kanału, albo `autotranslang` bez niczego, aby ją usunąć.

## Media i fandomy

| Komenda | Co otrzymujesz |
| --- | --- |
| `anime <query>` | Wyniki wyszukiwania anime ze szczegółami |
| `manga <query>` | Wyniki wyszukiwania mangi |
| `charinfo <name>` | Imiona postaci, opis i obraz |
| `findanime [image]` | Rozpoznaje anime ze zrzutu ekranu przez trace.moe; dołącz obraz lub podaj URL |
| `mal <username or @user>` | Profil MyAnimeList ze statystykami oglądanych, ukończonych i inne |
| `movie <title>` | Szczegóły z IMDb przez OMDb |
| `youtube <query>` | Wyniki wyszukiwania YouTube |
| `steam <game>` | Link do strony gry w sklepie Steam |
| `pokemon <name>` | Szczegóły Pokemona |
| `osu <user> [mode]`, `osu5 <user> [mode]` | Profil osu! albo pięć najlepszych rozgrywek; tryby to standard, taiko, catch i mania |
| `gatari <user> [mode]` | Profil osu!Gatari |
| `xkcd [number or latest]` | Komiks xkcd, domyślnie losowy |

## Obrazy

`image <query>` przeszukuje Google i DuckDuckGo z rygorystycznym bezpiecznym wyszukiwaniem, a następnie przepuszcza wyniki przez kontrolę bezpieczeństwa, zanim pokaże je w stronicowanym embedzie. Może być używane raz na dwadzieścia sekund na członka. `safebooru <tag>` pobiera obraz z tagiem z Safebooru. `revimg <url>` i `revav [@user]` dają linki do wyszukiwania odwrotnego w Google, TinEye i Yandex dla obrazu lub awatara. `color <hex...>` renderuje próbki jednego lub kilku kolorów hex.

Losowe obrazki: `randomcat`, `randomdog`, `randomfood`, `randombird`, `randomneko`, `randomkitsune` i `randomwaifu`. `meme` publikuje losowego mema z zestawu subredditów, a `randomreddit <subreddit>` publikuje losowy post z subreddita po sprawdzeniu, że nie jest oznaczony jako NSFW. `memelist` pokazuje szablony memegen, a `memegen <template> [text]` tworzy mema. `rip @user` tworzy obraz nagrobka z nazwą i awatarem. `shorten <url>` skraca link.

## Żarty

`randjoke`, `yomama`, `chucknorris`, `wowjoke` i `magicitem` pobierają żart lub opis przedmiotu z odpowiednich API. `catfact` publikuje ciekawostkę o kotach.

## Komendy reakcji

Publikują one anime GIF dla danej czynności. Te skierowane do kogoś przyjmują wzmiankę: `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold` i `highfive`. Te dotyczące Ciebie przyjmują opcjonalny tekst: `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave` i `wink`. Wszystkie są też dostępne jako komendy slash.

`ship @user [@user2]` ocenia zgodność dwóch członków (albo Ciebie i jednego członka) i publikuje obraz shipa z komentarzem.

## Ustawienia

Ten moduł nie ma strony w panelu ani ustawień serwera poza przełącznikiem automatycznego tłumaczenia. Kilka komend opiera się na kluczach API konfigurowanych przez właściciela bota; jeśli klucza brakuje, komenda odpowiada błędem zamiast wynikami.

## Konfiguracja krok po kroku

1. Nic nie trzeba włączać. Uruchom `weather London` lub `define serendipity`, aby potwierdzić, że bot może odpowiadać na kanale.
2. Jeśli chcesz mieć tłumaczony kanał, uruchom tam `autotranslate` jako administrator, a potem poproś członków o ustawienie `autotranslang en>es` lub podobnego.
3. Użyj modułu uprawnień, jeśli chcesz ograniczyć komendy reakcji lub obrazów do wybranych kanałów.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `weather <place>` | `we` | Nikt | Interaktywna karta pogody |
| `time <place>` | | Nikt | Bieżący czas i strefa czasowa |
| `define <word>` | `def` | Nikt | Definicja słownikowa |
| `urbandict <term>` | `ud` | Nikt | Urban Dictionary |
| `wiki <query>` | `wikipedia` | Nikt | Streszczenie z Wikipedii |
| `wikia <site> <query>` | `fandom` | Nikt | Wyszukiwanie w wiki Fandom |
| `google <query>` | `g` | Nikt | Wyszukiwanie w sieci |
| `bible <book> <chapter:verse>` | | Nikt | Werset biblijny |
| `resolvetonetags <text>` | `tonetag`, `resolvetonetag`, `tonetags` | Nikt | Wyjaśnia tone tagi |
| `translate <langs> <text>` | `trans` | Nikt | Tłumaczy tekst, na przykład `translate en>fr hello` |
| `translangs` | | Nikt | Obsługiwane języki |
| `autotranslate [del\|nodel]` | `at`, `autotrans` | Administrator | Przełącza automatyczne tłumaczenie kanału |
| `autotranslang [from>to]` | `atl` | Nikt | Twoja para języków do automatycznego tłumaczenia |
| `anime <query>` | `ani`, `aq` | Nikt | Wyszukiwanie anime |
| `manga <query>` | `mang`, `mq` | Nikt | Wyszukiwanie mangi |
| `charinfo <name>` | `characterinfo` | Nikt | Wyszukiwanie postaci |
| `findanime [image]` | `whatanime` | Nikt | Rozpoznaje anime ze zrzutu ekranu |
| `mal <username or @user>` | | Nikt | Profil MyAnimeList |
| `movie <title>` | `omdb`, `imdb` | Nikt | Szczegóły filmu |
| `youtube <query>` | `yt` | Nikt | Wyszukiwanie YouTube |
| `steam <game>` | | Nikt | Link do sklepu Steam |
| `pokemon <name>` | | Nikt | Szczegóły Pokemona |
| `osu <user> [mode]` | | Nikt | Profil osu! |
| `osu5 <user> [mode]` | | Nikt | Pięć najlepszych rozgrywek osu! |
| `gatari <user> [mode]` | | Nikt | Profil osu!Gatari |
| `xkcd [number\|latest]` | | Nikt | Komiks xkcd |
| `image <query>` | `img`, `rimg` | Nikt | Bezpieczne wyszukiwanie obrazów |
| `safebooru [tag]` | | Nikt | Obraz z Safebooru |
| `revimg <url>` | | Nikt | Linki do wyszukiwania odwrotnego obrazu |
| `revav [@user]` | | Nikt | Wyszukiwanie odwrotne awatara |
| `color <hex...>` | `clr` | Nikt | Próbki kolorów |
| `randomcat` | `meow` | Nikt | Zdjęcie kota |
| `randomdog` | `woof` | Nikt | Zdjęcie psa |
| `randomfood` | `yum` | Nikt | Zdjęcie jedzenia |
| `randombird` | `birb`, `bird` | Nikt | Zdjęcie ptaka |
| `randomneko` | `neko` | Nikt | Obrazek neko |
| `randomkitsune` | `kitsune` | Nikt | Obrazek kitsune |
| `randomwaifu` | `waifu` | Nikt | Obrazek waifu |
| `meme` | `randommeme` | Nikt | Losowy mem z Reddita |
| `randomreddit <subreddit>` | `subreddit` | Nikt | Losowy post z subreddita |
| `memelist` | | Nikt | Szablony Memegen |
| `memegen <template> [text]` | | Nikt | Tworzy mema |
| `rip <@user>` | | Nikt | Obraz nagrobka |
| `shorten <url>` | | Nikt | Skraca link |
| `randjoke` | | Nikt | Losowy żart |
| `yomama` | `ym` | Nikt | Żart o mamie |
| `chucknorris` | `cn` | Nikt | Żart o Chucku Norrisie |
| `wowjoke` | | Nikt | Żart z World of Warcraft |
| `magicitem` | `mi` | Nikt | Magiczny przedmiot z WoW |
| `catfact` | | Nikt | Ciekawostka o kotach |
| `ship <@user> [@user2]` | | Nikt | Obraz z oceną zgodności |
| `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold`, `highfive <@user>` | | Nikt | Reakcyjny GIF skierowany do kogoś |
| `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave`, `wink [text]` | | Nikt | Reakcyjny GIF o Tobie |

## Wskazówki i pułapki

- Te komendy wywołują zewnętrzne usługi, więc wyniki zależą od ich dostępności i od tego, czy właściciel bota ma odpowiednie klucze API.
- `image` ma limit jednego wyszukiwania na dwadzieścia sekund na członka, a wyniki są filtrowane pod kątem bezpieczeństwa nawet na kanałach NSFW.
- `randomreddit` odrzuca subreddity oznaczone jako NSFW. Do treści dla dorosłych użyj modułu NSFW.
- Automatyczne tłumaczenie działa osobno dla kanału i członka: kanał musi być włączony przez administratora, a każdy członek wybiera własną parę.
- Powiadomienia o streamach (`streamadd`, `streamlist`, `streamtemplate`) i kanały RSS (`feedadd`, `feedlist`) są opisane osobno, mimo że dzielą ten moduł.

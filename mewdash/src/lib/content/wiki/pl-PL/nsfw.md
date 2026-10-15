---
title: NSFW
slug: nsfw
summary: Komendy z obrazami dla dorosłych, działające tylko na kanałach oznaczonych jako NSFW, z czarną listą tagów dla serwera i opcjonalnym automatycznym publikowaniem co określony czas.
icon: fa-eye-slash
category: Entertainment
module: Nsfw
tags: [nsfw, hentai, booru, rule34, e621, danbooru, gelbooru, nhentai, reddit, tag blacklist, autohentai, nsfwtoggle, obrazy dla dorosłych, czarna lista tagów, automatyczne publikowanie, rozrywka]
related: [servermanagement, permissions, filter]
---

## Co robi

Moduł NSFW pobiera na żądanie obrazy dla dorosłych z serwisów graficznych i z Reddita. Każda komenda w nim wymaga flagi NSFW Discorda: działa tylko na kanale z tą flagą, a większość komend z serwisami graficznymi działa też w DM z botem. Na każdym innym kanale komenda jest po cichu odrzucana.

Staff kontroluje dwie rzeczy. `nsfwtoggle` (w module Administracja) przełącza flagę NSFW na bieżącym kanale, co odblokowuje tam te komendy. `nsfwtagbl` prowadzi listę tagów, które są usuwane z każdego wyszukiwania w serwisach graficznych na tym serwerze, dzięki czemu serwer może włączyć moduł, wykluczając treści, których nie chce.

Członkowie uruchamiają komendę źródła z opcjonalnymi tagami i dostają jeden obraz z jego oceną, źródłem i pierwszymi tagami. Warianty „bomb” publikują od razu cztery. Moderatorzy mogą też uruchomić timer, który co określoną liczbę sekund publikuje nowy obraz na kanale.

## Po co to używać

- Serwer 18+ chce ograniczyć komendy z obrazami do oznaczonych kanałów.
- Staff chce blokować pewne tagi na całym serwerze, bez wyłączania modułu.
- Dedykowany kanał ma dostawać świeży obraz z timera, bez czyjegokolwiek pisania.

## Wymóg kanału

Flaga NSFW Discorda jest ustawiana dla każdego kanału osobno. Uruchom `nsfwtoggle` na kanale, aby ją włączyć lub wyłączyć; wymaga ona uprawnienia Zarządzanie kanałami dla Ciebie i dla bota. Bot odpowiada, potwierdzając nowy stan. Tę samą flagę można ustawić w ustawieniach kanału w Discordzie.

Jeśli komenda zostanie użyta na kanale nie-NSFW, nic się nie stanie. Członkowie czasem uznają to za zepsucie bota, więc notatka na kanale z regulaminem bardzo pomaga.

## Źródła

| Komenda | Źródło | Uwagi |
| --- | --- | --- |
| `hentai [tags]` | Połączone serwisy, tylko oznaczone jako explicit | Pięciosekundowy cooldown |
| `yandere`, `konachan`, `sankaku`, `e621`, `rule34`, `danbooru`, `gelbooru`, `derpibooru`, `safebooru`, `realbooru` | Wskazany serwis | Każda przyjmuje opcjonalne tagi |
| `hentaibomb [tags]` | Yandere, Danbooru, Konachan i Gelbooru | Cztery obrazy naraz |
| `pornbomb [tags]` | Realbooru | Cztery obrazy naraz |
| `redditnsfw <subreddit>` | Losowy top post z tego subreddita | Dziesięciosekundowy cooldown |
| `boobs`, `butts` | Stałe subreddity przez `redditnsfw` | |
| `pussy`, `anal`, `porn`, `bondage`, `hentaigif` | Endpointy kategorii | Tylko kanał NSFW, bez DM |
| `nhentai <id>` | Konkretna galeria po numerze | Odrzuca galerie oznaczone jako lolicon lub shotacon |
| `nhentaisearch <query> [page] [type] [blacklist]` | Wyszukiwanie galerii | |

Tagi są oddzielane spacjami. Na e621 i Derpibooru tag `yuri` jest automatycznie tłumaczony na odpowiednik danego serwisu. Na jednym serwerze może działać naraz tylko jeden `hentaibomb` i jeden `pornbomb`.

## Czarna lista tagów

`nsfwtagbl` bez argumentu wyświetla zablokowane tagi. `nsfwtagbl <tag>` dodaje tag albo, jeśli już jest na liście, go usuwa. Wyniki, w których jest zablokowany tag, są pomijane przez każdą komendę serwisów graficznych na serwerze. Wymaga Zarządzania wiadomościami.

## Automatyczne publikowanie

`autohentai <seconds> [tags]`, `autoboobs <seconds>` i `autobutts <seconds>` uruchamiają timer na bieżącym kanale. Interwał musi wynosić co najmniej 20 sekund dla `autohentai` i `autobutts`; `autoboobs` nie wymusza minimum. Uruchomienie komendy z `0` albo bez interwału zatrzymuje timer na tym kanale. Dla `autohentai` oddziel alternatywne zestawy tagów znakiem `|`, a bot za każdym razem wybierze jeden losowo; bez tagów dostaniesz losowe obrazy. Te komendy wymagają Zarządzania wiadomościami, a kanał musi być NSFW. Timery nie przetrwają restartu bota.

## Ustawienia

Ten moduł nie ma strony w panelu.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Flaga NSFW kanału | wyłączone | Czy którakolwiek z tych komend działa na kanale |
| Czarna lista tagów | pusta | Tagi wykluczone z wyników serwisów graficznych na tym serwerze |
| Timery automatycznego publikowania | brak | Timery dla kanałów uruchomione komendami `auto...` |

## Konfiguracja krok po kroku

1. Wybierz kanał i uruchom na nim `nsfwtoggle` albo ustaw flagę w ustawieniach kanału w Discordzie.
2. Użyj uprawnień komend, aby trzymać moduł z dala od reszty, na przykład `srvrmdl nsfw disable`, a potem `chnlmdl nsfw enable #adult`.
3. Dodaj niechciane tagi komendą `nsfwtagbl <tag>`, po jednym tagu na komendę.
4. Przetestuj `hentai` albo `rule34 <tag>` na kanale.
5. Opcjonalnie uruchom `autohentai 300 <tags>`, a zatrzymaj je później przez `autohentai 0`.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Zarządzanie kanałami | Przełącza flagę NSFW bieżącego kanału |
| `nsfwtagbl [tag]` | `nsfwtbl` | Zarządzanie wiadomościami | Wyświetla, dodaje lub usuwa zablokowany tag |
| `hentai [tags]` | | Nikt | Jeden obraz explicit z połączonych serwisów |
| `hentaibomb [tags]` | | Nikt | Cztery obrazy z czterech serwisów |
| `pornbomb [tags]` | | Nikt | Cztery obrazy z Realbooru |
| `yandere [tags]` | | Nikt | Yande.re |
| `konachan [tags]` | | Nikt | Konachan |
| `sankaku [tags]` | | Nikt | Sankaku |
| `e621 [tags]` | | Nikt | e621 |
| `rule34 [tags]` | `r34` | Nikt | Rule34 |
| `danbooru [tags]` | | Nikt | Danbooru |
| `gelbooru [tags]` | | Nikt | Gelbooru |
| `derpibooru [tags]` | `derpi` | Nikt | Derpibooru |
| `safebooru [tags]` | | Nikt | Safebooru |
| `realbooru [tags]` | `rb` | Nikt | Realbooru |
| `redditnsfw <subreddit>` | `nsfwsubreddit` | Nikt | Losowy post z subreddita |
| `boobs` | | Nikt | Skrót do Reddita |
| `butts` | `ass`, `butt` | Nikt | Skrót do Reddita |
| `pussy` | | Nikt | Obraz z kategorii |
| `anal` | | Nikt | Obraz z kategorii |
| `porn` | | Nikt | Obraz z kategorii |
| `bondage` | | Nikt | Obraz z kategorii |
| `hentaigif` | | Nikt | GIF z kategorii |
| `nhentai <id>` | `nh` | Nikt | Przegląda galerię po numerze |
| `nhentaisearch <query> [page] [type] [blacklist]` | `nhsearch`, `nhs` | Nikt | Wyszukuje galerie |
| `autohentai [seconds] [tags]` | | Zarządzanie wiadomościami | Publikowanie co określony czas; `0` zatrzymuje |
| `autoboobs [seconds]` | | Zarządzanie wiadomościami | Publikowanie co określony czas; `0` zatrzymuje; bez minimalnego interwału |
| `autobutts [seconds]` | | Zarządzanie wiadomościami | Publikowanie co określony czas; `0` zatrzymuje |

## Wskazówki i pułapki

- Kontrola wieku to flaga kanału Discorda oraz czarna lista tagów bota. Bot nie sprawdza wieku ani ról członków; do tego użyj uprawnień komend.
- Właściciele bota mogą też wyłączyć moduł globalnie; wtedy w menu pomocy pojawia się jako zablokowany.
- Serwisy graficzne mają limity zapytań i czasem nic nie zwracają dla wąskich kombinacji tagów; wtedy bot odpowiada, że nie znaleziono obrazu.
- Timery działają osobno dla każdego kanału i są przechowywane w pamięci. Po restarcie uruchom je ponownie.

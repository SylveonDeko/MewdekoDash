---
title: Gry
slug: games
summary: Gry czatowe, które członkowie mogą rozpocząć na dowolnym kanale, od quizów, wisielca i łańcuchów słów po wyścigi pisania, acrophobię i ankiety.
icon: fa-gamepad-modern
category: Entertainment
module: Games
tags: [games, trivia, hangman, kaladont, nunchi, typing race, acrophobia, tic tac toe, poll, vote, 8ball, choose, gry, quiz, wisielec, łańcuch słów, wyścig pisania, kółko i krzyżyk, ankieta, głosowanie, wybierz]
related: [polls, currency, xp, searches, utility]
---

## Co robi

Gry toczą się na kanale, na którym zostały rozpoczęte. Członek uruchamia komendę, bot publikuje grę, a wszyscy na kanale grają, wpisując odpowiedzi albo naciskając przyciski. Naraz działa tylko jedna gra każdego rodzaju na kanał (albo na serwer w przypadku Nunchi i Kaladont), a większość gier można przerwać wcześniej odpowiednią komendą stop.

Trivia, wisielec, Kaladont, Nunchi, wyścig pisania, acrophobia i kółko i krzyżyk to gry wieloosobowe. Ankiety pozwalają moderatorom zadać kanałowi pytanie z przyciskami albo listą wyboru. `choose` i `8ball` to jednorazowe zabawki.

Ten moduł nie ma strony w panelu. Wszystko odbywa się komendami, a większość z nich nie wymaga żadnych uprawnień.

## Po co z tego korzystać

- Urozmaić spokojny wieczór rundą trivii albo wisielca.
- Zorganizować wyścig pisania albo turniej Kaladont jako wydarzenie społeczności.
- Zapytać serwer szybko o odpowiedź tak lub nie albo ankietę z wieloma opcjami i listą wyboru.
- Założyć stały kanał Kaladont, żeby łańcuch słów nigdy się nie urywał.

## Trivia

`trivia` rozpoczyna quiz. Bot publikuje pytanie, pokazuje podpowiedź w połowie czasu na pytanie, chyba że podpowiedzi są wyłączone, a pierwszy członek, który wpisze odpowiedź, zdobywa punkt. Gdy członek osiągnie wymaganą liczbę punktów, gra się kończy i wygrywa. Jeśli pod rząd bez odpowiedzi minie wystarczająco wiele pytań, gra się zatrzymuje.

| Opcja | Domyślnie | Co robi |
| --- | --- | --- |
| `-p`, `--pokemon` | wyłączone | Tryb „Kto to Pokemon?” |
| `--nohint` | wyłączone | Nigdy nie pokazuj podpowiedzi |
| `-w`, `--win-req` | 10 | Punkty potrzebne do wygranej; 0 oznacza grę bez końca |
| `-q`, `--question-timer` | 30 | Sekundy na pytanie |
| `-t`, `--timeout` | 10 | Pytania bez odpowiedzi pod rząd przed zakończeniem gry; 0 oznacza nigdy |

`tl` pokazuje bieżące wyniki, a `tq` zatrzymuje grę. Globalna konfiguracja bota może ustawić minimalną liczbę punktów do wygranej i nagrodę walutową dla zwycięzcy.

> [!EXAMPLE]
> `trivia -w 5 -q 20` uruchamia krótką grę do pięciu punktów, z dwudziestoma sekundami na pytanie.

## Wisielec

`hangman [type]` wybiera słowo z kategorii i pokazuje je jako puste miejsca. Członkowie zgadują pojedyncze litery albo całe słowo, wpisując je na kanale. Sześć błędnych zgadnięć kończy grę. Kategorie to `countries`, `movies`, `animals`, `things` i `random`; domyślnie jest `random`. `hangmanlist` pokazuje typy dostępne na twoim serwerze, a `hangmanstop` kończy grę.

## Kaladont

Kaladont to łańcuch słów. Każde słowo musi zaczynać się od dwóch ostatnich liter poprzedniego słowa, a słowo można użyć tylko raz w grze. Gracze działają po kolei, z limitem czasu na turę. Słownik może być angielski albo serbski, a serbskie dwuznaki (takie jak lj i nj) traktowane są jak pojedyncze litery.

| Opcja | Domyślnie | Co robi |
| --- | --- | --- |
| `-j`, `--join-time` | 15 | Sekundy na dołączenie graczy przed startem gry |
| `-t`, `--turn-time` | 30 | Sekundy na turę |
| `-m`, `--min-players` | 2 | Graczy potrzebnych do startu |
| `-l`, `--language` | en | `en` albo `sr` |
| `-e`, `--endless` | wyłączone | Odrzuca słowa, po których nie ma poprawnego słowa dla następnego gracza |

`kaladontstop` kończy bieżącą grę. `kaladontsetup` zamienia bieżący kanał w stały kanał Kaladont, który podtrzymuje łańcuch, z tymi samymi flagami języka i endless, a `kaladontdisable` go usuwa. Obie komendy wymagają Zarządzanie kanałami.

## Nunchi

`nunchi` tworzy grę, a inni członkowie uruchamiają `nunchi`, aby dołączyć, dopóki gra jest w fazie dołączania. W każdej rundzie bot ogłasza liczbę, a każdy gracz musi wpisać następną liczbę. Gracze, którzy wpiszą ją poprawnie, przechodzą dalej; gdy wszyscy oprócz jednego przejdą, runda się kończy, a pozostały gracz odpada. Jeśli nikt nie odpowie na czas, runda zaczyna się od nowa z wszystkimi, którzy już przeszli. Ostatni stojący gracz wygrywa.

## Wyścig pisania

`typestart` odlicza (domyślnie pięć sekund; `-s` albo `--start-time` ustawia od 3 do 30) i potem publikuje zdanie. Pierwszy członek, który przepisze je wystarczająco dokładnie, wygrywa; kilka literówek jest tolerowanych, mniej więcej jedna na 25 znaków. Wynik pokazuje słowa na minutę i liczbę błędów. `typestop` kończy wyścig, `typelist` pokazuje pulę zdań, a właściciele bota mogą dodawać i usuwać zdania komendami `typeadd` i `typedel`.

## Acrophobia

`acrophobia` publikuje od trzech do pięciu losowych liter. Członkowie mają czas na zgłoszenie (domyślnie 60 sekund, od 15 do 300), aby wysłać frazę, której słowa zaczynają się od tych liter w kolejności, po jednym zgłoszeniu na osobę. Następnie wszyscy głosują na ulubioną frazę, podając jej numer w czasie głosowania (domyślnie 60 sekund, od 15 do 120). Nie można głosować na własne zgłoszenie. Czasy ustawia się przez `-s` albo `--submission-time` oraz `-v` albo `--vote-time`.

## Kółko i krzyżyk

`tictactoe` otwiera grę; następny członek, który ją uruchomi, dołącza jako drugi gracz. Ruchy wykonuje się na czacie, a gracz, który przekroczy limit czasu na turę (domyślnie 15 sekund, `-t` albo `--turn-timer`, od 5 do 60), przegrywa walkowerem. Gra podaje zwycięzcę albo remis.

## Ankiety

Do tworzenia ankiet potrzebne jest Zarządzanie wiadomościami. Opcje oddziela się średnikami.

| Komenda | Typ | Działanie |
| --- | --- | --- |
| `poll <question>` | Tak/Nie | Dwa przyciski |
| `pollc question;option1;option2;...` | Jeden wybór | Jeden głos na członka |
| `pollm question;option1;option2;...` | Wielokrotny wybór | Członkowie mogą wybrać kilka opcji |
| `polla question;option1;option2;...` | Anonimowa | Tożsamość głosujących jest ukryta |

Ankiety z dwoma–pięcioma opcjami używają przycisków; dłuższe korzystają z listy wyboru z maksymalnie 25 pozycjami. Członkowie mogą zmienić swój głos. Szablony zapisują pytanie i jego opcje do ponownego użycia: `polltemplates` je wyświetla, a `polltemplate <name>` publikuje jeden z nich. Tworzenie i usuwanie szablonów, zamykanie ankiety, wyświetlanie listy aktywnych ankiet i statystyk ankiety robi się komendami slash `/poll` (`create-template`, `delete-template`, `close`, `list`, `stats`) albo na stronie Ankiet w panelu, która ma osobny artykuł.

## Inne

- `choose a; b; c` wybiera losowo jedną opcję z listy oddzielonej średnikami.
- `8ball <question>` odpowiada z listy odpowiedzi w konfiguracji gier bota.
- `linux <word> <word>` publikuje copypasta "I'd just like to interject" z zamienionymi dwoma słowami.
- `dragon` przełącza twoją flagę beta testera, którą sprawdzają niektóre eksperymentalne komendy.
- `rategirl` istnieje tylko jako atrapa z notatką o tym, dlaczego została usunięta. Nic użytecznego nie robi.

## Ustawienia

Ten moduł nie ma strony w panelu ani ustawień dla serwera. Zachowanie gier określają opcje komend opisane wyżej. Plik `games.yml` właściciela bota zawiera odpowiedzi 8ball oraz minimalną liczbę punktów do wygranej w trivii i nagrodę walutową.

## Krok po kroku

1. Wybierz kanał na gry albo utwórz go, żeby wiadomości z gier nie zagłuszały rozmów.
2. Jeśli chcesz stały łańcuch słów, uruchom `kaladontsetup -l en` na tym kanale.
3. Uruchom `trivia` albo `hangman`, aby sprawdzić, czy bot może tam wysyłać wiadomości i odczytywać odpowiedzi.
4. Nadaj moderatorom Zarządzanie wiadomościami, jeśli mają prowadzić ankiety.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, jeśli go nie zmieniałeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `trivia [options]` | `t` | Nikt | Rozpocznij trivię |
| `tl` | | Nikt | Wyniki trivii |
| `tq` | | Nikt | Zatrzymaj trivię |
| `hangman [type]` | | Nikt | Rozpocznij wisielca |
| `hangmanlist` | | Nikt | Lista typów wisielca |
| `hangmanstop` | | Nikt | Zatrzymaj wisielca |
| `kaladont [options]` | `kal` | Nikt | Rozpocznij Kaladont |
| `kaladontstop` | `kalstop` | Nikt | Zatrzymaj Kaladont |
| `kaladontsetup [options]` | `kalsetup` | Zarządzanie kanałami | Ustaw ten kanał jako stały kanał Kaladont |
| `kaladontdisable` | `kaldisable` | Zarządzanie kanałami | Usuń stały kanał |
| `nunchi` | | Nikt | Utwórz Nunchi albo dołącz do niego |
| `typestart [options]` | | Nikt | Rozpocznij wyścig pisania |
| `typestop` | | Nikt | Zatrzymaj wyścig |
| `typelist [page]` | | Nikt | Lista zdań do wyścigu |
| `typeadd <text>` | | Właściciel bota | Dodaj zdanie |
| `typedel <index>` | | Właściciel bota | Usuń zdanie |
| `acrophobia [options]` | `acro` | Nikt | Rozpocznij acrophobię |
| `tictactoe [options]` | `ttt` | Nikt | Rozpocznij albo dołącz do kółka i krzyżyka |
| `poll <question>` | `ppoll` | Zarządzanie wiadomościami | Ankieta tak/nie |
| `pollc <question;options>` | | Zarządzanie wiadomościami | Ankieta z jednym wyborem |
| `pollm <question;options>` | | Zarządzanie wiadomościami | Ankieta z wieloma wyborami |
| `polla <question;options>` | | Zarządzanie wiadomościami | Ankieta anonimowa |
| `polltemplates` | `ptemplates` | Nikt | Lista szablonów ankiet |
| `polltemplate <name>` | `ptemplate` | Zarządzanie wiadomościami | Opublikuj ankietę z szablonu |
| `choose <a; b; c>` | | Nikt | Wybierz losowo jedną opcję |
| `8ball [question]` | `eightball` | Nikt | Magiczna kula 8 |
| `linux <word> <word>` | | Nikt | Copypasta "The interjection" |
| `dragon` | | Nikt | Przełącz swoją flagę beta |
| `rategirl` | | Nikt | Atrapa, nic nie robi |

## Wskazówki i pułapki

- Gry czytają odpowiedzi z kanału, więc bot potrzebuje tam uprawnień Read Message History i Send Messages, a nie może być zablokowany regułą uprawnień kanału.
- Odpowiedzi w trivii, wisielcu i Kaladont to zwykłe wiadomości. Jeśli działa u ciebie też liczenie wiadomości albo XP, te wiadomości są liczone.
- Naraz na kanale może działać tylko jedna gra trivii, wisielca, wyścigu pisania lub Kaladont; komenda startu poinformuje cię, jeśli jakaś już trwa.
- Opcje ankiety dłuższe niż 100 znaków są w liście wyboru ucinane.
- Nunchi eliminuje najwolniejszego gracza w każdej rundzie, więc duża grupa może potrzebować sporo czasu, żeby skończyć.

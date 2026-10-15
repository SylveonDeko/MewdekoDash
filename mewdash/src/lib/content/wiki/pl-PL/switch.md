---
title: Nintendo Switch
slug: switch
summary: Sprawdzaj kody błędów Nintendo Switch, konwertuj je między systemem dziesiętnym a szesnastkowym, przeszukuj wiki switchbrew.org i czytaj zrozumiałe podsumowanie pliku logu Ryujinx.
icon: fa-gamepad-modern
category: Entertainment
module: Switch
tags: [switch, nintendo, error code, ryujinx, emulator, log, switchbrew, homebrew, hex, kod błędu, emulacja, dziennik, szesnastkowy]
related: [userprofile, help]
---

## Co to robi

Moduł Switch to zestaw narzędzi wsparcia dla serwerów dotyczących homebrew i emulacji Nintendo Switch. Gdy ktoś opublikuje błąd, np. `2168-0002`, pomocnik uruchamia `err 2168-0002`, a bot odpowiada modułem, do którego należy błąd, tym, co o nim wiadomo, oraz linkiem do strony pomocy Nintendo, jeśli taka istnieje.

Dwa małe konwertery zamieniają formę `NNNN-NNNN` na surową wartość szesnastkową używaną w kodzie i z powrotem. `switchbrew` przeszukuje wiki switchbrew.org, dzięki czemu ludzie mogą znaleźć strony SVC, kodów wyniku lub sprzętu, nie opuszczając Discorda.

Największą funkcją jest analizator logów Ryujinx. Użytkownik dołącza swój `Ryujinx.log`, ktoś uruchamia na nim `analyselog` (albo odpowiada na wiadomość z tym plikiem), a bot tworzy embed z grą, wersją emulatora, sprzętem, każdym istotnym ustawieniem, ostatnim błędem, zainstalowanymi modami i cheatami oraz listą uwag wskazujących typowe błędne konfiguracje.

Nic nie wymaga konfiguracji i nic nie jest zapisywane. Wszystkie komendy są dostępne dla każdego.

## Po co z tego korzystać

- Kanał pomocy dostaje codziennie to samo pytanie: „co oznacza 2811-5001?”.
- Rozwiązywanie problemów z Ryujinx zaczyna się od przeczytania logu, a większość ludzi nie wie, czego szukać.
- Deweloperzy chcą formy szesnastkowej błędu, by przeszukać kod źródłowy.
- Każdy może wyciągnąć stronę switchbrew.org prosto z Discorda.

## Wyszukiwanie kodów błędów

`err <code>` przyjmuje obie formy:

- `NNNN-NNNN`, gdzie pierwsza grupa zaczyna się od 2 (np. `2168-0002`). Numer modułu to pierwsza grupa minus 2000, a opis to druga grupa.
- Wartość szesnastkowa z prefiksem `0x`, np. `0x2A2`. Dziewięć najniższych bitów to moduł, a reszta to opis.

Odpowiedź pokazuje kod w obu formach, nazwę i numer modułu, numer opisu oraz wyjaśnienie. Wyjaśnienie szukane jest w tej kolejności: znany opis dla dokładnego kodu, strona pomocy Nintendo dla dokładnego kodu, opis zakresu, w którym kod mieści się w swoim module, a w przeciwnym razie „unknown”. Znane kody są pokazywane w normalnym kolorze, nieznane w kolorze błędu.

Kilka kodów nie pasuje do wzorca, np. `2-AAB6A-3400`. Są one dopasowywane dokładnie do krótkiej listy i zgłaszane z grą, do której należą.

`err2hex <NNNN-NNNN>` wypisuje wartość szesnastkową. `hex2err <hex>` wypisuje formę z myślnikiem; prefiks `0x` jest opcjonalny.

## Wyszukiwanie w switchbrew

`switchbrew <query>` odpytuje API wyszukiwania wiki i zwraca pierwsze pięć wyników z linkiem i fragmentem do 200 znaków każdy. `svc` jest aliasem, więc `svc SetThreadPriority` brzmi naturalnie.

## Analiza logów Ryujinx

`analyselog` szuka załącznika `.log` lub `.txt` w twojej wiadomości. Jeśli go nie ma, a wiadomość jest odpowiedzią, bot użyje załącznika z wiadomości, na którą odpowiadasz, i wymieni jej autora w stopce. Embed ma tytuł z nazwą gry i zawiera:

| Pole | Zawartość |
| --- | --- |
| Informacje ogólne | Wersja Ryujinx, firmware, CPU, GPU, RAM, system operacyjny |
| Ustawienia systemu | Backend audio, tryb dokowany lub przenośny, PPTC, pamięć podręczna shaderów, VSync, hypervisor (tylko macOS) |
| Ustawienia grafiki | Backend grafiki, skala rozdzielczości, filtrowanie anizotropowe, proporcje obrazu, rekompresja tekstur |
| Błędy | Ostatni blok błędu z logu albo „no errors” |
| Mody | Każdy mod z ExeFS lub RomFS, skrócony z liczbą, jeśli jest ich wiele |
| Cheaty | Każdy cheat, skrócony w ten sam sposób |
| Uwagi | Wykryte problemy i porady |

Uwagi obejmują m.in.: kolizję lub uszkodzenie pamięci podręcznej shaderów, zły hash dumpu, nieaktualne klucze, brakujący firmware, błędy uprawnień do plików, brakujący zapis, brakujące usługi, brak pamięci w Vulkan, domyślny profil użytkownika, brak skonfigurowanego kontrolera, karty Intel lub AMD, które powinny używać Vulkan, Rosettę na Apple silicon, atrapę backendu audio, wyłączone PPTC lub pamięć podręczną shaderów, rozszerzoną pamięć RAM, programowy menedżer pamięci, ignorowanie brakujących usług, wyłączony VSync, wyłączone sprawdzanie integralności systemu plików, wyłączone wątki backendu oraz własne buildy. Każda uwaga ma znacznik ważności, od informacyjnej do krytycznej.

Jeśli plik nie może zostać pobrany lub nie jest logiem Ryujinx, bot informuje, że log jest nieprawidłowy.

## Ustawienia

Ten moduł nie ma ustawień ani strony w panelu.

## Przewodnik konfiguracji

1. Upewnij się, że bot może czytać historię wiadomości i dołączać pliki na kanale pomocy.
2. Poproś użytkowników, by dołączali `Ryujinx.log` bezpośrednio do wiadomości.
3. Pomocnik odpowiada na tę wiadomość komendą `analyselog`.
4. W przypadku kodów błędów uruchom `err <code>` i udostępnij link do pomocy, jeśli jest pokazany.
5. Opcjonalnie dodaj wyzwalacz czatu albo przypiętą wiadomość przypominającą o tych dwóch komendach.

## Komendy

Uruchamiaj je z prefiksem serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `err <code>` | `nxerr`, `serr` | Nikt | Wyjaśnia kod błędu Switch w formie z myślnikiem lub szesnastkowej |
| `err2hex <NNNN-NNNN>` | `e2h` | Nikt | Konwertuje kod z myślnikiem na szesnastkowy |
| `hex2err <hex>` | `h2e` | Nikt | Konwertuje wartość szesnastkową na formę z myślnikiem |
| `switchbrew <query>` | `sb`, `svc` | Nikt | Przeszukuje switchbrew.org |
| `analyselog` | `analyzelog`, `analyselogs`, `analyzelogs`, `analyze`, `analyse` | Nikt | Analizuje dołączony log Ryujinx |

## Wskazówki i pułapki

- Forma z myślnikiem musi składać się dokładnie z czterech cyfr, myślnika i czterech cyfr, zaczynając od 2. Kody z literami obsługiwane są tylko przez listę wyjątków.
- Logi muszą być dołączone jako `.log` lub `.txt`; wklejony log w bloku kodu nie zostanie odczytany.
- Analizator czyta cały plik, więc proś użytkowników o log z sesji, w której wystąpił problem, a nie świeżo uruchomionej.
- Wyszukiwanie na switchbrew.org to żądanie na żywo; jeśli strona jest wolna, komenda też będzie wolna.
- Członkowie mogą zapisać swój kod znajomego Switch w profilu komendą `setswitchfc`, która należy do modułu Profil użytkownika.

---
title: Pomoc i komendy
slug: help
summary: Jak znaleźć i zrozumieć komendy bota z poziomu Discorda: menu pomocy kategorii, przeglądy modułów, strony pomocy dla pojedynczych komend, wyszukiwanie komend oraz kreator konfiguracji panelu, do którego bot prowadzi po dołączeniu.
icon: fa-life-ring
category: General
module: Help
tags: [help, commands, modules, search command, slash commands, prefix, setup wizard, invite, guide, source, donate, vote, pomoc, komendy, moduły, wyszukiwanie komend, komendy ukośnikowe, prefiks, kreator konfiguracji, zaproszenie, przewodnik, kod źródłowy, wsparcie, głosowanie]
related: [permissions, administration, userprofile]
---

## Co to robi

Moduł Pomoc pozwala członkom odkryć, co bot potrafi. `help` (lub `cmds`) otwiera menu z kategoriami komend, z liczbą modułów i komend przy każdej z nich, oraz listę rozwijaną do wyboru. Wybranie kategorii pokazuje jej moduły, a wybranie modułu pokazuje komendy po dziesięć na stronę z krótkimi opisami. Przy bardzo dużych modułach najpierw pojawia się przegląd podzielony na sekcje.

`help <command>` pokazuje jedną komendę: jej nazwę i pierwszy alias, co robi, uprawnienia Discorda, których potrzebuje od ciebie i od bota, cooldown (jeśli jest), odpowiadającą jej komendę ukośnikową, każdy parametr, formy alternatywne, przykłady użycia i link do dokumentacji. Przycisk **Uruchom** pozwala uruchomić komendę prosto ze strony pomocy, a jeśli komenda przyjmuje argumenty, otwiera się formularz.

`searchcommand <term>` znajduje komendy, których nazwa lub opis zawiera podane słowo. Wzmianka o bocie bez tekstu odpowiada aktualnym prefiksem i wskazówką, by użyć `cmds`.

Każda komenda ma wersję tekstową, używaną z prefiksem serwera, a w większości przypadków także wersję ukośnikową. Menu pomocy i strony komend wyglądają tak samo w obu przypadkach; `/help`, `/search` i `/invite` to punkty wejścia dla komend ukośnikowych.

## Po co z tego korzystać

- Nowy członek wpisuje `.help` i potrzebuje sensownego miejsca, od którego może zacząć.
- Staff chce dokładnie wiedzieć, jakiego uprawnienia wymaga komenda, zanim je nada.
- Ktoś pamięta tylko połowę nazwy komendy i chce ją wyszukać.
- Właśnie zaprosiłeś bota i wolisz prowadzoną konfigurację zamiast czytania dokumentacji każdego modułu.

## Menu pomocy

`help`, `commands` lub `modules` bez argumentów otwiera najwyższy poziom. Opis embeda wyjaśnia dwa sposoby: wybór kategorii z listy rozwijanej lub użycie `h nazwakomendy` dla jednej komendy. Zawiera również linki do dokumentacji, serwera wsparcia, zaproszenia i strony wsparcia finansowego.

| Kategoria | Zawiera |
| --- | --- |
| Moderacja i administracja | Administracja, Moderacja, Uprawnienia, Zarządzanie serwerem, Stany ról, Role statusu, Moderacja liczenia |
| Konfiguracja serwera | MultiGreets, Powitania ról, Starboard, Kanały statystyk, Sugestie, Zgłoszenia, Wyznania, Dostęp do kanałów, Własne kanały głosowe, Wyzwalacze czatu, Ankiety, Konkursy |
| Zabawa i gry | Gry, Liczenie, NSFW, Wyszukiwania, Minecraft, Switch |
| Ekonomia i poziomy | Waluta, XP, Reputacja, Głosowanie, Patreon |
| Muzyka | Muzyka |
| Narzędzia | Narzędzia, Pomoc, AFK, Todo, Profil użytkownika, Urodziny, Highlighty, Monitorowanie Copr |
| Właściciel bota | Moduły tylko dla właścicieli bota |
| Inne | Wszystko, czego nie przypisano wyżej |

Przycisk **Przełącz opisy** zmienia widok między zwięzłą listą a dłuższym układem, który wypisuje każdy moduł w jego kategorii, z ptaszkiem lub krzyżykiem pokazującym, czy jest dla ciebie włączony na tym kanale. Ikona kuli ziemskiej z krzyżykiem oznacza, że właściciele bota wyłączyli moduł wszędzie.

### Strony modułów

`commands <module>` przechodzi od razu do modułu. Nazwa może być dokładna lub jednoznacznym prefiksem, więc `cmds mod` otworzy Moderację, a `cmds s` zgłosi, że pasuje kilka modułów. Dodanie słowa po nazwie modułu filtruje wynik: `cmds utility remind` pokaże tylko komendy z Narzędzi, których nazwa lub opis zawiera „remind”.

Moduły z więcej niż 30 komendami i co najmniej trzema sekcjami najpierw pokazują przegląd: opis modułu, pole dla każdej sekcji z liczbą komend, listę rozwijaną do otwarcia sekcji, przycisk **Wszystkie komendy**, przycisk **Szukaj** otwierający formularz oraz **Wstecz**. Mniejsze moduły od razu przechodzą do listy ze stronami. Strony zawierają po dziesięć komend pogrupowanych według sekcji, z przyciskami: pierwsza, poprzednia, przejdź do, następna, ostatnia, wstecz i zamknij. Stronicowanie działa przez godzinę.

## Strony komend

`help <command>` dopasowuje dokładną nazwę lub dowolny alias. Embed zawiera:

- Komendę z jej prefiksem i pierwszym aliasem oraz jej opis.
- **Uprawnienia użytkownika**: czego potrzebujesz. Gdy nadpisanie uprawnienia Discorda z modułu Administracja zastępuje wbudowane wymaganie, oryginał jest pokazany przekreślony, a nadpisanie wymieniono po nim.
- **Uprawnienia bota**: czego potrzebuje bot.
- **Dokumentacja**: link do strony komendy na stronie dokumentacji.
- **Czas odnowienia**: pokazywany tylko wtedy, gdy komenda go ma.
- **Komenda ukośnikowa**: klikalna wzmianka o wersji ukośnikowej, jeśli istnieje.
- **Parametry**, **Przeciążenia** i **Użycie** z dokumentacji komendy, z listą każdego argumentu, informacją, czy jest opcjonalny, oraz wartością domyślną.
- Stopkę z nazwą modułu, podmodułu i metody, przydatną przy zgłaszaniu błędów.

Przycisk **Uruchom** wykonuje komendę tak, jakbyś ją wpisał ręcznie. Jeśli przyjmuje argumenty, najpierw pojawia się formularz. Administratorzy widzą też przycisk **Uprawnienia**, który otwiera szybkie menu Uprawnień komend dla tej komendy, opisane w artykule o uprawnieniach komend.

## Komendy ukośnikowe a tekstowe

Komendy tekstowe używają prefiksu serwera, domyślnie `.`, i dokładnych nazw z menu pomocy. Komendy ukośnikowe są pogrupowane, więc komenda tekstowa `setprivacy` występuje jako `/setprivacy`, a komendy uprawnień znajdują się w `/permissions servercommand`. Strona komendy pokazuje wzmiankę ukośnikową, dzięki czemu można ją kliknąć. Obie formy podlegają tym samym zasadom uprawnień.

## Gdy bot dołącza

Gdy bot zostanie dodany na serwer, odczytuje z dziennika audytu, kto go zaprosił (potrzebuje do tego uprawnienia Wyświetlanie dziennika audytu), i wysyła tej osobie wiadomość prywatną. Wiadomość zawiera przycisk **Skonfiguruj Mewdeko** prowadzący do kreatora na panelu dla tego serwera, trzyetapowe przypomnienie o `cmds`, `cmds mod` i `h purge` oraz link do serwera wsparcia. Jeśli nie da się ustalić zapraszającego lub ma on zablokowane wiadomości prywatne, nic nie zostaje wysłane; bot nie ogłasza niczego na kanale.

## Kreator konfiguracji

Kreator znajduje się pod adresem `/wizard?guild=<id>` na panelu. Link w wiadomości powitalnej otwiera wersję szybkiej konfiguracji; sam panel może zaproponować wersję dla nowych użytkowników, która na początku dodaje sprawdzenie uprawnień.

| Krok | Co robi |
| --- | --- |
| Powitanie | Wyjaśnia, co się zaraz wydarzy |
| Uprawnienia | Tylko za pierwszym razem: sprawdza, czy bot ma to, czego potrzebuje |
| Podstawy serwera | Prefiks, język bota i strefa czasowa serwera |
| Wybór funkcji | Wybór, co skonfigurować; funkcje są oznaczone jako pełna konfiguracja lub szybkie włączenie |
| Jeden krok na funkcję z pełną konfiguracją | Prowadzona konfiguracja tej funkcji |
| Szybka konfiguracja | Zbiorcze włączenie pozostałych funkcji z domyślnymi ustawieniami |
| Zakończ | Podsumowanie, w tym wszystko, czego nie udało się zapisać |

Postęp jest zapisywany osobno dla każdego serwera, więc wyjście i powrót wznawiają kreator. Serwer można oznaczyć jako pominięty, aby kreator przestał się pojawiać, a na stronie **Moje ustawienia** znajduje się przełącznik, czy wolisz prowadzoną konfigurację, oraz reset stanu kreatora dla serwera.

## Ustawienia

Sama pomoc nie ma nic do skonfigurowania. Prefiks ustawia się w module Administracja i pokazuje go w każdym embedzie pomocy.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Prefiks | `.` | Prefiks pokazywany w tekstach pomocy i używany przez przycisk Uruchom |
| Szczegółowe uprawnienia | wyłączone | Czy zablokowana komenda wyjaśnia, która zasada uprawnień ją zablokowała (zob. Uprawnienia komend) |

## Przewodnik konfiguracji

1. Wpisz `help` i otwórz kategorię z listy rozwijanej, aby zobaczyć, jak są pogrupowane moduły.
2. Wpisz `cmds mod`, aby zobaczyć moduł Moderacja, a potem `h purge`, aby zobaczyć jedną komendę w całości.
3. Wypróbuj przycisk **Uruchom** na nieszkodliwej komendzie, na przykład `h ping`.
4. Wpisz `searchcommand role`, aby zobaczyć, jak wyszukiwanie zawęża wyniki.
5. Jeśli właśnie zaprosiłeś bota, kliknij link **Skonfiguruj Mewdeko** z wiadomości powitalnej albo otwórz `/wizard?guild=<id_twojego_serwera>` na panelu.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `help [command]` | `h` | Nikogo | Menu pomocy lub pomoc dla jednej komendy |
| `commands [module] [term]` | `cmds` | Nikogo | Lista modułów, komendy jednego modułu lub przefiltrowana lista |
| `modules` | `mdls` | Nikogo | To samo menu najwyższego poziomu co `help` |
| `searchcommand <term>` | | Nikogo | Wyszukiwanie w nazwach i opisach komend, do 20 wyników |
| `guide` | `readme` | Nikogo | Link do przewodnika dla początkujących |
| `source` | `github`, `repo`, `gitlab`, `bitbucket` | Nikogo | Link do kodu źródłowego |
| `donate` | | Nikogo | Jak wesprzeć bota |
| `vote` | | Nikogo | Link do głosowania na bota |
| `exportcommandsjson` | `exportcommands`, `excj` | Nikogo | Eksport wszystkich komend do pliku JSON (raz na minutę) |

Tylko ukośnikowe: `/search <command>` z autouzupełnianiem oraz `/invite`. `/help`, `/commands <module> [filter]`, `/donate`, `/guide`, `/source` i `/vote` odpowiadają komendom tekstowym.

## Wskazówki i pułapki

- Jeśli `help` pokazuje obok modułu krzyżyk, reguła uprawnień lub właściciele bota wyłączyli go na tym kanale. Poproś staff o sprawdzenie `listperms`.
- Strony pomocy odzwierciedlają rzeczywiste warunki wstępne komendy, więc uprawnienie wymienione tam jest wiarygodne, nawet jeśli strona dokumentacji jest nieaktualna.
- Przycisk Uruchom używa twoich uprawnień, a nie uprawnień bota. To wygoda, a nie obejście zabezpieczeń.
- Dopasowanie modułu po prefiksie sprawia, że krótkie prefiksy często są niejednoznaczne; używaj co najmniej trzech lub czterech liter.
- Bot wysyła wiadomość prywatną do zapraszającego tylko przy dołączeniu. Jeśli zaprosiłeś go ze wspólnego linku i nic nie dostałeś, otwórz kreator z panelu.

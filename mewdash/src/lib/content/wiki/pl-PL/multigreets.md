---
title: Powitania
slug: multigreets
summary: Publikuj wiadomości powitalne na maksymalnie trzydziestu kanałach, gdy ktoś dołącza, a także klasyczne pożegnania, wiadomości o boostach i powitania w DM.
icon: fa-bell
category: Actions
dashboard: /dashboard/multigreets
module: MultiGreets
tags: [greets, multigreets, welcome, join message, goodbye, bye, leave message, boost message, greet dm, webhook, placeholders, powitania, wiadomość powitalna, pożegnanie, wiadomość o boostach, powitanie w DM, placeholdery]
related: [rolegreets, invites, administration]
---

## Co robi

Gdy członek dołącza, bot publikuje powitanie na każdym kanale, który skonfigurowałeś jako powitanie. Każde powitanie ma własną wiadomość, własny czas usuwania, własną tożsamość webhooka i własny przełącznik dla botów. Możesz uruchamiać wszystkie naraz albo wybierać jedno losowo przy każdym dołączeniu.

Wiadomości przechodzą przez parser embedów, więc powitanie może być zwykłym tekstem, pełnym embedem z przyciskami albo postem przez webhook z własną nazwą i awatarem. Placeholdery wstawiają nazwę członka, nazwę serwera, liczbę członków oraz, jeśli śledzenie zaproszeń jest włączone, kto go zaprosił.

Starszy system pojedynczej wiadomości nadal istnieje obok tego. Obsługuje pożegnanie, gdy ktoś wychodzi, ogłoszenie o boostach, gdy ktoś boostuje, i prywatne powitanie w DM. Znajdują się one w module Administracja i są opisane niżej.

## Do czego się przydaje

- Publiczne powitanie na `#general` i cicha linijka w `#staff-joins` przy tym samym dołączeniu.
- Różne style powitań na różnych kanałach, na przykład embed na jednym i „postać” webhooka na innym.
- Pula powitań, z której każdy nowy członek dostaje jedno wybrane losowo.
- Krótkie powitanie, które samo się usuwa po minucie, żeby kanał się nie zapełniał.
- Pożegnanie lub wiadomość o boostach bez konfigurowania czegokolwiek innego.

## Typy powitań

**Typ powitania** jest ustawiany dla całego serwera i decyduje, co dzieje się przy dołączeniu.

| Typ | Etykieta w panelu | Co się dzieje |
| --- | --- | --- |
| MultiGreet | Wszystkie powitania | Uruchamia się każde włączone powitanie, w kolejności dodania. Domyślne. |
| RandomGreet | Losowe powitanie | Jedno powitanie jest wybierane losowo z listy i się uruchamia. Wyłączone powitania mogą zostać wylosowane, a następnie pominięte. |
| Off | Wyłączone | Żadne powitanie się nie uruchamia. |

## Co zawiera jedno powitanie

Każde powitanie jest powiązane z jednym kanałem. Kanał może mieć do pięciu powitań, a serwer w sumie trzydzieści. Powitania są numerowane według pozycji na liście i tego numeru używają komendy.

| Pole | Domyślnie | Znaczenie |
| --- | --- | --- |
| Kanał | kanał, na którym dodano | Gdzie to powitanie jest publikowane |
| Wiadomość | pusta | Szablon tekstu lub embeda. Puste powitanie nic nie wysyła. |
| Usuń po | 0 (nigdy) | Sekundy do samodzielnego usunięcia powitania |
| Witaj boty | wyłączone | Czy powitanie uruchamia się, gdy dołącza konto bota |
| Webhook | brak | Publikuj przez webhook z własną nazwą i awatarem zamiast jako bot |
| Włączone | włączone | Wyłączone powitania są pomijane bez usuwania |

Jeśli kanał zostanie usunięty, powitanie jest usuwane przy następnej próbie uruchomienia. Jeśli webhook zostanie usunięty albo bot straci uprawnienie do pisania, powitanie jest przełączane na wyłączone zamiast zgłaszać błąd przy każdym dołączeniu.

## Placeholdery

Powitania są budowane z zestawów placeholderów użytkownika, serwera i bota. Placeholdery zapraszającego działają tylko wtedy, gdy śledzenie zaproszeń jest włączone na stronie Zaproszenia.

| Placeholder | Wartość |
| --- | --- |
| `%user%`, `%user.mention%` | Wzmianka o nowym członku |
| `%user.name%`, `%username%` | Nazwa użytkownika |
| `%user.fullname%`, `%userfull%` | Pełny tag |
| `%user.id%`, `%id%` | ID użytkownika |
| `%user.avatar%`, `%useravatar%` | URL awatara |
| `%user.banner%` | URL banera |
| `%user.created_date%`, `%user.created_time%` | Kiedy utworzono konto |
| `%user.joined_date%`, `%user.joined_time%` | Kiedy dołączył na ten serwer |
| `%server%`, `%server.name%` | Nazwa serwera |
| `%server.id%`, `%sid%` | ID serwera |
| `%server.icon%`, `%server.banner%` | URL ikony i banera |
| `%server.members%`, `%members%` | Liczba członków |
| `%server.boostlevel%`, `%server.boostcount%` | Poziom boostów i liczba boostów |
| `%server.time%`, `%server.timestamp.longdatetime%` | Aktualny czas, zwykły lub jako znacznik czasu Discorda |
| `%bot.name%`, `%bot.id%`, `%bot.avatar%` | Informacje o samym bocie |
| `%inviter.username%`, `%inviter.mention%`, `%inviter.id%`, `%inviter.avatar%` | Osoba, której zaproszenia użyto, albo `Unknown` |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | Statystyki zaproszeń zapraszającego |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%` | Użyte zaproszenie, jego etykieta i informacja, czy było to zaproszenie, link vanity czy aplikacja |
| `%user.joincount%`, `%user.leavecount%` | Ile razy ten członek dołączał i wychodził |
| `%server.members.ordinal%` | Liczba członków jako 1., 2., 1204. |
| `%user.joined.R%`, `%user.created.F%` (oraz style t, T, d, D, f) | Czasy dołączenia i utworzenia konta jako znaczniki czasu Discorda |

> [!EXAMPLE]
> `Welcome %user.mention% to %server%! You are member #%server.members%.`

Pełna lista placeholderów serwera, kanału i bota jest na stronie placeholderów. Placeholdery kanału nie są wypełniane w powitaniach.

## Klasyczne komendy greet, bye i boost

Poprzedzają one multi powitania i znajdują się w module Administracja. Każda to jedna wiadomość, zapisana w konfiguracji serwera i przełączana z kanału, na którym uruchomisz komendę.

| Wiadomość | Uruchamia się, gdy | Placeholdery |
| --- | --- | --- |
| Bye | Członek wychodzi | Zestawy użytkownika, serwera i bota oraz placeholdery kanału. `%user%` wspomina członka, który wyszedł. |
| Boost | Członek zaczyna boostować albo boostuje ponownie | Zestawy użytkownika, kanału, serwera, bota i gifów |
| Powitanie w DM | Członek dołącza, wysyłane jako wiadomość prywatna | Zestawy użytkownika, kanału, serwera, bota i gifów |

Uruchomienie `bye` lub `boost` przełącza tę wiadomość i ustawia kanał na ten, na którym wpisałeś komendę. `byedel` i `boostdel` ustawiają czas samodzielnego usunięcia w sekundach; `boostdel` jest ograniczone do 600. Komendy wiadomości bez tekstu pokazują bieżącą wiadomość. `leavehook` opakowuje wiadomość bye w webhook z własną nazwą i awatarem, a `leavehook disable` go usuwa.

Powitania w DM wymagają ostrożności. Bot prosi o potwierdzenie przed ich włączeniem, chyba że jest zweryfikowanym botem, ponieważ masowe DM-y od niezweryfikowanych botów mogą skutkować oflagowaniem bota. Każdy członek może zablokować te DM-y dla siebie komendą `greetdmoptout` albo przełącznikiem **Powitalne DM-y** na własnej stronie profilu w panelu.

Nie ma klasycznej komendy powitania na kanale. Do powitań na kanałach użyj multi powitania.

## Ustawienia

Wszystko jest na stronie Powitania w panelu.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Typ powitania | Wszystkie powitania | Wszystkie powitania, Losowe powitanie lub Wyłączone |
| Dodaj nowe powitanie | | Wybierz kanał, potem kliknij **Dodaj powitanie** |
| Wiadomość powitalna | pusta | Kreator embedów dla jednego powitania. Obsługuje treść, do dziesięciu embedów i komponenty. |
| Usuń po | Nigdy | Podaj czas, na przykład `1m30s` lub `45s` |
| Webhook | Nie skonfigurowano | Nazwa webhooka i opcjonalny URL awatara |
| Witaj boty | wyłączone | Uruchamiaj także dla kont botów |
| Włączone | włączone | Wyłącz jedno powitanie bez usuwania |

Wiadomości bye, boost i powitania w DM nie są na tej stronie. Ustaw je komendami powyżej.

## Konfiguracja krok po kroku

1. Otwórz **Powitania** w panelu i zostaw **Typ powitania** na **Wszystkie powitania**.
2. W **Dodaj nowe powitanie** wybierz kanał powitalny i kliknij **Dodaj powitanie**.
3. Na nowej karcie otwórz **Wiadomość powitalną** i zbuduj swoją wiadomość, używając powyższych placeholderów. Zapisz ją.
4. Opcjonalnie ustaw **Usuń po**, dodaj nazwę i awatar **Webhooka** i włącz **Witaj boty**, jeśli chcesz ogłaszać dołączenia botów.
5. Powtórz dla pozostałych kanałów. Przełącz na **Losowe powitanie**, jeśli dodałeś kilka na ten sam kanał i chcesz urozmaicenia.
6. Aby ustawić pożegnanie, uruchom `byemsg Goodbye %user%, we will miss you` na wybranym kanale, a potem `bye`, aby je włączyć.
7. Aby ustawić wiadomość o boostach, uruchom `boostmsg Thanks for boosting, %user%!`, a potem `boost`.
8. Przetestuj komendami `byetest` i `boosttest`. Multi powitania mają podgląd: uruchom `multigreetmessage 1` i naciśnij **Podgląd**.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś). Komendy multi powitań są też dostępne jako `/multigreets add`, `/multigreets remove` i tak dalej.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `multigreetadd [#channel]` | `mgadd`, `mga` | Administrator | Dodaje powitanie dla kanału, domyślnie bieżącego |
| `multigreetremove <number or #channel>` | `mgrem`, `mgrm`, `mgr` | Administrator | Usuwa jedno powitanie według numeru albo każde powitanie na kanale po potwierdzeniu |
| `multigreetmessage <number> [message]` | `mgmsg`, `mgm` | Administrator | Ustawia tekst lub embed powitania; bez wiadomości oferuje podgląd albo surowy szablon |
| `multigreetdelete <number> <time or seconds>` | `mgdel`, `mgd` | Administrator | Czas samodzielnego usunięcia, na przykład `1m` lub `60`; `0` wyłącza |
| `multigreetdisable <number> <true or false>` | `mgdisable`, `mgdis` | Administrator | `true` wyłącza powitanie, `false` włącza |
| `multigreetgreetbots <number> <true or false>` | `multigreetbots`, `mggb` | Administrator | Czy to powitanie uruchamia się dla botów |
| `multigreetwebhook <number> [name] [avatar url]` | `mgwebhook`, `mghook`, `mgh` | Administrator | Tworzy webhook dla powitania; brak nazwy go usuwa |
| `multigreettype <multigreet, randomgreet or off>` | `mgtype`, `mgt` | Administrator | Zmienia typ powitań dla całego serwera |
| `multigreetlist` | `mglist`, `mgl` | Administrator | Przegląda stronami każde powitanie z jego ustawieniami |
| `bye` | | Zarządzanie serwerem | Przełącza wiadomość pożegnalną na tym kanale |
| `byemsg [text]` | | Zarządzanie serwerem | Pokazuje lub ustawia wiadomość pożegnalną |
| `byedel [seconds]` | | Zarządzanie serwerem | Czas samodzielnego usunięcia pożegnania, domyślnie 30 |
| `byetest [@user]` | | Zarządzanie serwerem | Wysyła wiadomość pożegnalną jako test |
| `leavehook [#channel] [name] [image url] [text]` | `byehook` | Zarządzanie serwerem | Wysyła pożegnania przez webhook albo `leavehook disable` |
| `boost` | | Zarządzanie serwerem | Przełącza wiadomość o boostach na tym kanale |
| `boostmsg [text]` | `boostmessage` | Zarządzanie serwerem | Pokazuje lub ustawia wiadomość o boostach |
| `boostdel [seconds]` | `boostdelete` | Zarządzanie serwerem | Czas samodzielnego usunięcia wiadomości o boostach, od 0 do 600, domyślnie 30 |
| `boosttest [@user]` | `testboost` | Zarządzanie serwerem | Wysyła wiadomość o boostach jako test |
| `greetdm` | | Zarządzanie serwerem | Przełącza powitanie w DM |
| `greetdmmsg [text]` | | Zarządzanie serwerem | Pokazuje lub ustawia tekst powitania w DM |
| `greetdmtest [@user]` | | Zarządzanie serwerem | Wysyła powitanie w DM jako test |
| `greetdmoptout` | `gdmoptout` | Nikt | Przestaje otrzymywać powitalne DM-y od tego bota gdziekolwiek |

## Wskazówki i pułapki

- `multigreetdelete` wymaga od bota uprawnienia Zarządzanie wiadomościami, a `multigreetwebhook` i `leavehook` wymagają Zarządzania webhookami.
- Numery powitań to pozycje na liście, więc usunięcie jednego przesuwa numery wszystkich po nim. Uruchom `multigreetlist` przed edycją.
- Opcja `off` w `multigreettype`, `/multigreets type` i przycisk **Wyłączone** w panelu ustawiają ten sam typ powitań, więc każda z nich wyłącza system bez usuwania Twoich powitań.
- Placeholdery zaproszeń czekają do pięciu sekund na przypisanie dołączenia, zanim powitanie zostanie wysłane, więc zapraszający jest poprawny nawet gdy dołącza kilka osób naraz.
- Powitanie w DM działa tylko wtedy, gdy członek zezwala na DM od członków serwera. Nieudane DM-y są ignorowane.
- Powitania ról to osobna funkcja, która uruchamia się po nadaniu roli, a nie przy dołączeniu.

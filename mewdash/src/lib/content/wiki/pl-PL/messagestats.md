---
title: Statystyki wiadomości
slug: messagestats
summary: Licz, ile wiadomości wysyła każdy członek na każdym kanale, a potem przeglądaj rankingi, zestawienia dla użytkowników i kanałów oraz wykresy najbardziej aktywnych godzin i dni.
icon: fa-envelope
category: Analytics
dashboard: /dashboard/messagestats
module: Utility
tags: [message stats, message count, activity, leaderboard, top users, analytics, busiest hours, activity graph, statystyki wiadomości, liczba wiadomości, aktywność, ranking, najaktywniejsi użytkownicy, analityka, najaktywniejsze godziny, wykres aktywności]
related: [xp, utility, statchannels]
---

## Co to robi

Gdy liczenie wiadomości jest włączone, bot zapisuje jeden licznik na członka na kanał za każdym razem, gdy człowiek opublikuje wiadomość spełniającą minimalną długość. Nic nie jest zapisywane o treści, tylko kto, gdzie i kiedy napisał. Liczniki są kolejkowane i zapisywane do bazy danych partiami, dzięki czemu na ruchliwych serwerach bot nie zwalnia.

Członkowie mogą sprawdzić swoje sumy poleceniem `usermessages`, zobaczyć, który kanał jest najruchliwszy, poleceniem `channelmessages`, albo sprawdzić cały serwer poleceniem `servermessages`. `topusers` wyświetla ranking dziesięciu najaktywniejszych członków z ich udziałem we wszystkich wiadomościach. `activitygraph` generuje wykres słupkowy z obrazem najbardziej aktywnych dni tygodnia lub godzin doby.

Panel pokazuje te same liczby na wykresach i pozwala personelowi włączać lub wyłączać liczenie, resetować liczniki oraz eksportować dane jako CSV lub JSON.

## Po co z tego korzystać

- Znajdź najaktywniejszych członków do nagród, ról lub rekrutacji moderatorów.
- Zobacz, które kanały są martwe, a które się rozwijają, zanim przeorganizujesz serwer.
- Wybierz godziny wydarzeń na podstawie wykresu najbardziej aktywnych godzin w twojej strefie czasowej.
- Wykrywaj boty i konta spamujące, porównując liczbę wiadomości z ich jakością.

## Co jest liczone

| Zasada | Zachowanie |
| --- | --- |
| Liczenie włączone | Nic nie jest zapisywane, dopóki nie włączysz `togglemsgcount` ani przełącznika w panelu |
| Boty | Nigdy nie są liczone |
| Wiadomości prywatne | Nigdy nie są liczone; tylko kanały serwera |
| Minimalna długość | Wiadomości krótsze niż **Minimalna długość wiadomości** znaków są pomijane; domyślnie 0, więc liczy się wszystko |
| Znaczniki czasu | Czasy wiadomości są przechowywane przez 90 dni, aby zasilać wykresy godzin i dni; sumy są przechowywane bezterminowo |

Minimalna długość przyjmuje wartości do 4098. Uruchomienie `minmsglength` bez liczby pokazuje bieżącą wartość.

## Wykresy aktywności

`activitygraph days` wymaga danych ze wszystkich siedmiu dni tygodnia i analizuje ostatnie cztery tygodnie. `activitygraph hours` wymaga danych ze wszystkich 24 godzin z ostatnich siedmiu dni. Dla wykresu godzinowego bot najpierw prosi o wybór strefy czasowej, oferując listę popularnych stref, akceptując dowolną nazwę strefy IANA i anulując, jeśli nie odpowiesz. Wykres jest publikowany jako PNG.

## Ustawienia

Strona Statystyk wiadomości ma dwie główne zakładki: **Statystyki** i **Zarządzanie**. W zakładce **Statystyki** są **Przegląd**, **Najaktywniejsi użytkownicy** i **Najaktywniejsze kanały**. W zakładce **Zarządzanie** są **Ustawienia** i **Eksportuj dane**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Włącz liczenie wiadomości | Wyłączone | Czy nowe wiadomości są zapisywane |
| Minimalna długość wiadomości | 0 | Suwak od 0 do 4098; najkrótsza wiadomość, która się liczy |
| Resetuj liczniki wiadomości | | **Zresetuj wszystkie liczniki serwera** usuwa po potwierdzeniu wszystkie zapisane liczniki serwera |
| Format | CSV | Pobranie CSV lub JSON załadowanych statystyk |
| Uwzględnij statystyki użytkowników | Włączone | Dodaje do eksportu wiersze najaktywniejszych użytkowników |
| Uwzględnij statystyki kanałów | Włączone | Dodaje do eksportu wiersze najaktywniejszych kanałów |
| Uwzględnij podział godzinowy | Wyłączone | Dodaje do eksportu wiersze najaktywniejszych godzin i dni |

Zakładka **Przegląd** pokazuje kafelki **Wiadomości dziennie**, **Wszystkie wiadomości**, **Ostatnia aktualizacja** i **Status**, najmniej aktywnego użytkownika i kanał, wykres **Aktywność w ciągu 24 godzin** oraz wykres **Trend tygodniowy**. Zakładka **Najaktywniejsi użytkownicy** wyświetla listę **Najaktywniejsi autorzy wiadomości**, a zakładka **Najaktywniejsze kanały** wyświetla sekcję **Najaktywniejsze kanały**.

> [!NOTE]
> Eksport jest tworzony w twojej przeglądarce ze statystyk już załadowanych na stronie. Daty początkowa i końcowa, które wpiszesz, są zapisywane w nagłówku pliku, ale nie filtrują wierszy.

## Przewodnik konfiguracji

1. Otwórz **Statystyki wiadomości** w panelu, przejdź do **Zarządzanie**, a potem do **Ustawienia**.
2. Włącz **Włącz liczenie wiadomości**.
3. Opcjonalnie ustaw **Minimalna długość wiadomości** na 5 albo wpisz na Discordzie `minmsglength 5`, aby ignorować jednoznakowe odpowiedzi.
4. Pozwól serwerowi rozmawiać przez dzień, a potem sprawdź pierwsze liczby w zakładce **Statystyki**.
5. Po tygodniu uruchom `activitygraph hours` i wybierz swoją strefę czasową, aby zobaczyć, kiedy serwer jest najbardziej ruchliwy.

## Komendy

Uruchamiaj je z prefiksem serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `usermessages [@user]` | `usermsg`, `umsg` | Nikt | Łączna liczba oraz najbardziej i najmniej aktywny kanał dla ciebie lub innego członka |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Nikt | Łączna liczba oraz najbardziej i najmniej aktywny członek na kanale |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg` | Nikt | Łączna liczba na serwerze z najbardziej i najmniej aktywnym członkiem oraz kanałem |
| `topusers` | `topu` | Nikt | Dziesięciu najaktywniejszych członków według liczby wiadomości, z procentami |
| `activitygraph [days or hours]` | `actgraph` | Nikt | Wykres słupkowy najbardziej aktywnych dni lub godzin; domyślnie dni |
| `minmsglength [number]` | `mmlength`, `minmlength` | Zarządzanie serwerem | Pokazuje lub ustawia minimalną długość wiadomości, która się liczy |
| `togglemsgcount` | `togglemessagecount` | Administrator | Włącza lub wyłącza liczenie |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Zarządzanie wiadomościami | Resetuje liczniki dla całego serwera, jednego członka, jednego kanału albo jednego członka na jednym kanale, po potwierdzeniu |

## Wskazówki i pułapki

- Liczenie zaczyna się dopiero od chwili włączenia. Wiadomości wysłane wcześniej nigdy nie są uzupełniane.
- Każda komenda statystyk i panel zgłaszają „disabled”, dopóki liczenie nie zostanie włączone, nawet jeśli istnieją stare dane.
- Liczniki są zapisywane partiami po maksymalnie 100 zdarzeń, więc suma może opóźniać się o kilka sekund względem czatu na żywo.
- Usunięcie kanału nie usuwa jego liczników. Jeśli chcesz się ich pozbyć, użyj `resetmessagecounts #channel` przed usunięciem kanału.
- Wykres godzinowy jest tylko tak dokładny, jak wybrana strefa czasowa. Zapisz strefę serwera poleceniem strefy czasowej w module Administracja, aby była spójna dla całego personelu.
- System XP ma własne śledzenie aktywności i nie korzysta z tych liczników.

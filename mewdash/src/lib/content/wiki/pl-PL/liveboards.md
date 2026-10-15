---
title: Tablice na żywo
slug: liveboards
summary: Przypnij ranking, wykres lub przegląd na kanale, a bot będzie go stale edytować. Może też wysyłać podsumowanie dnia, tygodnia lub miesiąca według harmonogramu.
icon: fa-thumbtack
category: Community
dashboard: /dashboard/liveboards
module: ServerStats
tags: [live boards, pinned leaderboard, pin leaderboard, auto updating, server report, weekly report, monthly report, digest, growth report, tablice na żywo, przypięty ranking, przypnij ranking, automatyczna aktualizacja, raport serwera, raport tygodniowy, raport miesięczny, podsumowanie, raport wzrostu]
related: [serverstats, invites, statchannels, statroles]
---

## Co to robi

Tablica na żywo to wiadomość, którą bot publikuje raz, przypina, a potem edytuje co określony interwał, dzięki czemu zawsze pokazuje aktualne liczby. Raport serwera to jednorazowy embed z wykresem wzrostu, publikowany codziennie, co tydzień lub co miesiąc, który podsumowuje, co wydarzyło się od poprzedniego.

## Tablice

| Tablica | Pokazuje |
| --- | --- |
| Ranking zaproszeń | Najlepszych zapraszających z liczbą zwykłych, opuszczonych i fałszywych dołączeń |
| Ranking wiadomości | Najaktywniejszych piszących |
| Ranking głosowy | Członków z największym czasem na kanałach głosowych |
| Najpopularniejsze gry | Najczęściej grane gry i aplikacje z liczbą graczy (wymaga śledzenia gier) |
| Wykres dołączeń, Wykres wyjść, Wykres wzrostu | Dołączenia i wyjścia dziennie |
| Wykres członków | Liczbę członków z godzinowych migawek |
| Wykres wiadomości | Wiadomości dziennie |
| Przegląd serwera | To samo podsumowanie co `serveractivity` |
| Analityka zaproszeń | Dołączenia, wyjścia, retencję, fałszywe dołączenia i źródła |

Każda tablica ma **okres** (ostatni dzień, tydzień, miesiąc lub cały czas; wykresy używają do 90 dni dla całego czasu), interwał odświeżania wynoszący co najmniej 5 minut, liczbę wierszy dla rankingów i przełącznik przypięcia. Serwer może mieć do 10 tablic. Usunięcie tablicy usuwa jej wiadomość. Jeśli ktoś usunie wiadomość ręcznie, bot publikuje nową przy następnym odświeżeniu.

## Raporty serwera

Ustaw kanał i częstotliwość, a bot opublikuje raport przy pierwszym wypadnięciu harmonogramu, potem codziennie o 00:00 UTC, co tydzień w poniedziałki albo pierwszego dnia każdego miesiąca. Raport zawiera:

- Dołączenia, wyjścia, wzrost netto i retencję za okres
- Wiadomości, czas na kanałach głosowych i aktywnych członków
- Liczbę członków i jej zmianę
- Najlepszych zapraszających, piszących, członków na głosowym i najaktywniejsze kanały
- Najlepsze kody zaproszeń z ich etykietami oraz najpopularniejsze gry, gdy śledzenie gier jest włączone
- Wykres dołączeń i wyjść

**Wyślij raport teraz** publikuje go od razu, nie zmieniając harmonogramu. Raporty wyłączają się same, jeśli bot straci uprawnienie do pisania na kanale.

## Komendy

Uruchamiaj je z prefiksem serwera (`.`, chyba że go zmieniłeś). Tablice działają też pod `/liveboard`, raporty pod `/serverreport`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `liveboardadd <#channel> <board> [range] [rows] [minutes]` | `pinboard`, `pinleaderboard` | Zarządzanie serwerem | Opublikuj i przypnij tablicę |
| `liveboardlist` | `liveboards` | Zarządzanie serwerem | Wszystkie tablice |
| `liveboardremove <id>` | `unpinboard` | Zarządzanie serwerem | Usuń tablicę i jej wiadomość |
| `liveboardrefresh` | | Zarządzanie serwerem | Odśwież teraz wszystkie tablice |
| `serverreportchannel [#channel]` | `reportchannel` | Zarządzanie serwerem | Ustaw kanał raportów i włącz raporty albo je wyłącz |
| `serverreportfrequency <Daily/Weekly/Monthly>` | `reportfrequency` | Zarządzanie serwerem | Jak często publikowane są raporty |
| `serverreportnow [frequency]` | `reportnow` | Zarządzanie serwerem | Opublikuj raport na bieżącym kanale |

## Wskazówki i pułapki

- Przypinanie wymaga uprawnienia Zarządzanie wiadomościami na kanale. Bez niego tablica nadal się publikuje, ale nie jest przypięta.
- Tablice edytują tę samą wiadomość, więc tablica na ruchliwym kanale szybko ucieka w przewijanie; umieść je na dedykowanym kanale statystyk albo polegaj na przypięciu.
- Rankingi respektują wykluczenia z zaproszeń i aktywności, więc ukryci lub ignorowani członkowie nigdy nie pojawiają się na przypiętej tablicy.
- Kanały statystyk to inny sposób pokazywania liczb na żywo: licznik w nazwie kanału zamiast wiadomości.

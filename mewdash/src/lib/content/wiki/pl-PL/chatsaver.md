---
title: Zapis czatu
slug: chatsaver
summary: Pobierz ostatnią historię kanału do panelu, czytaj ją tam i zachowuj nazwane migawki na później albo eksportuj transkrypcję HTML z Discorda za pomocą komendy.
icon: fa-folder
category: Security
dashboard: /dashboard/chatsaver
module: Utility
tags: [chat saver, chat log, save chat, transcript, export, archive, history, evidence, ticket transcript, zapis czatu, dziennik czatu, zapisz czat, transkrypcja, eksport, archiwum, historia, dowody, transkrypcja zgłoszenia]
related: [tickets, logging, auditlog]
---

## Co to robi

Zapis czatu ma dwie części. W panelu personel wybiera kanał i przedział czasu, a bot pobiera każdą wiadomość z tego okresu: tekst, autora, załączniki i embedy. Można je przeczytać na stronie i, jeśli warto je zachować, zapisać jako nazwany dziennik. Zapisane dzienniki są przechowywane w bazie danych bota, więc przetrwają usunięcie oryginalnych wiadomości.

Na Discordzie `savechat` wykonuje pełny eksport transkrypcji kanału z ostatnich kilku minut, godzin lub dni i daje link do pliku HTML wyglądającego jak Discord, z mediami.

Transkrypcje zgłoszeń też trafiają tutaj. Gdy zgłoszenie zostanie zamknięte na serwerze z ustawionym kanałem transkrypcji zgłoszeń, system zgłoszeń zapisuje rozmowę jako zapisany dziennik o nazwie `Ticket #<id> - <channel>`, więc pojawia się w **Zapisanych dziennikach** razem z resztą.

## Po co z tego korzystać

- Zachowanie dowodów kłótni lub złamania zasad, zanim ludzie usuną swoje wiadomości.
- Archiwizowanie kanału wydarzenia lub wątku ogłoszeń przed jego usunięciem.
- Przejrzenie, co działo się na kanale w nocy, bez przewijania Discorda.
- Czytanie starych transkrypcji zgłoszeń w jednym miejscu.

## Pobieranie wiadomości

Na zakładce **Pobierz wiadomości** wybierz **Kanał**, **Wartość czasu** i **Jednostkę czasu**, a potem kliknij **Wczytaj wiadomości**. Bot czyta kanał od najnowszej do najstarszej wiadomości i zatrzymuje się, gdy dojdzie do wiadomości starszych niż twój przedział albo zbierze 5000 wiadomości — co nastąpi pierwsze. Wiadomości są pokazywane od najstarszej na zakładce **Wyświetl wiadomości**.

| Jednostka czasu | Maksimum |
| --- | --- |
| Minuty | 4320 |
| Godziny | 72 |
| Dni | 3 |

Wszystkie trzy limity to ten sam okres trzech dni. Pobieranie niczego nie zapisuje; zamknij stronę, a dane znikną.

## Zapisywanie dziennika

Gdy wiadomości są wczytane, kliknij **Zapisz dziennik** na zakładce **Wyświetl wiadomości**. Dziennik nosi nazwę `<channel> - <today's date>` i jest zapisywany wraz z kanałem, osobą, która go zapisała, i liczbą wiadomości. Każdy zapisany dziennik zawiera tekst wiadomości, nazwę autora i awatar, znacznik czasu, linki do załączników oraz tytuły, opisy i miniatury embedów.

Linki do załączników i awatarów wskazują na CDN Discorda. Jeśli Discord usunie plik, link w zapisanym dzienniku przestanie działać, choć tekst zostanie.

**Eksportuj HTML**, obok **Zapisz dziennik**, pobiera wczytane wiadomości jako samodzielną transkrypcję HTML wygenerowaną w przeglądarce. Nic nie jest zapisywane w bocie.

## Zapisane dzienniki

Zakładka **Zapisane dzienniki** wyświetla wszystkie dzienniki serwera, od najnowszego, wraz z kanałem i liczbą wiadomości. Każdy wpis ma **Wyświetl dziennik**, **Zmień nazwę dziennika** i **Usuń dziennik**. Zmiana nazwy zmienia tylko etykietę. Usunięcie jest nieodwracalne i następuje od razu po kliknięciu; nie ma potwierdzenia.

Zmiany nazw i usunięcia są zapisywane w dzienniku audytu panelu.

## Komenda savechat

`savechat` działa inaczej niż panel. Uruchamia DiscordChatExporter na hoście bota, zapisuje plik HTML z mediami i odpowiada linkiem. W publicznym Mewdeko wysyła ci wiadomość prywatną z linkiem `cdn.mewdeko.tech`; na samodzielnie hostowanym bocie publikuje lokalną ścieżkę na kanale.

Okno jest ograniczone do trzech dni. Większe wartości są odrzucane. Eksport wymaga istnienia skonfigurowanego katalogu zapisu czatu bota, inaczej komenda zwróci błąd.

> [!NOTE]
> Eksporty `savechat` nie pojawiają się w **Zapisanych dziennikach**. To pliki na hoście, a nie wpisy w bazie danych.

## Ustawienia

Zapis czatu nie ma konfiguracji. Strona w panelu ma trzy zakładki: **Pobierz wiadomości**, **Zapisane dzienniki** i **Wyświetl wiadomości**.

| Kontrolka | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Kanał | brak | Kanał tekstowy do odczytu |
| Wartość czasu | 1 | Jak daleko wstecz pobrać wiadomości |
| Jednostka czasu | Godziny | Minuty, Godziny lub Dni |

## Przewodnik konfiguracji

1. Otwórz **Zapis czatu** w panelu.
2. Na zakładce **Pobierz wiadomości** wybierz **Kanał** i ustaw **Wartość czasu** oraz **Jednostkę czasu**, np. 6 godzin.
3. Kliknij **Wczytaj wiadomości** i poczekaj, aż pojawi się liczba wiadomości.
4. Przełącz się na **Wyświetl wiadomości**, aby przeczytać, co wróciło.
5. Kliknij **Zapisz dziennik**, aby go zachować. Pojawi się na zakładce **Zapisane dzienniki**.
6. Użyj **Zmień nazwę dziennika**, aby nadać mu sensowną nazwę, np. incydentu lub daty.

## Komendy

Uruchamiaj je z prefiksem serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `savechat <time> [#channel]` | | Zarządzanie wiadomościami | Eksportuje ostatni `<time>` kanału do HTML, np. `savechat 2h #general` |

## Wskazówki i pułapki

- Bot musi móc czytać kanał i jego historię wiadomości. Kanały, których nie widzi, zwracają komunikat „Channel not found”.
- Pobieranie zatrzymuje się na 5000 wiadomościach. Na bardzo ruchliwym kanale użyj krótszego przedziału.
- Edycje i usunięcia wiadomości, które nastąpiły przed pobraniem, są niewidoczne; bot czyta to, co jest na kanale w tej chwili. Do zapisu na żywo użyj funkcji logowania.
- Zapisane dzienniki przechowują nazwy autorów z chwili zapisu. Późniejsza zmiana nazwy użytkownika nie jest odzwierciedlana.
- Każdy z dostępem do panelu serwera może czytać zapisane dzienniki, w tym transkrypcje zgłoszeń. Odpowiednio ogranicz dostęp do panelu.
- `savechat` jest przeznaczony dla publicznego CDN bota. Osoby hostujące samodzielnie muszą ustawić ścieżkę zapisu czatu w credentials i skopiować pliki DiscordChatExporter obok bota.

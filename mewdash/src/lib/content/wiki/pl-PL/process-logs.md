---
title: Logi procesów
slug: process-logs
summary: Strona w panelu tylko dla właścicieli bota, która wyświetla procesy uruchomione przez pm2 na hoście bota i pozwala czytać, śledzić, filtrować i pobierać ich logi konsoli.
icon: fa-rectangle-code
category: Analytics
dashboard: /owner/process-logs
tags: [pm2, logs, console, stdout, stderr, tail, process, crash, stack trace, owner, logi procesów, konsola, ogon logu, proces, awaria, ślad stosu, właściciel]
related: [performance, analytics, leave-feedback]
---

## Co to robi

Logi procesów pokazują, co bot zapisuje do konsoli, prosto z plików logów, które trzyma pm2, bez otwierania powłoki na serwerze. Strona jest widoczna tylko dla właścicieli bota: pasek boczny ukrywa ją pozostałym, otwarcie adresu bezpośrednio odsyła osoby niebędące właścicielami na stronę główną panelu, a sam bot odrzuca żądania, jeśli zalogowane konto nie jest właścicielem.

Strona pyta wybraną instancję bota o tabelę procesów pm2. Wyświetlany jest każdy proces zarządzany przez pm2 na tym hoście, nie tylko bot, wraz ze statusem, pid, czasem działania, liczbą restartów, CPU i pamięcią oraz rozmiarem dwóch plików logów. Wybierz jeden, a strona wczyta ostatnie kilkaset linii jego stdout, a potem co kilka sekund będzie dopisywać nowe linie, dopóki **Śledzenie** jest włączone.

Linie zachowują kolory, które drukuje Serilog, a każda linia ma oznaczenie poziomu, dzięki czemu możesz ukryć szum. Linie kontynuacji, takie jak ślady stosu, pozostają przypięte do linii powyżej, więc ukrycie info nie zostawia osieroconych śladów.

## Po co z tego korzystać

- Bot się zrestartował lub uległ awarii, a ty chcesz zobaczyć ostatnią rzecz, jaką powiedział przed upadkiem, czyli po stronie stderr.
- Członek zgłasza, że komenda się nie udaje, a ty chcesz oglądać log na żywo, gdy próbuje ponownie.
- Chcesz przeszukać kilka tysięcy ostatnich linii pod kątem ID serwera lub wiadomości bez logowania przez SSH.
- Potrzebujesz pełnego pliku logu do zgłoszenia błędu i chcesz go pobrać.

## Sterowanie

| Kontrolka | Co robi |
| --- | --- |
| Karty procesów | Jedna na proces pm2 na hoście. Karta oznaczona **ten bot** to instancja odpowiadająca na żądanie. Kliknij jedną, aby czytać jej logi. |
| **stdout** / **stderr** | Przełącza między logiem wyjściowym procesu, gdzie trafia zwykłe logowanie, a logiem błędów, gdzie trafiają awarie i diagnostyka runtime. |
| **100** do **2k** | Ile linii wczytać przy otwarciu lub ponownym wczytaniu logu. Tryb śledzenia trzyma w stronie do 5000 linii, zanim zacznie usuwać najstarsze. |
| Pole filtra | Ukrywa każdą linię, której tekst nie zawiera wpisanego ciągu. Wielkość liter nie ma znaczenia. |
| **Śledzenie** / **Śledź** | Włącza i wyłącza aktualizacje na żywo. Gdy są włączone, strona co dwie sekundy odpytuje o nowe linie i przewija razem z nimi, chyba że przewinąłeś w górę. |
| **Zawijaj** | Zawija długie linie zamiast przewijania w bok. |
| **Kopiuj** | Kopiuje widoczne linie, bez kolorów, do schowka. |
| **Wczytaj ponownie** | Ponownie czyta koniec pliku. |
| **Pobierz** | Zapisuje cały plik logu tak, jak leży na dysku, wraz z kodami kolorów. Obok rozmiar to bieżący rozmiar pliku. |
| Znaczniki poziomów | **VRB**, **DBG**, **INF**, **WRN**, **ERR** i **FTL**, każdy z liczbą oznaczonych linii. Kliknij, aby ukryć lub pokazać dany poziom. |

Gdy podczas śledzenia przewiniesz w górę, nowe linie są wstrzymywane, a przycisk w prawym dolnym rogu pokazuje, ile czeka. Kliknij go, aby wrócić na dół i wznowić przewijanie razem z logiem.

> [!NOTE]
> Pojedynczy odczyt jest ograniczony do 1 MB. Jeśli żądane linie się nie mieszczą, strona informuje, że starsze linie zostały pominięte; pobierz plik, aby zobaczyć wszystko.

## Jak bot znajduje logi

Bot uruchamia `pm2 jlist` na własnym hoście i czyta ścieżki plików logów, które pm2 podaje dla każdego procesu. Robi to tylko wtedy, gdy demon pm2 jest już uruchomiony dla tego samego użytkownika, więc nigdy nie uruchomi go przypadkiem. Jeśli pm2 jest zainstalowany, ale nie można go odpytać, strona przechodzi na pliki w katalogu logów pm2 i to zaznacza. Jeśli pm2 w ogóle nie istnieje, strona to wyjaśnia zamiast pokazać pustą listę.

W panelu połączonym z kilkoma instancjami bota lista procesów należy do wybranej instancji, ponieważ każda widzi tylko swój host.

## Przewodnik konfiguracji

1. Uruchom bota pod pm2 na jego serwerze, np. `pm2 start dotnet --name mewdeko -- Mewdeko.dll`.
2. Zaloguj się do panelu kontem właściciela bota i otwórz **Logi procesów** z paska bocznego.
3. Wybierz proces oznaczony **ten bot** albo inny proces na hoście.
4. Zostaw **Śledzenie** włączone, aby oglądać log na żywo, albo wyłącz je i użyj filtra oraz znaczników poziomów, by przeszukać wczytane linie.
5. Po awarii przełącz się na **stderr**, aby przeczytać, co runtime wypisał przed upadkiem.

## Wskazówki i pułapki

- Logi są czytane z plików, więc proces uruchomiony poza pm2 nie ma ich tutaj. Wyjście konsoli samego bota pojawia się tylko wtedy, gdy bot działa pod pm2.
- pm2 rotuje lub obcina pliki, gdy uruchomisz `pm2 flush` albo użyjesz `pm2-logrotate`. Strona zauważa, że plik się skurczył, i sama ponownie wczytuje koniec.
- Filtr i znaczniki poziomów działają tylko na już wczytanych liniach. Wczytaj więcej linii albo pobierz plik, gdy szukasz dalej wstecz.
- Nic na tej stronie nie zmienia bota. Nie da się stąd restartować procesów ani czyścić logów; to robią komenda właściciela `restartinstance` i `pm2 flush` na serwerze.

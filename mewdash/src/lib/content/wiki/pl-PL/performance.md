---
title: Wydajność
slug: performance
summary: Strona w panelu tylko dla właścicieli bota pokazująca CPU, pamięć, czas działania, najwolniejsze metody oraz to, ile zdarzeń Discorda przetwarza każdy moduł i ile z nich kończy się błędem.
icon: fa-clock
category: Analytics
dashboard: /owner/performance
tags: [performance, metrics, cpu, memory, latency, monitoring, uptime, events, modules, owner, wydajność, metryki, cpu, pamięć, opóźnienie, monitoring, czas działania, zdarzenia, moduły, właściciel]
related: [analytics, leave-feedback, administration]
---

## Co to robi

Wydajność to strona monitorująca dla osoby prowadzącej bota. Jest widoczna tylko dla właścicieli bota: pasek boczny ukrywa ją pozostałym, a otwarcie adresu bezpośrednio odsyła osoby niebędące właścicielami na stronę główną panelu. Nie ma tu nic do skonfigurowania dla personelu serwera.

Strona czyta na żywo liczby z działającego procesu bota. Jedna zakładka pokazuje zasoby systemu, druga wypisuje metody zużywające najwięcej czasu CPU, a dwie rozkładają obsługę zdarzeń Discorda według typu zdarzenia i według modułu bota, każda z liczbą, średnim czasem wykonania i wskaźnikiem błędów. Wszystko odświeża się automatycznie, gdy strona jest otwarta.

Liczby zdarzeń i modułów pochodzą z wewnętrznego obsługiwacza zdarzeń bota, który zapisuje każde zdarzenie gateway, jakie wysyła. Czasy metod pochodzą z monitora wydajności, który opakowuje śledzone metody. Oba działają tylko w pamięci, więc resetują się przy restarcie bota, a metryki zdarzeń resetują się same co godzinę. Aby zobaczyć zapisaną historię tych samych liczb, użyj [Analityki](/wiki/analytics).

## Po co z tego korzystać

- Bot działa ospale i chcesz sprawdzić, czy przyczyną jest CPU, pamięć, czy jedna wolna metoda.
- Moduł rzuca błędami i chcesz zobaczyć wskaźnik błędów na moduł bez czytania logów.
- Chcesz potwierdzić, że pamięć jest stabilna po wdrożeniu, obserwując ją przez kilka minut.
- Potrzebujesz czasu działania i liczby wątków do pytania od wsparcia.

## Zakładki

| Zakładka | Sekcja | Co pokazuje | Odświeżanie |
| --- | --- | --- | --- |
| Przegląd | Zasoby systemu | **Użycie CPU**, **Użycie pamięci** (użyta i łączna), **Czas działania**, **Liczba wątków** oraz **Metody najbardziej obciążające CPU** ze średnim czasem | Co 5 sekund |
| Metody | Wydajność metod | Każda śledzona metoda z **Wywołania**, **Średni czas**, **Łączny czas** i **Ostatnio wykonana**; sortowalna po dowolnej kolumnie, z przyciskiem czyszczącym zebrane dane | Co 30 sekund |
| Zdarzenia | Metryki zdarzeń | **Łączne zdarzenia**, **Łączne błędy**, **Typy zdarzeń** i **Średni wskaźnik błędów**, a potem każdy typ zdarzenia Discorda z liczbą przetworzonych, błędami, czasem wykonania i wskaźnikiem błędów | Co 10 sekund |
| Moduły | Metryki modułów | **Aktywne moduły**, **Łączne zdarzenia**, **Łączne błędy** i **Średni wskaźnik błędów**, a potem każdy moduł z przetworzonymi zdarzeniami, błędami, czasem wykonania i wskaźnikiem błędów | Co 10 sekund |

Użycie CPU jest próbkowane przez pół sekundy przy każdym odświeżeniu Przeglądu i dotyczy tylko procesu bota, a nie całej maszyny. Pamięć to working set procesu. Łączna pamięć jest odczytywana z hosta na Windows i Linux, a na innych systemach pokazuje się jako 0.

> [!NOTE]
> Zakładka Metody jest pusta, dopóki nie uruchomią się śledzone metody. Pozwól botowi chwilę popracować, a potem wróć.

## Ustawienia

Nie ma ustawień. Jedyną akcją jest przycisk czyszczenia na zakładce Metody, który kasuje czasy metod. Metryki zdarzeń i modułów nie mogą być czyszczone ręcznie; resetują się co godzinę.

## Przewodnik konfiguracji

1. Zaloguj się do panelu kontem właściciela bota.
2. Otwórz **Wydajność** z paska bocznego. Pojawia się tylko dla właścicieli.
3. Zostaw **Przegląd** otwarty przez minutę, aby zobaczyć, jak ustabilizuje się CPU i pamięć.
4. Przejdź na **Moduły** i posortuj po błędach, by znaleźć coś, co źle się zachowuje, potem **Zdarzenia**, by zobaczyć, które typy zdarzeń są najbardziej obciążone.
5. Użyj **Metody**, aby znaleźć wolne metody, i wyczyść ją po poprawce, aby zmierzyć ponownie.

## Komendy

Strona Wydajność jest tylko w panelu; nie ma odpowiadającego modułu bota. Kilka komend właściciela obejmuje pokrewne zagadnienia na czacie. Uruchamiaj je z prefiksem serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `stats` | | Nikt | Wersja bota, komendy uruchomione co pięć sekund, pamięć, liczniki cache, shard i czas działania |
| `commandstats` | `cstats` | Właściciel bota | Najczęściej używana komenda, moduł, serwer i użytkownik |
| `shardstats` | | Właściciel bota | Status każdego sharda |

## Wskazówki i pułapki

- Strona sprawdza własność przez bota, więc konto będące właścicielem na jednej instancji, ale nie na innej, zostanie na drugiej przekierowane.
- Liczby dotyczą procesu. Na shardowanym bocie rozłożonym na kilka procesów widzisz proces, do którego połączony jest panel.
- Nic na tej stronie nie jest zapisywane. Jeśli potrzebujesz historii, zapisz liczby lub zrób zrzuty ekranu.
- Wysoki wskaźnik błędów jednego typu zdarzenia zwykle wskazuje na moduł nasłuchujący tego zdarzenia; następnie sprawdź zakładkę Moduły.

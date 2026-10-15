---
title: Analityka
slug: analytics
summary: Strona panelu tylko dla właściciela bota z zapisaną historią komend, zdarzeń gatewaya, opóźnień, błędów, wzrostu liczby serwerów, wykorzystania funkcji, użycia AI i muzyki, ruchu na stronie oraz regułami alertów przez webhook.
icon: fa-chart-simple
category: Analytics
dashboard: /owner/analytics
tags: [analytics, metrics, telemetry, commands, events, latency, errors, growth, alerts, shards, owner, analityka, metryki, telemetria, komendy, zdarzenia, opóźnienie, błędy, wzrost, alerty, shardy, właściciel]
related: [performance, leave-feedback, administration]
---

## Co robi

Analityka to strona z historią dla osoby, która prowadzi bota. Jest widoczna tylko dla właścicieli bota: pasek boczny ukrywa ją przed wszystkimi innymi, a otwarcie adresu bezpośrednio odsyła osoby niebędące właścicielami na stronę główną panelu. Nie ma tu nic do skonfigurowania dla staffu serwera.

Tam, gdzie [Wydajność](/wiki/performance) pokazuje działający proces na żywo i zapomina po restarcie, Analityka czyta to, co bot zapisał we własnej bazie danych. Każda działająca instancja rejestruje komendy, zdarzenia gatewaya, opóźnienie shardów, wywołania REST, czasy bazy danych, wskaźniki procesu, wyjątki, użycie funkcji, aktywność AI i muzyki oraz wyświetlenia stron panelu. Liczby są agregowane w pamięci co minutę, zapisywane co minutę, łączone w przedziały 5-minutowe i godzinowe oraz czyszczone według stałego harmonogramu, więc możesz spojrzeć na zeszły tydzień, porównać go z poprzednim i filtrować według instancji, sharda lub serwera.

Cotygodniowe podsumowanie można publikować na webhooku Discorda, a reguły alertów na dowolnej zapisanej metryce powiadamiają webhook po przekroczeniu progu.

## Do czego się przydaje

- Chcesz wiedzieć, czy skok błędów zaczął się przed wdrożeniem, czy po, a nie tylko co zawodzi teraz.
- Serwer zgłasza, że bot jest wolny, i chcesz zobaczyć opóźnienie jego komend, aktywność i zdarzenia bezpieczeństwa z danego zakresu dat.
- Chcesz zobaczyć, które funkcje serwery faktycznie konfigurują i używają oraz jak zmieniało się to przez miesiące.
- Potrzebujesz pinga na Discordzie, gdy opóźnienie shardów, odsetek błędów lub odpowiedzi REST 429 przekroczą limit, bez wpatrywania się w stronę.
- Chcesz poniedziałkowe podsumowanie wzrostu, komend, błędów i najpopularniejszych funkcji na kanale.

## Karty

| Karta | Co pokazuje |
| --- | --- |
| Przegląd | Kafelki **Serwery**, **Użytkownicy**, **Komendy / min**, **Zdarzenia gatewaya**, **Żądania REST / s**, **Nieobsłużone błędy** (przechodzi do grup wyjątków), **Najgorsze opóźnienie sharda** i **Odtwarzacze muzyki**; opóźnienie shardów z pasmami alertów; aktualnie uruchomione alerty; komendy i zdarzenia gatewaya na sekundę według rodzaju i typu; dzienne migawki serwerów; tempo REST; pamięć procesu |
| Komendy | Selekty rodzaju, modułu i wyniku; **Wywołania**, **Błędy**, **Czas trwania p95** i **p50**; wywołania wg modułu; błędy wg klasy; czas trwania p50, p95, p99; wywołania wg rodzaju; mapa cieplna godzina UTC × rozmiar serwera; **Najpopularniejsze komendy**, stronicowany **Dziennik wywołań**, **Najczęściej zawodzące komendy**, gdzie wiersz otwiera ostatnie próbki błędów |
| Zdarzenia | Zdarzenia gatewaya na sekundę wg typu; liczba w zakresie i tabela wg typu; zdarzenia na shard; handler p95 wg typu; błędy handlerów wg modułu i wg typu zdarzenia |
| Opóźnienie | **REST p95**, **REST 5xx**, **REST 429**, **Trafienia w ratelimit**, **BD p95**, **Błędy BD**, **Ponowne połączenia shardów**, **Nieobsłużone błędy**; opóźnienie i tempo REST wg trasy; trafienia w limit żądań wg trasy; p95 i błędy bazy danych wg operacji; CPU, RSS, wątki i GC gen. 2; tabela shardów ze stanem, opóźnieniem, szczytem, serwerami i ponownymi połączeniami; grupy nieobsłużonych wyjątków, gdzie wiersz otwiera ich wystąpienia; błędy wg typu |
| Serwery | **Serwery**, **Użytkownicy**, **Dołączył(a)**, **Odejścia**, **Saldo**; 30-dniowe migawki serwerów i użytkowników; dołączenia i odejścia dziennie; odpływ ze wskaźnikiem odejść oraz dołączenia i odejścia wg rozmiaru; retencja wg dnia dołączenia; dołączenia wg rozmiaru; tabele **Serwery, które odeszły** i **Ucichły**, gdzie wiersz otwiera kartę serwera |
| Serwery (szczegóły) | Selekt typu zdarzenia i minimalna liczba zdarzeń na godzinę; ID serwera otwiera **Kartę serwera**, mapę cieplną aktywności wg typu i godziny oraz stronicowany, filtrowalny dziennik **Zdarzeń bezpieczeństwa**; **Najaktywniejsze serwery wg zdarzeń**; **Nietypowa aktywność** oceniana względem tej samej godziny z poprzednich 14 dni |
| Funkcje | **Wykorzystanie funkcji** z liczbą skonfigurowanych i włączonych z nocnego spisu, aktywnymi serwerami, aktywnością i odsetkiem błędów; funkcje na serwer; rozmiar serwera a liczba użytych funkcji; dla wybranej funkcji **Użycie ustawień** z najnowszego spisu oraz seria skonfigurowanych lub włączonych ze spisu z 90, 180 lub 365 dni |
| AI | **Żądania**, **Tokeny wej.**, **Tokeny wyj.**, **Szac. koszt** według cen katalogowych dla modeli z wyceną; tabela wg modelu z niepowodzeniami, tokenami, p95 i kosztem; żądania, tokeny i p95 wg modelu; najaktywniejsze serwery wg użycia czatu AI |
| Muzyka | **Odtwarzacze**, **Rozpoczęte utwory**, **Błędy**; odtwarzacze wg węzła; rozpoczęte utwory wg źródła; błędy wg rodzaju; stan węzła; zakończone utwory wg powodu |
| Strona | **Wyświetlenia stron**, **Odwiedzający**, **Żądanie p95**, **5xx**; wyświetlenia wg trasy; czas trwania żądań; tabela wg trasy z odwiedzającymi, p95 i 5xx; 4xx i 5xx wg trasy; lejek logowanie → callback OAuth → panel z odpadaniem |
| Alerty | Uruchomione grupy; tabela reguł z włączaniem, testem, wyciszeniem na 1 godzinę i usuwaniem; stronicowany dziennik przejść stanów z wartością wobec progu i informacją, czy wysłano webhook; **Nowa reguła** i **Wyślij podsumowanie teraz** |
| Pipeline | Plakietka stanu; **Ostatni flush**, **Ostatni rollup**, **Ostatnia konserwacja**, **Oczekujące serie**, **Oczekujące wiersze**; ostatni błąd flusha, jeśli był; liczby wierszy i najnowszy wiersz na tabelę; zarejestrowane instancje z heartbeatem i ostatnią liczbą serwerów; czas flusha i wiersze na flush |

Stan pipeline'u to `healthy`, gdy ostatni flush ma co najwyżej 60 sekund, ostatni rollup co najwyżej 10 minut i nie ma błędu flusha; w przeciwnym razie `flush stale` i `rollup stale`, `error`, gdy flush się nie powiódł, oraz `disabled`, gdy analityka jest wyłączona w konfiguracji bota. Instancja, której ostatnia liczba serwerów jest starsza niż 3 minuty, jest oznaczona na żółto, a starsza niż 10 minut na czerwono.

> [!NOTE]
> Wszystko jest w UTC. Migawki, wiersze spisu i dzienne sumy są zapisywane raz na noc, więc karty Serwery i Funkcje są puste, dopóki bot nie działał co najmniej raz po 00:05 UTC.

### Pasek filtrów

Pasek nad kartami dotyczy każdej karty i jest zachowywany w adresie URL, więc przełączanie kart, przeładowanie lub udostępnienie linku zachowuje ten sam widok.

| Kontrolka | Co robi |
| --- | --- |
| Zakres | `15m`, `1h`, `6h`, `24h`, `7d`, `30d` albo własny początek i koniec w UTC do 31 dni |
| porównaj | Nakłada ten sam okres sprzed jednego okresu na wykresy i kafelki, które to obsługują |
| Bot | Jedna instancja, wybrana spośród instancji znanych pipeline'owi, albo wszystkie |
| Shard | Jedno ID sharda albo wszystkie |
| ID serwera | Ogranicza surowe tabele i widoki serwerów do jednego serwera; naciśnij Enter, aby zastosować |
| Odśwież | Wszystko przeładowuje się co 30 sekund, gdy karta jest widoczna; przycisk wymusza odświeżenie |
| Kopiuj link | Kopiuje bieżący adres URL ze wszystkimi filtrami |

Kafelki otwierają szczegóły z podziałami swojej metryki. Wykresy mogą zwijać mniejsze serie do **Inne**, przełączać sumę narastającą, być powiększane suwakami zakresu i izolować jedną serię prawym kliknięciem jej pozycji w legendzie.

## Ustawienia

Sama strona nie ma ustawień. Do skonfigurowania są tylko reguły alertów i trzy klucze konfiguracji bota.

### Reguły alertów

Każda reguła obserwuje jedną metrykę. Pola edytora to:

| Pole | Znaczenie |
| --- | --- |
| Nazwa, Opis, Waga, włączona | Etykieta oraz `info`, `warning` lub `critical`, co ustawia kolor i tytuł webhooka |
| Metryka, Filtry, Grupuj wg | Dowolna zapisana metryka, opcjonalne filtry etykiet i opcjonalna etykieta, według której każda wartość jest oceniana osobno, na przykład na `shard` |
| Agreg., Okno | `sum`, `avg`, `min`, `max`, `last`, `rate`, `count`, `p50`, `p95` lub `p99` z okresu od 1 minuty do 1 dnia |
| Komparator, Próg, Górny | `gt`, `gte`, `lt`, `lte`, `outside` (poniżej progu lub powyżej górnego), `pct_change` (procent względem tego samego okna sprzed jednej wartości bazowej), `deviates` (z-score względem średniej z ostatnich N dni), `nodata` (nic nie zgłoszono w oknie) |
| Wartość bazowa, Kierunek | Dla `pct_change` i `deviates`: wczoraj lub zeszły tydzień oraz `up`, `down` lub `both` |
| Przez | Jak długo naruszenie musi się utrzymać, zanim reguła się uruchomi; `immediately` pomija stan oczekiwania |
| Czas odnowienia | Minimalny odstęp między powiadomieniami o uruchomieniu |
| Powtarzaj | Powiadamiaj ponownie, dopóki jest uruchomiona, albo tylko raz |
| Min. próbek | Pomiń ocenę, gdy okno zawiera mniej próbek |
| URL webhooka, ID roli do wspomnienia, ID wątku | Webhook Discorda, opcjonalna rola pingowana przy uruchomieniu, opcjonalny wątek do publikowania |
| Cisza od, Cisza do | Okno w UTC, które może przechodzić przez północ, w którym nic nie jest wysyłane |
| powiadom po rozwiązaniu | Publikuj także, gdy grupa wróci do normy |

Wykres podglądu po prawej rysuje roboczy próg jako przerywane pasmo dla komparatorów bezwzględnych.

Reguły są oceniane co minutę. Każda grupa przechodzi z `ok` do `pending` (tylko gdy ustawiono Przez) do `firing` i z powrotem do `ok`; dziennik zdarzeń zapisuje przejście `firing` → `ok` jako `resolved`. Wyciszenie z tabeli uciszą regułę na 1 godzinę; API pozwala na do 30 dni. Wyciszone reguły i okna ciszy nadal zmieniają stan, tylko nic nie publikują. **Wyślij test** publikuje wiadomość testową na webhooku reguły.

### Klucze konfiguracji bota

Ustaw je w `bot.yml` albo komendą właściciela `config`. Wszystkie domyślnie mają wartości: włączone, 30 i puste.

| Klucz | Znaczenie |
| --- | --- |
| `analyticsEnabled` | `false` czyni kolektor nieaktywnym; karta Pipeline pokazuje `disabled` |
| `analyticsRetentionDays` | Liczba dni przechowywania surowych wierszy komend, wyświetleń stron i dziennika zdarzeń serwerów |
| `analyticsDigestWebhook` | Webhook Discorda, na którym publikowane jest cotygodniowe podsumowanie; puste wyłącza podsumowanie |

### Co jest przechowywane i jak długo

| Dane | Przechowywane |
| --- | --- |
| Przedziały 1-minutowe | 48 godzin |
| Przedziały 5-minutowe | 14 dni |
| Przedziały 1-godzinne | 400 dni |
| Wywołania komend, wyświetlenia stron, zdarzenia bezpieczeństwa serwerów | `analyticsRetentionDays` |
| Próbki błędów, godzinowa aktywność funkcji i zdarzeń na serwer | 90 dni |
| Zdarzenia alertów | 180 dni |
| Dzienne migawki, spis, dzienne sumy | Nie są czyszczone |

Surowe wiersze są zapisywane co 15 sekund, przedziały minutowe co minutę; przedziały 1-minutowe są łączone w 5-minutowe co 5 minut, a 5-minutowe w godzinowe, i czyszczenie działa co 6 godzin.

### Czego nigdy się nie przechowuje

- Treści wiadomości. Wiersze komend zawierają nazwę komendy, moduł, rodzaj, wynik, czasy oraz, przy porażce, klasę wyjątku i do 200 znaków jego komunikatu.
- ID użytkowników. Nic w analityce nie jest indeksowane tym, kto uruchomił komendę.
- Adresów IP klientów. Wyświetlenia stron zachowują hash odwiedzającego z IP i user agenta z solą zmienianą codziennie, więc odwiedzającego nie da się śledzić między dniami. Żądania do `/api/`, `/cdn/`, zasobów statycznych i samej strony Analityki nie są rejestrowane.

Serwery i użytkownicy, którzy zrezygnowali ze statystyk, są respektowani: ich komenda nadal liczy się w agregacie, ale surowy wiersz jest zapisywany bez ID serwera i rozmiaru serwera.

## Konfiguracja krok po kroku

1. Zaloguj się do panelu kontem właściciela bota i otwórz **Analitykę** z paska bocznego. Pojawia się tylko dla właścicieli.
2. Najpierw otwórz **Pipeline**. Plakietka powinna pokazywać `healthy`, a każda instancja powinna mieć świeży heartbeat; przestarzały flush oznacza, że bot nic nie zapisuje.
3. Wybierz zakres i, jeśli uruchamiasz więcej niż jedną instancję, bota na pasku filtrów. Zaznacz **porównaj**, aby zobaczyć poprzedni okres.
4. Przejdź do **Alertów**, naciśnij **Nowa reguła**, wybierz metrykę, na przykład `shard.latency` z `max` przez 5 minut, `gt` Twój limit, grupuj wg `shard`, wklej webhook i naciśnij **Wyślij test** w zapisanym wierszu.
5. Ustaw `analyticsDigestWebhook` w konfiguracji bota, a następnie naciśnij **Wyślij podsumowanie teraz**, aby zobaczyć, jak będzie wyglądać poniedziałkowy post.
6. Wróć po nocy, aby zobaczyć **Serwery**, **Funkcje** i serie ze spisu.

## Komendy

Strona Analityki jest tylko w panelu; nie ma odpowiadającego jej modułu bota. Komenda właściciela `config` zmienia trzy powyższe klucze, a kilka komend właściciela obejmuje pokrewne zagadnienia na czacie. Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `config bot analyticsEnabled false` | `conf` | Właściciel bota | Zatrzymuje zapisywanie analityki; `true` zaczyna ponownie |
| `config bot analyticsRetentionDays 14` | `conf` | Właściciel bota | Zmienia, jak długo przechowywane są surowe wiersze |
| `config bot analyticsDigestWebhook <url>` | `conf` | Właściciel bota | Gdzie trafia poniedziałkowe podsumowanie |
| `stats` | | Nikt | Wersja bota, komendy uruchamiane co pięć sekund, pamięć, liczby cache, shard i czas działania |
| `commandstats` | `cstats` | Właściciel bota | Najczęściej używana komenda, moduł, serwer i użytkownik |
| `shardstats` | | Właściciel bota | Stan każdego sharda |

## Wskazówki i pułapki

- Strona sprawdza własność przez bota, więc konto będące właścicielem w jednej instancji bota, a nie w innej, zostanie przekierowane w tej drugiej.
- Podsumowanie jest wysyłane w poniedziałki o 09:00 UTC lub później i obejmuje poprzednie siedem dni w porównaniu z siedmioma wcześniejszymi: serwery, komendy, błędy, zdarzenia, nowe i utracone serwery, wyświetlenia stron, tokeny AI, utwory muzyczne oraz pięć najpopularniejszych komend, błędów i funkcji.
- Serie z długiego zakresu pochodzą z przedziałów godzinowych, więc percentyle się wygładzają; zawęź zakres, aby zobaczyć szczegóły minutowe, które istnieją tylko dla ostatnich 48 godzin.
- Jeśli bufor kolektora w pamięci zapełni się przed flushem, dodatkowe surowe wiersze komend są w tym przedziale odrzucane, a agregaty nadal się liczą; znakiem tego jest rosnąca wartość **Oczekujące wiersze** w Pipeline.
- Reguły alertów wymagają adresu URL webhooka Discorda; wszystko inne jest odrzucane przy zapisie.
- Szacowany koszt AI obejmuje tylko modele ze znaną ceną katalogową, więc suma jest dolną granicą.

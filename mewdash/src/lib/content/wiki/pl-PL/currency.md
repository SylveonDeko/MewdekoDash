---
title: Waluta
slug: currency
summary: Ekonomia dla każdego serwera z portfelami i bankiem, dziennymi nagrodami, pracą i przestępstwami, sklepem z rolami i przedmiotami oraz ponad dwudziestoma grami na zakłady, wszystko do dostrojenia w panelu.
icon: fa-money-bill
category: Entertainment
dashboard: /dashboard/currency
module: Currency
tags: [currency, economy, money, coins, shop, balance, bank, daily, work, crime, rob, pay, gambling, blackjack, roulette, slots, leaderboard, waluta, ekonomia, pieniądze, monety, sklep, saldo, praca, przestępstwo, hazard, ranking]
related: [xp, administration]
---

## Co robi

Każdy członek ma portfel i, jeśli zostawisz bank włączony, saldo w banku. Waluta pochodzi z odebrania dziennej nagrody, komend `work` i `crime` z czasem odnowienia, wygrywania w grach albo płatności od innych członków. Wydaje się ją w Twoim sklepie na role, przedmioty kolekcjonerskie lub przedmioty tekstowe albo stawia w grach takich jak blackjack, ruletka, automaty, crash i keno.

Staff decyduje, jak działa ekonomia: czy hazard jest włączony, limity zakładów, przewaga kasyna, ile płacą praca i przestępstwa, czy istnieją rabunki, podatek od przelewów, odsetki w banku i bonusy za serie dziennych nagród. Każde z tych ustawień jest na karcie **Konfiguracja** albo jako klucz `economyset`, więc możesz dostroić ekonomię bez ruszania gier.

Bot zapisuje każdy wpływ i wypływ jako transakcję, więc członkowie widzą, gdzie poszły ich pieniądze, a karta **Analityka** pokazuje podaż pieniądza, gdzie się znajduje i które gry wypłacają więcej, niż zabierają.

## Do czego się przydaje

- Daj aktywnym członkom coś, na co mogą wydać zaangażowanie: kolorową rolę, własny tytuł albo trochę zabawy na kanale z grami.
- Prowadź kanał z grami, który pozostaje uczciwy, bo limity zakładów, dzienny limit strat i przewaga kasyna są egzekwowane za Ciebie.
- Nagradzaj członków przez `modifybalance` albo narzędzie **Dostosuj saldo** za pomoc i pozwól im wybierać ze sklepu.
- Obserwuj tabelę **Wyniki gier**, aby zobaczyć rzeczywisty zwrot każdej gry i dostrajać `payoutmultiplier` na podstawie danych, a nie domysłów.

## Salda, bank i przelewy

`cash` pokazuje Twój portfel oraz bank i wartość netto, jeśli coś zdeponowałeś. `bank` pokazuje to samo dla dowolnego członka i odbiera należne Ci odsetki. `deposit` i `withdraw` przenoszą pieniądze między nimi; jako kwota działa `all`. Pieniędzy w banku nie można ukraść, a **Pojemność banku** ogranicza, ile można przechowywać (0 oznacza bez limitu).

Odsetki są wypłacane, gdy członek uruchomi `bank`: jeśli minął odstęp od ostatniej wypłaty odsetek, saldo w banku zarabia **Odsetki (%)** jednokrotnie. Nie są wypłacane, gdy nikt nie sprawdza.

`pay` wysyła walutę z portfela innemu członkowi, pomniejszoną o **Podatek od przelewu (%)**, z **Minimalnym przelewem** i opcjonalnym czasem odnowienia. Botom nie można płacić.

`transactions` wypisuje ostatnie 250 wpisów dla Ciebie lub innego członka, po dziesięć na stronę. `cashleaderboard` szereguje członków według portfela plus banku.

## Zarabianie

| Komenda | Domyślnie | Co się dzieje |
| --- | --- | --- |
| `dailyreward` | Nieustawiona, dopóki staff nie uruchomi `setdaily` | Przyznaje dzienną kwotę raz na czas odnowienia. Przy włączonych seriach każde kolejne odebranie dodaje **Bonus za dzień** razy liczba dni serii ponad pierwszy, ograniczone przez **Maksymalny bonus**. Pominięcie całego okna odnowienia zeruje serię. |
| `work` | 50 do 250, co 30 minut | Losowa wypłata w skonfigurowanym zakresie, zawsze się udaje. |
| `crime` | 200 do 800, 45% szans powodzenia, co godzinę | Przy sukcesie wypłaca kwotę z zakresu przestępstwa. Przy porażce nalicza grzywnę od 100 do 500, ograniczoną do tego, co jest w portfelu. |
| `rob @user` | Wyłączone | Po włączeniu: 35% szans na zabranie do 20% portfela celu. Cele z mniej niż 100 są chronione. Porażka kosztuje 15% Twojego portfela. Jedna próba na godzinę. |

## Gry

Każdy zakład przechodzi te same kontrole: hazard musi być włączony, zakład musi mieścić się między **Minimalnym zakładem** a **Maksymalnym zakładem**, członek nie może w ciągu ostatnich 24 godzin osiągnąć **Dziennego limitu strat**, a czas odnowienia gry (jeśli jest) musi minąć. Stawka jest pobierana z góry. Wygrana to `stawka plus zysk`, a część z zyskiem jest skalowana przez **Mnożnik wypłat**, więc mnożnik 0,9 obcina każdą wygraną o dziesięć procent, a remis nadal zwraca całą stawkę.

| Gra | Jak płaci |
| --- | --- |
| `coinflip <bet> heads/tails` | 1 do 1 za poprawny typ |
| `highlow higher/lower [bet]` | Pokazywana jest liczba od 1 do 10; typujesz następną. 1 do 1, taka sama liczba zwraca stawkę. Domyślny zakład 100 |
| `spinwheel [bet]` | Ważone koło z segmentami od minus 10 procent do plus 30 procent zakładu. Domyślny zakład 10 |
| `blackjack <bet>`, potem `hit` i `stand` | Krupier dobiera do 17. 1 do 1 za wygraną, remis przy równym wyniku |
| `slot [bet]` | Dwa pasujące symbole płacą 2x. Trzy pasujące płacą 3x, winogrona 5x, siódemki 7x, diamenty 10x. Domyślny zakład 10 |
| `roulette <bet> <type>` | Liczba od 0 do 36 płaci 35 do 1. `red`, `black`, `even` lub `odd` płacą 1 do 1; zero przegrywa zakłady na kolor i parzystość |
| `rps <choice> [bet]` | Kamień, papier, nożyce, jaszczurka, Spock przeciwko botowi. 1 do 1, remisy zwracają stawkę. Zakład jest opcjonalny |
| `war <bet>` | Wyższa karta wygrywa 1 do 1. Remis pobiera drugą stawkę i rozgrywa jeszcze jedną kartę za podwójną wygraną |
| `craps <bet> [pass/dontpass/field/any]` | Pass i don't pass zgodnie z zasadami punktu 1 do 1. Field płaci 1 do 1 albo 2x przy 2 lub 12. Any seven płaci 4x |
| `scratchcard [bronze/silver/gold/diamond]` | Karty o stałym koszcie 10, 50, 200 lub 1000 z szansami wygranej 30, 25, 20 i 15 procent oraz zakresami nagród do 50, 200, 1000 i 5000 |
| `russianroulette <bet> [bullets]` | Od jednej do pięciu kul w sześciu komorach. Przeżycie płaci 1,2x, 1,5x, 2x, 3x lub 5x zysku zależnie od liczby kul |
| `baccarat <bet> [player/banker/tie]` | Gracz lub bankier płacą 1,95x, remis płaci 8x |
| `minesweeper <bet> [small/medium/large]` | 70, 60 lub 50 procent szans przeżycia za 1,5x, 2,5x lub 4x |
| `lottery [tickets]` | Bilety kosztują po 50, do 10. Więcej biletów zwiększa szansę wygranej (maks. 40%) i mnożnik nagrody |
| `crash <bet> [target]` | Wybierz cel wypłaty od 1,1x do 10x. Wygrywasz cel, jeśli punkt crashu jest na jego poziomie lub wyższy |
| `keno <bet> <numbers>` | Wybierz od 1 do 10 liczb z 80; losowanych jest 20. Wypłaty od 3x za jedną z jednej do 800x za pięć z pięciu |
| `plinko <bet> [rows]` | Od 5 do 10 rzędów. Trafienie w środek płaci 0,5x, brzegi płacą do 10x |
| `wheelfortune <bet> [classic/risky/balanced]` | Koła mnożników; ryzykowne waha się od 0,1x do 20x |
| `duckrace <bet>` | Pięć kaczek, Twoja jest losowa. Pierwsza płaci 4x, druga 2x, trzecia 1,2x |
| `bingo <bet> [small/large]` | 40% szans na 2x albo 25% szans na 3,5x |
| `diceduel @user <bet>` | Przeciwnik dostaje przyciski przyjęcia i odrzucenia; obaj muszą być w stanie pokryć zakład |
| `memory <bet> [easy/medium/hard]` | Powtórz sekwencję 4, 6 lub 8 za 1,5x, 2x lub 3x |
| `horserace <bet>` | Do dziesięciu członków dołącza w ciągu dziesięciu sekund; wolne miejsca zapełniają zawodnicy AI. Pula płaci 50, 30 i 20 procent trzem najlepszym |
| `triviachain <bet> [category]` | Odpowiadaj na pytania z OpenTDB po kolei; każda poprawna odpowiedź podnosi mnożnik o 0,5x. Kategorie: general, science, history, sports, entertainment |

> [!NOTE]
> `horserace` przyjmuje każdy dodatni zakład: pobiera stawkę bezpośrednio i nie stosuje wspólnych limitów zakładów ani mnożnika wypłat.

## Dzienne wyzwania

Każdy członek dostaje jedno losowe wyzwanie dziennie: zagraj w pięć gier, wygraj trzy, wydaj 500, zarób 300 albo zagraj trzy razy w wybraną grę. Nagroda to kwota bazowa plus do 50 dodatkowo. `dailychallenge` je pokazuje, `claimchallenge` wypłaca nagrodę, a `challengeleaderboard` szereguje dziesięć najlepszych osób według wyzwań ukończonych w ostatnich 30 dniach.

> [!WARNING]
> Gry nie zgłaszają obecnie postępów do trackera wyzwań, więc wyzwania pokazują postęp 0 i nie można ich jeszcze odebrać.

## Sklep

Przedmioty znajdują się na karcie **Sklep** albo pochodzą z `shopadditem` i `shopaddrole`. Każdy przedmiot ma **Nazwę**, **Cenę**, **Opis**, **Typ**, **Zapas** (puste lub -1 oznacza bez limitu), **Limit na użytkownika**, opcjonalną **Wymaganą rolę**, którą musi mieć kupujący, i **Kolejność sortowania**.

| Typ | Po zakupie |
| --- | --- |
| Rola | Bot dodaje rolę kupującemu. Domyślnie jedna na członka. |
| Przedmiot kolekcjonerski | Trafia do ekwipunku kupującego; jest zużywalny, więc `use` usuwa jedną sztukę. |
| Tekst | **Dostarczany tekst** jest wysyłany kupującemu w DM i ponownie przy `use`. |

`buy <name>` sprawdza, czy przedmiot jest włączony, czy kupujący ma wymaganą rolę, czy zostały zapasy, czy go stać i czy mieści się w limicie na użytkownika. Każda porażka po płatności jest automatycznie zwracana. `inventory` wypisuje, co członek posiada. `shoptoggle` ukrywa przedmiot bez usuwania czyichkolwiek kopii; `shopremove` usuwa go wraz ze wszystkimi kopiami.

## Placeholdery

Te placeholdery waluty są dostępne w odpowiedziach chat triggerów i w innych miejscach, które używają placeholderów triggerów.

| Placeholder | Wartość |
| --- | --- |
| `%currency.balance%` | Portfel użytkownika |
| `%currency.bank%` | Saldo banku użytkownika |
| `%currency.total%` | Portfel plus bank |
| `%targetuser.currency.balance%` | Portfel użytkownika docelowego |
| `%targetuser.currency.bank%` | Saldo banku użytkownika docelowego |
| `%currency.emote%` | Emotka waluty serwera |

## Ustawienia

Panel ma cztery karty: **Analityka**, **Konfiguracja**, **Sklep** i **Ranking**. Karta **Ranking** zawiera też **Dostosuj saldo**, które zasila lub obciąża członka z powodem zapisanym w księdze.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Włącz hazard | Włączone | Włącza lub wyłącza każdą grę na zakłady |
| Minimalny zakład | 1 | Najmniejsza stawka |
| Maksymalny zakład | 0 (bez limitu) | Największa stawka |
| Mnożnik wypłat | 1.0 | Skaluje tylko wygrane, od 0,1 do 5,0 |
| Dzienny limit strat | 0 (wyłączone) | Odcina członka po przegraniu tej kwoty w 24 godziny |
| Cooldown gry (sekundy) | 0 | Sekundy między zakładami członka |
| Włącz pracę | Włączone | Komenda `work` |
| Minimum / maksimum za pracę | 50 / 250 | Zakres wypłaty za pracę |
| Cooldown pracy | 1800 sekund | `workcooldown`, tylko komenda |
| Włącz przestępstwa | Włączone | Komenda `crime` |
| Minimum / maksimum za przestępstwo | 200 / 800 | Zakres wypłaty za przestępstwo |
| Szansa powodzenia przestępstwa (%) | 45 | Szansa, że przestępstwo się opłaci |
| Minimalna / maksymalna grzywna za przestępstwo | 100 / 500 | Grzywna przy porażce |
| Cooldown przestępstwa | 3600 sekund | `crimecooldown`, tylko komenda |
| Włącz bank | Włączone | `bank`, `deposit`, `withdraw` |
| Pojemność banku | 0 (bez limitu) | Najwięcej, ile członek może zdeponować |
| Odsetki (%) | 0 | Wypłacane co odstęp od salda w banku |
| Odstęp naliczania odsetek (godziny) | 24 | Jak często można odebrać odsetki |
| Włącz przelewy | Włączone | Komenda `pay` |
| Podatek od przelewu (%) | 0 | Pobierany od każdej płatności |
| Minimalny przelew | 1 | Najmniejsza płatność |
| Cooldown płatności | 0 | `paycooldown`, tylko komenda |
| Włącz rabunki | Wyłączone | Komenda `rob` |
| Szansa powodzenia (%) | 35 | Szansa, że rabunek się uda |
| Maksymalna kradzież (%) | 20 | Część portfela celu, którą może zabrać sukces |
| Grzywna za porażkę (%) | 15 | Część portfela rabusia tracona przy porażce |
| Chronione poniżej | 100 | Cele z mniejszą kwotą nie mogą zostać okradzione |
| Cooldown rabunku | 3600 sekund | `robcooldown`, tylko komenda |
| Włącz serie | Włączone | Kolejne dzienne odebrania dają bonus |
| Bonus za dzień | 0 | Dodawany za każdy kolejny dzień ponad pierwszy |
| Maksymalny bonus | 0 (bez limitu) | Limit bonusu za serię |

Kwota dziennej nagrody i jej czas odnowienia są ustawiane przez `setdaily`, a nie w panelu. `economyconfig` wypisuje każdy klucz z jego bieżącą wartością, a `economyreset` przywraca wszystkie wartości domyślne.

## Konfiguracja krok po kroku

1. Uruchom `setdaily 500 24h`, aby członkowie mieli co odbierać.
2. Otwórz **Walutę** w panelu i przejdź do **Konfiguracji**. Ustaw **Maksymalny zakład** i **Dzienny limit strat**, zanim otworzysz kanał z grami.
3. Włącz **Włącz rabunki** tylko wtedy, gdy Twoim członkom nie przeszkadza utrata pieniędzy z portfela; zostaw bank włączony, aby mogli je chronić.
4. W **Sklepie** dodaj kilka przedmiotów z rolami i jeden przedmiot kolekcjonerski. Ustaw **Wymaganą rolę** przy wszystkim, co ma być tylko dla członków.
5. Daj kilku członkom saldo startowe przez **Dostosuj saldo** lub `modifybalance`.
6. Po tygodniu sprawdź **Analitykę** i obniż **Mnożnik wypłat**, jeśli gry wypłacają więcej, niż zabierają.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `cash` | `$`, `$$`, `$$$`, `currency`, `cur` | Nikt | Twój portfel, bank i wartość netto |
| `bank [@user]` | | Nikt | Salda członka i odbiór Twoich odsetek |
| `deposit <amount/all>` | | Nikt | Z portfela do banku |
| `withdraw <amount/all>` | | Nikt | Z banku do portfela |
| `pay @user <amount>` | | Nikt | Wysyła walutę, pomniejszoną o podatek |
| `transactions [@user]` | `txs` | Nikt | Ostatnie 250 wpisów księgi |
| `cashleaderboard` | `cashlb`, `richest` | Nikt | Najbogatsi członkowie według wartości netto |
| `dailyreward` | `daily` | Nikt | Odbiera dzienną nagrodę |
| `work` | | Nikt | Zarabia wypłatę za pracę |
| `crime` | | Nikt | Ryzykowna wypłata albo grzywna |
| `rob @user` | | Nikt | Próba kradzieży z portfela |
| `dailychallenge` | `dc` | Nikt | Pokazuje dzisiejsze wyzwanie |
| `claimchallenge` | `claimch` | Nikt | Odbiera ukończone wyzwanie |
| `challengeleaderboard` | `chlb` | Nikt | Najlepsi w ukończonych wyzwaniach |
| `shop` | | Nikt | Przegląda sklep, osiem przedmiotów na stronę |
| `buy <item>` | | Nikt | Kupuje przedmiot |
| `inventory [@user]` | | Nikt | Przedmioty, które posiada członek |
| `use <item>` | | Nikt | Zużywa jeden przedmiot zużywalny |
| `coinflip <bet> <heads/tails>` | `flip` | Nikt | Zobacz Gry |
| `highlow <higher/lower> [bet]` | | Nikt | Zobacz Gry |
| `spinwheel [bet]` | `wheel` | Nikt | Zobacz Gry |
| `blackjack <bet>` | `bj` | Nikt | Zaczyna lub dołącza do blackjacka |
| `hit` | | Nikt | Dobiera kartę |
| `stand` | | Nikt | Kończy Twoją turę |
| `slot [bet]` | `slots` | Nikt | Zobacz Gry |
| `roulette <bet> <type>` | | Nikt | Zobacz Gry |
| `rps <choice> [bet]` | | Nikt | Zobacz Gry |
| `war <bet>` | | Nikt | Zobacz Gry |
| `craps <bet> [type]` | | Nikt | Zobacz Gry |
| `scratchcard [type]` | `scratch` | Nikt | Zobacz Gry |
| `russianroulette <bet> [bullets]` | `rroulette` | Nikt | Zobacz Gry |
| `baccarat <bet> [type]` | | Nikt | Zobacz Gry |
| `minesweeper <bet> [size]` | `mines` | Nikt | Zobacz Gry |
| `lottery [tickets]` | | Nikt | Zobacz Gry |
| `crash <bet> [target]` | | Nikt | Zobacz Gry |
| `keno <bet> <numbers>` | | Nikt | Zobacz Gry |
| `plinko <bet> [rows]` | | Nikt | Zobacz Gry |
| `wheelfortune <bet> [wheel]` | `wof` | Nikt | Zobacz Gry |
| `duckrace <bet>` | `duck` | Nikt | Zobacz Gry |
| `bingo <bet> [card]` | | Nikt | Zobacz Gry |
| `diceduel @user <bet>` | `dd` | Nikt | Wyzywa członka |
| `memory <bet> [difficulty]` | | Nikt | Zobacz Gry |
| `horserace <bet>` | `hr` | Nikt | Dołącza do wyścigu lub go zaczyna |
| `triviachain <bet> [category]` | `tchain` | Nikt | Zobacz Gry |
| `setdaily <amount> <time>` | | Administrator | Kwota dziennej nagrody i czas odnowienia, na przykład `setdaily 500 24h` |
| `modifybalance @user <amount> [reason]` | `modbal` | Właściciel bota przy globalnej walucie; w przeciwnym razie zgodnie z wyjątkiem uprawnień komendy | Dodaje lub odejmuje walutę; ujemne kwoty obciążają |
| `economyconfig` | | Administrator | Pokazuje każde ustawienie ekonomii |
| `economyset <setting> <value>` | | Administrator | Zmienia jedno ustawienie według klucza |
| `economyreset` | | Administrator | Przywraca wszystkie wartości domyślne |
| `economystats` | | Nikt | Wielkość i koncentracja podaży pieniądza |
| `economyflow [days]` | | Nikt | Gdzie waluta weszła do obiegu i go opuściła, domyślnie 7 dni |
| `gamestats [days]` | | Nikt | Zwrot dla gracza w każdej grze, domyślnie 7 dni |
| `shopadditem <price> <name>` | | Administrator | Dodaje zużywalny przedmiot kolekcjonerski z nieograniczonym zapasem |
| `shopaddrole <price> @role <name>` | | Administrator, bot potrzebuje Zarządzania rolami | Dodaje przedmiot z rolą, jeden na członka |
| `shopremove <name>` | | Administrator | Usuwa przedmiot i wszystkie kopie |
| `shopprice <price> <name>` | | Administrator | Zmienia cenę |
| `shopstock <stock> <name>` | | Administrator | Ustawia pozostały zapas |
| `shopdesc <name> \| <description>` | | Administrator | Ustawia opis |
| `shoptoggle <name>` | | Administrator | Pokazuje lub ukrywa przedmiot |

## Wskazówki i pułapki

- Najpierw ustaw **Maksymalny zakład**. Przy wartości 0 jeden szczęśliwy członek może w jedno popołudnie wyczerpać ekonomię.
- Dzienny limit strat liczy straty netto z poprzednich 24 godzin, więc członek, który wygra na początku, może grać dłużej.
- Przedmioty z rolami wymagają, by najwyższa rola bota była powyżej sprzedawanej roli oraz uprawnienia Zarządzanie rolami, inaczej zakup kończy się po płatności błędem nadania roli.
- Przedmioty tekstowe i `use` dostarczają treść w DM; członkowie z zamkniętymi DM zobaczą błąd, ale nadal będą właścicielami przedmiotu.
- Blackjack trzyma w pamięci jedną grę na członka; `hit` i `stand` działają dopiero po `blackjack`.
- Wyścigi konne czekają dziesięć sekund na innych członków, potem zapełniają stawkę zawodnikami AI i ruszają.
- Gry trivia chain wygasają po dziesięciu minutach bezczynności, a członek może mieć uruchomioną tylko jedną naraz.
- Gdy bot jest hostowany z globalną walutą, salda są wspólne dla każdego serwera, a `modifybalance` jest tylko dla właściciela.

---
title: Liczenie
slug: counting
summary: Zamień kanał w grę w liczenie, w której członkowie na zmianę wpisują kolejną liczbę, z reakcjami, seriami, rankingami, punktami zapisu i opcjonalnymi karami za zepsucie liczenia.
icon: fa-list-numeric
category: Community
dashboard: /dashboard/counting
module: Counting
tags: [counting, count, numbers, game, channel, leaderboard, streak, milestones, save point, liczenie, liczby, gra, kanał, ranking, seria, kamienie milowe, punkt zapisu]
related: [administration, xp]
---

## Co robi

Staff wybiera kanał i uruchamia `countingsetup`. Od tej chwili bot obserwuje każdą wiadomość na tym kanale. Jeśli wiadomość to następna oczekiwana liczba, bot reaguje ptaszkiem i zapisuje liczenie dla tego członka. Jeśli liczba jest błędna, bot reaguje krzyżykiem i domyślnie usuwa wiadomość dwie sekundy później, aby kanał pozostał czysty.

Bot przechowuje bieżącą liczbę, najwyższą kiedykolwiek osiągniętą liczbę, łączną liczbę zliczeń i to, kto liczył ostatni. Domyślnie ten sam członek nie może liczyć dwa razy z rzędu, więc gra wymaga co najmniej dwóch osób. Członkowie mogą sprawdzać własne statystyki, serie i dokładność, a dla każdego kanału jest osobny ranking.

Dla staffu dostępne są punkty zapisu, które pozwalają cofnąć liczenie po nieudanej serii, warstwa moderacji śledząca błędne liczby każdego członka w oknie czasowym i stosująca stopniowane kary, bany i timeouty w liczeniu oraz reguły ról określające, kto może brać udział. Liczenie może działać jednocześnie na kilku kanałach, każdy z własnymi ustawieniami.

## Po co z tego korzystać

- To mało wymagająca gra społecznościowa, która działa sama i daje członkom wspólny cel.
- Duże serwery mogą dodać czas odnowienia i regułę braku powtórzeń, aby jedna osoba nie mogła farmić liczenia.
- Staff może przywrócić liczenie z punktu zapisu zamiast kłócić się o to, kto je zepsuł.
- Powtarzający się winowajcy, którzy celowo psują liczenie, mogą być automatycznie wyciszani lub banowani w liczeniu.

## Jak sprawdzane jest liczenie

Gdy członek pisze na kanale liczenia, bot wykonuje te sprawdzenia w kolejności:

1. Członkowie zbanowani w liczeniu są całkowicie ignorowani.
2. Członkowie z zablokowaną rolą, bez jednej z wymaganych ról lub z ignorowaną rolą są pomijani. Wiadomości od ról ignorowanych są usuwane, jeśli tego zażądałeś.
3. Jeśli wiadomość wygląda na poprawną liczbę, bot sprawdza, czy może na nią zareagować. Jeśli reakcja się nie powiedzie, bot uznaje, że członek go zablokował, usuwa wiadomość i wysyła krótkie ostrzeżenie, które znika po pięciu sekundach.
4. Członek, który nadal ma aktywny **Czas odnowienia**, zostaje odrzucony.
5. Jeśli **Zezwalaj na powtarzających się użytkowników** jest wyłączone, a ten sam członek liczył ostatni, wiadomość jest odrzucana.
6. Tekst jest parsowany według wzorca kanału. Wszystko, co nie jest liczbą, jest obsługiwane przez reguły dla nie-liczb opisane niżej.
7. Liczba musi być równa bieżącej liczbie plus **Krok**. Błędna liczba liczy się jako błąd tego członka, a jeśli **Zeruj licznik przy błędzie** jest włączone, kanał wraca do liczby początkowej.
8. Jeśli ustawiono **Maksymalną liczbę** i liczba ją przekroczy, liczenie się zatrzymuje, a staff dostaje powiadomienie.

Poprawne liczenie aktualizuje kanał, statystyki i serię członka, uruchamia jego czas odnowienia, sprawdza kamienie milowe i zapisuje zdarzenie w logu.

Udane liczenia dostają reakcję **Emotka sukcesu** (domyślnie ptaszek), a porażki **Emotka błędu** (domyślnie krzyżyk). Obie mogą być standardowym emoji lub własną emotką.

## Wzorce liczenia

Wzorzec decyduje, jak członkowie muszą zapisywać liczby. Bot parsuje te wzorce:

| Wzorzec | Członkowie wpisują |
| --- | --- |
| Normal | Zwykłe cyfry: `1`, `2`, `3`. Przy **Podstawie systemu liczbowego** innej niż 10 cyfry są odczytywane w tej podstawie. |
| Roman | Cyfry rzymskie: `I`, `II`, `III`, `IV` |
| Binary | `1`, `10`, `11`, `100` |
| Hexadecimal | `1` do `9`, potem `A`, `B`, `C` |
| Words | Słowa zapisane tekstem, takie jak `twenty-one` lub `one hundred and five` |
| Ordinal | `1st`, `2nd`, `3rd`, `4th` |
| Fibonacci | Ciąg Fibonacciego: `1`, `1`, `2`, `3`, `5`, `8` |
| Primes | Tylko liczby pierwsze: `2`, `3`, `5`, `7`, `11` |

Normal jest domyślny. Wzorzec ustawia się w panelu; nie ma do tego komendy.

> [!WARNING]
> Lista rozwijana **Wzorzec liczenia** w panelu obecnie zawiera Kolejne, Pomijaj wielokrotności, Fibonacci, Liczby pierwsze i Potęgi dwójki, a jej wartości nie pokrywają się z powyższą listą wzorców bota. Na razie bezpiecznie jest wybierać z panelu tylko Kolejne (Normal).

## Kamienie milowe

Bot zapisuje kamień milowy przy pierwszym wylądowaniu liczenia na wielokrotności 100, 500, 1000, 5000 lub 10000. Kamienie milowe są widoczne w karcie **Statystyki** i w `countingstatus`.

Karta **Zarządzanie** w panelu oraz `countingmilestones` pozwalają zapisać własną listę liczb będących kamieniami milowymi dla każdego kanału, ta sama karta i `countingmilestonemessage` zapisują wiadomość o kamieniu milowym, a `countingmilestonechannel` zapisuje kanał ogłoszeń o kamieniach milowych. Te wartości są zapisywane, ale bot nie wysyła jeszcze ogłoszenia o kamieniu milowym, więc traktuj je jako zarezerwowane na przyszłą wersję.

## Statystyki i rankingi

Każdy członek ma statystyki dla każdego kanału: wkład, bieżącą serię, najwyższą serię, dokładność, błędy, łączną liczbę zliczonych liczb i ostatni wkład. `countingstats` pokazuje je wraz z pozycją członka.

`countingleaderboard` i karta **Ranking** sortują według jednego z czterech typów:

| Typ | Ranking według |
| --- | --- |
| `contributions` | Liczby poprawnych zliczeń (domyślnie) |
| `streak` | Najwyższej serii |
| `accuracy` | Poprawnych zliczeń jako procentu |
| `totalnumbers` | Łącznej liczby zliczonych liczb |

Komenda pokazuje czołową dwudziestkę, po dziesięć na stronę.

## Punkty zapisu

`countingsave` zapisuje bieżącą liczbę z opcjonalnym powodem i daje ci ID zapisu. `countingrestore <id>` po potwierdzeniu przywraca kanał do tej liczby. `countingreset` ustawia liczenie bezpośrednio na dowolną liczbę, po potwierdzeniu, domyślnie na 0. Wszystkie trzy są też dostępne w karcie **Zarządzanie**.

## Moderacja

Moderacja liczenia jest wyłączona, dopóki jej nie włączysz, albo dla kanału przez `countmodenable true`, albo dla całego serwera przez `countmoddefaults true`. Ustawienia kanału nadpisują domyślne ustawienia serwera; `countmodreset` przywraca kanałowi wartości domyślne.

Gdy moderacja jest włączona, każda błędna liczba jest zapisywana przy członku i dodawana do jego licznika błędnych liczb w **oknie czasowym** (domyślnie 24 godziny, od 1 do 168). Stopniowane kary uruchamiają się, gdy licznik członka osiągnie dokładną wartość: `countmodpunish 3 Mute 30` wycisza na 30 minut przy trzeciej błędnej liczbie. Stopnie ustawione z kanałem dotyczą tego kanału; stopnie ustawione bez kanału to domyślne wartości serwera, a stopnie kanału mają pierwszeństwo. `Softban`, `Kick` i `RemoveRoles` nie przyjmują czasu trwania, a czas trwania jest ograniczony do 49 dni. `AddRole` wymaga roli.

Dwie dodatkowe reguły działają tylko przy włączonej moderacji:

- **Nie-liczby**: `countmodnonnumbers` decyduje, czy wiadomości czatu na kanale są usuwane (domyślnie tak) i czy liczą się jako naruszenie (domyślnie nie).
- **Edycje**: `countmodedits` decyduje, czy edycja wiadomości na kanale ją usuwa (domyślnie tak) i czy liczy się jako naruszenie (domyślnie nie).

Reguły ról: **Wymagane role** oznaczają, że członek potrzebuje co najmniej jednej z nich, aby liczyć, **Zbanowane role** blokują członków posiadających którąkolwiek z nich, a `countmodignore` pomija członków z wymienionymi rolami i opcjonalnie usuwa ich wiadomości.

`countingban`, `countingtimeout` i `countingunban` blokują pojedynczego członka na kanale, na stałe lub na określony czas. Karta **Zarządzanie** ma te same kontrolki według ID użytkownika oraz przycisk **Wyczyść dane kanału**, który odpowiada `countingdisable` z czyszczeniem.

## Ustawienia

Panel ma pięć kart: **Kanały**, **Konfiguracja**, **Statystyki**, **Ranking** i **Zarządzanie**. Najpierw wybierz kanał w **Kanały**; pozostałe karty działają na tym kanale.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Liczba początkowa | 1 | Liczba, od której zaczyna się liczenie, ustawiana przy konfiguracji |
| Krok | 1 | O ile zwiększa się każde liczenie; musi być dodatni |
| Wzorzec liczenia | Normal | Jak zapisywane są liczby, patrz wyżej |
| Podstawa systemu liczbowego | 10 | Podstawa używana przez wzorzec Normal |
| Czas odnowienia (sekundy) | 0 | Oczekiwanie między dwoma liczeniami tego samego członka, od 0 do 300 |
| Maksymalna liczba | 0 (bez limitu) | Liczenie zatrzymuje się po jej przekroczeniu |
| Emotka sukcesu | ptaszek | Reakcja na poprawne liczenie |
| Emotka błędu | krzyżyk | Reakcja na błędne liczenie |
| Zezwalaj na powtarzających się użytkowników | Wyłączone | Pozwala jednemu członkowi liczyć dwa razy z rzędu |
| Zeruj licznik przy błędzie | Wyłączone | Błędna liczba resetuje kanał do początku |
| Usuwaj błędne wiadomości | Włączone | Usuwa błędne liczby po dwóch sekundach |
| Włącz osiągnięcia | Włączone | Zapisana flaga widoczna w `countingconfig` |
| Włącz rywalizacje | Włączone | Zapisana flaga widoczna w `countingconfig` |
| Wymagane role | brak | Członkowie potrzebują jednej z nich, aby liczyć |
| Zbanowane role | brak | Członkowie z tymi rolami nie mogą liczyć |

> [!NOTE]
> Komenda `countingfailurethreshold` zapisuje wartość od 1 do 10 (domyślnie 3), a `countmodthreshold` zapisuje próg błędnych liczb, ale kary uruchamiają się wyłącznie ze stopni ustawionych przez `countmodpunish`.

## Konfiguracja krok po kroku

1. Utwórz kanał i nadaj botu na nim uprawnienia Wyświetlanie kanału, Wysyłanie wiadomości, Dodawanie reakcji, Zarządzanie wiadomościami i Czytanie historii wiadomości.
2. Otwórz **Liczenie** w panelu, wybierz kanał w sekcji **Skonfiguruj nowy kanał do liczenia**, ustaw **Liczbę początkową** i **Krok** i zapisz.
3. W **Konfiguracja** ustaw **Czas odnowienia**, jeśli chcesz spowolnić grę, i wybierz emotki.
4. Opcjonalnie dodaj **Wymagane role** lub **Zbanowane role**.
5. Jeśli chcesz automatycznych kar, uruchom `countmodenable true` na kanale i dodaj stopnie przez `countmodpunish`.
6. Wyślij `1` z jednego konta i `2` z drugiego, aby sprawdzić, czy reakcje działają.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, o ile go nie zmieniono).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `countingsetup [#channel] [start] [increment]` | `csetup`, `countsetup` | Zarządzanie kanałami | Rozpoczyna liczenie na kanale |
| `countingstatus [#channel]` | `cstatus`, `countstatus` | Brak | Bieżąca liczba, rekord, sumy i aktywne reguły |
| `countingconfig [#channel]` | `cconfig`, `countconfig` | Zarządzanie kanałami | Pokazuje konfigurację kanału |
| `countingreset [#channel] [number] [reason]` | `creset`, `countreset` | Zarządzanie wiadomościami | Resetuje liczenie, domyślnie do 0, z potwierdzeniem |
| `countingstats [@user] [#channel]` | `countstats` | Brak | Statystyki liczenia członka i jego pozycja |
| `countingleaderboard [type] [#channel]` | `cleaderboard`, `countleaderboard`, `clb` | Brak | Czołowa dwudziestka według contributions, streak, accuracy lub totalnumbers |
| `countingsave [#channel] [reason]` | `csave`, `countsave` | Zarządzanie wiadomościami | Tworzy punkt zapisu |
| `countingrestore <saveId> [#channel]` | `crestore`, `countrestore` | Zarządzanie wiadomościami | Cofa do punktu zapisu |
| `countingdisable [#channel] [purge] [reason]` | `cdisable`, `countdisable` | Zarządzanie kanałami | Zatrzymuje liczenie; `true` dodatkowo czyści wszystkie dane |
| `countinglist` | `clist`, `countlist` | Zarządzanie kanałami | Wyświetla aktywne kanały liczenia |
| `countingban <@user> [#channel] [duration] [reason]` | `cban`, `countban` | Zarządzanie wiadomościami | Banuje członka w liczeniu, na stałe, chyba że podano czas |
| `countingunban <@user> [#channel] [reason]` | `cunban`, `countunban` | Zarządzanie wiadomościami | Zdejmuje bana w liczeniu |
| `countingtimeout <@user> <duration> [#channel] [reason]` | `ctimeout`, `counttimeout` | Zarządzanie wiadomościami | Tymczasowy ban w liczeniu |
| `countingcooldown [#channel] [seconds]` | `ccooldown`, `countcooldown` | Zarządzanie kanałami | Pokazuje lub ustawia czas odnowienia, od 0 do 300 |
| `countingmilestones [#channel] [50,100,...]` | `cmilestones`, `countmilestones` | Zarządzanie kanałami | Pokazuje, ustawia lub `-` resetuje własne liczby kamieni milowych |
| `countingsuccessmessage [#channel] [text]` | `csuccessmessage`, `countsuccessmessage` | Zarządzanie kanałami | Zapisuje szablon sukcesu, `-` resetuje |
| `countingfailuremessage [#channel] [text]` | `cfailuremessage`, `countfailuremessage` | Zarządzanie kanałami | Zapisuje szablon porażki, `-` resetuje |
| `countingmilestonemessage [#channel] [text]` | `cmilestonemessage`, `countmilestonemessage` | Zarządzanie kanałami | Zapisuje szablon kamienia milowego, `-` resetuje |
| `countingmilestonechannel [#counting] [#target]` | `cmilestonechannel`, `countmilestonechannel` | Zarządzanie kanałami | Zapisuje kanał kamieni milowych, brak czyści |
| `countingfailurechannel [#counting] [#target]` | `cfailurechannel`, `countfailurechannel` | Zarządzanie kanałami | Zapisuje kanał logów porażek, brak czyści |
| `countingfailurethreshold [#channel] [1-10]` | `cfailurethreshold`, `countfailurethreshold` | Zarządzanie kanałami | Pokazuje lub ustawia próg porażek |
| `countmodshow [#channel]` | `cmshow`, `countmoderationshow` | Zarządzanie kanałami | Pokazuje konfigurację moderacji i domyślne ustawienia serwera |
| `countmoddefaults <on/off> [threshold] [hours] [punishment] [minutes] [@role]` | `cmdefaults`, `countmoderationdefaults` | Administrator | Domyślne ustawienia moderacji dla całego serwera |
| `countmodenable <on/off> [#channel]` | `cmenable`, `countmoderationenable` | Zarządzanie kanałami | Włącza lub wyłącza moderację dla kanału |
| `countmodthreshold <1-100> [#channel]` | `cmthreshold`, `countmoderationthreshold` | Zarządzanie kanałami | Ustawia próg błędnych liczb kanału |
| `countmodwindow <1-168> [#channel]` | `cmwindow`, `countmoderationwindow` | Zarządzanie kanałami | Godziny, przez które błędna liczba pozostaje w zapisie |
| `countmodpunishment <action> [minutes] [@role] [#channel]` | `cmpunishment`, `countmoderationpunishment` | Zarządzanie kanałami | Ustawia domyślną karę kanału |
| `countmodpunish <count> <action> [minutes] [@role] [#channel]` | `cmpunish`, `countmoderationpunish` | Zarządzanie kanałami | Kara przy dokładnej liczbie błędów; brak kanału oznacza ustawienie domyślne serwera |
| `countmodunpunish <count> [#channel]` | `cmunpunish`, `countmoderationunpunish` | Zarządzanie kanałami | Usuwa stopień |
| `countmodpunishlist [#channel]` | `cmpunishlist`, `countmoderationpunishlist` | Zarządzanie kanałami | Wyświetla stopnie |
| `countmodignore <delete> [#channel] [@roles...]` | `cmignore`, `countmoderationignore` | Zarządzanie kanałami | Role, które bot ignoruje, opcjonalnie usuwając ich wiadomości |
| `countmodrequired [#channel] [@roles...]` | `cmrequired`, `countmoderationrequired` | Zarządzanie kanałami | Role wymagane do liczenia |
| `countmodbanned [#channel] [@roles...]` | `cmbanned`, `countmoderationbanned` | Zarządzanie kanałami | Role, które nie mogą liczyć |
| `countmodnonnumbers <punish> [delete] [#channel]` | `cmnonnumbers`, `countmoderationnonnumbers` | Zarządzanie kanałami | Reguły dla czatu na kanale |
| `countmodedits <punish> [delete] [#channel]` | `cmedits`, `countmoderationedits` | Zarządzanie kanałami | Reguły dla edytowanych wiadomości |
| `countmodreset [#channel]` | `cmreset`, `countmoderationreset` | Zarządzanie kanałami | Kanał wraca do ustawień domyślnych serwera |
| `countmodclear <@user> [#channel]` | `cmclear`, `countmoderationclear` | Zarządzanie wiadomościami | Czyści błędne liczby członka |
| `countmodclearall [#channel]` | `cmclearall`, `countmoderationclearall` | Zarządzanie wiadomościami | Czyści błędne liczby wszystkich |

## Wskazówki i pułapki

- Bot potrzebuje na kanale uprawnienia Dodawanie reakcji. Bez niego nic nie dostaje ptaszka ani krzyżyka, a poprawne liczenia są pomijane przez test blokady bota.
- Usuwanie błędnych liczb i czatu niebędącego liczbami wymaga uprawnienia Zarządzanie wiadomościami.
- Członkowie, którzy zablokowali bota, nie mogą liczyć: ich liczba jest usuwana i wysyłane jest ostrzeżenie.
- Przy domyślnej regule braku powtórzeń członek piszący dwa razy z rzędu zostaje odrzucony, zanim liczba w ogóle zostanie odczytana, a to odrzucenie nie liczy się jako błąd.
- **Zeruj licznik przy błędzie** resetuje do liczby początkowej, więc przy starcie od 1 następną oczekiwaną liczbą znów jest 1.
- Kary moderacji używają tych samych akcji co system ostrzeżeń (Mute, Ban, Kick, AddRole itd.), więc bot potrzebuje odpowiednich uprawnień Discorda i roli wyciszenia.
- `countingdisable` z czyszczeniem usuwa statystyki, bany i punkty zapisu dla tego kanału i nie można tego cofnąć. Wyłączenie bez czyszczenia zachowuje dane.

---
title: Patreon
slug: patreon
summary: Połącz kampanię Patreon, nadawaj wspierającym role na Discordzie odpowiadające ich poziomowi i publikuj miesięczne podziękowanie z aktualnymi liczbami wspierających i przychodów.
icon: fa-heart
category: Community
dashboard: /dashboard/patreon
module: Patreon
tags: [patreon, supporters, patrons, donations, premium, tier roles, role sync, announcement, oauth, wspierający, patroni, darowizny, role poziomów, synchronizacja ról, ogłoszenia]
related: [administration, utility]
---

## Co robi

Właściciel serwera, który prowadzi kampanię Patreon, łączy ją z botem, logując się kontem twórcy. Od tej chwili bot pobiera poziomy i wspierających kampanii, utrzymuje je zsynchronizowane i może nadawać role na Discordzie w zależności od tego, ile deklaruje każdy wspierający. Gdy konto Discord wspierającego jest znane Patreonowi, powiązanie następuje automatycznie; w przeciwnym razie staff może ręcznie powiązać członka z użytkownikiem Patreon.

Raz w miesiącu, w wybrany dzień, bot może opublikować na kanale ogłoszenie z podziękowaniem dla wspierających. Wiadomość może być zwykłym tekstem lub embedem i może zawierać aktualne liczby, takie jak liczba aktywnych wspierających, miesięczny przychód i to, ile osób dołączyło w tym miesiącu. Jest też komenda wyróżnienia, która publikuje podziękowanie dla każdego, kto został wspierającym w ostatnim tygodniu.

Panel obsługuje cały proces: łączenie, przeglądanie wspierających i poziomów, powiązanie poziomów z rolami i edycję ustawień ogłoszeń. Komendy obejmują to samo, plus statystyki i rankingi na czacie.

## Do czego się przydaje

- Wspierający powinni dostać kolorową rolę i dostęp do kanałów tylko dla patronów, bez ręcznego sprawdzania Patreona przez staff.
- Poziomy automatycznie zmieniają role, gdy ktoś awansuje, obniża poziom lub przestaje wspierać.
- Chcesz cyklicznego posta „dziękujemy naszym 40 wspierającym”, który pozostaje dokładny bez ręcznej edycji liczb.
- Staff chce szybko zobaczyć z poziomu Discorda, kto wspiera i na jakim poziomie.

## Łączenie kampanii

Łączenie korzysta z przepływu OAuth Patreona. Karta **Połącz swojego Patreona** w panelu albo komenda `patreonsync`, dostępna tylko dla właściciela bota, tworzy link „Authorize with Patreon”. Zaloguj się kontem, które jest właścicielem kampanii, zatwierdź żądany dostęp, a Patreon odeśle Cię na stronę Patreon w panelu. Bot wymienia kod na tokeny, zapisuje pierwszą znalezioną kampanię i od razu uruchamia pełną synchronizację poziomów i wspierających.

Konto, którego używasz, musi być właścicielem kampanii. Jeśli jej nie ma, callback kończy się błędem „No Patreon campaigns found for this user”.

Karta **Przegląd** w panelu pokazuje stan połączenia z **ID kampanii**, **Ostatnią synchronizacją** i **Token wygasa**, a także kafelki podsumowujące aktywnych **Wspierających**, miesięczny **Przychód** i **Twórcę kampanii**. Tokeny są odświeżane automatycznie po wygaśnięciu; **Szybkie akcje** na tej samej karcie to **Synchronizuj wszystkie dane**, **Synchronizuj role**, **Wyślij ogłoszenie** i **Zaloguj ponownie**. Ponowne logowanie rozłącza kampanię: czyści tokeny, ale zachowuje ustawienia kanału, wiadomości i powiązań, więc możesz połączyć się ponownie. Nagłówek strony ma też przyciski **Odśwież dane** i **Synchronizuj wspierających**.

> [!NOTE]
> Integracja z Patreonem musi być włączona przez hosta bota. Jeśli bot nie ma skonfigurowanego identyfikatora klienta Patreon, przycisk łączenia i `patreonsync` zgłaszają, że integracja nie jest skonfigurowana.

## Wspierający i synchronizacja

Synchronizacja pobiera każdego członka kampanii z kwotą zobowiązania, statusem i, jeśli wspierający połączył Discord z Patreonem, jego ID użytkownika Discorda. Aktywni wspierający to ci, których Patreon zgłasza jako aktywnych lub z bieżącym zobowiązaniem. Karta **Wspierający** wypisuje ich z **Nazwą** (i adresem e-mail, jeśli Patreon go podaje), **Zobowiązaniem**, **Dołączył(a)** i **Statusem**, a przycisk **Synchronizuj wspierających** u góry strony odświeża listę.

`patreonsupporters` pokazuje na czacie do 15 aktywnych wspierających z zobowiązaniem i wzmianką na Discordzie, `patreontop [count]` szereguje 1 do 20 najlepszych według zobowiązania, `patreonstats` podsumowuje liczbę wspierających, liczbę powiązanych, łączny i średni przychód oraz liczbę poziomów, a `patreonanalytics` dodaje byłych wspierających, przychód całkowity, nowych wspierających w tym miesiącu i rozkład poziomów.

Jeśli konto Discord wspierającego nie jest dołączone po stronie Patreona, użyj `patreonlink @member <patreonUserId>`, aby powiązać go ręcznie. ID użytkownika Patreon to numeryczne ID konta Patreon wspierającego; lista wspierających w panelu go nie wyświetla.

## Powiązanie poziomów z rolami

Każdy poziom Patreon można powiązać z jedną rolą na Discordzie. Na karcie **Powiązania poziomów** wybierz **Poziom na Patreonie** i **Rolę na Discordzie** i zapisz. Lista **Dostępne poziomy** pokazuje każdy opublikowany poziom z ceną i informacją, czy jest powiązany. Na czacie `patreontiermap <tierId> @role` robi to samo; ID poziomów pobierzesz z `patreonroles`.

Synchronizacja ról jest wyłączona, dopóki nie włączysz jej komendą `patreonrolesync` albo polem wyboru **Włącz synchronizację ról**. Po włączeniu bot ustala, którą rolę powinien mieć wspierający: powiązany poziom o najwyższej cenie, której kwota jest równa jego zobowiązaniu lub niższa. Wszystkie inne powiązane role Patreon, które posiada, są usuwane, a rola docelowa jest dodawana. Wspierający, który przestaje wspierać, traci wszystkie powiązane role.

Synchronizacja następuje, gdy członek zostanie powiązany oraz gdy uruchomisz `patreonsyncall` lub akcję synchronizacji ról w panelu. Zsynchronizować można tylko wspierających ze znanym ID Discorda.

> [!PERMISSION]
> Bot potrzebuje uprawnienia Zarządzanie rolami, a jego własna rola musi leżeć wyżej niż każda powiązana rola. Role powyżej bota są pomijane.

## Miesięczne ogłoszenia

Kanał ustawisz komendą `patreonch #channel` albo selektorem **Kanał ogłoszeń**, a dzień komendą `patreonday <1..28>` albo **Dzień ogłoszenia (1-28)**. Dzień jest ograniczony do 28, aby luty nigdy nie pomijał miesiąca. Ogłoszenia są wyłączone, dopóki nie uruchomisz `patreontoggle` albo nie zaznaczysz **Włącz ogłoszenia**.

Bot sprawdza co godzinę. W wybrany dzień, jeśli nie ogłaszał jeszcze w tym miesiącu, publikuje i zapisuje czas. Jeśli bot był offline w ten dzień, nadrabia przy starcie, o ile dzień już minął w tym miesiącu. `patreonannounce` publikuje jedno natychmiast, co liczy się też jako post tego miesiąca.

Bez własnej wiadomości bot publikuje domyślne podziękowanie zawierające liczbę aktywnych wspierających i miesięczny przychód. Własną ustawisz komendą `patreonmsg <text or embed code>` albo edytorem wiadomości ogłoszenia w panelu. Tekst przechodzi przez parser embedów. Użyj `-`, aby wrócić do domyślnej.

### Placeholdery

Działają w wiadomości ogłoszenia obok zwykłych placeholderów serwera i kanału.

| Placeholder | Wartość |
| --- | --- |
| `%month%` | Nazwa bieżącego miesiąca |
| `%year%` | Bieżący rok |
| `%patreon.link%` | `https://patreon.com` |
| `%supporter.count%` | Aktywni wspierający |
| `%supporter.total%` | Wszyscy wspierający kiedykolwiek zarejestrowani |
| `%supporter.new%` | Nowi wspierający w tym miesiącu |
| `%supporter.former%` | Byli wspierający |
| `%supporter.linked%` | Wspierający z powiązanym kontem Discord |
| `%revenue.monthly%` | Bieżące miesięczne zobowiązania |
| `%revenue.average%` | Średnie zobowiązanie |
| `%revenue.lifetime%` | Przychód całkowity |
| `%growth.new%` | Nowi wspierający w tym miesiącu |
| `%top.supporter.name%` | Wspierający z najwyższym zobowiązaniem |
| `%top.supporter.amount%` | Jego zobowiązanie |
| `%patron.name%` | Wspierający z najwyższym zobowiązaniem, tak samo jak `%top.supporter.name%` |
| `%patron.tier%` | Poziom, na którym jest ten wspierający, albo „Unknown”, jeśli Patreon go nie zgłosił |
| `%patron.amount%` | Jego miesięczne zobowiązanie, tak samo jak `%top.supporter.amount%` |
| `%tiers.count%` | Liczba poziomów |
| `%tier.popular%` | Poziom z największą liczbą wspierających |
| `%tier.popular.count%` | Ilu ich jest na tym poziomie |
| `%supporters.summary%` | Gotowe zdanie o liczbie wspierających |
| `%revenue.summary%` | Gotowe zdanie o przychodzie |
| `%growth.summary%` | Gotowe zdanie o wzroście |

> [!EXAMPLE]
> `It's %month%! Thanks to %supporters.summary%%revenue.summary%!%growth.summary%` renderuje się jako „It's December! Thanks to our 25 incredible supporters who help us raise $150/month! We gained 3 new supporters this month!”

## Wyróżnianie nowych wspierających

`patreonrecognize [#channel]` publikuje embed powitalny dla wspierających, których zobowiązanie zaczęło się w ciągu ostatnich siedmiu dni, do pięciu na uruchomienie, na podanym kanale albo bieżącym. To komenda ręczna, a nie harmonogram, więc uruchom ją po synchronizacji. Uruchomienie jej dwa razy publikuje te same osoby dwa razy.

## Ustawienia

Panel ma cztery karty: **Przegląd**, **Wspierający**, **Powiązania poziomów** i **Konfiguracja**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Kanał ogłoszeń | brak | Gdzie trafia miesięczny post; brak oznacza wyłączone ogłoszenia |
| Dzień ogłoszenia (1-28) | brak | Dzień miesiąca publikacji; ogłoszenia nie uruchamiają się, dopóki żaden nie zostanie ustawiony |
| Wiadomość ogłoszenia | wbudowane podziękowanie | Własny tekst lub embed z powyższymi placeholderami |
| Włącz ogłoszenia | wyłączone | Czy miesięczny post jest wysyłany |
| Włącz synchronizację ról | wyłączone | Czy powiązane role są nadawane wspierającym |
| Powiązania poziomów | brak | Którą rolę daje każdy poziom |

## Konfiguracja krok po kroku

1. Otwórz **Patreon** w panelu i kliknij przycisk łączenia. Zaloguj się kontem właściciela kampanii i zatwierdź dostęp.
2. Poczekaj na pierwszą synchronizację, a potem sprawdź, czy karta **Wspierający** pokazuje Twoich patronów.
3. W **Powiązaniach poziomów** powiąż każdy poziom z rolą. Najpierw utwórz role i umieść rolę bota nad nimi.
4. Zaznacz **Włącz synchronizację ról**, a potem uruchom `patreonsyncall`, aby nadać role wszystkim już powiązanym.
5. W **Konfiguracji** wybierz **Kanał ogłoszeń** i **Dzień ogłoszenia**, napisz wiadomość z placeholderami i zaznacz **Włącz ogłoszenia**.
6. Uruchom raz `patreonannounce`, aby zobaczyć wynik na kanale.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `patreonsync` | `ptsync` | Właściciel bota | Publikuje link autoryzacji OAuth |
| `patreonch [#channel]` | `ptch` | Administrator | Pokazuje lub ustawia kanał ogłoszeń |
| `patreondisable` | `ptdisable` | Administrator | Czyści kanał, wyłączając ogłoszenia |
| `patreonmsg [text]` | `ptmsg` | Administrator | Pokazuje lub ustawia wiadomość ogłoszenia, `-` resetuje |
| `patreonday [day]` | `ptday` | Administrator | Pokazuje lub ustawia dzień miesiąca |
| `patreontoggle` | `pttoggle` | Administrator | Włącza lub wyłącza ogłoszenia |
| `patreonconfig` | `ptconfig` | Administrator | Pokazuje stan, kanał, dzień, wiadomość i ostatni post |
| `patreonannounce` | `ptannounce` | Administrator | Wysyła ogłoszenie teraz |
| `patreonhelp` | `pthelp` | Nikt | Lista placeholderów i przegląd komend |
| `patreonsupporters` | `ptsupporters` | Administrator | Wypisuje aktywnych wspierających |
| `patreontop [count]` | `pttop` | Nikt | Najlepsi wspierający według zobowiązania |
| `patreonstats` | `ptstats` | Administrator | Podsumowanie wspierających i przychodów |
| `patreonanalytics` | `ptanalytics` | Administrator | Szczegółowa analityka |
| `patreonlink <user> <patreonUserId>` | `ptlink` | Administrator | Wiąże członka z użytkownikiem Patreon |
| `patreonrolesync` | `ptrolesync` | Zarządzanie rolami | Przełącza automatyczną synchronizację ról |
| `patreontiermap <tierId> <role>` | `pttiermap` | Zarządzanie rolami | Wiąże poziom z rolą |
| `patreonroles` | `ptroles` | Administrator | Wypisuje poziomy z ich ID i rolami |
| `patreonsyncall` | `ptsyncall` | Zarządzanie rolami | Nadaje role każdemu powiązanemu wspierającemu |
| `patreonrecognize [#channel]` | `ptrecognize` | Administrator | Wyróżnia wspierających z ostatnich siedmiu dni |

## Wskazówki i pułapki

- Role mogą dostać tylko wspierający, którzy połączyli Discord w swoim profilu Patreon albo zostali powiązani komendą `patreonlink`.
- Synchronizacja ról wybiera jedną rolę na wspierającego, czyli najlepszy poziom, który pokrywa jego zobowiązanie. Kumulowanie wielu ról poziomów nie jest obsługiwane.
- Ogłoszenia są publikowane najwyżej raz w miesiącu kalendarzowym. Uruchomienie `patreonannounce` 3. dnia oznacza, że zaplanowany post z 15. zostanie w tym miesiącu pominięty.
- Dzień ogłoszenia jest w UTC.
- Miesięczne ogłoszenie dotyczy całej kampanii, więc `%patron.name%`, `%patron.tier%` i `%patron.amount%` opisują aktywnego wspierającego z najwyższym zobowiązaniem, a nie kolejnych patronów po kolei. Do wyróżnień dla poszczególnych wspierających użyj `patreonrecognize`.
- Ponowne połączenie innym kontem Patreon zmienia kampanię, ale zachowuje stare powiązania, więc potem przejrzyj kartę **Powiązania poziomów**.

---
title: System XP
slug: xp
summary: Nagradzaj członków za pisanie i rozmowy na kanałach głosowych poziomami, kartami rangi, nagrodami w rolach i walucie oraz wydarzeniami czasowymi.
icon: fa-star
category: Community
dashboard: /dashboard/xp
module: Xp
tags: [xp, experience, levels, level up, rank, rank card, leaderboard, role rewards, voice xp, xp boost, competition, xp curve, doświadczenie, poziomy, awans, ranga, karta rangi, ranking, nagrody w rolach, xp głosowe, bonus xp, konkurs, krzywa xp]
related: [currency, achievements, administration, utility]
---

## Co robi

Członkowie zdobywają XP, wysyłając wiadomości i rozmawiając na kanałach głosowych. XP sumuje się w poziomy wzdłuż wybranej przez ciebie krzywej. Każdy może uruchomić `rank`, aby dostać wygenerowaną kartę rangi z poziomem, paskiem postępu, pozycją na serwerze i awatarem, lub `leaderboard`, aby zobaczyć, kto prowadzi.

Gdy członek awansuje, bot może wysłać ogłoszenie na kanale, na dedykowanym kanale awansów albo w wiadomości prywatnej. Możesz napisać własne wiadomości o awansie z symbolami zastępczymi albo zostawić domyślny embed. Osiągnięcie poziomu może też automatycznie nadawać role i walutę serwera.

Staff kontroluje, jak szybko napływa XP: XP za wiadomość, czas odnowienia, XP głosowe za minutę, globalny mnożnik oraz mnożniki dla kanałów i ról. Tymczasowe wydarzenia z bonusem mnożą wszystko na pewien czas, a konkursy to wyścig z nagrodami za czołowe miejsca. Użytkowników, role i kanały można wykluczyć, aby kanały ze spamem botów i wyciszone role nic nie zdobywały.

## Po co z tego korzystać

- Daj aktywnym członkom widoczny postęp i powód, by dalej pisać.
- Odblokowuj role na określonych poziomach, aby wieloletni członkowie dostawali przywileje bez ręcznej pracy staffu.
- Zorganizuj weekendowe wydarzenie z podwójnym XP albo wyścig „kto pierwszy na poziom 20”.
- Dbaj o uczciwość XP, wykluczając kanały komend, kanały AFK i role botów.
- Połącz XP z modułem waluty, aby awans również wypłacał nagrodę.

## Jak zdobywa się XP

### XP za tekst

Każda wiadomość od członka niebędącego botem daje **XP za wiadomość** (domyślnie 3, maksymalnie 50) raz na okno czasu odnowienia. **Czas odnowienia XP za wiadomości** domyślnie wynosi 60 sekund; członek, który wyśle dziesięć wiadomości w tym oknie, dostanie XP raz. Wiadomości na wykluczonych kanałach albo od wykluczonych użytkowników i ról nic nie dają. Jeśli cały serwer jest wykluczony, nic nie jest liczone.

Następnie kwota jest mnożona. Wszystkie te mnożniki się kumulują:

| Mnożnik | Ustawiany przez | Uwagi |
| --- | --- | --- |
| Globalny mnożnik | `setxpmultiplier` lub **Globalny mnożnik XP** | Dotyczy każdego przyrostu |
| Mnożnik kanału | `setchannelxp` | Dotyczy przyrostów na tym kanale |
| Mnożnik roli | `setrolexp` | Jeśli członek ma kilka ról z mnożnikami, używany jest tylko najwyższy |
| Wydarzenia z bonusem | `xpboost` | Stosowane jest każde aktywne wydarzenie |

Wynik jest zaokrąglany w dół do liczby całkowitej.

**Bonus za pierwszą wiadomość** to osobna jednorazowa nagroda za pierwszą wiadomość członka w każdym dniu UTC. Jest zapisany w ustawieniach XP, ale nie jest pokazywany w panelu.

### XP głosowe

XP głosowe jest śledzone dla każdej sesji. Członek zdobywa je tylko wtedy, gdy jest na kanale głosowym z co najmniej dwiema uczestniczącymi osobami (boty się nie liczą) i nie jest wyciszony ani ogłuszony, ani przez siebie, ani przez serwer. Czas spędzony w wyciszeniu, w ogłuszeniu lub w samotności nie jest liczony.

Po zakończeniu sesji kwalifikujące się minuty są mnożone przez **XP za minutę na kanale głosowym** (domyślnie 2, maksymalnie 10). Sesje krótsze niż 15 sekund nic nie dają. **Limit czasu XP głosowego** (domyślnie 60 minut) to maksymalna liczba minut, za którą można zapłacić w jednej sesji. Mnożniki są stosowane do XP głosowego tylko wtedy, gdy kwota bazowa wynosi co najmniej 5. Ustawienie XP głosowego za minutę lub limitu czasu na 0 wyłącza XP głosowe.

### Zanik XP

Zanik jest opcjonalny i domyślnie wyłączony. Gdy jest włączony, co dwanaście godzin bot znajduje członków, których ostatnia aktywność jest starsza niż **Dni nieaktywności przed zanikiem**, i odbiera im **Dzienny procent zaniku** ich łącznego XP. Te trzy ustawienia istnieją w rekordzie ustawień XP, ale nie mają jeszcze komendy ani kontrolki w panelu.

## Poziomy i krzywe

Poziom członka zależy od **typu krzywej XP**. Każda krzywa opiera się na bazie 36 XP na pierwszy poziom.

| Krzywa | Nazwa w komendzie | Nazwa w panelu | XP potrzebne na poziom n |
| --- | --- | --- | --- |
| Standardowa | `Standard` | Domyślna | 36 x n do kwadratu |
| Liniowa | `Linear` | Liniowo | 36 x n |
| Przyspieszona | `Accelerated` | Kwadratowo | 36 x n do potęgi 1,25 |
| Zwolniona | `Decelerated` | Wykładniczo | 36 x n do potęgi 2,5 |
| Własna | `Custom` | niedostępna | Tak samo jak Standardowa |
| Starsza | `Legacy` | Starsze | Każdy poziom kosztuje 36 plus 9 za każdy poprzedni poziom, sumy się kumulują |

Standardowa jest domyślna. Zmiana krzywej przez `setxpcurve` przelicza poziom każdego, chyba że podasz `false` jako drugi argument. Zmiana krzywej nie zmienia niczyjej sumy XP, tylko to, na jaki poziom ta suma się przekłada.

## Powiadomienia o awansie

Każdy członek wybiera przez `levelnotif`, jak ma być informowany o awansach: `None`, `Channel` lub `Dm`. Członkowie mogą też uruchomić `leveluppings false`, aby bot ich nie wzmiankował; ich nazwa jest wtedy pokazywana jako zwykły tekst.

Powiadomienia kanałowe trafiają na **kanał awansów**, jeśli ustawiono go przez `levelupchannel`, a w przeciwnym razie na kanał, na którym zdobyto XP. Bot potrzebuje tam uprawnienia do wysyłania wiadomości.

Jeśli serwer nie ma własnych wiadomości, domyślnie jest to embed z tytułem będącym komunikatem o awansie, awatarem członka jako miniaturą i polami z łącznym XP, pozycją na serwerze i nowym poziomem. Jeśli dodałeś własne wiadomości przez `addlevelupmessage`, za każdym razem losowana jest jedna włączona wiadomość. Własna wiadomość może być zwykłym tekstem albo JSON-em embeda z kreatora embedów. Przetestuj dowolny szablon przez `testlevelupmessage`.

### Symbole zastępcze

Działają one wewnątrz własnych wiadomości o awansie, obok ogólnych symboli użytkownika i serwera ze strony symboli zastępczych. Ponieważ powiadomienia nie śledzą kanału ani osoby, która je wywołała, `%xp.channel.*%` zamienia się na „Unknown Channel”, `%xp.triggeruser.*%` na „System”, a `%xp.gained%` zawsze wynosi 0.

| Symbol zastępczy | Wartość |
| --- | --- |
| `%xp.user%` | Nazwa użytkownika i tag albo sama nazwa użytkownika, jeśli pingi są wyłączone |
| `%xp.user.mention%` | Wzmianka członka albo sama nazwa użytkownika, jeśli pingi są wyłączone |
| `%xp.user.name%` | Nazwa użytkownika |
| `%xp.user.displayname%` | Nazwa wyświetlana |
| `%xp.user.nickname%` | Pseudonim, a jeśli go brak, nazwa użytkownika |
| `%xp.user.avatar%` | URL awatara |
| `%xp.user.id%` | ID użytkownika |
| `%xp.user.created%` | Data utworzenia konta |
| `%xp.user.joined%` | Data dołączenia do serwera |
| `%xp.level.old%` | Poziom przed awansem |
| `%xp.level.new%` | Nowy poziom (`%xp.level.current%` to to samo) |
| `%xp.level.next%` | Nowy poziom plus jeden |
| `%xp.level.difference%` | Ile poziomów zdobyto |
| `%xp.total%` | Łączne XP |
| `%xp.current%` | XP zdobyte w obrębie bieżącego poziomu |
| `%xp.needed%` | Łączne XP wymagane przez bieżący poziom |
| `%xp.remaining%` | XP, którego jeszcze brakuje do następnego poziomu |
| `%xp.progress%` | Postęp w obrębie poziomu w procentach |
| `%xp.rank%` | Pozycja na serwerze jako liczba |
| `%xp.rank.ordinal%` | Pozycja słownie, na przykład „third” |
| `%xp.rank.suffix%` | Sam przyrostek: st, nd, rd lub th |
| `%xp.guild%`, `%xp.guild.name%` | Nazwa serwera |
| `%xp.guild.id%` | ID serwera |
| `%xp.guild.membercount%` | Przybliżona liczba członków |
| `%xp.guild.icon%`, `%xp.guild.banner%` | URL ikony i banera serwera |
| `%xp.time%`, `%xp.time.full%`, `%xp.date%` | Bieżący czas UTC, czas z datą i data |
| `%xp.timestamp%`, `%xp.timestamp.relative%` | Znaczniki czasu Discorda dla teraz |

> [!EXAMPLE]
> `addlevelupmessage %xp.user.mention% just hit level %xp.level.new% and is now %xp.rank.ordinal% on the leaderboard.`

Uruchom `levelupplaceholders` na Discordzie, aby zobaczyć tę samą listę.

## Nagrody w rolach

`rolereward <level> <role>` nadaje rolę, gdy członek osiągnie dany poziom. Przy wyłączonej opcji **Ekskluzywne nagrody w rolach** (domyślnie) członkowie zachowują każdą nagrodową rolę za poziomy równe swojemu lub niższe i tracą te za poziomy wyższe. Przy włączonej (`setxpexclusive true`) zachowywana jest tylko nagroda za najwyższy poziom, który spełniają, a wszystkie pozostałe role nagrodowe są odbierane.

Nagrody są stosowane przy zmianie poziomu. Użyj `syncmyxproles`, `syncuserxproles` lub `syncallxproles`, aby zsynchronizować role po dodaniu nagród lub zaimportowaniu XP. Synchronizację wszystkich użytkowników można uruchomić raz na godzinę, a bot potrzebuje uprawnienia Zarządzanie rolami i swojej roli powyżej każdej roli nagrodowej.

## Nagrody w walucie

`currencyreward <level> <amount>` wypłaca walutę serwera z modułu waluty, gdy członek osiągnie dany poziom. Podanie 0 usuwa nagrodę. Jeśli poziom członka spadnie, na przykład po `setxp` lub zaniku, waluta za utracone poziomy jest odbierana.

## Osiągnięcia

[Osiągnięcia](/wiki/achievements) to osobny system z własnymi punktami i rangami, więc ranga osiągnięć nie jest poziomem XP. Oba systemy spotykają się w dwóch miejscach: osiągnięcie poziomów XP odblokowuje osiągnięcia z kategorii Community, a osiągnięcia mogą zwracać XP przez nagrodę XP przypisaną do osiągnięcia lub **XP za punkt** w karcie Ustawienia osiągnięć. Oba są wyłączone, dopóki ich nie ustawisz.

## Wydarzenia z bonusem

`xpboost <time> <multiplier> <name>` uruchamia wydarzenie czasowe, na przykład `xpboost 2h 2.0 Weekend XP Event`. Każdy aktywny bonus mnoży XP za wiadomości i głosowe razem z pozostałymi mnożnikami. `xpboosts` wyświetla to, co trwa, a `cancelboost <id>` przerywa jedno wcześniej.

## Konkursy

`xpcompetition <time> <type> [targetLevel] [name]` uruchamia wyścig czasowy. Członkowie są zapisywani automatycznie przy pierwszym zdobyciu XP w trakcie jego trwania.

| Typ | Zwycięzca |
| --- | --- |
| `MostGained` | Kto zdobył najwięcej XP w trakcie konkursu |
| `ReachLevel` | Kto jako pierwszy osiągnie docelowy poziom |
| `HighestTotal` | Kto ma najwyższą sumę XP po jego zakończeniu |

Dodaj nagrody przez `addcompetitionreward <id> <position> <type> <reward>`, gdzie typ to `Role`, `XP` lub `Currency`. Nagrody w rolach są nadawane, nagrody w XP są dodawane jako bonusowe XP, a waluta jest wypłacana przez moduł waluty. `competitionleaderboard <id>` pokazuje klasyfikację, a `endcompetition <id>` kończy konkurs wcześniej i rozdaje nagrody.

## Wyłączenia

`xpexclude` i `xpinclude` przyjmują użytkownika, rolę lub kanał tekstowy. Wykluczeni użytkownicy i każdy z wykluczoną rolą nigdy nie zdobywają XP; wykluczone kanały nie dają nic nikomu. Dotyczy to także kanałów głosowych. `xpexcludelist users|roles|channels` pokazuje listy. Wersje slash to `/xp admin exclude`, `/xp admin include` (podaj opcję `user`, `role` lub `channel`) oraz `/xp exclude-list`. Przełącznik **Wykluczenie serwera z XP** w panelu wyłącza zdobywanie XP dla całego serwera naraz.

## Karty rangi

`rank [@user]` generuje kartę PNG. `textrank [@user]` podaje te same informacje jako tekst dla czytników ekranu. Boty nie mają rangi.

Karta jest budowana z szablonu serwera: obraz tła (własny z **Własne tło karty XP** albo wbudowany) oraz warstwy dla awatara i nazwy użytkownika, paska postępu, poziomu na serwerze, pozycji na serwerze, czasu na bieżącym poziomie i przyznanego bonusowego XP. Każdą warstwę można pokazać lub ukryć, przesunąć, zmienić jej rozmiar i kolor, a pasek postępu może być zaokrąglony, segmentowany lub radialny i wypełniać się w dowolnym kierunku.

Karta **Szablon** otwiera edytor wizualny. Na ekranach węższych niż 768 pikseli panel przełącza się na edytor dotykowy z tymi samymi warstwami, dolnym panelem właściwości i prostymi kontrolkami pozycji i rozmiaru. Na szerszych ekranach dostajesz pełny edytor z listą warstw, siatką, przyciąganiem, liniałami, cofaniem i ponawianiem oraz powiększaniem.

## Ranking

`leaderboard [page]` pokazuje ranking serwera. Jeśli serwer korzysta też z modułu waluty i waluta jest w obiegu, samo `leaderboard` pyta, czy chodziło o XP, czy o walutę; podanie strony zawsze oznacza XP. Karta **Ranking** w panelu pokazuje ten sam ranking z akcją **Zmień XP**, która może dodać, ustawić lub zresetować XP członka, opcjonalnie czyszcząc także bonusowe XP.

## Ustawienia

Panel ma sześć kart: **Ustawienia**, **Statystyki**, **Ranking**, **Nagrody**, **Szablon** i **Wyłączenia**. Poniższe ustawienia znajdują się w karcie Ustawienia.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Wykluczenie serwera z XP | wyłączone | Zatrzymuje całe zdobywanie XP na serwerze |
| XP za wiadomość | 3 | Bazowe XP za wiadomość, maksymalnie 50 |
| Czas odnowienia XP za wiadomości | 60 sekund | Minimalna przerwa między przyznaniami XP za wiadomość dla członka |
| XP za minutę na kanale głosowym | 2 | Bazowe XP za kwalifikującą się minutę głosową, maksymalnie 10; 0 wyłącza XP głosowe |
| Limit czasu XP głosowego | 60 minut | Maksymalna liczba minut, za którą można zapłacić w jednej sesji głosowej |
| Globalny mnożnik XP | 1 | Mnoży każdy przyrost |
| Typ krzywej XP | Domyślna | Która krzywa przekłada XP na poziomy |
| Własne tło karty XP | brak | URL obrazu używanego za kartami rangi |

Karta **Nagrody** zarządza nagrodami w rolach i walucie, a **Wyłączenia** zarządza wykluczonymi kanałami i rolami. **Statystyki** pokazują łączną liczbę użytkowników, łączne XP, średni poziom, najwyższy poziom i niedawną aktywność XP.

Te pola istnieją także w rekordzie `GuildXpSetting`, ale ustawia się je wyłącznie komendą: `FirstMessageBonus`, `ExclusiveRoleRewards` (`setxpexclusive`), `LevelUpChannel` (`levelupchannel`), `LevelUpMessage` oraz pola zaniku `EnableXpDecay`, `InactivityDaysBeforeDecay` i `DailyDecayPercentage`.

## Konfiguracja krok po kroku

1. Otwórz **System XP** w panelu i sprawdź, czy **Wykluczenie serwera z XP** jest wyłączone.
2. W karcie **Ustawienia** zostaw na początek domyślne wartości dla wiadomości i głosu, wybierz krzywą, a potem **Zapisz zmiany**.
3. W karcie **Wyłączenia** wyklucz kanały komend botów oraz wyciszone role i role botów.
4. W karcie **Nagrody** dodaj nagrodę w roli dla kilku kamieni milowych. Upewnij się, że rola bota znajduje się powyżej tych ról.
5. Na Discordzie uruchom `levelupchannel #level-ups` i dodaj jeden lub dwa szablony `addlevelupmessage`. Przetestuj przez `testlevelupmessage`.
6. Otwórz **Szablon**, wgraj tło i ułóż kartę. Uruchom `rank`, aby zobaczyć wynik.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, o ile go nie zmieniono).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `rank [@user]` | | Brak | Pokazuje kartę rangi |
| `textrank [@user]` | | Brak | Informacje o randze jako tekst |
| `leaderboard [page]` | `lb` | Brak | Ranking XP serwera |
| `levelnotif <None\|Channel\|Dm>` | `lvlnotif` | Brak | Wybierasz, jak jesteś informowany o awansach |
| `leveluppings <true\|false>` | `lvluppings` | Brak | Czy wiadomości o awansie mogą cię wzmiankować |
| `xpsettings` | `xpconfig` | Zarządzanie serwerem | Pokazuje bieżące ustawienia XP |
| `setmessagexp <amount>` | `setmsgxp` | Zarządzanie serwerem | XP za wiadomość |
| `setxpcooldown <seconds>` | `xpcd` | Zarządzanie serwerem | Czas odnowienia XP za wiadomości |
| `setvoicexp <amount>` | | Zarządzanie serwerem | XP głosowe za minutę |
| `setvoicetimeout <minutes>` | | Zarządzanie serwerem | Limit sesji głosowej |
| `setxpmultiplier <number>` | `xpmult` | Zarządzanie serwerem | Globalny mnożnik |
| `setxpcurve <type> [recompute]` | | Zarządzanie serwerem | Zmienia krzywą poziomów |
| `setxpexclusive <true\|false>` | `xpexclusive`, `exclusivexp`, `setxpexcl`, `xpexcl` | Zarządzanie serwerem | Zachowuje tylko najwyższą rolę nagrodową |
| `setchannelxp <#channel> <number>` | | Zarządzanie serwerem | Mnożnik kanału |
| `setrolexp <role> <number>` | | Zarządzanie serwerem | Mnożnik roli |
| `addxp <@user> <amount>` | | Zarządzanie serwerem | Dodaje XP członkowi |
| `setxp <@user> <amount>` | | Zarządzanie serwerem | Ustawia XP członka |
| `resetxp <@user> [resetBonus]` | | Zarządzanie serwerem | Zeruje XP członka |
| `resetxp` | | Administrator | Zeruje XP dla całego serwera |
| `xpboost <time> <multiplier> <name>` | | Zarządzanie serwerem | Uruchamia wydarzenie z bonusem |
| `xpboosts` | | Brak | Wyświetla aktywne bonusy |
| `cancelboost <id>` | | Zarządzanie serwerem | Kończy bonus wcześniej |
| `xpexclude <@user\|role\|#channel>` | | Zarządzanie serwerem | Wyklucza z XP |
| `xpinclude <@user\|role\|#channel>` | | Zarządzanie serwerem | Usuwa wykluczenie |
| `xpexcludelist [users\|roles\|channels]` | | Brak | Pokazuje wykluczenia |
| `rolereward <level> <role>` | `rr` | Zarządzanie rolami | Dodaje nagrodę w roli |
| `removerolereward <level>` | `removerr` | Zarządzanie rolami | Usuwa nagrodę w roli |
| `rolerewards` | | Brak | Wyświetla nagrody w rolach |
| `currencyreward <level> <amount>` | `cr` | Zarządzanie serwerem | Dodaje nagrodę w walucie |
| `removecurrencyreward <level>` | `removecr` | Zarządzanie serwerem | Usuwa nagrodę w walucie |
| `currencyrewards` | | Brak | Wyświetla nagrody w walucie |
| `xpcompetition <time> <type> [targetLevel] [name]` | | Zarządzanie serwerem | Uruchamia konkurs |
| `addcompetitionreward <id> <position> <Role\|XP\|Currency> <reward>` | | Zarządzanie serwerem | Dodaje nagrodę za miejsce |
| `xpcompetitions` | | Brak | Wyświetla aktywne konkursy |
| `competitionleaderboard <id>` | `complb` | Brak | Klasyfikacja konkursu |
| `endcompetition <id>` | | Zarządzanie serwerem | Kończy konkurs i wypłaca nagrody |
| `syncallxproles` | | Administrator | Ponownie stosuje role nagrodowe wszystkim (raz na godzinę) |
| `syncmyxproles` | | Brak | Ponownie stosuje twoje własne role nagrodowe (raz na pięć minut) |
| `syncuserxproles <@user>` | | Zarządzanie rolami | Ponownie stosuje role nagrodowe jednego członka |
| `levelupchannel [#channel]` | `lvlupchan` | Zarządzanie serwerem | Dokąd trafiają powiadomienia kanałowe; brak kanału oznacza bieżący |
| `addlevelupmessage <text or embed JSON>` | `addlvlupmsg` | Zarządzanie serwerem | Dodaje własną wiadomość o awansie |
| `levelupmessages` | `lvlupmsgs` | Zarządzanie serwerem | Wyświetla własne wiadomości wraz z ID |
| `removelevelupmessage <id>` | `remlvlupmsg` | Zarządzanie serwerem | Usuwa własną wiadomość |
| `togglelevelupmessage <id> <true\|false>` | `togglelvlupmsg` | Zarządzanie serwerem | Włącza lub wyłącza jedną wiadomość |
| `testlevelupmessage [template]` | `testlvlupmsg` | Zarządzanie serwerem | Podgląd szablonu albo losowego zapisanego |
| `levelupplaceholders` | `lvlupplaceholders` | Zarządzanie serwerem | Wyświetla powyższe symbole zastępcze |

Odpowiedniki slash znajdują się pod `/xp`, a komendy staffu są pogrupowane jako `/xp admin` (dodawanie, ustawianie, reset, wykluczanie, włączanie, synchronizacje ról), `/xp config` (stawki, mnożniki, krzywa, wyłączność), `/xp rewards`, `/xp boost`, `/xp competition` i `/xp levelup`. `/xp admin reset` bez użytkownika zeruje XP dla całego serwera; wymaga uprawnienia Administrator i `confirm: true`.

## Wskazówki i pułapki

- Nagrody w rolach i synchronizacje ról wymagają, aby bot miał Zarządzanie rolami, a jego najwyższa rola była powyżej każdej roli nagrodowej. `syncallxproles` i `syncuserxproles` odmawiają działania bez tego.
- XP głosowe wymaga co najmniej dwóch niewyciszonych i nieogłuszonych ludzi na kanale. Członek siedzący sam albo wyciszony nic nie zdobywa, jak długo by tam nie został.
- Przyrosty XP są grupowane i zapisywane w tle, więc `rank` może pokazywać stan opóźniony o kilka sekund względem ostatniej wiadomości.
- Obniżenie czyjegoś XP przez `setxp` lub `resetxp` może obniżyć jego poziom, co odbiera role nagrodowe i cofa nagrody w walucie za utracone poziomy.
- Krzywa `Custom` zachowuje się dokładnie jak Standard i nie jest dostępna w panelu. Wybierz Legacy tylko wtedy, gdy migrujesz ze starszej konfiguracji i chcesz, aby istniejące poziomy się zgadzały.
- Własne wiadomości o awansie całkowicie zastępują domyślny embed. Jeśli każda własna wiadomość jest wyłączona, domyślny embed wraca.
- Wydarzeniami z bonusem i konkursami zarządza się wyłącznie komendami; panel ich nie pokazuje.

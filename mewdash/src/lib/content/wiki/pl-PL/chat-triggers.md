---
title: Wyzwalacze
slug: chat-triggers
summary: Automatyczne odpowiedzi na wiadomości, reakcje, komendy slash i zdarzenia bota, z warunkami, kosztami, licznikami, nadawaniem ról i pełnym zestawem symboli zastępczych.
icon: fa-comments
category: Actions
dashboard: /dashboard/chat-triggers
module: ChatTriggers
tags: [chat triggers, triggers, autoresponder, custom commands, auto reply, reaction roles, regex, counters, placeholders, event triggers, wyzwalacze, automatyczne odpowiedzi, własne komendy, role za reakcje, liczniki, symbole zastępcze, wyzwalacze zdarzeń]
related: [administration, xp, currency, tickets, giveaways]
---

## Co robi

Wyzwalacz to fragment tekstu, na który bot czeka, oraz odpowiedź, którą wysyła, gdy go zobaczy. W najprostszej postaci członek pisze `hello`, a bot odpowiada `hi there`. Dalej wyzwalacz może pasować w dowolnym miejscu wiadomości albo według wyrażenia regularnego, odpowiadać embedem, reagować emoji, wysyłać odpowiedź w DM, usuwać wiadomość członka, nadawać lub zabierać role, publikować kopię na innym kanale lub przez webhook oraz uruchamiać drugi wyzwalacz po zakończeniu.

Wyzwalacze nie muszą być wiadomościami. Ten sam wyzwalacz można zarejestrować jako komendę slash albo komendę kontekstową wiadomości lub użytkownika, uruchamiać go, gdy ktoś doda lub usunie konkretną reakcję, albo przy zdarzeniu bota, takim jak awans na wyższy poziom, dołączenie członka, rozpoczęcie boosta, otwarcie ticketu czy wygranie giveawayu.

Każdy wyzwalacz ma własne warunki: czas odnowienia na użytkownika, kanał lub serwer, wymagany poziom XP, koszt lub nagrodę w walucie, aktywne godziny i dni, datę wygaśnięcia, limit użyć, minimalny wiek konta lub czas na serwerze oraz licznik, który musi mieścić się w zakresie. Jeśli warunek nie jest spełniony, wyzwalacz milczy albo pokazuje napisaną przez Ciebie wiadomość. Tester w panelu dokładnie mówi, która reguła zablokowałaby przykładową wiadomość.

Odpowiedzi mogą czytać wartości z reszty bota: poziom członka, saldo, reputację lub liczbę wiadomości, tekst po wyzwalaczu, wspomniane osoby, wiadomość, na którą odpowiedział, grupy przechwytujące z regexa oraz liczniki obejmujące cały serwer, które odpowiedź może odczytać i zwiększyć.

## Do czego Ci się przyda

- Automatyczne odpowiedzi na częste pytania: `!rules` publikuje embed z regulaminem.
- Zabawne komendy, które członkowie mogą uruchamiać za darmo, bez wbudowanego zestawu komend bota.
- Wyzwalacz w stylu `daily`, który wypłaca walutę raz dziennie na użytkownika dzięki czasowi odnowienia i nagrodzie.
- Słowo „verify”, które nadaje rolę i usuwa wiadomość.
- Role za reakcje, które nadają rolę, gdy ktoś zareaguje danym emoji.
- Własne ogłoszenia o awansie, powitania lub boostach w wybranym formacie, uruchamiane zdarzeniem zamiast wiadomością.
- Działające liczniki, np. „dni od ostatniego incydentu”, które każdy może zwiększyć jednym słowem.

## Typy wyzwalaczy

Wyzwalacz ma zestaw włączonych typów. Typ określa, co może go uruchomić. Wiadomość jest włączona domyślnie; pozostałe włącza się osobno dla każdego wyzwalacza za pomocą `chattriggervalidtype` lub przełączników w panelu.

| Typ | Uruchamia się, gdy |
| --- | --- |
| Message | Wiadomość pasuje do tekstu wyzwalacza |
| Interaction | Ktoś uruchomi zarejestrowaną dla niego komendę slash, wiadomości lub użytkownika |
| Button | Naciśnięty zostanie przycisk, którego ID pasuje do wyzwalacza |
| Reactions | Ktoś doda emoji wyzwalacza do wiadomości |
| ReactionsRemoved | Ktoś usunie emoji wyzwalacza z wiadomości |
| Event | Wystąpi jedno z poniższych zdarzeń bota |

### Dopasowywanie wiadomości

Domyślnie cała wiadomość, zapisana małymi literami, musi być równa wyzwalaczowi. Dwie opcje to łagodzą:

- **Dopasuj w dowolnym miejscu wiadomości** (`ctca`): wyzwalacz musi pojawić się gdzieś w wiadomości jako osobne słowo.
- **Zezwól na wskazanie kogoś** (`ctat`): wiadomość może zaczynać się od wyzwalacza, po którym następuje spacja i dalszy tekst, który staje się `%target%`.

Wyzwalacze z **wyrażeniem regularnym** (`addchattriggerregex`) dopasowują wiadomość do wzorca. Każdy wzorzec ma 100 milisekund; ten, który przekroczy limit czasu, jest pomijany. Nazwane lub numerowane grupy przechwytujące są dostępne w odpowiedzi jako `%regex.1%` lub `%regex.name%`.

**Wymóg prefiksu** decyduje, czy wiadomość musi zaczynać się od prefiksu, zanim zostanie dopasowana:

| Opcja | Zachowanie |
| --- | --- |
| Prefiks niepotrzebny | Dopasowuje sam tekst (domyślnie) |
| Prefiks globalny | Musi zaczynać się od globalnego prefiksu bota |
| Prefiks serwera lub globalny | Musi zaczynać się od prefiksu serwera, a w razie braku od globalnego |
| Prefiks serwera, jeśli ustawiony | Musi zaczynać się od prefiksu serwera; nigdy nie pasuje, jeśli serwer go nie ma |
| Własny prefiks | Musi zaczynać się od prefiksu ustawionego przez `ctprefix` |

Jeśli do jednej wiadomości pasuje kilka wyzwalaczy, losowo wybierany jest jeden z nich. Wiadomości od botów i webhooków są ignorowane, chyba że wyzwalacz ma włączone **Tylko boty** (`ctallowbots`); taki wyzwalacz odpowiada wtedy wyłącznie na wiadomości botów. Bot nigdy nie odpowiada na własne wiadomości.

### Wyzwalacze interakcji

`setctintertype` rejestruje wyzwalacz jako komendę aplikacji typu Slash, Message lub User. `setctintername` i `setctinterdesc` ustawiają jej nazwę i opis; nazwy muszą spełniać zasady nazewnictwa komend Discorda. `ctinterephemeral` sprawia, że odpowiedź widzi tylko osoba, która uruchomiła komendę. `ctintererrors` wypisuje powody niepowodzenia rejestracji, takie jak zduplikowane nazwy lub zbyt wiele podkomend.

### Wyzwalacze reakcji

`addreactiontrigger <emoji> <response>` tworzy wyzwalacz, którego tekstem jest emoji. Włącz **Dodano reakcję** lub **Usunięto reakcję** jako jego typy. Odpowiedź jest publikowana na kanale wiadomości, na którą zareagowano, a nadawanie ról dotyczy reagującego członka (lub, w przypadku opcji **Oznaczone osoby**, osób wspomnianych w wiadomości, na którą zareagowano). Reakcje od botów są ignorowane.

### Wyzwalacze zdarzeń

`ctevent <id> <event>` sprawia, że wyzwalacz uruchamia się przy zdarzeniu zamiast przy wiadomości i włącza dla niego typ Event. Zdarzenia:

| Zdarzenie | Uruchamia się, gdy |
| --- | --- |
| XpLevelUp | Członek awansuje na wyższy poziom |
| XpLevelDown | Członek traci poziom |
| MemberJoin | Członek dołącza |
| MemberLeave | Członek odchodzi |
| VoiceJoin | Członek dołącza do kanału głosowego |
| VoiceLeave | Członek opuszcza kanał głosowy |
| Boost | Członek zaczyna boostować |
| BoostEnd | Członek przestaje boostować |
| TicketOpened | Ticket zostaje otwarty |
| TicketClosed | Ticket zostaje zamknięty |
| GiveawayWon | Członek wygrywa giveaway |

Odpowiedź trafia na kanał ustawiony przez `cteventchannel` albo, jeśli żaden nie jest ustawiony, na kanał, na którym wystąpiło zdarzenie. Dołączenia, odejścia, zdarzenia głosowe i boosty nie mają własnego kanału, więc takie wyzwalacze wymagają wyraźnie wskazanego kanału, inaczej nic nie robią. Wyzwalacze zdarzeń przechodzą przez te same warunki i kontrole ekonomii co wyzwalacze wiadomości, a członek, którego dotyczy zdarzenie, jest traktowany jako użytkownik dla symboli zastępczych i nadawania ról.

## Odpowiedzi

Główna odpowiedź to tekst podany przy tworzeniu wyzwalacza. Przechodzi przez parser embedów, więc może być zwykłym tekstem, embedem, kilkoma embedami lub komponentami zbudowanymi w edytorze embedów w panelu. Dodatkowe odpowiedzi można dodać przez `ctaddresponse`, a **tryb odpowiedzi** decyduje, które z nich są wysyłane:

| Tryb | Zachowanie |
| --- | --- |
| Single | Zawsze pierwsza odpowiedź (domyślnie) |
| Random | Jedna wybrana losowo; powtórz linię, aby zwiększyć jej wagę |
| RoundRobin | Po kolei, jedna na użycie, wspólnie dla całego serwera |
| All | Każda odpowiedź, po kolei |

Opcje dostarczania, wszystkie domyślnie wyłączone:

- **Odpowiedz na wiadomość** (`ctreply`): wysyła odpowiedź jako odpowiedź w Discordzie.
- **Wyślij odpowiedź jako DM** (`ctdm`): wysyła ją członkowi prywatnie.
- **Usuń wiadomość wyzwalającą** (`ctad`): usuwa to, co napisał.
- **Zareaguj na wiadomość zamiast odpowiadać** (`rtt`): dodaje emoji wyzwalacza do jego wiadomości zamiast do odpowiedzi. Nie można łączyć z usuwaniem.
- **Nie wysyłaj żadnej wiadomości** (`ctnr`): przydatne w wyzwalaczach tylko do ról.
- **Usuń odpowiedź po** (`ctdeleteafter`): liczba sekund, po których odpowiedź bota zostanie usunięta; 0 zachowuje ją.
- **Emoji do reakcji** (`ctreact`): do sześciu emoji, dodawanych po jednym na sekundę. Bez emoji lista jest czyszczona.

### Crosspost

`ctcpch` publikuje kopię każdej odpowiedzi na innym kanale serwera. `ctcpwh` publikuje ją zamiast tego przez URL webhooka, który może należeć do innego serwera. Crosspost działa nawet wtedy, gdy włączone jest **Nie wysyłaj żadnej wiadomości**.

### Role

**Role do nadania** i **Role do usunięcia** (`ctrgranttoggle`, `ctrremovetoggle`) są stosowane, gdy wyzwalacz się uruchomi. Ponowne uruchomienie przełącznika dla tej samej roli usuwa ją z listy. **Zastosuj te role do** (`chattriggerrolegranttype`) wybiera cel:

| Cel | Kogo dotyczy |
| --- | --- |
| Sender | Członek, który uruchomił wyzwalacz (domyślnie) |
| Mentioned | Do pięciu członków wspomnianych w wiadomości |
| Both | Nadawca plus do czterech wspomnianych członków |

Gdy cel obejmuje wspomniane osoby, wzmianki są usuwane z wiadomości przed dopasowaniem, więc `verify @someone` nadal pasuje do wyzwalacza `verify`.

### Łączenie w łańcuch

`ctchain <id> <nextId>` uruchamia drugi wyzwalacz po zakończeniu pierwszego. Drugi jest oceniany na własnych zasadach, w tym według własnych warunków i kosztów. Łańcuch zatrzymuje się po pięciu krokach i nigdy nie wraca do wyzwalacza, który już uruchomił.

## Warunki

Wszystkie z nich są sprawdzane, zanim cokolwiek zostanie pobrane, wysłane lub policzone. Niespełniony warunek oznacza, że wyzwalacz po cichu się nie uruchamia, z wyjątkiem kontroli poziomu i waluty, które pokazują **Wiadomość, gdy nie mogą go użyć**, jeśli ustawisz ją przez `ctreqmsg`.

| Warunek | Komenda | Domyślnie | Zachowanie |
| --- | --- | --- | --- |
| Czas odnowienia | `ctcooldown <id> <seconds> [scope]` | brak | Blokuje kolejne uruchomienia przez podaną liczbę sekund. Zakres to `User`, `Channel` lub `Guild` |
| Wymagany poziom | `ctreqlevel <id> <level>` | 0 | Poziom XP członka musi wynosić co najmniej tyle |
| Koszt | `ctcost <id> <amount>` | 0 | Waluta pobierana od członka; bez uruchomienia, jeśli nie może zapłacić |
| Nagroda | `ctreward <id> <amount>` | 0 | Waluta wypłacana członkowi po uruchomieniu |
| Nagroda XP | `ctxpreward <id> <amount>` | 0 | XP przyznawane po uruchomieniu |
| Aktywne godziny | `cttime <id> <HH:mm> <HH:mm> [days...]` | zawsze | Uruchamia się tylko w oknie czasowym, według strefy czasowej serwera. Koniec wcześniejszy niż początek oznacza działanie przez noc. Dni to nazwy lub 0 do 6, gdzie niedziela to 0 |
| Wygaśnięcie | `ctexpiry <id> [duration]` | nigdy | Przestaje działać po upływie podanego czasu od teraz, np. `7d` |
| Limit użyć | `ctmaxuses <id> <uses>` | bez limitu | Zatrzymuje się po tylu uruchomieniach; 0 usuwa limit |
| Minimalny wiek konta | `ctminage <id> [duration]` | brak | Konto musi być co najmniej tak stare |
| Minimalny czas na serwerze | `ctminmember <id> [duration]` | brak | Członek musi dołączyć co najmniej tak dawno temu |
| Zakres licznika | `ctrequirecounter <id> <name> [min] [max]` | brak | Nazwany licznik musi mieścić się w zakresie; `clear` jako nazwa usuwa wymóg |

Czas odnowienia zaczyna się dopiero po spełnieniu wszystkich pozostałych warunków, więc zablokowana próba go nie zużywa. Koszt jest pobierany przed wypłatą nagrody, więc wyzwalacz, który jednocześnie kosztuje i wypłaca, nigdy nie wypłaci osobie, której nie było stać na koszt. Czasy odnowienia komend na całym serwerze ustawione przez `cmdcd` również obowiązują dla wyzwalaczy, per użytkownik, oprócz własnego czasu odnowienia wyzwalacza.

## Liczniki

Liczniki to nazwane liczby przechowywane dla każdego serwera. Są tworzone przy pierwszym użyciu w odpowiedzi i można je odczytywać lub zmieniać z dowolnej odpowiedzi:

| Symbol zastępczy | Efekt |
| --- | --- |
| `%counter:name%` | Pokazuje licznik |
| `%counter:name+%` | Dodaje jeden i pokazuje nową wartość |
| `%counter:name-%` | Odejmuje jeden i pokazuje nową wartość |
| `%usercounter:name%` | Pokazuje własną wartość członka dla tej nazwy |
| `%usercounter:name+%` | Dodaje jeden do wartości członka |
| `%usercounter:name-%` | Odejmuje jeden od wartości członka |

Nazwy mają do 64 liter, cyfr, podkreślników lub myślników i nie rozróżniają wielkości liter. `ctcounters` je wypisuje, `ctcounterset` ustawia jeden na dokładną wartość, a `ctcounterdelete` usuwa go wraz ze wszystkimi wartościami użytkowników pod tą nazwą. Pasek boczny panelu ma do tego panel **Liczniki**.

## Symbole zastępcze

Odpowiedź może używać ogólnego zestawu symboli zastępczych (użytkownik, serwer, kanał, bot i czas ze strony symboli zastępczych), symboli zastępczych wyzwalaczy oraz symboli dodawanych przez inne moduły. `ctplaceholders` wypisuje te dodawane na żywo.

| Symbol zastępczy | Wartość |
| --- | --- |
| `%target%` | Wszystko, co wpisano po wyzwalaczu (wymaga **Zezwól na wskazanie kogoś** lub dopasowania w dowolnym miejscu) |
| `%targetuser%` | Wzmianka o pierwszej osobie wspomnianej w wiadomości |
| `%targetuser.id%`, `%targetuser.name%`, `%targetuser.avatar%` | ID, nazwa użytkownika i awatar tej osoby |
| `%targetusers%`, `%targetusers.id%` | Wszyscy wspomniani, jako wzmianki lub ID |
| `%replied.content%` | Treść wiadomości, na którą odpowiedział członek |
| `%replied.author%`, `%replied.author.id%` | Autor tej wiadomości |
| `%usecount%` | Ile razy ten wyzwalacz się uruchomił |
| `%regex.1%`, `%regex.name%` | Grupy przechwytujące wyzwalacza regex |
| `%img:tag%` | Losowy obraz z Imgur dla danego tagu |
| `%rng%` | Losowa liczba z ogólnego zestawu symboli zastępczych |
| `%xp.level%`, `%xp.rank%`, `%xp.total%`, `%xp.current%`, `%xp.required%`, `%xp.remaining%`, `%xp.bonus%` | Statystyki XP członka |
| `%targetuser.xp.level%`, `%targetuser.xp.rank%`, `%targetuser.xp.total%` | Statystyki XP wspomnianej osoby |
| `%currency.balance%`, `%currency.bank%`, `%currency.total%`, `%currency.emote%` | Waluta członka |
| `%targetuser.currency.balance%`, `%targetuser.currency.bank%` | Waluta wspomnianej osoby |
| `%rep%`, `%rep.rank%`, `%targetuser.rep%`, `%targetuser.rep.rank%` | Reputacja |
| `%messages%`, `%messages.channel%`, `%messages.server%`, `%targetuser.messages%` | Liczba wiadomości |
| `%invites%`, `%targetuser.invites%`, `%inviter%` | Liczba zaproszeń i osoba, która zaprosiła członka |
| `%targetuser.afk%` | Wiadomość AFK wspomnianej osoby |
| `%counter:name%` i podobne | Liczniki, jak wyżej |

Wzmianki wewnątrz `%target%` są neutralizowane, chyba że członek sam mógłby oznaczyć wszystkich.

> [!EXAMPLE]
> Wyzwalacz `daily`, odpowiedź `%user.mention% claimed today's bonus. Balance: %currency.balance%`, z `ctreward 12 100`, `ctcooldown 12 86400 User` i `ctreqmsg 12 Come back tomorrow.`

## Tester

`cttest <id> <sample message>` lub pole **Przetestuj ten wyzwalacz** na karcie wyzwalacza sprawdza, czy ta wiadomość uruchomiłaby wyzwalacz jako Ty, bez wysyłania, pobierania i liczenia czegokolwiek. Podaje, czy tekst pasuje, a jeśli wyzwalacz by się nie uruchomił, która reguła go zatrzymuje: wyłączenie, tylko boty, brak dopasowania, wpis uprawnień, nadpisanie uprawnień, wygaśnięcie, czas odnowienia, licznik, limit użyć, aktywne godziny, wiek konta, członkostwo, poziom, saldo lub czas odnowienia komend serwera.

## Kategorie i organizacja

`ctcategory <id> <name>` umieszcza wyzwalacz w kategorii. `ctcategorytoggle <name> <true or false>` włącza lub wyłącza wszystkie wyzwalacze w niej naraz, a pasek boczny panelu filtruje według kategorii. `cttoggle` wstrzymuje pojedynczy wyzwalacz bez jego usuwania. `ctstats` pokazuje, jak często wyzwalacz się uruchamiał i kto uruchamiał go ostatnio.

`ctsexport` pobiera wszystkie wyzwalacze jako plik YAML, a `ctsimport` wczytuje go z załącznika lub URL. `ctsclear` usuwa wszystkie wyzwalacze po potwierdzeniu.

## Ustawienia

Wszystko jest ustawiane osobno dla każdego wyzwalacza. Strona Wyzwalaczy ma **Tryb prosty** z formularzem **Szybka konfiguracja** (tekst wyzwalacza plus odpowiedź) oraz **Tryb zaawansowany** z **Tworzeniem zaawansowanego wyzwalacza**, gdzie wybierasz **Typ wzorca** (Wzorzec zwykłego tekstu lub Wzorzec wyrażenia regularnego), typy wyzwalaczy i możesz przetestować regex przed zapisem.

Każda karta wyzwalacza rozwija się, pokazując **Tekst wyzwalacza**, edytor **Wiadomość odpowiedzi**, tester oraz akordeon z ustawieniami pogrupowanymi tematycznie:

| Grupa | Ustawienia |
| --- | --- |
| Kiedy pasuje | Wymóg prefiksu, Własny prefiks, Dopasuj w dowolnym miejscu wiadomości, Zezwól na wskazanie kogoś, Tylko właściciel bota |
| Jak odpowiada | Odpowiedz na wiadomość, Wyślij odpowiedź jako DM, Usuń wiadomość wyzwalającą, Zareaguj na wiadomość zamiast odpowiadać, Nie wysyłaj żadnej wiadomości, Emoji do reakcji, Usuń odpowiedź po, Dodatkowe odpowiedzi, Gdy jest kilka odpowiedzi |
| Role | Role do nadania, Role do usunięcia, Zastosuj te role do |
| Limity | Czas odnowienia (sekundy), Czas odnowienia dotyczy, Zatrzymaj po tylu użyciach, Przestań działać po, Minimalny wiek konta (minuty), Minimalny czas na serwerze (minuty), Aktywny tylko o określonych godzinach z polami Od, Do i W te dni |
| Koszty i nagrody | Kosztuje użytkownika, Wypłaca użytkownikowi, Nadaje XP, Wymaga poziomu, Wiadomość, gdy nie mogą go użyć |
| Wymóg licznika | Nazwa licznika, Co najmniej, Co najwyżej |
| Uruchom przy zdarzeniu | Uruchom, gdy, Odpowiedz na |
| Organizacja | Kategoria, Potem uruchom wyzwalacz, Odpowiadaj botom zamiast ludziom |

Pasek boczny wyświetla kategorie, **Liczniki** oraz listę **Symboli zastępczych** na żywo, a także pole wyszukiwania wyzwalaczy i odpowiedzi.

## Konfiguracja krok po kroku

1. Otwórz **Wyzwalacze** w panelu. W **Trybie prostym** wpisz słowo wyzwalacza i zbuduj odpowiedź w edytorze, a następnie utwórz wyzwalacz.
2. Rozwiń nową kartę. W sekcji **Kiedy pasuje** włącz **Dopasuj w dowolnym miejscu wiadomości**, jeśli słowo ma działać w środku zdania.
3. W sekcji **Jak odpowiada** wybierz, czy odpowiadać, wysyłać DM, czy usuwać wiadomość członka.
4. W sekcji **Limity** ustaw czas odnowienia, aby nie dało się go spamować.
5. Wpisz przykładową wiadomość w polu **Przetestuj ten wyzwalacz** i naciśnij **Testuj**. Napraw to, co według testera blokuje wyzwalacz.
6. Aby utworzyć ogłoszenie o awansie, stwórz wyzwalacz z dowolnym tekstem, ustaw **Uruchom, gdy** na „Członek awansuje na wyższy poziom”, zostaw **Odpowiedz na** puste, aby publikować tam, gdzie członek pisał, i użyj `%user.mention%` oraz `%xp.level%` w odpowiedzi.
7. Nadaj powiązanym wyzwalaczom **Kategorię**, aby móc wstrzymywać je razem.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniono). ID wyzwalaczy pokazuje `listchattriggers`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `addchattrigger <trigger> <response>` | `act`, `acr` | Administrator | Tworzy wyzwalacz; wielowyrazowe wyzwalacze ujmij w cudzysłów |
| `addchattriggerregex <pattern> <response>` | `actr` | Administrator | Tworzy wyzwalacz regex |
| `addreactiontrigger <emoji> <response>` | `addrt` | Administrator | Tworzy wyzwalacz reakcji |
| `editchattrigger <id> <response>` | `ect` | Administrator | Zastępuje główną odpowiedź |
| `deletechattrigger <id>` | `dct` | Administrator | Usuwa wyzwalacz |
| `listchattriggers` | `lct` | Administrator | Wypisuje wyzwalacze z ID |
| `listchattriggersgroup` | `lctg` | Administrator | Wypisuje wyzwalacze zgrupowane według tekstu |
| `showchattrigger <id>` | `sct` | Administrator | Pokazuje ustawienia jednego wyzwalacza |
| `cttoggle <id>` | `chattriggertoggle` | Administrator | Wstrzymuje lub wznawia wyzwalacz |
| `ctca <id>` | | Administrator | Przełącza dopasowanie w dowolnym miejscu |
| `ctat <id>` | | Administrator | Przełącza zezwolenie na wskazanie |
| `ctdm <id>` | | Administrator | Przełącza odpowiedź w DM |
| `ctad <id>` | | Administrator | Przełącza usuwanie wiadomości wyzwalającej |
| `rtt <id>` | `reactottrigger` | Administrator | Przełącza reagowanie na wiadomość zamiast odpowiedzi |
| `ctnr <id>` | `chattriggernoresponse` | Administrator | Przełącza niewysyłanie wiadomości |
| `ctreply <id>` | `chattriggerreply` | Administrator | Przełącza odpowiadanie na wiadomość |
| `ctdeleteafter <id> <seconds>` | `chattriggerdeleteafter` | Administrator | Usuwa odpowiedź po upływie czasu |
| `ctreact <id> [emoji...]` | `ctr` | Administrator | Ustawia do sześciu reakcji lub je czyści |
| `ctaddresponse <id> <response>` | `chattriggeraddresponse` | Administrator | Dodaje dodatkową odpowiedź |
| `ctclearresponses <id>` | `chattriggerclearresponses` | Administrator | Usuwa dodatkowe odpowiedzi |
| `ctresponsemode <id> <mode>` | `chattriggerresponsemode` | Administrator | `Single`, `Random`, `RoundRobin` lub `All` |
| `ctprefixtype <id> <type>` | `chattriggersprefixtype` | Administrator | `None`, `Global`, `GuildOrGlobal`, `GuildOrNone` lub `Custom` |
| `ctprefix <id> <prefix>` | `chattriggersprefix` | Administrator | Ustawia własny prefiks |
| `chattriggervalidtype <id> <type> <true or false>` | `ctvalidtype`, `ctvt` | Administrator | Włącza lub wyłącza typ wyzwalacza |
| `ctallowbots <id>` | `chattriggerallowbots` | Administrator | Przełącza odpowiadanie tylko na wiadomości botów |
| `ctrgranttoggle <id> @role` | `ctgt`, `ctgranttoggle` | Administrator | Przełącza rolę do nadania |
| `ctrremovetoggle <id> @role` | `ctrt`, `ctremovetoggle` | Administrator | Przełącza rolę do usunięcia |
| `chattriggerrolegranttype <id> <type>` | `ctrolegranttype`, `ctrgt` | Administrator | `Sender`, `Mentioned` lub `Both` |
| `chattriggerscrosspostchannel <id> <#channel>` | `ctcpch`, `ctcpchannel`, `ctcrosspostchannel`, `ctcrosspostch` | Administrator | Crosspost na kanał |
| `chattriggerscrosspostwebhook <id> <url>` | `ctcpwh`, `ctcpwebhook`, `ctcrosspostwebhook`, `ctcrosspostwh` | Administrator | Crosspost przez webhook |
| `setctintertype <id> <type>` | `ctitype`, `ctintertype` | Administrator | `None`, `Slash`, `Message` lub `User` |
| `setctintername <id> <name>` | `ctiname`, `ctrealname` | Administrator | Nazwa komendy aplikacji |
| `setctinterdesc <id> <description>` | `ctidesc`, `ctinterdesc` | Administrator | Opis komendy aplikacji |
| `ctinterephemeral <id> <true or false>` | `ctieph` | Administrator | Odpowiedź interakcji typu ephemeral |
| `ctintererrors` | `ctierrors`, `ctie` | Administrator | Pokazuje błędy rejestracji komend |
| `ctevent <id> <event>` | `chattriggerevent` | Administrator | Uruchamianie przy zdarzeniu, lub `None`, aby przestać |
| `cteventchannel <id> [#channel]` | `chattriggereventchannel` | Administrator | Kanał dla odpowiedzi na zdarzenia |
| `ctcooldown <id> <seconds> [scope]` | `chattriggercooldown` | Administrator | Czas odnowienia wyzwalacza |
| `ctreqlevel <id> <level>` | `chattriggerrequiredlevel` | Administrator | Wymagany poziom XP |
| `ctcost <id> <amount>` | `chattriggercost` | Administrator | Koszt w walucie |
| `ctreward <id> <amount>` | `chattriggerreward` | Administrator | Nagroda w walucie |
| `ctxpreward <id> <amount>` | `chattriggerxpreward` | Administrator | Nagroda XP |
| `ctreqmsg <id> [message]` | `chattriggerrequirementmessage` | Administrator | Wiadomość, gdy wymóg nie jest spełniony |
| `cttime <id> <start> <end> [days...]` | `chattriggertime` | Administrator | Aktywne godziny, lub `cttime <id> clear` |
| `ctexpiry <id> [duration]` | `chattriggerexpiry` | Administrator | Wygaśnięcie, lub none, aby wyczyścić |
| `ctmaxuses <id> <uses>` | `chattriggermaxuses` | Administrator | Limit użyć, 0 oznacza brak |
| `ctminage <id> [duration]` | `chattriggerminimumage` | Administrator | Minimalny wiek konta |
| `ctminmember <id> [duration]` | `chattriggerminimummembership` | Administrator | Minimalny czas na serwerze |
| `ctrequirecounter <id> <name> [min] [max]` | `chattriggerrequirecounter` | Administrator | Wymóg zakresu licznika |
| `ctcounters` | `chattriggercounters` | Nobody | Wypisuje liczniki |
| `ctcounterset <name> <value>` | `chattriggercounterset` | Administrator | Ustawia licznik |
| `ctcounterdelete <name>` | `chattriggercounterdelete` | Administrator | Usuwa licznik |
| `ctplaceholders` | `chattriggerplaceholders` | Nobody | Wypisuje dodawane symbole zastępcze |
| `ctcategory <id> [name]` | `chattriggercategory` | Administrator | Ustawia lub czyści kategorię |
| `ctcategorytoggle <name> <true or false>` | `chattriggercategorytoggle` | Administrator | Włącza lub wyłącza kategorię |
| `ctchain <id> <nextId>` | `chattriggerchain` | Administrator | Łączy z innym wyzwalaczem, 0 czyści |
| `cttest <id> <sample>` | `chattriggertest` | Administrator | Próbny przebieg dla przykładowej wiadomości |
| `ctstats <id>` | `chattriggerstats` | Administrator | Liczba uruchomień i ostatni użytkownicy |
| `ctsexport` | | Administrator | Eksportuje wyzwalacze jako YAML |
| `ctsimport [url]` | | Administrator | Importuje z URL lub załącznika |
| `ctsmigrate` | `ctsconvert` | Administrator | Konwertuje stary format embedów, z kopią zapasową |
| `ctsclear` | | Administrator | Usuwa wszystkie wyzwalacze |
| `ctsreload` | | Właściciel bota | Przeładowuje wyzwalacze z bazy danych |

## Wskazówki i pułapki

- Wyzwalacze są dopasowywane do wiadomości zapisanej małymi literami, więc tekst wyzwalacza w praktyce nie rozróżnia wielkości liter.
- Wyzwalacz z wyłączonym **Dopasuj w dowolnym miejscu** musi być całą wiadomością. `hello there` nie uruchomi wyzwalacza `hello`, dopóki go nie włączysz lub nie włączysz wskazywania.
- Nadawanie ról wymaga Zarządzania rolami, a rola bota musi być wyżej niż rola, której to dotyczy. Komenda dodająca rolę do listy sprawdza też, czy Ty możesz nią zarządzać.
- Wyzwalacze tylko dla botów nigdy nie odpowiadają ludziom, a wyzwalacze dla ludzi nigdy nie odpowiadają botom; jeden wyzwalacz nie może robić obu rzeczy.
- Czasy odnowienia są trzymane w pamięci i resetują się po restarcie bota. Limity użyć i wygaśnięcie są zapisywane i przetrwają restarty.
- Kolejność round robin jest wspólna dla wszystkich na serwerze, nie jest śledzona osobno dla każdego członka.
- Wpisy systemu uprawnień dla modułu `ActualChatTriggers` oraz każdy `permoverride` dla tekstu wyzwalacza są sprawdzane przed własnymi warunkami wyzwalacza.
- Wyzwalacze interakcji rejestrują prawdziwe komendy aplikacji, więc obowiązują limity Discorda dotyczące liczby i nazw komend. Gdy któraś się nie pojawia, sprawdź `ctintererrors`.
- Reakcje na odpowiedź są dodawane po jednej na sekundę, więc sześć emoji pojawia się przez sześć sekund.
- Wyzwalacze zdarzeń dla dołączeń, odejść, kanałów głosowych i boostów po cichu nic nie robią, dopóki nie ustawisz **Odpowiedz na**.

---
title: Bot Twitch
slug: twitch
summary: Uruchom Mewdeko na własnym czacie Twitch z własnymi komendami, timerami, cytatami i licznikami oraz kieruj suby, raidy, odbiory nagród za punkty kanału i starty streama na Discorda.
icon: fa-brands fa-twitch
category: Community
dashboard: /dashboard/twitch
module: Twitch
tags: [twitch, chat bot, streamer, commands, timers, quotes, counters, channel points, redemptions, subs, raids, account link, role sync, eventsub, bot czatu, streamer, komendy, timery, cytaty, liczniki, punkty kanału, subskrypcje, raidy, powiązanie konta, synchronizacja ról]
related: [streams, administration]
---

## Co robi

Bot Twitch łączy jeden kanał Twitch z Twoim serwerem Discord i pozwala Mewdeko działać jako bot czatu na tym kanale. Widzowie wpisują `!ping`, `!quote`, `!counter deaths` lub Twoje własne komendy na czacie Twitch, a bot odpowiada tam na miejscu. Timery publikują powtarzające się wiadomości, gdy jesteś na żywo, cytaty i liczniki są przechowywane osobno dla każdego serwera, a nagrody za punkty kanału mogą wywołać odpowiedź na czacie lub post na Discordzie.

Zdarzenia z kanału wracają na Discorda. Gdy kanał rozpocznie transmisję, na kanał Discord trafia post o starcie streama; subskrypcje, subskrypcje w prezencie i raidy mogą publikować na własnych kanałach według Twojego szablonu, a podsumowanie po zakończeniu streama może zawierać czas trwania, szczyt widzów, liczbę wiadomości na czacie, suby i raidy.

Widzowie mogą powiązać swoje konto Twitch z kontem Discord. Po powiązaniu bot wie, który członek Discorda pisze na Twitchu, a synchronizacja ról może nadawać role Discorda subskrybentom, VIP-om, moderatorom lub nadawcy.

> [!NOTE]
> To nie to samo co Alerty streamów. Alerty streamów tylko obserwują publiczne kanały na kilku platformach i ogłaszają, gdy zaczną transmisję. Bot Twitch wymaga autoryzacji Twojego własnego konta Twitch i daje botowi obecność na Twoim czacie. Jeśli oba są skonfigurowane dla tego samego kanału Twitch, post o starcie streama od Bota Twitch zastępuje ten z Alertów streamów, żeby nie było duplikatów.

## Do czego Ci się przyda

- Streamujesz na Twitchu i chcesz jednego bota dla Discorda i czatu Twitch, z tymi samymi własnymi komendami i linkami do social mediów w obu miejscach.
- Chcesz, by suby i raidy były celebrowane na Discordzie na bieżąco.
- Chcesz mieć role subskrybentów lub VIP-ów na Discordzie bez ręcznego ich nadawania.
- Chcesz, by nagroda za punkty kanału, np. nawodnienie lub rozciąganie, naprawdę coś mówiła na czacie i zapisywała się na Discordzie.
- Twoi moderatorzy potrzebują komendy shoutoutu, losowania celu raidu i listy cytatów, która przetrwa między streamami.

## Łączenie

W grę wchodzą dwie autoryzacje Twitch, obie wykonywane na karcie **Konfiguracja**, w podkarcie **Połączenie**.

| Autoryzacja | Kto ją wykonuje | Co przyznaje |
| --- | --- | --- |
| Konto bota | Tylko właściciel bota | Konto Twitch, jako które bot pisze na czacie. Zakresy `user:read:chat`, `user:write:chat`, `user:bot`. Jedna współdzielona tożsamość dla wszystkich serwerów. |
| Kanał nadawcy | Ty, streamer | Dostęp do zdarzeń Twojego kanału. Zakresy `channel:bot`, subskrypcje, bity, odbiory nagród, ankiety, predykcje, zarządzanie transmisją, edycja klipów i moderacja. |

Integracja jest uznawana za skonfigurowaną, gdy istnieje konto bota, Twój kanał jest autoryzowany, a konfiguracja jest włączona. Panel **Stan** pokazuje transport (EventSub WebSocket lub starszy IRC), ostatnio odebrane zdarzenie, wygaśnięcie tokenów obu kont, a w sekcji **Zaawansowana diagnostyka** brakujące zakresy i zapisane subskrypcje EventSub.

Odłączenie kanału usuwa Twoją autoryzację i wyłącza integrację. Konto bota może odłączyć tylko właściciel bota.

## Komendy czatu na Twitchu

Każdy połączony kanał dostaje te wbudowane komendy. Prefiks domyślnie to `!` i można go zmienić, do pięciu znaków. Własne komendy są wyszukiwane tylko wtedy, gdy żadna wbudowana nie pasuje do nazwy.

| Komenda | Kto może jej użyć | Co robi |
| --- | --- | --- |
| `!ping` | Wszyscy | Odpowiada pongiem |
| `!uptime` | Wszyscy | Jak długo działa proces bota |
| `!commands` | Wszyscy | Wypisuje wbudowane i włączone własne komendy |
| `!discord` | Wszyscy | Pokazuje, które konto Discord jest powiązane z użytkownikiem wywołującym |
| `!link` | Wszyscy | Generuje sześciocyfrowy kod do powiązania kont |
| `!rank` | Wszyscy | Pokazuje ustaloną rangę użytkownika wywołującego |
| `!stream` | Wszyscy | Stan transmisji, tytuł, kategoria, widzowie i czas trwania, lub „offline” |
| `!schedule` | Wszyscy | Publikuje wiadomość z harmonogramem ustawioną przez moderatorów |
| `!socials` | Wszyscy | Publikuje wiadomość z linkami do social mediów ustawioną przez moderatorów |
| `!quote [id]` | Wszyscy | Losowy cytat lub konkretny według numeru |
| `!quote add <text> [-- author]` | Moderator | Zapisuje cytat, opcjonalnie z autorem po `--` |
| `!quote remove <id>` | Moderator | Usuwa cytat (działa też `delete`) |
| `!counter <name>` | Wszyscy | Pokazuje wartość licznika |
| `!counter <name> +` | Moderator | Dodaje jeden (działa też `++` lub `add`); `-`, `--` lub `sub` odejmują jeden; `reset` ustawia na 0; liczba ustawia wartość bezpośrednio |
| `!so <user>` | Moderator | Poleca inny kanał Twitch (shoutout) |
| `!raidtarget` | Moderator | Proponuje losowy kanał z listy celów raidu |

### Rangi

Ranga użytkownika czatu wynika z jego odznak Twitch. Najwyższy jest Nadawca, potem Moderator, VIP, Subskrybent (odznaki założyciela liczą się jako subskrybent), a na końcu Wszyscy. Komendy, własne komendy i synchronizacja ról porównują się z tą kolejnością, więc Moderator może uruchomić wszystko ustawione na VIP, Subskrybenta lub Wszystkich.

## Własne komendy

Własne komendy dodaje się w panelu w sekcji **Komendy**, **Własne komendy**, albo przez `/twitch commands add`. Nazwy są zapisywane małymi literami, mogą mieć do 32 znaków i zawierać litery, cyfry, myślniki i podkreślniki. Każda komenda ma **Uprawnienie** (Wszyscy, Subskrybent, Vip, Moderator, Nadawca), wartość **Czas odnowienia (sekundy)** od 0 do 86400, przełącznik **Włączone** oraz **Odpowiedź**. Czas odnowienia jest wspólny dla całego kanału, a nie dla poszczególnych użytkowników. Liczba użyć jest śledzona i widoczna na liście.

Panel ma też pole **Argumenty testowe** i podgląd, dzięki którym zobaczysz wygenerowaną odpowiedź przed zapisem.

### Symbole zastępcze w odpowiedziach

| Symbol zastępczy | Wartość |
| --- | --- |
| `%user%` | Login Twitch użytkownika czatu |
| `%display%` | Wyświetlana nazwa użytkownika czatu |
| `%channel%` | Login Twojego kanału Twitch |
| `%args%` | Wszystko wpisane po nazwie komendy |
| `%target%` | Pierwsze słowo po nazwie komendy |
| `%discord%` | ID powiązanego użytkownika Discord lub puste |
| `%random:a\|b\|c%` | Jedna losowo wybrana opcja |
| `%count:name%` | Bieżąca wartość licznika o danej nazwie |
| `%stream%` | To samo podsumowanie, które daje `!stream` |

> [!EXAMPLE]
> `!hug` z odpowiedzią `%display% hugs %target%! That is hug number %count:hugs%.`

## Timery

Timery publikują wiadomość na czacie Twitch według harmonogramu. Zarządzasz nimi w sekcji **Komendy**, **Timery**, albo przez `/twitch timers`.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Nazwa timera | | Te same zasady nazewnictwa co dla komend |
| Interwał (minuty) | 10 | Od 1 do 1440 minut między postami |
| Minimalna liczba wiadomości na czacie | 5 | Liczba wiadomości na czacie, które muszą pojawić się od ostatniego posta, zanim opublikuje kolejny; 0 wyłącza sprawdzanie |
| Tylko online | włączone | Publikuje tylko, gdy kanał jest na żywo |
| Losowa rotacja | wyłączone | Wybiera losową linię zamiast przechodzić po kolei |
| Włączone | włączone | Czy timer działa |
| Wiadomości | | Jedna wiadomość w linii |

Harmonogram sprawdza timery co 30 sekund. Linie timera obsługują `%channel%`, `%url%`, `%stream%`, `%count:name%` oraz `%random:a|b|c%`. `/twitch timers test` (lub przycisk testu w panelu) publikuje timer natychmiast.

## Cytaty i liczniki

Cytaty są przechowywane z tekstem, opcjonalnym autorem i osobą, która je dodała. Podkarta **Cytaty** w panelu pozwala moderatorom dodawać je, wyszukiwać i usuwać; widzowie używają `!quote`. Liczniki to proste nazwane liczby całkowite, które moderatorzy zwiększają z czatu; moderatorzy serwera mogą ustawiać wartości przez `/twitch commands counter-set` i wypisywać je przez `counter-list`.

## Zdarzenia na Discordzie

Karta **Zdarzenia**, podkarta **Alerty**, zawiera ustawienia subów, raidów i punktów kanału. Post o starcie streama znajduje się w **Konfiguracja**, **Ustawienia bota**, **Kierowanie zdarzeń**.

### Start streama i zakończenie

Gdy kanał rozpocznie transmisję, bot publikuje post na **Kanał Discord dla startu streama**. Bez **Wiadomość o starcie streama** wysyła domyślny embed: nazwę streamera z linkiem do kanału, tytuł jako linię autora, status, liczbę widzów, kategorię i obraz podglądu. Własna wiadomość przechodzi przez kreator embedów, więc działają pełne embedy i komponenty. Gdy kanał zakończy transmisję, na ten sam kanał trafia krótki czerwony embed „Offline”.

| Symbol zastępczy | Wartość |
| --- | --- |
| `%streamer%` | Wyświetlana nazwa nadawcy |
| `%title%` | Tytuł streama |
| `%game%` | Nazwa kategorii |
| `%url%` | `https://twitch.tv/<channel>` |
| `%viewers%` | Aktualna liczba widzów |

### Subskrypcje i raidy

To zwykłe wiadomości tekstowe. Domyślna wiadomość o subie: `%display% subscribed to %channel%!`, a dla prezentów `%display% received a gifted sub on %channel%!`. Domyślna wiadomość o raidzie: `%raider% raided %channel% with %viewers% viewers!`.

| Zdarzenie | Symbole zastępcze |
| --- | --- |
| Sub | `%user%`, `%display%`, `%channel%`, `%tier%` |
| Raid | `%raider%`, `%channel%`, `%viewers%` |

Każdy alert ma w panelu przycisk **Wyślij test**, a lista **Historia zdarzeń** pokazuje ostatnie zdarzenia i wysłane testy.

### Akcje za punkty kanału

W sekcji **Akcje za punkty kanału** przypisz **Tytuł nagrody** (dopasowywany bez rozróżniania wielkości liter) do **Odpowiedź na Twitchu**, **Kanał Discord** z **Wiadomość na Discordzie**, lub do obu. Symbole zastępcze: `%user%`, `%display%`, `%channel%`, `%reward%`, `%input%` (to, co wpisał widz) oraz `%url%`.

### Podsumowanie streama

`/twitch events recap-channel` ustawia kanał, który po zakończeniu streama otrzymuje embed: czas trwania, szczyt widzów, wiadomości na czacie, suby, raidy oraz ostatni tytuł i kategorię. Podsumowań nie ma w panelu.

## Powiązanie kont i synchronizacja ról

Są dwa sposoby powiązania członka Discorda z loginem Twitch:

1. Samoobsługowo: widz wpisuje `!link` na czacie Twitch, dostaje sześciocyfrowy kod i w ciągu dziesięciu minut uruchamia `/twitch claim <code>` na Discordzie.
2. Przez moderatorów: karta **Powiązania kont** lub `/twitch links add @user twitchlogin`.

Jeden login Twitch na członka Discorda na serwer. Po powiązaniu `%discord%` wypełnia się dla tego widza i działa synchronizacja ról.

Synchronizacja ról przypisuje rangę Twitch do roli Discorda przez `/twitch rolesync add`. Za każdym razem, gdy powiązany widz wyśle wiadomość na czacie, bot dodaje rolę, jeśli jego ranga jest równa przypisanej lub wyższa, i usuwa ją, jeśli jest niższa. Synchronizacja ról jest dostępna tylko przez komendy slash.

## Narzędzia na żywo

Podkarta **Narzędzia na żywo** na karcie **Zdarzenia** udostępnia akcje operatora streamu, które używają autoryzacji Twojego kanału: wysłanie wiadomości na czacie jako bot, utworzenie znacznika streama, utworzenie klipu, rozpoczęcie ankiety (jedna opcja w linii, domyślnie 60 sekund) oraz timeout (domyślnie 600 sekund), ban, odbanowanie lub usunięcie wiadomości według ID. `/twitch stream-info` i `/twitch clip` obsługują z Discorda tytuł, kategorię i klipy.

## Ustawienia

W sekcji **Konfiguracja**, **Ustawienia bota**:

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Prefiks komend | `!` | Prefiks komend czatu Twitch, do 5 znaków |
| Nadpisanie języka | domyślny serwera | Znacznik BCP-47, np. `de-DE`, używany w odpowiedziach bota na czacie |
| Włącz bota czatu Twitch dla tego serwera | włączone | Główny przełącznik; wyłączenie zachowuje konfigurację |
| Używaj EventSub do zdarzeń czatu | włączone | Odbiera czat i zdarzenia przez EventSub; po wyłączeniu komendy czatu nie działają |
| Kanał Discord dla startu streama | brak | Dokąd trafiają posty o starcie i zakończeniu streama |
| Wiadomość o starcie streama | domyślny embed | Własny szablon z symbolami zastępczymi startu streama |

W sekcji **Zdarzenia**, **Alerty**: **Kanał Discord dla subskrypcji**, **Wiadomość o subskrypcji**, **Kanał Discord dla raidów**, **Wiadomość o raidzie** oraz lista akcji za punkty kanału.

## Konfiguracja krok po kroku

1. Otwórz **Bot Twitch** w panelu. Najpierw właściciel bota musi połączyć **Konto bota**; podkarta **Połączenie** pokazuje, czy ono istnieje.
2. Kliknij **Połącz kanał** i autoryzuj własnym kontem Twitch.
3. W **Ustawieniach bota** ustaw prefiks, włącz **Włącz bota czatu Twitch dla tego serwera**, wybierz **Kanał Discord dla startu streama** i zapisz.
4. W **Komendach** dodaj kilka własnych komend i timer z linkami do social mediów. Użyj **Argumenty testowe** i podglądu, aby sprawdzić symbole zastępcze.
5. W **Zdarzeniach**, **Alertach** wybierz kanały dla subów i raidów i dla każdego naciśnij **Wyślij test**.
6. Wpisz `!ping` na swoim czacie Twitch, aby potwierdzić, że bot nasłuchuje, a następnie `!link` i `/twitch claim`, aby powiązać siebie.
7. Opcjonalnie uruchom `/twitch rolesync add Subscriber @Subs`, aby powiązani subskrybenci dostawali rolę.

## Komendy

Ten moduł to wyłącznie komendy slash. Wpisz `/twitch` na Discordzie, aby je zobaczyć. Odpowiedzi widzisz tylko Ty.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `/twitch set <channel> [prefix]` | | Zarządzanie serwerem | Ustawia kanał Twitch i prefiks oraz włącza integrację |
| `/twitch remove` | | Zarządzanie serwerem | Wyłącza integrację i opuszcza kanał |
| `/twitch enable` | | Zarządzanie serwerem | Włącza integrację z powrotem |
| `/twitch disable` | | Zarządzanie serwerem | Wyłącza ją bez usuwania ustawień |
| `/twitch config` | | Nobody | Pokazuje kanał, prefiks, stan włączenia, kanał startu streama i język |
| `/twitch claim <code>` | | Nobody | Odbiera kod powiązania z `!link` |
| `/twitch stream-info [title] [category]` | | Zarządzanie serwerem | Aktualizuje tytuł lub kategorię streama |
| `/twitch clip` | | Zarządzanie serwerem | Tworzy klip z bieżącego streama |
| `/twitch status` | | Zarządzanie serwerem | Podsumowanie stanu: konta, tokeny, stan EventSub |
| `/twitch language <tag>` | | Zarządzanie serwerem | Język odpowiedzi na czacie; puste resetuje |
| `/twitch prefix <prefix>` | | Zarządzanie serwerem | Zmienia prefiks komend czatu |
| `/twitch commands add <name> <response> [permission] [cooldown]` | | Zarządzanie serwerem | Dodaje lub aktualizuje własną komendę |
| `/twitch commands remove <name>` | | Zarządzanie serwerem | Usuwa własną komendę |
| `/twitch commands list` | | Nobody | Wypisuje własne komendy z uprawnieniem, czasem odnowienia i liczbą użyć |
| `/twitch commands counter-set <name> <value>` | | Zarządzanie serwerem | Ustawia licznik |
| `/twitch commands counter-list` | | Nobody | Wypisuje liczniki |
| `/twitch commands schedule-set <message>` | | Zarządzanie serwerem | Ustawia odpowiedź `!schedule` |
| `/twitch commands schedule-clear` | | Zarządzanie serwerem | Czyści ją |
| `/twitch commands socials-set <message>` | | Zarządzanie serwerem | Ustawia odpowiedź `!socials` |
| `/twitch commands socials-clear` | | Zarządzanie serwerem | Czyści ją |
| `/twitch timers add <name> <messages> [interval] [minchat] [onlineonly] [randomize]` | | Zarządzanie serwerem | Dodaje lub aktualizuje timer |
| `/twitch timers remove <name>` | | Zarządzanie serwerem | Usuwa timer |
| `/twitch timers list` | | Nobody | Wypisuje timery |
| `/twitch timers enable <name>` | | Zarządzanie serwerem | Włącza timer |
| `/twitch timers disable <name>` | | Zarządzanie serwerem | Wyłącza timer |
| `/twitch timers test <name>` | | Zarządzanie serwerem | Publikuje timer od razu |
| `/twitch events golive-channel <channel> [message]` | | Zarządzanie serwerem | Ustawia kanał startu streama i szablon |
| `/twitch events golive-clear` | | Zarządzanie serwerem | Czyści kanał startu streama |
| `/twitch events sub-channel <channel> [message]` | | Zarządzanie serwerem | Ustawia kanał subów i szablon |
| `/twitch events sub-clear` | | Zarządzanie serwerem | Wyłącza posty o subach |
| `/twitch events raid-channel <channel> [message]` | | Zarządzanie serwerem | Ustawia kanał raidów i szablon |
| `/twitch events raid-clear` | | Zarządzanie serwerem | Wyłącza posty o raidach |
| `/twitch events recap-channel <channel>` | | Zarządzanie serwerem | Ustawia kanał podsumowań streama |
| `/twitch events recap-clear` | | Zarządzanie serwerem | Wyłącza podsumowania |
| `/twitch links add <@user> <twitchlogin>` | | Zarządzanie serwerem | Powiązuje członka z loginem Twitch |
| `/twitch links remove <@user>` | | Zarządzanie serwerem | Usuwa powiązanie członka |
| `/twitch links list` | | Nobody | Wypisuje wszystkie powiązania |
| `/twitch rolesync add <rank> <@role>` | | Zarządzanie serwerem | Nadaje rolę powiązanym widzom o randze równej lub wyższej |
| `/twitch rolesync remove <rank> <@role>` | | Zarządzanie serwerem | Usuwa przypisanie |
| `/twitch rolesync list` | | Nobody | Wypisuje przypisania |
| `/twitch redemptions add <reward> [twitchreply] [channel] [discordmessage]` | | Zarządzanie serwerem | Dodaje lub aktualizuje akcję za punkty kanału |
| `/twitch redemptions remove <reward>` | | Zarządzanie serwerem | Usuwa jedną |
| `/twitch redemptions list` | | Nobody | Wypisuje akcje |
| `/twitch raidtargets add <twitchlogin> [note]` | | Zarządzanie serwerem | Dodaje kanał do puli `!raidtarget` |
| `/twitch raidtargets remove <twitchlogin>` | | Zarządzanie serwerem | Usuwa jeden |
| `/twitch raidtargets list` | | Nobody | Wypisuje cele raidów |

## Wskazówki i pułapki

- Konto bota jest współdzielone przez wszystkie serwery danego bota. Jeśli nikt go nie połączył, odpowiedzi na czacie nie mogą być wysyłane niezależnie od konfiguracji.
- Komendy czatu działają tylko wtedy, gdy włączone jest **Używaj EventSub do zdarzeń czatu**. Jeśli panel Stanu pokazuje Starszy IRC, włącz to z powrotem.
- Stan transmisji jest też odpytywany raz na minutę, więc post o starcie streama może się spóźnić względem faktycznego startu do minuty.
- Czasy odnowienia własnych komend są liczone dla kanału, a nie dla widza. Czas odnowienia 30 sekund oznacza jedno użycie na 30 sekund dla wszystkich.
- Synchronizacja ról działa, gdy powiązany widz pisze na czacie, a nie według harmonogramu. Subskrybent, który nigdy nie pisze na czacie, nigdy nie dostanie roli, a były subskrybent zachowa ją, dopóki znów nie napisze.
- Zmiany ról wymagają, by rola bota była nad synchronizowaną rolą, oraz Zarządzania rolami.
- Nieznane rangi przekazane do `rolesync` zamieniają się na Subskrybenta, a nieznane uprawnienia przekazane do `commands add` na Wszystkich.
- Kody powiązania wygasają po dziesięciu minutach, a wygenerowanie nowego unieważnia stary.
- Timeouty i bany z Narzędzi na żywo używają zakresów moderacji Twojego kanału, więc w Twitch pojawiają się jako akcje wykonane przez autoryzowane konto.
- Nadpisanie języka zmienia tylko odpowiedzi na czacie Twitch. Odpowiedzi na Discordzie zachowują język serwera.

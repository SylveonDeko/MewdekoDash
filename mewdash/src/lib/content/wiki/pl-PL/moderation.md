---
title: Moderacja
slug: moderation
summary: Ostrzegaj, wyciszaj, nakładaj timeouty, wyrzucaj i banuj członków, automatycznie eskaluj kary wraz ze wzrostem liczby ostrzeżeń i kontroluj, z ilu dni wiadomości usuwa ban.
icon: fa-flag
category: Security
dashboard: /dashboard/moderation
module: Moderation
tags: [moderation, warn, warnings, warn punish, punishment ladder, mute, mute role, timeout, ban, softban, kick, ban purge, ban prune, purge, prune, dehoist, warnlog, moderacja, ostrzeżenia, kary, wyciszenie, rola wyciszenia, wyrzucenie, czyszczenie przy banie, czyszczenie wiadomości]
related: [administration, filter, logging, auditlog]
---

## Co robi

Moderacja to zestaw narzędzi, których staff używa wobec pojedynczych członków. Sercem są ostrzeżenia: moderator wpisuje `warn @user reason`, członek dostaje DM z powodem i informacją, kto go ostrzegł, ostrzeżenie zostaje zapisane, a jeśli serwer ma kanał logów ostrzeżeń, trafia tam embed z liczbą ostrzeżeń i ewentualną karą, która się uruchomiła.

Ostrzeżenia się sumują. Możesz zbudować drabinkę kar, tak by osiągnięcie ustalonej liczby aktywnych ostrzeżeń automatycznie uruchamiało coś: wyciszenie, timeout, wyrzucenie, bana albo rolę. Staff nie musi pamiętać reguł; bot stosuje je w chwili osiągnięcia progu. Ostrzeżenia można później wybaczyć albo ustawić, by wygasały same po określonej liczbie dni.

Wokół tego są akcje bezpośrednie: wyciszenie (z zarządzaną rolą wyciszenia), timeout, wyrzucenie, softban, ban, ban tymczasowy, masowe wyrzucenie, czyszczenie wiadomości i porządkowanie nicków członków, którzy specjalnymi znakami wpychają się na górę listy. Każda akcja bana ma też konfigurowalne czyszczenie, czyli z ilu dni wiadomości członka Discord usuwa wiadomości razem z banem.

Strona w panelu obejmuje ostrzeżenia, drabinkę kar, kanał logów ostrzeżeń i ustawienia czyszczenia przy banie. Akcje bezpośrednie, takie jak wyciszenie, wyrzucenie i ban, są dostępne tylko jako komendy.

## Do czego się przydaje

- Chcesz spójnej polityki „trzech strajków”, która działa tak samo, niezależnie od tego, który moderator ma dyżur.
- Członków trzeba szybko uciszyć bez ręcznego grzebania w uprawnieniach kanałów.
- Dołączył spamer i chcesz, by ban usunął jego wiadomości z ostatniego dnia, ale ban tymczasowy dla stałego bywalca nie powinien wymazywać jego historii.
- Staff potrzebuje przeszukiwalnego zapisu, kto został ostrzeżony, przez kogo i dlaczego, który przetrwa zmiany w składzie moderatorów.
- Nazwy w stylu „!!! xXx” ciągle lądują na górze listy członków i chcesz je posprzątać za jednym razem.

## Ostrzeżenia

`warn <user> [reason]` wymaga uprawnienia Banowanie członków. Bot najpierw próbuje wysłać członkowi w DM embed z nazwą serwera, moderatorem i powodem. Jeśli DM się nie uda, potwierdzenie na kanale dostaje stopkę z taką informacją. Następnie ostrzeżenie jest zapisywane z nazwą moderatora i powodem albo `-`, jeśli go nie podano.

Członek musi być niżej od moderatora w hierarchii ról i niżej od bota. Jeśli nie jest, komenda odmawia.

`warnlog <user>` pokazuje stronicowaną listę, dziewięć na stronę, z datą, moderatorem i powodem. Wybaczone ostrzeżenia są przekreślone i pokazują, kto je wyczyścił. `warnlogall` wypisuje każdego członka z ostrzeżeniami jako `active (total - forgiven)`.

`warnclear <user> [index]` oznacza ostrzeżenia jako wybaczone. Bez indeksu albo z `0` wybacza wszystkie. Z indeksem wybacza tylko to jedno, numerowane tak jak w `warnlog`. Wybaczone ostrzeżenia zostają w logu, ale przestają się liczyć do kar. Panel może też usunąć ostrzeżenie całkowicie, co kasuje je na stałe.

### Wygasanie ostrzeżeń

`warnexpire <days> <clear|delete>` ustawia, jak długo ostrzeżenie się liczy. Liczba dni może wynosić od 0 do 366; 0 wyłącza wygasanie. Akcja decyduje, co się dzieje, gdy ostrzeżenie się zestarzeje:

| Akcja | Co się dzieje |
| --- | --- |
| Clear | Ostrzeżenie jest oznaczane jako wybaczone i zostaje w logu |
| Delete | Ostrzeżenie jest usuwane z bazy danych |

Wygasanie jest sprawdzane co dwanaście godzin oraz raz natychmiast po ustawieniu.

### Kanał logów ostrzeżeń

Ustawisz go komendą `setwarnchannel #channel` albo selektorem **Kanał logów ostrzeżeń** na karcie Kary w panelu. Każde ostrzeżenie publikuje tam embed z nazwą i ID członka, jego aktualnym numerem ostrzeżenia, karą, która się uruchomiła (lub „None”), powodem i linkiem do wiadomości, która wydała ostrzeżenie.

## Kary za ostrzeżenia

Drabinka to lista reguł „przy N aktywnych ostrzeżeniach zrób X”. Gdy ostrzeżenie zostaje wydane, bot liczy aktywne ostrzeżenia członka razem z nowym i szuka reguły z dokładnie tą liczbą. Uruchamia się tylko dokładne dopasowanie, więc członek z regułą na 3, który jakimś cudem dojdzie do 4 bez reguły na 4, nie dostanie nic dodatkowego.

Regułę ustawisz komendą `warnpunish <number> <punishment> [time]` albo `warnpunish <number> addrole <role> [time]` dla wariantu z rolą. `warnpunish <number>` bez niczego więcej usuwa regułę. `warnpunishlist` pokazuje drabinkę.

| Kara | Czasowa? | Co robi |
| --- | --- | --- |
| Mute | Opcjonalnie | Nadaje rolę wyciszenia albo wyciszenie czasowe, jeśli podano czas |
| ChatMute | Opcjonalnie | Tylko rola wyciszenia, bez wyciszenia głosu |
| VoiceMute | Opcjonalnie | Tylko serwerowe wyciszenie głosu |
| Timeout | Wymagana, do 28 dni | Timeout Discorda |
| Kick | Nie | Wyrzuca członka |
| Softban | Nie | Banuje i od razu odbanowuje, by usunąć wiadomości |
| Ban | Opcjonalnie | Ban permanentny albo czasowy, jeśli podano czas |
| AddRole | Opcjonalnie | Dodaje wybraną rolę, po czasie zdejmowaną, jeśli go ustawiono |
| RemoveRoles | Nie | Zabiera członkowi role |

Czasy są zapisywane w minutach i mogą wynosić do 49 dni. Softban, Kick i RemoveRoles odrzucają czas. Timeout nie da się zapisać bez niego. Kary są wykonywane z powodem „Warned too many times.”

W panelu ta sama drabinka znajduje się na karcie **Kary**: wybierz **Przy ostrzeżeniu nr**, **Karę**, opcjonalnie **Czas trwania (minuty)** oraz **Rolę do dodania** dla kary z rolą, a potem **Dodaj do drabinki**. Zapisanie reguły przy liczbie, która już ją ma, zastępuje ją.

> [!EXAMPLE]
> `warnpunish 2 mute 1h`, `warnpunish 3 timeout 1d`, `warnpunish 5 ban`. Dwa ostrzeżenia dają wyciszenie na godzinę, trzy timeout na dzień, pięć bana.

## Mini ostrzeżenia

Istnieje druga, niezależna ścieżka ostrzeżeń, zwana mini ostrzeżeniami, przeznaczona dla drobnych przewinień obsługiwanych przez młodszy staff. `mwarn` wymaga tylko uprawnienia Wyciszanie członków zamiast Banowanie członków. Ma własny log (`mwarnlog`, `mwarnlogall`), własną komendę czyszczenia, własne wygasanie, własną drabinkę kar (`mwarnpunish`) i własny kanał logów (`setmwarnchannel`). Mini ostrzeżenia nigdy nie liczą się do głównej drabinki i odwrotnie. Panel nie pokazuje mini ostrzeżeń.

## Wyciszenia i rola wyciszenia

Bot zarządza rolą wyciszenia. Domyślnie nazywa się `Mewdeko-mute`; zmienisz to komendą `muterole @role`, a samo `muterole` pokazuje obecną. Gdy po raz pierwszy potrzebne jest wyciszenie, bot tworzy rolę, jeśli nie istnieje, a następnie przechodzi po każdym kanale tekstowym i dodaje nadpisanie blokujące Wysyłanie wiadomości, Dodawanie reakcji, Załączanie plików, Wysyłanie wiadomości w wątkach i Tworzenie publicznych wątków. Wątki są pomijane. Na serwerach z wieloma kanałami może to chwilę potrwać.

| Komenda | Efekt |
| --- | --- |
| `mute` | Pełne wyciszenie: dodaje rolę wyciszenia |
| `chatmute` | Dodaje tylko rolę wyciszenia |
| `voicemute` | Serwerowo wycisza członka tylko na kanale głosowym |
| `stfu` | Blokuje Wysyłanie wiadomości dla tego członka tylko na bieżącym kanale, przez nadpisanie uprawnień |

Każda ma wersję czasową. Pełne wyciszenia trwają od jednej minuty do 90 dni; wyciszenia czatu i głosu od jednej minuty do 49 dni. `stfu` z czasem zdejmuje nadpisanie po upływie czasu. Wyciszeni członkowie dostają DM przy wyciszeniu i odciszeniu.

`removeonmute y` sprawia, że pełne wyciszenie zabiera też pozostałe role członka i je zapisuje, a `unmute` je zwraca. `removeonmute n` to wyłącza. `unmuteall` zdejmuje rolę wyciszenia ze wszystkich, którzy ją mają, po potwierdzeniu, opcjonalnie z powodem.

## Timeouty

`timeout <time> <user> [reason]` używa natywnego timeoutu Discorda, do 28 dni. Zarówno Ty, jak i bot potrzebujecie uprawnienia Moderowanie członków. `untimeout <user>` go zdejmuje. Powód trafia do dziennika audytu jako `moderator | reason`.

## Bany, wyrzucenia i softbany

`ban <user> [reason]` najpierw wysyła członkowi DM, potem banuje. `ban <time> <user> [reason]` to ban tymczasowy, który sam się kończy, do 49 dni. `ban <pruneTime> <time> <user>` jawnie ustawia okno czyszczenia i długość bana. Banowanie po ID działa dla osób, których nie ma na serwerze. `unban <user or id>` to cofa.

`softban <user> [reason]` banuje i od razu odbanowuje, czyli jest wyrzuceniem, które dodatkowo usuwa ostatnie wiadomości. `kick <user> [reason]` wyrzuca, a `masskick @a @b @c` wyrzuca kilka osób naraz i raportuje, ile się udało. `masskill` jest tylko dla właściciela bota i masowo banuje wklejoną listę ID.

### DM o banie

Wiadomość wysyłaną zbanowanemu członkowi można dostosować komendą `banmessage <text or embed code>`. Tekst przechodzi przez parser embedów, więc działa wszystko z kreatora embedów. Ustaw `-`, aby nie wysyłać DM w ogóle, a `banmsgreset` przywraca domyślną. `banmsgtest [duration] [reason]` wysyła Ci aktualny szablon, żebyś mógł go zobaczyć.

| Placeholder | Wartość |
| --- | --- |
| `%ban.mod%` | Pełna nazwa moderatora |
| `%ban.mod.name%` | Nazwa użytkownika moderatora |
| `%ban.user%` | Pełna nazwa zbanowanego członka |
| `%ban.user.name%` | Nazwa użytkownika zbanowanego członka |
| `%ban.reason%` lub `%reason%` | Powód albo `-`, jeśli go brak |
| `%ban.duration%` | Długość jako `d.hh:mm` albo `perma` |

Działają tu także placeholdery serwera, takie jak `%server.name%`.

## Czyszczenie przy banie

Każdy ban niesie ze sobą czyszczenie: liczbę dni wiadomości członka, które Discord usuwa razem z nim, od 0 do 7. Zamiast jednej globalnej liczby każdy rodzaj bana ma własną wartość domyślną i każdą z nich możesz nadpisać dla całego serwera, kategorii albo pojedynczego kanału.

| Akcja | Klucz | Wbudowana wartość domyślna |
| --- | --- | --- |
| Ban | `ban` | 7 dni |
| Ban po ID | `hackban` | 7 dni |
| Ban tymczasowy | `tempban` | brak |
| Softban | `softban` | 7 dni |
| Masowy ban | `massban` | 7 dni |
| Ban po hashu awatara | `banbyhash` | brak |
| Ban w roli | `baninrole` | brak |
| Ban według wieku | `banunder` | brak |
| Kara za ostrzeżenia | `warnpunish` | brak |
| Rola z auto-banem | `autobanrole` | brak |
| Monitor ról | `rolemonitor` | brak |
| Filtr | `filter` | brak |
| Blokada | `lockdown` | brak |
| Panel | `dashboard` | brak |

Gdy następuje ban, bot szuka najbardziej szczegółowego ustawienia: kanał, na którym uruchomiono komendę, potem kategoria tego kanału, potem domyślne ustawienie serwera. Na każdym poziomie ustawienie dla dokładnej akcji wygrywa z ustawieniem dla „wszystkich akcji”. Jeśli nic nie pasuje, obowiązuje wbudowana wartość domyślna.

`banprune` pokazuje, co wyczyściłby ban z bieżącego kanału, oraz każde skonfigurowane ustawienie. `banpruneset <action|all> <days> [#channel or category]` ustawia jedno, `banpruneclear <action|all> [#channel or category]` usuwa jedno, a `banprunereset` kasuje wszystkie.

Karta **Czyszczenie przy banie** w panelu wypisuje każdą akcję w sekcji **Domyślne ustawienia serwera** z polem na dni, wiersz zapasowy **Wszystkie akcje** oraz sekcję **Nadpisania**, w której wybierasz **Zakres** (kanał lub kategoria), cel, **Akcję** i **Czyszczenie (dni)**.

## Czyszczenie wiadomości

`purge [count] [flags]` usuwa do 1000 wiadomości na bieżącym kanale. Bez liczby usuwa ostatnie 100 wiadomości samego bota. `purge @user [count]` usuwa tylko wiadomości tego członka z ostatnich dwóch tygodni. Flagi można łączyć: `-s` pomija przypięte wiadomości, `-nb` pomija boty, `-ob` tylko boty, `-he` tylko wiadomości z embedami, `-ne` tylko bez, `-c text` tylko wiadomości zawierające tekst, `-b date` sprzed daty, a `-a date` po dacie.

`purgeuser <user> <count>` przeszukuje ostatnie `count` wiadomości (od 1 do 1000) na każdym kanale tekstowym i usuwa z każdego wiadomości tego użytkownika.

## Nicki

`dehoist <user>` i `sanitize <user>` przepisują nick jednego członka, usuwając początkowe znaki specjalne lub nietypowe znaki. `dehoistall [nicksOnly]` i `sanitizeall` robią to dla wszystkich po potwierdzeniu, jako zadanie w tle; `massnickprogress` raportuje postęp, a `massnickstop` je anuluje. Komendy dla pojedynczego członka wymagają od bota uprawnienia Zarządzanie pseudonimami; warianty „all” wymagają od bota uprawnienia Administrator. W obu przypadkach rola bota musi być wyżej niż dotknięci członkowie.

## Ustawienia

Strona w panelu ma pięć kart: **Przegląd** (liczby ostrzeżeń), **Ostrzeżenia**, **Kary**, **Ostatnia aktywność** i **Czyszczenie przy banie**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Kanał logów ostrzeżeń | brak | Kanał, który dostaje embed przy każdym ostrzeżeniu |
| Drabinka kar | pusta | Co uruchamia się przy każdej liczbie ostrzeżeń |
| Wygasanie ostrzeżeń | wyłączone | Liczba dni do wyczyszczenia lub usunięcia ostrzeżenia, tylko komendy |
| Rola wyciszenia | `Mewdeko-mute` | Rola nadawana przez komendy wyciszenia, tylko komendy |
| Zabieranie ról przy wyciszeniu | wyłączone | Zabieranie i przywracanie ról wokół pełnego wyciszenia, tylko komendy |
| Szablon DM o banie | domyślny embed | DM, który dostaje zbanowany członek, tylko komendy |
| Domyślne czyszczenie przy banie | według akcji | Liczba dni wiadomości usuwanych przy każdym rodzaju bana |
| Nadpisania czyszczenia przy banie | brak | Czyszczenie dla konkretnego kanału lub kategorii |

Na karcie **Ostrzeżenia** staff może ostrzec członka po ID użytkownika z wymaganym powodem, wyszukiwać po ID, powodzie lub moderatorze, ukryć wybaczone ostrzeżenia, wybaczyć jedno ostrzeżenie, wybaczyć wszystkie dla członka albo usunąć jedno na stałe.

> [!WARNING]
> Usunięcie ostrzeżenia z panelu kasuje je na dobre i przestaje się ono liczyć. Wybaczenie zachowuje zapis i także przestaje je liczyć. Wybaczaj, chyba że masz powód, by wymazać historię.

## Konfiguracja krok po kroku

1. Otwórz **Moderację** w panelu i przejdź do **Kar**.
2. Wybierz **Kanał logów ostrzeżeń**, który może czytać tylko staff.
3. Dodaj reguły do drabinki. Łagodny początek to Mute na 60 minut przy 2, Timeout na 1440 minut przy 3, Ban przy 5.
4. Uruchom `muterole @Muted`, jeśli masz już rolę wyciszenia, w przeciwnym razie pozwól botowi utworzyć `Mewdeko-mute` przy pierwszym użyciu.
5. Zdecyduj o wygasaniu za pomocą `warnexpire 90 clear`, by stare ostrzeżenia przestawały się liczyć po trzech miesiącach.
6. W **Czyszczeniu przy banie** ustaw **Ban tymczasowy** na 0, jeśli nie chcesz, by bany tymczasowe usuwały historię, i dodaj nadpisania dla kanałów, jeśli kanał ze spamem botów powinien czyścić więcej.
7. Przetestuj na koncie alt: `warn @alt test`, sprawdź kanał logów, potem `warnclear @alt`.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `warn <user> [reason]` | | Banowanie członków | Ostrzega członka i stosuje karę z drabinki |
| `warnlog <user or id>` | | Banowanie członków | Pokazuje ostrzeżenia członka |
| `warnlogall` | | Banowanie członków | Pokazuje liczby ostrzeżeń dla wszystkich |
| `warnclear <user> [index]` | `warnc` | Banowanie członków | Wybacza wszystkie ostrzeżenia albo jedno według numeru |
| `warnexpire <days> <clear|delete>` | `warne` | Administrator | Automatycznie czyści lub usuwa ostrzeżenia po określonej liczbie dni |
| `warnpunish <number> <punishment> [time]` | `warnp` | Banowanie członków | Ustawia regułę drabinki albo, gdy podano tylko numer, ją usuwa |
| `warnpunishlist` | `warnpl` | Nikt | Pokazuje drabinkę kar |
| `setwarnchannel <#channel>` | `warnchannel` | Administrator | Ustawia kanał logów ostrzeżeń |
| `mwarn <user> [reason]` | `miniwarn` | Wyciszanie członków | Wydaje mini ostrzeżenie |
| `mwarnlog [page] [user or id]` | | Wyciszanie członków, albo Nikt dla własnych | Pokazuje mini ostrzeżenia |
| `mwarnlogall` | `mwarnlogs` | Wyciszanie członków | Liczby mini ostrzeżeń dla wszystkich |
| `mwarnclear <user or id> [index]` | `mwarnc` | Administrator | Wybacza mini ostrzeżenia |
| `mwarnexpire <days> [clear|delete]` | `mwarne` | Administrator | Wygasanie mini ostrzeżeń |
| `mwarnpunish <number> <punishment> [time]` | `mwarnp` | Administrator | Ustawia lub usuwa regułę drabinki mini ostrzeżeń |
| `mwarnpunishlist` | `mwarnplist`, `mwarnpl` | Nikt | Pokazuje drabinkę mini ostrzeżeń |
| `setmwarnchannel <#channel>` | `mwarnchannel` | Administrator | Ustawia kanał logów mini ostrzeżeń |
| `timeout <time> <user> [reason]` | | Moderowanie członków | Nakłada timeout na członka, do 28 dni |
| `untimeout <user>` | | Moderowanie członków | Zdejmuje timeout |
| `mute <user> [time] [reason]` | | Zarządzanie rolami lub Wyciszanie członków | Pełne wyciszenie, opcjonalnie czasowe |
| `unmute <user> [reason]` | | Zarządzanie rolami lub Wyciszanie członków | Zdejmuje pełne wyciszenie |
| `chatmute [time] <user> [reason]` | | Zarządzanie rolami | Tylko rola wyciszenia |
| `chatunmute <user> [reason]` | | Zarządzanie rolami | Zdejmuje wyciszenie czatu |
| `voicemute [time] <user> [reason]` | | Wyciszanie członków | Tylko wyciszenie głosu |
| `voiceunmute <user> [reason]` | | Wyciszanie członków | Zdejmuje wyciszenie głosu |
| `stfu [time] <user>` | `cmute`, `channelmute` | Wyciszanie członków | Blokuje pisanie tylko na bieżącym kanale |
| `unstfu <user>` | `unchannelmute` | Wyciszanie członków | Cofa `stfu` |
| `muterole [role]` | `setmuterole` | Zarządzanie rolami | Pokazuje lub ustawia rolę wyciszenia |
| `removeonmute <y|n>` | | Administrator | Zabiera i przywraca role wokół pełnych wyciszeń |
| `unmuteall [reason]` | `umall` | Administrator | Odcisza wszystkich z rolą wyciszenia |
| `kick <user or id> [reason]` | `k` | Wyrzucanie członków | Wyrzuca członka |
| `masskick <users...>` | `mkick` | Wyrzucanie członków | Wyrzuca kilku członków |
| `ban [time] <user or id> [reason]` | `b` | Banowanie członków | Ban albo ban tymczasowy do 49 dni |
| `unban <user or id>` | | Banowanie członków | Zdejmuje bana |
| `softban <user or id> [reason]` | `sb` | Wyrzucanie członków i Zarządzanie wiadomościami | Ban, potem unban, by usunąć wiadomości |
| `banmessage [text]` | `banmsg`, `bantemplate`, `bantemp` | Banowanie członków | Pokazuje lub ustawia DM o banie, `-` wyłącza |
| `banmsgreset` | | Banowanie członków | Przywraca domyślny DM o banie |
| `banmsgtest [time] [reason]` | | Banowanie członków | Wysyła Ci w DM szablon bana |
| `masskill <ids and reasons>` | | Właściciel bota | Masowo banuje wklejoną listę |
| `banprune` | `banpurge` | Banowanie członków | Pokazuje obowiązujące i skonfigurowane ustawienia czyszczenia |
| `banpruneset <action|all> <days> [channel]` | `banpurgeset` | Administrator | Ustawia czyszczenie |
| `banpruneclear <action|all> [channel]` | `banpurgeclear` | Administrator | Usuwa ustawienie czyszczenia |
| `banprunereset` | `banpurgereset` | Administrator | Usuwa każde ustawienie czyszczenia |
| `purge [count or user] [count] [flags]` | `clear`, `prune` | Zarządzanie wiadomościami | Masowo usuwa wiadomości na tym kanale |
| `purgeuser <user> <count>` | `pruneuser` | Zarządzanie wiadomościami | Usuwa wiadomości użytkownika na wszystkich kanałach |
| `dehoist <user>` | | Zarządzanie pseudonimami | Naprawia jeden nick wpychający się na górę |
| `dehoistall [nicksOnly]` | `dehoista` | Zarządzanie pseudonimami | Naprawia każdy taki nick |
| `sanitize <user>` | | Zarządzanie pseudonimami | Normalizuje jeden nick |
| `sanitizeall` | `sanitizea` | Zarządzanie pseudonimami | Normalizuje każdy nick |
| `massnickprogress` | `mnickprogress`, `mnp` | Administrator | Postęp trwającego dehoist lub sanitize |
| `massnickstop` | `mnstop`, `mns` | Administrator | Zatrzymuje trwający dehoist lub sanitize |

## Wskazówki i pułapki

- Rola bota musi leżeć wyżej niż każdy, kogo wycisza, wyrzuca lub banuje, oraz wyżej niż sama rola wyciszenia. Większość błędów „nie można zastosować kary” to problemy z hierarchią.
- Bot potrzebuje uprawnień Banowanie członków, Wyrzucanie członków, Moderowanie członków, Zarządzanie rolami i Zarządzanie wiadomościami dla odpowiednich komend; każda komenda sprawdza uprawnienie samego bota przed uruchomieniem.
- Drabinka uruchamia się tylko przy dokładnej liczbie. Uzupełnij każdy krok, na którym Ci zależy, zamiast zakładać „3 lub więcej”.
- Liczą się tylko ostrzeżenia wydane przez bota. Własne timeouty i bany Discorda nie dodają ostrzeżeń.
- Rola wyciszenia blokuje uprawnienia na każdym kanale osobno. Kanały utworzone po powstaniu roli dostają nadpisanie przy następnym wyciszeniu, a nie od razu.
- Discord pozwala masowo usuwać wiadomości tylko do 14 dni wstecz. Starsze wiadomości są pomijane przez komendy czyszczenia.
- Czyszczenie przy banie jest ograniczone przez Discord do 7 dni, niezależnie od konfiguracji.
- Ostrzeżenia z panelu wymagają poprawnego powodu i używają Twojego konta w panelu jako nazwy moderatora.

---
title: Minecraft
slug: minecraft
summary: Zarejestruj swoje serwery Minecraft, publikuj embedy ze statusem na żywo, które same się aktualizują, otrzymuj alerty o włączeniu i wyłączeniu, uruchamiaj komendy RCON oraz łącz czat w grze, dołączenia, śmierci i osiągnięcia z Discordem za pomocą pluginu towarzyszącego.
icon: fa-server
category: Entertainment
dashboard: /dashboard/minecraft
module: Minecraft
tags: [minecraft, mc, server status, bridge, rcon, whitelist, chat bridge, java, bedrock, geyser, player lookup, skin, status serwera, most czatu, whitelista, wyszukiwanie gracza, skin]
related: [statchannels, logging, utility]
---

## Co robi

Moderatorzy rejestrują jeden lub więcej serwerów Minecraft, podając nazwę i adres. Każdy członek może wtedy uruchomić `mcstatus`, aby zobaczyć, czy serwer działa, jego MOTD, wersję, opóźnienie i kto jest online. Serwer można też obserwować: bot publikuje embed ze statusem na kanale i edytuje go według timera albo wpisuje liczbę graczy do tematu kanału, a także ogłasza, gdy serwer przestaje działać lub wraca.

Jeśli serwer ma włączony RCON, moderatorzy mogą wysyłać komendy konsoli i zarządzać whitelistą z Discorda lub z konsoli w panelu, bez dołączania do gry.

Opcjonalny plugin towarzyszący zamienia połączenie w dwukierunkowy most. Czat graczy, dołączenia, wyjścia, śmierci i osiągnięcia są publikowane na wybranych przez Ciebie kanałach Discorda, a wiadomości wpisane na kanale mostu są przekazywane graczom w grze.

## Do czego Ci się przyda

- Pokazanie embeda „kto jest online” na żywo, aby członkowie wiedzieli, kiedy warto się zalogować.
- Alert dla społeczności w chwili, gdy serwer się zawiesi lub wróci po konserwacji.
- Dodawanie nowych członków do whitelisty z Discorda bez otwierania konsoli serwera.
- Informowanie członków będących tylko na Discordzie o czacie w grze, śmierciach i osiągnięciach.
- Sprawdzanie UUID gracza lub renderu jego skina przy rozpatrywaniu podania lub zgłoszenia.

## Typy serwerów

| Typ | Domyślny port | Jak jest odpytywany |
| --- | --- | --- |
| Java Edition | 25565 | Ping listy serwerów; protokół query jest też używany, gdy ustawiono **Port Query** i `enable-query=true` |
| Bedrock Edition | 19132 | Ping Bedrock |
| Geyser (Java + Bedrock) | 25565 | Ping Java, oznaczony jako Geyser |

Każdy serwer ma nazwę zapisywaną małymi literami, a pierwszy dodany serwer staje się domyślnym używanym przez `mcstatus` bez argumentów. Adresy prywatne, zarezerwowane i pętli zwrotnej są odrzucane, chyba że host bota na nie zezwolił.

## Obserwowanie serwera

Ustaw **Kanał obserwowania**, a bot będzie odpytywać serwer co **Interwał obserwowania** minut (domyślnie 5, minimum 1). To, co zrobi z wynikiem, zależy od **Trybu obserwowania**.

| Tryb | Zachowanie |
| --- | --- |
| Embed (edytowany w miejscu) | Publikuje jeden embed ze statusem i edytuje go co cykl; publikuje ponownie, jeśli wiadomość zostanie usunięta |
| Temat kanału | Wpisuje krótką linię statusu do tematu kanału, najwyżej raz na pięć minut |
| Oba | Robi oba powyższe |

Każdy cykl zapisuje też migawkę stanu online, liczby graczy, opóźnienia i wersji. Karta **Historia** w panelu pokazuje je na wykresach w czasie.

Gdy stan online się zmieni, bot publikuje alert na kanale obserwowania: domyślnie zielony embed „came online” lub czerwony „went offline” albo Twoje własne szablony **Alert o włączeniu serwera** i **Alert o wyłączeniu serwera**.

### Symbole zastępcze statusu

**Własny embed obserwowania** i oba szablony alertów przechodzą przez parser embedów i obsługują te symbole zastępcze.

| Symbol zastępczy | Wartość |
| --- | --- |
| `%mc.server.name%` | Zarejestrowana nazwa |
| `%mc.server.address%` | Nazwa hosta lub IP |
| `%mc.server.port%` | Port |
| `%mc.online%` | `Online` lub `Offline` |
| `%mc.players.online%` | Bieżąca liczba graczy |
| `%mc.players.max%` | Liczba slotów dla graczy |
| `%mc.player.list%` | Nazwy graczy online |
| `%mc.motd%` | MOTD bez kodów formatowania |
| `%mc.version%` | Zgłoszona wersja |
| `%mc.latency%` | Ping, na przykład `42ms` |
| `%mc.favicon%` | URL ikony serwera |
| `%mc.map%` | Nazwa świata, tylko protokół query |
| `%mc.gamemode%` | Tryb gry, tylko protokół query |
| `%mc.software%` | Oprogramowanie serwera, tylko protokół query |
| `%mc.plugins%` | Lista pluginów, tylko protokół query |
| `%mc.query%` | `Yes`, jeśli odpowiedział rozszerzony query |
| `%mc.geyser%` | `Yes`, jeśli wykryto Geysera |

## RCON i whitelista

Włącz **Ustawienia RCON** dla serwera i wpisz **Port RCON** oraz **Hasło RCON** z `server.properties`. Wtedy `mcrcon` wysyła dowolną komendę konsoli i zwraca wynik. `mcwhitelist` opakowuje komendy whitelisty akcjami `add`, `remove`, `list`, `on`, `off` i `reload`. Panel pokazuje whitelistę jako listę z przyciskami dodawania i usuwania, a karta **Konsola** daje wiersz poleceń dla serwerów z włączonym RCON.

> [!WARNING]
> RCON daje pełny dostęp do konsoli. Ogranicz `mcrcon` do administratorów i traktuj hasło jak każdy inny dane uwierzytelniające serwera.

## Most z pluginem towarzyszącym

Most wymaga pluginu MewdekoMC na serwerze gry: pluginu Paper dla Paper 1.21+ lub moda NeoForge dla 21.1.x, oba na Javie 21. W panelu otwórz sekcję **Plugin towarzyszący** serwera i wygeneruj klucz. Skopiuj **URL API** i **klucz API** do `config.yml` pluginu (Paper) lub `config/mewdeko-server.toml` (NeoForge), a potem zrestartuj albo uruchom `/mewdeko reconnect`. Klucz jest pokazywany tylko raz; wygeneruj nowy, aby go zastąpić.

Po połączeniu plugin przesyła zdarzenia przez WebSocket, a bot kieruje je na kanały.

| Zdarzenie | Trafia do | Domyślny wygląd |
| --- | --- | --- |
| Dołączenie gracza | Kanał **Dołączenie/wyjście** | Zielony embed z nazwą i awatarem gracza |
| Wyjście gracza | Kanał **Dołączenie/wyjście** | Czerwony embed z nazwą i awatarem gracza |
| Czat | Kanał **Most czatu** | `**player**: message` |
| Śmierć | Kanał **Śmierci** | Szary embed z komunikatem o śmierci |
| Osiągnięcie | Kanał **Osiągnięcia** | Zielony embed z nazwą osiągnięcia |
| Status serwera | Nigdzie; zapisywany jako migawka historii z TPS i pamięcią | |

Każdy pusty kanał zdarzeń wraca do **Kanału obserwowania**. Wiadomości wysłane przez użytkowników niebędących botami na kanale Mostu czatu (lub na kanale obserwowania, jeśli żaden nie jest ustawiony) są domyślnie przekazywane do gry jako `[Discord] user: message`. Własna konfiguracja pluginu może wyłączyć każdą kategorię zdarzeń, a strumieniowanie konsoli jest domyślnie wyłączone i nie jest wyświetlane przez bota.

### Szablony zdarzeń mostu

Każde zdarzenie kierowane na Discorda może mieć własny szablon w sekcji **Szablony zdarzeń mostu**. Przyjmują wynik kreatora embedów, wzmianki są neutralizowane, a poniższe symbole zastępcze są podmieniane.

| Szablon | Symbole zastępcze |
| --- | --- |
| Dołączenie gracza (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Wyjście gracza (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Wiadomość czatu (Discord) | `%mc.player%`, `%mc.message%`, `%mc.avatar%` |
| Wiadomość o śmierci (Discord) | `%mc.player%`, `%mc.death.message%`, `%mc.avatar%` |
| Osiągnięcie (Discord) | `%mc.player%`, `%mc.advancement%`, `%mc.avatar%` |
| Czat z Discorda (format w grze) | `%user%`, `%message%`, `%channel%`; używaj kodów kolorów Minecrafta ze znakiem paragrafu |

## Ustawienia

Strona Minecraft ma kartę **Serwery**, kartę **Dodaj serwer**, **Historia**, **Konsola** oraz kartę nazwaną od wybranego serwera do jego edycji.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Nazwa | | Krótki identyfikator używany w komendach, na przykład `survival` |
| Adres | | Nazwa hosta lub IP |
| Port | 25565 | Port gry; 19132 dla Bedrock |
| Typ serwera | Java Edition | Java, Bedrock lub Geyser |
| Port Query (0 = port gry) | 0 | Port dla rozszerzonego protokołu query |
| Kanał obserwowania | brak | Kanał, który otrzymuje embed ze statusem i alerty |
| Interwał obserwowania (minuty) | 5 | Jak często serwer jest odpytywany |
| Tryb obserwowania | Embed | Embed, Temat kanału lub Oba |
| Własny embed obserwowania | domyślny embed | Twój własny embed ze statusem używający powyższych symboli zastępczych |
| Alert o włączeniu serwera | domyślny embed | Publikowany, gdy serwer wróci |
| Alert o wyłączeniu serwera | domyślny embed | Publikowany, gdy serwer przestanie działać |
| Kanały zdarzeń | kanał obserwowania | Most czatu, Dołączenie/wyjście, Śmierci, Osiągnięcia |
| Szablony zdarzeń mostu | domyślne | Szablony dla poszczególnych zdarzeń wymienione powyżej |
| Ustawienia RCON | wyłączone | Przełącznik włączenia, Port RCON, Hasło RCON |
| Plugin towarzyszący | brak klucza | Generuje lub unieważnia klucz API pluginu i kopiuje URL API |

## Konfiguracja krok po kroku

1. Otwórz **Minecraft** w panelu i przejdź do **Dodaj serwer**.
2. Wpisz **Nazwę**, **Adres** i **Port**, wybierz **Typ serwera** oraz **Kanał obserwowania** i **Tryb obserwowania**. Zapisz.
3. Sprawdź kartę **Serwery**: karta statusu powinna po kilku sekundach pokazać serwer jako online.
4. Edytuj serwer, aby włączyć **Ustawienia RCON**, jeśli chcesz dostępu do konsoli i whitelisty, a następnie wypróbuj kartę **Konsola**.
5. Aby połączyć czat, ustaw **Kanały zdarzeń**, wygeneruj klucz w sekcji **Plugin towarzyszący**, zainstaluj plugin na serwerze gry i wklej URL oraz klucz do jego konfiguracji.
6. Dołącz do gry i coś napisz: powinno to pojawić się na kanale Mostu czatu, a odpowiedź tam powinna pojawić się w grze.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniono). Wersje slash znajdują się pod `/minecraft`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `mcstatus [name or address]` | `mcs` | Nobody | Status serwera domyślnego, zarejestrowanego lub dowolnego wpisanego `host:port` |
| `mcadd <name> <address[:port]>` | | Zarządzanie serwerem | Rejestruje serwer; poprzedź adres `bedrock:` dla Bedrock |
| `mcremove <name>` | `mcrm` | Zarządzanie serwerem | Usuwa zarejestrowany serwer |
| `mclist` | `mcl` | Nobody | Wypisuje zarejestrowane serwery z typem, oznaczeniem domyślnego i kanałem obserwowania |
| `mcdefault <name>` | `mcdef` | Zarządzanie serwerem | Wybiera serwer używany domyślnie przez `mcstatus` |
| `mcwatch <name> [#channel]` | `mcw` | Zarządzanie serwerem | Zaczyna publikować status na kanale lub kończy, gdy nie podano kanału |
| `mcwatchmode <name> <embed, channeltopic or both>` | `mcwm` | Zarządzanie serwerem | Wybiera, jak obserwowanie pokazuje status |
| `mcembed <name> [template]` | `mce` | Zarządzanie serwerem | Ustawia własny embed ze statusem lub `-`, aby zresetować |
| `mcplayer <username>` | `mcp` | Nobody | Pokazuje UUID, awatar i skin gracza |
| `mcskin <username>` | | Nobody | Pokazuje render skina gracza |
| `mcrcon <name> <command>` | | Administrator | Uruchamia komendę konsoli przez RCON |
| `mcwhitelist <name> <action> [player]` | `mcwl` | Zarządzanie serwerem | `add`, `remove`, `list`, `on`, `off` lub `reload` |

## Wskazówki i pułapki

- `mcstatus` ma limit dziesięciu zapytań na minutę na serwer Discord, współdzielony przez wszystkich członków.
- Bezpośrednie wyszukiwanie adresu przez `mcstatus play.example.com:25565` działa bez rejestracji, ale adresy prywatne i lokalne są blokowane.
- Bot potrzebuje **Zarządzania kanałami** na kanale obserwowania dla trybu Temat kanału, a sam Discord ogranicza edycje tematu, więc tryb tematu nigdy nie aktualizuje się częściej niż co pięć minut.
- Rozszerzone szczegóły, takie jak mapa, tryb gry i pluginy, pojawiają się tylko wtedy, gdy w `server.properties` ustawiono `enable-query=true`, a **Port Query** się zgadza.
- Jeśli embed obserwowania zostanie usunięty, następny cykl publikuje nowy zamiast zawieść.
- Wiadomości mostu neutralizują `@everyone`, `@here` i wzmianki użytkowników, więc gracze nie mogą oznaczać nikogo na Discordzie z gry.

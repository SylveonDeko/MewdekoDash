---
title: Kanały ze statystykami
slug: statchannels
summary: Kanały głosowe, których nazwy same się aktualizują, pokazując liczby na żywo, takie jak liczba członków, boostów, otwartych zgłoszeń czy widzów na Twitchu.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/statchannels
module: StatChannels
tags: [stat channels, counter, member count, live stats, voice channel stats, countdown, member goal, boost count, twitch viewers, kanały ze statystykami, licznik, liczba członków, statystyki na żywo, odliczanie, cel członków, liczba boostów, widzowie twitch]
related: [counting, twitch, suggestions, xp, afk, starboard]
---

## Co robi

Kanał ze statystykami to zablokowany kanał głosowy umieszczony na górze listy kanałów, który pokazuje liczbę w swojej nazwie, na przykład „Members: 12,480”. Bot przepisuje nazwę według harmonogramu, aby liczba była aktualna. Członkowie nie mogą dołączyć do kanału; służy on wyłącznie do odczytu.

Wybierasz typ licznika, szablon nazwy, styl liczby i częstotliwość odświeżania. Bot obsługuje kilkadziesiąt liczników obejmujących fakty o serwerze, obecność, boosty Nitro, sloty emoji, cele członków i odliczania, a także wartości pobierane z innych funkcji Mewdeko, takich jak zgłoszenia, sugestie, konkursy, XP, liczenie, starboard oraz połączone serwery Twitch lub Minecraft.

Discord pozwala zmienić nazwę kanału tylko dwa razy na dziesięć minut. Kanały ze statystykami obchodzą to ograniczenie, oferując wybór mechanizmu aktualizacji, w tym taki, który usuwa i tworzy kanał na nowo, aby można było odświeżać go co minutę.

## Po co z tego korzystać

- Pokaż liczbę członków, ludzi i botów na górze serwera.
- Śledź postęp do celu członków w procentach lub za pomocą paska postępu.
- Odliczaj do wydarzenia, premiery lub rocznicy.
- Pokaż status na żywo i liczbę widzów na Twitchu na serwerze streamera.
- Daj staffowi podgląd na żywo otwartych zgłoszeń lub oczekujących sugestii bez otwierania panelu.
- Wyświetlaj status serwera Minecraft i liczbę graczy obok linku z zaproszeniem.

## Typy liczników

Pełny katalog poniżej to to, co wyświetlają `statchanneltypes` i sekcja **Dostępne liczniki** w panelu. Każdy typ przyjmuje wspólne symbole zastępcze; niektóre dodają własne. Domyślne szablony zaczynają się od pasującego emoji, po którym następuje pokazany tekst.

### Członkowie

| Typ | Pokazuje | Domyślny szablon | Dodatkowe symbole zastępcze |
| --- | --- | --- | --- |
| `TotalMembers` | Wszystkich członków, łącznie z botami | `Members: %count%` | |
| `HumanMembers` | Członków, którzy nie są botami | `Humans: %count%` | |
| `BotCount` | Konta botów | `Bots: %count%` | |
| `OnlineMembers` | Członków z dowolną obecnością inną niż offline | `Online: %count%` | |
| `IdleMembers` | Członków oznaczonych jako bezczynni | `Idle: %count%` | |
| `DndMembers` | Członków oznaczonych jako nie przeszkadzać | `DND: %count%` | |
| `StreamingMembers` | Członków z aktywnością streamowania | `Streaming: %count%` | |
| `InVoiceMembers` | Członków połączonych z dowolnym kanałem głosowym | `In Voice: %count%` | |
| `RoleMembers` | Członków posiadających wybraną rolę | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.color%` |
| `NewestMember` | Ostatnio dołączonego członka | `Newest: %member.name%` | `%member.name%`, `%member.id%` |
| `MembersJoinedToday` | Dołączyli w ciągu ostatnich 24 godzin | `Joined Today: %count%` | |
| `MembersJoinedWeek` | Dołączyli w ciągu ostatnich 7 dni | `This Week: %count%` | |
| `MemberGoal` | Postęp do docelowej liczby członków | `%count% / %goal%` | `%goal%`, `%goal.raw%`, `%goal.percent%`, `%goal.remaining%`, `%goal.bar%` |
| `AfkCount` | Członków aktualnie AFK przez Mewdeko | `AFK: %count%` | |

### Serwer

| Typ | Pokazuje | Domyślny szablon | Dodatkowe symbole zastępcze |
| --- | --- | --- | --- |
| `Countdown` | Czas pozostały do daty docelowej | `%days%d %hours%h left` | `%days%`, `%hours%`, `%minutes%`, `%total.hours%` |
| `ChannelCount` | Wszystkie kanały | `Channels: %count%` | |
| `TextChannelCount` | Kanały tekstowe | `Text: %count%` | |
| `VoiceChannelCount` | Kanały głosowe | `Voice: %count%` | |
| `CategoryCount` | Kategorie | `Categories: %count%` | |
| `StageChannelCount` | Kanały scenyczne (Stage) | `Stages: %count%` | |
| `ForumChannelCount` | Kanały forum | `Forums: %count%` | |
| `ThreadCount` | Wątki aktualnie zapisane w pamięci podręcznej jako aktywne | `Threads: %count%` | |
| `RoleCount` | Role | `Roles: %count%` | |
| `BoostCount` | Aktywne boosty Nitro | `Boosts: %count%` | |
| `BoostLevel` | Poziom boostów, od 0 do 3 | `Level %count%` | |
| `NextBoostGoal` | Boosty, których jeszcze brakuje do następnego poziomu | `%count% to Tier %tier.next%` | `%tier.next%`, `%tier.current%` |
| `EmojiCount` | Wszystkie własne emoji | `Emojis: %count%` | |
| `AnimatedEmojiCount` | Animowane własne emoji | `Animated: %count%` | |
| `StaticEmojiCount` | Statyczne własne emoji | `Static: %count%` | |
| `StickerCount` | Własne naklejki | `Stickers: %count%` | |
| `EmojiSlotsUsed` | Użyte sloty emoji względem limitu poziomu | `Slots: %count%/%slots.max%` | `%slots.max%`, `%slots.free%` |
| `ServerAge` | Dni od utworzenia serwera | `Age: %count% days` | `%years%`, `%created%` |
| `EventCount` | Zaplanowane wydarzenia | `Events: %count%` | |
| `BotUptime` | Jak długo działa Mewdeko | `Uptime: %days%d %hours%h` | `%days%`, `%hours%`, `%minutes%` |
| `InviteCount` | Zaproszenia śledzone przez śledzenie zaproszeń | `Invites: %count%` | |

### Twitch

Te liczniki odczytują dane z kanału Twitch połączonego przez moduł Twitch.

| Typ | Pokazuje | Domyślny szablon | Dodatkowe symbole zastępcze |
| --- | --- | --- | --- |
| `TwitchLiveStatus` | Czy kanał jest na żywo | `%twitch.name%: %status%` | `%status%`, `%twitch.name%` |
| `TwitchViewers` | Bieżących widzów | `Viewers: %count%` | `%twitch.name%` |
| `TwitchGame` | Streamowaną kategorię | `%game%` | `%game%`, `%title%`, `%twitch.name%` |
| `TwitchUptime` | Jak długo trwa stream | `Live %hours%h %minutes%m` | `%hours%`, `%minutes%` |
| `TwitchFollowers` | Łączną liczbę obserwujących | `Followers: %count%` | `%twitch.name%` |
| `TwitchSubs` | Łączną liczbę subskrybentów | `Subs: %count%` | `%twitch.name%` |
| `TwitchCounter` | Nazwany licznik czatu Twitch | `%counter.name%: %count%` | `%counter.name%` |
| `TwitchLastRaider` | Ostatniego rajdera | `Last Raid: %raider%` | `%raider%`, `%raid.viewers%` |
| `TwitchRecentStreams` | Streamy rozpoczęte w ciągu ostatnich 14 dni | `Streams: %count%` | |

### Inne funkcje Mewdeko

| Typ | Kategoria | Pokazuje | Domyślny szablon | Dodatkowe symbole zastępcze |
| --- | --- | --- | --- | --- |
| `MinecraftPlayers` | Minecraft | Graczy online na obserwowanym serwerze | `Players: %count%/%players.max%` | `%players.max%`, `%server.version%` |
| `MinecraftStatus` | Minecraft | Czy obserwowany serwer jest osiągalny | `%status%` | `%status%`, `%latency%` |
| `CountingCurrent` | Liczenie | Bieżącą liczbę na kanale liczenia | `Count: %count%` | |
| `CountingRecord` | Liczenie | Najwyższą kiedykolwiek osiągniętą liczbę | `Record: %count%` | |
| `OpenTickets` | Zgłoszenia | Otwarte, niezarchiwizowane zgłoszenia | `Open Tickets: %count%` | |
| `TicketsToday` | Zgłoszenia | Zgłoszenia otwarte w ciągu ostatnich 24 godzin | `Today: %count%` | |
| `PendingSuggestions` | Sugestie | Sugestie oczekujące na decyzję | `Pending: %count%` | |
| `ActiveGiveaways` | Konkursy | Aktualnie trwające konkursy | `Giveaways: %count%` | |
| `StarboardPosts` | Starboard | Łączną liczbę postów na starboardzie | `Starred: %count%` | |
| `TopXpUser` | XP | Członka z największą ilością XP | `Top: %member.name%` | `%member.name%`, `%member.id%`, `%member.xp%` |
| `TotalGuildXp` | XP | Całe XP zdobyte na serwerze | `Total XP: %count%` | |
| `TotalCurrency` | Waluta | Walutę posiadaną przez członków | `In Circulation: %count%` | |
| `ActivePolls` | Ankiety | Ankiety przyjmujące głosy | `Polls: %count%` | |
| `Clock` | Serwer | Datę i godzinę w strefie czasowej serwera | `%time% %tz%` | `%time%`, `%date%`, `%datetime%`, `%weekday%`, `%tz%` |
| `MessagesToday`, `MessagesWeek` | Aktywność | Wiadomości z ostatnich 24 godzin lub 7 dni | `Today: %count%` | |
| `VoiceHoursToday`, `VoiceHoursWeek` | Aktywność | Godziny głosowe wszystkich członków z ostatnich 24 godzin lub 7 dni | `Today: %count%h` | |
| `TopChatter` | Aktywność | Najaktywniejszego rozmówcę z ostatnich 7 dni | `Chatter: %member.name%` | `%member.name%`, `%member.id%`, `%member.messages%` |
| `TopVoiceMember` | Aktywność | Członka z największym czasem głosowym z ostatnich 7 dni | `Voice: %member.name%` | `%member.name%`, `%member.id%`, `%member.hours%` |
| `TopGame` | Aktywność | Najczęściej granę grę z ostatnich 7 dni (wymaga śledzenia gier) | `%game%` | `%game%`, `%hours%`, `%players%` |
| `PlayingNow` | Aktywność | Członków aktualnie grających w śledzoną grę (wymaga śledzenia gier) | `Playing: %count%` | |
| `RoleMembersOnline` | Członkowie | Członków z rolą, którzy nie są offline | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.total%` |
| `TopInviter` | Śledzenie zaproszeń | Członka z największą liczbą zaproszeń | `Inviter: %member.name%` | `%member.name%`, `%member.id%`, `%member.invites%` |
| `InvitesWeek` | Śledzenie zaproszeń | Dołączenia przypisane zapraszającym w ciągu ostatnich 7 dni | `This Week: %count%` | |
| `MembersLeftToday`, `MembersLeftWeek` | Członkowie | Członków, którzy odeszli w ciągu ostatnich 24 godzin lub 7 dni | `Left Today: %count%` | |
| `NetGrowthWeek` | Członkowie | Dołączenia minus odejścia z ostatnich 7 dni | `Growth: %count%` | `%joins%`, `%leaves%` |

### Symbole zastępcze dostępne dla każdego typu

| Symbol zastępczy | Wartość |
| --- | --- |
| `%count%` | Wartość wyrenderowana wybranym stylem wyświetlania |
| `%count.raw%` | Wartość jako same cyfry |
| `%server.name%` | Nazwa serwera |
| `%server.id%` | ID serwera |
| `%server.members%` | Łączna liczba członków |
| `%server.boostcount%` | Liczba boostów |
| `%server.boostlevel%` | Poziom boostów |

Nazwy kanałów są ograniczone limitem 100 znaków Discorda.

## Style wyświetlania

**Styl licznika** decyduje o tym, jak renderowane jest `%count%`. Dotyczy tylko liczników liczbowych; liczniki tekstowe, takie jak `NewestMember`, wypisują tekst bez zmian, a liczniki prawda/fałsz, takie jak `TwitchLiveStatus`, wypisują tekst w rodzaju „LIVE” lub „Offline”.

| Styl | Przykład dla 1234 | Uwagi |
| --- | --- | --- |
| `Plain` | `1234` | Same cyfry |
| `Comma` | `1,234` | Separatory tysięcy. Domyślny. |
| `Compact` | `1.2K` | Przyrostki K, M, B, T, domyślnie jedno miejsce po przecinku |
| `Padded` | `1234` | Dopełnione zerami do stałej szerokości, domyślnie cztery cyfry, więc 42 staje się `0042` |
| `Ordinal` | `1,234th` | Dodaje st, nd, rd lub th |
| `Percent` | `61.7%` | Wartość jako procent celu, domyślnie jedno miejsce po przecinku |
| `ProgressBar` | pasek z dziesięciu pól | Wypełnione i puste pola w stronę celu, domyślnie dziesięć pól |
| `EmojiDigits` | cyfry w ramkach | Każda cyfra jako emoji w ramce |
| `Roman` | `MCCXXXIV` | Cyfry rzymskie dla 1–3999, w przeciwnym razie wraca do stylu z przecinkami |

`Percent` i `ProgressBar` potrzebują celu, z którym mogą porównywać. Bez niego pokazują `0%` lub pusty pasek.

## Mechanizmy aktualizacji

| Mechanizm | Etykieta w panelu | Jak działa |
| --- | --- | --- |
| `Rename` | Tylko zmiana nazwy | Edytuje nazwę kanału. Discord pozwala na dwie zmiany nazwy na dziesięć minut dla kanału, więc interwał odświeżania jest wymuszany na co najmniej 5 minut. ID kanału nigdy się nie zmienia. |
| `Recreate` | Usuń i utwórz ponownie | Tworzy nowy kanał o tej samej nazwie, kategorii, pozycji i nadpisaniach uprawnień, a potem usuwa stary. Może odświeżać co minutę, ale ID kanału zmienia się przy każdej aktualizacji, a każda aktualizacja zostawia dwa wpisy w dzienniku audytu. |
| `Auto` | Automatyczny (zalecany) | Zmienia nazwę, dopóki pozwala na to limit dwóch na dziesięć minut. Gdy limit jest wyczerpany, a interwał jest krótszy niż 5 minut, tworzy kanał na nowo. Gdy interwał wynosi 5 minut lub więcej, po prostu czeka na kolejne okno zmiany nazwy. |

Domyślnie nowe kanały ze statystykami używają **Automatycznego** mechanizmu co **5 minut**. Interwały są ograniczone do zakresu od 1 minuty (5 dla Rename) do 1440 minut. Bot co 30 sekund sprawdza kanały, którym minął interwał.

> [!WARNING]
> Recreate zmienia ID kanału. Wszystko inne, co odwołuje się do kanału, na przykład konfiguracje uprawnień w innych botach lub przypięte linki, psuje się przy każdym odświeżeniu. Używaj go tylko tam, gdzie szybkie odświeżanie jest ważniejsze niż stałe ID.

## Ustawienia

Strona ma trzy karty: **Kanały ze statystykami**, **Dodaj** i **Domyślne**, a w nagłówku przycisk **Odśwież**. Karta **Kanały ze statystykami** wyświetla każdy skonfigurowany kanał z przyciskami **Edytuj** i **Usuń**.

**Dodaj kanał statystyk** oferuje **Utwórz nowy kanał** lub **Użyj istniejącego kanału** z wyborem **Kanału głosowego**, a następnie:

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Kategoria (opcjonalnie) | brak | Gdzie umieszczany jest nowo utworzony kanał |
| Licznik | brak | Typ licznika z katalogu |
| Szablon | domyślny dla typu | Nazwa kanału z symbolami zastępczymi; kliknij znacznik symbolu, aby go wstawić, a podgląd aktualizuje się podczas pisania |
| Styl licznika | Comma | Styl wyświetlania z tabeli powyżej |
| Mechanizm aktualizacji | Automatyczny | Rename, recreate lub auto |
| Interwał odświeżania (minuty) | 5 | Jak często odświeżana jest nazwa |
| Rola | brak | Pokazywane dla `RoleMembers` |
| Data docelowa | brak | Pokazywana dla `Countdown` |
| Cel do osiągnięcia | brak | Pokazywany dla `MemberGoal` i używany przez style procentowy i paska postępu |
| Nazwa licznika Twitch | brak | Pokazywana dla `TwitchCounter` |
| Kanał liczenia | brak | Pokazywany dla typów liczenia |
| Serwer Minecraft | brak | Pokazywany dla typów Minecraft |

**Wartości domyślne dla nowych kanałów statystyk** ustawiają **Domyślny mechanizm**, **Domyślny styl licznika** i **Domyślny interwał (minuty)** dla kanałów dodawanych później. Karta **Domyślne** zawiera też sekcje referencyjne **Style liczników** i **Dostępne liczniki**.

Nowo utworzony kanał odbiera `@everyone` uprawnienie Połącz, więc działa jak etykieta. Kanał, który dodasz samodzielnie, zachowuje uprawnienia, które już ma.

## Konfiguracja krok po kroku

1. Otwórz **Kanały ze statystykami** w panelu i przejdź do karty **Domyślne**. Zostaw **Domyślny mechanizm** na Automatycznym i ustaw interwał, który ci odpowiada.
2. Przejdź do **Dodaj**, wybierz **Utwórz nowy kanał** i wskaż **Kategorię**, jeśli chcesz zgrupować liczniki.
3. Wybierz **Licznik**, na przykład Total Members. Dostosuj **Szablon** i obserwuj podgląd.
4. Wybierz **Styl licznika** i zapisz.
5. Powtórz dla każdego licznika. Dla celu członków wybierz `MemberGoal`, ustaw **Cel do osiągnięcia** i wypróbuj styl `ProgressBar`.
6. Przeciągnij nowe kanały na górę listy kanałów na Discordzie, jeśli nie trafiły tam same.
7. Poczekaj jeden interwał odświeżania i sprawdź, czy nazwy się aktualizują.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, o ile go nie zmieniono). Typy, style i mechanizmy to nazwy z powyższych tabel, na przykład `TotalMembers`, `Compact`, `Recreate`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `statchannelcreate <type> [template]` | `scnew` | Zarządzanie kanałami | Tworzy nowy zablokowany kanał głosowy pokazujący dany licznik |
| `statchanneladd #voice <type> [template]` | `sca` | Zarządzanie kanałami | Zamienia istniejący kanał głosowy w kanał ze statystykami |
| `statchannelrole #voice @role [true] [template]` | `scr` | Zarządzanie kanałami | Dodaje licznik członków roli; `true` liczy tylko członków, którzy nie są offline |
| `statchannelcountdown #voice <date> [template]` | `scc` | Zarządzanie kanałami | Dodaje odliczanie do daty |
| `statchannelgoal #voice <number> [template]` | `scg` | Zarządzanie kanałami | Dodaje licznik celu członków |
| `statchanneltwitchcounter #voice <counter> [template]` | | Zarządzanie kanałami | Odzwierciedla nazwany licznik czatu Twitch |
| `statchannelmechanism #voice <mechanism> [minutes]` | | Zarządzanie kanałami | Ustawia rename, recreate lub auto, a opcjonalnie interwał |
| `statchannelstyle #voice <style>` | | Zarządzanie kanałami | Ustawia styl wyświetlania |
| `statchanneldefaults [mechanism] [minutes] [style]` | | Zarządzanie kanałami | Ustawia wartości domyślne dla nowych kanałów ze statystykami |
| `statchanneltypes [category]` | | Brak | Przeglądaj każdy licznik z przykładem, opcjonalnie według kategorii |
| `statchannellist` | `scl` | Brak | Wyświetla kanały ze statystykami tego serwera z typem, stylem, trybem i szablonem |
| `statchannelremove #voice` | `statchrm` | Zarządzanie kanałami | Przestaje śledzić kanał |

`statchannelcreate` wymaga również, aby bot miał Zarządzanie kanałami. Odpowiedniki slash znajdują się pod `/statchannel`.

## Wskazówki i pułapki

- Bot potrzebuje uprawnienia Zarządzanie kanałami, aby zmieniać nazwę kanału lub tworzyć go na nowo.
- Kanał głosowy może być tylko jednym kanałem ze statystykami. Dodanie go dwa razy kończy się błędem „already a stat channel”.
- Liczniki liczenia, Minecraft i Twitch wymagają wcześniejszej konfiguracji tych funkcji. Cele liczenia i Minecraft wybiera się w panelu; nie ma dla nich komendy.
- `statchannelremove` tylko przestaje śledzić kanał. Usuń kanał głosowy samodzielnie, jeśli już go nie chcesz.
- Wartości na żywo, takie jak widzowie Twitcha czy otwarte zgłoszenia, nadal podlegają interwałowi własnego kanału. Skracaj interwał na tych kanałach, a nie na wszystkich.
- Style `Percent` i `ProgressBar` używają celu własnego kanału. Ustawienie ich na liczniku bez celu zawsze pokazuje zero.

---
title: Logowanie
slug: logging
summary: Wysyłaj zapis dołączeń, wyjść, edycji, usunięć, banów, zmian ról i kanałów oraz wiele innych zdarzeń na wybrane kanały logów, z kierowaniem zdarzeń i wykluczeniem kanałów.
icon: fa-file
category: Security
dashboard: /dashboard/logging
module: Administration
tags: [logging, logs, audit, events, message deleted, message edited, join leave, mod log, ignored channels, logowanie, logi, audyt, zdarzenia, wiadomość usunięta, wiadomość edytowana, dołączenie wyjście, log moderacji, ignorowane kanały]
related: [moderation, administration, filter]
---

## Co to robi

Logowanie obserwuje zdarzenia, które Discord wysyła do bota, i publikuje podsumowanie każdego z nich na wybranym kanale tekstowym. Usunięta wiadomość pokazuje, kto ją napisał i co zawierała. Dołączenie członka pokazuje wiek jego konta. Zmiana roli pokazuje, które role zostały dodane lub usunięte. Jeśli bot może odczytać dziennik audytu, podaje też nazwę członka staffu, który to zrobił.

Każdy typ zdarzenia ma własne ustawienie kanału, więc możesz wysyłać edycje wiadomości na jeden kanał, działania moderacyjne na inny, a resztę wyłączyć. Nic nie jest logowane, dopóki nie przypiszesz kanału, a typ zdarzenia z pustym kanałem jest po cichu pomijany.

Kanały można też wykluczać. Ignorowany kanał nie generuje żadnych logów wiadomości, wątków ani głosowych, dzięki czemu pokoje staffu i kanały ze spamem botów nie trafiają do zapisu.

## Po co z tego korzystać

- Zachowaj kopię usuniętych i edytowanych wiadomości, aby moderatorzy mogli później zobaczyć, co zostało usunięte.
- Śledź, kto dołączył i wyszedł, włącznie z datami utworzenia kont, aby wykrywać najazdy i konta alternatywne.
- Zapisuj bany, odbany i wyciszenia wraz z odpowiedzialnym moderatorem, dla rozliczalności.
- Obserwuj zmiany ról, kanałów i uprawnień dokonywane przez innych adminów lub przejęte konta.
- Śledź aktywność głosową na serwerach, na których kanały głosowe są głównym miejscem spotkań.

## Typy zdarzeń logów

Każdy typ może wskazywać na inny kanał albo pozostać nieprzypisany. To są wartości akceptowane przez `log` i pokazywane na panelu.

| Typ | Etykieta na panelu | Logowane, gdy |
| --- | --- | --- |
| `MessageUpdated` | Edytowano wiadomość | Treść wiadomości zostaje edytowana (wiadomości botów i niezmienione treści są pomijane) |
| `MessageDeleted` | Usunięto wiadomość | Wiadomość zostaje usunięta |
| `MessagesBulkDeleted` | Usunięto wiele wiadomości | Kilka wiadomości zostaje usuniętych naraz, z liczbą tych, które były w pamięci podręcznej |
| `ReactionEvents` | Zdarzenia reakcji | Reakcje są dodawane lub usuwane, grupowane dla każdej wiadomości co pięć sekund |
| `ThreadCreated` | Utworzono wątek | Wątek zostaje utworzony |
| `ThreadDeleted` | Usunięto wątek | Wątek zostaje usunięty |
| `ThreadUpdated` | Zaktualizowano wątek | Zmienia się nazwa wątku, status archiwizacji lub podobne właściwości |
| `UsernameUpdated` | Zmieniono nazwę użytkownika | Zmienia się globalna nazwa użytkownika członka |
| `NicknameUpdated` | Zmieniono nick | Zmienia się nick członka na serwerze |
| `UserUpdated` | Zaktualizowano użytkownika | Zmienia się profil członka, na przykład awatar lub nazwa globalna |
| `UserJoined` | Użytkownik dołączył | Członek dołącza do serwera |
| `UserLeft` | Użytkownik wyszedł | Członek wychodzi lub zostaje wyrzucony |
| `UserRoleAdded` | Dodano rolę użytkownikowi | Jednemu członkowi zostaje nadana jedna lub więcej ról |
| `UserRoleRemoved` | Usunięto rolę użytkownikowi | Od członka zostaje odebrana jedna lub więcej ról |
| `UserBanned` | Użytkownik zbanowany | Członek zostaje zbanowany |
| `UserUnbanned` | Użytkownik odbanowany | Ban zostaje zdjęty |
| `UserMuted` | Użytkownik wyciszony | Członek zostaje wyciszony na głosowym lub tekstowym |
| `VoicePresence` | Obecność na głosowym | Członek dołącza, wychodzi, przenosi się, zostaje wyciszony, ogłuszony lub transmituje na kanale głosowym |
| `VoicePresenceTts` | Obecność na głosowym (TTS) | Członek mógł użyć zamiany tekstu na mowę na kanale głosowym; wykrywanie działa w miarę możliwości |
| `ServerUpdated` | Zaktualizowano serwer | Zmieniają się ustawienia serwera, takie jak nazwa, ikona lub właściciel |
| `EventCreated` | Utworzono wydarzenie | Zostaje utworzone zaplanowane wydarzenie serwera |
| `InviteCreated` | Utworzono zaproszenie | Zostaje utworzone zaproszenie, z jego maksymalnym czasem ważności i liczbą użyć |
| `InviteDeleted` | Usunięto zaproszenie | Zaproszenie zostaje usunięte |
| `RoleCreated` | Utworzono rolę | Rola zostaje utworzona |
| `RoleDeleted` | Usunięto rolę | Rola zostaje usunięta |
| `RoleUpdated` | Zaktualizowano rolę | Zmienia się nazwa, kolor lub uprawnienia roli |
| `ChannelCreated` | Utworzono kanał | Kanał zostaje utworzony |
| `ChannelDestroyed` | Usunięto kanał | Kanał zostaje usunięty |
| `ChannelUpdated` | Zaktualizowano kanał | Zmienia się nazwa, temat lub uprawnienia kanału |
| `Other` | Inne | Różne zdarzenia nieobjęte powyższymi |

Panel pokazuje też wpis **Zaktualizowano awatar**. Jest zapisywany razem z pozostałymi i ustawiany przez kategorie Użytkownicy i Wszystkie, ale nie jest wartością, którą można przekazać komendzie `log`.

## Kategorie

`logcategory` ustawia całą grupę typów na jeden kanał w jednym kroku. Uruchomienie bez kanału czyści wszystkie typy z tej grupy.

| Kategoria | Typy, które ustawia |
| --- | --- |
| `All` | Wszystkie powyższe typy |
| `Users` | NicknameUpdated, AvatarUpdated, UsernameUpdated, UserRoleAdded, UserRoleRemoved, VoicePresence, UserJoined, UserLeft, UserUpdated |
| `Threads` | ThreadCreated, ThreadDeleted, ThreadUpdated |
| `Roles` | RoleCreated, RoleDeleted, RoleUpdated |
| `Server` | ServerUpdated, EventCreated, InviteCreated, InviteDeleted |
| `Channel` | ChannelCreated, ChannelDestroyed, ChannelUpdated |
| `Messages` | MessageDeleted, MessageUpdated, MessagesBulkDeleted, ReactionEvents |
| `Moderation` | UserMuted, UserBanned, UserUnbanned, Other |
| `None` | Czyści wszystkie typy (używane przez przycisk **Wyłącz wszystko** na panelu) |

## Ignorowane kanały

Każdy kanał z listy ignorowanych jest pomijany dla zdarzeń wiadomości, wątków, kanałów i głosowych, które dzieją się wewnątrz niego. Wątki dziedziczą ustawienie z kanału nadrzędnego, więc ignorowanie forum lub kanału tekstowego ignoruje też jego wątki. Ignorowanie kanału głosowego wycisza logi obecności przy dołączeniach do tego kanału i wyjściach z niego.

Ignorowanie kanału nie zatrzymuje zdarzeń członków, ról ani serwera, ponieważ nie są one powiązane z kanałem.

## Ustawienia

Strona Logowanie ma dwie zakładki: **Kanały logów** i **Ignorowane kanały**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Kanały logów | brak | Jeden wybór kanału dla każdego typu zdarzenia, pogrupowany w Popularne, Użytkownicy, Wiadomości, Moderacja, Serwer, Kanały, Role, Wątki, Głosowe i Wszystkie zdarzenia |
| Wyczyść kategorię | | Opróżnia wszystkie pola w grupie, którą przeglądasz; działa po kliknięciu **Zapisz konfigurację** |
| Wyczyść wszystko | | Widoczne w grupie **Wszystkie zdarzenia**; opróżnia wszystkie pola, stosowane po zapisaniu |
| Wyłącz wszystko | | Przycisk w nagłówku widoczny, gdy jakikolwiek kanał jest ustawiony; natychmiast odłącza wszystkie typy zdarzeń po potwierdzeniu, zachowując ignorowane kanały |
| Ignorowane kanały | brak | Kanały wykluczone z logowania, przenoszone między listami **Aktywne kanały** i **Ignorowane kanały** |

> [!TIP]
> Grupa **Popularne** obejmuje Użytkownik dołączył, Użytkownik wyszedł, Usunięto wiadomość, Edytowano wiadomość, Użytkownik zbanowany, Użytkownik odbanowany, Utworzono kanał i Usunięto kanał. To dobry zestaw startowy dla większości serwerów.

## Przewodnik konfiguracji

1. Utwórz jeden lub więcej prywatnych kanałów logów, które mogą czytać tylko członkowie staffu.
2. Otwórz **Logowanie** na panelu i zostań na zakładce **Kanały logów**.
3. W grupie **Popularne** wybierz kanał logów dla każdego zdarzenia, które chcesz, a potem zapisz.
4. Przejdź do innych grup, na przykład **Moderacja** lub **Głosowe**, i przypisz kanały dla wszystkiego, czego jeszcze potrzebujesz.
5. Otwórz zakładkę **Ignorowane kanały** i przenieś pokoje staffu oraz kanały komend botów na listę ignorowanych.
6. Usuń testową wiadomość i sprawdź, czy log pojawia się na właściwym kanale.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś). Wersje ukośnikowe znajdują się pod `/log`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `log <type> [#channel]` | | Administrator | Wysyła jeden typ zdarzenia na kanał; bez kanału używany jest bieżący |
| `log #channel [types...]` | | Administrator | Wysyła kilka typów na jeden kanał, a jeśli nie podano żadnych, otwiera menu wyboru ze wszystkimi typami |
| `log "#channel:Type1,Type2" ...` | | Administrator | Ustawia kilka par kanał-typ w jednej wiadomości |
| `logcategory <category> [#channel]` | `logcat` | Administrator | Kieruje całą kategorię na kanał albo ją czyści bez kanału |
| `logevents` | | Administrator | Wypisuje każdy typ zdarzenia i kanał, którego obecnie używa |
| `logignore [#channel]` | `lignore` | Administrator | Przełącza kanał na listę ignorowanych lub z niej; domyślnie bieżący kanał |
| `logignorelist` | `lignorel` | Administrator | Pokazuje listę ignorowanych |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrator | Loguje użycie komend bota na kanale albo wyłącza logowanie bez kanału |

> [!EXAMPLE]
> `log "#mod-logs:UserBanned,UserUnbanned,UserMuted" "#message-logs:MessageDeleted,MessageUpdated"`

## Wskazówki i pułapki

- Daj botowi uprawnienie **Wyświetlanie dziennika audytu**. Bez niego logi nadal będą publikowane, ale nie będą mogły wskazać, który moderator usunął wiadomość, zbanował kogoś lub zmienił rolę.
- Bot musi widzieć i wysyłać wiadomości na każdym kanale logów. Kanał logów, którego nie widzi, jest pomijany bez błędu.
- Logi usuniętych i edytowanych wiadomości zależą od pamięci podręcznej wiadomości bota. Wiadomości wysłane przed ostatnim restartem bota albo podczas masowych czyszczeń mogą być oznaczone jako niezbuforowane.
- Logi reakcji są grupowane: wszystkie zmiany reakcji na wiadomości w ciągu około pięciu sekund trafiają jako jeden wpis, aby nie zalewać ruchliwych serwerów.
- Menu wyboru otwierane przez `log #channel` pokazuje do 25 typów na menu i zaznacza z góry te, które już są wysyłane na ten kanał.
- `logcategory` nadpisuje każdy typ w kategorii, łącznie z tymi, które wcześniej skierowałeś gdzie indziej. Potem używaj `log` dla pojedynczych typów.

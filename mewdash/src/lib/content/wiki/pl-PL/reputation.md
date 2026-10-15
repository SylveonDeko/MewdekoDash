---
title: Reputacja
slug: reputation
summary: Pozwól członkom dziękować sobie punktami reputacji, z czasami odnowienia i limitami przeciw nadużyciom, nagrodami w rolach przy progach, przyznawaniem przez reakcje i opcjonalnym zanikiem dla nieaktywnych członków.
icon: fa-trophy
category: Community
dashboard: /dashboard/reputation
module: Reputation
tags: [reputation, rep, karma, thanks, role rewards, leaderboard, reaction rep, decay, cooldown, reputacja, punkty reputacji, podziękowania, nagrody w rolach, ranking, reputacja za reakcje, zanik, czas odnowienia]
related: [xp, administration]
---

## Co robi

Członek uruchamia `rep @user`, aby dać jeden punkt reputacji, opcjonalnie z powodem. Suma odbiorcy rośnie, dzienna seria dającego jest śledzona, a historia zapisuje, kto co dał i dlaczego. Każdy może sprawdzić sumy przez `repcheck`, zobaczyć ranking serwera przez `repleaderboard` i przeczytać ostatnie dziesięć wpisów przez `rephistory`.

Staff konfiguruje, jak swobodnie płynie reputacja: czas odnowienia dla każdej pary dający–odbiorca, limity dzienne i tygodniowe oraz minimalny wiek konta, czas na serwerze i liczbę wiadomości, zanim ktoś w ogóle będzie mógł dawać. Kanały można wyłączyć dla reputacji albo nadać im mnożnik. Reputację można też zdobywać za reakcje: skonfigurowane emoji pod wiadomością daje jej autorowi punkty.

Przy wybranych progach bot nadaje role, ogłasza kamień milowy na kanale i wysyła członkowi wiadomość prywatną. Opcjonalny zanik powoli odbiera punkty członkom, którzy przez jakiś czas ani nie dawali, ani nie otrzymywali reputacji, dzięki czemu ranking odzwierciedla bieżącą aktywność.

## Po co z tego korzystać

- Doceniaj pomocnych członków na kanałach wsparcia i nadawaj im widoczną rolę.
- Pozwól, aby reakcja kciuka w górę na kanale z pokazami przyznawała punkty artyście.
- Uzależnij komendę lub kanał od poziomu reputacji zamiast ręcznie nadawanej roli.
- Zorganizuj weekendowe wydarzenie, w którym reputacja na jednym kanale liczy się podwójnie.
- Utrzymuj uczciwy ranking wsparcia dzięki zanikowi dla osób, które przestały pomagać.

## Przyznawanie reputacji

Każde `rep` daje jeden punkt, pomnożony przez mnożnik kanału, jeśli jest ustawiony. Nie możesz dać reputacji sobie ani botowi. Każda próba przechodzi te sprawdzenia, w tej kolejności, a pierwsza porażka jest zgłaszana dającemu:

| Sprawdzenie | Domyślnie | Co się dzieje |
| --- | --- | --- |
| System włączony | włączony | Gdy wyłączony, wszystko jest odrzucane |
| Stan kanału | włączony | Kanał ustawiony na `disabled` odrzuca reputację dawaną na nim |
| Odbiorca zamrożony | nie | Zamrożeni członkowie nie mogą otrzymywać reputacji |
| Czas odnowienia | 60 minut | Czas, zanim ten sam dający może ponownie dać reputację temu samemu odbiorcy |
| Limit dzienny | 10 | Reputacja, jaką dający może rozdać na dzień UTC |
| Limit tygodniowy | brak | Opcjonalny limit na tydzień, liczony od niedzieli |
| Min. wiek konta | 7 dni | Wiek konta Discord dającego |
| Min. czas na serwerze | 24 godziny | Jak długo dający jest na serwerze |
| Min. liczba wiadomości | 10 | Wiadomości wysłane przez dającego, według liczenia wiadomości |

Anonimowa reputacja zapisuje wpis jako anonimowy, ale tylko wtedy, gdy anonimowe dawanie jest włączone w konfiguracji. Ujemna reputacja to osobny przełącznik; usunięcie reakcji już samo cofa przyznane przez nią punkty.

### Serie i statystyki

Dawanie reputacji w kolejne dni buduje serię; przerwa dłuższa niż półtora dnia ją resetuje. `repstats` pokazuje sumę, pozycję, dane, otrzymane, bieżącą i najdłuższą serię oraz czasy ostatniego dania i otrzymania.

### Własne typy

`reptypeadd helpful Helpful` tworzy nazwany typ. Członkowie uruchamiają wtedy `rep @user helpful thanks for the fix`. Standardowa reputacja tylko zwiększa sumę; własny typ prowadzi też własny licznik dla typu, na który mogą się powoływać wymagania komend.

## Reakcje

`repreaction <emoji> [amount] [type]` sprawia, że reakcja daje reputację autorowi wiadomości. Reagujący nie może być botem, a usunięcie reakcji cofa punkty. Komenda domyślnie daje jeden punkt standardowej reputacji, a każda konfiguracja reakcji ma własny czas odnowienia.

## Nagrody w rolach

`reprole @Role 100` nadaje rolę, gdy członek osiągnie 100 reputacji. Opcje: ponowne odebranie roli, gdy reputacja spadnie poniżej progu (domyślnie włączone), ogłoszenie kamienia milowego na kanale oraz wysłanie wiadomości prywatnej. Nagrody są sprawdzane po każdej zmianie reputacji. Do nagrody można zapisać bonusowe XP, ale nie jest ono jeszcze wypłacane.

Niezależnie od nagród w rolach bot wysyła wiadomość o kamieniu milowym na **kanał powiadomień**, gdy członek przekroczy 50, 100, 250, 500, 1000, 2500, 5000 lub 10000 reputacji. Członkowie dostają też wiadomość prywatną, gdy otrzymają dziesięć lub więcej punktów naraz albo trafią na wielokrotność dziesięciu.

## Zanik

Gdy jest włączony, co godzinę bot sprawdza, czy nadszedł czas zaniku. `daily` działa o 02:00 UTC, `weekly` w niedzielę o 02:00 UTC, `monthly` pierwszego dnia miesiąca. Członkowie, którzy przez okres nieaktywności ani nie dawali, ani nie otrzymywali reputacji, tracą wartość zaniku, czyli stałą liczbę punktów albo procent swojej sumy, nigdy poniżej zera. Zamrożeni członkowie są pomijani. Wartości domyślne: tygodniowo, 1 punkt, 30 dni nieaktywności.

## Wymagania komend

`repcommandreq <command> <minimum> [type] [#channels]` blokuje komendę, dopóki członek nie ma tyle reputacji, opcjonalnie jednego własnego typu i opcjonalnie tylko na wybranych kanałach. `repcommandbypass` zwalnia role z wymagania, a `repcommandinfo` pozwala każdemu zobaczyć, czego komenda wymaga.

## Ustawienia

Strona Reputacji ma cztery karty: **Konfiguracja**, **Nagrody w rolach**, **Ranking** i **Statystyki**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Włącz system reputacji | włączone | Główny przełącznik |
| Czas odnowienia (minuty) | 60 | Dla pary dający–odbiorca |
| Limit dzienny | 10 | Reputacja na dającego na dzień |
| Limit tygodniowy (opcjonalnie) | brak | Reputacja na dającego na tydzień |
| Min. wiek konta (dni) | 7 | Wymaganie wobec dającego |
| Min. czas na serwerze (godziny) | 24 | Wymaganie wobec dającego |
| Min. liczba wiadomości | 10 | Wymaganie wobec dającego |
| Kanał powiadomień (opcjonalnie) | brak | Dokąd trafiają wiadomości o kamieniach milowych |
| Zezwalaj na ujemną reputację | wyłączone | Włącza wartości ujemne |
| Włącz anonimową reputację | wyłączone | Pozwala `repanon` ukryć dającego |

Zanik nie jest dostępny w panelu; użyj komend `repdecay*` poniżej.

**Nagrody w rolach** mają formularz z polami **Rola**, **Wymagana reputacja**, **Kanał ogłoszeń (opcjonalnie)**, **Bonusowe XP (opcjonalnie)**, **Usuń rolę, jeśli reputacja spadnie poniżej progu** oraz **Wysyłaj powiadomienie w wiadomości prywatnej**. **Ranking** pokazuje klasyfikację i otwiera historię członka. **Statystyki** pokazują łączną liczbę użytkowników, łączną przyznaną reputację, transakcje i średnią reputację.

## Konfiguracja krok po kroku

1. Otwórz **Reputacja** w panelu. W **Konfiguracja** włącz **Włącz system reputacji**.
2. Ustaw **Czas odnowienia**, **Limit dzienny** i trzy minimalne wymagania odpowiednio do wielkości swojego serwera.
3. Wybierz **Kanał powiadomień** dla kamieni milowych i zapisz.
4. W **Nagrody w rolach** dodaj rolę z jej **Wymaganą reputacją** i zaznacz **Usuń rolę, jeśli reputacja spadnie poniżej progu**, jeśli ma być zdobywana na bieżąco.
5. Na Discordzie uruchom `repreaction <emoji> 1`, aby włączyć reputację za reakcje, oraz `repchannel #bot-spam disabled`, aby wyłączyć z niej kanały ze spamem.
6. Przetestuj z drugiego konta: `rep @you great help`, a potem `repcheck @you`.

> [!WARNING]
> `represet all` po potwierdzeniu kasuje reputację, historię i odznaki wszystkich członków na serwerze. Nie ma możliwości cofnięcia.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, o ile go nie zmieniono).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `rep <@user> [type] [reason]` | `+rep`, `giverep`, `gr`, `repgive` | Brak | Daje jeden punkt |
| `repanon <@user> [type] [reason]` | `anongiverep` | Brak | Daje anonimowo |
| `anonrep <@user> [type] [reason]` | | Brak | To samo co `repanon` |
| `repcheck [@user]` | `myrep`, `checkrep` | Brak | Pokazuje sumę i pozycję |
| `repleaderboard [page]` | `replb`, `reptop`, `toprep` | Brak | Ranking, 25 na stronę |
| `rephistory [@user]` | `rephist` | Brak | Ostatnie dziesięć wpisów reputacji |
| `repstats [@user]` | `repstat` | Brak | Szczegółowe statystyki i serie |
| `repcommandinfo <command>` | `repcmdinfo`, `rci` | Brak | Pokazuje wymaganie reputacji komendy |
| `repstatus` | `repsettings` | Administrator | Pokazuje konfigurację |
| `repconfig` | `repcfg` | Administrator | Interaktywne menu konfiguracji |
| `repenable [true/false]` | `repe` | Administrator | Włącza lub wyłącza system |
| `repcooldown <minutes>` | `repcd` | Administrator | Od 1 do 1440 |
| `repdailylimit <n>` | `repdl` | Administrator | Od 1 do 100 |
| `repweeklylimit [n]` | `repwl` | Administrator | Od 1 do 500 albo brak, aby wyczyścić |
| `repminage <days>` | `repma` | Administrator | Od 0 do 365 |
| `repminmembership <hours>` | `repmm` | Administrator | Od 0 do 720 |
| `repminmessages <n>` | `repminmsg` | Administrator | Od 0 do 1000 |
| `repnegative <true/false>` | `repneg` | Administrator | Zezwala na ujemną reputację |
| `repanonymous <true/false>` | `repanonym` | Administrator | Zezwala na anonimową reputację |
| `repnotificationchannel [#channel]` | `repnotify` | Administrator | Ustawia lub czyści kanał kamieni milowych |
| `repchannel <#channel> [enabled/disabled/readonly] [multiplier]` | `repch` | Administrator | Stan kanału i mnożnik |
| `repdecay <true/false>` | `repd` | Administrator | Włącza zanik |
| `repdecaytype <daily/weekly/monthly/fixed/percentage>` | `repdt` | Administrator | Harmonogram zaniku lub typ wartości |
| `repdecayamount <n>` | `repda` | Administrator | Od 1 do 100 punktów lub procent |
| `repdecayinactive <days>` | `repdi` | Administrator | Od 1 do 365 dni przed zanikiem |
| `reptake <@user> [amount]` | `-rep`, `takerep` | Administrator | Odbiera punkty |
| `repset <@user> <amount>` | `setrep` | Administrator | Ustawia sumę |
| `represet <@user or all>` | `resetrep` | Administrator | Resetuje jednego członka lub wszystkich |
| `repfreeze <@user>` | `freezerep` | Administrator | Uniemożliwia członkowi otrzymywanie reputacji |
| `repunfreeze <@user>` | `unfreeze`, `unfreezerep` | Administrator | Cofa zamrożenie |
| `repreaction <emoji> [amount] [type]` | `repemoji`, `rre` | Administrator | Dodaje lub aktualizuje nagrodę za reakcję |
| `repreactionremove <emoji>` | `repemojiremove`, `rrer` | Administrator | Usuwa nagrodę za reakcję |
| `repreactionlist` | `repemojilist`, `rrel` | Administrator | Wyświetla nagrody za reakcje |
| `reprole [@role] [rep] [removeOnDrop] [#channel] [dm] [xp]` | | Zarządzanie rolami | Dodaje, aktualizuje lub wyświetla nagrody w rolach |
| `reproleremove <@role>` | `reprr` | Zarządzanie rolami | Usuwa nagrodę w roli |
| `reprolechannel <@role> [#channel]` | `reprc` | Administrator | Ustawia lub czyści kanał ogłoszeń nagrody |
| `repcommandreq <command> <min> [type] [#channels]` | `repcmdreq`, `rcr` | Administrator | Wymaga reputacji dla komendy |
| `repcommandbypass <command> <@roles>` | `repcmdbypass`, `rcb` | Administrator | Role pomijające wymaganie |
| `repcommandreqremove <command>` | `repcmdreqremove`, `rcrr` | Administrator | Usuwa wymaganie |
| `repcommandreqlist` | `repcmdreqlist`, `rcrl` | Administrator | Wyświetla wymagania |
| `reptypeadd <name> <display name>` | `repaddtype`, `rta` | Administrator | Dodaje własny typ |
| `reptyperemove <name>` | `repremovetype`, `rtr` | Administrator | Usuwa własny typ |
| `reptypelist` | `replisttypes`, `rtl` | Administrator | Wyświetla własne typy |
| `repeventcreate <name> <multiplier> <hours>` | `repec` | Administrator | Zapisuje wydarzenie z mnożnikiem |
| `repeventend <name>` | `repee` | Administrator | Kończy wydarzenie wcześniej |
| `repexport` | `repex` | Administrator | Eksportuje konfigurację jako JSON |
| `repimport` | `repim` | Administrator | Importuje plik konfiguracji załączony do wiadomości |
| `repmilestonelost <@user> <@role> <threshold>` | | Administrator | Testowa wiadomość o utraconym kamieniu milowym |

Komendy slash `/rep` obejmują `give`, `check`, `leaderboard`, `history` i `stats`, a także grupy administracyjne `/rep config`, `/rep decay`, `/rep manage`, `/rep reaction`, `/rep role`, `/rep type`, `/rep event` i `/rep require`, które odpowiadają powyższym komendom ustawień. `/rep role list` i `/rep role info` są dostępne wyłącznie jako slash.

## Wskazówki i pułapki

- Nagrody w rolach wymagają, aby rola bota była powyżej każdej roli nagrodowej, oraz uprawnienia Zarządzanie rolami, a `reprole` odmawia ról powyżej bota.
- Minimalna liczba wiadomości korzysta z funkcji liczenia wiadomości. Jeśli liczenie jest wyłączone, członkowie mogą być blokowani przed dawaniem reputacji z powodu licznika równego zero.
- Dawanie blokuje tylko stan kanału `disabled`. `readonly` jest akceptowane przez komendę, ale obecnie nie zatrzymuje reputacji na tym kanale.
- Wydarzenia tworzone przez `repeventcreate` są zapisywane z mnożnikiem i czasem zakończenia, ale mnożnik nie jest obecnie stosowany do reputacji dawanej podczas wydarzenia.
- Reputacja za reakcje używa nazwy emoji dla standardowych emoji i jego ID dla własnych, więc własne emoji z innego serwera nie będzie pasować po jego usunięciu.
- Sprawdzenia zaniku działają o pełnej godzinie, więc zanik `daily` następuje raz w godzinie 02:00 UTC.
- Czas odnowienia dotyczy pary. Jeden członek może dać reputację kilku różnym osobom jedna po drugiej, do limitu dziennego.

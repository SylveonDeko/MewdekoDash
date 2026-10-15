---
title: Zaproszenia
slug: invites
summary: Przypisuj każde dołączenie do kodu zaproszenia, linku vanity lub aplikacji, licz zwykłe, opuszczone, fałszywe i bonusowe zaproszenia dla każdego członka, oznaczaj kody etykietami i śledź wzrost, retencję oraz źródła dołączeń w czasie.
icon: fa-users
category: Community
dashboard: /dashboard/invites
module: Utility
tags: [invites, invite tracking, inviter, who invited, referrals, recruitment, leaderboard, fake invites, bonus invites, retention, vanity, labels, analytics, mass ban, zaproszenia, śledzenie zaproszeń, zapraszający, kto zaprosił, polecenia, rekrutacja, ranking, fałszywe zaproszenia, bonusowe zaproszenia, retencja, etykiety, analityka, masowy ban]
related: [multigreets, statroles, liveboards, serverstats]
---

## Co to robi

Gdy ktoś dołącza, bot porównuje linki zaproszeń serwera przed i po dołączeniu, żeby ustalić, który z nich został użyty. Jeśli żaden nie pasuje, sprawdza link vanity. Zapisuje też, w jaki sposób członek dotarł na serwer: przez zaproszenie innego członka, przez link vanity, jako bot dodany przez OAuth albo nieznany. Zapraszający dostaje zwykłe zaproszenie (**regular**), chyba że dołączenie zostanie oznaczone jako **fake**. Gdy zaproszony członek wyjdzie, licznik **odszedł** zapraszającego rośnie. Staff może przyznawać **bonusowe** zaproszenia. Łączna liczba członka to zwykłe minus opuszczone minus fałszywe, plus bonusowe.

Każde zarejestrowane dołączenie jest zachowywane, także po wyjściu członka, dzięki czemu strona może pokazać retencję (ilu zaproszonych członków wciąż tu jest), ponowne dołączenia oraz to, które kody sprowadzają ludzi, którzy zostają.

## Po co z tego korzystać

- Prowadź konkurs rekrutacyjny i wypłacaj nagrody z rankingu, którego nie da się oszukać kontami alternatywnymi ani pętlami dołącz-wyjdź.
- Sprawdź, czy kampania na Twitterze, serwer partnerski lub link z YouTube faktycznie przyprowadza członków, którzy zostają, oznaczając każdy kod etykietą.
- Pokaż zapraszającego i kod we wiadomości powitalnej.
- Znajdź i zbanuj wszystkich, których jeden zapraszający przyprowadził, gdy najazd nadchodzi przez pojedynczy link.

## Jak przypisywane są dołączenia

- Bot potrzebuje uprawnienia **Zarządzanie serwerem**, by odczytać listę zaproszeń. Bez niego nic nie jest zapisywane.
- Dołączenia są przetwarzane pojedynczo dla każdego serwera. Gdy kilka osób użyje tego samego kodu między dwoma sprawdzeniami, nadwyżka jest zapamiętywana i przypisywana kolejnym dołączeniom, więc serie dołączeń nie giną.
- Dołączenie przez link vanity jest zapisywane jako **Vanity** bez zapraszającego. Bot dodany przez OAuth jest zapisywany jako **Bot**.
- Oznaczony etykietą kod z właścicielem przypisuje zaproszenie właścicielowi, a nie temu, kto utworzył zaproszenie. Tak działają osobiste linki z komendy `invitelink`.

## Wykrywanie fałszywych zaproszeń

Dołączenie jest oznaczane jako fałszywe, a zapraszający dostaje fałszywe zaproszenie zamiast zwykłego, gdy spełniony jest którykolwiek z tych warunków:

| Powód | Kiedy |
| --- | --- |
| Self | Członek użył własnego zaproszenia |
| Nowe konto | Konto jest młodsze niż **Minimalny wiek konta** (0 wyłącza sprawdzenie) |
| Ponowne dołączenie | Członek dołączył wcześniej, a **Licz ponowne dołączenia** jest wyłączone |
| Brak awatara | Członek nie ma awatara, a **Oznaczaj członków bez awatara** jest włączone |

Zapraszający na **czarnej liście** albo posiadający rolę z czarnej listy nadal pojawiają się jako zapraszający, ale nigdy nie zdobywają punktów. Członkowie na liście **ukrytych** są śledzeni, ale pomijani w rankingach.

## Zakładki panelu

| Zakładka | Co pokazuje |
| --- | --- |
| Przegląd | Dołączenia, wyjścia, wzrost netto, retencję, fałszywe dołączenia i źródła dołączeń za ostatni dzień, tydzień, miesiąc lub cały czas, wykres dołączeń i wyjść, najlepszych zapraszających i najlepsze kody |
| Ranking | Każdy zapraszający z liczbami zwykłych, opuszczonych, fałszywych, bonusowych i retencji, filtrowany według okresu lub roli, eksportowany do CSV. Kliknij wiersz lub wybierz członka, aby zobaczyć jego zestawienie, dodać lub usunąć zwykłe, bonusowe lub fałszywe zaproszenia albo je zresetować |
| Członkowie | Każde zarejestrowane dołączenie filtrowane według zapraszającego, kodu lub etykiety, z informacją, jak członek dotarł, czy został oznaczony i czy wciąż tu jest. Eksportowalne do CSV |
| Kody i etykiety | Każdy kod zaproszenia na serwerze wraz z twórcą, kanałem i liczbą użyć. Nadaj kodowi etykietę i opcjonalnie rolę, którą otrzyma każdy, kto dołączy przez niego, albo usuń kod |
| Ustawienia | Śledzenie, usuwanie przy wyjściu, liczenie ponownych dołączeń, oznaczanie braku awatara, minimalny wiek konta, kanał, na który wskazują osobiste linki, kanał logów dołączeń i wyjść, czarne listy, ukryci członkowie oraz narzędzia importu i resetu |

## Ustawienia

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Śledź zaproszenia | włączone | Czy dołączenia w ogóle są przypisywane |
| Usuń zasługę przy wyjściu członków | włączone | Dodaje jeden do licznika opuszczonych zapraszającego, obniżając jego sumę, gdy zaproszony członek wychodzi |
| Licz ponowne dołączenia | włączone | Wyłączone oznacza członka, który dołączył wcześniej, jako fałszywe zaproszenie |
| Oznaczaj członków bez awatara | wyłączone | Dołączenia z kont bez awatara liczą się jako fałszywe |
| Minimalny wiek konta | 0 dni | Konta młodsze niż to są oznaczane jako fałszywe |
| Kanał linków osobistych | kanał systemowy | Dokąd wskazują zaproszenia utworzone przez `invitelink` |
| Kanał logów dołączeń i wyjść | brak | Publikuje embed przy każdym dołączeniu i wyjściu, mówiący, kto kogo zaprosił, z kodem, wiekiem konta i ewentualną flagą fałszywego zaproszenia |

**Importuj użycia z Discorda** podnosi łączną liczbę zwykłych zaproszeń każdego zapraszającego do sumy użyć jego kodów i nigdy jej nie obniża, więc można go bezpiecznie uruchomić ponownie po restarcie lub świeżej instalacji. **Resetuj zapraszających, którzy wyszli** czyści licznik wszystkich, którzy nie są już na serwerze. **Zresetuj wszystko** czyści każdy licznik i historię dołączeń.

## Symbole zastępcze w powitaniach

Każde powitanie może ich używać, gdy śledzenie jest włączone. Nieznane wartości zastępowane są przez `Unknown` lub `0`.

| Symbol | Wartość |
| --- | --- |
| `%inviter.mention%`, `%inviter.username%`, `%inviter.id%`, `%inviter.avatar%` | Zapraszający, któremu przypisano dołączenie |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | Licznik zapraszającego |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%`, `%invite.fake%` | Użyte zaproszenie |
| `%user.joincount%`, `%user.leavecount%` | Ile razy ten członek dołączył i wyszedł |
| `%server.members.ordinal%` | Liczba członków jako 1., 2., 1204. |
| `%user.joined.R%`, `%user.created.F%` oraz pozostałe style znaczników czasu Discorda t, T, d, D, f, F, R | Czas dołączenia i utworzenia konta jako żywe znaczniki czasu |

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś). Każda komenda istnieje też pod `/invites`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `invites [@user]` | | Nikogo | Łączna liczba członka z podziałem na zwykłe, opuszczone, fałszywe i bonusowe oraz jego pozycja |
| `whoinvited [@user]` | `invitedby` | Nikogo | Kto zaprosił członka, kod i czy dołączenie zostało oznaczone |
| `invitedusers [@user]` | `userinvites` | Nikogo | Wszyscy zaproszeni przez członka, z datami dołączeń i flagami |
| `invitedbycode <code>` | | Nikogo | Wszyscy, którzy dołączyli przez kod |
| `invitedbylabel <label>` | | Nikogo | Wszyscy, którzy dołączyli przez oznaczony etykietą kod |
| `inviteleaderboard [AllTime/Daily/Weekly/Monthly] [@role]` | `inviteslb` | Nikogo | Ranking dla okresu, opcjonalnie dla jednej roli |
| `invitestats [range]` | `growthstats` | Nikogo | Dołączenia, wyjścia, wynik netto, retencja, fałszywe dołączenia, źródła, najlepsi zapraszający i kody |
| `invitecodes [@user]` | `mycodes` | Nikogo | Kody zaproszeń członka i ich użycia |
| `invitelink` | `findlink`, `mylink` | Nikogo | Twój osobisty stały link, tworzony, jeśli go nie masz |
| `addinvites`, `removeinvites`, `addbonusinvites`, `removebonusinvites`, `addfakeinvites`, `removefakeinvites <@user> <amount>` | | Zarządzanie serwerem | Koryguje licznik członka |
| `resetinvites <@user>` lub `resetinvites Server` lub `resetinvites LeftMembers` | | Zarządzanie serwerem, Administrator dla resetu całego serwera | Resetuje liczniki |
| `syncinvites [@user]` | | Zarządzanie serwerem | Importuje użycia z Discorda |
| `deleteinvite <code>` | `delinvite` | Zarządzanie serwerem | Usuwa kod |
| `purgeinvites [maxUses] [#channel]` | | Zarządzanie serwerem | Usuwa każdy nieoznaczony etykietą kod użyty co najwyżej tyle razy |
| `inviteblacklist <@user or @role>` | `invbl` | Zarządzanie serwerem | Przełącza, czy ktoś może zdobywać punkty |
| `invitehide <@user>` | `invhide` | Zarządzanie serwerem | Przełącza, czy ktoś pojawia się w rankingach |
| `inviteexclusions` | | Zarządzanie serwerem | Wypisuje czarne listy i ukrytych członków |
| `invitelabelset <code> <label>`, `invitelabelrole <code> [@role]`, `invitelabelremove <code>`, `invitelabels` | | Zarządzanie serwerem | Zarządza etykietami |
| `inviteexport [range]`, `invitedexport [@user]` | | Zarządzanie serwerem | Eksporty CSV |
| `invitemassban <@user> [reason]`, `invitemassbancode <code> [reason]` | | Banowanie członków | Banuje wszystkich, którzy wciąż tu są, a zostali zaproszeni przez członka lub przez kod, po potwierdzeniu |
| `invitesettings`, `toggleinvitetracking`, `toggleremoveinviteonleave`, `togglecountrejoins`, `togglefakenoavatar`, `setminaccountage <days>`, `invitelinkchannel [#channel]`, `invitelogchannel [#channel]` | | Zarządzanie serwerem | Ustawienia |

## Wskazówki i pułapki

- Członkowie, którzy dołączyli przed włączeniem śledzenia albo gdy bot był offline, nie mają zapisu dołączenia. Uruchom **Importuj użycia z Discorda** raz, aby zasiać sumy zwykłych zaproszeń z własnych liczników Discorda.
- Fałszywe dołączenia nigdy nie obniżają sumy, gdy członek wychodzi; tylko zwykłe zaproszenia zamieniają się w opuszczone.
- Członek, który wychodzi i wraca, dostaje nowy zapis dołączenia. Przy włączonym **Licz ponowne dołączenia** zapraszający znów zdobywa zwykłe zaproszenie, co znosi wcześniejsze opuszczone zaproszenie.
- Retencja w rankingu liczy tylko dołączenia, które bot zarejestrował, więc zaczyna się od 100% i ustala się, gdy zgromadzi się historia.
- Role statystyk mogą nagradzać liczbę zaproszeń, a żywe tablice mogą przypiąć ranking zaproszeń na kanale.

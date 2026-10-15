---
title: Głosy
slug: votes
summary: Nagradzaj członków, którzy głosują na twój serwer na top.gg, podziękowaniem, licznikiem głosów oraz tymczasowymi lub stałymi rolami.
icon: fa-thumbs-up
category: Community
dashboard: /dashboard/votes
module: Votes
tags: [votes, top.gg, vote rewards, vote roles, webhook, vote password, leaderboard, głosy, nagrody za głos, role za głosowanie, hasło do głosowania, ranking]
related: [administration, xp]
---

## Co robi

To nie jest funkcja ankiet. Głosy śledzi głosy, jakie twój serwer otrzymuje na top.gg, i nagradza osoby, które je oddały. Gdy top.gg informuje Mewdeko, że ktoś zagłosował, bot zapisuje głos, publikuje podziękowanie na twoim kanale głosowania z bieżącą liczbą głosów tego członka i nadaje wszystkie role skonfigurowane jako nagrody za głos.

Z punktu widzenia członka: zagłosuje na serwer na top.gg, a potem na kanale głosowania pojawia się wiadomość, która go wspomina i pokazuje, ile razy głosował. Jeśli skonfigurowałeś role za głosowanie, dostaje je w tym samym momencie, na stałe albo na określony czas.

Z punktu widzenia staffu: ustawiasz kanał głosowania, hasło webhooka, opcjonalną własną wiadomość i do dziesięciu ról nagród. Potem bot obsługuje każdy głos samodzielnie. `votes` i `votesleaderboard` pozwalają każdemu sprawdzić liczniki.

Łącznikiem między top.gg a twoim serwerem jest hasło do głosowania. top.gg wysyła je w nagłówku Authorization swojego wywołania webhooka, a Mewdeko porównuje ten nagłówek z hasłem zapisanym dla każdego serwera, aby ustalić, do którego serwera należy głos.

## Po co z tego korzystać

- Masz swój serwer na top.gg i chcesz widzieć podziękowanie za każdy oddany głos.
- Chcesz nadawać głosującym rolę „Głosujący” albo tymczasową rolę z przywilejem, która wygasa po dwunastu godzinach.
- Chcesz prowadzić miesięczny ranking głosujących, by nagradzać „najlepszego głosującego”.
- Chcesz, aby członkowie mogli sprawdzić własną liczbę głosów bez pytania staffu.

## Jak przetwarzany jest głos

1. top.gg wysyła żądanie do endpointu webhooka `/votes/` bota, z ID Discord głosującego i twoim hasłem w nagłówku Authorization.
2. Bot znajduje serwer, którego zapisane hasło do głosowania pasuje. Jeśli żadne nie pasuje, głos zostaje odrzucony.
3. Głos jest zapisywany wraz z ID głosującego i czasem.
4. Jeśli ustawiono kanał głosowania, bot publikuje tam wiadomość z podziękowaniem. Bez kanału głosowania nic nie jest publikowane i nie są nadawane żadne role.
5. Każda rola za głosowanie zostaje dodana członkowi. Role z czasem są usuwane, gdy czas minie, przy użyciu tego samego systemu ról czasowych co wyciszenia.

> [!WARNING]
> Hasło jest jedyną rzeczą łączącą głos z twoim serwerem. Każdy, kto je zna, może wysyłać fałszywe głosy. Nigdy nie wklejaj go na publicznym kanale; bot ustawia je przez prywatne okno z tego powodu.

## Wiadomość z podziękowaniem

Domyślnie bot wysyła wzmiankę o głosującym oraz embed zatytułowany „Thanks for voting for <server>”, linię z łączną liczbą głosów i awatar głosującego jako miniaturę.

Możesz to zastąpić własnym tekstem lub embedem, używając `votemessage` albo pola **Własne ogłoszenie o głosie** w panelu. Tekst przechodzi przez parser embedów, więc działa wszystko, co wygeneruje kreator embedów. Ustaw go na `-` w komendzie albo wyczyść pole w panelu, aby wrócić do domyślnej wiadomości.

### Symbole zastępcze

Własna wiadomość obsługuje ogólny zestaw symboli zastępczych (użytkownika, serwera, kanału, bota i czasu ze strony symboli zastępczych) oraz dwa symbole specyficzne dla głosów.

| Symbol zastępczy | Wartość |
| --- | --- |
| `%votestotalcount%` | Ile razy ten członek głosował łącznie |
| `%votesmonthcount%` | Ile razy głosował w bieżącym miesiącu kalendarzowym |
| `%user.mention%`, `%user.name%`, `%user.id%`, `%user.avatar%` | Głosujący |
| `%server.name%`, `%server.id%`, `%server.icon%`, `%server.members%` | Twój serwer |

> [!EXAMPLE]
> `Thanks %user.mention% for voting! That is vote number %votestotalcount% (%votesmonthcount% this month).`

Uruchomienie `votemessage` bez tekstu wyświetla podgląd bieżącej wiadomości tak, jak wyglądałaby u ciebie, z twoimi własnymi licznikami głosów.

## Role za głosowanie

Rola za głosowanie jest nadawana każdemu głosującemu. Każda rola ma opcjonalny czas trwania w sekundach; `0` oznacza, że rola jest stała.

- Do dziesięciu ról za głosowanie na serwer.
- Nie można dodać roli `@everyone`.
- Roli nie można dodać dwa razy; aby zmienić jej czas trwania, użyj `voteroleedit`.
- Role czasowe są usuwane automatycznie po upływie czasu.
- Jeśli bot nie może nadać roli (na przykład rola jest powyżej najwyższej roli bota), po cichu ją pomija.

## Liczniki głosów i ranking

`votes` pokazuje głosy członka w tym miesiącu i łącznie, wraz z jego awatarem. `votesleaderboard` układa wszystkich na serwerze według łącznej liczby głosów, po dwanaście na stronę. Podaj `true`, aby uszeregować według głosów tylko z tego miesiąca. Oba liczniki „miesięczne” odnoszą się do miesiąca kalendarzowego, a nie do ostatnich trzydziestu dni.

## Ustawienia

Strona Głosy ma trzy zakładki: **Konfiguracja**, **Role za głosowanie** i **Statystyki**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Kanał ogłoszeń głosowania | brak | Gdzie publikowane są wiadomości z podziękowaniem. Bez tego nic się nie dzieje |
| Hasło API (dla webhooków) | brak | Sekret, który top.gg musi wysłać w nagłówku Authorization |
| Własne ogłoszenie o głosie | domyślny embed | Twoja wiadomość z powyższymi symbolami zastępczymi. Puste oznacza domyślną |
| Rola do nadania | brak | Rola dodawana każdemu głosującemu (zakładka Role za głosowanie) |
| Czas trwania (sekundy, 0 = na stałe) | 0 | Jak długo rola za głosowanie trwa, zanim zostanie usunięta |

Zakładka **Statystyki** pokazuje łączną liczbę głosów, liczbę ról za głosowanie, liczbę głosów najlepszego głosującego oraz ranking dziesięciu najlepszych.

## Krok po kroku

1. Otwórz **Głosy** w panelu i zostań na zakładce **Konfiguracja**.
2. Wybierz **Kanał ogłoszeń głosowania**. Bez niego głosy są zapisywane, ale nic nie jest publikowane i nie są nadawane role.
3. Wpisz **Hasło API**. Niech będzie długie i losowe; traktuj je jak klucz API.
4. Opcjonalnie napisz **Własne ogłoszenie o głosie**, używając powyższych symboli zastępczych, a następnie **Zapisz konfigurację**.
5. Na stronie twojego serwera na top.gg otwórz sekcję webhooków. Ustaw adres URL webhooka na endpoint `/votes/` twojego bota, a wartość Authorization na to samo hasło.
6. Na zakładce **Role za głosowanie** wybierz **Rola do nadania** i **Czas trwania**, a potem **Dodaj rolę za głosowanie**. Powtórz dla do dziesięciu ról.
7. Upewnij się, że rola bota znajduje się powyżej każdej roli za głosowanie na liście ról.
8. Użyj przycisku testowego webhooka na top.gg albo poczekaj na prawdziwy głos i sprawdź kanał głosowania.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `votechannel <#channel>` | | Zarządzaj serwerem | Ustawić kanał wiadomości z podziękowaniem |
| `votemessage [text]` | `votemsg` | Zarządzaj serwerem | Wyświetlić podgląd, ustawić lub zresetować (`-`) własną wiadomość |
| `votepassword` | `votepass` | Zarządzaj serwerem | Ustawić hasło webhooka przez prywatne okno |
| `voteroleadd <@role> [time]` | `vra` | Zarządzaj serwerem | Dodać rolę za głosowanie, opcjonalnie z czasem, na przykład `voteroleadd @Voter 12h` |
| `voteroleedit <@role> <time>` | `vre` | Zarządzaj serwerem | Zmienić czas trwania roli za głosowanie |
| `voteroleremove <@role>` | `vrr` | Zarządzaj serwerem | Usunąć jedną rolę za głosowanie |
| `voteroleslist` | `vrl` | Zarządzaj serwerem | Wyświetlić role za głosowanie i ich czas trwania |
| `voterolesclear` | `vrc` | Zarządzaj serwerem | Usunąć wszystkie role za głosowanie po potwierdzeniu |
| `votes [@user]` | | Nikt | Pokazać miesięczne i łączne głosy członka |
| `votesleaderboard [true]` | `voteslb` | Nikt | Uszeregować głosujących według łącznej liczby albo, z `true`, według tego miesiąca |

Te same komendy istnieją jako komendy ukośnikowe pod `/votes`.

## Wskazówki i pułapki

- Obsługiwane są tylko głosy na serwer na top.gg. Nie ma integracji z innymi listami botów, a ta funkcja nie tworzy ankiet.
- Brak kanału głosowania oznacza brak wiadomości i brak ról, mimo że głos nadal jest liczony.
- Bot potrzebuje uprawnienia Zarządzaj rolami, a jego rola musi znajdować się powyżej każdej roli za głosowanie; w przeciwnym razie nagrody za role cicho się nie powiodą.
- Role czasowe za głosowanie korzystają z tego samego systemu ról czasowych co wyciszenia czasowe i pojawiają się w dzienniku audytu z powodem „Vote Role”.
- `voteroleedit` wyszukuje rolę tylko po ID, więc używaj go wyłącznie dla ról, które faktycznie dodałeś na tym serwerze.
- Zmiana hasła nie unieważnia starych głosów, ale top.gg przestanie je dopasowywać, dopóki nie zaktualizujesz nagłówka także po ich stronie.

---
title: Dostęp do kanałów
slug: channel-access
summary: Zamknij prywatny kanał za formularzem podania i pozwól członkom, którzy już są w środku, głosować, kto zostanie wpuszczony.
icon: fa-lock
category: Security
dashboard: /dashboard/channel-access
module: ChannelAccess
tags: [channel access, gate, application, apply, vote, private channel, locked channel, inner circle, blacklist, review, dostęp do kanałów, brama, podanie, głosowanie, prywatny kanał, zablokowany kanał, wewnętrzny krąg, czarna lista, ocena]
related: [administration, tickets, forms]
---

## Co robi

Staff nakłada „bramę” na kanał, którego większość członków nie widzi. Członkowie klikają przycisk **Złóż podanie o dostęp** albo uruchamiają `channelaccessapply` i wypełniają krótki formularz z maksymalnie pięcioma pytaniami. Podanie jest publikowane jako embed na kanale oceny z przyciskami **Zatwierdź**, **Odrzuć**, opcjonalnie **Wstrzymaj się** oraz **Podział**.

Głosują osoby, które już widzą kanał. Gdy napłynie wystarczająco dużo głosów za, kandydat zostaje wpuszczony, przez nadanie roli albo osobne nadpisanie uprawnień na kanale. Wystarczająca liczba głosów przeciw albo upłynięcie czasu głosowania oznacza odrzucenie. Staff może w każdej chwili wymusić dowolny wynik.

Kandydat dostaje wynik w wiadomości prywatnej, jeśli brama na to pozwala, a odrzuceni kandydaci muszą odczekać czas oczekiwania, zanim złożą podanie ponownie. Wszystko jest logowane na opcjonalnym kanale logów.

## Po co z tego korzystać

- Salon tylko dla członków lub „wewnętrzny krąg”, w którym obecni członkowie decydują, kto dołączy.
- Kanał dla zweryfikowanych dorosłych, w którym niewielka zaufana grupa ręczy za nowych.
- Kanały handlowe lub targowe, które chcą kontroli, zanim ktoś będzie mógł pisać.
- Każdy kanał, na którym chcesz pisemne podanie, bez konieczności czytania każdego przez staff.

## Bramy

Brama to jeden kanał wraz z jego regułami. Każdy kanał może mieć jedną bramę. Utworzenie bramy z rolą czyni ją **bramą z rolą**; utworzenie jej bez roli czyni ją **bramą bezpośrednią**.

| Tryb nadawania | Etykieta w panelu | Jak nadawany jest dostęp | Kto liczy się jako „w środku” |
| --- | --- | --- | --- |
| Role | Nadaj im rolę | Rola dostępu jest dodawana kandydatowi | Każdy posiadający rolę dostępu |
| Channel permission | Dodaj ich bezpośrednio do kanału | Dla tego członka zapisywane jest nadpisanie zezwalające na Wyświetlanie kanału | Każdy, kto aktualnie widzi kanał |

Zatwierdzeni członkowie nigdy nie są usuwani automatycznie. Zabierz rolę lub usuń nadpisanie samodzielnie.

## Podania

Zanim podanie się otworzy, bot sprawdza w tej kolejności: czy brama przyjmuje podania, czy członek nie ma już dostępu, czy nie jest zablokowany, czy jego konto i dołączenie do serwera są wystarczająco stare, czy nie ma otwartego podania do tej bramy i czy minął jego czas oczekiwania na ponowne podanie. Niepowodzenie któregokolwiek sprawdzenia zwraca wiadomość widoczną tylko dla niego z wyjaśnieniem.

Jeśli brama ma pytania, otwiera się modal z jednym polem na pytanie. Pytania są ograniczone do 45 znaków z powodu limitów modali Discorda. Pola odpowiedzi są jednoliniowe (200 znaków) lub wieloliniowe (1000 znaków) i można je oznaczyć jako wymagane. Brama bez pytań wysyła podanie od razu.

Wiadomość oceny trafia na **Kanał oceny** albo, gdy żadnego nie ustawiono, na sam zablokowany kanał. Pokazuje kandydata, kiedy utworzył konto i kiedy dołączył, każde pytanie i odpowiedź, bieżące zestawienie głosów oraz stopkę z informacją, kiedy kończy się głosowanie. Jeśli włączone jest **Ukryj kandydata do zamknięcia głosowania**, nazwa jest zastępowana tekstem „Ukryty do zamknięcia głosowania”, dopóki podanie oczekuje.

### Statusy

| Status | Znaczenie |
| --- | --- |
| Pending | Otwarte i w trakcie głosowania |
| Approved | Przeszło, dostęp został nadany |
| Denied | Odrzucone głosowaniem, wygaśnięciem lub przez staff |
| Withdrawn | Kandydat wycofał je przez `channelaccesswithdraw` |
| Expired | Nieużywany przez obecne reguły wygaśnięcia; zachowany dla historii |

## Głosowanie

To, kto może głosować, zależy od bramy. Jeśli ustawiono **Rolę głosujących**, głosować mogą tylko członkowie z tą rolą. W przeciwnym razie głosować może każdy, kto już ma dostęp do kanału, oraz każdy z uprawnieniem Zarządzanie rolami. Kandydaci nigdy nie mogą głosować nad własnym podaniem.

Kliknięcie przycisku zapisuje głos. Kliknięcie innego przycisku go zmienia. Ponowne kliknięcie tego samego przycisku go usuwa. Zestawienie na wiadomości aktualizuje się po każdej zmianie.

Podanie jest rozstrzygane, gdy tylko głosy za osiągną **Wymagane głosy za** albo głosy przeciw osiągną **Wymagane głosy przeciw**. Ustawienie któregokolwiek progu na 0 wyłącza tę stronę, więc brama z **Wymagane głosy przeciw** ustawionymi na 0 może zostać odrzucona tylko przez staff albo wygaśnięcie.

**Podział** pokazuje, kto jak głosował, tylko głosującym. Przy włączonym **Ukryj, kto jak głosował** widzą go tylko członkowie z uprawnieniem Zarządzanie rolami.

### Gdy czas się skończy

Sprawdzenie w tle działa co minutę dla podań po upływie **Czasu głosowania**. To, co się wtedy dzieje, ustawia się dla każdej bramy:

| Opcja | Etykieta w panelu | Wynik |
| --- | --- | --- |
| Deny | Odrzuć podanie | Podanie jest odrzucane. Domyślnie. |
| Majority | Ta strona, która ma więcej głosów | Zatwierdzone, jeśli głosów za jest więcej niż przeciw, w przeciwnym razie odrzucone |
| StayOpen | Zostaw otwarte dla staffu | Nic się nie dzieje, dopóki staff go nie rozstrzygnie |

Ustaw **Czas głosowania** na 0, aby nie było limitu czasu.

## Blokowanie kandydatów

Staff może zablokować użytkownika w jednej bramie albo we wszystkich bramach na serwerze. Zablokowani użytkownicy dostają komunikat „You are blocked from applying for this channel”, gdy spróbują. Blokady mają opcjonalny powód, który widać na czarnej liście.

## Ustawienia

Strona **Dostęp do kanałów** ma trzy karty: **Bramy**, **Podania** i **Zablokowani**.

**Bramy** wyświetlają każdą bramę z przełącznikiem **Przyjmowanie podań** i rozwijają się, aby pokazać jej ustawienia, **Pytania w podaniu** oraz narzędzie do publikowania **Panelu podań**. Poniższe wartości domyślne dotyczą nowych bram.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Zablokowany kanał | wymagane | Kanał zamykany bramą |
| Jak ludzie się dostają | Nadaj im rolę | Brama z rolą lub brama bezpośrednia |
| Rola nadawana po zaakceptowaniu | brak | Rola dostępu, dla bram z rolą |
| Wymagane głosy za | 3 | Głosy za, które rozstrzygają jako zatwierdzone; 0 wyłącza |
| Wymagane głosy przeciw | 3 | Głosy przeciw, które rozstrzygają jako odrzucone; 0 wyłącza |
| Czas głosowania (godziny) | 72 | Czas przed zadziałaniem reguły wygaśnięcia; 0 oznacza brak limitu |
| Gdy czas się skończy | Odrzuć podanie | Jedna z trzech opcji wygaśnięcia |
| Kanał oceny | sam zablokowany kanał | Gdzie publikowane są podania do głosowania |
| Kanał logów | brak logowania | Gdzie logowane są nowe podania i wyniki |
| Rola głosujących | wszyscy z rolą dostępu | Ogranicza głosowanie do jednej roli |
| Pinguj rolę przy nowych podaniach | brak pingu | Rola wzmiankowana po nadejściu podania |
| Min. wiek konta (dni) | 0 | Odrzuca konta młodsze niż ta wartość |
| Min. czas na serwerze (dni) | 0 | Odrzuca członków, którzy dołączyli niedawniej niż ta wartość |
| Czas oczekiwania na ponowne podanie (godziny) | 168 | Czekanie po odrzuceniu lub wygaśnięciu przed ponownym podaniem |
| Pokaż przycisk wstrzymania się | włączone | Dodaje przycisk Wstrzymaj się do wiadomości oceny |
| Ukryj kandydata do zamknięcia głosowania | wyłączone | Anonimowy kandydat, dopóki podanie oczekuje |
| Ukryj, kto jak głosował | wyłączone | Podział tylko dla Zarządzanie rolami |
| Wyślij kandydatowi DM z decyzją | włączone | Wysyła wynik w wiadomości prywatnej |

**Podania** wyświetlają podania filtrowane według bramy i statusu, z zestawieniem głosów oraz przyciskami **Zatwierdź** i **Odrzuć** dla oczekujących. **Zablokowani** wyświetla zablokowanych użytkowników według zakresu i pozwala **Zablokować** kogoś w jednej bramie albo w opcji **Każda brama**, z opcjonalnym powodem.

## Konfiguracja krok po kroku

1. Ustaw kanał jako prywatny na Discordzie, a dla bramy z rolą utwórz rolę, która go widzi.
2. Otwórz **Dostęp do kanałów** w panelu i użyj **Otwórz podania na kanał**. Wybierz **Zablokowany kanał**, wskaż **Jak ludzie się dostają** i w razie potrzeby wybierz rolę.
3. Rozwiń bramę. Ustaw **Kanał oceny**, aby podania nie trafiały na zablokowany kanał, oraz **Kanał logów**, jeśli chcesz mieć zapis.
4. Dostosuj **Wymagane głosy za**, **Wymagane głosy przeciw** i **Czas głosowania** do liczby głosujących, jakiej się spodziewasz.
5. W **Pytania w podaniu** dodaj do pięciu pytań. Zaznacz **Wymagane** i **Odpowiedź wieloliniowa** według potrzeb.
6. W **Panel podań** wybierz, gdzie ma trafić przycisk, i kliknij **Opublikuj panel**.
7. Złóż podanie z testowego konta, zagłosuj z konta członka mającego dostęp i sprawdź, czy kandydat zostaje wpuszczony.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, o ile go nie zmieniono). Wersje slash znajdują się pod `/channelaccess`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `channelaccesssetup <#channel> [@role]` | `casetup` | Zarządzanie rolami | Tworzy bramę; pomiń rolę dla bramy bezpośredniej |
| `channelaccessremove <#channel>` | `caremove` | Zarządzanie rolami | Usuwa bramę wraz z pytaniami i historią |
| `channelaccesslist` | `calist` | Brak | Wyświetla bramy z progami, czasem i statusem |
| `channelaccessconfig <#channel> [setting] [value]` | `caconfig` | Zarządzanie rolami | Zmienia jedno ustawienie; uruchom bez ustawienia, aby zobaczyć listę |
| `channelaccesspanel <#channel> [#target]` | `capanel` | Zarządzanie rolami | Publikuje przycisk składania podań, domyślnie na bieżącym kanale |
| `channelaccessquestionadd <#channel> <question>` | `caqadd` | Zarządzanie rolami | Dodaje wymagane pytanie wieloliniowe |
| `channelaccessquestionremove <#channel> <position>` | `caqremove` | Zarządzanie rolami | Usuwa pytanie według jego numeru z listy |
| `channelaccessquestionlist <#channel>` | `caqlist` | Zarządzanie rolami | Pokazuje pytania po kolei |
| `channelaccessapply <#channel>` | `caapply` | Brak | Publikuje przycisk składania podań dla ciebie |
| `channelaccesswithdraw <id>` | `cawithdraw` | Brak | Wycofuje twoje własne otwarte podanie |
| `channelaccesshistory [@user]` | `cahistory` | Brak | Twoja historia podań; inni użytkownicy wymagają Zarządzanie rolami |
| `channelaccesspending [#channel]` | `capending` | Brak | Wyświetla otwarte podania, opcjonalnie dla jednej bramy |
| `channelaccessapprove <id> [reason]` | `caapprove` | Zarządzanie rolami | Zatwierdza niezależnie od głosów |
| `channelaccessdeny <id> [reason]` | `cadeny` | Zarządzanie rolami | Odrzuca niezależnie od głosów |
| `channelaccessblacklistadd <@user> [#channel]` | `cabladd` | Zarządzanie rolami | Blokuje w jednej bramie albo wszędzie, gdy nie podano kanału |
| `channelaccessblacklistremove <@user> [#channel]` | `cablremove` | Zarządzanie rolami | Zdejmuje blokadę; podaj ten sam kanał, na którym ją ustawiono |
| `channelaccessblacklist` | `cablacklist` | Zarządzanie rolami | Wyświetla zablokowanych użytkowników |

Ustawienia przyjmowane przez `channelaccessconfig` to `enabled`, `approvals`, `denials`, `votehours`, `onexpiry` (`deny`, `majority`, `stayopen`), `reviewchannel`, `logchannel`, `voterrole`, `pingrole`, `anonymousapplicant`, `anonymousvotes`, `allowabstain`, `minaccountage`, `minserverage`, `reapplycooldown` i `dmondecision`.

> [!EXAMPLE]
> `caconfig #inner-circle approvals 5`, a potem `caconfig #inner-circle onexpiry majority`.

## Wskazówki i pułapki

- Bot potrzebuje Zarządzanie rolami dla bram z rolą oraz Zarządzanie kanałami (z uprawnieniem do edycji nadpisań tego kanału) dla bram bezpośrednich. Jego najwyższa rola musi być powyżej roli dostępu.
- Jeśli nie ustawiono **Kanału oceny**, podania są publikowane wewnątrz zablokowanego kanału. Sprawdza się to przy „członkowie głosują nad nowymi”, ale ustaw osobny kanał, jeśli głosować ma staff.
- Pytania dodane komendą są zawsze wymagane i wieloliniowe. Użyj panelu, aby uczynić pytanie opcjonalnym lub jednoliniowym albo dodać do niego tekst zastępczy.
- Usunięcie bramy trwale usuwa jej pytania, podania i głosy.
- Członkowie, którzy opuszczą serwer przed końcem głosowania, nie dostają dostępu, nawet jeśli zostali zatwierdzeni.
- Wyniki głosowania i wygaśnięcia są wysyłane w wiadomości prywatnej tylko dla zatwierdzeń i odrzuceń. Wycofane podania nie dostają wiadomości prywatnej.
- Zablokowanego użytkownika trzeba odblokować w tym samym zakresie, w którym ustawiono blokadę. Blokada obejmująca cały serwer nie jest zdejmowana przez odblokowanie podające kanał.

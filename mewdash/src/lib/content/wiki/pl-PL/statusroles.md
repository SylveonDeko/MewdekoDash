---
title: Role statusowe
slug: statusroles
summary: Automatycznie dodawaj lub odbieraj role, gdy niestandardowy status członka Discorda zawiera określony tekst, i opcjonalnie ogłaszaj to na kanale.
icon: fa-user-circle
category: Actions
dashboard: /dashboard/statusroles
module: StatusRoles
tags: [status roles, custom status, vanity, auto role, presence, role automation, status text, role statusowe, niestandardowy status, automatyczna rola, obecność, automatyzacja ról, tekst statusu]
related: [administration, afk]
---

## Co robi

Staff dodaje jeden lub więcej fragmentów tekstu do obserwowania, na przykład `discord.gg/yourserver` albo `playing minecraft`. Bot obserwuje aktualizacje obecności. Gdy niestandardowy status członka zaczyna zawierać ten tekst, bot usuwa role wymienione pod **Role do usunięcia**, dodaje role z **Role do dodania** i, jeśli ustawiono kanał i wiadomość, publikuje tam powiadomienie.

Gdy tekst znika ze statusu, o dalszym działaniu decydują dwa przełączniki. **Usuń dodane role** odbiera role, które zostały nadane. **Dodaj ponownie usunięte role** przywraca role, które zostały odebrane. Oba są domyślnie wyłączone, więc bez zmian członek po prostu zachowuje role, które ma.

Sprawdzany jest tylko niestandardowy status, czyli tekst wpisany w polu „Ustaw niestandardowy status” w Discordzie. Aktywności gry, Spotify i transmisje są ignorowane. Członkowie offline lub niewidoczni są pomijani, a dopasowanie to zwykłe sprawdzenie podciągu, więc `mewdeko` pasuje do `I love mewdeko`, ale wielkość liter ma znaczenie.

Każdy serwer może mieć dowolną liczbę wpisów ról statusowych, każdy z własnymi rolami, kanałem i wiadomością. Komendy odnoszą się do wpisu po jego indeksie, czyli numerze pokazywanym przez `liststatusroles`.

## Po co z tego korzystać

- Nagradzaj członków, którzy wpisali twoje zaproszenie do statusu, rolą wspierającego i jej przywilejami.
- Nadawaj rolę „streamuje” lub „szuka gry”, gdy ktoś reklamuje to w statusie, i odbieraj ją, gdy przestanie.
- Ogłaszaj na kanale, gdy członek zaczyna reklamować serwer, aby staff mógł mu podziękować.
- Zamieniaj jedną rolę na inną, gdy status jest aktywny, na przykład wyjmij członka z roli „bez pingów”, dopóki pokazuje określony status.

## Dopasowanie i zmiany ról

| Sytuacja | Co robi bot |
| --- | --- |
| Status zaczyna zawierać obserwowany tekst | Usuwa **Role do usunięcia**, dodaje **Role do dodania**, wysyła powiadomienie, jeśli jest skonfigurowane |
| Status nadal zawiera obserwowany tekst | Nic, zmiana jest przetwarzana tylko raz |
| Status przestaje zawierać obserwowany tekst, włączone **Usuń dodane role** | Usuwa wszystkie role z **Role do dodania**, które członek nadal ma |
| Status przestaje zawierać obserwowany tekst, włączone **Dodaj ponownie usunięte role** | Przywraca wszystkie role z **Role do usunięcia**, których członek już nie ma |
| Członek przechodzi w tryb offline lub niewidoczny | Nic, role pozostają bez zmian |

Bot porównuje każdą aktualizację obecności z ostatnim statusem zapisanym w pamięci podręcznej dla danego użytkownika, więc członek, który edytuje niezwiązaną część statusu, nie jest przetwarzany ponownie. Obserwowany tekst musi być unikalny na serwerze; komendy ograniczają go do 128 znaków, panel nie.

## Wiadomość powiadomienia

Jeśli wpis ma ustawione zarówno **Kanał powiadomień**, jak i **Wiadomość powiadomienia**, bot publikuje wiadomość za każdym razem, gdy status członka zaczyna pasować. Tekst przechodzi przez parser embedów, więc działa wszystko, co wygeneruje kreator embedów: zwykły tekst, do dziesięciu embedów i komponenty. Gdy status przestaje pasować, nic nie jest publikowane.

### Symbole zastępcze

Wiadomość jest przetwarzana przez standardowy zestaw zamienników dla członka, kanału powiadomień i serwera. Najbardziej przydatne są poniżej; pełna lista znajduje się na stronie symboli zastępczych w sekcjach użytkownika, serwera, kanału, bota i czasu.

| Symbol zastępczy | Wartość |
| --- | --- |
| `%user.mention%` | Wzmianka o członku |
| `%user.name%` | Nazwa użytkownika członka |
| `%user.fullname%` | Nazwa użytkownika z dyskryminatorem |
| `%user.avatar%` | Adres URL awatara członka |
| `%user.id%` | ID użytkownika członka |
| `%server.name%` | Nazwa serwera |
| `%server.icon%` | Adres URL ikony serwera |
| `%channel.mention%` | Wzmianka o kanale powiadomień |
| `%server.time%` | Aktualny czas w strefie czasowej ustawionej na serwerze |

> [!NOTE]
> Edytor w panelu wymienia symbol `%status%`, ale bot go nie zamienia. Tekst statusu wpisz do wiadomości samodzielnie.

> [!EXAMPLE]
> `%user.mention% is now repping the server in their status, thank you!`

## Ustawienia

Wszystko znajduje się na stronie Role statusowe, która ma trzy zakładki: **Role statusowe**, **Dodaj nową** i **Statystyki**. Każdy wpis na liście rozwija się, pokazując swoje ustawienia.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Tekst statusu do wypatrywania | brak | Tekst, który musi zawierać niestandardowy status; w panelu bez limitu długości, w komendach 128 znaków |
| Role do dodania | brak | ID ról rozdzielone spacjami, nadawane, gdy status pasuje; Zapisz zastępuje całą listę |
| Role do usunięcia | brak | ID ról rozdzielone spacjami, odbierane, gdy status pasuje; Zapisz zastępuje całą listę |
| Kanał powiadomień | brak | Kanał, który otrzymuje wiadomość powiadomienia |
| Wiadomość powiadomienia | brak | Tekst lub embed wysyłany na kanał, z symbolami zastępczymi |
| Usuń dodane role | wył. | Odbierz dodane role, gdy status przestaje pasować |
| Dodaj ponownie usunięte role | wył. | Przywróć usunięte role, gdy status przestaje pasować |

Zakładka **Statystyki** pokazuje łączną liczbę wpisów, ile z nich zmienia role i ile ma kanał powiadomień.

## Krok po kroku

1. Otwórz **Role statusowe** w panelu i przejdź do zakładki **Dodaj nową**.
2. Wpisz tekst do obserwowania i naciśnij **Dodaj rolę statusową**.
3. Przejdź do zakładki **Role statusowe** i rozwiń nowy wpis.
4. Naciśnij **Edytuj ustawienia**, wklej ID ról do **Role do dodania** i **Role do usunięcia**, wybierz **Kanał powiadomień** i napisz **Wiadomość powiadomienia**, jeśli chcesz, a następnie **Zapisz**.
5. Użyj dwóch przycisków przełączników we wpisie, aby włączyć **Usuń dodane role** i, jeśli potrzebujesz, **Dodaj ponownie usunięte role**.
6. Przetestuj: ustaw własny niestandardowy status na ten tekst i sprawdź, czy rola się pojawiła, a potem go wyczyść i sprawdź, czy rola została usunięta.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś). Każda komenda wymaga uprawnienia Zarządzaj serwerem. `<index>` to numer pokazywany przez `liststatusroles`, zaczynający się od 1. Wersje ukośnikowe znajdują się pod `/statusroles`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `addstatusrole <text>` | `asr` | Zarządzaj serwerem | Dodać tekst statusu do obserwowania |
| `removestatusrole <index>` | `rsr` | Zarządzaj serwerem | Usunąć wpis |
| `liststatusroles` | `lsr` | Zarządzaj serwerem | Przeglądać wszystkie wpisy wraz z indeksem i ustawieniami |
| `setaddroles <index> <@role...>` | `sar` | Zarządzaj serwerem | Dodać role do listy nadawanych, gdy status pasuje |
| `setremoveroles <index> <@role...>` | `srr` | Zarządzaj serwerem | Dodać role do listy odbieranych, gdy status pasuje |
| `removeaddroles <index> <@role...>` | `remar` | Zarządzaj serwerem | Usunąć role z listy „role do dodania” |
| `removeremoveroles <index> <@role...>` | `rmremoveroles` | Zarządzaj serwerem | Usunąć role z listy „role do usunięcia” |
| `setstatusrolechannel <index> <#channel>` | `statusrolechannel`, `ssrc` | Zarządzaj serwerem | Ustawić kanał powiadomień |
| `setstatusroleembed <index> [text]` | `statusroleembed`, `asre` | Zarządzaj serwerem | Ustawić wiadomość powiadomienia lub, bez tekstu, wyświetlić podgląd obecnej |
| `toggleremoveadded <index>` | `togglerma` | Zarządzaj serwerem | Przełączyć **Usuń dodane role** |
| `togglereaddremoved <index>` | `togglermrm` | Zarządzaj serwerem | Przełączyć **Dodaj ponownie usunięte role** |

`setaddroles` i `setremoveroles` dopisują role do istniejącej listy zamiast ją zastępować. Aby ponownie usunąć role, użyj komend `remove...`. Edytor w panelu działa odwrotnie: to, co jest w polu w momencie zapisu, staje się pełną listą, ale puste pole jest ignorowane, więc całkowite wyczyszczenie listy trzeba zrobić komendami `remove...`.

## Wskazówki i pułapki

- Bot potrzebuje uprawnienia Zarządzaj rolami, a jego najwyższa rola musi znajdować się powyżej każdej roli, którą dodaje lub usuwa. Błędy są tylko zapisywane w logach, a członek nic nie widzi.
- Bot musi mieć intent obecności, aby w ogóle widzieć niestandardowe statusy. Jeśli nic się nie dzieje po zmianie statusu, to pierwsza rzecz do sprawdzenia.
- Dopasowanie rozróżnia wielkość liter i szuka tekstu w dowolnym miejscu statusu. Trzymaj obserwowany tekst krótki i charakterystyczny.
- Bot patrzy tylko na pierwszą aktywność w obecności członka. Discord zwykle wymienia niestandardowy status na początku, ale jeśli przed nim zgłoszona jest inna aktywność, status nie zostanie zauważony.
- Role są zmieniane tylko przy zmianie statusu. Członek, który ma już ten tekst w statusie w chwili tworzenia wpisu, nie jest przetwarzany, dopóki jego status się nie zmieni.
- Powiadomienie jest wysyłane za każdym razem, gdy status zaczyna pasować, więc członek, który wielokrotnie przełącza swój status, wywoła wielokrotne wiadomości.
- Panel przyjmuje ID ról, a nie nazwy. Włącz Tryb dewelopera w Discordzie i kliknij prawym przyciskiem rolę, aby skopiować jej ID.

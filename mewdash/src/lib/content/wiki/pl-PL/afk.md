---
title: System AFK
slug: afk
summary: Pozwól członkom oznaczyć się jako nieobecni, wyjaśnij każdemu, kto ich oznaczy, dlaczego ich nie ma, i automatycznie czyść status, gdy wrócą.
icon: fa-moon
category: Actions
dashboard: /dashboard/afk
module: Afk
tags: [afk, away, idle, status, brb, mention reply, timed afk, placeholders, nieobecność, bezczynność, status, odpowiedź na wzmiankę, czasowe afk, symbole zastępcze]
related: [utility, administration]
---

## Co robi

Członek uruchamia `afk` z opcjonalną wiadomością. Od tej chwili, ilekroć ktoś go oznaczy, bot odpowiada na tym kanale wiadomością i tym, jak długo członek jest nieobecny. Gdy członek wraca, status jest czyszczony, publikowane jest krótkie powiadomienie „witaj z powrotem”, które usuwa się po pięciu sekundach, a pseudonim zostaje przywrócony.

Gdy członek jest nieobecny, bot próbuje też zmienić mu pseudonim na `[AFK] name`, przycięty tak, by zmieścić się w limicie pseudonimów Discorda, dzięki czemu status jest widoczny na liście członków.

Uruchomienie `afk` bez wiadomości działa jak przełącznik: jeśli nie jesteś nieobecny, włącza AFK z pustą wiadomością, a jeśli jesteś, wyłącza je.

## Po co z tego korzystać

- Członkowie na ruchliwych serwerach nie są wielokrotnie oznaczani przez osoby, które nie widziały, że napisali „brb”.
- Staff widzi od razu, kto jest w pobliżu, a kto nie.
- AFK czasowe obsługuje „wracam za dwie godziny” bez konieczności pamiętania, żeby to wyczyścić.

## Jak kończy się status

**Typ AFK** decyduje, co bot uznaje za powrót. To najważniejsze ustawienie na tej stronie.

| Typ | Status zostaje wyczyszczony, gdy |
| --- | --- |
| Samodzielne wyłączenie | Tylko gdy członek ponownie uruchomi `afk` albo gdy staff go usunie. Nic nie dzieje się automatycznie. |
| Po wiadomości | Członek wyśle wiadomość gdziekolwiek na serwerze. |
| Po pisaniu | Członek zacznie pisać na dowolnym kanale. |
| Dowolne | Wiadomość albo pisanie, w zależności od tego, co nastąpi pierwsze. |

**Limit czasu AFK** to okres ochronny liczony od chwili ustawienia statusu. W tym oknie pisanie lub wysyłanie wiadomości nie czyści statusu, co zapobiega temu, by sama wiadomość „afk, brb” od razu zakończyła AFK. Domyślnie wynosi 0, czyli brak okresu ochronnego; ustawisz go komendą `afktimeout` albo na zakładce **Ustawienia zaawansowane** w panelu.

AFK czasowe działa inaczej: trwa, aż upłynie jego licznik, niezależnie od typu. Rozmowa w tym czasie go nie kończy. Gdy licznik się skończy, status jest czyszczony, a pseudonim przywracany bez powiadomienia na kanale.

Edycja wiadomości w ciągu pięciu minut od jej wysłania liczy się tak samo jak wysłanie nowej.

## Odpowiedź na wzmiankę

Gdy ktoś oznaczy nieobecnego członka, bot sprawdza do pięciu oznaczonych użytkowników w wiadomości, ignoruje boty i wzmianki o sobie, ignoruje wiadomości zaczynające się od prefiksu komend i pomija kanały z listy wyłączonych. Dla każdego nieobecnego członka, którego znajdzie, publikuje odpowiedź.

Domyślnie odpowiedzią jest embed: linia autora brzmi „user is currently away” z jego awatarem, opis to jego wiadomość AFK, a stopka pokazuje, jak długo jest nieobecny. Jeśli bot jest skonfigurowany, by pokazywać przycisk zaproszenia, jest on dołączany.

Możesz to zastąpić własną wiadomością lub embedem, używając `customafkmessage` albo edytora **Własna wiadomość embed AFK** w panelu. Tekst przechodzi przez parser embedów, więc działa wszystko, co wygeneruje kreator embedów. Ustaw `-`, aby wrócić do domyślnej odpowiedzi.

### Symbole zastępcze

Są zamieniane wewnątrz własnej wiadomości AFK. Ogólne symbole ze strony symboli zastępczych nie są tu dostępne; działa tylko ten zestaw.

| Symbol zastępczy | Wartość |
| --- | --- |
| `%afk.message%` | Wiadomość AFK, z neutralizowanymi wzmiankami i przycięta do maksymalnej długości |
| `%afk.user%` | Nazwa użytkownika nieobecnego członka |
| `%afk.user.mention%` | Wzmianka o nieobecnym członku |
| `%afk.user.avatar%` | Adres URL awatara nieobecnego członka |
| `%afk.user.id%` | ID użytkownika nieobecnego członka |
| `%afk.triggeruser%` | Nazwa użytkownika osoby, która go oznaczyła |
| `%afk.triggeruser.mention%` | Wzmianka o osobie, która go oznaczyła |
| `%afk.triggeruser.avatar%` | Adres URL awatara osoby, która go oznaczyła |
| `%afk.triggeruser.id%` | ID użytkownika osoby, która go oznaczyła |
| `%afk.time%` | Jak długo jest nieobecny, słownie, na przykład „2 hours” |

> [!EXAMPLE]
> Odpowiedź zwykłym tekstem: `%afk.user.mention% is away (%afk.time%): %afk.message%`

## Ustawienia

Wszystkie te ustawienia są na stronie AFK, w zakładkach **Ustawienia podstawowe** i **Ustawienia zaawansowane**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Czas automatycznego usunięcia | 0 (nigdy) | Liczba sekund, po których odpowiedź bota na wzmiankę usuwa się sama |
| Maks. długość wiadomości | 128 | Najdłuższa wiadomość AFK, jaką członek może ustawić, od 1 do 4096; dłuższe są odrzucane |
| Typ usuwania AFK | Samodzielne wyłączenie | Jeden z czterech powyższych typów |
| Limit czasu AFK | 0 (brak) | Okres ochronny po ustawieniu AFK, do dwóch godzin |
| Wyłączone kanały | brak | Kanały, na których oznaczenie nieobecnego członka nie wywołuje odpowiedzi |
| Własna wiadomość embed AFK | domyślny embed | Twoja odpowiedź z powyższymi symbolami zastępczymi |

> [!TIP]
> Ustaw automatyczne usuwanie na około trzydzieści sekund. Osoba, która oznaczyła, widzi odpowiedź, a kanał nie zapełnia się nieaktualnymi komunikatami AFK.

Zakładka **Zarządzanie użytkownikami** wyświetla wszystkich członków, którzy są obecnie nieobecni, i pozwala staffowi wyczyścić status jednej osobie lub kilku naraz.

## Krok po kroku

1. Otwórz **System AFK** w panelu.
2. Wybierz **Typ usuwania AFK**. „Po wiadomości” to najbezpieczniejsza domyślna wartość; „Dowolne” jest najwygodniejsze.
3. Ustaw **Czas automatycznego usunięcia** na 30. Zostaw **Maks. długość wiadomości** na 128, chyba że chcesz dłuższe statusy.
4. W **Ustawieniach zaawansowanych** dodaj kanały do poleceń botów i kanały ogłoszeń do **Wyłączone kanały**.
5. Opcjonalnie zbuduj własną odpowiedź w edytorze embedów, używając powyższych symboli zastępczych.
6. Przetestuj: uruchom `afk testing`, oznacz siebie z innego konta, a potem wyślij wiadomość i obserwuj, jak status się czyści.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `afk [message]` | | Nikt | Ustaw swoją wiadomość AFK albo włączaj i wyłączaj AFK bez wiadomości |
| `timedafk <time> <message>` | `tafk` | Nikt | AFK, które kończy się samo, na przykład `timedafk 2h dinner` |
| `getactiveafks` | `activeafks` | Nikt | Wyświetla wszystkich, którzy są obecnie AFK |
| `afkview [@user]` | `viewafk` | Zarządzaj wiadomościami | Pokazuje bieżącą wiadomość AFK kogoś |
| `afkremove @user...` | `afkrm` | Zarządzaj wiadomościami | Czyści status AFK jednego lub kilku członków |
| `afkdel [seconds]` | `afkdelete` | Zarządzaj serwerem | Pokazuje lub ustawia automatyczne usuwanie odpowiedzi |
| `afklength <number>` | `maxafklength` | Administrator | Ogranicza długość wiadomości AFK |
| `afktype <type>` | | Administrator | `selfdisable`, `onmessage`, `ontype` lub `either` |
| `afktimeout <time>` | | Administrator | Ustawia okres ochronny, na przykład `30s` |
| `afkdisable #channel...` | | Zarządzaj kanałami | Dodaje kanały do listy bez odpowiedzi |
| `afkundisable #channel...` | | Zarządzaj kanałami | Usuwa kanały z listy bez odpowiedzi |
| `afkdisabledlist` | | Zarządzaj kanałami | Pokazuje listę bez odpowiedzi |
| `customafkmessage <text>` | `afkmessage` | Administrator | Ustawia własną odpowiedź albo `-`, aby ją zresetować |

## Wskazówki i pułapki

- Nie ma komendy, która czyści wyłącznie twój własny status. Uruchom `afk` ponownie bez wiadomości albo poczekaj, aż zadziała reguła typu.
- Zmiany pseudonimów wymagają, by rola bota znajdowała się powyżej najwyższej roli członka i by bot miał uprawnienie Zarządzaj pseudonimami. Pseudonimu właściciela serwera bot nigdy nie może zmienić, więc właściciele zachowują swoje imię, ale status nadal działa.
- Pamięć podręczna systemu AFK ładuje się krótko po starcie bota. Do tego czasu komendy odpowiadają, że AFK nadal się uruchamia.
- Wzmianki w wiadomości AFK są neutralizowane w odpowiedzi, więc członkowie nie mogą używać swojego statusu, by oznaczać role ani @everyone.

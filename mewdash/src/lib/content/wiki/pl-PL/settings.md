---
title: Ustawienia
slug: settings
summary: Podstawy dla całego serwera: prefiks komend, język, strefa czasowa, kanały logów, rola wyciszenia, wygasanie ostrzeżeń oraz kilka narzędzi czatu.
icon: fa-cog
category: Settings
dashboard: /dashboard/settings
module: Administration
tags: [settings, prefix, language, locale, timezone, mute role, warn expire, command log, staff role, member role, snipe, link previews, delmsgoncmd, ustawienia, prefiks, język, lokalizacja, strefa czasowa, rola wyciszenia, wygasanie ostrzeżeń, dziennik komend, rola staffu, rola członka, podglądy linków]
related: [administration, logging, filter, suggestions]
---

## Co to robi

Strona Ustawienia zawiera kilka opcji, które wpływają jednocześnie na wszystkie moduły, a nie na jedną funkcję. Tutaj zmienisz prefiks, którego członkowie używają przed komendami, język, w jakim bot odpowiada, strefę czasową używaną dla przypomnień i zaplanowanych wiadomości, oraz kanały, na których zapisywane jest użycie komend i ostrzeżenia.

Obejmuje też nazwę roli wyciszenia, to, czy wyciszony członek traci pozostałe role, jak długo utrzymują się ostrzeżenia, oraz dwa narzędzia czatu: podglądanie usuniętych wiadomości (snipe) i podglądy linków do wiadomości.

Większość tych ustawień ma odpowiadającą im komendę tekstową, więc staff może je zmieniać także z Discorda. Kilka dodatkowych opcji istnieje tylko w komendach: rola staffu, rola członka i usuwanie wiadomości z komendą dla poszczególnych kanałów.

## Po co z tego korzystać

- Twój serwer już używa `.` dla innego bota, a ty chcesz mieć Mewdeko na `!` lub `m!`.
- Twoja społeczność mówi w innym języku niż angielski i chcesz, żeby odpowiedzi do niej pasowały.
- Przypomnienia i zaplanowane posty powinny trafiać o właściwej lokalnej godzinie, a nie w UTC.
- Moderatorzy chcą kanału, na którym zapisywane jest każde uruchomienie komendy i każde ostrzeżenie.
- Ostrzeżenia powinny wygasać po określonej liczbie dni, zamiast gromadzić się w nieskończoność.
- Członkowie powinni mieć możliwość użycia `snipe`, by odzyskać usuniętą wiadomość, albo na ruchliwym czacie podglądy linków powinny być wyłączone.

## Prefiks

Prefiks to tekst, który członek wpisuje przed komendą. Domyślnie jest to `.`. Każdy może uruchomić `prefix` bez argumentu, aby zobaczyć aktualny prefiks. Administratorzy zmieniają go poleceniem `prefix <new>` albo, z panelu, polem **Prefiks komend**. Komendy ukośnikowe nie zależą od prefiksu.

## Język

Każdy serwer może wybrać własny język odpowiedzi poleceniem `languageset <code>`, na przykład `languageset de`, albo listą rozwijaną **Język** na panelu. `languageset default` usuwa nadpisanie, dzięki czemu serwer korzysta z domyślnego języka bota. `languageslist` wypisuje wszystkie obsługiwane kody lokalizacji. `langsetdefault` bez argumentu pokazuje domyślny język bota; zmiana tego ustawienia jest zadaniem właściciela bota.

## Strefa czasowa

Strefa czasowa serwera steruje przypomnieniami, zaplanowanymi wiadomościami i wszystkimi wyświetlanymi godzinami. Samo `timezone` pokazuje bieżącą wartość (UTC, jeśli nic nie ustawiono). `timezone <id>` ustawia ją, używając identyfikatora IANA lub Windows, na przykład `Europe/London`, a `timezones` przegląda identyfikatory, które bot akceptuje. Na panelu pole **Strefa czasowa serwera** zapisuje się w chwili wyboru wartości; nie czeka na **Zapisz zmiany**.

## Kanały logów

**Kanał dziennika komend** zapisuje użycie komend. Ustaw go poleceniem `commandlogchannel #channel`; uruchomienie go bez kanału wyłącza logowanie.

**Kanał logów ostrzeżeń** zapisuje ostrzeżenia wystawione przez komendy moderacyjne. Ustawia się go z panelu.

## Ostrzeżenia

**Wygasanie ostrzeżeń** jest zapisywane w godzinach. Zero oznacza, że ostrzeżenia nigdy nie wygasają. Komenda `warnexpire` działa w dniach i przyjmuje drugie słowo: `warnexpire 30 clear` oznacza ostrzeżenia starsze niż 30 dni jako wyczyszczone, a `warnexpire 30 delete` je usuwa. Dozwolony zakres to od 0 do 366 dni, a `warnexpire 0` wyłącza wygasanie.

## Rola wyciszenia i usuwanie ról

**Rola wyciszenia** to nazwa roli, którą stosują komendy wyciszenia i kary. Jeśli rola o tej nazwie nie istnieje, bot ją tworzy. Z Discorda `muterole @role` ustawia tę opcję na istniejącą rolę; rola musi znajdować się poniżej twojej najwyższej roli, chyba że jesteś właścicielem serwera. Samo `muterole` bez argumentu pokazuje aktualną rolę wyciszenia.

**Usuń wszystkie inne role na czas wyciszenia** zabiera członkowi pozostałe role na czas wyciszenia i przywraca je po jego zakończeniu. Forma komendy to `removeonmute y` lub `removeonmute n`.

## Narzędzia czatu

| Ustawienie | Komenda | Efekt |
| --- | --- | --- |
| Snipe wiadomości | `snipeset enable` lub `snipeset disable` | Pozwala członkom używać komend snipe, by odzyskać niedawno usunięte lub edytowane wiadomości. Domyślnie wyłączone. |
| Podglądy linków do wiadomości | `previewlinks y` lub `previewlinks n` | Gdy ktoś wyśle link do wiadomości Discorda, bot pokazuje jej treść. |

## Ustawienia dostępne tylko w komendach

Należą one do tego samego modułu Administracja, ale nie mają odpowiednika na panelu.

**Rola staffu** (`staffrole @role`) oznacza rolę, której członkowie są zwolnieni z filtrów słów, linków i zaproszeń oraz z kontroli spamu w sugestiach. Uruchom `staffrole` bez roli, aby zobaczyć aktualną, a `staffroledisable`, aby ją wyczyścić.

**Rola członka** (`memberrole @role`) zapisuje rolę dla serwera. Jest zapisywana, ale obecnie nie używa jej żadna funkcja.

**Usuń wiadomość przy komendzie** (`delmsgoncmd`) usuwa wiadomość, która uruchomiła komendę, gdy komenda zostanie wykonana:

| Forma | Efekt |
| --- | --- |
| `delmsgoncmd` | Przełącza usuwanie dla całego serwera |
| `delmsgoncmd list` | Pokazuje ustawienie serwera i wyjątki dla każdego kanału |
| `delmsgoncmd channel enable [#channel]` | Zawsze usuwa na tym kanale (bieżącym, jeśli pominięto) |
| `delmsgoncmd channel disable [#channel]` | Nigdy nie usuwa na tym kanale |
| `delmsgoncmd channel inherit [#channel]` | Stosuje ustawienie serwera |

## Ustawienia

Wszystko poniżej znajduje się na jednej stronie **Ustawienia bota**. Po edycji naciśnij **Zapisz zmiany**; tylko **Strefa czasowa serwera** zapisuje się sama.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Prefiks komend | `.` | Tekst wpisywany przed komendami |
| Kanał dziennika komend | brak | Kanał, na którym zapisywane jest użycie komend |
| Emoji waluty | brak | Emoji wyświetlane dla waluty serwera |
| Kanał logów ostrzeżeń | brak | Kanał, na którym zapisywane są ostrzeżenia |
| Wygasanie ostrzeżeń | 0 (nigdy) | Liczba godzin do wygaśnięcia ostrzeżeń |
| Język | Domyślny bota | Język odpowiedzi na tym serwerze |
| Strefa czasowa serwera | UTC | Strefa czasowa dla zaplanowanych wiadomości, przypomnień i wyświetlanych godzin |
| Rola wyciszenia | Muted | Nazwa roli nadawanej przez wyciszenia i kary |
| Usuń wszystkie inne role na czas wyciszenia | Wyłączone | Zabiera pozostałe role na czas wyciszenia |
| Snipe wiadomości | Wyłączone | Zezwala na komendy snipe |
| Podglądy linków do wiadomości | Wyłączone | Rozwija linki do wiadomości Discorda |

> [!NOTE]
> Strona obejmuje tylko wspólne podstawy. Logowanie, moderacja, starboard i inne funkcje mają własne strony z własnymi ustawieniami.

## Przewodnik konfiguracji

1. Otwórz **Ustawienia** na panelu.
2. Ustaw **Prefiks komend**, jeśli `.` koliduje z innym botem.
3. Wybierz **Język** i **Strefę czasową serwera**.
4. Wybierz **Kanał dziennika komend** i **Kanał logów ostrzeżeń**, które mogą czytać tylko członkowie staffu.
5. Ustaw **Wygasanie ostrzeżeń** w godzinach, na przykład `720` dla trzydziestu dni, albo zostaw 0.
6. Sprawdź, czy nazwa **Roli wyciszenia** pasuje do roli, której używają twoi moderatorzy, albo zostaw `Muted` i pozwól botowi ją utworzyć.
7. Włącz **Snipe wiadomości** lub **Podglądy linków do wiadomości**, jeśli chcesz.
8. Naciśnij **Zapisz zmiany**.
9. Na Discordzie uruchom `staffrole @TwojaRolaStaffu`, aby filtry i limity sugestii pomijały twój zespół.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `prefix [new prefix]` | | Nikogo do wyświetlenia, Administrator do zmiany | Pokazuje lub ustawia prefiks komend |
| `languageset <code>` | `langset` | Administrator | Ustawia język odpowiedzi serwera lub `default`, by go wyczyścić |
| `langsetdefault` | `langsetd` | Nikogo do wyświetlenia, właściciel bota do zmiany | Pokazuje lub ustawia domyślny język bota |
| `languageslist` | `langli` | Nikogo | Wypisuje obsługiwane kody lokalizacji |
| `timezone [id]` | | Nikogo do wyświetlenia, Administrator do zmiany | Pokazuje lub ustawia strefę czasową serwera |
| `timezones` | | Nikogo | Przegląda akceptowane identyfikatory stref czasowych |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrator | Ustawia kanał dziennika komend lub wyłącza go bez kanału |
| `warnexpire <days> <clear or delete>` | `warne` | Administrator | Wygaszanie ostrzeżeń po liczbie dni |
| `muterole [@role]` | `setmuterole` | Zarządzanie rolami | Pokazuje lub ustawia rolę wyciszenia |
| `removeonmute <y or n>` | | Administrator | Zabiera pozostałe role na czas wyciszenia |
| `snipeset <enable or disable>` | `setsnipe` | Administrator | Zezwala lub blokuje komendy snipe |
| `previewlinks <y or n>` | `plinks` | Administrator | Rozwija linki do wiadomości Discorda |
| `staffrole [@role]` | | Administrator | Pokazuje lub ustawia rolę staffu |
| `staffroledisable` | | Administrator | Czyści rolę staffu |
| `memberrole [@role]` | | Administrator | Pokazuje lub ustawia rolę członka |
| `delmsgoncmd [list or channel <state> [#channel]]` | `dmc` | Administrator | Usuwa wiadomości z komendami dla całego serwera lub dla kanału |

## Wskazówki i pułapki

- `delmsgoncmd` wymaga, by bot miał uprawnienie Zarządzanie wiadomościami, w przeciwnym razie komenda odmawia działania.
- Panel zapisuje wygasanie ostrzeżeń w godzinach, a `warnexpire` przyjmuje dni. `warnexpire 1` i wartość `24` na panelu to to samo.
- `muterole` porównuje podaną rolę z twoją najwyższą rolą. Jeśli pojawi się błąd braku uprawnień, poproś właściciela o pomoc albo wybierz niższą rolę.
- Komendy ukośnikowe całkowicie ignorują prefiks, więc zmiana prefiksu wpływa tylko na komendy tekstowe.
- Zwolnienie z filtrów dla roli staffu obejmuje tylko filtry i kontrolę spamu w sugestiach. Nie nadaje uprawnień do komend; do tego służy moduł Uprawnienia.

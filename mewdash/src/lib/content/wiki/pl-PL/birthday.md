---
title: Urodziny
slug: birthday
summary: Członkowie ustawiają urodziny w swoim profilu i wyrażają zgodę, a bot ogłasza je na kanale, opcjonalnie z tymczasową rolą urodzinową i wzmianką o roli.
icon: fa-birthday-cake
category: Community
dashboard: /dashboard/birthday
module: Birthday
tags: [birthday, birthdays, bday, celebrate, birthday role, announcement, timezone, age, profile, urodziny, urodzin, bday, świętowanie, rola urodzinowa, ogłoszenie, strefa czasowa, wiek, profil]
related: [utility, administration]
---

## Co to robi

Członek ustawia swoje urodziny raz komendą `setbirthday`, a następnie uruchamia `birthdayannouncements` na dowolnym serwerze, na którym funkcja jest włączona. Każdego dnia bot sprawdza, kto ma urodziny, publikuje wiadomość na kanale ogłoszeń i może nadać rolę urodzinową na 24 godziny. Jeśli ustawiona jest rola do pingowania, zostanie ona wspomniana przed wiadomością.

Urodziny są zapisywane w profilu bota członka, a nie osobno dla każdego serwera, więc jedno `setbirthday` obejmuje każdy serwer, który członek dzieli z botem. To, czy urodziny są ogłaszane na danym serwerze, zależy od trzech rzeczy: członek wyraził zgodę, jego profil nie jest prywatny i jego tryb wyświetlania urodzin nie jest wyłączony.

Każdy może zobaczyć, kto świętuje, komendą `birthdaytoday`, oraz kto ma nadchodzące urodziny, komendą `birthdaylist`. Wiek jest pokazywany obok nazwy, chyba że członek wybrał tryb wyświetlania, który ukrywa rok.

Staff konfiguruje kanał, role i wiadomość na stronie **Urodziny** na panelu albo komendami `birthday*`.

## Po co z tego korzystać

- Społeczności, które chcą codziennego posta „wszystkiego najlepszego” bez ręcznego śledzenia dat.
- Dawanie członkom kolorowej roli urodzinowej na cały dzień, żeby wyróżniali się na czacie.
- Wzmianka o roli „ekipy urodzinowej”, aby ludzie faktycznie zobaczyli ogłoszenie.
- Pozwolenie członkom na wybór, ile ich urodzin jest publiczne, aż po całkowite ukrycie.

## Kto jest ogłaszany

Członek jest uwzględniany w ogłoszeniach i listach tylko wtedy, gdy spełnione są wszystkie poniższe warunki:

| Wymóg | Jak członek nim steruje |
| --- | --- |
| Urodziny są ustawione | `setbirthday <date>` |
| Wyrażono zgodę na ogłoszenia | `birthdayannouncements` przełącza zgodę; domyślnie wyłączona |
| Profil nie jest prywatny | `setprivacy public` na profilu |
| Tryb wyświetlania nie jest Disabled | `setbirthdayprivacy <mode>` |

Sprawdzenie dotyczy członków obecnie znajdujących się na serwerze, więc ktoś, kto wyszedł, nie zostanie ogłoszony.

### Tryby wyświetlania urodzin

`setbirthdayprivacy` przyjmuje jedną z tych wartości. Wpływa to na to, co jest pokazywane na listach, w profilu i w `birthdaytoday`.

| Tryb | Efekt |
| --- | --- |
| `Default` | Pełna data widoczna, wiek wyświetlany na listach |
| `MonthOnly` | Tylko miesiąc, wiek ukryty |
| `YearOnly` | Tylko rok, wiek nadal wyświetlany |
| `MonthAndDate` | Miesiąc i dzień, wiek ukryty |
| `Disabled` | Urodziny ukryte i nigdy nieogłaszane |

## Jak działa codzienne sprawdzanie

Usługa uruchamia się raz na godzinę i porównuje miesiąc i dzień urodzin każdego członka z dzisiejszą datą w UTC. Pierwsza godzina nowego dnia UTC, w której znajdą się urodziny, publikuje je, a serwer zostaje oznaczony jako obsłużony na ten dzień, więc nic nie zostanie opublikowane dwa razy.

Ogłoszenia pojawiają się tylko wtedy, gdy funkcja **Ogłoszenia** jest włączona i ustawiony jest kanał. Ustawienie kanału przez `birthdaychannel` lub na panelu włącza funkcję.

Strefy czasowe są zapisywane, ale codzienne sprawdzanie ich jeszcze nie używa. `birthdaytimezone` i ustawienie **Strefa czasowa serwera** są akceptowane i pokazywane w embedzie konfiguracji, ale ogłoszenia wychodzą według dnia UTC.

## Rola urodzinowa

Gdy włączona jest opcja **Rola urodzinowa** i ustawiona jest rola, każdy ogłoszony członek otrzymuje ją w chwili ogłoszenia, a rola zostaje odebrana 24 godziny później. Licznik usunięcia znajduje się w pamięci, więc jeśli bot zostanie zrestartowany w ciągu dnia, rola pozostanie, dopóki ktoś jej nie usunie.

Bot potrzebuje uprawnienia Zarządzanie rolami, a jego najwyższa rola musi znajdować się powyżej roli urodzinowej.

## Wiadomość z ogłoszeniem

Domyślna wiadomość to `Happy Birthday %user.mention%!` z emotikonami imprezy wokół niej. Zastąp ją komendą `birthdaymessage` albo edytorem **Wiadomość urodzinowa** na panelu. Tekst przechodzi przez parser embedów, więc działa wszystko, co wygeneruje kreator embedów, a wzmianka o roli do pingowania jest dodawana na początku, jeśli jest włączona.

### Symbole zastępcze

Wiadomość obsługuje standardowe symbole użytkownika, serwera, kanału i bota ze strony placeholderów, plus jedną wartość specyficzną dla urodzin.

| Symbol | Wartość |
| --- | --- |
| `%user.mention%` | Wspomina członka obchodzącego urodziny |
| `%user.name%` | Jego nazwa użytkownika |
| `%user.avatar%` | URL jego awatara |
| `%server.name%` | Nazwa serwera |
| `%birthday.age%` | Wiek, który właśnie kończy, lub `Unknown` |

> [!WARNING]
> Używaj `%user.mention%`, a nie `{user}`. Pomoc komendy tekstowej wspomina `{user}`, ale w opublikowanym ogłoszeniu zamieniana jest tylko forma `%...%`.

## Ustawienia

Wszystko znajduje się na stronie **Urodziny**, w trzech zakładkach: **Konfiguracja**, **Użytkownicy** i **Statystyki**.

**Konfiguracja** zawiera podstawowe ustawienia, edytor wiadomości oraz panel **Funkcje urodzin** z jednym przełącznikiem na funkcję.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Kanał | brak | Miejsce, gdzie publikowane są ogłoszenia |
| Rola urodzinowa | brak | Rola nadawana na 24 godziny w dniu urodzin |
| Rola do pingowania | brak | Rola wspominana przed każdym ogłoszeniem |
| Strefa czasowa serwera | UTC | Zapisana dla serwera, pokazywana w embedzie konfiguracji |
| Dni przypomnienia przed urodzinami | 0 | Od 0 do 30; zapisane, przypomnienie jeszcze nie jest wysyłane |
| Wiadomość urodzinowa | domyślny embed | Ogłoszenie z symbolami zastępczymi wymienionymi powyżej |

| Przełącznik funkcji | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Ogłoszenia | wyłączone | Publikuje codzienną wiadomość na kanale |
| Rola urodzinowa | wyłączone | Przydziela tymczasową rolę |
| Przypomnienia | wyłączone | Przełącznik zastępczy; nic jeszcze nie jest wysyłane |
| Rola do pingowania | wyłączone | Wspomina rolę do pingowania przy ogłoszeniach |
| Obsługa stref czasowych | wyłączone | Przełącznik zastępczy; sprawdzanie nadal działa w UTC |

**Użytkownicy** pokazuje **Nadchodzące urodziny** na najbliższe 7, 14 lub 30 dni oraz listę **Wszyscy użytkownicy** z każdym członkiem, który ma ustawione urodziny, a dzisiejsze urodziny są wyróżnione na górze strony. **Statystyki** pokazują **Łączna liczba użytkowników**, **Ustawione urodziny**, **Publiczne urodziny** i **Dzisiejsze urodziny**.

> [!NOTE]
> Zapisanie formularza na panelu zapisuje tylko wartości, które wypełniłeś. Aby wyczyścić rolę lub kanał, użyj `birthdayrole` lub `birthdaypingrole` bez roli albo zresetuj wszystko poleceniem `/birthday config reset`.

## Przewodnik konfiguracji

1. Otwórz **Urodziny** na panelu.
2. W **Konfiguracji** wybierz **Kanał** dla ogłoszeń i kliknij **Zapisz konfigurację**.
3. Włącz **Ogłoszenia** w panelu **Funkcje urodzin**.
4. Opcjonalnie wybierz **Rola urodzinowa** i włącz **Rola urodzinowa** oraz **Rola do pingowania** z włączonym **Rola do pingowania**.
5. Opcjonalnie napisz własną **Wiadomość urodzinową**, używając `%user.mention%` i `%birthday.age%`.
6. Powiedz członkom, żeby uruchomili `setbirthday`, a potem `birthdayannouncements`, aby wyrazić zgodę.
7. Sprawdź kartę **Użytkownicy**, aby upewnić się, że pojawiają się w **Nadchodzących urodzinach**.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś). Wersje ukośnikowe znajdują się pod `/birthday` i `/birthday config`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `setbirthday <date>` | | Nikogo | Ustawia twoje urodziny w profilu, na przykład `setbirthday 1998-04-12` |
| `setbirthdayprivacy <mode>` | | Nikogo | Wybiera jeden z trybów wyświetlania powyżej |
| `birthdayannouncements` | `bdayann` | Nikogo | Wyrażasz zgodę na ogłaszanie lub ją cofasz |
| `birthdaytimezone <zone>` | `bdaytz` | Nikogo | Zapisuje twoją strefę czasową, na przykład `Europe/London` |
| `birthdaytoday` | `todaysbirthdays` | Nikogo | Wypisuje, kto dziś świętuje |
| `birthdaylist [days]` | `bdaylist`, `upcomingbirthdays` | Nikogo | Nadchodzące urodziny, od 1 do 30 dni, domyślnie 7 |
| `birthdaychannel [#channel]` | `bdaychannel`, `bdaychan` | Administrator | Ustawia kanał ogłoszeń i włącza ogłoszenia |
| `birthdayrole [@role]` | `bdayrole` | Administrator | Ustawia rolę urodzinową na 24 godziny albo ją czyści bez roli |
| `birthdaypingrole [@role]` | `bdayping` | Administrator | Ustawia rolę do wspominania albo ją czyści bez roli |
| `birthdaymessage [text]` | `bdaymsg` | Administrator | Ustawia tekst ogłoszenia albo pokazuje aktualny |
| `birthdayconfig` | `bdaycfg` | Administrator | Pokazuje aktualną konfigurację |

`/birthday config reset` czyści wszystkie ustawienia i wyłącza wszystkie funkcje. Nie ma odpowiednika w komendach tekstowych.

## Wskazówki i pułapki

- Członkowie nie są ogłaszani, dopóki nie uruchomią `birthdayannouncements`. Poinformuj ich o tym, bo inaczej nikt się nie pojawi.
- `setbirthday` akceptuje wszystko, co bot potrafi odczytać jako datę. Używaj jednoznacznego formatu, na przykład `1998-04-12`.
- `birthdaytimezone` przyjmuje tylko krótką, stałą listę szesnastu stref, takich jak `UTC`, `GMT`, `America/New_York`, `Europe/London`, `Asia/Tokyo`, `Asia/Kolkata`, `Australia/Sydney` i `Pacific/Auckland`. Lista rozwijana **Strefa czasowa serwera** na panelu ma podobną listę, trzynastu pozycji.
- Codzienne sprawdzanie używa UTC. Członkowie daleko od UTC mogą zostać ogłoszeni kilka godzin za wcześnie albo za późno.
- Bot potrzebuje uprawnienia Zarządzanie rolami do roli urodzinowej oraz uprawnień Wysyłanie wiadomości i Osadzanie linków na kanale ogłoszeń.
- `birthdayconfig` pokazuje pole „Dni przypomnienia” i funkcję Przypomnienia. Są zapisane, ale na razie nic nie wysyłają.
- Nie ma komendy do usunięcia zapisanych urodzin. Członkowie mogą je ukryć, uruchamiając `setbirthdayprivacy Disabled`, albo zrezygnować z ogłoszeń przez `birthdayannouncements`.

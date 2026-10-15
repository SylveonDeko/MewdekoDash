---
title: Profil użytkownika
slug: userprofile
summary: Daj każdemu członkowi kartę profilu, którą bot może pokazać wszędzie, z bio, zaimkami, znakiem zodiaku, urodzinami, kolorem, obrazkiem i kodem znajomego Switch, oraz kontrolą prywatności tego, co widzą inni.
icon: fa-user
category: Community
module: UserProfile
tags: [profile, bio, pronouns, pronoundb, zodiac, birthday, privacy, profile colour, profile image, switch friend code, stats opt out, greet dm opt out, profil, zaimki, znak zodiaku, urodziny, prywatność, kolor profilu, obrazek profilu, kod znajomego switch, rezygnacja ze statystyk, rezygnacja z powitalnych dm]
related: [birthday, switch, afk, help]
---

## Co robi

Każdy członek ma profil, który podąża za nim na każdym serwerze, na którym jest bot. Komenda `profile` publikuje go jako embed: awatar członka jako miniatura, bio jako opis, a następnie pola z zaimkami, znakiem zodiaku, urodzinami, liczbą wspólnych serwerów z botem i kodem znajomego Nintendo Switch, jeśli go ustawił. Niestandardowy kolor i duży obrazek na dole dopełniają całość.

Członkowie uzupełniają profil kilkoma komendami `set...` albo na stronie **Moje ustawienia** w panelu. Nic nie jest związane z konkretnym serwerem: ustaw bio raz, a wyświetli się tak samo wszędzie.

Prywatnością steruje członek. Profil można ustawić jako prywatny, tak aby tylko jego właściciel mógł go otworzyć, urodziny można ograniczyć do samego miesiąca albo całkowicie ukryć, a członkowie mogą zrezygnować ze statystyk komend i powitalnych wiadomości prywatnych.

Zaimki działają nieco inaczej. Jeśli członek nie ustawił żadnych w bocie, bot sprawdza je w PronounDB. Członkowie mogą nadpisać je własnym tekstem, a każdy może zgłosić obraźliwe nadpisanie właścicielom bota.

## Po co z tego korzystać

- Członkowie chcą szybkiej karty „o mnie” bez osobnego kanału z przedstawieniami.
- Społeczność, która dzieli się kodami znajomych Switch, może trzymać je w jednym miejscu zamiast przypinać wiadomości.
- Zaimki mogą być pokazywane automatycznie z PronounDB, więc większość osób nigdy nie musi ich wpisywać.
- Moderatorzy mogą sprawdzić czyjeś zaimki komendą `pronouns @user`, zanim odpowiedzą.
- Członkowie, którzy nie chcą powitalnych wiadomości prywatnych ani zbierania statystyk, mogą to sami wyłączyć.

## Embed profilu

`profile` bez argumentu pokazuje twój własny profil. `profile @user` pokazuje cudzy, chyba że jego właściciel ustawił go jako prywatny; wtedy bot odpowiada, że profil jest prywatny.

| Część embedu | Skąd pochodzi |
| --- | --- |
| Tytuł | „Profile for” i użytkownik |
| Kolor | `setprofilecolor`, w przeciwnym razie domyślny kolor bota |
| Miniatura | Awatar Discorda członka |
| Opis | Bio z `setbio` (pokazywane tylko, jeśli ustawione) |
| Zaimki | Twoje nadpisanie, w przeciwnym razie PronounDB, w przeciwnym razie "Unspecified" |
| Znak zodiaku | `setzodiac`, w przeciwnym razie "Unspecified" |
| Urodziny | `setbirthday`, pokazywane zgodnie z trybem prywatności urodzin, w przeciwnym razie "Unspecified" |
| Wspólne serwery z botem | Ile serwerów wspólnie masz z botem |
| Kod znajomego Switch | Pokazywany tylko, jeśli ustawiony |
| Obrazek | URL z `setprofileimage` |

## Pola profilu

### Bio

`setbio <text>` przyjmuje do 2048 znaków. Dłuższy tekst zostanie odrzucony. Nie ma komendy czyszczącej; jeśli chcesz się go pozbyć, ustaw krótkie bio, na przykład pojedynczą kropkę.

### Znak zodiaku

`setzodiac <sign>` przyjmuje jeden z dwunastu zachodnich znaków: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces. Wielkość liter nie ma znaczenia. Cokolwiek innego zostanie odrzucone.

### Kolor i obrazek

`setprofilecolor <colour>` przyjmuje kolor w dowolnej postaci, którą rozumie parser kolorów bota, na przykład wartość hex. `setprofileimage <url>` wymaga bezpośredniego linku do pliku graficznego; bot sprawdza, czy URL wygląda jak obrazek, zanim go zapisze, i pokazuje go tobie z powrotem.

### Urodziny

`setbirthday <date>` zapisuje datę. Ogłoszenia modułu Birthday używają tej samej wartości, więc ustawienie jej tutaj ustawia ją również tam. To, jak wyświetla się na profilu, zależy od `setbirthdayprivacy <mode>`:

| Tryb | Co pokazuje profil |
| --- | --- |
| `Default` | Pełną datę |
| `MonthOnly` | Tylko nazwę miesiąca |
| `YearOnly` | Tylko rok |
| `MonthAndDate` | Miesiąc i dzień, bez roku |
| `Disabled` | "Private" |

### Kod znajomego Switch

`setswitchfc <code>` musi pasować do wzorca `SW-XXXX-XXXX-XXXX` (cztery cyfry w każdej grupie; `SW` nie rozróżnia wielkości liter). Uruchom komendę bez kodu, aby usunąć go z profilu. Moduł Nintendo Switch nie ma z tym polem nic wspólnego; kod służy wyłącznie do wyświetlania.

### Prywatność

`setprivacy public` albo `setprivacy private`. Prywatne profile są widoczne tylko dla ich właściciela. Domyślnie profil jest publiczny.

## Zaimki

`pronouns [@user]` pokazuje zaimki dla ciebie lub kogoś innego. Kolejność wyszukiwania:

1. Tekst, który członek ustawił komendą `setpronouns`.
2. Angielski zestaw zaimków członka w PronounDB, jeśli połączył tam swoje konto Discorda. Standardowe zestawy są pokazywane w zwykłej formie, na przykład `he/him`, `Any pronouns` albo `Ask me my pronouns`.
3. "Unspecified".

`setpronouns <text>` zapisuje nadpisanie. Uruchomiona bez tekstu pokazuje twoje obecne nadpisanie z dwoma przyciskami: **Overwrite** otwiera formularz do wpisania nowych zaimków, a **Wyczyść** usuwa nadpisanie, dzięki czemu znowu używany jest PronounDB.

Gdy pokazywane zaimki pochodzą z własnego nadpisania członka (a nie z PronounDB), odpowiedź zawiera przycisk **Report**. Zgłoszenia trafiają na kanał prowadzony przez właścicieli bota, którzy mogą wyczyścić nadpisanie, wyłączyć zaimki dla tego użytkownika albo go zablokować. Użytkownik, którego zaimki zostały wyłączone, widzi powód za każdym razem, gdy próbuje użyć komend zaimków.

> [!NOTE]
> Komenda właściciela bota `pronounsforceclear` służy do realizacji tych zgłoszeń. Moderatorzy serwera nie mogą wyczyścić zaimków innego członka.

## Rezygnacje

- `greetdmoptout` przełącza, czy serwery korzystające z powitalnych wiadomości prywatnych bota mogą wysyłać ci DM-y. Dotyczy tylko powitań wysyłanych przez tego bota.
- `userstatsoptout` przełącza zbieranie statystyk komend dla twojego konta. Nigdy nie zbiera treści wiadomości.
- `deleteuserstatsdata` usuwa już zapisane statystyki komend dla ciebie po potwierdzeniu. Można ją uruchomić raz na godzinę.

## Ustawienia

Nie ma konfiguracji po stronie serwera. Wszystko znajduje się u członka. Strona **Moje ustawienia** w panelu (`/me`) ma sekcję **Profil** z przyciskiem **Edytuj** oraz sekcję prywatności z przełącznikami.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Bio | puste | Opis na twoim profilu |
| Zaimki | puste (używany PronounDB) | Twoje nadpisanie zaimków |
| Zodiak | brak | Znak zodiaku pokazywany na profilu |
| Urodziny | brak | Data pokazywana na profilu i używana w ogłoszeniach urodzinowych |
| Strefa czasowa | UTC | Strefa czasowa, której moduł Birthday używa dla twojego ogłoszenia |
| Kod znajomego Switch | puste | Pole kodu znajomego na profilu |
| Kolor profilu | domyślny bota | Kolor embedu |
| Obrazek profilu | brak | Obrazek na dole embedu |
| Prywatność profilu | Public | Czy inni mogą otworzyć twój profil |
| Tryb wyświetlania urodzin | Default | Które części urodzin są pokazywane |
| Blokuj powitalne DM-y | wyłączone | To samo co `greetdmoptout` |
| Blokuj śledzenie wiadomości | wyłączone | To samo co `userstatsoptout` |
| Ogłoszenia urodzinowe | wyłączone | Czy moduł Birthday ogłasza twoje urodziny |

Ta sama strona ma też przełącznik, który wyłącza pobieranie zaimków dla twojego konta.

## Krok po kroku

1. Uruchom `setbio Hi, I run the art channel.`, aby dodać opis.
2. Uruchom `setpronouns she/her` albo pomiń to, jeśli twoje konto PronounDB jest już połączone z Discordem.
3. Uruchom `setbirthday 1998-04-12`, a potem `setbirthdayprivacy MonthAndDate`, jeśli nie chcesz pokazywać roku.
4. Uruchom `setprofilecolor #ff66aa` i `setprofileimage https://example.com/banner.png`, aby ostylować embed.
5. Dodaj `setswitchfc SW-1234-5678-9012`, jeśli chcesz, żeby ludzie mogli cię znaleźć na Switchu.
6. Uruchom `profile`, aby sprawdzić wynik. Jeśli wolisz, żeby nikt inny go nie widział, uruchom `setprivacy private`.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, jeśli go nie zmieniałeś). Wersje slash istnieją dla większości z nich pod nazwami takimi jak `/profile`, `/setbio`, `/setcolor`, `/setbirthday`, `/setbirthdayprivacy`, `/setswitchfriendcode`, `/setprofileimage`, `/setprivacy`, `/setzodiac`, `/pronouns`, `/setpronouns`, `/statsoptout` i `/deletestatsdata`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `profile [@user]` | `userprofile` | Nikt | Pokaż swój profil albo cudzy |
| `setbio <text>` | | Nikt | Ustaw bio, do 2048 znaków |
| `setpronouns [text]` | `pronounsset` | Nikt | Ustaw nadpisanie zaimków albo zobacz je z przyciskami clear i overwrite |
| `pronouns [@user]` | `getpronouns` | Nikt | Pokaż zaimki, z przyciskiem zgłoszenia przy nadpisaniach |
| `setzodiac <sign>` | | Nikt | Ustaw swój znak zodiaku |
| `setprofilecolor <colour>` | | Nikt | Ustaw kolor embedu |
| `setprofileimage <url>` | | Nikt | Ustaw obrazek pokazywany na profilu |
| `setbirthday <date>` | | Nikt | Ustaw swoje urodziny |
| `setbirthdayprivacy <mode>` | | Nikt | `Default`, `MonthOnly`, `YearOnly`, `MonthAndDate` albo `Disabled` |
| `setprivacy <Public|Private>` | `profilepricvacy` | Nikt | Ustaw profil jako publiczny lub prywatny |
| `setswitchfc [code]` | `setfc`, `setswitchfriendcode`, `setfriendcode` | Nikt | Ustaw lub wyczyść swój kod znajomego Switch |
| `greetdmoptout` | `gdmoptout` | Nikt | Przełącz otrzymywanie powitalnych DM-ów od tego bota |
| `userstatsoptout` | `ustatsoptout` | Nikt | Przełącz zbieranie statystyk komend |
| `deleteuserstatsdata` | `deluserstatsdata` | Nikt | Usuń swoje zapisane statystyki komend (raz na godzinę) |
| `pronounsforceclear <@user or id> <true|false> <reason>` | `pnfc` | Właściciel bota | Wyczyść zaimki członka i opcjonalnie je wyłącz |

## Wskazówki i pułapki

- Profil jest globalny. Zmiana na jednym serwerze zmienia go wszędzie.
- `setbirthday` odczytuje datę parserem dat bota, więc najbezpieczniejszy jest jednoznaczny format, taki jak `1998-04-12`.
- Jeśli URL obrazka profilu przestanie działać, embed nadal się wyśle, ale Discord nie pokaże obrazka. Ustaw nowy URL, aby to naprawić.
- Zapytania do PronounDB wymagają, aby członek połączył swoje konto Discorda na pronoundb.org. Bez tego profil pokazuje "Unspecified", dopóki członek nie uruchomi `setpronouns`.
- Prywatne profile nadal reagują na `profile @user`, ale z błędem informującym, że profil jest prywatny, dzięki czemu ludzie wiedzą, że taki istnieje.
- `deleteuserstatsdata` usuwa tylko statystyki komend. Pola profilu czyści się przez nadpisanie ich nowymi wartościami.

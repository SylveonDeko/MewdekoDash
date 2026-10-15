---
title: Giveaway'e
slug: giveaways
summary: Prowadź czasowe giveawaye, do których członkowie dołączają reakcją, przyciskiem albo captchą w sieci, z wymogami ról i liczby wiadomości, losowaniem zwycięzców, ponownym losowaniem i wiadomościami dla zwycięzców.
icon: fa-gift
category: Entertainment
dashboard: /dashboard/giveaways
module: Giveaways
tags: [giveaway, gstart, prize, raffle, winner, reroll, contest, entry, captcha, giveaway, rozdanie, nagroda, losowanie, zwycięzca, ponowne losowanie, konkurs, udział, captcha]
related: [embedbuilder, chat-triggers, xp]
---

## Co robi

Moderatorzy rozpoczynają giveaway, podając nagrodę, kanał, liczbę zwycięzców i czas trwania. Bot publikuje na tym kanale embed z nagrodą, organizatorem, czasem zakończenia i wymaganiami. Członkowie dołączają, reagując emotką giveawaya serwera, naciskając przycisk **Enter** albo rozwiązując captchę w panelu, zależnie od tego, jak giveaway został rozpoczęty.

Gdy czas minie, bot losuje zwycięzców spośród wszystkich, którzy dołączyli i nadal spełniają wymagania. Edytuje oryginalną wiadomość, aby pokazać zwycięzców, publikuje na kanale wiadomość z gratulacjami, a jeśli jest to włączone, wysyła każdemu zwycięzcy wiadomość prywatną z linkiem do giveawaya. Moderatorzy mogą zakończyć giveaway przed czasem albo ponownie go wylosować po zakończeniu.

Wymagania są sprawdzane na końcu, a nie przy dołączaniu. Osoba, która zareagowała, ale później straciła wymaganą rolę, zostaje pominięta przy wyborze zwycięzców.

## Po co z tego korzystać

- Rozdawaj klucze do gier, Nitro lub gadżety aktywnym członkom bez wybierania nazwisk ręcznie.
- Nagradzaj osoby, które naprawdę rozmawiają, wymagając minimalnej liczby wiadomości.
- Ogranicz nagrodę do boosterów lub roli supporterów, wymagając tych ról.
- Powstrzymaj konta alternatywne i boty przed zalewaniem zgłoszeń dzięki udziałowi przez captchę.

## Sposoby dołączania

Każdy giveaway używa dokładnie jednego z tych sposobów. Interaktywny kreator `gstart` pyta, który wybrać, komenda slash ma opcje `use_button` i `use_captcha`, a w panelu jest wybór **Sposób uczestnictwa**.

| Sposób | Jak członkowie dołączają | Uwagi |
| --- | --- | --- |
| Reakcja | Reagują emotką giveawaya serwera | Domyślny. Bot odczytuje listę reakcji po zakończeniu giveawaya, do 1000 użytkowników. |
| Przycisk | Naciskają przycisk **Enter** pod embedem | Zgłoszenia są zapisywane przez bota. Ponowne dołączenie, dołączenie po zakończeniu albo będąc poza serwerem jest odrzucane. |
| Captcha | Naciskają **Enter (Web Captcha)**, logują się do panelu i przechodzą weryfikację Cloudflare Turnstile | Zapis taki sam jak przy przycisku. Zgłoszenie jest przypisywane do zalogowanego konta Discorda. |

Emotkę giveawaya ustawia się dla serwera komendą `gemote`. Bot sprawdza ją, reagując nią, więc niestandardowa emotka z innego serwera działa tylko wtedy, gdy bot jest także na tamtym serwerze. Giveawaye z reakcjami wymagają też uprawnień bota Add Reactions i Use External Emojis, a `gstart` odmawia startu bez nich.

## Wymagania

| Wymaganie | Ustawiane przez | Skutek w chwili losowania |
| --- | --- | --- |
| Wymagane role | Kreator, slash `required_roles`, **Wymagane role** w panelu | Członek musi mieć wszystkie wymienione role |
| Liczba wiadomości | Kreator, slash `required_messages`, **Wymagana liczba wiadomości** w panelu | Liczba policzonych wiadomości członka na tym serwerze musi być co najmniej tak duża. Używa usługi liczenia wiadomości, więc zna tylko wiadomości policzone od momentu jej włączenia. |

Boty są zawsze wykluczone, podobnie jak każdy, kto opuścił serwer. Wymagania są wymienione w embedzie giveawaya jako linia **Wymagane role** i linia "N Messages Required".

## Wiadomość giveawaya

Tytułem embedu jest nagroda. Opis brzmi "React with (emote) to enter!", podaje organizatora i pokazuje czas zakończenia jako względny i bezwzględny znacznik czasu Discorda. Stopka pokazuje liczbę zwycięzców, nazwę serwera i datę zakończenia. Treścią wiadomości jest wzmianka o roli pingującej, jeśli taka jest ustawiona.

Ustawienia wyglądu dla całego serwera:

| Ustawienie | Komenda | Skutek |
| --- | --- | --- |
| Kolor embedu | `gembedcolor` | Kolor embedu giveawaya, jako nazwa koloru albo `#hex` |
| Baner | `gbanner` | Obrazek pokazywany przy każdym giveawayu. Kreator i komenda slash mogą nadpisać go dla konkretnego giveawaya URL-em lub załącznikiem. |
| Rola pingowana | brak, tylko nadpisanie w kreatorze | Kreator pyta, czy pingować rolę; jeśli na serwerze zapisana jest rola pingowana, pyta, czy ją nadpisać |
| Wiadomości dla zwycięzców | `gdm` | Czy zwycięzcy dostają wiadomość prywatną. Domyślnie włączone. |

### Gdy giveaway się kończy

Jeśli jest wystarczająco wielu uprawnionych uczestników, bot edytuje embed na "Winner: @user" z organizatorem, ustawia stopkę na "Ended at (time)", zmienia treść na "**Giveaway Ended!**" i publikuje osobną wiadomość z gratulacjami, która linkuje do giveawaya i pokazuje komendę ponownego losowania. Jeśli nikt nie dołączył albo uprawnionych osób jest mniej niż zwycięzców, embed zostaje zastąpiony przez "There were not enough participants!", a giveaway zostaje oznaczony jako zakończony. Jeśli ktoś dołączył, ale nikt nie spełnił wymagań, bot o tym informuje.

Giveaway z jednym zwycięzcą uruchamia też zdarzenie `GiveawayWon` dla wyzwalaczy czatu, więc wyzwalacz może zareagować na wygraną.

### Wiadomość prywatna dla zwycięzcy

Gdy **Wiadomości dla zwycięzców** są włączone, każdy zwycięzca dostaje wiadomość prywatną. Domyślnie jest to embed informujący o wygranej, z linkiem do wiadomości giveawaya. Jeśli zapisana jest własna wiadomość końcowa, zostanie wysłana zamiast niej i może używać tych placeholderów oprócz ogólnych placeholderów serwera, użytkownika i kanału.

| Placeholder | Wartość |
| --- | --- |
| `%messagelink%` | Link do wiadomości giveawaya |
| `%giveawayitem%` | Nagroda |
| `%giveawaywinners%` | Liczba zwycięzców |

`gdmmessage` bez tekstu proponuje podgląd zapisanej wiadomości z przykładowymi wartościami, a odmowa podglądu czyści ją. Uruchomiona z tekstem również czyści zapisaną wiadomość zamiast ją zapisać.

## Ustawienia

Strona **Konkursy** w panelu ma trzy zakładki: **Aktywne giveaway'e**, **Utwórz giveaway** i **Zakończone giveaway'e**. Ustawienia dla całego serwera wymienione wyżej (emotka, kolor, baner, przełącznik DM) są dostępne tylko przez komendy.

Formularz **Utwórz giveaway**:

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Przedmiot giveawaya | puste | Nagroda, pokazywana jako tytuł embedu |
| Liczba zwycięzców | 1 | Ilu zwycięzców wylosować; musi być co najmniej 1 |
| Kanał | brak | Gdzie publikować embed |
| Czas trwania | 24 godziny | Kiedy giveaway się kończy |
| Wymagane role | brak | Role, które członek musi mieć, aby wygrać |
| Wymagana liczba wiadomości | 0 | Minimalna liczba policzonych wiadomości |
| Emoji reakcji | konfetti (🎉) | Emotka do dołączania reakcją; działa własna emotka lub wklejony kod emotki |
| Sposób uczestnictwa | Reakcja | Reakcja, Przycisk albo Captcha |

**Aktywne giveaway'e** wyświetla każdy giveaway z czasem zakończenia. Po rozwinięciu pokazuje zwycięzców, kanał, wymagane role, wymóg wiadomości i sposób dołączania oraz przycisk **Zakończ giveaway**. Ponowne losowanie jest dostępne tylko przez komendy.

## Krok po kroku

1. Uruchom `gemote` z emotką, którą członkowie mają reagować, na przykład `gemote :tada:`.
2. Opcjonalnie ustaw `gembedcolor` i `gbanner`, aby giveawaye pasowały do wyglądu serwera.
3. Otwórz **Konkursy** w panelu, a następnie **Utwórz giveaway**.
4. Wypełnij **Przedmiot giveawaya**, **Liczba zwycięzców**, **Kanał** i **Czas trwania**.
5. Dodaj **Wymagane role** albo **Wymagana liczba wiadomości**, jeśli nagroda ma trafić do ustabilizowanych członków.
6. Wybierz **Sposób uczestnictwa** i naciśnij **Utwórz giveaway**.
7. Gdy giveaway się zakończy, sprawdź kanał. Jeśli wygrała zła osoba albo nie odpowiada, uruchom `greroll <message id>`.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, jeśli go nie zmieniałeś). Te same komendy istnieją jako komendy slash pod `/giveaways`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `gstart [#channel <time> <winners> <prize>]` | `giveawaystart` | Zarządzanie wiadomościami | Rozpocznij giveaway. Bez argumentów uruchamia kreator, który pyta też o organizatora, wymóg wiadomości, baner, rolę pingowaną, sposób dołączania i wymagane role. Czas wygląda jak `2d3h`. |
| `gend <message id>` | `giveawayend` | Zarządzanie wiadomościami | Zakończ giveaway teraz i wylosuj zwycięzców |
| `greroll <message id>` | `giveawayreroll`, `reroll` | Zarządzanie wiadomościami | Wylosuj ponownie spośród uczestników zakończonego giveawaya |
| `glist` | `giveaways`, `giveawaylist` | Zarządzanie wiadomościami | Lista aktywnych giveawayów z ID wiadomości, nagrodami, liczbą zwycięzców i linkami |
| `gstats` | `giveawaystats` | Nikt | Sumy aktywnych i zakończonych giveawayów, organizatorzy i liczby na kanał |
| `gemote <emote>` | `giveawayemote` | Zarządzanie wiadomościami | Ustaw emotkę do dołączania reakcją |
| `gembedcolor <colour>` | `giveawayembedcolor` | Zarządzanie wiadomościami | Ustaw kolor embedu giveawaya |
| `gwinembedcolor <colour>` | `giveawaywinembedcolor` | Zarządzanie wiadomościami | Ustawia tę samą wartość koloru co `gembedcolor` |
| `gbanner <url>` | `giveawaybanner` | Zarządzanie wiadomościami | Ustaw domyślny obrazek banera |
| `gdm` | `giveawaydm` | Zarządzanie wiadomościami | Przełącz wiadomości prywatne dla zwycięzców |
| `gdmmessage [text]` | `gdmmsg` | Zarządzanie wiadomościami | Podejrzyj albo wyczyść własną wiadomość dla zwycięzców |

## Wskazówki i pułapki

- ID wiadomości dla `gend` i `greroll` to ID embedu giveawaya. Skopiuj je z włączonym trybem dewelopera albo odczytaj z `glist`.
- Ponowne losowanie wybiera spośród uczestników ponownie z tymi samymi wymaganiami, więc poprzedni zwycięzca może wygrać ponownie.
- Po restarcie bot od razu planuje giveawaye kończące się w ciągu najbliższych 24 godzin; te, które kończą się później, są podejmowane przez sprawdzenie co godzinę, więc giveaway o długim czasie trwania i tak zakończy się na czas.
- Jeśli bot nie może odczytać reakcji w giveawayu z reakcjami, wraca do aktualnej emotki serwera; jeśli jednak emotkę zmieniono na taką, którą nikt nie zareagował, losowanie nie znajdzie uczestników.
- Lista **Aktywne giveaway'e** w panelu pokazuje też zakończone giveawaye, a zakładka **Zakończone giveaway'e** jest obecnie pusta. Aby je odróżnić, sprawdź czas zakończenia i brak przycisku **Zakończ giveaway**.
- Dołączanie przez captchę wymaga, aby panel był osiągalny, a członek zalogował się przez Discord; zgłoszenie jest powiązane z tym kontem, a nie z czymkolwiek wpisanym na stronie.
- Wiadomości prywatne dla zwycięzców kończą się po cichu, jeśli zwycięzca ma zablokowane DM-y. Ogłoszenie na kanale i tak zostaje wysłane.

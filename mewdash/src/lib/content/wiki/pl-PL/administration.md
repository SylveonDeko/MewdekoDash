---
title: Administracja
slug: administration
summary: Automatyczna ochrona przed rajdami, spamem, kontami alt, oszustwami i pułapkami honeypot, role nadawane przy dołączeniu lub wybierane przez członków, zmiana uprawnień Discorda wymaganych przez komendy oraz operacje masowe na gorsze dni.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Administration
tags: [admin, anti-raid, anti-spam, anti-alt, anti-pattern, anti-mass-mention, anti-mass-post, honeypot, anti-image-hash, scam images, external apps, user apps, reaction roles, self-assignable roles, auto-assign roles, auto-ban roles, voice channel roles, permission overrides, dpo, mass ban, prune, server recovery, staff role, timezone, cooldowns, administracja, ochrona, rajd, spam, konto alt, oszustwa, role za reakcje, role automatyczne, wyjątki uprawnień, masowy ban, odzyskiwanie serwera, strefa czasowa, czas odnowienia]
related: [moderation, permissions, logging, multigreets, settings, auditlog, rolestates]
---

## Co robi

Administracja to moduł, który pilnuje porządku na serwerze, gdy nie patrzy żaden moderator. Jego systemy ochrony obserwują dołączenia i wiadomości i same karzą, gdy coś wygląda jak rajd, wybuch spamu, jednorazowe konto alt, masowy ping, link do oszustwa wklejany na każdym kanale, post na kanale-pułapce albo znany obraz oszustwa. Każdy system jest niezależny, ma własną karę i można go włączać oraz wyłączać osobno.

Ten sam moduł obsługuje automatyzację ról: role nadawane przy dołączeniu, role, które członkowie biorą sobie sami komendą `iam`, role za reakcje, role powiązane z przebywaniem na kanale głosowym i role-pułapki, które banują każdego, kto je dostanie. Pozwala też zmienić uprawnienie Discorda wymagane przez komendę, ustawić role staffu i członka, z których korzystają inne funkcje, ograniczyć częstotliwość używania komend i sprzątać wiadomości z komendami.

Na gorsze dni są operacje masowe: ban lub wyrzucenie wszystkich, którzy dołączyli w ostatnich minutach, ban według wzoru nazwy, roli albo awatara, czyszczenie nieaktywnych członków oraz odzyskiwanie serwera, które przywraca rolę administratora zweryfikowanemu właścicielowi.

Wszystko znajdziesz na stronie **Administracja** w panelu, w pięciu kartach: **Przegląd**, **Systemy ochrony**, **Role i uprawnienia**, **Automatyzacja i ustawienia** oraz **Operacje zaawansowane**. Prawie każde ustawienie ma też odpowiadającą komendę.

## Do czego się przydaje

- Rajdy i fale botów uderzają o trzeciej w nocy, a Ty chcesz, żeby zostały załatwione, zanim ktokolwiek się obudzi.
- Przejęte konto wkleja ten sam link phishingowy na dziesięciu kanałach.
- Członkowie powinni móc wybierać własne kolory, regiony albo role powiadomień bez pomocy staffu.
- Chcesz, żeby `ban` działał dla osób z uprawnieniem Zarządzanie wiadomościami zamiast Banowanie członków, bez ruszania ustawień ról Discorda.
- Jedna komenda jest spamowana na kanale ogólnym i potrzebuje czasu odnowienia.
- Zbuntowany admin odebrał rolę właścicielowi i potrzebujesz drogi powrotnej.

## Kary

Każdy system ochrony przyjmuje **akcję karzącą**. Niektóre akcje przyjmują też **czas trwania** lub **rolę**.

| Akcja | Co się dzieje |
| --- | --- |
| Mute | Nadaje rolę wyciszenia serwera (tekst i głos) |
| ChatMute | Rola wyciszenia tylko dla tekstu |
| VoiceMute | Serwerowo wycisza członka na kanale głosowym |
| Kick | Usuwa członka; może wrócić na serwer |
| Softban | Banuje i od razu odbanowuje, aby wyczyścić ostatnie wiadomości |
| Ban | Banuje lub banuje tymczasowo, jeśli podasz czas trwania |
| Timeout | Natywny timeout Discorda; wymaga czasu trwania, maksymalnie 28 dni |
| AddRole | Dodaje wybraną rolę, na przykład rolę kwarantanny |
| RemoveRoles | Zabiera wszystkie role |
| Warn | Dodaje ostrzeżenie przez moduł Moderacja |
| Delete | Usuwa tylko wiadomość, która złamała regułę |
| None | Zapisuje trafienie i nie robi nic więcej |

Tylko Ban, Mute, ChatMute, VoiceMute, AddRole i Timeout przyjmują czas trwania; przy pozostałych jest on ignorowany. Czas podaje się w minutach. Panel pozwala na maksymalnie 10080 (tydzień) dla Anty-rajdu, Anty-spamu, Anty-masowych wzmianek i Anty-wzorców, 1440 (dzień) dla Anty-masowych postów, Anty-post-kanału i Anty-hasha obrazów oraz rok dla Anty-alt. Kary są wykonywane po jednej na sekundę z kolejki, a powód w dzienniku audytu Discorda brzmi na przykład „Raiding Protection” albo „ImageHash Protection”.

> [!WARNING]
> Anty-rajd, Anty-alt i Anty-wzorce działają, gdy członek dołącza, i całkowicie pomijają sprawdzanie, gdy akcją jest Warn. Dla tych trzech wybierz Kick, Ban, Timeout albo rolę.

Członkowie z uprawnieniem Administrator są wyłączeni ze wszystkich ochron opartych na wiadomościach. Boty są ignorowane przez ochrony oparte na dołączeniu i przez Anty-spam; pozostałe mają przełącznik **Ignoruj boty**.

## Systemy ochrony

Karta **Systemy ochrony** pokazuje kafelek dla każdego systemu z przyciskiem **Włączone** lub **Wyłączone** oraz, po włączeniu, przyciskiem **Skonfiguruj**, który otwiera jego ustawienia. Włączenie z panelu stosuje konfigurację startową; otwórz **Skonfiguruj** i sprawdź akcję, zanim zaczniesz na niej polegać. Karta **Przegląd** pokazuje, ile z siedmiu systemów jest aktywnych, i wymienia każdy z nich.

### Anty-rajd

Liczy członków dołączających w przesuwanym oknie czasowym. Gdy liczba osiągnie **próg użytkowników** w obrębie **okna** (w sekundach), wszyscy zliczeni w tej fali są karani razem. Komenda przyjmuje próg od 2 do 30 i okno od 2 do 300 sekund; panel akceptuje od 1 do 50 i od 1 do 300. AddRole nie jest tu obsługiwane. Dołączające boty nie są liczone.

> [!EXAMPLE]
> `antiraid 10 10 Ban` banuje wszystkich, gdy w ciągu dziesięciu sekund dołączy dziesięć kont. `antiraid 10 10 Timeout 1h` zamiast tego nakłada na nich timeout na godzinę.

### Anty-spam

Liczy kolejne identyczne wiadomości od jednego członka, porównywane bez rozróżniania wielkości liter. Gdy liczba osiągnie **próg wiadomości** (od 2 do 10 w komendzie, od 1 do 20 w panelu), członek jest karany, a licznik się zeruje. Inna wiadomość zeruje licznik; każda zliczona wiadomość wygasa po trzydziestu minutach. Kanały z listy **ignorowanych kanałów** są pomijane, co przydaje się na kanałach komend botów. Użyj `antispam <count> <action> <role>` z AddRole, aby zamiast kary nadać rolę.

### Anty-alt

Sprawdza wiek każdego konta, które dołącza. Konta młodsze niż **minimalny wiek** (w minutach; działa też `antialt 3d Kick`) są karane od razu. Działa tylko przy dołączeniu, więc włączenie nie skanuje istniejących członków. Wartość startowa w panelu to 1440 minut, czyli jeden dzień.

### Anty-masowe wzmianki

Liczy wzmianki użytkowników i ról. Pojedyncza wiadomość z co najmniej **progiem wzmianek** jest karana natychmiast. Poniżej tego progu wzmianki są sumowane dla każdego członka w **oknie czasowym** (w sekundach), a przekroczenie **maks. wzmianek w oknie** uruchamia karę. **Ignoruj boty** decyduje, czy wiadomości botów się liczą.

### Anty-wzorce

Ocenia każdego nowego członka pod kątem oznak jednorazowego konta lub bota i karze, gdy wynik osiągnie **minimalny wynik**. Działa w chwili dołączenia i patrzy na konto, a nie na wiadomości.

| Sygnał | Punkty | Ustawienie |
| --- | --- | --- |
| Konto utworzone w ramach maksymalnego wieku | 5 | **Sprawdzaj wiek konta**, **Maks. wiek konta (miesiące)** |
| Dołączenie krótko po utworzeniu konta | 10 jeśli poniżej godziny, 7 jeśli poniżej sześciu godzin, w pozostałych przypadkach 3 | **Sprawdzaj czas dołączenia**, **Maks. godzin od dołączenia** |
| Inni członkowie utworzeni w tej samej godzinie | 1 za konto, maksymalnie 10 | **Sprawdzaj masowe tworzenie kont** |
| Konto jest offline podczas dołączania | 2 | **Sprawdzaj status offline** |
| Konto młodsze niż próg nowego konta | 3 | **Sprawdzaj nowe konta**, **Dni nowego konta** |
| Nazwa użytkownika pasuje do jednego z Twoich wzorców regex | 15 | Wzorzec z **check username** |
| Nazwa wyświetlana pasuje do jednego z Twoich wzorców | 12 | Wzorzec z **check display name** |

Dopasowanie wzorca karze, gdy bieżący wynik jest równy minimum lub wyższy; same pozostałe sygnały też mogą go osiągnąć. Wzorce to wyrażenia regularne, dopasowywane bez rozróżniania wielkości liter do nazwy zapisanej małymi literami. Wartości startowe w panelu to minimalny wynik 15, sześć miesięcy, 48 godzin, siedem dni i wszystkie sprawdzenia włączone. W panelu przycisk **Wzorce** na kafelku otwiera listę wzorców, w której każdy wzorzec ma nazwę, regex i dwa pola wyboru dotyczące nazw.

Za pomocą komend `patternadd <regex> [name] [checkUsername] [checkDisplayName]` dodajesz wzorzec, a `patternconfig <setting> <value>` zmienia `accountage`, `maxaccountage`, `jointiming`, `maxjoinhours`, `batchcreation`, `offlinestatus`, `newaccounts`, `newaccountdays` lub `minimumscore`. Samo `patternconfig` pokazuje bieżące wartości i to, jak często system się uruchomił.

### Anty-masowe posty

Wyłapuje członka, który w krótkim czasie wysyła to samo lub podobne treści na kilku kanałach, czyli klasyczne „wklej link do oszustwa wszędzie”, którego Anty-spam nie widzi, bo wiadomości są rozproszone.

Dla każdego członka bot trzyma pięćdziesiąt ostatnich wiadomości w obrębie **okna czasowego** (od 10 do 600 sekund). Wiadomość jest porównywana z wcześniejszymi i uznawana za podobną, gdy jest w co najmniej 80% zgodna według odległości edycyjnej, bez rozróżniania wielkości liter. Gdy podobne wiadomości są na co najmniej **progu kanałów** (od 2 do 20) różnych kanałach, członek jest karany. Wiadomości krótsze niż dwadzieścia znaków są ignorowane.

**Sprawdzaj tylko linki** jest domyślnie włączone: śledzone są tylko wiadomości zawierające link. Ignorowani użytkownicy, role i kanały są respektowane. Domyślnie wiadomość, która wywołała regułę, jest usuwana, a członek dostaje DM z wyjaśnieniem.

### Anty-post-kanał

Konfiguruje **kanały-pułapki** (honeypot). Oznacz jeden lub więcej kanałów, na których prawdziwi członkowie nie mają powodu pisać, zwykle ukrytych nisko na liście kanałów i z ostrzegawczą nazwą. Wszystko, co tam napisze, jest traktowane jak bot lub przejęte konto: wiadomość jest usuwana, autor dostaje DM i zostaje ukarany. Administratorzy są wyłączeni, a możesz dodać **ignorowane role** i **ignorowanych użytkowników** (po ID).

Bot utrzymuje też aktualny **embed ze statusem** na kanale statusu: tym, na którym wpisałeś `antipostchannel`, albo, przy włączeniu z panelu, na pierwszym kanale-pułapce, który kogoś złapie. Embed pokazuje akcję, liczbę kanałów-pułapek, łączną liczbę złapanych i ostatnich dziesięciu złapanych członków.

### Anty-hash obrazów

Blokuje konkretne obrazy na podstawie ich wyglądu, więc ponowne wysłanie obrazu ze zmienionym rozmiarem, rekompresją, rozjaśnieniem, odbiciem lub dodaną ramką nadal pasuje. Każdy zablokowany obraz jest zapisywany jako hash percepcyjny razem z odbiciem lustrzanym i, jeśli ma jednolitą ramkę, kopią bez ramki. Wysłane załączniki (oraz embedy, jeśli **check embeds** jest włączone) są hashowane tak samo i porównywane.

- **Tolerancja dopasowania** (od 0 do 64, domyślnie 31) określa, jak bardzo wysłany obraz może się różnić i nadal się liczyć. Zmniejsz ją, jeśli zablokowany zostanie niewinny obraz; zwiększ tylko wtedy, gdy oszuści się prześlizgują.
- **Wyłapuj kopie z ramką** usuwa jednolitą ramkę z wysłanego obrazu przed dopasowaniem. Kopie lustrzane są zawsze wyłapywane.
- Obrazy zbyt proste, by je wiarygodnie rozpoznać, nigdy nie są dopasowywane i nigdy nie są akceptowane do blokady, bo pasowałyby do niepowiązanych obrazów.
- Obrazy większe niż 8 MB nie są pobierane ani hashowane. Limit można ustawić między 1 a 32 MB przez API, ale ani kafelek w panelu, ani komenda go nie udostępniają.
- Każdy zablokowany obraz może mieć własną akcję, czas trwania i rolę, które zastępują domyślne ustawienia systemu. **Tylko usuń** usuwa obraz bez karania autora.
- Ignorowane role i kanały są pomijane; autor domyślnie dostaje DM.

**Blokuj znane obrazy oszustw** włącza gotową listę dostarczaną z botem, obecnie z fałszywymi kasynami kryptowalutowymi i obrazami giveawayów MrBeasta krążącymi po Discordzie. Kafelek pokazuje, ile obrazów jest na liście i ile postów wyłapała na Twoim serwerze.

Aby zablokować własny obraz w panelu, upuść lub prześlij plik albo wklej jego adres URL, nadaj etykietę, opcjonalnie wybierz akcję dla tego obrazu i zapisz. Za pomocą komend uruchom `blockimage [action] [name]`, dołączając obraz, odpowiadając na wiadomość, która go zawiera, albo wklejając link. `blockedimages` wypisuje wszystko z liczbą trafień, `unblockimage <id>` usuwa jeden obraz, a `imagehash` pokazuje hash obrazu bez jego blokowania.

> [!TIP]
> Zacznij od włączenia Anty-post-kanału i listy znanych obrazów oszustw. Żadne z nich nie daje fałszywych trafień w zwykłym czacie, a razem wyłapują większość zautomatyzowanych oszustw.

### Anty-zewnętrzne aplikacje

Członkowie mogą dodawać aplikacje do własnego konta Discord i używać ich na dowolnym serwerze, nawet takim, na którym aplikacji nigdy nie dodano. Wiadomości od takich aplikacji pojawiają się pod nazwą aplikacji, więc pozostałe ochrony, które patrzą na to, kto wysłał wiadomość, nigdy nie widzą stojącego za nimi członka. Anty-zewnętrzne aplikacje odczytują, który członek uruchomił aplikację, i karzą jego.

Wiadomość jest naruszeniem, gdy:

- wspomina co najmniej **limit wzmianek** użytkowników i ról (domyślnie 5) albo pinguje everyone lub here,
- zawiera link z zaproszeniem Discorda, gdy **Usuń linki z zaproszeniami** jest włączone,
- albo pochodzi od członka, który uruchomił aplikacje więcej niż **wiadomości aplikacji dozwolone** razy w oknie czasowym (domyślnie 5 w 10 sekund).

Ustawienie limitu na 0 wyłącza to sprawdzanie. Gdy wiadomość łamie regułę, jest usuwana, a członek, który uruchomił aplikację, dostaje karę, domyślnie godzinny timeout. **Tylko usuń** usuwa wiadomość bez karania kogokolwiek. Aplikacje dodane do samego serwera są pomijane, podobnie jak administratorzy serwera.

> [!TIP]
> Dobrym uzupełnieniem jest uprawnienie Discorda **Używaj aplikacji zewnętrznych**. Członkowie bez niego nadal mogą używać swoich aplikacji, ale odpowiedzi widzą tylko oni sami. Zabroń go dla `@everyone` i zezwól dla zaufanej lub poziomowanej roli, a nowe albo jednorazowe konta w ogóle nie będą mogły pisać przez aplikacje.

## Role

Te kafelki znajdują się na karcie **Role i uprawnienia**.

### Automatyczne role

Role nadawane każdemu członkowi w chwili dołączenia, z osobną listą dla botów. Członkowie, którzy wciąż przechodzą weryfikację członkostwa, dostają role po jej zatwierdzeniu. Jeśli Role States jest ustawione tak, by pomijać automatyczne role dla członków z zapisanym stanem ról, powracający członkowie zachowują zamiast tego swoje dawne role. `autoassignrole <role>` przełącza rolę na liście; uruchomione bez argumentu pokazuje listę.

### Role do samodzielnego przypisywania

Role, które członkowie mogą sami sobie nadać komendą `iam <role>` i zdjąć komendą `iamnot <role>`. Role są sortowane w ponumerowane **grupy** (grupa 0 to „Bez grupy”), a grupy można nazywać. **Tryb wyłączny** to przełącznik dla całego serwera: gdy jest włączony, wzięcie roli z grupy usuwa każdą inną rolę z tej grupy, którą posiadasz, co jest idealne dla kolorów lub regionów. Rola może wymagać minimalnego **poziomu** XP. **Usuwaj wiadomości iam** usuwa po trzech sekundach zarówno komendę, jak i odpowiedź, żeby kanał był czysty.

### Role za reakcje

Przypisz emoji do ról na istniejącej wiadomości. Członkowie klikają emoji, aby dostać rolę, i usuwają je, aby ją stracić. Każdą wiadomość można oznaczyć jako **Wyłączne**, by członek mógł mieć z niej tylko jedną rolę. Discord pozwala na dwadzieścia reakcji na wiadomość, a panel liczy je za Ciebie. Dodanie do wiadomości, która ma już role za reakcje, rozszerza istniejącą konfigurację.

Za pomocą komend `reactionroles [messageId] [excl] <role> <emoji> ...` konfiguruje pary; pomiń ID wiadomości, aby użyć wiadomości bezpośrednio nad Twoją komendą. `reactionroleslist` pokazuje wszystkie konfiguracje z indeksem, a `reactionrolesremove <index>` usuwa jedną.

### Role kanałów głosowych

Powiąż rolę z kanałem głosowym. Członkowie dostają rolę po dołączeniu do kanału i tracą ją po wyjściu. Użyj tego, aby otworzyć kanał tekstowy tylko dla osób aktualnie będących na rozmowie.

### Role z auto-banem

Każda rola z tej listy to pułapka: w chwili, gdy członek ją dostanie, zostaje zbanowany. Powód domyślnie brzmi „Auto-ban role assigned”, chyba że ustawisz własny komendą `autobanrolereason`. Połącz to z rolą za reakcję na ukrytej wiadomości, aby łapać boty, które same sobie przypisują role. Liczba dni usuwanych wiadomości wynika z ustawienia czyszczenia przy banie w module Moderacja.

## Wyjątki uprawnień i uprawnienia komend

**Wyjątki uprawnień** zastępują uprawnienie Discorda, które komenda normalnie sprawdza. Dodaj wyjątek dla `ban` wymagający Zarządzania wiadomościami, a każdy z tym uprawnieniem będzie mógł jej użyć; dodaj wyjątek wymagający Administratora, a użyją jej tylko administratorzy. Gdy wymieniono kilka uprawnień, użytkownik potrzebuje wszystkich. Za pomocą komend `dpo <command> <permission> [permission...]` ustawia wyjątek, `dpo <command>` bez uprawnień go usuwa, `dpol` wypisuje wyjątki, a `dpor` czyści wszystko po potwierdzeniu. Akceptowane są też nazwy własnych chat triggerów.

Kafelek **Uprawnienia komend** na tej samej karcie to system uprawnień komend oparty na regułach: zezwalaj na komendę, moduł lub wszystko albo to blokuj dla użytkownika, roli, kanału, kategorii lub całego serwera, z oceną od góry do dołu. Ma własny artykuł, zobacz `permissions`.

## Ustawienia serwera

Te kafelki znajdują się na karcie **Automatyzacja i ustawienia**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| **Rola staffu** | brak | Rola, którą inne funkcje traktują jako staff |
| **Rola członka** | brak | Rola traktowana jako „członek”; `prunemembers` może obejmować osoby z nią |
| **Strefa czasowa serwera** | UTC | Strefa czasowa używana wszędzie tam, gdzie bot wypisuje czas lokalny |
| **Czasy odnowienia komend** | brak | Limit użycia na komendę w sekundach, od 1 do 90 000 |
| **Wyjątki uprawnień** | brak | Uprawnienie Discorda wymagane przez każdą komendę (patrz wyżej) |
| **Kanał głosowy gier** | brak | Gdy członek na tym kanale głosowym zaczyna grać w grę, bot przenosi go na kanał głosowy, którego nazwa pasuje do gry |
| **Usuwanie wiadomości po komendzie** | wyłączone | Usuwa wiadomość z komendą po jej wykonaniu, z wyjątkami dla kanałów: Włączone, Wyłączone lub Dziedzicz |
| **Rezygnacja ze statystyk** | uczestniczysz | Zatrzymuje zbieranie statystyk użycia komend dla tego serwera; **Usuń statystyki** kasuje to, co zapisano |

## Operacje zaawansowane

Karta **Operacje zaawansowane** zawiera trzy kafelki. Każda operacja masowa prosi o potwierdzenie, a potem wykonuje się bez dalszych sprawdzeń.

### Własna wiadomość o banie

Wiadomość, którą członek dostaje w DM po zbanowaniu, tworzona w edytorze embedów. To ten sam szablon, którego używa komenda ban z modułu Moderacja.

### Odzyskiwanie serwera

Sposób na przywrócenie roli Administratora właścicielowi po tym, jak przejęty admin ją zabrał. Dla serwera przechowywane są dwa sekrety: **klucz odzyskiwania** i **klucz dwuskładnikowy**.

- Uruchomienie `/serverrecovery server-recover` jako właściciel serwera, gdy nic nie jest skonfigurowane, generuje oba: klucz odzyskiwania wysłany Ci w DM oraz sekret aplikacji uwierzytelniającej pokazany jako kod QR. Potwierdź kodem z aplikacji uwierzytelniającej, aby zakończyć.
- Po konfiguracji każdy, kto uruchomi `/serverrecovery server-recover`, poda klucz odzyskiwania, a następnie prawidłowy kod z aplikacji uwierzytelniającej, dostaje nową rolę o nazwie „Recovered Server Owner Role” z uprawnieniem Administrator, umieszczoną tuż pod najwyższą rolą bota.
- `/serverrecovery clear-server-recover` usuwa zapisane klucze po potwierdzeniu, podobnie jak **Usuń konfigurację odzyskiwania** w panelu.

Kafelek w panelu może też zapisywać klucze bezpośrednio: wygeneruj lub wpisz klucz odzyskiwania o długości co najmniej szesnastu znaków oraz klucz dwuskładnikowy. Bot weryfikuje kody względem tego klucza dwuskładnikowego jako sekretu aplikacji uwierzytelniającej (TOTP), więc wpisz sekret base32, który dodałeś do aplikacji uwierzytelniającej, a nie zwykłe hasło.

> [!PERMISSION]
> Sam bot musi mieć uprawnienie Administrator, aby odzyskiwanie działało, a jego najwyższa rola musi leżeć na tyle wysoko, by rola tuż pod nią nadal stała ponad osobami, wobec których odzyskujesz serwer.

### Operacje masowe

| Operacja | Co robi |
| --- | --- |
| **Wyczyść nieaktywnych użytkowników** | Czyszczenie członków Discorda nieaktywnych przez podaną liczbę dni (od 1 do 30) |
| **Masowy ban użytkowników** | Banuje wklejoną listę ID użytkowników z jednym powodem; usuwanie wiadomości wynika z ustawienia czyszczenia przy banie w module Moderacja |
| **Masowa zmiana nicków** | Ustawia nick każdego członka według wzoru, w którym `{username}` jest zastępowane jego nazwą użytkownika, na przykład `[AFK] {username}`; członkowie, których bot nie może przemianować, są pomijani |
| **Wyczyść do wiadomości** | Usuwa po kolei każdą wiadomość po podanym ID wiadomości na kanale |

Komendy dodają sposoby wyboru, kto zostanie zbanowany: `banunder 10m` banuje wszystkich, którzy dołączyli w ostatnich dziesięciu minutach (`-p` najpierw pokazuje podgląd listy, `-accage 1d` dodatkowo wymaga, by konto było młodsze niż dzień), `kickunder` robi to samo z wyrzuceniem, `nameban <regex>` banuje nazwy użytkowników pasujące do wzorca po podglądzie, `baninrole <role>` banuje wszystkich z daną rolą, a `banbyhash <avatarHash>` banuje każdego członka używającego danego awatara. Wszystkie proszą o potwierdzenie.

## Konfiguracja krok po kroku

1. Otwórz **Administrację** w panelu i przejdź do **Systemów ochrony**.
2. Włącz **Anty-rajd**, naciśnij **Skonfiguruj** i ustaw próg oraz okno pasujące do normalnej liczby dołączeń. Jako akcję wybierz Kick lub Ban.
3. Utwórz ukryty kanał, na którym pisałyby tylko boty, włącz **Anty-post-kanał** i dodaj go w **Kanałach-pułapkach**.
4. Włącz **Anty-hash obrazów** i naciśnij **Blokuj znane obrazy oszustw**.
5. Włącz **Anty-masowe posty** z domyślnymi trzema kanałami w sześćdziesiąt sekund i tylko linkami.
6. W **Role i uprawnienia** dodaj swoją rolę członka do **Automatycznych ról** dla zwykłych użytkowników, skonfiguruj grupę kolorów przez **Dodaj rolę do samodzielnego przypisywania**, a następnie włącz **tryb wyłączny**.
7. W **Automatyzacja i ustawienia** ustaw **Rolę staffu**, **Rolę członka** i **Strefę czasową serwera**.
8. W **Operacjach zaawansowanych** skonfiguruj **Odzyskiwanie serwera**, póki jest spokojnie.
9. Sprawdź **Przegląd**: wymienia każdy system ochrony i to, czy jest aktywny.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś). Komendy ochrony uruchomione bez argumentów wyłączają dany system.

### Ochrona

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `antiraid [threshold] [seconds] [action] [duration]` | | Administrator | Konfiguruje lub wyłącza Anty-rajd |
| `antispam [count] [action] [duration or role]` | | Administrator | Konfiguruje lub wyłącza Anty-spam |
| `antialt [minAge] [action] [duration or role]` | | Administrator | Konfiguruje lub wyłącza Anty-alt |
| `antimassmention [threshold] [window] [max] [ignoreBots] [action] [duration or role]` | `amm`, `massmention`, `stopmassmention` | Administrator | Konfiguruje lub wyłącza Anty-masowe wzmianki |
| `antipattern [action] [duration or role]` | `apattern` | Administrator | Konfiguruje lub wyłącza Anty-wzorce |
| `patternadd <regex> [name] [checkUsername] [checkDisplayName]` | `padd` | Administrator | Dodaje wzorzec nazwy |
| `patternremove <id>` | `premove`, `prem` | Administrator | Usuwa wzorzec według ID |
| `patternlist` | `plist` | Administrator | Wypisuje wzorce |
| `patternconfig [setting] [value]` | `pconfig` | Administrator | Pokazuje lub zmienia ustawienia punktacji Anty-wzorców |
| `antimasspost [channels] [seconds] [action] [duration]` | | Administrator | Konfiguruje lub wyłącza Anty-masowe posty |
| `antipostchannel [action] [duration]` | | Administrator | Konfiguruje lub wyłącza kanały-pułapki; bieżący kanał staje się kanałem statusu |
| `antipostchanneladd <#channel>` | | Administrator | Dodaje kanał-pułapkę |
| `antipostchannelremove <#channel>` | | Administrator | Usuwa kanał-pułapkę |
| `antiimagehash [action] [tolerance] [duration]` | `aih` | Administrator | Konfiguruje lub wyłącza Anty-hash obrazów |
| `antiexternalapp [action] [mentions] [messages] [duration]` | `aea`, `antiuserapp` | Administrator | Konfiguruje lub wyłącza Anty-zewnętrzne aplikacje |
| `blockimage [action] [name]` | `banimage` | Administrator | Blokuje dołączony obraz, obraz z wiadomości, na którą odpowiadasz, albo obraz z linku |
| `unblockimage <id>` | `unbanimage` | Administrator | Usuwa zablokowany obraz |
| `blockedimages` | `blockedimagelist` | Administrator | Wypisuje zablokowane obrazy z liczbą trafień |
| `imagehash [url]` | | Administrator | Pokazuje hash obrazu |
| `antiimagehashpreset` | `aihpreset`, `blockcommonscams` | Administrator | Przełącza listę znanych obrazów oszustw |
| `antiimagehashignore <role or #channel>` | `aihignore` | Administrator | Przełącza wyłączenie roli lub kanału |

### Role

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `autoassignrole [role]` | `aar` | Zarządzanie rolami | Przełącza rolę nadawaną przy dołączeniu albo wypisuje je |
| `autoassignbotrole [role]` | `aabr` | Zarządzanie rolami | To samo dla botów |
| `asar [group] <role>` | | Zarządzanie rolami | Czyni rolę możliwą do samodzielnego przypisania, opcjonalnie w grupie |
| `rsar <role>` | | Zarządzanie rolami | Usuwa rolę do samodzielnego przypisywania |
| `lsar` | | Nikt | Wypisuje role do samodzielnego przypisywania według grup |
| `sargn <group> [name]` | | Zarządzanie rolami | Nadaje nazwę grupie albo ją czyści |
| `togglexclsar` | `tesar` | Zarządzanie rolami | Przełącza tryb wyłączny |
| `rolelevelreq <level> <role>` | `rlr` | Zarządzanie rolami | Wymaga poziomu XP dla roli |
| `adsarm` | | Zarządzanie wiadomościami | Przełącza usuwanie wiadomości `iam` |
| `iam <role>` | | Nikt | Nadaje Ci rolę do samodzielnego przypisania |
| `iamnot <role>` | `iamn` | Nikt | Zdejmuje ją |
| `reactionroles [messageId] [excl] <role> <emoji>...` | `rero` | Zarządzanie rolami | Konfiguruje role za reakcje na wiadomości |
| `reactionroleslist` | `reroli` | Zarządzanie rolami | Wypisuje konfiguracje ról za reakcje |
| `reactionrolesremove <index>` | `rerorm` | Zarządzanie rolami | Usuwa konfigurację według indeksu |
| `vcrole [voiceChannel] [role]` | | Zarządzanie rolami | Wiąże rolę z kanałem głosowym (domyślnie z Twoim obecnym); brak roli usuwa powiązanie |
| `vcrolerm <channelId>` | | Zarządzanie rolami | Usuwa powiązanie według ID kanału |
| `vcrolelist` | | Nikt | Wypisuje role kanałów głosowych |
| `autobanroleadd <role>` | `abra` | Administrator | Dodaje rolę-pułapkę |
| `autobanroleremove <role>` | `abrr` | Administrator | Usuwa ją |
| `autobanrolelist` | `abrl` | Administrator | Wypisuje role-pułapki i powody |
| `autobanrolereason <role> [reason]` | `abreason` | Administrator | Pokazuje, ustawia lub czyści powód bana |
| `setrole <role> <user> [time]` | `sr`, `giverole` | Zarządzanie rolami | Nadaje rolę, opcjonalnie na ograniczony czas |
| `removerole <role> <user>` | `rr` | Zarządzanie rolami | Zabiera rolę |
| `removeallroles <user>` | `rar` | Zarządzanie rolami | Zabiera wszystkie role |
| `createrole [name]` | `cr` | Zarządzanie rolami | Tworzy rolę |
| `deleterole <role>` | `dr` | Zarządzanie rolami | Usuwa rolę |
| `renamerole <role> <name>` | `renr` | Zarządzanie rolami | Zmienia nazwę roli |
| `rolehoist <role>` | `rh` | Zarządzanie rolami | Przełącza wyświetlanie roli osobno |
| `rolecolor <role> [color]` | `roleclr` | Nikt do podglądu, Zarządzanie rolami do ustawienia | Pokazuje lub ustawia kolor roli |

Komendy `autobanrole` są dostępne także jako komendy slash `/autobanrole list`, `add`, `remove` i `reason`.

### Uprawnienia i ustawienia

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `dpo <command> [permission...]` | | Administrator | Ustawia lub usuwa wyjątek uprawnień |
| `dpol` | `dpoli` | Administrator | Wypisuje wyjątki |
| `dpor` | | Administrator | Czyści wszystkie wyjątki |
| `staffrole [role]` | | Administrator | Pokazuje lub ustawia rolę staffu |
| `staffroledisable` | | Administrator | Czyści rolę staffu |
| `memberrole <role>` | | Administrator | Pokazuje lub ustawia rolę członka |
| `delmsgoncmd [list, server, or channel <enable, disable, inherit> [#channel]]` | `dmc` | Administrator | Pokazuje, przełącza lub nadpisuje usuwanie wiadomości z komendami |
| `gamevoicechannel` | `gvc` | Administrator | Przełącza Twój obecny kanał głosowy jako kanał głosowy gier |
| `timezone [id]` | | Nikt do podglądu, Administrator do ustawienia | Pokazuje lub ustawia strefę czasową serwera |
| `timezones` | | Nikt | Wypisuje dostępne ID stref czasowych |
| `prefix [new]` | | Nikt do podglądu, Administrator do ustawienia | Pokazuje lub zmienia prefiks komend |
| `languageset <name>` | `langset` | Administrator | Ustawia język serwera albo `default` |
| `langsetdefault [name]` | `langsetd` | Nikt do podglądu, właściciel bota do ustawienia | Pokazuje lub ustawia domyślny język bota dla wszystkich |
| `languageslist` | `langli` | Nikt | Wypisuje obsługiwane języki |
| `guildstatsoptout` | `gstatsoptout` | Administrator | Przełącza statystyki komend dla tego serwera |
| `deleteguildstatsdata` | `delguildstatsdata` | Administrator | Usuwa zapisane statystyki, raz na godzinę |

### Operacje masowe i narzędzia

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `banunder <time> [-p or -accage <time>]` | | Administrator | Banuje wszystkich, którzy dołączyli w podanym czasie |
| `kickunder <time> [-p]` | | Administrator | Wyrzuca wszystkich, którzy dołączyli w podanym czasie |
| `nameban <regex>` | `nban` | Administrator | Banuje członków, których nazwa użytkownika pasuje, z podglądem |
| `baninrole <role> [reason]` | | Administrator | Banuje wszystkich z daną rolą |
| `banbyhash <avatarHash>` | `bbh` | Administrator | Banuje wszystkich z danym hashem awatara |
| `prunemembers <time> [yes]` | `memberprune` | Administrator | Czyści członków nieaktywnych przez tyle dni; `yes` obejmuje rolę członka |
| `setnick [user] <nickname>` | | Zarządzanie pseudonimami | Zmienia nick członka albo samego bota |
| `deafen <users...>` | `deaf` | Wyciszanie słuchu członków | Serwerowe wyciszenie słuchu |
| `undeafen <users...>` | `undef` | Wyciszanie słuchu członków | Cofa je |
| `creatxtchanl <name>` | `ctch` | Zarządzanie kanałami | Tworzy kanał tekstowy |
| `deltxtchanl <#channel>` | `dtch` | Zarządzanie kanałami | Usuwa kanał tekstowy |
| `creatvoichanl <name>` | `cvch` | Zarządzanie kanałami | Tworzy kanał głosowy |
| `delvoichanl <channel>` | `dvch` | Zarządzanie kanałami | Usuwa kanał głosowy |
| `settopic [topic]` | `st` | Zarządzanie kanałami | Ustawia temat bieżącego kanału |
| `setchanlname <name>` | `schn` | Zarządzanie kanałami | Zmienia nazwę bieżącego kanału |
| `renamechannel <channel> <name>` | `channelrename` | Zarządzanie kanałami | Zmienia nazwę dowolnego kanału |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Zarządzanie kanałami | Przełącza flagę NSFW na bieżącym kanale |
| `edit [#channel] <messageId> <text>` | | Zarządzanie wiadomościami na tym kanale | Edytuje jedną z wiadomości bota |
| `delete [#channel] <messageId> [time]` | `del` | Zarządzanie wiadomościami na tym kanale | Usuwa wiadomość od razu lub po opóźnieniu do siedmiu dni |
| `setguildavatar [url]` | `sgav`, `setgav` | Zarządzanie serwerem | Ustawia ikonę serwera z adresu URL lub załącznika |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Zarządzanie serwerem | Ustawia baner serwera |
| `setguildbio <text>` | `sgbio`, `setgbio` | Zarządzanie serwerem | Ustawia opis serwera |

Odzyskiwanie serwera działa tylko jako komenda slash: `/serverrecovery server-recover` i `/serverrecovery clear-server-recover`. Większość pozostałych powyższych komend ma też odpowiedniki slash pod `/protection`, `/administration`, `/channel`, `/purge-members`, `/delmsgoncmd`, `/voice`, `/perm-override` i `/roles`.

### Komendy logowania i powitań

Moduł zawiera też komendy logowania (`log`, `logcategory`, `logevents`, `logignore`, `logignorelist`, `commandlogchannel`, wszystkie wymagają Administratora, oraz grupa slash `/log`) i klasyczne komendy powitań (`greetdm`, `greetdmmsg`, `greetdmtest`, `bye`, `byemsg`, `byedel`, `byetest`, `leavehook`, `boost`, `boostmsg`, `boostdel`, `boosttest`, wszystkie wymagają Zarządzania serwerem). Są opisane w artykułach `logging` i `multigreets`.

## Wskazówki i pułapki

- Rola bota musi leżeć wyżej niż każda rola, którą nadaje, zabiera albo wobec której banuje, a bot potrzebuje uprawnień Banowanie członków, Wyrzucanie członków, Zarządzanie rolami lub Moderowanie członków, zależnie od wybranych kar. Akcje wyciszenia wymagają roli wyciszenia, którą bot tworzy przy pierwszym użyciu.
- Komendy akceptują maksymalnie dzień (`1d`) dla czasu trwania Anty-rajdu i Anty-spamu, a Timeout nigdy nie może przekroczyć 28 dni.
- Anty-spam liczy tylko identyczne powtórzenia. Członek wysyłający szybko dziesięć różnych wiadomości nie jest dla niego spamerem; to właśnie obejmują Anty-masowe posty i Anty-masowe wzmianki.
- Anty-masowe posty z włączonym **Sprawdzaj tylko linki** ignorują wszystko bez linku. Wyłącz to, aby łapać copypasty, kosztem większej liczby fałszywych trafień na ruchliwych serwerach.
- Sprawdzanie masowego tworzenia kont w Anty-wzorcach pobiera całą listę członków przy każdym dołączeniu, co jest wolne na bardzo dużych serwerach.
- Zablokowany obraz dodany z hasha, a nie z samego obrazu, wyłapuje tylko dokładne kopie; dodaj go ponownie z obrazu, aby objąć wersje lustrzane i z ramką.
- Włączenie ochrony z panelu stosuje wartości startowe. Otwórz **Skonfiguruj** i potwierdź akcję, zwłaszcza zanim wybierzesz Ban.
- Komendy automatycznych ról, ról do samodzielnego przypisywania i ról za reakcje odrzucają role na poziomie Twojej najwyższej roli lub wyżej, chyba że jesteś właścicielem.
- Role za reakcje przepadają, jeśli wiadomość zostanie usunięta; `reactionroleslist` pokazuje, które konfiguracje wskazują na usuniętą wiadomość.
- Masowa zmiana nicków dotyka każdego członka, którego bot może przemianować, w tym staffu poniżej jego roli. Miej plan na przywrócenie nicków.
- `delete` i `edit` działają tylko na wiadomościach, które bot widzi, a `edit` tylko na własnych wiadomościach bota.

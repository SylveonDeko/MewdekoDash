---
title: Sugestie
slug: suggestions
summary: Daj członkom kanał lub przycisk do zgłaszania pomysłów, pozwól serwerowi na nie głosować, a moderatorom akceptować, odrzucać, rozważać lub realizować każdy z nich z podaniem powodu.
icon: fa-lightbulb
category: Community
dashboard: /dashboard/suggestions
module: Suggestions
tags: [suggestions, ideas, feedback, voting, accept, deny, consider, implement, threads, suggest button, placeholders, sugestie, pomysły, opinie, głosowanie, zaakceptuj, odrzuć, rozważ, zrealizuj, wątki, przycisk sugestii, symbole zastępcze]
related: [administration, afk]
---

## Co robi

Członek uruchamia `suggest` ze swoim pomysłem, wpisuje go prosto na kanale sugestii albo naciska przycisk **Suggest Here!** i wypełnia formularz. Bot usuwa oryginalną wiadomość, publikuje na kanale sugestii ponumerowany embed sugestii i dołącza emotki do głosowania jako reakcje lub przyciski. Każda sugestia dostaje numer, którego moderatorzy używają, by później się do niej odwołać.

Następnie moderatorzy przesuwają sugestię przez cztery stany: akceptacja, odrzucenie, rozważenie lub realizacja, każdy z opcjonalnym powodem. Bot edytuje oryginalną wiadomość sugestii w kolorowy embed ze statusem, wysyła członkowi, który ją zgłosił, DM z wynikiem i może wysłać embed ze statusem ponownie na osobny kanał dla każdego stanu, aby zaakceptowane pomysły były w jednym miejscu, a odrzucone w innym.

Opcjonalnie każda sugestia ma przycisk **Join/Create Discussion**, który otwiera pod nią publiczny lub prywatny wątek. Gdy moderatorzy zmienią stan, wątek może zostać automatycznie zarchiwizowany.

## Do czego Ci się przyda

- Kanały z opiniami, na których pomysły giną wśród odpowiedzi; każda sugestia staje się osobną wiadomością z liczbą głosów.
- Społeczności, które chcą, aby członkowie widzieli, co zostało zaakceptowane, a co odrzucone i dlaczego, bez pisania ogłoszeń przez moderatorów.
- Serwery, które chcą dyskusji nad każdym pomysłem zamiast kłótni na głównym kanale, z użyciem wątków.
- Moderatorzy, którzy chcą segregować sugestie z panelu przy użyciu pola z powodem, zamiast pamiętać numery sugestii.

## Jak zgłosić sugestię

Są trzy sposoby, a wszystkie przechodzą te same kontrole długości i kończą na kanale sugestii.

| Metoda | Co się dzieje |
| --- | --- |
| `suggest <text>` | Wiadomość z komendą jest usuwana, a sugestia opublikowana. Działa z dowolnego kanału. |
| Wpisanie na kanale sugestii | Każda wiadomość nie od bota, która nie zaczyna się od prefiksu, zamienia się w sugestię, a oryginał jest usuwany. Członkowie z rolą moderatorską serwera są pomijani, więc moderatorzy mogą normalnie rozmawiać na kanale. |
| Przycisk sugestii | Wiadomość z przyciskiem na **Kanale przycisku sugestii**. Jego naciśnięcie otwiera formularz, którego limity długości odpowiadają Twoim ustawieniom. |

Jeśli tekst jest dłuższy niż **Maksymalna długość** lub krótszy niż **Minimalna długość**, zostaje odrzucony. W przypadku komendy błąd pokazuje się na kanale i znika po pięciu sekundach; na kanale sugestii wiadomość jest usuwana, a członek dostaje DM. Wzmianki wewnątrz sugestii są neutralizowane w opublikowanym embedzie, a członek dostaje informację, że sugestia została wysłana.

Domyślny embed sugestii używa członka jako autora, tytułu „Suggestion #N” i tekstu jako opisu. Możesz go zastąpić własnym embedem (zobacz symbole zastępcze poniżej).

### Przycisk sugestii

Wiadomość z przyciskiem jest publikowana na **Kanale przycisku sugestii**, a bot trzyma ją na dole: gdy inne wiadomości ją wypchną w górę, bot usuwa ją i publikuje ponownie. Domyślna etykieta to **Suggest Here!** bez emotki i w kolorze blurple. Wiadomość nad przyciskiem może być zwykłym tekstem lub kodem embeda, a domyślnie jest krótką zachętą „make a suggestion”.

## Głosowanie

Domyślnie każda sugestia dostaje kciuk w górę i kciuk w dół. Zamiast tego możesz ustawić do pięciu własnych emotek przez `suggestmotes` lub selektor **Własne emotki**; bot musi móc ich używać.

**Tryb wyświetlania emotek** decyduje, jak oddaje się głosy.

| Tryb | Zachowanie |
| --- | --- |
| Reakcje (domyślnie) | Bot dodaje emotki jako reakcje. Liczby są śledzone na podstawie dodawania i usuwania reakcji. |
| Przyciski | Emotki stają się przyciskami pokazującymi liczbę na żywo. Członek może mieć jeden głos na sugestię: ponowne naciśnięcie tego samego przycisku pyta o usunięcie głosu, naciśnięcie innego pyta o zmianę. |

W trybie przycisków każdy z pięciu przycisków emotek ma własny kolor (**Przycisk emotki 1** do **Przycisk emotki 5**). Kolory to Niebieski, Szary, Zielony i Czerwony. Zmiana koloru odświeża też wiadomość z przyciskiem sugestii.

`suggestinfo <number>` pokazuje tekst, autora sugestii, bieżący stan, kto ostatnio go zmienił, ile razy stan się zmieniał oraz liczbę głosów na każdą emotkę, z przyciskami Zaakceptuj, Odrzuć, Rozważ i Zrealizuj pod spodem.

## Stany

Każda sugestia zaczyna jako Suggested (w panelu pokazywana jako Oczekuje). Moderatorzy z Zarządzaniem wiadomościami mogą przenieść ją do jednego z czterech stanów komendami `accept`, `deny`, `consider` lub `implemented`, przyciskami pod `suggestinfo` albo z panelu. Każda zmiana stanu z powodem pokazuje ten powód; bez niego pole zawiera „none”.

| Stan | Kolor embeda | Dodatkowe opcje |
| --- | --- | --- |
| Zaakceptowana | Niebieski | Kanał zaakceptowanych, wiadomość o zaakceptowaniu, archiwizacja po zaakceptowaniu |
| Odrzucona | Czerwony | Kanał odrzuconych, wiadomość o odrzuceniu, archiwizacja po odrzuceniu |
| Rozważana | Złoty | Kanał rozważanych, wiadomość o rozważaniu, archiwizacja po rozważeniu |
| Zrealizowana | Zielony | Kanał zrealizowanych, wiadomość o zrealizowaniu, archiwizacja po zrealizowaniu |

Gdy stan się zmienia, bot robi co następuje, w tej kolejności:

1. Archiwizuje wątek dyskusji, jeśli przełącznik archiwizacji dla tego stanu jest włączony.
2. Edytuje oryginalną wiadomość na kanale sugestii w embed ze statusem i usuwa wszystkie reakcje. Jeśli oryginalnej wiadomości już nie ma, publikowana jest nowa.
3. Wysyła autorowi sugestii w DM embed z sugestią, powodem i osobą, która zmieniła stan. Potwierdzenie dla moderatora mówi, czy DM dotarł, czy członek miał wyłączone DM-y.
4. Zapisuje nowy stan i osobę, która go zmieniła.
5. Jeśli dla tego stanu ustawiono kanał, publikuje tam embed ze statusem i usuwa poprzednią wiadomość ze statusem dla tej sugestii, więc sugestia przechodząca z Rozważanej do Zaakceptowanej nie zostawia przestarzałej kopii.

Sugestia może przechodzić między stanami dowolną liczbę razy. Nie ma komendy, która przywraca ją do Oczekuje.

### Wiadomość ze statusem

Domyślny embed ze statusem ma autora sugestii jako autora, tytuł taki jak „Suggestion #12 Accepted”, tekst sugestii jako opis i pole **Powód**. Własne ustawisz przez `acceptmessage`, `denymessage`, `considermessage` lub `implementmessage` albo w czterech edytorach na karcie **Wiadomości** w panelu. Użyj `-`, aby wrócić do domyślnej. Własny tekst przechodzi przez parser embedów; jeśli nie jest poprawnym kodem embeda, zostaje użyty jako opis embeda.

## Symbole zastępcze

Wiadomość sugestii (publikowana przy zgłoszeniu) obsługuje poniższe, a także ogólne symbole zastępcze serwera ze strony symboli zastępczych.

| Symbol zastępczy | Wartość |
| --- | --- |
| `%suggest.user%` | Pełna nazwa użytkownika autora sugestii |
| `%suggest.user.name%` | Nazwa użytkownika autora sugestii |
| `%suggest.user.avatar%` | URL awatara autora sugestii |
| `%suggest.message%` | Tekst sugestii, ze zneutralizowanymi wzmiankami |
| `%suggest.number%` | Numer sugestii |

Wiadomości o zaakceptowaniu, odrzuceniu, rozważaniu i zrealizowaniu obsługują wszystkie powyższe, ogólne symbole zastępcze serwera oraz te dodatkowe.

| Symbol zastępczy | Wartość |
| --- | --- |
| `%suggest.user.id%` | ID użytkownika autora sugestii |
| `%suggest.mod.user%` | Pełna nazwa użytkownika moderatora, który zmienił stan |
| `%suggest.mod.name%` | Nazwa użytkownika tego moderatora |
| `%suggest.mod.avatar%` | URL jego awatara |
| `%suggest.mod.Id%` | Jego ID użytkownika (zwróć uwagę na wielkie I) |
| `%suggest.mod.message%` | Podany powód lub „none” |
| `%suggest.emote1count%` do `%suggest.emote5count%` | Liczba głosów na każdą emotkę w chwili zmiany |

> [!EXAMPLE]
> Prosta wiadomość o odrzuceniu: `Suggestion #%suggest.number% by %suggest.user% was denied by %suggest.mod.name%: %suggest.mod.message%`

## Wątki

**Typ wątku** dodaje drugi rząd przycisków do każdej nowej sugestii.

| Typ | Przycisk | Wynik |
| --- | --- | --- |
| Bez wątków (domyślnie) | brak | Brak przycisku dyskusji |
| Wątki zwykłe | Join/Create Public Discussion | Tworzy publiczny wątek o nazwie „Suggestion #N Discussion” na wiadomości sugestii |
| Wątki prywatne | Join/Create Private Discussion | To samo, jako wątek prywatny |

Pierwsze naciśnięcie tworzy wątek i dodaje do niego zarówno autora sugestii, jak i osobę naciskającą. Kolejne naciśnięcia odpowiadają, że wątek już istnieje, i podają do niego link. Dla każdej sugestii śledzony jest jeden wątek, a cztery przełączniki **Archiwizuj po** archiwizują go po ustawieniu odpowiedniego stanu. Zmiana typu wątku dotyczy tylko sugestii opublikowanych później.

## Ustawienia

Strona w panelu ma dwie karty: **Sugestie** i **Ustawienia**. Karta Ustawienia dzieli się na **Ogólne**, **Wiadomości**, **Kanały**, **Archiwizuj** i **Emotki**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Minimalna długość | nie ustawiono | Najkrótsza akceptowana sugestia, w znakach (nie może wynosić 2048 lub więcej; pole w panelu kończy się na 2000) |
| Maksymalna długość | nie ustawiono | Najdłuższa akceptowana sugestia (musi być większa od 0; pole w panelu kończy się na 2000) |
| Typ wątku | Bez wątków | Czy sugestie dostają publiczny lub prywatny przycisk dyskusji |
| Wiadomość sugestii | domyślny embed | Embed publikowany po zgłoszeniu sugestii |
| Wiadomość o zaakceptowaniu / odrzuceniu / rozważaniu / zrealizowaniu | domyślny embed | Embed ze statusem dla każdego stanu |
| Kanał sugestii | brak (funkcja wyłączona) | Gdzie publikowane są sugestie i gdzie wpisane wiadomości zamieniają się w sugestie |
| Kanał zaakceptowanych / odrzuconych / rozważanych / zrealizowanych | brak | Dodatkowy kanał, na który kopiowany jest każdy embed ze statusem |
| Archiwizuj po zaakceptowaniu / odrzuceniu / rozważeniu / zrealizowaniu | wyłączone | Archiwizuje wątek dyskusji przy tym stanie |
| Tryb wyświetlania emotek | Reakcje | Reakcje lub przyciski do głosowania |
| Własne emotki | kciuk w górę i w dół | Do pięciu emotek używanych do głosowania |
| Etykieta przycisku | Suggest Here! | Tekst na przycisku sugestii |
| Emotka przycisku | brak | Emotka na przycisku sugestii |
| Wiadomość przycisku | domyślna zachęta | Tekst lub embed publikowany nad przyciskiem sugestii |
| Kolor przycisku sugestii | Blurple | Kolor przycisku sugestii |
| Przycisk emotki 1 do 5 | Blurple | Kolor każdego przycisku głosowania w trybie przycisków |

> [!WARNING]
> Nic nie działa, dopóki nie ustawisz **Kanału sugestii**. Do tego czasu `suggest` odpowiada, że kanał nie jest ustawiony, i usuwa błąd po trzech sekundach.

Karta **Sugestie** wypisuje każdą sugestię wraz z jej statusem, liczbą głosów i datą, z sortowaniem według daty lub statusu. Każda karta ma przyciski **Zaakceptuj**, **Odrzuć**, **Rozważ** i **Zrealizuj** z opcjonalnym polem z powodem oraz przycisk **Usuń**, który usuwa rekord z bazy danych, nie ruszając wiadomości na Discordzie.

## Konfiguracja krok po kroku

1. Otwórz **Sugestie** w panelu i przejdź na kartę **Ustawienia**.
2. W sekcji **Kanały** wybierz **Kanał sugestii**. Opcjonalnie wybierz osobne kanały dla sugestii zaakceptowanych, odrzuconych, rozważanych i zrealizowanych.
3. W sekcji **Ogólne** ustaw **Minimalną długość** i **Maksymalną długość**, na przykład 10 i 1000, a jeśli chcesz dyskusji nad każdym pomysłem, wybierz **Typ wątku**.
4. W sekcji **Emotki** wybierz **Reakcje** lub **Przyciski** i opcjonalnie wskaż do pięciu **Własnych emotek**. Jeśli chcesz przycisk sugestii, ustaw tutaj jego etykietę, emotkę i wiadomość, a na Discordzie uruchom `suggestbuttonchannel #channel`, aby go opublikować.
5. W sekcji **Archiwizuj** włącz przełączniki archiwizacji dla stanów, które mają zamykać dyskusję.
6. W sekcji **Wiadomości** w razie potrzeby dostosuj embedy ze statusem, używając powyższych symboli zastępczych.
7. Zapisz, a potem przetestuj: uruchom `suggest test idea`, zagłosuj i uruchom `accept 1 looks good`, aby zobaczyć embed ze statusem i DM.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniono).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `suggest <text>` | `suggestion` | Nobody | Zgłasza sugestię |
| `suggestinfo <number>` | `suginfo` | Zarządzanie wiadomościami | Pokazuje szczegóły, liczbę głosów i przyciski stanów sugestii |
| `accept <number> [reason]` | `suggestaccept`, `acceptsuggest` | Zarządzanie wiadomościami | Oznacza sugestię jako zaakceptowaną |
| `deny <number> [reason]` | `suggestdeny`, `denysuggest` | Zarządzanie wiadomościami | Oznacza sugestię jako odrzuconą |
| `consider <number> [reason]` | `suggestconsider`, `considersuggest` | Zarządzanie wiadomościami | Oznacza sugestię jako rozważaną |
| `implemented <number> [reason]` | `suggestimplement`, `implementsuggest` | Zarządzanie wiadomościami | Oznacza sugestię jako zrealizowaną |
| `setsuggestchannel [#channel]` | `suggestchannel`, `suggestchan` | Zarządzanie kanałami | Ustawia kanał sugestii lub wyłącza sugestie, gdy nie podano kanału |
| `suggestclear` | `suggestreset`, `resetsuggestions`, `clearsuggestions` | Administrator | Usuwa wszystkie sugestie i resetuje licznik, po potwierdzeniu |
| `suggestmessage <text>` | `suggestmsg` | Administrator | Własny embed sugestii, `-` resetuje |
| `acceptmessage <text>` | `acceptmsg` | Administrator | Własny embed zaakceptowania, `-` resetuje |
| `denymessage <text>` | `denymsg` | Administrator | Własny embed odrzucenia, `-` resetuje |
| `considermessage <text>` | `considermsg` | Administrator | Własny embed rozważania, `-` resetuje |
| `implementmessage <text>` | `implementmsg` | Administrator | Własny embed zrealizowania, `-` resetuje |
| `acceptchannel [#channel]` | | Administrator | Kanał dla zaakceptowanych sugestii, none wyłącza |
| `denychannel [#channel]` | | Administrator | Kanał dla odrzuconych sugestii, none wyłącza |
| `considerchannel [#channel]` | | Administrator | Kanał dla rozważanych sugestii, none wyłącza |
| `implementchannel [#channel]` | | Administrator | Kanał dla zrealizowanych sugestii, none wyłącza |
| `minsuggestionlength <number>` | `minsuggestlength` | Administrator | Minimalna liczba znaków, musi być mniejsza niż 2048 |
| `maxsuggestionlength <number>` | `maxsuggestlength` | Administrator | Maksymalna liczba znaków, musi być większa od 0 |
| `suggestmotes <emotes>` | `smotes`, `suggestemotes` | Administrator | Do pięciu emotek do głosowania lub `disable` dla kciuka w górę i w dół |
| `suggestmotesmode <reactions/buttons>` | | Administrator | Reakcje lub przyciski do głosowania |
| `suggestmotecolor <number> <colour>` | | Administrator | Kolor przycisku głosowania 1 do 5: `blurple`, `grey`, `green` lub `red` |
| `suggestthreadstype <none/public/private>` | `suggestthreads` | Administrator | Typ wątku dyskusji dla nowych sugestii |
| `archiveonaccept` | | Administrator | Przełącza archiwizację wątku po zaakceptowaniu |
| `archiveondeny` | | Administrator | Przełącza archiwizację wątku po odrzuceniu |
| `archiveonconsider` | | Administrator | Przełącza archiwizację wątku po rozważeniu |
| `archiveonimplement` | | Administrator | Przełącza archiwizację wątku po zrealizowaniu |
| `suggestbuttonchannel <#channel>` | | Administrator | Publikuje przycisk sugestii na kanale |
| `suggestbuttonmessage <text>` | | Administrator | Tekst lub embed nad przyciskiem sugestii, `-` resetuje |
| `suggestbuttonlabel <text>` | | Administrator | Etykieta przycisku do 80 znaków, `-` resetuje |
| `suggestbuttonemote [emote]` | | Administrator | Emotka przycisku, none resetuje |
| `suggestbuttoncolor <colour>` | | Administrator | Kolor przycisku sugestii: `blurple`, `grey`, `green` lub `red` |

Odpowiedniki slash znajdują się pod `/suggestions` i `/suggestions customize`.

## Wskazówki i pułapki

- Bot potrzebuje Zarządzania wiadomościami na kanale sugestii, aby usuwać oryginały, Dodawania reakcji dla trybu reakcji oraz Tworzenia wątków publicznych lub prywatnych dla dyskusji. Kanały statusów potrzebują Osadzania linków, inaczej kopia jest po cichu pomijana.
- Ustaw oba limity długości przed otwarciem kanału. Ścieżka wpisanych wiadomości usuwa wszystko spoza limitów, więc nieustawiony maksimum może pochłonąć każdą wiadomość.
- Członkowie z rolą moderatorską ustawioną w Administracji mogą rozmawiać na kanale sugestii bez zamieniania ich wiadomości w sugestie. Wiadomości wszystkich pozostałych są konwertowane i usuwane.
- Komenda `suggest` respektuje system uprawnień, więc możesz ją zablokować na kanałach lub dla ról zwykłymi komendami uprawnień, a ścieżka wpisanych wiadomości przestrzega tej samej reguły.
- Własne emotki muszą być takimi, których bot może używać. Komenda testuje każdą emotkę, reagując nią, i odrzuca zestaw, jeśli któraś zawiedzie.
- **Usuń** w panelu usuwa tylko rekord z bazy danych. Wiadomość na Discordzie i wszelkie wątki zostają tam, gdzie były.
- `suggestclear` nie da się cofnąć i resetuje numerację do 1.

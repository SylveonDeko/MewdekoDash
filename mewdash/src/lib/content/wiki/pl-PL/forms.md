---
title: Formularze
slug: forms
summary: Twórz w panelu podania, ankiety, odwołania od banów i podania o dołączenie, zbieraj odpowiedzi przez link do udostępniania i zatwierdzaj lub odrzucaj je z Discorda albo z kolejki odpowiedzi.
icon: fa-clipboard
category: Community
dashboard: /dashboard/forms
module: Forms
tags: [forms, application, survey, questionnaire, ban appeal, join application, review, approve, reject, responses, csv, formularze, podanie, ankieta, kwestionariusz, odwołanie od bana, podanie o dołączenie, rozpatrywanie, zatwierdź, odrzuć, odpowiedzi]
related: [administration, moderation, rolestates]
---

## Co robi

Moderatorzy budują formularz w panelu: nazwę, zestaw pytań i reguły dotyczące tego, kto może odpowiadać i co dzieje się potem. Opublikowanie go tworzy stały link do udostępniania. Członek otwiera link, loguje się przez Discord, wypełnia pytania strona po stronie, przegląda swoje odpowiedzi i wysyła. Jego postęp jest zapisywany jako wersja robocza podczas pisania, więc może wrócić później.

Każde zgłoszenie jest publikowane jako embed na wybranym przez Ciebie kanale, z przyciskami **Zatwierdź** i **Odrzuć**, jeśli formularz wymaga decyzji. Osoby rozpatrujące naciskają przycisk na Discordzie albo używają karty **Odpowiedzi** w panelu. Zgłaszający dostaje DM z decyzją i wszelkimi notatkami, a w każdej chwili może śledzić ją na stronie statusu.

Formularze występują w trzech typach. Zwykły formularz jest dla członków. Formularz odwołania od bana jest dla osób aktualnie zbanowanych, a jego zatwierdzenie je odbanowuje. Podanie o dołączenie jest dla osób spoza serwera, a jego zatwierdzenie wysyła im jednorazowe zaproszenie, z rolami czekającymi na nie po dołączeniu.

Formularze nie mają komend. Wszystko poza dwoma przyciskami rozpatrywania dzieje się w panelu.

## Do czego Ci się przyda

- Podania na moderatora, partnerstwa lub eventy z prawdziwą kolejką rozpatrywania zamiast sterty DM-ów.
- Proces odwołań od banów z okresami oczekiwania, limitami prób i automatycznym odbanowaniem po zatwierdzeniu.
- Zamknięta społeczność, w której kandydaci są weryfikowani przed otrzymaniem zaproszenia.
- Ankiety z opiniami z limitem odpowiedzi i eksportem CSV.

## Typy formularzy

| Typ | Kto może wysłać | Po zatwierdzeniu |
| --- | --- | --- |
| Zwykły formularz | Członkowie lub każdy, jeśli włączone jest **Zezwól osobom spoza serwera** | Tylko zmiany ról, jeśli skonfigurowano |
| Odwołanie od bana | Osoby aktualnie zbanowane na serwerze | Ban zostaje zdjęty |
| Podanie o dołączenie | Osoby, których nie ma na serwerze | Tworzone jest zaproszenie, a wszystkie **Role czekające na osobę po dołączeniu** są zapisywane jako stan ról, więc zostaną nadane, gdy osoba dołączy |

Typ jest stały po utworzeniu formularza. Odwołania od banów i podania o dołączenie zawsze przechodzą rozpatrywanie; zwykłe formularze tylko wtedy, gdy włączone jest **Odpowiedzi wymagają akceptacji**.

## Pytania

Pytania dodaje się w kreatorze w sekcji **Pytania**. Typy to:

| Typ | Odpowiedź | Opcje |
| --- | --- | --- |
| Krótki tekst | Jedna linia | Minimalna i maksymalna długość, do 5000 |
| Długi tekst | Kilka linii | Te same limity długości |
| Wybór jednokrotny | Jedna z wymienionych opcji | Do 25 opcji |
| Pola wyboru | Kilka opcji | Do 25 opcji; **Wartość minimalna** i **Wartość maksymalna** ograniczają, ile można zaznaczyć |
| Lista rozwijana | Jedna opcja z listy | Do 25 opcji |
| Liczba | Liczba | Wartość minimalna i maksymalna |
| E-mail | Prawidłowy adres e-mail | |
| URL | Adres `http` lub `https` | |
| Podział sekcji | Nic; zaczyna nową stronę i może mieć tytuł i wstęp | |

Treść pytania jest ograniczona do 500 znaków, tekst zastępczy do 200, a każda odpowiedź do 4000 znaków. Każde pytanie może mieć URL obrazu i być oznaczone jako wymagane. Pytanie może też być wymagane tylko wtedy, gdy wcześniejsza odpowiedź spełnia warunek.

### Wstawianie odpowiedzi

Włącz wstawianie odpowiedzi dla pytania i wpisz `{{Q12}}` w jego treści lub tekście zastępczym, gdzie 12 to ID wcześniejszego pytania. Wcześniejsza odpowiedź zostaje wstawiona, przycięta do 100 znaków. Jeśli nie udzielono odpowiedzi, w jej miejsce pojawia się w nawiasach treść pytania. Pytanie może wstawiać odpowiedzi tylko z pytań powyżej.

### Warunki

Każde pytanie może być pokazywane tylko wtedy, gdy spełniony jest warunek. Ukryte pytania są pomijane na stronie, a wszelkie odpowiedzi przesłane dla nich są odrzucane na serwerze.

| Typ warunku | Pokazywane, gdy |
| --- | --- |
| Oparty na odpowiedziach | Wcześniejsza odpowiedź pasuje: **Jest równe**, **Nie jest równe**, **Zawiera**, **Większe niż** lub **Mniejsze niż** |
| Oparty na rolach | Członek ma **Dowolna z**, **Wszystkie z** lub **Żadna z** wybranych ról |
| Staż na serwerze | Członek jest na serwerze co najmniej N dni lub jego konto ma co najmniej N dni |
| Boost/Nitro | Członek boostuje serwer. Sprawdzenie Nitro to najlepsze przypuszczenie na podstawie awatara i danych o boostach. |
| Oparty na uprawnieniach | Członek ma wszystkie wybrane uprawnienia |
| Wiele warunków | Kilka wierszy połączonych. Wiersze w tej samej grupie muszą być wszystkie prawdziwe (AND); gdy prawdziwa jest dowolna grupa, pytanie jest pokazywane (OR). |

Porównania tekstu ignorują wielkość liter. Większe niż i mniejsze niż porównują liczby.

## Kto może wysłać

Formularz odrzuca osoby, podając powód, w tej kolejności: wciąż jest wersją roboczą, nie przyjmuje odpowiedzi, nie osiągnął jeszcze **Otwiera się**, minął już **Zamyka się**, konto jest młodsze niż **Minimalny wiek konta Discord**, limit **Łączna liczba przyjmowanych odpowiedzi** jest zapełniony, osoba już odpowiedziała, a wielokrotne odpowiedzi są wyłączone, brakuje jej **Rola wymagana do wysłania**, a na końcu reguła typu powyżej.

**Pozwól odrzuconym spróbować ponownie** sprawia, że odrzucona odpowiedź nie liczy się już jako „już odpowiedział(a)”. Jeśli włączone jest **Wymagaj captchy**, na kroku przeglądu pojawia się weryfikacja Cloudflare Turnstile.

Odwołania od banów mają własne limity w sekcji **Limity odwołań**: czas oczekiwania po banie (liczony od wpisu banu w dzienniku audytu), maksymalną liczbę odwołań, odstęp między odwołaniami oraz **Jedno odrzucenie jest ostateczne**. Odwołanie, które wciąż oczekuje, blokuje nowe.

## Wypełnianie formularza

Publiczna strona wymaga logowania przez Discord. Odpowiedzi są zapisywane jako wersja robocza około półtorej sekundy po ostatnim naciśnięciu klawisza oraz przy przejściu na następną stronę. Powrót w ciągu 30 dni przywraca wersję roboczą z banerem „Przywróciliśmy to, co już napisałeś(-aś)” i przyciskiem **Zacznij od nowa**.

Pasek postępu pokazuje udzielone odpowiedzi. Ostatnia strona kończy się przyciskiem **Przejrzyj i kontynuuj**, który wypisuje każdą odpowiedź z linkiem **Edytuj**, a następnie **Potwierdź i wyślij**. Potem strona pokazuje Twoją **Wiadomość po wysłaniu** (lub domyślną dla danego typu) oraz link **Sprawdź swój status**. Strona statusu prowadzi też do **Moje zgłoszenia** pod `/forms/submissions`, gdzie wypisane są wszystkie nieanonimowe odpowiedzi zalogowanego użytkownika ze wszystkich serwerów.

Zgłaszający mogą edytować swoje odpowiedzi ze strony statusu, dopóki odpowiedź wciąż oczekuje, o ile formularz nie jest anonimowy i nie został zamknięty. Wcześniejsze odpowiedzi są zachowywane jako wersje. Zgłaszający nie ma możliwości wycofania odpowiedzi.

## Co dzieje się po wysłaniu

1. Nadawane są role z **Role nadawane po wysłaniu** oraz **Rola na czas rozpatrywania**.
2. Jeśli ustawiono **Gdzie publikować odpowiedzi**, publikowany jest tam embed pokazujący użytkownika (lub „Anonymous (login required)”), czas i do 20 odpowiedzi, z oznaczeniem **Oznacz w ogłoszeniu**, gdy nadejdzie odpowiedź. Przyciski Approve i Reject są dołączane, gdy formularz jest rozpatrywany.
3. Jeśli ustawiono **Wyślij do webhooka**, ten sam embed jest publikowany do tego webhooka, bez przycisków. Gdy odpowiedź zostanie później zatwierdzona lub odrzucona, do webhooka trafia też druga wiadomość z wynikiem, osobą rozpatrującą i powodem. URL musi być webhookiem Discorda; wszystko inne jest ignorowane z ostrzeżeniem w logu bota, a webhook, który zawiedzie, nigdy nie blokuje zgłoszenia.
4. Odpowiedź pojawia się na karcie **Odpowiedzi** ze statusem Oczekuje na rozpatrzenie.

Formularze anonimowe nie zapisują ID użytkownika, więc nie mogą zmieniać ról, a ich odpowiedzi nie można edytować.

## Proces rozpatrywania

Odpowiedzi przechodzą z Oczekuje na rozpatrzenie do Zatwierdzone lub Odrzucone. **Kto może akceptować lub odrzucać** wskazuje rolę; każdy z Zarządzaniem serwerem lub Administratorem zawsze może decydować. Jeśli nie ustawiono roli rozpatrującego, mogą też decydować osoby z rolami akceptacji.

Na Discordzie **Zatwierdź** rozstrzyga natychmiast. **Odrzuć** otwiera okno z prośbą o powód, który jest wymagany, bo jest wysyłany zgłaszającemu. W obu przypadkach embed zmienia kolor, zyskuje pole **Zatwierdzono** lub **Odrzucone** z osobą rozpatrującą i czasem, powodem (jeśli jest) i traci przyciski. W panelu tę samą decyzję podejmuje się z kolejki, korzystając z pola **Notatki dla nadawcy**.

Po decyzji bot:

- Dodaje i usuwa role z **Dodaj po akceptacji**, **Usuń po akceptacji**, **Dodaj po odrzuceniu** i **Usuń po odrzuceniu** oraz zawsze usuwa rolę oczekiwania. Rola wymieniona po obu stronach jest usuwana.
- Odbanowuje użytkownika przy zatwierdzonym odwołaniu od bana albo tworzy zaproszenie przy zatwierdzonym podaniu o dołączenie.
- Wysyła zgłaszającemu DM „Your response was approved” lub „Your response was not accepted” z notatkami, Twoją **Wiadomość po wysłaniu** przy zatwierdzeniu oraz zaproszeniem. Jeśli DM się nie powiedzie, informuje o tym embed i kolejka.

Emotki przycisków rozpatrywania pochodzą z formularza, potem z **Domyślnych serwera** na karcie **Ustawienia**, a na końcu to zwykły ptaszek i krzyżyk.

## Wersje

Każdy zapis formularza zachowuje wersję, do ostatnich 20. **Historia wersji** pokazuje każdą z nich z różnicami w ustawieniach i pytaniach oraz przyciskiem **Przywróć tę wersję**. Przywrócenie odtwarza pytania z nowymi ID i przepisuje warunki oraz wstawianie odpowiedzi, aby pasowały.

## Ustawienia

Strona **Formularze** ma karty **Formularze**, **Utwórz** i **Ustawienia**, a po wybraniu formularza także **Edytuj** i **Odpowiedzi**. Karty Utwórz i Edytuj współdzielą jeden panel ustawień.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Nazwa | puste, wymagane | Tytuł formularza, do 255 znaków |
| Opis | puste | Wyświetlany pod tytułem i w podglądach linków na Discordzie |
| Gdzie publikować odpowiedzi | brak | Kanał dla embeda ze zgłoszeniem; puste zostawia odpowiedzi tylko w panelu |
| Wiadomość po wysłaniu | brak | Tekst na stronie potwierdzenia i w DM po zatwierdzeniu |
| Wersja robocza | włączone dla nowych formularzy | Do wersji roboczych nie można wysyłać odpowiedzi |
| Przyjmowanie odpowiedzi | włączone | Wyłącz, aby zamknąć bez usuwania |
| Rola wymagana do wysłania | Ktokolwiek na serwerze | Ogranicza dostęp rolą |
| Minimalny wiek konta Discord | Bez limitu | Dni |
| Zezwól osobom spoza serwera | wyłączone | Tylko zwykłe formularze |
| Wysyłanie anonimowo | wyłączone | Nie zapisuje nadawcy |
| Otwiera się, Zamyka się | brak | Okno czasowe; ogłoszenie startu wymaga czasu otwarcia |
| Łączna liczba przyjmowanych odpowiedzi | Bez limitu | Limit dla wszystkich razem |
| Zezwól na więcej niż jedną odpowiedź na osobę | wyłączone | |
| Pozwól odrzuconym spróbować ponownie | wyłączone | |
| Wymagaj captchy | wyłączone | Turnstile na kroku przeglądu |
| Ogłoś otwarcie na kanale, Oznacz w ogłoszeniu, Treść ogłoszenia | brak | Embed startowy z odliczaniem do zamknięcia, wysyłany w ciągu około minuty od **Otwiera się** lub przy publikacji |
| Oznacz w ogłoszeniu | brak | Rola oznaczana przy każdym zgłoszeniu |
| Role nadawane po wysłaniu | brak | Nadawane od razu |
| Rola na czas rozpatrywania | brak | Usuwana po decyzji |
| Wyślij do webhooka | brak | URL webhooka Discorda, który otrzymuje też każdy embed ze zgłoszeniem i każdą decyzję o zatwierdzeniu lub odrzuceniu |
| Odpowiedzi wymagają akceptacji | wyłączone | Dodaje rozpatrywanie do zwykłego formularza |
| Kto może akceptować lub odrzucać | Tylko Zarządzanie serwerem | Rola rozpatrujących |
| Emotka przycisku akceptacji, Emotka przycisku odrzucenia | domyślna serwera | |
| Dodaj/Usuń po akceptacji, Dodaj/Usuń po odrzuceniu | brak | Zmiany ról po decyzji |
| Jedno odrzucenie jest ostateczne, Odczekaj po banie, Dozwolone odwołania, Odstęp między odwołaniami | wyłączone, Bez czekania, Bez limitu, Bez czekania | Tylko odwołania od banów |
| Liczba użyć zaproszenia, Zaproszenie wygasa po (sekundach), Role czekające na osobę po dołączeniu | 1, 86400, brak | Tylko podania o dołączenie |

Ustawienia, które nie dotyczą typu formularza, są odrzucane przy zapisie.

## Konfiguracja krok po kroku

1. Otwórz **Formularze** w panelu i naciśnij **Utwórz**.
2. Wybierz **Typ formularza**. Nie można go później zmienić.
3. Wypełnij **Nazwę** i **Opis** oraz wybierz **Gdzie publikować odpowiedzi**.
4. W sekcji **Pytania** dodaj pytania, oznacz wymagane i użyj **Dodaj stronę**, aby podzielić długie formularze.
5. Ustaw, kto może wysyłać, a jeśli chcesz kroku rozpatrywania, włącz **Odpowiedzi wymagają akceptacji** i wybierz **Kto może akceptować lub odrzucać**.
6. Naciśnij **Zapisz formularz**. Użyj **Podgląd** na karcie formularza, aby przejść przez niego jako administrator.
7. Naciśnij **Opublikuj** na karcie, następnie **Kopiuj link** i opublikuj link tam, gdzie kandydaci go znajdą.
8. Obserwuj kartę **Odpowiedzi** lub kanał zgłoszeń i rozstrzygaj każdą odpowiedź.

## Komendy

Formularze nie mają komend tekstowych ani slash. Jedyną interakcją na Discordzie są przyciski **Zatwierdź** i **Odrzuć** na każdym embedzie ze zgłoszeniem.

## Wskazówki i pułapki

- Bot potrzebuje Zarządzania rolami, a jego rola musi być nad każdą rolą, którą formularz nadaje lub zabiera. Role wyżej niż bot, role zarządzane i everyone są po cichu pomijane.
- Odwołania od banów potrzebują Wyświetlania dziennika zdarzeń do sprawdzenia „odczekaj po banie”. Odbanowanie wymaga Banowania członków, a zaproszenia do podań o dołączenie wymagają Tworzenia zaproszeń na kanale widocznym dla wszystkich.
- Embed ze zgłoszeniem pokazuje najwyżej 20 odpowiedzi; pełna odpowiedź jest w panelu.
- **Eksportuj CSV** na karcie Odpowiedzi zawiera jedną kolumnę na pytanie, z odpowiedziami wielokrotnego wyboru oddzielonymi średnikami.
- Filtr odpowiedzi i strona są częścią adresu URL, więc możesz dodać do zakładek „tylko oczekujące” i udostępnić to osobom rozpatrującym.
- Wersje robocze nigdy nie są walidowane, więc przywrócona wersja robocza może nadal nie przejść walidacji przy wysyłaniu.
- Wygasłe formularze są zamykane przez sprawdzenie uruchamiane co minutę; kwalifikacja jest też sprawdzana przy wysyłaniu, więc nic nie prześlizgnie się w międzyczasie.

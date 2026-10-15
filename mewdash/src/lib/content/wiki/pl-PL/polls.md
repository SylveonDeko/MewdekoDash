---
title: Ankiety
slug: polls
summary: Publikuj ankiety z przyciskami na kanale, ograniczaj, kto może głosować, planuj je z wyprzedzeniem, używaj szablonów i przeglądaj wyniki.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/polls
module: Games
tags: [poll, vote, survey, question, yes no, multiple choice, anonymous, scheduled poll, poll template, ankieta, głosowanie, sondaż, pytanie, tak nie, wielokrotny wybór, anonimowa, zaplanowana ankieta, szablon ankiety]
related: [votes, games]
---

## Co robi

Staff zadaje pytanie z dwiema do dwudziestu pięciu opcjami. Bot wysyła embed z przyciskiem przy każdej opcji, a gdy opcji jest więcej niż pięć, menu wyboru. Członkowie głosują, klikając. Embed pokazuje na żywo liczbę głosów i procent dla każdej opcji. Pod opcjami są trzy przyciski zarządzania: **Statystyki**, **Zamknij** i **Usuń**.

Członkowie mogą zmienić głos, klikając inną opcję, albo go usunąć, klikając ponownie tę samą, chyba że w danej ankiecie wyłączono zmianę głosu. Każda odpowiedź bota na kliknięcie jest prywatna dla głosującego, więc kanał pozostaje czysty.

Ankiety można zamknąć ręcznie, mogą same wygasnąć po ustawionym czasie i można je zaplanować na późniejszą publikację. Szablony zapisują pytanie i opcje, dzięki czemu tę samą ankietę można opublikować ponownie jedną komendą. Panel dodaje analitykę, eksport CSV i JSON oraz porównywanie ankiet obok siebie.

## Po co to używać

- Wybierz datę albo grę na najbliższe wydarzenie społeczności.
- Zrób szybką ankietę tak/nie przed zmianą zasad.
- Zadaj wrażliwe pytanie anonimowo, aby nikt nie widział, kto na co głosował.
- Pozwól głosować w decyzjach, które dotyczą konkretnej grupy, tylko roli staffu albo roli boostera.
- Publikuj tę samą cotygodniową ankietę każdy poniedziałek z szablonu albo zaplanuj ją z wyprzedzeniem.

## Typy ankiet

| Typ | Jak się głosuje |
| --- | --- |
| Tak / Nie | Dwie stałe opcje: Tak i Nie. Tworzona przez `poll` i `/poll yesno`. |
| Jednokrotny wybór | Jedna opcja na członka. Domyślna dla `pollc`, szablonów i panelu. |
| Wielokrotny wybór | Członkowie mogą wybrać kilka opcji. Przy sześciu lub więcej opcjach menu wyboru pozwala zaznaczyć wiele. |
| Anonimowa | Głosy są zapisywane bez pokazywania głosującego w statystykach i eksportach. |
| Ograniczona do ról | Głosować mogą tylko członkowie posiadający jedną z dozwolonych ról. Inni dostają prywatną odpowiedź „niedozwolone”. Tylko w panelu. |

Każda ankieta ma też przełączniki dla pojedynczej ankiety, wszystkie domyślnie włączone: **Zezwalaj na zmianę głosu**, **Pokaż wyniki na żywo** i **Pokaż paski postępu**.

## Głosowanie, zamykanie i wygasanie

- Głos w zamkniętej lub wygasłej ankiecie jest odrzucany prywatną wiadomością.
- Jeśli zmiana głosu jest wyłączona, drugie kliknięcie jest odrzucane jako „już zagłosowano”.
- Przyciski **Zamknij** i **Usuń** działają dla twórcy ankiety i każdego, kto ma uprawnienie Zarządzanie wiadomościami. **Usuń** prosi o wpisanie `DELETE` w formularzu potwierdzenia, a potem usuwa ankietę i jej wiadomość.
- **Statystyki** pokazują łączną liczbę głosów, unikalnych głosujących i podział na opcje, prywatnie dla osoby, która kliknęła.
- Wygasanie jest sprawdzane co pięć minut. Gdy ankieta wygasa, jej przyciski są usuwane, a stopka zmienia się, aby pokazać, że ankieta wygasła.
- Zaplanowane ankiety są sprawdzane co minutę. Zaplanowany czas musi być w przyszłości i nie dalej niż trzydzieści dni. Ankieta może mieć czas trwania w minutach, po którym opublikowana ankieta wygasa.

## Szablony

Szablon zapisuje nazwę, pytanie i opcje. `polltemplate <name>` publikuje go jako ankietę z jednokrotnym wyborem. Szablony wyświetla `polltemplates`, tworzy i usuwa się przez `/poll create-template` i `/poll delete-template`, albo zarządza nimi w karcie **Szablony** w panelu, która obsługuje też eksport i import jako plik. Szablon może mieć najwyżej dwadzieścia pięć opcji.

## Ustawienia

Strona Ankiety ma pięć kart: **Ankiety**, **Utwórz**, **Zaplanowane**, **Szablony** i **Analityka**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Pytanie | brak | Tytuł ankiety |
| Typ ankiety | Jednokrotny wybór | Jeden z pięciu typów powyżej |
| Kanał | brak | Gdzie ankieta jest publikowana |
| Opcje | dwie puste | Od dwóch do dwudziestu pięciu opcji, każda do 100 znaków. Ukryte dla Tak / Nie |
| Role uprawnione do głosowania | brak | Widoczne dla ankiet ograniczonych do ról |
| Czas trwania (minuty) | otwarta do zamknięcia | Od 1 do 20160 minut. Stosowane przy zaplanowaniu ankiety |
| Zaplanuj na później | brak | Data i godzina. Zostaw puste, aby opublikować od razu |
| Zezwalaj na zmianę głosu | włączone | Czy członek może zmienić lub usunąć swój głos |
| Pokaż wyniki na żywo | włączone | Czy liczby są widoczne, gdy ankieta trwa |
| Pokaż paski postępu | włączone | Czy obok liczb rysowane są paski |
| Zapisz też jako szablon | wyłączone | Zapisuje pytanie i opcje pod **Nazwa szablonu** |

Karta **Ankiety** listuje ankiety z polem wyboru **Uwzględnij zamknięte ankiety**. Rozwinięcie ankiety pokazuje unikalnych głosujących, uczestnictwo, godzinę szczytu i czas utworzenia oraz oferuje **Zamknij ankietę**. Karta **Zaplanowane** pozwala **Anulować** oczekującą ankietę. **Analityka** pokazuje ankiety w tym miesiącu, oddane głosy, średnią liczbę głosów na ankietę, ulubiony typ i wykres liczby ankiet na dzień.

## Konfiguracja krok po kroku

1. Otwórz **Ankiety** w panelu i przejdź do karty **Utwórz**.
2. Wpisz **Pytanie**, wybierz **Typ ankiety** i **Kanał**.
3. Uzupełnij **Opcje**. Użyj przycisku usuwania, aby usunąć nadmiarowe; potrzebne są co najmniej dwie.
4. W ankiecie ograniczonej do ról wybierz **Role uprawnione do głosowania**.
5. Opcjonalnie zaznacz **Zapisz też jako szablon** i podaj nazwę.
6. Kliknij przycisk zatwierdzenia. Ankieta zostanie opublikowana od razu albo trafi do kolejki na karcie **Zaplanowane**, jeśli ustawisz czas.
7. Obserwuj wyniki na karcie **Ankiety**, a gdy skończysz, kliknij **Zamknij ankietę**.

> [!TIP]
> Do szybkiej ankiety na kanale nie potrzebujesz panelu. `poll Should we add a movie night?` publikuje ankietę tak/nie w kilka sekund.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `poll <question>` | `ppoll` | Zarządzanie wiadomościami | Publikuje ankietę tak/nie |
| `pollc <question;option1;option2;...>` | | Zarządzanie wiadomościami | Publikuje ankietę z jednokrotnym wyborem i od dwóch do dwudziestu pięciu opcjami |
| `pollm <question;option1;option2;...>` | | Zarządzanie wiadomościami | Publikuje ankietę z wielokrotnym wyborem |
| `polla <question;option1;option2;...>` | | Zarządzanie wiadomościami | Publikuje anonimową ankietę |
| `polltemplate <name>` | `ptemplate` | Zarządzanie wiadomościami | Publikuje ankietę z zapisanego szablonu |
| `polltemplates` | `ptemplates` | Nikt | Wyświetla szablony serwera |

Komendy slash pod `/poll` dodają `create` (do dziesięciu opcji, z przełącznikami anonimowości i wielokrotnego wyboru), `close`, `stats`, `list`, `create-template` i `delete-template`. `close`, `create-template` i `delete-template` wymagają Zarządzania wiadomościami.

## Wskazówki i pułapki

- Bot potrzebuje uprawnień Wysyłanie wiadomości i Osadzanie linków na kanale ankiet. Komendy tekstowe usuwają też Twoją wiadomość z komendą, a do tego bot potrzebuje Zarządzania wiadomościami.
- Opcje są rozdzielane średnikami, więc opcja nie może zawierać średnika.
- Etykiety przycisków pokazują tekst opcji tylko wtedy, gdy ma dwanaście znaków lub mniej; dłuższe opcje pokazują sam numer, a pełny tekst jest w embedzie.
- Czas trwania stosuje harmonogram. Ankieta opublikowana od razu zostaje otwarta, aż ktoś ją zamknie, więc jeśli potrzebujesz automatycznego wygaśnięcia, zaplanuj ją na minutę do przodu.
- Zamkniętą ankietę nadal można przeglądać i eksportować z panelu, gdy zaznaczone jest **Uwzględnij zamknięte ankiety**; usunięta ankieta znika na dobre.
- Ankiety ograniczone do ról sprawdzają role w chwili głosowania, więc członkowie, którzy stracili rolę, nie mogą już głosować, ale ich wcześniejszy głos pozostaje.

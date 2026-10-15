---
title: Dostęp do panelu
slug: access
summary: Pozwól wybranym członkom lub rolom otwierać panel Twojego serwera i wyświetlać lub zarządzać tylko wybranymi przez Ciebie sekcjami, bez czynienia ich administratorami Discorda.
icon: fa-key
category: Security
dashboard: /dashboard/access
tags: [dashboard access, permissions, grant, staff, restrict, who can edit, view, manage, managers, delegation, dostęp do panelu, uprawnienia, przyznawanie dostępu, staff, ograniczanie, kto może edytować, wyświetlanie, zarządzanie, zarządcy, delegowanie]
related: [auditlog, administration]
---

## Co robi

Domyślnie tylko właściciel serwera i członkowie z uprawnieniem Administrator mogą otworzyć serwer w panelu. Dostęp do panelu pozwala to poszerzyć. Wybierasz członka albo rolę, wybierasz, które sekcje panelu dostaną, i to, czy każda z nich ma poziom **Wyświetlanie**, czy **Zarządzanie**. Od tej pory serwer pojawia się na liście serwerów w ich panelu, a przyznane sekcje działają dla nich; wszystko inne jest odrzucane.

Sprawdzenie odbywa się w API bota, a nie tylko na stronie. Każde żądanie wskazujące serwer niesie tożsamość zalogowanego użytkownika. Jeśli to właściciel lub Administrator, żądanie przechodzi. W przeciwnym razie bot sprawdza sekcję, do której należy żądanie, traktuje odczyty jako **Wyświetlanie**, a każdą zmianę jako **Zarządzanie**, i porównuje to z najwyższym poziomem, jaki użytkownik ma bezpośrednio albo przez którąkolwiek ze swoich ról.

Właściciel serwera decyduje też, kto może edytować samą listę dostępów. Domyślnie tylko właściciel. Może wyznaczyć konkretnych zarządców dostępu albo jednym przełącznikiem pozwolić każdemu z uprawnieniem Administrator lub Zarządzanie serwerem to robić.

## Po co to używać

- Zespół społeczności prowadzi giveaways, sugestie i tickety z panelu, nie mając uprawnienia Administrator w Discordzie.
- Rola moderatora dostaje **Zarządzanie** w Moderacji i Logowaniu oraz **Wyświetlanie** w pozostałych, więc może oglądać, ale nie zmieniać ustawień, których nie prowadzi.
- Pomocnik bota jest zaufany przy edycji XP i Waluty, ale nie przy niczym związanym z bezpieczeństwem.
- Właściciel deleguje utrzymanie listy dostępów roli współwłaściciela, nie oddając kontroli zarezerwowanych dla właściciela.

## Poziomy dostępu

| Poziom | Pozwala na |
| --- | --- |
| Brak | Nic w danej sekcji; sekcja nie jest przyznana |
| Wyświetlanie | Tylko żądania odczytu, takie jak otwieranie strony i ładowanie jej danych |
| Zarządzanie | Wszystko, co pozwala Wyświetlanie, plus tworzenie, edytowanie i usuwanie |

Gdy członek pasuje do więcej niż jednego przyznania, na przykład osobistego i przez rolę, dla każdej sekcji wygrywa najwyższy poziom. Członek z co najmniej jedną przyznaną sekcją widzi serwer w przełączniku serwerów w panelu; członek bez żadnych przyznań go nie widzi.

Właściciele i Administratorzy całkowicie omijają przyznania i zawsze mają pełny dostęp.

## Sekcje

Sekcje odpowiadają pasku bocznemu panelu. Każda funkcja w wyborze mapuje się na jeden lub więcej obszarów API bota, więc przyznanie „Administracja” obejmuje endpointy Administracji i Ochrony, a „Moderacja” obejmuje też Ochronę. Wybór grupuje sekcje według kategorii paska bocznego, a funkcje będące globalną infrastrukturą bota, a nie danymi na poziomie serwera, takie jak Wydajność, nie mogą być przyznawane.

Gdy przyznanie obejmuje funkcję mapującą się na kilka obszarów, wybór pokazuje najniższy poziom wspólny dla nich; ustawienie grupy ustawia od razu wszystkie jej obszary.

## Kto może zarządzać listą dostępów

| Kto | Może |
| --- | --- |
| Właściciel serwera | Wszystko: przełącznik delegowania, listę zarządców i wszystkie przyznania |
| Wyznaczeni zarządcy dostępu | Dodawać, edytować i usuwać przyznania |
| Administratorzy lub członkowie z Zarządzaniem serwerem | Dodawać, edytować i usuwać przyznania, tylko gdy przełącznik delegowania jest włączony |
| Wszyscy inni | Widzą „Nie możesz tu zarządzać dostępem do panelu” |

Zarządcy dostępu mogą być członkiem albo rolą. Tylko właściciel może zobaczyć lub zmienić listę zarządców i przełącznik delegowania; API odrzuca te wywołania od każdego innego.

> [!WARNING]
> Przyznanie **Zarządzanie** w sekcji Dostęp do panelu jest niemożliwe, ponieważ kontroler dostępu jest zwolniony z kontroli sekcji. Zamiast tego użyj listy zarządców albo przełącznika delegowania, aby oddać komuś kontrolę nad listą.

## Ustawienia

Wszystko znajduje się na jednej stronie **Dostęp do panelu**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Pozwól administratorom i osobom z uprawnieniem Zarządzanie serwerem zarządzać dostępem do panelu | Wyłączone | W **Ustawieniach delegowania**. Gdy włączone, członkowie z Administratorem i Zarządzaniem serwerem mogą edytować przyznania. Tylko właściciel. |
| Zarządcy dostępu | brak | Członkowie lub role wyznaczone do edytowania przyznań. Tylko właściciel. |
| Przyznane dostępy | brak | Jeden wpis na członka lub rolę, z poziomem dla każdej sekcji. Zarządcy i właściciel. |

Formularz **Przyznaj ograniczony dostęp** przyjmuje typ celu (użytkownik lub rola), cel i poziom dla każdej grupy funkcji. Zapisanie drugiego przyznania dla tego samego celu zastępuje pierwsze. Edycja istniejącego przyznania otwiera ten sam formularz jako **Edytuj przyznany dostęp**.

## Konfiguracja krok po kroku

1. Otwórz **Dostęp do panelu** w panelu jako właściciel serwera.
2. Zdecyduj, kto prowadzi listę. Włącz przełącznik w **Ustawieniach delegowania** albo dodaj członka lub rolę w **Zarządcach dostępu**.
3. W **Przyznaj ograniczony dostęp** wybierz **Rola** i wskaż rolę staffu.
4. Ustaw **Zarządzanie** dla funkcji, którymi zajmują się na co dzień, i **Wyświetlanie** dla tych, które mają tylko przeglądać. Resztę zostaw na **Brak**.
5. Kliknij **Przyznaj dostęp**. Przyznanie pojawi się w **Przyznanych dostępach**.
6. Poproś członka z tą rolą o zalogowanie się do panelu. Serwer powinien pojawić się na jego liście, z działającymi tylko przyznanymi stronami.

## Komendy

Dostęp do panelu konfiguruje się wyłącznie w panelu; nie ma dla niego komend bota.

## Wskazówki i pułapki

- Przyznania są sprawdzane względem zbuforowanej listy członków bota, więc członek musi być na serwerze i widoczny dla bota, aby jego przyznanie działało.
- Przyznania ról śledzą aktualne role członka. Usunięcie roli natychmiast usuwa dostęp.
- Przyznanie z każdą sekcją ustawioną na **Brak** liczy się jako brak przyznania i zostaje usunięte, a członek traci serwer w przełączniku.
- Administratorzy zachowują pełny dostęp niezależnie od przyznań. Aby kogoś ograniczyć, najpierw usuń mu Administratora w Discordzie, a potem przyznaj tutaj to, czego potrzebuje.
- Proxy panelu dołącza wspólny klucz API do każdego żądania, ale sam ten klucz nigdy nie daje dostępu do serwera; zawsze wymagana jest tożsamość zalogowanego użytkownika.
- Endpointy niepowiązane z serwerem, takie jak globalna lista komend, nie podlegają sprawdzeniom sekcji i nadal działają dla użytkowników z ograniczonym dostępem.

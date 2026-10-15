---
title: Opinie o odejściu
slug: leave-feedback
summary: Gdy serwer usuwa bota, jego właściciel dostaje wiadomość prywatną z pytaniem, dlaczego. Odpowiedzi są zbierane na stronie w panelu dostępnej tylko dla właściciela.
icon: fa-comments
category: Analytics
dashboard: /owner/leave-feedback
tags: [leave feedback, kick feedback, why removed, churn, exit survey, owner only, bot owner, opinie o odejściu, opinie o wyrzuceniu, dlaczego usunięto, odpływ, ankieta wyjścia, tylko właściciel, właściciel bota]
related: [invites]
---

## Co to robi

Za każdym razem, gdy bot zostanie wyrzucony z serwera lub z niego wyjdzie, wysyła właścicielowi serwera krótką wiadomość prywatną. Zawiera listę rozwijaną z typowymi powodami, przycisk **Napisz coś**, który otwiera pole tekstowe, oraz przycisk **Nie, dziękuję**. Odpowiedź jest opcjonalna, a wiadomość to mówi.

Każda odpowiedź jest zapisywana wraz z nazwą serwera, liczbą jego członków, właścicielem i tym, jak długo bot był na serwerze. Jeśli ustawiony jest kanał zgłoszeń, tam też publikowany jest embed podsumowania, który zostaje zaktualizowany, gdy właściciel doda później komentarz.

To funkcja na poziomie bota. Nie ma ustawienia per serwer, a strona w panelu pojawia się tylko dla właściciela bota.

> [!NOTE]
> Tylko właściciel bota widzi stronę Opinie o odejściu. Inni użytkownicy panelu nie mają jej w pasku bocznym i nie mogą jej otworzyć.

## Po co z tego korzystać

- Dowiedz się, czy serwery odchodzą z powodu brakujących funkcji, problemów z konfiguracją czy kwestii niezawodności.
- Wychwyć serwery, które dodały bota tylko po to, by go przetestować, i ignoruj ich odejście.
- Skontaktuj się z właścicielami, którzy napisali komentarz i zostawili dane kontaktowe.
- Śledź, jak często właściciele w ogóle odpowiadają.

## Treść wiadomości

Wiadomość prywatna nosi tytuł „Szkoda, że odchodzę!” i wyjaśnia, że bot został właśnie usunięty z wymienionego serwera. Lista rozwijana oferuje te powody w tej kolejności:

| Klucz powodu | Pokazywane właścicielowi |
| --- | --- |
| `not_needed` | Już tego nie potrzebowaliśmy |
| `confusing` | Zbyt skomplikowane w konfiguracji |
| `missing_features` | Brakowało funkcji, których chcieliśmy |
| `unreliable` | Był zepsuty albo niestabilny |
| `other_bot` | Przeszliśmy na inny bot |
| `temporary` | Tymczasowo, dodam go z powrotem |
| `testing` | Tylko coś testowałem |

Wybór powodu zapisuje go od razu i ponownie pokazuje pole tekstowe. Pole tekstowe to jednoakapitowe pole „Co moglibyśmy zrobić lepiej?”, ograniczone do 1000 znaków. **Nie, dziękuję** oznacza wpis jako odrzucony, i nigdy nie jest on raportowany.

Zasady, które pozwalają uniknąć irytacji:

- Serwer jest pytany najwyżej raz na trzydzieści dni, bez względu na to, ile razy doda i usunie bota.
- Jeśli wiadomości prywatne właściciela są zamknięte, nic nie jest zapisywane.
- Gdy funkcja jest wyłączona, nic nie jest wysyłane.

## Statusy

Każdy wpis trafia do jednego z trzech stanów, po których filtruje się panel.

| Status | Znaczenie |
| --- | --- |
| Odpowiedziano | Właściciel wybrał powód albo napisał komentarz |
| Odrzucono | Właściciel nacisnął **Nie, dziękuję** |
| Brak odpowiedzi | Wiadomość została wysłana, a nic jeszcze nie wróciło |

## Ustawienia

Strona ma dwie zakładki: **Odpowiedzi** i **Ustawienia**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Pytaj właścicieli, dlaczego bot został usunięty | włączone | Czy wiadomość w ogóle jest wysyłana |
| ID kanału zgłoszeń | puste | Kanał, który otrzymuje embed podsumowania za każdą odpowiedź. Puste przechodzi na kanał dołączeń/wyjść bota. |

Pod polem kanału strona pokazuje, do którego kanału i serwera prowadzi ID, oraz czy bot może do niego dotrzeć.

Zakładka **Odpowiedzi** ma sześć liczników: **Wysłane zapytania**, **Odpowiedziano**, **Z komentarzem**, **Odrzucono**, **Brak odpowiedzi** i **Odsetek odpowiedzi**, zestawienie **Podane powody** oraz tabelę z kolumnami **Odejście**, **Serwer**, **Powód** i **Status**. Możesz filtrować po powodzie i statusie (filtr statusu ma też opcję **Zostawiono komentarz**), szukać po nazwie serwera lub treści komentarza, otworzyć wiersz, aby przeczytać pełny komentarz, i usunąć wpis. **Odsetek odpowiedzi** liczy razem odpowiedzi i odrzucone zapytania.

## Przewodnik konfiguracji

1. Zaloguj się do panelu kontem właściciela bota i otwórz **Opinie o odejściu**.
2. Na zakładce **Ustawienia** sprawdź, czy **Pytaj właścicieli, dlaczego bot został usunięty** jest włączone. Jest domyślnie.
3. Wklej ID kanału w **ID kanału zgłoszeń** i kliknij **Zapisz kanał** albo zostaw pole puste, aby użyć kanału dołączeń/wyjść.
4. Usuń bota z testowego serwera, którego jesteś właścicielem, i odpowiedz na wiadomość prywatną.
5. Sprawdź zakładkę **Odpowiedzi** oraz kanał zgłoszeń, czy pojawił się wpis.

## Komendy

Ta funkcja działa tylko w panelu. Nie ma komend bota; właściciele odpowiadają przyciskami i listą rozwijaną w wiadomości prywatnej.

## Wskazówki i pułapki

- Bot wysyła wiadomość tylko do osoby, którą Discord wymienia jako właściciela serwera, a nie do tego, kto go wyrzucił.
- Trzydziestodniowy czas odnowienia dotyczy każdego serwera osobno, więc serwer, który ponownie doda bota i usunie go w tym oknie, nie zostanie zapytany drugi raz.
- Embed podsumowania trafia na skonfigurowany kanał albo na kanał dołączeń/wyjść z credentials bota, gdy żaden kanał nie jest ustawiony. Jeśli nie ma żadnego z nich, odpowiedzi są nadal zapisywane i widoczne na stronie.
- Usunięcie wpisu w panelu nie usuwa embeda już opublikowanego na kanale zgłoszeń.

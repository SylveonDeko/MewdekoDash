---
title: Dziennik audytu
slug: auditlog
summary: Zapis tego, kto używał panelu dla Twojego serwera, co oglądał i co zmienił, przechowywany przez dziewięćdziesiąt dni.
icon: fa-clipboard-check
category: Security
dashboard: /dashboard/auditlog
tags: [audit, history, accountability, dashboard access, who changed, log, changes, before and after, dziennik audytu, historia, odpowiedzialność, dostęp do panelu, kto zmienił, dziennik, zmiany, przed i po]
related: [logging, administration, channel-access]
---

## Co robi

Każde żądanie, które panel wysyła do bota dla Twojego serwera, jest zapisywane na koncie Discord, które było zalogowane. Strona Dziennik audytu zamienia to na oś czasu: kto otworzył ustawienia XP, kto edytował wiadomość powitalną, kto usunął wyzwalacz czatu i jakie były wartości przed i po zmianie.

Jest oddzielny od dziennika audytu Discorda i od funkcji Logowanie. Dziennik Discorda obejmuje działania wykonane w Discordzie. Funkcja Logowanie Mewdeko publikuje zdarzenia serwera, takie jak dołączenia, edycje i zmiany ról, na wybranych kanałach. Dziennik audytu w panelu obejmuje tylko panel.

Nie trzeba niczego włączać. Wpisy są zapisywane od chwili, gdy ktoś zaloguje się do panelu i otworzy Twój serwer, a wygasają po dziewięćdziesięciu dniach.

## Po co to używać

- Kilka osób ma dostęp do panelu i chcesz wiedzieć, kto w zeszłym tygodniu wyłączył Anti-Raid.
- Ustawienie się zmieniło i nikt się do tego nie przyznaje.
- Chcesz mieć ślad, zanim przekażesz dostęp do panelu szerszemu zespołowi staffu.
- Musisz potwierdzić, że zmiana, o którą kogoś poprosiłeś, została wykonana i co zastąpiła.

## Co jest zapisywane

Każdy wpis zawiera:

- **Kiedy**: czas żądania, zapisany w UTC i pokazywany na stronie w Twojej strefie czasowej.
- **Użytkownik**: nazwa użytkownika i ID Discorda pobrane z logowania do panelu, a nie z tego, co użytkownik wpisał.
- **Akcja**: jedna z akcji z tabeli poniżej.
- **Sekcja**: obszar panelu, pokazany przyjazną nazwą, na przykład „System AFK”, „Wyzwalacze” albo „Ochrona”.
- **Endpoint**: dokładne żądanie, na przykład `PUT Afk/123/settings`, pokazane drobnym drukiem pod sekcją.
- **Zmiany**: dla wszystkiego poza wyświetleniem, wartości, które zostały wysłane lub zmienione. Rozwiń wpis przyciskiem **Pokaż szczegóły**, aby je zobaczyć.

Bot zapisuje też z każdym wpisem ciąg user agent przeglądarki.

### Akcje

O akcji decyduje rodzaj żądania, które wysłał panel.

| Akcja | Zapisywana, gdy |
| --- | --- |
| Wyświetlono | Panel odczytał dane (żądanie GET). Każde załadowanie strony tworzy takie wpisy. |
| Utworzono | Coś zostało dodane (żądanie POST). |
| Zaktualizowano | Coś istniejącego zostało zmienione (żądanie PUT lub PATCH). |
| Usunięto | Coś zostało usunięte (żądanie DELETE). |
| Otwarto | Zarezerwowane dla rozpoczęć sesji panelu. Filtr to oferuje, ale obecna wersja nigdy nie zapisuje wpisów z tą akcją. |

### Zestawy zmian

Wyświetlenia nie zapisują danych o zmianach. Dla wszystkiego innego bot zapisuje jeden z dwóch dokumentów:

- **Różnica przed i po**: gdy sekcja panelu zapisuje stan ustawienia przed zmianą, wpis zawiera tylko pola, które się zmieniły, każde ze starą i nową wartością. Większość stron z ustawieniami działa w ten sposób.
- **Treść żądania**: gdy nie wykonano zapisu stanu wyjściowego, wpis zawiera to, co wysłał panel, bez starej wartości.

Każde pole, którego nazwa zawiera `token`, `secret`, `password`, `apikey`, `api_key`, `authorization` albo `clientsecret`, jest zastępowane przez `[redacted]` przed zapisaniem, więc dane uwierzytelniające nigdy nie trafiają do dziennika.

Na stronie wartości logiczne są pokazywane jako Włączone i Wyłączone, listy jako „3 elementy”, puste ciągi jako „puste”, a brakujące wartości jako „brak”. Nazwy pól są zamieniane na czytelne etykiety.

> [!NOTE]
> Wpisy „Wyświetlono” stanowią większość dziennika, bo każda strona panelu odczytuje ustawienia przy otwarciu. Filtruj po Utworzono, Zaktualizowano lub Usunięto, gdy szukasz zmiany.

### Czego nie zapisujemy

- Wszystkiego, co zrobiono komendami na Discordzie. Te działania widać w dzienniku audytu Discorda tam, gdzie bot działał, oraz w Logowaniu, jeśli je skonfigurowano.
- Żądań niepowiązanych z zalogowanym użytkownikiem panelu.
- Otwarcia samej strony Dziennik audytu, Zostaw opinię oraz kilku endpointów infrastrukturalnych i odpytujących, takich jak status bota, wydajność, informacje o systemie i zarządzanie instancjami.
- Kilku endpointów wyraźnie wykluczonych: obrazu awatara persony używanego przez kreator embedów, sprawdzenia „czy pokazać” kreatora konfiguracji oraz beacona wyświetlenia strony panelu.

## Jak czytać stronę

Otwórz **Dziennik audytu** w sekcji Bezpieczeństwo w panelu. Lista pokazuje najnowsze wpisy na początku, po pięćdziesiąt na stronę, z przyciskami **Poprzednia** i **Następna** oraz liczbą wszystkich wpisów.

Nad listą są dwa filtry:

| Filtr | Co robi |
| --- | --- |
| **Akcja** | Pokazuje tylko wpisy Wyświetlono, Utworzono, Zaktualizowano, Usunięto lub Otwarto. |
| **Sekcja** | Pokazuje tylko jeden obszar panelu. Wybory są budowane z sekcji obecnych we wczytanych wpisach. |

**Odśwież** przeładowuje listę. Zmiana filtra przenosi z powrotem na pierwszą stronę.

Na komputerze każdy wpis to wiersz z przyciskiem **Pokaż szczegóły**, gdy ma dane o zmianach. Na telefonie wpisy są pokazywane jako karty z przyciskiem **Pokaż szczegóły**.

> [!EXAMPLE]
> Ustaw filtr **Akcja** na Zaktualizowano, a **Sekcja** na Ochrona, aby zobaczyć każdą zmianę systemu ochrony, a potem rozwiń wiersz, aby zobaczyć, które pola się zmieniły i z jakiej wartości na jaką.

## Retencja

Wpisy są przechowywane przez **dziewięćdziesiąt dni**. Zadanie czyszczące uruchamia się raz dziennie, pięć minut po starcie bota, i usuwa wszystko, co starsze. Nie ma eksportu, więc jeśli potrzebujesz zapisu poza tym oknem, zachowaj go, zanim wygaśnie.

## Kto może to zobaczyć

Strona jest dostępna tylko dla osób, które mogą zalogować się do panelu i są członkami Twojego serwera. Właściciel serwera i każdy z uprawnieniem Administrator mogą ją zawsze otworzyć. Każda inna osoba potrzebuje co najmniej poziomu **Wyświetlanie** dla sekcji **Dziennik audytu** w **Dostępie do panelu**, który nadaje się per użytkownik lub per rola.

> [!PERMISSION]
> Ponieważ użytkownik jest pobierany z tokena logowania do panelu, nikt nie może sprawić, by wpis pojawił się pod czyimś innym imieniem.

## Wskazówki i pułapki

- Filtr sekcji wyświetla tylko sekcje obecne na stronie, którą oglądasz. Jeśli sekcji brakuje na liście, może nadal istnieć na kolejnych stronach; wyczyść filtr akcji i przeglądaj strony albo najpierw zawęź po akcji.
- Znaczniki czasu są pokazywane w strefie czasowej przeglądarki, która wyświetla stronę, a nie w strefie czasowej serwera z ustawień administracji.
- Wpis „Utworzono” oznacza, że wysłano żądanie POST, którego panel używa też do niektórych przełączników i aktualizacji. Przeczytaj linię endpointu i szczegóły, aby zobaczyć, co się naprawdę stało.
- Wpisy, których szczegóły pokazują wartości bez starej wartości, pochodzą z sekcji, która nie zapisuje stanu sprzed zmiany. Zobaczysz, co wysłano, ale nie to, co zastąpiło.
- Dziennik jest osobny dla każdego serwera. Przełączenie serwera w panelu przełącza też dziennik.

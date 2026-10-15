---
title: Highlighty
slug: highlights
summary: Członkowie wybierają słowa, na które mają zwracać uwagę, i dostają wiadomość prywatną z kontekstem, ilekroć ktoś je napisze na serwerze.
icon: fa-bolt
category: Community
dashboard: /dashboard/highlights
module: Highlights
tags: [highlights, keywords, watch words, notifications, mentions, dm alerts, ignore channel, ignore user, highlighty, słowa kluczowe, słowa do obserwowania, powiadomienia, wzmianki, alerty w wiadomościach prywatnych, ignorowany kanał, ignorowany użytkownik]
related: [afk, utility]
---

## Co to robi

Członek dodaje słowo lub frazę poleceniem `highlight add`. Od tej chwili, ilekroć wiadomość na serwerze zawiera to słowo, bot wysyła mu wiadomość prywatną. Wiadomość mówi, na którym serwerze i kanale to się stało, pokazuje pięć ostatnich wiadomości przed nią oraz pasującą wiadomość, a także ma przycisk **Przejdź do wiadomości**.

Highlighty są osobiste. Każdy członek zarządza własną listą, wybiera, które kanały i osoby ignorować, i może wyłączyć highlighty bez ich usuwania. Personel nie może dodawać highlightów za kogoś innego, ale panel pozwala mu zobaczyć, co jest obserwowane, i usuwać wpisy.

Członkowie dostają wiadomości prywatne tylko z kanałów, które faktycznie widzą. Członek, który pisze na serwerze, jest uznawany za obecnego, więc przez dwie minuty highlighty są dla niego wstrzymane.

## Po co z tego korzystać

- Dostawaj powiadomienia, gdy wspomną o twoim imieniu, pseudonimie lub projekcie bez prawdziwej wzmianki @.
- Śledź temat, np. „giveaway” albo „patch notes”, na dużym serwerze.
- Personel może obserwować słowa takie jak „help” czy „report” bez czytania każdego kanału.
- Moderatorzy mogą sprawdzać, co członkowie śledzą, i czyścić obraźliwe lub spamowe wpisy.

## Jak działa dopasowanie

Bot sprawdza każdą niepustą wiadomość względem każdego highlightu na danym serwerze.

- Highlight pasuje jako całe słowo lub fraza. `cat` nie pasuje do „category”, ale pasuje do „the cat sat”.
- Dopasowanie rozróżnia wielkość liter. Dodaj `Cat` i `cat` osobno, jeśli chcesz obu.
- Każdy członek dostaje najwyżej jedną wiadomość prywatną na dwie minuty na serwer, bez względu na liczbę pasujących słów.
- Pisanie gdziekolwiek na serwerze uruchamia tę samą dwuminutową przerwę, więc nie dostajesz wiadomości o rozmowie, w której już uczestniczysz.
- Wiadomości od ignorowanych użytkowników i z ignorowanych kanałów są pomijane dla tego członka.
- Wiadomość prywatna jest pomijana, gdy członek nie może zobaczyć kanału albo ma zamknięte wiadomości prywatne.
- Wiadomości są sprawdzane w kolejce, która obsługuje jedną wiadomość co dwie sekundy. Na bardzo ruchliwym shardzie część wiadomości może wypaść z kolejki.

`highlight match some text` sprawdza twoją listę względem przykładowego zdania i informuje, które twoje słowa by pasowały. To sprawdzenie ignoruje wielkość liter, więc jest przybliżoną wskazówką, a nie dokładną kopią reguły działającej na żywo.

## Ustawienia członka

Każdy członek ma wiersz ustawień, który tworzy się przy pierwszym przełączeniu czegokolwiek.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Highlighty włączone | włączone | `highlight toggle false` wstrzymuje wszystkie twoje highlighty na tym serwerze |
| Ignorowane kanały | brak | Kanały, na których twoje słowa nigdy nie wywołują wiadomości prywatnej |
| Ignorowani członkowie | brak | Osoby, których wiadomości nigdy nie wywołują twoich highlightów |

## Ustawienia

Strona Highlighty w panelu jest dla personelu. Nie dodaje highlightów; pokazuje je i usuwa.

| Zakładka | Co pokazuje |
| --- | --- |
| Wszystkie highlighty | Każdy highlight na serwerze pogrupowany według członka, z przyciskiem usunięcia przy każdym słowie i przyciskiem usunięcia wszystkich słów jednego członka |
| Szukaj | Znajdź highlighty zawierające słowo u wszystkich członków; wyszukiwanie ignoruje wielkość liter |
| Użytkownicy z wyłączonymi | Członkowie, którzy wyłączyli highlighty, z liczbą ignorowanych kanałów i użytkowników |
| Statystyki | Wszystkie highlighty, Aktywni użytkownicy, Najpopularniejsze słowo, Najaktywniejszy, a także Najczęstsze słowa highlight i Ostatnie highlighty |

## Przewodnik konfiguracji

Nie ma nic do włączenia. Highlighty działają, gdy bot jest na serwerze.

1. Jako członek uruchom `highlight add yourname` na dowolnym kanale.
2. Uruchom `highlight list`, aby sprawdzić, czy zapisało się.
3. Poproś kogoś, by napisał twoje imię na innym kanale. Poczekaj kilka sekund i sprawdź wiadomości prywatne.
4. Jeśli dostajesz ich za dużo, uruchom `highlight toggleignore #busy-channel` albo `highlight toggleignore @user`.
5. Personel: otwórz **Highlighty** w panelu, przejrzyj zakładkę **Wszystkie highlighty** i usuń niechciane wpisy.

## Komendy

Uruchamiaj je z prefiksem serwera (`.`, chyba że go zmieniłeś). Te same działania istnieją jako jedna komenda ukośnikowa `/highlights manage`, której opcja `action` przyjmuje wartości `Add`, `List`, `Delete`, `Match`, `ToggleUser`, `ToggleChannel` lub `ToggleGlobal`, oraz osobne opcje `words`, `user` i `channel`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `highlight add <word>` | `highlights`, `hl` | Nikt | Obserwuj słowo lub frazę |
| `highlight list` | `highlights`, `hl` | Nikt | Przeglądaj highlighty, po dziesięć na stronę |
| `highlight delete <number or word>` | `highlights`, `hl` | Nikt | Usuń po numerze na liście lub dokładnym słowie; `remove` działa tak samo |
| `highlight match <text>` | `highlights`, `hl` | Nikt | Pokaż, które z twoich słów pojawiają się w tekście |
| `highlight toggleignore <#channel or @user>` | `highlights`, `hl` | Nikt | Dodaj kanał lub osobę do listy ignorowanych albo ją z niej usuń |
| `highlight toggle <true or false>` | `highlights`, `hl` | Nikt | Włącz lub wyłącz wszystkie twoje highlighty na tym serwerze |

## Wskazówki i pułapki

- Bot musi móc czytać kanał, by dopasowywać na nim, a ty musisz mieć włączone wiadomości prywatne od członków serwera, by otrzymywać alerty.
- Dodanie słowa, które już masz, jest odrzucane. Sprawdzanie duplikatów ignoruje wielkość liter, ale dopasowanie na żywo już nie.
- Usuwanie po numerze używa pozycji widocznej w `highlight list`, która zmienia się po każdym usunięciu.
- Lista highlightów i ustawienia są buforowane przez trzydzieści minut na serwer. Dodawanie lub usuwanie pojedynczych słów komendami albo w panelu aktualizuje bufor od razu; usunięcie wszystkich słów członka w panelu może zająć do trzydziestu minut, zanim wiadomości prywatne ustaną.
- Gdy bot opuszcza serwer, jego highlighty i ustawienia są czyszczone przy następnym restarcie bota.

---
title: Filtry wiadomości
slug: filter
summary: Usuwaj wiadomości zawierające zablokowane słowa, zaproszenia lub linki Discorda, opcjonalnie ostrzegaj nadawcę i banuj od razu za osobną listę słów do automatycznego bana.
icon: fa-filter
category: Security
dashboard: /dashboard/filter
module: Permissions
tags: [filter, word filter, invite filter, link filter, automod, auto ban, blacklist, banned words, regex, filtr, filtr słów, filtr zaproszeń, filtr linków, automoderacja, automatyczny ban, czarna lista, zakazane słowa, wyrażenia regularne]
related: [moderation, logging, administration]
---

## Co robi

Filtr sprawdza każdą wiadomość, którą członek wysyła lub edytuje, zanim zobaczą ją inne moduły. Jeśli wiadomość zawiera filtrowane słowo, zaproszenie Discorda albo link w miejscu, gdzie dany filtr jest aktywny, bot ją usuwa. Możesz też sprawić, by bot wystawił ostrzeżenie przez system moderacji i wysłał członkowi wiadomość prywatną wyjaśniającą, co zostało usunięte.

Druga lista, słowa do automatycznego bana, jest surowsza. Wiadomość pasująca do słowa z tej listy zostaje usunięta, a autor zostaje od razu zbanowany, z wiadomością prywatną zawierającą powód, jeśli bot może ją wysłać.

Administratorzy i osoby z rolą staffu serwera (ustawioną komendą `staffrole`) nigdy nie są filtrowani. Wiadomości botów także nie są sprawdzane.

## Po co z tego korzystać

- Trzymaj wyzwiska i inne zakazane słowa poza czatem, nawet bez moderatora online.
- Powstrzymaj członków przed reklamowaniem innych serwerów przez wrzucanie linków z zaproszeniami.
- Zrób z kanału wyłącznie tekstowy, usuwając każdą wiadomość z adresem URL, na przykład na czacie ogłoszeń bez multimediów.
- Natychmiast banuj konta, które publikują znane frazy oszustw albo sygnatury raidów.

## Rodzaje filtrów

| Filtr | Gdzie działa | Co się dzieje |
| --- | --- | --- |
| Filtr słów | Tylko na kanałach z listy kanałów filtra słów | Wiadomość usunięta; ostrzeżenie i wiadomość prywatna, jeśli włączono **Ostrzegaj za filtrowane słowo** |
| Filtr zaproszeń | Wszędzie, gdy przełącznik serwera jest włączony, a lista kanałów jest pusta, albo tylko na wymienionych kanałach, gdy lista ma wpisy | Wiadomość usunięta; ostrzeżenie i wiadomość prywatna, jeśli włączono **Ostrzegaj za link z zaproszeniem** |
| Filtr linków | Wszędzie, gdy przełącznik serwera jest włączony, oraz na każdym kanale z jego listy | Wiadomość usunięta, bez ostrzeżenia |
| Słowa z automatycznym banem | Wszędzie | Wiadomość usunięta, autor dostaje wiadomość prywatną i zostaje zbanowany |

Trzy listy kanałów to **Wyjątki dla kanałów** w panelu. Zauważ, że filtr słów jest sterowany wyłącznie swoją listą kanałów: aby słowa były tam sprawdzane, kanał musi znajdować się na tej liście.

## Jak dopasowywane są słowa

Filtrowane słowa i słowa do automatycznego bana są traktowane jak wyrażenia regularne i sprawdzane względem treści wiadomości zapisanej małymi literami. Zwykłe słowo, na przykład `example`, działa jako dopasowanie podciągu, więc `examples` też zostanie złapane. Wzorce, których nie da się skompilować, są automatycznie usuwane z listy. Każdy wzorzec ma limit czasu dopasowania wynoszący 250 milisekund.

Filtrowane słowa są zapisywane małymi literami i dopasowywane bez względu na wielkość liter. Wzorce automatycznego bana są zapisywane dokładnie tak, jak je wpisano, i porównywane z tekstem zapisanym małymi literami, więc pisz je małymi literami.

> [!WARNING]
> Wzorce automatycznego bana są bardzo mocne. Krótki wzorzec, taki jak `ban` w środku dłuższego słowa, zbanuje osoby, które napiszą „banan”. Najpierw przetestuj wzorce jako filtrowane słowa.

## Ostrzeżenia

Włączenie **Ostrzegaj za filtrowane słowo** lub **Ostrzegaj za link z zaproszeniem** sprawia, że bot dodaje ostrzeżenie przez moduł moderacji z powodem „Warned for Filtered Word” albo z odpowiednim powodem dla zaproszeń, a potem wysyła członkowi wiadomość prywatną. Kary za ostrzeżenia skonfigurowane na stronie Moderacja obowiązują jak zwykle, więc trzy trafienia filtra mogą eskalować do wyciszenia albo wyrzucenia, jeśli tak ustawiono ostrzeżenia.

Automatyczne bany korzystają z ustawień czyszczenia wiadomości z modułu moderacji dla akcji „Filter”, aby określić, ile dni wiadomości usunąć.

## Ustawienia

Strona Filtry wiadomości ma cztery zakładki: **Filtry**, **Filtrowane słowa**, **Słowa z automatycznym banem** i **Wyjątki dla kanałów**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Filtr słów | wył. | Przełącznik całego serwera na zakładce Filtry |
| Filtr zaproszeń | wył. | Usuwa linki z zaproszeniami Discorda; potrzebny, aby lista kanałów zaproszeń cokolwiek robiła |
| Filtr linków | wył. | Usuwa każdą wiadomość z adresem URL na całym serwerze |
| Ostrzegaj za filtrowane słowo | wył. | Dodaje ostrzeżenie i wysyła wiadomość prywatną, gdy usunięto filtrowane słowo |
| Ostrzegaj za link z zaproszeniem | wył. | Dodaje ostrzeżenie i wysyła wiadomość prywatną, gdy usunięto zaproszenie |
| Filtrowane słowa | brak | Lista na zakładce Filtrowane słowa, z usuwaniem pojedynczych słów, przyciskiem **Wyczyść wszystko** (działającym tak samo jak `fwclear`) oraz polem wyszukiwania, gdy słów jest więcej niż dziesięć |
| Słowa z automatycznym banem | brak | Lista na zakładce Słowa z automatycznym banem |
| Kanały filtra słów | brak | Kanały, na których egzekwowana jest lista słów |
| Kanały filtra zaproszeń | brak | Ogranicza filtr zaproszeń do tych kanałów, gdy lista nie jest pusta |
| Kanały filtra linków | brak | Dodatkowe kanały, na których linki są usuwane, nawet gdy przełącznik serwera jest wyłączony |

U góry strony widoczne są liczniki filtrowanych słów, słów z automatycznym banem i wyjątków kanałów.

## Krok po kroku

1. Otwórz **Filtry wiadomości** w panelu.
2. Na zakładce **Filtrowane słowa** dodaj każde słowo lub frazę i naciśnij dodaj.
3. Na **Wyjątki dla kanałów** dodaj wszystkie kanały, na których lista słów ma działać, w **Kanały filtra słów**.
4. Wróć do **Filtry**, włącz **Filtr zaproszeń**, jeśli zaproszenia mają być usuwane wszędzie, oraz **Ostrzegaj za link z zaproszeniem**, jeśli to ma liczyć się jako ostrzeżenie.
5. Opcjonalnie dodaj kilka wysokiej pewności wzorców na zakładce **Słowa z automatycznym banem**.
6. Uruchom `staffrole @Moderators`, aby twój zespół był zwolniony z filtrów, a potem napisz filtrowane słowo ze zwykłego konta, aby sprawdzić, czy zostało usunięte.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `filterword <word>` | `fw` | Nikt | Dodać słowo do listy filtrów albo je usunąć, jeśli już jest |
| `lstfilterwords` | `lfw` | Nikt | Przeglądać listę filtrowanych słów |
| `fwclear` | | Administrator | Usunąć wszystkie filtrowane słowa, wyczyścić listę kanałów filtra słów i wyłączyć przełącznik serwera |
| `srvrfilterwords` | `sfw` | Nikt | Przełączyć filtr słów dla całego serwera |
| `chnlfilterwords` | `cfw` | Nikt | Przełączyć bieżący kanał na liście kanałów filtra słów |
| `srvrfilterinv` | `sfi` | Nikt | Przełączyć filtr zaproszeń dla całego serwera |
| `chnlfilterinv` | `cfi` | Nikt | Przełączyć bieżący kanał na liście kanałów filtra zaproszeń |
| `srvrfilterlin` | `sfl` | Nikt | Przełączyć filtr linków dla całego serwera |
| `chnlfilterlin` | `cfl` | Nikt | Przełączyć bieżący kanał na liście kanałów filtra linków |
| `fwarn <y or n>` | `filteredwarn` | Administrator | Włączyć lub wyłączyć ostrzeżenia za filtrowane słowa |
| `invwarn <y or n>` | `invitewarn` | Administrator | Włączyć lub wyłączyć ostrzeżenia za linki z zaproszeniami |
| `autobanword <pattern>` | `autobanw` | Administrator | Dodać wzorzec do listy automatycznych banów albo go usunąć, jeśli już jest |
| `autobanwordlist` | `autobwlist` | Administrator | Przeglądać listę automatycznych banów |

> [!PERMISSION]
> Przełączniki filtrów i `filterword` nie mają własnego sprawdzenia uprawnień. Użyj modułu Uprawnienia, aby je ograniczyć, albo zarządzaj filtrami z panelu, gdzie obowiązują reguły dostępu do panelu.

## Wskazówki i pułapki

- Bot potrzebuje uprawnienia **Zarządzaj wiadomościami** na każdym filtrowanym kanale oraz **Banuj członków** dla słów z automatycznym banem.
- Edytowane wiadomości są sprawdzane ponownie, więc wklejenie linku do starej wiadomości nadal spowoduje jej usunięcie.
- Filtry nie działają na administratorów, rolę staffu ani boty. Nie testuj na koncie administratora.
- `fwclear` robi więcej niż opróżnia listę: usuwa też wszystkie wyjątki kanałów filtra słów.
- Nieprawidłowe wyrażenie regularne jest po cichu usuwane z listy. Jeśli słowo zniknęło, sprawdź, czy nie zawiera niezaescapowanych znaków, takich jak `(`, `[` lub `*`.
- Jeśli chcesz zapis tego, co usunął filtr, włącz logowanie usuniętych wiadomości w module Logowanie.

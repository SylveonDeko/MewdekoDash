---
title: Źródła RSS
slug: feeds
summary: Zasubskrybuj kanał do źródła RSS lub Atom, a bot opublikuje każdy nowy element, jako domyślny embed albo w wiadomości, którą sam zaprojektujesz.
icon: fa-newspaper
category: Actions
dashboard: /dashboard/feeds
module: Searches
tags: [rss, atom, feed, news, blog, youtube, updates, subscriptions, feedadd, źródło rss, aktualności, aktualizacje, subskrypcje, wpisy z bloga]
related: [embedbuilder, utility]
---

## Co robi

Podajesz botowi URL źródła i kanał. Od tej pory bot regularnie sprawdza źródło i publikuje wszystko, co zostało opublikowane od ostatniego sprawdzenia. Członkowie widzą nową wiadomość na kanale za każdym razem, gdy strona coś opublikuje: tytuł elementu, link i, jeśli źródło go podaje, opis oraz obraz.

Staff może zasubskrybować do dziesięciu źródeł na serwer i nadać każdemu własną wiadomość. Wiadomość przechodzi przez parser embedów, więc aktualizacja może być zwykłym tekstem, embedem albo embedem z przyciskami. Może też używać placeholderów, które pobierają tytuł elementu, link, autora itd.

Od członków nic nie jest wymagane. Po prostu czytają kanał.

## Po co to używać

- Automatycznie publikuj blog społeczności, notatki o łatkach albo changelog na kanale ogłoszeń.
- Przenoś feed serwisu informacyjnego albo subreddita na kanał dyskusji.
- Śledź kanał YouTube albo podcast przez jego RSS.
- Utrzymuj widoczny feed statusów lub wydań, bez kopiowania linków ręcznie.

## Jak publikowane są aktualizacje

Bot przechodzi po każdym subskrybowanym URL, pobiera go i czeka około dziesięciu sekund przed następnym przebiegiem. Przy pierwszym pobraniu po starcie zapamiętuje datę najnowszego elementu i niczego nie publikuje. Potem każdy element z datą publikacji nowszą od ostatnio widzianej jest publikowany, od najstarszego, a zapamiętana data przesuwa się do przodu. W feedach Atom, gdy brakuje daty publikacji, używana jest data aktualizacji. Elementy bez żadnej z nich są ignorowane.

Nie ma limitu, ile elementów może wyjść w jednym przebiegu, więc feed, który wrzuci dwadzieścia wstecznie datowanych wpisów naraz, wygeneruje dwadzieścia wiadomości.

Feedy, których nie udało się wczytać, są po cichu pomijane aż do następnego przebiegu. Nie są usuwane, a bot nie zgłasza błędu.

### Domyślna wiadomość

Jeśli feed nie ma własnej wiadomości, bot wysyła embed z:

| Część | Wartość |
| --- | --- |
| Tytuł | Tytuł elementu, przycięty do 256 znaków |
| Opis | Opis elementu z usuniętym HTML, przycięty do 2048 znaków |
| URL | Link do elementu, dzięki czemu tytuł jest klikalny |
| Obraz | Obraz z załącznika feedu albo element Atom `preview` lub `thumbnail`, jeśli jest obecny |
| Stopka | URL feedu |

### Własne wiadomości i placeholdery

Ustaw własną wiadomość komendą `feedmessage` albo przyciskiem **Edytuj wiadomość** w panelu. Tekst przechodzi przez parser embedów, więc działa wszystko z [kreatora embedów](/wiki/embedbuilder): zwykły tekst, JSON embedu albo oba. Wzmianki o rolach i członkach w części zwykłego tekstu będą pingować.

Te placeholdery są podstawiane we własnej wiadomości, obok ogólnych placeholderów serwera, kanału i bota ze strony placeholderów.

| Placeholder | Wartość |
| --- | --- |
| `%title%` | Tytuł elementu |
| `%author%` | Autor elementu albo „Unknown” |
| `%content%` | Opis elementu bez HTML |
| `%url%` | Link do elementu |
| `%feedurl%` | Własny URL feedu |
| `%image_url%` | Obraz elementu, jeśli feed go podaje, w przeciwnym razie obraz feedu |
| `%categories%` | Kategorie elementu, oddzielone przecinkami |
| `%timestamp%` | Data publikacji jako znacznik czasu Discorda |

> [!EXAMPLE]
> `feedmessage 1 New post: **%title%** by %author%
> %url%`

Ustaw wiadomość na `-`, aby wrócić do domyślnego embedu.

## Ustawienia

Feedy nie mają ustawień na poziomie serwera. Każda subskrypcja ma kanał i URL, wybrane przy dodawaniu, oraz opcjonalną wiadomość. Strona w panelu nazywa się **Źródła RSS** i ma trzy karty.

| Karta | Co pokazuje |
| --- | --- |
| Źródła RSS | Każda subskrypcja z kanałem, URL i datą dodania. **Edytuj wiadomość** albo **Dodaj własną wiadomość** otwiera pole tekstowe; pod nim renderuje się podgląd wiadomości. **Usuń** usuwa feed po potwierdzeniu. |
| Dodaj źródło | Wybór **Kanał** i pole **URL źródła RSS** z przyciskiem **Dodaj źródło RSS** |
| Statystyki | **Wszystkie źródła**, **Unikalne źródła**, **Kanały** oraz podział **Źródła według kanału** |

Kanał i URL istniejącego feedu nie mogą być zmienione. Usuń feed i dodaj go ponownie.

## Konfiguracja krok po kroku

1. Otwórz **Źródła RSS** w panelu i przełącz się na **Dodaj źródło**.
2. Wybierz **Kanał**, na który mają trafiać aktualizacje.
3. Wklej adres źródła do **URL źródła RSS** i naciśnij **Dodaj źródło RSS**. Musi to być pełny adres `http` lub `https` prowadzący do dokumentu RSS albo Atom, a nie strona główna serwisu.
4. Wróć na **Źródła RSS**, naciśnij **Dodaj własną wiadomość**, jeśli chcesz własne brzmienie, a potem **Zapisz**.
5. Uruchom `feedtest 1` na Discordzie, aby opublikować najnowszy element i sprawdzić wynik. Numer to pozycja feedu na liście `feedlist`.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś). Wszystkie komendy feedów wymagają Zarządzania wiadomościami.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `feedadd <url> [#channel]` | `rss` | Zarządzanie wiadomościami | Subskrybuje kanał do feedu. Domyślnie bieżący kanał. Bot najpierw pobiera feed i odrzuca go, jeśli nie da się go odczytać. |
| `feedlist` | `feeds` | Zarządzanie wiadomościami | Wyświetla subskrypcje, ponumerowane, po dziesięć na stronę |
| `feedremove <number>` | `feedrm`, `feeddel` | Zarządzanie wiadomościami | Usuwa subskrypcję po jej numerze na liście |
| `feedmessage <number> <message>` | `rssmessage` | Zarządzanie wiadomościami | Ustawia własną wiadomość dla subskrypcji |
| `rsstest <number>` | `feedtest` | Zarządzanie wiadomościami | Publikuje najnowszy element feedu na bieżącym kanale |

## Wskazówki i pułapki

- Limit to dziesięć feedów na serwer i ten sam URL nie może być dodany dwa razy. `feedadd` zgłasza jeden wspólny błąd dla nieczytelnego linku, duplikatu i limitu, więc jeśli nie wiesz, który to był, sprawdź `feedlist`.
- Dodanie feedu przez panel nie testuje najpierw URL. Użyj potem `feedtest`, aby upewnić się, że bot może go odczytać.
- Numery w `feedremove`, `feedmessage` i `feedtest` pochodzą z `feedlist`, które sortuje feedy według daty dodania.
- Bot potrzebuje uprawnień Wysyłanie wiadomości i Osadzanie linków na kanale docelowym. Bez Osadzania linków domyślny embed się nie pojawi.
- Publikowane są tylko elementy z datą publikacji (albo, dla Atom, datą aktualizacji). Feed, którego wpisy nie mają dat, nigdy nie wygeneruje aktualizacji.
- Bot nie publikuje niczego w pierwszym przebiegu po restarcie. Startuje od najnowszego elementu w tym momencie, więc elementy opublikowane, gdy bot był offline, nie są nadrabiane.
- Ponieważ własna wiadomość używa parsera embedów, obowiązują te same zasady co w kreatorze embedów: poprawny JSON albo zwykły tekst.

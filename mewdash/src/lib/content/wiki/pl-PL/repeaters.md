---
title: Powtarzacze
slug: repeaters
summary: Publikuj wiadomość na kanale według harmonogramu, gdy kanał jest zajęty lub cichy, albo przypinaj ją na dole jako wiadomość sticky.
icon: fa-sync
category: Actions
dashboard: /dashboard/repeaters
module: Utility
tags: [repeater, sticky, sticky message, recurring, scheduled message, auto post, reminder, forum sticky, powtarzacz, przypięta wiadomość, cykliczna, zaplanowana wiadomość, automatyczny post, przypomnienie, przypięcie na forum]
related: [utility, embedbuilder]
---

## Co robi

Powtarzacz to wiadomość, którą bot wysyła ponownie i ponownie na jednym kanale. Klasyczne zastosowanie to przypomnienie co określony czas: „Przeczytaj regulamin” co sześć godzin. Za każdym razem, gdy powtarzacz się uruchamia, bot najpierw usuwa swoją poprzednią kopię, dzięki czemu kanał nigdy nie zapełnia się duplikatami, a wiadomość zawsze znajduje się blisko dołu.

Powtarzacze mają pięć trybów wyzwalania. Oprócz stałego odstępu mogą uruchamiać się w chwili, gdy ktoś inny napisze wiadomość (prawdziwa wiadomość sticky), po określonej liczbie wiadomości, gdy kanał jest zajęty albo gdy zrobi się cicho. Opcjonalne okna czasowe ograniczają je do godzin pracy, wieczorów lub weekendów w strefie czasowej twojego serwera, a powtarzacze na forum mogą automatycznie publikować w każdym nowym wątku.

Wiadomość obsługuje pełny edytor embedów, zwykły tekst, komponenty i ogólne placeholdery, więc powtarzacz może być bogatym ogłoszeniem, a nie tylko jedną linijką tekstu. Wzmianki są zachowywane tylko wtedy, gdy osoba tworząca powtarzacz ma uprawnienie Mention Everyone; w przeciwnym razie zostają zneutralizowane.

## Po co z tego korzystać

- Trzymaj regulamin albo informację „jak uzyskać pomoc” przypiętą na dole ruchliwego kanału.
- Wysyłaj codzienne przypomnienie o wydarzeniu o 18:00 czasu serwera.
- Umieszczaj zasady publikowania w każdym nowym wątku na forum, filtrowane według tagu.
- Ożywiaj martwy kanał pytaniem na start rozmowy, gdy jest cicho od godziny.
- Prowadź promocję tylko w godzinach pracy i tylko przez kolejne siedem dni.

## Tryby wyzwalania

| Tryb | Kiedy publikuje |
| --- | --- |
| Odstęp czasu | Co każdy odstęp, opcjonalnie wyrównany do godziny rozpoczęcia. Tryb domyślny. |
| Natychmiast | Publikuje raz, a potem ponownie publikuje, gdy jego wiadomość nie jest już ostatnią na kanale. |
| Po wiadomościach | Publikuje, gdy od ostatniego uruchomienia zostanie wysłana liczba wiadomości równa progowi. |
| Przy aktywności | Publikuje, gdy kanał jest zajęty: próg jest porównywany z ostatnim ruchem w oknie czasowym. |
| Przy braku aktywności | Publikuje, gdy na kanale nie wysłano żadnych wiadomości przez cały czas trwania okna. |

Tryby oparte na aktywności są sprawdzane raz na minutę i wymagają włączonego liczenia wiadomości na serwerze. Odstęp musi mieścić się w przedziale od pięciu sekund do 25000 minut. Domyślnie jest to pięć minut, a jeśli podasz godzinę dnia i nie podasz odstępu, to jeden dzień. **Próg aktywności** domyślnie wynosi 5 wiadomości, a **Okno czasu** domyślnie pięć minut, przy zakresie okna od trzydziestu sekund do sześciu godzin.

## Warunki i limity

- **Nie powtarzaj, jeśli wiadomość jest już ostatnia na kanale** (redundancja): bot pomija uruchomienie, jeśli jego ostatnia kopia nadal jest najnowszą wiadomością.
- **Wykrywanie rozmowy**: jeśli w ciągu ostatniej minuty pojawiły się trzy lub więcej wiadomości, uruchomienie zostaje opóźnione i sprawdzane ponownie po trzydziestu sekundach.
- **Harmonogram czasowy**: `business` to 09:00–17:00 od poniedziałku do piątku, `evening` to 18:00–23:00 każdego dnia, `weekend` to cały dzień w sobotę i niedzielę. Godziny liczone są w strefie czasowej serwera; najpierw ją ustaw, bo inaczej bot przyjmie UTC i przypomni ci o tym.
- **Automatyczne usunięcie po** i **Maks. wysłań**: powtarzacz usuwa się sam po przekroczeniu maksymalnego wieku albo liczby wysłań.
- **Wycisz powiadomienia**: wiadomość jest wysyłana bez dźwięku, więc nie powiadamia niczyjego urządzenia.
- **Priorytet** jest zapisywany dla każdego powtarzacza w zakresie od 0 do 100, domyślnie 50, i jest widoczny na liście.

## Wątki i fora

- **Automatycznie twórz w nowych wątkach**: gdy w kanale powtarzacza powstanie wątek, bot publikuje wiadomość w tym wątku i utrzymuje ją na dole, gdy członkowie odpowiadają.
- **Tryb tylko wątków**: powtarzacz nigdy nie publikuje w kanale nadrzędnym, tylko w wątkach. Wymagane, gdy celem jest kanał forum.
- **Filtry tagów forum**: wymagane i wykluczone tagi decydują, które posty na forum dostają sticky.

## Placeholdery

Wiadomość przechodzi przez ogólny zestaw placeholderów. Placeholdery użytkownika odnoszą się do samego bota, ponieważ nikt nie uruchamia powtarzacza. Przydatne:

| Placeholder | Wartość |
| --- | --- |
| `%server%`, `%server.name%` | Nazwa serwera |
| `%server.members%` | Liczba członków z pamięci podręcznej |
| `%server.id%`, `%server.icon%` | ID serwera i URL ikony |
| `%channel%`, `%channel.name%` | Wzmianka i nazwa kanału powtarzacza |
| `%bot.name%`, `%bot.avatar%` | Nazwa i awatar bota |
| `%server.time%`, `%time.day%` | Czas serwera i bieżący dzień tygodnia |

Placeholdery GIF-ów z reakcjami, takie jak `%huggif%`, również są zastępowane. Placeholdery wyzwalacza, takie jak `%user%`, są zamieniane na bota.

## Ustawienia

Strona Powtarzaczy ma trzy zakładki: **Przegląd**, **Zarządzaj powtarzaczami** i **Utwórz nowy**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Kanał docelowy | brak | Kanał tekstowy lub forum, na którym publikować |
| Filtry tagów forum | brak | Wymagane i wykluczone tagi, tylko dla kanałów forum |
| Treść wiadomości | brak | Otwiera edytor embedów |
| Tryb wyzwalania | Odstęp czasu | Jeden z pięciu trybów |
| Powtarzaj co | 5 minut | Gotowe wartości od 1 minuty do Codziennie albo własna wartość `HH:MM:SS` |
| Nie powtarzaj, jeśli wiadomość jest już ostatnia na kanale | wyłączone | Sprawdzenie redundancji |
| Zezwalaj na wzmianki @everyone i @here | wyłączone | Zachowuje wzmianki masowe w wiadomości zamiast je neutralizować |
| Priorytet (0-100) | 50 | Wartość priorytetu pokazywana na liście |
| Pozycja w kolejce | 0 | Zapisana wartość kolejności |
| Czas rozpoczęcia (GG:MM) | brak | Godzina dnia, do której wyrównać powtarzacz z odstępem czasu |
| Wykrywanie rozmowy | wyłączone | Opóźnienie, gdy ludzie rozmawiają |
| Wycisz powiadomienia | wyłączone | Wysyłanie bez dźwięku |
| Automatycznie twórz w nowych wątkach | wyłączone | Sticky w wątkach, tylko kanały forum |
| Tryb tylko wątków | wyłączone | Pomija kanał nadrzędny, tylko kanały forum |
| Automatyczne usunięcie po (dniach) | brak | Maksymalny wiek w formacie `d.hh:mm:ss`, na przykład `7.00:00:00` |
| Maks. wysłań | bez limitu | Liczba wysłań przed usunięciem |
| Harmonogram czasowy | brak | Gotowe przyciski albo własny harmonogram |
| Próg aktywności / Wymagane wiadomości | 5 | Liczba wiadomości dla trybów opartych na aktywności |
| Okno czasu | 00:05:00 | Okno dla trybów opartych na aktywności |

**Przegląd** pokazuje sumy, liczbę aktywnych powtarzaczy, łączną liczbę wysłań, podział według trybu wyzwalania i najbardziej aktywne powtarzacze. **Zarządzaj powtarzaczami** wyświetla każdy z nich z przyciskami **Edytuj**, **Uruchom teraz** i **Usuń**, a także szybką edycję odstępu, progu, maksymalnego wieku i maksymalnej liczby uruchomień.

## Krok po kroku

1. Otwórz **Powtarzacze** w panelu i wybierz **Utwórz nowy**.
2. Wybierz **Kanał docelowy**. W przypadku forum zaznacz **Tryb tylko wątków** i ustaw dowolne **Filtry tagów forum**.
3. Kliknij pole **Treść wiadomości** i zbuduj wiadomość w edytorze embedów.
4. Wybierz **Tryb wyzwalania**. Dla sticky wybierz Natychmiast; dla przypomnienia Odstęp czasu z gotową wartością **Powtarzaj co**.
5. Otwórz **Opcje zaawansowane**, jeśli chcesz redundancji, wysyłania bez dźwięku, harmonogramu czasowego lub wygaśnięcia.
6. Kliknij **Utwórz powtarzacz**, a następnie użyj **Uruchom teraz** na karcie Zarządzaj, aby go przetestować.

> [!NOTE]
> Harmonogramy czasowe wymagają strefy czasowej serwera. Ustaw ją komendą do strefy czasowej, zanim włączysz okna godzin pracy, wieczoru lub weekendu.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, jeśli go nie zmieniałeś). Wszystkie wymagają uprawnienia Zarządzanie wiadomościami. Do powtarzaczy odwołujesz się ich numerem z `repeatlist`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `repeat [time] [interval] <message>` | | Zarządzanie wiadomościami | Utwórz powtarzacz na bieżącym kanale, na przykład `repeat 6h Read the rules` albo `repeat 18:00 Event tonight` |
| `repeatlist` | `replst`, `replist`, `repli` | Zarządzanie wiadomościami | Lista powtarzaczy z kanałem, trybem, odstępem i następnym uruchomieniem |
| `repeatinvoke <index>` | `repinv` | Zarządzanie wiadomościami | Uruchom powtarzacz teraz i zrestartuj jego timer |
| `repeatremove <index>` | `reprm` | Zarządzanie wiadomościami | Usuń powtarzacz |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Zarządzanie wiadomościami | Włącz lub wyłącz bez usuwania |
| `repeatmessage <index> <message>` | `repmsg` | Zarządzanie wiadomościami | Zastąp wiadomość |
| `repeatchannel <index> [#channel]` | `repchan` | Zarządzanie wiadomościami | Przenieś na kanał tekstowy lub forum |
| `repeatredundant <index>` | `repeatredun`, `repred` | Zarządzanie wiadomościami | Przełącz sprawdzenie redundancji |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Zarządzanie wiadomościami | `timeinterval`, `immediate`, `aftermessages`, `onactivity` albo `onnoactivity` |
| `repeatactivity <index> <threshold> <window>` | `repactivity`, `repact` | Zarządzanie wiadomościami | Ustaw próg aktywności i okno, na przykład `10 5m` |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Zarządzanie wiadomościami | Ustaw wartość priorytetu |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Zarządzanie wiadomościami | `business`, `evening`, `weekend` albo `none`, aby wyczyścić |
| `repeatconversation <index>` | `repconversation`, `repconv` | Zarządzanie wiadomościami | Przełącz wykrywanie rozmowy |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Zarządzanie wiadomościami | Przełącz wysyłanie bez dźwięku |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Zarządzanie wiadomościami | Przełącz publikowanie w nowych wątkach |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Zarządzanie wiadomościami | Przełącz tryb tylko wątków |
| `repeatforumtags <index> <add/remove/clear/list> [required/excluded] [tags]` | `repforumtags`, `repftags` | Zarządzanie wiadomościami | Zarządzaj filtrami tagów forum po ID tagu |

## Wskazówki i pułapki

- Bot potrzebuje uprawnień Send Messages, Embed Links i Zarządzanie wiadomościami na kanale, ponieważ przed ponowną publikacją usuwa swoją poprzednią kopię.
- Jeśli kanał zostanie usunięty albo bot straci dostęp, powtarzacz usuwa się sam.
- Powtarzacze ładują się krótko po starcie bota. Do czasu zakończenia tego procesu komendy po cichu nic nie robią.
- Tryb Natychmiast publikuje ponownie przy każdej wiadomości od kogoś innego, więc unikaj go na bardzo szybkich kanałach albo łącz go z Wykrywaniem rozmowy.
- Tylko członek z uprawnieniem Mention Everyone może utworzyć powtarzacz, który oznacza wszystkich albo rolę; w przeciwnym razie wzmianka zostaje escapowana.
- Tryby oparte na aktywności zależą od liczenia wiadomości. Włącz je przed zmianą trybu, bo inaczej komenda odmówi.
- Wygaśnięcie z **Maks. wysłań** liczy każde wysłanie, w tym te, które sam uruchomisz ręcznie.

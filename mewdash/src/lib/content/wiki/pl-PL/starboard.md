---
title: Starboard
slug: starboard
summary: Pozwól członkom głosować reakcją na najlepsze wiadomości i publikuj ponownie wszystko, co osiągnie próg, na dedykowanym kanale z wyróżnieniami.
icon: fa-star
category: Community
dashboard: /dashboard/starboard
module: Starboard
tags: [starboard, stars, highlights, best of, reactions, pins, repost, threshold, gwiazdki, wyróżnienia, najlepsze, reakcje, przypięte, ponowna publikacja, próg]
related: [settings, logging]
---

## Co robi

Starboard to kanał, na którym bot ponownie publikuje wiadomości, na które wystarczająco wiele osób zareagowało wybraną emotką. Członkowie reagują na coś zabawnego lub przydatnego; gdy liczba reakcji osiągnie próg, bot kopiuje wiadomość na kanał starboardu z nazwą autora, tekstem, wszelkimi obrazami lub filmami, bieżącą liczbą reakcji i przyciskiem **Jump to Message**.

Post jest na bieżąco aktualizowany, gdy reakcje przybywają i znikają. Jeśli liczba reakcji spadnie poniżej progu, post może zostać usunięty. Jeśli oryginalna wiadomość zostanie usunięta lub jej reakcje wyczyszczone, post również może zostać usunięty.

Serwer może prowadzić kilka starboardów naraz, każdy z własnym kanałem, własną emotką lub zestawem emotek, własnym progiem i własnymi regułami. Tablica „najlepsze memy” obserwująca jedną emotkę i tablica „pomocne odpowiedzi” obserwująca inną mogą działać obok siebie.

## Do czego Ci się przyda

- Daj społeczności sposób na wydobywanie najlepszych treści bez kuratorowania przez moderatorów.
- Prowadź długowieczny kanał z wyróżnieniami, który nowi członkowie mogą przewijać.
- Prowadź osobne tablice dla humoru, sztuki lub pomocnych odpowiedzi, każdą z innymi emotkami.
- Ogranicz, które kanały zasilają tablicę, aby spam botów i kanały nie na temat zostały poza nią.

## Wiele starboardów i emotek

Każdy starboard jest identyfikowany numerycznym ID pokazywanym przez `liststarboards` i na liście w panelu. Komendy przyjmują to ID jako pierwszy argument.

Starboard zaczyna z jedną emotką i można dodać kolejne. Każda z jego emotek liczy się do tej samej sumy, a post pokazuje osobną liczbę dla każdej emotki. Emotka może należeć tylko do jednego starboardu na serwerze; próba ponownego użycia kończy się błędem „emote already in use”. Starboard musi zachować co najmniej jedną emotkę, więc ostatniej nie można usunąć.

Własne emotki działają tak samo jak Unicode. Bot testuje emotkę, reagując na wiadomość z Twoją komendą, więc musi to być taka, której bot może używać.

## Progi i liczenie

**Próg gwiazdek** to liczba reakcji, której wiadomość potrzebuje, zanim zostanie opublikowana. Domyślnie z komendy jest to 1; panel wymaga co najmniej 1.

Podczas liczenia bot:

- Ignoruje reakcje od kont botów.
- Sumuje reakcje ze wszystkich emotek należących do tego starboardu.
- Liczy reakcję samego autora. Nie ma wykluczenia samodzielnego dawania gwiazdki.
- Reaguje tylko na wiadomości, które mają tekst lub załącznik. Wiadomość bez żadnego z nich jest pomijana.

Jeśli suma jest poniżej progu, a post już istnieje, post jest usuwany, gdy włączone jest **Usuń poniżej progu**. W przeciwnym razie post zostaje taki, jaki był.

## Wiadomości botów

Domyślnie wiadomości napisane przez boty nigdy nie są publikowane. Włącz **Zezwalaj na wiadomości botów**, aby je uwzględniać. W przypadku wiadomości bota tekst jest brany z opisu pierwszego embeda, jeśli ma embedy, a w przeciwnym razie ze zwykłej treści, a obraz pochodzi z pierwszego załącznika lub pierwszego obrazu embeda. Gdy wiadomości botów są dozwolone, reakcje botów są też liczone w liczbach dla poszczególnych emotek pokazywanych na poście.

## Próg ponownej publikacji

Normalnie bot edytuje istniejący post starboardu w miejscu za każdym razem, gdy liczba się zmienia. Gdy tablica jest ruchliwa, ten post może być daleko w górze kanału, gdzie nikt nie widzi zaktualizowanej liczby.

**Próg ponownej publikacji** to naprawia. Ustaw go na liczbę N, a przy każdej aktualizacji bot spojrzy na ostatnie N wiadomości na kanale starboardu. Jeśli istniejący post jest wśród nich, jest edytowany. Jeśli przewinął się dalej niż to, stary post jest usuwany, a świeży wysyłany na dole. Ustaw 0, aby wyłączyć ponowną publikację i zawsze edytować w miejscu.

## Filtrowanie kanałów

Każdy starboard ma listę kanałów i tryb:

| Tryb | Efekt |
| --- | --- |
| Biała lista (domyślnie) | Brane są pod uwagę tylko wiadomości na wymienionych kanałach. Pusta lista oznacza każdy kanał. |
| Czarna lista | Wiadomości na wymienionych kanałach są ignorowane. Wszystko inne jest brane pod uwagę. |

`starboardchtoggle <id> #channel` dodaje kanał do listy lub go z niej usuwa. Akcja **Zarządzaj kanałami** w panelu robi to samo.

## Post starboardu

Post jest zbudowany z komponentów, a nie z klasycznego embeda:

- Linia nad kontenerem z każdą emotką i jej liczbą.
- Nazwa autora, z linkiem do jego profilu.
- Tekst wiadomości.
- Galeria multimediów z załącznikami obrazów i filmów.
- Do trzech innych załączników, ponownie wysłanych na kanał starboardu. Jeśli pobranie się nie powiedzie, zamiast tego pokazywana jest nazwa pliku i rozmiar.
- Przycisk-link **Jump to Message**.

Wzmianki w ponownie opublikowanym tekście są tłumione, więc wiadomość z gwiazdką nie może nikogo oznaczyć po raz drugi.

## Reguły usuwania

| Reguła | Domyślnie | Kiedy działa |
| --- | --- | --- |
| Usuń po usunięciu | Włączone | Oryginalna wiadomość zostaje usunięta. Wymaga Zarządzania wiadomościami dla bota na kanale źródłowym. |
| Usuń po wyczyszczeniu reakcji | Włączone | Moderator czyści wszystkie reakcje z oryginału. |
| Usuń poniżej progu | Włączone | Suma spada poniżej progu po usunięciu reakcji. |

## Statystyki

`starboardstats` pokazuje sumy dla serwera: liczbę wiadomości z gwiazdką, łączną liczbę gwiazdek, członka z największą liczbą gwiazdek, najbardziej aktywny kanał i najbardziej aktywnego dającego gwiazdki. `starboarduserstats [@user]` pokazuje liczbę wiadomości członka z gwiazdką, otrzymane gwiazdki, dane gwiazdki, jego najlepsze posty, kto daje mu najwięcej gwiazdek i komu on daje najwięcej. Oba są dostępne dla wszystkich.

## Ustawienia

Strona Starboard ma dwie sekcje: **Utwórz nowy starboard** i **Zarządzaj starboardami**. Każdy wpis na liście pokazuje swój kanał, emotkę, próg i próg ponownej publikacji, z przyciskami **Ustawienia starboardu**, **Zarządzaj kanałami** i **Usuń**.

Wewnątrz **Ustawienia starboardu**:

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Próg gwiazdek | ustawiany przy tworzeniu | Reakcje potrzebne, zanim wiadomość zostanie opublikowana |
| Próg ponownej publikacji | 0 (wyłączony) | Ile ostatnich wiadomości przeszukać, zanim opublikuje się ponownie na dole |
| Emotki gwiazdek | emotka z tworzenia | Dodawaj lub usuwaj emotki, które liczą się dla tej tablicy |
| Zezwalaj na wiadomości botów | Wyłączone | Uwzględnia wiadomości napisane przez boty |
| Usuń po usunięciu | Włączone | Usuwa post, gdy oryginał zostanie usunięty |
| Usuń po wyczyszczeniu reakcji | Włączone | Usuwa post, gdy reakcje zostaną wyczyszczone |
| Usuń poniżej progu | Włączone | Usuwa post, gdy liczba spadnie poniżej progu |
| Tryb kanałów | Biała lista | Czy lista kanałów jest białą czy czarną listą |

> [!TIP]
> Na aktywnym serwerze zacznij od progu 3 do 5. Próg 1 zamienia każdą zabłąkaną reakcję w post.

## Konfiguracja krok po kroku

1. Utwórz kanał na wyróżnienia i upewnij się, że bot może tam wysyłać wiadomości, osadzać linki i załączać pliki.
2. Otwórz **Starboard** w panelu.
3. W sekcji **Utwórz nowy starboard** wybierz kanał, wybierz emotkę z szybkich propozycji lub wpisz własną, ustaw **Próg (wymagane reakcje)** i naciśnij **Utwórz starboard**.
4. Otwórz **Ustawienia starboardu** na nowym wpisie. Dodaj dodatkowe emotki w sekcji **Emotki gwiazdek** i ustaw **Próg ponownej publikacji**, na przykład 20, jeśli tablica będzie ruchliwa.
5. Użyj **Zarządzaj kanałami**, aby dodać do białej listy kanały, które mają zasilać tablicę, albo przełącz **Tryb kanałów** na czarną listę i wymień te do wykluczenia.
6. Zareaguj emotką na testową wiadomość tyle razy, aby osiągnąć próg, i sprawdź, czy pojawi się post.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniono). `<id>` to ID starboardu z `liststarboards`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `createstarboard #channel <emote> [threshold]` | `addstarboard`, `newstarboard` | Zarządzanie kanałami | Tworzy starboard, domyślny próg to 1 |
| `deletestarboard <id>` | `removestarboard`, `delstarboard` | Zarządzanie kanałami | Usuwa konfigurację starboardu |
| `liststarboards` | `starboardlist`, `starboards` | Nobody | Przegląda stronami każdy starboard i jego ustawienia |
| `setstarthreshold <id> <number>` | `starthreshold` | Zarządzanie kanałami | Ustawia wymaganą liczbę reakcji |
| `setrepostthreshold <id> <number>` | `starboardrepost`, `repostthreshold` | Zarządzanie kanałami | Ustawia okno ponownej publikacji, 0 wyłącza |
| `addstarboardemote <id> <emote>` | `addstaremote`, `starboardaddemote`, `asbe` | Zarządzanie kanałami | Dodaje emotkę do starboardu |
| `removestarboardemote <id> <emote>` | `removestaremote`, `starboardremoveemote`, `rsbe` | Zarządzanie kanałami | Usuwa emotkę, nie można usunąć ostatniej |
| `starboardallowbots <id> <true or false>` | `starbots`, `starbotsallow`, `starbab` | Zarządzanie kanałami | Zezwala na wiadomości napisane przez boty |
| `starboardremoveondelete <id> <true or false>` | `starboarddelete`, `stardelete`, `srod` | Zarządzanie kanałami | Usuwa post, gdy oryginał zostanie usunięty |
| `starboardremoveonreactionsclear <id> <true or false>` | `starboardreactionclear`, `starclear` | Zarządzanie kanałami | Usuwa post, gdy reakcje zostaną wyczyszczone |
| `starboardremoveonbelowthreshold <id> <true or false>` | `starboardbelowthreshold`, `starbelow`, `srobt` | Zarządzanie kanałami | Usuwa post, gdy spadnie poniżej progu |
| `starboardwlmode <id> <whitelist or blacklist>` | `starboardmode`, `starboardwhitelist`, `swm` | Zarządzanie kanałami | Ustawia, jak traktowana jest lista kanałów |
| `starboardchtoggle <id> #channel` | `starboardchannel`, `togglestarboardchannel`, `scht` | Zarządzanie kanałami | Dodaje kanał do listy lub go z niej usuwa |
| `starboardstats` | `starstats`, `starboardstatistics`, `sbstats` | Nobody | Statystyki starboardu dla całego serwera |
| `starboarduserstats [@user]` | `staruserstats`, `userstarstats`, `sbuserstats` | Nobody | Statystyki jednego członka |

Odpowiedniki slash znajdują się pod `/starboard`.

## Wskazówki i pułapki

- Bot po cichu nic nie robi, jeśli nie może wysyłać wiadomości na kanale starboardu. Najpierw sprawdź uprawnienia kanału.
- Usuń po usunięciu działa tylko wtedy, gdy bot ma Zarządzanie wiadomościami na kanale, na którym była oryginalna wiadomość.
- Reakcje od botów nigdy nie liczą się do progu, więc inny bot automatycznie reagujący nie może wepchnąć wiadomości na tablicę.
- Usunięcie starboardu usuwa tylko jego konfigurację. Istniejące posty na kanale zostają.
- Tej samej emotki nie można współdzielić między dwiema tablicami. Wybierz osobne emotki dla każdej.
- Bardzo duże załączniki mogą się nie wysłać ponownie; post wtedy wypisuje zamiast nich nazwę pliku.

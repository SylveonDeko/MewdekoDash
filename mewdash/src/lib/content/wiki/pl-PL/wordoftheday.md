---
title: Słowo dnia
slug: wordoftheday
summary: Publikuje jedno słowo słownikowe dziennie z definicją, wymową i przykładem, wybrane ze słownika według tematu i trudności albo z listy, którą serwer tworzy sam.
icon: fa-book-open
category: Community
dashboard: /dashboard/wordoftheday
module: WordOfTheDay
tags: [word of the day, wotd, vocabulary, dictionary, definition, daily, datamuse, topic, schedule, słowo dnia, wotd, słownictwo, słownik, definicja, codziennie, datamuse, temat, harmonogram]
related: [birthday, utility]
---

## Co to robi

Raz dziennie, o godzinie wybranej przez serwer w jego strefie czasowej, bot publikuje słowo na wybranym kanale. Post pokazuje słowo, sposób jego wymowy, część mowy, definicję i zdanie przykładowe, jeśli istnieje. Przy każdym poście można oznaczać rolę.

Słowa pochodzą ze słownika Datamuse i są filtrowane trzema ustawieniami: **temat**, do którego słowa mają się skłaniać, **część mowy** oraz **trudność**, oparta na tym, jak często słowo występuje w pisanym angielskim. Bot unika powtarzania czegokolwiek, co publikował w ciągu ostatnich dziewięćdziesięciu dni.

Serwery mogą też zbudować **własną listę** poleceniem `wotdadd`. Jeśli definicja zostanie pominięta, bot ją wyszuka. **Tryb źródła** decyduje, czy posty pochodzą ze słownika, z własnej listy, czy z własnej listy najpierw, a ze słownika dopiero wtedy, gdy ta się wyczerpie.

## Harmonogram według dnia tygodnia lub miesiąca

Reguły mogą nadpisywać temat, część mowy i trudność dla konkretnego dnia tygodnia lub miesiąca. Reguła zmienia tylko pola, które ustawia, więc reguła na poniedziałek z samym tematem nadal używa podstawowej części mowy i trudności. Gdy obie się stosują, reguły dni tygodnia wygrywają z regułami miesięcznymi, a reguły miesięczne wygrywają z ustawieniami podstawowymi.

Przykłady:

- `wotdday monday science` ustawia tematykę słowa poniedziałkowego na science.
- `wotddayfilter friday adjective rare` ustawia piątki na rzadkie przymiotniki.
- `wotdmonth october spooky halloween` ustawia tematykę całego października.
- `wotdschedule` pokazuje wszystkie reguły i to, które filtry obowiązują dziś.

## Wątek dyskusji

Po włączeniu bot tworzy publiczny wątek pod każdym dziennym postem i dodaje wiadomość startową, zachęcającą do użycia słowa w zdaniu. Nazwa wątku pochodzi z szablonu (domyślnie `Word of the day: %wotd.word%`), który obsługuje `%wotd.word%`, `%wotd.date%`, `%wotd.pos%` i zwykłe symbole zastępcze serwera. `wotdthread` przełącza wątek na włączony lub wyłączony, `wotdthreadname` ustawia, pokazuje lub czyści szablon nazwy, a `wotdthreadarchive` ustawia, jak długo wątek pozostaje otwarty, zanim zostanie automatycznie zarchiwizowany (1 godzina, 1 dzień, 3 dni lub 1 tydzień).

## Komendy

| Komenda | Co robi |
| --- | --- |
| `wotd` | Pokazuje dzisiejsze słowo albo podgląd, jeśli nic jeszcze nie zostało opublikowane. |
| `wotdchannel #channel` | Ustawia kanał i włącza publikowanie. |
| `wotdtime 9` | Ustawia lokalną godzinę publikacji. |
| `wotdtimezone Europe/London` | Ustawia strefę czasową. |
| `wotdtopic space` | Ustawia podstawowy temat. |
| `wotdpos noun` | Ogranicza część mowy. |
| `wotddifficulty rare` | Ustawia trudność. |
| `wotdmode mixed` | Wybiera słownik, własną listę albo tryb mieszany. |
| `wotdadd word [definition]` | Dodaje własne słowo. |
| `wotdmessage` | Ustawia własny szablon wiadomości z symbolami zastępczymi albo JSON embeda. |
| `wotdthread` | Przełącza wątek dyskusji pod każdym postem. |
| `wotdthreadname [template\|clear]` | Ustawia, pokazuje lub czyści szablon nazwy wątku. |
| `wotdthreadarchive 1h\|24h\|3d\|7d` | Ustawia, jak długo wątek pozostaje otwarty, zanim zostanie zarchiwizowany. |
| `wotdpost` | Publikuje nowe słowo od razu. |

## Symbole zastępcze wiadomości

`%wotd.word%`, `%wotd.definition%`, `%wotd.pos%`, `%wotd.example%`, `%wotd.phonetic%`, `%wotd.date%` i `%wotd.ping%` są dostępne w niestandardowym szablonie obok zwykłych symboli zastępczych serwera.

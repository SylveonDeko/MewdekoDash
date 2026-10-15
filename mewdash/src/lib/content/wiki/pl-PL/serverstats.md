---
title: Statystyki aktywności
slug: serverstats
summary: Wiadomości, czas na kanałach głosowych, gry i wzrost liczby członków dla całego serwera, członka lub kanału w dowolnym okresie do dziewięćdziesięciu dni, z wykresami, rankingami, eksportami i rezygnacją z prywatności.
icon: fa-chart-simple
category: Analytics
dashboard: /dashboard/serverstats
module: ServerStats
tags: [activity, stats, statistics, statbot, voice time, games, presence, lookback, top chatters, charts, member growth, status, snapshots, privacy, opt out, aktywność, statystyki, czas głosowy, gry, okres, najaktywniejsi, wykresy, wzrost liczby członków, migawki, prywatność, rezygnacja]
related: [messagestats, statroles, liveboards, statchannels, invites]
---

## Co robi

Bot już liczył wiadomości. Statystyki aktywności dodają czas na kanałach głosowych, gry i aplikacje, godzinowe migawki członków i statusów oraz sposób na zapytanie o każde z tych danych w wybranym okresie: ostatni dzień, tydzień, miesiąc, do dziewięćdziesięciu dni albo cały czas. Wszystko jest dostępne w panelu, jako komendy, wykresy i CSV, a także w rolach statystyk, tablicach na żywo, raportach i kanałach statystyk.

## Co jest śledzone

| Dane | Jak |
| --- | --- |
| Wiadomości | Każda liczona wiadomość z sygnaturą czasową, przechowywana przez dziewięćdziesiąt dni, plus sumy od początku dla każdego członka i kanału |
| Czas na głosowym | Odcinek dla każdego członka na każdym kanale, dzielony za każdym razem, gdy członek przechodzi, się wycisza, ogłusza, zaczyna streamować albo włącza kamerę; przechowywany przez dziewięćdziesiąt dni, plus sumy od początku |
| Gry i aplikacje | Odcinek dla każdego członka i każdej aktywności (granie, streamowanie, słuchanie, oglądanie, rywalizacja), przechowywany przez dziewięćdziesiąt dni, plus sumy od początku. Domyślnie wyłączone |
| Migawki | Co godzinę liczba członków, ludzi, botów, osób online, nieaktywnych, z trybem Nie przeszkadzać, offline i na kanałach głosowych, przechowywana przez dziewięćdziesiąt dni |
| Dołączenia i wyjścia | Każde dołączenie i wyjście z sygnaturą czasową |

Okresy do dziewięćdziesięciu dni czytają dane z sygnaturami czasowymi. **Cały czas** czyta sumy od początku, więc działa dalej, nawet gdy dane z dziewięćdziesięciu dni już wygasły.

## Gry i aplikacje

Śledzenie gier jest wyłączone, dopóki go nie włączysz, bo to najcięższy tracker. Po włączeniu bot obserwuje obecność każdego członka i zapisuje, jak długo trwa każda gra, stream, sesja Spotify albo oglądana aplikacja.

- **Weryfikuj aktywności** (domyślnie włączone) liczy tylko aktywności potwierdzone przez sam Discord: te z zarejestrowanym ID aplikacji, Spotify i streamy. Zmodyfikowany klient może twierdzić, że gra w cokolwiek, więc przy włączonej opcji zwykłe nazwane aktywności są ignorowane.
- **Filtr aktywności** to lista nazw gier, która działa jako **czarna lista** (wymienione gry są ignorowane) albo **biała lista** (liczą się tylko wymienione).
- Niestandardowe statusy nigdy nie są liczone.

## Karty panelu

| Karta | Co pokazuje |
| --- | --- |
| Przegląd | Wiadomości, czas głosowy, piszący, dołączenia, wyjścia, wzrost netto, członkowie teraz, najaktywniejszy piszący, najaktywniejszy na głosowym, najbardziej ruchliwy kanał i najczęściej grana gra, a także wykresy wiadomości, godzin głosowych, członków, statusów członków oraz dołączeń i wyjść |
| Rankingi | Członkowie i kanały uszeregowani według wiadomości, czasu głosowego lub czasu gry oraz najpopularniejsze gry z liczbą graczy, eksportowane do CSV. Kliknij członka, kanał lub grę, aby je otworzyć |
| Członek i kanał | Wiadomości jednego członka, czas głosowy, rangi, sumy od początku, ulubione kanały i gry; aktywność jednego kanału i najaktywniejsi członkowie; **Kto gra** dla dowolnej gry |
| Ustawienia | Każdy tracker, domyślny okres, cooldown wiadomości, boty, stany głosu, które się nie liczą, ignorowane kanały, role i członkowie oraz filtr aktywności |

## Ustawienia

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Domyślny okres (dni) | 14 dni | Czego używają komendy i strona, gdy nie podano okresu |
| Cooldown wiadomości (sekundy) | 0 | Sekundy między liczonymi wiadomościami jednego członka. Zapobiega zawyżaniu liczb przez spam |
| Śledź czas na głosowym | włączone | Czy zapisywane są odcinki głosowe |
| Cogodzinne migawki | włączone | Czy liczba członków i statusów jest próbkowana co godzinę |
| Licz boty | wyłączone | Czy konta botów są uwzględniane |
| Śledź gry i aplikacje | wyłączone | Czy zapisywane są aktywności obecności |
| Weryfikuj aktywności | włączone | Liczy tylko aktywności potwierdzone przez Discord |
| Stany głosu, które się nie liczą | brak | Dowolny z: samodzielnie wyciszony, samodzielnie ogłuszony, wyciszony przez serwer, ogłuszony przez serwer, kanał AFK, sam(a), streamuje, kamera włączona |
| Ignorowane kanały, role, członkowie | brak | Nic z nich nie jest liczone |

## Prywatność

Każdy członek może uruchomić `statsprivacy` (albo `/serverstats privacy`), aby zrezygnować. Jego zapisane wiadomości, czas głosowy i czas gry są usuwane na każdym serwerze, który bot dzieli z nim, a nic nowego nie jest zapisywane, dopóki nie uruchomi komendy ponownie, aby wrócić. Administratorzy serwera nie mogą tego nadpisać.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś). Każda komenda istnieje też pod `/serverstats`. `days` to okres; 0 oznacza cały czas, a pominięcie daje domyślny okres serwera.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `serveractivity [days]` | `sstats` | Nikt | Przegląd aktywności serwera |
| `useractivity [@user] [days]` | `ustats`, `mystats` | Nikt | Wiadomości członka, czas głosowy, rangi, sumy od początku, najczęstsze kanały i gry |
| `channelactivity [#channel] [days]` | `cstats` | Nikt | Aktywność kanału i najaktywniejsi członkowie |
| `activitytop [Messages/Voice/Activity] [days] [@role]` | `topchatters`, `topvoice` | Nikt | Ranking członków |
| `activitytopchannels [Messages/Voice] [days]` | `topchannels` | Nikt | Ranking kanałów |
| `topgames [days]` | `games` | Nikt | Najczęściej grane gry i aplikacje |
| `whoplays <game>` | | Nikt | Kto jest teraz w grze i kto grał w nią najwięcej |
| `activitychart [Messages/Voice/Members/Status/Joins/Leaves/Growth/InVoice/Activities] [days]` | `graph` | Nikt | Obraz wykresu |
| `activityexport [Messages/Voice/Activity] [days]` | | Zarządzanie serwerem | Ranking w CSV |
| `statssettings` | | Zarządzanie serwerem | Pokazuje ustawienia |
| `statslookback <days>`, `statscooldown <seconds>` | `lookback` | Zarządzanie serwerem | Domyślny okres i cooldown wiadomości |
| `statstrackvoice`, `statstracksnapshots`, `statscountbots`, `statstrackactivities`, `statsverifyactivities` | `trackvoice`, `trackgames` | Zarządzanie serwerem | Przełącza każdy tracker |
| `statsignorevoicestate <state>` | | Zarządzanie serwerem | Przełącza, czy dany stan głosu się liczy |
| `statsignore <#channel, @role or @user>`, `statsignored` | | Zarządzanie serwerem | Wykluczenia |
| `statsactivityfiltermode <Whitelist/Blacklist>`, `statsactivityfilter <game>`, `statsactivityfilters` | `gamefilter` | Zarządzanie serwerem | Filtr aktywności |
| `statsprivacy` | `optoutstats` | Nikt | Rezygnacja z śledzenia lub powrót do niego wszędzie |

## Wskazówki i pułapki

- Wykresy członków i statusów zaczynają się wypełniać godzinę po włączeniu migawek; wcześniejszej historii nie ma.
- Czas głosowy liczy się tylko wtedy, gdy bot działa. Restart zamyka i ponownie otwiera każdą sesję, więc nic nie ginie, ale granice odcinków się przesuwają.
- Wykluczenie kanału ukrywa jego historię we wszystkich zapytaniach, a nie tylko zatrzymuje nowe liczenia, więc stare liczby też się zmieniają.
- Samo liczenie wiadomości musi być włączone (przełącznik na stronie Statystyki wiadomości), aby liczby wiadomości pojawiły się tutaj.
- Nazwy gier są dopasowywane bez rozróżniania wielkości liter w filtrze i w `whoplays`.

---
title: Uprawnienia komend
slug: permissions
summary: Zdecyduj, kto może uruchamiać które komendy i gdzie, za pomocą uporządkowanej listy reguł zezwalających i zabraniających dla komend i modułów, obejmujących cały serwer, rolę, kanał, kategorię lub pojedynczego członka.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Permissions
tags: [permissions, command permissions, allow, deny, permission role, verbose, disable command, disable module, cooldown, dpo, permission override, blacklist, uprawnienia, uprawnienia komend, zezwól, zabroń, rola uprawnień, wyłącz komendę, wyłącz moduł, czas odnowienia, wyjątki uprawnień, czarna lista]
related: [administration, help, filter, moderation]
---

## Co robi

Domyślnie każda komenda jest dostępna dla wszystkich, którym pozwalają na to uprawnienia Discorda. Uprawnienia komend dodają na wierzchu listę reguł specyficzną dla serwera. Każda reguła mówi, czy komenda, moduł lub wszystkie moduły są dozwolone albo zabronione dla całego serwera, roli, kanału, kategorii lub jednego członka. Gdy ktoś uruchamia komendę, bot przechodzi po liście, stosuje pierwszą pasującą regułę i albo przepuszcza komendę, albo ją zatrzymuje.

Zablokowane komendy kończą się po cichu, chyba że włączony jest tryb **verbose**; wtedy bot odpowiada numerem i tekstem reguły, która je zablokowała. Komendy slash zawsze dostają wyjaśnienie widoczne tylko dla użytkownika (ephemeral).

Regułami mogą zarządzać administratorzy lub każdy, kto ma wybraną przez Ciebie **rolę uprawnień**. Ta sama lista jest w panelu w sekcji **Administracja**, w części **Automatyzacja i ustawienia**, jako karta **Uprawnienia komend**.

Obok działają dwa powiązane narzędzia. Czasy odnowienia komend ograniczają, jak często członek może użyć komendy na serwerze. Wyjątki uprawnień Discorda w module Administracji zastępują uprawnienie Discorda, które komenda normalnie wymaga, na przykład pozwalając osobom z Zarządzaniem wiadomościami używać komendy, która normalnie wymaga Administratora.

## Do czego Ci się przyda

- Trzymanie zabawnych i NSFW komend z dala od poważnych kanałów.
- Wyłączenie modułu Muzyka wszędzie poza kanałem komend bota.
- Pozwolenie roli pomocników na użycie `warn` bez dawania im Zarządzania wiadomościami ani Administratora.
- Powstrzymanie jednego uciążliwego członka przed jakimkolwiek używaniem bota.
- Ograniczenie hałaśliwej komendy, jak `roll`, do raz na dziesięć sekund na członka.

## Jak zapisuje się regułę

Każda reguła ma trzy części.

| Część | Opcje |
| --- | --- |
| Co | Jedna komenda, jeden moduł lub wszystkie moduły |
| Dla | Cały serwer, rola, kanał, kategoria lub konkretny użytkownik |
| Akcja | Zezwól lub zabroń |

Nazwy komend w poniższej tabeli kodują pierwsze dwie części. Pierwsze litery wybierają cel (`s` serwer, `r` rola, `c` kanał, `ca` kategoria, `u` użytkownik), ostatnie wybierają zakres (`cmd` komenda, `mdl` moduł), a formy `all...mdls` obejmują wszystkie moduły.

| Komenda | Tworzona reguła |
| --- | --- |
| `srvrcmd <command> <enable|disable>` | Komenda dla całego serwera |
| `srvrmdl <module> <enable|disable>` | Moduł dla całego serwera |
| `allsrvrmdls <enable|disable>` | Każdy moduł dla całego serwera |
| `rolecmd <command> <enable|disable> <role>` | Komenda dla roli |
| `rolemdl <module> <enable|disable> <role>` | Moduł dla roli |
| `allrolemdls <enable|disable> <role>` | Każdy moduł dla roli |
| `chnlcmd <command> <enable|disable> <#channel>` | Komenda na kanale |
| `chnlmdl <module> <enable|disable> <#channel>` | Moduł na kanale |
| `allchnlmdls <enable|disable> <#channel>` | Każdy moduł na kanale |
| `catcmd <command> <enable|disable> <category>` | Komenda w każdym kanale kategorii |
| `catmdl <module> <enable|disable> <category>` | Moduł w kategorii |
| `allcatmdls <enable|disable> <category>` | Każdy moduł w kategorii |
| `usrcmd <command> <enable|disable> @user` | Komenda dla jednego członka |
| `usrmdl <module> <enable|disable> @user` | Moduł dla jednego członka |
| `allusrmdls <enable|disable> @user` | Każdy moduł dla jednego członka |

Wyzwalacze liczą się jako komendy: podaj numer lub tekst wyzwalacza tam, gdzie oczekiwana jest nazwa komendy.

> [!EXAMPLE]
> `srvrmdl nsfw disable`, a potem `chnlmdl nsfw enable #adult` blokuje moduł NSFW wszędzie poza jednym kanałem.

## Kolejność reguł

`listperms` pokazuje listę numerowaną od 1. Reguła 1 to zawsze „zezwól na wszystkie moduły dla całego serwera” i nie można jej edytować ani usunąć; jest domyślna, gdy nic innego nie pasuje.

Nowe reguły są dopisywane na koniec listy. Gdy komenda jest uruchamiana, bot sprawdza reguły, zaczynając od najwyższego numeru i idąc w stronę reguły 1, a decyduje pierwsza reguła, której cel i zakres pasują. Oznacza to, że wygrywa najnowsza pasująca reguła, dlatego powyższy przykład działa: zezwolenie dla kanału zostało dodane po zakazie dla serwera.

`moveperm <from> <to>` zmienia pozycję reguły i numeruje wszystko od nowa, więc możesz przesunąć wyjątek nad lub pod szerszą regułę bez jej odtwarzania. `removeperm <number>` usuwa jedną regułę. `resetperms` czyści listę z powrotem do reguły 1 i wymaga Administratora.

Panel wypisuje te same reguły ze strzałkami w górę i w dół oraz przyciskiem usuwania przy każdej regule.

## Tryb verbose

`verbose` przełącza, czy zablokowana komenda tekstowa dostaje komunikat o błędzie z nazwą blokującej reguły, np. „permission 4 (`.chnlmdl nsfw disable #general`) prevents this”. Domyślnie jest wyłączony. Po wyłączeniu zablokowane komendy są po cichu ignorowane, co jest właściwe dla większości serwerów i zapobiega testowaniu przez członków tego, czego nie mogą uruchomić. Komendy slash zawsze odpowiadają z powodem, jako ephemeral, niezależnie od tego ustawienia.

## Kto może zmieniać reguły

Każda komenda tego modułu przechodzi dodatkową bramkę. Administratorzy mogą ich używać zawsze. Każdy inny potrzebuje **roli uprawnień** ustawionej przez `permrole <role>`. Bez niej nie-administratorzy dostają informację, że potrzebują uprawnień Admina (tylko jeśli verbose jest włączony), i komenda się zatrzymuje. `permrole` bez argumentu pokazuje bieżącą rolę; `permrole reset` ją czyści. Roli `@everyone` nie można użyć.

`resetperms` i sam `permrole` zawsze wymagają dodatkowo Administratora.

## Czasy odnowienia

`cmdcooldown <command> [time]` ustawia czas odnowienia komendy dla każdego członka na tym serwerze, od 1 sekundy do 90000 sekund (25 godzin). Nie podawaj czasu lub podaj `0s`, aby go wyczyścić. `allcmdcooldowns` wypisuje bieżące czasy odnowienia. Są one dodatkiem do wszelkich wbudowanych czasów odnowienia, które komenda już ma.

## Wyjątki uprawnień Discorda

Moduł Administracji może zastąpić uprawnienie Discorda wymagane przez komendę. `dpo <command> <permissions...>` sprawia, że komenda wymaga wymienionych uprawnień zamiast wbudowanego, na przykład `dpo purge ManageMessages`. Uruchom `dpo <command>` bez uprawnień, aby usunąć wyjątek, `dpol`, aby je wypisać, i `dpor`, aby wyczyścić wszystkie po potwierdzeniu. Wszystkie trzy wymagają Administratora.

Wyjątek zastępuje tylko wbudowany wymóg Discorda. Powyższe reguły uprawnień komend nadal obowiązują, a strona komendy z `help <command>` pokazuje oryginalny wymóg przekreślony, a obok niego wyjątek.

## Szybkie menu w pomocy

`help <command>` pokazuje administratorom przycisk uprawnień. Otwiera on szybkie menu dla tej jednej komendy, które pokazuje reguły jej dotyczące, ostrzega przed zbędnymi regułami (dwiema regułami o tym samym celu i zakresie), proponuje ich rozwiązanie i pozwala dodawać reguły zezwalające i zabraniające dla komendy lub resetować jej uprawnienia bez opuszczania strony pomocy.

## Kontrola właściciela bota

Trzy grupy komend są ograniczone do właścicieli bota i dotyczą każdego serwera: uprawnienia globalne (`globalmodule`, `globalcommand`, `globalpermlist`, `resetglobalperms`) wyłączają moduł lub komendę wszędzie, a czarna lista (`userblacklist`, `channelblacklist`, `serverblacklist`, `manualblacklistcheck`) sprawia, że bot w ogóle nie odpowiada użytkownikowi, kanałowi lub serwerowi. Globalnie wyłączony moduł jest w menu pomocy oznaczony globusem i krzyżykiem.

## Ustawienia

W panelu otwórz **Administracja**, następnie sekcję **Automatyzacja i ustawienia**, a potem kartę **Uprawnienia komend**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Szczegółowe uprawnienia | wyłączone | Informuje użytkowników, gdy reguła blokuje komendę |
| Rola uprawnień | brak | Członkowie z tą rolą mogą edytować reguły przez komendy |
| Reguły | tylko reguła 1 | Uporządkowana lista; dodawaj przez **Akcja**, **Co** i **Dla**, a następnie moduł, komendę, rolę, kanał, kategorię lub ID użytkownika |

Karta pokazuje też liczbę własnych reguł i informację, czy tryb verbose jest włączony. Karta **Wyjątki uprawnień** w tej samej sekcji zarządza wyjątkami uprawnień Discorda: wybierz komendę bota i **Wymagane uprawnienie Discorda**, które ma ona wymagać zamiast wbudowanego.

## Konfiguracja krok po kroku

1. Zdecyduj o kształcie: zwykle „wszystko dozwolone, kilka rzeczy zabronionych” albo „wszystko zabronione, a potem dozwolone na kanałach botów”.
2. Dla drugiego kształtu uruchom `allsrvrmdls disable`, a następnie `allchnlmdls enable #bot-commands`.
3. Zachowaj działanie moderacji dla moderatorów: `rolemdl moderation enable @Mods` i `rolemdl administration enable @Mods`.
4. Uruchom `listperms` i czytaj od dołu, bo w tej kolejności bot je stosuje. Użyj `moveperm`, jeśli wyjątek leży pod regułą, którą ma nadpisać.
5. Nadaj zaufanym moderatorom `permrole @Mods`, aby mogli dostosowywać reguły bez Administratora.
6. Włącz `verbose` na czas testów, aby widzieć, która reguła się uruchamia, a potem wyłącz go z powrotem.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniono). Wersje slash znajdują się pod `/permissions`, na przykład `/permissions servercommand`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `listperms` | `lp` | Administrator lub rola uprawnień | Pokazuje numerowaną listę reguł |
| `verbose [true|false]` | `v` | Administrator lub rola uprawnień | Przełącza komunikaty o zablokowanych komendach |
| `permrole [role|reset]` | `pr` | Administrator | Pokazuje, ustawia lub resetuje rolę uprawnień |
| `removeperm <number>` | `rp` | Administrator lub rola uprawnień | Usuwa regułę |
| `moveperm <from> <to>` | `mp` | Administrator lub rola uprawnień | Zmienia kolejność reguł |
| `resetperms` | | Administrator | Usuwa wszystkie reguły |
| `srvrcmd <command> <enable|disable>` | `sc` | Administrator lub rola uprawnień | Reguła komendy, cały serwer |
| `srvrmdl <module> <enable|disable>` | `sm` | Administrator lub rola uprawnień | Reguła modułu, cały serwer |
| `allsrvrmdls <enable|disable>` | `asm` | Administrator lub rola uprawnień | Wszystkie moduły, cały serwer |
| `rolecmd <command> <enable|disable> <role>` | `rc` | Administrator lub rola uprawnień | Reguła komendy dla roli |
| `rolemdl <module> <enable|disable> <role>` | `rm` | Administrator lub rola uprawnień | Reguła modułu dla roli |
| `allrolemdls <enable|disable> <role>` | `arm` | Administrator lub rola uprawnień | Wszystkie moduły dla roli |
| `chnlcmd <command> <enable|disable> <#channel>` | `cc` | Administrator lub rola uprawnień | Reguła komendy na kanale |
| `chnlmdl <module> <enable|disable> <#channel>` | `cm` | Administrator lub rola uprawnień | Reguła modułu na kanale |
| `allchnlmdls <enable|disable> <#channel>` | `acm` | Administrator lub rola uprawnień | Wszystkie moduły na kanale |
| `catcmd <command> <enable|disable> <category>` | `cac` | Administrator lub rola uprawnień | Reguła komendy w kategorii |
| `catmdl <module> <enable|disable> <category>` | `cam` | Administrator lub rola uprawnień | Reguła modułu w kategorii |
| `allcatmdls <enable|disable> <category>` | `acamds` | Administrator lub rola uprawnień | Wszystkie moduły w kategorii |
| `usrcmd <command> <enable|disable> @user` | `uc` | Administrator lub rola uprawnień | Reguła komendy dla członka |
| `usrmdl <module> <enable|disable> @user` | `um` | Administrator lub rola uprawnień | Reguła modułu dla członka |
| `allusrmdls <enable|disable> @user` | `aum` | Administrator lub rola uprawnień | Wszystkie moduły dla członka |
| `cmdcooldown <command> [time]` | `cmdcd` | Administrator lub rola uprawnień | Ustawia lub czyści czas odnowienia |
| `allcmdcooldowns` | `acmdcds` | Administrator lub rola uprawnień | Wypisuje czasy odnowienia |
| `discordpermoverride <command> [permissions...]` | `dpo` | Administrator | Ustawia lub usuwa wyjątek uprawnień Discorda |
| `discordpermoverridelist` | `dpol`, `dpoli` | Administrator | Wypisuje wyjątki |
| `discordpermoverridereset` | `dpor` | Administrator | Czyści wszystkie wyjątki |
| `globalmodule <module>` | `gmod` | Właściciel bota | Przełącza moduł wszędzie |
| `globalcommand <command>` | `gcmd` | Właściciel bota | Przełącza komendę wszędzie |
| `globalpermlist` | `gpl`, `lgp`, `globalperms`, `listglobalperms` | Właściciel bota | Wypisuje blokady globalne |
| `resetglobalperms` | | Właściciel bota | Czyści blokady globalne |
| `userblacklist <add|remove> <user> [reason]` | `ubl` | Właściciel bota | Dodaje użytkownika do czarnej listy |
| `channelblacklist <add|remove> <id> [reason]` | `cbl` | Właściciel bota | Dodaje kanał do czarnej listy |
| `serverblacklist <add|remove> <server> [reason]` | `sbl` | Właściciel bota | Dodaje serwer do czarnej listy |
| `manualblacklistcheck` | `manualblcheck`, `mbc` | Właściciel bota | Ponownie uruchamia egzekwowanie czarnej listy |

## Wskazówki i pułapki

- `resetperms` jest zwolnione ze sprawdzania reguł, więc zawsze możesz się odzyskać po regule, która zablokowała wszystko, o ile jesteś administratorem.
- Reguły dopasowują się do kanonicznej nazwy komendy, więc `srvrcmd clear disable` i `srvrcmd purge disable` to ta sama reguła. Używaj pierwszej nazwy z `help <command>`.
- Reguła dla „wszystkich modułów” obejmuje też moduł Uprawnień. Jeśli zabronisz wszystkiego dla roli, członkowie mający tylko tę rolę nie będą mogli uruchomić nawet `listperms`.
- Reguły kategorii używają nadrzędnej kategorii kanału w chwili uruchomienia komendy; wątki dziedziczą po swoim kanale nadrzędnym.
- Wyjątki uprawnień Discorda zmieniają, jakie uprawnienie Discorda jest wymagane, a nie to, komu reguły zezwalają. Używaj obu razem: wyjątek, by obniżyć poprzeczkę, a potem reguła, by ograniczyć, gdzie.
- Reguły uprawnień nigdy nie dotyczą DM-ów.
- Panel oznacza wybory celu jako Cały serwer, Rola, Kanał, Kategoria i Konkretny użytkownik; opcja użytkownika przyjmuje wklejone ID użytkownika.

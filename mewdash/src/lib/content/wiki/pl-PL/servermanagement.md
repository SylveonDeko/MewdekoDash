---
title: Zarządzanie serwerem
slug: servermanagement
summary: Narzędzia zbiorcze do kształtowania serwera: tworzenie i usuwanie kanałów i ról, nadawanie ról setkom członków jednym zadaniem, blokada serwera, synchronizacja nadpisań kanałów, kradzież emotek i monitorowanie niebezpiecznych zmian ról.
icon: fa-server
category: Actions
module: ServerManagement
tags: [server management, roles, mass role, channels, lockdown, slowmode, lock channel, nuke, emotes, steal emotes, webhook, permcontrol, role monitor, role jobs, server icon, server banner, zarządzanie serwerem, role, masowe role, kanały, blokada, tryb powolny, emotki, monitor ról, ikona serwera, baner serwera]
related: [administration, permissions, moderation]
---

## Co robi

Zarządzanie serwerem zbiera komendy, które zmieniają strukturę serwera, a nie ludzi na nim. Moderatorzy mogą jedną linią utworzyć kategorię ze wszystkimi kanałami, zmieniać nazwy lub usuwać kanały, ustawiać tematy, przełączać NSFW, ustawiać tryb powolny, blokować kanał albo usunąć go i utworzyć na nowo, by wyczyścić jego historię.

Najwięcej uwagi zyskują role. Pojedyncze komendy tworzą, zmieniają nazwę, kolor, wyróżnienie i usuwają role albo nadają rolę jednemu członkowi, opcjonalnie z licznikiem czasu. Komendy masowe dodają lub usuwają rolę wszystkim członkom, wszystkim ludziom, wszystkim botom, wszystkim z inną rolą albo wszystkim, którzy dołączyli przed lub po wskazanej dacie. Działają jako zadania w tle, które można wypisać i zatrzymać.

Moduł obsługuje też wygląd samego serwera (ikona, baner, splash, nazwa), zarządzanie emotkami, w tym kradzież emotek z innych serwerów, nadpisania uprawnień dla poszczególnych kanałów, przenoszenie między kanałami głosowymi, trzy rodzaje blokady oraz monitor ról, który cofa i karze niebezpieczne zmiany ról.

Nic tutaj nie jest konfigurowane w panelu. Wszystko uruchamia się komendami.

## Do czego Ci się przyda

- Konfigurowanie nowego serwera i chęć utworzenia dziesięciu kanałów w kategorii bez dziesięciokrotnego klikania w interfejsie Discorda.
- Nadanie roli „Member” dwóm tysiącom istniejących członków po włączeniu ograniczania dostępu rolami.
- Zablokowanie serwera podczas rajdu, aby nikt nie mógł pisać, a potem dokładne przywrócenie dawnych uprawnień.
- Skopiowanie emotek z serwera znajomego jedną komendą.
- Powstrzymanie moderatora przed nadaniem sobie Administratora przez dodanie roli zabronionego uprawnienia z czarnej listy.

## Kanały

### Tworzenie i edycja

`creatxtchanl <name>` i `creatvoichanl <name>` tworzą pojedynczy kanał tekstowy lub głosowy. `deltxtchanl <#channel>` i `delvoichanl <channel>` usuwają jeden.

Rodzina `cc...` tworzy kilka naraz:

| Komenda | Co tworzy |
| --- | --- |
| `ccatc <category name> <channel names...>` | Nową kategorię i kanały tekstowe w niej |
| `ccavc <category name> <channel names...>` | Nową kategorię i kanały głosowe w niej |
| `cctc <existing category> <channel names...>` | Kanały tekstowe w już istniejącej kategorii |
| `ccvc <existing category> <channel names...>` | Kanały głosowe w już istniejącej kategorii |

`renamechannel <channel> <name>` zmienia nazwę dowolnego kanału, `setchanlname <name>` zmienia nazwę kanału, na którym jesteś, `settopic [text]` ustawia lub czyści temat bieżącego kanału, a `nsfwtoggle` przełącza flagę NSFW bieżącego kanału.

### Tryb powolny, blokada i nuke

Samo `slowmode` przełącza bieżący kanał między jedną minutą a wyłączeniem. `slowmode <time>`, np. `slowmode 30s`, ustawia konkretny odstęp, a obie formy przyjmują argument kanału. Wartości 21600 sekund (sześć godzin) lub większe są odrzucane.

`lock [#channel]` dodaje zakaz Wysyłania wiadomości dla roli `@everyone` na tym kanale; `unlock [#channel]` go usuwa. Istniejące bity nadpisań są zachowywane.

`nuke [#channel]` prosi o potwierdzenie, usuwa kanał i tworzy nowy o tej samej nazwie, pozycji, temacie, nadpisaniach uprawnień, fladze NSFW, kategorii i trybie powolnym. Przypięte wiadomości, webhooki i historia wiadomości przepadają na zawsze.

### Nadpisania uprawnień

`permcontrol <channel> <allow|deny|inherit> <role or user> <permissions...>` edytuje nadpisanie jednego celu na kanale, nie ruszając jego pozostałych bitów. `permview [@user or role]` wypisuje, jakie uprawnienia masz Ty, członek lub rola.

`syncroletoall <role>` kopiuje nadpisanie roli z bieżącego kanału do każdego kanału tekstowego i kategorii. `syncroletoallchannels` i `syncroletoallcategories` robią to tylko dla kanałów albo tylko dla kategorii. Rola musi już mieć nadpisanie na kanale, na którym uruchamiasz komendę.

### Webhooki

`createwebhook <#channel> <name> [avatar url]` tworzy webhook. Załączony obraz jest używany jako awatar, jeśli nie podasz URL. Bot potwierdza na kanale i wysyła Ci URL oraz token webhooka w DM.

## Kanały głosowe

- `moveto <voice channel>` przenosi Ciebie.
- `moveuserto @user <voice channel>` przenosi kogoś innego.
- `grab @user` przeciąga kogoś do kanału głosowego, na którym jesteś.

## Blokada serwera

`lockdown [type] [action] [override]` i `liftlockdown [type]` wymagają uprawnienia Administrator.

| Typ | Co robi |
| --- | --- |
| `Joins` | Każdy, kto dołączy, gdy blokada jest aktywna, zostaje wyrzucony lub zbanowany. Domyślną akcją jest `Ban`; jedyną inną opcją jest `Kick`. |
| `Readonly` | Bot zapisuje bieżące nadpisanie `@everyone` każdego kanału, a następnie zabrania Wysyłania wiadomości, tworzenia wątków i odpowiadania w wątkach na kanałach tekstowych oraz Łączenia i Mówienia na kanałach głosowych. Kanały forum zachowują Wysyłanie wiadomości, aby istniejące wątki pozostały czytelne. |
| `Full` | Oba powyższe. |

Przed zastosowaniem blokady tylko do odczytu bot sprawdza, czy może edytować każdy kanał. Jeśli któregoś brakuje, wypisuje je i zatrzymuje się, chyba że podasz `true` jako trzeci argument, aby mimo to kontynuować. Zdjęcie blokady przywraca zapisane nadpisania. Blokady dołączania przetrwają restart bota.

`unlockdown` to osobne, starsze narzędzie: włącza z powrotem Wysyłanie wiadomości dla samej roli `@everyone`, dla serwerów, które blokowały się przez edycję tej roli.

> [!WARNING]
> `lockdown` bez argumentów to blokada tylko do odczytu, a `lockdown joins` domyślnie banuje dołączających. Podaj `kick`, jeśli to jest to, czego chcesz.

## Role

### Komendy pojedynczych ról

| Komenda | Co robi |
| --- | --- |
| `createrole [name]` | Tworzy rolę, której nie można oznaczać |
| `deleterole <role>` | Usuwa rolę niższą niż Twoja najwyższa rola |
| `renamerole <role> <name>` | Zmienia nazwę roli |
| `rolecolor <role> [colour]` | Pokazuje kolor roli lub go ustawia |
| `rolehoist <role>` | Przełącza, czy rola jest wyświetlana osobno na liście członków |
| `setrole <role> @user [time]` | Nadaje rolę, opcjonalnie zabierając ją po `time`, np. `2h` |
| `removerole <role> @user` | Zabiera rolę |
| `removeallroles @user` | Usuwa wszystkie niezarządzane role członka |

Argumenty roli i członka można podawać w dowolnej kolejności w `setrole` i `removerole`.

### Kilka ról lub członków naraz

- `createroles <names...>` tworzy jedną rolę na słowo po potwierdzeniu listy.
- `deleteroles <roles...>` usuwa kilka ról po potwierdzeniu; role zarządzane są pomijane.
- `setroles @user <roles...>` nadaje kilka ról jednemu członkowi; `setroles @user <time> <roles...>` czyni je czasowymi.
- `removeroles @user <roles...>` zabiera kilka ról jednemu członkowi.
- `adduserstorole <role> @user @user...` i `removeusersfromrole <role> @user @user...` działają na kilku członkach.

### Zadania masowych ról

Przechodzą przez całą listę członków i działają jako zadania w tle. Ze względu na limity zapytań Discorda bot robi krótką przerwę dla każdego członka i pozwala na tylko pięć zadań naraz na serwer. Każde zadanie podaje, ile według szacunków potrwa.

| Komenda | Kogo dotyczy |
| --- | --- |
| `addtoall <role>` | Każdego członka, który nie ma roli |
| `addtoallusers <role>` | Tylko ludzi |
| `addtoallbots <role>` | Tylko botów |
| `addtousersover <time> <role>` | Członków, którzy dołączyli co najmniej `time` temu, np. `30d` |
| `addtousersunder <time> <role>` | Członków, którzy dołączyli później niż `time` temu |
| `addroletorole <role> <role2>` | Nadaje `role` wszystkim z `role2` |
| `addthenremove <role> <role2>` | Nadaje `role` wszystkim z `role2`, a potem zabiera `role2` |
| `removefromall <role>` | Wszystkich, którzy mają rolę |
| `removefromallusers <role>` | Tylko ludzi |
| `removefromallbots <role>` | Tylko botów |
| `removefromrole <role> <role2>` | Zabiera `role` wszystkim z `role2` |

`rolejobs` wypisuje działające zadania wraz z ich typem, osobą, która je uruchomiła, postępem i rolami. `stopjob <number>` anuluje jedno i podaje, jak daleko zaszło.

### Eksport i import

`exportrolelist` wysyła plik `rolelist.txt` z jedną linią `roleId,userId,roleName` na członkostwo dla każdej roli, którą bot może zarządzać. `importrolelist` czyta taki plik załączony do komendy i ponownie stosuje role; podaj `true`, aby tworzyć role według nazwy, gdy ID już nie istnieją. `addroletolist <role>` czyta załączoną listę ID użytkowników i nadaje im rolę.

## Wygląd serwera i emotki

`seticon <url>`, `setbanner <url>`, `setsplash <url>` i `setservername <name>` zmieniają sam serwer i wymagają uprawnienia Administrator. `setguildavatar`, `setguildbanner` i `setguildbio` zmieniają, jak sam bot wygląda wyłącznie na tym serwerze, i wymagają Zarządzania serwerem.

Komendy emotek wymagają Zarządzania wyrażeniami zarówno od Ciebie, jak i od bota:

- `addemote <name> [url]` wysyła emotkę z URL lub załączonego obrazu.
- `removeemote <emote>` i `renameemote <emote> <name>` działają na emotkach z tego serwera.
- `stealemotes <emotes...>` kopiuje wszystkie niestandardowe emotki z Twojej wiadomości na ten serwer. `sfr <role> <emotes...>` robi to samo, ale ogranicza emotki do jednej roli.
- Kliknięcie wiadomości prawym przyciskiem i wybranie **Steal Emotes** lub **Steal Sticker** z menu Aplikacje robi to samo bez pisania.

## Monitor ról

Monitor ról obserwuje dziennik audytu. Gdy członek otrzyma rolę z czarnej listy albo rola zyska uprawnienie z czarnej listy, bot cofa zmianę i karze osobę, która ją wykonała. Skonfigurować go może tylko właściciel serwera.

- `addblacklistedrole <role> [punishment]` i `removeblacklistedrole <role>`.
- `addblacklistedpermission <permission> [punishment]` i `removeblacklistedpermission <permission>`, np. `addblacklistedpermission Administrator Ban`.
- `setdefaultpunishment <punishment>` ustawia, co się dzieje, gdy wpis z czarnej listy nie ma własnej kary. Domyślnie jest to `None`.
- `addwhitelisteduser @user`, `addwhitelistedrole <role>` i ich odpowiedniki `remove...` zwalniają moderatorów spod monitora. Zmiany dokonane przez osoby z białej listy lub na nich są ignorowane.
- `listblacklists` pokazuje wszystko powyższe.

Wartości kar to `None`, `Warn`, `Mute`, `ChatMute`, `VoiceMute`, `Timeout`, `Kick`, `Softban`, `Ban`, `RemoveRoles`, `AddRole` i `Delete`. Gdy kilka uprawnień z czarnej listy dodaje się naraz, wygrywa najsurowsza kara.

## Ustawienia

Nie ma strony w panelu. Jedyne przechowywane ustawienia należą do monitora ról i stanu blokady.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Domyślna kara | None | Stosowana, gdy rola lub uprawnienie z czarnej listy nie ma ustawionej kary |
| Role z czarnej listy | brak | Role, które są usuwane po nadaniu, każda z opcjonalną karą |
| Uprawnienia z czarnej listy | brak | Uprawnienia cofane po dodaniu do roli, każde z opcjonalną karą |
| Użytkownicy i role z białej listy | brak | Zwolnieni spod monitora |
| Akcja blokady dołączania | Ban | Co dzieje się z członkami, którzy dołączą podczas blokady dołączania |

## Konfiguracja krok po kroku

1. Sprawdź, czy rola bota znajduje się nad każdą rolą, którą ma zarządzać, i czy ma Zarządzanie rolami i Zarządzanie kanałami.
2. Zbuduj układ: `ccatc Community general off-topic memes` tworzy kategorię i trzy kanały.
3. Utwórz role za jednym razem: `createroles Member Regular Veteran`.
4. Rozdaj rolę bazową: `addtoallusers Member`, a następnie obserwuj ją przez `rolejobs`.
5. Jako właściciel serwera zabezpiecz serwer: `addblacklistedpermission Administrator Ban` i `addwhitelistedrole Admin`.
6. Miej na uwadze `lockdown full kick` na sytuacje awaryjne i przetestuj później `liftlockdown full` w spokojny dzień.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniono).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `permview [@user or role]` | `pview` | Nobody | Wypisuje dozwolone uprawnienia |
| `setsplash <url>` | `setserversplash`, `setsplashimage` | Administrator | Ustawia splash zaproszenia |
| `seticon <url>` | `setservericon`, `seticonimage` | Administrator | Ustawia ikonę serwera |
| `setbanner <url>` | `setserverbanner` | Administrator | Ustawia baner serwera |
| `setservername <name>` | | Administrator | Zmienia nazwę serwera |
| `setguildavatar [url]` | `sgav`, `setgav` | Zarządzanie serwerem | Awatar bota na tym serwerze |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Zarządzanie serwerem | Baner bota na tym serwerze |
| `setguildbio <text>` | `sgbio`, `setgbio` | Zarządzanie serwerem | Opis bota na tym serwerze |
| `addemote <name> [url]` | `emoteadd`, `ae`, `ea` | Zarządzanie wyrażeniami | Wysyła emotkę |
| `removeemote <emote>` | `deleteemote`, `emoteremove`, `emotedelete` | Zarządzanie wyrażeniami | Usuwa emotkę |
| `renameemote <emote> <name>` | `emoterename` | Zarządzanie wyrażeniami | Zmienia nazwę emotki |
| `stealemotes <emotes...>` | `steal` | Zarządzanie wyrażeniami | Kopiuje emotki na ten serwer |
| `sfr <role> <emotes...>` | | Zarządzanie wyrażeniami | Kopiuje emotki, ograniczone do roli |
| `creatxtchanl <name>` | `ctch` | Zarządzanie kanałami | Tworzy kanał tekstowy |
| `creatvoichanl <name>` | `cvch` | Zarządzanie kanałami | Tworzy kanał głosowy |
| `deltxtchanl <#channel>` | `dtch` | Zarządzanie kanałami | Usuwa kanał tekstowy |
| `delvoichanl <channel>` | `dvch` | Zarządzanie kanałami | Usuwa kanał głosowy |
| `ccatc <category> <names...>` | | Zarządzanie kanałami | Nowa kategoria z kanałami tekstowymi |
| `ccavc <category> <names...>` | | Zarządzanie kanałami | Nowa kategoria z kanałami głosowymi |
| `cctc <category> <names...>` | | Zarządzanie kanałami | Kanały tekstowe w istniejącej kategorii |
| `ccvc <category> <names...>` | | Zarządzanie kanałami | Kanały głosowe w istniejącej kategorii |
| `renamechannel <channel> <name>` | `channelrename` | Zarządzanie kanałami | Zmienia nazwę kanału |
| `setchanlname <name>` | `schn` | Zarządzanie kanałami | Zmienia nazwę bieżącego kanału |
| `settopic [text]` | `st` | Zarządzanie kanałami | Ustawia lub czyści bieżący temat |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Zarządzanie kanałami | Przełącza flagę NSFW |
| `slowmode [time] [#channel]` | | Zarządzanie kanałami | Przełącza lub ustawia tryb powolny |
| `lock [#channel]` | `channellock`, `lockchannel` | Zarządzanie wiadomościami | Zabrania wszystkim Wysyłania wiadomości |
| `unlock [#channel]` | `channelunlock`, `unlockchannel` | Zarządzanie wiadomościami | Cofa `lock` |
| `nuke [#channel]` | `channelnuke`, `nukechannel` | Zarządzanie kanałami | Usuwa i tworzy kanał na nowo |
| `permcontrol <channel> <allow|deny|inherit> <role or user> <perms...>` | `permc` | Zarządzanie kanałami | Edytuje nadpisanie kanału |
| `syncroletoall <role>` | `synctoall` | Zarządzanie kanałami | Kopiuje nadpisanie do wszystkich kanałów i kategorii |
| `syncroletoallchannels <role>` | `srtch`, `srtach` | Zarządzanie kanałami | Kopiuje nadpisanie do kanałów tekstowych |
| `syncroletoallcategories <role>` | `srtc`, `srtac` | Zarządzanie kanałami | Kopiuje nadpisanie do kategorii |
| `createwebhook <#channel> <name> [avatar]` | `cwh` | Administrator | Tworzy webhook |
| `moveto <voice channel>` | | Nobody | Przenosi Ciebie |
| `moveuserto @user <voice channel>` | `moveuto` | Zarządzanie kanałami | Przenosi kogoś |
| `grab @user` | `getoverhere` | Nobody | Przeciąga kogoś do Twojego kanału głosowego |
| `lockdown [joins|readonly|full] [kick|ban] [true]` | `lockdownserver` | Administrator | Rozpoczyna blokadę |
| `liftlockdown [type]` | `unlockserver` | Administrator | Kończy blokadę |
| `unlockdown` | `endlockdown` | Zarządzanie kanałami | Ponownie włącza Wysyłanie wiadomości dla `@everyone` |
| `createrole [name]` | `cr` | Zarządzanie rolami | Tworzy rolę |
| `deleterole <role>` | `dr` | Zarządzanie rolami | Usuwa rolę |
| `renamerole <role> <name>` | `renr` | Zarządzanie rolami | Zmienia nazwę roli |
| `rolecolor <role> [colour]` | `roleclr` | Zarządzanie rolami przy ustawianiu | Pokazuje lub ustawia kolor roli |
| `rolehoist <role>` | `rh` | Zarządzanie rolami | Przełącza wyróżnienie |
| `setrole <role> @user [time]` | `sr`, `giverole` | Zarządzanie rolami | Nadaje rolę, opcjonalnie czasową |
| `removerole <role> @user` | `rr` | Zarządzanie rolami | Zabiera rolę |
| `removeallroles @user` | `rar` | Zarządzanie rolami | Zabiera wszystkie role |
| `createroles <names...>` | `croles`, `crs` | Zarządzanie rolami | Tworzy kilka ról |
| `deleteroles <roles...>` | `drs` | Zarządzanie rolami | Usuwa kilka ról |
| `setroles @user [time] <roles...>` | `srs` | Zarządzanie rolami | Nadaje kilka ról |
| `removeroles @user <roles...>` | `rrs` | Zarządzanie rolami | Zabiera kilka ról |
| `adduserstorole <role> @users...` | `autr` | Zarządzanie rolami | Nadaje jedną rolę kilku członkom |
| `removeusersfromrole <role> @users...` | `rufr` | Zarządzanie rolami | Zabiera jedną rolę kilku członkom |
| `addtoall <role>` | `ata` | Zarządzanie rolami | Rola dla każdego członka |
| `addtoallusers <role>` | `atau` | Zarządzanie rolami | Rola dla każdego człowieka |
| `addtoallbots <role>` | `atab` | Zarządzanie rolami | Rola dla każdego bota |
| `addtousersover <time> <role>` | `atuo` | Zarządzanie rolami | Rola dla członków, którzy dołączyli co najmniej tak dawno temu |
| `addtousersunder <time> <role>` | `atuu` | Zarządzanie rolami | Rola dla członków, którzy dołączyli później |
| `addroletorole <role> <role2>` | `artr` | Zarządzanie rolami | Rola dla wszystkich z inną rolą |
| `addthenremove <role> <role2>` | `atr` | Zarządzanie rolami | Zamienia jedną rolę na drugą |
| `removefromall <role>` | `rfa` | Zarządzanie rolami | Zabiera każdemu członkowi |
| `removefromallusers <role>` | `rfau` | Zarządzanie rolami | Zabiera każdemu człowiekowi |
| `removefromallbots <role>` | `rfab` | Zarządzanie rolami | Zabiera każdemu botowi |
| `removefromrole <role> <role2>` | `rfr` | Zarządzanie rolami | Zabiera wszystkim z inną rolą |
| `rolejobs` | `rj` | Zarządzanie rolami | Wypisuje działające zadania masowych ról |
| `stopjob <number>` | `sj` | Zarządzanie rolami | Anuluje zadanie |
| `exportrolelist` | `exportroles`, `erl` | Zarządzanie rolami | Pobiera członkostwa w rolach |
| `importrolelist [true]` | `importroles`, `irl` | Zarządzanie rolami | Ponownie stosuje wyeksportowaną listę |
| `addroletolist <role>` | `artl` | Zarządzanie rolami | Nadaje rolę załączonej liście ID użytkowników |
| `setdefaultpunishment <action>` | `sdp`, `defaultpunishment`, `setdefpunishment` | Właściciel serwera | Zapasowa kara monitora ról |
| `addblacklistedrole <role> [action]` | `abr`, `blacklistrole`, `addbrole` | Właściciel serwera | Obserwuje rolę |
| `removeblacklistedrole <role>` | `rbr`, `unblacklistrole`, `removebrole` | Właściciel serwera | Przestaje obserwować rolę |
| `addblacklistedpermission <permission> [action]` | `abp`, `blacklistpermission`, `addbpermission` | Właściciel serwera | Obserwuje uprawnienie |
| `removeblacklistedpermission <permission>` | `rbp`, `unblacklistpermission`, `removebpermission` | Właściciel serwera | Przestaje obserwować uprawnienie |
| `addwhitelisteduser @user` | `awu`, `whitelistuser`, `addwuser` | Właściciel serwera | Zwalnia członka |
| `removewhitelisteduser @user` | `rwu`, `unwhitelistuser`, `removewuser` | Właściciel serwera | Usuwa zwolnienie |
| `addwhitelistedrole <role>` | `awr`, `whitelistrole`, `addwrole` | Właściciel serwera | Zwalnia rolę |
| `removewhitelistedrole <role>` | `rwr`, `unwhitelistrole`, `removewrole` | Właściciel serwera | Usuwa zwolnienie |
| `listblacklists` | `lbl`, `blacklists`, `listbws` | Właściciel serwera | Pokazuje listy monitora |

## Wskazówki i pułapki

- Komendy ról dwukrotnie sprawdzają hierarchię: Twoja najwyższa rola i najwyższa rola bota muszą być nad daną rolą. Właściciel serwera pomija sprawdzenie po swojej stronie.
- Zadania masowe zajmują mniej więcej sekundę na członka. Dodanie roli pięciu tysiącom członków trwa grubo ponad godzinę, a bot odmawia uruchomienia szóstego zadania równocześnie.
- `syncroletoall` i jej warianty wymagają, by rola miała już nadpisanie na kanale, na którym je uruchamiasz; to nadpisanie jest kopiowane.
- `nuke` nie da się cofnąć, a monit z potwierdzeniem to jedyne zabezpieczenie.
- Blokada tylko do odczytu edytuje nadpisania na każdym kanale, co na dużych serwerach oznacza wiele wywołań API. Zdejmuj ją przez `liftlockdown`, a nie ręcznie, aby zapisane nadpisania zostały przywrócone.
- Monitor ról opiera się na dzienniku audytu, więc bot potrzebuje Wyświetlania dziennika audytu oraz uprawnienia wymaganego przez wybraną karę.
- Kradzież emotek wymaga wolnych miejsc na emotki; niepowodzenia są wypisywane w sekcji „Errored Emotes”.

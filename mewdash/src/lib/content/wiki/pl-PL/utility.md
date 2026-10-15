---
title: Narzędzia
slug: utility
summary: Skrzynka z codziennymi pomocnikami: od aliasów komend, cytatów i przypomnień po auto-publikowanie, role streamerów, asystenta AI, liczenie wiadomości i powtarzacze.
icon: fa-wrench
category: Actions
dashboard: /dashboard/utility
module: Utility
tags: [alias, quotes, auto publish, stream role, ai, chatbot, nsfw filter, role monitor, reminder, snipe, repeater, sticky, message count, invites, embed, calculator, userinfo, serverinfo, aliasy, cytaty, auto-publikowanie, rola streamera, asystent, filtr nsfw, monitor ról, przypomnienie, powtarzacz, liczenie wiadomości, zaproszenia, kalkulator, narzędzia]
related: [repeaters, polls, invites, messagestats, embedbuilder, xp, administration, moderation]
---

## Co robi

Narzędzia to moduł zbiorczy dla drobnych funkcji, których potrzebuje większość serwerów. Członkowie dostają przypomnienia, cytaty, rzuty kośćmi, kalkulator, przeliczanie jednostek oraz komendy z informacjami o użytkownikach, rolach, kanałach i serwerze. Administracja dostaje aliasy komend, powtarzające się wiadomości, auto-publikowanie na kanałach z ogłoszeniami, rolę, która podąża za członkami podczas streamowania, podglądanie usuniętych wiadomości, liczenie wiadomości i śledzenie zaproszeń.

Strona **Narzędzia** w panelu zbiera te elementy, którym przydaje się formularz: aliasy, cytaty, auto-publikowanie, rolę streamera, asystenta AI, filtr tagów NSFW i monitor ról. Cała reszta działa wyłącznie przez komendy.

Ponieważ moduł jest szeroki, każda z poniższych funkcji jest opisana osobno. Tabela komend na końcu zawiera wszystkie komendy modułu.

## Po co z tego korzystać

- Skróć `play youtube` do `yt` dla całego serwera za pomocą aliasu.
- Prowadź wspólną księgę cytatów, do której członkowie mogą dodawać wpisy i losować z niej linijki.
- Publikuj każdy post z kanału ogłoszeń automatycznie dla obserwujących.
- Nadawaj członkom rolę „Live” tylko wtedy, gdy streamują konkretną grę.
- Wysyłaj regulamin lub przypięte ogłoszenie co kilka minut albo tylko wtedy, gdy kanał jest aktywny.
- Pozwól członkom ustawiać przypomnienia dla siebie lub dla kanału.
- Uruchom asystenta AI na jednym kanale z użyciem własnego klucza API.

## Aliasy

Alias to słowo-wyzwalacz, które bot zamienia na inną komendę przed jej uruchomieniem. `alias yt play youtube` oznacza, że `.yt lofi` zadziała jak `.play youtube lofi`. Wyzwalacz musi być pierwszym słowem wiadomości; wszystko, co po nim następuje, jest doklejane do przypisanej komendy. Dłuższe wyzwalacze są dopasowywane w pierwszej kolejności. Uruchomienie `alias <trigger>` bez przypisania usuwa alias, a `aliasesclear` usuwa wszystkie.

W panelu karta **Aliasy** zawiera pola **Wyzwalacz aliasu** i **Mapowanie aliasu**, wyszukiwarkę oraz listę, z której możesz usuwać wpisy.

## Cytaty

Cytaty to krótkie teksty zapisane pod słowem kluczowym. `quoteadd <keyword> <text>` zapisuje cytat, `quoteprint <keyword>` (lub `..`) pokazuje losowy cytat dla danego słowa, a `quoteshow <id>` pokazuje konkretny. `quotesearch` szuka po słowie kluczowym i treści, `quoteid` pokazuje, kto dodał cytat, a `listquotes` przegląda je stronami, posortowane według słowa kluczowego lub daty dodania. Cytaty może dodawać każdy. Cytat może usunąć członek, który go dodał, albo administrator; usuwanie wszystkich cytatów pod jednym słowem kluczowym, eksport do JSON i import z załącznika JSON wymagają uprawnienia Administrator.

Karta **Cytaty** pozwala dodawać, edytować, wyszukiwać i usuwać cytaty.

## Auto-publikowanie

Kanały ogłoszeń na Discordzie wymagają ręcznego publikowania każdej wiadomości. `addautopublish #channel` sprawia, że bot publikuje każdą nową wiadomość na tym kanale. Dwie czarne listy dla każdego kanału pomijają wiadomości: `addpublishblacklist @user #channel` ignoruje użytkownika, a `addpublishblacklist #channel word` ignoruje każdą wiadomość zawierającą dane słowo, bez rozróżniania wielkości liter. `getautopublishes` pokazuje wszystkie kanały wraz z ich czarnymi listami.

Karta **Auto-publikowanie** pozwala dodawać kanały i zarządzać listami **Pomijaj wiadomości od tych użytkowników** oraz **Pomijaj wiadomości zawierające te słowa**.

## Rola streamera

`streamrole <fromRole> <addRole>` nadaje rolę **addRole** każdemu członkowi roli **fromRole**, gdy ten streamuje, i zabiera ją, gdy przestaje. `streamrolekeyword <keyword>` ogranicza to do streamów, których tytuł zawiera dane słowo; uruchom komendę bez słowa, aby je wyczyścić. Członkowie z białej listy dostają rolę podczas streamowania, nawet jeśli słowo kluczowe się nie zgadza, a członkowie z czarnej listy nigdy jej nie dostają. `streamrole` bez argumentów wyłącza funkcję. Jeśli bot straci uprawnienie do zarządzania rolą albo rola zostanie usunięta, funkcja wyłączy się sama.

Karta **Rola streamera** zawiera pola **Uprawniona rola**, **Rola podczas streamowania**, **Słowo kluczowe w tytule streama** oraz listy **Biała lista** i **Czarna lista** według ID użytkownika.

## Asystent AI

Asystent odpowiada na każdą wiadomość wysłaną na jednym wybranym kanale i zapamiętuje jako kontekst ostatnie pięć wymian dla każdego członka. Wpisanie `deletesession` na tym kanale czyści twoją własną rozmowę.

| Ustawienie | Komenda | Co robi |
| --- | --- | --- |
| Kanał | `aichannel [#channel] [enabled]` | Jedyny kanał, na którym asystent nasłuchuje |
| Dostawca i model | `aimodel <OpenAi\|Groq\|Claude> [model]` | Z którego API i modelu korzystać |
| Klucz API | `aikey` | Twój własny klucz dla tego dostawcy; bot go przechowuje i nie pokazuje ponownie |
| Prompt systemowy | `aiprompt <text>` | Instrukcje, których przestrzega model |
| Wyszukiwanie w sieci | `aiwebsearch <true\|false>` | Pozwala modelowi przeszukiwać internet (tylko Claude) |
| Webhook | `aiwebhook [name] [avatarUrl]` | Wysyłaj odpowiedzi przez webhook z własną nazwą i awatarem |
| Własny embed | `aicustomembed [template]` | Opakuj odpowiedzi w embed; `%airesponse%` wskazuje, gdzie trafi odpowiedź |

`aiconfig` pokazuje aktualną konfigurację. Karta **Asystent AI** zawiera pola **Asystent włączony**, **Kanał**, **Dostawca**, **Model**, **Klucz API**, **Prompt systemowy**, **Zezwól na wyszukiwanie w sieci** oraz **Ukryj komunikaty o „przeszukiwaniu sieci”**.

> [!WARNING]
> Asystent działa na twoim kluczu API i twoim koszcie. Bez ustawionego klucza wiadomości na tym kanale dostają odpowiedź z błędem.

## Filtr NSFW

Karta **Filtr NSFW** wyświetla zablokowane tagi dla wyszukiwania obrazów w module NSFW. Wpisz tag w polu **Tag do zablokowania**, aby go dodać, albo kliknij istniejący, aby go usunąć. Odpowiadająca temu komenda to `nsfwtagbl [tag]` z modułu NSFW; bez tagu wyświetla aktualną czarną listę.

## Monitor ról

Karta **Monitor ról** konfiguruje monitor ról z modułu Zarządzanie serwerem, który reaguje, gdy zostanie nadana rola lub uprawnienie oznaczone jako chronione. Wybierz **Domyślną karę** (tylko cofnięcie zmiany, ostrzeżenie, zabranie wszystkich ról, wyciszenie, timeout, wyrzucenie lub ban), dodaj role i uprawnienia do ochrony oraz wypisz **Zaufane role** i **Zaufanych członków**, którzy są zwolnieni. Komendy (`addblacklistedrole`, `addblacklistedpermission`, `whitelistuser`, `whitelistrole`, `setdefaultpunishment`, `listblacklists`) są dostępne tylko dla właściciela serwera i znajdują się w module Zarządzanie serwerem.

## Przypomnienia

`remind me <time> <message>` wyśle ci wiadomość prywatną później; `remind here <time> <message>` wyśle wiadomość na bieżącym kanale; `remind #channel <time> <message>` kieruje ją na inny kanał i wymaga uprawnienia Zarządzanie wiadomościami. Czas zapisuje się jako `2h30m`, `3 days`, `1w` lub `in 45 minutes` i może wynosić najwyżej 60 dni. `remindlist` pokazuje twoje przypomnienia wraz z numerami indeksów, a `reminddelete <index>` usuwa jedno z nich. Wzmianki w wiadomości są neutralizowane, chyba że możesz wzmiankować wszystkich na tym kanale.

## Snipe

Snipe jest wyłączony, dopóki administrator nie uruchomi `snipeset enable`. Po włączeniu bot przechowuje usunięte i edytowane wiadomości przez 30 dni. `snipe [#channel] [@user]` pokazuje ostatnią usuniętą wiadomość, `editsnipe` ostatnią edycję, a `snipelist` i `editsnipelist` pokazują ostatnie pięć (lub podaną liczbę), filtrowane według kanału lub użytkownika.

## Powtarzacze

Powtarzacz wysyła wiadomość według harmonogramu. `repeat <message>` używa pięciominutowego interwału; `repeat <interval> <message>` ustawia interwał od 5 sekund do 25000 minut; `repeat <time of day> <message>` uruchamia się raz dziennie. Każdy powtarzacz ma indeks pokazywany przez `repeatlist`.

| Tryb wyzwalania | Zachowanie |
| --- | --- |
| `timeinterval` | Wysyłaj co interwał (domyślnie) |
| `onactivity` | Wysyłaj, gdy na kanale pojawi się określona liczba wiadomości w oknie czasowym (`repeatactivity`) |
| `onnoactivity` | Wysyłaj, gdy kanał był cichy przez czas okna |
| `immediate` | Wyślij od razu, a potem trzymaj się interwału |
| `aftermessages` | Wysyłaj po określonej liczbie wiadomości |

Inne przełączniki dla poszczególnych powtarzaczy: `repeatredun` pomija wysłanie, jeśli wiadomość powtarzacza jest już ostatnią na kanale; `repeatschedule <business\|evening\|weekend\|custom>` ogranicza, kiedy działa; `repeatconversation` przełącza wykrywanie rozmowy; `repeatpriority` ustala kolejność powtarzaczy od 0 do 100; `repeatthreadonly` i `repeatthreadautosticky` dotyczą wątków; `repeatforumtags` ogranicza posty na forum według tagów; `repeatsuppressnotifications` wysyła po cichu; `repeattoggle` wstrzymuje.

## Liczenie wiadomości i zaproszenia

`togglemsgcount` włącza liczenie wiadomości. `usermessages`, `channelmessages`, `servermessages` i `topusers` pokazują liczby, `activitygraph` rysuje najbardziej ruchliwe godziny lub dni, a `minmsglength` ignoruje wiadomości krótsze niż podana długość. `resetmessagecounts` po potwierdzeniu czyści liczniki dla użytkownika, kanału lub obu.

Śledzenie zaproszeń zapisuje, kto zaprosił każdego członka. `invites`, `whoinvited`, `invitedusers` i `inviteleaderboard` odczytują te dane. `toggleinvitetracking`, `toggleremoveinviteonleave` i `setminaccountage <days>` nimi sterują; konta młodsze niż minimalny wiek nie są liczone.

## Ustawienia

Strona w panelu jest podzielona na karty: **Aliasy**, **Cytaty**, **Auto-publikowanie**, **Rola streamera**, **Asystent AI**, **Filtr NSFW** i **Monitor ról**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Wyzwalacz i mapowanie aliasu | brak | Słowo do zamiany i komenda, w którą się zamienia |
| Słowo kluczowe i treść cytatu | brak | Zapisany cytat |
| Kanały auto-publikowania | brak | Kanały ogłoszeń, na których bot publikuje |
| Pomijaj wiadomości od tych użytkowników / zawierające te słowa | brak | Czarne listy publikowania dla poszczególnych kanałów |
| Uprawniona rola | brak | Członkowie, którzy mogą dostać rolę streamera |
| Rola podczas streamowania | brak | Rola dodawana i zabierana |
| Słowo kluczowe w tytule streama | dowolny stream | Liczą się tylko streamy, których tytuł zawiera ten tekst |
| Asystent włączony | wyłączony | Czy kanał AI odpowiada |
| Dostawca, Model, Klucz API, Prompt systemowy | brak | Konfiguracja AI |
| Zezwól na wyszukiwanie w sieci | wyłączone | Wyszukiwanie w sieci przez Claude |
| Ukryj komunikaty o „przeszukiwaniu sieci” | włączone | Ukrywa komunikaty o statusie wyszukiwania w sieci wysyłane przez model |
| Zablokowane tagi | brak | Tagi wyszukiwania NSFW, które są filtrowane |
| Domyślna kara | użyj domyślnej | Akcja monitora ról |

Snipe, liczenie wiadomości, śledzenie zaproszeń, powtarzacze, przypomnienia i podglądy linków nie mają ustawień w panelu.

## Konfiguracja krok po kroku

1. Otwórz **Narzędzia** w panelu.
2. W karcie **Aliasy** dodaj wyzwalacz, na przykład `yt`, przypisany do `play youtube`. Przetestuj go na Discordzie.
3. W karcie **Auto-publikowanie** dodaj swój kanał ogłoszeń. Dodaj do listy pomijanych wszystkich użytkowników będących botami lub webhookami.
4. W karcie **Rola streamera** wybierz uprawnioną rolę i rolę do dodania, a opcjonalnie słowo kluczowe w tytule. Upewnij się, że rola bota jest wyżej niż rola, którą nadaje.
5. W karcie **Asystent AI** wybierz kanał, dostawcę i model, wklej swój klucz, napisz prompt systemowy i włącz asystenta.
6. Na Discordzie uruchom `snipeset enable`, jeśli chcesz podglądać usunięte wiadomości, oraz `togglemsgcount` dla statystyk wiadomości.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, o ile go nie zmieniono).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `alias <trigger> [mapping]` | `cmdmap` | Administrator | Dodaje alias lub usuwa go, gdy nie podasz przypisania |
| `aliaslist` | `cmdmaplist`, `aliases` | Brak | Wyświetla aliasy |
| `aliasesclear` | `aliasclear` | Administrator | Usuwa wszystkie aliasy |
| `quoteadd <keyword> <text>` | `.` | Brak | Dodaje cytat |
| `quoteprint <keyword>` | `..` | Brak | Losowy cytat dla słowa kluczowego |
| `quoteshow <id>` | | Brak | Pokazuje cytat według ID |
| `quotesearch <keyword> <text>` | `qsearch` | Brak | Znajduje cytat według słowa kluczowego i treści |
| `quoteid <id>` | `qid` | Brak | Kto dodał cytat |
| `listquotes [page] [order]` | `liqu` | Brak | Przegląda cytaty stronami |
| `quotedelete <id>` | `qdel` | Brak (własne cytaty) lub Administrator | Usuwa cytat |
| `delallquotes <keyword>` | `daq`, `delallq` | Administrator | Usuwa wszystkie cytaty pod słowem kluczowym |
| `quoteexport` | `qexport` | Administrator | Eksportuje cytaty jako JSON |
| `quoteimport` | `qimport` | Administrator | Importuje cytaty z załączonego pliku JSON |
| `addautopublish <#channel>` | `addautopub`, `aap` | Administrator | Auto-publikuje kanał z newsami |
| `removeautopublish <#channel>` | `removeautopub` | Administrator | Kończy auto-publikowanie |
| `addpublishblacklist <@user> <#channel>` lub `<#channel> <word>` | `addpubbl` | Administrator | Pomija użytkownika lub słowo |
| `removepublishblacklist <@user> <#channel>` lub `<#channel> <word>` | `removepubbl` | Administrator | Usuwa pominięcie |
| `getautopublishes` | `getaps` | Administrator | Wyświetla kanały auto-publikowania |
| `streamrole [fromRole] [addRole]` | | Zarządzanie rolami | Ustawia rolę streamera lub wyłącza ją, gdy nie podasz ról |
| `streamrolekeyword [keyword]` | `srkw` | Zarządzanie rolami | Wymaga słowa kluczowego w tytule streama |
| `streamroleblacklist <add\|remove> <@user>` | `srbl` | Zarządzanie rolami | Nigdy nie nadawaj roli temu członkowi |
| `streamrolewhitelist <add\|remove> <@user>` | `srwl` | Zarządzanie rolami | Zawsze nadawaj rolę temu członkowi podczas streamowania |
| `aichannel [#channel] [enabled]` | `aic` | Zarządzanie serwerem | Ustawia kanał AI |
| `aimodel <provider> [model]` | `aim` | Zarządzanie serwerem | Dostawca i model |
| `aikey` | `ak` | Administrator | Ustawia klucz API |
| `aiprompt <text>` | `aip` | Zarządzanie serwerem | Prompt systemowy |
| `aiwebsearch <true\|false>` | `aws` | Zarządzanie serwerem | Wyszukiwanie w sieci przez Claude |
| `aiwebhook [name] [avatar]` | `aiw` | Administrator | Odpowiada przez webhook lub wyłącza to, gdy nie podasz nazwy |
| `aicustomembed [template]` | `aice` | Administrator | Szablon embeda dla odpowiedzi |
| `aiconfig` | `ac` | Brak | Pokazuje ustawienia AI |
| `remind <me\|here> <time> <message>` | | Brak | Ustawia przypomnienie |
| `remind <#channel> <time> <message>` | | Zarządzanie wiadomościami | Przypomnienie na innym kanale |
| `remindlist` | `remindl`, `remindlst` | Brak | Twoje przypomnienia |
| `reminddelete <index>` | `remindrm`, `reminddel` | Brak | Usuwa przypomnienie |
| `snipeset <enable\|disable>` | `setsnipe` | Administrator | Włącza lub wyłącza snipe |
| `snipe [#channel] [@user]` | | Brak | Ostatnia usunięta wiadomość |
| `editsnipe [#channel] [@user]` | | Brak | Ostatnia edytowana wiadomość |
| `snipelist [#channel] [@user] [amount]` | `slist` | Brak | Ostatnie usunięte wiadomości |
| `editsnipelist [#channel] [@user] [amount]` | `esnipelist` | Brak | Ostatnie edytowane wiadomości |
| `repeat [time] [interval] <message>` | | Zarządzanie wiadomościami | Tworzy powtarzacz |
| `repeatlist` | `replst`, `replist`, `repli` | Zarządzanie wiadomościami | Wyświetla powtarzacze |
| `repeatremove <index>` | `reprm` | Zarządzanie wiadomościami | Usuwa powtarzacz |
| `repeatinvoke <index>` | `repinv` | Zarządzanie wiadomościami | Wysyła go teraz |
| `repeatmessage <index> <message>` | `repmsg` | Zarządzanie wiadomościami | Zmienia tekst |
| `repeatchannel <index> [#channel]` | `repchan` | Zarządzanie wiadomościami | Przenosi go |
| `repeatredun <index>` | `repred` | Zarządzanie wiadomościami | Przełącza sprawdzanie nadmiarowości |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Zarządzanie wiadomościami | Tryb wyzwalania z tabeli powyżej |
| `repeatactivity <index> <messages> <window>` | `repactivity`, `repact` | Zarządzanie wiadomościami | Próg aktywności |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Zarządzanie wiadomościami | Priorytet |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Zarządzanie wiadomościami | Harmonogram pory dnia |
| `repeatconversation <index>` | `repconversation`, `repconv` | Zarządzanie wiadomościami | Przełącza wykrywanie rozmowy |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Zarządzanie wiadomościami | Wstrzymuje lub wznawia |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Zarządzanie wiadomościami | Przypinanie w nowych wątkach |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Zarządzanie wiadomościami | Wysyła tylko w wątkach |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Zarządzanie wiadomościami | Wysyła po cichu |
| `repeatforumtags <index> <action> [tagType] [tags]` | `repforumtags`, `repftags` | Zarządzanie wiadomościami | Reguły tagów forum |
| `togglemsgcount` | `togglemessagecount` | Administrator | Włącza lub wyłącza liczenie wiadomości |
| `minmsglength [length]` | `mmlength`, `minmlength` | Zarządzanie serwerem | Ignoruje krótkie wiadomości |
| `usermessages [@user]` | `usermsg`, `umsg` | Brak | Statystyki wiadomości członka |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Brak | Statystyki wiadomości kanału |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg`, `gmsg` | Brak | Statystyki całego serwera |
| `topusers` | `topu` | Brak | Pierwsza dziesiątka według liczby wiadomości |
| `activitygraph [days\|hours]` | `actgraph` | Brak | Wykres najbardziej ruchliwych pór |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Zarządzanie wiadomościami | Resetuje liczniki |
| `invites [@user]` | | Brak | Liczba zaproszeń |
| `whoinvited [@user]` | `invitedby` | Brak | Kto zaprosił członka |
| `invitedusers [@user]` | `userinvites` | Brak | Członkowie zaproszeni przez kogoś |
| `inviteleaderboard` | `inviteslb` | Brak | Najlepsi zapraszający |
| `invitesettings` | `inviteconfig` | Zarządzanie serwerem | Pokazuje ustawienia zaproszeń |
| `toggleinvitetracking` | | Zarządzanie serwerem | Włącza lub wyłącza śledzenie |
| `toggleremoveinviteonleave` | `triol` | Zarządzanie serwerem | Odlicza zaproszenia, gdy zaproszony wychodzi |
| `setminaccountage <days>` | `inviteminage` | Zarządzanie serwerem | Ignoruje młode konta |
| `joinstats` | `jstats` | Flaga beta (`dragon`) | Wykres dołączeń |
| `leavestats` | `lstats` | Flaga beta (`dragon`) | Wykres odejść |
| `joinstatscolor [r g b]` | `jstatscolor` | Flaga beta (`dragon`) | Kolor wykresu dołączeń, bez wartości złoty |
| `leavestatscolor [r g b]` | `lstatscolor` | Flaga beta (`dragon`) | Kolor wykresu odejść, bez wartości złoty |
| `userinfo [@user]` | `uinfo` | Brak | Szczegóły członka |
| `serverinfo [name]` | `sinfo` | Brak | Szczegóły serwera |
| `channelinfo [#channel]` | `cinfo` | Brak | Szczegóły kanału tekstowego |
| `vinfo [channel]` | `voiceinfo` | Brak | Szczegóły kanału głosowego |
| `rinfo <role>` | `roleinfo` | Brak | Szczegóły roli |
| `fetch <id>` | | Brak | Wyszukuje dowolnego użytkownika po ID |
| `avatar [@user]` | `av` | Brak | Awatar, z przyciskiem do awatara serwerowego |
| `banner [@user]` | `userbanner` | Brak | Baner użytkownika |
| `userid [@user]` | `uid` | Brak | ID użytkownika |
| `roleid <role>` | `rid` | Brak | ID roli |
| `channelid` | `cid` | Brak | ID kanału |
| `serverid` | `sid` | Brak | ID serwera |
| `roles [@user]` | | Brak | Role serwera lub role członka |
| `inrole <role>` | | Brak | Członkowie z daną rolą |
| `inroles <role> <role>` | | Brak | Członkowie z obiema rolami |
| `rolepermlist [and\|or] <permissions...>` | `roleperms` | Brak | Role posiadające uprawnienia |
| `channeltopic [#channel]` | `ct` | Brak | Temat kanału |
| `whosplaying <game>` | `whpl` | Brak | Członkowie grający w daną grę |
| `emotelist [type]` | | Brak | Emotki serwera |
| `showemojis <emojis>` | `se` | Brak | Powiększa emoji |
| `say [#channel] <text or embed JSON>` | | Zarządzanie wiadomościami | Mów jako bot |
| `getjson <messageId> [#channel]` | | Zarządzanie wiadomościami | JSON embeda wiadomości |
| `embedsave <name> <json>` | `esave` | Brak | Zapisuje osobisty szablon embeda |
| `guildembedsave <name> <json>` | `gesave`, `gembedsave` | Zarządzanie wiadomościami | Zapisuje serwerowy szablon embeda |
| `embedlist` / `guildembedlist` | `elist` / `gelist`, `gembedlist` | Brak | Wyświetla szablony |
| `embeddelete <name>` / `guildembeddelete <name>` | `edel`, `edelete` / `gedel`, `gembeddelete` | Brak / Zarządzanie wiadomościami | Usuwa szablon |
| `embedpreview <name>` | `epreview`, `eprev` | Brak | Podgląd szablonu |
| `debugembed <text>` | `embeddebug` | Administrator | Testuje parsowanie embeda |
| `savechat <time> [#channel]` | | Zarządzanie wiadomościami | Zapisuje log czatu i zwraca link |
| `calculate <expression>` | `calc` | Brak | Oblicza wyrażenie matematyczne |
| `calcops` | | Brak | Dostępne operacje matematyczne |
| `plot <function> [start] [end]` | `graphfunction` | Brak | Rysuje wykres funkcji |
| `sym <expression>` | `symbolicmath` | Brak | Matematyka symboliczna |
| `convertunits <from> <to> <value>` | `unitconvert`, `units` | Brak | Przeliczanie jednostek |
| `convertlist` | | Brak | Obsługiwane jednostki |
| `convert <format>` | | Brak | Konwertuje załączony plik multimedialny |
| `roll <dice>` | | Brak | Rzut kośćmi, obsługiwana notacja DnD |
| `owoify <text>` | `owo` | Brak | OwOfikuje tekst |
| `vcheck [url]` | `viruscheck` | Brak | Skan linku w VirusTotal |
| `traceroute <host>` | `tracert`, `trcrt` | Brak | Śledzi trasę do hosta |
| `pingip <ip> [count]` | | Brak | Pinguje adres, do 10 razy |
| `previewlinks <yes\|no>` | `plinks` | Administrator | Przełącza podglądy linków |
| `verboseerror [true\|false]` | `ve` | Zarządzanie wiadomościami | Przełącza szczegółowe błędy komend |
| `ping` | | Brak | Opóźnienie bota |
| `stats` | | Brak | Statystyki bota |
| `invite` | | Brak | Zaproszenie bota i linki do wsparcia |
| `vote` | | Brak | Link do głosowania |

## Wskazówki i pułapki

- Alias tylko przepisuje tekst; przypisana komenda nadal działa z własnymi kontrolami uprawnień.
- Auto-publikowanie działa wyłącznie na kanałach ogłoszeń (news) na Discordzie.
- Rola streamera wymaga, aby rola bota była wyżej niż rola, którą nadaje. Jeśli bot nie może nią zarządzać, funkcja wyłącza się sama, zamiast po cichu zawodzić przy każdym streamie.
- Snipe jest domyślnie wyłączony, a snipe'y starsze niż 30 dni są usuwane.
- Przypomnienia dłuższe niż 60 dni są odrzucane.
- Asystent AI odpowiada tylko na jednym skonfigurowanym kanale i ignoruje boty. Jego pamięć to ostatnie pięć wiadomości na członka, więc w długich rozmowach traci wcześniejszy kontekst.
- Liczenie wiadomości trzeba włączyć, zanim pojawią się jakiekolwiek statystyki; nic nie jest liczone wstecz.
- `joinstats` i `leavestats` można uruchamiać raz na dziesięć sekund.

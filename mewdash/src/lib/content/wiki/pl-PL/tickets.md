---
title: Zgłoszenia
slug: tickets
summary: Panele zgłoszeń z przyciskami i menu wyboru, które otwierają prywatne kanały, a do tego przejmowanie, priorytety, tagi, sprawy, transkrypty i narzędzia dla staffu.
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, modmail, tickety, zgłoszenia, wsparcie, pomoc, panel ticketów, transkrypty, sprawy, przejmowanie, priorytet, czarna lista]
related: [administration, chat-triggers, auditlog]
---

## Co robi

Zgłoszenia (tickety) zamieniają kanał w punkt pomocy. Publikujesz panel, czyli wiadomość z embedem oraz jednym lub kilkoma przyciskami albo menu wyboru. Gdy członek kliknie przycisk lub wybierze opcję, bot tworzy dla niego prywatny kanał tekstowy, ustawia uprawnienia tak, aby widzieli go tylko on i twoje role wsparcia, i wysyła wiadomość otwierającą z przyciskami **Przejmij** i **Zamknij**.

Z perspektywy członka: klika, opcjonalnie wypełnia krótki formularz i pojawia się kanał nazwany na przykład `ticket-username-1`. Tam opisuje swój problem. Po zamknięciu kanał dostaje nazwę `closed-...`, zostaje zablokowany i trafia do kategorii archiwum albo jest usuwany po opóźnieniu, zależnie od tego, jak skonfigurujesz dany typ ticketu.

Z perspektywy staffu: przejmij ticket, aby wszyscy wiedzieli, kto się nim zajmuje, ustaw priorytet, dodaj tagi, zostaw notatki, powiąż pokrewne tickety w sprawę i zamknij go. Każde zamknięcie może zapisać transkrypt na kanale i w panelu. Panel pokazuje też czasy odpowiedzi i rozwiązania, tickety według priorytetu oraz widok dla poszczególnych członków staffu.

Każdy przycisk i każda opcja menu wyboru to osobny typ ticketu z własną kategorią, rolami, limitami, formularzem, wiadomością otwierającą i zachowaniem przy zamknięciu.

## Po co z tego korzystać

- Serwer wsparcia chce prywatnych kanałów jeden na jeden zamiast publicznego kanału pomocy.
- Masz kilka zespołów (rozliczenia, moderacja, partnerstwa) i chcesz menu wyboru, które kieruje do właściwego.
- Potrzebujesz podań na moderatora z formularzem, oddzielonych od ogólnego wsparcia.
- Chcesz mieć ślad audytowy: transkrypty, notatki staffu i sprawy grupujące powiązane zgłoszenia.
- Chcesz w ogóle uniemożliwić wybranym członkom otwieranie ticketów.

## Panele, przyciski i menu wyboru

Panel to jedna wiadomość na jednym kanale. ID panelu to ID tej wiadomości. Panel może zawierać przyciski, menu wyboru lub jedno i drugie.

- **Przyciski**: jeden typ ticketu na przycisk. Każdy ma etykietę, opcjonalne emoji i styl (Główny, Drugorzędny, Sukces lub Niebezpieczny).
- **Menu wyboru**: jedno menu z tekstem zastępczym i listą opcji. Każda opcja to typ ticketu z etykietą, opisem i emoji. Menu musi zachować co najmniej jedną opcję.

Jeśli wiadomość panelu zostanie usunięta, `checkpanels` wyświetli brakujące panele, a `recreatepanel` lub `recreateallpanels` opublikuje je ponownie i zaktualizuje zapisane ID wiadomości. Bot śledzi też usuwanie wiadomości paneli.

`ticketduplicatepanel` kopiuje panel i wszystkie komponenty na inny kanał. `ticketmovepanel` go przenosi. `ticketupdatepanel` zastępuje embed nowym JSON-em embeda.

### Ustawienia typu ticketu

Występują przy każdym przycisku i każdej opcji menu wyboru. W panelu pojawiają się podczas dodawania lub edycji przycisku albo opcji.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Format nazwy kanału | `ticket-{username}-{id}` | Nazwa tworzonego kanału; `{id}` to numer ticketu członka, maks. 100 znaków |
| Kategoria ticketów | brak | Kategoria, w której tworzony jest kanał |
| Kategoria archiwum | brak | Kategoria, do której kanał trafia po zamknięciu lub archiwizacji |
| Role wsparcia | brak | Role, które widzą ticket, mogą w nim pisać i go przejmować |
| Role z podglądem | brak | Role, które mogą czytać, ale nie wysyłać wiadomości |
| Maks. aktywnych ticketów | 1 | Ile otwartych ticketów tego typu może mieć jeden członek |
| Automatyczne zamknięcie (godziny) | brak | Zapisywane dla typu i widoczne w `buttoninfo` |
| Wymagany czas odpowiedzi (minuty) | brak | Zapisywany dla typu i widoczny w `buttoninfo` |
| Dozwolone priorytety | wszystkie | Jakie priorytety staff może ustawiać dla tego typu |
| Domyślny priorytet | brak | Priorytet, z jakim zaczyna się nowy ticket |
| Zapisz transkrypt | wyłączone | Generuje transkrypt po zamknięciu ticketu |
| Zablokuj po zamknięciu | włączone | Odbiera możliwość pisania wszystkim poza rolami wsparcia |
| Zmień nazwę po zamknięciu | włączone | Dodaje do nazwy kanału prefiks `closed-` |
| Usuń twórcę | włączone | Odbiera dostęp osobie, która otworzyła ticket, po zamknięciu |
| Usuń po zamknięciu | wyłączone | Usuwa kanał po opóźnieniu zamiast go zachować |
| Opóźnienie usunięcia | 5 minut | Czas oczekiwania przed usunięciem, gdy włączone jest Usuń po zamknięciu; pole w panelu przyjmuje sekundy, a `ticketclosebehavior` minuty |
| Auto-archiwizacja po zamknięciu | wyłączone | Archiwizuje ticket w ramach jego zamknięcia |
| Zablokuj po archiwizacji | włączone | Ustawia kanał jako tylko do odczytu po archiwizacji |
| Zmień nazwę po archiwizacji | włączone | Dodaje do nazwy kanału prefiks `archived-` |
| Usuń twórcę (archiwum) | wyłączone | Odbiera dostęp osobie, która otworzyła ticket, po archiwizacji |
| Modal | brak | Formularz wyświetlany przed utworzeniem ticketu |
| Wiadomość otwarcia ticketu | domyślny embed | Własna wiadomość otwierająca z symbolami zastępczymi |

### Formularze (modale)

Typ ticketu może zadać pytania przed utworzeniem kanału. Ustaw tytuł przez `setmodaltitle` (domyślnie „Create Ticket”) i dodawaj pola przez `addmodalfield`. Pole jest domyślnie krótkie i wymagane; opcje po etykiecie to zmieniają: `paragraph` dla wielu linii, `optional` oraz `min:X` lub `max:X` dla limitów długości do 4000. ID pola to etykieta zapisana małymi literami ze spacjami zamienionymi na podkreślenia.

Odpowiedzi są zapisywane razem z ticketem i można ich użyć w wiadomości otwierającej jako `%modal.<fieldId>%`.

### Wiadomość otwierająca

Domyślnie bot wysyła embed zatytułowany „Support Ticket”, który wita członka, pokazuje ID ticketu i czas utworzenia oraz prosi o opisanie problemu. Dołączone są przyciski Przejmij i Zamknij.

Możesz ją zastąpić dla każdego typu ticketu własnym tekstem lub embedem. Użyj kreatora embedów w panelu (**Skonfiguruj wiadomość otwarcia ticketu**). Dostępne tu symbole zastępcze:

| Symbol zastępczy | Wartość |
| --- | --- |
| `%ticket.id%` | Numer ticketu |
| `%ticket.channel%` | Wzmianka kanału ticketu |
| `%ticket.user%` | Nazwa użytkownika osoby, która otworzyła ticket |
| `%ticket.user.mention%` | Wzmianka osoby, która otworzyła ticket |
| `%ticket.user.avatar%` | URL awatara osoby, która otworzyła ticket |
| `%ticket.user.id%` | ID użytkownika osoby, która otworzyła ticket |
| `%ticket.created%` | Kiedy ticket został utworzony |
| `%modal.<fieldId>%` | Odpowiedź na pole formularza |

Ogólny zestaw symboli zastępczych nie jest stosowany w tej wiadomości; działają tylko te powyżej.

## Co się dzieje po otwarciu ticketu

1. Członkowie z czarnej listy dostają odmowę w wiadomości widocznej tylko dla nich.
2. Otwarte tickety członka tego typu są liczone względem **Maks. aktywnych ticketów** (domyślnie 1).
3. Kanał jest tworzony w kategorii ticketów z odebranym dostępem dla `@everyone`, z pozwoleniem dla osoby otwierającej na wyświetlanie, pisanie, czytanie historii, załączanie plików i osadzanie linków, z tym samym dla ról wsparcia plus Zarządzanie wiadomościami, a role z podglądem mogą tylko czytać.
4. Wiadomość otwierająca jest wysyłana z przyciskami Przejmij i Zamknij.
5. Jeśli ustawiono kanał logów, trafia tam wpis „nowy ticket”.
6. Do wyzwalaczy czatu publikowane jest zdarzenie **Ticket otwarty**.

## Przejmowanie, notatki, priorytety i tagi

**Przejmowanie**: członek roli wsparcia lub administrator przejmuje ticket przyciskiem albo przez `ticketclaim`. Kanał dostaje embed „przejęte przez”. Zwolnić ticket może tylko osoba, która go przejęła, lub administrator. Nie można przejąć ticketu zamkniętego ani już przejętego.

**Notatki**: `ticketnote` dodaje notatkę staffu do bieżącego ticketu. Notatka jest zapisywana razem z ticketem, widoczna w panelu i wysyłana na kanale ticketu jako niebieski embed „dodano notatkę” z autorem w stopce.

**Priorytety** to definicje dla całego serwera tworzone przez `ticketaddpriority` lub w karcie **Konfiguracja**. Każdy ma ID, nazwę wyświetlaną, emoji, poziom od 1 do 5, kolor, czas odpowiedzi i flagę **Powiadom staff**. Ustawienie priorytetu na tickecie wysyła embed w tym kolorze i, gdy flaga jest włączona, pinguje role wsparcia. Typ ticketu może ograniczać, jakie priorytety są dozwolone.

**Tagi** to etykiety dla całego serwera z ID, nazwą, opisem i kolorem. Dodawaj je do ticketu i usuwaj za pomocą `ticketaddtags` i `ticketremovetags`, podając ID tagów. Panel pokazuje je przy każdym tickecie i pozwala wyszukiwać po tagu.

## Zamykanie, archiwizacja i transkrypty

Zamknięcie oznacza ticket jako zamknięty i wysyła czerwony embed „ticket zamknięty”. Następnie, po kolei:

1. Jeśli dla typu włączone jest **Zapisz transkrypt** i ustawiono kanał transkryptów, zapisywanych jest ostatnich 5000 wiadomości, a na kanale transkryptów pojawia się embed z linkiem **Zobacz transkrypt**. Link otwiera transkrypt w panelu.
2. Jeśli dla typu włączona jest auto-archiwizacja albo zamknąłeś ticket przez `ticketclose true`, ticket jest archiwizowany (patrz niżej).
3. W przeciwnym razie uruchamiane są zachowania przy zamknięciu: zmiana nazwy na `closed-...`, usunięcie osoby otwierającej, zablokowanie kanału z zachowaniem ról wsparcia, a potem albo przeniesienie do kategorii archiwum, albo, przy **Usuń po zamknięciu**, ostrzeżenie na kanale i zaplanowanie usunięcia po opóźnieniu. Zaplanowane usunięcia są przetwarzane raz na minutę.

Archiwizacja zmienia nazwę kanału na `archived-...`, przenosi go do kategorii archiwum, ustawia go jako tylko do odczytu dla wszystkich i oznacza ticket jako zarchiwizowany. `ticketarchive` robi to bezpośrednio na otwartym tickecie. Jeśli kanału już nie ma, ticket jest po prostu oznaczany jako zarchiwizowany.

Zamknięcie publikuje do wyzwalaczy czatu zdarzenie **Ticket zamknięty**.

> [!NOTE]
> Transkrypt powstaje tylko wtedy, gdy dla typu włączono **Zapisz transkrypt** i serwer ma kanał transkryptów. Bez kanału transkryptów zamknięcie się powiedzie, ale nic nie zostanie zapisane.

## Sprawy

Sprawa grupuje tickety, które do siebie należą, na przykład kilka zgłoszeń dotyczących tej samej osoby. Utwórz ją przez `ticketcreatecase <title> <description>` lub w karcie **Sprawy**, potem powiąż bieżący ticket przez `ticketlinkcase <caseId>` i odłącz przez `ticketunlinkcase`. Sprawy mają własne notatki, można je zamykać i otwierać ponownie oraz edytować z panelu lub komendami slash `/tickets cases`.

## Czarna lista

`ticketblock @user [reason]` uniemożliwia członkowi otwieranie ticketów. Powód jest zapisywany na kanale logów, jeśli jest ustawiony. `ticketunblock` cofa blokadę. Karta **Zaawansowane** w panelu ma tę samą sekcję **Zarządzanie czarną listą**, przyjmującą ID użytkownika.

## Narzędzia zbiorcze

- `ticketcloseinactive <hours>` zamyka każdy otwarty ticket bez aktywności przez podaną liczbę godzin, wysyła w każdym embed „zamknięto automatycznie” i archiwizuje go, jeśli typ ma kategorię archiwum. To samo robi **Zamknij nieaktywne tickety** w karcie **Zaawansowane**.
- `ticketmoveall <source category> <target category>` przenosi wszystkie kanały ticketów między kategoriami.

## Statystyki

`ticketstats` pokazuje sumy, liczbę otwartych i zamkniętych, średni czas odpowiedzi w minutach, średni czas rozwiązania w godzinach oraz podział według typu i priorytetu. `ticketuserstats [@user]` pokazuje to samo dla jednego członka plus jego ostatnie tickety. Karta **Przegląd** pokazuje czasy odpowiedzi, tickety według priorytetu i wydajność staffu.

## Ustawienia

Strona Zgłoszeń ma sześć kart: **Przegląd**, **Zgłoszenia**, **Panele ticketów**, **Konfiguracja**, **Sprawy** i **Zaawansowane**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Kanał transkryptów | brak | Gdzie wysyłane są podsumowania transkryptów z linkami (Konfiguracja) |
| Kanał logów | brak | Gdzie logowane są tworzone tickety i wpisy czarnej listy (Konfiguracja) |
| Priorytety | brak | Definicje priorytetów dla całego serwera (Konfiguracja) |
| Tagi | brak | Definicje tagów dla całego serwera (Konfiguracja) |
| Embed panelu | tytuł „Support Tickets” | Wiadomość panelu, budowana w edytorze embedów (Panele ticketów) |
| Ustawienia typu | patrz tabela powyżej | Ustawiane przy każdym przycisku lub opcji menu wyboru (Panele ticketów) |
| Czarna lista | pusta | Członkowie, którzy nie mogą otwierać ticketów (Zaawansowane) |

Karta **Zgłoszenia** wyświetla otwarte i zamknięte tickety z wyszukiwaniem po tickecie, użytkowniku, kanale lub tagu. Stamtąd staff może przejmować, zwalniać, ustawiać priorytet, dodawać i usuwać tagi, dodawać notatkę staffu, zamykać z opcjonalnym powodem, archiwizować i otwierać transkrypt.

> [!PERMISSION]
> Bot potrzebuje uprawnień Zarządzanie kanałami i Zarządzanie rolami, aby tworzyć kanały ticketów i ustawiać, kto je widzi. Jego rola musi mieć wgląd w kategorie ticketów i archiwum.

## Konfiguracja krok po kroku

1. Utwórz kategorię dla otwartych ticketów i opcjonalnie jedną dla zamkniętych. Utwórz kanał transkryptów i kanał logów widoczne tylko dla staffu.
2. Otwórz **Zgłoszenia** w panelu, przejdź do **Konfiguracja** i ustaw **Kanał transkryptów** oraz **Kanał logów**.
3. Nadal w **Konfiguracja** utwórz co najmniej jeden priorytet (na przykład `urgent`, poziom 5, Powiadom staff włączone) i dowolne tagi.
4. Przejdź do **Panele ticketów** i wybierz **Utwórz nowy panel**. Wybierz kanał i zaprojektuj **Embed panelu**.
5. Zaznacz panel i dodaj **Nowy przycisk**. Ustaw etykietę, styl, **Kategorię ticketów**, **Kategorię archiwum**, **Role wsparcia** i włącz **Zapisz transkrypt**. Zdecyduj, czy zamknięte kanały zostają w kategorii archiwum, czy włączasz **Usuń po zamknięciu** z opóźnieniem.
6. Opcjonalnie otwórz kreator modala, aby dodać pola formularza, oraz edytor wiadomości otwarcia, aby dostosować powitanie.
7. Dla kilku typów ticketów w jednym menu rozwijanym dodaj zamiast tego **Nowe menu wyboru** i dodaj opcję dla każdego typu z tymi samymi ustawieniami.
8. Otwórz testowy ticket z innego konta, przejmij go, ustaw priorytet, zamknij i sprawdź kanał transkryptów.

Na Discordzie `/tickets setup wizard #channel` przeprowadza przez te same kroki z szablonami (Basic Support, Department Support, Gaming Server, Business, Mod Applications).

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, o ile go nie zmieniono). ID paneli to ID wiadomości; ID przycisków, menu i opcji znajdziesz przez `panelinfo` lub `ticketlistpanel`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `ticketpanel <#channel> [embedJson]` | `tpanel` | Administrator | Tworzy panel, z podglądem lub pytaniem o utworzenie |
| `ticketpaneldelete <panelId> [force]` | `tpaneldelete` | Administrator | Usuwa panel; `true` wymusza to nawet przy powiązanych ticketach |
| `ticketupdatepanel <panelId> <embedJson>` | `tupdatepanel` | Administrator | Zastępuje embed panelu |
| `ticketmovepanel <panelId> <#channel>` | `tmovepanel` | Administrator | Przenosi panel na inny kanał |
| `ticketduplicatepanel <panelId> <#channel>` | `tduplicatepanel` | Administrator | Kopiuje panel i jego komponenty |
| `panellist` | `plist` | Administrator | Wyświetla panele z liczbą komponentów |
| `panelinfo <panelId>` | `pinfo` | Administrator | Pokazuje przyciski i menu panelu wraz z ID |
| `ticketlistpanels` | `tlistpanels` | Zarządzanie kanałami | Szczegółowa lista wszystkich paneli ze stronicowaniem |
| `ticketlistpanel <panelId>` | `tlistpanel` | Zarządzanie kanałami | Wszystkie komponenty jednego panelu z ustawieniami |
| `checkpanels` | `tcheckpanels` | Administrator | Raportuje panele, którym brakuje wiadomości lub kanału |
| `recreatepanel <panelId>` | `trecreate` | Administrator | Wysyła ponownie brakujący panel |
| `recreateallpanels` | `trecreateall` | Administrator | Wysyła ponownie każdy brakujący panel |
| `setpaneltranscripts <panelId> <true or false>` | `sptranscripts` | Administrator | Przełącza transkrypty dla każdego przycisku panelu |
| `ticketaddbutton <panelId> <label> [style] [emoji]` | `taddbtn` | Administrator | Dodaje przycisk |
| `buttoninfo <buttonId>` | `binfo` | Administrator | Pokazuje ustawienia przycisku |
| `deletebutton <buttonId>` | `delbtn` | Administrator | Usuwa przycisk |
| `ticketcategory <buttonId> [category]` | `tcat` | Administrator | Ustawia lub czyści kategorię ticketów |
| `ticketarchivecategory <buttonId> [category]` | `tarchivecat` | Administrator | Ustawia lub czyści kategorię archiwum |
| `ticketautoarchive <buttonId> [true or false]` | `tautoarchive` | Administrator | Archiwizuje automatycznie po zamknięciu |
| `ticketclosebehavior <buttonId> [autoArchive] [deleteOnClose] [lockOnClose] [renameOnClose] [deleteDelayMinutes]` | `tclosebehavior` | Administrator | Ustawia kilka zachowań przy zamknięciu naraz |
| `ticketautoclose <buttonId> [hours]` | `tautoclose` | Administrator | Ustawia lub czyści godziny automatycznego zamknięcia |
| `setautoclose <buttonId> <hours>` | `sautoclose` | Administrator | To samo co wyżej |
| `ticketresponsetime <buttonId> [minutes]` | `tresponsetime` | Administrator | Ustawia lub czyści wymagany czas odpowiedzi |
| `setresponsetime <buttonId> <minutes>` | `sresponsetime` | Administrator | To samo co wyżej |
| `setmodaltitle <buttonId> <title>` | `smodaltitle` | Administrator | Tytuł formularza ticketu |
| `addmodalfield <buttonId> <label> [options]` | `addmfield` | Administrator | Dodaje pole formularza, opcje takie jak `paragraph,optional,max:500` |
| `removemodalfield <buttonId> <fieldId>` | `removemfield` | Administrator | Usuwa pole formularza |
| `listmodalfields <buttonId>` | `listmfields` | Administrator | Wyświetla pola formularza |
| `addselectmenu <panelId>` | `addsmenu` | Administrator | Dodaje menu wyboru przez prowadzony kreator |
| `addoption <menuId> <label> [description] [emoji]` | `addopt` | Administrator | Dodaje opcję do menu |
| `listoptions <menuId>` | `listopts` | Administrator | Wyświetla opcje menu |
| `removeoption <menuId> <value>` | `removeopt` | Administrator | Potwierdza opcję według wartości (patrz pułapki) |
| `deleteselectoption <optionId>` | `delselectoption` | Administrator | Usuwa opcję; nie można usunąć ostatniej |
| `setplaceholder <menuId> <text>` | `splaceholder` | Administrator | Zmienia tekst zastępczy menu |
| `deleteselectmenu <menuId>` | `delselectmenu` | Administrator | Usuwa menu wraz z opcjami |
| `ticketclaim` | `tclaim` | Brak | Przejmuje bieżący ticket (rola wsparcia lub administrator) |
| `ticketunclaim` | `tunclaim` | Brak | Zwalnia twoje przejęcie (osoba przejmująca lub administrator) |
| `ticketclose [archive]` | `tclose` | Brak | Zamyka bieżący ticket; `true` dodatkowo archiwizuje |
| `ticketarchive` | `tarchive` | Zarządzanie kanałami | Archiwizuje bieżący ticket |
| `ticketnote <text>` | `tnote` | Brak | Dodaje notatkę staffu |
| `ticketpriority <priorityId>` | `tpriority` | Brak | Ustawia priorytet bieżącego ticketu |
| `ticketaddtags <tagId...>` | `taddtags` | Brak | Dodaje tagi do bieżącego ticketu |
| `ticketremovetags <tagId...>` | `tremovetags` | Brak | Usuwa tagi z bieżącego ticketu |
| `ticketaddpriority <id> <name> <emoji> <level> <pingStaff> <responseTime> <color>` | `taddpriority` | Administrator | Definiuje priorytet, na przykład `taddpriority urgent Urgent :fire: 5 true 00:15:00 red` |
| `ticketremovepriority <id>` | `tremovepriority` | Administrator | Usuwa definicję priorytetu |
| `ticketaddtag <id> <name> <description> <color>` | `taddtag` | Administrator | Definiuje tag |
| `ticketremovetag <id>` | `tremovetag` | Administrator | Usuwa definicję tagu |
| `ticketcreatecase <title> <description>` | `tcreatecase` | Zarządzanie wiadomościami | Tworzy sprawę |
| `ticketlinkcase <caseId>` | `tlinkcase` | Zarządzanie wiadomościami | Powiązuje bieżący ticket ze sprawą |
| `ticketunlinkcase` | `tunlinkcase` | Zarządzanie wiadomościami | Odłącza bieżący ticket |
| `ticketblock @user [reason]` | `tblock` | Administrator | Dodaje członka do czarnej listy |
| `ticketunblock @user` | `tunblock` | Administrator | Usuwa z czarnej listy |
| `tickettranscriptchannel [#channel]` | `ttranscriptch` | Administrator | Ustawia lub czyści kanał transkryptów |
| `ticketlogchannel [#channel]` | `tlogch` | Administrator | Ustawia lub czyści kanał logów |
| `ticketcloseinactive <hours>` | `tcloseinactive` | Administrator | Zamyka tickety bezczynne przez podany czas |
| `ticketmoveall <category> <category>` | `tmoveall` | Administrator | Przenosi wszystkie tickety między kategoriami |
| `ticketstats` | `tstats` | Brak | Statystyki ticketów serwera |
| `ticketuserstats [@user]` | `tuserstats` | Brak | Statystyki ticketów członka |

Komendy slash znajdują się pod `/tickets` (tworzenie panelu, lista paneli, przejmowanie, zamykanie, notatka, archiwizacja, priorytet, grupy panelu i ustawień, grupa spraw) oraz `/tickets setup` (kreator, quick-button, quick-menu, from-template, templates).

## Wskazówki i pułapki

- Komendy działające na „bieżącym tickecie” działają tylko wewnątrz kanału ticketu. Uruchamiaj je w tickecie, a nie na kanale staffu.
- Każdy typ ticketu potrzebuje ról wsparcia, inaczej nikt poza administratorami nie może go przejmować, a po zablokowaniu kanału nikt poza osobą otwierającą nie może pisać.
- Domyślny limit to jeden otwarty ticket na członka na typ. Zwiększ **Maks. aktywnych ticketów** dla typów, w których powtarzające się tickety są normalne.
- **Automatyczne zamknięcie (godziny)** i **Wymagany czas odpowiedzi** są zapisywane w typie i widoczne w `buttoninfo`, ale jedyną rzeczą w bocie, która zamyka bezczynne tickety, jest `ticketcloseinactive` lub akcja zbiorcza **Zamknij nieaktywne tickety**. Jeśli chcesz automatycznego sprzątania, uruchamiaj ją samodzielnie według harmonogramu.
- `removeoption` obecnie tylko zgłasza sukces; użyj `deleteselectoption` z ID opcji, aby faktycznie usunąć opcję.
- **Usuń po zamknięciu** i **Zablokuj po zamknięciu** wzajemnie na siebie wpływają: ticket ustawiony do usunięcia nie jest wcześniej blokowany, po prostu czeka na upływ opóźnienia usunięcia.
- JSON embeda panelu musi być poprawnym wynikiem kreatora embedów. Użyj edytora w panelu i skopiuj JSON, jeśli wolisz komendy.
- Usunięcie panelu z otwartymi ticketami jest odrzucane, chyba że podasz `true`, co czyści powiązanie ticketów z panelem.
- Transkrypty obejmują najwyżej 5000 wiadomości, a link „Zobacz transkrypt” otwiera transkrypt w panelu.

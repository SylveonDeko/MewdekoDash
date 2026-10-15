---
title: Stany ról
slug: rolestates
summary: Zapamiętuj role, które członek miał, gdy opuścił serwer, i automatycznie mu je oddawaj, gdy dołączy ponownie.
icon: fa-tag
category: Actions
dashboard: /dashboard/rolestates
module: RoleStates
tags: [role states, role persistence, restore roles, rejoin, saved roles, role backup, transfer roles, stany ról, zapamiętywanie ról, przywracanie ról, ponowne dołączenie, zapisane role, kopia zapasowa ról, przenoszenie ról]
related: [administration, statusroles]
---

## Co robi

Gdy Stany ról są włączone, bot obserwuje wyjścia członków. W chwili, gdy ktoś wychodzi, zapisuje listę ról, które wtedy miał. Jeśli ta osoba później dołączy ponownie, bot przywraca jej każdą zapisaną rolę, dzięki czemu nie musi prosić staffu o ponowną weryfikację lub ponowne nadanie ról.

Z punktu widzenia członka nic nie zmienia się przy wychodzeniu. Przy wracaniu jego role po prostu tam są, zwykle zanim skończy czytać kanał powitalny.

Staff dostaje zapisaną listę ról dla każdego członka, którą może przeglądać, edytować lub usuwać, listę wykluczeń dla ról, które nigdy nie mają być przywracane, oraz zbiorczą akcję „zapisz wszystkich teraz”, dzięki której funkcja obejmuje także członków, którzy byli na serwerze, zanim ją włączyłeś.

## Po co z tego korzystać

- Zweryfikowani członkowie, którzy wyszli przez przypadek albo żeby wyciszyć powiadomienia, wracają bez utraty dostępu.
- Role kolorów, wzmianek i hobby wybrane z menu ról reakcji przetrwają ponowne dołączenie.
- Serwery z ręcznym procesem weryfikacji nie muszą ponownie sprawdzać osób, które już zostały zatwierdzone.
- Możesz ręcznie wybrać role, które nigdy nie powinny wrócić, na przykład tymczasową rolę wyciszenia albo rolę staffu.
- Przenosisz społeczność na nowy serwer: stany ról można przenieść i dopasować do ról o tych samych nazwach.

## Jak zapisywany jest stan ról

Gdy członek wychodzi, bot sprawdza:

1. Czy Stany ról są włączone na serwerze.
2. Czy **Ignoruj boty** jest wyłączone albo członek nie jest botem.
3. Czy członek nie znajduje się na liście **Zablokowani użytkownicy**.

Jeśli wszystkie te warunki są spełnione, bot bierze obecne role członka, pomija `@everyone` i role zarządzane (role botów, rolę boosterów, role integracji), a następnie usuwa wszystko, co znajduje się na liście **Zablokowane role**. Jeśli nic nie zostaje, nic nie jest zapisywane. W przeciwnym razie lista zastępuje to, co wcześniej zapisano dla tego członka.

Bany są obsługiwane osobno. Gdy włączone jest **Czyść po banie**, zbanowanie członka usuwa jego zapisany stan, więc odbanowanie i ponowne dołączenie niczego nie przywraca.

## Jak przywracany jest stan ról

Przy dołączeniu bot ponownie sprawdza, czy funkcja jest włączona, czy boty nie są ignorowane (jeśli członek jest botem) i czy użytkownik nie znajduje się na liście zablokowanych. Następnie nadaje wszystkie zapisane role w jednym żądaniu. Role, które już nie istnieją albo są powyżej najwyższej roli bota, powodują niepowodzenie tego żądania, a błąd jest tylko zapisywany w logach.

> [!PERMISSION]
> Bot potrzebuje uprawnienia Zarządzaj rolami, a jego najwyższa rola musi znajdować się powyżej każdej roli, którą ma oddać.

### Pomijanie automatycznych ról

Jeśli korzystasz też z ról automatycznych z modułu Administracja, powracający członek normalnie dostałby zarówno zapisane role, jak i role automatyczne. Włączenie **pomijania auto-przydziału** komendą `togglerolestatesskipautoassign` sprawia, że bot pomija role automatyczne dla każdego, kto ma zapisany stan ról, więc powracający członkowie dostają tylko to, co mieli wcześniej. Ten przełącznik działa tylko jako komenda; nie ma go w panelu.

## Ręczne zarządzanie zapisanymi stanami

Staff może utworzyć lub skorygować stan członka bez czekania, aż wyjdzie:

- `setuserrolestate` zastępuje zapisaną listę członka rolami, które podasz. Role zarządzane i `@everyone` są pomijane.
- `addrolestorolestate` i `removerolesfromrolestate` zmieniają istniejącą zapisaną listę.
- `deleteuserrolestate` całkowicie zapomina o członku.
- `saveallrolestates` zapisuje migawkę wszystkich obecnych członków naraz, stosując te same filtry botów i blokad co automatyczny zapis.

Panel dodaje jedną rzecz, której nie mają komendy: **Kopiuj stan ról**, który bierze zapisane role jednego członka i stosuje je bezpośrednio do innego członka, który jest obecnie na serwerze.

## Przenoszenie na inny serwer

`transferrolestates <serverId>` kopiuje każdy zapisany stan z bieżącego serwera na inny serwer, na którym jest bot. Role są dopasowywane po nazwie, bez względu na wielkość liter, a role zarządzane są pomijane. Członkowie, których zapisane role nie mają dopasowania po nazwie na serwerze docelowym, są pomijani. Serwer docelowy automatycznie ma włączone Stany ról, jeśli wcześniej nie były włączone, a jeśli nie ma własnych ustawień, dziedziczy wartości **Ignoruj boty** i **Czyść po banie** z serwera źródłowego.

## Ustawienia

Zakładka **Ustawienia** na stronie Stany ról ma dwie podzakładki: **Ogólne** i **Lista blokad**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Stany ról | wył. | Główny przełącznik zapisywania i przywracania |
| Czyść po banie | wył. | Usuwa zapisany stan członka po jego zbanowaniu |
| Ignoruj boty | wył. | Nie zapisuje ani nie przywraca ról kont botów |
| Zapisz obecne stany | przycisk | Zrób teraz migawkę ról wszystkich obecnych członków |
| Zablokowane role | brak | Role, które nigdy nie są zapisywane, a przez to nigdy nie są przywracane |
| Zablokowani użytkownicy | brak | Członkowie, których role nigdy nie są zapisywane ani przywracane |

Zakładka **Zarządzanie** zawiera **Zarządzaj rolami użytkownika** (dodaje lub usuwa wybrane role z zapisanego stanu członka) oraz **Kopiuj stan ról**. Zakładka **Stany ról** wyświetla każdy zapisany stan z nazwą członka, ID i rolami, a także pozwala zobaczyć szczegóły lub usunąć wpis.

## Krok po kroku

1. Upewnij się, że rola bota znajduje się powyżej każdej roli, którą ma przywracać.
2. Otwórz **Stany ról** w panelu i włącz **Stany ról** w **Ustawieniach**, w zakładce **Ogólne**.
3. Włącz **Ignoruj boty**, chyba że konkretnie chcesz pamiętać role botów.
4. Zdecyduj o **Czyść po banie**. Zostaw wyłączone, jeśli odbanowani członkowie mają odzyskiwać swoje role.
5. W zakładce **Lista blokad** dodaj role staffu, role kar i wszystkie tymczasowe role do **Zablokowane role**.
6. Naciśnij **Zapisz wszystko** w sekcji **Zapisz obecne stany**, aby istniejący członkowie byli objęci od dzisiaj.
7. Sprawdź zakładkę **Stany ról**, aby upewnić się, że migawka się wypełniła.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś). Każda komenda w tym module wymaga uprawnienia Administrator.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `togglerolestates` | `trs` | Administrator | Włączyć lub wyłączyć Stany ról |
| `viewrolestatessettings` | `vrss` | Administrator | Pokazać bieżące ustawienia i listy blokad |
| `viewuserrolestates` | `viewrolestates`, `vurs` | Administrator | Przeglądać wszystkie zapisane stany |
| `saveallrolestates` | `saveserverstates`, `backuprolestates` | Administrator | Zrobić migawkę wszystkich obecnych członków |
| `transferrolestates <serverId>` | `copyrolestates`, `moverolestates` | Administrator | Skopiować stany na inny serwer, dopasowując role po nazwie |
| `togglerolestatesignorebots` | `trsib` | Administrator | Przełączyć ignorowanie kont botów |
| `togglerolestatesclearonban` | `trscob` | Administrator | Przełączyć czyszczenie stanu po banie |
| `togglerolestatesskipautoassign` | `trssaa`, `rsskipautoassign` | Administrator | Przełączyć pomijanie ról automatycznych dla członków z zapisanym stanem |
| `rolestatesadddenyrole @role...` | `rsadr` | Administrator | Dodać role do listy zablokowanych |
| `rolestatesremovedenyrole @role...` | `rsrra` | Administrator | Usunąć role z listy zablokowanych |
| `rolestatesadddenyuser @user...` | `rsadu` | Administrator | Dodać członków do listy zablokowanych |
| `rolestatesremovedenyuser @user...` | `rolestatesremoveadduser`, `rsrau` | Administrator | Usunąć członków z listy zablokowanych |
| `setuserrolestate @user @role...` | `surs` | Administrator | Zastąpić zapisane role członka |
| `addrolestorolestate @user @role...` | `arsrs` | Administrator | Dodać role do zapisanego stanu członka |
| `removerolesfromrolestate @user @role...` | `rrfrs` | Administrator | Usunąć role z zapisanego stanu członka |
| `deleteuserrolestate @user` | `dur` | Administrator | Zapomnieć zapisany stan członka |

Odpowiedniki ukośnikowe znajdują się pod `/rolestates`.

## Wskazówki i pułapki

- Nic nie jest zapisywane dla członków, którzy byli na serwerze, zanim włączyłeś funkcję, dopóki nie wyjdą albo dopóki nie uruchomisz **Zapisz wszystko**. Uruchom to raz zaraz po konfiguracji.
- Zapis uruchamiają tylko wyjścia. Wyrzucenia liczą się jako wyjścia. Bany również liczą się jako wyjścia, a stan jest wtedy ponownie usuwany, jeśli włączone jest **Czyść po banie**.
- Przywracanie używa jednego wywołania dodawania ról. Jedna brakująca lub zbyt wysoka rola powoduje ciche niepowodzenie całego przywracania, więc przy usuwaniu lub zmianie kolejności ról pilnuj, by lista blokad była aktualna.
- Role zarządzane (role integracji botów, rola boosterów) nigdy nie są zapisywane. Discord nadaje je sam.
- `viewuserrolestates` pokazuje po trzech członków na stronę.
- Zarówno `setuserrolestate`, jak i `deleteuserrolestate` przyjmują użytkownika, który już wyszedł, więc możesz poprawić stan, zanim ktoś dołączy ponownie.
- Zablokowani użytkownicy wpływają tylko na automatyczne zapisy i przywracania. Komendy ręczne i **Kopiuj stan ról** nadal działają na tych członkach.

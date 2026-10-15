---
title: Listy zadań
slug: todo
summary: Wspólne i osobiste listy zadań w Discordzie, z priorytetami, terminami, tagami, wyszukiwaniem i uprawnieniami dla każdej osoby.
icon: fa-check
category: Community
dashboard: /dashboard/todo
module: Todo
tags: [todo, tasks, task list, checklist, project, due date, priority, tags, permissions, zadania, lista zadań, lista kontrolna, projekt, termin, priorytet, tagi, uprawnienia]
related: [administration, tickets]
---

## Co robi

Listy zadań dają twojemu serwerowi listy zadań, które żyją w bocie. Członek tworzy listę, dodaje do niej zadania, oznacza je jako wykonane i może przydzielić dostęp, aby inne osoby mogły wyświetlać lub pracować na tej samej liście. Osoby z uprawnieniem Zarządzaj serwerem mogą tworzyć listy dla całego serwera, które widzi każdy członek.

Każde zadanie ma tytuł, opcjonalny opis, priorytet od 1 do 4, opcjonalne tagi, opcjonalny termin i opcjonalny czas przypomnienia. Zadania zachowują swoją pozycję, dzięki czemu możesz zmieniać ich kolejność, a ukończone zadania są oznaczone tym, kto je ukończył i kiedy.

Istnieją dwa rodzaje list. Lista osobista należy do jednego członka i jest niewidoczna dla innych, dopóki właściciel nie przyzna dostępu. Lista serwerowa należy do serwera; domyślnie jest publiczna, więc każdy może ją zobaczyć, ale dodawać lub zmieniać zadania mogą tylko osoby z wyraźnym uprawnieniem.

Listy pojawiają się jako embedy w Discordzie i jako karty w panelu. Panel śledzi też postęp, liczbę przeterminowanych zadań i wskaźnik ukończenia dla otwartej przez ciebie listy.

## Po co z tego korzystać

- Zespół moderacji śledzi zaległe zadania na jednej liście serwerowej zamiast na przypiętej wiadomości, która się dezaktualizuje.
- Organizatorzy wydarzeń udostępniają listę kontrolną i odhaczają punkty w miarę postępów.
- Członkowie prowadzą prywatną listę spraw do załatwienia na serwerze.
- Kanał projektowy potrzebuje tagów i priorytetów, aby zadania „krytyczne” wyróżniały się na tle zadań „niskich”.

## Listy i uprawnienia

Każda lista ma właściciela, czyli osobę, która ją utworzyła. Właściciel może wszystko na tej liście. Inne osoby otrzymują dostęp przez uprawnienia, nadawane dla każdego użytkownika osobno za pomocą `todogrant`.

| Uprawnienie | Co pozwala |
| --- | --- |
| `view` | Zobaczyć listę i jej zadania |
| `add` | Dodawać nowe zadania |
| `edit` | Edytować, tagować, zmieniać kolejność i ustawiać terminy zadań innych osób |
| `complete` | Ukończyć zadania innych osób |
| `delete` | Usuwać zadania innych osób |
| `manage` | Zmieniać ustawienia listy, usuwać listę, nadawać i odbierać dostęp |
| `all` | Wszystkie powyższe uprawnienia |

Podaj kilka uprawnień jako ciąg rozdzielony przecinkami, na przykład `todogrant 12 @user view,add,complete`. Ponowne nadanie zastępuje dotychczasowe uprawnienia danego użytkownika. `todorevoke` odbiera wszystkie.

Niezależnie od uprawnień obowiązują dwie zasady: osoba, która utworzyła zadanie, zawsze może je edytować, ukończyć i usunąć, a właściciel listy zawsze może zrobić wszystko.

Kto może zobaczyć listę:

| Typ listy | Publiczna | Kto może wyświetlać |
| --- | --- | --- |
| Osobista | dowolna | Właściciel oraz każdy, komu nadano `view` |
| Serwerowa | tak (domyślnie) | Wszyscy na serwerze |
| Serwerowa | nie | Właściciel oraz każdy, komu nadano `view` |

`todotoggleprivacy` przełącza listę między publiczną a prywatną. Może to zrobić tylko właściciel lub osoba z uprawnieniem `manage`.

## Zadania

| Pole | Domyślnie | Uwagi |
| --- | --- | --- |
| Tytuł | wymagane | Wyświetlany pogrubiony na liście |
| Opis | brak | Wyświetlany kursywą pod tytułem |
| Priorytet | 1 (Niski) przez komendy, Średni w panelu | 1 Niski, 2 Średni, 3 Wysoki, 4 Krytyczny. Wartości spoza zakresu 1 do 4 są przycinane do tego zakresu |
| Termin | brak | Wyświetlany jako względny znacznik czasu Discorda obok tytułu |
| Czas przypomnienia | brak | Zapisywany przy zadaniu i ustawiany przez `todosetreminder` |
| Tagi | brak | Bez rozróżniania wielkości liter; dodanie istniejącego tagu nic nie zmienia |
| Pozycja | koniec listy | Zmieniasz przez `todoreorder` |

`todoshow` wyświetla oczekujące zadania posortowane według pozycji, potem priorytetu, a na końcu czasu utworzenia. Podaj `true` jako drugi argument, aby dodatkowo pokazać do pięciu ukończonych zadań wraz z czasem ich ukończenia. Daty dla `todosetdue` i `todosetreminder` są rozpoznawane elastycznie, więc działają zarówno `2026-10-01 18:00`, jak i `October 1 2026`.

`todosearch` przeszukuje tytuły, opisy i tagi oczekujących zadań i pokazuje do dziesięciu wyników. `todofilter` zawęża listę według jednego tagu (`todofilter 12 tag bug`) albo priorytetu (`todofilter 12 priority 4`).

Każda lista może mieć kolor w formacie hex, ustawiany przez `todosetcolor 12 #ff8800`; jest on używany jako obramowanie embeda. Domyślnie to `#7289da`.

## Ustawienia

Nie ma ustawień dla całego serwera. Wszystko ustawia się dla listy lub zadania.

Strona Listy zadań ma jeden widok. Po lewej stronie znajdują się wszystkie listy, które widzisz, z polem **Szukaj list zadań**, przełącznikiem **Pokaż ukończone zadania** oraz **Sortuj według** (Priorytet, Termin, Utworzono, Tytuł) z selektorem kolejności. Wybranie listy pokazuje jej zadania z przyciskami **Dodaj zadanie** i **Usuń listę**, edytorem zadania z polami **Priorytet** i **Termin** oraz przyciskiem **Zarządzaj uprawnieniami** przy każdej liście.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Nazwa i opis listy | wymagane, brak | Ustawiane przy tworzeniu listy przyciskiem **Utwórz listę** |
| Priorytet (zadanie) | Średni | Priorytet zadania; wyświetlany jako kolorowy znacznik |
| Termin (zadanie) | brak | Termin używany przy liczniku przeterminowanych zadań |
| Pokaż ukończone zadania | wył. | Czy wykonane zadania pojawiają się w widoku listy |

> [!NOTE]
> Listy utworzone z panelu są zawsze listami serwerowymi. Listy osobiste twórz komendą `todocreatelist` w Discordzie.

## Krok po kroku

1. Otwórz **Listy zadań** w panelu i kliknij **Utwórz listę**.
2. Wpisz nazwę i opcjonalny opis. Lista zostanie utworzona jako publiczna lista serwerowa.
3. Kliknij listę, a potem **Dodaj zadanie**. Wypełnij **Co trzeba zrobić?**, opcjonalny opis i priorytet.
4. Użyj **Zarządzaj uprawnieniami** na karcie listy, aby zobaczyć, kto ma dostęp. Nadaj dostęp z Discorda komendą `todogrant <listId> @user add,complete`, aby te osoby mogły na niej pracować.
5. W Discordzie wpisz `todolists`, aby poznać ID listy, a potem `todoshow <listId>`, aby sprawdzić, czy wyświetla się poprawnie.
6. Oznaczaj zadania jako wykonane komendą `todocomplete <itemId>`; ID zadania jest pokazane w backtickach w `todoshow`.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś). ID list i zadań pochodzą z `todolists` i `todoshow`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `todocreatelist <name> [description]` | `tcl` | Nikt | Utworzyć listę osobistą |
| `todocreateserverlist <name> [description]` | `tcsl` | Zarządzaj serwerem | Utworzyć listę dla całego serwera |
| `todolists [includeServer]` | | Nikt | Wyświetlić listy, które widzisz; podaj `false`, aby zobaczyć tylko listy osobiste |
| `tododeletelist <listId>` | `tdl` | Nikt | Usunąć listę wraz ze wszystkimi zadaniami (właściciel lub `manage`) |
| `todoshow <listId> [includeCompleted]` | `ts` | Nikt | Pokazać zadania listy |
| `todoadd <listId> <title> [description]` | `ta` | Nikt | Dodać zadanie z priorytetem Niskim |
| `todoaddpriority <listId> <priority> <title> [description]` | `tap` | Nikt | Dodać zadanie z priorytetem od 1 do 4 |
| `todoedit <itemId> <title> [description]` | `te` | Nikt | Zmienić tytuł i opis zadania |
| `todocomplete <itemId>` | `tc` | Nikt | Oznaczyć zadanie jako wykonane |
| `tododelete <itemId>` | `td` | Nikt | Usunąć zadanie |
| `todoreorder <itemId> <position>` | `tr` | Nikt | Przenieść zadanie na pozycję numerowaną od 1 |
| `todosetdue <itemId> <date>` | `tsd` | Nikt | Ustawić termin |
| `todocleardue <itemId>` | `tcd` | Nikt | Usunąć termin |
| `todosetreminder <itemId> <date>` | `tsr` | Nikt | Ustawić czas przypomnienia |
| `todoclearreminder <itemId>` | `tcr` | Nikt | Usunąć czas przypomnienia |
| `todoaddtag <itemId> <tag>` | `tat` | Nikt | Dodać tag |
| `todoremovetag <itemId> <tag>` | `trt` | Nikt | Usunąć tag |
| `todosearch <listId> <query>` | `tsearch` | Nikt | Szukać oczekujących zadań po tytule, opisie lub tagu |
| `todofilter <listId> <tag or priority> <value>` | `tf` | Nikt | Filtrować oczekujące zadania po jednym tagu lub jednym priorytecie |
| `todosetcolor <listId> <#hex>` | `tsc` | Nikt | Ustawić kolor embeda |
| `todotoggleprivacy <listId>` | `ttp` | Nikt | Przełączyć listę między publiczną a prywatną |
| `todogrant <listId> @user <perms>` | `tg` | Nikt | Nadać uprawnienia rozdzielone przecinkami |
| `todorevoke <listId> @user` | `trv` | Nikt | Odebrać wszystkie uprawnienia użytkownika |
| `todopermissions <listId>` | `tp` | Nikt | Pokazać, kto ma jakie uprawnienia |

„Nikt” oznacza, że komenda nie sprawdza uprawnień Discorda; o powodzeniu komendy decydują uprawnienia samej listy. Te same komendy istnieją jako komendy ukośnikowe pod `/todo`.

## Wskazówki i pułapki

- Czasy przypomnień są zapisywane przy zadaniu, ale bot obecnie nie wysyła przypomnienia, gdy ten czas nadejdzie. Na razie traktuj to jako notatkę.
- `todoshow` oznacza listę jako nieznalezioną, jeśli nie masz dostępu `view`, nawet gdy ID jest poprawne.
- Nazwa listy musi być unikalna dla danego właściciela i typu, więc dwóch członków może mieć każdy po liście osobistej „Zakupy”, ale jeden członek nie może mieć dwóch.
- `todoreorder` przenumerowuje wszystkie zadania na liście, więc pozycje są ciągłe.
- Publiczne listy serwerowe może czytać każdy, ale nikt poza właścicielem nie może do nich dodawać, dopóki nie nadasz `add`.
- Użyj `todogrant` w Discordzie, aby nadać pełny zestaw uprawnień; widok **Zarządzaj uprawnieniami** w panelu służy do sprawdzania, kto ma dostęp.
- Usunięcie listy usuwa jej uprawnienia i zadania za jednym razem i nie można tego cofnąć.

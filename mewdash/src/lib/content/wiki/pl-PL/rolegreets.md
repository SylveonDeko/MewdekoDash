---
title: Powitania ról
slug: rolegreets
summary: Wysyłaj własną wiadomość na kanał, gdy członek dostanie określoną rolę, z placeholderami, embedami, webhookami i automatycznym usuwaniem.
icon: fa-user
category: Actions
dashboard: /dashboard/rolegreets
module: RoleGreets
tags: [role greet, role greets, welcome, role message, role announcement, verification welcome, webhook greet, powitania ról, powitanie roli, wiadomość powitalna, ogłoszenie roli, powitanie po weryfikacji, powitanie webhook]
related: [multigreets, embedbuilder, administration]
---

## Co robi

Powitanie roli to wiadomość, którą bot publikuje, gdy członek dostaje rolę. Staff wybiera rolę i kanał, pisze wiadomość, a od tej pory za każdym razem, gdy ktoś dostanie tę rolę, bot publikuje wiadomość na tym kanale. Domyślna wiadomość to `Welcome %user.mention%!`.

Wiadomość przechodzi przez parser embedów, więc może być zwykłym tekstem, pełnym embedem albo embedem z przyciskami zbudowanym w edytorze w panelu. Placeholdery wstawiają nazwę członka, jego awatar, datę dołączenia i dane serwera. Każde powitanie może być wysyłane przez webhook z własną nazwą i awatarem oraz może usunąć się samo po ustawionej liczbie sekund.

Powitania są przypisane do roli i kanału. Jedna rola może mieć do dziesięciu powitań, każde na innym kanale albo z inną wiadomością, a powitanie można wyłączyć bez jego usuwania.

## Po co to używać

- Witaj członków na głównym czacie dopiero po przejściu weryfikacji i otrzymaniu roli Zweryfikowany.
- Ogłaszaj nowych boosterów na kanale z podziękowaniami, gdy pojawi się rola boostera.
- Powiedz komuś, kto właśnie wybrał rolę gry, gdzie są jej kanały.
- Publikuj listę zadań wdrożeniowych dla staffu na kanale staffu, gdy nada się rolę moderatora.
- Witaj członków dodanych do roli giveawayu lub wydarzenia zasadami tego wydarzenia.

## Jak uruchamia się powitanie

Bot obserwuje aktualizacje członków i porównuje ich role przed i po zmianie. Dla każdej dodanej roli wyszukuje powitania przypisane do niej i publikuje każde z nich. Usunięte role nigdy niczego nie uruchamiają. Boty są pomijane, chyba że w danym powitaniu włączono **Witaj boty**, a wyłączone powitanie jest ignorowane.

Jeśli kanał już nie istnieje, powitanie usuwa się samo. Jeśli powitanie przez webhook się nie powiedzie, bo webhook został usunięty albo bot stracił uprawnienia, powitanie zostaje wyłączone zamiast usunięte, abyś mógł je naprawić i włączyć ponownie.

Gdy webhook jest ustawiony, wiadomość wysyłana jest pod nazwą i awatarem webhooka. Automatyczne usuwanie nadal działa: bot pobiera wiadomość, którą właśnie wysłał, i usuwa ją po opóźnieniu.

## Placeholdery

Powitania ról obsługują grupy placeholderów użytkownika, serwera i bota. Placeholdery kanału nie są dostępne.

| Placeholder | Wartość |
| --- | --- |
| `%user.mention%`, `%user%` | Wzmianka o członku, który dostał rolę |
| `%user.name%`, `%username%` | Jego nazwa użytkownika |
| `%user.fullname%` | Nazwa użytkownika z tagiem |
| `%user.avatar%` | URL awatara |
| `%user.banner%` | URL banera |
| `%user.id%` | ID użytkownika |
| `%user.created_date%`, `%user.created_time%` | Data i godzina utworzenia konta |
| `%user.joined_date%`, `%user.joined_time%` | Data i godzina dołączenia na serwer |
| `%server.name%`, `%server%` | Nazwa serwera |
| `%server.members%` | Liczba członków z pamięci podręcznej |
| `%server.icon%`, `%server.banner%` | URL ikony i banera serwera |
| `%server.boostlevel%`, `%server.boostcount%` | Poziom boostów i ich liczba |
| `%server.time%`, `%time.day%` | Czas serwerowy i dzień tygodnia |
| `%bot.name%`, `%bot.avatar%`, `%bot.id%` | Nazwa, awatar i ID bota |

Gdy na serwerze włączone jest śledzenie zaproszeń, placeholdery zapraszającego i zaproszenia z powitań (`%inviter.username%`, `%inviter.mention%`, `%inviter.count%`, `%invite.code%`, `%invite.label%` i pozostałe) również są wypełniane danymi osoby, która zaprosiła członka. Jeśli zapraszający nie jest znany, wyświetlają `Unknown`.

> [!EXAMPLE]
> `Welcome to the team, %user.mention%! You are member number %server.members%. Check the pins in this channel first.`

## Ustawienia

Strona Powitania ról ma u góry formularz **Dodaj nowe powitanie roli**, a poniżej kartę dla każdego powitania.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Rola, dla której witać | brak | Rola, która uruchamia powitanie |
| Wyślij powitanie na kanał | brak | Gdzie wiadomość jest publikowana |
| Wiadomość | `Welcome %user.mention%!` | Otwiera edytor embedów |
| Czas usunięcia (sekundy, 0 oznacza nigdy) | 0 | Opóźnienie automatycznego usuwania |
| URL webhooka (opcjonalnie) | brak | Publikowanie przez webhook zamiast przez bota |
| Witaj boty | wyłączone | Witaj także konta botów, które dostają rolę |
| Włączone | włączone | Przełącznik na karcie; wyłączone powitania nic nie robią |

## Konfiguracja krok po kroku

1. Otwórz **Powitania ról** w panelu.
2. W **Dodaj nowe powitanie roli** wybierz **Rola, dla której witać** i **Wyślij powitanie na kanał**, a następnie kliknij **Dodaj powitanie roli**.
3. Na nowej karcie kliknij pole wiadomości, aby otworzyć edytor, i napisz powitanie, używając placeholderów z listy powyżej.
4. Ustaw **Czas usunięcia**, jeśli kanał ma pozostać uporządkowany, i wklej **URL webhooka**, jeśli chcesz własną nazwę i awatar.
5. Zapisz kartę, a potem nadaj rolę testowemu kontu i sprawdź kanał.
6. Użyj przełącznika na karcie, aby wstrzymać powitanie, albo przycisku usuwania, aby je usunąć.

> [!TIP]
> Na Discordzie `rolegreetmessage 1` bez tekstu pokazuje bieżącą wiadomość i oferuje przycisk **Podgląd**, który renderuje ją z Twoimi danymi.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś). Powitania są numerowane według pozycji na liście `rolegreetlist`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `rolegreetadd <@role> [#channel]` | `rgadd`, `rga` | Administrator | Dodaje powitanie dla roli na bieżącym kanale, jeśli żaden nie został podany |
| `rolegreetlist` | `rglist`, `rgl` | Administrator | Przegląda stronami wszystkie powitania z ich ustawieniami |
| `rolegreetmessage <id> [message]` | `rgmsg`, `rgm` | Administrator | Ustawia wiadomość albo, bez tekstu, ją pokazuje i podgląda |
| `rolegreetremove <id or @role>` | `rgrem`, `rgrm`, `rgr` | Administrator | Usuwa jedno powitanie po numerze albo wszystkie powitania dla roli po potwierdzeniu |
| `rolegreetdelete <id> <time or seconds>` | `rgdel`, `rgd` | Administrator | Opóźnienie automatycznego usuwania, na przykład `30s` lub `30`; `0` wyłącza |
| `rolegreetdisable <id> <true/false>` | `rgdisable`, `rgdis` | Administrator | Wyłącza powitanie albo ponownie je włącza |
| `rolegreetgreetbots <id> <true/false>` | `rolegreetbots`, `rggb` | Administrator | Czy boty uruchamiają powitanie |
| `rolegreetwebhook <id> [name] [avatar url]` | `rgwebhook`, `rghook`, `rgh` | Administrator | Tworzy webhook na kanale powitania z tą nazwą i awatarem albo go usuwa, gdy nie podano nazwy |

Komendy slash znajdują się pod `/rolegreets` i mają te same akcje: `add`, `remove`, `removerole`, `message`, `delete`, `disable`, `greetbots`, `webhook` i `list`.

## Wskazówki i pułapki

- Bot potrzebuje uprawnień Wysyłanie wiadomości i Osadzanie linków na kanale powitania, Zarządzanie wiadomościami na tym kanale do automatycznego usuwania oraz Zarządzanie webhookami, aby utworzyć webhook komendą `rolegreetwebhook`.
- Limit to dziesięć powitań na rolę, a nie na serwer. Komenda dodawania odrzuci jedenaste.
- Powitania uruchamiają się przy każdym nadaniu roli, także z ról reakcji, nagród za poziomy i innych botów, więc rola często dodawana i usuwana będzie zaspamować kanał.
- Jeśli parser embedów nic nie wyprodukuje, na przykład gdy wiadomość składa się tylko z białych znaków, nic nie zostanie wysłane.
- `rolegreetremove` z rolą usuwa wszystkie powitania dla tej roli po pytaniu tak/nie; z numerem usuwa tylko jedno, od razu.
- Numery przesuwają się, gdy powitanie zostanie usunięte. Przed edycją po numerze uruchom ponownie `rolegreetlist`.
- Powitania ról są osobne od powitań przy dołączeniu ze strony Powitania. Używaj Powitań dla osób dołączających do serwera, a powitań ról dla ról nadanych później.

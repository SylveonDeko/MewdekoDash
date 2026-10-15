---
title: Menu ról
slug: role-menus
summary: Publikuje wiadomość z listą rozwijaną lub przyciskami, z których członkowie wybierają własne role.
icon: fa-list-ul
category: Actions
dashboard: /dashboard/role-menus
module: RoleMenus
tags: [role menus, self roles, dropdown, buttons, pronouns, colors, menu ról, samodzielne role, lista rozwijana, przyciski, zaimki, kolory]
related: [administration, embedbuilder, rolestates]
---

## Co to robi

Menu ról to jedna wiadomość na kanale z **listą rozwijaną** lub rzędem **przycisków** pod nią. Każda opcja w menu nadaje rolę. Członkowie wybierają opcję, aby dostać rolę, i wybierają ją ponownie, aby ją oddać, więc serwer może pozwolić ludziom wybierać zaimki, kolory, pingi lub regiony bez pytania personelu.

Każde menu ma nazwę (widzi ją tylko personel i jest tytułem domyślnej wiadomości), kanał, wiadomość i do 25 opcji. Opcja ma rolę, nazwę wyświetlaną w menu, opcjonalne emoji i opcjonalny opis. Opisy pokazują się pod każdą opcją listy rozwijanej i w domyślnej wiadomości. Przyciski mają też kolor: blurple, szary, zielony lub czerwony.

Wiadomość może być czymkolwiek, co tworzy kreator embedów: zwykłym tekstem, jednym lub kilkoma embedami albo jednym i drugim. Jeśli zostawisz ją pustą, bot zamiast tego opublikuje nazwę menu z wierszem dla każdej opcji.

## Wybierz dowolne lub jedną

- **Dowolne** pozwala członkom włączać i wyłączać każdą rolę. Dwa limity kontrolują, ile ról mogą mieć: **Musi zachować co najmniej** nie pozwala im zejść poniżej tej liczby po wybraniu, a **Może mieć najwyżej** ogranicza, ile mogą mieć z menu (domyślnie bez limitu).
- **Jedna** zamienia role: wybranie nowej opcji usuwa tę, którą mieli. Włącz **Zachowaj jedną po wyborze**, a członkowie mogą zmieniać wybór, ale nie mogą go wyczyścić.

## Limity

| Limit | Wartość |
| --- | --- |
| Menu na serwer | 50 |
| Opcji w menu | 25 |
| Przycisków w rzędzie | 5 |
| Nazwa menu | 100 znaków |
| Nazwa w menu | 80 znaków |
| Opis | 100 znaków |
| Tekst podpowiedzi listy rozwijanej | 150 znaków |
| Zwykła wiadomość tekstowa | 2000 znaków |

Każda rola może być w menu tylko raz. Bot może nadawać tylko role poniżej swojej najwyższej roli, których nie zarządza żadna integracja, a personel może oferować tylko role poniżej swojej najwyższej roli.

## Wymagana rola

Menu może wymagać roli. Członkowie bez niej dostają prywatną notatkę, że jej potrzebują, a nic się nie zmienia.

## Potwierdzenie

Gdy włączona jest opcja **Informuj członków o zmianach**, członkowie dostają prywatną notatkę widoczną tylko dla nich, z listą dodanych i usuniętych ról. Gdy jest wyłączona, menu działa po cichu, choć członkowie nadal dostają prywatną notatkę, jeśli coś pójdzie nie tak, np. trafią na limit albo na rolę, której bot nie może nadać.

## Edycja, wstrzymywanie i ponowne publikowanie

Zapisanie edycji przebudowuje tę samą wiadomość w miejscu. Nowa wiadomość jest publikowana tylko wtedy, gdy zmieni się kanał albo stara wiadomość zniknie.

**Wstrzymaj** wyszarza listę rozwijaną lub przyciski w Discordzie, dopóki menu nie zostanie wznowione. **Opublikuj ponownie** publikuje świeżą kopię i usuwa starą wiadomość, co pomaga, gdy menu przewinęło się poza widok albo zostało ręcznie usunięte. Jeśli kanał menu został usunięty, edytuj je, wybierz nowy kanał i zapisz, aby opublikować je ponownie.

Usunięcie menu usuwa także jego wiadomość. Członkowie zachowują role, które już wybrali.

## Przenoszenie starszych konfiguracji

Starsze konfiguracje ról z emoji polegały na tym, że członkowie dodawali emoji pod wiadomością, aby dostać rolę. Zakładka **Przenieś starsze konfiguracje** je wyświetla. Przeniesienie jednej tworzy menu ról z tymi samymi rolami i emoji, jako listę rozwijaną lub przyciski, na tym samym kanale albo innym. Może skopiować tekst i embedy starej wiadomości oraz może wycofać starą konfigurację, co ją zatrzymuje i czyści jej emoji. Jeśli wiadomość oryginalną opublikował bot, wycofanie usuwa ją. Konfiguracja, w której członkowie mogli mieć tylko jedną rolę, staje się menu typu Jedna.

## Komendy

| Komenda | Co robi |
| --- | --- |
| `rolemenus` | Wypisuje wszystkie menu z kanałem, typem, liczbą opcji i statusem. |
| `rolemenuinfo 3` | Pokazuje wszystko o jednym menu. |
| `rolemenucreate #roles dropdown @Role @Role` | Publikuje nowe menu z jedną opcją na rolę. |
| `rolemenuadd 3 @Role [emoji] [name]` | Dodaje rolę do menu. |
| `rolemenuremove 3 @Role` | Usuwa rolę z menu. |
| `rolemenuname 3 Pronouns` | Zmienia nazwę menu. |
| `rolemenumessage 3 [message\|clear]` | Pokazuje, ustawia lub czyści wiadomość nad menu. |
| `rolemenustyle 3 dropdown\|buttons` | Przełącza między listą rozwijaną a przyciskami. |
| `rolemenumode 3 multi\|exclusive` | Przełącza między Dowolne a Jedna. |
| `rolemenulimits 3 0 2` | Ustawia, ile ról członkowie muszą zachować i ile mogą mieć. |
| `rolemenurequire 3 [@Role]` | Ustawia lub czyści wymaganą rolę. |
| `rolemenureply 3 private\|silent` | Włącza lub wyłącza prywatną notatkę. |
| `rolemenupause 3` | Wstrzymuje menu albo je wznawia, gdy jest wstrzymane. |
| `rolemenurepost 3 [#channel]` | Publikuje świeżą kopię i usuwa starą wiadomość. |
| `rolemenudelete 3` | Usuwa menu i jego wiadomość. |
| `rolemenuimport messageId [dropdown\|buttons]` | Przenosi starszą konfigurację ról z emoji do nowego menu. |

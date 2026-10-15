---
title: Embedy
slug: embedbuilder
summary: Twórz bogate wiadomości Discorda z embedami, przyciskami i menu wyboru, zapisuj je jako szablony, wysyłaj na kanał i używaj tego samego JSON-a wszędzie tam, gdzie bot przyjmuje własną wiadomość.
icon: fa-link
category: Actions
dashboard: /dashboard/embedbuilder
module: Utility
tags: [embed, embed builder, json, say, template, webhook, persona, buttons, select menu, custom message, kreator embedów, szablon, przyciski, menu wyboru, własna wiadomość]
related: [multigreets, chat-triggers, afk, feeds, giveaways, suggestions]
---

## Co to robi

Kreator embedów to wizualny edytor wiadomości Discorda. Wypełniasz tytuł, opis, kolor, pola, obrazy oraz opcjonalne przyciski lub menu wyboru, oglądasz podgląd na żywo i na końcu dostajesz blok JSON. Ten JSON to uniwersalny format wiadomości bota. Wklej go do `say`, aby opublikować wiadomość, zapisz jako nazwany szablon albo wstaw do dowolnej funkcji przyjmującej własną wiadomość, na przykład powitań, wyzwalaczy czatu, odpowiedzi AFK, aktualizacji feedów czy wiadomości prywatnej dla zwycięzcy konkursu.

Szablony mogą być osobiste, widoczne tylko dla ciebie na wszystkich serwerach, albo udostępnione serwerowi, tak aby każdy członek staffu mógł je wczytać. Panel może też wysłać gotową wiadomość bezpośrednio na kanał, opcjonalnie przez webhook z własną nazwą i awatarem, nazywany personą.

Członkowie nigdy nie korzystają z kreatora. Widzą tylko wiadomości, które on tworzy.

## Po co z tego korzystać

- Napisz post z regulaminem lub informacjami z dobrym formatowaniem, a potem zaktualizuj go komendą `edit`.
- Zaprojektuj wiadomość powitalną raz, a potem wklej JSON do powitań.
- Przechowuj zestaw szablonów ogłoszeń, aby staff publikował spójnie wyglądające aktualizacje.
- Dodaj przyciski uruchamiające wyzwalacze czatu albo menu wyboru, które nadaje role przez wyzwalacze.
- Publikuj jako „Wiadomości serwera” z własnym awatarem, bez przyznawania komukolwiek dostępu do webhooków.

## Format JSON

Parser szuka pierwszego `{` w tekście i czyta do odpowiadającego mu `}`. Jeśli nie ma obiektu JSON albo nie da się go sparsować, cały tekst traktowany jest jako zwykła treść. Nazwy właściwości nie rozróżniają wielkości liter.

| Klucz | Typ | Znaczenie |
| --- | --- | --- |
| `content` | ciąg znaków | Zwykły tekst wyświetlany nad embedami |
| `embed` | obiekt | Pojedynczy embed. Jeśli jest obecny, `embeds` jest ignorowane. |
| `embeds` | tablica | Do dziesięciu obiektów embed |
| `components` | tablica | Przyciski i menu wyboru |

Obiekt embed akceptuje `title`, `description`, `url`, `color`, `author` (`name`, `url`, `icon_url`), `footer` (`text`, `icon_url`), `thumbnail` (`url`), `image` (`url`) oraz `fields` (tablica elementów `name`, `value`, `inline`). `color` może być liczbą lub ciągiem znaków, na przykład `#5865F2`. Nazwy pól są ucinane do 256 znaków, a wartości do 1024. Każdy URL, który nie jest pełnym adresem bezwzględnym, zostaje pominięty zamiast powodować błąd całej wiadomości. Klucz `timestamp` jest akceptowany, ale nie jest wyświetlany.

Komponent ma `row` (w którym wierszu się znajduje), `displayName` oraz albo `url` dla przycisku-linku, albo `id` dla przycisku powiązanego z wyzwalaczem czatu. `style` przyjmuje wartości od 1 do 4 dla czterech stylów przycisków Discorda, a `emoji` jest opcjonalne. Ustaw `isSelect` na true, aby uzyskać menu wyboru, a następnie podaj `options` (każda z `id`, `name`, `description`, `emoji`) oraz `minOptions` i `maxOptions` z zakresu od 0 do 25. Komponent łamiący zasadę jest wyświetlany jako wyłączony czerwony przycisk, którego etykietą jest błąd, dzięki czemu widać na Discordzie, co poszło źle.

> [!EXAMPLE]
> `{"content": "Witaj %user.mention%!", "embeds": [{"title": "Przeczytaj regulamin", "description": "Zobacz %channel.mention%", "color": "#57F287"}]}`

### Symbole zastępcze

Przycisk **%** w kreatorze wstawia symbole zastępcze ze strony placeholderów (użytkownik, serwer, kanał, bot, czas i tak dalej). Panel ich nie zamienia: wiadomość wysłana z zakładki **Wyślij** trafia z dosłownym tekstem. Bot zamienia je, gdy JSON przechodzi przez komendę lub funkcję, na przykład `say`, `embedpreview`, powitania i wyzwalacze. Każda funkcja dodaje własny zestaw, na przykład `%afk.message%` lub `%giveawayitem%`, oprócz ogólnych.

## Szablony

Szablon to nazwa wraz z JSON-em. Istnieją dwa zakresy.

| Zakres | Kto go widzi | Utworzony przez |
| --- | --- | --- |
| Osobisty | Tylko ty, na dowolnym serwerze i w wiadomościach prywatnych | `embedsave` albo **Zapisz** na panelu z odznaczonym udostępnianiem |
| Udostępniony serwerowi | Każdy z dostępem na tym serwerze | `guildembedsave` (Zarządzanie wiadomościami) albo **Zapisz** z zaznaczonym **Udostępnij wszystkim na (serwer)** |

Nazwy muszą być unikalne w obrębie zakresu. `embedpreview <name>` najpierw szuka twojego szablonu osobistego, potem udostępnionego szablonu serwera, zamienia symbole zastępcze i publikuje wiadomość na bieżącym kanale.

Niektóre komendy przyjmują odwołanie do szablonu zamiast surowego JSON-a: jako wiadomość wpisz `{template:name}` lub `{t:name}`. Obsługuje to `multigreetmessage`. Zapisywany jest rozwiązany JSON, a nie odwołanie, więc późniejsze edycje szablonu nie aktualizują powitania.

## Strona panelu

Strona nosi tytuł **Kreator embedów Discorda** i ma sześć zakładek, obok których znajdują się **Podgląd na żywo** i panel **Problemy**. W nagłówku znajdują się **Cofnij**, **Ponów**, **Anuluj zmiany** i **Kopiuj JSON**.

| Zakładka | Co tu robisz |
| --- | --- |
| Szablony | Wybierz z galerii gotowych punktów startowych albo **Zacznij od zera** |
| Edytor | **Treść wiadomości** oraz do dziesięciu embedów. Każdy embed ma tytuł, opis, URL, kolor, autora, stopkę, do 25 pól, miniaturę i obraz, z licznikami znaków. |
| Komponenty | Do pięciu wierszy i 25 komponentów. Dodawaj przyciski (tekst, styl, emoji, URL lub wyzwalacz) i menu wyboru (placeholder, opcje z powiązaniami z wyzwalaczami). |
| JSON | Surowy ładunek. **Odśwież z kreatora** go przegenerowuje; **Zastosuj w kreatorze** wczytuje wklejony JSON, czy to pełny ładunek, czy pojedynczy obiekt embed. |
| Zapisane | **Zapisz bieżący embed** z nazwą i polem udostępniania, a poniżej listy **Udostępnione na (serwer)** i **Moje embedy** z przyciskami **Wczytaj** i **Usuń** |
| Wyślij | Wybierz kanał, sprawdź tam swoje uprawnienia, opcjonalnie wyślij przez webhook jako persona albo z własną nazwą i URL-em awatara, a potem **Wyślij wiadomość** |

### Wysyłanie i persony

Zakładka **Wyślij** pokazuje tylko kanały, na których ty i bot możecie pisać. Wysyłanie embedów wymaga uprawnienia Osadzanie linków dla obu. Jeśli nie masz uprawnienia Wspominanie @everyone, wzmianki everyone, here i ról są usuwane, a zakładka ostrzega o tym.

Wysyłanie przez webhook wymaga uprawnienia Zarządzanie webhookami dla ciebie i bota. **Persona** to zapisana nazwa i awatar, osobiste albo udostępnione serwerowi; **Zarządzaj** otwiera listę person. Persony z przesłanym obrazem dostają własny webhook na każdym kanale, więc na jednym kanale może być ich najwyżej piętnaście. Opcja **Własne** przyjmuje zamiast tego nazwę wyświetlaną i link do awatara. Każde wysłanie jest zapisywane w dzienniku audytu panelu.

Ten sam kreator otwiera się jako wyskakujące okno na innych stronach panelu (powitania, wyzwalacze i inne), z zakładkami tylko **Edytor**, **Komponenty**, **JSON** i **Zapisane**.

## Ustawienia

Kreator nie ma ustawień serwera. Wszystko dotyczy pojedynczej wiadomości lub szablonu.

## Przewodnik konfiguracji

1. Otwórz **Embedy** na panelu i wybierz szablon albo **Zacznij od zera**.
2. W **Edytorze** napisz treść i wypełnij embed. Obserwuj panel **Problemy**, czy nie ma czegoś, co Discord odrzuci.
3. Jeśli potrzebujesz przycisków lub menu, dodaj je w **Komponentach**, wiążąc każde z wyzwalaczem czatu albo URL-em.
4. Przejdź do **Zapisane**, nadaj nazwę, zaznacz **Udostępnij wszystkim na (serwer)**, jeśli staff ma z niego korzystać, i naciśnij **Zapisz**.
5. Aby opublikować od razu, otwórz **Wyślij**, wybierz kanał i naciśnij **Wyślij wiadomość**. Aby użyć go gdzie indziej, naciśnij **Kopiuj JSON** i wklej go w innej funkcji.
6. Na Discordzie `embedpreview <name>` publikuje zapisany szablon z uzupełnionymi symbolami zastępczymi.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `say [#channel] <text or JSON>` | | Zarządzanie wiadomościami | Publikuje tekst lub JSON embedu jako bot, z zamienionymi symbolami zastępczymi. Wiadomość może pochodzić z załącznika `.txt`. |
| `edit #channel <message id> <text or JSON>` | | Zarządzanie wiadomościami | Zastępuje treść wiadomości wysłanej przez bota |
| `embedsave <name> <JSON>` | `esave` | Nikogo | Zapisuje szablon osobisty |
| `embedlist` | `elist` | Nikogo | Wypisuje twoje szablony osobiste |
| `embeddelete <name>` | `edel`, `edelete` | Nikogo | Usuwa jeden z twoich szablonów osobistych |
| `guildembedsave <name> <JSON>` | `gesave`, `gembedsave` | Zarządzanie wiadomościami | Zapisuje szablon udostępniony temu serwerowi |
| `guildembedlist` | `gelist`, `gembedlist` | Nikogo | Wypisuje udostępnione szablony serwera |
| `guildembeddelete <name>` | `gedel`, `gembeddelete` | Zarządzanie wiadomościami | Usuwa udostępniony szablon |
| `embedpreview <name>` | `epreview`, `eprev` | Nikogo | Publikuje zapisany szablon na bieżącym kanale |

## Wskazówki i pułapki

- `say` odzwierciedla twoje prawa do wspominania: bez uprawnienia Wspominanie @everyone bot nie oznaczy za ciebie wszystkich ani ról.
- Embed z samym tytułem i niczym więcej nadal zostaje wysłany, ale panel nie pozwoli go skopiować ani wysłać, dopóki nie będzie tytułu, opisu, pola lub treści.
- Przyciski powiązane z wyzwalaczem działają tylko na serwerze, którego ID wyzwalacza wskazują. Wczytanie udostępnionego szablonu na innym serwerze sprawia, że te przyciski przestają działać.
- Błędne URL-e obrazów, miniatur, autorów i stopek są po cichu pomijane. Jeśli obrazu brakuje, sprawdź, czy URL zaczyna się od `https://`.
- Discord limituje wiadomość do dziesięciu embedów, 25 pól na embed, pięciu wierszy komponentów i pięciu przycisków w wierszu. Kreator egzekwuje te same liczby.
- Usunięcie persony nie usuwa webhooków, które utworzyła na kanałach. W razie potrzeby usuń je w ustawieniach integracji kanału.

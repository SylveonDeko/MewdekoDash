---
title: Alerty o streamach
slug: streams
summary: Obserwuj streamerów na Twitchu, YouTube, Kick i Picarto i publikuj ogłoszenie na wybranym kanale, gdy wchodzą na żywo albo kończą nadawanie.
icon: fa-video
category: Community
dashboard: /dashboard/streams
module: Searches
tags: [streams, stream alerts, go live, live notifications, twitch, youtube, kick, picarto, trovo, streamadd, streamtemplate, streamy, alerty o streamach, na żywo, powiadomienia na żywo, szablon streama]
related: [twitch, utility, administration]
---

## Co robi

Moderatorzy wklejają URL streama i wybierają kanał Discorda. Bot odpytuje wtedy platformę tego streamera i gdy stream zmienia stan z offline na online, publikuje wiadomość o starcie na wybranym kanale. Domyślnie jest to embed z nazwą streamera jako linkiem do streama, tytułem streama, grą lub kategorią, liczbą widzów, awatarem streamera i podglądem.

Domyślny embed możesz zastąpić własną wiadomością. Istnieje szablon dla całego serwera, który dotyczy każdego obserwowanego streama, a każdy stream może mieć też własną wiadomość online i własną wiadomość offline. Wszystkie akceptują placeholdery `%stream.*%` wymienione poniżej i mogą być zwykłym tekstem albo pełnym embedem zbudowanym w edytorze embedów w panelu.

Powiadomienia offline są domyślnie wyłączone. Jeśli je włączysz, bot publikuje też wiadomość, gdy obserwowany stream się kończy, używając wiadomości offline tego streama, jeśli jest ustawiona, w przeciwnym razie szablonu serwera, a w ostateczności domyślnego embedu z napisem "Offline".

> [!NOTE]
> Alerty o streamach ogłaszają cudze streamy na twoim Discordzie. Osobna funkcja Twitch Bot łączy bota z czatem twojego własnego Twitcha dla komend, timerów i zdarzeń. Opisuje ją artykuł o Twitch Bot.

## Po co z tego korzystać

- Społeczność potrzebuje kanału „teraz na żywo”, który zapala się, gdy któryś z jej twórców zaczyna streamować.
- Discord streamera chce automatycznego pingu z tytułem i kategorią, żeby nikt nie musiał pisać tego ręcznie.
- Serwer e-sportowy albo eventowy obserwuje w jednym miejscu kilka kanałów turniejowych na Twitchu i Kick.
- Serwer chce czytelnego powiadomienia „stream zakończony”, żeby post o starcie nie wyglądał na nieaktualny.

## Obsługiwane platformy

Bot wybiera platformę na podstawie podanego URL. Obserwować można tylko URL-e pasujące do jednego z tych wzorców.

| Platforma | Format URL | Uwagi |
| --- | --- | --- |
| Twitch | `twitch.tv/username` | Używa API Twitch Helix. Tytuł, gra, widzowie, awatar i podgląd są wypełniane. |
| YouTube | `youtube.com/@handle` albo `youtube.com/channel/ID` | Odczytywane przez pobieranie strony live kanału, więc dane mogą być mniej kompletne niż na Twitchu. URL z ID kanału jest zamieniany na handle. |
| Kick | `kick.com/slug` | Używa publicznego API Kick. Miejsce na awatar wypełniane jest zdjęciem banera kanału. |
| Picarto | `picarto.tv/name` | Używa API Picarto. |

Trovo i Facebook pojawiają się na liście platform w panelu i w zapisanych danych, ale w obecnym kodzie nie ma działającego dopasowania URL dla Trovo ani dostawcy dla Facebooka, więc te URL-e są odrzucane przy próbie obserwowania.

## Jak działa sprawdzanie

Bot prowadzi jeden tracker na platformę i w pętli pyta każdą platformę o stan każdego obserwowanego kanału, robiąc trzysekundowe przerwy między rundami. Stream jest ogłaszany jako online za pierwszym razem, gdy zostanie zobaczony na żywo po tym, jak był offline.

Przejście w tryb offline jest obsługiwane ostrożniej, ponieważ Twitch czasem zgłasza krótki przebłysk offline podczas transmisji na żywo. Stream musi zostać zobaczony jako offline w dwóch kolejnych sprawdzeniach, zanim wyśle się powiadomienie offline. Jeśli w międzyczasie wróci online, nic nie zostaje opublikowane.

Co trzydzieści minut bot szuka streamów, których zapytania do platform kończą się błędem od ponad dwunastu godzin, na przykład usuniętych albo przemianowanych kanałów, i usuwa je z każdego serwera, który je obserwował.

Jeśli kanał powiadomień obserwowanego streama został usunięty, stream zostanie porzucony przy następnym uruchomieniu `streamlist`.

## Wiadomość, którą wysyła

Gdy stream zmienia stan, bot wybiera wiadomość w tej kolejności:

1. Własną **Wiadomość online** albo **Wiadomość offline** streama, zależnie od nowego stanu.
2. Ogólnoserwerowy szablon **Globalna wiadomość o streamie**.
3. Wbudowany embed.

Wiadomość dla pojedynczego streama, która nie jest poprawnym JSON-em embedu, zostaje wysłana jako zwykły tekst nad wbudowanym embedem. Globalny szablon, który nie jest JSON-em embedu, zostaje wysłany jako zwykły tekst sam. Wiadomości będące poprawnym JSON-em embedu, czyli to, co produkuje edytor embedów w panelu, są wysyłane dokładnie tak, jak je zaprojektowano, łącznie z przyciskami.

Wbudowany embed ma nazwę streamera jako tytuł z linkiem, tytuł streama jako linię autora, pole **Status** pokazujące Online albo Offline, pole **Viewers**, pole **Streamuje** z grą lub kategorią, awatar jako miniaturę i podgląd jako duży obrazek. Jest zielony, gdy stream jest na żywo, i czerwony, gdy jest offline.

### Placeholdery

W wiadomościach o streamach zastępowany jest tylko ten zestaw. Ogólne placeholdery serwera i użytkownika ze strony placeholderów nie są tutaj dostępne.

| Placeholder | Wartość |
| --- | --- |
| `%stream.name%` | Wyświetlana nazwa streamera albo `Unknown` |
| `%stream.username%` | Login lub handle streamera |
| `%stream.url%` | Bezpośredni link do streama, zawsze z `https://` |
| `%stream.title%` | Bieżący tytuł streama albo `No title` |
| `%stream.game%` | Gra lub kategoria albo `No category` |
| `%stream.viewers%` | Liczba widzów z separatorami tysięcy albo `-`, gdy stream jest offline |
| `%stream.platform%` | Nazwa platformy, na przykład `Twitch` albo `Youtube` |
| `%stream.avatar%` | URL awatara streamera |
| `%stream.preview%` | URL podglądu albo miniatury streama |
| `%stream.status%` | `Online` albo `Offline`, każde poprzedzone kolorowym kółkiem |
| `%stream.channelid%` | ID kanału specyficzne dla platformy, jeśli platforma je udostępnia |

> [!EXAMPLE]
> Prosty globalny szablon: `%stream.name% is live on %stream.platform% playing %stream.game%: %stream.title% %stream.url%`

## Ustawienia

Strona Powiadomień o streamach ma cztery zakładki: **Streamy**, **Obserwuj stream**, **Ustawienia** i **Statystyki**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Kanał powiadomień | brak | Kanał, na który idą alerty nowego streama, wybierany w **Obserwuj stream** |
| URL streama | brak | Link do obserwowania, w **Obserwuj stream** |
| Wiadomość online | brak | Wiadomość dla pojedynczego streama po wejściu na żywo, edytowana na karcie streama w **Streamy** |
| Wiadomość offline | brak | Wiadomość dla pojedynczego streama po zakończeniu, edytowana na tej samej karcie |
| Globalna wiadomość o streamie | brak | Szablon dla całego serwera, używany, gdy stream nie ma własnej wiadomości, w **Ustawienia** |
| Powiadomienia offline | wyłączone | Czy bot publikuje, gdy obserwowane streamy przechodzą w tryb offline, w **Ustawienia** |

**Streamy** wyświetla każdy obserwowany stream z jego platformą, kanałem i datą dodania, z przyciskiem usuwania na każdej karcie i przyciskiem **Wyczyść wszystko**. **Statystyki** pokazują łączną liczbę streamów, unikalnych streamerów, kanałów z powiadomieniami, używane platformy i podział według platformy.

Serwer może obserwować maksymalnie dziesięć streamów. Dodanie jedenastego kończy się niepowodzeniem.

## Krok po kroku

1. Otwórz **Alerty o streamach** w panelu i przejdź do zakładki **Obserwuj stream**.
2. Wybierz **Kanał powiadomień**, wklej **URL streama** i kliknij **Obserwuj stream**.
3. W **Ustawienia** zbuduj **Globalną wiadomość o streamie** w edytorze embedów, używając placeholderów powyżej, a potem kliknij **Zapisz wiadomość**. Pomiń ten krok, aby zostać przy wbudowanym embedzie.
4. Włącz **Powiadomienia offline**, jeśli chcesz też posty „stream zakończony”.
5. Wróć do **Streamy**, otwórz kartę streama i nadaj mu własną **Wiadomość online** albo **Wiadomość offline**, jeśli potrzebuje czegoś innego niż globalny szablon.
6. Przetestuj komendą `streamcheck <url>`, aby sprawdzić, czy bot może odczytać stream, a potem poczekaj na następny start na żywo.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, jeśli go nie zmieniałeś).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `streamadd <url>` | `sta`, `stadd` | Zarządzanie wiadomościami | Obserwuj stream i wysyłaj jego alerty na bieżący kanał |
| `streamremove <index>` | `strm` | Zarządzanie wiadomościami | Przestań obserwować stream na tej pozycji w `streamlist` |
| `streamsclear` | `stclear` | Administrator | Przestań obserwować wszystkie streamy na serwerze |
| `streamlist` | `stl`, `streamslist` | Nikt | Stronicowana lista obserwowanych streamów z numerami, platformami i kanałami |
| `streamoffline` | `sto`, `stoff` | Zarządzanie wiadomościami | Przełącz powiadomienia offline |
| `streammessage <index> <message>` | `stm`, `stmsg` | Zarządzanie wiadomościami | Ustaw wiadomość online streama; pusta wiadomość resetuje ją |
| `streamofflinemessage <index> <message>` | `stofmsg`, `stoffline` | Zarządzanie wiadomościami | Ustaw wiadomość offline streama; pusta wiadomość resetuje ją |
| `streamtemplate [template]` | `stt`, `sttemplate` | Zarządzanie wiadomościami | Pokaż globalny szablon i placeholdery, ustaw nowy albo `reset`, aby go wyczyścić |
| `streamcheck <url>` | `stc` | Nikt | Sprawdź, czy stream jest teraz na żywo, i jaka jest liczba widzów |

## Wskazówki i pułapki

- `streamadd` używa kanału, na którym je uruchomisz. Jeśli chcesz wybrać inny kanał, użyj panelu.
- Numery streamów pochodzą z `streamlist` i zaczynają się od 1. Przesuwają się, gdy stream zostanie usunięty, więc przed usunięciem po numerze sprawdź listę.
- Bot potrzebuje uprawnień Send Messages i Embed Links na kanale powiadomień. Alerty na kanał, którego nie widzi, są pomijane z wpisem w logu.
- Jeśli na twoim serwerze jest połączony Twitch Bot z ustawionym kanałem startu na żywo dla tego samego kanału Twitcha, ta integracja przejmuje sprawę, a Alerty o streamach milczą w jej przypadku, więc nie dostaniesz dwóch postów.
- Dane YouTube są pobierane ze strony, a nie z API. Tytuły, kategorie i liczba widzów mogą brakować albo być odczytane jako `Live Stream`.
- Streamy, których zapytania kończą się błędem przez dwanaście godzin, są usuwane automatycznie. Jeśli streamer zmieni nazwę kanału, obserwuj nowy URL.

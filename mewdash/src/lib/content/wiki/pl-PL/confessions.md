---
title: Wyznania
slug: confessions
summary: Członkowie wysyłają anonimowe wyznania, które bot publikuje jako ponumerowane embedy na kanale, z opcjonalnym logiem dostępnym tylko dla staffu, który pokazuje, kto wysłał każde z nich.
icon: fa-comment
category: Community
dashboard: /dashboard/confessions
module: Confessions
tags: [confessions, confess, anonymous, secrets, confession channel, confession log, blacklist, wyznania, wyznanie, anonimowe, sekrety, kanał wyznań, kanał logów, czarna lista]
related: [administration, moderation]
---

## Co robi

Członek uruchamia `/confess` na serwerze albo wysyła botowi DM `.confess <server id> "text"`, a bot publikuje jego wiadomość na kanale wyznań jako embed z nagłówkiem „Anonymous confession #N”. Nazwa nadawcy nigdy nie pojawia się na tym kanale. Nadawca dostaje prywatne potwierdzenie, a numer wyznania rośnie o jeden za każdym razem.

Staff może ustawić osobny kanał logów. Każde wyznanie jest tam kopiowane z tagiem i ID nadawcy, numerem wyznania oraz linkiem do opublikowanej wiadomości. Członkowie są informowani w stopce każdego wyznania, jak wyznać, a w potwierdzeniu, że mogą zgłosić serwer, który nadużywa tej funkcji.

Staff może też dodawać pojedynczych członków na czarną listę, aby ich wyznania były odrzucane, oraz usuwać wyznania z panelu, co usuwa też wiadomość na Discordzie.

## Po co to używać

- Kanały do wyrzucenia emocji albo „herbaty”, gdzie członkowie chcą mówić bez podpisanego imienia.
- Kanały komplementów i docenienia, które pozostają anonimowe.
- Dowolny anonimowy kanał, na którym staff nadal potrzebuje sposobu, by namierzyć nękanie.

## Post z wyznaniem

Każde wyznanie to embed na kanale wyznań:

| Część | Zawartość |
| --- | --- |
| Linia autora | `Anonymous confession #N` z ikoną serwera |
| Opis | Tekst wyznania |
| Obraz | Załącznik, jeśli został wysłany |
| Stopka | `Do /confess or dm me .confess <server id> yourconfession to send a confession!` |
| Znacznik czasu | Moment publikacji |

Numeracja zaczyna się od 1 i kontynuuje od ostatniego zapisanego wyznania. Usunięcie wyznania nie zmienia numerów pozostałych.

Załączniki są obsługiwane w obu przypadkach: dołącz plik do `/confess` w opcji `attachment` albo dołącz go do DM przy komendzie tekstowej. Używany jest tylko pierwszy załącznik.

## Kanał logów

Gdy ustawiony jest **Kanał logów**, każde wyznanie tworzy też czerwony embed na tym kanale, z polami **Użytkownik** (tag i ID), **Confession N** (tekst), **Message Link** i ostrzeżeniem o nadużyciach. To jedyne miejsce, w którym ujawniany jest nadawca, więc ogranicz dostęp do osób, którym ufasz.

> [!WARNING]
> Kanał logów istnieje po to, aby staff mógł radzić sobie z nękaniem. Ujawnianie, kto wysłał wyznanie, jest podstawą do tego, by właściciele bota umieścili serwer na czarnej liście. Członkowie mogą zgłaszać nadużycia komendą `/confessions report`.

## Czarna lista

`confessionblacklist` dodaje członka do czarnej listy serwera, a `confessionunblacklist` go z niej usuwa. Członkowie na czarnej liście dostają komunikat „you are blacklisted” zamiast publikacji. Sprawdzenie odbywa się po ID użytkownika.

Panel pokazuje **Czarna lista ról** i zapisuje ID ról na tej samej liście. Bot porównuje z listą tylko ID użytkownika nadawcy, więc role wybrane w panelu obecnie nikogo nie zatrzymują. Do blokowania konkretnych członków użyj komend.

## Ustawienia

Strona **Wyznania** ma trzy karty: **Konfiguracja**, **Wyznania** i **Statystyki**.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Kanał wyznań | brak | Gdzie publikowane są anonimowe wyznania; wyznania są wyłączone, dopóki nie zostanie ustawiony |
| Kanał logów (pokazuje ID użytkowników) | brak | Gdzie trafia identyfikująca kopia każdego wyznania |
| Czarna lista ról | brak | Zobacz sekcję o czarnej liście powyżej |

**Wyznania** wyświetla każde zapisane wyznanie, od najnowszego, z numerem i datą. Treść jest ukryta, dopóki jej nie rozwiniesz, a **Usuń wyznanie** usuwa je z bazy danych i kasuje wiadomość na Discordzie, jeśli nadal istnieje.

**Statystyki** pokazują **Wszystkie wyznania**, **W tym miesiącu**, **Dziś** i **Najnowszy numer**.

## Konfiguracja krok po kroku

1. Utwórz kanał, na którym bot ma uprawnienia Wysyłanie wiadomości i Osadzanie linków, a członkowie mogą czytać, ale najlepiej nie pisać.
2. Otwórz **Wyznania** w panelu i wybierz ten kanał jako **Kanał wyznań**.
3. Opcjonalnie wybierz prywatny kanał staffu jako **Kanał logów**.
4. Kliknij **Zapisz konfigurację**.
5. Uruchom `/confess` z konta członka i sprawdź, czy embed pojawił się z `#1`.
6. Jeśli ktoś nadużywa funkcji, znajdź go na kanale logów i uruchom `confessionblacklist @user`.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniłeś). Wersje slash znajdują się pod `/confessions`, z wyjątkiem `/confess`, która jest na najwyższym poziomie.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `confess <server id> <"text">` | | Nikt | Tylko DM. Publikuje wyznanie na danym serwerze; tekst z wieloma słowami ujmij w cudzysłów |
| `confessionchannel [#channel]` | `confesschannel` | Zarządzanie kanałami | Ustawia kanał wyznań albo wyłącza wyznania, gdy nie podano kanału |
| `confessionlogchannel [#channel]` | `confesslogchannel`, `confessionlogchnl` | Administrator | Ustawia kanał logów |
| `confessionblacklist <@user>` | `confessblacklist`, `confessbl` | Zarządzanie kanałami | Blokuje członkowi możliwość wyznawania |
| `confessionunblacklist <@user>` | `confessunblacklist`, `confessunbl` | Zarządzanie kanałami | Pozwala członkowi z czarnej listy znów wyznawać |

`/confessions report <server id> <description>` wysyła do właścicieli bota zgłoszenie o serwerze, który nadużywa wyznań. Nie ma wersji tekstowej.

## Wskazówki i pułapki

- Bot potrzebuje uprawnień Wysyłanie wiadomości i Osadzanie linków zarówno na kanale wyznań, jak i na kanale logów. Komendy kanałów ostrzegają, jeśli ich brakuje, ale i tak zapisują ustawienie.
- Tekstowa komenda `confess` działa tylko w DM i przyjmuje wyznanie jako jeden argument, więc `confess 123456789 "I like pineapple on pizza"` zadziała, a wersja bez cudzysłowu opublikuje tylko pierwsze słowo. `/confess` na serwerze jest prostsze dla członków.
- `confess` przez DM działa tylko dla serwerów, które dzielisz z botem; inne ID serwerów są odrzucane.
- Tekstowa komenda `confessionlogchannel` bez kanału czyści kanał wyznań, a nie kanał logów. Kanał logów wyczyść z panelu.
- Wyznania są zapisywane z ID nadawcy nawet bez kanału logów, a panel może sprawdzić nadawcę pojedynczego wyznania. Traktuj dostęp do panelu jak dostęp dla staffu.
- Usunięcie z panelu usuwa zapisany rekord, więc kopia na kanale logów to Twój jedyny pozostały ślad.

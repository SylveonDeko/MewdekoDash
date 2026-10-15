---
title: Role ze statystyk
slug: statroles
summary: Role, które członkowie zdobywają za aktywność w danym okresie i tracą, gdy przestają ją mieć, oceniane według progów, najwyższych pozycji, najwyższych procentów lub dziennych serii wiadomości, czasu głosowego, gier, zaproszeń, czasu na serwerze albo wieku konta.
icon: fa-trophy
category: Community
dashboard: /dashboard/statroles
module: StatRoles
tags: [stat roles, statroles, activity roles, active member role, inactive role, top chatter role, voice role, invite rewards, message rewards, streak, statbot, role ze statystyk, role aktywności, rola aktywnego członka, rola nieaktywnego, rola najbardziej gadatliwych, rola głosowa, nagrody za zaproszenia, nagrody za wiadomości, seria]
related: [serverstats, xp, invites, liveboards]
---

## Co to robi

Role za poziomy XP działają jednokierunkowo: raz zdobyte, zachowane na zawsze. Rola ze statystyk jest oceniana ponownie według harmonogramu. Członkowie, którzy spełniają warunek, dostają rolę, a ci, którzy przestają go spełniać, ją tracą, więc rola „aktywny członek” oznacza aktywność *teraz*. Jeśli chcesz dawne zachowanie, ustaw rolę jako stałą, albo odwróć ją, by oznaczała nieaktywnych członków.

## Warunki

Każda rola ze statystyk mierzy jedną rzecz w danym okresie i stosuje jeden limit.

| Miara | Co jest liczone |
| --- | --- |
| Wiadomości | Wiadomości w okresie, opcjonalnie tylko na wybranych kanałach |
| Minuty na głosowym | Czas na kanale głosowym w okresie, z uwzględnieniem stanów głosowych wykluczonych w Statystykach aktywności |
| Minuty w grze | Czas w jednej nazwanej grze lub aplikacji albo w dowolnej w okresie. Wymaga włączonego śledzenia gier |
| Zaproszenia | Łączna liczba netto zaproszeń członka |
| Dni na serwerze | Od dołączenia członka |
| Wiek konta | Od utworzenia konta |

| Limit | Kto się kwalifikuje |
| --- | --- |
| Próg | Między minimum a opcjonalnym maksimum |
| Najwyższa pozycja | W przedziale dwóch pozycji w rankingu, np. top 10 |
| Najwyższy procent | W najlepszych X procentach członków z rankingiem, np. top 5% |
| Dzienna seria | Osiągnął dzienne minimum w co najmniej N dniach w okresie, np. 5 wiadomości w 7 z ostatnich 7 dni |

Okres to 1–90 dni albo cały czas dla wszystkiego oprócz serii. Remisy dzielą pozycję.

## Filtry i opcje

| Opcja | Co robi |
| --- | --- |
| Licz tylko na kanałach | Ogranicz wiadomości lub głos do wybranych kanałów |
| Wymagane role | Członek musi mieć co najmniej jedną, aby być brany pod uwagę |
| Wykluczone role | Członek posiadający którąkolwiek nigdy nie jest brany pod uwagę |
| Ignorowani członkowie | Rola nigdy nie jest nadawana ani odbierana tym członkom |
| Grupa | Role ze statystyk w tej samej grupie zachowują tylko najwyższy poziom, jaki członek kwalifikuje, więc Brąz, Srebro i Złoto się nie sumują |
| Stała | Nigdy nie jest odbierana po zdobyciu |
| Odwróć | Członkowie, którzy *nie* spełniają warunku, dostają rolę |
| Uwzględnij boty | Bierz pod uwagę konta botów |
| Oceniaj co | Jak często działa reguła; co najmniej co 10 minut, domyślnie co 3 godziny |
| Ogłaszaj na / Wyślij wiadomość prywatną | Publikuj wiadomość, gdy rola zostanie nadana lub odebrana, używając `%user%`, `%role%`, `%action%` (zdobyta lub utracona), `%value%` i `%stat%` |

## Panel

Zakładka **Role ze statystyk** wyświetla każdą regułę z jej warunkiem, harmonogramem i ostatnim uruchomieniem, i pozwala włączyć, wyłączyć, edytować, usunąć, **podejrzeć** lub **uruchomić** każdą z nich. Podgląd pokazuje, kto zyskałby i straciłby rolę, bez wprowadzania zmian. Uruchomienie stosuje regułę od razu; ręczne uruchomienia są ograniczone do jednego co dziesięć minut na serwer.

Zakładka **Utwórz / edytuj** to formularz dla wszystkiego powyżej.

## Komendy

Uruchamiaj je z prefiksem serwera (`.`, chyba że go zmieniłeś). Każda komenda działa także pod `/statrole`.

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `statroleadd <@role> <stat> <minimum> [days] [name]` | `sradd` | Zarządzanie rolami | Reguła progowa |
| `statroletop <@role> <stat> <topEnd> [days] [name]` | `srtop` | Zarządzanie rolami | Reguła najwyższej pozycji dla miejsc od 1 do topEnd |
| `statrolepercent <@role> <stat> <percent> [days] [name]` | `srpercent` | Zarządzanie rolami | Reguła najwyższego procentu |
| `statrolestreak <@role> <stat> <perDay> <requiredDays> [days] [name]` | `srstreak` | Zarządzanie rolami | Reguła dziennej serii |
| `statrolelist` | `statroles` | Nikt | Wszystkie reguły |
| `statroleinfo <id>` | `srinfo` | Nikt | Jedna reguła w całości |
| `statroleset <id> <setting> <value>` | `srset` | Zarządzanie rolami | Zmienia ustawienie: name, min, max, lookback, topstart, topend, days, permanent, invert, bots, group, interval, notifychannel, notifydm, message lub activity |
| `statrolefilter <id> <#channel, @role [true], or @user>` | `srfilter` | Zarządzanie rolami | Przełącza filtr kanału, wymaganą rolę (lub wykluczoną z `true`) albo ignorowanego członka |
| `statroletoggle <id>` | `srtoggle` | Zarządzanie rolami | Włącz lub wyłącz |
| `statrolepreview <id>` | `srpreview` | Zarządzanie rolami | Kto zyskałby i kto straciłby rolę |
| `statrolerun <id>` | `srrun` | Zarządzanie rolami | Zastosuj teraz |
| `statroleremove <id>` | `srremove` | Zarządzanie rolami | Usuń regułę; członkowie zachowują to, co mają |

## Wskazówki i pułapki

- Najwyższa rola bota musi być powyżej zarządzanej roli, a bot potrzebuje uprawnienia Zarządzanie rolami.
- Każda rola Discorda może być zarządzana przez jedną rolę ze statystyk. Usuń starą regułę, zanim wskażesz nową na tę samą rolę.
- Reguła z minimum 0 i bez maksimum pasowałaby do wszystkich; daj jej maksimum albo świadomie użyj odwrócenia.
- Członkowie, którzy wyłączyli statystyki aktywności, nie mają wiadomości, czasu głosowego ani czasu w grze, więc nigdy nie kwalifikują się do tych miar.
- Przed włączeniem reguły na dużym serwerze użyj podglądu. Zmiany ról są rozłożone w czasie, by respektować limity, więc reguła dotycząca tysięcy członków zastosuje się przez kilka minut.

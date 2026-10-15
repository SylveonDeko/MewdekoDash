---
title: Własne kanały głosowe
slug: customvoice
summary: Hub „dołącz, aby utworzyć”, który daje każdemu członkowi własny tymczasowy kanał głosowy ze zmianą nazwy, limitem użytkowników, bitrate, blokadą, zezwalaniem i zabranianiem dostępu oraz automatycznym sprzątaniem, gdy opustoszeje.
icon: fa-microphone
category: Entertainment
dashboard: /dashboard/customvoice
module: CustomVoice
tags: [custom voice, temporary voice, join to create, voice hub, private voice, voice channels, lock, bitrate, user limit, własne kanały głosowe, tymczasowy kanał głosowy, dołącz aby utworzyć, hub głosowy, prywatny kanał głosowy, kanały głosowe, blokada, limit użytkowników]
related: [administration, statchannels]
---

## Co robi

Moderatorzy ustawiają jeden kanał głosowy jako hub. Gdy członek do niego dołączy, bot tworzy dla niego nowy kanał głosowy, nazwany według szablonu, umieszcza go w skonfigurowanej kategorii i przenosi do niego członka. Ten członek jest właścicielem kanału: może zmienić jego nazwę, ustawić limit użytkowników i bitrate, zablokować go tak, aby mogli dołączyć tylko dozwoleni członkowie, zezwolić konkretnym osobom lub im zabronić, utrzymać go przy życiu albo przekazać komuś innemu.

Gdy ostatni człowiek wyjdzie, kanał jest usuwany po krótkim limicie czasu, chyba że właściciel włączył utrzymywanie przy życiu. Jeśli właściciel wyjdzie, a ktoś inny nadal jest w środku, ta osoba może go przejąć.

Członkowie mogą zapisywać preferencje dla swoich kanałów, więc każdy tworzony przez nich kanał zaczyna się od ich preferowanej nazwy, limitu, bitrate, stanu blokady i ustawienia utrzymywania przy życiu. Moderatorzy decydują, z których z tych dostosowań członkowie mogą korzystać, ustawiają limity górne dla liczby użytkowników i bitrate i mogą wskazać rolę administracyjną, która może zarządzać każdym własnym kanałem.

## Do czego Ci się przyda

- Koniec z utrzymywaniem ściany kanałów „Gaming 1” do „Gaming 8”; członkowie tworzą kanał, gdy go potrzebują, a potem znika.
- Członkowie, którzy chcą prywatnej rozmowy, blokują swój kanał i zezwalają tylko znajomym.
- Streamerzy i organizatorzy eventów utrzymują kanał przy życiu, aby przetrwał, gdy na chwilę odejdą.
- Moderatorzy z rolą administracyjną mogą zmieniać nazwę, blokować lub przekazywać każdy kanał bez potrzeby Zarządzania kanałami na całym serwerze.

## Hub

`setupvoicehub` tworzy kanał głosowy o nazwie „Create Voice Channel” w nowej kategorii „Custom Voice Channels”, pozwala wszystkim się łączyć, ale nie mówić, i rejestruje go jako hub. `setvoicehub #channel [category]` używa kanału, który już masz. Sekcja **Konfiguracja podstawowa** w panelu robi to samo za pomocą selektora kanału i kategorii.

Jeśli **Zezwalaj na wiele kanałów na użytkownika** jest wyłączone (domyślnie), dołączenie do hubu, gdy już jesteś właścicielem kanału, usuwa stary kanał przed utworzeniem nowego.

## Nazywanie kanałów

**Domyślny format nazwy** to szablon. Bot zastępuje `{0}` nazwą użytkownika członka, `{1}` jego discriminatorem, a `{2}` nazwą serwera. Domyślnie jest to `{0}'s Channel`. Nazwa jest przycinana, aby zmieścić się w limitach Discorda.

> [!NOTE]
> Tekst zastępczy w panelu pokazuje `{username}'s Channel`, ale bot podstawia tylko `{0}`, `{1}` i `{2}`. Używaj formy numerowanej.

## Kontrolki właściciela

`voicecontrols` publikuje panel dla kanału, na którym jesteś, pokazujący bieżącą nazwę, limit, bitrate, stan blokady i utrzymywania przy życiu oraz to, kto jest w środku, z przyciskami **Rename**, **Limit**, **Bitrate**, **Lock**/**Unlock**, utrzymywania przy życiu, **Transfer** i selektorem członków do zarządzania osobami w środku. Przyciski dla dostosowań wyłączonych na serwerze są nieaktywne.

Te same akcje istnieją jako komendy, a każda sprawdza, czy jesteś na własnym kanale, czy jesteś jego właścicielem lub masz rolę administracyjną oraz czy serwer pozwala na to dostosowanie:

| Akcja | Komenda | Co robi |
| --- | --- | --- |
| Zmiana nazwy | `voicerename <name>` | Zmienia nazwę kanału, jeśli włączone jest **Zezwalaj na zmianę nazwy** |
| Limit użytkowników | `voicelimit <n>` | Ustawia limit, ograniczony maksymalnym limitem użytkowników serwera |
| Bitrate | `voicebitrate <kbps>` | Ustawia bitrate, ograniczony maksymalnym bitrate serwera |
| Blokada | `voicelock [true/false]`, `voiceunlock` | Zablokowany odmawia połączenia wszystkim poza dozwolonymi członkami, właścicielem i rolą administracyjną |
| Zezwól | `voiceallow @user` | Przyznaje członkowi możliwość połączenia nawet przy blokadzie |
| Zabroń | `voicedeny @user` | Odbiera członkowi możliwość połączenia i rozłącza go, jeśli jest w środku |
| Utrzymywanie przy życiu | `voicekeepalive [true/false]` | Zatrzymuje sprzątanie pustego kanału dla tego kanału |
| Przekazanie | `voicetransfer @user` | Czyni innego członka właścicielem i przenosi na niego nadpisania zarządzania |
| Przejęcie | `voiceclaim` | Każdy członek w środku może przejąć własność, gdy właściciela nie ma na kanale |

Gdy włączone jest **Automatycznie zarządzaj uprawnieniami kanału**, właściciel dostaje na swoim kanale Łączenie, Mówienie, Zarządzanie kanałem, Przenoszenie członków, Wyciszanie członków i Wyłączanie dźwięku członków, dozwoleni i zabronieni członkowie dostają odpowiednie nadpisania, a rola administracyjna dostaje dostęp do zarządzania.

## Sprzątanie

Gdy włączone jest **Usuwaj puste kanały** (domyślnie), kanał bez żadnych ludzi jest planowany do usunięcia po limicie czasu pustego kanału. Ponowne dołączenie przed upływem czasu go anuluje. Kanały oznaczone jako utrzymywane przy życiu nigdy nie są usuwane automatycznie. Cykliczne sprawdzanie co pięć minut usuwa też kanały puste dłużej niż limit czasu, a przycisk **Wyczyść nieaktywne kanały** w panelu usuwa kanały nieaktywne od wybranej przez Ciebie liczby godzin.

## Preferencje członków

`voicepreferences` pokazuje Twoje zapisane preferencje formatu nazwy, limitu użytkowników, bitrate, blokady i utrzymywania przy życiu. Każda komenda `voiceprefs...` ustawia jedną z nich, uruchomiona bez wartości ją czyści, a `voiceprefsreset` czyści wszystkie. Preferencje są stosowane tylko wtedy, gdy włączone jest **Zapamiętuj preferencje użytkownika**, a limit i bitrate nadal są ograniczone maksimami serwera. Moderatorzy mogą przeglądać i edytować preferencje dowolnego członka na karcie **Preferencje użytkownika** według ID użytkownika.

## Ustawienia

Panel ma trzy karty: **Konfiguracja**, **Aktywne kanały** i **Preferencje użytkownika**. **Konfiguracja** dzieli się na **Konfiguracja podstawowa**, **Domyślne ustawienia kanałów** i **Zarządzanie kanałami**. `voiceconfig` bez argumentów pokazuje każdą wartość; `voiceconfig <setting> <value>` zmienia jedną.

| Ustawienie | Domyślnie | Co kontroluje |
| --- | --- | --- |
| Kanał hub | brak | Kanał „dołącz, aby utworzyć” |
| Kategoria | brak | Gdzie tworzone są nowe kanały |
| Domyślny format nazwy | `{0}'s Channel` | Szablon nazw nowych kanałów (`nameformat`) |
| Domyślny limit użytkowników | 0 (bez limitu) | Początkowy limit użytkowników (`userlimit`) |
| Domyślny bitrate | 64 kb/s | Początkowy bitrate (`bitrate`) |
| Usuwaj puste kanały | Włączone | Usuwa kanały, w których nikogo nie ma (`deleteempty`) |
| Limit czasu pustego kanału | 1 | Opóźnienie przed usunięciem pustego kanału (`emptytimeout`); panel oznacza to jako sekundy i akceptuje od 5 do 300 |
| Zezwalaj na wiele kanałów na użytkownika | Wyłączone | Pozwala jednemu członkowi być właścicielem kilku kanałów (`multiplechannels`) |
| Zapamiętuj preferencje użytkownika | Włączone | Stosuje zapisane preferencje członków (`persistpreferences`) |
| Automatycznie zarządzaj uprawnieniami kanału | Włączone | Ustawia nadpisania dla właściciela, zezwoleń, zakazów i roli administracyjnej (`autopermission`) |
| Zezwalaj na zmianę nazwy | Włączone | `namechange` |
| Zezwalaj na zmianę limitu użytkowników | Włączone | `limitchange` |
| Zezwalaj na zmianę bitrate | Włączone | `bitratechange` |
| Zezwalaj na blokowanie kanału | Włączone | `locking` |
| Zezwalaj na zarządzanie użytkownikami | Włączone | Komendy zezwalania i zabraniania (`usermanagement`) |
| Maksymalny limit użytkowników | 99 | Górna granica limitów ustawianych przez członków (`maxuserlimit`) |
| Maksymalny bitrate | 96 kb/s | Górna granica bitrate ustawianych przez członków, ograniczona też poziomem boosta serwera (`maxbitrate`) |
| Rola administracyjna | brak | Rola, która może zarządzać każdym własnym kanałem (`adminrole`) |

**Maksymalny limit użytkowników**, **Maksymalny bitrate** i **Rola administracyjna** nie mają kontrolki w panelu; ustaw je przez `voiceconfig`.

Karta **Aktywne kanały** wypisuje każdy działający własny kanał z jego właścicielem, stanem blokady i utrzymywania przy życiu, pozwala zablokować, odblokować lub usunąć kanał i pokazuje sumy utworzonych kanałów, aktywnych w ostatniej godzinie, zablokowanych i utrzymywanych przy życiu. Zawiera też przycisk **Wyczyść nieaktywne kanały** oraz przycisk **Wyłącz własne kanały głosowe**, który wyłącza moduł dla serwera.

## Konfiguracja krok po kroku

1. Nadaj botowi Zarządzanie kanałami, Przenoszenie członków i Zarządzanie rolami (dla nadpisań uprawnień) w kategorii, której użyjesz.
2. Uruchom `setupvoicehub` albo otwórz **Własne kanały głosowe** w panelu i wybierz istniejący kanał hub i kategorię w sekcji **Konfiguracja podstawowa**.
3. Ustaw **Domyślny format nazwy**, **Domyślny limit użytkowników** i **Domyślny bitrate** w sekcji **Domyślne ustawienia kanałów**.
4. W sekcji **Zarządzanie kanałami** wyłącz wszystkie dostosowania, których nie chcesz dawać członkom.
5. Ustaw **Rolę administracyjną** przez `voiceconfig adminrole @Moderators`, aby moderatorzy mogli zarządzać kanałami, których nie są właścicielami.
6. Sam dołącz do hubu, uruchom `voicecontrols` i spróbuj zmienić nazwę oraz zablokować kanał.

## Komendy

Uruchamiaj je z prefiksem swojego serwera (`.`, chyba że go zmieniono).

| Komenda | Aliasy | Wymaga | Cel |
| --- | --- | --- | --- |
| `setupvoicehub` | `svh`, `createvoicehub`, `voicesetup` | Zarządzanie kanałami | Tworzy kanał hub i kategorię |
| `setvoicehub <#channel> [category]` | `sethub`, `voicehub` | Zarządzanie kanałami | Używa istniejącego kanału jako hubu |
| `voiceconfig [setting] [value]` | `vcconfig`, `voicesettings`, `vcsettings`, `customvoiceconfig` | Zarządzanie kanałami | Pokazuje lub zmienia ustawienia serwera |
| `voicecontrols` | `vcontrols` | Właściciel lub rola administracyjna | Interaktywny panel sterowania Twoim kanałem |
| `voicechannels` | `vchannels`, `listvoice`, `customvoices`, `voicelist` | Nobody | Wypisuje aktywne własne kanały |
| `voicerename <name>` | `vrename`, `renamevoice`, `vcname`, `vcrename` | Właściciel lub rola administracyjna | Zmienia nazwę Twojego kanału |
| `voicelimit <number>` | `vclimit`, `limitvoice`, `vlimit`, `setlimit` | Właściciel lub rola administracyjna | Ustawia limit użytkowników |
| `voicebitrate <kbps>` | `vcbitrate`, `vbitrate`, `setbitrate` | Właściciel lub rola administracyjna | Ustawia bitrate |
| `voicelock [true/false]` | `vclock`, `lockvoice`, `vlock`, `lockvc` | Właściciel lub rola administracyjna | Blokuje lub odblokowuje |
| `voiceunlock` | `vcunlock`, `unlockvoice`, `vunlock`, `unlockvc` | Właściciel lub rola administracyjna | Odblokowuje |
| `voiceallow @user` | `vcallow`, `allowuser`, `vallow`, `adduser` | Właściciel lub rola administracyjna | Pozwala członkowi dołączyć do zablokowanego kanału |
| `voicedeny @user` | `vcdeny`, `denyuser`, `vdeny`, `removeuser` | Właściciel lub rola administracyjna | Blokuje członka i go rozłącza |
| `voiceclaim` | `vcclaim`, `claimvoice`, `vclaim`, `takeover` | Nobody | Przejmuje kanał, którego właściciel wyszedł |
| `voicetransfer @user` | `vctransfer`, `transfervoice`, `vtransfer`, `givevc` | Właściciel lub rola administracyjna | Przekazuje kanał komuś innemu |
| `voicekeepalive [true/false]` | `vckeepalive`, `keepvoice`, `vkeep`, `persist` | Właściciel lub rola administracyjna | Wyłącza kanał ze sprzątania |
| `voicepreferences` | `vcprefs`, `voiceprefs`, `vprefs`, `myvoice` | Nobody | Pokazuje Twoje zapisane preferencje |
| `voiceprefsname [format]` | `vcprefsname`, `vpname`, `prefname`, `namepref` | Nobody | Preferowany format nazwy, puste czyści |
| `voiceprefslimit [number]` | `vcprefslimit`, `vplimit`, `preflimit`, `limitpref` | Nobody | Preferowany limit użytkowników |
| `voiceprefsbitrate [kbps]` | `vcprefsbitrate`, `vpbitrate`, `prefbitrate`, `bitratepref` | Nobody | Preferowany bitrate |
| `voiceprefslock [true/false]` | `vprefslock` | Nobody | Zaczyna kanały jako zablokowane |
| `voiceprefskeepalive [true/false]` | `vcprefskeepalive`, `vpkeepalive`, `prefkeepalive`, `keeppref` | Nobody | Zaczyna kanały z utrzymywaniem przy życiu |
| `voiceprefsreset` | `vcprefsreset`, `vprefsreset`, `resetprefs`, `clearprefs` | Nobody | Czyści wszystkie preferencje |

## Wskazówki i pułapki

- Bot potrzebuje Zarządzania kanałami w kategorii, Przenoszenia członków, aby umieścić twórcę w nowym kanale, oraz Zarządzania rolami, aby zapisywać nadpisania uprawnień.
- Maksymalny bitrate jest ograniczany do tego, na co pozwala poziom boosta serwera, więc ustawienie 384 na serwerze bez boostów zostanie automatycznie zmniejszone.
- Blokada odmawia połączenia dla roli everyone. Członkowie z Administratorem lub rolą, która ma już wyraźne zezwolenie na połączenie, nadal mogą dołączyć.
- Licznik pustego kanału uruchamiany, gdy ostatni członek wyjdzie, traktuje wartość limitu czasu jako sekundy, podczas gdy wyświetlanie konfiguracji i pięciominutowe sprawdzanie traktują ją jako minuty. Przy domyślnej wartości 1 kanał znika niemal natychmiast po opustoszeniu.
- Kanały utrzymywane przy życiu nigdy nie są sprzątane automatycznie. Użyj karty **Aktywne kanały** lub `voicechannels`, aby znaleźć zapomniane.
- Przejęcie działa tylko wtedy, gdy pierwotny właściciel nie jest połączony z kanałem.

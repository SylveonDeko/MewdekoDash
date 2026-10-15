---
title: Eigene Sprachkanäle
slug: customvoice
summary: Ein Beitreten-zum-Erstellen-Hub, der jedem Mitglied einen eigenen temporären Sprachkanal gibt, mit Steuerung für Umbenennen, Nutzerlimit, Bitrate, Sperren, Erlauben und Verbieten sowie automatischem Aufräumen, wenn er leer wird.
icon: fa-microphone
category: Entertainment
dashboard: /dashboard/customvoice
module: CustomVoice
tags: [custom voice, temporary voice, join to create, voice hub, private voice, voice channels, lock, bitrate, user limit, eigene Sprachkanäle, temporäre Sprachkanäle, Beitreten zum Erstellen, Sprach-Hub, privater Sprachkanal, Sprachkanäle, sperren, Nutzerlimit]
related: [administration, statchannels]
---

## Was es macht

Das Team legt einen Sprachkanal als Hub fest. Wenn ein Mitglied ihm beitritt, erstellt der Bot einen neuen Sprachkanal für es, benannt nach einer Vorlage, legt ihn in die konfigurierte Kategorie und verschiebt das Mitglied hinein. Dieses Mitglied besitzt den Kanal: Es kann ihn umbenennen, ein Nutzerlimit und eine Bitrate festlegen, ihn sperren, sodass nur erlaubte Mitglieder beitreten können, bestimmte Personen erlauben oder verbieten, ihn am Leben halten oder an jemand anderen übergeben.

Verlässt der letzte Mensch den Kanal, wird dieser nach einem kurzen Timeout gelöscht, es sei denn, der Owner hat „Am Leben halten" eingeschaltet. Verlässt der Owner den Kanal und jemand anderes ist noch darin, kann diese Person ihn übernehmen.

Mitglieder können Voreinstellungen für ihre Kanäle speichern, sodass jeder von ihnen erstellte Kanal mit ihrem bevorzugten Namen, Limit, Bitrate, Sperrzustand und der Einstellung „Am Leben halten" startet. Das Team entscheidet, welche dieser Anpassungen Mitglieder nutzen dürfen, legt Obergrenzen für Limit und Bitrate fest und kann eine Admin-Rolle benennen, die jeden eigenen Kanal verwalten darf.

## Wofür du es nutzen kannst

- Keine Wand aus Kanälen von „Gaming 1" bis „Gaming 8" mehr pflegen; Mitglieder erstellen einen, wenn sie ihn brauchen, und er verschwindet danach wieder.
- Mitglieder, die ein privates Gespräch wollen, sperren ihren Kanal und erlauben nur ihre Freunde.
- Streamer und Event-Hosts halten einen Kanal am Leben, damit er besteht, während sie kurz weg sind.
- Moderatoren mit der Admin-Rolle können jeden Kanal umbenennen, sperren oder übergeben, ohne auf dem ganzen Server „Kanäle verwalten" zu brauchen.

## Der Hub

`setupvoicehub` erstellt einen Sprachkanal namens „Create Voice Channel" in einer neuen Kategorie „Custom Voice Channels", erlaubt allen das Verbinden, aber nicht das Sprechen, und registriert ihn als Hub. `setvoicehub #channel [category]` verwendet einen Kanal, den du bereits hast. Der Dashboard-Bereich **Grundkonfiguration** macht dasselbe mit einer Auswahl für Kanal und Kategorie.

Ist **Mehrere Kanäle pro Nutzer erlauben** aus (der Standard), löscht der Beitritt zum Hub, während du bereits einen Kanal besitzt, den alten, bevor der neue erstellt wird.

## Kanalbenennung

Das **Standard-Namensformat** ist eine Vorlage. Der Bot ersetzt `{0}` durch den Benutzernamen des Mitglieds, `{1}` durch dessen Discriminator und `{2}` durch den Servernamen. Der Standard ist `{0}'s Channel`. Der Name wird gekürzt, damit er in die Limits von Discord passt.

> [!NOTE]
> Der Platzhaltertext im Dashboard zeigt `{username}'s Channel`, aber der Bot ersetzt nur `{0}`, `{1}` und `{2}`. Verwende die nummerierte Form.

## Steuerung durch den Owner

`voicecontrols` postet ein Panel für den Kanal, in dem du dich befindest. Es zeigt den aktuellen Namen, das Limit, die Bitrate, den Sperrzustand und den Zustand von „Am Leben halten" sowie wer darin ist, mit Buttons für **Umbenennen**, **Limit**, **Bitrate**, **Sperren**/**Entsperren**, „Am Leben halten", **Übertragen** und einer Mitgliederauswahl zur Verwaltung der Personen darin. Buttons für Anpassungen, die der Server ausgeschaltet hat, sind deaktiviert.

Dieselben Aktionen gibt es als Befehle, und jeder prüft, dass du dich in einem eigenen Kanal befindest, dass du ihn besitzt oder die Admin-Rolle hast und dass der Server diese Anpassung erlaubt:

| Aktion | Befehl | Was er macht |
| --- | --- | --- |
| Umbenennen | `voicerename <name>` | Benennt den Kanal um, wenn **Anpassen des Namens erlauben** an ist |
| Nutzerlimit | `voicelimit <n>` | Legt das Limit fest, begrenzt durch das maximale Nutzerlimit des Servers |
| Bitrate | `voicebitrate <kbps>` | Legt die Bitrate fest, begrenzt durch die maximale Bitrate des Servers |
| Sperren | `voicelock [true/false]`, `voiceunlock` | Gesperrt verbietet das Verbinden für alle außer erlaubten Mitgliedern, dem Owner und der Admin-Rolle |
| Erlauben | `voiceallow @user` | Gewährt einem Mitglied das Verbinden, auch wenn gesperrt |
| Verbieten | `voicedeny @user` | Entzieht einem Mitglied das Verbinden und trennt es, wenn es sich im Kanal befindet |
| Am Leben halten | `voicekeepalive [true/false]` | Stoppt das Aufräumen leerer Kanäle für diesen Kanal |
| Übertragen | `voicetransfer @user` | Macht ein anderes Mitglied zum Owner und überträgt die Verwaltungs-Überschreibungen auf es |
| Übernehmen | `voiceclaim` | Jedes Mitglied im Kanal kann die Besitzerschaft übernehmen, wenn der Owner nicht im Kanal ist |

Ist **Kanalberechtigungen automatisch verwalten** an, bekommt der Owner in seinem Kanal Verbinden, Sprechen, „Kanal verwalten", „Mitglieder verschieben", „Mitglieder stummschalten" und „Mitgliedern den Ton deaktivieren", erlaubte und verbotene Mitglieder bekommen passende Überschreibungen, und die Admin-Rolle bekommt Verwaltungszugriff.

## Aufräumen

Ist **Kanäle löschen, wenn leer** an (der Standard), wird ein Kanal ohne Menschen darin nach dem Timeout für leere Kanäle zum Löschen vorgemerkt. Ein erneuter Beitritt vor Ablauf des Timers bricht das ab. Als „Am Leben halten" markierte Kanäle werden nie automatisch entfernt. Ein Hintergrunddurchlauf alle fünf Minuten entfernt außerdem Kanäle, die länger als das Timeout leer waren, und der Button **Inaktive Kanäle bereinigen** im Dashboard entfernt Kanäle, die seit einer von dir gewählten Anzahl von Stunden inaktiv sind.

## Mitglieder-Voreinstellungen

`voicepreferences` zeigt deine gespeicherten Voreinstellungen für Namensformat, Nutzerlimit, Bitrate, Sperrzustand und „Am Leben halten". Jeder `voiceprefs...`-Befehl setzt eine davon, ohne Wert ausgeführt löscht er sie, und `voiceprefsreset` löscht alle. Voreinstellungen werden nur angewendet, wenn **Nutzereinstellungen merken** an ist, und Limit und Bitrate sind weiterhin durch die Server-Maximalwerte begrenzt. Das Team kann im Tab **Nutzereinstellungen** die Voreinstellungen jedes Mitglieds per Nutzer-ID ansehen und bearbeiten.

## Einstellungen

Das Dashboard hat drei Tabs: **Konfiguration**, **Aktive Kanäle** und **Nutzereinstellungen**. **Konfiguration** ist in **Grundkonfiguration**, **Kanal-Standards** und **Kanalverwaltung** unterteilt. `voiceconfig` ohne Argumente zeigt jeden Wert; `voiceconfig <setting> <value>` ändert einen.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Hub-Kanal | keiner | Der Beitreten-zum-Erstellen-Kanal |
| Kategorie | keine | Wo neue Kanäle erstellt werden |
| Standard-Namensformat | `{0}'s Channel` | Vorlage für neue Kanalnamen (`nameformat`) |
| Standard-Nutzerlimit | 0 (unbegrenzt) | Start-Nutzerlimit (`userlimit`) |
| Standard-Bitrate | 64 kbps | Start-Bitrate (`bitrate`) |
| Kanäle löschen, wenn leer | An | Kanäle entfernen, in denen niemand ist (`deleteempty`) |
| Leer-Timeout | 1 | Verzögerung, bevor ein leerer Kanal entfernt wird (`emptytimeout`); das Dashboard beschriftet es mit Sekunden und akzeptiert 5 bis 300 |
| Mehrere Kanäle pro Nutzer erlauben | Aus | Einem Mitglied mehrere Kanäle erlauben (`multiplechannels`) |
| Nutzereinstellungen merken | An | Gespeicherte Voreinstellungen der Mitglieder anwenden (`persistpreferences`) |
| Kanalberechtigungen automatisch verwalten | An | Überschreibungen für Owner, Erlauben, Verbieten und Admin setzen (`autopermission`) |
| Anpassen des Namens erlauben | An | `namechange` |
| Anpassen des Nutzerlimits erlauben | An | `limitchange` |
| Anpassen der Bitrate erlauben | An | `bitratechange` |
| Sperren von Kanälen erlauben | An | `locking` |
| Nutzerverwaltung erlauben | An | Erlauben- und Verbieten-Befehle (`usermanagement`) |
| Maximales Nutzerlimit | 99 | Obergrenze für von Mitgliedern gesetzte Limits (`maxuserlimit`) |
| Maximale Bitrate | 96 kbps | Obergrenze für von Mitgliedern gesetzte Bitraten, zusätzlich durch die Boost-Stufe des Servers begrenzt (`maxbitrate`) |
| Admin-Rolle | keine | Rolle, die jeden eigenen Kanal verwalten darf (`adminrole`) |

**Maximales Nutzerlimit**, **Maximale Bitrate** und **Admin-Rolle** haben keine Steuerung im Dashboard; lege sie mit `voiceconfig` fest.

Der Tab **Aktive Kanäle** listet jeden aktiven eigenen Kanal mit Owner, Sperrzustand und Zustand von „Am Leben halten" auf, lässt dich einen sperren, entsperren oder löschen und zeigt Summen für erstellte Kanäle, in der letzten Stunde aktive, gesperrte und am Leben gehaltene. Dort liegen auch der Button **Inaktive Kanäle bereinigen** und ein Button **Eigene Sprachkanäle deaktivieren**, der das Modul für den Server ausschaltet.

## Einrichtung Schritt für Schritt

1. Gib dem Bot „Kanäle verwalten", „Mitglieder verschieben" und „Rollen verwalten" (für Berechtigungs-Überschreibungen) in der Kategorie, die du verwenden wirst.
2. Führe `setupvoicehub` aus, oder öffne **Eigene Sprachkanäle** im Dashboard und wähle unter **Grundkonfiguration** einen bestehenden Hub-Kanal und eine Kategorie.
3. Lege unter **Kanal-Standards** das **Standard-Namensformat**, das **Standard-Nutzerlimit** und die **Standard-Bitrate** fest.
4. Schalte unter **Kanalverwaltung** alle Anpassungen aus, die Mitglieder nicht haben sollen.
5. Lege mit `voiceconfig adminrole @Moderators` eine **Admin-Rolle** fest, damit das Team Kanäle verwalten kann, die ihm nicht gehören.
6. Tritt selbst dem Hub bei, führe `voicecontrols` aus und probiere, den Kanal umzubenennen und zu sperren.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `setupvoicehub` | `svh`, `createvoicehub`, `voicesetup` | Kanäle verwalten | Einen Hub-Kanal und eine Kategorie erstellen |
| `setvoicehub <#channel> [category]` | `sethub`, `voicehub` | Kanäle verwalten | Einen bestehenden Kanal als Hub verwenden |
| `voiceconfig [setting] [value]` | `vcconfig`, `voicesettings`, `vcsettings`, `customvoiceconfig` | Kanäle verwalten | Servereinstellungen anzeigen oder ändern |
| `voicecontrols` | `vcontrols` | Owner oder Admin-Rolle | Interaktives Steuerpanel für deinen Kanal |
| `voicechannels` | `vchannels`, `listvoice`, `customvoices`, `voicelist` | Niemand | Aktive eigene Kanäle auflisten |
| `voicerename <name>` | `vrename`, `renamevoice`, `vcname`, `vcrename` | Owner oder Admin-Rolle | Deinen Kanal umbenennen |
| `voicelimit <number>` | `vclimit`, `limitvoice`, `vlimit`, `setlimit` | Owner oder Admin-Rolle | Das Nutzerlimit festlegen |
| `voicebitrate <kbps>` | `vcbitrate`, `vbitrate`, `setbitrate` | Owner oder Admin-Rolle | Die Bitrate festlegen |
| `voicelock [true/false]` | `vclock`, `lockvoice`, `vlock`, `lockvc` | Owner oder Admin-Rolle | Sperren oder entsperren |
| `voiceunlock` | `vcunlock`, `unlockvoice`, `vunlock`, `unlockvc` | Owner oder Admin-Rolle | Entsperren |
| `voiceallow @user` | `vcallow`, `allowuser`, `vallow`, `adduser` | Owner oder Admin-Rolle | Einem Mitglied den Beitritt zu einem gesperrten Kanal erlauben |
| `voicedeny @user` | `vcdeny`, `denyuser`, `vdeny`, `removeuser` | Owner oder Admin-Rolle | Ein Mitglied blockieren und trennen |
| `voiceclaim` | `vcclaim`, `claimvoice`, `vclaim`, `takeover` | Niemand | Einen Kanal übernehmen, dessen Owner gegangen ist |
| `voicetransfer @user` | `vctransfer`, `transfervoice`, `vtransfer`, `givevc` | Owner oder Admin-Rolle | Den Kanal jemand anderem geben |
| `voicekeepalive [true/false]` | `vckeepalive`, `keepvoice`, `vkeep`, `persist` | Owner oder Admin-Rolle | Den Kanal vom Aufräumen ausnehmen |
| `voicepreferences` | `vcprefs`, `voiceprefs`, `vprefs`, `myvoice` | Niemand | Deine gespeicherten Voreinstellungen anzeigen |
| `voiceprefsname [format]` | `vcprefsname`, `vpname`, `prefname`, `namepref` | Niemand | Bevorzugtes Namensformat, leer löscht |
| `voiceprefslimit [number]` | `vcprefslimit`, `vplimit`, `preflimit`, `limitpref` | Niemand | Bevorzugtes Nutzerlimit |
| `voiceprefsbitrate [kbps]` | `vcprefsbitrate`, `vpbitrate`, `prefbitrate`, `bitratepref` | Niemand | Bevorzugte Bitrate |
| `voiceprefslock [true/false]` | `vprefslock` | Niemand | Kanäle gesperrt starten |
| `voiceprefskeepalive [true/false]` | `vcprefskeepalive`, `vpkeepalive`, `prefkeepalive`, `keeppref` | Niemand | Kanäle mit „Am Leben halten" starten |
| `voiceprefsreset` | `vcprefsreset`, `vprefsreset`, `resetprefs`, `clearprefs` | Niemand | Alle Voreinstellungen löschen |

## Tipps und Stolperfallen

- Der Bot braucht „Kanäle verwalten" in der Kategorie, „Mitglieder verschieben", um den Ersteller in den neuen Kanal zu setzen, und „Rollen verwalten", um Berechtigungs-Überschreibungen zu schreiben.
- Die maximale Bitrate wird auf das begrenzt, was die Boost-Stufe des Servers erlaubt, daher wird eine Einstellung von 384 auf einem ungeboosteten Server automatisch reduziert.
- Das Sperren verbietet das Verbinden für die Everyone-Rolle. Mitglieder mit Administrator oder einer Rolle, die bereits eine ausdrückliche Verbinden-Erlaubnis hat, können weiterhin beitreten.
- Der Timer für leere Kanäle, der läuft, wenn das letzte Mitglied geht, behandelt den Timeout-Wert als Sekunden, während die Konfigurationsanzeige und der Fünf-Minuten-Durchlauf ihn als Minuten behandeln. Beim Standardwert 1 verschwindet der Kanal, sobald er leer ist, fast sofort.
- Kanäle mit „Am Leben halten" werden nie automatisch aufgeräumt. Nutze den Tab **Aktive Kanäle** oder `voicechannels`, um vergessene zu finden.
- Das Übernehmen funktioniert nur, solange der ursprüngliche Owner nicht mit dem Kanal verbunden ist.

---
title: Geburtstage
slug: birthday
summary: Mitglieder hinterlegen ein Geburtstagsdatum in ihrem Profil und stimmen zu. Der Bot kündigt es in einem Kanal an, optional mit einer temporären Geburtstagsrolle und einer Rollenerwähnung.
icon: fa-birthday-cake
category: Community
dashboard: /dashboard/birthday
module: Birthday
tags: [birthday, birthdays, bday, celebrate, birthday role, announcement, timezone, age, profile, Geburtstag, Geburtstage, feiern, Geburtstagsrolle, Ankündigung, Zeitzone, Alter, Profil]
related: [utility, administration]
---

## Was es macht

Ein Mitglied legt seinen Geburtstag einmal mit `setbirthday` fest und führt dann `birthdayannouncements` auf jedem Server aus, auf dem die Funktion aktiviert ist. Jeden Tag prüft der Bot, wer Geburtstag hat, postet eine Nachricht im Ankündigungskanal und kann 24 Stunden lang eine Geburtstagsrolle vergeben. Ist eine Ping-Rolle gesetzt, wird sie vor der Nachricht erwähnt.

Geburtstage werden im Bot-Profil des Mitglieds gespeichert, nicht pro Server. Ein einziges `setbirthday` gilt daher für jeden Server, den das Mitglied mit dem Bot teilt. Ob ein Geburtstag auf einem bestimmten Server angekündigt wird, hängt von drei Dingen ab: Das Mitglied hat zugestimmt, sein Profil ist nicht privat, und sein Anzeigemodus für den Geburtstag ist nicht deaktiviert.

Mit `birthdaytoday` kann jeder sehen, wer heute feiert, und mit `birthdaylist`, wer demnächst Geburtstag hat. Das Alter wird neben dem Namen angezeigt, außer das Mitglied hat einen Anzeigemodus gewählt, der das Jahr verbirgt.

Das Team konfiguriert Kanal, Rollen und Nachricht auf der Seite **Geburtstage** im Dashboard oder mit den Befehlen `birthday*`.

## Wozu du es nutzt

- Community-Server, die jeden Tag einen „Alles Gute zum Geburtstag“-Beitrag wollen, ohne dass jemand Daten von Hand verfolgen muss.
- Mitglieder erhalten für einen Tag eine farbige Geburtstagsrolle, damit sie im Chat auffallen.
- Eine Ping-Rolle für das „Geburtstagsteam“ erwähnen, damit die Leute die Ankündigung auch wirklich sehen.
- Mitgliedern erlauben, selbst zu wählen, wie viel von ihrem Geburtstag öffentlich ist, bis hin zu einer vollständigen Verbergung.

## Wer angekündigt wird

Ein Mitglied wird nur dann in Ankündigungen und Listen aufgenommen, wenn alle diese Bedingungen erfüllt sind:

| Voraussetzung | Wie das Mitglied sie steuert |
| --- | --- |
| Ein Geburtstag ist gesetzt | `setbirthday <date>` |
| Ankündigungen sind aktiviert | `birthdayannouncements` schaltet sie um; standardmäßig aus |
| Profil ist nicht privat | `setprivacy public` im Profil |
| Anzeigemodus ist nicht Deaktiviert | `setbirthdayprivacy <mode>` |

Die Prüfung läuft gegen die Mitglieder, die gerade auf dem Server sind. Wer den Server verlassen hat, wird daher nicht angekündigt.

### Anzeigemodi für Geburtstage

`setbirthdayprivacy` akzeptiert einen dieser Werte. Er bestimmt, was in Listen, im Profil und bei `birthdaytoday` angezeigt wird.

| Modus | Wirkung |
| --- | --- |
| `Default` | Vollständiges Datum wird angezeigt, das Alter erscheint in Listen |
| `MonthOnly` | Nur der Monat, Alter verborgen |
| `YearOnly` | Nur das Jahr, Alter wird weiterhin angezeigt |
| `MonthAndDate` | Monat und Tag, Alter verborgen |
| `Disabled` | Geburtstag verborgen und nie angekündigt |

## Wie die tägliche Prüfung funktioniert

Der Dienst läuft einmal pro Stunde und vergleicht Monat und Tag des Geburtstags jedes Mitglieds mit dem heutigen Datum in UTC. Die erste Stunde eines neuen UTC-Tages, die Geburtstage findet, postet sie, und der Server wird für diesen Tag als erledigt markiert, damit nichts doppelt gepostet wird.

Ankündigungen erfolgen nur, wenn die Funktion **Ankündigungen** aktiviert und ein Kanal gesetzt ist. Ein Kanal über `birthdaychannel` oder im Dashboard zu setzen aktiviert die Funktion für dich.

Zeitzonen werden gespeichert, aber von der täglichen Prüfung noch nicht verwendet. `birthdaytimezone` und die Einstellung **Server-Zeitzone** werden akzeptiert und im Konfigurations-Embed angezeigt, Ankündigungen erfolgen aber am UTC-Tag.

## Die Geburtstagsrolle

Ist **Geburtstagsrolle** aktiviert und eine Rolle gesetzt, erhält jedes angekündigte Mitglied die Rolle zum Zeitpunkt der Ankündigung, und sie wird 24 Stunden später wieder entfernt. Der Timer für das Entfernen liegt im Arbeitsspeicher. Startet der Bot während des Tages neu, bleibt die Rolle daher, bis jemand sie entfernt.

Der Bot braucht die Berechtigung Rollen verwalten, und seine höchste Rolle muss über der Geburtstagsrolle stehen.

## Die Ankündigungsnachricht

Die Standardnachricht lautet `Happy Birthday %user.mention%!` mit Partyemojis drumherum. Ersetze sie über `birthdaymessage` oder den Editor **Geburtstagsnachricht** im Dashboard. Der Text läuft durch den Embed-Parser, daher funktioniert alles, was der Embed-Builder erzeugt. Die Erwähnung der Ping-Rolle wird vorangestellt, falls sie aktiviert ist.

### Platzhalter

Die Nachricht unterstützt die üblichen Platzhalter für Nutzer, Server, Kanal und Bot von der Platzhalter-Seite sowie einen geburtstagsspezifischen Wert.

| Platzhalter | Wert |
| --- | --- |
| `%user.mention%` | Erwähnt das Geburtstagsmitglied |
| `%user.name%` | Der Nutzername |
| `%user.avatar%` | Die Avatar-URL |
| `%server.name%` | Der Servername |
| `%birthday.age%` | Das Alter, das die Person erreicht, oder `Unknown` |

> [!WARNING]
> Verwende `%user.mention%`, nicht `{user}`. Die Hilfe zum Textbefehl erwähnt `{user}`, aber in der veröffentlichten Ankündigung wird nur die Form `%...%` ersetzt.

## Einstellungen

Alles befindet sich auf der Seite **Geburtstage** in drei Tabs: **Konfiguration**, **Nutzer** und **Statistiken**.

**Konfiguration** enthält die Grundeinstellungen, den Nachrichteneditor und ein Panel **Geburtstagsfunktionen** mit einem Schalter pro Funktion.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Kanal | keiner | Wo Ankündigungen gepostet werden |
| Geburtstagsrolle | keiner | Rolle, die bei einem Geburtstag für 24 Stunden vergeben wird |
| Ping-Rolle | keiner | Rolle, die vor jeder Ankündigung erwähnt wird |
| Server-Zeitzone | UTC | Für den Server gespeichert, im Konfigurations-Embed angezeigt |
| Erinnerungstage vor dem Geburtstag | 0 | 0 bis 30; gespeichert, aber noch wird keine Erinnerung gesendet |
| Geburtstagsnachricht | Standard-Embed | Die Ankündigung mit den oben genannten Platzhaltern |

| Funktionsschalter | Standard | Was er steuert |
| --- | --- | --- |
| Ankündigungen | aus | Postet die tägliche Nachricht im Kanal |
| Geburtstagsrolle | aus | Vergibt die temporäre Rolle |
| Erinnerungen | aus | Platzhalter-Schalter; noch wird nichts gesendet |
| Ping-Rolle | aus | Erwähnt die Ping-Rolle bei Ankündigungen |
| Zeitzonenunterstützung | aus | Platzhalter-Schalter; die Prüfung läuft weiterhin in UTC |

**Nutzer** zeigt **Anstehende Geburtstage** für die nächsten 7, 14 oder 30 Tage und eine Liste **Alle Nutzer** mit jedem Mitglied, das einen Geburtstag hinterlegt hat. Heutige Geburtstage stehen oben auf der Seite hervorgehoben. **Statistiken** zeigt **Nutzer gesamt**, **Gesetzte Geburtstage**, **Öffentliche Geburtstage** und **Heutige Geburtstage**.

> [!NOTE]
> Beim Speichern des Dashboard-Formulars werden nur Werte geschrieben, die du ausgefüllt hast. Um eine Rolle oder den Kanal zu leeren, verwende `birthdayrole` oder `birthdaypingrole` ohne Rolle, oder setze alles mit `/birthday config reset` zurück.

## Einrichtungsanleitung

1. Öffne **Geburtstage** im Dashboard.
2. Wähle unter **Konfiguration** den **Kanal** für Ankündigungen und klicke auf **Konfiguration speichern**.
3. Aktiviere **Ankündigungen** im Panel **Geburtstagsfunktionen**.
4. Wähle optional eine **Geburtstagsrolle** und aktiviere **Geburtstagsrolle**, sowie eine **Ping-Rolle** mit aktivierter **Ping-Rolle**.
5. Schreibe optional eine eigene **Geburtstagsnachricht** mit `%user.mention%` und `%birthday.age%`.
6. Sag den Mitgliedern, dass sie `setbirthday` und danach `birthdayannouncements` ausführen sollen, um zuzustimmen.
7. Prüfe im Tab **Nutzer**, ob sie unter **Anstehende Geburtstage** erscheinen.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Die Slash-Versionen liegen unter `/birthday` und `/birthday config`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `setbirthday <date>` | | Niemand | Deinen Geburtstag in deinem Profil setzen, zum Beispiel `setbirthday 1998-04-12` |
| `setbirthdayprivacy <mode>` | | Niemand | Einen der oben genannten Anzeigemodi wählen |
| `birthdayannouncements` | `bdayann` | Niemand | Zustimmen oder widersprechen, angekündigt zu werden |
| `birthdaytimezone <zone>` | `bdaytz` | Niemand | Deine Zeitzone speichern, zum Beispiel `Europe/London` |
| `birthdaytoday` | `todaysbirthdays` | Niemand | Auflisten, wer heute feiert |
| `birthdaylist [days]` | `bdaylist`, `upcomingbirthdays` | Niemand | Anstehende Geburtstage, 1 bis 30 Tage, Standard 7 |
| `birthdaychannel [#channel]` | `bdaychannel`, `bdaychan` | Administrator | Ankündigungskanal setzen und Ankündigungen aktivieren |
| `birthdayrole [@role]` | `bdayrole` | Administrator | Die 24-Stunden-Geburtstagsrolle setzen oder ohne Rolle entfernen |
| `birthdaypingrole [@role]` | `bdayping` | Administrator | Die zu erwähnende Rolle setzen oder ohne Rolle entfernen |
| `birthdaymessage [text]` | `bdaymsg` | Administrator | Den Ankündigungstext setzen oder den aktuellen anzeigen |
| `birthdayconfig` | `bdaycfg` | Administrator | Die aktuelle Konfiguration anzeigen |

`/birthday config reset` setzt alle Einstellungen zurück und deaktiviert alle Funktionen. Dafür gibt es keinen Textbefehl.

## Tipps und Stolperfallen

- Mitglieder werden erst angekündigt, wenn sie `birthdayannouncements` ausführen. Sag es ihnen, sonst taucht niemand auf.
- `setbirthday` akzeptiert alles, was der Bot als Datum lesen kann. Verwende ein eindeutiges Format wie `1998-04-12`.
- `birthdaytimezone` akzeptiert nur eine kurze feste Liste von sechzehn Zeitzonen, etwa `UTC`, `GMT`, `America/New_York`, `Europe/London`, `Asia/Tokyo`, `Asia/Kolkata`, `Australia/Sydney` und `Pacific/Auckland`. Das Dashboard-Auswahlmenü **Server-Zeitzone** hat eine ähnliche Liste mit dreizehn Einträgen.
- Die tägliche Prüfung nutzt UTC. Mitglieder, die weit von UTC entfernt leben, werden unter Umständen einige Stunden zu früh oder zu spät angekündigt.
- Der Bot braucht die Berechtigung Rollen verwalten für die Geburtstagsrolle sowie Nachrichten senden und Embed-Links im Ankündigungskanal.
- `birthdayconfig` zeigt ein Feld „Erinnerungstage“ und eine Funktion Erinnerungen. Diese werden gespeichert, versenden aber derzeit nichts.
- Es gibt keinen Befehl, um einen gespeicherten Geburtstag zu löschen. Mitglieder verbergen ihn, indem sie `setbirthdayprivacy Disabled` ausführen, oder sie widersprechen mit `birthdayannouncements`.

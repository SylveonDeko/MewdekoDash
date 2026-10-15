---
title: Benutzerprofil
slug: userprofile
summary: Gib jedem Mitglied eine Profilkarte, die der Bot überall anzeigen kann, mit Bio, Pronomen, Sternzeichen, Geburtstag, Farbe, Bild und Switch-Freundescode, dazu Datenschutzoptionen für das, was andere sehen.
icon: fa-user
category: Community
module: UserProfile
tags: [profile, bio, pronouns, pronoundb, zodiac, birthday, privacy, profile colour, profile image, switch friend code, stats opt out, greet dm opt out, Profil, Pronomen, Sternzeichen, Geburtstag, Datenschutz, Profilfarbe, Profilbild, Switch-Freundescode, Statistik-Abmeldung, Begrüßungs-DM-Abmeldung]
related: [birthday, switch, afk, help]
---

## Was es macht

Jedes Mitglied hat ein Profil, das ihm auf jedem Server folgt, auf dem der Bot ist. Mit `profile` wird es als Embed gepostet: der Avatar des Mitglieds als Miniaturbild, die Bio als Beschreibung, dann Felder für Pronomen, Sternzeichen, Geburtstag, die Anzahl gemeinsamer Server mit dem Bot und den Nintendo-Switch-Freundescode, falls gesetzt. Eine eigene Farbe und ein großes Bild unten runden das Ganze ab.

Mitglieder füllen das Profil mit einigen `set...`-Befehlen oder über die Seite **Meine Einstellungen** im Dashboard. Nichts ist serverspezifisch: Stelle deine Bio einmal ein, und sie wird überall gleich angezeigt.

Die Privatsphäre liegt beim Mitglied. Ein Profil kann privat gestellt werden, sodass nur der Besitzer es öffnen kann; der Geburtstag kann auf Monat oder Jahr gekürzt oder ganz ausgeblendet werden, und Mitglieder können sich von Befehlsstatistiken und Begrüßungs-DMs abmelden.

Pronomen sind etwas Besonderes. Hat ein Mitglied über den Bot keine gesetzt, schaut der Bot bei PronounDB nach. Mitglieder können das mit eigenem Text überschreiben, und jeder kann eine missbräuchliche Überschreibung den Bot-Besitzern melden.

## Wofür du es verwenden würdest

- Mitglieder wollen eine schnelle „Über mich“-Karte, ohne einen eigenen Vorstellungskanal.
- Eine Community, die Switch-Freundescodes teilt, kann sie an einem Ort sammeln, statt Nachrichten anzuheften.
- Pronomen können automatisch aus PronounDB angezeigt werden, sodass die meisten sie nie selbst eintippen müssen.
- Das Team kann die Pronomen von jemandem mit `pronouns @user` prüfen, bevor es antwortet.
- Mitglieder, die keine Begrüßungs-DMs oder Statistikerfassung möchten, können diese selbst deaktivieren.

## Das Profil-Embed

`profile` ohne Argument zeigt dein eigenes Profil. `profile @user` zeigt das eines anderen, es sei denn, es ist privat; dann antwortet der Bot, dass das Profil privat ist.

| Teil des Embeds | Woher er stammt |
| --- | --- |
| Titel | „Profil von“ den Benutzer |
| Farbe | `setprofilecolor`, sonst die Standardfarbe des Bots |
| Miniaturbild | Der Discord-Avatar des Mitglieds |
| Beschreibung | Die Bio aus `setbio` (nur angezeigt, wenn gesetzt) |
| Pronomen | Deine Überschreibung, sonst PronounDB, sonst „Nicht angegeben“ |
| Sternzeichen | `setzodiac`, sonst „Nicht angegeben“ |
| Geburtstag | `setbirthday`, angezeigt gemäß dem Datenschutzmodus für Geburtstage, sonst „Nicht angegeben“ |
| Gemeinsame Bot-Server | Auf wie vielen Servern du und der Bot beide seid |
| Switch-Freundescode | Nur angezeigt, wenn gesetzt |
| Bild | Die URL aus `setprofileimage` |

## Profilfelder

### Bio

`setbio <text>` akzeptiert bis zu 2048 Zeichen. Längerer Text wird abgelehnt. Es gibt keinen Befehl zum Leeren; setze eine kurze Bio wie einen einzelnen Punkt, wenn sie verschwinden soll.

### Sternzeichen

`setzodiac <sign>` akzeptiert eines der zwölf westlichen Sternzeichen: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces. Groß- und Kleinschreibung spielen keine Rolle. Alles andere wird abgelehnt.

### Farbe und Bild

`setprofilecolor <colour>` nimmt eine Farbe in jeder Form, die der Farbparser des Bots versteht, zum Beispiel einen Hex-Wert. `setprofileimage <url>` benötigt einen direkten Link zu einer Bilddatei; der Bot prüft, ob die URL wie ein Bild aussieht, bevor er sie speichert, und zeigt sie dir dann an.

### Geburtstag

`setbirthday <date>` speichert ein Datum. Die Ankündigungen des Geburtstagsmoduls verwenden denselben Wert, das Setzen hier setzt ihn also auch dort. Wie er im Profil erscheint, hängt von `setbirthdayprivacy <mode>` ab:

| Modus | Was das Profil anzeigt |
| --- | --- |
| `Default` | Das vollständige Datum |
| `MonthOnly` | Nur den Monatsnamen |
| `YearOnly` | Nur das Jahr |
| `MonthAndDate` | Monat und Tag, ohne Jahr |
| `Disabled` | „Privat“ |

### Switch-Freundescode

`setswitchfc <code>` muss dem Format `SW-XXXX-XXXX-XXXX` entsprechen (vier Ziffern in jeder Gruppe; das `SW` ist nicht case-sensitiv). Führe den Befehl ohne Code aus, um ihn aus deinem Profil zu entfernen. Das Nintendo-Switch-Modul hat mit diesem Feld nichts zu tun; der Code dient nur der Anzeige.

### Privatsphäre

`setprivacy public` oder `setprivacy private`. Private Profile sind nur für ihren Besitzer sichtbar. Der Standard ist öffentlich.

## Pronomen

`pronouns [@user]` zeigt Pronomen für dich oder jemand anderen. Reihenfolge der Suche:

1. Text, den das Mitglied mit `setpronouns` gesetzt hat.
2. Der englische Pronomen-Satz des Mitglieds auf PronounDB, sofern es dort sein Discord-Konto verknüpft hat. Standardsätze werden in der üblichen Form angezeigt, zum Beispiel `he/him`, `Any pronouns` oder `Ask me my pronouns`.
3. „Nicht angegeben“.

`setpronouns <text>` speichert eine Überschreibung. Ohne Text ausgeführt zeigt der Befehl deine aktuelle Überschreibung mit zwei Buttons: **Überschreiben** öffnet ein Formular, in dem du neue Pronomen eintippen kannst, und **Leeren** entfernt die Überschreibung, sodass wieder PronounDB verwendet wird.

Stammen die angezeigten Pronomen aus der eigenen Überschreibung eines Mitglieds (nicht aus PronounDB), enthält die Antwort einen Button **Melden**. Meldungen gehen an einen Kanal, den die Bot-Besitzer betreiben; dort können sie die Überschreibung leeren, Pronomen für diesen Benutzer deaktivieren oder ihn auf die Blacklist setzen. Ein Benutzer, dessen Pronomen deaktiviert wurden, sieht den Grund, sobald er versucht, die Pronomen-Befehle zu nutzen.

> [!NOTE]
> Der Bot-Besitzer-Befehl `pronounsforceclear` ist der Weg, wie diese Meldungen bearbeitet werden. Das Serverteam kann die Pronomen eines anderen Mitglieds nicht leeren.

## Abmeldungen

- `greetdmoptout` schaltet um, ob Server, die die DM-Begrüßungen des Bots nutzen, dir DMs senden dürfen. Es betrifft nur Begrüßungen, die von diesem Bot gesendet werden.
- `userstatsoptout` schaltet die Erfassung von Befehlsstatistiken für dein Konto um. Es werden niemals Nachrichteninhalte erfasst.
- `deleteuserstatsdata` löscht nach einer Bestätigung die bereits gespeicherten Befehlsstatistiken zu dir. Der Befehl kann einmal pro Stunde ausgeführt werden.

## Einstellungen

Es gibt keine serverseitige Konfiguration. Alles liegt beim Mitglied. Die Seite **Meine Einstellungen** im Dashboard (`/me`) hat einen Abschnitt **Profil** mit einem Button **Bearbeiten** und einen Datenschutzbereich mit Schaltern.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Bio | leer | Die Beschreibung auf deinem Profil |
| Pronomen | leer (PronounDB wird verwendet) | Deine Pronomen-Überschreibung |
| Sternzeichen | keines | Auf dem Profil angezeigtes Sternzeichen |
| Geburtstag | keiner | Das Datum auf dem Profil und für Geburtstagsankündigungen |
| Zeitzone | UTC | Zeitzone, die das Geburtstagsmodul für deine Ankündigung verwendet |
| Switch-Freundescode | leer | Feld für den Freundescode auf dem Profil |
| Profilfarbe | Standard des Bots | Embed-Farbe |
| Profilbild | keines | Bild unten im Embed |
| Profil-Sichtbarkeit | Öffentlich | Ob andere dein Profil öffnen können |
| Anzeigemodus für Geburtstag | Standard | Welche Teile des Geburtstags angezeigt werden |
| Willkommens-DMs blockieren | Aus | Wie `greetdmoptout` |
| Nachrichtenerfassung blockieren | Aus | Wie `userstatsoptout` |
| Geburtstagsankündigungen | Aus | Ob das Geburtstagsmodul deinen Geburtstag ankündigt |

Dieselbe Seite hat außerdem einen Schalter, der das Abrufen von Pronomen für dein Konto deaktiviert.

## Einrichtung Schritt für Schritt

1. Führe `setbio Hi, I run the art channel.` aus, um eine Beschreibung hinzuzufügen.
2. Führe `setpronouns she/her` aus, oder überspringe das, wenn dein PronounDB-Konto bereits mit Discord verknüpft ist.
3. Führe `setbirthday 1998-04-12` aus und dann `setbirthdayprivacy MonthAndDate`, wenn das Jahr nicht angezeigt werden soll.
4. Führe `setprofilecolor #ff66aa` und `setprofileimage https://example.com/banner.png` aus, um das Embed zu gestalten.
5. Füge `setswitchfc SW-1234-5678-9012` hinzu, wenn dich andere auf Switch finden sollen.
6. Führe `profile` aus, um das Ergebnis zu prüfen. Wenn niemand anderes es sehen soll, führe `setprivacy private` aus.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast). Für die meisten gibt es Slash-Versionen unter Namen wie `/profile`, `/setbio`, `/setcolor`, `/setbirthday`, `/setbirthdayprivacy`, `/setswitchfriendcode`, `/setprofileimage`, `/setprivacy`, `/setzodiac`, `/pronouns`, `/setpronouns`, `/statsoptout` und `/deletestatsdata`.

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `profile [@user]` | `userprofile` | Niemand | Dein Profil oder das eines anderen anzeigen |
| `setbio <text>` | | Niemand | Deine Bio festlegen, bis zu 2048 Zeichen |
| `setpronouns [text]` | `pronounsset` | Niemand | Eine Pronomen-Überschreibung setzen oder sie mit den Buttons Leeren und Überschreiben anzeigen |
| `pronouns [@user]` | `getpronouns` | Niemand | Pronomen anzeigen, mit einem Meldebutton bei Überschreibungen |
| `setzodiac <sign>` | | Niemand | Dein Sternzeichen festlegen |
| `setprofilecolor <colour>` | | Niemand | Die Embed-Farbe festlegen |
| `setprofileimage <url>` | | Niemand | Das Bild festlegen, das auf dem Profil angezeigt wird |
| `setbirthday <date>` | | Niemand | Deinen Geburtstag festlegen |
| `setbirthdayprivacy <mode>` | | Niemand | `Default`, `MonthOnly`, `YearOnly`, `MonthAndDate` oder `Disabled` |
| `setprivacy <Public|Private>` | `profilepricvacy` | Niemand | Das Profil öffentlich oder privat machen |
| `setswitchfc [code]` | `setfc`, `setswitchfriendcode`, `setfriendcode` | Niemand | Deinen Switch-Freundescode setzen oder entfernen |
| `greetdmoptout` | `gdmoptout` | Niemand | Den Empfang von DM-Begrüßungen dieses Bots umschalten |
| `userstatsoptout` | `ustatsoptout` | Niemand | Die Erfassung von Befehlsstatistiken umschalten |
| `deleteuserstatsdata` | `deluserstatsdata` | Niemand | Deine gespeicherten Befehlsstatistiken löschen (einmal pro Stunde) |
| `pronounsforceclear <@user or id> <true|false> <reason>` | `pnfc` | Bot-Besitzer | Die Pronomen eines Mitglieds leeren und sie optional deaktivieren |

## Tipps und Stolperfallen

- Das Profil ist global. Eine Änderung auf einem Server ändert sie überall.
- `setbirthday` liest das Datum mit dem Datumsparser des Bots, daher ist ein eindeutiges Format wie `1998-04-12` am sichersten.
- Funktioniert die URL des Profilbilds nicht mehr, wird das Embed trotzdem gesendet, aber Discord zeigt kein Bild. Setze eine neue URL, um das zu beheben.
- PronounDB-Abfragen setzen voraus, dass das Mitglied sein Discord-Konto auf pronoundb.org verknüpft hat. Ohne das zeigt das Profil „Nicht angegeben“, bis das Mitglied `setpronouns` ausführt.
- Private Profile reagieren weiterhin auf `profile @user`, allerdings mit einer Fehlermeldung, dass das Profil privat ist, sodass Leute wissen, dass es existiert.
- `deleteuserstatsdata` entfernt nur Befehlsstatistiken. Profilfelder werden geleert, indem man sie überschreibt.

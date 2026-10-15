---
title: Nintendo Switch
slug: switch
summary: Schlage Fehlercodes der Nintendo Switch nach, rechne sie zwischen Dezimal- und Hex-Format um, durchsuche das Wiki auf switchbrew.org und erhalte eine verständliche Aufschlüsselung einer Ryujinx-Logdatei.
icon: fa-gamepad-modern
category: Entertainment
module: Switch
tags: [switch, nintendo, error code, ryujinx, emulator, log, switchbrew, homebrew, hex, Fehlercode, Emulator, Logdatei, Hex, Homebrew]
related: [userprofile, help]
---

## Was es macht

Das Switch-Modul ist ein Support-Werkzeug für Server rund um Nintendo-Switch-Homebrew und Emulation. Wenn jemand einen Fehler wie `2168-0002` postet, führt ein Helfer `err 2168-0002` aus, und der Bot antwortet mit dem Modul, zu dem der Fehler gehört, was über ihn bekannt ist und einem Link zur Support-Seite von Nintendo, sofern es eine gibt.

Zwei kleine Umrechner wandeln die Form `NNNN-NNNN` in den rohen Hex-Wert um, der im Code verwendet wird, und zurück. `switchbrew` durchsucht das Wiki auf switchbrew.org, damit Leute SVC-, Ergebniscode- oder Hardware-Seiten finden, ohne Discord zu verlassen.

Das größte Feature ist der Ryujinx-Log-Analyzer. Ein Nutzer hängt seine `Ryujinx.log` an, jemand führt `analyselog` darauf aus, entweder direkt oder als Antwort auf die Nachricht, und der Bot erstellt ein Embed mit dem Spiel, der Emulator-Version, der Hardware, allen relevanten Einstellungen, dem letzten Fehler, installierten Mods und Cheats sowie einer Liste mit Hinweisen auf typische Fehlkonfigurationen.

Es muss nichts eingerichtet werden und nichts wird gespeichert. Alle Befehle sind für alle offen.

## Wofür du es nutzen kannst

- Ein Support-Kanal bekommt täglich dieselbe Frage: „Was bedeutet 2811-5001?“
- Die Fehlersuche bei Ryujinx beginnt mit dem Lesen des Logs, und die meisten wissen nicht, worauf sie achten müssen.
- Entwickler wollen die Hex-Form eines Fehlers, um im Quellcode danach zu suchen.
- Jeder kann eine Seite von switchbrew.org direkt aus Discord aufrufen.

## Fehlercode-Suche

`err <code>` akzeptiert beide Formen:

- `NNNN-NNNN`, wobei die erste Gruppe mit 2 beginnt (zum Beispiel `2168-0002`). Die Modulnummer ist die erste Gruppe minus 2000, und die Beschreibung ist die zweite Gruppe.
- Ein Hex-Wert mit dem Präfix `0x`, zum Beispiel `0x2A2`. Die unteren neun Bits sind das Modul, der Rest ist die Beschreibung.

Die Antwort zeigt den Code in beiden Formen, den Modulnamen und die Modulnummer, die Beschreibungsnummer und eine Erklärung. Die Erklärung wird in dieser Reihenfolge gesucht: eine bekannte Beschreibung für genau diesen Code, eine Support-Seite von Nintendo für genau diesen Code, eine Beschreibung für den Bereich, in den der Code innerhalb seines Moduls fällt, und sonst „unbekannt“. Bekannte Codes werden in der normalen Farbe angezeigt, unbekannte in der Fehlerfarbe.

Ein paar Codes folgen diesem Muster nicht, etwa `2-AAB6A-3400`. Diese werden exakt gegen eine kurze Liste abgeglichen und mit dem Spiel gemeldet, zu dem sie gehören.

`err2hex <NNNN-NNNN>` gibt den Hex-Wert aus. `hex2err <hex>` gibt die Form mit Bindestrich aus; das Präfix `0x` ist optional.

## Switchbrew-Suche

`switchbrew <query>` fragt die Such-API des Wikis ab und gibt die fünf besten Treffer mit Link und einem Auszug von bis zu 200 Zeichen pro Treffer zurück. `svc` ist ein Alias, daher liest sich `svc SetThreadPriority` ganz natürlich.

## Ryujinx-Log-Analyse

`analyselog` sucht nach einem Anhang `.log` oder `.txt` an deiner Nachricht. Gibt es keinen, und ist deine Nachricht eine Antwort, verwendet der Bot den Anhang der Nachricht, auf die du geantwortet hast, und nennt den Autor dieser Nachricht in der Fußzeile. Das Embed trägt den Spielnamen als Titel und enthält:

| Feld | Inhalt |
| --- | --- |
| Allgemeine Infos | Ryujinx-Version, Firmware, CPU, GPU, RAM, Betriebssystem |
| Systemeinstellungen | Audio-Backend, angedockt oder mobil, PPTC, Shader-Cache, VSync, Hypervisor (nur macOS) |
| Grafikeinstellungen | Grafik-Backend, Auflösungsskalierung, anisotropische Filterung, Seitenverhältnis, Textur-Rekomprimierung |
| Fehler | Der letzte Fehlerblock aus dem Log oder „keine Fehler“ |
| Mods | Jede Mod mit ExeFS oder RomFS, bei vielen gekürzt mit einer Anzahl |
| Cheats | Jeder Cheat, auf dieselbe Weise gekürzt |
| Hinweise | Erkannte Probleme und Empfehlungen |

Die Hinweise decken Dinge ab wie eine Kollision oder Beschädigung des Shader-Caches, einen falschen Dump-Hash, veraltete Keys, fehlende Firmware, Fehler bei Dateiberechtigungen, einen fehlenden Spielstand, fehlende Dienste, Vulkan mit zu wenig Speicher, das Standard-Nutzerprofil, keinen konfigurierten Controller, eine Intel- oder AMD-GPU, die Vulkan verwenden sollte, Rosetta auf Apple Silicon, das Dummy-Audio-Backend, deaktiviertes PPTC oder deaktivierten Shader-Cache, erweiterten RAM, den Software-Speichermanager, das Ignorieren fehlender Dienste, ausgeschaltetes VSync, ausgeschaltete Dateisystem-Integritätsprüfungen, ausgeschaltetes Backend-Threading und eigene Builds. Jeder Hinweis hat eine Schweregrad-Markierung, von informativ bis kritisch.

Wenn die Datei nicht heruntergeladen werden kann oder kein Ryujinx-Log ist, meldet der Bot, dass das Log ungültig ist.

## Einstellungen

Dieses Modul hat keine Einstellungen und keine Dashboard-Seite.

## Einrichtung Schritt für Schritt

1. Stelle sicher, dass der Bot den Nachrichtenverlauf lesen und Dateien in deinem Support-Kanal anhängen kann.
2. Bitte Nutzer, ihre `Ryujinx.log` direkt an eine Nachricht anzuhängen.
3. Ein Helfer antwortet auf diese Nachricht mit `analyselog`.
4. Für Fehlercodes führe `err <code>` aus und teile den Support-Link, falls einer angezeigt wird.
5. Optional kannst du einen Chat-Trigger oder eine angepinnte Nachricht hinzufügen, die an diese beiden Befehle erinnert.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `err <code>` | `nxerr`, `serr` | Niemand | Erklärt einen Switch-Fehlercode in der Form mit Bindestrich oder als Hex-Wert |
| `err2hex <NNNN-NNNN>` | `e2h` | Niemand | Wandelt einen Code mit Bindestrich in Hex um |
| `hex2err <hex>` | `h2e` | Niemand | Wandelt Hex in die Form mit Bindestrich um |
| `switchbrew <query>` | `sb`, `svc` | Niemand | Durchsucht switchbrew.org |
| `analyselog` | `analyzelog`, `analyselogs`, `analyzelogs`, `analyze`, `analyse` | Niemand | Analysiert ein angehängtes Ryujinx-Log |

## Tipps und Stolperfallen

- Die Form mit Bindestrich muss genau aus vier Ziffern, einem Bindestrich und vier Ziffern bestehen und mit 2 beginnen. Codes mit Buchstaben werden nur über die Liste der Sonderfälle geprüft.
- Logs müssen als `.log` oder `.txt` angehängt werden; ein eingefügtes Log in einem Codeblock wird nicht gelesen.
- Der Analyzer liest die gesamte Datei. Bitte Nutzer daher um das Log aus der Sitzung, in der das Problem auftrat, und nicht um einen frischen Start.
- Die Suche auf switchbrew.org ist eine Live-Anfrage; ist die Seite langsam, ist auch der Befehl langsam.
- Mitglieder können ihren Switch-Freundescode mit `setswitchfc` in ihrem Profil speichern. Das gehört zum Modul Nutzerprofil.

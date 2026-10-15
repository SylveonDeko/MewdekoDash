---
title: Prozess-Logs
slug: process-logs
summary: Eine Dashboard-Seite nur für Bot-Owner, die die Prozesse auflistet, die pm2 auf dem Host des Bots ausführt, und dir erlaubt, deren Konsolen-Logs zu lesen, zu verfolgen, zu filtern und herunterzuladen.
icon: fa-rectangle-code
category: Analytics
dashboard: /owner/process-logs
tags: [pm2, logs, console, stdout, stderr, tail, process, crash, stack trace, owner, Prozess, Konsole, Absturz, Stacktrace, Owner, Logs]
related: [performance, analytics, leave-feedback]
---

## Was es macht

Prozess-Logs zeigt, was der Bot in seine Konsole schreibt, direkt aus den Logdateien, die pm2 dafür führt, ohne dass du eine Shell auf dem Server öffnen musst. Die Seite ist nur für Bot-Owner sichtbar: Die Seitenleiste blendet sie für alle anderen aus, wer die URL direkt aufruft, wird zurück zur Startseite des Dashboards geschickt, und der Bot selbst lehnt die Anfragen ab, solange das angemeldete Konto kein Owner ist.

Die Seite fragt die von dir ausgewählte Bot-Instanz nach ihrer pm2-Prozesstabelle. Jeder Prozess, den pm2 auf diesem Host verwaltet, wird aufgelistet, nicht nur der Bot, mit Status, PID, Laufzeit, Anzahl der Neustarts, CPU- und Speicherverbrauch sowie der Größe seiner beiden Logdateien. Wählst du einen aus, lädt die Seite die letzten paar hundert Zeilen seines stdout-Logs und hängt alle paar Sekunden neue Zeilen an, solange **Folgen** aktiv ist.

Die Zeilen behalten die Farben, die Serilog ausgibt, und jede Zeile ist mit ihrem Level markiert, damit du das Rauschen ausblenden kannst. Fortsetzungszeilen wie Stacktraces bleiben an der Zeile darüber hängen, sodass das Ausblenden von Info-Zeilen keine verwaisten Traces zurücklässt.

## Wofür du es nutzen kannst

- Der Bot ist neu gestartet oder abgestürzt, und du willst wissen, was er als Letztes gesagt hat, bevor er ausfiel. Das steht meist auf der stderr-Seite.
- Ein Mitglied meldet, dass ein Befehl fehlschlägt, und du willst das Log live verfolgen, während es das erneut versucht.
- Du willst ein paar tausend aktuelle Zeilen nach einer Server-ID oder einer Nachricht durchsuchen, ohne dich per SSH einzuloggen.
- Du brauchst die vollständige Logdatei für einen Fehlerbericht und willst sie als Download.

## Steuerelemente

| Steuerelement | Was es bewirkt |
| --- | --- |
| Prozesskarten | Eine pro pm2-Prozess auf dem Host. Die Karte mit **dieser Bot** ist die Instanz, die die Anfrage beantwortet. Klicke auf eine, um ihre Logs zu lesen. |
| **stdout** / **stderr** | Wechselt zwischen dem Ausgabe-Log des Prozesses, in das normales Logging geht, und seinem Fehler-Log, in dem Abstürze und Laufzeitdiagnosen landen. |
| **100** bis **2k** | Wie viele Zeilen beim Öffnen oder Neu laden geladen werden. Der Folgemodus hält bis zu 5.000 Zeilen auf der Seite, bevor er die ältesten verwirft. |
| Filterfeld | Blendet jede Zeile aus, deren Text nicht enthält, was du eingegeben hast. Groß- und Kleinschreibung spielt keine Rolle. |
| **Folgen aktiv** / **Folgen** | Schaltet Live-Updates ein und aus. Im aktiven Zustand fragt die Seite alle zwei Sekunden nach neuen Zeilen und scrollt mit, solange du nicht nach oben gescrollt hast. |
| **Umbrechen** | Bricht lange Zeilen um, statt seitlich zu scrollen. |
| **Kopieren** | Kopiert die sichtbaren Zeilen ohne Farbcodes in die Zwischenablage. |
| **Neu laden** | Liest das Ende der Datei erneut ein. |
| **Herunterladen** | Speichert die gesamte Logdatei so, wie sie auf dem Datenträger liegt, einschließlich der Farbcodes. Die Größe daneben ist die aktuelle Dateigröße. |
| Level-Filter | **VRB**, **DBG**, **INF**, **WRN**, **ERR** und **FTL**, jeweils mit der Anzahl der geladenen Zeilen mit diesem Level. Klicke auf eines, um dieses Level ein- oder auszublenden. |

Wenn du während des Folgens nach oben scrollst, werden neue Zeilen zurückgehalten, und ein Button unten rechts zeigt, wie viele warten. Klicke darauf, um wieder nach unten zu springen und mit dem Log weiterzuscrollen.

> [!NOTE]
> Ein einzelnes Lesen ist auf 1 MB begrenzt. Passen die angeforderten Zeilen nicht hinein, meldet die Seite, dass ältere Zeilen übersprungen wurden. Lade die Datei herunter, um alles zu sehen.

## So findet der Bot die Logs

Der Bot führt `pm2 jlist` auf seinem eigenen Host aus und liest die Pfade der Logdateien, die pm2 für jeden Prozess meldet. Das tut er nur, wenn bereits ein pm2-Daemon für denselben Benutzer läuft, sodass er nie versehentlich einen neuen startet. Ist pm2 installiert, lässt sich aber nicht abfragen, greift die Seite auf die Dateien im Log-Verzeichnis von pm2 zurück und sagt das auch. Ist pm2 gar nicht vorhanden, erklärt die Seite das, statt eine leere Liste zu zeigen.

Auf einem Dashboard, das mit mehreren Bot-Instanzen verbunden ist, gehört die Prozessliste zu der jeweils ausgewählten Instanz, da jede nur ihren eigenen Host sehen kann.

## Einrichtung Schritt für Schritt

1. Starte den Bot auf seinem Server unter pm2, zum Beispiel mit `pm2 start dotnet --name mewdeko -- Mewdeko.dll`.
2. Melde dich mit einem Bot-Owner-Konto im Dashboard an und öffne **Prozess-Logs** aus der Seitenleiste.
3. Wähle den Prozess mit **dieser Bot** oder einen anderen Prozess auf dem Host.
4. Lass **Folgen** aktiv, um das Log live zu verfolgen, oder schalte es aus und nutze Filterfeld und Level-Filter, um im geladenen Material zu suchen.
5. Wechsle nach einem Absturz zu **stderr**, um zu lesen, was die Laufzeitumgebung auf dem Weg nach unten ausgegeben hat.

## Tipps und Stolperfallen

- Logs werden aus Dateien gelesen. Ein Prozess, der außerhalb von pm2 gestartet wurde, hat hier keine Logs. Die Konsolenausgabe des Bots erscheint nur, wenn der Bot selbst unter pm2 läuft.
- pm2 rotiert oder kürzt Dateien, wenn du `pm2 flush` ausführst oder `pm2-logrotate` nutzt. Die Seite bemerkt, dass die Datei kleiner geworden ist, und lädt das Ende selbstständig neu.
- Filterfeld und Level-Filter wirken nur auf bereits geladene Zeilen. Lade mehr Zeilen oder lade die Datei herunter, wenn du weiter zurück suchen willst.
- Auf dieser Seite lässt sich nichts am Bot ändern. Du kannst Prozesse hier weder neu starten noch Logs leeren; dafür sind der Owner-Befehl `restartinstance` und `pm2 flush` auf dem Server da.

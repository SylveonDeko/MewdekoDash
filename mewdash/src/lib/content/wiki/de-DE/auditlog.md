---
title: Audit-Log
slug: auditlog
summary: Ein Protokoll darüber, wer das Dashboard für deinen Server genutzt hat, was angesehen und was geändert wurde, neunzig Tage lang gespeichert.
icon: fa-clipboard-check
category: Security
dashboard: /dashboard/auditlog
tags: [audit, history, accountability, dashboard access, who changed, log, changes, before and after, Audit, Verlauf, Nachvollziehbarkeit, Dashboard-Zugriff, Wer hat geändert, Protokoll, Änderungen, vorher und nachher]
related: [logging, administration, channel-access]
---

## Was es macht

Jede Anfrage, die das Dashboard für deinen Server an den Bot sendet, wird dem Discord-Konto zugeordnet, das angemeldet war. Die Seite Audit-Log macht daraus eine Zeitleiste: wer die XP-Einstellungen geöffnet hat, wer die Willkommensnachricht bearbeitet, wer einen Chat-Trigger gelöscht hat und welche Werte vorher und nachher galten.

Es ist getrennt vom Audit-Log von Discord und von der Funktion Logging. Discords Log deckt Aktionen innerhalb von Discord ab. Mewdekos Logging schreibt Serverereignisse wie Beitritte, Bearbeitungen und Rollenänderungen in Kanäle deiner Wahl. Das Dashboard-Audit-Log deckt nur das Dashboard ab.

Du musst nichts aktivieren. Einträge entstehen ab dem Moment, in dem sich jemand im Dashboard anmeldet und deinen Server öffnet, und verfallen nach neunzig Tagen.

## Wofür du es brauchst

- Mehrere Personen haben Dashboard-Zugriff und du willst wissen, wer letzte Woche den Anti-Raid abgeschaltet hat.
- Eine Einstellung wurde geändert und niemand gibt es zu.
- Du willst eine Nachweiskette, bevor du einem größeren Team Dashboard-Zugriff gibst.
- Du musst prüfen, ob eine Änderung, um die du jemanden gebeten hast, tatsächlich gemacht wurde und was sie ersetzt hat.

## Was aufgezeichnet wird

Jeder Eintrag enthält:

- **Wann**: der Zeitpunkt der Anfrage, in UTC gespeichert und auf der Seite in deiner eigenen Zeitzone angezeigt.
- **Nutzer**: Discord-Name und ID aus der Dashboard-Anmeldung, nicht aus irgendetwas, das der Nutzer eingegeben hat.
- **Aktion**: eine der Aktionen in der Tabelle unten.
- **Bereich**: der Dashboard-Bereich, mit einem lesbaren Namen wie „AFK-System“, „Trigger“ oder „Schutz“.
- **Endpunkt**: die genaue Anfrage, zum Beispiel `PUT Afk/123/settings`, klein gedruckt unter dem Bereich.
- **Änderungen**: bei allem außer einer Ansicht die gesendeten oder geänderten Werte. Klappe den Eintrag mit **Details** auf, um sie zu sehen.

Der Bot speichert außerdem den User-Agent-String des Browsers mit jedem Eintrag.

### Aktionen

Die Aktion richtet sich nach der Art der Anfrage, die das Dashboard gestellt hat.

| Aktion | Wird aufgezeichnet, wenn |
| --- | --- |
| Angesehen | Das Dashboard hat Daten gelesen (eine GET-Anfrage). Jeder Seitenaufruf erzeugt solche Einträge. |
| Erstellt | Etwas wurde hinzugefügt (eine POST-Anfrage). |
| Aktualisiert | Etwas Vorhandenes wurde geändert (eine PUT- oder PATCH-Anfrage). |
| Gelöscht | Etwas wurde entfernt (eine DELETE-Anfrage). |
| Aufgerufen | Für den Beginn von Dashboard-Sitzungen reserviert. Der Filter bietet sie an, aber die aktuelle Version schreibt nie Einträge mit dieser Aktion. |

### Änderungssätze

Ansichten speichern keine Änderungsdaten. Für alles andere speichert der Bot eines von zwei Dokumenten:

- **Vorher-Nachher-Vergleich**: Wenn der Dashboard-Bereich die Einstellung vor der Änderung festhält, listet der Eintrag nur die geänderten Felder mit altem und neuem Wert. Die meisten Einstellungsseiten arbeiten so.
- **Anfragetext**: Wenn kein Snapshot erstellt wurde, speichert der Eintrag, was das Dashboard gesendet hat, ohne alten Wert.

Jedes Feld, dessen Name `token`, `secret`, `password`, `apikey`, `api_key`, `authorization` oder `clientsecret` enthält, wird vor dem Speichern durch `[redacted]` ersetzt, damit Zugangsdaten nie im Log landen.

Auf der Seite werden Wahrheitswerte als An und Aus angezeigt, Listen als „3 Einträge“, leere Zeichenketten als „leer“ und fehlende Werte als „keine“. Feldnamen werden in lesbare Bezeichnungen umgewandelt.

> [!NOTE]
> „Angesehen“-Einträge machen den größten Teil des Logs aus, weil jede Dashboard-Seite beim Öffnen Einstellungen liest. Filtere nach Erstellt, Aktualisiert oder Gelöscht, wenn du nach einer Änderung suchst.

### Was nicht aufgezeichnet wird

- Alles, was mit Befehlen in Discord getan wird. Diese Aktionen erscheinen im Audit-Log von Discord, wo der Bot gehandelt hat, und im Logging, falls du es eingerichtet hast.
- Anfragen, die keinem angemeldeten Dashboard-Nutzer zugeordnet sind.
- Das Öffnen der Audit-Log-Seite selbst, Feedback geben und einige Infrastruktur- und Abfrage-Endpunkte wie Bot-Status, Leistung, Systeminfos und Instanzverwaltung.
- Einige ausdrücklich ausgenommene Endpunkte: das Persona-Avatarbild für den Embed-Builder, die Prüfung „soll angezeigt werden“ des Einrichtungsassistenten und der Seitenaufruf-Beacon des Dashboards.

## Die Seite lesen

Öffne **Audit-Log** im Dashboard unter Sicherheit. Die Liste zeigt die neuesten Einträge zuerst, fünfzig pro Seite, mit den Buttons **Zurück** und **Weiter** und einer Gesamtzahl der Einträge.

Über der Liste gibt es zwei Filter:

| Filter | Was er macht |
| --- | --- |
| **Aktion** | Zeigt nur Angesehen-, Erstellt-, Aktualisiert-, Gelöscht- oder Aufgerufen-Einträge. |
| **Bereich** | Zeigt nur einen Dashboard-Bereich. Die Auswahl wird aus den Bereichen der gerade geladenen Einträge gebildet. |

**Aktualisieren** lädt die Liste neu. Wenn du einen Filter änderst, springt die Ansicht zurück auf Seite eins.

Auf dem Desktop ist jeder Eintrag eine Zeile mit einem Button **Details**, sofern Änderungsdaten vorhanden sind. Auf dem Handy werden die Einträge als Karten mit dem Button **Details anzeigen** dargestellt.

> [!EXAMPLE]
> Stelle **Aktion** auf Aktualisiert und **Bereich** auf Schutz, um jedes Mal zu sehen, wenn jemand ein Schutzsystem geändert hat, und klappe dann eine Zeile auf, um zu sehen, welche Felder sich von was zu was geändert haben.

## Aufbewahrung

Einträge werden **neunzig Tage** lang aufbewahrt. Ein Bereinigungsjob läuft einmal täglich, fünf Minuten nachdem der Bot online gegangen ist, und löscht alles, was älter ist. Es gibt keinen Export. Wenn du ein Protokoll über dieses Fenster hinaus brauchst, speichere es, bevor es verfällt.

## Wer es sehen kann

Die Seite ist nur für Personen verfügbar, die sich im Dashboard anmelden können und Mitglied deines Servers sind. Der Server-Owner und alle mit der Berechtigung Administrator können sie immer öffnen. Alle anderen brauchen mindestens die Stufe **Ansehen** für den Bereich **Audit-Log** unter Dashboard-Zugriff, die pro Nutzer oder pro Rolle vergeben wird.

> [!PERMISSION]
> Da der Nutzer aus dem Anmelde-Token des Dashboards stammt, kann niemand einen Eintrag unter dem Namen einer anderen Person erscheinen lassen.

## Tipps und Stolperfallen

- Der Bereichsfilter listet nur Bereiche auf, die auf der gerade angesehenen Seite vorkommen. Fehlt ein Bereich in der Auswahl, existiert er vielleicht auf späteren Seiten; entferne den Aktionsfilter und blättere durch oder grenze zuerst nach Aktion ein.
- Zeitstempel werden in der Zeitzone des Browsers angezeigt, der die Seite ansieht, nicht in der Zeitzone des Servers aus den Verwaltungseinstellungen.
- Ein Eintrag „Erstellt“ bedeutet, dass eine POST-Anfrage gestellt wurde, die das Dashboard auch für einige Schalter und Aktualisierungen nutzt. Lies die Endpunktzeile und die Details, um zu sehen, was wirklich passiert ist.
- Einträge, deren Details Werte ohne alten Wert zeigen, stammen aus einem Bereich, der seinen vorherigen Zustand nicht festhält. Du siehst, was gesendet wurde, aber nicht, was es ersetzt hat.
- Das Log gilt pro Server. Wenn du im Dashboard den Server wechselst, wechselt das Log mit.

---
title: Verwaltung
slug: administration
summary: Automatischer Schutz vor Raids, Spam, Alts, Scams und Honeypots, Rollen, die beim Beitritt vergeben oder von Mitgliedern selbst geholt werden, Discord-Berechtigungs-Überschreibungen für Befehle und die Massenaktionen für schlechte Tage.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Administration
tags: [admin, anti-raid, anti-spam, anti-alt, anti-pattern, anti-mass-mention, anti-mass-post, honeypot, anti-image-hash, scam images, external apps, user apps, reaction roles, self-assignable roles, auto-assign roles, auto-ban roles, voice channel roles, permission overrides, dpo, mass ban, prune, server recovery, staff role, timezone, cooldowns, Verwaltung, Administration, Raid-Schutz, Spam-Schutz, Scam-Bilder, Reaktionsrollen, selbst zuweisbare Rollen, automatische Rollen, Berechtigungs-Überschreibungen, Massenbann, Serverwiederherstellung, Teamrolle, Zeitzone, Cooldowns]
related: [moderation, permissions, logging, multigreets, settings, auditlog, rolestates]
---

## Was es macht

Verwaltung ist das Modul, das einen Server in Ordnung hält, wenn gerade kein Moderator hinschaut. Seine Schutzsysteme überwachen Beitritte und Nachrichten und bestrafen automatisch, wenn etwas nach einem Raid, einem Spam-Schwall, einem Wegwerf-Alt, einem Massenping, einem in jeden Kanal gepasteten Scam-Link, einem Beitrag in einem Fallenkanal oder einem bekannten Scam-Bild aussieht. Jedes System ist unabhängig, hat seine eigene Strafe und lässt sich einzeln ein- und ausschalten.

Dasselbe Modul kümmert sich um Rollenautomatisierung: Rollen beim Beitritt, Rollen, die sich Mitglieder mit `iam` selbst holen, Reaktionsrollen, Rollen, die an die Anwesenheit in einem Sprachkanal gebunden sind, und Stolperdraht-Rollen, die jeden bannen, der sie erhält. Außerdem kannst du ändern, welche Discord-Berechtigung ein Befehl braucht, die Team- und Mitgliederrolle festlegen, auf die sich andere Funktionen stützen, Befehle mit einem Ratelimit versehen und Befehlsnachrichten aufräumen.

Für die schlechten Tage gibt es Massenaktionen: alle bannen oder kicken, die in den letzten Minuten beigetreten sind, nach Namensmuster, nach Rolle oder nach Avatar bannen, inaktive Mitglieder bereinigen und einen Serverwiederherstellungs-Ablauf, der einem verifizierten Owner eine Administrator-Rolle zurückgibt.

Alles findest du auf der Seite **Verwaltung** des Dashboards, verteilt auf fünf Tabs: **Übersicht**, **Schutzsysteme**, **Rollen & Berechtigungen**, **Automatisierung & Einstellungen** und **Erweiterte Aktionen**. Fast jede Einstellung hat auch einen Befehl.

## Wofür du es brauchst

- Beitritts-Raids und Bot-Wellen schlagen um 3 Uhr nachts zu, und du willst, dass sie erledigt sind, bevor jemand aufwacht.
- Ein kompromittierter Account pastet denselben Phishing-Link in zehn Kanäle.
- Mitglieder sollen sich Farb-, Regions- oder Benachrichtigungsrollen ohne Hilfe vom Team selbst aussuchen können.
- `ban` soll für Leute mit Nachrichten verwalten statt Mitglieder bannen funktionieren, ohne dass du Discords Rolleneinstellungen anfasst.
- Ein Befehl wird in general gespammt und braucht einen Cooldown.
- Ein abtrünniger Admin hat dem Owner die Rollen entzogen und du brauchst einen Weg zurück.

## Strafen

Jedes Schutzsystem hat eine **Strafaktion**. Manche Aktionen brauchen zusätzlich eine **Dauer** oder eine **Rolle**.

| Aktion | Was passiert |
| --- | --- |
| Mute | Weist die Stummschalt-Rolle des Servers zu (Text und Sprache) |
| ChatMute | Stummschalt-Rolle nur für Text |
| VoiceMute | Schaltet das Mitglied im Sprachkanal per Server stumm |
| Kick | Entfernt das Mitglied; es kann wieder beitreten |
| Softban | Bannt und entbannt sofort wieder, um die letzten Nachrichten zu löschen |
| Ban | Bannt, oder bannt temporär, wenn du eine Dauer angibst |
| Timeout | Nativer Discord-Timeout; braucht eine Dauer, höchstens 28 Tage |
| AddRole | Fügt die gewählte Rolle hinzu, zum Beispiel eine Quarantäne-Rolle |
| RemoveRoles | Entfernt jede Rolle |
| Warn | Fügt über das Moderationsmodul eine Verwarnung hinzu |
| Delete | Löscht nur die auslösende Nachricht und sonst nichts |
| None | Protokolliert den Treffer und unternimmt nichts |

Nur Ban, Mute, ChatMute, VoiceMute, AddRole und Timeout akzeptieren eine Dauer; bei allem anderen wird sie ignoriert. Dauern werden in Minuten angegeben. Das Dashboard erlaubt bis zu 10080 (eine Woche) für Anti-Raid, Anti-Spam, Anti-Massenerwähnung und Anti-Muster, 1440 (einen Tag) für Anti-Massenpost, Anti-Post-Kanal und Anti-Bild-Hash und ein Jahr für Anti-Alt. Strafen werden aus einer Warteschlange nacheinander im Sekundentakt angewendet, und der Grund im Discord-Audit-Log lautet etwa „Raiding Protection“ oder „ImageHash Protection“.

> [!WARNING]
> Anti-Raid, Anti-Alt und Anti-Muster laufen beim Beitritt eines Mitglieds und überspringen die Prüfung komplett, wenn die Aktion Warn ist. Wähle für diese drei Kick, Ban, Timeout oder eine Rolle.

Mitglieder mit der Administrator-Berechtigung sind von jedem nachrichtenbasierten Schutz ausgenommen. Bots werden von den beitrittsbasierten Schutzsystemen und von Anti-Spam ignoriert; die anderen haben einen Schalter **Bots ignorieren**.

## Schutzsysteme

Der Tab **Schutzsysteme** zeigt pro System eine Karte mit einer Schaltfläche **Aktiviert** bzw. **Deaktiviert** und, sobald es aktiviert ist, einer Schaltfläche **Konfigurieren**, die die Einstellungen öffnet. Beim Aktivieren über das Dashboard wird eine Startkonfiguration angewendet; öffne **Konfigurieren** und prüfe die Aktion, bevor du dich darauf verlässt. Der Tab **Übersicht** zeigt, wie viele der sieben Systeme aktiv sind, und listet jedes einzelne auf.

### Anti-Raid

Zählt Mitglieder, die innerhalb eines gleitenden Zeitfensters beitreten. Erreicht die Zahl die **Nutzerschwelle** innerhalb des **Zeitfensters** (Sekunden), werden alle in diesem Schwall Gezählten gemeinsam bestraft. Der Befehl nimmt eine Schwelle von 2 bis 30 und ein Zeitfenster von 2 bis 300 Sekunden; das Dashboard akzeptiert 1 bis 50 und 1 bis 300. AddRole wird hier nicht unterstützt. Beitretende Bots werden nicht mitgezählt.

> [!EXAMPLE]
> `antiraid 10 10 Ban` bannt alle, wenn zehn Accounts innerhalb von zehn Sekunden beitreten. `antiraid 10 10 Timeout 1h` setzt sie stattdessen für eine Stunde in den Timeout.

### Anti-Spam

Zählt aufeinanderfolgende identische Nachrichten eines Mitglieds, ohne Beachtung der Groß- und Kleinschreibung. Erreicht die Zahl die **Nachrichtenschwelle** (2 bis 10 mit dem Befehl, 1 bis 20 im Dashboard), wird das Mitglied bestraft und der Zähler zurückgesetzt. Eine andere Nachricht setzt den Zähler zurück; jede gezählte Nachricht fällt nach dreißig Minuten heraus. Kanäle auf der Liste der **ignorierten Kanäle** werden übersprungen, was sich für Bot-Befehlskanäle anbietet. Mit `antispam <count> <action> <role>` und AddRole vergibst du stattdessen eine Rolle.

### Anti-Alt

Prüft das Alter jedes beitretenden Accounts. Accounts, die jünger als das **Mindestalter** sind (in Minuten; `antialt 3d Kick` funktioniert auch), werden auf der Stelle bestraft. Es läuft nur beim Beitritt, ein Aktivieren scannt also keine bestehenden Mitglieder. Der Startwert im Dashboard ist 1440 Minuten, also ein Tag.

### Anti-Massenerwähnung

Zählt Nutzer- und Rollenerwähnungen. Eine einzelne Nachricht mit mindestens der **Erwähnungsschwelle** wird sofort bestraft. Darunter werden Erwähnungen pro Mitglied über das **Zeitfenster** (Sekunden) aufsummiert, und das Überschreiten von **Max. Erwähnungen im Zeitfenster** löst die Strafe aus. **Bots ignorieren** legt fest, ob Bot-Nachrichten zählen.

### Anti-Muster

Bewertet jedes neue Mitglied nach Anzeichen für einen Wegwerf- oder Bot-Account und bestraft, wenn die Punktzahl die **Mindestpunktzahl** erreicht. Es läuft beim Beitritt und betrachtet den Account, nicht die Nachrichten.

| Signal | Punkte | Einstellung |
| --- | --- | --- |
| Account wurde innerhalb des Höchstalters erstellt | 5 | **Kontoalter prüfen**, **Max. Kontoalter (Monate)** |
| Kurz nach der Account-Erstellung beigetreten | 10 bei unter einer Stunde, 7 bei unter sechs Stunden, sonst 3 | **Beitrittszeitpunkt prüfen**, **Max. Beitrittsstunden** |
| Andere Mitglieder wurden in derselben Stunde erstellt | 1 pro Account, bis zu 10 | **Massenerstellung prüfen** |
| Account wird beim Beitritt als offline angezeigt | 2 | **Offline-Status prüfen** |
| Account jünger als die Grenze für neue Accounts | 3 | **Neue Konten prüfen**, **Tage für neue Konten** |
| Benutzername passt auf eines deiner Regex-Muster | 15 | Muster mit **Benutzernamen prüfen** |
| Anzeigename passt auf eines deiner Muster | 12 | Muster mit **Anzeigenamen prüfen** |

Ein Mustertreffer bestraft, sobald die laufende Punktzahl mindestens der Mindestpunktzahl entspricht; auch die anderen Signale allein können sie erreichen. Muster sind reguläre Ausdrücke, die ohne Beachtung der Groß- und Kleinschreibung gegen den kleingeschriebenen Namen geprüft werden. Die Startwerte im Dashboard sind Mindestpunktzahl 15, sechs Monate, 48 Stunden, sieben Tage und alle Prüfungen an. Im Dashboard öffnet die Schaltfläche **Muster** auf der Karte die Musterliste, in der jedes Muster einen Namen, den Regex und die zwei Namens-Kontrollkästchen hat.

Mit Befehlen fügt `patternadd <regex> [name] [checkUsername] [checkDisplayName]` eines hinzu, und `patternconfig <setting> <value>` passt `accountage`, `maxaccountage`, `jointiming`, `maxjoinhours`, `batchcreation`, `offlinestatus`, `newaccounts`, `newaccountdays` oder `minimumscore` an. `patternconfig` allein zeigt die aktuellen Werte und wie oft das System ausgelöst hat.

### Anti-Massenpost

Erwischt ein Mitglied, das denselben oder ähnlichen Inhalt in kurzer Folge in mehrere Kanäle postet, das klassische „Scam-Link überall einfügen“-Muster, das Anti-Spam übersieht, weil die Nachrichten verteilt sind.

Für jedes Mitglied merkt sich der Bot die letzten fünfzig Nachrichten innerhalb des **Zeitfensters** (10 bis 600 Sekunden). Eine Nachricht wird mit den früheren verglichen und gilt als ähnlich, wenn sie nach Editierdistanz zu mindestens 80 % übereinstimmt, ohne Beachtung der Groß- und Kleinschreibung. Gibt es ähnliche Nachrichten in mindestens der **Kanalschwelle** (2 bis 20) verschiedener Kanäle, wird das Mitglied bestraft. Nachrichten mit weniger als zwanzig Zeichen werden ignoriert.

**Nur Links prüfen** ist standardmäßig an: Es werden überhaupt nur Nachrichten mit einem Link verfolgt. Ignorierte Nutzer, Rollen und Kanäle werden berücksichtigt. Standardmäßig wird die auslösende Nachricht gelöscht und das Mitglied erhält eine DM mit der Begründung.

### Anti-Post-Kanal

Richtet **Honeypot-Kanäle** ein. Markiere einen oder mehrere Kanäle, in denen echte Mitglieder nichts zu posten haben, meist versteckt weit unten in der Kanalliste mit einem Warnnamen. Alles, was dort postet, wird als Bot oder kompromittierter Account behandelt: Die Nachricht wird gelöscht, der Poster erhält eine DM und die Strafe wird angewendet. Administratoren sind ausgenommen, und du kannst **ignorierte Rollen** und **ignorierte Nutzer** (per ID) hinzufügen.

Der Bot hält außerdem ein **Status-Embed** in einem Statuskanal aktuell: dem Kanal, in dem du `antipostchannel` ausgeführt hast, oder, wenn du es im Dashboard aktivierst, dem ersten Honeypot-Kanal, der jemanden erwischt. Das Embed zeigt die Aktion, die Anzahl der Honeypot-Kanäle, die Gesamtzahl der Treffer und die zehn zuletzt erwischten Mitglieder.

### Anti-Bild-Hash

Blockiert bestimmte Bilder anhand ihres Aussehens, sodass auch ein erneuter Upload trifft, der skaliert, neu komprimiert, aufgehellt, gespiegelt oder mit einem Rahmen versehen wurde. Jedes blockierte Bild wird als Wahrnehmungs-Hash zusammen mit seinem Spiegelbild und, falls es einen einfarbigen Rahmen hat, einer Kopie ohne Rahmen gespeichert. Gepostete Anhänge (und Embeds, wenn **Eingebettete Bilder prüfen** an ist) werden genauso gehasht und verglichen.

- **Übereinstimmungstoleranz** (0 bis 64, Standard 31) bestimmt, wie stark sich ein gepostetes Bild unterscheiden darf und trotzdem zählt. Senke sie, wenn ein harmloses Bild erwischt wird; erhöhe sie nur, wenn Scams durchrutschen.
- **Kopien mit Rahmen erkennen** entfernt vor dem Abgleich einen einfarbigen Rahmen von einem geposteten Bild. Gespiegelte Kopien werden immer erkannt.
- Bilder, die zu schlicht sind, um zuverlässig identifiziert zu werden, werden nie abgeglichen und nie als Blockierung akzeptiert, weil sie auf unbeteiligte Bilder passen würden.
- Bilder über 8 MB werden weder heruntergeladen noch gehasht. Das Limit lässt sich über die API zwischen 1 und 32 MB einstellen, aber weder die Dashboard-Karte noch ein Befehl bietet es an.
- Jedes blockierte Bild kann eine eigene Aktion, Dauer und Rolle haben, die den Systemstandard überschreiben. **Nur löschen** entfernt das Bild, ohne den Poster zu bestrafen.
- Ignorierte Rollen und Kanäle werden übersprungen; der Poster erhält standardmäßig eine DM.

**Bekannte Scam-Bilder blockieren** schaltet eine mit dem Bot gelieferte Voreinstellungsliste ein, derzeit die gefälschten Krypto-Casino- und MrBeast-Gewinnspiel-Bilder, die auf Discord kursieren. Die Karte zeigt, wie viele Bilder auf der Liste stehen und wie viele Beiträge sie auf deinem Server erkannt hat.

Um ein eigenes Bild im Dashboard zu blockieren, lade die Datei hoch oder lege sie ab, oder füge ihre URL ein, gib ein Label an, wähle optional eine Aktion pro Bild und speichere. Mit Befehlen führst du `blockimage [action] [name]` aus und hängst dabei das Bild an, antwortest auf eine Nachricht, die es enthält, oder fügst den Link ein. `blockedimages` listet alles mit Trefferzahlen auf, `unblockimage <id>` entfernt eines, und `imagehash` zeigt den Hash eines Bildes, ohne es zu blockieren.

> [!TIP]
> Schalte zuerst Anti-Post-Kanal und die Liste bekannter Scam-Bilder ein. Keines von beiden erzeugt im normalen Chat Fehlalarme, und zusammen erwischen sie die meisten automatisierten Scam-Aktivitäten.

### Anti-Externe-App

Mitglieder können Apps zu ihrem eigenen Discord-Account hinzufügen und in jedem Server nutzen, sogar in einem, dem die App nie hinzugefügt wurde. Nachrichten dieser Apps erscheinen unter dem Namen der App, sodass die anderen Schutzsysteme, die darauf schauen, wer eine Nachricht gesendet hat, das Mitglied dahinter nie sehen. Anti-Externe-App liest, welches Mitglied die App ausgeführt hat, und geht gegen dieses vor.

Eine Nachricht zählt als Verstoß, wenn sie:

- mindestens das **Erwähnungslimit** an Nutzern und Rollen erwähnt (Standard 5) oder everyone oder here pingt,
- einen Discord-Einladungslink enthält, während **Einladungslinks entfernen** an ist,
- oder von einem Mitglied stammt, das Apps öfter als **App-Nachrichten erlaubt** innerhalb des Zeitfensters ausgeführt hat (Standard 5 in 10 Sekunden).

Ein Limit auf 0 zu setzen schaltet diese Prüfung aus. Verstößt eine Nachricht gegen eine Regel, wird sie gelöscht, und das Mitglied, das die App ausgeführt hat, erhält die Strafe, standardmäßig einen einstündigen Timeout. **Nur löschen** entfernt die Nachricht, ohne jemanden zu bestrafen. Apps, die dem Server selbst hinzugefügt wurden, bleiben unberührt, ebenso Server-Administratoren.

> [!TIP]
> Discords Berechtigung **Externe Apps verwenden** ist ein guter Partner dafür. Mitglieder ohne sie können ihre Apps weiterhin nutzen, aber nur sie selbst sehen die Antworten. Verweigere sie für `@everyone` und erlaube sie einer vertrauenswürdigen oder durch Level verdienten Rolle, dann können neue oder Wegwerf-Accounts gar nicht über Apps posten.

## Rollen

Diese Karten findest du im Tab **Rollen & Berechtigungen**.

### Rollen automatisch zuweisen

Rollen, die jedes Mitglied im Moment des Beitritts erhält, mit einer separaten Liste für Bots. Mitglieder, die noch das Mitglieder-Screening durchlaufen, erhalten ihre Rollen, sobald sie freigegeben sind. Ist Rollenzustände so eingestellt, dass die automatische Zuweisung für Mitglieder mit gespeichertem Rollenzustand übersprungen wird, behalten zurückkehrende Mitglieder stattdessen ihre alten Rollen. `autoassignrole <role>` schaltet eine Rolle in der Liste um; allein ausgeführt zeigt es die Liste.

### Selbst zuweisbare Rollen

Rollen, die sich Mitglieder mit `iam <role>` selbst geben und mit `iamnot <role>` wieder abgeben können. Rollen werden in nummerierte **Gruppen** einsortiert (Gruppe 0 ist „Ohne Gruppe“), und Gruppen können Namen bekommen. Der **Exklusivmodus** ist ein serverweiter Schalter: Ist er an, entfernt das Nehmen einer Rolle aus einer Gruppe jede andere Rolle derselben Gruppe, die du hältst, ideal für Farben oder Regionen. Eine Rolle kann ein minimales XP-**Level** voraussetzen. **iam-Nachrichten entfernen** löscht nach drei Sekunden sowohl den Befehl als auch die Antwort, um den Kanal sauber zu halten.

### Reaktionsrollen

Verknüpfe Emojis mit Rollen auf einer bestehenden Nachricht. Mitglieder klicken auf das Emoji, um die Rolle zu erhalten, und entfernen es, um sie zu verlieren. Jede Nachricht lässt sich als **Exklusiv** markieren, sodass ein Mitglied nur eine Rolle davon haben kann. Discord erlaubt zwanzig Reaktionen pro Nachricht, und das Dashboard zählt sie für dich. Das Hinzufügen zu einer Nachricht, die bereits Reaktionsrollen hat, erweitert die bestehende Einrichtung.

Mit Befehlen richtet `reactionroles [messageId] [excl] <role> <emoji> ...` Paare ein; lässt du die Nachrichten-ID weg, wird die Nachricht direkt über deinem Befehl verwendet. `reactionroleslist` zeigt jede Einrichtung mit einem Index, und `reactionrolesremove <index>` löscht eine.

### Sprachkanal-Rollen

Binde eine Rolle an einen Sprachkanal. Mitglieder erhalten die Rolle, wenn sie dem Kanal beitreten, und verlieren sie beim Verlassen. Nutze es, um einen Textkanal nur für Leute zu öffnen, die gerade in einem Anruf sind.

### Auto-Bann-Rollen

Jede Rolle in dieser Liste ist ein Stolperdraht: In dem Moment, in dem ein Mitglied sie erhält, wird es gebannt. Der Grund lautet standardmäßig „Auto-ban role assigned“, außer du legst mit `autobanrolereason` einen fest. Kombiniere es mit einer Reaktionsrolle auf einer versteckten Nachricht, um sich selbst zuweisende Bots zu erwischen. Die Anzahl der gelöschten Nachrichtentage richtet sich nach der Bann-Bereinigungseinstellung des Moderationsmoduls.

## Berechtigungs-Überschreibungen und Befehlsberechtigungen

**Berechtigungs-Überschreibungen** ersetzen die Discord-Berechtigung, die ein Befehl normalerweise prüft. Füge eine Überschreibung für `ban` hinzu, die Nachrichten verwalten verlangt, und jeder mit Nachrichten verwalten kann ihn ausführen; füge eine hinzu, die Administrator verlangt, und nur Administratoren können es. Sind mehrere Berechtigungen aufgeführt, braucht der Nutzer alle. Mit Befehlen legt `dpo <command> <permission> [permission...]` eine fest, `dpo <command>` ohne Berechtigungen entfernt sie, `dpol` listet sie auf und `dpor` löscht nach einer Bestätigung alles. Namen eigener Chat-Trigger werden ebenfalls akzeptiert.

Die Karte **Befehlsberechtigungen** im selben Tab ist das regelbasierte Befehlsberechtigungssystem: einen Befehl, ein Modul oder alles für einen Nutzer, eine Rolle, einen Kanal, eine Kategorie oder den ganzen Server erlauben oder verbieten, von oben nach unten ausgewertet. Dafür gibt es einen eigenen Artikel, siehe `permissions`.

## Servereinstellungen

Diese Karten findest du im Tab **Automatisierung & Einstellungen**.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| **Teamrolle** | keine | Die Rolle, die andere Funktionen als Team behandeln |
| **Mitgliederrolle** | keine | Die Rolle, die als „Mitglied“ behandelt wird; `prunemembers` kann Leute mit ihr einschließen |
| **Server-Zeitzone** | UTC | Zeitzone, die überall verwendet wird, wo der Bot lokale Zeiten ausgibt |
| **Befehls-Cooldowns** | keine | Ratelimit pro Befehl in Sekunden, 1 bis 90.000 |
| **Berechtigungs-Überschreibungen** | keine | Discord-Berechtigung, die jeder Befehl verlangt (siehe oben) |
| **Spiel-Sprachkanal** | keiner | Wenn ein Mitglied in diesem Sprachkanal ein Spiel startet, verschiebt der Bot es in den Sprachkanal, dessen Name zum Spiel passt |
| **Nachricht bei Befehl löschen** | aus | Löscht die auslösende Nachricht, nachdem ein Befehl ausgeführt wurde, mit Überschreibungen pro Kanal: Aktiviert, Deaktiviert oder Erben |
| **Statistik-Opt-out** | Teilnahme aktiv | Stoppt die Befehlsnutzungsstatistik für diesen Server; **Statistiken löschen** entfernt das Gespeicherte |

## Erweiterte Aktionen

Der Tab **Erweiterte Aktionen** enthält drei Karten. Jede Massenaktion fragt nach einer Bestätigung und läuft dann ohne weitere Prüfungen.

### Eigene Bannnachricht

Die Nachricht, die ein Mitglied per DM erhält, wenn es gebannt wird, erstellt im Embed-Editor. Es ist dieselbe Vorlage, die der Bann-Befehl des Moderationsmoduls verwendet.

### Serverwiederherstellung

Eine Möglichkeit, dem Owner eine Administrator-Rolle zurückzugeben, nachdem ein kompromittierter Admin sie entfernt hat. Für den Server werden zwei Geheimnisse gespeichert: ein **Wiederherstellungsschlüssel** und ein **Zwei-Faktor-Schlüssel**.

- Führst du als Server-Owner `/serverrecovery server-recover` aus, wenn nichts eingerichtet ist, werden beide erzeugt: ein Wiederherstellungsschlüssel, der dir per DM geschickt wird, und ein Authenticator-Geheimnis, das als QR-Code angezeigt wird. Bestätige mit einem Code aus deiner Authenticator-App, um abzuschließen.
- Nach der Einrichtung erhält jeder, der `/serverrecovery server-recover` ausführt, den Wiederherstellungsschlüssel und danach einen gültigen Authenticator-Code eingibt, eine neue Rolle namens „Recovered Server Owner Role“ mit Administrator, platziert direkt unter der höchsten Rolle des Bots.
- `/serverrecovery clear-server-recover` löscht die gespeicherten Schlüssel nach einer Bestätigung, ebenso **Wiederherstellung entfernen** im Dashboard.

Die Dashboard-Karte kann Schlüssel auch direkt speichern: Generiere oder tippe einen Wiederherstellungsschlüssel mit mindestens sechzehn Zeichen und einen Zwei-Faktor-Schlüssel. Der Bot prüft Codes gegen diesen Zwei-Faktor-Schlüssel als Authenticator-Geheimnis (TOTP), gib also ein Base32-Geheimnis ein, das du in eine Authenticator-App aufgenommen hast, und kein einfaches Passwort.

> [!PERMISSION]
> Der Bot selbst braucht für die Wiederherstellung Administrator, und seine höchste Rolle muss so hoch liegen, dass eine Rolle direkt darunter die Leute, von denen du wiederherstellst, immer noch überragt.

### Massenaktionen

| Aktion | Was sie macht |
| --- | --- |
| **Inaktive Nutzer bereinigen** | Discords Mitglieder-Bereinigung für Mitglieder, die die angegebene Anzahl Tage inaktiv waren (1 bis 30) |
| **Nutzer massenhaft bannen** | Bannt eine eingefügte Liste von Nutzer-IDs mit einem Grund; das Löschen von Nachrichten richtet sich nach der Bann-Bereinigungseinstellung des Moderationsmoduls |
| **Nutzer massenhaft umbenennen** | Setzt den Nickname jedes Mitglieds auf ein Muster, in dem `{username}` durch den Benutzernamen ersetzt wird, zum Beispiel `[AFK] {username}`; Mitglieder, die der Bot nicht umbenennen kann, werden übersprungen |
| **Bis zu Nachricht bereinigen** | Löscht in einem Kanal jede Nachricht nach einer angegebenen Nachrichten-ID, eine nach der anderen |

Die Befehle bieten weitere Wege, auszuwählen, wer gebannt wird: `banunder 10m` bannt alle, die in den letzten zehn Minuten beigetreten sind (`-p` zeigt vorher eine Vorschau der Liste, `-accage 1d` verlangt zusätzlich, dass der Account jünger als einen Tag ist), `kickunder` macht dasselbe mit einem Kick, `nameban <regex>` bannt nach einer Vorschau Benutzernamen, die auf ein Muster passen, `baninrole <role>` bannt alle, die eine Rolle halten, und `banbyhash <avatarHash>` bannt jedes Mitglied mit einem bestimmten Avatar. Bei allen musst du bestätigen.

## Einrichtung Schritt für Schritt

1. Öffne **Verwaltung** im Dashboard und gehe zu **Schutzsysteme**.
2. Aktiviere **Anti-Raid**, drücke **Konfigurieren** und stelle eine Schwelle und ein Zeitfenster ein, die zu deiner normalen Beitrittsrate passen. Wähle Kick oder Ban als Aktion.
3. Erstelle einen versteckten Kanal, in den nur Bots posten würden, aktiviere **Anti-Post-Kanal** und füge ihn unter **Honeypot-Kanäle** hinzu.
4. Aktiviere **Anti-Bild-Hash** und drücke **Bekannte Scam-Bilder blockieren**.
5. Aktiviere **Anti-Massenpost** mit den Standardwerten drei Kanäle in sechzig Sekunden und nur Links.
6. Füge unter **Rollen & Berechtigungen** deine Mitgliederrolle unter **Rollen automatisch zuweisen** für normale Nutzer hinzu, richte mit **Selbst zuweisbare Rolle hinzufügen** eine Farbgruppe ein und schalte dann den **Exklusivmodus** ein.
7. Lege unter **Automatisierung & Einstellungen** die **Teamrolle**, die **Mitgliederrolle** und die **Server-Zeitzone** fest.
8. Richte unter **Erweiterte Aktionen** die **Serverwiederherstellung** ein, solange alles ruhig ist.
9. Prüfe die **Übersicht**: Sie listet jedes Schutzsystem auf und zeigt, ob es aktiv ist.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast). Schutzbefehle ohne Argumente deaktivieren das jeweilige System.

### Schutz

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `antiraid [threshold] [seconds] [action] [duration]` | | Administrator | Anti-Raid konfigurieren oder deaktivieren |
| `antispam [count] [action] [duration or role]` | | Administrator | Anti-Spam konfigurieren oder deaktivieren |
| `antialt [minAge] [action] [duration or role]` | | Administrator | Anti-Alt konfigurieren oder deaktivieren |
| `antimassmention [threshold] [window] [max] [ignoreBots] [action] [duration or role]` | `amm`, `massmention`, `stopmassmention` | Administrator | Anti-Massenerwähnung konfigurieren oder deaktivieren |
| `antipattern [action] [duration or role]` | `apattern` | Administrator | Anti-Muster konfigurieren oder deaktivieren |
| `patternadd <regex> [name] [checkUsername] [checkDisplayName]` | `padd` | Administrator | Ein Namensmuster hinzufügen |
| `patternremove <id>` | `premove`, `prem` | Administrator | Ein Muster per ID entfernen |
| `patternlist` | `plist` | Administrator | Muster auflisten |
| `patternconfig [setting] [value]` | `pconfig` | Administrator | Bewertungseinstellungen von Anti-Muster anzeigen oder ändern |
| `antimasspost [channels] [seconds] [action] [duration]` | | Administrator | Anti-Massenpost konfigurieren oder deaktivieren |
| `antipostchannel [action] [duration]` | | Administrator | Honeypot-Kanäle konfigurieren oder deaktivieren; der aktuelle Kanal wird zum Statuskanal |
| `antipostchanneladd <#channel>` | | Administrator | Einen Honeypot-Kanal hinzufügen |
| `antipostchannelremove <#channel>` | | Administrator | Einen Honeypot-Kanal entfernen |
| `antiimagehash [action] [tolerance] [duration]` | `aih` | Administrator | Anti-Bild-Hash konfigurieren oder deaktivieren |
| `antiexternalapp [action] [mentions] [messages] [duration]` | `aea`, `antiuserapp` | Administrator | Anti-Externe-App konfigurieren oder deaktivieren |
| `blockimage [action] [name]` | `banimage` | Administrator | Das angehängte, beantwortete oder verlinkte Bild blockieren |
| `unblockimage <id>` | `unbanimage` | Administrator | Ein blockiertes Bild entfernen |
| `blockedimages` | `blockedimagelist` | Administrator | Blockierte Bilder mit Trefferzahlen auflisten |
| `imagehash [url]` | | Administrator | Den Hash eines Bildes anzeigen |
| `antiimagehashpreset` | `aihpreset`, `blockcommonscams` | Administrator | Die Liste bekannter Scam-Bilder umschalten |
| `antiimagehashignore <role or #channel>` | `aihignore` | Administrator | Eine Ausnahme für eine Rolle oder einen Kanal umschalten |

### Rollen

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `autoassignrole [role]` | `aar` | Rollen verwalten | Eine Rolle beim Beitritt umschalten oder sie auflisten |
| `autoassignbotrole [role]` | `aabr` | Rollen verwalten | Dasselbe für Bots |
| `asar [group] <role>` | | Rollen verwalten | Eine Rolle selbst zuweisbar machen, optional in einer Gruppe |
| `rsar <role>` | | Rollen verwalten | Eine selbst zuweisbare Rolle entfernen |
| `lsar` | | Niemand | Selbst zuweisbare Rollen nach Gruppe auflisten |
| `sargn <group> [name]` | | Rollen verwalten | Eine Gruppe benennen oder ihren Namen löschen |
| `togglexclsar` | `tesar` | Rollen verwalten | Den Exklusivmodus umschalten |
| `rolelevelreq <level> <role>` | `rlr` | Rollen verwalten | Ein XP-Level für eine Rolle verlangen |
| `adsarm` | | Nachrichten verwalten | Das Löschen von `iam`-Nachrichten umschalten |
| `iam <role>` | | Niemand | Dir selbst eine selbst zuweisbare Rolle geben |
| `iamnot <role>` | `iamn` | Niemand | Eine entfernen |
| `reactionroles [messageId] [excl] <role> <emoji>...` | `rero` | Rollen verwalten | Reaktionsrollen auf einer Nachricht einrichten |
| `reactionroleslist` | `reroli` | Rollen verwalten | Reaktionsrollen-Einrichtungen auflisten |
| `reactionrolesremove <index>` | `rerorm` | Rollen verwalten | Eine Einrichtung per Index entfernen |
| `vcrole [voiceChannel] [role]` | | Rollen verwalten | Eine Rolle an einen Sprachkanal binden (an deinen aktuellen, falls weggelassen); ohne Rolle wird die Bindung entfernt |
| `vcrolerm <channelId>` | | Rollen verwalten | Eine Bindung per Kanal-ID entfernen |
| `vcrolelist` | | Niemand | Sprachkanal-Rollen auflisten |
| `autobanroleadd <role>` | `abra` | Administrator | Eine Stolperdraht-Rolle hinzufügen |
| `autobanroleremove <role>` | `abrr` | Administrator | Eine entfernen |
| `autobanrolelist` | `abrl` | Administrator | Stolperdraht-Rollen und Gründe auflisten |
| `autobanrolereason <role> [reason]` | `abreason` | Administrator | Den Bann-Grund anzeigen, festlegen oder löschen |
| `setrole <role> <user> [time]` | `sr`, `giverole` | Rollen verwalten | Eine Rolle vergeben, optional zeitlich begrenzt |
| `removerole <role> <user>` | `rr` | Rollen verwalten | Eine Rolle entfernen |
| `removeallroles <user>` | `rar` | Rollen verwalten | Jede Rolle entfernen |
| `createrole [name]` | `cr` | Rollen verwalten | Eine Rolle erstellen |
| `deleterole <role>` | `dr` | Rollen verwalten | Eine Rolle löschen |
| `renamerole <role> <name>` | `renr` | Rollen verwalten | Eine Rolle umbenennen |
| `rolehoist <role>` | `rh` | Rollen verwalten | Umschalten, ob die Rolle separat angezeigt wird |
| `rolecolor <role> [color]` | `roleclr` | Niemand zum Ansehen, Rollen verwalten zum Setzen | Die Farbe einer Rolle anzeigen oder setzen |

Die `autobanrole`-Befehle gibt es auch als Slash-Befehle `/autobanrole list`, `add`, `remove` und `reason`.

### Berechtigungen und Einstellungen

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `dpo <command> [permission...]` | | Administrator | Eine Berechtigungs-Überschreibung setzen oder entfernen |
| `dpol` | `dpoli` | Administrator | Überschreibungen auflisten |
| `dpor` | | Administrator | Alle Überschreibungen löschen |
| `staffrole [role]` | | Administrator | Die Teamrolle anzeigen oder setzen |
| `staffroledisable` | | Administrator | Die Teamrolle löschen |
| `memberrole <role>` | | Administrator | Die Mitgliederrolle anzeigen oder setzen |
| `delmsgoncmd [list, server, or channel <enable, disable, inherit> [#channel]]` | `dmc` | Administrator | Das Löschen von Befehlsnachrichten anzeigen, umschalten oder überschreiben |
| `gamevoicechannel` | `gvc` | Administrator | Deinen aktuellen Sprachkanal als Spiel-Sprachkanal umschalten |
| `timezone [id]` | | Niemand zum Ansehen, Administrator zum Setzen | Die Server-Zeitzone anzeigen oder setzen |
| `timezones` | | Niemand | Verfügbare Zeitzonen-IDs auflisten |
| `prefix [new]` | | Niemand zum Ansehen, Administrator zum Setzen | Das Befehlspräfix anzeigen oder ändern |
| `languageset <name>` | `langset` | Administrator | Die Serversprache setzen, oder `default` |
| `langsetdefault [name]` | `langsetd` | Niemand zum Ansehen, Bot-Owner zum Setzen | Die botweite Standardsprache anzeigen oder setzen |
| `languageslist` | `langli` | Niemand | Unterstützte Sprachen auflisten |
| `guildstatsoptout` | `gstatsoptout` | Administrator | Befehlsstatistiken für diesen Server umschalten |
| `deleteguildstatsdata` | `delguildstatsdata` | Administrator | Gespeicherte Statistiken löschen, einmal pro Stunde |

### Massenaktionen und Hilfsbefehle

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `banunder <time> [-p or -accage <time>]` | | Administrator | Alle bannen, die innerhalb der Zeit beigetreten sind |
| `kickunder <time> [-p]` | | Administrator | Alle kicken, die innerhalb der Zeit beigetreten sind |
| `nameban <regex>` | `nban` | Administrator | Mitglieder bannen, deren Benutzername passt, mit Vorschau |
| `baninrole <role> [reason]` | | Administrator | Alle bannen, die eine Rolle halten |
| `banbyhash <avatarHash>` | `bbh` | Administrator | Alle mit einem bestimmten Avatar-Hash bannen |
| `prunemembers <time> [yes]` | `memberprune` | Administrator | Mitglieder bereinigen, die so viele Tage inaktiv waren; `yes` schließt die Mitgliederrolle ein |
| `setnick [user] <nickname>` | | Nicknamen verwalten | Den Nickname eines Mitglieds oder des Bots selbst ändern |
| `deafen <users...>` | `deaf` | Deafen Members | Per Server taub schalten |
| `undeafen <users...>` | `undef` | Deafen Members | Rückgängig machen |
| `creatxtchanl <name>` | `ctch` | Kanäle verwalten | Einen Textkanal erstellen |
| `deltxtchanl <#channel>` | `dtch` | Kanäle verwalten | Einen Textkanal löschen |
| `creatvoichanl <name>` | `cvch` | Kanäle verwalten | Einen Sprachkanal erstellen |
| `delvoichanl <channel>` | `dvch` | Kanäle verwalten | Einen Sprachkanal löschen |
| `settopic [topic]` | `st` | Kanäle verwalten | Das Thema des aktuellen Kanals setzen |
| `setchanlname <name>` | `schn` | Kanäle verwalten | Den aktuellen Kanal umbenennen |
| `renamechannel <channel> <name>` | `channelrename` | Kanäle verwalten | Einen beliebigen Kanal umbenennen |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Kanäle verwalten | Die NSFW-Markierung des aktuellen Kanals umschalten |
| `edit [#channel] <messageId> <text>` | | Nachrichten verwalten in diesem Kanal | Eine Nachricht des Bots bearbeiten |
| `delete [#channel] <messageId> [time]` | `del` | Nachrichten verwalten in diesem Kanal | Eine Nachricht sofort oder nach einer Verzögerung von bis zu sieben Tagen löschen |
| `setguildavatar [url]` | `sgav`, `setgav` | Server verwalten | Das Server-Icon aus einer URL oder einem Anhang setzen |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Server verwalten | Das Server-Banner setzen |
| `setguildbio <text>` | `sgbio`, `setgbio` | Server verwalten | Die Serverbeschreibung setzen |

Die Serverwiederherstellung gibt es nur als Slash-Befehl: `/serverrecovery server-recover` und `/serverrecovery clear-server-recover`. Die meisten der übrigen Befehle oben haben ebenfalls Slash-Entsprechungen unter `/protection`, `/administration`, `/channel`, `/purge-members`, `/delmsgoncmd`, `/voice`, `/perm-override` und `/roles`.

### Logging- und Begrüßungsbefehle

Das Modul enthält außerdem die Logging-Befehle (`log`, `logcategory`, `logevents`, `logignore`, `logignorelist`, `commandlogchannel`, alle Administrator, plus die `/log`-Slash-Gruppe) und die klassischen Begrüßungsbefehle (`greetdm`, `greetdmmsg`, `greetdmtest`, `bye`, `byemsg`, `byedel`, `byetest`, `leavehook`, `boost`, `boostmsg`, `boostdel`, `boosttest`, alle Server verwalten). Sie sind in den Artikeln `logging` und `multigreets` dokumentiert.

## Tipps und Stolperfallen

- Die Rolle des Bots muss über jeder Rolle liegen, die er vergibt, entfernt oder über der er bannt, und er braucht Mitglieder bannen, Mitglieder kicken, Rollen verwalten oder Mitglieder moderieren passend zu den gewählten Strafen. Mute-Aktionen brauchen eine Stummschalt-Rolle, die der Bot bei der ersten Verwendung erstellt.
- Befehle akzeptieren für die Dauern von Anti-Raid und Anti-Spam nur bis zu einem Tag (`1d`), und Timeout kann nie 28 Tage überschreiten.
- Anti-Spam zählt nur identische Wiederholungen. Ein Mitglied, das schnell zehn verschiedene Nachrichten sendet, ist für es kein Spam; dafür sind Anti-Massenpost und Anti-Massenerwähnung da.
- Anti-Massenpost mit **Nur Links prüfen** ignoriert alles ohne Link. Schalte es aus, um Copypasta zu erwischen, auf Kosten von mehr Fehlalarmen in belebten Servern.
- Die Massenerstellungs-Prüfung von Anti-Muster ruft bei jedem Beitritt die komplette Mitgliederliste ab, was in sehr großen Servern langsam ist.
- Ein blockiertes Bild, das aus einem Hash statt aus dem Bild selbst hinzugefügt wurde, erwischt nur exakte Kopien; füge es erneut aus dem Bild hinzu, um gespiegelte und gerahmte Versionen abzudecken.
- Das Aktivieren eines Schutzes über das Dashboard wendet Startwerte an. Öffne **Konfigurieren** und bestätige die Aktion, besonders bevor du Ban wählst.
- Befehle zum automatischen Zuweisen, Selbstzuweisen und für Reaktionsrollen lehnen Rollen ab, die auf oder über deiner höchsten Rolle liegen, außer du bist der Owner.
- Reaktionsrollen gehen verloren, wenn die Nachricht gelöscht wird; `reactionroleslist` zeigt, welche Einrichtungen auf eine gelöschte Nachricht verweisen.
- Die Massen-Umbenennung betrifft jedes Mitglied, das der Bot umbenennen kann, auch Teammitglieder unterhalb seiner Rolle. Überlege dir einen Plan, um sie zurückzubenennen.
- `delete` und `edit` funktionieren nur bei Nachrichten, die der Bot sehen kann, und `edit` nur bei den eigenen Nachrichten des Bots.

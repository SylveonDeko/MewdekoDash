---
title: Spiele
slug: games
summary: Chat-Spiele, die Mitglieder in jedem Kanal starten können, von Trivia, Galgenmännchen und Wortketten über Tipprennen und Acrophobia bis zu Umfragen.
icon: fa-gamepad-modern
category: Entertainment
module: Games
tags: [games, trivia, hangman, kaladont, nunchi, typing race, acrophobia, tic tac toe, poll, vote, 8ball, choose, Spiele, Galgenmännchen, Tipprennen, Tic-Tac-Toe, Umfrage, Abstimmung, Magic 8-Ball, auswählen]
related: [polls, currency, xp, searches, utility]
---

## Was es macht

Spiele werden in dem Kanal gespielt, in dem sie gestartet werden. Ein Mitglied führt einen Befehl aus, der Bot postet das Spiel, und alle im Kanal spielen, indem sie Antworten eintippen oder Buttons drücken. Pro Kanal (bei Nunchi und Kaladont pro Server) läuft jeweils nur ein Spiel jeder Art gleichzeitig, und die meisten Spiele lassen sich mit einem passenden Stopp-Befehl vorzeitig beenden.

Trivia, Galgenmännchen, Kaladont, Nunchi, das Tipprennen, Acrophobia und Tic-Tac-Toe sind Mehrspieler-Spiele. Mit Umfragen kann das Team dem Kanal eine Frage mit Buttons oder einem Auswahlmenü stellen. `choose` und `8ball` sind einmalige Spielereien.

Für dieses Modul gibt es keine Dashboard-Seite. Alles wird über Befehle erledigt, und die meisten brauchen gar keine Berechtigung.

## Wofür du es verwenden würdest

- Einen ruhigen Abend mit einer Runde Trivia oder Galgenmännchen auflockern.
- Ein Tipprennen oder ein Kaladont-Turnier als Community-Event veranstalten.
- Dem Server eine schnelle Ja-oder-Nein-Frage stellen oder eine Umfrage mit mehreren Optionen und einem Auswahlmenü.
- Einen dauerhaften Kaladont-Kanal einrichten, damit die Wortkette nie abreißt.

## Trivia

`trivia` startet ein Quiz. Der Bot postet eine Frage, zeigt zur Hälfte des Fragen-Timers einen Hinweis, sofern Hinweise nicht ausgeschaltet sind, und das erste Mitglied, das die Antwort eintippt, bekommt einen Punkt. Erreicht ein Mitglied die nötige Punktzahl, endet das Spiel und es gewinnt. Bleiben genug Fragen hintereinander unbeantwortet, stoppt das Spiel.

| Option | Standard | Was sie tut |
| --- | --- | --- |
| `-p`, `--pokemon` | aus | „Wer ist dieses Pokémon?“-Modus |
| `--nohint` | aus | Nie Hinweise anzeigen |
| `-w`, `--win-req` | 10 | Benötigte Punkte zum Gewinnen; 0 für ein endloses Spiel |
| `-q`, `--question-timer` | 30 | Sekunden pro Frage |
| `-t`, `--timeout` | 10 | Unbeantwortete Fragen hintereinander, bevor das Spiel stoppt; 0 für nie |

`tl` zeigt die aktuellen Punktestände und `tq` stoppt das Spiel. Die globale Konfiguration des Bots kann eine Mindestpunktzahl zum Gewinnen und eine Währungsprämie für den Gewinner festlegen.

> [!EXAMPLE]
> `trivia -w 5 -q 20` startet ein kurzes Spiel bis fünf Punkte mit zwanzig Sekunden pro Frage.

## Galgenmännchen

`hangman [type]` wählt ein Wort aus einer Kategorie und zeigt es als Leerstellen an. Mitglieder raten einen einzelnen Buchstaben oder das ganze Wort, indem sie es im Kanal eintippen. Sechs falsche Versuche beenden das Spiel. Die Kategorien sind `countries`, `movies`, `animals`, `things` und `random`; `random` ist der Standard. `hangmanlist` zeigt die auf deinem Server verfügbaren Typen und `hangmanstop` beendet das Spiel.

## Kaladont

Kaladont ist eine Wortkette. Jedes Wort muss mit den letzten beiden Buchstaben des vorherigen Wortes beginnen, und ein Wort kann pro Spiel nur einmal verwendet werden. Die Spieler sind abwechselnd dran, mit einem Zeitlimit pro Zug. Das Wörterbuch kann Englisch oder Serbisch sein, und serbische Digraphen (wie lj und nj) werden als einzelne Buchstaben behandelt.

| Option | Standard | Was sie tut |
| --- | --- | --- |
| `-j`, `--join-time` | 15 | Sekunden, die Spieler zum Beitreten haben, bevor das Spiel beginnt |
| `-t`, `--turn-time` | 30 | Sekunden pro Zug |
| `-m`, `--min-players` | 2 | Benötigte Spieler zum Start |
| `-l`, `--language` | en | `en` oder `sr` |
| `-e`, `--endless` | aus | Lehnt Wörter ab, nach denen kein gültiges Wort für den nächsten Spieler mehr existiert |

`kaladontstop` beendet das aktuelle Spiel. `kaladontsetup` macht den aktuellen Kanal zu einem dauerhaften Kaladont-Kanal, der die Kette mit denselben Sprach- und Endlos-Optionen am Laufen hält, und `kaladontdisable` entfernt ihn. Beides benötigt die Berechtigung Kanäle verwalten.

## Nunchi

`nunchi` erstellt ein Spiel, und andere Mitglieder führen `nunchi` aus, um beizutreten, solange es in der Beitrittsphase ist. In jeder Runde verkündet der Bot eine Zahl, und jeder Spieler muss die nächste Zahl eintippen. Spieler, die sie richtig eintippen, kommen weiter; sind alle bis auf einen weitergekommen, endet die Runde und der verbleibende Spieler scheidet aus. Antwortet niemand rechtzeitig, wird die Runde mit allen neu gestartet, die bereits weitergekommen sind. Der letzte verbleibende Spieler gewinnt.

## Tipprennen

`typestart` zählt herunter (standardmäßig fünf Sekunden; `-s` oder `--start-time` legt 3 bis 30 fest) und postet dann einen Satz. Das erste Mitglied, das ihn nahe genug zurücktippt, gewinnt; ein paar Tippfehler werden toleriert, etwa einer pro 25 Zeichen. Das Ergebnis zeigt Wörter pro Minute und die Fehleranzahl. `typestop` beendet ein Rennen, `typelist` zeigt den Satz-Pool, und Bot-Besitzer können mit `typeadd` und `typedel` Sätze hinzufügen oder löschen.

## Acrophobia

`acrophobia` postet drei bis fünf zufällige Buchstaben. Mitglieder haben die Einreichungszeit (standardmäßig 60 Sekunden, 15 bis 300), um eine Phrase einzureichen, deren Wörter in dieser Reihenfolge mit diesen Buchstaben beginnen, jeweils eine Einreichung pro Person. Danach stimmt jeder während der Abstimmungszeit (standardmäßig 60 Sekunden, 15 bis 120) per Nummer für seinen Favoriten ab. Für den eigenen Beitrag kann man nicht stimmen. Die Timer legst du mit `-s` oder `--submission-time` und `-v` oder `--vote-time` fest.

## Tic-Tac-Toe

`tictactoe` eröffnet ein Spiel; das nächste Mitglied, das den Befehl ausführt, tritt als zweiter Spieler bei. Züge werden im Chat gemacht, und ein Spieler, der länger als der Zug-Timer braucht (standardmäßig 15 Sekunden, `-t` oder `--turn-timer`, 5 bis 60), verliert durch Aufgabe. Das Spiel meldet einen Gewinner oder ein Unentschieden.

## Umfragen

Zum Erstellen von Umfragen wird die Berechtigung Nachrichten verwalten benötigt. Optionen werden mit Semikolons getrennt.

| Befehl | Typ | Verhalten |
| --- | --- | --- |
| `poll <question>` | Ja/Nein | Zwei Buttons |
| `pollc question;option1;option2;...` | Einzelauswahl | Eine Stimme pro Mitglied |
| `pollm question;option1;option2;...` | Mehrfachauswahl | Mitglieder können mehrere Optionen wählen |
| `polla question;option1;option2;...` | Anonym | Die Identität der Abstimmenden bleibt verborgen |

Umfragen mit zwei bis fünf Optionen nutzen Buttons; längere nutzen ein Auswahlmenü mit bis zu 25 Einträgen. Mitglieder können ihre Stimme ändern. Vorlagen speichern eine Frage und ihre Optionen zur Wiederverwendung: `polltemplates` listet sie auf und `polltemplate <name>` postet eine davon. Vorlagen erstellen und löschen, eine Umfrage schließen, aktive Umfragen auflisten und die Statistik einer Umfrage ansehen geht über die Slash-Befehle `/poll` (`create-template`, `delete-template`, `close`, `list`, `stats`) oder über die Umfrage-Seite im Dashboard, die einen eigenen Artikel hat.

## Sonstiges

- `choose a; b; c` wählt zufällig eine Option aus einer Liste mit Semikolons.
- `8ball <question>` antwortet mit einer Antwort aus der Liste in der Spiele-Konfiguration des Bots.
- `linux <word> <word>` postet den Copypasta „I'd just like to interject“ mit den beiden vertauschten Wörtern.
- `dragon` schaltet dein Beta-Tester-Flag um, das manche experimentellen Befehle prüfen.
- `rategirl` existiert nur als Platzhalter mit einem Hinweis, warum er entfernt wurde. Er tut nichts Sinnvolles.

## Einstellungen

Dieses Modul hat keine Dashboard-Seite und keine Einstellungen pro Server. Das Spielverhalten wird über die oben genannten Befehlsoptionen festgelegt. Die Datei `games.yml` in der Konfiguration des Bot-Besitzers enthält die 8-Ball-Antworten sowie die Mindestpunktzahl und Währungsprämie für Trivia.

## Einrichtung Schritt für Schritt

1. Wähle einen Kanal für Spiele oder erstelle einen, damit die Spielnachrichten die Unterhaltung nicht überschwemmen.
2. Wenn du eine dauerhafte Wortkette möchtest, führe `kaladontsetup -l en` in diesem Kanal aus.
3. Führe `trivia` oder `hangman` aus, um zu prüfen, ob der Bot dort Nachrichten senden und Antworten lesen kann.
4. Gib dem Team die Berechtigung Nachrichten verwalten, wenn es Umfragen durchführen soll.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, sofern du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `trivia [options]` | `t` | Niemand | Trivia starten |
| `tl` | | Niemand | Trivia-Punktestände |
| `tq` | | Niemand | Trivia stoppen |
| `hangman [type]` | | Niemand | Galgenmännchen starten |
| `hangmanlist` | | Niemand | Galgenmännchen-Typen auflisten |
| `hangmanstop` | | Niemand | Galgenmännchen stoppen |
| `kaladont [options]` | `kal` | Niemand | Kaladont starten |
| `kaladontstop` | `kalstop` | Niemand | Kaladont stoppen |
| `kaladontsetup [options]` | `kalsetup` | Kanäle verwalten | Daraus einen dauerhaften Kaladont-Kanal machen |
| `kaladontdisable` | `kaldisable` | Kanäle verwalten | Den dauerhaften Kanal entfernen |
| `nunchi` | | Niemand | Nunchi erstellen oder beitreten |
| `typestart [options]` | | Niemand | Ein Tipprennen starten |
| `typestop` | | Niemand | Das Rennen stoppen |
| `typelist [page]` | | Niemand | Rennsätze auflisten |
| `typeadd <text>` | | Bot-Besitzer | Einen Satz hinzufügen |
| `typedel <index>` | | Bot-Besitzer | Einen Satz löschen |
| `acrophobia [options]` | `acro` | Niemand | Acrophobia starten |
| `tictactoe [options]` | `ttt` | Niemand | Tic-Tac-Toe starten oder beitreten |
| `poll <question>` | `ppoll` | Nachrichten verwalten | Ja/Nein-Umfrage |
| `pollc <question;options>` | | Nachrichten verwalten | Umfrage mit Einzelauswahl |
| `pollm <question;options>` | | Nachrichten verwalten | Umfrage mit Mehrfachauswahl |
| `polla <question;options>` | | Nachrichten verwalten | Anonyme Umfrage |
| `polltemplates` | `ptemplates` | Niemand | Umfragevorlagen auflisten |
| `polltemplate <name>` | `ptemplate` | Nachrichten verwalten | Eine Umfrage aus einer Vorlage posten |
| `choose <a; b; c>` | | Niemand | Zufällig eine auswählen |
| `8ball [question]` | `eightball` | Niemand | Magic 8-Ball |
| `linux <word> <word>` | | Niemand | Der Interjection-Copypasta |
| `dragon` | | Niemand | Dein Beta-Flag umschalten |
| `rategirl` | | Niemand | Platzhalter, tut nichts |

## Tipps und Stolperfallen

- Spiele lesen Antworten aus dem Kanal, daher braucht der Bot dort Nachrichtenverlauf lesen und Nachrichten senden, und er darf nicht durch eine Kanalberechtigung blockiert sein.
- Antworten bei Trivia, Galgenmännchen und Kaladont sind gewöhnliche Nachrichten. Wenn du außerdem Nachrichtenzählung oder XP nutzt, zählen diese Nachrichten mit.
- In jedem Kanal kann nur ein Trivia-, Galgenmännchen-, Tipp- oder Kaladont-Spiel laufen; der Startbefehl sagt dir, wenn bereits eines läuft.
- Umfrageoptionen, die länger als 100 Zeichen sind, werden im Auswahlmenü abgeschnitten.
- Nunchi scheidet in jeder Runde den langsamsten Spieler aus, daher kann eine große Gruppe eine Weile zum Beenden brauchen.

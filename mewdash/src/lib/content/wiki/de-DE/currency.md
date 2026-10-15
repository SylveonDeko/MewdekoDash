---
title: Währung
slug: currency
summary: Eine Wirtschaft pro Server mit Geldbeuteln und einer Bank, täglichen Belohnungen, Arbeit und Verbrechen, einem Rollen- und Artikel-Shop und mehr als zwanzig Wettspielen, alles über das Dashboard einstellbar.
icon: fa-money-bill
category: Entertainment
dashboard: /dashboard/currency
module: Currency
tags: [currency, economy, money, coins, shop, balance, bank, daily, work, crime, rob, pay, gambling, blackjack, roulette, slots, leaderboard, Währung, Wirtschaft, Geld, Münzen, Kontostand, Guthaben, Glücksspiel, Bestenliste, Raub, Arbeit, Verbrechen]
related: [xp, administration]
---

## Was es macht

Jedes Mitglied hat einen Geldbeutel und, wenn du die Bank eingeschaltet lässt, ein Bankguthaben. Währung verdienen sie, indem sie eine tägliche Belohnung abholen, `work` und `crime` mit Abklingzeiten ausführen, Spiele gewinnen oder von anderen Mitgliedern bezahlt werden. Ausgeben können sie sie in deinem Shop für Rollen, Sammelobjekte oder Textartikel, oder sie setzen sie in Spielen wie Blackjack, Roulette, Slots, Crash und Keno ein.

Das Team bestimmt, wie sich die Wirtschaft verhält: ob Glücksspiel an ist, Einsatzlimits, einen Hausvorteil, wie viel Arbeit und Verbrechen einbringen, ob es Raub gibt, Überweisungssteuer, Bankzinsen und Boni für tägliche Serien. Jedes davon ist eine Einstellung im Tab **Konfiguration** oder ein `economyset`-Schlüssel, sodass du die Wirtschaft abstimmen kannst, ohne die Spiele anzufassen.

Der Bot erfasst jede Gutschrift und Belastung als Transaktion, sodass Mitglieder sehen können, wohin ihr Geld geflossen ist, und der Tab **Analysen** dir die Geldmenge zeigen kann, wo sie liegt und welche Spiele mehr auszahlen, als sie einnehmen.

## Wofür du es brauchst

- Gib aktiven Mitgliedern etwas, wofür sie ihr Engagement ausgeben können: eine farbige Rolle, einen eigenen Titel oder ein bisschen Spaß in einem Spielekanal.
- Betreibe einen Spielekanal, der fair bleibt, weil Einsatzlimits, ein tägliches Verlustlimit und ein Hausvorteil für dich durchgesetzt werden.
- Belohne Mitglieder mit `modifybalance` oder dem Werkzeug **Guthaben anpassen** fürs Helfen und lass sie aus dem Shop wählen.
- Beobachte die Tabelle **Spielleistung**, um die tatsächliche Rückzahlung jedes Spiels zu sehen und `payoutmultiplier` anhand von Daten statt nach Gefühl abzustimmen.

## Guthaben, Bank und Überweisungen

`cash` zeigt deinen Geldbeutel und, falls du etwas eingezahlt hast, deine Bank und dein Gesamtvermögen. `bank` zeigt dasselbe für jedes Mitglied und sammelt außerdem alle dir zustehenden Zinsen ein. `deposit` und `withdraw` bewegen Geld zwischen den beiden; `all` funktioniert als Betrag. Eingezahltes Geld kann nicht geraubt werden, und eine **Bankkapazität** begrenzt, wie viel gespeichert werden kann (0 bedeutet unbegrenzt).

Zinsen werden ausgezahlt, wenn ein Mitglied `bank` ausführt: Ist das Intervall seit der letzten Zinszahlung verstrichen, verdient das Bankguthaben einmal **Zinsen (%)**. Sie werden nicht ausgezahlt, solange niemand nachschaut.

`pay` sendet Geldbeutel-Währung an ein anderes Mitglied, abzüglich **Überweisungssteuer (%)**, mit einer **Mindestüberweisung** und einer optionalen Abklingzeit. Bots können nicht bezahlt werden.

`transactions` listet die letzten 250 Einträge für dich oder ein anderes Mitglied auf, zehn pro Seite. `cashleaderboard` reiht Mitglieder nach Geldbeutel plus Bank.

## Verdienen

| Befehl | Standard | Was passiert |
| --- | --- | --- |
| `dailyreward` | Nicht gesetzt, bis das Team `setdaily` ausführt | Schreibt den Tagesbetrag einmal pro Abklingzeit gut. Bei aktivierten Serien fügt jede aufeinanderfolgende Abholung **Bonus pro Tag** mal die Tage der Serie über den ersten hinaus hinzu, begrenzt durch **Maximaler Bonus**. Verpasst man ein volles Abklingfenster, wird die Serie zurückgesetzt. |
| `work` | 50 bis 250, alle 30 Minuten | Eine zufällige Auszahlung im konfigurierten Bereich, klappt immer. |
| `crime` | 200 bis 800, 45 % Erfolg, jede Stunde | Bei Erfolg wird der Verbrechen-Bereich ausgezahlt. Bei Misserfolg wird eine Strafe von 100 bis 500 abgezogen, begrenzt auf das, was im Geldbeutel ist. |
| `rob @user` | Aus | Wenn aktiviert: 35 % Chance, bis zu 20 % des Geldbeutels des Ziels zu nehmen. Ziele mit unter 100 sind geschützt. Ein Misserfolg kostet 15 % deines eigenen Geldbeutels. Ein Versuch pro Stunde. |

## Spiele

Jeder Einsatz durchläuft dieselben Prüfungen: Glücksspiel muss an sein, der Einsatz muss zwischen **Mindesteinsatz** und **Maximaler Einsatz** liegen, das Mitglied darf in den letzten 24 Stunden nicht das **Tägliches Verlustlimit** erreicht haben, und die Spiel-Abklingzeit (falls vorhanden) muss verstrichen sein. Der Einsatz wird vorab eingezogen. Gewinne sind `Einsatz plus Profit`, und der Profit-Teil wird durch den **Auszahlungsmultiplikator** skaliert, sodass ein Multiplikator von 0,9 jeden Gewinn um zehn Prozent kürzt, während ein Unentschieden den vollen Einsatz zurückerstattet.

| Spiel | Wie es auszahlt |
| --- | --- |
| `coinflip <bet> heads/tails` | Gleichgewicht (1:1) bei richtigem Tipp |
| `highlow higher/lower [bet]` | Eine Zahl von 1 bis 10 wird gezeigt; tippe auf die nächste. 1:1, eine gleiche Zahl erstattet den Einsatz. Standardeinsatz 100 |
| `spinwheel [bet]` | Gewichtetes Rad mit Segmenten von minus 10 Prozent bis plus 30 Prozent des Einsatzes. Standardeinsatz 10 |
| `blackjack <bet>`, dann `hit` und `stand` | Der Geber zieht bis 17. 1:1 bei einem Sieg, Unentschieden bei Gleichstand |
| `slot [bet]` | Zwei gleiche Symbole zahlen 2x. Drei gleiche zahlen 3x, Trauben 5x, Siebenen 7x, Diamanten 10x. Standardeinsatz 10 |
| `roulette <bet> <type>` | Eine Zahl von 0 bis 36 zahlt 35 zu 1. `red`, `black`, `even` oder `odd` zahlen 1:1; die Null verliert Farb- und Paritätswetten |
| `rps <choice> [bet]` | Schere, Stein, Papier, Echse, Spock gegen den Bot. 1:1, bei Gleichstand Erstattung. Einsatz ist optional |
| `war <bet>` | Die höhere Karte gewinnt 1:1. Bei Gleichstand wird ein zweiter Einsatz fällig und eine weitere Karte für das Doppelte gespielt |
| `craps <bet> [pass/dontpass/field/any]` | Pass und Don't Pass folgen den Punkt-Regeln bei 1:1. Field zahlt 1:1, oder 2x bei 2 oder 12. Any Seven zahlt 4x |
| `scratchcard [bronze/silver/gold/diamond]` | Karten mit festem Preis von 10, 50, 200 oder 1000 mit 30, 25, 20 und 15 Prozent Gewinnchance und Preisbereichen bis 50, 200, 1000 und 5000 |
| `russianroulette <bet> [bullets]` | Eine bis fünf Kugeln in sechs Kammern. Überleben zahlt je nach Kugelzahl 1,2x, 1,5x, 2x, 3x oder 5x Profit |
| `baccarat <bet> [player/banker/tie]` | Player oder Banker zahlen 1,95x, Tie zahlt 8x |
| `minesweeper <bet> [small/medium/large]` | 70, 60 oder 50 Prozent Überlebenschance für 1,5x, 2,5x oder 4x |
| `lottery [tickets]` | Tickets kosten je 50, bis zu 10. Mehr Tickets erhöhen die Gewinnchance (max. 40 %) und den Preismultiplikator |
| `crash <bet> [target]` | Wähle ein Auszahlungsziel von 1,1x bis 10x. Du gewinnst das Ziel, wenn der Crash-Punkt auf oder über ihm liegt |
| `keno <bet> <numbers>` | Wähle 1 bis 10 Zahlen von 1 bis 80; 20 werden gezogen. Auszahlungen reichen von 3x für einen Treffer bei einer Zahl bis 800x für fünf von fünf |
| `plinko <bet> [rows]` | 5 bis 10 Reihen. Landen in der Mitte zahlt 0,5x, die Ränder zahlen bis zu 10x |
| `wheelfortune <bet> [classic/risky/balanced]` | Räder mit Multiplikatoren; risky reicht von 0,1x bis 20x |
| `duckrace <bet>` | Fünf Enten, deine ist zufällig. Erster zahlt 4x, zweiter 2x, dritter 1,2x |
| `bingo <bet> [small/large]` | 40 % Chance auf 2x, oder 25 % Chance auf 3,5x |
| `diceduel @user <bet>` | Der Gegner erhält Buttons zum Annehmen und Ablehnen; beide müssen den Einsatz decken können |
| `memory <bet> [easy/medium/hard]` | Wiederhole eine Folge aus 4, 6 oder 8 für 1,5x, 2x oder 3x |
| `horserace <bet>` | Bis zu zehn Mitglieder treten innerhalb von zehn Sekunden bei; KI-Rennfahrer füllen leere Plätze. Der Pool zahlt 50, 30 und 20 Prozent an die ersten drei |
| `triviachain <bet> [category]` | Beantworte OpenTDB-Fragen hintereinander; jede richtige Antwort erhöht den Multiplikator um 0,5x. Kategorien: general, science, history, sports, entertainment |

> [!NOTE]
> `horserace` akzeptiert jeden positiven Einsatz: Es zieht den Einsatz direkt ein und wendet weder die gemeinsamen Einsatzlimits noch den Auszahlungsmultiplikator an.

## Tägliche Herausforderungen

Jedes Mitglied erhält pro Tag eine zufällige Herausforderung: fünf Spiele spielen, drei gewinnen, 500 ausgeben, 300 verdienen oder ein bestimmtes Spiel dreimal spielen. Die Belohnung ist der Grundbetrag plus bis zu 50 extra. `dailychallenge` zeigt sie, `claimchallenge` zahlt sie aus, und `challengeleaderboard` reiht die Top Zehn nach den in den letzten 30 Tagen abgeschlossenen Herausforderungen.

> [!WARNING]
> Spiele melden derzeit keinen Fortschritt an die Herausforderungs-Verfolgung, daher zeigen Herausforderungen 0 Fortschritt und können noch nicht abgeholt werden.

## Der Shop

Artikel findest du im Tab **Shop**, oder sie stammen von `shopadditem` und `shopaddrole`. Jeder Artikel hat einen **Namen**, einen **Preis**, eine **Beschreibung**, einen **Typ**, einen **Bestand** (leer oder -1 für unbegrenzt), ein **Limit pro Nutzer**, eine optionale **Erforderliche Rolle**, die der Käufer halten muss, und eine **Sortierreihenfolge**.

| Typ | Beim Kauf |
| --- | --- |
| Rolle | Der Bot fügt dem Käufer die Rolle hinzu. Standardmäßig eine pro Mitglied. |
| Sammelobjekt | Landet im Inventar des Käufers; verbrauchbar, daher entfernt `use` eines. |
| Text | Der **Gelieferte Text** wird dem Käufer per DM geschickt, und erneut bei `use`. |

`buy <name>` prüft, ob der Artikel aktiviert ist, der Käufer die erforderliche Rolle hat, noch Bestand da ist, er ihn sich leisten kann und er unter dem Limit pro Nutzer liegt. Jeder Fehlschlag nach der Zahlung erstattet automatisch. `inventory` listet auf, was ein Mitglied besitzt. `shoptoggle` blendet einen Artikel aus, ohne jemandes Exemplare zu löschen; `shopremove` löscht ihn und jedes Exemplar.

## Platzhalter

Diese Währungs-Platzhalter stehen in Chat-Trigger-Antworten und an anderen Stellen zur Verfügung, die Trigger-Platzhalter verwenden.

| Platzhalter | Wert |
| --- | --- |
| `%currency.balance%` | Der Geldbeutel des Nutzers |
| `%currency.bank%` | Das Bankguthaben des Nutzers |
| `%currency.total%` | Geldbeutel plus Bank |
| `%targetuser.currency.balance%` | Der Geldbeutel des Zielnutzers |
| `%targetuser.currency.bank%` | Das Bankguthaben des Zielnutzers |
| `%currency.emote%` | Das Währungs-Emote des Servers |

## Einstellungen

Das Dashboard hat vier Tabs: **Analysen**, **Konfiguration**, **Shop** und **Bestenliste**. Der Tab **Bestenliste** enthält außerdem **Guthaben anpassen**, das einem Mitglied Währung gutschreibt oder abbucht, mit einem im Kontobuch festgehaltenen Grund.

| Einstellung | Standard | Was sie steuert |
| --- | --- | --- |
| Glücksspiel aktivieren | An | Schaltet jedes Wettspiel ein oder aus |
| Mindesteinsatz | 1 | Kleinster Einsatz |
| Maximaler Einsatz | 0 (unbegrenzt) | Größter Einsatz |
| Auszahlungsmultiplikator | 1.0 | Skaliert nur Gewinne, 0.1 bis 5.0 |
| Tägliches Verlustlimit | 0 (aus) | Sperrt ein Mitglied, nachdem es in 24 Stunden so viel verloren hat |
| Spiel-Abklingzeit (Sekunden) | 0 | Sekunden zwischen Wetten pro Mitglied |
| Arbeit aktivieren | An | Der Befehl `work` |
| Arbeit minimal / maximal | 50 / 250 | Auszahlungsbereich für Arbeit |
| Arbeits-Abklingzeit | 1800 Sekunden | `workcooldown`, nur per Befehl |
| Verbrechen aktivieren | An | Der Befehl `crime` |
| Verbrechen minimal / maximal | 200 / 800 | Auszahlungsbereich für Verbrechen |
| Erfolgschance beim Verbrechen (%) | 45 | Chance, dass ein Verbrechen auszahlt |
| Verbrechen-Strafe minimal / maximal | 100 / 500 | Strafe bei Misserfolg |
| Verbrechen-Abklingzeit | 3600 Sekunden | `crimecooldown`, nur per Befehl |
| Bank aktivieren | An | `bank`, `deposit`, `withdraw` |
| Bankkapazität | 0 (unbegrenzt) | Maximum, das ein Mitglied einzahlen kann |
| Zinsen (%) | 0 | Pro Intervall auf das eingezahlte Guthaben gezahlt |
| Zinsintervall (Stunden) | 24 | Wie oft Zinsen eingesammelt werden können |
| Überweisungen aktivieren | An | Der Befehl `pay` |
| Überweisungssteuer (%) | 0 | Wird von jeder Zahlung abgezogen |
| Mindestüberweisung | 1 | Kleinste Zahlung |
| Pay-Abklingzeit | 0 | `paycooldown`, nur per Befehl |
| Raub aktivieren | Aus | Der Befehl `rob` |
| Erfolgschance (%) | 35 | Chance, dass ein Raub gelingt |
| Maximaler Diebstahl (%) | 20 | Anteil am Geldbeutel des Ziels, den ein Erfolg nehmen kann |
| Strafe bei Misserfolg (%) | 15 | Anteil am Geldbeutel des Räubers, der bei Misserfolg verloren geht |
| Geschützt unter | 100 | Ziele mit weniger können nicht ausgeraubt werden |
| Raub-Abklingzeit | 3600 Sekunden | `robcooldown`, nur per Befehl |
| Serien aktivieren | An | Aufeinanderfolgende tägliche Abholungen bringen einen Bonus |
| Bonus pro Tag | 0 | Wird pro aufeinanderfolgendem Tag über den ersten hinaus hinzugefügt |
| Maximaler Bonus | 0 (unbegrenzt) | Obergrenze für den Serienbonus |

Der Betrag der täglichen Belohnung und ihre Abklingzeit werden mit `setdaily` festgelegt, nicht im Dashboard. `economyconfig` gibt jeden Schlüssel mit seinem aktuellen Wert aus, und `economyreset` stellt alle Standards wieder her.

## Einrichtung Schritt für Schritt

1. Führe `setdaily 500 24h` aus, damit Mitglieder etwas abholen können.
2. Öffne **Währung** im Dashboard und gehe zu **Konfiguration**. Lege **Maximaler Einsatz** und ein **Tägliches Verlustlimit** fest, bevor du einen Spielekanal öffnest.
3. Schalte **Raub aktivieren** nur ein, wenn deine Mitglieder damit leben können, Geldbeutel-Geld zu verlieren; lass die Bank an, damit sie es schützen können.
4. Füge im **Shop** ein paar Rollen-Artikel und ein Sammelobjekt hinzu. Setze bei allem, was nur für Mitglieder sein soll, eine **Erforderliche Rolle**.
5. Gib ein paar Mitgliedern mit **Guthaben anpassen** oder `modifybalance` ein Startguthaben.
6. Prüfe nach einer Woche **Analysen** und senke den **Auszahlungsmultiplikator**, wenn die Spiele mehr auszahlen, als sie einnehmen.

## Befehle

Führe diese mit dem Präfix deines Servers aus (`.`, falls du es nicht geändert hast).

| Befehl | Aliase | Benötigt | Zweck |
| --- | --- | --- | --- |
| `cash` | `$`, `$$`, `$$$`, `currency`, `cur` | Niemand | Dein Geldbeutel, deine Bank und dein Gesamtvermögen |
| `bank [@user]` | | Niemand | Guthaben eines Mitglieds, und sammelt deine Zinsen ein |
| `deposit <amount/all>` | | Niemand | Vom Geldbeutel auf die Bank |
| `withdraw <amount/all>` | | Niemand | Von der Bank in den Geldbeutel |
| `pay @user <amount>` | | Niemand | Währung senden, abzüglich Steuer |
| `transactions [@user]` | `txs` | Niemand | Letzte 250 Kontobuch-Einträge |
| `cashleaderboard` | `cashlb`, `richest` | Niemand | Reichste Mitglieder nach Gesamtvermögen |
| `dailyreward` | `daily` | Niemand | Die tägliche Belohnung abholen |
| `work` | | Niemand | Eine Arbeits-Auszahlung verdienen |
| `crime` | | Niemand | Riskante Auszahlung oder eine Strafe |
| `rob @user` | | Niemand | Versuchen, aus einem Geldbeutel zu stehlen |
| `dailychallenge` | `dc` | Niemand | Die heutige Herausforderung anzeigen |
| `claimchallenge` | `claimch` | Niemand | Eine abgeschlossene Herausforderung abholen |
| `challengeleaderboard` | `chlb` | Niemand | Top-Abschließer von Herausforderungen |
| `shop` | | Niemand | Den Shop durchstöbern, acht Artikel pro Seite |
| `buy <item>` | | Niemand | Einen Artikel kaufen |
| `inventory [@user]` | | Niemand | Artikel, die ein Mitglied besitzt |
| `use <item>` | | Niemand | Ein Verbrauchsgut aufbrauchen |
| `coinflip <bet> <heads/tails>` | `flip` | Niemand | Siehe Spiele |
| `highlow <higher/lower> [bet]` | | Niemand | Siehe Spiele |
| `spinwheel [bet]` | `wheel` | Niemand | Siehe Spiele |
| `blackjack <bet>` | `bj` | Niemand | Blackjack starten oder beitreten |
| `hit` | | Niemand | Eine Karte ziehen |
| `stand` | | Niemand | Deinen Zug beenden |
| `slot [bet]` | `slots` | Niemand | Siehe Spiele |
| `roulette <bet> <type>` | | Niemand | Siehe Spiele |
| `rps <choice> [bet]` | | Niemand | Siehe Spiele |
| `war <bet>` | | Niemand | Siehe Spiele |
| `craps <bet> [type]` | | Niemand | Siehe Spiele |
| `scratchcard [type]` | `scratch` | Niemand | Siehe Spiele |
| `russianroulette <bet> [bullets]` | `rroulette` | Niemand | Siehe Spiele |
| `baccarat <bet> [type]` | | Niemand | Siehe Spiele |
| `minesweeper <bet> [size]` | `mines` | Niemand | Siehe Spiele |
| `lottery [tickets]` | | Niemand | Siehe Spiele |
| `crash <bet> [target]` | | Niemand | Siehe Spiele |
| `keno <bet> <numbers>` | | Niemand | Siehe Spiele |
| `plinko <bet> [rows]` | | Niemand | Siehe Spiele |
| `wheelfortune <bet> [wheel]` | `wof` | Niemand | Siehe Spiele |
| `duckrace <bet>` | `duck` | Niemand | Siehe Spiele |
| `bingo <bet> [card]` | | Niemand | Siehe Spiele |
| `diceduel @user <bet>` | `dd` | Niemand | Ein Mitglied herausfordern |
| `memory <bet> [difficulty]` | | Niemand | Siehe Spiele |
| `horserace <bet>` | `hr` | Niemand | Einem Rennen beitreten oder eines starten |
| `triviachain <bet> [category]` | `tchain` | Niemand | Siehe Spiele |
| `setdaily <amount> <time>` | | Administrator | Betrag und Abklingzeit der täglichen Belohnung, zum Beispiel `setdaily 500 24h` |
| `modifybalance @user <amount> [reason]` | `modbal` | Bot-Owner bei globaler Währung; sonst wie durch eine Befehlsberechtigungs-Überschreibung festgelegt | Währung hinzufügen oder entfernen; negative Beträge buchen ab |
| `economyconfig` | | Administrator | Jede Wirtschaftseinstellung anzeigen |
| `economyset <setting> <value>` | | Administrator | Eine Einstellung per Schlüssel ändern |
| `economyreset` | | Administrator | Alle Standards wiederherstellen |
| `economystats` | | Niemand | Größe und Konzentration der Geldmenge |
| `economyflow [days]` | | Niemand | Wo Währung in den Umlauf kam und ihn verließ, Standard 7 Tage |
| `gamestats [days]` | | Niemand | Rückzahlung an Spieler pro Spiel, Standard 7 Tage |
| `shopadditem <price> <name>` | | Administrator | Ein verbrauchbares Sammelobjekt mit unbegrenztem Bestand hinzufügen |
| `shopaddrole <price> @role <name>` | | Administrator, der Bot braucht Rollen verwalten | Einen Rollen-Artikel hinzufügen, einer pro Mitglied |
| `shopremove <name>` | | Administrator | Einen Artikel und jedes Exemplar löschen |
| `shopprice <price> <name>` | | Administrator | Einen Preis ändern |
| `shopstock <stock> <name>` | | Administrator | Den verbleibenden Bestand festlegen |
| `shopdesc <name> \| <description>` | | Administrator | Die Beschreibung festlegen |
| `shoptoggle <name>` | | Administrator | Einen Artikel ein- oder ausblenden |

## Tipps und Stolperfallen

- Lege **Maximaler Einsatz** vor allem anderen fest. Bei 0 kann ein einziges glückliches Mitglied die Wirtschaft an einem Nachmittag leerräumen.
- Das tägliche Verlustlimit zählt Nettoverluste über die vorherigen 24 Stunden, daher kann ein Mitglied, das früh gewinnt, länger weiterspielen.
- Rollen-Artikel brauchen die höchste Rolle des Bots über der verkauften Rolle und Rollen verwalten, sonst schlägt der Kauf nach der Zahlung mit einem Fehler bei der Rollenvergabe fehl.
- Textartikel und `use` liefern per DM; Mitglieder mit geschlossenen DMs sehen einen Fehler, besitzen den Artikel aber trotzdem.
- Blackjack hält ein Spiel pro Mitglied im Speicher; `hit` und `stand` funktionieren nur nach `blackjack`.
- Pferderennen warten zehn Sekunden auf andere Mitglieder, füllen dann das Feld mit KI-Rennfahrern auf und starten.
- Quizketten-Spiele laufen nach zehn Minuten Inaktivität ab, und ein Mitglied kann nur eines gleichzeitig laufen haben.
- Wenn der Bot mit globaler Währung gehostet wird, werden Guthaben über alle Server geteilt, und `modifybalance` ist nur für den Owner.

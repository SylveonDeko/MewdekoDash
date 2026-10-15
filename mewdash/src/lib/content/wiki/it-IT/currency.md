---
title: Valuta
slug: currency
summary: Un'economia per server con portafogli e banca, ricompense giornaliere, lavoro e crimine, un negozio di ruoli e oggetti e più di venti giochi d'azzardo, tutto regolabile dalla dashboard.
icon: fa-money-bill
category: Entertainment
dashboard: /dashboard/currency
module: Currency
tags: [currency, economy, money, coins, shop, balance, bank, daily, work, crime, rob, pay, gambling, blackjack, roulette, slots, leaderboard, valuta, economia, denaro, monete, negozio, saldo, banca, giornaliero, lavoro, crimine, rapina, pagamento, azzardo, classifica]
related: [xp, administration]
---

## Cosa fa

Ogni membro ha un portafogli e, se lasci attiva la banca, anche un saldo bancario. Guadagnano valuta riscuotendo una ricompensa giornaliera, eseguendo `work` e `crime` con i tempi di attesa, vincendo giochi o ricevendo pagamenti da altri membri. La spendono nel tuo negozio per ruoli, oggetti da collezione o oggetti di testo, oppure la scommettono in giochi come blackjack, roulette, slot, crash e keno.

Lo staff decide come si comporta l'economia: se l'azzardo è attivo, i limiti delle scommesse, il margine della casa, quanto pagano lavoro e crimine, se esiste la rapina, la tassa sui trasferimenti, gli interessi bancari e i bonus per le serie giornaliere. Ognuna di queste voci è un'impostazione nella scheda **Configurazione** oppure una chiave di `economyset`, così puoi regolare l'economia senza toccare i giochi.

Il bot registra ogni accredito e addebito come transazione, così i membri possono vedere dove sono finiti i loro soldi, e la scheda **Analisi** può mostrarti la massa monetaria, dove si trova e quali giochi pagano più di quanto incassano.

## Perché usarlo

- Dai ai membri attivi qualcosa su cui spendere il proprio impegno: un ruolo colorato, un titolo personalizzato o un po' di divertimento in un canale dei giochi.
- Gestisci un canale dei giochi che resti equo, perché limiti di scommessa, un limite di perdita giornaliero e un margine della casa vengono applicati per te.
- Premia i membri con `modifybalance` o con lo strumento **Modifica un saldo** per il loro aiuto, e lascia che scelgano dal negozio.
- Controlla la tabella **Prestazioni dei giochi** per vedere il ritorno reale di ogni gioco e regolare `payoutmultiplier` in base ai dati, non all'intuito.

## Saldi, banca e trasferimenti

`cash` mostra il tuo portafogli e, se hai qualcosa in banca, anche il saldo bancario e il patrimonio netto. `bank` mostra le stesse informazioni per qualsiasi membro e riscuote anche eventuali interessi maturati. `deposit` e `withdraw` spostano denaro tra i due; `all` funziona come importo. Il denaro in banca non può essere rubato, e una **Capacità banca** limita quanto si può depositare (0 significa illimitato).

Gli interessi vengono pagati quando un membro esegue `bank`: se è passato l'intervallo dall'ultimo pagamento degli interessi, il saldo bancario matura una volta la percentuale **Interest (%)**. Non vengono pagati mentre nessuno controlla.

`pay` invia valuta dal portafogli a un altro membro, al netto della **Transfer tax (%)**, con un **Trasferimento minimo** e un tempo di attesa facoltativo. I bot non possono essere pagati.

`transactions` elenca le ultime 250 voci tue o di un altro membro, dieci per pagina. `cashleaderboard` classifica i membri in base a portafoglio più banca.

## Guadagnare

| Comando | Predefinito | Cosa succede |
| --- | --- | --- |
| `dailyreward` | Non impostato finché lo staff non esegue `setdaily` | Accredita l'importo giornaliero una volta per ciclo di attesa. Con le serie attive, ogni riscossione consecutiva aggiunge **Bonus al giorno** moltiplicato per i giorni della serie oltre il primo, con il limite di **Bonus massimo**. Saltare un intero ciclo di attesa azzera la serie. |
| `work` | Da 50 a 250, ogni 30 minuti | Un pagamento casuale nell'intervallo configurato, riesce sempre. |
| `crime` | Da 200 a 800, 45% di successo, ogni ora | In caso di successo paga l'intervallo del crimine. In caso di fallimento applica una multa da 100 a 500, limitata a quanto c'è nel portafogli. |
| `rob @user` | Disattivato | Se attivato: 35% di probabilità di rubare fino al 20% del portafogli del bersaglio. I bersagli con meno di 100 sono protetti. Il fallimento costa il 15% del tuo portafogli. Un tentativo all'ora. |

## Giochi

Ogni puntata passa dagli stessi controlli: l'azzardo deve essere attivo, la scommessa deve stare tra **Puntata minima** e **Puntata massima**, il membro non deve aver raggiunto il **Limite di perdita giornaliero** nelle ultime 24 ore e il tempo di attesa del gioco (se presente) deve essere trascorso. La posta viene prelevata in anticipo. Le vincite sono `stake plus profit`, e la parte di profitto viene scalata dal **Moltiplicatore di vincita**: un moltiplicatore di 0.9 riduce ogni vincita del dieci per cento, mentre un pareggio restituisce comunque l'intera posta.

| Gioco | Come paga |
| --- | --- |
| `coinflip <bet> heads/tails` | Alla pari in caso di previsione corretta |
| `highlow higher/lower [bet]` | Viene mostrato un numero da 1 a 10; devi prevedere il successivo. Alla pari; un numero uguale restituisce la posta. Scommessa predefinita 100 |
| `spinwheel [bet]` | Ruota ponderata con settori da meno 10 per cento a più 30 per cento della scommessa. Scommessa predefinita 10 |
| `blackjack <bet>`, poi `hit` e `stand` | Il banco pesca fino a 17. Alla pari in caso di vittoria, pareggio in caso di parità |
| `slot [bet]` | Due simboli uguali pagano 2x. Tre uguali pagano 3x, uva 5x, sette 7x, diamanti 10x. Scommessa predefinita 10 |
| `roulette <bet> <type>` | Un numero da 0 a 36 paga 35 a 1. `red`, `black`, `even` o `odd` pagano alla pari; lo zero fa perdere le scommesse di colore e di parità |
| `rps <choice> [bet]` | Sasso, carta, forbici, lucertola, Spock contro il bot. Alla pari, i pareggi restituiscono la posta. La scommessa è facoltativa |
| `war <bet>` | La carta alta vince alla pari. In caso di parità si versa una seconda posta e si gioca un'altra carta per il doppio |
| `craps <bet> [pass/dontpass/field/any]` | Pass e don't pass seguono le regole del punto alla pari. Field paga alla pari, oppure 2x con 2 o 12. Any seven paga 4x |
| `scratchcard [bronze/silver/gold/diamond]` | Carte a costo fisso da 10, 50, 200 o 1000 con probabilità di vincita del 30, 25, 20 e 15 per cento e premi fino a 50, 200, 1000 e 5000 |
| `russianroulette <bet> [bullets]` | Da uno a cinque proiettili in sei camere. Sopravvivere paga 1.2x, 1.5x, 2x, 3x o 5x di profitto in base al numero di proiettili |
| `baccarat <bet> [player/banker/tie]` | Player o banker pagano 1.95x, il pareggio paga 8x |
| `minesweeper <bet> [small/medium/large]` | Sopravvivenza del 70, 60 o 50 per cento per 1.5x, 2.5x o 4x |
| `lottery [tickets]` | I biglietti costano 50 ciascuno, fino a 10. Più biglietti aumentano la probabilità di vincita (massimo 40%) e il moltiplicatore del premio |
| `crash <bet> [target]` | Scegli un obiettivo di incasso da 1.1x a 10x. Vinci l'obiettivo se il punto di crash è pari o superiore |
| `keno <bet> <numbers>` | Scegli da 1 a 10 numeri da 1 a 80; ne vengono estratti 20. I pagamenti vanno da 3x per uno su uno fino a 800x per cinque su cinque |
| `plinko <bet> [rows]` | Da 5 a 10 file. Atterrare al centro paga 0.5x, i bordi fino a 10x |
| `wheelfortune <bet> [classic/risky/balanced]` | Ruote di moltiplicatori; la versione risky va da 0.1x a 20x |
| `duckrace <bet>` | Cinque paperelle, la tua viene scelta a caso. La prima paga 4x, la seconda 2x, la terza 1.2x |
| `bingo <bet> [small/large]` | 40% di probabilità per 2x, oppure 25% di probabilità per 3.5x |
| `diceduel @user <bet>` | L'avversario riceve i pulsanti accetta e rifiuta; entrambi devono poter coprire la scommessa |
| `memory <bet> [easy/medium/hard]` | Ripeti una sequenza di 4, 6 o 8 per 1.5x, 2x o 3x |
| `horserace <bet>` | Fino a dieci membri si uniscono entro dieci secondi; i corridori IA riempiono i posti vuoti. Il montepremi paga il 50, 30 e 20 per cento ai primi tre |
| `triviachain <bet> [category]` | Rispondi di seguito alle domande di OpenTDB; ogni risposta corretta aumenta il moltiplicatore di 0.5x. Categorie: general, science, history, sports, entertainment |

> [!NOTE]
> `horserace` accetta qualsiasi scommessa positiva: prende direttamente la posta e non applica i limiti di scommessa condivisi né il payout multiplier.

## Sfide giornaliere

Ogni membro riceve una sfida casuale al giorno: gioca cinque giochi, vincine tre, spendi 500, guadagna 300, oppure gioca tre volte un gioco specifico. La ricompensa è l'importo base più fino a 50 extra. `dailychallenge` la mostra, `claimchallenge` la paga, e `challengeleaderboard` classifica i primi dieci per sfide completate negli ultimi 30 giorni.

> [!WARNING]
> Al momento i giochi non inviano i progressi al sistema di tracciamento delle sfide, quindi le sfide mostrano 0 di progresso e non possono ancora essere riscosse.

## Il negozio

Gli oggetti si trovano nella scheda **Shop** oppure vengono creati con `shopadditem` e `shopaddrole`. Ogni oggetto ha un **Nome**, un **Prezzo**, una **Descrizione**, un **Tipo**, uno **Scorta** (vuoto o -1 per illimitato), un **Limite per utente**, un **Ruolo richiesto** facoltativo che l'acquirente deve possedere e un **Ordine di visualizzazione**.

| Tipo | All'acquisto |
| --- | --- |
| Role | Il bot aggiunge il ruolo all'acquirente. Predefinito: uno per membro. |
| Collectible | Finisce nell'inventario dell'acquirente; è consumabile, quindi `use` ne rimuove uno. |
| Text | Il **Testo consegnato** viene inviato all'acquirente in DM, e di nuovo con `use`. |

`buy <name>` verifica che l'oggetto sia attivo, che l'acquirente abbia il ruolo richiesto, che ci sia disponibilità, che possa permetterselo e che sia sotto il limite per utente. Qualsiasi errore dopo il pagamento rimborsa automaticamente. `inventory` elenca ciò che un membro possiede. `shoptoggle` nasconde un oggetto senza eliminare le copie di nessuno; `shopremove` lo elimina insieme a ogni copia.

## Segnaposto

Questi segnaposto della valuta sono disponibili nelle risposte dei trigger della chat e in altri punti che usano i segnaposto dei trigger.

| Segnaposto | Valore |
| --- | --- |
| `%currency.balance%` | Il portafogli dell'utente |
| `%currency.bank%` | Il saldo bancario dell'utente |
| `%currency.total%` | Portafoglio più banca |
| `%targetuser.currency.balance%` | Il portafogli dell'utente bersaglio |
| `%targetuser.currency.bank%` | Il saldo bancario dell'utente bersaglio |
| `%currency.emote%` | L'emoji di valuta del server |

## Impostazioni

La dashboard ha quattro schede: **Analisi**, **Configurazione**, **Shop** e **Classifica**. La scheda **Classifica** contiene anche **Modifica un saldo**, che accredita o addebita un membro con un motivo registrato nel libro mastro.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Enable gambling | Attivo | Attiva o disattiva tutti i giochi con scommessa |
| Minimum bet | 1 | Posta minima |
| Maximum bet | 0 (illimitato) | Posta massima |
| Payout multiplier | 1.0 | Scala solo le vincite, da 0.1 a 5.0 |
| Daily loss limit | 0 (disattivato) | Blocca un membro dopo aver perso questa cifra in 24 ore |
| Game cooldown (seconds) | 0 | Secondi tra due scommesse per membro |
| Enable work | Attivo | Il comando `work` |
| Work minimum / maximum | 50 / 250 | Intervallo del pagamento del lavoro |
| Work cooldown | 1800 seconds | `workcooldown`, solo comando |
| Enable crime | Attivo | Il comando `crime` |
| Crime minimum / maximum | 200 / 800 | Intervallo del pagamento del crimine |
| Crime success chance (%) | 45 | Probabilità che un crimine paghi |
| Crime fine minimum / maximum | 100 / 500 | Multa in caso di fallimento |
| Crime cooldown | 3600 seconds | `crimecooldown`, solo comando |
| Enable bank | Attivo | `bank`, `deposit`, `withdraw` |
| Bank capacity | 0 (illimitato) | Il massimo che un membro può depositare in banca |
| Interest (%) | 0 | Pagato per intervallo sul saldo bancario |
| Interest interval (hours) | 24 | Ogni quanto si possono riscuotere gli interessi |
| Enable transfers | Attivo | Il comando `pay` |
| Transfer tax (%) | 0 | Trattenuta su ogni pagamento |
| Minimum transfer | 1 | Pagamento minimo |
| Pay cooldown | 0 | `paycooldown`, solo comando |
| Enable robbery | Disattivato | Il comando `rob` |
| Success chance (%) | 35 | Probabilità che una rapina riesca |
| Maximum steal (%) | 20 | Quota del portafogli del bersaglio che un successo può sottrarre |
| Failure fine (%) | 15 | Quota del portafogli del rapinatore persa in caso di fallimento |
| Protected below | 100 | I bersagli con meno non possono essere derubati |
| Rob cooldown | 3600 seconds | `robcooldown`, solo comando |
| Enable streaks | Attivo | Le riscossioni giornaliere consecutive ottengono un bonus |
| Bonus per day | 0 | Aggiunto per ogni giorno consecutivo oltre il primo |
| Maximum bonus | 0 (senza limite) | Limite del bonus di serie |

L'importo della ricompensa giornaliera e il relativo tempo di attesa si impostano con `setdaily`, non dalla dashboard. `economyconfig` stampa ogni chiave con il valore attuale, e `economyreset` ripristina tutti i valori predefiniti.

## Procedura di configurazione

1. Esegui `setdaily 500 24h` così i membri hanno qualcosa da riscuotere.
2. Apri **Valuta** nella dashboard e vai su **Configurazione**. Imposta **Puntata massima** e un **Limite di perdita giornaliero** prima di aprire un canale dei giochi.
3. Attiva **Attiva rapina** solo se i tuoi membri accettano di perdere denaro dal portafogli; lascia attiva la banca così possono proteggerlo.
4. In **Shop**, aggiungi un paio di oggetti ruolo e un oggetto da collezione. Imposta un **Ruolo richiesto** su tutto ciò che deve essere riservato ai membri.
5. Dai a qualche membro un saldo iniziale con **Modifica un saldo** o `modifybalance`.
6. Dopo una settimana, controlla **Analisi** e abbassa il **Moltiplicatore di vincita** se i giochi pagano più di quanto incassano.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non lo hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `cash` | `$`, `$$`, `$$$`, `currency`, `cur` | Nessuno | Il tuo portafogli, la banca e il patrimonio netto |
| `bank [@user]` | | Nessuno | Saldi di un membro, e riscuote i tuoi interessi |
| `deposit <amount/all>` | | Nessuno | Dal portafogli alla banca |
| `withdraw <amount/all>` | | Nessuno | Dalla banca al portafogli |
| `pay @user <amount>` | | Nessuno | Invia valuta, al netto della tassa |
| `transactions [@user]` | `txs` | Nessuno | Ultime 250 voci del libro mastro |
| `cashleaderboard` | `cashlb`, `richest` | Nessuno | I membri più ricchi per patrimonio netto |
| `dailyreward` | `daily` | Nessuno | Riscuote la ricompensa giornaliera |
| `work` | | Nessuno | Guadagna un pagamento di lavoro |
| `crime` | | Nessuno | Pagamento rischioso oppure una multa |
| `rob @user` | | Nessuno | Prova a rubare da un portafogli |
| `dailychallenge` | `dc` | Nessuno | Mostra la sfida di oggi |
| `claimchallenge` | `claimch` | Nessuno | Riscuote una sfida completata |
| `challengeleaderboard` | `chlb` | Nessuno | I migliori completatori di sfide |
| `shop` | | Nessuno | Sfoglia il negozio, otto oggetti per pagina |
| `buy <item>` | | Nessuno | Compra un oggetto |
| `inventory [@user]` | | Nessuno | Oggetti posseduti da un membro |
| `use <item>` | | Nessuno | Usa un consumabile |
| `coinflip <bet> <heads/tails>` | `flip` | Nessuno | Vedi i giochi |
| `highlow <higher/lower> [bet]` | | Nessuno | Vedi i giochi |
| `spinwheel [bet]` | `wheel` | Nessuno | Vedi i giochi |
| `blackjack <bet>` | `bj` | Nessuno | Avvia o unisciti al blackjack |
| `hit` | | Nessuno | Pesca una carta |
| `stand` | | Nessuno | Termina il tuo turno |
| `slot [bet]` | `slots` | Nessuno | Vedi i giochi |
| `roulette <bet> <type>` | | Nessuno | Vedi i giochi |
| `rps <choice> [bet]` | | Nessuno | Vedi i giochi |
| `war <bet>` | | Nessuno | Vedi i giochi |
| `craps <bet> [type]` | | Nessuno | Vedi i giochi |
| `scratchcard [type]` | `scratch` | Nessuno | Vedi i giochi |
| `russianroulette <bet> [bullets]` | `rroulette` | Nessuno | Vedi i giochi |
| `baccarat <bet> [type]` | | Nessuno | Vedi i giochi |
| `minesweeper <bet> [size]` | `mines` | Nessuno | Vedi i giochi |
| `lottery [tickets]` | | Nessuno | Vedi i giochi |
| `crash <bet> [target]` | | Nessuno | Vedi i giochi |
| `keno <bet> <numbers>` | | Nessuno | Vedi i giochi |
| `plinko <bet> [rows]` | | Nessuno | Vedi i giochi |
| `wheelfortune <bet> [wheel]` | `wof` | Nessuno | Vedi i giochi |
| `duckrace <bet>` | `duck` | Nessuno | Vedi i giochi |
| `bingo <bet> [card]` | | Nessuno | Vedi i giochi |
| `diceduel @user <bet>` | `dd` | Nessuno | Sfida un membro |
| `memory <bet> [difficulty]` | | Nessuno | Vedi i giochi |
| `horserace <bet>` | `hr` | Nessuno | Unisciti o avvia una corsa |
| `triviachain <bet> [category]` | `tchain` | Nessuno | Vedi i giochi |
| `setdaily <amount> <time>` | | Amministratore | Importo e tempo di attesa della ricompensa giornaliera, ad esempio `setdaily 500 24h` |
| `modifybalance @user <amount> [reason]` | `modbal` | Proprietario del bot per la valuta globale; altrimenti come impostato da una sovrascrittura dei permessi del comando | Aggiunge o rimuove valuta; gli importi negativi addebitano |
| `economyconfig` | | Amministratore | Mostra ogni impostazione dell'economia |
| `economyset <setting> <value>` | | Amministratore | Cambia un'impostazione tramite chiave |
| `economyreset` | | Amministratore | Ripristina tutti i valori predefiniti |
| `economystats` | | Nessuno | Dimensione e concentrazione della massa monetaria |
| `economyflow [days]` | | Nessuno | Da dove la valuta è entrata e uscita dalla circolazione, predefinito 7 giorni |
| `gamestats [days]` | | Nessuno | Ritorno al giocatore per gioco, predefinito 7 giorni |
| `shopadditem <price> <name>` | | Amministratore | Aggiunge un oggetto da collezione consumabile con scorta illimitata |
| `shopaddrole <price> @role <name>` | | Amministratore, il bot ha bisogno di Gestire Ruoli | Aggiunge un oggetto ruolo, uno per membro |
| `shopremove <name>` | | Amministratore | Elimina un oggetto e ogni copia |
| `shopprice <price> <name>` | | Amministratore | Cambia un prezzo |
| `shopstock <stock> <name>` | | Amministratore | Imposta la scorta rimanente |
| `shopdesc <name> \| <description>` | | Amministratore | Imposta la descrizione |
| `shoptoggle <name>` | | Amministratore | Mostra o nasconde un oggetto |

## Suggerimenti e insidie

- Imposta **Puntata massima** prima di tutto il resto. Se è a 0, un membro fortunato può svuotare l'economia in un pomeriggio.
- Il limite di perdita giornaliero conta le perdite nette delle ultime 24 ore, quindi un membro che vince presto può continuare a giocare più a lungo.
- Gli oggetti ruolo richiedono che il ruolo più alto del bot sia sopra il ruolo venduto e che il bot abbia Gestire Ruoli, altrimenti l'acquisto fallisce dopo il pagamento con un errore di assegnazione del ruolo.
- Gli oggetti di testo e `use` consegnano in DM; i membri con i DM chiusi vedono un errore, ma possiedono comunque l'oggetto.
- Il blackjack tiene in memoria una sola partita per membro; `hit` e `stand` funzionano solo dopo `blackjack`.
- Le corse di cavalli attendono dieci secondi che si uniscano altri membri, poi riempiono il campo con corridori IA e partono.
- I giochi di trivia chain terminano dopo dieci minuti di inattività, e un membro può averne solo uno in corso alla volta.
- Quando il bot è ospitato con valuta globale, i saldi sono condivisi tra tutti i server e `modifybalance` è riservato al proprietario.

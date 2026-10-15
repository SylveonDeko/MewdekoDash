---
title: Giochi
slug: games
summary: Giochi di chat che i membri possono avviare in qualsiasi canale, dal quiz e l'impiccato alle catene di parole, alle gare di digitazione, all'acrophobia e ai sondaggi.
icon: fa-gamepad-modern
category: Entertainment
module: Games
tags: [games, trivia, hangman, kaladont, nunchi, typing race, acrophobia, tic tac toe, poll, vote, 8ball, choose, giochi, impiccato, gara di digitazione, tris, sondaggio, palla 8, scegli]
related: [polls, currency, xp, searches, utility]
---

## Cosa fa

I giochi si svolgono nel canale in cui vengono avviati. Un membro esegue un comando, il bot pubblica il gioco e tutti nel canale giocano scrivendo le risposte o premendo pulsanti. Nel canale può essere attivo un solo gioco per tipo (oppure uno per server per Nunchi e Kaladont) alla volta, e la maggior parte dei giochi può essere fermata in anticipo con il comando di stop corrispondente.

Quiz, impiccato, Kaladont, Nunchi, la gara di digitazione, l'acrophobia e il tris sono multiplayer. I sondaggi permettono allo staff di porre una domanda al canale con pulsanti o un menu a tendina. `choose` e `8ball` sono giochini una tantum.

Questo modulo non ha una pagina nella dashboard. Tutto si fa con i comandi, e la maggior parte non richiede alcun permesso.

## Perché usarlo

- Movimenta una serata tranquilla con un giro di quiz o impiccato.
- Organizza una gara di digitazione o un torneo di Kaladont come evento della community.
- Fai una rapida domanda sì o no al server, o un sondaggio a più opzioni con un menu a tendina.
- Crea un canale Kaladont permanente così la catena di parole non si ferma mai.

## Quiz

`trivia` avvia un quiz. Il bot pubblica una domanda, mostra un suggerimento a metà del timer della domanda a meno che i suggerimenti non siano disattivati, e il primo membro che scrive la risposta ottiene un punto. Quando un membro raggiunge il punteggio richiesto per vincere, il gioco termina e lui vince. Se un certo numero di domande di fila resta senza risposta, il gioco si interrompe.

| Opzione | Predefinito | Cosa fa |
| --- | --- | --- |
| `-p`, `--pokemon` | disattivata | Modalità "Chi è quel Pokémon?" |
| `--nohint` | disattivata | Non mostra mai suggerimenti |
| `-w`, `--win-req` | 10 | Punti necessari per vincere; 0 per un gioco senza fine |
| `-q`, `--question-timer` | 30 | Secondi per domanda |
| `-t`, `--timeout` | 10 | Domande senza risposta di fila prima che il gioco si fermi; 0 per mai |

`tl` mostra i punteggi attuali e `tq` ferma il gioco. La configurazione globale del bot può impostare un punteggio minimo per vincere e un premio in valuta per il vincitore.

> [!EXAMPLE]
> `trivia -w 5 -q 20` avvia una partita breve fino a cinque punti con venti secondi per domanda.

## Impiccato

`hangman [type]` sceglie una parola da una categoria e la mostra come spazi vuoti. I membri indovinano una singola lettera, oppure l'intera parola, scrivendola nel canale. Sei tentativi sbagliati fanno perdere la partita. Le categorie sono `countries`, `movies`, `animals`, `things` e `random`; `random` è quella predefinita. `hangmanlist` mostra i tipi disponibili sul tuo server e `hangmanstop` termina il gioco.

## Kaladont

Kaladont è una catena di parole. Ogni parola deve iniziare con le ultime due lettere della parola precedente, e una parola può essere usata una sola volta per partita. I giocatori si alternano, con un limite di tempo per turno. Il dizionario può essere in inglese o in serbo, e i digrammi serbi (come lj e nj) vengono trattati come lettere singole.

| Opzione | Predefinito | Cosa fa |
| --- | --- | --- |
| `-j`, `--join-time` | 15 | Secondi per unirsi prima che il gioco inizi |
| `-t`, `--turn-time` | 30 | Secondi per turno |
| `-m`, `--min-players` | 2 | Giocatori necessari per iniziare |
| `-l`, `--language` | en | `en` oppure `sr` |
| `-e`, `--endless` | disattivata | Rifiuta le parole che non lasciano nessuna parola valida per il giocatore successivo |

`kaladontstop` termina il gioco in corso. `kaladontsetup` trasforma il canale attuale in un canale Kaladont permanente che mantiene viva la catena, con le stesse opzioni di lingua e di endless, e `kaladontdisable` lo rimuove. Entrambi richiedono Gestisci canali.

## Nunchi

`nunchi` crea una partita, e gli altri membri eseguono `nunchi` per unirsi mentre è nella fase di iscrizione. A ogni turno il bot annuncia un numero e ogni giocatore deve scrivere il numero successivo. I giocatori che lo scrivono correttamente passano; quando tutti tranne uno hanno passato, il turno termina e l'ultimo giocatore rimasto viene eliminato. Se nessuno risponde in tempo, il turno ricomincia con tutti quelli che hanno già passato. Vince l'ultimo giocatore in piedi.

## Gara di digitazione

`typestart` avvia un conto alla rovescia (cinque secondi per impostazione predefinita, `-s` o `--start-time` imposta da 3 a 30) e poi pubblica una frase. Il primo membro che la riscrive abbastanza fedelmente vince; qualche errore di battitura è tollerato, circa uno ogni 25 caratteri. Il risultato mostra le parole al minuto e il numero di errori. `typestop` termina una gara, `typelist` mostra il pool di frasi, e i proprietari del bot possono aggiungere o eliminare frasi con `typeadd` e `typedel`.

## Acrophobia

`acrophobia` pubblica da tre a cinque lettere casuali. I membri hanno il tempo di invio (predefinito 60 secondi, da 15 a 300) per mandare una frase le cui parole iniziano con quelle lettere in ordine, una sola proposta per persona. Poi tutti votano per la loro preferita indicando il numero durante il tempo di voto (predefinito 60 secondi, da 15 a 120). Non puoi votare la tua proposta. Imposta i timer con `-s` o `--submission-time` e `-v` o `--vote-time`.

## Tris

`tictactoe` apre una partita; il membro successivo che la esegue si unisce come secondo giocatore. I turni si fanno in chat, e un giocatore che impiega più del timer del turno (predefinito 15 secondi, `-t` o `--turn-timer`, da 5 a 60) perde per abbandono. Il gioco indica un vincitore o un pareggio.

## Sondaggi

Per creare sondaggi serve Gestisci messaggi. Le opzioni sono separate da punti e virgola.

| Comando | Tipo | Comportamento |
| --- | --- | --- |
| `poll <question>` | Sì/No | Due pulsanti |
| `pollc question;option1;option2;...` | Scelta singola | Un voto per membro |
| `pollm question;option1;option2;...` | Scelta multipla | I membri possono scegliere più opzioni |
| `polla question;option1;option2;...` | Anonimo | L'identità di chi vota è nascosta |

I sondaggi con da due a cinque opzioni usano pulsanti; quelli più lunghi usano un menu a tendina con fino a 25 voci. I membri possono cambiare il proprio voto. I modelli salvano una domanda e le sue opzioni per riusarle: `polltemplates` li elenca e `polltemplate <name>` pubblica un sondaggio da un modello. La creazione e l'eliminazione dei modelli, la chiusura di un sondaggio, l'elenco dei sondaggi attivi e la visualizzazione delle statistiche di un sondaggio si fanno con i comandi slash `/poll` (`create-template`, `delete-template`, `close`, `list`, `stats`) oppure nella pagina Sondaggi della dashboard, che ha un proprio articolo.

## Altro

- `choose a; b; c` sceglie a caso un'opzione da un elenco separato da punti e virgola.
- `8ball <question>` risponde pescando da un elenco di risposte nella configurazione dei giochi del bot.
- `linux <word> <word>` pubblica il copypasta "I'd just like to interject" con i due nomi scambiati.
- `dragon` attiva o disattiva il tuo flag di beta tester, che alcuni comandi sperimentali controllano.
- `rategirl` esiste solo come stub con una nota sul motivo per cui è stato rimosso. Non fa nulla di utile.

## Impostazioni

Questo modulo non ha una pagina nella dashboard né impostazioni per server. Il comportamento dei giochi si imposta con le opzioni dei comandi qui sopra. Il file `games.yml` di configurazione del proprietario del bot contiene le risposte di 8ball e il punteggio minimo per vincere al quiz e il premio in valuta.

## Procedura di configurazione

1. Scegli un canale per i giochi, oppure creane uno, così i messaggi di gioco non sommergono le conversazioni.
2. Se vuoi una catena di parole permanente, esegui `kaladontsetup -l en` in quel canale.
3. Esegui `trivia` o `hangman` per verificare che il bot possa inviare messaggi e leggere le risposte lì.
4. Dai il permesso Gestisci messaggi allo staff se vuoi che possa avviare sondaggi.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `trivia [options]` | `t` | Nessuno | Avvia il quiz |
| `tl` | | Nessuno | Punteggi del quiz |
| `tq` | | Nessuno | Ferma il quiz |
| `hangman [type]` | | Nessuno | Avvia l'impiccato |
| `hangmanlist` | | Nessuno | Elenca i tipi di impiccato |
| `hangmanstop` | | Nessuno | Ferma l'impiccato |
| `kaladont [options]` | `kal` | Nessuno | Avvia Kaladont |
| `kaladontstop` | `kalstop` | Nessuno | Ferma Kaladont |
| `kaladontsetup [options]` | `kalsetup` | Gestisci canali | Rende questo canale un canale Kaladont permanente |
| `kaladontdisable` | `kaldisable` | Gestisci canali | Rimuove il canale permanente |
| `nunchi` | | Nessuno | Crea o unisciti a Nunchi |
| `typestart [options]` | | Nessuno | Avvia una gara di digitazione |
| `typestop` | | Nessuno | Ferma la gara |
| `typelist [page]` | | Nessuno | Elenca le frasi della gara |
| `typeadd <text>` | | Proprietario del bot | Aggiunge una frase |
| `typedel <index>` | | Proprietario del bot | Elimina una frase |
| `acrophobia [options]` | `acro` | Nessuno | Avvia l'acrophobia |
| `tictactoe [options]` | `ttt` | Nessuno | Avvia o unisciti al tris |
| `poll <question>` | `ppoll` | Gestisci messaggi | Sondaggio sì/no |
| `pollc <question;options>` | | Gestisci messaggi | Sondaggio a scelta singola |
| `pollm <question;options>` | | Gestisci messaggi | Sondaggio a scelta multipla |
| `polla <question;options>` | | Gestisci messaggi | Sondaggio anonimo |
| `polltemplates` | `ptemplates` | Nessuno | Elenca i modelli di sondaggio |
| `polltemplate <name>` | `ptemplate` | Gestisci messaggi | Pubblica un sondaggio da un modello |
| `choose <a; b; c>` | | Nessuno | Sceglie a caso |
| `8ball [question]` | `eightball` | Nessuno | Palla magica 8 |
| `linux <word> <word>` | | Nessuno | Il copypasta dell'interiezione |
| `dragon` | | Nessuno | Attiva o disattiva il tuo flag beta |
| `rategirl` | | Nessuno | Stub, non fa nulla |

## Suggerimenti e insidie

- I giochi leggono le risposte dal canale, quindi il bot ha bisogno di Cronologia messaggi e Invia messaggi lì, e non deve essere bloccato da una regola dei permessi del canale.
- Le risposte di quiz, impiccato e Kaladont sono messaggi normali. Se usi anche il conteggio dei messaggi o l'XP, quei messaggi vengono conteggiati.
- Può essere attivo un solo gioco tra quiz, impiccato, gara di digitazione o Kaladont per canale; il comando di avvio ti avvisa se ce n'è già uno in corso.
- Le opzioni dei sondaggi più lunghe di 100 caratteri vengono troncate nel menu a tendina.
- Nunchi elimina il giocatore più lento a ogni turno, quindi un gruppo numeroso può impiegare un po' a finire.

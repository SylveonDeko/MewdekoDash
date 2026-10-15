---
title: Sondaggi
slug: polls
summary: Pubblica sondaggi con pulsanti in un canale, limita chi può votare, programmali in anticipo, riusa i modelli e controlla i risultati.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/polls
module: Games
tags: [poll, vote, survey, question, yes no, multiple choice, anonymous, scheduled poll, poll template, sondaggio, sondaggio programmato, modello di sondaggio, domanda, sì no, scelta multipla, anonimo]
related: [votes, games]
---

## Cosa fa

Lo staff pubblica una domanda con da due a venticinque opzioni. Il bot invia un embed con un pulsante per ogni opzione, oppure un menu di selezione quando sono più di cinque, e i membri votano cliccando. L'embed mostra il conteggio e la percentuale in tempo reale per ogni opzione. Sotto le opzioni ci sono tre pulsanti di gestione: **Statistiche**, **Chiudi** ed **Elimina**.

I membri possono cambiare il proprio voto cliccando un'altra opzione, oppure rimuoverlo cliccando di nuovo la stessa, a meno che la modifica dei voti non sia stata disattivata per quel sondaggio. Ogni risposta che il bot dà a un clic è privata per chi ha votato, così il canale resta pulito.

I sondaggi possono essere chiusi a mano, possono scadere da soli dopo una durata impostata, e possono essere programmati per essere pubblicati in una data futura. I modelli salvano una domanda e le sue opzioni così lo stesso sondaggio può essere ripubblicato con un solo comando. La dashboard aggiunge analisi, esportazione in CSV e JSON, e confronto affiancato dei sondaggi.

## Perché usarlo

- Scegli una data o un gioco per il prossimo evento della community.
- Fai un rapido controllo sì o no prima di una modifica alle regole.
- Poni una domanda delicata in forma anonima, così nessuno può vedere chi ha votato cosa.
- Consenti di votare su decisioni che riguardano solo un ruolo dello staff o un ruolo di sostenitori.
- Pubblica lo stesso sondaggio settimanale ogni lunedì da un modello, oppure programmalo in anticipo.

## Tipi di sondaggio

| Tipo | Come si vota |
| --- | --- |
| Sì / No | Due opzioni fisse, Sì e No. Creato con `poll` e `/poll yesno`. |
| Scelta singola | Un'opzione per membro. Predefinito per `pollc`, i modelli e la dashboard. |
| Scelta multipla | I membri possono scegliere più opzioni. Con sei o più opzioni, il menu di selezione consente la selezione multipla. |
| Anonimo | I voti vengono memorizzati senza mostrare chi ha votato nelle statistiche o nelle esportazioni. |
| Limitato per ruolo | Possono votare solo i membri con uno dei ruoli consentiti. Gli altri ricevono una risposta privata "non consentito". Solo dashboard. |

Ogni sondaggio ha anche questi interruttori per sondaggio, tutti attivi per impostazione predefinita: **Consenti di cambiare il voto**, **Mostra risultati in tempo reale** e **Mostra barre di avanzamento**.

## Voto, chiusura e scadenza

- Un voto su un sondaggio chiuso o scaduto viene rifiutato con un messaggio privato.
- Se la modifica dei voti è disattivata, un secondo clic viene rifiutato come "già votato".
- I pulsanti **Chiudi** ed **Elimina** funzionano per chi ha creato il sondaggio e per chiunque abbia il permesso Gestisci messaggi. Elimina chiede di scrivere `DELETE` in un modulo di conferma, poi rimuove il sondaggio e il suo messaggio.
- **Statistiche** mostra in privato, a chi ha cliccato, i voti totali, i votanti unici e la ripartizione per opzione.
- La scadenza viene controllata ogni cinque minuti. Quando un sondaggio scade, i suoi pulsanti vengono rimossi e il piè di pagina cambia per indicare che è scaduto.
- I sondaggi programmati vengono controllati ogni minuto. Un sondaggio programmato deve essere nel futuro e non più lontano di trenta giorni. Può avere una durata in minuti, dopo la quale il sondaggio pubblicato scade.

## Modelli

Un modello salva un nome, una domanda e le sue opzioni. `polltemplate <name>` lo pubblica come sondaggio a scelta singola. I modelli si elencano con `polltemplates`, si creano ed eliminano con `/poll create-template` e `/poll delete-template`, oppure si gestiscono nella scheda **Modelli** della dashboard, che supporta anche esportazione e importazione come file. Un modello contiene al massimo venticinque opzioni.

## Impostazioni

La pagina Sondaggi ha cinque schede: **Sondaggi**, **Crea**, **Programmati**, **Modelli** e **Analisi**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Domanda | nessuna | Il titolo del sondaggio |
| Tipo di sondaggio | Scelta singola | Uno dei cinque tipi sopra |
| Canale | nessuno | Dove viene pubblicato il sondaggio |
| Opzioni | due vuote | Da due a venticinque opzioni, ognuna fino a 100 caratteri. Nascosto per Sì / No |
| Ruoli autorizzati a votare | nessuno | Mostrato per i sondaggi limitati per ruolo |
| Durata (minuti) | aperto fino alla chiusura | Da 1 a 20160 minuti. Applicata quando il sondaggio è programmato |
| Programma per dopo | nessuno | Una data e un'ora. Lascia vuoto per pubblicare subito |
| Consenti di cambiare il voto | attivo | Se un membro può cambiare o rimuovere il proprio voto |
| Mostra risultati in tempo reale | attivo | Se i conteggi vengono mostrati mentre il sondaggio è in corso |
| Mostra barre di avanzamento | attivo | Se vengono disegnate barre accanto ai conteggi |
| Salva anche come modello | disattivato | Salva la domanda e le opzioni con il **Nome del modello** |

La scheda **Sondaggi** elenca i sondaggi con una casella **Includi inattivi**. Espandendo un sondaggio si vedono votanti unici, partecipazione, ora di punta e data di creazione, e si offre **Chiudi sondaggio**. **Programmati** ti permette di **Annulla** un sondaggio in attesa. **Analisi** mostra i sondaggi di questo mese, i voti espressi, la media di voti per sondaggio, il tipo preferito e un grafico dei sondaggi al giorno.

## Procedura di configurazione

1. Apri **Sondaggi** nella dashboard e vai alla scheda **Crea**.
2. Scrivi la **Domanda**, scegli un **Tipo di sondaggio** e il **Canale**.
3. Compila le **Opzioni**. Usa il pulsante di rimozione per eliminare quelle in più; ne servono almeno due.
4. Per un sondaggio limitato per ruolo, scegli i **Ruoli autorizzati a votare**.
5. Facoltativamente, spunta **Salva anche come modello** e dagli un nome.
6. Clicca il pulsante di invio. Il sondaggio viene pubblicato subito, oppure messo in coda nella scheda **Programmati** se imposti un orario.
7. Segui i risultati nella scheda **Sondaggi**, poi **Chiudi sondaggio** quando hai finito.

> [!TIP]
> Per un voto rapido in un canale non serve la dashboard. `poll Should we add a movie night?` pubblica un sondaggio Sì / No in pochi secondi.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `poll <question>` | `ppoll` | Gestisci messaggi | Pubblica un sondaggio Sì / No |
| `pollc <question;option1;option2;...>` | | Gestisci messaggi | Pubblica un sondaggio a scelta singola con da due a venticinque opzioni |
| `pollm <question;option1;option2;...>` | | Gestisci messaggi | Pubblica un sondaggio a scelta multipla |
| `polla <question;option1;option2;...>` | | Gestisci messaggi | Pubblica un sondaggio anonimo |
| `polltemplate <name>` | `ptemplate` | Gestisci messaggi | Pubblica un sondaggio da un modello salvato |
| `polltemplates` | `ptemplates` | Nessuno | Elenca i modelli del server |

I comandi slash sotto `/poll` aggiungono `create` (fino a dieci opzioni con gli interruttori per anonimo e scelta multipla), `close`, `stats`, `list`, `create-template` e `delete-template`. `close`, `create-template` e `delete-template` richiedono Gestisci messaggi.

## Suggerimenti e insidie

- Il bot ha bisogno di Invia messaggi e Inserisci link nel canale del sondaggio. I comandi testuali eliminano anche il tuo messaggio di comando, cosa che richiede il permesso Gestisci messaggi per il bot.
- Le opzioni sono separate dai punti e virgola, quindi un'opzione non può contenerne uno.
- Le etichette dei pulsanti mostrano il testo dell'opzione solo se è lungo dodici caratteri o meno; le opzioni più lunghe mostrano solo il loro numero, con il testo completo nell'embed.
- La durata viene applicata dal programmatore. Un sondaggio pubblicato subito resta aperto finché qualcuno non lo chiude, quindi programmalo per un minuto dopo se ti serve una scadenza automatica.
- Un sondaggio chiuso può ancora essere visualizzato ed esportato dalla dashboard con **Includi inattivi** spuntato; un sondaggio eliminato è perso.
- I sondaggi limitati per ruolo controllano i ruoli al momento del voto, quindi i membri che perdono il ruolo non possono più votare, ma il loro voto precedente resta.

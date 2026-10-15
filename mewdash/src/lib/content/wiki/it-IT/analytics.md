---
title: Analytics
slug: analytics
summary: Una pagina della dashboard riservata ai soli proprietari del bot, con lo storico salvato di comandi, eventi gateway, latenza, errori, crescita dei server, adozione delle funzionalità, uso di AI e musica, traffico del sito e regole di avviso tramite webhook.
icon: fa-chart-simple
category: Analytics
dashboard: /owner/analytics
tags: [analytics, metrics, telemetry, commands, events, latency, errors, growth, alerts, shards, owner, analisi, metriche, telemetria, comandi, eventi, latenza, errori, crescita, avvisi, shard, proprietario]
related: [performance, leave-feedback, administration]
---

## Cosa fa

Analytics è la pagina dello storico per chi gestisce il bot. È visibile solo ai proprietari del bot: la barra laterale la nasconde a tutti gli altri, e chi apre l'URL direttamente viene rispedito alla home della dashboard. Qui non c'è nulla che lo staff del server debba configurare.

Mentre [Performance](/wiki/performance) mostra il processo in tempo reale e dimentica tutto al riavvio, Analytics legge ciò che il bot ha scritto nel proprio database. Ogni istanza in esecuzione registra comandi, eventi gateway, latenza degli shard, chiamate REST, tempi del database, indicatori di processo, eccezioni, uso delle funzionalità, attività di AI e musica e visualizzazioni di pagina della dashboard. I numeri vengono aggregati in memoria per minuto, scaricati ogni minuto, raggruppati in blocchi da 5 minuti e orari, ed eliminati secondo una pianificazione fissa. Così puoi guardare la settimana scorsa, confrontarla con quella prima e filtrare per istanza, shard o server.

Un riepilogo settimanale può essere pubblicato in un webhook di Discord, e le regole di avviso su qualsiasi metrica salvata inviano una notifica a un webhook quando viene superata una soglia.

## Perché usarlo

- Vuoi sapere se un picco di errori è iniziato prima o dopo un deploy, non solo cosa sta fallendo in questo momento.
- Un server segnala che il bot è lento e vuoi la sua latenza dei comandi, l'attività e gli eventi di sicurezza per un intervallo di date.
- Vuoi vedere quali funzionalità i server configurano e usano davvero, e come è cambiato nel corso dei mesi.
- Ti serve una notifica Discord quando la latenza degli shard, il tasso di errori o i 429 della REST superano un limite, senza dover tenere d'occhio una pagina.
- Vuoi un riepilogo del lunedì su crescita, comandi, errori e funzionalità più usate in un canale.

## Schede

| Scheda | Cosa mostra |
| --- | --- |
| Overview | Riquadri per **Server**, **Utenti**, **Comandi / min**, **Eventi gateway**, **Richieste REST / s**, **Errori non gestiti** (apre i gruppi di eccezioni), **Latenza peggiore degli shard** e **Player musicali**; latenza degli shard con fasce di avviso; avvisi attualmente attivi; comandi ed eventi gateway al secondo per tipo; snapshot giornalieri dei server; tasso REST; memoria del processo |
| Commands | Selettori di tipo, modulo ed esito; **Esecuzioni**, **Errori**, **Durata p95** e **p50**; invocazioni per modulo; errori per classe; durata p50, p95, p99; invocazioni per tipo; una mappa di calore delle ore UTC per dimensione del server; **Comandi più usati**, un **Registro delle esecuzioni** paginato, **Comandi con più errori** in cui una riga apre i relativi campioni di errore recenti |
| Events | Eventi gateway al secondo per tipo; conteggio nell'intervallo e una tabella per tipo; eventi per shard; p95 dei gestori per tipo; errori dei gestori per modulo e per tipo di evento |
| Latency | **p95 REST**, **REST 5xx**, **REST 429**, **Rate limit raggiunti**, **p95 DB**, **Errori DB**, **Riconnessioni degli shard**, **Errori non gestiti**; latenza e tasso REST per percorso; hit dei limiti di frequenza per percorso; p95 e errori del database per operazione; CPU, RSS, thread e GC di seconda generazione; una tabella per shard con stato, latenza, picco, server e riconnessioni; gruppi di eccezioni non gestite in cui una riga apre le occorrenze; errori per tipo |
| Servers | **Server**, **Utenti**, **Entrato**, **Uscito**, **Saldo**; snapshot di server e utenti degli ultimi 30 giorni; ingressi e uscite per giorno; churn con tasso di rimbalzo e ingressi e uscite per dimensione; retention per giorno di ingresso; ingressi per dimensione; tabelle **Server rimbalzati** e **Diventati silenziosi** in cui una riga apre la scheda del server |
| Guilds | Selettore del tipo di evento e un minimo di eventi all'ora; un ID server apre la **Scheda del server**, una mappa di calore dell'attività per tipo e ora, un log **Eventi di sicurezza** paginato e filtrabile; **Server principali per eventi**; **Attività insolita** valutata confrontando la stessa ora dei 14 giorni precedenti |
| Features | **Adozione delle funzioni** con i conteggi configurati e attivi dal censimento notturno, server attivi, attività e tasso di errori; funzionalità usate per server; dimensione del server rispetto alle funzionalità usate; per la funzionalità selezionata, **Utilizzo delle impostazioni** dall'ultimo censimento e una serie di censimento configurata o attiva su 90, 180 o 365 giorni |
| AI | **Richieste**, **Token in entrata**, **Token in uscita**, **Costo stimato** ai prezzi di listino per i modelli con prezzo; una tabella per modello con fallimenti, token, p95 e costo; richieste, token e p95 per modello; top server per uso della chat AI |
| Music | **Giocatori**, **Tracce avviate**, **Errori**; player per nodo; tracce avviate per sorgente; errori per tipo; stato dei nodi; tracce terminate per motivo |
| Website | **Visualizzazioni di pagina**, **Visitatori**, **p95 richieste**, **5xx**; visualizzazioni per percorso; durata delle richieste; una tabella per percorso con visitatori, p95 e 5xx; 4xx e 5xx per percorso; un funnel da login a callback OAuth fino alla dashboard con l'abbandono |
| Alerts | Gruppi attivi; la tabella delle regole con abilita, testa, silenzia per 1 ora ed elimina; un log paginato delle transizioni di stato con il valore rispetto alla soglia e se è stato inviato un webhook; **Nuova regola** e **Invia riepilogo ora** |
| Pipeline | Un indicatore di stato; **Ultimo flush**, **Ultimo rollup**, **Ultima manutenzione**, **Serie in attesa**, **Righe in attesa**; l'ultimo errore di flush, se presente; numero di righe e riga più recente per tabella; istanze registrate con heartbeat e ultimo numero di server; durata dei flush e righe per flush |

Lo stato della pipeline è `healthy` quando l'ultimo flush ha al massimo 60 secondi e l'ultimo rollup al massimo 10 minuti, e non c'è alcun errore di flush; altrimenti è `flush stale` o `rollup stale`, `error` quando un flush è fallito, e `disabled` quando analytics è disattivato nella configurazione del bot. Un'istanza il cui ultimo conteggio di server è più vecchio di 3 minuti viene segnata in giallo, e in rosso se più vecchio di 10 minuti.

> [!NOTE]
> Tutto è in UTC. Snapshot, righe del censimento e totali giornalieri vengono scritti una volta a notte, quindi le schede Servers e Features restano vuote finché il bot non è stato in esecuzione almeno una volta oltre le 00:05 UTC.

### Barra dei filtri

La barra sopra le schede si applica a tutte le schede ed è mantenuta nell'URL, quindi cambiare scheda, ricaricare la pagina o condividere il link conserva la stessa vista.

| Controllo | Cosa fa |
| --- | --- |
| Range | `15m`, `1h`, `6h`, `24h`, `7d`, `30d`, oppure un inizio e una fine UTC personalizzati di al massimo 31 giorni |
| compare | Sovrappone sui grafici e sui riquadri che lo supportano lo stesso intervallo di ampiezza del periodo precedente |
| Bot | Una singola istanza, scelta tra quelle note alla pipeline, oppure tutte |
| Shard | Un singolo ID shard oppure tutti |
| guild id | Limita le tabelle grezze e le viste dei server a un solo server; premi Invio per applicare |
| Refresh | Tutto si ricarica ogni 30 secondi mentre la scheda è visibile; il pulsante lo forza |
| Copy link | Copia l'URL attuale con tutti i filtri |

I riquadri aprono un drilldown con le suddivisioni della loro metrica. I grafici possono raggruppare le serie più piccole in **Altro**, attivare un totale progressivo, essere ingranditi con i cursori dell'intervallo e isolare una serie con un clic destro sulla sua voce della legenda.

## Impostazioni

La pagina in sé non ha impostazioni. Le regole di avviso e tre chiavi di configurazione del bot sono tutto ciò che c'è da configurare.

### Regole di avviso

Ogni regola controlla una metrica. I campi dell'editor sono:

| Campo | Significato |
| --- | --- |
| Name, Description, Severity, enabled | Etichetta e `info`, `warning` o `critical`, che imposta il colore e il titolo del webhook |
| Metric, Filters, Group by | Qualsiasi metrica salvata, filtri facoltativi per etichetta e un'etichetta facoltativa per valutare ogni valore separatamente, ad esempio per `shard` |
| Agg, Window | `sum`, `avg`, `min`, `max`, `last`, `rate`, `count`, `p50`, `p95` o `p99` su un intervallo da 1 minuto a 1 giorno |
| Comparator, Threshold, High | `gt`, `gte`, `lt`, `lte`, `outside` (sotto Threshold o sopra High), `pct_change` (percentuale rispetto alla stessa finestra di un periodo di riferimento precedente), `deviates` (punteggio z rispetto alla media degli ultimi N giorni), `nodata` (nessun dato nella finestra) |
| Baseline, Direction | Per `pct_change` e `deviates`: ieri o la settimana scorsa, e `up`, `down` o `both` |
| For | Per quanto tempo la violazione deve persistere prima che la regola scatti; `immediately` salta lo stato in attesa |
| Cooldown | Intervallo minimo tra le notifiche di attivazione |
| Repeat | Notifica di nuovo mentre resta attiva, oppure una sola volta |
| Min samples | Salta la valutazione quando la finestra contiene meno campioni di questo numero |
| Webhook URL, Mention role id, Thread id | Un webhook di Discord, un ruolo facoltativo da menzionare all'attivazione, un thread facoltativo in cui pubblicare |
| Quiet from, Quiet to | Una finestra UTC, che può attraversare la mezzanotte, durante la quale non viene inviato nulla |
| notify on resolve | Pubblica anche quando il gruppo torna alla normalità |

Il grafico di anteprima a destra disegna la soglia della bozza come una fascia tratteggiata per i comparatori assoluti.

Le regole vengono valutate ogni minuto. Ogni gruppo passa da `ok` a `pending` (solo se è impostato For) a `firing`, e poi di nuovo a `ok`; il log degli eventi registra la transizione da `firing` a `ok` come `resolved`. Silenziare dalla tabella disattiva una regola per 1 ora; l'API consente fino a 30 giorni. Le regole silenziate e le finestre di silenzio cambiano comunque stato, semplicemente non pubblicano. **Invia test** invia un messaggio di prova al webhook della regola.

### Chiavi di configurazione del bot

Impostale in `bot.yml` oppure con il comando `config` del proprietario. Tutte sono predefinite su attivo, 30 e vuoto.

| Chiave | Significato |
| --- | --- |
| `analyticsEnabled` | `false` rende il collector inattivo; la scheda Pipeline mostra `disabled` |
| `analyticsRetentionDays` | Giorni per cui vengono conservate le righe grezze dei comandi, le visualizzazioni di pagina e il log degli eventi dei server |
| `analyticsDigestWebhook` | Webhook di Discord a cui viene inviato il riepilogo settimanale; vuoto disattiva il riepilogo |

### Cosa viene conservato e per quanto tempo

| Dati | Conservati per |
| --- | --- |
| Blocchi da 1 minuto | 48 ore |
| Blocchi da 5 minuti | 14 giorni |
| Blocchi orari | 400 giorni |
| Invocazioni dei comandi, visualizzazioni di pagina, eventi di sicurezza dei server | `analyticsRetentionDays` |
| Campioni di errore, attività oraria per server di funzionalità ed eventi | 90 giorni |
| Eventi di avviso | 180 giorni |
| Snapshot giornalieri, censimento, totali giornalieri | Non eliminati |

Le righe grezze vengono scaricate ogni 15 secondi, i blocchi da 1 minuto ogni minuto; i blocchi da 1 minuto si uniscono in quelli da 5 minuti ogni 5 minuti e quelli da 5 minuti in quelli orari, mentre l'eliminazione viene eseguita ogni 6 ore.

### Cosa non viene mai salvato

- Il contenuto dei messaggi. Le righe dei comandi contengono il nome del comando, il modulo, il tipo, l'esito, i tempi e, in caso di errore, la classe dell'eccezione e fino a 200 caratteri del suo messaggio.
- Gli ID utente. Nulla in analytics è associato a chi ha eseguito un comando.
- Gli IP dei client. Le visualizzazioni di pagina conservano un hash del visitatore calcolato da IP e user agent con un salt che ruota ogni giorno, così un visitatore non può essere seguito da un giorno all'altro. Le richieste a `/api/`, `/cdn/`, le risorse statiche e la stessa pagina Analytics non vengono registrate.

I server e gli utenti che hanno scelto di non partecipare alle statistiche sono rispettati: il loro comando conta comunque nell'aggregato, ma la riga grezza viene scritta senza l'ID del server e la dimensione del server.

## Procedura di configurazione

1. Accedi alla dashboard con un account proprietario del bot e apri **Analisi** dalla barra laterale. Compare solo ai proprietari.
2. Apri prima **Pipeline**. L'indicatore dovrebbe leggere `healthy` e ogni istanza dovrebbe avere un heartbeat recente; un flush vecchio significa che il bot non sta scrivendo.
3. Scegli un intervallo e, se esegui più istanze, un bot nella barra dei filtri. Spunta **confronta** per vedere il periodo precedente.
4. Vai su **Avvisi**, premi **Nuova regola**, scegli una metrica come `shard.latency` con `max` su 5 minuti, `gt` con il tuo limite, raggruppa per `shard`, incolla un webhook e premi **Invia test** sulla riga salvata.
5. Imposta `analyticsDigestWebhook` nella configurazione del bot, poi premi **Invia riepilogo ora** per vedere come sarà il messaggio del lunedì.
6. Torna dopo una notte per **Server**, **Funzioni** e le serie del censimento.

## Comandi

La pagina Analytics è disponibile solo dalla dashboard; non esiste un modulo del bot corrispondente. Il comando `config` del proprietario modifica le tre chiavi sopra, e alcuni comandi del proprietario coprono aspetti collegati in chat. Eseguili con il prefisso del tuo server (`.` se non lo hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `config bot analyticsEnabled false` | `conf` | Proprietario del bot | Interrompe la registrazione di analytics; `true` la riavvia |
| `config bot analyticsRetentionDays 14` | `conf` | Proprietario del bot | Cambia per quanto tempo vengono conservate le righe grezze |
| `config bot analyticsDigestWebhook <url>` | `conf` | Proprietario del bot | Dove va il riepilogo del lunedì |
| `stats` | | Nessuno | Versione del bot, comandi eseguiti ogni cinque secondi, memoria, conteggi della cache, shard e uptime |
| `commandstats` | `cstats` | Proprietario del bot | Comando, modulo, server e utente più usati |
| `shardstats` | | Proprietario del bot | Stato di ogni shard |

## Suggerimenti e insidie

- La pagina verifica la proprietà tramite il bot, quindi un account che è proprietario su un'istanza del bot ma non su un'altra verrà reindirizzato sulla seconda.
- Il riepilogo viene inviato il lunedì alle 09:00 UTC o dopo, e copre i sette giorni precedenti confrontati con i sette ancora prima: server, comandi, errori, eventi, server nuovi e persi, visualizzazioni di pagina, token AI, tracce musicali, oltre ai primi cinque comandi, errori e funzionalità.
- Le serie su intervalli lunghi provengono dai blocchi orari, quindi i percentili risultano più lisci; restringi l'intervallo per vedere i dettagli al minuto, che esistono solo per le ultime 48 ore.
- Se il buffer in memoria del collector si riempie prima di un flush, le righe grezze extra dei comandi vengono scartate per quell'intervallo, mentre gli aggregati continuano a contare; un valore in crescita di **Righe in attesa** nella pipeline ne è il segnale.
- Le regole di avviso richiedono un URL webhook di Discord; qualsiasi altro valore viene rifiutato al salvataggio.
- Il costo stimato dell'AI copre solo i modelli con un prezzo di listino noto, quindi il totale è una soglia minima.

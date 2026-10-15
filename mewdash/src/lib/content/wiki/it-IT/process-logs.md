---
title: Log dei processi
slug: process-logs
summary: Una pagina della dashboard riservata ai soli proprietari del bot che elenca i processi gestiti da pm2 sull'host del bot e permette di leggere, seguire, filtrare e scaricare i loro log della console.
icon: fa-rectangle-code
category: Analytics
dashboard: /owner/process-logs
tags: [pm2, logs, console, stdout, stderr, tail, process, crash, stack trace, owner, log, processi, console, traccia dello stack, arresto anomalo, proprietario]
related: [performance, analytics, leave-feedback]
---

## Cosa fa

Log dei processi mostra ciò che il bot scrive sulla sua console, direttamente dai file di log che pm2 conserva per lui, senza aprire una shell sul server. È visibile solo ai proprietari del bot: la barra laterale lo nasconde a tutti gli altri, chi apre direttamente l'URL viene rispedito alla home della dashboard, e il bot stesso rifiuta le richieste a meno che l'account con cui si è effettuato l'accesso non sia un proprietario.

La pagina chiede all'istanza del bot selezionata la tabella dei processi di pm2. Vengono elencati tutti i processi gestiti da pm2 su quell'host, non solo il bot, con stato, pid, uptime, numero di riavvii, CPU e memoria, e la dimensione dei suoi due file di log. Scegline uno e la pagina carica le ultime centinaia di righe del suo log stdout, poi aggiunge le nuove righe ogni due secondi circa mentre **Seguendo** è attivo.

Le righe mantengono i colori con cui le stampa Serilog, e ogni riga è etichettata con il suo livello, così puoi nascondere il rumore. Le righe di continuazione, come le tracce dello stack, restano collegate alla riga sopra di loro, quindi nascondere le info non lascia tracce orfane.

## Perché usarlo

- Il bot si è riavviato o è andato in crash e vuoi l'ultima cosa che ha detto prima di cadere, che si trova sul lato stderr.
- Un membro segnala che un comando fallisce e vuoi seguire il log in tempo reale mentre riprova.
- Vuoi cercare qualche migliaio di righe recenti per un ID server o un messaggio senza collegarti via SSH.
- Ti serve il file di log completo per una segnalazione di bug e lo vuoi come download.

## Controlli

| Controllo | Cosa fa |
| --- | --- |
| Schede dei processi | Una per ogni processo pm2 sull'host. La scheda contrassegnata come **questo bot** è l'istanza che risponde alla richiesta. Clicca su una per leggerne i log. |
| **stdout** / **stderr** | Passa dal log di output del processo, dove finisce il normale logging, al suo log degli errori, dove arrivano arresti anomali e diagnostica di runtime. |
| **100** fino a **2k** | Quante righe caricare quando il log viene aperto o ricaricato. La modalità di follow mantiene fino a 5.000 righe nella pagina prima di iniziare a scartare le più vecchie. |
| Casella di filtro | Nasconde ogni riga il cui testo non contiene quanto hai scritto. Le maiuscole non contano. |
| **Seguendo** / **Segui** | Attiva e disattiva gli aggiornamenti in tempo reale. Quando è attivo, la pagina controlla le nuove righe ogni due secondi e scorre con esse, a meno che tu non sia salito con lo scorrimento. |
| **A capo** | Va a capo sulle righe lunghe invece di scorrere in orizzontale. |
| **Copia** | Copia negli appunti le righe visibili, senza colori. |
| **Ricarica** | Rilegge la coda dal file. |
| **Download** | Salva l'intero file di log così come si trova su disco, con i codici colore. La dimensione accanto indica la dimensione attuale del file. |
| Chip dei livelli | **VRB**, **DBG**, **INF**, **WRN**, **ERR** e **FTL**, ciascuno con il numero di righe etichettate caricate. Clicca su uno per nascondere o mostrare quel livello. |

Quando scorri verso l'alto durante il follow, le nuove righe vengono trattenute e un pulsante in basso a destra indica quante ne sono in attesa. Cliccalo per tornare in fondo e riprendere a scorrere con il log.

> [!NOTE]
> Una singola lettura è limitata a 1 MB. Se le righe richieste non ci stanno, la pagina ti avvisa che sono state saltate quelle più vecchie; scarica il file per vedere tutto.

## Come il bot trova i log

Il bot esegue `pm2 jlist` sul proprio host e legge i percorsi dei file di log che pm2 riporta per ogni processo. Lo fa solo quando un daemon pm2 è già in esecuzione per lo stesso utente, così non ne avvia mai uno per sbaglio. Se pm2 è installato ma non può essere interrogato, la pagina ripiega sui file della directory dei log di pm2 e lo segnala. Se pm2 non è installato affatto, la pagina lo spiega invece di mostrare un elenco vuoto.

Su una dashboard collegata a più istanze del bot, l'elenco dei processi appartiene all'istanza selezionata, dato che ogni istanza può vedere solo il proprio host.

## Procedura di configurazione

1. Esegui il bot sotto pm2 sul suo server, ad esempio con `pm2 start dotnet --name mewdeko -- Mewdeko.dll`.
2. Accedi alla dashboard con un account proprietario del bot e apri **Log di processo** dalla barra laterale.
3. Scegli il processo contrassegnato come **questo bot**, oppure un altro processo qualsiasi sull'host.
4. Lascia **Seguendo** attivo per seguire il log in tempo reale, oppure disattivalo e usa il filtro e i chip dei livelli per esplorare ciò che è stato caricato.
5. Passa a **stderr** dopo un arresto anomalo per leggere ciò che il runtime ha stampato mentre cadeva.

## Suggerimenti e insidie

- I log vengono letti dai file, quindi un processo avviato al di fuori di pm2 qui non ha log. L'output della console del bot compare solo se il bot stesso viene eseguito sotto pm2.
- pm2 ruota o svuota i file quando esegui `pm2 flush` oppure usi `pm2-logrotate`. La pagina si accorge che il file si è ridotto e ricarica la coda da sola.
- Il filtro e i chip dei livelli si applicano solo alle righe già caricate. Carica più righe, oppure scarica il file, quando cerchi più indietro nel tempo.
- Nulla in questa pagina modifica il bot. Da qui non è possibile riavviare processi né cancellare i log; a questo provvedono il comando del proprietario `restartinstance` e `pm2 flush` sul server.

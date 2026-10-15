---
title: Prestazioni
slug: performance
summary: Una pagina della dashboard riservata ai proprietari del bot che mostra CPU, memoria, uptime, i metodi più lenti e quanti eventi Discord ogni modulo sta elaborando e quanti ne falliscono.
icon: fa-clock
category: Analytics
dashboard: /owner/performance
tags: [performance, metrics, cpu, memory, latency, monitoring, uptime, events, modules, owner, prestazioni, metriche, cpu, memoria, latenza, monitoraggio, uptime, eventi, moduli, proprietario]
related: [analytics, leave-feedback, administration]
---

## Cosa fa

Prestazioni è una pagina di monitoraggio per chi gestisce il bot. È visibile solo ai proprietari del bot: la barra laterale la nasconde a tutti gli altri, e se qualcuno che non è proprietario apre direttamente l'URL viene rimandato alla home della dashboard. Non c'è nulla qui che lo staff del server possa configurare.

La pagina legge i numeri in tempo reale dal processo del bot in esecuzione. Una scheda mostra le risorse di sistema, una elenca i metodi che consumano più tempo di CPU, e due suddividono la gestione degli eventi Discord per tipo di evento e per modulo del bot, con conteggi, tempo medio di esecuzione e percentuale di errori. Tutto si aggiorna da solo mentre la pagina è aperta.

I numeri su eventi e moduli provengono dal gestore interno degli eventi del bot, che registra ogni evento del gateway che invia. I tempi dei metodi provengono dal monitor delle prestazioni che avvolge i metodi tracciati. Entrambi sono solo in memoria, quindi si azzerano al riavvio del bot, e le metriche degli eventi si azzerano da sole ogni ora. Per la cronologia salvata degli stessi numeri, usa [Analisi](/wiki/analytics).

## Perché usarlo

- Il bot sembra lento e vuoi vedere se la causa sono la CPU, la memoria o un singolo metodo lento.
- Un modulo sta generando errori e vuoi la percentuale di errori per modulo senza leggere i log.
- Vuoi verificare che la memoria sia stabile dopo un deploy osservandola per qualche minuto.
- Ti servono uptime e numero di thread per una richiesta di supporto.

## Schede

| Scheda | Sezione | Cosa mostra | Aggiornamento |
| --- | --- | --- | --- |
| Overview | System Resources | **Uso CPU**, **Uso memoria** (usata e totale), **Uptime**, **Numero di thread** e **Metodi più intensivi in CPU** con il loro tempo medio | Ogni 5 secondi |
| Methods | Method Performance | Ogni metodo tracciato con **Chiamate**, **Tempo medio**, **Tempo totale** e **Ultima esecuzione**; ordinabile per qualsiasi colonna, con un pulsante che cancella i dati raccolti | Ogni 30 secondi |
| Events | Event Metrics | **Eventi totali**, **Errori totali**, **Tipi di evento** e **Tasso di errore medio**, poi ogni tipo di evento Discord con il numero di elaborazioni, errori, tempo di esecuzione e percentuale di errori | Ogni 10 secondi |
| Modules | Module Metrics | **Moduli attivi**, **Eventi totali**, **Errori totali** e **Tasso di errore medio**, poi ogni modulo con eventi elaborati, errori, tempo di esecuzione e percentuale di errori | Ogni 10 secondi |

L'uso della CPU viene campionato per mezzo secondo ogni volta che la scheda Overview si aggiorna, ed è riferito solo al processo del bot, non all'intera macchina. La memoria è il working set del processo. La memoria totale viene letta dall'host su Windows e Linux e su altri sistemi viene mostrata come 0.

> [!NOTE]
> La scheda Methods è vuota finché non sono stati eseguiti dei metodi tracciati. Usa il bot per un po', poi torna.

## Impostazioni

Non ci sono impostazioni. L'unica azione è il pulsante di cancellazione nella scheda Methods, che azzera i tempi dei metodi. Le metriche di eventi e moduli non possono essere cancellate a mano; si azzerano ogni ora.

## Guida alla configurazione

1. Accedi alla dashboard con un account proprietario del bot.
2. Apri **Prestazioni** dalla barra laterale. Compare solo per i proprietari.
3. Lascia aperta **Panoramica** per un minuto per vedere CPU e memoria stabilizzarsi.
4. Passa a **Moduli** e ordina per errori per trovare ciò che non funziona, poi **Eventi** per vedere quali tipi di evento sono i più frequenti.
5. Usa **Metodi** per individuare i metodi lenti, e cancellalo dopo una correzione per misurare di nuovo.

## Comandi

La pagina Prestazioni è solo dashboard; non esiste un modulo del bot corrispondente. Alcuni comandi per proprietari coprono argomenti collegati in chat. Esegui questi comandi con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `stats` | | Nessuno | Versione del bot, comandi eseguiti ogni cinque secondi, memoria, conteggi della cache, shard e uptime |
| `commandstats` | `cstats` | Proprietario del bot | Comando, modulo, server e utente più usati |
| `shardstats` | | Proprietario del bot | Stato di ogni shard |

## Suggerimenti e insidie

- La pagina verifica la proprietà tramite il bot, quindi un account che è proprietario su un'istanza del bot ma non su un'altra verrà reindirizzato sulla seconda.
- I numeri sono per processo. Su un bot shardato distribuito su più processi, vedi il processo a cui è collegata la dashboard.
- Nulla di questa pagina viene salvato. Se ti serve la cronologia, annota i valori o fai degli screenshot.
- Un'alta percentuale di errori su un tipo di evento di solito indica un modulo che ascolta quell'evento; controlla dopo la scheda Modules.

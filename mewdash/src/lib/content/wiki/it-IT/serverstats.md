---
title: Statistiche di attività
slug: serverstats
summary: Messaggi, tempo in vocale, giochi e crescita dei membri per l'intero server, per un membro o per un canale su qualsiasi intervallo fino a novanta giorni, con grafici, classifiche, esportazioni e opt-out per la privacy.
icon: fa-chart-simple
category: Analytics
dashboard: /dashboard/serverstats
module: ServerStats
tags: [activity, stats, statistics, statbot, voice time, games, presence, lookback, top chatters, charts, member growth, status, snapshots, privacy, opt out, attività, statistiche, tempo in vocale, giochi, presenza, intervallo, classifica messaggi, grafici, crescita membri, stato, istantanee, privacy, opt-out]
related: [messagestats, statroles, liveboards, statchannels, invites]
---

## Cosa fa

Il bot contava già i messaggi. Le Statistiche di attività aggiungono il tempo in vocale, i giochi e le app, istantanee orarie di membri e stati, e un modo per chiedere informazioni su tutto questo su un intervallo: l'ultimo giorno, la settimana, il mese, fino a novanta giorni, oppure per sempre. Tutto è disponibile nella dashboard, come comandi, come grafici, come CSV, e per i ruoli statistica, le bacheche live, i report e i canali statistica.

## Cosa viene tracciato

| Dato | Come |
| --- | --- |
| Messaggi | Ogni messaggio conteggiato con un timestamp, conservato per novanta giorni, più i totali storici per membro e canale |
| Tempo in vocale | Un segmento per membro per canale, diviso ogni volta che il membro si sposta, si silenzia, si rende sordo, inizia a trasmettere o attiva la telecamera; conservato per novanta giorni, più i totali storici |
| Giochi e app | Un segmento per membro per attività (in gioco, in streaming, in ascolto, in visione, in competizione), conservato per novanta giorni, più i totali storici. Disattivato per impostazione predefinita |
| Istantanee | Conteggi di membri, umani, bot, online, inattivi, non disturbare, offline e in vocale ogni ora, conservati per novanta giorni |
| Ingressi e uscite | Ogni ingresso e uscita con un timestamp |

Gli intervalli fino a novanta giorni leggono i dati con timestamp. **Sempre** legge i totali storici, quindi continua a funzionare anche quando i dati dei novanta giorni scadono.

## Giochi e app

Il tracciamento dei giochi è disattivato finché non lo attivi, perché è il tracker più pesante. Una volta attivo, il bot osserva la presenza di ogni membro e registra per quanto tempo durano ciascun gioco, streaming, sessione Spotify o app guardata.

- **Verifica attività** (attivo per impostazione predefinita) conta solo le attività che Discord stesso certifica: quelle con un ID applicazione registrato, Spotify e gli streaming. Un client modificato può dichiarare di giocare a qualsiasi cosa, quindi mentre questa opzione è attiva le attività con semplice nome vengono ignorate.
- Il **filtro attività** è un elenco di nomi di giochi che funziona come **lista nera** (i giochi elencati vengono ignorati) oppure come **lista bianca** (contano solo quelli elencati).
- Gli stati personalizzati non vengono mai conteggiati.

## Schede della dashboard

| Scheda | Cosa mostra |
| --- | --- |
| Panoramica | Messaggi, tempo in vocale, chi scrive, ingressi, uscite, crescita netta, membri adesso, il membro che scrive di più, il membro più attivo in vocale, il canale più trafficato e il gioco più giocato, e grafici per messaggi, ore in vocale, membri, stato dei membri e ingressi e uscite |
| Classifiche | Membri e canali ordinati per messaggi, tempo in vocale o tempo di gioco, e i giochi più giocati con il numero di giocatori, esportabili in CSV. Clicca su un membro, un canale o un gioco per aprirlo |
| Membro e canale | Messaggi, tempo in vocale, posizioni, totali storici, canali e giochi preferiti di un membro; attività e membri principali di un canale; e **Chi gioca** per qualsiasi gioco |
| Impostazioni | Ogni tracker, l'intervallo predefinito, l'attesa tra messaggi, i bot, gli stati vocali che non contano, i canali ignorati, i ruoli e i membri, e il filtro attività |

## Impostazioni

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Intervallo predefinito | 14 giorni | Ciò che usano i comandi e questa pagina quando non viene indicato un intervallo |
| Attesa tra i messaggi | 0 | Secondi tra messaggi conteggiati dello stesso membro. Evita che lo spam gonfi i conteggi |
| Traccia tempo in vocale | attivo | Se i segmenti vocali vengono registrati |
| Istantanee orarie | attivo | Se i conteggi di membri e stati vengono campionati ogni ora |
| Conta i bot | disattivato | Se gli account bot vengono inclusi |
| Traccia giochi e app | disattivato | Se le attività di presenza vengono registrate |
| Verifica attività | attivo | Conta solo le attività certificate da Discord |
| Stati vocali che non contano | nessuno | Qualsiasi tra: auto-mute, auto-sordità, mute del server, sordità del server, canale AFK, da solo, in streaming, telecamera accesa |
| Canali, ruoli e membri ignorati | nessuno | Niente di ciò che proviene da questi viene conteggiato |

## Privacy

Qualsiasi membro può eseguire `statsprivacy` (oppure `/serverstats privacy`) per uscire dal tracciamento. I suoi messaggi, il suo tempo in vocale e il suo tempo di gioco registrati vengono eliminati in ogni server che il bot condivide con lui, e non viene registrato nulla di nuovo finché non esegue di nuovo il comando per rientrare. Gli amministratori del server non possono annullarlo.

## Comandi

Usali con il prefisso del tuo server (`.` se non l'hai cambiato). Ogni comando esiste anche sotto `/serverstats`. `days` è l'intervallo; 0 significa sempre e omettere il valore usa il predefinito del server.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `serveractivity [days]` | `sstats` | Nessuno | La panoramica del server |
| `useractivity [@user] [days]` | `ustats`, `mystats` | Nessuno | Messaggi, tempo in vocale, posizioni, totali storici, canali e giochi principali di un membro |
| `channelactivity [#channel] [days]` | `cstats` | Nessuno | Attività di un canale e membri principali |
| `activitytop [Messages/Voice/Activity] [days] [@role]` | `topchatters`, `topvoice` | Nessuno | Classifica dei membri |
| `activitytopchannels [Messages/Voice] [days]` | `topchannels` | Nessuno | Classifica dei canali |
| `topgames [days]` | `games` | Nessuno | I giochi e le app più usati |
| `whoplays <game>` | | Nessuno | Chi sta giocando adesso e chi l'ha giocato di più |
| `activitychart [Messages/Voice/Members/Status/Joins/Leaves/Growth/InVoice/Activities] [days]` | `graph` | Nessuno | Un'immagine con il grafico |
| `activityexport [Messages/Voice/Activity] [days]` | | Gestisci server | Una classifica in CSV |
| `statssettings` | | Gestisci server | Mostra le impostazioni |
| `statslookback <days>`, `statscooldown <seconds>` | `lookback` | Gestisci server | Intervallo predefinito e attesa tra i messaggi |
| `statstrackvoice`, `statstracksnapshots`, `statscountbots`, `statstrackactivities`, `statsverifyactivities` | `trackvoice`, `trackgames` | Gestisci server | Attiva o disattiva ciascun tracker |
| `statsignorevoicestate <state>` | | Gestisci server | Attiva o disattiva il conteggio di uno stato vocale |
| `statsignore <#channel, @role or @user>`, `statsignored` | | Gestisci server | Esclusioni |
| `statsactivityfiltermode <Whitelist/Blacklist>`, `statsactivityfilter <game>`, `statsactivityfilters` | `gamefilter` | Gestisci server | Il filtro attività |
| `statsprivacy` | `optoutstats` | Nessuno | Esce dal tracciamento ovunque, oppure vi rientra |

## Suggerimenti e insidie

- I grafici di membri e stati iniziano a riempirsi un'ora dopo che le istantanee sono attivate; non esiste uno storico precedente.
- Il tempo in vocale viene conteggiato solo mentre il bot è in esecuzione. Un riavvio chiude e riapre ogni sessione, quindi non si perde nulla, ma i confini dei segmenti si spostano.
- Escludere un canale nasconde la sua cronologia da ogni query oltre a interrompere i nuovi conteggi, quindi anche i numeri passati cambiano.
- Il conteggio dei messaggi deve comunque essere attivo (l'interruttore nella pagina Statistiche messaggi) perché i numeri dei messaggi compaiano qui.
- I nomi dei giochi vengono confrontati senza distinguere maiuscole e minuscole nel filtro e in `whoplays`.

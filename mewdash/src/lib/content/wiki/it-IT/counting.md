---
title: Conteggio
slug: counting
summary: Trasforma un canale in un gioco di conteggio in cui i membri si alternano pubblicando il numero successivo, con reazioni, serie, classifiche, punti di salvataggio e punizioni facoltative per chi rompe il conteggio.
icon: fa-list-numeric
category: Community
dashboard: /dashboard/counting
module: Counting
tags: [counting, count, numbers, game, channel, leaderboard, streak, milestones, save point, conteggio, numeri, gioco, canale, classifica, serie, traguardi, punto di salvataggio]
related: [administration, xp]
---

## Cosa fa

Lo staff sceglie un canale ed esegue `countingsetup`. Da quel momento il bot controlla ogni messaggio in quel canale. Se un messaggio è il numero successivo atteso, il bot reagisce con una spunta e registra il conteggio per quel membro. Se il numero è sbagliato, il bot reagisce con una croce e, per impostazione predefinita, elimina il messaggio due secondi dopo, così il canale resta pulito.

Il bot tiene traccia del numero corrente, del numero più alto mai raggiunto, del numero totale di conteggi e di chi ha contato per ultimo. Per impostazione predefinita, lo stesso membro non può contare due volte di seguito, quindi il gioco richiede almeno due persone. I membri possono controllare le proprie statistiche, serie e precisione, ed esiste una classifica per canale.

Per lo staff ci sono i punti di salvataggio, che permettono di riportare indietro il conteggio dopo una brutta serie, un livello di moderazione che tiene traccia dei conteggi sbagliati per membro entro una finestra temporale e applica punizioni a più livelli, divieti e timeout dal conteggio, e regole sui ruoli che stabiliscono chi può partecipare. Più canali possono usare il conteggio contemporaneamente, ciascuno con le proprie impostazioni.

## Perché usarlo

- Un gioco di comunità a basso impegno che va avanti da solo e dà ai membri un obiettivo comune.
- Nei server grandi si possono aggiungere un cooldown e la regola contro le ripetizioni, così una persona non può monopolizzare il conteggio.
- Lo staff può ripristinare il conteggio da un punto di salvataggio invece di discutere su chi ha sbagliato.
- Chi continua a rompere il conteggio di proposito può essere silenziato o bandito dal conteggio automaticamente.

## Come viene verificato un conteggio

Quando un membro scrive in un canale di conteggio, il bot esegue questi controlli in ordine:

1. I membri banditi dal conteggio vengono ignorati completamente.
2. I membri con un ruolo bannato, senza uno dei ruoli richiesti o con un ruolo ignorato vengono saltati. I messaggi di ruoli ignorati vengono eliminati se lo hai richiesto.
3. Se il messaggio sembra un numero valido, il bot verifica di poter reagire. Se la reazione non riesce, considera il membro come uno che ha bloccato il bot, elimina il messaggio e pubblica un breve avviso che scompare dopo cinque secondi.
4. Un membro ancora in **Pausa** viene respinto.
5. Se **Consenti utenti ripetuti** è disattivata e lo stesso membro ha contato per ultimo, il messaggio viene respinto.
6. Il testo viene analizzato con il pattern del canale. Ciò che non è un numero viene gestito dalle regole sui non numeri descritte sotto.
7. Il numero deve essere uguale al numero corrente più l'**Incremento**. Un numero sbagliato conta come errore per quel membro e, se **Reimposta il conteggio in caso di errore** è attivo, il canale torna al numero iniziale.
8. Se **Numero massimo** è impostato e il numero lo supera, il conteggio si ferma e lo staff viene avvisato.

Un conteggio corretto aggiorna il canale, le statistiche e la serie del membro, avvia il suo cooldown, controlla i traguardi e registra l'evento.

I conteggi corretti ricevono la reazione **Emoji di successo** (una spunta per impostazione predefinita), mentre quelli sbagliati ricevono la reazione **Emoji di errore** (una croce per impostazione predefinita). Entrambe possono essere un'emoji standard o un emote personalizzato.

## Pattern di conteggio

Il pattern decide come i membri devono scrivere i numeri. Il bot riconosce questi pattern:

| Pattern | Cosa scrivono i membri |
| --- | --- |
| Normal | Cifre semplici: `1`, `2`, `3`. Con una **Base numerica** diversa da 10, le cifre vengono lette in quella base. |
| Roman | Numeri romani: `I`, `II`, `III`, `IV` |
| Binary | `1`, `10`, `11`, `100` |
| Hexadecimal | Da `1` a `9`, poi `A`, `B`, `C` |
| Words | Parole scritte come `twenty-one` oppure `one hundred and five` |
| Ordinal | `1st`, `2nd`, `3rd`, `4th` |
| Fibonacci | La sequenza di Fibonacci: `1`, `1`, `2`, `3`, `5`, `8` |
| Primes | Solo numeri primi: `2`, `3`, `5`, `7`, `11` |

Normal è il pattern predefinito. Il pattern si imposta dalla dashboard; non esiste un comando per farlo.

> [!WARNING]
> Il menu a tendina **Schema di conteggio** della dashboard elenca al momento Sequential, Skip Multiples, Fibonacci, Primes e Powers of Two, e i suoi valori non corrispondono all'elenco dei pattern del bot descritto sopra. Per ora, dalla dashboard, è sicuro scegliere solo Sequential (Normal).

## Traguardi

Il bot registra un traguardo la prima volta che il conteggio raggiunge un multiplo di 100, 500, 1.000, 5.000 o 10.000. I traguardi compaiono nella scheda **Statistiche** e in `countingstatus`.

La scheda **Gestione** della dashboard e `countingmilestones` permettono di salvare un elenco personalizzato di numeri traguardo per canale; la stessa scheda e `countingmilestonemessage` salvano un messaggio per i traguardi, mentre `countingmilestonechannel` salva un canale per gli annunci dei traguardi. Questi valori vengono memorizzati, ma il bot non pubblica ancora alcun annuncio di traguardo, quindi vanno considerati riservati a una versione futura.

## Statistiche e classifiche

Ogni membro ha statistiche per canale: contributi, serie attuale, serie più lunga, precisione, errori, numeri totali contati e ultimo contributo. `countingstats` le mostra insieme alla posizione del membro in classifica.

`countingleaderboard` e la scheda **Classifica** ordinano per uno di quattro tipi:

| Tipo | Ordinato per |
| --- | --- |
| `contributions` | Numero di conteggi corretti (predefinito) |
| `streak` | Serie più lunga |
| `accuracy` | Conteggi corretti in percentuale |
| `totalnumbers` | Numeri totali contati |

Il comando mostra i primi 20, dieci per pagina.

## Punti di salvataggio

`countingsave` memorizza il numero corrente con un motivo facoltativo e ti fornisce un ID di salvataggio. `countingrestore <id>` riporta il canale a quel numero dopo una richiesta di conferma. `countingreset` imposta direttamente il conteggio su un numero qualsiasi, con conferma, e il valore predefinito è 0. Tutti e tre sono disponibili anche nella scheda **Gestione**.

## Moderazione

La moderazione del conteggio è disattivata finché non la abiliti, sia per canale con `countmodenable true` sia a livello di server con `countmoddefaults true`. Le impostazioni del canale hanno la precedenza sui valori predefiniti del server; `countmodreset` riporta un canale ai valori predefiniti.

Quando è attiva, ogni numero sbagliato viene registrato a carico del membro e aggiunto al suo conteggio di errori per la **finestra temporale** (predefinita 24 ore, da 1 a 168). Le punizioni a più livelli scattano quando il conteggio di un membro raggiunge un numero esatto: `countmodpunish 3 Mute 30` silenzia per 30 minuti al terzo conteggio sbagliato. I livelli impostati con un canale si applicano a quel canale; i livelli impostati senza canale sono i valori predefiniti del server, e i livelli del canale hanno la precedenza. `Softban`, `Kick` e `RemoveRoles` non accettano una durata, e le durate arrivano al massimo a 49 giorni. `AddRole` richiede un ruolo.

Due regole extra si applicano solo quando la moderazione è attiva:

- **Non numeri**: `countmodnonnumbers` decide se i messaggi di chat nel canale vengono eliminati (predefinito sì) e se contano come infrazione (predefinito no).
- **Modifiche**: `countmodedits` decide se modificare un messaggio nel canale lo elimina (predefinito sì) e se conta come infrazione (predefinito no).

Regole sui ruoli: **Ruoli richiesti** significa che un membro ne deve avere almeno uno per contare, **Ruoli bannati** blocca i membri che ne hanno anche solo uno, e `countmodignore` salta i membri con i ruoli indicati ed eventualmente elimina i loro messaggi.

`countingban`, `countingtimeout` e `countingunban` bloccano un singolo membro in un canale, in modo permanente oppure per una durata. La scheda **Gestione** offre gli stessi controlli tramite ID utente, più un pulsante **Cancella i dati del canale** che corrisponde a `countingdisable` con purge.

## Impostazioni

La dashboard ha cinque schede: **Canali**, **Configurazione**, **Statistiche**, **Classifica** e **Gestione**. Scegli prima un canale in **Canali**; le altre schede agiscono su quel canale.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Start Number | 1 | Il numero da cui parte il conteggio, impostato in fase di configurazione |
| Increment | 1 | Quanto aggiunge ogni conteggio; deve essere positivo |
| Counting Pattern | Normal | Come vengono scritti i numeri, vedi sopra |
| Number Base | 10 | Base usata dal pattern Normal |
| Cooldown (seconds) | 0 | Attesa tra due conteggi dello stesso membro, da 0 a 300 |
| Max Number | 0 (illimitato) | Il conteggio si ferma quando viene superato |
| Success Emote | spunta | Reazione su un conteggio corretto |
| Error Emote | croce | Reazione su un conteggio sbagliato |
| Allow repeated users | Off | Consente a un membro di contare due volte di seguito |
| Reset count on error | Off | Un numero sbagliato riporta il canale al valore iniziale |
| Delete wrong messages | On | Elimina i numeri sbagliati dopo due secondi |
| Enable achievements | On | Flag memorizzato, mostrato in `countingconfig` |
| Enable competitions | On | Flag memorizzato, mostrato in `countingconfig` |
| Required Roles | nessuno | I membri ne devono avere uno per contare |
| Banned Roles | nessuno | I membri con questi ruoli non possono contare |

> [!NOTE]
> Il comando `countingfailurethreshold` memorizza un valore da 1 a 10 (predefinito 3) e `countmodthreshold` memorizza una soglia di conteggi sbagliati, ma le punizioni scattano solo dai livelli impostati con `countmodpunish`.

## Procedura di configurazione

1. Crea un canale e concedi al bot, lì, i permessi Visualizza canale, Invia messaggi, Aggiungi reazioni, Gestisci messaggi e Cronologia messaggi.
2. Apri **Conteggio** nella dashboard, scegli il canale in **Configura nuovo canale di conteggio**, imposta **Numero iniziale** e **Incremento**, poi salva.
3. In **Configurazione**, imposta un **Pausa** se vuoi rallentare il gioco, e scegli gli emote.
4. Se vuoi, aggiungi **Ruoli richiesti** o **Ruoli bannati**.
5. Se vuoi punizioni automatiche, esegui `countmodenable true` nel canale e aggiungi i livelli con `countmodpunish`.
6. Scrivi `1` da un account e `2` da un altro per verificare che le reazioni funzionino.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `countingsetup [#channel] [start] [increment]` | `csetup`, `countsetup` | Manage Channels | Avvia il conteggio in un canale |
| `countingstatus [#channel]` | `cstatus`, `countstatus` | Nobody | Numero corrente, record, totali e regole attive |
| `countingconfig [#channel]` | `cconfig`, `countconfig` | Manage Channels | Mostra la configurazione del canale |
| `countingreset [#channel] [number] [reason]` | `creset`, `countreset` | Manage Messages | Reimposta il conteggio, predefinito 0, con conferma |
| `countingstats [@user] [#channel]` | `countstats` | Nobody | Statistiche di conteggio di un membro e la sua posizione |
| `countingleaderboard [type] [#channel]` | `cleaderboard`, `countleaderboard`, `clb` | Nobody | Primi 20 per contributi, serie, precisione o totalnumbers |
| `countingsave [#channel] [reason]` | `csave`, `countsave` | Manage Messages | Crea un punto di salvataggio |
| `countingrestore <saveId> [#channel]` | `crestore`, `countrestore` | Manage Messages | Torna a un punto di salvataggio |
| `countingdisable [#channel] [purge] [reason]` | `cdisable`, `countdisable` | Manage Channels | Ferma il conteggio; `true` elimina anche tutti i dati |
| `countinglist` | `clist`, `countlist` | Manage Channels | Elenca i canali di conteggio attivi |
| `countingban <@user> [#channel] [duration] [reason]` | `cban`, `countban` | Manage Messages | Bandisce un membro dal conteggio, in modo permanente se non è indicata una durata |
| `countingunban <@user> [#channel] [reason]` | `cunban`, `countunban` | Manage Messages | Revoca un divieto dal conteggio |
| `countingtimeout <@user> <duration> [#channel] [reason]` | `ctimeout`, `counttimeout` | Manage Messages | Divieto temporaneo dal conteggio |
| `countingcooldown [#channel] [seconds]` | `ccooldown`, `countcooldown` | Manage Channels | Mostra o imposta il cooldown, da 0 a 300 |
| `countingmilestones [#channel] [50,100,...]` | `cmilestones`, `countmilestones` | Manage Channels | Mostra, imposta, oppure `-` per reimpostare i numeri traguardo personalizzati |
| `countingsuccessmessage [#channel] [text]` | `csuccessmessage`, `countsuccessmessage` | Manage Channels | Memorizza un modello di successo, `-` lo reimposta |
| `countingfailuremessage [#channel] [text]` | `cfailuremessage`, `countfailuremessage` | Manage Channels | Memorizza un modello di errore, `-` lo reimposta |
| `countingmilestonemessage [#channel] [text]` | `cmilestonemessage`, `countmilestonemessage` | Manage Channels | Memorizza un modello per i traguardi, `-` lo reimposta |
| `countingmilestonechannel [#counting] [#target]` | `cmilestonechannel`, `countmilestonechannel` | Manage Channels | Memorizza un canale per i traguardi, none per cancellare |
| `countingfailurechannel [#counting] [#target]` | `cfailurechannel`, `countfailurechannel` | Manage Channels | Memorizza un canale di log per gli errori, none per cancellare |
| `countingfailurethreshold [#channel] [1-10]` | `cfailurethreshold`, `countfailurethreshold` | Manage Channels | Mostra o imposta la soglia di errori |
| `countmodshow [#channel]` | `cmshow`, `countmoderationshow` | Manage Channels | Mostra la configurazione della moderazione e i valori predefiniti del server |
| `countmoddefaults <on/off> [threshold] [hours] [punishment] [minutes] [@role]` | `cmdefaults`, `countmoderationdefaults` | Administrator | Valori predefiniti della moderazione a livello di server |
| `countmodenable <on/off> [#channel]` | `cmenable`, `countmoderationenable` | Manage Channels | Attiva o disattiva la moderazione per un canale |
| `countmodthreshold <1-100> [#channel]` | `cmthreshold`, `countmoderationthreshold` | Manage Channels | Imposta la soglia di conteggi sbagliati del canale |
| `countmodwindow <1-168> [#channel]` | `cmwindow`, `countmoderationwindow` | Manage Channels | Ore in cui un conteggio sbagliato resta registrato |
| `countmodpunishment <action> [minutes] [@role] [#channel]` | `cmpunishment`, `countmoderationpunishment` | Manage Channels | Imposta la punizione predefinita del canale |
| `countmodpunish <count> <action> [minutes] [@role] [#channel]` | `cmpunish`, `countmoderationpunish` | Manage Channels | Punizione a un conteggio sbagliato esatto; senza canale vale il predefinito del server |
| `countmodunpunish <count> [#channel]` | `cmunpunish`, `countmoderationunpunish` | Manage Channels | Rimuove un livello |
| `countmodpunishlist [#channel]` | `cmpunishlist`, `countmoderationpunishlist` | Manage Channels | Elenca i livelli |
| `countmodignore <delete> [#channel] [@roles...]` | `cmignore`, `countmoderationignore` | Manage Channels | Ruoli ignorati dal bot, con eliminazione facoltativa dei loro messaggi |
| `countmodrequired [#channel] [@roles...]` | `cmrequired`, `countmoderationrequired` | Manage Channels | Ruoli necessari per contare |
| `countmodbanned [#channel] [@roles...]` | `cmbanned`, `countmoderationbanned` | Manage Channels | Ruoli che non possono contare |
| `countmodnonnumbers <punish> [delete] [#channel]` | `cmnonnumbers`, `countmoderationnonnumbers` | Manage Channels | Regole per la chat nel canale |
| `countmodedits <punish> [delete] [#channel]` | `cmedits`, `countmoderationedits` | Manage Channels | Regole per i messaggi modificati |
| `countmodreset [#channel]` | `cmreset`, `countmoderationreset` | Manage Channels | Il canale torna ai valori predefiniti del server |
| `countmodclear <@user> [#channel]` | `cmclear`, `countmoderationclear` | Manage Messages | Azzera i conteggi sbagliati di un membro |
| `countmodclearall [#channel]` | `cmclearall`, `countmoderationclearall` | Manage Messages | Azzera i conteggi sbagliati di tutti |

## Consigli e insidie

- Il bot deve avere il permesso Aggiungi reazioni nel canale. Senza di esso nessun messaggio riceve spunta o croce, e i conteggi validi vengono saltati dal controllo di blocco del bot.
- Eliminare i numeri sbagliati e i messaggi di chat che non sono numeri richiede il permesso Gestisci messaggi.
- I membri che hanno bloccato il bot non possono contare: il loro numero viene eliminato e viene pubblicato un avviso.
- Con la regola predefinita contro le ripetizioni, un membro che scrive due volte di seguito viene respinto prima ancora che il numero venga letto, e questo rifiuto non conta come errore.
- **Reimposta il conteggio in caso di errore** riporta al numero iniziale, quindi con un inizio a 1 il prossimo numero atteso è di nuovo 1.
- Le punizioni di moderazione usano le stesse azioni del sistema di avvertimenti (Mute, Ban, Kick, AddRole e così via), quindi il bot ha bisogno dei permessi Discord corrispondenti e di un ruolo per il silenziamento.
- `countingdisable` con purge rimuove statistiche, divieti e punti di salvataggio di quel canale, e non può essere annullato. Disattivare senza purge mantiene i dati.

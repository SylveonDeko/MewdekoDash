---
title: Patreon
slug: patreon
summary: Collega una campagna Patreon, assegna ai sostenitori ruoli Discord in base al loro piano e pubblica un ringraziamento mensile con numeri aggiornati su sostenitori e ricavi.
icon: fa-heart
category: Community
dashboard: /dashboard/patreon
module: Patreon
tags: [patreon, supporters, patrons, donations, premium, tier roles, role sync, announcement, oauth, sostenitori, donazioni, ruoli piano, annuncio]
related: [administration, utility]
---

## Cosa fa

Il proprietario di un server che gestisce una campagna Patreon collega la campagna al bot accedendo con il suo account creatore. Da quel momento il bot importa i piani e i sostenitori della campagna, li tiene sincronizzati e può assegnare ruoli Discord in base a quanto ognuno si impegna a pagare. Quando Patreon conosce l'account Discord di un sostenitore, il collegamento è automatico; altrimenti lo staff può collegare a mano un membro a un utente Patreon.

Una volta al mese, nel giorno che scegli, il bot può pubblicare un annuncio in un canale per ringraziare i sostenitori. Il messaggio può essere testo semplice oppure un embed e può includere dati aggiornati come il numero di sostenitori attivi, il ricavo mensile e quante persone si sono unite questo mese. C'è anche un comando di riconoscimento che pubblica un ringraziamento per chiunque sia diventato sostenitore nell'ultima settimana.

La dashboard gestisce l'intero flusso: connessione, visualizzazione di sostenitori e piani, associazione dei piani ai ruoli e modifica delle impostazioni dell'annuncio. I comandi in chat coprono le stesse operazioni, più statistiche e classifiche.

## Perché usarlo

- I sostenitori devono ricevere un ruolo colorato e l'accesso ai canali riservati ai patron senza che lo staff controlli Patreon a mano.
- I piani cambiano i ruoli automaticamente quando qualcuno passa a un piano superiore, inferiore o smette di pagare.
- Vuoi un post mensile del tipo "grazie ai nostri 40 sostenitori" che resti accurato senza modificare i numeri a mano.
- Lo staff vuole una panoramica rapida di chi sostiene il server e a che livello, direttamente da Discord.

## Collegare una campagna

Il collegamento usa il flusso OAuth di Patreon. La scheda **Collega il tuo Patreon** della dashboard, oppure il comando `patreonsync` riservato al proprietario del bot, genera un link "Authorize with Patreon". Accedi con l'account che possiede la campagna, approva l'accesso richiesto, e Patreon ti riporta alla pagina Patreon della dashboard. Il bot scambia il codice con i token, salva la prima campagna trovata ed esegue subito una sincronizzazione completa di piani e sostenitori.

L'account che usi deve possedere una campagna. Se non ne ha nessuna, il callback fallisce con "No Patreon campaigns found for this user".

La scheda **Panoramica** della dashboard mostra lo stato della connessione con **ID campagna**, **Ultima sincronizzazione** e **Scadenza del token**, più le schede di riepilogo per **Sostenitori** attivi, **Entrate** mensile e **Creatore della campagna**. I token vengono rinnovati automaticamente alla scadenza; le **Azioni rapide** della stessa scheda sono **Sincronizza tutti i dati**, **Sincronizza ruoli**, **Invia annuncio** e **Accedi di nuovo**. Re-login scollega la campagna: cancella i token ma conserva le impostazioni di canale, messaggio e associazioni, così puoi ricollegarla. L'intestazione della pagina ha anche i pulsanti **Aggiorna dati** e **Sincronizza sostenitori**.

> [!NOTE]
> L'integrazione Patreon deve essere attivata da chi ospita il bot. Se il bot non ha un client ID Patreon configurato, il pulsante di connessione e `patreonsync` segnalano che l'integrazione non è configurata.

## Sostenitori e sincronizzazione

Una sincronizzazione recupera ogni membro della campagna con l'importo che si impegna a pagare, lo stato e, se il sostenitore ha collegato Discord a Patreon, il suo ID utente Discord. Sono considerati attivi i sostenitori che Patreon segnala come attivi o con un impegno in corso. La scheda **Sostenitori** li elenca con **Nome** (e l'email, dove Patreon la fornisce), **Contributo**, **Entrato** e **Stato**, e il pulsante **Sincronizza sostenitori** in cima alla pagina aggiorna l'elenco.

`patreonsupporters` mostra fino a 15 sostenitori attivi in chat con il loro impegno e la menzione Discord, `patreontop [count]` classifica i primi da 1 a 20 per impegno, `patreonstats` riassume il numero di sostenitori, quanti sono collegati, il ricavo totale e medio e il numero di piani, e `patreonanalytics` aggiunge gli ex sostenitori, il ricavo complessivo, i nuovi sostenitori del mese e la distribuzione per piano.

Se l'account Discord di un sostenitore non è collegato lato Patreon, usa `patreonlink @member <patreonUserId>` per collegarlo a mano. L'ID utente Patreon è l'ID numerico dell'account Patreon del sostenitore; l'elenco della dashboard non lo mostra.

## Associazione piano-ruolo

Ogni piano Patreon può essere associato a un ruolo Discord. Nella scheda **Associazione livelli** scegli un **Livello Patreon** e un **Ruolo Discord** e salva. La lista **Livelli disponibili** mostra ogni piano pubblicato con il prezzo e se è già associato. In chat, `patreontiermap <tierId> @role` fa lo stesso; gli ID dei piani si ottengono con `patreonroles`.

La sincronizzazione dei ruoli è disattivata finché non la attivi con `patreonrolesync` o con la casella **Attiva sincronizzazione dei ruoli**. Quando è attiva, il bot calcola quale ruolo dovrebbe avere ogni sostenitore: il piano associato con il prezzo più alto che sia uguale o inferiore al suo impegno. Gli altri ruoli Patreon associati che possiede vengono rimossi, e viene aggiunto il ruolo di destinazione. Un sostenitore che smette di pagare perde tutti i ruoli associati.

La sincronizzazione avviene quando un membro viene collegato e quando esegui `patreonsyncall` o l'azione sync roles della dashboard. Solo i sostenitori con un ID Discord noto possono essere sincronizzati.

> [!PERMISSION]
> Il bot ha bisogno di Gestisci ruoli e il suo ruolo deve trovarsi sopra ogni ruolo associato. I ruoli sopra il bot vengono saltati.

## Annunci mensili

Imposta un canale con `patreonch #channel` o con il selettore **Canale degli annunci**, e un giorno con `patreonday <1..28>` oppure **Giorno dell'annuncio (1-28)**. Il giorno è limitato al 28 così febbraio non viene mai saltato. Gli annunci sono disattivati finché non esegui `patreontoggle` o non spunti **Attiva annunci**.

Il bot controlla ogni ora. Nel giorno scelto, se non ha ancora pubblicato questo mese, pubblica e registra l'orario. Se il bot era spento nel giorno previsto, recupera all'avvio purché quel giorno del mese sia già passato. `patreonannounce` ne pubblica uno subito, e conta come il post di questo mese.

Senza un messaggio personalizzato il bot pubblica un ringraziamento predefinito che include il numero di sostenitori attivi e il ricavo mensile. Impostane uno tuo con `patreonmsg <text or embed code>` oppure con l'editor del messaggio dell'annuncio nella dashboard. Il testo passa dal parser degli embed. Usa `-` per tornare a quello predefinito.

### Segnaposto

Questi funzionano nel messaggio dell'annuncio insieme ai soliti segnaposto di server e canale.

| Segnaposto | Valore |
| --- | --- |
| `%month%` | Nome del mese corrente |
| `%year%` | Anno corrente |
| `%patreon.link%` | `https://patreon.com` |
| `%supporter.count%` | Sostenitori attivi |
| `%supporter.total%` | Tutti i sostenitori mai registrati |
| `%supporter.new%` | Nuovi sostenitori questo mese |
| `%supporter.former%` | Ex sostenitori |
| `%supporter.linked%` | Sostenitori con un account Discord collegato |
| `%revenue.monthly%` | Impegni mensili attuali |
| `%revenue.average%` | Impegno medio |
| `%revenue.lifetime%` | Ricavo complessivo |
| `%growth.new%` | Nuovi sostenitori questo mese |
| `%top.supporter.name%` | Sostenitore con l'impegno più alto |
| `%top.supporter.amount%` | Il suo impegno |
| `%patron.name%` | Sostenitore con l'impegno più alto, uguale a `%top.supporter.name%` |
| `%patron.tier%` | Il piano di quel sostenitore, oppure "Unknown" se Patreon non ne ha segnalato uno |
| `%patron.amount%` | Il suo impegno mensile, uguale a `%top.supporter.amount%` |
| `%tiers.count%` | Numero di piani |
| `%tier.popular%` | Piano con più sostenitori |
| `%tier.popular.count%` | Quanti sono su quel piano |
| `%supporters.summary%` | Frase pronta sul numero di sostenitori |
| `%revenue.summary%` | Frase pronta sul ricavo |
| `%growth.summary%` | Frase pronta sulla crescita |

> [!EXAMPLE]
> `It's %month%! Thanks to %supporters.summary%%revenue.summary%!%growth.summary%` diventa "It's December! Thanks to our 25 incredible supporters who help us raise $150/month! We gained 3 new supporters this month!"

## Riconoscere i nuovi sostenitori

`patreonrecognize [#channel]` pubblica un embed di benvenuto per i sostenitori il cui impegno è iniziato negli ultimi sette giorni, fino a cinque per esecuzione, nel canale indicato o in quello corrente. È un comando manuale, non una pianificazione, quindi eseguilo dopo una sincronizzazione. Eseguirlo due volte pubblica di nuovo le stesse persone.

## Impostazioni

La dashboard ha quattro schede: **Panoramica**, **Sostenitori**, **Associazione livelli** e **Configurazione**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Announcement Channel | nessuno | Dove va il post mensile; nessuno significa annunci disattivati |
| Announcement Day (1-28) | nessuno | Giorno del mese in cui pubblicare; gli annunci non partono finché non ne è impostato uno |
| Announcement message | ringraziamento predefinito | Testo o embed personalizzato con i segnaposto sopra |
| Enable Announcements | disattivato | Se il post mensile viene inviato |
| Enable Role Sync | disattivato | Se i ruoli associati vengono applicati ai sostenitori |
| Tier mappings | nessuna | Quale ruolo concede ogni piano |

## Procedura di configurazione

1. Apri **Patreon** nella dashboard e clicca il pulsante di connessione. Accedi con l'account del proprietario della campagna e approva l'accesso.
2. Attendi la prima sincronizzazione, poi controlla che la scheda **Sostenitori** mostri i tuoi sostenitori.
3. Nella scheda **Associazione livelli** associa ogni piano a un ruolo. Crea prima i ruoli e metti il ruolo del bot sopra di essi.
4. Spunta **Attiva sincronizzazione dei ruoli**, poi esegui `patreonsyncall` per applicare i ruoli a tutti i collegati.
5. In **Configurazione** scegli **Canale degli annunci** e **Announcement Day**, scrivi un messaggio con i segnaposto e spunta **Attiva annunci**.
6. Esegui `patreonannounce` una volta per vedere il risultato nel canale.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `patreonsync` | `ptsync` | Proprietario del bot | Pubblica il link OAuth di autorizzazione |
| `patreonch [#channel]` | `ptch` | Amministratore | Mostra o imposta il canale degli annunci |
| `patreondisable` | `ptdisable` | Amministratore | Cancella il canale, disattivando gli annunci |
| `patreonmsg [text]` | `ptmsg` | Amministratore | Mostra o imposta il messaggio dell'annuncio, `-` per reimpostare |
| `patreonday [day]` | `ptday` | Amministratore | Mostra o imposta il giorno del mese |
| `patreontoggle` | `pttoggle` | Amministratore | Attiva o disattiva gli annunci |
| `patreonconfig` | `ptconfig` | Amministratore | Mostra stato, canale, giorno, messaggio e ultimo post |
| `patreonannounce` | `ptannounce` | Amministratore | Invia subito l'annuncio |
| `patreonhelp` | `pthelp` | Nessuno | Elenco dei segnaposto e panoramica dei comandi |
| `patreonsupporters` | `ptsupporters` | Amministratore | Elenca i sostenitori attivi |
| `patreontop [count]` | `pttop` | Nessuno | I sostenitori migliori per impegno |
| `patreonstats` | `ptstats` | Amministratore | Riepilogo di sostenitori e ricavi |
| `patreonanalytics` | `ptanalytics` | Amministratore | Analisi dettagliate |
| `patreonlink <user> <patreonUserId>` | `ptlink` | Amministratore | Collega un membro a un utente Patreon |
| `patreonrolesync` | `ptrolesync` | Gestisci ruoli | Attiva o disattiva la sincronizzazione automatica dei ruoli |
| `patreontiermap <tierId> <role>` | `pttiermap` | Gestisci ruoli | Associa un piano a un ruolo |
| `patreonroles` | `ptroles` | Amministratore | Elenca i piani con i loro ID e ruoli |
| `patreonsyncall` | `ptsyncall` | Gestisci ruoli | Applica i ruoli a ogni sostenitore collegato |
| `patreonrecognize [#channel]` | `ptrecognize` | Amministratore | Ringrazia i sostenitori degli ultimi sette giorni |

## Suggerimenti e avvertenze

- Solo i sostenitori che hanno collegato Discord nel loro profilo Patreon, oppure collegati con `patreonlink`, possono ricevere ruoli.
- La sincronizzazione dei ruoli assegna un ruolo per sostenitore, quello del miglior piano che il suo impegno copre. Non è supportato accumulare più ruoli di piano.
- Gli annunci vengono pubblicati al massimo una volta per mese di calendario. Se esegui `patreonannounce` il 3, l'invio programmato del 15 viene saltato per quel mese.
- Il giorno dell'annuncio è in UTC.
- L'annuncio mensile riguarda l'intera campagna, quindi `%patron.name%`, `%patron.tier%` e `%patron.amount%` descrivono il sostenitore attivo con l'impegno più alto e non ciascun patron a turno. Usa `patreonrecognize` per i ringraziamenti individuali.
- Ricollegare un account Patreon diverso cambia la campagna ma mantiene le vecchie associazioni, quindi controlla la scheda **Associazione livelli** dopo.

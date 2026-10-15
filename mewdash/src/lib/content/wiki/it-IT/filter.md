---
title: Filtri dei messaggi
slug: filter
summary: Elimina i messaggi che contengono parole bloccate, inviti Discord o link, facoltativamente avvisa il mittente, e banna all'istante per una lista separata di parole di auto-ban.
icon: fa-filter
category: Security
dashboard: /dashboard/filter
module: Permissions
tags: [filter, word filter, invite filter, link filter, automod, auto ban, blacklist, banned words, regex, filtro, filtro parole, filtro inviti, filtro link, lista nera, parole bannate]
related: [moderation, logging, administration]
---

## Cosa fa

Il filtro controlla ogni messaggio inviato o modificato da un membro prima che lo vedano gli altri moduli. Se il messaggio contiene una parola filtrata, un invito Discord o un link in un punto in cui quel filtro è attivo, il bot lo elimina. Puoi anche far sì che il bot emetta un avviso tramite il sistema di moderazione e invii al membro un messaggio privato che spiega cosa è stato rimosso.

Una seconda lista, le parole di auto-ban, è più severa. Un messaggio che corrisponde a una parola di auto-ban viene eliminato e l'autore viene bannato immediatamente, con un messaggio privato che contiene il motivo quando il bot riesce a inviarlo.

Gli amministratori e chiunque abbia il ruolo staff del server (impostato con `staffrole`) non vengono mai filtrati. Nemmeno i messaggi dei bot vengono controllati.

## Perché usarlo

- Tenere insulti e altri termini vietati fuori dalla chat senza un moderatore online.
- Impedire ai membri di pubblicizzare altri server lasciando inviti.
- Rendere un canale solo testuale rimuovendo ogni messaggio con un URL, per esempio una chat di annunci senza media.
- Bannare subito gli account che pubblicano frasi truffa note o firme di raid.

## Tipi di filtro

| Filtro | Dove si applica | Cosa succede |
| --- | --- | --- |
| Filtro parole | Solo nei canali della lista dei canali del filtro parole | Messaggio eliminato; avviso e messaggio privato se **Avvisa per parola filtrata** è attivo |
| Filtro inviti | Ovunque quando l'interruttore del server è attivo e la lista dei canali è vuota, oppure solo nei canali elencati quando la lista ha voci | Messaggio eliminato; avviso e messaggio privato se **Avvisa per link di invito** è attivo |
| Filtro link | Ovunque quando l'interruttore del server è attivo, più ogni canale della sua lista | Messaggio eliminato, nessun avviso |
| Parole di auto-ban | Ovunque | Messaggio eliminato, all'autore viene inviato un messaggio privato e viene bannato |

Le tre liste di canali sono le **Sovrascritture dei canali** nella dashboard. Nota che il filtro parole è governato interamente dalla sua lista di canali: un canale deve essere presente nella lista perché le parole vengano controllate lì.

## Come vengono confrontate le parole

Le parole filtrate e le parole di auto-ban sono trattate come espressioni regolari e verificate sul contenuto del messaggio in minuscolo. Una parola semplice come `example` funziona come corrispondenza di sottostringa, quindi viene catturato anche `examples`. I pattern che non si compilano vengono rimossi automaticamente dalla lista. Ogni pattern ha un timeout di corrispondenza di 250 millisecondi.

Le parole filtrate vengono salvate in minuscolo e confrontate senza distinguere maiuscole e minuscole. I pattern di auto-ban vengono salvati esattamente come digitati e confrontati con il testo in minuscolo, quindi scrivili in minuscolo.

> [!WARNING]
> I pattern di auto-ban sono potenti. Un pattern corto come `ban` all'interno di una parola più lunga bannerà chi scrive "banana". Prova prima i pattern come parole filtrate.

## Avvisi

Attivando **Avvisa per parola filtrata** o **Avvisa per link di invito**, il bot aggiunge un avviso tramite il modulo moderazione con il motivo "Warned for Filtered Word" oppure il motivo dell'avviso per invito, e poi invia un messaggio privato al membro. Le punizioni per avvisi configurate nella pagina Moderazione si applicano come al solito, quindi tre violazioni del filtro possono portare a un mute o a un'espulsione se è così che sono impostati gli avvisi.

Gli auto-ban usano le impostazioni di pulizia dei ban del modulo moderazione per l'azione "Filter" per decidere quanti giorni di messaggi eliminare.

## Impostazioni

La pagina Filtri dei messaggi ha quattro schede: **Filtri**, **Parole filtrate**, **Parole di auto-ban** e **Sovrascritture dei canali**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Filtro parole | Disattivato | Interruttore valido per tutto il server, mostrato nella scheda Filtri |
| Filtro inviti | Disattivato | Elimina i link di invito Discord; necessario perché la lista dei canali degli inviti abbia effetto |
| Filtro link | Disattivato | Elimina ovunque nel server ogni messaggio con un URL |
| Avvisa per parola filtrata | Disattivato | Aggiunge un avviso e invia un messaggio privato al membro quando una parola filtrata viene rimossa |
| Avvisa per link di invito | Disattivato | Aggiunge un avviso e invia un messaggio privato al membro quando un invito viene rimosso |
| Parole filtrate | nessuna | Elenco nella scheda Parole filtrate, con rimozione per parola, un pulsante **Cancella tutto** che fa lo stesso di `fwclear` e una casella di ricerca quando ci sono più di dieci parole |
| Parole di auto-ban | nessuna | Elenco nella scheda Parole di auto-ban |
| Canali del filtro parole | nessuno | Canali in cui viene applicata la lista delle parole |
| Canali del filtro inviti | nessuno | Limita il filtro inviti a questi canali quando non è vuoto |
| Canali del filtro link | nessuno | Canali extra in cui i link vengono rimossi anche se l'interruttore del server è disattivato |

La parte superiore della pagina mostra i conteggi di parole filtrate, parole di auto-ban e sovrascritture dei canali.

## Guida alla configurazione

1. Apri **Filtri dei messaggi** nella dashboard.
2. Nella scheda **Parole filtrate**, aggiungi ogni parola o frase e premi aggiungi.
3. In **Sovrascritture dei canali**, aggiungi ogni canale in cui deve applicarsi la lista delle parole in **Canali del filtro parole**.
4. Torna su **Filtri** e attiva **Filtro inviti** se vuoi che gli inviti vengano rimossi ovunque, e **Avvisa per link di invito** se questo deve contare come avviso.
5. Facoltativamente aggiungi alcuni pattern ad alta affidabilità nella scheda **Parole di auto-ban**.
6. Esegui `staffrole @Moderators` così il tuo team è esentato, poi scrivi una parola filtrata da un account normale per verificare che venga eliminata.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `filterword <word>` | `fw` | Nessuno | Aggiunge una parola alla lista dei filtri, oppure la rimuove se è già presente |
| `lstfilterwords` | `lfw` | Nessuno | Sfoglia la lista delle parole filtrate |
| `fwclear` | | Amministratore | Rimuove ogni parola filtrata, svuota la lista dei canali del filtro parole e disattiva l'interruttore del server |
| `srvrfilterwords` | `sfw` | Nessuno | Attiva o disattiva l'interruttore del filtro parole per tutto il server |
| `chnlfilterwords` | `cfw` | Nessuno | Attiva o disattiva il canale attuale nella lista del filtro parole |
| `srvrfilterinv` | `sfi` | Nessuno | Attiva o disattiva il filtro inviti per tutto il server |
| `chnlfilterinv` | `cfi` | Nessuno | Attiva o disattiva il canale attuale nella lista del filtro inviti |
| `srvrfilterlin` | `sfl` | Nessuno | Attiva o disattiva il filtro link per tutto il server |
| `chnlfilterlin` | `cfl` | Nessuno | Attiva o disattiva il canale attuale nella lista del filtro link |
| `fwarn <y or n>` | `filteredwarn` | Amministratore | Attiva o disattiva gli avvisi per parole filtrate |
| `invwarn <y or n>` | `invitewarn` | Amministratore | Attiva o disattiva gli avvisi per link di invito |
| `autobanword <pattern>` | `autobanw` | Amministratore | Aggiunge un pattern alla lista di auto-ban, oppure lo rimuove se è già presente |
| `autobanwordlist` | `autobwlist` | Amministratore | Sfoglia la lista di auto-ban |

> [!PERMISSION]
> Gli interruttori del filtro e `filterword` non hanno un controllo dei permessi proprio. Usa il modulo Permessi per limitarli, oppure gestisci i filtri dalla dashboard, dove si applicano le regole di accesso alla dashboard.

## Suggerimenti e trappole

- Il bot ha bisogno di **Gestisci messaggi** in ogni canale filtrato e di **Bannare membri** per le parole di auto-ban.
- I messaggi modificati vengono ricontrollati, quindi modificare un vecchio messaggio aggiungendo un link comunque lo fa eliminare.
- I filtri non si applicano ad amministratori, al ruolo staff o ai bot. Non testare con un account amministratore.
- `fwclear` fa più che svuotare la lista: rimuove anche tutte le sovrascritture dei canali del filtro parole.
- Le regex non valide vengono eliminate in silenzio dalla lista. Se una parola scompare, controlla che non contenga caratteri non escapati come `(`, `[` o `*`.
- Registra le eliminazioni dei messaggi con la funzione Logging se vuoi un registro di ciò che il filtro ha rimosso.

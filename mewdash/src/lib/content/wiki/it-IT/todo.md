---
title: Liste todo
slug: todo
summary: Liste di attività condivise e personali dentro Discord, con priorità, scadenze, tag, ricerca e permessi per persona.
icon: fa-check
category: Community
dashboard: /dashboard/todo
module: Todo
tags: [todo, tasks, task list, checklist, project, due date, priority, tags, permissions, todo, attività, lista attività, checklist, progetto, scadenza, priorità, tag, permessi]
related: [administration, tickets]
---

## Cosa fa

Liste todo dà al tuo server delle liste di attività che vivono nel bot. Un membro crea una lista, aggiunge elementi, li segna come completati e può concedere accesso ad altre persone perché possano vedere o lavorare sulla stessa lista. Lo staff con il permesso Gestisci server può creare liste a livello di server che ogni membro può vedere.

Ogni elemento ha un titolo, una descrizione facoltativa, una priorità da 1 a 4, tag facoltativi, una scadenza facoltativa e un orario di promemoria facoltativo. Gli elementi mantengono una posizione, così puoi riordinarli, e quelli completati riportano chi li ha completati e quando.

Esistono due tipi di lista. Una lista personale appartiene a un solo membro ed è invisibile a tutti gli altri, a meno che il proprietario non conceda l'accesso. Una lista del server appartiene al server; è pubblica di default così chiunque può vederla, ma solo chi ha un permesso esplicito può aggiungere o modificare gli elementi.

Le liste compaiono come embed su Discord e come schede nella dashboard. La dashboard mostra inoltre progresso, conteggio dei ritardi e percentuale di completamento per la lista aperta.

## Perché usarlo

- Un team di moderazione tiene traccia delle attività in sospeso in un'unica lista del server invece che in un messaggio fissato che diventa obsoleto.
- Gli organizzatori di eventi condividono una checklist e spuntano gli elementi man mano che procedono.
- I membri tengono una lista privata di cose da seguire nel server.
- Un canale di progetto vuole tag e priorità così gli elementi "critici" spiccano rispetto a quelli "bassi".

## Liste e permessi

Ogni lista ha un proprietario, cioè chi l'ha creata. Il proprietario può fare qualsiasi cosa su quella lista. Altre persone ottengono l'accesso tramite permessi, concessi per utente con `todogrant`.

| Permesso | Cosa consente |
| --- | --- |
| `view` | Vedere la lista e i suoi elementi |
| `add` | Aggiungere nuovi elementi |
| `edit` | Modificare, taggare, riordinare e impostare date sugli elementi altrui |
| `complete` | Completare gli elementi altrui |
| `delete` | Eliminare gli elementi altrui |
| `manage` | Modificare le impostazioni della lista, eliminarla, concedere e revocare l'accesso |
| `all` | Tutti i permessi sopra |

Passane più di uno come stringa separata da virgole, per esempio `todogrant 12 @user view,add,complete`. Concedere di nuovo sostituisce i permessi precedenti di quell'utente. `todorevoke` li rimuove tutti.

Due regole valgono indipendentemente dai permessi: chi ha creato un elemento può sempre modificare, completare ed eliminare il proprio elemento, e il proprietario della lista può sempre fare qualsiasi cosa.

Chi può vedere una lista:

| Tipo di lista | Pubblica | Chi può vederla |
| --- | --- | --- |
| Personale | qualsiasi | Il proprietario, più chiunque abbia ricevuto `view` |
| Del server | sì (predefinito) | Tutti nel server |
| Del server | no | Il proprietario, più chiunque abbia ricevuto `view` |

`todotoggleprivacy` alterna una lista tra pubblica e privata. Possono farlo solo il proprietario o chi ha `manage`.

## Elementi

| Campo | Predefinito | Note |
| --- | --- | --- |
| Titolo | obbligatorio | Mostrato in grassetto nella lista |
| Descrizione | nessuna | Mostrata in corsivo sotto il titolo |
| Priorità | 1 (Bassa) con i comandi, Media nella dashboard | 1 Bassa, 2 Media, 3 Alta, 4 Critica. I valori fuori dall'intervallo 1-4 vengono portati nel range |
| Scadenza | nessuna | Mostrata come timestamp relativo di Discord accanto al titolo |
| Orario di promemoria | nessuno | Salvato sull'elemento e impostato con `todosetreminder` |
| Tag | nessuno | Non distingue maiuscole e minuscole; aggiungere un tag già esistente non fa nulla |
| Posizione | fine della lista | Si cambia con `todoreorder` |

`todoshow` elenca gli elementi in sospeso ordinati per posizione, poi per priorità, poi per data di creazione. Passa `true` come secondo argomento per mostrare anche fino a cinque elementi completati, con la data di completamento. Le date per `todosetdue` e `todosetreminder` vengono interpretate in modo flessibile, quindi `2026-10-01 18:00` e `October 1 2026` funzionano entrambi.

`todosearch` confronta la query con titoli, descrizioni e tag degli elementi in sospeso e mostra fino a dieci risultati. `todofilter` restringe una lista a un singolo tag (`todofilter 12 tag bug`) oppure a una priorità (`todofilter 12 priority 4`).

Ogni lista può avere un colore esadecimale, impostato con `todosetcolor 12 #ff8800`, usato per il bordo dell'embed. Il valore predefinito è `#7289da`.

## Impostazioni

Non ci sono impostazioni a livello di server. Tutto è per lista o per elemento.

La pagina Liste todo ha una sola vista. A sinistra compaiono tutte le liste visibili, con una casella **Cerca liste todo**, un interruttore **Mostra elementi completati** e **Ordina per** (Priorità, Scadenza, Creazione, Titolo) con un selettore dell'ordine. Selezionando una lista compaiono i suoi elementi con i pulsanti **Aggiungi elemento** ed **Elimina lista**, un editor degli elementi con **Priorità** e **Scadenza**, e un pulsante **Gestisci permessi** per ogni lista.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Nome e descrizione della lista | obbligatorio, nessuna | Impostati alla creazione dal pulsante **Crea lista** |
| Priorità (elemento) | Media | La priorità dell'elemento; mostrata come un chip colorato |
| Scadenza (elemento) | nessuna | Scadenza usata per il contatore dei ritardi |
| Mostra elementi completati | disattivato | Se gli elementi completati compaiono nella vista della lista |

> [!NOTE]
> Le liste create dalla dashboard sono sempre liste del server. Crea liste personali con `todocreatelist` su Discord.

## Guida alla configurazione

1. Apri **Liste todo** nella dashboard e clicca **Crea lista**.
2. Inserisci un nome e una descrizione facoltativa. La lista viene creata come lista pubblica del server.
3. Clicca la lista, poi **Aggiungi elemento**. Compila **Cosa c'è da fare?**, una descrizione facoltativa e una priorità.
4. Usa **Gestisci permessi** sulla scheda della lista per vedere chi ha accesso. Concedi l'accesso da Discord con `todogrant <listId> @user add,complete` così quelle persone possono lavorarci.
5. Su Discord, esegui `todolists` per ottenere l'ID della lista, poi `todoshow <listId>` per verificare che venga visualizzata.
6. Segna le cose come fatte con `todocomplete <itemId>`; l'ID dell'elemento è mostrato tra backtick in `todoshow`.

## Comandi

Usali con il prefisso del tuo server (`.` se non l'hai cambiato). Gli ID di lista e di elemento si ottengono da `todolists` e `todoshow`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `todocreatelist <name> [description]` | `tcl` | Nessuno | Crea una lista personale |
| `todocreateserverlist <name> [description]` | `tcsl` | Gestisci server | Crea una lista per tutto il server |
| `todolists [includeServer]` | | Nessuno | Elenca le liste che puoi vedere; passa `false` per le sole liste personali |
| `tododeletelist <listId>` | `tdl` | Nessuno | Elimina una lista e tutti i suoi elementi (proprietario o `manage`) |
| `todoshow <listId> [includeCompleted]` | `ts` | Nessuno | Mostra gli elementi di una lista |
| `todoadd <listId> <title> [description]` | `ta` | Nessuno | Aggiunge un elemento con priorità Bassa |
| `todoaddpriority <listId> <priority> <title> [description]` | `tap` | Nessuno | Aggiunge un elemento con priorità da 1 a 4 |
| `todoedit <itemId> <title> [description]` | `te` | Nessuno | Modifica titolo e descrizione di un elemento |
| `todocomplete <itemId>` | `tc` | Nessuno | Segna un elemento come completato |
| `tododelete <itemId>` | `td` | Nessuno | Elimina un elemento |
| `todoreorder <itemId> <position>` | `tr` | Nessuno | Sposta un elemento a una posizione numerata da 1 |
| `todosetdue <itemId> <date>` | `tsd` | Nessuno | Imposta una scadenza |
| `todocleardue <itemId>` | `tcd` | Nessuno | Rimuove la scadenza |
| `todosetreminder <itemId> <date>` | `tsr` | Nessuno | Imposta un orario di promemoria |
| `todoclearreminder <itemId>` | `tcr` | Nessuno | Rimuove l'orario di promemoria |
| `todoaddtag <itemId> <tag>` | `tat` | Nessuno | Aggiunge un tag |
| `todoremovetag <itemId> <tag>` | `trt` | Nessuno | Rimuove un tag |
| `todosearch <listId> <query>` | `tsearch` | Nessuno | Cerca tra gli elementi in sospeso per titolo, descrizione o tag |
| `todofilter <listId> <tag or priority> <value>` | `tf` | Nessuno | Filtra gli elementi in sospeso per un solo tag o una sola priorità |
| `todosetcolor <listId> <#hex>` | `tsc` | Nessuno | Imposta il colore dell'embed |
| `todotoggleprivacy <listId>` | `ttp` | Nessuno | Passa una lista da pubblica a privata e viceversa |
| `todogrant <listId> @user <perms>` | `tg` | Nessuno | Concede permessi separati da virgole |
| `todorevoke <listId> @user` | `trv` | Nessuno | Rimuove tutti i permessi di un utente |
| `todopermissions <listId>` | `tp` | Nessuno | Mostra chi ha quali permessi |

"Nessuno" significa che non viene fatto alcun controllo dei permessi Discord; sono i permessi della lista stessa a decidere se il comando riesce. Gli stessi comandi esistono come comandi slash sotto `/todo`.

## Suggerimenti e insidie

- Gli orari di promemoria vengono salvati sull'elemento, ma al momento il bot non invia alcun promemoria quando quell'orario arriva. Per ora considerali una nota.
- `todoshow` segnala una lista come non trovata se non hai l'accesso `view`, anche quando l'ID è corretto.
- Il nome di una lista deve essere unico per proprietario e tipo, quindi due membri possono avere ciascuno una lista personale "Spesa", ma un solo membro non può averne due.
- `todoreorder` rinumera ogni elemento della lista, così le posizioni restano consecutive.
- Le liste pubbliche del server sono leggibili da tutti, ma nessuno tranne il proprietario può aggiungervi elementi finché non concedi `add`.
- Usa `todogrant` su Discord per l'intero set di permessi; la vista **Gestisci permessi** della dashboard serve per controllare chi ha accesso.
- Eliminare una lista rimuove permessi ed elementi in un'unica operazione e non può essere annullato.

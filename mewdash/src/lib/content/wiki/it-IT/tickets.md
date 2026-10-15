---
title: Ticket
slug: tickets
summary: Pannelli ticket di supporto con pulsanti e menu a tendina che aprono canali privati, con rivendicazione, priorità, tag, casi, trascrizioni e strumenti per lo staff.
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, modmail, ticket, supporto, pannello, trascrizioni, casi, rivendica, priorità, lista nera]
related: [administration, chat-triggers, auditlog]
---

## Cosa fa

Ticket trasforma un canale in un servizio di assistenza. Pubblichi un pannello, cioè un messaggio con un embed e uno o più pulsanti o un menu a tendina. Quando un membro clicca un pulsante o sceglie un'opzione, il bot crea per lui un canale di testo privato, imposta i permessi in modo che possano vederlo solo lui e i tuoi ruoli di supporto, e pubblica un messaggio di apertura con i pulsanti **Prendi in carico** e **Chiudi**.

Dal lato del membro: clicca, compila eventualmente un breve modulo, e appare un canale chiamato come `ticket-username-1`. Lì descrive il problema. Quando il ticket viene chiuso, il canale viene rinominato in `closed-...`, bloccato e poi spostato in una categoria di archivio oppure eliminato dopo un ritardo, a seconda di come hai configurato quel tipo di ticket.

Dal lato dello staff: rivendica un ticket così tutti sanno chi se ne occupa, imposta una priorità, aggiungi tag, lascia delle note, collega ticket correlati in un caso e chiudilo. Ogni chiusura può salvare una trascrizione in un canale e nella dashboard. La dashboard mostra anche i tempi di risposta e di risoluzione, i ticket per priorità e una vista per ogni membro dello staff.

Ogni pulsante e ogni opzione del menu è un tipo di ticket a sé, con la propria categoria, i propri ruoli, i propri limiti, il proprio modulo, il proprio messaggio di apertura e il proprio comportamento alla chiusura.

## Perché usarlo

- Un server di supporto vuole canali privati one-to-one invece di un canale di aiuto pubblico.
- Hai più team (fatturazione, moderazione, partnership) e vuoi un menu a tendina che smisti verso quello giusto.
- Ti servono candidature per moderatori con un modulo, tenute separate dal supporto generico.
- Vuoi un registro: trascrizioni, note dello staff e casi che raggruppano segnalazioni correlate.
- Vuoi impedire a specifici membri di aprire ticket.

## Pannelli, pulsanti e menu a tendina

Un pannello è un messaggio in un canale. L'ID del pannello è l'ID di quel messaggio. Un pannello può contenere pulsanti, menu a tendina, o entrambi.

- **Pulsanti**: un tipo di ticket per ogni pulsante. Ognuno ha un'etichetta, un'emoji facoltativa e uno stile (Primario, Secondario, Successo o Pericolo).
- **Menu a tendina**: un menu con un testo segnaposto e un elenco di opzioni. Ogni opzione è un tipo di ticket con etichetta, descrizione ed emoji. Un menu deve avere almeno un'opzione.

Se il messaggio del pannello viene eliminato, `checkpanels` elenca i pannelli mancanti, e `recreatepanel` o `recreateallpanels` lo ripubblicano aggiornando l'ID del messaggio salvato. Il bot controlla anche se vengono eliminati messaggi di pannello.

`ticketduplicatepanel` copia un pannello con tutti i suoi componenti in un altro canale. `ticketmovepanel` lo sposta. `ticketupdatepanel` sostituisce l'embed con un nuovo JSON di embed.

### Impostazioni del tipo di ticket

Queste sono presenti su ogni pulsante e su ogni opzione del menu. Nella dashboard compaiono quando aggiungi o modifichi un pulsante o un'opzione.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Formato nome canale | `ticket-{username}-{id}` | Nome del canale creato; `{id}` è il numero di ticket del membro, massimo 100 caratteri |
| Categoria ticket | nessuna | Categoria in cui viene creato il canale |
| Categoria archivio | nessuna | Categoria in cui il canale viene spostato quando viene chiuso o archiviato |
| Ruoli di supporto | nessuno | Ruoli che possono vedere, scrivere e rivendicare il ticket |
| Ruoli osservatori | nessuno | Ruoli che possono leggere ma non inviare messaggi |
| Ticket attivi massimi | 1 | Quanti ticket aperti di questo tipo può avere un membro |
| Chiusura automatica (ore) | nessuna | Salvata per tipo e mostrata in `buttoninfo` |
| Tempo di risposta richiesto (minuti) | nessuno | Salvato per tipo e mostrato in `buttoninfo` |
| Priorità consentite | tutte | Quali priorità lo staff può impostare su questo tipo |
| Priorità predefinita | nessuna | Priorità con cui parte un nuovo ticket |
| Salva trascrizione | disattivato | Genera una trascrizione alla chiusura del ticket |
| Blocca alla chiusura | attivo | Nega l'invio a tutti tranne ai ruoli di supporto |
| Rinomina alla chiusura | attivo | Antepone `closed-` al nome del canale |
| Rimuovi autore | attivo | Rimuove l'accesso di chi ha aperto il ticket alla chiusura |
| Elimina alla chiusura | disattivato | Elimina il canale dopo il ritardo invece di conservarlo |
| Ritardo eliminazione | 5 minuti | Attesa prima dell'eliminazione quando Elimina alla chiusura è attivo; il campo della dashboard accetta secondi, `ticketclosebehavior` accetta minuti |
| Archivia automaticamente alla chiusura | disattivato | Archivia il ticket come parte della chiusura |
| Blocca all'archiviazione | attivo | Rende il canale di sola lettura quando viene archiviato |
| Rinomina all'archiviazione | attivo | Antepone `archived-` al nome del canale |
| Rimuovi autore (archivio) | disattivato | Rimuove l'accesso di chi ha aperto il ticket quando viene archiviato |
| Modulo | nessuno | Un modulo mostrato prima che il ticket venga creato |
| Messaggio di apertura | embed predefinito | Messaggio di apertura personalizzato con segnaposto |

### Moduli

Un tipo di ticket può fare delle domande prima di creare il canale. Imposta un titolo con `setmodaltitle` (predefinito "Create Ticket") e aggiungi campi con `addmodalfield`. Un campo è breve e obbligatorio per impostazione predefinita; le opzioni dopo l'etichetta cambiano questo comportamento: `paragraph` per più righe, `optional`, e `min:X` o `max:X` per limiti di lunghezza fino a 4000. L'ID del campo è l'etichetta in minuscolo con gli spazi sostituiti da underscore.

Le risposte vengono salvate con il ticket e possono essere usate nel messaggio di apertura come `%modal.<fieldId>%`.

### Il messaggio di apertura

Per impostazione predefinita il bot pubblica un embed intitolato "Support Ticket" che dà il benvenuto al membro, mostra l'ID del ticket e l'ora di creazione, e lo invita a descrivere il problema. Sono collegati i pulsanti Claim e Close.

Puoi sostituirlo per ogni tipo di ticket con un tuo testo o un tuo embed. Usa l'editor di embed nella dashboard (**Configura il messaggio di apertura del ticket**). I segnaposto disponibili qui sono:

| Segnaposto | Valore |
| --- | --- |
| `%ticket.id%` | Il numero del ticket |
| `%ticket.channel%` | Menzione del canale del ticket |
| `%ticket.user%` | Il nome utente di chi ha aperto il ticket |
| `%ticket.user.mention%` | Una menzione di chi ha aperto il ticket |
| `%ticket.user.avatar%` | URL dell'avatar di chi ha aperto il ticket |
| `%ticket.user.id%` | L'ID utente di chi ha aperto il ticket |
| `%ticket.created%` | Quando è stato creato il ticket |
| `%modal.<fieldId>%` | La risposta a un campo del modulo |

Il set generale di segnaposto non viene applicato a questo messaggio; valgono solo quelli sopra.

## Cosa succede quando si apre un ticket

1. I membri nella lista nera ricevono un rifiuto con un messaggio effimero.
2. I ticket aperti del membro di questo tipo vengono conteggiati rispetto a **Ticket attivi massimi** (predefinito 1).
3. Il canale viene creato nella categoria dei ticket con `@everyone` negato, chi ha aperto il ticket può vedere, inviare, leggere la cronologia, allegare file e incorporare link, i ruoli di supporto ricevono gli stessi permessi più Gestisci messaggi, e i ruoli osservatori possono solo leggere.
4. Viene pubblicato il messaggio di apertura con i pulsanti Claim e Close.
5. Se è impostato un canale di log, lì viene pubblicata una voce "new ticket".
6. Viene pubblicato un evento **Ticket aperto** per i trigger di chat.

## Rivendicazione, note, priorità e tag

**Prendi in carico**: un membro con ruolo di supporto o un amministratore rivendica il ticket con il pulsante o con `ticketclaim`. Il canale riceve un embed "claimed by". Solo chi ha rivendicato o un amministratore può annullare la rivendicazione. Un ticket chiuso o già rivendicato non può essere rivendicato.

**Nota**: `ticketnote` aggiunge una nota dello staff al ticket corrente. La nota viene salvata con il ticket, mostrata nella dashboard e pubblicata nel canale del ticket come embed blu "note added", con l'autore nel piè di pagina.

**Priorità** sono definizioni valide per tutto il server, create con `ticketaddpriority` o nella scheda **Configurazione**. Ognuna ha un ID, un nome visualizzato, un'emoji, un livello da 1 a 5, un colore, un tempo di risposta e un flag **Notifica lo staff**. Impostare una priorità su un ticket pubblica un embed di quel colore e, se il flag è attivo, menziona i ruoli di supporto. Un tipo di ticket può limitare quali priorità sono consentite.

**Tag** sono etichette valide per tutto il server, con ID, nome, descrizione e colore. Aggiungile o rimuovile da un ticket con `ticketaddtags` e `ticketremovetags` usando gli ID dei tag. La dashboard li mostra su ogni ticket e permette di cercare per tag.

## Chiusura, archiviazione e trascrizioni

La chiusura segna il ticket come chiuso e pubblica un embed rosso "ticket closed". Poi, in quest'ordine:

1. Se **Salva trascrizione** è attivo per il tipo e nel server è impostato un canale delle trascrizioni, vengono salvati gli ultimi 5000 messaggi e nel canale delle trascrizioni viene pubblicato un embed con un link **View Transcript**. Il link apre la trascrizione nella dashboard.
2. Se l'archiviazione automatica è attiva per il tipo, oppure hai chiuso con `ticketclose true`, il ticket viene archiviato (vedi sotto).
3. Altrimenti si eseguono i comportamenti di chiusura: rinomina in `closed-...`, rimuovi chi ha aperto il ticket, blocca il canale mantenendo i ruoli di supporto, e poi sposta nella categoria di archivio oppure, con **Elimina alla chiusura**, avvisa nel canale e pianifica l'eliminazione dopo il ritardo. Le eliminazioni pianificate vengono elaborate una volta al minuto.

L'archiviazione rinomina il canale in `archived-...`, lo sposta nella categoria di archivio, lo rende di sola lettura per tutti e segna il ticket come archiviato. `ticketarchive` lo fa direttamente su un ticket aperto. Se il canale non esiste più, il ticket viene semplicemente segnato come archiviato.

La chiusura pubblica un evento **Ticket chiuso** per i trigger di chat.

> [!NOTE]
> Una trascrizione viene prodotta solo se il tipo ha **Salva trascrizione** attivo e il server ha un canale delle trascrizioni. Senza canale delle trascrizioni la chiusura va a buon fine, ma non viene salvato nulla.

## Casi

Un caso raggruppa ticket che appartengono insieme, per esempio diverse segnalazioni sulla stessa persona. Crealo con `ticketcreatecase <title> <description>` oppure nella scheda **Casi**, poi collega il ticket corrente con `ticketlinkcase <caseId>` e scollegalo con `ticketunlinkcase`. I casi hanno note proprie, possono essere chiusi e riaperti, e si possono modificare dalla dashboard o con i comandi slash `/tickets cases`.

## Lista nera

`ticketblock @user [reason]` impedisce a un membro di aprire ticket. Il motivo viene scritto nel canale di log, se ne è impostato uno. `ticketunblock` lo rimuove. La scheda **Avanzate** della dashboard ha la stessa sezione **Gestione blacklist**, che richiede un ID utente.

## Strumenti di massa

- `ticketcloseinactive <hours>` chiude ogni ticket aperto senza attività per quel numero di ore, pubblicando in ognuno un embed "auto closed" e archiviandolo se il tipo ha una categoria di archivio. Lo stesso fa **Chiudi i ticket inattivi** nella scheda **Avanzate**.
- `ticketmoveall <source category> <target category>` sposta ogni canale ticket tra due categorie.

## Statistiche

`ticketstats` mostra i totali, i conteggi di ticket aperti e chiusi, il tempo medio di risposta in minuti, il tempo medio di risoluzione in ore, e le suddivisioni per tipo e priorità. `ticketuserstats [@user]` mostra le stesse informazioni per un membro, più i suoi ticket recenti. La scheda **Panoramica** mostra i tempi di risposta, i ticket per priorità e le prestazioni dello staff.

## Impostazioni

La pagina Ticket ha sei schede: **Panoramica**, **Ticket**, **Pannelli ticket**, **Configurazione**, **Casi** e **Avanzate**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Canale delle trascrizioni | nessuno | Dove vengono pubblicati i riepiloghi delle trascrizioni con i link (Configuration) |
| Canale di log | nessuno | Dove vengono registrate la creazione dei ticket e le voci della lista nera (Configuration) |
| Priorità | nessuna | Definizioni di priorità valide per tutto il server (Configuration) |
| Tag | nessuno | Definizioni di tag valide per tutto il server (Configuration) |
| Embed del pannello | titolo "Support Tickets" | Il messaggio del pannello, creato nell'editor di embed (Ticket Panels) |
| Impostazioni per tipo | vedi la tabella sopra | Impostate su ogni pulsante o opzione del menu (Ticket Panels) |
| Lista nera | vuota | Membri che non possono aprire ticket (Advanced) |

La scheda **Ticket** elenca i ticket aperti e chiusi, con la ricerca per ticket, utente, canale o tag. Da lì lo staff può rivendicare, annullare la rivendicazione, impostare la priorità, aggiungere o rimuovere tag, aggiungere una nota dello staff, chiudere con un motivo facoltativo, archiviare e aprire la trascrizione.

> [!PERMISSION]
> Il bot ha bisogno di Gestisci canali e Gestisci ruoli per creare i canali dei ticket e impostare chi può vederli. Il suo ruolo deve poter vedere le categorie dei ticket e di archivio.

## Procedura di configurazione

1. Crea una categoria per i ticket aperti e, facoltativamente, una per quelli chiusi. Crea un canale delle trascrizioni e un canale di log visibili solo allo staff.
2. Apri **Ticket** nella dashboard, vai su **Configurazione** e imposta **Canale delle trascrizioni** e **Log Channel**.
3. Sempre su **Configurazione**, crea almeno una priorità (per esempio `urgent`, livello 5, con Notify staff attivo) e i tag che ti servono.
4. Vai su **Pannelli ticket** e scegli **Crea nuovo pannello**. Seleziona il canale e progetta l'**Embed del pannello**.
5. Seleziona il pannello e aggiungi un **Nuovo pulsante**. Imposta etichetta, stile, **Categoria dei ticket**, **Categoria archivio**, **Ruoli di supporto**, e attiva **Salva trascrizione**. Scegli se conservare i canali chiusi nella categoria di archivio oppure **Elimina alla chiusura** con un ritardo.
6. Facoltativamente apri l'editor dei moduli per aggiungere campi, e l'editor del messaggio di apertura per personalizzare il benvenuto.
7. Per più tipi di ticket in un unico menu a tendina, aggiungi invece un **Nuovo menu a tendina** e un'opzione per ogni tipo con le stesse impostazioni.
8. Apri un ticket di prova da un altro account, rivendicalo, imposta una priorità, chiudilo e controlla il canale delle trascrizioni.

Su Discord, `/tickets setup wizard #channel` ti guida attraverso gli stessi passaggi con dei modelli (Basic Support, Department Support, Gaming Server, Business, Mod Applications).

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Gli ID dei pannelli sono ID di messaggi; gli ID di pulsanti, menu e opzioni si ottengono da `panelinfo` o `ticketlistpanel`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `ticketpanel <#channel> [embedJson]` | `tpanel` | Amministratore | Crea un pannello, con un'anteprima o una richiesta di conferma |
| `ticketpaneldelete <panelId> [force]` | `tpaneldelete` | Amministratore | Elimina un pannello; `true` lo forza anche con ticket collegati |
| `ticketupdatepanel <panelId> <embedJson>` | `tupdatepanel` | Amministratore | Sostituisce l'embed del pannello |
| `ticketmovepanel <panelId> <#channel>` | `tmovepanel` | Amministratore | Sposta un pannello in un altro canale |
| `ticketduplicatepanel <panelId> <#channel>` | `tduplicatepanel` | Amministratore | Copia un pannello e i suoi componenti |
| `panellist` | `plist` | Amministratore | Elenca i pannelli con il conteggio dei componenti |
| `panelinfo <panelId>` | `pinfo` | Amministratore | Mostra pulsanti e menu di un pannello con gli ID |
| `ticketlistpanels` | `tlistpanels` | Gestisci canali | Elenco dettagliato e paginato di tutti i pannelli |
| `ticketlistpanel <panelId>` | `tlistpanel` | Gestisci canali | Ogni componente di un pannello con le sue impostazioni |
| `checkpanels` | `tcheckpanels` | Amministratore | Segnala i pannelli il cui messaggio o canale manca |
| `recreatepanel <panelId>` | `trecreate` | Amministratore | Ripubblica un pannello mancante |
| `recreateallpanels` | `trecreateall` | Amministratore | Ripubblica ogni pannello mancante |
| `setpaneltranscripts <panelId> <true or false>` | `sptranscripts` | Amministratore | Attiva o disattiva le trascrizioni per ogni pulsante di un pannello |
| `ticketaddbutton <panelId> <label> [style] [emoji]` | `taddbtn` | Amministratore | Aggiunge un pulsante |
| `buttoninfo <buttonId>` | `binfo` | Amministratore | Mostra le impostazioni di un pulsante |
| `deletebutton <buttonId>` | `delbtn` | Amministratore | Rimuove un pulsante |
| `ticketcategory <buttonId> [category]` | `tcat` | Amministratore | Imposta o rimuove la categoria dei ticket |
| `ticketarchivecategory <buttonId> [category]` | `tarchivecat` | Amministratore | Imposta o rimuove la categoria di archivio |
| `ticketautoarchive <buttonId> [true or false]` | `tautoarchive` | Amministratore | Archivia automaticamente alla chiusura |
| `ticketclosebehavior <buttonId> [autoArchive] [deleteOnClose] [lockOnClose] [renameOnClose] [deleteDelayMinutes]` | `tclosebehavior` | Amministratore | Imposta più comportamenti di chiusura in una volta |
| `ticketautoclose <buttonId> [hours]` | `tautoclose` | Amministratore | Imposta o rimuove le ore di chiusura automatica |
| `setautoclose <buttonId> <hours>` | `sautoclose` | Amministratore | Uguale a sopra |
| `ticketresponsetime <buttonId> [minutes]` | `tresponsetime` | Amministratore | Imposta o rimuove il tempo di risposta richiesto |
| `setresponsetime <buttonId> <minutes>` | `sresponsetime` | Amministratore | Uguale a sopra |
| `setmodaltitle <buttonId> <title>` | `smodaltitle` | Amministratore | Titolo del modulo del ticket |
| `addmodalfield <buttonId> <label> [options]` | `addmfield` | Amministratore | Aggiunge un campo al modulo, opzioni come `paragraph,optional,max:500` |
| `removemodalfield <buttonId> <fieldId>` | `removemfield` | Amministratore | Rimuove un campo del modulo |
| `listmodalfields <buttonId>` | `listmfields` | Amministratore | Elenca i campi del modulo |
| `addselectmenu <panelId>` | `addsmenu` | Amministratore | Aggiunge un menu a tendina con una procedura guidata |
| `addoption <menuId> <label> [description] [emoji]` | `addopt` | Amministratore | Aggiunge un'opzione a un menu |
| `listoptions <menuId>` | `listopts` | Amministratore | Elenca le opzioni di un menu |
| `removeoption <menuId> <value>` | `removeopt` | Amministratore | Conferma un'opzione tramite valore (vedi le avvertenze) |
| `deleteselectoption <optionId>` | `delselectoption` | Amministratore | Rimuove un'opzione; l'ultima non può essere rimossa |
| `setplaceholder <menuId> <text>` | `splaceholder` | Amministratore | Cambia il testo segnaposto del menu |
| `deleteselectmenu <menuId>` | `delselectmenu` | Amministratore | Rimuove un menu e le sue opzioni |
| `ticketclaim` | `tclaim` | Nessuno | Rivendica il ticket corrente (ruolo di supporto o amministratore) |
| `ticketunclaim` | `tunclaim` | Nessuno | Rilascia la tua rivendicazione (chi ha rivendicato o amministratore) |
| `ticketclose [archive]` | `tclose` | Nessuno | Chiude il ticket corrente; `true` lo archivia anche |
| `ticketarchive` | `tarchive` | Gestisci canali | Archivia il ticket corrente |
| `ticketnote <text>` | `tnote` | Nessuno | Aggiunge una nota dello staff |
| `ticketpriority <priorityId>` | `tpriority` | Nessuno | Imposta la priorità del ticket corrente |
| `ticketaddtags <tagId...>` | `taddtags` | Nessuno | Aggiunge tag al ticket corrente |
| `ticketremovetags <tagId...>` | `tremovetags` | Nessuno | Rimuove tag dal ticket corrente |
| `ticketaddpriority <id> <name> <emoji> <level> <pingStaff> <responseTime> <color>` | `taddpriority` | Amministratore | Definisce una priorità, per esempio `taddpriority urgent Urgent :fire: 5 true 00:15:00 red` |
| `ticketremovepriority <id>` | `tremovepriority` | Amministratore | Elimina la definizione di una priorità |
| `ticketaddtag <id> <name> <description> <color>` | `taddtag` | Amministratore | Definisce un tag |
| `ticketremovetag <id>` | `tremovetag` | Amministratore | Elimina la definizione di un tag |
| `ticketcreatecase <title> <description>` | `tcreatecase` | Gestisci messaggi | Crea un caso |
| `ticketlinkcase <caseId>` | `tlinkcase` | Gestisci messaggi | Collega il ticket corrente a un caso |
| `ticketunlinkcase` | `tunlinkcase` | Gestisci messaggi | Scollega il ticket corrente |
| `ticketblock @user [reason]` | `tblock` | Amministratore | Inserisce un membro nella lista nera |
| `ticketunblock @user` | `tunblock` | Amministratore | Rimuove dalla lista nera |
| `tickettranscriptchannel [#channel]` | `ttranscriptch` | Amministratore | Imposta o rimuove il canale delle trascrizioni |
| `ticketlogchannel [#channel]` | `tlogch` | Amministratore | Imposta o rimuove il canale di log |
| `ticketcloseinactive <hours>` | `tcloseinactive` | Amministratore | Chiude i ticket inattivi da quel numero di ore |
| `ticketmoveall <category> <category>` | `tmoveall` | Amministratore | Sposta tutti i ticket tra categorie |
| `ticketstats` | `tstats` | Nessuno | Statistiche dei ticket del server |
| `ticketuserstats [@user]` | `tuserstats` | Nessuno | Statistiche dei ticket di un membro |

I comandi slash si trovano sotto `/tickets` (crea pannello, elenca pannelli, rivendica, chiudi, nota, archivia, priorità, gruppi pannello e impostazioni, gruppo casi) e `/tickets setup` (procedura guidata, quick-button, quick-menu, from-template, templates).

## Suggerimenti e avvertenze

- I comandi che agiscono sul "ticket corrente" funzionano solo dentro un canale ticket. Eseguili nel ticket, non in un canale dello staff.
- Ogni tipo di ticket deve avere dei ruoli di supporto, altrimenti nessuno tranne gli amministratori può rivendicarlo e, una volta bloccato il canale, nessuno tranne chi ha aperto il ticket può scrivere.
- Il limite predefinito è un ticket aperto per membro per tipo. Alza **Ticket attivi massimi** per i tipi in cui i ticket ripetuti sono normali.
- **Chiusura automatica (ore)** e **Tempo di risposta richiesto** vengono salvati sul tipo e mostrati in `buttoninfo`, ma l'unica cosa del bot che chiude i ticket inattivi è `ticketcloseinactive` o l'azione in blocco **Chiudi i ticket inattivi**. Se vuoi una pulizia automatica, eseguila tu con una pianificazione.
- `removeoption` al momento segnala solo che è andata a buon fine; per rimuovere davvero un'opzione usa `deleteselectoption` con l'ID dell'opzione.
- **Elimina alla chiusura** e **Blocca alla chiusura** interagiscono: un ticket impostato per l'eliminazione non viene prima bloccato, aspetta solo il ritardo di eliminazione.
- Il JSON dell'embed del pannello deve essere un output valido dell'editor di embed. Usa l'editor della dashboard e copia il JSON se preferisci i comandi.
- Eliminare un pannello con ticket aperti viene rifiutato a meno che tu non passi `true`, che rimuove il collegamento tra i ticket e il pannello.
- Le trascrizioni acquisiscono al massimo 5000 messaggi, e il link "View Transcript" apre la trascrizione nella dashboard.

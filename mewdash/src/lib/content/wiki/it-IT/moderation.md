---
title: Moderazione
slug: moderation
summary: Avvisa, silenzia, metti in timeout, espelli e bandisci i membri, fai salire automaticamente le punizioni man mano che gli avvertimenti si accumulano e controlla quanti giorni di messaggi elimina un ban.
icon: fa-flag
category: Security
dashboard: /dashboard/moderation
module: Moderation
tags: [moderation, warn, warnings, warn punish, punishment ladder, mute, mute role, timeout, ban, softban, kick, ban purge, ban prune, purge, prune, dehoist, warnlog, moderazione, avvertimenti, scala punizioni, ruolo mute, pulizia ban, eliminazione messaggi, log avvertimenti]
related: [administration, filter, logging, auditlog]
---

## Cosa fa

La moderazione è lo strumento che lo staff usa sui singoli membri. Gli avvertimenti ne sono il cuore: un moderatore esegue `warn @user reason`, il membro riceve un DM con il motivo e chi lo ha avvisato, l'avvertimento viene salvato e, se il server ha un canale log avvertimenti, lì compare un embed con il numero di avvertimenti e l'eventuale punizione scattata.

Gli avvertimenti si sommano. Puoi costruire una scala di punizioni in modo che, raggiunto un certo numero di avvertimenti attivi, scatti automaticamente qualcosa: un mute, un timeout, un kick, un ban o un ruolo. Lo staff non deve ricordarsi le regole; il bot le applica nel momento in cui il conteggio viene raggiunto. Gli avvertimenti possono essere perdonati in seguito, oppure impostati per scadere da soli dopo un certo numero di giorni.

Attorno a questo ci sono le azioni dirette: mute (con un ruolo mute gestito), timeout, kick, softban, ban, ban temporaneo, kick di massa, eliminazione di messaggi e pulizia dei nickname per i membri che si mettono in cima alla lista con caratteri speciali. Ogni ban ha anche una pulizia configurabile, cioè quanti giorni di messaggi del membro Discord elimina insieme al ban.

La pagina della dashboard copre avvertimenti, scala delle punizioni, canale log avvertimenti e impostazioni di pulizia dei ban. Le azioni dirette come mute, kick e ban sono solo comandi.

## Perché usarlo

- Vuoi una politica coerente del tipo "tre richiami" che si applichi allo stesso modo, indipendentemente dal moderatore di turno.
- I membri devono essere silenziati in fretta senza modificare a mano i permessi dei canali.
- Uno spammer è entrato e vuoi eliminare il suo ultimo giorno di messaggi insieme al ban, ma un ban temporaneo per un membro abituale non dovrebbe cancellare la sua cronologia.
- Lo staff ha bisogno di un registro ricercabile di chi è stato avvisato, da chi e perché, che resti anche quando cambiano i moderatori.
- Nomi come "!!! xXx" continuano a salire in cima alla lista dei membri e vuoi ripulirli tutti in una volta.

## Avvertimenti

`warn <user> [reason]` richiede il permesso Bannare Membri. Il bot prova prima a inviare al membro un embed in DM con il nome del server, il moderatore e il motivo. Se il DM non riesce, la conferma nel canale ottiene un footer che lo segnala. L'avvertimento viene poi salvato con il nome del moderatore e il motivo, oppure `-` se non è stato indicato alcun motivo.

Il membro deve trovarsi sotto il moderatore nella gerarchia dei ruoli, e sotto il bot. In caso contrario il comando si rifiuta.

`warnlog <user>` mostra un elenco paginato, nove per pagina, con data, moderatore e motivo. Gli avvertimenti perdonati appaiono barrati, con l'indicazione di chi li ha cancellati. `warnlogall` elenca ogni membro con avvertimenti nel formato `active (total - forgiven)`.

`warnclear <user> [index]` segna gli avvertimenti come perdonati. Senza indice, oppure con `0`, li perdona tutti. Con un indice perdona solo quello, numerato come in `warnlog`. Gli avvertimenti perdonati restano nel registro ma smettono di contare ai fini delle punizioni. La dashboard può anche eliminare un avvertimento in modo definitivo, rimuovendolo per sempre.

### Scadenza degli avvertimenti

`warnexpire <days> <clear|delete>` imposta per quanto tempo un avvertimento conta. I giorni possono andare da 0 a 366; 0 disattiva la scadenza. L'azione decide cosa succede quando un avvertimento scade:

| Azione | Cosa succede |
| --- | --- |
| Clear | L'avvertimento viene segnato come perdonato e resta nel registro |
| Delete | L'avvertimento viene rimosso dal database |

La scadenza viene controllata ogni dodici ore, e una volta subito quando la imposti.

### Il canale log avvertimenti

Imposta il canale con `setwarnchannel #channel` oppure con il selettore **Canale di log degli avvertimenti** nella scheda Punishments della dashboard. Ogni avvertimento pubblica lì un embed con nome e ID del membro, il numero attuale di avvertimenti, la punizione scattata (o "None"), il motivo e un link diretto al messaggio che ha emesso l'avvertimento.

## Punizioni per avvertimento

La scala è un elenco di regole del tipo "a N avvertimenti attivi, fai X". Quando viene emesso un avvertimento, il bot conta gli avvertimenti attivi del membro, incluso quello nuovo, e cerca una regola con esattamente quel numero. Scatta solo una corrispondenza esatta: quindi un membro con una regola a 3 che per qualche motivo arriva a 4 senza una regola a 4 non riceve nulla in più.

Imposta una regola con `warnpunish <number> <punishment> [time]`, oppure con `warnpunish <number> addrole <role> [time]` per la variante con ruolo. `warnpunish <number>` da solo rimuove la regola. `warnpunishlist` mostra la scala.

| Punizione | Temporizzata? | Cosa fa |
| --- | --- | --- |
| Mute | Facoltativa | Applica il ruolo mute, oppure un mute temporizzato se viene indicato un tempo |
| ChatMute | Facoltativa | Solo ruolo mute, nessun mute vocale |
| VoiceMute | Facoltativa | Solo mute vocale del server |
| Timeout | Obbligatoria, fino a 28 giorni | Timeout di Discord |
| Kick | No | Espelle il membro |
| Softban | No | Banna e sbanna subito per eliminare i messaggi |
| Ban | Facoltativa | Ban permanente, oppure temporaneo se viene indicato un tempo |
| AddRole | Facoltativa | Aggiunge il ruolo scelto, rimosso di nuovo dopo il tempo indicato, se presente |
| RemoveRoles | No | Rimuove tutti i ruoli del membro |

I tempi vengono salvati in minuti e possono arrivare fino a 49 giorni. Softban, Kick e RemoveRoles rifiutano un tempo. Timeout non si salva senza un tempo. Le punizioni vengono eseguite con il motivo "Warned too many times."

Nella dashboard la stessa scala si trova nella scheda **Punizioni**: scegli **Al avvertimento #**, una **Punizione**, una **Durata (minuti)** facoltativa e un **Ruolo da aggiungere** per la punizione con ruolo, poi **Aggiungi alla scala**. Salvare una regola per un conteggio che ne ha già una la sostituisce.

> [!EXAMPLE]
> `warnpunish 2 mute 1h`, `warnpunish 3 timeout 1d`, `warnpunish 5 ban`. Due avvertimenti mutano per un'ora, tre danno un timeout di un giorno, cinque portano al ban.

## Mini avvertimenti

Esiste un secondo binario di avvertimenti, indipendente, chiamato mini avvertimenti, pensato per le infrazioni minori gestite dallo staff junior. `mwarn` richiede solo il permesso Silenziare Membri invece di Bannare Membri. Ha un proprio registro (`mwarnlog`, `mwarnlogall`), un proprio comando di pulizia, una propria scadenza, una propria scala di punizioni (`mwarnpunish`) e un proprio canale log (`setmwarnchannel`). I mini avvertimenti non contano mai per la scala principale, e viceversa. La dashboard non mostra i mini avvertimenti.

## Mute e ruolo mute

Il bot gestisce un ruolo mute. Per impostazione predefinita si chiama `Mewdeko-mute`; cambialo con `muterole @role`, oppure esegui `muterole` da solo per vedere quello attuale. La prima volta che serve un mute, il bot crea il ruolo se non esiste, poi scorre ogni canale testuale e aggiunge una sovrascrittura che nega Inviare Messaggi, Aggiungere Reazioni, Allegare File, Inviare Messaggi nei Thread e Creare Thread Pubblici. I thread vengono saltati. Nei server con molti canali l'operazione può richiedere un po' di tempo.

| Comando | Effetto |
| --- | --- |
| `mute` | Mute completo: aggiunge il ruolo mute |
| `chatmute` | Aggiunge solo il ruolo mute |
| `voicemute` | Silenzia il membro solo in vocale a livello di server |
| `stfu` | Nega Inviare Messaggi al membro solo nel canale corrente, tramite una sovrascrittura dei permessi |

Ognuno ha una forma temporizzata. I mute completi vanno da un minuto fino a 90 giorni; i mute di chat e vocali da un minuto fino a 49 giorni. `stfu` con un tempo rimuove la sovrascrittura allo scadere. I membri mutati ricevono un DM quando vengono mutati e smutati.

`removeonmute y` fa sì che un mute completo rimuova anche gli altri ruoli del membro e li salvi, mentre `unmute` glieli restituisce. `removeonmute n` disattiva questo comportamento. `unmuteall` rimuove il ruolo mute a tutti quelli che lo hanno, dopo una richiesta di conferma, con un motivo facoltativo.

## Timeout

`timeout <time> <user> [reason]` usa il timeout nativo di Discord, fino a 28 giorni. Sia tu sia il bot dovete avere il permesso Mettere in Timeout i Membri. `untimeout <user>` lo rimuove. Il motivo viene registrato nel registro di controllo nel formato `moderator | reason`.

## Ban, kick e softban

`ban <user> [reason]` invia prima un DM al membro, poi lo banna. `ban <time> <user> [reason]` è un ban temporaneo che si rimuove da solo, fino a 49 giorni. `ban <pruneTime> <time> <user>` imposta esplicitamente la finestra di pulizia e la durata del ban. Bannare tramite ID funziona anche per chi non è nel server. `unban <user or id>` annulla il ban.

`softban <user> [reason]` banna e sbanna subito, cioè un kick che elimina anche i messaggi recenti. `kick <user> [reason]` espelle, e `masskick @a @b @c` espelle più persone insieme e riporta quante ci sono riuscite. `masskill` è riservato al proprietario del bot e banna in massa una lista di ID incollata.

### Il DM di ban

Il messaggio inviato a un membro bannato può essere personalizzato con `banmessage <text or embed code>`. Il testo passa dal parser degli embed, quindi funziona tutto ciò che si può creare con l'embed builder. Impostalo a `-` per non inviare alcun DM, e usa `banmsgreset` per tornare al predefinito. `banmsgtest [duration] [reason]` ti invia il modello attuale così puoi vederlo.

| Segnaposto | Valore |
| --- | --- |
| `%ban.mod%` | Il nome completo del moderatore |
| `%ban.mod.name%` | Il nome utente del moderatore |
| `%ban.user%` | Il nome completo del membro bannato |
| `%ban.user.name%` | Il nome utente del membro bannato |
| `%ban.reason%` oppure `%reason%` | Il motivo, o `-` se assente |
| `%ban.duration%` | La durata come `d.hh:mm`, oppure `perma` |

Anche i segnaposto del server, come `%server.name%`, funzionano qui.

## Pulizia dei ban

Ogni ban porta con sé una pulizia: il numero di giorni di messaggi del membro che Discord elimina insieme al ban, da 0 a 7. Invece di un unico valore globale, ogni tipo di ban ha un proprio predefinito, e puoi sovrascriverlo per tutto il server, per una categoria o per un singolo canale.

| Azione | Chiave | Predefinito integrato |
| --- | --- | --- |
| Ban | `ban` | 7 giorni |
| Ban tramite ID | `hackban` | 7 giorni |
| Ban temporaneo | `tempban` | nessuno |
| Softban | `softban` | 7 giorni |
| Ban di massa | `massban` | 7 giorni |
| Ban tramite hash dell'avatar | `banbyhash` | nessuno |
| Ban in ruolo | `baninrole` | nessuno |
| Ban per età minima | `banunder` | nessuno |
| Punizione per avvertimento | `warnpunish` | nessuno |
| Ruolo di auto-ban | `autobanrole` | nessuno |
| Monitor dei ruoli | `rolemonitor` | nessuno |
| Filtro | `filter` | nessuno |
| Lockdown | `lockdown` | nessuno |
| Dashboard | `dashboard` | nessuno |

Quando avviene un ban, il bot cerca l'impostazione più specifica: prima il canale in cui è stato eseguito il comando, poi la categoria di quel canale, poi il predefinito del server. All'interno di ogni livello, un'impostazione per l'azione esatta prevale su una impostata per "all actions". Se nulla corrisponde, si applica il predefinito integrato.

`banprune` mostra cosa eliminerebbe un ban dal canale corrente, insieme a tutte le impostazioni configurate. `banpruneset <action|all> <days> [#channel or category]` ne imposta una, `banpruneclear <action|all> [#channel or category]` ne rimuove una, e `banprunereset` le cancella tutte.

La scheda **Eliminazione ban** della dashboard elenca ogni azione sotto **Server Defaults**, con una casella per i giorni accanto a ciascuna, una riga di fallback **Tutte le azioni** e una sezione **Eccezioni** dove scegli un **Ambito** (Channel o Category), il bersaglio, un'**Azione** e il **Elimina (giorni)**.

## Eliminazione di messaggi

`purge [count] [flags]` elimina fino a 1000 messaggi nel canale corrente. Senza numero elimina gli ultimi 100 messaggi del bot. `purge @user [count]` elimina solo i messaggi di quel membro delle ultime due settimane. I flag si possono combinare: `-s` salta i messaggi fissati, `-nb` salta i bot, `-ob` considera solo i bot, `-he` solo i messaggi con embed, `-ne` solo quelli senza, `-c text` solo i messaggi che contengono il testo, `-b date` i messaggi prima di una data e `-a date` quelli dopo una data.

`purgeuser <user> <count>` cerca negli ultimi `count` messaggi (da 1 a 1000) di ogni canale testuale ed elimina da ciascuno i messaggi di quell'utente.

## Nickname

`dehoist <user>` e `sanitize <user>` riscrivono il nickname di un solo membro eliminando i caratteri speciali iniziali o i caratteri insoliti. `dehoistall [nicksOnly]` e `sanitizeall` lo fanno per tutti, dopo una conferma, come processo in background; `massnickprogress` mostra a che punto è, e `massnickstop` lo annulla. I comandi per un singolo membro richiedono che il bot abbia il permesso Gestire Nickname; le varianti "all" richiedono che il bot abbia Amministratore. In entrambi i casi il ruolo del bot deve trovarsi sopra i membri interessati.

## Impostazioni

La pagina della dashboard ha cinque schede: **Panoramica** (conteggi degli avvertimenti), **Avvertimenti**, **Punizioni**, **Attività recente** e **Eliminazione ban**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Warning Log Channel | nessuno | Canale che riceve un embed per ogni avvertimento |
| Punishment ladder | vuota | Cosa scatta a ogni conteggio di avvertimenti |
| Warning expiry | disattivata | Giorni prima che un avvertimento venga cancellato o eliminato, solo comandi |
| Mute role | `Mewdeko-mute` | Il ruolo applicato dai comandi di mute, solo comandi |
| Remove roles on mute | disattivata | Rimuove e ripristina i ruoli attorno a un mute completo, solo comandi |
| Ban DM template | embed predefinito | Il DM ricevuto da un membro bannato, solo comandi |
| Ban purge defaults | per azione | Giorni di messaggi eliminati con ogni tipo di ban |
| Ban purge overrides | nessuno | Pulizia per canale o per categoria |

Nella scheda **Avvertimenti** lo staff può avvisare un membro tramite ID utente con un motivo obbligatorio, cercare per ID, motivo o moderatore, nascondere gli avvertimenti perdonati, perdonare un singolo avvertimento, perdonarli tutti per un membro, oppure eliminarne uno in modo definitivo.

> [!WARNING]
> Eliminare un avvertimento dalla dashboard lo rimuove per sempre e smette di farlo contare. Perdonare mantiene il registro e fa comunque smettere il conteggio. Perdona, a meno che tu non abbia un motivo per cancellare la cronologia.

## Procedura di configurazione

1. Apri **Moderazione** nella dashboard e vai su **Punizioni**.
2. Scegli un **Canale di log degli avvertimenti** che possa essere letto solo dallo staff.
3. Aggiungi regole alla scala. Un inizio prudente è Mute per 60 minuti a 2, Timeout per 1440 minuti a 3, Ban a 5.
4. Esegui `muterole @Muted` se hai già un ruolo muto, altrimenti lascia che il bot crei `Mewdeko-mute` al primo utilizzo.
5. Decidi la scadenza con `warnexpire 90 clear`, così i vecchi avvertimenti smettono di contare dopo tre mesi.
6. Nella scheda **Eliminazione ban** imposta **Temporary ban** a 0 se non vuoi che i ban temporanei cancellino la cronologia, e aggiungi sovrascritture per canale se un canale di spam del bot deve eliminare di più.
7. Prova con un alt: `warn @alt test`, controlla il canale log, poi esegui `warnclear @alt`.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non lo hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `warn <user> [reason]` | | Bannare Membri | Avvisa un membro e applica eventuali punizioni della scala |
| `warnlog <user or id>` | | Bannare Membri | Mostra gli avvertimenti di un membro |
| `warnlogall` | | Bannare Membri | Mostra i conteggi di avvertimenti per tutti |
| `warnclear <user> [index]` | `warnc` | Bannare Membri | Perdona tutti gli avvertimenti, oppure uno per numero |
| `warnexpire <days> <clear|delete>` | `warne` | Amministratore | Cancella o elimina automaticamente gli avvertimenti dopo un certo numero di giorni |
| `warnpunish <number> <punishment> [time]` | `warnp` | Bannare Membri | Imposta una regola della scala, o la rimuove se indichi solo il numero |
| `warnpunishlist` | `warnpl` | Nessuno | Mostra la scala delle punizioni |
| `setwarnchannel <#channel>` | `warnchannel` | Amministratore | Imposta il canale log degli avvertimenti |
| `mwarn <user> [reason]` | `miniwarn` | Silenziare Membri | Emette un mini avvertimento |
| `mwarnlog [page] [user or id]` | | Silenziare Membri, oppure Nessuno per i propri | Mostra i mini avvertimenti |
| `mwarnlogall` | `mwarnlogs` | Silenziare Membri | Conteggi dei mini avvertimenti per tutti |
| `mwarnclear <user or id> [index]` | `mwarnc` | Amministratore | Perdona i mini avvertimenti |
| `mwarnexpire <days> [clear|delete]` | `mwarne` | Amministratore | Scadenza dei mini avvertimenti |
| `mwarnpunish <number> <punishment> [time]` | `mwarnp` | Amministratore | Imposta o rimuove una regola della scala dei mini avvertimenti |
| `mwarnpunishlist` | `mwarnplist`, `mwarnpl` | Nessuno | Mostra la scala dei mini avvertimenti |
| `setmwarnchannel <#channel>` | `mwarnchannel` | Amministratore | Imposta il canale log dei mini avvertimenti |
| `timeout <time> <user> [reason]` | | Mettere in Timeout i Membri | Mette in timeout un membro, fino a 28 giorni |
| `untimeout <user>` | | Mettere in Timeout i Membri | Rimuove un timeout |
| `mute <user> [time] [reason]` | | Gestire Ruoli o Silenziare Membri | Mute completo, facoltativamente temporizzato |
| `unmute <user> [reason]` | | Gestire Ruoli o Silenziare Membri | Rimuove un mute completo |
| `chatmute [time] <user> [reason]` | | Gestire Ruoli | Solo ruolo mute |
| `chatunmute <user> [reason]` | | Gestire Ruoli | Rimuove un mute di chat |
| `voicemute [time] <user> [reason]` | | Silenziare Membri | Solo mute vocale |
| `voiceunmute <user> [reason]` | | Silenziare Membri | Rimuove un mute vocale |
| `stfu [time] <user>` | `cmute`, `channelmute` | Silenziare Membri | Nega l'invio solo nel canale corrente |
| `unstfu <user>` | `unchannelmute` | Silenziare Membri | Annulla `stfu` |
| `muterole [role]` | `setmuterole` | Gestire Ruoli | Mostra o imposta il ruolo mute |
| `removeonmute <y|n>` | | Amministratore | Rimuove e ripristina i ruoli attorno ai mute completi |
| `unmuteall [reason]` | `umall` | Amministratore | Smuta tutti quelli che hanno il ruolo mute |
| `kick <user or id> [reason]` | `k` | Espellere Membri | Espelle un membro |
| `masskick <users...>` | `mkick` | Espellere Membri | Espelle più membri |
| `ban [time] <user or id> [reason]` | `b` | Bannare Membri | Banna, oppure ban temporaneo fino a 49 giorni |
| `unban <user or id>` | | Bannare Membri | Rimuove un ban |
| `softban <user or id> [reason]` | `sb` | Espellere Membri e Gestire Messaggi | Banna e sbanna per eliminare i messaggi |
| `banmessage [text]` | `banmsg`, `bantemplate`, `bantemp` | Bannare Membri | Mostra o imposta il DM di ban, `-` per disattivarlo |
| `banmsgreset` | | Bannare Membri | Ripristina il DM di ban predefinito |
| `banmsgtest [time] [reason]` | | Bannare Membri | Ti invia in DM il modello di ban |
| `masskill <ids and reasons>` | | Proprietario del bot | Banna in massa una lista incollata |
| `banprune` | `banpurge` | Bannare Membri | Mostra le impostazioni di pulizia effettive e configurate |
| `banpruneset <action|all> <days> [channel]` | `banpurgeset` | Amministratore | Imposta un'impostazione di pulizia |
| `banpruneclear <action|all> [channel]` | `banpurgeclear` | Amministratore | Rimuove un'impostazione di pulizia |
| `banprunereset` | `banpurgereset` | Amministratore | Rimuove ogni impostazione di pulizia |
| `purge [count or user] [count] [flags]` | `clear`, `prune` | Gestire Messaggi | Elimina in blocco messaggi in questo canale |
| `purgeuser <user> <count>` | `pruneuser` | Gestire Messaggi | Elimina i messaggi di un utente in tutti i canali |
| `dehoist <user>` | | Gestire Nickname | Corregge un nickname con caratteri iniziali speciali |
| `dehoistall [nicksOnly]` | `dehoista` | Gestire Nickname | Corregge ogni nickname con caratteri iniziali speciali |
| `sanitize <user>` | | Gestire Nickname | Normalizza un nickname |
| `sanitizeall` | `sanitizea` | Gestire Nickname | Normalizza ogni nickname |
| `massnickprogress` | `mnickprogress`, `mnp` | Amministratore | Progresso di un dehoist o sanitize in corso |
| `massnickstop` | `mnstop`, `mns` | Amministratore | Ferma un dehoist o sanitize in corso |

## Suggerimenti e insidie

- Il ruolo del bot deve trovarsi sopra chiunque il bot silenzi, espella o banni, e sopra lo stesso ruolo mute. La maggior parte degli errori "cannot apply punishment" dipende dalla gerarchia.
- Il bot ha bisogno di Bannare Membri, Espellere Membri, Mettere in Timeout i Membri, Gestire Ruoli e Gestire Messaggi per i comandi corrispondenti; ogni comando verifica prima i permessi del bot.
- La scala scatta solo su un conteggio esatto. Compila ogni passaggio che ti interessa invece di presumere "3 o più".
- Contano solo gli avvertimenti emessi tramite il bot. Timeout e ban di Discord non aggiungono avvertimenti.
- Il ruolo mute nega i permessi per canale. I canali creati dopo la creazione del ruolo ricevono la sovrascrittura alla prossima volta che qualcuno viene mutato, non immediatamente.
- Discord permette l'eliminazione in blocco solo per i messaggi degli ultimi 14 giorni. I messaggi più vecchi vengono saltati dai comandi di purge.
- La pulizia in fase di ban è limitata a 7 giorni da Discord, qualunque valore tu configuri.
- Gli avvertimenti dalla dashboard richiedono un motivo valido e usano il tuo account della dashboard come nome del moderatore.

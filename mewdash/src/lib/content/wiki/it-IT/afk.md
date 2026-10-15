---
title: Sistema AFK
slug: afk
summary: Permetti ai membri di segnarsi come assenti, dire a chiunque li menzioni il motivo e cancellare lo stato automaticamente quando tornano.
icon: fa-moon
category: Actions
dashboard: /dashboard/afk
module: Afk
tags: [afk, away, idle, status, brb, mention reply, timed afk, placeholders, sistema afk, assente, inattivo, stato, risposta alle menzioni, afk a tempo, segnaposto]
related: [utility, administration]
---

## Cosa fa

Un membro esegue `afk` con un messaggio facoltativo. Da quel momento, ogni volta che qualcuno lo menziona, il bot risponde in quel canale con il messaggio e con il tempo trascorso dall'assenza. Quando il membro torna, lo stato viene cancellato, viene pubblicato un breve avviso di "bentornato" che si elimina dopo cinque secondi, e il nickname viene ripristinato.

Mentre un membro è assente il bot prova anche a rinominarlo in `[AFK] name`, tagliato per rientrare nel limite dei nickname di Discord, così lo stato è visibile nell'elenco dei membri.

Eseguire `afk` senza messaggio funziona come un interruttore: se non sei assente, lo attiva con un messaggio vuoto, e se lo sei, lo disattiva.

## Perché usarlo

- Nei server molto attivi, i membri smettono di essere menzionati ripetutamente da persone che non hanno visto il loro "brb".
- Lo staff può vedere a colpo d'occhio chi c'è e chi no.
- L'AFK a tempo copre il caso "torno tra due ore" senza che nessuno debba ricordarsi di cancellarlo.

## Come finisce uno stato

Il **AFK type** decide cosa il bot considera come ritorno. È l'impostazione più importante della pagina.

| Tipo | Lo stato si cancella quando |
| --- | --- |
| Self disable | Solo quando il membro esegue di nuovo `afk`, oppure lo staff lo rimuove. Nulla di automatico. |
| On message | Il membro invia un messaggio in un punto qualsiasi del server. |
| On type | Il membro inizia a scrivere in un canale qualsiasi. |
| Either | Un messaggio o la digitazione, a seconda di quale arriva per primo. |

L'**AFK timeout** è un periodo di tolleranza misurato a partire dal momento in cui lo stato è stato impostato. Entro quella finestra, scrivere o inviare un messaggio non cancella lo stato, il che impedisce che il messaggio "afk, brb" stesso termini subito l'AFK. Il valore predefinito è 0, cioè nessun periodo di tolleranza; impostalo con `afktimeout` oppure nella scheda **Impostazioni avanzate** della dashboard.

L'AFK a tempo è diverso: dura finché il suo timer non scade, indipendentemente dal tipo. Parlare nel frattempo non lo termina. Quando il timer scade, lo stato viene cancellato e il nickname ripristinato senza alcun avviso nel canale.

Modificare un messaggio entro cinque minuti dalla pubblicazione conta come inviarne uno nuovo.

## La risposta a una menzione

Quando qualcuno menziona un membro assente, il bot controlla fino a cinque utenti menzionati per messaggio, ignora i bot e le menzioni a se stessi, ignora i messaggi che iniziano con il prefisso dei comandi e salta i canali nell'elenco di quelli disattivati. Per ogni membro assente trovato, pubblica una risposta.

Per impostazione predefinita la risposta è un embed: la riga dell'autore dice "user is currently away" con il suo avatar, la descrizione è il suo messaggio AFK, e il piè di pagina mostra da quanto tempo è assente. Se il bot è configurato per mostrare un pulsante di invito, ne viene allegato uno.

Puoi sostituire questo con un tuo messaggio o embed usando `customafkmessage`, oppure con l'editor **Messaggio AFK personalizzato** nella dashboard. Il testo passa dal parser degli embed, quindi funziona tutto ciò che produce l'embed builder. Impostalo su `-` per tornare a quello predefinito.

### Segnaposto

Questi vengono sostituiti all'interno di un messaggio AFK personalizzato. I segnaposto generali della pagina dei segnaposto non sono disponibili qui; c'è solo questo insieme.

| Segnaposto | Valore |
| --- | --- |
| `%afk.message%` | Il messaggio AFK, con le menzioni neutralizzate e tagliato alla lunghezza massima |
| `%afk.user%` | Il nome utente del membro assente |
| `%afk.user.mention%` | Una menzione del membro assente |
| `%afk.user.avatar%` | URL dell'avatar del membro assente |
| `%afk.user.id%` | ID utente del membro assente |
| `%afk.triggeruser%` | Nome utente di chi lo ha menzionato |
| `%afk.triggeruser.mention%` | Una menzione di chi lo ha menzionato |
| `%afk.triggeruser.avatar%` | URL dell'avatar di chi lo ha menzionato |
| `%afk.triggeruser.id%` | ID utente di chi lo ha menzionato |
| `%afk.time%` | Da quanto tempo è assente, in parole come "2 hours" |

> [!EXAMPLE]
> Una risposta in testo semplice: `%afk.user.mention% is away (%afk.time%): %afk.message%`

## Impostazioni

Tutte queste si trovano nella pagina AFK, nelle schede **Impostazioni di base** e **Impostazioni avanzate**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Auto-deletion time | 0 (mai) | Secondi prima che la risposta del bot a una menzione si elimini da sola |
| Max message length | 128 | Messaggio AFK più lungo che un membro può impostare, da 1 a 4096; quelli più lunghi vengono rifiutati |
| AFK removal type | Self disable | Uno dei quattro tipi sopra |
| AFK timeout | 0 (nessuno) | Periodo di tolleranza dopo aver impostato l'AFK, fino a due ore |
| Disabled channels | nessuno | Canali in cui menzionare un membro assente non riceve risposta |
| Custom AFK embed | embed predefinito | La tua risposta, con i segnaposto sopra |

> [!TIP]
> Imposta l'eliminazione automatica intorno ai trenta secondi. Chi ha menzionato vede la risposta, e il canale non si riempie di avvisi AFK vecchi.

La scheda **Gestione utenti** elenca ogni membro attualmente assente e permette allo staff di cancellare lo stato di una o più persone insieme.

## Guida alla configurazione

1. Apri **Sistema AFK** nella dashboard.
2. Scegli un **AFK removal type**. "On message" è il default più sicuro; "Either" è il più comodo.
3. Imposta **Auto-deletion time** a 30. Lascia **Max message length** a 128 a meno che tu non voglia stati più lunghi.
4. In **Impostazioni avanzate**, aggiungi i canali dei comandi del bot e i canali degli annunci a **Disabled channels**.
5. Facoltativamente, crea una risposta personalizzata nell'editor embed usando i segnaposto sopra.
6. Provalo: esegui `afk testing`, menzionati da un altro account, poi invia un messaggio e guarda lo stato cancellarsi.

## Comandi

Esegui questi comandi con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `afk [message]` | | Nessuno | Imposta il tuo messaggio AFK, oppure attiva e disattiva l'AFK senza messaggio |
| `timedafk <time> <message>` | `tafk` | Nessuno | AFK che termina da solo, per esempio `timedafk 2h dinner` |
| `getactiveafks` | `activeafks` | Nessuno | Elenca tutti quelli attualmente AFK |
| `afkview [@user]` | `viewafk` | Gestisci messaggi | Mostra il messaggio AFK attuale di qualcuno |
| `afkremove @user...` | `afkrm` | Gestisci messaggi | Cancella lo stato di uno o più membri |
| `afkdel [seconds]` | `afkdelete` | Gestisci server | Mostra o imposta l'eliminazione automatica della risposta |
| `afklength <number>` | `maxafklength` | Amministratore | Imposta un limite alla lunghezza del messaggio AFK |
| `afktype <type>` | | Amministratore | `selfdisable`, `onmessage`, `ontype` oppure `either` |
| `afktimeout <time>` | | Amministratore | Imposta il periodo di tolleranza, per esempio `30s` |
| `afkdisable #channel...` | | Gestisci canali | Aggiungi canali alla lista senza risposte |
| `afkundisable #channel...` | | Gestisci canali | Rimuovi canali dalla lista senza risposte |
| `afkdisabledlist` | | Gestisci canali | Mostra la lista senza risposte |
| `customafkmessage <text>` | `afkmessage` | Amministratore | Imposta la risposta personalizzata, oppure `-` per ripristinarla |

## Suggerimenti e insidie

- Non esiste un comando per cancellare solo il proprio stato. Esegui di nuovo `afk` senza messaggio, oppure attendi che la regola del tipo lo cancelli.
- Le modifiche al nickname richiedono che il ruolo del bot sia sopra il ruolo più alto del membro e il permesso Gestisci nickname. Il nickname del proprietario del server non può mai essere cambiato da un bot, quindi i proprietari mantengono il loro nome, ma lo stato funziona comunque.
- Il servizio AFK carica la sua cache poco dopo l'avvio del bot. Fino ad allora i comandi rispondono che l'AFK si sta ancora avviando.
- Le menzioni dentro il messaggio AFK vengono neutralizzate nella risposta, così i membri non possono usare il loro stato per menzionare ruoli o everyone.

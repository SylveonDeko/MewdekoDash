---
title: Suggerimenti
slug: suggestions
summary: Dai ai membri un canale o un pulsante per inviare idee, lascia che il server le voti, e fai in modo che lo staff accetti, rifiuti, consideri o implementi ogni proposta con un motivo.
icon: fa-lightbulb
category: Community
dashboard: /dashboard/suggestions
module: Suggestions
tags: [suggestions, ideas, feedback, voting, accept, deny, consider, implement, threads, suggest button, placeholders, suggerimenti, idee, voti, thread, segnaposto]
related: [administration, afk]
---

## Cosa fa

Un membro esegue `suggest` con la sua idea, scrive direttamente nel canale dei suggerimenti, oppure preme un pulsante **Suggest Here!** e compila un modulo. Il bot elimina il messaggio originale, pubblica nel canale dei suggerimenti un embed numerato e collega le emoji di voto come reazioni o pulsanti. Ogni suggerimento riceve un numero che lo staff usa per riferirsi a esso in seguito.

Lo staff poi fa passare il suggerimento attraverso quattro stati: accettato, rifiutato, considerato o implementato, ognuno con un motivo facoltativo. Il bot modifica il messaggio originale trasformandolo in un embed colorato con lo stato, invia un messaggio privato al membro che ha fatto il suggerimento con l'esito, e può ripubblicare l'embed di stato in un canale separato per ogni stato, così le idee accettate stanno in un posto e quelle rifiutate in un altro.

Facoltativamente, ogni suggerimento può avere un pulsante **Join/Create Discussion** che apre un thread pubblico o privato sotto di esso. Quando lo staff cambia lo stato, il thread può essere archiviato automaticamente.

## Perché usarlo

- Canali di feedback in cui le idee si perdono tra le risposte; ogni suggerimento diventa un messaggio separato con un conteggio dei voti.
- Community che vogliono far vedere ai membri cosa è stato accettato e cosa è stato rifiutato, e perché, senza che lo staff scriva annunci.
- Server che vogliono una discussione per ogni idea invece di discussioni nel canale principale, usando i thread.
- Staff che vogliono smistare dalla dashboard con una casella per il motivo invece di ricordare i numeri dei suggerimenti.

## Come si invia un suggerimento

Ci sono tre modi, e tutti passano dagli stessi controlli di lunghezza e finiscono nel canale dei suggerimenti.

| Metodo | Cosa succede |
| --- | --- |
| `suggest <text>` | Il messaggio del comando viene eliminato e il suggerimento viene pubblicato. Funziona da qualsiasi canale. |
| Scrivere nel canale dei suggerimenti | Ogni messaggio non di un bot che non inizia con il prefisso diventa un suggerimento e l'originale viene eliminato. I membri con il ruolo staff del server vengono esclusi, così lo staff può scrivere normalmente nel canale. |
| Il pulsante suggerimenti | Un messaggio con un pulsante nel **Suggest Button Channel**. Premendolo si apre un modulo i cui limiti di lunghezza corrispondono alle tue impostazioni. |

Se il testo è più lungo di **Maximum Length** o più corto di **Minimum Length**, viene rifiutato. Con il comando, l'errore compare nel canale e viene eliminato dopo cinque secondi; nel canale dei suggerimenti il messaggio viene eliminato e al membro arriva un messaggio privato. Le menzioni nel suggerimento vengono neutralizzate nell'embed pubblicato, e al membro viene confermato che il suggerimento è stato inviato.

L'embed predefinito del suggerimento usa il membro come autore, il titolo "Suggestion #N" e il testo come descrizione. Puoi sostituirlo con un tuo embed (vedi i segnaposto sotto).

### Il pulsante suggerimenti

Il messaggio con il pulsante viene pubblicato nel **Suggest Button Channel**, e il bot lo tiene in fondo: quando altri messaggi lo spingono in su, il bot lo elimina e lo ripubblica. L'etichetta predefinita è **Suggest Here!** senza emoji e con colore blurple. Il messaggio sopra il pulsante può essere testo semplice o codice di embed, e per impostazione predefinita è un breve invito a fare un suggerimento.

## Voto

Per impostazione predefinita ogni suggerimento riceve un pollice in su e un pollice in giù. Puoi impostare fino a cinque emoji personalizzate al loro posto con `suggestmotes` o con il selettore **Reazioni personalizzate**; il bot deve poterle usare.

**Modalità di visualizzazione delle reazioni** decide come si esprime il voto.

| Modalità | Comportamento |
| --- | --- |
| Reazioni (predefinito) | Il bot aggiunge le emoji come reazioni. I conteggi vengono tracciati dalle reazioni aggiunte e rimosse. |
| Pulsanti | Le emoji diventano pulsanti che mostrano un conteggio in tempo reale. Un membro può avere un voto per suggerimento: premere lo stesso pulsante di nuovo chiede di rimuoverlo, premerne uno diverso chiede di cambiarlo. |

In modalità pulsanti ognuno dei cinque pulsanti emoji ha il proprio colore (da **Emote 1 Button** a **Emote 5 Button**). I colori sono Blue, Grey, Green e Red. Cambiare un colore aggiorna anche il messaggio del pulsante suggerimenti.

`suggestinfo <number>` mostra il testo, chi ha fatto il suggerimento, lo stato attuale, chi ha cambiato stato per ultimo, quante volte lo stato è cambiato e il conteggio per ogni emoji, con sotto i pulsanti Accept, Deny, Consider e Implement.

## Stati

Ogni suggerimento parte come Suggested (mostrato come Pending nella dashboard). Lo staff con Gestisci messaggi può spostarlo in uno dei quattro stati con `accept`, `deny`, `consider` o `implemented`, dai pulsanti di `suggestinfo` o dalla dashboard. Ogni cambio di stato con un motivo mostra il motivo; senza, il campo riporta "none".

| Stato | Colore dell'embed | Opzioni extra |
| --- | --- | --- |
| Accepted | Blue | Canale di accettazione, messaggio di accettazione, archivia alla accettazione |
| Denied | Red | Canale di rifiuto, messaggio di rifiuto, archivia al rifiuto |
| Considered | Gold | Canale di considerazione, messaggio di considerazione, archivia alla considerazione |
| Implemented | Green | Canale di implementazione, messaggio di implementazione, archivia all'implementazione |

Quando lo stato cambia, il bot esegue le seguenti operazioni, in quest'ordine:

1. Archivia il thread di discussione se l'interruttore di archiviazione per quello stato è attivo.
2. Modifica il messaggio originale nel canale dei suggerimenti trasformandolo nell'embed di stato e rimuove tutte le reazioni. Se il messaggio originale non esiste più, ne viene pubblicato uno nuovo.
3. Invia al suggeritore un messaggio privato con un embed contenente il suggerimento, il motivo e chi ha fatto la modifica. La conferma allo staff indica se il messaggio privato è stato recapitato oppure se il membro ha i messaggi privati disattivati.
4. Registra il nuovo stato e chi l'ha cambiato.
5. Se per quello stato è impostato un canale, pubblica lì l'embed di stato ed elimina il messaggio di stato precedente per quel suggerimento, così un suggerimento che passa da Considered ad Accepted non lascia una copia obsoleta.

Un suggerimento può passare tra gli stati tutte le volte che vuoi. Non esiste un comando per riportarlo a Pending.

### Il messaggio di stato

L'embed di stato predefinito ha come autore il suggeritore, un titolo come "Suggestion #12 Accepted", il testo del suggerimento come descrizione e un campo **Motivo**. Impostane uno tuo con `acceptmessage`, `denymessage`, `considermessage` o `implementmessage`, oppure con i quattro editor nella scheda **Messaggi** della dashboard. Usa `-` per tornare a quello predefinito. Il testo personalizzato viene passato al parser degli embed; se non è un codice embed valido, viene usato come descrizione dell'embed.

## Segnaposto

Il messaggio del suggerimento (pubblicato all'invio) supporta questi segnaposto, oltre ai segnaposto generali del server dalla pagina dei segnaposto.

| Segnaposto | Valore |
| --- | --- |
| `%suggest.user%` | Nome utente completo di chi ha fatto il suggerimento |
| `%suggest.user.name%` | Il nome utente di chi ha fatto il suggerimento |
| `%suggest.user.avatar%` | URL dell'avatar di chi ha fatto il suggerimento |
| `%suggest.message%` | Il testo del suggerimento, con le menzioni neutralizzate |
| `%suggest.number%` | Il numero del suggerimento |

I messaggi di accettazione, rifiuto, considerazione e implementazione supportano tutti i segnaposto qui sopra, i segnaposto generali del server e questi extra.

| Segnaposto | Valore |
| --- | --- |
| `%suggest.user.id%` | L'ID utente di chi ha fatto il suggerimento |
| `%suggest.mod.user%` | Nome utente completo del membro dello staff che ha cambiato lo stato |
| `%suggest.mod.name%` | Nome utente di quel membro dello staff |
| `%suggest.mod.avatar%` | Il suo URL dell'avatar |
| `%suggest.mod.Id%` | Il suo ID utente (nota la I maiuscola) |
| `%suggest.mod.message%` | Il motivo indicato, oppure "none" |
| `%suggest.emote1count%` fino a `%suggest.emote5count%` | Conteggio dei voti di ogni emoji al momento del cambio |

> [!EXAMPLE]
> Un messaggio di rifiuto semplice: `Suggestion #%suggest.number% by %suggest.user% was denied by %suggest.mod.name%: %suggest.mod.message%`

## Thread

**Tipo di thread** aggiunge una seconda riga di pulsanti a ogni nuovo suggerimento.

| Tipo | Pulsante | Risultato |
| --- | --- | --- |
| No Threads (predefinito) | nessuno | Nessun pulsante di discussione |
| Regular Threads | Join/Create Public Discussion | Crea un thread pubblico chiamato "Suggestion #N Discussion" sul messaggio del suggerimento |
| Private Threads | Join/Create Private Discussion | Lo stesso, come thread privato |

Il primo clic crea il thread e aggiunge sia chi ha fatto il suggerimento sia chi ha cliccato. I clic successivi rispondono che il thread esiste già e ne mostrano il link. Viene tracciato un thread per suggerimento, e i quattro interruttori **Archive on** lo archiviano quando viene impostato lo stato corrispondente. Cambiare il tipo di thread influisce solo sui suggerimenti pubblicati dopo.

## Impostazioni

La pagina della dashboard ha due schede, **Suggerimenti** e **Impostazioni**. La scheda Settings è divisa in **Generali**, **Messaggi**, **Canali**, **Archivia** ed **Reazioni**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Minimum Length | non impostata | Lunghezza minima accettata per un suggerimento, in caratteri (non può essere 2048 o più; il campo della dashboard si ferma a 2000) |
| Maximum Length | non impostata | Lunghezza massima accettata (deve essere superiore a 0; il campo della dashboard si ferma a 2000) |
| Thread Type | No Threads | Se i suggerimenti ricevono un pulsante di discussione pubblico o privato |
| Suggestion message | embed predefinito | L'embed pubblicato quando viene inviato un suggerimento |
| Accept / Deny / Consider / Implement message | embed predefinito | L'embed di stato per ogni stato |
| Suggest Channel | nessuno (funzione disattivata) | Dove vengono pubblicati i suggerimenti e dove i messaggi scritti diventano suggerimenti |
| Accept / Deny / Consider / Implement Channel | nessuno | Canale extra in cui viene copiato ogni embed di stato |
| Archive on Accept / Deny / Consider / Implement | disattivato | Archivia il thread di discussione su quello stato |
| Emote Display Mode | Reactions | Reazioni o pulsanti per il voto |
| Custom Emotes | pollice su e giù | Fino a cinque emoji usate per il voto |
| Button Label | Suggest Here! | Testo sul pulsante suggerimenti |
| Button Emote | nessuna | Emoji sul pulsante suggerimenti |
| Button Message | invito predefinito | Testo o embed pubblicato sopra il pulsante suggerimenti |
| Suggest Button Color | Blurple | Colore del pulsante suggerimenti |
| Emote 1 to 5 Button | Blurple | Colore di ogni pulsante di voto in modalità pulsanti |

> [!WARNING]
> Non funziona nulla finché non imposti **Canale dei suggerimenti**. Fino ad allora `suggest` risponde che non è impostato alcun canale ed elimina l'errore dopo tre secondi.

La scheda **Suggerimenti** elenca ogni suggerimento con il suo stato, i conteggi dei voti e la data, ordinabili per data o stato. Ogni scheda ha i pulsanti **Accetta**, **Nega**, **Valuta** e **Implementa** con una casella facoltativa per il motivo, e un pulsante **Elimina** che rimuove il record dal database senza toccare il messaggio su Discord.

## Procedura di configurazione

1. Apri **Suggerimenti** nella dashboard e passa alla scheda **Impostazioni**.
2. Nella scheda **Canali** scegli un **Canale dei suggerimenti**. Facoltativamente scegli canali separati per i suggerimenti accettati, rifiutati, considerati e implementati.
3. In **Generali** imposta **Minimum Length** e **Maximum Length**, per esempio 10 e 1000, e scegli un **Tipo di thread** se vuoi una discussione per ogni idea.
4. In **Reazioni** scegli **Reazioni** o **Pulsanti** e facoltativamente seleziona fino a cinque **Reazioni personalizzate**. Se vuoi un pulsante suggerimenti, imposta qui etichetta, emoji e messaggio ed esegui `suggestbuttonchannel #channel` su Discord per pubblicarlo.
5. In **Archivia** attiva gli interruttori di archiviazione per gli stati che devono chiudere la discussione.
6. In **Messaggi** personalizza gli embed di stato se vuoi, usando i segnaposto sopra.
7. Salva, poi prova: esegui `suggest test idea`, votalo, ed esegui `accept 1 looks good` per vedere l'embed di stato e il messaggio privato.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `suggest <text>` | `suggestion` | Nessuno | Invia un suggerimento |
| `suggestinfo <number>` | `suginfo` | Gestisci messaggi | Mostra dettagli, conteggi dei voti e pulsanti di stato per un suggerimento |
| `accept <number> [reason]` | `suggestaccept`, `acceptsuggest` | Gestisci messaggi | Segna un suggerimento come accettato |
| `deny <number> [reason]` | `suggestdeny`, `denysuggest` | Gestisci messaggi | Segna un suggerimento come rifiutato |
| `consider <number> [reason]` | `suggestconsider`, `considersuggest` | Gestisci messaggi | Segna un suggerimento come in considerazione |
| `implemented <number> [reason]` | `suggestimplement`, `implementsuggest` | Gestisci messaggi | Segna un suggerimento come implementato |
| `setsuggestchannel [#channel]` | `suggestchannel`, `suggestchan` | Gestisci canali | Imposta il canale dei suggerimenti, o disattiva i suggerimenti senza canale |
| `suggestclear` | `suggestreset`, `resetsuggestions`, `clearsuggestions` | Amministratore | Elimina ogni suggerimento e azzera il contatore, dopo conferma |
| `suggestmessage <text>` | `suggestmsg` | Amministratore | Embed personalizzato del suggerimento, `-` per reimpostare |
| `acceptmessage <text>` | `acceptmsg` | Amministratore | Embed personalizzato di accettazione, `-` per reimpostare |
| `denymessage <text>` | `denymsg` | Amministratore | Embed personalizzato di rifiuto, `-` per reimpostare |
| `considermessage <text>` | `considermsg` | Amministratore | Embed personalizzato di considerazione, `-` per reimpostare |
| `implementmessage <text>` | `implementmsg` | Amministratore | Embed personalizzato di implementazione, `-` per reimpostare |
| `acceptchannel [#channel]` | | Amministratore | Canale per i suggerimenti accettati, nessuno per disattivarlo |
| `denychannel [#channel]` | | Amministratore | Canale per i suggerimenti rifiutati, nessuno per disattivarlo |
| `considerchannel [#channel]` | | Amministratore | Canale per i suggerimenti considerati, nessuno per disattivarlo |
| `implementchannel [#channel]` | | Amministratore | Canale per i suggerimenti implementati, nessuno per disattivarlo |
| `minsuggestionlength <number>` | `minsuggestlength` | Amministratore | Caratteri minimi, deve essere inferiore a 2048 |
| `maxsuggestionlength <number>` | `maxsuggestlength` | Amministratore | Caratteri massimi, deve essere superiore a 0 |
| `suggestmotes <emotes>` | `smotes`, `suggestemotes` | Amministratore | Fino a cinque emoji di voto, oppure `disable` per pollice su e giù |
| `suggestmotesmode <reactions/buttons>` | | Amministratore | Reazioni o pulsanti per il voto |
| `suggestmotecolor <number> <colour>` | | Amministratore | Colore del pulsante di voto da 1 a 5: `blurple`, `grey`, `green` o `red` |
| `suggestthreadstype <none/public/private>` | `suggestthreads` | Amministratore | Tipo di thread di discussione per i nuovi suggerimenti |
| `archiveonaccept` | | Amministratore | Attiva o disattiva l'archiviazione dei thread all'accettazione |
| `archiveondeny` | | Amministratore | Attiva o disattiva l'archiviazione dei thread al rifiuto |
| `archiveonconsider` | | Amministratore | Attiva o disattiva l'archiviazione dei thread alla considerazione |
| `archiveonimplement` | | Amministratore | Attiva o disattiva l'archiviazione dei thread all'implementazione |
| `suggestbuttonchannel <#channel>` | | Amministratore | Pubblica il pulsante suggerimenti in un canale |
| `suggestbuttonmessage <text>` | | Amministratore | Testo o embed sopra il pulsante suggerimenti, `-` per reimpostare |
| `suggestbuttonlabel <text>` | | Amministratore | Etichetta del pulsante fino a 80 caratteri, `-` per reimpostare |
| `suggestbuttonemote [emote]` | | Amministratore | Emoji del pulsante, nessuna per reimpostare |
| `suggestbuttoncolor <colour>` | | Amministratore | Colore del pulsante suggerimenti: `blurple`, `grey`, `green` o `red` |

I comandi slash si trovano sotto `/suggestions` e `/suggestions customize`.

## Suggerimenti e avvertenze

- Il bot ha bisogno di Gestisci messaggi nel canale dei suggerimenti per eliminare gli originali, Aggiungi reazioni per la modalità reazioni, e Crea thread pubblici o privati per le discussioni. I canali di stato richiedono Inserisci link, altrimenti la copia viene saltata senza avvisi.
- Imposta entrambi i limiti di lunghezza prima di aprire il canale. Il percorso dei messaggi scritti elimina tutto ciò che è fuori dai limiti, quindi un massimo non impostato può cancellare ogni messaggio.
- I membri con il ruolo staff impostato in Administration possono chattare nel canale dei suggerimenti senza che i loro messaggi diventino suggerimenti. Tutti gli altri vedono i propri messaggi convertiti ed eliminati.
- Il comando `suggest` rispetta il sistema dei permessi, quindi puoi bloccarlo in alcuni canali o per alcuni ruoli con i normali comandi dei permessi, e anche il percorso dei messaggi scritti rispetta la stessa regola.
- Le emoji personalizzate devono essere utilizzabili dal bot. Il comando verifica ogni emoji reagendo con essa e rifiuta l'insieme se una fallisce.
- **Elimina** nella dashboard rimuove solo il record dal database. Il messaggio su Discord e il thread restano dove sono.
- `suggestclear` non può essere annullato e riporta la numerazione a 1.

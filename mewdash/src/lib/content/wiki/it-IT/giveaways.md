---
title: Giveaway
slug: giveaways
summary: Avvia giveaway a tempo in cui i membri partecipano con reazione, pulsante o captcha web, con requisiti di ruolo e di numero di messaggi, estrazione casuale dei vincitori, reroll e messaggi privati ai vincitori.
icon: fa-gift
category: Entertainment
dashboard: /dashboard/giveaways
module: Giveaways
tags: [giveaway, gstart, prize, raffle, winner, reroll, contest, entry, captcha, premio, lotteria, vincitore, concorso, partecipazione]
related: [embedbuilder, chat-triggers, xp]
---

## Cosa fa

Lo staff avvia un giveaway con un premio, un canale, un numero di vincitori e una durata. Il bot pubblica nel canale un embed che mostra il premio, l'organizzatore, quando finisce e gli eventuali requisiti. I membri partecipano reagendo con l'emote giveaway del server, premendo il pulsante **Partecipa** oppure risolvendo un captcha nella dashboard, a seconda di come è stato avviato il giveaway.

Quando il timer scade, il bot sceglie a caso i vincitori tra tutti coloro che hanno partecipato e soddisfano ancora i requisiti. Modifica il messaggio originale per mostrare i vincitori, pubblica nel canale un messaggio di congratulazioni e, se attivato, invia un messaggio privato a ogni vincitore con un link al giveaway. Lo staff può terminare un giveaway in anticipo oppure rifarne l'estrazione dopo che si è concluso.

I requisiti vengono controllati alla fine, non all'iscrizione. Chi ha reagito ma in seguito ha perso un ruolo richiesto viene saltato quando si scelgono i vincitori.

## Perché usarlo

- Regalare chiavi di gioco, Nitro o merchandising ai membri attivi senza scegliere i nomi a mano.
- Premiare chi ha davvero scritto, richiedendo un numero minimo di messaggi.
- Riservare un premio a chi potenzia il server o a un ruolo sostenitore, richiedendo quei ruoli.
- Impedire che account alt e bot gonfino le partecipazioni usando la partecipazione con captcha.

## Metodi di partecipazione

Ogni giveaway usa esattamente uno di questi. La procedura guidata interattiva `gstart` chiede quale, il comando slash ha le opzioni `use_button` e `use_captcha`, e la dashboard ha una scelta **Metodo di partecipazione**.

| Metodo | Come partecipano i membri | Note |
| --- | --- | --- |
| Reazione | Reagire con l'emote giveaway del server | Il predefinito. Il bot legge l'elenco delle reazioni alla fine del giveaway, fino a 1000 utenti. |
| Pulsante | Premere il pulsante **Enter** sotto l'embed | Le partecipazioni sono memorizzate dal bot. Partecipare due volte, dopo la fine oppure senza essere nel server viene rifiutato. |
| Captcha | Premere **Enter (Web Captcha)**, accedere alla dashboard e superare una verifica Cloudflare Turnstile | Stessa memorizzazione della partecipazione con pulsante. La partecipazione viene attribuita all'account Discord con cui si è effettuato l'accesso. |

L'emote del giveaway si imposta per server con `gemote`. Il bot la verifica reagendo con essa, quindi un'emote personalizzata di un altro server funziona solo se il bot è presente anche in quel server. I giveaway a reazione richiedono anche i permessi del bot Aggiungi reazioni e Usa emoji esterne, e `gstart` si rifiuta di partire senza di essi.

## Requisiti

| Requisito | Impostato da | Effetto al momento dell'estrazione |
| --- | --- | --- |
| Ruoli richiesti | Procedura guidata, slash `required_roles`, dashboard **Ruoli richiesti** | Il membro deve avere tutti i ruoli elencati |
| Numero di messaggi | Procedura guidata, slash `required_messages`, dashboard **Numero di messaggi richiesto** | I messaggi conteggiati del membro in questo server devono essere almeno questo numero. Usa il servizio di conteggio dei messaggi, quindi conosce solo i messaggi contati da quando è stato attivato. |

I bot vengono sempre esclusi, così come chiunque abbia lasciato il server. I requisiti sono elencati nell'embed del giveaway con una riga **Ruoli richiesti** e una riga "N Messaggi richiesti".

## Il messaggio del giveaway

Il titolo dell'embed è il premio. La descrizione dice "React with (emote) to enter!", indica l'organizzatore e mostra la data di fine come timestamp Discord sia relativo sia assoluto. Il piè di pagina mostra il numero di vincitori, il nome del server e la data di fine. Il contenuto del messaggio è la menzione del ruolo da notificare, se ne è impostato uno.

Impostazioni di aspetto valide per tutto il server:

| Impostazione | Comando | Effetto |
| --- | --- | --- |
| Colore dell'embed | `gembedcolor` | Colore dell'embed del giveaway, come nome di colore o `#hex` |
| Banner | `gbanner` | Immagine mostrata in ogni giveaway. La procedura guidata e il comando slash possono sostituirla per ogni giveaway con un URL o un allegato. |
| Ruolo da notificare | nessuno, solo sostituzione dalla procedura guidata | La procedura guidata propone di menzionare un ruolo; se è salvato un ruolo di notifica del server, chiede se sostituirlo |
| Messaggi privati ai vincitori | `gdm` | Se i vincitori ricevono un messaggio privato. Attivo per impostazione predefinita. |

### Quando termina

Se ci sono abbastanza partecipanti idonei, il bot modifica l'embed in "Winner: @user" con l'organizzatore, imposta il piè di pagina su "Ended at (time)", cambia il contenuto in "**Giveaway Ended!**" e pubblica un messaggio separato di congratulazioni che collega il giveaway e mostra il comando di reroll. Se nessuno ha partecipato, oppure se hanno partecipato meno persone idonee del numero di vincitori, l'embed viene sostituito con "There were not enough participants!" e il giveaway viene segnato come concluso. Se hanno partecipato persone ma nessuna soddisfa i requisiti, il messaggio lo dice.

Un giveaway con un solo vincitore attiva anche l'evento `GiveawayWon` per i trigger di chat, così un trigger può reagire a una vittoria.

### Messaggio privato al vincitore

Con **Messaggi privati ai vincitori** attivo, ogni vincitore riceve un messaggio privato. Il predefinito è un embed che dice che ha vinto, con un link al messaggio del giveaway. Se è salvato un messaggio di fine personalizzato, viene inviato al suo posto e può usare questi segnaposto oltre a quelli generali di server, utente e canale.

| Segnaposto | Valore |
| --- | --- |
| `%messagelink%` | Link al messaggio del giveaway |
| `%giveawayitem%` | Il premio |
| `%giveawaywinners%` | Il numero di vincitori |

`gdmmessage` senza testo propone di visualizzare in anteprima il messaggio salvato con valori di esempio, e rifiutare l'anteprima lo cancella. Eseguirlo con del testo cancella anche il messaggio salvato invece di salvarlo.

## Impostazioni

La pagina **Giveaway** della dashboard ha tre schede: **Giveaway attivi**, **Crea giveaway** e **Giveaway terminati**. Le impostazioni valide per tutto il server (emote, colore, banner, interruttore dei messaggi privati) sono disponibili solo tramite comandi.

Il modulo **Crea giveaway**:

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Premio del giveaway | vuoto | Il premio, mostrato come titolo dell'embed |
| Numero di vincitori | 1 | Quanti vincitori estrarre; deve essere almeno 1 |
| Canale | nessuno | Dove viene pubblicato l'embed |
| Durata | 24 ore | Quando termina il giveaway |
| Ruoli richiesti | nessuno | Ruoli che un membro deve avere per vincere |
| Numero di messaggi richiesto | 0 | Numero minimo di messaggi conteggiati |
| Emoji di reazione | il petardo | Emote per la partecipazione con reazione; funziona un'emote personalizzata o un codice emote incollato |
| Metodo di partecipazione | Reazione | Reazione, Pulsante o Captcha |

**Giveaway attivi** elenca ogni giveaway con la sua data di fine. Espandendone uno si vedono vincitori, canale, ruoli richiesti, requisito di messaggi e metodo di partecipazione, più un pulsante **Termina giveaway**. I reroll sono disponibili solo tramite comandi.

## Guida alla configurazione

1. Esegui `gemote` con l'emote che vuoi che i membri usino per reagire, per esempio `gemote :tada:`.
2. Facoltativamente imposta `gembedcolor` e `gbanner` così i giveaway combaciano con l'aspetto del tuo server.
3. Apri **Giveaway** nella dashboard, poi **Crea giveaway**.
4. Compila **Premio del giveaway**, **Numero di vincitori**, **Canale** e **Durata**.
5. Aggiungi **Ruoli richiesti** o un **Numero di messaggi richiesto** se il premio deve andare a membri consolidati.
6. Scegli un **Metodo di partecipazione** e premi **Crea giveaway**.
7. Quando termina, controlla il canale. Se ha vinto la persona sbagliata o non risponde, esegui `greroll <message id>`.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Gli stessi comandi esistono come comandi slash sotto `/giveaways`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `gstart [#channel <time> <winners> <prize>]` | `giveawaystart` | Gestisci messaggi | Avvia un giveaway. Senza argomenti esegue una procedura guidata che chiede anche organizzatore, requisito di messaggi, banner, ruolo da notificare, metodo di partecipazione e ruoli richiesti. Il tempo ha la forma `2d3h`. |
| `gend <message id>` | `giveawayend` | Gestisci messaggi | Termina subito un giveaway ed estrae i vincitori |
| `greroll <message id>` | `giveawayreroll`, `reroll` | Gestisci messaggi | Estrae di nuovo tra i partecipanti di un giveaway terminato |
| `glist` | `giveaways`, `giveawaylist` | Gestisci messaggi | Elenca i giveaway attivi con ID dei messaggi, premi, numero di vincitori e link |
| `gstats` | `giveawaystats` | Nessuno | Totali dei giveaway attivi e terminati, organizzatori e conteggi per canale |
| `gemote <emote>` | `giveawayemote` | Gestisci messaggi | Imposta l'emote di partecipazione con reazione |
| `gembedcolor <colour>` | `giveawayembedcolor` | Gestisci messaggi | Imposta il colore dell'embed del giveaway |
| `gwinembedcolor <colour>` | `giveawaywinembedcolor` | Gestisci messaggi | Imposta lo stesso valore di colore di `gembedcolor` |
| `gbanner <url>` | `giveawaybanner` | Gestisci messaggi | Imposta l'immagine banner predefinita |
| `gdm` | `giveawaydm` | Gestisci messaggi | Attiva o disattiva i messaggi privati ai vincitori |
| `gdmmessage [text]` | `gdmmsg` | Gestisci messaggi | Visualizza in anteprima o cancella il messaggio privato personalizzato per i vincitori |

## Suggerimenti e trappole

- L'ID messaggio per `gend` e `greroll` è l'ID dell'embed del giveaway. Copialo con la Modalità sviluppatore, oppure leggilo da `glist`.
- Il reroll estrae di nuovo tra i partecipanti con gli stessi requisiti, quindi il vincitore precedente può vincere di nuovo.
- Dopo un riavvio il bot pianifica subito i giveaway che terminano nelle prossime 24 ore; quelli che terminano più tardi vengono gestiti da un controllo orario, quindi un giveaway con una durata lunga termina comunque in orario.
- Se il bot non riesce a leggere le reazioni di un giveaway a reazione, ricorre all'emote attuale del server, ma se l'emote è stata cambiata in una che nessuno ha usato, l'estrazione non trova partecipanti.
- L'elenco **Giveaway attivi** della dashboard mostra anche i giveaway terminati, e la scheda **Giveaway terminati** al momento è vuota. Per distinguerli usa la data di fine e l'assenza del pulsante **Termina giveaway**.
- La partecipazione con captcha richiede che la dashboard sia raggiungibile e che il membro acceda con Discord; la partecipazione è legata a quell'account, non a quanto scritto nella pagina.
- I messaggi privati ai vincitori falliscono in silenzio se il vincitore ha i messaggi privati chiusi. L'annuncio nel canale viene comunque pubblicato.

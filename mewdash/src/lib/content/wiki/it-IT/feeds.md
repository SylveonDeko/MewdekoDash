---
title: Feed
slug: feeds
summary: Collega un canale a un feed RSS o Atom e fai pubblicare al bot ogni nuovo elemento, sia come embed predefinito sia in un messaggio che progetti tu.
icon: fa-newspaper
category: Actions
dashboard: /dashboard/feeds
module: Searches
tags: [rss, atom, feed, news, blog, youtube, updates, subscriptions, feedadd, notizie, aggiornamenti, iscrizioni]
related: [embedbuilder, utility]
---

## Cosa fa

Dai al bot un URL di feed e un canale. Da quel momento il bot controlla il feed regolarmente e pubblica ogni elemento uscito dall'ultimo controllo. I membri vedono un nuovo messaggio nel canale ogni volta che il sito pubblica qualcosa, con il titolo dell'elemento, un link e, quando il feed lo fornisce, la descrizione e un'immagine.

Lo staff può iscrivere fino a dieci feed per server e assegnare a ciascuno un messaggio personalizzato. Il messaggio passa dal parser degli embed, quindi un aggiornamento del feed può essere testo semplice, un embed oppure un embed con pulsanti, e può usare segnaposto che recuperano il titolo, il link, l'autore dell'elemento e così via.

Dai membri non viene richiesto nulla. Leggono semplicemente il canale.

## Perché usarlo

- Pubblicare automaticamente il blog, le note di patch o il changelog della tua community in un canale degli annunci.
- Replicare il feed di un sito di notizie o di un subreddit in un canale di discussione.
- Seguire un canale YouTube o un podcast tramite il suo feed RSS.
- Tenere visibile un feed di stato o di rilascio senza che nessuno debba copiare i link a mano.

## Come vengono pubblicati gli aggiornamenti

Il bot scorre ogni URL di feed iscritto, lo scarica e attende circa dieci secondi prima di iniziare il giro successivo. Al primo download dopo l'avvio registra la data dell'elemento più recente e non pubblica nulla. Da quel momento in poi, ogni elemento con una data di pubblicazione più recente dell'ultimo visto viene pubblicato, dal più vecchio al più recente, e la data registrata avanza. Per i feed Atom viene usata la data di aggiornamento dell'elemento quando manca la data di pubblicazione. Gli elementi che non hanno nessuna delle due vengono ignorati.

Non c'è un limite al numero di elementi inviati in un singolo giro, quindi un feed che scarica venti voci con date passate in una volta produrrà venti messaggi.

I feed che non si caricano vengono saltati in silenzio fino al giro successivo. Non vengono rimossi e il bot non segnala il problema.

### Il messaggio predefinito

Se un feed non ha un messaggio personalizzato, il bot invia un embed con:

| Parte | Valore |
| --- | --- |
| Titolo | Il titolo dell'elemento, troncato a 256 caratteri |
| Descrizione | La descrizione dell'elemento con l'HTML rimosso, troncata a 2048 caratteri |
| URL | Il link dell'elemento, così il titolo è cliccabile |
| Immagine | Un allegato immagine del feed, oppure un elemento Atom `preview` o `thumbnail` se presente |
| Piè di pagina | L'URL del feed |

### Messaggi personalizzati e segnaposto

Imposta un messaggio personalizzato con `feedmessage` oppure con il pulsante **Modifica messaggio** della dashboard. Il testo passa dal parser degli embed, quindi funziona tutto ciò che si può fare con il [creatore di embed](/wiki/embedbuilder): testo semplice, JSON di embed oppure entrambi. Le menzioni di ruoli e utenti nella parte di testo semplice notificheranno.

Questi segnaposto vengono sostituiti nel messaggio personalizzato, in aggiunta ai segnaposto generali di server, canale e bot della pagina dei segnaposto.

| Segnaposto | Valore |
| --- | --- |
| `%title%` | Il titolo dell'elemento |
| `%author%` | L'autore dell'elemento, oppure "Unknown" |
| `%content%` | La descrizione dell'elemento con l'HTML rimosso |
| `%url%` | Link all'elemento |
| `%feedurl%` | L'URL del feed stesso |
| `%image_url%` | L'immagine dell'elemento se il feed la fornisce, altrimenti l'immagine del feed |
| `%categories%` | Le categorie dell'elemento, separate da virgole |
| `%timestamp%` | La data di pubblicazione come timestamp di Discord |

> [!EXAMPLE]
> `feedmessage 1 New post: **%title%** by %author%
> %url%`

Imposta il messaggio su `-` per tornare all'embed predefinito.

## Impostazioni

I feed non hanno impostazioni valide per tutto il server. Ogni iscrizione ha un canale e un URL, scelti al momento dell'aggiunta, più un messaggio facoltativo. La pagina della dashboard si chiama **Feed RSS** e ha tre schede.

| Scheda | Cosa mostra |
| --- | --- |
| Feed RSS | Ogni iscrizione con il suo canale, URL e data di aggiunta. **Modifica messaggio** o **Aggiungi messaggio personalizzato** apre una casella di testo; sotto appare un'anteprima del messaggio. **Elimina** rimuove il feed dopo una conferma. |
| Aggiungi feed | Un selettore **Canale** e una casella **URL del feed RSS**, con il pulsante **Aggiungi feed RSS** |
| Statistiche | **Feed totali**, **Feed unici**, **Canali** e una ripartizione **Feed per canale** |

Il canale e l'URL di un feed esistente non possono essere modificati. Rimuovi il feed e aggiungilo di nuovo.

## Guida alla configurazione

1. Apri **Feed** nella dashboard e passa ad **Aggiungi feed**.
2. Scegli il **Canale** a cui devono arrivare gli aggiornamenti.
3. Incolla l'indirizzo del feed in **URL del feed RSS** e premi **Aggiungi feed RSS**. Deve essere un indirizzo completo `http` o `https` che punta a un documento RSS o Atom, non alla home page del sito.
4. Torna su **Feed RSS**, premi **Aggiungi messaggio personalizzato** se vuoi un tuo testo, poi **Salva**.
5. Esegui `feedtest 1` su Discord per pubblicare l'elemento più recente e verificare il risultato. Il numero è la posizione del feed in `feedlist`.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Tutti i comandi dei feed richiedono Gestisci messaggi.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `feedadd <url> [#channel]` | `rss` | Gestisci messaggi | Iscrive un canale a un feed. Per default è il canale attuale. Il bot scarica prima il feed e lo rifiuta se non può leggerlo. |
| `feedlist` | `feeds` | Gestisci messaggi | Elenca le iscrizioni, numerate, dieci per pagina |
| `feedremove <number>` | `feedrm`, `feeddel` | Gestisci messaggi | Rimuove un'iscrizione tramite il suo numero nell'elenco |
| `feedmessage <number> <message>` | `rssmessage` | Gestisci messaggi | Imposta il messaggio personalizzato per un'iscrizione |
| `rsstest <number>` | `feedtest` | Gestisci messaggi | Pubblica l'elemento più recente del feed nel canale attuale |

## Suggerimenti e trappole

- Il limite è di dieci feed per server, e lo stesso URL non può essere aggiunto due volte. `feedadd` segnala un unico errore combinato per un link illeggibile, un duplicato e il limite, quindi controlla `feedlist` se non sei sicuro di quale sia stato.
- Aggiungere un feed dalla dashboard non verifica prima l'URL. Usa `feedtest` dopo per assicurarti che il bot riesca a leggerlo.
- I numeri in `feedremove`, `feedmessage` e `feedtest` provengono da `feedlist`, che ordina i feed in base alla data di aggiunta.
- Il bot ha bisogno di Inviare messaggi e Incorporare link nel canale di destinazione. Senza Incorporare link l'embed predefinito non compare.
- Vengono pubblicati solo gli elementi con una data di pubblicazione (oppure, per Atom, una data di aggiornamento). Un feed le cui voci non hanno date non produrrà mai aggiornamenti.
- Il bot non pubblica nulla al primo giro dopo un riavvio. Parte dall'elemento più recente in quel momento, quindi gli elementi pubblicati mentre il bot era offline non vengono recuperati.
- Poiché un messaggio personalizzato usa il parser degli embed, segui le stesse regole del creatore di embed: JSON valido, oppure testo semplice.

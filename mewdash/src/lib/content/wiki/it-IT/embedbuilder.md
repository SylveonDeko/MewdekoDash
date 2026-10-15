---
title: Embed
slug: embedbuilder
summary: Crea messaggi Discord ricchi con embed, pulsanti e menu di selezione, salvali come modelli, inviali in un canale e riusa lo stesso JSON ovunque il bot accetti un messaggio personalizzato.
icon: fa-link
category: Actions
dashboard: /dashboard/embedbuilder
module: Utility
tags: [embed, embed builder, json, say, template, webhook, persona, buttons, select menu, custom message, embed builder, modello, pulsanti, menu di selezione, messaggio personalizzato]
related: [multigreets, chat-triggers, afk, feeds, giveaways, suggestions]
---

## Cosa fa

L'embed builder è un editor visivo per i messaggi Discord. Compili un titolo, una descrizione, un colore, dei campi, delle immagini e, se vuoi, pulsanti o menu di selezione, guardi l'anteprima dal vivo e alla fine ottieni un blocco di JSON. Quel JSON è il formato universale dei messaggi del bot. Incollalo in `say` per pubblicarlo, salvalo come modello con un nome, oppure inseriscilo in qualsiasi funzionalità che accetti un messaggio personalizzato, come i saluti, i trigger della chat, le risposte AFK, gli aggiornamenti dei feed o il DM al vincitore di un giveaway.

I modelli possono essere personali, visibili solo a te in tutti i server, oppure condivisi con un server, così qualsiasi membro dello staff può caricarli. La dashboard può anche inviare direttamente un messaggio completato in un canale, opzionalmente tramite un webhook con un nome e un avatar personalizzati, chiamato persona.

I membri non interagiscono mai con l'builder. Vedono solo i messaggi che produce.

## Perché usarlo

- Scrivi un post con regole o informazioni con una formattazione corretta e aggiornalo in seguito con `edit`.
- Progetta una volta il messaggio di benvenuto, poi incolla il JSON nei saluti.
- Conserva una serie di modelli per gli annunci così lo staff pubblica aggiornamenti dall'aspetto coerente.
- Aggiungi pulsanti che eseguono trigger della chat, oppure un menu di selezione che assegna ruoli tramite trigger.
- Pubblica come "Server News" con un proprio avatar senza dare a nessuno l'accesso ai webhook.

## Il formato JSON

Il parser cerca la prima `{` nel testo e legge fino alla `}` corrispondente. Se non c'è un oggetto JSON, o se non può essere interpretato, l'intero testo viene trattato come contenuto semplice. I nomi delle proprietà non distinguono maiuscole e minuscole.

| Chiave | Tipo | Significato |
| --- | --- | --- |
| `content` | stringa | Testo semplice mostrato sopra gli embed |
| `embed` | oggetto | Un singolo embed. Se presente, `embeds` viene ignorato. |
| `embeds` | array | Fino a dieci oggetti embed |
| `components` | array | Pulsanti e menu di selezione |

Un oggetto embed accetta `title`, `description`, `url`, `color`, `author` (`name`, `url`, `icon_url`), `footer` (`text`, `icon_url`), `thumbnail` (`url`), `image` (`url`) e `fields` (array di `name`, `value`, `inline`). `color` può essere un numero oppure una stringa come `#5865F2`. I nomi dei campi vengono troncati a 256 caratteri e i valori a 1024. Ogni URL che non sia un indirizzo assoluto completo viene scartato invece di far fallire l'intero messaggio. La chiave `timestamp` è accettata ma non viene mostrata.

Un componente ha `row` (la riga in cui si trova), `displayName` e, a seconda dei casi, `url` per un pulsante link oppure `id` per un pulsante collegato a un trigger della chat. `style` va da 1 a 4 per i quattro stili di pulsante di Discord, ed `emoji` è facoltativo. Imposta `isSelect` a true per un menu di selezione, poi indica `options` (ognuna con `id`, `name`, `description`, `emoji`) e `minOptions` e `maxOptions` tra 0 e 25. Un componente che viola una regola viene mostrato come un pulsante rosso disabilitato la cui etichetta è l'errore, così puoi vedere cosa non va direttamente in Discord.

> [!EXAMPLE]
> `{"content": "Welcome %user.mention%!", "embeds": [{"title": "Read the rules", "description": "See %channel.mention%", "color": "#57F287"}]}`

### Segnaposto

Il pulsante **%** dell'builder inserisce i segnaposto dalla pagina dei segnaposto (utente, server, canale, bot, ora e così via). La dashboard non li sostituisce: un messaggio inviato dalla scheda **Invia** esce con il testo letterale. Il bot li sostituisce quando il JSON passa attraverso un comando o una funzionalità, ad esempio `say`, `embedpreview`, i saluti e i trigger. Ogni funzionalità aggiunge il proprio insieme, come `%afk.message%` o `%giveawayitem%`, oltre a quelli generali.

## Modelli

Un modello è un nome più il JSON. Esistono due ambiti.

| Ambito | Chi lo vede | Creato da |
| --- | --- | --- |
| Personale | Solo tu, in qualsiasi server e nei DM | `embedsave`, oppure **Salva** nella dashboard con la condivisione disattivata |
| Condiviso nel server | Chiunque abbia accesso in quel server | `guildembedsave` (Gestire Messaggi), oppure **Salva** con **Share with everyone in (server)** attivo |

I nomi devono essere unici all'interno di un ambito. `embedpreview <name>` cerca prima il tuo modello personale, poi quello condiviso del server, sostituisce i segnaposto e lo pubblica nel canale corrente.

Alcuni comandi accettano un riferimento a un modello al posto del JSON grezzo: scrivi `{template:name}` oppure `{t:name}` come messaggio. `multigreetmessage` supporta questa funzione. Viene salvato il JSON risolto, non il riferimento, quindi le modifiche successive al modello non aggiornano il saluto.

## La pagina della dashboard

La pagina si intitola **Creatore di embed Discord** e ha sei schede, con un pannello **Anteprima in tempo reale** e uno **Problemi** accanto. **Annulla**, **Ripeti**, **Annulla le modifiche** e **Copia JSON** si trovano nell'intestazione.

| Scheda | Cosa fai lì |
| --- | --- |
| Templates | Scegli da una galleria di punti di partenza oppure **Inizia da zero** |
| Editor | **Contenuto dei messaggi** più fino a dieci embed. Ogni embed ha titolo, descrizione, URL, colore, autore, footer, fino a 25 campi, miniatura e immagine, con contatori di caratteri. |
| Components | Fino a cinque righe e 25 componenti. Aggiungi pulsanti (testo, stile, emoji, URL o trigger) e menu di selezione (segnaposto, opzioni con collegamenti ai trigger). |
| JSON | Il payload grezzo. **Aggiorna dal builder** lo rigenera; **Applica al builder** carica il JSON incollato, sia un payload completo sia un singolo oggetto embed. |
| Saved | **Salva l'embed corrente** con un nome e la casella di condivisione, poi elenchi **Shared in (server)** e **My Embeds** con **Carica** e **Elimina** |
| Send | Scegli un canale, verifica i tuoi permessi lì, facoltativamente invia tramite un webhook come persona oppure con un nome e un URL avatar personalizzati, poi **Invia messaggio** |

### Invio e persona

La scheda **Invia** elenca solo i canali in cui possono scrivere sia tu sia il bot. Inviare embed richiede Inserire Link per entrambi. Se non hai Menzionare Everyone, le menzioni di everyone, here e dei ruoli vengono rimosse e la scheda ti avvisa.

L'invio tramite webhook richiede Gestire Webhook sia per te sia per il bot. Una **persona** è un nome e un avatar salvati, personali oppure condivisi con il server; **Gestisci** apre l'elenco delle persona. Le persona con un'immagine caricata ottengono un proprio webhook in ogni canale, quindi un canale può contenerne al massimo quindici. L'opzione **Personalizzato** richiede invece un nome visualizzato e un link all'avatar. Ogni invio viene registrato nel registro di controllo della dashboard.

Lo stesso builder si apre come finestra popup all'interno di altre pagine della dashboard (saluti, trigger e altre) con solo le schede **Editor**, **Componenti**, **JSON** e **Salvato**.

## Impostazioni

Il builder non ha impostazioni per server. Tutto è per messaggio o per modello.

## Procedura di configurazione

1. Apri **Embed** nella dashboard e scegli un modello oppure **Inizia da zero**.
2. Nell'**Editor**, scrivi il contenuto e compila l'embed. Controlla il pannello **Problemi** per tutto ciò che Discord rifiuterebbe.
3. Aggiungi pulsanti o menu in **Componenti** se ti servono, collegando ciascuno a un trigger della chat o a un URL.
4. Vai su **Salvato**, dagli un nome, spunta **Share with everyone in (server)** se lo staff deve usarlo, e premi **Salva**.
5. Per pubblicarlo subito, apri **Invia**, scegli un canale e premi **Invia messaggio**. Per usarlo altrove, premi **Copia JSON** e incollalo nell'altra funzionalità.
6. In Discord, `embedpreview <name>` pubblica un modello salvato con i segnaposto compilati.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non lo hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `say [#channel] <text or JSON>` | | Gestire Messaggi | Pubblica testo o JSON di embed come bot, sostituendo i segnaposto. Un allegato `.txt` può fornire il messaggio. |
| `edit #channel <message id> <text or JSON>` | | Gestire Messaggi | Sostituisce il contenuto di un messaggio inviato dal bot |
| `embedsave <name> <JSON>` | `esave` | Nessuno | Salva un modello personale |
| `embedlist` | `elist` | Nessuno | Elenca i tuoi modelli personali |
| `embeddelete <name>` | `edel`, `edelete` | Nessuno | Elimina uno dei tuoi modelli personali |
| `guildembedsave <name> <JSON>` | `gesave`, `gembedsave` | Gestire Messaggi | Salva un modello condiviso con questo server |
| `guildembedlist` | `gelist`, `gembedlist` | Nessuno | Elenca i modelli condivisi del server |
| `guildembeddelete <name>` | `gedel`, `gembeddelete` | Gestire Messaggi | Elimina un modello condiviso |
| `embedpreview <name>` | `epreview`, `eprev` | Nessuno | Pubblica un modello salvato nel canale corrente |

## Suggerimenti e insidie

- `say` riflette i tuoi diritti di menzione: senza Menzionare Everyone il bot non menzionerà tutti o i ruoli per tuo conto.
- Un embed con solo un titolo e nient'altro viene comunque inviato, ma la dashboard non ti permette di copiarlo o inviarlo finché non c'è un titolo, una descrizione, un campo o un contenuto.
- I pulsanti collegati a un trigger funzionano solo nel server a cui appartiene l'ID del trigger a cui fanno riferimento. Caricare un modello condiviso in un altro server lascia quei pulsanti non funzionanti.
- Gli URL malformati di immagini, miniature, autori e footer vengono scartati silenziosamente. Se un'immagine manca, verifica che l'URL inizi con `https://`.
- Discord limita un messaggio a dieci embed, 25 campi per embed, cinque righe di componenti e cinque pulsanti per riga. L'builder applica gli stessi limiti.
- Eliminare una persona non rimuove i webhook che ha creato nei canali. Se necessario, ripuliscili nelle impostazioni delle integrazioni del canale.

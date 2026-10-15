---
title: Starboard
slug: starboard
summary: Lascia che i membri votino i messaggi migliori con una reazione, e ripubblica in un canale dedicato ai momenti migliori tutto ciò che raggiunge la soglia.
icon: fa-star
category: Community
dashboard: /dashboard/starboard
module: Starboard
tags: [starboard, stars, highlights, best of, reactions, pins, repost, threshold, stelle, momenti migliori, reazioni, pin, ripubblicazione, soglia]
related: [settings, logging]
---

## Cosa fa

Una starboard è un canale in cui il bot ripubblica i messaggi che hanno ricevuto abbastanza reazioni con una reazione scelta. I membri reagiscono a qualcosa di divertente o utile; quando il numero di reazioni raggiunge la soglia, il bot copia il messaggio nel canale della starboard con il nome dell'autore, il testo, eventuali immagini o video, il conteggio attuale delle reazioni e un pulsante **Vai al messaggio**.

Il post continua ad aggiornarsi man mano che le reazioni arrivano e se ne vanno. Se le reazioni scendono sotto la soglia, il post può essere rimosso. Se il messaggio originale viene eliminato o le sue reazioni vengono cancellate, anche il post può essere rimosso.

Un server può avere più starboard contemporaneamente, ciascuna con il proprio canale, la propria reazione o il proprio insieme di reazioni, la propria soglia e le proprie regole. Una bacheca "migliori meme" che osserva una reazione e una bacheca "risposte utili" che ne osserva un'altra possono funzionare fianco a fianco.

## Perché usarlo

- Dai alla community un modo per far emergere i contenuti migliori senza che lo staff li selezioni.
- Mantieni un canale dei momenti migliori duraturo che i nuovi membri possono scorrere.
- Gestisci bacheche separate per umorismo, arte o risposte utili, ciascuna con reazioni diverse.
- Limita quali canali alimentano la bacheca, così lo spam dei bot e i canali fuori tema restano fuori.

## Più starboard e reazioni

Ogni starboard è identificata da un ID numerico mostrato da `liststarboards` e nell'elenco della dashboard. I comandi prendono quell'ID come primo argomento.

Una starboard inizia con una reazione e ne può avere altre aggiunte. Ognuna delle sue reazioni conta nello stesso totale, e il post mostra un conteggio separato per ogni reazione. Una reazione può appartenere a una sola starboard nel server; provare a riutilizzarla fallisce con "emote already in use". Una starboard deve mantenere almeno una reazione, quindi l'ultima non può essere rimossa.

Le emoji personalizzate funzionano come quelle Unicode. Il bot verifica la reazione reagendo al tuo messaggio di comando, quindi deve essere una che il bot può usare.

## Soglie e conteggio

La **soglia stelle** è il numero di reazioni che un messaggio deve ricevere prima di essere pubblicato. Il valore predefinito dal comando è 1; la dashboard richiede almeno 1.

Durante il conteggio, il bot:

- Ignora le reazioni degli account bot.
- Somma le reazioni di tutte le reazioni che appartengono a quella starboard.
- Conta anche la reazione dell'autore. Non esiste un'esclusione per l'autostella.
- Reagisce solo ai messaggi che hanno testo o un allegato. Un messaggio privo di entrambi viene saltato.

Se il totale è sotto la soglia e il post esiste già, il post viene eliminato quando **Rimuovi sotto la soglia** è attivo. Altrimenti il post resta com'è.

## Messaggi dei bot

Per impostazione predefinita, i messaggi scritti dai bot non vengono mai pubblicati. Attiva **Consenti messaggi dei bot** per includerli. Per un messaggio di un bot, il testo viene preso dalla descrizione del primo embed se ne ha, altrimenti dal contenuto semplice, e l'immagine viene dal primo allegato o dalla prima immagine dell'embed. Quando i messaggi dei bot sono consentiti, anche le reazioni dei bot vengono conteggiate nei numeri per reazione mostrati sul post.

## Soglia di ripubblicazione

Normalmente il bot modifica il post esistente della starboard ogni volta che il conteggio cambia. Quando una bacheca è molto attiva, quel post può trovarsi molto in alto nel canale, dove nessuno vede il conteggio aggiornato.

La **soglia di ripubblicazione** risolve il problema. Impostala a un numero N e, a ogni aggiornamento, il bot controlla gli ultimi N messaggi nel canale della starboard. Se il post esistente è tra questi, viene modificato. Se è finito più indietro, il vecchio post viene eliminato e ne viene inviato uno nuovo in fondo. Impostala a 0 per disattivare la ripubblicazione e modificare sempre sul posto.

## Filtro dei canali

Ogni starboard ha un elenco di canali e una modalità:

| Modalità | Effetto |
| --- | --- |
| Lista bianca (predefinita) | Vengono considerati solo i messaggi nei canali elencati. Un elenco vuoto significa ogni canale. |
| Lista nera | I messaggi nei canali elencati vengono ignorati. Tutto il resto viene considerato. |

`starboardchtoggle <id> #channel` aggiunge o rimuove un canale dall'elenco. L'azione **Gestisci canali** della dashboard fa lo stesso.

## Il post della starboard

Il post è costruito con componenti invece che con un classico embed:

- Una riga sopra il contenitore con ogni reazione e il suo conteggio.
- Il nome dell'autore, collegato al suo profilo.
- Il testo del messaggio.
- Una galleria multimediale degli allegati di immagini e video.
- Fino a tre altri allegati, ricaricati nel canale della starboard. Se un download fallisce, vengono mostrati il nome e la dimensione del file.
- Un pulsante link **Vai al messaggio**.

Le menzioni nel testo ripubblicato vengono soppresse, così un messaggio con stella non può notificare nessuno una seconda volta.

## Regole di rimozione

| Regola | Predefinito | Quando scatta |
| --- | --- | --- |
| Rimuovi all'eliminazione | Attivo | Il messaggio originale viene eliminato. Richiede che il bot abbia il permesso Gestisci messaggi nel canale di origine. |
| Rimuovi alla cancellazione delle reazioni | Attivo | Un moderatore cancella tutte le reazioni dall'originale. |
| Rimuovi sotto la soglia | Attivo | Il totale scende sotto la soglia dopo che una reazione è stata rimossa. |

## Statistiche

`starboardstats` mostra i totali del server: numero di messaggi con stella, stelle totali, il membro più stellato, il canale più attivo e lo stellatore più attivo. `starboarduserstats [@user]` mostra il numero di messaggi con stella di un membro, le stelle ricevute, le stelle date, i suoi post migliori, chi gli mette più stelle e a chi ne mette di più. Entrambi sono aperti a tutti.

## Impostazioni

La pagina Starboard ha due sezioni: **Crea nuova starboard** e **Gestisci starboard**. Ogni voce dell'elenco mostra canale, reazione, soglia e soglia di ripubblicazione, con i pulsanti **Impostazioni starboard**, **Gestisci canali** ed **Elimina**.

Dentro **Impostazioni starboard**:

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Soglia stelle | impostata alla creazione | Reazioni necessarie prima che un messaggio venga pubblicato |
| Soglia di ripubblicazione | 0 (disattivata) | Quanti messaggi recenti cercare prima di ripubblicare in fondo |
| Reazioni stella | la reazione di creazione | Aggiunge o rimuove le reazioni che contano per questa bacheca |
| Consenti messaggi dei bot | Disattivato | Include i messaggi scritti dai bot |
| Rimuovi all'eliminazione | Attivo | Rimuove il post quando l'originale viene eliminato |
| Rimuovi alla cancellazione delle reazioni | Attivo | Rimuove il post quando le reazioni vengono cancellate |
| Rimuovi sotto la soglia | Attivo | Rimuove il post quando il conteggio scende sotto la soglia |
| Modalità canali | Lista bianca | Se l'elenco dei canali è una lista bianca o una lista nera |

> [!TIP]
> Inizia con una soglia da 3 a 5 su un server attivo. Una soglia di 1 trasforma ogni reazione casuale in un post.

## Guida alla configurazione

1. Crea un canale per i momenti migliori e assicurati che il bot possa inviare messaggi, incorporare link e allegare file lì.
2. Apri **Starboard** nella dashboard.
3. In **Crea nuova starboard**, scegli il canale, seleziona una reazione dalle scelte rapide oppure inseriscine una personalizzata, imposta **Soglia (reazioni necessarie)** e premi **Crea starboard**.
4. Apri **Impostazioni starboard** sulla nuova voce. Aggiungi reazioni extra in **Reazioni stella** e imposta una **Soglia di ripubblicazione**, per esempio 20, se la bacheca sarà molto attiva.
5. Usa **Gestisci canali** per mettere in lista bianca i canali che devono alimentare la bacheca, oppure passa **Modalità canali** a lista nera ed elenca quelli da escludere.
6. Reagisci a un messaggio di prova con la reazione abbastanza volte da raggiungere la soglia e controlla che il post compaia.

## Comandi

Usali con il prefisso del tuo server (`.` se non l'hai cambiato). `<id>` è l'ID della starboard mostrato da `liststarboards`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `createstarboard #channel <emote> [threshold]` | `addstarboard`, `newstarboard` | Gestisci canali | Crea una starboard, la soglia predefinita è 1 |
| `deletestarboard <id>` | `removestarboard`, `delstarboard` | Gestisci canali | Rimuove la configurazione di una starboard |
| `liststarboards` | `starboardlist`, `starboards` | Nessuno | Sfoglia ogni starboard e le sue impostazioni |
| `setstarthreshold <id> <number>` | `starthreshold` | Gestisci canali | Imposta le reazioni necessarie |
| `setrepostthreshold <id> <number>` | `starboardrepost`, `repostthreshold` | Gestisci canali | Imposta la finestra di ripubblicazione, 0 la disattiva |
| `addstarboardemote <id> <emote>` | `addstaremote`, `starboardaddemote`, `asbe` | Gestisci canali | Aggiunge una reazione a una starboard |
| `removestarboardemote <id> <emote>` | `removestaremote`, `starboardremoveemote`, `rsbe` | Gestisci canali | Rimuove una reazione; non si può rimuovere l'ultima |
| `starboardallowbots <id> <true or false>` | `starbots`, `starbotsallow`, `starbab` | Gestisci canali | Consente i messaggi scritti dai bot |
| `starboardremoveondelete <id> <true or false>` | `starboarddelete`, `stardelete`, `srod` | Gestisci canali | Rimuove il post quando l'originale viene eliminato |
| `starboardremoveonreactionsclear <id> <true or false>` | `starboardreactionclear`, `starclear` | Gestisci canali | Rimuove il post quando le reazioni vengono cancellate |
| `starboardremoveonbelowthreshold <id> <true or false>` | `starboardbelowthreshold`, `starbelow`, `srobt` | Gestisci canali | Rimuove il post quando scende sotto la soglia |
| `starboardwlmode <id> <whitelist or blacklist>` | `starboardmode`, `starboardwhitelist`, `swm` | Gestisci canali | Imposta come viene trattato l'elenco dei canali |
| `starboardchtoggle <id> #channel` | `starboardchannel`, `togglestarboardchannel`, `scht` | Gestisci canali | Aggiunge o rimuove un canale dall'elenco |
| `starboardstats` | `starstats`, `starboardstatistics`, `sbstats` | Nessuno | Statistiche delle starboard a livello di server |
| `starboarduserstats [@user]` | `staruserstats`, `userstarstats`, `sbuserstats` | Nessuno | Statistiche di un singolo membro |

Gli equivalenti slash si trovano sotto `/starboard`.

## Suggerimenti e insidie

- Il bot non fa nulla in silenzio se non può inviare messaggi nel canale della starboard. Controlla prima i permessi del canale.
- Rimuovi all'eliminazione funziona solo quando il bot ha il permesso Gestisci messaggi nel canale in cui si trovava il messaggio originale.
- Le reazioni dei bot non contano mai verso la soglia, quindi un altro bot che reagisce automaticamente non può spingere messaggi nella bacheca.
- Eliminare una starboard rimuove solo la sua configurazione. I post esistenti nel canale restano.
- La stessa reazione non può essere condivisa tra due bacheche. Scegli reazioni diverse per ciascuna.
- Allegati molto grandi possono non essere ricaricati; in tal caso il post elenca il nome del file.

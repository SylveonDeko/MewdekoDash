---
title: Ruoli stato
slug: statusroles
summary: Assegna o rimuovi automaticamente i ruoli quando lo stato personalizzato di un membro di Discord contiene un testo, e facoltativamente annuncialo in un canale.
icon: fa-user-circle
category: Actions
dashboard: /dashboard/statusroles
module: StatusRoles
tags: [status roles, custom status, vanity, auto role, presence, role automation, status text, ruoli stato, stato personalizzato, invito personalizzato, ruolo automatico, presenza, automazione ruoli, testo dello stato]
related: [administration, afk]
---

## Cosa fa

Lo staff aggiunge uno o più testi da cercare, come `discord.gg/yourserver` o `playing minecraft`. Il bot controlla gli aggiornamenti di presenza. Quando lo stato personalizzato di un membro inizia a contenere quel testo, il bot rimuove i ruoli elencati in **Ruoli da rimuovere**, aggiunge quelli in **Ruoli da aggiungere** e, se sono impostati un canale e un messaggio, vi pubblica una notifica.

Quando il testo scompare di nuovo dallo stato, due interruttori decidono cosa succede. **Rimuovi aggiunti** toglie i ruoli che erano stati dati. **Riaggiungi rimossi** restituisce i ruoli che erano stati tolti. Entrambi sono disattivati per impostazione predefinita, quindi senza modifiche il membro mantiene semplicemente i ruoli che ha alla fine.

Viene controllato solo lo stato personalizzato, cioè il testo che scrivi sotto "Imposta uno stato personalizzato" in Discord. Le attività di gioco, Spotify e streaming vengono ignorate. I membri offline o invisibili vengono saltati, e la corrispondenza è un semplice controllo di sottostringa, quindi `mewdeko` corrisponde a `I love mewdeko` ma distingue maiuscole e minuscole.

Ogni server può contenere un numero qualsiasi di voci di ruolo stato, ciascuna con i propri ruoli, canale e messaggio. I comandi si riferiscono a una voce tramite il suo indice, cioè il numero mostrato da `liststatusroles`.

## Perché usarlo

- Premia i membri che inseriscono il tuo invito personalizzato nel loro stato con un ruolo sostenitore e i suoi vantaggi.
- Assegna un ruolo "streaming" o "cerca partita" mentre qualcuno lo pubblicizza nel proprio stato, e rimuovilo quando smette.
- Annuncia in un canale quando un membro comincia a rappresentare il server, così lo staff può ringraziarlo.
- Scambia un ruolo con un altro mentre uno stato è attivo, per esempio togli un membro dal ruolo "niente menzioni" mentre mostra un certo stato.

## Corrispondenza e modifiche ai ruoli

| Situazione | Cosa fa il bot |
| --- | --- |
| Lo stato acquisisce il testo cercato | Rimuove **Ruoli da rimuovere**, aggiunge **Ruoli da aggiungere**, invia la notifica se configurata |
| Lo stato mantiene il testo cercato | Nulla, la modifica viene elaborata una sola volta |
| Lo stato perde il testo cercato, **Rimuovi aggiunti** attivo | Rimuove i **Ruoli da aggiungere** che il membro possiede ancora |
| Lo stato perde il testo cercato, **Riaggiungi rimossi** attivo | Restituisce i **Ruoli da rimuovere** che il membro non ha più |
| Il membro va offline o invisibile | Nulla, i ruoli restano come sono |

Il bot confronta ogni aggiornamento di presenza con l'ultimo stato memorizzato per quell'utente, quindi un membro che modifica una parte non correlata del proprio stato non viene elaborato di nuovo. Il testo cercato deve essere unico per server; i comandi lo limitano a 128 caratteri, la dashboard no.

## Il messaggio di notifica

Se una voce ha sia un **Canale di notifica** sia un **Messaggio di notifica**, il bot vi pubblica il messaggio ogni volta che lo stato di un membro inizia a corrispondere. Il testo passa attraverso l'analizzatore di embed, quindi funziona tutto ciò che produce il costruttore di embed, incluso il testo semplice, fino a dieci embed e componenti. Non viene pubblicato nulla quando lo stato smette di corrispondere.

### Segnaposto

Il messaggio passa attraverso l'insieme standard di sostituzioni per il membro, il canale di notifica e il server. Quelli più utili sono qui sotto; l'elenco completo si trova nella pagina dei segnaposto, sotto utente, server, canale, bot e tempo.

| Segnaposto | Valore |
| --- | --- |
| `%user.mention%` | Una menzione del membro |
| `%user.name%` | Il nome utente del membro |
| `%user.fullname%` | Nome utente con discriminatore |
| `%user.avatar%` | URL dell'avatar del membro |
| `%user.id%` | L'ID utente del membro |
| `%server.name%` | Nome del server |
| `%server.icon%` | URL dell'icona del server |
| `%channel.mention%` | Menzione del canale di notifica |
| `%server.time%` | Ora attuale nel fuso orario configurato per il server |

> [!NOTE]
> L'editor della dashboard elenca un segnaposto `%status%`, ma il bot non lo sostituisce. Scrivi tu il testo dello stato nel messaggio.

> [!EXAMPLE]
> `%user.mention% is now repping the server in their status, thank you!`

## Impostazioni

Tutto si trova nella pagina Ruoli stato, che ha tre schede: **Ruoli stato**, **Aggiungi nuovo** e **Statistiche**. Ogni voce dell'elenco si espande per mostrare le sue impostazioni.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Testo dello stato da cercare | nessuno | Il testo che uno stato personalizzato deve contenere; nessun limite di lunghezza nella dashboard, 128 caratteri tramite comandi |
| Ruoli da aggiungere | nessuno | ID dei ruoli separati da spazi assegnati quando lo stato corrisponde; Salva sostituisce l'intero elenco |
| Ruoli da rimuovere | nessuno | ID dei ruoli separati da spazi rimossi quando lo stato corrisponde; Salva sostituisce l'intero elenco |
| Canale di notifica | nessuno | Canale che riceve il messaggio di notifica |
| Messaggio di notifica | nessuno | Testo o embed inviato nel canale, con segnaposto |
| Rimuovi aggiunti | disattivato | Ritira i ruoli aggiunti quando lo stato smette di corrispondere |
| Riaggiungi rimossi | disattivato | Restituisce i ruoli rimossi quando lo stato smette di corrispondere |

La scheda **Statistiche** mostra il numero totale di voci, quante cambiano i ruoli e quante hanno un canale di notifica.

## Procedura di configurazione

1. Apri **Ruoli stato** nella dashboard e vai alla scheda **Aggiungi nuovo**.
2. Inserisci il testo da cercare e premi **Aggiungi ruolo stato**.
3. Passa alla scheda **Ruoli stato** ed espandi la nuova voce.
4. Premi **Modifica impostazioni**, incolla gli ID dei ruoli in **Ruoli da aggiungere** e **Ruoli da rimuovere**, scegli un **Canale di notifica** e scrivi un **Messaggio di notifica** se ne vuoi uno, poi **Salva**.
5. Usa i due pulsanti interruttore della voce per attivare **Rimuovi aggiunti** e, se serve, **Riaggiungi rimossi**.
6. Provalo: imposta il tuo stato personalizzato con il testo e verifica che il ruolo compaia; poi cancellalo e verifica che il ruolo venga rimosso.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Ogni comando richiede Gestisci server. L'`<index>` è il numero mostrato da `liststatusroles`, a partire da 1. Le versioni slash si trovano sotto `/statusroles`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `addstatusrole <text>` | `asr` | Gestisci server | Aggiunge un testo di stato da cercare |
| `removestatusrole <index>` | `rsr` | Gestisci server | Elimina una voce |
| `liststatusroles` | `lsr` | Gestisci server | Sfoglia ogni voce con il suo indice e le impostazioni |
| `setaddroles <index> <@role...>` | `sar` | Gestisci server | Aggiunge ruoli all'elenco assegnato quando lo stato corrisponde |
| `setremoveroles <index> <@role...>` | `srr` | Gestisci server | Aggiunge ruoli all'elenco rimosso quando lo stato corrisponde |
| `removeaddroles <index> <@role...>` | `remar` | Gestisci server | Toglie ruoli dall'elenco "ruoli da aggiungere" |
| `removeremoveroles <index> <@role...>` | `rmremoveroles` | Gestisci server | Toglie ruoli dall'elenco "ruoli da rimuovere" |
| `setstatusrolechannel <index> <#channel>` | `statusrolechannel`, `ssrc` | Gestisci server | Imposta il canale di notifica |
| `setstatusroleembed <index> [text]` | `statusroleembed`, `asre` | Gestisci server | Imposta il messaggio di notifica, oppure senza testo mostra un'anteprima di quello attuale |
| `toggleremoveadded <index>` | `togglerma` | Gestisci server | Attiva o disattiva **Rimuovi aggiunti** |
| `togglereaddremoved <index>` | `togglermrm` | Gestisci server | Attiva o disattiva **Riaggiungi rimossi** |

`setaddroles` e `setremoveroles` aggiungono alla lista esistente invece di sostituirla. Usa i comandi `remove...` per togliere di nuovo dei ruoli. L'editor della dashboard funziona al contrario: ciò che c'è nella casella al momento del salvataggio diventa l'elenco completo, ma una casella svuotata viene ignorata, quindi per svuotare del tutto un elenco bisogna usare i comandi `remove...`.

## Suggerimenti e insidie

- Il bot ha bisogno di Gestisci ruoli, e il suo ruolo più alto deve stare sopra ogni ruolo che aggiunge o rimuove. Gli errori vengono solo registrati, il membro non vede nulla.
- Il bot deve avere l'intent delle presenze per vedere gli stati personalizzati. Se non succede nulla quando cambi il tuo stato, è la prima cosa da controllare.
- La corrispondenza distingue maiuscole e minuscole e cerca in qualsiasi punto del testo dello stato. Tieni il testo da cercare breve e distintivo.
- Il bot guarda solo la prima attività nella presenza di un membro. Discord di solito elenca per primo lo stato personalizzato, ma se un'altra attività viene segnalata prima, lo stato non viene visto.
- I ruoli vengono modificati solo quando lo stato cambia. Un membro che ha già il testo nel proprio stato quando crei la voce non viene elaborato finché il suo stato non cambia.
- La notifica viene inviata ogni volta che lo stato inizia a corrispondere, quindi un membro che attiva e disattiva il proprio stato più volte causerà messaggi ripetuti.
- La dashboard usa gli ID dei ruoli, non i nomi. Attiva la Modalità sviluppatore in Discord e fai clic destro su un ruolo per copiarne l'ID.

---
title: Salvataggio chat
slug: chatsaver
summary: Recupera nella dashboard la cronologia recente di un canale, leggila lì e conserva snapshot con nome per dopo, oppure esporta una trascrizione HTML da Discord con un comando.
icon: fa-folder
category: Security
dashboard: /dashboard/chatsaver
module: Utility
tags: [chat saver, chat log, save chat, transcript, export, archive, history, evidence, ticket transcript, salvataggio chat, registro chat, trascrizione, esportazione, archivio, cronologia, prove, trascrizione ticket]
related: [tickets, logging, auditlog]
---

## Cosa fa

Il Salvataggio chat ha due parti. Nella dashboard lo staff sceglie un canale e un intervallo di tempo, e il bot recupera ogni messaggio di quel periodo: testo, autore, allegati ed embed. Possono leggerlo nella pagina e, se vale la pena conservarlo, salvarlo come registro con nome. I registri salvati vivono nel database del bot, quindi sopravvivono anche se i messaggi originali vengono eliminati.

In Discord, `savechat` esegue un'esportazione completa della trascrizione di un canale per gli ultimi minuti, ore o giorni e ti fornisce un link a un file HTML che somiglia a Discord, con i contenuti multimediali.

Anche le trascrizioni dei ticket finiscono qui. Quando un ticket viene chiuso in un server che ha un canale per le trascrizioni dei ticket impostato, il sistema dei ticket memorizza la conversazione come registro salvato chiamato `Ticket #<id> - <channel>`, quindi compare sotto **Log salvati** insieme a tutti gli altri.

## Perché usarlo

- Conservare prove di una discussione o di una violazione delle regole prima che le persone eliminino i propri messaggi.
- Archiviare un canale di un evento o un thread di annunci prima che venga rimosso.
- Rivedere cosa è successo in un canale durante la notte senza scorrere la cronologia in Discord.
- Leggere le vecchie trascrizioni dei ticket in un unico posto.

## Recuperare i messaggi

Nella scheda **Recupera messaggi**, scegli un **Canale**, un **Quantità di tempo** e un **Unità di tempo**, poi clicca **Carica messaggi**. Il bot legge il canale dal più recente al più vecchio e si ferma quando raggiunge messaggi più vecchi della tua finestra oppure quando ha raccolto 5000 messaggi, a seconda di cosa avviene prima. I messaggi vengono mostrati dal più vecchio al più recente nella scheda **Visualizza messaggi**.

| Unità di tempo | Massimo |
| --- | --- |
| Minuti | 4320 |
| Ore | 72 |
| Giorni | 3 |

Tutti e tre i limiti corrispondono alla stessa finestra di tre giorni. Il recupero non salva nulla; chiudi la pagina e tutto scompare.

## Salvare un registro

Con dei messaggi caricati, clicca **Salva log** nella scheda **Visualizza messaggi**. Il registro viene chiamato `<channel> - <today's date>` e memorizzato con il canale, chi lo ha salvato e il numero di messaggi. Ogni registro salvato conserva il testo dei messaggi, il nome e l'avatar dell'autore, il timestamp, i link agli allegati e i titoli, le descrizioni e le miniature degli embed.

I link degli allegati e degli avatar puntano alla CDN di Discord. Se Discord rimuove il file, il link nel registro salvato smette di funzionare, anche se il testo resta.

**Esporta HTML**, accanto a **Salva log**, scarica i messaggi caricati come trascrizione HTML autonoma generata nel tuo browser. Non viene memorizzato nulla sul bot.

## Registri salvati

La scheda **Log salvati** elenca ogni registro del server, dal più recente, con il suo canale e il numero di messaggi. Ogni voce ha **Visualizza log**, **Rinomina log** e **Elimina log**. Rinominare cambia solo l'etichetta. L'eliminazione è permanente e avviene appena clicchi, senza alcuna richiesta di conferma.

Rinomine ed eliminazioni vengono registrate nel registro di audit della dashboard.

## Il comando savechat

`savechat` funziona in modo diverso dalla dashboard. Esegue DiscordChatExporter sull'host del bot, scrive un file HTML con i contenuti multimediali e risponde con un link. Sul bot pubblico Mewdeko ti invia in DM un link `cdn.mewdeko.tech`; su un bot self-hosted pubblica nel canale il percorso locale.

La finestra è limitata a tre giorni. Valori più grandi vengono rifiutati. L'esportazione richiede che la directory di salvataggio chat configurata nel bot esista, altrimenti il comando dà errore.

> [!NOTE]
> Le esportazioni di `savechat` non compaiono sotto **Log salvati**. Sono file sull'host, non voci del database.

## Impostazioni

Il Salvataggio chat non ha configurazione. La pagina della dashboard ha tre schede: **Recupera messaggi**, **Log salvati** e **Visualizza messaggi**.

| Controllo | Predefinito | Cosa controlla |
| --- | --- | --- |
| Channel | nessuno | Il canale di testo da leggere |
| Time Amount | 1 | Quanto indietro recuperare |
| Time Unit | Hours | Minutes, Hours o Days |

## Procedura di configurazione

1. Apri **Salvataggio chat** nella dashboard.
2. Nella scheda **Recupera messaggi**, seleziona il **Canale** e imposta **Quantità di tempo** e **Unità di tempo**, per esempio 6 ore.
3. Clicca **Carica messaggi** e aspetta che compaia il conteggio dei messaggi.
4. Passa alla scheda **Visualizza messaggi** per leggere ciò che è stato recuperato.
5. Clicca **Salva log** per conservarlo. Comparirà in **Log salvati**.
6. Usa **Rinomina log** per dargli un nome significativo, come l'incidente o la data.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `savechat <time> [#channel]` | | Manage Messages | Esporta in HTML l'ultimo `<time>` di un canale, per esempio `savechat 2h #general` |

## Consigli e insidie

- Il bot deve poter leggere il canale e la sua cronologia messaggi. I canali che non vede restituiscono "Channel not found".
- Il recupero si ferma a 5000 messaggi. Per un canale molto attivo, usa una finestra più corta.
- Le modifiche e le eliminazioni di messaggi avvenute prima del recupero non sono visibili; il bot legge ciò che c'è nel canale in quel momento. Usa la funzione di logging per una registrazione in tempo reale.
- I registri salvati memorizzano i nomi degli autori così come erano al momento del salvataggio. Un successivo cambio di nome utente non viene riflesso.
- Chiunque abbia accesso alla dashboard del server può leggere i registri salvati, comprese le trascrizioni dei ticket. Limita di conseguenza l'accesso alla dashboard.
- `savechat` è pensato per la CDN del bot pubblico. Chi self-hosta deve impostare un percorso di salvataggio chat nelle credenziali e copiare i file di DiscordChatExporter accanto al bot.

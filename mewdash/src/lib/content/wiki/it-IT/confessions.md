---
title: Confessioni
slug: confessions
summary: I membri inviano confessioni anonime che il bot pubblica come embed numerati in un canale, con un registro facoltativo visibile solo allo staff che rivela chi ha inviato ciascuna.
icon: fa-comment
category: Community
dashboard: /dashboard/confessions
module: Confessions
tags: [confessions, confess, anonymous, secrets, confession channel, confession log, blacklist, confessioni, confessione, anonimo, segreti, canale confessioni, log confessioni, lista nera]
related: [administration, moderation]
---

## Cosa fa

Un membro esegue `/confess` nel server, oppure invia un DM al bot con `.confess <server id> "text"`, e il bot pubblica il suo messaggio nel canale delle confessioni come embed intitolato "Confessione anonima #N". Il nome di chi ha inviato non compare mai in quel canale. Chi ha inviato riceve una conferma privata, e il numero della confessione aumenta di uno ogni volta.

Lo staff può impostare un canale di log separato. Ogni confessione viene copiata lì con il tag e l'ID di chi l'ha inviata, il numero della confessione e un link diretto al messaggio pubblicato. In ogni piè di pagina della confessione si spiega ai membri come confessarsi, e nella conferma viene detto che possono segnalare un server che abusa della funzione.

Lo staff può anche inserire singoli membri nella lista nera così le loro confessioni vengono rifiutate, ed eliminare le confessioni dalla dashboard, cosa che rimuove anche il messaggio su Discord.

## Perché usarlo

- Canali per sfogarsi o per i "pettegolezzi" in cui i membri vogliono parlare senza un nome associato.
- Canali di complimenti o di apprezzamento che restano anonimi.
- Qualsiasi canale anonimo in cui lo staff ha comunque bisogno di un modo per risalire alle molestie.

## Il post della confessione

Ogni confessione è un embed nel canale delle confessioni:

| Parte | Contenuto |
| --- | --- |
| Riga dell'autore | `Anonymous confession #N` con l'icona del server |
| Descrizione | Il testo della confessione |
| Immagine | L'allegato, se ne è stato inviato uno |
| Piè di pagina | `Do /confess or dm me .confess <server id> yourconfession to send a confession!` |
| Timestamp | Quando è stata pubblicata |

La numerazione inizia da 1 e continua dall'ultima confessione salvata. Eliminare una confessione non rinumera le altre.

Gli allegati sono supportati in entrambi i modi: allega un file a `/confess` con l'opzione `attachment`, oppure allegalo al DM quando usi il comando testuale. Viene usato solo il primo allegato.

## Il canale di log

Quando è impostato un **Canale di log**, ogni confessione produce anche un embed rosso lì, con **Utente** (tag e ID), **Confession N** (il testo), un **Message Link** e un avviso sull'uso improprio. È l'unico posto in cui si rivela chi ha inviato, quindi limitalo alle persone di cui ti fidi.

> [!WARNING]
> Il canale di log esiste perché lo staff possa gestire le molestie. Rivelare chi ha inviato una confessione è motivo per i proprietari del bot di mettere in lista nera il server. I membri possono segnalare gli abusi con `/confessions report`.

## Lista nera

`confessionblacklist` aggiunge un membro alla lista nera del server e `confessionunblacklist` lo rimuove. I membri in lista nera ricevono "you are blacklisted" invece della pubblicazione. Il controllo avviene tramite ID utente.

La dashboard mostra una **Lista nera dei ruoli** e salva gli ID dei ruoli nello stesso elenco. Il bot confronta l'ID utente di chi invia con l'elenco solo quando arriva una confessione, quindi i ruoli selezionati nella dashboard al momento non bloccano nessuno. Usa i comandi per bloccare membri specifici.

## Impostazioni

La pagina **Confessioni** ha tre schede: **Configurazione**, **Confessioni** e **Statistiche**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Canale delle confessioni | nessuno | Dove vengono pubblicate le confessioni anonime; le confessioni sono disattivate finché non viene impostato |
| Canale di log (mostra gli ID utente) | nessuno | Dove va la copia identificativa di ogni confessione |
| Lista nera dei ruoli | nessuno | Vedi la sezione sulla lista nera sopra |

**Confessioni** elenca ogni confessione salvata, dalla più recente, con numero e data. Il contenuto è nascosto finché non lo espandi, e **Elimina confessione** la rimuove dal database ed elimina anche il messaggio su Discord, se esiste ancora.

**Statistiche** mostra **Confessioni totali**, **Questo mese**, **Oggi** e **Ultimo numero**.

## Guida alla configurazione

1. Crea un canale in cui il bot può inviare messaggi e incorporare link, e in cui i membri possono leggere ma idealmente non scrivere.
2. Apri **Confessioni** nella dashboard e scegli quel canale come **Canale delle confessioni**.
3. Facoltativamente, scegli un canale privato per lo staff come **Canale di log**.
4. Clicca **Salva configurazione**.
5. Esegui `/confess` da un account membro e controlla che l'embed compaia con `#1`.
6. Se qualcuno ne abusa, trovalo nel canale di log ed esegui `confessionblacklist @user`.

## Comandi

Usali con il prefisso del tuo server (`.` se non l'hai cambiato). Le versioni slash si trovano sotto `/confessions`, tranne `/confess`, che è al primo livello.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `confess <server id> <"text">` | | Nessuno | Solo in DM. Pubblica una confessione nel server indicato; racchiudi tra virgolette il testo di più parole |
| `confessionchannel [#channel]` | `confesschannel` | Gestisci canali | Imposta il canale delle confessioni, oppure le disattiva senza canale |
| `confessionlogchannel [#channel]` | `confesslogchannel`, `confessionlogchnl` | Amministratore | Imposta il canale di log |
| `confessionblacklist <@user>` | `confessblacklist`, `confessbl` | Gestisci canali | Impedisce a un membro di confessarsi |
| `confessionunblacklist <@user>` | `confessunblacklist`, `confessunbl` | Gestisci canali | Permette di nuovo a un membro in lista nera di confessarsi |

`/confessions report <server id> <description>` invia ai proprietari del bot una segnalazione su un server che abusa delle confessioni. Non ha un equivalente testuale.

## Suggerimenti e insidie

- Il bot deve avere i permessi Invia messaggi e Incorpora link sia nel canale delle confessioni sia nel canale di log. I comandi dei canali avvisano se mancano, ma salvano comunque l'impostazione.
- Il comando testuale `confess` funziona solo in DM e prende la confessione come un unico argomento, quindi `confess 123456789 "I like pineapple on pizza"` funziona, mentre la versione senza virgolette pubblica solo la prima parola. `/confess` nel server è più semplice per i membri.
- `confess` via DM funziona solo per i server che condividi con il bot; gli altri ID server vengono rifiutati.
- Il comando testuale `confessionlogchannel` senza canale cancella il canale delle confessioni invece del canale di log. Per cancellare il canale di log usa la dashboard.
- Le confessioni vengono salvate con l'ID utente di chi le ha inviate anche senza un canale di log, e la dashboard può risalire al mittente di una singola confessione. Considera l'accesso alla dashboard come riservato allo staff.
- Eliminare dalla dashboard rimuove il record salvato, quindi la copia nel canale di log è l'unica traccia rimasta.

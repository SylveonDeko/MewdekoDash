---
title: Minecraft
slug: minecraft
summary: Registra i tuoi server Minecraft, pubblica embed di stato in tempo reale che si aggiornano da soli, ricevi avvisi di server online e offline, esegui comandi RCON e collega chat in gioco, ingressi, morti e progressi a Discord con il plugin companion.
icon: fa-server
category: Entertainment
dashboard: /dashboard/minecraft
module: Minecraft
tags: [minecraft, mc, server status, bridge, rcon, whitelist, chat bridge, java, bedrock, geyser, player lookup, skin, stato server, ponte, lista bianca, ponte chat, ricerca giocatore, skin giocatore]
related: [statchannels, logging, utility]
---

## Cosa fa

Lo staff registra uno o più server Minecraft tramite nome e indirizzo. Qualsiasi membro può poi eseguire `mcstatus` per vedere se il server è attivo, il suo MOTD, la versione, la latenza e chi è online. Un server può anche essere monitorato: il bot pubblica un embed di stato in un canale e lo modifica a intervalli regolari, oppure scrive il numero di giocatori nell'argomento del canale, e annuncia quando il server si spegne o torna online.

Se il server ha RCON attivo, lo staff può inviare comandi della console e gestire la lista bianca da Discord o dalla console della dashboard senza entrare nel gioco.

Il plugin companion facoltativo trasforma il collegamento in un ponte bidirezionale. La chat dei giocatori, gli ingressi, le uscite, le morti e i progressi vengono pubblicati nei canali Discord che scegli, e i messaggi scritti nel canale del ponte vengono trasmessi ai giocatori in gioco.

## Perché usarlo

- Mostrare un embed live di "chi è online" così che i membri sappiano quando vale la pena collegarsi.
- Avvisare la community nel momento in cui il server va in crash o torna dopo una manutenzione.
- Inserire nuovi membri nella lista bianca da Discord senza aprire la console del server.
- Tenere aggiornati i membri che sono solo su Discord con chat in gioco, morti e progressi.
- Cercare l'UUID o il render della skin di un giocatore mentre si gestisce una candidatura o una segnalazione.

## Tipi di server

| Tipo | Porta predefinita | Come viene interrogato |
| --- | --- | --- |
| Java Edition | 25565 | Ping della lista server; il protocollo query viene usato anche quando **Query Port** è impostato e `enable-query=true` |
| Bedrock Edition | 19132 | Ping Bedrock |
| Geyser (Java + Bedrock) | 25565 | Ping Java, segnalato come Geyser |

Ogni server ha un nome salvato in minuscolo, e il primo server che aggiungi diventa quello predefinito usato da `mcstatus` senza argomenti. Gli indirizzi privati, riservati e di loopback vengono rifiutati, a meno che l'host del bot non li abbia consentiti.

## Monitorare un server

Imposta un **Canale di monitoraggio** e il bot interroga il server ogni **Watch Interval** minuti (predefinito 5, minimo 1). Ciò che fa con il risultato dipende dalla **Modalità di monitoraggio**.

| Modalità | Comportamento |
| --- | --- |
| Embed (edit in place) | Pubblica un embed di stato e lo modifica a ogni ciclo; lo ripubblica se il messaggio viene eliminato |
| Channel Topic | Scrive una breve riga di stato nell'argomento del canale, al massimo una volta ogni cinque minuti |
| Both | Fa entrambe le cose sopra |

A ogni ciclo il bot registra anche uno snapshot dello stato online, del numero di giocatori, della latenza e della versione. La scheda **Cronologia** della dashboard mostra questi dati nel tempo.

Quando lo stato online cambia, il bot pubblica un avviso nel canale di monitoraggio: per impostazione predefinita un embed verde "came online" o rosso "went offline", oppure i tuoi modelli **Avviso server online** e **Avviso server offline**.

### Segnaposto di stato

**Embed di monitoraggio personalizzato** e i due modelli di avviso passano dal parser degli embed e supportano questi segnaposto.

| Segnaposto | Valore |
| --- | --- |
| `%mc.server.name%` | Il nome registrato |
| `%mc.server.address%` | Nome host o IP |
| `%mc.server.port%` | Porta |
| `%mc.online%` | `Online` oppure `Offline` |
| `%mc.players.online%` | Numero attuale di giocatori |
| `%mc.players.max%` | Posti disponibili |
| `%mc.player.list%` | Nomi dei giocatori online |
| `%mc.motd%` | Il MOTD senza i codici di formattazione |
| `%mc.version%` | Versione segnalata |
| `%mc.latency%` | Ping, per esempio `42ms` |
| `%mc.favicon%` | URL dell'icona del server |
| `%mc.map%` | Nome del mondo, solo con il protocollo query |
| `%mc.gamemode%` | Modalità di gioco, solo con il protocollo query |
| `%mc.software%` | Software del server, solo con il protocollo query |
| `%mc.plugins%` | Elenco dei plugin, solo con il protocollo query |
| `%mc.query%` | `Yes` se la query estesa ha risposto |
| `%mc.geyser%` | `Yes` se Geyser è stato rilevato |

## RCON e lista bianca

Attiva **Impostazioni RCON** per un server e inserisci **Porta RCON** e **Password RCON** presi da `server.properties`. `mcrcon` invia poi qualsiasi comando della console e restituisce l'output. `mcwhitelist` racchiude i comandi della lista bianca con le azioni `add`, `remove`, `list`, `on`, `off` e `reload`. La dashboard mostra la lista bianca come elenco con pulsanti per aggiungere e rimuovere, e la scheda **Console** offre un prompt dei comandi per i server con RCON attivo.

> [!WARNING]
> RCON dà pieno accesso alla console. Limita `mcrcon` agli amministratori e tratta la password come qualsiasi altra credenziale del server.

## Il ponte del plugin companion

Il ponte richiede il plugin MewdekoMC sul server di gioco: un plugin Paper per Paper 1.21+ oppure una mod NeoForge per la 21.1.x, entrambi su Java 21. Nella dashboard, apri la sezione **Plugin companion** del server e genera una chiave. Copia **API URL** e **Chiave API** nel `config.yml` del plugin (Paper) oppure in `config/mewdeko-server.toml` (NeoForge), poi riavvia oppure esegui `/mewdeko reconnect`. La chiave viene mostrata una sola volta; generane una nuova per sostituirla.

Una volta connesso, il plugin invia gli eventi tramite WebSocket e il bot li instrada ai canali.

| Evento | Va a | Aspetto predefinito |
| --- | --- | --- |
| Ingresso di un giocatore | Canale **Ingresso/Uscita** | Embed verde con nome e avatar del giocatore |
| Uscita di un giocatore | Canale **Ingresso/Uscita** | Embed rosso con nome e avatar del giocatore |
| Chat | Canale **Ponte chat** | `**player**: message` |
| Morte | Canale **Morti** | Embed grigio con il messaggio di morte |
| Progresso | Canale **Progressi** | Embed verde con il nome del progresso |
| Stato del server | Nessun canale; salvato come snapshot nella cronologia con TPS e memoria | |

Qualsiasi canale evento lasciato vuoto ricade sul **Canale di monitoraggio**. I messaggi inviati da utenti non bot nel canale Chat Bridge (o nel canale di monitoraggio se non ne è impostato uno) vengono inoltrati al gioco come `[Discord] user: message` per impostazione predefinita. La configurazione del plugin può disattivare ogni categoria di evento, e lo streaming della console è disattivato per impostazione predefinita e non viene mostrato dal bot.

### Modelli degli eventi del ponte

Ogni evento diretto a Discord può avere un proprio modello in **Modelli di eventi del ponte**. Accettano l'output dell'embed builder, le menzioni vengono neutralizzate e questi segnaposto vengono sostituiti.

| Modello | Segnaposto |
| --- | --- |
| Player Join (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Player Leave (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Chat Message (Discord) | `%mc.player%`, `%mc.message%`, `%mc.avatar%` |
| Death Message (Discord) | `%mc.player%`, `%mc.death.message%`, `%mc.avatar%` |
| Advancement (Discord) | `%mc.player%`, `%mc.advancement%`, `%mc.avatar%` |
| Chat from Discord (In-game format) | `%user%`, `%message%`, `%channel%`; usa i codici colore con il simbolo di sezione di Minecraft |

## Impostazioni

La pagina Minecraft ha una scheda **Server**, una scheda **Aggiungi server**, **Cronologia**, **Console** e una scheda con il nome del server selezionato per modificarlo.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Name | | Identificatore breve usato nei comandi, per esempio `survival` |
| Address | | Nome host o IP |
| Port | 25565 | Porta di gioco; 19132 per Bedrock |
| Type | Java Edition | Java, Bedrock o Geyser |
| Query Port (0 = game port) | 0 | Porta per il protocollo query esteso |
| Watch Channel | nessuno | Canale che riceve l'embed di stato e gli avvisi |
| Watch Interval (minutes) | 5 | Ogni quanto viene interrogato il server |
| Watch Mode | Embed | Embed, Channel Topic oppure Both |
| Custom Watch Embed | embed predefinito | Il tuo embed di stato personalizzato con i segnaposto sopra |
| Server Online Alert | embed predefinito | Pubblicato quando il server torna online |
| Server Offline Alert | embed predefinito | Pubblicato quando il server si spegne |
| Event Channels | canale di monitoraggio | Chat Bridge, Join/Leave, Deaths, Advancements |
| Bridge Event Templates | predefiniti | Modelli per evento elencati sopra |
| RCON Settings | disattivato | Interruttore di attivazione, RCON Port, RCON Password |
| Companion Plugin | nessuna chiave | Genera o revoca la chiave API del plugin e copia l'API URL |

## Guida alla configurazione

1. Apri **Minecraft** nella dashboard e vai su **Aggiungi server**.
2. Inserisci un **Nome**, l'**Indirizzo** e la **Porta**, scegli il **Tipo**, e seleziona un **Canale di monitoraggio** e una **Modalità di monitoraggio**. Salva.
3. Controlla la scheda **Server**: la scheda di stato dovrebbe mostrare il server online entro pochi secondi.
4. Modifica il server per attivare **Impostazioni RCON** se vuoi accesso alla console e alla lista bianca, poi prova la scheda **Console**.
5. Per il ponte delle chat, imposta gli **Event Channels**, genera una chiave in **Plugin companion**, installa il plugin sul server di gioco e incolla URL e chiave nella sua configurazione.
6. Entra nel gioco e scrivi qualcosa: dovrebbe comparire nel canale Chat Bridge, e una risposta lì dovrebbe comparire in gioco.

## Comandi

Esegui questi comandi con il prefisso del tuo server (`.` se non l'hai cambiato). Le versioni slash si trovano sotto `/minecraft`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `mcstatus [name or address]` | `mcs` | Nessuno | Stato del server predefinito, di un server registrato o di qualsiasi `host:port` che digiti |
| `mcadd <name> <address[:port]>` | | Gestisci server | Registra un server; anteponi `bedrock:` all'indirizzo per Bedrock |
| `mcremove <name>` | `mcrm` | Gestisci server | Elimina un server registrato |
| `mclist` | `mcl` | Nessuno | Elenca i server registrati con tipo, indicatore del predefinito e canale di monitoraggio |
| `mcdefault <name>` | `mcdef` | Gestisci server | Scegli il server che `mcstatus` usa per impostazione predefinita |
| `mcwatch <name> [#channel]` | `mcw` | Gestisci server | Avvia la pubblicazione dello stato in un canale, oppure interrompi senza canale |
| `mcwatchmode <name> <embed, channeltopic or both>` | `mcwm` | Gestisci server | Scegli come viene mostrato lo stato nel monitoraggio |
| `mcembed <name> [template]` | `mce` | Gestisci server | Imposta un embed di stato personalizzato, oppure `-` per ripristinarlo |
| `mcplayer <username>` | `mcp` | Nessuno | Mostra UUID, avatar e skin di un giocatore |
| `mcskin <username>` | | Nessuno | Mostra il render della skin di un giocatore |
| `mcrcon <name> <command>` | | Amministratore | Esegui un comando della console tramite RCON |
| `mcwhitelist <name> <action> [player]` | `mcwl` | Gestisci server | `add`, `remove`, `list`, `on`, `off` oppure `reload` |

## Suggerimenti e insidie

- `mcstatus` è limitato a dieci query al minuto per server Discord, condivise tra tutti i membri.
- Le ricerche dirette per indirizzo con `mcstatus play.example.com:25565` funzionano senza registrare il server, ma gli indirizzi privati e locali sono bloccati.
- Il bot ha bisogno del permesso **Gestisci canali** nel canale di monitoraggio per la modalità Channel Topic, e Discord stesso limita le modifiche all'argomento, quindi la modalità argomento non si aggiorna mai più spesso di ogni cinque minuti.
- I dettagli estesi come mappa, modalità di gioco e plugin appaiono solo quando `enable-query=true` è impostato in `server.properties` e la **Query Port** corrisponde.
- Se l'embed di monitoraggio viene eliminato, il ciclo successivo ne pubblica uno nuovo invece di fallire.
- I messaggi del ponte neutralizzano `@everyone`, `@here` e le menzioni degli utenti, così i giocatori non possono menzionare Discord dal gioco.

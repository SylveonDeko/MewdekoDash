---
title: Bot Twitch
slug: twitch
summary: Usa Mewdeko nella chat del tuo canale Twitch con comandi personalizzati, timer, citazioni e contatori, e invia abbonamenti, raid, riscatti dei punti canale e avvii di diretta su Discord.
icon: fa-brands fa-twitch
category: Community
dashboard: /dashboard/twitch
module: Twitch
tags: [twitch, chat bot, streamer, commands, timers, quotes, counters, channel points, redemptions, subs, raids, account link, role sync, eventsub, bot twitch, streamer, comandi, timer, citazioni, contatori, punti canale, riscatti, abbonamenti, raid, collegamento account, sincronizzazione ruoli]
related: [streams, administration]
---

## Cosa fa

Il Bot Twitch collega un canale Twitch al tuo server Discord e permette a Mewdeko di agire come bot di chat dentro quel canale. Gli spettatori scrivono `!ping`, `!quote`, `!counter deaths` oppure i tuoi comandi personalizzati nella chat Twitch, e il bot risponde lì. I timer pubblicano messaggi ripetuti mentre sei in diretta, le citazioni e i contatori sono salvati per server, e i premi dei punti canale possono attivare una risposta in chat o un messaggio su Discord.

Gli eventi del canale tornano su Discord. Quando il canale va in diretta, viene inviato un annuncio di diretta in un canale Discord; abbonamenti, abbonamenti regalati e raid possono ciascuno pubblicare nel proprio canale con un modello personalizzato, e un riepilogo di fine stream può riassumere durata, picco di spettatori, messaggi in chat, abbonamenti e raid.

Gli spettatori possono collegare il proprio account Twitch al proprio account Discord. Una volta collegato, il bot sa quale membro Discord sta scrivendo su Twitch, e la sincronizzazione dei ruoli può assegnare ruoli Discord ad abbonati, VIP, moderatori o al broadcaster.

> [!NOTE]
> Non è la stessa cosa degli Avvisi di diretta. Gli Avvisi di diretta controllano solo i canali pubblici di diverse piattaforme e annunciano quando vanno in diretta. Il Bot Twitch richiede che tu autorizzi il tuo account Twitch e dà al bot una presenza nella tua chat. Se entrambi sono configurati per lo stesso canale Twitch, l'annuncio di diretta del Bot Twitch sostituisce quello degli Avvisi di diretta, così non ottieni duplicati.

## Perché usarlo

- Trasmetti su Twitch e vuoi un solo bot per il tuo Discord e la tua chat Twitch, con gli stessi comandi personalizzati e gli stessi social in entrambi i posti.
- Vuoi che abbonamenti e raid vengano celebrati su Discord nel momento in cui accadono.
- Vuoi ruoli abbonato o VIP su Discord senza assegnarli a mano.
- Vuoi che un premio dei punti canale come "idratati" o "stretching" dica davvero qualcosa in chat e venga registrato su Discord.
- I tuoi moderatori hanno bisogno di un comando shoutout, di un selettore per il raid e di un elenco di citazioni che resti tra una diretta e l'altra.

## Collegamento

Sono coinvolte due autorizzazioni Twitch, entrambe fatte dalla scheda **Configurazione**, sotto-scheda **Collega**.

| Autorizzazione | Chi la fa | Cosa concede |
| --- | --- | --- |
| Account bot | Solo il proprietario del bot | L'account Twitch con cui il bot scrive in chat. Scope `user:read:chat`, `user:write:chat`, `user:bot`. Un'unica identità condivisa per ogni server. |
| Canale del broadcaster | Tu, lo streamer | Accesso agli eventi del tuo canale. Scope `channel:bot`, abbonamenti, bit, riscatti, sondaggi, previsioni, gestione delle trasmissioni, modifica delle clip e moderazione. |

L'integrazione risulta configurata quando esistono un account bot, il tuo canale è autorizzato e la configurazione è attiva. Il pannello **Stato** mostra il trasporto (EventSub WebSocket o IRC legacy), l'ultimo evento ricevuto, la scadenza dei token per entrambi gli account e, sotto **Diagnostica avanzata**, gli scope mancanti e le sottoscrizioni EventSub salvate.

Scollegare il canale elimina la tua autorizzazione e disattiva l'integrazione. L'account bot può essere scollegato solo da un proprietario del bot.

## Comandi di chat su Twitch

Ogni canale collegato riceve questi comandi integrati. Il prefisso predefinito è `!` e può essere cambiato, fino a cinque caratteri. I comandi personalizzati vengono cercati solo quando nessun comando integrato corrisponde al nome.

| Comando | Chi può usarlo | Cosa fa |
| --- | --- | --- |
| `!ping` | Tutti | Risponde con un pong |
| `!uptime` | Tutti | Da quanto tempo è in esecuzione il processo del bot |
| `!commands` | Tutti | Elenca i comandi integrati e i comandi personalizzati attivi |
| `!discord` | Tutti | Mostra quale account Discord è collegato a chi ha scritto |
| `!link` | Tutti | Genera un codice di richiesta a sei cifre per collegare l'account |
| `!rank` | Tutti | Mostra il grado risolto di chi ha scritto |
| `!stream` | Tutti | Stato in diretta, titolo, categoria, spettatori e durata, oppure "offline" |
| `!schedule` | Tutti | Pubblica il messaggio del programma impostato dallo staff |
| `!socials` | Tutti | Pubblica il messaggio dei social impostato dallo staff |
| `!quote [id]` | Tutti | Una citazione casuale, oppure una specifica per numero |
| `!quote add <text> [-- author]` | Mod | Salva una citazione, facoltativamente con un autore dopo `--` |
| `!quote remove <id>` | Mod | Elimina una citazione (funziona anche `delete`) |
| `!counter <name>` | Tutti | Mostra il valore di un contatore |
| `!counter <name> +` | Mod | Aggiunge uno (funzionano anche `++` o `add`); `-`, `--` o `sub` ne tolgono uno; `reset` lo porta a 0; un numero lo imposta direttamente |
| `!so <user>` | Mod | Fa lo shoutout a un altro canale Twitch |
| `!raidtarget` | Mod | Suggerisce un canale casuale dall'elenco dei bersagli di raid |

### Gradi

Il grado di chi scrive deriva dai suoi badge Twitch. Il broadcaster è il più alto, poi Mod, VIP, Subscriber (i badge fondatore contano come abbonato), quindi Everyone. Comandi, comandi personalizzati e sincronizzazione dei ruoli confrontano tutti con questo ordine, quindi un Mod può eseguire qualsiasi cosa impostata per VIP, Subscriber o Everyone.

## Comandi personalizzati

I comandi personalizzati si aggiungono nella dashboard sotto **Comandi**, **Comandi personalizzati**, oppure con `/twitch commands add`. I nomi vengono convertiti in minuscolo, possono avere fino a 32 caratteri e contenere lettere, cifre, trattini e trattini bassi. Ogni comando ha un **Permesso** (Everyone, Subscriber, Vip, Mod, Broadcaster), un valore **Attesa in secondi** da 0 a 86400, un interruttore **Attivo** e una **Risposta**. L'attesa è condivisa dall'intero canale, non per utente. Il numero di utilizzi viene tracciato e mostrato nell'elenco.

La dashboard ha anche un campo **Argomenti di prova** e un'anteprima, così puoi vedere la risposta generata prima di salvare.

### Segnaposto nelle risposte

| Segnaposto | Valore |
| --- | --- |
| `%user%` | Il login Twitch di chi ha scritto |
| `%display%` | Il nome visualizzato di chi ha scritto |
| `%channel%` | Il login del tuo canale Twitch |
| `%args%` | Tutto ciò che viene scritto dopo il nome del comando |
| `%target%` | La prima parola dopo il nome del comando |
| `%discord%` | L'ID utente Discord collegato di chi ha scritto, oppure vuoto |
| `%random:a\|b\|c%` | Un'opzione scelta a caso |
| `%count:name%` | Valore attuale del contatore indicato |
| `%stream%` | Lo stesso riepilogo fornito da `!stream` |

> [!EXAMPLE]
> `!hug` con risposta `%display% hugs %target%! That is hug number %count:hugs%.`

## Timer

I timer pubblicano un messaggio nella chat Twitch secondo una pianificazione. Gestiscili sotto **Comandi**, **Timer**, oppure con `/twitch timers`.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Nome del timer | | Stesse regole di denominazione dei comandi |
| Intervallo in minuti | 10 | Da 1 a 1440 minuti tra un messaggio e l'altro |
| Messaggi minimi in chat | 5 | Messaggi in chat che devono arrivare dall'ultimo invio prima che il timer pubblichi di nuovo; 0 disattiva il controllo |
| Solo in diretta | attivo | Pubblica solo mentre il canale è in diretta |
| Rotazione casuale | disattivata | Sceglie una riga a caso invece di scorrere in ordine |
| Attivo | attivo | Se il timer è in esecuzione |
| Messaggi | | Un messaggio per riga |

Il pianificatore controlla i timer ogni 30 secondi. Le righe dei timer supportano `%channel%`, `%url%`, `%stream%`, `%count:name%` e `%random:a|b|c%`. `/twitch timers test` (oppure il pulsante di prova della dashboard) pubblica subito un timer.

## Citazioni e contatori

Le citazioni sono salvate con il testo, l'autore facoltativo e chi le ha aggiunte. La sotto-scheda **Citazioni** della dashboard permette allo staff di aggiungerle, cercarle e rimuoverle; gli spettatori usano `!quote`. I contatori sono semplici numeri interi con nome che i moderatori incrementano dalla chat; lo staff può impostare i valori con `/twitch commands counter-set` ed elencarli con `counter-list`.

## Eventi su Discord

La scheda **Eventi**, sotto-scheda **Avvisi** contiene le impostazioni per abbonamenti, raid e punti canale. L'annuncio di diretta si trova sotto **Configurazione**, **Impostazioni bot**, **Instradamento eventi**.

### Diretta e offline

Quando il canale va in diretta, il bot pubblica nel **Canale Discord per le dirette**. Senza un **Messaggio di diretta** invia un embed predefinito: il nome dello streamer collegato al canale, il titolo come riga dell'autore, lo stato, il numero di spettatori, la categoria e un'anteprima. Un messaggio personalizzato passa dal creatore di embed, quindi embed completi e componenti funzionano. Quando il canale va offline, nello stesso canale viene pubblicato un breve embed rosso "Offline".

| Segnaposto | Valore |
| --- | --- |
| `%streamer%` | Il nome visualizzato del broadcaster |
| `%title%` | Titolo della diretta |
| `%game%` | Nome della categoria |
| `%url%` | `https://twitch.tv/<channel>` |
| `%viewers%` | Numero attuale di spettatori |

### Abbonamenti e raid

Sono messaggi di testo semplici. Messaggio predefinito per gli abbonamenti: `%display% subscribed to %channel%!`, oppure `%display% received a gifted sub on %channel%!` per i regali. Messaggio predefinito per i raid: `%raider% raided %channel% with %viewers% viewers!`.

| Evento | Segnaposto |
| --- | --- |
| Abbonamento | `%user%`, `%display%`, `%channel%`, `%tier%` |
| Raid | `%raider%`, `%channel%`, `%viewers%` |

Ogni avviso ha un pulsante **Invia test** nella dashboard, e l'elenco **Cronologia eventi** mostra gli eventi recenti e gli invii di prova.

### Azioni sui punti canale

Sotto **Azioni sui punti canale**, associa un **Titolo del premio** (confrontato senza distinzione tra maiuscole e minuscole) a una **Risposta Twitch**, a un **Canale Discord** con un **Messaggio Discord**, oppure a entrambi. Segnaposto: `%user%`, `%display%`, `%channel%`, `%reward%`, `%input%` (ciò che lo spettatore ha scritto) e `%url%`.

### Riepilogo dello stream

`/twitch events recap-channel` imposta un canale che riceve un embed quando lo stream termina: durata, picco di spettatori, messaggi in chat, abbonamenti, raid, e ultimo titolo e categoria. I riepiloghi non sono presenti nella dashboard.

## Collegamento account e sincronizzazione dei ruoli

Ci sono due modi per collegare un membro Discord a un login Twitch:

1. Da solo: lo spettatore scrive `!link` nella chat Twitch, riceve un codice a sei cifre ed esegue `/twitch claim <code>` su Discord entro dieci minuti.
2. Staff: la scheda **Collegamenti account** oppure `/twitch links add @user twitchlogin`.

Un solo login Twitch per membro Discord per server. Una volta collegato, `%discord%` si riempie per quello spettatore e la sincronizzazione dei ruoli si applica.

La sincronizzazione dei ruoli associa un grado Twitch a un ruolo Discord con `/twitch rolesync add`. Ogni volta che uno spettatore collegato scrive un messaggio in chat, il bot aggiunge il ruolo se il suo grado è pari o superiore all'associazione, e lo rimuove se è inferiore. La sincronizzazione dei ruoli è disponibile solo tramite comandi slash.

## Strumenti live

La scheda **Eventi**, sotto-scheda **Strumenti live** espone le azioni dell'operatore di diretta che usano l'autorizzazione del tuo canale: inviare un messaggio in chat come bot, creare un marcatore di diretta, creare una clip, avviare un sondaggio (una scelta per riga, 60 secondi di default), e dare timeout (600 secondi di default), bannare, sbannare o eliminare un messaggio tramite ID. `/twitch stream-info` e `/twitch clip` gestiscono titolo, categoria e clip da Discord.

## Impostazioni

Sotto **Configurazione**, **Impostazioni bot**:

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Prefisso dei comandi | `!` | Prefisso dei comandi di chat Twitch, fino a 5 caratteri |
| Lingua personalizzata | predefinita del server | Tag BCP-47 come `de-DE` usato per le risposte del bot in chat |
| Abilita il bot chat Twitch per questo server | attivo | Interruttore generale; disattivandolo la configurazione viene conservata |
| Usa EventSub per gli eventi della chat | attivo | Riceve chat ed eventi tramite EventSub; se disattivo, i comandi di chat non funzionano |
| Canale Discord per le dirette | nessuno | Dove vanno gli annunci di diretta e di offline |
| Messaggio di diretta | embed predefinito | Modello personalizzato con i segnaposto di diretta |

Sotto **Eventi**, **Avvisi**: **Canale Discord per gli abbonamenti**, **Messaggio abbonamento**, **Canale Discord per i raid**, **Messaggio raid** e l'elenco delle azioni sui punti canale.

## Guida alla configurazione

1. Apri **Bot Twitch** nella dashboard. Un proprietario del bot deve prima aver collegato l'**Account bot**; la sotto-scheda **Collega** mostra se ne esiste uno.
2. Clicca **Collega canale** e autorizza con il tuo account Twitch.
3. In **Impostazioni bot**, imposta il prefisso, attiva **Abilita il bot chat Twitch per questo server**, scegli un **Canale Discord per le dirette** e salva.
4. In **Comandi**, aggiungi un paio di comandi personalizzati e un timer per i social. Usa **Argomenti di prova** e l'anteprima per controllare i segnaposto.
5. In **Eventi**, **Avvisi**, scegli i canali per abbonamenti e raid e premi **Invia test** per ciascuno.
6. Scrivi `!ping` nella tua chat Twitch per confermare che il bot ascolta, poi `!link` e `/twitch claim` per collegare il tuo account.
7. Facoltativamente, esegui `/twitch rolesync add Subscriber @Subs` così gli abbonati collegati ricevono un ruolo.

## Comandi

Questo modulo usa solo comandi slash. Scrivi `/twitch` su Discord per vederli. Le risposte sono visibili solo a te.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `/twitch set <channel> [prefix]` | | Gestisci server | Imposta il canale Twitch e il prefisso, e attiva l'integrazione |
| `/twitch remove` | | Gestisci server | Disattiva l'integrazione ed esce dal canale |
| `/twitch enable` | | Gestisci server | Riattiva l'integrazione |
| `/twitch disable` | | Gestisci server | Disattiva senza eliminare le impostazioni |
| `/twitch config` | | Nessuno | Mostra canale, prefisso, stato di attivazione, canale delle dirette e lingua |
| `/twitch claim <code>` | | Nessuno | Richiede un codice di collegamento da `!link` |
| `/twitch stream-info [title] [category]` | | Gestisci server | Aggiorna il titolo o la categoria della diretta |
| `/twitch clip` | | Gestisci server | Crea una clip della diretta attuale |
| `/twitch status` | | Gestisci server | Riepilogo dello stato: account, token, stato di EventSub |
| `/twitch language <tag>` | | Gestisci server | Lingua per le risposte in chat; vuoto la reimposta |
| `/twitch prefix <prefix>` | | Gestisci server | Cambia il prefisso dei comandi di chat |
| `/twitch commands add <name> <response> [permission] [cooldown]` | | Gestisci server | Aggiungi o aggiorna un comando personalizzato |
| `/twitch commands remove <name>` | | Gestisci server | Elimina un comando personalizzato |
| `/twitch commands list` | | Nessuno | Elenca i comandi personalizzati con permesso, attesa e numero di utilizzi |
| `/twitch commands counter-set <name> <value>` | | Gestisci server | Imposta un contatore |
| `/twitch commands counter-list` | | Nessuno | Elenca i contatori |
| `/twitch commands schedule-set <message>` | | Gestisci server | Imposta la risposta di `!schedule` |
| `/twitch commands schedule-clear` | | Gestisci server | La cancella |
| `/twitch commands socials-set <message>` | | Gestisci server | Imposta la risposta di `!socials` |
| `/twitch commands socials-clear` | | Gestisci server | La cancella |
| `/twitch timers add <name> <messages> [interval] [minchat] [onlineonly] [randomize]` | | Gestisci server | Aggiungi o aggiorna un timer |
| `/twitch timers remove <name>` | | Gestisci server | Elimina un timer |
| `/twitch timers list` | | Nessuno | Elenca i timer |
| `/twitch timers enable <name>` | | Gestisci server | Attiva un timer |
| `/twitch timers disable <name>` | | Gestisci server | Disattiva un timer |
| `/twitch timers test <name>` | | Gestisci server | Pubblica subito un timer |
| `/twitch events golive-channel <channel> [message]` | | Gestisci server | Imposta il canale delle dirette e il modello |
| `/twitch events golive-clear` | | Gestisci server | Cancella il canale delle dirette |
| `/twitch events sub-channel <channel> [message]` | | Gestisci server | Imposta il canale degli abbonamenti e il modello |
| `/twitch events sub-clear` | | Gestisci server | Disattiva i messaggi di abbonamento |
| `/twitch events raid-channel <channel> [message]` | | Gestisci server | Imposta il canale dei raid e il modello |
| `/twitch events raid-clear` | | Gestisci server | Disattiva i messaggi di raid |
| `/twitch events recap-channel <channel>` | | Gestisci server | Imposta il canale dei riepiloghi di diretta |
| `/twitch events recap-clear` | | Gestisci server | Disattiva i riepiloghi |
| `/twitch links add <@user> <twitchlogin>` | | Gestisci server | Collega un membro a un login Twitch |
| `/twitch links remove <@user>` | | Gestisci server | Rimuove il collegamento di un membro |
| `/twitch links list` | | Nessuno | Elenca tutti i collegamenti |
| `/twitch rolesync add <rank> <@role>` | | Gestisci server | Assegna un ruolo agli spettatori collegati di pari grado o superiore |
| `/twitch rolesync remove <rank> <@role>` | | Gestisci server | Rimuove un'associazione |
| `/twitch rolesync list` | | Nessuno | Elenca le associazioni |
| `/twitch redemptions add <reward> [twitchreply] [channel] [discordmessage]` | | Gestisci server | Aggiungi o aggiorna un'azione sui punti canale |
| `/twitch redemptions remove <reward>` | | Gestisci server | Rimuove un'azione |
| `/twitch redemptions list` | | Nessuno | Elenca le azioni |
| `/twitch raidtargets add <twitchlogin> [note]` | | Gestisci server | Aggiunge un canale al pool di `!raidtarget` |
| `/twitch raidtargets remove <twitchlogin>` | | Gestisci server | Rimuove un canale |
| `/twitch raidtargets list` | | Nessuno | Elenca i bersagli di raid |

## Suggerimenti e insidie

- L'account bot è condiviso da tutti i server del bot. Se nessuno ne ha collegato uno, le risposte in chat non possono essere inviate, qualunque cosa tu configuri.
- I comandi di chat funzionano solo mentre **Usa EventSub per gli eventi della chat** è attivo. Se il pannello Stato mostra IRC Legacy, riattivalo.
- Lo stato di diretta viene anche controllato una volta al minuto, quindi un annuncio di diretta può ritardare fino a un minuto rispetto all'inizio reale.
- Le attese dei comandi personalizzati sono per canale, non per spettatore. Un'attesa di 30 secondi significa un utilizzo ogni 30 secondi per tutti.
- La sincronizzazione dei ruoli viene eseguita quando uno spettatore collegato scrive in chat, non secondo una pianificazione. Un abbonato che non scrive mai in chat non riceve mai il ruolo, e un abbonato scaduto lo mantiene finché non scrive di nuovo.
- Le modifiche ai ruoli richiedono che il ruolo del bot sia sopra il ruolo sincronizzato e il permesso Gestisci ruoli.
- I gradi sconosciuti passati a `rolesync` ricadono su Subscriber, e i permessi sconosciuti passati a `commands add` ricadono su Everyone.
- I codici di collegamento scadono dopo dieci minuti, e generarne uno nuovo invalida il precedente.
- Timeout e ban dagli Strumenti live usano gli scope di moderazione del tuo canale, quindi appaiono su Twitch come azioni compiute dall'account autorizzato.
- La lingua personalizzata cambia solo le risposte di chat Twitch. Le risposte su Discord mantengono la lingua del server.

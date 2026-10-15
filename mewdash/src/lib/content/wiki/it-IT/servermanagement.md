---
title: Gestione server
slug: servermanagement
summary: Strumenti di massa per la struttura del tuo server: crea ed elimina canali e ruoli, assegna ruoli a centinaia di membri in un solo lavoro, blocca il server, sincronizza le sovrascritture dei canali, ruba emoji e tieni d'occhio le modifiche pericolose ai ruoli.
icon: fa-server
category: Actions
module: ServerManagement
tags: [server management, roles, mass role, channels, lockdown, slowmode, lock channel, nuke, emotes, steal emotes, webhook, permcontrol, role monitor, role jobs, server icon, server banner, gestione server, ruoli, ruolo di massa, canali, blocco, modalità lenta, blocca canale, emoji, ruba emoji, monitor ruoli, lavori ruolo, icona server, banner server]
related: [administration, permissions, moderation]
---

## Cosa fa

Gestione server raccoglie i comandi che modificano la struttura di un server invece delle persone che ne fanno parte. Lo staff può creare una categoria con tutti i suoi canali in una sola riga, rinominare o eliminare canali, impostare gli argomenti, attivare o disattivare il flag NSFW, impostare la modalità lenta, bloccare un canale oppure eliminarne uno e ricrearlo per cancellarne la cronologia.

I ruoli sono quelli che ricevono più attenzione. I comandi singoli creano, rinominano, cambiano colore, mettono in evidenza ed eliminano ruoli oppure assegnano un ruolo a un solo membro, con un timer opzionale. I comandi di massa aggiungono o rimuovono un ruolo a ogni membro, a ogni persona (esclusi i bot), a ogni bot, a chiunque abbia un altro ruolo oppure a chi è entrato prima o dopo una certa data. Questi vengono eseguiti come lavori in background che puoi elencare e interrompere.

Il modulo gestisce anche l'aspetto del server (icona, banner, splash, nome), la gestione delle emoji (incluso il furto di emoji da altri server), le sovrascritture dei permessi per canale, gli spostamenti nei canali vocali, tre tipi di blocco e un monitor dei ruoli che annulla e sanziona le modifiche pericolose ai ruoli.

Nulla di tutto questo si configura dalla dashboard. Tutto si esegue tramite comandi.

## Perché usarlo

- Stai configurando un nuovo server e vuoi dieci canali sotto una categoria senza cliccare dieci volte nell'interfaccia di Discord.
- Vuoi dare il ruolo "Member" a duemila membri già presenti dopo aver attivato il controllo dei ruoli.
- Vuoi bloccare il server durante un raid così che nessuno possa scrivere, per poi ripristinare esattamente i vecchi permessi.
- Vuoi copiare le emoji dal server di un amico con un solo comando.
- Vuoi impedire a un moderatore di darsi il permesso Amministratore aggiungendo un permesso in lista nera a un ruolo.

## Canali

### Creazione e modifica

`creatxtchanl <name>` e `creatvoichanl <name>` creano un singolo canale testuale o vocale. `deltxtchanl <#channel>` e `delvoichanl <channel>` ne eliminano uno.

La famiglia `cc...` ne crea diversi in una volta sola:

| Comando | Cosa crea |
| --- | --- |
| `ccatc <category name> <channel names...>` | Una nuova categoria e canali testuali al suo interno |
| `ccavc <category name> <channel names...>` | Una nuova categoria e canali vocali al suo interno |
| `cctc <existing category> <channel names...>` | Canali testuali all'interno di una categoria già esistente |
| `ccvc <existing category> <channel names...>` | Canali vocali all'interno di una categoria già esistente |

`renamechannel <channel> <name>` rinomina qualsiasi canale, `setchanlname <name>` rinomina quello in cui ti trovi, `settopic [text]` imposta o cancella l'argomento del canale corrente, e `nsfwtoggle` inverte il flag NSFW del canale corrente.

### Modalità lenta, blocco e nuke

`slowmode` da solo alterna il canale corrente tra un minuto e disattivato. `slowmode <time>`, per esempio `slowmode 30s`, imposta un intervallo specifico, e entrambe le forme accettano un argomento canale. Qualsiasi valore pari o superiore a 21600 secondi (sei ore) viene rifiutato.

`lock [#channel]` aggiunge un divieto di Invia messaggi per il ruolo `@everyone` su quel canale; `unlock [#channel]` lo rimuove. I bit di sovrascrittura esistenti vengono mantenuti.

`nuke [#channel]` chiede conferma, elimina il canale e ne crea uno nuovo con lo stesso nome, posizione, argomento, sovrascritture dei permessi, flag NSFW, categoria e modalità lenta. Fissaggi, webhook e cronologia dei messaggi vanno persi per sempre.

### Sovrascritture dei permessi

`permcontrol <channel> <allow|deny|inherit> <role or user> <permissions...>` modifica la sovrascrittura di un singolo destinatario su un canale senza toccare gli altri bit. `permview [@user or role]` elenca i permessi che tu, un membro o un ruolo avete attualmente.

`syncroletoall <role>` copia la sovrascrittura del ruolo dal canale corrente a ogni canale testuale e categoria. `syncroletoallchannels` e `syncroletoallcategories` agiscono solo sui canali oppure solo sulle categorie. Il ruolo deve già avere una sovrascrittura nel canale da cui esegui il comando.

### Webhook

`createwebhook <#channel> <name> [avatar url]` crea un webhook. Se non fornisci un URL, un'immagine allegata viene usata come avatar. Il bot conferma nel canale e ti invia l'URL e il token del webhook in messaggio privato.

## Vocale

- `moveto <voice channel>` sposta te.
- `moveuserto @user <voice channel>` sposta un'altra persona.
- `grab @user` porta qualcuno nel canale vocale in cui ti trovi.

## Blocco

`lockdown [type] [action] [override]` e `liftlockdown [type]` richiedono il permesso Amministratore.

| Tipo | Cosa fa |
| --- | --- |
| `Joins` | Chiunque entri mentre è attivo viene espulso o bannato. L'azione predefinita è `Ban`; `Kick` è l'unica altra opzione. |
| `Readonly` | Il bot salva la sovrascrittura `@everyone` attuale di ogni canale, poi nega Invia messaggi, la creazione di thread e le risposte nei thread nei canali testuali, e Connetti e Parla nei canali vocali. I canali forum mantengono Invia messaggi così che i thread esistenti restino leggibili. |
| `Full` | Entrambi i casi sopra. |

Prima di applicare un blocco in sola lettura, il bot verifica di poter modificare ogni canale. Se ne mancano alcuni, li elenca e si ferma, a meno che tu non passi `true` come terzo argomento per continuare comunque. Rimuovere il blocco ripristina le sovrascritture salvate. I blocchi di tipo Joins sopravvivono a un riavvio del bot.

`unlockdown` è uno strumento separato e più vecchio: riattiva Invia messaggi per il ruolo `@everyone` stesso, per i server che sono stati bloccati modificando quel ruolo.

> [!WARNING]
> `lockdown` senza argomenti è un blocco in sola lettura, e `lockdown joins` banna chi entra per impostazione predefinita. Passa `kick` se è quello che vuoi.

## Ruoli

### Comandi per un singolo ruolo

| Comando | Cosa fa |
| --- | --- |
| `createrole [name]` | Crea un ruolo, non menzionabile |
| `deleterole <role>` | Elimina un ruolo inferiore al tuo ruolo più alto |
| `renamerole <role> <name>` | Rinomina un ruolo |
| `rolecolor <role> [colour]` | Mostra il colore del ruolo oppure lo imposta |
| `rolehoist <role>` | Attiva o disattiva la visualizzazione separata del ruolo nell'elenco membri |
| `setrole <role> @user [time]` | Assegna un ruolo, con rimozione facoltativa dopo `time`, per esempio `2h` |
| `removerole <role> @user` | Toglie un ruolo |
| `removeallroles @user` | Rimuove a un membro ogni ruolo non gestito |

Gli argomenti ruolo e membro possono essere forniti in qualsiasi ordine per `setrole` e `removerole`.

### Più ruoli o membri insieme

- `createroles <names...>` crea un ruolo per ogni parola dopo aver confermato l'elenco.
- `deleteroles <roles...>` elimina più ruoli dopo conferma; i ruoli gestiti vengono saltati.
- `setroles @user <roles...>` assegna più ruoli a un membro; `setroles @user <time> <roles...>` li rende a tempo.
- `removeroles @user <roles...>` rimuove più ruoli da un membro.
- `adduserstorole <role> @user @user...` e `removeusersfromrole <role> @user @user...` lavorano su più membri.

### Lavori di ruolo di massa

Questi scorrono l'intero elenco dei membri ed eseguono come lavori in background. A causa dei limiti di frequenza di Discord, il bot fa una breve pausa per ogni membro e consente solo cinque lavori alla volta per server. Ogni lavoro indica quanto tempo prevede di impiegare.

| Comando | Chi è interessato |
| --- | --- |
| `addtoall <role>` | Ogni membro che non ha il ruolo |
| `addtoallusers <role>` | Solo persone |
| `addtoallbots <role>` | Solo bot |
| `addtousersover <time> <role>` | Membri entrati almeno `time` fa, per esempio `30d` |
| `addtousersunder <time> <role>` | Membri entrati più di recente di `time` |
| `addroletorole <role> <role2>` | Assegna `role` a tutti quelli che hanno `role2` |
| `addthenremove <role> <role2>` | Assegna `role` a tutti quelli che hanno `role2`, poi rimuove `role2` |
| `removefromall <role>` | Tutti quelli che hanno il ruolo |
| `removefromallusers <role>` | Solo persone |
| `removefromallbots <role>` | Solo bot |
| `removefromrole <role> <role2>` | Rimuove `role` da tutti quelli che hanno `role2` |

`rolejobs` elenca i lavori in esecuzione con tipo, chi li ha avviati, avanzamento e ruoli. `stopjob <number>` annulla un lavoro e riporta fino a che punto è arrivato.

### Esportazione e importazione

`exportrolelist` invia un file `rolelist.txt` con una riga `roleId,userId,roleName` per ogni appartenenza, per ogni ruolo che il bot può gestire. `importrolelist` legge un file allegato al comando e riapplica i ruoli; passa `true` per creare i ruoli in base al nome quando gli ID non esistono più. `addroletolist <role>` legge un elenco allegato di ID utente e assegna loro il ruolo.

## Aspetto del server ed emoji

`seticon <url>`, `setbanner <url>`, `setsplash <url>` e `setservername <name>` modificano il server stesso e richiedono il permesso Amministratore. `setguildavatar`, `setguildbanner` e `setguildbio` modificano solo come appare il bot in questo server e richiedono il permesso Gestisci server.

I comandi per le emoji richiedono il permesso Gestisci espressioni sia per te sia per il bot:

- `addemote <name> [url]` carica un'emoji da un URL o da un'immagine allegata.
- `removeemote <emote>` e `renameemote <emote> <name>` agiscono su emoji di questo server.
- `stealemotes <emotes...>` copia in questo server ogni emoji personalizzata presente nel tuo messaggio. `sfr <role> <emotes...>` fa lo stesso ma limita le emoji a un solo ruolo.
- Fare clic destro su un messaggio e scegliere **Steal Emotes** o **Steal Sticker** dal menu App fa lo stesso senza doverlo digitare.

## Monitor dei ruoli

Il monitor dei ruoli controlla il registro di controllo. Quando a un membro viene assegnato un ruolo in lista nera, oppure a un ruolo viene aggiunto un permesso in lista nera, il bot annulla la modifica e sanziona chi l'ha effettuata. Solo il proprietario del server può configurarlo.

- `addblacklistedrole <role> [punishment]` e `removeblacklistedrole <role>`.
- `addblacklistedpermission <permission> [punishment]` e `removeblacklistedpermission <permission>`, per esempio `addblacklistedpermission Administrator Ban`.
- `setdefaultpunishment <punishment>` imposta cosa succede quando una voce in lista nera non ha una sanzione propria. Il valore predefinito è `None`.
- `addwhitelisteduser @user`, `addwhitelistedrole <role>` e i rispettivi `remove...` esentano lo staff dal monitor. Le modifiche effettuate da o verso persone in lista bianca vengono ignorate.
- `listblacklists` mostra tutto quanto sopra.

I valori delle sanzioni sono `None`, `Warn`, `Mute`, `ChatMute`, `VoiceMute`, `Timeout`, `Kick`, `Softban`, `Ban`, `RemoveRoles`, `AddRole` e `Delete`. Quando vengono aggiunti più permessi in lista nera insieme, vince la sanzione più grave.

## Impostazioni

Non esiste una pagina nella dashboard. Le uniche impostazioni salvate riguardano il monitor dei ruoli e lo stato del blocco.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Sanzione predefinita | None | Applicata quando un ruolo o un permesso in lista nera non ha una sanzione impostata |
| Ruoli in lista nera | nessuno | Ruoli che vengono rimossi quando assegnati, con una sanzione facoltativa per ciascuno |
| Permessi in lista nera | nessuno | Permessi annullati quando aggiunti a un ruolo, con una sanzione facoltativa per ciascuno |
| Utenti e ruoli in lista bianca | nessuno | Esentati dal monitor |
| Azione del blocco Joins | Ban | Cosa succede ai membri che entrano durante un blocco Joins |

## Guida alla configurazione

1. Verifica che il ruolo del bot sia sopra ogni ruolo che vuoi che gestisca, e che abbia Gestisci ruoli e Gestisci canali.
2. Crea la struttura: `ccatc Community general off-topic memes` crea la categoria e tre canali.
3. Crea i ruoli in un colpo solo: `createroles Member Regular Veteran`.
4. Assegna il ruolo base: `addtoallusers Member`, poi controllalo con `rolejobs`.
5. Come proprietario del server, proteggi il server: `addblacklistedpermission Administrator Ban` e `addwhitelistedrole Admin`.
6. Tieni a mente `lockdown full kick` per le emergenze e prova `liftlockdown full` in seguito in un giorno tranquillo.

## Comandi

Esegui questi comandi con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `permview [@user or role]` | `pview` | Nessuno | Elenca i permessi concessi |
| `setsplash <url>` | `setserversplash`, `setsplashimage` | Amministratore | Imposta lo splash dell'invito |
| `seticon <url>` | `setservericon`, `seticonimage` | Amministratore | Imposta l'icona del server |
| `setbanner <url>` | `setserverbanner` | Amministratore | Imposta il banner del server |
| `setservername <name>` | | Amministratore | Rinomina il server |
| `setguildavatar [url]` | `sgav`, `setgav` | Gestisci server | Avatar del bot in questo server |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Gestisci server | Banner del bot in questo server |
| `setguildbio <text>` | `sgbio`, `setgbio` | Gestisci server | Bio del bot in questo server |
| `addemote <name> [url]` | `emoteadd`, `ae`, `ea` | Gestisci espressioni | Carica un'emoji |
| `removeemote <emote>` | `deleteemote`, `emoteremove`, `emotedelete` | Gestisci espressioni | Elimina un'emoji |
| `renameemote <emote> <name>` | `emoterename` | Gestisci espressioni | Rinomina un'emoji |
| `stealemotes <emotes...>` | `steal` | Gestisci espressioni | Copia emoji in questo server |
| `sfr <role> <emotes...>` | | Gestisci espressioni | Copia emoji, limitate a un ruolo |
| `creatxtchanl <name>` | `ctch` | Gestisci canali | Crea un canale testuale |
| `creatvoichanl <name>` | `cvch` | Gestisci canali | Crea un canale vocale |
| `deltxtchanl <#channel>` | `dtch` | Gestisci canali | Elimina un canale testuale |
| `delvoichanl <channel>` | `dvch` | Gestisci canali | Elimina un canale vocale |
| `ccatc <category> <names...>` | | Gestisci canali | Nuova categoria con canali testuali |
| `ccavc <category> <names...>` | | Gestisci canali | Nuova categoria con canali vocali |
| `cctc <category> <names...>` | | Gestisci canali | Canali testuali in una categoria esistente |
| `ccvc <category> <names...>` | | Gestisci canali | Canali vocali in una categoria esistente |
| `renamechannel <channel> <name>` | `channelrename` | Gestisci canali | Rinomina un canale |
| `setchanlname <name>` | `schn` | Gestisci canali | Rinomina il canale corrente |
| `settopic [text]` | `st` | Gestisci canali | Imposta o cancella l'argomento corrente |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Gestisci canali | Attiva o disattiva il flag NSFW |
| `slowmode [time] [#channel]` | | Gestisci canali | Attiva o imposta la modalità lenta |
| `lock [#channel]` | `channellock`, `lockchannel` | Gestisci messaggi | Nega Invia messaggi a tutti |
| `unlock [#channel]` | `channelunlock`, `unlockchannel` | Gestisci messaggi | Annulla `lock` |
| `nuke [#channel]` | `channelnuke`, `nukechannel` | Gestisci canali | Elimina e ricrea un canale |
| `permcontrol <channel> <allow|deny|inherit> <role or user> <perms...>` | `permc` | Gestisci canali | Modifica una sovrascrittura del canale |
| `syncroletoall <role>` | `synctoall` | Gestisci canali | Copia una sovrascrittura su tutti i canali e le categorie |
| `syncroletoallchannels <role>` | `srtch`, `srtach` | Gestisci canali | Copia una sovrascrittura sui canali testuali |
| `syncroletoallcategories <role>` | `srtc`, `srtac` | Gestisci canali | Copia una sovrascrittura sulle categorie |
| `createwebhook <#channel> <name> [avatar]` | `cwh` | Amministratore | Crea un webhook |
| `moveto <voice channel>` | | Nessuno | Sposta te stesso |
| `moveuserto @user <voice channel>` | `moveuto` | Gestisci canali | Sposta qualcuno |
| `grab @user` | `getoverhere` | Nessuno | Porta qualcuno nel tuo canale vocale |
| `lockdown [joins|readonly|full] [kick|ban] [true]` | `lockdownserver` | Amministratore | Avvia un blocco |
| `liftlockdown [type]` | `unlockserver` | Amministratore | Termina un blocco |
| `unlockdown` | `endlockdown` | Gestisci canali | Riattiva Invia messaggi su `@everyone` |
| `createrole [name]` | `cr` | Gestisci ruoli | Crea un ruolo |
| `deleterole <role>` | `dr` | Gestisci ruoli | Elimina un ruolo |
| `renamerole <role> <name>` | `renr` | Gestisci ruoli | Rinomina un ruolo |
| `rolecolor <role> [colour]` | `roleclr` | Gestisci ruoli per impostare | Mostra o imposta il colore di un ruolo |
| `rolehoist <role>` | `rh` | Gestisci ruoli | Attiva o disattiva la visualizzazione separata |
| `setrole <role> @user [time]` | `sr`, `giverole` | Gestisci ruoli | Assegna un ruolo, facoltativamente a tempo |
| `removerole <role> @user` | `rr` | Gestisci ruoli | Rimuove un ruolo |
| `removeallroles @user` | `rar` | Gestisci ruoli | Rimuove tutti i ruoli |
| `createroles <names...>` | `croles`, `crs` | Gestisci ruoli | Crea più ruoli |
| `deleteroles <roles...>` | `drs` | Gestisci ruoli | Elimina più ruoli |
| `setroles @user [time] <roles...>` | `srs` | Gestisci ruoli | Assegna più ruoli |
| `removeroles @user <roles...>` | `rrs` | Gestisci ruoli | Rimuove più ruoli |
| `adduserstorole <role> @users...` | `autr` | Gestisci ruoli | Assegna un ruolo a più membri |
| `removeusersfromrole <role> @users...` | `rufr` | Gestisci ruoli | Rimuove un ruolo da più membri |
| `addtoall <role>` | `ata` | Gestisci ruoli | Ruolo a ogni membro |
| `addtoallusers <role>` | `atau` | Gestisci ruoli | Ruolo a ogni persona |
| `addtoallbots <role>` | `atab` | Gestisci ruoli | Ruolo a ogni bot |
| `addtousersover <time> <role>` | `atuo` | Gestisci ruoli | Ruolo ai membri entrati almeno da quel tempo |
| `addtousersunder <time> <role>` | `atuu` | Gestisci ruoli | Ruolo ai membri entrati più di recente |
| `addroletorole <role> <role2>` | `artr` | Gestisci ruoli | Ruolo a chiunque abbia un altro ruolo |
| `addthenremove <role> <role2>` | `atr` | Gestisci ruoli | Scambia un ruolo con un altro |
| `removefromall <role>` | `rfa` | Gestisci ruoli | Rimuove da ogni membro |
| `removefromallusers <role>` | `rfau` | Gestisci ruoli | Rimuove da ogni persona |
| `removefromallbots <role>` | `rfab` | Gestisci ruoli | Rimuove da ogni bot |
| `removefromrole <role> <role2>` | `rfr` | Gestisci ruoli | Rimuove da chiunque abbia un altro ruolo |
| `rolejobs` | `rj` | Gestisci ruoli | Elenca i lavori di ruolo di massa in corso |
| `stopjob <number>` | `sj` | Gestisci ruoli | Annulla un lavoro |
| `exportrolelist` | `exportroles`, `erl` | Gestisci ruoli | Scarica le appartenenze ai ruoli |
| `importrolelist [true]` | `importroles`, `irl` | Gestisci ruoli | Riapplica un elenco esportato |
| `addroletolist <role>` | `artl` | Gestisci ruoli | Assegna un ruolo a un elenco allegato di ID utente |
| `setdefaultpunishment <action>` | `sdp`, `defaultpunishment`, `setdefpunishment` | Proprietario del server | Sanzione predefinita del monitor dei ruoli |
| `addblacklistedrole <role> [action]` | `abr`, `blacklistrole`, `addbrole` | Proprietario del server | Tieni d'occhio un ruolo |
| `removeblacklistedrole <role>` | `rbr`, `unblacklistrole`, `removebrole` | Proprietario del server | Smetti di tenere d'occhio un ruolo |
| `addblacklistedpermission <permission> [action]` | `abp`, `blacklistpermission`, `addbpermission` | Proprietario del server | Tieni d'occhio un permesso |
| `removeblacklistedpermission <permission>` | `rbp`, `unblacklistpermission`, `removebpermission` | Proprietario del server | Smetti di tenere d'occhio un permesso |
| `addwhitelisteduser @user` | `awu`, `whitelistuser`, `addwuser` | Proprietario del server | Esenta un membro |
| `removewhitelisteduser @user` | `rwu`, `unwhitelistuser`, `removewuser` | Proprietario del server | Rimuove un'esenzione |
| `addwhitelistedrole <role>` | `awr`, `whitelistrole`, `addwrole` | Proprietario del server | Esenta un ruolo |
| `removewhitelistedrole <role>` | `rwr`, `unwhitelistrole`, `removewrole` | Proprietario del server | Rimuove un'esenzione |
| `listblacklists` | `lbl`, `blacklists`, `listbws` | Proprietario del server | Mostra le liste del monitor |

## Suggerimenti e insidie

- I comandi per i ruoli controllano la gerarchia due volte: il tuo ruolo più alto e il ruolo più alto del bot devono entrambi essere sopra il ruolo in questione. Il proprietario del server salta il controllo dalla propria parte.
- I lavori di massa richiedono circa un secondo per membro. Aggiungere un ruolo a cinquemila membri richiede ben più di un'ora, e il bot rifiuta un sesto lavoro simultaneo.
- `syncroletoall` e le sue varianti richiedono che il ruolo abbia già una sovrascrittura nel canale in cui le esegui; è quella sovrascrittura che viene copiata.
- `nuke` non può essere annullato e la richiesta di conferma è l'unica protezione.
- Il blocco in sola lettura modifica le sovrascritture su ogni canale, il che significa molte chiamate API sui server grandi. Rimuovilo con `liftlockdown`, non a mano, così le sovrascritture salvate vengono ripristinate.
- Il monitor dei ruoli si basa sul registro di controllo, quindi il bot ha bisogno del permesso Visualizza log audit, oltre al permesso necessario per la sanzione che scegli.
- Il furto di emoji richiede slot emoji liberi; gli errori sono elencati in "Errored Emotes".

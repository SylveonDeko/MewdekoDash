---
title: Canali statistiche
slug: statchannels
summary: Canali vocali i cui nomi si aggiornano da soli per mostrare numeri in tempo reale, come il numero di membri, i boost, i ticket aperti o il numero di spettatori su Twitch.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/statchannels
module: StatChannels
tags: [stat channels, counter, member count, live stats, voice channel stats, countdown, member goal, boost count, twitch viewers, canali statistiche, contatore, numero di membri, statistiche in tempo reale, statistiche canale vocale, conto alla rovescia, obiettivo membri, numero di boost, spettatori twitch]
related: [counting, twitch, suggestions, xp, afk, starboard]
---

## Cosa fa

Un canale statistiche è un canale vocale bloccato che si trova in cima alla lista dei canali e mostra un numero nel suo nome, per esempio "Members: 12,480". Il bot riscrive il nome a intervalli regolari così che il numero resti aggiornato. I membri non possono entrare nel canale; esiste solo per essere letto.

Scegli un tipo di contatore, un modello per il nome, uno stile per il numero e la frequenza di aggiornamento. Il bot supporta diverse decine di contatori che coprono dati del server, presenza, boost Nitro, slot emoji, obiettivi di membri e conti alla rovescia, oltre a valori presi da altre funzioni di Mewdeko come ticket, suggerimenti, giveaway, XP, conteggio, starboard e server Twitch o Minecraft collegati.

Discord consente di rinominare un canale solo due volte ogni dieci minuti. I canali statistiche aggirano questo limite con una scelta di meccanismo di aggiornamento, incluso uno che elimina e ricrea il canale così da poterlo aggiornare ogni minuto.

## Perché usarlo

- Mostrare in cima al server il numero di membri, di persone e di bot.
- Tenere traccia dei progressi verso un obiettivo di membri con una percentuale o una barra di avanzamento.
- Fare il conto alla rovescia per un evento, un lancio o un anniversario.
- Mostrare lo stato live di Twitch e il numero di spettatori per il server di uno streamer.
- Dare allo staff una visione in tempo reale dei ticket aperti o dei suggerimenti in attesa senza aprire una dashboard.
- Mostrare stato e numero di giocatori del server Minecraft accanto al link di invito.

## Tipi di contatore

Il catalogo completo qui sotto è quello che elencano `statchanneltypes` e la sezione **Contatori disponibili** della dashboard. Ogni tipo accetta i segnaposto comuni; alcuni ne aggiungono di propri. I modelli predefiniti iniziano con un'emoji corrispondente seguita dal testo mostrato.

### Membri

| Tipo | Mostra | Modello predefinito | Segnaposto aggiuntivi |
| --- | --- | --- | --- |
| `TotalMembers` | Ogni membro, bot inclusi | `Members: %count%` | |
| `HumanMembers` | I membri che non sono bot | `Humans: %count%` | |
| `BotCount` | Account bot | `Bots: %count%` | |
| `OnlineMembers` | Membri con una presenza diversa da offline | `Online: %count%` | |
| `IdleMembers` | Membri impostati come inattivi | `Idle: %count%` | |
| `DndMembers` | Membri impostati come non disturbare | `DND: %count%` | |
| `StreamingMembers` | Membri con un'attività di streaming | `Streaming: %count%` | |
| `InVoiceMembers` | Membri connessi a un canale vocale | `In Voice: %count%` | |
| `RoleMembers` | Membri che hanno un ruolo scelto | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.color%` |
| `NewestMember` | Il membro entrato più di recente | `Newest: %member.name%` | `%member.name%`, `%member.id%` |
| `MembersJoinedToday` | Entrati nelle ultime 24 ore | `Joined Today: %count%` | |
| `MembersJoinedWeek` | Entrati negli ultimi 7 giorni | `This Week: %count%` | |
| `MemberGoal` | Progresso verso un numero obiettivo di membri | `%count% / %goal%` | `%goal%`, `%goal.raw%`, `%goal.percent%`, `%goal.remaining%`, `%goal.bar%` |
| `AfkCount` | Membri attualmente AFK tramite Mewdeko | `AFK: %count%` | |

### Server

| Tipo | Mostra | Modello predefinito | Segnaposto aggiuntivi |
| --- | --- | --- | --- |
| `Countdown` | Tempo che manca a una data obiettivo | `%days%d %hours%h left` | `%days%`, `%hours%`, `%minutes%`, `%total.hours%` |
| `ChannelCount` | Ogni canale | `Channels: %count%` | |
| `TextChannelCount` | Canali testuali | `Text: %count%` | |
| `VoiceChannelCount` | Canali vocali | `Voice: %count%` | |
| `CategoryCount` | Categorie | `Categories: %count%` | |
| `StageChannelCount` | Canali palco | `Stages: %count%` | |
| `ForumChannelCount` | Canali forum | `Forums: %count%` | |
| `ThreadCount` | Thread attualmente in cache come attivi | `Threads: %count%` | |
| `RoleCount` | Ruoli | `Roles: %count%` | |
| `BoostCount` | Boost Nitro attivi | `Boosts: %count%` | |
| `BoostLevel` | Livello dei boost, da 0 a 3 | `Level %count%` | |
| `NextBoostGoal` | Boost ancora necessari per il livello successivo | `%count% to Tier %tier.next%` | `%tier.next%`, `%tier.current%` |
| `EmojiCount` | Tutte le emoji personalizzate | `Emojis: %count%` | |
| `AnimatedEmojiCount` | Emoji personalizzate animate | `Animated: %count%` | |
| `StaticEmojiCount` | Emoji personalizzate statiche | `Static: %count%` | |
| `StickerCount` | Sticker personalizzati | `Stickers: %count%` | |
| `EmojiSlotsUsed` | Slot emoji usati rispetto al limite del livello | `Slots: %count%/%slots.max%` | `%slots.max%`, `%slots.free%` |
| `ServerAge` | Giorni dalla creazione del server | `Age: %count% days` | `%years%`, `%created%` |
| `EventCount` | Eventi programmati | `Events: %count%` | |
| `BotUptime` | Da quanto tempo Mewdeko è in funzione | `Uptime: %days%d %hours%h` | `%days%`, `%hours%`, `%minutes%` |
| `InviteCount` | Inviti tracciati dal tracciamento inviti | `Invites: %count%` | |

### Twitch

Questi leggono dal canale Twitch collegato tramite il modulo Twitch.

| Tipo | Mostra | Modello predefinito | Segnaposto aggiuntivi |
| --- | --- | --- | --- |
| `TwitchLiveStatus` | Se il canale è in diretta | `%twitch.name%: %status%` | `%status%`, `%twitch.name%` |
| `TwitchViewers` | Spettatori attuali | `Viewers: %count%` | `%twitch.name%` |
| `TwitchGame` | Categoria in streaming | `%game%` | `%game%`, `%title%`, `%twitch.name%` |
| `TwitchUptime` | Da quanto tempo lo stream è in diretta | `Live %hours%h %minutes%m` | `%hours%`, `%minutes%` |
| `TwitchFollowers` | Totale dei follower | `Followers: %count%` | `%twitch.name%` |
| `TwitchSubs` | Totale degli abbonati | `Subs: %count%` | `%twitch.name%` |
| `TwitchCounter` | Un contatore con nome della chat Twitch | `%counter.name%: %count%` | `%counter.name%` |
| `TwitchLastRaider` | Il raider più recente | `Last Raid: %raider%` | `%raider%`, `%raid.viewers%` |
| `TwitchRecentStreams` | Stream iniziati negli ultimi 14 giorni | `Streams: %count%` | |

### Altre funzioni di Mewdeko

| Tipo | Categoria | Mostra | Modello predefinito | Segnaposto aggiuntivi |
| --- | --- | --- | --- | --- |
| `MinecraftPlayers` | Minecraft | Giocatori online su un server monitorato | `Players: %count%/%players.max%` | `%players.max%`, `%server.version%` |
| `MinecraftStatus` | Minecraft | Se un server monitorato è raggiungibile | `%status%` | `%status%`, `%latency%` |
| `CountingCurrent` | Counting | Numero attuale in un canale di conteggio | `Count: %count%` | |
| `CountingRecord` | Counting | Numero più alto mai raggiunto | `Record: %count%` | |
| `OpenTickets` | Tickets | Ticket aperti e non archiviati | `Open Tickets: %count%` | |
| `TicketsToday` | Tickets | Ticket aperti nelle ultime 24 ore | `Today: %count%` | |
| `PendingSuggestions` | Suggestions | Suggerimenti in attesa di una decisione | `Pending: %count%` | |
| `ActiveGiveaways` | Giveaways | Giveaway attualmente in corso | `Giveaways: %count%` | |
| `StarboardPosts` | Starboard | Totale dei post dello starboard | `Starred: %count%` | |
| `TopXpUser` | XP | Il membro con più XP | `Top: %member.name%` | `%member.name%`, `%member.id%`, `%member.xp%` |
| `TotalGuildXp` | XP | Tutti gli XP guadagnati nel server | `Total XP: %count%` | |
| `TotalCurrency` | Currency | Valuta detenuta dai membri | `In Circulation: %count%` | |
| `ActivePolls` | Polls | Sondaggi che accettano voti | `Polls: %count%` | |
| `Clock` | Server | La data e l'ora nel fuso orario del server | `%time% %tz%` | `%time%`, `%date%`, `%datetime%`, `%weekday%`, `%tz%` |
| `MessagesToday`, `MessagesWeek` | Activity | Messaggi nelle ultime 24 ore o 7 giorni | `Today: %count%` | |
| `VoiceHoursToday`, `VoiceHoursWeek` | Activity | Ore vocali di tutti i membri nelle ultime 24 ore o 7 giorni | `Today: %count%h` | |
| `TopChatter` | Activity | Il chiacchierone più attivo degli ultimi 7 giorni | `Chatter: %member.name%` | `%member.name%`, `%member.id%`, `%member.messages%` |
| `TopVoiceMember` | Activity | Il membro con più tempo in vocale negli ultimi 7 giorni | `Voice: %member.name%` | `%member.name%`, `%member.id%`, `%member.hours%` |
| `TopGame` | Activity | Il gioco più giocato degli ultimi 7 giorni (richiede il tracciamento dei giochi) | `%game%` | `%game%`, `%hours%`, `%players%` |
| `PlayingNow` | Activity | Membri attualmente in un gioco tracciato (richiede il tracciamento dei giochi) | `Playing: %count%` | |
| `RoleMembersOnline` | Members | Membri con un ruolo che non sono offline | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.total%` |
| `TopInviter` | Invite Tracking | Il membro con più inviti | `Inviter: %member.name%` | `%member.name%`, `%member.id%`, `%member.invites%` |
| `InvitesWeek` | Invite Tracking | Ingressi attribuiti agli invitanti negli ultimi 7 giorni | `This Week: %count%` | |
| `MembersLeftToday`, `MembersLeftWeek` | Members | Membri usciti nelle ultime 24 ore o 7 giorni | `Left Today: %count%` | |
| `NetGrowthWeek` | Members | Ingressi meno uscite negli ultimi 7 giorni | `Growth: %count%` | `%joins%`, `%leaves%` |

### Segnaposto disponibili per ogni tipo

| Segnaposto | Valore |
| --- | --- |
| `%count%` | Il valore, mostrato con lo stile di visualizzazione scelto |
| `%count.raw%` | Il valore come sole cifre |
| `%server.name%` | Nome del server |
| `%server.id%` | ID del server |
| `%server.members%` | Numero totale di membri |
| `%server.boostcount%` | Numero di boost |
| `%server.boostlevel%` | Livello dei boost |

I nomi dei canali sono limitati al massimo di 100 caratteri di Discord.

## Stili di visualizzazione

**Stile contatore** decide come viene mostrato `%count%`. Si applica solo ai contatori numerici; i contatori di testo come `NewestMember` stampano il testo così com'è, mentre i contatori vero/falso come `TwitchLiveStatus` stampano testo in stile "LIVE" oppure "Offline".

| Stile | Esempio per 1234 | Note |
| --- | --- | --- |
| `Plain` | `1234` | Solo cifre |
| `Comma` | `1,234` | Separatori delle migliaia. Il predefinito. |
| `Compact` | `1.2K` | Suffissi K, M, B, T, una cifra decimale per impostazione predefinita |
| `Padded` | `1234` | Riempito con zeri a una larghezza fissa, quattro cifre per impostazione predefinita, quindi 42 diventa `0042` |
| `Ordinal` | `1,234th` | Aggiunge st, nd, rd o th |
| `Percent` | `61.7%` | Valore come percentuale dell'obiettivo, una cifra decimale per impostazione predefinita |
| `ProgressBar` | una barra di dieci celle | Celle piene e vuote verso l'obiettivo, dieci celle per impostazione predefinita |
| `EmojiDigits` | cifre a emoji tasto | Ogni cifra come emoji tasto |
| `Roman` | `MCCXXXIV` | Numeri romani da 1 a 3999, altrimenti ricade sullo stile con virgole |

`Percent` e `ProgressBar` richiedono un obiettivo con cui confrontarsi. Senza un obiettivo mostrano `0%` oppure una barra vuota.

## Meccanismi di aggiornamento

| Meccanismo | Etichetta nella dashboard | Come funziona |
| --- | --- | --- |
| `Rename` | Rename only | Modifica il nome del canale. Discord consente due rinominazioni ogni dieci minuti per canale, quindi l'intervallo di aggiornamento è forzato ad almeno 5 minuti. L'ID del canale non cambia mai. |
| `Recreate` | Delete and recreate | Crea un nuovo canale con lo stesso nome, categoria, posizione e sovrascritture dei permessi, poi elimina quello vecchio. Può aggiornarsi ogni minuto, ma l'ID del canale cambia a ogni aggiornamento e ogni aggiornamento lascia due voci nel registro di controllo. |
| `Auto` | Auto (consigliato) | Rinomina finché il budget di due volte ogni dieci minuti lo consente. Quando il budget è esaurito e l'intervallo è inferiore a 5 minuti, ricrea il canale. Quando l'intervallo è di 5 minuti o più, attende semplicemente il prossimo slot di rinominazione. |

L'impostazione predefinita per i nuovi canali statistiche è **Auto** ogni **5 minuti**. Gli intervalli sono limitati tra 1 minuto (5 per Rename) e 1440 minuti. Il bot controlla ogni 30 secondi quali canali hanno raggiunto l'intervallo previsto.

> [!WARNING]
> Recreate cambia l'ID del canale. Tutto il resto che fa riferimento al canale, come configurazioni dei permessi di altri bot o link fissati, si rompe a ogni aggiornamento. Usalo solo dove un aggiornamento rapido conta più di un ID stabile.

## Impostazioni

La pagina ha tre schede, **Canali statistiche**, **Aggiungi** e **Predefiniti**, più un pulsante **Aggiorna** nell'intestazione. **Canali statistiche** elenca ogni canale configurato con i pulsanti **Modifica** e **Rimuovi**.

**Aggiungi canale statistico** offre **Crea nuovo canale** oppure **Usa canale esistente** con un selettore **Canale vocale**, poi:

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Category (optional) | nessuna | Dove viene posizionato un canale appena creato |
| Counter | nessuno | Il tipo di contatore dal catalogo |
| Template | il predefinito del tipo | Nome del canale con segnaposto; clicca su un segnaposto per inserirlo, e l'anteprima si aggiorna mentre scrivi |
| Counter Style | Comma | Stile di visualizzazione dalla tabella sopra |
| Update Mechanism | Auto | Rename, recreate o auto |
| Refresh Interval (minutes) | 5 | Ogni quanto si aggiorna il nome |
| Role | nessuno | Mostrato per `RoleMembers` |
| Target Date | nessuna | Mostrata per `Countdown` |
| Goal Target | nessuno | Mostrato per `MemberGoal`, e usato dagli stili percentuale e barra di avanzamento |
| Twitch Counter Name | nessuno | Mostrato per `TwitchCounter` |
| Counting Channel | nessuno | Mostrato per i tipi di conteggio |
| Minecraft Server | nessuno | Mostrato per i tipi Minecraft |

**Valori predefiniti per i nuovi canali statistici** imposta **Meccanismo predefinito**, **Stile contatore predefinito** e **Intervallo predefinito (minuti)** per i canali aggiunti in seguito. La scheda **Predefiniti** contiene anche le sezioni di riferimento **Stili dei contatori** e **Contatori disponibili**.

Un canale appena creato nega Connetti a `@everyone` così da funzionare come un'etichetta. Un canale che aggiungi tu stesso mantiene i permessi che ha già.

## Guida alla configurazione

1. Apri **Canali statistiche** nella dashboard e vai alla scheda **Predefiniti**. Lascia **Meccanismo predefinito** su Auto e imposta un intervallo con cui ti trovi a tuo agio.
2. Vai su **Aggiungi**, scegli **Crea nuovo canale** e seleziona una **Categoria** se vuoi raggruppare i contatori.
3. Scegli un **Contatore**, per esempio Total Members. Modifica il **Modello** e guarda l'anteprima.
4. Scegli un **Stile contatore** e salva.
5. Ripeti per ogni contatore. Per un obiettivo di membri, scegli `MemberGoal`, imposta **Obiettivo** e prova lo stile `ProgressBar`.
6. Trascina i nuovi canali in cima alla lista dei canali in Discord se non ci sono finiti da soli.
7. Attendi un intervallo di aggiornamento e verifica che i nomi cambino.

## Comandi

Esegui questi comandi con il prefisso del tuo server (`.` se non l'hai cambiato). Tipi, stili e meccanismi sono i nomi delle tabelle sopra, per esempio `TotalMembers`, `Compact`, `Recreate`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `statchannelcreate <type> [template]` | `scnew` | Gestisci canali | Crea un nuovo canale vocale bloccato che mostra quel contatore |
| `statchanneladd #voice <type> [template]` | `sca` | Gestisci canali | Trasforma un canale vocale esistente in un canale statistiche |
| `statchannelrole #voice @role [true] [template]` | `scr` | Gestisci canali | Aggiunge un contatore dei membri di un ruolo; `true` conta solo i membri che non sono offline |
| `statchannelcountdown #voice <date> [template]` | `scc` | Gestisci canali | Aggiunge un conto alla rovescia verso una data |
| `statchannelgoal #voice <number> [template]` | `scg` | Gestisci canali | Aggiunge un contatore con obiettivo di membri |
| `statchanneltwitchcounter #voice <counter> [template]` | | Gestisci canali | Rispecchia un contatore con nome della chat Twitch |
| `statchannelmechanism #voice <mechanism> [minutes]` | | Gestisci canali | Imposta rename, recreate o auto, e facoltativamente l'intervallo |
| `statchannelstyle #voice <style>` | | Gestisci canali | Imposta lo stile di visualizzazione |
| `statchanneldefaults [mechanism] [minutes] [style]` | | Gestisci canali | Imposta i valori predefiniti per i nuovi canali statistiche |
| `statchanneltypes [category]` | | Nessuno | Sfoglia ogni contatore con un esempio, facoltativamente per categoria |
| `statchannellist` | `scl` | Nessuno | Elenca i canali statistiche del server con tipo, stile, modalità e modello |
| `statchannelremove #voice` | `statchrm` | Gestisci canali | Smette di tracciare un canale |

`statchannelcreate` richiede anche che il bot abbia il permesso Gestisci canali. Gli equivalenti slash si trovano sotto `/statchannel`.

## Suggerimenti e insidie

- Il bot ha bisogno del permesso Gestisci canali per rinominare o ricreare un canale.
- Un canale vocale può essere solo un canale statistiche. Aggiungerlo due volte fallisce con "already a stat channel".
- I contatori Counting, Minecraft e Twitch richiedono che quelle funzioni siano già configurate. Gli obiettivi di Counting e Minecraft si scelgono nella dashboard; non esiste un comando per questi.
- `statchannelremove` si limita a smettere di tracciare. Elimina tu il canale vocale se non lo vuoi più.
- I valori live come gli spettatori Twitch o i ticket aperti seguono comunque l'intervallo del canale. Abbassa l'intervallo su quei canali invece che su tutti.
- Gli stili `Percent` e `ProgressBar` usano l'obiettivo del canale. Impostarli su un contatore senza obiettivo mostra sempre zero.

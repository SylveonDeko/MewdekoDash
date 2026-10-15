---
title: Sistema XP
slug: xp
summary: Premia i membri per le chat e per le conversazioni vocali con livelli, schede posizione, ricompense con ruolo e valuta, ed eventi a tempo.
icon: fa-star
category: Community
dashboard: /dashboard/xp
module: Xp
tags: [xp, experience, levels, level up, rank, rank card, leaderboard, role rewards, voice xp, xp boost, competition, xp curve, esperienza, livelli, salita di livello, posizione, scheda posizione, classifica, ricompense con ruolo, xp vocale, boost xp, competizione, curva xp]
related: [currency, achievements, administration, utility]
---

## Cosa fa

I membri guadagnano XP inviando messaggi e parlando nei canali vocali. L'XP si somma in livelli secondo una curva che scegli tu. Chiunque può usare `rank` per ottenere una scheda posizione generata con livello, barra di avanzamento, posizione nel server e avatar, oppure `leaderboard` per vedere chi è in testa.

Quando un membro sale di livello, il bot può pubblicare un annuncio nel canale, in un canale dedicato ai level-up oppure in DM. Puoi scrivere i tuoi messaggi di level-up con dei segnaposto, oppure lasciare che sia l'embed predefinito a gestirli. Raggiungere un livello può anche assegnare automaticamente ruoli e valuta del server.

Lo staff controlla la velocità con cui arriva l'XP: XP per messaggio, attesa, XP vocale al minuto, un moltiplicatore globale e moltiplicatori per canale e per ruolo. Gli eventi boost temporanei moltiplicano tutto per un certo periodo, mentre le competizioni sono una gara a tempo con premi per i primi posti. Utenti, ruoli e canali possono essere esclusi, così i canali per i comandi del bot e i ruoli silenziati non guadagnano nulla.

## Perché usarlo

- Dai ai membri attivi un progresso visibile e un motivo per continuare a chattare.
- Sblocca ruoli a livelli prestabiliti, così i membri di lunga data ottengono vantaggi senza che lo staff lo faccia a mano.
- Organizza un evento XP doppio nel weekend oppure una gara "primo a raggiungere il livello 20".
- Mantieni l'XP equo escludendo i canali dei comandi, i canali AFK e i ruoli dei bot.
- Collega l'XP al modulo valuta, così salire di livello genera anche un premio.

## Come si guadagna XP

### XP testuale

Ogni messaggio di un membro non bot assegna **XP per messaggio** (predefinito 3, massimo 50) una volta per finestra di **Attesa XP messaggi**. L'attesa predefinita è di 60 secondi: un membro che invia dieci messaggi in quella finestra riceve XP una sola volta. I messaggi nei canali esclusi, oppure di utenti e ruoli esclusi, non guadagnano nulla. Se il server è escluso per intero, non viene conteggiato niente.

La quantità viene poi moltiplicata. Tutti questi moltiplicatori si sommano:

| Moltiplicatore | Si imposta con | Note |
| --- | --- | --- |
| Moltiplicatore globale | `setxpmultiplier` oppure **Moltiplicatore XP globale** | Si applica a ogni guadagno |
| Moltiplicatore di canale | `setchannelxp` | Si applica ai guadagni in quel canale |
| Moltiplicatore di ruolo | `setrolexp` | Se un membro ha più ruoli con un moltiplicatore, si usa solo il più alto |
| Eventi boost | `xpboost` | Viene applicato ogni evento attivo |

Il risultato viene arrotondato per difetto a un numero intero.

**Bonus primo messaggio** è un premio separato, una tantum, assegnato al primo messaggio di un membro ogni giorno UTC. È salvato nelle impostazioni XP ma non è mostrato nella dashboard.

### XP vocale

L'XP vocale viene tracciato per sessione. Un membro lo guadagna solo mentre si trova in un canale vocale con almeno due persone che partecipano (i bot non contano) e non è silenziato né reso sordo, né da se stesso né dal server. Il tempo passato silenziato, sordo o da solo non viene conteggiato.

Quando la sessione termina, i minuti idonei vengono moltiplicati per **XP vocale al minuto** (predefinito 2, massimo 10). Le sessioni inferiori a 15 secondi non guadagnano nulla. Il **Timeout XP vocale** (predefinito 60 minuti) è il numero massimo di minuti per cui una singola sessione può essere pagata. I moltiplicatori si applicano all'XP vocale solo se la quantità base è di almeno 5. Impostare a 0 l'XP vocale al minuto o il timeout disattiva l'XP vocale.

### Decadimento XP

Il decadimento è facoltativo e disattivato per impostazione predefinita. Quando è attivo, ogni dodici ore il bot trova i membri la cui ultima attività risale a più di **Giorni di inattività prima del decadimento** e rimuove la **Percentuale giornaliera di decadimento** del loro XP totale. Queste tre impostazioni esistono nel record delle impostazioni XP ma non hanno ancora un comando o un controllo nella dashboard.

## Livelli e curve

Il livello di un membro dipende dal **Tipo di curva XP**. Ogni curva si basa su 36 XP per il livello uno.

| Curva | Nome del comando | Nome nella dashboard | XP necessari per il livello n |
| --- | --- | --- | --- |
| Standard | `Standard` | Predefinita | 36 x n al quadrato |
| Lineare | `Linear` | Lineare | 36 x n |
| Accelerata | `Accelerated` | Quadratica | 36 x n elevato a 1,25 |
| Decelerata | `Decelerated` | Esponenziale | 36 x n elevato a 2,5 |
| Personalizzata | `Custom` | non offerta | Uguale a Standard |
| Legacy | `Legacy` | Legacy | Ogni livello costa 36 più 9 per ogni livello precedente, i totali si accumulano |

Standard è la curva predefinita. Cambiare la curva con `setxpcurve` ricalcola il livello di tutti, a meno che come secondo argomento non passi `false`. Cambiare la curva non modifica il totale XP di nessuno, cambia solo il livello a cui corrisponde quel totale.

## Notifiche di level-up

Ogni membro sceglie come essere avvisato dei level-up con `levelnotif`: `None`, `Channel` o `Dm`. I membri possono anche usare `leveluppings false` per impedire al bot di menzionarli; il loro nome viene mostrato come testo semplice.

Le notifiche nel canale vanno nel **canale level-up**, se impostato con `levelupchannel`, altrimenti nel canale in cui è stato guadagnato l'XP. Il bot deve avere il permesso Invia messaggi in quel canale.

Se il server non ha messaggi personalizzati, il predefinito è un embed con il titolo di un messaggio di level-up, l'avatar del membro come miniatura e campi per XP totale, posizione nel server e nuovo livello. Se hai aggiunto messaggi personalizzati con `addlevelupmessage`, ogni volta ne viene scelto a caso uno tra quelli attivi. Un messaggio personalizzato può essere testo semplice oppure JSON di embed dal creatore di embed. Prova qualsiasi modello con `testlevelupmessage`.

### Segnaposto

Questi funzionano all'interno dei messaggi di level-up personalizzati, insieme ai segnaposto generali di utente e server presenti nella pagina dei segnaposto. Poiché le notifiche non tengono traccia del canale o della persona che ha generato l'evento, `%xp.channel.*%` viene risolto come "Unknown Channel" e `%xp.triggeruser.*%` come "System", mentre `%xp.gained%` vale sempre 0.

| Segnaposto | Valore |
| --- | --- |
| `%xp.user%` | Nome utente e tag, oppure solo il nome utente se le menzioni sono disattivate |
| `%xp.user.mention%` | Menzione del membro, oppure solo il nome utente se le menzioni sono disattivate |
| `%xp.user.name%` | Nome utente |
| `%xp.user.displayname%` | Nome visualizzato |
| `%xp.user.nickname%` | Soprannome, con ripiego sul nome utente |
| `%xp.user.avatar%` | URL dell'avatar |
| `%xp.user.id%` | ID utente |
| `%xp.user.created%` | Data di creazione dell'account |
| `%xp.user.joined%` | Data di ingresso nel server |
| `%xp.level.old%` | Livello prima del level-up |
| `%xp.level.new%` | Nuovo livello (`%xp.level.current%` è lo stesso) |
| `%xp.level.next%` | Nuovo livello più uno |
| `%xp.level.difference%` | Quanti livelli sono stati guadagnati |
| `%xp.total%` | XP totale |
| `%xp.current%` | XP guadagnato all'interno del livello attuale |
| `%xp.needed%` | XP totale richiesto dal livello attuale |
| `%xp.remaining%` | XP ancora necessario per il livello successivo |
| `%xp.progress%` | Avanzamento nel livello come percentuale |
| `%xp.rank%` | Posizione nel server come numero |
| `%xp.rank.ordinal%` | Posizione in parole, come "terzo" |
| `%xp.rank.suffix%` | Solo il suffisso: st, nd, rd o th |
| `%xp.guild%`, `%xp.guild.name%` | Nome del server |
| `%xp.guild.id%` | ID del server |
| `%xp.guild.membercount%` | Numero approssimativo di membri |
| `%xp.guild.icon%`, `%xp.guild.banner%` | URL dell'icona e del banner del server |
| `%xp.time%`, `%xp.time.full%`, `%xp.date%` | Ora UTC attuale, ora con data e data |
| `%xp.timestamp%`, `%xp.timestamp.relative%` | Tag timestamp di Discord per il momento attuale |

> [!EXAMPLE]
> `addlevelupmessage %xp.user.mention% just hit level %xp.level.new% and is now %xp.rank.ordinal% on the leaderboard.`

Esegui `levelupplaceholders` su Discord per vedere lo stesso elenco.

## Ricompense con ruolo

`rolereward <level> <role>` assegna un ruolo quando un membro raggiunge quel livello. Con **Ricompense con ruolo esclusive** disattivato (predefinito), i membri mantengono tutti i ruoli premio per livelli uguali o inferiori al proprio e perdono quelli per livelli superiori. Con l'opzione attiva (`setxpexclusive true`), viene mantenuto solo il premio per il livello più alto a cui hanno diritto e tutti gli altri ruoli premio vengono rimossi.

I premi vengono applicati quando cambia un livello. Usa `syncmyxproles`, `syncuserxproles` o `syncallxproles` per allineare i ruoli dopo aver aggiunto premi o importato XP. La sincronizzazione di tutti gli utenti può essere eseguita una volta all'ora, e il bot deve avere il permesso Gestisci ruoli con il proprio ruolo sopra ogni ruolo premio.

## Ricompense in valuta

`currencyreward <level> <amount>` paga la valuta del server dal modulo valuta quando un membro raggiunge quel livello. Passare 0 rimuove il premio. Se il livello di un membro scende, per esempio dopo `setxp` o per il decadimento, viene ritirata la valuta dei livelli persi.

## Obiettivi

[Obiettivi](/wiki/achievements) è un sistema separato con punti e gradi propri, quindi un grado obiettivo non è un livello XP. I due si incontrano in due punti: raggiungere livelli XP sblocca obiettivi nella categoria Community, e gli obiettivi possono restituire XP tramite una ricompensa XP per singolo obiettivo oppure **XP per punto** nella scheda Impostazioni degli obiettivi. Entrambi sono disattivati finché non li imposti.

## Eventi boost

`xpboost <time> <multiplier> <name>` avvia un evento a tempo, per esempio `xpboost 2h 2.0 Weekend XP Event`. Ogni boost attivo moltiplica l'XP dei messaggi e vocale sopra gli altri moltiplicatori. `xpboosts` elenca quelli in corso e `cancelboost <id>` ne interrompe uno in anticipo.

## Competizioni

`xpcompetition <time> <type> [targetLevel] [name]` avvia una gara a tempo. I membri vengono iscritti automaticamente la prima volta che guadagnano XP mentre è in corso.

| Tipo | Vincitore |
| --- | --- |
| `MostGained` | Chi ha guadagnato più XP durante la competizione |
| `ReachLevel` | Chi raggiunge per primo il livello obiettivo |
| `HighestTotal` | Chi ha il totale XP più alto quando termina |

Aggiungi premi con `addcompetitionreward <id> <position> <type> <reward>`, dove il tipo è `Role`, `XP` oppure `Currency`. I premi ruolo vengono concessi, i premi XP vengono aggiunti come XP bonus e la valuta viene pagata tramite il modulo valuta. `competitionleaderboard <id>` mostra la classifica, e `endcompetition <id>` la termina in anticipo e distribuisce i premi.

## Esclusioni

`xpexclude` e `xpinclude` accettano un utente, un ruolo o un canale testuale. Gli utenti esclusi e chiunque abbia un ruolo escluso non guadagnano mai XP; i canali esclusi non fanno guadagnare nulla a nessuno. Questo vale anche per i canali vocali. `xpexcludelist users|roles|channels` mostra gli elenchi. Le versioni slash sono `/xp admin exclude`, `/xp admin include` (passa un'opzione `user`, `role` o `channel`) e `/xp exclude-list`. L'interruttore **Esclusione XP del server** della dashboard disattiva in una volta sola il guadagno di XP per l'intero server.

## Schede posizione

`rank [@user]` genera una scheda PNG. `textrank [@user]` fornisce le stesse informazioni in forma testuale per gli screen reader. I bot non hanno una posizione.

La scheda viene costruita a partire dal modello del server: un'immagine di sfondo (la tua, da **Sfondo personalizzato della scheda XP**, oppure quella predefinita) e livelli per avatar e nome dell'utente, barra di avanzamento, livello del server, posizione nel server, tempo sul livello attuale e XP bonus assegnato. Ogni livello può essere mostrato o nascosto, spostato, ridimensionato e ricolorato, e la barra di avanzamento può essere arrotondata, segmentata o radiale e riempirsi in qualsiasi direzione.

La scheda **Modello** apre un editor visivo. Sugli schermi più stretti di 768 pixel la dashboard passa a un editor touch con gli stessi livelli, un pannello inferiore per le proprietà e controlli semplici per posizione e dimensione. Sugli schermi più larghi hai l'editor completo con elenco dei livelli, griglia, aggancio, righelli, annulla e ripristina, e zoom.

## Classifica

`leaderboard [page]` mostra la classifica del server. Se il server usa anche il modulo valuta e la valuta è in circolazione, un semplice `leaderboard` chiede se intendevi XP oppure valuta; indicare una pagina significa sempre XP. La scheda **Classifica** della dashboard mostra la stessa classifica con un'azione **Modifica XP** che può aggiungere, impostare o azzerare l'XP di un membro, eventualmente cancellando anche l'XP bonus.

## Impostazioni

La dashboard ha sei schede: **Impostazioni**, **Statistiche**, **Classifica**, **Ricompense**, **Modello** ed **Esclusioni**. Queste impostazioni si trovano nella scheda Impostazioni.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Esclusione XP del server | disattivata | Blocca ogni guadagno di XP sul server |
| XP per messaggio | 3 | XP base per messaggio, massimo 50 |
| Attesa XP messaggi | 60 secondi | Intervallo minimo tra due assegnazioni di XP per messaggio per membro |
| XP vocale al minuto | 2 | XP base per minuto vocale idoneo, massimo 10; 0 disattiva l'XP vocale |
| Timeout XP vocale | 60 minuti | Massimo di minuti per cui una sessione vocale può essere pagata |
| Moltiplicatore XP globale | 1 | Moltiplica ogni guadagno |
| Tipo di curva XP | Predefinita | Quale curva associa l'XP ai livelli |
| Sfondo personalizzato della scheda XP | nessuno | URL dell'immagine usata dietro le schede posizione |

La scheda **Ricompense** gestisce i premi con ruolo e valuta, e **Esclusioni** gestisce canali e ruoli esclusi. **Statistiche** mostra utenti totali, XP totale, livello medio, livello più alto e attività recente di XP.

Questi campi esistono anche nel record `GuildXpSetting`, ma si impostano solo tramite comando: `FirstMessageBonus`, `ExclusiveRoleRewards` (`setxpexclusive`), `LevelUpChannel` (`levelupchannel`), `LevelUpMessage` e i campi di decadimento `EnableXpDecay`, `InactivityDaysBeforeDecay` e `DailyDecayPercentage`.

## Guida alla configurazione

1. Apri **Gestione XP** nella dashboard e controlla che **Esclusione XP del server** sia disattivata.
2. In **Impostazioni**, lascia i valori di messaggi e voce ai predefiniti per iniziare, scegli una curva, poi premi **Salva modifiche**.
3. In **Esclusioni**, escludi i canali dei comandi del bot e tutti i ruoli silenziati o dei bot.
4. In **Ricompense**, aggiungi un premio con ruolo per alcuni livelli chiave. Assicurati che il ruolo del bot sia sopra quei ruoli.
5. Su Discord, esegui `levelupchannel #level-ups` e aggiungi uno o due modelli con `addlevelupmessage`. Prova con `testlevelupmessage`.
6. Apri **Modello**, carica uno sfondo e disponi la scheda. Esegui `rank` per vedere il risultato.

## Comandi

Usali con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `rank [@user]` | | Nessuno | Mostra una scheda posizione |
| `textrank [@user]` | | Nessuno | Informazioni sulla posizione in forma testuale |
| `leaderboard [page]` | `lb` | Nessuno | Classifica XP del server |
| `levelnotif <None\|Channel\|Dm>` | `lvlnotif` | Nessuno | Scegli come essere avvisato dei level-up |
| `leveluppings <true\|false>` | `lvluppings` | Nessuno | Se i messaggi di level-up possono menzionarti |
| `xpsettings` | `xpconfig` | Gestisci server | Mostra le impostazioni XP attuali |
| `setmessagexp <amount>` | `setmsgxp` | Gestisci server | XP per messaggio |
| `setxpcooldown <seconds>` | `xpcd` | Gestisci server | Attesa XP messaggi |
| `setvoicexp <amount>` | | Gestisci server | XP vocale al minuto |
| `setvoicetimeout <minutes>` | | Gestisci server | Limite della sessione vocale |
| `setxpmultiplier <number>` | `xpmult` | Gestisci server | Moltiplicatore globale |
| `setxpcurve <type> [recompute]` | | Gestisci server | Cambia la curva dei livelli |
| `setxpexclusive <true\|false>` | `xpexclusive`, `exclusivexp`, `setxpexcl`, `xpexcl` | Gestisci server | Mantieni solo il ruolo premio più alto |
| `setchannelxp <#channel> <number>` | | Gestisci server | Moltiplicatore di canale |
| `setrolexp <role> <number>` | | Gestisci server | Moltiplicatore di ruolo |
| `addxp <@user> <amount>` | | Gestisci server | Aggiungi XP a un membro |
| `setxp <@user> <amount>` | | Gestisci server | Imposta l'XP di un membro |
| `resetxp <@user> [resetBonus]` | | Gestisci server | Azzera l'XP di un membro |
| `resetxp` | | Amministratore | Azzera l'XP dell'intero server |
| `xpboost <time> <multiplier> <name>` | | Gestisci server | Avvia un evento boost |
| `xpboosts` | | Nessuno | Elenca i boost attivi |
| `cancelboost <id>` | | Gestisci server | Termina un boost in anticipo |
| `xpexclude <@user\|role\|#channel>` | | Gestisci server | Escludi dall'XP |
| `xpinclude <@user\|role\|#channel>` | | Gestisci server | Rimuovi un'esclusione |
| `xpexcludelist [users\|roles\|channels]` | | Nessuno | Mostra le esclusioni |
| `rolereward <level> <role>` | `rr` | Gestisci ruoli | Aggiungi un premio con ruolo |
| `removerolereward <level>` | `removerr` | Gestisci ruoli | Rimuovi un premio con ruolo |
| `rolerewards` | | Nessuno | Elenca i premi con ruolo |
| `currencyreward <level> <amount>` | `cr` | Gestisci server | Aggiungi un premio in valuta |
| `removecurrencyreward <level>` | `removecr` | Gestisci server | Rimuovi un premio in valuta |
| `currencyrewards` | | Nessuno | Elenca i premi in valuta |
| `xpcompetition <time> <type> [targetLevel] [name]` | | Gestisci server | Avvia una competizione |
| `addcompetitionreward <id> <position> <Role\|XP\|Currency> <reward>` | | Gestisci server | Aggiungi un premio di piazzamento |
| `xpcompetitions` | | Nessuno | Elenca le competizioni attive |
| `competitionleaderboard <id>` | `complb` | Nessuno | Classifica della competizione |
| `endcompetition <id>` | | Gestisci server | Termina una competizione e paga i premi |
| `syncallxproles` | | Amministratore | Riapplica i ruoli premio a tutti (una volta all'ora) |
| `syncmyxproles` | | Nessuno | Riapplica i tuoi ruoli premio (una volta ogni cinque minuti) |
| `syncuserxproles <@user>` | | Gestisci ruoli | Riapplica i ruoli premio di un membro |
| `levelupchannel [#channel]` | `lvlupchan` | Gestisci server | Dove vanno le notifiche di canale; senza canale indica quello attuale |
| `addlevelupmessage <text or embed JSON>` | `addlvlupmsg` | Gestisci server | Aggiungi un messaggio di level-up personalizzato |
| `levelupmessages` | `lvlupmsgs` | Gestisci server | Elenca i messaggi personalizzati con gli ID |
| `removelevelupmessage <id>` | `remlvlupmsg` | Gestisci server | Elimina un messaggio personalizzato |
| `togglelevelupmessage <id> <true\|false>` | `togglelvlupmsg` | Gestisci server | Attiva o disattiva un messaggio |
| `testlevelupmessage [template]` | `testlvlupmsg` | Gestisci server | Anteprima di un modello, o di uno salvato a caso |
| `levelupplaceholders` | `lvlupplaceholders` | Gestisci server | Elenca i segnaposto qui sopra |

Gli equivalenti slash si trovano sotto `/xp`, con i comandi per lo staff raggruppati in `/xp admin` (add, set, reset, exclude, include, sincronizzazioni dei ruoli), `/xp config` (tassi, moltiplicatori, curva, esclusività), `/xp rewards`, `/xp boost`, `/xp competition` e `/xp levelup`. `/xp admin reset` senza utente azzera l'XP dell'intero server; richiede il permesso Amministratore e `confirm: true`.

## Suggerimenti e insidie

- I premi con ruolo e le sincronizzazioni dei ruoli richiedono che il bot abbia il permesso Gestisci ruoli, e il suo ruolo più alto deve essere sopra ogni ruolo premio. `syncallxproles` e `syncuserxproles` si rifiutano di funzionare senza.
- L'XP vocale richiede almeno due persone non silenziate e non rese sorde nel canale. Un membro da solo o silenziato non guadagna nulla, per quanto tempo resti lì.
- I guadagni di XP vengono raggruppati e scritti in background, quindi `rank` può essere in ritardo di qualche secondo rispetto all'ultimo messaggio.
- Abbassare l'XP di qualcuno con `setxp` o `resetxp` può far scendere il suo livello, il che rimuove i ruoli premio e ritira la valuta dei livelli persi.
- La curva `Custom` si comporta esattamente come Standard e non è offerta nella dashboard. Scegli Legacy solo se stai migrando da una configurazione precedente e vuoi che i livelli esistenti coincidano.
- I messaggi di level-up personalizzati sostituiscono del tutto l'embed predefinito. Se ogni messaggio personalizzato è disattivato, torna l'embed predefinito.
- Gli eventi boost e le competizioni si gestiscono solo tramite comando; la dashboard non li mostra.

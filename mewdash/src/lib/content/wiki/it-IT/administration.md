---
title: Amministrazione
slug: administration
summary: Protezione automatica da raid, spam, alt, truffe e honeypot, ruoli assegnati all'ingresso o ottenuti dai membri, sovrascritture dei permessi Discord per i comandi e le operazioni di massa che ti servono nei giorni difficili.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Administration
tags: [admin, anti-raid, anti-spam, anti-alt, anti-pattern, anti-mass-mention, anti-mass-post, honeypot, anti-image-hash, scam images, external apps, user apps, reaction roles, self-assignable roles, auto-assign roles, auto-ban roles, voice channel roles, permission overrides, dpo, mass ban, prune, server recovery, staff role, timezone, cooldowns, amministrazione, protezione raid, protezione spam, protezione alt, menzioni di massa, post di massa, hash immagini, immagini truffa, app esterne, app utente, ruoli di reazione, ruoli auto-assegnabili, ruoli automatici, ruoli auto-ban, ruoli canale vocale, sovrascritture permessi, ban di massa, pulizia, ripristino server, ruolo staff, fuso orario, cooldown]
related: [moderation, permissions, logging, multigreets, settings, auditlog, rolestates]
---

## Cosa fa

Amministrazione è il modulo che mantiene il server in ordine quando nessun moderatore è presente. I suoi sistemi di protezione controllano ingressi e messaggi e puniscono automaticamente quando qualcosa sembra un raid, una raffica di spam, un alt usa e getta, una menzione di massa, un link truffa incollato in ogni canale, un messaggio in un canale trappola o un'immagine truffa nota. Ogni sistema è indipendente, ha la sua punizione e può essere attivato e disattivato da solo.

Lo stesso modulo gestisce l'automazione dei ruoli: ruoli assegnati all'ingresso, ruoli che i membri si assegnano da soli con `iam`, ruoli di reazione, ruoli legati alla presenza in un canale vocale e ruoli trappola che bannano chi li riceve. Permette inoltre di cambiare il permesso Discord richiesto da un comando, di impostare i ruoli staff e membro su cui si basano altre funzioni, di limitare la frequenza dei comandi e di ripulire i messaggi dei comandi.

Per i giorni difficili ci sono le operazioni di massa: bannare o espellere chiunque sia entrato negli ultimi minuti, bannare per schema di nome, per ruolo o per avatar, eliminare i membri inattivi e un flusso di ripristino del server che restituisce un ruolo amministratore a un proprietario verificato.

Tutto si trova nella pagina **Amministrazione** della dashboard, divisa in cinque schede: **Panoramica**, **Sistemi di protezione**, **Ruoli e permessi**, **Automazione e impostazioni** e **Operazioni avanzate**. Quasi ogni impostazione ha anche un comando.

## Perché usarlo

- I raid di join e le ondate di bot arrivano alle 3 di notte e vuoi che vengano gestiti prima che qualcuno si svegli.
- Un account compromesso sta incollando lo stesso link di phishing in dieci canali.
- I membri devono poter scegliere da soli il colore, la regione o i ruoli di notifica senza l'aiuto dello staff.
- Vuoi che `ban` funzioni per chi ha Gestisci messaggi invece di Bannare membri, senza toccare le impostazioni dei ruoli di Discord.
- Un comando viene spammato in general e ha bisogno di un cooldown.
- Un amministratore canaglia ha rimosso i ruoli del proprietario e ti serve un modo per rientrare.

## Punizioni

Ogni sistema di protezione prevede un'**azione di punizione**. Alcune azioni prevedono anche una **durata** o un **ruolo**.

| Azione | Cosa succede |
| --- | --- |
| Mute | Applica il ruolo di mute del server (testo e vocale) |
| ChatMute | Ruolo di mute solo per il testo |
| VoiceMute | Il server silenzia il membro in vocale |
| Kick | Rimuove il membro; può rientrare |
| Softban | Banna e sbanna subito per cancellare i messaggi recenti |
| Ban | Banna, oppure bannare temporaneamente se indichi una durata |
| Timeout | Timeout nativo di Discord; richiede una durata, massimo 28 giorni |
| AddRole | Aggiunge il ruolo scelto, per esempio un ruolo di quarantena |
| RemoveRoles | Rimuove tutti i ruoli |
| Warn | Aggiunge un avvertimento tramite il modulo Moderazione |
| Delete | Elimina il messaggio colpevole e nient'altro |
| None | Registra l'evento senza intraprendere alcuna azione |

Solo Ban, Mute, ChatMute, VoiceMute, AddRole e Timeout accettano una durata; per le altre la durata viene ignorata. Le durate sono in minuti. La dashboard consente fino a 10080 (una settimana) per Anti-Raid, Anti-Spam, Anti-Mass-Mention e Anti-Pattern, 1440 (un giorno) per Anti-Mass-Post, Anti-Post-Channel e Anti-Image-Hash, e un anno per Anti-Alt. Le punizioni vengono applicate una alla volta, al ritmo di una al secondo, da una coda, e il motivo nel registro di audit di Discord riporta testi come "Raiding Protection" o "ImageHash Protection".

> [!WARNING]
> Anti-Raid, Anti-Alt e Anti-Pattern vengono eseguiti quando un membro entra, e saltano del tutto il controllo quando l'azione è Warn. Per questi tre scegli Kick, Ban, Timeout o un ruolo.

I membri con il permesso Amministratore sono esenti da tutte le protezioni basate sui messaggi. I bot vengono ignorati dalle protezioni basate sull'ingresso e da Anti-Spam; per gli altri c'è l'interruttore **Ignora bot**.

## Sistemi di protezione

La scheda **Sistemi di protezione** mostra una scheda per sistema con un pulsante **Abilitato** o **Disabilitato** e, una volta attivato, un pulsante **Configura** che apre le sue impostazioni. Attivando dalla dashboard viene applicata una configurazione iniziale; apri **Configura** e controlla l'azione prima di fidarti del sistema. La scheda **Panoramica** mostra quanti dei sette sistemi sono attivi e li elenca uno per uno.

### Anti-Raid

Conta i membri che entrano in una finestra mobile. Quando il conteggio raggiunge la **soglia utenti** entro la **finestra** (in secondi), tutti i membri contati in quell'ondata vengono puniti insieme. Il comando accetta una soglia da 2 a 30 e una finestra da 2 a 300 secondi; la dashboard accetta da 1 a 50 e da 1 a 300. AddRole non è supportato qui. I bot che entrano non vengono contati.

> [!EXAMPLE]
> `antiraid 10 10 Ban` banna tutti quando dieci account entrano in dieci secondi. `antiraid 10 10 Timeout 1h` invece li mette in timeout per un'ora.

### Anti-Spam

Conta i messaggi identici consecutivi di un singolo membro, confrontati senza distinguere maiuscole e minuscole. Quando il conteggio raggiunge la **soglia messaggi** (da 2 a 10 con il comando, da 1 a 20 nella dashboard), il membro viene punito e il conteggio si azzera. Un messaggio diverso azzera il conteggio; ogni messaggio conteggiato decade dopo trenta minuti. I canali nell'elenco **canali ignorati** vengono saltati, il che è utile per i canali dei comandi dei bot. Usa `antispam <count> <action> <role>` con AddRole per assegnare invece un ruolo.

### Anti-Alt

Controlla l'età di ogni account che entra. Gli account più giovani della **età minima** (in minuti; funziona anche `antialt 3d Kick`) vengono puniti sul colpo. Viene eseguito solo all'ingresso, quindi attivarlo non controlla i membri già presenti. Il valore iniziale della dashboard è 1440 minuti, cioè un giorno.

### Anti-Menzioni-di-Massa

Conta le menzioni di utenti e ruoli. Un singolo messaggio con almeno la **soglia menzioni** viene punito immediatamente. Sotto quella soglia, le menzioni vengono sommate per membro nella **finestra temporale** (in secondi), e superare il **numero massimo di menzioni nella finestra** fa scattare la punizione. **Ignora bot** decide se i messaggi dei bot vengono conteggiati.

### Anti-Pattern

Assegna un punteggio a ogni nuovo membro cercando segnali di account usa e getta o di bot, e punisce quando il punteggio raggiunge il **punteggio minimo**. Viene eseguito al momento dell'ingresso e guarda l'account, non i messaggi.

| Segnale | Punti | Impostazione |
| --- | --- | --- |
| Account creato entro l'età massima | 5 | **Controlla età account**, **Età massima account (mesi)** |
| Ingresso poco dopo la creazione dell'account | 10 se meno di un'ora, 7 se meno di sei ore, altrimenti 3 | **Controlla tempi di ingresso**, **Ore massime di ingresso** |
| Altri membri creati nella stessa ora | 1 per account, fino a 10 | **Controlla creazione in blocco** |
| Account mostrato come offline durante l'ingresso | 2 | **Controlla stato offline** |
| Account più giovane della soglia per nuovi account | 3 | **Controlla nuovi account**, **Giorni per nuovo account** |
| Il nome utente corrisponde a uno dei tuoi pattern regex | 15 | Pattern con **controlla nome utente** |
| Il nome visualizzato corrisponde a uno dei tuoi pattern | 12 | Pattern con **controlla nome visualizzato** |

Una corrispondenza con un pattern punisce non appena il punteggio parziale è almeno pari al minimo; anche i soli altri segnali possono raggiungerlo. I pattern sono espressioni regolari, confrontate senza distinguere maiuscole e minuscole con il nome in minuscolo. I valori iniziali della dashboard sono punteggio minimo 15, sei mesi, 48 ore, sette giorni, tutti i controlli attivi. Nella dashboard il pulsante **Pattern** sulla scheda apre l'elenco dei pattern, dove ogni pattern ha un nome, la regex e le due caselle di controllo sul nome.

Con i comandi, `patternadd <regex> [name] [checkUsername] [checkDisplayName]` ne aggiunge uno e `patternconfig <setting> <value>` regola `accountage`, `maxaccountage`, `jointiming`, `maxjoinhours`, `batchcreation`, `offlinestatus`, `newaccounts`, `newaccountdays` o `minimumscore`. `patternconfig` da solo mostra i valori attuali e quante volte il sistema è scattato.

### Anti-Post-di-Massa

Individua un membro che pubblica lo stesso contenuto o uno simile in più canali in rapida successione, il classico schema "incolla il link truffa ovunque" che Anti-Spam non vede perché i messaggi sono sparpagliati.

Per ogni membro il bot conserva gli ultimi cinquanta messaggi entro la **finestra temporale** (da 10 a 600 secondi). Un messaggio viene confrontato con quelli precedenti e risulta simile quando è almeno l'80% uguale per distanza di modifica, senza distinguere maiuscole e minuscole. Quando esistono messaggi simili in almeno la **soglia canali** (da 2 a 20) canali distinti, il membro viene punito. I messaggi di meno di venti caratteri vengono ignorati.

**Controlla solo i link** è attivo per impostazione predefinita: vengono tracciati solo i messaggi che contengono un link. Gli utenti, i ruoli e i canali ignorati vengono rispettati. Di default il messaggio che ha innescato il controllo viene eliminato e al membro viene inviato un messaggio privato che spiega il motivo.

### Anti-Post-Channel

Imposta i **canali honeypot**. Segna uno o più canali in cui i membri veri non hanno motivo di scrivere, di solito nascosti in fondo alla lista dei canali con un nome di avviso. Chiunque vi scriva viene trattato come un bot o un account compromesso: il messaggio viene eliminato, chi l'ha scritto riceve un messaggio privato e viene applicata la punizione. Gli amministratori sono esenti, e puoi aggiungere **ruoli ignorati** e **utenti ignorati** (tramite ID).

Il bot mantiene anche aggiornato un **embed di stato** in un canale di stato: il canale in cui hai eseguito `antipostchannel` oppure, se attivato dalla dashboard, il primo canale honeypot che cattura qualcuno. L'embed mostra l'azione, il numero di canali honeypot, il totale delle catture e gli ultimi dieci membri catturati.

### Anti-Hash-Immagini

Blocca immagini specifiche in base all'aspetto, quindi un nuovo caricamento ridimensionato, ricompresso, schiarito, specchiato o incorniciato con un bordo viene comunque riconosciuto. Ogni immagine bloccata viene memorizzata come hash percettivo insieme alla sua versione speculare e, quando ha un bordo uniforme, a una copia senza bordo. Gli allegati pubblicati (e gli embed, se **controlla gli embed** è attivo) vengono sottoposti allo stesso hash e confrontati.

- **Tolleranza di corrispondenza** (da 0 a 64, predefinito 31) indica quanto un'immagine pubblicata può differire e ancora essere considerata uguale. Abbassala se un'immagine innocente viene colpita; alzala solo se le truffe sfuggono.
- **Cattura copie con bordo** rimuove un bordo uniforme da un'immagine pubblicata prima del confronto. Le copie specchiate vengono sempre catturate.
- Le immagini troppo semplici per essere identificate in modo affidabile non vengono mai confrontate, né accettate come blocco, perché corrisponderebbero a immagini non correlate.
- Le immagini più grandi di 8 MB non vengono scaricate né sottoposte ad hash. Il limite può essere impostato tra 1 e 32 MB tramite API, ma né la scheda della dashboard né un comando lo espongono.
- Ogni immagine bloccata può avere una propria azione, durata e ruolo, che sostituiscono quelli predefiniti del sistema. **Solo elimina** rimuove l'immagine senza punire chi l'ha pubblicata.
- I ruoli e i canali ignorati vengono saltati; di default chi pubblica riceve un messaggio privato.

**Blocca immagini truffa note** attiva un elenco predefinito incluso nel bot, attualmente con le immagini dei falsi casinò crypto e dei falsi giveaway di MrBeast che circolano su Discord. La scheda mostra quante immagini sono nell'elenco e quanti post ha catturato nel tuo server.

Per bloccare una tua immagine dalla dashboard, trascina o carica il file, oppure incolla il suo URL, assegnale un'etichetta, scegli facoltativamente un'azione specifica per l'immagine e salva. Con i comandi, esegui `blockimage [action] [name]` allegando l'immagine, rispondendo a un messaggio che la contiene oppure incollando il link. `blockedimages` elenca tutto con il conteggio dei riscontri, `unblockimage <id>` ne rimuove una e `imagehash` mostra l'hash di un'immagine senza bloccarla.

> [!TIP]
> Attiva prima Anti-Post-Channel e l'elenco delle immagini truffa note. Nessuno dei due genera falsi positivi nella normale chat e, insieme, catturano la maggior parte delle attività automatiche di truffa.

### Anti-App-Esterne

I membri possono aggiungere app al proprio account Discord e usarle in qualsiasi server, anche in uno a cui l'app non è mai stata aggiunta. I messaggi di quelle app vengono pubblicati con il nome dell'app, quindi le altre protezioni, che guardano chi ha inviato un messaggio, non vedono mai il membro dietro di essi. Anti-App-Esterne legge quale membro ha eseguito l'app e agisce su di lui.

Un messaggio conta come violazione quando:

- menziona almeno il **limite di menzioni** di utenti e ruoli (predefinito 5), oppure menziona everyone o here,
- contiene un link di invito Discord, mentre **rimuovi link di invito** è attivo,
- oppure proviene da un membro che ha eseguito app più volte del **massimo di messaggi app consentiti** nella finestra (predefinito 5 in 10 secondi).

Impostare un limite a 0 disattiva quel controllo. Quando un messaggio infrange una regola viene eliminato, e il membro che ha eseguito l'app riceve la punizione, un timeout di un'ora per impostazione predefinita. **Solo elimina** rimuove il messaggio senza punire nessuno. Le app aggiunte al server stesso non vengono toccate, né lo sono gli amministratori del server.

> [!TIP]
> Il permesso Discord **Usa app esterne** è un ottimo alleato per questo. I membri che non ce l'hanno possono comunque usare le loro app, ma solo loro vedono le risposte. Negalo a `@everyone` e consentilo a un ruolo fidato o con livello, e gli account nuovi o usa e getta non potranno proprio pubblicare tramite app.

## Ruoli

Queste schede si trovano nella scheda **Ruoli e permessi**.

### Ruoli auto-assegnati all'ingresso

Ruoli dati a ogni membro nel momento in cui entra, con un elenco separato per i bot. I membri che stanno ancora completando la verifica del server ricevono i ruoli una volta approvati. Se Stati dei ruoli è impostato per saltare l'auto-assegnazione ai membri con uno stato di ruolo salvato, i membri che tornano mantengono invece i loro vecchi ruoli. `autoassignrole <role>` attiva o disattiva un ruolo nell'elenco; eseguilo da solo per vedere l'elenco.

### Ruoli auto-assegnabili

Ruoli che i membri possono darsi da soli con `iam <role>` e togliersi con `iamnot <role>`. I ruoli sono suddivisi in **gruppi** numerati (il gruppo 0 è "Non raggruppati"), e i gruppi possono avere un nome. La **modalità esclusiva** è un interruttore globale del server: quando è attiva, prendere un ruolo da un gruppo rimuove qualsiasi altro ruolo del gruppo che possiedi, il che è ideale per colori o regioni. Un ruolo può richiedere un **livello** minimo di XP. **Rimuovi messaggi iam** elimina sia il comando sia la risposta dopo tre secondi per mantenere pulito il canale.

### Ruoli di reazione

Collega emoji a ruoli su un messaggio esistente. I membri cliccano l'emoji per ottenere il ruolo e la rimuovono per perderlo. Ogni messaggio può essere contrassegnato come **Esclusivo**, così un membro può avere un solo ruolo da quel messaggio. Discord consente venti reazioni per messaggio, e la dashboard le conta per te. Aggiungere a un messaggio che ha già ruoli di reazione estende la configurazione esistente.

Con i comandi, `reactionroles [messageId] [excl] <role> <emoji> ...` imposta le coppie; ometti l'ID del messaggio per usare il messaggio direttamente sopra il tuo comando. `reactionroleslist` mostra tutte le configurazioni con un indice, e `reactionrolesremove <index>` ne elimina una.

### Ruoli dei canali vocali

Associa un ruolo a un canale vocale. I membri ricevono il ruolo quando entrano nel canale e lo perdono quando escono. Usalo per aprire un canale di testo solo alle persone che sono in chiamata in quel momento.

### Ruoli di auto-ban

Qualsiasi ruolo in questo elenco è un filo d'inciampo: nel momento in cui un membro lo ottiene, viene bannato. Il motivo predefinito è "Auto-ban role assigned" a meno che non ne imposti uno con `autobanrolereason`. Combinalo con un ruolo di reazione su un messaggio nascosto per catturare i bot che si auto-assegnano ruoli. Il numero di giorni di messaggi eliminati segue l'impostazione di pulizia dei ban del modulo Moderazione.

## Sovrascritture dei permessi e permessi dei comandi

Le **sovrascritture dei permessi** sostituiscono il permesso Discord che un comando normalmente controlla. Aggiungi una sovrascrittura per `ban` che richiede Gestisci messaggi e chiunque abbia Gestisci messaggi potrà eseguirlo; aggiungine una che richiede Amministratore e potranno farlo solo gli amministratori. Quando sono elencati più permessi, l'utente deve averli tutti. Con i comandi, `dpo <command> <permission> [permission...]` ne imposta una, `dpo <command>` senza permessi la rimuove, `dpol` le elenca e `dpor` cancella tutto dopo una conferma. Sono accettati anche i nomi dei trigger di chat personalizzati.

La scheda **Gestione permessi** nella stessa scheda è il sistema di permessi dei comandi basato su regole: consente o nega un comando, un modulo o tutto per un utente, un ruolo, un canale, una categoria o l'intero server, valutati dall'alto verso il basso. Ha un suo articolo, vedi `permissions`.

## Impostazioni del server

Queste schede si trovano nella scheda **Automazione e impostazioni**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| **Ruolo staff** | nessuno | Il ruolo che le altre funzioni considerano staff |
| **Ruolo membro** | nessuno | Il ruolo considerato "membro"; `prunemembers` può includere chi lo possiede |
| **Fuso orario del server** | UTC | Fuso orario usato ovunque il bot mostri orari locali |
| **Cooldown dei comandi** | nessuno | Limite di frequenza per comando in secondi, da 1 a 90.000 |
| **Sovrascritture dei permessi** | nessuna | Permesso Discord richiesto da ogni comando (vedi sopra) |
| **Canale vocale di gioco** | nessuno | Quando un membro in questo canale vocale inizia a giocare, il bot lo sposta nel canale vocale il cui nome corrisponde al gioco |
| **Elimina messaggio al comando** | disattivato | Elimina il messaggio che ha invocato il comando dopo la sua esecuzione, con sovrascritture per canale di Abilita, Disabilita o Eredita |
| **Esclusione statistiche** | incluso | Interrompe le statistiche di utilizzo dei comandi per questo server; **Elimina statistiche** cancella ciò che è memorizzato |

## Operazioni avanzate

La scheda **Operazioni avanzate** contiene tre schede. Ogni operazione di massa chiede una conferma e poi viene eseguita senza ulteriori controlli.

### Messaggio di ban personalizzato

Il messaggio che un membro riceve in privato quando viene bannato, creato con l'editor degli embed. È lo stesso modello usato dal comando di ban del modulo Moderazione.

### Ripristino del server

Un modo per restituire un ruolo Amministratore al proprietario dopo che un amministratore compromesso lo ha rimosso. Per il server vengono memorizzate due chiavi segrete: una **chiave di ripristino** e una **chiave a due fattori**.

- Eseguendo `/serverrecovery server-recover` come proprietario del server quando non è configurato nulla, vengono generate entrambe: una chiave di ripristino che ti viene inviata in privato e un segreto per l'app di autenticazione mostrato come codice QR. Conferma con un codice dalla tua app di autenticazione per completare.
- Una volta configurato, chiunque esegua `/serverrecovery server-recover`, inserisca la chiave di ripristino e poi un codice di autenticazione valido riceve un nuovo ruolo chiamato "Recovered Server Owner Role" con Amministratore, posizionato appena sotto il ruolo più alto del bot.
- `/serverrecovery clear-server-recover` elimina le chiavi memorizzate dopo una conferma, così come **Rimuovi configurazione di ripristino** nella dashboard.

La scheda della dashboard può anche memorizzare le chiavi direttamente: genera o digita una chiave di ripristino di almeno sedici caratteri e una chiave a due fattori. Il bot verifica i codici con quella chiave a due fattori come segreto di autenticazione (TOTP), quindi inserisci un segreto in base32 che hai aggiunto a un'app di autenticazione, non una password normale.

> [!PERMISSION]
> Il bot stesso deve avere il permesso Amministratore perché il ripristino funzioni, e il suo ruolo più alto deve essere abbastanza alto da far sì che un ruolo appena sotto di esso superi comunque le persone da cui stai recuperando.

### Operazioni di massa

| Operazione | Cosa fa |
| --- | --- |
| **Elimina utenti inattivi** | Eliminazione membri di Discord per i membri inattivi da un certo numero di giorni (da 1 a 30) |
| **Banna utenti in massa** | Banna un elenco di ID utente incollato con un unico motivo; l'eliminazione dei messaggi segue l'impostazione di pulizia dei ban del modulo Moderazione |
| **Rinomina utenti in massa** | Imposta il soprannome di ogni membro su uno schema in cui `{username}` viene sostituito con il loro nome utente, per esempio `[AFK] {username}`; i membri che il bot non può rinominare vengono saltati |
| **Elimina fino al messaggio** | Elimina, uno alla volta, tutti i messaggi successivi a un dato ID messaggio in un canale |

I comandi aggiungono modi per scegliere chi bannare: `banunder 10m` banna chiunque sia entrato negli ultimi dieci minuti (`-p` mostra prima l'anteprima dell'elenco, `-accage 1d` richiede inoltre che l'account abbia meno di un giorno), `kickunder` fa lo stesso con un'espulsione, `nameban <regex>` banna i nomi utente che corrispondono a uno schema dopo un'anteprima, `baninrole <role>` banna chiunque abbia un ruolo e `banbyhash <avatarHash>` banna ogni membro che usa un dato avatar. Tutti chiedono una conferma.

## Guida alla configurazione

1. Apri **Amministrazione** nella dashboard e vai su **Sistemi di protezione**.
2. Attiva **Anti-Raid**, premi **Configura** e imposta una soglia e una finestra adatte al tuo normale ritmo di ingresso. Scegli Kick o Ban come azione.
3. Crea un canale nascosto in cui scriverebbero solo i bot, attiva **Anti-canale di post** e aggiungilo in **Canali honeypot**.
4. Attiva **Anti-Hash-Immagini** e premi **Blocca immagini truffa note**.
5. Attiva **Anti-Post-di-Massa** con i tre canali predefiniti in sessanta secondi e solo link.
6. In **Ruoli e permessi**, aggiungi il tuo ruolo membro a **Ruoli auto-assegnati** per gli utenti normali, imposta un gruppo colore con **Aggiungi ruolo auto-assegnabile** e poi attiva la **Modalità esclusiva**.
7. In **Automazione e impostazioni**, imposta il **Ruolo staff**, il **Ruolo membro** e il **Fuso orario del server**.
8. In **Operazioni avanzate**, configura il **Ripristino del server** quando le cose sono tranquille.
9. Controlla **Panoramica**: elenca ogni sistema di protezione e se è attivo.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). I comandi di protezione eseguiti senza argomenti disattivano quel sistema.

### Protezione

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `antiraid [threshold] [seconds] [action] [duration]` | | Amministratore | Configura o disattiva Anti-Raid |
| `antispam [count] [action] [duration or role]` | | Amministratore | Configura o disattiva Anti-Spam |
| `antialt [minAge] [action] [duration or role]` | | Amministratore | Configura o disattiva Anti-Alt |
| `antimassmention [threshold] [window] [max] [ignoreBots] [action] [duration or role]` | `amm`, `massmention`, `stopmassmention` | Amministratore | Configura o disattiva Anti-Menzioni-di-Massa |
| `antipattern [action] [duration or role]` | `apattern` | Amministratore | Configura o disattiva Anti-Pattern |
| `patternadd <regex> [name] [checkUsername] [checkDisplayName]` | `padd` | Amministratore | Aggiunge un pattern per il nome |
| `patternremove <id>` | `premove`, `prem` | Amministratore | Rimuove un pattern tramite ID |
| `patternlist` | `plist` | Amministratore | Elenca i pattern |
| `patternconfig [setting] [value]` | `pconfig` | Amministratore | Mostra o modifica le impostazioni di punteggio di Anti-Pattern |
| `antimasspost [channels] [seconds] [action] [duration]` | | Amministratore | Configura o disattiva Anti-Post-di-Massa |
| `antipostchannel [action] [duration]` | | Amministratore | Configura o disattiva i canali honeypot; il canale attuale diventa il canale di stato |
| `antipostchanneladd <#channel>` | | Amministratore | Aggiunge un canale honeypot |
| `antipostchannelremove <#channel>` | | Amministratore | Rimuove un canale honeypot |
| `antiimagehash [action] [tolerance] [duration]` | `aih` | Amministratore | Configura o disattiva Anti-Hash-Immagini |
| `antiexternalapp [action] [mentions] [messages] [duration]` | `aea`, `antiuserapp` | Amministratore | Configura o disattiva Anti-App-Esterne |
| `blockimage [action] [name]` | `banimage` | Amministratore | Blocca l'immagine allegata, a cui si è risposto o collegata |
| `unblockimage <id>` | `unbanimage` | Amministratore | Rimuove un'immagine bloccata |
| `blockedimages` | `blockedimagelist` | Amministratore | Elenca le immagini bloccate con il conteggio dei riscontri |
| `imagehash [url]` | | Amministratore | Mostra l'hash di un'immagine |
| `antiimagehashpreset` | `aihpreset`, `blockcommonscams` | Amministratore | Attiva o disattiva l'elenco delle immagini truffa note |
| `antiimagehashignore <role or #channel>` | `aihignore` | Amministratore | Attiva o disattiva un'esenzione per ruolo o canale |

### Ruoli

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `autoassignrole [role]` | `aar` | Gestisci ruoli | Attiva un ruolo all'ingresso, oppure li elenca |
| `autoassignbotrole [role]` | `aabr` | Gestisci ruoli | Lo stesso per i bot |
| `asar [group] <role>` | | Gestisci ruoli | Rende un ruolo auto-assegnabile, facoltativamente in un gruppo |
| `rsar <role>` | | Gestisci ruoli | Rimuove un ruolo auto-assegnabile |
| `lsar` | | Nessuno | Elenca i ruoli auto-assegnabili per gruppo |
| `sargn <group> [name]` | | Gestisci ruoli | Assegna un nome a un gruppo, oppure ne cancella il nome |
| `togglexclsar` | `tesar` | Gestisci ruoli | Attiva o disattiva la modalità esclusiva |
| `rolelevelreq <level> <role>` | `rlr` | Gestisci ruoli | Richiede un livello XP per un ruolo |
| `adsarm` | | Gestisci messaggi | Attiva o disattiva l'eliminazione dei messaggi `iam` |
| `iam <role>` | | Nessuno | Ti assegna un ruolo auto-assegnabile |
| `iamnot <role>` | `iamn` | Nessuno | Ne rimuove uno |
| `reactionroles [messageId] [excl] <role> <emoji>...` | `rero` | Gestisci ruoli | Imposta i ruoli di reazione su un messaggio |
| `reactionroleslist` | `reroli` | Gestisci ruoli | Elenca le configurazioni dei ruoli di reazione |
| `reactionrolesremove <index>` | `rerorm` | Gestisci ruoli | Rimuove una configurazione tramite indice |
| `vcrole [voiceChannel] [role]` | | Gestisci ruoli | Associa un ruolo a un canale vocale (quello attuale, se omesso); senza ruolo rimuove l'associazione |
| `vcrolerm <channelId>` | | Gestisci ruoli | Rimuove un'associazione tramite ID canale |
| `vcrolelist` | | Nessuno | Elenca i ruoli dei canali vocali |
| `autobanroleadd <role>` | `abra` | Amministratore | Aggiunge un ruolo trappola |
| `autobanroleremove <role>` | `abrr` | Amministratore | Ne rimuove uno |
| `autobanrolelist` | `abrl` | Amministratore | Elenca i ruoli trappola e i motivi |
| `autobanrolereason <role> [reason]` | `abreason` | Amministratore | Mostra, imposta o cancella il motivo del ban |
| `setrole <role> <user> [time]` | `sr`, `giverole` | Gestisci ruoli | Assegna un ruolo, facoltativamente per un tempo limitato |
| `removerole <role> <user>` | `rr` | Gestisci ruoli | Rimuove un ruolo |
| `removeallroles <user>` | `rar` | Gestisci ruoli | Rimuove tutti i ruoli |
| `createrole [name]` | `cr` | Gestisci ruoli | Crea un ruolo |
| `deleterole <role>` | `dr` | Gestisci ruoli | Elimina un ruolo |
| `renamerole <role> <name>` | `renr` | Gestisci ruoli | Rinomina un ruolo |
| `rolehoist <role>` | `rh` | Gestisci ruoli | Attiva o disattiva la visualizzazione separata del ruolo |
| `rolecolor <role> [color]` | `roleclr` | Nessuno per vedere, Gestisci ruoli per impostare | Mostra o imposta il colore di un ruolo |

I comandi `autobanrole` sono disponibili anche come comandi slash `/autobanrole list`, `add`, `remove` e `reason`.

### Permessi e impostazioni

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `dpo <command> [permission...]` | | Amministratore | Imposta o rimuove una sovrascrittura di permesso |
| `dpol` | `dpoli` | Amministratore | Elenca le sovrascritture |
| `dpor` | | Amministratore | Cancella tutte le sovrascritture |
| `staffrole [role]` | | Amministratore | Mostra o imposta il ruolo staff |
| `staffroledisable` | | Amministratore | Cancella il ruolo staff |
| `memberrole <role>` | | Amministratore | Mostra o imposta il ruolo membro |
| `delmsgoncmd [list, server, or channel <enable, disable, inherit> [#channel]]` | `dmc` | Amministratore | Mostra, attiva o sovrascrive l'eliminazione dei messaggi dei comandi |
| `gamevoicechannel` | `gvc` | Amministratore | Attiva o disattiva il tuo canale vocale attuale come canale vocale di gioco |
| `timezone [id]` | | Nessuno per vedere, Amministratore per impostare | Mostra o imposta il fuso orario del server |
| `timezones` | | Nessuno | Elenca gli ID dei fusi orari disponibili |
| `prefix [new]` | | Nessuno per vedere, Amministratore per impostare | Mostra o modifica il prefisso dei comandi |
| `languageset <name>` | `langset` | Amministratore | Imposta la lingua del server, oppure `default` |
| `langsetdefault [name]` | `langsetd` | Nessuno per vedere, Proprietario del bot per impostare | Mostra o imposta la lingua predefinita del bot |
| `languageslist` | `langli` | Nessuno | Elenca le lingue supportate |
| `guildstatsoptout` | `gstatsoptout` | Amministratore | Attiva o disattiva le statistiche dei comandi per questo server |
| `deleteguildstatsdata` | `delguildstatsdata` | Amministratore | Elimina le statistiche memorizzate, una volta all'ora |

### Operazioni di massa e utilità

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `banunder <time> [-p or -accage <time>]` | | Amministratore | Banna chiunque sia entrato entro il tempo indicato |
| `kickunder <time> [-p]` | | Amministratore | Espelle chiunque sia entrato entro il tempo indicato |
| `nameban <regex>` | `nban` | Amministratore | Banna i membri il cui nome utente corrisponde, con anteprima |
| `baninrole <role> [reason]` | | Amministratore | Banna chiunque abbia un ruolo |
| `banbyhash <avatarHash>` | `bbh` | Amministratore | Banna chiunque abbia un dato hash avatar |
| `prunemembers <time> [yes]` | `memberprune` | Amministratore | Elimina i membri inattivi da tanti giorni; `yes` include il ruolo membro |
| `setnick [user] <nickname>` | | Gestisci soprannomi | Cambia il soprannome di un membro, oppure quello del bot |
| `deafen <users...>` | `deaf` | Ensordire membri | Ensordisce il server |
| `undeafen <users...>` | `undef` | Ensordire membri | Annulla l'operazione |
| `creatxtchanl <name>` | `ctch` | Gestisci canali | Crea un canale di testo |
| `deltxtchanl <#channel>` | `dtch` | Gestisci canali | Elimina un canale di testo |
| `creatvoichanl <name>` | `cvch` | Gestisci canali | Crea un canale vocale |
| `delvoichanl <channel>` | `dvch` | Gestisci canali | Elimina un canale vocale |
| `settopic [topic]` | `st` | Gestisci canali | Imposta l'argomento del canale attuale |
| `setchanlname <name>` | `schn` | Gestisci canali | Rinomina il canale attuale |
| `renamechannel <channel> <name>` | `channelrename` | Gestisci canali | Rinomina qualsiasi canale |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Gestisci canali | Attiva o disattiva il flag NSFW sul canale attuale |
| `edit [#channel] <messageId> <text>` | | Gestisci messaggi in quel canale | Modifica uno dei messaggi del bot |
| `delete [#channel] <messageId> [time]` | `del` | Gestisci messaggi in quel canale | Elimina un messaggio subito o dopo un ritardo fino a sette giorni |
| `setguildavatar [url]` | `sgav`, `setgav` | Gestisci server | Imposta l'icona del server da un URL o un allegato |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Gestisci server | Imposta il banner del server |
| `setguildbio <text>` | `sgbio`, `setgbio` | Gestisci server | Imposta la descrizione del server |

Il ripristino del server è disponibile solo come comando slash: `/serverrecovery server-recover` e `/serverrecovery clear-server-recover`. La maggior parte degli altri comandi qui sopra ha anche equivalenti slash sotto `/protection`, `/administration`, `/channel`, `/purge-members`, `/delmsgoncmd`, `/voice`, `/perm-override` e `/roles`.

### Comandi di log e di benvenuto

Il modulo contiene anche i comandi di log (`log`, `logcategory`, `logevents`, `logignore`, `logignorelist`, `commandlogchannel`, tutti per Amministratore, più il gruppo slash `/log`) e i classici comandi di benvenuto (`greetdm`, `greetdmmsg`, `greetdmtest`, `bye`, `byemsg`, `byedel`, `byetest`, `leavehook`, `boost`, `boostmsg`, `boostdel`, `boosttest`, tutti per Gestisci server). Sono documentati negli articoli `logging` e `multigreets`.

## Suggerimenti e trappole

- Il ruolo del bot deve stare sopra qualsiasi ruolo che assegna, rimuove o banna, e servono i permessi Bannare membri, Espellere membri, Gestisci ruoli o Moderare membri in base alle punizioni scelte. Le azioni di mute richiedono un ruolo di mute, che il bot crea al primo utilizzo.
- I comandi accettano al massimo un giorno (`1d`) per le durate di Anti-Raid e Anti-Spam, e Timeout non può mai superare i 28 giorni.
- Anti-Spam conta solo le ripetizioni identiche. Un membro che invia rapidamente dieci messaggi diversi non è spam per lui; è per questo che esistono Anti-Post-di-Massa e Anti-Menzioni-di-Massa.
- Anti-Post-di-Massa con **Controlla solo i link** attivo ignora tutto ciò che non ha un link. Disattivalo per catturare il copia-incolla, a costo di più falsi positivi nei server affollati.
- Il controllo della creazione in blocco di Anti-Pattern scarica l'intera lista dei membri a ogni ingresso, il che è lento nei server molto grandi.
- Un'immagine bloccata aggiunta da un hash anziché dall'immagine stessa cattura solo copie esatte; aggiungila di nuovo dall'immagine per coprire le versioni specchiate e con bordo.
- Attivare una protezione dalla dashboard applica valori iniziali. Apri **Configura** e conferma l'azione, soprattutto prima di scegliere Ban.
- I comandi di assegnazione automatica, auto-assegnazione e ruoli di reazione rifiutano i ruoli uguali o superiori al tuo ruolo più alto, a meno che tu non sia il proprietario.
- I ruoli di reazione vengono persi se il messaggio viene eliminato; `reactionroleslist` mostra quali configurazioni puntano a un messaggio eliminato.
- La rinomina di massa tocca ogni membro che il bot può rinominare, incluso lo staff sotto il suo ruolo. Prevedi un piano per rinominarli di nuovo.
- `delete` e `edit` funzionano solo sui messaggi che il bot può vedere, e `edit` solo sui messaggi del bot stesso.

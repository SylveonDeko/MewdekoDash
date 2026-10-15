---
title: Trigger
slug: chat-triggers
summary: Risposte automatiche a messaggi, reazioni, comandi slash ed eventi del bot, con condizioni, costi, contatori, assegnazione di ruoli e un set completo di segnaposto.
icon: fa-comments
category: Actions
dashboard: /dashboard/chat-triggers
module: ChatTriggers
tags: [chat triggers, triggers, autoresponder, custom commands, auto reply, reaction roles, regex, counters, placeholders, event triggers, trigger chat, risposta automatica, comandi personalizzati, ruoli reazione, contatori, segnaposto, trigger evento]
related: [administration, xp, currency, tickets, giveaways]
---

## Cosa fa

Un trigger è un testo che il bot tiene d'occhio e una risposta che invia quando lo trova. Nella forma più semplice, un membro scrive `hello` e il bot risponde `hi there`. Da lì un trigger può corrispondere in qualsiasi punto di un messaggio o tramite espressione regolare, rispondere con un embed, reagire con emoji, inviare la risposta in DM, eliminare il messaggio del membro, assegnare o rimuovere ruoli, pubblicare una copia in un altro canale o webhook ed eseguire un secondo trigger al termine.

I trigger non devono per forza essere messaggi. Lo stesso trigger può essere registrato come comando slash, comando messaggio o comando utente, scattare quando qualcuno aggiunge o rimuove una specifica reazione oppure scattare su un evento del bot, come un salto di livello, l'ingresso di un membro, l'inizio di un boost, l'apertura di un ticket o la vittoria in un giveaway.

Ogni trigger ha le proprie condizioni: un cooldown per utente, canale o server, un livello XP richiesto, un costo o una ricompensa in valuta, orari e giorni attivi, una data di scadenza, un limite di utilizzi, un'età minima dell'account o un tempo minimo nel server, e un contatore che deve rientrare in un intervallo. Se una condizione non è soddisfatta, il trigger resta in silenzio oppure mostra un messaggio che hai scritto tu. Il tester della dashboard indica esattamente quale regola bloccherebbe un messaggio di esempio.

Le risposte possono leggere valori dal resto del bot: livello, saldo, reputazione o numero di messaggi del membro, il testo dopo il trigger, le persone menzionate, il messaggio a cui il membro ha risposto, i gruppi di cattura di una regex e contatori globali del server che una risposta può leggere e incrementare.

## Perché usarlo

- Rispondere automaticamente alle domande più comuni: `!rules` pubblica l'embed con il regolamento.
- Comandi divertenti che i membri possono usare gratis, senza il set di comandi integrato del bot.
- Un trigger in stile `daily` che paga valuta una volta al giorno per utente, usando un cooldown e una ricompensa.
- Una parola "verify" che assegna un ruolo ed elimina il messaggio.
- Ruoli reazione che assegnano un ruolo quando qualcuno reagisce con una certa emoji.
- Annunci personalizzati per salti di livello, benvenuti o boost, formattati come preferisci, attivati dall'evento invece che da un messaggio.
- Contatori in corso come "giorni dall'ultimo incidente" che chiunque può incrementare con una parola.

## Tipi di trigger

Un trigger ha un insieme di tipi attivi. Un tipo controlla che cosa può attivarlo. Message è attivo per impostazione predefinita; gli altri si abilitano per ogni trigger con `chattriggervalidtype` oppure con gli interruttori della dashboard.

| Tipo | Si attiva quando |
| --- | --- |
| Message | Un messaggio corrisponde al testo del trigger |
| Interaction | Qualcuno esegue il comando slash, messaggio o utente registrato per il trigger |
| Button | Viene premuto un componente pulsante il cui ID corrisponde al trigger |
| Reactions | Qualcuno aggiunge al messaggio l'emoji del trigger |
| ReactionsRemoved | Qualcuno rimuove dal messaggio l'emoji del trigger |
| Event | Si verifica uno degli eventi del bot elencati sotto |

### Corrispondenza dei messaggi

Per impostazione predefinita, l'intero messaggio, convertito in minuscolo, deve essere uguale al trigger. Due opzioni allentano questa regola:

- **Corrispondenza in qualsiasi punto del messaggio** (`ctca`): il trigger deve comparire come parola intera in un punto qualsiasi del messaggio.
- **Consenti di indirizzare qualcuno** (`ctat`): il messaggio può iniziare con il trigger seguito da uno spazio e altro testo, che diventa `%target%`.

I trigger **con espressione regolare** (`addchattriggerregex`) confrontano il messaggio con il pattern. Ogni pattern ha 100 millisecondi; quello che va in timeout viene saltato. I gruppi di cattura, con nome o numerati, sono disponibili nella risposta come `%regex.1%` o `%regex.name%`.

Un **requisito di prefisso** decide se il messaggio deve iniziare con un prefisso prima della corrispondenza:

| Opzione | Comportamento |
| --- | --- |
| Nessun prefisso richiesto | Confronta il testo semplice (predefinito) |
| Prefisso globale | Deve iniziare con il prefisso globale del bot |
| Prefisso del server, o globale | Deve iniziare con il prefisso del server, con ripiego su quello globale |
| Prefisso del server se impostato | Deve iniziare con il prefisso del server; non corrisponde mai se il server non ne ha uno |
| Un prefisso personalizzato | Deve iniziare con il prefisso impostato da `ctprefix` |

Se più trigger corrispondono a un messaggio, ne viene scelto uno a caso. I messaggi di bot e webhook vengono ignorati, a meno che un trigger non abbia attiva l'opzione **Solo bot** (`ctallowbots`); in questo caso risponde solo ai messaggi dei bot. Il bot non risponde mai ai propri messaggi.

### Trigger di interazione

`setctintertype` registra il trigger come comando applicazione Slash, Message o User. `setctintername` e `setctinterdesc` impostano nome e descrizione; i nomi devono rispettare le regole di denominazione dei comandi di Discord. `ctinterephemeral` rende la risposta visibile solo alla persona che ha eseguito il comando. `ctintererrors` elenca i motivi per cui la registrazione non è riuscita, come nomi duplicati o troppi sottocomandi.

### Trigger di reazione

`addreactiontrigger <emoji> <response>` crea un trigger il cui testo è l'emoji. Attiva come tipi **Reazione aggiunta** o **Reazione rimossa**. La risposta viene pubblicata nel canale del messaggio reagito, e l'assegnazione dei ruoli usa il membro che ha reagito (oppure, per **Persone menzionate**, le menzioni nel messaggio reagito). Le reazioni dei bot vengono ignorate.

### Trigger di evento

`ctevent <id> <event>` fa scattare un trigger su un evento invece che su un messaggio e attiva per lui il tipo Event. Eventi disponibili:

| Evento | Si attiva per |
| --- | --- |
| XpLevelUp | Un membro sale di livello |
| XpLevelDown | Un membro scende di livello |
| MemberJoin | Un membro entra |
| MemberLeave | Un membro esce |
| VoiceJoin | Un membro entra in un canale vocale |
| VoiceLeave | Un membro esce da un canale vocale |
| Boost | Un membro inizia a potenziare il server |
| BoostEnd | Un membro smette di potenziare il server |
| TicketOpened | Viene aperto un ticket |
| TicketClosed | Viene chiuso un ticket |
| GiveawayWon | Un membro vince un giveaway |

La risposta va al canale impostato con `cteventchannel`, oppure al canale in cui è avvenuto l'evento se non ne è impostato uno. Gli eventi di ingresso, uscita, vocali e boost non hanno un canale proprio, quindi per questi trigger serve un canale esplicito, altrimenti non fanno nulla. I trigger di evento passano attraverso le stesse condizioni e controlli di economia dei trigger di messaggio, e il membro a cui si riferisce l'evento viene trattato come utente per i segnaposto e per l'assegnazione dei ruoli.

## Risposte

La risposta principale è il testo indicato alla creazione del trigger. Passa dal parser degli embed, quindi può essere testo semplice, un embed, più embed o componenti costruiti nell'editor embed della dashboard. Risposte aggiuntive si possono aggiungere con `ctaddresponse`, e la **Modalità risposta** decide quali inviare:

| Modalità | Comportamento |
| --- | --- |
| Single | Invia sempre la prima risposta (predefinita) |
| Random | Ne sceglie una a caso; ripeti una riga per darle più peso |
| RoundRobin | In ordine, una per utilizzo, condivisa tra tutto il server |
| All | Tutte le risposte, in ordine |

Opzioni di consegna, tutte disattivate per impostazione predefinita:

- **Rispondi al messaggio** (`ctreply`): invia la risposta come risposta Discord.
- **Invia la risposta in DM** (`ctdm`): la invia privatamente al membro.
- **Elimina il messaggio che ha attivato il trigger** (`ctad`): rimuove ciò che il membro ha scritto.
- **Reagisci al messaggio invece** (`rtt`): mette l'emoji del trigger sul messaggio del membro invece che sulla risposta. Non può essere combinata con l'eliminazione.
- **Non inviare alcun messaggio** (`ctnr`): utile per trigger che servono solo ad assegnare ruoli.
- **Elimina la risposta dopo** (`ctdeleteafter`): secondi prima che la risposta del bot venga eliminata; 0 la mantiene.
- **Emoji con cui reagire** (`ctreact`): fino a sei emoji, aggiunte una al secondo. Senza emoji, l'elenco viene svuotato.

### Pubblicazione incrociata

`ctcpch` pubblica una copia di ogni risposta in un altro canale del server. `ctcpwh` la pubblica invece tramite un URL di webhook, che può trovarsi su un altro server. La pubblicazione incrociata avviene anche quando è attiva l'opzione **Non inviare alcun messaggio**.

### Ruoli

**Ruoli da assegnare** e **Ruoli da rimuovere** (`ctrgranttoggle`, `ctrremovetoggle`) vengono applicati quando il trigger scatta. Eseguire di nuovo l'interruttore per lo stesso ruolo lo rimuove dall'elenco. **Applica questi ruoli a** (`chattriggerrolegranttype`) sceglie il destinatario:

| Destinatario | Chi viene interessato |
| --- | --- |
| Sender | Il membro che ha attivato il trigger (predefinito) |
| Mentioned | Fino a cinque membri menzionati nel messaggio |
| Both | Il mittente più fino a quattro membri menzionati |

Quando il destinatario include le menzioni, queste vengono rimosse dal messaggio prima della corrispondenza, quindi `verify @someone` corrisponde comunque a un trigger `verify`.

### Concatenamento

`ctchain <id> <nextId>` esegue un secondo trigger quando il primo termina. Il secondo viene valutato in modo indipendente, comprese le sue condizioni e i suoi costi. Una catena si ferma dopo cinque passaggi e non rivisita mai un trigger già eseguito.

## Condizioni

Tutte queste condizioni vengono controllate prima di addebitare, inviare o conteggiare qualcosa. Una condizione non soddisfatta significa che il trigger non scatta in silenzio, tranne per i controlli su livello e valuta, che mostrano il **Messaggio quando non può usarlo** se lo imposti con `ctreqmsg`.

| Condizione | Comando | Predefinito | Comportamento |
| --- | --- | --- | --- |
| Cooldown | `ctcooldown <id> <seconds> [scope]` | nessuno | Blocca le esecuzioni ripetute per il numero di secondi indicato. Lo scope è `User`, `Channel` o `Guild` |
| Livello richiesto | `ctreqlevel <id> <level>` | 0 | Il livello XP del membro deve essere almeno questo |
| Costo | `ctcost <id> <amount>` | 0 | Valuta sottratta al membro; non scatta se non può pagare |
| Ricompensa | `ctreward <id> <amount>` | 0 | Valuta pagata al membro quando il trigger scatta |
| Ricompensa XP | `ctxpreward <id> <amount>` | 0 | XP concessi quando il trigger scatta |
| Orari attivi | `cttime <id> <HH:mm> <HH:mm> [days...]` | sempre | Scatta solo nella finestra indicata, nel fuso orario del server. Se la fine precede l'inizio, la finestra attraversa la notte. I giorni sono nomi oppure numeri da 0 a 6, con domenica come 0 |
| Scadenza | `ctexpiry <id> [duration]` | mai | Smette di scattare dopo la durata indicata a partire da ora, per esempio `7d` |
| Limite di utilizzi | `ctmaxuses <id> <uses>` | illimitato | Si ferma dopo quel numero di esecuzioni; 0 rimuove il limite |
| Età minima dell'account | `ctminage <id> [duration]` | nessuna | L'account deve avere almeno questa età |
| Tempo minimo nel server | `ctminmember <id> [duration]` | nessuno | Il membro deve essere entrato nel server da almeno questo tempo |
| Intervallo del contatore | `ctrequirecounter <id> <name> [min] [max]` | nessuno | Il contatore indicato deve rientrare nell'intervallo; `clear` come nome lo rimuove |

Il cooldown inizia solo quando tutte le altre condizioni sono soddisfatte, quindi un tentativo bloccato non lo consuma. Il costo viene prelevato prima che venga pagata la ricompensa, quindi un trigger che sia costo che pagamento non paga mai chi non può permettersi il costo. I cooldown globali dei comandi impostati con `cmdcd` si applicano anche ai trigger, per utente, in aggiunta al cooldown del singolo trigger.

## Contatori

I contatori sono numeri con nome, memorizzati per server. Vengono creati la prima volta che una risposta li usa e possono essere letti o modificati da qualsiasi risposta:

| Segnaposto | Effetto |
| --- | --- |
| `%counter:name%` | Mostra il contatore |
| `%counter:name+%` | Aggiunge uno e mostra il nuovo valore |
| `%counter:name-%` | Sottrae uno e mostra il nuovo valore |
| `%usercounter:name%` | Mostra il valore personale del membro che ha attivato il trigger per quel nome |
| `%usercounter:name+%` | Aggiunge uno al valore del membro |
| `%usercounter:name-%` | Sottrae uno dal valore del membro |

I nomi possono avere fino a 64 lettere, cifre, underscore o trattini e non distinguono maiuscole e minuscole. `ctcounters` li elenca, `ctcounterset` imposta un valore esatto e `ctcounterdelete` ne rimuove uno insieme a tutti i valori per utente con quel nome. La barra laterale della dashboard ha un pannello **Contatori** con le stesse funzioni.

## Segnaposto

Una risposta può usare il set generale di segnaposto (utente, server, canale, bot e segnaposto temporali dalla pagina dei segnaposto), i segnaposto dei trigger e quelli che altri moduli forniscono. `ctplaceholders` elenca in tempo reale quelli forniti da altri moduli.

| Segnaposto | Valore |
| --- | --- |
| `%target%` | Tutto ciò che viene scritto dopo il trigger (richiede **Consenti di indirizzare qualcuno** o la corrispondenza in qualsiasi punto) |
| `%targetuser%` | Menzione della prima persona menzionata nel messaggio |
| `%targetuser.id%`, `%targetuser.name%`, `%targetuser.avatar%` | ID, nome utente e avatar di quella persona |
| `%targetusers%`, `%targetusers.id%` | Tutte le persone menzionate, come menzioni o ID |
| `%replied.content%` | Contenuto del messaggio a cui il membro ha risposto |
| `%replied.author%`, `%replied.author.id%` | Autore di quel messaggio |
| `%usecount%` | Quante volte questo trigger è stato attivato |
| `%regex.1%`, `%regex.name%` | Gruppi di cattura di un trigger con espressione regolare |
| `%img:tag%` | Un'immagine casuale di Imgur per quel tag |
| `%rng%` | Un numero casuale dal set generale di segnaposto |
| `%xp.level%`, `%xp.rank%`, `%xp.total%`, `%xp.current%`, `%xp.required%`, `%xp.remaining%`, `%xp.bonus%` | Statistiche XP del membro |
| `%targetuser.xp.level%`, `%targetuser.xp.rank%`, `%targetuser.xp.total%` | Statistiche XP della persona menzionata |
| `%currency.balance%`, `%currency.bank%`, `%currency.total%`, `%currency.emote%` | Valuta del membro |
| `%targetuser.currency.balance%`, `%targetuser.currency.bank%` | Valuta della persona menzionata |
| `%rep%`, `%rep.rank%`, `%targetuser.rep%`, `%targetuser.rep.rank%` | Reputazione |
| `%messages%`, `%messages.channel%`, `%messages.server%`, `%targetuser.messages%` | Conteggio dei messaggi |
| `%invites%`, `%targetuser.invites%`, `%inviter%` | Conteggio degli inviti e chi ha invitato il membro |
| `%targetuser.afk%` | Il messaggio AFK della persona menzionata |
| `%counter:name%` e simili | Contatori, come sopra |

Le menzioni all'interno di `%target%` vengono neutralizzate, a meno che il membro non possa già menzionare tutti per conto proprio.

> [!EXAMPLE]
> Trigger `daily`, risposta `%user.mention% claimed today's bonus. Balance: %currency.balance%`, con `ctreward 12 100`, `ctcooldown 12 86400 User` e `ctreqmsg 12 Come back tomorrow.`

## Il tester

`cttest <id> <sample message>` oppure la casella **Testa questo trigger** su una scheda del trigger verifica se quel messaggio farebbe scattare il trigger come te, senza inviare, addebitare o conteggiare nulla. Indica se il testo corrisponde e, se il trigger non scatterebbe, quale regola lo blocca: disattivato, solo bot, nessuna corrispondenza, una voce dei permessi, una sovrascrittura dei permessi, scadenza, cooldown, contatore, limite di utilizzi, orari attivi, età dell'account, appartenenza, livello, saldo o cooldown globale del comando sul server.

## Categorie e organizzazione

`ctcategory <id> <name>` inserisce un trigger in una categoria. `ctcategorytoggle <name> <true or false>` abilita o disabilita in un colpo solo tutti i trigger di quella categoria, e la barra laterale della dashboard filtra per categoria. `cttoggle` mette in pausa un singolo trigger senza eliminarlo. `ctstats` mostra quante volte un trigger è scattato e chi lo ha attivato di recente.

`ctsexport` scarica tutti i trigger come file YAML, e `ctsimport` ne carica uno da un allegato o da un URL. `ctsclear` elimina tutti i trigger dopo una conferma.

## Impostazioni

Tutto è per trigger. La pagina Trigger ha una **Modalità semplice** con un modulo **Configurazione rapida** (testo del trigger più risposta) e una **Modalità avanzata** con **Creazione avanzata del trigger**, dove scegli il **Tipo di pattern** (Pattern di testo normale o Pattern con espressione regolare), i tipi di trigger, e puoi testare una regex prima di salvare.

Ogni scheda del trigger si espande per mostrare **Testo del trigger**, l'editor **Messaggio di risposta**, il tester e una fisarmonica di impostazioni raggruppate per argomento:

| Gruppo | Impostazioni |
| --- | --- |
| Quando corrisponde | Requisito di prefisso, Prefisso personalizzato, Corrispondenza in qualsiasi punto del messaggio, Consenti di indirizzare qualcuno, Solo proprietario del bot |
| Come risponde | Rispondi al messaggio, Invia la risposta in DM, Elimina il messaggio che ha attivato il trigger, Reagisci al messaggio invece, Non inviare alcun messaggio, Emoji con cui reagire, Elimina la risposta dopo, Risposte aggiuntive, Quando ci sono più risposte |
| Ruoli | Ruoli da assegnare, Ruoli da rimuovere, Applica questi ruoli a |
| Limiti | Cooldown (secondi), Il cooldown si applica a, Interrompi dopo questo numero di utilizzi, Smetti di scattare dopo, Età minima dell'account (minuti), Tempo minimo nel server (minuti), Attivo solo in certi orari con Da, A e In questi giorni |
| Costi e ricompense | Costa all'utente, Paga all'utente, Concede XP, Richiede livello, Messaggio quando non può usarlo |
| Requisito del contatore | Nome del contatore, Almeno, Al massimo |
| Attiva su un evento | Attiva quando, Rispondi in |
| Organizzazione | Categoria, Poi esegui il trigger, Rispondi ai bot invece che alle persone |

La barra laterale elenca le categorie, **Contatori** e l'elenco live dei **Segnaposto**, e ha una casella di ricerca per trigger e risposte.

## Procedura di configurazione

1. Apri **Attivatore** nella dashboard. In **Modalità semplice**, scrivi la parola del trigger e costruisci la risposta nell'editor, poi crea il trigger.
2. Espandi la nuova scheda. Sotto **Quando corrisponde**, attiva **Corrispondenza in qualsiasi punto del messaggio** se la parola deve funzionare anche a metà frase.
3. Sotto **Come risponde**, scegli se rispondere, inviare in DM o eliminare il messaggio del membro.
4. Sotto **Limiti**, imposta un cooldown perché non venga spammato.
5. Scrivi un messaggio di esempio in **Testa questo trigger** e premi **Testa**. Correggi ciò che viene indicato come bloccante.
6. Per un annuncio di salto di livello, crea un trigger con un testo qualsiasi, imposta **Attiva quando** su "Il membro sale di livello", lascia **Rispondi in** vuoto per pubblicare dove stava scrivendo il membro, e usa `%user.mention%` e `%xp.level%` nella risposta.
7. Assegna ai trigger correlati una **Categoria**, così potrai metterli in pausa insieme.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Gli ID dei trigger vengono mostrati da `listchattriggers`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `addchattrigger <trigger> <response>` | `act`, `acr` | Administrator | Crea un trigger; metti tra virgolette i trigger di più parole |
| `addchattriggerregex <pattern> <response>` | `actr` | Administrator | Crea un trigger con espressione regolare |
| `addreactiontrigger <emoji> <response>` | `addrt` | Administrator | Crea un trigger di reazione |
| `editchattrigger <id> <response>` | `ect` | Administrator | Sostituisce la risposta principale |
| `deletechattrigger <id>` | `dct` | Administrator | Elimina un trigger |
| `listchattriggers` | `lct` | Administrator | Elenca i trigger con gli ID |
| `listchattriggersgroup` | `lctg` | Administrator | Elenca i trigger raggruppati per testo |
| `showchattrigger <id>` | `sct` | Administrator | Mostra le impostazioni di un trigger |
| `cttoggle <id>` | `chattriggertoggle` | Administrator | Mette in pausa o riprende un trigger |
| `ctca <id>` | | Administrator | Attiva o disattiva la corrispondenza in qualsiasi punto |
| `ctat <id>` | | Administrator | Attiva o disattiva l'indirizzamento a qualcuno |
| `ctdm <id>` | | Administrator | Attiva o disattiva la risposta in DM |
| `ctad <id>` | | Administrator | Attiva o disattiva l'eliminazione del messaggio che ha attivato il trigger |
| `rtt <id>` | `reactottrigger` | Administrator | Attiva o disattiva la reazione al messaggio invece che alla risposta |
| `ctnr <id>` | `chattriggernoresponse` | Administrator | Attiva o disattiva l'invio di nessun messaggio |
| `ctreply <id>` | `chattriggerreply` | Administrator | Attiva o disattiva la risposta al messaggio |
| `ctdeleteafter <id> <seconds>` | `chattriggerdeleteafter` | Administrator | Elimina la risposta dopo un ritardo |
| `ctreact <id> [emoji...]` | `ctr` | Administrator | Imposta fino a sei reazioni, oppure le svuota |
| `ctaddresponse <id> <response>` | `chattriggeraddresponse` | Administrator | Aggiunge una risposta extra |
| `ctclearresponses <id>` | `chattriggerclearresponses` | Administrator | Rimuove le risposte extra |
| `ctresponsemode <id> <mode>` | `chattriggerresponsemode` | Administrator | `Single`, `Random`, `RoundRobin` o `All` |
| `ctprefixtype <id> <type>` | `chattriggersprefixtype` | Administrator | `None`, `Global`, `GuildOrGlobal`, `GuildOrNone` o `Custom` |
| `ctprefix <id> <prefix>` | `chattriggersprefix` | Administrator | Imposta il prefisso personalizzato |
| `chattriggervalidtype <id> <type> <true or false>` | `ctvalidtype`, `ctvt` | Administrator | Abilita o disabilita un tipo di trigger |
| `ctallowbots <id>` | `chattriggerallowbots` | Administrator | Attiva o disattiva la risposta solo ai messaggi dei bot |
| `ctrgranttoggle <id> @role` | `ctgt`, `ctgranttoggle` | Administrator | Attiva o disattiva un ruolo da assegnare |
| `ctrremovetoggle <id> @role` | `ctrt`, `ctremovetoggle` | Administrator | Attiva o disattiva un ruolo da rimuovere |
| `chattriggerrolegranttype <id> <type>` | `ctrolegranttype`, `ctrgt` | Administrator | `Sender`, `Mentioned` o `Both` |
| `chattriggerscrosspostchannel <id> <#channel>` | `ctcpch`, `ctcpchannel`, `ctcrosspostchannel`, `ctcrosspostch` | Administrator | Pubblica in incrocio su un canale |
| `chattriggerscrosspostwebhook <id> <url>` | `ctcpwh`, `ctcpwebhook`, `ctcrosspostwebhook`, `ctcrosspostwh` | Administrator | Pubblica in incrocio tramite un webhook |
| `setctintertype <id> <type>` | `ctitype`, `ctintertype` | Administrator | `None`, `Slash`, `Message` o `User` |
| `setctintername <id> <name>` | `ctiname`, `ctrealname` | Administrator | Nome del comando applicazione |
| `setctinterdesc <id> <description>` | `ctidesc`, `ctinterdesc` | Administrator | Descrizione del comando applicazione |
| `ctinterephemeral <id> <true or false>` | `ctieph` | Administrator | Risposta di interazione effimera |
| `ctintererrors` | `ctierrors`, `ctie` | Administrator | Mostra gli errori di registrazione dei comandi |
| `ctevent <id> <event>` | `chattriggerevent` | Administrator | Attiva su un evento, oppure `None` per fermarlo |
| `cteventchannel <id> [#channel]` | `chattriggereventchannel` | Administrator | Canale per le risposte agli eventi |
| `ctcooldown <id> <seconds> [scope]` | `chattriggercooldown` | Administrator | Cooldown per singolo trigger |
| `ctreqlevel <id> <level>` | `chattriggerrequiredlevel` | Administrator | Livello XP richiesto |
| `ctcost <id> <amount>` | `chattriggercost` | Administrator | Costo in valuta |
| `ctreward <id> <amount>` | `chattriggerreward` | Administrator | Ricompensa in valuta |
| `ctxpreward <id> <amount>` | `chattriggerxpreward` | Administrator | Ricompensa in XP |
| `ctreqmsg <id> [message]` | `chattriggerrequirementmessage` | Administrator | Messaggio quando un requisito non è soddisfatto |
| `cttime <id> <start> <end> [days...]` | `chattriggertime` | Administrator | Orari attivi, oppure `cttime <id> clear` |
| `ctexpiry <id> [duration]` | `chattriggerexpiry` | Administrator | Scadenza, oppure nessuna per rimuoverla |
| `ctmaxuses <id> <uses>` | `chattriggermaxuses` | Administrator | Limite di utilizzi, 0 per nessuno |
| `ctminage <id> [duration]` | `chattriggerminimumage` | Administrator | Età minima dell'account |
| `ctminmember <id> [duration]` | `chattriggerminimummembership` | Administrator | Tempo minimo nel server |
| `ctrequirecounter <id> <name> [min] [max]` | `chattriggerrequirecounter` | Administrator | Requisito con intervallo di contatore |
| `ctcounters` | `chattriggercounters` | Nobody | Elenca i contatori |
| `ctcounterset <name> <value>` | `chattriggercounterset` | Administrator | Imposta un contatore |
| `ctcounterdelete <name>` | `chattriggercounterdelete` | Administrator | Elimina un contatore |
| `ctplaceholders` | `chattriggerplaceholders` | Nobody | Elenca i segnaposto forniti da altri moduli |
| `ctcategory <id> [name]` | `chattriggercategory` | Administrator | Imposta o rimuove una categoria |
| `ctcategorytoggle <name> <true or false>` | `chattriggercategorytoggle` | Administrator | Abilita o disabilita una categoria |
| `ctchain <id> <nextId>` | `chattriggerchain` | Administrator | Concatena a un altro trigger, 0 per rimuovere |
| `cttest <id> <sample>` | `chattriggertest` | Administrator | Simula un messaggio di esempio |
| `ctstats <id>` | `chattriggerstats` | Administrator | Numero di attivazioni e utenti recenti |
| `ctsexport` | | Administrator | Esporta i trigger in YAML |
| `ctsimport [url]` | | Administrator | Importa da un URL o da un allegato |
| `ctsmigrate` | `ctsconvert` | Administrator | Converte il vecchio formato embed, con backup |
| `ctsclear` | | Administrator | Elimina tutti i trigger |
| `ctsreload` | | Bot owner | Ricarica i trigger dal database |

## Consigli e insidie

- I trigger vengono confrontati con il messaggio convertito in minuscolo, quindi il testo del trigger non distingue maiuscole e minuscole.
- Con **Corrispondenza in qualsiasi punto** disattivata, un trigger deve coincidere con l'intero messaggio. `hello there` non attiva un trigger `hello` a meno che non attivi l'opzione o l'indirizzamento.
- Assegnare ruoli richiede il permesso Gestisci ruoli e che il ruolo del bot sia più alto dei ruoli coinvolti. Il comando che aggiunge un ruolo alla lista verifica anche che tu possa gestirlo.
- I trigger solo bot non rispondono mai agli umani, e i trigger per umani non rispondono mai ai bot; un singolo trigger non può fare entrambe le cose.
- I cooldown vengono conservati in memoria e si azzerano al riavvio del bot. I limiti di utilizzo e le scadenze vengono salvati e sopravvivono ai riavvii.
- L'ordine round robin è condiviso da tutti i membri del server, non tracciato per singolo membro.
- Le voci dei permessi per il modulo `ActualChatTriggers` e qualsiasi `permoverride` per il testo del trigger vengono controllate prima delle condizioni del trigger stesso.
- I trigger di interazione registrano veri comandi applicazione, quindi si applicano i limiti di Discord sul numero e sui nomi dei comandi. Controlla `ctintererrors` quando un comando non compare.
- Le reazioni alla risposta vengono inviate una al secondo, quindi sei emoji impiegano sei secondi a comparire.
- I trigger di evento per ingressi, uscite, voce e boost non fanno nulla in silenzio finché non imposti **Rispondi in**.

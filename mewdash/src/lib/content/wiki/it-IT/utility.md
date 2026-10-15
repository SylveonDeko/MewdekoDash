---
title: Utilità
slug: utility
summary: Una cassetta degli attrezzi di strumenti quotidiani, dagli alias dei comandi a citazioni e promemoria, fino alla pubblicazione automatica, ai ruoli streaming, a un assistente IA, al conteggio dei messaggi e ai ripetitori.
icon: fa-wrench
category: Actions
dashboard: /dashboard/utility
module: Utility
tags: [alias, quotes, auto publish, stream role, ai, chatbot, nsfw filter, role monitor, reminder, snipe, repeater, sticky, message count, invites, embed, calculator, userinfo, serverinfo, citazioni, pubblicazione automatica, ruolo streaming, ia, filtro nsfw, monitor ruoli, promemoria, ripetitore, conteggio messaggi, inviti, calcolatrice]
related: [repeaters, polls, invites, messagestats, embedbuilder, xp, administration, moderation]
---

## Cosa fa

Utility è il modulo tuttofare per le piccole funzioni che quasi tutti i server finiscono per volere. I membri ottengono promemoria, citazioni, lanci di dadi, una calcolatrice, conversioni di unità e comandi informativi su utenti, ruoli, canali e server. Lo staff ottiene alias dei comandi, messaggi ripetuti, pubblicazione automatica per i canali annunci, un ruolo che segue i membri mentre fanno streaming, lo snipe dei messaggi eliminati, il conteggio dei messaggi e il tracciamento degli inviti.

La pagina **Utilità** della dashboard raccoglie le parti che beneficiano di un modulo: alias, citazioni, pubblicazione automatica, ruolo streaming, l'assistente IA, il filtro dei tag NSFW e il monitor dei ruoli. Tutto il resto si usa solo tramite comandi.

Poiché il modulo è ampio, ogni sottofunzione è descritta a parte. La tabella dei comandi alla fine elenca tutti i comandi del modulo.

## Perché usarlo

- Accorcia `play youtube` in `yt` per tutto il server con un alias.
- Tieni un libro di citazioni condiviso a cui i membri possono aggiungere e da cui estrarre righe a caso.
- Fai pubblicare automaticamente a tutti i follower ogni messaggio nel tuo canale annunci.
- Assegna a un membro il ruolo "Live" solo mentre sta facendo streaming di un gioco specifico.
- Pubblica regole o un avviso fisso ogni pochi minuti, oppure solo quando il canale è attivo.
- Lascia che i membri impostino promemoria per se stessi o per un canale.
- Usa un assistente IA in un canale con la tua chiave API.

## Alias

Un alias è una parola di attivazione che il bot riscrive in un altro comando prima di eseguirlo. `alias yt play youtube` significa che `.yt lofi` viene eseguito come `.play youtube lofi`. Il trigger deve essere la prima parola del messaggio; tutto ciò che segue viene aggiunto al comando associato. I trigger più lunghi vengono controllati per primi. Eseguire `alias <trigger>` senza associazione rimuove l'alias, mentre `aliasesclear` li rimuove tutti.

Nella dashboard, la scheda **Alias** ha i campi **Trigger alias** e **Associazione alias**, una casella di ricerca e un elenco da cui eliminare.

## Citazioni

Le citazioni sono brevi testi archiviati sotto una parola chiave. `quoteadd <keyword> <text>` ne salva una, `quoteprint <keyword>` (oppure `..`) mostra una citazione casuale per quella parola chiave, e `quoteshow <id>` mostra una citazione specifica. `quotesearch` cerca per parola chiave e testo, `quoteid` mostra chi ha aggiunto una citazione, e `listquotes` sfoglia le citazioni ordinate per parola chiave o per data di aggiunta. Chiunque può aggiungere citazioni. Una citazione può essere eliminata dal membro che l'ha aggiunta o da un amministratore; eliminare tutte le citazioni di una parola chiave, esportare in JSON e importare da un allegato JSON richiedono il permesso Amministratore.

La scheda **Citazioni** permette di aggiungere, modificare, cercare ed eliminare citazioni.

## Pubblicazione automatica

I canali annunci di Discord richiedono che ogni messaggio venga pubblicato manualmente. `addautopublish #channel` fa sì che il bot pubblichi ogni nuovo messaggio in quel canale. Per ogni canale ci sono due liste di esclusione che saltano i messaggi: `addpublishblacklist @user #channel` ignora un utente, e `addpublishblacklist #channel word` ignora qualsiasi messaggio che contenga quella parola, senza distinzione tra maiuscole e minuscole. `getautopublishes` mostra ogni canale con le sue liste di esclusione.

La scheda **Pubblicazione automatica** aggiunge i canali e gestisce gli elenchi **Salta i messaggi di questi utenti** e **Salta i messaggi che contengono queste parole**.

## Ruolo streaming

`streamrole <fromRole> <addRole>` assegna **addRole** a ogni membro di **fromRole** mentre sta facendo streaming, e lo rimuove quando smette. `streamrolekeyword <keyword>` limita il ruolo agli streaming il cui titolo contiene la parola chiave; eseguito senza parola chiave, la cancella. I membri nella whitelist ricevono il ruolo durante lo streaming anche se la parola chiave non corrisponde, mentre i membri nella blacklist non lo ricevono mai. `streamrole` senza argomenti disattiva la funzione. Se il bot perde il permesso di gestire il ruolo, o il ruolo viene eliminato, la funzione si disattiva da sola.

La scheda **Ruolo streaming** ha **Ruolo idoneo**, **Ruolo durante lo streaming**, **Parola chiave nel titolo dello streaming** e gli elenchi **Lista bianca** e **Lista nera** tramite ID utente.

## Assistente IA

L'assistente risponde a ogni messaggio pubblicato in un canale scelto, conservando per ciascun membro gli ultimi cinque scambi come contesto. Scrivere `deletesession` in quel canale cancella la tua conversazione.

| Impostazione | Comando | Cosa fa |
| --- | --- | --- |
| Canale | `aichannel [#channel] [enabled]` | L'unico canale in cui ascolta l'assistente |
| Fornitore e modello | `aimodel <OpenAi\|Groq\|Claude> [model]` | Quale API e quale modello chiamare |
| Chiave API | `aikey` | La tua chiave per quel fornitore; viene salvata dal bot e non viene più mostrata |
| Prompt di sistema | `aiprompt <text>` | Istruzioni che il modello segue |
| Ricerca web | `aiwebsearch <true\|false>` | Permette al modello di cercare sul web (solo Claude) |
| Webhook | `aiwebhook [name] [avatarUrl]` | Pubblica le risposte tramite un webhook con nome e avatar personalizzati |
| Embed personalizzato | `aicustomembed [template]` | Inserisce le risposte in un embed; `%airesponse%` indica dove va la risposta |

`aiconfig` mostra la configurazione attuale. La scheda **Assistente IA** ha **Assistente attivato**, **Canale**, **Fornitore**, **Modello**, **Chiave API**, **Prompt di sistema**, **Consenti ricerca web** e **Nascondi gli avvisi "ricerca sul web"**.

> [!WARNING]
> L'assistente usa la tua chiave API e addebita i costi a te. Se non è impostata una chiave, i messaggi nel canale ricevono una risposta di errore.

## Filtro NSFW

La scheda **Filtro NSFW** elenca i tag bloccati per le ricerche di immagini del modulo NSFW. Scrivi un tag in **Tag da bloccare** per aggiungerlo, oppure clicca su un tag per rimuoverlo. Il comando corrispondente è `nsfwtagbl [tag]` del modulo NSFW; senza tag mostra la blacklist attuale.

## Monitor dei ruoli

La scheda **Monitor ruoli** configura il monitor dei ruoli del modulo Gestione server, che reagisce quando viene assegnato un ruolo o un permesso che hai contrassegnato come protetto. Scegli una **Punizione predefinita** (solo ripristinare la modifica, avvisare, rimuovere tutti i ruoli, mutare, mettere in timeout, espellere o bannare), aggiungi ruoli e permessi da proteggere, ed elenca i **Ruoli fidati** e i **Membri fidati** che sono esentati. I comandi (`addblacklistedrole`, `addblacklistedpermission`, `whitelistuser`, `whitelistrole`, `setdefaultpunishment`, `listblacklists`) sono riservati al proprietario del server e si trovano in Gestione server.

## Promemoria

`remind me <time> <message>` ti invia un messaggio privato più tardi; `remind here <time> <message>` pubblica nel canale attuale; `remind #channel <time> <message>` punta a un altro canale e richiede il permesso Gestisci messaggi. Il tempo si scrive come `2h30m`, `3 days`, `1w` o `in 45 minutes`, e può essere al massimo a 60 giorni di distanza. `remindlist` mostra i tuoi promemoria con i numeri di indice e `reminddelete <index>` ne rimuove uno. Le menzioni nel messaggio vengono neutralizzate, a meno che tu non possa menzionare tutti in quel canale.

## Snipe

Lo snipe è disattivato finché un amministratore non esegue `snipeset enable`. Una volta attivo, il bot conserva i messaggi eliminati e modificati per 30 giorni. `snipe [#channel] [@user]` mostra l'ultimo messaggio eliminato, `editsnipe` l'ultima modifica, e `snipelist` e `editsnipelist` mostrano gli ultimi cinque (o un numero che indichi), filtrati per canale o utente.

## Ripetitori

Un ripetitore pubblica un messaggio secondo una pianificazione. `repeat <message>` usa un intervallo di cinque minuti; `repeat <interval> <message>` ne imposta uno tra 5 secondi e 25000 minuti; `repeat <time of day> <message>` viene eseguito una volta al giorno. Ogni ripetitore ha un indice mostrato da `repeatlist`.

| Modalità di attivazione | Comportamento |
| --- | --- |
| `timeinterval` | Pubblica a ogni intervallo (predefinito) |
| `onactivity` | Pubblica dopo che il canale ha ricevuto un numero di messaggi impostato entro una finestra di tempo (`repeatactivity`) |
| `onnoactivity` | Pubblica quando il canale è stato silenzioso per la finestra di tempo |
| `immediate` | Pubblica subito, poi segue l'intervallo |
| `aftermessages` | Pubblica dopo un numero impostato di messaggi |

Altre opzioni per ogni ripetitore: `repeatredun` evita di pubblicare se il messaggio del ripetitore è già l'ultimo nel canale; `repeatschedule <business\|evening\|weekend\|custom>` limita quando viene eseguito; `repeatconversation` attiva o disattiva il rilevamento delle conversazioni; `repeatpriority` ordina i ripetitori da 0 a 100; `repeatthreadonly` e `repeatthreadautosticky` puntano ai thread; `repeatforumtags` limita i post dei forum per tag; `repeatsuppressnotifications` invia in silenzio; `repeattoggle` mette in pausa.

## Conteggio messaggi e inviti

`togglemsgcount` attiva il conteggio dei messaggi. `usermessages`, `channelmessages`, `servermessages` e `topusers` mostrano i conteggi, `activitygraph` disegna le ore o i giorni più attivi, e `minmsglength` ignora i messaggi più corti di una certa lunghezza. `resetmessagecounts` azzera i conteggi per un utente, per un canale o per entrambi, dopo conferma.

Il tracciamento degli inviti registra chi ha invitato ogni membro. `invites`, `whoinvited`, `invitedusers` e `inviteleaderboard` leggono i dati. `toggleinvitetracking`, `toggleremoveinviteonleave` e `setminaccountage <days>` lo controllano; gli account più giovani dell'età minima non vengono conteggiati.

## Impostazioni

La pagina della dashboard è divisa in schede: **Alias**, **Citazioni**, **Pubblicazione automatica**, **Ruolo streaming**, **Assistente IA**, **Filtro NSFW** e **Monitor ruoli**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Trigger e associazione alias | nessuno | Parola da riscrivere e comando in cui diventa |
| Parola chiave e testo della citazione | nessuno | Una citazione salvata |
| Canali di pubblicazione automatica | nessuno | Canali annunci in cui il bot pubblica |
| Salta i messaggi di questi utenti / che contengono queste parole | nessuno | Liste di esclusione della pubblicazione per canale |
| Ruolo idoneo | nessuno | Membri che possono ricevere il ruolo streaming |
| Ruolo durante lo streaming | nessuno | Il ruolo aggiunto e rimosso |
| Parola chiave nel titolo dello streaming | qualsiasi streaming | Contano solo gli streaming il cui titolo contiene questo testo |
| Assistente attivato | disattivato | Se il canale IA risponde |
| Fornitore, Modello, Chiave API, Prompt di sistema | nessuno | Configurazione IA |
| Consenti ricerca web | disattivato | Ricerca web di Claude |
| Nascondi gli avvisi "ricerca sul web" | attivato | Nasconde i messaggi di stato della ricerca web del modello |
| Tag bloccati | nessuno | Tag di ricerca NSFW che vengono filtrati |
| Punizione predefinita | usa il predefinito | Azione del monitor dei ruoli |

Snipe, conteggio dei messaggi, tracciamento degli inviti, ripetitori, promemoria e anteprime dei link non hanno controlli nella dashboard.

## Procedura di configurazione

1. Apri **Utilità** nella dashboard.
2. Nella scheda **Alias**, aggiungi un trigger come `yt` associato a `play youtube`. Provalo su Discord.
3. Nella scheda **Pubblicazione automatica**, aggiungi il tuo canale annunci. Aggiungi eventuali utenti bot o webhook alla lista di esclusione.
4. Nella scheda **Ruolo streaming**, scegli il ruolo idoneo e il ruolo da aggiungere, e facoltativamente una parola chiave nel titolo. Controlla che il ruolo del bot sia sopra il ruolo che aggiunge.
5. Nella scheda **Assistente IA**, scegli un canale, un fornitore e un modello, incolla la tua chiave, scrivi un prompt di sistema e attivalo.
6. Su Discord, esegui `snipeset enable` se vuoi lo snipe dei messaggi eliminati e `togglemsgcount` per le statistiche dei messaggi.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `alias <trigger> [mapping]` | `cmdmap` | Amministratore | Aggiunge un alias, o lo rimuove senza associazione |
| `aliaslist` | `cmdmaplist`, `aliases` | Nessuno | Elenca gli alias |
| `aliasesclear` | `aliasclear` | Amministratore | Rimuove tutti gli alias |
| `quoteadd <keyword> <text>` | `.` | Nessuno | Aggiunge una citazione |
| `quoteprint <keyword>` | `..` | Nessuno | Citazione casuale per una parola chiave |
| `quoteshow <id>` | | Nessuno | Mostra una citazione tramite ID |
| `quotesearch <keyword> <text>` | `qsearch` | Nessuno | Trova una citazione per parola chiave e testo |
| `quoteid <id>` | `qid` | Nessuno | Chi ha aggiunto una citazione |
| `listquotes [page] [order]` | `liqu` | Nessuno | Sfoglia le citazioni |
| `quotedelete <id>` | `qdel` | Nessuno (solo le proprie citazioni) oppure Amministratore | Elimina una citazione |
| `delallquotes <keyword>` | `daq`, `delallq` | Amministratore | Elimina tutte le citazioni di una parola chiave |
| `quoteexport` | `qexport` | Amministratore | Esporta le citazioni in JSON |
| `quoteimport` | `qimport` | Amministratore | Importa le citazioni da un file JSON allegato |
| `addautopublish <#channel>` | `addautopub`, `aap` | Amministratore | Pubblica automaticamente in un canale notizie |
| `removeautopublish <#channel>` | `removeautopub` | Amministratore | Interrompe la pubblicazione automatica |
| `addpublishblacklist <@user> <#channel>` oppure `<#channel> <word>` | `addpubbl` | Amministratore | Salta un utente o una parola |
| `removepublishblacklist <@user> <#channel>` oppure `<#channel> <word>` | `removepubbl` | Amministratore | Rimuove un'esclusione |
| `getautopublishes` | `getaps` | Amministratore | Elenca i canali con pubblicazione automatica |
| `streamrole [fromRole] [addRole]` | | Gestisci ruoli | Imposta il ruolo streaming, oppure lo disattiva senza ruoli |
| `streamrolekeyword [keyword]` | `srkw` | Gestisci ruoli | Richiede una parola chiave nel titolo dello streaming |
| `streamroleblacklist <add\|remove> <@user>` | `srbl` | Gestisci ruoli | Non assegna mai il ruolo a questo membro |
| `streamrolewhitelist <add\|remove> <@user>` | `srwl` | Gestisci ruoli | Assegna sempre il ruolo a questo membro durante lo streaming |
| `aichannel [#channel] [enabled]` | `aic` | Gestisci server | Imposta il canale IA |
| `aimodel <provider> [model]` | `aim` | Gestisci server | Fornitore e modello |
| `aikey` | `ak` | Amministratore | Imposta la chiave API |
| `aiprompt <text>` | `aip` | Gestisci server | Prompt di sistema |
| `aiwebsearch <true\|false>` | `aws` | Gestisci server | Ricerca web di Claude |
| `aiwebhook [name] [avatar]` | `aiw` | Amministratore | Risponde tramite un webhook, oppure lo disattiva senza nome |
| `aicustomembed [template]` | `aice` | Amministratore | Template embed per le risposte |
| `aiconfig` | `ac` | Nessuno | Mostra le impostazioni IA |
| `remind <me\|here> <time> <message>` | | Nessuno | Imposta un promemoria |
| `remind <#channel> <time> <message>` | | Gestisci messaggi | Promemoria in un altro canale |
| `remindlist` | `remindl`, `remindlst` | Nessuno | I tuoi promemoria |
| `reminddelete <index>` | `remindrm`, `reminddel` | Nessuno | Elimina un promemoria |
| `snipeset <enable\|disable>` | `setsnipe` | Amministratore | Attiva o disattiva lo snipe |
| `snipe [#channel] [@user]` | | Nessuno | Ultimo messaggio eliminato |
| `editsnipe [#channel] [@user]` | | Nessuno | Ultimo messaggio modificato |
| `snipelist [#channel] [@user] [amount]` | `slist` | Nessuno | Messaggi eliminati recenti |
| `editsnipelist [#channel] [@user] [amount]` | `esnipelist` | Nessuno | Messaggi modificati recenti |
| `repeat [time] [interval] <message>` | | Gestisci messaggi | Crea un ripetitore |
| `repeatlist` | `replst`, `replist`, `repli` | Gestisci messaggi | Elenca i ripetitori |
| `repeatremove <index>` | `reprm` | Gestisci messaggi | Elimina un ripetitore |
| `repeatinvoke <index>` | `repinv` | Gestisci messaggi | Pubblica subito |
| `repeatmessage <index> <message>` | `repmsg` | Gestisci messaggi | Cambia il testo |
| `repeatchannel <index> [#channel]` | `repchan` | Gestisci messaggi | Sposta il ripetitore |
| `repeatredun <index>` | `repred` | Gestisci messaggi | Attiva o disattiva il controllo di ridondanza |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Gestisci messaggi | Modalità di attivazione dalla tabella sopra |
| `repeatactivity <index> <messages> <window>` | `repactivity`, `repact` | Gestisci messaggi | Soglia di attività |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Gestisci messaggi | Priorità |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Gestisci messaggi | Pianificazione per orario |
| `repeatconversation <index>` | `repconversation`, `repconv` | Gestisci messaggi | Attiva o disattiva il rilevamento delle conversazioni |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Gestisci messaggi | Mette in pausa o riprende |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Gestisci messaggi | Fissa nei nuovi thread |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Gestisci messaggi | Pubblica solo nei thread |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Gestisci messaggi | Invia in silenzio |
| `repeatforumtags <index> <action> [tagType] [tags]` | `repforumtags`, `repftags` | Gestisci messaggi | Regole dei tag del forum |
| `togglemsgcount` | `togglemessagecount` | Amministratore | Attiva o disattiva il conteggio dei messaggi |
| `minmsglength [length]` | `mmlength`, `minmlength` | Gestisci server | Ignora i messaggi brevi |
| `usermessages [@user]` | `usermsg`, `umsg` | Nessuno | Statistiche messaggi di un membro |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Nessuno | Statistiche messaggi di un canale |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg`, `gmsg` | Nessuno | Statistiche a livello di server |
| `topusers` | `topu` | Nessuno | I primi dieci per numero di messaggi |
| `activitygraph [days\|hours]` | `actgraph` | Nessuno | Grafico degli orari più attivi |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Gestisci messaggi | Azzera i conteggi |
| `invites [@user]` | | Nessuno | Numero di inviti |
| `whoinvited [@user]` | `invitedby` | Nessuno | Chi ha invitato un membro |
| `invitedusers [@user]` | `userinvites` | Nessuno | Membri invitati da qualcuno |
| `inviteleaderboard` | `inviteslb` | Nessuno | Principali invitanti |
| `invitesettings` | `inviteconfig` | Gestisci server | Mostra le impostazioni degli inviti |
| `toggleinvitetracking` | | Gestisci server | Attiva o disattiva il tracciamento |
| `toggleremoveinviteonleave` | `triol` | Gestisci server | Non conteggia più gli inviti quando l'invitato esce |
| `setminaccountage <days>` | `inviteminage` | Gestisci server | Ignora gli account giovani |
| `joinstats` | `jstats` | Flag beta (`dragon`) | Grafico degli ingressi |
| `leavestats` | `lstats` | Flag beta (`dragon`) | Grafico delle uscite |
| `joinstatscolor [r g b]` | `jstatscolor` | Flag beta (`dragon`) | Colore del grafico degli ingressi, oro senza valori |
| `leavestatscolor [r g b]` | `lstatscolor` | Flag beta (`dragon`) | Colore del grafico delle uscite, oro senza valori |
| `userinfo [@user]` | `uinfo` | Nessuno | Dettagli del membro |
| `serverinfo [name]` | `sinfo` | Nessuno | Dettagli del server |
| `channelinfo [#channel]` | `cinfo` | Nessuno | Dettagli del canale di testo |
| `vinfo [channel]` | `voiceinfo` | Nessuno | Dettagli del canale vocale |
| `rinfo <role>` | `roleinfo` | Nessuno | Dettagli del ruolo |
| `fetch <id>` | | Nessuno | Cerca qualsiasi utente tramite ID |
| `avatar [@user]` | `av` | Nessuno | Avatar, con un pulsante per l'avatar del server |
| `banner [@user]` | `userbanner` | Nessuno | Banner dell'utente |
| `userid [@user]` | `uid` | Nessuno | ID utente |
| `roleid <role>` | `rid` | Nessuno | ID del ruolo |
| `channelid` | `cid` | Nessuno | ID del canale |
| `serverid` | `sid` | Nessuno | ID del server |
| `roles [@user]` | | Nessuno | Ruoli del server, o i ruoli di un membro |
| `inrole <role>` | | Nessuno | Membri con un ruolo |
| `inroles <role> <role>` | | Nessuno | Membri con entrambi i ruoli |
| `rolepermlist [and\|or] <permissions...>` | `roleperms` | Nessuno | Ruoli che hanno i permessi |
| `channeltopic [#channel]` | `ct` | Nessuno | Argomento del canale |
| `whosplaying <game>` | `whpl` | Nessuno | Membri che giocano a un gioco |
| `emotelist [type]` | | Nessuno | Emoji del server |
| `showemojis <emojis>` | `se` | Nessuno | Ingrandisce le emoji |
| `say [#channel] <text or embed JSON>` | | Gestisci messaggi | Parla come il bot |
| `getjson <messageId> [#channel]` | | Gestisci messaggi | JSON dell'embed di un messaggio |
| `embedsave <name> <json>` | `esave` | Nessuno | Salva un template embed personale |
| `guildembedsave <name> <json>` | `gesave`, `gembedsave` | Gestisci messaggi | Salva un template embed del server |
| `embedlist` / `guildembedlist` | `elist` / `gelist`, `gembedlist` | Nessuno | Elenca i template |
| `embeddelete <name>` / `guildembeddelete <name>` | `edel`, `edelete` / `gedel`, `gembeddelete` | Nessuno / Gestisci messaggi | Elimina un template |
| `embedpreview <name>` | `epreview`, `eprev` | Nessuno | Anteprima di un template |
| `debugembed <text>` | `embeddebug` | Amministratore | Testa l'analisi degli embed |
| `savechat <time> [#channel]` | | Gestisci messaggi | Salva un registro della chat e ottieni un link |
| `calculate <expression>` | `calc` | Nessuno | Valuta un'espressione matematica |
| `calcops` | | Nessuno | Operazioni matematiche disponibili |
| `plot <function> [start] [end]` | `graphfunction` | Nessuno | Grafica una funzione |
| `sym <expression>` | `symbolicmath` | Nessuno | Calcolo simbolico |
| `convertunits <from> <to> <value>` | `unitconvert`, `units` | Nessuno | Conversione di unità |
| `convertlist` | | Nessuno | Unità supportate |
| `convert <format>` | | Nessuno | Converte un file multimediale allegato |
| `roll <dice>` | | Nessuno | Lancia i dadi, con notazione DnD supportata |
| `owoify <text>` | `owo` | Nessuno | Trasforma il testo in stile OwO |
| `vcheck [url]` | `viruscheck` | Nessuno | Scansione VirusTotal di un link |
| `traceroute <host>` | `tracert`, `trcrt` | Nessuno | Traccia il percorso verso un host |
| `pingip <ip> [count]` | | Nessuno | Invia ping a un indirizzo, fino a 10 volte |
| `previewlinks <yes\|no>` | `plinks` | Amministratore | Attiva o disattiva le anteprime dei link |
| `verboseerror [true\|false]` | `ve` | Gestisci messaggi | Attiva o disattiva gli errori dettagliati dei comandi |
| `ping` | | Nessuno | Latenza del bot |
| `stats` | | Nessuno | Statistiche del bot |
| `invite` | | Nessuno | Link di invito e supporto del bot |
| `vote` | | Nessuno | Link per votare |

## Suggerimenti e insidie

- Un alias riscrive solo il testo; il comando associato viene comunque eseguito con i propri controlli dei permessi.
- La pubblicazione automatica funziona solo nei canali annunci (notizie) di Discord.
- Il ruolo streaming richiede che il ruolo del bot sia sopra il ruolo che aggiunge. Se non può gestire il ruolo, la funzione si disattiva da sola invece di fallire silenziosamente a ogni streaming.
- Lo snipe è disattivato per impostazione predefinita, e gli snipe più vecchi di 30 giorni vengono eliminati.
- I promemoria più lunghi di 60 giorni vengono rifiutati.
- L'assistente IA risponde solo nell'unico canale configurato e ignora i bot. La sua memoria sono gli ultimi cinque messaggi per membro, quindi le conversazioni lunghe perdono il contesto iniziale.
- Il conteggio dei messaggi deve essere attivato prima che esistano statistiche; nulla viene conteggiato retroattivamente.
- `joinstats` e `leavestats` possono essere eseguiti una volta ogni dieci secondi.

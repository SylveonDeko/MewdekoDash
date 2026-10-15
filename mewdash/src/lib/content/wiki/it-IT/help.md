---
title: Aiuto e comandi
slug: help
summary: Come trovare e capire i comandi del bot da Discord: il menu di aiuto per categoria, le panoramiche dei moduli, le pagine di aiuto per ogni comando, la ricerca dei comandi e la procedura guidata della dashboard a cui il bot rimanda quando entra in un server.
icon: fa-life-ring
category: General
module: Help
tags: [help, commands, modules, search command, slash commands, prefix, setup wizard, invite, guide, source, donate, vote, aiuto, comandi, moduli, ricerca comando, comandi slash, prefisso, procedura guidata, invito, guida, sorgente, dona, vota]
related: [permissions, administration, userprofile]
---

## Cosa fa

Il modulo Help è il modo in cui i membri scoprono cosa sa fare il bot. `help` (o `cmds`) apre un menu che elenca le categorie di comandi con il numero di moduli e di comandi per ciascuna, più un menu a tendina per aprirne una. Scegliendo una categoria si vedono i suoi moduli; scegliendo un modulo si vedono i suoi comandi, dieci per pagina con una breve descrizione, oppure, per i moduli molto grandi, una panoramica divisa in sezioni.

`help <command>` mostra un singolo comando: nome e primo alias, cosa fa, i permessi Discord che ti servono e quelli che servono al bot, un cooldown se ne ha uno, il comando slash corrispondente, ogni parametro, le forme alternative, esempi d'uso e un link alla documentazione. Il pulsante **Esegui** ti permette di eseguire il comando direttamente dalla pagina di aiuto, aprendo un modulo per gli argomenti se ne servono.

`searchcommand <term>` trova i comandi il cui nome o la cui descrizione contiene il termine. Se menzioni il bot senza testo, risponde con il prefisso attuale e un rimando a `cmds`.

Ogni comando esiste in versione testuale, usata con il prefisso del server, e nella maggior parte dei casi in versione slash. Il menu di aiuto e le pagine dei comandi sono gli stessi in entrambi i casi; `/help`, `/search` e `/invite` sono i punti d'accesso slash.

## Perché usarlo

- Un nuovo membro scrive `.help` e ha un posto sensato dove andare.
- Lo staff vuole sapere esattamente quale permesso serve a un comando prima di concederlo.
- Qualcuno ricorda solo metà del nome di un comando e vuole cercarlo.
- Hai appena invitato il bot e vuoi una configurazione guidata invece di leggere la documentazione di ogni modulo.

## Il menu di aiuto

`help`, `commands` o `modules` senza argomenti aprono il livello principale. La descrizione dell'embed spiega i due modi per entrare: scegliere una categoria dal menu a tendina, oppure usare `h commandname` per un singolo comando. Contiene anche link alla documentazione, al server di supporto, alla pagina di invito e alle donazioni.

| Categoria | Contiene |
| --- | --- |
| Moderation & Admin | Administration, Moderation, Permissions, Server Management, Role States, Status Roles, Counting Moderation |
| Server Setup | MultiGreets, Role Greets, Starboard, Stat Channels, Suggestions, Tickets, Confessions, Channel Access, Custom Voice, Chat Triggers, Polls, Giveaways |
| Fun & Games | Games, Counting, NSFW, Searches, Minecraft, Switch |
| Economy & Levels | Currency, XP, Reputation, Vote, Patreon |
| Music | Music |
| Utility | Utility, Help, AFK, Todo, User Profile, Birthday, Highlights, Copr Monitoring |
| Bot Owner | Moduli riservati al proprietario del bot |
| Other | Tutto ciò che non è classificato sopra |

Un pulsante **Toggle descriptions** passa dall'elenco compatto a un layout più lungo che mostra ogni modulo sotto la sua categoria, con un segno di spunta o una croce che indica se è attivo per te nel canale corrente. Un globo con una croce significa che i proprietari del bot hanno disattivato il modulo ovunque.

### Pagine dei moduli

`commands <module>` porta direttamente a un modulo. Il nome può essere esatto oppure un prefisso univoco, quindi `cmds mod` apre Moderation mentre `cmds s` segnala che più moduli corrispondono. Aggiungi una parola dopo il modulo per filtrare: `cmds utility remind` elenca solo i comandi di Utility il cui nome o la cui descrizione contiene "remind".

I moduli con più di 30 comandi e almeno tre sezioni mostrano prima una panoramica: la descrizione del modulo, un campo per ogni sezione con il numero di comandi, un menu a tendina per aprire una sezione, un pulsante **All commands**, un pulsante **Cerca** che apre un modulo, e **Indietro**. I moduli più piccoli vanno direttamente all'elenco paginato. Le pagine contengono dieci comandi raggruppati per sezione, con i pulsanti prima, precedente, salta, successivo, ultima, indietro e chiudi. Il paginatore resta attivo per un'ora.

## Pagine dei comandi

`help <command>` corrisponde al nome esatto o a un alias qualsiasi. L'embed contiene:

- Il comando con il suo prefisso e il primo alias, e la sua descrizione.
- **User Permissions**: ciò che ti serve. Quando un'eccezione ai permessi Discord configurata nel modulo Administration sostituisce il requisito predefinito, il requisito originale viene mostrato barrato e l'eccezione compare dopo.
- **Bot Permissions**: ciò che serve al bot.
- **Documentation**: un link alla pagina del comando sul sito della documentazione.
- **Pausa**: mostrato solo se il comando ne ha uno.
- **Slash Command**: una menzione cliccabile della versione slash, quando esiste.
- **Parameters**, **Overloads** e **Utilizzo** dalla documentazione del comando, con ogni argomento, se è facoltativo e l'eventuale valore predefinito.
- Un piè di pagina con il modulo, il sottomodulo e il nome del metodo, utile quando si segnalano bug.

Il pulsante **Esegui** esegue il comando come se lo avessi scritto tu. Se richiede argomenti, prima compare un modulo per inserirli. Gli amministratori vedono anche un pulsante **Permessi** che apre il menu rapido dei permessi del comando, descritto nell'articolo sui permessi dei comandi.

## Comandi slash e testuali

I comandi testuali usano il prefisso del server, `.` per impostazione predefinita, e i nomi esatti del menu di aiuto. I comandi slash sono raggruppati, quindi un comando testuale come `setprivacy` appare come `/setprivacy`, mentre i comandi dei permessi stanno sotto `/permissions servercommand`. La pagina del comando mostra la menzione slash in modo che tu possa cliccarla. Entrambe le forme seguono le stesse regole sui permessi.

## Quando il bot entra

Quando il bot viene aggiunto a un server, cerca chi lo ha invitato nel registro di audit (serve il permesso Visualizza audit log) e gli invia un messaggio privato. Il messaggio ha un pulsante **Set Up Mewdeko** che rimanda alla procedura guidata della dashboard per quel server, un promemoria in tre passi con `cmds`, `cmds mod` e `h purge`, e il link al server di supporto. Se chi ha invitato il bot non può essere identificato o ha i messaggi privati chiusi, non viene inviato nulla; non c'è nessun annuncio in un canale.

## La procedura guidata

La procedura guidata si trova a `/wizard?guild=<id>` nella dashboard. Il link nel messaggio privato di benvenuto apre la versione di configurazione rapida; la dashboard stessa può proporre la versione per la prima configurazione, che aggiunge all'inizio un controllo dei permessi.

| Passaggio | Cosa fa |
| --- | --- |
| Welcome | Spiega cosa sta per succedere |
| Permissions | Solo per la prima configurazione: verifica che il bot abbia ciò che gli serve |
| Server Basics | Prefisso, lingua del bot e fuso orario del server |
| Select Features | Scegli cosa configurare; le funzionalità sono contrassegnate come configurazione completa o attivazione rapida |
| Una fase per ogni funzionalità a configurazione completa | Configurazione guidata di quella funzionalità |
| Quick Setup | Attiva in blocco le funzionalità rimanenti con i loro valori predefiniti |
| Complete | Riepilogo, incluso ciò che non è stato salvato |

I progressi vengono salvati per ogni server, quindi se esci e torni riprendi da dove eri. Un server può essere segnato come saltato, così la procedura guidata smette di proporsi, e la pagina **Le mie impostazioni** ha un interruttore per indicare se preferisci la configurazione guidata e un ripristino dello stato della procedura per un server.

## Impostazioni

Non c'è nulla da configurare per l'aiuto in sé. Il prefisso si imposta con il modulo Administration ed è mostrato in ogni embed di aiuto.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Prefix | `.` | Il prefisso mostrato nei testi di aiuto e usato dal pulsante Run |
| Verbose permissions | disattivato | Se un comando bloccato spiega quale regola dei permessi lo ha bloccato (vedi Command Permissions) |

## Procedura di configurazione

1. Esegui `help` e apri una categoria dal menu a tendina per vedere come sono raggruppati i moduli.
2. Esegui `cmds mod` per vedere il modulo Moderation, poi `h purge` per vedere un comando per intero.
3. Prova il pulsante **Esegui** su un comando innocuo come `h ping`.
4. Esegui `searchcommand role` per vedere come la ricerca restringe i risultati.
5. Se hai appena invitato il bot, segui il link **Set Up Mewdeko** dal messaggio privato di benvenuto, oppure apri `/wizard?guild=<your server id>` nella dashboard.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `help [command]` | `h` | Nessuno | Menu di aiuto, oppure aiuto per un singolo comando |
| `commands [module] [term]` | `cmds` | Nessuno | Elenco dei moduli, i comandi di un modulo, oppure un elenco filtrato |
| `modules` | `mdls` | Nessuno | Lo stesso menu principale di `help` |
| `searchcommand <term>` | | Nessuno | Cerca tra nomi e descrizioni dei comandi, fino a 20 risultati |
| `guide` | `readme` | Nessuno | Link alla guida introduttiva |
| `source` | `github`, `repo`, `gitlab`, `bitbucket` | Nessuno | Link al codice sorgente |
| `donate` | | Nessuno | Come sostenere il bot |
| `vote` | | Nessuno | Link per votare il bot |
| `exportcommandsjson` | `exportcommands`, `excj` | Nessuno | Esporta ogni comando in un file JSON (una volta al minuto) |

Solo slash: `/search <command>` con completamento automatico, e `/invite`. `/help`, `/commands <module> [filter]`, `/donate`, `/guide`, `/source` e `/vote` replicano i comandi testuali.

## Suggerimenti e avvertenze

- Se `help` mostra una croce accanto a un modulo per te, una regola sui permessi o i proprietari del bot lo hanno disattivato in quel canale. Chiedi allo staff di controllare con `listperms`.
- Le pagine di aiuto riflettono le condizioni reali del comando, quindi un permesso elencato lì è quello corretto anche se la documentazione online è indietro.
- Il pulsante Run usa i tuoi permessi, non quelli del bot. È una comodità, non un modo per aggirare le regole.
- La corrispondenza dei moduli per prefisso fa sì che i prefissi brevi siano spesso ambigui; usane almeno tre o quattro lettere.
- Il bot scrive in privato solo a chi lo ha invitato al momento dell'ingresso. Se lo hai invitato da un link condiviso e non hai ricevuto nulla, apri la procedura guidata dalla dashboard.

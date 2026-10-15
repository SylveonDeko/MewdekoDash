---
title: Permessi dei comandi
slug: permissions
summary: Decidi chi può eseguire quali comandi e dove, con un elenco ordinato di regole di consenso e negazione per comandi e moduli, valide per l'intero server, un ruolo, un canale, una categoria o un singolo membro.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Permissions
tags: [permissions, command permissions, allow, deny, permission role, verbose, disable command, disable module, cooldown, dpo, permission override, blacklist, permessi, permessi comandi, consenti, nega, ruolo permessi, dettagliato, disattiva comando, disattiva modulo, cooldown, sovrascrittura permessi, lista nera]
related: [administration, help, filter, moderation]
---

## Cosa fa

Per impostazione predefinita ogni comando è disponibile a chiunque i permessi Discord lo consentano. I permessi dei comandi aggiungono sopra un elenco di regole specifico del server. Ogni regola stabilisce se un comando, un modulo o tutti i moduli sono consentiti o negati per l'intero server, un ruolo, un canale, una categoria o un singolo membro. Quando qualcuno esegue un comando, il bot scorre l'elenco, applica la prima regola che corrisponde e lascia passare il comando oppure lo blocca.

I comandi bloccati falliscono in silenzio, a meno che la modalità **dettagliata** non sia attiva; in quel caso il bot risponde con il numero e il testo della regola che lo ha bloccato. I comandi slash ricevono sempre una spiegazione visibile solo a chi l'ha eseguito.

Le regole possono essere gestite dagli amministratori o da chiunque abbia il **ruolo permessi** che scegli tu. Lo stesso elenco si trova nella dashboard, sotto **Amministrazione**, nella sezione **Automazione e impostazioni**, come scheda **Permessi dei comandi**.

Accanto a questo ci sono due strumenti correlati. I cooldown dei comandi limitano quante volte un comando può essere usato da ciascun membro in un server. Le sovrascritture dei permessi Discord, nel modulo Amministrazione, sostituiscono il permesso Discord che un comando normalmente richiede, per esempio consentendo a chi ha Gestisci messaggi di usare un comando che normalmente richiede Amministratore.

## Perché usarlo

- Tenere i comandi divertenti e NSFW lontani dai canali seri.
- Disattivare il modulo Musica ovunque tranne che in un canale dedicato ai comandi del bot.
- Permettere a un ruolo di aiuto di usare `warn` senza dargli Gestisci messaggi o Amministratore.
- Impedire del tutto a un membro disturbatore di usare il bot.
- Limitare la frequenza di un comando rumoroso come `roll` a una volta ogni dieci secondi per membro.

## Come si scrive una regola

Ogni regola ha tre parti.

| Parte | Opzioni |
| --- | --- |
| Cosa | Un comando, un modulo oppure tutti i moduli |
| Per chi | L'intero server, un ruolo, un canale, una categoria o un utente specifico |
| Azione | Consenti o nega |

I nomi dei comandi nella tabella sotto codificano le prime due parti. Le prime lettere indicano il destinatario (`s` server, `r` ruolo, `c` canale, `ca` categoria, `u` utente), l'ultima il tipo (`cmd` comando, `mdl` modulo), e le forme `all...mdls` coprono tutti i moduli.

| Comando | Regola creata |
| --- | --- |
| `srvrcmd <command> <enable|disable>` | Un comando per l'intero server |
| `srvrmdl <module> <enable|disable>` | Un modulo per l'intero server |
| `allsrvrmdls <enable|disable>` | Tutti i moduli per l'intero server |
| `rolecmd <command> <enable|disable> <role>` | Un comando per un ruolo |
| `rolemdl <module> <enable|disable> <role>` | Un modulo per un ruolo |
| `allrolemdls <enable|disable> <role>` | Tutti i moduli per un ruolo |
| `chnlcmd <command> <enable|disable> <#channel>` | Un comando in un canale |
| `chnlmdl <module> <enable|disable> <#channel>` | Un modulo in un canale |
| `allchnlmdls <enable|disable> <#channel>` | Tutti i moduli in un canale |
| `catcmd <command> <enable|disable> <category>` | Un comando in ogni canale di una categoria |
| `catmdl <module> <enable|disable> <category>` | Un modulo in una categoria |
| `allcatmdls <enable|disable> <category>` | Tutti i moduli in una categoria |
| `usrcmd <command> <enable|disable> @user` | Un comando per un membro |
| `usrmdl <module> <enable|disable> @user` | Un modulo per un membro |
| `allusrmdls <enable|disable> @user` | Tutti i moduli per un membro |

I trigger di chat contano come comandi: indica il numero o il testo del trigger dove ci si aspetta il nome di un comando.

> [!EXAMPLE]
> `srvrmdl nsfw disable` seguito da `chnlmdl nsfw enable #adult` blocca il modulo NSFW ovunque tranne che in un canale.

## Ordine delle regole

`listperms` mostra l'elenco numerato a partire da 1. La regola 1 è sempre "consenti tutti i moduli per l'intero server" e non può essere modificata né rimossa; è il ripiego quando nient'altro corrisponde.

Le nuove regole vengono aggiunte in fondo all'elenco. Quando un comando viene eseguito, il bot controlla le regole partendo dal numero più alto e risalendo verso la regola 1, e la prima regola il cui destinatario e tipo corrispondono decide. Quindi vince la regola corrispondente aggiunta più di recente, ed è per questo che l'esempio sopra funziona: il consenso sul canale è stato aggiunto dopo il diniego sul server.

`moveperm <from> <to>` cambia la posizione di una regola e rinumera tutto, così puoi spostare un'eccezione sopra o sotto una regola più ampia senza ricrearla. `removeperm <number>` elimina una regola. `resetperms` riporta l'elenco alla sola regola 1 e richiede Amministratore.

La dashboard elenca le stesse regole con le frecce per spostare su e giù e un pulsante di eliminazione per ogni regola.

## Modalità dettagliata

`verbose` attiva o disattiva la risposta con un messaggio di errore quando un comando testuale viene bloccato, con il nome della regola che lo blocca, per esempio "permission 4 (`.chnlmdl nsfw disable #general`) prevents this". È disattivata per impostazione predefinita. Con la modalità disattivata, i comandi bloccati vengono ignorati in silenzio, il che va bene per la maggior parte dei server ed evita che i membri provino ciò che non possono eseguire. I comandi slash rispondono sempre con il motivo, in modo visibile solo a chi l'ha eseguito, indipendentemente da questa impostazione.

## Chi può modificare le regole

Ogni comando di questo modulo passa da un controllo aggiuntivo. Gli amministratori possono sempre usarli. Chiunque altro ha bisogno del **ruolo permessi** impostato con `permrole <role>`. Senza di esso, i non amministratori ricevono un messaggio che dice che servono permessi di amministratore (solo se la modalità dettagliata è attiva) e il comando si interrompe. `permrole` senza argomenti mostra il ruolo attuale; `permrole reset` lo cancella. Il ruolo `@everyone` non può essere usato.

`resetperms` e `permrole` stessi richiedono sempre Amministratore oltre a tutto questo.

## Cooldown

`cmdcooldown <command> [time]` imposta un cooldown per membro per un comando in questo server, da 1 secondo fino a 90000 secondi (25 ore). Non indicare un tempo, oppure usa `0s`, per rimuoverlo. `allcmdcooldowns` elenca i cooldown attuali. Si aggiungono a qualsiasi cooldown integrato che un comando abbia già.

## Sovrascritture dei permessi Discord

Il modulo Amministrazione può sostituire il permesso Discord richiesto da un comando. `dpo <command> <permissions...>` fa sì che il comando richieda i permessi elencati invece di quello integrato, per esempio `dpo purge ManageMessages`. Esegui `dpo <command>` senza permessi per rimuovere la sovrascrittura, `dpol` per elencarle e `dpor` per cancellarle tutte dopo una conferma. Tutti e tre richiedono Amministratore.

Una sovrascrittura sostituisce solo il requisito integrato di Discord. Le regole dei permessi dei comandi descritte sopra continuano ad applicarsi, e la pagina del comando da `help <command>` mostra il requisito originale barrato con accanto la sovrascrittura.

## Il menu rapido in help

`help <command>` mostra agli amministratori un pulsante permessi. Apre un menu rapido per quel singolo comando che mostra le regole che lo riguardano, segnala le regole ridondanti (due regole con lo stesso destinatario e tipo), propone di risolverle e permette di aggiungere regole di consenso e di negazione per il comando o di reimpostarne i permessi senza lasciare la pagina di aiuto.

## Controlli del proprietario del bot

Tre gruppi di comandi sono riservati ai proprietari del bot e influiscono su ogni server: i permessi globali (`globalmodule`, `globalcommand`, `globalpermlist`, `resetglobalperms`) disattivano un modulo o un comando ovunque, e la lista nera (`userblacklist`, `channelblacklist`, `serverblacklist`, `manualblacklistcheck`) impedisce al bot di rispondere del tutto a un utente, un canale o un server. Un modulo disattivato globalmente mostra un globo e una croce nel menu di aiuto.

## Impostazioni

Nella dashboard apri **Amministrazione**, poi la sezione **Automazione e impostazioni**, poi la scheda **Permessi dei comandi**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Permessi dettagliati | disattivato | Avvisa gli utenti quando una regola blocca un comando |
| Ruolo permessi | nessuno | I membri con questo ruolo possono modificare le regole tramite comandi |
| Regole | solo la regola 1 | L'elenco ordinato; aggiungi con **Azione**, **Cosa** e **Per chi**, poi un modulo, un comando, un ruolo, un canale, una categoria o l'ID utente |

La scheda mostra anche il numero di regole personalizzate e se la modalità dettagliata è attiva. La scheda **Sovrascritture dei permessi** nella stessa sezione gestisce le sovrascritture dei permessi Discord: scegli un comando del bot e il **Permesso Discord richiesto** che deve avere al posto di quello integrato.

## Guida alla configurazione

1. Decidi la forma: di solito "tutto consentito, alcune cose negate" oppure "tutto negato, poi consentito nei canali del bot".
2. Per la seconda forma esegui `allsrvrmdls disable`, poi `allchnlmdls enable #bot-commands`.
3. Mantieni funzionante la moderazione per lo staff: `rolemdl moderation enable @Mods` e `rolemdl administration enable @Mods`.
4. Esegui `listperms` e leggilo dal basso verso l'alto, perché è l'ordine che usa il bot. Usa `moveperm` se un'eccezione si trova sotto la regola che dovrebbe sovrascrivere.
5. Dai allo staff di fiducia `permrole @Mods` così può modificare le regole senza Amministratore.
6. Attiva `verbose` durante i test per vedere quale regola scatta, poi disattivalo di nuovo.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Le versioni slash si trovano sotto `/permissions`, per esempio `/permissions servercommand`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `listperms` | `lp` | Amministratore o ruolo permessi | Mostra l'elenco numerato delle regole |
| `verbose [true|false]` | `v` | Amministratore o ruolo permessi | Attiva o disattiva i messaggi per i comandi bloccati |
| `permrole [role|reset]` | `pr` | Amministratore | Mostra, imposta o reimposta il ruolo permessi |
| `removeperm <number>` | `rp` | Amministratore o ruolo permessi | Elimina una regola |
| `moveperm <from> <to>` | `mp` | Amministratore o ruolo permessi | Riordina le regole |
| `resetperms` | | Amministratore | Elimina ogni regola |
| `srvrcmd <command> <enable|disable>` | `sc` | Amministratore o ruolo permessi | Regola su un comando, intero server |
| `srvrmdl <module> <enable|disable>` | `sm` | Amministratore o ruolo permessi | Regola su un modulo, intero server |
| `allsrvrmdls <enable|disable>` | `asm` | Amministratore o ruolo permessi | Tutti i moduli, intero server |
| `rolecmd <command> <enable|disable> <role>` | `rc` | Amministratore o ruolo permessi | Regola su un comando per un ruolo |
| `rolemdl <module> <enable|disable> <role>` | `rm` | Amministratore o ruolo permessi | Regola su un modulo per un ruolo |
| `allrolemdls <enable|disable> <role>` | `arm` | Amministratore o ruolo permessi | Tutti i moduli per un ruolo |
| `chnlcmd <command> <enable|disable> <#channel>` | `cc` | Amministratore o ruolo permessi | Regola su un comando in un canale |
| `chnlmdl <module> <enable|disable> <#channel>` | `cm` | Amministratore o ruolo permessi | Regola su un modulo in un canale |
| `allchnlmdls <enable|disable> <#channel>` | `acm` | Amministratore o ruolo permessi | Tutti i moduli in un canale |
| `catcmd <command> <enable|disable> <category>` | `cac` | Amministratore o ruolo permessi | Regola su un comando in una categoria |
| `catmdl <module> <enable|disable> <category>` | `cam` | Amministratore o ruolo permessi | Regola su un modulo in una categoria |
| `allcatmdls <enable|disable> <category>` | `acamds` | Amministratore o ruolo permessi | Tutti i moduli in una categoria |
| `usrcmd <command> <enable|disable> @user` | `uc` | Amministratore o ruolo permessi | Regola su un comando per un membro |
| `usrmdl <module> <enable|disable> @user` | `um` | Amministratore o ruolo permessi | Regola su un modulo per un membro |
| `allusrmdls <enable|disable> @user` | `aum` | Amministratore o ruolo permessi | Tutti i moduli per un membro |
| `cmdcooldown <command> [time]` | `cmdcd` | Amministratore o ruolo permessi | Imposta o rimuove un cooldown |
| `allcmdcooldowns` | `acmdcds` | Amministratore o ruolo permessi | Elenca i cooldown |
| `discordpermoverride <command> [permissions...]` | `dpo` | Amministratore | Imposta o rimuove una sovrascrittura di permesso Discord |
| `discordpermoverridelist` | `dpol`, `dpoli` | Amministratore | Elenca le sovrascritture |
| `discordpermoverridereset` | `dpor` | Amministratore | Cancella tutte le sovrascritture |
| `globalmodule <module>` | `gmod` | Proprietario del bot | Attiva o disattiva un modulo ovunque |
| `globalcommand <command>` | `gcmd` | Proprietario del bot | Attiva o disattiva un comando ovunque |
| `globalpermlist` | `gpl`, `lgp`, `globalperms`, `listglobalperms` | Proprietario del bot | Elenca i blocchi globali |
| `resetglobalperms` | | Proprietario del bot | Cancella i blocchi globali |
| `userblacklist <add|remove> <user> [reason]` | `ubl` | Proprietario del bot | Inserisce un utente nella lista nera |
| `channelblacklist <add|remove> <id> [reason]` | `cbl` | Proprietario del bot | Inserisce un canale nella lista nera |
| `serverblacklist <add|remove> <server> [reason]` | `sbl` | Proprietario del bot | Inserisce un server nella lista nera |
| `manualblacklistcheck` | `manualblcheck`, `mbc` | Proprietario del bot | Riesegue l'applicazione della lista nera |

## Suggerimenti e trappole

- `resetperms` è esentato dal controllo delle regole, così puoi sempre recuperare da una regola che ha bloccato tutto, purché tu sia amministratore.
- Le regole corrispondono al nome canonico del comando, quindi `srvrcmd clear disable` e `srvrcmd purge disable` sono la stessa regola. Usa il primo nome indicato da `help <command>`.
- Una regola per "tutti i moduli" copre anche il modulo Permessi. Se neghi tutto a un ruolo, i membri con solo quel ruolo non possono nemmeno eseguire `listperms`.
- Le regole per categoria usano la categoria padre del canale al momento dell'esecuzione del comando; i thread ereditano dal canale padre.
- Le sovrascritture dei permessi Discord cambiano il permesso Discord richiesto, non chi le regole consentono. Usale insieme: una sovrascrittura per abbassare la soglia, poi una regola per limitare dove.
- Le regole sui permessi non si applicano mai nei messaggi privati.
- La dashboard chiama le scelte di destinatario Intero server, Un ruolo, Un canale, Una categoria e Un utente specifico; l'opzione utente accetta un ID utente incollato.

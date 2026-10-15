---
title: Reputazione
slug: reputation
summary: Permetti ai membri di ringraziarsi a vicenda con punti reputazione, con tempi di attesa e limiti anti-abuso, ricompense con ruoli al raggiungimento di soglie, assegnazione tramite reazioni e decadimento facoltativo per i membri inattivi.
icon: fa-trophy
category: Community
dashboard: /dashboard/reputation
module: Reputation
tags: [reputation, rep, karma, thanks, role rewards, leaderboard, reaction rep, decay, cooldown, reputazione, ringraziamenti, ricompense ruolo, classifica, reazioni, decadimento, tempo di attesa]
related: [xp, administration]
---

## Cosa fa

Un membro esegue `rep @user` per assegnare un punto reputazione, facoltativamente con un motivo. Il totale del destinatario aumenta, la serie giornaliera di chi ha dato il punto viene tenuta traccia e la cronologia registra chi ha dato cosa e perché. Chiunque può controllare i totali con `repcheck`, vedere la classifica del server con `repleaderboard` e leggere le ultime dieci voci con `rephistory`.

Lo staff configura quanto liberamente circola la reputazione: un tempo di attesa per ogni coppia di chi dà e chi riceve, limiti giornalieri e settimanali, e età minima dell'account, tempo minimo nel server e numero minimo di messaggi prima che qualcuno possa dare reputazione. I canali possono essere disattivati per la reputazione oppure ricevere un moltiplicatore. La reputazione si può anche guadagnare tramite le reazioni: un'emoji configurata su un messaggio assegna punti al suo autore.

Al raggiungimento di soglie scelte, il bot assegna ruoli, annuncia il traguardo in un canale e invia un messaggio privato al membro. Il decadimento facoltativo toglie lentamente punti ai membri che non hanno né dato né ricevuto reputazione per un certo periodo, così la classifica riflette l'attività attuale.

## Perché usarlo

- Riconoscere i membri utili nei canali di supporto e assegnare loro un ruolo visibile.
- Lasciare che una reazione con il pollice in su nel canale delle vetrine assegni punti all'artista.
- Limitare un comando o un canale a un certo livello di reputazione invece che a un ruolo assegnato a mano.
- Organizzare un evento nel fine settimana in cui la reputazione in un canale vale doppio.
- Mantenere onesta una classifica del supporto con il decadimento per chi smette di aiutare.

## Dare reputazione

Ogni `rep` assegna un punto, moltiplicato per il moltiplicatore del canale se ne è impostato uno. Non puoi darti reputazione da solo né darla a un bot. Ogni tentativo passa questi controlli, in quest'ordine, e il primo fallimento viene comunicato a chi ha dato la reputazione:

| Controllo | Predefinito | Cosa succede |
| --- | --- | --- |
| Sistema attivo | attivo | Tutto viene rifiutato se disattivato |
| Stato del canale | enabled | Un canale impostato su `disabled` rifiuta la reputazione data lì |
| Destinatario congelato | no | I membri congelati non possono ricevere reputazione |
| Tempo di attesa | 60 minuti | Tempo prima che chi dà possa di nuovo dare reputazione allo stesso destinatario |
| Limite giornaliero | 10 | Reputazione che chi dà può distribuire per giorno UTC |
| Limite settimanale | nessuno | Tetto facoltativo per settimana, conteggiato da domenica |
| Età minima dell'account | 7 giorni | Età dell'account Discord di chi dà |
| Tempo minimo nel server | 24 ore | Da quanto tempo chi dà è nel server |
| Numero minimo di messaggi | 10 | Messaggi inviati da chi dà, dal conteggio dei messaggi |

La reputazione anonima registra la voce come anonima, ma solo se il dare in forma anonima è attivo nella configurazione. La reputazione negativa è un interruttore separato; la rimozione di una reazione toglie già i punti che aveva assegnato.

### Serie e statistiche

Dare reputazione in giorni consecutivi costruisce una serie; un intervallo di più di un giorno e mezzo la azzera. `repstats` mostra totale, posizione, reputazione data e ricevuta, serie attuale e più lunga, e gli ultimi orari di dare e ricevere.

### Tipi personalizzati

`reptypeadd helpful Helpful` crea un tipo con nome. I membri eseguono poi `rep @user helpful thanks for the fix`. La reputazione standard aggiunge solo al totale; un tipo personalizzato mantiene anche un proprio conteggio per tipo, che i requisiti dei comandi possono usare come riferimento.

## Reazioni

`repreaction <emoji> [amount] [type]` fa sì che una reazione assegni reputazione all'autore del messaggio. Chi reagisce non deve essere un bot, e rimuovere la reazione toglie i punti. Il comando assegna per impostazione predefinita un punto di reputazione standard, e ogni configurazione di reazione ha il proprio tempo di attesa.

## Ricompense con ruoli

`reprole @Role 100` assegna il ruolo una volta che un membro raggiunge 100 di reputazione. Opzioni: rimuovere di nuovo il ruolo quando la reputazione scende sotto la soglia (attivo per impostazione predefinita), annunciare il traguardo in un canale e inviare un messaggio privato. Le ricompense vengono controllate dopo ogni variazione di reputazione. I punti XP bonus possono essere salvati su una ricompensa, ma non vengono ancora assegnati.

Indipendentemente dalle ricompense con ruoli, il bot pubblica un messaggio di traguardo nel **canale delle notifiche** quando un membro supera 50, 100, 250, 500, 1000, 2500, 5000 o 10000 di reputazione. I membri ricevono anche un messaggio privato quando ricevono dieci o più punti in una volta sola o raggiungono un multiplo di dieci.

## Decadimento

Quando è attivo, ogni ora il bot controlla se è il momento di applicare il decadimento. `daily` viene eseguito alle 02:00 UTC, `weekly` la domenica alle 02:00 UTC, `monthly` il primo del mese. I membri che non hanno né dato né ricevuto reputazione per il periodo di inattività perdono l'importo del decadimento, che può essere un numero fisso di punti o una percentuale del totale, senza mai scendere sotto zero. I membri congelati vengono saltati. Valori predefiniti: settimanale, 1 punto, 30 giorni di inattività.

## Requisiti dei comandi

`repcommandreq <command> <minimum> [type] [#channels]` blocca un comando finché il membro non ha almeno quella reputazione, facoltativamente di un solo tipo personalizzato e facoltativamente solo in determinati canali. `repcommandbypass` esenta dei ruoli, e `repcommandinfo` permette a chiunque di vedere cosa richiede un comando.

## Impostazioni

La pagina della Reputazione ha quattro schede: **Configurazione**, **Ricompense con ruoli**, **Classifica** e **Statistiche**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Enable Reputation System | attivo | Interruttore generale |
| Cooldown (minutes) | 60 | Per coppia di chi dà e chi riceve |
| Daily Limit | 10 | Reputazione per chi dà al giorno |
| Weekly Limit (optional) | nessuno | Reputazione per chi dà a settimana |
| Min Account Age (days) | 7 | Requisito per chi dà |
| Min Server Time (hours) | 24 | Requisito per chi dà |
| Min Message Count | 10 | Requisito per chi dà |
| Notification Channel (optional) | nessuno | Dove vanno i messaggi di traguardo |
| Allow Negative Reputation | off | Abilita gli importi negativi |
| Enable Anonymous Reputation | off | Permette a `repanon` di nascondere chi dà |

Il decadimento non è nella dashboard; usa i comandi `repdecay*` qui sotto.

**Ricompense con ruoli** ha un modulo con **Ruolo**, **Reputazione richiesta**, **Canale annunci (facoltativo)**, **XP bonus (facoltativo)**, **Rimuovi il ruolo se la reputazione scende sotto la soglia** e **Invia notifica in DM**. **Classifica** mostra la classifica e apre la cronologia di un membro. **Statistiche** mostra utenti totali, reputazione totale data, transazioni e reputazione media.

## Guida alla configurazione

1. Apri **Reputazione** nella dashboard. Nella scheda **Configurazione**, attiva **Attivato**.
2. Imposta **Pausa**, **Daily Limit** e i tre requisiti minimi in base alle dimensioni del tuo server.
3. Scegli un **Notification channel** per i traguardi e salva.
4. In **Ricompense con ruoli**, aggiungi un ruolo con il suo **Reputazione richiesta** e spunta **Rimuovi il ruolo se la reputazione scende sotto la soglia** se vuoi che venga guadagnato in modo continuo.
5. In Discord, esegui `repreaction <emoji> 1` per attivare la reputazione tramite reazioni, e `repchannel #bot-spam disabled` per tenere fuori i canali di spam.
6. Prova con un secondo account: `rep @you great help`, poi `repcheck @you`.

> [!WARNING]
> `represet all` cancella, dopo una conferma, tutta la reputazione, la cronologia e i badge di ogni membro del server. Non c'è modo di annullarlo.

## Comandi

Esegui questi comandi con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `rep <@user> [type] [reason]` | `+rep`, `giverep`, `gr`, `repgive` | Nessuno | Dai un punto |
| `repanon <@user> [type] [reason]` | `anongiverep` | Nessuno | Dai in forma anonima |
| `anonrep <@user> [type] [reason]` | | Nessuno | Uguale a `repanon` |
| `repcheck [@user]` | `myrep`, `checkrep` | Nessuno | Mostra totale e posizione |
| `repleaderboard [page]` | `replb`, `reptop`, `toprep` | Nessuno | Classifica, 25 per pagina |
| `rephistory [@user]` | `rephist` | Nessuno | Ultime dieci voci di reputazione |
| `repstats [@user]` | `repstat` | Nessuno | Statistiche dettagliate e serie |
| `repcommandinfo <command>` | `repcmdinfo`, `rci` | Nessuno | Mostra il requisito di reputazione di un comando |
| `repstatus` | `repsettings` | Amministratore | Mostra la configurazione |
| `repconfig` | `repcfg` | Amministratore | Menu di configurazione interattivo |
| `repenable [true/false]` | `repe` | Amministratore | Attiva o disattiva il sistema |
| `repcooldown <minutes>` | `repcd` | Amministratore | Da 1 a 1440 |
| `repdailylimit <n>` | `repdl` | Amministratore | Da 1 a 100 |
| `repweeklylimit [n]` | `repwl` | Amministratore | Da 1 a 500, oppure none per cancellare |
| `repminage <days>` | `repma` | Amministratore | Da 0 a 365 |
| `repminmembership <hours>` | `repmm` | Amministratore | Da 0 a 720 |
| `repminmessages <n>` | `repminmsg` | Amministratore | Da 0 a 1000 |
| `repnegative <true/false>` | `repneg` | Amministratore | Consenti reputazione negativa |
| `repanonymous <true/false>` | `repanonym` | Amministratore | Consenti reputazione anonima |
| `repnotificationchannel [#channel]` | `repnotify` | Amministratore | Imposta o cancella il canale dei traguardi |
| `repchannel <#channel> [enabled/disabled/readonly] [multiplier]` | `repch` | Amministratore | Stato per canale e moltiplicatore |
| `repdecay <true/false>` | `repd` | Amministratore | Attiva il decadimento |
| `repdecaytype <daily/weekly/monthly/fixed/percentage>` | `repdt` | Amministratore | Pianificazione del decadimento o tipo di importo |
| `repdecayamount <n>` | `repda` | Amministratore | Da 1 a 100 punti o percentuale |
| `repdecayinactive <days>` | `repdi` | Amministratore | Da 1 a 365 giorni prima del decadimento |
| `reptake <@user> [amount]` | `-rep`, `takerep` | Amministratore | Rimuovi punti |
| `repset <@user> <amount>` | `setrep` | Amministratore | Imposta un totale |
| `represet <@user or all>` | `resetrep` | Amministratore | Azzera un membro o tutti |
| `repfreeze <@user>` | `freezerep` | Amministratore | Impedisci a un membro di ricevere reputazione |
| `repunfreeze <@user>` | `unfreeze`, `unfreezerep` | Amministratore | Annulla un congelamento |
| `repreaction <emoji> [amount] [type]` | `repemoji`, `rre` | Amministratore | Aggiungi o aggiorna una ricompensa per reazione |
| `repreactionremove <emoji>` | `repemojiremove`, `rrer` | Amministratore | Rimuovi una ricompensa per reazione |
| `repreactionlist` | `repemojilist`, `rrel` | Amministratore | Elenca le ricompense per reazione |
| `reprole [@role] [rep] [removeOnDrop] [#channel] [dm] [xp]` | | Gestisci ruoli | Aggiungi, aggiorna o elenca le ricompense con ruoli |
| `reproleremove <@role>` | `reprr` | Gestisci ruoli | Rimuovi una ricompensa con ruolo |
| `reprolechannel <@role> [#channel]` | `reprc` | Amministratore | Imposta o cancella il canale di annuncio di una ricompensa |
| `repcommandreq <command> <min> [type] [#channels]` | `repcmdreq`, `rcr` | Amministratore | Richiedi reputazione per un comando |
| `repcommandbypass <command> <@roles>` | `repcmdbypass`, `rcb` | Amministratore | Ruoli che saltano il requisito |
| `repcommandreqremove <command>` | `repcmdreqremove`, `rcrr` | Amministratore | Rimuovi un requisito |
| `repcommandreqlist` | `repcmdreqlist`, `rcrl` | Amministratore | Elenca i requisiti |
| `reptypeadd <name> <display name>` | `repaddtype`, `rta` | Amministratore | Aggiungi un tipo personalizzato |
| `reptyperemove <name>` | `repremovetype`, `rtr` | Amministratore | Rimuovi un tipo personalizzato |
| `reptypelist` | `replisttypes`, `rtl` | Amministratore | Elenca i tipi personalizzati |
| `repeventcreate <name> <multiplier> <hours>` | `repec` | Amministratore | Registra un evento con moltiplicatore |
| `repeventend <name>` | `repee` | Amministratore | Termina un evento in anticipo |
| `repexport` | `repex` | Amministratore | Esporta la configurazione come JSON |
| `repimport` | `repim` | Amministratore | Importa un file di configurazione allegato al messaggio |
| `repmilestonelost <@user> <@role> <threshold>` | | Amministratore | Messaggio di prova per un traguardo perso |

I comandi slash `/rep` coprono `give`, `check`, `leaderboard`, `history` e `stats`, oltre ai gruppi di amministrazione `/rep config`, `/rep decay`, `/rep manage`, `/rep reaction`, `/rep role`, `/rep type`, `/rep event` e `/rep require`, che rispecchiano i comandi di impostazione qui sopra. `/rep role list` e `/rep role info` esistono solo come comandi slash.

## Suggerimenti e insidie

- Le ricompense con ruoli richiedono che il ruolo del bot sia sopra ogni ruolo di ricompensa e il permesso Gestisci ruoli, e `reprole` rifiuta i ruoli superiori a quello del bot.
- Il numero minimo di messaggi usa la funzione di conteggio dei messaggi. Se il conteggio è disattivato, i membri possono essere bloccati dal dare reputazione con un conteggio pari a zero.
- Solo lo stato `disabled` di un canale blocca il dare. `readonly` è accettato dal comando, ma al momento non ferma la reputazione in quel canale.
- Gli eventi creati con `repeventcreate` vengono salvati con il loro moltiplicatore e l'orario di fine, ma il moltiplicatore al momento non viene applicato alla reputazione data durante l'evento.
- La reputazione tramite reazioni usa il nome dell'emoji per le emoji standard e il suo ID per quelle personalizzate, quindi un'emoji personalizzata di un altro server non corrisponderà una volta rimossa.
- I controlli di decadimento vengono eseguiti all'ora in punto, quindi un decadimento `daily` avviene una volta durante l'ora delle 02:00 UTC.
- Il tempo di attesa è per coppia. Un membro può dare reputazione a più persone diverse una dopo l'altra, fino al limite giornaliero.

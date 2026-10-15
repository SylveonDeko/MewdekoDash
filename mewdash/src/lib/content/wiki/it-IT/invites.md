---
title: Inviti
slug: invites
summary: Attribuisci ogni ingresso a un codice di invito, al link personalizzato o a un'app, conta gli inviti regolari, usciti, falsi e bonus per membro, assegna etichette ai codici e osserva la crescita, la retention e le fonti degli ingressi nel tempo.
icon: fa-users
category: Community
dashboard: /dashboard/invites
module: Utility
tags: [invites, invite tracking, inviter, who invited, referrals, recruitment, leaderboard, fake invites, bonus invites, retention, vanity, labels, analytics, mass ban, inviti, tracciamento inviti, chi ha invitato, referral, reclutamento, classifica, inviti falsi, inviti bonus, etichette, analisi, ban di massa]
related: [multigreets, statroles, liveboards, serverstats]
---

## Cosa fa

Quando qualcuno entra, il bot confronta i link di invito del server prima e dopo l'ingresso per capire quale è stato usato, controlla il link personalizzato se nessuno corrisponde, e registra come è arrivato il membro: tramite l'invito di un altro membro, tramite il link personalizzato, come bot aggiunto con OAuth, oppure in modo sconosciuto. Chi ha invitato riceve un invito **regular** a meno che l'ingresso non sia segnato come **fake**. Quando il membro invitato esce, il contatore **uscito** di chi lo ha invitato aumenta. Lo staff può assegnare inviti **bonus**. Il totale di un membro è regular meno left meno fake, più bonus.

Ogni ingresso osservato viene conservato, anche dopo che il membro è uscito, così la pagina può mostrare la retention (quanti membri invitati sono ancora qui), i rientri e quali codici portano persone che restano.

## Perché usarlo

- Organizzare una gara di reclutamento e premiare la classifica, che non può essere manipolata con account alternativi o con ingressi e uscite ripetuti.
- Capire se una campagna su Twitter, un server partner o un link YouTube porta membri che restano, assegnando un'etichetta a ogni codice.
- Mostrare chi ha invitato e con quale codice nel messaggio di benvenuto.
- Trovare e bannare tutti quelli portati da un solo invitante quando arriva un raid attraverso un unico link.

## Come vengono attribuiti gli ingressi

- Il bot ha bisogno del permesso **Gestisci server** per leggere la lista degli inviti. Senza, non viene registrato nulla.
- Gli ingressi vengono elaborati uno alla volta per server, e quando più persone usano lo stesso codice tra due controlli, l'eccedenza viene ricordata e attribuita ai prossimi ingressi, così le raffiche non vanno perse.
- Un ingresso tramite il link personalizzato viene registrato come **Vanity** senza invitante. Un bot aggiunto con OAuth viene registrato come **Bot**.
- Un codice con etichetta e con un proprietario attribuisce l'invito al proprietario invece che a chi ha creato l'invito. È così che funzionano i link personali di `invitelink`.

## Rilevamento dei falsi

Un ingresso viene segnato come falso, e chi ha invitato riceve un invito falso invece di uno regolare, quando si verifica una di queste condizioni:

| Motivo | Quando |
| --- | --- |
| Self | Il membro ha usato il proprio invito |
| New account | L'account è più giovane di **Minimum account age** (0 disattiva il controllo) |
| Rejoin | Il membro è già entrato in passato e **Conta i rientri** è disattivato |
| No avatar | Il membro non ha un avatar e **Segna i membri senza avatar** è attivo |

Gli invitanti nella **blacklist**, oppure con un ruolo nella blacklist, compaiono ancora come invitanti ma non ricevono mai crediti. I membri nell'elenco **nascosta** vengono tracciati ma esclusi dalle classifiche.

## Schede della dashboard

| Scheda | Cosa mostra |
| --- | --- |
| Overview | Ingressi, uscite, crescita netta, retention, ingressi falsi e fonti degli ingressi per l'ultimo giorno, la settimana, il mese o tutto il tempo, un grafico di ingressi e uscite, i migliori invitanti e i codici migliori |
| Leaderboard | Ogni invitante con i suoi numeri regolari, usciti, falsi, bonus e retention, filtrabile per periodo o ruolo, esportabile in CSV. Clicca una riga o scegli un membro per vedere il suo dettaglio, aggiungere o rimuovere inviti regolari, bonus o falsi, o azzerarli |
| Members | Ogni ingresso osservato, filtrabile per invitante, codice di invito o etichetta, con come è arrivato, se è stato segnalato e se è ancora qui. Esportabile in CSV |
| Codes & Labels | Ogni codice di invito del server con il suo creatore, canale e utilizzi. Assegna al codice un'etichetta e, facoltativamente, un ruolo che riceve chiunque entri con quel codice, oppure elimina il codice |
| Settings | Monitoraggio, rimozione alla uscita, conteggio dei rientri, segnalazione degli account senza avatar, età minima dell'account, il canale a cui puntano i link personali, il canale di log di ingressi e uscite, le blacklist, i membri nascosti e gli strumenti di importazione e reset |

## Impostazioni

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Track invites | attivo | Se gli ingressi vengono attribuiti |
| Remove credit when members leave | attivo | Aggiunge uno al contatore left di chi ha invitato, abbassando il suo totale, quando un membro invitato esce |
| Count rejoins | attivo | Se disattivato segna come invito falso un membro già entrato in passato |
| Flag members without an avatar | disattivato | Gli ingressi da account senza avatar contano come falsi |
| Minimum account age | 0 giorni | Gli account più giovani di questo valore vengono segnati come falsi |
| Personal link channel | canale di sistema | Dove puntano gli inviti creati con `invitelink` |
| Join and leave log channel | nessuno | Pubblica un embed a ogni ingresso e uscita con chi ha invitato chi, il codice, l'età dell'account e l'eventuale segnalazione di falso |

**Importa utilizzi da Discord** porta il totale regolare di ogni invitante alla somma degli utilizzi dei suoi codici e non lo abbassa mai, quindi è sicuro rieseguirlo dopo un riavvio o una nuova installazione. **Azzera gli invitanti usciti** azzera il conteggio di chiunque non sia più nel server. **Ripristina tutto** azzera ogni conteggio e la cronologia degli ingressi.

## Segnaposto per i benvenuti

Ogni benvenuto può usare questi segnaposto una volta attivato il monitoraggio. I valori sconosciuti ricadono su `Unknown` o `0`.

| Segnaposto | Valore |
| --- | --- |
| `%inviter.mention%`, `%inviter.username%`, `%inviter.id%`, `%inviter.avatar%` | L'invitante a cui viene attribuito l'ingresso |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | Il conteggio dell'invitante |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%`, `%invite.fake%` | L'invito che è stato usato |
| `%user.joincount%`, `%user.leavecount%` | Quante volte questo membro è entrato e uscito |
| `%server.members.ordinal%` | Il numero di membri come 1°, 2°, 1.204° |
| `%user.joined.R%`, `%user.created.F%` e gli altri stili di data Discord t, T, d, D, f, F, R | Date di ingresso e di creazione dell'account come timestamp dinamici |

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Ogni comando esiste anche sotto `/invites`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `invites [@user]` | | Nessuno | Il totale di un membro con la suddivisione regolari, usciti, falsi e bonus, e la sua posizione |
| `whoinvited [@user]` | `invitedby` | Nessuno | Chi ha invitato un membro, il codice e se l'ingresso è stato segnalato |
| `invitedusers [@user]` | `userinvites` | Nessuno | Tutti quelli invitati da un membro, con date di ingresso e segnalazioni |
| `invitedbycode <code>` | | Nessuno | Tutti quelli entrati con un codice |
| `invitedbylabel <label>` | | Nessuno | Tutti quelli entrati con un codice con etichetta |
| `inviteleaderboard [AllTime/Daily/Weekly/Monthly] [@role]` | `inviteslb` | Nessuno | La classifica per un periodo, facoltativamente per un solo ruolo |
| `invitestats [range]` | `growthstats` | Nessuno | Ingressi, uscite, saldo netto, retention, ingressi falsi, fonti, migliori invitanti e codici |
| `invitecodes [@user]` | `mycodes` | Nessuno | I codici di invito di un membro e i loro utilizzi |
| `invitelink` | `findlink`, `mylink` | Nessuno | Il tuo link personale permanente, creato se non ne hai uno |
| `addinvites`, `removeinvites`, `addbonusinvites`, `removebonusinvites`, `addfakeinvites`, `removefakeinvites <@user> <amount>` | | Gestisci server | Modifica il conteggio di un membro |
| `resetinvites <@user>` oppure `resetinvites Server` oppure `resetinvites LeftMembers` | | Gestisci server, Amministratore per il reset dell'intero server | Azzera i conteggi |
| `syncinvites [@user]` | | Gestisci server | Importa gli utilizzi da Discord |
| `deleteinvite <code>` | `delinvite` | Gestisci server | Elimina un codice |
| `purgeinvites [maxUses] [#channel]` | | Gestisci server | Elimina ogni codice senza etichetta usato al massimo quel numero di volte |
| `inviteblacklist <@user or @role>` | `invbl` | Gestisci server | Attiva o disattiva la possibilità per qualcuno di guadagnare crediti |
| `invitehide <@user>` | `invhide` | Gestisci server | Attiva o disattiva la comparsa di qualcuno nelle classifiche |
| `inviteexclusions` | | Gestisci server | Elenca le blacklist e i membri nascosti |
| `invitelabelset <code> <label>`, `invitelabelrole <code> [@role]`, `invitelabelremove <code>`, `invitelabels` | | Gestisci server | Gestisci le etichette |
| `inviteexport [range]`, `invitedexport [@user]` | | Gestisci server | Esportazioni in CSV |
| `invitemassban <@user> [reason]`, `invitemassbancode <code> [reason]` | | Bannare membri | Banna tutti quelli ancora presenti che sono stati invitati da un membro o tramite un codice, dopo conferma |
| `invitesettings`, `toggleinvitetracking`, `toggleremoveinviteonleave`, `togglecountrejoins`, `togglefakenoavatar`, `setminaccountage <days>`, `invitelinkchannel [#channel]`, `invitelogchannel [#channel]` | | Gestisci server | Impostazioni |

## Suggerimenti e avvertenze

- I membri entrati prima che il monitoraggio fosse attivo, oppure mentre il bot era offline, non hanno una registrazione di ingresso. Esegui **Importa utilizzi da Discord** una volta per inizializzare i totali regolari con i conteggi di Discord.
- Gli ingressi falsi non abbassano mai un totale quando il membro esce; solo gli inviti regolari diventano inviti usciti.
- Un membro che esce e rientra ottiene una nuova registrazione di ingresso. Con **Conta i rientri** attivo, chi lo ha invitato guadagna di nuovo un invito regolare, che annulla l'invito uscito precedente.
- La retention in classifica conta solo gli ingressi osservati dal bot, quindi parte dal 100% e si assesta man mano che la cronologia si accumula.
- I ruoli statistiche possono premiare i conteggi degli inviti, e le classifiche live possono fissare la classifica degli inviti in un canale.

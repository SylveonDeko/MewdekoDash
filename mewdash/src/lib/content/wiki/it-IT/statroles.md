---
title: Ruoli statistiche
slug: statroles
summary: Ruoli che i membri guadagnano restando attivi in un periodo e perdono quando smettono, valutati tramite soglie, primi posti, percentuali migliori o serie giornaliere di messaggi, voce, giochi, inviti, tempo nel server o età dell'account.
icon: fa-trophy
category: Community
dashboard: /dashboard/statroles
module: StatRoles
tags: [stat roles, statroles, activity roles, active member role, inactive role, top chatter role, voice role, invite rewards, message rewards, streak, statbot, ruoli statistiche, ruolo membro attivo, ruolo inattivo, ruolo chiacchierone, ruolo vocale, premi inviti, premi messaggi, serie, statistiche]
related: [serverstats, xp, invites, liveboards]
---

## Cosa fa

I ruoli di livello XP funzionano in un solo senso: una volta ottenuti, restano per sempre. Un ruolo statistica viene rivalutato secondo una pianificazione. I membri che soddisfano la condizione ricevono il ruolo, quelli che smettono di soddisfarla lo perdono, quindi un ruolo "membro attivo" significa attivo *adesso*. Rendilo permanente se vuoi il vecchio comportamento, oppure invertilo per segnare i membri inattivi.

## Condizioni

Ogni ruolo statistica misura una cosa in un periodo e applica un limite.

| Misura | Cosa viene conteggiato |
| --- | --- |
| Messaggi | I messaggi nel periodo, facoltativamente solo nei canali scelti |
| Minuti in vocale | Tempo in vocale nel periodo, rispettando gli stati vocali esclusi nelle Statistiche di attività |
| Minuti di gioco | Tempo in un singolo gioco o app indicata, oppure in qualsiasi gioco, nel periodo. Richiede il tracciamento dei giochi attivo |
| Inviti | Il totale netto di inviti del membro |
| Giorni nel server | Da quando il membro è entrato |
| Età dell'account | Da quando l'account è stato creato |

| Limite | Chi si qualifica |
| --- | --- |
| Soglia | Compreso tra un minimo e un massimo facoltativo |
| Posizione in classifica | Classificato tra due posizioni, per esempio la top 10 |
| Percentuale migliore | Nel X percento migliore dei membri in classifica, per esempio il top 5% |
| Serie giornaliera | Ha raggiunto un minimo giornaliero per almeno N giorni nel periodo, per esempio 5 messaggi in 7 degli ultimi 7 giorni |

Il periodo va da 1 a 90 giorni, oppure da sempre per qualsiasi cosa tranne una serie. I pari merito condividono la stessa posizione.

## Filtri e opzioni

| Opzione | Cosa fa |
| --- | --- |
| Conta solo nei canali | Limita messaggi o voce ai canali scelti |
| Ruoli richiesti | Un membro ne deve avere almeno uno per essere preso in considerazione |
| Ruoli esclusi | Un membro che ne possiede uno non viene mai preso in considerazione |
| Membri ignorati | Mai assegnato né rimosso per questi membri |
| Gruppo | I ruoli statistica dello stesso gruppo mantengono solo il livello più alto a cui un membro si qualifica, così Bronzo, Argento e Oro non si sommano |
| Permanente | Mai rimosso una volta ottenuto |
| Inverti | I membri che *non* si qualificano ricevono il ruolo |
| Includi bot | Considera anche gli account bot |
| Valuta ogni | Quanto spesso viene eseguita la regola, almeno ogni 10 minuti, ogni 3 ore per impostazione predefinita |
| Annuncia in / invia DM al membro | Pubblica un messaggio quando il ruolo viene assegnato o rimosso, usando `%user%`, `%role%`, `%action%` (guadagnato o perso), `%value%` e `%stat%` |

## Dashboard

La scheda **Ruoli statistiche** elenca ogni regola con la sua condizione, pianificazione e ultima esecuzione, e permette di attivare, disattivare, modificare, eliminare, **visualizzare in anteprima** o **eseguire** ciascuna di esse. Un'anteprima mostra chi otterrebbe e chi perderebbe il ruolo senza cambiare nulla. Eseguire applica subito la regola; le esecuzioni manuali sono limitate a una ogni dieci minuti per server.

La scheda **Crea / Modifica** è il modulo per tutto quanto descritto sopra.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Ogni comando esiste anche sotto `/statrole`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `statroleadd <@role> <stat> <minimum> [days] [name]` | `sradd` | Gestisci ruoli | Una regola a soglia |
| `statroletop <@role> <stat> <topEnd> [days] [name]` | `srtop` | Gestisci ruoli | Una regola di posizione in classifica per i posti da 1 a topEnd |
| `statrolepercent <@role> <stat> <percent> [days] [name]` | `srpercent` | Gestisci ruoli | Una regola della percentuale migliore |
| `statrolestreak <@role> <stat> <perDay> <requiredDays> [days] [name]` | `srstreak` | Gestisci ruoli | Una regola di serie giornaliera |
| `statrolelist` | `statroles` | Nessuno | Ogni regola |
| `statroleinfo <id>` | `srinfo` | Nessuno | Una regola per esteso |
| `statroleset <id> <setting> <value>` | `srset` | Gestisci ruoli | Modifica nome, min, max, lookback, topstart, topend, days, permanent, invert, bots, group, interval, notifychannel, notifydm, message o activity |
| `statrolefilter <id> <#channel, @role [true], or @user>` | `srfilter` | Gestisci ruoli | Attiva o disattiva un filtro di canale, un ruolo richiesto (o un ruolo escluso con `true`), oppure un membro ignorato |
| `statroletoggle <id>` | `srtoggle` | Gestisci ruoli | Attiva o disattiva |
| `statrolepreview <id>` | `srpreview` | Gestisci ruoli | Chi otterrebbe e chi perderebbe il ruolo |
| `statrolerun <id>` | `srrun` | Gestisci ruoli | Applica subito |
| `statroleremove <id>` | `srremove` | Gestisci ruoli | Elimina la regola; i membri mantengono ciò che possiedono |

## Suggerimenti e trappole

- Il ruolo più alto del bot deve stare sopra il ruolo gestito, e il bot ha bisogno di Gestisci ruoli.
- Ogni ruolo Discord può essere gestito da un solo ruolo statistica. Elimina la vecchia regola prima di puntarne una nuova allo stesso ruolo.
- Una regola con minimo 0 e nessun massimo corrisponderebbe a tutti; assegnale un massimo oppure usa l'inversione di proposito.
- I membri che hanno escluso le statistiche di attività non hanno messaggi, tempo in vocale o di gioco, quindi non si qualificano mai per quelle misure.
- Visualizza in anteprima prima di attivare una regola su un server grande. Le modifiche ai ruoli sono distanziate per rispettare i limiti di frequenza, quindi una regola che coinvolge migliaia di membri impiega alcuni minuti per essere applicata.

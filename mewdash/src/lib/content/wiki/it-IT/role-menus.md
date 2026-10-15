---
title: Menu dei ruoli
slug: role-menus
summary: Pubblica un messaggio con un menu a tendina o dei pulsanti con cui i membri scelgono i propri ruoli.
icon: fa-list-ul
category: Actions
dashboard: /dashboard/role-menus
module: RoleMenus
tags: [role menus, self roles, dropdown, buttons, pronouns, colors, menu ruoli, ruoli autonomi, menu a tendina, pulsanti, pronomi, colori]
related: [administration, embedbuilder, rolestates]
---

## Cosa fa

Un menu dei ruoli è un messaggio in un canale con un **menu a tendina** o una riga di **pulsanti** sotto. Ogni opzione del menu assegna un ruolo. I membri scelgono un'opzione per ottenere il ruolo e la scelgono di nuovo per rinunciarvi, così un server può far scegliere alle persone i propri pronomi, colori, notifiche o regioni senza chiedere allo staff.

Ogni menu ha un nome (lo vede solo lo staff, e dà il titolo al messaggio predefinito), un canale, un messaggio e fino a 25 opzioni. Un'opzione ha un ruolo, il nome mostrato nel menu, un'emoji facoltativa e una descrizione facoltativa. Le descrizioni compaiono sotto ogni voce del menu a tendina e nel messaggio predefinito. Anche i pulsanti hanno un colore: blurple, grigio, verde o rosso.

Il messaggio può essere tutto ciò che crea l'editor di embed: testo semplice, uno o più embed, o entrambi. Se lo lasci vuoto, il bot pubblica il nome del menu con una riga per ogni opzione.

## Scelta multipla o singola

- **Scegli quanti vuoi** permette ai membri di attivare o disattivare ogni ruolo. Due limiti ne controllano il numero: **Devono restare almeno** impedisce di scendere sotto un certo numero una volta che hanno scelto, e **Può contenere al massimo** limita quanti ruoli del menu possono avere (nessun limite per impostazione predefinita).
- **Scegli uno** scambia i ruoli: scegliendo una nuova opzione viene rimosso quello che avevano. Attiva **Mantieni una scelta una volta fatta** e i membri possono cambiare ma non possono azzerare la scelta.

## Limiti

| Limite | Valore |
| --- | --- |
| Menu per server | 50 |
| Opzioni per menu | 25 |
| Pulsanti per riga | 5 |
| Nome del menu | 100 caratteri |
| Nome nel menu | 80 caratteri |
| Descrizione | 100 caratteri |
| Testo suggerimento del menu a tendina | 150 caratteri |
| Messaggio di testo semplice | 2000 caratteri |

Ogni ruolo può comparire una sola volta in un menu. Il bot può assegnare solo ruoli inferiori al proprio ruolo più alto che non siano gestiti da un'integrazione, e lo staff può offrire solo ruoli inferiori al proprio ruolo più alto.

## Ruolo richiesto

Un menu può richiedere un ruolo. I membri che non ce l'hanno ricevono una nota privata che dice che serve quel ruolo, e nulla cambia.

## Conferma

Con **Informa i membri delle modifiche** attivo, i membri ricevono una nota privata, visibile solo a loro, con l'elenco dei ruoli aggiunti e rimossi. Con l'opzione disattivata, il menu funziona in silenzio, anche se i membri ricevono comunque una nota privata quando qualcosa va storto, per esempio quando raggiungono un limite o un ruolo che il bot non può assegnare.

## Modifica, pausa e nuova pubblicazione

Salvare una modifica ricostruisce lo stesso messaggio sul posto. Un nuovo messaggio viene pubblicato solo se cambia il canale o se il vecchio messaggio non esiste più.

**Pausa** rende grigio il menu a tendina o i pulsanti su Discord finché il menu non viene ripreso. **Pubblica di nuovo** pubblica una copia nuova ed elimina il vecchio messaggio, utile quando un menu è finito fuori dallo schermo o è stato eliminato a mano. Se il canale di un menu viene eliminato, modificalo, scegli un nuovo canale e salva per ripubblicarlo.

Eliminare un menu elimina anche il suo messaggio. I membri mantengono i ruoli che hanno già scelto.

## Spostare le configurazioni precedenti

Le vecchie configurazioni con emoji prevedevano che i membri aggiungessero un'emoji sotto un messaggio per ottenere un ruolo. La scheda **Sposta configurazioni precedenti** le elenca. Spostarne una crea un menu dei ruoli con gli stessi ruoli e le stesse emoji, come menu a tendina o pulsanti, nello stesso canale o in un altro. Può copiare il testo e gli embed del vecchio messaggio, e può ritirare la vecchia configurazione, che la ferma e ne cancella le emoji. Se il messaggio originale è stato pubblicato dal bot, ritirarlo lo elimina. Una configurazione in cui i membri potevano avere un solo ruolo diventa un menu con scelta singola.

## Comandi

| Comando | Cosa fa |
| --- | --- |
| `rolemenus` | Elenca ogni menu con il suo canale, tipo, numero di opzioni e stato. |
| `rolemenuinfo 3` | Mostra tutto su un menu. |
| `rolemenucreate #roles dropdown @Role @Role` | Pubblica un nuovo menu con un'opzione per ruolo. |
| `rolemenuadd 3 @Role [emoji] [name]` | Aggiunge un ruolo a un menu. |
| `rolemenuremove 3 @Role` | Rimuove un ruolo da un menu. |
| `rolemenuname 3 Pronouns` | Rinomina un menu. |
| `rolemenumessage 3 [message\|clear]` | Mostra, imposta o cancella il messaggio sopra un menu. |
| `rolemenustyle 3 dropdown\|buttons` | Passa da menu a tendina a pulsanti e viceversa. |
| `rolemenumode 3 multi\|exclusive` | Passa da scelta multipla a scelta singola e viceversa. |
| `rolemenulimits 3 0 2` | Imposta quanti ruoli i membri devono mantenere e possono avere. |
| `rolemenurequire 3 [@Role]` | Imposta o rimuove il ruolo richiesto. |
| `rolemenureply 3 private\|silent` | Attiva o disattiva la nota privata. |
| `rolemenupause 3` | Mette in pausa un menu, oppure lo riprende se è in pausa. |
| `rolemenurepost 3 [#channel]` | Pubblica una copia nuova ed elimina il vecchio messaggio. |
| `rolemenudelete 3` | Elimina un menu e il suo messaggio. |
| `rolemenuimport messageId [dropdown\|buttons]` | Sposta una vecchia configurazione di ruoli con emoji in un nuovo menu. |

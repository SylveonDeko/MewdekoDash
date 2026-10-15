---
title: Bacheche live
slug: liveboards
summary: Fissa una classifica, un grafico o una panoramica in un canale e lascia che il bot continui a modificarla, e pubblica un riepilogo di giorno, settimana o mese su una pianificazione.
icon: fa-thumbtack
category: Community
dashboard: /dashboard/liveboards
module: ServerStats
tags: [live boards, pinned leaderboard, pin leaderboard, auto updating, server report, weekly report, monthly report, digest, growth report, bacheche live, classifica fissata, aggiornamento automatico, report del server, report settimanale, report mensile, riepilogo, report di crescita]
related: [serverstats, invites, statchannels, statroles]
---

## Cosa fa

Una bacheca live è un messaggio che il bot pubblica una volta, fissa, e poi modifica a intervalli in modo che mostri sempre i numeri aggiornati. Un report del server è un embed una tantum con un grafico di crescita, pubblicato ogni giorno, ogni settimana o ogni mese, che riassume ciò che è successo dall'ultimo.

## Bacheche

| Bacheca | Mostra |
| --- | --- |
| Classifica inviti | Chi invita di più, con i conteggi regolari, usciti e falsi |
| Classifica messaggi | Chi scrive di più |
| Classifica vocale | I membri con più tempo in canali vocali |
| Giochi più giocati | I giochi e le app più giocati con il numero di giocatori (richiede il tracciamento dei giochi) |
| Grafico ingressi, Grafico uscite, Grafico crescita | Ingressi e uscite per giorno |
| Grafico membri | Numero di membri dagli snapshot orari |
| Grafico messaggi | Messaggi per giorno |
| Panoramica del server | Lo stesso riepilogo di `serveractivity` |
| Analisi inviti | Ingressi, uscite, ritenzione, ingressi falsi e fonti |

Ogni bacheca ha una **finestra** (ultimo giorno, settimana, mese o tutto il tempo; i grafici usano fino a 90 giorni per "tutto il tempo"), un intervallo di aggiornamento di almeno 5 minuti, un numero di righe per le classifiche e un interruttore di fissaggio. Un server può avere fino a 10 bacheche. Eliminare una bacheca elimina il suo messaggio. Se qualcuno elimina il messaggio a mano, il bot ne pubblica uno nuovo al successivo aggiornamento.

## Report del server

Imposta un canale e una frequenza, e il bot pubblica un report la prima volta che arriva il momento della pianificazione, poi ogni giorno alle 00:00 UTC, ogni lunedì, o il primo giorno di ogni mese. Un report contiene:

- Ingressi, uscite, crescita netta e ritenzione del periodo
- Messaggi, tempo vocale e membri attivi
- Numero di membri e come è cambiato
- Migliori invitanti, chattatori, membri vocali e canali più attivi
- Migliori codici di invito con le loro etichette, e giochi più giocati quando il tracciamento dei giochi è attivo
- Un grafico di ingressi e uscite

**Invia un report ora** ne pubblica uno subito senza modificare la pianificazione. I report si disattivano da soli se il bot perde il permesso di pubblicare nel canale.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Le bacheche si trovano anche sotto `/liveboard`, i report sotto `/serverreport`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `liveboardadd <#channel> <board> [range] [rows] [minutes]` | `pinboard`, `pinleaderboard` | Gestisci server | Pubblica e fissa una bacheca |
| `liveboardlist` | `liveboards` | Gestisci server | Tutte le bacheche |
| `liveboardremove <id>` | `unpinboard` | Gestisci server | Elimina una bacheca e il suo messaggio |
| `liveboardrefresh` | | Gestisci server | Aggiorna subito tutte le bacheche |
| `serverreportchannel [#channel]` | `reportchannel` | Gestisci server | Imposta il canale dei report e li attiva, oppure li disattiva |
| `serverreportfrequency <Daily/Weekly/Monthly>` | `reportfrequency` | Gestisci server | Con quale frequenza vengono pubblicati i report |
| `serverreportnow [frequency]` | `reportnow` | Gestisci server | Pubblica un report nel canale attuale |

## Suggerimenti e insidie

- Fissare richiede il permesso Gestisci messaggi nel canale. Senza di esso la bacheca viene comunque pubblicata, ma non fissata.
- Le bacheche modificano sempre lo stesso messaggio, quindi una bacheca in un canale molto attivo scorre via; mettile in un canale statistiche dedicato o affidati al fissaggio.
- Le classifiche rispettano le esclusioni di inviti e attività, quindi i membri nascosti o ignorati non compaiono mai in una bacheca fissata.
- I canali statistiche sono l'altro modo per mostrare numeri in tempo reale: un contatore nel nome del canale invece di un messaggio.

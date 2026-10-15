---
title: Statistiche messaggi
slug: messagestats
summary: Conta quanti messaggi invia ogni membro in ogni canale, poi consulta classifiche, dettagli per utente e per canale e grafici delle ore e dei giorni più attivi.
icon: fa-envelope
category: Analytics
dashboard: /dashboard/messagestats
module: Utility
tags: [message stats, message count, activity, leaderboard, top users, analytics, busiest hours, activity graph, statistiche messaggi, conteggio messaggi, attività, classifica, utenti più attivi, analisi, ore più attive, grafico attività]
related: [xp, utility, statchannels]
---

## Cosa fa

Una volta attivato il conteggio dei messaggi, il bot registra un conteggio per membro per canale ogni volta che un umano pubblica un messaggio che rispetta la lunghezza minima. Non viene memorizzato nulla sul contenuto, solo chi ha pubblicato, dove e quando. I conteggi vengono accodati e scritti nel database in blocchi, così i server molto attivi non rallentano il bot.

I membri possono chiedere i propri totali con `usermessages`, vedere quale canale è più attivo con `channelmessages`, o controllare l'intero server con `servermessages`. `topusers` stampa una classifica dei primi dieci con la quota di ogni membro su tutti i messaggi. `activitygraph` genera un'immagine con un grafico a barre dei giorni della settimana o delle ore del giorno più attivi.

La dashboard mostra gli stessi numeri con grafici, e permette allo staff di attivare o disattivare il conteggio, azzerare i conteggi ed esportare i dati in CSV o JSON.

## Perché usarlo

- Trova i membri più attivi per premi, ruoli o reclutamento di moderatori.
- Scopri quali canali sono morti e quali prosperano prima di riorganizzare il server.
- Scegli gli orari degli eventi usando il grafico delle ore più attive nel tuo fuso orario.
- Individua bot e account spam confrontando il numero di messaggi con la qualità dei messaggi.

## Cosa viene conteggiato

| Regola | Comportamento |
| --- | --- |
| Conteggio attivo | Non viene registrato nulla finché non si attiva `togglemsgcount` o l'interruttore della dashboard |
| Bot | Mai conteggiati |
| Messaggi privati | Mai conteggiati; solo i canali del server |
| Lunghezza minima | I messaggi più corti del numero di caratteri di **lunghezza minima del messaggio** vengono saltati; il valore predefinito è 0, quindi tutto viene conteggiato |
| Timestamp | Gli orari dei messaggi vengono conservati per 90 giorni per alimentare i grafici di ore e giorni; i totali vengono conservati senza scadenza |

La lunghezza minima accetta valori fino a 4098. Eseguire `minmsglength` senza numero mostra il valore attuale.

## Grafici di attività

`activitygraph days` richiede dati per tutti e sette i giorni della settimana e considera le ultime quattro settimane. `activitygraph hours` richiede dati per tutte e 24 le ore degli ultimi sette giorni. Per il grafico orario il bot ti chiede prima di scegliere un fuso orario, offrendo un elenco dei fusi più comuni, accettando qualsiasi nome di fuso IANA, e annullando se non rispondi. Il grafico viene pubblicato come PNG.

## Impostazioni

La pagina Statistiche messaggi ha due schede principali, **Statistiche** e **Gestione**. Statistiche contiene **Panoramica**, **Utenti migliori** e **Canali migliori**. Gestione contiene **Impostazioni** ed **Esporta dati**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Attiva conteggio messaggi | Disattivato | Se vengono registrati i nuovi messaggi |
| Lunghezza minima del messaggio | 0 | Cursore da 0 a 4098; il messaggio più corto che viene conteggiato |
| Azzera conteggi messaggi | | **Azzera tutti i conteggi del server** elimina ogni conteggio memorizzato per il server dopo conferma |
| Formato di esportazione | CSV | Download CSV o JSON delle statistiche caricate |
| Includi statistiche utente | Attivo | Aggiunge le righe degli utenti migliori all'esportazione |
| Includi statistiche canale | Attivo | Aggiunge le righe dei canali migliori all'esportazione |
| Includi dettaglio orario | Disattivato | Aggiunge all'esportazione le righe delle ore e dei giorni più attivi |

La scheda **Panoramica** mostra i riquadri **Messaggi giornalieri**, **Messaggi totali**, **Ultimo aggiornamento** e **Stato**, l'utente e il canale meno attivi, un grafico **Attività nelle 24 ore** e un grafico **Tendenza settimanale**. **Utenti migliori** elenca i **Mittenti di messaggi più attivi**, e **Canali migliori** elenca i **Canali più attivi**.

> [!NOTE]
> L'esportazione viene creata nel tuo browser a partire dalle statistiche già caricate nella pagina. Le date di inizio e fine che inserisci vengono scritte nell'intestazione del file, ma non filtrano le righe.

## Procedura di configurazione

1. Apri **Statistiche messaggi** nella dashboard, vai a **Gestione**, poi a **Impostazioni**.
2. Attiva **Attiva conteggio messaggi**.
3. Facoltativamente imposta **Lunghezza minima del messaggio** a 5, oppure esegui `minmsglength 5` su Discord, così le risposte di un solo carattere vengono ignorate.
4. Lascia che il server chatti per un giorno, poi controlla **Statistiche** per i primi numeri.
5. Dopo una settimana, esegui `activitygraph hours` e scegli il tuo fuso orario per vedere quando il server è più attivo.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `usermessages [@user]` | `usermsg`, `umsg` | Nessuno | Totale, canale più attivo e meno attivo per te o per un altro membro |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Nessuno | Totale, membro più attivo e meno attivo in un canale |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg` | Nessuno | Totale del server con membro e canale più attivi e meno attivi |
| `topusers` | `topu` | Nessuno | I primi dieci membri per numero di messaggi, con percentuali |
| `activitygraph [days or hours]` | `actgraph` | Nessuno | Grafico a barre dei giorni o delle ore più attive; predefinito giorni |
| `minmsglength [number]` | `mmlength`, `minmlength` | Gestisci server | Mostra o imposta la lunghezza minima affinché un messaggio venga conteggiato |
| `togglemsgcount` | `togglemessagecount` | Amministratore | Attiva o disattiva il conteggio |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Gestisci messaggi | Azzera i conteggi per tutto il server, per un membro, per un canale, o per un membro in un canale, dopo conferma |

## Suggerimenti e insidie

- Il conteggio inizia solo dal momento in cui viene attivato. I messaggi inviati prima non vengono mai recuperati.
- Ogni comando statistiche e la dashboard risponde "disattivato" finché il conteggio non viene attivato, anche se esistono dati vecchi.
- I conteggi vengono scritti a blocchi di massimo 100 eventi, quindi un totale può essere in ritardo di alcuni secondi rispetto alla chat in tempo reale.
- Eliminare un canale non elimina i suoi conteggi. Usa `resetmessagecounts #channel` prima di rimuovere il canale se vuoi che spariscano.
- Il grafico orario è preciso quanto il fuso orario che scegli. Salva il fuso del server con il comando del fuso orario in Amministrazione, per mantenere la coerenza tra lo staff.
- Il sistema XP ha un proprio tracciamento dell'attività e non usa questi conteggi.

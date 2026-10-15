---
title: Ripetitori
slug: repeaters
summary: Pubblica un messaggio in un canale secondo una pianificazione, quando il canale è attivo o silenzioso, oppure tienilo in fondo come messaggio fisso.
icon: fa-sync
category: Actions
dashboard: /dashboard/repeaters
module: Utility
tags: [repeater, sticky, sticky message, recurring, scheduled message, auto post, reminder, forum sticky, ripetitore, messaggio fisso, ricorrente, messaggio programmato, post automatico, promemoria, forum fisso]
related: [utility, embedbuilder]
---

## Cosa fa

Un ripetitore è un messaggio che il bot pubblica più volte in un canale. L'uso classico è un promemoria a orari fissi: "Leggete le regole" ogni sei ore. Ogni volta che scatta, il bot elimina prima la sua copia precedente, così il canale non si riempie di duplicati e il messaggio resta sempre vicino al fondo.

I ripetitori hanno cinque modalità di attivazione. Oltre a un intervallo fisso, possono scattare nel momento in cui qualcun altro pubblica (un vero messaggio fisso), dopo un certo numero di messaggi, quando il canale è stato attivo o quando è rimasto silenzioso. Le finestre orarie facoltative li limitano agli orari lavorativi, alle sere o ai fine settimana, nel fuso orario del server, e i ripetitori dei forum possono pubblicare automaticamente in ogni nuovo thread.

Il messaggio supporta il costruttore di embed completo, il testo semplice, i componenti e i segnaposto generali, quindi un ripetitore può essere un annuncio ricco invece di una semplice riga di testo. Le menzioni vengono mantenute solo se chi lo crea ha il permesso Menziona @everyone, altrimenti vengono neutralizzate.

## Perché usarlo

- Tieni le regole o un avviso "come chiedere aiuto" fissato in fondo a un canale molto attivo.
- Pubblica un promemoria giornaliero per un evento alle 18:00, ora del server.
- Inserisci le linee guida per i post in ogni nuovo thread di un forum, filtrato per tag.
- Stimola un canale morto con uno spunto di conversazione quando è rimasto silenzioso per un'ora.
- Avvia una promozione solo durante l'orario di lavoro e solo per i prossimi sette giorni.

## Modalità di attivazione

| Modalità | Quando pubblica |
| --- | --- |
| Intervallo di tempo | A ogni intervallo, facoltativamente allineato a un orario di inizio. Modalità predefinita. |
| Immediato | Pubblica una volta, poi ripubblica ogni volta che il suo messaggio non è più l'ultimo nel canale. |
| Dopo i messaggi | Pubblica quando dall'ultima esecuzione è stata inviata la soglia di messaggi impostata. |
| Su attività | Pubblica quando il canale è attivo: la soglia viene confrontata con il traffico recente nella finestra di tempo. |
| Su assenza di attività | Pubblica quando nel canale non sono stati inviati messaggi per tutta la finestra di tempo. |

Le modalità basate sull'attività vengono controllate ogni minuto e richiedono che il conteggio dei messaggi sia attivo sul server. L'intervallo deve essere compreso tra cinque secondi e 25000 minuti. Il valore predefinito è di cinque minuti, oppure di un giorno quando indichi un orario e nessun intervallo. **Soglia di attività** è predefinita a 5 messaggi e **Finestra di tempo** a cinque minuti, con un intervallo per la finestra da trenta secondi a sei ore.

## Condizioni e limiti

- **Non ripetere se il messaggio è già l'ultimo nel canale** (ridondanza): il bot salta un'esecuzione se la sua ultima copia è ancora il messaggio più recente.
- **Rilevamento conversazione**: se nell'ultimo minuto sono arrivati tre o più messaggi, l'esecuzione viene ritardata e ricontrollata dopo trenta secondi.
- **Pianificazione oraria**: `business` va dalle 09:00 alle 17:00 dal lunedì al venerdì, `evening` dalle 18:00 alle 23:00 ogni giorno, `weekend` è tutto il giorno di sabato e domenica. Gli orari usano il fuso orario del server; impostane uno prima, altrimenti il bot assume UTC e te lo ricorda.
- **Eliminazione automatica dopo** e **Visualizzazioni massime**: il ripetitore si rimuove da solo dopo un'età massima o un numero di post.
- **Silenzia notifiche**: il messaggio viene inviato in silenzio, senza far suonare il dispositivo di nessuno.
- **Priorità** è memorizzata per ogni ripetitore da 0 a 100, predefinita a 50, e viene mostrata nell'elenco.

## Thread e forum

- **Crea automaticamente nei nuovi thread**: quando viene creato un thread sotto il canale del ripetitore, il bot vi pubblica il messaggio e lo mantiene in fondo man mano che i membri rispondono.
- **Modalità solo thread**: il ripetitore non pubblica mai nel canale principale, solo nei thread. È obbligatoria quando il bersaglio è un canale forum.
- **Filtri dei tag del forum**: i tag richiesti ed esclusi decidono quali post del forum ricevono il messaggio fisso.

## Segnaposto

Il messaggio passa attraverso l'insieme generale dei segnaposto. I segnaposto utente si riferiscono al bot stesso, dato che nessuno attiva un ripetitore. Quelli utili:

| Segnaposto | Valore |
| --- | --- |
| `%server%`, `%server.name%` | Nome del server |
| `%server.members%` | Numero di membri in cache |
| `%server.id%`, `%server.icon%` | ID del server e URL dell'icona |
| `%channel%`, `%channel.name%` | Menzione e nome del canale del ripetitore |
| `%bot.name%`, `%bot.avatar%` | Nome e avatar del bot |
| `%server.time%`, `%time.day%` | Ora del server e giorno della settimana attuale |

Vengono sostituiti anche i segnaposto delle GIF di reazione, come `%huggif%`. I segnaposto di attivazione come `%user%` si risolvono nel bot.

## Impostazioni

La pagina Ripetitori ha tre schede: **Panoramica**, **Gestisci ripetitori** e **Crea nuovo**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Canale di destinazione | nessuno | Canale di testo o forum in cui pubblicare |
| Filtri dei tag del forum | nessuno | Tag richiesti ed esclusi, solo per i canali forum |
| Contenuto del messaggio | nessuno | Apre il costruttore di embed |
| Modalità di attivazione | Intervallo di tempo | Una delle cinque modalità |
| Ripeti ogni | 5 minuti | Preset da 1 minuto a Giornaliero, oppure un `HH:MM:SS` personalizzato |
| Non ripetere se il messaggio è già l'ultimo nel canale | disattivato | Controllo di ridondanza |
| Consenti menzioni @everyone e @here | disattivato | Mantiene le menzioni di massa nel messaggio invece di neutralizzarle |
| Priorità (0-100) | 50 | Il valore di priorità mostrato nell'elenco |
| Posizione in coda | 0 | Valore di ordinamento memorizzato |
| Orario di inizio (HH:MM) | nessuno | Orario del giorno a cui allineare un ripetitore a intervallo di tempo |
| Rilevamento conversazione | disattivato | Ritardo mentre le persone parlano |
| Silenzia notifiche | disattivato | Invia in silenzio |
| Crea automaticamente nei nuovi thread | disattivato | Messaggio fisso nei thread, solo per i canali forum |
| Modalità solo thread | disattivato | Salta il canale principale, solo per i canali forum |
| Eliminazione automatica dopo (giorni) | nessuno | Età massima nel formato `d.hh:mm:ss`, per esempio `7.00:00:00` |
| Visualizzazioni massime | illimitate | Numero di post prima della rimozione |
| Pianificazione oraria | nessuna | Pulsanti preset o una pianificazione personalizzata |
| Soglia di attività / Messaggi necessari | 5 | Messaggi per le modalità basate sull'attività |
| Finestra di tempo | 00:05:00 | Finestra per le modalità basate sull'attività |

**Panoramica** mostra i totali, il numero di attivi, le visualizzazioni totali, la ripartizione per modalità di attivazione e i ripetitori più attivi. **Gestisci ripetitori** elenca ciascuno con **Modifica**, **Attiva ora** ed **Elimina**, più una modifica rapida per intervallo, soglia, età massima e numero massimo di attivazioni.

## Procedura di configurazione

1. Apri **Ripetitori** nella dashboard e scegli **Crea nuovo**.
2. Scegli il **Canale di destinazione**. Per un forum, seleziona **Modalità solo thread** e imposta eventuali **Filtri dei tag del forum**.
3. Clicca sulla casella **Contenuto del messaggio** e costruisci il messaggio nel costruttore di embed.
4. Scegli una **Modalità di attivazione**. Per un messaggio fisso, scegli Immediato; per un promemoria, Intervallo di tempo con un preset di **Ripeti ogni**.
5. Apri **Opzioni avanzate** se vuoi ridondanza, invio silenzioso, una pianificazione oraria o una scadenza.
6. Clicca **Crea ripetitore**, poi usa **Attiva ora** nella scheda Gestisci per provarlo.

> [!NOTE]
> Le pianificazioni orarie richiedono un fuso orario del server. Impostalo con il comando del fuso orario prima di attivare le finestre business, evening o weekend.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Tutti richiedono Gestisci messaggi. I ripetitori si indicano con il numero mostrato da `repeatlist`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `repeat [time] [interval] <message>` | | Gestisci messaggi | Crea un ripetitore nel canale attuale, per esempio `repeat 6h Read the rules` oppure `repeat 18:00 Event tonight` |
| `repeatlist` | `replst`, `replist`, `repli` | Gestisci messaggi | Elenca i ripetitori con canale, modalità, intervallo e prossima esecuzione |
| `repeatinvoke <index>` | `repinv` | Gestisci messaggi | Attiva ora un ripetitore e riavvia il suo timer |
| `repeatremove <index>` | `reprm` | Gestisci messaggi | Elimina un ripetitore |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Gestisci messaggi | Attiva o disattiva senza eliminare |
| `repeatmessage <index> <message>` | `repmsg` | Gestisci messaggi | Sostituisce il messaggio |
| `repeatchannel <index> [#channel]` | `repchan` | Gestisci messaggi | Lo sposta in un canale di testo o forum |
| `repeatredundant <index>` | `repeatredun`, `repred` | Gestisci messaggi | Attiva o disattiva il controllo di ridondanza |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Gestisci messaggi | `timeinterval`, `immediate`, `aftermessages`, `onactivity` oppure `onnoactivity` |
| `repeatactivity <index> <threshold> <window>` | `repactivity`, `repact` | Gestisci messaggi | Imposta la soglia di attività e la finestra, per esempio `10 5m` |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Gestisci messaggi | Imposta il valore di priorità |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Gestisci messaggi | `business`, `evening`, `weekend`, oppure `none` per cancellare |
| `repeatconversation <index>` | `repconversation`, `repconv` | Gestisci messaggi | Attiva o disattiva il rilevamento delle conversazioni |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Gestisci messaggi | Attiva o disattiva l'invio silenzioso |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Gestisci messaggi | Attiva o disattiva la pubblicazione nei nuovi thread |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Gestisci messaggi | Attiva o disattiva la modalità solo thread |
| `repeatforumtags <index> <add/remove/clear/list> [required/excluded] [tags]` | `repforumtags`, `repftags` | Gestisci messaggi | Gestisce i filtri dei tag del forum tramite ID del tag |

## Suggerimenti e insidie

- Il bot ha bisogno di Invia messaggi, Inserisci link e Gestisci messaggi nel canale, perché elimina la sua copia precedente prima di pubblicare di nuovo.
- Se il canale viene eliminato o il bot perde l'accesso, il ripetitore si rimuove da solo.
- I ripetitori vengono caricati poco dopo l'avvio del bot. Fino al termine, i comandi non fanno nulla senza avvisare.
- La modalità immediata ripubblica a ogni messaggio di qualcun altro, quindi evitala nei canali molto veloci o abbinala al rilevamento delle conversazioni.
- Solo un membro con il permesso Menziona @everyone può creare un ripetitore che menziona tutti o un ruolo; altrimenti la menzione viene escapata.
- Le modalità basate sull'attività dipendono dal conteggio dei messaggi. Attivalo prima di cambiare modalità, altrimenti il comando viene rifiutato.
- La scadenza tramite Visualizzazioni massime conta ogni post, compresi quelli che attivi a mano.

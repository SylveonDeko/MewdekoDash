---
title: Registro di audit
slug: auditlog
summary: Un registro di chi ha usato la dashboard per il tuo server, cosa ha guardato e cosa ha modificato, conservato per novanta giorni.
icon: fa-clipboard-check
category: Security
dashboard: /dashboard/auditlog
tags: [audit, history, accountability, dashboard access, who changed, log, changes, before and after, cronologia, responsabilità, accesso dashboard, chi ha cambiato, registro, modifiche, prima e dopo]
related: [logging, administration, channel-access]
---

## Cosa fa

Ogni richiesta che la dashboard invia al bot per il tuo server viene registrata a nome dell'account Discord con cui si è effettuato l'accesso. La pagina Registro di audit trasforma tutto questo in una cronologia: chi ha aperto le impostazioni XP, chi ha modificato il messaggio di benvenuto, chi ha eliminato un trigger di chat, e quali erano i valori prima e dopo.

È separato dal registro di audit di Discord e dalla funzione Logging. Il registro di Discord copre le azioni fatte dentro Discord. Il Logging di Mewdeko pubblica in canali che scegli eventi del server come ingressi, modifiche e cambi di ruolo. Il registro di audit della dashboard copre solo la dashboard.

Non c'è nulla da abilitare. Le voci vengono scritte dal momento in cui qualcuno accede alla dashboard e apre il tuo server, e scadono dopo novanta giorni.

## Perché usarlo

- Più persone hanno accesso alla dashboard e vuoi sapere chi ha disattivato Anti-Raid la settimana scorsa.
- Un'impostazione è cambiata e nessuno si assume la responsabilità.
- Vuoi una traccia prima di dare accesso alla dashboard a un gruppo più ampio di staff.
- Devi confermare che una modifica che hai chiesto a qualcuno sia stata davvero fatta, e che cosa abbia sostituito.

## Cosa viene registrato

Ogni voce contiene:

- **Quando**: l'orario della richiesta, memorizzato in UTC e mostrato nel tuo fuso orario nella pagina.
- **Utente**: il nome utente e l'ID Discord presi dall'accesso alla dashboard, non da qualcosa che l'utente ha digitato.
- **Azione**: una delle azioni nella tabella sotto.
- **Sezione**: l'area della dashboard, mostrata con un nome leggibile come "AFK System", "Triggers" o "Protection".
- **Endpoint**: la richiesta esatta, per esempio `PUT Afk/123/settings`, mostrata in piccolo sotto la sezione.
- **Modifiche**: per tutto ciò che non è una visualizzazione, i valori inviati o cambiati. Espandi la voce con **Dettagli** per vederli.

Il bot memorizza anche la stringa dello user agent del browser per ogni voce.

### Azioni

L'azione viene decisa dal tipo di richiesta fatta dalla dashboard.

| Azione | Registrata quando |
| --- | --- |
| Viewed | La dashboard ha letto dei dati (una richiesta GET). Ogni caricamento di pagina produce queste voci. |
| Created | Qualcosa è stato aggiunto (una richiesta POST). |
| Updated | Qualcosa di esistente è stato modificato (una richiesta PUT o PATCH). |
| Deleted | Qualcosa è stato rimosso (una richiesta DELETE). |
| Accessed | Riservato all'avvio delle sessioni della dashboard. Il filtro lo offre, ma la versione attuale non scrive mai voci con questa azione. |

### Insiemi di modifiche

Le visualizzazioni non memorizzano dati di modifica. Per tutto il resto il bot memorizza uno di due documenti:

- **Differenza prima e dopo**: quando la sezione della dashboard salva uno snapshot dell'impostazione prima di cambiarla, la voce elenca solo i campi modificati, ciascuno con il vecchio e il nuovo valore. La maggior parte delle pagine delle impostazioni funziona così.
- **Corpo della richiesta**: quando non è stato fatto nessuno snapshot, la voce memorizza ciò che la dashboard ha inviato, senza un vecchio valore.

Ogni campo il cui nome contiene `token`, `secret`, `password`, `apikey`, `api_key`, `authorization` o `clientsecret` viene sostituito con `[redacted]` prima di essere memorizzato, così le credenziali non finiscono mai nel registro.

Nella pagina, i booleani vengono mostrati come On e Off, le liste come "3 items", le stringhe vuote come "empty" e i valori mancanti come "none". I nomi dei campi vengono convertiti in etichette leggibili.

> [!NOTE]
> Le voci "Viewed" costituiscono la maggior parte del registro, perché ogni pagina della dashboard legge le impostazioni quando si apre. Filtra per Created, Updated o Deleted quando cerchi una modifica.

### Cosa non viene registrato

- Tutto ciò che viene fatto con i comandi in Discord. Queste azioni compaiono nel registro di audit di Discord dove il bot ha agito, e in Logging se lo hai configurato.
- Le richieste che non erano legate a un utente della dashboard con accesso effettuato.
- L'apertura della pagina Registro di audit stessa, Leave Feedback, e alcuni endpoint infrastrutturali e di polling come lo stato del bot, le prestazioni, le informazioni di sistema e la gestione delle istanze.
- Alcuni endpoint esclusi esplicitamente: l'immagine dell'avatar del personaggio servita al creatore di embed, il controllo "should show" della procedura guidata di configurazione e il beacon di visualizzazione della pagina della dashboard.

## Leggere la pagina

Apri **Registro attività** sotto Security nella dashboard. L'elenco mostra prima le voci più recenti, cinquanta per pagina, con i pulsanti **Precedente** e **Avanti** e il numero totale di voci.

Due filtri compaiono sopra l'elenco:

| Filtro | Cosa fa |
| --- | --- |
| **Azione** | Mostra solo le voci Viewed, Created, Updated, Deleted o Accessed. |
| **Sezione** | Mostra solo un'area della dashboard. Le scelte sono costruite dalle sezioni presenti nelle voci attualmente caricate. |

**Aggiorna** ricarica l'elenco. Cambiare un filtro riporta alla prima pagina.

Su desktop ogni voce è una riga con un pulsante **Dettagli** quando contiene dati di modifica. Su telefono le voci sono mostrate come schede con un pulsante **Mostra dettagli**.

> [!EXAMPLE]
> Imposta il filtro **Azione** su Updated e **Sezione** su Protection per vedere ogni volta che qualcuno ha modificato un sistema di protezione, poi espandi una riga per vedere quali campi sono cambiati e da cosa a cosa.

## Conservazione

Le voci vengono conservate per **novanta giorni**. Un'attività di pulizia viene eseguita una volta al giorno, a partire cinque minuti dopo che il bot va online, ed elimina tutto ciò che è più vecchio. Non esiste un'esportazione, quindi se ti serve un registro oltre questa finestra, salvalo prima che scada.

## Chi può vederlo

La pagina è disponibile solo alle persone che possono accedere alla dashboard e sono membri del tuo server. Il proprietario del server e chiunque abbia il permesso Administrator possono sempre aprirla. Chiunque altro ha bisogno almeno dell'accesso **Vedi** alla sezione **Registro attività** in Dashboard Access, concesso per utente o per ruolo.

> [!PERMISSION]
> Poiché l'utente viene preso dal token di accesso alla dashboard, nessuno può far comparire una voce a nome di qualcun altro.

## Consigli e insidie

- Il filtro di sezione elenca solo le sezioni presenti nella pagina che stai guardando. Se una sezione manca dal menu a tendina, potrebbe comunque esistere nelle pagine successive; cancella il filtro di azione e scorri le pagine, oppure restringi prima per azione.
- Gli orari vengono mostrati nel fuso orario del browser che visualizza la pagina, non in quello del server indicato nelle impostazioni di Administration.
- Una voce "Created" significa che è stata fatta una richiesta POST, che la dashboard usa anche per alcuni interruttori e aggiornamenti. Leggi la riga dell'endpoint e i dettagli per capire che cosa è successo davvero.
- Le voci i cui dettagli mostrano valori senza un vecchio valore provengono da una sezione che non salva lo stato precedente. Vedi che cosa è stato inviato, ma non che cosa abbia sostituito.
- Il registro è per server. Cambiare server nella dashboard cambia anche il registro.

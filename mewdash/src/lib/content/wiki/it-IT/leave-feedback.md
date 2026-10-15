---
title: Feedback all'uscita
slug: leave-feedback
summary: Quando un server rimuove il bot, il suo proprietario riceve un DM che chiede il motivo. Le risposte vengono raccolte in una pagina della dashboard riservata al proprietario del bot.
icon: fa-comments
category: Analytics
dashboard: /owner/leave-feedback
tags: [leave feedback, kick feedback, why removed, churn, exit survey, owner only, bot owner, feedback uscita, feedback espulsione, motivo rimozione, abbandoni, sondaggio di uscita, solo proprietario, proprietario del bot]
related: [invites]
---

## Cosa fa

Ogni volta che il bot viene espulso da un server o ne esce, invia al proprietario del server un breve DM. Il DM contiene un menu a tendina con i motivi più comuni, un pulsante **Write something** che apre una casella di testo e un pulsante **No thanks**. Rispondere è facoltativo, e il DM lo dice esplicitamente.

Ogni risposta viene memorizzata con il nome del server, il numero di membri, il proprietario e da quanto tempo il bot era presente. Se è impostato un canale per le segnalazioni, viene pubblicato anche un embed di riepilogo, che viene aggiornato se il proprietario aggiunge un commento in seguito.

Questa è una funzione a livello di bot. Non esiste un'impostazione per server, e la pagina della dashboard compare solo per il proprietario del bot.

> [!NOTE]
> Solo il proprietario del bot può vedere la pagina Feedback all'uscita. Gli altri utenti della dashboard non la vedono nella barra laterale e non possono aprirla.

## Perché usarlo

- Capire se i server se ne vanno per funzionalità mancanti, confusione nella configurazione o problemi di affidabilità.
- Individuare i server che hanno aggiunto il bot solo per provarlo, così le loro uscite possono essere ignorate.
- Contattare i proprietari che hanno scritto un commento e lasciato i propri recapiti.
- Tenere traccia di quante volte i proprietari si prendono la briga di rispondere.

## Il messaggio

Il DM ha come titolo "Sorry to see me go!" e spiega che il bot è stato appena rimosso dal server indicato. Il menu a tendina propone questi motivi, in quest'ordine:

| Chiave del motivo | Mostrato al proprietario |
| --- | --- |
| `not_needed` | Non ci serviva più |
| `confusing` | Troppo complicato da configurare |
| `missing_features` | Mancano funzionalità che volevamo |
| `unreliable` | Era rotto o poco affidabile |
| `other_bot` | Siamo passati a un altro bot |
| `temporary` | Temporaneo, lo rimetterò |
| `testing` | Stavo solo provando qualcosa |

Scegliere un motivo lo salva subito e riapre la casella di testo. La casella è un campo di un solo paragrafo, "What could we have done better?", limitato a 1000 caratteri. **No thanks** segna il record come archiviato, e non viene mai segnalato.

Regole che evitano che diventi fastidioso:

- A un server viene chiesto al massimo una volta ogni trenta giorni, a prescindere da quante volte aggiunge e rimuove il bot.
- Se i DM del proprietario sono chiusi, non viene memorizzato nulla.
- Non viene inviato nulla quando la funzione è disattivata.

## Stati

Ogni record finisce in uno di tre stati, su cui la dashboard filtra.

| Stato | Significato |
| --- | --- |
| Answered | Il proprietario ha scelto un motivo o scritto un commento |
| Dismissed | Il proprietario ha premuto **No thanks** |
| No response | Il DM è stato inviato e per ora non è arrivata alcuna risposta |

## Impostazioni

La pagina ha due schede, **Risposte** e **Impostazioni**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Ask owners why the bot was removed | on | Se il DM viene inviato |
| Report channel ID | vuoto | Canale che riceve un embed di riepilogo per ogni risposta. Se vuoto, si usa il canale di log di ingresso/uscita del bot. |

Sotto il campo del canale, la pagina mostra a quale canale e server corrisponde l'ID e se il bot può raggiungerlo.

La scheda **Risposte** ha sei contatori, **Richieste inviate**, **Risposto**, **Con commento**, **Ignorato**, **Nessuna risposta** e **Tasso di risposta**, una ripartizione **Motivi indicati** e una tabella con le colonne **Uscito**, **Server**, **Motivo** e **Stato**. Puoi filtrare per motivo e stato (il filtro sullo stato ha anche un'opzione **Ha lasciato un commento**), cercare per nome del server o testo del commento, aprire una riga per leggere il commento completo ed eliminare un record. **Tasso di risposta** conta insieme le richieste con risposta e quelle archiviate.

## Procedura di configurazione

1. Accedi alla dashboard con l'account del proprietario del bot e apri **Feedback di uscita**.
2. Nella scheda **Impostazioni**, verifica che **Chiedi ai proprietari perché il bot è stato rimosso** sia attivo. È attivo per impostazione predefinita.
3. Incolla un ID di canale in **ID del canale delle segnalazioni** e clicca **Salva canale**, oppure lascia vuoto per usare il canale di ingresso/uscita.
4. Rimuovi il bot da un server di prova di cui sei proprietario e rispondi al DM.
5. Controlla la scheda **Risposte** e il canale delle segnalazioni per la voce.

## Comandi

Questa funzione è solo da dashboard. Non ci sono comandi del bot; i proprietari rispondono tramite i pulsanti e il menu a tendina nel DM.

## Consigli e insidie

- Il bot invia un DM solo alla persona che Discord indica come proprietario del server, non a chi lo ha espulso.
- Il periodo di attesa di trenta giorni è per server, quindi un server che riaggiunge e rimuove il bot entro quella finestra non viene interpellato due volte.
- L'embed di riepilogo va al canale configurato, oppure al canale di log di ingresso/uscita dalle credenziali del bot se non ne è impostato uno. Se non esiste né l'uno né l'altro, le risposte vengono comunque memorizzate e visibili nella pagina.
- Eliminare un record dalla dashboard non elimina l'embed già pubblicato nel canale delle segnalazioni.

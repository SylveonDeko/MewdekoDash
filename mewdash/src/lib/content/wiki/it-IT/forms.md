---
title: Moduli
slug: forms
summary: Crea candidature, sondaggi, ricorsi per ban e candidature per entrare nella dashboard, raccogli le risposte tramite un link condivisibile e approvale o rifiutale da Discord o dalla coda delle risposte.
icon: fa-clipboard
category: Community
dashboard: /dashboard/forms
module: Forms
tags: [forms, application, survey, questionnaire, ban appeal, join application, review, approve, reject, responses, csv, moduli, candidatura, sondaggio, questionario, ricorso per ban, candidatura per entrare, revisione, approva, rifiuta, risposte]
related: [administration, moderation, rolestates]
---

## Cosa fa

Lo staff crea un modulo nella dashboard: un nome, un insieme di domande e regole su chi può rispondere e su cosa succede dopo. La pubblicazione genera un link di condivisione permanente. Un membro apre il link, accede con Discord, compila le domande pagina per pagina, controlla le proprie risposte e le invia. Mentre scrive, i suoi progressi vengono salvati come bozza, così può tornare più tardi.

Ogni invio viene pubblicato come embed nel canale che scegli, con i pulsanti **Approva** e **Rifiuta** se il modulo richiede una decisione. I revisori premono un pulsante su Discord oppure usano la scheda **Risposte** della dashboard. Chi ha inviato riceve un DM con la decisione e le eventuali note, e può seguirla in qualsiasi momento su una pagina di stato.

I moduli sono di tre tipi. Un modulo normale è per i membri. Un modulo di ricorso per ban è per chi è attualmente bannato, e se viene approvato il ban viene rimosso. Una candidatura per entrare è per chi non si trova nel server, e se viene approvata gli viene inviato un invito monouso con dei ruoli che lo attendono quando entra.

I moduli non hanno comandi. Tutto, tranne i due pulsanti di revisione, avviene nella dashboard.

## Perché usarlo

- Candidature per lo staff, per partner o per eventi con una vera coda di revisione invece di una pila di DM.
- Un processo di ricorso per ban con periodi di attesa, limiti di tentativi e sblocco automatico all'approvazione.
- Una community ad accesso controllato in cui i candidati vengono verificati prima di ricevere un invito.
- Sondaggi di feedback con un limite di risposte ed esportazione CSV.

## Tipi di modulo

| Tipo | Chi può inviare | All'approvazione |
| --- | --- | --- |
| Modulo normale | Membri, oppure chiunque se **Consenti a persone esterne al server** è attivo | Solo modifiche ai ruoli, se configurate |
| Ricorso per ban | Persone attualmente bannate dal server | Il ban viene rimosso |
| Candidatura per entrare | Persone che non sono nel server | Viene creato un invito e gli eventuali **Ruoli che li attendono all'ingresso** vengono salvati come stato del ruolo, così vengono applicati quando la persona entra |

Il tipo è fisso una volta creato il modulo. Ricorsi per ban e candidature per entrare passano sempre dalla revisione; i moduli normali ci passano solo se **Le risposte richiedono approvazione** è attivo.

## Domande

Le domande si aggiungono nel costruttore, sotto **Domande**. I tipi sono:

| Tipo | Risposta | Opzioni |
| --- | --- | --- |
| Testo breve | Una riga | Lunghezza minima e massima, fino a 5000 |
| Testo lungo | Più righe | Stessi limiti di lunghezza |
| Scelta multipla | Una delle opzioni elencate | Fino a 25 opzioni |
| Caselle di controllo | Più opzioni | Fino a 25 opzioni; **Valore minimo** e **Valore massimo** limitano quante se ne possono selezionare |
| Menu a tendina | Un'opzione da un elenco | Fino a 25 opzioni |
| Numero | Un numero | Valore minimo e massimo |
| Email | Un indirizzo email valido | |
| URL | Un indirizzo `http` o `https` | |
| Interruzione di sezione | Niente; inizia una nuova pagina e può avere un titolo e un'introduzione | |

Il testo della domanda è limitato a 500 caratteri, i segnaposto a 200 e ogni risposta a 4000 caratteri. Ogni domanda può avere un URL di immagine e può essere contrassegnata come obbligatoria. Una domanda può anche essere obbligatoria solo quando una risposta precedente soddisfa una condizione.

### Inserimento delle risposte

Attiva l'inserimento delle risposte per una domanda e scrivi `{{Q12}}` nel suo testo o nel suo segnaposto, dove 12 è l'ID di una domanda precedente. Viene inserita la risposta precedente, tagliata a 100 caratteri. Se non era stata data risposta, al suo posto appare il testo della domanda tra parentesi quadre. Una domanda può usare solo risposte di domande che si trovano sopra di essa.

### Condizioni

Ogni domanda può essere mostrata solo quando una condizione è vera. Le domande nascoste vengono saltate nella pagina, e le risposte inviate per esse vengono scartate sul server.

| Tipo di condizione | Mostrata quando |
| --- | --- |
| Basata sulle risposte | Una risposta precedente corrisponde: **Uguale a**, **Diverso da**, **Contiene**, **Maggiore di** o **Minore di** |
| Basata sui ruoli | Il membro possiede **Almeno uno di**, **Tutti**, oppure **Nessuno di** i ruoli scelti |
| Anzianità nel server | Il membro è nel server da almeno N giorni, oppure il suo account ha almeno N giorni |
| Boost/Nitro | Il membro sta potenziando il server. Il controllo Nitro è una stima basata su avatar e dati di boost. |
| Basata sui permessi | Il membro possiede tutti i permessi scelti |
| Più condizioni | Più righe combinate. Le righe dello stesso gruppo devono essere tutte vere (AND); se un gruppo è vero, la domanda viene mostrata (OR). |

I confronti testuali ignorano le maiuscole. Maggiore di e minore di confrontano i numeri.

## Chi può inviare

Il modulo respinge le persone, indicando il motivo, in quest'ordine: è ancora una bozza, non accetta risposte, non ha raggiunto **Si apre il**, ha superato **Si chiude il**, l'account è più recente di **Età minima dell'account Discord**, il limite **Totale risposte accettate** è pieno, la persona ha già risposto e le risposte multiple sono disattivate, non possiede il **Ruolo richiesto per inviare**, e infine la regola del tipo descritta sopra.

**Permetti di riprovare a chi è stato rifiutato** significa che una risposta rifiutata non viene più conteggiata come "già risposto". Se **Richiedi un captcha** è attivo, al passo di revisione compare un controllo Cloudflare Turnstile.

I ricorsi per ban aggiungono i propri limiti sotto **Limiti dei ricorsi**: un'attesa dopo il ban (calcolata dalla voce del registro di controllo del ban), un numero massimo di ricorsi, un tempo di attesa tra un ricorso e l'altro, e **Un rifiuto è definitivo**. Un ricorso ancora in attesa blocca un nuovo ricorso.

## Compilare un modulo

La pagina pubblica richiede un accesso Discord. Le risposte vengono salvate come bozza circa un secondo e mezzo dopo l'ultimo tasto premuto e quando si passa alla pagina successiva. Tornando entro 30 giorni, la bozza viene ripristinata con un banner "Abbiamo recuperato ciò che avevi già scritto" e un pulsante **Ricomincia**.

Una barra di avanzamento mostra le domande con risposta. L'ultima pagina termina con **Rivedi e continua**, che elenca ogni risposta con un link **Modifica**, poi **Conferma e invia**. Dopo l'invio la pagina mostra il tuo **Messaggio dopo l'invio** (oppure un predefinito per tipo) e un link **Controlla il tuo stato**. La pagina di stato rimanda anche a **Le mie candidature** su `/forms/submissions`, che elenca ogni risposta non anonima che l'utente connesso ha inviato su tutti i server.

Chi ha inviato può modificare le proprie risposte dalla pagina di stato finché la risposta è in attesa, purché il modulo non sia anonimo e non sia chiuso. Le risposte precedenti vengono conservate come revisioni. Chi ha inviato non può ritirare una risposta.

## Cosa succede all'invio

1. Vengono concessi i ruoli in **Ruoli assegnati all'invio** e il **Ruolo durante la revisione**.
2. Se è impostato **Dove vengono pubblicate le risposte**, lì viene pubblicato un embed che mostra l'utente (oppure "Anonimo (accesso richiesto)"), l'ora e fino a 20 risposte, menzionando **Menziona quando arriva una risposta**. I pulsanti Approva e Rifiuta vengono allegati quando il modulo viene revisionato.
3. Se è impostato **Invia a un webhook**, lo stesso embed viene pubblicato su quel webhook, senza pulsanti. Quando la risposta viene approvata o rifiutata, anche sul webhook arriva un secondo messaggio con l'esito, il revisore e il motivo. L'URL deve essere un webhook Discord; qualsiasi altra cosa viene ignorata con un avviso nel log del bot, e un webhook che fallisce non blocca mai l'invio.
4. La risposta compare nella scheda **Risposte** con stato In attesa di revisione.

I moduli anonimi non salvano l'ID utente, quindi non possono modificare i ruoli e le loro risposte non possono essere modificate.

## Il processo di revisione

Le risposte passano da In attesa di revisione ad Approvata o Rifiutata. **Chi può approvare o rifiutare** indica un ruolo; chiunque abbia Gestisci server o Amministratore può sempre decidere. Se non è impostato alcun ruolo di revisore, anche chi possiede i ruoli di approvazione può decidere.

Su Discord, **Approva** decide subito. **Rifiuta** apre una finestra che chiede un motivo, obbligatorio perché viene inviato a chi ha fatto la richiesta. In entrambi i casi l'embed cambia colore, riceve un campo **Approvata** o **Rifiutata** con revisore e ora, il motivo se presente, e perde i pulsanti. Nella dashboard la stessa decisione si prende dalla coda con una casella **Note per chi ha inviato**.

Alla decisione il bot:

- Aggiunge e rimuove i ruoli in **Aggiungi all'approvazione**, **Rimuovi all'approvazione**, **Aggiungi al rifiuto** e **Rimuovi al rifiuto**, e rimuove sempre il ruolo di attesa di revisione. Un ruolo presente su entrambi i lati viene rimosso.
- Sblocca l'utente per un ricorso per ban approvato, oppure crea l'invito per una candidatura per entrare approvata.
- Invia un DM a chi ha inviato con "La tua risposta è stata approvata" oppure "La tua risposta non è stata accettata", con le note, il tuo **Messaggio dopo l'invio** in caso di approvazione, e l'invito. Se il DM fallisce, l'embed e la coda lo segnalano.

Le emoji dei pulsanti di revisione provengono dal modulo, poi dalle **Impostazioni predefinite del server** nella scheda **Impostazioni**, poi da un semplice segno di spunta e di croce.

## Versioni

Ogni salvataggio di un modulo conserva una versione, fino alle ultime 20. **Cronologia versioni** mostra ciascuna con un confronto delle impostazioni e delle domande e un pulsante **Ripristina**. Il ripristino ricrea le domande con nuovi ID e riscrive condizioni e inserimenti in modo che corrispondano.

## Impostazioni

La pagina **Moduli** ha le schede **Moduli**, **Crea** e **Impostazioni**, più **Modifica** e **Risposte** quando un modulo è selezionato. Le schede Crea e Modifica condividono un solo pannello impostazioni.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Nome | vuoto, obbligatorio | Titolo del modulo, fino a 255 caratteri |
| Descrizione | vuota | Mostrata sotto il titolo e nelle anteprime dei link su Discord |
| Dove vengono pubblicate le risposte | nessuno | Canale per l'embed dell'invio; se vuoto le risposte restano solo nella dashboard |
| Messaggio dopo l'invio | nessuno | Testo della pagina di conferma e del DM di approvazione |
| Bozza | attivo per i nuovi moduli | Non si può inviare alle bozze |
| Accetta risposte | attivo | Disattiva per chiudere senza eliminare |
| Ruolo richiesto per inviare | Chiunque nel server | Limita tramite ruolo |
| Età minima dell'account Discord | Nessun limite | Giorni |
| Consenti a persone esterne al server | disattivato | Solo moduli normali |
| Invia in forma anonima | disattivato | Non registra chi ha inviato |
| Si apre il, Si chiude il | nessuno | Finestra temporale; un annuncio di apertura richiede un orario di apertura |
| Totale risposte accettate | Nessun limite | Limite complessivo per tutti |
| Consenti più di una risposta per persona | disattivato | |
| Permetti di riprovare a chi è stato rifiutato | disattivato | |
| Richiedi un captcha | disattivato | Turnstile al passo di revisione |
| Annuncia l'apertura in, Menziona con l'annuncio, Testo dell'annuncio | nessuno | Embed di lancio con conto alla rovescia per la chiusura, inviato entro circa un minuto da **Si apre il** o alla pubblicazione |
| Menziona quando arriva una risposta | nessuno | Ruolo menzionato a ogni invio |
| Ruoli assegnati all'invio | nessuno | Concessi subito |
| Ruolo durante la revisione | nessuno | Rimosso alla decisione |
| Invia a un webhook | nessuno | URL del webhook Discord che riceve anche ogni embed di invio e ogni decisione di approvazione o rifiuto |
| Le risposte richiedono approvazione | disattivato | Aggiunge la revisione a un modulo normale |
| Chi può approvare o rifiutare | Solo Gestisci server | Ruolo revisore |
| Emoji del pulsante Approva, Emoji del pulsante Rifiuta | predefinita del server | |
| Aggiungi/Rimuovi all'approvazione, Aggiungi/Rimuovi al rifiuto | nessuno | Modifiche ai ruoli alla decisione |
| Un rifiuto è definitivo, Attesa dopo il ban, Ricorsi consentiti, Attesa tra i ricorsi | disattivato, Nessuna attesa, Illimitati, Nessuna attesa | Solo ricorsi per ban |
| Volte in cui l'invito può essere usato, L'invito scade dopo (secondi), Ruoli che li attendono all'ingresso | 1, 86400, nessuno | Solo candidature per entrare |

Le impostazioni che non si applicano al tipo del modulo vengono eliminate al salvataggio.

## Guida alla configurazione

1. Apri **Moduli** nella dashboard e premi **Crea**.
2. Scegli il **Tipo di modulo**. Non si può cambiare in seguito.
3. Compila **Nome** e **Descrizione**, e scegli **Dove vengono pubblicate le risposte**.
4. In **Domande**, aggiungi le domande, contrassegna quelle obbligatorie e usa **Aggiungi pagina** per dividere i moduli lunghi.
5. Imposta chi può inviare e, se vuoi una fase di revisione, attiva **Le risposte richiedono approvazione** e scegli **Chi può approvare o rifiutare**.
6. Premi **Salva modulo**. Usa **Anteprima** sulla scheda del modulo per percorrerlo come amministratore.
7. Premi **Pubblica** sulla scheda, poi **Copia link** e pubblica il link dove i candidati lo troveranno.
8. Controlla la scheda **Risposte**, oppure il canale degli invii, e decidi ogni risposta.

## Comandi

I moduli non hanno comandi testuali o slash. L'unica interazione su Discord sono i pulsanti **Approva** e **Rifiuta** su ogni embed di invio.

## Suggerimenti e insidie

- Il bot ha bisogno del permesso Gestisci ruoli, e il suo ruolo deve stare sopra ogni ruolo che un modulo assegna o rimuove. I ruoli sopra il bot, i ruoli gestiti e il ruolo everyone vengono saltati senza avvisi.
- I ricorsi per ban richiedono il permesso Visualizza registro di controllo per il controllo "attesa dopo il ban". Lo sblocco richiede Banna membri, e gli inviti delle candidature per entrare richiedono Crea invito in un canale visibile a tutti.
- L'embed di invio mostra al massimo 20 risposte; la risposta completa è nella dashboard.
- **Esporta CSV** nella scheda Risposte include una colonna per domanda, con le risposte a selezione multipla separate da punto e virgola.
- Il filtro delle risposte e la pagina fanno parte dell'URL, quindi puoi salvare nei preferiti "solo in attesa" e condividerlo con i revisori.
- Le bozze non vengono mai validate, quindi una bozza ripristinata potrebbe comunque non superare la validazione al momento dell'invio.
- I moduli scaduti vengono chiusi da un controllo che gira ogni minuto; l'idoneità viene verificata anche al momento dell'invio, così nulla sfugge nel frattempo.

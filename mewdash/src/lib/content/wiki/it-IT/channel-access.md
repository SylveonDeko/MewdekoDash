---
title: Accesso al canale
slug: channel-access
summary: Proteggi un canale privato con un modulo di candidatura e lascia che i membri già presenti votino su chi può entrare.
icon: fa-lock
category: Security
dashboard: /dashboard/channel-access
module: ChannelAccess
tags: [channel access, gate, application, apply, vote, private channel, locked channel, inner circle, blacklist, review, accesso al canale, cancello, candidatura, voto, canale privato, canale bloccato, cerchia ristretta, lista nera, revisione]
related: [administration, tickets, forms]
---

## Cosa fa

Lo staff applica un "cancello" a un canale che la maggior parte dei membri non può vedere. I membri cliccano il pulsante **Apply for access** oppure eseguono `channelaccessapply`, e compilano un breve modulo di al massimo cinque domande. La candidatura viene pubblicata come embed in un canale di revisione, con i pulsanti **Approva**, **Nega**, **Abstain** facoltativo e **Dettaglio**.

Le persone che possono già vedere il canale votano. Una volta arrivate abbastanza approvazioni, il candidato viene ammesso, ricevendo un ruolo oppure una sovrascrittura personale dei permessi sul canale. Un numero sufficiente di rifiuti, oppure la chiusura della finestra di voto, lo respinge. Lo staff può forzare in qualsiasi momento uno dei due esiti.

Il candidato viene informato del risultato in DM, se il cancello lo consente, e i candidati respinti devono attendere un cooldown prima di candidarsi di nuovo. Tutto viene registrato in un canale di log facoltativo.

## Perché usarlo

- Una sala riservata ai membri o una "cerchia ristretta" in cui sono i membri esistenti a decidere chi entra.
- Un canale per adulti verificati in cui un piccolo gruppo fidato garantisce per i nuovi arrivati.
- Canali di scambi o mercatino che vogliono un controllo prima che qualcuno possa scrivere.
- Qualsiasi canale in cui vuoi una candidatura scritta senza che lo staff debba leggerle tutte da solo.

## Cancelli

Un cancello è un canale più le sue regole. Ogni canale può avere un solo cancello. Creare un cancello con un ruolo lo rende un **cancello di ruolo**; crearlo senza ruolo lo rende un **cancello diretto**.

| Modalità di accesso | Etichetta nella dashboard | Come viene concesso l'accesso | Chi conta come "dentro" |
| --- | --- | --- | --- |
| Role | Give them a role | Il ruolo di accesso viene aggiunto al candidato | Chiunque abbia il ruolo di accesso |
| Channel permission | Add them to the channel directly | Viene scritta per quel membro una sovrascrittura di permesso Visualizza canale su Consenti | Chiunque possa vedere il canale in questo momento |

I membri approvati non vengono mai rimossi automaticamente. Il ruolo va tolto oppure la sovrascrittura va eliminata da te.

## Candidature

Prima che una candidatura si apra, il bot controlla in quest'ordine: il cancello accetta candidature, il membro non ha già l'accesso, non è bloccato, il suo account e la sua iscrizione al server sono abbastanza vecchi, non ha una candidatura aperta per questo cancello, e il suo cooldown per ricandidarsi è scaduto. Se un controllo non viene superato, viene mostrato un messaggio effimero che spiega il motivo.

Se il cancello ha delle domande, si apre un modulo con una casella per ogni domanda. Le domande sono limitate a 45 caratteri per via dei limiti dei moduli di Discord. Le risposte sono a riga singola (200 caratteri) oppure multiriga (1000 caratteri) e possono essere rese obbligatorie. Un cancello senza domande invia subito.

Il messaggio di revisione va nel **Canale di revisione**, oppure direttamente nel canale protetto se non ne è impostato uno. Mostra il candidato, quando è stato creato il suo account e quando è entrato nel server, ogni domanda con la risposta, un conteggio dei voti in tempo reale e un piè di pagina con la data di chiusura della votazione. Se è attiva l'opzione **Nascondi il candidato fino alla chiusura del voto**, il nome viene sostituito con "Hidden until the vote closes" finché la candidatura è in attesa.

### Stati

| Stato | Significato |
| --- | --- |
| Pending | Aperta e in votazione |
| Approved | Approvata, l'accesso è stato concesso |
| Denied | Respinta tramite voto, scadenza o dallo staff |
| Withdrawn | Il candidato l'ha ritirata con `channelaccesswithdraw` |
| Expired | Non usato dalle regole di scadenza attuali; mantenuto nello storico |

## Votazione

Chi può votare dipende dal cancello. Se è impostato un **Ruolo votante**, possono votare solo i membri con quel ruolo. Altrimenti può votare chiunque abbia già accesso al canale, più chiunque abbia il permesso Gestisci ruoli. I candidati non possono mai votare sulla propria candidatura.

Cliccare un pulsante registra un voto. Cliccare un pulsante diverso lo cambia. Cliccare di nuovo lo stesso pulsante lo rimuove. Il conteggio si aggiorna nel messaggio dopo ogni modifica.

La candidatura si risolve appena le approvazioni raggiungono **Approvazioni necessarie** oppure i rifiuti raggiungono **Rifiuti necessari**. Impostare una delle due soglie a 0 disattiva quel lato, quindi un cancello con **Rifiuti necessari** a 0 può essere respinto solo dallo staff o dalla scadenza.

**Dettaglio** mostra chi ha votato in quale direzione, ma solo ai votanti. Con **Nascondi chi ha votato cosa** attivo, solo i membri con Gestisci ruoli possono vederlo.

### Quando la finestra si chiude

Un controllo in background viene eseguito ogni minuto sulle candidature oltre la loro **Voting window**. Cosa succede è impostato per ogni cancello:

| Opzione | Etichetta nella dashboard | Risultato |
| --- | --- | --- |
| Deny | Deny the application | La candidatura viene respinta. Predefinito. |
| Majority | Whichever side has more votes | Approvata se le approvazioni superano i rifiuti, altrimenti respinta |
| StayOpen | Leave it open for staff | Non succede nulla finché lo staff non la risolve |

Imposta **Voting window** a 0 per nessun limite di tempo.

## Bloccare i candidati

Lo staff può bloccare un utente da un solo cancello oppure da tutti i cancelli del server. Gli utenti bloccati ricevono "You are blocked from applying for this channel" quando ci provano. I blocchi possono avere un motivo facoltativo, che compare nella lista nera.

## Impostazioni

La pagina **Accesso ai canali** ha tre schede: **Accessi**, **Candidature** e **Bloccati**.

**Accessi** elenca ogni cancello con un interruttore **Accetta candidature** e si espande per mostrare le sue impostazioni, le **Domande di candidatura** e un poster **Pannello di candidatura**. I valori predefiniti sotto si applicano ai nuovi cancelli.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Locked channel | obbligatorio | Il canale protetto |
| How people get in | Give them a role | Cancello di ruolo o cancello diretto |
| Role granted on approval | nessuno | Il ruolo di accesso, per i cancelli di ruolo |
| Approvals needed | 3 | Approvazioni che portano all'esito approvato; 0 disattiva |
| Denials needed | 3 | Rifiuti che portano all'esito respinto; 0 disattiva |
| Voting window (hours) | 72 | Tempo prima che si applichi la regola di scadenza; 0 per nessun limite |
| When the window closes | Deny the application | Una delle tre opzioni di scadenza |
| Review channel | il canale protetto stesso | Dove vengono pubblicate le candidature per il voto |
| Log channel | nessun log | Dove vengono registrate le nuove candidature e gli esiti |
| Voter role | chiunque abbia il ruolo di accesso | Limita il voto a un solo ruolo |
| Ping role on new applications | nessun ping | Ruolo menzionato quando arriva una candidatura |
| Min account age (days) | 0 | Rifiuta gli account più giovani di così |
| Min time in server (days) | 0 | Rifiuta i membri entrati più di recente di così |
| Reapply cooldown (hours) | 168 | Attesa dopo un rifiuto o una scadenza prima di candidarsi di nuovo |
| Offer an abstain button | on | Aggiunge un pulsante Abstain al messaggio di revisione |
| Hide the applicant until the vote closes | off | Candidato anonimo mentre è in attesa |
| Hide who voted which way | off | Breakdown solo per Manage Roles |
| DM the applicant on a decision | on | Invia l'esito in DM |

**Candidature** elenca le candidature filtrate per cancello e stato, con il conteggio e i pulsanti **Approva** e **Nega** per quelle in attesa. **Bloccati** elenca gli utenti bloccati per ambito e permette di **Blocca** qualcuno da un cancello o da **Ogni accesso**, con un motivo facoltativo.

## Procedura di configurazione

1. Rendi il canale privato in Discord e, per un cancello di ruolo, crea il ruolo che potrà vederlo.
2. Apri **Accesso ai canali** nella dashboard e usa **Apri candidature per un canale**. Scegli il **Canale bloccato**, seleziona **Come si entra** e, se serve, il ruolo.
3. Espandi il cancello. Imposta un **Canale di revisione** perché le candidature non finiscano nel canale protetto, e un **Canale di log** se vuoi un registro.
4. Regola **Approvazioni necessarie**, **Rifiuti necessari** e la **Voting window** in base a quanti votanti prevedi.
5. In **Domande di candidatura**, aggiungi fino a cinque domande. Spunta **Obbligatorio** e **Risposta su più righe** dove serve.
6. In **Pannello di candidatura**, scegli dove mettere il pulsante e clicca **Pubblica pannello**.
7. Candidati da un account di prova, vota da un membro che ha l'accesso e verifica che il candidato entri.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Le versioni slash si trovano sotto `/channelaccess`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `channelaccesssetup <#channel> [@role]` | `casetup` | Manage Roles | Crea un cancello; ometti il ruolo per un cancello diretto |
| `channelaccessremove <#channel>` | `caremove` | Manage Roles | Elimina un cancello con le sue domande e lo storico |
| `channelaccesslist` | `calist` | Nobody | Elenca i cancelli con soglie, finestra e stato |
| `channelaccessconfig <#channel> [setting] [value]` | `caconfig` | Manage Roles | Cambia una sola impostazione; senza impostazione mostra l'elenco |
| `channelaccesspanel <#channel> [#target]` | `capanel` | Manage Roles | Pubblica il pulsante di candidatura, per impostazione predefinita nel canale corrente |
| `channelaccessquestionadd <#channel> <question>` | `caqadd` | Manage Roles | Aggiunge una domanda obbligatoria multiriga |
| `channelaccessquestionremove <#channel> <position>` | `caqremove` | Manage Roles | Rimuove una domanda tramite il numero in elenco |
| `channelaccessquestionlist <#channel>` | `caqlist` | Manage Roles | Mostra le domande in ordine |
| `channelaccessapply <#channel>` | `caapply` | Nobody | Pubblica il pulsante di candidatura per te |
| `channelaccesswithdraw <id>` | `cawithdraw` | Nobody | Ritira una tua candidatura aperta |
| `channelaccesshistory [@user]` | `cahistory` | Nobody | Lo storico delle tue candidature; per altri utenti serve Manage Roles |
| `channelaccesspending [#channel]` | `capending` | Nobody | Elenca le candidature aperte, eventualmente per un solo cancello |
| `channelaccessapprove <id> [reason]` | `caapprove` | Manage Roles | Approva indipendentemente dai voti |
| `channelaccessdeny <id> [reason]` | `cadeny` | Manage Roles | Respinge indipendentemente dai voti |
| `channelaccessblacklistadd <@user> [#channel]` | `cabladd` | Manage Roles | Blocca da un cancello, oppure ovunque senza canale |
| `channelaccessblacklistremove <@user> [#channel]` | `cablremove` | Manage Roles | Revoca un blocco; indica lo stesso canale su cui era stato impostato |
| `channelaccessblacklist` | `cablacklist` | Manage Roles | Elenca gli utenti bloccati |

Le impostazioni accettate da `channelaccessconfig` sono `enabled`, `approvals`, `denials`, `votehours`, `onexpiry` (`deny`, `majority`, `stayopen`), `reviewchannel`, `logchannel`, `voterrole`, `pingrole`, `anonymousapplicant`, `anonymousvotes`, `allowabstain`, `minaccountage`, `minserverage`, `reapplycooldown` e `dmondecision`.

> [!EXAMPLE]
> `caconfig #inner-circle approvals 5` seguito da `caconfig #inner-circle onexpiry majority`.

## Consigli e insidie

- Il bot ha bisogno del permesso Gestisci ruoli per i cancelli di ruolo e del permesso Gestisci canali (con il permesso di modificare le sovrascritture di quel canale) per i cancelli diretti. Il suo ruolo più alto deve stare sopra il ruolo di accesso.
- Se non è impostato un **Canale di revisione**, le candidature vengono pubblicate dentro il canale protetto. Va bene per "i membri votano sui nuovi arrivati", ma imposta un canale separato se a votare deve essere lo staff.
- Le domande aggiunte tramite comando sono sempre obbligatorie e multiriga. Usa la dashboard per rendere una domanda facoltativa o a riga singola, oppure per darle un testo segnaposto.
- Eliminare un cancello rimuove in modo permanente le sue domande, le candidature e i voti.
- I membri che lasciano il server prima della fine della votazione non ricevono l'accesso, anche se approvati.
- Gli esiti di voto e di scadenza vengono inviati in DM solo per approvazioni e rifiuti. Le candidature ritirate non ricevono alcun DM.
- Un utente bloccato va sbloccato con lo stesso ambito con cui è stato bloccato. Un blocco a livello di server non viene revocato da una revoca che indica un canale.

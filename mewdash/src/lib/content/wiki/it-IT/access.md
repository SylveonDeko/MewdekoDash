---
title: Accesso alla dashboard
slug: access
summary: Permetti a membri o ruoli specifici di aprire la dashboard del tuo server e di vedere o gestire solo le sezioni che scegli, senza renderli amministratori di Discord.
icon: fa-key
category: Security
dashboard: /dashboard/access
tags: [dashboard access, permissions, grant, staff, restrict, who can edit, view, manage, managers, delegation, accesso dashboard, permessi, concessione, staff, limitare, chi può modificare, visualizza, gestisci, gestori, delega]
related: [auditlog, administration]
---

## Cosa fa

Di base, solo il proprietario del server e i membri con il permesso Amministratore possono aprire un server nella dashboard. Accesso alla dashboard ti permette di allargare questa cerchia. Scegli un membro o un ruolo, decidi quali sezioni della dashboard ottiene e se ciascuna è **Vedi** oppure **Gestisci**. Da quel momento quel server compare nell'elenco dei server della loro dashboard e le sezioni che hai concesso funzionano per loro; tutto il resto viene rifiutato.

Il controllo avviene sull'API del bot, non solo nella pagina web. Ogni richiesta che indica un server porta con sé l'identità dell'utente che ha effettuato l'accesso. Se è il proprietario o un Amministratore, la richiesta passa. Altrimenti il bot cerca la sezione a cui appartiene la richiesta, considera le letture come **Vedi** e ogni modifica come **Gestisci**, e confronta il tutto con il livello più alto che l'utente possiede direttamente oppure tramite uno dei suoi ruoli.

Anche il proprietario del server decide chi può modificare la lista degli accessi. Per impostazione predefinita, solo il proprietario. Può nominare gestori degli accessi specifici oppure attivare un interruttore per permettere a chiunque abbia il permesso Amministratore o Gestisci server di farlo.

## Perché usarlo

- Un team della community gestisce giveaway, suggerimenti e ticket dalla dashboard senza avere il permesso Amministratore in Discord.
- Un ruolo moderatore ottiene **Gestisci** su Moderation e Logging e **Vedi** su tutto il resto, così può guardare ma non cambiare impostazioni che non gli competono.
- Un collaboratore del bot è di fiducia per modificare XP e Currency, ma non nulla legato alla sicurezza.
- Il proprietario delega la manutenzione della lista degli accessi a un ruolo co-proprietario senza cedere i controlli riservati al proprietario.

## Livelli di accesso

| Livello | Consente |
| --- | --- |
| None | Nulla per quella sezione; la sezione non viene concessa |
| View | Solo richieste di lettura, come aprire la pagina e caricarne i dati |
| Manage | Tutto ciò che consente View più creare, modificare ed eliminare |

Quando un membro corrisponde a più concessioni, per esempio una concessione personale e una concessione tramite ruolo, vince il livello più alto per ciascuna sezione. Un membro con almeno una sezione concessa vede il server nel selettore dei server della dashboard; un membro senza alcuna concessione non lo vede.

Proprietari e Amministratori aggirano completamente le concessioni e hanno sempre accesso completo.

## Sezioni

Le sezioni corrispondono alla barra laterale della dashboard. Ogni funzione nel selettore corrisponde a una o più aree dell'API del bot, quindi concedere "Administration" copre sia gli endpoint di Administration sia quelli di Protection, e "Moderation" copre anche Protection. Il selettore raggruppa le sezioni per categoria della barra laterale, e le funzioni che sono infrastruttura globale del bot anziché dati per server, come Performance, non possono essere concesse.

Quando una concessione copre una funzione che corrisponde a più aree, il selettore mostra il livello più basso condiviso tra di esse; impostare il gruppo imposta tutte le sue aree in una volta sola.

## Chi può gestire la lista degli accessi

| Chi | Può fare |
| --- | --- |
| Proprietario del server | Tutto: l'interruttore di delega, l'elenco dei gestori e tutte le concessioni |
| Gestori degli accessi nominati | Aggiungere, modificare e rimuovere concessioni |
| Membri con Amministratore o Gestisci server | Aggiungere, modificare e rimuovere concessioni, solo mentre l'interruttore di delega è attivo |
| Tutti gli altri | Vedono "You can't manage dashboard access here" |

I gestori degli accessi possono essere un membro o un ruolo. Solo il proprietario può vedere o modificare l'elenco dei gestori e l'interruttore di delega; l'API rifiuta queste chiamate da chiunque altro.

> [!WARNING]
> Concedere **Gestisci** su Dashboard Access non è possibile, perché il controllore degli accessi è esentato dai controlli delle sezioni. Usa invece l'elenco dei gestori o l'interruttore di delega per affidare il controllo della lista.

## Impostazioni

Tutto si trova nell'unica pagina Dashboard Access.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Allow Administrators and Manage Guild members to manage dashboard access | Off | Nella sezione **Impostazioni delega**. Quando è attiva, i membri con Amministratore e Gestisci server possono modificare le concessioni. Solo proprietario. |
| Access Managers | nessuno | Membri o ruoli nominati per modificare le concessioni. Solo proprietario. |
| Access Grants | nessuno | Una voce per membro o ruolo, con un livello per sezione. Gestori e proprietario. |

Il modulo **Concedi accesso limitato** richiede un tipo di destinatario (utente o ruolo), il destinatario e un livello per ogni gruppo di funzioni. Salvare una seconda concessione per lo stesso destinatario sostituisce la prima. Modificare una concessione esistente apre lo stesso modulo come **Modifica permesso di accesso**.

## Guida alla configurazione

1. Apri **Accesso alla dashboard** nella dashboard come proprietario del server.
2. Decidi chi mantiene la lista. Attiva l'interruttore di delega in **Impostazioni delega**, oppure aggiungi un membro o un ruolo in **Access Managers**.
3. In **Concedi accesso limitato**, scegli **Ruolo** e seleziona il ruolo dello staff.
4. Imposta **Gestisci** sulle funzioni che usano ogni giorno e **Vedi** su quelle che devono solo controllare. Lascia le altre su **Nessuno**.
5. Clicca su **Concedi accesso**. La concessione compare in **Access Grants**.
6. Chiedi a un membro con quel ruolo di accedere alla dashboard. Il server dovrebbe ora comparire nel suo elenco, con funzionanti solo le pagine concesse.

## Comandi

Accesso alla dashboard si configura solo dalla dashboard; non esistono comandi del bot per questo.

## Suggerimenti e insidie

- Le concessioni vengono verificate rispetto all'elenco dei membri in cache del bot, quindi un membro deve essere nel server e visibile al bot perché la sua concessione funzioni.
- Le concessioni tramite ruolo seguono i ruoli attuali del membro. Rimuovere il ruolo rimuove subito l'accesso.
- Una concessione con tutte le sezioni impostate su **Nessuno** viene considerata come nessuna concessione ed eliminata, e il membro perde il server nel suo selettore.
- Gli Amministratori mantengono l'accesso completo qualunque cosa dicano le concessioni. Per limitare qualcuno, rimuovi prima l'Amministratore in Discord, poi concedi qui ciò di cui ha bisogno.
- Il proxy della dashboard allega una chiave API condivisa a ogni richiesta, ma quella chiave da sola non concede mai accesso a un server; è sempre richiesta l'identità dell'utente che ha effettuato l'accesso.
- Gli endpoint non legati a un server, come la lista globale dei comandi, non sono soggetti ai controlli delle sezioni e continuano a funzionare per gli utenti con accesso limitato.

---
title: Canale vocale personalizzato
slug: customvoice
summary: Un hub "entra per creare" che dà a ogni membro il proprio canale vocale temporaneo, con controlli per rinomina, limite utenti, bitrate, blocco, consenso e rifiuto, e pulizia automatica quando si svuota.
icon: fa-microphone
category: Entertainment
dashboard: /dashboard/customvoice
module: CustomVoice
tags: [custom voice, temporary voice, join to create, voice hub, private voice, voice channels, lock, bitrate, user limit, canale vocale personalizzato, canale vocale temporaneo, entra per creare, hub vocale, voce privata, canali vocali, blocco, limite utenti]
related: [administration, statchannels]
---

## Cosa fa

Lo staff imposta un canale vocale come hub. Quando un membro vi entra, il bot crea per lui un nuovo canale vocale, con il nome preso da un modello, lo inserisce nella categoria configurata e ce lo sposta. Quel membro è il proprietario del canale: può rinominarlo, impostare un limite di utenti e il bitrate, bloccarlo in modo che possano entrare solo i membri autorizzati, consentire o rifiutare persone specifiche, mantenerlo attivo o cederlo a qualcun altro.

Quando esce l'ultimo umano, il canale viene eliminato dopo un breve timeout, a meno che il proprietario non abbia attivato il mantenimento in vita. Se il proprietario esce ma qualcun altro è ancora dentro, quella persona può reclamarlo.

I membri possono salvare le preferenze per i loro canali, così ogni canale che creano parte con il nome, il limite, il bitrate, lo stato di blocco e l'impostazione di mantenimento in vita preferiti. Lo staff decide quali personalizzazioni i membri possono usare, imposta limiti massimi per il limite utenti e il bitrate, e può indicare un ruolo admin che può gestire qualsiasi canale personalizzato.

## Perché usarlo

- Smetti di mantenere una lista di canali "Gaming 1" fino a "Gaming 8"; i membri ne creano uno quando serve e poi sparisce.
- I membri che vogliono una chiamata privata bloccano il canale e consentono l'accesso solo ai loro amici.
- Streamer e organizzatori di eventi mantengono un canale attivo così resta disponibile mentre si allontanano.
- I moderatori con il ruolo admin possono rinominare, bloccare o cedere qualsiasi canale senza bisogno del permesso Gestisci canali su tutto il server.

## L'hub

`setupvoicehub` crea un canale vocale chiamato "Create Voice Channel" all'interno di una nuova categoria "Custom Voice Channels", permette a tutti di connettersi ma non di parlare, e lo registra come hub. `setvoicehub #channel [category]` usa un canale che hai già. La sezione **Configurazione di base** della dashboard fa lo stesso con un selettore di canale e categoria.

Se **Consenti più canali per utente** è disattivato (l'impostazione predefinita), entrare nell'hub mentre possiedi già un canale elimina quello vecchio prima di crearne uno nuovo.

## Nomi dei canali

Il **Formato nome predefinito** è un modello. Il bot sostituisce `{0}` con il nome utente del membro, `{1}` con il suo discriminatore e `{2}` con il nome del server. Il valore predefinito è `{0}'s Channel`. Il nome viene accorciato per rientrare nei limiti di Discord.

> [!NOTE]
> Il testo segnaposto della dashboard mostra `{username}'s Channel`, ma il bot sostituisce solo `{0}`, `{1}` e `{2}`. Usa la forma numerata.

## Controlli del proprietario

`voicecontrols` pubblica un pannello per il canale in cui ti trovi, che mostra il nome attuale, il limite, il bitrate, lo stato di blocco e di mantenimento in vita e chi è dentro, con i pulsanti **Rinomina**, **Limite**, **Bitrate**, **Blocca**/**Sblocca**, mantenimento in vita, **Trasferisci** e un selettore di membri per gestire chi è dentro. I pulsanti per le personalizzazioni che il server ha disattivato sono disabilitati.

Le stesse azioni esistono come comandi, e ognuna verifica che tu sia in un canale personalizzato, che ne sia il proprietario o abbia il ruolo admin, e che il server consenta quella personalizzazione:

| Azione | Comando | Cosa fa |
| --- | --- | --- |
| Rinomina | `voicerename <name>` | Rinomina il canale, se **Consenti personalizzazione del nome** è attivo |
| Limite utenti | `voicelimit <n>` | Imposta il limite, con il massimo consentito dal server |
| Bitrate | `voicebitrate <kbps>` | Imposta il bitrate, con il massimo consentito dal server |
| Blocco | `voicelock [true/false]`, `voiceunlock` | Il blocco nega la connessione a tutti tranne ai membri autorizzati, al proprietario e al ruolo admin |
| Consenti | `voiceallow @user` | Concede la connessione a un membro anche quando il canale è bloccato |
| Rifiuta | `voicedeny @user` | Rimuove la connessione a un membro e lo disconnette se è dentro |
| Mantieni attivo | `voicekeepalive [true/false]` | Impedisce la pulizia dei canali vuoti per questo canale |
| Trasferisci | `voicetransfer @user` | Rende un altro membro proprietario e gli trasferisce le sovrascritture di gestione |
| Reclama | `voiceclaim` | Qualsiasi membro presente può prendere la proprietà quando il proprietario non è nel canale |

Quando **Gestisci automaticamente i permessi del canale** è attivo, il proprietario ottiene Connetti, Parla, Gestisci canale, Sposta membri, Silenzia membri e Disattiva l'audio dei membri sul proprio canale; i membri consentiti e rifiutati ricevono sovrascritture corrispondenti, e il ruolo admin ottiene l'accesso alla gestione.

## Pulizia

Con **Elimina i canali quando vuoti** attivo (l'impostazione predefinita), un canale senza umani dentro viene programmato per l'eliminazione dopo il timeout dei canali vuoti. Rientrare prima che il timer scatti annulla l'eliminazione. I canali contrassegnati come mantenuti attivi non vengono mai rimossi automaticamente. Una scansione in background ogni cinque minuti rimuove anche i canali vuoti da più tempo del timeout, e il pulsante **Pulisci canali inattivi** della dashboard rimuove i canali inattivi da un numero di ore che scegli tu.

## Preferenze dei membri

`voicepreferences` mostra il formato del nome, il limite utenti, il bitrate, il blocco e le preferenze di mantenimento in vita salvati. Ogni comando `voiceprefs...` ne imposta una; eseguito senza valore la cancella, e `voiceprefsreset` le cancella tutte. Le preferenze vengono applicate solo quando **Ricorda le preferenze utente** è attivo, e il limite e il bitrate restano comunque limitati dai massimi del server. Lo staff può visualizzare e modificare le preferenze di qualsiasi membro dalla scheda **Preferenze utente**, tramite ID utente.

## Impostazioni

La dashboard ha tre schede: **Configurazione**, **Canali attivi** e **Preferenze utente**. **Configurazione** è divisa in **Configurazione di base**, **Predefiniti del canale** e **Gestione del canale**. `voiceconfig` senza argomenti mostra ogni valore; `voiceconfig <setting> <value>` ne modifica uno.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Canale hub | nessuno | Il canale "entra per creare" |
| Categoria | nessuna | Dove vengono creati i nuovi canali |
| Formato nome predefinito | `{0}'s Channel` | Modello per i nomi dei nuovi canali (`nameformat`) |
| Limite utenti predefinito | 0 (illimitato) | Limite utenti iniziale (`userlimit`) |
| Bitrate predefinito | 64 kbps | Bitrate iniziale (`bitrate`) |
| Elimina i canali quando vuoti | Attivo | Rimuove i canali in cui non c'è nessuno (`deleteempty`) |
| Timeout canale vuoto | 1 | Ritardo prima che un canale vuoto venga rimosso (`emptytimeout`); la dashboard lo indica in secondi e accetta da 5 a 300 |
| Consenti più canali per utente | Disattivato | Permette a un membro di possedere più canali (`multiplechannels`) |
| Ricorda le preferenze utente | Attivo | Applica le preferenze salvate dei membri (`persistpreferences`) |
| Gestisci automaticamente i permessi del canale | Attivo | Imposta le sovrascritture di proprietario, consenso, rifiuto e admin (`autopermission`) |
| Consenti personalizzazione del nome | Attivo | `namechange` |
| Consenti personalizzazione del limite utenti | Attivo | `limitchange` |
| Consenti personalizzazione del bitrate | Attivo | `bitratechange` |
| Consenti il blocco del canale | Attivo | `locking` |
| Consenti gestione utenti | Attivo | Comandi di consenso e rifiuto (`usermanagement`) |
| Limite utenti massimo | 99 | Tetto per i limiti impostati dai membri (`maxuserlimit`) |
| Bitrate massimo | 96 kbps | Tetto per i bitrate impostati dai membri, limitato anche dal livello di potenziamento del server (`maxbitrate`) |
| Ruolo admin | nessuno | Ruolo che può gestire qualsiasi canale personalizzato (`adminrole`) |

**Limite utenti massimo**, **Bitrate massimo** e **Ruolo admin** non hanno un controllo nella dashboard; impostali con `voiceconfig`.

La scheda **Canali attivi** elenca ogni canale personalizzato attivo con il proprietario, lo stato di blocco e di mantenimento in vita, permette di bloccare, sbloccare o eliminare un canale, e mostra i totali per canali creati, attivi nell'ultima ora, bloccati e mantenuti attivi. Contiene anche il pulsante **Pulisci canali inattivi** e un pulsante **Disattiva canale vocale personalizzato** che disattiva il modulo per il server.

## Procedura di configurazione

1. Dai al bot i permessi Gestisci canali, Sposta membri e Gestisci ruoli (per le sovrascritture dei permessi) nella categoria che userai.
2. Esegui `setupvoicehub`, oppure apri **Canale vocale personalizzato** nella dashboard e scegli un canale hub e una categoria esistenti in **Configurazione di base**.
3. Imposta **Formato nome predefinito**, **Limite utenti predefinito** e **Bitrate predefinito** in **Predefiniti del canale**.
4. In **Gestione del canale**, disattiva le personalizzazioni che non vuoi che i membri abbiano.
5. Imposta un **Ruolo admin** con `voiceconfig adminrole @Moderators` così lo staff può gestire i canali che non possiede.
6. Entra tu stesso nell'hub, esegui `voicecontrols` e prova a rinominare e bloccare il canale.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `setupvoicehub` | `svh`, `createvoicehub`, `voicesetup` | Gestisci canali | Crea un canale hub e una categoria |
| `setvoicehub <#channel> [category]` | `sethub`, `voicehub` | Gestisci canali | Usa un canale esistente come hub |
| `voiceconfig [setting] [value]` | `vcconfig`, `voicesettings`, `vcsettings`, `customvoiceconfig` | Gestisci canali | Mostra o modifica le impostazioni del server |
| `voicecontrols` | `vcontrols` | Proprietario o ruolo admin | Pannello di controllo interattivo per il tuo canale |
| `voicechannels` | `vchannels`, `listvoice`, `customvoices`, `voicelist` | Nessuno | Elenca i canali personalizzati attivi |
| `voicerename <name>` | `vrename`, `renamevoice`, `vcname`, `vcrename` | Proprietario o ruolo admin | Rinomina il tuo canale |
| `voicelimit <number>` | `vclimit`, `limitvoice`, `vlimit`, `setlimit` | Proprietario o ruolo admin | Imposta il limite utenti |
| `voicebitrate <kbps>` | `vcbitrate`, `vbitrate`, `setbitrate` | Proprietario o ruolo admin | Imposta il bitrate |
| `voicelock [true/false]` | `vclock`, `lockvoice`, `vlock`, `lockvc` | Proprietario o ruolo admin | Blocca o sblocca |
| `voiceunlock` | `vcunlock`, `unlockvoice`, `vunlock`, `unlockvc` | Proprietario o ruolo admin | Sblocca |
| `voiceallow @user` | `vcallow`, `allowuser`, `vallow`, `adduser` | Proprietario o ruolo admin | Consente a un membro di entrare in un canale bloccato |
| `voicedeny @user` | `vcdeny`, `denyuser`, `vdeny`, `removeuser` | Proprietario o ruolo admin | Blocca un membro e lo disconnette |
| `voiceclaim` | `vcclaim`, `claimvoice`, `vclaim`, `takeover` | Nessuno | Prende il controllo di un canale il cui proprietario se n'è andato |
| `voicetransfer @user` | `vctransfer`, `transfervoice`, `vtransfer`, `givevc` | Proprietario o ruolo admin | Cede il canale a qualcun altro |
| `voicekeepalive [true/false]` | `vckeepalive`, `keepvoice`, `vkeep`, `persist` | Proprietario o ruolo admin | Esclude il canale dalla pulizia |
| `voicepreferences` | `vcprefs`, `voiceprefs`, `vprefs`, `myvoice` | Nessuno | Mostra le tue preferenze salvate |
| `voiceprefsname [format]` | `vcprefsname`, `vpname`, `prefname`, `namepref` | Nessuno | Formato del nome preferito, vuoto lo cancella |
| `voiceprefslimit [number]` | `vcprefslimit`, `vplimit`, `preflimit`, `limitpref` | Nessuno | Limite utenti preferito |
| `voiceprefsbitrate [kbps]` | `vcprefsbitrate`, `vpbitrate`, `prefbitrate`, `bitratepref` | Nessuno | Bitrate preferito |
| `voiceprefslock [true/false]` | `vprefslock` | Nessuno | Avvia i canali bloccati |
| `voiceprefskeepalive [true/false]` | `vcprefskeepalive`, `vpkeepalive`, `prefkeepalive`, `keeppref` | Nessuno | Avvia i canali con mantenimento in vita |
| `voiceprefsreset` | `vcprefsreset`, `vprefsreset`, `resetprefs`, `clearprefs` | Nessuno | Cancella tutte le preferenze |

## Suggerimenti e insidie

- Il bot ha bisogno di Gestisci canali nella categoria, di Sposta membri per mettere il creatore nel nuovo canale, e di Gestisci ruoli per scrivere le sovrascritture dei permessi.
- Il bitrate massimo viene limitato a quello consentito dal livello di potenziamento del server, quindi un valore di 384 su un server non potenziato viene ridotto automaticamente.
- Il blocco nega la connessione al ruolo everyone. I membri con Amministratore o con un ruolo che ha già un consenso esplicito alla connessione possono comunque entrare.
- Il timer dei canali vuoti che parte quando esce l'ultimo membro tratta il valore di timeout come secondi, mentre la visualizzazione della configurazione e la scansione di cinque minuti lo trattano come minuti. Con il valore predefinito di 1, il canale sparisce quasi subito quando si svuota.
- I canali mantenuti attivi non vengono mai puliti automaticamente. Usa la scheda **Canali attivi** o `voicechannels` per trovare quelli dimenticati.
- Il reclamo funziona solo quando il proprietario originale non è connesso al canale.

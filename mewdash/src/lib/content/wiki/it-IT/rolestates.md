---
title: Stati dei ruoli
slug: rolestates
summary: Ricorda i ruoli che un membro aveva quando ha lasciato il server e glieli restituisce automaticamente quando rientra.
icon: fa-tag
category: Actions
dashboard: /dashboard/rolestates
module: RoleStates
tags: [role states, role persistence, restore roles, rejoin, saved roles, role backup, transfer roles, stati dei ruoli, persistenza ruoli, ripristino ruoli, rientro, ruoli salvati, backup ruoli, trasferimento ruoli]
related: [administration, statusroles]
---

## Cosa fa

Quando Role States è attivo, il bot controlla i membri che se ne vanno. Nel momento in cui qualcuno esce, registra l'elenco dei ruoli che aveva in quel momento. Se quella persona rientra in seguito, il bot le riassegna tutti i ruoli salvati, così non deve chiedere allo staff di essere verificata o assegnata di nuovo.

Dal punto di vista del membro, nulla cambia quando esce. Al rientro, i suoi ruoli sono semplicemente di nuovo lì, di solito prima che finisca di leggere il canale di benvenuto.

Lo staff ottiene un elenco di ruoli salvati per ogni membro, che può ispezionare, modificare o eliminare, una lista di esclusione per i ruoli che non devono mai essere ripristinati e un'azione di massa "salva tutti ora", così la funzionalità copre anche i membri che erano già nel server prima che la attivassi.

## Perché usarlo

- I membri verificati che escono per errore, o per eliminare le notifiche, tornano senza perdere l'accesso.
- I ruoli colore, di menzione e di interesse scelti da un menu di ruoli a reazione sopravvivono a un rientro.
- I server con un processo di verifica manuale evitano di ricontrollare persone già approvate.
- Puoi scegliere a mano i ruoli che non devono mai tornare, come un ruolo mute temporaneo o un ruolo dello staff.
- Quando sposti una community su un nuovo server: gli stati dei ruoli possono essere trasferiti e abbinati ai ruoli con lo stesso nome.

## Come viene salvato uno stato dei ruoli

Quando un membro esce, il bot verifica:

1. Che Role States sia attivo per il server.
2. Che **Ignore Bots** sia disattivato, oppure che il membro non sia un bot.
3. Che il membro non sia nell'elenco **Utenti esclusi**.

Se tutte queste condizioni sono soddisfatte, prende i ruoli attuali del membro, scarta il ruolo `@everyone` e i ruoli gestiti (ruoli dei bot, ruolo dei booster, ruoli delle integrazioni), poi rimuove tutto ciò che è presente nell'elenco **Ruoli esclusi**. Se non rimane nulla, non viene salvato niente. Altrimenti l'elenco sostituisce quello che era memorizzato in precedenza per quel membro.

I ban vengono gestiti a parte. Con **Clear on Ban** attivo, bannare un membro elimina il suo stato salvato, quindi uno sbandamento e un rientro non ripristinano nulla.

## Come viene ripristinato uno stato dei ruoli

Al rientro, il bot verifica di nuovo che la funzionalità sia attiva, che i bot non siano ignorati (se il membro è un bot) e che l'utente non sia nell'elenco dei negati. Poi aggiunge tutti i ruoli salvati in un'unica richiesta. I ruoli che non esistono più o che si trovano sopra il ruolo più alto del bot fanno fallire quella richiesta, e il fallimento viene solo registrato nei log.

> [!PERMISSION]
> Il bot ha bisogno del permesso Gestire Ruoli, e il suo ruolo più alto deve trovarsi sopra ogni ruolo che dovrebbe restituire.

### Saltare i ruoli di assegnazione automatica

Se usi anche i ruoli di assegnazione automatica del modulo Administration, un membro che torna riceverebbe normalmente sia i ruoli salvati sia quelli di assegnazione automatica. Attivando **skip auto-assign** con `togglerolestatesskipautoassign`, il bot salta i ruoli di assegnazione automatica per chiunque abbia uno stato dei ruoli salvato, così i membri che tornano ricevono solo ciò che avevano prima. Questo interruttore è disponibile solo come comando; non si trova nella dashboard.

## Gestire manualmente gli stati salvati

Lo staff può creare o modificare lo stato di un membro senza aspettare che esca:

- `setuserrolestate` sostituisce l'elenco salvato di un membro con i ruoli che indichi. I ruoli gestiti e `@everyone` vengono scartati.
- `addrolestorolestate` e `removerolesfromrolestate` modificano un elenco salvato esistente.
- `deleteuserrolestate` dimentica completamente un membro.
- `saveallrolestates` salva uno snapshot di tutti i membri attuali in un colpo solo, applicando gli stessi filtri di bot e di negazione di un salvataggio automatico.

La dashboard aggiunge una cosa che i comandi non hanno: **Copia stato dei ruoli**, che prende i ruoli salvati di un membro e li applica direttamente a un altro membro che è attualmente nel server.

## Trasferimento a un altro server

`transferrolestates <serverId>` copia ogni stato salvato dal server attuale a un altro server in cui si trova il bot. I ruoli vengono abbinati per nome, senza distinzione tra maiuscole e minuscole, e i ruoli gestiti vengono saltati. I membri i cui ruoli salvati non hanno una corrispondenza per nome nel server di destinazione vengono saltati. Il server di destinazione ha Role States attivato automaticamente se non lo era già, ereditando i valori di **Ignore Bots** e **Clear on Ban** del server di origine quando non ha impostazioni proprie.

## Impostazioni

La scheda **Impostazioni** della pagina Role States ha due sottoschede, **Generali** e **Negata**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Role States | Disattivato | Interruttore generale per salvare e ripristinare |
| Clear on Ban | Disattivato | Elimina lo stato salvato di un membro quando viene bannato |
| Ignore Bots | Disattivato | Non salva né ripristina i ruoli degli account bot |
| Save Current States | pulsante | Salva subito uno snapshot dei ruoli di ogni membro attuale |
| Denied Roles | nessuno | Ruoli che non vengono mai salvati, e quindi mai ripristinati |
| Denied Users | nessuno | Membri i cui ruoli non vengono mai salvati né ripristinati |

La scheda **Gestione** contiene **Gestisci ruoli utente** (aggiunge o rimuove i ruoli selezionati dallo stato salvato di un membro) e **Copia stato dei ruoli**. La scheda **Stati dei ruoli** elenca ogni stato salvato con nome, ID e ruoli del membro, e consente di visualizzare i dettagli o eliminare una voce.

## Procedura di configurazione

1. Assicurati che il ruolo del bot si trovi sopra ogni ruolo che vuoi che ripristini.
2. Apri **Stati dei ruoli** nella dashboard e attiva **Stati dei ruoli** in **Impostazioni**, **Generali**.
3. Attiva **Ignore Bots**, a meno che tu non voglia specificamente ricordare i ruoli dei bot.
4. Decidi per **Clear on Ban**. Lascialo disattivato se vuoi che i membri sbannati recuperino i loro ruoli.
5. In **Negata**, aggiungi a **Ruoli esclusi** i ruoli dello staff, i ruoli di punizione e tutto ciò che è temporaneo.
6. Premi **Salva tutto** sotto **Salva stati attuali** così i membri già presenti sono coperti da oggi.
7. Controlla la scheda **Stati dei ruoli** per confermare che lo snapshot sia stato popolato.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non lo hai cambiato). Ogni comando di questo modulo richiede il permesso Amministratore.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `togglerolestates` | `trs` | Amministratore | Attiva o disattiva Role States |
| `viewrolestatessettings` | `vrss` | Amministratore | Mostra le impostazioni attuali e le liste di negazione |
| `viewuserrolestates` | `viewrolestates`, `vurs` | Amministratore | Sfoglia tutti gli stati salvati |
| `saveallrolestates` | `saveserverstates`, `backuprolestates` | Amministratore | Salva uno snapshot di ogni membro attuale |
| `transferrolestates <serverId>` | `copyrolestates`, `moverolestates` | Amministratore | Copia gli stati su un altro server, abbinando i ruoli per nome |
| `togglerolestatesignorebots` | `trsib` | Amministratore | Attiva o disattiva l'esclusione degli account bot |
| `togglerolestatesclearonban` | `trscob` | Amministratore | Attiva o disattiva l'eliminazione dello stato al ban |
| `togglerolestatesskipautoassign` | `trssaa`, `rsskipautoassign` | Amministratore | Attiva o disattiva il salto dei ruoli di assegnazione automatica per i membri con uno stato salvato |
| `rolestatesadddenyrole @role...` | `rsadr` | Amministratore | Aggiunge ruoli alla lista dei negati |
| `rolestatesremovedenyrole @role...` | `rsrra` | Amministratore | Rimuove ruoli dalla lista dei negati |
| `rolestatesadddenyuser @user...` | `rsadu` | Amministratore | Aggiunge membri alla lista dei negati |
| `rolestatesremovedenyuser @user...` | `rolestatesremoveadduser`, `rsrau` | Amministratore | Rimuove membri dalla lista dei negati |
| `setuserrolestate @user @role...` | `surs` | Amministratore | Sostituisce i ruoli salvati di un membro |
| `addrolestorolestate @user @role...` | `arsrs` | Amministratore | Aggiunge ruoli allo stato salvato di un membro |
| `removerolesfromrolestate @user @role...` | `rrfrs` | Amministratore | Rimuove ruoli dallo stato salvato di un membro |
| `deleteuserrolestate @user` | `dur` | Amministratore | Dimentica lo stato salvato di un membro |

Gli equivalenti slash si trovano sotto `/rolestates`.

## Suggerimenti e insidie

- Nulla viene salvato per i membri che erano già nel server quando hai attivato la funzionalità, finché non escono o finché non esegui **Salva tutto**. Eseguilo una volta subito dopo la configurazione.
- Solo le uscite attivano un salvataggio. I kick contano come uscite. Anche i ban contano come uscite, e lo stato viene poi rimosso di nuovo se **Clear on Ban** è attivo.
- Il ripristino usa un'unica chiamata di aggiunta ruoli. Un ruolo mancante o troppo alto fa fallire silenziosamente l'intero ripristino, quindi tieni aggiornata la lista dei negati quando elimini o riordini i ruoli.
- I ruoli gestiti (ruoli di integrazione dei bot, ruolo dei booster) non vengono mai salvati. Discord li assegna da solo.
- `viewuserrolestates` mostra tre membri per pagina.
- Sia `setuserrolestate` sia `deleteuserrolestate` accettano un utente che è già uscito, così puoi correggere uno stato prima che qualcuno rientri.
- Denied Users influisce solo sui salvataggi e sui ripristini automatici. I comandi manuali e **Copia stato dei ruoli** funzionano ancora su quei membri.

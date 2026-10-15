---
title: Impostazioni
slug: settings
summary: Le basi valide per tutto il server: prefisso dei comandi, lingua, fuso orario, canali di log, ruolo silenziato, scadenza degli avvertimenti e alcune utilità di chat.
icon: fa-cog
category: Settings
dashboard: /dashboard/settings
module: Administration
tags: [settings, prefix, language, locale, timezone, mute role, warn expire, command log, staff role, member role, snipe, link previews, delmsgoncmd, impostazioni, prefisso, lingua, fuso orario, ruolo silenziato, scadenza avvertimenti, log comandi, ruolo staff, ruolo membro, snipe, anteprime link, eliminazione comando]
related: [administration, logging, filter, suggestions]
---

## Cosa fa

La pagina Impostazioni contiene le poche opzioni che influenzano tutti i moduli contemporaneamente, invece di una singola funzione. Qui si cambia il prefisso che i membri scrivono prima dei comandi, la lingua in cui risponde il bot, il fuso orario usato per promemoria e messaggi programmati, e i canali in cui vengono registrati l'uso dei comandi e gli avvertimenti.

Copre anche il nome del ruolo silenziato, se un membro silenziato perde gli altri ruoli, per quanto tempo durano gli avvertimenti, e due utilità di chat: lo snipe dei messaggi e le anteprime dei link ai messaggi.

La maggior parte di queste impostazioni ha un comando testuale corrispondente, così lo staff può cambiarle anche da Discord. Alcune funzioni extra esistono solo nei comandi: il ruolo staff, il ruolo membro e l'eliminazione dei messaggi di comando per canale.

## Perché usarlo

- Il tuo server usa già `.` per un altro bot e vuoi Mewdeko su `!` o `m!`.
- La tua community parla una lingua diversa dall'inglese e vuoi che le risposte corrispondano.
- Promemoria e messaggi programmati devono arrivare all'ora locale giusta, non in UTC.
- I moderatori vogliono un canale che registri ogni comando eseguito e ogni avvertimento emesso.
- Gli avvertimenti devono sbiadire dopo un certo numero di giorni invece di accumularsi per sempre.
- I membri devono poter usare `snipe` su un messaggio eliminato, oppure le anteprime dei link devono essere disattivate in una chat molto attiva.

## Prefisso

Il prefisso è il testo che un membro scrive prima di un comando. Il valore predefinito è `.`. Chiunque può eseguire `prefix` senza argomenti per vedere il prefisso attuale. Gli amministratori lo cambiano con `prefix <new>` oppure, dalla dashboard, con la casella **Prefisso dei comandi**. I comandi slash non sono influenzati dal prefisso.

## Lingua

Ogni server può scegliere la propria lingua di risposta con `languageset <code>`, per esempio `languageset de`, oppure con il menu a tendina **Lingua** della dashboard. `languageset default` rimuove la personalizzazione così il server segue la lingua predefinita del bot. `languageslist` mostra ogni codice di lingua supportato. `langsetdefault` senza argomenti mostra il predefinito del bot; cambiarlo è un'azione riservata al proprietario del bot.

## Fuso orario

Il fuso orario del server regola promemoria, messaggi programmati e ogni visualizzazione dell'orario. `timezone` da solo mostra il valore attuale (UTC se non ne è impostato uno). `timezone <id>` lo imposta usando un identificativo di fuso orario IANA o Windows, come `Europe/London`, e `timezones` sfoglia gli identificativi accettati dal bot. Nella dashboard, **Fuso orario del server** salva nel momento in cui scegli un valore; non aspetta **Salva modifiche**.

## Canali di log

**Canale del log dei comandi** registra l'uso dei comandi. Impostalo con `commandlogchannel #channel`; esegui il comando senza canale per disattivare il log.

**Canale del log degli avvertimenti** registra gli avvertimenti emessi dai comandi di moderazione. Si imposta dalla dashboard.

## Avvertimenti

**Scadenza degli avvertimenti** è memorizzata in ore. Zero significa che gli avvertimenti non scadono mai. Il comando `warnexpire` lavora invece in giorni e accetta una seconda parola: `warnexpire 30 clear` contrassegna come cancellati gli avvertimenti più vecchi di 30 giorni, `warnexpire 30 delete` li rimuove. L'intervallo accettato va da 0 a 366 giorni, e `warnexpire 0` disattiva la scadenza.

## Ruolo silenziato e rimozione dei ruoli

**Ruolo silenziato** è il nome del ruolo applicato dai comandi di mute e dalle punizioni. Se un ruolo con quel nome non esiste, il bot lo crea. Da Discord, `muterole @role` punta l'impostazione a un ruolo esistente; il ruolo deve trovarsi sotto il tuo ruolo più alto, a meno che tu non sia il proprietario del server. `muterole` senza argomenti mostra il ruolo silenziato attuale.

**Rimuovi tutti gli altri ruoli mentre è silenziato** toglie gli altri ruoli di un membro per la durata di un mute e glieli restituisce dopo. La forma da comando è `removeonmute y` oppure `removeonmute n`.

## Utilità di chat

| Impostazione | Comando | Effetto |
| --- | --- | --- |
| Snipe dei messaggi | `snipeset enable` oppure `snipeset disable` | Permette ai membri di usare i comandi snipe per recuperare messaggi eliminati o modificati di recente. Disattivato per impostazione predefinita. |
| Anteprime dei link ai messaggi | `previewlinks y` oppure `previewlinks n` | Quando qualcuno pubblica un link a un messaggio Discord, il bot mostra il contenuto di quel messaggio. |

## Impostazioni solo da comando

Fanno parte dello stesso modulo Amministrazione ma non hanno un controllo nella dashboard.

**Ruolo staff** (`staffrole @role`) segna un ruolo i cui membri sono esentati dai filtri per parole, link e inviti, e dai controlli antispam dei suggerimenti. Esegui `staffrole` senza ruolo per vedere quello attuale, e `staffroledisable` per cancellarlo.

**Ruolo membro** (`memberrole @role`) memorizza un ruolo per il server. Viene registrato ma al momento non è usato da nessuna funzione.

**Elimina messaggio al comando** (`delmsgoncmd`) rimuove il messaggio che ha attivato un comando, una volta eseguito il comando:

| Forma | Effetto |
| --- | --- |
| `delmsgoncmd` | Attiva o disattiva l'eliminazione per tutto il server |
| `delmsgoncmd list` | Mostra l'impostazione del server e ogni eccezione per canale |
| `delmsgoncmd channel enable [#channel]` | Elimina sempre in quel canale (canale attuale se omesso) |
| `delmsgoncmd channel disable [#channel]` | Non elimina mai in quel canale |
| `delmsgoncmd channel inherit [#channel]` | Segue l'impostazione del server |

## Impostazioni

Tutto ciò che segue si trova nell'unica pagina **Impostazioni bot**. Premi **Salva modifiche** dopo aver modificato; solo **Fuso orario del server** si salva da solo.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Prefisso dei comandi | `.` | Testo digitato prima dei comandi |
| Canale del log dei comandi | nessuno | Canale in cui viene registrato l'uso dei comandi |
| Emoji della valuta | nessuna | Emoji mostrata per la valuta del server |
| Canale del log degli avvertimenti | nessuno | Canale in cui vengono registrati gli avvertimenti |
| Scadenza degli avvertimenti | 0 (mai) | Ore prima che gli avvertimenti scadano |
| Lingua | Predefinita del bot | Lingua di risposta per questo server |
| Fuso orario del server | UTC | Fuso orario per messaggi programmati, promemoria e visualizzazioni dell'orario |
| Ruolo silenziato | Muted | Nome del ruolo applicato da mute e punizioni |
| Rimuovi tutti gli altri ruoli mentre è silenziato | Disattivato | Toglie gli altri ruoli per la durata di un mute |
| Snipe dei messaggi | Disattivato | Consente i comandi snipe |
| Anteprime dei link ai messaggi | Disattivato | Espande i link ai messaggi Discord |

> [!NOTE]
> La pagina copre solo le basi condivise. Log, moderazione, starboard e le altre funzioni hanno pagine proprie con le rispettive impostazioni.

## Guida alla configurazione

1. Apri **Impostazioni** nella dashboard.
2. Imposta **Prefisso dei comandi** se `.` entra in conflitto con un altro bot.
3. Scegli una **Lingua** e un **Fuso orario del server**.
4. Scegli un **Canale del log dei comandi** e un **Canale del log degli avvertimenti** che solo lo staff può leggere.
5. Imposta la **Scadenza degli avvertimenti** in ore, per esempio `720` per trenta giorni, oppure lasciala a 0.
6. Controlla che il nome del **Ruolo silenziato** corrisponda al ruolo che i tuoi moderatori già usano, oppure lascia `Muted` e lascia che il bot ne crei uno.
7. Attiva **Snipe dei messaggi** o **Anteprime dei link ai messaggi** se li vuoi.
8. Premi **Salva modifiche**.
9. Su Discord, esegui `staffrole @YourStaffRole` così filtri e limiti dei suggerimenti non si applicano al tuo team.

## Comandi

Usali con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `prefix [new prefix]` | | Nessuno per visualizzare, Amministratore per cambiare | Mostra o imposta il prefisso dei comandi |
| `languageset <code>` | `langset` | Amministratore | Imposta la lingua di risposta del server, oppure `default` per cancellarla |
| `langsetdefault` | `langsetd` | Nessuno per visualizzare, proprietario del bot per cambiare | Mostra o imposta la lingua predefinita del bot |
| `languageslist` | `langli` | Nessuno | Elenca i codici di lingua supportati |
| `timezone [id]` | | Nessuno per visualizzare, Amministratore per cambiare | Mostra o imposta il fuso orario del server |
| `timezones` | | Nessuno | Sfoglia gli identificativi di fuso orario accettati |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Amministratore | Imposta il canale del log dei comandi, oppure lo disattiva senza canale |
| `warnexpire <days> <clear or delete>` | `warne` | Amministratore | Fa scadere gli avvertimenti dopo un certo numero di giorni |
| `muterole [@role]` | `setmuterole` | Gestisci ruoli | Mostra o imposta il ruolo silenziato |
| `removeonmute <y or n>` | | Amministratore | Toglie gli altri ruoli mentre è silenziato |
| `snipeset <enable or disable>` | `setsnipe` | Amministratore | Consente o blocca i comandi snipe |
| `previewlinks <y or n>` | `plinks` | Amministratore | Espande i link ai messaggi Discord |
| `staffrole [@role]` | | Amministratore | Mostra o imposta il ruolo staff |
| `staffroledisable` | | Amministratore | Cancella il ruolo staff |
| `memberrole [@role]` | | Amministratore | Mostra o imposta il ruolo membro |
| `delmsgoncmd [list or channel <state> [#channel]]` | `dmc` | Amministratore | Elimina i messaggi di comando per tutto il server o per canale |

## Suggerimenti e insidie

- `delmsgoncmd` richiede che il bot abbia il permesso Gestisci messaggi, altrimenti il comando si rifiuta di funzionare.
- La dashboard memorizza la scadenza degli avvertimenti in ore, mentre `warnexpire` usa i giorni. `warnexpire 1` e un valore di `24` nella dashboard sono la stessa cosa.
- `muterole` confronta il ruolo che passi con il tuo ruolo più alto. Se restituisce un errore di permessi insufficienti, chiedi al proprietario oppure scegli un ruolo più basso.
- I comandi slash ignorano del tutto il prefisso, quindi cambiare il prefisso influenza solo i comandi testuali.
- L'esenzione del ruolo staff copre solo i filtri e i controlli antispam dei suggerimenti. Non concede permessi sui comandi; per quelli usa il modulo Permessi.

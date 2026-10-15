---
title: Nintendo Switch
slug: switch
summary: Cerca i codici di errore di Nintendo Switch, convertili tra decimale ed esadecimale, cerca nella wiki di switchbrew.org e ottieni un'analisi leggibile di un file di log di Ryujinx.
icon: fa-gamepad-modern
category: Entertainment
module: Switch
tags: [switch, nintendo, error code, ryujinx, emulator, log, switchbrew, homebrew, hex, codice errore, emulatore, esadecimale, analisi log]
related: [userprofile, help]
---

## Cosa fa

Il modulo Switch è un kit di supporto per i server dedicati all'homebrew e all'emulazione di Nintendo Switch. Quando qualcuno pubblica un errore come `2168-0002`, un helper esegue `err 2168-0002` e il bot risponde con il modulo a cui appartiene l'errore, quello che si sa in merito e un link alla pagina di supporto di Nintendo quando esiste.

Due piccoli convertitori trasformano la forma `NNNN-NNNN` nel valore esadecimale grezzo usato nel codice, e viceversa. `switchbrew` cerca nella wiki di switchbrew.org così le persone possono trovare pagine su SVC, codici di risultato o hardware senza uscire da Discord.

La funzione più importante è l'analizzatore di log di Ryujinx. Un utente allega il suo `Ryujinx.log`, qualcuno esegue `analyselog` su di esso o come risposta a quel messaggio, e il bot produce un embed con il gioco, la versione dell'emulatore, l'hardware, ogni impostazione rilevante, l'ultimo errore, le mod e i cheat installati, e un elenco di note che indicano configurazioni errate comuni.

Non c'è nulla da configurare e nulla viene salvato. Tutti i comandi sono aperti a chiunque.

## Perché usarlo

- Un canale di supporto riceve ogni giorno la stessa domanda su cosa significhi 2811-5001.
- La risoluzione dei problemi di Ryujinx parte dalla lettura del log, e la maggior parte delle persone non sa cosa cercare.
- Chi sviluppa vuole la forma esadecimale di un errore per cercarla nel codice sorgente.
- Chiunque può richiamare una pagina di switchbrew.org da Discord.

## Ricerca dei codici di errore

`err <code>` accetta entrambe le forme:

- `NNNN-NNNN`, dove il primo gruppo inizia con 2 (per esempio `2168-0002`). Il numero del modulo è il primo gruppo meno 2000 e la descrizione è il secondo gruppo.
- Un valore esadecimale con il prefisso `0x`, per esempio `0x2A2`. I nove bit meno significativi sono il modulo e il resto è la descrizione.

La risposta mostra il codice in entrambe le forme, il nome e il numero del modulo, il numero della descrizione e una spiegazione. La spiegazione viene cercata in quest'ordine: una descrizione nota per il codice esatto, una pagina di supporto Nintendo per il codice esatto, una descrizione per l'intervallo in cui rientra il codice all'interno del suo modulo, e altrimenti "unknown". I codici noti vengono mostrati con il colore normale, quelli sconosciuti con il colore di errore.

Alcuni codici non seguono lo schema, come `2-AAB6A-3400`. Questi vengono confrontati esattamente con un breve elenco e segnalati con il gioco a cui appartengono.

`err2hex <NNNN-NNNN>` stampa il valore esadecimale. `hex2err <hex>` stampa la forma con il trattino; il prefisso `0x` è facoltativo.

## Ricerca su switchbrew

`switchbrew <query>` interroga l'API di ricerca della wiki e restituisce le prime cinque corrispondenze con un link e un estratto di massimo 200 caratteri ciascuna. `svc` è un alias, quindi `svc SetThreadPriority` si legge in modo naturale.

## Analisi dei log di Ryujinx

`analyselog` cerca un allegato `.log` o `.txt` nel tuo messaggio. Se non c'è, e il tuo messaggio è una risposta, usa l'allegato del messaggio a cui hai risposto e accredita il suo autore nel piè di pagina. L'embed ha come titolo il nome del gioco e contiene:

| Campo | Contenuto |
| --- | --- |
| General Info | Versione di Ryujinx, firmware, CPU, GPU, RAM, sistema operativo |
| System Settings | Backend audio, modalità docked o handheld, PPTC, cache degli shader, VSync, hypervisor (solo macOS) |
| Graphics Settings | Backend grafico, scala di risoluzione, filtro anisotropico, rapporto d'aspetto, ricompressione delle texture |
| Errors | L'ultimo blocco di errore del log, oppure "no errors" |
| Mods | Ogni mod con ExeFS o RomFS, troncata con un conteggio se sono molte |
| Cheats | Ogni cheat, troncato allo stesso modo |
| Notes | Problemi rilevati e consigli |

Le note coprono casi come collisioni o corruzione della cache degli shader, un hash di dump errato, chiavi obsolete, firmware mancante, errori di permessi sui file, un salvataggio mancante, servizi mancanti, Vulkan che esaurisce la memoria, il profilo utente predefinito, nessun controller configurato, una GPU Intel o AMD che dovrebbe usare Vulkan, Rosetta su Apple silicon, il backend audio dummy, PPTC o cache degli shader disattivati, RAM espansa, il memory manager software, ignorare i servizi mancanti, VSync disattivato, controlli di integrità del filesystem disattivati, threading del backend disattivato, e build personalizzate. Ogni nota ha un indicatore di gravità, da informativo a critico.

Se il file non può essere scaricato o non è un log di Ryujinx, il bot segnala che il log non è valido.

## Impostazioni

Questo modulo non ha impostazioni né una pagina nella dashboard.

## Procedura di configurazione

1. Assicurati che il bot possa leggere la cronologia dei messaggi e allegare file nel tuo canale di supporto.
2. Chiedi agli utenti di allegare il loro `Ryujinx.log` direttamente a un messaggio.
3. Un helper risponde a quel messaggio con `analyselog`.
4. Per i codici di errore, esegui `err <code>` e condividi il link di supporto se ne viene mostrato uno.
5. Facoltativamente aggiungi un trigger di chat o un messaggio fissato che ricorda questi due comandi.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `err <code>` | `nxerr`, `serr` | Nessuno | Spiega un codice di errore Switch in forma con trattino o esadecimale |
| `err2hex <NNNN-NNNN>` | `e2h` | Nessuno | Converte un codice con trattino in esadecimale |
| `hex2err <hex>` | `h2e` | Nessuno | Converte un esadecimale nella forma con trattino |
| `switchbrew <query>` | `sb`, `svc` | Nessuno | Cerca su switchbrew.org |
| `analyselog` | `analyzelog`, `analyselogs`, `analyzelogs`, `analyze`, `analyse` | Nessuno | Analizza un log Ryujinx allegato |

## Suggerimenti e avvertenze

- La forma con trattino deve essere esattamente di quattro cifre, un trattino e quattro cifre, con il primo gruppo che inizia con 2. I codici con lettere passano solo dall'elenco dei casi speciali.
- I log devono essere allegati come `.log` o `.txt`; un log incollato in un blocco di codice non viene letto.
- L'analizzatore legge l'intero file, quindi chiedi agli utenti il log della sessione in cui si è verificato il problema, non quello di un avvio nuovo.
- La ricerca su switchbrew.org è una richiesta in tempo reale; se il sito è lento, lo sarà anche il comando.
- I membri possono salvare il codice amico Switch nel loro profilo con `setswitchfc`, che fa parte del modulo User Profile.

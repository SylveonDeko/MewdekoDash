---
title: Evidenziazioni
slug: highlights
summary: I membri scelgono le parole da tenere d'occhio e ricevono un DM con il contesto ogni volta che qualcuno ne dice una nel server.
icon: fa-bolt
category: Community
dashboard: /dashboard/highlights
module: Highlights
tags: [highlights, keywords, watch words, notifications, mentions, dm alerts, ignore channel, ignore user, evidenziazioni, parole chiave, parole da monitorare, notifiche, menzioni, avvisi DM, ignora canale, ignora utente]
related: [afk, utility]
---

## Cosa fa

Un membro aggiunge una parola o una frase con `highlight add`. Da quel momento, ogni volta che un messaggio nel server contiene quella parola, il bot gli invia un DM. Il DM indica in quale server e canale è avvenuto, mostra i cinque messaggi precedenti e quello che corrisponde, e ha un pulsante **Vai al messaggio**.

Le evidenziazioni sono personali. Ogni membro gestisce il proprio elenco, sceglie quali canali e quali persone ignorare, e può disattivare le proprie evidenziazioni senza eliminarle. Lo staff non può aggiungere evidenziazioni per qualcun altro, ma la dashboard gli consente di vedere cosa viene monitorato e di rimuovere voci.

I membri ricevono DM solo per i canali che possono effettivamente vedere. Un membro che sta scrivendo nel server è considerato presente, quindi le evidenziazioni per lui vengono sospese per due minuti.

## Perché usarlo

- Essere avvisato quando viene menzionato il tuo nome, il tuo nickname o il tuo progetto senza una vera @menzione.
- Seguire un argomento come "giveaway" o "patch notes" in un server grande.
- Lo staff può controllare parole come "help" o "report" senza leggere ogni canale.
- I moderatori possono verificare cosa tengono d'occhio i membri e ripulire voci offensive o di spam.

## Come funziona la corrispondenza

Il bot controlla ogni messaggio non vuoto rispetto a ogni evidenziazione di quel server.

- Un'evidenziazione corrisponde come parola o frase intera. `cat` non corrisponde a "category", ma corrisponde a "the cat sat".
- La corrispondenza distingue maiuscole e minuscole. Aggiungi `Cat` e `cat` separatamente se le vuoi entrambe.
- Ogni membro riceve al massimo un DM ogni due minuti per server, indipendentemente da quante parole corrispondono.
- Scrivere in un punto qualsiasi del server avvia la stessa pausa di due minuti, così non ricevi DM per una conversazione a cui stai già partecipando.
- I messaggi degli utenti ignorati e nei canali ignorati vengono saltati per quel membro.
- Il DM viene saltato quando il membro non può vedere il canale o ha i DM chiusi.
- I messaggi vengono controllati tramite una coda che ne gestisce uno ogni due secondi. Su uno shard molto carico alcuni messaggi possono essere scartati da quella coda.

`highlight match some text` controlla il tuo elenco rispetto a una frase di esempio e ti dice quali delle tue parole sarebbero corrisposte. Questo controllo ignora le maiuscole, quindi è una guida approssimativa e non una copia esatta della regola attiva.

## Impostazioni per membro

Ogni membro ha una riga di impostazioni che viene creata la prima volta che modifica qualcosa.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Highlights on | attivo | `highlight toggle false` sospende tutte le tue evidenziazioni in questo server |
| Ignored channels | nessuno | Canali in cui le tue parole non attivano mai un DM |
| Ignored users | nessuno | Persone i cui messaggi non attivano mai le tue evidenziazioni |

## Impostazioni

La pagina Highlights della dashboard è destinata allo staff. Non aggiunge evidenziazioni; le mostra e le rimuove.

| Scheda | Cosa mostra |
| --- | --- |
| All Highlights | Ogni evidenziazione del server raggruppata per membro, con un pulsante di eliminazione per parola e un pulsante per rimuovere tutte le parole di un membro |
| Search | Trova le evidenziazioni che contengono una parola tra tutti i membri; la ricerca ignora le maiuscole |
| Disabled Users | Membri che hanno disattivato le proprie evidenziazioni, con quanti canali e utenti ignorano |
| Statistics | Total Highlights, Active Users, Top Word, Most Active, oltre a Top Highlighted Words e Recent Highlights |

## Procedura di configurazione

Non c'è nulla da attivare. Le evidenziazioni funzionano non appena il bot è nel server.

1. Come membro, esegui `highlight add yourname` in un qualsiasi canale.
2. Esegui `highlight list` per verificare che sia stata salvata.
3. Chiedi a qualcuno di scrivere il tuo nome in un altro canale. Aspetta un paio di secondi e controlla i tuoi DM.
4. Se ne ricevi troppi, esegui `highlight toggleignore #busy-channel` oppure `highlight toggleignore @user`.
5. Staff: apri **Evidenziazioni** nella dashboard per controllare la scheda **Tutti gli highlight** e rimuovere ciò che non serve.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non lo hai cambiato). Le stesse azioni esistono nel singolo comando slash `/highlights manage`, la cui opzione `action` accetta `Add`, `List`, `Delete`, `Match`, `ToggleUser`, `ToggleChannel` o `ToggleGlobal`, con le opzioni separate `words`, `user` e `channel`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `highlight add <word>` | `highlights`, `hl` | Nessuno | Tiene d'occhio una parola o una frase |
| `highlight list` | `highlights`, `hl` | Nessuno | Sfoglia le tue evidenziazioni, dieci per pagina |
| `highlight delete <number or word>` | `highlights`, `hl` | Nessuno | Rimuove per numero in elenco o parola esatta; `remove` fa lo stesso |
| `highlight match <text>` | `highlights`, `hl` | Nessuno | Mostra quali delle tue parole compaiono nel testo |
| `highlight toggleignore <#channel or @user>` | `highlights`, `hl` | Nessuno | Aggiunge o rimuove un canale o una persona dal tuo elenco degli ignorati |
| `highlight toggle <true or false>` | `highlights`, `hl` | Nessuno | Attiva o disattiva tutte le tue evidenziazioni in questo server |

## Suggerimenti e insidie

- Il bot deve poter leggere il canale per cercare corrispondenze al suo interno, e tu devi avere i DM aperti per i membri del server per ricevere gli avvisi.
- Aggiungere una parola che hai già viene rifiutato. Il controllo dei duplicati ignora le maiuscole, ma la corrispondenza in tempo reale no.
- L'eliminazione per numero usa la posizione mostrata da `highlight list`, che cambia dopo ogni rimozione.
- L'elenco delle evidenziazioni e le impostazioni sono memorizzate in cache per trenta minuti per server. Aggiungere o eliminare singole parole tramite comandi o dashboard aggiorna subito la cache; rimuovere tutte le parole di un membro dalla dashboard può richiedere fino a trenta minuti prima di interrompere i DM.
- Quando il bot lascia un server, le sue evidenziazioni e impostazioni vengono ripulite al successivo riavvio del bot.

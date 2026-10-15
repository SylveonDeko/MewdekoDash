---
title: Parola del giorno
slug: wordoftheday
summary: Pubblica ogni giorno una parola del vocabolario con la sua definizione, la pronuncia e un esempio, scelta da un dizionario per argomento e difficoltà oppure da una lista scritta dal server stesso.
icon: fa-book-open
category: Community
dashboard: /dashboard/wordoftheday
module: WordOfTheDay
tags: [word of the day, wotd, vocabulary, dictionary, definition, daily, datamuse, topic, schedule, parola del giorno, vocabolario, dizionario, definizione, quotidiano, argomento, programmazione]
related: [birthday, utility]
---

## Cosa fa

Una volta al giorno, a un'ora scelta dal server nel proprio fuso orario, il bot pubblica una parola in un canale scelto. Il messaggio mostra la parola, come si pronuncia, la sua categoria grammaticale, una definizione e una frase d'esempio quando ne esiste una. Un ruolo può essere menzionato con ogni pubblicazione.

Le parole provengono dal dizionario Datamuse e vengono filtrate tramite tre impostazioni: un **argomento** verso cui le parole devono orientarsi, una **categoria grammaticale** e una **difficoltà** basata su quanto spesso la parola compare nell'inglese scritto. Il bot evita di ripetere qualsiasi cosa abbia pubblicato negli ultimi novanta giorni.

I server possono anche costruire una **lista personalizzata** con `wotdadd`. Se si omette la definizione, il bot ne cerca una. La **modalità sorgente** decide se le pubblicazioni provengono dal dizionario, dalla lista personalizzata, oppure dalla lista personalizzata prima e dal dizionario quando questa si esaurisce.

## Programmazione per giorno della settimana o mese

Le regole possono sovrascrivere argomento, categoria grammaticale e difficoltà per un giorno della settimana o un mese specifico. Una regola cambia solo i campi che imposta, quindi una regola del lunedì con il solo argomento usa ancora la categoria grammaticale e la difficoltà di base. Quando si applicano entrambe, le regole per giorno della settimana hanno la precedenza sulle regole per mese, e le regole per mese hanno la precedenza sulle impostazioni di base.

Esempi:

- `wotdday monday science` fa sì che la parola del lunedì sia a tema scienza.
- `wotddayfilter friday adjective rare` fa sì che il venerdì ci siano aggettivi rari.
- `wotdmonth october spooky halloween` tematizza tutto ottobre.
- `wotdschedule` mostra ogni regola e quali filtri sono attivi oggi.

## Thread di discussione

Quando è attivato, il bot crea un thread pubblico sotto ogni pubblicazione giornaliera e vi inserisce un messaggio di avvio che invita a usare la parola in una frase. Il nome del thread deriva da un modello (predefinito `Word of the day: %wotd.word%`) che supporta `%wotd.word%`, `%wotd.date%`, `%wotd.pos%` e i soliti segnaposto del server. `wotdthread` lo attiva o disattiva, `wotdthreadname` imposta, mostra o cancella il modello del nome, e `wotdthreadarchive` imposta per quanto tempo il thread resta aperto prima dell'archiviazione automatica (1 ora, 1 giorno, 3 giorni o 1 settimana).

## Comandi

| Comando | Cosa fa |
| --- | --- |
| `wotd` | Mostra la parola di oggi, oppure un'anteprima se non è ancora stata pubblicata. |
| `wotdchannel #channel` | Imposta il canale e attiva le pubblicazioni. |
| `wotdtime 9` | Imposta l'ora locale per la pubblicazione. |
| `wotdtimezone Europe/London` | Imposta il fuso orario. |
| `wotdtopic space` | Imposta l'argomento di base. |
| `wotdpos noun` | Limita la categoria grammaticale. |
| `wotddifficulty rare` | Imposta la difficoltà. |
| `wotdmode mixed` | Sceglie dizionario, personalizzata o mista. |
| `wotdadd word [definition]` | Aggiunge una parola personalizzata. |
| `wotdmessage` | Imposta un modello di messaggio personalizzato con segnaposto o JSON di embed. |
| `wotdthread` | Attiva o disattiva il thread di discussione sotto ogni pubblicazione. |
| `wotdthreadname [template\|clear]` | Imposta, mostra o cancella il modello del nome del thread. |
| `wotdthreadarchive 1h\|24h\|3d\|7d` | Imposta per quanto tempo il thread resta aperto prima dell'archiviazione automatica. |
| `wotdpost` | Pubblica subito una nuova parola. |

## Segnaposto del messaggio

`%wotd.word%`, `%wotd.definition%`, `%wotd.pos%`, `%wotd.example%`, `%wotd.phonetic%`, `%wotd.date%` e `%wotd.ping%` sono disponibili dentro un modello personalizzato, insieme ai soliti segnaposto del server.

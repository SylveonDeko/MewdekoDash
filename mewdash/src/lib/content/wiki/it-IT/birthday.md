---
title: Compleanni
slug: birthday
summary: I membri impostano una data di compleanno sul proprio profilo e scelgono di partecipare, e il bot lo annuncia in un canale, facoltativamente con un ruolo temporaneo di compleanno e una menzione di ruolo.
icon: fa-birthday-cake
category: Community
dashboard: /dashboard/birthday
module: Birthday
tags: [birthday, birthdays, bday, celebrate, birthday role, announcement, timezone, age, profile, compleanno, compleanni, festeggiare, ruolo compleanno, annuncio, fuso orario, età, profilo]
related: [utility, administration]
---

## Cosa fa

Un membro imposta il proprio compleanno una sola volta con `setbirthday`, poi esegue `birthdayannouncements` in qualsiasi server che abbia attivato la funzione. Ogni giorno il bot controlla chi ha il compleanno, pubblica un messaggio nel canale degli annunci e può assegnare un ruolo di compleanno per 24 ore. Se è impostato un ruolo da menzionare, viene citato prima del messaggio.

I compleanni sono memorizzati nel profilo bot del membro, non per server, quindi un solo `setbirthday` copre ogni server che condivide con il bot. Se un compleanno viene annunciato in un dato server dipende da tre cose: il membro ha scelto di partecipare, il suo profilo non è privato e la sua modalità di visualizzazione del compleanno non è disattivata.

Chiunque può vedere chi festeggia con `birthdaytoday` e chi sta per arrivare con `birthdaylist`. L'età viene mostrata accanto al nome, a meno che il membro non abbia scelto una modalità di visualizzazione che nasconde l'anno.

Lo staff configura il canale, i ruoli e il messaggio dalla pagina **Compleanni** della dashboard oppure con i comandi `birthday*`.

## Perché usarlo

- Server della community che vogliono un post quotidiano di "buon compleanno" senza che nessuno tenga traccia delle date a mano.
- Dare ai membri un ruolo colorato di compleanno per il giorno, così si distinguono in chat.
- Menzionare un ruolo "squadra compleanni" così le persone vedono davvero l'annuncio.
- Lasciare che i membri scelgano quanto del loro compleanno è pubblico, fino a nasconderlo del tutto.

## Chi viene annunciato

Un membro è incluso negli annunci e negli elenchi solo quando sono vere tutte queste condizioni:

| Requisito | Come lo controlla il membro |
| --- | --- |
| Un compleanno è impostato | `setbirthday <date>` |
| Gli annunci sono attivati | `birthdayannouncements` lo attiva o disattiva; disattivato per impostazione predefinita |
| Il profilo non è privato | `setprivacy public` sul profilo |
| La modalità di visualizzazione non è Disabled | `setbirthdayprivacy <mode>` |

Il controllo viene eseguito sui membri attualmente presenti nel server, quindi chi se ne va non viene annunciato.

### Modalità di visualizzazione del compleanno

`setbirthdayprivacy` accetta uno di questi valori. Influisce su cosa viene mostrato negli elenchi, nel profilo e in `birthdaytoday`.

| Modalità | Effetto |
| --- | --- |
| `Default` | Data completa mostrata, l'età viene visualizzata negli elenchi |
| `MonthOnly` | Solo il mese, età nascosta |
| `YearOnly` | Solo l'anno, età ancora visualizzata |
| `MonthAndDate` | Mese e giorno, età nascosta |
| `Disabled` | Compleanno nascosto e mai annunciato |

## Come funziona il controllo giornaliero

Il servizio viene eseguito una volta all'ora e confronta il mese e il giorno del compleanno di ogni membro con la data odierna in UTC. La prima ora di un nuovo giorno UTC che trova dei compleanni li pubblica, e il server viene segnato come completato per quel giorno così nulla viene pubblicato due volte.

Gli annunci avvengono solo quando la funzione **Annunci** è attiva e un canale è impostato. Impostare un canale con `birthdaychannel` o dalla dashboard attiva la funzione automaticamente.

I fusi orari vengono memorizzati ma il controllo giornaliero non li usa ancora. `birthdaytimezone` e l'impostazione **Fuso orario del server** sono accettati e mostrati nell'embed di configurazione, ma gli annunci vengono inviati in base al giorno UTC.

## Il ruolo di compleanno

Quando **Ruolo di compleanno** è attivo e un ruolo è impostato, ogni membro annunciato riceve il ruolo nel momento dell'annuncio e lo perde 24 ore dopo. Il timer di rimozione è in memoria, quindi se il bot si riavvia durante la giornata il ruolo resta finché qualcuno non lo rimuove.

Il bot ha bisogno del permesso Gestisci ruoli e il suo ruolo più alto deve stare sopra il ruolo di compleanno.

## Il messaggio di annuncio

Il messaggio predefinito è `Happy Birthday %user.mention%!` con emoji di festa intorno. Sostituiscilo con `birthdaymessage` oppure con l'editor **Messaggio di compleanno** della dashboard. Il testo passa dal parser degli embed, quindi funziona tutto ciò che produce il creatore di embed, e la menzione del ruolo da notificare viene anteposta se è attiva.

### Segnaposto

Il messaggio supporta i segnaposto standard di utente, server, canale e bot dalla pagina dei segnaposto, più un valore specifico per i compleanni.

| Segnaposto | Valore |
| --- | --- |
| `%user.mention%` | Menziona il membro che compie gli anni |
| `%user.name%` | Il suo nome utente |
| `%user.avatar%` | URL del suo avatar |
| `%server.name%` | Il nome del server |
| `%birthday.age%` | L'età che compie, oppure `Unknown` |

> [!WARNING]
> Usa `%user.mention%`, non `{user}`. L'aiuto del comando testuale menziona `{user}`, ma nell'annuncio pubblicato viene sostituita solo la forma `%...%`.

## Impostazioni

Tutto si trova nella pagina **Compleanni**, divisa in tre schede: **Configurazione**, **Utenti** e **Statistiche**.

**Configurazione** contiene le impostazioni di base, l'editor del messaggio e un pannello **Funzioni compleanno** con un interruttore per ogni funzione.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Canale | nessuno | Dove vengono pubblicati gli annunci |
| Ruolo di compleanno | nessuno | Ruolo assegnato per 24 ore nel giorno del compleanno |
| Ruolo da notificare | nessuno | Ruolo menzionato prima di ogni annuncio |
| Fuso orario del server | UTC | Memorizzato per il server, mostrato nell'embed di configurazione |
| Giorni di promemoria prima del compleanno | 0 | Da 0 a 30; memorizzato, al momento non viene inviato alcun promemoria |
| Messaggio di compleanno | embed predefinito | L'annuncio, con i segnaposto sopra |

| Interruttore funzione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Annunci | disattivato | Pubblica il messaggio quotidiano nel canale |
| Ruolo di compleanno | disattivato | Assegna il ruolo temporaneo |
| Promemoria | disattivato | Interruttore segnaposto; al momento non viene inviato nulla |
| Ruolo da notificare | disattivato | Menziona il ruolo da notificare negli annunci |
| Supporto fuso orario | disattivato | Interruttore segnaposto; il controllo continua a girare in UTC |

**Utenti** mostra i **Prossimi compleanni** per i prossimi 7, 14 o 30 giorni e un elenco **Tutti gli utenti** di ogni membro con un compleanno impostato, con i compleanni di oggi evidenziati in cima alla pagina. **Statistiche** mostra **Utenti totali**, **Compleanni impostati**, **Compleanni pubblici** e **Compleanni di oggi**.

> [!NOTE]
> Salvare il modulo della dashboard scrive solo i valori che hai compilato. Per cancellare un ruolo o il canale, usa `birthdayrole` o `birthdaypingrole` senza ruolo, oppure reimposta tutto con `/birthday config reset`.

## Guida alla configurazione

1. Apri **Compleanni** nella dashboard.
2. In **Configurazione**, scegli il **Canale** per gli annunci e clicca **Salva configurazione**.
3. Attiva **Annunci** nel pannello **Funzioni compleanno**.
4. Facoltativamente scegli un **Ruolo di compleanno** e attiva **Ruolo di compleanno**, e un **Ruolo da notificare** con **Ruolo da notificare** attivo.
5. Facoltativamente scrivi il tuo **Messaggio di compleanno** usando `%user.mention%` e `%birthday.age%`.
6. Dì ai membri di eseguire `setbirthday` e poi `birthdayannouncements` per partecipare.
7. Controlla la scheda **Utenti** per verificare che compaiano in **Prossimi compleanni**.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Le versioni slash si trovano sotto `/birthday` e `/birthday config`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `setbirthday <date>` | | Nessuno | Imposta il tuo compleanno sul tuo profilo, per esempio `setbirthday 1998-04-12` |
| `setbirthdayprivacy <mode>` | | Nessuno | Scegli una delle modalità di visualizzazione sopra |
| `birthdayannouncements` | `bdayann` | Nessuno | Partecipa o esci dagli annunci |
| `birthdaytimezone <zone>` | `bdaytz` | Nessuno | Memorizza il tuo fuso orario, per esempio `Europe/London` |
| `birthdaytoday` | `todaysbirthdays` | Nessuno | Elenca chi festeggia oggi |
| `birthdaylist [days]` | `bdaylist`, `upcomingbirthdays` | Nessuno | Prossimi compleanni, da 1 a 30 giorni, predefinito 7 |
| `birthdaychannel [#channel]` | `bdaychannel`, `bdaychan` | Amministratore | Imposta il canale degli annunci e attiva gli annunci |
| `birthdayrole [@role]` | `bdayrole` | Amministratore | Imposta il ruolo di compleanno di 24 ore, oppure lo cancella senza ruolo |
| `birthdaypingrole [@role]` | `bdayping` | Amministratore | Imposta il ruolo da menzionare, oppure lo cancella senza ruolo |
| `birthdaymessage [text]` | `bdaymsg` | Amministratore | Imposta il testo dell'annuncio, oppure mostra quello attuale |
| `birthdayconfig` | `bdaycfg` | Amministratore | Mostra la configurazione attuale |

`/birthday config reset` cancella ogni impostazione e disattiva tutte le funzioni. Non ha un equivalente come comando testuale.

## Suggerimenti e trappole

- I membri non vengono annunciati finché non eseguono `birthdayannouncements`. Diglielo, altrimenti non comparirà nessuno.
- `setbirthday` accetta qualsiasi cosa il bot riesca a interpretare come data. Usa un formato non ambiguo come `1998-04-12`.
- `birthdaytimezone` accetta solo una breve lista fissa di sedici fusi orari come `UTC`, `GMT`, `America/New_York`, `Europe/London`, `Asia/Tokyo`, `Asia/Kolkata`, `Australia/Sydney` e `Pacific/Auckland`. Il menu a tendina **Fuso orario del server** della dashboard ha una lista simile di tredici.
- Il controllo giornaliero usa UTC. I membri lontani da UTC possono essere annunciati con qualche ora di anticipo o di ritardo.
- Il bot ha bisogno di Gestisci ruoli per il ruolo di compleanno, e di Inviare messaggi e Incorporare link nel canale degli annunci.
- `birthdayconfig` mostra un campo "Reminder Days" e una funzione Reminders. Sono memorizzati ma al momento non inviano nulla.
- Non esiste un comando per eliminare un compleanno memorizzato. I membri lo nascondono eseguendo `setbirthdayprivacy Disabled` oppure uscendo con `birthdayannouncements`.

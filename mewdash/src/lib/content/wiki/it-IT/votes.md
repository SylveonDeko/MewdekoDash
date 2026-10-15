---
title: Voti
slug: votes
summary: Premia i membri che votano per il tuo server su top.gg con un messaggio di ringraziamento, un conteggio dei voti e ruoli temporanei o permanenti.
icon: fa-thumbs-up
category: Community
dashboard: /dashboard/votes
module: Votes
tags: [votes, top.gg, vote rewards, vote roles, webhook, vote password, leaderboard, voti, ricompense voto, ruoli voto, password voto, classifica]
related: [administration, xp]
---

## Cosa fa

Questa non è una funzione di sondaggi. Votes tiene traccia dei voti che il tuo server riceve su top.gg e premia chi li esprime. Quando top.gg comunica a Mewdeko che qualcuno ha votato, il bot registra il voto, pubblica un ringraziamento nel tuo canale dei voti con il totale progressivo di quel membro e assegna gli eventuali ruoli configurati come ricompense.

Dal punto di vista di un membro: vota per il server su top.gg, poi compare un messaggio nel canale dei voti che lo menziona e indica quante volte ha votato. Se hai impostato ruoli per i voti, li riceve nello stesso momento, in modo permanente oppure per una durata stabilita.

Dal punto di vista dello staff: imposti un canale dei voti, una password per il webhook, un messaggio personalizzato facoltativo e fino a dieci ruoli di ricompensa. Da quel momento il bot gestisce ogni voto da solo. `votes` e `votesleaderboard` permettono a chiunque di controllare i conteggi.

Il collegamento tra top.gg e il tuo server è la password dei voti. top.gg la invia nell'header Authorization della chiamata webhook, e Mewdeko confronta quell'header con la password memorizzata per ogni server per capire a quale server appartiene il voto.

## Perché usarlo

- Hai inserito il tuo server su top.gg e vuoi un ringraziamento visibile ogni volta che qualcuno vota.
- Vuoi assegnare ai votanti un ruolo "Voter", oppure un ruolo di vantaggio temporaneo che scade dopo dodici ore.
- Vuoi una classifica mensile dei votanti per premiare il "miglior votante".
- Vuoi che i membri possano controllare da soli il proprio conteggio dei voti senza chiederlo allo staff.

## Come viene elaborato un voto

1. top.gg invia una richiesta all'endpoint webhook `/votes/` del bot con l'ID Discord del votante e la tua password nell'header Authorization.
2. Il bot trova il server la cui password dei voti memorizzata corrisponde. Se nessuno corrisponde, il voto viene scartato.
3. Il voto viene salvato con l'ID del votante e l'orario.
4. Se è impostato un canale dei voti, il bot vi pubblica il messaggio di ringraziamento. Senza canale dei voti non viene pubblicato nulla e non vengono assegnati ruoli.
5. Ogni ruolo di voto viene aggiunto al membro. I ruoli con un timer vengono rimossi di nuovo quando il timer scade, usando lo stesso sistema di ruoli temporizzati dei silenziamenti.

> [!WARNING]
> La password è l'unico elemento che collega un voto al tuo server. Chiunque la conosca può inviare voti falsi. Non incollarla mai in un canale pubblico; il bot la imposta tramite un modulo privato proprio per questo motivo.

## Il messaggio di ringraziamento

Per impostazione predefinita il bot invia una menzione del votante più un embed intitolato "Thanks for voting for <server>", una riga con il suo totale di voti e il suo avatar come miniatura.

Puoi sostituirlo con un testo o un embed tuo usando `votemessage` oppure la casella **Annuncio di voto personalizzato** della dashboard. Il testo passa dal parser degli embed, quindi funziona qualsiasi cosa prodotta dall'editor embed. Imposta `-` nel comando, oppure svuota la casella della dashboard, per tornare al messaggio predefinito.

### Segnaposto

Il messaggio personalizzato supporta il set generale di segnaposto (utente, server, canale, bot e segnaposto temporali dalla pagina dei segnaposto) più due segnaposto specifici dei voti.

| Segnaposto | Valore |
| --- | --- |
| `%votestotalcount%` | Quante volte questo membro ha votato in totale |
| `%votesmonthcount%` | Quante volte ha votato nel mese solare in corso |
| `%user.mention%`, `%user.name%`, `%user.id%`, `%user.avatar%` | Il votante |
| `%server.name%`, `%server.id%`, `%server.icon%`, `%server.members%` | Il tuo server |

> [!EXAMPLE]
> `Thanks %user.mention% for voting! That is vote number %votestotalcount% (%votesmonthcount% this month).`

Eseguire `votemessage` senza testo mostra un'anteprima del messaggio attuale come apparirebbe a te, usando i tuoi conteggi di voti.

## Ruoli per i voti

Un ruolo per i voti viene dato a ogni votante. Ogni ruolo ha una durata facoltativa in secondi; `0` significa che il ruolo è permanente.

- Fino a dieci ruoli per i voti per server.
- Il ruolo `@everyone` non può essere aggiunto.
- Un ruolo non può essere aggiunto due volte; usa `voteroleedit` per cambiarne la durata.
- I ruoli temporizzati vengono rimossi automaticamente quando la durata scade.
- Se il bot non riesce ad assegnare un ruolo (per esempio perché il ruolo è sopra il ruolo più alto del bot), lo salta senza segnalazioni.

## Conteggi dei voti e classifica

`votes` mostra i voti di un membro nel mese corrente e in totale, con il suo avatar. `votesleaderboard` classifica tutti i membri del server per voti totali, dodici per pagina. Passando `true` la classifica usa solo i voti del mese corrente. Entrambi i conteggi "mensili" confrontano il mese solare, non gli ultimi trenta giorni.

## Impostazioni

La pagina Votes ha tre schede: **Configurazione**, **Ruoli di voto** e **Statistiche**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Vote Announcement Channel | nessuno | Dove vengono pubblicati i messaggi di ringraziamento. Senza di esso non succede nulla |
| API Password (for webhooks) | nessuna | Il segreto che top.gg deve inviare nell'header Authorization |
| Custom Vote Announcement | embed predefinito | Il tuo messaggio, con i segnaposto sopra. Vuoto significa quello predefinito |
| Role to Grant | nessuno | Un ruolo assegnato a ogni votante (scheda Vote Roles) |
| Duration (seconds, 0 for permanent) | 0 | Quanto dura un ruolo per i voti prima di essere rimosso |

La scheda **Statistiche** mostra i voti totali, il numero di ruoli per i voti, il conteggio del miglior votante e una classifica dei primi dieci.

## Procedura di configurazione

1. Apri **Voti** nella dashboard e resta su **Configurazione**.
2. Scegli un **Canale annunci votazioni**. Senza di esso i voti vengono registrati, ma non viene pubblicato nulla e non vengono assegnati ruoli.
3. Inserisci una **API Password**. Rendila lunga e casuale; trattala come una chiave API.
4. Facoltativamente scrivi un **Annuncio di voto personalizzato** usando i segnaposto sopra, poi **Salva configurazione**.
5. Nella pagina di top.gg del tuo server, apri la sezione dei webhook. Imposta l'URL del webhook sull'endpoint `/votes/` del bot e il valore Authorization sulla stessa password.
6. Nella scheda **Ruoli di voto**, scegli un **Ruolo da concedere** e una **Durata**, poi **Aggiungi ruolo di voto**. Ripeti per un massimo di dieci ruoli.
7. Assicurati che il ruolo del bot sia sopra tutti i ruoli per i voti nell'elenco dei ruoli.
8. Usa il pulsante di webhook di prova di top.gg, oppure aspetta un voto vero, e controlla il canale dei voti.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `votechannel <#channel>` | | Manage Server | Imposta il canale per i messaggi di ringraziamento |
| `votemessage [text]` | `votemsg` | Manage Server | Mostra l'anteprima, imposta o reimposta (`-`) il messaggio personalizzato |
| `votepassword` | `votepass` | Manage Server | Imposta la password del webhook tramite un modulo privato |
| `voteroleadd <@role> [time]` | `vra` | Manage Server | Aggiunge un ruolo per i voti, con durata facoltativa, per esempio `voteroleadd @Voter 12h` |
| `voteroleedit <@role> <time>` | `vre` | Manage Server | Cambia per quanto tempo dura un ruolo per i voti |
| `voteroleremove <@role>` | `vrr` | Manage Server | Rimuove un ruolo per i voti |
| `voteroleslist` | `vrl` | Manage Server | Elenca i ruoli per i voti e le loro durate |
| `voterolesclear` | `vrc` | Manage Server | Rimuove ogni ruolo per i voti, dopo conferma |
| `votes [@user]` | | Nobody | Mostra i voti mensili e totali di un membro |
| `votesleaderboard [true]` | `voteslb` | Nobody | Classifica i votanti per totale, oppure per il mese corrente con `true` |

Gli stessi comandi esistono come comandi slash sotto `/votes`.

## Consigli e insidie

- Sono supportati solo i voti per il server su top.gg. Non c'è alcuna integrazione con altre liste di bot, e questa funzione non crea sondaggi.
- Senza canale dei voti non ci sono messaggi né ruoli, anche se il voto viene comunque conteggiato.
- Il bot ha bisogno del permesso Gestisci ruoli e il suo ruolo deve stare sopra ogni ruolo per i voti, altrimenti le ricompense falliscono in silenzio.
- I ruoli per i voti temporizzati usano lo stesso sistema dei silenziamenti temporizzati e compaiono nel registro di audit con il motivo "Vote Role".
- `voteroleedit` cerca il ruolo solo tramite ID, quindi usalo solo per ruoli che hai effettivamente aggiunto in questo server.
- Cambiare la password non invalida i voti passati, ma top.gg smetterà di corrispondere finché non aggiorni anche l'header dalla loro parte.

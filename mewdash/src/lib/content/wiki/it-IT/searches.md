---
title: Ricerche
slug: searches
summary: Cerca informazioni senza uscire da Discord, dal meteo, l'ora e le definizioni del dizionario agli anime, i film, le immagini, i profili osu!, le battute e le GIF di reazione.
icon: fa-magnifying-glass
category: Entertainment
module: Searches
tags: [search, weather, time, define, urban dictionary, wikipedia, google, image search, anime, manga, movie, osu, pokemon, translate, xkcd, meme, reddit, hug, pat, ship, ricerca, meteo, ora, definizione, dizionario, immagini, film, battute, traduci, gif, reazioni, abbraccio, coccola]
related: [streams, feeds, twitch, games, utility]
---

## Cosa fa

Il modulo Ricerche è un insieme di comandi di consultazione che recuperano qualcosa da un servizio esterno e lo pubblicano nel canale. I membri chiedono il meteo di una città, l'ora in un altro posto, la definizione di una parola, un anime o un film, il riassunto di una pagina Wikipedia, un gatto casuale o una GIF di reazione per un abbraccio o uno schiaffo. La maggior parte dei risultati arriva come embed, e le ricerche con molti risultati sono paginate.

Non esiste una pagina nella dashboard. Quasi tutti i comandi sono aperti a tutti, e solo la traduzione automatica richiede i permessi dello staff.

Le notifiche degli stream e i feed RSS fanno parte dello stesso modulo del bot, ma hanno articoli propri. Consulta le pagine sulle notifiche degli stream e sui feed per `streamadd`, `feedadd` e i comandi collegati.

## Perché usarlo

- Risolvi "che ore sono da te?" con `time` invece che con i calcoli.
- Controlla le previsioni prima di un evento con una scheda `weather` interattiva.
- Cerca un anime, un manga o un personaggio mentre ne parlate in chat.
- Lascia che i membri inviino abbracci, coccole e cinque al volo sotto forma di GIF.
- Traduci un messaggio al volo, oppure traduci automaticamente un canale per una comunità internazionale.

## Meteo e ora

`weather <place>` individua il luogo con Open-Meteo e mostra le condizioni attuali: temperatura, percezione, umidità, velocità del vento e raffiche, pressione, copertura nuvolosa, visibilità e le massime e minime della giornata. Pulsanti e un menu a tendina passano alle previsioni orarie, alle condizioni orarie dettagliate e a una vista giornaliera con massima, minima e precipitazioni di oggi e domani.

`time <place>` cerca il luogo e mostra l'ora attuale e il fuso orario. Quando corrispondono più luoghi, propone i candidati tra cui scegliere.

## Parole e conoscenza

| Comando | Fonte | Risultato |
| --- | --- | --- |
| `define <word>` | Dizionario Pearson | Definizione, parte del discorso e una frase di esempio |
| `urbandict <term>` | Urban Dictionary | Definizioni, paginate |
| `wiki <query>` | Wikipedia | Riassunto della prima pagina corrispondente |
| `wikia <site> <query>` | Un wiki Fandom | Riassunto da quel wiki |
| `google <query>` | Google, con ripiego su DuckDuckGo | Risultati web |
| `bible <book> <chapter:verse>` | API della Bibbia | Il testo del versetto |
| `resolvetonetags <text>` | integrato | Spiega i tone tag come `/j` o `/s` trovati nel testo |
| `translate <langs> <text>` | API di traduzione | Testo tradotto; langs è `from>to`, ad esempio `translate en>fr hello` |
| `translangs` | API di traduzione | Lingue disponibili |

### Traduzione automatica

`autotranslate` attiva o disattiva la traduzione automatica nel canale corrente e richiede il permesso Amministratore. Passa `del` per eliminare il messaggio originale dopo averlo tradotto, oppure `nodel` (predefinito) per conservarlo. Ogni membro esegue poi `autotranslang en>fr` per impostare la propria coppia di lingue per quel canale, oppure `autotranslang` senza nulla per rimuoverla.

## Media e fandom

| Comando | Cosa ottieni |
| --- | --- |
| `anime <query>` | Risultati della ricerca di anime con dettagli |
| `manga <query>` | Risultati della ricerca di manga |
| `charinfo <name>` | Nomi, descrizione e immagine di un personaggio |
| `findanime [image]` | Identifica un anime da uno screenshot tramite trace.moe; allega un'immagine oppure indica un URL |
| `mal <username or @user>` | Un profilo MyAnimeList con le statistiche di visione, completati e altro |
| `movie <title>` | Dettagli IMDb tramite OMDb |
| `youtube <query>` | Risultati della ricerca su YouTube |
| `steam <game>` | Link alla pagina del gioco sullo store Steam |
| `pokemon <name>` | Dettagli del Pokémon |
| `osu <user> [mode]`, `osu5 <user> [mode]` | Profilo osu!, oppure le prime cinque giocate; le modalità sono standard, taiko, catch e mania |
| `gatari <user> [mode]` | Profilo osu!Gatari |
| `xkcd [number or latest]` | Una vignetta di xkcd, casuale per impostazione predefinita |

## Immagini

`image <query>` cerca su Google e DuckDuckGo con la ricerca sicura in modalità rigorosa, poi fa passare i risultati da un controllo di sicurezza prima di mostrarli in un embed paginato. Può essere usato una volta ogni venti secondi per membro. `safebooru <tag>` recupera un'immagine con tag da Safebooru. `revimg <url>` e `revav [@user]` forniscono link di ricerca inversa per un'immagine o un avatar su Google, TinEye e Yandex. `color <hex...>` mostra campioni per uno o più colori esadecimali.

Immagini casuali: `randomcat`, `randomdog`, `randomfood`, `randombird`, `randomneko`, `randomkitsune` e `randomwaifu`. `meme` pubblica un meme casuale da un insieme di subreddit, e `randomreddit <subreddit>` pubblica un post casuale da un subreddit dopo aver verificato che non sia contrassegnato come NSFW. `memelist` mostra i modelli di memegen e `memegen <template> [text]` ne crea uno. `rip @user` crea un'immagine di lapide con il suo nome e il suo avatar. `shorten <url>` accorcia un link.

## Battute

`randjoke`, `yomama`, `chucknorris`, `wowjoke` e `magicitem` recuperano ciascuno una battuta o la descrizione di un oggetto dalle rispettive API. `catfact` pubblica un fatto sui gatti.

## Comandi di reazione

Questi comandi pubblicano una GIF anime per l'azione. Quelli rivolti a qualcuno richiedono una menzione: `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold` e `highfive`. Quelli riferiti a te stesso accettano un testo facoltativo: `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave` e `wink`. Sono tutti disponibili anche come comandi slash.

`ship @user [@user2]` calcola la compatibilità tra due membri (oppure tra te e un membro) e pubblica un'immagine di coppia con un commento.

## Impostazioni

Questo modulo non ha una pagina nella dashboard né impostazioni per server, oltre all'interruttore della traduzione automatica. Alcuni comandi si basano su chiavi API che il proprietario del bot configura; se una chiave manca, il comando risponde con un errore invece dei risultati.

## Procedura di configurazione

1. Non c'è nulla da attivare. Esegui `weather London` oppure `define serendipity` per verificare che il bot possa rispondere nel canale.
2. Se vuoi un canale tradotto, esegui `autotranslate` lì come amministratore, poi fai impostare ai membri `autotranslang en>es` o simili.
3. Usa il modulo dei permessi se vuoi limitare i comandi di reazione o immagini a determinati canali.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non lo hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `weather <place>` | `we` | Nessuno | Scheda meteo interattiva |
| `time <place>` | | Nessuno | Ora attuale e fuso orario |
| `define <word>` | `def` | Nessuno | Definizione dal dizionario |
| `urbandict <term>` | `ud` | Nessuno | Urban Dictionary |
| `wiki <query>` | `wikipedia` | Nessuno | Riassunto di Wikipedia |
| `wikia <site> <query>` | `fandom` | Nessuno | Ricerca su un wiki Fandom |
| `google <query>` | `g` | Nessuno | Ricerca web |
| `bible <book> <chapter:verse>` | | Nessuno | Versetto biblico |
| `resolvetonetags <text>` | `tonetag`, `resolvetonetag`, `tonetags` | Nessuno | Spiega i tone tag |
| `translate <langs> <text>` | `trans` | Nessuno | Traduce un testo, ad esempio `translate en>fr hello` |
| `translangs` | | Nessuno | Lingue supportate |
| `autotranslate [del\|nodel]` | `at`, `autotrans` | Amministratore | Attiva o disattiva la traduzione automatica del canale |
| `autotranslang [from>to]` | `atl` | Nessuno | La tua coppia di lingue per la traduzione automatica |
| `anime <query>` | `ani`, `aq` | Nessuno | Ricerca anime |
| `manga <query>` | `mang`, `mq` | Nessuno | Ricerca manga |
| `charinfo <name>` | `characterinfo` | Nessuno | Ricerca personaggi |
| `findanime [image]` | `whatanime` | Nessuno | Identifica un anime da uno screenshot |
| `mal <username or @user>` | | Nessuno | Profilo MyAnimeList |
| `movie <title>` | `omdb`, `imdb` | Nessuno | Dettagli del film |
| `youtube <query>` | `yt` | Nessuno | Ricerca su YouTube |
| `steam <game>` | | Nessuno | Link allo store Steam |
| `pokemon <name>` | | Nessuno | Dettagli del Pokémon |
| `osu <user> [mode]` | | Nessuno | Profilo osu! |
| `osu5 <user> [mode]` | | Nessuno | Prime cinque giocate osu! |
| `gatari <user> [mode]` | | Nessuno | Profilo osu!Gatari |
| `xkcd [number\|latest]` | | Nessuno | Vignetta xkcd |
| `image <query>` | `img`, `rimg` | Nessuno | Ricerca immagini sicura |
| `safebooru [tag]` | | Nessuno | Immagine da Safebooru |
| `revimg <url>` | | Nessuno | Link per la ricerca inversa di immagini |
| `revav [@user]` | | Nessuno | Ricerca inversa di un avatar |
| `color <hex...>` | `clr` | Nessuno | Campioni di colore |
| `randomcat` | `meow` | Nessuno | Immagine di un gatto |
| `randomdog` | `woof` | Nessuno | Immagine di un cane |
| `randomfood` | `yum` | Nessuno | Immagine di cibo |
| `randombird` | `birb`, `bird` | Nessuno | Immagine di un uccello |
| `randomneko` | `neko` | Nessuno | Immagine neko |
| `randomkitsune` | `kitsune` | Nessuno | Immagine kitsune |
| `randomwaifu` | `waifu` | Nessuno | Immagine waifu |
| `meme` | `randommeme` | Nessuno | Meme casuale da Reddit |
| `randomreddit <subreddit>` | `subreddit` | Nessuno | Post casuale da un subreddit |
| `memelist` | | Nessuno | Modelli di memegen |
| `memegen <template> [text]` | | Nessuno | Crea un meme |
| `rip <@user>` | | Nessuno | Immagine di lapide |
| `shorten <url>` | | Nessuno | Accorcia un link |
| `randjoke` | | Nessuno | Battuta casuale |
| `yomama` | `ym` | Nessuno | Battuta "yo mama" |
| `chucknorris` | `cn` | Nessuno | Battuta su Chuck Norris |
| `wowjoke` | | Nessuno | Battuta su World of Warcraft |
| `magicitem` | `mi` | Nessuno | Oggetto magico di WoW |
| `catfact` | | Nessuno | Fatto sui gatti |
| `ship <@user> [@user2]` | | Nessuno | Immagine con punteggio di compatibilità |
| `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold`, `highfive <@user>` | | Nessuno | GIF di reazione rivolta a qualcuno |
| `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave`, `wink [text]` | | Nessuno | GIF di reazione su te stesso |

## Suggerimenti e insidie

- Questi comandi chiamano servizi esterni, quindi i risultati dipendono dal fatto che quei servizi siano attivi e che il proprietario del bot abbia le chiavi API corrette.
- `image` ha un limite di una ricerca ogni venti secondi per membro, e i risultati vengono filtrati per sicurezza anche nei canali NSFW.
- `randomreddit` rifiuta i subreddit contrassegnati come NSFW. Per i contenuti per adulti usa il modulo NSFW.
- La traduzione automatica è per canale e per membro: il canale deve essere attivato da un amministratore, e ogni membro sceglie la propria coppia.
- Le notifiche degli stream (`streamadd`, `streamlist`, `streamtemplate`) e i feed RSS (`feedadd`, `feedlist`) sono documentati a parte, anche se condividono questo modulo.

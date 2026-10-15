---
title: NSFW
slug: nsfw
summary: Comandi di immagini per adulti che funzionano solo nei canali contrassegnati come NSFW, con una lista nera di tag per server e pubblicazione automatica a intervalli.
icon: fa-eye-slash
category: Entertainment
module: Nsfw
tags: [nsfw, hentai, booru, rule34, e621, danbooru, gelbooru, nhentai, reddit, tag blacklist, autohentai, nsfwtoggle, contenuti per adulti, lista nera tag, pubblicazione automatica]
related: [servermanagement, permissions, filter]
---

## Cosa fa

Il modulo NSFW recupera immagini per adulti da siti di immagini e da Reddit su richiesta. Ogni comando del modulo ha il requisito NSFW di Discord: funziona solo in un canale con il flag NSFW attivo, e la maggior parte dei comandi dei siti di immagini funziona anche in un messaggio privato con il bot. In qualsiasi altro canale il comando viene ignorato in silenzio.

Lo staff controlla due cose. `nsfwtoggle` (nel modulo Administration) cambia il flag NSFW del canale corrente, che è ciò che sblocca questi comandi lì. `nsfwtagbl` mantiene una lista di tag che vengono rimossi da ogni ricerca sui siti di immagini in questo server, così un server può consentire il modulo escludendo i contenuti che non vuole.

I membri eseguono un comando sorgente con tag facoltativi e ricevono un'immagine con la sua classificazione, la fonte e i primi tag. Le varianti "bomb" ne pubblicano quattro in una volta. I moderatori possono anche avviare un timer che pubblica una nuova immagine in un canale ogni tot secondi.

## Perché usarlo

- Un server 18+ vuole limitare i comandi di immagini ai canali contrassegnati.
- Lo staff vuole bloccare certi tag per tutto il server senza disattivare il modulo.
- Un canale dedicato deve ricevere un'immagine nuova a intervalli senza che nessuno scriva nulla.

## Requisito del canale

Il flag NSFW di Discord è per canale. Esegui `nsfwtoggle` in un canale per attivarlo o disattivarlo; servono il permesso Gestisci canali per te e per il bot. Il bot risponde per confermare il nuovo stato. Lo stesso flag si può impostare dalle impostazioni del canale di Discord.

Se un comando viene usato in un canale non NSFW, non succede nulla. A volte i membri lo interpretano come un bot rotto, quindi una nota nel canale delle regole aiuta.

## Fonti

| Comando | Fonte | Note |
| --- | --- | --- |
| `hentai [tags]` | Siti combinati, solo esplicito | Cooldown di cinque secondi |
| `yandere`, `konachan`, `sankaku`, `e621`, `rule34`, `danbooru`, `gelbooru`, `derpibooru`, `safebooru`, `realbooru` | Il sito indicato | Ognuno accetta tag facoltativi |
| `hentaibomb [tags]` | Yandere, Danbooru, Konachan e Gelbooru | Quattro immagini in una volta |
| `pornbomb [tags]` | Realbooru | Quattro immagini in una volta |
| `redditnsfw <subreddit>` | Un post casuale tra i migliori di quel subreddit | Cooldown di dieci secondi |
| `boobs`, `butts` | Subreddit fissi tramite `redditnsfw` | |
| `pussy`, `anal`, `porn`, `bondage`, `hentaigif` | Endpoint per categoria | Solo canali NSFW, niente messaggi privati |
| `nhentai <id>` | Una galleria specifica per numero | Rifiuta le gallerie con tag lolicon o shotacon |
| `nhentaisearch <query> [page] [type] [blacklist]` | Ricerca di gallerie | |

I tag sono separati da spazi. Su e621 e Derpibooru il tag `yuri` viene tradotto automaticamente nell'equivalente di quel sito. Può girare un solo `hentaibomb` e un solo `pornbomb` alla volta per server.

## Lista nera dei tag

`nsfwtagbl` senza argomenti elenca i tag in lista nera. `nsfwtagbl <tag>` aggiunge il tag, oppure lo rimuove se è già nella lista. I risultati che contengono un tag in lista nera vengono saltati da ogni comando dei siti di immagini del server. Serve il permesso Gestisci messaggi.

## Pubblicazione automatica

`autohentai <seconds> [tags]`, `autoboobs <seconds>` e `autobutts <seconds>` avviano un timer nel canale corrente. L'intervallo deve essere di almeno 20 secondi per `autohentai` e `autobutts`; `autoboobs` non impone un minimo. Eseguire il comando con `0`, oppure senza intervallo, ferma il timer per quel canale. Per `autohentai`, separa gli insiemi alternativi di tag con `|` e il bot ne sceglierà uno a caso ogni volta; ometti i tag per immagini casuali. Questi comandi richiedono il permesso Gestisci messaggi e il canale deve essere NSFW. I timer non sopravvivono a un riavvio del bot.

## Impostazioni

Questo modulo non ha una pagina nella dashboard.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Flag NSFW del canale | disattivato | Se uno qualsiasi di questi comandi funziona in un canale |
| Lista nera dei tag | vuota | Tag esclusi dai risultati dei siti di immagini in questo server |
| Timer di pubblicazione automatica | nessuno | Timer per canale avviati con i comandi `auto...` |

## Procedura di configurazione

1. Scegli il canale ed esegui `nsfwtoggle` al suo interno, oppure imposta il flag dalle impostazioni del canale di Discord.
2. Usa Command Permissions per tenere il modulo fuori da tutti gli altri posti, per esempio `srvrmdl nsfw disable` seguito da `chnlmdl nsfw enable #adult`.
3. Aggiungi i tag che non vuoi con `nsfwtagbl <tag>`, uno per comando.
4. Prova con `hentai` o `rule34 <tag>` nel canale.
5. Facoltativamente avvia `autohentai 300 <tags>` e fermalo più tardi con `autohentai 0`.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Gestisci canali | Attiva o disattiva il flag NSFW del canale corrente |
| `nsfwtagbl [tag]` | `nsfwtbl` | Gestisci messaggi | Elenca, aggiungi o rimuovi un tag in lista nera |
| `hentai [tags]` | | Nessuno | Un'immagine esplicita dai siti combinati |
| `hentaibomb [tags]` | | Nessuno | Quattro immagini da quattro siti |
| `pornbomb [tags]` | | Nessuno | Quattro immagini da Realbooru |
| `yandere [tags]` | | Nessuno | Yande.re |
| `konachan [tags]` | | Nessuno | Konachan |
| `sankaku [tags]` | | Nessuno | Sankaku |
| `e621 [tags]` | | Nessuno | e621 |
| `rule34 [tags]` | `r34` | Nessuno | Rule34 |
| `danbooru [tags]` | | Nessuno | Danbooru |
| `gelbooru [tags]` | | Nessuno | Gelbooru |
| `derpibooru [tags]` | `derpi` | Nessuno | Derpibooru |
| `safebooru [tags]` | | Nessuno | Safebooru |
| `realbooru [tags]` | `rb` | Nessuno | Realbooru |
| `redditnsfw <subreddit>` | `nsfwsubreddit` | Nessuno | Post casuale da un subreddit |
| `boobs` | | Nessuno | Scorciatoia Reddit |
| `butts` | `ass`, `butt` | Nessuno | Scorciatoia Reddit |
| `pussy` | | Nessuno | Immagine di categoria |
| `anal` | | Nessuno | Immagine di categoria |
| `porn` | | Nessuno | Immagine di categoria |
| `bondage` | | Nessuno | Immagine di categoria |
| `hentaigif` | | Nessuno | GIF di categoria |
| `nhentai <id>` | `nh` | Nessuno | Sfoglia una galleria per numero |
| `nhentaisearch <query> [page] [type] [blacklist]` | `nhsearch`, `nhs` | Nessuno | Cerca gallerie |
| `autohentai [seconds] [tags]` | | Gestisci messaggi | Pubblicazione a intervalli; `0` ferma |
| `autoboobs [seconds]` | | Gestisci messaggi | Pubblicazione a intervalli; `0` ferma; nessun intervallo minimo |
| `autobutts [seconds]` | | Gestisci messaggi | Pubblicazione a intervalli; `0` ferma |

## Suggerimenti e avvertenze

- Il controllo dell'età è affidato al flag del canale di Discord più la lista nera di tag del bot. Il bot non controlla l'età o i ruoli dei membri; per questo usa Command Permissions.
- I proprietari del bot possono anche disattivare il modulo a livello globale, nel qual caso compare come bloccato nel menu di aiuto.
- I siti di immagini hanno limiti di frequenza e a volte non restituiscono nulla per combinazioni di tag troppo specifiche; il bot risponde che non è stata trovata alcuna immagine.
- I timer sono per canale e stanno in memoria. Dopo un riavvio, avviali di nuovo.

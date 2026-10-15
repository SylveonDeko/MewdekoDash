---
title: Avvisi streaming
slug: streams
summary: Segui streamer su Twitch, YouTube, Kick e Picarto e pubblica un annuncio nel canale che preferisci quando vanno in diretta o terminano lo stream.
icon: fa-video
category: Community
dashboard: /dashboard/streams
module: Searches
tags: [streams, stream alerts, go live, live notifications, twitch, youtube, kick, picarto, trovo, streamadd, streamtemplate, avvisi streaming, in diretta, notifiche live, modello stream]
related: [twitch, utility, administration]
---

## Cosa fa

Lo staff incolla l'URL di uno stream e sceglie un canale Discord. Il bot controlla poi la piattaforma di quello streamer e, quando lo stream passa da offline a online, pubblica un messaggio di avvio diretta nel canale scelto. Per impostazione predefinita si tratta di un embed con il nome dello streamer collegato allo stream, il titolo dello stream, il gioco o la categoria, il numero di spettatori, l'avatar dello streamer e un'immagine di anteprima.

Puoi sostituire l'embed predefinito con un messaggio personalizzato. Esiste un modello valido per tutto il server che si applica a ogni stream seguito, e ogni stream può anche avere un proprio messaggio di inizio diretta e un proprio messaggio di fine. Tutti accettano i segnaposto `%stream.*%` elencati qui sotto e possono essere testo semplice oppure un embed completo costruito nell'editor embed della dashboard.

Gli avvisi di fine diretta sono disattivati per impostazione predefinita. Se li attivi, il bot pubblica anche quando uno stream seguito termina, usando il messaggio di fine dello stream se è impostato, altrimenti il modello del server, altrimenti l'embed predefinito che mostra "Offline".

> [!NOTE]
> Avvisi streaming annuncia nel tuo Discord gli stream di altre persone. La funzione separata Twitch Bot collega il bot alla chat Twitch del tuo canale per comandi, timer ed eventi. Consulta l'articolo sul Twitch Bot per questo.

## Perché usarlo

- Un server della community vuole un canale "ora in diretta" che si attiva ogni volta che uno dei suoi creator inizia a streammare.
- Il Discord di uno streamer vuole una notifica automatica con titolo e categoria così nessuno deve pubblicarla a mano.
- Un server di esport o di eventi segue diversi canali di torneo su Twitch e Kick in un unico posto.
- Un server vuole un avviso pulito di "stream terminato" così che il post di inizio diretta non sembri vecchio.

## Piattaforme supportate

Il bot sceglie la piattaforma dall'URL che gli dai. Possono essere seguiti solo gli URL che corrispondono a uno di questi schemi.

| Piattaforma | Formato URL | Note |
| --- | --- | --- |
| Twitch | `twitch.tv/username` | Usa l'API Helix di Twitch. Titolo, gioco, spettatori, avatar e anteprima vengono tutti compilati. |
| YouTube | `youtube.com/@handle` oppure `youtube.com/channel/ID` | Letto analizzando la pagina live del canale, quindi i dati possono essere meno completi di Twitch. Un URL con ID canale viene convertito nell'handle. |
| Kick | `kick.com/slug` | Usa l'API pubblica di Kick. Il segnaposto dell'avatar viene compilato con l'immagine del banner del canale. |
| Picarto | `picarto.tv/name` | Usa l'API di Picarto. |

Trovo e Facebook compaiono nell'elenco delle piattaforme nella dashboard e nei dati salvati, ma nel codice attuale non esiste un riconoscitore funzionante di URL per Trovo né un provider per Facebook, quindi questi URL vengono rifiutati quando provi a seguirli.

## Come funziona il controllo

Il bot mantiene un tracker per piattaforma e chiede a ogni piattaforma lo stato di ogni canale seguito in un ciclo, con una pausa di tre secondi tra un giro e l'altro. Uno stream viene annunciato come online la prima volta che viene visto in diretta dopo essere stato offline.

La fine della diretta viene gestita con più cautela, perché Twitch a volte segnala una brevissima interruzione offline durante una diretta. Uno stream deve risultare offline in due controlli consecutivi prima che venga inviato l'avviso di fine. Se nel frattempo torna online, non viene pubblicato nulla.

Ogni trenta minuti il bot cerca gli stream le cui richieste di stato alla piattaforma falliscono da più di dodici ore, per esempio un canale eliminato o rinominato, e li rimuove da ogni server che li seguiva.

Se il canale di notifica di uno stream seguito è stato eliminato, lo stream viene scartato la prossima volta che qualcuno esegue `streamlist`.

## Il messaggio che invia

Quando uno stream cambia stato, il bot sceglie un messaggio in quest'ordine:

1. Il **Messaggio online** o l'**Messaggio offline** dello stream, a seconda del nuovo stato.
2. Il modello **Messaggio globale delle dirette** valido per tutto il server.
3. L'embed integrato.

Un messaggio per stream che non è JSON di embed valido viene pubblicato come testo semplice sopra l'embed integrato. Un modello globale che non è JSON di embed viene pubblicato come testo semplice da solo. I messaggi che sono JSON di embed validi, cioè quelli prodotti dall'embed builder della dashboard, vengono inviati esattamente come sono stati progettati, inclusi i pulsanti.

L'embed integrato ha il nome dello streamer come titolo collegato, il titolo dello stream come riga dell'autore, un campo **Stato** che mostra Online oppure Offline, un campo **Viewers**, un campo **In diretta** per il gioco o la categoria, l'avatar come miniatura e l'anteprima come immagine grande. È verde durante la diretta e rosso quando è offline.

### Segnaposto

In questi messaggi vengono sostituiti solo questi segnaposto. I segnaposto generali del server e dell'utente della pagina dei segnaposto non sono disponibili qui.

| Segnaposto | Valore |
| --- | --- |
| `%stream.name%` | Nome visualizzato dello streamer, oppure `Unknown` |
| `%stream.username%` | Nome di accesso o handle dello streamer |
| `%stream.url%` | Link diretto allo stream, sempre con `https://` |
| `%stream.title%` | Titolo attuale dello stream, oppure `No title` |
| `%stream.game%` | Gioco o categoria, oppure `No category` |
| `%stream.viewers%` | Numero di spettatori con separatori delle migliaia, oppure `-` quando è offline |
| `%stream.platform%` | Nome della piattaforma come `Twitch` o `Youtube` |
| `%stream.avatar%` | URL dell'avatar dello streamer |
| `%stream.preview%` | URL dell'anteprima o della miniatura dello stream |
| `%stream.status%` | `Online` oppure `Offline`, ciascuno preceduto da un cerchio colorato |
| `%stream.channelid%` | ID del canale specifico della piattaforma, dove la piattaforma lo fornisce |

> [!EXAMPLE]
> Un semplice modello globale: `%stream.name% is live on %stream.platform% playing %stream.game%: %stream.title% %stream.url%`

## Impostazioni

La pagina Notifiche streaming ha quattro schede: **Dirette**, **Segui diretta**, **Impostazioni** e **Statistiche**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Notification Channel | nessuno | Il canale dove vanno gli avvisi di un nuovo stream, scelto in **Segui diretta** |
| Stream URL | nessuno | Il link da seguire, in **Segui diretta** |
| Online Message | nessuno | Messaggio per stream quando va in diretta, modificato dalla scheda dello stream in **Dirette** |
| Offline Message | nessuno | Messaggio per stream quando termina, modificato dalla stessa scheda |
| Global Stream Message | nessuno | Modello valido per tutto il server, usato quando uno stream non ha un messaggio proprio, in **Impostazioni** |
| Offline Notifications | off | Se il bot pubblica quando gli stream seguiti vanno offline, in **Impostazioni** |

**Dirette** elenca ogni stream seguito con la sua piattaforma, il canale e la data in cui è stato aggiunto, con un pulsante di eliminazione su ogni scheda e un pulsante **Clear All**. **Statistiche** mostra stream totali, streamer unici, canali con notifiche, piattaforme in uso e una suddivisione per piattaforma.

Un server può seguire al massimo dieci stream. Aggiungerne un undicesimo non riesce.

## Guida alla configurazione

1. Apri **Avvisi stream** nella dashboard e vai alla scheda **Segui diretta**.
2. Scegli il **Canale delle notifiche**, incolla lo **URL della diretta** e clicca su **Segui diretta**.
3. In **Impostazioni**, costruisci un **Messaggio globale delle dirette** nell'editor embed usando i segnaposto sopra, poi clicca su **Salva messaggio**. Salta questo passaggio se vuoi mantenere l'embed integrato.
4. Attiva **Notifiche offline** se vuoi anche i post di "stream terminato".
5. Torna su **Dirette**, apri la scheda di uno stream per dargli un proprio **Messaggio online** o **Messaggio offline** se ha bisogno di qualcosa di diverso dal modello globale.
6. Prova con `streamcheck <url>` per verificare che il bot possa leggere lo stream, poi attendi la prossima diretta.

## Comandi

Esegui questi comandi con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `streamadd <url>` | `sta`, `stadd` | Gestisci messaggi | Segui uno stream e invia i suoi avvisi al canale corrente |
| `streamremove <index>` | `strm` | Gestisci messaggi | Smetti di seguire lo stream in quella posizione in `streamlist` |
| `streamsclear` | `stclear` | Amministratore | Smetti di seguire ogni stream del server |
| `streamlist` | `stl`, `streamslist` | Nessuno | Elenco paginato degli stream seguiti con i loro numeri, piattaforme e canali |
| `streamoffline` | `sto`, `stoff` | Gestisci messaggi | Attiva o disattiva gli avvisi di fine diretta |
| `streammessage <index> <message>` | `stm`, `stmsg` | Gestisci messaggi | Imposta il messaggio di inizio diretta di uno stream; un messaggio vuoto lo ripristina |
| `streamofflinemessage <index> <message>` | `stofmsg`, `stoffline` | Gestisci messaggi | Imposta il messaggio di fine diretta di uno stream; un messaggio vuoto lo ripristina |
| `streamtemplate [template]` | `stt`, `sttemplate` | Gestisci messaggi | Mostra il modello globale e i segnaposto, impostane uno nuovo, oppure `reset` per cancellarlo |
| `streamcheck <url>` | `stc` | Nessuno | Indica se uno stream è in diretta in questo momento e il numero di spettatori |

## Suggerimenti e insidie

- `streamadd` usa il canale in cui lo esegui. Usa la dashboard se vuoi scegliere un canale diverso.
- I numeri degli stream arrivano da `streamlist` e partono da 1. Cambiano quando uno stream viene rimosso, quindi controlla l'elenco prima di rimuovere per numero.
- Il bot ha bisogno dei permessi Invia messaggi e Inserisci link nel canale di notifica. Gli avvisi verso un canale che non riesce a vedere vengono saltati con una voce nel registro.
- Se nel tuo server è collegato il Twitch Bot con un canale di inizio diretta impostato per lo stesso canale Twitch, quell'integrazione prende il sopravvento e Avvisi streaming resta in silenzio per quello stream, così non ricevi due post.
- I dati di YouTube vengono analizzati invece di essere letti da un'API. Titoli, categorie e numero di spettatori possono mancare o essere letti come `Live Stream`.
- Gli stream le cui richieste continuano a fallire per dodici ore vengono rimossi automaticamente. Se uno streamer rinomina il suo canale, segui il nuovo URL.

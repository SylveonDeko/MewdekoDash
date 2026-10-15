---
title: Musica
slug: music
summary: Riproduci musica da YouTube, Spotify, SoundCloud e cerca in un canale vocale, con coda, playlist salvate, filtri audio, un ruolo DJ, sintesi vocale e scrobbling su Last.fm.
icon: fa-music
category: Entertainment
dashboard: /dashboard/music
module: Music
tags: [music, play, queue, playlist, spotify, youtube, soundcloud, volume, skip, loop, repeat, dj role, filters, bass boost, nightcore, tts, text to speech, lastfm, scrobble, music links, musica, riproduci, coda, salta, ciclo, ripeti, ruolo dj, filtri, sintesi vocale, link musicali]
related: [utility, administration]
---

## Cosa fa

Un membro entra in un canale vocale ed esegue `play` con un link o una ricerca. Il bot si unisce, mette in coda la traccia e inizia a riprodurla. I link di YouTube, YouTube Music, SoundCloud e Spotify vengono risolti direttamente; le tracce, gli album e le playlist di Spotify vengono associati a YouTube. Una ricerca semplice mostra fino a 25 risultati in un menu di selezione, così il membro sceglie quello che intendeva.

Tutti nel canale condividono una sola coda. I membri possono visualizzarla, saltare a un elemento, spostare o rimuovere tracce, mescolare, ripetere una traccia o l'intera coda, e salvare la coda come playlist con nome da caricare più tardi. Saltare una traccia è immediato per i membri con il ruolo DJ, oppure tramite voto per tutti gli altri.

Lo staff sceglie un canale musicale in cui vengono inviati gli avvisi di riproduzione in corso e di coda vuota, imposta il ruolo DJ, il volume predefinito e la modalità di ripetizione, e può attivare filtri audio come bass boost o nightcore. La dashboard mostra il lettore in tempo reale con una coda, pulsanti di ripetizione e interruttori dei filtri, e lo stesso flusso in tempo reale alimenta l'app mobile.

Nello stesso modulo ci sono due funzioni aggiuntive. La sintesi vocale legge ad alta voce i messaggi della chat in un canale vocale, con voci per utente e una lista di blocco. Last.fm permette ai membri di fare lo scrobbling di ciò che riproduce il bot ed eseguire comandi in stile `fm` sui propri ascolti.

## Perché usarlo

- Un canale vocale di ritrovo ha bisogno di musica di sottofondo a cui chiunque può aggiungere brani, senza che una sola persona faccia il DJ per tutta la notte.
- Lo staff vuole un ruolo DJ così solo i membri fidati possono saltare subito, mentre tutti gli altri votano.
- Una community mantiene alcune playlist della casa che vengono caricate all'inizio di ogni evento.
- In un canale vocale ci sono membri che non possono parlare e vogliono che i loro messaggi vengano letti ad alta voce.
- Gli appassionati di musica vogliono un posto condiviso dove confrontare le statistiche di Last.fm e le classifiche "chi conosce questo artista".

## Riproduzione e coda

Devi trovarti in un canale vocale per quasi tutti i comandi musicali. Se il bot sta già riproducendo in un canale diverso, i comandi provenienti da altri canali vengono rifiutati.

`play <link or search>` accetta:

| Input | Cosa succede |
| --- | --- |
| Link di YouTube o YouTube Music | Caricato direttamente, playlist incluse |
| Link di SoundCloud | Caricato direttamente |
| Link di una traccia Spotify | Associato a una traccia di YouTube |
| Link di un album o di una playlist Spotify | Ogni elemento viene associato a YouTube e messo in coda man mano che viene risolto, con un messaggio di avanzamento |
| Qualsiasi altra cosa | Cercato su YouTube, fino a 25 risultati in un menu di selezione |

`play <number>` salta a quella posizione della coda. `search <query>` elenca dieci risultati senza mettere nulla in coda. `queue` mostra una vista a pagine, cinque per pagina, con un menu di selezione per le opzioni di ogni traccia. `nowplaying` mostra la traccia attuale con chi l'ha richiesta e il fornitore.

`songremove <number>` rimuove un elemento, `movesong <from> <to>` riordina, `shuffle` mescola tutto ciò che viene dopo la traccia attuale, e `clearqueue` svuota la coda e interrompe la riproduzione. `seek mm:ss` salta a un punto della traccia attuale. `volume 0..100` imposta il volume e lo salva come predefinito del server.

`loop <type>` imposta la ripetizione: `none` (anche `off`), `track` (anche `song`) o `queue` (anche `all`). Quando la coda finisce con la ripetizione disattivata, il bot pubblica un avviso di coda vuota nel canale musicale.

### Salto e ruolo DJ

`skip` termina subito la traccia attuale per chi lo esegue. `voteskip` conta i voti: un membro con il ruolo DJ o con il permesso Amministratore salta subito, tutti gli altri aggiungono un voto, e la traccia viene saltata quando i voti raggiungono il 70 percento dei membri non bot nel canale vocale.

Imposta il ruolo DJ con `setdjrole @role` oppure con il selettore **Ruolo DJ** della dashboard. Esegui `setdjrole` senza ruolo per rimuoverlo.

### Riproduzione automatica

`autoplay <0..5>` fa sì che il bot aggiunga quel numero di tracce correlate quando la coda si svuota, usando i consigli di Spotify. 0 la disattiva. Questo dipende dal fatto che il bot abbia le credenziali di Spotify configurate; se mancano, la riproduzione automatica non fa nulla.

## Playlist

`saveplaylist <name>` salva la coda attuale con un nome, per server, con te come autore. `loadplaylist <name> [true]` aggiunge la playlist alla coda, oppure sostituisce la coda se passi `true`, e avvia la riproduzione se non sta suonando nulla. Le tracce vengono risolte di nuovo su YouTube al caricamento, quindi gli elementi che non esistono più vengono saltati silenziosamente. `playlists` le elenca con il numero di tracce e gli autori, e `deleteplaylist <name>` ne rimuove una.

## Filtri audio

I filtri si applicano al lettore in riproduzione e vengono azzerati quando si disconnette.

| Comando | Effetto |
| --- | --- |
| `bass <0..1>` | Amplifica le basse frequenze; 0 lo disattiva |
| `nightcore [on/off]` | Più veloce e con tono più acuto |
| `vaporwave [on/off]` | Più lento e con tono più grave |
| `karaoke [on/off]` | Attenua le voci al centro |
| `tremolo [on/off]` | Oscillazione del volume |
| `vibrato [on/off]` | Oscillazione del tono |
| `eightd [on/off]` | Fa ruotare il suono intorno all'ascoltatore |
| `distortion [on/off]` | Distorsione |
| `stereowiden [on/off]` | Allarga l'immagine stereo |

`activefilters` elenca i filtri attivi e `resetfilters` li disattiva tutti. La scheda **In riproduzione** della dashboard ha pulsanti per attivare bass boost, nightcore, vaporwave, karaoke, tremolo, vibrato, rotazione 8D e distorsione.

## Conversione dei link musicali

Nei canali in cui è attivata, quando viene pubblicato un link di Apple Music, Spotify, YouTube Music, YouTube, Amazon Music, Deezer, Tidal, Pandora o SoundCloud, il bot risponde con un embed che contiene titolo, artista e copertina della traccia, più i link alla stessa traccia sugli altri servizi. Attiva o disattiva un canale con `musiclinkchannel [#channel]` (Gestisci server) ed elencali con `musiclinkchannels`. Nella dashboard si trova nella sezione **Conversione link musicali** della scheda Impostazioni musica.

## Sintesi vocale

La sintesi vocale (TTS) legge i messaggi ad alta voce in un canale vocale in cui si trova il bot. Lo staff la attiva per canale vocale; i messaggi dei membri di quel canale vocale, scritti nella chat testuale del canale vocale o in un canale di testo collegato, vengono messi in coda e letti. La musica scende al 15 percento mentre una frase viene letta e poi torna al volume normale. La coda contiene 10 messaggi per impostazione predefinita.

I membri scelgono la propria voce con `ttsvoice <name>` e la sfogliano con `ttsvoices [search]`. Lo staff imposta una voce predefinita, la velocità (da 0,5 a 3,0 nella dashboard, da 0,5 a 2,0 con i comandi), il volume, un ruolo richiesto, gli annunci di ingresso e uscita con i propri formati, e può bloccare singoli utenti. La scheda **Impostazioni TTS** della dashboard ha gli stessi controlli, suddivisi in **Impostazioni TTS generali**, **Comportamento TTS**, **TTS canale vocale** e **Utenti TTS bloccati**.

## Last.fm

I membri collegano un account Last.fm dalla pagina `/me` della dashboard (`lastfmlink` pubblica il pulsante). Una volta collegato, le tracce riprodotte dal bot per almeno 30 secondi vengono registrate sul loro account; `lastfmtoggle` lo mette in pausa e `lastfmstatus` mostra lo stato. La famiglia di comandi `fm` funziona poi per chiunque abbia un account collegato: tracce recenti, artisti e album più ascoltati e tracce per periodo, ricerche di artisti e album, classifiche "chi conosce" del server, corone, confronto dei gusti e grafici a collage.

## Impostazioni

La pagina della dashboard ha due schede, **Impostazioni musica** e **Impostazioni TTS**. La scheda Musica mostra anche una card **In riproduzione** con la lunghezza della coda, i pulsanti di mescolamento e svuotamento, i pulsanti della modalità di ripetizione e gli interruttori dei filtri quando il bot sta riproducendo.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Volume predefinito | 100 | Volume iniziale, da 0 a 100; anche `volume` lo salva qui |
| Canale musicale | Tutti i canali | Dove vengono pubblicati gli avvisi di riproduzione e coda |
| Ruolo DJ | Nessun ruolo DJ | Ruolo che salta subito e aggira il voto per saltare |
| Modalità di ripetizione | Nessuna | Nessuna, Traccia singola o Coda |
| Disconnessione automatica | Mai | Mai, Quando il canale vocale è vuoto, Quando la coda è vuota o Una delle due condizioni |
| Riproduzione automatica simili | Disattivata | Aggiunge tracce correlate quando la coda si svuota; il comando consente un numero fino a 5 |
| Attiva voteskip | disattivato | Mostra la soglia del voto per saltare nel footer del lettore |
| Soglia voto per saltare | percentuale, da 1 a 100 | Valore mostrato; il comando `voteskip` richiede sempre il 70 percento |
| Canali dei link musicali | nessuno | Canali in cui i link musicali ricevono un embed tra più servizi |
| Volume TTS | 100 | Volume delle frasi lette |
| Velocità TTS | 1.0 | Da 0,5 a 3,0 |
| Dimensione massima coda | 10 | Messaggi TTS in attesa, da 1 a 50 |
| Voce predefinita | predefinita del fornitore | Voce usata quando un membro non ne ha scelta una |
| Ruolo richiesto | Nessun ruolo richiesto | Solo i membri con questo ruolo possono usare il TTS; gli admin possono sempre |
| Contesto della risposta | disattivato | Legge "in risposta a utente" prima delle risposte |
| Narrazione allegati | disattivata | Annuncia immagini, video e file inviati |
| Raggruppamento consecutivo | disattivato | Salta il nome quando lo stesso membro invia più messaggi di fila |
| TTS canale vocale | nessuno | Per canale vocale: attivo, canale di testo collegato, annunci di ingresso e uscita e relativi formati |
| Utenti TTS bloccati | nessuno | Membri i cui messaggi non vengono mai letti |

> [!NOTE]
> La modalità di ripetizione impostata nella dashboard si applica dal lettore successivo. `loop` modifica subito il lettore in riproduzione.

## Procedura di configurazione

1. Assicurati che il bot abbia i permessi Connetti e Parla nei canali vocali che vuoi usare.
2. Apri **Musica** nella dashboard. Imposta un **Canale musicale** così gli embed di riproduzione in corso non finiscono in chat generale.
3. Scegli un **Ruolo DJ** per le persone autorizzate a saltare liberamente.
4. Imposta **Volume predefinito** intorno a 50; 100 è molto alto.
5. Entra in un canale vocale ed esegui `play never gonna give you up`, scegli un risultato, poi `queue` e `nowplaying`.
6. Crea una playlist della casa mettendo in coda alcune tracce ed eseguendo `saveplaylist chill`.
7. Se vuoi il TTS, passa a **Impostazioni TTS**, aggiungi il canale vocale in **TTS canale vocale** e fai scegliere una voce ai membri con `ttsvoice`.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato).

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `join` | `j`, `mv` | Nessuno | Entra nel tuo canale vocale |
| `leave` | `disconnect`, `d` | Nessuno | Esce e svuota la coda |
| `play <link or search>` | `p`, `start` | Nessuno | Mette in coda e riproduce |
| `play <number>` | `p`, `start` | Nessuno | Salta a una posizione della coda |
| `search <query>` | `find` | Nessuno | Elenca dieci risultati senza riprodurre |
| `pause` | | Nessuno | Mette in pausa o riprende |
| `nowplaying` | `np` | Nessuno | Mostra la traccia attuale |
| `queue` | `q`, `yq`, `enqueue` | Nessuno | Mostra la coda |
| `skip` | `next`, `n` | Nessuno | Salta la traccia attuale |
| `voteskip` | `vskip` | Nessuno | Vota per saltare, immediato con il ruolo DJ |
| `songremove <number>` | `trackremove`, `srm` | Nessuno | Rimuove un elemento della coda |
| `movesong <from> <to>` | `ms`, `move` | Nessuno | Riordina la coda |
| `shuffle` | `playlistshuffle`, `sh`, `plsh` | Nessuno | Mescola le tracce successive |
| `clearqueue` | `cq` | Nessuno | Svuota la coda e interrompe |
| `volume <0..100>` | `vol` | Nessuno | Imposta e salva il volume |
| `seek <mm:ss>` | | Nessuno | Salta a un punto della traccia attuale |
| `loop <none|track|queue>` | `queuerepeat`, `qrp`, `rpl` | Nessuno | Imposta la modalità di ripetizione |
| `autoplay <0..5>` | `ap` | Nessuno | Tracce correlate quando la coda si svuota |
| `setdjrole [role]` | `djrole` | Gestisci server | Imposta o rimuove il ruolo DJ |
| `setmusicchannel [#channel]` | `smch` | Nessuno | Dove vanno gli avvisi del lettore |
| `musicsettings` | `msettings` | Nessuno | Mostra riproduzione automatica, volume, ripetizione e canale |
| `musiclinkchannel [#channel]` | | Gestisci server | Attiva o disattiva la conversione dei link in un canale |
| `musiclinkchannels` | | Nessuno | Elenca i canali di conversione dei link |
| `saveplaylist <name>` | `saveplist` | Nessuno | Salva la coda |
| `loadplaylist <name> [clear]` | `loadplist` | Nessuno | Carica una playlist, `true` per sostituire la coda |
| `playlists` | `playlistshow`, `plshow` | Nessuno | Elenca le playlist salvate |
| `deleteplaylist <name>` | `delplist` | Nessuno | Elimina una playlist |
| `bass [0..1]` | | Nessuno | Bass boost |
| `nightcore [on/off]` | `nc` | Nessuno | Filtro nightcore |
| `vaporwave [on/off]` | `vw` | Nessuno | Filtro vaporwave |
| `karaoke [on/off]` | | Nessuno | Filtro karaoke |
| `tremolo [on/off]` | | Nessuno | Filtro tremolo |
| `vibrato [on/off]` | | Nessuno | Filtro vibrato |
| `eightd [on/off]` | `8d` | Nessuno | Filtro rotazione 8D |
| `distortion [on/off]` | | Nessuno | Filtro distorsione |
| `stereowiden [on/off]` | `swiden` | Nessuno | Allargamento stereo |
| `resetfilters` | `resetfx` | Nessuno | Disattiva tutti i filtri |
| `activefilters` | `activefx` | Nessuno | Elenca i filtri attivi |
| `lastfmlink` | `lflink` | Nessuno | Ottieni il pulsante di collegamento a Last.fm |
| `lastfmunlink` | `lfunlink` | Nessuno | Rimuove il tuo collegamento a Last.fm |
| `lastfmtoggle` | `lftoggle` | Nessuno | Mette in pausa o riprende lo scrobbling |
| `lastfmstatus` | `lfstatus` | Nessuno | Mostra lo stato del tuo collegamento a Last.fm |
| `fm [user]` | | Nessuno | In riproduzione o ultimo scrobble |
| `fmrecent [user]` | `fmr` | Nessuno | Scrobble recenti |
| `fmtopartists [period] [user]` | `fmta` | Nessuno | Artisti più ascoltati |
| `fmtopalbums [period] [user]` | `fmtal` | Nessuno | Album più ascoltati |
| `fmtoptracks [period] [user]` | `fmtt` | Nessuno | Tracce più ascoltate |
| `fmartist [artist]` | `fma` | Nessuno | Info sull'artista e i tuoi ascolti |
| `fmalbum [query]` | `fmal` | Nessuno | Info sull'album |
| `fmwhoknows [artist]` | `whoknows`, `wk` | Nessuno | Classifica del server per un artista |
| `fmwhoknowsalbum <query>` | `whoknowsalbum`, `wka` | Nessuno | Classifica del server per un album |
| `fmwhoknowstrack <query>` | `whoknowstrack`, `wkt` | Nessuno | Classifica del server per una traccia |
| `fmcrowns [artist]` | `crowns` | Nessuno | Corone per artista |
| `fmtaste <user>` | `taste` | Nessuno | Confronta i gusti con qualcuno |
| `fmchart [size] [period] [user]` | `chart` | Nessuno | Collage di copertine di album |
| `ttsenable` | `tts`, `ttson` | Gestisci server | Attiva il TTS nel tuo canale vocale |
| `ttsremove` | `ttsoff` | Gestisci server | Disattiva il TTS nel tuo canale vocale |
| `ttslink [#channel]` | `ttschannel` | Gestisci server | Collega un canale di testo al canale vocale |
| `ttsannounce` | `ttsjoinleave` | Gestisci server | Attiva o disattiva gli annunci di ingresso e uscita |
| `ttsjoinformat [text]` | `ttsjoin` | Gestisci server | Testo dell'annuncio di ingresso |
| `ttsleaveformat [text]` | `ttsleave` | Gestisci server | Testo dell'annuncio di uscita |
| `ttsvolume <0..100>` | `ttsvol` | Gestisci server | Volume del TTS |
| `ttsspeed <0.5..2>` | | Gestisci server | Velocità del TTS |
| `ttsdefaultvoice [voice]` | `ttsdefvoice` | Gestisci server | Voce predefinita del server |
| `ttsvoice [voice]` | | Nessuno | La tua voce |
| `ttsvoices [search]` | `ttsvoicelist`, `ttsvoicesearch` | Nessuno | Sfoglia le voci |
| `ttsblock <user>` | `ttsban` | Gestisci server | Attiva o disattiva il blocco TTS di un membro |
| `ttsblocklist` | `ttsbanlist`, `ttsblocked` | Gestisci server | Elenca i membri bloccati |
| `ttsrole [role]` | | Gestisci server | Richiede un ruolo per il TTS |
| `ttsreplycontext` | `ttsreply` | Gestisci server | Attiva o disattiva il contesto della risposta |
| `ttsattachmentnarration` | `ttsattach` | Gestisci server | Attiva o disattiva la narrazione degli allegati |
| `ttsconsecutivegrouping` | `ttsgroup` | Gestisci server | Attiva o disattiva il salto del nome per messaggi consecutivi |
| `ttsmaxqueue <1..50>` | `ttsqueue` | Gestisci server | Limite dei messaggi TTS in attesa |
| `ttssettings` | `ttsinfo` | Gestisci server | Mostra le impostazioni TTS |

## Suggerimenti e insidie

- Il bot ha bisogno dei permessi Connetti e Parla nel canale vocale, e Invia messaggi nel canale musicale per gli avvisi.
- La maggior parte dei comandi verifica prima che tu sia in un canale vocale, e che sia quello in cui si trova il bot.
- Il volume impostato con `volume` viene salvato come predefinito del server, quindi un 10 notturno diventa il volume iniziale del giorno dopo.
- Le playlist di Spotify vengono convertite traccia per traccia tramite ricerca su YouTube, quindi le playlist lunghe richiedono tempo e alcune corrispondenze potrebbero essere sbagliate.
- Le playlist salvate memorizzano link, non audio. Se un video viene rimosso da YouTube, l'elemento viene saltato al caricamento.
- Il voto per saltare conta solo le persone nel canale. In un canale con una sola persona, il tuo voto basta.
- Il TTS legge solo i messaggi dei membri presenti nel canale vocale, quindi chi guarda dalla chat testuale non può attivarlo.

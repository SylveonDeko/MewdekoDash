---
title: Saluti
slug: multigreets
summary: Pubblica messaggi di benvenuto in fino a trenta canali quando qualcuno entra, più i classici saluti di addio, boost e messaggi privati di benvenuto.
icon: fa-bell
category: Actions
dashboard: /dashboard/multigreets
module: MultiGreets
tags: [greets, multigreets, welcome, join message, goodbye, bye, leave message, boost message, greet dm, webhook, placeholders, saluti, benvenuto, messaggio di ingresso, addio, messaggio di uscita, messaggio di boost, saluto privato, webhook, segnaposto]
related: [rolegreets, invites, administration]
---

## Cosa fa

Quando un membro entra, il bot pubblica un saluto in ogni canale che hai configurato come saluto. Ogni saluto ha il suo messaggio, il suo timer di eliminazione, la sua identità webhook e il suo interruttore per i bot. Puoi eseguirli tutti insieme oppure sceglierne uno a caso per ogni ingresso.

I messaggi passano dal parser degli embed, quindi un saluto può essere testo semplice, un embed completo con pulsanti oppure un post webhook con un nome e un avatar personalizzati. I segnaposto riempiono il nome del membro, il nome del server, il numero di membri e, se il tracciamento degli inviti è attivo, chi lo ha invitato.

Il vecchio sistema a messaggio singolo esiste ancora accanto a questo. Gestisce il messaggio di addio quando qualcuno esce, l'annuncio di boost quando qualcuno potenzia il server e un messaggio privato di benvenuto. Questi si trovano nel modulo Amministrazione e sono descritti più avanti.

## Perché usarlo

- Un benvenuto pubblico in `#general` e una riga di log discreta in `#staff-joins` per lo stesso ingresso.
- Stili di saluto diversi per canale, per esempio un embed in uno e un "personaggio" webhook in un altro.
- Un insieme di saluti da cui ogni nuovo membro ne riceve uno scelto a caso.
- Un breve benvenuto che si elimina da solo dopo un minuto, così il canale non si riempie.
- Un messaggio di addio o di boost senza configurare nient'altro.

## Tipi di saluto

Il **Tipo di saluto** vale per tutto il server e decide cosa succede all'ingresso di un membro.

| Tipo | Etichetta nella dashboard | Cosa succede |
| --- | --- | --- |
| MultiGreet | Tutti i saluti | Ogni saluto attivo viene inviato, nell'ordine in cui sono stati aggiunti. Predefinito. |
| RandomGreet | Saluto casuale | Dalla lista viene scelto un saluto a caso e viene inviato. I saluti disattivati possono essere scelti e poi saltati. |
| Off | Disattivato | Nessun saluto viene inviato. |

## Cosa contiene un saluto

Ogni saluto è legato a un canale. Un canale può contenere fino a cinque saluti, e un server può averne trenta in totale. I saluti sono numerati in base alla posizione nell'elenco, e quel numero è quello che usano i comandi.

| Campo | Predefinito | Significato |
| --- | --- | --- |
| Canale | il canale che hai aggiunto | Dove viene pubblicato questo saluto |
| Messaggio | vuoto | Modello di testo o embed. Un saluto vuoto non invia nulla. |
| Elimina dopo | 0 (mai) | Secondi prima che il saluto si elimini da solo |
| Saluta i bot | disattivato | Se il saluto viene inviato quando entra un account bot |
| Webhook | nessuno | Pubblica tramite un webhook con un nome e un avatar personalizzati invece che come bot |
| Attivo | attivo | I saluti disattivati vengono saltati senza essere rimossi |

Se il canale viene eliminato, il saluto viene rimosso la prossima volta che proverebbe a inviarsi. Se un webhook viene eliminato o il bot perde il permesso di pubblicare, il saluto viene disattivato invece di generare errori a ogni ingresso.

## Segnaposto

I saluti si costruiscono con i set di segnaposto per utente, server e bot. I segnaposto degli invitanti funzionano solo quando il tracciamento degli inviti è attivo nella pagina Inviti.

| Segnaposto | Valore |
| --- | --- |
| `%user%`, `%user.mention%` | Menzione del nuovo membro |
| `%user.name%`, `%username%` | Nome utente |
| `%user.fullname%`, `%userfull%` | Tag completo |
| `%user.id%`, `%id%` | ID utente |
| `%user.avatar%`, `%useravatar%` | URL dell'avatar |
| `%user.banner%` | URL del banner |
| `%user.created_date%`, `%user.created_time%` | Quando è stato creato l'account |
| `%user.joined_date%`, `%user.joined_time%` | Quando è entrato in questo server |
| `%server%`, `%server.name%` | Nome del server |
| `%server.id%`, `%sid%` | ID del server |
| `%server.icon%`, `%server.banner%` | URL dell'icona e del banner |
| `%server.members%`, `%members%` | Numero di membri |
| `%server.boostlevel%`, `%server.boostcount%` | Livello di boost e numero di boost |
| `%server.time%`, `%server.timestamp.longdatetime%` | Ora attuale, semplice oppure come timestamp di Discord |
| `%bot.name%`, `%bot.id%`, `%bot.avatar%` | Informazioni sul bot stesso |
| `%inviter.username%`, `%inviter.mention%`, `%inviter.id%`, `%inviter.avatar%` | La persona il cui invito è stato usato, oppure `Unknown` |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | Il conteggio degli inviti di chi ha invitato |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%` | L'invito usato, la sua etichetta e se era un invito, il link personalizzato o un'app |
| `%user.joincount%`, `%user.leavecount%` | Quante volte questo membro è entrato e uscito |
| `%server.members.ordinal%` | Numero di membri come 1°, 2°, 1.204° |
| `%user.joined.R%`, `%user.created.F%` (e gli stili t, T, d, D, f) | Orario di ingresso e di creazione dell'account come timestamp di Discord |

> [!EXAMPLE]
> `Welcome %user.mention% to %server%! You are member #%server.members%.`

L'elenco completo dei segnaposto di server, canale e bot si trova nella pagina dei segnaposto. I segnaposto di canale non vengono compilati per i saluti.

## I comandi classici di saluto, addio e boost

Questi sono precedenti ai saluti multipli e si trovano nel modulo Amministrazione. Ognuno è un singolo messaggio, salvato nella configurazione del server e attivato dal canale in cui esegui il comando.

| Messaggio | Viene inviato quando | Segnaposto |
| --- | --- | --- |
| Addio | Un membro esce | Set utente, server e bot, più i segnaposto di canale. `%user%` menziona il membro uscito. |
| Boost | Un membro inizia a potenziare il server, oppure lo potenzia di nuovo | Set utente, canale, server, bot e gif |
| Saluto privato | Un membro entra, inviato come messaggio privato | Set utente, canale, server, bot e gif |

Eseguire `bye` o `boost` attiva o disattiva quel messaggio e imposta il canale su quello in cui hai scritto il comando. `byedel` e `boostdel` impostano un timer di autoeliminazione in secondi; `boostdel` ha un limite di 600. I comandi dei messaggi senza testo mostrano il messaggio attuale. `leavehook` inserisce il messaggio di addio in un webhook con un nome e un avatar personalizzati, e `leavehook disable` lo rimuove.

I messaggi privati di benvenuto richiedono attenzione. Il bot ti chiede conferma prima di attivarli, a meno che non sia un bot verificato, perché gli invii privati di massa da bot non verificati possono far segnalare il bot. Ogni membro può bloccare questi messaggi per sé con `greetdmoptout`, oppure con l'interruttore **Messaggi di benvenuto** nella propria pagina profilo della dashboard.

Non esiste un comando classico di saluto nel canale. Per i benvenuti nei canali usa un saluto multiplo.

## Impostazioni

Tutto si trova nella pagina Saluti della dashboard.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Tipo di saluto | Tutti i saluti | Tutti i saluti, Saluto casuale oppure Disattivato |
| Aggiungi nuovo saluto | | Scegli un canale, poi clicca **Aggiungi saluto** |
| Messaggio di saluto | vuoto | Il creatore di embed per un singolo saluto. Supporta contenuto, fino a dieci embed e componenti. |
| Elimina dopo | Mai | Inserisci un tempo come `1m30s` o `45s` |
| Webhook | Non configurato | Nome del webhook e URL facoltativo dell'avatar |
| Saluta i bot | disattivato | Invia anche per gli account bot |
| Attivo | attivo | Disattiva un saluto senza eliminarlo |

I messaggi di addio, boost e i messaggi privati di benvenuto non si trovano in questa pagina. Impostali con i comandi qui sopra.

## Guida alla configurazione

1. Apri **Saluti** nella dashboard e lascia **Tipo di saluto** su **Tutti i saluti**.
2. In **Aggiungi nuovo saluto**, scegli il canale di benvenuto e clicca **Aggiungi saluto**.
3. Sulla nuova scheda, apri **Messaggio di saluto** e costruisci il tuo messaggio usando i segnaposto sopra. Salva.
4. Facoltativamente imposta **Elimina dopo**, aggiungi un nome e un avatar per il **Webhook** e attiva **Saluta i bot** se vuoi annunciare gli ingressi dei bot.
5. Ripeti per gli altri canali. Passa a **Saluto casuale** se ne hai aggiunti diversi allo stesso canale e vuoi varietà.
6. Per un messaggio di addio, esegui `byemsg Goodbye %user%, we will miss you` nel canale che preferisci, poi `bye` per attivarlo.
7. Per un messaggio di boost, esegui `boostmsg Thanks for boosting, %user%!` e poi `boost`.
8. Prova con `byetest` e `boosttest`. I saluti multipli hanno un'anteprima: esegui `multigreetmessage 1` e premi **Anteprima**.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). I comandi dei saluti multipli sono disponibili anche come `/multigreets add`, `/multigreets remove` e così via.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `multigreetadd [#channel]` | `mgadd`, `mga` | Amministratore | Aggiunge un saluto per un canale, per default quello attuale |
| `multigreetremove <number or #channel>` | `mgrem`, `mgrm`, `mgr` | Amministratore | Rimuove un saluto per numero, oppure tutti i saluti di un canale dopo conferma |
| `multigreetmessage <number> [message]` | `mgmsg`, `mgm` | Amministratore | Imposta il testo o l'embed del saluto; senza messaggio, propone un'anteprima o il modello grezzo |
| `multigreetdelete <number> <time or seconds>` | `mgdel`, `mgd` | Amministratore | Timer di autoeliminazione, per esempio `1m` o `60`; `0` lo disattiva |
| `multigreetdisable <number> <true or false>` | `mgdisable`, `mgdis` | Amministratore | `true` disattiva il saluto, `false` lo attiva |
| `multigreetgreetbots <number> <true or false>` | `multigreetbots`, `mggb` | Amministratore | Se questo saluto viene inviato per i bot |
| `multigreetwebhook <number> [name] [avatar url]` | `mgwebhook`, `mghook`, `mgh` | Amministratore | Crea un webhook per il saluto; senza nome lo rimuove |
| `multigreettype <multigreet, randomgreet or off>` | `mgtype`, `mgt` | Amministratore | Cambia il tipo di saluto per tutto il server |
| `multigreetlist` | `mglist`, `mgl` | Amministratore | Sfoglia ogni saluto con le sue impostazioni |
| `bye` | | Gestisci server | Attiva o disattiva il messaggio di addio in questo canale |
| `byemsg [text]` | | Gestisci server | Mostra o imposta il messaggio di addio |
| `byedel [seconds]` | | Gestisci server | Timer di autoeliminazione dell'addio, predefinito 30 |
| `byetest [@user]` | | Gestisci server | Invia il messaggio di addio come prova |
| `leavehook [#channel] [name] [image url] [text]` | `byehook` | Gestisci server | Invia gli addii tramite un webhook, oppure `leavehook disable` |
| `boost` | | Gestisci server | Attiva o disattiva il messaggio di boost in questo canale |
| `boostmsg [text]` | `boostmessage` | Gestisci server | Mostra o imposta il messaggio di boost |
| `boostdel [seconds]` | `boostdelete` | Gestisci server | Timer di autoeliminazione del boost, da 0 a 600, predefinito 30 |
| `boosttest [@user]` | `testboost` | Gestisci server | Invia il messaggio di boost come prova |
| `greetdm` | | Gestisci server | Attiva o disattiva il messaggio privato di benvenuto |
| `greetdmmsg [text]` | | Gestisci server | Mostra o imposta il testo del messaggio privato di benvenuto |
| `greetdmtest [@user]` | | Gestisci server | Invia il messaggio privato di benvenuto come prova |
| `greetdmoptout` | `gdmoptout` | Nessuno | Smetti di ricevere messaggi privati di benvenuto da questo bot ovunque |

## Suggerimenti e trappole

- `multigreetdelete` richiede che il bot abbia Gestisci messaggi, mentre `multigreetwebhook` e `leavehook` richiedono Gestisci webhook.
- I numeri dei saluti sono posizioni nell'elenco, quindi rimuoverne uno sposta i numeri di tutti quelli successivi. Esegui `multigreetlist` prima di modificare.
- L'opzione `off` di `multigreettype`, `/multigreets type` e il pulsante **Disattivato** della dashboard impostano tutti lo stesso tipo di saluto, quindi ognuno di essi spegne il sistema senza eliminare i tuoi saluti.
- I segnaposto degli inviti attendono fino a cinque secondi che l'ingresso venga attribuito prima di inviare il saluto, così l'invitante è corretto anche quando più persone entrano insieme.
- Il messaggio privato di benvenuto funziona solo se il membro consente i messaggi privati dai membri del server. I messaggi privati non riusciti vengono ignorati.
- I Saluti dei ruoli sono una funzione separata che si attiva quando un ruolo viene assegnato, non all'ingresso.

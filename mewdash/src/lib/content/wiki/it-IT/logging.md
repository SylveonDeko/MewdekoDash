---
title: Log
slug: logging
summary: Invia una registrazione di ingressi, uscite, modifiche, eliminazioni, ban, cambi di ruolo e di canale e altro ancora ai canali di log che scegli, con instradamento per evento ed esclusione di canali.
icon: fa-file
category: Security
dashboard: /dashboard/logging
module: Administration
tags: [logging, logs, audit, events, message deleted, message edited, join leave, mod log, ignored channels, log, registro, eventi, messaggio eliminato, messaggio modificato, ingresso uscita, log moderazione, canali ignorati]
related: [moderation, administration, filter]
---

## Cosa fa

Il sistema di log osserva gli eventi che Discord invia al bot e pubblica un riepilogo di ciascuno in un canale di testo che scegli. Un messaggio eliminato mostra chi lo ha scritto e che cosa diceva. L'ingresso di un membro mostra l'età del suo account. Un cambio di ruolo mostra quali ruoli sono stati aggiunti o rimossi. Dove il bot può leggere il registro di audit, indica anche il membro dello staff che ha fatto l'azione.

Ogni tipo di evento ha la propria impostazione di canale, quindi puoi inviare le modifiche dei messaggi a un canale, le azioni di moderazione a un altro e lasciare disattivati gli altri. Non viene registrato nulla finché non assegni un canale, e un tipo di evento senza canale viene saltato in silenzio.

I canali possono anche essere esclusi. Un canale ignorato non produce alcun log di messaggi, thread o voce, il che tiene fuori dalla registrazione le sale dello staff e i canali di spam del bot.

## Perché usarlo

- Conservare una copia dei messaggi eliminati e modificati, così i moderatori possono vedere che cosa è stato rimosso a posteriori.
- Tenere traccia di chi è entrato e uscito, incluse le date di creazione degli account, per individuare raid e account secondari.
- Registrare ban, revoche di ban e silenziamenti con il moderatore responsabile, per la responsabilità.
- Controllare cambi di ruoli, canali e permessi fatti da altri admin o da account compromessi.
- Seguire l'attività vocale nei server in cui i canali vocali sono il ritrovo principale.

## Tipi di evento

Ogni tipo può puntare a un canale diverso oppure essere lasciato disattivato. Questi sono i valori accettati da `log` e mostrati nella dashboard.

| Tipo | Etichetta nella dashboard | Registrato quando |
| --- | --- | --- |
| `MessageUpdated` | Message Updated | Il contenuto di un messaggio viene modificato (gli autori bot e i contenuti invariati vengono saltati) |
| `MessageDeleted` | Message Deleted | Un messaggio viene eliminato |
| `MessagesBulkDeleted` | Messages Bulk Deleted | Più messaggi vengono eliminati insieme, con il numero di quelli presenti in cache |
| `ReactionEvents` | Reaction Events | Le reazioni vengono aggiunte o rimosse, raggruppate per messaggio ogni cinque secondi |
| `ThreadCreated` | Thread Created | Viene creato un thread |
| `ThreadDeleted` | Thread Deleted | Viene eliminato un thread |
| `ThreadUpdated` | Thread Updated | Cambiano il nome di un thread, lo stato di archiviazione o simili |
| `UsernameUpdated` | Username Updated | Cambia il nome utente globale di un membro |
| `NicknameUpdated` | Nickname Updated | Cambia il soprannome sul server di un membro |
| `UserUpdated` | User Updated | Cambiano il profilo di un membro, come l'avatar o il nome globale |
| `UserJoined` | User Joined | Un membro entra nel server |
| `UserLeft` | User Left | Un membro esce oppure viene espulso |
| `UserRoleAdded` | User Role Added | Uno o più ruoli vengono assegnati a un membro |
| `UserRoleRemoved` | User Role Removed | Uno o più ruoli vengono tolti a un membro |
| `UserBanned` | User Banned | Un membro viene bandito |
| `UserUnbanned` | User Unbanned | Un ban viene revocato |
| `UserMuted` | User Muted | Un membro viene silenziato in voce o in chat |
| `VoicePresence` | Voice Presence | Un membro entra, esce, si sposta, si silenzia, si ammutisce o trasmette in voce |
| `VoicePresenceTts` | Voice Presence TTS | Un membro potrebbe aver usato il text to speech in voce; il rilevamento è indicativo |
| `ServerUpdated` | Server Updated | Cambiano impostazioni del server come nome, icona o proprietario |
| `EventCreated` | Event Created | Viene creato un evento programmato del server |
| `InviteCreated` | Invite Created | Viene creato un invito, con la sua durata massima e gli utilizzi |
| `InviteDeleted` | Invite Deleted | Viene eliminato un invito |
| `RoleCreated` | Role Created | Viene creato un ruolo |
| `RoleDeleted` | Role Deleted | Viene eliminato un ruolo |
| `RoleUpdated` | Role Updated | Cambiano nome, colore o permessi di un ruolo |
| `ChannelCreated` | Channel Created | Viene creato un canale |
| `ChannelDestroyed` | Channel Destroyed | Viene eliminato un canale |
| `ChannelUpdated` | Channel Updated | Cambiano nome, argomento o permessi di un canale |
| `Other` | Other | Eventi vari non trattati sopra |

La dashboard mostra anche una voce **Avatar aggiornato**. Viene memorizzata insieme alle altre ed è impostata dalle categorie Users e All, ma non è un valore che puoi passare al comando `log`.

## Categorie

`logcategory` imposta un intero gruppo di tipi su un solo canale in un unico passaggio. Se lo esegui senza canale, cancella tutti i tipi di quel gruppo.

| Categoria | Tipi che imposta |
| --- | --- |
| `All` | Ogni tipo sopra |
| `Users` | NicknameUpdated, AvatarUpdated, UsernameUpdated, UserRoleAdded, UserRoleRemoved, VoicePresence, UserJoined, UserLeft, UserUpdated |
| `Threads` | ThreadCreated, ThreadDeleted, ThreadUpdated |
| `Roles` | RoleCreated, RoleDeleted, RoleUpdated |
| `Server` | ServerUpdated, EventCreated, InviteCreated, InviteDeleted |
| `Channel` | ChannelCreated, ChannelDestroyed, ChannelUpdated |
| `Messages` | MessageDeleted, MessageUpdated, MessagesBulkDeleted, ReactionEvents |
| `Moderation` | UserMuted, UserBanned, UserUnbanned, Other |
| `None` | Cancella ogni tipo (usato dal pulsante **Disattiva tutto** della dashboard) |

## Canali ignorati

Ogni canale presente nella lista degli ignorati viene saltato per gli eventi di messaggi, thread, canali e voce che avvengono al suo interno. I thread ereditano l'impostazione dal canale genitore, quindi ignorare un forum o un canale di testo ignora anche i suoi thread. Ignorare un canale vocale sopprime i log di presenza vocale per gli ingressi in quel canale e le uscite da esso.

Ignorare un canale non blocca gli eventi di membri, ruoli o server, perché non sono legati a un canale.

## Impostazioni

La pagina Log ha due schede, **Canali di log** e **Ignored Channels**.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Log Channels | nessuno | Un selettore di canale per ogni tipo di evento, raggruppati in Popular, Users, Messages, Moderation, Server, Channels, Roles, Threads, Voice e All Events |
| Clear Category | | Svuota ogni selettore del gruppo che stai visualizzando; ha effetto quando salvi con **Salva configurazione** |
| Clear All | | Mostrato nel gruppo **Tutti gli eventi**; svuota ogni selettore, applicato al salvataggio |
| Disable All | | Pulsante nell'intestazione mostrato finché è impostato un canale; rimuove l'assegnazione di ogni tipo di evento subito dopo la conferma, mantenendo i canali ignorati |
| Ignored Channels | nessuno | Canali esclusi dal log, spostati tra le liste **Active Channels** e **Ignored Channels** |

> [!TIP]
> Il gruppo **Popolari** contiene User Joined, User Left, Message Deleted, Message Updated, User Banned, User Unbanned, Channel Created e Channel Destroyed. È un buon insieme di partenza per la maggior parte dei server.

## Procedura di configurazione

1. Crea uno o più canali di log privati, leggibili solo dallo staff.
2. Apri **Logging** nella dashboard e resta nella scheda **Canali di log**.
3. Nel gruppo **Popolari**, scegli il canale di log per ogni evento che ti interessa, poi salva.
4. Passa ad altri gruppi come **Moderazione** o **Vocale** e assegna canali a tutto ciò che ti serve.
5. Apri la scheda **Ignored Channels** e sposta le sale dello staff e i canali dei comandi del bot nella lista degli ignorati.
6. Elimina un messaggio di prova e verifica che il log compaia nel canale giusto.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Le versioni slash si trovano sotto `/log`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `log <type> [#channel]` | | Administrator | Invia un tipo di evento a un canale; senza canale viene usato quello corrente |
| `log #channel [types...]` | | Administrator | Invia più tipi a un canale, oppure apre un menu a selezione di tutti i tipi se non ne indichi nessuno |
| `log "#channel:Type1,Type2" ...` | | Administrator | Imposta più coppie canale-tipo in un solo messaggio |
| `logcategory <category> [#channel]` | `logcat` | Administrator | Assegna un'intera categoria a un canale, oppure la svuota senza canale |
| `logevents` | | Administrator | Elenca ogni tipo di evento e il canale che usa attualmente |
| `logignore [#channel]` | `lignore` | Administrator | Attiva o disattiva un canale nella lista degli ignorati; per impostazione predefinita il canale corrente |
| `logignorelist` | `lignorel` | Administrator | Mostra la lista degli ignorati |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrator | Registra l'uso dei comandi del bot in un canale, oppure lo disattiva senza canale |

> [!EXAMPLE]
> `log "#mod-logs:UserBanned,UserUnbanned,UserMuted" "#message-logs:MessageDeleted,MessageUpdated"`

## Consigli e insidie

- Concedi al bot il permesso **Visualizza registro di controllo**. Senza, i log vengono comunque pubblicati ma non possono indicare quale moderatore ha eliminato un messaggio, bandito qualcuno o cambiato un ruolo.
- Il bot deve poter vedere e inviare messaggi in ogni canale di log. Un canale di log che non vede viene saltato senza errori.
- I log di messaggi eliminati e modificati dipendono dalla cache dei messaggi del bot. I messaggi inviati prima del riavvio del bot, oppure quelli cancellati in eliminazioni di massa, possono comparire come non in cache.
- I log delle reazioni sono raggruppati: tutte le modifiche alle reazioni su un messaggio entro circa cinque secondi arrivano come un'unica voce, per non sommergere i server molto attivi.
- Il menu a selezione aperto da `log #channel` elenca fino a 25 tipi per menu e preseleziona quelli già inviati a quel canale.
- `logcategory` sovrascrive ogni tipo della categoria, compresi quelli che avevi instradato altrove. Usa `log` per i singoli tipi successivamente.

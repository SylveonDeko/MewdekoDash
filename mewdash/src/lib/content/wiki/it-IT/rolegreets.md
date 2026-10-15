---
title: Saluti per ruolo
slug: rolegreets
summary: Invia un messaggio personalizzato in un canale ogni volta che un membro riceve un ruolo specifico, con segnaposto, embed, webhook ed eliminazione automatica.
icon: fa-user
category: Actions
dashboard: /dashboard/rolegreets
module: RoleGreets
tags: [role greet, role greets, welcome, role message, role announcement, verification welcome, webhook greet, saluto ruolo, saluti per ruolo, benvenuto, messaggio ruolo, annuncio ruolo, verifica, saluto webhook]
related: [multigreets, embedbuilder, administration]
---

## Cosa fa

Un saluto per ruolo è un messaggio che il bot pubblica quando un membro riceve un ruolo. Lo staff sceglie un ruolo e un canale, scrive il messaggio e da quel momento, ogni volta che quel ruolo viene assegnato a qualcuno, il bot pubblica il messaggio lì. Il messaggio predefinito è `Welcome %user.mention%!`.

Il messaggio passa dal parser degli embed, quindi può essere testo semplice, un embed completo o un embed con pulsanti creato nell'editor della dashboard. I segnaposto compilano il nome del membro, l'avatar, la data di ingresso e i dettagli del server. Ogni saluto può essere pubblicato tramite un webhook con un proprio nome e avatar, e può eliminarsi da solo dopo un numero di secondi impostato.

I saluti sono associati a ruolo e canale. Un ruolo può avere fino a dieci saluti, ciascuno in un canale diverso o con un messaggio diverso, e un saluto può essere disattivato senza essere eliminato.

## Perché usarlo

- Dai il benvenuto ai membri nella chat principale solo dopo che hanno superato la verifica e ricevuto il ruolo Verified.
- Annunci i nuovi booster in un canale di ringraziamento quando compare il ruolo booster.
- Dici a chi ha appena scelto un ruolo di gioco dove si trovano i suoi canali.
- Pubblichi una checklist di benvenuto per lo staff nel canale dello staff quando viene assegnato il ruolo di moderatore.
- Saluti i membri aggiunti a un ruolo di giveaway o evento con il regolamento di quell'evento.

## Come si attiva un saluto

Il bot controlla gli aggiornamenti dei membri e confronta i ruoli prima e dopo. Per ogni ruolo aggiunto, cerca i saluti associati a quel ruolo e pubblica ciascuno di essi. I ruoli rimossi non attivano mai nulla. I bot vengono ignorati a meno che **Saluta i bot** non sia attivo per quel saluto, e un saluto disattivato viene ignorato.

Se il canale non esiste più, il saluto si elimina da solo. Se un saluto con webhook fallisce perché il webhook è stato eliminato o il bot ha perso il permesso, il saluto viene disattivato invece di essere rimosso, così puoi correggerlo e riattivarlo.

Con un webhook impostato, il messaggio viene inviato con il nome e l'avatar del webhook. L'eliminazione automatica continua a funzionare: il bot recupera il messaggio appena inviato e lo rimuove dopo il ritardo.

## Segnaposto

I saluti per ruolo supportano i gruppi di segnaposto dell'utente, del server e del bot. I segnaposto del canale non sono disponibili.

| Segnaposto | Valore |
| --- | --- |
| `%user.mention%`, `%user%` | Menzione del membro che ha ricevuto il ruolo |
| `%user.name%`, `%username%` | Il suo nome utente |
| `%user.fullname%` | Nome utente con tag |
| `%user.avatar%` | URL dell'avatar |
| `%user.banner%` | URL del banner |
| `%user.id%` | ID utente |
| `%user.created_date%`, `%user.created_time%` | Data e ora di creazione dell'account |
| `%user.joined_date%`, `%user.joined_time%` | Data e ora di ingresso nel server |
| `%server.name%`, `%server%` | Nome del server |
| `%server.members%` | Numero di membri in cache |
| `%server.icon%`, `%server.banner%` | URL dell'icona e del banner del server |
| `%server.boostlevel%`, `%server.boostcount%` | Livello e numero di boost |
| `%server.time%`, `%time.day%` | Ora del server e giorno della settimana |
| `%bot.name%`, `%bot.avatar%`, `%bot.id%` | Nome, avatar e ID del bot |

Quando il tracciamento degli inviti è attivo sul server, anche i segnaposto di chi ha invitato e dell'invito di Multi Greets (`%inviter.username%`, `%inviter.mention%`, `%inviter.count%`, `%invite.code%`, `%invite.label%` e gli altri) vengono compilati a partire da chi ha invitato il membro. Se chi ha invitato non è noto, questi valori mostrano `Unknown`.

> [!EXAMPLE]
> `Welcome to the team, %user.mention%! You are member number %server.members%. Check the pins in this channel first.`

## Impostazioni

La pagina Saluti per ruolo ha un modulo **Aggiungi nuovo saluto di ruolo** in alto e, sotto, una scheda per ogni saluto.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Role | nessuno | Il ruolo che attiva il saluto |
| Channel | nessuno | Dove viene pubblicato il messaggio |
| Message | `Welcome %user.mention%!` | Apre l'editor degli embed |
| Delete Time (seconds, 0 for never) | 0 | Ritardo dell'eliminazione automatica |
| Webhook URL (optional) | nessuno | Pubblica tramite un webhook invece che con il bot |
| Greet Bots | disattivato | Saluta anche gli account bot che ricevono il ruolo |
| Enabled | attivo | Interruttore sulla scheda; i saluti disattivati non fanno nulla |

## Procedura di configurazione

1. Apri **Benvenuti per ruolo** nella dashboard.
2. In **Aggiungi nuovo saluto di ruolo**, scegli il **Ruolo** e il **Canale**, poi clicca su **Aggiungi saluto di ruolo**.
3. Sulla nuova scheda, clicca sulla casella del messaggio per aprire l'editor e scrivi il tuo saluto con i segnaposto qui sopra.
4. Imposta **Delete Time** se il canale deve restare ordinato, e incolla un **URL del webhook** se vuoi un nome e un avatar personalizzati.
5. Salva la scheda, poi assegna il ruolo a un account di prova e controlla il canale.
6. Usa l'interruttore sulla scheda per mettere in pausa un saluto, oppure il pulsante di eliminazione per rimuoverlo.

> [!TIP]
> In Discord, `rolegreetmessage 1` senza testo mostra il messaggio attuale e offre un pulsante **Anteprima** che lo visualizza con i tuoi dati.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non lo hai cambiato). I saluti sono numerati in base alla loro posizione in `rolegreetlist`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `rolegreetadd <@role> [#channel]` | `rgadd`, `rga` | Amministratore | Aggiunge un saluto per un ruolo, nel canale corrente se non ne viene indicato uno |
| `rolegreetlist` | `rglist`, `rgl` | Amministratore | Sfoglia ogni saluto con le sue impostazioni |
| `rolegreetmessage <id> [message]` | `rgmsg`, `rgm` | Amministratore | Imposta il messaggio, oppure lo mostra e lo visualizza in anteprima senza testo |
| `rolegreetremove <id or @role>` | `rgrem`, `rgrm`, `rgr` | Amministratore | Elimina un saluto per numero, oppure tutti i saluti di un ruolo dopo conferma |
| `rolegreetdelete <id> <time or seconds>` | `rgdel`, `rgd` | Amministratore | Ritardo dell'eliminazione automatica, ad esempio `30s` o `30`; `0` lo disattiva |
| `rolegreetdisable <id> <true/false>` | `rgdisable`, `rgdis` | Amministratore | Disattiva o riattiva un saluto |
| `rolegreetgreetbots <id> <true/false>` | `rolegreetbots`, `rggb` | Amministratore | Se i bot attivano il saluto |
| `rolegreetwebhook <id> [name] [avatar url]` | `rgwebhook`, `rghook`, `rgh` | Amministratore | Crea un webhook nel canale del saluto con quel nome e avatar, oppure lo rimuove senza nome |

I comandi slash si trovano sotto `/rolegreets` con le stesse azioni: `add`, `remove`, `removerole`, `message`, `delete`, `disable`, `greetbots`, `webhook` e `list`.

## Suggerimenti e insidie

- Il bot ha bisogno di Inviare Messaggi e Inserire Link nel canale del saluto, di Gestire Messaggi lì per l'eliminazione automatica e di Gestire Webhook per creare un webhook con `rolegreetwebhook`.
- Il limite è di dieci saluti per ruolo, non per server. Il comando di aggiunta rifiuta l'undicesimo.
- I saluti si attivano a ogni aggiunta di un ruolo, inclusi quelli dai ruoli a reazione, dai premi di livello e da altri bot, quindi un ruolo aggiunto e rimosso spesso riempirà il canale di messaggi.
- Se il parser degli embed non produce nulla, ad esempio un messaggio fatto solo di spazi, non viene inviato niente.
- `rolegreetremove` con un ruolo rimuove ogni saluto di quel ruolo dopo una richiesta di conferma sì/no; con un numero rimuove solo quello, immediatamente.
- I numeri cambiano quando un saluto viene rimosso. Esegui di nuovo `rolegreetlist` prima di modificare per numero.
- I saluti per ruolo sono separati dai saluti di ingresso della pagina MultiGreets. Usa MultiGreets per chi entra nel server e i saluti per ruolo per i ruoli ottenuti in seguito.

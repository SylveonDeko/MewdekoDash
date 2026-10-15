---
title: Profilo utente
slug: userprofile
summary: Dai a ogni membro una scheda profilo che il bot può mostrare ovunque, con bio, pronomi, segno zodiacale, compleanno, colore, immagine e codice amico Switch, più controlli sulla privacy di ciò che gli altri vedono.
icon: fa-user
category: Community
module: UserProfile
tags: [profile, bio, pronouns, pronoundb, zodiac, birthday, privacy, profile colour, profile image, switch friend code, stats opt out, greet dm opt out, profilo, pronomi, segno zodiacale, compleanno, privacy, colore profilo, immagine profilo, codice amico switch, disattiva statistiche, disattiva DM di benvenuto]
related: [birthday, switch, afk, help]
---

## Cosa fa

Ogni membro ha un profilo che lo segue in tutti i server in cui è presente il bot. Eseguire `profile` pubblica il profilo come embed: l'avatar del membro come miniatura, la bio come descrizione, poi campi per i pronomi, il segno zodiacale, il compleanno, quanti server condivide con il bot e il suo codice amico Nintendo Switch, se ne ha impostato uno. Un colore personalizzato e un'immagine grande in fondo completano la scheda.

I membri compilano il profilo con alcuni comandi `set...`, oppure dalla pagina **Le mie impostazioni** della dashboard. Non c'è nulla di specifico per server: imposti la bio una volta sola e viene mostrata uguale ovunque.

La privacy è sotto il controllo del membro. Un profilo può essere reso privato, così che solo il proprietario possa aprirlo, il compleanno può essere ridotto al solo mese oppure nascosto del tutto, e i membri possono disattivare le statistiche sui comandi e i DM di benvenuto.

I pronomi sono un caso a parte. Se un membro non ne ha impostati con il bot, il bot li cerca su PronounDB. I membri possono sostituirli con un testo proprio, e chiunque può segnalare ai proprietari del bot una sostituzione offensiva.

## Perché usarlo

- I membri vogliono una scheda "about me" rapida, senza un canale dedicato alle presentazioni.
- Una comunità che condivide i codici amico Switch può tenerli in un unico posto invece di fissare messaggi.
- I pronomi possono essere mostrati automaticamente da PronounDB, così la maggior parte delle persone non deve mai scriverli.
- Lo staff può controllare i pronomi di qualcuno con `pronouns @user` prima di rispondere.
- I membri che non vogliono DM di benvenuto o raccolta di statistiche possono disattivarli da soli.

## La scheda profilo

`profile` senza argomenti mostra il tuo profilo. `profile @user` mostra quello di un'altra persona, a meno che non l'abbia impostato come privato; in quel caso il bot risponde che il profilo è privato.

| Parte dell'embed | Da dove proviene |
| --- | --- |
| Titolo | "Profile for" seguito dall'utente |
| Colore | `setprofilecolor`, altrimenti il colore predefinito del bot |
| Miniatura | L'avatar Discord del membro |
| Descrizione | La bio impostata con `setbio` (mostrata solo se impostata) |
| Pronomi | La tua sostituzione, altrimenti PronounDB, altrimenti "Unspecified" |
| Zodiac Sign | `setzodiac`, altrimenti "Unspecified" |
| Birthday | `setbirthday`, mostrato in base alla modalità di privacy del compleanno, altrimenti "Unspecified" |
| Mutual Bot Servers | Quanti server condividi tu e il bot |
| Switch Friend Code | Mostrato solo se impostato |
| Image | L'URL impostato con `setprofileimage` |

## Campi del profilo

### Bio

`setbio <text>` accetta fino a 2048 caratteri. Testi più lunghi vengono rifiutati. Non esiste un comando per cancellarla; se la vuoi eliminare, imposta una bio breve, per esempio un solo punto.

### Segno zodiacale

`setzodiac <sign>` accetta uno dei dodici segni occidentali: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces. Non conta che siano maiuscole o minuscole. Qualsiasi altro valore viene rifiutato.

### Colore e immagine

`setprofilecolor <colour>` accetta un colore in qualsiasi formato riconosciuto dal parser dei colori del bot, per esempio un valore esadecimale. `setprofileimage <url>` richiede un link diretto a un file immagine; il bot verifica che l'URL sembri un'immagine prima di salvarlo e te lo mostra.

### Compleanno

`setbirthday <date>` salva una data. Gli annunci del modulo Compleanni usano lo stesso valore, quindi impostarlo qui lo imposta anche lì. Come appare sul profilo dipende da `setbirthdayprivacy <mode>`:

| Modalità | Cosa mostra il profilo |
| --- | --- |
| `Default` | La data completa |
| `MonthOnly` | Solo il nome del mese |
| `YearOnly` | Solo l'anno |
| `MonthAndDate` | Mese e giorno, senza anno |
| `Disabled` | "Private" |

### Codice amico Switch

`setswitchfc <code>` deve corrispondere a `SW-XXXX-XXXX-XXXX` (quattro cifre per ogni gruppo; la `SW` non distingue maiuscole e minuscole). Eseguilo senza codice per rimuoverlo dal profilo. Il modulo Nintendo Switch non c'entra con questo campo; il codice serve solo per la visualizzazione.

### Privacy

`setprivacy public` oppure `setprivacy private`. I profili privati sono visibili solo al proprietario. Il valore predefinito è pubblico.

## Pronomi

`pronouns [@user]` mostra i pronomi tuoi o di un'altra persona. Ordine di ricerca:

1. Il testo impostato dal membro con `setpronouns`.
2. L'insieme di pronomi inglese del membro su PronounDB, se ha collegato il suo account Discord lì. I set standard vengono mostrati nella forma usuale, per esempio `he/him`, `Any pronouns` oppure `Ask me my pronouns`.
3. "Unspecified".

`setpronouns <text>` salva una sostituzione. Eseguito senza testo, mostra la sostituzione attuale con due pulsanti: **Overwrite** apre un modulo per scrivere nuovi pronomi, e **Svuota** rimuove la sostituzione, così torna a essere usato PronounDB.

Quando i pronomi mostrati provengono da una sostituzione del membro (e non da PronounDB), la risposta include un pulsante **Report**. Le segnalazioni vanno in un canale gestito dai proprietari del bot, che possono cancellare la sostituzione, disattivare i pronomi per quell'utente oppure metterlo in lista nera. Un utente i cui pronomi sono stati disattivati vede il motivo ogni volta che prova a usare i comandi dei pronomi.

> [!NOTE]
> Il comando del proprietario del bot `pronounsforceclear` serve a gestire le segnalazioni. Lo staff del server non può cancellare i pronomi di un altro membro.

## Disattivazioni

- `greetdmoptout` attiva o disattiva la possibilità, per i server che usano i DM di benvenuto del bot, di inviarti DM. Riguarda solo i benvenuti inviati da questo bot.
- `userstatsoptout` attiva o disattiva la raccolta delle statistiche sui comandi per il tuo account. Non raccoglie mai il contenuto dei messaggi.
- `deleteuserstatsdata` elimina, dopo una conferma, le statistiche sui comandi già memorizzate per te. Può essere eseguito una volta l'ora.

## Impostazioni

Non esiste una configurazione lato server. Tutto è sul membro. La pagina **Le mie impostazioni** della dashboard (`/me`) ha una sezione **Profilo** con un pulsante **Modifica** e una sezione privacy con interruttori.

| Impostazione | Predefinito | Cosa controlla |
| --- | --- | --- |
| Bio | vuota | La descrizione del tuo profilo |
| Pronouns | vuoti (si usa PronounDB) | La tua sostituzione dei pronomi |
| Zodiac | nessuno | Segno zodiacale mostrato sul profilo |
| Birthday | nessuno | La data mostrata sul profilo e usata per gli annunci di compleanno |
| Timezone | UTC | Fuso orario che il modulo Compleanni usa per il tuo annuncio |
| Switch Friend Code | vuoto | Campo del codice amico sul profilo |
| Profile Color | predefinito del bot | Colore dell'embed |
| Profile image | nessuna | Immagine in fondo all'embed |
| Profile privacy | Public | Se altri possono aprire il tuo profilo |
| Birthday display mode | Default | Quali parti del compleanno vengono mostrate |
| Block Welcome DMs | off | Come `greetdmoptout` |
| Block Message Tracking | off | Come `userstatsoptout` |
| Birthday Announcements | off | Se il modulo Compleanni annuncia il tuo compleanno |

La stessa pagina ha anche un interruttore che disattiva il recupero dei pronomi per il tuo account.

## Procedura di configurazione

1. Esegui `setbio Hi, I run the art channel.` per aggiungere una descrizione.
2. Esegui `setpronouns she/her`, oppure salta questo passaggio se il tuo account PronounDB è già collegato a Discord.
3. Esegui `setbirthday 1998-04-12` e poi `setbirthdayprivacy MonthAndDate` se non vuoi mostrare l'anno.
4. Esegui `setprofilecolor #ff66aa` e `setprofileimage https://example.com/banner.png` per personalizzare l'embed.
5. Aggiungi `setswitchfc SW-1234-5678-9012` se vuoi che le persone ti trovino su Switch.
6. Esegui `profile` per controllare il risultato. Se preferisci che nessun altro lo veda, esegui `setprivacy private`.

## Comandi

Eseguili con il prefisso del tuo server (`.` se non l'hai cambiato). Esistono versioni slash per la maggior parte di essi, con nomi come `/profile`, `/setbio`, `/setcolor`, `/setbirthday`, `/setbirthdayprivacy`, `/setswitchfriendcode`, `/setprofileimage`, `/setprivacy`, `/setzodiac`, `/pronouns`, `/setpronouns`, `/statsoptout` e `/deletestatsdata`.

| Comando | Alias | Richiede | Scopo |
| --- | --- | --- | --- |
| `profile [@user]` | `userprofile` | Nobody | Mostra il tuo profilo o quello di un'altra persona |
| `setbio <text>` | | Nobody | Imposta la tua bio, fino a 2048 caratteri |
| `setpronouns [text]` | `pronounsset` | Nobody | Imposta una sostituzione dei pronomi, oppure la vede con i pulsanti clear e overwrite |
| `pronouns [@user]` | `getpronouns` | Nobody | Mostra i pronomi, con un pulsante di segnalazione sulle sostituzioni |
| `setzodiac <sign>` | | Nobody | Imposta il tuo segno zodiacale |
| `setprofilecolor <colour>` | | Nobody | Imposta il colore dell'embed |
| `setprofileimage <url>` | | Nobody | Imposta l'immagine mostrata sul profilo |
| `setbirthday <date>` | | Nobody | Imposta il tuo compleanno |
| `setbirthdayprivacy <mode>` | | Nobody | `Default`, `MonthOnly`, `YearOnly`, `MonthAndDate` oppure `Disabled` |
| `setprivacy <Public|Private>` | `profilepricvacy` | Nobody | Rende il profilo pubblico o privato |
| `setswitchfc [code]` | `setfc`, `setswitchfriendcode`, `setfriendcode` | Nobody | Imposta o rimuove il tuo codice amico Switch |
| `greetdmoptout` | `gdmoptout` | Nobody | Attiva o disattiva la ricezione dei DM di benvenuto da questo bot |
| `userstatsoptout` | `ustatsoptout` | Nobody | Attiva o disattiva la raccolta delle statistiche sui comandi |
| `deleteuserstatsdata` | `deluserstatsdata` | Nobody | Elimina le tue statistiche sui comandi memorizzate (una volta l'ora) |
| `pronounsforceclear <@user or id> <true|false> <reason>` | `pnfc` | Bot owner | Cancella i pronomi di un membro e, se vuoi, li disattiva |

## Consigli e insidie

- Il profilo è globale. Cambiarlo in un server lo cambia ovunque.
- `setbirthday` legge la data con il parser di date del bot, quindi un formato non ambiguo come `1998-04-12` è il più sicuro.
- Se l'URL dell'immagine del profilo smette di funzionare, l'embed viene comunque inviato ma Discord non mostra alcuna immagine. Imposta un nuovo URL per risolvere.
- Le ricerche su PronounDB richiedono che il membro abbia collegato il proprio account Discord su pronoundb.org. Senza questo, il profilo mostra "Unspecified" finché non esegue `setpronouns`.
- I profili privati rispondono comunque a `profile @user`, ma con un errore che dice che il profilo è privato, così le persone capiscono che esiste.
- `deleteuserstatsdata` rimuove solo le statistiche sui comandi. I campi del profilo si cancellano sovrascrivendoli.

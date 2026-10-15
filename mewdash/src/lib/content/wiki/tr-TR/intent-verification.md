---
title: Intent Doğrulaması
slug: intent-verification
summary: Kendi Mewdeko botun doğrulama gerektirecek kadar büyüdüğünde, Discord'un ayrıcalıklı intent başvuru formunda ne yanıtlayacağın; her kutuya yapıştırabileceğin metinlerle birlikte.
icon: fa-shield-check
category: General
tags: [intents, privileged intents, verification, verify, discord developer portal, presence intent, server members intent, message content intent, self host, selfhost, custom bot, privacy policy, intent, ayrıcalıklı intent, doğrulama, doğrula, discord geliştirici portalı, sunucu üyeleri intent, mesaj içeriği intent, kendi barındırma, özel bot, gizlilik politikası]
related: [settings, statusroles, logging, chatsaver]
---

## Kimler için

Bu sayfa, kendi Mewdeko botunu çalıştıran kişiler içindir: kendi barındırdıkları bir kopya ya da resmi Mewdeko yerine kendi Discord uygulamasını kullanan herhangi bir örnek. Botun, tüm sunucular genelinde toplam 10.000'den fazla benzersiz kullanıcı eşiğini (Discord'un eşiği) aşmasının ardından Discord, kullandığı her ayrıcalıklı intent için başvuru yapmanı ister. Botun bundan küçükse bu sayfayı atlayabilirsin.

> [!NOTE]
> Discord süreci değiştirmedikçe her yıl yeniden doğrulama yapman gerekir. Bir dahaki sefere için bu sayfanın bağlantısını sakla.

Mewdeko tüm gateway intent'leri açık olarak bağlanır; bu yüzden uygulamanın üç ayrıcalıklı intent'in hepsine ihtiyacı vardır: **Presence**, **Server Members** ve **Mesaj İçeriği**. Aşağıdaki bölümler Discord formunun sırasını izler. Seçim menüleri için burada verilen seçeneği seç. Metin kutuları için kod bloğunu kopyala ve köşeli parantez içindeki her şeyi kendi durumuna göre düzenle. Ekran görüntüsü bağlantıları resmi Mewdeko'nun ekran görüntülerine işaret eder; olduğu gibi kullanabilir ya da kendi örneğinin ekran görüntüleriyle değiştirebilirsin.

> [!WARNING]
> Bu rehber onayı garanti etmez; son kararı Discord verir. Her soruyu *kendi* örneğin için dürüstçe yanıtla. Kurulumun varsayılan Mewdeko kurulumundan farklı olduğu yerlerde, örneğin kapattığın özellikler, metni buna göre değiştir. Discord ek sorular sorabilir ve yanıtlarını kanıtlamanı isteyebilir.

## Uygulama ayrıntıları

```
This application is a self-hosted instance of Mewdeko (https://mewdeko.tech), an open source, general purpose Discord bot. Its main features include:

Moderation - Warnings, mutes, timeouts, bans and punishment escalation, with a moderation log.
Auto Moderation & Anti-Raid - Word and link filters, invite filtering, anti-spam and anti-raid protection.
Logging - Configurable logs for message edits/deletes, member joins/leaves, role, nickname and channel changes.
Greets & Leaves - Customisable welcome and goodbye messages, including multiple greet channels and role greets.
Chat Triggers - Custom responses and actions triggered by words, phrases or regex in chat.
XP & Leveling - Message and voice XP with level-up rewards and leaderboards.
Starboard - Members react to highlight messages in a dedicated channel.
Suggestions & Confessions - Server suggestion boards and anonymous confessions.
Support Tickets - Private ticket channels with saved transcripts.
Highlights - Members get a DM when a word they follow is mentioned.
Status Roles & Stream Roles - Roles assigned from a member's custom status or when they go live.
Server Stats - Message, voice and activity statistics for server staff.
Giveaways, Polls, Counting, Games, Music, Reminders, Birthdays and more.

Servers configure the bot with prefix commands, slash commands and a web dashboard.
```

## Gizlilik politikası

### Kullanıcılarına veri kullanımını anlatan herkese açık bir Gizlilik Politikan var mı?

**Evet**'i seç.

### Gizlilik Politikan nerede bulunuyor?

```
In the bot's profile bio and on our website.
```

### Gizlilik Politikanın bağlantısını paylaş.

```
<link to your privacy policy>
```

> [!WARNING]
> Mewdeko'nun kendi politikası, https://mewdeko.tech/privacy adresinde, yalnızca resmi botu ve onun sunucularını kapsar; *bizim* verilerimizin nerede saklandığını ve kiminle iletişime geçileceğini belirtir. Senin örneğin verileri kendi sunucunda saklar, bu yüzden kendi politikana ihtiyacın var. Bizimkini temel alabilirsin; saklama konumunu, iletişim bilgilerini ve farklı olan her şeyi değiştirip sitende ya da bir GitHub gist'inde yayınlayabilirsin. Discord genellikle bağlantının botun profil biyografisinde de olmasını ister.

## Ayrıcalıklı gateway intent'leri

Üçünü de işaretle:

- **Presence Intent**
- **Server Members Intent**
- **Message Content Intent**

> [!TIP]
> Aşağıdaki intent'lerden birinin altındaki her özelliği kapattıysan, o intent'e ihtiyacın yoktur. Botun kullanmadığı bir şeyi istemek yerine onu işaretsiz bırak.

## Presence intent

### Presence intent'e neden ihtiyacın var?

```
Status Roles - Server staff can give members a role based on their custom status text (for example, a supporter role for members who put the server's invite in their status). The role is removed again when the status changes.
Stream Roles - Gives members a "live" role while their Discord activity shows they are streaming, and removes it when they stop.
Game Voice Channels - Optionally moves members into a voice channel matching the game they are playing.
Server Stats - Server staff can opt in to activity statistics showing which games and activities are popular in the server.
Online member counts - Online/idle/do-not-disturb counts for stat channels and message placeholders.
```

### Kullanım durumunu gösteren ekran görüntüsü ve/veya video bağlantılarını ver

```
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/serverstats.png
```

## Server Members intent

### Guild Members intent'e neden ihtiyacın var?

```
Greets & Leaves - Sending custom welcome/goodbye messages and images when members join or leave, including role greets when a member gains a role.
Auto Roles & Role States - Assigning roles on join, and restoring a member's saved roles (including mutes) if they leave and rejoin.
Anti-Raid Protection - Detecting mass joins and new-account raids as members arrive.
Logging - Logging joins, leaves, nickname, avatar and role changes for server moderators.
Invite Tracking - Recording which invite a member joined with.
Leaderboards & Stat Roles - Showing member names and avatars on XP/leaderboard rankings and giving roles based on member statistics.
Achievements - Granting achievements triggered by member profile and role changes.
```

### Kullanım durumunu gösteren ekran görüntüsü ve/veya video bağlantılarını ver

```
https://cdn.mewdeko.tech/intent-verification/greets.png
https://cdn.mewdeko.tech/intent-verification/logging-members.png
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/antiraid.png
```

### API verilerini Discord dışında (platform dışında) saklıyor musun?

**Evet**'i seç. Bot, veritabanında kullanıcı kimliklerini, kullanıcı adlarını, XP'yi, uyarıları ve sunucu başına ayarları saklar.

### API verilerini 30 gün veya daha kısa süreyle mi saklıyorsun?

**Hayır**'ı seç. XP, uyarılar ve biletler gibi sunucu verileri, bot o sunucuda olduğu sürece saklanır.

### Kullanıcılar etkinlik verilerinin silinmesini nasıl talep eder?

```
Users can ask for deletion in our support server (linked in the bot's bio and in the help command) or by emailing <your contact email>. Server administrators can also delete their server's data from the dashboard, and data for a server is removed when the bot is removed from it.
```

### Geliştirici politikasının gerektirdiği gibi, depolanan verilerini durağan halde şifreliyor musun?

> [!WARNING]
> Mewdeko veritabanını kendisi şifrelemez; bu yüzden bu, barındırmana bağlıdır. **Evet**'i yalnızca PostgreSQL ve Redis verilerinin bulunduğu disk ya da birim şifreliyse seç; örneğin LUKS ile şifrelenmiş bir disk ya da durağan halde şifreleme etkin bir bulut birimi. Değilse, başvurudan önce bunu kur. Aksi halde Evet deme.

## Message Content intent

### Kullanıcılar mesaj içeriği verilerinin izlenmesinden vazgeçebilir mi?

**Hayır**'ı seç.

### Mesaj içeriği verilerini Discord dışında (platform dışında) saklıyor musun?

**Evet**'i seç. Birkaç özellik mesaj metnini saklar; standart bir kurulum için Hayır demek yanlış olur.

> [!NOTE]
> Mesaj metnini saklayan özellikler şunlardır: Snipe (sunucu bazında isteğe bağlı; Redis'te tutulur ve 30 gün sonra kırpılır), ticket transkriptleri ve kaydedilmiş sohbet günlükleri, starboard gönderileri, öneriler, itiraflar, AFK mesajları, highlight kelimeleri ve AI sohbet geçmişi. Bunların hepsini kapattıysan bunun yerine Hayır diyebilirsin.

### Mesaj içeriği verileri makine öğrenimi ya da yapay zeka modellerini eğitmek için kullanılacak mı?

**Hayır**'ı seç.

> [!NOTE]
> Mewdeko herhangi bir model eğitmez. İsteğe bağlı AI sohbet özelliği, bir sunucunun bunun için ayarladığı kanaldaki mesajları, *o sunucunun* seçtiği AI sağlayıcısına (OpenAI, Groq ya da Anthropic) gönderir ve bunu o sunucunun kendi API anahtarıyla yapar. Örneğiniz buna izin veriyorsa, bunu aşağıdaki mesaj içeriği yanıtında belirt; izin vermiyorsa o satırı kaldır.

### Message Content intent'e neden ihtiyacın var?

```
Prefix Commands - Mewdeko supports text commands with a configurable prefix (default "."), alongside slash commands. Reading the prefix and arguments requires message content.
Auto Moderation & Anti-Spam - Checking messages against each server's word and link filters, invite filtering and spam detection, and deleting messages that break the rules.
Chat Triggers - Server-configured automatic responses to words, phrases or regex patterns in chat.
Highlights - Notifying members by DM when a keyword they follow is mentioned in a channel they can see.
Message Logging - Showing the old and new text of edited and deleted messages in a server's private moderation log channel.
Snipe - Opt-in per server; lets members view the last deleted or edited message in a channel. Kept for at most 30 days.
Support Tickets - Saving ticket transcripts so staff can review closed tickets.
Starboard - Reposting the content of highly-starred messages to a starboard channel.
Counting, Games & AFK - Reading numbers for counting channels, answers for trivia/word games, and clearing AFK status when the member speaks.
XP - Message length and type are used for XP and anti-spam checks; only counts and XP are stored, not message text.
AI Chat (optional) - Messages in a server's configured AI channel are sent to the AI provider that server set up, using its own API key. Not used for training.
```

### Kullanım durumunu gösteren ekran görüntüsü ve/veya video bağlantılarını ver

```
https://cdn.mewdeko.tech/intent-verification/prefix-command.png
https://cdn.mewdeko.tech/intent-verification/chat-triggers.png
https://cdn.mewdeko.tech/intent-verification/highlights.png
https://cdn.mewdeko.tech/intent-verification/logging-messages.png
https://cdn.mewdeko.tech/intent-verification/starboard.png
https://cdn.mewdeko.tech/intent-verification/ticket-transcript.png
```

## Onay

Kutuyu işaretle.

> [!NOTE]
> Discord'un destek ekibi ek sorularla geri dönebilir ya da gizlilik politikası bağlantısını botun biyografisine taşımak gibi değişiklikler isteyebilir. Bunlara örneğin için dürüstçe yanıt ver; belirli bir durumda Mewdeko'nun ne yaptığından emin değilsen [destek sunucusunda](https://discord.gg/twQw45rBjN) sor.

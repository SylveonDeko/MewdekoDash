---
title: Sunucu Yönetimi
slug: servermanagement
summary: Sunucunun yapısı için toplu araçlar: kanal ve rol oluştur ve sil, yüzlerce üyeye tek bir işle rol ver, sunucuyu kilitle, kanal geçersiz kılmalarını senkronize et, emojileri çal ve tehlikeli rol değişikliklerini izle.
icon: fa-server
category: Actions
module: ServerManagement
tags: [server management, roles, mass role, channels, lockdown, slowmode, lock channel, nuke, emotes, steal emotes, webhook, permcontrol, role monitor, role jobs, server icon, server banner, sunucu yönetimi, roller, toplu rol, kanallar, kilit modu, yavaş mod, kanalı kilitle, nuke, emojiler, emoji çalma, webhook, permcontrol, rol izleyici, rol işleri, sunucu simgesi, sunucu afişi]
related: [administration, permissions, moderation]
---

## Ne işe yarar

Sunucu Yönetimi, sunucudaki insanları değil, sunucunun yapısını değiştiren komutları bir araya getirir. Yetkililer tek satırla bir kategori ve içindeki tüm kanalları oluşturabilir, kanalları yeniden adlandırabilir veya silebilir, konu belirleyebilir, NSFW'yi açıp kapatabilir, yavaş modu ayarlayabilir, bir kanalı kilitleyebilir ya da geçmişini silmek için yeniden oluşturabilir.

En çok dikkat çeken kısım roller. Tek seferlik komutlar rol oluşturur, yeniden adlandırır, rengini değiştirir, ayrı göstermeyi açar, siler ya da tek bir üyeye rol verir; isteğe bağlı bir zamanlayıcı da ekleyebilirsin. Toplu komutlar her üyeye, her insana, her bota, başka bir rolde olan herkese ya da belirli bir tarihten önce veya sonra katılan herkese bir rolü ekler ya da kaldırır. Bunlar listelenip durdurulabilen arka plan işleri olarak çalışır.

Modül ayrıca sunucunun kendi görünümünü (simge, afiş, splash, ad), emoji yönetimini (diğer sunuculardan emoji çalmak dahil), kanal bazında izin geçersiz kılmalarını, ses kanalı taşımalarını, üç çeşit kilit modunu ve tehlikeli rol değişikliklerini geri alıp cezalandıran bir rol izleyiciyi kapsar.

Burada hiçbir şey kontrol panelinden ayarlanmaz. Her şey komutlarla yapılır.

## Neden kullanmalısın

- Yeni bir sunucu kuruyorsun ve Discord arayüzünde on kez tıklamadan bir kategorinin altına on kanal eklemek istiyorsun.
- Rol kapısını açtıktan sonra mevcut iki bin üyeye "Member" rolü vermek istiyorsun.
- Bir baskın sırasında kimsenin mesaj atamaması için sunucuyu kilitleyip eski izinleri birebir geri yüklemek istiyorsun.
- Bir arkadaşının sunucusundaki emojileri tek komutla kopyalamak istiyorsun.
- Bir moderatörün kara listedeki bir izni bir role ekleyerek kendine Yönetici yetkisi vermesini engellemek istiyorsun.

## Kanallar

### Oluşturma ve düzenleme

`creatxtchanl <name>` ve `creatvoichanl <name>` tek bir metin ya da ses kanalı oluşturur. `deltxtchanl <#channel>` ve `delvoichanl <channel>` birini siler.

`cc...` ailesi birden fazla kanalı aynı anda oluşturur:

| Komut | Ne oluşturur |
| --- | --- |
| `ccatc <category name> <channel names...>` | Yeni bir kategori ve içinde metin kanalları |
| `ccavc <category name> <channel names...>` | Yeni bir kategori ve içinde ses kanalları |
| `cctc <existing category> <channel names...>` | Zaten var olan bir kategorinin içinde metin kanalları |
| `ccvc <existing category> <channel names...>` | Zaten var olan bir kategorinin içinde ses kanalları |

`renamechannel <channel> <name>` herhangi bir kanalı yeniden adlandırır, `setchanlname <name>` içinde bulunduğun kanalı yeniden adlandırır, `settopic [text]` bulunduğun kanalın konusunu ayarlar ya da temizler, `nsfwtoggle` ise bulunduğun kanalın NSFW işaretini değiştirir.

### Yavaş mod, kilit ve nuke

Tek başına `slowmode` bulunduğun kanalı bir dakika ile kapalı arasında değiştirir. `slowmode <time>` (örneğin `slowmode 30s`) belirli bir aralık ayarlar; iki biçim de kanal argümanı alabilir. 21600 saniye (altı saat) ve üzeri değerler reddedilir.

`lock [#channel]` o kanalda `@everyone` rolü için Mesaj Gönder yasağı ekler; `unlock [#channel]` bunu kaldırır. Mevcut geçersiz kılma bitleri korunur.

`nuke [#channel]` onay ister, kanalı siler ve aynı ad, konum, konu, izin geçersiz kılmaları, NSFW işareti, kategori ve yavaş mod ile yeni bir kanal oluşturur. Sabitlenmiş mesajlar, webhook'lar ve mesaj geçmişi kalıcı olarak kaybolur.

### İzin geçersiz kılmaları

`permcontrol <channel> <allow|deny|inherit> <role or user> <permissions...>`, bir hedefin o kanaldaki geçersiz kılmasını diğer bitlere dokunmadan düzenler. `permview [@user or role]` sen, bir üye ya da bir rol hangi izinlere sahipse listeler.

`syncroletoall <role>` rolün geçersiz kılmasını bulunduğun kanaldan her metin kanalına ve kategoriye kopyalar. `syncroletoallchannels` ve `syncroletoallcategories` yalnızca kanallara ya da yalnızca kategorilere uygular. Rolün, komutu çalıştırdığın kanalda zaten bir geçersiz kılmasının olması gerekir.

### Webhook'lar

`createwebhook <#channel> <name> [avatar url]` bir webhook oluşturur. URL vermezsen eklenen görsel avatar olarak kullanılır. Bot kanalda onay verir ve webhook URL'sini ile token'ı sana DM olarak gönderir.

## Ses

- `moveto <voice channel>` seni taşır.
- `moveuserto @user <voice channel>` başka birini taşır.
- `grab @user` bulunduğun ses kanalına birini çeker.

## Kilit modu

`lockdown [type] [action] [override]` ve `liftlockdown [type]` Yönetici yetkisi gerektirir.

| Tür | Ne yapar |
| --- | --- |
| `Joins` | Kilit aktifken katılan herkes atılır ya da yasaklanır. Varsayılan işlem `Ban`'dir; diğer tek seçenek `Kick`'tir. |
| `Readonly` | Bot her kanalın mevcut `@everyone` geçersiz kılmasını kaydeder, ardından metin kanallarında Mesaj Gönder, konu oluşturma ve konu yanıtlarını, ses kanallarında ise Bağlan ve Konuş iznini yasaklar. Forum kanallarında mevcut konuların okunabilmesi için Mesaj Gönder izni korunur. |
| `Full` | Yukarıdakilerin ikisi birden. |

Salt okunur bir kilit uygulamadan önce bot her kanalı düzenleyebildiğini kontrol eder. Bazı kanallarda yetkisi yoksa bunları listeler ve durur; üçüncü argüman olarak `true` verirsen yine de devam eder. Kilidi kaldırmak kaydedilen geçersiz kılmaları geri yükler. Katılma kilitleri botun yeniden başlatılmasından sonra da devam eder.

`unlockdown` ayrı ve daha eski bir araçtır: kilidi rolün kendisini düzenleyerek açan sunucular için `@everyone` rolünün Mesaj Gönder iznini yeniden açar.

> [!WARNING]
> Argümansız `lockdown` salt okunur bir kilittir, `lockdown joins` ise varsayılan olarak katılanları yasaklar. İstediğin bu değilse `kick` ekle.

## Roller

### Tek rol komutları

| Komut | Ne yapar |
| --- | --- |
| `createrole [name]` | Bahsedilemeyen bir rol oluşturur |
| `deleterole <role>` | Kendi en üst rolünün altındaki bir rolü siler |
| `renamerole <role> <name>` | Bir rolü yeniden adlandırır |
| `rolecolor <role> [colour]` | Rolün rengini gösterir ya da ayarlar |
| `rolehoist <role>` | Rolün üye listesinde ayrı gösterilip gösterilmeyeceğini değiştirir |
| `setrole <role> @user [time]` | Bir rol verir; isteğe bağlı olarak `2h` gibi bir `time` sonra geri alır |
| `removerole <role> @user` | Bir rolü alır |
| `removeallroles @user` | Bir üyenin yönetilmeyen tüm rollerini kaldırır |

`setrole` ve `removerole` için rol ve üye argümanları iki sırada da verilebilir.

### Birden fazla rol ya da üye aynı anda

- `createroles <names...>` listeyi onayladıktan sonra her kelime için bir rol oluşturur.
- `deleteroles <roles...>` onaydan sonra birden fazla rolü siler; yönetilen roller atlanır.
- `setroles @user <roles...>` bir üyeye birden fazla rol verir; `setroles @user <time> <roles...>` bunları süreli yapar.
- `removeroles @user <roles...>` bir üyeden birden fazla rol kaldırır.
- `adduserstorole <role> @user @user...` ve `removeusersfromrole <role> @user @user...` birden fazla üye üzerinde çalışır.

### Toplu rol işleri

Bunlar tüm üye listesini gezer ve arka plan işleri olarak çalışır. Discord'un hız sınırları nedeniyle bot her üye arasında kısa bir bekleme yapar ve sunucu başına aynı anda yalnızca beş iş çalıştırmaya izin verir. Her iş tahmini süresini bildirir.

| Komut | Kimi etkiler |
| --- | --- |
| `addtoall <role>` | Rolü olmayan her üye |
| `addtoallusers <role>` | Yalnızca insanlar |
| `addtoallbots <role>` | Yalnızca botlar |
| `addtousersover <time> <role>` | En az `time` önce katılmış üyeler, örneğin `30d` |
| `addtousersunder <time> <role>` | `time` değerinden daha yakın zamanda katılmış üyeler |
| `addroletorole <role> <role2>` | `role2` rolündeki herkese `role` verir |
| `addthenremove <role> <role2>` | `role2` rolündeki herkese `role` verir, sonra `role2`'yi kaldırır |
| `removefromall <role>` | Rolü olan herkes |
| `removefromallusers <role>` | Yalnızca insanlar |
| `removefromallbots <role>` | Yalnızca botlar |
| `removefromrole <role> <role2>` | `role2` rolündeki herkesten `role`'ü kaldırır |

`rolejobs` çalışan işleri türleri, başlatanları, ilerlemeleri ve rolleriyle listeler. `stopjob <number>` bir işi iptal eder ve ne kadar ilerlediğini bildirir.

### Dışa ve içe aktarma

`exportrolelist`, bot tarafından yönetilebilen her rol için her üyelik başına bir `roleId,userId,roleName` satırı içeren bir `rolelist.txt` dosyası gönderir. `importrolelist` komuta eklenen böyle bir dosyayı okur ve rolleri yeniden uygular; kimlikler artık yoksa rolleri ada göre oluşturmak için `true` ver. `addroletolist <role>` eklenen bir kullanıcı kimliği listesini okur ve bu rolü verir.

## Sunucu görünümü ve emojiler

`seticon <url>`, `setbanner <url>`, `setsplash <url>` ve `setservername <name>` sunucunun kendisini değiştirir ve Yönetici yetkisi gerektirir. `setguildavatar`, `setguildbanner` ve `setguildbio` ise botun bu sunucudaki görünümünü değiştirir ve Sunucuyu Yönet yetkisi gerektirir.

Emoji komutları hem sende hem botta İfadeleri Yönet yetkisi ister:

- `addemote <name> [url]` bir URL'den ya da eklenen bir görselden emoji yükler.
- `removeemote <emote>` ve `renameemote <emote> <name>` bu sunucudaki emojiler üzerinde çalışır.
- `stealemotes <emotes...>` mesajındaki tüm özel emojileri bu sunucuya kopyalar. `sfr <role> <emotes...>` aynısını yapar ama emojileri bir role özel kılar.
- Bir mesaja sağ tıklayıp Apps menüsünden **Steal Emotes** ya da **Steal Sticker** seçeneğini seçmek, yazmadan aynı işi yapar.

## Rol izleyici

Rol izleyici denetim kaydını izler. Bir üyeye kara listedeki bir rol verildiğinde ya da bir rol kara listedeki bir izni kazandığında bot değişikliği geri alır ve değişikliği yapanı cezalandırır. Yalnızca sunucu sahibi bunu yapılandırabilir.

- `addblacklistedrole <role> [punishment]` ve `removeblacklistedrole <role>`.
- `addblacklistedpermission <permission> [punishment]` ve `removeblacklistedpermission <permission>`; örneğin `addblacklistedpermission Administrator Ban`.
- `setdefaultpunishment <punishment>`, kendi cezası olmayan bir kara liste girişinde ne olacağını belirler. Varsayılan `None`'dır.
- `addwhitelisteduser @user`, `addwhitelistedrole <role>` ve `remove...` karşılıkları yetkilileri izleyiciden muaf tutar. Beyaz listedeki kişiler tarafından ya da onlara yapılan değişiklikler yok sayılır.
- `listblacklists` yukarıdaki her şeyi gösterir.

Ceza değerleri şunlardır: `None`, `Warn`, `Mute`, `ChatMute`, `VoiceMute`, `Timeout`, `Kick`, `Softban`, `Ban`, `RemoveRoles`, `AddRole` ve `Delete`. Aynı anda birden fazla kara listeli izin eklenirse en ağır ceza geçerli olur.

## Ayarlar

Bu modülün kontrol paneli sayfası yoktur. Saklanan tek ayarlar rol izleyiciye ve kilit durumuna aittir.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Varsayılan ceza | None | Kara listedeki bir rol ya da izinde ceza ayarlanmamışsa uygulanır |
| Kara listedeki roller | yok | Verildiğinde kaldırılan roller; her biri için isteğe bağlı ceza |
| Kara listedeki izinler | yok | Bir role eklendiğinde geri alınan izinler; her biri için isteğe bağlı ceza |
| Beyaz listedeki kullanıcılar ve roller | yok | İzleyiciden muaf |
| Katılma kilidi işlemi | Ban | Katılma kilidi sırasında katılan üyelere ne olacağı |

## Kurulum adımları

1. Botun rolünün, yönetmek istediğin her rolün üstünde olduğunu ve Rolleri Yönet ile Kanalları Yönet yetkilerine sahip olduğunu kontrol et.
2. Düzeni kur: `ccatc Community general off-topic memes` bir kategori ve üç kanal oluşturur.
3. Rolleri tek seferde oluştur: `createroles Member Regular Veteran`.
4. Temel rolü dağıt: `addtoallusers Member`, sonra `rolejobs` ile takip et.
5. Sunucu sahibi olarak sunucunu koru: `addblacklistedpermission Administrator Ban` ve `addwhitelistedrole Admin`.
6. Acil durumlar için `lockdown full kick` komutunu aklında tut ve sakin bir günde `liftlockdown full` komutunu test et.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `permview [@user or role]` | `pview` | Yok | İzin verilen izinleri listele |
| `setsplash <url>` | `setserversplash`, `setsplashimage` | Yönetici | Davet splash görselini ayarla |
| `seticon <url>` | `setservericon`, `seticonimage` | Yönetici | Sunucu simgesini ayarla |
| `setbanner <url>` | `setserverbanner` | Yönetici | Sunucu afişini ayarla |
| `setservername <name>` | | Yönetici | Sunucuyu yeniden adlandır |
| `setguildavatar [url]` | `sgav`, `setgav` | Sunucuyu Yönet | Botun bu sunucudaki avatarı |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Sunucuyu Yönet | Botun bu sunucudaki afişi |
| `setguildbio <text>` | `sgbio`, `setgbio` | Sunucuyu Yönet | Botun bu sunucudaki biyografisi |
| `addemote <name> [url]` | `emoteadd`, `ae`, `ea` | İfadeleri Yönet | Bir emoji yükle |
| `removeemote <emote>` | `deleteemote`, `emoteremove`, `emotedelete` | İfadeleri Yönet | Bir emojiyi sil |
| `renameemote <emote> <name>` | `emoterename` | İfadeleri Yönet | Bir emojiyi yeniden adlandır |
| `stealemotes <emotes...>` | `steal` | İfadeleri Yönet | Emojileri bu sunucuya kopyala |
| `sfr <role> <emotes...>` | | İfadeleri Yönet | Emojileri bir role özel kopyala |
| `creatxtchanl <name>` | `ctch` | Kanalları Yönet | Bir metin kanalı oluştur |
| `creatvoichanl <name>` | `cvch` | Kanalları Yönet | Bir ses kanalı oluştur |
| `deltxtchanl <#channel>` | `dtch` | Kanalları Yönet | Bir metin kanalını sil |
| `delvoichanl <channel>` | `dvch` | Kanalları Yönet | Bir ses kanalını sil |
| `ccatc <category> <names...>` | | Kanalları Yönet | Metin kanallarıyla yeni bir kategori |
| `ccavc <category> <names...>` | | Kanalları Yönet | Ses kanallarıyla yeni bir kategori |
| `cctc <category> <names...>` | | Kanalları Yönet | Var olan bir kategoride metin kanalları |
| `ccvc <category> <names...>` | | Kanalları Yönet | Var olan bir kategoride ses kanalları |
| `renamechannel <channel> <name>` | `channelrename` | Kanalları Yönet | Bir kanalı yeniden adlandır |
| `setchanlname <name>` | `schn` | Kanalları Yönet | Bulunduğun kanalı yeniden adlandır |
| `settopic [text]` | `st` | Kanalları Yönet | Mevcut konuyu ayarla ya da temizle |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Kanalları Yönet | NSFW işaretini değiştir |
| `slowmode [time] [#channel]` | | Kanalları Yönet | Yavaş modu aç/kapat ya da ayarla |
| `lock [#channel]` | `channellock`, `lockchannel` | Mesajları Yönet | Herkes için Mesaj Gönder iznini kapat |
| `unlock [#channel]` | `channelunlock`, `unlockchannel` | Mesajları Yönet | `lock` komutunu geri al |
| `nuke [#channel]` | `channelnuke`, `nukechannel` | Kanalları Yönet | Bir kanalı sil ve yeniden oluştur |
| `permcontrol <channel> <allow|deny|inherit> <role or user> <perms...>` | `permc` | Kanalları Yönet | Bir kanal geçersiz kılmasını düzenle |
| `syncroletoall <role>` | `synctoall` | Kanalları Yönet | Bir geçersiz kılmayı tüm kanal ve kategorilere kopyala |
| `syncroletoallchannels <role>` | `srtch`, `srtach` | Kanalları Yönet | Bir geçersiz kılmayı metin kanallarına kopyala |
| `syncroletoallcategories <role>` | `srtc`, `srtac` | Kanalları Yönet | Bir geçersiz kılmayı kategorilere kopyala |
| `createwebhook <#channel> <name> [avatar]` | `cwh` | Yönetici | Bir webhook oluştur |
| `moveto <voice channel>` | | Yok | Kendini taşı |
| `moveuserto @user <voice channel>` | `moveuto` | Kanalları Yönet | Birini taşı |
| `grab @user` | `getoverhere` | Yok | Birini bulunduğun ses kanalına çek |
| `lockdown [joins|readonly|full] [kick|ban] [true]` | `lockdownserver` | Yönetici | Bir kilit modu başlat |
| `liftlockdown [type]` | `unlockserver` | Yönetici | Bir kilit modunu bitir |
| `unlockdown` | `endlockdown` | Kanalları Yönet | `@everyone` için Mesaj Gönder iznini yeniden aç |
| `createrole [name]` | `cr` | Rolleri Yönet | Bir rol oluştur |
| `deleterole <role>` | `dr` | Rolleri Yönet | Bir rolü sil |
| `renamerole <role> <name>` | `renr` | Rolleri Yönet | Bir rolü yeniden adlandır |
| `rolecolor <role> [colour]` | `roleclr` | Ayarlamak için Rolleri Yönet | Bir rolün rengini göster ya da ayarla |
| `rolehoist <role>` | `rh` | Rolleri Yönet | Ayrı gösterimi değiştir |
| `setrole <role> @user [time]` | `sr`, `giverole` | Rolleri Yönet | Bir rol ver, isteğe bağlı süreli |
| `removerole <role> @user` | `rr` | Rolleri Yönet | Bir rolü kaldır |
| `removeallroles @user` | `rar` | Rolleri Yönet | Tüm rolleri kaldır |
| `createroles <names...>` | `croles`, `crs` | Rolleri Yönet | Birden fazla rol oluştur |
| `deleteroles <roles...>` | `drs` | Rolleri Yönet | Birden fazla rolü sil |
| `setroles @user [time] <roles...>` | `srs` | Rolleri Yönet | Birden fazla rol ver |
| `removeroles @user <roles...>` | `rrs` | Rolleri Yönet | Birden fazla rolü kaldır |
| `adduserstorole <role> @users...` | `autr` | Rolleri Yönet | Birden fazla üyeye tek rol ver |
| `removeusersfromrole <role> @users...` | `rufr` | Rolleri Yönet | Birden fazla üyeden tek rol kaldır |
| `addtoall <role>` | `ata` | Rolleri Yönet | Her üyeye rol ver |
| `addtoallusers <role>` | `atau` | Rolleri Yönet | Her insana rol ver |
| `addtoallbots <role>` | `atab` | Rolleri Yönet | Her bota rol ver |
| `addtousersover <time> <role>` | `atuo` | Rolleri Yönet | O süreden önce katılmış üyelere rol ver |
| `addtousersunder <time> <role>` | `atuu` | Rolleri Yönet | Daha yakın zamanda katılmış üyelere rol ver |
| `addroletorole <role> <role2>` | `artr` | Rolleri Yönet | Başka bir roldeki herkese rol ver |
| `addthenremove <role> <role2>` | `atr` | Rolleri Yönet | Bir rolü başka bir rolle değiştir |
| `removefromall <role>` | `rfa` | Rolleri Yönet | Her üyeden kaldır |
| `removefromallusers <role>` | `rfau` | Rolleri Yönet | Her insandan kaldır |
| `removefromallbots <role>` | `rfab` | Rolleri Yönet | Her bottan kaldır |
| `removefromrole <role> <role2>` | `rfr` | Rolleri Yönet | Başka bir roldeki herkesten kaldır |
| `rolejobs` | `rj` | Rolleri Yönet | Çalışan toplu rol işlerini listele |
| `stopjob <number>` | `sj` | Rolleri Yönet | Bir işi iptal et |
| `exportrolelist` | `exportroles`, `erl` | Rolleri Yönet | Rol üyeliklerini indir |
| `importrolelist [true]` | `importroles`, `irl` | Rolleri Yönet | Dışa aktarılmış listeyi yeniden uygula |
| `addroletolist <role>` | `artl` | Rolleri Yönet | Eklenen kullanıcı kimliği listesine rol ver |
| `setdefaultpunishment <action>` | `sdp`, `defaultpunishment`, `setdefpunishment` | Sunucu sahibi | Rol izleyici yedek cezası |
| `addblacklistedrole <role> [action]` | `abr`, `blacklistrole`, `addbrole` | Sunucu sahibi | Bir rolü izle |
| `removeblacklistedrole <role>` | `rbr`, `unblacklistrole`, `removebrole` | Sunucu sahibi | Bir rolü izlemeyi bırak |
| `addblacklistedpermission <permission> [action]` | `abp`, `blacklistpermission`, `addbpermission` | Sunucu sahibi | Bir izni izle |
| `removeblacklistedpermission <permission>` | `rbp`, `unblacklistpermission`, `removebpermission` | Sunucu sahibi | Bir izni izlemeyi bırak |
| `addwhitelisteduser @user` | `awu`, `whitelistuser`, `addwuser` | Sunucu sahibi | Bir üyeyi muaf tut |
| `removewhitelisteduser @user` | `rwu`, `unwhitelistuser`, `removewuser` | Sunucu sahibi | Muafiyeti kaldır |
| `addwhitelistedrole <role>` | `awr`, `whitelistrole`, `addwrole` | Sunucu sahibi | Bir rolü muaf tut |
| `removewhitelistedrole <role>` | `rwr`, `unwhitelistrole`, `removewrole` | Sunucu sahibi | Muafiyeti kaldır |
| `listblacklists` | `lbl`, `blacklists`, `listbws` | Sunucu sahibi | İzleyicinin listelerini göster |

## İpuçları ve dikkat edilecekler

- Rol komutları hiyerarşiyi iki kez kontrol eder: senin en üst rolün ve botun en üst rolü, söz konusu rolün üstünde olmalıdır. Sunucu sahibi kendi tarafındaki kontrolü atlar.
- Toplu işler üye başına yaklaşık bir saniye sürer. Beş bin üyeye rol eklemek bir saatten fazla sürer ve bot altıncı bir eş zamanlı işi reddeder.
- `syncroletoall` ve varyantları, rolün komutu çalıştırdığın kanalda zaten bir geçersiz kılmaya sahip olmasını ister; kopyalanan şey o geçersiz kılmadır.
- `nuke` geri alınamaz; tek koruma onay penceresidir.
- Salt okunur kilit her kanalın geçersiz kılmalarını düzenler; büyük sunucularda bu çok sayıda API çağrısı demektir. Kaydedilen geçersiz kılmalar geri yüklensin diye kilidi elle değil `liftlockdown` ile kaldır.
- Rol izleyici denetim kaydına dayanır; bu yüzden botun Denetim Kaydını Görüntüle yetkisine ve seçtiğin cezanın gerektirdiği yetkiye ihtiyacı vardır.
- Emoji çalmak boş emoji yuvası gerektirir; başarısız olanlar "Errored Emotes" altında listelenir.

---
title: Moderasyon
slug: moderation
summary: Üyeleri uyar, sessize al, zaman aşımına uğrat, at ve yasakla; uyarılar birikince cezaları otomatik olarak artır ve bir yasağın kaç günlük mesajı sileceğini kontrol et.
icon: fa-flag
category: Security
dashboard: /dashboard/moderation
module: Moderation
tags: [moderation, warn, warnings, warn punish, punishment ladder, mute, mute role, timeout, ban, softban, kick, ban purge, ban prune, purge, prune, dehoist, warnlog, moderasyon, uyarı, uyarılar, ceza merdiveni, sessize alma, zaman aşımı, yasakla, at, yasak temizleme, mesaj temizleme, uyarı günlüğü]
related: [administration, filter, logging, auditlog]
---

## Ne yapar

Moderasyon, yetkililerin tek tek üyeler üzerinde kullandığı araç kutusudur. Uyarılar işin özüdür: bir moderatör `warn @user reason` komutunu çalıştırır, üye nedeni ve kendisini kimin uyardığını içeren bir DM alır, uyarı kaydedilir ve sunucuda bir uyarı günlük kanalı varsa oraya uyarı sayısını ve tetiklenen cezayı içeren bir embed gönderilir.

Uyarılar birikir. Aktif uyarı sayısı belirli bir değere ulaştığında otomatik olarak bir şey olması için bir ceza merdiveni kurabilirsin: sessize alma, zaman aşımı, atma, yasaklama veya rol verme. Yetkililerin kuralları hatırlamasına gerek yoktur; sayıya ulaşıldığı anda bot bunları uygular. Uyarılar daha sonra affedilebilir veya belirli bir gün sonra kendiliğinden sona erecek şekilde ayarlanabilir.

Bunun etrafında doğrudan işlemler yer alır: sessize alma (yönetilen bir sessize alma rolüyle), zaman aşımı, atma, softban, yasaklama, geçici yasaklama, toplu atma, mesaj temizleme ve kendilerini listenin en üstüne özel karakterlerle yerleştiren üyeler için takma ad temizliği. Her yasaklama işleminin ayarlanabilir bir temizleme süresi vardır; yani yasak sırasında Discord'un üyenin kaç günlük mesajını sileceğini belirler.

Kontrol paneli sayfası uyarıları, ceza merdivenini, uyarı günlük kanalını ve yasak temizleme ayarlarını kapsar. Sessize alma, atma ve yasaklama gibi doğrudan işlemler yalnızca komut olarak kullanılabilir.

## Neden kullanmalısın

- Hangi moderatör nöbette olursa olsun aynı şekilde uygulanan tutarlı bir "üç ihlal" politikası istiyorsun.
- Üyelerin kanal izinlerine elle dokunmadan hızlıca susturulması gerekiyor.
- Bir spam hesabı katıldı ve yasakla birlikte son bir günlük mesajlarının silinmesini istiyorsun; ama düzenli bir üyenin geçici yasağı geçmişini silmemeli.
- Yetkililerin, moderatör değişse bile kimin, kimin tarafından ve neden uyarıldığını gösteren aranabilir bir kayda ihtiyacı var.
- "!!! xXx" gibi isimler sürekli üye listesinin en üstünde kalıyor ve bunların tek seferde temizlenmesini istiyorsun.

## Uyarılar

`warn <user> [reason]` komutu **Üyeleri Yasakla** iznini gerektirir. Bot önce üyeye sunucu adını, moderatörü ve nedeni içeren bir embed ile DM göndermeyi dener. DM gönderilemezse kanaldaki onay mesajının altbilgisinde bunun belirtildiği yazılır. Uyarı, moderatörün adı ve nedenle birlikte kaydedilir; neden verilmediyse `-` yazılır.

Üye, rol hiyerarşisinde moderatörün ve botun altında olmalıdır. Değilse komut reddedilir.

`warnlog <user>` her sayfada dokuz kayıt olacak şekilde, tarih, moderatör ve nedenle birlikte sayfalı bir liste gösterir. Affedilen uyarılar, kimin temizlediğiyle birlikte üstü çizili görünür. `warnlogall`, uyarısı olan her üyeyi `active (total - forgiven)` biçiminde listeler.

`warnclear <user> [index]` uyarıları affedilmiş olarak işaretler. Dizin verilmezse veya `0` yazılırsa hepsi affedilir. Dizin verilirse yalnızca o uyarı, `warnlog`'da görünen numarasına göre affedilir. Affedilen uyarılar günlükte kalır ama cezalar için sayılmaz. Kontrol paneli bir uyarıyı tamamen de silebilir; bu işlem kalıcıdır.

### Uyarı süresi

`warnexpire <days> <clear|delete>` bir uyarının ne kadar süreyle sayıldığını belirler. Gün sayısı 0 ile 366 arasında olabilir; 0 süre sınırını kapatır. Seçilen işlem, bir uyarının süresi dolduğunda ne olacağını belirler:

| İşlem | Ne olur |
| --- | --- |
| Temizle | Uyarı affedilmiş olarak işaretlenir ve günlükte kalır |
| Sil | Uyarı veritabanından kaldırılır |

Süre kontrolü on iki saatte bir yapılır ve ayar yapıldığında hemen bir kez çalıştırılır.

### Uyarı günlük kanalı

`setwarnchannel #channel` komutuyla veya kontrol paneldeki **Cezalar** sekmesinden **Uyarı Günlük Kanalı** seçiciyle ayarlanır. Her uyarı, oraya üyenin adı ve kimliği, şu anki uyarı numarası, tetiklenen ceza (veya "None"), neden ve uyarıyı veren mesaja giden bir bağlantı içeren bir embed gönderir.

## Uyarı cezaları

Ceza merdiveni "N aktif uyarıda X yap" kurallarından oluşan bir listedir. Bir uyarı verildiğinde bot, üyenin yeni uyarı dahil aktif uyarılarını sayar ve tam olarak bu sayıya eşit bir kural arar. Yalnızca tam eşleşme tetiklenir; yani 3 numaralı kuralı olan ama 4 numaralı kuralı olmayan bir üye 4'e ulaşırsa ek bir şey olmaz.

Bir kuralı `warnpunish <number> <punishment> [time]` ile ayarla; rol varyantı için `warnpunish <number> addrole <role> [time]` kullan. Yalnızca `warnpunish <number>` yazmak kuralı kaldırır. `warnpunishlist` merdiveni gösterir.

| Ceza | Süreli mi? | Ne yapar |
| --- | --- | --- |
| Mute | İsteğe bağlı | Sessize alma rolünü uygular; süre verilirse süreli sessize alma yapar |
| ChatMute | İsteğe bağlı | Yalnızca sessize alma rolü, sesli susturma yok |
| VoiceMute | İsteğe bağlı | Yalnızca sunucu genelinde sesli susturma |
| Timeout | Zorunlu, en fazla 28 gün | Discord zaman aşımı |
| Kick | Hayır | Üyeyi atar |
| Softban | Hayır | Mesajları silmek için yasaklar ve hemen yasağı kaldırır |
| Ban | İsteğe bağlı | Süre verilmezse kalıcı yasak, verilirse süreli yasak |
| AddRole | İsteğe bağlı | Seçilen rolü ekler; süre ayarlıysa süre sonunda kaldırır |
| RemoveRoles | Hayır | Üyenin rollerini alır |

Süreler dakika cinsinden saklanır ve en fazla 49 güne kadar çıkabilir. Softban, Kick ve RemoveRoles süre kabul etmez. Timeout süre olmadan kaydedilmez. Cezalar "Warned too many times." nedeniyle çalışır.

Kontrol panelinde aynı merdiven **Cezalar** sekmesindedir: **Uyarı #** seç, bir **Ceza** seç, isteğe bağlı olarak **Süre (dakika)** gir ve rol cezası için **Eklenecek rol** seç, ardından **Merdivene ekle** düğmesine bas. Zaten kuralı olan bir sayıya yeni kural kaydetmek mevcut kuralın yerini alır.

> [!EXAMPLE]
> `warnpunish 2 mute 1h`, `warnpunish 3 timeout 1d`, `warnpunish 5 ban`. İki uyarıda bir saatlik sessize alma, üç uyarıda bir günlük zaman aşımı, beş uyarıda yasak.

## Mini uyarılar

Küçük ihlaller için genç yetkililerin yönettiği, bağımsız ikinci bir uyarı sistemi daha vardır: mini uyarılar. `mwarn` yalnızca **Üyeleri Sessize Al** iznini gerektirir (ana uyarılar **Üyeleri Yasakla** gerektirir). Kendi günlüğü (`mwarnlog`, `mwarnlogall`), kendi temizleme komutu, kendi süresi, kendi ceza merdiveni (`mwarnpunish`) ve kendi günlük kanalı (`setmwarnchannel`) vardır. Mini uyarılar hiçbir zaman ana merdiveni etkilemez, ana uyarılar da mini uyarıları etkilemez. Kontrol panelinde mini uyarılar gösterilmez.

## Sessize alma ve sessize alma rolü

Bot bir sessize alma rolünü yönetir. Varsayılan adı `Mewdeko-mute`'tur; `muterole @role` ile değiştirebilirsin. Yalnızca `muterole` yazarsan mevcut rol gösterilir. Bir sessize alma ilk kez gerektiğinde rol yoksa bot onu oluşturur ve her metin kanalını dolaşarak şu izinleri reddeden bir izin üzerine yazma ekler: Mesaj Gönder, Tepki Ekle, Dosya Ekle, Alt Konularda Mesaj Gönder ve Herkese Açık Alt Konular Oluştur. Alt konular atlanır. Çok kanallı sunucularda bu biraz zaman alabilir.

| Komut | Etkisi |
| --- | --- |
| `mute` | Tam sessize alma: sessize alma rolünü ekler |
| `chatmute` | Yalnızca sessize alma rolünü ekler |
| `voicemute` | Üyeyi yalnızca seste sunucu genelinde susturur |
| `stfu` | Yalnızca geçerli kanalda, izin üzerine yazma yoluyla o üyenin mesaj göndermesini engeller |

Her birinin süreli bir biçimi vardır. Tam sessize almalar bir dakikadan 90 güne kadar; sohbet ve ses susturmaları bir dakikadan 49 güne kadar sürebilir. Süreli `stfu`, süre dolduğunda üzerine yazmayı kaldırır. Sessize alınan üyeler, sessize alındıklarında ve sessizlikleri kaldırıldığında DM alır.

`removeonmute y` tam sessize almada üyenin diğer rollerini de alır ve saklar; `unmute` bunları geri verir. `removeonmute n` bu davranışı kapatır. `unmuteall` onay istemi sonrasında, isteğe bağlı bir nedenle birlikte, sessize alma rolü olan herkesten bu rolü kaldırır.

## Zaman aşımları

`timeout <time> <user> [reason]` Discord'un yerleşik zaman aşımını kullanır ve en fazla 28 güne kadar çıkabilir. Hem sen hem bot **Üyeleri Zaman Aşımına Uğrat** iznine sahip olmalısınız. `untimeout <user>` zaman aşımını kaldırır. Neden denetim kaydına `moderator | reason` biçiminde yazılır.

## Yasaklar, atmalar ve softbanlar

`ban <user> [reason]` önce üyeye DM gönderir, sonra yasaklar. `ban <time> <user> [reason]` kendiliğinden kalkan geçici bir yasaktır ve en fazla 49 güne kadar çıkabilir. `ban <pruneTime> <time> <user>` temizleme süresini ve yasak süresini açıkça belirler. Sunucuda olmayan kişileri kimlikleriyle yasaklayabilirsin. `unban <user or id>` yasağı kaldırır.

`softban <user> [reason]` yasaklar ve hemen yasağı kaldırır; bu, yakın zamandaki mesajları da silen bir atmadır. `kick <user> [reason]` atar; `masskick @a @b @c` birkaç kişiyi aynı anda atar ve kaçının başarılı olduğunu bildirir. `masskill` yalnızca bot sahibine açıktır ve yapıştırılan bir kimlik listesini toplu olarak yasaklar.

### Yasak DM'i

Yasaklanan üyeye giden mesaj `banmessage <text or embed code>` ile özelleştirilebilir. Metin embed ayrıştırıcısından geçer; yani embed oluşturucudaki her şey kullanılabilir. `-` olarak ayarlarsan hiç DM gönderilmez; varsayılana dönmek için `banmsgreset` kullan. `banmsgtest [duration] [reason]` geçerli şablonu sana gönderir, böylece nasıl göründüğünü görebilirsin.

| Yer tutucu | Değer |
| --- | --- |
| `%ban.mod%` | Moderatörün tam adı |
| `%ban.mod.name%` | Moderatörün kullanıcı adı |
| `%ban.user%` | Yasaklanan üyenin tam adı |
| `%ban.user.name%` | Yasaklanan üyenin kullanıcı adı |
| `%ban.reason%` veya `%reason%` | Neden; yoksa `-` |
| `%ban.duration%` | `d.hh:mm` biçiminde süre veya `perma` |

`%server.name%` gibi sunucu yer tutucuları da burada çalışır.

## Yasak temizleme

Her yasağın bir temizleme süresi vardır: Discord'un yasakla birlikte üyenin kaç günlük mesajını sileceği, 0 ile 7 arasında. Tek bir genel sayı yerine her yasak türünün kendi varsayılanı vardır ve bunları sunucu genelinde, bir kategori için veya tek bir kanal için geçersiz kılabilirsin.

| İşlem | Anahtar | Yerleşik varsayılan |
| --- | --- | --- |
| Yasakla | `ban` | 7 gün |
| Kimlikle yasakla | `hackban` | 7 gün |
| Geçici yasak | `tempban` | yok |
| Softban | `softban` | 7 gün |
| Toplu yasak | `massban` | 7 gün |
| Avatar özetiyle yasakla | `banbyhash` | yok |
| Rolde yasakla | `baninrole` | yok |
| Yaş altı yasakla | `banunder` | yok |
| Uyarı cezası | `warnpunish` | yok |
| Otomatik yasak rolü | `autobanrole` | yok |
| Rol izleyici | `rolemonitor` | yok |
| Filtre | `filter` | yok |
| Kilit | `lockdown` | yok |
| Kontrol paneli | `dashboard` | yok |

Bir yasak gerçekleştiğinde bot en spesifik ayarı arar: komutun çalıştırıldığı kanal, sonra o kanalın kategorisi, en son da sunucu varsayılanı. Her düzeyde, tam işlem için yapılmış bir ayar, "tüm işlemler" için yapılmış bir ayara üstündür. Hiçbiri eşleşmezse yerleşik varsayılan uygulanır.

`banprune` mevcut kanaldan yapılacak bir yasağın neyi temizleyeceğini ve yapılandırılmış tüm ayarları gösterir. `banpruneset <action|all> <days> [#channel or category]` bir ayar yapar, `banpruneclear <action|all> [#channel or category]` bir ayarı kaldırır, `banprunereset` hepsini siler.

Kontrol panelindeki **Yasak Temizleme** sekmesi **Sunucu varsayılanları** altında her işlemi, yanında bir gün kutusuyla listeler; ayrıca bir **Tüm işlemler** yedek satırı ve **Geçersiz Kılmalar** bölümü vardır. Burada bir **Kapsam** (Kanal veya Kategori), hedef, bir **İşlem** ve **Temizle (gün)** seçersin.

## Mesaj temizleme

`purge [count] [flags]` geçerli kanaldaki en fazla 1000 mesajı siler. Sayı verilmezse botun kendi son 100 mesajını siler. `purge @user [count]` yalnızca o üyenin son iki haftadaki mesajlarını siler. Bayraklar birleştirilebilir: `-s` sabitlenmiş mesajları atlar, `-nb` botları atlar, `-ob` yalnızca botları siler, `-he` yalnızca embed içeren mesajları, `-ne` yalnızca embed içermeyenleri siler, `-c text` metni içeren mesajları, `-b date` bir tarihten önceki mesajları, `-a date` bir tarihten sonraki mesajları siler.

`purgeuser <user> <count>` her metin kanalında son `count` mesajı (1 ile 1000 arası) tarar ve o kullanıcının mesajlarını her birinden siler.

## Takma adlar

`dehoist <user>` ve `sanitize <user>` tek bir üyenin takma adından baştaki özel karakterleri veya alışılmadık karakterleri çıkarır. `dehoistall [nicksOnly]` ve `sanitizeall` onay sonrasında herkes için arka plan işi olarak çalışır; `massnickprogress` ilerlemeyi bildirir, `massnickstop` çalışanı iptal eder. Tek üye komutları botun **Takma Adları Yönet** iznine ihtiyaç duyar; "all" varyantları ise botun **Yönetici** iznine ihtiyaç duyar. Her iki durumda da botun rolü etkilenen üyelerin üstünde olmalıdır.

## Ayarlar

Kontrol paneli sayfasında beş sekme vardır: **Genel Bakış** (uyarı sayıları), **Uyarılar**, **Cezalar**, **Son Etkinlik** ve **Yasak Temizleme**.

| Ayar | Varsayılan | Ne kontrol eder |
| --- | --- | --- |
| Uyarı Günlük Kanalı | yok | Her uyarı için bir embed alan kanal |
| Ceza merdiveni | boş | Her uyarı sayısında ne tetiklenir |
| Uyarı süresi | kapalı | Uyarının temizleneceği veya silineceği güne kadar geçen süre; yalnızca komut olarak |
| Sessize alma rolü | `Mewdeko-mute` | Sessize alma komutlarının uyguladığı rol; yalnızca komut olarak |
| Sessize alınınca rolleri kaldır | kapalı | Tam sessize almanın etrafında rolleri alır ve geri verir; yalnızca komut olarak |
| Yasak DM şablonu | varsayılan embed | Yasaklanan üyenin aldığı DM; yalnızca komut olarak |
| Yasak temizleme varsayılanları | işleme göre | Her yasak türüyle silinen mesaj günleri |
| Yasak temizleme geçersiz kılmaları | yok | Kanal veya kategoriye özel temizleme |

**Uyarılar** sekmesinde yetkililer bir üyeyi kullanıcı kimliğiyle, zorunlu bir nedenle uyarabilir; kimliğe, nedene veya moderatöre göre arama yapabilir, affedilen uyarıları gizleyebilir, bir uyarıyı affedebilir, bir üyenin tüm uyarılarını affedebilir veya bir uyarıyı kalıcı olarak silebilir.

> [!WARNING]
> Kontrol panelinden bir uyarıyı silmek onu kalıcı olarak kaldırır ve artık sayılmaz. Affetmek kaydı tutar ve yine de sayılmasını durdurur. Geçmişi gerçekten silmek için bir nedenin yoksa affet.

## Kurulum adımları

1. Kontrol panelinde **Moderasyon**'u aç ve **Cezalar**'a git.
2. Yalnızca yetkililerin okuyabildiği bir **Uyarı Günlük Kanalı** seç.
3. Merdivene kurallar ekle. Yumuşak bir başlangıç için 2 uyarıda 60 dakika Mute, 3 uyarıda 1440 dakika Timeout, 5 uyarıda Ban olabilir.
4. Zaten bir susturma rolün varsa `muterole @Muted` çalıştır; yoksa bot ilk kullanımda `Mewdeko-mute` rolünü oluşturur.
5. Eski uyarıların üç ay sonra sayılmayı bırakması için `warnexpire 90 clear` ile süreye karar ver.
6. **Yasak Temizleme** sekmesinde, geçici yasakların geçmişi silmesini istemiyorsan **Geçici yasak**'ı 0 yap; bot spam kanalının daha fazla temizlemesini istiyorsan kanal geçersiz kılmaları ekle.
7. Bir alt hesapla test et: `warn @alt test`, günlük kanalını kontrol et, sonra `warnclear @alt` çalıştır.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Diğer adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `warn <user> [reason]` | | Üyeleri Yasakla | Bir üyeyi uyar ve varsa merdiven cezasını uygula |
| `warnlog <user or id>` | | Üyeleri Yasakla | Bir üyenin uyarılarını göster |
| `warnlogall` | | Üyeleri Yasakla | Herkesin uyarı sayılarını göster |
| `warnclear <user> [index]` | `warnc` | Üyeleri Yasakla | Tüm uyarıları veya numarasına göre birini affet |
| `warnexpire <days> <clear|delete>` | `warne` | Yönetici | Uyarıları gün sonra otomatik temizle veya sil |
| `warnpunish <number> <punishment> [time]` | `warnp` | Üyeleri Yasakla | Bir merdiven kuralı ayarla; yalnızca sayı verilirse kaldır |
| `warnpunishlist` | `warnpl` | Kimse | Ceza merdivenini göster |
| `setwarnchannel <#channel>` | `warnchannel` | Yönetici | Uyarı günlük kanalını ayarla |
| `mwarn <user> [reason]` | `miniwarn` | Üyeleri Sessize Al | Bir mini uyarı ver |
| `mwarnlog [page] [user or id]` | | Üyeleri Sessize Al; kendin için Kimse | Mini uyarıları göster |
| `mwarnlogall` | `mwarnlogs` | Üyeleri Sessize Al | Herkesin mini uyarı sayılarını göster |
| `mwarnclear <user or id> [index]` | `mwarnc` | Yönetici | Mini uyarıları affet |
| `mwarnexpire <days> [clear|delete]` | `mwarne` | Yönetici | Mini uyarı süresi |
| `mwarnpunish <number> <punishment> [time]` | `mwarnp` | Yönetici | Bir mini uyarı merdiven kuralını ayarla veya kaldır |
| `mwarnpunishlist` | `mwarnplist`, `mwarnpl` | Kimse | Mini uyarı merdivenini göster |
| `setmwarnchannel <#channel>` | `mwarnchannel` | Yönetici | Mini uyarı günlük kanalını ayarla |
| `timeout <time> <user> [reason]` | | Üyeleri Zaman Aşımına Uğrat | Bir üyeyi 28 güne kadar zaman aşımına uğrat |
| `untimeout <user>` | | Üyeleri Zaman Aşımına Uğrat | Zaman aşımını kaldır |
| `mute <user> [time] [reason]` | | Rolleri Yönet veya Üyeleri Sessize Al | Tam sessize alma, isteğe bağlı süreli |
| `unmute <user> [reason]` | | Rolleri Yönet veya Üyeleri Sessize Al | Tam sessize almayı kaldır |
| `chatmute [time] <user> [reason]` | | Rolleri Yönet | Yalnızca sessize alma rolü |
| `chatunmute <user> [reason]` | | Rolleri Yönet | Sohbet sessizliğini kaldır |
| `voicemute [time] <user> [reason]` | | Üyeleri Sessize Al | Yalnızca sesli susturma |
| `voiceunmute <user> [reason]` | | Üyeleri Sessize Al | Sesli susturmayı kaldır |
| `stfu [time] <user>` | `cmute`, `channelmute` | Üyeleri Sessize Al | Yalnızca geçerli kanalda göndermeyi engelle |
| `unstfu <user>` | `unchannelmute` | Üyeleri Sessize Al | `stfu`'yu geri al |
| `muterole [role]` | `setmuterole` | Rolleri Yönet | Sessize alma rolünü göster veya ayarla |
| `removeonmute <y|n>` | | Yönetici | Tam sessize almalarda rolleri çıkar ve geri ver |
| `unmuteall [reason]` | `umall` | Yönetici | Sessize alma rolü olan herkesin susturmasını kaldır |
| `kick <user or id> [reason]` | `k` | Üyeleri At | Bir üyeyi at |
| `masskick <users...>` | `mkick` | Üyeleri At | Birkaç üyeyi at |
| `ban [time] <user or id> [reason]` | `b` | Üyeleri Yasakla | Yasakla veya 49 güne kadar geçici yasakla |
| `unban <user or id>` | | Üyeleri Yasakla | Yasağı kaldır |
| `softban <user or id> [reason]` | `sb` | Üyeleri At ve Mesajları Yönet | Mesajları silmek için yasakla ve yasağı kaldır |
| `banmessage [text]` | `banmsg`, `bantemplate`, `bantemp` | Üyeleri Yasakla | Yasak DM'ini göster veya ayarla; devre dışı bırakmak için `-` |
| `banmsgreset` | | Üyeleri Yasakla | Varsayılan yasak DM'ini geri yükle |
| `banmsgtest [time] [reason]` | | Üyeleri Yasakla | Yasak şablonunu kendine DM olarak gönder |
| `masskill <ids and reasons>` | | Bot sahibi | Yapıştırılan bir listeyi toplu yasakla |
| `banprune` | `banpurge` | Üyeleri Yasakla | Etkin ve yapılandırılmış temizleme ayarlarını göster |
| `banpruneset <action|all> <days> [channel]` | `banpurgeset` | Yönetici | Bir temizleme ayarı yap |
| `banpruneclear <action|all> [channel]` | `banpurgeclear` | Yönetici | Bir temizleme ayarını kaldır |
| `banprunereset` | `banpurgereset` | Yönetici | Tüm temizleme ayarlarını kaldır |
| `purge [count or user] [count] [flags]` | `clear`, `prune` | Mesajları Yönet | Bu kanaldaki mesajları toplu sil |
| `purgeuser <user> <count>` | `pruneuser` | Mesajları Yönet | Tüm kanallarda bir kullanıcının mesajlarını sil |
| `dehoist <user>` | | Takma Adları Yönet | Bir üyenin öne çıkan takma adını düzelt |
| `dehoistall [nicksOnly]` | `dehoista` | Takma Adları Yönet | Öne çıkan tüm takma adları düzelt |
| `sanitize <user>` | | Takma Adları Yönet | Bir takma adı normalleştir |
| `sanitizeall` | `sanitizea` | Takma Adları Yönet | Tüm takma adları normalleştir |
| `massnickprogress` | `mnickprogress`, `mnp` | Yönetici | Çalışan bir dehoist veya sanitize işleminin ilerlemesi |
| `massnickstop` | `mnstop`, `mns` | Yönetici | Çalışan bir dehoist veya sanitize işlemini durdur |

## İpuçları ve dikkat edilecekler

- Botun rolü, susturduğu, attığı veya yasakladığı herkesin ve sessize alma rolünün üstünde olmalıdır. "Ceza uygulanamıyor" hatalarının çoğu hiyerarşi sorunudur.
- Bot, ilgili komutlar için Üyeleri Yasakla, Üyeleri At, Üyeleri Zaman Aşımına Uğrat, Rolleri Yönet ve Mesajları Yönet izinlerine ihtiyaç duyar; her komut çalışmadan önce botun kendi iznini kontrol eder.
- Merdiven yalnızca tam sayıda tetiklenir. "3 veya fazlası" varsayımına güvenmek yerine ilgilendiğin her adımı doldur.
- Yalnızca bot üzerinden verilen uyarılar sayılır. Discord'un kendi zaman aşımları ve yasakları uyarı eklemez.
- Sessize alma rolü izinleri kanal bazında reddeder. Rol var olduktan sonra oluşturulan kanallar, biri sessize alınana kadar bu üzerine yazmayı hemen almaz.
- Discord toplu silmeyi yalnızca 14 güne kadar uzatır. Daha eski mesajlar mesaj temizleme komutları tarafından atlanır.
- Yapılandırmana bakılmaksızın, yasak sırasında temizleme Discord tarafından 7 günle sınırlıdır.
- Kontrol panelinden gelen uyarılar geçerli bir neden gerektirir ve moderatör adı olarak kontrol paneli hesabını kullanır.

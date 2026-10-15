---
title: XP Sistemi
slug: xp
summary: Üyeleri sohbet ederken ve sesli kanallarda konuşurken seviyeler, sıralama kartları, rol ve para ödülleri ile zamanlı etkinliklerle ödüllendir.
icon: fa-star
category: Community
dashboard: /dashboard/xp
module: Xp
tags: [xp, experience, levels, level up, rank, rank card, leaderboard, role rewards, voice xp, xp boost, competition, xp curve, deneyim, seviyeler, seviye atlama, sıralama, sıralama kartı, sıralama tablosu, rol ödülleri, ses xp, xp artırımı, yarışma, xp eğrisi]
related: [currency, achievements, administration, utility]
---

## Ne işe yarar

Üyeler mesaj göndererek ve sesli kanallarda konuşarak XP kazanır. XP, seçtiğin bir eğriye göre seviyelere dönüşür. Herkes `rank` komutuyla seviyesini, ilerleme çubuğunu, sunucu sıralamasını ve avatarını gösteren bir sıralama kartı alabilir; `leaderboard` komutuyla ise kimin önde olduğunu görebilir.

Bir üye seviye atladığında bot, kanalda, özel bir seviye atlama kanalında ya da DM ile duyuru yapabilir. Kendi seviye atlama mesajlarını yer tutucularla yazabilir ya da varsayılan gömülü mesajın işini görmesine izin verebilirsin. Bir seviyeye ulaşmak otomatik olarak rol ve sunucu parası da verebilir.

Yetkililer XP'nin ne kadar hızlı kazanılacağını kontrol eder: mesaj başına XP, bekleme süresi, dakika başına ses XP'si, genel çarpan ve kanal ile rol bazında çarpanlar. Geçici artırım etkinlikleri bir süreliğine her şeyi çarpar; yarışmalarda ise en iyi sıralara ödül veren zamanlı bir yarış düzenlenir. Kullanıcılar, roller ve kanallar hariç tutulabilir; böylece bot-spam kanalları ve susturulmuş roller XP kazanmaz.

## Neden kullanırsın

- Aktif üyelere görünür bir ilerleme ve sohbet etmek için bir neden ver.
- Belirli seviyelerde roller aç; böylece uzun süredir sunucuda olan üyeler yetkililer elle uğraşmadan avantaj kazanır.
- Hafta sonu çift XP etkinliği ya da "20. seviyeye ilk ulaşan" yarışı düzenle.
- Komut kanallarını, AFK kanallarını ve bot rollerini hariç tutarak XP'yi adil tut.
- XP'yi para modülüne bağla; böylece seviye atlamak da ödül kazandırır.

## XP nasıl kazanılır

### Metin XP'si

Bot olmayan her üyenin mesajı, her bekleme süresi aralığında bir kez **Mesaj başına XP** (varsayılan 3, en fazla 50) kazandırır. **Mesaj XP bekleme süresi** varsayılan olarak 60 saniyedir; bu aralıkta on mesaj gönderen bir üye yalnızca bir kez XP alır. Hariç tutulan kanallardaki veya hariç tutulan kullanıcı ve rollerdeki mesajlar hiçbir şey kazandırmaz. Sunucu tamamen hariç tutulmuşsa hiçbir şey sayılmaz.

Miktar daha sonra çarpılır. Bu çarpanların hepsi birlikte çalışır:

| Çarpan | Ayarlandığı yer | Notlar |
| --- | --- | --- |
| Genel çarpan | `setxpmultiplier` veya **Genel XP Çarpanı** | Her kazanca uygulanır |
| Kanal çarpanı | `setchannelxp` | Yalnızca o kanaldaki kazançlara uygulanır |
| Rol çarpanı | `setrolexp` | Üyenin çarpanı olan birden fazla rolü varsa yalnızca en yüksek olanı kullanılır |
| Artırım etkinlikleri | `xpboost` | Aktif her etkinlik uygulanır |

Sonuç aşağı yuvarlanarak tam sayıya çevrilir.

**İlk mesaj bonusu**, bir üyenin her UTC günündeki ilk mesajına verilen tek seferlik ekstra XP'dir. XP ayarlarında saklanır ancak kontrol panelinde gösterilmez.

### Ses XP'si

Ses XP'si oturum bazında takip edilir. Bir üye yalnızca sesli bir kanalda, en az iki katılımcı varken (botlar sayılmaz) kazanır ve kendisi ya da sunucu tarafından susturulmamış veya sağırlaştırılmamış olmalıdır. Susturulmuş, sağırlaştırılmış ya da yalnız geçirilen süreler sayılmaz.

Oturum bittiğinde uygun dakikalar **Dakika başına ses XP'si** ile çarpılır (varsayılan 2, en fazla 10). 15 saniyeden kısa oturumlar hiçbir şey kazandırmaz. **Ses XP zaman aşımı** (varsayılan 60 dakika), tek bir oturumun ödüllendirilebileceği en fazla dakikayı belirler. Çarpanlar ses XP'sine yalnızca temel miktar en az 5 olduğunda uygulanır. Dakika başına ses XP'sini ya da zaman aşımını 0 yaparsan ses XP'si kapanır.

### XP azalması

XP azalması isteğe bağlıdır ve varsayılan olarak kapalıdır. Açıkken bot her on iki saatte bir, son etkinliği **Azalma öncesi hareketsiz gün sayısı** değerinden daha eski olan üyeleri bulur ve toplam XP'lerinin **Günlük azalma yüzdesi** kadarını siler. Bu üç ayar XP ayarları kaydında bulunur ancak henüz bir komutu ya da kontrol paneli denetimi yoktur.

## Seviyeler ve eğriler

Bir üyenin hangi seviyede olduğu **XP eğrisi türüne** bağlıdır. Her eğri, birinci seviye için 36 XP temeline dayanır.

| Eğri | Komut adı | Kontrol paneli adı | n. seviye için gereken XP |
| --- | --- | --- | --- |
| Standart | `Standard` | Varsayılan | 36 x n karesi |
| Doğrusal | `Linear` | Doğrusal | 36 x n |
| Hızlanan | `Accelerated` | Karesel | 36 x n üssü 1,25 |
| Yavaşlayan | `Decelerated` | Üssel | 36 x n üssü 2,5 |
| Özel | `Custom` | sunulmuyor | Standart ile aynı |
| Eski | `Legacy` | Eski | Her seviye 36 artı önceki seviye başına 9 maliyetindedir; toplamlar birikir |

Standart varsayılandır. `setxpcurve` ile eğriyi değiştirmek, ikinci argüman olarak `false` vermediğin sürece herkesin seviyesini yeniden hesaplar. Eğriyi değiştirmek kimsenin XP toplamını değiştirmez; yalnızca bu toplamın hangi seviyeye karşılık geldiğini değiştirir.

## Seviye atlama bildirimleri

Her üye, `levelnotif` ile seviye atlamalarından nasıl haberdar olacağını seçer: `None`, `Channel` veya `Dm`. Üyeler ayrıca `leveluppings false` komutunu çalıştırarak botun onları etiketlemesini durdurabilir; adları bunun yerine düz metin olarak gösterilir.

Kanal bildirimleri, `levelupchannel` ile bir **seviye atlama kanalı** ayarlanmışsa oraya, yoksa XP'nin kazanıldığı kanala gider. Botun orada Mesaj Gönder iznine ihtiyacı vardır.

Sunucunun özel mesajı yoksa varsayılan, seviye atlama mesajıyla başlığı olan bir gömülü mesajdır; küçük resim olarak üyenin avatarını, alanlarda ise toplam XP, sunucu sıralaması ve yeni seviyeyi gösterir. `addlevelupmessage` ile özel mesajlar eklediysen, her seferinde etkin mesajlardan biri rastgele seçilir. Özel mesaj düz metin ya da Gömülü Mesaj Oluşturucu'dan alınmış embed JSON'u olabilir. Bir şablonu `testlevelupmessage` ile dene.

### Yer tutucular

Bunlar özel seviye atlama mesajlarında çalışır; genel kullanıcı ve sunucu yer tutucularıyla birlikte kullanılabilir. Bildirimler, bildirimi tetikleyen kanalı ya da kişiyi takip etmediği için `%xp.channel.*%` "Unknown Channel" olarak, `%xp.triggeruser.*%` "System" olarak çözülür ve `%xp.gained%` her zaman 0'dır.

| Yer tutucu | Değer |
| --- | --- |
| `%xp.user%` | Kullanıcı adı ve etiketi; etiketlemeler kapalıysa yalnızca kullanıcı adı |
| `%xp.user.mention%` | Üyenin etiketi; etiketlemeler kapalıysa yalnızca kullanıcı adı |
| `%xp.user.name%` | Kullanıcı adı |
| `%xp.user.displayname%` | Görünen ad |
| `%xp.user.nickname%` | Takma ad; yoksa kullanıcı adı |
| `%xp.user.avatar%` | Avatar URL'si |
| `%xp.user.id%` | Kullanıcı ID'si |
| `%xp.user.created%` | Hesap oluşturma tarihi |
| `%xp.user.joined%` | Sunucuya katılma tarihi |
| `%xp.level.old%` | Seviye atlamadan önceki seviye |
| `%xp.level.new%` | Yeni seviye (`%xp.level.current%` ile aynıdır) |
| `%xp.level.next%` | Yeni seviye artı bir |
| `%xp.level.difference%` | Kaç seviye kazanıldığı |
| `%xp.total%` | Toplam XP |
| `%xp.current%` | Mevcut seviyede kazanılan XP |
| `%xp.needed%` | Mevcut seviyenin toplamda gerektirdiği XP |
| `%xp.remaining%` | Bir sonraki seviye için hâlâ gereken XP |
| `%xp.progress%` | Seviye ilerlemesi yüzde olarak |
| `%xp.rank%` | Sunucu sıralaması sayı olarak |
| `%xp.rank.ordinal%` | "third" gibi, sıralamanın yazıyla ifadesi |
| `%xp.rank.suffix%` | Yalnızca ek: st, nd, rd veya th |
| `%xp.guild%`, `%xp.guild.name%` | Sunucu adı |
| `%xp.guild.id%` | Sunucu ID'si |
| `%xp.guild.membercount%` | Yaklaşık üye sayısı |
| `%xp.guild.icon%`, `%xp.guild.banner%` | Sunucu simgesi ve afiş URL'leri |
| `%xp.time%`, `%xp.time.full%`, `%xp.date%` | Mevcut UTC saati, tarihli saat ve tarih |
| `%xp.timestamp%`, `%xp.timestamp.relative%` | Şu an için Discord zaman damgası etiketleri |

> [!EXAMPLE]
> `addlevelupmessage %xp.user.mention% just hit level %xp.level.new% and is now %xp.rank.ordinal% on the leaderboard.`

Aynı listeyi Discord'da görmek için `levelupplaceholders` komutunu çalıştır.

## Rol ödülleri

`rolereward <level> <role>`, bir üye o seviyeye ulaştığında bir rol verir. **Dışlayıcı rol ödülleri** kapalıyken (varsayılan), üyeler kendi seviyelerinde veya altındaki seviyeler için tüm ödül rollerini tutar ve üstündeki seviyeler için olanları kaybeder. Açıkken (`setxpexclusive true`), yalnızca hak kazandıkları en yüksek seviyenin ödülü tutulur ve diğer tüm ödül rolleri kaldırılır.

Ödüller seviye değiştiğinde uygulanır. Ödül ekledikten ya da XP içe aktardıktan sonra rolleri eşitlemek için `syncmyxproles`, `syncuserxproles` ya da `syncallxproles` kullan. Tüm kullanıcıları eşitleme işlemi saatte bir çalışabilir; botun, her ödül rolünün üstünde bir rolü olmalı ve Rolleri Yönet iznine sahip olmalıdır.

## Para ödülleri

`currencyreward <level> <amount>`, bir üye o seviyeye ulaştığında para modülünden sunucu parası öder. 0 vermek ödülü kaldırır. Bir üyenin seviyesi düşerse (örneğin `setxp` ya da azalma sonrasında), kaybettiği seviyelerin para ödülü geri alınır.

## Başarımlar

[Başarımlar](/wiki/achievements) kendi puanları ve dereceleriyle ayrı bir sistemdir; bu yüzden bir başarım derecesi bir XP seviyesi değildir. İki sistem iki yerde buluşur: XP seviyelerine ulaşmak Topluluk kategorisindeki başarımların kilidini açar ve başarımlar, başarım başına bir XP ödülü ya da başarımlar Ayarlar sekmesindeki **Puan başına XP** ile XP geri verebilir. İkisi de sen ayarlayana kadar kapalıdır.

## Artırım etkinlikleri

`xpboost <time> <multiplier> <name>`, zamanlı bir etkinlik başlatır; örneğin `xpboost 2h 2.0 Weekend XP Event`. Aktif her artırım, diğer çarpanların üstüne mesaj ve ses XP'sini çarpar. `xpboosts` çalışan artırımları listeler; `cancelboost <id>` birini erken durdurur.

## Yarışmalar

`xpcompetition <time> <type> [targetLevel] [name]`, zamanlı bir yarış başlatır. Yarış sürerken bir üye ilk kez XP kazandığında otomatik olarak katılır.

| Tür | Kazanan |
| --- | --- |
| `MostGained` | Yarışma sırasında en çok XP kazanan |
| `ReachLevel` | Hedef seviyeye ilk ulaşan |
| `HighestTotal` | Yarışma bittiğinde en yüksek toplam XP'ye sahip olan |

`addcompetitionreward <id> <position> <type> <reward>` ile ödül ekle; tür `Role`, `XP` ya da `Currency` olabilir. Rol ödülleri verilir, XP ödülleri bonus XP olarak eklenir ve para para modülü üzerinden ödenir. `competitionleaderboard <id>` sıralamayı gösterir; `endcompetition <id>` yarışmayı erken bitirir ve ödülleri dağıtır.

## Hariç tutmalar

`xpexclude` ve `xpinclude`, bir kullanıcı, bir rol ya da bir metin kanalı kabul eder. Hariç tutulan kullanıcılar ve hariç tutulan bir rolü olanlar hiçbir zaman XP kazanmaz; hariç tutulan kanallarda herkes için hiçbir şey kazanılmaz. Bu, ses kanalları için de geçerlidir. `xpexcludelist users|roles|channels` listeleri gösterir. Eğik çizgi komutları `/xp admin exclude`, `/xp admin include` (bir `user`, `role` ya da `channel` seçeneği ile) ve `/xp exclude-list` şeklindedir. Kontrol panelindeki **Sunucu XP Hariç Tutma** anahtarı, tüm sunucu için XP kazanımını bir kerede kapatır.

## Sıralama kartları

`rank [@user]`, bir PNG kartı oluşturur. `textrank [@user]` aynı bilgiyi ekran okuyucular için metin olarak verir. Botların sıralaması yoktur.

Kart, sunucunun şablonundan oluşturulur: bir arka plan görseli (**Özel XP Kartı Arka Planı** alanından kendi görselin ya da yerleşik olan) ve kullanıcının avatarı ile adı, ilerleme çubuğu, sunucu seviyesi, sunucu sıralaması, mevcut seviyedeki süre ve kazanılan bonus XP için katmanlar. Her katman gösterilebilir ya da gizlenebilir, taşınabilir, yeniden boyutlandırılabilir ve yeniden renklendirilebilir; ilerleme çubuğu yuvarlatılmış, bölümlü ya da dairesel olabilir ve her yönde dolabilir.

**Şablon** sekmesi görsel bir düzenleyici açar. Genişliği 768 pikselden dar ekranlarda kontrol paneli, aynı katmanlara sahip bir dokunmatik düzenleyiciye geçer; bunda özellikler için alttan açılan bir panel ve basit konum ve boyut denetimleri bulunur. Daha geniş ekranlarda ise katman listesi, ızgara, yapıştırma, cetveller, geri al ve yinele ile yakınlaştırma içeren tam düzenleyici kullanılır.

## Sıralama tablosu

`leaderboard [page]`, sunucu sıralamasını gösterir. Sunucu para modülünü de kullanıyorsa ve dolaşımda para varsa, çıplak `leaderboard` komutu XP'yi mi yoksa parayı mı kastettiğini sorar; bir sayfa adı verildiğinde her zaman XP anlaşılır. Kontrol panelindeki **Sıralama tablosu** sekmesi aynı sıralamayı gösterir ve bir üyenin XP'sini ekleyebilen, ayarlayabilen ya da sıfırlayabilen **XP'yi Düzenle** işlemine sahiptir; isteğe bağlı olarak bonus XP'yi de temizleyebilir.

## Ayarlar

Kontrol panelinde altı sekme vardır: **Ayarlar**, **İstatistikler**, **Sıralama tablosu**, **Ödüller**, **Şablon** ve **Hariç Tutmalar**. Bu ayarlar Ayarlar sekmesindedir.

| Ayar | Varsayılan | Kontrol ettiği |
| --- | --- | --- |
| Sunucu XP Hariç Tutma | kapalı | Sunucudaki tüm XP kazanımını durdurur |
| Mesaj başına XP | 3 | Mesaj başına temel XP, en fazla 50 |
| Mesaj XP bekleme süresi | 60 saniye | Üye başına iki mesaj XP'si arasındaki en kısa süre |
| Dakika başına ses XP'si | 2 | Uygun ses dakikası başına temel XP, en fazla 10; 0 ses XP'sini kapatır |
| Ses XP zaman aşımı | 60 dakika | Tek bir ses oturumunun ödüllendirilebileceği en fazla dakika |
| Genel XP Çarpanı | 1 | Her kazancı çarpar |
| XP Eğri Türü | Varsayılan | XP'yi seviyelere hangi eğrinin dönüştüreceği |
| Özel XP Kartı Arka Planı | yok | Sıralama kartlarının arkasında kullanılan görsel URL'si |

**Ödüller** sekmesi rol ve para ödüllerini, **Hariç Tutmalar** sekmesi ise hariç tutulan kanalları ve rolleri yönetir. **İstatistikler** toplam kullanıcı sayısını, toplam XP'yi, ortalama seviyeyi, en yüksek seviyeyi ve son XP etkinliğini gösterir.

Bu alanlar `GuildXpSetting` kaydında da bulunur ama yalnızca komutla ayarlanır: `FirstMessageBonus`, `ExclusiveRoleRewards` (`setxpexclusive`), `LevelUpChannel` (`levelupchannel`), `LevelUpMessage` ve azalma alanları `EnableXpDecay`, `InactivityDaysBeforeDecay` ve `DailyDecayPercentage`.

## Kurulum adımları

1. Kontrol panelinde **XP Sistemi** sayfasını aç ve **Sunucu XP Hariç Tutma** seçeneğinin kapalı olduğunu kontrol et.
2. **Ayarlar** sekmesinde, başlamak için mesaj ve ses değerlerini varsayılan bırak, bir eğri seç ve **Değişiklikleri kaydet** düğmesine bas.
3. **Hariç Tutmalar** sekmesinde bot komut kanallarını ve susturulmuş ya da bot rollerini hariç tut.
4. **Ödüller** sekmesinde birkaç önemli seviye için bir rol ödülü ekle. Botun rolünün bu rollerin üstünde olduğundan emin ol.
5. Discord'da `levelupchannel #level-ups` komutunu çalıştır ve bir ya da iki `addlevelupmessage` şablonu ekle. `testlevelupmessage` ile dene.
6. **Şablon** sekmesini aç, bir arka plan yükle ve kartı düzenle. Sonucu görmek için `rank` komutunu çalıştır.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `rank [@user]` | | Herkes | Bir sıralama kartı göster |
| `textrank [@user]` | | Herkes | Sıralama bilgisini metin olarak göster |
| `leaderboard [page]` | `lb` | Herkes | Sunucu XP sıralaması |
| `levelnotif <None\|Channel\|Dm>` | `lvlnotif` | Herkes | Seviye atlamalarından nasıl haberdar olacağını seç |
| `leveluppings <true\|false>` | `lvluppings` | Herkes | Seviye atlama mesajlarının seni etiketleyip etiketleyemeyeceği |
| `xpsettings` | `xpconfig` | Sunucuyu Yönet | Mevcut XP ayarlarını göster |
| `setmessagexp <amount>` | `setmsgxp` | Sunucuyu Yönet | Mesaj başına XP |
| `setxpcooldown <seconds>` | `xpcd` | Sunucuyu Yönet | Mesaj XP bekleme süresi |
| `setvoicexp <amount>` | | Sunucuyu Yönet | Dakika başına ses XP'si |
| `setvoicetimeout <minutes>` | | Sunucuyu Yönet | Ses oturumu üst sınırı |
| `setxpmultiplier <number>` | `xpmult` | Sunucuyu Yönet | Genel çarpan |
| `setxpcurve <type> [recompute]` | | Sunucuyu Yönet | Seviye eğrisini değiştir |
| `setxpexclusive <true\|false>` | `xpexclusive`, `exclusivexp`, `setxpexcl`, `xpexcl` | Sunucuyu Yönet | Yalnızca en yüksek ödül rolünü tut |
| `setchannelxp <#channel> <number>` | | Sunucuyu Yönet | Kanal çarpanı |
| `setrolexp <role> <number>` | | Sunucuyu Yönet | Rol çarpanı |
| `addxp <@user> <amount>` | | Sunucuyu Yönet | Bir üyeye XP ekle |
| `setxp <@user> <amount>` | | Sunucuyu Yönet | Bir üyenin XP'sini ayarla |
| `resetxp <@user> [resetBonus]` | | Sunucuyu Yönet | Bir üyenin XP'sini sıfırla |
| `resetxp` | | Yönetici | Tüm sunucunun XP'sini sıfırla |
| `xpboost <time> <multiplier> <name>` | | Sunucuyu Yönet | Bir artırım etkinliği başlat |
| `xpboosts` | | Herkes | Aktif artırımları listele |
| `cancelboost <id>` | | Sunucuyu Yönet | Bir artırımı erken bitir |
| `xpexclude <@user\|role\|#channel>` | | Sunucuyu Yönet | XP'den hariç tut |
| `xpinclude <@user\|role\|#channel>` | | Sunucuyu Yönet | Bir hariç tutmayı kaldır |
| `xpexcludelist [users\|roles\|channels]` | | Herkes | Hariç tutmaları göster |
| `rolereward <level> <role>` | `rr` | Rolleri Yönet | Bir rol ödülü ekle |
| `removerolereward <level>` | `removerr` | Rolleri Yönet | Bir rol ödülünü kaldır |
| `rolerewards` | | Herkes | Rol ödüllerini listele |
| `currencyreward <level> <amount>` | `cr` | Sunucuyu Yönet | Bir para ödülü ekle |
| `removecurrencyreward <level>` | `removecr` | Sunucuyu Yönet | Bir para ödülünü kaldır |
| `currencyrewards` | | Herkes | Para ödüllerini listele |
| `xpcompetition <time> <type> [targetLevel] [name]` | | Sunucuyu Yönet | Bir yarışma başlat |
| `addcompetitionreward <id> <position> <Role\|XP\|Currency> <reward>` | | Sunucuyu Yönet | Bir derece ödülü ekle |
| `xpcompetitions` | | Herkes | Aktif yarışmaları listele |
| `competitionleaderboard <id>` | `complb` | Herkes | Yarışma sıralaması |
| `endcompetition <id>` | | Sunucuyu Yönet | Bir yarışmayı bitir ve ödemeleri yap |
| `syncallxproles` | | Yönetici | Ödül rollerini herkese yeniden uygula (saatte bir) |
| `syncmyxproles` | | Herkes | Kendi ödül rollerini yeniden uygula (beş dakikada bir) |
| `syncuserxproles <@user>` | | Rolleri Yönet | Bir üyenin ödül rollerini yeniden uygula |
| `levelupchannel [#channel]` | `lvlupchan` | Sunucuyu Yönet | Kanal bildirimlerinin gideceği yer; kanal verilmezse mevcut kanal kullanılır |
| `addlevelupmessage <text or embed JSON>` | `addlvlupmsg` | Sunucuyu Yönet | Özel bir seviye atlama mesajı ekle |
| `levelupmessages` | `lvlupmsgs` | Sunucuyu Yönet | Özel mesajları ID'leriyle listele |
| `removelevelupmessage <id>` | `remlvlupmsg` | Sunucuyu Yönet | Özel bir mesajı sil |
| `togglelevelupmessage <id> <true\|false>` | `togglelvlupmsg` | Sunucuyu Yönet | Bir mesajı etkinleştir ya da devre dışı bırak |
| `testlevelupmessage [template]` | `testlvlupmsg` | Sunucuyu Yönet | Bir şablonu önizle ya da kayıtlı rastgele birini göster |
| `levelupplaceholders` | `lvlupplaceholders` | Sunucuyu Yönet | Yukarıdaki yer tutucuların listesini göster |

Eğik çizgi karşılıkları `/xp` altındadır; yetkili komutları `/xp admin` (add, set, reset, exclude, include, rol eşitlemeleri), `/xp config` (oranlar, çarpanlar, eğri, dışlayıcı), `/xp rewards`, `/xp boost`, `/xp competition` ve `/xp levelup` olarak gruplanmıştır. Kullanıcı belirtmeden kullanılan `/xp admin reset` tüm sunucunun XP'sini sıfırlar; Yönetici izni ve `confirm: true` gerektirir.

## İpuçları ve dikkat edilecekler

- Rol ödülleri ve rol eşitlemeleri, botun Rolleri Yönet iznine ihtiyaç duyar ve botun en yüksek rolü her ödül rolünün üstünde olmalıdır. `syncallxproles` ve `syncuserxproles` bu izin olmadan çalışmayı reddeder.
- Ses XP'si, kanalda en az iki susturulmamış, sağırlaştırılmamış insan gerektirir. Yalnız ya da susturulmuş bir üye, ne kadar uzun kalırsa kalsın hiçbir şey kazanmaz.
- XP kazanımları toplu olarak yazılır ve arka planda kaydedilir; bu yüzden `rank` komutu son mesajdan birkaç saniye geride kalabilir.
- `setxp` ya da `resetxp` ile bir kişinin XP'sini düşürmek seviyesini de düşürebilir; bu da ödül rollerini kaldırır ve kaybedilen seviyelerin para ödüllerini geri alır.
- `Custom` eğrisi tam olarak Standart gibi davranır ve kontrol panelinde sunulmaz. Yalnızca eski bir kurulumdan geçiş yapıyorsan ve mevcut seviyelerin yerini korumak istiyorsan Legacy seç.
- Özel seviye atlama mesajları, varsayılan gömülü mesajın yerini tamamen alır. Tüm özel mesajlar devre dışıysa varsayılan gömülü mesaj geri döner.
- Artırım etkinlikleri ve yarışmalar yalnızca komutla yönetilir; kontrol paneli bunları göstermez.

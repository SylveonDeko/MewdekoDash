---
title: Yıldız Panosu
slug: starboard
summary: Üyelerin bir tepkiyle en iyi mesajlara oy vermesini sağla; eşiğe ulaşan her şeyi ayrılmış bir öne çıkanlar kanalına yeniden gönder.
icon: fa-star
category: Community
dashboard: /dashboard/starboard
module: Starboard
tags: [starboard, stars, highlights, best of, reactions, pins, repost, threshold, yıldız panosu, yıldızlar, öne çıkanlar, en iyiler, tepkiler, sabitlemeler, yeniden gönderme, eşik]
related: [settings, logging]
---

## Ne yapar

Yıldız panosu, yeterli sayıda kişi seçilen bir emojiyle tepki verdiğinde botun mesajı yeniden gönderdiği bir kanaldır. Üyeler komik veya faydalı bir şeye tepki verir; tepki sayısı eşiğe ulaştığında bot mesajı yazar adı, metni, varsa resimleri ya da videoları, güncel tepki sayılarıyla birlikte yıldız panosu kanalına kopyalar ve bir **Jump to Message** düğmesi ekler.

Gönderi, tepkiler geldikçe ve gittikçe güncellenmeye devam eder. Tepki sayısı eşiğin altına düşerse gönderi kaldırılabilir. Orijinal mesaj silinirse ya da tepkileri temizlenirse gönderi de kaldırılabilir.

Bir sunucu aynı anda birden fazla yıldız panosu çalıştırabilir; her birinin kendi kanalı, kendi emojisi ya da emoji kümesi, kendi eşiği ve kendi kuralları olabilir. Bir "en iyi memeler" panosu bir emojiyi izlerken bir "faydalı cevaplar" panosu başka bir emojiyi izleyerek yan yana çalışabilir.

## Neden kullanırsın

- Topluluğa, yetkililer seçmeden en iyi içeriği öne çıkarma imkânı verirsin.
- Yeni üyelerin kaydırabileceği, uzun ömürlü bir öne çıkanlar kanalı tutarsın.
- Mizah, sanat veya faydalı cevaplar için farklı emojilerle ayrı panolar çalıştırırsın.
- Hangi kanalların panoyu beslediğini sınırlarsın; böylece bot spamı ve konu dışı kanallar dışarıda kalır.

## Birden fazla yıldız panosu ve emojiler

Her yıldız panosu, `liststarboards` komutunda ve panodaki listede gösterilen sayısal bir kimlikle tanımlanır. Komutlar bu kimliği ilk argüman olarak alır.

Bir yıldız panosu bir emojiyle başlar ve ona daha fazlası eklenebilir. Panonun herhangi bir emojisi aynı toplama dahil olur; gönderi her emoji için ayrı bir sayı gösterir. Bir emoji sunucudaki yalnızca bir yıldız panosuna ait olabilir; yeniden kullanmaya çalışmak "emote already in use" hatasıyla başarısız olur. Bir yıldız panosunda en az bir emoji kalmalıdır, bu yüzden son emoji kaldırılamaz.

Özel emojiler de Unicode emojiler gibi çalışır. Bot, emojiyi komut mesajına tepki vererek test eder; bu yüzden botun kullanabildiği bir emoji olmalıdır.

## Eşikler ve sayım

**Yıldız eşiği**, bir mesajın gönderilmesi için kaç tepki alması gerektiğidir. Komuttaki varsayılan 1'dir; panel en az 1 ister.

Sayarken bot:

- Bot hesaplarından gelen tepkileri yok sayar.
- O yıldız panosuna ait her emojinin tepkilerini toplar.
- Yazarın kendi tepkisini de sayar. Kendi mesajını yıldızlama engeli yoktur.
- Yalnızca metni veya eki olan mesajlara tepki verir. İkisi de olmayan mesajlar atlanır.

Toplam eşiğin altındaysa ve bir gönderi zaten varsa, **Eşik Altında Kaldır** açıksa gönderi silinir. Aksi halde gönderi olduğu gibi kalır.

## Bot mesajları

Varsayılan olarak botlar tarafından yazılan mesajlar hiçbir zaman gönderilmez. Bunları dahil etmek için **Bot Mesajlarına İzin Ver** seçeneğini aç. Bir bot mesajı için metin, varsa ilk embed'in açıklamasından, yoksa düz içerikten alınır; resim ise ilk ekten veya ilk embed resminden gelir. Bot mesajlarına izin verildiğinde, bot tepkileri de gönderideki emoji başına sayılarda hesaba katılır.

## Yeniden gönderme eşiği

Normalde bot, sayı her değiştiğinde mevcut yıldız panosu gönderisini yerinde düzenler. Pano yoğunlaştığında bu gönderi, kimsenin güncel sayıyı görmediği kanalın çok yukarısında kalabilir.

**Yeniden Gönderme Eşiği** bunu düzeltir. Bunu N olarak ayarlarsan, her güncellemede bot yıldız panosu kanalındaki son N mesaja bakar. Mevcut gönderi bunların arasındaysa düzenlenir. Bu pencerenin daha gerisine kaymışsa, eski gönderi silinir ve en alta yeni bir tane gönderilir. Yeniden göndermeyi kapatıp her zaman yerinde düzenlemek için 0 yap.

## Kanal filtreleme

Her yıldız panosunun bir kanal listesi ve bir modu vardır:

| Mod | Etkisi |
| --- | --- |
| Beyaz liste (varsayılan) | Yalnızca listelenen kanallardaki mesajlar dikkate alınır. Liste boşsa her kanal dikkate alınır. |
| Kara liste | Listelenen kanallardaki mesajlar yok sayılır. Diğer her şey dikkate alınır. |

`starboardchtoggle <id> #channel`, bir kanalı listeye ekler ya da listeden çıkarır. Panodaki **Kanal Ekle/Kaldır** işlemi de aynısını yapar.

## Yıldız panosu gönderisi

Gönderi klasik bir embed yerine bileşenlerden oluşur:

- Kapsayıcının üstünde her emoji ve sayısını gösteren bir satır.
- Yazarın adı; profiline bağlıdır.
- Mesaj metni.
- Resim ve video eklerinin bulunduğu bir medya galerisi.
- Yıldız panosu kanalına yeniden yüklenen en fazla üç başka ek. Bir indirme başarısız olursa, dosya adı ve boyutu gösterilir.
- Bir **Jump to Message** bağlantı düğmesi.

Yeniden gönderilen metindeki bahsetmeler (mention) bastırılır; böylece yıldızlanan bir mesaj kimseyi ikinci kez etiketleyemez.

## Kaldırma kuralları

| Kural | Varsayılan | Ne zaman tetiklenir |
| --- | --- | --- |
| Silinince Kaldır | Açık | Orijinal mesaj silinir. Kaynak kanalda botun Mesajları Yönet yetkisine sahip olması gerekir. |
| Tepkiler Temizlenince Kaldır | Açık | Bir moderatör orijinaldeki tüm tepkileri temizler. |
| Eşik Altında Kaldır | Açık | Bir tepki kaldırıldıktan sonra toplam eşiğin altına düşer. |

## İstatistikler

`starboardstats` sunucu geneli toplamlarını gösterir: yıldızlanan mesaj sayısı, toplam yıldız, en çok yıldızlanan üye, en aktif kanal ve en aktif yıldızlayan. `starboarduserstats [@user]` bir üyenin yıldızlanan mesaj sayısını, aldığı ve verdiği yıldızları, en iyi gönderilerini, onu en çok kimin yıldızladığını ve onun en çok kimi yıldızladığını gösterir. İkisi de herkese açıktır.

## Ayarlar

Yıldız Panosu sayfasında iki bölüm vardır: **Yeni Yıldız Panosu Oluştur** ve **Yıldız Panolarını Yönet**. Listedeki her giriş kanalını, emojisini, eşiğini ve yeniden gönderme eşiğini gösterir; her girişte **Yıldız Panosu Ayarları**, **Kanal Ekle/Kaldır** ve **Sil** düğmeleri bulunur.

**Yıldız Panosu Ayarları** içinde:

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Yıldız Eşiği | oluşturulurken ayarlanır | Bir mesajın gönderilmesi için gereken tepki sayısı |
| Yeniden Gönderme Eşiği | 0 (devre dışı) | Alta yeniden göndermeden önce kaç güncel mesaja bakılacağı |
| Yıldız Tepkileri | oluşturma emojisi | Bu pano için sayılan emojileri ekle veya kaldır |
| Bot Mesajlarına İzin Ver | Kapalı | Botlar tarafından yazılan mesajları dahil et |
| Silinince Kaldır | Açık | Orijinal silindiğinde gönderiyi kaldır |
| Tepkiler Temizlenince Kaldır | Açık | Tepkiler temizlendiğinde gönderiyi kaldır |
| Eşik Altında Kaldır | Açık | Sayı eşiğin altına düştüğünde gönderiyi kaldır |
| Kanal Modu | Beyaz liste | Kanal listesinin beyaz liste mi kara liste mi olacağı |

> [!TIP]
> Etkin bir sunucuda 3 ile 5 arasında bir eşikle başla. 1 eşiği, rastgele her tepkiyi bir gönderiye dönüştürür.

## Kurulum adımları

1. Öne çıkanlar için bir kanal oluştur ve botun orada mesaj gönderebildiğinden, bağlantı yerleştirebildiğinden ve dosya ekleyebildiğinden emin ol.
2. Panelde **Yıldız Panosu**'nu aç.
3. **Yeni Yıldız Panosu Oluştur** altında kanalı seç, hızlı seçeneklerden bir emoji seç ya da özel bir tane yaz, **Eşik (gereken tepki sayısı)** değerini ayarla ve **Yıldız Panosu Oluştur**'a bas.
4. Yeni girişte **Yıldız Panosu Ayarları**'nı aç. Ek emojileri **Yıldız Tepkileri** altına ekle; pano yoğun olacaksa 20 gibi bir **Yeniden Gönderme Eşiği** ayarla.
5. Panoyu besleyecek kanalları beyaz listeye almak için **Kanal Ekle/Kaldır**'ı kullan ya da **Kanal Modu**'nu kara listeye çevirip dışarıda bırakılacakları listele.
6. Bir test mesajına, eşiğe ulaşacak kadar emojiyle tepki ver ve gönderinin göründüğünü kontrol et.

## Komutlar

Bunları sunucunun önekiyle çalıştır (değiştirmediysen `.`). `<id>`, `liststarboards` komutundaki yıldız panosu kimliğidir.

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `createstarboard #channel <emote> [threshold]` | `addstarboard`, `newstarboard` | Kanalları Yönet | Yıldız panosu oluştur; eşik varsayılan olarak 1 |
| `deletestarboard <id>` | `removestarboard`, `delstarboard` | Kanalları Yönet | Yıldız panosu yapılandırmasını kaldır |
| `liststarboards` | `starboardlist`, `starboards` | Hiç kimse | Her yıldız panosunu ve ayarlarını sayfa sayfa gez |
| `setstarthreshold <id> <number>` | `starthreshold` | Kanalları Yönet | Gereken tepki sayısını ayarla |
| `setrepostthreshold <id> <number>` | `starboardrepost`, `repostthreshold` | Kanalları Yönet | Yeniden gönderme penceresini ayarla; 0 devre dışı bırakır |
| `addstarboardemote <id> <emote>` | `addstaremote`, `starboardaddemote`, `asbe` | Kanalları Yönet | Bir yıldız panosuna emoji ekle |
| `removestarboardemote <id> <emote>` | `removestaremote`, `starboardremoveemote`, `rsbe` | Kanalları Yönet | Bir emojiyi kaldır; son emoji kaldırılamaz |
| `starboardallowbots <id> <true or false>` | `starbots`, `starbotsallow`, `starbab` | Kanalları Yönet | Bot tarafından yazılan mesajlara izin ver |
| `starboardremoveondelete <id> <true or false>` | `starboarddelete`, `stardelete`, `srod` | Kanalları Yönet | Orijinal silindiğinde gönderiyi kaldır |
| `starboardremoveonreactionsclear <id> <true or false>` | `starboardreactionclear`, `starclear` | Kanalları Yönet | Tepkiler temizlendiğinde gönderiyi kaldır |
| `starboardremoveonbelowthreshold <id> <true or false>` | `starboardbelowthreshold`, `starbelow`, `srobt` | Kanalları Yönet | Eşiğin altına düştüğünde gönderiyi kaldır |
| `starboardwlmode <id> <whitelist or blacklist>` | `starboardmode`, `starboardwhitelist`, `swm` | Kanalları Yönet | Kanal listesinin nasıl ele alınacağını ayarla |
| `starboardchtoggle <id> #channel` | `starboardchannel`, `togglestarboardchannel`, `scht` | Kanalları Yönet | Listeye bir kanal ekle veya listeden çıkar |
| `starboardstats` | `starstats`, `starboardstatistics`, `sbstats` | Hiç kimse | Sunucu geneli yıldız panosu istatistikleri |
| `starboarduserstats [@user]` | `staruserstats`, `userstarstats`, `sbuserstats` | Hiç kimse | Bir üyenin istatistikleri |

Eğik çizgi karşılıkları `/starboard` altında bulunur.

## İpuçları ve tuzaklar

- Bot yıldız panosu kanalına mesaj gönderemiyorsa sessizce hiçbir şey yapmaz. Önce kanal izinlerini kontrol et.
- Silinince Kaldır yalnızca botun orijinal mesajın bulunduğu kanalda Mesajları Yönet yetkisine sahip olduğunda çalışır.
- Botların tepkileri asla eşiğe sayılmaz; yani başka bir botun otomatik tepki vermesi mesajları panoya çıkaramaz.
- Bir yıldız panosunu silmek yalnızca yapılandırmasını kaldırır. Kanaldaki mevcut gönderiler kalır.
- Aynı emoji iki pano arasında paylaşılamaz. Her pano için farklı emojiler seç.
- Çok büyük ekler yeniden yüklenemeyebilir; bu durumda gönderi dosya adını listeler.

---
title: Beslemeler
slug: feeds
summary: Bir kanalı bir RSS ya da Atom beslemesine abone et; bot her yeni öğeyi varsayılan bir embed olarak ya da kendi tasarladığın bir mesajla paylaşsın.
icon: fa-newspaper
category: Actions
dashboard: /dashboard/feeds
module: Searches
tags: [rss, atom, feed, news, blog, youtube, updates, subscriptions, feedadd, besleme, haber, güncellemeler, abonelikler]
related: [embedbuilder, utility]
---

## Ne işe yarar

Bota bir besleme URL'si ve bir kanal verirsin. Bundan sonra bot beslemeyi düzenli olarak kontrol eder ve son kontrolden beri yayımlanan her şeyi paylaşır. Site her yeni bir şey yayımladığında üyeler kanalda yeni bir mesaj görür; öğenin başlığı, bir bağlantısı ve besleme bunları sağlıyorsa açıklaması ve bir görseli ile birlikte.

Yetkililer sunucu başına on beslemeye kadar abone olabilir ve her birine kendi mesajını verebilir. Mesaj embed ayrıştırıcısından geçer; bu yüzden bir besleme güncellemesi düz metin, bir embed ya da düğmeli bir embed olabilir ve öğenin başlığını, bağlantısını, yazarını ve benzer bilgilerini getiren yer tutucular kullanabilir.

Üyelerin bir şey yapması gerekmez. Sadece kanalı okurlar.

## Neden kullanmalısın

- Topluluğunun blogunu, yama notlarını ya da değişiklik günlüğünü bir duyuru kanalına otomatik olarak göndermek.
- Bir haber sitesini ya da subreddit beslemesini bir tartışma kanalına yansıtmak.
- Bir YouTube kanalını ya da podcast'i RSS beslemesi üzerinden takip etmek.
- Kimsenin bağlantıları elle kopyalamadan bir durum ya da sürüm beslemesini görünür tutmak.

## Güncellemeler nasıl gönderilir

Bot her abone olunan besleme URL'sini dolaşır, getirir ve bir sonraki beslemeye geçmeden önce yaklaşık on saniye bekler. Başlangıçtan sonraki ilk getirmede en yeni öğenin tarihini kaydeder ve hiçbir şey göndermez. Bundan sonra yayımlanma tarihi son görülen öğeden daha yeni olan her öğe, en eskiden en yeniye doğru gönderilir ve kaydedilen tarih ileri taşınır. Atom beslemeleri için yayımlanma tarihi yoksa öğenin güncellenme tarihi kullanılır. İkisi de olmayan öğeler yok sayılır.

Tek bir turda gönderilen öğe sayısında bir sınır yoktur; bu yüzden geriye dönük tarihli yirmi girdi bırakan bir besleme yirmi mesaj üretir.

Yüklenemeyen beslemeler bir sonraki tura kadar sessizce atlanır. Kaldırılmazlar ve bot hatayı bildirmez.

### Varsayılan mesaj

Bir beslemenin özel mesajı yoksa bot şunları içeren bir embed gönderir:

| Parça | Değer |
| --- | --- |
| Başlık | Öğenin başlığı, 256 karaktere kadar kesilmiş |
| Açıklama | Öğenin açıklaması, HTML'i temizlenmiş ve 2048 karaktere kadar kesilmiş |
| URL | Öğenin bağlantısı; böylece başlık tıklanabilir olur |
| Görsel | Beslemeden gelen bir görsel eki ya da varsa bir Atom `preview` ya da `thumbnail` öğesi |
| Alt bilgi | Besleme URL'si |

### Özel mesajlar ve yer tutucular

Özel bir mesajı `feedmessage` ile ya da kontrol panelindeki **Mesajı Düzenle** düğmesiyle ayarla. Metin embed ayrıştırıcısından geçer; bu yüzden [embed oluşturucudan](/wiki/embedbuilder) gelen her şey çalışır: düz metin, embed JSON'u ya da ikisi birden. Düz metin kısmındaki rol ve kullanıcı etiketleri bildirim gönderir.

Bu yer tutucular, sayfa yer tutucularındaki genel sunucu, kanal ve bot yer tutucularına ek olarak özel mesajda değiştirilir.

| Yer tutucu | Değer |
| --- | --- |
| `%title%` | Öğenin başlığı |
| `%author%` | Öğenin yazarı ya da "Unknown" |
| `%content%` | HTML'i kaldırılmış öğe açıklaması |
| `%url%` | Öğeye bağlantı |
| `%feedurl%` | Beslemenin kendi URL'si |
| `%image_url%` | Besleme bir görsel sağlıyorsa öğenin görseli, yoksa beslemenin görseli |
| `%categories%` | Öğenin kategorileri, virgülle ayrılmış |
| `%timestamp%` | Yayımlanma tarihi, bir Discord zaman damgası olarak |

> [!EXAMPLE]
> `feedmessage 1 New post: **%title%** by %author%
> %url%`

Varsayılan embed'e dönmek için mesajı `-` olarak ayarla.

## Ayarlar

Beslemelerin sunucu geneli bir ayarı yoktur. Her abonelik, eklendiğinde seçilen bir kanala ve URL'ye ve isteğe bağlı bir mesaja sahiptir. Kontrol panelindeki sayfa **RSS Akışları** adını taşır ve üç sekmesi vardır.

| Sekme | Gösterdiği |
| --- | --- |
| RSS Akışları | Her aboneliği kanalı, URL'si ve eklenme tarihiyle birlikte. **Mesajı Düzenle** ya da **Özel Mesaj Ekle** bir metin kutusu açar; mesajın önizlemesi altında görünür. **Sil**, onaydan sonra beslemeyi kaldırır. |
| Besleme Ekle | Bir **Kanal** seçici ve bir **RSS Besleme URL'si** kutusu ile **RSS Beslemesi Ekle** düğmesi |
| İstatistikler | **Toplam Besleme**, **Benzersiz Besleme**, **Kanallar** ve **Kanallara Göre Beslemeler** dökümü |

Mevcut bir beslemenin kanalı ve URL'si değiştirilemez. Beslemeyi kaldırıp yeniden ekle.

## Kurulum adımları

1. Kontrol panelinde **Beslemeler**'i aç ve **Besleme Ekle** sekmesine geç.
2. Güncellemelerin gitmesi gereken **Kanal**'ı seç.
3. Besleme adresini **RSS Besleme URL'si** kutusuna yapıştır ve **RSS Beslemesi Ekle**'ye bas. Bu, bir RSS ya da Atom belgesine giden tam bir `http` ya da `https` adresi olmalı; sitenin ana sayfası olmamalı.
4. Kendi ifadeni istiyorsan **RSS Akışları** sekmesine dön, **Özel Mesaj Ekle**'ye, ardından **Kaydet**'e bas.
5. Discord'da `feedtest 1` çalıştırarak en yeni öğeyi paylaş ve sonucu kontrol et. Numara, beslemenin `feedlist` içindeki konumudur.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Tüm besleme komutları Mesajları Yönet yetkisi gerektirir.

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `feedadd <url> [#channel]` | `rss` | Mesajları Yönet | Bir kanalı bir beslemeye abone et. Varsayılan olarak geçerli kanal. Bot önce beslemeyi getirir ve okunamazsa reddeder. |
| `feedlist` | `feeds` | Mesajları Yönet | Abonelikleri numaralı olarak, sayfa başına on tane listele |
| `feedremove <number>` | `feedrm`, `feeddel` | Mesajları Yönet | Bir aboneliği listedeki numarasıyla kaldır |
| `feedmessage <number> <message>` | `rssmessage` | Mesajları Yönet | Bir abonelik için özel mesajı ayarla |
| `rsstest <number>` | `feedtest` | Mesajları Yönet | Beslemenin en yeni öğesini geçerli kanalda paylaş |

## İpuçları ve dikkat edilecekler

- Sınır sunucu başına on beslemedir ve aynı URL iki kez eklenemez. `feedadd`, okunamayan bir bağlantı, bir yinelenen ve sınır için tek bir birleşik hata verir; hangisi olduğundan emin değilsen `feedlist` kontrol et.
- Kontrol panelinden bir besleme eklemek URL'yi önce test etmez. Botun okuyabildiğinden emin olmak için sonradan `feedtest` kullan.
- `feedremove`, `feedmessage` ve `feedtest` içindeki numaralar `feedlist`'ten gelir; bu liste beslemeleri eklenme sırasına göre sıralar.
- Bot hedef kanalda Mesaj Gönder ve Bağlantı Yerleştir yetkisine ihtiyaç duyar. Bağlantı Yerleştir olmadan varsayılan embed görünmez.
- Yalnızca yayımlanma tarihi olan (ya da Atom için güncellenme tarihi olan) öğeler gönderilir. Girdileri tarihsiz olan bir besleme hiçbir zaman güncelleme üretmez.
- Bot yeniden başladıktan sonraki ilk turda hiçbir şey göndermez. O andaki en yeni öğeden başlar; bu yüzden bot çevrimdışıyken yayımlanan öğeler yakalanmaz.
- Özel mesaj embed ayrıştırıcısını kullandığı için embed oluşturucunun kurallarını koru: geçerli JSON ya da düz metin.

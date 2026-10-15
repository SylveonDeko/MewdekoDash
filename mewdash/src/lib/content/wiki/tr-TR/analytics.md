---
title: Analitik
slug: analytics
summary: Yalnızca bot sahiplerine açık bir kontrol paneli sayfası; komutların, gateway olaylarının, gecikmenin, hataların, sunucu büyümesinin, özellik benimsenmesinin, yapay zeka ve müzik kullanımının, web sitesi trafiğinin ve webhook uyarı kurallarının saklanan geçmişini gösterir.
icon: fa-chart-simple
category: Analytics
dashboard: /owner/analytics
tags: [analytics, metrics, telemetry, commands, events, latency, errors, growth, alerts, shards, owner, analitik, metrikler, telemetri, komutlar, olaylar, gecikme, hatalar, büyüme, uyarılar, shard'lar, sahip]
related: [performance, leave-feedback, administration]
---

## Ne işe yarar

Analitik, botu çalıştıran kişi için bir geçmiş sayfasıdır. Yalnızca bot sahiplerine görünür: kenar çubuğu herkes için gizler ve URL'yi doğrudan açan sahip olmayanlar kontrol paneli ana sayfasına geri gönderilir. Burada sunucu yetkililerinin ayarlayacağı bir şey yoktur.

[Performans](/wiki/performance) sayfası canlı süreci gösterir ve yeniden başlatmada unutur; Analitik ise botun kendi veritabanına yazdığı kayıtları okur. Çalışan her örnek komutları, gateway olaylarını, shard gecikmesini, REST çağrılarını, veritabanı sürelerini, süreç ölçümlerini, istisnaları, özellik kullanımını, yapay zeka ve müzik etkinliğini ve kontrol paneli sayfa görüntülenmelerini kaydeder. Sayılar bellekte dakika bazında toplanır, her dakika yazılır, 5 dakikalık ve saatlik gruplara katlanır ve sabit bir takvimde temizlenir. Böylece geçen haftaya bakabilir, bir önceki haftayla karşılaştırabilir ve örneğe, shard'a ya da sunucuya göre filtreleyebilirsin.

Haftalık bir özet bir Discord webhook'una gönderilebilir. Saklanan herhangi bir metrik için kurulan uyarı kuralları bir eşik aşıldığında bir webhook'a bildirim gönderir.

## Neden kullanırsın

- Bir hata artışının bir dağıtımdan önce mi sonra mı başladığını öğrenmek istersin; sadece şu an neyin hata verdiğini değil.
- Bir sunucu botun yavaş olduğunu bildirdiyse, bir tarih aralığı için komut gecikmesini, etkinliğini ve güvenlik olaylarını görmek istersin.
- Sunucuların hangi özellikleri gerçekten ayarlayıp kullandığını ve bunun aylar içinde nasıl değiştiğini görmek istersin.
- Shard gecikmesi, hata oranı ya da REST 429'lar bir sınırı aştığında sayfayı izlemeden Discord'dan bildirim almak istersin.
- Bir kanalda büyüme, komutlar, hatalar ve en çok kullanılan özelliklerin olduğu bir Pazartesi özeti istersin.

## Sekmeler

| Sekme | Gösterdikleri |
| --- | --- |
| Genel Bakış | **Sunucular**, **Kullanıcılar**, **Komutlar / dk**, **Gateway olayları**, **REST istek / sn**, **İşlenmemiş hatalar** (istisna gruplarına iner), **En kötü shard gecikmesi** ve **Müzik oynatıcıları** kutucukları; uyarı bantlı shard gecikmesi; şu an tetiklenen uyarılar; türe ve tipe göre saniyedeki komut ve gateway olayları; günlük sunucu anlık görüntüleri; REST hızı; süreç belleği |
| Komutlar | Tür, modül ve sonuç seçimleri; **Çağrılar**, **Hatalar**, **Süre p95** ve **Süre p50**; modüle göre çağrılar; sınıfa göre hatalar; p50, p95, p99 süreleri; türe göre çağrılar; UTC saatine ve sunucu boyutuna göre bir ısı haritası; **En çok kullanılan komutlar**, sayfalanmış bir **Çağrı günlüğü**, satıra tıklayınca son hata örneklerini açan **En çok hata veren komutlar** |
| Olaylar | Türe göre saniyedeki gateway olayları; aralıktaki sayı ve tür bazlı tablo; shard başına olaylar; türe göre işleyici p95; modüle ve olay türüne göre işleyici hataları |
| Gecikme | **REST p95**, **REST 5xx**, **REST 429**, **Hız sınırı isabetleri**, **VT p95**, **VT hataları**, **Shard yeniden bağlanmaları**, **İşlenmemiş hatalar**; rotaya göre REST gecikmesi ve hızı; rotaya göre hız sınırı isabetleri; işleme göre veritabanı p95 ve hataları; CPU, RSS, iş parçacıkları ve 2. nesil GC'ler; durum, gecikme, zirve, sunucu ve yeniden bağlanma sayılarını içeren shard başına tablo; işlenmemiş istisna grupları (satıra tıklayınca oluşumlar açılır); türe göre hatalar |
| Sunucu sayıları | **Sunucular**, **Kullanıcılar**, **Katılan**, **Ayrılan**, **Net**; 30 günlük sunucu ve kullanıcı anlık görüntüleri; günlük katılım ve ayrılmalar; geri dönüş oranıyla birlikte kayıp; boyuta göre katılım ve ayrılmalar; katılım gününe göre elde tutma; boyuta göre katılımlar; satıra tıklayınca sunucu kartını açan **Geri dönen sunucular** ve **Sessizleşenler** tabloları |
| Sunucular | Olay türü seçimi ve saat başına minimum olay sayısı; bir sunucu kimliği **Sunucu kartını** açar, tür ve saate göre etkinlik ısı haritası ve sayfalanabilir, filtrelenebilir bir **Güvenlik olayları** günlüğü; **Olaya göre en çok kullanan sunucular**; önceki 14 günün aynı saatiyle karşılaştırılmış **Olağandışı etkinlik** |
| Özellikler | Gece sayımından yapılandırılmış ve etkin sayılarıyla **Özellik benimsenmesi**, aktif sunucular, etkinlik ve hata oranı; sunucu başına kullanılan özellikler; sunucu boyutu ile kullanılan özellikler karşılaştırması; seçilen özellik için en son sayımdan **Ayar kullanımı** ve 90, 180 ya da 365 günlük yapılandırılmış veya etkin sayım serisi |
| Yapay zeka | **İstekler**, **Giren token'lar**, **Çıkan token'lar**, fiyatlandırılmış modeller için liste fiyatlarıyla **Tahmini maliyet**; hata, token, p95 ve maliyet içeren model bazlı tablo; modele göre istekler, token'lar ve p95; yapay zeka sohbeti kullanan en çok kullanan sunucular |
| Müzik | **Oynatıcılar**, **Başlatılan parçalar**, **Hatalar**; düğüme göre oynatıcılar; kaynağa göre başlatılan parçalar; türe göre hatalar; düğüm durumu; nedene göre biten parçalar |
| Web sitesi | **Sayfa görüntülemeleri**, **Ziyaretçiler**, **İstek p95**, **5xx**; rotaya göre görüntülemeler; istek süresi; ziyaretçi, p95 ve 5xx içeren rota tablosu; rotaya göre 4xx ve 5xx; giriş, OAuth geri çağrısı ve kontrol paneline geçiş hunisi ile kayıp oranı |
| Uyarılar | Tetiklenen gruplar; etkinleştirme, test etme, 1 saat sessize alma ve silme seçenekli kurallar tablosu; durum geçişlerinin sayfalanmış olay günlüğü (değer ile eşik karşılaştırması ve bir webhook gönderilip gönderilmediği); **Yeni kural** ve **Özeti şimdi gönder** |
| Hat | Bir durum etiketi; **Son boşaltma**, **Son özet**, **Son bakım**, **Bekleyen seriler**, **Bekleyen satırlar**; varsa son boşaltma hatası; tablo başına satır sayıları ve en yeni satır; kalp atışı ve son sunucu sayısıyla kayıtlı örnekler; boşaltma süresi ve boşaltma başına satır |

Hat durumu, son boşaltma en fazla 60 saniye önceyse, son özet en fazla 10 dakika önceyse ve boşaltma hatası yoksa `healthy` olur. Aksi halde `flush stale` veya `rollup stale` görünür; bir boşaltma başarısız olduysa `error`, bot yapılandırmasında analitik kapalıysa `disabled` görünür. Son sunucu sayısı 3 dakikadan eski olan bir örnek sarıyla, 10 dakikadan eski olan ise kırmızıyla işaretlenir.

> [!NOTE]
> Her şey UTC'dir. Anlık görüntüler, sayım satırları ve günlük toplamlar gece bir kez yazılır; bu yüzden Sunucular ve Özellikler sekmeleri, bot en az bir kez 00:05 UTC'yi geçtikten sonraya kadar çalışmadan boş görünür.

### Filtre çubuğu

Sekmelerin üstündeki çubuk tüm sekmeler için geçerlidir ve URL'de tutulur; bu yüzden sekme değiştirmek, sayfayı yenilemek ya da bağlantıyı paylaşmak aynı görünümü korur.

| Denetim | Ne yapar |
| --- | --- |
| Aralık | `15m`, `1h`, `6h`, `24h`, `7d`, `30d` ya da en fazla 31 günlük özel bir UTC başlangıç ve bitiş |
| karşılaştır | Destekleyen grafiklerde ve kutucuklarda aynı genişlikteki bir önceki dönemi üst üste bindirir |
| Bot | Hat tarafından bilinen örneklerden biri ya da tümü |
| Shard | Tek bir shard kimliği ya da tümü |
| sunucu kimliği | Ham tabloları ve sunucu görünümlerini tek bir sunucuya sınırlar; uygulamak için Enter'a bas |
| Yenile | Sekmede görünürken her 30 saniyede bir yeniler; düğme zorla yeniletir |
| Bağlantıyı kopyala | Tüm filtrelerle birlikte geçerli URL'yi kopyalar |

Kutucuklar, metriklerinin dökümünü gösteren bir ayrıntı açar. Grafiklerde küçük seriler **Diğer** altında toplanabilir, çalışan toplam açılıp kapatılabilir, aralık kaydırıcılarıyla yakınlaştırılabilir ve lejanttaki bir girişe sağ tıklayarak tek bir seri yalnız gösterilebilir.

## Ayarlar

Sayfanın kendisinde ayar yoktur. Yapılandırılabilecek tek şeyler uyarı kuralları ve üç bot yapılandırma anahtarıdır.

### Uyarı kuralları

Her kural tek bir metriği izler. Düzenleyici alanları şunlardır:

| Alan | Anlamı |
| --- | --- |
| Ad, Açıklama, Önem, etkin | Etiket ve `info`, `warning` ya da `critical`; webhook'un rengini ve başlığını belirler |
| Metrik, Filtreler, Şuna göre grupla | Saklanan herhangi bir metrik, isteğe bağlı etiket filtreleri ve her değeri ayrı değerlendirmek için isteğe bağlı bir etiket (örneğin `shard` başına) |
| Toplama, Pencere | 1 dakikadan 1 güne kadar `sum`, `avg`, `min`, `max`, `last`, `rate`, `count`, `p50`, `p95` ya da `p99` |
| Karşılaştırıcı, Eşik, Yüksek | `gt`, `gte`, `lt`, `lte`, `outside` (Eşik'in altında ya da Yüksek'in üstünde), `pct_change` (bir önceki temel pencereye göre yüzde), `deviates` (son N günün ortalamasına göre z skoru), `nodata` (pencerede hiçbir veri bildirilmemesi) |
| Temel değer, Yön | `pct_change` ve `deviates` için: dün ya da geçen hafta; `up`, `down` ya da `both` |
| Süre | İhlalin ne kadar sürmesi gerektiği; `immediately` beklemeyi atlar |
| Bekleme süresi | Bildirimler arasındaki en kısa süre |
| Tekrar | Hâlâ tetiklenirken yeniden bildir ya da bir kez bildir |
| Minimum örnek | Pencerede bundan az örnek varsa değerlendirmeyi atla |
| Webhook URL, Bahsedilecek rol kimliği, Thread kimliği | Bir Discord webhook'u, tetiklenince etiketlenecek isteğe bağlı bir rol, isteğe bağlı bir thread |
| Sessiz başlangıç, Sessiz bitiş | Gece yarısını aşabilen ve bu sürede hiçbir şey gönderilmeyen bir UTC aralığı |
| çözüldüğünde bildir | Grup normale döndüğünde de bildir |

Sağdaki önizleme grafiği, mutlak karşılaştırıcılar için taslak eşiği kesikli bir bant olarak çizer.

Kurallar her dakika değerlendirilir. Her grup `ok` durumundan (yalnızca Süre ayarlıysa) `pending`e, oradan `firing`e geçer ve tekrar `ok`a döner; olay günlüğü `firing`den `ok`a geçişi `resolved` olarak kaydeder. Tablodan **Sessize al** bir kuralı 1 saat susturur; API 30 güne kadar izin verir. Sessize alınmış kurallar ve sessiz pencereler yine de durum değiştirir, sadece bir mesaj göndermezler. **Test gönder**, kuralın webhook'una bir test mesajı gönderir.

### Bot yapılandırma anahtarları

Bunları `bot.yml` içinde ya da sahip `config` komutuyla ayarlayabilirsin. Hepsi varsayılan olarak açık, 30 ve boş değerlerle gelir.

| Anahtar | Anlamı |
| --- | --- |
| `analyticsEnabled` | `false` toplayıcıyı işlevsiz bırakır; Hat sekmesi `disabled` gösterir |
| `analyticsRetentionDays` | Ham komut satırlarının, sayfa görüntülemelerinin ve sunucu güvenlik olayı günlüğünün kaç gün tutulacağı |
| `analyticsDigestWebhook` | Haftalık özetin gönderileceği Discord webhook'u; boş bırakılırsa özet kapanır |

### Ne kadar süre saklanır

| Veri | Saklanma süresi |
| --- | --- |
| 1 dakikalık gruplar | 48 saat |
| 5 dakikalık gruplar | 14 gün |
| 1 saatlik gruplar | 400 gün |
| Komut çağrıları, sayfa görüntülemeleri, sunucu güvenlik olayları | `analyticsRetentionDays` |
| Hata örnekleri, sunucu başına saatlik özellik ve olay etkinliği | 90 gün |
| Uyarı olayları | 180 gün |
| Günlük anlık görüntüler, sayım, günlük toplamlar | Temizlenmez |

Ham satırlar her 15 saniyede, dakikalık gruplar her dakika yazılır; 1 dakikalık gruplar her 5 dakikada bir 5 dakikalıklara, 5 dakikalıklar saatlik gruplara katlanır ve temizleme her 6 saatte bir çalışır.

### Asla saklanmayan veriler

- Mesaj içeriği. Komut satırları komut adını, modülü, türü, sonucu, zamanlamaları ve hata durumunda istisna sınıfını ile mesajının en fazla 200 karakterini tutar.
- Kullanıcı kimlikleri. Analitikteki hiçbir şey bir komutu kimin çalıştırdığıyla anahtarlanmaz.
- İstemci IP'leri. Sayfa görüntülemeleri IP ve kullanıcı aracısının ziyaretçi karmasını, her gün değişen bir tuzla tutar; böylece bir ziyaretçi günler arasında izlenemez. `/api/`, `/cdn/`, statik dosyalara ve Analitik sayfasının kendisine yapılan istekler kaydedilmez.

İstatistik paylaşımını kapatmış sunucular ve kullanıcılar dikkate alınır: komutları yine toplamda sayılır, ancak ham satır sunucu kimliği ve sunucu boyutu olmadan yazılır.

## Kurulum adımları

1. Kontrol paneline bir bot sahibi hesabıyla giriş yap ve kenar çubuğundan **Analitik**'i aç. Yalnızca sahiplere görünür.
2. Önce **Hat**'a bak. Durum `healthy` göstermeli ve her örneğin yakın tarihli bir kalp atışı olmalı; eski bir boşaltma botun yazmadığı anlamına gelir.
3. Bir aralık seç ve birden fazla örnek çalıştırıyorsan filtre çubuğunda bir bot seç. Önceki dönemi görmek için **karşılaştır**'ı işaretle.
4. **Uyarılar**'a git, **Yeni kural**'a bas, `shard.latency` gibi bir metrik seç; `max` ile 5 dakika, `gt` ile limitin, `shard`'a göre grupla, bir webhook yapıştır ve kaydedilen satırda **Test gönder**'e bas.
5. Bot yapılandırmasında `analyticsDigestWebhook` değerini ayarla, ardından Pazartesi gönderisinin nasıl görüneceğini görmek için **Özeti şimdi gönder**'e bas.
6. **Sunucular**, **Özellikler** ve sayım serileri için bir gece sonra geri dön.

## Komutlar

Analitik sayfası yalnızca kontrol panelindedir; buna karşılık gelen bir bot modülü yoktur. Sahip `config` komutu yukarıdaki üç anahtarı değiştirir ve birkaç sahip komutu sohbette ilgili konuları kapsar. Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gereken | Amaç |
| --- | --- | --- | --- |
| `config bot analyticsEnabled false` | `conf` | Bot sahibi | Analitik kaydını durdur; tekrar başlatmak için `true` |
| `config bot analyticsRetentionDays 14` | `conf` | Bot sahibi | Ham satırların ne kadar tutulacağını değiştir |
| `config bot analyticsDigestWebhook <url>` | `conf` | Bot sahibi | Pazartesi özetinin gönderileceği yer |
| `stats` | | Kimse | Bot sürümü, beş saniyede çalıştırılan komutlar, bellek, önbellek sayıları, shard ve çalışma süresi |
| `commandstats` | `cstats` | Bot sahibi | En çok kullanılan komut, modül, sunucu ve kullanıcı |
| `shardstats` | | Bot sahibi | Her shard'ın durumu |

## İpuçları ve dikkat edilecekler

- Sayfa sahipliği botla kontrol eder; bu yüzden bir bot örneğinde sahip olan ama diğerinde olmayan bir hesap ikinci örnekte yönlendirilir.
- Özet Pazartesi günleri 09:00 UTC'den sonra gönderilir ve son yedi günü önceki yedi günle karşılaştırır: sunucular, komutlar, hatalar, olaylar, yeni ve kaybedilen sunucular, sayfa görüntülemeleri, yapay zeka token'ları, müzik parçaları ve ilk beş komut, hata ve özellik.
- Uzun aralıklardaki seriler saatlik gruplardan gelir; bu yüzden yüzdelik değerler düzleşir. Dakika ayrıntısını görmek için aralığı daralt; dakika verisi yalnızca son 48 saat için vardır.
- Toplayıcının bellekteki tamponu boşaltılmadan dolarsa, o aralıkta fazla ham komut satırları düşürülür; toplamlar saymaya devam eder. Hat sekmesinde artan **Bekleyen satırlar** değeri bunun işaretidir.
- Uyarı kurallarının bir Discord webhook URL'si olmalıdır; başka bir şey kaydetmede reddedilir.
- Tahmini yapay zeka maliyeti yalnızca bilinen bir liste fiyatı olan modelleri kapsar; bu yüzden toplam bir alt sınırdır.

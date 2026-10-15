---
title: Etkinlik İstatistikleri
slug: serverstats
summary: Sunucunun tamamı, bir üye veya bir kanal için doksan güne kadar her aralıkta mesajlar, sesli kanal süresi, oyunlar ve üye büyümesi; grafikler, sıralamalar, dışa aktarımlar ve gizlilik tercihi ile.
icon: fa-chart-simple
category: Analytics
dashboard: /dashboard/serverstats
module: ServerStats
tags: [activity, stats, statistics, statbot, voice time, games, presence, lookback, top chatters, charts, member growth, status, snapshots, privacy, opt out, etkinlik, istatistik, sesli kanal süresi, oyunlar, üye büyümesi, sıralama, grafik, gizlilik, katılımdan çıkma]
related: [messagestats, statroles, liveboards, statchannels, invites]
---

## Ne işe yarar

Bot zaten mesajları sayıyordu. Etkinlik İstatistikleri ise sesli kanal süresi, oyunlar ve uygulamalar, saatlik üye ve durum anlık görüntüleri ekler; ayrıca bunların herhangi birini bir aralık üzerinden sorgulamanın yolunu sunar: son gün, hafta, ay, doksan güne kadar veya tüm zamanlar. Her şey kontrol panelinde, komut olarak, grafik olarak, CSV olarak ve istatistik rolleri, canlı panolar, raporlar ve istatistik kanalları için kullanılabilir.

## Neler takip edilir

| Veri | Nasıl |
| --- | --- |
| Mesajlar | Sayılan her mesaj zaman damgasıyla, doksan gün saklanır; ayrıca üye ve kanal başına ömür boyu toplamlar |
| Sesli kanal süresi | Her üye ve kanal için bir segment; üye kanal değiştirdiğinde, susturulduğunda, sağırlaştırıldığında, yayın açtığında veya kamerasını açtığında bölünür; doksan gün saklanır, ayrıca ömür boyu toplamlar |
| Oyunlar ve uygulamalar | Her üye ve her etkinlik için bir segment (oynuyor, yayın yapıyor, dinliyor, izliyor, yarışıyor); doksan gün saklanır, ayrıca ömür boyu toplamlar. Varsayılan olarak kapalı |
| Anlık görüntüler | Her saat başı üye, insan, bot, çevrimiçi, boşta, rahatsız etmeyin, çevrimdışı ve sesli kanaldaki sayıları; doksan gün saklanır |
| Katılımlar ve ayrılmalar | Her katılım ve ayrılma zaman damgasıyla |

Doksan güne kadarki aralıklar zaman damgalı verileri okur. **Tüm zamanlar** ömür boyu toplamları okur; bu yüzden doksan günlük veriler eskidikten sonra da çalışmaya devam eder.

## Oyunlar ve uygulamalar

Oyun takibi, en ağır takipçi olduğu için siz açana kadar kapalıdır. Açıldığında bot her üyenin durumunu izler ve her oyunun, yayının, Spotify oturumunun veya izlenen uygulamanın ne kadar sürdüğünü kaydeder.

- **Etkinlikleri doğrula** (varsayılan olarak açık) yalnızca Discord'un kendisinin onayladığı etkinlikleri sayar: kayıtlı bir uygulama kimliğine sahip olanlar, Spotify ve yayınlar. Değiştirilmiş bir istemci her şeyi oynuyormuş gibi gösterebilir; bu yüzden bu açıkken adı yazılmış sıradan etkinlikler yok sayılır.
- **Etkinlik filtresi**, oyun adlarından oluşan bir listedir; ya **kara liste** (listelenen oyunlar yok sayılır) ya da **beyaz liste** (yalnızca listelenen oyunlar sayılır) olarak çalışır.
- Özel durumlar hiçbir zaman sayılmaz.

## Kontrol paneli sekmeleri

| Sekme | Gösterdikleri |
| --- | --- |
| Genel Bakış | Mesajlar, sesli kanal süresi, mesaj yazanlar, katılımlar, ayrılmalar, net büyüme, şu an üyeler, en çok konuşan, en çok sesli kanalda vakit geçiren, en yoğun kanal ve en çok oynanan oyun; ayrıca mesajlar, sesli saatler, üyeler, üye durumu ve katılım/ayrılma grafikleri |
| Sıralamalar | Üyeler ve kanallar mesaj, ses veya oyun süresine göre sıralı; ayrıca oyuncu sayılarıyla en çok oynanan oyunlar, CSV olarak dışa aktarılabilir. Bir üye, kanal veya oyuna tıklayarak açabilirsin |
| Üye ve Kanal | Bir üyenin mesajları, sesli kanal süresi, sıraları, ömür boyu toplamları, sık kullandığı kanallar ve oyunları; bir kanalın etkinliği ve en çok katılan üyeleri; herhangi bir oyun için **Kim oynuyor** |
| Ayarlar | Her takipçi, varsayılan aralık, mesaj bekleme süresi, botlar, sayılmayan ses durumları, yoksayılan kanallar, roller ve üyeler ile etkinlik filtresi |

## Ayarlar

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Varsayılan aralık | 14 gün | Komutların ve sayfanın aralık verilmediğinde kullandığı süre |
| Mesaj bekleme süresi | 0 | Aynı üyeden sayılan iki mesaj arasındaki saniye. Spam'in sayıları şişirmesini önler |
| Sesli kanal süresini takip et | açık | Ses segmentlerinin kaydedilip kaydedilmeyeceği |
| Saatlik anlık görüntüler | açık | Üye ve durum sayılarının her saat örneklenip örneklenmeyeceği |
| Botları say | kapalı | Bot hesaplarının dahil edilip edilmeyeceği |
| Oyun ve uygulamaları takip et | kapalı | Varlık etkinliklerinin kaydedilip kaydedilmeyeceği |
| Etkinlikleri doğrula | açık | Yalnızca Discord'un onayladığı etkinlikleri say |
| Sayılmayan ses durumları | yok | Kendi kendine susturulmuş, kendi kendine sağırlaştırılmış, sunucu tarafından susturulmuş, sunucu tarafından sağırlaştırılmış, AFK kanalı, yalnız, yayın yapıyor, kamera açık durumlarından herhangi biri |
| Yoksayılan kanallar, roller, üyeler | yok | Bunlardan hiçbir şey sayılmaz |

## Gizlilik

Herhangi bir üye, takipten çıkmak için `statsprivacy` (veya `/serverstats privacy`) komutunu çalıştırabilir. Kayıtlı mesajları, sesli kanal süreleri ve oyun süreleri, bot ile birlikte olduğu her sunucuda silinir ve tekrar açana kadar yeni hiçbir şey kaydedilmez. Sunucu yöneticileri bunu geçersiz kılamaz.

## Komutlar

Bunları sunucunun önekiyle çalıştır (değiştirmediysen `.`). Her komut `/serverstats` altında da vardır. `days` aralıktır; 0 tüm zamanlar demektir ve atlanırsa sunucunun varsayılanı kullanılır.

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `serveractivity [days]` | `sstats` | Gerekmez | Sunucu genel bakışı |
| `useractivity [@user] [days]` | `ustats`, `mystats` | Gerekmez | Bir üyenin mesajları, sesli kanal süresi, sıraları, ömür boyu toplamları, en çok kullandığı kanallar ve oyunları |
| `channelactivity [#channel] [days]` | `cstats` | Gerekmez | Bir kanalın etkinliği ve en çok katılan üyeleri |
| `activitytop [Messages/Voice/Activity] [days] [@role]` | `topchatters`, `topvoice` | Gerekmez | Üyeleri sırala |
| `activitytopchannels [Messages/Voice] [days]` | `topchannels` | Gerekmez | Kanalları sırala |
| `topgames [days]` | `games` | Gerekmez | En çok oynanan oyunlar ve uygulamalar |
| `whoplays <game>` | | Gerekmez | Şu an bir oyunda kimler var ve kim en çok oynadı |
| `activitychart [Messages/Voice/Members/Status/Joins/Leaves/Growth/InVoice/Activities] [days]` | `graph` | Gerekmez | Bir grafik görseli |
| `activityexport [Messages/Voice/Activity] [days]` | | Sunucuyu Yönet | Bir CSV sıralaması |
| `statssettings` | | Sunucuyu Yönet | Ayarları göster |
| `statslookback <days>`, `statscooldown <seconds>` | `lookback` | Sunucuyu Yönet | Varsayılan aralık ve mesaj bekleme süresi |
| `statstrackvoice`, `statstracksnapshots`, `statscountbots`, `statstrackactivities`, `statsverifyactivities` | `trackvoice`, `trackgames` | Sunucuyu Yönet | Her takipçiyi aç veya kapat |
| `statsignorevoicestate <state>` | | Sunucuyu Yönet | Bir ses durumunun sayılıp sayılmayacağını aç veya kapat |
| `statsignore <#channel, @role or @user>`, `statsignored` | | Sunucuyu Yönet | Hariç tutmalar |
| `statsactivityfiltermode <Whitelist/Blacklist>`, `statsactivityfilter <game>`, `statsactivityfilters` | `gamefilter` | Sunucuyu Yönet | Etkinlik filtresi |
| `statsprivacy` | `optoutstats` | Gerekmez | Her yerde takipten çık veya tekrar takibe katıl |

## İpuçları ve dikkat edilecekler

- Üye ve durum grafikleri, anlık görüntüler açıldıktan bir saat sonra dolmaya başlar; öncesine ait geçmiş yoktur.
- Sesli kanal süresi yalnızca bot çalışırken sayılır. Yeniden başlatma her oturumu kapatıp yeniden açar; hiçbir şey kaybolmaz, ama segment sınırları kayar.
- Bir kanalı hariç tutmak, o kanalın geçmişini de tüm sorgulardan gizler; bu yüzden eski sayılar da değişir.
- Mesaj sayımının kendisi açık olmalıdır (Mesaj İstatistikleri sayfasındaki anahtar), yoksa mesaj sayıları burada görünmez.
- Oyun adları filtrede ve `whoplays` komutunda büyük/küçük harf duyarsız eşleşir.

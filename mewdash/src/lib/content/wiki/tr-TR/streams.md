---
title: Yayın Uyarıları
slug: streams
summary: Twitch, YouTube, Kick ve Picarto'daki yayıncıları takip et; yayına geçtiklerinde ya da yayını bitirdiklerinde seçtiğin bir kanala duyuru gönder.
icon: fa-video
category: Community
dashboard: /dashboard/streams
module: Searches
tags: [streams, stream alerts, go live, live notifications, twitch, youtube, kick, picarto, trovo, streamadd, streamtemplate, yayın, yayın uyarısı, canlı yayın, canlı bildirim, yayına geçti]
related: [twitch, utility, administration]
---

## Ne işe yarar

Yetkililer bir yayın URL'si yapıştırır ve bir Discord kanalı seçer. Bot bunun ardından yayıncının platformunu yoklar ve yayın çevrimdışıdan çevrimiçine geçtiğinde seçilen kanala bir yayına geçti mesajı gönderir. Varsayılan olarak bu, yayıncının adının yayına bağlandığı bir embed'dir; yayın başlığını, oyunu ya da kategoriyi, izleyici sayısını, yayıncının avatarını ve bir önizleme görselini içerir.

Varsayılan embed'i kendi mesajınla değiştirebilirsin. Takip edilen her yayına uygulanan sunucu genelinde bir şablon vardır ve her yayının kendi çevrimiçi mesajı ve kendi çevrimdışı mesajı da olabilir. Hepsi aşağıda listelenen `%stream.*%` yer tutucularını kabul eder ve düz metin ya da kontrol panelinin embed düzenleyicisinde oluşturulmuş tam bir embed olabilir.

Çevrimdışı bildirimleri varsayılan olarak kapalıdır. Açarsan bot, takip edilen bir yayın bittiğinde de paylaşım yapar; yayın için bir çevrimdışı mesajı varsa onu, yoksa sunucu şablonunu, o da yoksa "Offline" gösteren varsayılan embed'i kullanır.

> [!NOTE]
> Yayın Uyarıları, başkalarının yayınlarını Discord'una duyurur. Ayrı olan Twitch Bot özelliği ise botu kendi Twitch sohbetine komutlar, zamanlayıcılar ve olaylar için bağlar. Bu konuda Twitch Bot makalesine bak.

## Neden kullanmalısın

- Bir topluluk sunucusu, yayıncılarından biri yayına başladığında yanan bir "şimdi canlı" kanalı istiyor.
- Bir yayıncının kendi Discord'u, başlık ve kategoriyle otomatik bir bildirim istiyor; kimsenin elle paylaşmasına gerek kalmasın.
- Bir e-spor ya da etkinlik sunucusu, Twitch ve Kick'teki birçok turnuva kanalını tek bir yerden takip ediyor.
- Bir sunucu, yayın bittiğinde temiz bir "yayın sona erdi" bildirimi istiyor ki yayına geçti paylaşımı eski görünmesin.

## Desteklenen platformlar

Bot platformu verdiğin URL'den seçer. Yalnızca bu kalıplardan birine uyan URL'ler takip edilebilir.

| Platform | URL biçimi | Notlar |
| --- | --- | --- |
| Twitch | `twitch.tv/username` | Twitch Helix API'sini kullanır. Başlık, oyun, izleyici, avatar ve önizleme hepsi doldurulur. |
| YouTube | `youtube.com/@handle` veya `youtube.com/channel/ID` | Kanalın canlı sayfası kazınarak okunur, bu yüzden veriler Twitch'e göre daha eksik olabilir. Kanal kimliği URL'si, kullanıcı adına dönüştürülür. |
| Kick | `kick.com/slug` | Kick'in herkese açık API'sini kullanır. Avatar yer tutucusu kanal banner resmiyle doldurulur. |
| Picarto | `picarto.tv/name` | Picarto API'sini kullanır. |

Trovo ve Facebook kontrol panelindeki platform listesinde ve saklanan verilerde görünür, ancak mevcut kodda Trovo için çalışan bir URL eşleştirici ve Facebook için bir sağlayıcı yoktur; bu yüzden bu URL'leri takip etmeye çalıştığında reddedilirler.

## Kontrol nasıl yapılır

Bot her platform için bir izleyici tutar ve takip edilen her kanalın durumunu turlar arasında üç saniye bekleyerek her platformdan sorar. Bir yayın, çevrimdışıyken ilk kez canlı görüldüğünde çevrimiçi olarak duyurulur.

Çevrimdışına geçiş daha dikkatli ele alınır, çünkü Twitch bazen canlı bir yayın sırasında kısa bir çevrimdışı görüntüsü bildirir. Çevrimdışı bildirimi gönderilmeden önce yayının art arda iki kontrolde çevrimdışı görülmesi gerekir. Aradaki sürede tekrar çevrimiçi olursa hiçbir şey paylaşılmaz.

Her otuz dakikada bir bot, platform sorgularının on iki saatten uzun süredir başarısız olduğu yayınları arar (örneğin silinmiş ya da adı değiştirilmiş bir kanal) ve bunları takip eden her sunucudan kaldırır.

Takip edilen bir yayının bildirim kanalı silinmişse, biri `streamlist` çalıştırdığında yayın listeden düşer.

## Gönderilen mesaj

Bir yayın durum değiştirdiğinde bot mesajı şu sırayla seçer:

1. Yeni duruma uyan yayının kendi **Çevrimiçi Mesajı** ya da **Çevrimdışı Mesajı** mesajı.
2. Sunucu genelindeki **Genel Yayın Mesajı** şablonu.
3. Yerleşik embed.

Geçerli embed JSON'u olmayan bir yayın mesajı, yerleşik embed'in üstüne düz metin olarak gönderilir. Embed JSON'u olmayan bir genel şablon kendi başına düz metin olarak gönderilir. Geçerli embed JSON'u olan mesajlar, yani kontrol panelinin embed oluşturucusunun ürettikleri, tasarlandığı gibi düğmeleriyle birlikte aynen gönderilir.

Yerleşik embed; yayıncının adını bağlantılı başlık olarak, yayın başlığını yazar satırı olarak, Online ya da Offline gösteren bir **Durum** alanını, bir **Viewers** alanını, oyun ya da kategori için bir **Yayın yapıyor** alanını, avatarı küçük resim olarak ve önizlemeyi büyük görsel olarak gösterir. Canlıyken yeşil, çevrimdışıyken kırmızıdır.

### Yer tutucular

Yayın mesajlarında yalnızca bu küme değiştirilir. Yer tutucular sayfasındaki genel sunucu ve kullanıcı yer tutucuları burada kullanılamaz.

| Yer tutucu | Değer |
| --- | --- |
| `%stream.name%` | Yayıncının görünen adı ya da `Unknown` |
| `%stream.username%` | Yayıncının giriş adı ya da kullanıcı adı |
| `%stream.url%` | Yayına doğrudan bağlantı, her zaman `https://` ile |
| `%stream.title%` | Mevcut yayın başlığı ya da `No title` |
| `%stream.game%` | Oyun ya da kategori ya da `No category` |
| `%stream.viewers%` | Binlik ayraçlı izleyici sayısı ya da çevrimdışıyken `-` |
| `%stream.platform%` | `Twitch` veya `Youtube` gibi platform adı |
| `%stream.avatar%` | Yayıncının avatar URL'si |
| `%stream.preview%` | Yayın önizlemesinin ya da küçük resminin URL'si |
| `%stream.status%` | `Online` ya da `Offline`, her biri renkli bir daireyle başlar |
| `%stream.channelid%` | Platforma özgü kanal kimliği, platform bunu sağlıyorsa |

> [!EXAMPLE]
> Basit bir genel şablon: `%stream.name% is live on %stream.platform% playing %stream.game%: %stream.title% %stream.url%`

## Ayarlar

Yayın Bildirimleri sayfasında dört sekme vardır: **Yayınlar**, **Yayını Takip Et**, **Ayarlar** ve **İstatistikler**.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Bildirim kanalı | yok | Yeni bir yayının uyarılarının gideceği kanal; **Yayını Takip Et** sekmesinde seçilir |
| Yayın URL'si | yok | Takip edilecek bağlantı; **Yayını Takip Et** sekmesinde |
| Çevrimiçi Mesajı | yok | Yayın canlıya geçtiğindeki yayına özel mesaj; **Yayınlar** sekmesindeki yayın kartından düzenlenir |
| Çevrimdışı Mesajı | yok | Yayın bittiğindeki yayına özel mesaj; aynı karttan düzenlenir |
| Genel Yayın Mesajı | yok | Bir yayının kendi mesajı yoksa kullanılan sunucu genelindeki şablon; **Ayarlar** sekmesinde |
| Çevrimdışı Bildirimleri | kapalı | Takip edilen yayınlar çevrimdışı olduğunda bot paylaşım yapsın mı; **Ayarlar** sekmesinde |

**Yayınlar** sekmesi, takip edilen her yayını platformu, kanalı ve eklendiği tarihle listeler; her kartta bir silme düğmesi ve bir **Clear All** düğmesi bulunur. **İstatistikler** toplam yayını, benzersiz yayıncıları, bildirimli kanalları, kullanımdaki platformları ve platforma göre dökümü gösterir.

Bir sunucu en fazla on yayını takip edebilir. On birinci eklemeye çalışmak başarısız olur.

## Kurulum adımları

1. Kontrol panelinde **Yayın Uyarıları**'nı aç ve **Yayını Takip Et** sekmesine geç.
2. **Bildirim kanalı**'nı seç, **Yayın URL'si**'ni yapıştır ve **Yayını Takip Et**'e tıkla.
3. **Ayarlar** sekmesinde, yukarıdaki yer tutucuları kullanarak embed düzenleyicide bir **Genel Yayın Mesajı** oluştur, sonra **Mesajı Kaydet**'a tıkla. Yerleşik embed'i korumak istersen bu adımı atla.
4. Yayın bittiğinde de paylaşım istiyorsan **Çevrimdışı Bildirimleri**'ni aç.
5. **Yayınlar** sekmesine dön, bir yayının kartını aç ve genel şablondan farklı bir şey gerekiyorsa ona kendi **Çevrimiçi Mesajı** ya da **Çevrimdışı Mesajı**'nı ver.
6. Botun yayını okuyabildiğini doğrulamak için `streamcheck <url>` ile dene, sonra bir sonraki yayına geçişi bekle.

## Komutlar

Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Diğer adlar | Gereken yetki | Amaç |
| --- | --- | --- | --- |
| `streamadd <url>` | `sta`, `stadd` | Mesajları Yönet | Bir yayını takip eder ve uyarılarını bulunulan kanala gönderir |
| `streamremove <index>` | `strm` | Mesajları Yönet | `streamlist` içindeki o konumdaki yayını takipten çıkarır |
| `streamsclear` | `stclear` | Yönetici | Sunucudaki tüm yayınları takipten çıkarır |
| `streamlist` | `stl`, `streamslist` | Kimse | Takip edilen yayınların numaralı, platform ve kanal bilgileriyle sayfalı listesi |
| `streamoffline` | `sto`, `stoff` | Mesajları Yönet | Çevrimdışı bildirimlerini açar/kapatır |
| `streammessage <index> <message>` | `stm`, `stmsg` | Mesajları Yönet | Bir yayının çevrimiçi mesajını ayarlar; boş mesaj sıfırlar |
| `streamofflinemessage <index> <message>` | `stofmsg`, `stoffline` | Mesajları Yönet | Bir yayının çevrimdışı mesajını ayarlar; boş mesaj sıfırlar |
| `streamtemplate [template]` | `stt`, `sttemplate` | Mesajları Yönet | Genel şablonu ve yer tutucuları gösterir, yeni bir şablon ayarlar ya da temizlemek için `reset` kullanır |
| `streamcheck <url>` | `stc` | Kimse | Bir yayının şu an canlı olup olmadığını ve izleyici sayısını bildirir |

## İpuçları ve dikkat edilecekler

- `streamadd` komutu çalıştırdığın kanalı kullanır. Farklı bir kanal seçmek istersen kontrol panelini kullan.
- Yayın numaraları `streamlist` içinden gelir ve 1'den başlar. Bir yayın kaldırıldığında kayarlar; numarayla silmeden önce listeye bak.
- Botun bildirim kanalında Mesaj Gönder ve Bağlantı Yerleştir iznine ihtiyacı var. Botun göremediği bir kanala giden uyarılar, bir günlük kaydıyla atlanır.
- Sunucuda, aynı Twitch kanalı için bir yayına geçiş kanalı ayarlanmış bir Twitch Bot bağlıysa, o entegrasyon devralır ve Yayın Uyarıları o yayın için sessiz kalır; böylece iki paylaşım olmaz.
- YouTube verileri bir API'den değil kazınarak okunur. Başlıklar, kategoriler ve izleyici sayıları eksik olabilir ya da `Live Stream` olarak okunabilir.
- Sorgularının on iki saat boyunca başarısız olduğu yayınlar otomatik olarak kaldırılır. Bir yayıncı kanal adını değiştirirse yeni URL'yi takip et.

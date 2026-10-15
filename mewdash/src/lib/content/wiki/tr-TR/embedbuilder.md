---
title: Embed'ler
slug: embedbuilder
summary: Embed, düğme ve seçim menüleriyle zengin Discord mesajları oluştur, bunları şablon olarak kaydet, bir kanala gönder ve bot'un özel mesaj kabul ettiği her yerde aynı JSON'u yeniden kullan.
icon: fa-link
category: Actions
dashboard: /dashboard/embedbuilder
module: Utility
tags: [embed, embed builder, json, say, template, webhook, persona, buttons, select menu, custom message, embed oluşturucu, şablon, webhook, persona, düğmeler, seçim menüsü, özel mesaj]
related: [multigreets, chat-triggers, afk, feeds, giveaways, suggestions]
---

## Ne işe yarar

Embed oluşturucu, Discord mesajları için görsel bir düzenleyicidir. Bir başlık, açıklama, renk, alanlar, resimler ve isteğe bağlı düğmeler ya da seçim menüleri doldurursun, canlı önizlemeyi izlersin ve sonunda bir JSON bloğu alırsın. Bu JSON, bot'un evrensel mesaj biçimidir. Mesajı göndermek için `say` komutuna yapıştır, adlandırılmış bir şablon olarak kaydet ya da özel mesaj kabul eden herhangi bir özelliğe ekle; örneğin karşılama mesajları, sohbet tetikleyicileri, AFK yanıtları, besleme güncellemeleri ya da çekiliş kazananına giden DM.

Şablonlar kişisel olabilir; yalnızca sen görürsün ve her sunucuda kullanabilirsin. Ya da bir sunucuyla paylaşılabilir; böylece her yetkili onları yükleyebilir. Kontrol paneli, bitmiş bir mesajı doğrudan bir kanala gönderebilir; isteğe bağlı olarak özel bir ad ve avatar ile bir webhook üzerinden, persona adı verilen bir gönderici olarak.

Üyeler oluşturucuyla hiç etkileşime girmez. Sadece oluşturucunun ürettiği mesajları görürler.

## Neden kullanırsın

- Düzgün biçimlendirilmiş bir kurallar ya da bilgi gönderisi yaz ve sonra `edit` ile güncelle.
- Bir karşılama mesajını bir kez tasarla, sonra JSON'u greets'e yapıştır.
- Yetkililerin tutarlı görünümde duyurular yapabilmesi için bir dizi duyuru şablonu tut.
- Sohbet tetikleyicilerini çalıştıran düğmeler ya da tetikleyiciler üzerinden rol veren bir seçim menüsü ekle.
- Webhook erişimi vermeden kendi avatarıyla "Server News" adıyla gönder.

## JSON biçimi

Ayrıştırıcı metindeki ilk `{` karakterini arar ve eşleşen `}` karakterine kadar okur. JSON nesnesi yoksa ya da ayrıştırılamazsa tüm metin düz içerik olarak alınır. Özellik adları büyük-küçük harf duyarlı değildir.

| Anahtar | Tür | Anlamı |
| --- | --- | --- |
| `content` | metin | Embed'lerin üstünde gösterilen düz metin |
| `embed` | nesne | Tek bir embed. Varsa `embeds` yok sayılır. |
| `embeds` | dizi | En fazla on embed nesnesi |
| `components` | dizi | Düğmeler ve seçim menüleri |

Bir embed nesnesi `title`, `description`, `url`, `color`, `author` (`name`, `url`, `icon_url`), `footer` (`text`, `icon_url`), `thumbnail` (`url`), `image` (`url`) ve `fields` (`name`, `value`, `inline` içeren dizi) kabul eder. `color` bir sayı ya da `#5865F2` gibi bir metin olabilir. Alan adları 256 karaktere, değerler 1024 karaktere kırpılır. Tam bir mutlak adres olmayan her URL, tüm mesajın başarısız olmasına neden olmak yerine atılır. `timestamp` anahtarı kabul edilir ama gösterilmez.

Bir bileşen `row` (hangi satırda duracağı), `displayName` ve ya bağlantı düğmesi için `url` ya da bir sohbet tetikleyicisine bağlı düğme için `id` içerir. `style` Discord'un dört düğme stili için 1 ile 4 arasındadır, `emoji` isteğe bağlıdır. Bir seçim menüsü için `isSelect` değerini true yap, ardından `options` ver (her biri `id`, `name`, `description`, `emoji` içerir) ve 0 ile 25 arasında `minOptions` ve `maxOptions` belirle. Bir kuralı bozan bir bileşen, hatası etiket olarak yazılmış devre dışı bir kırmızı düğme olarak gösterilir; böylece Discord'da neyin yanlış gittiğini görebilirsin.

> [!EXAMPLE]
> `{"content": "Welcome %user.mention%!", "embeds": [{"title": "Read the rules", "description": "See %channel.mention%", "color": "#57F287"}]}`

### Yer tutucular

Oluşturucudaki **%** düğmesi, yer tutucuları yer tutucular sayfasından (kullanıcı, sunucu, kanal, bot, zaman ve benzerleri) ekler. Kontrol paneli bunları değiştirmez: **Gönder** sekmesinden gönderilen bir mesaj, yer tutucu metnin kendisiyle gider. Bot, JSON bir komuttan ya da özellikten geçtiğinde yer tutucuları değiştirir; örneğin `say`, `embedpreview`, greets ve tetikleyiciler. Her özellik, genel yer tutucuların üstüne kendi kümesini ekler, örneğin `%afk.message%` ya da `%giveawayitem%`.

## Şablonlar

Bir şablon, bir ad ile JSON'dan oluşur. İki kapsam vardır.

| Kapsam | Kimler görür | Nasıl oluşturulur |
| --- | --- | --- |
| Kişisel | Yalnızca sen; her sunucuda ve DM'lerde | `embedsave` ya da kontrol panelinde paylaşım işaretlenmeden **Kaydet** |
| Sunucu paylaşımlı | O sunucuda erişimi olan herkes | `guildembedsave` (Mesajları Yönet) ya da **Bu sunucudaki herkesle paylaş** işaretliyken **Kaydet** |

Adlar kendi kapsamlarında benzersiz olmalıdır. `embedpreview <name>` önce senin kişisel şablonuna, sonra sunucunun paylaşılan şablonuna bakar, yer tutucuları değiştirir ve mevcut kanalda gönderir.

Bazı komutlar ham JSON yerine bir şablon referansı kabul eder: mesaj olarak `{template:name}` ya da `{t:name}` yaz. `multigreetmessage` bunu destekler. Kaydedilen, referans değil çözülmüş JSON'dur; bu yüzden şablonda sonradan yapılan düzenlemeler karşılamayı güncellemez.

## Kontrol paneli sayfası

Sayfanın başlığı **Discord Embed Oluşturucu**'dır ve altı sekmesi vardır. Yanında bir **Canlı Önizleme** ve bir **Sorunlar** paneli bulunur. Başlıkta **Geri al**, **Yinele**, **Düzenlemeleri iptal et** ve **JSON'u kopyala** düğmeleri yer alır.

| Sekme | Orada ne yaparsın |
| --- | --- |
| Şablonlar | Başlangıç noktalarından bir galeriden seç ya da **Sıfırdan Başla** |
| Düzenleyici | **Mesaj İçeriği** ve en fazla on embed. Her embed'de başlık, açıklama, URL, renk, yazar, alt bilgi, en fazla 25 alan, küçük resim ve resim vardır; karakter sayaçlarıyla. |
| Bileşenler | En fazla beş satır ve 25 bileşen. Düğme (metin, stil, emoji, URL ya da tetikleyici) ve seçim menüsü (yer tutucu, tetikleyici bağlantılı seçenekler) ekle. |
| JSON | Ham yük. **Oluşturucudan Yenile** yeniden üretir; **Oluşturucuya Uygula** yapıştırılan JSON'u yükler; tam bir yük ya da tek bir embed nesnesi olabilir. |
| Kayıtlı | Bir ad ve paylaşım kutusu ile **Mevcut Embed'i Kaydet**; ardından **Bu sunucuda paylaşılanlar** ve **Embed'lerim** listeleri, **Yükle** ve **Sil** ile |
| Gönder | Bir kanal seç, orada yetkilerini gözden geçir, isteğe bağlı olarak bir persona ya da özel ad ve avatar URL'si ile bir webhook üzerinden gönder, sonra **Mesaj Gönder**e bas |

### Gönderme ve personalar

**Gönder** sekmesi yalnızca hem senin hem de botun yazabildiği kanalları listeler. Embed göndermek ikiniz için de Bağlantı Yerleştir iznini gerektirir. Herkesi Etiketle iznin yoksa, everyone, here ve rol etiketleri kaldırılır ve sekme bunu uyarır.

Webhook ile gönderim, senin ve botun Webhook'leri Yönet iznine ihtiyaç duyar. **Persona**, kaydedilmiş bir ad ve avatardır; kişisel olabilir ya da sunucuyla paylaşılabilir; **Yönet** persona listesini açar. Yüklenmiş bir resmi olan personalar her kanalda kendi webhook'una sahip olur; bu yüzden bir kanal en fazla on beş tane tutabilir. **Özel** seçeneği bunun yerine bir görünen ad ve bir avatar bağlantısı alır. Her gönderim denetim günlüğüne kaydedilir.

Aynı oluşturucu, diğer kontrol paneli sayfalarında (greets, tetikleyiciler ve diğerleri) yalnızca **Düzenleyici**, **Bileşenler**, **JSON** ve **Kayıtlı** sekmeleriyle bir açılır pencere olarak da açılır.

## Ayarlar

Oluşturucunun sunucu ayarı yoktur. Her şey mesaj ya da şablon bazındadır.

## Kurulum adımları

1. Kontrol panelinde **Embed'ler**i aç ve bir şablon seç ya da **Sıfırdan Başla**.
2. **Düzenleyici** sekmesinde içeriği yaz ve embed'i doldur. Discord'un reddedeceği her şey için **Sorunlar** paneline bak.
3. Gerekirse **Bileşenler** sekmesinde düğme ya da menü ekle; her birini bir sohbet tetikleyicisine ya da bir URL'ye bağla.
4. **Kayıtlı** sekmesine git, bir ad ver, yetkililerin kullanması gerekiyorsa **Bu sunucudaki herkesle paylaş** kutusunu işaretle ve **Kaydet**e bas.
5. Şimdi göndermek için **Gönder** sekmesini aç, bir kanal seç ve **Mesaj Gönder**e bas. Başka bir yerde kullanmak için **JSON'u kopyala**ya bas ve diğer özelliğe yapıştır.
6. Discord'da `embedpreview <name>` komutu, kaydedilmiş bir şablonu yer tutucuları doldurulmuş olarak gönderir.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (`.`, değiştirmediysen).

| Komut | Diğer adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `say [#channel] <text or JSON>` | | Mesajları Yönet | Metin ya da embed JSON'unu bot olarak gönder; yer tutucular değiştirilir. Mesajı bir `.txt` eki de sağlayabilir. |
| `edit #channel <message id> <text or JSON>` | | Mesajları Yönet | Botun gönderdiği bir mesajın içeriğini değiştir |
| `embedsave <name> <JSON>` | `esave` | Yok | Kişisel bir şablon kaydet |
| `embedlist` | `elist` | Yok | Kişisel şablonlarını listele |
| `embeddelete <name>` | `edel`, `edelete` | Yok | Kişisel şablonlarından birini sil |
| `guildembedsave <name> <JSON>` | `gesave`, `gembedsave` | Mesajları Yönet | Bu sunucuyla paylaşılan bir şablon kaydet |
| `guildembedlist` | `gelist`, `gembedlist` | Yok | Sunucunun paylaşılan şablonlarını listele |
| `guildembeddelete <name>` | `gedel`, `gembeddelete` | Mesajları Yönet | Paylaşılan bir şablonu sil |
| `embedpreview <name>` | `epreview`, `eprev` | Yok | Kaydedilmiş bir şablonu mevcut kanalda gönder |

## İpuçları ve dikkat edilecekler

- `say`, senin kendi etiketleme haklarını yansıtır: Herkesi Etiketle iznin yoksa bot senin yerine herkesi ya da rolleri etiketlemez.
- Yalnızca bir başlığı olan bir embed yine de gönderilir, ama kontrol paneli başlık, açıklama, alan ya da içerik eklenene kadar kopyalamana ya da göndermene izin vermez.
- Tetikleyiciye bağlı düğmeler yalnızca, referans verdikleri tetikleyici kimliğinin ait olduğu sunucuda çalışır. Paylaşılan bir şablonu başka bir sunucuda yüklemek bu düğmeleri bozuk bırakır.
- Hatalı resim, küçük resim, yazar ve alt bilgi URL'leri sessizce atılır. Bir resim görünmüyorsa URL'nin `https://` ile başlayıp başlamadığını kontrol et.
- Discord bir mesaja en fazla on embed, embed başına 25 alan, beş bileşen satırı ve satır başına beş düğme izin verir. Oluşturucu aynı sayıları zorunlu kılar.
- Bir personayı silmek, kanallarda oluşturduğu webhook'ları silmez. Gerekirse bunları kanalın entegrasyon ayarlarından temizle.

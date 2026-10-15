---
title: Durum Rolleri
slug: statusroles
summary: Bir üyenin Discord özel durumu belirli bir metni içerdiğinde rolleri otomatik olarak ver ya da al; isteğe bağlı olarak bir kanalda duyur.
icon: fa-user-circle
category: Actions
dashboard: /dashboard/statusroles
module: StatusRoles
tags: [status roles, custom status, vanity, auto role, presence, role automation, status text, durum rolleri, özel durum, vanity, otomatik rol, çevrimiçi durum, rol otomasyonu, durum metni]
related: [administration, afk]
---

## Ne işe yarar

Yetkililer, izlenecek bir veya daha fazla metin ekler; örneğin `discord.gg/yourserver` ya da `playing minecraft`. Bot, çevrimiçi durum güncellemelerini izler. Bir üyenin özel durumu eklenen metni içermeye başladığında bot, **Kaldırılacak Roller** altında listelediğin rolleri kaldırır, **Eklenecek Roller** altındakileri ekler ve bir kanal ile mesaj ayarlanmışsa oraya bildirim gönderir.

Metin durumdan tekrar kaybolduğunda iki anahtar ne olacağını belirler. **Eklenenleri Kaldır** verilen rolleri geri alır. **Kaldırılanları Tekrar Ekle** alınan rolleri geri verir. İkisi de varsayılan olarak kapalıdır; yani hiçbir değişiklik yapmazsan üye, sonunda sahip olduğu rolleri olduğu gibi tutar.

Yalnızca özel durum kontrol edilir; yani Discord'da "Set a custom status" altına yazdığın metin. Oyun, Spotify ve yayın etkinlikleri yok sayılır. Çevrimdışı ya da görünmez olan üyeler atlanır ve eşleşme düz bir alt dize kontrolüdür; bu yüzden `mewdeko`, `I love mewdeko` ile eşleşir ama büyük/küçük harfe duyarlıdır.

Her sunucu, her biri kendi rollerine, kanalına ve mesajına sahip olan istediği kadar durum rolü girişine sahip olabilir. Komutlar bir girişi indeksiyle, yani `liststatusroles` tarafından gösterilen numarayla anar.

## Neden kullanırsın

- Sunucunun davet bağlantısını durumlarına koyan üyeleri, bir destekçi rolü ve bu rolün ayrıcalıklarıyla ödüllendir.
- Biri durumunda yayın yaptığını ya da oynamak istediğini yazarken bir "streaming" ya da "looking to play" rolü ver ve durumunu temizlediğinde rolü kaldır.
- Biri sunucuyu durumunda öne çıkarmaya başladığında bir kanalda duyur; böylece yetkililer teşekkür edebilir.
- Belirli bir durum aktifken bir rolü başka bir rolle değiştir; örneğin belirli bir durumu gösterdiğinde bir üyeyi "no pings" rolünden çıkar.

## Eşleşme ve rol değişiklikleri

| Durum | Botun yaptığı |
| --- | --- |
| Durum izlenen metni kazanır | **Kaldırılacak Roller**'i kaldırır, **Eklenecek Roller**'i ekler, ayarlıysa bildirimi gönderir |
| Durum izlenen metni korur | Hiçbir şey, değişiklik yalnızca bir kez işlenir |
| Durum izlenen metni kaybeder, **Eklenenleri Kaldır** açık | Üyenin hâlâ sahip olduğu **Eklenecek Roller**'i kaldırır |
| Durum izlenen metni kaybeder, **Kaldırılanları Tekrar Ekle** açık | Üyenin artık sahip olmadığı **Kaldırılacak Roller**'i geri verir |
| Üye çevrimdışı ya da görünmez olur | Hiçbir şey, roller olduğu gibi kalır |

Bot, her durum güncellemesini o kullanıcı için önbelleğe aldığı son durumla karşılaştırır; bu yüzden bir üye durumunun ilgisiz bir bölümünü düzenlerse yeniden işlenmez. İzlenen metin sunucu içinde benzersiz olmalıdır; komutlar bunu 128 karakterle sınırlar, kontrol paneli ise sınırlamaz.

## Bildirim mesajı

Bir girişte hem **Bildirim Kanalı** hem de **Bildirim Mesajı** ayarlıysa, bot bir üyenin durumu eşleşmeye her başladığında mesajı oraya gönderir. Metin gömülü mesaj ayrıştırıcısından geçer; bu yüzden düz metin, on embed'e kadar ve bileşenler dahil, gömülü mesaj oluşturucunun ürettiği her şey çalışır. Durum eşleşmeyi bıraktığında hiçbir şey gönderilmez.

### Yer tutucular

Mesaj; üye, bildirim kanalı ve sunucu için standart değiştirme kümesinden geçirilir. En kullanışlı olanlar aşağıdadır; tam liste, kullanıcı, sunucu, kanal, bot ve zaman başlıklarıyla yer tutucular sayfasındadır.

| Yer tutucu | Değer |
| --- | --- |
| `%user.mention%` | Üyenin etiketi |
| `%user.name%` | Üyenin kullanıcı adı |
| `%user.fullname%` | Etiket numarasıyla birlikte kullanıcı adı |
| `%user.avatar%` | Üyenin avatar URL'si |
| `%user.id%` | Üyenin kullanıcı kimliği |
| `%server.name%` | Sunucu adı |
| `%server.icon%` | Sunucu simgesinin URL'si |
| `%channel.mention%` | Bildirim kanalının etiketi |
| `%server.time%` | Sunucunun yapılandırılmış saat diliminde güncel zaman |

> [!NOTE]
> Kontrol paneli düzenleyicisi bir `%status%` yer tutucusu listeler, ama bot bunu değiştirmez. Durum metnini mesaja kendin yaz.

> [!EXAMPLE]
> `%user.mention% is now repping the server in their status, thank you!`

## Ayarlar

Her şey Durum Rolleri sayfasındadır; üç sekmesi vardır: **Durum Rolleri**, **Yeni Ekle** ve **İstatistikler**. Listedeki her giriş, ayarlarını göstermek için genişler.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Takip edilecek durum metni | yok | Özel durumun içermesi gereken metin; kontrol panelinde uzunluk sınırı yok, komutlarda 128 karakter |
| Eklenecek Roller | yok | Durum eşleştiğinde verilen, boşlukla ayrılmış rol kimlikleri; Kaydet tüm listeyi değiştirir |
| Kaldırılacak Roller | yok | Durum eşleştiğinde alınan, boşlukla ayrılmış rol kimlikleri; Kaydet tüm listeyi değiştirir |
| Bildirim Kanalı | yok | Bildirim mesajını alan kanal |
| Bildirim Mesajı | yok | Kanala gönderilen metin ya da embed, yer tutucularla |
| Eklenenleri Kaldır | kapalı | Durum eşleşmeyi bıraktığında eklenen rolleri geri al |
| Kaldırılanları Tekrar Ekle | kapalı | Durum eşleşmeyi bıraktığında verilen rolleri geri ver |

**İstatistikler** sekmesi, toplam giriş sayısını, kaç tanesinin rol değiştirdiğini ve kaçının bildirim kanalı olduğunu gösterir.

## Kurulum adımları

1. Kontrol panelinde **Durum Rolleri**'ni aç ve **Yeni Ekle** sekmesine git.
2. İzlenecek metni gir ve **Durum Rolü Ekle**'ye bas.
3. **Durum Rolleri** sekmesine geç ve yeni girişi genişlet.
4. **Ayarları düzenle**'ye bas, rol kimliklerini **Eklenecek Roller** ve **Kaldırılacak Roller** alanlarına yapıştır, istersen bir **Bildirim Kanalı** seç ve bir **Bildirim Mesajı** yaz, sonra **Kaydet**.
5. Girişteki iki geçiş düğmesiyle **Eklenenleri Kaldır**'ı ve gerekiyorsa **Kaldırılanları Tekrar Ekle**'yi aç.
6. Test et: kendi özel durumunu metne ayarla ve rolün geldiğini doğrula; sonra temizle ve rolün kaldırıldığını doğrula.

## Komutlar

Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Her komut Sunucuyu Yönet yetkisi gerektirir. `<index>`, `liststatusroles` tarafından gösterilen numaradır ve 1'den başlar. Eğik çizgi (slash) sürümleri `/statusroles` altındadır.

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `addstatusrole <text>` | `asr` | Sunucuyu Yönet | İzlenecek bir durum metni ekler |
| `removestatusrole <index>` | `rsr` | Sunucuyu Yönet | Bir girişi siler |
| `liststatusroles` | `lsr` | Sunucuyu Yönet | Her girişi indeksi ve ayarlarıyla sayfa sayfa listeler |
| `setaddroles <index> <@role...>` | `sar` | Sunucuyu Yönet | Durum eşleştiğinde verilecek listeye rol ekler |
| `setremoveroles <index> <@role...>` | `srr` | Sunucuyu Yönet | Durum eşleştiğinde alınacak listeye rol ekler |
| `removeaddroles <index> <@role...>` | `remar` | Sunucuyu Yönet | "Eklenecek roller" listesinden rol çıkarır |
| `removeremoveroles <index> <@role...>` | `rmremoveroles` | Sunucuyu Yönet | "Kaldırılacak roller" listesinden rol çıkarır |
| `setstatusrolechannel <index> <#channel>` | `statusrolechannel`, `ssrc` | Sunucuyu Yönet | Bildirim kanalını ayarlar |
| `setstatusroleembed <index> [text]` | `statusroleembed`, `asre` | Sunucuyu Yönet | Bildirim mesajını ayarlar; metin verilmezse mevcut mesajın önizlemesini gösterir |
| `toggleremoveadded <index>` | `togglerma` | Sunucuyu Yönet | **Eklenenleri Kaldır**'ı açar/kapatır |
| `togglereaddremoved <index>` | `togglermrm` | Sunucuyu Yönet | **Kaldırılanları Tekrar Ekle**'yi açar/kapatır |

`setaddroles` ve `setremoveroles`, mevcut listeyi değiştirmek yerine ona ekler. Rolleri tekrar çıkarmak için `remove...` komutlarını kullan. Kontrol paneli düzenleyicisi tersine çalışır: Kaydet'te kutuda ne varsa tam liste olur, ama boşaltılmış kutu yok sayılır; bu yüzden bir listeyi tamamen temizlemek için `remove...` komutlarını kullanmalısın.

## İpuçları ve dikkat edilecekler

- Botun Rolleri Yönet yetkisine ihtiyacı vardır ve en yüksek rolü, eklediği ya da kaldırdığı her rolün üstünde olmalıdır. Hatalar yalnızca günlüğe yazılır; üye bir şey görmez.
- Botun özel durumları görebilmesi için mutlaka presence intent'e sahip olması gerekir. Durumunu değiştirdiğinde hiçbir şey olmuyorsa, ilk kontrol edilecek şey budur.
- Eşleşme büyük/küçük harfe duyarlıdır ve metnin herhangi bir yerinde arar. İzlenen metni kısa ve ayırt edici tut.
- Bot, bir üyenin presence'ındaki yalnızca ilk etkinliğe bakar. Discord normalde özel durumu ilk sıraya koyar, ama başka bir etkinlik onun önüne geçerse durum görülmez.
- Roller yalnızca durum değiştiğinde değişir. Girişi oluşturduğunda durumunda zaten metin olan bir üye, durumu değişene kadar işlenmez.
- Bildirim, durum her eşleşmeye başladığında gönderilir; bu yüzden durumunu tekrar tekrar değiştiren bir üye, tekrarlanan mesajlar tetikler.
- Kontrol paneli rol adlarını değil, rol kimliklerini alır. Discord'da Geliştirici Modu'nu aç ve bir role sağ tıklayarak kimliğini kopyala.

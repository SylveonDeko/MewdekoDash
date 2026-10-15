---
title: Ayrılma Geri Bildirimi
slug: leave-feedback
summary: Bir sunucu botu kaldırdığında sunucu sahibine nedenini soran bir DM gider. Yanıtlar yalnızca bot sahibinin görebildiği bir kontrol paneli sayfasında toplanır.
icon: fa-comments
category: Analytics
dashboard: /owner/leave-feedback
tags: [leave feedback, kick feedback, why removed, churn, exit survey, owner only, bot owner, ayrılma geri bildirimi, neden kaldırıldı, ayrılma, kayıp oranı, çıkış anketi, yalnızca sahip, bot sahibi]
related: [invites]
---

## Ne işe yarar

Bot bir sunucudan atıldığında ya da ayrıldığında sunucu sahibine kısa bir DM gönderilir. DM'de yaygın nedenlerin olduğu bir açılır menü, bir metin kutusu açan **Write something** düğmesi ve bir **No thanks** düğmesi bulunur. Yanıt vermek isteğe bağlıdır ve DM bunu belirtir.

Her yanıt sunucunun adı, üye sayısı, sahibi ve botun sunucuda ne kadar kaldığıyla birlikte saklanır. Bir rapor kanalı ayarlıysa oraya bir özet embed'i de gönderilir ve sahip daha sonra yorum eklerse güncellenir.

Bu bot düzeyinde bir özelliktir. Sunucu bazında bir ayar yoktur ve kontrol paneli sayfası yalnızca bot sahibine görünür.

> [!NOTE]
> Ayrılma Geri Bildirimi sayfasını yalnızca bot sahibi görebilir. Diğer kontrol paneli kullanıcıları kenar çubuğunda bunu görmez ve açamaz.

## Neden kullanmalısın

- Sunucuların eksik özellikler, kurulum karmaşası ya da güvenilirlik sorunları yüzünden mi ayrıldığını öğrenmek için.
- Botu yalnızca test etmek için ekleyen ve sonra çıkan sunucuları belirlemek için; böylece onların ayrılışları göz ardı edilebilir.
- Yorum bırakıp iletişim bilgisi veren sahiplere ulaşmak için.
- Sahiplerin yanıt verme sıklığını izlemek için.

## İstem

DM'in başlığı "Sorry to see me go!" dır ve botun adı geçen sunucudan az önce kaldırıldığını açıklar. Açılır menü şu nedenleri bu sırayla sunar:

| Neden anahtarı | Sahibe gösterilen |
| --- | --- |
| `not_needed` | We didn't need it anymore |
| `confusing` | Too confusing to set up |
| `missing_features` | Missing features we wanted |
| `unreliable` | It was broken or unreliable |
| `other_bot` | We switched to another bot |
| `temporary` | Temporary, I'm adding it back |
| `testing` | Just testing something |

Bir neden seçildiğinde hemen kaydedilir ve metin kutusu yeniden sunulur. Metin kutusu tek paragraflık bir alandır, "What could we have done better?" sorusunu sorar ve 1000 karakterle sınırlıdır. **No thanks** kaydı reddedildi olarak işaretler ve bu kayıt asla raporlanmaz.

Bunu rahatsız edici olmaktan çıkaran kurallar:

- Bir sunucuya en fazla otuz günde bir kez sorulur; bot kaç kez eklenip kaldırılırsa kaldırılsın.
- Sahibin DM'leri kapalıysa hiçbir şey kaydedilmez.
- Özellik kapalıysa hiçbir şey gönderilmez.

## Durumlar

Her kayıt, kontrol panelinin filtrelediği üç durumdan birine girer.

| Durum | Anlamı |
| --- | --- |
| Yanıtlandı | Sahip bir neden seçti ya da bir yorum yazdı |
| Kapatıldı | Sahip **No thanks** düğmesine bastı |
| Yanıt yok | DM gönderildi ama henüz bir şey dönmedi |

## Ayarlar

Sayfada iki sekme vardır: **Yanıtlar** ve **Ayarlar**.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Sahiplere botun neden kaldırıldığını sor | açık | DM'in hiç gönderilip gönderilmeyeceği |
| Rapor kanalı kimliği | boş | Her yanıt için bir özet embed'i alan kanal. Boşsa botun katılma/ayrılma günlük kanalına döner. |

Kanal alanının altında sayfa, kimliğin hangi kanal ve sunucuya karşılık geldiğini ve botun ona erişip erişemediğini gösterir.

**Yanıtlar** sekmesinde altı sayaç vardır: **Gönderilen istemler**, **Yanıtlandı**, **Yorumu olan**, **Kapatıldı**, **Yanıt yok** ve **Yanıt oranı**. Ayrıca **Verilen nedenler** dökümü ve **Ayrıldı**, **Sunucu**, **Neden** ve **Durum** sütunlu bir tablo bulunur. Nedene ve duruma göre filtreleyebilirsin (durum filtresinde **Yorum bıraktı** seçeneği de vardır), sunucu adına ya da yorum metnine göre arayabilirsin, bir satırı açıp tam yorumu okuyabilirsin ve bir kaydı silebilirsin. **Yanıt oranı** yanıtlanan ve kapatılan istemleri birlikte sayar.

## Kurulum adımları

1. Botun sahibinin hesabıyla kontrol paneline giriş yap ve **Ayrılma Geri Bildirimi**'ni aç.
2. **Ayarlar** sekmesinde **Sahiplere botun neden kaldırıldığını sor** seçeneğinin açık olduğunu kontrol et. Varsayılan olarak açıktır.
3. Bir kanal kimliğini **Rapor kanalı kimliği** alanına yapıştır ve **Kanalı kaydet**'e tıkla ya da katılma/ayrılma kanalını kullanmak için boş bırak.
4. Sahibi olduğun bir test sunucusundan botu kaldır ve DM'e yanıt ver.
5. **Yanıtlar** sekmesinde ve rapor kanalında kaydı kontrol et.

## Komutlar

Bu özellik yalnızca kontrol panelinden kullanılır. Bot komutu yoktur; sahipler DM'deki düğmeler ve açılır menü ile yanıt verir.

## İpuçları ve dikkat edilecekler

- Bot yalnızca Discord'un sunucu sahibi olarak listelediği kişiye DM gönderir; botu kimin kaldırdığına bakmaz.
- Otuz günlük bekleme süresi sunucu bazındadır; bu pencere içinde botu tekrar ekleyip kaldıran bir sunucuya ikinci kez sorulmaz.
- Özet embed'i ayarlanan kanala gider; hiç ayarlanmamışsa botun kimlik bilgilerindeki katılma/ayrılma günlük kanalına. İkisi de yoksa yanıtlar yine de saklanır ve sayfada görülebilir.
- Kontrol panelinden bir kaydı silmek, rapor kanalında zaten yayınlanmış embed'i silmez.

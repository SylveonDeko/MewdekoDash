---
title: Denetim Kaydı
slug: auditlog
summary: Sunucun için kontrol panelini kimin kullandığının, neye baktığının ve neyi değiştirdiğinin kaydı; doksan gün boyunca tutulur.
icon: fa-clipboard-check
category: Security
dashboard: /dashboard/auditlog
tags: [audit, history, accountability, dashboard access, who changed, log, changes, before and after, denetim, geçmiş, hesap verebilirlik, kontrol paneli erişimi, kim değiştirdi, kayıt, değişiklikler, önce ve sonra]
related: [logging, administration, channel-access]
---

## Ne işe yarar

Kontrol panelinin sunucun için bota gönderdiği her istek, giriş yapmış Discord hesabına kaydedilir. Denetim Kaydı sayfası bunu bir zaman çizelgesine dönüştürür: XP ayarlarını kimin açtığını, karşılama mesajını kimin düzenlediğini, bir sohbet tetikleyicisini kimin sildiğini ve değerlerin önce ve sonra neler olduğunu gösterir.

Discord'un kendi denetim kaydından ve Günlükleme özelliğinden ayrıdır. Discord'un kaydı Discord içinde yapılan işlemleri kapsar. Mewdeko'nun Günlükleme özelliği ise katılma, düzenleme ve rol değişiklikleri gibi sunucu olaylarını seçtiğin kanallara gönderir. Kontrol panelinin Denetim Kaydı yalnızca kontrol panelindeki işlemleri kapsar.

Etkinleştirmek gerekmez. Kayıtlar biri kontrol paneline giriş yaptığı ve sunucunu açtığı andan itibaren yazılır ve doksan gün sonra silinir.

## Neden kullanırsın

- Birkaç kişinin kontrol paneline erişimi var ve geçen hafta Anti-Raid'i kimin kapattığını bilmek istiyorsun.
- Bir ayar değişti ama kimse sorumluluğu üstlenmiyor.
- Kontrol paneli erişimini daha geniş bir yetkili ekibine vermeden önce bir iz kaydı istiyorsun.
- Birinden yapmasını istediğin bir değişikliğin gerçekten yapıldığını ve neyin yerine geçtiğini doğrulamak istiyorsun.

## Ne kaydedilir

Her kayıt şunları taşır:

- **Zaman**: isteğin zamanı; UTC olarak saklanır ve sayfada kendi saat diliminde gösterilir.
- **Kullanıcı**: Discord kullanıcı adı ve kimliği; kullanıcının yazdığı herhangi bir şeyden değil, kontrol paneli girişinden alınır.
- **İşlem**: aşağıdaki tablodaki işlemlerden biri.
- **Bölüm**: kontrol panelinin alanı; "AFK Sistemi", "Tetikleyiciler" ya da "Koruma" gibi dostça bir adla gösterilir.
- **Uç nokta**: tam istek, örneğin `PUT Afk/123/settings`; bölümün altında küçük yazıyla gösterilir.
- **Değişiklikler**: görüntüleme dışındaki her şey için gönderilen ya da değiştirilen değerler. Kaydı **Ayrıntılar** ile açarak görebilirsin.

Bot ayrıca her kayıtla birlikte tarayıcının kullanıcı aracısı dizesini saklar.

### İşlemler

İşlem, kontrol panelinin yaptığı isteğin türüne göre belirlenir.

| İşlem | Kaydedildiği durum |
| --- | --- |
| Görüntülendi | Kontrol paneli veri okudu (bir GET isteği). Her sayfa yüklenmesi bunu üretir. |
| Oluşturuldu | Bir şey eklendi (bir POST isteği). |
| Güncellendi | Var olan bir şey değiştirildi (bir PUT ya da PATCH isteği). |
| Silindi | Bir şey kaldırıldı (bir DELETE isteği). |
| Erişildi | Kontrol paneli oturum başlangıçları için ayrılmış. Filtre bunu sunar, ancak mevcut sürüm bu işlemle hiç kayıt yazmaz. |

### Değişiklik kümeleri

Görüntülemeler değişiklik verisi saklamaz. Diğer her şey için bot iki belgeden birini saklar:

- **Önce ve sonra farkı**: bölüm ayarı değiştirmeden önce anlık görüntüye aldığında, kayıt yalnızca değişen alanları, her birinin eski ve yeni değeriyle listeler. Çoğu ayar sayfası bu şekilde çalışır.
- **İstek gövdesi**: anlık görüntü alınmadıysa, kayıt kontrol panelinin gönderdiğini saklar, eski değer olmadan.

Adı `token`, `secret`, `password`, `apikey`, `api_key`, `authorization` ya da `clientsecret` içeren her alan saklanmadan önce `[redacted]` ile değiştirilir; böylece kimlik bilgileri günlüğe hiç düşmez.

Sayfada boolean değerler Açık ve Kapalı, listeler "3 öğe", boş metinler "boş", eksik değerler "yok" olarak gösterilir. Alan adları okunabilir etiketlere çevrilir.

> [!NOTE]
> "Görüntülendi" kayıtları günlüğün büyük çoğunluğunu oluşturur, çünkü her kontrol paneli sayfası açılırken ayarları okur. Bir değişikliği ararken Oluşturuldu, Güncellendi ya da Silindi ile filtrele.

### Kaydedilmeyenler

- Discord içinde komutlarla yapılan işlemler. Bunlar, botun işlem yaptığı yerde Discord'un denetim kaydında ve yapılandırılmışsa Günlükleme'de görünür.
- Oturum açmış bir kontrol paneli kullanıcısına bağlı olmayan istekler.
- Denetim Kaydı sayfasının kendisini açmak, Geri Bildirim Bırak ve birkaç altyapı ve yoklama uç noktası; örneğin bot durumu, performans, sistem bilgisi ve örnek yönetimi.
- Açıkça dışlanmış birkaç uç nokta: gömülü mesaj oluşturucuya sunulan persona avatar görseli, kurulum sihirbazının "gösterilmeli mi" kontrolü ve kontrol paneli sayfa görüntüleme sinyali.

## Sayfayı okumak

Kontrol panelinde Güvenlik altındaki **Denetim Kaydı**'nı aç. Liste en yeni kayıtları önce gösterir; sayfa başına elli kayıt, **Önceki** ve **İleri** düğmeleri ve toplam kayıt sayısı ile.

Listenin üstünde iki filtre vardır:

| Filtre | Ne yapar |
| --- | --- |
| **İşlem** | Yalnızca Görüntülendi, Oluşturuldu, Güncellendi, Silindi ya da Erişildi kayıtlarını gösterir. |
| **Bölüm** | Yalnızca bir kontrol paneli alanını gösterir. Seçenekler, o anda yüklenmiş kayıtlardaki bölümlerden oluşturulur. |

**Yenile** listeyi yeniden yükler. Bir filtreyi değiştirmek seni birinci sayfaya geri götürür.

Masaüstünde her kayıt, değişiklik verisi olduğunda bir **Ayrıntılar** düğmesi olan bir satırdır. Telefonda kayıtlar **Ayrıntıları göster** düğmesi olan kartlar olarak görünür.

> [!EXAMPLE]
> **İşlem**'i Güncellendi, **Bölüm**'ü Koruma olarak filtrele; böylece birinin bir koruma sistemini değiştirdiği her seferi görürsün. Sonra bir satırı açarak hangi alanların değiştiğini ve neden neye değiştiğini görebilirsin.

## Saklama süresi

Kayıtlar **doksan gün** saklanır. Her gün, bot çevrimiçi olduktan beş dakika sonra başlayan bir temizleme işi çalışır ve bundan eski her şeyi siler. Dışa aktarma yoktur; bu pencerenin ötesinde bir kayda ihtiyacın varsa, silinmeden önce kaydet.

## Kimler görebilir

Sayfa yalnızca kontrol paneline giriş yapabilen ve sunucunun üyesi olan kişilere açıktır. Sunucu sahibi ve Yönetici iznine sahip herkes her zaman açabilir. Diğer herkesin Kontrol Paneli Erişimi altında **Denetim Kaydı** bölümüne en az **Görüntüleme** erişimi olmalıdır; bu erişim kullanıcı ya da rol bazında verilir.

> [!PERMISSION]
> Kullanıcı kontrol paneli giriş tokenından alındığı için kimse bir kaydın başka birinin adına görünmesini sağlayamaz.

## İpuçları ve dikkat edilecekler

- Bölüm filtresi yalnızca baktığın sayfada görünen bölümleri listeler. Bir bölüm açılır listede yoksa, sonraki sayfalarda yine de var olabilir; işlem filtresini temizleyip sayfalara göz at ya da önce işleme göre daralt.
- Zaman damgaları sunucunun Yönetim ayarlarındaki saat diliminden değil, sayfayı görüntüleyen tarayıcının saat diliminde gösterilir.
- Oluşturuldu kaydı bir POST isteğinin yapıldığı anlamına gelir; kontrol paneli bunu bazı anahtarlar ve güncellemeler için de kullanır. Gerçekte neyin olduğunu görmek için uç nokta satırına ve ayrıntılara bak.
- Eski değeri olmayan değerler gösteren kayıtlar, önceki durumunu anlık görüntüye almayan bir bölümden gelir. Ne gönderildiğini görürsün, ama neyin yerine geçtiğini görmezsin.
- Günlük sunucu bazındadır. Kontrol panelinde sunucu değiştirmek günlüğü de birlikte değiştirir.

---
title: İşlem Günlükleri
slug: process-logs
summary: Yalnızca bot sahiplerine açık bir kontrol paneli sayfası; botun sunucusunda pm2'nin çalıştırdığı işlemleri listeler ve konsol günlüklerini okumana, takip etmene, filtrelemene ve indirmene olanak tanır.
icon: fa-rectangle-code
category: Analytics
dashboard: /owner/process-logs
tags: [pm2, logs, console, stdout, stderr, tail, process, crash, stack trace, owner, günlükler, konsol, işlem, çökme, yığın izi, sahip, işlem günlükleri]
related: [performance, analytics, leave-feedback]
---

## Ne işe yarar

İşlem Günlükleri, botun konsoluna yazdığı şeyi, pm2'nin bot için tuttuğu günlük dosyalarından doğrudan gösterir; sunucuda bir kabuk açmadan. Yalnızca bot sahiplerine görünür: kenar çubuğu herkes için bunu gizler, URL'yi doğrudan açmak sahip olmayanları kontrol panelinin ana sayfasına geri gönderir ve bot, oturum açmış hesap bir sahip değilse istekleri reddeder.

Seçtiğin bot örneğinden pm2 işlem tablosunu ister. Bu ana makinede pm2'nin yönettiği her işlem listelenir, yalnızca bot değil; durumu, pid'si, çalışma süresi, yeniden başlatma sayısı, CPU ve bellek kullanımı ile iki günlük dosyasının boyutu gösterilir. Bir işlem seçtiğinde sayfa, stdout günlüğünün son birkaç yüz satırını yükler; **Takip ediliyor** açık olduğu sürece her birkaç saniyede yeni satırları ekler.

Satırlar Serilog'un yazdığı renkleri korur ve her satır seviyesiyle etiketlenir; böylece gürültüyü gizleyebilirsin. Yığın izleri gibi devam satırları, üstündeki satıra bağlı kalır; bu yüzden bilgi satırlarını gizlemek yetim izler bırakmaz.

## Neden kullanırsın

- Bot yeniden başladı ya da çöktü ve kapanmadan önce söylediği son şeyi görmek istiyorsun; bu stderr tarafında olur.
- Bir üye bir komutun başarısız olduğunu bildirdi ve o tekrar denerken günlüğü canlı izlemek istiyorsun.
- Binlerce son satırda bir sunucu ID'sini ya da bir mesajı sunucuya bağlanmadan aramak istiyorsun.
- Bir hata raporu için tüm günlük dosyasına ihtiyacın var ve bunu indirilebilir olarak istiyorsun.

## Denetimler

| Denetim | Ne yapar |
| --- | --- |
| İşlem kartları | Ana makinedeki her pm2 işlemi için bir kart. **bu bot** etiketli kart, isteği yanıtlayan örnektir. Günlüklerini okumak için birine tıkla. |
| **stdout** / **stderr** | İşlemin çıktı günlüğü, normal günlüklerin yazıldığı yer, ile hata günlüğü, çökmelerin ve çalışma zamanı tanılarının düştüğü yer, arasında geçiş yapar. |
| **100** ile **2k** | Günlük açıldığında ya da yeniden yüklendiğinde kaç satır yüklenecek. Takip modu sayfada en fazla 5.000 satır tutar; sonra en eskilerini düşürmeye başlar. |
| Filtre kutusu | Yazdığın metni içermeyen her satırı gizler. Büyük/küçük harf fark etmez. |
| **Takip ediliyor** / **Takip et** | Canlı güncellemeleri açar ve kapatır. Açıkken sayfa her iki saniyede bir yeni satır arar ve sen yukarı kaydırmadığın sürece onlarla birlikte kayar. |
| **Satır kaydır** | Uzun satırları yana kaydırmak yerine sarar. |
| **Kopyala** | Görünen satırları, renkler temizlenmiş olarak panoya kopyalar. |
| **Yeniden yükle** | Kuyruğu dosyadan yeniden okur. |
| **İndir** | Tüm günlük dosyasını diskteki haliyle, renk kodları dahil kaydeder. Yanındaki boyut, dosyanın şu anki boyutudur. |
| Seviye çipleri | **VRB**, **DBG**, **INF**, **WRN**, **ERR** ve **FTL**; her biri yüklenen etiketli satır sayısıyla birlikte. Birine tıklamak o seviyeyi gizler ya da gösterir. |

Takip sırasında yukarı kaydırırsan yeni satırlar bekletilir ve sağ alt köşedeki bir düğme kaç satırın beklediğini gösterir. Düğmeye tıklamak seni aşağı götürür ve kaydırmayı yeniden günlükle birlikte sürdürür.

> [!NOTE]
> Tek bir okuma 1 MB ile sınırlıdır. İstediğin satırlar sığmazsa sayfa daha eski satırların atlandığını bildirir; her şeyi görmek için dosyayı indir.

## Bot günlükleri nasıl bulur

Bot, kendi ana makinesinde `pm2 jlist` komutunu çalıştırır ve pm2'nin her işlem için bildirdiği günlük dosyası yollarını okur. Bunu yalnızca aynı kullanıcı için bir pm2 daemon'u zaten çalışıyorsa yapar; böylece yanlışlıkla bir tane başlatmaz. pm2 kurulu ama sorgulanamıyorsa sayfa pm2'nin günlük dizinindeki dosyalara geri döner ve bunu belirtir. Hiç pm2 yoksa boş bir liste göstermek yerine bunu açıklar.

Birden fazla bot örneğine bağlı bir kontrol panelinde işlem listesi, seçili örneğe aittir; çünkü her örnek yalnızca kendi ana makinesini görebilir.

## Kurulum adımları

1. Botu sunucusunda pm2 altında çalıştır; örneğin `pm2 start dotnet --name mewdeko -- Mewdeko.dll`.
2. Kontrol paneline bir bot sahibi hesapla giriş yap ve kenar çubuğundan **İşlem Günlükleri**'ni aç.
3. **bu bot** etiketli işlemi ya da ana makinedeki başka bir işlemi seç.
4. Canlı izlemek için **Takip ediliyor** açık kalsın ya da kapat ve yüklenenleri incelemek için filtreyi ve seviye çiplerini kullan.
5. Bir çökmeden sonra çalışma zamanının düşerken ne yazdığını okumak için **stderr** seçeneğine geç.

## İpuçları ve dikkat edilecekler

- Günlükler dosyalardan okunduğu için pm2 dışında başlatılan bir işlemin burada günlüğü olmaz. Botun kendi konsol çıktısı yalnızca bot pm2 altında çalışıyorsa görünür.
- `pm2 flush` komutunu çalıştırdığında ya da `pm2-logrotate` kullandığında pm2 dosyaları döndürür ya da kırpar. Sayfa dosyanın küçüldüğünü fark eder ve kuyruğu kendiliğinden yeniden yükler.
- Filtre ve seviye çipleri yalnızca zaten yüklenmiş satırlara uygulanır. Daha geriye dönük arama yapmak için daha fazla satır yükle ya da dosyayı indir.
- Bu sayfadaki hiçbir şey botu değiştirmez. Buradan işlemleri yeniden başlatmanın ya da günlükleri temizlemenin bir yolu yoktur; bunun için sahip komutu `restartinstance` ve sunucudaki `pm2 flush` kullanılır.

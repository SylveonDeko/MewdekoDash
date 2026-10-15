---
title: Nintendo Switch
slug: switch
summary: Nintendo Switch hata kodlarını ara, onluk ve onaltılık değerler arasında dönüştür, switchbrew.org wiki'sinde arama yap ve bir Ryujinx log dosyasının okunabilir bir dökümünü al.
icon: fa-gamepad-modern
category: Entertainment
module: Switch
tags: [switch, nintendo, error code, ryujinx, emulator, log, switchbrew, homebrew, hex, hata kodu, emülatör, onaltılık, günlük]
related: [userprofile, help]
---

## Ne işe yarar

Switch modülü, Nintendo Switch homebrew ve emülasyonu hakkındaki sunucular için bir destek araç takımıdır. Birisi `2168-0002` gibi bir hata paylaştığında, bir yardımcı `err 2168-0002` komutunu çalıştırır ve bot hatanın hangi modüle ait olduğunu, hakkında bilinenleri ve varsa Nintendo'nun destek sayfasına bir bağlantıyı yanıtlar.

İki küçük dönüştürücü `NNNN-NNNN` biçimini koddaki ham onaltılık değere çevirir ve tersini yapar. `switchbrew` komutu switchbrew.org wiki'sinde arama yapar; böylece insanlar Discord'dan çıkmadan SVC, sonuç kodu ya da donanım sayfalarını bulabilir.

En büyük özellik Ryujinx log analizcisidir. Kullanıcı `Ryujinx.log` dosyasını ekler, biri bunu mesaja ya da yanıtına `analyselog` ile çalıştırır ve bot oyunu, emülatör sürümünü, donanımı, ilgili tüm ayarları, son hatayı, kurulu modları ve hileleri ve yaygın yanlış yapılandırmalara işaret eden notların listesini içeren bir embed üretir.

Hiçbir şeyin yapılandırılmasına gerek yoktur ve hiçbir şey saklanmaz. Tüm komutlar herkese açıktır.

## Neden kullanırsın

- Bir destek kanalına her gün gelen "2811-5001 ne demek?" sorusu için.
- Ryujinx sorun gidermesi log dosyasını okumakla başlar ve çoğu insan neye bakacağını bilmez.
- Geliştiriciler, kaynak kodunda aramak için bir hatanın onaltılık biçimini ister.
- Herkes Discord'dan bir switchbrew.org sayfasını açabilir.

## Hata kodu aramaları

`err <code>` iki biçimden birini kabul eder:

- `NNNN-NNNN`; ilk grup 2 ile başlar (örneğin `2168-0002`). Modül numarası ilk grubun 2000 eksiği, açıklama ise ikinci gruptur.
- `0x` önekli bir onaltılık değer, örneğin `0x2A2`. Düşük dokuz bit modül, kalanı açıklamadır.

Yanıt kodu iki biçimde de gösterir; modül adını ve numarasını, açıklama numarasını ve bir açıklamayı verir. Açıklama şu sırayla bulunur: tam kod için bilinen bir açıklama, tam kod için bir Nintendo destek sayfası, kodun modül içinde düştüğü aralık için bir açıklama, aksi halde "unknown". Bilinen kodlar normal renkle, bilinmeyenler hata renginde gösterilir.

Birkaç kod bu düzene uymaz, örneğin `2-AAB6A-3400`. Bunlar kısa bir listeyle birebir eşleştirilir ve ait oldukları oyunla birlikte raporlanır.

`err2hex <NNNN-NNNN>` onaltılık değeri yazdırır. `hex2err <hex>` çizgili biçimi yazdırır; `0x` öneki isteğe bağlıdır.

## Switchbrew araması

`switchbrew <query>` wiki'nin arama API'sini sorgular ve her biri bir bağlantı ile en fazla 200 karakterlik bir özetle birlikte ilk beş sonucu döndürür. `svc` bir takma addır, bu yüzden `svc SetThreadPriority` doğal görünür.

## Ryujinx log analizi

`analyselog` mesajındaki bir `.log` ya da `.txt` eki arar. Yoksa ve mesajın bir yanıt ise, yanıt verdiğin mesajdaki eki kullanır ve altbilgide o yazarı belirtir. Embed oyunun adıyla başlar ve şunları içerir:

| Alan | İçerik |
| --- | --- |
| Genel Bilgi | Ryujinx sürümü, firmware, CPU, GPU, RAM, işletim sistemi |
| Sistem Ayarları | Ses arka ucu, masaüstü ya da el cihazı modu, PPTC, shader önbelleği, VSync, hypervisor (yalnızca macOS) |
| Grafik Ayarları | Grafik arka ucu, çözünürlük ölçeği, anizotropik filtreleme, en-boy oranı, doku yeniden sıkıştırma |
| Hatalar | Logdaki son hata bloğu ya da "no errors" |
| Modlar | Her mod, ExeFS ya da RomFS ile birlikte; çok sayıdaysa sayısıyla kısaltılır |
| Hileler | Her hile, aynı şekilde kısaltılmış |
| Notlar | Algılanan sorunlar ve öneriler |

Notlar şunları kapsar: shader önbelleği çakışması ya da bozulması, hatalı bir dump hash'i, güncel olmayan anahtarlar, eksik firmware, dosya izin hataları, eksik kayıt, eksik servisler, Vulkan'ın bellek yetersizliği, varsayılan kullanıcı profili, yapılandırılmamış kontrolcü, Vulkan kullanması gereken bir Intel ya da AMD GPU, Apple silikonda Rosetta, sahte ses arka ucu, devre dışı PPTC ya da shader önbelleği, genişletilmiş RAM, yazılım bellek yöneticisi, eksik servisleri yoksay, kapalı VSync, kapalı dosya sistemi bütünlük kontrolleri, kapalı arka uç iş parçacığı ve özel derlemeler. Her notun bilgilendirmeden kritiğe kadar uzanan bir önem işareti vardır.

Dosya indirilemezse ya da bir Ryujinx logu değilse bot logun geçersiz olduğunu söyler.

## Ayarlar

Bu modülün ayarı ve kontrol paneli sayfası yoktur.

## Kurulum adımları

1. Botun destek kanalında mesaj geçmişini okuyabildiğinden ve dosya ekleyebildiğinden emin ol.
2. Kullanıcılardan `Ryujinx.log` dosyasını doğrudan bir mesaja eklemelerini iste.
3. Bir yardımcı, o mesaja `analyselog` ile yanıt versin.
4. Hata kodları için `err <code>` çalıştır ve bir destek bağlantısı gösteriliyorsa onu paylaş.
5. İstersen bu iki komutu hatırlatan bir sohbet tetikleyicisi ya da sabitlenmiş bir mesaj ekle.

## Komutlar

Bu komutları sunucunun önekiyle çalıştır (önekini değiştirmediysen `.`).

| Komut | Takma adlar | Gereken yetki | Amaç |
| --- | --- | --- | --- |
| `err <code>` | `nxerr`, `serr` | Herkes | Çizgili ya da onaltılık biçimdeki bir Switch hata kodunu açıkla |
| `err2hex <NNNN-NNNN>` | `e2h` | Herkes | Çizgili bir kodu onaltılığa çevir |
| `hex2err <hex>` | `h2e` | Herkes | Onaltılığı çizgili biçime çevir |
| `switchbrew <query>` | `sb`, `svc` | Herkes | switchbrew.org'da ara |
| `analyselog` | `analyzelog`, `analyselogs`, `analyzelogs`, `analyze`, `analyse` | Herkes | Eklenen bir Ryujinx logunu analiz et |

## İpuçları ve dikkat edilecekler

- Çizgili biçim tam olarak dört rakam, bir çizgi ve 2 ile başlayan dört rakamdan oluşmalıdır. Harf içeren kodlar yalnızca özel durum listesinden geçer.
- Loglar `.log` ya da `.txt` olarak eklenmelidir; kod bloğu içine yapıştırılmış bir log okunmaz.
- Analizci tüm dosyayı okur; bu yüzden kullanıcılardan sorunun yaşandığı oturumun logunu iste, yeni açılmış bir oturumun logunu değil.
- switchbrew.org araması canlı bir istektir; site yavaşsa komut da yavaş olur.
- Üyeler Switch arkadaş kodlarını `setswitchfc` ile profillerinde saklayabilir; bu, Kullanıcı Profili modülünün bir parçasıdır.

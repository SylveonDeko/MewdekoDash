---
title: İtiraflar
slug: confessions
summary: Üyeler isimsiz itiraflar gönderir; bot bunları bir kanalda numaralı embed'ler olarak yayımlar ve isteğe bağlı, yalnızca yetkililerin görebildiği bir günlük her birini gönderenin kimliğini ortaya çıkarır.
icon: fa-comment
category: Community
dashboard: /dashboard/confessions
module: Confessions
tags: [confessions, confess, anonymous, secrets, confession channel, confession log, blacklist, itiraflar, itiraf, anonim, sırlar, itiraf kanalı, itiraf günlüğü, kara liste]
related: [administration, moderation]
---

## Ne işe yarar

Bir üye sunucuda `/confess` komutunu çalıştırır ya da bota DM ile `.confess <server id> "text"` yazar. Bot mesajı itiraf kanalına "Anonymous confession #N" başlığıyla bir embed olarak gönderir. Gönderenin adı o kanalda asla görünmez. Gönderen özel bir onay alır ve her itirafta itiraf numarası bir artar.

Yetkililer ayrı bir günlük kanalı ayarlayabilir. Her itiraf, gönderenin etiketi ve kimliği, itiraf numarası ve yayımlanan mesajın bağlantısı ile bu kanala kopyalanır. Her itirafın altbilgisinde üyelere nasıl itiraf edeceği anlatılır; onayda ise kötüye kullanan bir sunucuyu bildirebilecekleri söylenir.

Yetkililer ayrıca tek tek üyeleri kara listeye alabilir; böylece itirafları reddedilir ve kontrol panelinden itiraf silebilirler. Silme işlemi Discord mesajını da kaldırır.

## Neden kullanırsın

- Üyelerin adlarının görünmesini istemeden konuşmak isteyecekleri "dert" ya da "çay" kanalları.
- Övgü ve takdirin isimsiz kalacağı kanallar.
- Taciz vakalarını yine de izleyebilmek zorunda kalacağın her isimsiz kanal.

## İtiraf gönderisi

Her itiraf, itiraf kanalında bir embed'dir:

| Bölüm | İçerik |
| --- | --- |
| Yazar satırı | Sunucu simgesiyle `Anonymous confession #N` |
| Açıklama | İtiraf metni |
| Resim | Bir dosya gönderildiyse o dosya |
| Altbilgi | `Do /confess or dm me .confess <server id> yourconfession to send a confession!` |
| Zaman damgası | Yayımlandığı zaman |

Numaralandırma 1'den başlar ve saklanan son itirafın üzerinden devam eder. Bir itirafı silmek diğerlerinin numarasını değiştirmez.

Ekler her iki şekilde de desteklenir: `/confess` komutuna `attachment` seçeneğiyle bir dosya ekleyebilir ya da metin komutunda DM'ye bir dosya iliştirebilirsin. Yalnızca ilk ek kullanılır.

## Günlük kanalı

**Günlük Kanalı** ayarlandığında, her itiraf orada kırmızı bir embed de üretir: **Kullanıcı** (etiket ve kimlik), **Confession N** (metin), bir **Message Link** ve kötüye kullanım uyarısı. Gönderenin ortaya çıkarıldığı tek yer burasıdır; bu yüzden yalnızca güvendiğin kişilere aç.

> [!WARNING]
> Günlük kanalı, yetkililerin tacizle ilgilenebilmesi için vardır. Bir itirafı kimin gönderdiğini paylaşmak, sunucunun bot sahipleri tarafından kara listeye alınmasına neden olabilir. Üyeler kötüye kullanımı `/confessions report` ile bildirebilir.

## Kara liste

`confessionblacklist`, bir üyeyi sunucunun kara listesine ekler; `confessionunblacklist` ise onu çıkarır. Kara listedeki üyeler, gönderi yerine "you are blacklisted" mesajı alır. Kontrol kullanıcı kimliğine göre yapılır.

Kontrol panelinde bir **Rol Kara Listesi** gösterilir ve rol kimliklerini aynı listede saklar. Bot, bir itiraf geldiğinde yalnızca gönderenin kullanıcı kimliğini listeyle karşılaştırır; bu yüzden kontrol panelinde seçtiğin roller şu anda kimseyi durdurmaz. Belirli üyeleri engellemek için komutları kullan.

## Ayarlar

**İtiraflar** sayfasının üç sekmesi vardır: **Yapılandırma**, **İtiraflar** ve **İstatistikler**.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| İtiraf kanalı | yok | Anonim itirafların gönderildiği yer; ayarlanana kadar itiraflar kapalıdır |
| Günlük kanalı (kullanıcı kimliklerini gösterir) | yok | Her itirafın kimlik bilgisi içeren kopyasının gittiği yer |
| Rol Kara Listesi | yok | Yukarıdaki kara liste bölümüne bak |

**İtiraflar** sekmesi, saklanan her itirafı en yeniden eskiye numarası ve tarihiyle listeler. İçerik, açana kadar gizlidir; **İtirafı sil** ise onu veritabanından kaldırır ve hâlâ varsa Discord'daki mesajını da siler.

**İstatistikler** sekmesi **Toplam İtiraf**, **Bu Ay**, **Bugün** ve **Son Numara** değerlerini gösterir.

## Kurulum adımları

1. Botun Mesaj Gönder ve Bağlantı Yerleştir izinlerine sahip olduğu, üyelerin okuyabildiği ama genelde yazamadığı bir kanal oluştur.
2. Kontrol panelinde **İtiraflar** sayfasını aç ve bu kanalı **İtiraf kanalı** olarak seç.
3. İstersen özel bir yetkili kanalını **Günlük kanalı** olarak seç.
4. **Yapılandırmayı Kaydet** düğmesine tıkla.
5. Bir üye hesabından `/confess` çalıştır ve embed'in `#1` ile göründüğünü kontrol et.
6. Biri kötüye kullanırsa, günlük kanalında onu bul ve `confessionblacklist @user` çalıştır.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (`.`, değiştirmediysen). Eğik çizgi sürümleri `/confessions` altındadır; yalnızca `/confess` istisnadır, o en üst düzeydedir.

| Komut | Diğer adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `confess <server id> <"text">` | | Yok | Yalnızca DM. Verilen sunucuda bir itiraf gönder; birden fazla kelimeli metni tırnak içine al |
| `confessionchannel [#channel]` | `confesschannel` | Kanalları Yönet | İtiraf kanalını ayarla; kanal vermezsen itirafları kapat |
| `confessionlogchannel [#channel]` | `confesslogchannel`, `confessionlogchnl` | Yönetici | Günlük kanalını ayarla |
| `confessionblacklist <@user>` | `confessblacklist`, `confessbl` | Kanalları Yönet | Bir üyenin itiraf etmesini durdur |
| `confessionunblacklist <@user>` | `confessunblacklist`, `confessunbl` | Kanalları Yönet | Kara listedeki bir üyenin yeniden itiraf etmesine izin ver |

`/confessions report <server id> <description>` komutu, bir sunucunun itirafları kötüye kullandığına dair bir raporu bot sahiplerine gönderir. Metin karşılığı yoktur.

## İpuçları ve dikkat edilecekler

- Bot hem itiraf kanalında hem de günlük kanalında Mesaj Gönder ve Bağlantı Yerleştir iznine ihtiyaç duyar. Kanal komutları bu izinler yoksa uyarır, ama yine de ayarı kaydeder.
- Metin `confess` komutu yalnızca DM'lerde çalışır ve itirafı tek bir argüman olarak alır; bu yüzden `confess 123456789 "I like pineapple on pizza"` çalışır, tırnaksız hali ise yalnızca ilk kelimeyi gönderir. Sunucu içinde `/confess` üyeler için daha basittir.
- DM üzerinden `confess` yalnızca botla ortak olduğun sunucular için çalışır; diğer sunucu kimlikleri reddedilir.
- Metin `confessionlogchannel` komutu kanal vermeden çalıştırılırsa günlük kanalını değil, itiraf kanalını temizler. Günlük kanalını kontrol panelinden temizle.
- İtiraflar, günlük kanalı olmasa bile gönderenin kullanıcı kimliğiyle saklanır ve kontrol paneli tek bir itirafın gönderenine bakabilir. Kontrol paneline erişimi yalnızca yetkililere ver.
- Kontrol panelinden silmek saklanan kaydı kaldırır; bu yüzden günlük kanalındaki kopya kalan tek izindir.

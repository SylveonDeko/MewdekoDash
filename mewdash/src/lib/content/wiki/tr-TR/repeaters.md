---
title: Tekrarlayıcılar
slug: repeaters
summary: Bir kanalda mesajı zamanlayarak gönder; kanal meşgul ya da sessiz olduğunda gönder ya da sabit mesaj olarak en altta tut.
icon: fa-sync
category: Actions
dashboard: /dashboard/repeaters
module: Utility
tags: [repeater, sticky, sticky message, recurring, scheduled message, auto post, reminder, forum sticky, tekrarlayıcı, sabit mesaj, tekrarlayan, zamanlanmış mesaj, otomatik gönderi, hatırlatıcı, forum sabitleme]
related: [utility, embedbuilder]
---

## Ne işe yarar

Tekrarlayıcı, bot tarafından bir kanalda defalarca gönderilen bir mesajdır. Klasik kullanımı zamanlı bir hatırlatıcıdır: altı saatte bir "Kuralları oku". Her çalıştığında bot önce kendi önceki kopyasını siler; böylece kanal kopyalarla dolmaz ve mesaj her zaman alt kısımda kalır.

Tekrarlayıcıların beş tetikleme modu vardır. Sabit bir aralığın yanı sıra, başka biri mesaj gönderdiği anda çalışabilirler (gerçek bir sabit mesaj), belirli sayıda mesajdan sonra, kanal meşgul olduğunda veya sessizleştiğinde. İsteğe bağlı zaman aralıkları, sunucunun saat diliminde mesai saatleri, akşamlar ya da hafta sonlarıyla sınırlar; forum tekrarlayıcıları ise her yeni konuya otomatik olarak gönderebilir.

Mesaj, tam gömülü mesaj oluşturucuyu, düz metni, bileşenleri ve genel yer tutucuları destekler; böylece bir tekrarlayıcı tek satırlık bir yazı değil, zengin bir duyuru olabilir. Etiketler yalnızca tekrarlayıcıyı oluşturan kişi Herkesi Etiketle iznine sahipse korunur; aksi hâlde etkisiz hale getirilir.

## Neden kullanırsın

- Yoğun bir kanalın altında kuralları ya da "nasıl yardım alınır" bildirimini sabit tut.
- Her gün 18:00 sunucu saatinde bir etkinlik hatırlatıcısı gönder.
- Yeni forum konularının hepsine, etikete göre filtreleyerek gönderi yönergelerini koy.
- Bir saat boyunca sessiz kalan bir kanalı bir sohbet başlatıcısıyla canlandır.
- Bir tanıtımı yalnızca mesai saatlerinde ve yalnızca sonraki yedi gün için çalıştır.

## Tetikleme modları

| Mod | Ne zaman gönderir |
| --- | --- |
| Zaman Aralığı | Her aralıkta, isteğe bağlı olarak bir günün başlangıç saatine hizalanarak. Varsayılan mod. |
| Hemen | Bir kez gönderir, ardından mesajı kanaldaki son mesaj olmadığında yeniden gönderir. |
| Mesaj Sayısından Sonra | Son çalıştığından beri eşik kadar mesaj gönderildiğinde gönderir. |
| Etkinlikte | Kanal meşgul olduğunda gönderir: eşik, zaman penceresi içindeki son trafikle karşılaştırılır. |
| Etkinlik Yokken | Zaman penceresinin tamamında kanalda hiçbir mesaj gönderilmediğinde gönderir. |

Etkinliğe dayalı modlar dakikada bir kontrol edilir ve sunucuda mesaj sayımının açık olmasını gerektirir. Aralık beş saniye ile 25000 dakika arasında olmalıdır. Varsayılan beş dakikadır; bir saat verip aralık vermezsen bir gündür. **Etkinlik eşiği** varsayılan olarak 5 mesajdır, **Zaman penceresi** ise beş dakikadır ve pencere aralığı otuz saniye ile altı saat arasındadır.

## Koşullar ve sınırlar

- **Mesaj kanaldaki son mesajsa tekrarlama** (fazlalık): Son kopyası hâlâ en yeni mesajsa bot bu çalıştırmayı atlar.
- **Sohbet Algılama**: Son bir dakikada üç veya daha fazla mesaj geldiyse çalıştırma ertelenir ve otuz saniye sonra yeniden kontrol edilir.
- **Zaman Planı**: `business` pazartesiden cumaya 09:00 ile 17:00 arası, `evening` her gün 18:00 ile 23:00 arası, `weekend` ise cumartesi ve pazar tüm gün demektir. Saatler sunucu saat dilimine göre kullanılır; önce bir saat dilimi ayarla, yoksa bot UTC varsayar ve bunu sana hatırlatır.
- **Şu süreden sonra otomatik sil** ve **En fazla gösterim**: Tekrarlayıcı, en fazla yaşa ya da gönderi sayısına ulaştığında kendini kaldırır.
- **Bildirimleri Sustur**: Mesaj sessizce gönderilir ve kimsenin cihazını çalmaz.
- **Öncelik**, tekrarlayıcı başına 0 ile 100 arasında saklanır, varsayılanı 50'dir ve listede gösterilir.

## Konular ve forumlar

- **Yeni konularda otomatik oluştur**: Tekrarlayıcının kanalının altında bir konu oluşturulduğunda bot mesajı konuya gönderir ve üyeler yanıt verdikçe en altta tutar.
- **Yalnızca konu modu**: Tekrarlayıcı hiçbir zaman ana kanalda göndermez, yalnızca konularda gönderir. Hedef bir forum kanalıysa gereklidir.
- **Forum Etiketi Filtreleri**: Gerekli ve hariç tutulan etiketler, hangi forum gönderilerinin sabit mesaj alacağına karar verir.

## Yer tutucular

Mesaj, genel yer tutucu kümesinden geçer. Kullanıcı yer tutucuları botun kendisine işaret eder, çünkü bir tekrarlayıcıyı kimse tetiklemez. Kullanışlı olanlar:

| Yer tutucu | Değer |
| --- | --- |
| `%server%`, `%server.name%` | Sunucu adı |
| `%server.members%` | Önbelleğe alınmış üye sayısı |
| `%server.id%`, `%server.icon%` | Sunucu ID'si ve simge URL'si |
| `%channel%`, `%channel.name%` | Tekrarlayıcı kanalının etiketi ve adı |
| `%bot.name%`, `%bot.avatar%` | Botun adı ve avatarı |
| `%server.time%`, `%time.day%` | Sunucu saati ve mevcut haftanın günü |

`%huggif%` gibi tepki GIF yer tutucuları da değiştirilir. `%user%` gibi tetikleyici yer tutucuları bota çözümlenir.

## Ayarlar

Tekrarlayıcılar sayfasında üç sekme vardır: **Genel Bakış**, **Tekrarlayıcıları Yönet** ve **Yeni Oluştur**.

| Ayar | Varsayılan | Kontrol ettiği |
| --- | --- | --- |
| Hedef Kanal | yok | Gönderilecek metin ya da forum kanalı |
| Forum Etiketi Filtreleri | yok | Gerekli ve hariç tutulan etiketler, yalnızca forum kanalları |
| Mesaj İçeriği | yok | Gömülü mesaj oluşturucuyu açar |
| Tetikleme modu | Zaman Aralığı | Beş moddan biri |
| Şu sıklıkta tekrarla | 5 dakika | 1 dakikadan Günlük'e kadar hazır ayarlar ya da özel bir `HH:MM:SS` |
| Mesaj kanaldaki son mesajsa tekrarlama | kapalı | Fazlalık kontrolü |
| @everyone ve @here etiketlerine izin ver | kapalı | Toplu etiketleri etkisiz hale getirmek yerine mesajda tut |
| Öncelik (0-100) | 50 | Listede gösterilen öncelik değeri |
| Sıra Konumu | 0 | Saklanan sıralama değeri |
| Başlangıç saati (SS:DD) | yok | Zaman Aralığı tekrarlayıcısının hizalanacağı günün saati |
| Sohbet Algılama | kapalı | İnsanlar konuşurken gecikme |
| Bildirimleri Sustur | kapalı | Sessiz gönder |
| Yeni konularda otomatik oluştur | kapalı | Konuda sabitleme, yalnızca forum kanalları |
| Yalnızca konu modu | kapalı | Ana kanalı atla, yalnızca forum kanalları |
| Şu süreden sonra otomatik sil (gün) | yok | `d.hh:mm:ss` biçiminde en fazla yaş, örneğin `7.00:00:00` |
| En fazla gösterim | sınırsız | Kaldırılmadan önceki gönderi sayısı |
| Zaman Planı | yok | Hazır düğmeler ya da özel bir plan |
| Etkinlik eşiği / Gereken mesaj | 5 | Etkinlik modları için mesaj sayısı |
| Zaman penceresi | 00:05:00 | Etkinlik modları için pencere |

**Genel Bakış** toplamları, aktif sayıyı, toplam gösterimi, tetikleme modu dağılımını ve en aktif tekrarlayıcıları gösterir. **Tekrarlayıcıları Yönet** her birini **Düzenle**, **Şimdi Tetikle** ve **Sil** seçenekleriyle listeler; ayrıca aralık, eşik, en fazla yaş ve en fazla tetikleme için hızlı düzenleme sunar.

## Kurulum adımları

1. Kontrol panelinde **Tekrarlayıcılar** sayfasını aç ve **Yeni Oluştur** seç.
2. **Hedef Kanal**'ı seç. Bir forum seçtiysen **Yalnızca konu modu** kutusunu işaretle ve istediğin **Forum Etiketi Filtreleri** ayarlarını yap.
3. **Mesaj İçeriği** kutusuna tıkla ve mesajı gömülü mesaj oluşturucuda hazırla.
4. Bir **Tetikleme modu** seç. Sabit bir mesaj için Hemen, bir hatırlatıcı için **Şu sıklıkta tekrarla** hazır ayarıyla Zaman Aralığı seç.
5. Fazlalık, sessiz gönderme, zaman planı ya da son kullanma istiyorsan **Gelişmiş Seçenekler**'i aç.
6. **Tekrarlayıcı Oluştur** düğmesine tıkla, ardından test etmek için **Tekrarlayıcıları Yönet** sekmesinde **Şimdi Tetikle** seçeneğini kullan.

> [!NOTE]
> Zaman planları bir sunucu saat dilimi gerektirir. İş saatleri, akşam ya da hafta sonu aralıklarını etkinleştirmeden önce saat dilimi komutuyla ayarla.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Hepsi Mesajları Yönet izni gerektirir. Tekrarlayıcılara `repeatlist` komutunun verdiği numarayla başvurulur.

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `repeat [time] [interval] <message>` | | Mesajları Yönet | Mevcut kanalda bir tekrarlayıcı oluştur; örneğin `repeat 6h Read the rules` ya da `repeat 18:00 Event tonight` |
| `repeatlist` | `replst`, `replist`, `repli` | Mesajları Yönet | Tekrarlayıcıları kanal, mod, aralık ve sonraki çalıştırma ile listele |
| `repeatinvoke <index>` | `repinv` | Mesajları Yönet | Bir tekrarlayıcıyı hemen çalıştır ve zamanlayıcısını yeniden başlat |
| `repeatremove <index>` | `reprm` | Mesajları Yönet | Bir tekrarlayıcıyı sil |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Mesajları Yönet | Silmeden etkinleştir ya da devre dışı bırak |
| `repeatmessage <index> <message>` | `repmsg` | Mesajları Yönet | Mesajı değiştir |
| `repeatchannel <index> [#channel]` | `repchan` | Mesajları Yönet | Bir metin ya da forum kanalına taşı |
| `repeatredundant <index>` | `repeatredun`, `repred` | Mesajları Yönet | Fazlalık kontrolünü aç/kapat |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Mesajları Yönet | `timeinterval`, `immediate`, `aftermessages`, `onactivity` veya `onnoactivity` |
| `repeatactivity <index> <threshold> <window>` | `repactivity`, `repact` | Mesajları Yönet | Etkinlik eşiğini ve penceresini ayarla; örneğin `10 5m` |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Mesajları Yönet | Öncelik değerini ayarla |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Mesajları Yönet | `business`, `evening`, `weekend` ya da temizlemek için `none` |
| `repeatconversation <index>` | `repconversation`, `repconv` | Mesajları Yönet | Sohbet algılamayı aç/kapat |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Mesajları Yönet | Sessiz göndermeyi aç/kapat |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Mesajları Yönet | Yeni konularda göndermeyi aç/kapat |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Mesajları Yönet | Yalnızca konu modunu aç/kapat |
| `repeatforumtags <index> <add/remove/clear/list> [required/excluded] [tags]` | `repforumtags`, `repftags` | Mesajları Yönet | Forum etiketi filtrelerini etiket ID'sine göre yönet |

## İpuçları ve dikkat edilecekler

- Bot, kanalda Mesaj Gönder, Bağlantı Yerleştir ve Mesajları Yönet izinlerine ihtiyaç duyar; çünkü yeniden göndermeden önce kendi önceki kopyasını siler.
- Kanal silinirse ya da bot erişimini kaybederse tekrarlayıcı kendini kaldırır.
- Tekrarlayıcılar bot başladıktan kısa süre sonra yüklenir. Bu bitene kadar komutlar sessizce hiçbir şey yapmaz.
- Hemen modu, başkasının her mesajında yeniden gönderir; bu yüzden çok hızlı kanallarda kullanmaktan kaçın ya da Sohbet Algılama ile birlikte kullan.
- Herkesi ya da bir rolü etiketleyen bir tekrarlayıcı yalnızca Herkesi Etiketle iznine sahip bir üye oluşturabilir; aksi hâlde etiket kaçırılır.
- Etkinliğe dayalı modlar mesaj sayımına bağlıdır. Modları değiştirmeden önce bunu etkinleştir; yoksa komut reddeder.
- En fazla gösterim için son kullanma, elle tetiklediğin gönderiler dahil her gönderiyi sayar.

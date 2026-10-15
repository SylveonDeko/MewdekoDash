---
title: AFK Sistemi
slug: afk
summary: Üyelerin kendilerini uzakta olarak işaretlemesine, kendilerine etiket atan herkese nedenini söylemesine ve dönünce durumun otomatik olarak temizlenmesine izin ver.
icon: fa-moon
category: Actions
dashboard: /dashboard/afk
module: Afk
tags: [afk, away, idle, status, brb, mention reply, timed afk, placeholders, uzakta, boşta, durum, brb, etiket yanıtı, zamanlı afk, yer tutucular]
related: [utility, administration]
---

## Ne işe yarar

Bir üye isteğe bağlı bir mesajla `afk` komutunu çalıştırır. Bundan sonra birisi onu etiketlediğinde bot o kanalda mesajı ve ne kadar süredir uzakta olduğunu yanıtlar. Üye döndüğünde durum temizlenir, kısa bir "tekrar hoş geldin" bildirimi gönderilir ve bu bildirim beş saniye sonra silinir, takma ad da geri yüklenir.

Üye uzaktayken bot ayrıca adını `[AFK] name` olarak değiştirmeyi dener; Discord'un takma ad sınırına sığacak şekilde kısaltılır. Böylece durum üye listesinde görünür.

Argümansız `afk` çalıştırmak bir geçiş yapar: uzakta değilsen boş bir mesajla AFK'yı açar, uzaktaysan kapatır.

## Neden kullanmalısın

- Kalabalık sunucularda üyeler, "brb" yazdığını görmemiş insanlar tarafından tekrar tekrar etiketlenmekten kurtulur.
- Yetkililer kimin orada, kimin olmadığını bir bakışta görebilir.
- Zamanlı AFK, kimsenin temizlemeyi hatırlamak zorunda kalmadan "iki saat sonra döneceğim" durumunu kapsar.

## Durum nasıl biter

**AFK Türü** botun geri döndüğünü neyin belirlediğine karar verir. Sayfadaki en önemli ayardır.

| Tür | Durum şu zaman temizlenir |
| --- | --- |
| Kendi kendine kapatma | Yalnızca üye `afk` komutunu tekrar çalıştırdığında ya da yetkililer kaldırdığında. Otomatik bir şey yoktur. |
| Mesajda | Üye sunucuda herhangi bir yere mesaj yazdığında. |
| Yazıldığında | Üye herhangi bir kanalda yazmaya başladığında. |
| Her ikisi | Mesaj ya da yazma, hangisi önce gelirse. |

**AFK Zaman Aşımı**, durumun ayarlandığı andan itibaren ölçülen bir tolerans süresidir. Bu pencerenin içinde yazmak ya da mesaj göndermek durumu temizlemez; böylece "afk, brb" mesajının kendisi AFK'yı hemen bitirmez. Varsayılan 0'dır, yani tolerans süresi yoktur; `afktimeout` ile ya da kontrol panelindeki **Gelişmiş Ayarlar** sekmesinden ayarlanır.

Zamanlı AFK farklıdır: türü ne olursa olsun zamanlayıcısı dolana kadar sürer. Aradaki konuşmalar onu bitirmez. Zamanlayıcı dolduğunda durum, kanala bildirim gönderilmeden temizlenir ve takma ad geri yüklenir.

Bir mesajı gönderdikten sonra beş dakika içinde düzenlemek, yeni bir mesaj göndermekle aynı sayılır.

## Etiket yanıtı

Biri uzaktaki bir üyeyi etiketlediğinde bot mesaj başına en fazla beş etiketlenen kullanıcıyı kontrol eder, botları ve kendi etiketlerini yok sayar, komut ön ekiyle başlayan mesajları yok sayar ve devre dışı listesindeki kanalları atlar. Bulduğu her uzaktaki üye için bir yanıt gönderir.

Varsayılan olarak yanıt bir embed'dir: yazar satırı kullanıcının avatarıyla birlikte "user is currently away" der, açıklama AFK mesajıdır ve alt bilgi ne kadar süredir uzakta olduklarını gösterir. Bot davet düğmesi göstermeyecek şekilde yapılandırılmışsa bir düğme eklenir.

Bunu kendi mesajın ya da embed'in ile `customafkmessage` komutuyla ya da kontrol panelindeki **Özel AFK Embed Mesajı** düzenleyicisiyle değiştirebilirsin. Metin embed ayrıştırıcısından geçer, yani embed oluşturucunun ürettiği her şey çalışır. Varsayılana dönmek için `-` olarak ayarla.

### Yer tutucular

Bunlar özel bir AFK mesajının içinde değiştirilir. Yer tutucular sayfasındaki genel yer tutucular burada kullanılamaz; yalnızca bu küme geçerlidir.

| Yer tutucu | Değer |
| --- | --- |
| `%afk.message%` | AFK mesajı; etiketler etkisiz hale getirilmiş ve en fazla uzunluğa kırpılmış |
| `%afk.user%` | Uzaktaki üyenin kullanıcı adı |
| `%afk.user.mention%` | Uzaktaki üyenin etiketi |
| `%afk.user.avatar%` | Uzaktaki üyenin avatar URL'si |
| `%afk.user.id%` | Uzaktaki üyenin kullanıcı kimliği |
| `%afk.triggeruser%` | Onu etiketleyen kişinin kullanıcı adı |
| `%afk.triggeruser.mention%` | Onu etiketleyen kişinin etiketi |
| `%afk.triggeruser.avatar%` | Onu etiketleyen kişinin avatar URL'si |
| `%afk.triggeruser.id%` | Onu etiketleyen kişinin kullanıcı kimliği |
| `%afk.time%` | Ne kadar süredir uzakta oldukları, "2 hours" gibi kelimelerle |

> [!EXAMPLE]
> Düz metin bir yanıt: `%afk.user.mention% is away (%afk.time%): %afk.message%`

## Ayarlar

Bunların hepsi AFK sayfasında, **Temel Ayarlar** ve **Gelişmiş Ayarlar** sekmelerinin altındadır.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Otomatik silme süresi | 0 (asla) | Botun bir etikete verdiği yanıtın kendini silmeden önceki saniye sayısı |
| En fazla mesaj uzunluğu | 128 | Bir üyenin ayarlayabileceği en uzun AFK mesajı, 1 ile 4096 arası; daha uzunları reddedilir |
| AFK kaldırma türü | Kendi kendine kapatma | Yukarıdaki dört türden biri |
| AFK zaman aşımı | 0 (yok) | AFK ayarlandıktan sonraki tolerans süresi, en fazla iki saat |
| Devre dışı kanallar | yok | Uzaktaki bir üyeyi etiketlemenin yanıt almadığı kanallar |
| Özel AFK embed'i | varsayılan embed | Yukarıdaki yer tutucularla kendi yanıtın |

> [!TIP]
> Otomatik silmeyi otuz saniye civarına ayarla. Etiketleyen kişi yanıtı görür ve kanal eski AFK bildirimleriyle dolmaz.

**Kullanıcı Yönetimi** sekmesi şu an uzakta olan her üyeyi listeler ve yetkililerin bir ya da birden fazla kişinin durumunu tek seferde temizlemesine izin verir.

## Kurulum adımları

1. Kontrol panelinde **AFK Yönetimi**'ni aç.
2. Bir **AFK Kaldırma Türü** seç. "Mesajda" en güvenli varsayılandır; "Her ikisi" en kullanışlı olanıdır.
3. **Otomatik Silme Süresi**'ni 30 yap. **En Fazla Mesaj Uzunluğu**'nu, daha uzun durumlar istemiyorsan 128'de bırak.
4. **Gelişmiş Ayarlar**'da, bot komut kanallarını ve duyuru kanallarını **Devre Dışı Kanallar**'a ekle.
5. İstersen yukarıdaki yer tutucularla embed düzenleyicide özel bir yanıt oluştur.
6. Test et: `afk testing` çalıştır, başka bir hesaptan kendini etiketle, sonra bir mesaj gönder ve durumun temizlenişini izle.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `afk [message]` | | Yok | AFK mesajını ayarla ya da mesajsız AFK'yı aç/kapat |
| `timedafk <time> <message>` | `tafk` | Yok | Kendiliğinden biten AFK, örneğin `timedafk 2h dinner` |
| `getactiveafks` | `activeafks` | Yok | Şu an AFK olan herkesi listele |
| `afkview [@user]` | `viewafk` | Mesajları Yönet | Birinin mevcut AFK mesajını göster |
| `afkremove @user...` | `afkrm` | Mesajları Yönet | Bir ya da birden fazla üyenin durumunu temizle |
| `afkdel [seconds]` | `afkdelete` | Sunucuyu Yönet | Yanıt için otomatik silmeyi göster ya da ayarla |
| `afklength <number>` | `maxafklength` | Yönetici | AFK mesajı uzunluğunu sınırla |
| `afktype <type>` | | Yönetici | `selfdisable`, `onmessage`, `ontype` ya da `either` |
| `afktimeout <time>` | | Yönetici | Tolerans süresini ayarla, örneğin `30s` |
| `afkdisable #channel...` | | Kanalları Yönet | Yanıt verilmeyecek kanallar listesine ekle |
| `afkundisable #channel...` | | Kanalları Yönet | Yanıt verilmeyecek kanallar listesinden çıkar |
| `afkdisabledlist` | | Kanalları Yönet | Yanıt verilmeyecek kanallar listesini göster |
| `customafkmessage <text>` | `afkmessage` | Yönetici | Özel yanıtı ayarla ya da sıfırlamak için `-` |

## İpuçları ve dikkat edilecekler

- Yalnızca kendi durumunu temizlemek için bir komut yoktur. `afk` komutunu mesajsız tekrar çalıştır ya da tür kuralının temizlemesini bekle.
- Takma ad değişiklikleri için botun rolünün üyenin en üst rolünün üstünde olması ve Takma Adları Yönet yetkisinin bulunması gerekir. Sunucu sahibinin takma adı bir bot tarafından asla değiştirilemez; bu yüzden sahipler adlarını korur, ama durum yine de çalışır.
- AFK servisi önbelleğini bot başladıktan kısa süre sonra yükler. O zamana kadar komutlar AFK'nın hâlâ başladığını yanıtlar.
- AFK mesajının içindeki etiketler yanıtta etkisiz hale getirilir; bu yüzden üyeler durumlarını rolleri ya da herkesi etiketlemek için kullanamaz.

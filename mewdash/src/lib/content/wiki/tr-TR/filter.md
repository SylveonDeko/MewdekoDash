---
title: Mesaj Filtreleri
slug: filter
summary: Engellenen kelimeler, Discord davetleri veya bağlantılar içeren mesajları sil, isteğe bağlı olarak göndericiyi uyar ve ayrı bir otomatik yasak kelimeleri listesindekileri anında yasakla.
icon: fa-filter
category: Security
dashboard: /dashboard/filter
module: Permissions
tags: [filter, word filter, invite filter, link filter, automod, auto ban, blacklist, banned words, regex, filtre, kelime filtresi, davet filtresi, bağlantı filtresi, otomatik moderasyon, otomatik yasak, kara liste, yasaklı kelimeler, düzenli ifade]
related: [moderation, logging, administration]
---

## Ne yapar

Filtre, bir üyenin gönderdiği veya düzenlediği her mesajı diğer modüllerden önce kontrol eder. Mesaj, filtrenin etkin olduğu bir yerde filtrelenen bir kelime, bir Discord daveti veya bir bağlantı içeriyorsa bot onu siler. Moderasyon sistemi üzerinden bir uyarı vermesini ve üyeye neyin kaldırıldığını açıklayan bir DM göndermesini de sağlayabilirsin.

İkinci bir liste olan otomatik yasak kelimeleri daha serttir. Otomatik yasak kelimesiyle eşleşen bir mesaj silinir ve yazarı anında yasaklanır; bot gönderebiliyorsa nedenini içeren bir DM de gider.

Yönetici olanlar ve sunucunun yetkili rolüne sahip olanlar (`staffrole` ile ayarlanır) hiçbir zaman filtrelenmez. Bot mesajları da kontrol edilmez.

## Neden kullanmalısın

- Bir yetkili çevrimiçi değilken küfür ve diğer yasaklı terimleri sohbetten uzak tutmak istiyorsun.
- Üyelerin davet bağlantıları bırakarak başka sunucuları reklam yapmasını durdurmak istiyorsun.
- Medyasız bir duyuru kanalı gibi, bir kanalı yalnızca metin olacak şekilde ayarlamak için URL içeren her mesajı kaldırmak istiyorsun.
- Bilinen dolandırıcılık ifadeleri veya baskın imzaları gönderen hesapları anında yasaklamak istiyorsun.

## Filtre türleri

| Filtre | Nerede uygulanır | Ne olur |
| --- | --- | --- |
| Kelime filtresi | Yalnızca kelime filtresi kanal listesindeki kanallarda | Mesaj silinir; **Filtrelenen kelimede uyar** açıksa uyarı ve DM gönderilir |
| Davet filtresi | Sunucu anahtarı açıksa ve kanal listesi boşsa her yerde; liste doluysa yalnızca listedeki kanallarda | Mesaj silinir; **Davet bağlantısında uyar** açıksa uyarı ve DM gönderilir |
| Bağlantı filtresi | Sunucu anahtarı açıksa her yerde, ayrıca kendi listesindeki her kanalda | Mesaj silinir, uyarı yok |
| Otomatik yasak kelimeleri | Her yerde | Mesaj silinir, yazar DM alır ve yasaklanır |

Üç kanal listesi kontrol panelindeki **Kanal Geçersiz Kılmaları** bölümündedir. Kelime filtresinin tamamen kendi kanal listesiyle yönetildiğini unutma: kelimelerin kontrol edilmesi için bir kanalın bu listede olması gerekir.

## Kelimeler nasıl eşleşir

Filtrelenen kelimeler ve otomatik yasak kelimeleri düzenli ifade olarak ele alınır ve küçük harfe çevrilmiş mesaj içeriğine karşı test edilir. `example` gibi düz bir kelime alt dize olarak çalışır; bu yüzden `examples` da yakalanır. Derlenemeyen kalıplar listeden otomatik olarak çıkarılır. Her kalıbın eşleşme zaman aşımı 250 milisaniyedir.

Filtrelenen kelimeler küçük harfle saklanır ve büyük-küçük harf duyarsız eşleşir. Otomatik yasak kalıpları yazıldığı gibi saklanır ve küçük harfli metinle karşılaştırılır; bu yüzden onları küçük harfle yaz.

> [!WARNING]
> Otomatik yasak kalıpları çok güçlüdür. İçinde `ban` geçen kısa bir kalıp, "banana" yazan insanları yasaklar. Kalıpları önce filtrelenen kelime olarak test et.

## Uyarılar

**Filtrelenen kelimede uyar** veya **Davet bağlantısında uyar** açıldığında bot, moderasyon modülü üzerinden "Warned for Filtered Word" nedeniyle veya davet uyarısının nedeniyle bir uyarı ekler ve üyeye DM gönderir. Moderasyon sayfasındaki uyarı cezaları yine de normal şekilde uygulanır; yani uyarılar böyle ayarlanmışsa üç filtre ihlali bir sessize almaya veya atmaya yol açabilir.

Otomatik yasaklar, kaç günlük mesajın silineceğini belirlemek için moderasyon modülündeki "Filter" işlemi için yasak temizleme ayarlarını kullanır.

## Ayarlar

Mesaj Filtreleri sayfasında dört sekme vardır: **Filtreler**, **Filtrelenen kelimeler**, **Otomatik yasak kelimeleri** ve **Kanal Geçersiz Kılmaları**.

| Ayar | Varsayılan | Ne kontrol eder |
| --- | --- | --- |
| Kelime filtresi | Kapalı | **Filtreler** sekmesinde gösterilen sunucu genelindeki anahtar |
| Davet filtresi | Kapalı | Discord davet bağlantılarını siler; davet kanal listesinin çalışması için gereklidir |
| Bağlantı filtresi | Kapalı | Sunucu genelinde URL içeren her mesajı siler |
| Filtrelenen kelimede uyar | Kapalı | Bir filtrelenen kelime kaldırıldığında uyarı ekler ve üyeye DM gönderir |
| Davet bağlantısında uyar | Kapalı | Bir davet kaldırıldığında uyarı ekler ve üyeye DM gönderir |
| Filtrelenen kelimeler | yok | **Filtrelenen kelimeler** sekmesindeki liste; her kelime için kaldırma, `fwclear` ile aynı işi yapan bir **Tümünü temizle** düğmesi ve on kelimeden fazla olduğunda bir arama kutusu |
| Otomatik yasak kelimeleri | yok | **Otomatik yasak kelimeleri** sekmesindeki liste |
| Kelime filtresi kanalları | yok | Kelime listesinin uygulandığı kanallar |
| Davet filtresi kanalları | yok | Boş değilse davet filtresini yalnızca bu kanallarla sınırlar |
| Bağlantı filtresi kanalları | yok | Sunucu anahtarı kapalı olsa bile bağlantıların kaldırıldığı ek kanallar |

Sayfanın üstünde filtrelenen kelime, otomatik yasak kelimesi ve kanal geçersiz kılma sayıları gösterilir.

## Kurulum adımları

1. Kontrol panelinde **Mesaj Filtreleri**'ni aç.
2. **Filtrelenen kelimeler** sekmesinde her kelimeyi veya ifadeyi ekle ve ekle'ye bas.
3. **Kanal Geçersiz Kılmaları** bölümünde, kelime listesinin uygulanmasını istediğin her kanalı **Kelime filtresi kanalları** altına ekle.
4. **Filtreler** sekmesine dön; davetlerin her yerden silinmesini istiyorsan **Davet filtresi**'ni aç, davetin bir uyarı sayılmasını istiyorsan **Davet bağlantısında uyar**'ı aç.
5. İsteğe bağlı olarak **Otomatik yasak kelimeleri** sekmesine birkaç yüksek güvenilirlikli kalıp ekle.
6. Ekibini muaf tutmak için `staffrole @Moderators` çalıştır, sonra normal bir hesaptan filtrelenen bir kelime göndererek silindiğini doğrula.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Diğer adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `filterword <word>` | `fw` | Kimse | Kelime listesine bir kelime ekle; zaten varsa kaldır |
| `lstfilterwords` | `lfw` | Kimse | Filtrelenen kelime listesinde sayfa sayfa gez |
| `fwclear` | | Yönetici | Her filtrelenen kelimeyi kaldır, kelime kanal listesini temizle ve sunucu anahtarını kapat |
| `srvrfilterwords` | `sfw` | Kimse | Sunucu genelindeki kelime filtresi anahtarını aç/kapat |
| `chnlfilterwords` | `cfw` | Kimse | Geçerli kanalı kelime filtresi kanal listesinde aç/kapat |
| `srvrfilterinv` | `sfi` | Kimse | Sunucu genelindeki davet filtresini aç/kapat |
| `chnlfilterinv` | `cfi` | Kimse | Geçerli kanalı davet filtresi kanal listesinde aç/kapat |
| `srvrfilterlin` | `sfl` | Kimse | Sunucu genelindeki bağlantı filtresini aç/kapat |
| `chnlfilterlin` | `cfl` | Kimse | Geçerli kanalı bağlantı filtresi kanal listesinde aç/kapat |
| `fwarn <y or n>` | `filteredwarn` | Yönetici | Filtrelenen kelimeler için uyarıları aç veya kapat |
| `invwarn <y or n>` | `invitewarn` | Yönetici | Davet bağlantıları için uyarıları aç veya kapat |
| `autobanword <pattern>` | `autobanw` | Yönetici | Otomatik yasak listesine bir kalıp ekle; zaten varsa kaldır |
| `autobanwordlist` | `autobwlist` | Yönetici | Otomatik yasak listesinde sayfa sayfa gez |

> [!PERMISSION]
> Filtre anahtarlarının ve `filterword` komutunun kendi izin kontrolü yoktur. Bunları Permissions modülüyle kısıtla veya filtreleri kontrol panelinden yönet; orada kontrol paneli erişim kuralları geçerlidir.

## İpuçları ve dikkat edilecekler

- Bot, filtrelenen her kanalda **Mesajları Yönet** iznine ve otomatik yasak kelimeleri için **Üyeleri Yasakla** iznine ihtiyaç duyar.
- Düzenlenen mesajlar yeniden kontrol edilir; bu yüzden eski bir mesaja bağlantı eklemek yine de silinmesine yol açar.
- Filtreler yöneticilere, yetkili role ve botlara uygulanmaz. Bir yönetici hesabıyla test etme.
- `fwclear` listeyi boşaltmaktan daha fazlasını yapar: kelime filtresi kanal geçersiz kılmalarının tümünü de kaldırır.
- Geçersiz düzenli ifadeler sessizce listeden çıkarılır. Bir kelime kaybolursa, `(`, `[` veya `*` gibi kaçırılmamış karakterler içerip içermediğini kontrol et.
- Filtrenin neyi kaldırdığının kaydını tutmak istersen mesaj silmeleri için Logging özelliğini kullan.

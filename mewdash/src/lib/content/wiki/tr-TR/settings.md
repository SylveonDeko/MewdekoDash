---
title: Ayarlar
slug: settings
summary: Sunucu genelindeki temel ayarlar: komut öneki, dil, saat dilimi, günlük kanalları, susturma rolü, uyarı süresi ve birkaç sohbet yardımcı özelliği.
icon: fa-cog
category: Settings
dashboard: /dashboard/settings
module: Administration
tags: [settings, prefix, language, locale, timezone, mute role, warn expire, command log, staff role, member role, snipe, link previews, delmsgoncmd, ayarlar, önek, dil, yerel ayar, saat dilimi, susturma rolü, uyarı süresi, komut günlüğü, yetkili rolü, üye rolü, bağlantı önizlemeleri, mesaj snipe'lama]
related: [administration, logging, filter, suggestions]
---

## Ne işe yarar

Ayarlar sayfası, tek bir özellik yerine her modülü aynı anda etkileyen birkaç seçeneği içerir. Üyelerin komutlardan önce yazdığı öneki, botun yanıt verdiği dili, hatırlatıcılar ve zamanlanmış mesajlar için kullanılan saat dilimini ve komut kullanımı ile uyarıların kaydedildiği kanalları burada değiştirirsin.

Ayrıca susturma rolünün adını, susturulan bir üyenin diğer rollerini kaybedip kaybetmeyeceğini, uyarıların ne kadar süreyle geçerli kalacağını ve iki sohbet yardımcısını, yani mesaj snipe'lamayı ve mesaj bağlantı önizlemelerini kapsar.

Bu ayarların çoğunun karşılık gelen bir metin komutu vardır; bu yüzden yetkililer bunları Discord'dan da değiştirebilir. Birkaç ek ayar yalnızca komutlarda bulunur: yetkili rolü, üye rolü ve kanal bazında komut mesajı silme.

## Neden kullanırsın

- Sunucunda `.` başka bir bot tarafından kullanılıyor ve Mewdeko'yu `!` ya da `m!` üzerinde istiyorsun.
- Topluluğun İngilizce dışında bir dil konuşuyor ve botun yanıtlarının buna uymasını istiyorsun.
- Hatırlatıcıların ve zamanlanmış paylaşımların UTC yerine yerel saatte gelmesi gerekiyor.
- Yetkililer her komutun çalıştırıldığını ve her uyarının verildiğini kaydeden bir kanal istiyor.
- Uyarıların sonsuza kadar birikmek yerine belirli bir gün sonra silinmesini istiyorsun.
- Üyelerin silinmiş bir mesajı `snipe` ile geri getirebilmesini ya da yoğun bir sohbette bağlantı önizlemelerinin kapatılmasını istiyorsun.

## Önek

Önek, bir üyenin komuttan önce yazdığı metindir. Varsayılanı `.`dir. Herkes önek görmek için argümansız `prefix` komutunu çalıştırabilir. Yöneticiler `prefix <new>` ile ya da kontrol panelindeki **Komut Öneki** kutusuyla değiştirebilir. Eğik çizgi komutları öneklerden etkilenmez.

## Dil

Her sunucu `languageset <code>` komutuyla, örneğin `languageset de`, ya da kontrol panelindeki **Dil** açılır menüsüyle kendi yanıt dilini seçebilir. `languageset default` sunucuya özel geçersiz kılmayı kaldırır ve sunucu botun varsayılan dilini kullanır. `languageslist` desteklenen tüm yerel ayar kodlarını yazdırır. Argümansız `langsetdefault` bot varsayılanını gösterir; bu varsayılanı değiştirmek bot sahibinin işidir.

## Saat dilimi

Sunucu saat dilimi hatırlatıcıları, zamanlanmış mesajları ve tüm zaman gösterimlerini yönetir. Argümansız `timezone` mevcut değeri gösterir (ayarlanmamışsa UTC). `timezone <id>` bir IANA ya da Windows saat dilimi kimliği ile ayarlar, örneğin `Europe/London`; `timezones` ise botun kabul ettiği kimlikler arasında sayfalar. Kontrol panelinde **Sunucu Saat Dilimi** bir değer seçtiğin anda kaydeder; **Değişiklikleri Kaydet**'i beklemez.

## Günlük kanalları

**Komut Günlük Kanalı** komut kullanımını kaydeder. `commandlogchannel #channel` ile ayarla; kanal vermeden çalıştırırsan günlüğü kapatırsın.

**Uyarı Günlük Kanalı** moderasyon komutlarıyla verilen uyarıları kaydeder. Bu kontrol panelinden ayarlanır.

## Uyarılar

**Uyarı Son Kullanma** saat olarak saklanır. Sıfır, uyarıların hiç sona ermeyeceği anlamına gelir. `warnexpire` komutu ise gün cinsinden çalışır ve ikinci bir kelime alır: `warnexpire 30 clear` 30 günden eski uyarıları temizlenmiş olarak işaretler, `warnexpire 30 delete` ise bunları siler. Kabul edilen aralık 0 ile 366 gündür ve `warnexpire 0` süre sonunu kapatır.

## Susturma rolü ve rol kaldırma

**Susturma Rolü**, susturma komutlarının ve cezaların uyguladığı rolün adıdır. Bu adda bir rol yoksa bot onu oluşturur. Discord'dan `muterole @role` ayarı mevcut bir role yönlendirir; rol, sunucu sahibi değilsen kendi en yüksek rolünün altında olmalıdır. Argümansız `muterole` geçerli susturma rolünü gösterir.

**Susturulduğunda diğer tüm rolleri kaldır** bir susturma süresince bir üyenin diğer rollerini alır ve sonra geri verir. Komut biçimi `removeonmute y` ya da `removeonmute n`dir.

## Sohbet yardımcıları

| Ayar | Komut | Etkisi |
| --- | --- | --- |
| Mesaj snipe'lama | `snipeset enable` ya da `snipeset disable` | Üyelerin yakın zamanda silinmiş ya da düzenlenmiş mesajları geri getirmek için snipe komutlarını kullanmasına izin verir. Varsayılan olarak kapalıdır. |
| Mesaj bağlantı önizlemeleri | `previewlinks y` ya da `previewlinks n` | Biri bir Discord mesajı bağlantısı paylaştığında, botun o mesajın içeriğini göstermesini sağlar. |

## Yalnızca komutla yapılan ayarlar

Bunlar aynı Yönetim modülünün parçasıdır ancak kontrol panelinde karşılıkları yoktur.

**Yetkili rolü** (`staffrole @role`), üyeleri kelime, bağlantı ve davet filtrelerinden ve öneri spam kontrollerinden muaf tutulan bir rol belirler. Mevcut rolü görmek için `staffrole`, temizlemek için `staffroledisable` komutunu çalıştır.

**Üye rolü** (`memberrole @role`) sunucu için bir rol saklar. Kaydedilir ama şu an hiçbir özellik tarafından kullanılmaz.

**Komutta mesajı sil** (`delmsgoncmd`), komutu tetikleyen mesajı komut çalıştıktan sonra siler:

| Biçim | Etkisi |
| --- | --- |
| `delmsgoncmd` | Tüm sunucu için silmeyi aç/kapat |
| `delmsgoncmd list` | Sunucu ayarını ve her kanal geçersiz kılmasını göster |
| `delmsgoncmd channel enable [#channel]` | O kanalda her zaman sil (kanal yazılmazsa bulunduğun kanal) |
| `delmsgoncmd channel disable [#channel]` | O kanalda hiçbir zaman silme |
| `delmsgoncmd channel inherit [#channel]` | Sunucu ayarını takip et |

## Ayarlar

Aşağıdakilerin hepsi tek **Bot Ayarları** sayfasındadır. Düzenledikten sonra **Değişiklikleri Kaydet**'e bas; yalnızca **Sunucu Saat Dilimi** kendi kendine kaydedilir.

| Ayar | Varsayılan | Kontrol ettiği şey |
| --- | --- | --- |
| Komut Öneki | `.` | Komutlardan önce yazılan metin |
| Komut Günlük Kanalı | yok | Komut kullanımının kaydedildiği kanal |
| Para Birimi Emojisi | yok | Sunucu para birimi için gösterilen emoji |
| Uyarı Günlük Kanalı | yok | Uyarıların kaydedildiği kanal |
| Uyarı Son Kullanma | 0 (asla) | Uyarıların sona ereceği saat sayısı |
| Dil | Bot varsayılanı | Bu sunucunun yanıt dili |
| Sunucu Saat Dilimi | UTC | Zamanlanmış mesajlar, hatırlatıcılar ve zaman gösterimleri için saat dilimi |
| Susturma Rolü | Muted | Susturmalar ve cezalar tarafından uygulanan rolün adı |
| Susturulduğunda diğer tüm rolleri kaldır | Kapalı | Bir susturma süresince diğer rolleri kaldır |
| Mesaj snipe'lama | Kapalı | Snipe komutlarına izin ver |
| Mesaj bağlantı önizlemeleri | Kapalı | Discord mesaj bağlantılarını genişlet |

> [!NOTE]
> Sayfa yalnızca ortak temel ayarları kapsar. Günlükleme, moderasyon, yıldız panosu ve diğer özelliklerin kendi sayfaları ve ayarları vardır.

## Kurulum adımları

1. Kontrol panelinde **Ayarlar**'ı aç.
2. `.` başka bir botla çakışıyorsa **Komut Öneki**'ni ayarla.
3. Bir **Dil** ve bir **Sunucu Saat Dilimi** seç.
4. Yalnızca yetkililerin okuyabildiği bir **Komut Günlük Kanalı** ve bir **Uyarı Günlük Kanalı** seç.
5. **Uyarı Son Kullanma** değerini saat olarak ayarla; örneğin otuz gün için `720`, ya da 0 bırak.
6. **Susturma Rolü** adının moderatörlerinin zaten kullandığı rol adıyla eşleştiğini kontrol et; ya da `Muted` olarak bırakıp botun bir tane oluşturmasına izin ver.
7. İstersen **Mesaj snipe'lama** ya da **Mesaj bağlantı önizlemeleri** seçeneğini aç.
8. **Değişiklikleri Kaydet**'e bas.
9. Discord'da `staffrole @YourStaffRole` komutunu çalıştır; böylece filtreler ve öneri limitleri ekibini atlar.

## Komutlar

Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gereken | Amaç |
| --- | --- | --- | --- |
| `prefix [new prefix]` | | Görüntülemek için kimse, değiştirmek için Yönetici | Komut önekini göster ya da ayarla |
| `languageset <code>` | `langset` | Yönetici | Sunucu yanıt dilini ayarla, temizlemek için `default` |
| `langsetdefault` | `langsetd` | Görüntülemek için kimse, değiştirmek için Bot sahibi | Bot genelindeki varsayılan dili göster ya da ayarla |
| `languageslist` | `langli` | Kimse | Desteklenen yerel ayar kodlarını listele |
| `timezone [id]` | | Görüntülemek için kimse, değiştirmek için Yönetici | Sunucu saat dilimini göster ya da ayarla |
| `timezones` | | Kimse | Kabul edilen saat dilimi kimlikleri arasında sayfala |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Yönetici | Komut günlük kanalını ayarla; kanal yazılmazsa kapat |
| `warnexpire <days> <clear or delete>` | `warne` | Yönetici | Uyarıların kaç gün sonra süresinin dolacağını ayarla |
| `muterole [@role]` | `setmuterole` | Rolleri Yönet | Susturma rolünü göster ya da ayarla |
| `removeonmute <y or n>` | | Yönetici | Susturulduğunda diğer rolleri kaldır |
| `snipeset <enable or disable>` | `setsnipe` | Yönetici | Snipe komutlarına izin ver ya da engelle |
| `previewlinks <y or n>` | `plinks` | Yönetici | Discord mesaj bağlantılarını genişlet |
| `staffrole [@role]` | | Yönetici | Yetkili rolünü göster ya da ayarla |
| `staffroledisable` | | Yönetici | Yetkili rolünü temizle |
| `memberrole [@role]` | | Yönetici | Üye rolünü göster ya da ayarla |
| `delmsgoncmd [list or channel <state> [#channel]]` | `dmc` | Yönetici | Komut mesajlarını sunucu genelinde ya da kanal bazında sil |

## İpuçları ve dikkat edilecekler

- `delmsgoncmd` için botun Mesajları Yönet iznine ihtiyacı vardır; yoksa komut çalışmayı reddeder.
- Kontrol paneli uyarı süresini saat olarak tutar, `warnexpire` ise gün kullanır. `warnexpire 1` ile kontrol panelindeki `24` değeri aynı şeydir.
- `muterole`, verdiğin rolü kendi en yüksek rolünle karşılaştırır. Yetki hatası alırsan sahibe danış ya da daha düşük bir rol seç.
- Eğik çizgi komutları önekleri tamamen yok sayar; bu yüzden önek değişikliği yalnızca metin komutlarını etkiler.
- Yetkili rolü muafiyeti yalnızca filtreleri ve öneri spam kontrollerini kapsar. Komut izni vermez; bunun için İzinler modülünü kullan.

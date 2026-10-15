---
title: Kayıt
slug: logging
summary: Katılmaları, ayrılmaları, düzenlemeleri, silmeleri, banları, rol ve kanal değişikliklerini ve daha fazlasını seçtiğin günlük kanallarına gönder; olay başına yönlendirme ve kanal hariç tutmalarıyla.
icon: fa-file
category: Security
dashboard: /dashboard/logging
module: Administration
tags: [logging, logs, audit, events, message deleted, message edited, join leave, mod log, ignored channels, kayıt, günlük, denetim, olaylar, mesaj silindi, mesaj düzenlendi, katılma ayrılma, mod günlüğü, yok sayılan kanallar]
related: [moderation, administration, filter]
---

## Ne işe yarar

Kayıt, Discord'un bota gönderdiği olayları izler ve her birinin özetini seçtiğin bir metin kanalına gönderir. Silinen bir mesaj, kimin yazdığını ve ne dediğini gösterir. Bir üyenin katılması hesap yaşını gösterir. Bir rol değişikliği hangi rollerin eklendiğini ya da kaldırıldığını gösterir. Bot denetim günlüğünü okuyabiliyorsa, işlemi yapan yetkiliyi de adıyla belirtir.

Her olay türünün kendi kanal ayarı vardır; böylece mesaj düzenlemelerini bir kanala, moderasyon işlemlerini başka bir kanala gönderebilir, gerisini kapalı bırakabilirsin. Bir kanal atayana kadar hiçbir şey kaydedilmez ve kanalı boş olan bir olay türü sessizce atlanır.

Kanallar da hariç tutulabilir. Yok sayılan bir kanal için mesaj, konu ya da ses kaydı hiç üretilmez; bu da yetkililer odalarını ve bot spam kanallarını kayıttan uzak tutar.

## Neden kullanmalısın

- Moderatörlerin sonradan neyin kaldırıldığını görebilmesi için silinen ve düzenlenen mesajların bir kopyasını tutmak.
- Hesap oluşturma tarihleriyle birlikte kimin katıldığını ve ayrıldığını izleyip baskınları ve alt hesapları fark etmek.
- Sorumluluk için banları, ban kaldırmaları ve susturmaları sorumlu moderatörle birlikte kaydetmek.
- Diğer yöneticilerin ya da ele geçirilmiş hesapların yaptığı rol, kanal ve yetki değişikliklerini izlemek.
- Sesli kanalların ana buluşma yeri olduğu sunucularda ses etkinliğini takip etmek.

## Kayıt olay türleri

Her tür farklı bir kanala işaret edebilir ya da kapalı bırakılabilir. Bunlar `log` komutunun kabul ettiği ve kontrol panelinde gösterilen değerlerdir.

| Tür | Panel etiketi | Ne zaman kaydedilir |
| --- | --- | --- |
| `MessageUpdated` | Mesaj Güncellendi | Bir mesajın içeriği düzenlenir (bot yazarları ve değişmemiş içerik atlanır) |
| `MessageDeleted` | Mesaj Silindi | Bir mesaj silinir |
| `MessagesBulkDeleted` | Toplu Mesajlar Silindi | Birden fazla mesaj tek seferde temizlenir; önbellekteki mesaj sayısı ile birlikte |
| `ReactionEvents` | Tepki Olayları | Tepkiler eklenir ya da kaldırılır; mesaj başına her beş saniyede bir gruplanır |
| `ThreadCreated` | Konu Oluşturuldu | Bir konu oluşturulur |
| `ThreadDeleted` | Konu Silindi | Bir konu silinir |
| `ThreadUpdated` | Konu Güncellendi | Bir konunun adı, arşiv durumu ya da benzeri bir şey değişir |
| `UsernameUpdated` | Kullanıcı Adı Güncellendi | Bir üyenin genel kullanıcı adı değişir |
| `NicknameUpdated` | Takma Ad Güncellendi | Bir üyenin sunucu takma adı değişir |
| `UserUpdated` | Kullanıcı Güncellendi | Bir üyenin profili, örneğin avatarı ya da genel adı değişir |
| `UserJoined` | Kullanıcı Katıldı | Bir üye sunucuya katılır |
| `UserLeft` | Kullanıcı Ayrıldı | Bir üye ayrılır ya da atılır |
| `UserRoleAdded` | Kullanıcıya Rol Eklendi | Bir üyeye bir ya da birden fazla rol verilir |
| `UserRoleRemoved` | Kullanıcıdan Rol Kaldırıldı | Bir üyeden bir ya da birden fazla rol alınır |
| `UserBanned` | Kullanıcı Yasaklandı | Bir üye banlanır |
| `UserUnbanned` | Kullanıcının Yasağı Kaldırıldı | Bir ban kaldırılır |
| `UserMuted` | Kullanıcı Susturuldu | Bir üye sesli ya da yazılı olarak susturulur |
| `VoicePresence` | Ses Varlığı | Bir üye ses kanalına katılır, ayrılır, taşınır, susturulur, sağırlaştırılır ya da yayın yapar |
| `VoicePresenceTts` | Ses Varlığı TTS | Bir üye seste metinden konuşmayı kullanmış olabilir; tespit en iyi çabayla yapılır |
| `ServerUpdated` | Sunucu Güncellendi | Ad, simge ya da sahip gibi sunucu ayarları değişir |
| `EventCreated` | Etkinlik Oluşturuldu | Planlanmış bir sunucu etkinliği oluşturulur |
| `InviteCreated` | Davet Oluşturuldu | Bir davet oluşturulur; maksimum süresi ve kullanım sayısıyla birlikte |
| `InviteDeleted` | Davet Silindi | Bir davet silinir |
| `RoleCreated` | Rol Oluşturuldu | Bir rol oluşturulur |
| `RoleDeleted` | Rol Silindi | Bir rol silinir |
| `RoleUpdated` | Rol Güncellendi | Bir rolün adı, rengi ya da yetkileri değişir |
| `ChannelCreated` | Kanal Oluşturuldu | Bir kanal oluşturulur |
| `ChannelDestroyed` | Kanal Silindi | Bir kanal silinir |
| `ChannelUpdated` | Kanal Güncellendi | Bir kanalın adı, konusu ya da yetkileri değişir |
| `Other` | Diğer | Yukarıda yer almayan çeşitli olaylar |

Kontrol panelinde ayrıca bir **Profil Fotoğrafı Güncellendi** girişi de gösterilir. Bu, diğerleriyle birlikte saklanır ve Kullanıcılar ile Tümü kategorileri tarafından ayarlanır, ancak `log` komutuna geçilebilecek bir değer değildir.

## Kategoriler

`logcategory`, tüm bir türü grubunu tek adımda tek bir kanala ayarlar. Kanal belirtmeden çalıştırmak o gruptaki her türü temizler.

| Kategori | Ayarladığı türler |
| --- | --- |
| `All` | Yukarıdaki her tür |
| `Users` | NicknameUpdated, AvatarUpdated, UsernameUpdated, UserRoleAdded, UserRoleRemoved, VoicePresence, UserJoined, UserLeft, UserUpdated |
| `Threads` | ThreadCreated, ThreadDeleted, ThreadUpdated |
| `Roles` | RoleCreated, RoleDeleted, RoleUpdated |
| `Server` | ServerUpdated, EventCreated, InviteCreated, InviteDeleted |
| `Channel` | ChannelCreated, ChannelDestroyed, ChannelUpdated |
| `Messages` | MessageDeleted, MessageUpdated, MessagesBulkDeleted, ReactionEvents |
| `Moderation` | UserMuted, UserBanned, UserUnbanned, Other |
| `None` | Her türü temizler (kontrol panelindeki **Tümünü Devre Dışı Bırak** tarafından kullanılır) |

## Yok sayılan kanallar

Yok sayılan listedeki herhangi bir kanal, içinde gerçekleşen mesaj, konu, kanal ve ses olayları için atlanır. Konular üst kanalından ayarı devralır; bu yüzden bir forumu ya da metin kanalını yok saymak onun konularını da yok sayar. Bir ses kanalını yok saymak, o kanala giriş ve çıkışlar için ses varlığı kayıtlarını bastırır.

Bir kanalı yok saymak üye, rol ve sunucu olaylarını durdurmaz; çünkü bunlar bir kanala bağlı değildir.

## Ayarlar

Kayıt sayfasında iki sekme vardır: **Günlük Kanalları** ve **Yok Sayılan Kanallar**.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Günlük Kanalları | yok | Her olay türü için bir kanal seçici; Popüler, Kullanıcılar, Mesajlar, Moderasyon, Sunucu, Kanallar, Roller, Konu başlıkları, Ses ve Tüm Olaylar gruplarında |
| Kategoriyi Temizle | | Baktığın gruptaki her seçiciyi boşaltır; **Yapılandırmayı Kaydet**'e basıldığında etkili olur |
| Hepsini Temizle | | **Tüm Olaylar** grubunda gösterilir; her seçiciyi boşaltır, kaydedildiğinde uygulanır |
| Tümünü Devre Dışı Bırak | | Bir kanal ayarlıyken başlıkta gösterilen düğme; onaydan sonra her olay türünün atamasını hemen kaldırır, yok sayılan kanalları korur |
| Yok Sayılan Kanallar | yok | Kayıttan hariç tutulan kanallar; **Aktif Kanallar** ve **Yok Sayılan Kanallar** listeleri arasında taşınır |

> [!TIP]
> **Popüler** grubu Kullanıcı Katıldı, Kullanıcı Ayrıldı, Mesaj Silindi, Mesaj Güncellendi, Kullanıcı Yasaklandı, Kullanıcının Yasağı Kaldırıldı, Kanal Oluşturuldu ve Kanal Silindi'yi içerir. Çoğu sunucu için iyi bir başlangıç setidir.

## Kurulum adımları

1. Yalnızca yetkililerin okuyabildiği bir ya da birden fazla özel kayıt kanalı oluştur.
2. Kontrol panelinde **Kayıt**'ı aç ve **Günlük Kanalları** sekmesinde kal.
3. **Popüler** grubunda istediğin her olay için kayıt kanalını seç ve kaydet.
4. **Moderasyon** ya da **Ses** gibi diğer gruplara geçip başka ihtiyacın olan şeyler için kanal ata.
5. **Yok Sayılan Kanallar** sekmesini aç ve yetkili odalarını ve bot komut kanallarını yok sayılan listeye taşı.
6. Bir test mesajı sil ve kaydın doğru kanalda göründüğünü doğrula.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Eğik çizgi karşılıkları `/log` altında yer alır.

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `log <type> [#channel]` | | Yönetici | Bir olay türünü bir kanala gönder; kanal belirtilmezse geçerli kanal kullanılır |
| `log #channel [types...]` | | Yönetici | Birden fazla türü tek bir kanala gönder; hiçbiri verilmezse tüm türlerin bulunduğu bir seçim menüsü aç |
| `log "#channel:Type1,Type2" ...` | | Yönetici | Tek mesajda birden fazla kanal ve tür çiftini ayarla |
| `logcategory <category> [#channel]` | `logcat` | Yönetici | Tüm bir kategoriyi bir kanala yönlendir ya da kanal belirtmeden temizle |
| `logevents` | | Yönetici | Her olay türünü ve şu anda kullandığı kanalı listele |
| `logignore [#channel]` | `lignore` | Yönetici | Bir kanalı yok sayılan listeye ekle ya da çıkar; varsayılan olarak geçerli kanal |
| `logignorelist` | `lignorel` | Yönetici | Yok sayılan listeyi göster |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Yönetici | Bot komut kullanımını bir kanala kaydet ya da kanal belirtmeden kapat |

> [!EXAMPLE]
> `log "#mod-logs:UserBanned,UserUnbanned,UserMuted" "#message-logs:MessageDeleted,MessageUpdated"`

## İpuçları ve dikkat edilecekler

- Botun **Sunucu Kayıtlarını Görüntüle** yetkisi olsun. Bu olmadan kayıtlar yine gönderilir ancak bir mesajı hangi moderatörün sildiğini, birini kimin banladığını ya da bir rolü kimin değiştirdiğini söyleyemez.
- Bot her kayıt kanalını görebilmeli ve mesaj gönderebilmelidir. Göremediği bir kayıt kanalı hata vermeden atlanır.
- Silinen ve düzenlenen mesaj kayıtları botun mesaj önbelleğine dayanır. Botun son yeniden başlatılmasından önce gönderilen mesajlar ya da toplu temizlikler önbelleğe alınmamış olarak görünebilir.
- Tepki kayıtları gruplanır: bir mesajdaki tüm tepki değişiklikleri yaklaşık beş saniye içinde tek bir girdi olarak gelir; bu, yoğun sunucuları boğmamak içindir.
- `log #channel` ile açılan seçim menüsü kanal başına en fazla 25 tür listeler ve o kanala zaten gönderilenleri önceden seçili getirir.
- `logcategory`, yönlendirdiğin türler de dahil olmak üzere kategorideki her türün üzerine yazar. Bundan sonra tek tek türler için `log` kullan.

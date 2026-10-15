---
title: Rol Karşılamaları
slug: rolegreets
summary: Bir üye belirli bir rolü aldığında bir kanala özel mesaj gönder; yer tutucular, embed'ler, webhook'lar ve otomatik silme desteklenir.
icon: fa-user
category: Actions
dashboard: /dashboard/rolegreets
module: RoleGreets
tags: [role greet, role greets, welcome, role message, role announcement, verification welcome, webhook greet, rol karşılaması, karşılama, hoş geldin, rol mesajı, rol duyurusu, doğrulama karşılaması, webhook karşılaması]
related: [multigreets, embedbuilder, administration]
---

## Ne işe yarar

Rol karşılaması, bir üye bir rol aldığında botun gönderdiği bir mesajdır. Yetkililer bir rol ve bir kanal seçer, mesajı yazar ve o andan itibaren o rol birine eklendiğinde bot mesajı orada paylaşır. Varsayılan mesaj `Welcome %user.mention%!` şeklindedir.

Mesaj embed ayrıştırıcısından geçer; yani düz metin, tam bir embed ya da kontrol panelindeki düzenleyicide oluşturulmuş düğmeli bir embed olabilir. Yer tutucular üyenin adını, avatarını, katılma tarihini ve sunucu bilgilerini doldurur. Her karşılama kendi adı ve avatarıyla bir webhook üzerinden gönderilebilir ve belirlenen saniye sonunda kendini silebilir.

Karşılamalar rol ve kanal bazındadır. Bir rolün, her biri farklı bir kanalda ya da farklı bir mesajla olan en fazla on karşılaması olabilir ve bir karşılama silinmeden devre dışı bırakılabilir.

## Neden kullanmalısın

- Ana sohbete yalnızca doğrulamayı geçip Doğrulanmış rolünü aldıktan sonra hoş geldin demek istiyorsun.
- Bir booster rolü belirdiğinde yeni booster'ları bir teşekkür kanalında duyurmak istiyorsun.
- Bir oyun rolü seçen birine o oyunun kanallarının nerede olduğunu söylemek istiyorsun.
- Bir moderatör rolü verildiğinde yetkililer kanalına bir yetkili oryantasyon kontrol listesi göndermek istiyorsun.
- Bir çekiliş ya da etkinlik rolüne eklenen üyeleri o etkinliğin kurallarıyla karşılamak istiyorsun.

## Karşılama nasıl tetiklenir

Bot üye güncellemelerini izler ve rolleri önce ve sonra karşılaştırır. Eklenen her rol için o rolün karşılamalarına bakar ve her birini gönderir. Kaldırılan roller hiçbir şeyi tetiklemez. Botlar, karşılama için **Botları karşıla** açık değilse atlanır; devre dışı bir karşılama yok sayılır.

Kanal artık yoksa karşılama kendini siler. Bir webhook karşılaması, webhook silindiği ya da bot izni kaybettiği için başarısız olursa karşılama kaldırılmaz, devre dışı bırakılır; böylece sorunu düzeltip yeniden etkinleştirebilirsin.

Bir webhook ayarlıysa mesaj webhook'un adı ve avatarıyla gönderilir. Otomatik silme yine çalışır: bot az önce gönderdiği mesajı çeker ve belirlenen gecikmeden sonra siler.

## Yer tutucular

Rol karşılamaları kullanıcı, sunucu ve bot yer tutucu gruplarını destekler. Kanal yer tutucuları kullanılamaz.

| Yer tutucu | Değer |
| --- | --- |
| `%user.mention%`, `%user%` | Rolü alan üyeye etiket |
| `%user.name%`, `%username%` | Kullanıcı adı |
| `%user.fullname%` | Etiketiyle birlikte kullanıcı adı |
| `%user.avatar%` | Avatar URL'si |
| `%user.banner%` | Banner URL'si |
| `%user.id%` | Kullanıcı kimliği |
| `%user.created_date%`, `%user.created_time%` | Hesap oluşturulma tarihi ve saati |
| `%user.joined_date%`, `%user.joined_time%` | Sunucuya katılma tarihi ve saati |
| `%server.name%`, `%server%` | Sunucu adı |
| `%server.members%` | Önbellekteki üye sayısı |
| `%server.icon%`, `%server.banner%` | Sunucu simgesi ve banner URL'leri |
| `%server.boostlevel%`, `%server.boostcount%` | Boost seviyesi ve sayısı |
| `%server.time%`, `%time.day%` | Sunucu saati ve haftanın günü |
| `%bot.name%`, `%bot.avatar%`, `%bot.id%` | Botun adı, avatarı ve kimliği |

Sunucuda davet takibi açıksa, Multi Greets'teki davet eden ve davet yer tutucuları (`%inviter.username%`, `%inviter.mention%`, `%inviter.count%`, `%invite.code%`, `%invite.label%` ve diğerleri) da üyeyi davet edenden doldurulur. Davet eden bilinmiyorsa bunlar `Unknown` olarak görünür.

> [!EXAMPLE]
> `Welcome to the team, %user.mention%! You are member number %server.members%. Check the pins in this channel first.`

## Ayarlar

Rol Karşılamaları sayfasının üstünde bir **Yeni Rol Karşılaması Ekle** formu ve altında her karşılama için bir kart bulunur.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Rol | yok | Karşılamayı tetikleyen rol |
| Kanal | yok | Mesajın gönderildiği yer |
| Mesaj | `Welcome %user.mention%!` | Embed düzenleyicisini açar |
| Silme Süresi (saniye, kalıcı için 0) | 0 | Otomatik silme gecikmesi |
| Webhook URL'si (isteğe bağlı) | yok | Botun yerine bir webhook üzerinden gönderir |
| Botları karşıla | kapalı | Rolü alan bot hesaplarını da karşılar |
| Etkin | açık | Karttan açılıp kapatılır; devre dışı karşılamalar hiçbir şey yapmaz |

## Kurulum adımları

1. Kontrol panelinde **Rol Karşılamaları**'nı aç.
2. **Yeni Rol Karşılaması Ekle** bölümünde **Rol**'ü ve **Kanal**'ı seç, sonra **Rol Karşılaması Ekle**'ye tıkla.
3. Yeni kartta mesaj kutusuna tıklayıp düzenleyiciyi aç ve yukarıdaki yer tutucularla karşılama mesajını yaz.
4. Kanal düzenli kalsın istiyorsan **Silme Süresi**'ni ayarla; özel bir ad ve avatar istiyorsan bir **Webhook URL'si** yapıştır.
5. Kartı kaydet, rolü bir test hesabına ver ve kanalı kontrol et.
6. Bir karşılamayı duraklatmak için karttaki anahtarı, silmek için silme düğmesini kullan.

> [!TIP]
> Discord'da `rolegreetmessage 1` metin olmadan çalıştırılırsa mevcut mesajı gösterir ve kendi bilgilerinle önizleme yapan bir **Önizleme** düğmesi sunar.

## Komutlar

Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Karşılamalar `rolegreetlist` içindeki konumlarına göre numaralandırılır.

| Komut | Diğer adlar | Gereken yetki | Amaç |
| --- | --- | --- | --- |
| `rolegreetadd <@role> [#channel]` | `rgadd`, `rga` | Yönetici | Bir rol için karşılama ekler; kanal verilmezse bulunulan kanalda |
| `rolegreetlist` | `rglist`, `rgl` | Yönetici | Her karşılamayı ayarlarıyla sayfa sayfa gösterir |
| `rolegreetmessage <id> [message]` | `rgmsg`, `rgm` | Yönetici | Mesajı ayarlar; metin olmadan gösterir ve önizler |
| `rolegreetremove <id or @role>` | `rgrem`, `rgrm`, `rgr` | Yönetici | Numarayla tek bir karşılamayı ya da onaydan sonra bir rolün tüm karşılamalarını siler |
| `rolegreetdelete <id> <time or seconds>` | `rgdel`, `rgd` | Yönetici | Otomatik silme gecikmesi, örneğin `30s` ya da `30`; `0` kapatır |
| `rolegreetdisable <id> <true/false>` | `rgdisable`, `rgdis` | Yönetici | Bir karşılamayı devre dışı bırakır ya da yeniden etkinleştirir |
| `rolegreetgreetbots <id> <true/false>` | `rolegreetbots`, `rggb` | Yönetici | Botların karşılamayı tetikleyip tetiklemeyeceğini belirler |
| `rolegreetwebhook <id> [name] [avatar url]` | `rgwebhook`, `rghook`, `rgh` | Yönetici | Karşılama kanalında verilen ad ve avatarla bir webhook oluşturur; ad verilmezse temizler |

Eğik çizgi komutları `/rolegreets` altında aynı işlemlerle bulunur: `add`, `remove`, `removerole`, `message`, `delete`, `disable`, `greetbots`, `webhook` ve `list`.

## İpuçları ve dikkat edilecekler

- Botun karşılama kanalında Mesaj Gönder ve Bağlantı Yerleştir iznine, otomatik silme için orada Mesajları Yönet iznine ve `rolegreetwebhook` ile webhook oluşturmak için Webhook'ları Yönet iznine ihtiyacı var.
- Sınır rol başına on karşılamadır, sunucu başına değil. Ekleme komutu on birincisini reddeder.
- Karşılamalar tepki rolleri, seviye ödülleri ve diğer botlardan gelen her rol eklemesinde tetiklenir; bu yüzden sık eklenip kaldırılan bir rol kanalı spam'e boğabilir.
- Embed ayrıştırıcısı hiçbir şey üretmezse, örneğin yalnızca boşluklardan oluşan bir mesaj, hiçbir şey gönderilmez.
- `rolegreetremove` bir rolle kullanılırsa evet/hayır onayından sonra o rolün tüm karşılamalarını siler; numarayla kullanılırsa yalnızca o karşılamayı hemen siler.
- Bir karşılama silindiğinde numaralar kayar. Numarayla düzenlemeden önce `rolegreetlist` komutunu yeniden çalıştır.
- Rol karşılamaları, MultiGreets sayfasındaki katılım karşılamalarından ayrıdır. Sunucuya katılan kişiler için MultiGreets'i, sonradan rol kazananlar için rol karşılamalarını kullan.

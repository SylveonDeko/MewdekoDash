---
title: Karşılamalar
slug: multigreets
summary: Bir üye katıldığında en fazla otuz kanalda hoş geldin mesajı gönder; ayrıca klasik ayrılma, boost ve DM karşılamaları.
icon: fa-bell
category: Actions
dashboard: /dashboard/multigreets
module: MultiGreets
tags: [greets, multigreets, welcome, join message, goodbye, bye, leave message, boost message, greet dm, webhook, placeholders, karşılama, hoş geldin, katılma mesajı, ayrılma mesajı, boost mesajı, karşılama dm, yer tutucular]
related: [rolegreets, invites, administration]
---

## Ne işe yarar

Bir üye katıldığında bot, karşılama olarak ayarladığın her kanala bir mesaj gönderir. Her karşılamanın kendi mesajı, kendi silme süresi, kendi webhook kimliği ve kendi bot anahtarı vardır. Hepsini aynı anda çalıştırabilir ya da her katılımda rastgele birini seçtirebilirsin.

Mesajlar embed ayrıştırıcısından geçer; bu yüzden bir karşılama düz metin, düğmeli tam bir embed ya da özel adı ve avatarı olan bir webhook gönderisi olabilir. Yer tutucular üyenin adını, sunucunun adını, üye sayısını ve davet takibi açıksa kişinin kimi davet ettiğini doldurur.

Eski tek mesajlı sistem de hâlâ mevcuttur. Bu sistem bir üye ayrıldığında ayrılma mesajını, biri boost yaptığında boost duyurusunu ve özel bir hoş geldin DM'ini yönetir. Bunlar Yönetim modülündedir ve aşağıda ayrıca anlatılmıştır.

## Neden kullanmalısın

- Aynı katılımda hem `#general` kanalında herkese açık bir hoş geldin, hem de `#staff-joins` kanalında sessiz bir kayıt satırı göndermek.
- Kanala göre farklı karşılama tarzları: bir kanalda embed, başka bir kanalda webhook "karakteri".
- Her yeni üyenin rastgele seçilen bir karşılama almasını sağlayan bir mesaj havuzu.
- Kanalın dolmaması için bir dakika sonra kendini silen kısa bir hoş geldin mesajı.
- Hiçbir ek kurulum yapmadan bir ayrılma veya boost mesajı.

## Karşılama türleri

**Karşılama Türü** sunucu genelinde geçerlidir ve bir katılımda ne olacağını belirler.

| Tür | Kontrol paneli etiketi | Ne olur |
| --- | --- | --- |
| MultiGreet | Tüm Karşılamalar | Eklendikleri sırayla her etkin karşılama tetiklenir. Varsayılan budur. |
| RandomGreet | Rastgele Karşılama | Listeden rastgele bir karşılama seçilir ve tetiklenir. Devre dışı karşılamalar seçilebilir ve sonra atlanır. |
| Off | Devre dışı | Hiçbir karşılama tetiklenmez. |

## Bir karşılamanın içeriği

Her karşılama bir kanala bağlıdır. Bir kanalda en fazla beş karşılama olabilir; sunucuda toplamda otuz karşılama olabilir. Karşılamalar listedeki konumlarına göre numaralandırılır ve komutlar bu numarayı kullanır.

| Alan | Varsayılan | Anlamı |
| --- | --- | --- |
| Kanal | eklediğin kanal | Bu karşılamanın gönderildiği yer |
| Mesaj | boş | Metin veya embed şablonu. Boş bir karşılama hiçbir şey göndermez. |
| Şu süre sonra sil | 0 (asla) | Karşılamanın kendini silmesi için geçecek saniye |
| Botları karşıla | kapalı | Bir bot hesabı katıldığında karşılamanın tetiklenip tetiklenmeyeceği |
| Webhook | yok | Botun kendi adıyla değil, özel adı ve avatarı olan bir webhook üzerinden gönderim |
| Etkin | açık | Devre dışı karşılamalar silinmeden atlanır |

Kanal silinirse karşılama bir sonraki tetiklenme denemesinde kaldırılır. Bir webhook silinir ya da bot gönderme iznini kaybederse, karşılama her katılımda hata vermek yerine devre dışı bırakılır.

## Yer tutucular

Karşılamalar kullanıcı, sunucu ve bot yer tutucu gruplarıyla oluşturulur. Davet yer tutucuları yalnızca Davetler sayfasında davet takibi açıkken çalışır.

| Yer tutucu | Değer |
| --- | --- |
| `%user%`, `%user.mention%` | Yeni üyenin etiketi |
| `%user.name%`, `%username%` | Kullanıcı adı |
| `%user.fullname%`, `%userfull%` | Tam etiket |
| `%user.id%`, `%id%` | Kullanıcı kimliği |
| `%user.avatar%`, `%useravatar%` | Avatar URL'si |
| `%user.banner%` | Afiş URL'si |
| `%user.created_date%`, `%user.created_time%` | Hesabın oluşturulma zamanı |
| `%user.joined_date%`, `%user.joined_time%` | Bu sunucuya katılma zamanı |
| `%server%`, `%server.name%` | Sunucu adı |
| `%server.id%`, `%sid%` | Sunucu kimliği |
| `%server.icon%`, `%server.banner%` | Simge ve afiş URL'leri |
| `%server.members%`, `%members%` | Üye sayısı |
| `%server.boostlevel%`, `%server.boostcount%` | Boost seviyesi ve boost sayısı |
| `%server.time%`, `%server.timestamp.longdatetime%` | Şu anki zaman; düz metin ya da Discord zaman damgası olarak |
| `%bot.name%`, `%bot.id%`, `%bot.avatar%` | Botun kendisi hakkında bilgiler |
| `%inviter.username%`, `%inviter.mention%`, `%inviter.id%`, `%inviter.avatar%` | Kullanılan daveti yapan kişi ya da `Unknown` |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | Davet edenin davet sayıları |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%` | Kullanılan davet, etiketi ve türü: davet, özel bağlantı ya da uygulama |
| `%user.joincount%`, `%user.leavecount%` | Bu üyenin kaç kez katıldığı ve ayrıldığı |
| `%server.members.ordinal%` | Üye sayısı 1., 2., 1.204. biçiminde |
| `%user.joined.R%`, `%user.created.F%` (ve t, T, d, D, f biçimleri) | Katılma ve hesap oluşturma zamanları Discord zaman damgası olarak |

> [!EXAMPLE]
> `Welcome %user.mention% to %server%! You are member #%server.members%.`

Sunucu, kanal ve bot yer tutucularının tam listesi yer tutucular sayfasındadır. Kanal yer tutucuları karşılamalarda doldurulmaz.

## Klasik karşılama, ayrılma ve boost komutları

Bunlar çoklu karşılamalardan önce gelir ve Yönetim modülünde yer alır. Her biri tek bir mesajdır, sunucu yapılandırmasında saklanır ve komutu çalıştırdığın kanaldan açılıp kapatılır.

| Mesaj | Ne zaman tetiklenir | Yer tutucular |
| --- | --- | --- |
| Bye | Bir üye ayrılır | Kullanıcı, sunucu ve bot grupları ile kanal yer tutucuları. `%user%` ayrılan üyeyi etiketler. |
| Boost | Bir üye boost yapmaya başlar ya da yeniden boost yapar | Kullanıcı, kanal, sunucu, bot ve gif grupları |
| Greet DM | Bir üye katılır ve özel mesaj olarak gönderilir | Kullanıcı, kanal, sunucu, bot ve gif grupları |

`bye` ya da `boost` komutunu çalıştırmak ilgili mesajı açar ya da kapatır ve kanalı yazdığın kanal olarak ayarlar. `byedel` ve `boostdel` saniye cinsinden bir kendini silme zamanlayıcısı ayarlar; `boostdel` en fazla 600 ile sınırlıdır. Mesaj komutlarını metin olmadan çalıştırırsan mevcut mesaj gösterilir. `leavehook` ayrılma mesajını özel adı ve avatarı olan bir webhook içine alır; `leavehook disable` bunu kaldırır.

Karşılama DM'leri dikkat ister. Bot doğrulanmış değilse, karşılama DM'lerini açmadan önce onay ister; doğrulanmamış botların kitlesel DM göndermesi botun işaretlenmesine yol açabilir. Herhangi bir üye `greetdmoptout` komutuyla ya da kendi profil sayfasındaki kontrol panelinde **Hoş geldin DM'leri** anahtarıyla bu DM'leri kendisi için engelleyebilir.

Kanal bazında klasik bir karşılama komutu yoktur. Kanal karşılamaları için çoklu karşılamayı kullan.

## Ayarlar

Her şey kontrol panelindeki Karşılamalar sayfasındadır.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Karşılama Türü | Tüm Karşılamalar | Tüm Karşılamalar, Rastgele Karşılama veya Devre dışı |
| Yeni Karşılama Ekle | | Bir kanal seç, sonra **Karşılama Ekle**'ye tıkla |
| Karşılama Mesajı | boş | Tek bir karşılamanın embed düzenleyicisi. İçerik, en fazla on embed ve bileşenleri destekler. |
| Şu süre sonra sil | Asla | `1m30s` ya da `45s` gibi bir süre gir |
| Webhook | Yapılandırılmadı | Webhook adı ve isteğe bağlı avatar URL'si |
| Botları karşıla | kapalı | Bot hesapları için de tetikle |
| Etkin | açık | Bir karşılamayı silmeden kapat |

Bye, boost ve karşılama DM mesajları bu sayfada değildir. Onları yukarıdaki komutlarla ayarla.

## Kurulum adımları

1. Kontrol panelinde **Karşılamalar**'ı aç ve **Karşılama Türü**'nü **Tüm Karşılamalar** olarak bırak.
2. **Yeni Karşılama Ekle** altında hoş geldin kanalını seç ve **Karşılama Ekle**'ye tıkla.
3. Yeni kartta **Karşılama Mesajı**'nı aç, yukarıdaki yer tutucuları kullanarak mesajını oluştur ve kaydet.
4. İstersen **Şu süre sonra sil**'i ayarla, bir **Webhook** adı ve avatarı ekle, bot katılımlarının duyurulmasını istiyorsan **Botları karşıla**'yı aç.
5. Diğer kanallar için tekrarla. Aynı kanala birden fazla karşılama eklediysen ve çeşitlilik istiyorsan **Rastgele Karşılama**'ya geç.
6. Bir ayrılma mesajı için istediğin kanalda `byemsg Goodbye %user%, we will miss you` komutunu çalıştır, sonra açmak için `bye` yaz.
7. Bir boost mesajı için `boostmsg Thanks for boosting, %user%!` komutunu çalıştır ve ardından `boost` yaz.
8. `byetest` ve `boosttest` ile test et. Çoklu karşılamaların önizlemesi de var: `multigreetmessage 1` komutunu çalıştır ve **Önizleme**'ye bas.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Çoklu karşılama komutları `/multigreets add`, `/multigreets remove` gibi eğik çizgi komutları olarak da kullanılabilir.

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `multigreetadd [#channel]` | `mgadd`, `mga` | Yönetici | Bir kanal için karşılama ekle; varsayılan olarak bulunduğun kanal |
| `multigreetremove <number or #channel>` | `mgrem`, `mgrm`, `mgr` | Yönetici | Bir karşılamayı numarasıyla sil ya da onaydan sonra bir kanaldaki tüm karşılamaları sil |
| `multigreetmessage <number> [message]` | `mgmsg`, `mgm` | Yönetici | Karşılama metnini ya da embed'ini ayarla; mesaj yoksa önizleme ya da ham şablon sunar |
| `multigreetdelete <number> <time or seconds>` | `mgdel`, `mgd` | Yönetici | Kendini silme zamanlayıcısı, örneğin `1m` ya da `60`; `0` kapatır |
| `multigreetdisable <number> <true or false>` | `mgdisable`, `mgdis` | Yönetici | `true` karşılamayı devre dışı bırakır, `false` etkinleştirir |
| `multigreetgreetbots <number> <true or false>` | `multigreetbots`, `mggb` | Yönetici | Bu karşılamanın botlar için tetiklenip tetiklenmeyeceği |
| `multigreetwebhook <number> [name] [avatar url]` | `mgwebhook`, `mghook`, `mgh` | Yönetici | Karşılama için bir webhook oluştur; ad verilmezse kaldırır |
| `multigreettype <multigreet, randomgreet or off>` | `mgtype`, `mgt` | Yönetici | Sunucu genelindeki karşılama türünü değiştir |
| `multigreetlist` | `mglist`, `mgl` | Yönetici | Her karşılamayı ayarlarıyla birlikte sayfa sayfa gez |
| `bye` | | Sunucuyu Yönet | Bu kanaldaki ayrılma mesajını aç veya kapat |
| `byemsg [text]` | | Sunucuyu Yönet | Ayrılma mesajını göster ya da ayarla |
| `byedel [seconds]` | | Sunucuyu Yönet | Ayrılma mesajının kendini silme zamanlayıcısı, varsayılan 30 |
| `byetest [@user]` | | Sunucuyu Yönet | Ayrılma mesajını test olarak gönder |
| `leavehook [#channel] [name] [image url] [text]` | `byehook` | Sunucuyu Yönet | Ayrılmaları bir webhook üzerinden gönder; ya da `leavehook disable` |
| `boost` | | Sunucuyu Yönet | Bu kanaldaki boost mesajını aç veya kapat |
| `boostmsg [text]` | `boostmessage` | Sunucuyu Yönet | Boost mesajını göster ya da ayarla |
| `boostdel [seconds]` | `boostdelete` | Sunucuyu Yönet | Boost mesajının kendini silme zamanlayıcısı, 0 ile 600 arası, varsayılan 30 |
| `boosttest [@user]` | `testboost` | Sunucuyu Yönet | Boost mesajını test olarak gönder |
| `greetdm` | | Sunucuyu Yönet | Hoş geldin DM'ini aç veya kapat |
| `greetdmmsg [text]` | | Sunucuyu Yönet | Hoş geldin DM metnini göster ya da ayarla |
| `greetdmtest [@user]` | | Sunucuyu Yönet | Hoş geldin DM'ini test olarak gönder |
| `greetdmoptout` | `gdmoptout` | Kimse | Bu botun her yerden hoş geldin DM'lerini almayı bırak |

## İpuçları ve dikkat edilecekler

- `multigreetdelete` için botun Mesajları Yönet iznine, `multigreetwebhook` ve `leavehook` için ise Webhook'ları Yönet iznine ihtiyacı var.
- Karşılama numaraları listedeki konumlardır; birini silmek sonrasındaki her şeyin numarasını kaydırır. Düzenlemeden önce `multigreetlist` komutunu çalıştır.
- `multigreettype` komutundaki `off` seçeneği, `/multigreets type` ve kontrol panelindeki **Devre dışı** düğmesi aynı karşılama türünü ayarlar; bunlardan herhangi biri sistemi kapatır, karşılamaların silinmesi gerekmez.
- Davet yer tutucuları, katılım davete bağlanana kadar karşılamayı beş saniyeye kadar bekletir; böylece birkaç kişi aynı anda katıldığında bile davet eden doğru kişi olur.
- Hoş geldin DM'i yalnızca üye, sunucu üyelerinden DM kabul ediyorsa çalışır. Başarısız DM'ler yok sayılır.
- Rol Karşılamaları ayrı bir özelliktir; katılımda değil, bir rol verildiğinde tetiklenir.

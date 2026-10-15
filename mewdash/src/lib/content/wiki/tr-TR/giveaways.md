---
title: Çekilişler
slug: giveaways
summary: Tepki, buton veya web captcha ile katılınan süreli çekilişler yürüt; rol ve mesaj sayısı şartları, rastgele kazanan seçimi, yeniden çekiliş ve kazanan DM'leri ile.
icon: fa-gift
category: Entertainment
dashboard: /dashboard/giveaways
module: Giveaways
tags: [giveaway, gstart, prize, raffle, winner, reroll, contest, entry, captcha, çekiliş, ödül, çekiliş kazananı, yeniden çekiliş, yarışma, katılım, captcha]
related: [embedbuilder, chat-triggers, xp]
---

## Ne işe yarar

Yetkililer bir ödül, bir kanal, kazanan sayısı ve bir süre belirleyerek çekiliş başlatır. Bot o kanala ödülü, sahibini, bitiş zamanını ve varsa şartları gösteren bir embed gönderir. Üyeler, çekilişin nasıl başlatıldığına bağlı olarak sunucunun çekiliş emojisine tepki vererek, **Enter** düğmesine basarak ya da kontrol panelindeki bir captcha'yı çözerek katılır.

Süre dolduğunda bot katılan ve hâlâ şartları sağlayan herkes arasından rastgele kazananları seçer. Orijinal mesajı kazananları gösterecek şekilde düzenler, kanala bir tebrik mesajı gönderir ve etkinse her kazanana çekilişe bağlantı içeren bir DM yollar. Yetkililer çekilişi süresi dolmadan erken bitirebilir ya da bittikten sonra yeniden çekebilir.

Şartlar katılım anında değil, sonunda kontrol edilir. Tepki verdikten sonra gerekli bir rolünü kaybeden kişi, kazananlar seçilirken atlanır.

## Neden kullanmalısın

- Oyun anahtarlarını, Nitro'yu ya da ürünleri elle isim seçmeden aktif üyelere dağıtmak için.
- Gerçekten sohbet eden insanları, minimum mesaj sayısı şartıyla ödüllendirmek için.
- Bir ödülü boosterlara ya da destekçi rolüne, o rolleri şart koşarak sınırlamak için.
- Alt hesapların ve botların katılımları doldurmasını captcha katılımıyla durdurmak için.

## Katılım yöntemleri

Her çekiliş bu yöntemlerden tam olarak birini kullanır. Etkileşimli `gstart` sihirbazı hangisinin kullanılacağını sorar, slash komutunda `use_button` ve `use_captcha` seçenekleri vardır, kontrol panelinde ise **Katılım Yöntemi** seçeneği bulunur.

| Yöntem | Üyeler nasıl katılır | Notlar |
| --- | --- | --- |
| Tepki | Sunucunun çekiliş emojisine tepki verir | Varsayılan. Çekiliş bittiğinde bot tepki listesini okur, en fazla 1000 kullanıcıya kadar. |
| Buton | Embed'in altındaki **Enter** düğmesine basar | Katılımlar bot tarafından saklanır. İki kez katılmak, çekiliş bittikten sonra ya da sunucuda değilken katılmak reddedilir. |
| Captcha | **Enter (Web Captcha)** düğmesine basar, kontrol paneline giriş yapar ve Cloudflare Turnstile kontrolünü geçer | Buton katılımıyla aynı şekilde saklanır. Katılım, giriş yapılmış Discord hesabına yazılır. |

Çekiliş emojisi sunucu bazında `gemote` ile ayarlanır. Bot onu tepki vererek doğrular; bu yüzden başka bir sunucudaki özel emoji ancak bot o sunucudaysa çalışır. Tepki çekilişleri ayrıca botun Tepki Ekle ve Harici Emojileri Kullan yetkilerine ihtiyaç duyar ve bu yetkiler yoksa `gstart` başlamayı reddeder.

## Şartlar

| Şart | Nasıl ayarlanır | Çekiliş sırasındaki etkisi |
| --- | --- | --- |
| Gerekli roller | Sihirbaz, slash `required_roles`, kontrol panelindeki **Gerekli Roller** | Üye listelenen rollerin tümüne sahip olmalıdır |
| Mesaj sayısı | Sihirbaz, slash `required_messages`, kontrol panelindeki **Gerekli Mesaj Sayısı** | Üyenin bu sunucudaki sayılan mesajları bu sayının en az kadar olmalıdır. Mesaj sayım servisini kullanır; bu yüzden yalnızca sayım açıldıktan sonra gönderilen mesajları bilir. |

Botlar her zaman hariç tutulur; sunucudan ayrılmış olanlar da öyle. Şartlar çekiliş embed'inde bir **Gerekli Roller** satırı ve "N Messages Required" satırı olarak listelenir.

## Çekiliş mesajı

Embed'in başlığı ödüldür. Açıklama "React with (emote) to enter!" der, sahibi adıyla belirtir ve bitiş zamanını hem göreli hem mutlak Discord zaman damgasıyla gösterir. Alt bilgide kazanan sayısı, sunucu adı ve bitiş tarihi yer alır. Mesaj içeriği ayarlıysa ping rolü etiketidir.

Sunucu genelindeki görünüm ayarları:

| Ayar | Komut | Etkisi |
| --- | --- | --- |
| Embed rengi | `gembedcolor` | Çekiliş embed'inin rengi, renk adı ya da `#hex` olarak |
| Afiş | `gbanner` | Her çekilişte gösterilen görsel. Sihirbaz ve slash komutu, çekiliş bazında bir URL ya da eklenen görselle bunu geçersiz kılabilir. |
| Ping rolü | yok, yalnızca sihirbazda geçersiz kılma | Sihirbaz bir rolü etiketlemeyi önerir; sunucuda bir ping rolü kayıtlıysa bunu geçersiz kılıp kılmayacağını sorar |
| Kazananlara DM | `gdm` | Kazananların DM alıp almayacağı. Varsayılan olarak açıktır. |

### Bittiğinde

Yeterli uygun katılımcı varsa bot embed'i "Winner: @user" olacak şekilde düzenler, sahibini ekler, alt bilgiyi "Ended at (time)" yapar, içeriği "**Giveaway Ended!**" olarak değiştirir ve çekilişe bağlantı veren ve yeniden çekiliş komutunu gösteren ayrı bir tebrik mesajı gönderir. Kimse katılmadıysa ya da kazanan sayısından az uygun kişi katıldıysa embed "There were not enough participants!" ile değiştirilir ve çekiliş bitmiş olarak işaretlenir. İnsanlar katıldı ama hiçbiri şartları sağlamadıysa bunu belirten bir mesaj gösterilir.

Tek kazananlı bir çekiliş, sohbet tetikleyicileri için `GiveawayWon` olayını da tetikler; böylece bir tetikleyici kazanmaya tepki verebilir.

### Kazanan DM'i

**Kazananlara DM** açıkken her kazanan bir DM alır. Varsayılan, kazandığını söyleyen ve çekiliş mesajına bağlantı içeren bir embed'dir. Özel bir bitiş mesajı kayıtlıysa o gönderilir ve genel sunucu, kullanıcı ve kanal yer tutucularına ek olarak şu yer tutucuları kullanabilir.

| Yer tutucu | Değer |
| --- | --- |
| `%messagelink%` | Çekiliş mesajına bağlantı |
| `%giveawayitem%` | Ödül |
| `%giveawaywinners%` | Kazanan sayısı |

`gdmmessage` metin olmadan çalıştırıldığında kayıtlı mesajı örnek değerlerle önizlemeyi teklif eder; önizlemeyi reddedersen mesaj silinir. Metinle çalıştırmak da kayıtlı mesajı kaydetmek yerine siler.

## Ayarlar

**Çekilişler** kontrol paneli sayfasında üç sekme vardır: **Aktif Çekilişler**, **Çekiliş Oluştur** ve **Biten Çekilişler**. Yukarıdaki sunucu genelindeki ayarlar (emoji, renk, afiş, DM anahtarı) yalnızca komutla yapılır.

**Çekiliş Oluştur** formu:

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Çekiliş Ödülü | boş | Ödül, embed başlığı olarak gösterilir |
| Kazanan Sayısı | 1 | Kaç kazanan çekileceği; en az 1 olmalıdır |
| Kanal | yok | Embed'in gönderileceği yer |
| Süre | 24 saat | Çekilişin ne zaman biteceği |
| Gerekli Roller | yok | Kazanmak için bir üyenin sahip olması gereken roller |
| Gerekli Mesaj Sayısı | 0 | Gerekli sayılan minimum mesaj |
| Tepki Emojisi | parti poppers | Tepki katılımı için emoji; özel emoji ya da yapıştırılmış emoji kodu çalışır |
| Katılım Yöntemi | Tepki | Tepki, Buton veya Captcha |

**Aktif Çekilişler** her çekilişi bitiş zamanıyla listeler. Birini genişletmek kazananları, kanalı, gerekli rolleri, mesaj şartını ve katılım yöntemini gösterir; bir de **Çekilişi bitir** düğmesi çıkar. Yeniden çekilişler yalnızca komutla yapılır.

## Kurulum adımları

1. Üyelerin tepki vermesini istediğin emoji ile `gemote` komutunu çalıştır; örneğin `gemote :tada:`.
2. İstersen çekilişlerin sunucunun görünümüne uyması için `gembedcolor` ve `gbanner` ayarla.
3. Kontrol panelinde **Çekilişler**'i aç, sonra **Çekiliş Oluştur**'a git.
4. **Çekiliş Ödülü**, **Kazanan Sayısı**, **Kanal** ve **Süre** alanlarını doldur.
5. Ödül yerleşik üyelere gidecekse **Gerekli Roller** ya da **Gerekli Mesaj Sayısı** ekle.
6. Bir **Katılım Yöntemi** seç ve **Çekiliş Oluştur**'a bas.
7. Bittiğinde kanalı kontrol et. Yanlış kişi kazandıysa ya da kazanan yanıt vermezse `greroll <message id>` çalıştır.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Aynı komutlar `/giveaways` altında slash komutları olarak da vardır.

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `gstart [#channel <time> <winners> <prize>]` | `giveawaystart` | Mesajları Yönet | Çekiliş başlat. Argümansız çalıştırılırsa sahibi, mesaj şartını, afişi, ping rolünü, katılım yöntemini ve gerekli rolleri de soran bir sihirbaz açılır. Süre `2d3h` gibi görünür. |
| `gend <message id>` | `giveawayend` | Mesajları Yönet | Çekilişi hemen bitir ve kazananları çek |
| `greroll <message id>` | `giveawayreroll`, `reroll` | Mesajları Yönet | Bitmiş bir çekilişin katılımcılarından yeniden çek |
| `glist` | `giveaways`, `giveawaylist` | Mesajları Yönet | Aktif çekilişleri mesaj kimlikleri, ödülleri, kazanan sayıları ve bağlantılarıyla listele |
| `gstats` | `giveawaystats` | Yok | Aktif ve biten çekilişlerin toplamları, sahipler ve kanal bazında sayılar |
| `gemote <emote>` | `giveawayemote` | Mesajları Yönet | Tepki katılım emojisini ayarla |
| `gembedcolor <colour>` | `giveawayembedcolor` | Mesajları Yönet | Çekiliş embed rengini ayarla |
| `gwinembedcolor <colour>` | `giveawaywinembedcolor` | Mesajları Yönet | `gembedcolor` ile aynı renk değerini ayarlar |
| `gbanner <url>` | `giveawaybanner` | Mesajları Yönet | Varsayılan afiş görselini ayarla |
| `gdm` | `giveawaydm` | Mesajları Yönet | Kazananlara DM'i aç/kapat |
| `gdmmessage [text]` | `gdmmsg` | Mesajları Yönet | Özel kazanan DM'ini önizle ya da temizle |

## İpuçları ve dikkat edilecekler

- `gend` ve `greroll` için mesaj kimliği çekiliş embed'inin kimliğidir. Geliştirici Modu ile kopyalayabilir ya da `glist` komutundan okuyabilirsin.
- Yeniden çekiliş aynı şartlarla katılımcılardan yeniden seçim yapar; bu yüzden önceki kazanan yine kazanabilir.
- Botu yeniden başlattıktan sonra bot, önümüzdeki 24 saat içinde bitecek çekilişleri hemen planlar; daha sonra bitecekler saatlik bir kontrolle alınır, bu yüzden uzun süreli bir çekiliş yine de zamanında biter.
- Bot tepki çekilişinde tepkileri okuyamazsa mevcut sunucu emojisine geri döner; ancak emoji kimsenin tepki vermediği bir şeye değiştirildiyse çekilişte katılımcı bulunmaz.
- Kontrol panelindeki **Aktif Çekilişler** listesi bitmiş çekilişleri de gösterir; **Biten Çekilişler** sekmesi şu an boştur. Bitiş zamanına ve **Çekilişi bitir** düğmesinin olmamasına bakarak ikisini ayırt edebilirsin.
- Captcha katılımı için kontrol panelinin erişilebilir olması ve üyenin Discord ile giriş yapması gerekir; katılım, sayfaya yazılan hiçbir şeye değil, o hesaba bağlanır.
- Kazananın DM'leri kapalıysa kazanan DM'leri sessizce başarısız olur. Kanal duyurusu yine de gönderilir.

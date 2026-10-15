---
title: Kullanıcı Profili
slug: userprofile
summary: Her üyeye, biyografi, zamirler, burç, doğum günü, renk, resim ve Switch arkadaş kodu içeren; bot tarafından her yerde gösterilebilen bir profil kartı ver ve başkalarının neleri görebileceğini gizlilik ayarlarıyla kontrol et.
icon: fa-user
category: Community
module: UserProfile
tags: [profile, bio, pronouns, pronoundb, zodiac, birthday, privacy, profile colour, profile image, switch friend code, stats opt out, greet dm opt out, profil, biyografi, zamirler, burç, doğum günü, gizlilik, profil rengi, profil resmi, switch arkadaş kodu, istatistik çıkışı, karşılama dm çıkışı]
related: [birthday, switch, afk, help]
---

## Ne yapar

Her üyenin profili, botun bulunduğu her sunucuda onunla birlikte gelir. `profile` komutu bunu bir embed olarak gönderir: üyenin avatarı küçük resim olarak, biyografisi açıklama olarak, ardından zamirler, burç, doğum günü, botla kaç ortak sunucusu olduğu ve ayarladıysa Nintendo Switch arkadaş kodu alanları gelir. Özel bir renk ve en altta büyük bir resim görünümü tamamlar.

Üyeler profili birkaç `set...` komutuyla veya kontrol panelindeki **Ayarlarım** sayfasından doldurur. Hiçbir şey sunucuya özel değildir: biyografini bir kez ayarlarsın, her yerde aynı görünür.

Gizlilik üyenin kontrolündedir. Bir profil yalnızca sahibinin açabileceği şekilde özel yapılabilir, doğum günü yalnızca ay olarak gösterilecek şekilde kırpılabilir ya da tamamen gizlenebilir ve üyeler komut istatistiklerinden ve hoş geldin DM'lerinden çıkabilir.

Zamirler biraz özeldir. Bir üye bot üzerinden zamir ayarlamamışsa bot PronounDB üzerinden arama yapar. Üyeler kendi metinleriyle bu değeri geçersiz kılabilir ve herkes kötüye kullanılan bir geçersiz kılmayı bot sahiplerine bildirebilir.

## Neden kullanmalısın

- Üyeler, tanıtım kanalı olmadan hızlı bir "hakkımda" kartı istiyor.
- Switch arkadaş kodlarını paylaşan bir topluluk, mesajları sabitlemek yerine bunları tek bir yerde tutabilir.
- Zamirler PronounDB'den otomatik gösterilebilir; böylece çoğu kişinin bunları elle yazması gerekmez.
- Yetkililer yanıt vermeden önce `pronouns @user` ile birinin zamirlerini kontrol edebilir.
- Karşılama DM'leri veya istatistik toplanmasını istemeyen üyeler bunları kendileri kapatabilir.

## Profil embed'i

`profile` yalnızca yazıldığında kendi profilini gösterir. `profile @user` başkasının profilini gösterir; ancak o kişi profilini özel yaptıysa bot profilin özel olduğunu yanıtlar.

| Embed'in parçası | Nereden gelir |
| --- | --- |
| Başlık | "Profile for" ve kullanıcı |
| Renk | `setprofilecolor`; yoksa botun varsayılan rengi |
| Küçük resim | Üyenin Discord avatarı |
| Açıklama | `setbio` ile ayarlanan biyografi (yalnızca ayarlıysa gösterilir) |
| Pronouns | Senin geçersiz kılman; yoksa PronounDB; o da yoksa "Unspecified" |
| Zodiac Sign | `setzodiac`; yoksa "Unspecified" |
| Birthday | `setbirthday`, doğum günü gizlilik moduna göre gösterilir; yoksa "Unspecified" |
| Mutual Bot Servers | Sen ve botun ikisinin de bulunduğu sunucu sayısı |
| Switch Friend Code | Yalnızca ayarlıysa gösterilir |
| Image | `setprofileimage` ile verilen URL |

## Profil alanları

### Biyografi

`setbio <text>` en fazla 2048 karakter kabul eder. Daha uzun metinler reddedilir. Bunu temizleyen bir komut yoktur; istersen biyografiyi tek bir nokta gibi kısa bir şeyle değiştirerek kaldırabilirsin.

### Burç

`setzodiac <sign>` on iki batı burcundan birini kabul eder: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces. Büyük-küçük harf fark etmez. Bunların dışındaki her şey reddedilir.

### Renk ve resim

`setprofilecolor <colour>` botun renk ayrıştırıcısının anladığı her biçimi kabul eder; örneğin onaltılık bir değer. `setprofileimage <url>` doğrudan bir resim dosyası bağlantısı ister; bot kaydetmeden önce URL'nin bir resme benzediğini kontrol eder ve sana geri gösterir.

### Doğum günü

`setbirthday <date>` bir tarih saklar. Doğum günü modülünün duyuruları aynı değeri kullanır; yani burada ayarlamak orada da ayarlar. Profilde nasıl göründüğü `setbirthdayprivacy <mode>` komutuna bağlıdır:

| Mod | Profilde ne gösterilir |
| --- | --- |
| `Default` | Tam tarih |
| `MonthOnly` | Yalnızca ay adı |
| `YearOnly` | Yalnızca yıl |
| `MonthAndDate` | Ay ve gün, yıl yok |
| `Disabled` | "Private" |

### Switch arkadaş kodu

`setswitchfc <code>` `SW-XXXX-XXXX-XXXX` biçimine uymalıdır (her grupta dört rakam; `SW` büyük-küçük harf duyarsızdır). Profilinden kaldırmak için kodsuz çalıştır. Nintendo Switch modülü bununla ilgisizdir; bu alan yalnızca görüntüleme amaçlıdır.

### Gizlilik

`setprivacy public` veya `setprivacy private`. Özel profilleri yalnızca sahibi görebilir. Varsayılan olarak profil herkese açıktır.

## Zamirler

`pronouns [@user]` senin veya başka birinin zamirlerini gösterir. Arama sırası şöyledir:

1. `setpronouns` ile üyenin yazdığı metin.
2. Discord hesabını PronounDB'ye bağladıysa üyenin PronounDB üzerindeki İngilizce zamir seti. Standart setler olağan biçimde gösterilir; örneğin `he/him`, `Any pronouns` veya `Ask me my pronouns`.
3. "Unspecified".

`setpronouns <text>` bir geçersiz kılma saklar. Metin yazmadan çalıştırırsan mevcut geçersiz kılman iki düğmeyle gösterilir: **Overwrite** yeni zamirleri yazman için bir form açar, **Temizle** geçersiz kılmayı kaldırır ve PronounDB yeniden kullanılır.

Gösterilen zamirler bir üyenin kendi geçersiz kılmasından geliyorsa (PronounDB'den değilse) yanıtta **Report** düğmesi bulunur. Raporlar, bot sahiplerinin çalıştırdığı bir kanala gider; onlar geçersiz kılmayı temizleyebilir, o kullanıcı için zamirleri devre dışı bırakabilir veya kullanıcıyı kara listeye alabilir. Zamirleri devre dışı bırakılmış bir kullanıcı, zamir komutlarını her kullanmaya çalıştığında nedeni görür.

> [!NOTE]
> Bot sahibi komutu `pronounsforceclear`, bu raporların işleme alındığı yerdir. Sunucu yetkilileri başka bir üyenin zamirlerini temizleyemez.

## Çıkış seçenekleri

- `greetdmoptout` bu botun DM karşılamalarını kullanan sunucuların sana DM gönderip gönderemeyeceğini açıp kapatır. Yalnızca bu botun gönderdiği karşılamaları etkiler.
- `userstatsoptout` hesabın için komut istatistiği toplanmasını açıp kapatır. Bu asla mesaj içeriklerini toplamaz.
- `deleteuserstatsdata` onay sonrasında hakkında zaten saklanmış komut istatistiklerini siler. Saatte bir kez çalıştırılabilir.

## Ayarlar

Sunucu tarafında yapılandırma yoktur. Her şey üyenin kendisinde saklanır. Kontrol panelindeki **Ayarlarım** sayfasında (`/me`) bir **Profil** bölümü, düzenlemek için bir **Düzenle** düğmesi ve gizlilik anahtarları bulunur.

| Ayar | Varsayılan | Ne kontrol eder |
| --- | --- | --- |
| Biyografi | boş | Profilindeki açıklama |
| Zamirler | boş (PronounDB kullanılır) | Zamir geçersiz kılman |
| Burç | yok | Profilde gösterilen burç |
| Doğum günü | yok | Profilde gösterilen ve doğum günü duyuruları için kullanılan tarih |
| Saat dilimi | UTC | Doğum günü modülünün senin duyurun için kullandığı saat dilimi |
| Switch Arkadaş Kodu | boş | Profildeki arkadaş kodu alanı |
| Profil Rengi | botun varsayılanı | Embed rengi |
| Profil resmi | yok | Embed'in altındaki resim |
| Profil gizliliği | Herkese açık | Başkalarının profilini açıp açamayacağı |
| Doğum günü gösterim modu | Default | Doğum gününün hangi kısımlarının gösterileceği |
| Hoş geldin DM'lerini engelle | kapalı | `greetdmoptout` ile aynı |
| Mesaj takibini engelle | kapalı | `userstatsoptout` ile aynı |
| Doğum günü duyuruları | kapalı | Doğum günü modülünün doğum gününü duyurup duyurmayacağı |

Aynı sayfada zamir çekmeyi hesabın için devre dışı bırakan bir anahtar da vardır.

## Kurulum adımları

1. `setbio Hi, I run the art channel.` yazarak bir açıklama ekle.
2. `setpronouns she/her` yaz; PronounDB hesabın Discord'a zaten bağlıysa bunu atlayabilirsin.
3. `setbirthday 1998-04-12` yaz; yılın gösterilmesini istemiyorsan ardından `setbirthdayprivacy MonthAndDate` çalıştır.
4. Embed'i şekillendirmek için `setprofilecolor #ff66aa` ve `setprofileimage https://example.com/banner.png` çalıştır.
5. İnsanların seni Switch'te bulmasını istersen `setswitchfc SW-1234-5678-9012` ekle.
6. Sonucu kontrol etmek için `profile` çalıştır. Kimsenin görmesini istemezsen `setprivacy private` çalıştır.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Çoğunun `/profile`, `/setbio`, `/setcolor`, `/setbirthday`, `/setbirthdayprivacy`, `/setswitchfriendcode`, `/setprofileimage`, `/setprivacy`, `/setzodiac`, `/pronouns`, `/setpronouns`, `/statsoptout` ve `/deletestatsdata` gibi adlarla eğik çizgi komutu karşılıkları vardır.

| Komut | Diğer adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `profile [@user]` | `userprofile` | Kimse | Kendi veya başkasının profilini göster |
| `setbio <text>` | | Kimse | Biyografini ayarla, en fazla 2048 karakter |
| `setpronouns [text]` | `pronounsset` | Kimse | Bir zamir geçersiz kılması ayarla veya temizle ve üzerine yaz düğmeleriyle görüntüle |
| `pronouns [@user]` | `getpronouns` | Kimse | Zamirleri göster; geçersiz kılmalarda rapor düğmesi bulunur |
| `setzodiac <sign>` | | Kimse | Burcunu ayarla |
| `setprofilecolor <colour>` | | Kimse | Embed rengini ayarla |
| `setprofileimage <url>` | | Kimse | Profilde gösterilen resmi ayarla |
| `setbirthday <date>` | | Kimse | Doğum gününü ayarla |
| `setbirthdayprivacy <mode>` | | Kimse | `Default`, `MonthOnly`, `YearOnly`, `MonthAndDate` veya `Disabled` |
| `setprivacy <Public|Private>` | `profilepricvacy` | Kimse | Profili herkese açık veya özel yap |
| `setswitchfc [code]` | `setfc`, `setswitchfriendcode`, `setfriendcode` | Kimse | Switch arkadaş kodunu ayarla veya temizle |
| `greetdmoptout` | `gdmoptout` | Kimse | Bu botun DM karşılamalarını alma durumunu değiştir |
| `userstatsoptout` | `ustatsoptout` | Kimse | Komut istatistiği toplama durumunu değiştir |
| `deleteuserstatsdata` | `deluserstatsdata` | Kimse | Saklanan komut istatistiklerini sil (saatte bir kez) |
| `pronounsforceclear <@user or id> <true|false> <reason>` | `pnfc` | Bot sahibi | Bir üyenin zamirlerini temizle ve isteğe bağlı olarak devre dışı bırak |

## İpuçları ve dikkat edilecekler

- Profil globaldir. Bir sunucuda değiştirmek her yerde değiştirir.
- `setbirthday` tarihi botun tarih ayrıştırıcısıyla okur; bu yüzden `1998-04-12` gibi belirsiz olmayan bir biçim en güvenlisidir.
- Profil resminin URL'si çalışmayı bırakırsa embed yine gönderilir ama Discord resmi göstermez. Yeni bir URL ayarlayarak düzeltebilirsin.
- PronounDB aramaları için üyenin Discord hesabını pronoundb.org üzerinde bağlamış olması gerekir. Bağlamadan profil `setpronouns` çalıştırılana kadar "Unspecified" gösterir.
- Özel profiller yine `profile @user` ile yanıt verir, ama profilin özel olduğunu söyleyen bir hata ile; böylece insanlar bir profilin var olduğunu anlayabilir.
- `deleteuserstatsdata` yalnızca komut istatistiklerini siler. Profil alanları, onların üzerine yazarak temizlenir.

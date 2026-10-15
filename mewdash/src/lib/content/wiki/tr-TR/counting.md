---
title: Sayma
slug: counting
summary: Bir kanalı, üyelerin sırayla bir sonraki sayıyı yazdığı bir sayma oyununa dönüştür; tepkiler, seriler, liderlik tabloları, kayıt noktaları ve sayıyı bozanlar için isteğe bağlı cezalarla.
icon: fa-list-numeric
category: Community
dashboard: /dashboard/counting
module: Counting
tags: [counting, count, numbers, game, channel, leaderboard, streak, milestones, save point, sayma, sayı, oyun, kanal, liderlik tablosu, seri, kilometre taşı, kayıt noktası]
related: [administration, xp]
---

## Ne işe yarar

Yetkililer bir kanal seçip `countingsetup` komutunu çalıştırır. Bundan sonra bot o kanaldaki her mesajı izler. Mesaj beklenen bir sonraki sayıysa bot bir onay işaretiyle tepki verir ve sayıyı o üye için kaydeder. Yanlış bir sayıysa bot çarpı işaretiyle tepki verir ve varsayılan olarak mesajı iki saniye sonra siler, böylece kanal temiz kalır.

Bot mevcut sayıyı, şimdiye kadar ulaşılan en yüksek sayıyı, toplam sayım sayısını ve en son kimin saydığını tutar. Varsayılan olarak aynı üye arka arkaya iki kez sayamaz, bu yüzden oyun en az iki kişi gerektirir. Üyeler kendi istatistiklerini, serilerini ve doğruluklarını görebilir; ayrıca kanal başına bir liderlik tablosu vardır.

Yetkililer için bir kötü seriden sonra sayıyı geri almanı sağlayan kayıt noktaları, bir zaman penceresi içinde üye başına yanlış sayıları izleyen ve kademeli cezalar uygulayan bir moderasyon katmanı, sayma yasakları ve zaman aşımları ile kimin oyuna katılabileceğini belirleyen rol kuralları vardır. Birden fazla kanal, her birinin kendi ayarlarıyla aynı anda sayma oynayabilir.

## Neden kullanmalısın

- Topluluk için, kendi kendine işleyen ve üyelere ortak bir hedef veren düşük maliyetli bir oyun.
- Büyük sunucular, tek bir kişinin sayıyı istismar etmesini önlemek için bekleme süresi ve tekrar kuralı ekleyebilir.
- Yetkililer, kimin hata yaptığını tartışmak yerine sayıyı bir kayıt noktasından geri yükleyebilir.
- Sayıyı bilerek bozan tekrarlayan ihlalciler otomatik olarak susturulabilir ya da sayma oyunundan yasaklanabilir.

## Bir sayım nasıl kontrol edilir

Bir üye sayma kanalına mesaj yazdığında bot şu kontrolleri sırayla çalıştırır:

1. Sayma oyunundan yasaklanmış üyeler tamamen yok sayılır.
2. Yasaklı bir role sahip, gerekli rollerden birine sahip olmayan ya da yok sayılan bir role sahip üyeler atlanır. İstediysen yok sayılan rollerin mesajları silinir.
3. Mesaj geçerli bir sayı gibi görünüyorsa bot ona tepki verebildiğini test eder. Tepki başarısız olursa bot bunu üyenin botu engellediği olarak kabul eder, mesajı siler ve beş saniye sonra kaybolan kısa bir uyarı gönderir.
4. Hâlâ **Bekleme süresi** içinde olan bir üyenin sayısı reddedilir.
5. **Tekrarlayan kullanıcılara izin ver** kapalıysa ve aynı üye son sayıyı yazdıysa mesaj reddedilir.
6. Metin kanalın desenine göre çözümlenir. Sayı olmayan her şey aşağıdaki sayı dışı kurallarla işlenir.
7. Sayı, mevcut sayı artı **Artış** değerine eşit olmalıdır. Yanlış bir sayı o üye için bir hata sayılır ve **Hatada sayıyı sıfırla** açıksa kanal başlangıç sayısına döner.
8. **En Yüksek Sayı** ayarlıysa ve sayı bu değeri geçerse sayma durur ve yetkililere bildirilir.

Doğru bir sayım kanalı, üyenin istatistiklerini ve serisini günceller, bekleme süresini başlatır, kilometre taşlarını kontrol eder ve olayı kaydeder.

Başarılı sayımlar **Başarı Emojisi** tepkisini (varsayılan olarak onay işareti) alır, hatalar ise **Hata Emojisi** tepkisini (varsayılan olarak çarpı işareti) alır. İkisi de standart bir emoji ya da özel bir emote olabilir.

## Sayma desenleri

Desen, üyelerin sayıları nasıl yazması gerektiğini belirler. Bot şu desenleri çözümler:

| Desen | Üyelerin yazdığı |
| --- | --- |
| Normal | Düz rakamlar: `1`, `2`, `3`. **Sayı Tabanı** 10 dışındaysa rakamlar o tabanda okunur. |
| Roman | Roma rakamları: `I`, `II`, `III`, `IV` |
| İkilik | `1`, `10`, `11`, `100` |
| Onaltılık | Önce `1` ile `9`, sonra `A`, `B`, `C` |
| Sözcükler | `twenty-one` ya da `one hundred and five` gibi yazılı sözcükler |
| Sıra sayısı | `1st`, `2nd`, `3rd`, `4th` |
| Fibonacci | Fibonacci dizisi: `1`, `1`, `2`, `3`, `5`, `8` |
| Asal sayılar | Yalnızca asal sayılar: `2`, `3`, `5`, `7`, `11` |

Normal varsayılan desendir. Desen kontrol panelinden seçilir; bunun için bir komut yoktur.

> [!WARNING]
> Kontrol panelindeki **Sayma Deseni** açılır menüsü şu anda Ardışık, Katları Atla, Fibonacci, Asal Sayılar ve İkinin Kuvvetleri seçeneklerini listeler ve bu değerler yukarıdaki bot desen listesiyle uyuşmaz. Şimdilik kontrol panelinden yalnızca Ardışık (Normal) güvenle seçilebilir.

## Kilometre taşları

Bot, sayı ilk kez 100, 500, 1.000, 5.000 ya da 10.000'in bir katına ulaştığında bir kilometre taşı kaydeder. Kilometre taşları **İstatistikler** sekmesinde ve `countingstatus` komutunda gösterilir.

Kontrol panelindeki **Yönetim** sekmesi ve `countingmilestones` komutu, kanal başına özel bir kilometre taşı sayıları listesi saklamanı sağlar. Aynı sekme ve `countingmilestonemessage` bir kilometre taşı mesajını, `countingmilestonechannel` ise bir kilometre taşı duyuru kanalını saklar. Bu değerler kaydedilir, ancak bot henüz kilometre taşı duyurusu göndermez; bu yüzden bunları gelecekteki bir sürüm için ayrılmış olarak düşün.

## İstatistikler ve liderlik tabloları

Her üyenin kanal başına istatistikleri vardır: katkılar, mevcut seri, en yüksek seri, doğruluk, hatalar, sayılan toplam sayı ve son katkı. `countingstats` komutu bunları üyenin sıralamasıyla birlikte gösterir.

`countingleaderboard` komutu ve **Sıralama tablosu** sekmesi, dört türden birine göre sıralama yapar:

| Tür | Sıralama ölçütü |
| --- | --- |
| `contributions` | Doğru sayım sayısı (varsayılan) |
| `streak` | En yüksek seri |
| `accuracy` | Doğru sayımların yüzdesi |
| `totalnumbers` | Sayılan toplam sayı |

Komut ilk 20 kişiyi gösterir; sayfa başına on kişi listelenir.

## Kayıt noktaları

`countingsave` mevcut sayıyı isteğe bağlı bir nedenle kaydeder ve sana bir kayıt kimliği verir. `countingrestore <id>` onay isteminden sonra kanalı o sayıya geri döndürür. `countingreset` ise sayıyı doğrudan istediğin bir değere ayarlar; onay ister ve varsayılan değeri 0'dır. Üçü de **Yönetim** sekmesinde bulunur.

## Moderasyon

Sayma moderasyonu, `countmodenable true` ile kanal bazında ya da `countmoddefaults true` ile sunucu genelinde etkinleştirilene kadar kapalıdır. Kanal ayarları sunucu varsayılanlarını geçersiz kılar; `countmodreset` bir kanalı varsayılanlara geri döndürür.

Moderasyon açıkken her yanlış sayı üyeye kaydedilir ve üyenin **zaman penceresi** (varsayılan 24 saat, 1 ila 168 saat) içindeki yanlış sayım sayacına eklenir. Bir üyenin sayacı tam bir değere ulaştığında kademeli cezalar uygulanır: `countmodpunish 3 Mute 30` üçüncü yanlış sayımda 30 dakika susturma uygular. Bir kanal için ayarlanan kademeler o kanala uygulanır; kanal belirtilmeden ayarlanan kademeler sunucu varsayılanıdır ve kanal kademeleri önceliklidir. `Softban`, `Kick` ve `RemoveRoles` süre alamaz; süreler en fazla 49 güne kadar çıkabilir. `AddRole` bir rol gerektirir.

Moderasyon açıkken iki ek kural daha geçerlidir:

- **Sayı olmayan mesajlar**: `countmodnonnumbers`, kanaldaki sohbet mesajlarının silinip silinmeyeceğini (varsayılan evet) ve ihlal sayılıp sayılmayacağını (varsayılan hayır) belirler.
- **Düzenlemeler**: `countmodedits`, kanaldaki bir mesajın düzenlenmesinin mesajı silip silmeyeceğini (varsayılan evet) ve ihlal sayılıp sayılmayacağını (varsayılan hayır) belirler.

Rol kuralları: **Gerekli Roller** bir üyenin sayabilmesi için bunlardan en az birine sahip olmasını gerektirir; **Yasaklı Roller** bunlardan herhangi birine sahip üyeleri engeller; `countmodignore` ise listelenen rollere sahip üyeleri atlar ve isteğe bağlı olarak mesajlarını siler.

`countingban`, `countingtimeout` ve `countingunban` tek bir üyeyi bir kanaldan kalıcı olarak ya da bir süre için engeller. **Yönetim** sekmesinde aynı kontroller kullanıcı kimliğiyle bulunur; ayrıca `countingdisable` komutunun temizleme seçeneğiyle eşleşen bir **Kanal Verilerini Temizle** düğmesi vardır.

## Ayarlar

Kontrol panelinde beş sekme vardır: **Kanallar**, **Yapılandırma**, **İstatistikler**, **Sıralama tablosu** ve **Yönetim**. Önce **Kanallar** sekmesinden bir kanal seç; diğer sekmeler o kanal üzerinde işlem yapar.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Başlangıç Sayısı | 1 | Sayının kurulumda başladığı değer |
| Artış | 1 | Her sayımın ne kadar ekleyeceği; pozitif olmalıdır |
| Sayma Deseni | Normal | Sayıların nasıl yazılacağı, yukarıya bak |
| Sayı Tabanı | 10 | Normal desen tarafından kullanılan taban |
| Bekleme süresi (saniye) | 0 | Aynı üyenin iki sayımı arasındaki bekleme, 0 ila 300 |
| En Yüksek Sayı | 0 (sınırsız) | Bu değer geçildiğinde sayma durur |
| Başarı Emojisi | onay işareti | Doğru sayımdaki tepki |
| Hata Emojisi | çarpı işareti | Yanlış sayımdaki tepki |
| Tekrarlayan kullanıcılara izin ver | Kapalı | Bir üyenin arka arkaya iki kez saymasına izin verir |
| Hatada sayıyı sıfırla | Kapalı | Yanlış sayı kanalı başlangıca döndürür |
| Yanlış mesajları sil | Açık | Yanlış sayıları iki saniye sonra siler |
| Başarımları etkinleştir | Açık | `countingconfig` içinde gösterilen kaydedilmiş bayrak |
| Yarışmaları etkinleştir | Açık | `countingconfig` içinde gösterilen kaydedilmiş bayrak |
| Gerekli Roller | yok | Sayabilmek için bunlardan birine sahip olunmalı |
| Yasaklı Roller | yok | Bu rollere sahip üyeler sayamaz |

> [!NOTE]
> `countingfailurethreshold` komutu 1 ile 10 arasında bir değer saklar (varsayılan 3) ve `countmodthreshold` bir yanlış sayım eşiği saklar; ancak cezalar yalnızca `countmodpunish` ile ayarladığın kademelerden tetiklenir.

## Kurulum adımları

1. Bir kanal oluştur ve bota orada Kanalı Görüntüle, Mesaj Gönder, Tepki Ekle, Mesajları Yönet ve Mesaj Geçmişini Oku izinlerini ver.
2. Kontrol panelinde **Sayma** sayfasını aç, **Yeni Sayma Kanalı Kur** altından kanalı seç, **Başlangıç Sayısı** ve **Artış** değerlerini ayarla ve kaydet.
3. **Yapılandırma** sekmesinde oyunu yavaşlatmak istersen bir **Bekleme süresi** ayarla ve emojileri seç.
4. İstersen **Gerekli Roller** ya da **Yasaklı Roller** ekle.
5. Otomatik cezalar istiyorsan kanalda `countmodenable true` komutunu çalıştır ve `countmodpunish` ile kademeler ekle.
6. Tepkilerin çalıştığını doğrulamak için bir hesaptan `1`, başka bir hesaptan `2` yaz.

## Komutlar

Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Diğer adlar | Gereken yetki | Amaç |
| --- | --- | --- | --- |
| `countingsetup [#channel] [start] [increment]` | `csetup`, `countsetup` | Kanalları Yönet | Bir kanalda saymayı başlatır |
| `countingstatus [#channel]` | `cstatus`, `countstatus` | Yok | Mevcut sayı, rekor, toplamlar ve aktif kurallar |
| `countingconfig [#channel]` | `cconfig`, `countconfig` | Kanalları Yönet | Kanalın yapılandırmasını gösterir |
| `countingreset [#channel] [number] [reason]` | `creset`, `countreset` | Mesajları Yönet | Sayıyı sıfırlar; varsayılan 0, onay ister |
| `countingstats [@user] [#channel]` | `countstats` | Yok | Bir üyenin sayma istatistikleri ve sıralaması |
| `countingleaderboard [type] [#channel]` | `cleaderboard`, `countleaderboard`, `clb` | Yok | Katkılara, seriye, doğruluğa ya da totalnumbers'a göre ilk 20 |
| `countingsave [#channel] [reason]` | `csave`, `countsave` | Mesajları Yönet | Bir kayıt noktası oluşturur |
| `countingrestore <saveId> [#channel]` | `crestore`, `countrestore` | Mesajları Yönet | Bir kayıt noktasına geri döner |
| `countingdisable [#channel] [purge] [reason]` | `cdisable`, `countdisable` | Kanalları Yönet | Saymayı durdurur; `true` tüm verileri de temizler |
| `countinglist` | `clist`, `countlist` | Kanalları Yönet | Aktif sayma kanallarını listeler |
| `countingban <@user> [#channel] [duration] [reason]` | `cban`, `countban` | Mesajları Yönet | Bir üyeyi sayma oyunundan yasaklar; süre verilmezse kalıcıdır |
| `countingunban <@user> [#channel] [reason]` | `cunban`, `countunban` | Mesajları Yönet | Sayma yasağını kaldırır |
| `countingtimeout <@user> <duration> [#channel] [reason]` | `ctimeout`, `counttimeout` | Mesajları Yönet | Geçici sayma yasağı |
| `countingcooldown [#channel] [seconds]` | `ccooldown`, `countcooldown` | Kanalları Yönet | Bekleme süresini gösterir ya da ayarlar, 0 ila 300 |
| `countingmilestones [#channel] [50,100,...]` | `cmilestones`, `countmilestones` | Kanalları Yönet | Gösterir, ayarlar ya da özel kilometre taşı sayılarını sıfırlamak için `-` kullanır |
| `countingsuccessmessage [#channel] [text]` | `csuccessmessage`, `countsuccessmessage` | Kanalları Yönet | Bir başarı şablonu saklar, `-` sıfırlar |
| `countingfailuremessage [#channel] [text]` | `cfailuremessage`, `countfailuremessage` | Kanalları Yönet | Bir hata şablonu saklar, `-` sıfırlar |
| `countingmilestonemessage [#channel] [text]` | `cmilestonemessage`, `countmilestonemessage` | Kanalları Yönet | Bir kilometre taşı şablonu saklar, `-` sıfırlar |
| `countingmilestonechannel [#counting] [#target]` | `cmilestonechannel`, `countmilestonechannel` | Kanalları Yönet | Bir kilometre taşı kanalı saklar; temizlemek için none |
| `countingfailurechannel [#counting] [#target]` | `cfailurechannel`, `countfailurechannel` | Kanalları Yönet | Bir hata günlük kanalı saklar; temizlemek için none |
| `countingfailurethreshold [#channel] [1-10]` | `cfailurethreshold`, `countfailurethreshold` | Kanalları Yönet | Hata eşiğini gösterir ya da ayarlar |
| `countmodshow [#channel]` | `cmshow`, `countmoderationshow` | Kanalları Yönet | Moderasyon yapılandırmasını ve sunucu varsayılanlarını gösterir |
| `countmoddefaults <on/off> [threshold] [hours] [punishment] [minutes] [@role]` | `cmdefaults`, `countmoderationdefaults` | Yönetici | Sunucu genelinde moderasyon varsayılanları |
| `countmodenable <on/off> [#channel]` | `cmenable`, `countmoderationenable` | Kanalları Yönet | Bir kanal için moderasyonu açar ya da kapatır |
| `countmodthreshold <1-100> [#channel]` | `cmthreshold`, `countmoderationthreshold` | Kanalları Yönet | Kanalın yanlış sayım eşiğini ayarlar |
| `countmodwindow <1-168> [#channel]` | `cmwindow`, `countmoderationwindow` | Kanalları Yönet | Bir yanlış sayımın kayıtta kalacağı saat sayısı |
| `countmodpunishment <action> [minutes] [@role] [#channel]` | `cmpunishment`, `countmoderationpunishment` | Kanalları Yönet | Kanalın varsayılan cezasını ayarlar |
| `countmodpunish <count> <action> [minutes] [@role] [#channel]` | `cmpunish`, `countmoderationpunish` | Kanalları Yönet | Tam bir yanlış sayımda ceza; kanal yoksa sunucu varsayılanı |
| `countmodunpunish <count> [#channel]` | `cmunpunish`, `countmoderationunpunish` | Kanalları Yönet | Bir kademeyi kaldırır |
| `countmodpunishlist [#channel]` | `cmpunishlist`, `countmoderationpunishlist` | Kanalları Yönet | Kademeleri listeler |
| `countmodignore <delete> [#channel] [@roles...]` | `cmignore`, `countmoderationignore` | Kanalları Yönet | Botun yok saydığı roller; isteğe bağlı olarak mesajlarını siler |
| `countmodrequired [#channel] [@roles...]` | `cmrequired`, `countmoderationrequired` | Kanalları Yönet | Sayabilmek için gereken roller |
| `countmodbanned [#channel] [@roles...]` | `cmbanned`, `countmoderationbanned` | Kanalları Yönet | Sayamayan roller |
| `countmodnonnumbers <punish> [delete] [#channel]` | `cmnonnumbers`, `countmoderationnonnumbers` | Kanalları Yönet | Kanaldaki sohbet için kurallar |
| `countmodedits <punish> [delete] [#channel]` | `cmedits`, `countmoderationedits` | Kanalları Yönet | Düzenlenmiş mesajlar için kurallar |
| `countmodreset [#channel]` | `cmreset`, `countmoderationreset` | Kanalları Yönet | Kanal sunucu varsayılanlarına döner |
| `countmodclear <@user> [#channel]` | `cmclear`, `countmoderationclear` | Mesajları Yönet | Bir üyenin yanlış sayımlarını temizler |
| `countmodclearall [#channel]` | `cmclearall`, `countmoderationclearall` | Mesajları Yönet | Herkesin yanlış sayımlarını temizler |

## İpuçları ve dikkat edilecekler

- Bot, kanalda Tepki Ekle iznine ihtiyaç duyar. Bu izin olmadan kimse onay ya da çarpı işareti almaz ve geçerli sayımlar bot engeli testinde atlanır.
- Yanlış sayıları ve sayı olmayan sohbeti silmek Mesajları Yönet iznini gerektirir.
- Botu engellemiş üyeler sayamaz: sayıları silinir ve bir uyarı gönderilir.
- Varsayılan tekrar kuralıyla, bir üye arka arkaya iki kez yazarsa sayı okunmadan reddedilir ve bu ret bir hata olarak sayılmaz.
- **Hatada sayıyı sıfırla** başlangıç sayısına döndürür; yani başlangıç 1 ise bir sonraki beklenen sayı yine 1 olur.
- Moderasyon cezaları uyarı sistemindeki işlemleri kullanır (Mute, Ban, Kick, AddRole ve benzeri); bu yüzden botun ilgili Discord izinlerine ve bir susturma rolüne ihtiyacı vardır.
- `countingdisable` komutu temizleme seçeneğiyle çalıştırılırsa o kanalın istatistiklerini, yasaklarını ve kayıt noktalarını siler; bu işlem geri alınamaz. Temizlemeden devre dışı bırakmak verileri korur.

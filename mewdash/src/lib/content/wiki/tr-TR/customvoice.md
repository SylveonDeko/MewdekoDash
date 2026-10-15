---
title: Özel Ses Kanalları
slug: customvoice
summary: Her üyeye kendi geçici ses kanalını veren bir katıl-oluştur merkezi; yeniden adlandırma, kullanıcı sınırı, bit hızı, kilit, izin ver ve reddet kontrolleri ve boşaldığında otomatik temizlik.
icon: fa-microphone
category: Entertainment
dashboard: /dashboard/customvoice
module: CustomVoice
tags: [custom voice, temporary voice, join to create, voice hub, private voice, voice channels, lock, bitrate, user limit, özel ses, geçici ses, katıl oluştur, ses merkezi, özel ses kanalı, kilit, bit hızı, kullanıcı sınırı]
related: [administration, statchannels]
---

## Ne işe yarar

Yetkililer bir ses kanalını merkez olarak belirler. Bir üye bu kanala katıldığında bot, onun için yeni bir ses kanalı oluşturur; adı bir şablondan gelir, yapılandırılmış kategoriye yerleştirilir ve üye oraya taşınır. Bu üye kanalın sahibi olur: adını değiştirebilir, kullanıcı sınırı ve bit hızı ayarlayabilir, yalnızca izinli üyelerin katılabilmesi için kilitleyebilir, belirli kişilere izin verebilir ya da reddedebilir, kanalı açık tutabilir veya başka birine devredebilir.

Son insan kanaldan ayrılınca kanal, sahibi açık tut seçeneğini açmadıysa kısa bir bekleme süresinden sonra silinir. Sahip ayrılır ama içeride başka biri varsa, o kişi kanalı sahiplenebilir.

Üyeler kanalları için tercihlerini kaydedebilir; böylece oluşturdukları her kanal tercih ettikleri adla, sınırla, bit hızıyla, kilit durumuyla ve açık tutma ayarıyla başlar. Yetkililer hangi özelleştirmelere izin verileceğini seçer, sınır ve bit hızı için üst sınır koyar ve özel kanalların tamamını yönetebilecek bir yönetici rolü belirleyebilir.

## Neden kullanırsın

- "Oyun 1"den "Oyun 8"e kadar uzanan kanal duvarını sürdürmeyi bırak; üyeler ihtiyaç duyduklarında bir kanal oluşturur ve sonra kanal kaybolur.
- Özel bir görüşme isteyen üyeler kanallarını kilitler ve yalnızca arkadaşlarına izin verir.
- Yayıncılar ve etkinlik sunucuları, uzaklaşırken kanalın kaybolmaması için kanalı açık tutar.
- Yönetici rolüne sahip moderatörler, sunucunun tamamında Kanalları Yönet iznine ihtiyaç duymadan herhangi bir kanalı yeniden adlandırabilir, kilitleyebilir ya da devredebilir.

## Merkez

`setupvoicehub`, "Custom Voice Channels" adlı yeni bir kategorinin içinde "Create Voice Channel" adlı bir ses kanalı oluşturur; herkes bağlanabilir ama konuşamaz ve kanal merkez olarak kaydedilir. `setvoicehub #channel [category]` ise zaten var olan bir kanalı kullanır. Kontrol panelindeki **Temel Yapılandırma** bölümü de aynısını bir kanal ve kategori seçici ile yapar.

**Kullanıcı başına birden fazla kanala izin ver** kapalıysa (varsayılan), zaten bir kanalın sahibiyken merkeze katılmak, yeni kanal oluşturulmadan önce eski kanalı siler.

## Kanal adlandırma

**Varsayılan Ad Biçimi** bir şablondur. Bot `{0}` yerine üyenin kullanıcı adını, `{1}` yerine etiket numarasını (discriminator) ve `{2}` yerine sunucu adını koyar. Varsayılan `{0}'s Channel` biçimidir. Ad, Discord'un sınırlarına sığacak şekilde kırpılır.

> [!NOTE]
> Kontrol panelindeki yer tutucu metin `{username}'s Channel` gösterir, ama bot yalnızca `{0}`, `{1}` ve `{2}` değerlerini değiştirir. Numaralı biçimi kullan.

## Sahip denetimleri

`voicecontrols`, içinde bulunduğun kanal için bir kontrol paneli gönderir. Panelde mevcut ad, sınır, bit hızı, kilit ve açık tutma durumu ile içeridekiler gösterilir. Düğmeler şunlardır: **Yeniden adlandır**, **Sınır**, **Bit hızı**, **Kilitle**/**Kilidi aç**, açık tutma, **Devret** ve içeridekileri yönetmek için bir üye seçici. Sunucunun kapattığı özelleştirmelerin düğmeleri devre dışıdır.

Aynı işlemler komut olarak da vardır. Her komut senin özel bir kanalda olduğunu, o kanalın sahibi olduğunu ya da yönetici rolüne sahip olduğunu ve sunucunun o özelleştirmeye izin verdiğini kontrol eder:

| İşlem | Komut | Ne yapar |
| --- | --- | --- |
| Yeniden adlandır | `voicerename <name>` | **Ad özelleştirmeye izin ver** açıksa kanalı yeniden adlandırır |
| Kullanıcı sınırı | `voicelimit <n>` | Sınırı belirler; sunucunun en yüksek kullanıcı sınırıyla sınırlıdır |
| Bit hızı | `voicebitrate <kbps>` | Bit hızını belirler; sunucunun en yüksek bit hızıyla sınırlıdır |
| Kilit | `voicelock [true/false]`, `voiceunlock` | Kilit, herkesin bağlanmasını engeller; izinli üyeler, sahip ve yönetici rolü hariç |
| İzin ver | `voiceallow @user` | Kilitli olsa bile bir üyeye bağlanma izni verir |
| Reddet | `voicedeny @user` | Bir üyenin bağlanma iznini kaldırır ve içerideyse onu çıkarır |
| Açık tut | `voicekeepalive [true/false]` | Bu kanal için boş kanal temizliğini durdurur |
| Devret | `voicetransfer @user` | Başka bir üyeyi sahip yapar ve yönetim izinlerini ona geçirir |
| Sahiplen | `voiceclaim` | Sahip kanalda değilken içerideki herhangi bir üye sahipliği alabilir |

**Kanal izinlerini otomatik yönet** açıkken sahip kendi kanalında bağlan, konuş, Kanalı Yönet, Üyeleri Taşı, Üyeleri Sustur ve Üyelerin Sesini Kapat izinlerini alır. İzin verilen ve reddedilen üyeler de buna uygun izin kayıtları alır, yönetici rolü de yönetim erişimi kazanır.

## Temizlik

**Boş kanalları sil** açıkken (varsayılan), içinde hiç insan kalmayan bir kanal boş kanal zaman aşımından sonra silinmek üzere planlanır. Zamanlayıcı dolmadan tekrar katılmak bunu iptal eder. Açık tutulan kanallar asla otomatik olarak kaldırılmaz. Her beş dakikada bir çalışan bir arka plan taraması, zaman aşımından uzun süre boş kalmış kanalları da kaldırır. Kontrol panelindeki **Etkin olmayan kanalları temizle** düğmesi ise seçtiğin saat sayısından uzun süredir etkin olmayan kanalları kaldırır.

## Üye tercihleri

`voicepreferences`, kayıtlı ad biçimini, kullanıcı sınırını, bit hızını, kilit ve açık tutma tercihlerini gösterir. Her `voiceprefs...` komutu bir tercihi ayarlar; değer vermeden çalıştırmak onu temizler, `voiceprefsreset` ise hepsini temizler. Tercihler yalnızca **Kullanıcı tercihlerini hatırla** açıkken uygulanır ve sınır ile bit hızı yine de sunucunun üst sınırlarıyla sınırlıdır. Yetkililer **Kullanıcı Tercihleri** sekmesinden kullanıcı kimliğiyle herhangi bir üyenin tercihlerini görebilir ve düzenleyebilir.

## Ayarlar

Kontrol panelinde üç sekme vardır: **Yapılandırma**, **Aktif Kanallar** ve **Kullanıcı Tercihleri**. **Yapılandırma** kendi içinde **Temel Yapılandırma**, **Kanal Varsayılanları** ve **Kanal Yönetimi** olarak ayrılır. `voiceconfig` argümansız çalıştırılırsa her değeri gösterir; `voiceconfig <setting> <value>` ise tek bir değeri değiştirir.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Hub kanalı | yok | Katıl-oluştur kanalı |
| Kategori | yok | Yeni kanalların oluşturulduğu yer |
| Varsayılan Ad Biçimi | `{0}'s Channel` | Yeni kanal adları için şablon (`nameformat`) |
| Varsayılan Kullanıcı Sınırı | 0 (sınırsız) | Başlangıç kullanıcı sınırı (`userlimit`) |
| Varsayılan Bit Hızı | 64 kbps | Başlangıç bit hızı (`bitrate`) |
| Boş kanalları sil | Açık | Kimsenin olmadığı kanalları kaldır (`deleteempty`) |
| Boş kalma zaman aşımı | 1 | Boş bir kanalın kaldırılmadan önceki gecikme (`emptytimeout`); kontrol panelinde saniye olarak etiketlenir ve 5 ile 300 arası kabul eder |
| Kullanıcı başına birden fazla kanala izin ver | Kapalı | Bir üyenin birden fazla kanala sahip olmasına izin ver (`multiplechannels`) |
| Kullanıcı tercihlerini hatırla | Açık | Kayıtlı üye tercihlerini uygula (`persistpreferences`) |
| Kanal izinlerini otomatik yönet | Açık | Sahip, izin ver, reddet ve yönetici kayıtlarını ayarla (`autopermission`) |
| Ad özelleştirmeye izin ver | Açık | `namechange` |
| Kullanıcı sınırı özelleştirmeye izin ver | Açık | `limitchange` |
| Bit hızı özelleştirmeye izin ver | Açık | `bitratechange` |
| Kanal kilitlemeye izin ver | Açık | `locking` |
| Kullanıcı yönetimine izin ver | Açık | İzin ver ve reddet komutları (`usermanagement`) |
| Maksimum kullanıcı sınırı | 99 | Üyelerin ayarlayabileceği sınırın üst değeri (`maxuserlimit`) |
| Maksimum bit hızı | 96 kbps | Üyelerin ayarlayabileceği bit hızının üst değeri; ayrıca sunucunun takviye seviyesiyle sınırlıdır (`maxbitrate`) |
| Yönetici rolü | yok | Herhangi bir özel kanalı yönetebilen rol (`adminrole`) |

**Maksimum kullanıcı sınırı**, **Maksimum bit hızı** ve **Yönetici rolü** için kontrol panelinde denetim yoktur; bunları `voiceconfig` ile ayarla.

**Aktif Kanallar** sekmesi, her canlı özel kanalı sahibi, kilit ve açık tutma durumuyla listeler; bir kanalı kilitlemene, kilidini açmana ya da silmene izin verir. Son bir saatte oluşturulan, etkin olan, kilitli olan ve açık tutulan kanallar için toplamları gösterir. Ayrıca **Etkin olmayan kanalları temizle** düğmesini ve modülü sunucu için kapatan **Özel sesi devre dışı bırak** düğmesini içerir.

## Kurulum adımları

1. Kullanacağın kategoride bota Kanalları Yönet, Üyeleri Taşı ve Rolleri Yönet izinlerini ver (izin üzerine yazma için).
2. `setupvoicehub` komutunu çalıştır ya da kontrol panelinde **Özel Ses** sayfasını aç ve **Temel Yapılandırma** altından var olan bir hub kanalı ve kategori seç.
3. **Kanal Varsayılanları** altında **Varsayılan Ad Biçimi**, **Varsayılan Kullanıcı Sınırı** ve **Varsayılan Bit Hızı** değerlerini ayarla.
4. **Kanal Yönetimi** altında üyelerin sahip olmasını istemediğin özelleştirmeleri kapat.
5. Sahibi olmadıkları kanalları yönetebilsinler diye `voiceconfig adminrole @Moderators` ile bir **Yönetici rolü** belirle.
6. Hub'a kendin katıl, `voicecontrols` komutunu çalıştır ve kanalı yeniden adlandırmayı ve kilitlemeyi dene.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (`.`, değiştirmediysen).

| Komut | Diğer adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `setupvoicehub` | `svh`, `createvoicehub`, `voicesetup` | Kanalları Yönet | Bir hub kanalı ve kategori oluştur |
| `setvoicehub <#channel> [category]` | `sethub`, `voicehub` | Kanalları Yönet | Var olan bir kanalı hub olarak kullan |
| `voiceconfig [setting] [value]` | `vcconfig`, `voicesettings`, `vcsettings`, `customvoiceconfig` | Kanalları Yönet | Sunucu ayarlarını göster ya da değiştir |
| `voicecontrols` | `vcontrols` | Sahip ya da yönetici rolü | Kanalın için etkileşimli kontrol paneli |
| `voicechannels` | `vchannels`, `listvoice`, `customvoices`, `voicelist` | Yok | Aktif özel kanalları listele |
| `voicerename <name>` | `vrename`, `renamevoice`, `vcname`, `vcrename` | Sahip ya da yönetici rolü | Kanalını yeniden adlandır |
| `voicelimit <number>` | `vclimit`, `limitvoice`, `vlimit`, `setlimit` | Sahip ya da yönetici rolü | Kullanıcı sınırını ayarla |
| `voicebitrate <kbps>` | `vcbitrate`, `vbitrate`, `setbitrate` | Sahip ya da yönetici rolü | Bit hızını ayarla |
| `voicelock [true/false]` | `vclock`, `lockvoice`, `vlock`, `lockvc` | Sahip ya da yönetici rolü | Kilitle ya da kilidi aç |
| `voiceunlock` | `vcunlock`, `unlockvoice`, `vunlock`, `unlockvc` | Sahip ya da yönetici rolü | Kilidi aç |
| `voiceallow @user` | `vcallow`, `allowuser`, `vallow`, `adduser` | Sahip ya da yönetici rolü | Bir üyenin kilitli kanala katılmasına izin ver |
| `voicedeny @user` | `vcdeny`, `denyuser`, `vdeny`, `removeuser` | Sahip ya da yönetici rolü | Bir üyeyi engelle ve bağlantısını kes |
| `voiceclaim` | `vcclaim`, `claimvoice`, `vclaim`, `takeover` | Yok | Sahibi ayrılmış bir kanalı devral |
| `voicetransfer @user` | `vctransfer`, `transfervoice`, `vtransfer`, `givevc` | Sahip ya da yönetici rolü | Kanalı başka birine ver |
| `voicekeepalive [true/false]` | `vckeepalive`, `keepvoice`, `vkeep`, `persist` | Sahip ya da yönetici rolü | Kanalı temizlemeden muaf tut |
| `voicepreferences` | `vcprefs`, `voiceprefs`, `vprefs`, `myvoice` | Yok | Kayıtlı tercihlerini göster |
| `voiceprefsname [format]` | `vcprefsname`, `vpname`, `prefname`, `namepref` | Yok | Tercih edilen ad biçimi; boş bırakılırsa temizlenir |
| `voiceprefslimit [number]` | `vcprefslimit`, `vplimit`, `preflimit`, `limitpref` | Yok | Tercih edilen kullanıcı sınırı |
| `voiceprefsbitrate [kbps]` | `vcprefsbitrate`, `vpbitrate`, `prefbitrate`, `bitratepref` | Yok | Tercih edilen bit hızı |
| `voiceprefslock [true/false]` | `vprefslock` | Yok | Kanalları kilitli başlat |
| `voiceprefskeepalive [true/false]` | `vcprefskeepalive`, `vpkeepalive`, `prefkeepalive`, `keeppref` | Yok | Kanalları açık tutma ile başlat |
| `voiceprefsreset` | `vcprefsreset`, `vprefsreset`, `resetprefs`, `clearprefs` | Yok | Tüm tercihleri temizle |

## İpuçları ve dikkat edilecekler

- Bot, kategoride Kanalları Yönet iznine, yeni kanala üyeyi taşımak için Üyeleri Taşı iznine ve izin üzerine yazmak için Rolleri Yönet iznine ihtiyaç duyar.
- Maksimum bit hızı, sunucunun takviye seviyesinin izin verdiğiyle sınırlanır; takviyesiz bir sunucuda 384 gibi bir ayar otomatik olarak düşürülür.
- Kilitleme, herkes rolü için bağlanmayı reddeder. Yönetici iznine sahip olan ya da zaten açık bir bağlanma izni olan rollerdeki üyeler yine de katılabilir.
- Son üye ayrıldığında çalışan boş kanal zamanlayıcısı zaman aşımı değerini saniye olarak alır; yapılandırma ekranı ve beş dakikalık tarama ise bunu dakika olarak ele alır. Varsayılan 1 ile kanal boşaldığında neredeyse hemen kaybolur.
- Açık tutulan kanallar asla otomatik temizlenmez. Unutulmuş kanalları bulmak için **Aktif Kanallar** sekmesini ya da `voicechannels` komutunu kullan.
- Sahiplenme yalnızca orijinal sahip kanala bağlı değilken çalışır.

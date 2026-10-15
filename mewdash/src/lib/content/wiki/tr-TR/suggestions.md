---
title: Öneriler
slug: suggestions
summary: Üyelere fikirlerini gönderecekleri bir kanal ya da düğme ver, sunucunun bu fikirlere oy vermesini sağla ve yetkililerin her birini bir gerekçeyle kabul etmesine, reddetmesine, değerlendirmesine ya da uygulamasına izin ver.
icon: fa-lightbulb
category: Community
dashboard: /dashboard/suggestions
module: Suggestions
tags: [suggestions, ideas, feedback, voting, accept, deny, consider, implement, threads, suggest button, placeholders, öneriler, fikirler, geri bildirim, oylama, kabul, reddet, değerlendir, uygula, konular, öneri düğmesi, yer tutucular]
related: [administration, afk]
---

## Ne işe yarar

Bir üye fikrini `suggest` komutuyla yazar, doğrudan öneri kanalına yazar ya da **Suggest Here!** düğmesine basıp bir form doldurur. Bot orijinal mesajı siler, öneri kanalına numaralı bir öneri embed'i gönderir ve oy emojilerini tepki ya da düğme olarak ekler. Her önerinin, yetkililerin daha sonra ona atıfta bulunmak için kullandığı bir numarası olur.

Yetkililer daha sonra bir öneriyi dört durumdan birinden geçirebilir: kabul, red, değerlendirme ya da uygulama. Her birine isteğe bağlı bir gerekçe eklenebilir. Bot, orijinal öneri mesajını renkli bir durum embed'ine dönüştürür, öneriyi gönderen üyeye sonuç hakkında DM atar ve her durum için ayrı bir kanala durum embed'ini yeniden paylaşabilir. Böylece kabul edilen fikirler tek bir yerde, reddedilenler başka bir yerde toplanır.

İsteğe bağlı olarak her öneriye **Join/Create Discussion** düğmesi eklenebilir. Bu düğme öneriye bağlı herkese açık ya da özel bir konu açar. Yetkililer durumu değiştirdiğinde konu otomatik olarak arşivlenebilir.

## Neden kullanırsın

- Fikirlerin yanıtlar arasında kaybolduğu geri bildirim kanalları için; her öneri oy sayısıyla birlikte kendi mesajı olur.
- Üyelerin neyin kabul edildiğini ve neyin neden reddedildiğini görmesini isteyen topluluklar için; yetkililerin duyuru yazmasına gerek kalmaz.
- Ana kanaldaki tartışmalar yerine her fikir için konular üzerinden ayrı tartışma açmak isteyen sunucular için.
- Gerekçe kutusuyla kontrol panelinden değerlendirme yapmak isteyen yetkililer için; öneri numaralarını ezberlemek gerekmez.

## Öneri nasıl gönderilir

Üç yol vardır ve hepsi aynı uzunluk kontrollerinden geçip öneri kanalına düşer.

| Yöntem | Ne olur |
| --- | --- |
| `suggest <text>` | Komut mesajı silinir ve öneri gönderilir. Her kanaldan çalışır. |
| Öneri kanalına yazmak | Önek ile başlamayan, bot olmayan her mesaj bir öneriye dönüştürülür ve orijinal mesaj silinir. Sunucunun yetkili rolüne sahip üyeler atlanır, böylece yetkililer kanalda normal şekilde konuşabilir. |
| Öneri düğmesi | **Öneri Düğmesi Kanalı** içinde bir düğmeli mesaj. Düğmeye basınca, ayarlarındaki uzunluk sınırlarına uyan bir form açılır. |

Metin **Maximum Length** değerinden uzunsa ya da **Minimum Length** değerinden kısaysa reddedilir. Komutta hata kanalda gösterilir ve beş saniye sonra silinir; öneri kanalında mesaj silinir ve üyeye DM ile bildirilir. Önerideki etiketler gönderilen embed'de etkisiz hale getirilir ve üyeye önerisinin gönderildiği bildirilir.

Varsayılan öneri embed'inde üye yazar olarak gösterilir, başlık "Suggestion #N" olur ve metin açıklama olarak yazılır. Bunu kendi embed'inle değiştirebilirsin (aşağıdaki yer tutuculara bak).

### Öneri düğmesi

Düğme mesajı **Öneri Düğmesi Kanalı** içinde gönderilir ve bot onu her zaman en altta tutar: başka mesajlar onu yukarı itince bot düğmeyi siler ve yeniden gönderir. Varsayılan etiket emojisiz **Suggest Here!** yazısıdır ve rengi Blurple'dır. Düğmenin üstündeki mesaj düz metin ya da embed kodu olabilir; varsayılanı kısa bir "öneri yap" istemidir.

## Oylama

Varsayılan olarak her öneriye bir başparmak yukarı ve bir başparmak aşağı eklenir. `suggestmotes` komutuyla ya da **Özel Emojiler** seçicisiyle bunların yerine en fazla beş özel emoji ayarlayabilirsin; botun bu emojileri kullanabiliyor olması gerekir.

**Emoji Görüntüleme Modu** oyların nasıl kullanılacağını belirler.

| Mod | Davranış |
| --- | --- |
| Tepkiler (varsayılan) | Bot emojileri tepki olarak ekler. Sayılar tepki eklenme ve kaldırılmalarına göre tutulur. |
| Düğmeler | Emojiler, canlı sayısı görünen düğmelere dönüşür. Bir üye her öneri için tek oy verebilir: aynı düğmeye tekrar basmak oyu kaldırmayı, farklı bir düğmeye basmak ise oyu değiştirmeyi ister. |

Düğme modunda beş emoji düğmesinin her birinin kendi rengi vardır (**Emoji 1 Düğmesi** ile **Emoji 5 Düğmesi**). Renkler Mavi, Gri, Yeşil ve Kırmızıdır. Bir rengi değiştirmek öneri düğmesi mesajını da yeniler.

`suggestinfo <number>` önerinin metnini, kimin önerdiğini, mevcut durumunu, en son kimin değiştirdiğini, durumun kaç kez değiştiğini ve her emojinin sayısını gösterir; altında Kabul Et, Reddet, Değerlendir ve Uygula düğmeleri bulunur.

## Durumlar

Her öneri **Önerildi** olarak başlar (kontrol panelinde **Beklemede** olarak görünür). Mesajları Yönet yetkisine sahip yetkililer, `accept`, `deny`, `consider` ya da `implemented` komutlarıyla, `suggestinfo` üzerindeki düğmelerle ya da kontrol panelinden onu dört durumdan birine taşıyabilir. Gerekçeli her durum değişikliği gerekçeyi gösterir; gerekçe yoksa alan "none" yazar.

| Durum | Embed rengi | Ek seçenekler |
| --- | --- | --- |
| Kabul Edildi | Mavi | Kabul kanalı, kabul mesajı, kabul edilince arşivle |
| Reddedildi | Kırmızı | Red kanalı, red mesajı, reddedilince arşivle |
| Değerlendirildi | Altın | Değerlendirme kanalı, değerlendirme mesajı, değerlendirilince arşivle |
| Uygulandı | Yeşil | Uygulama kanalı, uygulama mesajı, uygulanınca arşivle |

Bir durum değiştiğinde bot şunları bu sırayla yapar:

1. O durumun arşiv anahtarı açıksa tartışma konusunu arşivler.
2. Öneri kanalındaki orijinal mesajı durum embed'ine dönüştürür ve tüm tepkileri kaldırır. Orijinal mesaj yoksa yenisini gönderir.
3. Öneriyi gönderen kişiye öneriyi, gerekçeyi ve değiştireni gösteren bir embed DM olarak gönderir. Yetkiliye giden onay mesajı, DM'in iletilip iletilmediğini ya da üyenin DM'lerinin kapalı olduğunu belirtir.
4. Yeni durumu ve değiştireni kaydeder.
5. O durum için bir kanal ayarlıysa, durum embed'ini oraya gönderir ve o öneriye ait önceki durum mesajını siler. Böylece bir öneri Değerlendirildi'den Kabul Edildi'ye geçtiğinde eski bir kopya kalmaz.

Bir öneri istediğin kadar durum arasında geçebilir. Önerileri tekrar Önerildi durumuna döndüren bir komut yoktur.

### Durum mesajı

Varsayılan durum embed'inde öneriyi gönderen kişi yazar olarak, "Suggestion #12 Accepted" gibi bir başlık, öneri metni açıklama olarak ve bir **Neden** alanı bulunur. Kendi mesajını `acceptmessage`, `denymessage`, `considermessage` ya da `implementmessage` ile ya da kontrol panelindeki **Mesajlar** sekmesindeki dört düzenleyiciyle ayarlayabilirsin. Varsayılana dönmek için `-` kullan. Özel metin embed ayrıştırıcısından geçirilir; geçerli bir embed kodu değilse açıklama olarak kullanılır.

## Yer tutucular

Öneri mesajı (gönderim anında yayınlanır) bu yer tutucuları destekler; buna ek olarak yer tutucular sayfasındaki genel sunucu yer tutucuları da kullanılabilir.

| Yer tutucu | Değer |
| --- | --- |
| `%suggest.user%` | Öneriyi gönderenin tam kullanıcı adı |
| `%suggest.user.name%` | Öneriyi gönderenin kullanıcı adı |
| `%suggest.user.avatar%` | Öneriyi gönderenin avatar URL'si |
| `%suggest.message%` | Öneri metni, etiketler etkisiz hale getirilmiş |
| `%suggest.number%` | Öneri numarası |

Kabul, red, değerlendirme ve uygulama mesajları yukarıdakilerin hepsini, genel sunucu yer tutucularını ve şu ek yer tutucuları destekler.

| Yer tutucu | Değer |
| --- | --- |
| `%suggest.user.id%` | Öneriyi gönderenin kullanıcı kimliği |
| `%suggest.mod.user%` | Durumu değiştiren yetkilinin tam kullanıcı adı |
| `%suggest.mod.name%` | O yetkilinin kullanıcı adı |
| `%suggest.mod.avatar%` | Avatar URL'si |
| `%suggest.mod.Id%` | Kullanıcı kimliği (büyük I harfine dikkat) |
| `%suggest.mod.message%` | Verilen gerekçe ya da "none" |
| `%suggest.emote1count%` ile `%suggest.emote5count%` | Değişiklik anındaki her emojinin oy sayısı |

> [!EXAMPLE]
> Basit bir red mesajı: `Suggestion #%suggest.number% by %suggest.user% was denied by %suggest.mod.name%: %suggest.mod.message%`

## Konular

**Konu Türü** her yeni öneriye ikinci bir düğme satırı ekler.

| Tür | Düğme | Sonuç |
| --- | --- | --- |
| No Threads (varsayılan) | yok | Tartışma düğmesi yok |
| Regular Threads | Join/Create Public Discussion | Öneri mesajında "Suggestion #N Discussion" adlı herkese açık bir konu oluşturur |
| Private Threads | Join/Create Private Discussion | Aynı işlem, özel bir konu olarak |

İlk basışta konu oluşturulur ve hem öneriyi gönderen hem de düğmeye basan kişi konuya eklenir. Sonraki basışlarda bot konunun zaten var olduğunu söyler ve konuya bağlantı verir. Her öneri için bir konu takip edilir ve dört **Archive on** anahtarı, ilgili durum ayarlandığında konuyu arşivler. Konu türünü değiştirmek yalnızca bundan sonra gönderilen önerileri etkiler.

## Ayarlar

Kontrol panelindeki sayfada iki sekme vardır: **Öneriler** ve **Ayarlar**. **Ayarlar** sekmesi **Genel**, **Mesajlar**, **Kanallar**, **Arşivle** ve **Emojiler** olarak ayrılır.

| Ayar | Varsayılan | Ne kontrol eder |
| --- | --- | --- |
| Minimum uzunluk | ayarlı değil | Kabul edilen en kısa öneri, karakter olarak (2048 veya daha fazla olamaz; kontrol paneli alanı 2000'de durur) |
| Maksimum uzunluk | ayarlı değil | Kabul edilen en uzun öneri (0'dan büyük olmalı; kontrol paneli alanı 2000'de durur) |
| Konu Türü | No Threads | Yeni önerilere herkese açık ya da özel tartışma düğmesi eklenip eklenmeyeceği |
| Öneri mesajı | varsayılan embed | Bir öneri gönderildiğinde yayınlanan embed |
| Kabul / Red / Değerlendirme / Uygulama mesajı | varsayılan embed | Her durum için durum embed'i |
| Öneri Kanalı | yok (özellik kapalı) | Önerilerin gönderildiği ve yazılan mesajların öneriye dönüştüğü kanal |
| Kabul / Red / Değerlendirme / Uygulama Kanalı | yok | Her durum embed'inin kopyalandığı ek kanal |
| Kabul / Red / Değerlendirme / Uygulama durumunda arşivle | kapalı | O durumda tartışma konusunu arşivle |
| Emoji Görüntüleme Modu | Tepkiler | Oylama için tepkiler ya da düğmeler |
| Özel Emojiler | başparmak yukarı ve aşağı | Oylamada kullanılan en fazla beş emoji |
| Düğme Etiketi | Suggest Here! | Öneri düğmesindeki yazı |
| Düğme Emojisi | yok | Öneri düğmesindeki emoji |
| Düğme Mesajı | varsayılan istem | Öneri düğmesinin üstünde gönderilen metin ya da embed |
| Öneri Düğmesi Rengi | Blurple | Öneri düğmesinin rengi |
| Emoji 1 ile 5 Düğmesi | Blurple | Düğme modundaki her oy düğmesinin rengi |

> [!WARNING]
> **Öneri Kanalı** ayarlanana kadar hiçbir şey çalışmaz. O zamana kadar `suggest` komutu kanal ayarlanmadığını söyler ve hatayı üç saniye sonra siler.

**Öneriler** sekmesi her öneriyi durumu, oy sayıları ve tarihiyle listeler; tarihe ya da duruma göre sıralanabilir. Her kartta **Kabul Et**, **Reddet**, **Değerlendir** ve **Uygula** düğmeleri, isteğe bağlı bir gerekçe kutusu ile birlikte bulunur. **Sil** düğmesi kaydı veritabanından siler, Discord mesajına dokunmaz.

## Kurulum adımları

1. Kontrol panelinde **Öneriler**'i aç ve **Ayarlar** sekmesine geç.
2. **Kanallar** bölümünde bir **Öneri Kanalı** seç. İstersen kabul edilen, reddedilen, değerlendirilen ve uygulanan öneriler için ayrı kanallar da seçebilirsin.
3. **Genel** bölümünde **Minimum uzunluk** ve **Maksimum uzunluk** değerlerini ayarla; örneğin 10 ve 1000. Fikir bazlı tartışma istiyorsan bir **Konu Türü** seç.
4. **Emojiler** bölümünde **Tepkiler** ya da **Düğmeler**'i seç ve istersen en fazla beş **Özel Emoji** belirle. Öneri düğmesi istiyorsan etiketini, emojisini ve mesajını buradan ayarla, sonra Discord'da `suggestbuttonchannel #channel` komutunu çalıştırarak düğmeyi gönder.
5. **Arşivle** bölümünde tartışmayı kapatması gereken durumların arşiv anahtarlarını aç.
6. İstersen **Mesajlar** bölümünde durum embed'lerini yukarıdaki yer tutucularla özelleştir.
7. Kaydet ve test et: `suggest test idea` komutunu çalıştır, öneriye oy ver ve durum embed'ini ile DM'i görmek için `accept 1 looks good` komutunu çalıştır.

## Komutlar

Bu komutları sunucunun önekiyle çalıştır (önekini değiştirmediysen `.`).

| Komut | Takma adlar | Gereken yetki | Amaç |
| --- | --- | --- | --- |
| `suggest <text>` | `suggestion` | Herkes | Öneri gönder |
| `suggestinfo <number>` | `suginfo` | Mesajları Yönet | Bir önerinin ayrıntılarını, oy sayılarını ve durum düğmelerini göster |
| `accept <number> [reason]` | `suggestaccept`, `acceptsuggest` | Mesajları Yönet | Bir öneriyi kabul edildi olarak işaretle |
| `deny <number> [reason]` | `suggestdeny`, `denysuggest` | Mesajları Yönet | Bir öneriyi reddedildi olarak işaretle |
| `consider <number> [reason]` | `suggestconsider`, `considersuggest` | Mesajları Yönet | Bir öneriyi değerlendiriliyor olarak işaretle |
| `implemented <number> [reason]` | `suggestimplement`, `implementsuggest` | Mesajları Yönet | Bir öneriyi uygulandı olarak işaretle |
| `setsuggestchannel [#channel]` | `suggestchannel`, `suggestchan` | Kanalları Yönet | Öneri kanalını ayarla ya da kanal olmadan önerileri kapat |
| `suggestclear` | `suggestreset`, `resetsuggestions`, `clearsuggestions` | Yönetici | Onaydan sonra tüm önerileri sil ve sayacı sıfırla |
| `suggestmessage <text>` | `suggestmsg` | Yönetici | Özel öneri embed'i; sıfırlamak için `-` |
| `acceptmessage <text>` | `acceptmsg` | Yönetici | Özel kabul embed'i; sıfırlamak için `-` |
| `denymessage <text>` | `denymsg` | Yönetici | Özel red embed'i; sıfırlamak için `-` |
| `considermessage <text>` | `considermsg` | Yönetici | Özel değerlendirme embed'i; sıfırlamak için `-` |
| `implementmessage <text>` | `implementmsg` | Yönetici | Özel uygulama embed'i; sıfırlamak için `-` |
| `acceptchannel [#channel]` | | Yönetici | Kabul edilen öneriler için kanal; kapatmak için boş bırak |
| `denychannel [#channel]` | | Yönetici | Reddedilen öneriler için kanal; kapatmak için boş bırak |
| `considerchannel [#channel]` | | Yönetici | Değerlendirilen öneriler için kanal; kapatmak için boş bırak |
| `implementchannel [#channel]` | | Yönetici | Uygulanan öneriler için kanal; kapatmak için boş bırak |
| `minsuggestionlength <number>` | `minsuggestlength` | Yönetici | Minimum karakter sayısı; 2048'den küçük olmalı |
| `maxsuggestionlength <number>` | `maxsuggestlength` | Yönetici | Maksimum karakter sayısı; 0'dan büyük olmalı |
| `suggestmotes <emotes>` | `smotes`, `suggestemotes` | Yönetici | En fazla beş oy emojisi ya da başparmakları geri getirmek için `disable` |
| `suggestmotesmode <reactions/buttons>` | | Yönetici | Oylama için tepkiler ya da düğmeler |
| `suggestmotecolor <number> <colour>` | | Yönetici | 1 ile 5 arasındaki oy düğmesinin rengi: `blurple`, `grey`, `green` ya da `red` |
| `suggestthreadstype <none/public/private>` | `suggestthreads` | Yönetici | Yeni öneriler için tartışma konusu türü |
| `archiveonaccept` | | Yönetici | Kabul edilince konu arşivlemeyi aç/kapat |
| `archiveondeny` | | Yönetici | Reddedilince konu arşivlemeyi aç/kapat |
| `archiveonconsider` | | Yönetici | Değerlendirilince konu arşivlemeyi aç/kapat |
| `archiveonimplement` | | Yönetici | Uygulanınca konu arşivlemeyi aç/kapat |
| `suggestbuttonchannel <#channel>` | | Yönetici | Öneri düğmesini bir kanala gönder |
| `suggestbuttonmessage <text>` | | Yönetici | Öneri düğmesinin üstündeki metin ya da embed; sıfırlamak için `-` |
| `suggestbuttonlabel <text>` | | Yönetici | En fazla 80 karakterlik düğme etiketi; sıfırlamak için `-` |
| `suggestbuttonemote [emote]` | | Yönetici | Düğme emojisi; sıfırlamak için boş bırak |
| `suggestbuttoncolor <colour>` | | Yönetici | Öneri düğmesinin rengi: `blurple`, `grey`, `green` ya da `red` |

Slash karşılıkları `/suggestions` ve `/suggestions customize` altında bulunur.

## İpuçları ve dikkat edilecekler

- Bot, orijinal mesajları silmek için öneri kanalında Mesajları Yönet, tepki modu için Tepki Ekle ve tartışmalar için Herkese Açık ya da Özel Konular Oluştur yetkilerine ihtiyaç duyar. Durum kanallarında kopyanın sessizce atlanmaması için Bağlantı Yerleştirme yetkisi gerekir.
- Kanalı açmadan önce hem minimum hem de maksimum uzunluk sınırlarını ayarla. Yazılan mesaj yolu sınırların dışındaki her şeyi siler; maksimum ayarlanmamışsa tüm mesajları yiyebilir.
- **Ayarlar** içindeki yetkili rolüne sahip üyeler, mesajları öneriye dönüşmeden öneri kanalında konuşabilir. Diğer herkesin mesajları öneriye dönüştürülür ve silinir.
- `suggest` komutu izin sistemine uyar; bu yüzden kanallarda ya da roller için normal izin komutlarıyla engellenebilir. Yazılan mesaj yolu da aynı kuralı uygular.
- Özel emojiler botun kullanabileceği emojiler olmalıdır. Komut her emojiyle tepki vererek test eder ve biri başarısız olursa seti reddeder.
- Kontrol panelindeki **Sil** yalnızca veritabanı kaydını siler. Discord mesajı ve varsa konu olduğu yerde kalır.
- `suggestclear` geri alınamaz ve numaralandırmayı 1'e sıfırlar.

---
title: Formlar
slug: forms
summary: Kontrol panelinde başvurular, anketler, ban itirazları ve katılım başvuruları oluştur, cevapları paylaşılabilir bir bağlantıyla topla ve Discord'dan ya da yanıt kuyruğundan onayla veya reddet.
icon: fa-clipboard
category: Community
dashboard: /dashboard/forms
module: Forms
tags: [forms, application, survey, questionnaire, ban appeal, join application, review, approve, reject, responses, csv, form, başvuru, anket, ban itirazı, katılım başvurusu, inceleme, onay, red, yanıtlar]
related: [administration, moderation, rolestates]
---

## Ne işe yarar

Yetkililer kontrol panelinde bir form oluşturur: bir ad, bir dizi soru ve kimin cevaplayabileceği ile sonrasında neler olacağına dair kurallar. Formu yayınlamak kalıcı bir paylaşım bağlantısı üretir. Bir üye bağlantıyı açar, Discord ile giriş yapar, soruları sayfa sayfa doldurur, cevaplarını gözden geçirir ve gönderir. Yazarken ilerlemesi taslak olarak kaydedilir, bu yüzden daha sonra geri dönebilir.

Her gönderim, seçtiğin kanalda bir embed olarak paylaşılır. Form bir karar gerektiriyorsa **Onayla** ve **Reddet** düğmeleriyle birlikte gelir. İnceleyiciler Discord'daki bir düğmeye basabilir ya da kontrol panelindeki **Yanıtlar** sekmesini kullanabilir. Gönderen, kararı ve varsa notları içeren bir DM alır ve istediği zaman bir durum sayfasından takip edebilir.

Formların üç türü vardır. Normal form üyeler içindir. Ban itirazı formu şu anda banlı olan kişiler içindir ve onaylanınca onların banı kaldırılır. Katılım başvurusu sunucu dışındaki kişiler içindir ve onaylanınca katıldıklarında kendilerini bekleyen rollerle birlikte tek kullanımlık bir davet gönderilir.

Formlar için komut yoktur. İki inceleme düğmesi dışında her şey kontrol panelinde yapılır.

## Neden kullanmalısın

- DM yığını yerine düzgün bir inceleme kuyruğuyla yetkili, ortak veya etkinlik başvuruları.
- Bekleme süreleri, deneme sınırları ve onaylanınca otomatik ban kaldırma ile bir ban itiraz süreci.
- Başvuranların davet almadan önce incelendiği kapalı bir topluluk.
- Yanıt sınırı ve CSV dışa aktarımı olan geri bildirim anketleri.

## Form türleri

| Tür | Kim gönderebilir | Onaylanınca |
| --- | --- | --- |
| Normal Form | Üyeler; **Sunucu dışındaki kişilere izin ver** açıksa herkes | Yalnızca ayarlandıysa rol değişiklikleri |
| Ban İtirazı | Şu anda sunucudan banlı olan kişiler | Ban kaldırılır |
| Katılım Başvurusu | Sunucuda olmayan kişiler | Bir davet oluşturulur ve **Katılınca bekleyen roller** bir rol durumu olarak kaydedilir, böylece kişi katıldığında uygulanır |

Tür, form oluşturulduktan sonra değiştirilemez. Ban itirazları ve katılım başvuruları her zaman incelemeden geçer; normal formlar yalnızca **Cevaplar onay gerektirir** açıksa incelenir.

## Sorular

Sorular oluşturucuda **Sorular** altına eklenir. Türler şunlardır:

| Tür | Cevap | Seçenekler |
| --- | --- | --- |
| Kısa Metin | Tek satır | En az ve en fazla uzunluk, 5000'e kadar |
| Uzun Metin | Birkaç satır | Aynı uzunluk sınırları |
| Çoktan Seçmeli | Listelenen seçeneklerden biri | 25 seçeneğe kadar |
| Onay Kutuları | Birkaç seçenek | 25 seçeneğe kadar; **Minimum değer** ve **Maksimum değer** kaç tanesinin işaretlenebileceğini sınırlar |
| Açılır Liste | Listeden tek bir seçenek | 25 seçeneğe kadar |
| Sayı | Bir sayı | En az ve en fazla değer |
| E-posta | Geçerli bir e-posta adresi | |
| URL | Bir `http` ya da `https` adresi | |
| Bölüm Ayracı | Yok; yeni bir sayfa başlatır ve bir başlık ile giriş metni taşıyabilir | |

Soru metni 500 karakterle, yer tutucular 200 karakterle, her cevap ise 4000 karakterle sınırlıdır. Her sorunun bir görsel URL'si olabilir ve zorunlu olarak işaretlenebilir. Bir soru, daha önceki bir cevap belirli bir koşulla eşleştiğinde de zorunlu olabilir.

### Cevap aktarımı

Bir soru için cevap aktarımını açıp soru metninde ya da yer tutucusunda `{{Q12}}` yaz; burada 12, daha önceki bir sorunun kimliğidir. Önceki cevap 100 karakterde kesilerek eklenir. O soru cevaplanmamışsa, bunun yerine soru metni köşeli parantez içinde görünür. Bir soru yalnızca kendisinin üstündeki sorulardan aktarım yapabilir.

### Koşullar

Her soru yalnızca bir koşul sağlandığında gösterilebilir. Gizli sorular sayfada atlanır ve onlar için gönderilen cevaplar sunucuda atılır.

| Koşul türü | Gösterilme durumu |
| --- | --- |
| Cevaba Dayalı | Önceki bir cevap eşleşir: **Eşittir**, **Eşit değildir**, **İçerir**, **Büyüktür** veya **Küçüktür** |
| Role Dayalı | Üye seçilen rollerden **Herhangi biri**, **Hepsi** ya da **Hiçbiri** rolüne sahiptir |
| Sunucudaki Süre | Üye sunucuda en az N gündür ya da hesabı en az N günlüktür |
| Takviye/Nitro | Üye sunucuya takviye yapıyor. Nitro kontrolü, avatar ve takviye verilerine dayalı bir tahmindir. |
| Yetkiye Dayalı | Üyenin seçilen yetkilerin tamamı vardır |
| Birden Fazla Koşul | Birkaç satır birleştirilir. Aynı gruptaki satırların hepsi doğru olmalıdır (VE); herhangi bir grup doğruysa soru gösterilir (VEYA). |

Metin karşılaştırmaları büyük-küçük harfe duyarsızdır. Büyüktür ve küçüktür sayıları karşılaştırır.

## Kimler gönderebilir

Form, kişileri bir neden belirterek şu sırayla geri çevirir: hâlâ taslaksa, yanıt kabul etmiyorsa, **Açılış saati**ne ulaşmadıysa, **Kapanış saati**ni geçtiyse, hesabı **Minimum Discord hesap yaşı** değerinden gençse, **Kabul edilecek toplam yanıt** sınırı dolduysa, kişi zaten cevap verdiyse ve birden fazla cevap kapalıysa, **Göndermek için gereken rol** yoksa ve son olarak yukarıdaki tür kuralı.

**Reddedilenlerin tekrar denemesine izin ver** açıksa, reddedilen bir yanıt artık "zaten cevaplandı" olarak sayılmaz. **Captcha iste** açıksa inceleme adımında bir Cloudflare Turnstile doğrulaması görünür.

Ban itirazları kendi sınırlarını **İtiraz sınırları** altında ekler: banlandıktan sonra beklenecek süre (ban kaydının denetim günlüğü girişinden ölçülür), en fazla itiraz sayısı, itirazlar arasındaki bekleme süresi ve **Bir red kesindir**. Bekleyen bir itiraz varsa yenisine izin verilmez.

## Formu doldurma

Herkese açık sayfa Discord girişi gerektirir. Cevaplar, son tuş vuruşundan yaklaşık bir buçuk saniye sonra ve bir sonraki sayfaya geçerken taslak olarak kaydedilir. 30 gün içinde geri dönmek taslağı, "Daha önce yazdıklarını geri getirdik" başlıklı bir bildirimle ve bir **Baştan başla** düğmesiyle geri yükler.

Bir ilerleme çubuğu cevaplanan soruları gösterir. Son sayfa **Gözden Geçir ve Devam Et** ile biter; bu, her cevabı bir **Düzenle** bağlantısıyla listeler, ardından **Onayla ve Gönder** gelir. Sonrasında sayfa **Gönderimden sonraki mesajını** (ya da türe göre varsayılanı) ve bir **Durumunu Kontrol Et** bağlantısını gösterir. Durum sayfası ayrıca `/forms/submissions` adresindeki **Gönderimlerim** sayfasına bağlanır; bu sayfa giriş yapmış kullanıcının sunucular genelinde yaptığı, anonim olmayan tüm yanıtları listeler.

Gönderenler, yanıt hâlâ beklemedeyken ve form anonim değilse ya da kapanmamışsa cevaplarını durum sayfasından düzenleyebilir. Önceki cevaplar revizyon olarak saklanır. Bir gönderenin yanıtını geri çekmesinin bir yolu yoktur.

## Gönderince neler olur

1. **Gönderince verilen roller** ve **İnceleme beklerken rol** verilir.
2. **Cevapların gönderileceği yer** ayarlıysa, oraya kullanıcıyı (ya da "Anonymous (login required)") ve zamanı gösteren, en fazla 20 cevap içeren bir embed gönderilir ve **Yanıt geldiğinde etiketle** rolü etiketlenir. Form incelendiğinde Onayla ve Reddet düğmeleri eklenir.
3. **Bir webhook'a gönder** ayarlıysa aynı embed o webhook'a düğmeler olmadan gönderilir. Yanıt daha sonra onaylanır ya da reddedilirse, sonucu, inceleyiciyi ve nedeni içeren ikinci bir mesaj da webhook'a gider. URL bir Discord webhook'u olmalıdır; başka her şey bot günlüğünde bir uyarıyla yok sayılır ve başarısız bir webhook gönderimi asla engellemez.
4. Yanıt **Yanıtlar** sekmesinde İnceleme Bekliyor durumuyla görünür.

Anonim formlar kullanıcı kimliği saklamaz; bu yüzden rolleri değiştiremez ve yanıtları düzenlenemez.

## İnceleme süreci

Yanıtlar İnceleme Bekliyor durumundan Onaylandı ya da Reddedildi durumuna geçer. **Kimler onaylayabilir veya reddedebilir** bir rolü belirtir; Sunucuyu Yönet ya da Yönetici yetkisi olan herkes her zaman karar verebilir. Bir inceleyici rolü ayarlanmamışsa, onay rollerine sahip olanlar da karar verebilir.

Discord'da **Onayla** hemen karar verir. **Reddet** bir neden soran bir pencere açar; bu neden zorunludur, çünkü gönderene iletilir. Her iki durumda da embed yeniden renklendirilir, inceleyici ve zamanla birlikte bir "Approved" ya da "Rejected" alanı ve varsa neden eklenir, düğmeleri kaldırılır. Kontrol panelinde aynı karar **Gönderen için notlar** kutusuyla kuyruktan verilir.

Bir karar verildiğinde bot şunları yapar:

- **Onaylanınca ekle**, **Onaylanınca kaldır**, **Reddedilince ekle** ve **Reddedilince kaldır** altındaki rolleri ekler ve kaldırır; bekleme rolünü her zaman kaldırır. İki tarafta da listelenen bir rol kaldırılır.
- Onaylanan ban itirazı için kullanıcının banını kaldırır ya da onaylanan katılım başvurusu için daveti oluşturur.
- Gönderene notlarla birlikte "Your response was approved" ya da "Your response was not accepted" yazan bir DM gönderir; onaylanırsa **Gönderimden sonraki mesaj**ını ve daveti de ekler. DM başarısız olursa embed ve kuyruk bunu belirtir.

İnceleme düğmelerinin emojileri önce formdan, sonra **Ayarlar** sekmesindeki **Sunucu varsayılanları**ndan, en son da düz bir onay işaretinden ve çarpıdan alınır.

## Sürümler

Formun her kaydı bir sürüm tutar; son 20 tanesine kadar. **Sürüm geçmişi**, her birini ayar ve soru farkıyla ve bir **Geri yükle** düğmesiyle gösterir. Geri yüklemek soruları yeni kimliklerle yeniden oluşturur ve koşulları ile aktarımları buna göre yeniden yazar.

## Ayarlar

**Formlar** sayfasında **Formlar**, **Oluştur** ve **Ayarlar** sekmeleri vardır; bir form seçildiğinde ayrıca **Düzenle** ve **Yanıtlar** sekmeleri eklenir. Oluştur ve Düzenle sekmeleri aynı ayar panelini paylaşır.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Ad | boş, zorunlu | Formun başlığı, 255 karakterle sınırlı |
| Açıklama | boş | Başlığın altında ve Discord bağlantı önizlemelerinde gösterilir |
| Cevapların gönderileceği yer | yok | Gönderim embed'inin kanalı; boş bırakılırsa cevaplar yalnızca kontrol panelinde kalır |
| Gönderimden sonraki mesaj | yok | Onay sayfasındaki ve onay DM'indeki metin |
| Taslak | yeni formlar için açık | Taslaklara gönderim yapılamaz |
| Yanıt kabul ediliyor | açık | Silmeden kapatmak için kapat |
| Göndermek için gereken rol | Sunucudaki herkes | Role göre kapıla |
| Minimum Discord hesap yaşı | Sınır yok | Gün |
| Sunucu dışındaki kişilere izin ver | kapalı | Yalnızca normal formlar |
| Anonim gönder | kapalı | Gönderen kaydetmez |
| Açılış saati, Kapanış saati | yok | Zaman aralığı; bir açılış duyurusu bir açılış saati gerektirir |
| Kabul edilecek toplam yanıt | Sınır yok | Herkes için toplam sınır |
| Kişi başına birden fazla cevaba izin ver | kapalı | |
| Reddedilenlerin tekrar denemesine izin ver | kapalı | |
| Captcha iste | kapalı | İnceleme adımında Turnstile |
| Açılışı şu kanalda duyur, Duyuruyla birlikte etiketle, Duyuru metni | yok | Kapanış geri sayımı içeren açılış embed'i; **Açılış saati**nden yaklaşık bir dakika içinde ya da yayınlandığında gönderilir |
| Yanıt geldiğinde etiketle | yok | Her gönderimle birlikte etiketlenen rol |
| Gönderince verilen roller | yok | Hemen verilir |
| İnceleme beklerken rol | yok | Karar verildiğinde kaldırılır |
| Bir webhook'a gönder | yok | Gönderim embed'lerini ve onay ya da red kararlarını da alan Discord webhook URL'si |
| Cevaplar onay gerektirir | kapalı | Normal forma inceleme ekler |
| Kimler onaylayabilir veya reddedebilir | Yalnızca Sunucuyu Yönet | İnceleyici rolü |
| Onayla düğmesi emojisi, Reddet düğmesi emojisi | sunucu varsayılanı | |
| Onaylanınca ekle/kaldır, Reddedilince ekle/kaldır | yok | Karar üzerine rol değişiklikleri |
| Bir red kesindir, Banlandıktan sonra bekle, İzin verilen itiraz sayısı, İtirazlar arasında bekle | kapalı, Bekleme yok, Sınırsız, Bekleme yok | Yalnızca ban itirazları |
| Davetin kullanılabileceği sayı, Davet şu süreden sonra sona erer (saniye), Katılınca bekleyen roller | 1, 86400, yok | Yalnızca katılım başvuruları |

Formun türüne uygulanmayan ayarlar kaydedilirken atılır.

## Kurulum adımları

1. Kontrol panelinde **Formlar**'ı aç ve **Oluştur**'a bas.
2. **Form türü**nü seç. Bu daha sonra değiştirilemez.
3. **Ad** ve **Açıklama**'yı doldur, **Cevapların gönderileceği yer**'i seç.
4. **Sorular** altında soruları ekle, zorunlu olanları işaretle ve uzun formları bölmek için **Sayfa ekle**'yi kullan.
5. Kimin gönderebileceğini belirle; bir inceleme adımı istiyorsan **Cevaplar onay gerektirir**'i aç ve **Kimler onaylayabilir veya reddedebilir**'i seç.
6. **Formu Kaydet**'e bas. Bir yönetici olarak adım adım gezmek için form kartındaki **Önizleme**'yi kullan.
7. Karttaki **Yayınla**'ya bas, ardından **Bağlantıyı Kopyala**'ya basıp bağlantıyı başvuranların göreceği yere paylaş.
8. **Yanıtlar** sekmesini ya da gönderim kanalını izle ve her yanıta karar ver.

## Komutlar

Formların metin ya da eğik çizgi komutları yoktur. Discord'daki tek etkileşim, her gönderim embed'indeki **Onayla** ve **Reddet** düğmeleridir.

## İpuçları ve dikkat edilecekler

- Botun Rolleri Yönet yetkisi olmalı ve rolü, bir formun verdiği ya da kaldırdığı her rolün üstünde olmalıdır. Botun üstündeki roller, yönetilen roller ve herkes rolü sessizce atlanır.
- Ban itirazları, "banlandıktan sonra bekle" kontrolü için Sunucu Kayıtlarını Görüntüle yetkisine ihtiyaç duyar. Banı kaldırmak için Üyeleri Yasakla, katılım başvurusu davetleri için ise herkese görünür bir kanalda Davet Oluştur gerekir.
- Gönderim embed'i en fazla 20 cevap gösterir; tam yanıt kontrol panelindedir.
- **Yanıtlar** sekmesindeki **CSV Dışa Aktar**, her soru için bir sütun içerir ve birden fazla seçimli cevaplar noktalı virgülle ayrılır.
- Yanıt filtresi ve sayfa URL'sinin parçasıdır, bu yüzden "yalnızca bekleyenler" görünümünü yer imine ekleyip inceleyicilerle paylaşabilirsin.
- Taslaklar asla doğrulanmaz, bu yüzden geri yüklenen bir taslak gönderim sırasında yine de doğrulamadan geçemeyebilir.
- Süresi dolan formlar her dakika çalışan bir kontrolle kapatılır; uygunluk gönderim sırasında da kontrol edilir, bu yüzden aradaki bir boşluktan hiçbir şey kaçmaz.

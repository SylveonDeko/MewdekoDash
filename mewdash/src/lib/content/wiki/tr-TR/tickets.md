---
title: Biletler
slug: tickets
summary: Düğmeli ve seçim menülü destek bileti panelleri; özel kanallar açar, ayrıca üstlenme, öncelikler, etiketler, vakalar, dökümler ve yetkili araçları sunar.
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, modmail, bilet, destek, yardım masası, bilet paneli, döküm, vaka, üstlen, öncelik, kara liste]
related: [administration, chat-triggers, auditlog]
---

## Ne işe yarar

Biletler bir kanalı yardım masasına dönüştürür. Bir panel gönderirsin; bu, bir embed ve bir ya da daha fazla düğme veya seçim menüsü içeren bir mesajdır. Bir üye düğmeye tıkladığında ya da bir seçenek seçtiğinde bot onun için özel bir metin kanalı oluşturur, izinleri ayarlar ki yalnızca o kişi ve destek rolleri görebilsin, ve **Üstlen** ile **Kapat** düğmeleri olan bir açılış mesajı gönderir.

Üye tarafında: tıklar, istersen kısa bir formu doldurur ve `ticket-username-1` gibi adlandırılmış bir kanal belirir. Sorununu orada anlatır. Bilet kapatıldığında kanal `closed-...` olarak yeniden adlandırılır, kilitlenir ve bilet türünü nasıl ayarladığına bağlı olarak ya bir arşiv kategorisine taşınır ya da bir süre sonra silinir.

Yetkili tarafında: bileti üstlenirsin ki herkes kimin ilgilendiğini bilsin, bir öncelik belirlersin, etiket eklersin, not bırakırsın, ilgili biletleri bir vakaya bağlarsın ve bileti kapatırsın. Her kapatma, dökümü bir kanala ve kontrol paneline kaydedebilir. Kontrol paneli ayrıca yanıt ve çözüm sürelerini, önceliğe göre biletleri ve yetkili bazında görünümü gösterir.

Her düğme ve her seçim seçeneği, kendi kategorisi, rolleri, limitleri, formu, açılış mesajı ve kapanış davranışı olan ayrı bir bilet türüdür.

## Neden kullanmalısın

- Bir destek sunucusu, genel bir yardım kanalı yerine özel birebir kanallar istiyor.
- Birden fazla ekibin var (faturalama, moderasyon, ortaklıklar) ve doğru ekibe yönlendiren bir seçim menüsü istiyorsun.
- Moderatör başvurularını genel destekten ayrı, bir formla almak istiyorsun.
- Bir denetim izi istiyorsun: dökümler, yetkili notları ve ilgili raporları bir araya getiren vakalar.
- Belirli üyelerin hiç bilet açmasını engellemek istiyorsun.

## Paneller, düğmeler ve seçim menüleri

Bir panel, tek bir kanalda tek bir mesajdır. Panel kimliği, o mesajın kimliğidir. Bir panelde düğmeler, seçim menüleri ya da ikisi birden olabilir.

- **Düğmeler**: düğme başına bir bilet türü. Her birinin bir etiketi, isteğe bağlı bir emojisi ve bir stili vardır (Primary, Secondary, Success veya Danger).
- **Seçim menüleri**: bir yer tutucusu ve bir seçenek listesi olan tek bir menü. Her seçenek, bir etiketi, açıklaması ve emojisi olan bir bilet türüdür. Bir menüde en az bir seçenek kalmalıdır.

Panel mesajı silinirse `checkpanels` eksik panelleri listeler; `recreatepanel` veya `recreateallpanels` bunları yeniden gönderir ve saklanan mesaj kimliğini günceller. Bot ayrıca panel mesajlarının silinmelerini de izler.

`ticketduplicatepanel` bir paneli ve tüm bileşenlerini başka bir kanala kopyalar. `ticketmovepanel` taşır. `ticketupdatepanel` embed'i yeni embed JSON'uyla değiştirir.

### Bilet türü ayarları

Bunlar her düğmede ve her seçim seçeneğinde bulunur. Kontrol panelinde bir düğme ya da seçenek eklediğinde ya da düzenlediğinde görünürler.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Kanal adı biçimi | `ticket-{username}-{id}` | Oluşturulan kanalın adı; `{id}` üyenin bilet numarasıdır, en fazla 100 karakter |
| Destek Talebi Kategorisi | yok | Kanalın oluşturulduğu kategori |
| Arşiv kategorisi | yok | Kanal kapatıldığında veya arşivlendiğinde taşındığı kategori |
| Destek Rolleri | yok | Bileti görebilen, bileti üzerinde konuşabilen ve üstlenebilen roller |
| Görüntüleyici rolleri | yok | Okuyabilen ama mesaj gönderemeyen roller |
| En fazla aktif bilet | 1 | Bir üyenin bu türde aynı anda sahip olabileceği açık bilet sayısı |
| Otomatik kapanma (saat) | yok | Tür bazında saklanır ve `buttoninfo` içinde gösterilir |
| Gerekli yanıt süresi (dakika) | yok | Tür bazında saklanır ve `buttoninfo` içinde gösterilir |
| İzin verilen öncelikler | tümü | Yetkililerin bu türde ayarlayabileceği öncelikler |
| Varsayılan öncelik | yok | Yeni bir biletin başlangıç önceliği |
| Dökümü kaydet | kapalı | Bilet kapandığında bir döküm oluşturur |
| Kapanınca kilitle | açık | Destek rolleri dışındaki herkes için mesaj göndermeyi kapatır |
| Kapanınca yeniden adlandır | açık | Kanal adının başına `closed-` ekler |
| Oluşturanı kaldır | açık | Kapatıldığında açanın erişimini kaldırır |
| Kapanınca sil | kapalı | Kanalı tutmak yerine gecikmeden sonra siler |
| Silme gecikmesi | 5 dakika | Kapanınca sil açıkken silmeden önceki bekleme; kontrol panelindeki alan saniye ister, `ticketclosebehavior` dakika ister |
| Kapanınca otomatik arşivle | kapalı | Bileti kapatmanın bir parçası olarak arşivler |
| Arşivlenince kilitle | açık | Arşivlendiğinde kanalı salt okunur yapar |
| Arşivlenince yeniden adlandır | açık | Kanal adının başına `archived-` ekler |
| Oluşturanı kaldır (arşiv) | kapalı | Arşivlendiğinde açanın erişimini kaldırır |
| Modal | yok | Bilet oluşturulmadan önce gösterilen bir form |
| Açılış mesajı | varsayılan embed | Yer tutucularla özel açılış mesajı |

### Formlar (modal)

Bir bilet türü, kanalı oluşturmadan önce sorular sorabilir. `setmodaltitle` ile bir başlık belirle (varsayılan "Create Ticket") ve `addmodalfield` ile alanlar ekle. Bir alan varsayılan olarak kısa ve zorunludur; etiketten sonraki seçenekler bunu değiştirir: çok satırlı için `paragraph`, isteğe bağlı için `optional`, 4000'e kadar uzunluk sınırları için `min:X` veya `max:X`. Alan kimliği, etiketin küçük harfe çevrilmiş ve boşlukların alt çizgiye dönüştürülmüş halidir.

Cevaplar bilete kaydedilir ve açılış mesajında `%modal.<fieldId>%` olarak kullanılabilir.

### Açılış mesajı

Varsayılan olarak bot, üyeyi karşılayan, bilet kimliğini ve oluşturulma zamanını gösteren ve sorunu anlatmasını isteyen "Support Ticket" başlıklı bir embed gönderir. Üzerinde Claim ve Close düğmeleri bulunur.

Bunu bilet türü bazında kendi metninle ya da embed'inle değiştirebilirsin. Kontrol panelindeki embed oluşturucuyu kullan (**Bilet açılış mesajını yapılandır**). Burada kullanılabilen yer tutucular:

| Yer tutucu | Değer |
| --- | --- |
| `%ticket.id%` | Bilet numarası |
| `%ticket.channel%` | Bilet kanalına etiket |
| `%ticket.user%` | Açanın kullanıcı adı |
| `%ticket.user.mention%` | Açana etiket |
| `%ticket.user.avatar%` | Açanın avatar URL'si |
| `%ticket.user.id%` | Açanın kullanıcı kimliği |
| `%ticket.created%` | Biletin oluşturulma zamanı |
| `%modal.<fieldId>%` | Bir form alanının cevabı |

Genel yer tutucu seti bu mesaja uygulanmaz; yalnızca yukarıdakiler uygulanır.

## Bir bilet açıldığında ne olur

1. Kara listedeki üyeler gizli bir mesajla reddedilir.
2. Üyenin bu türdeki açık biletleri **En fazla aktif bilet** (varsayılan 1) sayısına göre sayılır.
3. Kanal bilet kategorisinde oluşturulur; `@everyone` engellenir, açan görüntüleme, mesaj gönderme, geçmişi okuma, dosya ekleme ve bağlantı yerleştirme izni alır, destek rollerine aynısı ve ayrıca Mesajları Yönet verilir, görüntüleyici rollerine ise yalnızca okuma izni verilir.
4. Açılış mesajı, Claim ve Close düğmeleriyle gönderilir.
5. Bir günlük kanalı ayarlıysa oraya "new ticket" girişi yazılır.
6. **Bilet açıldı** olayı sohbet tetikleyicilerine yayınlanır.

## Üstlenme, notlar, öncelikler ve etiketler

**Üstlen**: destek rolündeki bir üye ya da bir yönetici, düğmeyle ya da `ticketclaim` ile bileti üstlenir. Kanala "claimed by" embed'i eklenir. Üstlenimi yalnızca üstlenen kişi ya da bir yönetici bırakabilir. Kapatılmış ya da zaten üstlenilmiş bir bilet üstlenilemez.

**Notlar**: `ticketnote` mevcut bilete bir yetkili notu ekler. Not bilette saklanır, kontrol panelinde gösterilir ve bilet kanalında, altbilgisinde yazarı olan mavi bir "note added" embed'i olarak paylaşılır.

**Öncelikler** `ticketaddpriority` ile ya da **Yapılandırma** sekmesinde oluşturulan, sunucu genelinde tanımlardır. Her birinin bir kimliği, görünen bir adı, bir emojisi, 1 ile 5 arasında bir seviyesi, bir rengi, bir yanıt süresi ve bir **Yetkilileri bilgilendir** bayrağı vardır. Bir biletin önceliğini ayarlamak, o renkte bir embed gönderir ve bayrak açıksa destek rollerini etiketler. Bir bilet türü hangi önceliklerin kullanılabileceğini kısıtlayabilir.

**Etiketler** kimliği, adı, açıklaması ve rengi olan, sunucu genelinde kullanılan etiketlerdir. Bir bilete `ticketaddtags` ve `ticketremovetags` ile etiket kimliklerini kullanarak ekleyebilir ya da kaldırabilirsin. Kontrol paneli her biletin etiketlerini gösterir ve etikete göre arama yapmanı sağlar.

## Kapatma, arşivleme ve dökümler

Kapatma, bileti kapalı olarak işaretler ve kırmızı bir "ticket closed" embed'i gönderir. Sonra sırasıyla:

1. Bu tür için **Dökümü kaydet** açıksa ve bir döküm kanalı ayarlıysa, son 5000 mesaj kaydedilir ve döküm kanalına **"View Transcript"** bağlantısı olan bir embed gönderilir. Bağlantı dökümü kontrol panelinde açar.
2. Bu tür için otomatik arşivleme açıksa ya da `ticketclose true` ile kapattıysan bilet arşivlenir (aşağıya bak).
3. Aksi halde kapatma davranışları çalışır: `closed-...` olarak yeniden adlandır, açanı kaldır, destek rollerini koruyarak kanalı kilitle, sonra ya arşiv kategorisine taşı ya da **Kapanınca sil** açıksa kanalda uyar ve silme gecikmesinden sonra silinmek üzere planla. Planlanan silmeler dakikada bir işlenir.

Arşivleme kanalı `archived-...` olarak yeniden adlandırır, arşiv kategorisine taşır, herkes için salt okunur yapar ve bileti arşivlenmiş olarak işaretler. `ticketarchive` açık bir bilette bunu doğrudan yapar. Kanal artık yoksa bilet sadece arşivlenmiş olarak işaretlenir.

Kapatma, sohbet tetikleyicilerine **Bilet kapatıldı** olayını yayınlar.

> [!NOTE]
> Bir döküm yalnızca hem bilet türünde **Dökümü kaydet** açık olduğunda hem de sunucuda bir döküm kanalı olduğunda oluşturulur. Döküm kanalı yoksa kapatma yine başarılı olur ama hiçbir şey kaydedilmez.

## Vakalar

Bir vaka, birlikte ait olan biletleri gruplar; örneğin aynı kişi hakkındaki birkaç rapor. `ticketcreatecase <title> <description>` ile ya da **Vakalar** sekmesinden oluşturabilir, ardından mevcut bileti `ticketlinkcase <caseId>` ile bağlayabilir ve `ticketunlinkcase` ile bağlantıyı kaldırabilirsin. Vakaların kendi notları vardır, kapatılıp yeniden açılabilir ve kontrol panelinden ya da `/tickets cases` eğik çizgi komutlarından düzenlenebilir.

## Kara liste

`ticketblock @user [reason]` bir üyenin bilet açmasını engeller. Bir günlük kanalı ayarlıysa sebep oraya yazılır. `ticketunblock` engeli kaldırır. Kontrol panelindeki **Gelişmiş** sekmesinde bir kullanıcı kimliği alan aynı **Kara liste yönetimi** bölümü bulunur.

## Toplu araçlar

- `ticketcloseinactive <hours>` belirtilen saat boyunca etkinliği olmayan her açık bileti kapatır; her birine bir "auto closed" embed'i gönderir ve bilet türünün bir arşiv kategorisi varsa arşivler. **Gelişmiş** sekmesindeki **Etkin olmayan biletleri kapat** aynısını yapar.
- `ticketmoveall <source category> <target category>` tüm bilet kanallarını kategoriler arasında taşır.

## İstatistikler

`ticketstats` toplamları, açık ve kapalı sayılarını, dakika cinsinden ortalama yanıt süresini, saat cinsinden ortalama çözüm süresini ve tür ve önceliğe göre dökümleri gösterir. `ticketuserstats [@user]` aynı bilgiyi tek bir üye için ve son biletlerini gösterir. **Genel Bakış** sekmesi yanıt sürelerini, önceliğe göre biletleri ve yetkili performansını gösterir.

## Ayarlar

Biletler sayfasında altı sekme vardır: **Genel Bakış**, **Biletler**, **Bilet panelleri**, **Yapılandırma**, **Vakalar** ve **Gelişmiş**.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Döküm kanalı | yok | Bağlantılı döküm özetlerinin gönderildiği yer (Yapılandırma) |
| Günlük kanalı | yok | Bilet oluşturma ve kara liste kayıtlarının tutulduğu yer (Yapılandırma) |
| Öncelikler | yok | Sunucu genelindeki öncelik tanımları (Yapılandırma) |
| Etiketler | yok | Sunucu genelindeki etiket tanımları (Yapılandırma) |
| Panel embed'i | başlık "Support Tickets" | Panel mesajı, embed düzenleyicisinde oluşturulur (Bilet panelleri) |
| Tür bazında ayarlar | yukarıdaki tabloya bak | Her düğme ya da seçim seçeneğinde ayarlanır (Bilet panelleri) |
| Kara liste | boş | Bilet açamayan üyeler (Gelişmiş) |

**Biletler** sekmesi açık ve kapalı biletleri listeler; bilet, kullanıcı, kanal ya da etikete göre arama yapılabilir. Buradan yetkililer üstlenebilir, üstlenimi bırakabilir, öncelik ayarlayabilir, etiket ekleyip kaldırabilir, yetkili notu ekleyebilir, isteğe bağlı bir sebeple kapatabilir, arşivleyebilir ve dökümü açabilir.

> [!PERMISSION]
> Bot, bilet kanallarını oluşturabilmek ve kimlerin görebileceğini ayarlayabilmek için Kanalları Yönet ve Rolleri Yönet iznine ihtiyaç duyar. Rolü, bilet ve arşiv kategorilerini görebilmelidir.

## Kurulum adımları

1. Açık biletler için bir kategori, istersen kapalılar için de bir kategori oluştur. Yalnızca yetkililerin görebildiği bir döküm kanalı ve bir günlük kanalı oluştur.
2. Kontrol panelinde **Biletler**'i aç, **Yapılandırma** sekmesine geç ve **Döküm kanalı** ile **Günlük kanalı**'nı ayarla.
3. Hâlâ **Yapılandırma** sekmesindeyken en az bir öncelik oluştur (örneğin `urgent`, seviye 5, Yetkilileri bilgilendir açık) ve istediğin etiketleri ekle.
4. **Bilet panelleri** sekmesine git, **Yeni panel oluştur**'a tıkla. Kanalı seç ve **Panel embed'i**'ni tasarla.
5. Paneli seç ve bir **Yeni Düğme** ekle. Etiketi, stili, **Destek Talebi Kategorisi**'ni, **Arşiv kategorisi**'ni, **Destek Rolleri**'ni ayarla ve **Dökümü kaydet**'i aç. Kapalı kanalları arşiv kategorisinde tutmak mı yoksa bir gecikmeyle **Kapanınca sil** kullanmak mı istediğine karar ver.
6. İstersen form alanları eklemek için modal oluşturucuyu, karşılama mesajını özelleştirmek için açılış mesajı düzenleyicisini aç.
7. Tek bir açılır menüde birden fazla bilet türü istiyorsan bunun yerine bir **Yeni seçim menüsü** ekle ve her tür için aynı ayarlarla bir seçenek ekle.
8. Başka bir hesaptan bir test bileti aç, üstlen, öncelik ayarla, kapat ve döküm kanalını kontrol et.

Discord'da `/tickets setup wizard #channel` aynı adımları şablonlarla (Basic Support, Department Support, Gaming Server, Business, Mod Applications) yönlendirir.

## Komutlar

Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Panel kimlikleri mesaj kimlikleridir; düğme, menü ve seçenek kimlikleri `panelinfo` ya da `ticketlistpanel` ile alınır.

| Komut | Diğer adlar | Gereken yetki | Amaç |
| --- | --- | --- | --- |
| `ticketpanel <#channel> [embedJson]` | `tpanel` | Yönetici | Önizleme ya da oluşturma isteğiyle bir panel oluşturur |
| `ticketpaneldelete <panelId> [force]` | `tpaneldelete` | Yönetici | Bir paneli siler; `true` bağlı biletler olsa bile zorla siler |
| `ticketupdatepanel <panelId> <embedJson>` | `tupdatepanel` | Yönetici | Panel embed'ini değiştirir |
| `ticketmovepanel <panelId> <#channel>` | `tmovepanel` | Yönetici | Bir paneli başka bir kanala taşır |
| `ticketduplicatepanel <panelId> <#channel>` | `tduplicatepanel` | Yönetici | Bir paneli ve bileşenlerini kopyalar |
| `panellist` | `plist` | Yönetici | Panelleri bileşen sayılarıyla listeler |
| `panelinfo <panelId>` | `pinfo` | Yönetici | Bir panelin düğmelerini ve menülerini kimlikleriyle gösterir |
| `ticketlistpanels` | `tlistpanels` | Kanalları Yönet | Her paneli ayrıntılı ve sayfalı listeler |
| `ticketlistpanel <panelId>` | `tlistpanel` | Kanalları Yönet | Bir panelin her bileşenini ayarlarıyla gösterir |
| `checkpanels` | `tcheckpanels` | Yönetici | Mesajı ya da kanalı eksik panelleri bildirir |
| `recreatepanel <panelId>` | `trecreate` | Yönetici | Eksik bir paneli yeniden gönderir |
| `recreateallpanels` | `trecreateall` | Yönetici | Eksik tüm panelleri yeniden gönderir |
| `setpaneltranscripts <panelId> <true or false>` | `sptranscripts` | Yönetici | Bir paneldeki tüm düğmeler için dökümü açar/kapatır |
| `ticketaddbutton <panelId> <label> [style] [emoji]` | `taddbtn` | Yönetici | Bir düğme ekler |
| `buttoninfo <buttonId>` | `binfo` | Yönetici | Bir düğmenin ayarlarını gösterir |
| `deletebutton <buttonId>` | `delbtn` | Yönetici | Bir düğmeyi kaldırır |
| `ticketcategory <buttonId> [category]` | `tcat` | Yönetici | Bilet kategorisini ayarlar ya da temizler |
| `ticketarchivecategory <buttonId> [category]` | `tarchivecat` | Yönetici | Arşiv kategorisini ayarlar ya da temizler |
| `ticketautoarchive <buttonId> [true or false]` | `tautoarchive` | Yönetici | Kapatıldığında otomatik arşivler |
| `ticketclosebehavior <buttonId> [autoArchive] [deleteOnClose] [lockOnClose] [renameOnClose] [deleteDelayMinutes]` | `tclosebehavior` | Yönetici | Birkaç kapatma davranışını birden ayarlar |
| `ticketautoclose <buttonId> [hours]` | `tautoclose` | Yönetici | Otomatik kapanma saatini ayarlar ya da temizler |
| `setautoclose <buttonId> <hours>` | `sautoclose` | Yönetici | Yukarıdakiyle aynı |
| `ticketresponsetime <buttonId> [minutes]` | `tresponsetime` | Yönetici | Gerekli yanıt süresini ayarlar ya da temizler |
| `setresponsetime <buttonId> <minutes>` | `sresponsetime` | Yönetici | Yukarıdakiyle aynı |
| `setmodaltitle <buttonId> <title>` | `smodaltitle` | Yönetici | Bilet formunun başlığı |
| `addmodalfield <buttonId> <label> [options]` | `addmfield` | Yönetici | Bir form alanı ekler; seçenekler `paragraph,optional,max:500` gibi |
| `removemodalfield <buttonId> <fieldId>` | `removemfield` | Yönetici | Bir form alanını kaldırır |
| `listmodalfields <buttonId>` | `listmfields` | Yönetici | Form alanlarını listeler |
| `addselectmenu <panelId>` | `addsmenu` | Yönetici | Yönlendirmeli bir istemle seçim menüsü ekler |
| `addoption <menuId> <label> [description] [emoji]` | `addopt` | Yönetici | Bir menüye seçenek ekler |
| `listoptions <menuId>` | `listopts` | Yönetici | Bir menünün seçeneklerini listeler |
| `removeoption <menuId> <value>` | `removeopt` | Yönetici | Değeriyle bir seçeneği onaylar (bkz. dikkat edilecekler) |
| `deleteselectoption <optionId>` | `delselectoption` | Yönetici | Bir seçeneği kaldırır; son seçenek kaldırılamaz |
| `setplaceholder <menuId> <text>` | `splaceholder` | Yönetici | Menünün yer tutucusunu değiştirir |
| `deleteselectmenu <menuId>` | `delselectmenu` | Yönetici | Bir menüyü ve seçeneklerini kaldırır |
| `ticketclaim` | `tclaim` | Kimse | Mevcut bileti üstlenir (destek rolü ya da yönetici) |
| `ticketunclaim` | `tunclaim` | Kimse | Üstlenimini bırakır (üstlenen ya da yönetici) |
| `ticketclose [archive]` | `tclose` | Kimse | Mevcut bileti kapatır; `true` ayrıca arşivler |
| `ticketarchive` | `tarchive` | Kanalları Yönet | Mevcut bileti arşivler |
| `ticketnote <text>` | `tnote` | Kimse | Bir yetkili notu ekler |
| `ticketpriority <priorityId>` | `tpriority` | Kimse | Mevcut biletin önceliğini ayarlar |
| `ticketaddtags <tagId...>` | `taddtags` | Kimse | Mevcut bilete etiket ekler |
| `ticketremovetags <tagId...>` | `tremovetags` | Kimse | Mevcut biletten etiket kaldırır |
| `ticketaddpriority <id> <name> <emoji> <level> <pingStaff> <responseTime> <color>` | `taddpriority` | Yönetici | Bir öncelik tanımlar, örneğin `taddpriority urgent Urgent :fire: 5 true 00:15:00 red` |
| `ticketremovepriority <id>` | `tremovepriority` | Yönetici | Bir öncelik tanımını siler |
| `ticketaddtag <id> <name> <description> <color>` | `taddtag` | Yönetici | Bir etiket tanımlar |
| `ticketremovetag <id>` | `tremovetag` | Yönetici | Bir etiket tanımını siler |
| `ticketcreatecase <title> <description>` | `tcreatecase` | Mesajları Yönet | Bir vaka oluşturur |
| `ticketlinkcase <caseId>` | `tlinkcase` | Mesajları Yönet | Mevcut bileti bir vakaya bağlar |
| `ticketunlinkcase` | `tunlinkcase` | Mesajları Yönet | Mevcut bileti vakadan ayırır |
| `ticketblock @user [reason]` | `tblock` | Yönetici | Bir üyeyi kara listeye alır |
| `ticketunblock @user` | `tunblock` | Yönetici | Kara listeden çıkarır |
| `tickettranscriptchannel [#channel]` | `ttranscriptch` | Yönetici | Döküm kanalını ayarlar ya da temizler |
| `ticketlogchannel [#channel]` | `tlogch` | Yönetici | Günlük kanalını ayarlar ya da temizler |
| `ticketcloseinactive <hours>` | `tcloseinactive` | Yönetici | O süre boyunca hareketsiz kalan biletleri kapatır |
| `ticketmoveall <category> <category>` | `tmoveall` | Yönetici | Tüm biletleri kategoriler arasında taşır |
| `ticketstats` | `tstats` | Kimse | Sunucunun bilet istatistikleri |
| `ticketuserstats [@user]` | `tuserstats` | Kimse | Bir üyenin bilet istatistikleri |

Eğik çizgi komutları `/tickets` altında (bilet oluştur, panelleri listele, üstlen, kapat, not, arşivle, öncelik, panel ve ayar grupları, vakalar grubu) ve `/tickets setup` altında (wizard, quick-button, quick-menu, from-template, templates) bulunur.

## İpuçları ve dikkat edilecekler

- "Mevcut bilet" üzerinde çalışan komutlar yalnızca bir bilet kanalının içinde çalışır. Bilet içinde çalıştır, yetkili kanalında değil.
- Her bilet türünün destek rolleri olmalı; aksi halde yalnızca yöneticiler üstlenebilir ve kanal kilitlendikten sonra açandan başka kimse konuşamaz.
- Varsayılan limit, üye başına tür başına bir açık bilettir. Tekrarlayan biletlerin normal olduğu türler için **En fazla aktif bilet** değerini yükselt.
- **Otomatik kapanma (saat)** ve **Gerekli yanıt süresi** bilet türünde saklanır ve `buttoninfo` içinde gösterilir, ancak botta hareketsiz biletleri kapatan tek şey `ticketcloseinactive` ya da **Etkin olmayan biletleri kapat** toplu işlemidir. Otomatik temizlik istiyorsan bunu kendin bir zamanlamaya bağla.
- `removeoption` şu an yalnızca başarı bildirir; seçeneği gerçekten kaldırmak için seçeneğin kimliğiyle `deleteselectoption` kullan.
- **Kapanınca sil** ve **Kapanınca kilitle** birbiriyle etkileşir: silinmek üzere ayarlanmış bir bilet önce kilitlenmez, sadece silme gecikmesini bekler.
- Panel embed JSON'u geçerli bir embed oluşturucu çıktısı olmalıdır. Komutları tercih edersen kontrol paneli düzenleyicisini kullan ve JSON'u kopyala.
- Açık bileti olan bir panelin silinmesi, `true` vermediğin sürece reddedilir; bu seçenek biletlerin panele olan bağlantısını temizler.
- Dökümler en fazla 5000 mesajı yakalar ve **"View Transcript"** bağlantısı dökümü kontrol panelinde açar.

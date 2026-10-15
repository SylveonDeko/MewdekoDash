---
title: Patreon
slug: patreon
summary: Bir Patreon kampanyasını bağla, destekçilere seviyelerine uyan Discord rolleri ver ve canlı destekçi ve gelir sayılarıyla aylık bir teşekkür mesajı paylaş.
icon: fa-heart
category: Community
dashboard: /dashboard/patreon
module: Patreon
tags: [patreon, supporters, patrons, donations, premium, tier roles, role sync, announcement, oauth, destekçiler, bağışçılar, bağış, seviye rolleri, rol senkronizasyonu, duyuru]
related: [administration, utility]
---

## Ne işe yarar

Bir Patreon kampanyası yöneten bir sunucu sahibi, kampanya hesabıyla giriş yaparak kampanyayı bota bağlar. Bu andan itibaren bot kampanyanın seviyelerini ve destekçilerini çeker, bunları senkronize tutar ve her destekçinin ne kadar bağış yaptığına göre Discord rolleri verebilir. Patreon bir destekçinin Discord hesabını biliyorsa bağlantı otomatik olur; değilse yetkililer bir üyeyi elle bir Patreon kullanıcısıyla eşleştirebilir.

Bot, seçtiğin bir günde ayda bir kez destekçilere teşekkür eden bir duyuruyu bir kanala gönderebilir. Mesaj düz metin ya da bir embed olabilir ve aktif destekçi sayısı, aylık gelir ve bu ay kaç kişinin katıldığı gibi canlı rakamları içerebilir. Ayrıca son bir hafta içinde destekçi olan herkes için bir teşekkür gönderen bir tanıma komutu da vardır.

Kontrol paneli tüm akışı yönetir: bağlanma, destekçileri ve seviyeleri görme, seviyeleri rollere eşleştirme ve duyuru ayarlarını düzenleme. Komutlar aynı alanı sohbette kapsar; buna ek olarak istatistikler ve liderlik tabloları da vardır.

## Neden kullanırsın

- Destekçiler, yetkililerin Patreon'u elle kontrol etmesine gerek kalmadan renkli bir role ve yalnızca destekçilere özel kanallara erişim almalı.
- Biri seviye yükseltince, düşürünce ya da bağışı durdurunca seviye rolleri otomatik değişmeli.
- "Bizi 40 destekçimize teşekkür ederiz" gibi, sayıları elle düzenlemeden doğru kalan düzenli bir paylaşım istersin.
- Yetkililer Discord içinden kimin desteklediğini ve hangi seviyede olduğunu hızlıca görmek ister.

## Kampanya bağlama

Bağlama, Patreon'un OAuth akışını kullanır. Kontrol panelindeki **Patreon'unu Bağla** kartı ya da yalnızca bot sahibinin kullanabildiği `patreonsync` komutu bir "Patreon ile yetkilendir" bağlantısı üretir. Kampanyanın sahibi olan hesapla giriş yap, istenen erişimi onayla; Patreon seni kontrol panelindeki Patreon sayfasına geri gönderir. Bot kodu tokenlara çevirir, bulduğu ilk kampanyayı kaydeder ve hemen seviyelerin ve destekçilerin tam bir senkronizasyonunu çalıştırır.

Kullandığın hesabın bir kampanyası olmalı. Yoksa geri çağrı "No Patreon campaigns found for this user" hatasıyla başarısız olur.

Kontrol panelinin **Genel Bakış** sekmesi bağlantı durumunu **Kampanya Kimliği**, **Son Senkronizasyon** ve **Token Sona Erme** bilgileriyle, ayrıca aktif **Destekçiler**, aylık **Gelir** ve **Kampanya Sahibi** özet kartlarıyla gösterir. Tokenlar süresi dolunca otomatik yenilenir; aynı sekmedeki **Hızlı İşlemler** şunlardır: **Tüm Verileri Senkronize Et**, **Rolleri Senkronize Et**, **Duyuru Gönder** ve **Yeniden giriş yap**. Yeniden giriş yapmak kampanyanın bağlantısını keser: tokenları temizler, ama yeniden bağlanabilmen için kanal, mesaj ve eşleştirme ayarlarını korur. Sayfa başlığında ayrıca **Verileri Yenile** ve **Destekçileri Senkronize Et** düğmeleri vardır.

> [!NOTE]
> Patreon entegrasyonunu botu barındıran kişinin etkinleştirmesi gerekir. Botta Patreon istemci kimliği yapılandırılmamışsa bağlan düğmesi ve `patreonsync` entegrasyonun yapılandırılmadığını bildirir.

## Destekçiler ve senkronizasyon

Bir senkronizasyon, kampanyadaki her üyeyi bağış tutarı, durumu ve destekçi Patreon'da Discord hesabını bağladıysa Discord kullanıcı kimliğiyle birlikte çeker. Aktif destekçiler, Patreon'un aktif olarak raporladığı ya da güncel bir bağışı olan kişilerdir. **Destekçiler** sekmesi bunları **Ad** (Patreon sağlıyorsa e-posta ile birlikte), **Bağış**, **Katıldı** ve **Durum** ile listeler; sayfanın üstündeki **Destekçileri Senkronize Et** düğmesi listeyi yeniler.

`patreonsupporters` sohbette en fazla 15 aktif destekçiyi bağışları ve Discord bahsetmeleriyle gösterir; `patreontop [count]` en yüksek bağışa göre ilk 1 ila 20 kişiyi sıralar; `patreonstats` destekçi sayısını, bağlı sayısını, toplam ve ortalama geliri ve seviye sayısını özetler; `patreonanalytics` buna eski destekçileri, ömür boyu geliri, bu ay yeni katılan destekçileri ve seviye dağılımını ekler.

Bir destekçinin Discord hesabı Patreon tarafında bağlı değilse, onu `patreonlink @member <patreonUserId>` ile elle bağla. Patreon kullanıcı kimliği, destekçinin Patreon hesabının sayısal kimliğidir; kontrol panelindeki destekçi listesi bunu göstermez.

## Seviyeden role eşleştirme

Her Patreon seviyesi bir Discord rolüne eşleştirilebilir. **Seviye Eşleştirme** sekmesinde bir **Patreon Seviyesi** ve bir **Discord Rolü** seçip kaydet. **Kullanılabilir Seviyeler** listesi yayımlanmış her seviyeyi fiyatı ve eşleştirilip eşleştirilmediği ile gösterir. Sohbette `patreontiermap <tierId> @role` aynı işi yapar; seviye kimliklerini `patreonroles` ile alabilirsin.

Rol senkronizasyonu, `patreonrolesync` ya da **Rol Senkronizasyonunu Etkinleştir** kutucuğuyla açılana kadar kapalıdır. Açıkken bot bir destekçinin hangi role sahip olması gerektiğini hesaplar: bağışının tutarına eşit ya da altında kalan, eşleştirilmiş en yüksek fiyatlı seviye. Destekçinin sahip olduğu diğer eşleştirilmiş Patreon rolleri kaldırılır ve hedef rol eklenir. Bağışını durduran bir destekçi tüm eşleştirilmiş rollerini kaybeder.

Senkronizasyon bir üye bağlandığında ve `patreonsyncall` ya da kontrol panelindeki rolleri senkronize etme işlemi çalıştırıldığında yapılır. Yalnızca bilinen bir Discord kimliği olan destekçiler senkronize edilebilir.

> [!PERMISSION]
> Botun **Rolleri Yönet** iznine ihtiyacı vardır ve botun rolü eşleştirilmiş her rolün üstünde olmalıdır. Botun üstündeki roller atlanır.

## Aylık duyurular

Bir kanal ayarlamak için `patreonch #channel` ya da **Duyuru Kanalı** seçicisini, bir gün ayarlamak için `patreonday <1..28>` ya da **Duyuru Günü (1-28)** alanını kullan. Gün 28 ile sınırlıdır; böylece Şubat ayı hiç atlanmaz. Duyurular, `patreontoggle` çalıştırana ya da **Duyuruları Etkinleştir** kutucuğunu işaretleyene kadar kapalıdır.

Bot her saat kontrol eder. Seçilen günde ve bu ay henüz duyuru yapılmamışsa, mesajı gönderir ve zamanı kaydeder. Bot o gün çevrimdışıysa, gün bu ay içinde geçtiyse başlangıçta yakalar. `patreonannounce` hemen bir duyuru gönderir ve bu, bu ayın paylaşımı sayılır.

Özel bir mesaj yoksa bot aktif destekçi sayısını ve aylık geliri içeren varsayılan bir teşekkür gönderir. Kendi mesajını `patreonmsg <text or embed code>` ile ya da kontrol panelindeki duyuru mesajı düzenleyicisiyle ayarla. Metin embed ayrıştırıcısından geçer. Varsayılana dönmek için `-` kullan.

### Yer tutucular

Bunlar duyuru mesajında, olağan sunucu ve kanal yer tutucularıyla birlikte çalışır.

| Yer tutucu | Değer |
| --- | --- |
| `%month%` | Geçerli ayın adı |
| `%year%` | Geçerli yıl |
| `%patreon.link%` | `https://patreon.com` |
| `%supporter.count%` | Aktif destekçiler |
| `%supporter.total%` | Şimdiye kadar kaydedilen tüm destekçiler |
| `%supporter.new%` | Bu ay yeni destekçiler |
| `%supporter.former%` | Eski destekçiler |
| `%supporter.linked%` | Discord hesabı bağlı destekçiler |
| `%revenue.monthly%` | Güncel aylık bağışlar |
| `%revenue.average%` | Ortalama bağış |
| `%revenue.lifetime%` | Ömür boyu gelir |
| `%growth.new%` | Bu ay yeni destekçiler |
| `%top.supporter.name%` | En yüksek bağış yapan destekçi |
| `%top.supporter.amount%` | Onun bağışı |
| `%patron.name%` | En yüksek bağış yapan destekçi, `%top.supporter.name%` ile aynı |
| `%patron.tier%` | O destekçinin seviyesi; Patreon bildirmediyse "Unknown" |
| `%patron.amount%` | Aylık bağışı, `%top.supporter.amount%` ile aynı |
| `%tiers.count%` | Seviye sayısı |
| `%tier.popular%` | En çok destekçisi olan seviye |
| `%tier.popular.count%` | Bu seviyede kaç kişi olduğu |
| `%supporters.summary%` | Destekçi sayısı hakkında hazır bir cümle |
| `%revenue.summary%` | Gelir hakkında hazır bir cümle |
| `%growth.summary%` | Büyüme hakkında hazır bir cümle |

> [!EXAMPLE]
> `It's %month%! Thanks to %supporters.summary%%revenue.summary%!%growth.summary%` şöyle görünür: "It's December! Thanks to our 25 incredible supporters who help us raise $150/month! We gained 3 new supporters this month!"

## Yeni destekçileri tanıma

`patreonrecognize [#channel]`, bağışı son yedi gün içinde başlamış destekçiler için, çalışma başına en fazla beş kişi olacak şekilde, verilen kanala ya da bulunduğun kanala bir hoş geldin embed'i gönderir. Bu zamanlanmış değil, elle çalıştırılan bir komuttur; bu yüzden bir senkronizasyondan sonra çalıştır. İki kez çalıştırmak aynı kişileri iki kez paylaşır.

## Ayarlar

Kontrol panelinde dört sekme vardır: **Genel Bakış**, **Destekçiler**, **Seviye Eşleştirme** ve **Yapılandırma**.

| Ayar | Varsayılan | Kontrol ettiği şey |
| --- | --- | --- |
| Duyuru Kanalı | yok | Aylık paylaşımın gideceği yer; yok ise duyurular kapalıdır |
| Duyuru Günü (1-28) | yok | Paylaşımın yapılacağı ayın günü; bir gün ayarlanmadan duyurular tetiklenmez |
| Duyuru mesajı | yerleşik teşekkür | Yukarıdaki yer tutucularla birlikte özel metin ya da embed |
| Duyuruları Etkinleştir | kapalı | Aylık paylaşımın gönderilip gönderilmeyeceği |
| Rol Senkronizasyonunu Etkinleştir | kapalı | Eşleştirilmiş rollerin destekçilere uygulanıp uygulanmayacağı |
| Seviye eşleştirmeleri | yok | Her seviyenin verdiği rol |

## Kurulum adımları

1. Kontrol panelinde **Patreon**'u aç ve bağlan düğmesine tıkla. Kampanya sahibinin hesabıyla giriş yap ve erişimi onayla.
2. İlk senkronizasyonu bekle, ardından **Destekçiler** sekmesinde destekçilerini gördüğünü kontrol et.
3. **Seviye Eşleştirme** sekmesinde her seviyeyi bir role eşleştir. Önce rolleri oluştur ve botun rolünü onların üstüne koy.
4. **Rol Senkronizasyonunu Etkinleştir** kutucuğunu işaretle, ardından zaten bağlı herkese rolleri uygulamak için `patreonsyncall` çalıştır.
5. **Yapılandırma** sekmesinde **Duyuru Kanalı** ve **Duyuru Günü**'nü seç, yer tutucularla bir mesaj yaz ve **Duyuruları Etkinleştir** kutucuğunu işaretle.
6. Sonucu kanalda görmek için `patreonannounce` komutunu bir kez çalıştır.

## Komutlar

Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gereken | Amaç |
| --- | --- | --- | --- |
| `patreonsync` | `ptsync` | Bot sahibi | Yetkilendirme OAuth bağlantısını gönder |
| `patreonch [#channel]` | `ptch` | Yönetici | Duyuru kanalını göster ya da ayarla |
| `patreondisable` | `ptdisable` | Yönetici | Kanalı temizle, duyuruları kapat |
| `patreonmsg [text]` | `ptmsg` | Yönetici | Duyuru mesajını göster ya da ayarla, sıfırlamak için `-` |
| `patreonday [day]` | `ptday` | Yönetici | Ayın gününü göster ya da ayarla |
| `patreontoggle` | `pttoggle` | Yönetici | Duyuruları aç ya da kapat |
| `patreonconfig` | `ptconfig` | Yönetici | Durum, kanal, gün, mesaj ve son paylaşımı göster |
| `patreonannounce` | `ptannounce` | Yönetici | Duyuruyu hemen gönder |
| `patreonhelp` | `pthelp` | Kimse | Yer tutucu listesi ve komut özeti |
| `patreonsupporters` | `ptsupporters` | Yönetici | Aktif destekçileri listele |
| `patreontop [count]` | `pttop` | Kimse | Bağışa göre en iyi destekçiler |
| `patreonstats` | `ptstats` | Yönetici | Destekçi ve gelir özeti |
| `patreonanalytics` | `ptanalytics` | Yönetici | Ayrıntılı analitik |
| `patreonlink <user> <patreonUserId>` | `ptlink` | Yönetici | Bir üyeyi bir Patreon kullanıcısıyla eşleştir |
| `patreonrolesync` | `ptrolesync` | Rolleri Yönet | Otomatik rol senkronizasyonunu aç/kapat |
| `patreontiermap <tierId> <role>` | `pttiermap` | Rolleri Yönet | Bir seviyeyi bir role eşleştir |
| `patreonroles` | `ptroles` | Yönetici | Seviyeleri kimlikleri ve rolleriyle listele |
| `patreonsyncall` | `ptsyncall` | Rolleri Yönet | Bağlı her destekçiye rolleri uygula |
| `patreonrecognize [#channel]` | `ptrecognize` | Yönetici | Son yedi günün destekçilerini selamla |

## İpuçları ve dikkat edilecekler

- Yalnızca Patreon profilinde Discord'unu bağlamış ya da `patreonlink` ile eşleştirilmiş destekçiler rol alabilir.
- Rol senkronizasyonu her destekçi için bir rol seçer: bağışının karşıladığı en iyi seviye. Birden fazla seviye rolünü üst üste biriktirmek desteklenmez.
- Duyurular bir takvim ayında en fazla bir kez gönderilir. Ayın 3'ünde `patreonannounce` çalıştırırsan, o ay 15'indeki zamanlanmış paylaşım atlanır.
- Duyuru günü UTC'dir.
- Aylık duyuru tüm kampanyayla ilgilidir; bu yüzden `%patron.name%`, `%patron.tier%` ve `%patron.amount%` her destekçiyi sırayla değil, en yüksek bağış yapan aktif destekçiyi anlatır. Destekçi başına selam için `patreonrecognize` kullan.
- Farklı bir Patreon hesabıyla yeniden bağlanmak kampanyayı değiştirir ama eski eşleştirmeleri korur; bu yüzden sonrasında **Seviye Eşleştirme** sekmesini gözden geçir.

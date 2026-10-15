---
title: Yönetim
slug: administration
summary: Otomatik raid, spam, alt hesap, dolandırıcılık ve bal küpü koruması; katılımda verilen veya üyelerin kendi aldığı roller; komutlar için Discord izin geçersiz kılmaları ve kötü günler için toplu işlemler.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Administration
tags: [admin, anti-raid, anti-spam, anti-alt, anti-pattern, anti-mass-mention, anti-mass-post, honeypot, anti-image-hash, scam images, external apps, user apps, reaction roles, self-assignable roles, auto-assign roles, auto-ban roles, voice channel roles, permission overrides, dpo, mass ban, prune, server recovery, staff role, timezone, cooldowns, yönetim, raid koruması, spam koruması, alt hesap, desen koruması, bal küpü, görsel hash, dolandırıcılık görselleri, harici uygulamalar, tepki rolleri, kendi kendine atanabilir roller, otomatik rol, otomatik yasaklama, sesli kanal rolleri, izin geçersiz kılmaları, toplu yasaklama, temizleme, sunucu kurtarma, yetkili rolü, saat dilimi, bekleme süreleri]
related: [moderation, permissions, logging, multigreets, settings, auditlog, rolestates]
---

## Ne işe yarar

Yönetim, kimse izlemediğinde sunucunun düzenini koruyan modüldür. Koruma sistemleri katılımları ve mesajları izler; bir raid, spam dalgası, geçici alt hesap, toplu etiketleme, her kanala yapıştırılan dolandırıcılık bağlantısı, tuzak kanalına yazı veya bilinen bir dolandırıcılık görseli gibi şüpheli bir durum görürse otomatik olarak cezalandırır. Her sistem bağımsızdır, kendi cezasına sahiptir ve tek başına açılıp kapatılabilir.

Aynı modül rol otomasyonunu da yönetir: katılımda verilen roller, üyelerin `iam` ile kendilerinin aldığı roller, tepki rolleri, bir sesli kanalda olmaya bağlı roller ve bu rolü alanı yasaklayan tuzak roller. Ayrıca bir komutun hangi Discord iznini istediğini değiştirmenize, diğer özelliklerin kullandığı yetkili ve üye rollerini belirlemenize, komutlara bekleme süresi koymanıza ve komut mesajlarını temizlemenize izin verir.

Kötü günler için toplu işlemler de vardır: son birkaç dakikada katılan herkesi yasaklama veya atma, isim kalıbına, role ya da avatara göre yasaklama, etkin olmayan üyeleri temizleme ve bir yöneticinin rolünü doğrulanmış sahibe geri veren bir sunucu kurtarma akışı.

Her şey kontrol panelindeki **Yönetim** sayfasında, beş sekmede bulunur: **Genel Bakış**, **Koruma Sistemleri**, **Roller ve İzinler**, **Otomasyon ve Ayarlar** ve **Gelişmiş İşlemler**. Neredeyse her ayarın bir komutu da vardır.

## Neden kullanırsın

- Katılım raidleri ve bot dalgaları gece 3'te gelir; kimse uyanmadan halledilmesini istersin.
- Ele geçirilmiş bir hesap aynı oltalama bağlantısını on kanala yapıştırıyordur.
- Üyeler yetkililerden yardım almadan kendi renklerini, bölgelerini ya da bildirim rollerini seçebilmeli.
- `ban` komutunu Discord'un rol ayarlarına dokunmadan, Üyeleri Yasakla yerine Mesajları Yönet izni olanların da kullanabilmesini istersin.
- Bir komut genel kanalda spam ediliyor ve bekleme süresi gerekiyor.
- Hesap sahibinin rollerini bir yetkili almış ve sen geri dönüş yolu arıyorsun.

## Cezalar

Her koruma sistemi bir **ceza işlemi** alır. Bazı işlemler ayrıca bir **süre** ya da bir **rol** ister.

| İşlem | Ne olur |
| --- | --- |
| Mute | Sunucunun susturma rolünü uygular (metin ve ses) |
| ChatMute | Yalnızca metin için susturma rolü |
| VoiceMute | Üyeyi sesli kanalda sunucu tarafından susturur |
| Kick | Üyeyi çıkarır; tekrar katılabilir |
| Softban | Yasaklayıp hemen yasağı kaldırır; son mesajları siler |
| Ban | Yasaklar; süre verirsen geçici olarak yasaklar |
| Timeout | Discord'un yerleşik zaman aşımı; süre gerekir, en fazla 28 gün |
| AddRole | Seçtiğin rolü ekler, örneğin bir karantina rolü |
| RemoveRoles | Tüm rolleri kaldırır |
| Warn | Moderasyon modülü üzerinden uyarı ekler |
| Delete | Yalnızca ihlal eden mesajı siler |
| None | Olayı kaydeder ama işlem yapmaz |

Yalnızca Ban, Mute, ChatMute, VoiceMute, AddRole ve Timeout süre kabul eder; diğerlerinde süre yok sayılır. Süreler dakika cinsindendir. Kontrol panelinde Raid Koruması, Spam Koruması, Toplu Etiket Koruması ve Desen Koruması için en fazla 10080 (bir hafta), Toplu Gönderi Koruması, Gönderi Kanalı Koruması ve Görsel Hash Koruması için 1440 (bir gün), Alt Hesap Koruması için ise bir yıl verilebilir. Cezalar kuyruktan saniyede bir uygulanır ve Discord denetim kaydındaki neden "Raiding Protection" veya "ImageHash Protection" gibi görünür.

> [!WARNING]
> Raid Koruması, Alt Hesap Koruması ve Desen Koruması üye katıldığında çalışır ve işlem Warn ise kontrolü tamamen atlar. Bu üçü için Kick, Ban, Timeout veya bir rol seç.

Sunucu Yönetici iznine sahip üyeler, mesaj tabanlı tüm korumalardan muaftır. Botlar katılım tabanlı korumalar ile Spam Koruması tarafından yok sayılır; diğerlerinde **Botları yoksay** anahtarı vardır.

## Koruma sistemleri

**Koruma Sistemleri** sekmesinde her sistem için bir kart bulunur. Kartta **Etkin** veya **Devre dışı** düğmesi ve etkinleştirdikten sonra ayarlarını açan bir **Yapılandır** düğmesi görünür. Kontrol panelinden etkinleştirmek bir başlangıç yapılandırması uygular; güvenmeden önce **Yapılandır** ile işlemi kontrol et. **Genel Bakış** sekmesi yedi sistemden kaçının aktif olduğunu gösterir ve her birini listeler.

### Raid Koruması

Belirli bir süre içinde katılan üyeleri sayar. **Kullanıcı Eşiği** değerine, **Zaman Aralığı** (saniye) içinde ulaşıldığında, o patlamada sayılan herkes birlikte cezalandırılır. Komut 2 ile 30 arasında bir eşik ve 2 ile 300 saniye arasında bir zaman aralığı kabul eder; kontrol paneli 1 ile 50 ve 1 ile 300 kabul eder. Burada AddRole desteklenmez. Katılan botlar sayılmaz.

> [!EXAMPLE]
> `antiraid 10 10 Ban`, on saniye içinde on hesap katıldığında herkesi yasaklar. `antiraid 10 10 Timeout 1h` ise onları bunun yerine bir saat zaman aşımına alır.

### Spam Koruması

Bir üyenin art arda gönderdiği aynı mesajları sayar; karşılaştırma büyük/küçük harf duyarsızdır. Sayı **Mesaj Eşiği**ne (komutta 2 ile 10, kontrol panelinde 1 ile 20) ulaşınca üye cezalandırılır ve sayaç sıfırlanır. Farklı bir mesaj sayacı sıfırlar; sayılan her mesaj otuz dakika sonra listeden düşer. **Yoksayılan kanallar** listesindeki kanallar atlanır; bu, bot komut kanalları için uygundur. Bunun yerine bir rol vermek istersen `antispam <count> <action> <role>` komutunu AddRole ile kullan.

### Alt Hesap Koruması

Katılan her hesabın yaşını kontrol eder. **Minimum hesap yaşı**ndan (dakika cinsinden; `antialt 3d Kick` de çalışır) genç hesaplar hemen cezalandırılır. Yalnızca katılımda çalışır; etkinleştirmek mevcut üyeleri taramaz. Kontrol panelindeki başlangıç değeri 1440 dakika, yani bir gündür.

### Toplu Etiket Koruması

Kullanıcı ve rol etiketlerini sayar. **Etiket Eşiği** kadar etiket içeren tek bir mesaj hemen cezalandırılır. Bunun altında kalan etiketler, üye başına **Zaman Aralığı** (saniye) boyunca toplanır; **Zaman Aralığında Maks. Etiket** değeri aşılırsa ceza uygulanır. **Botları yoksay**, bot mesajlarının sayılıp sayılmayacağını belirler.

### Desen Koruması

Her yeni üyeyi, sahte veya bot hesabı işaretleri için puanlar ve puan **Minimum Puan**a ulaştığında cezalandırır. Katılımda çalışır ve mesajlara değil hesaba bakar.

| Sinyal | Puan | Ayar |
| --- | --- | --- |
| Hesap, maksimum yaştan daha yeni oluşturulmuş | 5 | **Hesap Yaşını Kontrol Et**, **Maks. Hesap Yaşı (ay)** |
| Hesap oluşturulduktan kısa süre sonra katılmış | Bir saatten azsa 10, altı saatten azsa 7, aksi halde 3 | **Katılma Zamanlamasını Kontrol Et**, **Maks. Katılma Saati** |
| Diğer üyeler aynı saat içinde oluşturulmuş | Hesap başına 1, en fazla 10 | **Toplu Oluşturmayı Kontrol Et** |
| Katılırken hesap çevrimdışı görünüyor | 2 | **Çevrimdışı Durumunu Kontrol Et** |
| Hesap yeni hesap eşiğinden daha genç | 3 | **Yeni Hesapları Kontrol Et**, **Yeni Hesap Günü** |
| Kullanıcı adı senin regex desenlerinden birine uyuyor | 15 | **Kullanıcı adını kontrol et** seçili desen |
| Görünen ad desenlerinden birine uyuyor | 12 | **Görünen adı kontrol et** seçili desen |

Bir desen eşleşmesi, çalışan puan minimumun üstüne veya eşitse hemen cezalandırır; diğer sinyaller tek başına da bu puana ulaşabilir. Desenler regex'tir ve küçük harfe çevrilmiş ada büyük/küçük harf duyarsız uygulanır. Kontrol panelindeki başlangıç değerleri: minimum puan 15, altı ay, 48 saat, yedi gün ve tüm kontroller açık. Kartın **Desenler** düğmesi desen listesini açar; her desenin bir adı, regex'i ve iki ad kutusu vardır.

Komutlarla `patternadd <regex> [name] [checkUsername] [checkDisplayName]` bir desen ekler, `patternconfig <setting> <value>` ise `accountage`, `maxaccountage`, `jointiming`, `maxjoinhours`, `batchcreation`, `offlinestatus`, `newaccounts`, `newaccountdays` veya `minimumscore` ayarlarını değiştirir. Tek başına `patternconfig` mevcut değerleri ve sistemin kaç kez tetiklendiğini gösterir.

### Toplu Gönderi Koruması

Bir üyenin kısa sürede birden fazla kanala aynı veya benzer içerik göndermesini yakalar. Klasik "dolandırıcılık bağlantısını her yere yapıştırma" örüntüsüdür; mesajlar kanallara yayıldığı için Spam Koruması bunu kaçırır.

Bot her üye için **Zaman Aralığı** (10 ile 600 saniye) içindeki son elli mesajı tutar. Bir mesaj, önceki mesajlarla düzenleme mesafesine göre en az yüzde 80 benzerse ve büyük/küçük harf farkı yok sayılırsa benzer sayılır. Benzer mesajlar **Kanal Eşiği** (2 ile 20) kadar farklı kanalda bulunursa üye cezalandırılır. Yirmi karakterden kısa mesajlar yok sayılır.

**Yalnızca bağlantıları kontrol et** varsayılan olarak açıktır: yalnızca bağlantı içeren mesajlar izlenir. Yoksayılan kullanıcılar, roller ve kanallar dikkate alınır. Varsayılan olarak tetikleyen mesaj silinir ve üyeye nedenini açıklayan bir DM gönderilir.

### Gönderi Kanalı Koruması

**Bal küpü kanalları** oluşturur. Gerçek üyelerin yazmayacağı bir veya daha fazla kanalı, genellikle kanal listesinin altında, uyarı niteliğinde bir adla işaretlersin. Oraya yazan herkes bot veya ele geçirilmiş hesap sayılır: mesaj silinir, yazana DM gönderilir ve ceza uygulanır. Yöneticiler muaftır; **Yoksayılan roller** ve ID ile **Yoksayılan Kullanıcılar** ekleyebilirsin.

Bot ayrıca bir durum kanalında **durum embed**'ini günceller: durum kanalı, `antipostchannel` komutunu çalıştırdığın kanaldır ya da kontrol panelinden etkinleştirildiyse yakalanan ilk bal küpü kanalıdır. Embed işlemi, bal küpü kanallarının sayısını, toplam yakalamayı ve yakalanan son on üyeyi gösterir.

### Görsel Hash Koruması

Belirli görselleri görünüşüne göre engeller; böylece yeniden boyutlandırılmış, yeniden sıkıştırılmış, parlaklığı değiştirilmiş, aynalanmış veya çerçeveye alınmış tekrar yüklemeler de eşleşir. Engellenen her görsel, aynasının yanında ve düz bir çerçevesi varsa çerçevesi kaldırılmış bir kopyasıyla birlikte algısal hash olarak saklanır. Gönderilen ekler (ve **Gömülü görselleri kontrol et** açıksa embed'ler) aynı şekilde hashlenir ve karşılaştırılır.

- **Eşleşme Toleransı** (0 ile 64, varsayılan 31), gönderilen bir görselin ne kadar farklı olabileceğini ve yine de sayılacağını belirler. Masum bir görsel yakalanıyorsa düşür; dolandırıcılar sıyrılıyorsa yalnızca o zaman yükselt.
- **Çerçeveli kopyaları yakala**, gönderilen görseldeki düz çerçeveyi eşleştirmeden önce kaldırır. Aynalanmış kopyalar her zaman yakalanır.
- Tanımlanması için çok sade olan görseller güvenilir biçimde eşleştirilmez ve engelleme olarak da kabul edilmez; aksi halde ilgisiz görselleri yakalarlar.
- 8 MB'den büyük görseller indirilmez ve hashlenmez. Sınır API üzerinden 1 ile 32 MB arasında ayarlanabilir, ancak ne kontrol paneli kartı ne de bir komut bunu sunar.
- Engellenen her görsel kendi işlemini, süresini ve rolünü taşıyabilir; bu, sistemin varsayılanını geçersiz kılar. **Yalnızca sil** görseli, gönderene ceza vermeden kaldırır.
- Yoksayılan roller ve kanallar atlanır; gönderene varsayılan olarak DM gönderilir.

**Bilinen dolandırıcılık görsellerini engelle** seçeneği, botla birlikte gelen hazır listeyi açar. Liste şu anda Discord'da dolaşan sahte kripto casino ve MrBeast çekiliş görsellerini içerir. Kart, listede kaç görsel olduğunu ve bu sunucuda kaç gönderiyi yakaladığını gösterir.

Kendi görselini kontrol panelinde engellemek için dosyayı sürükle veya yükle ya da URL'sini yapıştır, bir etiket ver, istersen görsele özel bir işlem seç ve kaydet. Komutlarla, görseli ekleyerek, görseli içeren bir mesaja yanıt vererek ya da bağlantısını yapıştırarak `blockimage [action] [name]` çalıştır. `blockedimages` yakalanma sayılarıyla birlikte tüm listeyi gösterir, `unblockimage <id>` bir görseli kaldırır ve `imagehash` bir görselin hash'ini engellemeden gösterir.

> [!TIP]
> Önce Gönderi Kanalı Koruması'nı ve bilinen dolandırıcılık görseli listesini aç. İkisi de normal sohbette yanlış pozitif üretmez ve birlikte otomatik dolandırıcılık faaliyetinin çoğunu yakalar.

### Harici Uygulama Koruması

Üyeler kendi Discord hesaplarına uygulama ekleyip bunları, uygulama eklenmemiş bir sunucuda bile kullanabilir. Bu uygulamaların mesajları uygulamanın adıyla gönderilir; mesajın kimden geldiğine bakan diğer korumalar, arkasındaki üyeyi hiç görmez. Harici Uygulama Koruması, uygulamayı hangi üyenin çalıştırdığını okur ve ona göre işlem yapar.

Bir mesaj şu durumlardan birinde ihlal sayılır:

- **Etiket Sınırı** (varsayılan 5) kadar kullanıcı ve rol etiketliyorsa ya da herkes veya burada etiketi içeriyorsa,
- **Davet bağlantılarını kaldır** açıkken bir Discord davet bağlantısı içeriyorsa,
- veya mesajı, on saniyede (varsayılan 5 mesaj / 10 saniye) **İzin Verilen Uygulama Mesajları** değerinden fazla uygulama kullanmış bir üyeden geliyorsa.

Bir sınırı 0 yapmak o kontrolü kapatır. Bir mesaj kuralı çiğnediğinde silinir ve uygulamayı çalıştıran üye cezalandırılır; varsayılan ceza bir saatlik zaman aşımıdır. **Yalnızca sil** mesajı kimseyi cezalandırmadan kaldırır. Sunucunun kendisine eklenmiş uygulamalara dokunulmaz; sunucu yöneticileri de muaftır.

> [!TIP]
> Discord'un **Harici Uygulamaları Kullan** izni bu özellikle iyi çalışır. Bu izni olmayan üyeler yine kendi uygulamalarını kullanabilir, ama yanıtları yalnızca kendileri görür. Bunu `@everyone` için kapat, güvenilir veya seviye sahibi bir role aç; yeni ya da geçici hesaplar da uygulamalar üzerinden hiç yazamaz.

## Roller

Bu kartlar **Roller ve İzinler** sekmesindedir.

### Otomatik rol atama

Katılan her üyeye hemen verilen roller; botlar için ayrı bir liste vardır. Üyelik taramasını tamamlamakta olan üyeler, onaylandıktan sonra rollerini alır. Rol Durumları, kayıtlı rol durumu olan üyeler için otomatik atamayı atlayacak şekilde ayarlanmışsa, geri dönen üyeler eski rollerini korur. `autoassignrole <role>` bir rolü listede açar veya kapatır; listeyi görmek için komutu tek başına çalıştır.

### Kendi kendine atanabilir roller

Üyelerin `iam <role>` ile kendilerine verip `iamnot <role>` ile bıraktıkları roller. Roller numaralı **gruplara** ayrılır (grup 0 "Gruplanmamış"tır) ve gruplara ad verilebilir. **Özel mod** sunucu genelinde bir anahtardır: açıkken bir gruptan rol almak, o gruptaki başka bir rolünü kaldırır; renkler veya bölgeler için idealdir. Bir rol için en düşük XP **seviyesi** şartı konabilir. **iam mesajlarını kaldır** hem komutu hem yanıtı üç saniye sonra siler; kanalı temiz tutar.

### Tepki rolleri

Mevcut bir mesaja emoji ekleyerek rol bağlarsın. Üyeler emojiye tıklayarak rolü alır, tekrar tıklayarak bırakır. Her mesaj **Özel** olarak işaretlenebilir; böylece bir üye o mesajdan yalnızca bir rol alabilir. Discord mesaj başına yirmi tepkiye izin verir ve kontrol paneli bunu senin için sayar. Zaten tepki rolü olan bir mesaja ekleme yapmak mevcut kurulumu genişletir.

Komutlarla `reactionroles [messageId] [excl] <role> <emoji> ...` çiftleri ayarlar; mesaj ID'sini atlarsan komutunun hemen üstündeki mesaj kullanılır. `reactionroleslist` her kurulumu bir sıra numarasıyla gösterir, `reactionrolesremove <index>` birini siler.

### Sesli kanal rolleri

Bir rolü sesli kanala bağla. Üyeler kanala katıldığında rolü alır, ayrıldığında kaybeder. Bir metin kanalını yalnızca o anda bir aramada olan kişilere açmak için kullan.

### Otomatik yasaklama rolleri

Bu listedeki her rol bir tuzaktır: bir üye rolü aldığı anda yasaklanır. Neden varsayılan olarak "Auto-ban role assigned" olur; `autobanrolereason` ile değiştirebilirsin. Kendi kendine rol atayan botları yakalamak için gizli bir mesajdaki tepki rolüyle birlikte kullan. Silinen mesaj günü, Moderasyon modülünün yasak silme ayarını izler.

## İzin geçersiz kılmaları ve komut izinleri

**İzin geçersiz kılmaları**, bir komutun normalde kontrol ettiği Discord iznini değiştirir. `ban` için Mesajları Yönet gerektiren bir geçersiz kılma eklersen Mesajları Yönet iznine sahip herkes komutu çalıştırabilir; Yönetici gerektirirsen yalnızca yöneticiler çalıştırabilir. Birden fazla izin listelenirse kullanıcının hepsine sahip olması gerekir. Komutlarla `dpo <command> <permission> [permission...]` bir tane ayarlar, izin belirtmeden `dpo <command>` onu kaldırır, `dpol` listeler ve `dpor` onay sonrası hepsini temizler. Özel sohbet tetikleyici adları da kabul edilir.

Aynı sekmedeki **Komut İzinleri** kartı, kurallara dayalı komut izni sistemidir: bir komutu, bir modülü veya her şeyi bir üye, rol, kanal, kategori ya da tüm sunucu için izin verebilir veya yasaklayabilirsin; kurallar yukarıdan aşağıya değerlendirilir. Kendi makalesi vardır, bkz. `permissions`.

## Sunucu ayarları

Bu kartlar **Otomasyon ve Ayarlar** sekmesindedir.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| **Yetkili Rolü** | yok | Diğer özelliklerin yetkili olarak kabul ettiği rol |
| **Üye Rolü** | yok | "Üye" sayılan rol; `prunemembers` bu role sahip kişileri de dahil edebilir |
| **Sunucu Saat Dilimi** | UTC | Bot yerel saat yazdırdığında kullanılan saat dilimi |
| **Komut Bekleme Süreleri** | yok | Komut başına saniye cinsinden hız sınırı, 1 ile 90.000 |
| **İzin Geçersiz Kılmaları** | yok | Her komutun gerektirdiği Discord izni (yukarıya bak) |
| **Oyun Sesli Kanalı** | yok | Bu sesli kanaldaki bir üye oyun oynamaya başladığında, bot onu adı oyunla eşleşen sesli kanala taşır |
| **Komutta Mesajı Sil** | kapalı | Komut çalıştıktan sonra çağıran mesajı siler; kanal bazında Etkin, Devre dışı veya Devral geçersiz kılmaları vardır |
| **İstatistik katılımdan çıkma** | katılımda | Bu sunucu için komut kullanım istatistiklerini durdurur; **İstatistikleri Sil** saklanan verileri siler |

## Gelişmiş işlemler

**Gelişmiş İşlemler** sekmesinde üç kart vardır. Her toplu işlem onay ister ve ardından başka kontrol yapmadan çalışır.

### Özel Yasaklama Mesajı

Bir üye yasaklandığında DM ile aldığı mesaj; embed düzenleyicisinde oluşturulur. Moderasyon modülünün yasaklama komutunun kullandığı şablonun aynısıdır.

### Sunucu Kurtarma

Bir yönetici rolü kaldırıldığında, sahibe bir Yönetici rolünü geri getirmenin yolu. Sunucu için iki gizli anahtar saklanır: bir **kurtarma anahtarı** ve bir **iki faktörlü anahtar**.

- Hiçbir şey kurulmamışken sunucu sahibi olarak `/serverrecovery server-recover` çalıştırırsan ikisi de oluşturulur: kurtarma anahtarı DM ile gönderilir, kimlik doğrulayıcı gizli anahtarı ise QR kod olarak gösterilir. Kurulumu bitirmek için kimlik doğrulayıcı uygulamandan bir kod girersin.
- Kurulum bittikten sonra `/serverrecovery server-recover` çalıştıran, kurtarma anahtarını giren ve ardından geçerli bir kimlik doğrulayıcı kodu veren herkese, Yönetici izinli ve botun en yüksek rolünün hemen altında yer alan "Recovered Server Owner Role" adında yeni bir rol verilir.
- `/serverrecovery clear-server-recover`, onaydan sonra kayıtlı anahtarları siler; kontrol panelindeki **Kurtarma ayarlarını kaldır** de aynısını yapar.

Kontrol panelindeki kart anahtarları doğrudan da saklayabilir: en az on altı karakterli bir kurtarma anahtarı üret veya yaz, bir de iki faktörlü anahtar gir. Bot kodları, iki faktörlü anahtarı bir kimlik doğrulayıcı (TOTP) gizli anahtarı olarak doğrular; bu yüzden düz bir parola değil, bir kimlik doğrulayıcı uygulamasına eklediğin base32 gizli anahtarını gir.

> [!PERMISSION]
> Kurtarmanın çalışması için botun kendisinin Yönetici iznine sahip olması gerekir; en yüksek rolü de, hemen altındaki rol kurtarmaya çalıştığın kişilerden üstte kalacak kadar yüksek olmalıdır.

### Toplu İşlemler

| İşlem | Ne yapar |
| --- | --- |
| **Etkin Olmayan Kullanıcıları Temizle** | Verilen gün sayısı kadar (1 ile 30) etkin olmayan üyeler için Discord'un üye temizliği |
| **Kullanıcıları Toplu Yasakla** | Yapıştırılan kullanıcı ID listesini tek bir nedenle yasaklar; mesaj silme, Moderasyon modülünün yasak silme ayarını izler |
| **Kullanıcıları Toplu Yeniden Adlandır** | Her üyenin takma adını bir şablona ayarlar; `{username}` kullanıcı adıyla değiştirilir, örneğin `[AFK] {username}`; bot tarafından yeniden adlandırılamayan üyeler atlanır |
| **Mesaja Kadar Temizle** | Bir kanalda verilen mesaj ID'sinden sonraki tüm mesajları tek tek siler |

Komutlar kimin yasaklanacağını seçmenin ek yollarını sunar: `banunder 10m` son on dakikada katılan herkesi yasaklar (`-p` önce listeyi önizler, `-accage 1d` ayrıca hesabın bir günden genç olmasını şart koşar), `kickunder` aynısını atma ile yapar, `nameban <regex>` bir desenle eşleşen kullanıcı adlarını önizlemeden sonra yasaklar, `baninrole <role>` bir role sahip herkesi yasaklar ve `banbyhash <avatarHash>` belirli bir avatarı kullanan herkesi yasaklar. Hepsi onay ister.

## Kurulum adımları

1. Kontrol panelinde **Yönetim** bölümünü aç ve **Koruma Sistemleri** sekmesine git.
2. **Raid Koruması**'nı etkinleştir, **Yapılandır**'a bas ve normal katılım hızına uyan bir eşik ile zaman aralığı ayarla. İşlem olarak Kick veya Ban seç.
3. Yalnızca botların yazacağı gizli bir kanal oluştur, **Gönderi Kanalı Koruması**'nı etkinleştir ve **Bal Küpü Kanalları** altına ekle.
4. **Görsel Hash Koruması**'nı etkinleştir ve **Bilinen dolandırıcılık görsellerini engelle**'ye bas.
5. **Toplu Gönderi Koruması**'nı, varsayılan üç kanal ve altmış saniye ile ve yalnızca bağlantılar için etkinleştir.
6. **Roller ve İzinler** altında, normal kullanıcılar için üye rolünü **Otomatik Rol Atama** listesine ekle; **Kendi Kendine Atanabilir Rol Ekle** ile bir renk grubu kur ve **Özel mod**'u aç.
7. **Otomasyon ve Ayarlar** altında **Yetkili Rolü**, **Üye Rolü** ve **Sunucu Saat Dilimi** ayarlarını yap.
8. **Gelişmiş İşlemler** altında, işler sakinken **Sunucu Kurtarma**'yı kur.
9. **Genel Bakış**'ı kontrol et: her koruma sistemini ve aktif olup olmadığını listeler.

## Komutlar

Bunları sunucunun önekiyle çalıştır (değiştirmediysen `.`). Argüman olmadan çalıştırılan koruma komutları ilgili sistemi kapatır.

### Koruma

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `antiraid [threshold] [seconds] [action] [duration]` | | Yönetici | Raid Koruması'nı yapılandır veya kapat |
| `antispam [count] [action] [duration or role]` | | Yönetici | Spam Koruması'nı yapılandır veya kapat |
| `antialt [minAge] [action] [duration or role]` | | Yönetici | Alt Hesap Koruması'nı yapılandır veya kapat |
| `antimassmention [threshold] [window] [max] [ignoreBots] [action] [duration or role]` | `amm`, `massmention`, `stopmassmention` | Yönetici | Toplu Etiket Koruması'nı yapılandır veya kapat |
| `antipattern [action] [duration or role]` | `apattern` | Yönetici | Desen Koruması'nı yapılandır veya kapat |
| `patternadd <regex> [name] [checkUsername] [checkDisplayName]` | `padd` | Yönetici | Bir isim deseni ekle |
| `patternremove <id>` | `premove`, `prem` | Yönetici | Bir deseni ID ile kaldır |
| `patternlist` | `plist` | Yönetici | Desenleri listele |
| `patternconfig [setting] [value]` | `pconfig` | Yönetici | Desen Koruması puanlama ayarlarını göster veya değiştir |
| `antimasspost [channels] [seconds] [action] [duration]` | | Yönetici | Toplu Gönderi Koruması'nı yapılandır veya kapat |
| `antipostchannel [action] [duration]` | | Yönetici | Bal küpü kanallarını yapılandır veya kapat; bulunduğun kanal durum kanalı olur |
| `antipostchanneladd <#channel>` | | Yönetici | Bir bal küpü kanalı ekle |
| `antipostchannelremove <#channel>` | | Yönetici | Bir bal küpü kanalını kaldır |
| `antiimagehash [action] [tolerance] [duration]` | `aih` | Yönetici | Görsel Hash Koruması'nı yapılandır veya kapat |
| `antiexternalapp [action] [mentions] [messages] [duration]` | `aea`, `antiuserapp` | Yönetici | Harici Uygulama Koruması'nı yapılandır veya kapat |
| `blockimage [action] [name]` | `banimage` | Yönetici | Eklenen, yanıtlanan veya bağlantısı verilen görseli engelle |
| `unblockimage <id>` | `unbanimage` | Yönetici | Engellenen bir görseli kaldır |
| `blockedimages` | `blockedimagelist` | Yönetici | Engellenen görselleri yakalanma sayılarıyla listele |
| `imagehash [url]` | | Yönetici | Bir görselin hash'ini göster |
| `antiimagehashpreset` | `aihpreset`, `blockcommonscams` | Yönetici | Bilinen dolandırıcılık görseli listesini aç veya kapat |
| `antiimagehashignore <role or #channel>` | `aihignore` | Yönetici | Bir rol veya kanal muafiyetini aç veya kapat |

### Roller

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `autoassignrole [role]` | `aar` | Rolleri Yönet | Katılımda bir rolü aç veya kapat ya da listeyi göster |
| `autoassignbotrole [role]` | `aabr` | Rolleri Yönet | Botlar için aynısı |
| `asar [group] <role>` | | Rolleri Yönet | Bir rolü kendi kendine atanabilir yap; isteğe bağlı olarak bir grupta |
| `rsar <role>` | | Rolleri Yönet | Kendi kendine atanabilir bir rolü kaldır |
| `lsar` | | Gerekmez | Kendi kendine atanabilir rolleri gruplarına göre listele |
| `sargn <group> [name]` | | Rolleri Yönet | Bir gruba ad ver veya adını temizle |
| `togglexclsar` | `tesar` | Rolleri Yönet | Özel modu aç veya kapat |
| `rolelevelreq <level> <role>` | `rlr` | Rolleri Yönet | Bir rol için XP seviyesi şartı koy |
| `adsarm` | | Mesajları Yönet | `iam` mesajlarını silmeyi aç veya kapat |
| `iam <role>` | | Gerekmez | Kendine kendi kendine atanabilir bir rol ver |
| `iamnot <role>` | `iamn` | Gerekmez | Birini kaldır |
| `reactionroles [messageId] [excl] <role> <emoji>...` | `rero` | Rolleri Yönet | Bir mesajda tepki rolleri kur |
| `reactionroleslist` | `reroli` | Rolleri Yönet | Tepki rolü kurulumlarını listele |
| `reactionrolesremove <index>` | `rerorm` | Rolleri Yönet | Bir kurulumu sıra numarasıyla kaldır |
| `vcrole [voiceChannel] [role]` | | Rolleri Yönet | Bir rolü sesli kanala bağla (verilmezse bulunduğun kanal); rol verilmezse bağlantıyı kaldırır |
| `vcrolerm <channelId>` | | Rolleri Yönet | Bir bağlantıyı kanal ID'siyle kaldır |
| `vcrolelist` | | Gerekmez | Sesli kanal rollerini listele |
| `autobanroleadd <role>` | `abra` | Yönetici | Bir tuzak rolü ekle |
| `autobanroleremove <role>` | `abrr` | Yönetici | Birini kaldır |
| `autobanrolelist` | `abrl` | Yönetici | Tuzak rollerini ve nedenlerini listele |
| `autobanrolereason <role> [reason]` | `abreason` | Yönetici | Yasaklama nedenini göster, ayarla veya temizle |
| `setrole <role> <user> [time]` | `sr`, `giverole` | Rolleri Yönet | Bir rol ver; isteğe bağlı olarak süreli |
| `removerole <role> <user>` | `rr` | Rolleri Yönet | Bir rolü kaldır |
| `removeallroles <user>` | `rar` | Rolleri Yönet | Tüm rolleri kaldır |
| `createrole [name]` | `cr` | Rolleri Yönet | Bir rol oluştur |
| `deleterole <role>` | `dr` | Rolleri Yönet | Bir rolü sil |
| `renamerole <role> <name>` | `renr` | Rolleri Yönet | Bir rolü yeniden adlandır |
| `rolehoist <role>` | `rh` | Rolleri Yönet | Rolün üyeler listesinde ayrı gösterilmesini aç veya kapat |
| `rolecolor <role> [color]` | `roleclr` | Görmek için gerekmez, ayarlamak için Rolleri Yönet | Bir rolün rengini göster veya ayarla |

`autobanrole` komutları ayrıca `/autobanrole list`, `add`, `remove` ve `reason` eğik çizgi komutları olarak da kullanılabilir.

### İzinler ve ayarlar

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `dpo <command> [permission...]` | | Yönetici | Bir izin geçersiz kılmasını ayarla veya kaldır |
| `dpol` | `dpoli` | Yönetici | Geçersiz kılmaları listele |
| `dpor` | | Yönetici | Tüm geçersiz kılmaları temizle |
| `staffrole [role]` | | Yönetici | Yetkili rolünü göster veya ayarla |
| `staffroledisable` | | Yönetici | Yetkili rolünü temizle |
| `memberrole <role>` | | Yönetici | Üye rolünü göster veya ayarla |
| `delmsgoncmd [list, server, or channel <enable, disable, inherit> [#channel]]` | `dmc` | Yönetici | Komut mesajı silmeyi göster, aç/kapat veya geçersiz kıl |
| `gamevoicechannel` | `gvc` | Yönetici | Bulunduğun sesli kanalı oyun sesli kanalı olarak aç veya kapat |
| `timezone [id]` | | Görmek için gerekmez, ayarlamak için Yönetici | Sunucu saat dilimini göster veya ayarla |
| `timezones` | | Gerekmez | Kullanılabilir saat dilimi kimliklerini listele |
| `prefix [new]` | | Görmek için gerekmez, ayarlamak için Yönetici | Komut önekini göster veya değiştir |
| `languageset <name>` | `langset` | Yönetici | Sunucu dilini ayarla veya `default` yap |
| `langsetdefault [name]` | `langsetd` | Görmek için gerekmez, ayarlamak için bot sahibi | Botun genel varsayılan dilini göster veya ayarla |
| `languageslist` | `langli` | Gerekmez | Desteklenen dilleri listele |
| `guildstatsoptout` | `gstatsoptout` | Yönetici | Bu sunucu için komut istatistiklerini aç veya kapat |
| `deleteguildstatsdata` | `delguildstatsdata` | Yönetici | Saklanan istatistikleri sil; saatte bir kez |

### Toplu işlemler ve yardımcı komutlar

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `banunder <time> [-p or -accage <time>]` | | Yönetici | Verilen süre içinde katılan herkesi yasakla |
| `kickunder <time> [-p]` | | Yönetici | Verilen süre içinde katılan herkesi at |
| `nameban <regex>` | `nban` | Yönetici | Kullanıcı adı eşleşen üyeleri, önizlemeyle yasakla |
| `baninrole <role> [reason]` | | Yönetici | Bir role sahip herkesi yasakla |
| `banbyhash <avatarHash>` | `bbh` | Yönetici | Verilen avatar hash'ine sahip herkesi yasakla |
| `prunemembers <time> [yes]` | `memberprune` | Yönetici | Bu kadar gün etkin olmayan üyeleri temizle; `yes` üye rolünü de dahil eder |
| `setnick [user] <nickname>` | | Takma Adları Yönet | Bir üyenin takma adını veya botun kendi adını değiştir |
| `deafen <users...>` | `deaf` | Üyeleri Sağırlaştır | Sunucu tarafından sağırlaştır |
| `undeafen <users...>` | `undef` | Üyeleri Sağırlaştır | Bunu geri al |
| `creatxtchanl <name>` | `ctch` | Kanalları Yönet | Bir metin kanalı oluştur |
| `deltxtchanl <#channel>` | `dtch` | Kanalları Yönet | Bir metin kanalını sil |
| `creatvoichanl <name>` | `cvch` | Kanalları Yönet | Bir sesli kanal oluştur |
| `delvoichanl <channel>` | `dvch` | Kanalları Yönet | Bir sesli kanalı sil |
| `settopic [topic]` | `st` | Kanalları Yönet | Bulunduğun kanalın konusunu ayarla |
| `setchanlname <name>` | `schn` | Kanalları Yönet | Bulunduğun kanalı yeniden adlandır |
| `renamechannel <channel> <name>` | `channelrename` | Kanalları Yönet | Herhangi bir kanalı yeniden adlandır |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Kanalları Yönet | Bulunduğun kanaldaki NSFW işaretini aç veya kapat |
| `edit [#channel] <messageId> <text>` | | O kanalda Mesajları Yönet | Botun bir mesajını düzenle |
| `delete [#channel] <messageId> [time]` | `del` | O kanalda Mesajları Yönet | Bir mesajı hemen veya yedi güne kadar gecikmeyle sil |
| `setguildavatar [url]` | `sgav`, `setgav` | Sunucuyu Yönet | Sunucu simgesini bir URL'den veya ekten ayarla |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Sunucuyu Yönet | Sunucu afişini ayarla |
| `setguildbio <text>` | `sgbio`, `setgbio` | Sunucuyu Yönet | Sunucu açıklamasını ayarla |

Sunucu kurtarma yalnızca eğik çizgi komutudur: `/serverrecovery server-recover` ve `/serverrecovery clear-server-recover`. Yukarıdaki diğer komutların çoğunun da `/protection`, `/administration`, `/channel`, `/purge-members`, `/delmsgoncmd`, `/voice`, `/perm-override` ve `/roles` altında eğik çizgi karşılığı vardır.

### Günlük kaydı ve karşılama komutları

Modül ayrıca günlük komutlarını (`log`, `logcategory`, `logevents`, `logignore`, `logignorelist`, `commandlogchannel`, hepsi Yönetici; ayrıca `/log` eğik çizgi grubu) ve klasik karşılama komutlarını (`greetdm`, `greetdmmsg`, `greetdmtest`, `bye`, `byemsg`, `byedel`, `byetest`, `leavehook`, `boost`, `boostmsg`, `boostdel`, `boosttest`, hepsi Sunucuyu Yönet) içerir. Bunlar `logging` ve `multigreets` makalelerinde anlatılır.

## İpuçları ve dikkat edilecekler

- Botun rolü, verdiği, kaldırdığı veya yasakladığı her rolün üstünde olmalıdır; seçtiğin cezalara uygun olarak Üyeleri Yasakla, Üyeleri At, Rolleri Yönet veya Üyeleri Zaman Aşımına Uğrat izinlerine sahip olmalıdır. Susturma işlemleri bir susturma rolü ister; bot ilk kullanımda bunu oluşturur.
- Raid Koruması ve Spam Koruması süreleri komutlarda en fazla bir gün (`1d`) kabul eder ve Timeout hiçbir zaman 28 günü geçemez.
- Spam Koruması yalnızca aynı mesajların tekrarlarını sayar. Bir üyenin hızlıca on farklı mesaj göndermesi ona göre spam değildir; bunu Toplu Gönderi Koruması ve Toplu Etiket Koruması karşılar.
- **Yalnızca bağlantıları kontrol et** açıkken Toplu Gönderi Koruması bağlantısız her şeyi yok sayar. Kopyala-yapıştır metinleri yakalamak için kapat, ama yoğun sunucularda daha fazla yanlış pozitif bekle.
- Desen Koruması'nın toplu oluşturma kontrolü her katılımda tüm üye listesini çeker; çok büyük sunucularda bu yavaş olabilir.
- Görselin kendisi yerine hash'inden eklenen bir engelleme yalnızca birebir kopyaları yakalar; aynalanmış ve çerçeveli sürümleri de kapsamak için görselin kendisinden yeniden ekle.
- Koruma kontrol panelinden etkinleştirildiğinde başlangıç değerleri uygulanır. Özellikle Ban seçmeden önce **Yapılandır**'ı açıp işlemi doğrula.
- Otomatik atama, kendi kendine atama ve tepki rolü komutları, sen sahip değilsen kendi en yüksek rolünüze eşit veya ondan üstte olan rolleri reddeder.
- Mesaj silinirse tepki rolleri kaybolur; `reactionroleslist` silinmiş bir mesaja işaret eden kurulumları gösterir.
- Toplu yeniden adlandırma, botun adını değiştirebildiği herkese dokunur; altındaki yetkililer dahil. Geri almak için bir planın olsun.
- `delete` ve `edit` yalnızca botun görebildiği mesajlarda çalışır; `edit` yalnızca botun kendi mesajlarında çalışır.

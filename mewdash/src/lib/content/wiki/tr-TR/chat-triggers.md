---
title: Tetikleyiciler
slug: chat-triggers
summary: Mesajlara, tepkilere, slash komutlarına ve bot olaylarına otomatik yanıtlar; koşullar, maliyetler, sayaçlar, rol verme ve tam bir yer tutucu seti ile.
icon: fa-comments
category: Actions
dashboard: /dashboard/chat-triggers
module: ChatTriggers
tags: [chat triggers, triggers, autoresponder, custom commands, auto reply, reaction roles, regex, counters, placeholders, event triggers, sohbet tetikleyicileri, tetikleyiciler, otomatik yanıt, özel komutlar, otomatik cevap, tepki rolleri, düzenli ifade, sayaçlar, yer tutucular, olay tetikleyicileri]
related: [administration, xp, currency, tickets, giveaways]
---

## Ne işe yarar

Tetikleyici, botun izlediği bir metin ve bu metni gördüğünde gönderdiği bir yanıttır. En basit haliyle bir üye `hello` yazar, bot `hi there` diye yanıt verir. Buradan ileri giden bir tetikleyici mesajın herhangi bir yerinde ya da düzenli ifadeyle eşleşebilir, bir embed ile yanıt verebilir, emoji ile tepki verebilir, yanıtı DM olarak gönderebilir, üyenin mesajını silebilir, rol verebilir ya da alabilir, yanıtın bir kopyasını başka bir kanala ya da webhook'a gönderebilir ve bittiğinde ikinci bir tetikleyici çalıştırabilir.

Tetikleyiciler yalnızca mesajlardan oluşmak zorunda değildir. Aynı tetikleyici slash, mesaj veya kullanıcı bağlam komutu olarak kaydedilebilir, belirli bir tepki eklendiğinde ya da kaldırıldığında çalışabilir veya bir bot olayında tetiklenebilir; örneğin seviye atlama, bir üyenin katılması, bir boost'un başlaması, bir biletin açılması ya da bir çekilişi kazanma.

Her tetikleyicinin kendi koşulları vardır: kullanıcı, kanal veya sunucu başına bekleme süresi, gereken XP seviyesi, para maliyeti veya ödülü, aktif saatler ve günler, son kullanma tarihi, kullanım sınırı, minimum hesap yaşı veya sunucuda geçirilen minimum süre ve belirli bir aralıkta olması gereken bir sayaç. Bir koşul sağlanmazsa tetikleyici sessiz kalır ya da sizin yazdığınız bir mesajı gösterir. Kontrol panelindeki test aracı, bir örnek mesajın hangi kuralla engelleneceğini tam olarak söyler.

Yanıtlar botun geri kalanındaki değerleri de okuyabilir: üyenin seviyesi, bakiyesi, itibarı veya mesaj sayısı, tetikleyiciden sonra yazılan metin, etiketlenen kişiler, yanıtlanan mesaj, regex yakalama grupları ve bir yanıtın okuyabildiği ve artırabildiği sunucu genelindeki sayaçlar.

## Neden kullanmalısınız

- Sık sorulan soruları otomatik yanıtlamak için: `!rules` kuralların embed'ini gönderir.
- Üyelerin botun yerleşik komut setinde olmayan eğlenceli komutları ücretsiz kullanabilmesi için.
- Bir `daily` tarzı tetikleyici, bekleme süresi ve ödül kullanarak kullanıcıya günde bir kez para ödemek için.
- Bir "verify" kelimesinin rol verip mesajı silmesi için.
- Belirli bir emojiyle tepki veren birine rol veren tepki rolleri için.
- Mesajla değil olayla tetiklenen, istediğiniz biçimde hazırlanmış özel seviye atlama, karşılama veya boost duyuruları için.
- Herkesin bir kelimeyle artırabileceği "son olaydan bu yana geçen gün" gibi çalışan sayaçlar için.

## Tetikleyici türleri

Bir tetikleyicinin etkin türleri kümesi vardır. Tür, tetikleyiciyi neyin çalıştırabileceğini belirler. Mesaj varsayılan olarak açıktır; diğerleri her tetikleyici için `chattriggervalidtype` komutuyla ya da kontrol panelindeki anahtarlarla etkinleştirilir.

| Tür | Ne zaman çalışır |
| --- | --- |
| Mesaj | Bir mesaj tetikleyici metniyle eşleşir |
| Etkileşim | Birisi tetikleyici için kayıtlı slash, mesaj veya kullanıcı komutunu çalıştırır |
| Düğme | Kimliği tetikleyiciyle eşleşen bir düğme bileşenine basılır |
| Tepkiler | Birisi mesaja tetikleyicinin emojisini ekler |
| ReactionsRemoved | Birisi mesajdan tetikleyicinin emojisini kaldırır |
| Olay | Aşağıdaki bot olaylarından biri gerçekleşir |

### Mesaj eşleştirme

Varsayılan olarak, küçük harfe çevrilmiş tüm mesaj tetikleyiciye eşit olmalıdır. İki seçenek bunu gevşetir:

- **Mesajın herhangi bir yerinde eşleş** (`ctca`): tetikleyici, mesajın bir yerinde tam bir kelime olarak geçmelidir.
- **Birini hedeflemeye izin ver** (`ctat`): mesaj tetikleyiciyle başlayabilir, ardından bir boşluk ve daha fazla metin gelebilir; bu metin `%target%` olur.

**Düzenli ifade** tetikleyicileri (`addchattriggerregex`) mesajı bir desenle eşleştirir. Her desen 100 milisaniye süre alır; zaman aşımına uğrayan desen atlanır. Adlandırılmış veya numaralandırılmış yakalama grupları yanıtta `%regex.1%` ya da `%regex.name%` olarak kullanılabilir.

**Önek şartı**, eşleşmeden önce mesajın bir öneki ile başlayıp başlamayacağını belirler:

| Seçenek | Davranış |
| --- | --- |
| Önek gerekmez | Düz metinle eşleşir (varsayılan) |
| Genel önek | Botun genel önekiyle başlamalıdır |
| Sunucu öneki veya genel | Sunucu öneki ile başlamalıdır, yoksa genel öneke geri döner |
| Ayarlıysa sunucu öneki | Sunucu öneki ile başlamalıdır; sunucunun öneki yoksa asla eşleşmez |
| Özel bir önek | `ctprefix` ile ayarlanan önekle başlamalıdır |

Bir mesajla birden fazla tetikleyici eşleşirse, bunlardan biri rastgele seçilir. Bot ve webhook mesajları, bir tetikleyicide **Yalnızca botlar** (`ctallowbots`) açık değilse yok sayılır; bu tür bir tetikleyici ise yalnızca bot mesajlarına yanıt verir. Bot kendi mesajlarına asla yanıt vermez.

### Etkileşim tetikleyicileri

`setctintertype` tetikleyiciyi bir Slash, Message veya User uygulama komutu olarak kaydeder. `setctintername` ve `setctinterdesc` adını ve açıklamasını belirler; adlar Discord'un komut adlandırma kurallarına uymalıdır. `ctinterephemeral`, yanıtın yalnızca komutu çalıştıran kişiye görünmesini sağlar. `ctintererrors`, kaydın neden başarısız olduğunu listeler; örneğin yinelenen adlar veya çok fazla alt komut.

### Tepki tetikleyicileri

`addreactiontrigger <emoji> <response>` metni emoji olan bir tetikleyici oluşturur. Türleri olarak **Tepki eklendi** veya **Tepki kaldırıldı** seçeneğini açın. Yanıt, tepki verilen mesajın kanalına gönderilir; rol verme işlemi tepki veren üyeye uygulanır (ya da **Etiketledikleri kişiler** seçiliyse tepki verilen mesajdaki etiketlere). Bot tepkileri yok sayılır.

### Olay tetikleyicileri

`ctevent <id> <event>` tetikleyicinin bir mesaj yerine bir olayda çalışmasını sağlar ve tetikleyici için Olay türünü açar. Olaylar:

| Olay | Şunlar için çalışır |
| --- | --- |
| XpLevelUp | Bir üye seviye atlar |
| XpLevelDown | Bir üye seviye kaybeder |
| MemberJoin | Bir üye katılır |
| MemberLeave | Bir üye ayrılır |
| VoiceJoin | Bir üye bir ses kanalına katılır |
| VoiceLeave | Bir üye bir ses kanalından ayrılır |
| Boost | Bir üye boost yapmaya başlar |
| BoostEnd | Bir üye boost yapmayı bırakır |
| TicketOpened | Bir bilet açılır |
| TicketClosed | Bir bilet kapatılır |
| GiveawayWon | Bir üye çekilişi kazanır |

Yanıt, `cteventchannel` ile ayarlanan kanala gider; ayarlanmamışsa olayın gerçekleştiği kanala gider. Katılma, ayrılma, ses ve boost olaylarının kendi kanalı yoktur, bu yüzden bu tetikleyicilerin açık bir kanala ihtiyacı vardır, yoksa hiçbir şey yapmazlar. Olay tetikleyicileri, mesaj tetikleyicileriyle aynı koşullardan ve ekonomi kontrollerinden geçer; olayla ilgili üye, yer tutucular ve rol verme için kullanıcı kabul edilir.

## Yanıtlar

Birincil yanıt, tetikleyici oluşturulurken verilen metindir. Bu metin embed ayrıştırıcısından geçer; bu yüzden düz metin, bir embed, birden fazla embed veya kontrol panelindeki embed düzenleyicisinde oluşturulan bileşenler olabilir. `ctaddresponse` ile ek yanıtlar eklenebilir; **Birden fazla yanıt olduğunda** ayarı hangilerinin gönderileceğini belirler:

| Mod | Davranış |
| --- | --- |
| Single | Her zaman ilk yanıt (varsayılan) |
| Random | Rastgele biri; bir satırı tekrar yazarak ağırlığını artırabilirsiniz |
| RoundRobin | Sırayla, her kullanımda bir tane; sunucu genelinde paylaşılır |
| All | Her yanıt, sırayla |

Teslim seçenekleri, hepsi varsayılan olarak kapalı:

- **Mesaja yanıt olarak gönder** (`ctreply`): yanıtı bir Discord yanıtı olarak gönderir.
- **Yanıtı DM olarak gönder** (`ctdm`): yanıtı üyeye özel olarak gönderir.
- **Tetikleyen mesajı sil** (`ctad`): yazdıklarını kaldırır.
- **Yanıt yerine mesaja tepki ver** (`rtt`): yanıt yerine tetikleyicinin emojisini üyenin mesajına koyar. Silme ile birlikte kullanılamaz.
- **Hiç mesaj gönderme** (`ctnr`): yalnızca rol veren tetikleyiciler için kullanışlıdır.
- **Yanıtı şu süreden sonra sil** (`ctdeleteafter`): botun yanıtının silinmesinden önceki saniye sayısı; 0 yanıtı tutar.
- **Tepki verilecek emoji** (`ctreact`): en fazla altı emoji, saniyede bir eklenir. Emoji verilmezse liste temizlenir.

### Çapraz gönderim

`ctcpch`, her yanıtın bir kopyasını sunucudaki başka bir kanala gönderir. `ctcpwh` aynı işi bir webhook URL'si üzerinden yapar; bu webhook başka bir sunucuda da olabilir. Çapraz gönderim, **Hiç mesaj gönderme** açık olsa bile gerçekleşir.

### Roller

**Verilecek roller** ve **Alınacak roller** (`ctrgranttoggle`, `ctrremovetoggle`), tetikleyici çalıştığında uygulanır. Aynı rol için komutu tekrar çalıştırmak, rolü listeden çıkarır. **Bu rolleri şuna uygula** (`chattriggerrolegranttype`) hedefi seçer:

| Hedef | Kimler etkilenir |
| --- | --- |
| Gönderen | Tetikleyiciyi çalıştıran üye (varsayılan) |
| Etiketlenen | Mesajda etiketlenen en fazla beş üye |
| İkisi de | Gönderen ve en fazla dört etiketlenen üye |

Hedef etiketleri içeriyorsa, eşleştirmeden önce mesajdan etiketler çıkarılır; böylece `verify @someone` yine `verify` tetikleyicisiyle eşleşir.

### Zincirleme

`ctchain <id> <nextId>`, ilk tetikleyici bittikten sonra ikinci bir tetikleyiciyi çalıştırır. İkinci tetikleyici kendi koşullarına ve maliyetlerine göre değerlendirilir. Bir zincir beş adımdan sonra durur ve daha önce çalıştırdığı bir tetikleyiciye asla geri dönmez.

## Koşullar

Bunların hepsi, bir şey ücretlendirilmeden, gönderilmeden veya sayılmadan önce kontrol edilir. Başarısız bir koşul tetikleyicinin sessizce çalışmamasıyla sonuçlanır; ancak seviye ve para kontrolleri bunun istisnasıdır: `ctreqmsg` ile **Kullanamadıklarında gösterilecek mesaj** ayarladıysanız o mesajı gösterirler.

| Koşul | Komut | Varsayılan | Davranış |
| --- | --- | --- | --- |
| Bekleme süresi | `ctcooldown <id> <seconds> [scope]` | yok | Bu kadar saniye boyunca tekrar çalışmasını engeller. Kapsam `User`, `Channel` veya `Guild` olabilir |
| Gereken seviye | `ctreqlevel <id> <level>` | 0 | Üyenin XP seviyesi en az bu olmalıdır |
| Maliyet | `ctcost <id> <amount>` | 0 | Üyeden alınan para; ödeyemezse çalışmaz |
| Ödül | `ctreward <id> <amount>` | 0 | Çalıştığında üyeye ödenen para |
| XP ödülü | `ctxpreward <id> <amount>` | 0 | Çalıştığında verilen XP |
| Aktif saatler | `cttime <id> <HH:mm> <HH:mm> [days...]` | her zaman | Yalnızca sunucunun saat diliminde belirlenen aralıkta çalışır. Bitiş başlangıçtan önceyse gece boyunca sürer. Günler ad olarak ya da 0 ile 6 arasında (Pazar 0) yazılır |
| Son kullanma | `ctexpiry <id> [duration]` | asla | Şu andan itibaren belirtilen süre sonra çalışmayı durdurur, örneğin `7d` |
| Kullanım sınırı | `ctmaxuses <id> <uses>` | sınırsız | Bu kadar çalıştırmadan sonra durur; 0 sınırı kaldırır |
| Minimum hesap yaşı | `ctminage <id> [duration]` | yok | Hesap en az bu kadar eski olmalıdır |
| Sunucuda minimum süre | `ctminmember <id> [duration]` | yok | Üye sunucuya en az bu kadar önce katılmış olmalıdır |
| Sayaç aralığı | `ctrequirecounter <id> <name> [min] [max]` | yok | Adlandırılmış sayaç bu aralıkta olmalıdır; ad olarak `clear` yazmak onu kaldırır |

Bekleme süresi, diğer tüm koşullar sağlandıktan sonra başlar; bu yüzden engellenen bir deneme bekleme süresini tüketmez. Maliyet, ödül ödenmeden önce alınır; bu yüzden hem maliyet hem ödül içeren bir tetikleyici, parası yetmeyen birine asla ödeme yapmaz. `cmdcd` ile ayarlanan sunucu genelindeki komut bekleme süreleri de tetikleyicilere uygulanır; tetikleyicinin kendi bekleme süresine ek olarak, kullanıcı başına.

## Sayaçlar

Sayaçlar sunucu başına saklanan adlandırılmış sayılardır. İlk kez bir yanıt tarafından kullanıldıklarında oluşturulurlar ve herhangi bir yanıttan okunabilir veya değiştirilebilirler:

| Yer tutucu | Etkisi |
| --- | --- |
| `%counter:name%` | Sayacı gösterir |
| `%counter:name+%` | Bir ekler ve yeni değeri gösterir |
| `%counter:name-%` | Bir çıkarır ve yeni değeri gösterir |
| `%usercounter:name%` | Tetikleyen üyenin o ada ait kendi değerini gösterir |
| `%usercounter:name+%` | Üyenin değerine bir ekler |
| `%usercounter:name-%` | Üyenin değerinden bir çıkarır |

Adlar en fazla 64 harf, rakam, alt çizgi veya kısa çizgiden oluşabilir ve büyük-küçük harf duyarsızdır. `ctcounters` adları listeler, `ctcounterset` bir sayacı tam bir değere ayarlar, `ctcounterdelete` ise sayacı ve o ad altındaki her kullanıcı değerini siler. Kontrol panelinin kenar çubuğunda aynı işlemler için **Sayaçlar** paneli vardır.

## Yer tutucular

Bir yanıt, genel yer tutucu setini (yer tutucular sayfasındaki kullanıcı, sunucu, kanal, bot ve zaman yer tutucuları), tetikleyiciye özgü yer tutucuları ve diğer modüllerin eklediği yer tutucuları kullanabilir. `ctplaceholders` eklenen yer tutucuları anlık olarak listeler.

| Yer tutucu | Değer |
| --- | --- |
| `%target%` | Tetikleyiciden sonra yazılan her şey (**Birini hedeflemeye izin ver** ya da mesajın herhangi bir yerinde eşleşme gerektirir) |
| `%targetuser%` | Mesajda etiketlenen ilk kişinin etiketi |
| `%targetuser.id%`, `%targetuser.name%`, `%targetuser.avatar%` | O kişinin kimliği, kullanıcı adı ve avatarı |
| `%targetusers%`, `%targetusers.id%` | Etiketlenen herkes, etiket veya kimlik olarak |
| `%replied.content%` | Üyenin yanıtladığı mesajın içeriği |
| `%replied.author%`, `%replied.author.id%` | O mesajın yazarı |
| `%usecount%` | Bu tetikleyicinin kaç kez çalıştığı |
| `%regex.1%`, `%regex.name%` | Düzenli ifade tetikleyicisinin yakalama grupları |
| `%img:tag%` | Bu etiket için rastgele bir Imgur resmi |
| `%rng%` | Genel yer tutucu setinden rastgele bir sayı |
| `%xp.level%`, `%xp.rank%`, `%xp.total%`, `%xp.current%`, `%xp.required%`, `%xp.remaining%`, `%xp.bonus%` | Üyenin XP istatistikleri |
| `%targetuser.xp.level%`, `%targetuser.xp.rank%`, `%targetuser.xp.total%` | Etiketlenen kişinin XP istatistikleri |
| `%currency.balance%`, `%currency.bank%`, `%currency.total%`, `%currency.emote%` | Üyenin parası |
| `%targetuser.currency.balance%`, `%targetuser.currency.bank%` | Etiketlenen kişinin parası |
| `%rep%`, `%rep.rank%`, `%targetuser.rep%`, `%targetuser.rep.rank%` | İtibar |
| `%messages%`, `%messages.channel%`, `%messages.server%`, `%targetuser.messages%` | Mesaj sayıları |
| `%invites%`, `%targetuser.invites%`, `%inviter%` | Davet sayıları ve üyeyi kimin davet ettiği |
| `%targetuser.afk%` | Etiketlenen kişinin AFK mesajı |
| `%counter:name%` ve benzerleri | Yukarıdaki gibi sayaçlar |

`%target%` içindeki etiketler, üyenin kendisi herkesi etiketleyebilmiyorsa etkisiz hale getirilir.

> [!EXAMPLE]
> Tetikleyici `daily`, yanıt `%user.mention% claimed today's bonus. Balance: %currency.balance%`, ayrıca `ctreward 12 100`, `ctcooldown 12 86400 User` ve `ctreqmsg 12 Come back tomorrow.`

## Test aracı

`cttest <id> <sample message>` komutu ya da bir tetikleyici kartındaki **Bu tetikleyiciyi test et** kutusu, belirtilen örnek mesajın sizin olarak bu tetikleyiciyi çalıştırıp çalıştırmayacağını kontrol eder; hiçbir şey göndermez, ücretlendirmez veya saymaz. Metnin eşleşip eşleşmediğini bildirir; tetikleyici çalışmayacaksa hangi kuralın engellediğini de söyler: devre dışı, yalnızca botlar, eşleşme yok, izin girdisi, izin geçersiz kılma, son kullanma, bekleme süresi, sayaç, kullanım sınırı, aktif saatler, hesap yaşı, üyelik, seviye, bakiye veya sunucu komutu bekleme süresi.

## Kategoriler ve düzenleme

`ctcategory <id> <name>` tetikleyiciyi bir kategoriye koyar. `ctcategorytoggle <name> <true or false>` o kategorideki tüm tetikleyicileri tek seferde etkinleştirir veya devre dışı bırakır; kontrol panelinin kenar çubuğu da kategoriye göre filtreler. `cttoggle` tek bir tetikleyiciyi silmeden duraklatır. `ctstats` bir tetikleyicinin kaç kez çalıştığını ve son zamanlarda kimlerin çalıştırdığını gösterir.

`ctsexport` tüm tetikleyicileri bir YAML dosyası olarak indirir; `ctsimport` bir ekten ya da URL'den birini yükler. `ctsclear` onay sonrası tüm tetikleyicileri siler.

## Ayarlar

Her şey tetikleyici başınadır. Tetikleyiciler sayfasında **Basit Mod** bulunur; bunda **Hızlı Kurulum** formu (tetikleyici metni ve yanıt) vardır. **Gelişmiş Mod** ise **Gelişmiş Tetikleyici Oluşturma** içerir; burada **Desen Türü** (Normal Metin Deseni veya Düzenli İfade Deseni), tetikleyici türleri seçilir ve kaydetmeden önce bir regex test edilebilir.

Her tetikleyici kartı açıldığında **Tetikleyici Metni**, **Yanıt Mesajı** düzenleyicisi, test aracı ve konularına göre gruplanmış bir ayar akordeonu gösterir:

| Grup | Ayarlar |
| --- | --- |
| Ne zaman eşleşir | Önek şartı, Özel önek, Mesajın herhangi bir yerinde eşleş, Birini hedeflemeye izin ver, Yalnızca bot sahibi |
| Nasıl yanıt verir | Mesaja yanıt olarak gönder, Yanıtı DM olarak gönder, Tetikleyen mesajı sil, Yanıt yerine mesaja tepki ver, Hiç mesaj gönderme, Tepki verilecek emoji, Yanıtı şu süreden sonra sil, Ek yanıtlar, Birden fazla yanıt olduğunda |
| Roller | Verilecek roller, Alınacak roller, Bu rolleri şuna uygula |
| Sınırlar | Bekleme süresi (saniye), Bekleme süresi şunlara uygulanır, Bu kadar kullanımdan sonra dur, Şu süreden sonra çalışmayı durdur, Minimum hesap yaşı (dakika), Sunucuda geçen en kısa süre (dakika), Yalnızca belirli saatlerde aktif (Kimden, Şuna kadar) ve Bu günlerde |
| Maliyetler ve ödüller | Kullanıcıdan alınan miktar, Kullanıcıya ödenen, XP verir, Gereken seviye, Kullanamadıklarında gösterilecek mesaj |
| Sayaç şartı | Sayaç adı, En az, En fazla |
| Bir olayda çalıştır | Şu durumda çalıştır, Şurada yanıt ver |
| Düzenleme | Kategori, Ardından tetikleyiciyi çalıştır, İnsanlar yerine botlara yanıt ver |

Kenar çubuğunda kategoriler, **Sayaçlar** ve canlı **Yer tutucular** listesi bulunur; ayrıca tetikleyicileri ve yanıtları aramak için bir arama kutusu vardır.

## Kurulum adımları

1. Kontrol panelinde **Tetikleyiciler** sayfasını açın. **Basit Mod**'da tetikleyici kelimesini yazın, yanıtı düzenleyicide oluşturun ve tetikleyiciyi kaydedin.
2. Yeni kartı açın. **Ne zaman eşleşir** altında, kelimenin cümlenin ortasında da çalışmasını istiyorsanız **Mesajın herhangi bir yerinde eşleş** seçeneğini açın.
3. **Nasıl yanıt verir** altında yanıt verip vermeyeceğinize, DM göndermek mi yoksa üyenin mesajını silmek mi istediğinize karar verin.
4. **Sınırlar** altında, spam yapılamaması için bir bekleme süresi ayarlayın.
5. **Bu tetikleyiciyi test et** kutusuna örnek bir mesaj yazın ve **Test**'e basın. Engelleyen her şeyi düzeltin.
6. Seviye atlama duyurusu için, herhangi bir metinle bir tetikleyici oluşturun, **Şu durumda çalıştır** alanını "Üye seviye atlar" yapın, **Şurada yanıt ver** alanını boş bırakarak üyenin konuştuğu yere gönderin ve yanıtta `%user.mention%` ile `%xp.level%` kullanın.
7. İlgili tetikleyicilere bir **Kategori** verin, böylece hepsini birlikte duraklatabilirsiniz.

## Komutlar

Bu komutları sunucunuzun önekiyle çalıştırın (değiştirmediyseniz `.`). Tetikleyici kimlikleri `listchattriggers` ile görülür.

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `addchattrigger <trigger> <response>` | `act`, `acr` | Yönetici | Tetikleyici oluşturur; birden fazla kelimeli tetikleyicileri tırnak içine alın |
| `addchattriggerregex <pattern> <response>` | `actr` | Yönetici | Düzenli ifade tetikleyicisi oluşturur |
| `addreactiontrigger <emoji> <response>` | `addrt` | Yönetici | Tepki tetikleyicisi oluşturur |
| `editchattrigger <id> <response>` | `ect` | Yönetici | Birincil yanıtı değiştirir |
| `deletechattrigger <id>` | `dct` | Yönetici | Tetikleyiciyi siler |
| `listchattriggers` | `lct` | Yönetici | Tetikleyicileri kimlikleriyle listeler |
| `listchattriggersgroup` | `lctg` | Yönetici | Tetikleyicileri metne göre gruplayarak listeler |
| `showchattrigger <id>` | `sct` | Yönetici | Bir tetikleyicinin ayarlarını gösterir |
| `cttoggle <id>` | `chattriggertoggle` | Yönetici | Tetikleyiciyi duraklatır ya da devam ettirir |
| `ctca <id>` | | Yönetici | Mesajın herhangi bir yerinde eşleşmeyi açar/kapatır |
| `ctat <id>` | | Yönetici | Hedefleme iznini açar/kapatır |
| `ctdm <id>` | | Yönetici | DM yanıtını açar/kapatır |
| `ctad <id>` | | Yönetici | Tetikleyen mesajı silmeyi açar/kapatır |
| `rtt <id>` | `reactottrigger` | Yönetici | Yanıt yerine mesaja tepki vermeyi açar/kapatır |
| `ctnr <id>` | `chattriggernoresponse` | Yönetici | Hiç mesaj göndermemeyi açar/kapatır |
| `ctreply <id>` | `chattriggerreply` | Yönetici | Mesaja yanıt olarak göndermeyi açar/kapatır |
| `ctdeleteafter <id> <seconds>` | `chattriggerdeleteafter` | Yönetici | Yanıtı belirli bir süre sonra siler |
| `ctreact <id> [emoji...]` | `ctr` | Yönetici | En fazla altı tepki ayarlar ya da temizler |
| `ctaddresponse <id> <response>` | `chattriggeraddresponse` | Yönetici | Ek bir yanıt ekler |
| `ctclearresponses <id>` | `chattriggerclearresponses` | Yönetici | Ek yanıtları kaldırır |
| `ctresponsemode <id> <mode>` | `chattriggerresponsemode` | Yönetici | `Single`, `Random`, `RoundRobin` veya `All` |
| `ctprefixtype <id> <type>` | `chattriggersprefixtype` | Yönetici | `None`, `Global`, `GuildOrGlobal`, `GuildOrNone` veya `Custom` |
| `ctprefix <id> <prefix>` | `chattriggersprefix` | Yönetici | Özel önek belirler |
| `chattriggervalidtype <id> <type> <true or false>` | `ctvalidtype`, `ctvt` | Yönetici | Bir tetikleyici türünü etkinleştirir veya devre dışı bırakır |
| `ctallowbots <id>` | `chattriggerallowbots` | Yönetici | Yalnızca bot mesajlarına yanıt vermeyi açar/kapatır |
| `ctrgranttoggle <id> @role` | `ctgt`, `ctgranttoggle` | Yönetici | Verilecek rolü açar/kapatır |
| `ctrremovetoggle <id> @role` | `ctrt`, `ctremovetoggle` | Yönetici | Alınacak rolü açar/kapatır |
| `chattriggerrolegranttype <id> <type>` | `ctrolegranttype`, `ctrgt` | Yönetici | `Sender`, `Mentioned` veya `Both` |
| `chattriggerscrosspostchannel <id> <#channel>` | `ctcpch`, `ctcpchannel`, `ctcrosspostchannel`, `ctcrosspostch` | Yönetici | Bir kanala çapraz gönderim yapar |
| `chattriggerscrosspostwebhook <id> <url>` | `ctcpwh`, `ctcpwebhook`, `ctcrosspostwebhook`, `ctcrosspostwh` | Yönetici | Bir webhook üzerinden çapraz gönderim yapar |
| `setctintertype <id> <type>` | `ctitype`, `ctintertype` | Yönetici | `None`, `Slash`, `Message` veya `User` |
| `setctintername <id> <name>` | `ctiname`, `ctrealname` | Yönetici | Uygulama komutunun adı |
| `setctinterdesc <id> <description>` | `ctidesc`, `ctinterdesc` | Yönetici | Uygulama komutunun açıklaması |
| `ctinterephemeral <id> <true or false>` | `ctieph` | Yönetici | Etkileşim yanıtını geçici yapar |
| `ctintererrors` | `ctierrors`, `ctie` | Yönetici | Komut kaydı hatalarını gösterir |
| `ctevent <id> <event>` | `chattriggerevent` | Yönetici | Bir olayda çalıştırır; durdurmak için `None` |
| `cteventchannel <id> [#channel]` | `chattriggereventchannel` | Yönetici | Olay yanıtlarının kanalı |
| `ctcooldown <id> <seconds> [scope]` | `chattriggercooldown` | Yönetici | Tetikleyiciye özel bekleme süresi |
| `ctreqlevel <id> <level>` | `chattriggerrequiredlevel` | Yönetici | Gereken XP seviyesi |
| `ctcost <id> <amount>` | `chattriggercost` | Yönetici | Para maliyeti |
| `ctreward <id> <amount>` | `chattriggerreward` | Yönetici | Para ödülü |
| `ctxpreward <id> <amount>` | `chattriggerxpreward` | Yönetici | XP ödülü |
| `ctreqmsg <id> [message]` | `chattriggerrequirementmessage` | Yönetici | Bir koşul başarısız olduğunda gösterilen mesaj |
| `cttime <id> <start> <end> [days...]` | `chattriggertime` | Yönetici | Aktif saatler ya da `cttime <id> clear` |
| `ctexpiry <id> [duration]` | `chattriggerexpiry` | Yönetici | Son kullanma ya da temizlemek için hiçbiri |
| `ctmaxuses <id> <uses>` | `chattriggermaxuses` | Yönetici | Kullanım sınırı; sınırsız için 0 |
| `ctminage <id> [duration]` | `chattriggerminimumage` | Yönetici | Minimum hesap yaşı |
| `ctminmember <id> [duration]` | `chattriggerminimummembership` | Yönetici | Sunucuda minimum süre |
| `ctrequirecounter <id> <name> [min] [max]` | `chattriggerrequirecounter` | Yönetici | Sayaç aralığı şartı |
| `ctcounters` | `chattriggercounters` | Hiç kimse | Sayaçları listeler |
| `ctcounterset <name> <value>` | `chattriggercounterset` | Yönetici | Bir sayacı ayarlar |
| `ctcounterdelete <name>` | `chattriggercounterdelete` | Yönetici | Bir sayacı siler |
| `ctplaceholders` | `chattriggerplaceholders` | Hiç kimse | Eklenen yer tutucuları listeler |
| `ctcategory <id> [name]` | `chattriggercategory` | Yönetici | Kategori belirler ya da temizler |
| `ctcategorytoggle <name> <true or false>` | `chattriggercategorytoggle` | Yönetici | Bir kategoriyi etkinleştirir veya devre dışı bırakır |
| `ctchain <id> <nextId>` | `chattriggerchain` | Yönetici | Başka bir tetikleyiciye zincirler; temizlemek için 0 |
| `cttest <id> <sample>` | `chattriggertest` | Yönetici | Bir örnek mesajı kuru çalıştırır |
| `ctstats <id>` | `chattriggerstats` | Yönetici | Çalışma sayısı ve son kullanıcılar |
| `ctsexport` | | Yönetici | Tetikleyicileri YAML olarak dışa aktarır |
| `ctsimport [url]` | | Yönetici | Bir URL'den ya da ekten içe aktarır |
| `ctsmigrate` | `ctsconvert` | Yönetici | Eski embed biçimini dönüştürür, yedekle birlikte |
| `ctsclear` | | Yönetici | Tüm tetikleyicileri siler |
| `ctsreload` | | Bot sahibi | Tetikleyicileri veritabanından yeniden yükler |

## İpuçları ve tuzaklar

- Tetikleyiciler küçük harfe çevrilmiş mesaj üzerinden eşleştirildiği için tetikleyici metni pratikte büyük-küçük harf duyarsızdır.
- **Mesajın herhangi bir yerinde eşleş** kapalıysa tüm mesajın tetikleyici olması gerekir. Bu seçeneği açmadan ya da hedeflemeyi etkinleştirmeden `hello there` mesajı `hello` tetikleyicisini çalıştırmaz.
- Rol verme için Rolleri Yönet izni ve botun rolünün, ilgili rollerin üstünde olması gerekir. Listeye bir rol ekleyen komut ayrıca o rolü yönetebildiğinizi de kontrol eder.
- Yalnızca botlar için olan tetikleyiciler insanlara asla yanıt vermez; insanlar için olan tetikleyiciler de botlara yanıt vermez. Tek bir tetikleyici ikisini birden yapamaz.
- Bekleme süreleri bellekte tutulur ve bot yeniden başladığında sıfırlanır. Kullanım sınırları ve son kullanma tarihleri saklanır ve yeniden başlatmadan sonra da geçerli kalır.
- Round robin sırası, üye başına değil, sunucudaki herkes için ortaktır.
- Modül `ActualChatTriggers` için izin sistemi girdileri ve tetikleyici metni için herhangi bir `permoverride`, tetikleyicinin kendi koşullarından önce kontrol edilir.
- Etkileşim tetikleyicileri gerçek uygulama komutlarını kaydeder; bu yüzden Discord'un komut sayısı ve ad sınırları geçerlidir. Bir komut görünmüyorsa `ctintererrors` komutunu kontrol edin.
- Yanıttaki tepkiler saniyede bir eklenir; bu yüzden altı emoji görünmesi altı saniye sürer.
- Katılma, ayrılma, ses ve boost için olan olay tetikleyicileri, **Şurada yanıt ver** ayarlanana kadar sessizce hiçbir şey yapmaz.

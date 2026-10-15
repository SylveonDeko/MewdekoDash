---
title: Twitch Botu
slug: twitch
summary: Mewdeko'yu kendi Twitch sohbetinde özel komutlar, zamanlayıcılar, alıntılar ve sayaçlarla çalıştır; abonelikleri, baskınları, kanal puanı kullanımlarını ve yayın başladı olaylarını Discord'a yönlendir.
icon: fa-brands fa-twitch
category: Community
dashboard: /dashboard/twitch
module: Twitch
tags: [twitch, chat bot, streamer, commands, timers, quotes, counters, channel points, redemptions, subs, raids, account link, role sync, eventsub, twitch, sohbet botu, yayıncı, komutlar, zamanlayıcılar, alıntılar, sayaçlar, kanal puanları, kullanımlar, abonelikler, baskınlar, hesap bağlantısı, rol senkronizasyonu, eventsub]
related: [streams, administration]
---

## Ne yapar

Twitch Botu, tek bir Twitch kanalını Discord sunucunuza bağlar ve Mewdeko'nun o kanalda sohbet botu gibi davranmasını sağlar. İzleyiciler Twitch sohbetinde `!ping`, `!quote`, `!counter deaths` veya kendi özel komutlarını yazar ve bot orada yanıt verir. Zamanlayıcılar yayındayken tekrarlayan mesajlar gönderir, alıntılar ve sayaçlar sunucu başına saklanır, kanal puanı ödülleri sohbette bir yanıt veya bir Discord gönderisi tetikleyebilir.

Kanaldaki olaylar Discord'a geri akar. Kanal yayına geçtiğinde bir Discord kanalına yayın başladı gönderisi atılır; aboneler, hediye abonelikler ve baskınlar kendi şablonlarınla kendi kanallarına yazabilir; yayın sonunda süre, en yüksek izleyici sayısı, sohbet mesajları, abonelikler ve baskınları özetleyen bir döküm gönderilebilir.

İzleyiciler Twitch hesaplarını Discord hesaplarına bağlayabilir. Bağlandıktan sonra bot, Twitch'te hangi Discord üyesinin sohbet ettiğini bilir ve rol senkronizasyonu aboneler, VIP'ler, moderatörler veya yayıncı için Discord rolleri verebilir.

> [!NOTE]
> Bu, Yayın Uyarıları ile aynı şey değildir. Yayın Uyarıları birden fazla platformdaki herkese açık kanalları izler ve yayına geçtiklerinde duyurur. Twitch Botu ise kendi Twitch hesabını yetkilendirmeni ister ve bota kendi sohbetinde yer verir. Aynı Twitch kanalı için ikisi de kuruluysa Twitch Botu'nun yayın başladı gönderisi, Yayın Uyarıları gönderisinin yerini alır; böylece iki kez bildirim gelmez.

## Neden kullanırsın

- Twitch'te yayın yapıyorsun ve hem Discord'da hem Twitch sohbetinde aynı özel komutlar ve sosyal medya bağlantılarıyla tek bir bot istiyorsun.
- Abonelerin ve baskınların gerçekleştiği anda Discord'da kutlanmasını istiyorsun.
- Abone veya VIP rollerini elle dağıtmadan Discord'da vermek istiyorsun.
- Su iç veya esneme gibi bir kanal puanı ödülünün sohbette gerçekten bir şey söylemesini ve Discord'a kaydedilmesini istiyorsun.
- Moderatörlerinin bir selamlama komutuna, bir baskın hedef seçicisine ve yayınlar arasında kalıcı bir alıntı listesine ihtiyacı var.

## Bağlanma

Burada iki Twitch yetkilendirmesi söz konusudur; ikisi de **Kurulum** sekmesindeki **Bağlan** alt sekmesinden yapılır.

| Yetkilendirme | Kimin yapacağı | Ne verir |
| --- | --- | --- |
| Bot hesabı | Yalnızca bot sahibi | Botun sohbet ettiği Twitch hesabı. Kapsamlar `user:read:chat`, `user:write:chat`, `user:bot`. Tüm sunucular için tek ortak kimlik. |
| Yayıncı kanalı | Sen, yayıncı | Kanalının olaylarına erişim. Kapsamlar `channel:bot`, abonelikler, bitler, kullanımlar, anketler, tahminler, yayın yönetimi, klip düzenleme ve moderasyon. |

Entegrasyon, bir bot hesabı varsa, kanalın yetkilendirilmişse ve yapılandırma etkinleştirilmişse yapılandırılmış sayılır. **Sağlık** paneli aktarımı (EventSub WebSocket veya eski IRC), alınan son olayı, iki hesabın belirteç sona erme süresini gösterir; **Gelişmiş tanılama** altında ise eksik kapsamları ve kayıtlı EventSub aboneliklerini gösterir.

Kanalın bağlantısını kesmek yetkilendirmeni siler ve entegrasyonu devre dışı bırakır. Bot hesabının bağlantısını yalnızca bot sahipleri kesebilir.

## Twitch'te sohbet komutları

Bağlı her kanal bu yerleşik komutları alır. Önek varsayılan olarak `!`'dir ve beş karaktere kadar değiştirilebilir. Özel komutlar yalnızca adı hiçbir yerleşik komutla eşleşmezse aranır.

| Komut | Kimler kullanabilir | Ne yapar |
| --- | --- | --- |
| `!ping` | Herkes | Bir pong ile yanıt verir |
| `!uptime` | Herkes | Bot sürecinin ne kadar süredir çalıştığı |
| `!commands` | Herkes | Yerleşik ve etkin özel komutları listeler |
| `!discord` | Herkes | Komutu yazanın hangi Discord hesabıyla bağlı olduğunu gösterir |
| `!link` | Herkes | Hesap bağlantısı için altı haneli bir talep kodu üretir |
| `!rank` | Herkes | Komutu yazanın çözümlenmiş rütbesini gösterir |
| `!stream` | Herkes | Canlı durum, başlık, kategori, izleyiciler ve çalışma süresi ya da "offline" |
| `!schedule` | Herkes | Yetkililerin ayarladığı program mesajını gönderir |
| `!socials` | Herkes | Yetkililerin ayarladığı sosyal medya mesajını gönderir |
| `!quote [id]` | Herkes | Rastgele bir alıntı ya da numarasına göre belirli bir alıntı |
| `!quote add <text> [-- author]` | Moderatör | Alıntı kaydeder; isteğe bağlı olarak `--` sonrasında yazar eklenir |
| `!quote remove <id>` | Moderatör | Bir alıntıyı siler (`delete` de çalışır) |
| `!counter <name>` | Herkes | Bir sayacın değerini gösterir |
| `!counter <name> +` | Moderatör | Bir artırır (`++` veya `add` de çalışır); `-`, `--` veya `sub` bir azaltır; `reset` değeri 0 yapar; bir sayı doğrudan değer atar |
| `!so <user>` | Moderatör | Başka bir Twitch kanalına öne çıkarma yapar |
| `!raidtarget` | Moderatör | Baskın hedef listesinden rastgele bir kanal önerir |

### Rütbeler

Bir sohbet üyesinin rütbesi Twitch rozetlerinden gelir. En yüksek rütbe Yayıncı'dır, ardından Moderatör, VIP, Abone (kurucu rozetleri abone sayılır) ve en sonda Herkes gelir. Komutlar, özel komutlar ve rol senkronizasyonu hepsi bu sıraya göre karşılaştırılır; yani bir Moderatör, VIP, Abone veya Herkes olarak ayarlanmış her şeyi çalıştırabilir.

## Özel komutlar

Özel komutlar panelde **Komutlar** altındaki **Özel Komutlar** bölümünden veya `/twitch commands add` ile eklenir. Adlar küçük harfe çevrilir, en fazla 32 karakter olabilir ve harf, rakam, tire ve alt çizgi içerebilir. Her komutun bir **İzin** (Herkes, Abone, Vip, Moderatör, Yayıncı), 0 ile 86400 arasında bir **Bekleme süresi (saniye)** değeri, bir **Etkin** düğmesi ve bir **Yanıt** alanı vardır. Bekleme süresi kullanıcı başına değil, tüm kanal için ortaktır. Kullanım sayıları takip edilir ve listede gösterilir.

Panelde ayrıca bir **Test argümanları** alanı ve kaydetmeden önce oluşturulan yanıtı görmeni sağlayan bir önizleme bulunur.

### Yanıtlardaki yer tutucular

| Yer tutucu | Değer |
| --- | --- |
| `%user%` | Sohbet üyesinin Twitch girişi |
| `%display%` | Sohbet üyesinin görünen adı |
| `%channel%` | Twitch kanal girişin |
| `%args%` | Komut adından sonra yazılan her şey |
| `%target%` | Komut adından sonraki ilk kelime |
| `%discord%` | Sohbet üyesinin bağlı Discord kullanıcı kimliği ya da boş |
| `%random:a\|b\|c%` | Rastgele seçilen bir seçenek |
| `%count:name%` | Adlandırılmış sayacın güncel değeri |
| `%stream%` | `!stream` komutunun verdiği özetin aynısı |

> [!EXAMPLE]
> `!hug` komutunun yanıtı `%display% hugs %target%! That is hug number %count:hugs%.`

## Zamanlayıcılar

Zamanlayıcılar Twitch sohbetine belirli aralıklarla bir mesaj gönderir. Bunları **Komutlar** altındaki **Zamanlayıcılar** bölümünden veya `/twitch timers` ile yönet.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Zamanlayıcı adı | | Komutlarla aynı adlandırma kuralları |
| Aralık (dakika) | 10 | Gönderiler arasında 1 ile 1440 dakika |
| Minimum sohbet mesajı | 5 | Tekrar göndermeden önce son gönderimden beri gelmesi gereken sohbet mesajı sayısı; 0 bu kontrolü devre dışı bırakır |
| Yalnızca çevrimiçiyken | açık | Yalnızca kanal yayındayken gönder |
| Rastgele döndürme | kapalı | Sırayla döngü yerine rastgele bir satır seç |
| Etkin | açık | Zamanlayıcının çalışıp çalışmayacağı |
| Mesajlar | | Her satıra bir mesaj |

Zamanlayıcı, zamanlayıcıları her 30 saniyede bir kontrol eder. Zamanlayıcı satırları `%channel%`, `%url%`, `%stream%`, `%count:name%` ve `%random:a|b|c%` yer tutucularını destekler. `/twitch timers test` (veya panodaki test düğmesi) bir zamanlayıcıyı hemen gönderir.

## Alıntılar ve sayaçlar

Alıntılar metni, varsa yazarı ve kimin eklediğiyle birlikte saklanır. Panelin **Alıntılar** alt sekmesi yetkililerin alıntı eklemesine, aramasına ve silmesine izin verir; izleyiciler `!quote` kullanır. Sayaçlar, moderatörlerin sohbetten artırdığı basit adlandırılmış tam sayılardır; yetkililer `/twitch commands counter-set` ile değer atayabilir ve `counter-list` ile listeleyebilir.

## Discord'a olaylar

**Olaylar** sekmesindeki **Uyarılar** alt sekmesinde abonelik, baskın ve kanal puanı ayarları bulunur. Yayın başladı gönderisi ise **Kurulum** altındaki **Bot ayarları** içinde, **Olay yönlendirme** bölümünde yer alır.

### Yayın başladı ve kapandı

Kanal yayına geçtiğinde bot **Yayın başladı Discord kanalı**na gönderir. **Yayın başladı mesajı** boşsa, kanala bağlı yayıncının adını, başlığı yazar satırı olarak, durumu, izleyici sayısını, kategoriyi ve bir önizleme resmini içeren varsayılan bir embed gönderir. Özel bir mesaj embed oluşturucudan geçer; bu yüzden tam embedler ve bileşenler de çalışır. Kanal yayını bitirdiğinde aynı kanala kısa bir kırmızı "Offline" embed gönderilir.

| Yer tutucu | Değer |
| --- | --- |
| `%streamer%` | Yayıncının görünen adı |
| `%title%` | Yayın başlığı |
| `%game%` | Kategori adı |
| `%url%` | `https://twitch.tv/<channel>` |
| `%viewers%` | Güncel izleyici sayısı |

### Abonelikler ve baskınlar

Bunlar düz metin mesajlarıdır. Varsayılan abonelik mesajı: `%display% subscribed to %channel%!`, hediye abonelikler için ise `%display% received a gifted sub on %channel%!`. Varsayılan baskın mesajı: `%raider% raided %channel% with %viewers% viewers!`.

| Olay | Yer tutucular |
| --- | --- |
| Abonelik | `%user%`, `%display%`, `%channel%`, `%tier%` |
| Baskın | `%raider%`, `%channel%`, `%viewers%` |

Her uyarının panelde bir **Test gönder** düğmesi vardır; **Olay geçmişi** listesi ise son olayları ve test gönderimlerini gösterir.

### Kanal puanı eylemleri

**Kanal puanı eylemleri** altında bir **Ödül başlığı** (büyük/küçük harf duyarsız eşleşir) bir **Twitch yanıtı**na, bir **Discord kanalı**na ve bir **Discord mesajına** ya da ikisine birden eşlenir. Yer tutucular: `%user%`, `%display%`, `%channel%`, `%reward%`, `%input%` (izleyicinin yazdığı) ve `%url%`.

### Yayın dökümü

`/twitch events recap-channel`, yayın bittiğinde bir embed alacak bir kanal ayarlar: süre, en yüksek izleyici sayısı, sohbet mesajları, abonelikler, baskınlar ve son başlık ile kategori. Dökümler panelde yer almaz.

## Hesap bağlantısı ve rol senkronizasyonu

Bir Discord üyesini bir Twitch girişine bağlamanın iki yolu vardır:

1. Kendi kendine: izleyici Twitch sohbetine `!link` yazar, altı haneli bir kod alır ve on dakika içinde Discord'da `/twitch claim <code>` komutunu çalıştırır.
2. Yetkililer: **Hesap bağlantıları** sekmesi veya `/twitch links add @user twitchlogin`.

Her sunucuda bir Discord üyesi için yalnızca bir Twitch girişi olabilir. Bağlandıktan sonra o izleyici için `%discord%` dolar ve rol senkronizasyonu uygulanır.

Rol senkronizasyonu, `/twitch rolesync add` ile bir Twitch rütbesini bir Discord rolüne eşler. Bağlı bir izleyici her sohbet mesajı gönderdiğinde, rütbesi eşlemeye eşit veya üstündeyse bot rolü ekler, altındaysa rolü kaldırır. Rol senkronizasyonu yalnızca eğik çizgi komutlarıyla kullanılabilir.

## Canlı Araçlar

**Olaylar** sekmesindeki **Canlı Araçlar** alt sekmesi, kanal yetkilendirmeni kullanan yayın operatörü işlemlerini sunar: bot olarak sohbet mesajı göndermek, yayın işaretçisi oluşturmak, klip oluşturmak, anket başlatmak (satır başına bir seçenek, varsayılan 60 saniye) ve bir mesajı ID'siyle zaman aşımına uğratmak (varsayılan 600 saniye), yasaklamak, yasağı kaldırmak veya silmek. `/twitch stream-info` ve `/twitch clip`, başlık, kategori ve klip işlemlerini Discord'dan yapar.

## Ayarlar

**Kurulum** altındaki **Bot ayarları** bölümünde:

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Komut öneki | `!` | Twitch sohbet komutlarının öneki, en fazla 5 karakter |
| Dil geçersiz kılma | sunucu varsayılanı | Botun sohbet yanıtlarında kullanılan `de-DE` gibi BCP-47 etiketi |
| Bu sunucu için Twitch sohbet botunu etkinleştir | açık | Ana anahtar; kapatmak yapılandırmayı korur |
| Sohbet olayları için EventSub kullan | açık | Sohbet ve olayları EventSub üzerinden al; kapalıysa sohbet komutları çalışmaz |
| Yayın başladı Discord kanalı | yok | Yayın başladı ve kapandı gönderilerinin gideceği yer |
| Yayın başladı mesajı | varsayılan embed | Yayın başladı yer tutucularını içeren özel şablon |

**Olaylar** altındaki **Uyarılar** bölümünde: **Abone Discord kanalı**, **Abone mesajı**, **Baskın Discord kanalı**, **Baskın mesajı** ve kanal puanı eylem listesi bulunur.

## Kurulum adımları

1. Panelde **Twitch Botu**'nu aç. Önce bir bot sahibinin **Bot hesabı**'nı bağlamış olması gerekir; **Bağlan** alt sekmesi bunun var olup olmadığını gösterir.
2. **Kanalı bağla**'ya tıkla ve kendi Twitch hesabınla yetkilendir.
3. **Bot ayarları** içinde öneki ayarla, **Bu sunucu için Twitch sohbet botunu etkinleştir** seçeneğini aç, bir **Yayın başladı Discord kanalı** seç ve kaydet.
4. **Komutlar** içinde birkaç özel komut ve bir sosyal medya zamanlayıcısı ekle. Yer tutucuları kontrol etmek için **Test argümanları** ve önizlemeyi kullan.
5. **Olaylar** içindeki **Uyarılar** bölümünde abonelik ve baskın kanallarını seç ve her biri için **Test gönder**'e bas.
6. Bot dinliyor mu diye Twitch sohbetine `!ping` yaz; sonra kendini bağlamak için `!link` ve `/twitch claim` kullan.
7. İsteğe bağlı olarak `/twitch rolesync add Subscriber @Subs` çalıştır; böylece bağlı aboneler bir rol alır.

## Komutlar

Bu modül yalnızca eğik çizgi komutlarından oluşur. Bunları görmek için Discord'da `/twitch` yaz. Yanıtlar yalnızca sana görünür.

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `/twitch set <channel> [prefix]` | | Sunucuyu Yönet | Twitch kanalını ve önegi ayarla, entegrasyonu etkinleştir |
| `/twitch remove` | | Sunucuyu Yönet | Entegrasyonu devre dışı bırak ve kanaldan ayrıl |
| `/twitch enable` | | Sunucuyu Yönet | Entegrasyonu yeniden aç |
| `/twitch disable` | | Sunucuyu Yönet | Ayarları silmeden kapat |
| `/twitch config` | | Hiç kimse | Kanalı, önegi, etkin durumu, yayın başladı kanalını ve dili göster |
| `/twitch claim <code>` | | Hiç kimse | `!link` ile alınan bağlantı kodunu talep et |
| `/twitch stream-info [title] [category]` | | Sunucuyu Yönet | Yayın başlığını veya kategorisini güncelle |
| `/twitch clip` | | Sunucuyu Yönet | Mevcut yayından klip oluştur |
| `/twitch status` | | Sunucuyu Yönet | Sağlık özeti: hesaplar, belirteçler, EventSub durumu |
| `/twitch language <tag>` | | Sunucuyu Yönet | Sohbet yanıtlarının dili; boş bırakmak sıfırlar |
| `/twitch prefix <prefix>` | | Sunucuyu Yönet | Sohbet komut önekini değiştir |
| `/twitch commands add <name> <response> [permission] [cooldown]` | | Sunucuyu Yönet | Özel komut ekle veya güncelle |
| `/twitch commands remove <name>` | | Sunucuyu Yönet | Özel komutu sil |
| `/twitch commands list` | | Hiç kimse | İzin, bekleme süresi ve kullanım sayısıyla özel komutları listele |
| `/twitch commands counter-set <name> <value>` | | Sunucuyu Yönet | Bir sayaç ayarla |
| `/twitch commands counter-list` | | Hiç kimse | Sayaçları listele |
| `/twitch commands schedule-set <message>` | | Sunucuyu Yönet | `!schedule` yanıtını ayarla |
| `/twitch commands schedule-clear` | | Sunucuyu Yönet | Bunu temizle |
| `/twitch commands socials-set <message>` | | Sunucuyu Yönet | `!socials` yanıtını ayarla |
| `/twitch commands socials-clear` | | Sunucuyu Yönet | Bunu temizle |
| `/twitch timers add <name> <messages> [interval] [minchat] [onlineonly] [randomize]` | | Sunucuyu Yönet | Zamanlayıcı ekle veya güncelle |
| `/twitch timers remove <name>` | | Sunucuyu Yönet | Zamanlayıcıyı sil |
| `/twitch timers list` | | Hiç kimse | Zamanlayıcıları listele |
| `/twitch timers enable <name>` | | Sunucuyu Yönet | Zamanlayıcıyı etkinleştir |
| `/twitch timers disable <name>` | | Sunucuyu Yönet | Zamanlayıcıyı devre dışı bırak |
| `/twitch timers test <name>` | | Sunucuyu Yönet | Zamanlayıcıyı hemen gönder |
| `/twitch events golive-channel <channel> [message]` | | Sunucuyu Yönet | Yayın başladı kanalını ve şablonu ayarla |
| `/twitch events golive-clear` | | Sunucuyu Yönet | Yayın başladı kanalını temizle |
| `/twitch events sub-channel <channel> [message]` | | Sunucuyu Yönet | Abonelik kanalını ve şablonu ayarla |
| `/twitch events sub-clear` | | Sunucuyu Yönet | Abonelik gönderilerini devre dışı bırak |
| `/twitch events raid-channel <channel> [message]` | | Sunucuyu Yönet | Baskın kanalını ve şablonu ayarla |
| `/twitch events raid-clear` | | Sunucuyu Yönet | Baskın gönderilerini devre dışı bırak |
| `/twitch events recap-channel <channel>` | | Sunucuyu Yönet | Yayın dökümü kanalını ayarla |
| `/twitch events recap-clear` | | Sunucuyu Yönet | Dökümleri devre dışı bırak |
| `/twitch links add <@user> <twitchlogin>` | | Sunucuyu Yönet | Bir üyeyi bir Twitch girişine bağla |
| `/twitch links remove <@user>` | | Sunucuyu Yönet | Bir üyenin bağlantısını kaldır |
| `/twitch links list` | | Hiç kimse | Tüm bağlantıları listele |
| `/twitch rolesync add <rank> <@role>` | | Sunucuyu Yönet | Bir rütbeye eşit veya üstünde olan bağlı izleyicilere bir rol ver |
| `/twitch rolesync remove <rank> <@role>` | | Sunucuyu Yönet | Bir eşlemeyi kaldır |
| `/twitch rolesync list` | | Hiç kimse | Eşlemeleri listele |
| `/twitch redemptions add <reward> [twitchreply] [channel] [discordmessage]` | | Sunucuyu Yönet | Kanal puanı eylemi ekle veya güncelle |
| `/twitch redemptions remove <reward>` | | Sunucuyu Yönet | Birini kaldır |
| `/twitch redemptions list` | | Hiç kimse | Eylemleri listele |
| `/twitch raidtargets add <twitchlogin> [note]` | | Sunucuyu Yönet | `!raidtarget` havuzuna bir kanal ekle |
| `/twitch raidtargets remove <twitchlogin>` | | Sunucuyu Yönet | Birini kaldır |
| `/twitch raidtargets list` | | Hiç kimse | Baskın hedeflerini listele |

## İpuçları ve tuzaklar

- Bot hesabı bottaki her sunucu tarafından ortak kullanılır. Kimse bir tane bağlamadıysa, ne yapılandırırsan yapılandır sohbet yanıtları gönderilemez.
- Sohbet komutları yalnızca **Sohbet olayları için EventSub kullan** açıkken çalışır. Sağlık panelinde Eski IRC görünüyorsa bunu yeniden aç.
- Yayın durumu ayrıca dakikada bir yoklanır; bu yüzden yayın başladı gönderisi gerçek başlangıçtan bir dakikaya kadar geride kalabilir.
- Özel komut bekleme süreleri izleyici başına değil kanal başınadır. 30 saniyelik bir bekleme süresi, herkes için her 30 saniyede bir kullanım demektir.
- Rol senkronizasyonu, bağlı bir izleyici sohbet ettiğinde çalışır; zamanlanmış değildir. Sohbete hiç yazmayan bir abone rolü hiç almaz ve aboneliği biten biri yeniden sohbet edene kadar rolünü korur.
- Rol değişiklikleri için botun rolünün senkronize edilen rolün üstünde olması ve Rolleri Yönet yetkisine sahip olması gerekir.
- `rolesync`'e verilen bilinmeyen rütbeler Abone'ye, `commands add`'e verilen bilinmeyen izinler ise Herkes'e döner.
- Bağlantı kodları on dakika sonra geçersiz olur; yeni bir kod üretmek eskisini geçersiz kılar.
- Canlı Araçlar'dan yapılan zaman aşımları ve yasaklar kanalının moderasyon kapsamlarını kullanır; bu yüzden Twitch'te yetkilendirilmiş hesap tarafından yapılmış işlemler olarak görünürler.
- Dil geçersiz kılma yalnızca Twitch sohbet yanıtlarını değiştirir. Discord yanıtları sunucu yerel ayarını korur.

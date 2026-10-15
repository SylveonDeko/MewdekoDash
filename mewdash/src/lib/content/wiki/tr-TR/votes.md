---
title: Oylar
slug: votes
summary: top.gg'de sunucuna oy veren üyelere bir teşekkür mesajı, oy sayısı ve geçici ya da kalıcı rollerle ödül ver.
icon: fa-thumbs-up
category: Community
dashboard: /dashboard/votes
module: Votes
tags: [votes, top.gg, vote rewards, vote roles, webhook, vote password, leaderboard, oylar, oy ödülleri, oy rolleri, oy şifresi, sıralama tablosu]
related: [administration, xp]
---

## Ne işe yarar

Bu bir anket özelliği değildir. Oylar, sunucunun top.gg'de aldığı oyları takip eder ve bu oyları veren kişilere ödül verir. top.gg Mewdeko'ya birinin oy verdiğini bildirdiğinde bot oyu kaydeder, oy kanalında o üyenin toplam sayısını gösteren bir teşekkür mesajı paylaşır ve yapılandırdığın oy ödülü rollerini verir.

Bir üyenin bakış açısından: sunucuya top.gg'de oy verir, ardından oy kanalında kendisinden bahseden ve kaç kez oy verdiğini gösteren bir mesaj çıkar. Oy rolleri ayarladıysan, aynı anda bu rolleri kalıcı olarak ya da belirli bir süre için alır.

Yetkililerin bakış açısından: bir oy kanalı, bir webhook şifresi, isteğe bağlı bir özel mesaj ve en fazla on ödül rolü ayarlarsın. Bundan sonra bot her oyu kendi başına işler. `votes` ve `votesleaderboard` komutları herkesin sayıları kontrol etmesini sağlar.

top.gg ile sunucun arasındaki bağlantı oy şifresidir. top.gg, webhook çağrısının Authorization başlığında bu şifreyi gönderir ve Mewdeko, bu başlığı her sunucu için saklanan şifreyle eşleştirerek oyun hangi sunucuya ait olduğunu belirler.

## Neden kullanırsın

- Sunucunu top.gg'de listeliyorsun ve birisi her oy verdiğinde görünür bir teşekkür istiyorsun.
- Oy verenlere bir "Voter" rolü ya da on iki saat sonra süresi dolan geçici bir ayrıcalık rolü vermek istiyorsun.
- Bir "en iyi oy veren" ödülü için aylık bir oy sıralama tablosu çalıştırmak istiyorsun.
- Üyelerin yetkililere sormadan kendi oy sayılarını kontrol edebilmesini istiyorsun.

## Bir oy nasıl işlenir

1. top.gg, oy verenin Discord ID'sini ve şifreni Authorization başlığında taşıyan bir istekle botun `/votes/` webhook uç noktasına gönderir.
2. Bot, saklanan oy şifresi eşleşen sunucuyu bulur. Eşleşen yoksa oy atılır.
3. Oy, oy verenin ID'si ve zamanıyla kaydedilir.
4. Bir oy kanalı ayarlıysa bot oraya teşekkür mesajını gönderir. Oy kanalı yoksa hiçbir şey gönderilmez ve hiçbir rol verilmez.
5. Her oy rolü üyeye eklenir. Süreli roller, süresi dolduğunda kaldırılır; bu, susturmalarda kullanılan aynı zamanlı rol sistemiyle yapılır.

> [!WARNING]
> Oyu sunucuna bağlayan tek şey şifredir. Onu bilen herkes sahte oy gönderebilir. Asla herkese açık bir kanala yapıştırma; bot bu nedenle şifreyi özel bir pencere üzerinden ayarlar.

## Teşekkür mesajı

Varsayılan olarak bot, oy verenin etiketini ve "<server> için oy verdiğin için teşekkürler" başlıklı bir gömülü mesajı, toplam oy sayısını gösteren bir satır ve küçük resim olarak avatarını gönderir.

Bunu `votemessage` ya da kontrol panelindeki **Özel Oy Duyurusu** kutusu ile kendi metninle ya da gömülü mesajınla değiştirebilirsin. Metin gömülü mesaj ayrıştırıcısından geçer; bu yüzden gömülü mesaj oluşturucunun ürettiği her şey çalışır. Varsayılana dönmek için komutta `-` ver ya da kontrol panelinde kutuyu temizle.

### Yer tutucular

Özel mesaj, genel yer tutucu kümesini (yer tutucular sayfasındaki kullanıcı, sunucu, kanal, bot ve zaman yer tutucuları) ve oyla ilgili iki yer tutucuyu destekler.

| Yer tutucu | Değer |
| --- | --- |
| `%votestotalcount%` | Bu üyenin toplamda kaç kez oy verdiği |
| `%votesmonthcount%` | Bu üyenin içinde bulunulan takvim ayında kaç kez oy verdiği |
| `%user.mention%`, `%user.name%`, `%user.id%`, `%user.avatar%` | Oy veren |
| `%server.name%`, `%server.id%`, `%server.icon%`, `%server.members%` | Sunucun |

> [!EXAMPLE]
> `Thanks %user.mention% for voting! That is vote number %votestotalcount% (%votesmonthcount% this month).`

`votemessage` komutunu metin olmadan çalıştırmak, mevcut mesajı sana kendi oy sayılarınla nasıl görüneceğini gösteren bir önizleme olarak verir.

## Oy rolleri

Oy rolü her oy verene verilir. Her rolün isteğe bağlı bir süresi vardır (saniye cinsinden); `0` rolün kalıcı olduğu anlamına gelir.

- Sunucu başına en fazla on oy rolü.
- `@everyone` rolü eklenemez.
- Bir rol iki kez eklenemez; süresini değiştirmek için `voteroleedit` kullan.
- Süreli roller, süre dolduğunda otomatik olarak kaldırılır.
- Bot bir rolü veremezse (örneğin rol botun en yüksek rolünün üstündeyse) o rolü sessizce atlar.

## Oy sayıları ve sıralama tablosu

`votes`, bir üyenin bu ayki ve toplam oylarını avatarıyla birlikte gösterir. `votesleaderboard`, sunucudaki herkesi toplam oyuna göre sayfa başına on iki kişi olacak şekilde sıralar. `true` verirsen yalnızca bu ayın oylarına göre sıralar. "Ay" sayıları, son otuz güne değil takvim ayına bakar.

## Ayarlar

Oylar sayfasında üç sekme vardır: **Yapılandırma**, **Oy Rolleri** ve **İstatistikler**.

| Ayar | Varsayılan | Kontrol ettiği |
| --- | --- | --- |
| Oy Duyuru Kanalı | yok | Teşekkür mesajlarının gönderileceği yer. Bu olmadan hiçbir şey olmaz |
| API Şifresi (webhook'lar için) | yok | top.gg'nin Authorization başlığında göndermesi gereken gizli anahtar |
| Özel Oy Duyurusu | varsayılan gömülü mesaj | Yukarıdaki yer tutucularla kendi mesajın. Boş bırakmak varsayılanı kullanır |
| Verilecek Rol | yok | Her oy verene eklenen rol (Oy Rolleri sekmesi) |
| Süre (saniye, kalıcı için 0) | 0 | Bir oy rolünün kaldırılmadan önce ne kadar süreyle kalacağı |

**İstatistikler** sekmesi toplam oyları, oy rolü sayısını, en çok oy veren kişinin sayısını ve ilk on kişilik bir sıralama tablosunu gösterir.

## Kurulum adımları

1. Kontrol panelinde **Oylar** sayfasını aç ve **Yapılandırma** sekmesinde kal.
2. Bir **Oy Duyuru Kanalı** seç. Bu olmadan oylar kaydedilir ama hiçbir şey gönderilmez ve hiçbir rol verilmez.
3. Bir **API Şifresi** gir. Uzun ve rastgele olsun; bir API anahtarı gibi değerlendir.
4. İstersen yukarıdaki yer tutucuları kullanarak bir **Özel Oy Duyurusu** yaz, ardından **Yapılandırmayı Kaydet** düğmesine bas.
5. top.gg'de sunucunun sayfasında webhook bölümünü aç. Webhook URL'sini botunun `/votes/` uç noktası, Authorization değerini de aynı şifre olarak ayarla.
6. **Oy Rolleri** sekmesinde bir **Verilecek Rol** ve **Süre** seç, ardından **Oy Rolü Ekle** düğmesine bas. En fazla on rol için tekrarla.
7. Botun rolünün, rol listesinde her oy rolünün üstünde olduğundan emin ol.
8. top.gg'nin test webhook düğmesini kullan ya da gerçek bir oyu bekle ve oy kanalını kontrol et.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `votechannel <#channel>` | | Sunucuyu Yönet | Teşekkür mesajları için kanalı ayarla |
| `votemessage [text]` | `votemsg` | Sunucuyu Yönet | Özel mesajı önizle, ayarla ya da sıfırla (`-`) |
| `votepassword` | `votepass` | Sunucuyu Yönet | Webhook şifresini özel bir pencere üzerinden ayarla |
| `voteroleadd <@role> [time]` | `vra` | Sunucuyu Yönet | Bir oy rolü ekle; isteğe bağlı süreli, örneğin `voteroleadd @Voter 12h` |
| `voteroleedit <@role> <time>` | `vre` | Sunucuyu Yönet | Bir oy rolünün süresini değiştir |
| `voteroleremove <@role>` | `vrr` | Sunucuyu Yönet | Bir oy rolünü kaldır |
| `voteroleslist` | `vrl` | Sunucuyu Yönet | Oy rollerini ve sürelerini listele |
| `voterolesclear` | `vrc` | Sunucuyu Yönet | Onaydan sonra tüm oy rollerini kaldır |
| `votes [@user]` | | Herkes | Bir üyenin aylık ve toplam oylarını göster |
| `votesleaderboard [true]` | `voteslb` | Herkes | Toplama göre sırala; `true` ile bu aya göre sırala |

Aynı komutlar `/votes` altında eğik çizgi komutu olarak da bulunur.

## İpuçları ve dikkat edilecekler

- Yalnızca top.gg sunucu oyları desteklenir. Başka bot listeleri için bir entegrasyon yoktur ve bu özellik anket oluşturmaz.
- Oy kanalı yoksa, oy kaydedilse bile mesaj da rol de yoktur.
- Botun Rolleri Yönet iznine ihtiyacı vardır ve rolü her oy rolünün üstünde olmalıdır; aksi hâlde rol ödülleri sessizce başarısız olur.
- Süreli oy rolleri, süreli susturmalarla aynı zamanlı rol sistemini kullanır ve denetim kaydında "Vote Role" nedeniyle görünür.
- `voteroleedit` rolü yalnızca ID'sine bakarak arar; bu yüzden yalnızca bu sunucuda gerçekten eklediğin roller için kullan.
- Şifreyi değiştirmek eski oyları geçersiz kılmaz; ancak top.gg tarafındaki başlığı da güncelleyene kadar top.gg eşleşme yapmaz.

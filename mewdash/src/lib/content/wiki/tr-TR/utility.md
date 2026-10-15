---
title: Yardımcı Araçlar
slug: utility
summary: Komut takma adlarından alıntılara, hatırlatıcılardan otomatik yayınlamaya, yayın rollerinden bir YZ asistanına, mesaj sayımına ve tekrarlayıcılara kadar günlük işler için bir araç kutusu.
icon: fa-wrench
category: Actions
dashboard: /dashboard/utility
module: Utility
tags: [alias, quotes, auto publish, stream role, ai, chatbot, nsfw filter, role monitor, reminder, snipe, repeater, sticky, message count, invites, embed, calculator, userinfo, serverinfo, takma ad, alıntılar, otomatik yayınlama, yayın rolü, yapay zeka, sohbet botu, nsfw filtresi, rol izleyici, hatırlatıcı, silinen mesaj, tekrarlayıcı, sabitleme, mesaj sayımı, davetler, hesap makinesi, kullanıcı bilgisi, sunucu bilgisi]
related: [repeaters, polls, invites, messagestats, embedbuilder, xp, administration, moderation]
---

## Ne işe yarar

Yardımcı Araçlar, çoğu sunucunun isteyeceği küçük özellikler için bir toplu modüldür. Üyeler hatırlatıcılar, alıntılar, zar atma, hesap makinesi, birim dönüştürme ve kullanıcılar, roller, kanallar ile sunucu için bilgi komutları alır. Yetkililer ise komut takma adları, tekrarlanan mesajlar, duyuru kanalları için otomatik yayınlama, üyeler yayın yaparken takip eden bir rol, silinen mesajları yakalama, mesaj sayımı ve davet takibi alır.

Kontrol panelindeki **Yardımcı Araçlar** sayfası, form gerektiren parçaları bir araya getirir: takma adlar, alıntılar, otomatik yayınlama, yayın rolü, YZ asistanı, NSFW etiket filtresi ve rol izleyici. Geri kalan her şey yalnızca komutla kullanılır.

Bu modül geniş olduğu için her alt özellik ayrı ayrı anlatılır. Sondaki komut tablosu modüldeki her komutu listeler.

## Neden kullanırsın

- Tüm sunucu için `play youtube` komutunu bir takma adla `yt` olarak kısalt.
- Üyelerin ekleyebileceği ve rastgele satırlar çekebileceği ortak bir alıntı defteri tut.
- Duyuru kanalındaki her gönderiyi otomatik olarak takipçilere yayınla.
- Üyelere yalnızca belirli bir oyunu yayınlarken geçerli bir "Live" rolü ver.
- Kurallarını veya sabit bir duyuruyu her birkaç dakikada bir paylaş; ya da yalnızca kanal aktif olduğunda paylaş.
- Üyelerin kendileri veya bir kanal için hatırlatıcı kurmasına izin ver.
- Kendi API anahtarını kullanarak bir kanalda YZ asistanı çalıştır.

## Takma adlar

Takma ad, bot çalıştırmadan önce mesajı başka bir komuta çeviren bir tetikleyici kelimedir. `alias yt play youtube` komutundan sonra `.yt lofi` yazmak, `.play youtube lofi` komutunu çalıştırır. Tetikleyici mesajın ilk kelimesi olmalıdır; sonrasındaki her şey eşlenen komuta eklenir. Daha uzun tetikleyiciler önce eşleştirilir. Eşleme vermeden `alias <trigger>` çalıştırmak takma adı kaldırır, `aliasesclear` ise hepsini kaldırır.

Kontrol panelinde **Takma adlar** sekmesinde **Takma ad tetikleyicisi** ve **Takma ad eşlemesi** alanları, bir arama kutusu ve silebileceğin bir liste bulunur.

## Alıntılar

Alıntılar bir anahtar kelime altına kaydedilen kısa metinlerdir. `quoteadd <keyword> <text>` bir alıntı kaydeder, `quoteprint <keyword>` (ya da `..`) o anahtar kelime için rastgele bir alıntı gösterir, `quoteshow <id>` belirli bir alıntıyı gösterir. `quotesearch` anahtar kelimeye ve metne göre arama yapar, `quoteid` bir alıntıyı kimin eklediğini gösterir, `listquotes` ise alıntıları anahtar kelimeye veya eklenme tarihine göre sayfalar. Herkes alıntı ekleyebilir. Bir alıntıyı, onu ekleyen üye veya bir yönetici silebilir; bir anahtar kelimenin altındaki tüm alıntıları silmek, JSON'a aktarmak ve bir JSON ekinden içe aktarmak için ise Yönetici yetkisi gerekir.

**Alıntılar** sekmesinde alıntı ekleyebilir, düzenleyebilir, arayabilir ve silebilirsin.

## Otomatik yayınlama

Discord duyuru kanallarındaki her mesajın elle yayınlanması gerekir. `addautopublish #channel` komutu, botun o kanaldaki her yeni mesajı yayınlamasını sağlar. Her kanal için mesajları atlayan iki kara liste vardır: `addpublishblacklist @user #channel` bir kullanıcıyı yok sayar, `addpublishblacklist #channel word` ise içinde o kelime geçen her mesajı yok sayar (büyük/küçük harf duyarsız). `getautopublishes` her kanalı kara listeleriyle birlikte gösterir.

**Otomatik Yayınlama** sekmesi kanal ekler ve **Bu kullanıcıların mesajlarını atla** ile **Bu kelimeleri içeren mesajları atla** listelerini yönetir.

## Yayın rolü

`streamrole <fromRole> <addRole>` komutu, **fromRole** rolüne sahip herhangi bir üye yayın yaparken ona **addRole** rolünü verir ve yayını bıraktığında bu rolü geri alır. `streamrolekeyword <keyword>` özelliği yalnızca başlığında anahtar kelime geçen yayınlarla sınırlar; anahtar kelime vermeden çalıştırırsan temizlenir. Beyaz listedeki üyeler anahtar kelime eşleşmese bile yayın yaparken rolü alır; kara listedeki üyeler ise rolü asla almaz. `streamrole` komutunu hiç argüman olmadan çalıştırmak özelliği kapatır. Botun rolü yönetme izni kaybolursa ya da rol silinirse özellik kendini devre dışı bırakır.

**Yayın Rolü** sekmesinde **Uygun rol**, **Yayın yaparken rol**, **Yayın başlığı anahtar kelimesi** ve kullanıcı ID'lerine göre bir **Beyaz liste** ile **Kara liste** bulunur.

## YZ asistanı

Asistan, seçilen tek bir kanaldaki her mesaja yanıt verir ve her üye için son beş konuşmayı bağlam olarak tutar. O kanalda `deletesession` yazmak kendi konuşmanı temizler.

| Ayar | Komut | Ne yapar |
| --- | --- | --- |
| Kanal | `aichannel [#channel] [enabled]` | Asistanın dinlediği tek kanal |
| Sağlayıcı ve model | `aimodel <OpenAi\|Groq\|Claude> [model]` | Çağrılacak API ve model |
| API anahtarı | `aikey` | Bu sağlayıcı için kendi anahtarın; bot tarafından saklanır ve bir daha gösterilmez |
| Sistem istemi | `aiprompt <text>` | Modelin uyacağı talimatlar |
| Web araması | `aiwebsearch <true\|false>` | Modelin web'de aramasına izin verir (yalnızca Claude) |
| Webhook | `aiwebhook [name] [avatarUrl]` | Yanıtları özel bir ad ve avatarla bir webhook üzerinden gönderir |
| Özel embed | `aicustomembed [template]` | Yanıtları bir embed içine alır; `%airesponse%` yanıtın nereye geleceğini belirtir |

`aiconfig` mevcut yapılandırmayı gösterir. **YZ Asistanı** sekmesinde **Asistan etkin**, **Kanal**, **Sağlayıcı**, **Model**, **API anahtarı**, **Sistem istemi**, **Web aramasına izin ver** ve **"Web'de aranıyor" bildirimlerini gizle** seçenekleri bulunur.

> [!WARNING]
> Asistan kendi API anahtarında ve kendi faturanda çalışır. Bir anahtar ayarlanmamışsa kanaldaki mesajlar hata yanıtı alır.

## NSFW filtresi

**NSFW Filtresi** sekmesi, NSFW modülünün görsel aramaları için engellenen etiketleri listeler. Eklemek için **Engellenecek etiket** alanına bir etiket yaz; kaldırmak için bir etikete tıkla. İlgili komut NSFW modülündeki `nsfwtagbl [tag]` komutudur; etiket verilmezse mevcut kara listeyi listeler.

## Rol izleyici

**Rol İzleyici** sekmesi, Sunucu Yönetimi modülünün rol izleyicisini yapılandırır. Bu izleyici, koruma altına aldığın bir rol veya izin verildiğinde tepki verir. **Varsayılan ceza** seçebilirsin (yalnızca değişikliği geri al, uyar, tüm rolleri kaldır, sustur, zaman aşımına uğrat, at veya yasakla), korunacak rolleri ve izinleri ekleyebilir, muaf tutulacak **Güvenilir roller** ve **Güvenilir üyeler** listeleyebilirsin. `addblacklistedrole`, `addblacklistedpermission`, `whitelistuser`, `whitelistrole`, `setdefaultpunishment` ve `listblacklists` komutları yalnızca sunucu sahibine açıktır ve Sunucu Yönetimi modülünde bulunur.

## Hatırlatıcılar

`remind me <time> <message>` ileride sana özel mesaj gönderir; `remind here <time> <message>` mevcut kanalda paylaşır; `remind #channel <time> <message>` başka bir kanalı hedefler ve **Mesajları Yönet** yetkisi gerektirir. Süre `2h30m`, `3 days`, `1w` veya `in 45 minutes` gibi yazılır ve en fazla 60 gün sonrası olabilir. `remindlist` hatırlatıcılarını sıra numaralarıyla gösterir, `reminddelete <index>` birini siler. Mesajdaki bahsetmeler, o kanalda herkesi etiketleme iznin yoksa etkisiz hale getirilir.

## Snipe

Snipe özelliği bir yönetici `snipeset enable` komutunu çalıştırana kadar kapalıdır. Açıldıktan sonra bot silinen ve düzenlenen mesajları 30 gün boyunca saklar. `snipe [#channel] [@user]` en son silinen mesajı, `editsnipe` en son düzenlemeyi gösterir; `snipelist` ve `editsnipelist` son beşini (ya da vereceğin bir sayıyı) kanala veya kullanıcıya göre filtreleyerek gösterir.

## Tekrarlayıcılar

Tekrarlayıcı bir mesajı bir zamanlamaya göre paylaşır. `repeat <message>` beş dakikalık bir aralık kullanır; `repeat <interval> <message>` 5 saniye ile 25000 dakika arasında bir aralık belirler; `repeat <time of day> <message>` ise günde bir kez çalışır. Her tekrarlayıcının `repeatlist` ile gösterilen bir sıra numarası vardır.

| Tetikleme modu | Davranış |
| --- | --- |
| `timeinterval` | Her aralıkta paylaş (varsayılan) |
| `onactivity` | Kanal belirli bir zaman penceresinde belirli sayıda mesaj gördükten sonra paylaş (`repeatactivity`) |
| `onnoactivity` | Kanal pencere boyunca sessiz kaldığında paylaş |
| `immediate` | Hemen paylaş, ardından aralığı izle |
| `aftermessages` | Belirli sayıda mesajdan sonra paylaş |

Tekrarlayıcı başına diğer ayarlar: `repeatredun` tekrarlayıcının mesajı kanaldaki son mesajsa paylaşımı atlar; `repeatschedule <business\|evening\|weekend\|custom>` çalışma zamanını sınırlar; `repeatconversation` konuşma algılamasını açıp kapatır; `repeatpriority` tekrarlayıcıları 0 ile 100 arasında sıralar; `repeatthreadonly` ve `repeatthreadautosticky` konuları hedefler; `repeatforumtags` forum gönderilerini etikete göre kısıtlar; `repeatsuppressnotifications` sessizce gönderir; `repeattoggle` duraklatır.

## Mesaj sayımı ve davetler

`togglemsgcount` mesaj sayımını açar. `usermessages`, `channelmessages`, `servermessages` ve `topusers` sayıları raporlar, `activitygraph` en yoğun saatleri veya günleri çizer, `minmsglength` belirli bir uzunluktan kısa mesajları yok sayar. `resetmessagecounts` onaydan sonra bir kullanıcının, bir kanalın ya da ikisinin sayılarını sıfırlar.

Davet takibi her üyeyi kimin davet ettiğini kaydeder. `invites`, `whoinvited`, `invitedusers` ve `inviteleaderboard` verileri okur. `toggleinvitetracking`, `toggleremoveinviteonleave` ve `setminaccountage <days>` ise bunu kontrol eder; minimum yaştan genç hesaplar sayılmaz.

## Ayarlar

Kontrol panelindeki sayfa sekmelere ayrılmıştır: **Takma adlar**, **Alıntılar**, **Otomatik Yayınlama**, **Yayın Rolü**, **YZ Asistanı**, **NSFW Filtresi** ve **Rol İzleyici**.

| Ayar | Varsayılan | Ne kontrol eder |
| --- | --- | --- |
| Takma ad tetikleyicisi ve eşlemesi | yok | Yeniden yazılacak kelime ve dönüşeceği komut |
| Alıntı anahtar kelimesi ve metni | yok | Kayıtlı bir alıntı |
| Otomatik yayınlama kanalları | yok | Bot'un yayınladığı duyuru kanalları |
| Bu kullanıcıların mesajlarını atla / bu kelimeleri içeren mesajları atla | yok | Kanal bazında yayınlama kara listeleri |
| Uygun rol | yok | Yayın rolünü alabilecek üyeler |
| Yayın yaparken rol | yok | Eklenip kaldırılan rol |
| Yayın başlığı anahtar kelimesi | her yayın | Yalnızca başlığında bu metin geçen yayınlar sayılır |
| Asistan etkin | kapalı | YZ kanalının yanıt verip vermediği |
| Sağlayıcı, Model, API anahtarı, Sistem istemi | yok | YZ yapılandırması |
| Web aramasına izin ver | kapalı | Claude web araması |
| "Web'de aranıyor" bildirimlerini gizle | açık | Modelin web arama durum mesajlarını gizler |
| Engellenen etiketler | yok | Filtrelenen NSFW arama etiketleri |
| Varsayılan ceza | varsayılanı kullan | Rol izleyici eylemi |

Snipe, mesaj sayımı, davet takibi, tekrarlayıcılar, hatırlatıcılar ve bağlantı önizlemelerinin kontrol paneli ayarı yoktur.

## Kurulum adımları

1. Kontrol panelinde **Yardımcı Araçlar** sayfasını aç.
2. **Takma adlar** sekmesinde `play youtube` komutuna eşlenen `yt` gibi bir tetikleyici ekle. Discord'da test et.
3. **Otomatik Yayınlama** sekmesinde duyuru kanalını ekle. Atlanacak bot ya da webhook kullanıcılarını atlama listesine ekle.
4. **Yayın Rolü** sekmesinde uygun rolü ve eklenecek rolü seç; istersen bir başlık anahtar kelimesi de ekle. Botun rolünün, eklediği rolün üstünde olduğundan emin ol.
5. **YZ Asistanı** sekmesinde bir kanal, sağlayıcı ve model seç, anahtarını yapıştır, bir sistem istemi yaz ve etkinleştir.
6. Discord'da silinen mesajları yakalamak istiyorsan `snipeset enable`, mesaj istatistikleri için `togglemsgcount` komutunu çalıştır.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `alias <trigger> [mapping]` | `cmdmap` | Yönetici | Takma ad ekle; eşleme olmadan kaldır |
| `aliaslist` | `cmdmaplist`, `aliases` | Hiç kimse | Takma adları listele |
| `aliasesclear` | `aliasclear` | Yönetici | Tüm takma adları kaldır |
| `quoteadd <keyword> <text>` | `.` | Hiç kimse | Alıntı ekle |
| `quoteprint <keyword>` | `..` | Hiç kimse | Bir anahtar kelime için rastgele alıntı |
| `quoteshow <id>` | | Hiç kimse | Alıntıyı ID ile göster |
| `quotesearch <keyword> <text>` | `qsearch` | Hiç kimse | Anahtar kelime ve metne göre alıntı bul |
| `quoteid <id>` | `qid` | Hiç kimse | Alıntıyı kimin eklediği |
| `listquotes [page] [order]` | `liqu` | Hiç kimse | Alıntılar arasında sayfalama yap |
| `quotedelete <id>` | `qdel` | Hiç kimse (kendi alıntıları) veya Yönetici | Alıntı sil |
| `delallquotes <keyword>` | `daq`, `delallq` | Yönetici | Bir anahtar kelimenin altındaki tüm alıntıları sil |
| `quoteexport` | `qexport` | Yönetici | Alıntıları JSON olarak dışa aktar |
| `quoteimport` | `qimport` | Yönetici | Eklenen bir JSON dosyasından alıntı içe aktar |
| `addautopublish <#channel>` | `addautopub`, `aap` | Yönetici | Bir haber kanalını otomatik yayınla |
| `removeautopublish <#channel>` | `removeautopub` | Yönetici | Otomatik yayınlamayı durdur |
| `addpublishblacklist <@user> <#channel>` veya `<#channel> <word>` | `addpubbl` | Yönetici | Bir kullanıcıyı veya kelimeyi atla |
| `removepublishblacklist <@user> <#channel>` veya `<#channel> <word>` | `removepubbl` | Yönetici | Bir atlamayı kaldır |
| `getautopublishes` | `getaps` | Yönetici | Otomatik yayınlama kanallarını listele |
| `streamrole [fromRole] [addRole]` | | Rolleri Yönet | Yayın rolünü ayarla; rol verilmezse devre dışı bırak |
| `streamrolekeyword [keyword]` | `srkw` | Rolleri Yönet | Yayın başlığında anahtar kelime iste |
| `streamroleblacklist <add\|remove> <@user>` | `srbl` | Rolleri Yönet | Bu üyeye rolü asla verme |
| `streamrolewhitelist <add\|remove> <@user>` | `srwl` | Rolleri Yönet | Bu üyeye yayın yaparken rolü her zaman ver |
| `aichannel [#channel] [enabled]` | `aic` | Sunucuyu Yönet | YZ kanalını ayarla |
| `aimodel <provider> [model]` | `aim` | Sunucuyu Yönet | Sağlayıcı ve model |
| `aikey` | `ak` | Yönetici | API anahtarını ayarla |
| `aiprompt <text>` | `aip` | Sunucuyu Yönet | Sistem istemi |
| `aiwebsearch <true\|false>` | `aws` | Sunucuyu Yönet | Claude web araması |
| `aiwebhook [name] [avatar]` | `aiw` | Yönetici | Bir webhook üzerinden yanıt ver; ad verilmezse devre dışı bırak |
| `aicustomembed [template]` | `aice` | Yönetici | Yanıtlar için embed şablonu |
| `aiconfig` | `ac` | Hiç kimse | YZ ayarlarını göster |
| `remind <me\|here> <time> <message>` | | Hiç kimse | Hatırlatıcı kur |
| `remind <#channel> <time> <message>` | | Mesajları Yönet | Başka bir kanalda hatırlatıcı |
| `remindlist` | `remindl`, `remindlst` | Hiç kimse | Hatırlatıcıların |
| `reminddelete <index>` | `remindrm`, `reminddel` | Hiç kimse | Bir hatırlatıcıyı sil |
| `snipeset <enable\|disable>` | `setsnipe` | Yönetici | Snipe'ı aç veya kapat |
| `snipe [#channel] [@user]` | | Hiç kimse | Son silinen mesaj |
| `editsnipe [#channel] [@user]` | | Hiç kimse | Son düzenlenen mesaj |
| `snipelist [#channel] [@user] [amount]` | `slist` | Hiç kimse | Son silinen mesajlar |
| `editsnipelist [#channel] [@user] [amount]` | `esnipelist` | Hiç kimse | Son düzenlenen mesajlar |
| `repeat [time] [interval] <message>` | | Mesajları Yönet | Tekrarlayıcı oluştur |
| `repeatlist` | `replst`, `replist`, `repli` | Mesajları Yönet | Tekrarlayıcıları listele |
| `repeatremove <index>` | `reprm` | Mesajları Yönet | Bir tekrarlayıcıyı sil |
| `repeatinvoke <index>` | `repinv` | Mesajları Yönet | Şimdi paylaş |
| `repeatmessage <index> <message>` | `repmsg` | Mesajları Yönet | Metni değiştir |
| `repeatchannel <index> [#channel]` | `repchan` | Mesajları Yönet | Taşı |
| `repeatredun <index>` | `repred` | Mesajları Yönet | Yinelenme kontrolünü aç/kapat |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Mesajları Yönet | Yukarıdaki tablodaki tetikleme modu |
| `repeatactivity <index> <messages> <window>` | `repactivity`, `repact` | Mesajları Yönet | Etkinlik eşiği |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Mesajları Yönet | Öncelik |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Mesajları Yönet | Günün saatine göre zamanlama |
| `repeatconversation <index>` | `repconversation`, `repconv` | Mesajları Yönet | Konuşma algılamasını aç/kapat |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Mesajları Yönet | Duraklat veya sürdür |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Mesajları Yönet | Yeni konularda sabitle |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Mesajları Yönet | Yalnızca konularda paylaş |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Mesajları Yönet | Sessizce gönder |
| `repeatforumtags <index> <action> [tagType] [tags]` | `repforumtags`, `repftags` | Mesajları Yönet | Forum etiketi kuralları |
| `togglemsgcount` | `togglemessagecount` | Yönetici | Mesaj sayımını aç veya kapat |
| `minmsglength [length]` | `mmlength`, `minmlength` | Sunucuyu Yönet | Kısa mesajları yok say |
| `usermessages [@user]` | `usermsg`, `umsg` | Hiç kimse | Bir üyenin mesaj istatistikleri |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Hiç kimse | Bir kanalın mesaj istatistikleri |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg`, `gmsg` | Hiç kimse | Sunucu geneli istatistikler |
| `topusers` | `topu` | Hiç kimse | Mesaj sayısına göre ilk on |
| `activitygraph [days\|hours]` | `actgraph` | Hiç kimse | En yoğun zamanlar grafiği |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Mesajları Yönet | Sayıları sıfırla |
| `invites [@user]` | | Hiç kimse | Davet sayısı |
| `whoinvited [@user]` | `invitedby` | Hiç kimse | Bir üyeyi kimin davet ettiği |
| `invitedusers [@user]` | `userinvites` | Hiç kimse | Birinin davet ettiği üyeler |
| `inviteleaderboard` | `inviteslb` | Hiç kimse | En çok davet edenler |
| `invitesettings` | `inviteconfig` | Sunucuyu Yönet | Davet ayarlarını göster |
| `toggleinvitetracking` | | Sunucuyu Yönet | Takibi aç veya kapat |
| `toggleremoveinviteonleave` | `triol` | Sunucuyu Yönet | Davet edilen ayrıldığında davetleri sayıdan düş |
| `setminaccountage <days>` | `inviteminage` | Sunucuyu Yönet | Genç hesapları yok say |
| `joinstats` | `jstats` | Beta bayrağı (`dragon`) | Katılma grafiği |
| `leavestats` | `lstats` | Beta bayrağı (`dragon`) | Ayrılma grafiği |
| `joinstatscolor [r g b]` | `jstatscolor` | Beta bayrağı (`dragon`) | Katılma grafiği rengi; değer verilmezse altın |
| `leavestatscolor [r g b]` | `lstatscolor` | Beta bayrağı (`dragon`) | Ayrılma grafiği rengi; değer verilmezse altın |
| `userinfo [@user]` | `uinfo` | Hiç kimse | Üye ayrıntıları |
| `serverinfo [name]` | `sinfo` | Hiç kimse | Sunucu ayrıntıları |
| `channelinfo [#channel]` | `cinfo` | Hiç kimse | Metin kanalı ayrıntıları |
| `vinfo [channel]` | `voiceinfo` | Hiç kimse | Ses kanalı ayrıntıları |
| `rinfo <role>` | `roleinfo` | Hiç kimse | Rol ayrıntıları |
| `fetch <id>` | | Hiç kimse | ID ile herhangi bir kullanıcıyı ara |
| `avatar [@user]` | `av` | Hiç kimse | Avatar; sunucu avatarı için bir düğme ile |
| `banner [@user]` | `userbanner` | Hiç kimse | Kullanıcı bannerı |
| `userid [@user]` | `uid` | Hiç kimse | Kullanıcı ID'si |
| `roleid <role>` | `rid` | Hiç kimse | Rol ID'si |
| `channelid` | `cid` | Hiç kimse | Kanal ID'si |
| `serverid` | `sid` | Hiç kimse | Sunucu ID'si |
| `roles [@user]` | | Hiç kimse | Sunucu rolleri veya bir üyenin rolleri |
| `inrole <role>` | | Hiç kimse | Bir role sahip üyeler |
| `inroles <role> <role>` | | Hiç kimse | İki role de sahip üyeler |
| `rolepermlist [and\|or] <permissions...>` | `roleperms` | Hiç kimse | Bu izinlere sahip roller |
| `channeltopic [#channel]` | `ct` | Hiç kimse | Kanal konusu |
| `whosplaying <game>` | `whpl` | Hiç kimse | Bir oyunu oynayan üyeler |
| `emotelist [type]` | | Hiç kimse | Sunucu emojileri |
| `showemojis <emojis>` | `se` | Hiç kimse | Emojileri büyüt |
| `say [#channel] <text or embed JSON>` | | Mesajları Yönet | Bot adına konuş |
| `getjson <messageId> [#channel]` | | Mesajları Yönet | Bir mesajın embed JSON'u |
| `embedsave <name> <json>` | `esave` | Hiç kimse | Kişisel bir embed şablonu kaydet |
| `guildembedsave <name> <json>` | `gesave`, `gembedsave` | Mesajları Yönet | Sunucu embed şablonu kaydet |
| `embedlist` / `guildembedlist` | `elist` / `gelist`, `gembedlist` | Hiç kimse | Şablonları listele |
| `embeddelete <name>` / `guildembeddelete <name>` | `edel`, `edelete` / `gedel`, `gembeddelete` | Hiç kimse / Mesajları Yönet | Bir şablonu sil |
| `embedpreview <name>` | `epreview`, `eprev` | Hiç kimse | Bir şablonun önizlemesini gör |
| `debugembed <text>` | `embeddebug` | Yönetici | Embed ayrıştırmayı test et |
| `savechat <time> [#channel]` | | Mesajları Yönet | Bir sohbet kaydı al ve bağlantısını göster |
| `calculate <expression>` | `calc` | Hiç kimse | Matematik ifadesini hesapla |
| `calcops` | | Hiç kimse | Kullanılabilir matematik işlemleri |
| `plot <function> [start] [end]` | `graphfunction` | Hiç kimse | Bir fonksiyonu çiz |
| `sym <expression>` | `symbolicmath` | Hiç kimse | Sembolik matematik |
| `convertunits <from> <to> <value>` | `unitconvert`, `units` | Hiç kimse | Birim dönüştürme |
| `convertlist` | | Hiç kimse | Desteklenen birimler |
| `convert <format>` | | Hiç kimse | Eklenen bir medya dosyasını dönüştür |
| `roll <dice>` | | Hiç kimse | Zar at; DnD gösterimi desteklenir |
| `owoify <text>` | `owo` | Hiç kimse | Metni OwO'laştır |
| `vcheck [url]` | `viruscheck` | Hiç kimse | Bir bağlantının VirusTotal taraması |
| `traceroute <host>` | `tracert`, `trcrt` | Hiç kimse | Bir sunucuya giden yolu izle |
| `pingip <ip> [count]` | | Hiç kimse | Bir adrese en fazla 10 kez ping at |
| `previewlinks <yes\|no>` | `plinks` | Yönetici | Bağlantı önizlemelerini aç veya kapat |
| `verboseerror [true\|false]` | `ve` | Mesajları Yönet | Ayrıntılı komut hatalarını aç veya kapat |
| `ping` | | Hiç kimse | Bot gecikmesi |
| `stats` | | Hiç kimse | Bot istatistikleri |
| `invite` | | Hiç kimse | Bot davet ve destek bağlantıları |
| `vote` | | Hiç kimse | Oy bağlantısı |

## İpuçları ve dikkat edilecekler

- Bir takma ad yalnızca metni yeniden yazar; eşlenen komut kendi yetki kontrolleriyle çalışmaya devam eder.
- Otomatik yayınlama yalnızca Discord duyuru (haber) kanallarında çalışır.
- Yayın rolü, botun rolünün eklediği rolün üstünde olmasını gerektirir. Rolü yönetemezse, her yayında sessizce başarısız olmak yerine özellik kendini kapatır.
- Snipe varsayılan olarak kapalıdır ve 30 günden eski snipe'lar silinir.
- 60 günden uzun hatırlatıcılar reddedilir.
- YZ asistanı yalnızca yapılandırılmış tek kanalda yanıt verir ve botları yok sayar. Hafızası her üye için son beş mesajdır, bu yüzden uzun konuşmalarda ilk bağlam kaybolur.
- Mesaj sayımı istatistik oluşmadan önce açılmalıdır; geriye dönük sayım yapılmaz.
- `joinstats` ve `leavestats` on saniyede bir çalıştırılabilir.

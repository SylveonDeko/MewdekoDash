---
title: Yardım ve Komutlar
slug: help
summary: Botun komutlarını Discord içinden nasıl bulup anlayacağınız: kategori yardım menüsü, modül genel bakışları, komut başına yardım sayfaları, komut arama ve bot katıldığında yönlendirdiği kontrol paneli kurulum sihirbazı.
icon: fa-life-ring
category: General
module: Help
tags: [help, commands, modules, search command, slash commands, prefix, setup wizard, invite, guide, source, donate, vote, yardım, komutlar, modüller, komut arama, slash komutları, önek, kurulum sihirbazı, davet, rehber, kaynak, bağış, oy]
related: [permissions, administration, userprofile]
---

## Ne işe yarar

Yardım modülü, üyelerin botun neler yapabildiğini keşfetmesini sağlar. `help` (ya da `cmds`) komutu, her kategori için modül ve komut sayısını gösteren kategori listesini ve bir kategoriyi açmak için bir açılır menüyü içeren bir menü açar. Bir kategori seçildiğinde modülleri, bir modül seçildiğinde ise komutlarını sayfa başına on tane ve kısa açıklamalarıyla gösterir. Çok büyük modüllerde önce bölümlere ayrılmış bir genel bakış gösterilir.

`help <command>` tek bir komutu gösterir: adı ve ilk takma adı, ne yaptığı, sizden ve bottan hangi Discord izinlerini istediği, varsa bekleme süresi, eşleşen slash komutu, her parametre, alternatif biçimler, kullanım örnekleri ve belgelere bağlantı. **Çalıştır** düğmesi, komutu doğrudan yardım sayfasından çalıştırmanızı sağlar; argümanı varsa önce argümanlar için bir form açar.

`searchcommand <term>`, adında ya da açıklamasında terim geçen komutları bulur. Botu hiçbir metin olmadan etiketlemek, geçerli önekle ve `cmds` yönlendirmesiyle yanıt verir.

Her komutun metin sürümü vardır; sunucu önekiyle kullanılır ve çoğu komutun ayrıca bir slash sürümü de vardır. Yardım menüsü ve komut sayfaları her iki durumda da aynıdır; `/help`, `/search` ve `/invite` slash giriş noktalarıdır.

## Neden kullanmalısınız

- Yeni bir üye `.help` yazar ve gidebileceği mantıklı bir yer arar.
- Yetkililer, bir komutu vermeden önce hangi iznin gerektiğini tam olarak bilmek ister.
- Birisi bir komut adının yarısını hatırlar ve onu aramak ister.
- Botu yeni davet ettiniz ve her modülün belgelerini okumak yerine yönlendirmeli bir kurulum istiyorsunuz.

## Yardım menüsü

Argümansız `help`, `commands` veya `modules` üst düzey menüyü açar. Embed'in açıklaması iki giriş yolunu anlatır: açılır menüden bir kategori seçmek ya da tek bir komut için `h commandname` kullanmak. Ayrıca belgelere, destek sunucusuna, davet ve bağış sayfalarına bağlantılar içerir.

| Kategori | İçerir |
| --- | --- |
| Moderation & Admin | Administration, Moderation, Permissions, Server Management, Role States, Status Roles, Counting Moderation |
| Server Setup | MultiGreets, Role Greets, Starboard, Stat Channels, Suggestions, Tickets, Confessions, Channel Access, Custom Voice, Chat Triggers, Polls, Giveaways |
| Fun & Games | Games, Counting, NSFW, Searches, Minecraft, Switch |
| Economy & Levels | Currency, XP, Reputation, Vote, Patreon |
| Music | Music |
| Utility | Utility, Help, AFK, Todo, User Profile, Birthday, Highlights, Copr Monitoring |
| Bot Owner | Yalnızca bot sahibine ait modüller |
| Other | Yukarıda yer almayan her şey |

Bir **Toggle descriptions** düğmesi, kompakt listeyle her modülü kategorisi altında listeleyen daha uzun bir düzen arasında geçiş yapar; bu düzen, modülün geçerli kanalda sizin için etkin olup olmadığını bir onay ya da çarpı işaretiyle gösterir. Bir dünya simgesi ve çarpı, bot sahiplerinin modülü her yerde devre dışı bıraktığı anlamına gelir.

### Modül sayfaları

`commands <module>` doğrudan bir modüle gider. Ad tam olabilir ya da benzersiz bir önek olabilir; bu yüzden `cmds mod` Moderation'ı açarken `cmds s` birden fazla modülün eşleştiğini belirtir. Modülün adından sonra bir kelime ekleyerek filtreleyebilirsiniz: `cmds utility remind` yalnızca adında ya da açıklamasında "remind" geçen Utility komutlarını listeler.

Otuzdan fazla komutu olan ve en az üç bölümü bulunan modüller önce bir genel bakış gösterir: modül açıklaması, her bölüm için komut sayısını gösteren bir alan, bir bölümü açmak için açılır menü, bir **All commands** düğmesi, form açan bir **Ara** düğmesi ve **Geri**. Daha küçük modüller doğrudan sayfalı listeye gider. Sayfalar, bölümlere göre gruplanmış on komut içerir; düğmeler ilk, önceki, atla, sonraki, son, geri ve kapat şeklindedir. Sayfalandırıcı bir saat boyunca etkin kalır.

## Komut sayfaları

`help <command>`, tam adı veya herhangi bir takma adı eşleştirir. Embed şunları içerir:

- Komut, önekiyle ve ilk takma adıyla birlikte ve açıklaması.
- **User Permissions**: sizin ihtiyacınız olan izinler. Administration modülündeki bir Discord izin geçersiz kılması yerleşik gereksinimin yerine geçtiğinde, orijinal gereksinim üstü çizili gösterilir ve geçersiz kılma ardından listelenir.
- **Bot Permissions**: botun ihtiyacı olan izinler.
- **Documentation**: komutun belgeler sitesindeki sayfasına bağlantı.
- **Bekleme süresi**: yalnızca komutun bir bekleme süresi varsa gösterilir.
- **Slash Command**: varsa slash sürümünün tıklanabilir bahsi.
- Komut belgelerinden gelen **Parameters**, **Overloads** ve **Kullanım**; her argümanı, isteğe bağlı olup olmadığını ve varsayılan değerini listeler.
- Modül, alt modül ve metot adını içeren bir altbilgi; hata bildirirken kullanışlıdır.

**Çalıştır** düğmesi komutu, sanki siz yazmışsınız gibi çalıştırır. Argüman gerektiriyorsa önce bir form bunları sorar. Yöneticiler ayrıca bir **İzinler** düğmesi görür; bu, o komut için Komut İzinleri hızlı menüsünü açar ve Komut İzinleri makalesinde anlatılmıştır.

## Slash ve metin komutları

Metin komutları sunucu önekini kullanır; varsayılanı `.` tir ve yardım menüsündeki tam adları kullanır. Slash komutları gruplandırılmıştır; bu yüzden `setprivacy` gibi bir metin komutu `/setprivacy` olarak görünürken izin komutları `/permissions servercommand` altında yer alır. Komut sayfası, tıklayabilmeniz için slash bahsini gösterir. İki biçim de aynı izin kurallarından geçer.

## Bot katıldığında

Bot bir sunucuya eklendiğinde, onu kimin davet ettiğini denetim kaydından bulur (bunun için Denetim Kaydını Görüntüle iznine ihtiyacı vardır) ve o kişiye DM gönderir. Mesajda, o sunucunun kontrol paneli sihirbazına bağlanan bir **Set Up Mewdeko** düğmesi, `cmds`, `cmds mod` ve `h purge` komutlarını hatırlatan üç adımlık bir not ve destek sunucusu bağlantısı bulunur. Davet edeni belirlenemezse veya DM'leri kapalıysa hiçbir şey gönderilmez; kanala bir duyuru da yapılmaz.

## Kurulum sihirbazı

Sihirbaz kontrol panelinde `/wizard?guild=<id>` adresinde bulunur. Karşılama DM'indeki bağlantı hızlı kurulum türünü açar; kontrol panelinin kendisi ilk kez kurulum türünü sunabilir ve bu tür başlangıçta bir izin kontrolü ekler.

| Adım | Ne yapar |
| --- | --- |
| Hoş geldin | Ne olacağını açıklar |
| İzinler | Yalnızca ilk kez: botun ihtiyaç duyduğu izinleri kontrol eder |
| Sunucu Temelleri | Önek, bot dili ve sunucu saat dilimi |
| Özellikleri Seç | Neyin yapılandırılacağını seçin; özellikler tam kurulum ya da hızlı etkinleştirme olarak işaretlenir |
| Tam kurulum gerektiren her özellik için bir adım | O özellik için yönlendirmeli yapılandırma |
| Hızlı Kurulum | Kalan özellikleri varsayılanlarıyla toplu olarak etkinleştirir |
| Tamamlandı | Kaydetme sırasında başarısız olanlar dahil özet |

İlerleme sunucu başına saklanır; bu yüzden ayrılıp geri dönmek kaldığınız yerden devam etmenizi sağlar. Bir sunucu atlanmış olarak işaretlenebilir, böylece sihirbaz kendini bir daha sunmaz. **Ayarlarım** sayfasında, yönlendirmeli kurulumu tercih edip etmediğinizi belirleyen bir anahtar ve bir sunucunun sihirbaz durumunu sıfırlamak için bir seçenek bulunur.

## Ayarlar

Yardım modülünün kendisi için ayarlanacak bir şey yoktur. Önek, Administration modülüyle ayarlanır ve her yardım embed'inde gösterilir.

| Ayar | Varsayılan | Kontrol ettiği şey |
| --- | --- | --- |
| Önek | `.` | Yardım metninde gösterilen ve Run düğmesi için kullanılan önek |
| Ayrıntılı izinler | kapalı | Engellenen bir komutun hangi izin kuralı yüzünden engellendiğini açıklayıp açıklamayacağı (bkz. Komut İzinleri) |

## Kurulum adımları

1. `help` komutunu çalıştırın ve modüllerin nasıl gruplandığını görmek için bir kategoriyi açılır menüden açın.
2. Moderation modülünü görmek için `cmds mod`, tek bir komutun tamamını görmek için `h purge` komutunu çalıştırın.
3. `h ping` gibi zararsız bir komutta **Çalıştır** düğmesini deneyin.
4. Aramanın nasıl daraltma yaptığını görmek için `searchcommand role` komutunu çalıştırın.
5. Botu yeni davet ettiyseniz, karşılama DM'indeki **Set Up Mewdeko** bağlantısını takip edin ya da kontrol panelinde `/wizard?guild=<your server id>` adresini açın.

## Komutlar

Bu komutları sunucunuzun önekiyle çalıştırın (değiştirmediyseniz `.`).

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `help [command]` | `h` | Hiç kimse | Yardım menüsü ya da tek bir komut için yardım |
| `commands [module] [term]` | `cmds` | Hiç kimse | Modül listesi, bir modülün komutları ya da filtrelenmiş liste |
| `modules` | `mdls` | Hiç kimse | `help` ile aynı üst düzey menü |
| `searchcommand <term>` | | Hiç kimse | Komut adlarında ve açıklamalarında arama yapar, en fazla 20 sonuç |
| `guide` | `readme` | Hiç kimse | Başlangıç rehberine bağlantı |
| `source` | `github`, `repo`, `gitlab`, `bitbucket` | Hiç kimse | Kaynak koduna bağlantı |
| `donate` | | Hiç kimse | Botu nasıl destekleyebileceğiniz |
| `vote` | | Hiç kimse | Bota oy vermek için bağlantı |
| `exportcommandsjson` | `exportcommands`, `excj` | Hiç kimse | Her komutu bir JSON dosyası olarak dışa aktarır (dakikada bir) |

Yalnızca slash: otomatik tamamlamalı `/search <command>` ve `/invite`. `/help`, `/commands <module> [filter]`, `/donate`, `/guide`, `/source` ve `/vote` metin komutlarını yansıtır.

## İpuçları ve tuzaklar

- `help` bir modülün yanında sizin için çarpı gösteriyorsa, bir izin kuralı ya da bot sahipleri o modülü o kanalda devre dışı bırakmıştır. Yetkililerden `listperms` ile kontrol etmelerini isteyin.
- Yardım sayfaları komutun gerçek ön koşullarını yansıtır; bu yüzden orada listelenen bir izin, belgeler sitesi geride kalmış olsa bile kesindir.
- Run düğmesi botun izinlerini değil, sizin izinlerinizi kullanır. Bir kolaylıktır, bir atlatma yolu değildir.
- Modül adını önekle eşleştirmek, kısa önekleri genellikle belirsiz yapar; en az üç dört harf kullanın.
- Bot yalnızca katılımda davet ediciye DM gönderir. Botu paylaşılan bir bağlantıyla davet ettiyseniz ve hiçbir şey almadıysanız, sihirbazı kontrol panelinden açın.

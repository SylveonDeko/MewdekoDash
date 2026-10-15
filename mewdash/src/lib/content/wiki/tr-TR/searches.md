---
title: Aramalar
slug: searches
summary: Discord'dan ayrılmadan arama yap: hava durumu, saat ve sözlük tanımlarından anime, film, görsel, osu! profilleri, şakalar ve tepki GIF'lerine kadar.
icon: fa-magnifying-glass
category: Entertainment
module: Searches
tags: [search, weather, time, define, urban dictionary, wikipedia, google, image search, anime, manga, movie, osu, pokemon, translate, xkcd, meme, reddit, hug, pat, ship, arama, hava durumu, saat, tanım, sözlük, vikipedi, görsel arama, film, çeviri, şaka, tepki]
related: [streams, feeds, twitch, games, utility]
---

## Ne yapar

Aramalar modülü, dış bir servisten bir şey getirip kanala gönderen bir dizi arama komutudur. Üyeler bir şehrin hava durumunu, bir yerdeki saati, bir kelimenin tanımını, bir anime ya da filmi, bir Vikipedi özetini, rastgele bir kedi resmini ya da bir sarılma ya da tokat için tepki GIF'ini ister. Çoğu sonuç bir embed olarak gelir ve çok sonuçlu aramalar sayfalara bölünür.

Bir kontrol paneli sayfası yoktur. Neredeyse her komut herkese açıktır; yalnızca çeviri otomatik modu yetkili izni gerektirir.

Yayın bildirimleri ve RSS beslemeleri aynı bot modülünde yer alır ama kendi makalelerine sahiptir. `streamadd`, `feedadd` ve diğerleri için yayın bildirimleri ve besleme sayfalarına bak.

## Neden kullanmalısın

- "Senin orada saat kaç?" sorusunu matematik yapmak yerine `time` ile çöz.
- Bir etkinlikten önce etkileşimli bir `weather` kartıyla tahmine bak.
- Sohbet ederken bir anime, manga ya da karakteri hemen ara.
- Üyelerin sarılma, pat ve high five'ları GIF olarak göndermesine izin ver.
- Bir mesajı anında çevir ya da uluslararası bir topluluk için bir kanalı otomatik çevir.

## Hava durumu ve saat

`weather <place>` yeri Open-Meteo ile koordinatlara çevirir ve anlık koşulları gösterir: sıcaklık, hissedilen sıcaklık, nem, rüzgar hızı ve hamleleri, basınç, bulutluluk, görüş mesafesi ve günün en yüksek ve en düşük değeri. Düğmeler ve bir açılır menü saatlik tahmine, ayrıntılı saatlik koşullara ve bugün ile yarının en yüksek, en düşük ve yağış değerlerini gösteren günlük görünüme geçer.

`time <place>` yeri arar ve anlık saati ile saat dilimini gösterir. Birden fazla yer eşleşirse seçebileceğin adayları sunar.

## Kelimeler ve bilgi

| Komut | Kaynak | Sonuç |
| --- | --- | --- |
| `define <word>` | Pearson sözlüğü | Tanım, sözcük türü ve bir örnek cümle |
| `urbandict <term>` | Urban Dictionary | Tanımlar, sayfalı |
| `wiki <query>` | Vikipedi | İlk eşleşen sayfanın özeti |
| `wikia <site> <query>` | Bir Fandom wikisi | O wikiden özet |
| `google <query>` | Google, yoksa DuckDuckGo | Web sonuçları |
| `bible <book> <chapter:verse>` | Bible API | Ayetin metni |
| `resolvetonetags <text>` | yerleşik | Metinde bulunan `/j` ya da `/s` gibi ton etiketlerini açıklar |
| `translate <langs> <text>` | çeviri API'si | Çevrilmiş metin; langs `from>to` biçimindedir, örneğin `translate en>fr hello` |
| `translangs` | çeviri API'si | Kullanabileceğin diller |

### Otomatik çeviri

`autotranslate` mevcut kanal için otomatik çeviriyi açıp kapatır ve Yönetici izni gerektirir. Çeviriden sonra özgün mesajı silmek için `del`, saklamak için `nodel` (varsayılan) geçir. Ardından her üye bu kanal için kendi dil çiftini `autotranslang en>fr` ile ayarlar; kaldırmak için `autotranslang` komutunu boş çalıştırır.

## Medya ve fandom

| Komut | Ne alırsın |
| --- | --- |
| `anime <query>` | Ayrıntılarla anime arama sonuçları |
| `manga <query>` | Manga arama sonuçları |
| `charinfo <name>` | Bir karakterin adları, açıklaması ve görseli |
| `findanime [image]` | trace.moe ile bir ekran görüntüsünden animeyi tanımlar; bir görsel ekle ya da bir URL ver |
| `mal <username or @user>` | İzleniyor, tamamlandı ve diğer istatistiklerle bir MyAnimeList profili |
| `movie <title>` | OMDb üzerinden IMDb ayrıntıları |
| `youtube <query>` | YouTube arama sonuçları |
| `steam <game>` | Oyunun Steam mağaza sayfasına bağlantı |
| `pokemon <name>` | Pokemon ayrıntıları |
| `osu <user> [mode]`, `osu5 <user> [mode]` | osu! profili ya da en iyi beş oyun; modlar standard, taiko, catch ve mania |
| `gatari <user> [mode]` | osu!Gatari profili |
| `xkcd [number or latest]` | Bir xkcd çizgi romanı, varsayılan olarak rastgele |

## Görseller

`image <query>`, Google ve DuckDuckGo'da katı güvenli arama ile arar, sonuçları sayfalı bir embed'de göstermeden önce bir güvenlik kontrolünden geçirir. Her üye yirmi saniyede bir kez kullanabilir. `safebooru <tag>`, Safebooru'dan etiketli bir görsel çeker. `revimg <url>` ve `revav [@user]`, bir görsel ya da avatar için Google, TinEye ve Yandex üzerinde ters görsel arama bağlantıları verir. `color <hex...>`, bir ya da daha fazla hex rengi için renk örnekleri oluşturur.

Rastgele görseller: `randomcat`, `randomdog`, `randomfood`, `randombird`, `randomneko`, `randomkitsune` ve `randomwaifu`. `meme`, bir dizi subreddit'ten rastgele bir meme paylaşır; `randomreddit <subreddit>` ise NSFW olarak işaretlenmediğini kontrol ettikten sonra bir subreddit'ten rastgele bir gönderi paylaşır. `memelist` memegen şablonlarını gösterir, `memegen <template> [text]` bir tane oluşturur. `rip @user`, adı ve avatarı olan bir mezar taşı görseli yapar. `shorten <url>` bir bağlantıyı kısaltır.

## Şakalar

`randjoke`, `yomama`, `chucknorris`, `wowjoke` ve `magicitem` her biri kendi API'lerinden bir şaka ya da eşya açıklaması çeker. `catfact` bir kedi gerçeği paylaşır.

## Tepki komutları

Bunlar eylem için bir anime GIF'i gönderir. Birine yönelik olanlar bir etiket bekler: `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold` ve `highfive`. Kendinle ilgili olanlar isteğe bağlı metin alır: `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave` ve `wink`. Hepsi ayrıca slash komutu olarak da kullanılabilir.

`ship @user [@user2]`, iki üyenin (ya da senin ve bir üyenin) uyumluluğunu puanlar ve bir yorumla birlikte bir ship görseli gönderir.

## Ayarlar

Bu modülün kontrol paneli sayfası yoktur ve otomatik çeviri anahtarı dışında sunucu başına bir ayarı yoktur. Birkaç komut, bot sahibinin yapılandırdığı API anahtarlarına dayanır; bir anahtar eksikse komut sonuç yerine bir hata yanıtı verir.

## Kurulum adımları

1. Hiçbir şeyi açman gerekmez. Botun kanalda yanıt verebildiğini doğrulamak için `weather London` ya da `define serendipity` çalıştır.
2. Çevrilen bir kanal istiyorsan orada bir yönetici olarak `autotranslate` çalıştır, sonra üyelerin `autotranslang en>es` gibi bir şey ayarlamasını sağla.
3. Tepki ya da görsel komutlarını belirli kanallarla sınırlamak istersen izinler modülünü kullan.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `weather <place>` | `we` | Yetki gerekmez | Etkileşimli hava durumu kartı |
| `time <place>` | | Yetki gerekmez | Anlık saat ve saat dilimi |
| `define <word>` | `def` | Yetki gerekmez | Sözlük tanımı |
| `urbandict <term>` | `ud` | Yetki gerekmez | Urban Dictionary |
| `wiki <query>` | `wikipedia` | Yetki gerekmez | Vikipedi özeti |
| `wikia <site> <query>` | `fandom` | Yetki gerekmez | Fandom wiki araması |
| `google <query>` | `g` | Yetki gerekmez | Web araması |
| `bible <book> <chapter:verse>` | | Yetki gerekmez | İncil ayeti |
| `resolvetonetags <text>` | `tonetag`, `resolvetonetag`, `tonetags` | Yetki gerekmez | Ton etiketlerini açıkla |
| `translate <langs> <text>` | `trans` | Yetki gerekmez | Metni çevir, örneğin `translate en>fr hello` |
| `translangs` | | Yetki gerekmez | Desteklenen diller |
| `autotranslate [del\|nodel]` | `at`, `autotrans` | Yönetici | Kanal için otomatik çeviriyi aç/kapat |
| `autotranslang [from>to]` | `atl` | Yetki gerekmez | Otomatik çeviri için dil çiftin |
| `anime <query>` | `ani`, `aq` | Yetki gerekmez | Anime araması |
| `manga <query>` | `mang`, `mq` | Yetki gerekmez | Manga araması |
| `charinfo <name>` | `characterinfo` | Yetki gerekmez | Karakter araması |
| `findanime [image]` | `whatanime` | Yetki gerekmez | Bir ekran görüntüsünden anime tanımla |
| `mal <username or @user>` | | Yetki gerekmez | MyAnimeList profili |
| `movie <title>` | `omdb`, `imdb` | Yetki gerekmez | Film ayrıntıları |
| `youtube <query>` | `yt` | Yetki gerekmez | YouTube araması |
| `steam <game>` | | Yetki gerekmez | Steam mağaza bağlantısı |
| `pokemon <name>` | | Yetki gerekmez | Pokemon ayrıntıları |
| `osu <user> [mode]` | | Yetki gerekmez | osu! profili |
| `osu5 <user> [mode]` | | Yetki gerekmez | En iyi beş osu! oyunu |
| `gatari <user> [mode]` | | Yetki gerekmez | osu!Gatari profili |
| `xkcd [number\|latest]` | | Yetki gerekmez | xkcd çizgi romanı |
| `image <query>` | `img`, `rimg` | Yetki gerekmez | Güvenli görsel araması |
| `safebooru [tag]` | | Yetki gerekmez | Safebooru görseli |
| `revimg <url>` | | Yetki gerekmez | Ters görsel arama bağlantıları |
| `revav [@user]` | | Yetki gerekmez | Bir avatarda ters arama |
| `color <hex...>` | `clr` | Yetki gerekmez | Renk örnekleri |
| `randomcat` | `meow` | Yetki gerekmez | Kedi resmi |
| `randomdog` | `woof` | Yetki gerekmez | Köpek resmi |
| `randomfood` | `yum` | Yetki gerekmez | Yemek resmi |
| `randombird` | `birb`, `bird` | Yetki gerekmez | Kuş resmi |
| `randomneko` | `neko` | Yetki gerekmez | Neko resmi |
| `randomkitsune` | `kitsune` | Yetki gerekmez | Kitsune resmi |
| `randomwaifu` | `waifu` | Yetki gerekmez | Waifu resmi |
| `meme` | `randommeme` | Yetki gerekmez | Rastgele Reddit memi |
| `randomreddit <subreddit>` | `subreddit` | Yetki gerekmez | Bir subreddit'ten rastgele gönderi |
| `memelist` | | Yetki gerekmez | Memegen şablonları |
| `memegen <template> [text]` | | Yetki gerekmez | Bir meme oluştur |
| `rip <@user>` | | Yetki gerekmez | Mezar taşı görseli |
| `shorten <url>` | | Yetki gerekmez | Bir bağlantıyı kısalt |
| `randjoke` | | Yetki gerekmez | Rastgele şaka |
| `yomama` | `ym` | Yetki gerekmez | Yo mama şakası |
| `chucknorris` | `cn` | Yetki gerekmez | Chuck Norris şakası |
| `wowjoke` | | Yetki gerekmez | World of Warcraft şakası |
| `magicitem` | `mi` | Yetki gerekmez | WoW büyülü eşyası |
| `catfact` | | Yetki gerekmez | Kedi gerçeği |
| `ship <@user> [@user2]` | | Yetki gerekmez | Uyumluluk puanı görseli |
| `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold`, `highfive <@user>` | | Yetki gerekmez | Birine yönelik tepki GIF'i |
| `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave`, `wink [text]` | | Yetki gerekmez | Kendinle ilgili tepki GIF'i |

## İpuçları ve tuzaklar

- Bu komutlar dış servisleri çağırır; sonuçlar o servislerin çalışmasına ve bot sahibinin doğru API anahtarlarına sahip olmasına bağlıdır.
- `image` üye başına yirmi saniyede bir arama ile sınırlıdır ve sonuçlar NSFW kanallarında bile güvenlik için filtrelenir.
- `randomreddit`, NSFW olarak işaretlenmiş subreddit'leri reddeder. Yetişkin içerik için NSFW modülünü kullan.
- Otomatik çeviri kanal ve üye bazındadır: kanalın bir yönetici tarafından açılmış olması gerekir ve her üye kendi çiftini seçer.
- Yayın bildirimleri (`streamadd`, `streamlist`, `streamtemplate`) ve RSS beslemeleri (`feedadd`, `feedlist`) aynı modülü paylaşsa da ayrı olarak belgelenmiştir.

---
title: NSFW
slug: nsfw
summary: Yalnızca NSFW olarak işaretlenmiş kanallarda çalışan yetişkin resim komutları; sunucu başına etiket kara listesi ve isteğe bağlı zamanlı otomatik gönderim ile.
icon: fa-eye-slash
category: Entertainment
module: Nsfw
tags: [nsfw, hentai, booru, rule34, e621, danbooru, gelbooru, nhentai, reddit, tag blacklist, autohentai, nsfwtoggle, yetişkin içerik, resim panoları, etiket kara listesi, otomatik gönderim]
related: [servermanagement, permissions, filter]
---

## Ne işe yarar

NSFW modülü, istek üzerine resim panolarından ve Reddit'ten yetişkin resimleri getirir. Modüldeki her komut Discord'un NSFW şartını taşır: yalnızca NSFW bayrağı ayarlanmış bir kanalda çalışır ve resim panosu komutlarının çoğu botla DM'de de çalışır. Başka bir kanalda komut sessizce reddedilir.

Yetkililer iki şeyi kontrol eder. `nsfwtoggle` (Administration modülünde) geçerli kanalın NSFW bayrağını değiştirir; bu, o kanalda bu komutların çalışmasını sağlar. `nsfwtagbl` ise bu sunucudaki her resim panosu aramasından çıkarılan etiketlerin listesini tutar; böylece bir sunucu modüle izin verirken istemediği içeriği dışarıda bırakabilir.

Üyeler bir kaynak komutunu isteğe bağlı etiketlerle çalıştırır ve etiketi, kaynağı ve ilk birkaç etiketiyle birlikte tek bir resim alır. "Bomb" varyantları aynı anda dört tane gönderir. Moderatörler ayrıca belirli aralıklarla bir kanala yeni bir resim gönderen bir zamanlayıcı başlatabilir.

## Neden kullanmalısınız

- 18 yaş üstü bir sunucu, resim komutlarını yalnızca işaretlenmiş kanallarla sınırlamak isteyebilir.
- Yetkililer, modülü kapatmadan belirli etiketleri sunucu genelinde engellemek ister.
- Özel bir kanalın zamanlayıcıyla, kimsenin yazmasına gerek kalmadan yeni resimler almasını istersiniz.

## Kanal şartı

Discord'un NSFW bayrağı kanal başınadır. Bu bayrağı açmak ya da kapatmak için bir kanalda `nsfwtoggle` komutunu çalıştırın; sizin ve botun Kanalları Yönet iznine ihtiyacı vardır. Bot yeni durumu onaylamak için yanıt verir. Aynı bayrak Discord'un kanal ayarlarından da belirlenebilir.

Komut NSFW olmayan bir kanalda kullanılırsa hiçbir şey olmaz. Üyeler bunu bazen botun bozuk olduğu şeklinde yorumlar; kurallar kanalınızda bir not bulunması işe yarar.

## Kaynaklar

| Komut | Kaynak | Notlar |
| --- | --- | --- |
| `hentai [tags]` | Birleştirilmiş panolar, yalnızca açık içerik | Beş saniyelik bekleme süresi |
| `yandere`, `konachan`, `sankaku`, `e621`, `rule34`, `danbooru`, `gelbooru`, `derpibooru`, `safebooru`, `realbooru` | Adı geçen pano | Her biri isteğe bağlı etiketler alır |
| `hentaibomb [tags]` | Yandere, Danbooru, Konachan ve Gelbooru | Aynı anda dört resim |
| `pornbomb [tags]` | Realbooru | Aynı anda dört resim |
| `redditnsfw <subreddit>` | O subreddit'teki rastgele bir en iyi gönderi | On saniyelik bekleme süresi |
| `boobs`, `butts` | `redditnsfw` üzerinden sabit subreddit'ler | |
| `pussy`, `anal`, `porn`, `bondage`, `hentaigif` | Kategori uç noktaları | Yalnızca NSFW kanal, DM yok |
| `nhentai <id>` | Numarasıyla belirli bir galeri | lolicon veya shotacon etiketli galerileri reddeder |
| `nhentaisearch <query> [page] [type] [blacklist]` | Galeri araması | |

Etiketler boşlukla ayrılır. e621 ve Derpibooru'da `yuri` etiketi, o panonun karşılığına otomatik olarak çevrilir. Sunucu başına aynı anda yalnızca bir `hentaibomb` ve bir `pornbomb` çalışabilir.

## Etiket kara listesi

Argümansız `nsfwtagbl` kara listedeki etiketleri listeler. `nsfwtagbl <tag>` etiketi ekler; zaten listedeyse kaldırır. Kara listedeki bir etiketi taşıyan sonuçlar, sunucudaki her resim panosu komutunda atlanır. Mesajları Yönet izni gerekir.

## Otomatik gönderim

`autohentai <seconds> [tags]`, `autoboobs <seconds>` ve `autobutts <seconds>` geçerli kanalda bir zamanlayıcı başlatır. `autohentai` ve `autobutts` için aralık en az 20 saniye olmalıdır; `autoboobs` için bir alt sınır uygulanmaz. Komutu `0` ile ya da aralık olmadan çalıştırmak, o kanaldaki zamanlayıcıyı durdurur. `autohentai` için alternatif etiket kümelerini `|` ile ayırın; bot her seferinde birini rastgele seçer. Rastgele resimler için etiketleri hiç yazmayın. Bunlar için Mesajları Yönet izni gerekir ve kanal NSFW olmalıdır. Zamanlayıcılar bot yeniden başladığında korunmaz.

## Ayarlar

Bu modül için kontrol panelinde bir sayfa yoktur.

| Ayar | Varsayılan | Kontrol ettiği şey |
| --- | --- | --- |
| Kanal NSFW bayrağı | kapalı | Bu komutların bir kanalda çalışıp çalışmayacağı |
| Etiket kara listesi | boş | Bu sunucudaki resim panosu sonuçlarından çıkarılan etiketler |
| Otomatik gönderim zamanlayıcıları | yok | `auto...` komutlarıyla kanal başına başlatılan zamanlayıcılar |

## Kurulum adımları

1. Bir kanal seçin ve o kanalda `nsfwtoggle` komutunu çalıştırın ya da bayrağı Discord'un kanal ayarlarından belirleyin.
2. Modülü başka hiçbir yerde açmamak için Komut İzinleri'ni kullanın; örneğin `srvrmdl nsfw disable` ardından `chnlmdl nsfw enable #adult`.
3. İstemediğiniz etiketleri `nsfwtagbl <tag>` ile, her komut için bir tane olacak şekilde ekleyin.
4. Kanalda `hentai` ya da `rule34 <tag>` ile test edin.
5. İsterseniz `autohentai 300 <tags>` ile başlatın ve daha sonra `autohentai 0` ile durdurun.

## Komutlar

Bu komutları sunucunuzun önekiyle çalıştırın (değiştirmediyseniz `.`).

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Kanalları Yönet | Geçerli kanalın NSFW bayrağını değiştirir |
| `nsfwtagbl [tag]` | `nsfwtbl` | Mesajları Yönet | Kara listedeki bir etiketi listeler, ekler veya kaldırır |
| `hentai [tags]` | | Hiç kimse | Birleştirilmiş panolardan tek bir açık resim |
| `hentaibomb [tags]` | | Hiç kimse | Dört panodan dört resim |
| `pornbomb [tags]` | | Hiç kimse | Dört Realbooru resmi |
| `yandere [tags]` | | Hiç kimse | Yande.re |
| `konachan [tags]` | | Hiç kimse | Konachan |
| `sankaku [tags]` | | Hiç kimse | Sankaku |
| `e621 [tags]` | | Hiç kimse | e621 |
| `rule34 [tags]` | `r34` | Hiç kimse | Rule34 |
| `danbooru [tags]` | | Hiç kimse | Danbooru |
| `gelbooru [tags]` | | Hiç kimse | Gelbooru |
| `derpibooru [tags]` | `derpi` | Hiç kimse | Derpibooru |
| `safebooru [tags]` | | Hiç kimse | Safebooru |
| `realbooru [tags]` | `rb` | Hiç kimse | Realbooru |
| `redditnsfw <subreddit>` | `nsfwsubreddit` | Hiç kimse | Bir subreddit'ten rastgele gönderi |
| `boobs` | | Hiç kimse | Reddit kısayolu |
| `butts` | `ass`, `butt` | Hiç kimse | Reddit kısayolu |
| `pussy` | | Hiç kimse | Kategori resmi |
| `anal` | | Hiç kimse | Kategori resmi |
| `porn` | | Hiç kimse | Kategori resmi |
| `bondage` | | Hiç kimse | Kategori resmi |
| `hentaigif` | | Hiç kimse | Kategori GIF'i |
| `nhentai <id>` | `nh` | Hiç kimse | Numarasıyla bir galeriye göz at |
| `nhentaisearch <query> [page] [type] [blacklist]` | `nhsearch`, `nhs` | Hiç kimse | Galerilerde ara |
| `autohentai [seconds] [tags]` | | Mesajları Yönet | Zamanlı gönderim; `0` durdurur |
| `autoboobs [seconds]` | | Mesajları Yönet | Zamanlı gönderim; `0` durdurur; alt aralık sınırı yok |
| `autobutts [seconds]` | | Mesajları Yönet | Zamanlı gönderim; `0` durdurur |

## İpuçları ve tuzaklar

- Yaş kontrolü, Discord'un kanal bayrağı ile botun etiket kara listesinin birleşimidir. Bot üyelerin yaşını ya da rollerini kontrol etmez; bunun için Komut İzinleri'ni kullanın.
- Bot sahipleri modülü genel olarak da devre dışı bırakabilir; bu durumda yardım menüsünde engellenmiş görünür.
- Resim panoları istek sınırına takılabilir ve dar etiket kombinasyonlarında bazen hiçbir şey döndürmez; bu durumda bot resim bulunamadığını bildirir.
- Zamanlayıcılar kanal başınadır ve bellektedir. Yeniden başlatmadan sonra bunları yeniden başlatmanız gerekir.

---
title: Para Birimi
slug: currency
summary: Sunucu başına cüzdanlar ve bir banka, günlük ödüller, çalışma ve suç, bir rol ve eşya mağazası ve yirmiden fazla bahis oyunu. Hepsi kontrol panelinden ayarlanabilir.
icon: fa-money-bill
category: Entertainment
dashboard: /dashboard/currency
module: Currency
tags: [currency, economy, money, coins, shop, balance, bank, daily, work, crime, rob, pay, gambling, blackjack, roulette, slots, leaderboard, para birimi, ekonomi, para, madeni para, mağaza, bakiye, banka, günlük, çalışma, suç, soygun, ödeme, kumar, rulet, slot, sıralama tablosu]
related: [xp, administration]
---

## Ne yapar

Her üyenin bir cüzdanı vardır ve bankayı açık bıraktıysan bir banka bakiyesi de. Günlük ödülü alarak, `work` ve `crime` komutlarını bekleme süreleriyle çalıştırarak, oyunları kazanarak ya da diğer üyelerden ödeme alarak para kazanırlar. Parayı sunucunun mağazasında rollere, koleksiyon eşyalarına ya da metin eşyalarına harcarlar, ya da blackjack, rulet, slot, crash ve keno gibi oyunlarda bahse yatırırlar.

Yetkililer ekonominin nasıl işleyeceğine karar verir: kumarın açık olup olmayacağını, bahis sınırlarını, ev avantajını, çalışma ve suçun ne kadar ödediğini, soygunun olup olmayacağını, transfer vergisini, banka faizini ve günlük seri bonuslarını. Bunların her biri **Yapılandırma** sekmesinde ya da bir `economyset` anahtarıyla ayarlanır, yani oyunlara dokunmadan ekonomiyi ince ayarlayabilirsin.

Bot her kredi ve borcu bir işlem olarak kaydeder. Böylece üyeler paralarının nereye gittiğini görebilir ve **Analitik** sekmesi sana para arzını, nerede durduğunu ve hangi oyunların kazandıklarından fazla ödeme yaptığını gösterebilir.

## Neden kullanmalısın

- Aktif üyelere harcayacakları bir şey ver: renkli bir rol, özel bir unvan ya da bir oyun kanalında biraz eğlence.
- Bahis sınırları, günlük kayıp limiti ve ev avantajı senin için uygulandığı için adil kalan bir oyun kanalı işlet.
- Yardım eden üyeleri `modifybalance` ya da **Bakiyeyi düzenle** aracıyla ödüllendir ve onların mağazadan seçim yapmasına izin ver.
- Her oyunun gerçek getirisini görmek için **Oyun performansı** tablosuna bak ve `payoutmultiplier` değerini tahmine göre değil veriye göre ayarla.

## Bakiyeler, banka ve transferler

`cash` cüzdanını gösterir; bankada bir şeyin varsa banka bakiyeni ve net varlığını da gösterir. `bank` aynı bilgiyi herhangi bir üye için gösterir ve alacağı faizi de tahsil eder. `deposit` ve `withdraw` parayı iki yer arasında taşır; miktar olarak `all` de kullanılabilir. Bankadaki para soyulamaz ve **Banka kapasitesi** ne kadar saklanabileceğini sınırlar (0 sınırsız demektir).

Faiz, bir üye `bank` komutunu çalıştırdığında ödenir: son faiz ödemesinden bu yana aralık geçtiyse banka bakiyesi **Faiz (%)** kadar bir kez kazanç sağlar. Kimse kontrol etmezse faiz ödenmez.

`pay` cüzdan parasını başka bir üyeye gönderir; **Transfer vergisi (%)** düşülür ve **Minimum transfer** ile isteğe bağlı bir bekleme süresi geçerlidir. Botlara ödeme yapılamaz.

`transactions` sana ya da başka bir üyeye ait son 250 kaydı, sayfa başına on tane olacak şekilde listeler. `cashleaderboard` üyeleri cüzdan artı bankaya göre sıralar.

## Kazanma

| Komut | Varsayılan | Ne olur |
| --- | --- | --- |
| `dailyreward` | Yetkililer `setdaily` çalıştırana kadar ayarlanmaz | Günlük miktarı bekleme süresi başına bir kez ekler. Seriler açıksa, her ardışık alımda serideki günlerin ilk günden sonraki sayısı kadar **Günlük bonus** eklenir ve **Maksimum bonus** ile sınırlanır. Tam bir bekleme süresi kaçırılırsa seri sıfırlanır. |
| `work` | 50 ile 250 arası, her 30 dakikada bir | Ayarlanan aralıkta rastgele bir ödeme yapar, her zaman başarılıdır. |
| `crime` | 200 ile 800 arası, %45 başarı, saatte bir | Başarılıysa suç aralığında öder. Başarısızsa 100 ile 500 arası bir ceza keser; cüzdanındaki parayla sınırlıdır. |
| `rob @user` | Kapalı | Açıkken: hedefin cüzdanının en fazla %20'sini %35 ihtimalle alır. Cüzdanında 100'den az olan hedefler korunur. Başarısızlık, kendi cüzdanının %15'ine mal olur. Saatte bir deneme hakkın vardır. |

## Oyunlar

Her bahis aynı kontrollerden geçer: kumar açık olmalı, bahis **Minimum bahis** ile **Maksimum bahis** arasında olmalı, üye son 24 saatte **Günlük kayıp limiti**ne ulaşmamış olmalı ve varsa oyun bekleme süresi geçmiş olmalı. Bahis baştan alınır. Kazançlar `stake plus profit` olarak hesaplanır ve kâr kısmı **Ödeme çarpanı** ile ölçeklenir. Yani 0,9 çarpanı her kazancı yüzde on kırpar, berabere kalan bir bahis ise bahsin tamamını iade eder.

| Oyun | Nasıl öder |
| --- | --- |
| `coinflip <bet> heads/tails` | Doğru tahmin için bahis kadar kazanç |
| `highlow higher/lower [bet]` | 1 ile 10 arasında bir sayı gösterilir; sonraki sayıyı tahmin et. Bahis kadar kazanç, aynı sayı gelirse bahis iade edilir. Varsayılan bahis 100 |
| `spinwheel [bet]` | Bahsin eksi yüzde 10'undan artı yüzde 30'una kadar segmentleri olan ağırlıklı bir çark. Varsayılan bahis 10 |
| `blackjack <bet>`, sonra `hit` ve `stand` | Krupiye 17'ye kadar kart çeker. Kazanırsan bahis kadar kazanç, berabere kalırsan iade |
| `slot [bet]` | İki eşleşen sembol 2 katı öder. Üç eşleşen 3 katı öder; üzüm 5 katı, yedi 7 katı, elmas 10 katı öder. Varsayılan bahis 10 |
| `roulette <bet> <type>` | 0 ile 36 arasındaki bir sayı 35'e 1 öder. `red`, `black`, `even` ya da `odd` bahis kadar öder; sıfır renk ve tek/çift bahislerini kaybettirir |
| `rps <choice> [bet]` | Taş, kağıt, makas, kertenkele, Spock; bota karşı. Bahis kadar kazanç, berabere kalırsan iade. Bahis isteğe bağlıdır |
| `war <bet>` | Yüksek kart bahis kadar kazanır. Berabere kalınırsa ikinci bir bahis alınır ve iki katı için bir kart daha çekilir |
| `craps <bet> [pass/dontpass/field/any]` | Pass ve don't pass, puan kurallarına göre bahis kadar öder. Field bahis kadar öder, ya da 2 veya 12'de 2 katı öder. Any seven 4 katı öder |
| `scratchcard [bronze/silver/gold/diamond]` | Sabit maliyetli kartlar: 10, 50, 200 ya da 1000; sırasıyla %30, %25, %20 ve %15 kazanma şansı ve 50, 200, 1000 ve 5000'e kadar ödül aralıkları |
| `russianroulette <bet> [bullets]` | Altı oda içinde bir ila beş mermi. Hayatta kalmak, mermi sayısına göre 1,2 kat, 1,5 kat, 2 kat, 3 kat ya da 5 kat kâr öder |
| `baccarat <bet> [player/banker/tie]` | Oyuncu ya da banker 1,95 kat öder, beraberlik 8 kat öder |
| `minesweeper <bet> [small/medium/large]` | 1,5 kat, 2,5 kat ya da 4 kat için sırasıyla %70, %60 ya da %50 hayatta kalma |
| `lottery [tickets]` | Her bilet 50'ye mal olur, en fazla 10 bilet. Daha fazla bilet kazanma şansını (en fazla %40) ve ödül çarpanını artırır |
| `crash <bet> [target]` | 1,1 kat ile 10 kat arasında bir çekilme hedefi seç. Çöküş noktası hedefin üzerindeyse ya da ona eşitse hedefi kazanırsın |
| `keno <bet> <numbers>` | 1 ile 80 arasında 1 ila 10 sayı seç; 20 sayı çekilir. Ödemeler, beşte beş için 800 kata kadar, birde bir için 3 kattan başlar |
| `plinko <bet> [rows]` | 5 ile 10 sıra. Ortaya düşmek 0,5 kat öder, kenarlar 10 kata kadar öder |
| `wheelfortune <bet> [classic/risky/balanced]` | Çarpan çarkları; risky 0,1 kat ile 20 kat arasında değişir |
| `duckrace <bet>` | Beş ördek, senin ördeğin rastgele seçilir. Birinci 4 kat, ikinci 2 kat, üçüncü 1,2 kat öder |
| `bingo <bet> [small/large]` | %40 ihtimalle 2 kat ya da %25 ihtimalle 3,5 kat |
| `diceduel @user <bet>` | Rakibin kabul et ve reddet düğmeleri alır; ikiniz de bahsi karşılayabilmelisiniz |
| `memory <bet> [easy/medium/hard]` | 4, 6 ya da 8 elemanlı bir diziyi tekrarla: sırasıyla 1,5 kat, 2 kat ya da 3 kat |
| `horserace <bet>` | On dakikaya kadar on üyeye kadar katılım, on saniye içinde; boş yerleri AI yarışçılar doldurur. Havuz ilk üçe yüzde 50, 30 ve 20 öder |
| `triviachain <bet> [category]` | Arka arkaya OpenTDB sorularını yanıtla; her doğru cevap çarpanı 0,5 kat artırır. Kategoriler: general, science, history, sports, entertainment |

> [!NOTE]
> `horserace` herhangi bir pozitif bahsi kabul eder: bahsi doğrudan alır ve ortak bahis sınırlarını ya da ödeme çarpanını uygulamaz.

## Günlük görevler

Her üye her gün rastgele bir görev alır: beş oyun oyna, üç kazan, 500 harca, 300 kazan ya da belirli bir oyunu üç kez oyna. Ödül, temel miktar artı 50'ye kadar ekstra paradır. `dailychallenge` görevi gösterir, `claimchallenge` ödülü öder ve `challengeleaderboard` son 30 günde tamamlanan görevlere göre ilk on kişiyi sıralar.

> [!WARNING]
> Oyunlar şu anda görev takipçisine ilerleme bildirmiyor, bu yüzden görevler 0 ilerleme gösterir ve henüz talep edilemez.

## Mağaza

Eşyalar **Mağaza** sekmesinde durur ya da `shopadditem` ve `shopaddrole` ile eklenir. Her eşyanın bir **Ad**ı, **Fiyat**ı, **Açıklama**sı, **Tür**ü, **Stok**u (boş ya da -1 sınırsız demektir), **Kullanıcı başına limit**i, alıcının sahip olması gereken isteğe bağlı bir **Gerekli rol**ü ve bir **Sıralama** değeri vardır.

| Tür | Satın alındığında |
| --- | --- |
| Rol | Bot, rolü alıcıya ekler. Varsayılan olarak üye başına bir tanedir. |
| Koleksiyon eşyası | Alıcının envanterine girer; tüketilebilir olduğu için `use` bir tane siler. |
| Metin | **Teslim edilen metin**, alıcıya DM ile gönderilir ve `use` ile tekrar gönderilir. |

`buy <name>` eşyanın açık olduğunu, alıcının gerekli role sahip olduğunu, stok olduğunu, parayı karşılayabildiğini ve kullanıcı başına limitin altında olduğunu kontrol eder. Ödemeden sonra oluşan her hata otomatik olarak iade edilir. `inventory` bir üyenin sahip olduğu eşyaları listeler. `shoptoggle` bir eşyayı kimsenin kopyasını silmeden gizler; `shopremove` onu ve her kopyasını siler.

## Yer tutucular

Bu para birimi yer tutucuları, sohbet tetikleyici yanıtlarında ve trigger yer tutucularını kullanan diğer yerlerde kullanılabilir.

| Yer tutucu | Değer |
| --- | --- |
| `%currency.balance%` | Kullanıcının cüzdanı |
| `%currency.bank%` | Kullanıcının banka bakiyesi |
| `%currency.total%` | Cüzdan artı banka |
| `%targetuser.currency.balance%` | Hedef kullanıcının cüzdanı |
| `%targetuser.currency.bank%` | Hedef kullanıcının banka bakiyesi |
| `%currency.emote%` | Sunucunun para birimi emojisi |

## Ayarlar

Kontrol panelinde dört sekme var: **Analitik**, **Yapılandırma**, **Mağaza** ve **Sıralama tablosu**. **Sıralama tablosu** sekmesinde ayrıca **Bakiyeyi düzenle** de bulunur; bu, bir üyeye defterde bir neden kaydedilerek para ekler ya da çıkarır.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Kumarı etkinleştir | Açık | Bahisli tüm oyunları açar ya da kapatır |
| Minimum bahis | 1 | En küçük bahis |
| Maksimum bahis | 0 (sınırsız) | En büyük bahis |
| Ödeme çarpanı | 1.0 | Yalnızca kazançları ölçekler, 0.1 ile 5.0 arası |
| Günlük kayıp limiti | 0 (kapalı) | 24 saatte bu kadar kaybedince üyeyi keser |
| Oyun bekleme süresi (saniye) | 0 | Üye başına iki bahis arasındaki saniye |
| Çalışmayı etkinleştir | Açık | `work` komutu |
| Çalışma alt sınırı / üst sınırı | 50 / 250 | Çalışma ödeme aralığı |
| Çalışma bekleme süresi | 1800 saniye | `workcooldown`, yalnızca komut |
| Suçu etkinleştir | Açık | `crime` komutu |
| Suç alt sınırı / üst sınırı | 200 / 800 | Suç ödeme aralığı |
| Suç başarı şansı (%) | 45 | Bir suçun ödeme yapma şansı |
| Suç cezası alt sınırı / üst sınırı | 100 / 500 | Başarısızlıkta ceza |
| Suç bekleme süresi | 3600 saniye | `crimecooldown`, yalnızca komut |
| Bankayı etkinleştir | Açık | `bank`, `deposit`, `withdraw` |
| Banka kapasitesi | 0 (sınırsız) | Bir üyenin bankada tutabileceği en fazla miktar |
| Faiz (%) | 0 | Banka bakiyesi üzerinden her aralıkta ödenir |
| Faiz aralığı (saat) | 24 | Faizin ne sıklıkla tahsil edilebileceği |
| Transferleri etkinleştir | Açık | `pay` komutu |
| Transfer vergisi (%) | 0 | Her ödemeden alınır |
| Minimum transfer | 1 | En küçük ödeme |
| Transfer bekleme süresi | 0 | `paycooldown`, yalnızca komut |
| Soygunu etkinleştir | Kapalı | `rob` komutu |
| Başarı şansı (%) | 35 | Bir soygunun işleme şansı |
| Maksimum çalma (%) | 20 | Başarılı bir soygunun hedefin cüzdanından alabileceği pay |
| Başarısızlık cezası (%) | 15 | Başarısızlıkta soyguncunun cüzdanından kaybedilen pay |
| Şu tutarın altı korunur | 100 | Bundan az parası olan hedefler soyulamaz |
| Soygun bekleme süresi | 3600 saniye | `robcooldown`, yalnızca komut |
| Serileri etkinleştir | Açık | Üst üste günlük alımlar bonus kazandırır |
| Günlük bonus | 0 | İlk günden sonra serideki her gün için eklenir |
| Maksimum bonus | 0 (sınırsız) | Seri bonusuna üst sınır |

Günlük ödül miktarı ve bekleme süresi kontrol panelinde değil, `setdaily` ile ayarlanır. `economyconfig` her anahtarı mevcut değeriyle yazdırır, `economyreset` ise tüm varsayılanları geri yükler.

## Kurulum adımları

1. Üyelerin talep edebileceği bir şey olsun diye `setdaily 500 24h` çalıştır.
2. Kontrol panelinde **Para Birimi**'ni aç ve **Yapılandırma**'ya git. Bir oyun kanalı açmadan önce **Maksimum bahis** ve **Günlük kayıp limiti** ayarla.
3. **Soygunu etkinleştir** seçeneğini yalnızca üyelerin cüzdan parasını kaybetmeyi kabul ettiği durumlarda aç; bankayı açık bırak ki üyeler paralarını koruyabilsin.
4. **Mağaza**'da birkaç rol eşyası ve bir koleksiyon eşyası ekle. Yalnızca üyelere özel olması gereken her şeye bir **Gerekli rol** ata.
5. **Bakiyeyi düzenle** ya da `modifybalance` ile birkaç üyeye başlangıç bakiyesi ver.
6. Bir hafta sonra **Analitik**'e bak; oyunlar aldıklarından fazla ödüyorsa **Ödeme çarpanı**'nı düşür.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `cash` | `$`, `$$`, `$$$`, `currency`, `cur` | Yetki gerekmez | Cüzdanın, bankan ve net varlığın |
| `bank [@user]` | | Yetki gerekmez | Bir üyenin bakiyeleri ve senin faizini tahsil eder |
| `deposit <amount/all>` | | Yetki gerekmez | Cüzdandan bankaya |
| `withdraw <amount/all>` | | Yetki gerekmez | Bankadan cüzdana |
| `pay @user <amount>` | | Yetki gerekmez | Vergi düşülerek para gönder |
| `transactions [@user]` | `txs` | Yetki gerekmez | Son 250 defter kaydı |
| `cashleaderboard` | `cashlb`, `richest` | Yetki gerekmez | Net varlığa göre en zengin üyeler |
| `dailyreward` | `daily` | Yetki gerekmez | Günlük ödülünü talep et |
| `work` | | Yetki gerekmez | Bir çalışma ödemesi kazan |
| `crime` | | Yetki gerekmez | Riskli ödeme ya da ceza |
| `rob @user` | | Yetki gerekmez | Bir cüzdandan çalmayı dene |
| `dailychallenge` | `dc` | Yetki gerekmez | Bugünün görevini göster |
| `claimchallenge` | `claimch` | Yetki gerekmez | Tamamlanan bir görevi talep et |
| `challengeleaderboard` | `chlb` | Yetki gerekmez | En çok görev tamamlayanlar |
| `shop` | | Yetki gerekmez | Mağaza eşyalarına göz at, sayfa başına sekiz eşya |
| `buy <item>` | | Yetki gerekmez | Bir eşya satın al |
| `inventory [@user]` | | Yetki gerekmez | Bir üyenin sahip olduğu eşyalar |
| `use <item>` | | Yetki gerekmez | Bir tüketilebilir eşyayı kullan |
| `coinflip <bet> <heads/tails>` | `flip` | Yetki gerekmez | Oyunlara bak |
| `highlow <higher/lower> [bet]` | | Yetki gerekmez | Oyunlara bak |
| `spinwheel [bet]` | `wheel` | Yetki gerekmez | Oyunlara bak |
| `blackjack <bet>` | `bj` | Yetki gerekmez | Blackjack başlat ya da katıl |
| `hit` | | Yetki gerekmez | Bir kart çek |
| `stand` | | Yetki gerekmez | Sırayı bitir |
| `slot [bet]` | `slots` | Yetki gerekmez | Oyunlara bak |
| `roulette <bet> <type>` | | Yetki gerekmez | Oyunlara bak |
| `rps <choice> [bet]` | | Yetki gerekmez | Oyunlara bak |
| `war <bet>` | | Yetki gerekmez | Oyunlara bak |
| `craps <bet> [type]` | | Yetki gerekmez | Oyunlara bak |
| `scratchcard [type]` | `scratch` | Yetki gerekmez | Oyunlara bak |
| `russianroulette <bet> [bullets]` | `rroulette` | Yetki gerekmez | Oyunlara bak |
| `baccarat <bet> [type]` | | Yetki gerekmez | Oyunlara bak |
| `minesweeper <bet> [size]` | `mines` | Yetki gerekmez | Oyunlara bak |
| `lottery [tickets]` | | Yetki gerekmez | Oyunlara bak |
| `crash <bet> [target]` | | Yetki gerekmez | Oyunlara bak |
| `keno <bet> <numbers>` | | Yetki gerekmez | Oyunlara bak |
| `plinko <bet> [rows]` | | Yetki gerekmez | Oyunlara bak |
| `wheelfortune <bet> [wheel]` | `wof` | Yetki gerekmez | Oyunlara bak |
| `duckrace <bet>` | `duck` | Yetki gerekmez | Oyunlara bak |
| `bingo <bet> [card]` | | Yetki gerekmez | Oyunlara bak |
| `diceduel @user <bet>` | `dd` | Yetki gerekmez | Bir üyeye meydan oku |
| `memory <bet> [difficulty]` | | Yetki gerekmez | Oyunlara bak |
| `horserace <bet>` | `hr` | Yetki gerekmez | Bir yarışa katıl ya da başlat |
| `triviachain <bet> [category]` | `tchain` | Yetki gerekmez | Oyunlara bak |
| `setdaily <amount> <time>` | | Yönetici | Günlük ödül miktarı ve bekleme süresi, örneğin `setdaily 500 24h` |
| `modifybalance @user <amount> [reason]` | `modbal` | Genel para biriminde bot sahibi; aksi halde bir komut izni geçersiz kılmasının ayarladığı gibi | Para ekle ya da çıkar; negatif miktarlar borçlandırır |
| `economyconfig` | | Yönetici | Her ekonomi ayarını göster |
| `economyset <setting> <value>` | | Yönetici | Tek bir ayarı anahtarıyla değiştir |
| `economyreset` | | Yönetici | Tüm varsayılanları geri yükle |
| `economystats` | | Yetki gerekmez | Para arzının boyutu ve yoğunluğu |
| `economyflow [days]` | | Yetki gerekmez | Para biriminin nereden girip nereden çıktığı, varsayılan 7 gün |
| `gamestats [days]` | | Yetki gerekmez | Oyuncuya oyun başına dönen miktar, varsayılan 7 gün |
| `shopadditem <price> <name>` | | Yönetici | Sınırsız stoklu tüketilebilir bir koleksiyon eşyası ekle |
| `shopaddrole <price> @role <name>` | | Yönetici, botun Rolleri Yönet yetkisine ihtiyacı var | Rol eşyası ekle, üye başına bir tane |
| `shopremove <name>` | | Yönetici | Bir eşyayı ve her kopyasını sil |
| `shopprice <price> <name>` | | Yönetici | Fiyatı değiştir |
| `shopstock <stock> <name>` | | Yönetici | Kalan stoku ayarla |
| `shopdesc <name> \| <description>` | | Yönetici | Açıklamayı ayarla |
| `shoptoggle <name>` | | Yönetici | Bir eşyayı göster ya da gizle |

## İpuçları ve tuzaklar

- Başka her şeden önce **Maksimum bahis**'i ayarla. 0 iken şanslı tek bir üye bir öğleden sonrada ekonomiyi boşaltabilir.
- Günlük kayıp limiti son 24 saatteki net kayıpları sayar; yani erken kazanan bir üye daha uzun süre oynayabilir.
- Rol eşyaları için botun en yüksek rolü satılan rolün üstünde olmalı ve Rolleri Yönet yetkisi olmalı; yoksa ödeme yapıldıktan sonra rol verme hatasıyla satın alma başarısız olur.
- Metin eşyaları ve `use` DM ile teslim edilir; DM'leri kapalı üyeler bir hata görür ama eşyanın sahibi yine olurlar.
- Blackjack her üye için bellekte tek bir oyun tutar; `hit` ve `stand` yalnızca `blackjack` komutundan sonra çalışır.
- At yarışları diğer üyeleri on saniye bekler, sonra alanı AI yarışçılarla doldurup yarışı başlatır.
- Trivia zinciri oyunları on dakika hareketsizlikten sonra zaman aşımına uğrar ve bir üyenin aynı anda yalnızca bir tane çalışan oyunu olabilir.
- Bot küresel para birimiyle barındırıldığında bakiyeler her sunucuda paylaşılır ve `modifybalance` yalnızca bot sahibine açıktır.

---
title: Oyunlar
slug: games
summary: Herhangi bir kanalda başlatabilecek üyelerin sohbet oyunları; bilgi yarışmasından adam asmacaya, kelime zincirlerinden yazma yarışlarına, acrophobia'ya ve anketlere kadar.
icon: fa-gamepad-modern
category: Entertainment
module: Games
tags: [games, trivia, hangman, kaladont, nunchi, typing race, acrophobia, tic tac toe, poll, vote, 8ball, choose, oyunlar, bilgi yarışması, adam asmaca, yazma yarışı, XOX, anket, oylama, seçim]
related: [polls, currency, xp, searches, utility]
---

## Ne işe yarar

Oyunlar, başlatıldıkları kanalda oynanır. Bir üye komutu çalıştırır, bot oyunu paylaşır ve kanaldaki herkes cevapları yazarak ya da düğmelere basarak oynar. Her kanalda aynı türden yalnızca bir oyun aynı anda çalışır (Nunchi ve Kaladont için ise sunucu başına bir oyun); çoğu oyun, eşleşen bir durdurma komutuyla erken bitirilebilir.

Bilgi yarışması, adam asmaca, Kaladont, Nunchi, yazma yarışı, acrophobia ve XOX çok oyunculu oyunlardır. Anketler yetkililerin kanala düğmeler ya da açılır menü ile bir soru sormasını sağlar. `choose` ve `8ball` tek seferlik eğlencelerdir.

Bu modül için kontrol paneli sayfası yoktur. Her şey komutlarla yapılır ve çoğu komut hiçbir yetki gerektirmez.

## Neden kullanırsın

- Sakin bir akşamı bir tur bilgi yarışması ya da adam asmaca ile canlandır.
- Topluluk etkinliği olarak bir yazma yarışı ya da Kaladont turnuvası düzenle.
- Sunucuya hızlı bir evet/hayır sorusu ya da açılır menülü çoktan seçmeli bir anket sor.
- Kelime zinciri hiç durmasın diye kalıcı bir Kaladont kanalı kur.

## Bilgi yarışması

`trivia` bir quiz başlatır. Bot bir soru paylaşır, ipucu kapalı değilse soru süresinin yarısında bir ipucu gösterir ve cevabı ilk yazan üye bir puan kazanır. Bir üye kazanma şartına ulaşınca oyun biter ve o üye kazanır. Arka arkaya yeterince soru cevaplanmazsa oyun durur.

| Seçenek | Varsayılan | Ne yapar |
| --- | --- | --- |
| `-p`, `--pokemon` | kapalı | "Bu kim Pokemon?" modu |
| `--nohint` | kapalı | Hiçbir zaman ipucu gösterme |
| `-w`, `--win-req` | 10 | Kazanmak için gereken puan; sonsuz oyun için 0 |
| `-q`, `--question-timer` | 30 | Soru başına saniye |
| `-t`, `--timeout` | 10 | Oyunun durmadan önce arka arkaya cevaplanmayan soru sayısı; hiçbir zaman için 0 |

`tl` mevcut skorları gösterir, `tq` oyunu durdurur. Botun genel yapılandırması minimum kazanma şartını ve kazanan için bir para ödülünü ayarlayabilir.

> [!EXAMPLE]
> `trivia -w 5 -q 20` her soru için yirmi saniye ile beş puana kadar kısa bir oyun başlatır.

## Adam asmaca

`hangman [type]` bir kategoriden bir kelime seçer ve onu boşluklar olarak gösterir. Üyeler kanala tek bir harf ya da tüm kelimeyi yazarak tahmin eder. Altı yanlış tahmin oyunu kaybettirir. Kategoriler `countries`, `movies`, `animals`, `things` ve `random`'dır; varsayılan `random`'dır. `hangmanlist` sunucunda kullanılabilir türleri gösterir, `hangmanstop` oyunu bitirir.

## Kaladont

Kaladont bir kelime zinciridir. Her kelime, önceki kelimenin son iki harfiyle başlamalıdır ve bir kelime oyun içinde yalnızca bir kez kullanılabilir. Oyuncular sırayla oynar ve her tur için bir süre sınırı vardır. Sözlük İngilizce veya Sırpça olabilir; Sırpça çift harfler (lj ve nj gibi) tek harf sayılır.

| Seçenek | Varsayılan | Ne yapar |
| --- | --- | --- |
| `-j`, `--join-time` | 15 | Oyun başlamadan önce oyuncuların katılması için saniye |
| `-t`, `--turn-time` | 30 | Tur başına saniye |
| `-m`, `--min-players` | 2 | Başlamak için gereken oyuncu sayısı |
| `-l`, `--language` | en | `en` veya `sr` |
| `-e`, `--endless` | kapalı | Sonraki oyuncu için geçerli kelime bırakmayan kelimeleri reddeder |

`kaladontstop` mevcut oyunu bitirir. `kaladontsetup` mevcut kanalı, aynı dil ve sonsuz ayarlarıyla zinciri sürdüren kalıcı bir Kaladont kanalına çevirir; `kaladontdisable` bunu kaldırır. İkisi de Kanalları Yönet yetkisi gerektirir.

## Nunchi

`nunchi` bir oyun oluşturur; katılma aşamasındayken diğer üyeler katılmak için `nunchi` komutunu çalıştırır. Her turda bot bir sayı duyurur ve her oyuncu bir sonraki sayıyı yazmalıdır. Doğru yazan oyuncular pas geçer; herkes ama bir kişi pas geçince tur biter ve kalan oyuncu elenir. Süre içinde kimse cevap vermezse tur, o ana kadar pas geçen herkesle yeniden başlar. Son ayakta kalan oyuncu kazanır.

## Yazma yarışı

`typestart` geri sayım yapar (varsayılan beş saniye; `-s` ya da `--start-time` 3 ile 30 arasında ayarlar) ve ardından bir cümle paylaşır. Cümleyi yeterince yakın bir şekilde ilk yazan üye kazanır; birkaç yazım hatasına, yaklaşık 25 karakterde bir hataya kadar izin verilir. Sonuç dakikadaki kelime sayısını ve hata sayısını gösterir. `typestop` bir yarışı bitirir, `typelist` cümle havuzunu gösterir, bot sahipleri `typeadd` ve `typedel` ile cümle ekleyip silebilir.

## Acrophobia

`acrophobia` üç ila beş rastgele harf paylaşır. Üyelerin gönderim süresi vardır (varsayılan 60 saniye, 15 ile 300 arası) ve bu sürede her üye, kelimeleri sırayla bu harflerle başlayan bir ifade gönderebilir; her üye yalnızca bir gönderim yapabilir. Ardından oylama süresi boyunca herkes en sevdiği gönderiye numarasıyla oy verir (varsayılan 60 saniye, 15 ile 120 arası). Kendi gönderine oy veremezsin. Süreleri `-s` ya da `--submission-time` ve `-v` ya da `--vote-time` ile ayarlayabilirsin.

## XOX

`tictactoe` bir oyun açar; bunu çalıştıran bir sonraki üye ikinci oyuncu olarak katılır. Hamleler sohbette yapılır ve tur süresinden (varsayılan 15 saniye, `-t` ya da `--turn-timer`, 5 ile 60 arası) uzun süre bekleyen oyuncu hükmen mağlup olur. Oyun bir kazananı ya da beraberliği bildirir.

## Anketler

Anket oluşturmak için Mesajları Yönet yetkisi gerekir. Seçenekler noktalı virgülle ayrılır.

| Komut | Tür | Davranış |
| --- | --- | --- |
| `poll <question>` | Evet/Hayır | İki düğme |
| `pollc question;option1;option2;...` | Tek seçim | Üye başına bir oy |
| `pollm question;option1;option2;...` | Çoklu seçim | Üyeler birden fazla seçenek seçebilir |
| `polla question;option1;option2;...` | Anonim | Oy verenlerin kimlikleri gizlenir |

İki ila beş seçenekli anketler düğme kullanır; daha uzun olanlar en fazla 25 seçenekli bir açılır menü kullanır. Üyeler oylarını değiştirebilir. Şablonlar bir soruyu ve seçeneklerini yeniden kullanmak için kaydeder: `polltemplates` onları listeler, `polltemplate <name>` birini paylaşır. Şablon oluşturma ve silme, anketi kapatma, aktif anketleri listeleme ve bir anketin istatistiklerini görme işlemleri `/poll` eğik çizgi komutlarıyla (`create-template`, `delete-template`, `close`, `list`, `stats`) ya da kendi makalesi olan Anketler kontrol paneli sayfasından yapılır.

## Diğer

- `choose a; b; c` noktalı virgülle ayrılmış listeden rastgele bir seçenek seçer.
- `8ball <question>` botun oyun yapılandırmasındaki yanıt listesinden cevap verir.
- `linux <word> <word>` iki ismi değiştirilmiş "I'd just like to interject" copypasta'sını paylaşır.
- `dragon` beta test bayrağını açıp kapatır; bazı deneysel komutlar bunu kontrol eder.
- `rategirl` yalnızca neden kaldırıldığına dair bir not içeren bir taslaktır. Hiçbir işe yaramaz.

## Ayarlar

Bu modülün kontrol paneli sayfası ve sunucu başına ayarı yoktur. Oyun davranışı yukarıdaki komut seçenekleriyle belirlenir. Bot sahibinin `games.yml` yapılandırması 8ball yanıtlarını ve bilgi yarışması minimum kazanma şartı ile para ödülünü içerir.

## Kurulum adımları

1. Oyunlar için bir kanal seç ya da oluştur; böylece oyun mesajları sohbeti bastırmaz.
2. Kalıcı bir kelime zinciri istiyorsan o kanalda `kaladontsetup -l en` komutunu çalıştır.
3. Botun orada mesaj gönderebildiğini ve cevapları okuyabildiğini kontrol etmek için `trivia` ya da `hangman` komutunu çalıştır.
4. Yetkililerin anket yapmasını istiyorsan onlara Mesajları Yönet yetkisi ver.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `trivia [options]` | `t` | Hiç kimse | Bilgi yarışmasını başlat |
| `tl` | | Hiç kimse | Bilgi yarışması skorları |
| `tq` | | Hiç kimse | Bilgi yarışmasını durdur |
| `hangman [type]` | | Hiç kimse | Adam asmacayı başlat |
| `hangmanlist` | | Hiç kimse | Adam asmaca türlerini listele |
| `hangmanstop` | | Hiç kimse | Adam asmacayı durdur |
| `kaladont [options]` | `kal` | Hiç kimse | Kaladont'u başlat |
| `kaladontstop` | `kalstop` | Hiç kimse | Kaladont'u durdur |
| `kaladontsetup [options]` | `kalsetup` | Kanalları Yönet | Bu kanalı kalıcı bir Kaladont kanalı yap |
| `kaladontdisable` | `kaldisable` | Kanalları Yönet | Kalıcı kanalı kaldır |
| `nunchi` | | Hiç kimse | Nunchi oluştur veya katıl |
| `typestart [options]` | | Hiç kimse | Bir yazma yarışı başlat |
| `typestop` | | Hiç kimse | Yarışı durdur |
| `typelist [page]` | | Hiç kimse | Yarış cümlelerini listele |
| `typeadd <text>` | | Bot sahibi | Bir cümle ekle |
| `typedel <index>` | | Bot sahibi | Bir cümleyi sil |
| `acrophobia [options]` | `acro` | Hiç kimse | Acrophobia'yı başlat |
| `tictactoe [options]` | `ttt` | Hiç kimse | XOX başlat veya katıl |
| `poll <question>` | `ppoll` | Mesajları Yönet | Evet/hayır anketi |
| `pollc <question;options>` | | Mesajları Yönet | Tek seçimli anket |
| `pollm <question;options>` | | Mesajları Yönet | Çoklu seçimli anket |
| `polla <question;options>` | | Mesajları Yönet | Anonim anket |
| `polltemplates` | `ptemplates` | Hiç kimse | Anket şablonlarını listele |
| `polltemplate <name>` | `ptemplate` | Mesajları Yönet | Bir şablondan anket paylaş |
| `choose <a; b; c>` | | Hiç kimse | Rastgele bir seçenek seç |
| `8ball [question]` | `eightball` | Hiç kimse | Sihirli 8 top |
| `linux <word> <word>` | | Hiç kimse | Araya girme copypasta'sı |
| `dragon` | | Hiç kimse | Beta bayrağını aç/kapat |
| `rategirl` | | Hiç kimse | Taslak, hiçbir şey yapmaz |

## İpuçları ve dikkat edilecekler

- Oyunlar kanaldaki cevapları okur; bu yüzden botun orada Mesaj Geçmişini Oku ve Mesaj Gönder yetkisine sahip olması gerekir ve bir kanal izin kuralıyla engellenmemelidir.
- Bilgi yarışması, adam asmaca ve Kaladont cevapları sıradan mesajlardır. Mesaj sayımı ya da XP de çalıştırıyorsan bu mesajlar sayılır.
- Kanal başına yalnızca bir bilgi yarışması, adam asmaca, yazma ya da Kaladont oyunu çalışabilir; başlatma komutu zaten bir oyun varsa bunu sana bildirir.
- Açılır menüde 100 karakterden uzun anket seçenekleri kısaltılır.
- Nunchi her turda en yavaş oyuncuyu eler, bu yüzden büyük bir grup bitirmek için biraz zaman alabilir.

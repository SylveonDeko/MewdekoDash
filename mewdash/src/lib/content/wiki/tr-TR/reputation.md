---
title: İtibar
slug: reputation
summary: Üyelerin birbirine itibar puanlarıyla teşekkür etmesine izin ver; bekleme süreleri ve kötüye kullanım sınırları, eşiklerde rol ödülleri, tepkiyle verilen itibar ve etkin olmayan üyeler için isteğe bağlı azalma ile.
icon: fa-trophy
category: Community
dashboard: /dashboard/reputation
module: Reputation
tags: [reputation, rep, karma, thanks, role rewards, leaderboard, reaction rep, decay, cooldown, itibar, teşekkür, rol ödülleri, sıralama tablosu, tepki itibarı, azalma, bekleme süresi]
related: [xp, administration]
---

## Ne işe yarar

Bir üye `rep @user` komutunu çalıştırarak bir itibar puanı verir; isteğe bağlı olarak bir neden de ekleyebilir. Alıcının toplamı artar, verenin günlük serisi takip edilir ve geçmiş kimin neyi neden verdiğini tutar. Herkes toplamları `repcheck` ile kontrol edebilir, sunucu sıralamasını `repleaderboard` ile görebilir ve son on kaydı `rephistory` ile okuyabilir.

Yetkililer itibarın ne kadar serbestçe dolaşacağını yapılandırır: verici-alıcı çifti başına bir bekleme süresi, günlük ve haftalık sınırlar ve birinin hiç verebilmesi için gereken minimum hesap yaşı, sunucu süresi ve mesaj sayısı. Kanallar itibar için devre dışı bırakılabilir ya da bir çarpan verilebilir. İtibar tepkilerden de kazanılabilir: mesaja yapılandırılmış bir emoji eklendiğinde mesajın yazarına puan verilir.

Belirlenen eşiklerde bot roller verir, kilometre taşını bir kanalda duyurur ve üyeye DM gönderir. İsteğe bağlı azalma, ne verip ne de alan etkin olmayan üyelerden yavaşça puan düşürür; böylece sıralama tablosu güncel etkinliği yansıtır.

## Neden kullanmalısın

- Destek kanallarındaki yardımsever üyeleri tanımak ve onlara görünür bir rol vermek.
- Vitrin kanalında bir başparmak tepkisinin sanatçıya puan kazandırması.
- Bir komutu ya da kanalı elle verilen bir rol yerine bir itibar seviyesinin arkasına koymak.
- Bir hafta sonu etkinliğinde bir kanaldaki itibarın iki katı sayılması.
- Yardım etmeyi bırakan kişiler için azalma ile bir destek sıralama tablosunu dürüst tutmak.

## İtibar verme

Her `rep`, kanal çarpanı ayarlıysa onunla çarpılmış bir puan verir. Kendine ya da bir bota itibar veremezsin. Her deneme aşağıdaki kontrollerden şu sırayla geçer ve ilk başarısız olan verene bildirilir:

| Kontrol | Varsayılan | Ne olur |
| --- | --- | --- |
| Sistem etkin | açık | Kapalıyken her şey reddedilir |
| Kanal durumu | etkin | `disabled` olarak ayarlanmış bir kanalda verilen itibar reddedilir |
| Alıcı dondurulmuş | hayır | Dondurulmuş üyeler itibar alamaz |
| Bekleme süresi | 60 dakika | Aynı verenin aynı alıcıya yeniden itibar verebilmesi için geçmesi gereken süre |
| Günlük sınır | 10 | Bir verenin UTC günü içinde verebileceği itibar |
| Haftalık sınır | yok | Pazardan başlayarak haftada isteğe bağlı sınır |
| Minimum hesap yaşı | 7 gün | Verenin Discord hesabının yaşı |
| Minimum sunucu süresi | 24 saat | Verenin sunucuda ne kadar süredir olduğu |
| Minimum mesaj sayısı | 10 | Verenin gönderdiği mesajlar, mesaj sayımından |

Anonim itibar kaydı anonim olarak işaretler, ancak yalnızca yapılandırmada anonim vermeye izin verildiyse. Negatif itibar ayrı bir anahtardır; tepki kaldırma, verdiği puanları zaten geri alır.

### Seriler ve istatistikler

Ardışık günlerde itibar vermek bir seri oluşturur; bir buçuk günden uzun bir boşluk seriyi sıfırlar. `repstats` toplamı, sıralamayı, verilen ve alınan sayısını, mevcut ve en uzun seriyi, son verilme ve alınma zamanlarını gösterir.

### Özel türler

`reptypeadd helpful Helpful` adlandırılmış bir tür oluşturur. Üyeler bundan sonra `rep @user helpful thanks for the fix` yazabilir. Standart itibar yalnızca toplamı artırır; özel bir tür ayrıca kendi türüne ait sayıyı tutar ve komut gereksinimleri bunu hedefleyebilir.

## Tepkiler

`repreaction <emoji> [amount] [type]` bir tepkinin mesajın yazarına itibar vermesini sağlar. Tepkiyi veren bir bot olamaz ve tepkiyi kaldırmak puanları geri alır. Komut varsayılan olarak standart itibardan bir puan verir ve her tepki yapılandırması kendi bekleme süresini taşır.

## Rol ödülleri

`reprole @Role 100`, bir üye 100 itibara ulaştığında rolü verir. Seçenekler: eşiğin altına düşünce rolü geri almak (varsayılan olarak açık), kilometre taşını bir kanalda duyurmak ve bir DM göndermek. Ödüller her itibar değişikliğinden sonra kontrol edilir. Bir ödülde bonus XP saklanabilir ancak henüz ödenmez.

Rol ödüllerinden bağımsız olarak, bir üye 50, 100, 250, 500, 1000, 2500, 5000 ya da 10000 itibara ulaştığında bot **bildirim kanalına** bir kilometre taşı mesajı gönderir. Üyeler ayrıca tek seferde on ya da daha fazla puan aldıklarında ya da on'un katına ulaştıklarında DM alır.

## Azalma

Etkinleştirildiğinde bot her saat azalma zamanının gelip gelmediğini kontrol eder. `daily` her gün 02:00 UTC'de, `weekly` her Pazar 02:00 UTC'de, `monthly` ayın birinde çalışır. Belirlenen süre boyunca ne itibar verip ne de alan üyeler azalma miktarını kaybeder; bu sabit bir puan sayısı ya da toplamlarının bir yüzdesidir ve asla sıfırın altına inmez. Dondurulmuş üyeler atlanır. Varsayılanlar: haftalık, 1 puan, 30 etkin olmayan gün.

## Komut gereksinimleri

`repcommandreq <command> <minimum> [type] [#channels]`, bir komutu üye o kadar itibara sahip olana kadar engeller; isteğe bağlı olarak tek bir özel türle ve isteğe bağlı olarak yalnızca belirli kanallarda. `repcommandbypass` rolleri muaf tutar, `repcommandinfo` ise herkesin bir komutun neye ihtiyaç duyduğunu görmesine izin verir.

## Ayarlar

İtibar sayfasında dört sekme vardır: **Yapılandırma**, **Rol Ödülleri**, **Sıralama tablosu** ve **İstatistikler**.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| İtibar Sistemini Etkinleştir | açık | Ana anahtar |
| Bekleme Süresi (dakika) | 60 | Verici ve alıcı çifti başına |
| Günlük Sınır | 10 | Verici başına günlük itibar |
| Haftalık Sınır (isteğe bağlı) | yok | Verici başına haftalık itibar |
| Minimum Hesap Yaşı (gün) | 7 | Verici gereksinimi |
| Minimum Sunucu Süresi (saat) | 24 | Verici gereksinimi |
| Minimum Mesaj Sayısı | 10 | Verici gereksinimi |
| Bildirim Kanalı (isteğe bağlı) | yok | Kilometre taşı mesajlarının gideceği yer |
| Negatif İtibara İzin Ver | kapalı | Negatif miktarları etkinleştirir |
| Anonim İtibarı Etkinleştir | kapalı | `repanon`'un vereni gizlemesine izin verir |

Azalma panelde yer almaz; aşağıdaki `repdecay*` komutlarını kullan.

**Rol Ödülleri** sekmesinde **Rol**, **Gereken İtibar**, **Duyuru Kanalı (isteğe bağlı)**, **Bonus XP (isteğe bağlı)**, **İtibar eşiğin altına düşerse rolü kaldır** ve **DM bildirimi gönder** alanları bulunan bir form vardır. **Sıralama tablosu** sıralamayı gösterir ve bir üyenin geçmişini açar. **İstatistikler** toplam kullanıcı sayısını, verilen toplam itibarı, işlemleri ve ortalama itibarı gösterir.

## Kurulum adımları

1. Kontrol panelinde **İtibar Sistemi**'ni aç. **Yapılandırma** sekmesinde **Etkin**'i aç.
2. **Bekleme Süresi**, **Günlük Sınır** ve üç minimum gereksinimi sunucunun büyüklüğüne göre ayarla.
3. Kilometre taşları için bir **Bildirim Kanalı** seç ve kaydet.
4. **Rol Ödülleri**'nde bir rol ekle, **Gereken İtibar** değerini gir ve sürekli kazanılmasını istiyorsan **İtibar eşiğin altına düşerse rolü kaldır**'ı işaretle.
5. Discord'da tepki itibarını etkinleştirmek için `repreaction <emoji> 1`, spam kanallarını dışarıda tutmak için `repchannel #bot-spam disabled` çalıştır.
6. İkinci bir hesapla test et: `rep @you great help`, sonra `repcheck @you`.

> [!WARNING]
> `represet all`, onaydan sonra sunucudaki her üyenin itibarını, geçmişini ve rozetlerini siler. Geri alınamaz.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `rep <@user> [type] [reason]` | `+rep`, `giverep`, `gr`, `repgive` | Yok | Bir puan ver |
| `repanon <@user> [type] [reason]` | `anongiverep` | Yok | Anonim olarak ver |
| `anonrep <@user> [type] [reason]` | | Yok | `repanon` ile aynı |
| `repcheck [@user]` | `myrep`, `checkrep` | Yok | Toplamı ve sıralamayı göster |
| `repleaderboard [page]` | `replb`, `reptop`, `toprep` | Yok | Sıralama, sayfa başına 25 |
| `rephistory [@user]` | `rephist` | Yok | Son on itibar kaydı |
| `repstats [@user]` | `repstat` | Yok | Ayrıntılı istatistikler ve seriler |
| `repcommandinfo <command>` | `repcmdinfo`, `rci` | Yok | Bir komutun itibar gereksinimini göster |
| `repstatus` | `repsettings` | Yönetici | Yapılandırmayı göster |
| `repconfig` | `repcfg` | Yönetici | Etkileşimli yapılandırma menüsü |
| `repenable [true/false]` | `repe` | Yönetici | Sistemi aç ya da kapat |
| `repcooldown <minutes>` | `repcd` | Yönetici | 1 ile 1440 arası |
| `repdailylimit <n>` | `repdl` | Yönetici | 1 ile 100 arası |
| `repweeklylimit [n]` | `repwl` | Yönetici | 1 ile 500 arası ya da temizlemek için yok |
| `repminage <days>` | `repma` | Yönetici | 0 ile 365 arası |
| `repminmembership <hours>` | `repmm` | Yönetici | 0 ile 720 arası |
| `repminmessages <n>` | `repminmsg` | Yönetici | 0 ile 1000 arası |
| `repnegative <true/false>` | `repneg` | Yönetici | Negatif itibara izin ver |
| `repanonymous <true/false>` | `repanonym` | Yönetici | Anonim itibara izin ver |
| `repnotificationchannel [#channel]` | `repnotify` | Yönetici | Kilometre taşı kanalını ayarla ya da temizle |
| `repchannel <#channel> [enabled/disabled/readonly] [multiplier]` | `repch` | Yönetici | Kanal başına durum ve çarpan |
| `repdecay <true/false>` | `repd` | Yönetici | Azalmayı etkinleştir |
| `repdecaytype <daily/weekly/monthly/fixed/percentage>` | `repdt` | Yönetici | Azalma takvimi ya da miktar türü |
| `repdecayamount <n>` | `repda` | Yönetici | 1 ile 100 arası puan ya da yüzde |
| `repdecayinactive <days>` | `repdi` | Yönetici | Azalmadan önceki 1 ile 365 gün |
| `reptake <@user> [amount]` | `-rep`, `takerep` | Yönetici | Puan kaldır |
| `repset <@user> <amount>` | `setrep` | Yönetici | Bir toplam ayarla |
| `represet <@user or all>` | `resetrep` | Yönetici | Bir üyeyi ya da herkesi sıfırla |
| `repfreeze <@user>` | `freezerep` | Yönetici | Bir üyenin itibar almasını durdur |
| `repunfreeze <@user>` | `unfreeze`, `unfreezerep` | Yönetici | Dondurmayı geri al |
| `repreaction <emoji> [amount] [type]` | `repemoji`, `rre` | Yönetici | Bir tepki ödülü ekle ya da güncelle |
| `repreactionremove <emoji>` | `repemojiremove`, `rrer` | Yönetici | Bir tepki ödülünü kaldır |
| `repreactionlist` | `repemojilist`, `rrel` | Yönetici | Tepki ödüllerini listele |
| `reprole [@role] [rep] [removeOnDrop] [#channel] [dm] [xp]` | | Rolleri Yönet | Rol ödüllerini ekle, güncelle ya da listele |
| `reproleremove <@role>` | `reprr` | Rolleri Yönet | Bir rol ödülünü kaldır |
| `reprolechannel <@role> [#channel]` | `reprc` | Yönetici | Bir ödülün duyuru kanalını ayarla ya da temizle |
| `repcommandreq <command> <min> [type] [#channels]` | `repcmdreq`, `rcr` | Yönetici | Bir komut için itibar iste |
| `repcommandbypass <command> <@roles>` | `repcmdbypass`, `rcb` | Yönetici | Gereksinimi atlayan roller |
| `repcommandreqremove <command>` | `repcmdreqremove`, `rcrr` | Yönetici | Bir gereksinimi kaldır |
| `repcommandreqlist` | `repcmdreqlist`, `rcrl` | Yönetici | Gereksinimleri listele |
| `reptypeadd <name> <display name>` | `repaddtype`, `rta` | Yönetici | Özel bir tür ekle |
| `reptyperemove <name>` | `repremovetype`, `rtr` | Yönetici | Özel bir türü kaldır |
| `reptypelist` | `replisttypes`, `rtl` | Yönetici | Özel türleri listele |
| `repeventcreate <name> <multiplier> <hours>` | `repec` | Yönetici | Bir çarpan etkinliği kaydet |
| `repeventend <name>` | `repee` | Yönetici | Bir etkinliği erken bitir |
| `repexport` | `repex` | Yönetici | Yapılandırmayı JSON olarak dışa aktar |
| `repimport` | `repim` | Yönetici | Mesaja eklenen bir yapılandırma dosyasını içe aktar |
| `repmilestonelost <@user> <@role> <threshold>` | | Yönetici | Kaybedilen bir kilometre taşı için test mesajı |

`/rep` eğik çizgi komutları `give`, `check`, `leaderboard`, `history` ve `stats` ile birlikte, yukarıdaki ayar komutlarını yansıtan yönetici grupları olan `/rep config`, `/rep decay`, `/rep manage`, `/rep reaction`, `/rep role`, `/rep type`, `/rep event` ve `/rep require`'ı kapsar. `/rep role list` ve `/rep role info` yalnızca eğik çizgi komutudur.

## İpuçları ve dikkat edilecekler

- Rol ödüllerinin, botun rolünün her ödül rolünün üstünde olmasına ve Rolleri Yönet yetkisine ihtiyacı vardır; `reprole` botun üstündeki rolleri reddeder.
- Minimum mesaj sayısı mesaj sayma özelliğini kullanır. Sayma kapalıysa, üyeler sıfır sayıyla itibar vermekten engellenebilir.
- Yalnızca `disabled` kanal durumu vermeyi engeller. `readonly` komut tarafından kabul edilir ama şu anda o kanaldaki itibarı durdurmaz.
- `repeventcreate` ile oluşturulan etkinlikler çarpanları ve bitiş zamanlarıyla saklanır, ancak çarpan şu anda etkinlik sırasında verilen itibara uygulanmaz.
- Tepki itibarı standart emojiler için emojinin adını, özel emojiler için kimliğini kullanır; bu yüzden kaldırıldıktan sonra başka bir sunucudan gelen özel bir emoji eşleşmez.
- Azalma kontrolleri saat başında çalışır; bu yüzden `daily` azalma 02:00 UTC saatinde bir kez gerçekleşir.
- Bekleme süresi çift başınadır. Bir üye, günlük sınıra kadar art arda birkaç farklı kişiye itibar verebilir.

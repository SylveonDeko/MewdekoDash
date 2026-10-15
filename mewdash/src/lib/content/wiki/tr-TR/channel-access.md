---
title: Kanal Erişimi
slug: channel-access
summary: Özel bir kanalı bir başvuru formunun arkasına kilitle; içeride zaten bulunan üyelerin kimin gireceğine oy vermesini sağla.
icon: fa-lock
category: Security
dashboard: /dashboard/channel-access
module: ChannelAccess
tags: [channel access, gate, application, apply, vote, private channel, locked channel, inner circle, blacklist, review, kanal erişimi, kapı, başvuru, başvur, oy, özel kanal, kilitli kanal, iç çevre, kara liste, inceleme]
related: [administration, tickets, forms]
---

## Ne işe yarar

Yetkililer çoğu üyenin göremediği bir kanala bir "kapı" koyar. Üyeler **Erişim için başvur** düğmesine tıklar ya da `channelaccessapply` komutunu çalıştırır ve en fazla beş soruluk kısa bir formu doldurur. Başvuru, **Onayla**, **Reddet**, isteğe bağlı **Çekimser** ve **Döküm** düğmeleri olan bir embed olarak bir inceleme kanalına gönderilir.

Kanalı zaten görebilen kişiler oy verir. Yeterli onay geldiğinde başvuru sahibi içeri alınır; ya ona bir rol verilir ya da kanala kişisel bir izin üzerine yazma (overwrite) eklenir. Yeterli red geldiğinde ya da oylama penceresi kapandığında başvuru reddedilir. Yetkililer istedikleri zaman her iki sonucu da zorla uygulayabilir.

Başvuru sahibine kapı izin veriyorsa sonuç DM ile bildirilir; reddedilen başvuru sahipleri yeniden başvurmadan önce bir bekleme süresini beklemek zorundadır. Her şey isteğe bağlı bir günlük kanalına kaydedilir.

## Neden kullanmalısın

- Mevcut üyelerin kimin katılacağına karar verdiği, yalnızca üyelere açık bir salon ya da "iç çevre".
- Küçük ve güvenilir bir grubun yenilere garanti verdiği, doğrulanmış yetişkinler kanalı.
- Bir şey paylaşmadan önce kontrol edilmesi gereken takas ya da pazar yeri kanalları.
- Her başvuruyu yetkililerin tek tek okumasına gerek kalmadan yazılı bir başvuru istediğin her kanal.

## Kapılar

Kapı, bir kanal ve o kanalın kurallarıdır. Her kanalın bir kapısı olabilir. Kapı oluştururken bir rol verirsen bu bir **rol kapısı** olur; rol vermezsen **doğrudan kapı** olur.

| Erişim türü | Kontrol panelindeki etiket | Erişim nasıl verilir | "İçeride" sayılan kişiler |
| --- | --- | --- | --- |
| Rol | Ona bir rol ver | Erişim rolü başvuru sahibine eklenir | Erişim rolüne sahip herkes |
| Kanal izni | Doğrudan kanala ekle | Üyeye özel bir Kanalı Görüntüle izin üzerine yazması yazılır | Kanalı şu anda görebilen herkes |

Onaylanan üyeler otomatik olarak asla çıkarılmaz. Rolü kaldırmak ya da izin üzerine yazmasını silmek sana kalmıştır.

## Başvurular

Bir başvuru açılmadan önce bot şu sırayla kontrol yapar: kapı başvuru kabul ediyor mu, üyenin zaten erişimi var mı, engellenmiş mi, hesabı ve sunucuya katılımı yeterince eski mi, bu kapı için açık bir başvurusu var mı ve yeniden başvuru bekleme süresi geçti mi. Herhangi biri başarısız olursa nedenini açıklayan yalnızca kendisine görünen bir mesaj gösterilir.

Kapının soruları varsa her soru için bir kutu bulunan bir form açılır. Sorular Discord'un form sınırları nedeniyle 45 karakterle sınırlıdır. Cevap kutuları ya tek satırlıdır (200 karakter) ya da çok satırlıdır (1000 karakter) ve zorunlu olarak işaretlenebilir. Sorusu olmayan bir kapı başvuruyu hemen gönderir.

İnceleme mesajı **İnceleme kanalı**na gider; ayarlanmamışsa kapılı kanalın kendisine gönderilir. Mesajda başvuru sahibi, hesabının ne zaman oluşturulduğu ve sunucuya ne zaman katıldığı, her soru ve cevabı, canlı bir oy sayımı ve oylamanın ne zaman kapanacağını gösteren bir altbilgi bulunur. **Oylama kapanana kadar başvuru sahibini gizle** açıksa beklemedeyken isim "Hidden until the vote closes" ile değiştirilir.

### Durumlar

| Durum | Anlamı |
| --- | --- |
| Beklemede | Açık ve oylanıyor |
| Onaylandı | Geçti, erişim verildi |
| Reddedildi | Oylamayla, süre dolmasıyla ya da yetkililer tarafından reddedildi |
| Geri çekildi | Başvuru sahibi `channelaccesswithdraw` ile geri çekti |
| Süresi doldu | Mevcut süre kuralları tarafından kullanılmıyor; geçmiş için tutuluyor |

## Oylama

Kimin oy verebileceği kapıya bağlıdır. **Oy verme rolü** ayarlıysa yalnızca o role sahip üyeler oy verebilir. Değilse kanala zaten erişimi olan herkes ve Rolleri Yönet iznine sahip herkes oy verebilir. Başvuru sahipleri kendi başvurularına asla oy veremez.

Bir düğmeye tıklamak oy kaydeder. Farklı bir düğmeye tıklamak oyu değiştirir. Aynı düğmeye tekrar tıklamak oyu kaldırır. Sayım, her değişiklikten sonra mesajda güncellenir.

Başvuru, **Gereken onaylar** sayısına ya da **Gereken reddetmeler** sayısına ulaşınca hemen sonuçlanır. Bu eşiklerden birini 0 yapmak o tarafı devre dışı bırakır; yani **Gereken reddetmeler** değeri 0 olan bir kapı yalnızca yetkililer ya da süre dolması ile reddedilebilir.

**Döküm**, kimin hangi yönde oy verdiğini gösterir ve yalnızca oy verenlere görünür. **Kimin hangi yönde oy verdiğini gizle** açıksa döküm yalnızca Rolleri Yönet iznine sahip üyelere görünür.

### Pencere kapandığında

Arka plan kontrolü her dakika, **Oylama süresi** dolmuş başvuruları çalıştırır. Ne olacağı kapı başına ayarlanır:

| Seçenek | Kontrol panelindeki etiket | Sonuç |
| --- | --- | --- |
| Reddet | Başvuruyu reddet | Başvuru reddedilir. Varsayılan. |
| Çoğunluk | Hangi tarafın daha fazla oyu varsa | Onaylar redlerden fazlaysa onaylanır, aksi halde reddedilir |
| StayOpen | Yetkililer için açık bırak | Yetkililer karar verene kadar hiçbir şey olmaz |

Süre sınırı olmaması için **Oylama süresi** değerini 0 yap.

## Başvuru sahiplerini engelleme

Yetkililer bir kullanıcıyı tek bir kapıdan ya da sunucudaki tüm kapılardan engelleyebilir. Engellenen kullanıcılar başvurmaya çalıştığında "You are blocked from applying for this channel" mesajını görür. Engellerin isteğe bağlı bir nedeni olabilir ve kara listede görünür.

## Ayarlar

**Kanal Erişimi** sayfasında üç sekme vardır: **Kapılar**, **Başvurular** ve **Engellenenler**.

**Kapılar** sekmesi her kapıyı **Kabul ediliyor** düğmesiyle listeler ve ayarlarını, **Başvuru soruları** bölümünü ve bir **Başvuru paneli** gönderme alanını gösteren bir bölümü açar. Aşağıdaki varsayılanlar yeni kapılara uygulanır.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Kilitli kanal | gerekli | Kapılanan kanal |
| Erişim nasıl verilir | Ona bir rol ver | Rol kapısı ya da doğrudan kapı |
| Onaylandığında verilen rol | yok | Erişim rolü, rol kapıları için |
| Gereken onaylar | 3 | Onaylandı sonucunu veren onay sayısı; 0 devre dışı bırakır |
| Gereken reddetmeler | 3 | Reddedildi sonucunu veren red sayısı; 0 devre dışı bırakır |
| Oylama süresi (saat) | 72 | Süre kuralının çalışmasından önceki süre; 0 sınırsız |
| Süre dolduğunda | Başvuruyu reddet | Üç süre seçeneğinden biri |
| İnceleme kanalı | kapılanan kanalın kendisi | Başvuruların oylama için gönderildiği yer |
| Günlük kanalı | günlük yok | Yeni başvuruların ve sonuçların kaydedildiği yer |
| Oy verme rolü | erişim rolüne sahip herkes | Oy vermeyi bir role sınırlar |
| Yeni başvurularda rolü etiketle | etiket yok | Bir başvuru geldiğinde etiketlenen rol |
| Min hesap yaşı (gün) | 0 | Bundan daha yeni hesapları reddeder |
| Sunucuda en az süre (gün) | 0 | Bundan daha yakın zamanda katılan üyeleri reddeder |
| Yeniden başvuru bekleme süresi (saat) | 168 | Red ya da süre dolumundan sonra yeniden başvurmadan önceki bekleme |
| Çekimser düğmesi sun | açık | İnceleme mesajına bir Çekimser düğmesi ekler |
| Oylama kapanana kadar başvuru sahibini gizle | kapalı | Beklemedeyken anonim başvuru sahibi |
| Kimin hangi yönde oy verdiğini gizle | kapalı | Döküm yalnızca Rolleri Yönet için |
| Karar verildiğinde başvuru sahibine DM gönder | açık | Sonucu DM ile gönderir |

**Başvurular** sekmesi başvuruları kapıya ve duruma göre filtreler; beklemedeki başvurular için oy sayımı ile **Onayla** ve **Reddet** düğmelerini gösterir. **Engellenenler** sekmesi engellenen kullanıcıları kapsama göre listeler; birini **Bir kapıdan** ya da **Her kapıdan** engellemene ve isteğe bağlı bir neden eklemene olanak tanır.

## Kurulum adımları

1. Kanalı Discord'da özel yap; rol kapısı için, kanalı görebilecek rolü oluştur.
2. Kontrol panelinde **Kanal Erişimi** sayfasını aç ve **Bir kanal için başvuruları aç** seçeneğini kullan. **Kilitli kanal**'ı seç, **Erişim nasıl verilir**'i belirle ve gerekirse rolü seç.
3. Kapıyı genişlet. Başvuruların kilitli kanala düşmemesi için bir **İnceleme kanalı** ayarla; bir kayıt istersen bir **Günlük kanalı** ayarla.
4. **Gereken onaylar**, **Gereken reddetmeler** ve **Oylama süresi** değerlerini beklediğin oy veren sayısına göre ayarla.
5. **Başvuru soruları** altında en fazla beş soru ekle. Gerektiği gibi **Zorunlu** ve **Çok satırlı cevap** seçeneklerini işaretle.
6. **Başvuru paneli** altında düğmenin nereye konacağını seç ve **Paneli gönder** düğmesine tıkla.
7. Bir test hesabından başvur, erişimi olan bir üyeyle oy ver ve başvuru sahibinin içeri girdiğini kontrol et.

## Komutlar

Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Eğik çizgi sürümleri `/channelaccess` altında bulunur.

| Komut | Diğer adlar | Gereken yetki | Amaç |
| --- | --- | --- | --- |
| `channelaccesssetup <#channel> [@role]` | `casetup` | Rolleri Yönet | Bir kapı oluşturur; doğrudan kapı için rolü atla |
| `channelaccessremove <#channel>` | `caremove` | Rolleri Yönet | Bir kapıyı sorularıyla ve geçmişiyle birlikte siler |
| `channelaccesslist` | `calist` | Yok | Kapıları eşikleri, pencereleri ve durumlarıyla listeler |
| `channelaccessconfig <#channel> [setting] [value]` | `caconfig` | Rolleri Yönet | Tek bir ayarı değiştirir; ayar belirtilmeden çalıştırılırsa listeyi gösterir |
| `channelaccesspanel <#channel> [#target]` | `capanel` | Rolleri Yönet | Başvur düğmesini gönderir; varsayılan olarak bulunduğun kanala |
| `channelaccessquestionadd <#channel> <question>` | `caqadd` | Rolleri Yönet | Zorunlu, çok satırlı bir soru ekler |
| `channelaccessquestionremove <#channel> <position>` | `caqremove` | Rolleri Yönet | Bir soruyu listelenen numarasıyla kaldırır |
| `channelaccessquestionlist <#channel>` | `caqlist` | Rolleri Yönet | Soruları sıraya göre gösterir |
| `channelaccessapply <#channel>` | `caapply` | Yok | Kendin için başvur düğmesini gönderir |
| `channelaccesswithdraw <id>` | `cawithdraw` | Yok | Kendi açık başvurunu geri çeker |
| `channelaccesshistory [@user]` | `cahistory` | Yok | Başvuru geçmişin; diğer kullanıcılar için Rolleri Yönet gerekir |
| `channelaccesspending [#channel]` | `capending` | Yok | Açık başvuruları listeler; isteğe bağlı olarak tek bir kapı için |
| `channelaccessapprove <id> [reason]` | `caapprove` | Rolleri Yönet | Oylardan bağımsız onaylar |
| `channelaccessdeny <id> [reason]` | `cadeny` | Rolleri Yönet | Oylardan bağımsız reddeder |
| `channelaccessblacklistadd <@user> [#channel]` | `cabladd` | Rolleri Yönet | Bir kapıdan ya da kanal verilmezse her yerden engeller |
| `channelaccessblacklistremove <@user> [#channel]` | `cablremove` | Rolleri Yönet | Engeli kaldırır; engelin ayarlandığı kanalı ver |
| `channelaccessblacklist` | `cablacklist` | Rolleri Yönet | Engellenen kullanıcıları listeler |

`channelaccessconfig` komutunun kabul ettiği ayarlar şunlardır: `enabled`, `approvals`, `denials`, `votehours`, `onexpiry` (`deny`, `majority`, `stayopen`), `reviewchannel`, `logchannel`, `voterrole`, `pingrole`, `anonymousapplicant`, `anonymousvotes`, `allowabstain`, `minaccountage`, `minserverage`, `reapplycooldown` ve `dmondecision`.

> [!EXAMPLE]
> `caconfig #inner-circle approvals 5` ardından `caconfig #inner-circle onexpiry majority`.

## İpuçları ve dikkat edilecekler

- Bot, rol kapıları için Rolleri Yönet, doğrudan kapılar için ise bu kanalın izin üzerine yazmalarını düzenleme yetkisi olan Kanalları Yönet iznine ihtiyaç duyar. Botun en üstteki rolü, erişim rolünün üstünde olmalıdır.
- **İnceleme kanalı** ayarlanmazsa başvurular kilitli kanalın içinde gönderilir. Bu, "üyeler yeni gelenler hakkında oy versin" için uygundur; ancak oyu yetkililerin vermesi gerekiyorsa ayrı bir kanal ayarla.
- Komutla eklenen sorular her zaman zorunlu ve çok satırlıdır. Bir soruyu isteğe bağlı ya da tek satırlı yapmak ya da ona yer tutucu metin vermek için kontrol panelini kullan.
- Bir kapıyı silmek, sorularını, başvurularını ve oylarını kalıcı olarak siler.
- Oylama bitmeden sunucudan ayrılan üyelere, onaylanmış olsalar bile erişim verilmez.
- Yalnızca onay ve redler için sonuç DM ile gönderilir. Geri çekilen başvurular için DM gönderilmez.
- Engellenen bir kullanıcının engeli, engel konduğu kapsamla kaldırılmalıdır. Sunucu genelindeki bir engel, belirli bir kanalı içeren bir engel kaldırma komutuyla kaldırılmaz.

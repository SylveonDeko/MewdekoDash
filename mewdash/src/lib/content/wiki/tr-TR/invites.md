---
title: Davetler
slug: invites
summary: Her katılımı bir davet koduna, özel URL'ye ya da bir uygulamaya bağla; üye başına normal, ayrılan, sahte ve bonus davetleri say; kodlara etiket ver ve büyümeyi, elde tutmayı ve katılım kaynaklarını zaman içinde gör.
icon: fa-users
category: Community
dashboard: /dashboard/invites
module: Utility
tags: [invites, invite tracking, inviter, who invited, referrals, recruitment, leaderboard, fake invites, bonus invites, retention, vanity, labels, analytics, mass ban, davet, davet takibi, davet eden, kim davet etti, referans, işe alım, liderlik tablosu, sahte davet, bonus davet, elde tutma, özel url, etiket, analitik, toplu yasak]
related: [multigreets, statroles, liveboards, serverstats]
---

## Ne işe yarar

Biri katıldığında bot, sunucunun davet bağlantılarını katılımdan önce ve sonra karşılaştırarak hangisinin kullanıldığını bulur. Hiçbiri eşleşmezse özel URL'yi kontrol eder ve üyenin nasıl geldiğini kaydeder: bir üyenin davetiyle, özel URL ile, OAuth ile eklenen bir bot olarak ya da bilinmeyen bir yolla. Davet eden kişi, katılım **sahte** olarak işaretlenmediyse bir **normal** davet kazanır. Davet edilen üye ayrıldığında davet edenin **ayrılan** sayısı artar. Yetkililer **bonus** davetler verebilir. Bir üyenin toplamı; normal eksi ayrılan eksi sahte, artı bonus olarak hesaplanır.

Görülen her katılım, üye ayrıldıktan sonra da saklanır; böylece sayfa elde tutmayı (davet edilen üyelerden kaçının hâlâ burada olduğunu), yeniden katılımları ve hangi kodların kalan insanları getirdiğini gösterebilir.

## Neden kullanmalısın

- Bir işe alım yarışması düzenle ve ödülleri, alt hesaplarla ya da katıl-ayrıl döngüleriyle hile yapılamayan bir liderlik tablosundan dağıt.
- Her kodu etiketleyerek bir Twitter kampanyasının, bir ortak sunucunun ya da bir YouTube bağlantısının gerçekten kalan üyeler getirip getirmediğine bak.
- Hoş geldin mesajında davet edeni ve kodu göster.
- Tek bir bağlantı üzerinden bir raid geldiğinde, bir davet edenin getirdiği herkesi bul ve yasakla.

## Katılımlar nasıl atfedilir

- Botun davet listesini okuyabilmesi için **Sunucuyu Yönet** iznine ihtiyacı vardır. Bu izin olmadan hiçbir şey kaydedilmez.
- Katılımlar sunucu başına tek tek işlenir; iki kontrol arasında aynı kodu birden fazla kişi kullanırsa fazla olanlar hatırlanır ve sonraki katılımlara kredi olarak yazılır; böylece ani artışlar kaybolmaz.
- Özel URL ile yapılan bir katılım davet edensiz **Vanity** olarak kaydedilir. OAuth ile eklenen bir bot **Bot** olarak kaydedilir.
- Sahibi olan etiketli bir kod, kodu oluşturan kişi yerine sahibine kredi verir. `invitelink` komutundaki kişisel bağlantılar bu şekilde çalışır.

## Sahte tespiti

Bir katılım şu durumlardan biri geçerliyse sahte olarak işaretlenir; davet edene normal davet yerine sahte davet yazılır:

| Neden | Ne zaman |
| --- | --- |
| Kendi | Üye kendi davetini kullandı |
| Yeni hesap | Hesap, **Minimum hesap yaşı** değerinden daha yenidir (0 kontrolü devre dışı bırakır) |
| Yeniden katılım | Üye daha önce katılmıştı ve **Yeniden katılımları say** kapalı |
| Avatarsız | Üyenin avatarı yok ve **Avatarı olmayan üyeleri işaretle** açık |

**Kara listedeki** davet ediciler ya da kara listedeki bir role sahip olanlar, yine davet eden olarak görünür ama hiçbir zaman kredi kazanmaz. **Gizli** listedeki üyeler takip edilir ama liderlik tablolarında gösterilmez.

## Kontrol paneli sekmeleri

| Sekme | Gösterdiği |
| --- | --- |
| Genel Bakış | Son bir gün, hafta, ay ya da tüm zamanlar için katılımlar, ayrılmalar, net büyüme, elde tutma, sahte katılımlar ve katılım kaynakları; katılımlar ve ayrılmalar grafiği, en çok davet edenler ve en çok kullanılan kodlar |
| Sıralama tablosu | Her davet edenin normal, ayrılan, sahte, bonus ve elde tutma sayıları; pencereye ya da role göre filtrelenir ve CSV olarak dışa aktarılabilir. Bir satıra tıklayarak ya da bir üye seçerek dökümünü görebilir, normal, bonus ya da sahte davet ekleyebilir veya çıkarabilir ya da sıfırlayabilirsin |
| Üyeler | Görülen her katılım; davet edene, davet koduna ya da etikete göre filtrelenir ve nasıl geldiği, işaretlenip işaretlenmediği ve hâlâ burada olup olmadığıyla gösterilir. CSV olarak dışa aktarılabilir |
| Kodlar ve Etiketler | Sunucudaki her davet kodu; oluşturanı, kanalı ve kullanım sayısıyla. Bir koda etiket verebilir, isteğe bağlı olarak bu kodla katılan herkese verilecek bir rol ekleyebilir ya da kodu silebilirsin |
| Ayarlar | Takip, katılımda kaldırma, yeniden katılımları sayma, avatarsızları işaretleme, minimum hesap yaşı, kişisel bağlantıların yönlendirildiği kanal, katılma ve ayrılma günlük kanalı, kara listeler, gizli üyeler ile içe aktarma ve sıfırlama araçları |

## Ayarlar

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Davetleri takip et | Açık | Katılımların hiç atfedilip atfedilmeyeceği |
| Üyeler ayrılınca krediyi kaldır | Açık | Davet edilen bir üye ayrıldığında davet edenin ayrılan sayısını bir artırır ve toplamını düşürür |
| Yeniden katılımları say | Açık | Kapalıysa daha önce katılmış bir üye sahte davet olarak işaretlenir |
| Avatarı olmayan üyeleri işaretle | Kapalı | Avatarı olmayan hesaplardan gelen katılımlar sahte sayılır |
| Minimum hesap yaşı | 0 gün | Bundan daha yeni hesaplar sahte olarak işaretlenir |
| Kişisel bağlantı kanalı | sistem kanalı | `invitelink` ile oluşturulan davetlerin yönlendirildiği yer |
| Katılma ve ayrılma günlük kanalı | yok | Her katılım ve ayrılmada kimin kimi davet ettiğini, kodu, hesap yaşını ve sahte işaretini gösteren bir embed gönderir |

**Discord'dan kullanımları içe aktar**, her davet edenin normal toplamını kodları genelindeki kullanımların toplamına yükseltir ve asla düşürmez; bu yüzden bir yeniden başlatmadan ya da yeni bir kurulumdan sonra tekrar çalıştırmak güvenlidir. **Ayrılan davet edenleri sıfırla**, artık sunucuda olmayan herkesin sayacını temizler. **Her şeyi sıfırla**, her sayacı ve katılım geçmişini temizler.

## Karşılama yer tutucuları

Takip açıldıktan sonra her karşılama mesajı bunları kullanabilir. Bilinmeyen değerler `Unknown` ya da `0` olarak gösterilir.

| Yer tutucu | Değer |
| --- | --- |
| `%inviter.mention%`, `%inviter.username%`, `%inviter.id%`, `%inviter.avatar%` | Kredi verilen davet eden |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | Davet edenin sayıları |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%`, `%invite.fake%` | Kullanılan davet |
| `%user.joincount%`, `%user.leavecount%` | Bu üyenin kaç kez katıldığı ve ayrıldığı |
| `%server.members.ordinal%` | Üye sayısı 1st, 2nd, 1,204th biçiminde |
| `%user.joined.R%`, `%user.created.F%` ve diğer Discord zaman damgası stilleri t, T, d, D, f, F, R | Katılma ve hesap oluşturma zamanları canlı zaman damgaları olarak |

## Komutlar

Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Her komut `/invites` altında da bulunur.

| Komut | Diğer adlar | Gereken yetki | Amaç |
| --- | --- | --- | --- |
| `invites [@user]` | | Yok | Bir üyenin normal, ayrılan, sahte ve bonus dökümüyle toplamı ve sırası |
| `whoinvited [@user]` | `invitedby` | Yok | Bir üyeyi kimin davet ettiği, kodu ve katılımın işaretlenip işaretlenmediği |
| `invitedusers [@user]` | `userinvites` | Yok | Bir üyenin davet ettiği herkes; katılma tarihleri ve işaretlerle |
| `invitedbycode <code>` | | Yok | Bir kodla katılan herkes |
| `invitedbylabel <label>` | | Yok | Etiketli bir kodla katılan herkes |
| `inviteleaderboard [AllTime/Daily/Weekly/Monthly] [@role]` | `inviteslb` | Yok | Bir pencere için liderlik tablosu; isteğe bağlı olarak tek bir rol için |
| `invitestats [range]` | `growthstats` | Yok | Katılımlar, ayrılmalar, net, elde tutma, sahte katılımlar, kaynaklar, en çok davet edenler ve kodlar |
| `invitecodes [@user]` | `mycodes` | Yok | Bir üyenin davet kodları ve kullanımları |
| `invitelink` | `findlink`, `mylink` | Yok | Kişisel kalıcı bağlantın; yoksa oluşturulur |
| `addinvites`, `removeinvites`, `addbonusinvites`, `removebonusinvites`, `addfakeinvites`, `removefakeinvites <@user> <amount>` | | Sunucuyu Yönet | Bir üyenin sayacını ayarlar |
| `resetinvites <@user>` ya da `resetinvites Server` ya da `resetinvites LeftMembers` | | Sunucuyu Yönet; sunucu genelinde Yönetici | Sayaçları sıfırlar |
| `syncinvites [@user]` | | Sunucuyu Yönet | Discord'dan kullanımları içe aktarır |
| `deleteinvite <code>` | `delinvite` | Sunucuyu Yönet | Bir kodu siler |
| `purgeinvites [maxUses] [#channel]` | | Sunucuyu Yönet | En fazla bu kadar kullanılmış, etiketsiz her kodu siler |
| `inviteblacklist <@user or @role>` | `invbl` | Sunucuyu Yönet | Birinin kredi kazanıp kazanamayacağını açar ya da kapatır |
| `invitehide <@user>` | `invhide` | Sunucuyu Yönet | Birinin liderlik tablolarında görünüp görünmeyeceğini açar ya da kapatır |
| `inviteexclusions` | | Sunucuyu Yönet | Kara listeleri ve gizli üyeleri listeler |
| `invitelabelset <code> <label>`, `invitelabelrole <code> [@role]`, `invitelabelremove <code>`, `invitelabels` | | Sunucuyu Yönet | Etiketleri yönetir |
| `inviteexport [range]`, `invitedexport [@user]` | | Sunucuyu Yönet | CSV dışa aktarımları |
| `invitemassban <@user> [reason]`, `invitemassbancode <code> [reason]` | | Üyeleri Yasakla | Bir üye ya da bir kod tarafından davet edilip hâlâ burada olan herkesi onaydan sonra yasaklar |
| `invitesettings`, `toggleinvitetracking`, `toggleremoveinviteonleave`, `togglecountrejoins`, `togglefakenoavatar`, `setminaccountage <days>`, `invitelinkchannel [#channel]`, `invitelogchannel [#channel]` | | Sunucuyu Yönet | Ayarlar |

## İpuçları ve dikkat edilecekler

- Takip açılmadan önce katılan ya da bot çevrimdışıyken katılan üyelerin katılım kaydı yoktur. Normal toplamları Discord'un kendi sayılarından tohumlamak için bir kez **Discord'dan kullanımları içe aktar** komutunu çalıştır.
- Sahte katılımlar, üye ayrıldığında toplamı asla düşürmez; yalnızca normal olanlar ayrılan davete dönüşür.
- Ayrılıp geri dönen bir üye yeni bir katılım kaydı alır. **Yeniden katılımları say** açıkken davet eden yeniden bir normal davet kazanır; bu da önceki ayrılan davetini dengeler.
- Liderlik tablosundaki elde tutma yalnızca bot tarafından görülen katılımları sayar; bu yüzden %100 ile başlar ve geçmiş biriktikçe yerleşir.
- İstatistik rolleri davet sayılarını ödüllendirebilir ve canlı panolar davet liderlik tablosunu bir kanalda sabitleyebilir.

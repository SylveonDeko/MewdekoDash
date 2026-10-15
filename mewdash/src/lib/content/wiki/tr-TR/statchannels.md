---
title: İstatistik Kanalları
slug: statchannels
summary: Adında üye sayısı, boost sayısı, açık ticket sayısı ya da Twitch izleyici sayısı gibi canlı sayılar kendiliğinden güncellenen ses kanalları.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/statchannels
module: StatChannels
tags: [stat channels, counter, member count, live stats, voice channel stats, countdown, member goal, boost count, twitch viewers, istatistik kanalları, sayaç, üye sayısı, canlı istatistikler, ses kanalı istatistikleri, geri sayım, üye hedefi, boost sayısı, twitch izleyicileri]
related: [counting, twitch, suggestions, xp, afk, starboard]
---

## Ne işe yarar

İstatistik kanalı, kanal listenin en üstünde duran ve adında canlı bir sayı gösteren kilitli bir ses kanalıdır; örneğin "Members: 12,480". Bot, sayının güncel kalması için adı belirli aralıklarla yeniden yazar. Üyeler kanala katılamaz; kanal yalnızca okunmak için vardır.

Bir sayaç türü, ad için bir şablon, sayının bir stili ve ne sıklıkla yenileneceğini seçersin. Bot, sunucu bilgileri, çevrimiçi durumu, Nitro boost'ları, emoji yuvaları, üye hedefleri ve geri sayımlar dahil olmak üzere birkaç düzine sayaç destekler. Ayrıca bilet, öneri, çekiliş, XP, sayım, starboard ve bağlı Twitch ya da Minecraft sunucuları gibi diğer Mewdeko özelliklerinden değerler de gösterebilir.

Discord, bir kanalın adının on dakikada yalnızca iki kez değiştirilmesine izin verir. İstatistik Kanalları bunu, her dakika yenilenebilmesi için kanalı silip yeniden oluşturan bir yöntem de dahil olmak üzere birden fazla güncelleme mekanizması ile aşar.

## Neden kullanırsın

- Sunucunun en üstünde üye, insan ve bot sayılarını göster.
- Bir üye hedefine doğru ilerlemeyi yüzde ya da ilerleme çubuğu ile takip et.
- Bir etkinliğe, lansmana ya da yıl dönümüne geri sayım yap.
- Bir yayıncının sunucusunda Twitch canlı durumunu ve izleyici sayısını göster.
- Yetkililere, kontrol paneli açmadan açık ticket'ların ya da bekleyen önerilerin canlı görünümünü ver.
- Davet bağlantısının yanında Minecraft sunucusunun durumunu ve oyuncu sayısını göster.

## Sayaç türleri

Aşağıdaki tam liste, `statchanneltypes` komutunun ve kontrol panelindeki **Kullanılabilir Sayaçlar** bölümünün gösterdiği listedir. Her tür ortak yer tutucuları kabul eder; bazıları kendi yer tutucularını ekler. Varsayılan şablonlar, gösterilen metinden önce eşleşen bir emojiyle başlar.

### Üyeler

| Tür | Gösterir | Varsayılan şablon | Ek yer tutucular |
| --- | --- | --- | --- |
| `TotalMembers` | Tüm üyeler, botlar dahil | `Members: %count%` | |
| `HumanMembers` | Bot olmayan üyeler | `Humans: %count%` | |
| `BotCount` | Bot hesapları | `Bots: %count%` | |
| `OnlineMembers` | Çevrimdışı olmayan herhangi bir durumdaki üyeler | `Online: %count%` | |
| `IdleMembers` | Boşta olarak işaretlenmiş üyeler | `Idle: %count%` | |
| `DndMembers` | Rahatsız etmeyin olarak işaretlenmiş üyeler | `DND: %count%` | |
| `StreamingMembers` | Yayın etkinliği olan üyeler | `Streaming: %count%` | |
| `InVoiceMembers` | Herhangi bir ses kanalına bağlı üyeler | `In Voice: %count%` | |
| `RoleMembers` | Seçilen rolü taşıyan üyeler | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.color%` |
| `NewestMember` | En son katılan üye | `Newest: %member.name%` | `%member.name%`, `%member.id%` |
| `MembersJoinedToday` | Son 24 saatte katılanlar | `Joined Today: %count%` | |
| `MembersJoinedWeek` | Son 7 günde katılanlar | `This Week: %count%` | |
| `MemberGoal` | Hedef üye sayısına doğru ilerleme | `%count% / %goal%` | `%goal%`, `%goal.raw%`, `%goal.percent%`, `%goal.remaining%`, `%goal.bar%` |
| `AfkCount` | Şu anda Mewdeko üzerinden AFK olan üyeler | `AFK: %count%` | |

### Sunucu

| Tür | Gösterir | Varsayılan şablon | Ek yer tutucular |
| --- | --- | --- | --- |
| `Countdown` | Hedef tarihe kalan süre | `%days%d %hours%h left` | `%days%`, `%hours%`, `%minutes%`, `%total.hours%` |
| `ChannelCount` | Tüm kanallar | `Channels: %count%` | |
| `TextChannelCount` | Metin kanalları | `Text: %count%` | |
| `VoiceChannelCount` | Ses kanalları | `Voice: %count%` | |
| `CategoryCount` | Kategoriler | `Categories: %count%` | |
| `StageChannelCount` | Sahne kanalları | `Stages: %count%` | |
| `ForumChannelCount` | Forum kanalları | `Forums: %count%` | |
| `ThreadCount` | Şu anda aktif olarak önbelleğe alınmış thread'ler | `Threads: %count%` | |
| `RoleCount` | Roller | `Roles: %count%` | |
| `BoostCount` | Aktif Nitro boost'ları | `Boosts: %count%` | |
| `BoostLevel` | Boost seviyesi, 0 ile 3 arası | `Level %count%` | |
| `NextBoostGoal` | Bir sonraki seviye için gereken boost sayısı | `%count% to Tier %tier.next%` | `%tier.next%`, `%tier.current%` |
| `EmojiCount` | Tüm özel emojiler | `Emojis: %count%` | |
| `AnimatedEmojiCount` | Hareketli özel emojiler | `Animated: %count%` | |
| `StaticEmojiCount` | Hareketsiz özel emojiler | `Static: %count%` | |
| `StickerCount` | Özel çıkartmalar | `Stickers: %count%` | |
| `EmojiSlotsUsed` | Seviye sınırına göre kullanılan emoji yuvaları | `Slots: %count%/%slots.max%` | `%slots.max%`, `%slots.free%` |
| `ServerAge` | Sunucunun oluşturulmasından bu yana geçen gün sayısı | `Age: %count% days` | `%years%`, `%created%` |
| `EventCount` | Planlanmış etkinlikler | `Events: %count%` | |
| `BotUptime` | Mewdeko'nun ne kadar süredir çalıştığı | `Uptime: %days%d %hours%h` | `%days%`, `%hours%`, `%minutes%` |
| `InviteCount` | Davet takibiyle izlenen davetler | `Invites: %count%` | |

### Twitch

Bunlar Twitch modülü üzerinden bağlanmış Twitch kanalından okunur.

| Tür | Gösterir | Varsayılan şablon | Ek yer tutucular |
| --- | --- | --- | --- |
| `TwitchLiveStatus` | Kanalın canlı olup olmadığı | `%twitch.name%: %status%` | `%status%`, `%twitch.name%` |
| `TwitchViewers` | Mevcut izleyiciler | `Viewers: %count%` | `%twitch.name%` |
| `TwitchGame` | Yayınlanan kategori | `%game%` | `%game%`, `%title%`, `%twitch.name%` |
| `TwitchUptime` | Yayının ne kadar süredir canlı olduğu | `Live %hours%h %minutes%m` | `%hours%`, `%minutes%` |
| `TwitchFollowers` | Toplam takipçi | `Followers: %count%` | `%twitch.name%` |
| `TwitchSubs` | Toplam abone | `Subs: %count%` | `%twitch.name%` |
| `TwitchCounter` | Adlandırılmış bir Twitch sohbet sayacı | `%counter.name%: %count%` | `%counter.name%` |
| `TwitchLastRaider` | En son gelen raider | `Last Raid: %raider%` | `%raider%`, `%raid.viewers%` |
| `TwitchRecentStreams` | Son 14 günde başlayan yayınlar | `Streams: %count%` | |

### Diğer Mewdeko özellikleri

| Tür | Kategori | Gösterir | Varsayılan şablon | Ek yer tutucular |
| --- | --- | --- | --- | --- |
| `MinecraftPlayers` | Minecraft | İzlenen bir sunucuda çevrimiçi oyuncular | `Players: %count%/%players.max%` | `%players.max%`, `%server.version%` |
| `MinecraftStatus` | Minecraft | İzlenen bir sunucuya erişilip erişilemediği | `%status%` | `%status%`, `%latency%` |
| `CountingCurrent` | Sayım | Bir sayım kanalındaki güncel sayı | `Count: %count%` | |
| `CountingRecord` | Sayım | Şimdiye kadar ulaşılan en yüksek sayı | `Record: %count%` | |
| `OpenTickets` | Biletler | Açık, arşivlenmemiş biletler | `Open Tickets: %count%` | |
| `TicketsToday` | Biletler | Son 24 saatte açılan biletler | `Today: %count%` | |
| `PendingSuggestions` | Öneriler | Karar bekleyen öneriler | `Pending: %count%` | |
| `ActiveGiveaways` | Çekilişler | Şu anda devam eden çekilişler | `Giveaways: %count%` | |
| `StarboardPosts` | Starboard | Toplam starboard gönderisi | `Starred: %count%` | |
| `TopXpUser` | XP | En çok XP'ye sahip üye | `Top: %member.name%` | `%member.name%`, `%member.id%`, `%member.xp%` |
| `TotalGuildXp` | XP | Sunucuda kazanılan tüm XP | `Total XP: %count%` | |
| `TotalCurrency` | Para birimi | Üyelerin elindeki para birimi | `In Circulation: %count%` | |
| `ActivePolls` | Anketler | Oy kabul eden anketler | `Polls: %count%` | |
| `Clock` | Sunucu | Sunucunun saat diliminde tarih ve saat | `%time% %tz%` | `%time%`, `%date%`, `%datetime%`, `%weekday%`, `%tz%` |
| `MessagesToday`, `MessagesWeek` | Etkinlik | Son 24 saatteki ya da 7 gündeki mesajlar | `Today: %count%` | |
| `VoiceHoursToday`, `VoiceHoursWeek` | Etkinlik | Son 24 saatte ya da 7 günde tüm üyelerin toplam ses süresi | `Today: %count%h` | |
| `TopChatter` | Etkinlik | Son 7 günün en aktif sohbet eden üyesi | `Chatter: %member.name%` | `%member.name%`, `%member.id%`, `%member.messages%` |
| `TopVoiceMember` | Etkinlik | Son 7 günde en çok ses süresi olan üye | `Voice: %member.name%` | `%member.name%`, `%member.id%`, `%member.hours%` |
| `TopGame` | Etkinlik | Son 7 günün en çok oynanan oyunu (oyun takibi gerekir) | `%game%` | `%game%`, `%hours%`, `%players%` |
| `PlayingNow` | Etkinlik | Şu anda takip edilen bir oyunda olan üyeler (oyun takibi gerekir) | `Playing: %count%` | |
| `RoleMembersOnline` | Üyeler | Bir role sahip ve çevrimdışı olmayan üyeler | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.total%` |
| `TopInviter` | Davet takibi | En çok daveti olan üye | `Inviter: %member.name%` | `%member.name%`, `%member.id%`, `%member.invites%` |
| `InvitesWeek` | Davet takibi | Son 7 günde davetçilere atfedilen katılımlar | `This Week: %count%` | |
| `MembersLeftToday`, `MembersLeftWeek` | Üyeler | Son 24 saatte ya da 7 günde ayrılan üyeler | `Left Today: %count%` | |
| `NetGrowthWeek` | Üyeler | Son 7 günde katılımlar eksi ayrılmalar | `Growth: %count%` | `%joins%`, `%leaves%` |

### Her tür için kullanılabilir yer tutucular

| Yer tutucu | Değer |
| --- | --- |
| `%count%` | Değer, seçilen görüntüleme stiliyle gösterilir |
| `%count.raw%` | Değer, düz rakamlar olarak |
| `%server.name%` | Sunucu adı |
| `%server.id%` | Sunucu kimliği |
| `%server.members%` | Toplam üye sayısı |
| `%server.boostcount%` | Boost sayısı |
| `%server.boostlevel%` | Boost seviyesi |

Kanal adları Discord'un 100 karakter sınırıyla sınırlıdır.

## Görüntüleme stilleri

**Sayaç Stili**, `%count%` değerinin nasıl gösterileceğini belirler. Yalnızca sayısal sayaçlarda geçerlidir; `NewestMember` gibi metin sayaçları metni olduğu gibi yazdırır, `TwitchLiveStatus` gibi doğru ya da yanlış sayaçlar ise "LIVE" ya da "Offline" tarzı metin yazdırır.

| Stil | 1234 için örnek | Notlar |
| --- | --- | --- |
| `Plain` | `1234` | Düz rakamlar |
| `Comma` | `1,234` | Binlik ayırıcılar. Varsayılan. |
| `Compact` | `1.2K` | K, M, B, T ekleri, varsayılan olarak bir ondalık basamakla |
| `Padded` | `1234` | Sabit genişliğe kadar sıfırla doldurulur, varsayılan dört basamak; yani 42 `0042` olur |
| `Ordinal` | `1,234th` | st, nd, rd ya da th ekler |
| `Percent` | `61.7%` | Değer, hedef değerin yüzdesi olarak, varsayılan olarak bir ondalık basamakla |
| `ProgressBar` | on hücrelik bir çubuk | Hedef değere doğru dolu ve boş hücreler, varsayılan olarak on hücre |
| `EmojiDigits` | tuş takımı rakamları | Her rakam bir tuş takımı emojisi olarak |
| `Roman` | `MCCXXXIV` | 1 ile 3999 arası için Roma rakamları, aksi halde virgül stiline döner |

`Percent` ve `ProgressBar`, karşılaştırılacak bir hedef değere ihtiyaç duyar. Hedef yoksa `0%` ya da boş bir çubuk gösterirler.

## Güncelleme mekanizmaları

| Mekanizma | Kontrol paneli etiketi | Nasıl çalışır |
| --- | --- | --- |
| `Rename` | Yalnızca adı değiştir | Kanal adını düzenler. Discord, kanal başına on dakikada iki yeniden adlandırmaya izin verdiği için yenileme aralığı en az 5 dakikaya zorlanır. Kanal kimliği asla değişmez. |
| `Recreate` | Sil ve yeniden oluştur | Aynı ad, kategori, konum ve izin üzerine yazmalarıyla yeni bir kanal oluşturur, sonra eskisini siler. Her dakika yenilenebilir, ancak kanal kimliği her güncellemede değişir ve her güncelleme denetim kaydına iki giriş bırakır. |
| `Auto` | Otomatik (önerilen) | On dakikada iki kez olan bütçe izin verdiği sürece adı değiştirir. Bütçe tükenir ve aralık 5 dakikanın altındaysa bunun yerine yeniden oluşturur. Aralık 5 dakika ya da daha fazlaysa bir sonraki yeniden adlandırma sırasını bekler. |

Yeni istatistik kanalları için varsayılan, **Otomatik** ve **5 dakika**dır. Aralıklar 1 dakika (Rename için 5) ile 1440 dakika arasında sınırlandırılır. Bot, aralığı dolmuş kanallar için her 30 saniyede bir kontrol eder.

> [!WARNING]
> Yeniden oluşturma kanal kimliğini değiştirir. Kanala başvuran her şey, örneğin başka botlardaki izin kurulumları ya da sabitlenmiş bağlantılar, her yenilemede bozulur. Bunu yalnızca hızlı yenilemenin kararlı bir kimlikten daha önemli olduğu yerlerde kullan.

## Ayarlar

Sayfada üç sekme vardır: **İstatistik Kanalları**, **Ekle** ve **Varsayılanlar**; ayrıca başlıkta bir **Yenile** düğmesi bulunur. **İstatistik Kanalları**, yapılandırılmış her kanalı **Düzenle** ve **Kaldır** düğmeleriyle listeler.

**İstatistik Kanalı Ekle** bölümünde, bir **Ses Kanalı** seçiciyle **Yeni Kanal Oluştur** ya da **Mevcut Kanalı Kullan** seçeneklerini bulursun. Ardından:

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Kategori (isteğe bağlı) | yok | Yeni oluşturulan kanalın nereye yerleştirileceği |
| Sayaç | yok | Listeden sayaç türü |
| Şablon | türün varsayılanı | Yer tutucuları içeren kanal adı; bir yer tutucu çipine tıklayarak ekleyebilirsin, yazdıkça önizleme güncellenir |
| Sayaç Stili | Virgül | Yukarıdaki tablodan görüntüleme stili |
| Güncelleme Mekanizması | Otomatik | Yeniden adlandırma, yeniden oluşturma ya da otomatik |
| Yenileme Aralığı (dakika) | 5 | Adın ne sıklıkla yenileneceği |
| Rol | yok | `RoleMembers` için gösterilir |
| Hedef Tarih | yok | `Countdown` için gösterilir |
| Hedef | yok | `MemberGoal` için gösterilir ve yüzde ile ilerleme çubuğu stilleri tarafından kullanılır |
| Twitch Sayaç Adı | yok | `TwitchCounter` için gösterilir |
| Sayım Kanalı | yok | Sayım türleri için gösterilir |
| Minecraft Sunucusu | yok | Minecraft türleri için gösterilir |

**Yeni İstatistik Kanalları İçin Varsayılanlar**, daha sonra eklenen kanallar için **Varsayılan Mekanizma**, **Varsayılan Sayaç Stili** ve **Varsayılan Aralık (dakika)** değerlerini ayarlar. **Varsayılanlar** sekmesinde ayrıca **Sayaç Stilleri** ve **Kullanılabilir Sayaçlar** başvuru bölümleri bulunur.

Yeni oluşturulan bir kanal, bir etiket gibi davranması için `@everyone` rolüne Bağlan iznini kapatır. Kendin eklediğin bir kanal, sahip olduğu izinleri korur.

## Kurulum adımları

1. Kontrol panelinde **İstatistik Kanalları**'nı aç ve **Varsayılanlar** sekmesine geç. **Varsayılan Mekanizma**'yı Otomatik olarak bırak ve rahat hissettiğin bir aralık ayarla.
2. **Ekle** sekmesine git, **Yeni Kanal Oluştur**'u seç ve sayaçların gruplanmasını istiyorsan bir **Kategori** seç.
3. Bir **Sayaç** seç, örneğin Toplam Üye (Total Members). **Şablon**'u düzenle ve önizlemeyi izle.
4. Bir **Sayaç Stili** seç ve kaydet.
5. Her sayaç için tekrarla. Bir üye hedefi için `MemberGoal`'u seç, **Hedef** değerini ayarla ve `ProgressBar` stilini dene.
6. Yeni kanallar Discord'da kanal listesinin en üstüne yerleşmediyse onları en üste sürükle.
7. Bir yenileme aralığı bekle ve adların güncellendiğini doğrula.

## Komutlar

Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Türler, stiller ve mekanizmalar yukarıdaki tablolardaki adlardır; örneğin `TotalMembers`, `Compact`, `Recreate`.

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `statchannelcreate <type> [template]` | `scnew` | Kanalları Yönet | Bu sayacı gösteren yeni bir kilitli ses kanalı oluşturur |
| `statchanneladd #voice <type> [template]` | `sca` | Kanalları Yönet | Mevcut bir ses kanalını istatistik kanalına dönüştürür |
| `statchannelrole #voice @role [true] [template]` | `scr` | Kanalları Yönet | Bir rol üye sayacı ekler; `true` yalnızca çevrimdışı olmayan üyeleri sayar |
| `statchannelcountdown #voice <date> [template]` | `scc` | Kanalları Yönet | Bir tarihe geri sayım ekler |
| `statchannelgoal #voice <number> [template]` | `scg` | Kanalları Yönet | Bir üye hedefi sayacı ekler |
| `statchanneltwitchcounter #voice <counter> [template]` | | Kanalları Yönet | Adlandırılmış bir Twitch sohbet sayacını yansıtır |
| `statchannelmechanism #voice <mechanism> [minutes]` | | Kanalları Yönet | Yeniden adlandırma, yeniden oluşturma ya da otomatik ayarlar; isteğe bağlı olarak aralığı da |
| `statchannelstyle #voice <style>` | | Kanalları Yönet | Görüntüleme stilini ayarlar |
| `statchanneldefaults [mechanism] [minutes] [style]` | | Kanalları Yönet | Yeni istatistik kanalları için varsayılanları ayarlar |
| `statchanneltypes [category]` | | Hiç kimse | Her sayacı bir örnekle listeler; isteğe bağlı olarak kategoriye göre |
| `statchannellist` | `scl` | Hiç kimse | Bu sunucunun istatistik kanallarını tür, stil, mod ve şablonla listeler |
| `statchannelremove #voice` | `statchrm` | Kanalları Yönet | Bir kanalı takip etmeyi durdurur |

`statchannelcreate` için botun da Kanalları Yönet yetkisine sahip olması gerekir. Eğik çizgi (slash) eşdeğerleri `/statchannel` altındadır.

## İpuçları ve dikkat edilecekler

- Botun bir kanalın adını değiştirmek ya da yeniden oluşturmak için Kanalları Yönet yetkisine ihtiyacı vardır.
- Bir ses kanalı yalnızca bir istatistik kanalı olabilir. Aynısını iki kez eklemeye çalışmak "already a stat channel" hatasıyla başarısız olur.
- Sayım, Minecraft ve Twitch sayaçları için önce bu özelliklerin kurulmuş olması gerekir. Sayım ve Minecraft hedefleri kontrol panelinde seçilir; bunlar için bir komut yoktur.
- `statchannelremove` yalnızca takibi durdurur. Artık istemiyorsan ses kanalını kendin silmelisin.
- Twitch izleyicileri ya da açık biletler gibi canlı değerler, yine kanalın kendi aralığını izler. Tüm kanallarda değil, yalnızca bu kanallarda aralığı düşür.
- `Percent` ve `ProgressBar` stilleri kanalın kendi hedef değerini kullanır. Hedefi olmayan bir sayaçta bu stiller her zaman sıfır gösterir.

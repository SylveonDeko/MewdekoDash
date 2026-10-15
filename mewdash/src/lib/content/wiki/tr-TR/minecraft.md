---
title: Minecraft
slug: minecraft
summary: Minecraft sunucularını kaydet, kendini güncelleyen canlı durum embed'leri yayınla, çevrimiçi ve çevrimdışı uyarıları al, RCON komutlarını çalıştır ve yardımcı eklentiyle oyun içi sohbeti, katılımları, ölümleri ve gelişmeleri Discord'a köprüle.
icon: fa-server
category: Entertainment
dashboard: /dashboard/minecraft
module: Minecraft
tags: [minecraft, mc, server status, bridge, rcon, whitelist, chat bridge, java, bedrock, geyser, player lookup, skin, minecraft sunucu, sunucu durumu, köprü, beyaz liste, sohbet köprüsü, oyuncu sorgusu, skin]
related: [statchannels, logging, utility]
---

## Ne işe yarar

Yetkililer bir ya da birden fazla Minecraft sunucusunu ad ve adresiyle kaydeder. Bundan sonra her üye `mcstatus` komutunu çalıştırarak sunucunun açık olup olmadığını, MOTD'sini, sürümünü, gecikmesini ve kimlerin çevrimiçi olduğunu görebilir. Bir sunucu ayrıca izlenebilir: bot bir kanala durum embed'i gönderir ve bunu bir zamanlayıcıyla düzenler ya da oyuncu sayısını kanal konusuna yazar; sunucu kapandığında ya da geri geldiğinde duyuru yapar.

Sunucunun RCON özelliği açıksa yetkililer oyuna girmeden Discord'dan ya da kontrol panelindeki konsoldan konsol komutları gönderebilir ve beyaz listeyi yönetebilir.

İsteğe bağlı yardımcı eklenti bağlantıyı iki yönlü bir köprüye dönüştürür. Oyuncu sohbeti, katılmalar, ayrılmalar, ölümler ve gelişmeler, seçtiğin Discord kanallarına gönderilir; köprü kanalına yazılan mesajlar da oyundaki oyunculara iletilir.

## Neden kullanırsın

- Üyelerin ne zaman girmeye değdiğini görebilmesi için canlı bir "kim çevrimiçi" embed'i göster.
- Sunucu çöktüğünde ya da bakımdan sonra geri geldiğinde topluluğu hemen bilgilendir.
- Sunucu konsoluna girmeden Discord'dan yeni üyeleri beyaz listeye ekle.
- Discord'da olup oyunda olmayan üyeleri oyun içi sohbet, ölümler ve gelişmelerle güncel tut.
- Bir başvuruyu ya da şikayeti incelerken bir oyuncunun UUID'sine ya da skin görüntüsüne bak.

## Sunucu türleri

| Tür | Varsayılan port | Nasıl sorgulanır |
| --- | --- | --- |
| Java Edition | 25565 | Sunucu listesi pingi; **Query Port** ayarlandığında ve `enable-query=true` olduğunda sorgu protokolü de kullanılır |
| Bedrock Edition | 19132 | Bedrock pingi |
| Geyser (Java + Bedrock) | 25565 | Geyser olarak işaretlenmiş Java pingi |

Her sunucunun adı küçük harflerle saklanır ve eklediğin ilk sunucu, argüman verilmeden kullanılan `mcstatus` için varsayılan olur. Özel, ayrılmış ve loopback adresleri, bot sunucusu tarafından izin verilmedikçe reddedilir.

## Sunucuyu izlemek

**İzleme Kanalı** ayarla; bot sunucuyu her **İzleme Aralığı** dakikada bir sorgular (varsayılan 5, en az 1). Sonucu ne ile yapacağı **İzleme Modu** değerine bağlıdır.

| Mod | Davranış |
| --- | --- |
| Embed (yerinde düzenle) | Tek bir durum embed'i gönderir ve her turda düzenler; mesaj silinirse yeniden gönderir |
| Kanal konusu | Kanal konusuna kısa bir durum satırı yazar; en fazla beş dakikada bir |
| İkisi de | Yukarıdakilerin ikisini birden yapar |

Her turda çevrimiçi durumun, oyuncu sayısının, gecikmenin ve sürümün anlık görüntüsü de kaydedilir. Kontrol panelindeki **Geçmiş** sekmesi bunları zaman içinde grafik olarak gösterir.

Çevrimiçi durumu değiştiğinde bot izleme kanalına bir uyarı gönderir: varsayılan olarak yeşil "came online" ya da kırmızı "went offline" embed'i, ya da senin **Sunucu Çevrimiçi Uyarısı** ve **Sunucu Çevrimdışı Uyarısı** şablonların.

### Durum yer tutucuları

**Özel İzleme Embed'i** ve iki uyarı şablonu embed ayrıştırıcısından geçer ve bu yer tutucuları destekler.

| Yer tutucu | Değer |
| --- | --- |
| `%mc.server.name%` | Kayıtlı ad |
| `%mc.server.address%` | Ana makine adı ya da IP |
| `%mc.server.port%` | Port |
| `%mc.online%` | `Online` ya da `Offline` |
| `%mc.players.online%` | Mevcut oyuncu sayısı |
| `%mc.players.max%` | Oyuncu slotu sayısı |
| `%mc.player.list%` | Çevrimiçi oyuncuların adları |
| `%mc.motd%` | Biçim kodları temizlenmiş MOTD |
| `%mc.version%` | Bildirilen sürüm |
| `%mc.latency%` | Ping, örneğin `42ms` |
| `%mc.favicon%` | Sunucu simgesinin URL'si |
| `%mc.map%` | Dünya adı, yalnızca sorgu protokolü |
| `%mc.gamemode%` | Oyun modu, yalnızca sorgu protokolü |
| `%mc.software%` | Sunucu yazılımı, yalnızca sorgu protokolü |
| `%mc.plugins%` | Eklenti listesi, yalnızca sorgu protokolü |
| `%mc.query%` | Genişletilmiş sorgu yanıt verdiyse `Yes` |
| `%mc.geyser%` | Geyser algılandıysa `Yes` |

## RCON ve beyaz liste

Bir sunucu için **RCON Ayarları**'nı aç ve `server.properties` dosyasındaki **RCON Portu** ile **RCON Şifresi**'ni gir. Bundan sonra `mcrcon` herhangi bir konsol komutunu gönderir ve çıktıyı döndürür. `mcwhitelist` beyaz liste komutlarını `add`, `remove`, `list`, `on`, `off` ve `reload` eylemleriyle sarar. Kontrol panelinde beyaz liste, ekleme ve kaldırma düğmeleriyle bir liste olarak görünür; RCON açık sunucular için **Konsol** sekmesi bir komut satırı sunar.

> [!WARNING]
> RCON tam konsol erişimi verir. `mcrcon` komutunu yalnızca yöneticilerle sınırla ve şifreyi diğer sunucu kimlik bilgileri gibi koru.

## Yardımcı eklenti köprüsü

Köprü, oyun sunucusunda MewdekoMC eklentisini gerektirir: Paper 1.21+ için bir Paper eklentisi ya da 21.1.x için bir NeoForge modu; ikisi de Java 21 üzerinde çalışır. Kontrol panelinde sunucunun **Yardımcı Eklenti** bölümünü aç ve bir anahtar oluştur. **API URL** ve **API anahtarı**'nı eklentinin `config.yml` (Paper) ya da `config/mewdeko-server.toml` (NeoForge) dosyasına kopyala, sonra sunucuyu yeniden başlat ya da `/mewdeko reconnect` komutunu çalıştır. Anahtar yalnızca bir kez gösterilir; değiştirmek için yeni bir tane oluştur.

Bağlandıktan sonra eklenti olayları bir WebSocket üzerinden gönderir ve bot bunları kanallara yönlendirir.

| Olay | Gittiği yer | Varsayılan görünüm |
| --- | --- | --- |
| Oyuncu katılımı | **Katılma/Ayrılma** kanalı | Oyuncunun adı ve avatarıyla yeşil embed |
| Oyuncu ayrılması | **Katılma/Ayrılma** kanalı | Oyuncunun adı ve avatarıyla kırmızı embed |
| Sohbet | **Sohbet Köprüsü** kanalı | `**player**: message` |
| Ölüm | **Ölümler** kanalı | Ölüm mesajıyla gri embed |
| Gelişme | **Gelişmeler** kanalı | Gelişmenin adıyla yeşil embed |
| Sunucu durumu | Hiçbir yere; TPS ve bellek bilgisiyle birlikte geçmiş anlık görüntüsü olarak saklanır | |

Boş bırakılan her olay kanalı **İzleme Kanalı**'na düşer. Sohbet Köprüsü kanalına (ya da o ayarlı değilse izleme kanalına) bot olmayan kullanıcıların yazdığı mesajlar, varsayılan olarak `[Discord] user: message` biçiminde oyuna iletilir. Eklentinin kendi yapılandırması her olay kategorisini kapatabilir; konsol akışı varsayılan olarak kapalıdır ve bot tarafından gösterilmez.

### Köprü olay şablonları

Discord'a giden her olayın **Köprü Olay Şablonları** altında kendi şablonu olabilir. Şablonlar embed oluşturucu çıktısını kabul eder, etiketler etkisiz hale getirilir ve bu yer tutucular yerine konur.

| Şablon | Yer tutucular |
| --- | --- |
| Oyuncu Katılımı (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Oyuncu Ayrılması (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Sohbet Mesajı (Discord) | `%mc.player%`, `%mc.message%`, `%mc.avatar%` |
| Ölüm Mesajı (Discord) | `%mc.player%`, `%mc.death.message%`, `%mc.avatar%` |
| Gelişme (Discord) | `%mc.player%`, `%mc.advancement%`, `%mc.avatar%` |
| Discord'dan sohbet (oyun içi format) | `%user%`, `%message%`, `%channel%`; Minecraft paragraf işareti renk kodlarını kullan |

## Ayarlar

Minecraft sayfasında **Sunucular**, **Sunucu Ekle**, **Geçmiş** ve **Konsol** sekmeleri ile seçili sunucunun adını taşıyan, o sunucuyu düzenlemek için kullanılan bir sekme bulunur.

| Ayar | Varsayılan | Ne kontrol eder |
| --- | --- | --- |
| Ad | | Komutlarda kullanılan kısa tanımlayıcı, örneğin `survival` |
| Adres | | Ana makine adı ya da IP |
| Port | 25565 | Oyun portu; Bedrock için 19132 |
| Tür | Java Edition | Java, Bedrock ya da Geyser |
| Query Portu (0 = oyun portu) | 0 | Genişletilmiş sorgu protokolü için port |
| İzleme Kanalı | yok | Durum embed'ini ve uyarıları alan kanal |
| İzleme Aralığı (dakika) | 5 | Sunucunun ne sıklıkla sorgulandığı |
| İzleme Modu | Embed | Embed, Kanal konusu ya da İkisi de |
| Özel İzleme Embed'i | varsayılan embed | Yukarıdaki yer tutucuları kullanan kendi durum embed'in |
| Sunucu Çevrimiçi Uyarısı | varsayılan embed | Sunucu geri geldiğinde gönderilen mesaj |
| Sunucu Çevrimdışı Uyarısı | varsayılan embed | Sunucu kapandığında gönderilen mesaj |
| Etkinlik Kanalları | izleme kanalı | Sohbet Köprüsü, Katılma/Ayrılma, Ölümler, Gelişmeler |
| Köprü Olay Şablonları | varsayılanlar | Yukarıda listelenen olay başına şablonlar |
| RCON Ayarları | kapalı | Etkin anahtarı, RCON Portu, RCON Şifresi |
| Yardımcı Eklenti | anahtar yok | Eklenti API anahtarını oluştur ya da iptal et ve API URL'sini kopyala |

## Kurulum adımları

1. Kontrol panelinde **Minecraft**'ı aç ve **Sunucu Ekle** sekmesine git.
2. Bir **Ad** gir, **Adres** ve **Port**'u doldur, **Tür**'ü seç, bir **İzleme Kanalı** ve **İzleme Modu** seç. Kaydet.
3. **Sunucular** sekmesini kontrol et: durum kartı birkaç saniye içinde sunucuyu çevrimiçi göstermelidir.
4. Konsol ve beyaz liste erişimi istiyorsan sunucuyu düzenleyip **RCON Ayarları**'nı aç, ardından **Konsol** sekmesini dene.
5. Sohbet köprüsü için **Etkinlik Kanallarını** ayarla, **Yardımcı Eklenti** altında bir anahtar oluştur, eklentiyi oyun sunucusuna kur ve URL ile anahtarı yapılandırma dosyasına yapıştır.
6. Oyuna gir ve bir şey yaz: mesaj Sohbet Köprüsü kanalında görünmeli, oradaki bir yanıt da oyuna düşmelidir.

## Komutlar

Bu komutları sunucunun önekiyle çalıştır (önekini değiştirmediysen `.`). Slash sürümleri `/minecraft` altında bulunur.

| Komut | Takma adlar | Gereken yetki | Amaç |
| --- | --- | --- | --- |
| `mcstatus [name or address]` | `mcs` | Herkes | Varsayılan sunucunun, kayıtlı bir sunucunun ya da yazdığın herhangi bir `host:port` adresinin durumu |
| `mcadd <name> <address[:port]>` | | Sunucuyu Yönet | Bir sunucu kaydet; Bedrock için adresin başına `bedrock:` ekle |
| `mcremove <name>` | `mcrm` | Sunucuyu Yönet | Kayıtlı bir sunucuyu sil |
| `mclist` | `mcl` | Herkes | Kayıtlı sunucuları türü, varsayılan işareti ve izleme kanalıyla listele |
| `mcdefault <name>` | `mcdef` | Sunucuyu Yönet | `mcstatus`'un varsayılan olarak kullandığı sunucuyu seç |
| `mcwatch <name> [#channel]` | `mcw` | Sunucuyu Yönet | Bir kanala durum göndermeye başla ya da kanal olmadan durdur |
| `mcwatchmode <name> <embed, channeltopic or both>` | `mcwm` | Sunucuyu Yönet | İzlemenin durumu nasıl göstereceğini seç |
| `mcembed <name> [template]` | `mce` | Sunucuyu Yönet | Özel bir durum embed'i ayarla ya da sıfırlamak için `-` |
| `mcplayer <username>` | `mcp` | Herkes | Bir oyuncunun UUID'sini, avatarını ve skinini göster |
| `mcskin <username>` | | Herkes | Bir oyuncunun skin görüntüsünü göster |
| `mcrcon <name> <command>` | | Yönetici | RCON üzerinden bir konsol komutu çalıştır |
| `mcwhitelist <name> <action> [player]` | `mcwl` | Sunucuyu Yönet | `add`, `remove`, `list`, `on`, `off` ya da `reload` |

## İpuçları ve dikkat edilecekler

- `mcstatus` her Discord sunucusu için dakikada on sorgu ile sınırlıdır; bu sınır tüm üyeler arasında paylaşılır.
- Kayıt yapmadan `mcstatus play.example.com:25565` ile doğrudan adres sorgulamak çalışır; ancak özel ve yerel adresler engellenir.
- Kanal konusu modu için izleme kanalında **Kanalları Yönet** yetkisi gerekir; ayrıca Discord konu düzenlemelerini kendisi sınırladığı için konu modu beş dakikadan daha sık güncellenmez.
- Harita, oyun modu ve eklenti gibi ayrıntılar yalnızca `server.properties` dosyasında `enable-query=true` ayarlıysa ve **Query Portu** eşleşiyorsa görünür.
- Watch embed'i silinirse bir sonraki turda hata vermek yerine yeni bir tane gönderilir.
- Köprü mesajları `@everyone`, `@here` ve kullanıcı etiketlerini etkisiz hale getirir; böylece oyuncular oyun içinden Discord'da etiket atamaz.

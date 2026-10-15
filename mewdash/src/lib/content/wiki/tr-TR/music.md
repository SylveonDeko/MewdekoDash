---
title: Müzik
slug: music
summary: Bir ses kanalında YouTube, Spotify ve SoundCloud'dan müzik çal ve ara; kuyruk, kayıtlı çalma listeleri, ses filtreleri, DJ rolü, metinden konuşmaya ve Last.fm scrobble özelliğiyle.
icon: fa-music
category: Entertainment
dashboard: /dashboard/music
module: Music
tags: [music, play, queue, playlist, spotify, youtube, soundcloud, volume, skip, loop, repeat, dj role, filters, bass boost, nightcore, tts, text to speech, lastfm, scrobble, music links, müzik, çalma, kuyruk, çalma listesi, ses, geç, tekrar, dj rolü, filtreler, bas güçlendirme, metinden konuşmaya, müzik bağlantıları]
related: [utility, administration]
---

## Ne işe yarar

Bir üye bir ses kanalına katılır ve `play` komutunu bir bağlantı ya da aramayla çalıştırır. Bot kanala katılır, parçayı kuyruğa ekler ve çalmaya başlar. YouTube, YouTube Music, SoundCloud ve Spotify bağlantıları doğrudan çözümlenir; Spotify parçaları, albümleri ve çalma listeleri YouTube ile eşleştirilir. Düz bir arama, en fazla 25 sonucu bir seçim menüsünde gösterir; üye istediği parçayı seçer.

Ses kanalındaki herkes tek bir kuyruğu paylaşır. Üyeler kuyruğu görüntüleyebilir, bir girişe atlayabilir, parçaları taşıyabilir veya kaldırabilir, karıştırabilir, bir parçayı ya da tüm kuyruğu tekrarlatabilir ve kuyruğu adlandırılmış bir çalma listesi olarak kaydedip daha sonra yeniden yükleyebilir. Geçme işlemi DJ rolüne sahip üyeler için anında yapılır; diğerleri için oylama gerekir.

Yetkililer, şu an çalıyor ve kuyruk boş bildirimlerinin gönderileceği bir müzik kanalı seçer; DJ rolünü, varsayılan sesi ve tekrar modunu ayarlar; bas güçlendirme ya da nightcore gibi ses filtrelerini açabilir. Kontrol panelinde kuyruğu, tekrar düğmelerini ve filtre anahtarlarını içeren canlı bir oynatıcı görünür; aynı canlı akış mobil uygulamayı da besler.

Aynı modülde iki ek özellik daha vardır. Metinden konuşmaya (TTS), ses kanalındaki sohbet mesajlarını sesli okur; kullanıcıya özel sesler ve bir engelleme listesi desteklenir. Last.fm ise üyelerin botun çaldığı parçaları scrobble etmesini ve dinleme alışkanlıklarıyla ilgili `fm` tarzı komutları kullanmasını sağlar.

## Neden kullanmalısın

- Sohbet ses kanalının arka planında müzik olsun ve herkes bu müziğe parça ekleyebilsin; tek bir kişi bütün gece DJ'lik yapmak zorunda kalmasın.
- Yetkililer, yalnızca güvenilir üyelerin anında geçebilmesi için bir DJ rolü istesin; diğerleri oy kullansın.
- Bir topluluk, her etkinlikte başta yüklenen birkaç ev çalma listesi tutsun.
- Bir ses kanalında konuşamayan üyeler olsun ve mesajları sesli okunsun.
- Müzikseverler Last.fm istatistiklerini ve "bu sanatçıyı kim biliyor" sıralamalarını karşılaştırabilecekleri ortak bir yer istesin.

## Çalma ve kuyruk

Müzik komutlarının neredeyse hepsi için bir ses kanalında olmalısın. Bot zaten başka bir kanalda çalıyorsa, başka bir kanaldan gelen komutlar reddedilir.

`play <link or search>` şunları kabul eder:

| Girdi | Ne olur |
| --- | --- |
| YouTube veya YouTube Music bağlantısı | Doğrudan yüklenir, çalma listeleri dahil |
| SoundCloud bağlantısı | Doğrudan yüklenir |
| Spotify parça bağlantısı | Bir YouTube parçasıyla eşleştirilir |
| Spotify albüm veya çalma listesi bağlantısı | Her girdi YouTube ile eşleştirilir ve çözümlendikçe kuyruğa eklenir; ilerleme mesajı gösterilir |
| Diğer her şey | YouTube'da aranır, en fazla 25 sonuç bir seçim menüsünde gösterilir |

`play <number>` belirtilen kuyruk sırasına atlar. `search <query>` on sonuç listeler ama hiçbir şeyi kuyruğa eklemez. `queue` sayfalı bir görünüm gösterir; sayfa başına beş parça vardır ve her parça için seçenekler bir seçim menüsündedir. `nowplaying` şu an çalan parçayı, isteyeni ve sağlayıcısını gösterir.

`songremove <number>` bir girişi kaldırır, `movesong <from> <to>` sırasını değiştirir, `shuffle` geçerli parçadan sonraki her şeyi karıştırır, `clearqueue` kuyruğu boşaltır ve çalmayı durdurur. `seek mm:ss` mevcut parçada belirtilen konuma atlar. `volume 0..100` sesi ayarlar ve bunu sunucunun varsayılanı olarak kaydeder.

`loop <type>` tekrarı ayarlar: `none` (ayrıca `off`), `track` (ayrıca `song`) veya `queue` (ayrıca `all`). Tekrar kapalıyken kuyruk biterse, bot müzik kanalına bir kuyruk boş bildirimi gönderir.

### Geçme ve DJ rolü

`skip` geçerli parçayı, komutu çalıştıran kişi için hemen bitirir. `voteskip` oyları sayar: DJ rolüne ya da Yönetici iznine sahip bir üye hemen geçer; diğerleri bir oy ekler ve ses kanalındaki bot olmayan üyelerin yüzde 70'ine oy ulaştığında parça geçilir.

DJ rolünü `setdjrole @role` ile ya da kontrol panelindeki **DJ Rolü** seçiciyle ayarla. Rolü kaldırmak için `setdjrole` komutunu rolsüz çalıştır.

### Otomatik çalma

`autoplay <0..5>`, kuyruk bittiğinde Spotify önerilerini kullanarak o kadar ilgili parça ekler. 0 bunu kapatır. Bu özellik botun Spotify kimlik bilgileriyle yapılandırılmış olmasına bağlıdır; bunlar yoksa otomatik çalma hiçbir şey yapmaz.

## Çalma listeleri

`saveplaylist <name>`, geçerli kuyruğu sunucuya özel bir adla kaydeder ve yazar olarak seni ekler. `loadplaylist <name> [true]` çalma listesini kuyruğun sonuna ekler; `true` verirsen kuyruğun yerine geçer ve hiçbir şey çalmıyorsa çalmaya başlar. Parçalar yüklenirken YouTube'da yeniden çözümlenir; artık var olmayan girişler sessizce atlanır. `playlists` kayıtlı listeleri parça sayıları ve yazarlarıyla gösterir; `deleteplaylist <name>` birini siler.

## Ses filtreleri

Filtreler çalan oynatıcıya uygulanır ve bot bağlantıyı kestiğinde sıfırlanır.

| Komut | Etkisi |
| --- | --- |
| `bass <0..1>` | Düşük frekansları güçlendirir; 0 kapatır |
| `nightcore [on/off]` | Daha hızlı ve daha tiz |
| `vaporwave [on/off]` | Daha yavaş ve daha pes |
| `karaoke [on/off]` | Ortadaki vokalleri bastırır |
| `tremolo [on/off]` | Ses seviyesinde titreme |
| `vibrato [on/off]` | Perdede titreme |
| `eightd [on/off]` | Sesi dinleyicinin etrafında döndürür |
| `distortion [on/off]` | Bozulma |
| `stereowiden [on/off]` | Stereo görüntüyü genişletir |

`activefilters` açık olanları listeler, `resetfilters` hepsini temizler. Kontrol panelindeki **Şu an çalıyor** kartında bas güçlendirme, nightcore, vaporwave, karaoke, tremolo, vibrato, 8D döndürme ve bozulma için açma/kapatma düğmeleri bulunur.

## Müzik bağlantısı dönüştürme

Bu özelliğin açık olduğu kanallarda Apple Music, Spotify, YouTube Music, YouTube, Amazon Music, Deezer, Tidal, Pandora veya SoundCloud bağlantısı paylaşıldığında, botun parçanın başlığı, sanatçısı ve kapak görseli ile aynı parçanın diğer sağlayıcılardaki bağlantılarını içeren bir yanıt embed'i gönderilir. Bir kanalı `musiclinkchannel [#channel]` (Sunucuyu Yönet) ile aç veya kapat; `musiclinkchannels` ile listele. Kontrol panelinde bu, Müzik Ayarları sekmesindeki **Müzik Bağlantısı Dönüştürme** bölümüdür.

## Metinden konuşmaya

TTS, botun bulunduğu bir ses kanalında mesajları sesli okur. Yetkililer bunu ses kanalı bazında açar; o ses kanalındaki üyelerin mesajları, ses kanalının metin sohbetinde ya da bağlı bir metin kanalında yazılmışsa kuyruğa alınır ve okunur. Bir satır okunurken müzik yüzde 15'e iner ve sonra eski sesine döner. Kuyruk varsayılan olarak 10 mesaj tutar.

Üyeler kendi sesini `ttsvoice <name>` ile seçer ve `ttsvoices [search]` ile sesleri inceleyebilir. Yetkililer varsayılan bir ses, hız (kontrol panelinde 0,5 ile 3,0, komutla 0,5 ile 2,0 arası), ses seviyesi, gerekli bir rol, kendi biçimleriyle katılma ve ayrılma duyuruları ayarlayabilir ve belirli kullanıcıları engelleyebilir. Kontrol panelindeki **TTS Ayarları** sekmesinde aynı ayarlar bulunur; bunlar **Genel TTS Ayarları**, **TTS Davranışı**, **Ses Kanalı TTS** ve **Engellenen TTS Kullanıcıları** bölümlerine ayrılmıştır.

## Last.fm

Üyeler bir Last.fm hesabını kontrol panelindeki `/me` sayfasından bağlar (`lastfmlink` düğmeyi gönderir). Bağlandıktan sonra botun en az 30 saniye çaldığı parçalar hesaplarına scrobble edilir; `lastfmtoggle` bunu duraklatır, `lastfmstatus` durumu gösterir. Bağlı hesabı olan herkes `fm` ailesi komutlarını kullanabilir: son parçalar, dönemlere göre en çok dinlenen sanatçılar, albümler ve parçalar, sanatçı ve albüm bilgileri, sunucu genelindeki "kim biliyor" sıralamaları, taçlar, zevk karşılaştırması ve kolaj grafikleri.

## Ayarlar

Kontrol panelindeki sayfada iki sekme vardır: **Müzik Ayarları** ve **TTS Ayarları**. Müzik sekmesi, bot çalarken kuyruk uzunluğu, karıştırma ve temizleme düğmeleri, tekrar modu düğmeleri ve filtre anahtarlarıyla birlikte bir **Şu an çalıyor** kartı da gösterir.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Varsayılan Ses | 100 | Başlangıç sesi, 0 ile 100 arası; `volume` de burayı kaydeder |
| Müzik Kanalı | Tüm Kanallar | Şu an çalıyor ve kuyruk bildirimlerinin gönderildiği yer |
| DJ Rolü | DJ rolü yok | Anında geçen ve oylamayı atlayan rol |
| Tekrar Modu | Yok | Yok, Tek Parça veya Kuyruk |
| Otomatik Bağlantıyı Kes | Asla | Asla, Ses kanalı boşalınca, Kuyruk boşalınca veya Koşullardan biri |
| Benzerlerini Otomatik Çal | Devre dışı | Kuyruk boşalınca ilgili parçalar ekler; komut en fazla 5 adede izin verir |
| Oylamayla Geçmeyi Etkinleştir | kapalı | Oylamayla geçme eşiğini oynatıcının altbilgisinde gösterir |
| Oylamayla Geçme Eşiği | yüzde, 1 ile 100 arası | Gösterilen değer; `voteskip` komutunun kendisi her zaman yüzde 70 ister |
| Müzik bağlantısı kanalları | yok | Müzik bağlantılarının çapraz sağlayıcı embed'i alacağı kanallar |
| TTS Sesi | 100 | Okunan satırların yüksekliği |
| TTS Hızı | 1.0 | 0,5 ile 3,0 arası |
| Maks. Kuyruk Boyutu | 10 | Bekleyen TTS mesajları, 1 ile 50 arası |
| Varsayılan Ses | sağlayıcının varsayılanı | Bir üye kendi sesini seçmemişse kullanılan ses |
| Gerekli rol | Gerekli rol yok | Yalnızca bu role sahip üyeler TTS kullanabilir; yöneticiler her zaman kullanabilir |
| Yanıt Bağlamı | kapalı | Yanıtlardan önce "kullanıcıya yanıt veriyor" ifadesini okur |
| Ek Seslendirmesi | kapalı | Gönderilen resim, video ve dosyaları duyurur |
| Ardışık Gruplama | kapalı | Aynı üye arka arkaya mesaj gönderdiğinde adı atlar |
| Ses Kanalı TTS | yok | Ses kanalı başına: etkin mi, bağlı metin kanalı, katılma ve ayrılma duyuruları ile biçimleri |
| Engellenen TTS Kullanıcıları | yok | Mesajları asla okunmayan üyeler |

> [!NOTE]
> Kontrol panelinde ayarlanan tekrar modu bir sonraki oynatıcıdan itibaren geçerli olur. `loop` ise çalan oynatıcıyı hemen değiştirir.

## Kurulum adımları

1. Botun kullanmasını istediğin ses kanallarında Bağlan ve Konuşma izinlerinin olduğundan emin ol.
2. Kontrol panelinde **Müzik**'i aç. Şu an çalıyor embed'lerinin genel sohbete düşmemesi için bir **Müzik Kanalı** ayarla.
3. Parçaları serbestçe geçebilecek kişiler için bir **DJ Rolü** seç.
4. **Varsayılan Ses**'i 50 civarına ayarla; 100 çok yüksektir.
5. Bir ses kanalına katıl ve `play never gonna give you up` komutunu çalıştır, bir sonuç seç, ardından `queue` ve `nowplaying` komutlarını dene.
6. Parçaları kuyruğa ekleyerek ev çalma listeni oluştur ve `saveplaylist chill` komutunu çalıştır.
7. TTS istiyorsan **TTS Ayarları** sekmesine geç, **Ses Kanalı TTS** altına bir ses kanalı ekle ve üyelerin `ttsvoice` ile bir ses seçmesini sağla.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `join` | `j`, `mv` | Kimse | Ses kanalına katıl |
| `leave` | `disconnect`, `d` | Kimse | Ayrıl ve kuyruğu temizle |
| `play <link or search>` | `p`, `start` | Kimse | Kuyruğa ekle ve çal |
| `play <number>` | `p`, `start` | Kimse | Bir kuyruk sırasına atla |
| `search <query>` | `find` | Kimse | Çalmadan on sonuç listele |
| `pause` | | Kimse | Duraklat veya devam ettir |
| `nowplaying` | `np` | Kimse | Şu an çalan parçayı göster |
| `queue` | `q`, `yq`, `enqueue` | Kimse | Kuyruğu göster |
| `skip` | `next`, `n` | Kimse | Geçerli parçayı geç |
| `voteskip` | `vskip` | Kimse | Geçmek için oy ver; DJ rolüyle anında |
| `songremove <number>` | `trackremove`, `srm` | Kimse | Bir kuyruk girişini kaldır |
| `movesong <from> <to>` | `ms`, `move` | Kimse | Kuyruğun sırasını değiştir |
| `shuffle` | `playlistshuffle`, `sh`, `plsh` | Kimse | Sıradaki parçaları karıştır |
| `clearqueue` | `cq` | Kimse | Kuyruğu boşalt ve dur |
| `volume <0..100>` | `vol` | Kimse | Sesi ayarla ve kaydet |
| `seek <mm:ss>` | | Kimse | Geçerli parçada ilerle |
| `loop <none|track|queue>` | `queuerepeat`, `qrp`, `rpl` | Kimse | Tekrar modunu ayarla |
| `autoplay <0..5>` | `ap` | Kimse | Kuyruk boşalınca ilgili parçalar |
| `setdjrole [role]` | `djrole` | Sunucuyu Yönet | DJ rolünü ayarla veya kaldır |
| `setmusicchannel [#channel]` | `smch` | Kimse | Oynatıcı bildirimlerinin gideceği yer |
| `musicsettings` | `msettings` | Kimse | Otomatik çalma, ses, tekrar ve kanalı göster |
| `musiclinkchannel [#channel]` | | Sunucuyu Yönet | Bir kanalda bağlantı dönüştürmeyi aç veya kapat |
| `musiclinkchannels` | | Kimse | Bağlantı dönüştürme kanallarını listele |
| `saveplaylist <name>` | `saveplist` | Kimse | Kuyruğu kaydet |
| `loadplaylist <name> [clear]` | `loadplist` | Kimse | Çalma listesini yükle; kuyruğu değiştirmek için `true` |
| `playlists` | `playlistshow`, `plshow` | Kimse | Kayıtlı çalma listelerini listele |
| `deleteplaylist <name>` | `delplist` | Kimse | Bir çalma listesini sil |
| `bass [0..1]` | | Kimse | Bas güçlendirme |
| `nightcore [on/off]` | `nc` | Kimse | Nightcore filtresi |
| `vaporwave [on/off]` | `vw` | Kimse | Vaporwave filtresi |
| `karaoke [on/off]` | | Kimse | Karaoke filtresi |
| `tremolo [on/off]` | | Kimse | Tremolo filtresi |
| `vibrato [on/off]` | | Kimse | Vibrato filtresi |
| `eightd [on/off]` | `8d` | Kimse | 8D döndürme filtresi |
| `distortion [on/off]` | | Kimse | Bozulma filtresi |
| `stereowiden [on/off]` | `swiden` | Kimse | Stereo genişletme |
| `resetfilters` | `resetfx` | Kimse | Tüm filtreleri temizle |
| `activefilters` | `activefx` | Kimse | Açık filtreleri listele |
| `lastfmlink` | `lflink` | Kimse | Last.fm bağlantı düğmesini al |
| `lastfmunlink` | `lfunlink` | Kimse | Last.fm bağlantını kaldır |
| `lastfmtoggle` | `lftoggle` | Kimse | Scrobble'ı duraklat veya devam ettir |
| `lastfmstatus` | `lfstatus` | Kimse | Last.fm bağlantı durumunu göster |
| `fm [user]` | | Kimse | Şu an çalan veya son scrobble |
| `fmrecent [user]` | `fmr` | Kimse | Son scrobble'lar |
| `fmtopartists [period] [user]` | `fmta` | Kimse | En çok dinlenen sanatçılar |
| `fmtopalbums [period] [user]` | `fmtal` | Kimse | En çok dinlenen albümler |
| `fmtoptracks [period] [user]` | `fmtt` | Kimse | En çok dinlenen parçalar |
| `fmartist [artist]` | `fma` | Kimse | Sanatçı bilgisi ve senin dinlemelerin |
| `fmalbum [query]` | `fmal` | Kimse | Albüm bilgisi |
| `fmwhoknows [artist]` | `whoknows`, `wk` | Kimse | Bir sanatçı için sunucu sıralaması |
| `fmwhoknowsalbum <query>` | `whoknowsalbum`, `wka` | Kimse | Bir albüm için sunucu sıralaması |
| `fmwhoknowstrack <query>` | `whoknowstrack`, `wkt` | Kimse | Bir parça için sunucu sıralaması |
| `fmcrowns [artist]` | `crowns` | Kimse | Sanatçı tacları |
| `fmtaste <user>` | `taste` | Kimse | Birisiyle zevk karşılaştır |
| `fmchart [size] [period] [user]` | `chart` | Kimse | Albüm kapağı kolajı |
| `ttsenable` | `tts`, `ttson` | Sunucuyu Yönet | Ses kanalında TTS'yi etkinleştir |
| `ttsremove` | `ttsoff` | Sunucuyu Yönet | Ses kanalında TTS'yi kapat |
| `ttslink [#channel]` | `ttschannel` | Sunucuyu Yönet | Bir metin kanalını ses kanalına bağla |
| `ttsannounce` | `ttsjoinleave` | Sunucuyu Yönet | Katılma ve ayrılma duyurularını aç veya kapat |
| `ttsjoinformat [text]` | `ttsjoin` | Sunucuyu Yönet | Katılma duyurusu metni |
| `ttsleaveformat [text]` | `ttsleave` | Sunucuyu Yönet | Ayrılma duyurusu metni |
| `ttsvolume <0..100>` | `ttsvol` | Sunucuyu Yönet | TTS yüksekliği |
| `ttsspeed <0.5..2>` | | Sunucuyu Yönet | TTS hızı |
| `ttsdefaultvoice [voice]` | `ttsdefvoice` | Sunucuyu Yönet | Sunucunun varsayılan sesi |
| `ttsvoice [voice]` | | Kimse | Kendi sesin |
| `ttsvoices [search]` | `ttsvoicelist`, `ttsvoicesearch` | Kimse | Sesleri incele |
| `ttsblock <user>` | `ttsban` | Sunucuyu Yönet | Bir üyenin TTS engelini aç veya kapat |
| `ttsblocklist` | `ttsbanlist`, `ttsblocked` | Sunucuyu Yönet | Engellenen üyeleri listele |
| `ttsrole [role]` | | Sunucuyu Yönet | TTS için bir rol iste |
| `ttsreplycontext` | `ttsreply` | Sunucuyu Yönet | Yanıt bağlamını aç veya kapat |
| `ttsattachmentnarration` | `ttsattach` | Sunucuyu Yönet | Ek seslendirmesini aç veya kapat |
| `ttsconsecutivegrouping` | `ttsgroup` | Sunucuyu Yönet | Ardışık mesajlarda adı atlamayı aç veya kapat |
| `ttsmaxqueue <1..50>` | `ttsqueue` | Sunucuyu Yönet | Bekleyen TTS mesajı sınırı |
| `ttssettings` | `ttsinfo` | Sunucuyu Yönet | TTS ayarlarını göster |

## İpuçları ve dikkat edilecekler

- Botun ses kanalında Bağlan ve Konuşma, bildirimler için müzik kanalında da Mesaj Gönder iznine ihtiyacı var.
- Çoğu komut önce bir ses kanalında olup olmadığını kontrol eder; ayrıca botun bulunduğu kanal olmalıdır.
- `volume` ile ayarlanan ses sunucunun varsayılanı olarak kaydedilir; gece geç saatte yazdığın 10, ertesi günün başlangıç sesi olur.
- Spotify çalma listeleri parça parça YouTube araması üzerinden çevrilir; uzun listeler biraz sürer ve birkaç eşleşme yanlış olabilir.
- Kayıtlı çalma listeleri parçaların kendisini değil bağlantılarını saklar. Bir video YouTube'dan kaldırılırsa, liste yüklenirken o giriş atlanır.
- Oylamayla geçme yalnızca ses kanalındaki insanları sayar. Tek kişilik bir kanalda kendi oyun yeterlidir.
- Metin kanalından izleyen biri TTS'yi tetikleyemez; TTS yalnızca ses kanalındaki üyelerin mesajlarını okur.

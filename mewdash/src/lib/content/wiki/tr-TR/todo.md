---
title: Yapılacaklar Listeleri
slug: todo
summary: Discord içindeki ortak ve kişisel görev listeleri; öncelikler, son tarihler, etiketler, arama ve kişi başına izinlerle.
icon: fa-check
category: Community
dashboard: /dashboard/todo
module: Todo
tags: [todo, tasks, task list, checklist, project, due date, priority, tags, permissions, yapılacaklar, görevler, görev listesi, kontrol listesi, proje, son tarih, öncelik, etiketler, izinler]
related: [administration, tickets]
---

## Ne işe yarar

Yapılacaklar Listeleri, sunucunda botun içinde yaşayan görev listeleri oluşturur. Bir üye liste oluşturur, listeye öğe ekler, öğeleri tamamlandı olarak işaretler ve aynı listeyi görüntüleyebilmeleri ya da üzerinde çalışabilmeleri için başkalarına erişim verebilir. Yönetici olan yetkililer (Sunucuyu Yönet izni) tüm üyelerin görebildiği sunucu geneli listeler oluşturabilir.

Her öğenin bir başlığı, isteğe bağlı bir açıklaması, 1 ile 4 arasında bir önceliği, isteğe bağlı etiketleri, isteğe bağlı bir son tarihi ve isteğe bağlı bir hatırlatma zamanı vardır. Öğeler bir konum tutar, böylece sırasını değiştirebilirsin; tamamlanan öğelere kimin ve ne zaman tamamladığı işlenir.

İki tür liste vardır. Kişisel bir liste tek bir üyeye aittir ve sahibi erişim vermedikçe başkaları tarafından görünmez. Sunucu listesi sunucuya aittir; varsayılan olarak herkese açıktır ve herkes görüntüleyebilir, ancak öğe ekleyebilmek ve değiştirebilmek için açıkça izin verilmiş kişiler gerekir.

Listeler Discord'da embed olarak, kontrol panelinde ise kart olarak görünür. Kontrol paneli ayrıca açık olan liste için ilerlemeyi, süresi geçmiş öğe sayısını ve tamamlanma oranını gösterir.

## Neden kullanmalısın

- Bir moderasyon ekibi bayatlayan bir sabitlenmiş mesaj yerine bekleyen görevleri tek bir sunucu listesinde takip eder.
- Etkinlik düzenleyenler ortak bir kontrol listesi paylaşır ve işler bitikçe maddeleri işaretler.
- Üyeler sunucuda takip edecekleri şeylerin özel bir listesini tutar.
- Bir proje kanalında "kritik" öğelerin "düşük" olanlardan ayrılması için etiket ve öncelik gerekir.

## Listeler ve izinler

Her listenin bir sahibi vardır; listeyi oluşturan kişidir. Sahip o listede her şeyi yapabilir. Diğer kişiler izinleri olarak `todogrant` ile kişi bazında erişim alır.

| İzin | Ne izin verir |
| --- | --- |
| `view` | Listeyi ve öğelerini görmek |
| `add` | Yeni öğe eklemek |
| `edit` | Başkalarının öğelerini düzenlemek, etiketlemek, sıralamak ve tarihlerini ayarlamak |
| `complete` | Başkalarının öğelerini tamamlamak |
| `delete` | Başkalarının öğelerini silmek |
| `manage` | Liste ayarlarını değiştirmek, listeyi silmek, erişim vermek ve geri almak |
| `all` | Yukarıdaki her izin |

Birden fazla izni virgülle ayrılmış bir metin olarak ver; örneğin `todogrant 12 @user view,add,complete`. Yeniden vermek, o kullanıcının önceki izinlerinin yerini alır. `todorevoke` hepsini kaldırır.

Hangi izne sahip olursan ol iki kural geçerlidir: bir öğeyi oluşturan kişi kendi öğesini her zaman düzenleyebilir, tamamlayabilir ve silebilir; liste sahibi her zaman her şeyi yapabilir.

Bir listeyi kimin görebileceği:

| Liste türü | Herkese açık | Kim görüntüleyebilir |
| --- | --- | --- |
| Kişisel | herhangi biri | Sahip, ayrıca `view` izni verilen herkes |
| Sunucu | evet (varsayılan) | Sunucudaki herkes |
| Sunucu | hayır | Sahip, ayrıca `view` izni verilen herkes |

`todotoggleprivacy` bir listeyi herkese açık ile özel arasında değiştirir. Bunu yalnızca sahip ya da `manage` izni olan biri yapabilir.

## Öğeler

| Alan | Varsayılan | Notlar |
| --- | --- | --- |
| Başlık | zorunlu | Listede kalın yazılır |
| Açıklama | yok | Başlığın altında italik gösterilir |
| Öncelik | komutlarda 1 (Düşük), kontrol panelinde Orta | 1 Düşük, 2 Orta, 3 Yüksek, 4 Kritik. 1 ile 4 dışındaki değerler bu aralığa sınırlanır |
| Son tarih | yok | Başlığın yanında göreli bir Discord zaman damgası olarak gösterilir |
| Hatırlatma zamanı | yok | Öğede saklanır ve `todosetreminder` ile ayarlanır |
| Etiketler | yok | Büyük-küçük harf duyarsızdır; var olan bir etiketi eklemek bir işlem yapmaz |
| Konum | listenin sonu | `todoreorder` ile değiştir |

`todoshow`, bekleyen öğeleri önce konuma, sonra önceliğe, sonra oluşturulma zamanına göre sıralar. İkinci argüman olarak `true` verirsen, tamamlanma zamanlarıyla birlikte en fazla beş tamamlanmış öğe de gösterilir. `todosetdue` ve `todosetreminder` için tarihler gevşek biçimde çözümlenir; bu yüzden `2026-10-01 18:00` ve `October 1 2026` ikisi de çalışır.

`todosearch`, sorguyu bekleyen öğelerin başlıklarında, açıklamalarında ve etiketlerinde arar ve en fazla on sonuç gösterir. `todofilter` bir listeyi tek bir etikete (`todofilter 12 tag bug`) ya da öncelik düzeyine (`todofilter 12 priority 4`) göre daraltır.

Her listenin bir hex rengi olabilir; `todosetcolor 12 #ff8800` ile ayarlanır ve embed kenarlığında kullanılır. Varsayılan `#7289da` değeridir.

## Ayarlar

Sunucu genelinde ayar yoktur. Her şey liste ya da öğe bazındadır.

Yapılacaklar Listeleri sayfasının tek bir görünümü vardır. Sol tarafta görebildiğin her liste yer alır; bunların yanında **Yapılacaklar listelerinde ara** kutusu, **Tamamlanan öğeleri göster** anahtarı ve **Sırala** seçeneği (Öncelik, Son Tarih, Oluşturulma, Başlık) ile yön seçici bulunur. Bir liste seçildiğinde öğeleri, **Öğe ekle** ve **Listeyi sil** düğmeleri, **Öncelik** ve **Son tarih** içeren bir öğe düzenleyicisi ve her liste için bir **Yetkileri yönet** düğmesi görünür.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Liste adı ve açıklaması | zorunlu, yok | **Liste Oluştur** düğmesiyle liste oluştururken ayarlanır |
| Öncelik (öğe) | Orta | Öğenin önceliği; renkli bir çip olarak gösterilir |
| Son tarih (öğe) | yok | Süresi geçmiş sayacında kullanılan son tarih |
| Tamamlanan öğeleri göster | kapalı | Biten öğelerin liste görünümünde görünüp görünmeyeceği |

> [!NOTE]
> Kontrol panelinden oluşturulan listeler her zaman sunucu listesidir. Kişisel liste oluşturmak için Discord içinde `todocreatelist` komutunu kullan.

## Kurulum adımları

1. Kontrol panelinde **Yapılacaklar Listeleri**'ni aç ve **Liste Oluştur**'a tıkla.
2. Bir ad ve isteğe bağlı açıklama gir. Liste herkese açık bir sunucu listesi olarak oluşturulur.
3. Listeye tıkla, ardından **Öğe ekle**'ye bas. **Ne yapılması gerekiyor?** alanını, isteğe bağlı açıklamayı ve bir önceliği doldur.
4. Listenin kartındaki **Yetkileri yönet** ile kimin erişimi olduğunu gör. Discord'dan `todogrant <listId> @user add,complete` komutuyla erişim ver ki bu kişiler üzerinde çalışabilsin.
5. Discord'da liste kimliğini almak için `todolists` komutunu çalıştır, sonra görüntülendiğini kontrol etmek için `todoshow <listId>` komutunu çalıştır.
6. Bir şeyi bitirdiğinde `todocomplete <itemId>` ile işaretle; öğe kimliği `todoshow` çıktısında kod biçiminde gösterilir.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Liste ve öğe kimlikleri `todolists` ve `todoshow` komutlarından alınır.

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `todocreatelist <name> [description]` | `tcl` | Kimse | Kişisel bir liste oluştur |
| `todocreateserverlist <name> [description]` | `tcsl` | Sunucuyu Yönet | Sunucu genelinde bir liste oluştur |
| `todolists [includeServer]` | | Kimse | Görebildiğin listeleri listele; yalnızca kişisel listeler için `false` ver |
| `tododeletelist <listId>` | `tdl` | Kimse | Bir listeyi ve tüm öğelerini sil (sahip ya da `manage`) |
| `todoshow <listId> [includeCompleted]` | `ts` | Kimse | Bir listenin öğelerini göster |
| `todoadd <listId> <title> [description]` | `ta` | Kimse | Düşük öncelikli bir öğe ekle |
| `todoaddpriority <listId> <priority> <title> [description]` | `tap` | Kimse | 1 ile 4 arasında öncelikli bir öğe ekle |
| `todoedit <itemId> <title> [description]` | `te` | Kimse | Bir öğenin başlığını ve açıklamasını değiştir |
| `todocomplete <itemId>` | `tc` | Kimse | Bir öğeyi tamamlandı olarak işaretle |
| `tododelete <itemId>` | `td` | Kimse | Bir öğeyi sil |
| `todoreorder <itemId> <position>` | `tr` | Kimse | Bir öğeyi 1'den başlayan bir konuma taşı |
| `todosetdue <itemId> <date>` | `tsd` | Kimse | Bir son tarih ayarla |
| `todocleardue <itemId>` | `tcd` | Kimse | Son tarihi kaldır |
| `todosetreminder <itemId> <date>` | `tsr` | Kimse | Bir hatırlatma zamanı ayarla |
| `todoclearreminder <itemId>` | `tcr` | Kimse | Hatırlatma zamanını kaldır |
| `todoaddtag <itemId> <tag>` | `tat` | Kimse | Bir etiket ekle |
| `todoremovetag <itemId> <tag>` | `trt` | Kimse | Bir etiketi kaldır |
| `todosearch <listId> <query>` | `tsearch` | Kimse | Bekleyen öğeleri başlık, açıklama ya da etikete göre ara |
| `todofilter <listId> <tag or priority> <value>` | `tf` | Kimse | Bekleyen öğeleri tek bir etikete ya da tek bir önceliğe göre filtrele |
| `todosetcolor <listId> <#hex>` | `tsc` | Kimse | Embed rengini ayarla |
| `todotoggleprivacy <listId>` | `ttp` | Kimse | Bir listeyi herkese açık ile özel arasında değiştir |
| `todogrant <listId> @user <perms>` | `tg` | Kimse | Virgülle ayrılmış izinleri ver |
| `todorevoke <listId> @user` | `trv` | Kimse | Bir kullanıcının tüm izinlerini kaldır |
| `todopermissions <listId>` | `tp` | Kimse | Kimin hangi izne sahip olduğunu göster |

"Kimse" demek, Discord izin kontrolü olmadığı anlamına gelir; komutun başarılı olup olmayacağına listenin kendi izinleri karar verir. Aynı komutlar `/todo` altında eğik çizgi komutu olarak da bulunur.

## İpuçları ve dikkat edilecekler

- Hatırlatma zamanları öğede saklanır, ancak bu zaman geldiğinde bot şu anda bir hatırlatma göndermez. Şimdilik bunu bir not olarak düşün.
- `todoshow`, sende `view` izni yoksa, ID doğru olsa bile listeyi bulunamadı olarak gösterir.
- Bir liste adı sahibi ve türü başına benzersiz olmalıdır; iki üye birer "Alışveriş" kişisel listesine sahip olabilir, ama bir üye iki tane sahip olamaz.
- `todoreorder` listedeki her öğeyi yeniden numaralandırır; böylece konumlar kesintisiz kalır.
- Herkese açık sunucu listeleri herkes tarafından okunabilir, ama sen `add` iznini verene kadar sahibi dışında kimse öğe ekleyemez.
- Tam izin seti için Discord'da `todogrant` kullan; kontrol panelindeki **Yetkileri yönet** görünümü kimin erişimi olduğunu kontrol etmek içindir.
- Bir listeyi silmek, izinlerini ve öğelerini tek seferde kaldırır ve geri alınamaz.

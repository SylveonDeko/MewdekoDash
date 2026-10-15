---
title: Anketler
slug: polls
summary: Bir kanalda düğme tabanlı anketler paylaş, kimin oy verebileceğini sınırla, önceden zamanla, şablonları yeniden kullan ve sonuçları incele.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/polls
module: Games
tags: [poll, vote, survey, question, yes no, multiple choice, anonymous, scheduled poll, poll template, anket, oylama, anket şablonu, zamanlanmış anket, anonim anket]
related: [votes, games]
---

## Ne işe yarar

Yetkililer iki ila yirmi beş seçenekli bir soru sorar. Bot her seçenek için bir düğme içeren bir embed gönderir; beşten fazla seçenek varsa bunun yerine bir seçim menüsü kullanılır ve üyeler tıklayarak oy verir. Embed her seçenek için canlı sayıyı ve yüzdeyi gösterir. Seçeneklerin altında üç yönetim düğmesi bulunur: **İstatistikler**, **Kapat** ve **Sil**.

Üyeler başka bir seçeneğe tıklayarak oylarını değiştirebilir ya da aynı seçeneğe tekrar tıklayarak oylarını geri alabilir; bu, o anket için oy değişikliği kapatılmadıysa geçerlidir. Bot'un bir tıklamaya verdiği her yanıt yalnızca oy veren kişiye özeldir, böylece kanal temiz kalır.

Anketler elle kapatılabilir, belirlenen bir süre sonunda kendiliğinden sona erebilir ya da ileri bir tarihte paylaşılacak şekilde zamanlanabilir. Şablonlar bir soruyu ve seçeneklerini kaydeder, böylece aynı anket tek bir komutla yeniden paylaşılabilir. Kontrol paneli analiz, CSV ve JSON dışa aktarma ile anketlerin yan yana karşılaştırmasını ekler.

## Neden kullanırsın

- Bir sonraki topluluk etkinliği için bir tarih ya da oyun seç.
- Bir kural değişikliğinden önce hızlı bir evet/hayır kontrolü yap.
- Kimsenin kimin neye oy verdiğini görmemesi için hassas bir soruyu anonim sor.
- Kendilerini ilgilendiren kararlarda yalnızca bir yetkili rolünün ya da booster rolünün oy vermesine izin ver.
- Her Pazartesi aynı haftalık anketi bir şablondan paylaş ya da önceden zamanla.

## Anket türleri

| Tür | Oylama şekli |
| --- | --- |
| Evet / Hayır | Sabit iki seçenek: Evet ve Hayır. `poll` ve `/poll yesno` ile oluşturulur. |
| Tek seçim | Üye başına bir seçenek. `pollc`, şablonlar ve kontrol paneli için varsayılan. |
| Çoklu seçim | Üyeler birden fazla seçenek seçebilir. Altı ya da daha fazla seçenekte seçim menüsü çoklu seçime izin verir. |
| Anonim | Oylar, istatistik ve dışa aktarmalarda oy verenin kimliği gösterilmeden saklanır. |
| Role özel | Yalnızca izin verilen rollerden birine sahip üyeler oy verebilir. Diğerleri özel bir "izin verilmiyor" yanıtı alır. Yalnızca kontrol paneli. |

Her anketin ayrıca anket başına şu ayarları vardır, hepsi varsayılan olarak açık: **Oyların değiştirilmesine izin ver**, **Canlı sonuçları göster** ve **İlerleme çubuklarını göster**.

## Oylama, kapatma ve süre sonu

- Kapalı ya da süresi dolmuş bir ankete verilen oy, özel bir mesajla reddedilir.
- Oy değişikliği kapalıysa ikinci tıklama "zaten oy verildi" olarak reddedilir.
- **Kapat** ve **Sil** düğmeleri anketi oluşturan kişi ve Mesajları Yönet yetkisi olan herkes için çalışır. Sil, bir onay formunda `DELETE` yazmanı ister, ardından anketi ve mesajını kaldırır.
- **İstatistikler** toplam oyu, benzersiz oy verenleri ve seçenek bazında dağılımı yalnızca tıklayan kişiye özel olarak gösterir.
- Süre sonu her beş dakikada bir kontrol edilir. Bir anket sona erdiğinde düğmeleri kaldırılır ve alt bilgi süresinin dolduğunu gösterecek şekilde değişir.
- Zamanlanmış anketler her dakika kontrol edilir. Zamanlanmış bir anketin gelecekte olması ve en fazla otuz gün sonra olması gerekir. Dakika cinsinden bir süre taşıyabilir; bu süre sonunda paylaşılan anket sona erer.

## Şablonlar

Bir şablon bir ad, bir soru ve seçenekleri saklar. `polltemplate <name>` bunu tek seçimli bir anket olarak paylaşır. Şablonlar `polltemplates` ile listelenir, `/poll create-template` ve `/poll delete-template` ile oluşturulup silinir ya da kontrol panelindeki **Şablonlar** sekmesinden yönetilir; bu sekme şablonları dosya olarak dışa ve içe aktarmayı da destekler. Bir şablon en fazla yirmi beş seçenek içerebilir.

## Ayarlar

Anketler sayfasında beş sekme vardır: **Anketler**, **Oluştur**, **Zamanlanmış**, **Şablonlar** ve **Analizler**.

| Ayar | Varsayılan | Ne kontrol eder |
| --- | --- | --- |
| Soru | yok | Anketin başlığı |
| Anket türü | Tek seçim | Yukarıdaki beş türden biri |
| Kanal | yok | Anketin paylaşılacağı yer |
| Seçenekler | iki boş | İki ila yirmi beş seçenek, her biri en fazla 100 karakter. Evet / Hayır için gizlenir |
| Oy verebilecek roller | yok | Role özel anketlerde gösterilir |
| Süre (dakika) | kapatılana kadar açık | 1 ile 20160 dakika. Anket zamanlandığında uygulanır |
| Daha sonrası için zamanla | yok | Bir tarih ve saat. Hemen paylaşmak için boş bırak |
| Oyların değiştirilmesine izin ver | açık | Bir üyenin oyunu değiştirip değiştiremeyeceği |
| Canlı sonuçları göster | açık | Anket çalışırken sayıların gösterilip gösterilmeyeceği |
| İlerleme çubuklarını göster | açık | Sayıların yanında çubuk çizilip çizilmeyeceği |
| Ayrıca şablon olarak kaydet | kapalı | **Şablon adı** altında soruyu ve seçenekleri kaydeder |

**Anketler** sekmesi, **Kapatılmış anketleri dahil et** onay kutusu ile anketleri listeler. Bir anketi genişletmek benzersiz oy verenleri, katılımı, en yoğun saati ve oluşturulma zamanını gösterir ve **Anketi kapat** seçeneğini sunar. **Zamanlanmış** sekmesinde bekleyen bir anketi **İptal et** ile iptal edebilirsin. **Analizler** bu ayın anketlerini, kullanılan oyları, anket başına ortalama oyu, en sevilen türü ve günlük anket grafiğini gösterir.

## Kurulum adımları

1. Kontrol panelinde **Anketler**'i aç ve **Oluştur** sekmesine geç.
2. **Soru**'yu yaz, bir **Anket türü** ve **Kanal** seç.
3. **Seçenekler**'i doldur. Fazlalıkları kaldırmak için kaldır düğmesini kullan; en az ikisi gerekir.
4. Role özel bir anket için **Oy verebilecek roller**'i seç.
5. İstersen **Ayrıca şablon olarak kaydet** seçeneğini işaretle ve bir ad ver.
6. Gönder düğmesine tıkla. Anket hemen paylaşılır ya da bir saat seçtiysen **Zamanlanmış** sekmesinde sıraya alınır.
7. Sonuçları **Anketler** sekmesinden takip et; bitince **Anketi kapat**'a tıkla.

> [!TIP]
> Hızlı bir kanal oylaması için kontrol paneline ihtiyacın yok. `poll Should we add a movie night?` komutu saniyeler içinde bir Evet / Hayır anketi paylaşır.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `poll <question>` | `ppoll` | Mesajları Yönet | Evet / Hayır anketi paylaş |
| `pollc <question;option1;option2;...>` | | Mesajları Yönet | İki ila yirmi beş seçenekli tek seçimli anket paylaş |
| `pollm <question;option1;option2;...>` | | Mesajları Yönet | Çoklu seçimli anket paylaş |
| `polla <question;option1;option2;...>` | | Mesajları Yönet | Anonim anket paylaş |
| `polltemplate <name>` | `ptemplate` | Mesajları Yönet | Kaydedilmiş bir şablondan anket paylaş |
| `polltemplates` | `ptemplates` | Hiç kimse | Sunucunun şablonlarını listele |

`/poll` altındaki eğik çizgi komutları `create` (anonim ve çoklu seçim seçenekleriyle en fazla on seçenek), `close`, `stats`, `list`, `create-template` ve `delete-template` ekler. `close`, `create-template` ve `delete-template` için Mesajları Yönet gerekir.

## İpuçları ve dikkat edilecekler

- Bot'un anket kanalında Mesaj Gönder ve Bağlantıları Göm yetkisine sahip olması gerekir. Metin komutları komut mesajını da siler; bunun için botun Mesajları Yönet yetkisi gerekir.
- Seçenekler noktalı virgüle göre ayrılır, bu yüzden bir seçenek noktalı virgül içeremez.
- Düğme etiketleri yalnızca seçenek metni on iki karakter veya daha kısaysa metni gösterir; daha uzun seçenekler yalnızca numaralarını gösterir, tam metin embed içindedir.
- Süre, zamanlayıcı tarafından uygulanır. Hemen paylaşılan bir anket, biri kapatana kadar açık kalır; otomatik süre sonu istiyorsan bir dakika sonrası için zamanla.
- Kapatılmış bir anket, **Kapatılmış anketleri dahil et** işaretliyken kontrol panelinden hâlâ görüntülenebilir ve dışa aktarılabilir; silinmiş bir anket ise tamamen gider.
- Role özel anketler oy anında rolleri kontrol eder; rolü kaybeden üyeler artık oy veremez, ama daha önceki oyları kalır.

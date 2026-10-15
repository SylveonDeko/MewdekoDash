---
title: Rol Menüleri
slug: role-menus
summary: Üyelerin kendi rollerini seçmek için kullandığı bir açılır liste veya düğme içeren bir mesaj gönderir.
icon: fa-list-ul
category: Actions
dashboard: /dashboard/role-menus
module: RoleMenus
tags: [role menus, self roles, dropdown, buttons, pronouns, colors, rol menüleri, kendi rollerini seç, açılır liste, düğmeler, zamirler, renkler]
related: [administration, embedbuilder, rolestates]
---

## Ne yapar

Rol menüsü, altında bir **açılır liste** veya bir sıra **düğme** bulunan, bir kanaldaki tek bir mesajdır. Menüdeki her seçenek bir rol verir. Üyeler bir seçeneği seçerek rolü alır, tekrar seçerek bırakır. Böylece bir sunucu, yetkililere sormadan insanların zamirlerini, renklerini, bildirimlerini veya bölgelerini seçmesine izin verebilir.

Her menünün bir adı vardır (yalnızca yetkililer görür ve varsayılan mesajın başlığı olur), bir kanalı, bir mesajı ve en fazla 25 seçeneği vardır. Bir seçeneğin bir rolü, menüde görünen adı, isteğe bağlı bir emojisi ve isteğe bağlı bir açıklaması vardır. Açıklamalar her açılır liste seçeneğinin altında ve varsayılan mesajda gösterilir. Düğmelerin de bir rengi vardır: mavi (blurple), gri, yeşil veya kırmızı.

Mesaj, embed oluşturucunun ürettiği her şey olabilir: düz metin, bir veya daha fazla embed ya da ikisi birden. Boş bırakırsan bot bunun yerine menünün adını ve her seçenek için bir satır içeren bir mesaj gönderir.

## Birden fazla seç veya tek seç

- **Birden fazla seç**, üyelerin her rolü açıp kapatmasına izin verir. Ne kadar tutabilecekleri iki sınırla kontrol edilir: **En az şu kadar tutmak zorunda** bir sayıya seçtikten sonra düşmelerini engeller, **En fazla şu kadar tutabilir** ise menüden sahip olabilecekleri sayıyı sınırlar (varsayılanı sınırsızdır).
- **Tek seç**, rolleri değiştirir: yeni bir seçenek seçildiğinde sahip oldukları rol kaldırılır. **Seçildikten sonra birini tut** açılırsa üyeler değiştirebilir ama seçimlerini temizleyemez.

## Sınırlar

| Sınır | Değer |
| --- | --- |
| Sunucu başına menü | 50 |
| Menü başına seçenek | 25 |
| Satır başına düğme | 5 |
| Menü adı | 100 karakter |
| Menüde görünen ad | 80 karakter |
| Açıklama | 100 karakter |
| Açılır liste ipucu metni | 150 karakter |
| Düz metin mesajı | 2000 karakter |

Her rol bir menüde yalnızca bir kez yer alabilir. Bot, entegrasyonların yönettiği roller dışında kendi en yüksek rolünün altındaki rolleri verebilir; yetkililer ise yalnızca kendi en yüksek rollerinin altındaki rolleri sunabilir.

## Gerekli rol

Bir menü bir rol gerektirebilir. Bu role sahip olmayan üyeler bunun gerektiğini belirten özel bir not alır ve hiçbir şey değişmez.

## Onay

**Üyelere neyin değiştiğini bildir** açıksa üyeler, yalnızca kendilerinin görebileceği özel bir not alır ve eklenen veya kaldırılan rolleri listelenir. Kapalıysa menü sessizce çalışır; ancak bir sorun olursa, örneğin bir sınıra ulaşmak veya botun veremeyeceği bir rol gibi durumlarda, yine de üyeler özel bir not alır.

## Düzenleme, duraklatma ve yeniden gönderme

Bir düzenlemeyi kaydetmek, aynı mesajı yerinde yeniden oluşturur. Yeni bir mesaj yalnızca kanal değiştiğinde veya eski mesaj artık yoksa gönderilir.

**Duraklat**, menü yeniden devam ettirilene kadar Discord'da açılır listeyi veya düğmeleri gri gösterir. **Yeniden gönder**, yeni bir kopya gönderir ve eski mesajı siler; menü gözden kaybolduğunda veya elle silindiğinde yardımcı olur. Bir menünün kanalı silinirse menüyü düzenle, yeni bir kanal seç ve yeniden göndermek için kaydet.

Bir menüyü silmek mesajını da siler. Üyeler zaten seçtikleri rolleri korur.

## Eski kurulumları taşıma

Eski emoji rol kurulumlarında üyeler, rol almak için bir mesajın altına emoji ekliyordu. **Eski kurulumları taşı** sekmesi bunları listeler. Birini taşımak, aynı roller ve emojilerle, açılır liste veya düğme olarak, aynı kanalda veya başka bir kanalda yeni bir rol menüsü oluşturur. Eski mesajın metnini ve embed'lerini kopyalayabilir ve eski kurulumu emojilerini temizleyip durdurarak emekli edebilir. Orijinal mesajı bot gönderdiyse emekli etmek onu siler. Üyelerin yalnızca bir rol tutabildiği bir kurulum, Tek seç menüsüne dönüşür.

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `rolemenus` | Her menüyü kanalı, türü, seçenek sayısı ve durumuyla listeler. |
| `rolemenuinfo 3` | Bir menü hakkında her şeyi gösterir. |
| `rolemenucreate #roles dropdown @Role @Role` | Her rol için bir seçenekli yeni bir menü gönderir. |
| `rolemenuadd 3 @Role [emoji] [name]` | Menüye bir rol ekler. |
| `rolemenuremove 3 @Role` | Menüden bir rolü kaldırır. |
| `rolemenuname 3 Pronouns` | Bir menünün adını değiştirir. |
| `rolemenumessage 3 [message\|clear]` | Bir menünün üstündeki mesajı gösterir, ayarlar veya temizler. |
| `rolemenustyle 3 dropdown\|buttons` | Açılır liste ile düğmeler arasında geçiş yapar. |
| `rolemenumode 3 multi\|exclusive` | Birden fazla seç ile tek seç arasında geçiş yapar. |
| `rolemenulimits 3 0 2` | Üyelerin kaç rol tutması gerektiğini ve kaç rol sahibi olabileceğini ayarlar. |
| `rolemenurequire 3 [@Role]` | Gerekli rolü ayarlar veya temizler. |
| `rolemenureply 3 private\|silent` | Özel notu açar veya kapatır. |
| `rolemenupause 3` | Bir menüyü duraklatır; duraklatılmışsa devam ettirir. |
| `rolemenurepost 3 [#channel]` | Yeni bir kopya gönderir ve eski mesajı siler. |
| `rolemenudelete 3` | Bir menüyü ve mesajını siler. |
| `rolemenuimport messageId [dropdown\|buttons]` | Eski bir emoji rol kurulumunu yeni bir menüye taşır. |

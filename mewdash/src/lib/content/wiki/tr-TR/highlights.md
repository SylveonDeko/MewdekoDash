---
title: Vurgulamalar
slug: highlights
summary: Üyeler izlemek istedikleri kelimeleri seçer ve sunucuda biri bunları söylediğinde bağlamıyla birlikte bir DM alır.
icon: fa-bolt
category: Community
dashboard: /dashboard/highlights
module: Highlights
tags: [highlights, keywords, watch words, notifications, mentions, dm alerts, ignore channel, ignore user, vurgulamalar, anahtar kelimeler, izleme kelimeleri, bildirimler, etiketlemeler, dm uyarıları, kanalı yoksay, kullanıcıyı yoksay]
related: [afk, utility]
---

## Ne yapar

Bir üye `highlight add` ile bir kelime ya da ifade ekler. O andan itibaren sunucuda bir mesaj o kelimeyi içerdiğinde bot o üyeye bir DM gönderir. DM, olayın hangi sunucu ve kanalda gerçekleştiğini söyler, eşleşen mesajın öncesindeki son beş mesajla birlikte eşleşen mesajı gösterir ve bir **Mesaja git** düğmesi içerir.

Vurgulamalar kişiseldir. Her üye kendi listesini yönetir, hangi kanalları ve kişileri yok sayacağını seçer ve vurgulamalarını silmeden kapatabilir. Yetkililer başkası adına vurgulama ekleyemez; ancak panel, neyin izlendiğini görmelerine ve girdileri kaldırmalarına izin verir.

Üyeler yalnızca gerçekten görebildikleri kanallar için DM alır. Sunucuda yazı yazan bir üyenin orada olduğu varsayılır; bu yüzden vurgulamalar onun için iki dakika duraklatılır.

## Neden kullanırsın

- Adın, takma adın veya projen @ etiketi olmadan bahsedildiğinde haberdar olmak istersin.
- Büyük bir sunucuda "giveaway" veya "patch notes" gibi bir konuyu takip edersin.
- Yetkililer her kanalı okumadan "help" veya "report" gibi kelimeleri izleyebilir.
- Moderatörler üyelerin neyi izlediğini denetleyebilir ve istismar edici ya da spam girdileri temizleyebilir.

## Eşleşme nasıl çalışır

Bot, sunucudaki her boş olmayan mesajı o sunucudaki her vurgulamaya karşı kontrol eder.

- Bir vurgulama tam kelime ya da ifade olarak eşleşir. `cat`, "category" ile eşleşmez; ama "the cat sat" ile eşleşir.
- Eşleşme büyük/küçük harfe duyarlıdır. Her ikisini de istiyorsan `Cat` ve `cat`'i ayrı ayrı ekle.
- Her üye, kaç kelime eşleşirse eşleşsin, bir sunucuda iki dakikada en fazla bir DM alır.
- Sunucunun herhangi bir yerinde yazmak, aynı iki dakikalık duraklatmayı başlatır; böylece zaten içinde olduğun bir sohbet için DM almazsın.
- Yok sayılan kullanıcıların ve yok sayılan kanallardaki mesajlar, o üye için atlanır.
- Üye kanalı göremiyorsa ya da DM'leri kapalıysa DM atlanır.
- Mesajlar, iki saniyede bir mesaj işleyen bir kuyruktan kontrol edilir. Çok yoğun bir shard'da bazı mesajlar bu kuyruktan düşebilir.

`highlight match some text`, kendi listeni bir örnek cümleye karşı kontrol eder ve hangi kelimelerinin eşleşeceğini söyler. Bu kontrol büyük/küçük harfi yok sayar; yani canlı kuralın birebir kopyası değil, kaba bir rehberdir.

## Üye başına ayarlar

Her üyenin, bir şeyi ilk kez değiştirdiği anda oluşturulan bir ayar satırı vardır.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Vurgulamalar açık | açık | `highlight toggle false`, bu sunucudaki tüm vurgulamalarını duraklatır |
| Yok sayılan kanallar | yok | Kelimelerinin asla DM tetiklemediği kanallar |
| Yok sayılan kullanıcılar | yok | Mesajları asla vurgulamaları tetiklemeyen kişiler |

## Ayarlar

Panelde Vurgulamalar sayfası yetkililer içindir. Vurgulama eklemez; yalnızca gösterir ve kaldırır.

| Sekme | Ne gösterir |
| --- | --- |
| Tüm Vurgulamalar | Sunucudaki her vurgulama üyeye göre gruplanmış; her kelime için bir silme düğmesi ve bir üyenin tüm kelimelerini kaldırma düğmesi |
| Ara | Tüm üyelerdeki belli bir kelimeyi içeren vurgulamaları bul; arama büyük/küçük harfi yok sayar |
| Devre Dışı Kullanıcılar | Vurgulamalarını kapatmış üyeler ve kaç kanalı ile kullanıcıyı yok saydıkları |
| İstatistikler | Toplam Vurgulama, Aktif Kullanıcılar, En Çok Kullanılan Kelime, En Aktif, ayrıca En Çok Vurgulanan Kelimeler ve Son Vurgulamalar |

## Kurulum adımları

Etkinleştirilecek bir şey yoktur. Bot sunucuya girer girmez vurgulamalar çalışır.

1. Bir üye olarak herhangi bir kanalda `highlight add yourname` çalıştır.
2. Kaydedildiğini doğrulamak için `highlight list` çalıştır.
3. Birinin başka bir kanalda adını yazmasını sağla. Birkaç saniye bekle ve DM'lerini kontrol et.
4. Fazla bildirim alıyorsan `highlight toggleignore #busy-channel` ya da `highlight toggleignore @user` çalıştır.
5. Yetkililer: **Vurgulamalar** panelini aç, **Tüm Vurgulamalar** sekmesini incele ve istenmeyen her şeyi kaldır.

## Komutlar

Bunları sunucunun önekiyle çalıştır (değiştirmediysen `.`). Aynı eylemler, tek bir eğik çizgi komutu olan `/highlights manage` altında da bulunur; bunun `action` seçeneği `Add`, `List`, `Delete`, `Match`, `ToggleUser`, `ToggleChannel` veya `ToggleGlobal` değerlerini alır ve ayrıca `words`, `user` ve `channel` seçenekleri vardır.

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `highlight add <word>` | `highlights`, `hl` | Hiç kimse | Bir kelime veya ifadeyi izle |
| `highlight list` | `highlights`, `hl` | Hiç kimse | Vurgulamalarını sayfa sayfa gez; sayfa başına on tane |
| `highlight delete <number or word>` | `highlights`, `hl` | Hiç kimse | Liste numarasına ya da tam kelimeye göre kaldır; `remove` de aynısını yapar |
| `highlight match <text>` | `highlights`, `hl` | Hiç kimse | Metinde hangi kelimelerinin geçtiğini göster |
| `highlight toggleignore <#channel or @user>` | `highlights`, `hl` | Hiç kimse | Yok sayma listene bir kanal ya da kişi ekle veya çıkar |
| `highlight toggle <true or false>` | `highlights`, `hl` | Hiç kimse | Bu sunucudaki tüm vurgulamalarını aç veya kapat |

## İpuçları ve tuzaklar

- Bot, eşleşme yapmak için kanalı okuyabilmelidir; ayrıca uyarı almak için sunucu üyelerinden DM'lerinin açık olması gerekir.
- Zaten sahip olduğun bir kelimeyi eklemek reddedilir. Tekrar kontrolü büyük/küçük harfi yok sayar, ancak canlı eşleşme yapmaz.
- Numarayla silme, `highlight list` içinde gösterilen konumu kullanır; bu konum her kaldırmadan sonra değişir.
- Vurgulama listesi ve ayarlar sunucu başına otuz dakika önbellekte tutulur. Komutlar ya da panel üzerinden tek tek kelime eklemek veya silmek önbelleği hemen günceller; ancak panelden bir üyenin tüm kelimelerini kaldırmak, DM'lerin durması için otuz dakikaya kadar sürebilir.
- Bot bir sunucudan ayrıldığında, vurgulamaları ve ayarları bot bir sonraki kez yeniden başlatıldığında temizlenir.

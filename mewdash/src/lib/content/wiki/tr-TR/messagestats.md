---
title: Mesaj İstatistikleri
slug: messagestats
summary: Her üyenin her kanalda kaç mesaj gönderdiğini say; sonra sıralama tablolarını, kullanıcı ve kanal dökümlerini ve en yoğun saat ile gün grafiklerini gör.
icon: fa-envelope
category: Analytics
dashboard: /dashboard/messagestats
module: Utility
tags: [message stats, message count, activity, leaderboard, top users, analytics, busiest hours, activity graph, mesaj istatistikleri, mesaj sayısı, etkinlik, sıralama tablosu, en aktif kullanıcılar, analitik, en yoğun saatler, etkinlik grafiği]
related: [xp, utility, statchannels]
---

## Ne yapar

Mesaj sayımı açıldığında, bot minimum uzunluğu karşılayan her insan mesajında her üye için kanal başına bir sayım kaydeder. Mesajın içeriği hakkında hiçbir şey saklanmaz; yalnızca kimin, nerede ve ne zaman yazdığı tutulur. Sayımlar, yoğun sunucuların botu yavaşlatmaması için toplu halde veritabanına yazılır.

Üyeler kendi toplamlarını `usermessages` ile görebilir, en çok kullanılan kanalı `channelmessages` ile görebilir ya da tüm sunucuyu `servermessages` ile kontrol edebilir. `topusers`, her üyenin tüm mesajlar içindeki payıyla birlikte ilk on kişilik bir sıralama tablosu yazdırır. `activitygraph`, haftanın en yoğun günlerini ya da günün en yoğun saatlerini gösteren bir çubuk grafik görseli oluşturur.

Kontrol paneli aynı sayıları grafiklerle gösterir ve yetkililerin sayımı açıp kapatmasına, sayıları sıfırlamasına ve verileri CSV ya da JSON olarak dışa aktarmasına izin verir.

## Neden kullanmalısın

- Ödüller, roller ya da moderatör alımı için en aktif üyelerini bul.
- Sunucuyu yeniden düzenlemeden önce hangi kanalların ölü, hangilerinin canlı olduğunu gör.
- Kendi saat diliminde en yoğun saatler grafiğini kullanarak etkinlik zamanlarını seç.
- Mesaj sayılarını mesaj kalitesiyle karşılaştırarak botları ve spam hesaplarını fark et.

## Neyin sayıldığı

| Kural | Davranış |
| --- | --- |
| Sayım etkin | `togglemsgcount` ya da kontrol panelindeki anahtar açılana kadar hiçbir şey kaydedilmez |
| Botlar | Asla sayılmaz |
| DM'ler | Asla sayılmaz; yalnızca sunucu kanalları |
| Minimum uzunluk | **minimum mesaj uzunluğu** karakterinden kısa mesajlar atlanır; varsayılan 0'dır, yani her şey sayılır |
| Zaman damgaları | Mesaj zamanları saat ve gün grafiklerini beslemek için 90 gün tutulur; toplamlar süresiz tutulur |

Minimum uzunluk 4098'e kadar değer kabul eder. Sayı vermeden `minmsglength` çalıştırmak mevcut değeri gösterir.

## Etkinlik grafikleri

`activitygraph days`, haftanın yedi gününün tümü için veri ister ve son dört haftaya bakar. `activitygraph hours`, son yedi gün içinde 24 saatin tamamı için veri ister. Saatlik grafik için bot önce bir saat dilimi seçmeni ister; yaygın saat dilimlerinden bir liste sunar, herhangi bir IANA saat dilimi adını kabul eder ve yanıt vermezsen iptal eder. Grafik bir PNG olarak paylaşılır.

## Ayarlar

Mesaj İstatistikleri sayfasında iki üst düzey sekme vardır: **İstatistikler** ve **Yönetim**. İstatistikler; **Genel Bakış**, **En Aktif Kullanıcılar** ve **En Aktif Kanallar** sekmelerini içerir. Yönetim; **Ayarlar** ve **Veriyi Dışa Aktar** sekmelerini içerir.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Mesaj Saymayı Etkinleştir | Kapalı | Yeni mesajların kaydedilip kaydedilmeyeceği |
| Minimum Mesaj Uzunluğu | 0 | 0 ile 4098 arasında kaydırıcı; sayılacak en kısa mesaj |
| Mesaj Sayılarını Sıfırla | | **Tüm Sunucu Sayılarını Sıfırla**, onaydan sonra sunucu için saklanan her sayımı siler |
| Dışa aktarma biçimi | CSV | Yüklenen istatistiklerin CSV ya da JSON indirmesi |
| Kullanıcı istatistiklerini dahil et | Açık | Dışa aktarmaya en aktif kullanıcı satırlarını ekler |
| Kanal istatistiklerini dahil et | Açık | Dışa aktarmaya en aktif kanal satırlarını ekler |
| Saatlik dökümü dahil et | Kapalı | Dışa aktarmaya en yoğun saat ve en yoğun gün satırlarını ekler |

**Genel Bakış** sekmesinde **Günlük Mesajlar**, **Toplam Mesaj**, **Son Güncelleme** ve **Durum** kutuları, en az aktif kullanıcı ve kanal, bir **24 Saatlik Etkinlik** grafiği ve bir **Haftalık Eğilim** grafiği görünür. **En Aktif Kullanıcılar** sekmesi **En Çok Mesaj Gönderenler**'i, **En Aktif Kanallar** sekmesi ise **En Aktif Kanallar**'ı listeler.

> [!NOTE]
> Dışa aktarma, sayfada zaten yüklü olan istatistiklerden tarayıcında oluşturulur. Girdiğin başlangıç ve bitiş tarihleri dosya başlığına yazılır ama satırları filtrelemez.

## Kurulum adımları

1. Kontrol panelinde **Mesaj İstatistikleri**'ni aç, **Yönetim** ve ardından **Ayarlar**'a git.
2. **Mesaj Saymayı Etkinleştir**'i aç.
3. İstersen **Minimum Mesaj Uzunluğu**'nu 5 yap ya da Discord'da `minmsglength 5` çalıştır; böylece tek karakterlik yanıtlar yok sayılır.
4. Sunucunun bir gün sohbet etmesine izin ver, sonra ilk sayıları görmek için **İstatistikler**'e bak.
5. Bir hafta sonra `activitygraph hours` çalıştır ve sunucunun en yoğun olduğu zamanı görmek için saat dilimini seç.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `usermessages [@user]` | `usermsg`, `umsg` | Yetki gerekmez | Sen ya da başka bir üye için toplam, en aktif ve en az aktif kanal |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Yetki gerekmez | Bir kanaldaki toplam, en aktif ve en az aktif üye |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg` | Yetki gerekmez | En aktif ve en az aktif üye ile kanalın yer aldığı sunucu toplamı |
| `topusers` | `topu` | Yetki gerekmez | Mesaj sayısına göre ilk on üye, yüzdelerle |
| `activitygraph [days or hours]` | `actgraph` | Yetki gerekmez | En yoğun günler ya da saatler için çubuk grafik; varsayılan gün |
| `minmsglength [number]` | `mmlength`, `minmlength` | Sunucuyu Yönet | Bir mesajın sayılması için minimum uzunluğu göster ya da ayarla |
| `togglemsgcount` | `togglemessagecount` | Yönetici | Sayımı aç ya da kapat |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Mesajları Yönet | Onaydan sonra sunucunun tamamı, bir üye, bir kanal ya da bir kanaldaki bir üye için sayıları sıfırla |

## İpuçları ve tuzaklar

- Sayım yalnızca etkinleştirildiği andan itibaren başlar. Önceki mesajlar geriye dönük olarak eklenmez.
- Her istatistik komutu ve kontrol paneli, eski veri olsa bile sayım açılana kadar "devre dışı" bildirir.
- Sayımlar en fazla 100 olaylık gruplar halinde yazılır; bu yüzden toplamlar canlı sohbetin birkaç saniye gerisinde kalabilir.
- Bir kanalı silmek sayımlarını silmez. İstersen kanal kaldırılmadan önce `resetmessagecounts #channel` çalıştır.
- Saatlik grafik, seçtiğin saat dilimi kadar doğrudur. Tutarlılık için sunucunun saat dilimini Yönetim modülündeki saat dilimi komutuyla kaydet.
- XP sisteminin kendi etkinlik takibi vardır ve bu sayımları kullanmaz.

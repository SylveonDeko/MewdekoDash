---
title: Sohbet Kaydedici
slug: chatsaver
summary: Bir kanalın son geçmişini kontrol paneline çek, orada oku ve daha sonra için adlandırılmış anlık kayıtlar tut; ya da bir komutla Discord'dan bir HTML dökümü dışa aktar.
icon: fa-folder
category: Security
dashboard: /dashboard/chatsaver
module: Utility
tags: [chat saver, chat log, save chat, transcript, export, archive, history, evidence, ticket transcript, sohbet kaydedici, sohbet günlüğü, sohbeti kaydet, döküm, dışa aktarma, arşiv, geçmiş, kanıt, bilet dökümü]
related: [tickets, logging, auditlog]
---

## Ne işe yarar

Sohbet Kaydedici iki parçadan oluşur. Kontrol panelinde yetkililer bir kanal ve bir zaman aralığı seçer; bot o dönemdeki her mesajı çeker: metin, yazar, ekler ve embed'ler. Sayfada okuyabilir ve saklamaya değerse adlandırılmış bir kayıt olarak kaydedebilirler. Kaydedilen kayıtlar botun veritabanında durur; bu yüzden orijinal mesajlar silinse bile kalırlar.

Discord'da `savechat` komutu bir kanalın son birkaç dakikasını, saatini ya da gününü tam olarak dökümler ve Discord'a benzeyen, medya dahil bir HTML dosyasına bağlantı verir.

Bilet dökümleri de buraya düşer. Bilet sistemine bir döküm kanalı ayarlanmış bir sunucuda bir bilet kapandığında, bilet sistemi konuşmayı `Ticket #<id> - <channel>` adıyla kaydedilmiş bir kayıt olarak saklar; böylece **Kaydedilmiş Kayıtlar** altında diğerleriyle birlikte görünür.

## Neden kullanmalısın

- Mesajlar silinmeden önce bir tartışmanın ya da kural ihlalinin kanıtını tutmak.
- Bir etkinlik kanalını ya da duyuru başlığını kaldırılmadan önce arşivlemek.
- Discord'da geriye kaydırmadan, bir kanalda gece boyunca neler olduğunu gözden geçirmek.
- Eski bilet dökümlerini tek bir yerde okumak.

## Mesajları getirme

**Mesajları Getir** sekmesinde bir **Kanal** seç, bir **Zaman Miktarı** ve bir **Zaman Birimi** belirle, sonra **Mesajları Yükle** düğmesine tıkla. Bot kanalı en yeniden en eskiye doğru okur; penceren dışındaki mesajlara ulaştığında ya da 5000 mesaj topladığında durur, hangisi önce gelirse. Mesajlar **Mesajları Görüntüle** sekmesinde en eskiden en yeniye doğru gösterilir.

| Zaman birimi | En fazla |
| --- | --- |
| Dakika | 4320 |
| Saat | 72 |
| Gün | 3 |

Üç sınırın hepsi aynı üç günlük pencereye karşılık gelir. Getirme hiçbir şeyi saklamaz; sayfayı kapatırsan veriler gider.

## Kayıt kaydetme

Mesajlar yüklendikten sonra **Mesajları Görüntüle** sekmesinde **Kaydı Kaydet** düğmesine tıkla. Kayıt `<channel> - <today's date>` adını alır ve kanalla, kaydeden kişiyle ve mesaj sayısıyla birlikte saklanır. Her kayıt mesaj metnini, yazar adını ve avatarını, zaman damgasını, ek bağlantılarını ve embed başlıklarını, açıklamalarını ve küçük resimlerini kaydeder.

Ek ve avatar bağlantıları Discord'un CDN'ine işaret eder. Discord dosyayı kaldırırsa kayıttaki bağlantı çalışmaz, ama metin kalır.

**HTML Dışa Aktar**, **Kaydı Kaydet** düğmesinin yanında yer alır; yüklenen mesajları tarayıcında oluşturulan bağımsız bir HTML dökümü olarak indirir. Botta hiçbir şey saklanmaz.

## Kaydedilmiş kayıtlar

**Kaydedilmiş Kayıtlar** sekmesi sunucunun her kaydını en yeniden eskiye doğru listeler; kanalını ve mesaj sayısını da gösterir. Her girişte **Kaydı görüntüle**, **Kaydı yeniden adlandır** ve **Kaydı sil** seçenekleri vardır. Yeniden adlandırma yalnızca etiketi değiştirir. Silme kalıcıdır ve düğmeye tıkladığın anda gerçekleşir; onay penceresi yoktur.

Yeniden adlandırmalar ve silmeler kontrol panelindeki denetim günlüğüne kaydedilir.

## savechat komutu

`savechat` komutu kontrol panelinden farklı çalışır. Botun çalıştığı makinede DiscordChatExporter'ı çalıştırır, medya dahil bir HTML dosyası yazar ve bir bağlantı ile yanıt verir. Herkese açık Mewdeko'da sana bir `cdn.mewdeko.tech` bağlantısını DM ile gönderir; kendi sunucunda çalışan bir bot ise yerel yolu kanala yazar.

Pencere üç günle sınırlıdır. Daha büyük değerler reddedilir. Dışa aktarma, botun yapılandırılmış sohbet kayıt dizininin var olmasını gerektirir; yoksa komut hata verir.

> [!NOTE]
> `savechat` dışa aktarmaları **Kaydedilmiş Kayıtlar** altında görünmez. Bunlar veritabanı girişleri değil, makinedeki dosyalardır.

## Ayarlar

Sohbet Kaydedici'nin bir yapılandırması yoktur. Kontrol paneli sayfasında üç sekme vardır: **Mesajları Getir**, **Kaydedilmiş Kayıtlar** ve **Mesajları Görüntüle**.

| Kontrol | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Kanal | yok | Okunacak metin kanalı |
| Zaman Miktarı | 1 | Ne kadar geriye gidileceği |
| Zaman Birimi | Saat | Dakika, Saat ya da Gün |

## Kurulum adımları

1. Kontrol panelinde **Sohbet Kaydedici**'yi aç.
2. **Mesajları Getir** sekmesinde **Kanal**'ı seç ve **Zaman Miktarı** ile **Zaman Birimi**'ni ayarla; örneğin 6 saat.
3. **Mesajları Yükle** düğmesine tıkla ve mesaj sayısının görünmesini bekle.
4. Neler geldiğini okumak için **Mesajları Görüntüle** sekmesine geç.
5. Saklamak için **Kaydı Kaydet** düğmesine tıkla. Kayıt **Kaydedilmiş Kayıtlar** sekmesinde görünür.
6. Olay ya da tarih gibi anlamlı bir ad vermek için **Kaydı yeniden adlandır** seçeneğini kullan.

## Komutlar

Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Diğer adlar | Gereken yetki | Amaç |
| --- | --- | --- | --- |
| `savechat <time> [#channel]` | | Mesajları Yönet | Bir kanalın son `<time>` süresini HTML'e aktarır; örneğin `savechat 2h #general` |

## İpuçları ve dikkat edilecekler

- Botun kanalı ve mesaj geçmişini okuyabilmesi gerekir. Göremediği kanallar "Channel not found" yanıtı verir.
- Getirme 5000 mesajda durur. Çok yoğun bir kanal için daha kısa bir pencere kullan.
- Getirmeden önce yapılmış mesaj düzenlemeleri ve silmeleri görünmez; bot o anda kanalda ne varsa onu okur. Canlı bir kayıt için günlük özelliğini kullan.
- Kaydedilmiş kayıtlar, kayıt anındaki yazar adlarını saklar; sonradan yapılan bir kullanıcı adı değişikliği yansımaz.
- Kontrol paneline erişimi olan herkes kaydedilmiş kayıtları okuyabilir; bilet dökümleri dahil. Kontrol paneli erişimini buna göre kısıtla.
- `savechat` herkese açık botun CDN'i için tasarlanmıştır. Kendi botunu barındıranların kimlik bilgilerinde bir sohbet kayıt yolu ayarlaması ve DiscordChatExporter dosyalarını botun yanına kopyalaması gerekir.

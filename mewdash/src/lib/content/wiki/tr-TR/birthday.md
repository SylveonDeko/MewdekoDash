---
title: Doğum Günleri
slug: birthday
summary: Üyeler profillerinde bir doğum günü ayarlar ve katılmayı seçer; bot bunu bir kanalda duyurur, isteğe bağlı olarak geçici bir doğum günü rolü ve bir rol etiketi ekler.
icon: fa-birthday-cake
category: Community
dashboard: /dashboard/birthday
module: Birthday
tags: [birthday, birthdays, bday, celebrate, birthday role, announcement, timezone, age, profile, doğum günü, doğum günleri, kutlama, doğum günü rolü, duyuru, saat dilimi, yaş, profil]
related: [utility, administration]
---

## Ne işe yarar

Bir üye doğum gününü `setbirthday` ile bir kez ayarlar, ardından özelliğin açık olduğu herhangi bir sunucuda `birthdayannouncements` komutunu çalıştırır. Bot her gün kimin doğum günü olduğunu kontrol eder, duyuru kanalına bir mesaj gönderir ve isteğe bağlı olarak 24 saatlik bir doğum günü rolü verebilir. Bir etiket rolü ayarlıysa mesajın önüne o rol etiketlenir.

Doğum günleri sunucuya özel değil, üyenin bot profilinde saklanır; bu yüzden tek bir `setbirthday` komutu botun ortak olduğu her sunucuda geçerlidir. Belirli bir sunucuda doğum gününün duyurulup duyurulmayacağı üç şeye bağlıdır: üyenin katılmayı seçmiş olması, profilinin gizli olmaması ve doğum günü görüntüleme modunun devre dışı bırakılmamış olması.

Herkes `birthdaytoday` ile kimin kutladığını, `birthdaylist` ile yaklaşan doğum günlerini görebilir. Üye yılı gizleyen bir görüntüleme modu seçmediyse yaş isimlerin yanında gösterilir.

Yetkililer kanalı, rolleri ve mesajı kontrol panelindeki **Doğum Günleri** sayfasından ya da `birthday*` komutlarıyla ayarlar.

## Neden kullanırsın

- Tarihleri elle takip etmeden her gün bir "happy birthday" paylaşımı isteyen topluluk sunucuları için.
- Üyelere bir gün boyunca renkli bir doğum günü rolü vererek sohbette öne çıkmalarını sağlamak için.
- İnsanların duyuruyu gerçekten görmesi için bir "doğum günü ekibi" rolünü etiketlemek için.
- Üyelerin doğum günlerinin ne kadarının herkese açık olacağını seçmesine izin vermek için; tamamen gizlemeye kadar.

## Kimler duyurulur

Bir üye yalnızca şu koşulların hepsi sağlandığında duyurulur ve listelere girer:

| Koşul | Üyenin kontrolü |
| --- | --- |
| Bir doğum günü ayarlı | `setbirthday <date>` |
| Duyurulara katılım açık | `birthdayannouncements` bunu açıp kapatır; varsayılan kapalı |
| Profil gizli değil | Profilde `setprivacy public` |
| Görüntüleme modu Disabled değil | `setbirthdayprivacy <mode>` |

Kontrol, sunucuda şu anda bulunan üyeler üzerinden yapılır; bu yüzden sunucudan ayrılan biri duyurulmaz.

### Doğum günü görüntüleme modları

`setbirthdayprivacy` şu değerlerden birini alır. Listelerde, profilde ve `birthdaytoday` çıktısında neyin gösterileceğini belirler.

| Mod | Etkisi |
| --- | --- |
| `Default` | Tam tarih gösterilir, listelerde yaş görünür |
| `MonthOnly` | Yalnızca ay gösterilir, yaş gizlenir |
| `YearOnly` | Yalnızca yıl gösterilir, yaş yine görünür |
| `MonthAndDate` | Ay ve gün gösterilir, yaş gizlenir |
| `Disabled` | Doğum günü gizlenir ve asla duyurulmaz |

## Günlük kontrol nasıl çalışır

Servis saatte bir çalışır ve her üyenin doğum gününün ay ve gününü UTC'ye göre bugünün tarihiyle karşılaştırır. Doğum günü bulunan yeni bir UTC gününün ilk saatinde mesajlar gönderilir ve sunucu o gün için tamamlanmış olarak işaretlenir; böylece hiçbir şey iki kez gönderilmez.

Duyurular yalnızca **Duyurular** özelliği açıksa ve bir kanal ayarlıysa yapılır. `birthdaychannel` ile ya da kontrol panelinden bir kanal ayarlamak bu özelliği senin için açar.

Saat dilimleri saklanır ama günlük kontrol tarafından henüz kullanılmaz. `birthdaytimezone` ve **Sunucu Saat Dilimi** ayarı kabul edilir ve yapılandırma embed'inde gösterilir, ancak duyurular yine UTC gününe göre yapılır.

## Doğum günü rolü

**Doğum Günü Rolü** etkinleştirilip bir rol ayarlandığında, duyurulan her üyeye duyuru anında rol verilir ve 24 saat sonra kaldırılır. Kaldırma zamanlayıcısı bellekte tutulur; bu yüzden bot gün içinde yeniden başlarsa rol biri onu kaldırana kadar üzerinde kalır.

Botun Rolleri Yönet yetkisi olmalı ve en üst rolü doğum günü rolünün üstünde olmalıdır.

## Duyuru mesajı

Varsayılan mesaj, etrafında parti emojileri olan `Happy Birthday %user.mention%!` metnidir. Bunu `birthdaymessage` ya da kontrol panelindeki **Özel doğum günü duyurusu** düzenleyicisiyle değiştirebilirsin. Metin embed ayrıştırıcısından geçer, yani embed oluşturucunun ürettiği her şey çalışır; etiket rolü etkinse mesajın başına eklenir.

### Yer tutucular

Mesaj, yer tutucular sayfasındaki standart kullanıcı, sunucu, kanal ve bot yer tutucularını ile doğum gününe özel bir değeri destekler.

| Yer tutucu | Değer |
| --- | --- |
| `%user.mention%` | Doğum günü olan üyeyi etiketler |
| `%user.name%` | Kullanıcı adı |
| `%user.avatar%` | Avatar URL'si |
| `%server.name%` | Sunucu adı |
| `%birthday.age%` | Dönecekleri yaş ya da `Unknown` |

> [!WARNING]
> `{user}` yerine `%user.mention%` kullan. Metin komutu yardımında `{user}` geçer, ama yayınlanan duyuruda yalnızca `%...%` biçimi yerine konur.

## Ayarlar

Her şey **Doğum Günleri** sayfasında üç sekmede bulunur: **Yapılandırma**, **Kullanıcılar** ve **İstatistikler**.

**Yapılandırma** temel ayarları, mesaj düzenleyicisini ve her özellik için bir anahtar içeren **Doğum günü özellikleri** panelini barındırır.

| Ayar | Varsayılan | Ne kontrol eder |
| --- | --- | --- |
| Kanal | yok | Duyuruların gönderildiği yer |
| Doğum günü rolü | yok | Bir doğum gününde 24 saat verilen rol |
| Etiket rolü | yok | Her duyurunun önünde etiketlenen rol |
| Sunucu Saat Dilimi | UTC | Sunucu için saklanır, yapılandırma embed'inde gösterilir |
| Doğum gününden kaç gün önce hatırlatılsın | 0 | 0 ile 30 arası; saklanır, henüz hatırlatma gönderilmez |
| Doğum günü mesajı | varsayılan embed | Yukarıdaki yer tutucularla duyuru |

| Özellik anahtarı | Varsayılan | Ne kontrol eder |
| --- | --- | --- |
| Duyurular | kapalı | Kanala günlük mesajı gönderir |
| Doğum günü rolü | kapalı | Geçici rolü verir |
| Hatırlatıcılar | kapalı | Yer tutucu anahtar; henüz bir şey gönderilmez |
| Etiket rolü | kapalı | Duyurularda etiket rolünü etiketler |
| Saat dilimi desteği | kapalı | Yer tutucu anahtar; kontrol hâlâ UTC'de çalışır |

**Kullanıcılar** sekmesi, sonraki 7, 14 ya da 30 gün için **Yaklaşan doğum günleri** listesini ve doğum günü ayarlanmış her üyenin yer aldığı **Tüm kullanıcılar** listesini gösterir; bugünkü doğum günleri sayfanın en üstünde vurgulanır. **İstatistikler** sekmesi **Toplam Kullanıcı**, **Ayarlanan doğum günleri**, **Herkese açık doğum günleri** ve **Bugünkü doğum günleri** değerlerini gösterir.

> [!NOTE]
> Kontrol paneli formunu kaydetmek yalnızca doldurduğun değerleri yazar. Bir rolü ya da kanalı temizlemek için rolü olmadan `birthdayrole` ya da `birthdaypingrole` komutlarını kullan; ya da her şeyi sıfırlamak için `/birthday config reset` komutunu çalıştır.

## Kurulum adımları

1. Kontrol panelinde **Doğum Günleri**'ni aç.
2. **Yapılandırma** altında duyurular için bir **Kanal** seç ve **Yapılandırmayı Kaydet**'e tıkla.
3. **Doğum günü özellikleri** panelinde **Duyurular**'ı aç.
4. İstersen bir **Doğum günü rolü** seç ve **Doğum günü rolü** anahtarını aç; bir **Etiket rolü** seçip **Etiket rolü** anahtarını aç.
5. İstersen kendi **Doğum günü mesajını** `%user.mention%` ve `%birthday.age%` kullanarak yaz.
6. Üyelere `setbirthday` ve ardından katılmak için `birthdayannouncements` komutlarını çalıştırmalarını söyle.
7. **Kullanıcılar** sekmesinden **Yaklaşan doğum günleri** altında göründüklerini doğrula.

## Komutlar

Bu komutları sunucunun önekiyle çalıştır (önekini değiştirmediysen `.`). Slash sürümleri `/birthday` ve `/birthday config` altında bulunur.

| Komut | Takma adlar | Gereken yetki | Amaç |
| --- | --- | --- | --- |
| `setbirthday <date>` | | Herkes | Profilindeki doğum gününü ayarla, örneğin `setbirthday 1998-04-12` |
| `setbirthdayprivacy <mode>` | | Herkes | Yukarıdaki görüntüleme modlarından birini seç |
| `birthdayannouncements` | `bdayann` | Herkes | Duyurulmaya katıl ya da çık |
| `birthdaytimezone <zone>` | `bdaytz` | Herkes | Saat dilimini sakla, örneğin `Europe/London` |
| `birthdaytoday` | `todaysbirthdays` | Herkes | Bugün kimin kutladığını listele |
| `birthdaylist [days]` | `bdaylist`, `upcomingbirthdays` | Herkes | Yaklaşan doğum günleri, 1 ile 30 gün, varsayılan 7 |
| `birthdaychannel [#channel]` | `bdaychannel`, `bdaychan` | Yönetici | Duyuru kanalını ayarla ve duyuruları aç |
| `birthdayrole [@role]` | `bdayrole` | Yönetici | 24 saatlik doğum günü rolünü ayarla; rolsüz kullanılırsa temizler |
| `birthdaypingrole [@role]` | `bdayping` | Yönetici | Etiketlenecek rolü ayarla; rolsüz kullanılırsa temizler |
| `birthdaymessage [text]` | `bdaymsg` | Yönetici | Duyuru metnini ayarla ya da mevcut metni göster |
| `birthdayconfig` | `bdaycfg` | Yönetici | Mevcut yapılandırmayı göster |

`/birthday config reset` tüm ayarları temizler ve tüm özellikleri kapatır. Metin komutunun bir karşılığı yoktur.

## İpuçları ve dikkat edilecekler

- Üyeler `birthdayannouncements` komutunu çalıştırana kadar duyurulmaz. Onlara söyle, yoksa kimse görünmez.
- `setbirthday` botun tarih olarak ayrıştırabildiği her şeyi kabul eder. `1998-04-12` gibi net bir biçim kullan.
- `birthdaytimezone` yalnızca `UTC`, `GMT`, `America/New_York`, `Europe/London`, `Asia/Tokyo`, `Asia/Kolkata`, `Australia/Sydney` ve `Pacific/Auckland` gibi on altı sabit bölgeyi kabul eder. Kontrol panelindeki **Sunucu Saat Dilimi** açılır listesinde on üç benzer bölge bulunur.
- Günlük kontrol UTC'yi kullanır. UTC'den uzakta olan üyeler birkaç saat erken ya da geç duyurulabilir.
- Bot, doğum günü rolü için Rolleri Yönet, duyuru kanalında da Mesaj Gönder ve Bağlantı Yerleştirme yetkisine ihtiyaç duyar.
- `birthdayconfig` bir "Reminder Days" alanı ve bir Hatırlatıcılar özelliği gösterir. Bunlar saklanır ama şu an hiçbir şey göndermez.
- Saklanan bir doğum gününü silmek için bir komut yoktur. Üyeler `setbirthdayprivacy Disabled` çalıştırarak ya da `birthdayannouncements` ile çıkarak gizleyebilir.

---
title: Kontrol Paneli Erişimi
slug: access
summary: Belirli üyelerin ya da rollerin sunucu kontrol panelini açmasına ve yalnızca seçtiğin bölümleri görüntülemesine ya da yönetmesine izin ver; Discord yöneticisi yapmadan.
icon: fa-key
category: Security
dashboard: /dashboard/access
tags: [dashboard access, permissions, grant, staff, restrict, who can edit, view, manage, managers, delegation, kontrol paneli erişimi, izinler, yetki, yetkili, kısıtla, kim düzenleyebilir, görüntüle, yönet, yöneticiler, yetki devri]
related: [auditlog, administration]
---

## Ne işe yarar

Varsayılan olarak, bir sunucuyu kontrol panelinde yalnızca sunucu sahibi ve Yönetici iznine sahip üyeler açabilir. Kontrol Paneli Erişimi bunu genişletmeni sağlar. Bir üye ya da rol seçersin, hangi kontrol paneli bölümlerini alacaklarını ve her birinin **Görüntüle** mi **Yönet** mi olacağını belirlersin. Bundan sonra o sunucu, onların kontrol paneli sunucu listesinde görünür ve verdiğin bölümler onlar için çalışır; geri kalan her şey reddedilir.

Denetim kontrol panelinde değil, botun API'sinde yapılır. Sunucuyu adresleyen her istek, oturum açmış kullanıcının kimliğini taşır. Sahip ya da Yönetici iseler istek geçer. Değilse bot, isteğin ait olduğu bölümü bulur, okumaları **Görüntüle**, her değişikliği **Yönet** olarak değerlendirir ve kullanıcının doğrudan ya da rollerinin herhangi biri üzerinden sahip olduğu en iyi seviyeyle karşılaştırır.

Sunucu sahibi, erişim listesinin kendisini kimin düzenleyebileceğine de karar verir. Varsayılan olarak yalnızca sahip düzenleyebilir. Sahip belirli erişim yöneticileri atayabilir ya da Yönetici veya Sunucuyu Yönet yetkisine sahip herkesin bunu yapmasına izin veren tek bir anahtarı açabilir.

## Neden kullanırsın

- Bir topluluk ekibi, Discord'da Yönetici yetkisine sahip olmadan kontrol panelinden çekilişleri, önerileri ve biletleri yönetir.
- Bir moderatör rolü, Moderasyon ve Logging için **Yönet**, diğer her şey için **Görüntüle** alır; böylece bakabilir ama kendilerine ait olmayan ayarları değiştiremez.
- Bir bot yardımcısına XP ve Para Birimi düzenleme güveni verilir, ama güvenlikle ilgili hiçbir şey verilmez.
- Sahip, erişim listesinin bakımını sahip-özel denetimleri vermeden bir ortak sahip rolüne devreder.

## Erişim seviyeleri

| Seviye | İzin verdikleri |
| --- | --- |
| Yok | O bölüm için hiçbir şey; bölüm verilmemiştir |
| Görüntüle | Yalnızca okuma istekleri, örneğin sayfayı açmak ve verilerini yüklemek |
| Yönet | Görüntüle'nin izin verdiği her şey, artı oluşturma, düzenleme ve silme |

Bir üye birden fazla yetkiyle eşleşirse, örneğin kişisel bir yetki ve bir rol yetkisi, her bölüm için en yüksek seviye geçerli olur. En az bir bölüme erişimi olan üye, kontrol paneli sunucu değiştiricisinde o sunucuyu görür; hiçbir yetkisi olmayan üye ise görmez.

Sahipler ve Yöneticiler yetkilerden tamamen muaftır ve her zaman tam erişime sahiptir.

## Bölümler

Bölümler, kontrol paneli kenar çubuğuyla eşleşir. Seçicideki her özellik, botun bir veya daha fazla API alanına karşılık gelir; bu yüzden "Administration" vermek hem Administration hem de Protection uç noktalarını kapsar, "Moderation" ise Protection'ı da kapsar. Seçici bölümleri kenar çubuğu kategorisine göre gruplandırır; Performance gibi sunucuya özgü veri değil genel bot altyapısı olan özellikler yetkilendirilemez.

Bir yetki, birden fazla alana eşlenen bir özelliği kapsadığında, seçici bunların hepsinde ortak olan en düşük seviyeyi gösterir; grubu ayarlamak, tüm alanlarını aynı anda ayarlar.

## Erişim listesini kim yönetebilir

| Kim | Yapabilecekleri |
| --- | --- |
| Sunucu sahibi | Her şey: yetki devri anahtarı, yönetici listesi ve tüm yetkiler |
| Atanmış erişim yöneticileri | Yetki ekleme, düzenleme ve kaldırma |
| Yönetici ya da Sunucuyu Yönet yetkisine sahip üyeler | Yalnızca yetki devri anahtarı açıkken yetki ekleme, düzenleme ve kaldırma |
| Diğer herkes | "Kontrol paneli erişimini burada yönetemezsin" mesajını görür |

Erişim yöneticileri bir üye ya da rol olabilir. Yönetici listesini ve yetki devri anahtarını yalnızca sahip görebilir ya da değiştirebilir; API bu çağrıları başka herkesten reddeder.

> [!WARNING]
> Kontrol Paneli Erişimi üzerinde **Yönet** vermek mümkün değildir, çünkü erişim denetleyicisi bölüm kontrollerinden muaftır. Listeyi yönetme kontrolünü dağıtmak için yönetici listesini ya da yetki devri anahtarını kullan.

## Ayarlar

Her şey tek bir Kontrol Paneli Erişimi sayfasındadır.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Yöneticilerin ve Sunucuyu Yönet yetkisi olan üyelerin kontrol paneli erişimini yönetmesine izin ver | Kapalı | **Yetki Devri Ayarları** altında. Açıkken Yönetici ve Sunucuyu Yönet yetkisine sahip üyeler yetkileri düzenleyebilir. Yalnızca sahip. |
| Erişim Yöneticileri | yok | Yetkileri düzenlemek için atanmış üyeler ya da roller. Yalnızca sahip. |
| Erişim Yetkileri | yok | Her üye ya da rol için bir giriş; her bölüm için bir seviye listeler. Yöneticiler ve sahip. |

**Kısıtlı Erişim Ver** formu bir hedef türü (kullanıcı ya da rol), hedefi ve her özellik grubu için bir seviye alır. Aynı hedef için ikinci bir yetki kaydetmek ilkinin yerini alır. Mevcut bir yetkiyi düzenlemek, aynı formu **Erişim Yetkisini Düzenle** başlığıyla açar.

## Kurulum adımları

1. Sunucu sahibi olarak kontrol panelinde **Kontrol Paneli Erişimi**'ni aç.
2. Listeyi kimin tutacağına karar ver. **Yetki Devri Ayarları** altındaki anahtarı aç ya da **Erişim Yöneticileri** altına bir üye ya da rol ekle.
3. **Kısıtlı Erişim Ver** altında **Rol**'ü seç ve yetkili rolünü seç.
4. Her gün çalıştırdıkları özelliklerde **Yönet**'i, yalnızca incelemeleri gereken özelliklerde **Görüntüle**'yi ayarla. Geri kalanı **Yok** olarak bırak.
5. **Erişim Ver**'e tıkla. Yetki **Erişim Yetkileri** altında görünür.
6. Bu role sahip bir üyeden kontrol paneline giriş yapmasını iste. Sunucu artık onun listesinde görünmeli ve yalnızca verilen sayfalar çalışmalıdır.

## Komutlar

Kontrol Paneli Erişimi yalnızca kontrol panelinden yapılandırılır; bunun için bot komutu yoktur.

## İpuçları ve dikkat edilecekler

- Yetkiler, botun önbelleğe aldığı üye listesine göre kontrol edilir; bu yüzden yetkinin çalışması için üyenin sunucuda olması ve botun onu görebilmesi gerekir.
- Rol yetkileri, üyenin mevcut rollerini izler. Rolü kaldırmak erişimi hemen kaldırır.
- Her bölümü **Yok** olarak ayarlanmış bir yetki, yetki sayılmaz ve düşürülür; üye o sunucuyu değiştiricisinde kaybeder.
- Yöneticiler, yetkilerin ne dediğinden bağımsız olarak tam erişimi korur. Birini kısıtlamak için önce Discord'da Yönetici yetkisini kaldır, sonra buradan ihtiyaç duyduklarını ver.
- Kontrol paneli proxy'si her isteğe paylaşılan bir API anahtarı ekler, ama bu anahtar tek başına hiçbir sunucuya erişim vermez; oturum açmış kullanıcının kimliği her zaman gereklidir.
- Global komut listesi gibi bir sunucuya bağlı olmayan uç noktalar bölüm kontrollerine tabi değildir ve kısıtlı kullanıcılar için çalışmaya devam eder.

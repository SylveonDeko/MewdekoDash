---
title: Rol Durumları
slug: rolestates
summary: Bir üye sunucudan ayrıldığında sahip olduğu rolleri hatırla ve yeniden katıldığında bunları otomatik olarak geri ver.
icon: fa-tag
category: Actions
dashboard: /dashboard/rolestates
module: RoleStates
tags: [role states, role persistence, restore roles, rejoin, saved roles, role backup, transfer roles, rol durumları, rol kalıcılığı, rolleri geri yükle, yeniden katılma, kayıtlı roller, rol yedeği, rol aktarımı]
related: [administration, statusroles]
---

## Ne yapar

Rol Durumları etkinleştirildiğinde bot üyelerin ayrılmasını izler. Biri ayrıldığı anda, o sırada sahip olduğu rollerin listesini kaydeder. Bu kişi daha sonra geri katılırsa bot kayıtlı her rolü ona geri ekler; böylece yetkililerden yeniden doğrulanmasını ya da yeniden atanmasını istemesi gerekmez.

Üyenin bakış açısından çıkışta hiçbir şey değişmez. Geri girdiğinde rolleri, genellikle karşılama kanalını okumayı bitirmeden önce, zaten oradadır.

Yetkililer her üye için kayıtlı bir rol listesi görür; bunları inceleyebilir, düzenleyebilir ya da silebilir. Ayrıca asla geri yüklenmemesi gereken roller için bir hariç tutma listesi ve **şimdi herkesi kaydet** adlı toplu bir eylem vardır. Bu eylem, özelliği açmadan önce sunucuda olan üyeleri de kapsar.

## Neden kullanmalısın

- Yanlışlıkla ya da bildirimleri temizlemek için ayrılan doğrulanmış üyeler erişimini kaybetmeden geri döner.
- Bir tepki rol menüsünden seçilen renk, ping ve hobi rolleri yeniden katılımda korunur.
- Manuel doğrulama süreci olan sunucular, zaten onaylanmış kişileri yeniden kontrol etmekten kurtulur.
- Geri gelmemesi gereken rolleri elle seçebilirsin, örneğin geçici susturma rolünü ya da yetkili rolünü.
- Bir topluluğu yeni bir sunucuya taşırken rol durumları aktarılabilir ve aynı isimli rollerle eşleştirilebilir.

## Bir rol durumu nasıl kaydedilir

Bir üye ayrıldığında bot şunları kontrol eder:

1. Rol Durumları sunucu için etkin.
2. **Botları yoksay** kapalı ya da üye bir bot değil.
3. Üye **Reddedilen Kullanıcılar** listesinde değil.

Bunların hepsi geçerliyse, üyenin mevcut rollerini alır, `@everyone` rolünü ve yönetilen tüm rolleri (bot rolleri, sunucu destekçi rolü, entegrasyon rolleri) çıkarır, sonra **Reddedilen Roller** listesindeki her şeyi kaldırır. Geriye hiçbir şey kalmazsa hiçbir şey kaydedilmez. Aksi halde liste, o üye için daha önce saklanan her şeyin yerine geçer.

Yasaklamalar ayrı işlenir. **Yasaklamada temizle** açıksa, bir üyeyi yasaklamak kayıtlı durumunu siler; böylece yasağı kaldırıp yeniden katılmak hiçbir şeyi geri getirmez.

## Bir rol durumu nasıl geri yüklenir

Katılımda bot yine özelliğin etkin olduğunu, botların yoksayılmadığını (üye bir botsa) ve kullanıcının reddedilenler listesinde olmadığını kontrol eder. Sonra kayıtlı her rolü tek bir istekle ekler. Artık var olmayan ya da botun en yüksek rolünün üstünde olan roller bu isteğin başarısız olmasına neden olur; hata yalnızca kaydedilir.

> [!PERMISSION]
> Botun Rolleri Yönet yetkisi olmalı ve en yüksek rolü, geri vermesi beklenen her rolün üstünde olmalı.

### Otomatik atama rollerini atlamak

Yönetim modülündeki otomatik atama rollerini de kullanıyorsan, geri dönen bir üye normalde hem kayıtlı rolleri hem de otomatik atama rollerini alır. `togglerolestatesskipautoassign` ile **otomatik atamayı atla** seçeneğini açarsan, kayıtlı bir rol durumu olan herkes için bot otomatik atama rollerini atlar; böylece geri dönen üyeler yalnızca daha önce sahip oldukları şeyleri alır. Bu geçiş yalnızca komuttur; kontrol panelinde yoktur.

## Kayıtlı durumları elle yönetmek

Yetkililer bir üye ayrılana kadar beklemeden bir durumu oluşturabilir ya da düzenleyebilir:

- `setuserrolestate`, bir üyenin kayıtlı listesini senin belirttiğin rollerle değiştirir. Yönetilen roller ve `@everyone` çıkarılır.
- `addrolestorolestate` ve `removerolesfromrolestate`, mevcut kayıtlı bir listeyi değiştirir.
- `deleteuserrolestate`, bir üyeyi tamamen unutur.
- `saveallrolestates`, şu anki her üyenin anlık görüntüsünü alır ve otomatik kayıtla aynı bot ve reddetme filtrelerini uygular.

Kontrol paneli komutlarda olmayan bir şey ekler: **Rol Durumunu Kopyala**, bir üyenin kayıtlı rollerini alır ve sunucuda o anda bulunan başka bir üyeye doğrudan uygular.

## Başka bir sunucuya aktarmak

`transferrolestates <serverId>`, mevcut sunucudaki her kayıtlı durumu botun bulunduğu başka bir sunucuya kopyalar. Roller isme göre eşleştirilir (büyük/küçük harf duyarsız) ve yönetilen roller atlanır. Kayıtlı rolleri hedefte isim eşleşmesi olmayan üyeler atlanır. Hedef sunucuda Rol Durumları yoksa otomatik olarak etkinleştirilir ve kendi ayarları yoksa kaynağın **Botları yoksay** ve **Yasaklamada temizle** değerlerini devralır.

## Ayarlar

Rol Durumları sayfasındaki **Ayarlar** sekmesinin iki alt sekmesi vardır: **Genel** ve **Reddetme Listesi**.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Rol Durumları | Kapalı | Kaydetme ve geri yüklemenin ana anahtarı |
| Yasaklamada temizle | Kapalı | Bir üye yasaklandığında kayıtlı durumunu sil |
| Botları yoksay | Kapalı | Bot hesapları için rolleri kaydetme ya da geri yükleme |
| Mevcut Durumları Kaydet | düğme | Şu anki her üyenin rollerinin anlık görüntüsünü hemen al |
| Reddedilen Roller | yok | Asla kaydedilmeyen ve bu yüzden asla geri yüklenmeyen roller |
| Reddedilen Kullanıcılar | yok | Rolleri asla kaydedilmeyen ya da geri yüklenmeyen üyeler |

**Yönetim** sekmesi **Kullanıcı Rollerini Yönet** (seçilen rolleri bir üyenin kayıtlı durumuna ekler ya da çıkarır) ve **Rol Durumunu Kopyala** içerir. **Rol Durumları** sekmesi her kayıtlı durumu üyenin adı, kimliği ve rolleriyle listeler; bir girişin ayrıntılarını görüntülemene ya da silmene izin verir.

## Kurulum adımları

1. Botun rolünün, geri yüklemesini istediğin her rolün üstünde olduğundan emin ol.
2. Kontrol panelinde **Rol Durumları**'nı aç ve **Ayarlar** > **Genel** altında **Rol Durumları**'nı etkinleştir.
3. Bot rollerinin hatırlanmasını özellikle istemiyorsan **Botları yoksay**'ı aç.
4. **Yasaklamada temizle** konusuna karar ver. Yasağı kalkan üyelerin rollerini geri almasını istiyorsan kapalı bırak.
5. **Reddetme Listesi** bölümünde yetkili rollerini, ceza rollerini ve geçici olan her şeyi **Reddedilen Roller**'e ekle.
6. Mevcut üyelerin bugünden itibaren kapsanması için **Mevcut Durumları Kaydet** altındaki **Tümünü Kaydet** düğmesine bas.
7. Anlık görüntünün dolduğunu doğrulamak için **Rol Durumları** sekmesini kontrol et.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Bu modüldeki her komut Yönetici izni gerektirir.

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `togglerolestates` | `trs` | Yönetici | Rol Durumları'nı aç ya da kapat |
| `viewrolestatessettings` | `vrss` | Yönetici | Mevcut ayarları ve reddetme listelerini göster |
| `viewuserrolestates` | `viewrolestates`, `vurs` | Yönetici | Kayıtlı her durumda sayfa sayfa gez |
| `saveallrolestates` | `saveserverstates`, `backuprolestates` | Yönetici | Şu anki her üyenin anlık görüntüsünü al |
| `transferrolestates <serverId>` | `copyrolestates`, `moverolestates` | Yönetici | Durumları başka bir sunucuya kopyala, rolleri isme göre eşleştirerek |
| `togglerolestatesignorebots` | `trsib` | Yönetici | Bot hesaplarını yok saymayı aç/kapat |
| `togglerolestatesclearonban` | `trscob` | Yönetici | Yasaklamada durumu temizlemeyi aç/kapat |
| `togglerolestatesskipautoassign` | `trssaa`, `rsskipautoassign` | Yönetici | Kayıtlı durumu olan üyeler için otomatik atama rollerini atlamayı aç/kapat |
| `rolestatesadddenyrole @role...` | `rsadr` | Yönetici | Reddetme listesine roller ekle |
| `rolestatesremovedenyrole @role...` | `rsrra` | Yönetici | Reddetme listesinden roller çıkar |
| `rolestatesadddenyuser @user...` | `rsadu` | Yönetici | Reddetme listesine üyeler ekle |
| `rolestatesremovedenyuser @user...` | `rolestatesremoveadduser`, `rsrau` | Yönetici | Reddetme listesinden üyeler çıkar |
| `setuserrolestate @user @role...` | `surs` | Yönetici | Bir üyenin kayıtlı rollerini değiştir |
| `addrolestorolestate @user @role...` | `arsrs` | Yönetici | Bir üyenin kayıtlı durumuna roller ekle |
| `removerolesfromrolestate @user @role...` | `rrfrs` | Yönetici | Bir üyenin kayıtlı durumundan roller çıkar |
| `deleteuserrolestate @user` | `dur` | Yönetici | Bir üyenin kayıtlı durumunu unut |

Slash karşılıkları `/rolestates` altında bulunur.

## İpuçları ve tuzaklar

- Özelliği etkinleştirdiğinde sunucuda zaten olan üyeler, ayrılana ya da **Tümünü Kaydet**'e basana kadar hiçbir şey kaydedilmez. Kurulumdan hemen sonra bir kez çalıştır.
- Yalnızca ayrılmalar kayıt tetikler. Atılmalar da ayrılma sayılır. Yasaklar da ayrılma sayılır ve **Yasaklamada temizle** açıksa durum tekrar silinir.
- Geri yükleme tek bir rol ekleme çağrısı kullanır. Eksik ya da çok yüksek tek bir rol tüm geri yüklemeyi sessizce başarısız kılar; bu yüzden rolleri silip sıralarken reddetme listesini güncel tut.
- Yönetilen roller (bot entegrasyon rolleri, destekçi rolü) asla kaydedilmez. Discord bunları kendisi atar.
- `viewuserrolestates` sayfa başına üç üye gösterir.
- Hem `setuserrolestate` hem de `deleteuserrolestate` zaten ayrılmış bir kullanıcıyı kabul eder; böylece biri yeniden katılmadan önce durumunu düzeltebilirsin.
- Reddedilen Kullanıcılar yalnızca otomatik kayıt ve geri yüklemeyi etkiler. Elle komutlar ve **Rol Durumunu Kopyala** bu üyelerde yine çalışır.

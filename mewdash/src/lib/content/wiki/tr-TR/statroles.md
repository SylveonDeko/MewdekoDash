---
title: Durum Rolleri
slug: statroles
summary: Belli bir zaman aralığında aktif olduklarında üyelerin kazandığı, durmalarıyla kaybettikleri roller; eşikler, en iyi sıralar, en iyi yüzdeler ya da mesajlarda, seste, oyunlarda, davetlerde, sunucudaki süreyle veya hesap yaşıyla günlük seriler üzerinden belirlenir.
icon: fa-trophy
category: Community
dashboard: /dashboard/statroles
module: StatRoles
tags: [stat roles, statroles, activity roles, active member role, inactive role, top chatter role, voice role, invite rewards, message rewards, streak, statbot, durum rolleri, aktivite rolleri, aktif üye rolü, hareketsiz rol, en çok konuşan rolü, ses rolü, davet ödülleri, mesaj ödülleri, seri, istatistik botu]
related: [serverstats, xp, invites, liveboards]
---

## Ne işe yarar

XP seviye rolleri tek yönlüdür: bir kez kazanıldığında sonsuza dek kalır. Bir durum rolü ise bir zamanlamayla yeniden değerlendirilir. Koşulu karşılayan üyeler rolü alır, karşılamayı bırakan üyeler rolü kaybeder; yani "aktif üye" rolü *şu an* aktif olanı gösterir. Eski davranışı istiyorsan rolü kalıcı yap, ya da tersine çevirip hareketsiz üyeleri işaretlemek için kullan.

## Koşullar

Her durum rolü bir zaman aralığında bir şeyi ölçer ve tek bir sınır uygular.

| Ölçüm | Neyi sayar |
| --- | --- |
| Mesajlar | Aralıktaki mesajlar; istersen yalnızca seçilen kanallarda |
| Ses dakikaları | Aralıktaki ses kanalı süresi; Etkinlik İstatistikleri sayfasında dışladığın ses durumlarına uyarak |
| Bir oyundaki dakikalar | Aralıkta tek bir adlandırılmış oyun ya da uygulamadaki süre, ya da herhangi bir oyundaki süre. Oyun takibinin açık olması gerekir |
| Davetler | Üyenin net davet toplamı |
| Sunucudaki gün sayısı | Üyenin katılmasından bu yana geçen süre |
| Hesap yaşı | Hesabın oluşturulmasından bu yana geçen süre |

| Sınır | Kimler nitelik kazanır |
| --- | --- |
| Eşik | Bir minimum ile isteğe bağlı bir maksimum arasında |
| En iyi sıra | İki sıra arasında, örneğin ilk 10 |
| En iyi yüzde | Sıralanan üyelerin en iyi X yüzdesinde, örneğin en iyi %5 |
| Günlük seri | Zaman aralığı içindeki N günde günlük minimum değere ulaşan, örneğin son 7 günün 7'sinde 5 mesaj |

Zaman aralığı 1 ile 90 gün arasındadır ya da seriler dışında her şey için tüm zamanlar olabilir. Eşitlikler aynı sırayı paylaşır.

## Filtreler ve seçenekler

| Seçenek | Ne yapar |
| --- | --- |
| Yalnızca şu kanallarda say | Mesajları veya sesi seçilen kanallarla sınırlar |
| Gerekli roller | Dikkate alınabilmek için en az birine sahip olmak gerekir |
| Hariç tutulan roller | Bunlardan herhangi birine sahip olan üye hiçbir zaman dikkate alınmaz |
| Yoksayılan üyeler | Bu üyelere hiçbir zaman rol verilmez veya bu üyelerden rol alınmaz |
| Grup | Aynı grubu paylaşan durum rolleri, üyenin nitelik kazandığı en yüksek kademeyi korur; böylece Bronz, Gümüş ve Altın üst üste binmez |
| Kalıcı | Kazanıldıktan sonra asla kaldırılmaz |
| Ters çevir | Nitelik kazanamayan üyeler rolü alır |
| Botları dahil et | Bot hesaplarını da dikkate al |
| Her şu kadar değerlendir | Kuralın ne sıklıkla çalışacağı; en az 10 dakikada bir, varsayılan olarak her 3 saatte bir |
| Şu kanalda duyur / Üyeye DM gönder | Rol verildiğinde ya da alındığında mesaj gönder; `%user%`, `%role%`, `%action%` (kazanıldı veya kaybedildi), `%value%` ve `%stat%` yer tutucularını kullan |

## Kontrol paneli

**Durum Rolleri** sekmesi her kuralı koşuluyla, zamanlamasıyla ve son çalışmasıyla listeler; her biri için etkinleştirme, devre dışı bırakma, düzenleme, silme, **önizleme** ya da **çalıştır** işlemlerini sunar. Önizleme, hiçbir şeyi değiştirmeden kimin rolü kazanacağını ve kaybedeceğini gösterir. Çalıştır, değişikliği hemen uygular; elle çalıştırmalar sunucu başına on dakikada bir ile sınırlıdır.

**Oluştur / Düzenle** sekmesi yukarıdaki her şey için kullanılan formdur.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Her komut `/statrole` altında da bulunur.

| Komut | Takma adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `statroleadd <@role> <stat> <minimum> [days] [name]` | `sradd` | Rolleri Yönet | Eşik kuralı |
| `statroletop <@role> <stat> <topEnd> [days] [name]` | `srtop` | Rolleri Yönet | 1'den topEnd'e kadar olan sıralar için en iyi sıra kuralı |
| `statrolepercent <@role> <stat> <percent> [days] [name]` | `srpercent` | Rolleri Yönet | En iyi yüzde kuralı |
| `statrolestreak <@role> <stat> <perDay> <requiredDays> [days] [name]` | `srstreak` | Rolleri Yönet | Günlük seri kuralı |
| `statrolelist` | `statroles` | Kimse | Tüm kurallar |
| `statroleinfo <id>` | `srinfo` | Kimse | Tek bir kural, tam olarak |
| `statroleset <id> <setting> <value>` | `srset` | Rolleri Yönet | Ad, min, max, lookback, topstart, topend, days, permanent, invert, bots, group, interval, notifychannel, notifydm, message veya activity ayarlarını değiştir |
| `statrolefilter <id> <#channel, @role [true], or @user>` | `srfilter` | Rolleri Yönet | Bir kanal filtresini, gerekli rolü (`true` ile hariç tutulan rolü) ya da yoksayılan üyeyi aç veya kapat |
| `statroletoggle <id>` | `srtoggle` | Rolleri Yönet | Etkinleştir veya devre dışı bırak |
| `statrolepreview <id>` | `srpreview` | Rolleri Yönet | Kimin kazanıp kaybedeceği |
| `statrolerun <id>` | `srrun` | Rolleri Yönet | Hemen uygula |
| `statroleremove <id>` | `srremove` | Rolleri Yönet | Kuralı sil; üyeler sahip oldukları rolü korur |

## İpuçları ve dikkat edilecekler

- Botun en yüksek rolü, yönetilen rolün üstünde olmalıdır ve botun Rolleri Yönet iznine ihtiyacı vardır.
- Her Discord rolü tek bir durum rolü tarafından yönetilebilir. Aynı role yeni bir kuralı bağlamadan önce eski kuralı sil.
- Minimumu 0 olan ve maksimumu olmayan bir kural herkesle eşleşir; ya bir maksimum ver ya da bilerek ters çevirmeyi kullan.
- Etkinlik istatistiklerinden çıkmayı seçen üyelerin mesaj, ses ve oyun süresi olmaz; bu yüzden bu ölçümler için asla nitelik kazanmazlar.
- Büyük bir sunucuda bir kuralı etkinleştirmeden önce önizleme yap. Rol değişiklikleri hız sınırlarına uymak için aralıklı uygulanır; binlerce üyeye dokunan bir kural birkaç dakika sürer.

---
title: Komut İzinleri
slug: permissions
summary: Hangi komutları kimlerin ve nerede çalıştırabileceğini belirle; tüm sunucu, bir rol, bir kanal, bir kategori ya da tek bir üye için komutlar ve modüller üzerinde sıralı izin ver ve reddet kuralları ekle.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Permissions
tags: [permissions, command permissions, allow, deny, permission role, verbose, disable command, disable module, cooldown, dpo, permission override, blacklist, izinler, komut izinleri, izin ver, reddet, izin rolü, ayrıntılı, komutu devre dışı bırak, modülü devre dışı bırak, bekleme süresi, izin geçersiz kılma, kara liste]
related: [administration, help, filter, moderation]
---

## Ne işe yarar

Varsayılan olarak her komut, Discord izinlerinin izin verdiği herkes tarafından kullanılabilir. Komut İzinleri bunun üstüne sunucuya özel bir kural listesi ekler. Her kural bir komutun, bir modülün ya da tüm modüllerin tüm sunucu, bir rol, bir kanal, bir kategori ya da tek bir üye için izinli mi yoksa yasaklı mı olduğunu belirler. Biri bir komut çalıştırdığında bot listeyi sırayla kontrol eder, eşleşen ilk kuralı uygular ve komutu ya geçirir ya da durdurur.

Engellenen komutlar **ayrıntılı** mod açık değilse sessizce başarısız olur. Açıksa bot, komutu engelleyen kuralın numarasını ve metnini yanıt olarak yazar. Eğik çizgi (slash) komutları her zaman yalnızca sana görünen bir açıklama alır.

Kuralları yöneticiler yönetebilir ya da seçtiğin **izin rolüne** sahip herkes yönetebilir. Aynı liste kontrol panelinde **Yönetim** sayfasında, **Otomasyon ve Ayarlar** bölümünde **Komut İzinleri** kartı olarak bulunur.

Bununla birlikte iki ilgili araç daha vardır. Komut bekleme süreleri, bir sunucuda her üyenin bir komutu ne sıklıkla kullanabileceğini sınırlar. Discord izni geçersiz kılmaları ise Yönetim modülünde, bir komutun normalde istediği Discord iznini değiştirir; örneğin Yönetici gerektiren bir komutu Mesajları Yönet izni olanların kullanabilmesini sağlar.

## Neden kullanırsın

- Eğlence ve NSFW komutlarını ciddi kanallardan uzak tut.
- Müzik modülünü, bir bot komutları kanalı dışında her yerde kapat.
- Bir yardımcı rolün `warn` komutunu kullanmasını sağla, ama ona Mesajları Yönet ya da Yönetici izni verme.
- Rahatsız eden bir üyenin botu hiç kullanamamasını sağla.
- `roll` gibi gürültülü bir komutu üye başına on saniyede bir kullanımla sınırla.

## Kural nasıl yazılır

Her kuralın üç parçası vardır.

| Parça | Seçenekler |
| --- | --- |
| Neyi | Tek bir komut, tek bir modül ya da tüm modüller |
| Kime | Tüm sunucu, bir rol, bir kanal, bir kategori ya da belirli bir kullanıcı |
| Eylem | İzin ver ya da reddet |

Aşağıdaki komut adları ilk iki parçayı kodlar. İlk harfler hedefi seçer (`s` sunucu, `r` rol, `c` kanal, `ca` kategori, `u` kullanıcı), son kısım kapsamı seçer (`cmd` komut, `mdl` modül) ve `all...mdls` biçimleri tüm modülleri kapsar.

| Komut | Oluşturulan kural |
| --- | --- |
| `srvrcmd <command> <enable|disable>` | Tüm sunucu için bir komut |
| `srvrmdl <module> <enable|disable>` | Tüm sunucu için bir modül |
| `allsrvrmdls <enable|disable>` | Tüm sunucu için bütün modüller |
| `rolecmd <command> <enable|disable> <role>` | Bir rol için bir komut |
| `rolemdl <module> <enable|disable> <role>` | Bir rol için bir modül |
| `allrolemdls <enable|disable> <role>` | Bir rol için bütün modüller |
| `chnlcmd <command> <enable|disable> <#channel>` | Bir kanalda bir komut |
| `chnlmdl <module> <enable|disable> <#channel>` | Bir kanalda bir modül |
| `allchnlmdls <enable|disable> <#channel>` | Bir kanalda bütün modüller |
| `catcmd <command> <enable|disable> <category>` | Bir kategorideki her kanalda bir komut |
| `catmdl <module> <enable|disable> <category>` | Bir kategoride bir modül |
| `allcatmdls <enable|disable> <category>` | Bir kategoride bütün modüller |
| `usrcmd <command> <enable|disable> @user` | Tek bir üye için bir komut |
| `usrmdl <module> <enable|disable> @user` | Tek bir üye için bir modül |
| `allusrmdls <enable|disable> @user` | Tek bir üye için bütün modüller |

Sohbet tetikleyicileri de komut sayılır. Komut adının yazılması gereken yere tetikleyicinin numarasını ya da metnini yaz.

> [!EXAMPLE]
> `srvrmdl nsfw disable` ardından `chnlmdl nsfw enable #adult` komutu, NSFW modülünü tek bir kanal dışında her yerde engeller.

## Kural sırası

`listperms` listeyi 1'den başlayarak numaralandırır. 1. kural her zaman "tüm sunucu için bütün modüllere izin ver" kuralıdır; düzenlenemez ya da silinemez. Başka hiçbir kural eşleşmediğinde geçerli olan yedek kuraldır.

Yeni kurallar listenin sonuna eklenir. Bir komut çalıştığında bot kurallara en yüksek numaradan başlayarak 1'e doğru bakar ve hedefi ile kapsamı ikisi de eşleşen ilk kural karar verir. Yani en son eklenen eşleşen kural kazanır. Yukarıdaki örnek bu yüzden çalışır: kanal izni, sunucu yasağından sonra eklenmiştir.

`moveperm <from> <to>` bir kuralın konumunu değiştirir ve her şeyi yeniden numaralandırır; böylece bir istisnayı daha geniş bir kuralın üstüne ya da altına, kuralı yeniden oluşturmadan taşıyabilirsin. `removeperm <number>` bir kuralı siler. `resetperms` listeyi 1. kurala geri döndürür ve Yönetici izni gerektirir.

Kontrol panelindeki liste aynı kuralları gösterir; her kuralın yanında yukarı ve aşağı taşıma okları ile bir silme düğmesi bulunur.

## Ayrıntılı mod

`verbose`, engellenen bir metin komutunun, engelleyen kuralı adıyla belirten bir hata mesajı alıp almayacağını açar veya kapatır. Örneğin "permission 4 (`.chnlmdl nsfw disable #general`) prevents this" gibi. Varsayılan olarak kapalıdır. Kapalıyken engellenen komutlar sessizce yok sayılır; bu çoğu sunucu için doğrusudur ve üyelerin çalıştıramayacakları şeylerle uğraşmasını önler. Eğik çizgi komutları bu ayardan bağımsız olarak her zaman nedeni yanıt olarak ve yalnızca sana görünür şekilde yazar.

## Kuralları kim değiştirebilir

Bu modüldeki her komut ek bir kapıdan geçer. Yöneticiler her zaman kullanabilir. Diğerlerinin `permrole <role>` ile ayarlanmış **izin rolüne** sahip olması gerekir. Bu yoksa yönetici olmayanlara yalnızca ayrıntılı mod açıksa "Admin permissions" gerektiği söylenir ve komut durur. `permrole` argümansız çalıştırılırsa mevcut rol gösterilir; `permrole reset` onu temizler. `@everyone` rolü kullanılamaz.

`resetperms` ve `permrole` komutlarının kendileri de bunun üstüne her zaman Yönetici izni ister.

## Bekleme süreleri

`cmdcooldown <command> [time]`, bu sunucuda bir komut için üye başına bir bekleme süresi ayarlar. Süre 1 saniye ile 90000 saniye (25 saat) arasında olabilir. Süre vermezsen ya da `0s` yazarsan bekleme süresi temizlenir. `allcmdcooldowns` mevcut bekleme sürelerini listeler. Bunlar, bir komutun zaten sahip olduğu yerleşik bekleme sürelerine ek olarak uygulanır.

## Discord izni geçersiz kılmaları

Yönetim modülü, bir komutun istediği Discord iznini değiştirebilir. `dpo <command> <permissions...>`, komutun yerleşik izni yerine listelenen izinleri istemesini sağlar; örneğin `dpo purge ManageMessages`. Geçersiz kılmayı kaldırmak için izin vermeden `dpo <command>` çalıştır, listelemek için `dpol`, onaydan sonra hepsini temizlemek için `dpor` kullan. Üçü de Yönetici izni gerektirir.

Bir geçersiz kılma yalnızca Discord'un yerleşik gereksinimini değiştirir. Yukarıdaki komut izni kuralları yine geçerlidir. `help <command>` komut sayfası, özgün gereksinimi üstü çizili, yanında da geçersiz kılmayı gösterir.

## Yardım menüsündeki hızlı menü

`help <command>`, yöneticilere bir izinler düğmesi gösterir. Bu düğme yalnızca o komutu etkileyen kuralları gösteren bir hızlı menü açar, gereksiz kuralları (aynı hedef ve kapsama sahip iki kural) uyarır, bunları çözmeyi önerir ve komut için izin ver ve reddet kuralları eklemene ya da komutun izinlerini sıfırlamana izin verir; hepsini yardım sayfasından ayrılmadan yaparsın.

## Bot sahibi denetimleri

Üç komut grubu yalnızca bot sahiplerine açıktır ve her sunucuyu etkiler. Genel izinler (`globalmodule`, `globalcommand`, `globalpermlist`, `resetglobalperms`) bir modülü ya da komutu her yerde kapatır. Kara liste (`userblacklist`, `channelblacklist`, `serverblacklist`, `manualblacklistcheck`) botun bir kullanıcıya, kanala ya da sunucuya hiç yanıt vermemesini sağlar. Genel olarak kapatılmış bir modül, yardım menüsünde bir dünya ve çarpı simgesiyle gösterilir.

## Ayarlar

Kontrol panelinde **Yönetim** sayfasını aç, ardından **Otomasyon ve Ayarlar** bölümüne ve **Komut İzinleri** kartına git.

| Ayar | Varsayılan | Neyi kontrol eder |
| --- | --- | --- |
| Ayrıntılı izinler | kapalı | Bir kuralın bir komutu engellediğini kullanıcılara bildirir |
| İzin rolü | yok | Bu role sahip üyeler komutlar aracılığıyla kuralları düzenleyebilir |
| Kurallar | yalnızca 1. kural | Sıralı liste; **Eylem**, **Neyi** ve **Kime** ile ekle, ardından bir modül, komut, rol, kanal, kategori ya da kullanıcı kimliği seç |

Kart ayrıca özel kural sayısını ve ayrıntılı modun açık olup olmadığını gösterir. Aynı bölümdeki **İzin Geçersiz Kılmaları** kartı Discord izni geçersiz kılmalarını yönetir: bir bot komutu seçersin ve yerleşik izni yerine istemesi gereken **Gerekli Discord İzni**ni belirlersin.

## Kurulum adımları

1. Ne tür bir yapı istediğine karar ver: genellikle "her şey izinli, birkaç şey yasaklı" ya da "her şey yasaklı, sonra bot kanallarında izinli".
2. İkinci yapı için `allsrvrmdls disable` çalıştır, ardından `allchnlmdls enable #bot-commands` çalıştır.
3. Yetkililerin moderasyonu çalışmaya devam etsin diye `rolemdl moderation enable @Mods` ve `rolemdl administration enable @Mods` çalıştır.
4. `listperms` komutunu çalıştır ve listeyi aşağıdan yukarıya oku; bot de bu sırayı kullanır. Bir istisna, üstüne yazması gereken kuralın altında kalıyorsa `moveperm` kullan.
5. Güvendiğin yetkililere `permrole @Mods` ver ki Yönetici izni olmadan kuralları ayarlayabilsinler.
6. Test sırasında hangi kuralın tetiklendiğini görmek için `verbose` komutunu aç, işin bitince yeniden kapat.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (`.`, değiştirmediysen). Eğik çizgi sürümleri `/permissions` altındadır; örneğin `/permissions servercommand`.

| Komut | Diğer adlar | Gerekli | Amaç |
| --- | --- | --- | --- |
| `listperms` | `lp` | Yönetici ya da izin rolü | Numaralı kural listesini göster |
| `verbose [true|false]` | `v` | Yönetici ya da izin rolü | Engellenen komut mesajlarını aç veya kapat |
| `permrole [role|reset]` | `pr` | Yönetici | İzin rolünü göster, ayarla ya da sıfırla |
| `removeperm <number>` | `rp` | Yönetici ya da izin rolü | Bir kuralı sil |
| `moveperm <from> <to>` | `mp` | Yönetici ya da izin rolü | Kuralların sırasını değiştir |
| `resetperms` | | Yönetici | Tüm kuralları sil |
| `srvrcmd <command> <enable|disable>` | `sc` | Yönetici ya da izin rolü | Tüm sunucu için komut kuralı |
| `srvrmdl <module> <enable|disable>` | `sm` | Yönetici ya da izin rolü | Tüm sunucu için modül kuralı |
| `allsrvrmdls <enable|disable>` | `asm` | Yönetici ya da izin rolü | Tüm sunucu için bütün modüller |
| `rolecmd <command> <enable|disable> <role>` | `rc` | Yönetici ya da izin rolü | Bir rol için komut kuralı |
| `rolemdl <module> <enable|disable> <role>` | `rm` | Yönetici ya da izin rolü | Bir rol için modül kuralı |
| `allrolemdls <enable|disable> <role>` | `arm` | Yönetici ya da izin rolü | Bir rol için bütün modüller |
| `chnlcmd <command> <enable|disable> <#channel>` | `cc` | Yönetici ya da izin rolü | Bir kanalda komut kuralı |
| `chnlmdl <module> <enable|disable> <#channel>` | `cm` | Yönetici ya da izin rolü | Bir kanalda modül kuralı |
| `allchnlmdls <enable|disable> <#channel>` | `acm` | Yönetici ya da izin rolü | Bir kanalda bütün modüller |
| `catcmd <command> <enable|disable> <category>` | `cac` | Yönetici ya da izin rolü | Bir kategoride komut kuralı |
| `catmdl <module> <enable|disable> <category>` | `cam` | Yönetici ya da izin rolü | Bir kategoride modül kuralı |
| `allcatmdls <enable|disable> <category>` | `acamds` | Yönetici ya da izin rolü | Bir kategoride bütün modüller |
| `usrcmd <command> <enable|disable> @user` | `uc` | Yönetici ya da izin rolü | Bir üye için komut kuralı |
| `usrmdl <module> <enable|disable> @user` | `um` | Yönetici ya da izin rolü | Bir üye için modül kuralı |
| `allusrmdls <enable|disable> @user` | `aum` | Yönetici ya da izin rolü | Bir üye için bütün modüller |
| `cmdcooldown <command> [time]` | `cmdcd` | Yönetici ya da izin rolü | Bekleme süresi ayarla ya da temizle |
| `allcmdcooldowns` | `acmdcds` | Yönetici ya da izin rolü | Bekleme sürelerini listele |
| `discordpermoverride <command> [permissions...]` | `dpo` | Yönetici | Discord izni geçersiz kılmasını ayarla ya da kaldır |
| `discordpermoverridelist` | `dpol`, `dpoli` | Yönetici | Geçersiz kılmaları listele |
| `discordpermoverridereset` | `dpor` | Yönetici | Tüm geçersiz kılmaları temizle |
| `globalmodule <module>` | `gmod` | Bot sahibi | Bir modülü her yerde aç veya kapat |
| `globalcommand <command>` | `gcmd` | Bot sahibi | Bir komutu her yerde aç veya kapat |
| `globalpermlist` | `gpl`, `lgp`, `globalperms`, `listglobalperms` | Bot sahibi | Genel engelleri listele |
| `resetglobalperms` | | Bot sahibi | Genel engelleri temizle |
| `userblacklist <add|remove> <user> [reason]` | `ubl` | Bot sahibi | Bir kullanıcıyı kara listeye al |
| `channelblacklist <add|remove> <id> [reason]` | `cbl` | Bot sahibi | Bir kanalı kara listeye al |
| `serverblacklist <add|remove> <server> [reason]` | `sbl` | Bot sahibi | Bir sunucuyu kara listeye al |
| `manualblacklistcheck` | `manualblcheck`, `mbc` | Bot sahibi | Kara liste uygulamasını yeniden çalıştır |

## İpuçları ve dikkat edilecekler

- `resetperms` kural kontrolünden muaftır; böylece her şeyi kilitleyen bir kuraldan, yönetici olduğun sürece her zaman kurtulabilirsin.
- Kurallar komutun asıl adıyla eşleşir; bu yüzden `srvrcmd clear disable` ile `srvrcmd purge disable` aynı kuraldır. `help <command>` içindeki ilk adı kullan.
- "Bütün modüller" kuralı Komut İzinleri modülünü de kapsar. Bir rol için her şeyi yasaklarsan, yalnızca o role sahip üyeler `listperms` komutunu da çalıştıramaz.
- Kategori kuralları, komut çalıştığı andaki kanalın üst kategorisini kullanır; konular üst kanalından miras alır.
- Discord izni geçersiz kılmaları, hangi Discord izninin gerektiğini değiştirir, kimin izinli olduğunu değil. İkisini birlikte kullan: önce gereksinimi düşürmek için bir geçersiz kılma, sonra nerede kısıtlanacağını belirlemek için bir kural.
- Komut izinleri kuralları DM'lerde hiçbir zaman uygulanmaz.
- Kontrol paneli hedef seçeneklerini **Tüm sunucu**, **Bir rol**, **Bir kanal**, **Bir kategori** ve **Belirli bir kullanıcı** olarak gösterir; kullanıcı seçeneği yapıştırılan bir kullanıcı kimliğini alır.

---
title: Performans
slug: performance
summary: Yalnızca bot sahiplerine açık bir kontrol paneli sayfası; CPU, bellek, çalışma süresi, en yavaş metotlar ve her modülün işlediği ve hata verdiği Discord olaylarını gösterir.
icon: fa-clock
category: Analytics
dashboard: /owner/performance
tags: [performance, metrics, cpu, memory, latency, monitoring, uptime, events, modules, owner, performans, metrikler, bellek, çalışma süresi, olaylar, modüller, sahip]
related: [analytics, leave-feedback, administration]
---

## Ne işe yarar

Performans, botu çalıştıran kişi için bir izleme sayfasıdır. Yalnızca bot sahiplerine görünür: kenar çubuğu herkesten bunu gizler ve URL'yi doğrudan açan sahip olmayanlar kontrol paneli ana sayfasına yönlendirilir. Yetkililerin burada yapılandıracağı bir şey yoktur.

Sayfa çalışan bot sürecinden canlı sayıları okur. Bir sekme sistem kaynaklarını gösterir, bir sekme CPU süresinin en çok harcandığı metotları listeler, iki sekme ise Discord olay işlemesini olay türüne ve bot modülüne göre döker; her biri sayılar, ortalama çalışma süresi ve hata oranıyla birlikte gelir. Sayfa açıkken her şey kendiliğinden yenilenir.

Olay ve modül sayıları botun dahili olay işleyicisinden gelir; bu işleyici dağıttığı her gateway olayını kaydeder. Metot süreleri, izlenen metotları saran performans izleyicisinden gelir. İkisi de yalnızca bellekte tutulur, bu yüzden bot yeniden başlatıldığında sıfırlanır ve olay metrikleri her saat kendiliğinden sıfırlanır. Aynı sayıların kalıcı geçmişi için [Analitik](/wiki/analytics) sayfasına bak.

## Neden kullanmalısın

- Bot yavaşlamış ve CPU, bellek ya da tek bir yavaş metodun sebep olup olmadığını görmek istiyorsun.
- Bir modül hata veriyor ve logları okumadan modül başına hata oranını görmek istiyorsun.
- Bir dağıtımdan sonra belleğin birkaç dakika izlenerek stabil olduğunu doğrulamak istiyorsun.
- Bir destek sorusu için çalışma süresine ve iş parçacığı sayısına ihtiyacın var.

## Sekmeler

| Sekme | Bölüm | Gösterdiği | Yenileme |
| --- | --- | --- | --- |
| Genel Bakış | Sistem Kaynakları | **CPU Kullanımı**, **Bellek Kullanımı** (kullanılan ve toplam), **Çalışma süresi**, **İş Parçacığı Sayısı** ve ortalama süresiyle **En Çok CPU Kullanan Metotlar** | Her 5 saniyede |
| Metotlar | Metot Performansı | İzlenen her metot; **Çağrılar**, **Ort. Süre**, **Toplam Süre** ve **Son Çalıştırma** ile; her sütuna göre sıralanabilir, toplanan verileri temizleyen bir düğmesi vardır | Her 30 saniyede |
| Olaylar | Olay Metrikleri | **Toplam Olay**, **Toplam Hata**, **Olay Türleri** ve **Ortalama Hata Oranı**, ardından her Discord olay türü için işlenen sayısı, hatalar, çalışma süresi ve hata oranı | Her 10 saniyede |
| Modüller | Modül Metrikleri | **Aktif Modüller**, **Toplam Olay**, **Toplam Hata** ve **Ortalama Hata Oranı**, ardından her modül için işlenen olaylar, hatalar, çalışma süresi ve hata oranı | Her 10 saniyede |

CPU kullanımı, Genel Bakış her yenilendiğinde yarım saniye örneklenir ve yalnızca bot sürecini gösterir, tüm makineyi değil. Bellek, süreç çalışma kümesidir (working set). Toplam bellek Windows ve Linux'ta ana makineden okunur, diğer sistemlerde 0 görünür.

> [!NOTE]
> Metotlar sekmesi, izlenen metotlar çalışana kadar boştur. Botu bir süre kullan, sonra geri dön.

## Ayarlar

Ayar yoktur. Tek işlem, Metotlar sekmesindeki temizle düğmesidir; bu, metot sürelerini siler. Olay ve modül metrikleri elle temizlenemez; saat başı sıfırlanır.

## Kurulum adımları

1. Bir bot sahibi hesabıyla kontrol paneline giriş yap.
2. Kenar çubuğundan **Performans**'ı aç. Yalnızca sahiplere görünür.
3. Bir dakika boyunca **Genel Bakış**'ı açık tutarak CPU ve belleğin oturmasını izle.
4. Sorunlu olanı bulmak için **Modüller** sekmesine geçip hatalara göre sırala, sonra en yoğun olay türlerini görmek için **Olaylar**'a bak.
5. Yavaş metotları bulmak için **Metotlar**'ı kullan ve bir düzeltmeden sonra yeniden ölçmek için temizle.

## Komutlar

Performans sayfası yalnızca kontrol panelindedir; eşleşen bir bot modülü yoktur. Sohbette ilgili alanı kapsayan birkaç sahip komutu var. Bunları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`).

| Komut | Diğer adlar | Gereken yetki | Amaç |
| --- | --- | --- | --- |
| `stats` | | Kimse | Bot sürümü, beş saniyede çalıştırılan komutlar, bellek, önbellek sayıları, shard ve çalışma süresi |
| `commandstats` | `cstats` | Bot sahibi | En çok kullanılan komut, modül, sunucu ve kullanıcı |
| `shardstats` | | Bot sahibi | Her shard'ın durumu |

## İpuçları ve dikkat edilecekler

- Sayfa sahipliği botun kendisi üzerinden kontrol eder; bu yüzden bir bot örneğinde sahip olan ama diğerinde olmayan bir hesap, ikinci örnekte yönlendirilir.
- Sayılar süreç bazındadır. Birden fazla sürece yayılmış shard'lı bir botta, yalnızca kontrol panelinin bağlı olduğu süreci görürsün.
- Bu sayfadaki hiçbir şey saklanmaz. Geçmişe ihtiyacın varsa rakamları not al ya da ekran görüntüsü al.
- Bir olay türünde hata oranı yüksekse, genellikle o olayı dinleyen bir modül vardır; sonraki adım olarak Modüller sekmesine bak.

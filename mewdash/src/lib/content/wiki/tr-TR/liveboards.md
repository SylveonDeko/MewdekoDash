---
title: Canlı Panolar
slug: liveboards
summary: Bir kanalda bir sıralama tablosunu, grafiği veya genel bakışı sabitle; bot bunu sürekli düzenlesin ve günlük, haftalık ya da aylık bir özeti zamanlanmış şekilde paylaşsın.
icon: fa-thumbtack
category: Community
dashboard: /dashboard/liveboards
module: ServerStats
tags: [live boards, pinned leaderboard, pin leaderboard, auto updating, server report, weekly report, monthly report, digest, growth report, canlı panolar, sabitlenmiş sıralama tablosu, otomatik güncelleme, sunucu raporu, haftalık rapor, aylık rapor, özet, büyüme raporu]
related: [serverstats, invites, statchannels, statroles]
---

## Ne işe yarar

Canlı pano, bot'un bir kez gönderip sabitlediği ve güncel sayıları her zaman göstermesi için belirli aralıklarla düzenlediği bir mesajdır. Sunucu raporu ise günlük, haftalık ya da aylık olarak paylaşılan, son rapordan bu yana olanları özetleyen büyüme grafikli tek seferlik bir embed'dir.

## Panolar

| Pano | Gösterdiği |
| --- | --- |
| Davet sıralaması | Normal, ayrılan ve sahte sayılarıyla en çok davet edenler |
| Mesaj sıralaması | En çok konuşanlar |
| Ses sıralaması | En çok sesli kanal süresi olan üyeler |
| En çok oynanan oyunlar | Oyuncu sayılarıyla en çok oynanan oyunlar ve uygulamalar (oyun takibi gerekir) |
| Katılma grafiği, Ayrılma grafiği, Büyüme grafiği | Günlük katılmalar ve ayrılmalar |
| Üye grafiği | Saatlik anlık görüntülerden üye sayısı |
| Mesaj grafiği | Günlük mesajlar |
| Sunucu genel bakışı | `serveractivity` ile aynı özet |
| Davet analizleri | Katılmalar, ayrılmalar, elde tutma, sahte katılmalar ve kaynaklar |

Her panonun bir **zaman aralığı** vardır (son gün, hafta, ay veya tüm zamanlar; grafikler tüm zamanlar için en fazla 90 gün kullanır), en az 5 dakikalık bir yenileme aralığı, sıralama tabloları için bir satır sayısı ve bir sabitleme anahtarı vardır. Bir sunucu en fazla 10 pano bulundurabilir. Bir panoyu silmek mesajını da siler. Biri panonun mesajını elle silerse bot bir sonraki yenilemede yeni bir mesaj gönderir.

## Sunucu raporları

Bir kanal ve bir sıklık seç; bot zamanlama ilk kez geldiğinde bir rapor gönderir, ardından her gün 00:00 UTC'de, her Pazartesi ya da her ayın birinde. Bir rapor şunları içerir:

- Dönem için katılmalar, ayrılmalar, net büyüme ve elde tutma
- Mesajlar, ses süresi ve aktif üyeler
- Üye sayısı ve bunun nasıl değiştiği
- En çok davet edenler, en çok konuşanlar, en çok sesli kanalda olanlar ve en yoğun kanallar
- Etiketleriyle birlikte en çok kullanılan davet kodları ve oyun takibi açıksa en çok oynanan oyunlar
- Katılma ve ayrılma grafiği

**Raporu şimdi gönder**, zamanlamayı değiştirmeden hemen bir rapor paylaşır. Bot kanalda paylaşma iznini kaybederse raporlar kendiliğinden kapanır.

## Komutlar

Bu komutları sunucunun ön ekiyle çalıştır (değiştirmediysen `.`). Panolar `/liveboard` altında, raporlar `/serverreport` altında da bulunur.

| Komut | Takma adlar | Gerekli yetki | Amaç |
| --- | --- | --- | --- |
| `liveboardadd <#channel> <board> [range] [rows] [minutes]` | `pinboard`, `pinleaderboard` | Sunucuyu Yönet | Bir panoyu paylaş ve sabitle |
| `liveboardlist` | `liveboards` | Sunucuyu Yönet | Tüm panolar |
| `liveboardremove <id>` | `unpinboard` | Sunucuyu Yönet | Bir panoyu ve mesajını sil |
| `liveboardrefresh` | | Sunucuyu Yönet | Tüm panoları hemen yenile |
| `serverreportchannel [#channel]` | `reportchannel` | Sunucuyu Yönet | Rapor kanalını ayarla ve raporları aç; ya da kapat |
| `serverreportfrequency <Daily/Weekly/Monthly>` | `reportfrequency` | Sunucuyu Yönet | Raporların ne sıklıkla paylaşılacağı |
| `serverreportnow [frequency]` | `reportnow` | Sunucuyu Yönet | Mevcut kanalda bir rapor paylaş |

## İpuçları ve dikkat edilecekler

- Sabitleme, kanalda Mesajları Yönet yetkisi gerektirir. Bu yetki olmadan pano yine paylaşılır, sadece sabitlenmez.
- Panolar aynı mesajı düzenler; bu yüzden yoğun bir kanaldaki pano hızla yukarı kayar. Onları özel bir istatistik kanalına koy ya da sabitlemeye güven.
- Sıralama tabloları davet ve etkinlik dışlamalarına uyar; gizlenen ya da yok sayılan üyeler sabitlenmiş bir panoda hiç görünmez.
- Kanal istatistikleri canlı sayıları göstermenin diğer yoludur: mesaj yerine kanal adında bir sayaç.

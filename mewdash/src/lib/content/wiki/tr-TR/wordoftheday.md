---
title: Günün Kelimesi
slug: wordoftheday
summary: Her gün bir kelime, tanımı, telaffuzu ve bir örnekle birlikte gönderir; kelime, konuya ve zorluğa göre bir sözlükten veya sunucunun kendi yazdığı bir listeden seçilir.
icon: fa-book-open
category: Community
dashboard: /dashboard/wordoftheday
module: WordOfTheDay
tags: [word of the day, wotd, vocabulary, dictionary, definition, daily, datamuse, topic, schedule, günün kelimesi, kelime, sözlük, tanım, günlük, konu, zamanlama]
related: [birthday, utility]
---

## Ne işe yarar

Günde bir kez, sunucunun kendi saat diliminde seçtiği bir saatte, bot seçilen bir kanala bir kelime gönderir. Gönderide kelime, telaffuzu, sözcük türü, bir tanım ve varsa bir örnek cümle yer alır. Her gönderiyle birlikte bir rol etiketlenebilir.

Kelimeler Datamuse sözlüğünden gelir ve üç ayarla süzülür: kelimelerin yönelmesi gereken bir **konu**, bir **sözcük türü** ve yazılı İngilizcede ne sıklıkla geçtiğine dayanan bir **zorluk**. Bot son doksan günde gönderdiği hiçbir şeyi tekrar etmez.

Sunucular `wotdadd` ile bir **özel liste** de oluşturabilir. Tanım atlanırsa bot bir tane arar. **Kaynak modu**, gönderilerin sözlükten, özel listeden veya özel listeden önce, liste bitince sözlükten gelip gelmeyeceğini belirler.

## Hafta içine veya aya göre zamanlama

Kurallar, belirli bir hafta günü veya ay için konuyu, sözcük türünü ve zorluğu geçersiz kılabilir. Bir kural yalnızca ayarladığı alanları değiştirir; bu yüzden yalnızca konu içeren bir Pazartesi kuralı, temel sözcük türünü ve zorluğu kullanmaya devam eder. İkisi de geçerliyse hafta içi kuralları ay kurallarını, ay kuralları da temel ayarları geçersiz kılar.

Örnekler:

- `wotdday monday science` Pazartesi kelimesini bilim temalı yapar.
- `wotddayfilter friday adjective rare` Cumaları nadir sıfatlar yapar.
- `wotdmonth october spooky halloween` tüm Ekimi temalandırır.
- `wotdschedule` her kuralı ve bugün hangi filtrelerin geçerli olduğunu gösterir.

## Tartışma konusu

Açıldığında bot, her günlük gönderinin altında herkese açık bir konu açar ve insanları kelimeyi bir cümlede kullanmaya davet eden bir başlangıç istemi bırakır. Konunun adı bir şablondan gelir (varsayılan `Word of the day: %wotd.word%`) ve `%wotd.word%`, `%wotd.date%`, `%wotd.pos%` ile olağan sunucu yer tutucularını destekler. `wotdthread` bunu açar veya kapatır, `wotdthreadname` ad şablonunu ayarlar, gösterir veya temizler; `wotdthreadarchive` konunun otomatik arşivlenmeden önce ne kadar açık kalacağını ayarlar (1 saat, 1 gün, 3 gün veya 1 hafta).

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `wotd` | Bugünün kelimesini gösterir; henüz bir şey gönderilmediyse bir önizleme. |
| `wotdchannel #channel` | Kanalı ayarlar ve göndermeyi açar. |
| `wotdtime 9` | Gönderim yerel saatini ayarlar. |
| `wotdtimezone Europe/London` | Saat dilimini ayarlar. |
| `wotdtopic space` | Temel konuyu ayarlar. |
| `wotdpos noun` | Sözcük türünü sınırlar. |
| `wotddifficulty rare` | Zorluğu ayarlar. |
| `wotdmode mixed` | Sözlük, özel veya karma kaynağı seçer. |
| `wotdadd word [definition]` | Özel bir kelime ekler. |
| `wotdmessage` | Yer tutucular veya embed JSON'u içeren özel bir mesaj şablonu ayarlar. |
| `wotdthread` | Her gönderinin altındaki tartışma konusunu açar veya kapatır. |
| `wotdthreadname [template\|clear]` | Konu adı şablonunu ayarlar, gösterir veya temizler. |
| `wotdthreadarchive 1h\|24h\|3d\|7d` | Konunun otomatik arşivlenmeden önce ne kadar açık kalacağını ayarlar. |
| `wotdpost` | Şimdi yeni bir kelime gönderir. |

## Mesaj yer tutucuları

`%wotd.word%`, `%wotd.definition%`, `%wotd.pos%`, `%wotd.example%`, `%wotd.phonetic%`, `%wotd.date%` ve `%wotd.ping%` özel bir şablonun içinde, olağan sunucu yer tutucularının yanında kullanılabilir.

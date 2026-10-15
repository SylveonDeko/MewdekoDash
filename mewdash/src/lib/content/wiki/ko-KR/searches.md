---
title: 검색
slug: searches
summary: 날씨, 시간, 사전 정의부터 애니메이션, 영화, 이미지, osu! 프로필, 농담, 반응 GIF까지, Discord를 떠나지 않고 찾아볼 수 있어요.
icon: fa-magnifying-glass
category: Entertainment
module: Searches
tags: [search, weather, time, define, urban dictionary, wikipedia, google, image search, anime, manga, movie, osu, pokemon, translate, xkcd, meme, reddit, hug, pat, ship, 검색, 날씨, 시간, 사전, 위키백과, 번역, 이미지 검색, 애니메이션, 만화, 영화, 농담, 밈, 포옹, 쓰다듬기, 궁합]
related: [streams, feeds, twitch, games, utility]
---

## 기능 소개

검색 모듈은 외부 서비스에서 정보를 가져와 채널에 올려 주는 조회 명령어 모음이에요. 멤버는 도시의 날씨, 다른 곳의 현재 시간, 단어의 뜻, 애니메이션이나 영화, 위키백과 요약, 무작위 고양이 사진, 포옹이나 손바닥 치기 같은 반응 GIF를 요청할 수 있어요. 대부분의 결과는 임베드로 표시되고, 결과가 많은 검색은 페이지로 나뉘어요.

대시보드 페이지는 없어요. 거의 모든 명령어는 누구나 사용할 수 있고, 자동 번역 모드만 운영 권한이 필요해요.

스트림 알림과 RSS 피드도 같은 봇 모듈에 있지만 별도의 문서가 있어요. `streamadd`, `feedadd` 등은 스트림 알림 및 피드 문서를 참고하세요.

## 이런 때 사용해요

- "지금 거기 몇 시예요?"라는 질문에 계산하지 않고 `time`으로 바로 답해 보세요.
- 행사 전에 대화형 `weather` 카드로 일기예보를 확인하세요.
- 대화 중에 애니메이션, 만화, 캐릭터를 바로 찾아보세요.
- 멤버가 포옹, 쓰다듬기, 하이파이브를 GIF로 보낼 수 있어요.
- 메시지를 바로 번역하거나, 국제 커뮤니티를 위해 채널 전체의 자동 번역을 설정하세요.

## 날씨와 시간

`weather <place>`는 Open-Meteo로 장소를 찾고 현재 상태를 보여 줘요. 기온, 체감 온도, 습도, 풍속과 돌풍, 기압, 구름량, 가시거리, 그날의 최고·최저 기온이 나와요. 버튼과 드롭다운으로 시간별 예보, 세부 시간별 상태, 오늘과 내일의 최고·최저 기온과 강수량을 보는 일별 보기로 바꿀 수 있어요.

`time <place>`는 장소를 검색해 현재 시간과 시간대를 보여 줘요. 여러 장소가 맞으면 후보를 골라 선택할 수 있도록 제안해요.

## 단어와 지식

| 명령어 | 출처 | 결과 |
| --- | --- | --- |
| `define <word>` | Pearson 사전 | 뜻, 품사, 예문 |
| `urbandict <term>` | Urban Dictionary | 뜻 목록, 페이지로 나뉨 |
| `wiki <query>` | Wikipedia | 첫 번째로 일치하는 문서의 요약 |
| `wikia <site> <query>` | Fandom 위키 | 해당 위키의 요약 |
| `google <query>` | Google, 실패하면 DuckDuckGo | 웹 검색 결과 |
| `bible <book> <chapter:verse>` | Bible API | 해당 구절 본문 |
| `resolvetonetags <text>` | 내장 | 텍스트에 있는 `/j`나 `/s` 같은 어조 태그를 설명해요 |
| `translate <langs> <text>` | 번역 API | 번역된 텍스트. langs는 `from>to` 형식이에요. 예: `translate en>fr hello` |
| `translangs` | 번역 API | 사용할 수 있는 언어 |

### 자동 번역

`autotranslate`는 현재 채널의 자동 번역을 켜거나 꺼요. 관리자 권한이 필요해요. `del`을 붙이면 번역 후 원본 메시지를 삭제하고, `nodel`(기본값)을 붙이면 원본을 남겨 둬요. 그다음 멤버는 `autotranslang en>fr`로 해당 채널에서 쓸 본인의 언어 쌍을 정할 수 있고, 아무 값 없이 `autotranslang`만 입력하면 설정을 지울 수 있어요.

## 미디어와 팬덤

| 명령어 | 결과 |
| --- | --- |
| `anime <query>` | 상세 정보가 포함된 애니메이션 검색 결과 |
| `manga <query>` | 만화 검색 결과 |
| `charinfo <name>` | 캐릭터의 이름, 설명, 이미지 |
| `findanime [image]` | trace.moe로 스크린샷에서 애니메이션을 찾아요. 이미지를 첨부하거나 URL을 입력하세요 |
| `mal <username or @user>` | 시청 중, 완료 등의 통계가 있는 MyAnimeList 프로필 |
| `movie <title>` | OMDb로 찾은 IMDb 상세 정보 |
| `youtube <query>` | YouTube 검색 결과 |
| `steam <game>` | 게임의 Steam 스토어 페이지 링크 |
| `pokemon <name>` | 포켓몬 상세 정보 |
| `osu <user> [mode]`, `osu5 <user> [mode]` | osu! 프로필, 또는 상위 다섯 개의 플레이. 모드는 standard, taiko, catch, mania예요 |
| `gatari <user> [mode]` | osu!Gatari 프로필 |
| `xkcd [number or latest]` | xkcd 만화. 기본값은 무작위예요 |

## 이미지

`image <query>`는 Google과 DuckDuckGo에서 엄격한 세이프서치로 검색한 뒤, 결과를 안전성 검사에 통과시키고 페이지로 나뉜 임베드에 보여 줘요. 멤버는 20초에 한 번씩 사용할 수 있어요. `safebooru <tag>`는 Safebooru에서 태그가 붙은 이미지를 가져와요. `revimg <url>`과 `revav [@user]`는 이미지나 아바타를 Google, TinEye, Yandex에서 역방향 이미지 검색할 수 있는 링크를 줘요. `color <hex...>`는 하나 이상의 16진수 색상을 색 견본으로 보여 줘요.

무작위 사진: `randomcat`, `randomdog`, `randomfood`, `randombird`, `randomneko`, `randomkitsune`, `randomwaifu`. `meme`은 정해진 서브레딧 중에서 무작위 밈을 올리고, `randomreddit <subreddit>`은 해당 서브레딧에서 무작위 게시물을 올리되, 먼저 NSFW로 표시되어 있지 않은지 확인해요. `memelist`는 memegen 템플릿을 보여 주고, `memegen <template> [text]`는 밈을 만들어요. `rip @user`는 이름과 아바타가 들어간 묘비 이미지를 만들어요. `shorten <url>`은 링크를 줄여 줘요.

## 농담

`randjoke`, `yomama`, `chucknorris`, `wowjoke`, `magicitem`은 각각의 API에서 농담이나 아이템 설명을 가져와요. `catfact`는 고양이에 관한 사실을 하나 올려요.

## 반응 명령어

이 명령어들은 해당 행동에 맞는 애니메이션 GIF를 올려요. 다른 사람을 대상으로 하는 명령어는 멘션이 필요해요. `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold`, `highfive`가 여기에 해당해요. 본인을 대상으로 하는 명령어는 선택적으로 텍스트를 넣을 수 있어요. `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave`, `wink`가 여기에 해당해요. 모든 명령어는 슬래시 명령어로도 쓸 수 있어요.

`ship @user [@user2]`는 두 멤버(또는 본인과 멤버 한 명)의 궁합 점수를 계산하고, 코멘트와 함께 궁합 이미지를 올려요.

## 설정

이 모듈에는 대시보드 페이지가 없고, 자동 번역 토글 외에는 서버별 설정도 없어요. 여러 명령어는 봇 소유자가 설정한 API 키에 의존해요. 키가 없으면 결과 대신 오류 메시지를 보내요.

## 설정 따라 하기

1. 따로 켤 것은 없어요. `weather London`이나 `define serendipity`를 실행해서 봇이 채널에 답하는지 확인하세요.
2. 번역 채널을 만들고 싶다면, 관리자 권한으로 그 채널에서 `autotranslate`를 실행하세요. 그다음 멤버에게 `autotranslang en>es` 같은 명령어로 언어 쌍을 설정하게 하세요.
3. 반응이나 이미지 명령어를 특정 채널로 제한하고 싶다면 권한 모듈을 사용하세요.

## 명령어

이 명령어는 서버의 접두사(바꾸지 않았다면 `.`)와 함께 실행해요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `weather <place>` | `we` | 없음 | 대화형 날씨 카드 |
| `time <place>` | | 없음 | 현재 시간과 시간대 |
| `define <word>` | `def` | 없음 | 사전 뜻 |
| `urbandict <term>` | `ud` | 없음 | Urban Dictionary |
| `wiki <query>` | `wikipedia` | 없음 | 위키백과 요약 |
| `wikia <site> <query>` | `fandom` | 없음 | Fandom 위키 검색 |
| `google <query>` | `g` | 없음 | 웹 검색 |
| `bible <book> <chapter:verse>` | | 없음 | 성경 구절 |
| `resolvetonetags <text>` | `tonetag`, `resolvetonetag`, `tonetags` | 없음 | 어조 태그 설명 |
| `translate <langs> <text>` | `trans` | 없음 | 텍스트 번역. 예: `translate en>fr hello` |
| `translangs` | | 없음 | 지원하는 언어 |
| `autotranslate [del\|nodel]` | `at`, `autotrans` | 관리자 | 채널 자동 번역 토글 |
| `autotranslang [from>to]` | `atl` | 없음 | 자동 번역용 본인의 언어 쌍 |
| `anime <query>` | `ani`, `aq` | 없음 | 애니메이션 검색 |
| `manga <query>` | `mang`, `mq` | 없음 | 만화 검색 |
| `charinfo <name>` | `characterinfo` | 없음 | 캐릭터 조회 |
| `findanime [image]` | `whatanime` | 없음 | 스크린샷으로 애니메이션 찾기 |
| `mal <username or @user>` | | 없음 | MyAnimeList 프로필 |
| `movie <title>` | `omdb`, `imdb` | 없음 | 영화 상세 정보 |
| `youtube <query>` | `yt` | 없음 | YouTube 검색 |
| `steam <game>` | | 없음 | Steam 스토어 링크 |
| `pokemon <name>` | | 없음 | 포켓몬 상세 정보 |
| `osu <user> [mode]` | | 없음 | osu! 프로필 |
| `osu5 <user> [mode]` | | 없음 | osu! 상위 다섯 개 플레이 |
| `gatari <user> [mode]` | | 없음 | osu!Gatari 프로필 |
| `xkcd [number\|latest]` | | 없음 | xkcd 만화 |
| `image <query>` | `img`, `rimg` | 없음 | 세이프 이미지 검색 |
| `safebooru [tag]` | | 없음 | Safebooru 이미지 |
| `revimg <url>` | | 없음 | 역방향 이미지 검색 링크 |
| `revav [@user]` | | 없음 | 아바타 역방향 검색 |
| `color <hex...>` | `clr` | 없음 | 색 견본 |
| `randomcat` | `meow` | 없음 | 고양이 사진 |
| `randomdog` | `woof` | 없음 | 강아지 사진 |
| `randomfood` | `yum` | 없음 | 음식 사진 |
| `randombird` | `birb`, `bird` | 없음 | 새 사진 |
| `randomneko` | `neko` | 없음 | 네코 사진 |
| `randomkitsune` | `kitsune` | 없음 | 키츠네 사진 |
| `randomwaifu` | `waifu` | 없음 | 웨이푸 사진 |
| `meme` | `randommeme` | 없음 | 무작위 Reddit 밈 |
| `randomreddit <subreddit>` | `subreddit` | 없음 | 서브레딧의 무작위 게시물 |
| `memelist` | | 없음 | Memegen 템플릿 |
| `memegen <template> [text]` | | 없음 | 밈 만들기 |
| `rip <@user>` | | 없음 | 묘비 이미지 |
| `shorten <url>` | | 없음 | 링크 줄이기 |
| `randjoke` | | 없음 | 무작위 농담 |
| `yomama` | `ym` | 없음 | Yo mama 농담 |
| `chucknorris` | `cn` | 없음 | Chuck Norris 농담 |
| `wowjoke` | | 없음 | 월드 오브 워크래프트 농담 |
| `magicitem` | `mi` | 없음 | WoW 마법 아이템 |
| `catfact` | | 없음 | 고양이 사실 |
| `ship <@user> [@user2]` | | 없음 | 궁합 점수 이미지 |
| `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold`, `highfive <@user>` | | 없음 | 다른 멤버를 향한 반응 GIF |
| `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave`, `wink [text]` | | 없음 | 본인에 관한 반응 GIF |

## 팁과 주의 사항

- 이 명령어들은 외부 서비스를 호출하므로, 결과는 해당 서비스가 작동하는지와 봇 소유자가 올바른 API 키를 설정했는지에 따라 달라져요.
- `image`는 멤버당 20초에 한 번만 검색할 수 있고, NSFW 채널에서도 결과를 안전성 기준으로 걸러요.
- `randomreddit`은 NSFW로 표시된 서브레딧을 거부해요. 성인용 콘텐츠는 NSFW 모듈을 사용하세요.
- 자동 번역은 채널별로, 그리고 멤버별로 적용돼요. 운영진이 채널에서 먼저 켜야 하고, 각 멤버가 본인의 언어 쌍을 골라요.
- 스트림 알림(`streamadd`, `streamlist`, `streamtemplate`)과 RSS 피드(`feedadd`, `feedlist`)는 같은 모듈을 쓰지만 별도의 문서로 안내해요.

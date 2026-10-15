---
title: 음악
slug: music
summary: YouTube, Spotify, SoundCloud에서 음악을 재생하고 음성 채널에서 검색해요. 대기열, 저장된 재생목록, 오디오 필터, DJ 역할, 음성 변환(TTS), Last.fm 스크로블링을 지원해요.
icon: fa-music
category: Entertainment
dashboard: /dashboard/music
module: Music
tags: [music, play, queue, playlist, spotify, youtube, soundcloud, volume, skip, loop, repeat, dj role, filters, bass boost, nightcore, tts, text to speech, lastfm, scrobble, music links, 음악, 재생, 대기열, 재생목록, 스포티파이, 유튜브, 사운드클라우드, 볼륨, 건너뛰기, 반복, DJ 역할, 필터, 베이스 부스트, 나이트코어, TTS, 음성 변환, Last.fm, 스크로블, 음악 링크]
related: [utility, administration]
---

## 기능 소개

멤버가 음성 채널에 들어가서 `play`를 링크나 검색어와 함께 실행하면, 봇이 채널에 들어와 곡을 대기열에 넣고 재생을 시작해요. YouTube, YouTube Music, SoundCloud, Spotify 링크는 바로 처리되며, Spotify 트랙, 앨범, 재생목록은 YouTube에서 같은 곡을 찾아 재생해요. 일반 검색을 하면 최대 25개의 결과가 선택 메뉴로 나타나고, 멤버가 원하는 곡을 골라요.

같은 채널의 모든 멤버는 대기열 하나를 함께 써요. 멤버는 대기열을 보고, 항목으로 이동하고, 곡을 옮기거나 삭제하고, 섞고, 곡 하나 또는 대기열 전체를 반복하고, 대기열을 이름 있는 재생목록으로 저장해서 나중에 다시 불러올 수 있어요. 건너뛰기는 DJ 역할이 있는 멤버는 즉시 할 수 있고, 나머지 멤버는 투표로 해요.

스태프는 현재 재생 중 알림과 대기열 비어 있음 알림을 받을 음악 채널을 고르고, DJ 역할, 기본 볼륨, 반복 모드를 설정할 수 있어요. 베이스 부스트나 나이트코어 같은 오디오 필터도 켤 수 있어요. 대시보드에서는 대기열, 반복 버튼, 필터 토글이 있는 실시간 플레이어를 볼 수 있고, 같은 실시간 피드가 모바일 앱에도 전달돼요.

이 모듈에는 부가 기능이 두 가지 더 있어요. 음성 변환(TTS)은 음성 채널의 채팅 메시지를 소리 내어 읽어 주며, 멤버별 음성 설정과 차단 목록을 지원해요. Last.fm 기능을 쓰면 멤버는 봇이 재생한 곡을 스크로블하고, `fm` 계열 명령어로 자신의 청취 기록을 확인할 수 있어요.

## 사용하면 좋은 이유

- 누구나 곡을 추가할 수 있는 배경 음악 채널이 필요할 때, 한 사람이 밤새 DJ를 맡지 않아도 돼요.
- 스태프는 DJ 역할을 정해서 믿을 수 있는 멤버만 즉시 건너뛸 수 있게 하고, 나머지 멤버는 투표하게 할 수 있어요.
- 커뮤니티가 자주 쓰는 재생목록을 몇 개 만들어 두고, 행사를 시작할 때마다 불러올 수 있어요.
- 음성 채널에서 말을 할 수 없는 멤버도 자기 메시지를 소리 내어 읽어 주게 할 수 있어요.
- 음악 팬들은 Last.fm 통계와 "이 아티스트를 누가 제일 많이 들었나요?" 순위를 함께 볼 수 있어요.

## 재생과 대기열

거의 모든 음악 명령어는 음성 채널에 들어가 있어야 해요. 봇이 이미 다른 채널에서 재생 중이면, 다른 채널에서 보낸 명령어는 거부돼요.

`play <link or search>`는 다음 입력을 받아요.

| 입력 | 동작 |
| --- | --- |
| YouTube 또는 YouTube Music 링크 | 바로 불러와요. 재생목록도 포함해요 |
| SoundCloud 링크 | 바로 불러와요 |
| Spotify 트랙 링크 | YouTube 트랙과 매칭해요 |
| Spotify 앨범 또는 재생목록 링크 | 각 항목을 YouTube와 매칭해서, 처리되는 순서대로 대기열에 넣고 진행 메시지를 보여줘요 |
| 그 밖의 입력 | YouTube에서 검색하고, 최대 25개 결과를 선택 메뉴로 보여줘요 |

`play <number>`는 해당 대기열 위치로 바로 이동해요. `search <query>`는 대기열에 넣지 않고 결과 10개를 보여줘요. `queue`는 페이지당 5개씩 대기열을 보여주며, 각 곡의 옵션을 고를 수 있는 선택 메뉴가 함께 나와요. `nowplaying`은 현재 곡과 신청한 사람, 제공처를 보여줘요.

`songremove <number>`는 항목을 삭제하고, `movesong <from> <to>`는 순서를 바꾸고, `shuffle`은 현재 곡 뒤의 곡들을 섞고, `clearqueue`는 대기열을 비우고 재생을 멈춰요. `seek mm:ss`는 현재 곡의 해당 시점으로 이동해요. `volume 0..100`은 볼륨을 설정하고, 그 값을 서버 기본값으로 저장해요.

`loop <type>`은 반복을 설정해요. `none`(`off`도 가능), `track`(`song`도 가능), `queue`(`all`도 가능) 중에서 고를 수 있어요. 반복이 꺼진 상태에서 대기열이 끝나면, 봇은 음악 채널에 대기열 비어 있음 알림을 올려요.

### 건너뛰기와 DJ 역할

`skip`은 명령어를 실행한 사람이 바로 현재 곡을 끝내요. `voteskip`은 투표를 집계해요. DJ 역할이 있거나 관리자 권한이 있는 멤버는 바로 건너뛰고, 나머지 멤버는 투표 한 표를 더하며, 음성 채널에 있는 봇이 아닌 멤버의 70%가 투표하면 곡을 건너뛰어요.

`setdjrole @role`로 DJ 역할을 설정하거나, 대시보드의 **DJ 역할** 선택기를 쓸 수 있어요. 역할 없이 `setdjrole`만 실행하면 역할이 제거돼요.

### 자동 재생

`autoplay <0..5>`는 대기열이 비었을 때 관련 곡을 그 개수만큼 자동으로 추가해요. Spotify 추천을 사용해요. 0으로 설정하면 꺼져요. 이 기능은 봇에 Spotify 자격 증명이 설정되어 있어야 동작해요. 자격 증명이 없으면 자동 재생은 아무 일도 하지 않아요.

## 재생목록

`saveplaylist <name>`은 현재 대기열을 서버별로 이름을 붙여 저장하고, 저장한 사람을 작성자로 기록해요. `loadplaylist <name> [true]`는 재생목록을 대기열 끝에 추가하고, `true`를 주면 대기열을 교체해요. 재생 중인 곡이 없으면 바로 재생을 시작해요. 곡은 불러올 때 YouTube에서 다시 찾기 때문에, 더 이상 존재하지 않는 항목은 조용히 건너뛰어요. `playlists`는 저장된 재생목록을 곡 수와 작성자와 함께 보여주고, `deleteplaylist <name>`은 하나를 삭제해요.

## 오디오 필터

필터는 실행 중인 플레이어에 적용되며, 봇이 음성 채널에서 나가면 초기화돼요.

| 명령어 | 효과 |
| --- | --- |
| `bass <0..1>` | 낮은 주파수를 강조해요. 0이면 꺼져요 |
| `nightcore [on/off]` | 더 빠르고 높은 음으로 바꿔요 |
| `vaporwave [on/off]` | 더 느리고 낮은 음으로 바꿔요 |
| `karaoke [on/off]` | 가운데 위치한 보컬을 줄여요 |
| `tremolo [on/off]` | 볼륨을 흔들리게 해요 |
| `vibrato [on/off]` | 음높이를 흔들리게 해요 |
| `eightd [on/off]` | 소리가 듣는 사람 주위를 돌아요 |
| `distortion [on/off]` | 왜곡 효과를 줘요 |
| `stereowiden [on/off]` | 스테레오 이미지를 넓혀요 |

`activefilters`는 켜진 필터 목록을 보여주고, `resetfilters`는 모든 필터를 꺼요. 대시보드의 **재생 중** 카드에는 베이스 부스트, 나이트코어, 바포웨이브, 가라오케, 트레몰로, 비브라토, 8D 회전, 왜곡을 켜고 끄는 토글 버튼이 있어요.

## 음악 링크 변환

설정된 채널에 Apple Music, Spotify, YouTube Music, YouTube, Amazon Music, Deezer, Tidal, Pandora, SoundCloud 링크를 올리면, 봇이 곡 제목, 아티스트, 앨범 아트와 함께 같은 곡의 다른 제공처 링크를 담은 임베드로 답장해요. `musiclinkchannel [#channel]`(서버 관리 권한 필요)로 채널마다 켜고 끄며, `musiclinkchannels`로 목록을 확인해요. 대시보드에서는 음악 설정 탭의 **음악 링크 변환** 섹션에서 설정해요.

## 음성 변환(TTS)

TTS는 봇이 들어가 있는 음성 채널에서 메시지를 소리 내어 읽어 줘요. 스태프는 음성 채널마다 TTS를 켜요. 해당 음성 채널의 멤버가 음성 채널 채팅이나 연결된 텍스트 채널에 보낸 메시지가 대기열에 들어가 읽혀요. 메시지를 읽는 동안 음악 볼륨은 15%로 줄고, 끝나면 다시 올라와요. 기본 대기열은 메시지 10개까지 담아요.

멤버는 `ttsvoice <name>`으로 자신의 음성을 고르고, `ttsvoices [search]`로 음성을 찾아볼 수 있어요. 스태프는 기본 음성, 속도(대시보드에서는 0.5~3.0, 명령어로는 0.5~2.0), 볼륨, 필수 역할, 입장 및 퇴장 알림과 그 형식을 설정하고, 특정 사용자를 차단할 수 있어요. 대시보드의 **TTS 설정** 탭에도 같은 설정이 있으며, **일반 TTS 설정**, **TTS 동작**, **음성 채널 TTS**, **TTS 차단 사용자**로 나뉘어 있어요.

## Last.fm

멤버는 대시보드의 `/me` 페이지에서 Last.fm 계정을 연결할 수 있어요(`lastfmlink`는 연결 버튼을 보내요). 계정을 연결하면, 봇이 30초 이상 재생한 곡이 계정에 스크로블돼요. `lastfmtoggle`은 스크로블을 일시 중지하거나 다시 시작하고, `lastfmstatus`는 현재 상태를 보여줘요. 계정을 연결한 누구나 `fm` 계열 명령어를 쓸 수 있어요. 기간별 최근 곡, 상위 아티스트, 앨범, 트랙 목록, 아티스트와 앨범 조회, 서버 안의 "누가 제일 많이 들었나요?" 순위, 왕관 기록, 취향 비교, 차트 콜라주를 확인할 수 있어요.

## 설정

대시보드 페이지에는 **음악 설정**과 **TTS 설정** 두 개의 탭이 있어요. 음악 탭에는 봇이 재생 중일 때 대기열 길이, 섞기와 지우기 버튼, 반복 모드 버튼, 필터 토글이 있는 **재생 중** 카드도 나와요.

| 설정 | 기본값 | 역할 |
| --- | --- | --- |
| 기본 볼륨 | 100 | 시작 볼륨이에요. 0~100 사이이며, `volume` 명령어도 여기에 저장해요 |
| 음악 채널 | 모든 채널 | 현재 재생 중 및 대기열 알림을 올릴 채널이에요 |
| DJ 역할 | DJ 역할 없음 | 즉시 건너뛸 수 있고 투표 건너뛰기를 우회하는 역할이에요 |
| 반복 모드 | 없음 | 없음, 단일 트랙, 대기열 중에서 고를 수 있어요 |
| 자동 연결 해제 | 안 함 | 안 함, 음성 채널이 비었을 때, 대기열이 비었을 때, 또는 둘 중 하나일 때 중에서 고를 수 있어요 |
| 비슷한 곡 자동 재생 | 사용 안 함 | 대기열이 비면 관련 곡을 추가해요. 명령어로는 최대 5곡까지 설정할 수 있어요 |
| 투표 건너뛰기 활성화 | 끔 | 플레이어 하단에 투표 건너뛰기 기준을 표시해요 |
| 투표 건너뛰기 기준 | 백분율, 1~100 | 표시되는 값이에요. `voteskip` 명령어 자체는 항상 70%가 필요해요 |
| 음악 링크 채널 | 없음 | 음악 링크에 제공처 간 임베드를 보여줄 채널이에요 |
| TTS 볼륨 | 100 | 읽는 메시지의 음량이에요 |
| TTS 속도 | 1.0 | 0.5~3.0 사이예요 |
| 최대 대기열 크기 | 10 | 대기 중인 TTS 메시지 수예요. 1~50 사이예요 |
| 기본 음성 | 제공처 기본값 | 멤버가 음성을 고르지 않았을 때 쓰는 음성이에요 |
| 필수 역할 | 필수 역할 없음 | 이 역할이 있는 멤버만 TTS를 쓸 수 있어요. 관리자는 항상 쓸 수 있어요 |
| 답장 맥락 | 끔 | 답장 전에 "~님에게 답장"을 읽어 줘요 |
| 첨부 파일 설명 | 끔 | 전송된 이미지, 동영상, 파일을 알려 줘요 |
| 연속 메시지 묶기 | 끔 | 같은 멤버가 연달아 메시지를 보내면 이름을 생략해요 |
| 음성 채널 TTS | 없음 | 음성 채널마다 사용 여부, 연결된 텍스트 채널, 입장 및 퇴장 알림과 형식을 설정해요 |
| TTS 차단 사용자 | 없음 | 메시지를 읽지 않을 멤버 목록이에요 |

> [!NOTE]
> 대시보드에서 설정한 반복 모드는 다음 플레이어부터 적용돼요. `loop` 명령어는 실행 중인 플레이어를 바로 바꿔요.

## 설정 방법

1. 봇이 사용할 음성 채널에서 **연결**과 **말하기** 권한을 가지고 있는지 확인하세요.
2. 대시보드에서 **음악**을 열어 **음악 채널**을 설정하세요. 그러면 재생 중 임베드가 일반 채팅에 올라오지 않아요.
3. 자유롭게 건너뛸 수 있는 사람들을 위해 **DJ 역할**을 고르세요.
4. **기본 볼륨**을 50 정도로 설정하세요. 100은 꽤 커요.
5. 음성 채널에 들어가서 `play never gonna give you up`을 실행하고 결과를 고른 뒤, `queue`와 `nowplaying`을 실행해 보세요.
6. 곡을 대기열에 넣어서 자주 듣는 재생목록을 만들고, `saveplaylist chill`을 실행하세요.
7. TTS를 쓰려면 **TTS 설정**으로 바꾸고, **음성 채널 TTS**에 음성 채널을 추가한 뒤, 멤버가 `ttsvoice`로 음성을 고르게 하세요.

## 명령어

이 명령어는 서버 접두사로 실행하세요(변경하지 않았다면 `.`이에요).

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `join` | `j`, `mv` | 없음 | 내 음성 채널에 들어가요 |
| `leave` | `disconnect`, `d` | 없음 | 나가고 대기열을 비워요 |
| `play <link or search>` | `p`, `start` | 없음 | 대기열에 넣고 재생해요 |
| `play <number>` | `p`, `start` | 없음 | 대기열의 해당 위치로 이동해요 |
| `search <query>` | `find` | 없음 | 재생하지 않고 결과 10개를 보여줘요 |
| `pause` | | 없음 | 일시 중지하거나 다시 재생해요 |
| `nowplaying` | `np` | 없음 | 현재 곡을 보여줘요 |
| `queue` | `q`, `yq`, `enqueue` | 없음 | 대기열을 보여줘요 |
| `skip` | `next`, `n` | 없음 | 현재 곡을 건너뛰어요 |
| `voteskip` | `vskip` | 없음 | 건너뛰기에 투표해요. DJ 역할이 있으면 즉시 건너뛰어요 |
| `songremove <number>` | `trackremove`, `srm` | 없음 | 대기열 항목을 삭제해요 |
| `movesong <from> <to>` | `ms`, `move` | 없음 | 대기열 순서를 바꿔요 |
| `shuffle` | `playlistshuffle`, `sh`, `plsh` | 없음 | 다음에 재생할 곡을 섞어요 |
| `clearqueue` | `cq` | 없음 | 대기열을 비우고 재생을 멈춰요 |
| `volume <0..100>` | `vol` | 없음 | 볼륨을 설정하고 저장해요 |
| `seek <mm:ss>` | | 없음 | 현재 곡의 해당 시점으로 이동해요 |
| `loop <none|track|queue>` | `queuerepeat`, `qrp`, `rpl` | 없음 | 반복 모드를 설정해요 |
| `autoplay <0..5>` | `ap` | 없음 | 대기열이 비면 관련 곡을 재생해요 |
| `setdjrole [role]` | `djrole` | 서버 관리 | DJ 역할을 설정하거나 해제해요 |
| `setmusicchannel [#channel]` | `smch` | 없음 | 플레이어 알림을 올릴 채널을 정해요 |
| `musicsettings` | `msettings` | 없음 | 자동 재생, 볼륨, 반복, 채널을 보여줘요 |
| `musiclinkchannel [#channel]` | | 서버 관리 | 채널의 음악 링크 변환을 켜고 꺼요 |
| `musiclinkchannels` | | 없음 | 음악 링크 변환 채널 목록을 보여줘요 |
| `saveplaylist <name>` | `saveplist` | 없음 | 대기열을 저장해요 |
| `loadplaylist <name> [clear]` | `loadplist` | 없음 | 재생목록을 불러와요. `true`를 주면 대기열을 교체해요 |
| `playlists` | `playlistshow`, `plshow` | 없음 | 저장된 재생목록을 보여줘요 |
| `deleteplaylist <name>` | `delplist` | 없음 | 재생목록을 삭제해요 |
| `bass [0..1]` | | 없음 | 베이스 부스트 |
| `nightcore [on/off]` | `nc` | 없음 | 나이트코어 필터 |
| `vaporwave [on/off]` | `vw` | 없음 | 바포웨이브 필터 |
| `karaoke [on/off]` | | 없음 | 가라오케 필터 |
| `tremolo [on/off]` | | 없음 | 트레몰로 필터 |
| `vibrato [on/off]` | | 없음 | 비브라토 필터 |
| `eightd [on/off]` | `8d` | 없음 | 8D 회전 필터 |
| `distortion [on/off]` | | 없음 | 왜곡 필터 |
| `stereowiden [on/off]` | `swiden` | 없음 | 스테레오 확장 |
| `resetfilters` | `resetfx` | 없음 | 모든 필터를 꺼요 |
| `activefilters` | `activefx` | 없음 | 켜진 필터를 보여줘요 |
| `lastfmlink` | `lflink` | 없음 | Last.fm 연결 버튼을 받아요 |
| `lastfmunlink` | `lfunlink` | 없음 | Last.fm 연결을 해제해요 |
| `lastfmtoggle` | `lftoggle` | 없음 | 스크로블을 일시 중지하거나 다시 시작해요 |
| `lastfmstatus` | `lfstatus` | 없음 | Last.fm 연결 상태를 보여줘요 |
| `fm [user]` | | 없음 | 지금 듣는 곡이나 마지막 스크로블을 보여줘요 |
| `fmrecent [user]` | `fmr` | 없음 | 최근 스크로블을 보여줘요 |
| `fmtopartists [period] [user]` | `fmta` | 없음 | 상위 아티스트를 보여줘요 |
| `fmtopalbums [period] [user]` | `fmtal` | 없음 | 상위 앨범을 보여줘요 |
| `fmtoptracks [period] [user]` | `fmtt` | 없음 | 상위 트랙을 보여줘요 |
| `fmartist [artist]` | `fma` | 없음 | 아티스트 정보와 내 재생 횟수를 보여줘요 |
| `fmalbum [query]` | `fmal` | 없음 | 앨범 정보를 보여줘요 |
| `fmwhoknows [artist]` | `whoknows`, `wk` | 없음 | 아티스트 서버 순위를 보여줘요 |
| `fmwhoknowsalbum <query>` | `whoknowsalbum`, `wka` | 없음 | 앨범 서버 순위를 보여줘요 |
| `fmwhoknowstrack <query>` | `whoknowstrack`, `wkt` | 없음 | 트랙 서버 순위를 보여줘요 |
| `fmcrowns [artist]` | `crowns` | 없음 | 아티스트 왕관 기록을 보여줘요 |
| `fmtaste <user>` | `taste` | 없음 | 다른 멤버와 취향을 비교해요 |
| `fmchart [size] [period] [user]` | `chart` | 없음 | 앨범 아트 콜라주를 만들어요 |
| `ttsenable` | `tts`, `ttson` | 서버 관리 | 내 음성 채널에서 TTS를 켜요 |
| `ttsremove` | `ttsoff` | 서버 관리 | 내 음성 채널에서 TTS를 꺼요 |
| `ttslink [#channel]` | `ttschannel` | 서버 관리 | 텍스트 채널을 음성 채널에 연결해요 |
| `ttsannounce` | `ttsjoinleave` | 서버 관리 | 입장 및 퇴장 알림을 켜고 꺼요 |
| `ttsjoinformat [text]` | `ttsjoin` | 서버 관리 | 입장 알림 문구를 설정해요 |
| `ttsleaveformat [text]` | `ttsleave` | 서버 관리 | 퇴장 알림 문구를 설정해요 |
| `ttsvolume <0..100>` | `ttsvol` | 서버 관리 | TTS 음량을 설정해요 |
| `ttsspeed <0.5..2>` | | 서버 관리 | TTS 속도를 설정해요 |
| `ttsdefaultvoice [voice]` | `ttsdefvoice` | 서버 관리 | 서버 기본 음성을 설정해요 |
| `ttsvoice [voice]` | | 없음 | 내 음성을 설정해요 |
| `ttsvoices [search]` | `ttsvoicelist`, `ttsvoicesearch` | 없음 | 음성을 찾아봐요 |
| `ttsblock <user>` | `ttsban` | 서버 관리 | 멤버의 TTS 차단을 켜고 꺼요 |
| `ttsblocklist` | `ttsbanlist`, `ttsblocked` | 서버 관리 | 차단된 멤버 목록을 보여줘요 |
| `ttsrole [role]` | | 서버 관리 | TTS에 필요한 역할을 설정해요 |
| `ttsreplycontext` | `ttsreply` | 서버 관리 | 답장 맥락을 켜고 꺼요 |
| `ttsattachmentnarration` | `ttsattach` | 서버 관리 | 첨부 파일 설명을 켜고 꺼요 |
| `ttsconsecutivegrouping` | `ttsgroup` | 서버 관리 | 연속 메시지의 이름 생략을 켜고 꺼요 |
| `ttsmaxqueue <1..50>` | `ttsqueue` | 서버 관리 | 대기 TTS 메시지 한도를 설정해요 |
| `ttssettings` | `ttsinfo` | 서버 관리 | TTS 설정을 보여줘요 |

## 팁과 주의 사항

- 봇에는 음성 채널의 **연결**과 **말하기** 권한, 그리고 알림을 올릴 음악 채널의 **메시지 보내기** 권한이 필요해요.
- 대부분의 명령어는 먼저 내가 음성 채널에 있는지, 그리고 그 채널이 봇이 있는 채널인지 확인해요.
- `volume`으로 설정한 값은 서버 기본값으로 저장돼요. 그래서 밤늦게 10으로 낮춰 두면 다음 날의 시작 볼륨도 10이 돼요.
- Spotify 재생목록은 곡마다 YouTube 검색으로 바꿔서 처리하기 때문에, 긴 목록은 시간이 걸리고 일부 곡은 잘못 매칭될 수 있어요.
- 저장된 재생목록에는 오디오가 아니라 링크가 저장돼요. YouTube에서 영상이 삭제되면 불러올 때 그 항목은 건너뛰어요.
- 투표 건너뛰기는 채널에 있는 사람만 세요. 혼자 있는 채널이라면 내 투표만으로 충분해요.
- TTS는 음성 채널에 있는 멤버의 메시지만 읽어요. 텍스트로만 지켜보는 사람은 TTS를 작동시킬 수 없어요.

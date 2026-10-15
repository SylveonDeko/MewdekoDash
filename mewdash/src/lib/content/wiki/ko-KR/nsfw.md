---
title: NSFW
slug: nsfw
summary: NSFW로 표시된 채널에서만 동작하는 성인 이미지 명령어예요. 서버별 태그 차단 목록과 선택 사항인 주기적 자동 게시를 지원해요.
icon: fa-eye-slash
category: Entertainment
module: Nsfw
tags: [nsfw, hentai, booru, rule34, e621, danbooru, gelbooru, nhentai, reddit, tag blacklist, autohentai, nsfwtoggle, NSFW, 성인 이미지, 이미지 게시판, 태그 차단 목록, 자동 게시, 채널 설정]
related: [servermanagement, permissions, filter]
---

## 기능 소개

NSFW 모듈은 요청하면 이미지 게시판과 Reddit에서 성인 이미지를 가져와요. 이 모듈의 모든 명령어에는 Discord의 NSFW 요구 사항이 적용돼요. 즉 NSFW 표시가 켜진 채널에서만 실행되고, 대부분의 이미지 게시판 명령어는 봇과의 DM에서도 동작해요. 다른 채널에서는 명령어가 조용히 거부돼요.

스태프는 두 가지를 관리할 수 있어요. `nsfwtoggle`(관리 모듈에 있어요)은 현재 채널의 NSFW 표시를 켜거나 꺼요. 이 표시가 있어야 해당 채널에서 이 명령어들을 쓸 수 있어요. `nsfwtagbl`은 이 서버의 모든 이미지 게시판 검색에서 제외할 태그 목록을 관리해요. 그래서 서버는 모듈을 켜 두고도 원하지 않는 콘텐츠를 막을 수 있어요.

멤버는 출처 명령어에 선택적으로 태그를 붙여 실행하고, 등급, 출처, 처음 몇 개의 태그와 함께 이미지 하나를 받아요. "bomb" 변형은 한 번에 네 개를 보내요. 운영자는 타이머를 설정해서 일정 간격마다 채널에 새 이미지가 올라오게 할 수도 있어요.

## 이런 용도로 써요

- 18세 이상 서버에서 이미지 명령어를 표시된 채널에만 제한할 때.
- 모듈을 끄지 않고 스태프가 특정 태그를 서버 전체에서 막고 싶을 때.
- 전용 채널에 아무도 입력하지 않아도 주기적으로 새 이미지가 올라오게 하고 싶을 때.

## 채널 요구 사항

Discord의 NSFW 표시는 채널마다 따로 설정돼요. 채널에서 `nsfwtoggle`을 실행해서 켜거나 끌 수 있으며, 실행하려면 나와 봇 모두에게 채널 관리 권한이 필요해요. 봇은 새 상태를 확인하는 답장을 보내요. 같은 표시는 Discord의 채널 설정에서도 바꿀 수 있어요.

NSFW가 아닌 채널에서 명령어를 쓰면 아무 일도 일어나지 않아요. 멤버는 이것을 봇이 고장 났다고 오해하기도 하니, 규칙 채널에 안내를 적어 두면 도움이 돼요.

## 출처

| 명령어 | 출처 | 참고 |
| --- | --- | --- |
| `hentai [tags]` | 통합 게시판, 명시적 콘텐츠만 | 5초 쿨다운 |
| `yandere`, `konachan`, `sankaku`, `e621`, `rule34`, `danbooru`, `gelbooru`, `derpibooru`, `safebooru`, `realbooru` | 지정한 게시판 | 각각 선택적으로 태그를 받아요 |
| `hentaibomb [tags]` | Yandere, Danbooru, Konachan, Gelbooru | 한 번에 이미지 4개 |
| `pornbomb [tags]` | Realbooru | 한 번에 이미지 4개 |
| `redditnsfw <subreddit>` | 해당 서브레딧의 무작위 상위 게시물 | 10초 쿨다운 |
| `boobs`, `butts` | `redditnsfw`를 통해 고정된 서브레딧 | |
| `pussy`, `anal`, `porn`, `bondage`, `hentaigif` | 카테고리 엔드포인트 | NSFW 채널에서만, DM 불가 |
| `nhentai <id>` | 번호로 지정한 특정 갤러리 | lolicon 또는 shotacon 태그가 붙은 갤러리는 거부해요 |
| `nhentaisearch <query> [page] [type] [blacklist]` | 갤러리 검색 | |

태그는 공백으로 구분해요. e621과 Derpibooru에서는 `yuri` 태그가 해당 게시판의 동등한 태그로 자동 변환돼요. `hentaibomb`과 `pornbomb`은 서버마다 한 번에 하나만 실행할 수 있어요.

## 태그 차단 목록

`nsfwtagbl`을 인수 없이 실행하면 차단된 태그 목록이 나와요. `nsfwtagbl <tag>`는 태그를 추가하고, 이미 목록에 있으면 제거해요. 차단된 태그가 붙은 결과는 이 서버의 모든 이미지 게시판 명령어에서 건너뛰어요. 메시지 관리 권한이 필요해요.

## 자동 게시

`autohentai <seconds> [tags]`, `autoboobs <seconds>`, `autobutts <seconds>`는 현재 채널에서 타이머를 시작해요. 간격은 `autohentai`와 `autobutts`에서 최소 20초여야 하고, `autoboobs`에는 최소 간격이 없어요. `0`을 입력하거나 간격을 입력하지 않고 실행하면 해당 채널의 타이머를 멈춰요. `autohentai`에서는 대체 태그 세트를 `|`로 구분하면 봇이 매번 무작위로 하나를 골라요. 태그를 생략하면 무작위 이미지를 가져와요. 이 명령어들은 메시지 관리 권한이 필요하고, 채널이 NSFW여야 해요. 타이머는 봇을 다시 시작하면 유지되지 않아요.

## 설정

이 모듈에는 대시보드 페이지가 없어요.

| 설정 | 기본값 | 제어 내용 |
| --- | --- | --- |
| 채널 NSFW 표시 | 끔 | 채널에서 이 명령어들을 실행할 수 있는지 정해요 |
| 태그 차단 목록 | 비어 있음 | 이 서버에서 이미지 게시판 결과에서 제외할 태그예요 |
| 자동 게시 타이머 | 없음 | `auto...` 명령어로 채널별로 시작한 타이머예요 |

## 설정 순서

1. 채널을 고르고 그 채널에서 `nsfwtoggle`을 실행하거나, Discord의 채널 설정에서 표시를 켜요.
2. 권한 설정으로 다른 곳에서는 모듈을 사용하지 못하게 해요. 예를 들어 `srvrmdl nsfw disable`을 실행한 뒤 `chnlmdl nsfw enable #adult`를 실행해요.
3. 원하지 않는 태그는 `nsfwtagbl <tag>`로 하나씩 추가해요.
4. 채널에서 `hentai`나 `rule34 <tag>`로 테스트해요.
5. 필요하면 `autohentai 300 <tags>`로 자동 게시를 시작하고, `autohentai 0`으로 나중에 멈춰요.

## 명령어

서버 접두사(변경하지 않았다면 `.`)를 붙여서 실행해요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | 채널 관리 | 현재 채널의 NSFW 표시를 토글해요 |
| `nsfwtagbl [tag]` | `nsfwtbl` | 메시지 관리 | 차단 태그를 보거나, 추가하거나, 제거해요 |
| `hentai [tags]` | | 없음 | 통합 게시판에서 명시적 이미지 하나를 가져와요 |
| `hentaibomb [tags]` | | 없음 | 게시판 4곳에서 이미지 4개를 가져와요 |
| `pornbomb [tags]` | | 없음 | Realbooru 이미지 4개를 가져와요 |
| `yandere [tags]` | | 없음 | Yande.re |
| `konachan [tags]` | | 없음 | Konachan |
| `sankaku [tags]` | | 없음 | Sankaku |
| `e621 [tags]` | | 없음 | e621 |
| `rule34 [tags]` | `r34` | 없음 | Rule34 |
| `danbooru [tags]` | | 없음 | Danbooru |
| `gelbooru [tags]` | | 없음 | Gelbooru |
| `derpibooru [tags]` | `derpi` | 없음 | Derpibooru |
| `safebooru [tags]` | | 없음 | Safebooru |
| `realbooru [tags]` | `rb` | 없음 | Realbooru |
| `redditnsfw <subreddit>` | `nsfwsubreddit` | 없음 | 서브레딧의 무작위 게시물 |
| `boobs` | | 없음 | Reddit 바로가기 |
| `butts` | `ass`, `butt` | 없음 | Reddit 바로가기 |
| `pussy` | | 없음 | 카테고리 이미지 |
| `anal` | | 없음 | 카테고리 이미지 |
| `porn` | | 없음 | 카테고리 이미지 |
| `bondage` | | 없음 | 카테고리 이미지 |
| `hentaigif` | | 없음 | 카테고리 GIF |
| `nhentai <id>` | `nh` | 없음 | 번호로 갤러리를 봐요 |
| `nhentaisearch <query> [page] [type] [blacklist]` | `nhsearch`, `nhs` | 없음 | 갤러리를 검색해요 |
| `autohentai [seconds] [tags]` | | 메시지 관리 | 시간 간격으로 게시해요. `0`이면 멈춰요 |
| `autoboobs [seconds]` | | 메시지 관리 | 시간 간격으로 게시해요. `0`이면 멈추고, 최소 간격은 없어요 |
| `autobutts [seconds]` | | 메시지 관리 | 시간 간격으로 게시해요. `0`이면 멈춰요 |

## 팁과 주의 사항

- 연령 제한은 Discord의 채널 표시와 봇의 태그 차단 목록으로 이뤄져요. 봇은 멤버의 나이나 역할을 확인하지 않으니, 그 기능은 명령어 권한으로 설정하세요.
- 봇 소유자는 모듈을 전역에서 끌 수도 있어요. 이 경우 도움말 메뉴에 차단된 것으로 표시돼요.
- 이미지 게시판은 요청 제한이 걸리거나, 범위가 좁은 태그 조합에는 결과가 없을 때가 있어요. 그때 봇은 이미지를 찾지 못했다고 답장해요.
- 타이머는 채널별로 메모리에 저장돼요. 봇을 다시 시작한 뒤에는 다시 시작해야 해요.

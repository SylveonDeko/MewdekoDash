---
title: 건의
slug: suggestions
summary: 멤버가 아이디어를 제출할 채널이나 버튼을 만들고, 서버가 투표하게 하고, 스태프가 각 건의를 사유와 함께 수락, 거부, 검토 또는 구현으로 처리할 수 있어요.
icon: fa-lightbulb
category: Community
dashboard: /dashboard/suggestions
module: Suggestions
tags: [suggestions, ideas, feedback, voting, accept, deny, consider, implement, threads, suggest button, placeholders, 건의, 아이디어, 피드백, 투표, 수락, 거부, 검토, 구현, 스레드, 건의 버튼, 자리표시자]
related: [administration, afk]
---

## 기능 소개

멤버는 `suggest` 명령어로 아이디어를 보내거나, 건의 채널에 바로 입력하거나, **Suggest Here!** 버튼을 누르고 양식을 작성할 수 있어요. 봇은 원본 메시지를 삭제하고, 건의 채널에 번호가 붙은 건의 임베드를 게시한 뒤 투표용 이모지를 반응이나 버튼으로 추가해요. 각 건의에는 스태프가 나중에 참조할 번호가 붙어요.

스태프는 건의를 수락, 거부, 검토 또는 구현의 네 가지 상태로 바꿀 수 있어요. 각 상태 변경에는 선택 사항인 사유를 함께 남길 수 있어요. 봇은 원본 건의 메시지를 상태 색상이 적용된 임베드로 수정하고, 건의한 멤버에게 결과를 DM으로 보내며, 상태별로 지정한 별도 채널에 상태 임베드를 다시 게시할 수 있어요. 덕분에 수락된 아이디어와 거부된 아이디어를 각각 한곳에서 모아볼 수 있어요.

선택 사항으로 모든 건의에 **Join/Create Discussion** 버튼을 붙일 수 있어요. 이 버튼을 누르면 건의 아래에 공개 또는 비공개 스레드가 열려요. 스태프가 상태를 바꾸면 스레드를 자동으로 보관 처리할 수도 있어요.

## 사용하면 좋은 이유

- 답글 사이에서 아이디어가 묻히기 쉬운 피드백 채널에 적합해요. 각 건의가 투표 수가 표시된 개별 메시지가 돼요.
- 어떤 아이디어가 수락되고 거부되었는지, 그 이유가 무엇인지 스태프가 공지를 따로 쓰지 않아도 멤버가 확인할 수 있어요.
- 주 채널에서 논쟁하는 대신, 스레드로 아이디어마다 따로 토론하려는 서버에 좋아요.
- 건의 번호를 외우지 않고, 사유 입력란이 있는 대시보드에서 건의를 분류하려는 스태프에게 유용해요.

## 건의 제출 방법

건의를 보내는 방법은 세 가지예요. 세 방법 모두 같은 길이 검사를 거쳐 건의 채널에 게시돼요.

| 방법 | 동작 |
| --- | --- |
| `suggest <text>` | 명령어 메시지를 삭제하고 건의를 게시해요. 어느 채널에서든 사용할 수 있어요. |
| 건의 채널에 입력 | 봇이 아닌 멤버가 접두사 없이 보낸 메시지는 모두 건의로 바뀌고, 원본은 삭제돼요. 서버의 스태프 역할을 가진 멤버는 제외되어 평소처럼 대화할 수 있어요. |
| 건의 버튼 | **Suggest Button Channel**에 있는 버튼 메시지예요. 버튼을 누르면 설정한 길이 제한이 적용된 양식이 열려요. |

텍스트가 **Maximum Length**보다 길거나 **Minimum Length**보다 짧으면 거부돼요. 명령어로 제출한 경우 오류가 채널에 표시되고 5초 후에 삭제돼요. 건의 채널에 직접 입력한 경우 메시지가 삭제되고 멤버에게 DM으로 알려요. 게시된 임베드에서는 건의 안의 멘션이 무력화되고, 멤버에게는 건의가 전송되었다고 알려요.

기본 건의 임베드는 멤버를 작성자로 표시하고, "Suggestion #N"이라는 제목과 텍스트를 설명으로 사용해요. 아래 자리표시자 섹션을 참고해서 직접 만든 임베드로 바꿀 수 있어요.

### 건의 버튼

버튼 메시지는 **Suggest Button Channel**에 게시되고, 봇이 항상 맨 아래에 두도록 관리해요. 다른 메시지가 올라와 버튼이 위로 밀리면 봇이 버튼 메시지를 삭제하고 다시 게시해요. 기본 레이블은 이모지 없이 **Suggest Here!**이고 색상은 blurple이에요. 버튼 위의 메시지는 일반 텍스트나 임베드 코드를 사용할 수 있고, 기본값은 짧은 "건의를 작성해 주세요" 안내 문구예요.

## 투표

기본적으로 각 건의에는 👍와 👎가 붙어요. `suggestmotes` 명령어나 **사용자 지정 이모지** 선택기로 최대 5개의 사용자 지정 이모지를 대신 설정할 수 있어요. 봇이 해당 이모지를 사용할 수 있어야 해요.

**이모지 표시 모드**에서 투표 방식을 정해요.

| 모드 | 동작 |
| --- | --- |
| 반응 (기본값) | 봇이 이모지를 반응으로 추가해요. 반응이 추가되거나 제거될 때마다 집계가 갱신돼요. |
| 버튼 | 이모지가 실시간 투표 수가 표시되는 버튼으로 바뀌어요. 멤버는 건의마다 한 표만 행사할 수 있어요. 같은 버튼을 다시 누르면 투표 취소를, 다른 버튼을 누르면 투표 변경을 확인하는 창이 떠요. |

버튼 모드에서는 이모지 버튼 5개마다 색상을 따로 지정할 수 있어요(**Emote 1 Button**부터 **Emote 5 Button**까지). 색상은 Blue, Grey, Green, Red 중에서 고를 수 있어요. 색상을 바꾸면 건의 버튼 메시지도 함께 새로 고쳐져요.

`suggestinfo <number>`는 건의 텍스트, 작성자, 현재 상태, 마지막으로 상태를 바꾼 스태프, 상태가 바뀐 횟수, 이모지별 투표 수를 보여줘요. 그 아래에는 Accept, Deny, Consider, Implement 버튼이 함께 표시돼요.

## 상태

모든 건의는 Suggested 상태로 시작해요(대시보드에서는 Pending으로 표시돼요). 메시지 관리 권한이 있는 스태프는 `accept`, `deny`, `consider`, `implemented` 명령어나 `suggestinfo`의 버튼, 또는 대시보드에서 건의를 네 가지 상태 중 하나로 바꿀 수 있어요. 사유와 함께 상태를 바꾸면 사유가 표시되고, 사유를 쓰지 않으면 "none"으로 표시돼요.

| 상태 | 임베드 색상 | 추가 옵션 |
| --- | --- | --- |
| 수락 (Accepted) | Blue | 수락 채널, 수락 메시지, 수락 시 보관 |
| 거부 (Denied) | Red | 거부 채널, 거부 메시지, 거부 시 보관 |
| 검토 (Considered) | Gold | 검토 채널, 검토 메시지, 검토 시 보관 |
| 구현 (Implemented) | Green | 구현 채널, 구현 메시지, 구현 시 보관 |

상태가 바뀌면 봇은 다음 순서로 작업해요.

1. 해당 상태의 보관 토글이 켜져 있으면 토론 스레드를 보관해요.
2. 건의 채널의 원본 메시지를 상태 임베드로 수정하고 모든 반응을 제거해요. 원본 메시지가 없어졌다면 새 메시지를 게시해요.
3. 건의한 멤버에게 건의, 사유, 변경한 스태프를 담은 임베드를 DM으로 보내요. 스태프에게는 DM이 전송되었는지, 아니면 멤버가 DM을 꺼 두었는지 알려줘요.
4. 새 상태와 변경한 스태프를 기록해요.
5. 해당 상태에 채널이 지정되어 있으면 그 채널에 상태 임베드를 게시하고, 이 건의의 이전 상태 메시지는 삭제해요. 그래서 검토에서 수락으로 바뀐 건의가 오래된 복사본을 남기지 않아요.

건의는 원하는 만큼 여러 상태 사이를 오갈 수 있어요. 건의를 다시 Pending으로 되돌리는 명령어는 없어요.

### 상태 메시지

기본 상태 임베드는 건의한 멤버를 작성자로 표시하고, "Suggestion #12 Accepted" 같은 제목, 건의 텍스트를 설명으로, **사유** 필드를 포함해요. `acceptmessage`, `denymessage`, `considermessage`, `implementmessage` 명령어나 대시보드 **메시지** 탭의 네 가지 편집기로 직접 설정할 수 있어요. 기본값으로 되돌리려면 `-`를 입력하세요. 사용자 지정 텍스트는 임베드 파서를 거쳐요. 올바른 임베드 코드가 아니면 설명 텍스트로 사용돼요.

## 자리표시자

건의 메시지(제출 시 게시되는 메시지)는 아래 자리표시자와 자리표시자 페이지의 일반 서버 자리표시자를 지원해요.

| 자리표시자 | 값 |
| --- | --- |
| `%suggest.user%` | 건의한 멤버의 전체 사용자 이름 |
| `%suggest.user.name%` | 건의한 멤버의 사용자 이름 |
| `%suggest.user.avatar%` | 건의한 멤버의 아바타 URL |
| `%suggest.message%` | 멘션이 무력화된 건의 텍스트 |
| `%suggest.number%` | 건의 번호 |

수락, 거부, 검토, 구현 메시지는 위의 모든 자리표시자와 일반 서버 자리표시자, 그리고 아래 추가 자리표시자를 지원해요.

| 자리표시자 | 값 |
| --- | --- |
| `%suggest.user.id%` | 건의한 멤버의 사용자 ID |
| `%suggest.mod.user%` | 상태를 바꾼 스태프의 전체 사용자 이름 |
| `%suggest.mod.name%` | 해당 스태프의 사용자 이름 |
| `%suggest.mod.avatar%` | 해당 스태프의 아바타 URL |
| `%suggest.mod.Id%` | 해당 스태프의 사용자 ID (대문자 I에 주의하세요) |
| `%suggest.mod.message%` | 입력한 사유, 없으면 "none" |
| `%suggest.emote1count%`부터 `%suggest.emote5count%`까지 | 변경 시점의 이모지별 투표 수 |

> [!EXAMPLE]
> 거부 메시지 예시: `Suggestion #%suggest.number% by %suggest.user% was denied by %suggest.mod.name%: %suggest.mod.message%`

## 스레드

**스레드 유형**을 설정하면 새 건의마다 버튼 줄이 하나 더 추가돼요.

| 유형 | 버튼 | 결과 |
| --- | --- | --- |
| No Threads (기본값) | 없음 | 토론 버튼이 없어요 |
| Regular Threads | Join/Create Public Discussion | 건의 메시지에 "Suggestion #N Discussion"이라는 공개 스레드를 만들어요 |
| Private Threads | Join/Create Private Discussion | 같은 스레드를 비공개로 만들어요 |

처음 버튼을 누르면 스레드가 만들어지고 건의한 멤버와 버튼을 누른 멤버가 추가돼요. 이후에 누르면 스레드가 이미 있다는 답장과 함께 스레드 링크가 나와요. 건의마다 스레드 하나만 추적하며, 네 가지 **Archive on** 토글은 해당 상태가 설정될 때 스레드를 보관해요. 스레드 유형을 바꾸면 이후에 게시되는 건의에만 적용돼요.

## 설정

대시보드 페이지에는 **건의**와 **설정** 탭이 있어요. **설정** 탭은 **일반**, **메시지**, **채널**, **보관**, **이모지**로 나뉘어 있어요.

| 설정 | 기본값 | 설명 |
| --- | --- | --- |
| Minimum Length | 설정 안 됨 | 허용되는 최소 건의 길이(글자 수). 2048 이상은 설정할 수 없고, 대시보드 입력란은 2000에서 멈춰요. |
| Maximum Length | 설정 안 됨 | 허용되는 최대 건의 길이. 0보다 커야 하고, 대시보드 입력란은 2000에서 멈춰요. |
| Thread Type | No Threads | 새 건의에 공개 또는 비공개 토론 버튼을 붙일지 설정해요 |
| Suggestion message | 기본 임베드 | 건의가 제출되었을 때 게시되는 임베드 |
| Accept / Deny / Consider / Implement message | 기본 임베드 | 상태별 상태 임베드 |
| Suggest Channel | 없음 (기능 꺼짐) | 건의가 게시되는 곳이자, 입력한 메시지가 건의로 바뀌는 곳 |
| Accept / Deny / Consider / Implement Channel | 없음 | 상태 임베드를 복사해 둘 추가 채널 |
| Archive on Accept / Deny / Consider / Implement | 꺼짐 | 해당 상태가 설정되면 토론 스레드 보관 |
| Emote Display Mode | 반응 | 투표에 반응 또는 버튼 사용 |
| Custom Emotes | 👍와 👎 | 투표에 사용할 이모지, 최대 5개 |
| Button Label | Suggest Here! | 건의 버튼의 텍스트 |
| Button Emote | 없음 | 건의 버튼의 이모지 |
| Button Message | 기본 안내 문구 | 건의 버튼 위에 게시되는 텍스트 또는 임베드 |
| Suggest Button Color | Blurple | 건의 버튼의 색상 |
| Emote 1 to 5 Button | Blurple | 버튼 모드에서 이모지별 투표 버튼 색상 |

> [!WARNING]
> **건의 채널**을 설정하기 전까지는 아무것도 작동하지 않아요. 그동안 `suggest`는 채널이 설정되지 않았다고 답하고, 오류 메시지는 3초 후에 삭제돼요.

**건의** 탭에는 모든 건의가 상태, 투표 수, 날짜와 함께 나열되며, 날짜나 상태로 정렬할 수 있어요. 각 카드에는 **수락**, **거부**, **검토**, **구현** 버튼과 선택 사항인 사유 입력란이 있고, **삭제** 버튼은 Discord 메시지를 건드리지 않고 데이터베이스의 기록만 삭제해요.

## 설정 순서

1. 대시보드에서 **건의**를 열고 **설정** 탭으로 이동해요.
2. **채널**에서 **건의 채널**을 골라요. 필요하다면 수락, 거부, 검토, 구현된 건의를 위한 채널을 따로 고를 수 있어요.
3. **일반**에서 **Minimum Length**와 **Maximum Length**를 설정해요(예: 10과 1000). 건의마다 토론을 열고 싶다면 **스레드 유형**도 고르세요.
4. **이모지**에서 **반응** 또는 **버튼**를 고르고, 필요하면 최대 5개의 **사용자 지정 이모지**를 설정해요. 건의 버튼을 쓰고 싶다면 여기서 레이블, 이모지, 메시지를 정한 뒤 Discord에서 `suggestbuttonchannel #channel`을 실행해 버튼을 게시하세요.
5. **보관**에서 토론을 닫아야 하는 상태의 보관 토글을 켜요.
6. 원한다면 **메시지**에서 위의 자리표시자를 사용해 상태 임베드를 꾸며요.
7. 저장한 뒤 테스트해요. `suggest test idea`를 실행하고, 투표해 보고, `accept 1 looks good`으로 상태 임베드와 DM이 잘 오는지 확인하세요.

## 명령어

명령어는 서버의 접두사(바꾸지 않았다면 `.`)와 함께 실행해요.

| 명령어 | 별칭 | 권한 | 용도 |
| --- | --- | --- | --- |
| `suggest <text>` | `suggestion` | 누구나 | 건의 제출 |
| `suggestinfo <number>` | `suginfo` | 메시지 관리 | 건의의 상세 정보, 투표 수, 상태 버튼 표시 |
| `accept <number> [reason]` | `suggestaccept`, `acceptsuggest` | 메시지 관리 | 건의를 수락 처리 |
| `deny <number> [reason]` | `suggestdeny`, `denysuggest` | 메시지 관리 | 건의를 거부 처리 |
| `consider <number> [reason]` | `suggestconsider`, `considersuggest` | 메시지 관리 | 건의를 검토 중으로 표시 |
| `implemented <number> [reason]` | `suggestimplement`, `implementsuggest` | 메시지 관리 | 건의를 구현 완료로 표시 |
| `setsuggestchannel [#channel]` | `suggestchannel`, `suggestchan` | 채널 관리 | 건의 채널을 설정하거나, 채널 없이 실행해 건의 기능을 끔 |
| `suggestclear` | `suggestreset`, `resetsuggestions`, `clearsuggestions` | 관리자 | 확인 후 모든 건의를 삭제하고 번호를 초기화 |
| `suggestmessage <text>` | `suggestmsg` | 관리자 | 사용자 지정 건의 임베드, `-`로 초기화 |
| `acceptmessage <text>` | `acceptmsg` | 관리자 | 사용자 지정 수락 임베드, `-`로 초기화 |
| `denymessage <text>` | `denymsg` | 관리자 | 사용자 지정 거부 임베드, `-`로 초기화 |
| `considermessage <text>` | `considermsg` | 관리자 | 사용자 지정 검토 임베드, `-`로 초기화 |
| `implementmessage <text>` | `implementmsg` | 관리자 | 사용자 지정 구현 임베드, `-`로 초기화 |
| `acceptchannel [#channel]` | | 관리자 | 수락된 건의를 보낼 채널, 없이 실행하면 끔 |
| `denychannel [#channel]` | | 관리자 | 거부된 건의를 보낼 채널, 없이 실행하면 끔 |
| `considerchannel [#channel]` | | 관리자 | 검토 중인 건의를 보낼 채널, 없이 실행하면 끔 |
| `implementchannel [#channel]` | | 관리자 | 구현된 건의를 보낼 채널, 없이 실행하면 끔 |
| `minsuggestionlength <number>` | `minsuggestlength` | 관리자 | 최소 글자 수, 2048보다 작아야 해요 |
| `maxsuggestionlength <number>` | `maxsuggestlength` | 관리자 | 최대 글자 수, 0보다 커야 해요 |
| `suggestmotes <emotes>` | `smotes`, `suggestemotes` | 관리자 | 투표 이모지 최대 5개, 기본 👍와 👎로 되돌리려면 `disable` |
| `suggestmotesmode <reactions/buttons>` | | 관리자 | 투표에 반응 또는 버튼 사용 |
| `suggestmotecolor <number> <colour>` | | 관리자 | 투표 버튼 1부터 5까지의 색상: `blurple`, `grey`, `green`, `red` 중 선택 |
| `suggestthreadstype <none/public/private>` | `suggestthreads` | 관리자 | 새 건의의 토론 스레드 유형 |
| `archiveonaccept` | | 관리자 | 수락 시 스레드 보관 토글 |
| `archiveondeny` | | 관리자 | 거부 시 스레드 보관 토글 |
| `archiveonconsider` | | 관리자 | 검토 시 스레드 보관 토글 |
| `archiveonimplement` | | 관리자 | 구현 시 스레드 보관 토글 |
| `suggestbuttonchannel <#channel>` | | 관리자 | 채널에 건의 버튼 게시 |
| `suggestbuttonmessage <text>` | | 관리자 | 건의 버튼 위의 텍스트 또는 임베드, `-`로 초기화 |
| `suggestbuttonlabel <text>` | | 관리자 | 버튼 레이블, 최대 80자, `-`로 초기화 |
| `suggestbuttonemote [emote]` | | 관리자 | 버튼 이모지, 없이 실행하면 초기화 |
| `suggestbuttoncolor <colour>` | | 관리자 | 건의 버튼 색상: `blurple`, `grey`, `green`, `red` 중 선택 |

슬래시 명령어는 `/suggestions`와 `/suggestions customize` 아래에 있어요.

## 팁과 주의 사항

- 봇이 원본 건의를 삭제하려면 건의 채널에서 **메시지 관리** 권한이 필요해요. 반응 모드에는 **반응 추가**가, 토론에는 **공개 스레드 만들기** 또는 **비공개 스레드 만들기** 권한이 필요해요. 상태 채널에는 **링크 첨부** 권한이 있어야 해요. 없으면 복사가 조용히 건너뛰어져요.
- 건의 채널을 열기 전에 길이 제한을 둘 다 설정하세요. 입력 메시지 방식은 제한을 벗어나는 메시지를 모두 삭제하므로, 최대 길이를 비워 두면 모든 메시지가 사라질 수 있어요.
- 관리(Administration) 설정에서 지정한 스태프 역할을 가진 멤버는 건의 채널에서 평소처럼 대화할 수 있고, 메시지가 건의로 바뀌지 않아요. 그 외 멤버의 메시지는 모두 건의로 바뀌고 삭제돼요.
- `suggest` 명령어는 권한 시스템을 따르므로, 권한 명령어로 채널이나 역할별로 차단할 수 있어요. 입력 메시지 방식도 같은 규칙을 따라요.
- 사용자 지정 이모지는 봇이 사용할 수 있는 이모지여야 해요. 명령어는 각 이모지로 반응을 테스트해 보고, 하나라도 실패하면 설정을 거부해요.
- 대시보드의 **삭제**는 데이터베이스 기록만 삭제해요. Discord 메시지와 스레드는 그대로 남아요.
- `suggestclear`는 되돌릴 수 없고, 번호를 1부터 다시 시작해요.

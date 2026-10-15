---
title: 인사
slug: multigreets
summary: 멤버가 들어올 때 최대 30개 채널에 환영 메시지를 올리고, 기존의 퇴장, 부스트, DM 인사도 함께 설정해요.
icon: fa-bell
category: Actions
dashboard: /dashboard/multigreets
module: MultiGreets
tags: [greets, multigreets, welcome, join message, goodbye, bye, leave message, boost message, greet dm, webhook, placeholders, 인사, 환영, 입장 메시지, 퇴장, 퇴장 메시지, 부스트 메시지, 인사 DM, 웹후크, 플레이스홀더]
related: [rolegreets, invites, administration]
---

## 기능 소개

멤버가 들어오면 봇은 인사를 설정해 둔 모든 채널에 인사 메시지를 올려요. 인사마다 메시지, 자동 삭제 타이머, 웹후크 이름, 봇 사용 여부를 따로 설정할 수 있어요. 모든 인사를 한꺼번에 올리거나, 들어올 때마다 하나를 무작위로 고를 수도 있어요.

메시지는 임베드 파서를 거치기 때문에, 인사는 일반 텍스트, 버튼이 있는 전체 임베드, 또는 사용자 지정 이름과 아바타가 있는 웹후크 게시물이 될 수 있어요. 플레이스홀더를 쓰면 멤버 이름, 서버 이름, 멤버 수, 그리고 초대 추적을 켰다면 누가 초대했는지도 메시지에 넣을 수 있어요.

이전 방식의 단일 메시지 시스템도 함께 남아 있어요. 멤버가 나갈 때의 퇴장 메시지, 멤버가 부스트할 때의 부스트 알림, 그리고 개인 환영 DM을 담당해요. 이 기능은 관리 모듈에 있으며, 아래에서 따로 설명해요.

## 사용하면 좋은 이유

- 같은 입장에 대해 `#general`에는 공개 환영을, `#staff-joins`에는 조용한 기록 한 줄을 남길 수 있어요.
- 채널마다 다른 인사 스타일을 쓸 수 있어요. 예를 들어 한 채널에는 임베드를, 다른 채널에는 웹후크 "캐릭터"를 쓸 수 있어요.
- 인사 여러 개를 모아 두고 들어오는 멤버마다 하나씩 무작위로 골라 줄 수 있어요.
- 짧은 환영 메시지를 1분 뒤 스스로 지워서 채널이 어수선해지지 않게 할 수 있어요.
- 다른 설정 없이도 퇴장이나 부스트 메시지를 보낼 수 있어요.

## 인사 유형

**인사 유형**은 서버 전체에 적용되며, 입장할 때 무엇을 할지 정해요.

| 유형 | 대시보드 라벨 | 동작 |
| --- | --- | --- |
| MultiGreet | 모든 인사 | 활성화된 인사가 추가된 순서대로 모두 실행돼요. 기본값이에요. |
| RandomGreet | 무작위 인사 | 목록에서 인사 하나를 무작위로 골라 실행해요. 비활성화된 인사도 뽑힐 수 있고, 그때는 건너뛰어요. |
| Off | 비활성화됨 | 어떤 인사도 실행되지 않아요. |

## 인사 하나의 구성

인사마다 채널 하나가 연결돼요. 한 채널에는 인사를 최대 5개까지, 서버 전체에는 최대 30개까지 둘 수 있어요. 인사는 목록의 위치에 따라 번호가 매겨지고, 명령어는 이 번호를 사용해요.

| 항목 | 기본값 | 의미 |
| --- | --- | --- |
| 채널 | 추가한 채널 | 이 인사를 올릴 위치예요 |
| 메시지 | 비어 있음 | 텍스트 또는 임베드 템플릿이에요. 비어 있는 인사는 아무것도 보내지 않아요. |
| 삭제 시점 | 0(안 함) | 인사가 스스로 지워지기까지 걸리는 초예요 |
| 봇에게도 인사 | 끔 | 봇 계정이 들어왔을 때도 인사를 실행할지 정해요 |
| 웹후크 | 없음 | 봇 대신 사용자 지정 이름과 아바타로 웹후크를 통해 게시해요 |
| 활성화 | 켬 | 비활성화된 인사는 삭제하지 않고 건너뛰어요 |

채널이 삭제되면, 다음 실행 시점에 그 인사가 제거돼요. 웹후크가 삭제되거나 봇이 게시 권한을 잃으면, 매번 오류가 나지 않도록 그 인사는 비활성화돼요.

## 플레이스홀더

인사는 사용자, 서버, 봇 플레이스홀더 세트로 만들어져요. 초대자 플레이스홀더는 초대 페이지에서 초대 추적을 켰을 때만 동작해요.

| 플레이스홀더 | 값 |
| --- | --- |
| `%user%`, `%user.mention%` | 새 멤버를 멘션해요 |
| `%user.name%`, `%username%` | 사용자 이름이에요 |
| `%user.fullname%`, `%userfull%` | 전체 태그예요 |
| `%user.id%`, `%id%` | 사용자 ID예요 |
| `%user.avatar%`, `%useravatar%` | 아바타 URL이에요 |
| `%user.banner%` | 배너 URL이에요 |
| `%user.created_date%`, `%user.created_time%` | 계정을 만든 날짜와 시간이에요 |
| `%user.joined_date%`, `%user.joined_time%` | 이 서버에 들어온 날짜와 시간이에요 |
| `%server%`, `%server.name%` | 서버 이름이에요 |
| `%server.id%`, `%sid%` | 서버 ID예요 |
| `%server.icon%`, `%server.banner%` | 아이콘과 배너 URL이에요 |
| `%server.members%`, `%members%` | 멤버 수예요 |
| `%server.boostlevel%`, `%server.boostcount%` | 부스트 등급과 부스트 수예요 |
| `%server.time%`, `%server.timestamp.longdatetime%` | 현재 시간이에요. 일반 텍스트 또는 Discord 타임스탬프로 표시해요 |
| `%bot.name%`, `%bot.id%`, `%bot.avatar%` | 봇 자신에 대한 정보예요 |
| `%inviter.username%`, `%inviter.mention%`, `%inviter.id%`, `%inviter.avatar%` | 사용된 초대를 만든 사람이에요. 알 수 없으면 `Unknown`이 나와요 |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | 초대자의 초대 집계예요 |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%` | 사용된 초대, 그 라벨, 그리고 일반 초대, 커스텀 링크, 앱 중 어떤 유형인지 나타내요 |
| `%user.joincount%`, `%user.leavecount%` | 이 멤버가 들어오고 나간 횟수예요 |
| `%server.members.ordinal%` | 1st, 2nd, 1,204th처럼 순서로 표시한 멤버 수예요 |
| `%user.joined.R%`, `%user.created.F%` (그리고 t, T, d, D, f 스타일) | 들어온 시간과 계정을 만든 시간을 Discord 타임스탬프로 표시해요 |

> [!EXAMPLE]
> `Welcome %user.mention% to %server%! You are member #%server.members%.`

서버, 채널, 봇 플레이스홀더의 전체 목록은 플레이스홀더 페이지에 있어요. 채널 플레이스홀더는 인사에서 채워지지 않아요.

## 기존 인사, 퇴장, 부스트 명령어

이 기능은 다중 인사보다 먼저 만들어졌으며, 관리 모듈에 있어요. 각 기능은 메시지 하나로 이루어지며, 서버 설정에 저장되고, 명령어를 실행한 채널에서 켜고 꺼요.

| 메시지 | 실행 시점 | 플레이스홀더 |
| --- | --- | --- |
| Bye | 멤버가 나갈 때 | 사용자, 서버, 봇 세트와 채널 플레이스홀더예요. `%user%`는 나간 멤버를 멘션해요. |
| Boost | 멤버가 부스트를 시작하거나 다시 부스트할 때 | 사용자, 채널, 서버, 봇, gif 세트예요 |
| Greet DM | 멤버가 들어올 때, 개인 메시지로 보내요 | 사용자, 채널, 서버, 봇, gif 세트예요 |

`bye` 또는 `boost`를 실행하면 해당 메시지가 켜지거나 꺼지고, 명령어를 입력한 채널로 설정돼요. `byedel`과 `boostdel`은 자동 삭제 타이머를 초 단위로 설정해요. `boostdel`은 600을 넘을 수 없어요. 내용 없이 메시지 명령어를 실행하면 현재 메시지를 보여줘요. `leavehook`은 퇴장 메시지를 사용자 지정 이름과 아바타가 있는 웹후크로 감싸고, `leavehook disable`은 웹후크를 제거해요.

인사 DM은 주의해서 써야 해요. 봇이 인증된 봇이 아니라면, 켜기 전에 봇이 확인을 요청해요. 인증되지 않은 봇이 대량으로 DM을 보내면 봇이 신고될 수 있기 때문이에요. 멤버는 `greetdmoptout` 명령어를 쓰거나, 자신의 프로필 페이지에서 **환영 DM** 토글을 끄면 이 DM을 받지 않을 수 있어요.

채널 인사만을 위한 기존 명령어는 없어요. 채널 환영에는 다중 인사를 사용하세요.

## 설정

모든 설정은 대시보드의 인사 페이지에 있어요.

| 설정 | 기본값 | 역할 |
| --- | --- | --- |
| 인사 유형 | 모든 인사 | 모든 인사, 무작위 인사, 비활성화됨 중에서 고를 수 있어요 |
| 새 인사 추가 | | 채널을 고른 뒤 **인사 추가**를 클릭하세요 |
| 인사 메시지 | 비어 있음 | 인사 하나의 임베드 편집기예요. 내용, 임베드 최대 10개, 컴포넌트를 지원해요 |
| 삭제 시점 | 안 함 | `1m30s` 또는 `45s`처럼 시간을 입력하세요 |
| 웹후크 | 설정 안 됨 | 웹후크 이름과 선택 사항인 아바타 URL이에요 |
| 봇에게도 인사 | 끔 | 봇 계정에도 인사를 보내요 |
| 활성화 | 켬 | 인사를 지우지 않고 하나만 끌 수 있어요 |

퇴장, 부스트, 인사 DM 메시지는 이 페이지에 없어요. 위의 명령어로 설정하세요.

## 설정 방법

1. 대시보드에서 **인사**를 열고 **인사 유형**을 **모든 인사**로 둬요.
2. **새 인사 추가**에서 환영 채널을 고르고 **인사 추가**를 클릭해요.
3. 새로 생긴 카드에서 **인사 메시지**를 열고, 위의 플레이스홀더를 써서 메시지를 만든 뒤 저장해요.
4. 필요하면 **삭제 시점**을 정하고, **웹후크**에 이름과 아바타를 넣고, 봇 입장도 알리려면 **봇에게도 인사**를 켜세요.
5. 다른 채널에도 같은 방식으로 추가해요. 같은 채널에 여러 개를 추가했고 다양성을 원하면 **무작위 인사**로 바꾸세요.
6. 퇴장 메시지를 쓰려면 원하는 채널에서 `byemsg Goodbye %user%, we will miss you`를 실행한 뒤 `bye`로 켜세요.
7. 부스트 메시지를 쓰려면 `boostmsg Thanks for boosting, %user%!`를 실행한 뒤 `boost`를 실행하세요.
8. `byetest`와 `boosttest`로 확인하세요. 다중 인사에는 미리보기 기능도 있어요. `multigreetmessage 1`을 실행하고 **미리보기**를 누르세요.

## 명령어

이 명령어는 서버 접두사로 실행하세요(변경하지 않았다면 `.`이에요). 다중 인사 명령어는 `/multigreets add`, `/multigreets remove` 같은 슬래시 명령어로도 쓸 수 있어요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `multigreetadd [#channel]` | `mgadd`, `mga` | 관리자 | 채널의 인사를 추가해요. 채널을 생략하면 현재 채널이에요 |
| `multigreetremove <number or #channel>` | `mgrem`, `mgrm`, `mgr` | 관리자 | 번호로 인사 하나를 제거하거나, 확인 후 채널의 모든 인사를 제거해요 |
| `multigreetmessage <number> [message]` | `mgmsg`, `mgm` | 관리자 | 인사 텍스트나 임베드를 설정해요. 메시지가 없으면 미리보기나 원본 템플릿을 보여줘요 |
| `multigreetdelete <number> <time or seconds>` | `mgdel`, `mgd` | 관리자 | 자동 삭제 타이머를 설정해요. 예: `1m` 또는 `60`. `0`이면 꺼져요 |
| `multigreetdisable <number> <true or false>` | `mgdisable`, `mgdis` | 관리자 | `true`면 인사를 끄고, `false`면 켜요 |
| `multigreetgreetbots <number> <true or false>` | `multigreetbots`, `mggb` | 관리자 | 이 인사를 봇에게도 실행할지 정해요 |
| `multigreetwebhook <number> [name] [avatar url]` | `mgwebhook`, `mghook`, `mgh` | 관리자 | 인사용 웹후크를 만들어요. 이름을 주지 않으면 웹후크를 제거해요 |
| `multigreettype <multigreet, randomgreet or off>` | `mgtype`, `mgt` | 관리자 | 서버 전체의 인사 유형을 바꿔요 |
| `multigreetlist` | `mglist`, `mgl` | 관리자 | 모든 인사와 설정을 페이지로 넘겨 봐요 |
| `bye` | | 서버 관리 | 이 채널의 퇴장 메시지를 켜고 꺼요 |
| `byemsg [text]` | | 서버 관리 | 퇴장 메시지를 보거나 설정해요 |
| `byedel [seconds]` | | 서버 관리 | 퇴장 메시지 자동 삭제 타이머예요. 기본값은 30초예요 |
| `byetest [@user]` | | 서버 관리 | 퇴장 메시지를 테스트로 보내요 |
| `leavehook [#channel] [name] [image url] [text]` | `byehook` | 서버 관리 | 퇴장 메시지를 웹후크로 보내요. `leavehook disable`로 끌 수 있어요 |
| `boost` | | 서버 관리 | 이 채널의 부스트 메시지를 켜고 꺼요 |
| `boostmsg [text]` | `boostmessage` | 서버 관리 | 부스트 메시지를 보거나 설정해요 |
| `boostdel [seconds]` | `boostdelete` | 서버 관리 | 부스트 메시지 자동 삭제 타이머예요. 0~600초이고 기본값은 30초예요 |
| `boosttest [@user]` | `testboost` | 서버 관리 | 부스트 메시지를 테스트로 보내요 |
| `greetdm` | | 서버 관리 | 환영 DM을 켜고 꺼요 |
| `greetdmmsg [text]` | | 서버 관리 | 환영 DM 텍스트를 보거나 설정해요 |
| `greetdmtest [@user]` | | 서버 관리 | 환영 DM을 테스트로 보내요 |
| `greetdmoptout` | `gdmoptout` | 없음 | 이 봇의 환영 DM을 더 이상 받지 않아요 |

## 팁과 주의 사항

- `multigreetdelete`에는 봇의 **메시지 관리** 권한이 필요하고, `multigreetwebhook`과 `leavehook`에는 **웹후크 관리** 권한이 필요해요.
- 인사 번호는 목록 위치를 기준으로 해요. 그래서 하나를 제거하면 그 뒤 인사들의 번호가 바뀌어요. 수정하기 전에 `multigreetlist`를 실행하세요.
- `multigreettype`의 `off` 옵션, `/multigreets type`, 대시보드의 **비활성화됨** 버튼은 모두 같은 인사 유형을 설정해요. 그러니 어느 것이든 인사를 지우지 않고 시스템만 끌 수 있어요.
- 초대 플레이스홀더는 입장을 초대에 연결할 때까지 최대 5초 기다렸다가 인사를 보내요. 그래서 여러 명이 동시에 들어와도 초대자가 정확하게 나와요.
- 환영 DM은 멤버가 서버 멤버의 DM을 허용했을 때만 작동해요. 실패한 DM은 무시돼요.
- 역할 인사는 별도의 기능이에요. 입장할 때가 아니라 역할을 받을 때 실행돼요.

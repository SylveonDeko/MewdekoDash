---
title: 트리거
slug: chat-triggers
summary: 메시지, 반응, 슬래시 명령어, 봇 이벤트에 자동으로 응답해요. 조건, 비용, 카운터, 역할 지급과 전체 플레이스홀더 세트를 지원해요.
icon: fa-comments
category: Actions
dashboard: /dashboard/chat-triggers
module: ChatTriggers
tags: [chat triggers, triggers, autoresponder, custom commands, auto reply, reaction roles, regex, counters, placeholders, event triggers, 채팅 트리거, 트리거, 자동 응답, 사용자 지정 명령어, 자동 답장, 반응 역할, 정규식, 카운터, 플레이스홀더, 이벤트 트리거]
related: [administration, xp, currency, tickets, giveaways]
---

## 기능 소개

트리거는 봇이 감시하는 텍스트와, 그 텍스트를 보면 보내는 응답의 조합이에요. 가장 간단한 형태는 멤버가 `hello`라고 입력하면 봇이 `hi there`라고 답하는 것이에요. 여기에서 트리거는 메시지 어디에서나 일치하거나 정규식으로 일치할 수 있고, 임베드로 응답하거나, 이모지로 반응하거나, 응답을 DM으로 보내거나, 멤버의 메시지를 삭제하거나, 역할을 지급하거나 제거하거나, 다른 채널이나 웹후크에 사본을 올리거나, 끝나면 두 번째 트리거를 실행할 수 있어요.

트리거는 메시지로만 실행되지 않아요. 같은 트리거를 슬래시, 메시지, 사용자 컨텍스트 명령어로 등록하거나, 특정 반응을 추가하거나 제거할 때 실행하거나, 레벨업, 멤버 입장, 부스트 시작, 티켓 열림, 나눔 당첨 같은 봇 이벤트에 실행할 수도 있어요.

각 트리거에는 고유한 조건을 설정할 수 있어요. 사용자, 채널 또는 서버별 쿨다운, 필요한 경험치 레벨, 화폐 비용이나 보상, 활성 시간과 요일, 만료 날짜, 사용 횟수 제한, 최소 계정 나이 또는 서버 가입 기간, 범위 안에 있어야 하는 카운터가 있어요. 조건이 맞지 않으면 트리거는 조용히 넘어가거나, 직접 작성한 메시지를 보여줘요. 대시보드의 테스터는 어떤 규칙 때문에 샘플 메시지가 막히는지 정확히 알려줘요.

응답은 봇의 다른 값을 읽어 올 수 있어요. 멤버의 레벨, 잔액, 평판, 메시지 수, 트리거 뒤에 입력한 텍스트, 멘션한 사람, 답장한 메시지, 정규식의 캡처 그룹을 사용할 수 있고, 응답이 읽거나 값을 늘릴 수 있는 서버 전체 카운터도 사용할 수 있어요.

## 이런 용도로 써요

- `!rules`처럼 자주 받는 질문에 자동으로 답해요. 이 명령은 규칙 임베드를 보내요.
- 봇의 기본 명령어 세트 없이도 멤버가 무료로 쓸 수 있는 재미있는 명령어를 만들어요.
- `daily`처럼 쿨다운과 보상을 사용해서 멤버가 하루에 한 번 화폐를 받게 해요.
- "verify" 같은 단어로 역할을 지급하고 메시지를 삭제해요.
- 특정 이모지로 반응하면 역할을 주는 반응 역할을 만들어요.
- 레벨업, 환영, 부스트 알림을 원하는 형식으로 만들고, 메시지가 아니라 이벤트에 맞춰 실행해요.
- "마지막 사고 이후 경과 일수"처럼 누구나 단어를 입력해서 늘릴 수 있는 카운터를 운영해요.

## 트리거 유형

트리거에는 사용할 수 있는 유형 목록이 있어요. 유형은 무엇이 트리거를 실행할 수 있는지를 정해요. 메시지는 기본으로 켜져 있어요. 나머지는 `chattriggervalidtype` 명령이나 대시보드의 토글로 트리거마다 켜요.

| 유형 | 실행 시점 |
| --- | --- |
| 메시지 | 메시지가 트리거 텍스트와 일치할 때 |
| 상호작용 | 트리거에 등록된 슬래시, 메시지 또는 사용자 명령어를 실행할 때 |
| 버튼 | ID가 트리거와 일치하는 버튼 구성 요소를 누를 때 |
| 반응 | 누군가 메시지에 트리거 이모지를 추가할 때 |
| 반응 제거 | 누군가 메시지에서 트리거 이모지를 제거할 때 |
| 이벤트 | 아래 봇 이벤트 중 하나가 발생할 때 |

### 메시지 일치

기본적으로 소문자로 바꾼 전체 메시지가 트리거와 같아야 해요. 다음 두 옵션으로 조건을 완화할 수 있어요.

- **메시지 어디에서나 일치** (`ctca`): 트리거가 메시지 어딘가에 온전한 단어로 나타나야 해요.
- **다른 사람을 대상으로 지정 허용** (`ctat`): 메시지가 트리거로 시작하고 공백 뒤에 텍스트가 더 올 수 있어요. 이 텍스트는 `%target%`이 돼요.

**정규식** 트리거(`addchattriggerregex`)는 메시지를 패턴과 비교해요. 패턴마다 100밀리초가 주어지고, 시간이 초과된 패턴은 건너뛰어요. 이름 있는 캡처 그룹이나 번호 캡처 그룹은 응답에서 `%regex.1%` 또는 `%regex.name%`으로 사용할 수 있어요.

**접두사 조건**은 메시지가 일치하기 전에 접두사로 시작해야 하는지를 정해요.

| 옵션 | 동작 |
| --- | --- |
| 접두사 필요 없음 | 접두사 없이 텍스트만 일치 (기본값) |
| 전역 접두사 | 봇의 전역 접두사로 시작해야 해요 |
| 서버 접두사, 없으면 전역 | 서버 접두사로 시작해야 하고, 없으면 전역 접두사를 사용해요 |
| 설정되어 있으면 서버 접두사 | 서버 접두사로 시작해야 해요. 서버에 접두사가 없으면 절대 일치하지 않아요 |
| 사용자 지정 접두사 | `ctprefix`로 설정한 접두사로 시작해야 해요 |

한 메시지가 여러 트리거와 일치하면 그중 하나를 무작위로 골라요. 봇과 웹훅의 메시지는 **봇만 사용** (`ctallowbots`)이 켜진 트리거가 아니면 무시해요. 이 설정이 켜진 트리거는 봇 메시지에만 응답해요. 봇은 자기 자신의 메시지에 절대 응답하지 않아요.

### 상호작용 트리거

`setctintertype`은 트리거를 슬래시, 메시지 또는 사용자 애플리케이션 명령어로 등록해요. `setctintername`과 `setctinterdesc`는 이름과 설명을 설정하고, 이름은 Discord의 명령어 이름 규칙을 따라야 해요. `ctinterephemeral`을 켜면 응답을 실행한 사람에게만 보여요. `ctintererrors`는 중복된 이름이나 하위 명령어가 너무 많은 경우처럼 등록에 실패한 이유를 보여줘요.

### 반응 트리거

`addreactiontrigger <emoji> <response>`는 텍스트가 이모지인 트리거를 만들어요. 트리거 유형으로 **반응 추가됨** 또는 **반응 제거됨**을 켜세요. 응답은 반응이 달린 메시지의 채널에 올라가고, 역할 지급은 반응한 멤버를 대상으로 해요. **멘션된 사람들**을 선택하면 반응이 달린 메시지에서 멘션된 사람들을 대상으로 해요. 봇의 반응은 무시해요.

### 이벤트 트리거

`ctevent <id> <event>`는 메시지 대신 이벤트에서 트리거가 실행되게 하고, 트리거의 이벤트 유형을 자동으로 켜요. 이벤트는 다음과 같아요.

| 이벤트 | 실행 대상 |
| --- | --- |
| XpLevelUp | 멤버가 레벨업할 때 |
| XpLevelDown | 멤버의 레벨이 내려갈 때 |
| MemberJoin | 멤버가 입장할 때 |
| MemberLeave | 멤버가 떠날 때 |
| VoiceJoin | 멤버가 음성 채널에 입장할 때 |
| VoiceLeave | 멤버가 음성 채널에서 나갈 때 |
| Boost | 멤버가 부스트를 시작할 때 |
| BoostEnd | 멤버가 부스트를 중단할 때 |
| TicketOpened | 티켓이 열릴 때 |
| TicketClosed | 티켓이 닫힐 때 |
| GiveawayWon | 멤버가 나눔에서 당첨될 때 |

응답은 `cteventchannel`로 설정한 채널에 가고, 설정하지 않으면 이벤트가 발생한 채널에 가요. 입장, 퇴장, 음성, 부스트 이벤트에는 고유한 채널이 없으니, 이런 트리거에는 채널을 직접 지정해야 해요. 그렇지 않으면 아무 동작도 하지 않아요. 이벤트 트리거도 메시지 트리거와 같은 조건과 화폐 확인을 거치고, 이벤트와 관련된 멤버가 플레이스홀더와 역할 지급의 대상이 돼요.

## 응답

기본 응답은 트리거를 만들 때 입력한 텍스트예요. 이 텍스트는 임베드 파서를 거치므로 일반 텍스트, 임베드, 여러 개의 임베드, 또는 대시보드의 임베드 편집기로 만든 구성 요소가 될 수 있어요. `ctaddresponse`로 추가 응답을 등록할 수 있고, **응답 모드**가 어떤 응답을 보낼지 정해요.

| 모드 | 동작 |
| --- | --- |
| Single | 항상 첫 번째 응답을 보내요 (기본값) |
| Random | 무작위로 하나를 골라요. 같은 줄을 반복하면 선택될 확률이 높아져요 |
| RoundRobin | 사용할 때마다 순서대로 하나씩 보내며, 순서는 서버 전체가 공유해요 |
| All | 모든 응답을 순서대로 보내요 |

전달 옵션은 모두 기본으로 꺼져 있어요.

- **메시지에 답장** (`ctreply`): 응답을 Discord 답장으로 보내요.
- **응답을 DM으로 보내기** (`ctdm`): 응답을 멤버에게 개인 메시지로 보내요.
- **트리거 메시지 삭제** (`ctad`): 멤버가 입력한 메시지를 지워요.
- **응답 대신 메시지에 반응** (`rtt`): 답장 대신 트리거의 이모지를 멤버의 메시지에 달아요. 메시지 삭제와 함께 사용할 수 없어요.
- **메시지를 보내지 않음** (`ctnr`): 역할만 지급하는 트리거에 유용해요.
- **응답 삭제까지 대기** (`ctdeleteafter`): 봇의 응답을 삭제하기까지 걸리는 초예요. 0이면 삭제하지 않아요.
- **반응할 이모지** (`ctreact`): 최대 6개의 이모지를 1초마다 하나씩 추가해요. 이모지를 주지 않으면 목록을 비워요.

### 크로스포스트

`ctcpch`는 모든 응답의 사본을 서버의 다른 채널에 올려요. `ctcpwh`는 대신 웹후크 URL로 올리며, 웹후크는 다른 서버에 있어도 돼요. **메시지를 보내지 않음**이 켜져 있어도 크로스포스트는 실행돼요.

### 역할

**지급할 역할**과 **제거할 역할**(`ctrgranttoggle`, `ctrremovetoggle`)은 트리거가 실행될 때 적용돼요. 같은 역할에 토글을 다시 실행하면 목록에서 빠져요. **다음 대상에게 역할 적용** (`chattriggerrolegranttype`)은 대상을 정해요.

| 대상 | 영향을 받는 사람 |
| --- | --- |
| Sender | 트리거를 실행한 멤버 (기본값) |
| Mentioned | 메시지에서 멘션된 최대 5명 |
| Both | 실행한 멤버와 멘션된 최대 4명 |

대상에 멘션이 포함되면, 일치 검사 전에 메시지에서 멘션을 제거해요. 그래서 `verify @someone`도 `verify` 트리거와 일치해요.

### 연결

`ctchain <id> <nextId>`는 첫 번째 트리거가 끝난 뒤에 두 번째 트리거를 실행해요. 두 번째 트리거도 자체 조건과 비용을 포함해 독립적으로 확인해요. 연결은 다섯 단계까지만 실행되고, 이미 실행한 트리거는 다시 실행하지 않아요.

## 조건

이 조건들은 무엇을 청구하거나, 보내거나, 집계하기 전에 모두 확인해요. 조건이 맞지 않으면 트리거는 조용히 실행되지 않아요. 다만 레벨과 화폐 조건은 `ctreqmsg`로 **사용할 수 없을 때 메시지**를 설정했다면 그 메시지를 보여줘요.

| 조건 | 명령어 | 기본값 | 동작 |
| --- | --- | --- | --- |
| 쿨다운 | `ctcooldown <id> <seconds> [scope]` | 없음 | 지정한 초 동안 반복 실행을 막아요. 범위는 `User`, `Channel`, `Guild`예요 |
| 필요 레벨 | `ctreqlevel <id> <level>` | 0 | 멤버의 경험치 레벨이 이 값 이상이어야 해요 |
| 비용 | `ctcost <id> <amount>` | 0 | 멤버에게서 화폐를 차감해요. 멤버가 낼 수 없으면 실행하지 않아요 |
| 보상 | `ctreward <id> <amount>` | 0 | 트리거가 실행되면 멤버에게 화폐를 지급해요 |
| 경험치 보상 | `ctxpreward <id> <amount>` | 0 | 트리거가 실행되면 경험치를 지급해요 |
| 활성 시간 | `cttime <id> <HH:mm> <HH:mm> [days...]` | 항상 | 서버 시간대 기준으로 이 시간 안에서만 실행해요. 종료 시간이 시작 시간보다 빠르면 자정을 넘겨 실행해요. 요일은 이름을 쓰거나 0부터 6까지 숫자로 쓰며, 일요일은 0이에요 |
| 만료 | `ctexpiry <id> [duration]` | 없음 | 지금부터 지정한 기간이 지나면 실행을 멈춰요. 예: `7d` |
| 사용 횟수 제한 | `ctmaxuses <id> <uses>` | 무제한 | 지정한 횟수만큼 실행한 뒤 멈춰요. 0이면 제한을 없애요 |
| 최소 계정 나이 | `ctminage <id> [duration]` | 없음 | 계정이 이 기간보다 오래되어야 해요 |
| 서버 최소 가입 기간 | `ctminmember <id> [duration]` | 없음 | 멤버가 이 기간 이상 전에 서버에 들어와 있어야 해요 |
| 카운터 범위 | `ctrequirecounter <id> <name> [min] [max]` | 없음 | 지정한 카운터가 범위 안에 있어야 해요. 이름으로 `clear`를 쓰면 조건을 제거해요 |

쿨다운은 다른 모든 조건을 통과한 뒤에야 시작하므로, 차단된 시도는 쿨다운을 소모하지 않아요. 비용은 보상보다 먼저 차감되므로, 비용을 내고 보상을 주는 트리거는 비용을 낼 수 없는 사람에게 보상을 주지 않아요. `cmdcd`로 설정한 서버 전체 명령어 쿨다운도 사용자별로 트리거에 적용되며, 트리거 자체의 쿨다운에 더해서 적용돼요.

## 카운터

카운터는 서버마다 저장되는 이름 있는 숫자예요. 어떤 응답이 처음 사용하면 만들어지고, 어떤 응답에서든 읽거나 바꿀 수 있어요.

| 플레이스홀더 | 효과 |
| --- | --- |
| `%counter:name%` | 카운터 값을 보여줘요 |
| `%counter:name+%` | 값을 1 늘리고 새 값을 보여줘요 |
| `%counter:name-%` | 값을 1 줄이고 새 값을 보여줘요 |
| `%usercounter:name%` | 트리거를 실행한 멤버의 해당 이름 값을 보여줘요 |
| `%usercounter:name+%` | 멤버의 값을 1 늘려요 |
| `%usercounter:name-%` | 멤버의 값을 1 줄여요 |

이름은 최대 64자이며 영문자, 숫자, 밑줄(_) 또는 하이픈(-)을 쓸 수 있고, 대소문자를 구분하지 않아요. `ctcounters`는 이름 목록을 보여주고, `ctcounterset`은 값을 정확히 설정하고, `ctcounterdelete`는 카운터와 그 이름 아래의 멤버별 값을 모두 지워요. 대시보드 사이드바의 **카운터** 패널에서도 같은 작업을 할 수 있어요.

## 플레이스홀더

응답에서는 일반 플레이스홀더 세트(플레이스홀더 페이지의 사용자, 서버, 채널, 봇, 시간 플레이스홀더), 트리거 플레이스홀더, 다른 모듈이 추가한 플레이스홀더를 사용할 수 있어요. `ctplaceholders`는 추가된 플레이스홀더 목록을 실시간으로 보여줘요.

| 플레이스홀더 | 값 |
| --- | --- |
| `%target%` | 트리거 뒤에 입력한 모든 텍스트 (**다른 사람을 대상으로 지정 허용** 또는 **메시지 어디에서나 일치**가 필요해요) |
| `%targetuser%` | 메시지에서 처음 멘션된 사람의 멘션 |
| `%targetuser.id%`, `%targetuser.name%`, `%targetuser.avatar%` | 그 사람의 ID, 사용자 이름, 아바타 |
| `%targetusers%`, `%targetusers.id%` | 멘션된 모든 사람을 멘션 또는 ID로 보여줘요 |
| `%replied.content%` | 멤버가 답장한 메시지의 내용 |
| `%replied.author%`, `%replied.author.id%` | 그 메시지의 작성자 |
| `%usecount%` | 이 트리거가 실행된 횟수 |
| `%regex.1%`, `%regex.name%` | 정규식 트리거의 캡처 그룹 |
| `%img:tag%` | 해당 태그의 무작위 Imgur 이미지 |
| `%rng%` | 일반 플레이스홀더 세트의 무작위 숫자 |
| `%xp.level%`, `%xp.rank%`, `%xp.total%`, `%xp.current%`, `%xp.required%`, `%xp.remaining%`, `%xp.bonus%` | 멤버의 경험치 통계 |
| `%targetuser.xp.level%`, `%targetuser.xp.rank%`, `%targetuser.xp.total%` | 멘션된 사람의 경험치 통계 |
| `%currency.balance%`, `%currency.bank%`, `%currency.total%`, `%currency.emote%` | 멤버의 화폐 |
| `%targetuser.currency.balance%`, `%targetuser.currency.bank%` | 멘션된 사람의 화폐 |
| `%rep%`, `%rep.rank%`, `%targetuser.rep%`, `%targetuser.rep.rank%` | 평판 |
| `%messages%`, `%messages.channel%`, `%messages.server%`, `%targetuser.messages%` | 메시지 수 |
| `%invites%`, `%targetuser.invites%`, `%inviter%` | 초대 수와 멤버를 초대한 사람 |
| `%targetuser.afk%` | 멘션된 사람의 자리 비움 메시지 |
| `%counter:name%` 등 | 위에서 설명한 카운터 |

`%target%` 안의 멘션은 멤버가 모든 사람을 멘션할 권한이 있지 않으면 무효화돼요.

> [!EXAMPLE]
> 트리거 `daily`, 응답 `%user.mention% claimed today's bonus. Balance: %currency.balance%`, 설정 `ctreward 12 100`, `ctcooldown 12 86400 User`, `ctreqmsg 12 Come back tomorrow.`

## 테스터

`cttest <id> <sample message>` 또는 트리거 카드의 **이 트리거 테스트** 상자에서 해당 메시지가 내 계정으로 트리거를 실행할지 확인할 수 있어요. 메시지를 보내거나, 비용을 차감하거나, 집계하지 않아요. 텍스트가 일치했는지 알려주고, 트리거가 실행되지 않는다면 어떤 규칙이 막는지도 알려줘요. 막는 규칙은 비활성화, 봇만 사용, 일치하지 않음, 권한 항목, 권한 재정의, 만료, 쿨다운, 카운터, 사용 횟수 제한, 활성 시간, 계정 나이, 서버 가입 기간, 레벨, 잔액, 서버 명령어 쿨다운 중 하나예요.

## 카테고리와 정리

`ctcategory <id> <name>`은 트리거를 카테고리에 넣어요. `ctcategorytoggle <name> <true or false>`는 카테고리의 모든 트리거를 한 번에 켜거나 꺼요. 대시보드 사이드바는 카테고리로 필터링할 수 있어요. `cttoggle`은 트리거를 삭제하지 않고 하나만 일시 정지해요. `ctstats`는 트리거가 얼마나 자주 실행됐고 최근에 누가 실행했는지 보여줘요.

`ctsexport`는 모든 트리거를 YAML 파일로 내려받고, `ctsimport`는 첨부 파일이나 URL에서 트리거를 불러와요. `ctsclear`는 확인 후 모든 트리거를 삭제해요.

## 설정

모든 설정은 트리거마다 적용돼요. 채팅 트리거 페이지에는 **트리거 텍스트**와 **응답 메시지**를 입력하는 **빠른 설정** 양식이 있는 **간단 모드**와, **패턴 유형**(일반 텍스트 패턴 또는 정규 표현식 패턴), 트리거 유형을 고르고 저장 전에 정규식을 테스트할 수 있는 **고급 트리거 만들기**가 있는 **고급 모드**가 있어요.

각 트리거 카드를 펼치면 **트리거 텍스트**, **응답 메시지** 편집기, 테스터, 주제별로 묶인 설정 아코디언이 보여요.

| 그룹 | 설정 |
| --- | --- |
| 일치 조건 | 접두사 조건, 사용자 지정 접두사, 메시지 어디에서나 일치, 다른 사람을 대상으로 지정 허용, 봇 소유자만 |
| 응답 방식 | 메시지에 답장, 응답을 DM으로 보내기, 트리거 메시지 삭제, 응답 대신 메시지에 반응, 메시지를 보내지 않음, 반응할 이모지, 응답 삭제까지 대기, 추가 응답, 응답이 여러 개일 때 |
| 역할 | 지급할 역할, 제거할 역할, 다음 대상에게 역할 적용 |
| 제한 | 쿨다운(초), 쿨다운 적용 대상, 사용 횟수 제한, 다음 이후 실행 중지, 최소 계정 나이(분), 서버 가입 최소 기간(분), 특정 시간에만 활성화(시작 시간, 종료 시간, 적용 요일) |
| 비용과 보상 | 사용자에게서 차감, 사용자에게 지급, 경험치 지급, 필요 레벨, 사용할 수 없을 때 메시지 |
| 카운터 조건 | 카운터 이름, 최소, 최대 |
| 이벤트에서 실행 | 실행 시점, 응답할 채널 |
| 분류 | 카테고리, 이어서 실행할 트리거, 사람 대신 봇에 응답 |

사이드바에는 카테고리, **카운터**, 실시간 **플레이스홀더** 목록이 있고, 트리거와 응답을 검색할 수 있는 검색창도 있어요.

## 설정 순서

1. 대시보드에서 **트리거**를 열어요. **간단 모드**에서 트리거 단어를 입력하고 편집기에서 응답을 만든 뒤 생성해요.
2. 새 카드를 펼쳐요. **일치 조건**에서 단어가 문장 중간에서도 동작해야 하면 **메시지 어디에서나 일치**를 켜요.
3. **응답 방식**에서 답장할지, DM으로 보낼지, 멤버의 메시지를 삭제할지 골라요.
4. **제한**에서 스팸을 막을 수 있도록 쿨다운을 설정해요.
5. **이 트리거 테스트**에 샘플 메시지를 입력하고 **테스트**를 눌러요. 막는 원인이 나오면 고쳐요.
6. 레벨업 알림을 만들려면 아무 텍스트로 트리거를 만들고, **실행 시점**을 "멤버 레벨이 오를 때"로 정해요. **응답할 채널**은 비워 두면 멤버가 대화하던 곳에 올라가고, 응답에 `%user.mention%`과 `%xp.level%`을 사용해요.
7. 관련된 트리거에 **카테고리**를 지정하면 한 번에 일시 정지할 수 있어요.

## 명령어

서버 접두사(변경하지 않았다면 `.`)를 붙여서 실행해요. 트리거 ID는 `listchattriggers`로 확인할 수 있어요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `addchattrigger <trigger> <response>` | `act`, `acr` | 관리자 | 트리거를 만들어요. 여러 단어 트리거는 따옴표로 감싸요 |
| `addchattriggerregex <pattern> <response>` | `actr` | 관리자 | 정규식 트리거를 만들어요 |
| `addreactiontrigger <emoji> <response>` | `addrt` | 관리자 | 반응 트리거를 만들어요 |
| `editchattrigger <id> <response>` | `ect` | 관리자 | 기본 응답을 바꿔요 |
| `deletechattrigger <id>` | `dct` | 관리자 | 트리거를 삭제해요 |
| `listchattriggers` | `lct` | 관리자 | ID와 함께 트리거 목록을 보여줘요 |
| `listchattriggersgroup` | `lctg` | 관리자 | 텍스트별로 묶은 트리거 목록을 보여줘요 |
| `showchattrigger <id>` | `sct` | 관리자 | 트리거 하나의 설정을 보여줘요 |
| `cttoggle <id>` | `chattriggertoggle` | 관리자 | 트리거를 일시 정지하거나 다시 시작해요 |
| `ctca <id>` | | 관리자 | 메시지 어디에서나 일치를 토글해요 |
| `ctat <id>` | | 관리자 | 대상 지정 허용을 토글해요 |
| `ctdm <id>` | | 관리자 | DM 응답을 토글해요 |
| `ctad <id>` | | 관리자 | 트리거 메시지 삭제를 토글해요 |
| `rtt <id>` | `reactottrigger` | 관리자 | 답장 대신 메시지에 반응하기를 토글해요 |
| `ctnr <id>` | `chattriggernoresponse` | 관리자 | 메시지를 보내지 않기를 토글해요 |
| `ctreply <id>` | `chattriggerreply` | 관리자 | 메시지에 답장하기를 토글해요 |
| `ctdeleteafter <id> <seconds>` | `chattriggerdeleteafter` | 관리자 | 지정한 지연 뒤에 응답을 삭제해요 |
| `ctreact <id> [emoji...]` | `ctr` | 관리자 | 반응을 최대 6개까지 설정하거나 비워요 |
| `ctaddresponse <id> <response>` | `chattriggeraddresponse` | 관리자 | 추가 응답을 등록해요 |
| `ctclearresponses <id>` | `chattriggerclearresponses` | 관리자 | 추가 응답을 제거해요 |
| `ctresponsemode <id> <mode>` | `chattriggerresponsemode` | 관리자 | `Single`, `Random`, `RoundRobin` 또는 `All` |
| `ctprefixtype <id> <type>` | `chattriggersprefixtype` | 관리자 | `None`, `Global`, `GuildOrGlobal`, `GuildOrNone` 또는 `Custom` |
| `ctprefix <id> <prefix>` | `chattriggersprefix` | 관리자 | 사용자 지정 접두사를 설정해요 |
| `chattriggervalidtype <id> <type> <true or false>` | `ctvalidtype`, `ctvt` | 관리자 | 트리거 유형을 켜거나 꺼요 |
| `ctallowbots <id>` | `chattriggerallowbots` | 관리자 | 봇 메시지에만 응답하기를 토글해요 |
| `ctrgranttoggle <id> @role` | `ctgt`, `ctgranttoggle` | 관리자 | 지급할 역할을 토글해요 |
| `ctrremovetoggle <id> @role` | `ctrt`, `ctremovetoggle` | 관리자 | 제거할 역할을 토글해요 |
| `chattriggerrolegranttype <id> <type>` | `ctrolegranttype`, `ctrgt` | 관리자 | `Sender`, `Mentioned` 또는 `Both` |
| `chattriggerscrosspostchannel <id> <#channel>` | `ctcpch`, `ctcpchannel`, `ctcrosspostchannel`, `ctcrosspostch` | 관리자 | 채널에 크로스포스트해요 |
| `chattriggerscrosspostwebhook <id> <url>` | `ctcpwh`, `ctcpwebhook`, `ctcrosspostwebhook`, `ctcrosspostwh` | 관리자 | 웹후크로 크로스포스트해요 |
| `setctintertype <id> <type>` | `ctitype`, `ctintertype` | 관리자 | `None`, `Slash`, `Message` 또는 `User` |
| `setctintername <id> <name>` | `ctiname`, `ctrealname` | 관리자 | 애플리케이션 명령어 이름 |
| `setctinterdesc <id> <description>` | `ctidesc`, `ctinterdesc` | 관리자 | 애플리케이션 명령어 설명 |
| `ctinterephemeral <id> <true or false>` | `ctieph` | 관리자 | 상호작용 응답을 비공개로 해요 |
| `ctintererrors` | `ctierrors`, `ctie` | 관리자 | 명령어 등록 오류를 보여줘요 |
| `ctevent <id> <event>` | `chattriggerevent` | 관리자 | 이벤트에서 실행해요. 중지하려면 `None` |
| `cteventchannel <id> [#channel]` | `chattriggereventchannel` | 관리자 | 이벤트 응답을 올릴 채널이에요 |
| `ctcooldown <id> <seconds> [scope]` | `chattriggercooldown` | 관리자 | 트리거별 쿨다운이에요 |
| `ctreqlevel <id> <level>` | `chattriggerrequiredlevel` | 관리자 | 필요한 경험치 레벨이에요 |
| `ctcost <id> <amount>` | `chattriggercost` | 관리자 | 화폐 비용이에요 |
| `ctreward <id> <amount>` | `chattriggerreward` | 관리자 | 화폐 보상이에요 |
| `ctxpreward <id> <amount>` | `chattriggerxpreward` | 관리자 | 경험치 보상이에요 |
| `ctreqmsg <id> [message]` | `chattriggerrequirementmessage` | 관리자 | 조건이 맞지 않을 때 보여줄 메시지예요 |
| `cttime <id> <start> <end> [days...]` | `chattriggertime` | 관리자 | 활성 시간이에요. `cttime <id> clear`로 지워요 |
| `ctexpiry <id> [duration]` | `chattriggerexpiry` | 관리자 | 만료 기간이에요. 지우려면 비워요 |
| `ctmaxuses <id> <uses>` | `chattriggermaxuses` | 관리자 | 사용 횟수 제한이에요. 0이면 제한 없음 |
| `ctminage <id> [duration]` | `chattriggerminimumage` | 관리자 | 최소 계정 나이예요 |
| `ctminmember <id> [duration]` | `chattriggerminimummembership` | 관리자 | 서버 최소 가입 기간이에요 |
| `ctrequirecounter <id> <name> [min] [max]` | `chattriggerrequirecounter` | 관리자 | 카운터 범위 조건이에요 |
| `ctcounters` | `chattriggercounters` | 없음 | 카운터 목록을 보여줘요 |
| `ctcounterset <name> <value>` | `chattriggercounterset` | 관리자 | 카운터 값을 설정해요 |
| `ctcounterdelete <name>` | `chattriggercounterdelete` | 관리자 | 카운터를 삭제해요 |
| `ctplaceholders` | `chattriggerplaceholders` | 없음 | 추가된 플레이스홀더 목록을 보여줘요 |
| `ctcategory <id> [name]` | `chattriggercategory` | 관리자 | 카테고리를 설정하거나 지워요 |
| `ctcategorytoggle <name> <true or false>` | `chattriggercategorytoggle` | 관리자 | 카테고리를 켜거나 꺼요 |
| `ctchain <id> <nextId>` | `chattriggerchain` | 관리자 | 다른 트리거에 연결해요. 0이면 연결을 지워요 |
| `cttest <id> <sample>` | `chattriggertest` | 관리자 | 샘플 메시지를 시험 실행해요 |
| `ctstats <id>` | `chattriggerstats` | 관리자 | 실행 횟수와 최근 사용자를 보여줘요 |
| `ctsexport` | | 관리자 | 트리거를 YAML로 내보내요 |
| `ctsimport [url]` | | 관리자 | URL이나 첨부 파일에서 가져와요 |
| `ctsmigrate` | `ctsconvert` | 관리자 | 이전 임베드 형식을 백업과 함께 변환해요 |
| `ctsclear` | | 관리자 | 모든 트리거를 삭제해요 |
| `ctsreload` | | 봇 소유자 | 데이터베이스에서 트리거를 다시 불러와요 |

## 팁과 주의 사항

- 트리거는 소문자로 바꾼 메시지와 비교하므로, 트리거 텍스트는 사실상 대소문자를 구분하지 않아요.
- **메시지 어디에서나 일치**가 꺼져 있으면 메시지 전체가 트리거와 같아야 해요. 이 옵션이나 대상 지정을 켜지 않으면 `hello there`는 `hello` 트리거를 실행하지 않아요.
- 역할 지급에는 역할 관리 권한과 봇의 역할이 관련 역할보다 위에 있어야 해요. 목록에 역할을 추가하는 명령어도 해당 역할을 관리할 수 있는지 확인해요.
- 봇만 사용 트리거는 사람에게 응답하지 않고, 사람 트리거는 봇에게 응답하지 않아요. 하나의 트리거로는 둘 다 할 수 없어요.
- 쿨다운은 메모리에 저장되므로 봇을 다시 시작하면 초기화돼요. 사용 횟수 제한과 만료는 저장되어 재시작 후에도 유지돼요.
- 라운드 로빈 순서는 멤버별이 아니라 서버 전체가 공유해요.
- 권한 시스템의 `ActualChatTriggers` 모듈 항목과 트리거 텍스트에 대한 `permoverride`는 트리거 자체의 조건보다 먼저 확인해요.
- 상호작용 트리거는 실제 애플리케이션 명령어를 등록하므로, 명령어 개수와 이름에 대한 Discord 제한이 적용돼요. 트리거가 보이지 않으면 `ctintererrors`를 확인하세요.
- 응답의 반응은 1초에 하나씩 추가되므로, 이모지 여섯 개는 모두 나타나는 데 6초가 걸려요.
- 입장, 퇴장, 음성, 부스트 이벤트 트리거는 **응답할 채널**을 설정하기 전까지 아무 동작도 하지 않고, 오류도 표시하지 않아요.

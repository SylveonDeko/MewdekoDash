---
title: 역할 환영 메시지
slug: rolegreets
summary: 멤버가 특정 역할을 받으면 채널에 사용자 지정 메시지를 보내요. 자리 표시자, 임베드, 웹후크, 자동 삭제를 지원해요.
icon: fa-user
category: Actions
dashboard: /dashboard/rolegreets
module: RoleGreets
tags: [role greet, role greets, welcome, role message, role announcement, verification welcome, webhook greet, 역할 환영, 역할 환영 메시지, 환영, 역할 메시지, 역할 공지, 인증 환영, 웹후크 환영]
related: [multigreets, embedbuilder, administration]
---

## What it does

역할 환영 메시지는 멤버가 역할을 받을 때 봇이 게시하는 메시지예요. 스태프가 역할과 채널을 고르고 메시지를 작성하면, 그 뒤로 해당 역할이 누군가에게 추가될 때마다 봇이 그 채널에 메시지를 게시해요. 기본 메시지는 `Welcome %user.mention%!`예요.

메시지는 임베드 파서를 거치므로 일반 텍스트, 전체 임베드, 또는 대시보드 편집기로 만든 버튼이 있는 임베드가 될 수 있어요. 자리 표시자는 멤버의 이름, 아바타, 가입 날짜, 서버 정보를 채워요. 각 환영 메시지는 자체 이름과 아바타를 가진 웹후크로 보낼 수 있고, 설정한 초가 지나면 스스로 삭제될 수도 있어요.

환영 메시지는 역할과 채널 단위로 관리돼요. 역할 하나에 최대 10개의 환영 메시지를 둘 수 있고, 각각 다른 채널이나 다른 메시지를 가질 수 있어요. 환영 메시지는 삭제하지 않고도 비활성화할 수 있어요.

## Why you would use it

- 인증을 마치고 인증 역할을 받은 뒤에만 메인 채팅에 환영 메시지를 보내고 싶을 때
- 부스터 역할이 생기면 감사 채널에 새 부스터를 알리고 싶을 때
- 게임 역할을 고른 사람에게 그 게임의 채널을 안내하고 싶을 때
- 모더레이터 역할이 주어지면 스태프 채널에 온보딩 체크리스트를 올리고 싶을 때
- 기브어웨이나 이벤트 역할을 받은 멤버에게 해당 이벤트의 규칙을 안내하고 싶을 때

## How a greet fires

봇은 멤버 업데이트를 감시하고 변경 전후의 역할을 비교해요. 추가된 역할마다 해당 역할의 환영 메시지를 찾아서 각각 게시해요. 제거된 역할은 아무 동작도 일으키지 않아요. 봇은 해당 환영 메시지에서 **봇에게도 인사**가 켜져 있지 않으면 건너뛰고, 비활성화된 환영 메시지는 무시해요.

채널이 더 이상 존재하지 않으면 환영 메시지는 스스로 삭제돼요. 웹후크 환영 메시지가 웹후크 삭제나 봇 권한 상실로 실패하면, 제거되지 않고 비활성화돼요. 문제를 고친 뒤 다시 켤 수 있어요.

웹후크를 설정하면 메시지는 웹후크의 이름과 아바타로 보내져요. 자동 삭제도 그대로 작동해요. 봇은 방금 보낸 메시지를 가져와서 지정한 지연 시간 뒤에 제거해요.

## Placeholders

역할 환영 메시지는 사용자, 서버, 봇 자리 표시자 그룹을 지원해요. 채널 자리 표시자는 사용할 수 없어요.

| 자리 표시자 | 값 |
| --- | --- |
| `%user.mention%`, `%user%` | 역할을 받은 멤버의 멘션이에요 |
| `%user.name%`, `%username%` | 사용자 이름이에요 |
| `%user.fullname%` | 태그가 포함된 사용자 이름이에요 |
| `%user.avatar%` | 아바타 URL이에요 |
| `%user.banner%` | 배너 URL이에요 |
| `%user.id%` | 사용자 ID예요 |
| `%user.created_date%`, `%user.created_time%` | 계정 생성 날짜와 시간이에요 |
| `%user.joined_date%`, `%user.joined_time%` | 서버 가입 날짜와 시간이에요 |
| `%server.name%`, `%server%` | 서버 이름이에요 |
| `%server.members%` | 캐시된 멤버 수예요 |
| `%server.icon%`, `%server.banner%` | 서버 아이콘과 배너 URL이에요 |
| `%server.boostlevel%`, `%server.boostcount%` | 부스트 단계와 개수예요 |
| `%server.time%`, `%time.day%` | 서버 시간과 요일이에요 |
| `%bot.name%`, `%bot.avatar%`, `%bot.id%` | 봇의 이름, 아바타, ID예요 |

서버에서 초대 추적이 켜져 있으면, 멤버 환영(Multi Greets)의 초대자 및 초대 자리 표시자(`%inviter.username%`, `%inviter.mention%`, `%inviter.count%`, `%invite.code%`, `%invite.label%` 등)도 멤버의 초대자 정보로 채워져요. 초대자를 알 수 없으면 `Unknown`으로 표시돼요.

> [!EXAMPLE]
> `Welcome to the team, %user.mention%! You are member number %server.members%. Check the pins in this channel first.`

## Settings

역할 환영 메시지 페이지 위쪽에는 **새 역할 환영 메시지 추가** 양식이 있고, 아래에는 환영 메시지마다 카드가 있어요.

| 설정 항목 | 기본값 | 역할 |
| --- | --- | --- |
| 역할 | 없음 | 환영 메시지를 발동시키는 역할이에요 |
| 채널 | 없음 | 메시지를 게시할 채널이에요 |
| 메시지 | `Welcome %user.mention%!` | 임베드 편집기를 열어요 |
| 삭제 시간 (초, 0이면 삭제하지 않음) | 0 | 자동 삭제 지연 시간이에요 |
| 웹후크 URL (선택) | 없음 | 봇 대신 웹후크로 보내요 |
| 봇에게도 인사 | 꺼짐 | 역할을 받은 봇 계정에게도 메시지를 보내요 |
| 활성화됨 | 켜짐 | 카드에서 전환해요. 꺼진 환영 메시지는 동작하지 않아요 |

## Setup walkthrough

1. 대시보드에서 **역할 인사**를 여세요.
2. **새 역할 환영 메시지 추가**에서 **역할**과 **채널**을 고른 뒤 **역할 환영 메시지 추가**을 누르세요.
3. 새 카드에서 메시지 상자를 눌러 편집기를 열고, 위의 자리 표시자로 인사말을 작성하세요.
4. 채널을 깔끔하게 유지하고 싶다면 **삭제 시간**을 설정하고, 사용자 지정 이름과 아바타를 원하면 **웹후크 URL**을 붙여 넣으세요.
5. 카드를 저장한 뒤 테스트 계정에 역할을 주고 채널을 확인하세요.
6. 카드의 전환 버튼으로 환영 메시지를 잠시 멈추거나, 삭제 버튼으로 제거하세요.

> [!TIP]
> Discord에서 `rolegreetmessage 1`을 텍스트 없이 실행하면 현재 메시지가 표시되고, 내 정보로 렌더링해 주는 **미리보기** 버튼이 나타나요.

## Commands

서버의 접두사로 명령어를 실행하세요(변경하지 않았다면 `.`). 환영 메시지는 `rolegreetlist`에서의 순서로 번호가 매겨져요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `rolegreetadd <@role> [#channel]` | `rgadd`, `rga` | 관리자 | 역할에 환영 메시지를 추가해요. 채널을 주지 않으면 현재 채널을 사용해요 |
| `rolegreetlist` | `rglist`, `rgl` | 관리자 | 모든 환영 메시지와 설정을 페이지 단위로 보여 줘요 |
| `rolegreetmessage <id> [message]` | `rgmsg`, `rgm` | 관리자 | 메시지를 설정하거나, 텍스트 없이 실행하면 보여 주고 미리 봐요 |
| `rolegreetremove <id or @role>` | `rgrem`, `rgrm`, `rgr` | 관리자 | 번호로 환영 메시지 하나를 삭제하거나, 확인 후 역할의 모든 환영 메시지를 삭제해요 |
| `rolegreetdelete <id> <time or seconds>` | `rgdel`, `rgd` | 관리자 | 자동 삭제 지연 시간을 설정해요. 예: `30s` 또는 `30`. `0`이면 끕니다 |
| `rolegreetdisable <id> <true/false>` | `rgdisable`, `rgdis` | 관리자 | 환영 메시지를 비활성화하거나 다시 활성화해요 |
| `rolegreetgreetbots <id> <true/false>` | `rolegreetbots`, `rggb` | 관리자 | 봇이 이 환영 메시지를 발동시킬지 정해요 |
| `rolegreetwebhook <id> [name] [avatar url]` | `rgwebhook`, `rghook`, `rgh` | 관리자 | 환영 채널에 지정한 이름과 아바타로 웹후크를 만들어요. 이름 없이 실행하면 제거해요 |

슬래시 명령어는 `/rolegreets` 아래에 같은 동작으로 있어요: `add`, `remove`, `removerole`, `message`, `delete`, `disable`, `greetbots`, `webhook`, `list`.

## Tips and gotchas

- 봇에는 환영 채널의 메시지 보내기와 링크 첨부 권한이 필요하고, 자동 삭제를 위해 그 채널의 메시지 관리 권한이 필요해요. `rolegreetwebhook`으로 웹후크를 만들려면 웹후크 관리 권한도 필요해요.
- 제한은 서버당이 아니라 역할당 10개예요. 추가 명령어는 11번째를 거부해요.
- 환영 메시지는 리액션 역할, 레벨 보상, 다른 봇을 통해 역할이 추가될 때도 발동해요. 그래서 자주 추가되고 제거되는 역할은 채널을 도배할 수 있어요.
- 공백만 있는 메시지처럼 임베드 파서가 결과를 만들지 못하면 아무것도 보내지 않아요.
- `rolegreetremove`에 역할을 주면 확인 질문 후 그 역할의 모든 환영 메시지가 제거돼요. 번호를 주면 해당 환영 메시지 하나만 바로 제거돼요.
- 환영 메시지를 제거하면 번호가 바뀌어요. 번호로 편집하기 전에 `rolegreetlist`를 다시 실행하세요.
- 역할 환영 메시지는 MultiGreets 페이지의 입장 환영 메시지와 별개예요. 서버에 처음 들어오는 사람에게는 MultiGreets를, 나중에 역할을 받는 멤버에게는 역할 환영 메시지를 사용하세요.

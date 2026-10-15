---
title: 로깅
slug: logging
summary: 입장, 퇴장, 메시지 수정과 삭제, 차단, 역할과 채널 변경 등의 기록을 원하는 로그 채널로 보내세요. 이벤트별 라우팅과 채널 제외를 설정할 수 있어요.
icon: fa-file
category: Security
dashboard: /dashboard/logging
module: Administration
tags: [logging, logs, audit, events, message deleted, message edited, join leave, mod log, ignored channels, 로깅, 로그, 감사, 이벤트, 메시지 삭제, 메시지 수정, 입장 퇴장, 모더레이션 로그, 무시된 채널]
related: [moderation, administration, filter]
---

## 기능 소개

로깅은 디스코드가 봇에게 보내는 이벤트를 살피고, 각 이벤트의 요약을 선택한 텍스트 채널에 게시해요. 삭제된 메시지에는 작성자와 내용이 표시되고, 멤버가 입장하면 계정 생성 기간이 표시되고, 역할이 바뀌면 추가되거나 제거된 역할이 표시돼요. 봇이 감사 로그를 읽을 수 있다면, 해당 작업을 한 스태프도 함께 표시돼요.

이벤트 유형마다 채널 설정이 따로 있어요. 그래서 메시지 수정 기록은 한 채널로, 모더레이션 작업은 다른 채널로 보내고, 나머지는 꺼둘 수 있어요. 채널을 지정하기 전에는 아무것도 기록되지 않으며, 채널이 비어 있는 이벤트 유형은 조용히 건너뛰어요.

채널은 기록에서 제외할 수도 있어요. 제외된 채널에서 일어난 메시지, 스레드, 음성 이벤트는 아무것도 기록되지 않아서, 스태프 전용 방이나 봇 스팸 채널이 기록에 남지 않아요.

## 사용하는 이유

- 삭제되거나 수정된 메시지의 사본을 보관해서 모더레이터가 나중에 무엇이 지워졌는지 확인할 수 있도록 하고 싶을 때
- 입장과 퇴장을 추적하고, 계정 생성일을 함께 확인해서 레이드나 부계정을 찾고 싶을 때
- 차단, 차단 해제, 음소거를 책임 있는 모더레이터와 함께 기록하고 싶을 때
- 다른 관리자나 탈취된 계정이 한 역할, 채널, 권한 변경을 감시하고 싶을 때
- 음성 채널이 주요 대화 공간인 서버에서 음성 활동을 추적하고 싶을 때

## 로그 이벤트 유형

각 유형은 서로 다른 채널로 보내거나 끌 수 있어요. 아래 값은 `log` 명령어에서 쓸 수 있고 대시보드에도 표시되는 값이에요.

| 유형 | 대시보드 라벨 | 기록되는 시점 |
| --- | --- | --- |
| `MessageUpdated` | 메시지 수정됨 | 메시지 내용이 수정될 때(봇 작성자와 내용이 바뀌지 않은 경우는 건너뛰어요) |
| `MessageDeleted` | 메시지 삭제됨 | 메시지가 삭제될 때 |
| `MessagesBulkDeleted` | 여러 메시지 일괄 삭제됨 | 여러 메시지가 한꺼번에 정리될 때. 캐시된 메시지 수가 함께 기록돼요 |
| `ReactionEvents` | 반응 이벤트 | 반응이 추가되거나 제거될 때. 메시지마다 5초 단위로 묶어서 기록돼요 |
| `ThreadCreated` | 스레드 생성됨 | 스레드가 만들어질 때 |
| `ThreadDeleted` | 스레드 삭제됨 | 스레드가 삭제될 때 |
| `ThreadUpdated` | 스레드 업데이트됨 | 스레드의 이름, 보관 상태 등이 바뀔 때 |
| `UsernameUpdated` | 사용자 이름 변경됨 | 멤버의 전역 사용자 이름이 바뀔 때 |
| `NicknameUpdated` | 닉네임 변경됨 | 멤버의 서버 닉네임이 바뀔 때 |
| `UserUpdated` | 사용자 업데이트됨 | 프로필 사진이나 전역 이름 등 멤버의 프로필이 바뀔 때 |
| `UserJoined` | 사용자 입장 | 멤버가 서버에 들어올 때 |
| `UserLeft` | 사용자 퇴장 | 멤버가 나가거나 추방될 때 |
| `UserRoleAdded` | 사용자 역할 추가됨 | 한 개 이상의 역할이 멤버에게 부여될 때 |
| `UserRoleRemoved` | 사용자 역할 제거됨 | 한 개 이상의 역할이 멤버에게서 제거될 때 |
| `UserBanned` | 사용자 차단됨 | 멤버가 차단될 때 |
| `UserUnbanned` | 사용자 차단 해제됨 | 차단이 해제될 때 |
| `UserMuted` | 사용자 음소거됨 | 멤버가 음성이나 텍스트에서 음소거될 때 |
| `VoicePresence` | 음성 활동 | 멤버가 음성 채널에 들어오거나, 나가거나, 이동하거나, 음소거 또는 헤드셋을 끄거나, 방송할 때 |
| `VoicePresenceTts` | 음성 활동 TTS | 멤버가 음성에서 TTS를 사용했을 수 있을 때. 감지는 최선을 다하는 방식이에요 |
| `ServerUpdated` | 서버 업데이트됨 | 서버 이름, 아이콘, 소유자 등 서버 설정이 바뀔 때 |
| `EventCreated` | 이벤트 생성됨 | 예약된 서버 이벤트가 만들어질 때 |
| `InviteCreated` | 초대 생성됨 | 초대가 만들어질 때. 최대 유효 기간과 사용 횟수가 함께 기록돼요 |
| `InviteDeleted` | 초대 삭제됨 | 초대가 삭제될 때 |
| `RoleCreated` | 역할 생성됨 | 역할이 만들어질 때 |
| `RoleDeleted` | 역할 삭제됨 | 역할이 삭제될 때 |
| `RoleUpdated` | 역할 업데이트됨 | 역할의 이름, 색상, 권한이 바뀔 때 |
| `ChannelCreated` | 채널 생성됨 | 채널이 만들어질 때 |
| `ChannelDestroyed` | 채널 삭제됨 | 채널이 삭제될 때 |
| `ChannelUpdated` | 채널 업데이트됨 | 채널의 이름, 주제, 권한이 바뀔 때 |
| `Other` | 기타 | 위에 없는 기타 이벤트 |

대시보드에는 **프로필 사진 변경**(프로필 사진 변경됨) 항목도 있어요. 이 항목은 다른 항목과 함께 저장되며, Users와 All 카테고리에서 설정되지만, `log` 명령어에 넣을 수 있는 값은 아니에요.

## 카테고리

`logcategory`를 사용하면 한 번에 여러 이벤트 유형을 같은 채널로 지정할 수 있어요. 채널 없이 실행하면 해당 그룹의 모든 유형을 비워요.

| 카테고리 | 설정되는 유형 |
| --- | --- |
| `All` | 위의 모든 유형 |
| `Users` | NicknameUpdated, AvatarUpdated, UsernameUpdated, UserRoleAdded, UserRoleRemoved, VoicePresence, UserJoined, UserLeft, UserUpdated |
| `Threads` | ThreadCreated, ThreadDeleted, ThreadUpdated |
| `Roles` | RoleCreated, RoleDeleted, RoleUpdated |
| `Server` | ServerUpdated, EventCreated, InviteCreated, InviteDeleted |
| `Channel` | ChannelCreated, ChannelDestroyed, ChannelUpdated |
| `Messages` | MessageDeleted, MessageUpdated, MessagesBulkDeleted, ReactionEvents |
| `Moderation` | UserMuted, UserBanned, UserUnbanned, Other |
| `None` | 모든 유형을 비워요(대시보드의 **모두 비활성화**(모두 끄기)에서 사용) |

## 무시된 채널

무시 목록에 있는 채널 안에서 일어난 메시지, 스레드, 채널, 음성 이벤트는 건너뛰어요. 스레드는 상위 채널의 설정을 그대로 따르므로, 포럼이나 텍스트 채널을 무시하면 그 안의 스레드도 함께 무시돼요. 음성 채널을 무시하면 해당 채널로 들어오고 나가는 음성 활동 로그가 억제돼요.

채널을 무시해도 멤버, 역할, 서버 이벤트는 막지 않아요. 이 이벤트는 특정 채널과 관련이 없기 때문이에요.

## 설정

로깅 페이지에는 **로그 채널**(로그 채널)와 **Ignored Channels**(무시된 채널) 두 개의 탭이 있어요.

| 설정 | 기본값 | 제어하는 내용 |
| --- | --- | --- |
| Log Channels (로그 채널) | 없음 | 이벤트 유형마다 채널 선택기가 있으며, Popular, Users, Messages, Moderation, Server, Channels, Roles, Threads, Voice, All Events 그룹으로 나뉘어요 |
| Clear Category (카테고리 지우기) | | 보고 있는 그룹의 모든 선택기를 비워요. **설정 저장**(설정 저장)을 누르면 적용돼요 |
| Clear All (모두 지우기) | | **모든 이벤트** 그룹에 표시되며, 모든 선택기를 비워요. 저장할 때 적용돼요 |
| Disable All (모두 끄기) | | 채널이 하나라도 설정되어 있을 때 보이는 헤더 버튼이에요. 확인 후 모든 이벤트 유형의 지정을 즉시 해제하고, 무시된 채널은 유지해요 |
| Ignored Channels (무시된 채널) | 없음 | 기록에서 제외할 채널이며, **Active Channels**(활성 채널)와 **Ignored Channels** 목록 사이에서 옮길 수 있어요 |

> [!TIP]
> **인기**(인기) 그룹에는 User Joined, User Left, Message Deleted, Message Updated, User Banned, User Unbanned, Channel Created, Channel Destroyed가 들어 있어요. 대부분의 서버에 좋은 시작점이에요.

## 설정 순서

1. 스태프만 읽을 수 있는 비공개 로그 채널을 하나 이상 만드세요.
2. 대시보드에서 **로깅**(로깅)을 열고 **로그 채널**(로그 채널) 탭에 머무르세요.
3. **인기** 그룹에서 원하는 이벤트마다 로그 채널을 고르고 저장하세요.
4. **모더레이션**이나 **음성** 같은 다른 그룹으로 이동해서 필요한 항목에 채널을 지정하세요.
5. **Ignored Channels**(무시된 채널) 탭을 열어서 스태프 방과 봇 명령어 채널을 무시 목록으로 옮기세요.
6. 테스트 메시지를 삭제하고, 로그가 올바른 채널에 나타나는지 확인하세요.

## 명령어

서버의 접두사로 실행하세요(변경하지 않았다면 `.`). 슬래시 버전은 `/log` 아래에 있어요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `log <type> [#channel]` | | 관리자 | 이벤트 유형 하나를 채널로 보내요. 채널을 생략하면 현재 채널을 써요 |
| `log #channel [types...]` | | 관리자 | 여러 유형을 한 채널로 보내요. 유형을 주지 않으면 전체 유형의 선택 메뉴를 열어요 |
| `log "#channel:Type1,Type2" ...` | | 관리자 | 한 메시지에서 여러 채널과 유형 쌍을 설정해요 |
| `logcategory <category> [#channel]` | `logcat` | 관리자 | 카테고리 전체를 채널로 지정하거나, 채널 없이 실행해 비워요 |
| `logevents` | | 관리자 | 모든 이벤트 유형과 현재 사용 중인 채널을 나열해요 |
| `logignore [#channel]` | `lignore` | 관리자 | 채널을 무시 목록에 넣거나 빼요. 기본값은 현재 채널이에요 |
| `logignorelist` | `lignorel` | 관리자 | 무시 목록을 보여줘요 |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | 관리자 | 봇 명령어 사용을 채널에 기록해요. 채널 없이 실행하면 꺼요 |

> [!EXAMPLE]
> `log "#mod-logs:UserBanned,UserUnbanned,UserMuted" "#message-logs:MessageDeleted,MessageUpdated"`

## 팁과 주의 사항

- 봇에 **감사 로그 보기**(감사 로그 보기) 권한을 주세요. 이 권한이 없으면 로그는 계속 게시되지만, 어떤 모더레이터가 메시지를 삭제했는지, 누군가를 차단했는지, 역할을 바꿨는지는 알 수 없어요.
- 봇은 각 로그 채널을 보고 메시지를 보낼 수 있어야 해요. 봇이 볼 수 없는 로그 채널은 오류 없이 건너뛰어요.
- 삭제되거나 수정된 메시지 로그는 봇의 메시지 캐시에 의존해요. 봇이 마지막으로 재시작되기 전에 보낸 메시지나 대량 정리로 삭제된 메시지는 캐시되지 않은 것으로 보일 수 있어요.
- 반응 로그는 묶어서 기록돼요. 한 메시지에 대한 반응 변화가 약 5초 안에 일어나면 하나의 항목으로 도착해서, 활발한 서버에서 로그가 넘치지 않아요.
- `log #channel`로 열리는 선택 메뉴는 메뉴당 최대 25개의 유형을 보여주며, 이미 그 채널로 보내고 있는 유형은 미리 선택되어 있어요.
- `logcategory`는 카테고리에 속한 모든 유형을 덮어쓰며, 다른 채널로 라우팅되어 있던 유형도 포함돼요. 그 뒤에 개별 유형만 바꾸려면 `log`를 사용하세요.

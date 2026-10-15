---
title: 명령어 권한
slug: permissions
summary: 허용 및 거부 규칙을 순서대로 적용해서 누가 어떤 명령어를 어디서 쓸 수 있는지 정해요. 규칙은 서버 전체, 역할, 채널, 카테고리 또는 개별 멤버 단위로 설정할 수 있어요.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Permissions
tags: [permissions, command permissions, allow, deny, permission role, verbose, disable command, disable module, cooldown, dpo, permission override, blacklist, 권한, 명령어 권한, 허용, 거부, 권한 역할, 상세 메시지, 명령어 비활성화, 모듈 비활성화, 쿨다운, 권한 재정의, 블랙리스트]
related: [administration, help, filter, moderation]
---

## 기능 소개

기본적으로 모든 명령어는 Discord 권한이 허용하는 모든 사람이 쓸 수 있어요. 명령어 권한은 여기에 서버별 규칙 목록을 더해줘요. 각 규칙은 명령어, 모듈 또는 모든 모듈을 서버 전체, 역할, 채널, 카테고리 또는 멤버 한 명에 대해 허용할지 거부할지 정해요. 누군가 명령어를 실행하면 봇은 목록을 위에서부터 확인하고, 처음으로 맞는 규칙을 적용해서 명령어를 통과시키거나 막아요.

차단된 명령어는 **상세 메시지** 모드가 켜져 있지 않으면 조용히 무시돼요. 상세 메시지가 켜져 있으면 봇이 명령어를 막은 규칙의 번호와 내용을 답장으로 알려줘요. 슬래시 명령어는 항상 임시 메시지로 이유를 보여줘요.

규칙은 관리자나 직접 고른 **권한 역할**을 가진 사람이 관리할 수 있어요. 같은 목록이 대시보드의 **관리** 아래 **자동화 및 설정** 섹션에 **명령어 권한** 카드로도 있어요.

관련 기능이 두 가지 더 있어요. 명령어 쿨다운은 서버에서 멤버가 명령어를 얼마나 자주 쓸 수 있는지 제한해요. 관리 모듈의 Discord 권한 재정의는 명령어가 기본으로 요구하는 Discord 권한을 바꿔줘요. 예를 들어 메시지 관리 권한이 있는 사람이 원래 관리자 권한이 필요한 명령어를 쓸 수 있게 할 수 있어요.

## 이런 때 써요

- 재미있는 명령어나 NSFW 명령어를 진지한 채널에서 막고 싶을 때
- 음악 모듈을 봇 명령어 채널을 제외한 모든 곳에서 끄고 싶을 때
- 도우미 역할이 메시지 관리나 관리자 권한 없이 `warn`을 쓰게 하고 싶을 때
- 방해가 되는 멤버 한 명이 봇을 쓰지 못하게 하고 싶을 때
- `roll`처럼 자주 쓰이는 명령어를 멤버당 10초에 한 번으로 제한하고 싶을 때

## 규칙 작성법

모든 규칙은 세 부분으로 이루어져요.

| 항목 | 선택지 |
| --- | --- |
| 대상 | 명령어 하나, 모듈 하나 또는 모든 모듈 |
| 적용 범위 | 서버 전체, 역할, 채널, 카테고리 또는 특정 사용자 |
| 동작 | 허용 또는 거부 |

아래 표의 명령어 이름에 처음 두 부분이 담겨 있어요. 첫 글자는 적용 범위를 나타내고(`s` 서버, `r` 역할, `c` 채널, `ca` 카테고리, `u` 사용자), 마지막 부분은 대상을 나타내요(`cmd` 명령어, `mdl` 모듈). `all...mdls` 형태는 모든 모듈을 뜻해요.

| 명령어 | 생성되는 규칙 |
| --- | --- |
| `srvrcmd <command> <enable|disable>` | 서버 전체에 대한 명령어 규칙 |
| `srvrmdl <module> <enable|disable>` | 서버 전체에 대한 모듈 규칙 |
| `allsrvrmdls <enable|disable>` | 서버 전체에 대한 모든 모듈 규칙 |
| `rolecmd <command> <enable|disable> <role>` | 역할에 대한 명령어 규칙 |
| `rolemdl <module> <enable|disable> <role>` | 역할에 대한 모듈 규칙 |
| `allrolemdls <enable|disable> <role>` | 역할에 대한 모든 모듈 규칙 |
| `chnlcmd <command> <enable|disable> <#channel>` | 채널에서의 명령어 규칙 |
| `chnlmdl <module> <enable|disable> <#channel>` | 채널에서의 모듈 규칙 |
| `allchnlmdls <enable|disable> <#channel>` | 채널에서의 모든 모듈 규칙 |
| `catcmd <command> <enable|disable> <category>` | 카테고리의 모든 채널에서의 명령어 규칙 |
| `catmdl <module> <enable|disable> <category>` | 카테고리에서의 모듈 규칙 |
| `allcatmdls <enable|disable> <category>` | 카테고리에서의 모든 모듈 규칙 |
| `usrcmd <command> <enable|disable> @user` | 멤버 한 명에 대한 명령어 규칙 |
| `usrmdl <module> <enable|disable> @user` | 멤버 한 명에 대한 모듈 규칙 |
| `allusrmdls <enable|disable> @user` | 멤버 한 명에 대한 모든 모듈 규칙 |

채팅 트리거도 명령어로 취급해요. 명령어 이름이 들어가는 자리에 트리거의 번호나 텍스트를 넣으면 돼요.

> [!EXAMPLE]
> `srvrmdl nsfw disable`을 실행한 다음 `chnlmdl nsfw enable #adult`를 실행하면 NSFW 모듈이 한 채널을 제외한 모든 곳에서 막혀요.

## 규칙 순서

`listperms`는 규칙을 1번부터 번호를 매겨 보여줘요. 1번 규칙은 항상 "서버 전체에서 모든 모듈 허용"이고, 수정하거나 삭제할 수 없어요. 다른 규칙이 하나도 맞지 않을 때 적용되는 기본값이에요.

새 규칙은 목록 맨 끝에 추가돼요. 명령어가 실행되면 봇은 번호가 높은 규칙부터 1번 쪽으로 확인하고, 대상과 적용 범위가 모두 맞는 첫 규칙이 결과를 정해요. 그래서 마지막에 추가된 규칙이 이겨요. 위 예시가 제대로 동작하는 이유는 채널 허용 규칙이 서버 거부 규칙 뒤에 추가되었기 때문이에요.

`moveperm <from> <to>`는 규칙의 위치를 바꾸고 번호를 다시 매겨요. 그래서 넓은 규칙보다 예외 규칙을 위나 아래로 옮길 수 있고, 규칙을 새로 만들 필요가 없어요. `removeperm <number>`는 규칙 하나를 삭제해요. `resetperms`는 목록을 1번 규칙만 남기고 모두 지우며, 관리자 권한이 필요해요.

대시보드에도 같은 규칙이 나오고, 각 규칙마다 위로 이동, 아래로 이동 화살표와 삭제 버튼이 있어요.

## 상세 메시지 모드

`verbose`는 차단된 텍스트 명령어에 어떤 규칙이 막았는지 알려주는 오류 메시지를 보낼지 정해요. 예를 들어 "permission 4 (`.chnlmdl nsfw disable #general`) prevents this"처럼 표시돼요. 기본값은 꺼짐이에요. 꺼져 있으면 차단된 명령어는 조용히 무시되는데, 대부분의 서버에는 이 방식이 맞고 멤버가 실행할 수 없는 명령어를 계속 시도하는 것을 막아줘요. 슬래시 명령어는 이 설정과 상관없이 항상 임시 메시지로 이유를 알려줘요.

## 규칙을 바꿀 수 있는 사람

이 모듈의 모든 명령어에는 추가 확인이 있어요. 관리자는 언제든 사용할 수 있어요. 그 밖의 사람은 `permrole <role>`로 설정한 **권한 역할**이 있어야 해요. 권한 역할이 없으면 관리자가 아닌 사람에게 관리자 권한이 필요하다고 알리고(상세 메시지가 켜져 있을 때만), 명령어는 실행되지 않아요. 인수 없이 `permrole`만 입력하면 현재 역할을 보여주고, `permrole reset`은 역할을 지워요. `@everyone` 역할은 사용할 수 없어요.

`resetperms`와 `permrole` 자체는 위 조건과 별개로 항상 관리자 권한이 필요해요.

## 쿨다운

`cmdcooldown <command> [time]`은 이 서버에서 명령어마다 멤버별 쿨다운을 설정해요. 1초부터 90000초(25시간)까지 설정할 수 있어요. 시간을 적지 않거나 `0s`를 입력하면 쿨다운이 해제돼요. `allcmdcooldowns`는 현재 쿨다운 목록을 보여줘요. 이 설정은 명령어에 원래 있는 내장 쿨다운에 더해 적용돼요.

## Discord 권한 재정의

관리 모듈은 명령어가 요구하는 Discord 권한을 바꿀 수 있어요. `dpo <command> <permissions...>`를 실행하면 명령어가 기본 권한 대신 입력한 권한을 요구해요. 예를 들어 `dpo purge ManageMessages`처럼 써요. `dpo <command>`를 권한 없이 실행하면 재정의를 지우고, `dpol`은 목록을 보여주고, `dpor`은 확인 후 모든 재정의를 지워요. 세 가지 모두 관리자 권한이 필요해요.

재정의는 Discord 권한 요구 조건만 바꿔요. 위의 명령어 권한 규칙은 그대로 적용돼요. `help <command>` 명령어 페이지에는 원래 요구 조건에 취소선이 그어져 있고, 옆에 재정의된 권한이 표시돼요.

## help의 빠른 메뉴

`help <command>`는 관리자에게 권한 버튼을 보여줘요. 이 버튼을 누르면 해당 명령어에만 적용되는 빠른 메뉴가 열려요. 메뉴에는 명령어에 영향을 주는 규칙이 나오고, 중복 규칙(대상과 적용 범위가 같은 규칙 두 개)을 경고하며, 해결을 제안해요. 또 help 페이지를 벗어나지 않고 명령어에 대한 허용 및 거부 규칙을 추가하거나 명령어 권한을 초기화할 수 있어요.

## 봇 소유자 설정

세 가지 명령어 그룹은 봇 소유자만 쓸 수 있고, 모든 서버에 영향을 줘요. 전역 권한(`globalmodule`, `globalcommand`, `globalpermlist`, `resetglobalperms`)은 모듈이나 명령어를 어디서든 끄고, 블랙리스트(`userblacklist`, `channelblacklist`, `serverblacklist`, `manualblacklistcheck`)는 사용자, 채널 또는 서버에 봇이 아예 응답하지 않게 해요. 전역으로 꺼진 모듈은 help 메뉴에 지구본과 X 표시로 나타나요.

## 대시보드 설정

대시보드에서 **관리**를 연 다음 **자동화 및 설정** 섹션으로 가고, **명령어 권한** 카드를 열면 돼요.

| 설정 | 기본값 | 역할 |
| --- | --- | --- |
| 상세 권한 메시지 | 꺼짐 | 규칙이 명령어를 막았을 때 사용자에게 알려줘요 |
| 권한 역할 | 없음 | 이 역할을 가진 멤버는 명령어로 규칙을 바꿀 수 있어요 |
| 규칙 | 1번 규칙만 | 순서가 있는 규칙 목록이에요. **동작**, **대상**, **적용 범위**를 고른 다음 모듈, 명령어, 역할, 채널, 카테고리 또는 사용자 ID를 입력해서 추가해요 |

이 카드에는 사용자 지정 규칙 수와 상세 메시지 모드가 켜져 있는지도 나와요. 같은 섹션의 **권한 재정의** 카드는 Discord 권한 재정의를 관리해요. 봇 명령어를 고르고, 기본 권한 대신 요구할 **필요한 Discord 권한**을 정하면 돼요.

## 설정 순서

1. 기본 방식을 정해요. 보통 "모두 허용하고 일부만 거부"하거나 "모두 거부하고 봇 채널에서만 허용"하는 방식이에요.
2. 두 번째 방식을 쓴다면 `allsrvrmdls disable`을 실행한 다음 `allchnlmdls enable #bot-commands`를 실행해요.
3. 스태프가 계속 모더레이션을 쓸 수 있게 해요. `rolemdl moderation enable @Mods`와 `rolemdl administration enable @Mods`를 실행해요.
4. `listperms`를 실행하고 아래에서 위로 읽어요. 봇도 이 순서로 확인하기 때문이에요. 예외가 덮어써야 할 규칙보다 아래에 있다면 `moveperm`으로 옮겨요.
5. 신뢰하는 스태프에게 `permrole @Mods`를 설정해서 관리자 권한 없이도 규칙을 조정할 수 있게 해요.
6. 테스트하는 동안 `verbose`를 켜서 어떤 규칙이 적용되는지 확인하고, 끝나면 다시 꺼요.

## 명령어

서버의 접두사로 실행하세요(변경하지 않았다면 `.`). 슬래시 명령어는 `/permissions` 아래에 있어요. 예: `/permissions servercommand`.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `listperms` | `lp` | 관리자 또는 권한 역할 | 번호가 매겨진 규칙 목록 보기 |
| `verbose [true|false]` | `v` | 관리자 또는 권한 역할 | 차단 메시지 켜기 또는 끄기 |
| `permrole [role|reset]` | `pr` | 관리자 | 권한 역할 보기, 설정 또는 초기화 |
| `removeperm <number>` | `rp` | 관리자 또는 권한 역할 | 규칙 삭제 |
| `moveperm <from> <to>` | `mp` | 관리자 또는 권한 역할 | 규칙 순서 바꾸기 |
| `resetperms` | | 관리자 | 모든 규칙 삭제 |
| `srvrcmd <command> <enable|disable>` | `sc` | 관리자 또는 권한 역할 | 서버 전체 명령어 규칙 |
| `srvrmdl <module> <enable|disable>` | `sm` | 관리자 또는 권한 역할 | 서버 전체 모듈 규칙 |
| `allsrvrmdls <enable|disable>` | `asm` | 관리자 또는 권한 역할 | 서버 전체 모든 모듈 |
| `rolecmd <command> <enable|disable> <role>` | `rc` | 관리자 또는 권한 역할 | 역할의 명령어 규칙 |
| `rolemdl <module> <enable|disable> <role>` | `rm` | 관리자 또는 권한 역할 | 역할의 모듈 규칙 |
| `allrolemdls <enable|disable> <role>` | `arm` | 관리자 또는 권한 역할 | 역할의 모든 모듈 |
| `chnlcmd <command> <enable|disable> <#channel>` | `cc` | 관리자 또는 권한 역할 | 채널의 명령어 규칙 |
| `chnlmdl <module> <enable|disable> <#channel>` | `cm` | 관리자 또는 권한 역할 | 채널의 모듈 규칙 |
| `allchnlmdls <enable|disable> <#channel>` | `acm` | 관리자 또는 권한 역할 | 채널의 모든 모듈 |
| `catcmd <command> <enable|disable> <category>` | `cac` | 관리자 또는 권한 역할 | 카테고리의 명령어 규칙 |
| `catmdl <module> <enable|disable> <category>` | `cam` | 관리자 또는 권한 역할 | 카테고리의 모듈 규칙 |
| `allcatmdls <enable|disable> <category>` | `acamds` | 관리자 또는 권한 역할 | 카테고리의 모든 모듈 |
| `usrcmd <command> <enable|disable> @user` | `uc` | 관리자 또는 권한 역할 | 멤버의 명령어 규칙 |
| `usrmdl <module> <enable|disable> @user` | `um` | 관리자 또는 권한 역할 | 멤버의 모듈 규칙 |
| `allusrmdls <enable|disable> @user` | `aum` | 관리자 또는 권한 역할 | 멤버의 모든 모듈 |
| `cmdcooldown <command> [time]` | `cmdcd` | 관리자 또는 권한 역할 | 쿨다운 설정 또는 해제 |
| `allcmdcooldowns` | `acmdcds` | 관리자 또는 권한 역할 | 쿨다운 목록 보기 |
| `discordpermoverride <command> [permissions...]` | `dpo` | 관리자 | Discord 권한 재정의 설정 또는 해제 |
| `discordpermoverridelist` | `dpol`, `dpoli` | 관리자 | 재정의 목록 보기 |
| `discordpermoverridereset` | `dpor` | 관리자 | 모든 재정의 지우기 |
| `globalmodule <module>` | `gmod` | 봇 소유자 | 모듈을 모든 곳에서 켜기 또는 끄기 |
| `globalcommand <command>` | `gcmd` | 봇 소유자 | 명령어를 모든 곳에서 켜기 또는 끄기 |
| `globalpermlist` | `gpl`, `lgp`, `globalperms`, `listglobalperms` | 봇 소유자 | 전역 차단 목록 보기 |
| `resetglobalperms` | | 봇 소유자 | 전역 차단 지우기 |
| `userblacklist <add|remove> <user> [reason]` | `ubl` | 봇 소유자 | 사용자 블랙리스트 추가 또는 제거 |
| `channelblacklist <add|remove> <id> [reason]` | `cbl` | 봇 소유자 | 채널 블랙리스트 추가 또는 제거 |
| `serverblacklist <add|remove> <server> [reason]` | `sbl` | 봇 소유자 | 서버 블랙리스트 추가 또는 제거 |
| `manualblacklistcheck` | `manualblcheck`, `mbc` | 봇 소유자 | 블랙리스트 적용 다시 실행 |

## 팁과 주의할 점

- `resetperms`는 규칙 검사에서 제외돼 있어요. 그래서 관리자라면 모든 것을 막아버린 규칙이 생겨도 언제든 복구할 수 있어요.
- 규칙은 명령어의 기본 이름으로 매칭돼요. 그래서 `srvrcmd clear disable`과 `srvrcmd purge disable`은 같은 규칙이에요. `help <command>`에 나오는 첫 번째 이름을 사용하세요.
- "모든 모듈" 규칙에는 권한 모듈도 포함돼요. 역할 하나에 모든 것을 거부하면, 그 역할만 가진 멤버는 `listperms`도 실행할 수 없어요.
- 카테고리 규칙은 명령어를 실행하는 시점의 채널 상위 카테고리를 기준으로 해요. 스레드는 상위 채널의 규칙을 따라요.
- Discord 권한 재정의는 필요한 Discord 권한만 바꾸고, 누가 쓸 수 있는지는 바꾸지 않아요. 두 가지를 함께 쓰세요. 재정의로 기준을 낮추고, 규칙으로 쓸 수 있는 곳을 제한하면 돼요.
- 권한 규칙은 DM에서는 적용되지 않아요.
- 대시보드에서 대상 선택지는 **서버 전체**, **역할**, **채널**, **카테고리**, **특정 사용자**로 표시되고, 사용자 옵션은 붙여넣은 사용자 ID를 받아요.

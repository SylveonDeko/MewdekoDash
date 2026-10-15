---
title: 서버 관리
slug: servermanagement
summary: 서버의 구조를 한 번에 관리하는 도구예요. 채널과 역할을 만들고 삭제하고, 수백 명의 멤버에게 역할을 한꺼번에 부여하고, 서버를 잠그고, 채널 권한 재정의를 동기화하고, 이모지를 훔치고, 위험한 역할 변경을 감시할 수 있어요.
icon: fa-server
category: Actions
module: ServerManagement
tags: [server management, roles, mass role, channels, lockdown, slowmode, lock channel, nuke, emotes, steal emotes, webhook, permcontrol, role monitor, role jobs, server icon, server banner, 서버 관리, 역할, 대량 역할, 채널, 서버 잠금, 저속 모드, 채널 잠금, 채널 재생성, 이모지, 이모지 훔치기, 웹후크, 권한 제어, 역할 감시, 역할 작업, 서버 아이콘, 서버 배너]
related: [administration, permissions, moderation]
---

## What it does

서버 관리는 멤버가 아니라 서버의 구조를 바꾸는 명령어를 모아 둔 모듈이에요. 스태프는 한 줄로 카테고리와 그 안의 채널을 모두 만들 수 있어요. 채널 이름을 바꾸거나 삭제하고, 주제를 설정하고, NSFW를 켜고 끄고, 저속 모드를 설정하고, 채널을 잠그고, 채널을 삭제했다가 다시 만들어 기록을 지울 수도 있어요.

역할 기능이 가장 많이 쓰여요. 일회성 명령어로 역할을 만들고, 이름을 바꾸고, 색을 바꾸고, 따로 표시하고, 삭제할 수 있어요. 한 명의 멤버에게 역할을 주는 것도 가능하고, 선택적으로 타이머를 설정할 수도 있어요. 대량 명령어는 모든 멤버, 모든 사람, 모든 봇, 다른 역할을 가진 모든 사용자, 또는 특정 시점 이전이나 이후에 가입한 모든 사용자에게 역할을 추가하거나 제거해요. 이 작업들은 백그라운드 작업으로 실행되며, 목록을 확인하거나 중지할 수 있어요.

이 모듈은 서버 자체의 외관(아이콘, 배너, 스플래시, 이름), 다른 서버에서 이모지를 훔치는 것을 포함한 이모지 관리, 채널별 권한 재정의, 음성 채널 이동, 세 가지 종류의 잠금, 위험한 역할 변경을 되돌리고 처벌하는 역할 감시기도 다뤄요.

이 기능은 대시보드에서 설정하지 않아요. 모든 작업은 명령어로 실행해요.

## Why you would use it

- 새 서버를 만들 때 Discord UI에서 열 번 클릭하지 않고 카테고리 아래에 채널 열 개를 한 번에 만들고 싶을 때.
- 역할 게이팅을 켠 뒤 기존 멤버 이천 명에게 "Member" 역할을 부여해야 할 때.
- 습격 중에 아무도 글을 쓰지 못하도록 서버를 잠그고, 나중에 기존 권한을 정확히 복원하고 싶을 때.
- 친구의 서버에서 이모지를 명령어 한 번으로 복사하고 싶을 때.
- 모더레이터가 역할에 차단된 권한을 추가해 스스로 관리자 권한을 얻는 것을 막고 싶을 때.

## Channels

### Creating and editing

`creatxtchanl <name>`과 `creatvoichanl <name>`은 텍스트 채널이나 음성 채널을 하나 만들어요. `deltxtchanl <#channel>`과 `delvoichanl <channel>`은 하나를 삭제해요.

`cc...` 계열 명령어는 여러 채널을 한 번에 만들어요.

| Command | What it creates |
| --- | --- |
| `ccatc <category name> <channel names...>` | 새 카테고리와 그 안의 텍스트 채널 |
| `ccavc <category name> <channel names...>` | 새 카테고리와 그 안의 음성 채널 |
| `cctc <existing category> <channel names...>` | 이미 있는 카테고리 안의 텍스트 채널 |
| `ccvc <existing category> <channel names...>` | 이미 있는 카테고리 안의 음성 채널 |

`renamechannel <channel> <name>`은 어떤 채널이든 이름을 바꾸고, `setchanlname <name>`은 현재 있는 채널의 이름을 바꿔요. `settopic [text]`는 현재 채널의 주제를 설정하거나 지우고, `nsfwtoggle`은 현재 채널의 NSFW 설정을 전환해요.

### Slowmode, lock and nuke

`slowmode`를 단독으로 쓰면 현재 채널을 1분과 끔 사이에서 전환해요. `slowmode 30s`처럼 `slowmode <time>`을 쓰면 특정 간격을 설정하고, 두 형태 모두 채널 인자를 받을 수 있어요. 21600초(6시간) 이상의 값은 거부해요.

`lock [#channel]`은 해당 채널에서 `@everyone` 역할에 메시지 보내기 거부를 추가하고, `unlock [#channel]`은 그것을 제거해요. 기존 재정의 비트는 그대로 유지해요.

`nuke [#channel]`은 확인을 요청한 뒤 채널을 삭제하고, 같은 이름, 위치, 주제, 권한 덮어쓰기, NSFW 설정, 카테고리, 저속 모드를 가진 새 채널을 만들어요. 고정 메시지, 웹후크, 메시지 기록은 영원히 사라져요.

### Permission overrides

`permcontrol <channel> <allow|deny|inherit> <role or user> <permissions...>`는 채널에서 한 대상의 재정의를 수정하면서 다른 비트는 건드리지 않아요. `permview [@user or role]`은 나, 멤버, 또는 역할이 현재 어떤 권한을 가지고 있는지 보여줘요.

`syncroletoall <role>`은 현재 채널에 있는 역할의 재정의를 모든 텍스트 채널과 카테고리에 복사해요. `syncroletoallchannels`와 `syncroletoallcategories`는 채널만, 또는 카테고리만 대상으로 해요. 이 명령어를 실행하는 채널에 역할의 재정의가 이미 있어야 해요.

### Webhooks

`createwebhook <#channel> <name> [avatar url]`은 웹후크를 만들어요. URL을 주지 않고 이미지를 첨부하면 그 이미지가 아바타로 사용돼요. 봇은 채널에서 확인 메시지를 보내고, 웹후크 URL과 토큰은 DM으로 보내 줘요.

## Voice

- `moveto <voice channel>`은 나를 이동시켜요.
- `moveuserto @user <voice channel>`은 다른 사람을 이동시켜요.
- `grab @user`는 그 사람을 내가 있는 음성 채널로 끌어와요.

## Lockdown

`lockdown [type] [action] [override]`와 `liftlockdown [type]`은 관리자 권한이 필요해요.

| Type | What it does |
| --- | --- |
| `Joins` | 잠금이 활성화된 동안 들어오는 사람은 모두 추방되거나 차단돼요. 기본 동작은 `Ban`이고, 다른 옵션은 `Kick`뿐이에요. |
| `Readonly` | 봇이 모든 채널의 현재 `@everyone` 재정의를 저장한 뒤, 텍스트 채널에서는 메시지 보내기, 스레드 만들기, 스레드 답글을 거부하고, 음성 채널에서는 연결과 말하기를 거부해요. 포럼 채널은 기존 스레드를 계속 읽을 수 있도록 메시지 보내기를 유지해요. |
| `Full` | 위 두 가지를 모두 적용해요. |

읽기 전용 잠금을 적용하기 전에 봇은 모든 채널을 수정할 수 있는지 확인해요. 권한이 없는 채널이 있으면 목록을 보여 주고 중단해요. 세 번째 인자로 `true`를 주면 그래도 계속 진행해요. 잠금을 해제하면 저장해 둔 재정의가 복원돼요. 입장 잠금은 봇을 재시작해도 유지돼요.

`unlockdown`은 별도의 오래된 도구예요. `@everyone` 역할 자체를 수정해서 잠근 서버를 위해, 해당 역할의 메시지 보내기를 다시 켜요.

> [!WARNING]
> 인자 없이 `lockdown`을 실행하면 읽기 전용 잠금이 되고, `lockdown joins`는 기본적으로 들어오는 사람을 차단해요. 추방을 원하면 `kick`을 붙이세요.

## Roles

### Single role commands

| Command | What it does |
| --- | --- |
| `createrole [name]` | 역할을 만들어요. 멘션할 수 없어요 |
| `deleterole <role>` | 내 최상위 역할보다 아래에 있는 역할을 삭제해요 |
| `renamerole <role> <name>` | 역할의 이름을 바꿔요 |
| `rolecolor <role> [colour]` | 역할의 색을 보여 주거나 설정해요 |
| `rolehoist <role>` | 멤버 목록에서 역할을 따로 표시할지 전환해요 |
| `setrole <role> @user [time]` | 역할을 부여해요. `2h`처럼 `time`을 지정하면 그 뒤에 자동으로 제거돼요 |
| `removerole <role> @user` | 역할을 제거해요 |
| `removeallroles @user` | 멤버에게서 관리되지 않는 모든 역할을 제거해요 |

`setrole`과 `removerole`에서는 역할과 멤버 인자의 순서를 바꿔도 돼요.

### Several roles or members at once

- `createroles <names...>`는 목록을 확인한 뒤 단어마다 역할을 하나씩 만들어요.
- `deleteroles <roles...>`는 확인 후 여러 역할을 삭제해요. 관리되는 역할은 건너뛰어요.
- `setroles @user <roles...>`는 한 멤버에게 여러 역할을 부여해요. `setroles @user <time> <roles...>`는 기간이 있는 역할로 부여해요.
- `removeroles @user <roles...>`는 한 멤버에게서 여러 역할을 제거해요.
- `adduserstorole <role> @user @user...`와 `removeusersfromrole <role> @user @user...`는 여러 멤버를 대상으로 해요.

### Mass role jobs

이 명령어들은 전체 멤버 목록을 순회하며 백그라운드 작업으로 실행돼요. Discord 속도 제한 때문에 봇은 멤버마다 잠시 멈추고, 서버당 동시에 다섯 개의 작업만 허용해요. 각 작업은 예상 소요 시간을 알려 줘요.

| Command | Who is affected |
| --- | --- |
| `addtoall <role>` | 해당 역할이 없는 모든 멤버 |
| `addtoallusers <role>` | 사람만 |
| `addtoallbots <role>` | 봇만 |
| `addtousersover <time> <role>` | `time`(예: `30d`) 이상 전에 가입한 멤버 |
| `addtousersunder <time> <role>` | `time`보다 최근에 가입한 멤버 |
| `addroletorole <role> <role2>` | `role2`를 가진 모든 사람에게 `role`을 부여해요 |
| `addthenremove <role> <role2>` | `role2`를 가진 모든 사람에게 `role`을 부여한 뒤 `role2`를 제거해요 |
| `removefromall <role>` | 해당 역할을 가진 모든 사람 |
| `removefromallusers <role>` | 사람만 |
| `removefromallbots <role>` | 봇만 |
| `removefromrole <role> <role2>` | `role2`를 가진 모든 사람에게서 `role`을 제거해요 |

`rolejobs`는 실행 중인 작업을 종류, 시작한 사람, 진행 상황, 역할과 함께 보여 줘요. `stopjob <number>`는 작업 하나를 취소하고 어디까지 진행되었는지 알려 줘요.

### Export and import

`exportrolelist`는 봇이 관리할 수 있는 모든 역할에 대해 멤버십 한 건당 `roleId,userId,roleName` 한 줄이 담긴 `rolelist.txt` 파일을 보내요. `importrolelist`는 명령어에 첨부된 이 파일을 읽어 역할을 다시 적용해요. ID가 더 이상 없을 때 이름으로 역할을 만들려면 `true`를 주세요. `addroletolist <role>`은 첨부된 사용자 ID 목록을 읽고 그 사람들에게 역할을 부여해요.

## Server appearance and emotes

`seticon <url>`, `setbanner <url>`, `setsplash <url>`, `setservername <name>`은 서버 자체를 바꾸며 관리자 권한이 필요해요. `setguildavatar`, `setguildbanner`, `setguildbio`는 이 서버에서만 봇 자신의 모습을 바꾸며 서버 관리 권한이 필요해요.

이모지 명령어는 나와 봇 모두 표현 관리 권한이 필요해요.

- `addemote <name> [url]`은 URL이나 첨부된 이미지로 이모지를 업로드해요.
- `removeemote <emote>`와 `renameemote <emote> <name>`은 이 서버의 이모지에 적용해요.
- `stealemotes <emotes...>`는 메시지에 있는 모든 커스텀 이모지를 이 서버로 복사해요. `sfr <role> <emotes...>`도 같은 일을 하지만 이모지를 한 역할로만 제한해요.
- 메시지를 우클릭한 뒤 앱 메뉴에서 **Steal Emotes**나 **Steal Sticker**를 선택하면 입력하지 않고도 같은 일을 할 수 있어요.

## Role monitor

역할 감시기는 감사 로그를 지켜봐요. 멤버가 차단된 역할을 받거나, 역할이 차단된 권한을 얻으면 봇은 그 변경을 되돌리고 변경한 사람을 처벌해요. 서버 소유자만 설정할 수 있어요.

- `addblacklistedrole <role> [punishment]`과 `removeblacklistedrole <role>`.
- `addblacklistedpermission <permission> [punishment]`과 `removeblacklistedpermission <permission>`. 예: `addblacklistedpermission Administrator Ban`.
- `setdefaultpunishment <punishment>`은 차단 항목에 개별 처벌이 없을 때 적용할 처벌을 설정해요. 기본값은 `None`이에요.
- `addwhitelisteduser @user`, `addwhitelistedrole <role>`과 그 `remove...` 짝 명령어는 스태프를 감시기에서 제외해요. 화이트리스트에 있는 사람이 하거나 받은 변경은 무시해요.
- `listblacklists`는 위의 모든 목록을 보여 줘요.

처벌 값은 `None`, `Warn`, `Mute`, `ChatMute`, `VoiceMute`, `Timeout`, `Kick`, `Softban`, `Ban`, `RemoveRoles`, `AddRole`, `Delete`예요. 차단된 권한을 여러 개 한 번에 추가하면 가장 심한 처벌이 적용돼요.

## Settings

이 기능에는 대시보드 페이지가 없어요. 저장되는 설정은 역할 감시기와 잠금 상태뿐이에요.

| Setting | Default | What it controls |
| --- | --- | --- |
| Default punishment | None | 차단된 역할이나 권한에 처벌이 설정되어 있지 않을 때 적용돼요 |
| Blacklisted roles | none | 부여되면 제거되는 역할이며, 각각 선택적으로 처벌을 설정할 수 있어요 |
| Blacklisted permissions | none | 역할에 추가되면 되돌리는 권한이며, 각각 선택적으로 처벌을 설정할 수 있어요 |
| Whitelisted users and roles | none | 감시기에서 제외돼요 |
| Join lockdown action | Ban | 입장 잠금 중에 들어온 멤버에게 적용되는 동작이에요 |

## Setup walkthrough

1. 봇의 역할이 관리하려는 모든 역할보다 위에 있는지, 그리고 역할 관리와 채널 관리 권한이 있는지 확인하세요.
2. 구조를 만드세요. `ccatc Community general off-topic memes`를 실행하면 카테고리와 채널 세 개가 만들어져요.
3. 역할을 한 번에 만드세요. `createroles Member Regular Veteran`.
4. 기본 역할을 나눠 주세요. `addtoallusers Member`를 실행한 뒤 `rolejobs`로 진행 상황을 확인하세요.
5. 서버 소유자로서 서버를 보호하세요. `addblacklistedpermission Administrator Ban`과 `addwhitelistedrole Admin`.
6. 비상시에는 `lockdown full kick`을 기억해 두고, 한가한 날에 `liftlockdown full`을 실행해 테스트해 보세요.

## Commands

이 명령어는 서버의 접두사로 실행하세요(변경하지 않았다면 `.`).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `permview [@user or role]` | `pview` | 없음 | 허용된 권한 목록 보기 |
| `setsplash <url>` | `setserversplash`, `setsplashimage` | 관리자 | 초대 스플래시 설정 |
| `seticon <url>` | `setservericon`, `seticonimage` | 관리자 | 서버 아이콘 설정 |
| `setbanner <url>` | `setserverbanner` | 관리자 | 서버 배너 설정 |
| `setservername <name>` | | 관리자 | 서버 이름 변경 |
| `setguildavatar [url]` | `sgav`, `setgav` | 서버 관리 | 이 서버에서 봇의 아바타 |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | 서버 관리 | 이 서버에서 봇의 배너 |
| `setguildbio <text>` | `sgbio`, `setgbio` | 서버 관리 | 이 서버에서 봇의 소개 |
| `addemote <name> [url]` | `emoteadd`, `ae`, `ea` | 표현 관리 | 이모지 업로드 |
| `removeemote <emote>` | `deleteemote`, `emoteremove`, `emotedelete` | 표현 관리 | 이모지 삭제 |
| `renameemote <emote> <name>` | `emoterename` | 표현 관리 | 이모지 이름 변경 |
| `stealemotes <emotes...>` | `steal` | 표현 관리 | 이 서버로 이모지 복사 |
| `sfr <role> <emotes...>` | | 표현 관리 | 역할로 제한해 이모지 복사 |
| `creatxtchanl <name>` | `ctch` | 채널 관리 | 텍스트 채널 만들기 |
| `creatvoichanl <name>` | `cvch` | 채널 관리 | 음성 채널 만들기 |
| `deltxtchanl <#channel>` | `dtch` | 채널 관리 | 텍스트 채널 삭제 |
| `delvoichanl <channel>` | `dvch` | 채널 관리 | 음성 채널 삭제 |
| `ccatc <category> <names...>` | | 채널 관리 | 텍스트 채널이 있는 새 카테고리 |
| `ccavc <category> <names...>` | | 채널 관리 | 음성 채널이 있는 새 카테고리 |
| `cctc <category> <names...>` | | 채널 관리 | 기존 카테고리에 텍스트 채널 추가 |
| `ccvc <category> <names...>` | | 채널 관리 | 기존 카테고리에 음성 채널 추가 |
| `renamechannel <channel> <name>` | `channelrename` | 채널 관리 | 채널 이름 변경 |
| `setchanlname <name>` | `schn` | 채널 관리 | 현재 채널 이름 변경 |
| `settopic [text]` | `st` | 채널 관리 | 현재 주제 설정 또는 지우기 |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | 채널 관리 | NSFW 설정 전환 |
| `slowmode [time] [#channel]` | | 채널 관리 | 저속 모드 전환 또는 설정 |
| `lock [#channel]` | `channellock`, `lockchannel` | 메시지 관리 | 모두에게 메시지 보내기 거부 |
| `unlock [#channel]` | `channelunlock`, `unlockchannel` | 메시지 관리 | `lock` 취소 |
| `nuke [#channel]` | `channelnuke`, `nukechannel` | 채널 관리 | 채널을 삭제한 뒤 다시 만들기 |
| `permcontrol <channel> <allow|deny|inherit> <role or user> <perms...>` | `permc` | 채널 관리 | 채널 재정의 수정 |
| `syncroletoall <role>` | `synctoall` | 채널 관리 | 모든 채널과 카테고리에 재정의 복사 |
| `syncroletoallchannels <role>` | `srtch`, `srtach` | 채널 관리 | 텍스트 채널에 재정의 복사 |
| `syncroletoallcategories <role>` | `srtc`, `srtac` | 채널 관리 | 카테고리에 재정의 복사 |
| `createwebhook <#channel> <name> [avatar]` | `cwh` | 관리자 | 웹후크 만들기 |
| `moveto <voice channel>` | | 없음 | 나 자신을 이동 |
| `moveuserto @user <voice channel>` | `moveuto` | 채널 관리 | 다른 사람 이동 |
| `grab @user` | `getoverhere` | 없음 | 그 사람을 내 음성 채널로 끌어오기 |
| `lockdown [joins|readonly|full] [kick|ban] [true]` | `lockdownserver` | 관리자 | 잠금 시작 |
| `liftlockdown [type]` | `unlockserver` | 관리자 | 잠금 종료 |
| `unlockdown` | `endlockdown` | 채널 관리 | `@everyone`의 메시지 보내기 다시 켜기 |
| `createrole [name]` | `cr` | 역할 관리 | 역할 만들기 |
| `deleterole <role>` | `dr` | 역할 관리 | 역할 삭제 |
| `renamerole <role> <name>` | `renr` | 역할 관리 | 역할 이름 변경 |
| `rolecolor <role> [colour]` | `roleclr` | 색 설정 시 역할 관리 | 역할 색 보기 또는 설정 |
| `rolehoist <role>` | `rh` | 역할 관리 | 따로 표시 전환 |
| `setrole <role> @user [time]` | `sr`, `giverole` | 역할 관리 | 역할 부여(기간 지정 가능) |
| `removerole <role> @user` | `rr` | 역할 관리 | 역할 제거 |
| `removeallroles @user` | `rar` | 역할 관리 | 모든 역할 제거 |
| `createroles <names...>` | `croles`, `crs` | 역할 관리 | 역할 여러 개 만들기 |
| `deleteroles <roles...>` | `drs` | 역할 관리 | 역할 여러 개 삭제 |
| `setroles @user [time] <roles...>` | `srs` | 역할 관리 | 역할 여러 개 부여 |
| `removeroles @user <roles...>` | `rrs` | 역할 관리 | 역할 여러 개 제거 |
| `adduserstorole <role> @users...` | `autr` | 역할 관리 | 여러 멤버에게 역할 하나 부여 |
| `removeusersfromrole <role> @users...` | `rufr` | 역할 관리 | 여러 멤버에게서 역할 하나 제거 |
| `addtoall <role>` | `ata` | 역할 관리 | 모든 멤버에게 역할 부여 |
| `addtoallusers <role>` | `atau` | 역할 관리 | 모든 사람에게 역할 부여 |
| `addtoallbots <role>` | `atab` | 역할 관리 | 모든 봇에게 역할 부여 |
| `addtousersover <time> <role>` | `atuo` | 역할 관리 | 그 기간 이상 전에 가입한 멤버에게 역할 부여 |
| `addtousersunder <time> <role>` | `atuu` | 역할 관리 | 더 최근에 가입한 멤버에게 역할 부여 |
| `addroletorole <role> <role2>` | `artr` | 역할 관리 | 다른 역할을 가진 모든 사람에게 역할 부여 |
| `addthenremove <role> <role2>` | `atr` | 역할 관리 | 한 역할을 다른 역할로 교체 |
| `removefromall <role>` | `rfa` | 역할 관리 | 모든 멤버에게서 제거 |
| `removefromallusers <role>` | `rfau` | 역할 관리 | 모든 사람에게서 제거 |
| `removefromallbots <role>` | `rfab` | 역할 관리 | 모든 봇에게서 제거 |
| `removefromrole <role> <role2>` | `rfr` | 역할 관리 | 다른 역할을 가진 모든 사람에게서 제거 |
| `rolejobs` | `rj` | 역할 관리 | 실행 중인 대량 역할 작업 목록 |
| `stopjob <number>` | `sj` | 역할 관리 | 작업 취소 |
| `exportrolelist` | `exportroles`, `erl` | 역할 관리 | 역할 멤버십 내려받기 |
| `importrolelist [true]` | `importroles`, `irl` | 역할 관리 | 내보낸 목록 다시 적용 |
| `addroletolist <role>` | `artl` | 역할 관리 | 첨부된 사용자 ID 목록에 역할 부여 |
| `setdefaultpunishment <action>` | `sdp`, `defaultpunishment`, `setdefpunishment` | 서버 소유자 | 역할 감시기의 기본 처벌 |
| `addblacklistedrole <role> [action]` | `abr`, `blacklistrole`, `addbrole` | 서버 소유자 | 역할 감시 시작 |
| `removeblacklistedrole <role>` | `rbr`, `unblacklistrole`, `removebrole` | 서버 소유자 | 역할 감시 중지 |
| `addblacklistedpermission <permission> [action]` | `abp`, `blacklistpermission`, `addbpermission` | 서버 소유자 | 권한 감시 시작 |
| `removeblacklistedpermission <permission>` | `rbp`, `unblacklistpermission`, `removebpermission` | 서버 소유자 | 권한 감시 중지 |
| `addwhitelisteduser @user` | `awu`, `whitelistuser`, `addwuser` | 서버 소유자 | 멤버 제외 |
| `removewhitelisteduser @user` | `rwu`, `unwhitelistuser`, `removewuser` | 서버 소유자 | 멤버 제외 해제 |
| `addwhitelistedrole <role>` | `awr`, `whitelistrole`, `addwrole` | 서버 소유자 | 역할 제외 |
| `removewhitelistedrole <role>` | `rwr`, `unwhitelistrole`, `removewrole` | 서버 소유자 | 역할 제외 해제 |
| `listblacklists` | `lbl`, `blacklists`, `listbws` | 서버 소유자 | 감시기 목록 보기 |

## Tips and gotchas

- 역할 명령어는 계층 구조를 두 번 확인해요. 내 최상위 역할과 봇의 최상위 역할이 모두 대상 역할보다 위에 있어야 해요. 서버 소유자는 자기 쪽의 확인을 건너뛰어요.
- 대량 작업은 멤버당 대략 1초가 걸려요. 멤버 5,000명에게 역할을 추가하면 한 시간이 훨씬 넘게 걸리고, 봇은 동시에 여섯 번째 작업을 거부해요.
- `syncroletoall`과 그 변형은 실행하는 채널에 역할의 재정의가 이미 있어야 해요. 복사되는 것이 바로 그 재정의이기 때문이에요.
- `nuke`는 되돌릴 수 없어요. 확인 메시지가 유일한 안전장치예요.
- 읽기 전용 잠금은 모든 채널의 재정의를 수정하므로, 대형 서버에서는 API 호출이 많아요. 손으로 되돌리지 말고 `liftlockdown`으로 해제해야 저장된 재정의가 복원돼요.
- 역할 감시기는 감사 로그에 의존하므로, 봇에게 감사 로그 보기 권한이 있어야 해요. 선택한 처벌에 필요한 권한도 있어야 해요.
- 이모지 훔치기에는 빈 이모지 슬롯이 필요해요. 실패한 항목은 "Errored Emotes" 아래에 나열돼요.

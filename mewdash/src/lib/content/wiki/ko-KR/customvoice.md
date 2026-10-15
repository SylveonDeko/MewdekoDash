---
title: 커스텀 음성 채널
slug: customvoice
summary: 입장하면 각자 전용 임시 음성 채널을 만들어 주는 허브예요. 이름 변경, 인원 제한, 비트레이트, 잠금, 허용 및 거부 설정을 제공하고, 채널이 비면 자동으로 정리해요.
icon: fa-microphone
category: Entertainment
dashboard: /dashboard/customvoice
module: CustomVoice
tags: [custom voice, temporary voice, join to create, voice hub, private voice, voice channels, lock, bitrate, user limit, 커스텀 음성, 임시 음성, 음성 허브, 비공개 음성, 음성 채널, 잠금, 비트레이트, 인원 제한]
related: [administration, statchannels]
---

## 기능 소개

스태프가 음성 채널 하나를 허브로 정해요. 멤버가 허브에 들어오면 봇이 템플릿으로 이름을 정한 새 음성 채널을 만들고, 설정된 카테고리에 넣은 다음 멤버를 그 채널로 옮겨요. 이 멤버가 채널의 주인이 되고, 채널 이름을 바꾸거나, 인원 제한과 비트레이트를 정하거나, 허용된 사람만 들어올 수 있게 잠그거나, 특정 사람을 허용하거나 거부하거나, 채널을 유지하거나, 다른 사람에게 넘길 수 있어요.

마지막 사람 멤버가 나가면 짧은 시간 뒤에 채널이 삭제돼요. 단, 주인이 유지 설정을 켜두었다면 삭제되지 않아요. 주인이 나갔는데 채널에 다른 사람이 남아 있다면 그 사람이 채널을 가져갈 수 있어요.

멤버는 자신의 채널 설정을 저장해 둘 수 있어요. 그러면 새로 만드는 채널은 저장한 이름, 인원 제한, 비트레이트, 잠금 상태, 유지 설정으로 시작해요. 스태프는 멤버가 쓸 수 있는 설정을 정하고, 인원 제한과 비트레이트의 최댓값을 정하며, 모든 커스텀 채널을 관리할 수 있는 관리자 역할을 지정할 수 있어요.

## 이런 때 써요

- "게임 1"부터 "게임 8"까지 채널을 계속 관리하지 않아도 돼요. 멤버가 필요할 때 채널을 만들고, 쓰고 나면 사라져요.
- 개인적인 통화가 필요한 멤버는 채널을 잠그고 친구만 허용할 수 있어요.
- 스트리머나 이벤트 진행자는 자리를 비워도 채널이 남도록 유지 설정을 켤 수 있어요.
- 관리자 역할을 가진 운영진은 채널 관리 권한을 서버 전체에 주지 않아도 어떤 채널이든 이름을 바꾸고, 잠그고, 넘길 수 있어요.

## 허브

`setupvoicehub`는 **Custom Voice Channels** 카테고리를 새로 만들고, 그 안에 "Create Voice Channel"이라는 음성 채널을 만들어요. 이 채널은 누구나 연결할 수 있지만 말할 수는 없고, 허브로 등록돼요. `setvoicehub #channel [category]`는 이미 있는 채널을 허브로 써요. 대시보드의 **기본 설정** 섹션에서도 채널과 카테고리를 골라서 같은 작업을 할 수 있어요.

**한 사람당 여러 채널 허용**이 꺼져 있으면(기본값) 이미 채널을 가진 상태에서 허브에 들어갈 때 기존 채널을 먼저 삭제하고 새 채널을 만들어요.

## 채널 이름

**기본 이름 형식**은 템플릿이에요. 봇은 `{0}`을 멤버의 사용자 이름으로, `{1}`을 멤버의 구분자(태그 번호)로, `{2}`를 서버 이름으로 바꿔요. 기본값은 `{0}'s Channel`이에요. Discord 제한에 맞게 이름은 잘려요.

> [!NOTE]
> 대시보드의 입력 힌트에는 `{username}'s Channel`이 보이지만, 봇은 `{0}`, `{1}`, `{2}`만 바꿔요. 번호가 붙은 형식을 사용하세요.

## 주인 설정

`voicecontrols`는 현재 들어가 있는 채널의 패널을 보여줘요. 패널에는 현재 이름, 인원 제한, 비트레이트, 잠금과 유지 상태, 안에 있는 사람이 나와요. 버튼으로 **Rename**, **표시 개수**, **Bitrate**, **Lock**/**Unlock**, 유지 설정, **Transfer**를 쓸 수 있고, 안에 있는 멤버를 관리하는 선택 메뉴도 있어요. 서버에서 끈 설정에 해당하는 버튼은 비활성화돼요.

같은 기능은 명령어로도 쓸 수 있어요. 각 명령어는 사용자가 커스텀 채널 안에 있는지, 채널의 주인이거나 관리자 역할을 가졌는지, 서버에서 그 설정을 허용하는지 확인해요.

| 기능 | 명령어 | 설명 |
| --- | --- | --- |
| 이름 변경 | `voicerename <name>` | **이름 사용자 지정 허용**이 켜져 있으면 채널 이름을 바꿔요 |
| 인원 제한 | `voicelimit <n>` | 제한을 설정하며, 서버의 최대 인원 제한을 넘을 수 없어요 |
| 비트레이트 | `voicebitrate <kbps>` | 비트레이트를 설정하며, 서버의 최대 비트레이트를 넘을 수 없어요 |
| 잠금 | `voicelock [true/false]`, `voiceunlock` | 잠그면 허용된 멤버, 주인, 관리자 역할을 제외한 모든 사람이 들어올 수 없어요 |
| 허용 | `voiceallow @user` | 잠긴 채널에서도 멤버가 들어올 수 있게 해요 |
| 거부 | `voicedeny @user` | 멤버의 연결 권한을 빼고, 안에 있으면 내보내요 |
| 유지 | `voicekeepalive [true/false]` | 이 채널을 빈 채널 정리에서 제외해요 |
| 넘기기 | `voicetransfer @user` | 다른 멤버를 주인으로 만들고 관리 권한 설정도 그 멤버에게 옮겨요 |
| 가져오기 | `voiceclaim` | 주인이 채널에 없을 때 안에 있는 멤버가 주인이 될 수 있어요 |

**채널 권한 자동 관리**가 켜져 있으면 주인에게 채널의 연결, 말하기, 채널 관리, 멤버 이동, 멤버 음소거, 멤버 스피커 끄기 권한이 주어져요. 허용되거나 거부된 멤버에게도 같은 설정이 적용되고, 관리자 역할에는 관리 권한이 주어져요.

## 정리

**비어 있으면 채널 삭제**가 켜져 있으면(기본값) 사람이 없는 채널은 빈 채널 제한 시간이 지난 뒤 삭제돼요. 제한 시간이 끝나기 전에 다시 들어오면 삭제가 취소돼요. 유지 설정이 켜진 채널은 자동으로 삭제되지 않아요. 5분마다 실행되는 정리 작업은 제한 시간보다 오래 비어 있던 채널도 삭제해요. 대시보드의 **비활성 채널 정리** 버튼은 선택한 시간 동안 활동이 없던 채널을 삭제해요.

## 멤버 설정

`voicepreferences`는 저장된 이름 형식, 인원 제한, 비트레이트, 잠금, 유지 설정을 보여줘요. 각 `voiceprefs...` 명령어는 설정 하나를 바꾸고, 값 없이 실행하면 해당 설정을 지워요. `voiceprefsreset`은 모든 설정을 지워요. 설정은 **사용자 설정 기억하기**가 켜져 있을 때만 적용되고, 인원 제한과 비트레이트도 서버의 최댓값을 넘을 수 없어요. 스태프는 **사용자 설정** 탭에서 사용자 ID로 멤버의 설정을 보고 바꿀 수 있어요.

## 설정

대시보드에는 **설정**, **활성 채널**, **사용자 설정** 탭이 있어요. **설정** 탭은 **기본 설정**, **채널 기본값**, **채널 관리**로 나뉘어 있어요. `voiceconfig`를 인수 없이 실행하면 모든 값을 보여주고, `voiceconfig <setting> <value>`는 값 하나를 바꿔요.

| 설정 | 기본값 | 역할 |
| --- | --- | --- |
| 허브 채널 | 없음 | 들어가면 채널을 만들어 주는 허브 채널 |
| 카테고리 | 없음 | 새 채널을 만들 위치 |
| 기본 이름 형식 | `{0}'s Channel` | 새 채널 이름의 템플릿(`nameformat`) |
| 기본 인원 제한 | 0(무제한) | 처음 적용되는 인원 제한(`userlimit`) |
| 기본 비트레이트 | 64 kbps | 처음 적용되는 비트레이트(`bitrate`) |
| 빈 채널 삭제 | 켜짐 | 아무도 없는 채널을 삭제해요(`deleteempty`) |
| 빈 채널 제한 시간 | 1 | 빈 채널을 삭제하기 전 대기 시간(`emptytimeout`). 대시보드에서는 초 단위로 표시되며 5~300을 입력할 수 있어요 |
| 한 사람당 여러 채널 허용 | 꺼짐 | 멤버가 여러 채널을 소유할 수 있게 해요(`multiplechannels`) |
| 사용자 설정 기억하기 | 켜짐 | 저장된 멤버 설정을 적용해요(`persistpreferences`) |
| 채널 권한 자동 관리 | 켜짐 | 주인, 허용, 거부, 관리자 설정을 적용해요(`autopermission`) |
| 이름 변경 허용 | 켜짐 | `namechange` |
| 인원 제한 변경 허용 | 켜짐 | `limitchange` |
| 비트레이트 변경 허용 | 켜짐 | `bitratechange` |
| 채널 잠금 허용 | 켜짐 | `locking` |
| 멤버 관리 허용 | 켜짐 | 허용 및 거부 명령어(`usermanagement`) |
| 최대 인원 제한 | 99 | 멤버가 정할 수 있는 인원 제한의 상한(`maxuserlimit`) |
| 최대 비트레이트 | 96 kbps | 멤버가 정할 수 있는 비트레이트의 상한이며 서버 부스트 등급에 따라서도 제한돼요(`maxbitrate`) |
| 관리자 역할 | 없음 | 모든 커스텀 채널을 관리할 수 있는 역할(`adminrole`) |

**최대 인원 제한**, **최대 비트레이트**, **관리자 역할**은 대시보드에서 설정할 수 없어요. `voiceconfig`로 설정하세요.

**활성 채널** 탭에는 실행 중인 커스텀 채널이 주인, 잠금과 유지 상태와 함께 나와요. 채널마다 잠그기, 잠금 해제, 삭제를 할 수 있어요. 최근 1시간 동안 활동한 채널, 잠긴 채널, 유지 중인 채널 수와 지금까지 만들어진 채널 수도 보여줘요. 이 탭에는 **비활성 채널 정리** 버튼과 이 모듈을 서버에서 끄는 **커스텀 음성 끄기** 버튼도 있어요.

## 설정 순서

1. 사용할 카테고리에서 봇에 채널 관리, 멤버 이동, 역할 관리(권한 설정 작성용) 권한을 주세요.
2. `setupvoicehub`를 실행하거나, 대시보드에서 **커스텀 음성**을 열고 **기본 설정**에서 기존 허브 채널과 카테고리를 고르세요.
3. **채널 기본값**에서 **기본 이름 형식**, **기본 인원 제한**, **기본 비트레이트**를 정하세요.
4. **채널 관리**에서 멤버가 쓰지 않았으면 하는 기능을 끄세요.
5. `voiceconfig adminrole @Moderators`로 관리자 역할을 정해서 스태프가 자신이 주인이 아닌 채널도 관리할 수 있게 하세요.
6. 직접 허브에 들어가서 `voicecontrols`를 실행하고, 채널 이름 변경과 잠금을 시험해 보세요.

## 명령어

서버의 접두사로 실행하세요(변경하지 않았다면 `.`).

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `setupvoicehub` | `svh`, `createvoicehub`, `voicesetup` | 채널 관리 | 허브 채널과 카테고리 만들기 |
| `setvoicehub <#channel> [category]` | `sethub`, `voicehub` | 채널 관리 | 기존 채널을 허브로 사용하기 |
| `voiceconfig [setting] [value]` | `vcconfig`, `voicesettings`, `vcsettings`, `customvoiceconfig` | 채널 관리 | 서버 설정 보기 또는 바꾸기 |
| `voicecontrols` | `vcontrols` | 주인 또는 관리자 역할 | 내 채널의 제어 패널 |
| `voicechannels` | `vchannels`, `listvoice`, `customvoices`, `voicelist` | 없음 | 실행 중인 커스텀 채널 목록 |
| `voicerename <name>` | `vrename`, `renamevoice`, `vcname`, `vcrename` | 주인 또는 관리자 역할 | 내 채널 이름 바꾸기 |
| `voicelimit <number>` | `vclimit`, `limitvoice`, `vlimit`, `setlimit` | 주인 또는 관리자 역할 | 인원 제한 설정 |
| `voicebitrate <kbps>` | `vcbitrate`, `vbitrate`, `setbitrate` | 주인 또는 관리자 역할 | 비트레이트 설정 |
| `voicelock [true/false]` | `vclock`, `lockvoice`, `vlock`, `lockvc` | 주인 또는 관리자 역할 | 잠그기 또는 잠금 해제 |
| `voiceunlock` | `vcunlock`, `unlockvoice`, `vunlock`, `unlockvc` | 주인 또는 관리자 역할 | 잠금 해제 |
| `voiceallow @user` | `vcallow`, `allowuser`, `vallow`, `adduser` | 주인 또는 관리자 역할 | 잠긴 채널에 멤버 들어오게 하기 |
| `voicedeny @user` | `vcdeny`, `denyuser`, `vdeny`, `removeuser` | 주인 또는 관리자 역할 | 멤버를 차단하고 내보내기 |
| `voiceclaim` | `vcclaim`, `claimvoice`, `vclaim`, `takeover` | 없음 | 주인이 나간 채널 가져오기 |
| `voicetransfer @user` | `vctransfer`, `transfervoice`, `vtransfer`, `givevc` | 주인 또는 관리자 역할 | 다른 사람에게 채널 넘기기 |
| `voicekeepalive [true/false]` | `vckeepalive`, `keepvoice`, `vkeep`, `persist` | 주인 또는 관리자 역할 | 정리 대상에서 채널 제외 |
| `voicepreferences` | `vcprefs`, `voiceprefs`, `vprefs`, `myvoice` | 없음 | 내 저장된 설정 보기 |
| `voiceprefsname [format]` | `vcprefsname`, `vpname`, `prefname`, `namepref` | 없음 | 선호하는 이름 형식, 비우면 지우기 |
| `voiceprefslimit [number]` | `vcprefslimit`, `vplimit`, `preflimit`, `limitpref` | 없음 | 선호하는 인원 제한 |
| `voiceprefsbitrate [kbps]` | `vcprefsbitrate`, `vpbitrate`, `prefbitrate`, `bitratepref` | 없음 | 선호하는 비트레이트 |
| `voiceprefslock [true/false]` | `vprefslock` | 없음 | 채널을 잠긴 상태로 시작 |
| `voiceprefskeepalive [true/false]` | `vcprefskeepalive`, `vpkeepalive`, `prefkeepalive`, `keeppref` | 없음 | 유지 설정을 켜고 채널 시작 |
| `voiceprefsreset` | `vcprefsreset`, `vprefsreset`, `resetprefs`, `clearprefs` | 없음 | 모든 설정 지우기 |

## 팁과 주의할 점

- 봇에는 카테고리의 채널 관리, 새 채널로 생성자를 옮기기 위한 멤버 이동, 권한 설정 작성을 위한 역할 관리 권한이 필요해요.
- 최대 비트레이트는 서버의 부스트 등급이 허용하는 값으로 제한돼요. 그래서 부스트가 없는 서버에서 384로 설정하면 자동으로 줄어들어요.
- 잠금은 @everyone 역할의 연결 권한을 거부해요. 관리자 권한이 있거나 명시적으로 연결을 허용받은 역할의 멤버는 여전히 들어갈 수 있어요.
- 마지막 멤버가 나갈 때 시작되는 빈 채널 타이머는 제한 시간을 초 단위로 계산하지만, 설정 화면과 5분마다 실행되는 정리 작업은 분 단위로 계산해요. 기본값인 1이면 채널은 비자마자 거의 바로 사라져요.
- 유지 설정이 켜진 채널은 자동으로 정리되지 않아요. 잊힌 채널은 **활성 채널** 탭이나 `voicechannels`로 찾을 수 있어요.
- 가져오기는 원래 주인이 채널에 없을 때만 동작해요.

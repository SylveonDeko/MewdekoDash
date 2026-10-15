---
title: 숫자 세기
slug: counting
summary: 채널을 숫자 세기 게임으로 바꿔요. 멤버들이 차례대로 다음 숫자를 올리고, 반응, 연속 기록, 순위표, 세이브 포인트와 틀렸을 때의 처벌을 설정할 수 있어요.
icon: fa-list-numeric
category: Community
dashboard: /dashboard/counting
module: Counting
tags: [counting, count, numbers, game, channel, leaderboard, streak, milestones, save point, 숫자 세기, 세기, 숫자, 게임, 채널, 순위표, 연속 기록, 마일스톤, 세이브 포인트]
related: [administration, xp]
---

## 무엇을 하나요

스태프가 채널을 골라 `countingsetup`을 실행하면, 그때부터 봇이 그 채널의 모든 메시지를 지켜봐요. 메시지가 다음에 와야 할 숫자이면 봇이 체크 표시 반응을 달고 그 멤버의 기록에 셈을 더해요. 틀린 숫자이면 X 표시 반응을 달고, 기본적으로 2초 뒤에 그 메시지를 삭제해서 채널을 깔끔하게 유지해요.

봇은 현재 숫자, 지금까지 도달한 가장 높은 숫자, 전체 셈 횟수, 마지막으로 센 사람을 기억해요. 기본 설정에서는 같은 멤버가 두 번 연속으로 셀 수 없어서, 게임을 하려면 최소 두 명이 필요해요. 멤버는 자신의 통계, 연속 기록, 정확도를 확인할 수 있고, 채널마다 순위표도 볼 수 있어요.

스태프에게는 세이브 포인트도 있어요. 잘못된 흐름이 생기면 숫자를 이전 시점으로 되돌릴 수 있어요. 또 틀린 숫자를 멤버별로 일정 기간 집계해서 단계별 처벌을 자동으로 적용하는 기능, 숫자 세기 차단과 제한 시간, 누가 참여할 수 있는지 정하는 역할 규칙도 있어요. 여러 채널에서 각각 다른 설정으로 동시에 숫자 세기를 운영할 수 있어요.

## 왜 사용하나요

- 손이 많이 가지 않고 스스로 굴러가며, 멤버들에게 함께 달성할 목표를 주는 커뮤니티 게임이에요.
- 규모가 큰 서버는 쿨다운과 연속 참여 금지 규칙을 추가해서 한 사람이 숫자를 독차지하지 못하게 할 수 있어요.
- 스태프는 누가 숫자를 틀렸는지 다투는 대신 세이브 포인트로 숫자를 복원할 수 있어요.
- 일부러 숫자를 계속 틀리는 반복 위반자는 자동으로 음소거하거나 숫자 세기에서 차단할 수 있어요.

## 셈이 확인되는 방식

멤버가 숫자 세기 채널에 메시지를 보내면 봇은 다음 순서로 확인해요.

1. 숫자 세기가 차단된 멤버는 완전히 무시해요.
2. 차단된 역할이 있거나, 필수 역할이 없거나, 무시 역할을 가진 멤버는 건너뛰어요. 무시 역할의 메시지는 설정에 따라 삭제해요.
3. 메시지가 올바른 숫자처럼 보이면 봇이 그 메시지에 반응할 수 있는지 확인해요. 반응이 실패하면 멤버가 봇을 차단한 것으로 보고 메시지를 삭제한 뒤, 5초 뒤에 사라지는 짧은 경고를 보내요.
4. 아직 **쿨다운**이 남은 멤버의 메시지는 거부해요.
5. **연속 참여 허용**이 꺼져 있고 같은 멤버가 마지막으로 셌다면 메시지를 거부해요.
6. 채널의 패턴에 따라 텍스트를 해석해요. 숫자가 아닌 메시지는 아래의 숫자가 아닌 메시지 규칙에 따라 처리해요.
7. 숫자는 현재 숫자에 **증가량**을 더한 값과 같아야 해요. 틀린 숫자는 그 멤버의 오류로 집계하고, **오류 시 숫자 초기화**가 켜져 있으면 채널이 시작 숫자로 돌아가요.
8. **최대 숫자**를 설정했고 그 숫자를 넘으면 셈이 멈추고 스태프에게 알림을 보내요.

올바르게 세면 채널 숫자, 멤버의 통계와 연속 기록이 갱신되고, 그 멤버의 쿨다운이 시작되고, 마일스톤을 확인한 뒤 이벤트를 기록해요.

올바른 숫자에는 **성공 이모트** 반응(기본값은 체크 표시)이, 틀린 숫자에는 **오류 이모트** 반응(기본값은 X 표시)이 달려요. 두 이모트 모두 기본 이모지나 서버 커스텀 이모트로 설정할 수 있어요.

## 숫자 세기 패턴

패턴은 멤버가 숫자를 어떻게 써야 하는지 정해요. 봇이 지원하는 패턴은 다음과 같아요.

| 패턴 | 멤버가 입력하는 값 |
| --- | --- |
| 기본 | 일반 숫자: `1`, `2`, `3`. **숫자 진법**을 10이 아닌 값으로 설정하면 그 진법으로 읽어요. |
| 로마 숫자 | 로마 숫자: `I`, `II`, `III`, `IV` |
| 이진수 | `1`, `10`, `11`, `100` |
| 16진수 | `1`부터 `9`까지, 그다음 `A`, `B`, `C` |
| 글자 | `twenty-one`이나 `one hundred and five`처럼 글자로 쓴 숫자 |
| 서수 | `1st`, `2nd`, `3rd`, `4th` |
| 피보나치 | 피보나치 수열: `1`, `1`, `2`, `3`, `5`, `8` |
| 소수 | 소수만: `2`, `3`, `5`, `7`, `11` |

기본값은 기본 패턴이에요. 패턴은 대시보드에서 설정하며, 이를 위한 명령어는 없어요.

> [!WARNING]
> 대시보드의 **숫자 세기 패턴** 드롭다운에는 현재 순차, 배수 건너뛰기, 피보나치, 소수, 2의 거듭제곱이 나오는데, 이 값들은 위의 봇 패턴 목록과 맞지 않아요. 지금은 대시보드에서 순차(기본) 패턴만 안전하게 고를 수 있어요.

## 마일스톤

숫자가 처음으로 100, 500, 1,000, 5,000, 10,000의 배수에 닿으면 봇이 마일스톤을 기록해요. 마일스톤은 **통계** 탭과 `countingstatus`에서 볼 수 있어요.

대시보드의 **관리** 탭과 `countingmilestones` 명령어로 채널별 마일스톤 숫자 목록을 직접 저장할 수 있어요. 같은 탭과 `countingmilestonemessage` 명령어로 마일스톤 메시지를, `countingmilestonechannel` 명령어로 마일스톤 알림 채널을 저장할 수 있어요. 이 값들은 저장되지만, 봇이 아직 마일스톤 알림을 보내지 않으니 나중 버전을 위해 예약된 설정으로 보면 돼요.

## 통계와 순위표

모든 멤버는 채널별 통계를 가져요. 기여도, 현재 연속 기록, 최고 연속 기록, 정확도, 오류 수, 센 숫자 총합, 마지막 기여 시점이에요. `countingstats`는 이 통계와 순위를 함께 보여줘요.

`countingleaderboard`와 **순위표** 탭은 다음 네 가지 유형 중 하나로 정렬해요.

| 유형 | 정렬 기준 |
| --- | --- |
| `contributions` | 올바른 셈 횟수 (기본값) |
| `streak` | 최고 연속 기록 |
| `accuracy` | 올바른 셈의 백분율 |
| `totalnumbers` | 센 숫자 총합 |

명령어는 상위 20명을 10명씩 두 페이지로 보여줘요.

## 세이브 포인트

`countingsave`는 현재 숫자를 선택적인 사유와 함께 저장하고 세이브 ID를 줘요. `countingrestore <id>`는 확인 창을 거친 뒤 채널을 그 숫자로 되돌려요. `countingreset`은 확인 후 숫자를 원하는 값으로 바로 설정하며, 기본값은 0이에요. 세 가지 모두 **관리** 탭에서도 할 수 있어요.

## 모더레이션

숫자 세기 모더레이션은 켜기 전까지 꺼져 있어요. 채널별로 `countmodenable true`를, 서버 전체에 `countmoddefaults true`를 실행해서 켤 수 있어요. 채널 설정이 서버 기본값보다 우선하고, `countmodreset`은 채널을 기본값으로 되돌려요.

모더레이션이 켜져 있으면 틀린 숫자마다 그 멤버에게 기록되고, **시간 범위**(기본 24시간, 1~168시간) 동안 그 멤버의 틀린 횟수에 더해져요. 단계별 처벌은 멤버의 집계가 정확히 특정 숫자에 도달했을 때 실행돼요. 예를 들어 `countmodpunish 3 Mute 30`을 실행하면 세 번째로 틀렸을 때 30분 동안 음소거해요. 채널을 지정해서 만든 단계는 그 채널에만 적용되고, 채널을 지정하지 않은 단계는 서버 기본값이에요. 채널 단계가 있으면 채널 단계가 우선해요. `Softban`, `Kick`, `RemoveRoles`는 기간을 설정할 수 없고, 기간은 최대 49일이에요. `AddRole`에는 역할이 필요해요.

모더레이션이 켜져 있을 때만 적용되는 규칙이 두 가지 더 있어요.

- **숫자가 아닌 메시지**: `countmodnonnumbers`로 채널의 일반 채팅을 삭제할지(기본값은 예), 위반으로 셀지(기본값은 아니요)를 정해요.
- **수정**: `countmodedits`로 채널에서 메시지를 수정했을 때 그 메시지를 삭제할지(기본값은 예), 위반으로 셀지(기본값은 아니요)를 정해요.

역할 규칙도 있어요. **필수 역할**은 셀 때 그중 하나 이상을 가져야 한다는 뜻이고, **차단된 역할**은 그중 하나라도 가진 멤버가 셀 수 없다는 뜻이에요. `countmodignore`는 지정한 역할을 가진 멤버를 건너뛰고, 원하면 그 멤버의 메시지도 삭제해요.

`countingban`, `countingtimeout`, `countingunban`으로 특정 멤버를 채널에서 영구히 또는 일정 기간 차단할 수 있어요. **관리** 탭에서도 사용자 ID로 같은 설정을 할 수 있고, **채널 데이터 정리** 버튼은 `countingdisable`에 정리 옵션을 붙인 것과 같아요.

## 설정

대시보드에는 **채널**, **설정**, **통계**, **순위표**, **관리** 다섯 개의 탭이 있어요. **채널** 탭에서 먼저 채널을 고르세요. 다른 탭은 선택한 채널에 적용돼요.

| 설정 | 기본값 | 역할 |
| --- | --- | --- |
| 시작 숫자 | 1 | 셈을 시작하는 숫자이며, 설정할 때 정해요 |
| 증가량 | 1 | 한 번 셀 때 더해지는 값이며, 양수여야 해요 |
| 숫자 세기 패턴 | 기본 | 숫자를 표기하는 방식이며, 위를 참고하세요 |
| 숫자 진법 | 10 | 기본 패턴이 사용하는 진법 |
| 쿨다운 (초) | 0 | 같은 멤버가 두 번 셀 때까지의 대기 시간이며, 0~300초 |
| 최대 숫자 | 0 (제한 없음) | 이 숫자를 넘으면 셈이 멈춰요 |
| 성공 이모트 | 체크 표시 | 올바른 셈에 붙는 반응 |
| 오류 이모트 | X 표시 | 틀린 셈에 붙는 반응 |
| 연속 참여 허용 | 꺼짐 | 한 멤버가 연달아 셀 수 있게 해요 |
| 오류 시 숫자 초기화 | 꺼짐 | 틀린 숫자가 나오면 채널을 시작 숫자로 되돌려요 |
| 잘못된 메시지 삭제 | 켜짐 | 틀린 숫자를 2초 뒤에 삭제해요 |
| 업적 켜기 | 켜짐 | `countingconfig`에 보이는 저장된 설정이에요 |
| 대회 켜기 | 켜짐 | `countingconfig`에 보이는 저장된 설정이에요 |
| 필수 역할 | 없음 | 셀 때 이 역할 중 하나가 필요해요 |
| 차단된 역할 | 없음 | 이 역할을 가진 멤버는 셀 수 없어요 |

> [!NOTE]
> `countingfailurethreshold` 명령어는 1~10 사이 값(기본값 3)을 저장하고, `countmodthreshold`는 틀린 셈 기준값을 저장하지만, 처벌은 `countmodpunish`로 설정한 단계에서만 실행돼요.

## 설정 순서

1. 채널을 만들고 봇에게 해당 채널의 **채널 보기**, **메시지 보내기**, **반응 추가**, **메시지 관리**, **메시지 기록 보기** 권한을 주세요.
2. 대시보드에서 **숫자 세기**를 열고 **새 숫자 세기 채널 설정**에서 채널을 고른 뒤, **시작 숫자**와 **증가량**을 정하고 저장하세요.
3. **설정** 탭에서 게임을 천천히 하고 싶다면 **쿨다운**을 설정하고 이모트를 고르세요.
4. 필요하면 **필수 역할**이나 **차단된 역할**을 추가하세요.
5. 자동 처벌을 원한다면 채널에서 `countmodenable true`를 실행하고 `countmodpunish`로 단계를 추가하세요.
6. 한 계정에서 `1`을, 다른 계정에서 `2`를 보내서 반응이 제대로 붙는지 확인하세요.

## 명령어

서버의 접두사로 실행하세요. 접두사를 바꾸지 않았다면 `.`이에요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `countingsetup [#channel] [start] [increment]` | `csetup`, `countsetup` | 채널 관리 | 채널에서 숫자 세기 시작 |
| `countingstatus [#channel]` | `cstatus`, `countstatus` | 없음 | 현재 숫자, 기록, 총계와 활성 규칙 |
| `countingconfig [#channel]` | `cconfig`, `countconfig` | 채널 관리 | 채널 설정 보기 |
| `countingreset [#channel] [number] [reason]` | `creset`, `countreset` | 메시지 관리 | 숫자 초기화 (기본 0), 확인 후 실행 |
| `countingstats [@user] [#channel]` | `countstats` | 없음 | 멤버의 숫자 세기 통계와 순위 |
| `countingleaderboard [type] [#channel]` | `cleaderboard`, `countleaderboard`, `clb` | 없음 | 기여도, 연속 기록, 정확도, 총 숫자 기준 상위 20명 |
| `countingsave [#channel] [reason]` | `csave`, `countsave` | 메시지 관리 | 세이브 포인트 만들기 |
| `countingrestore <saveId> [#channel]` | `crestore`, `countrestore` | 메시지 관리 | 세이브 포인트로 되돌리기 |
| `countingdisable [#channel] [purge] [reason]` | `cdisable`, `countdisable` | 채널 관리 | 숫자 세기 중단, `true`면 모든 데이터도 삭제 |
| `countinglist` | `clist`, `countlist` | 채널 관리 | 활성 숫자 세기 채널 목록 |
| `countingban <@user> [#channel] [duration] [reason]` | `cban`, `countban` | 메시지 관리 | 멤버의 숫자 세기 차단, 기간을 주지 않으면 영구 |
| `countingunban <@user> [#channel] [reason]` | `cunban`, `countunban` | 메시지 관리 | 숫자 세기 차단 해제 |
| `countingtimeout <@user> <duration> [#channel] [reason]` | `ctimeout`, `counttimeout` | 메시지 관리 | 일정 기간 숫자 세기 차단 |
| `countingcooldown [#channel] [seconds]` | `ccooldown`, `countcooldown` | 채널 관리 | 쿨다운 보기 또는 설정 (0~300초) |
| `countingmilestones [#channel] [50,100,...]` | `cmilestones`, `countmilestones` | 채널 관리 | 사용자 지정 마일스톤 숫자 보기, 설정, 또는 `-`로 초기화 |
| `countingsuccessmessage [#channel] [text]` | `csuccessmessage`, `countsuccessmessage` | 채널 관리 | 성공 메시지 템플릿 저장, `-`로 초기화 |
| `countingfailuremessage [#channel] [text]` | `cfailuremessage`, `countfailuremessage` | 채널 관리 | 실패 메시지 템플릿 저장, `-`로 초기화 |
| `countingmilestonemessage [#channel] [text]` | `cmilestonemessage`, `countmilestonemessage` | 채널 관리 | 마일스톤 메시지 템플릿 저장, `-`로 초기화 |
| `countingmilestonechannel [#counting] [#target]` | `cmilestonechannel`, `countmilestonechannel` | 채널 관리 | 마일스톤 채널 저장, none으로 해제 |
| `countingfailurechannel [#counting] [#target]` | `cfailurechannel`, `countfailurechannel` | 채널 관리 | 실패 기록 채널 저장, none으로 해제 |
| `countingfailurethreshold [#channel] [1-10]` | `cfailurethreshold`, `countfailurethreshold` | 채널 관리 | 실패 기준값 보기 또는 설정 |
| `countmodshow [#channel]` | `cmshow`, `countmoderationshow` | 채널 관리 | 모더레이션 설정과 서버 기본값 보기 |
| `countmoddefaults <on/off> [threshold] [hours] [punishment] [minutes] [@role]` | `cmdefaults`, `countmoderationdefaults` | 관리자 | 서버 전체 모더레이션 기본값 |
| `countmodenable <on/off> [#channel]` | `cmenable`, `countmoderationenable` | 채널 관리 | 채널의 모더레이션 켜기 또는 끄기 |
| `countmodthreshold <1-100> [#channel]` | `cmthreshold`, `countmoderationthreshold` | 채널 관리 | 채널의 틀린 셈 기준값 설정 |
| `countmodwindow <1-168> [#channel]` | `cmwindow`, `countmoderationwindow` | 채널 관리 | 틀린 셈이 기록에 남는 시간 |
| `countmodpunishment <action> [minutes] [@role] [#channel]` | `cmpunishment`, `countmoderationpunishment` | 채널 관리 | 채널의 기본 처벌 설정 |
| `countmodpunish <count> <action> [minutes] [@role] [#channel]` | `cmpunish`, `countmoderationpunish` | 채널 관리 | 정확히 그 횟수만큼 틀렸을 때의 처벌, 채널을 지정하지 않으면 서버 기본값 |
| `countmodunpunish <count> [#channel]` | `cmunpunish`, `countmoderationunpunish` | 채널 관리 | 단계 제거 |
| `countmodpunishlist [#channel]` | `cmpunishlist`, `countmoderationpunishlist` | 채널 관리 | 단계 목록 보기 |
| `countmodignore <delete> [#channel] [@roles...]` | `cmignore`, `countmoderationignore` | 채널 관리 | 봇이 무시할 역할, 메시지 삭제 여부 포함 |
| `countmodrequired [#channel] [@roles...]` | `cmrequired`, `countmoderationrequired` | 채널 관리 | 셀 때 필요한 역할 |
| `countmodbanned [#channel] [@roles...]` | `cmbanned`, `countmoderationbanned` | 채널 관리 | 셀 수 없는 역할 |
| `countmodnonnumbers <punish> [delete] [#channel]` | `cmnonnumbers`, `countmoderationnonnumbers` | 채널 관리 | 채널 채팅에 대한 규칙 |
| `countmodedits <punish> [delete] [#channel]` | `cmedits`, `countmoderationedits` | 채널 관리 | 수정된 메시지에 대한 규칙 |
| `countmodreset [#channel]` | `cmreset`, `countmoderationreset` | 채널 관리 | 채널을 서버 기본값으로 되돌리기 |
| `countmodclear <@user> [#channel]` | `cmclear`, `countmoderationclear` | 메시지 관리 | 멤버의 틀린 셈 기록 지우기 |
| `countmodclearall [#channel]` | `cmclearall`, `countmoderationclearall` | 메시지 관리 | 모든 멤버의 틀린 셈 기록 지우기 |

## 팁과 주의 사항

- 봇에게 채널의 **반응 추가** 권한이 필요해요. 없으면 체크 표시나 X 표시가 붙지 않고, 봇 차단 검사에서 올바른 셈도 건너뛰게 돼요.
- 틀린 숫자와 숫자가 아닌 채팅을 삭제하려면 **메시지 관리** 권한이 필요해요.
- 봇을 차단한 멤버는 셀 수 없어요. 그 멤버의 숫자는 삭제되고 경고가 게시돼요.
- 기본값인 연속 참여 금지 규칙에 따라, 멤버가 두 번 연속 메시지를 보내면 숫자를 읽기 전에 거부되고, 이 거부는 오류로 집계되지 않아요.
- **오류 시 숫자 초기화**는 시작 숫자로 되돌려요. 시작 숫자가 1이면 다음에 기대되는 숫자는 다시 1이 돼요.
- 모더레이션 처벌은 경고 시스템과 같은 동작(Mute, Ban, Kick, AddRole 등)을 사용하므로, 봇에게 해당하는 Discord 권한과 음소거 역할이 있어야 해요.
- 기록을 정리하는 `countingdisable`에 정리 옵션을 붙이면 그 채널의 통계, 차단, 세이브 포인트가 모두 삭제되고 되돌릴 수 없어요. 정리 없이 끄면 데이터는 유지돼요.

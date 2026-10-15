---
title: 평판
slug: reputation
summary: 멤버가 평판 점수로 서로에게 감사를 표현하게 하세요. 쿨다운과 남용 방지 제한, 기준값 도달 시 역할 보상, 반응 기반 지급, 비활성 멤버를 위한 선택적 감소 기능을 사용할 수 있어요.
icon: fa-trophy
category: Community
dashboard: /dashboard/reputation
module: Reputation
tags: [reputation, rep, karma, thanks, role rewards, leaderboard, reaction rep, decay, cooldown, 평판, 감사, 역할 보상, 리더보드, 반응 평판, 감소, 쿨다운]
related: [xp, administration]
---

## 기능 소개

멤버는 `rep @user`를 입력해서 평판 점수 1점을 줄 수 있고, 이유를 함께 적을 수도 있어요. 받은 사람의 총점이 올라가고, 주는 사람의 연속 일수가 기록되며, 기록에는 누가 무엇을 왜 줬는지 남아요. 누구나 `repcheck`로 총점을 확인하고, `repleaderboard`로 서버 순위를 보고, `rephistory`로 최근 10개 기록을 볼 수 있어요.

스태프는 평판이 얼마나 자유롭게 오갈지 설정할 수 있어요. 주는 사람과 받는 사람 쌍마다 쿨다운을 두고, 일일 및 주간 제한을 설정하고, 평판을 주기 위한 최소 계정 기간, 서버 체류 시간, 메시지 수를 정할 수 있어요. 채널별로 평판을 끄거나 배수를 줄 수도 있어요. 평판은 반응으로도 얻을 수 있어요. 메시지에 설정된 이모지를 누르면 메시지 작성자에게 점수가 돌아가요.

정해진 기준값에 도달하면 봇이 역할을 부여하고, 채널에 마일스톤을 알리고, 멤버에게 DM을 보내요. 선택 사항인 감소 기능을 켜면, 한동안 평판을 주거나 받지 않은 멤버의 점수가 서서히 줄어들어서 리더보드가 현재 활동을 반영하게 돼요.

## 사용하는 이유

- 지원 채널에서 도움을 준 멤버를 인정하고 눈에 띄는 역할을 주고 싶을 때
- 쇼케이스 채널에서 엄지 반응을 누르면 작가에게 점수가 가도록 하고 싶을 때
- 수동 역할 대신 평판 등급으로 명령어나 채널을 제한하고 싶을 때
- 한 채널에서 주는 평판이 두 배로 계산되는 주말 이벤트를 열고 싶을 때
- 도움을 그만둔 사람을 감소 기능으로 걸러내서 지원 리더보드를 정확하게 유지하고 싶을 때

## 평판 주기

`rep`은 점수 1점을 주며, 채널 배수가 설정되어 있다면 그 배수가 곱해져요. 자기 자신이나 봇에게는 평판을 줄 수 없어요. 모든 시도는 다음 순서로 확인하며, 처음으로 실패한 확인 항목이 주는 사람에게 알려져요.

| 확인 항목 | 기본값 | 동작 |
| --- | --- | --- |
| System enabled (시스템 사용) | 켜짐 | 꺼져 있으면 모든 평판이 거부돼요 |
| Channel state (채널 상태) | enabled | `disabled`로 설정된 채널에서는 평판을 줄 수 없어요 |
| Receiver frozen (받는 사람 동결) | 아니요 | 동결된 멤버는 평판을 받을 수 없어요 |
| Cooldown (쿨다운) | 60분 | 같은 사람에게 다시 평판을 주기까지 필요한 시간 |
| Daily limit (일일 제한) | 10 | UTC 하루 동안 주는 사람이 줄 수 있는 평판 수 |
| Weekly limit (주간 제한) | 없음 | 일요일부터 세는 주간 상한(선택 사항) |
| Min account age (최소 계정 기간) | 7일 | 주는 사람의 Discord 계정 기간 |
| Min server time (최소 서버 체류 시간) | 24시간 | 주는 사람이 서버에 머문 시간 |
| Min message count (최소 메시지 수) | 10 | 메시지 수 세기 기능으로 집계한, 주는 사람의 메시지 수 |

익명 평판은 설정에서 익명 지급을 켰을 때만 기록에 익명으로 남아요. 음수 평판은 별도의 설정이에요. 반응을 제거하면 그 반응으로 준 점수는 이미 회수돼요.

### 연속 기록과 통계

연속된 날짜에 평판을 주면 연속 기록이 쌓이고, 하루 반을 넘어 공백이 생기면 초기화돼요. `repstats`로 총점, 순위, 준 점수, 받은 점수, 현재 연속 기록과 최장 연속 기록, 마지막으로 준 시간과 받은 시간을 확인할 수 있어요.

### 사용자 지정 유형

`reptypeadd helpful Helpful`을 입력하면 이름이 붙은 유형을 만들 수 있어요. 멤버는 `rep @user helpful thanks for the fix`처럼 쓸 수 있어요. 기본 평판은 총점에만 더해지지만, 사용자 지정 유형은 유형별 개수도 따로 기록하며, 명령어 요구 조건에서 이 개수를 기준으로 삼을 수 있어요.

## 반응

`repreaction <emoji> [amount] [type]`을 입력하면 해당 반응이 메시지 작성자에게 평판을 주도록 설정돼요. 반응을 누른 사람은 봇이 아니어야 하며, 반응을 제거하면 점수도 회수돼요. 명령어의 기본값은 기본 평판 1점이고, 각 반응 설정에는 자체 쿨다운이 있어요.

## 역할 보상

`reprole @Role 100`을 입력하면 멤버가 평판 100점에 도달했을 때 역할을 줘요. 옵션으로는 점수가 기준 아래로 떨어지면 역할을 다시 제거하기(기본값 켜짐), 채널에 마일스톤 알리기, DM 보내기가 있어요. 보상은 평판이 바뀔 때마다 확인해요. 보상에 보너스 XP를 저장할 수 있지만, 아직 지급되지는 않아요.

역할 보상과 별개로, 멤버가 50, 100, 250, 500, 1000, 2500, 5000, 10000 평판에 도달하면 봇이 **notification channel**(알림 채널)에 마일스톤 메시지를 게시해요. 멤버가 한 번에 10점 이상을 받거나 10의 배수에 도달했을 때도 DM을 받아요.

## 감소

감소 기능을 켜면 봇이 매시간 감소 시점인지 확인해요. `daily`는 UTC 02:00에, `weekly`는 일요일 UTC 02:00에, `monthly`는 매월 1일에 실행돼요. 비활성 기간 동안 평판을 주거나 받지 않은 멤버는 감소량만큼 점수를 잃어요. 감소량은 고정 점수일 수도 있고 총점의 비율일 수도 있으며, 0 아래로는 내려가지 않아요. 동결된 멤버는 건너뛰어요. 기본값은 주간, 1점, 비활성 30일이에요.

## 명령어 요구 조건

`repcommandreq <command> <minimum> [type] [#channels]`를 입력하면 멤버가 최소 평판을 갖출 때까지 명령어를 막을 수 있어요. 특정 사용자 지정 유형이나 특정 채널로 제한할 수도 있어요. `repcommandbypass`는 역할을 요구 조건에서 면제하고, `repcommandinfo`는 누구나 명령어에 필요한 조건을 확인할 수 있게 해요.

## 설정

평판 페이지에는 **설정**(구성), **역할 보상**(역할 보상), **순위표**(리더보드), **통계**(통계) 탭이 있어요.

| 설정 | 기본값 | 제어하는 내용 |
| --- | --- | --- |
| Enable Reputation System (평판 시스템 사용) | 켜짐 | 마스터 스위치 |
| Cooldown (minutes) (쿨다운, 분) | 60 | 주는 사람과 받는 사람 쌍마다 적용 |
| Daily Limit (일일 제한) | 10 | 주는 사람별 하루 평판 수 |
| Weekly Limit (optional) (주간 제한, 선택 사항) | 없음 | 주는 사람별 주간 평판 수 |
| Min Account Age (days) (최소 계정 기간, 일) | 7 | 주는 사람의 조건 |
| Min Server Time (hours) (최소 서버 체류 시간, 시간) | 24 | 주는 사람의 조건 |
| Min Message Count (최소 메시지 수) | 10 | 주는 사람의 조건 |
| Notification Channel (optional) (알림 채널, 선택 사항) | 없음 | 마일스톤 메시지를 보낼 위치 |
| Allow Negative Reputation (음수 평판 허용) | 꺼짐 | 음수 점수를 허용해요 |
| Enable Anonymous Reputation (익명 평판 사용) | 꺼짐 | `repanon`으로 주는 사람을 숨길 수 있게 해요 |

감소는 대시보드에 없어요. 아래 `repdecay*` 명령어를 사용하세요.

**역할 보상**(역할 보상)에는 **역할**(역할), **필요 평판**(필요 평판), **공지 채널 (선택 사항)**(공지 채널, 선택 사항), **보너스 XP (선택 사항)**(보너스 XP, 선택 사항), **평판이 기준값 아래로 떨어지면 역할 제거**(평판이 기준값 아래로 떨어지면 역할 제거), **DM 알림 보내기**(DM 알림 보내기)이 있는 양식이 있어요. **순위표**(리더보드)에서는 순위를 보고 멤버의 기록을 열 수 있어요. **통계**(통계)에서는 전체 사용자 수, 총 지급 평판, 거래 수, 평균 평판을 볼 수 있어요.

## 설정 순서

1. 대시보드에서 **평판**(평판)을 여세요. **설정**(구성)에서 **활성화됨**(사용)를 켜세요.
2. **재알림 대기**(쿨다운), **Daily Limit**(일일 제한), 최소 조건 세 가지를 서버 규모에 맞게 설정하세요.
3. 마일스톤을 받을 **Notification channel**(알림 채널)을 고르고 저장하세요.
4. **역할 보상**(역할 보상)에서 역할과 **필요 평판**(필요 평판)를 추가하세요. 평판이 계속 유지되어야 한다면 **평판이 기준값 아래로 떨어지면 역할 제거**(평판이 기준값 아래로 떨어지면 역할 제거)를 체크하세요.
5. 디스코드에서 `repreaction <emoji> 1`을 입력해 반응 평판을 켜고, `repchannel #bot-spam disabled`로 스팸 채널을 제외하세요.
6. 두 번째 계정으로 테스트하세요. `rep @you great help`를 입력한 뒤 `repcheck @you`로 확인하세요.

> [!WARNING]
> `represet all`을 입력하면 확인 후 서버의 모든 멤버의 평판, 기록, 배지가 삭제돼요. 되돌릴 수 없어요.

## 명령어

서버의 접두사로 실행하세요(변경하지 않았다면 `.`).

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `rep <@user> [type] [reason]` | `+rep`, `giverep`, `gr`, `repgive` | 없음 | 점수 1점 주기 |
| `repanon <@user> [type] [reason]` | `anongiverep` | 없음 | 익명으로 주기 |
| `anonrep <@user> [type] [reason]` | | 없음 | `repanon`과 같아요 |
| `repcheck [@user]` | `myrep`, `checkrep` | 없음 | 총점과 순위 표시 |
| `repleaderboard [page]` | `replb`, `reptop`, `toprep` | 없음 | 페이지당 25명 순위 |
| `rephistory [@user]` | `rephist` | 없음 | 최근 평판 기록 10개 |
| `repstats [@user]` | `repstat` | 없음 | 상세 통계와 연속 기록 |
| `repcommandinfo <command>` | `repcmdinfo`, `rci` | 없음 | 명령어의 평판 요구 조건 표시 |
| `repstatus` | `repsettings` | 관리자 | 설정 표시 |
| `repconfig` | `repcfg` | 관리자 | 대화형 설정 메뉴 |
| `repenable [true/false]` | `repe` | 관리자 | 시스템 켜기 또는 끄기 |
| `repcooldown <minutes>` | `repcd` | 관리자 | 1에서 1440 사이 |
| `repdailylimit <n>` | `repdl` | 관리자 | 1에서 100 사이 |
| `repweeklylimit [n]` | `repwl` | 관리자 | 1에서 500 사이, 또는 none으로 제거 |
| `repminage <days>` | `repma` | 관리자 | 0에서 365 사이 |
| `repminmembership <hours>` | `repmm` | 관리자 | 0에서 720 사이 |
| `repminmessages <n>` | `repminmsg` | 관리자 | 0에서 1000 사이 |
| `repnegative <true/false>` | `repneg` | 관리자 | 음수 평판 허용 |
| `repanonymous <true/false>` | `repanonym` | 관리자 | 익명 평판 허용 |
| `repnotificationchannel [#channel]` | `repnotify` | 관리자 | 마일스톤 채널 설정 또는 제거 |
| `repchannel <#channel> [enabled/disabled/readonly] [multiplier]` | `repch` | 관리자 | 채널별 상태와 배수 |
| `repdecay <true/false>` | `repd` | 관리자 | 감소 켜기 |
| `repdecaytype <daily/weekly/monthly/fixed/percentage>` | `repdt` | 관리자 | 감소 일정 또는 감소량 유형 |
| `repdecayamount <n>` | `repda` | 관리자 | 1에서 100 사이의 점수 또는 퍼센트 |
| `repdecayinactive <days>` | `repdi` | 관리자 | 감소 전 1에서 365 사이의 일수 |
| `reptake <@user> [amount]` | `-rep`, `takerep` | 관리자 | 점수 회수 |
| `repset <@user> <amount>` | `setrep` | 관리자 | 총점 설정 |
| `represet <@user or all>` | `resetrep` | 관리자 | 한 멤버 또는 모든 멤버 초기화 |
| `repfreeze <@user>` | `freezerep` | 관리자 | 멤버가 평판을 받지 못하게 하기 |
| `repunfreeze <@user>` | `unfreeze`, `unfreezerep` | 관리자 | 동결 해제 |
| `repreaction <emoji> [amount] [type]` | `repemoji`, `rre` | 관리자 | 반응 보상 추가 또는 수정 |
| `repreactionremove <emoji>` | `repemojiremove`, `rrer` | 관리자 | 반응 보상 제거 |
| `repreactionlist` | `repemojilist`, `rrel` | 관리자 | 반응 보상 목록 |
| `reprole [@role] [rep] [removeOnDrop] [#channel] [dm] [xp]` | | 역할 관리 | 역할 보상 추가, 수정, 목록 |
| `reproleremove <@role>` | `reprr` | 역할 관리 | 역할 보상 제거 |
| `reprolechannel <@role> [#channel]` | `reprc` | 관리자 | 보상의 공지 채널 설정 또는 제거 |
| `repcommandreq <command> <min> [type] [#channels]` | `repcmdreq`, `rcr` | 관리자 | 명령어에 평판 요구 조건 설정 |
| `repcommandbypass <command> <@roles>` | `repcmdbypass`, `rcb` | 관리자 | 요구 조건을 건너뛸 수 있는 역할 |
| `repcommandreqremove <command>` | `repcmdreqremove`, `rcrr` | 관리자 | 요구 조건 제거 |
| `repcommandreqlist` | `repcmdreqlist`, `rcrl` | 관리자 | 요구 조건 목록 |
| `reptypeadd <name> <display name>` | `repaddtype`, `rta` | 관리자 | 사용자 지정 유형 추가 |
| `reptyperemove <name>` | `repremovetype`, `rtr` | 관리자 | 사용자 지정 유형 제거 |
| `reptypelist` | `replisttypes`, `rtl` | 관리자 | 사용자 지정 유형 목록 |
| `repeventcreate <name> <multiplier> <hours>` | `repec` | 관리자 | 배수 이벤트 기록 |
| `repeventend <name>` | `repee` | 관리자 | 이벤트를 일찍 종료 |
| `repexport` | `repex` | 관리자 | 설정을 JSON으로 내보내기 |
| `repimport` | `repim` | 관리자 | 메시지에 첨부된 설정 파일 가져오기 |
| `repmilestonelost <@user> <@role> <threshold>` | | 관리자 | 마일스톤 상실 테스트 메시지 |

`/rep` 슬래시 명령어로는 `give`, `check`, `leaderboard`, `history`, `stats`를 쓸 수 있어요. 관리자용 그룹은 `/rep config`, `/rep decay`, `/rep manage`, `/rep reaction`, `/rep role`, `/rep type`, `/rep event`, `/rep require`이며, 위의 설정 명령어와 같은 기능을 해요. `/rep role list`와 `/rep role info`는 슬래시 명령어로만 쓸 수 있어요.

## 팁과 주의 사항

- 역할 보상을 쓰려면 봇의 역할이 보상 역할보다 위에 있어야 하고 역할 관리 권한이 있어야 해요. `reprole`은 봇보다 높은 역할을 거부해요.
- 최소 메시지 수는 메시지 수 세기 기능을 사용해요. 이 기능이 꺼져 있으면 메시지 수가 0으로 집계되어 멤버가 평판을 주지 못할 수 있어요.
- 평판 주기를 막는 것은 `disabled` 채널 상태뿐이에요. `readonly`는 명령어에서 허용되지만, 현재는 해당 채널의 평판을 막지 않아요.
- `repeventcreate`로 만든 이벤트는 배수와 종료 시간이 저장되지만, 현재는 이벤트 기간 동안 준 평판에 배수가 적용되지 않아요.
- 반응 평판은 기본 이모지의 이름을, 커스텀 이모지는 ID를 사용해요. 따라서 다른 서버의 커스텀 이모지는 제거된 뒤에는 일치하지 않아요.
- 감소 검사는 정각마다 실행되므로, `daily` 감소는 UTC 02:00 시간대에 한 번 적용돼요.
- 쿨다운은 쌍마다 적용돼요. 한 멤버는 일일 제한까지 여러 사람에게 연달아 평판을 줄 수 있어요.

---
title: XP 시스템
slug: xp
summary: 채팅과 음성 채널 활동에 레벨, 랭크 카드, 역할 및 화폐 보상, 기간 한정 이벤트를 더해 멤버에게 보상을 줘요.
icon: fa-star
category: Community
dashboard: /dashboard/xp
module: Xp
tags: [xp, experience, levels, level up, rank, rank card, leaderboard, role rewards, voice xp, xp boost, competition, xp curve, 경험치, 레벨, 레벨 업, 랭크, 랭크 카드, 순위표, 역할 보상, 음성 XP, XP 부스트, 경쟁, XP 곡선]
related: [currency, achievements, administration, utility]
---

## 기능 소개

멤버는 메시지를 보내거나 음성 채널에서 대화하면 XP를 얻어요. XP는 설정한 곡선에 따라 레벨로 쌓여요. 누구나 `rank`를 실행하면 레벨, 진행 막대, 서버 순위, 아바타가 담긴 랭크 카드를 볼 수 있고, `leaderboard`로 누가 앞서 있는지 확인할 수 있어요.

멤버가 레벨 업을 하면 봇이 채널, 전용 레벨 업 채널, 또는 DM으로 알림을 보낼 수 있어요. 플레이스홀더를 넣은 자체 레벨 업 메시지를 쓰거나 기본 임베드를 그대로 쓸 수도 있어요. 특정 레벨에 도달하면 역할과 서버 화폐를 자동으로 지급할 수도 있어요.

운영진은 XP가 쌓이는 속도를 조절할 수 있어요. 메시지당 XP, 쿨다운, 분당 음성 XP, 전체 배율, 채널별 및 역할별 배율을 설정할 수 있어요. 일정 시간 동안 모든 배율을 올리는 부스트 이벤트를 열 수도 있고, 상위 순위에 보상을 주는 기간 한정 경쟁도 운영할 수 있어요. 봇 도배 채널이나 음소거된 역할이 XP를 얻지 못하도록 사용자, 역할, 채널을 제외 대상으로 지정할 수 있어요.

## 이런 때 사용해요

- 활동적인 멤버에게 눈에 보이는 진행 상황과 계속 대화할 이유를 주고 싶을 때
- 정해진 레벨에서 역할이 자동으로 열리게 해서, 오래 활동한 멤버가 운영진의 수작업 없이 혜택을 받게 하고 싶을 때
- 주말 XP 2배 이벤트나 "레벨 20 최초 달성" 경쟁을 열고 싶을 때
- 명령어 채널, 잠수 채널, 봇 역할을 제외해서 XP를 공정하게 유지하고 싶을 때
- 레벨 업 시 화폐도 함께 지급되도록 화폐 모듈과 연결하고 싶을 때

## XP를 얻는 방법

### 텍스트 XP

봇이 아닌 멤버가 보낸 메시지마다 **메시지당 XP**(기본값 3, 최대 50)를 받아요. 단, **메시지 XP 쿨다운**(기본값 60초) 동안에는 한 번만 받아요. 예를 들어 이 시간 안에 메시지를 10개 보내도 XP는 한 번만 받아요. 제외된 채널이나 제외된 사용자 및 역할의 메시지는 XP를 얻지 못해요. 서버 자체가 제외되어 있으면 아무것도 집계되지 않아요.

받은 양에는 배율이 적용돼요. 아래 배율은 모두 함께 곱해져요.

| 배율 | 설정 방법 | 참고 |
| --- | --- | --- |
| 전체 배율 | `setxpmultiplier` 또는 **전체 XP 배율** | 모든 XP 획득에 적용돼요 |
| 채널 배율 | `setchannelxp` | 해당 채널에서 얻는 XP에 적용돼요 |
| 역할 배율 | `setrolexp` | 배율이 있는 역할을 여러 개 가진 경우 가장 높은 배율만 사용해요 |
| 부스트 이벤트 | `xpboost` | 진행 중인 이벤트는 모두 적용돼요 |

계산 결과는 소수점 이하를 버리고 정수로 내림해요.

**첫 메시지 보너스**는 멤버가 UTC 기준 하루의 첫 메시지를 보낼 때 한 번 지급되는 별도 보상이에요. XP 설정에 저장되지만 대시보드에는 표시되지 않아요.

### 음성 XP

음성 XP는 세션 단위로 집계돼요. 멤버는 참여자가 두 명 이상인 음성 채널에 있을 때만 XP를 얻어요(봇은 세지 않아요). 또한 본인이나 서버에 의해 음소거 또는 스피커 끄기 상태가 아니어야 해요. 음소거, 스피커 끄기, 혼자 있는 시간은 집계되지 않아요.

세션이 끝나면 인정된 분 수에 **분당 음성 XP**(기본값 2, 최대 10)를 곱해요. 15초 미만의 세션은 XP를 얻지 못해요. **음성 XP 시간 제한**(기본값 60분)은 한 세션에서 XP를 지급받을 수 있는 최대 분 수예요. 배율은 기본 음성 XP가 5 이상일 때만 음성 XP에 적용돼요. 분당 음성 XP나 시간 제한을 0으로 설정하면 음성 XP가 꺼져요.

### XP 감소

XP 감소는 선택 사항이며 기본적으로 꺼져 있어요. 켜면 12시간마다 봇이 마지막 활동이 **비활동 일수(감소 전)** 보다 오래된 멤버를 찾아, 전체 XP의 **일일 감소율**만큼을 빼요. 이 세 가지 설정은 XP 설정 레코드에는 있지만 아직 명령어나 대시보드에서 조절할 수 없어요.

## 레벨과 곡선

멤버의 레벨은 **XP 곡선 유형**에 따라 달라져요. 모든 곡선은 1레벨에 필요한 36 XP를 기준으로 해요.

| 곡선 | 명령어 이름 | 대시보드 이름 | n레벨에 필요한 XP |
| --- | --- | --- | --- |
| 표준 | `Standard` | 기본값 | 36 x n의 제곱 |
| 선형 | `Linear` | 선형 | 36 x n |
| 가속 | `Accelerated` | 이차 | 36 x n의 1.25제곱 |
| 감속 | `Decelerated` | 지수 | 36 x n의 2.5제곱 |
| 사용자 지정 | `Custom` | 제공하지 않아요 | 표준과 같아요 |
| 레거시 | `Legacy` | 레거시 | 각 레벨은 36에 이전 레벨마다 9를 더한 값이 필요하며, 총합은 누적돼요 |

표준이 기본값이에요. `setxpcurve`로 곡선을 바꾸면 두 번째 인자로 `false`를 넣지 않는 한 모든 멤버의 레벨을 다시 계산해요. 곡선을 바꿔도 멤버의 XP 총량은 변하지 않아요. 바뀌는 것은 그 총량이 어느 레벨에 해당하는지뿐이에요.

## 레벨 업 알림

각 멤버는 `levelnotif`로 레벨 업 알림을 받는 방식을 고를 수 있어요. `None`, `Channel`, `Dm` 중 하나예요. 멤버는 `leveluppings false`를 실행해서 봇이 자신을 멘션하지 않도록 할 수도 있어요. 이 경우 이름은 일반 텍스트로 표시돼요.

채널 알림은 `levelupchannel`로 **레벨 업 채널**을 설정했다면 그 채널로, 없다면 XP를 얻은 채널로 보내요. 봇은 해당 채널에서 메시지 보내기 권한이 있어야 해요.

서버에 자체 메시지가 없으면 기본값으로 레벨 업 메시지를 제목으로 하는 임베드를 보내요. 임베드에는 멤버 아바타가 썸네일로 들어가고, 총 XP, 서버 순위, 새 레벨 필드가 포함돼요. `addlevelupmessage`로 자체 메시지를 추가하면 활성화된 메시지 중 하나가 무작위로 선택돼요. 자체 메시지는 일반 텍스트나 임베드 빌더에서 만든 임베드 JSON으로 작성할 수 있어요. 템플릿은 `testlevelupmessage`로 미리 확인할 수 있어요.

### 플레이스홀더

이 플레이스홀더는 자체 레벨 업 메시지에서 사용할 수 있어요. 일반 사용자 및 서버 플레이스홀더도 함께 쓸 수 있어요. 알림은 채널이나 알림을 유발한 사용자를 추적하지 않으므로, `%xp.channel.*%`는 "Unknown Channel"로, `%xp.triggeruser.*%`는 "System"으로 표시되고, `%xp.gained%`는 항상 0이에요.

| 플레이스홀더 | 값 |
| --- | --- |
| `%xp.user%` | 사용자 이름과 태그, 멘션을 끄면 일반 사용자 이름 |
| `%xp.user.mention%` | 멤버 멘션, 멘션을 끄면 일반 사용자 이름 |
| `%xp.user.name%` | 사용자 이름 |
| `%xp.user.displayname%` | 표시 이름 |
| `%xp.user.nickname%` | 닉네임, 없으면 사용자 이름 |
| `%xp.user.avatar%` | 아바타 URL |
| `%xp.user.id%` | 사용자 ID |
| `%xp.user.created%` | 계정 생성 날짜 |
| `%xp.user.joined%` | 서버 참여 날짜 |
| `%xp.level.old%` | 레벨 업 전 레벨 |
| `%xp.level.new%` | 새 레벨 (`%xp.level.current%`도 같아요) |
| `%xp.level.next%` | 새 레벨에 1을 더한 값 |
| `%xp.level.difference%` | 올라간 레벨 수 |
| `%xp.total%` | 총 XP |
| `%xp.current%` | 현재 레벨 안에서 얻은 XP |
| `%xp.needed%` | 현재 레벨에 필요한 총 XP |
| `%xp.remaining%` | 다음 레벨까지 남은 XP |
| `%xp.progress%` | 현재 레벨의 진행률(%) |
| `%xp.rank%` | 서버 순위 숫자 |
| `%xp.rank.ordinal%` | "third"처럼 글자로 표현한 순위 |
| `%xp.rank.suffix%` | 접미사만: st, nd, rd 또는 th |
| `%xp.guild%`, `%xp.guild.name%` | 서버 이름 |
| `%xp.guild.id%` | 서버 ID |
| `%xp.guild.membercount%` | 대략적인 멤버 수 |
| `%xp.guild.icon%`, `%xp.guild.banner%` | 서버 아이콘과 배너 URL |
| `%xp.time%`, `%xp.time.full%`, `%xp.date%` | 현재 UTC 시간, 날짜가 포함된 시간, 날짜 |
| `%xp.timestamp%`, `%xp.timestamp.relative%` | 현재 시각의 Discord 타임스탬프 태그 |

> [!EXAMPLE]
> `addlevelupmessage %xp.user.mention% just hit level %xp.level.new% and is now %xp.rank.ordinal% on the leaderboard.`

디스코드에서 `levelupplaceholders`를 실행하면 같은 목록을 볼 수 있어요.

## 역할 보상

`rolereward <level> <role>`은 멤버가 해당 레벨에 도달하면 역할을 지급해요. **역할 보상 독점 지급**이 꺼져 있으면(기본값) 멤버는 자신의 레벨 이하의 보상 역할을 모두 유지하고, 자신보다 높은 레벨의 보상 역할은 잃어요. 켜져 있으면(`setxpexclusive true`) 멤버가 도달한 가장 높은 레벨의 보상만 유지하고 나머지 보상 역할은 모두 제거해요.

보상은 레벨이 바뀔 때 적용돼요. 보상을 추가하거나 XP를 가져온 뒤에는 `syncmyxproles`, `syncuserxproles`, `syncallxproles`로 역할을 맞출 수 있어요. 전체 멤버 동기화는 한 시간에 한 번 실행될 수 있어요. 봇은 역할 관리 권한이 있어야 하고, 봇의 역할이 모든 보상 역할보다 위에 있어야 해요.

## 화폐 보상

`currencyreward <level> <amount>`는 멤버가 해당 레벨에 도달하면 화폐 모듈에서 서버 화폐를 지급해요. 0을 입력하면 보상이 제거돼요. `setxp`나 감소 등으로 멤버의 레벨이 떨어지면, 잃은 레벨에 해당하는 화폐는 회수돼요.

## 업적

[업적](/wiki/achievements)은 자체 점수와 등급을 가진 별개의 시스템이므로, 업적 등급은 XP 레벨이 아니에요. 두 시스템은 두 곳에서 만나요. XP 레벨에 도달하면 커뮤니티 분류의 업적이 열리고, 업적은 업적별 XP 보상이나 업적 설정 탭의 **점수당 XP**를 통해 XP를 다시 줄 수 있어요. 둘 다 설정하기 전까지는 꺼져 있어요.

## 부스트 이벤트

`xpboost <time> <multiplier> <name>`은 기간이 정해진 이벤트를 시작해요. 예를 들면 `xpboost 2h 2.0 Weekend XP Event`와 같아요. 진행 중인 부스트는 다른 배율 위에 추가로 메시지 및 음성 XP를 곱해요. `xpboosts`로 진행 중인 이벤트를 확인하고, `cancelboost <id>`로 일찍 끝낼 수 있어요.

## 경쟁

`xpcompetition <time> <type> [targetLevel] [name]`은 기간이 정해진 경쟁을 시작해요. 멤버는 경쟁 중 처음으로 XP를 얻는 순간 자동으로 참가해요.

| 유형 | 우승자 |
| --- | --- |
| `MostGained` | 경쟁 기간 동안 XP를 가장 많이 얻은 사람 |
| `ReachLevel` | 목표 레벨에 가장 먼저 도달한 사람 |
| `HighestTotal` | 경쟁이 끝날 때 총 XP가 가장 높은 사람 |

`addcompetitionreward <id> <position> <type> <reward>`로 상품을 추가할 수 있어요. 유형은 `Role`, `XP`, `Currency` 중 하나예요. 역할 보상은 지급되고, XP 보상은 추가 보너스 XP로 더해지며, 화폐는 화폐 모듈을 통해 지급돼요. `competitionleaderboard <id>`로 순위를 확인하고, `endcompetition <id>`로 경쟁을 일찍 끝내고 보상을 지급할 수 있어요.

## 제외 설정

`xpexclude`와 `xpinclude`는 사용자, 역할, 텍스트 채널을 인자로 받아요. 제외된 사용자와 제외된 역할을 가진 사람은 XP를 얻지 못하고, 제외된 채널에서는 누구도 XP를 얻지 못해요. 음성 채널에도 똑같이 적용돼요. `xpexcludelist users|roles|channels`로 목록을 볼 수 있어요. 슬래시 명령어는 `/xp admin exclude`, `/xp admin include`(`user`, `role`, `channel` 옵션 중 하나를 지정), `/xp exclude-list`예요. 대시보드의 **서버 XP 제외** 스위치를 켜면 서버 전체의 XP 획득이 한 번에 꺼져요.

## 랭크 카드

`rank [@user]`는 PNG 카드를 만들어요. `textrank [@user]`는 같은 정보를 화면 낭독기가 읽을 수 있는 텍스트로 보여줘요. 봇에게는 순위가 없어요.

카드는 서버의 템플릿으로 만들어져요. 배경 이미지(**사용자 지정 XP 카드 배경**에 올린 이미지 또는 기본 배경)와 사용자 아바타 및 이름, 진행 막대, 서버 레벨, 서버 순위, 현재 레벨에 머문 시간, 지급된 보너스 XP 레이어로 구성돼요. 각 레이어는 표시 여부, 위치, 크기, 색상을 바꿀 수 있고, 진행 막대는 둥근 모양, 여러 칸, 원형으로 만들거나 어느 방향으로든 채울 수 있어요.

**템플릿** 탭에서 시각적 편집기를 열 수 있어요. 화면 너비가 768픽셀보다 좁으면 대시보드가 같은 레이어를 다루는 터치 편집기로 바뀌고, 속성은 하단 시트에서, 위치와 크기는 간단한 조절 도구로 설정해요. 더 넓은 화면에서는 레이어 목록, 격자, 스냅, 눈금자, 실행 취소와 다시 실행, 확대/축소를 갖춘 전체 편집기를 쓸 수 있어요.

## 순위표

`leaderboard [page]`는 서버 순위를 보여줘요. 서버가 화폐 모듈을 사용하고 유통 중인 화폐가 있으면, 인자 없이 `leaderboard`만 입력했을 때 XP를 말하는 건지 화폐를 말하는 건지 물어봐요. 페이지 번호를 입력하면 항상 XP 순위예요. 대시보드의 **순위표** 탭에도 같은 순위가 표시되고, **XP 조정** 기능으로 멤버의 XP를 더하거나, 설정하거나, 초기화할 수 있어요. 보너스 XP도 함께 지울지 선택할 수 있어요.

## 설정

대시보드에는 **설정**, **통계**, **순위표**, **보상**, **템플릿**, **제외 설정**의 여섯 탭이 있어요. 아래 항목은 설정 탭에 있어요.

| 설정 | 기본값 | 설명 |
| --- | --- | --- |
| 서버 XP 제외 | 끔 | 서버 전체의 XP 획득을 막아요 |
| 메시지당 XP | 3 | 메시지마다 주는 기본 XP, 최대 50 |
| 메시지 XP 쿨다운 | 60초 | 멤버별로 메시지 XP를 받을 수 있는 최소 간격 |
| 분당 음성 XP | 2 | 인정된 음성 1분당 기본 XP, 최대 10. 0이면 음성 XP를 꺼요 |
| 음성 XP 시간 제한 | 60분 | 음성 세션 하나에서 XP를 지급받을 수 있는 최대 분 수 |
| 전체 XP 배율 | 1 | 모든 XP 획득에 곱해져요 |
| XP 곡선 유형 | 기본값 | XP를 레벨로 바꾸는 곡선 |
| 사용자 지정 XP 카드 배경 | 없음 | 랭크 카드 뒤에 쓸 이미지 URL |

**보상** 탭에서는 역할 보상과 화폐 보상을 관리하고, **제외 설정** 탭에서는 제외된 채널과 역할을 관리해요. **통계** 탭에는 전체 사용자 수, 전체 XP, 평균 레벨, 최고 레벨, 최근 XP 활동이 표시돼요.

`GuildXpSetting` 레코드에도 다음 항목이 있지만, 명령어로만 설정할 수 있어요. `FirstMessageBonus`, `ExclusiveRoleRewards`(`setxpexclusive`), `LevelUpChannel`(`levelupchannel`), `LevelUpMessage`, 그리고 감소 관련 항목인 `EnableXpDecay`, `InactivityDaysBeforeDecay`, `DailyDecayPercentage`예요.

## 설정 따라 하기

1. 대시보드에서 **XP 시스템**을 열고 **서버 XP 제외**가 꺼져 있는지 확인해요.
2. **설정**에서 메시지와 음성 값은 기본값 그대로 두고 곡선을 고른 뒤 **변경 사항 저장**을 눌러요.
3. **제외 설정**에서 봇 명령어 채널과 음소거된 역할 또는 봇 역할을 제외해요.
4. **보상**에서 몇 개의 마일스톤 레벨에 역할 보상을 추가해요. 봇의 역할이 그 역할들보다 위에 있는지 확인해요.
5. 디스코드에서 `levelupchannel #level-ups`를 실행하고 `addlevelupmessage` 템플릿을 한두 개 추가해요. `testlevelupmessage`로 테스트해요.
6. **템플릿**을 열고 배경을 업로드한 뒤 카드를 배치해요. `rank`를 실행해서 결과를 확인해요.

## 명령어

이 명령어는 서버의 접두사(바꾸지 않았다면 `.`)와 함께 실행해요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `rank [@user]` | | 없음 | 랭크 카드 표시 |
| `textrank [@user]` | | 없음 | 텍스트로 된 랭크 정보 |
| `leaderboard [page]` | `lb` | 없음 | 서버 XP 순위 |
| `levelnotif <None\|Channel\|Dm>` | `lvlnotif` | 없음 | 레벨 업 알림 방식 선택 |
| `leveluppings <true\|false>` | `lvluppings` | 없음 | 레벨 업 메시지에서 나를 멘션할지 여부 |
| `xpsettings` | `xpconfig` | 서버 관리 | 현재 XP 설정 표시 |
| `setmessagexp <amount>` | `setmsgxp` | 서버 관리 | 메시지당 XP |
| `setxpcooldown <seconds>` | `xpcd` | 서버 관리 | 메시지 XP 쿨다운 |
| `setvoicexp <amount>` | | 서버 관리 | 분당 음성 XP |
| `setvoicetimeout <minutes>` | | 서버 관리 | 음성 세션 상한 |
| `setxpmultiplier <number>` | `xpmult` | 서버 관리 | 전체 배율 |
| `setxpcurve <type> [recompute]` | | 서버 관리 | 레벨 곡선 변경 |
| `setxpexclusive <true\|false>` | `xpexclusive`, `exclusivexp`, `setxpexcl`, `xpexcl` | 서버 관리 | 가장 높은 보상 역할만 유지 |
| `setchannelxp <#channel> <number>` | | 서버 관리 | 채널 배율 |
| `setrolexp <role> <number>` | | 서버 관리 | 역할 배율 |
| `addxp <@user> <amount>` | | 서버 관리 | 멤버에게 XP 추가 |
| `setxp <@user> <amount>` | | 서버 관리 | 멤버의 XP 설정 |
| `resetxp <@user> [resetBonus]` | | 서버 관리 | 멤버의 XP를 0으로 초기화 |
| `resetxp` | | 관리자 | 서버 전체 XP 초기화 |
| `xpboost <time> <multiplier> <name>` | | 서버 관리 | 부스트 이벤트 시작 |
| `xpboosts` | | 없음 | 진행 중인 부스트 목록 |
| `cancelboost <id>` | | 서버 관리 | 부스트 이벤트 조기 종료 |
| `xpexclude <@user\|role\|#channel>` | | 서버 관리 | XP 제외 |
| `xpinclude <@user\|role\|#channel>` | | 서버 관리 | 제외 해제 |
| `xpexcludelist [users\|roles\|channels]` | | 없음 | 제외 목록 표시 |
| `rolereward <level> <role>` | `rr` | 역할 관리 | 역할 보상 추가 |
| `removerolereward <level>` | `removerr` | 역할 관리 | 역할 보상 제거 |
| `rolerewards` | | 없음 | 역할 보상 목록 |
| `currencyreward <level> <amount>` | `cr` | 서버 관리 | 화폐 보상 추가 |
| `removecurrencyreward <level>` | `removecr` | 서버 관리 | 화폐 보상 제거 |
| `currencyrewards` | | 없음 | 화폐 보상 목록 |
| `xpcompetition <time> <type> [targetLevel] [name]` | | 서버 관리 | 경쟁 시작 |
| `addcompetitionreward <id> <position> <Role\|XP\|Currency> <reward>` | | 서버 관리 | 순위별 상품 추가 |
| `xpcompetitions` | | 없음 | 진행 중인 경쟁 목록 |
| `competitionleaderboard <id>` | `complb` | 없음 | 경쟁 순위 |
| `endcompetition <id>` | | 서버 관리 | 경쟁을 끝내고 보상 지급 |
| `syncallxproles` | | 관리자 | 모든 멤버에게 보상 역할 다시 적용(한 시간에 한 번) |
| `syncmyxproles` | | 없음 | 내 보상 역할 다시 적용(5분에 한 번) |
| `syncuserxproles <@user>` | | 역할 관리 | 멤버 한 명의 보상 역할 다시 적용 |
| `levelupchannel [#channel]` | `lvlupchan` | 서버 관리 | 채널 알림을 보낼 위치. 채널을 지정하지 않으면 현재 채널 |
| `addlevelupmessage <text or embed JSON>` | `addlvlupmsg` | 서버 관리 | 자체 레벨 업 메시지 추가 |
| `levelupmessages` | `lvlupmsgs` | 서버 관리 | ID와 함께 자체 메시지 목록 표시 |
| `removelevelupmessage <id>` | `remlvlupmsg` | 서버 관리 | 자체 메시지 삭제 |
| `togglelevelupmessage <id> <true\|false>` | `togglelvlupmsg` | 서버 관리 | 메시지 하나를 켜거나 끄기 |
| `testlevelupmessage [template]` | `testlvlupmsg` | 서버 관리 | 템플릿 미리보기, 또는 저장된 템플릿 중 무작위 선택 |
| `levelupplaceholders` | `lvlupplaceholders` | 서버 관리 | 위 플레이스홀더 목록 표시 |

슬래시 명령어는 `/xp` 아래에 있어요. 운영진 명령어는 `/xp admin`(추가, 설정, 초기화, 제외, 포함, 역할 동기화), `/xp config`(비율, 배율, 곡선, 독점 지급), `/xp rewards`, `/xp boost`, `/xp competition`, `/xp levelup`으로 묶여 있어요. 사용자를 지정하지 않은 `/xp admin reset`은 서버 전체 XP를 초기화해요. 이 명령어는 관리자 권한과 `confirm: true` 옵션이 필요해요.

## 팁과 주의 사항

- 역할 보상과 역할 동기화에는 봇의 역할 관리 권한이 필요하고, 봇의 가장 높은 역할이 모든 보상 역할보다 위에 있어야 해요. `syncallxproles`와 `syncuserxproles`는 이 조건이 없으면 실행을 거부해요.
- 음성 XP는 채널에 음소거되지 않고 스피커 끄기도 되지 않은 사람이 최소 두 명 있어야 해요. 혼자 있거나 음소거된 멤버는 아무리 오래 있어도 XP를 얻지 못해요.
- XP 획득은 묶어서 배경에서 기록되므로, `rank` 결과는 마지막 메시지보다 몇 초 늦게 반영될 수 있어요.
- `setxp`나 `resetxp`로 XP를 낮추면 레벨이 떨어질 수 있어요. 이때 보상 역할은 제거되고, 잃은 레벨의 화폐 보상은 회수돼요.
- `Custom` 곡선은 표준과 똑같이 작동하며 대시보드에서는 제공하지 않아요. 레거시는 이전 설정에서 옮겨 오면서 기존 레벨을 맞추고 싶을 때만 선택하세요.
- 자체 레벨 업 메시지는 기본 임베드를 완전히 대체해요. 자체 메시지를 모두 끄면 기본 임베드가 다시 표시돼요.
- 부스트 이벤트와 경쟁은 명령어로만 관리하며 대시보드에는 표시되지 않아요.

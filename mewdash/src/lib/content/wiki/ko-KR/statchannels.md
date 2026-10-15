---
title: 통계 채널
slug: statchannels
summary: 멤버 수, 부스트 수, 열린 티켓 수, Twitch 시청자 수처럼 실시간 숫자를 이름에 자동으로 표시하는 음성 채널이에요.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/statchannels
module: StatChannels
tags: [stat channels, counter, member count, live stats, voice channel stats, countdown, member goal, boost count, twitch viewers, 통계 채널, 카운터, 멤버 수, 실시간 통계, 음성 채널 통계, 카운트다운, 멤버 목표, 부스트 수, 트위치 시청자]
related: [counting, twitch, suggestions, xp, afk, starboard]
---

## 기능 설명

통계 채널은 채널 목록 맨 위에 놓이는 잠긴 음성 채널이에요. 이름에 "Members: 12,480"처럼 숫자가 표시돼요. 봇이 일정한 주기로 이름을 다시 쓰기 때문에 숫자가 항상 최신 상태로 유지돼요. 멤버는 이 채널에 들어갈 수 없고, 숫자를 보기만 할 수 있어요.

카운터 유형, 이름 템플릿, 숫자 표시 스타일, 새로 고침 주기를 고를 수 있어요. 봇은 서버 정보, 현재 접속 상태, Nitro 부스트, 이모지 슬롯, 멤버 목표, 카운트다운 등 수십 가지 카운터를 지원해요. 티켓, 제안, 기브어웨이, XP, 카운팅, 스타보드, 연결된 Twitch나 마인크래프트 서버 같은 다른 Mewdeko 기능의 값도 가져올 수 있어요.

Discord는 채널 이름을 10분에 두 번까지만 바꾸도록 허용해요. 통계 채널은 업데이트 방식을 고를 수 있게 해서 이 제한을 우회해요. 그중 하나는 채널을 삭제했다가 다시 만들어서 1분마다 새로 고칠 수 있어요.

## 사용 이유

- 서버 상단에 멤버, 사람, 봇 수를 표시해요.
- 백분율이나 진행 막대로 멤버 목표까지의 진행 상황을 보여줘요.
- 이벤트, 출시, 기념일까지 남은 시간을 카운트다운해요.
- 스트리머 서버에 Twitch 방송 상태와 시청자 수를 보여줘요.
- 대시보드를 열지 않고도 스태프가 열린 티켓이나 대기 중인 제안을 실시간으로 확인할 수 있어요.
- 초대 링크 옆에 마인크래프트 서버 상태와 접속자 수를 표시해요.

## 카운터 유형

아래 전체 목록은 `statchanneltypes`와 대시보드의 **사용 가능한 카운터** 섹션에 나오는 내용이에요. 모든 유형은 공통 플레이스홀더를 쓸 수 있고, 일부는 자체 플레이스홀더를 더 가져요. 기본 템플릿은 일치하는 이모지로 시작하고 뒤에 표시된 텍스트가 붙어요.

### 멤버

| 유형 | 표시 내용 | 기본 템플릿 | 추가 플레이스홀더 |
| --- | --- | --- | --- |
| `TotalMembers` | 봇을 포함한 모든 멤버 | `Members: %count%` | |
| `HumanMembers` | 봇이 아닌 멤버 | `Humans: %count%` | |
| `BotCount` | 봇 계정 | `Bots: %count%` | |
| `OnlineMembers` | 오프라인이 아닌 상태의 멤버 | `Online: %count%` | |
| `IdleMembers` | 자리 비움 상태의 멤버 | `Idle: %count%` | |
| `DndMembers` | 방해 금지 상태의 멤버 | `DND: %count%` | |
| `StreamingMembers` | 스트리밍 활동 중인 멤버 | `Streaming: %count%` | |
| `InVoiceMembers` | 음성 채널에 접속한 멤버 | `In Voice: %count%` | |
| `RoleMembers` | 선택한 역할을 가진 멤버 | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.color%` |
| `NewestMember` | 가장 최근에 들어온 멤버 | `Newest: %member.name%` | `%member.name%`, `%member.id%` |
| `MembersJoinedToday` | 최근 24시간 안에 들어온 멤버 | `Joined Today: %count%` | |
| `MembersJoinedWeek` | 최근 7일 안에 들어온 멤버 | `This Week: %count%` | |
| `MemberGoal` | 목표 멤버 수까지의 진행 상황 | `%count% / %goal%` | `%goal%`, `%goal.raw%`, `%goal.percent%`, `%goal.remaining%`, `%goal.bar%` |
| `AfkCount` | Mewdeko으로 현재 잠수 중인 멤버 | `AFK: %count%` | |

### 서버

| 유형 | 표시 내용 | 기본 템플릿 | 추가 플레이스홀더 |
| --- | --- | --- | --- |
| `Countdown` | 목표 날짜까지 남은 시간 | `%days%d %hours%h left` | `%days%`, `%hours%`, `%minutes%`, `%total.hours%` |
| `ChannelCount` | 모든 채널 | `Channels: %count%` | |
| `TextChannelCount` | 텍스트 채널 | `Text: %count%` | |
| `VoiceChannelCount` | 음성 채널 | `Voice: %count%` | |
| `CategoryCount` | 카테고리 | `Categories: %count%` | |
| `StageChannelCount` | 스테이지 채널 | `Stages: %count%` | |
| `ForumChannelCount` | 포럼 채널 | `Forums: %count%` | |
| `ThreadCount` | 활성 상태로 캐시된 스레드 | `Threads: %count%` | |
| `RoleCount` | 역할 | `Roles: %count%` | |
| `BoostCount` | 활성 Nitro 부스트 | `Boosts: %count%` | |
| `BoostLevel` | 부스트 등급 (0~3) | `Level %count%` | |
| `NextBoostGoal` | 다음 등급까지 필요한 부스트 수 | `%count% to Tier %tier.next%` | `%tier.next%`, `%tier.current%` |
| `EmojiCount` | 모든 커스텀 이모지 | `Emojis: %count%` | |
| `AnimatedEmojiCount` | 애니메이션 커스텀 이모지 | `Animated: %count%` | |
| `StaticEmojiCount` | 정적 커스텀 이모지 | `Static: %count%` | |
| `StickerCount` | 커스텀 스티커 | `Stickers: %count%` | |
| `EmojiSlotsUsed` | 등급 한도 대비 사용 중인 이모지 슬롯 | `Slots: %count%/%slots.max%` | `%slots.max%`, `%slots.free%` |
| `ServerAge` | 서버를 만든 뒤 지난 일수 | `Age: %count% days` | `%years%`, `%created%` |
| `EventCount` | 예약된 이벤트 | `Events: %count%` | |
| `BotUptime` | Mewdeko이 실행된 시간 | `Uptime: %days%d %hours%h` | `%days%`, `%hours%`, `%minutes%` |
| `InviteCount` | 초대 추적으로 기록된 초대 | `Invites: %count%` | |

### Twitch

연결된 Twitch 모듈의 Twitch 채널 정보를 읽어요.

| 유형 | 표시 내용 | 기본 템플릿 | 추가 플레이스홀더 |
| --- | --- | --- | --- |
| `TwitchLiveStatus` | 방송 중인지 여부 | `%twitch.name%: %status%` | `%status%`, `%twitch.name%` |
| `TwitchViewers` | 현재 시청자 수 | `Viewers: %count%` | `%twitch.name%` |
| `TwitchGame` | 방송 중인 카테고리 | `%game%` | `%game%`, `%title%`, `%twitch.name%` |
| `TwitchUptime` | 방송이 켜진 뒤 지난 시간 | `Live %hours%h %minutes%m` | `%hours%`, `%minutes%` |
| `TwitchFollowers` | 팔로워 총수 | `Followers: %count%` | `%twitch.name%` |
| `TwitchSubs` | 구독자 총수 | `Subs: %count%` | `%twitch.name%` |
| `TwitchCounter` | 이름이 지정된 Twitch 채팅 카운터 | `%counter.name%: %count%` | `%counter.name%` |
| `TwitchLastRaider` | 가장 최근의 레이더 | `Last Raid: %raider%` | `%raider%`, `%raid.viewers%` |
| `TwitchRecentStreams` | 최근 14일 안에 시작된 방송 수 | `Streams: %count%` | |

### 다른 Mewdeko 기능

| 유형 | 카테고리 | 표시 내용 | 기본 템플릿 | 추가 플레이스홀더 |
| --- | --- | --- | --- | --- |
| `MinecraftPlayers` | 마인크래프트 | 감시 중인 서버의 접속자 수 | `Players: %count%/%players.max%` | `%players.max%`, `%server.version%` |
| `MinecraftStatus` | 마인크래프트 | 감시 중인 서버에 연결 가능한지 여부 | `%status%` | `%status%`, `%latency%` |
| `CountingCurrent` | 카운팅 | 카운팅 채널의 현재 숫자 | `Count: %count%` | |
| `CountingRecord` | 카운팅 | 지금까지 도달한 가장 높은 숫자 | `Record: %count%` | |
| `OpenTickets` | 티켓 | 열려 있고 보관되지 않은 티켓 | `Open Tickets: %count%` | |
| `TicketsToday` | 티켓 | 최근 24시간 안에 열린 티켓 | `Today: %count%` | |
| `PendingSuggestions` | 제안 | 결정을 기다리는 제안 | `Pending: %count%` | |
| `ActiveGiveaways` | 기브어웨이 | 현재 진행 중인 기브어웨이 | `Giveaways: %count%` | |
| `StarboardPosts` | 스타보드 | 스타보드 게시물 총수 | `Starred: %count%` | |
| `TopXpUser` | XP | XP가 가장 많은 멤버 | `Top: %member.name%` | `%member.name%`, `%member.id%`, `%member.xp%` |
| `TotalGuildXp` | XP | 서버에서 얻은 XP 총합 | `Total XP: %count%` | |
| `TotalCurrency` | 화폐 | 멤버들이 가진 화폐 | `In Circulation: %count%` | |
| `ActivePolls` | 투표 | 투표를 받고 있는 투표 | `Polls: %count%` | |
| `Clock` | 서버 | 서버 시간대의 날짜와 시간 | `%time% %tz%` | `%time%`, `%date%`, `%datetime%`, `%weekday%`, `%tz%` |
| `MessagesToday`, `MessagesWeek` | 활동 | 최근 24시간 또는 7일 동안의 메시지 | `Today: %count%` | |
| `VoiceHoursToday`, `VoiceHoursWeek` | 활동 | 최근 24시간 또는 7일 동안 모든 멤버의 음성 채널 이용 시간 | `Today: %count%h` | |
| `TopChatter` | 활동 | 최근 7일 동안 가장 활발하게 채팅한 멤버 | `Chatter: %member.name%` | `%member.name%`, `%member.id%`, `%member.messages%` |
| `TopVoiceMember` | 활동 | 최근 7일 동안 음성 채널에 가장 오래 있던 멤버 | `Voice: %member.name%` | `%member.name%`, `%member.id%`, `%member.hours%` |
| `TopGame` | 활동 | 최근 7일 동안 가장 많이 플레이한 게임 (게임 추적 필요) | `%game%` | `%game%`, `%hours%`, `%players%` |
| `PlayingNow` | 활동 | 추적 중인 게임을 지금 플레이하는 멤버 (게임 추적 필요) | `Playing: %count%` | |
| `RoleMembersOnline` | 멤버 | 역할을 가졌고 오프라인이 아닌 멤버 | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.total%` |
| `TopInviter` | 초대 추적 | 초대를 가장 많이 한 멤버 | `Inviter: %member.name%` | `%member.name%`, `%member.id%`, `%member.invites%` |
| `InvitesWeek` | 초대 추적 | 최근 7일 동안 초대한 사람에게 귀속된 참여 수 | `This Week: %count%` | |
| `MembersLeftToday`, `MembersLeftWeek` | 멤버 | 최근 24시간 또는 7일 동안 나간 멤버 | `Left Today: %count%` | |
| `NetGrowthWeek` | 멤버 | 최근 7일 동안의 참여 수에서 퇴장 수를 뺀 값 | `Growth: %count%` | `%joins%`, `%leaves%` |

### 모든 유형에서 쓸 수 있는 플레이스홀더

| 플레이스홀더 | 값 |
| --- | --- |
| `%count%` | 선택한 표시 스타일로 렌더링된 값 |
| `%count.raw%` | 숫자만 있는 원래 값 |
| `%server.name%` | 서버 이름 |
| `%server.id%` | 서버 ID |
| `%server.members%` | 전체 멤버 수 |
| `%server.boostcount%` | 부스트 수 |
| `%server.boostlevel%` | 부스트 등급 |

채널 이름은 Discord의 100자 제한을 넘을 수 없어요.

## 표시 스타일

**카운터 스타일**은 `%count%`를 어떻게 표시할지 정해요. 숫자 카운터에만 적용돼요. `NewestMember` 같은 텍스트 카운터는 텍스트를 그대로 표시하고, `TwitchLiveStatus` 같은 참/거짓 카운터는 "LIVE" 또는 "Offline" 같은 문구를 표시해요.

| 스타일 | 1234일 때 예시 | 참고 |
| --- | --- | --- |
| `Plain` | `1234` | 숫자 그대로 |
| `Comma` | `1,234` | 천 단위 구분 기호. 기본값이에요. |
| `Compact` | `1.2K` | K, M, B, T 단위, 기본으로 소수점 한 자리 |
| `Padded` | `1234` | 고정 자릿수로 앞을 0으로 채워요. 기본은 네 자리라서 42는 `0042`가 돼요. |
| `Ordinal` | `1,234th` | st, nd, rd, th 중 하나를 붙여요 |
| `Percent` | `61.7%` | 목표치에 대한 백분율, 기본으로 소수점 한 자리 |
| `ProgressBar` | 10칸짜리 막대 | 목표치까지 채워진 칸과 빈 칸, 기본은 10칸 |
| `EmojiDigits` | 키캡 숫자 | 각 숫자를 키캡 이모지로 표시해요 |
| `Roman` | `MCCXXXIV` | 1~3999는 로마 숫자, 그 밖의 값은 쉼표 스타일로 대체돼요 |

`Percent`와 `ProgressBar`는 비교할 목표치가 있어야 해요. 목표치가 없으면 `0%`나 빈 막대를 표시해요.

## 업데이트 방식

| 방식 | 대시보드 표시 이름 | 작동 방식 |
| --- | --- | --- |
| `Rename` | 이름만 바꾸기 | 채널 이름만 수정해요. Discord는 채널당 10분에 두 번만 이름 변경을 허용하므로 새로 고침 간격은 최소 5분으로 고정돼요. 채널 ID는 바뀌지 않아요. |
| `Recreate` | 삭제 후 다시 만들기 | 같은 이름, 카테고리, 위치, 권한 설정으로 새 채널을 만든 뒤 기존 채널을 삭제해요. 1분마다 새로 고칠 수 있지만, 업데이트할 때마다 채널 ID가 바뀌고 감사 로그 항목이 두 개씩 남아요. |
| `Auto` | 자동 (권장) | 10분에 두 번의 이름 변경 한도가 남아 있는 동안은 이름을 바꿔요. 한도를 모두 쓰고 간격이 5분 미만이면 대신 다시 만들어요. 간격이 5분 이상이면 다음 이름 변경 차례를 기다려요. |

새 통계 채널의 기본값은 **5분**마다 **자동**이에요. 간격은 1분(이름만 바꾸기는 5분)부터 1440분 사이로 제한돼요. 봇은 30초마다 간격이 지난 채널이 있는지 확인해요.

> [!WARNING]
> 다시 만들기를 쓰면 채널 ID가 바뀌어요. 다른 봇의 권한 설정이나 고정된 링크처럼 이 채널을 참조하는 것은 새로 고칠 때마다 깨져요. 빠른 새로 고침이 안정적인 ID보다 중요한 곳에서만 쓰세요.

## 설정

페이지에는 **통계 채널**, **추가**, **기본값** 세 개의 탭이 있고, 머리글에 **새로 고침** 버튼이 있어요. **통계 채널** 탭에는 설정된 모든 채널이 **편집**, **제거** 버튼과 함께 나열돼요.

**통계 채널 추가**에서는 **새 채널 만들기** 또는 **기존 채널 사용**을 고르고, **음성 채널** 선택기에서 채널을 고른 뒤 아래 항목을 설정해요.

| 설정 | 기본값 | 제어하는 내용 |
| --- | --- | --- |
| 카테고리 (선택 사항) | 없음 | 새로 만든 채널을 둘 위치 |
| 카운터 | 없음 | 위 목록에서 고른 카운터 유형 |
| 템플릿 | 유형의 기본 템플릿 | 플레이스홀더가 들어간 채널 이름. 플레이스홀더 칩을 누르면 삽입되고, 입력하는 동안 미리보기가 바뀌어요. |
| 카운터 스타일 | Comma | 위 표의 표시 스타일 |
| 업데이트 방식 | 자동 | 이름만 바꾸기, 다시 만들기, 자동 중 하나 |
| 새로 고침 간격 (분) | 5 | 이름을 새로 고치는 주기 |
| 역할 | 없음 | `RoleMembers`에서 표시 |
| 목표 날짜 | 없음 | `Countdown`에서 표시 |
| 목표치 | 없음 | `MemberGoal`에서 표시, 백분율 및 진행 막대 스타일에도 사용 |
| Twitch 카운터 이름 | 없음 | `TwitchCounter`에서 표시 |
| 카운팅 채널 | 없음 | 카운팅 유형에서 표시 |
| 마인크래프트 서버 | 없음 | 마인크래프트 유형에서 표시 |

**새 통계 채널 기본값**에서는 나중에 추가하는 채널의 **기본 업데이트 방식**, **기본 카운터 스타일**, **기본 간격 (분)**을 정할 수 있어요. **기본값** 탭에는 **카운터 스타일**과 **사용 가능한 카운터** 참고 섹션도 있어요.

새로 만든 채널은 `@everyone`의 연결 권한을 거부해서 이름표 역할을 해요. 직접 추가한 채널은 이미 가진 권한을 그대로 유지해요.

## 설정 순서

1. 대시보드에서 **통계 채널**을 열고 **기본값** 탭으로 가요. **기본 업데이트 방식**은 자동으로 두고, 원하는 간격을 정해요.
2. **추가**로 가서 **새 채널 만들기**를 고르고, 카운터를 묶고 싶으면 **카테고리**를 골라요.
3. **카운터**를 고르세요. 예를 들어 총 멤버 수요. **템플릿**을 바꾸면서 미리보기를 확인하세요.
4. **카운터 스타일**을 고르고 저장해요.
5. 카운터마다 반복하세요. 멤버 목표라면 `MemberGoal`을 고르고 **목표치**를 설정한 뒤 `ProgressBar` 스타일을 시험해 보세요.
6. 새 채널이 맨 위에 오지 않았다면 Discord에서 채널 목록 맨 위로 끌어다 놓으세요.
7. 새로 고침 간격만큼 기다린 뒤 이름이 바뀌는지 확인하세요.

## 명령어

서버의 접두사로 실행하세요(변경하지 않았다면 `.`). 유형, 스타일, 방식은 위 표에 나온 이름이에요. 예를 들어 `TotalMembers`, `Compact`, `Recreate`처럼 쓰세요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `statchannelcreate <type> [template]` | `scnew` | 채널 관리 | 해당 카운터를 표시하는 잠긴 음성 채널을 새로 만들어요 |
| `statchanneladd #voice <type> [template]` | `sca` | 채널 관리 | 기존 음성 채널을 통계 채널로 바꿔요 |
| `statchannelrole #voice @role [true] [template]` | `scr` | 채널 관리 | 역할 멤버 카운터를 추가해요. `true`를 쓰면 오프라인이 아닌 멤버만 세요 |
| `statchannelcountdown #voice <date> [template]` | `scc` | 채널 관리 | 날짜까지의 카운트다운을 추가해요 |
| `statchannelgoal #voice <number> [template]` | `scg` | 채널 관리 | 멤버 목표 카운터를 추가해요 |
| `statchanneltwitchcounter #voice <counter> [template]` | | 채널 관리 | 이름이 지정된 Twitch 채팅 카운터를 그대로 보여줘요 |
| `statchannelmechanism #voice <mechanism> [minutes]` | | 채널 관리 | 이름만 바꾸기, 다시 만들기, 자동 중 하나를 설정하고 간격도 선택적으로 정해요 |
| `statchannelstyle #voice <style>` | | 채널 관리 | 표시 스타일을 설정해요 |
| `statchanneldefaults [mechanism] [minutes] [style]` | | 채널 관리 | 새 통계 채널의 기본값을 설정해요 |
| `statchanneltypes [category]` | | 모든 멤버 | 모든 카운터를 예시와 함께 보여줘요. 카테고리별로 볼 수도 있어요 |
| `statchannellist` | `scl` | 모든 멤버 | 이 서버의 통계 채널을 유형, 스타일, 방식, 템플릿과 함께 나열해요 |
| `statchannelremove #voice` | `statchrm` | 채널 관리 | 채널 추적을 멈춰요 |

`statchannelcreate`는 봇에게 채널 관리 권한도 필요해요. 슬래시 명령어는 `/statchannel` 아래에 있어요.

## 팁과 주의 사항

- 봇이 채널 이름을 바꾸거나 다시 만들려면 채널 관리 권한이 필요해요.
- 음성 채널은 통계 채널 하나만 될 수 있어요. 같은 채널을 두 번 추가하면 "already a stat channel"이라는 오류가 나요.
- 카운팅, 마인크래프트, Twitch 카운터는 해당 기능을 먼저 설정해야 해요. 카운팅과 마인크래프트 대상은 대시보드에서 고르고, 이 항목을 위한 명령어는 없어요.
- `statchannelremove`는 추적만 멈춰요. 더 이상 필요하지 않다면 음성 채널은 직접 삭제하세요.
- Twitch 시청자 수나 열린 티켓 같은 실시간 값도 채널 자체의 간격을 따라요. 모든 채널이 아니라 해당 채널의 간격만 줄이세요.
- `Percent`와 `ProgressBar` 스타일은 채널 자체의 목표치를 써요. 목표치가 없는 카운터에 설정하면 항상 0이 표시돼요.

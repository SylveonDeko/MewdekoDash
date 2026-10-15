---
title: 초대
slug: invites
summary: 모든 가입을 초대 코드, 커스텀 URL 또는 앱에 연결하고, 멤버별 일반, 나감, 가짜, 보너스 초대를 세고, 코드에 라벨을 붙이고, 시간에 따른 성장, 유지율과 가입 경로를 확인해요.
icon: fa-users
category: Community
dashboard: /dashboard/invites
module: Utility
tags: [invites, invite tracking, inviter, who invited, referrals, recruitment, leaderboard, fake invites, bonus invites, retention, vanity, labels, analytics, mass ban, 초대, 초대 추적, 초대자, 추천, 모집, 순위표, 가짜 초대, 보너스 초대, 유지율, 커스텀 URL, 라벨, 분석, 일괄 차단]
related: [multigreets, statroles, liveboards, serverstats]
---

## 무엇을 하나요

누군가 가입하면 봇은 서버의 초대 링크 목록을 가입 전후로 비교해서 어떤 링크가 쓰였는지 알아내요. 맞는 링크가 없으면 커스텀 URL을 확인하고, 멤버가 어떻게 들어왔는지 기록해요. 멤버의 초대로, 커스텀 URL로, OAuth로 추가된 봇으로, 또는 알 수 없는 경로로 기록돼요. 가입이 **가짜**로 표시되지 않는 한 초대한 사람은 **일반** 초대를 얻어요. 초대된 멤버가 나가면 초대한 사람의 **나감** 수가 늘어나요. 스태프는 **보너스** 초대를 줄 수도 있어요. 멤버의 총합은 일반 초대에서 나감과 가짜를 빼고, 보너스를 더한 값이에요.

봇이 확인한 모든 가입은 멤버가 나간 뒤에도 기록으로 남아요. 그래서 페이지에서 유지율(초대한 멤버 중 아직 남아 있는 사람), 재가입, 어떤 코드로 들어온 사람이 계속 남아 있는지 볼 수 있어요.

## 왜 사용하나요

- 모집 이벤트를 열고, 부계정이나 가입 후 바로 나가기를 반복하는 방식으로는 조작할 수 없는 순위표에 따라 보상을 주세요.
- 트위터 캠페인, 파트너 서버, 유튜브 링크가 실제로 오래 남는 멤버를 데려오는지 각 코드에 라벨을 붙여서 확인하세요.
- 환영 메시지에 초대한 사람과 코드를 함께 보여주세요.
- 하나의 링크로 레이드가 들어왔을 때, 한 초대자가 데려온 모든 사람을 찾아서 차단하세요.

## 가입이 연결되는 방식

- 초대 목록을 읽으려면 봇에게 **서버 관리** 권한이 필요해요. 없으면 아무것도 기록되지 않아요.
- 가입은 서버마다 한 번에 하나씩 처리돼요. 두 번의 검사 사이에 여러 사람이 같은 코드로 들어오면 남은 몫을 기억해 두었다가 다음 가입에 넘겨 줘서, 몰린 가입도 놓치지 않아요.
- 커스텀 URL로 들어온 가입은 초대자 없이 **Vanity**로 기록돼요. OAuth로 추가된 봇은 **봇**으로 기록돼요.
- 주인이 있는 라벨 코드는 코드를 만든 사람이 아니라 주인에게 크레딧을 줘요. `invitelink`로 만든 개인 링크가 바로 이 방식이에요.

## 가짜 초대 감지

다음 중 하나에 해당하면 가입은 가짜로 표시되고, 초대한 사람은 일반 초대 대신 가짜 초대를 얻어요.

| 이유 | 조건 |
| --- | --- |
| 본인 | 멤버가 자신의 초대 링크를 사용했어요 |
| 새 계정 | 계정이 **최소 계정 나이**보다 어려요 (0이면 이 검사를 하지 않아요) |
| 재가입 | 멤버가 전에 가입한 적이 있고 **재가입 집계**가 꺼져 있어요 |
| 아바타 없음 | 멤버에게 아바타가 없고 **아바타가 없는 멤버 표시**가 켜져 있어요 |

**블랙리스트**에 있는 초대자나 블랙리스트 역할을 가진 초대자도 여전히 초대자로 표시되지만, 크레딧은 받지 못해요. **숨김** 목록의 멤버는 추적되지만 순위표에서 빠져요.

## 대시보드 탭

| 탭 | 보여주는 내용 |
| --- | --- |
| 개요 | 하루, 일주일, 한 달 또는 전체 기간의 가입, 나감, 순증가, 유지율, 가짜 가입, 가입 경로, 가입과 나감 차트, 상위 초대자와 상위 코드 |
| 순위표 | 모든 초대자의 일반, 나감, 가짜, 보너스, 유지율을 기간이나 역할로 필터링해서 보여주며 CSV로 내보낼 수 있어요. 행을 클릭하거나 멤버를 고르면 세부 내역을 보고, 일반, 보너스, 가짜 초대를 추가하거나 빼거나 초기화할 수 있어요 |
| 멤버 | 확인된 모든 가입을 초대자, 초대 코드 또는 라벨로 필터링해서 보여줘요. 어떤 경로로 들어왔는지, 가짜로 표시되었는지, 아직 남아 있는지도 보여주며 CSV로 내보낼 수 있어요 |
| 코드 & 라벨 | 서버의 모든 초대 코드를 만든 사람, 채널, 사용 횟수와 함께 보여줘요. 코드에 라벨을 붙이고, 그 코드로 가입하는 모든 사람에게 줄 역할을 선택적으로 정하거나, 코드를 삭제할 수 있어요 |
| 설정 | 추적, 나갈 때 크레딧 제거, 재가입 집계, 아바타 없는 멤버 표시, 최소 계정 나이, 개인 링크가 가리킬 채널, 가입 및 탈퇴 로그 채널, 블랙리스트, 숨김 멤버, 가져오기와 초기화 도구 |

## 설정

| 설정 | 기본값 | 역할 |
| --- | --- | --- |
| 초대 추적 | 켜짐 | 가입을 초대와 연결할지 여부 |
| 멤버가 나가면 크레딧 제거 | 켜짐 | 초대된 멤버가 나가면 초대한 사람의 나감 수를 1 늘려서 총합을 낮춰요 |
| 재가입 집계 | 켜짐 | 끄면 전에 가입한 적 있는 멤버를 가짜 초대로 표시해요 |
| 아바타가 없는 멤버 표시 | 꺼짐 | 아바타가 없는 계정의 가입을 가짜로 집계해요 |
| 최소 계정 나이 | 0일 | 이 기간보다 어린 계정은 가짜로 표시해요 |
| 개인 링크 채널 | 시스템 채널 | `invitelink`로 만든 초대가 가리키는 채널 |
| 가입 및 탈퇴 로그 채널 | 없음 | 가입과 나감마다 누가 누구를 어떻게 초대했는지, 코드, 계정 나이, 가짜 표시 여부를 임베드로 게시해요 |

**Discord에서 사용 기록 가져오기**는 초대자별 일반 초대 합계를 모든 코드의 사용 횟수 합으로 올려요. 줄이지는 않으므로, 재시작하거나 새로 설치한 뒤 다시 실행해도 안전해요. **나간 초대자 초기화**는 더 이상 서버에 없는 모든 사람의 집계를 지워요. **전체 초기화**는 모든 집계와 가입 기록을 지워요.

## 환영 메시지 자리표시자

추적을 켠 뒤에는 모든 환영 메시지에 다음 자리표시자를 쓸 수 있어요. 알 수 없는 값은 `Unknown` 또는 `0`으로 대체돼요.

| 자리표시자 | 값 |
| --- | --- |
| `%inviter.mention%`, `%inviter.username%`, `%inviter.id%`, `%inviter.avatar%` | 크레딧을 받은 초대자 |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | 초대자의 집계 |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%`, `%invite.fake%` | 사용된 초대 |
| `%user.joincount%`, `%user.leavecount%` | 이 멤버가 가입하고 나간 횟수 |
| `%server.members.ordinal%` | 1st, 2nd, 1,204th처럼 서수로 표시한 멤버 수 |
| `%user.joined.R%`, `%user.created.F%` 등 Discord 시간 형식 t, T, d, D, f, F, R | 가입 시각과 계정 생성 시각을 실시간 타임스탬프로 표시 |

## 명령어

서버의 접두사로 실행하세요. 접두사를 바꾸지 않았다면 `.`이에요. 모든 명령어는 `/invites` 아래에도 있어요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `invites [@user]` | | 없음 | 멤버의 총합과 일반, 나감, 가짜, 보너스 내역, 순위 |
| `whoinvited [@user]` | `invitedby` | 없음 | 멤버를 누가 초대했는지, 코드, 가짜 표시 여부 |
| `invitedusers [@user]` | `userinvites` | 없음 | 멤버가 초대한 모든 사람, 가입일과 표시 |
| `invitedbycode <code>` | | 없음 | 특정 코드로 가입한 모든 사람 |
| `invitedbylabel <label>` | | 없음 | 라벨이 붙은 코드로 가입한 모든 사람 |
| `inviteleaderboard [AllTime/Daily/Weekly/Monthly] [@role]` | `inviteslb` | 없음 | 기간별 순위표, 역할로 좁힐 수 있어요 |
| `invitestats [range]` | `growthstats` | 없음 | 가입, 나감, 순증가, 유지율, 가짜 가입, 경로, 상위 초대자와 코드 |
| `invitecodes [@user]` | `mycodes` | 없음 | 멤버의 초대 코드와 사용 횟수 |
| `invitelink` | `findlink`, `mylink` | 없음 | 본인의 개인 영구 링크, 없으면 새로 만들어요 |
| `addinvites`, `removeinvites`, `addbonusinvites`, `removebonusinvites`, `addfakeinvites`, `removefakeinvites <@user> <amount>` | | 서버 관리 | 멤버의 집계 조정 |
| `resetinvites <@user>` 또는 `resetinvites Server` 또는 `resetinvites LeftMembers` | | 서버 관리, 서버 전체는 관리자 | 집계 초기화 |
| `syncinvites [@user]` | | 서버 관리 | Discord에서 사용 기록 가져오기 |
| `deleteinvite <code>` | `delinvite` | 서버 관리 | 코드 삭제 |
| `purgeinvites [maxUses] [#channel]` | | 서버 관리 | 사용 횟수가 그 값 이하인 라벨 없는 코드를 모두 삭제 |
| `inviteblacklist <@user or @role>` | `invbl` | 서버 관리 | 크레딧을 받을 수 있는지 전환 |
| `invitehide <@user>` | `invhide` | 서버 관리 | 순위표 표시 여부 전환 |
| `inviteexclusions` | | 서버 관리 | 블랙리스트와 숨김 멤버 목록 |
| `invitelabelset <code> <label>`, `invitelabelrole <code> [@role]`, `invitelabelremove <code>`, `invitelabels` | | 서버 관리 | 라벨 관리 |
| `inviteexport [range]`, `invitedexport [@user]` | | 서버 관리 | CSV 내보내기 |
| `invitemassban <@user> [reason]`, `invitemassbancode <code> [reason]` | | 멤버 차단 | 초대자 또는 코드를 통해 들어왔고 아직 남아 있는 모든 사람을 확인 후 차단 |
| `invitesettings`, `toggleinvitetracking`, `toggleremoveinviteonleave`, `togglecountrejoins`, `togglefakenoavatar`, `setminaccountage <days>`, `invitelinkchannel [#channel]`, `invitelogchannel [#channel]` | | 서버 관리 | 설정 |

## 팁과 주의 사항

- 추적을 켜기 전이나 봇이 꺼져 있던 동안 가입한 멤버에게는 가입 기록이 없어요. **Discord에서 사용 기록 가져오기**를 한 번 실행하면 Discord가 가진 횟수로 일반 초대 합계를 채울 수 있어요.
- 가짜 가입은 멤버가 나가도 총합을 낮추지 않아요. 나간 일반 초대만 나감 초대가 돼요.
- 나갔다가 돌아온 멤버는 새 가입 기록을 얻어요. **재가입 집계**가 켜져 있으면 초대자는 다시 일반 초대를 받고, 이는 전에 생긴 나감 초대를 상쇄해요.
- 순위표의 유지율은 봇이 확인한 가입만 계산하므로 100%에서 시작하고, 기록이 쌓이면서 안정돼요.
- 스탯 역할은 초대 수에 따라 보상할 수 있고, 라이브 보드는 순위표를 채널에 고정해 보여줄 수 있어요.

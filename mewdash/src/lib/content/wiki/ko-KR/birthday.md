---
title: 생일
slug: birthday
summary: 멤버가 프로필에 생일을 설정하고 공지에 동의하면, 봇이 채널에 생일을 알려줘요. 필요하다면 임시 생일 역할과 역할 멘션도 함께 사용할 수 있어요.
icon: fa-birthday-cake
category: Community
dashboard: /dashboard/birthday
module: Birthday
tags: [birthday, birthdays, bday, celebrate, birthday role, announcement, timezone, age, profile, 생일, 축하, 생일 역할, 공지, 시간대, 나이, 프로필]
related: [utility, administration]
---

## 기능 소개

멤버는 `setbirthday`로 생일을 한 번 설정한 뒤, 기능이 켜져 있는 서버에서 `birthdayannouncements`를 실행해요. 봇은 매일 생일인 멤버를 확인해서 공지 채널에 메시지를 게시하고, 원하면 24시간 동안 생일 역할을 줄 수 있어요. 핑 역할을 설정했다면 메시지 앞에 그 역할을 멘션해요.

생일은 서버별이 아니라 멤버의 봇 프로필에 저장돼요. 그래서 `setbirthday`를 한 번만 실행하면 봇과 함께 있는 모든 서버에 적용돼요. 특정 서버에서 생일을 공지할지는 세 가지 조건으로 결정돼요. 멤버가 동의했는지, 프로필이 비공개가 아닌지, 생일 표시 방식이 비활성화가 아닌지예요.

`birthdaytoday`로 오늘 생일인 멤버를, `birthdaylist`로 곧 다가오는 생일을 누구나 확인할 수 있어요. 멤버가 연도를 숨기는 표시 방식을 고르지 않았다면 이름 옆에 나이가 함께 표시돼요.

스태프는 **생일** 대시보드 페이지나 `birthday*` 명령어로 채널, 역할, 메시지를 설정해요.

## 사용하면 좋은 이유

- 커뮤니티 서버에서 누군가 날짜를 직접 확인하지 않아도 매일 "생일 축하해요" 게시물을 올릴 수 있어요.
- 생일인 날 색이 있는 역할을 줘서 채팅에서 돋보이게 할 수 있어요.
- 생일 축하 역할 그룹을 멘션해서 공지를 실제로 많은 사람이 보게 할 수 있어요.
- 멤버가 생일을 얼마나 공개할지 고를 수 있어요. 완전히 숨기는 것도 가능해요.

## 공지 대상

멤버는 아래 조건이 모두 충족될 때만 공지와 목록에 포함돼요.

| 요구 사항 | 멤버가 설정하는 방법 |
| --- | --- |
| 생일이 설정되어 있음 | `setbirthday <date>` |
| 공지에 동의함 | `birthdayannouncements`로 전환. 기본값은 꺼짐 |
| 프로필이 비공개가 아님 | 프로필에서 `setprivacy public` |
| 표시 방식이 비활성화가 아님 | `setbirthdayprivacy <mode>` |

이 확인은 현재 서버에 있는 멤버를 기준으로 해요. 그래서 서버를 나간 멤버는 공지되지 않아요.

### 생일 표시 방식

`setbirthdayprivacy`는 아래 값 중 하나를 받아요. 목록, 프로필, `birthdaytoday`에 무엇을 표시할지 결정해요.

| 방식 | 효과 |
| --- | --- |
| `Default` | 전체 날짜를 표시하고, 목록에는 나이도 표시해요 |
| `MonthOnly` | 월만 표시하고, 나이는 숨겨요 |
| `YearOnly` | 연도만 표시하고, 나이는 계속 표시해요 |
| `MonthAndDate` | 월과 일을 표시하고, 나이는 숨겨요 |
| `Disabled` | 생일을 숨기고 공지하지 않아요 |

## 매일 확인하는 방식

서비스는 한 시간마다 실행되어, 멤버의 생일 월과 일을 UTC 기준 오늘 날짜와 비교해요. UTC 날짜가 바뀐 뒤 처음 실행되어 생일을 찾은 시점에 공지를 게시하고, 그 서버는 그날 처리가 끝났다고 표시하므로 같은 날 중복으로 게시되지 않아요.

공지는 **공지** 기능이 켜져 있고 채널이 설정되어 있을 때만 나가요. `birthdaychannel`이나 대시보드에서 채널을 설정하면 기능이 자동으로 켜져요.

시간대는 저장되지만 아직 매일 확인하는 데 쓰이지 않아요. `birthdaytimezone`과 **서버 시간대** 설정은 받아들여져서 설정 임베드에 표시되지만, 공지는 여전히 UTC 날짜를 기준으로 나가요.

## 생일 역할

**생일 역할**을 켜고 역할을 설정하면, 공지되는 멤버에게 공지 시점에 역할이 주어지고 24시간 뒤에 제거돼요. 제거 타이머는 메모리에 있으므로, 낮에 봇이 재시작되면 누군가 직접 제거하기 전까지 역할이 남아 있어요.

봇에는 **역할 관리** 권한이 필요하고, 봇의 최상위 역할이 생일 역할보다 위에 있어야 해요.

## 공지 메시지

기본 메시지는 파티 이모지와 함께 `Happy Birthday %user.mention%!`예요. `birthdaymessage` 명령어나 대시보드의 **생일 메시지** 편집기로 바꿀 수 있어요. 텍스트는 임베드 파서를 거치므로 임베드 빌더로 만든 모든 내용을 사용할 수 있고, 핑 역할을 켜면 역할 멘션이 메시지 앞에 붙어요.

### 자리표시자

메시지는 자리표시자 페이지의 일반 사용자, 서버, 채널, 봇 자리표시자와 생일 전용 값 하나를 지원해요.

| 자리표시자 | 값 |
| --- | --- |
| `%user.mention%` | 생일인 멤버를 멘션 |
| `%user.name%` | 멤버의 사용자 이름 |
| `%user.avatar%` | 멤버의 아바타 URL |
| `%server.name%` | 서버 이름 |
| `%birthday.age%` | 멤버가 맞이하는 나이, 모르면 `Unknown` |

> [!WARNING]
> `{user}`가 아니라 `%user.mention%`을 사용하세요. 텍스트 명령어 도움말에는 `{user}`가 나오지만, 게시되는 공지에서는 `%...%` 형식만 치환돼요.

## 설정

모든 설정은 **생일** 페이지의 세 탭, **설정**, **사용자**, **통계**에 있어요.

**설정**에는 기본 설정, 메시지 편집기, 기능마다 하나씩 토글이 있는 **생일 기능** 패널이 있어요.

| 설정 | 기본값 | 설명 |
| --- | --- | --- |
| Channel | 없음 | 공지를 게시할 곳 |
| Birthday Role | 없음 | 생일인 날 24시간 동안 주는 역할 |
| Ping Role | 없음 | 공지 앞에 멘션할 역할 |
| Server Timezone | UTC | 서버에 저장되며, 설정 임베드에 표시돼요 |
| Reminder Days Before Birthday | 0 | 0~30. 저장만 되고 아직 알림은 보내지 않아요 |
| Birthday Message | 기본 임베드 | 위의 자리표시자를 쓰는 공지 메시지 |

| 기능 토글 | 기본값 | 설명 |
| --- | --- | --- |
| Announcements | 꺼짐 | 채널에 매일 메시지를 게시해요 |
| Birthday Role | 꺼짐 | 임시 역할을 지급해요 |
| Reminders | 꺼짐 | 자리표시자 토글. 아직 아무것도 보내지 않아요 |
| Ping Role | 꺼짐 | 공지 때 핑 역할을 멘션해요 |
| Timezone Support | 꺼짐 | 자리표시자 토글. 확인은 여전히 UTC로 진행돼요 |

**사용자** 탭에는 다음 7일, 14일 또는 30일 안의 **다가오는 생일**와, 생일이 설정된 모든 멤버를 보여주는 **All Users** 목록이 있어요. 오늘 생일인 멤버는 페이지 맨 위에 강조돼요. **통계** 탭에는 **총 사용자**, **설정된 생일**, **공개 생일**, **오늘의 생일**가 표시돼요.

> [!NOTE]
> 대시보드 양식을 저장하면 입력한 값만 저장돼요. 역할이나 채널을 지우려면 역할 없이 `birthdayrole` 또는 `birthdaypingrole`을 실행하거나, `/birthday config reset`으로 모든 설정을 초기화하세요.

## 설정 순서

1. 대시보드에서 **생일**를 여세요.
2. **설정**에서 공지용 **채널**을 고르고 **설정 저장**을 누르세요.
3. **생일 기능** 패널에서 **공지**를 켜세요.
4. 필요하다면 **생일 역할**을 고르고 **생일 역할** 기능을 켜세요. **Ping Role**도 고르고 **Ping Role** 기능을 켜세요.
5. 필요하다면 `%user.mention%`과 `%birthday.age%`를 사용해서 **생일 메시지**를 직접 작성하세요.
6. 멤버에게 `setbirthday`를 실행한 뒤 `birthdayannouncements`로 동의하라고 알려주세요.
7. **사용자** 탭에서 멤버가 **다가오는 생일**에 나타나는지 확인하세요.

## 명령어

명령어는 서버의 접두사(바꾸지 않았다면 `.`)와 함께 실행해요. 슬래시 명령어는 `/birthday`와 `/birthday config` 아래에 있어요.

| 명령어 | 별칭 | 권한 | 용도 |
| --- | --- | --- | --- |
| `setbirthday <date>` | | 누구나 | 프로필에 생일 설정. 예: `setbirthday 1998-04-12` |
| `setbirthdayprivacy <mode>` | | 누구나 | 위의 표시 방식 중 하나 선택 |
| `birthdayannouncements` | `bdayann` | 누구나 | 공지 대상에 동의하거나 철회 |
| `birthdaytimezone <zone>` | `bdaytz` | 누구나 | 시간대 저장. 예: `Europe/London` |
| `birthdaytoday` | `todaysbirthdays` | 누구나 | 오늘 축하받는 멤버 목록 |
| `birthdaylist [days]` | `bdaylist`, `upcomingbirthdays` | 누구나 | 다가오는 생일, 1~30일, 기본 7일 |
| `birthdaychannel [#channel]` | `bdaychannel`, `bdaychan` | 관리자 | 공지 채널 설정 및 공지 기능 켜기 |
| `birthdayrole [@role]` | `bdayrole` | 관리자 | 24시간 생일 역할 설정, 역할 없이 실행하면 해제 |
| `birthdaypingrole [@role]` | `bdayping` | 관리자 | 멘션할 역할 설정, 역할 없이 실행하면 해제 |
| `birthdaymessage [text]` | `bdaymsg` | 관리자 | 공지 텍스트 설정, 또는 현재 텍스트 표시 |
| `birthdayconfig` | `bdaycfg` | 관리자 | 현재 설정 표시 |

`/birthday config reset`은 모든 설정을 지우고 기능을 모두 꺼요. 텍스트 명령어로는 같은 기능이 없어요.

## 팁과 주의 사항

- 멤버는 `birthdayannouncements`를 실행하기 전까지 공지되지 않아요. 멤버에게 꼭 알려주세요. 안 그러면 아무도 나타나지 않아요.
- `setbirthday`는 봇이 날짜로 해석할 수 있는 모든 형식을 받아요. `1998-04-12`처럼 헷갈리지 않는 형식을 쓰세요.
- `birthdaytimezone`은 `UTC`, `GMT`, `America/New_York`, `Europe/London`, `Asia/Tokyo`, `Asia/Kolkata`, `Australia/Sydney`, `Pacific/Auckland` 같은 고정된 16개 시간대만 받아요. 대시보드의 **서버 시간대** 드롭다운에는 비슷한 목록이 13개 있어요.
- 매일 확인은 UTC 기준이에요. UTC와 시차가 큰 지역의 멤버는 몇 시간 일찍 또는 늦게 공지될 수 있어요.
- 생일 역할에는 **역할 관리** 권한이 필요해요. 공지 채널에는 **메시지 보내기**와 **링크 첨부** 권한이 필요해요.
- `birthdayconfig`에는 "Reminder Days" 필드와 Reminders 기능이 표시되지만, 현재는 저장만 되고 아무것도 보내지 않아요.
- 저장된 생일을 삭제하는 명령어는 없어요. 멤버는 `setbirthdayprivacy Disabled`를 실행하거나 `birthdayannouncements`로 동의를 철회해서 생일을 숨길 수 있어요.

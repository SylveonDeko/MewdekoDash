---
title: 사용자 프로필
slug: userprofile
summary: 모든 멤버에게 봇이 어디서든 보여 줄 수 있는 프로필 카드를 제공해요. 소개, 대명사, 별자리, 생일, 색상, 이미지, Switch 친구 코드를 설정하고, 다른 사람에게 보이는 정보를 개인정보 설정으로 제어할 수 있어요.
icon: fa-user
category: Community
module: UserProfile
tags: [profile, bio, pronouns, pronoundb, zodiac, birthday, privacy, profile colour, profile image, switch friend code, stats opt out, greet dm opt out, 프로필, 소개, 대명사, 별자리, 생일, 개인정보, 프로필 색상, 프로필 이미지, Switch 친구 코드, 통계 수집 거부, 환영 DM 거부]
related: [birthday, switch, afk, help]
---

## 기능 소개

모든 멤버는 봇이 함께 있는 모든 서버에서 따라다니는 프로필을 가져요. `profile`을 실행하면 프로필이 임베드로 올라와요. 썸네일은 멤버의 아바타이고, 설명에는 소개가 표시되고, 필드에는 대명사, 별자리, 생일, 봇과 함께 있는 서버 수, Nintendo Switch 친구 코드(설정했다면)가 나와요. 맨 아래에는 사용자 지정 색상과 큰 이미지를 넣을 수 있어요.

멤버는 `set...` 명령어 몇 개로 프로필을 채우거나, 대시보드의 **내 설정** 페이지에서 설정할 수 있어요. 프로필은 서버마다 따로 설정하지 않아요. 소개를 한 번 설정하면 모든 서버에서 같은 내용이 보여요.

개인정보는 멤버가 직접 관리해요. 프로필을 비공개로 설정하면 본인만 열어볼 수 있고, 생일은 월만 보이게 하거나 완전히 숨길 수 있어요. 명령어 통계 수집과 환영 DM은 각각 거부할 수 있어요.

대명사는 조금 특별해요. 멤버가 봇에 대명사를 설정하지 않았다면, 봇이 PronounDB에서 대명사를 조회해요. 멤버는 직접 입력한 텍스트로 이 값을 덮어쓸 수 있고, 누구든 부적절한 덮어쓰기 내용을 봇 소유자에게 신고할 수 있어요.

## 이런 상황에 써 보세요

- 자기소개 채널 없이도 간단한 "소개 카드"를 갖고 싶을 때
- Switch 친구 코드를 고정 메시지를 찾아 헤맬 필요 없이 한곳에 모아 두고 싶을 때
- PronounDB에 등록된 대명사를 자동으로 보여 주고 싶을 때. 대부분의 멤버가 직접 입력할 필요가 없어요
- 스태프가 답변하기 전에 `pronouns @user`로 대명사를 확인하고 싶을 때
- 환영 DM이나 통계 수집을 원하지 않는 멤버가 직접 끌 수 있게 하고 싶을 때

## 프로필 임베드

`profile`을 입력하면 내 프로필이 보여요. `profile @user`를 입력하면 다른 멤버의 프로필을 보여 주는데, 해당 멤버가 비공개로 설정했다면 프로필이 비공개라는 안내가 나와요.

| 임베드의 항목 | 출처 |
| --- | --- |
| 제목 | "Profile for" + 사용자 이름 |
| 색상 | `setprofilecolor`, 없으면 봇 기본 색상 |
| 썸네일 | 멤버의 Discord 아바타 |
| 설명 | `setbio`로 설정한 소개(설정했을 때만 표시) |
| Pronouns | 직접 설정한 값, 없으면 PronounDB, 그것도 없으면 "Unspecified" |
| Zodiac Sign | `setzodiac`, 없으면 "Unspecified" |
| Birthday | `setbirthday`, 생일 공개 모드에 따라 표시되며, 없으면 "Unspecified" |
| Mutual Bot Servers | 나와 봇이 함께 있는 서버 수 |
| Switch Friend Code | 설정했을 때만 표시 |
| Image | `setprofileimage`의 URL |

## 프로필 항목

### 소개

`setbio <text>`는 최대 2048자까지 입력할 수 있어요. 더 길면 거부돼요. 소개를 지우는 명령어는 따로 없어요. 지우고 싶다면 점 하나처럼 짧은 소개로 바꾸세요.

### 별자리

`setzodiac <sign>`은 서양 별자리 12개 중 하나를 받아요. Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces 중에서 골라 입력하면 되고, 대소문자는 구분하지 않아요. 그 밖의 값은 거부돼요.

### 색상과 이미지

`setprofilecolor <colour>`는 봇의 색상 파서가 이해하는 모든 형식을 받아요. 예를 들어 16진수 값을 쓸 수 있어요. `setprofileimage <url>`에는 이미지 파일에 대한 직접 링크가 필요해요. 봇은 저장하기 전에 URL이 이미지처럼 보이는지 확인하고, 저장된 이미지를 다시 보여 줘요.

### 생일

`setbirthday <date>`는 날짜를 저장해요. 생일 모듈의 알림도 같은 값을 쓰기 때문에, 여기서 설정하면 생일 알림에도 반영돼요. 프로필에 어떻게 표시되는지는 `setbirthdayprivacy <mode>`로 정해요.

| 모드 | 프로필에 표시되는 내용 |
| --- | --- |
| `Default` | 전체 날짜 |
| `MonthOnly` | 월 이름만 |
| `YearOnly` | 연도만 |
| `MonthAndDate` | 월과 일만, 연도 제외 |
| `Disabled` | "Private" |

### Switch 친구 코드

`setswitchfc <code>`는 `SW-XXXX-XXXX-XXXX` 형식과 일치해야 해요. 각 그룹은 숫자 4자리이고, `SW`는 대소문자를 구분하지 않아요. 코드 없이 실행하면 프로필에서 친구 코드를 지워요. Nintendo Switch 모듈과는 관련이 없어요. 이 값은 프로필에 표시하는 용도일 뿐이에요.

### 개인정보

`setprivacy public` 또는 `setprivacy private`를 사용해요. 비공개 프로필은 본인만 볼 수 있어요. 기본값은 공개예요.

## 대명사

`pronouns [@user]`는 나 또는 다른 멤버의 대명사를 보여 줘요. 조회 순서는 다음과 같아요.

1. `setpronouns`로 직접 설정한 텍스트
2. 멤버가 Discord 계정을 PronounDB에 연결했다면 PronounDB의 영어 대명사 세트. 표준 세트는 `he/him`, `Any pronouns`, `Ask me my pronouns`처럼 일반적인 형식으로 표시돼요.
3. "Unspecified"

`setpronouns <text>`는 직접 설정한 값을 저장해요. 텍스트 없이 실행하면 현재 설정을 보여 주고, **덮어쓰기**와 **지우기** 버튼이 함께 나와요. **덮어쓰기**는 새 대명사를 입력하는 양식을 열고, **지우기**는 직접 설정한 값을 지워서 다시 PronounDB를 사용하게 해요.

표시된 대명사가 PronounDB가 아닌 멤버의 직접 설정 값이라면, 응답에 **신고** 버튼이 함께 나와요. 신고는 봇 소유자가 운영하는 채널로 전달되며, 소유자는 해당 값을 지우거나, 그 사용자의 대명사 기능을 끄거나, 차단 목록에 올릴 수 있어요. 대명사 기능이 꺼진 사용자는 대명사 명령어를 쓸 때마다 그 이유를 보게 돼요.

> [!NOTE]
> 봇 소유자 명령어 `pronounsforceclear`로 신고를 처리해요. 서버 스태프는 다른 멤버의 대명사를 지울 수 없어요.

## 수집 거부

- `greetdmoptout`은 DM 환영을 쓰는 서버가 나에게 DM을 보낼 수 있는지 설정해요. 이 봇이 보내는 환영에만 적용돼요.
- `userstatsoptout`은 내 계정의 명령어 통계 수집을 켜거나 꺼요. 메시지 내용은 어떤 경우에도 수집하지 않아요.
- `deleteuserstatsdata`는 확인 후 나에 대해 저장된 명령어 통계를 삭제해요. 한 시간에 한 번만 실행할 수 있어요.

## 설정

서버 쪽에서 따로 설정할 것은 없어요. 모든 설정은 멤버 개인에게 저장돼요. 대시보드의 **내 설정** 페이지(`/me`)에는 **프로필** 섹션과 **편집** 버튼이 있고, 개인정보 섹션에는 토글이 있어요.

| 설정 | 기본값 | 설명 |
| --- | --- | --- |
| 소개 | 비어 있음 | 프로필의 설명 |
| 대명사 | 비어 있음(PronounDB 사용) | 직접 설정한 대명사 |
| 별자리 | 없음 | 프로필에 표시되는 별자리 |
| 생일 | 없음 | 프로필에 표시되고 생일 알림에 쓰이는 날짜 |
| 시간대 | UTC | 생일 모듈이 내 알림에 사용하는 시간대 |
| Switch 친구 코드 | 비어 있음 | 프로필의 친구 코드 항목 |
| 프로필 색상 | 봇 기본값 | 임베드 색상 |
| 프로필 이미지 | 없음 | 임베드 맨 아래 이미지 |
| 프로필 공개 설정 | 공개 | 다른 사람이 내 프로필을 열 수 있는지 여부 |
| 생일 표시 모드 | 기본 | 생일의 어느 부분을 보여 줄지 |
| 환영 DM 차단 | 꺼짐 | `greetdmoptout`과 같아요 |
| 메시지 추적 차단 | 꺼짐 | `userstatsoptout`과 같아요 |
| 생일 알림 | 꺼짐 | 생일 모듈이 내 생일을 알릴지 여부 |

같은 페이지에는 내 계정에서 대명사 조회를 끄는 토글도 있어요.

## 설정 방법

1. `setbio Hi, I run the art channel.`을 실행해서 소개를 추가하세요.
2. `setpronouns she/her`를 실행하세요. PronounDB 계정이 이미 Discord와 연결되어 있다면 건너뛰어도 돼요.
3. `setbirthday 1998-04-12`를 실행한 뒤, 연도를 숨기고 싶다면 `setbirthdayprivacy MonthAndDate`를 실행하세요.
4. `setprofilecolor #ff66aa`와 `setprofileimage https://example.com/banner.png`로 임베드를 꾸며 보세요.
5. Switch에서 나를 찾을 수 있게 하고 싶다면 `setswitchfc SW-1234-5678-9012`를 추가하세요.
6. `profile`을 실행해서 결과를 확인하세요. 다른 사람에게 보이고 싶지 않다면 `setprivacy private`를 실행하세요.

## 명령어

이 명령어들은 서버의 접두사(바꾸지 않았다면 `.`)를 붙여서 실행해요. 대부분의 명령어에는 `/profile`, `/setbio`, `/setcolor`, `/setbirthday`, `/setbirthdayprivacy`, `/setswitchfriendcode`, `/setprofileimage`, `/setprivacy`, `/setzodiac`, `/pronouns`, `/setpronouns`, `/statsoptout`, `/deletestatsdata`처럼 슬래시 명령어 버전도 있어요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `profile [@user]` | `userprofile` | 없음 | 내 프로필 또는 다른 멤버의 프로필을 보여 줘요 |
| `setbio <text>` | | 없음 | 소개를 설정해요. 최대 2048자 |
| `setpronouns [text]` | `pronounsset` | 없음 | 직접 대명사를 설정하거나, 지우기와 덮어쓰기 버튼으로 확인해요 |
| `pronouns [@user]` | `getpronouns` | 없음 | 대명사를 보여 줘요. 직접 설정한 값에는 신고 버튼이 있어요 |
| `setzodiac <sign>` | | 없음 | 별자리를 설정해요 |
| `setprofilecolor <colour>` | | 없음 | 임베드 색상을 설정해요 |
| `setprofileimage <url>` | | 없음 | 프로필에 표시되는 이미지를 설정해요 |
| `setbirthday <date>` | | 없음 | 생일을 설정해요 |
| `setbirthdayprivacy <mode>` | | 없음 | `Default`, `MonthOnly`, `YearOnly`, `MonthAndDate`, `Disabled` 중 하나를 설정해요 |
| `setprivacy <Public|Private>` | `profilepricvacy` | 없음 | 프로필을 공개하거나 비공개로 설정해요 |
| `setswitchfc [code]` | `setfc`, `setswitchfriendcode`, `setfriendcode` | 없음 | Switch 친구 코드를 설정하거나 지워요 |
| `greetdmoptout` | `gdmoptout` | 없음 | 이 봇의 DM 환영 수신 여부를 토글해요 |
| `userstatsoptout` | `ustatsoptout` | 없음 | 명령어 통계 수집 여부를 토글해요 |
| `deleteuserstatsdata` | `deluserstatsdata` | 없음 | 저장된 명령어 통계를 삭제해요(한 시간에 한 번) |
| `pronounsforceclear <@user or id> <true|false> <reason>` | `pnfc` | 봇 소유자 | 멤버의 대명사를 지우고, 필요하면 기능을 끄도록 설정해요 |

## 팁과 주의 사항

- 프로필은 전역이에요. 한 서버에서 바꾸면 모든 서버에서 바뀌어요.
- `setbirthday`는 봇의 날짜 파서를 사용하므로 `1998-04-12`처럼 모호하지 않은 형식이 가장 안전해요.
- 프로필 이미지 URL이 작동하지 않게 되면, 임베드는 여전히 전송되지만 Discord에 이미지가 표시되지 않아요. 새 URL을 설정하면 해결돼요.
- PronounDB 조회는 멤버가 pronoundb.org에서 Discord 계정을 연결했을 때만 작동해요. 연결하지 않았다면 `setpronouns`를 실행하기 전까지 프로필에 "Unspecified"가 표시돼요.
- 비공개 프로필도 `profile @user`에 응답하지만, 프로필이 비공개라는 오류를 보여 줘요. 그래서 다른 사람이 프로필이 존재한다는 것은 알 수 있어요.
- `deleteuserstatsdata`는 명령어 통계만 삭제해요. 프로필 항목은 새 값으로 덮어써서 지워요.

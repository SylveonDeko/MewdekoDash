---
title: Patreon
slug: patreon
summary: Patreon 캠페인을 연결하고, 후원자에게 등급에 맞는 Discord 역할을 주고, 실시간 후원자 및 수익 수치가 담긴 월간 감사 메시지를 게시해요.
icon: fa-heart
category: Community
dashboard: /dashboard/patreon
module: Patreon
tags: [patreon, supporters, patrons, donations, premium, tier roles, role sync, announcement, oauth, 후원, 후원자, 기부, 프리미엄, 등급 역할, 역할 동기화, 공지, 연동]
related: [administration, utility]
---

## 기능 설명

Patreon 캠페인을 운영하는 서버 소유자는 크리에이터 계정으로 로그인해서 캠페인을 봇에 연결해요. 그 뒤로 봇이 캠페인의 등급과 후원자를 가져와 동기화하고, 각 후원자가 약정한 금액에 따라 Discord 역할을 지급할 수 있어요. Patreon이 후원자의 Discord 계정을 알고 있으면 연결은 자동으로 이루어지고, 그렇지 않으면 스태프가 직접 멤버를 Patreon 사용자와 연결할 수 있어요.

매월 원하는 날짜에 봇이 채널에 후원자에게 감사하는 공지를 게시할 수 있어요. 메시지는 일반 텍스트나 임베드로 작성할 수 있고, 활성 후원자 수, 월간 수익, 이번 달에 새로 참여한 사람 수 같은 실시간 수치를 넣을 수 있어요. 지난 일주일 동안 후원자가 된 사람을 칭찬하는 인사 명령어도 있어요.

대시보드에서 연결, 후원자 및 등급 보기, 등급과 역할 연결, 공지 설정 편집까지 전체 과정을 처리할 수 있어요. 명령어로도 같은 작업과 채팅용 통계, 순위를 할 수 있어요.

## 이런 상황에 사용해요

- 후원자에게 색이 있는 역할과 후원자 전용 채널 접근 권한을 주고 싶은데, 스태프가 Patreon을 일일이 확인하지 않아도 되게 하고 싶을 때
- 후원자가 등급을 올리거나, 내리거나, 후원을 중단하면 역할이 자동으로 바뀌었으면 할 때
- "후원자 40명께 감사드립니다" 같은 정기 게시물을 숫자를 직접 고치지 않아도 정확하게 올리고 싶을 때
- 스태프가 Discord 안에서 누가 어떤 등급으로 후원하는지 빠르게 확인하고 싶을 때

## 캠페인 연결하기

연결은 Patreon의 OAuth 인증 흐름을 사용해요. 대시보드의 **Patreon 연결하기** 카드나 봇 소유자만 쓸 수 있는 `patreonsync` 명령어를 실행하면 "Authorize with Patreon" 링크가 나와요. 캠페인을 소유한 계정으로 로그인하고 요청된 권한을 승인하면, Patreon이 대시보드의 Patreon 페이지로 되돌려 보내요. 봇은 코드를 토큰으로 교환하고, 찾은 첫 번째 캠페인을 저장한 뒤 바로 등급과 후원자 전체 동기화를 실행해요.

사용하는 계정에 캠페인이 있어야 해요. 캠페인이 없으면 콜백이 "No Patreon campaigns found for this user" 메시지와 함께 실패해요.

대시보드의 **개요** 탭에는 연결 상태가 **캠페인 ID**, **마지막 동기화**, **토큰 만료**와 함께 표시되고, 활성 **후원자**, 월간 **수익**, **캠페인 크리에이터** 요약 카드가 나와요. 토큰은 만료되면 자동으로 갱신돼요. 같은 탭의 **빠른 작업**에는 **전체 데이터 동기화**, **역할 동기화**, **공지 보내기**, **다시 로그인**이 있어요. **다시 로그인**은 캠페인 연결을 해제해요. 토큰은 지우지만 채널, 메시지, 연결 설정은 남겨 두어서 다시 연결할 수 있어요. 페이지 상단에도 **데이터 새로고침**과 **후원자 동기화** 버튼이 있어요.

> [!NOTE]
> Patreon 연동은 봇을 호스팅하는 쪽에서 활성화해야 해요. 봇에 Patreon 클라이언트 ID가 설정되어 있지 않으면, 연결 버튼과 `patreonsync`는 연동이 설정되지 않았다고 알려 줘요.

## 후원자와 동기화

동기화는 캠페인의 모든 멤버를 약정 금액, 상태와 함께 가져와요. 후원자가 Patreon에 Discord를 연결했다면 Discord 사용자 ID도 함께 가져와요. 활성 후원자는 Patreon이 활성 또는 현재 약정 중으로 표시한 사람이에요. **후원자** 탭에는 **이름**(Patreon이 제공하는 경우 이메일도), **후원 금액**, **참여일**, **상태**가 나열되고, 페이지 상단의 **후원자 동기화** 버튼으로 목록을 새로 고칠 수 있어요.

`patreonsupporters`는 활성 후원자를 최대 15명까지 약정 금액과 Discord 멘션과 함께 채팅에 보여 주고, `patreontop [count]`는 약정 금액 기준으로 1위부터 20위까지 순위를 매겨요. `patreonstats`는 후원자 수, 연결된 수, 총 수익과 평균 수익, 등급 수를 요약하고, `patreonanalytics`는 이전 후원자, 누적 수익, 이번 달 신규 후원자, 등급 분포를 추가로 보여 줘요.

후원자의 Discord 계정이 Patreon 쪽에 연결되어 있지 않다면, `patreonlink @member <patreonUserId>`로 직접 연결할 수 있어요. Patreon 사용자 ID는 후원자 Patreon 계정의 숫자 ID이고, 대시보드의 후원자 목록에는 표시되지 않아요.

## 등급과 역할 연결

각 Patreon 등급은 Discord 역할 하나와 연결할 수 있어요. **등급 연결** 탭에서 **Patreon 티어**와 **Discord 역할**을 고르고 저장하세요. **사용 가능한 티어** 목록에는 공개된 모든 등급과 가격, 연결 여부가 나와요. 채팅에서는 `patreontiermap <tierId> @role`로 같은 작업을 할 수 있고, 등급 ID는 `patreonroles`로 확인할 수 있어요.

역할 동기화는 `patreonrolesync` 또는 **역할 동기화 사용** 체크박스로 켜기 전까지 꺼져 있어요. 켜면 봇은 후원자가 어떤 역할을 받아야 하는지 계산해요. 약정 금액이 후원자의 금액 이하인 연결된 등급 중 가격이 가장 높은 등급이 기준이에요. 후원자가 가진 다른 연결된 Patreon 역할은 제거되고, 대상 역할이 추가돼요. 후원을 중단한 후원자는 연결된 역할을 모두 잃어요.

동기화는 멤버가 연결될 때와 `patreonsyncall` 또는 대시보드의 역할 동기화 작업을 실행할 때 이루어져요. Discord ID를 알고 있는 후원자만 동기화할 수 있어요.

> [!PERMISSION]
> 봇에 **역할 관리** 권한이 있어야 하고, 봇의 역할이 연결된 모든 역할보다 위에 있어야 해요. 봇보다 위에 있는 역할은 건너뛰어요.

## 월간 공지

`patreonch #channel` 또는 **공지 채널** 선택 상자로 채널을, `patreonday <1..28>` 또는 **공지 날짜 (1-28)**로 날짜를 정하세요. 날짜는 28일까지만 가능해서 2월이 건너뛰어지지 않아요. `patreontoggle`을 실행하거나 **공지 사용**을 체크하기 전까지 공지는 꺼져 있어요.

봇은 매시간 확인해요. 정해진 날짜에 이번 달에 아직 공지하지 않았다면 게시하고 시간을 기록해요. 그날 봇이 꺼져 있었더라도, 이번 달 해당 날짜가 이미 지났다면 시작할 때 따라잡아 게시해요. `patreonannounce`는 즉시 한 번 게시하며, 이 게시도 이번 달 공지로 계산돼요.

사용자 지정 메시지가 없으면 봇은 활성 후원자 수와 월간 수익을 포함한 기본 감사 메시지를 게시해요. `patreonmsg <text or embed code>` 또는 대시보드의 공지 메시지 편집기로 직접 설정할 수 있어요. 텍스트는 임베드 파서를 거쳐요. `-`를 입력하면 기본 메시지로 돌아가요.

### 자리 표시자

공지 메시지에서는 일반적인 서버 및 채널 자리 표시자와 함께 아래 값들을 사용할 수 있어요.

| 자리 표시자 | 값 |
| --- | --- |
| `%month%` | 현재 월 이름 |
| `%year%` | 현재 연도 |
| `%patreon.link%` | `https://patreon.com` |
| `%supporter.count%` | 활성 후원자 수 |
| `%supporter.total%` | 기록된 전체 후원자 수 |
| `%supporter.new%` | 이번 달 신규 후원자 수 |
| `%supporter.former%` | 이전 후원자 수 |
| `%supporter.linked%` | Discord 계정이 연결된 후원자 수 |
| `%revenue.monthly%` | 현재 월간 약정 금액 |
| `%revenue.average%` | 평균 약정 금액 |
| `%revenue.lifetime%` | 누적 수익 |
| `%growth.new%` | 이번 달 신규 후원자 수 |
| `%top.supporter.name%` | 가장 많이 약정한 후원자 |
| `%top.supporter.amount%` | 그 후원자의 약정 금액 |
| `%patron.name%` | 가장 많이 약정한 후원자, `%top.supporter.name%`과 같아요 |
| `%patron.tier%` | 그 후원자의 등급. Patreon이 보고하지 않았다면 "Unknown" |
| `%patron.amount%` | 그 후원자의 월간 약정 금액, `%top.supporter.amount%`과 같아요 |
| `%tiers.count%` | 등급 수 |
| `%tier.popular%` | 후원자가 가장 많은 등급 |
| `%tier.popular.count%` | 그 등급에 있는 후원자 수 |
| `%supporters.summary%` | 후원자 수에 대한 완성된 문장 |
| `%revenue.summary%` | 수익에 대한 완성된 문장 |
| `%growth.summary%` | 성장에 대한 완성된 문장 |

> [!EXAMPLE]
> `It's %month%! Thanks to %supporters.summary%%revenue.summary%!%growth.summary%`는 "It's December! Thanks to our 25 incredible supporters who help us raise $150/month! We gained 3 new supporters this month!"로 표시돼요.

## 신규 후원자 인사

`patreonrecognize [#channel]`은 지정한 채널이나 현재 채널에 지난 7일 안에 약정을 시작한 후원자를 위한 환영 임베드를 한 번에 최대 5명까지 게시해요. 예약 작업이 아니라 수동 명령어라서, 동기화 후에 실행하세요. 두 번 실행하면 같은 사람이 두 번 게시돼요.

## 설정

대시보드에는 **개요**, **후원자**, **등급 연결**, **설정** 네 개의 탭이 있어요.

| 설정 | 기본값 | 역할 |
| --- | --- | --- |
| 공지 채널 | 없음 | 월간 게시물을 올릴 위치. 없으면 공지가 비활성화돼요 |
| 공지 날짜 (1-28) | 없음 | 게시할 날짜. 설정하기 전에는 공지가 실행되지 않아요 |
| 공지 메시지 | 기본 제공 감사 메시지 | 위의 자리 표시자를 사용하는 사용자 지정 텍스트 또는 임베드 |
| 공지 사용 | 꺼짐 | 월간 게시물을 보낼지 여부 |
| 역할 동기화 사용 | 꺼짐 | 연결된 역할을 후원자에게 적용할지 여부 |
| 등급 연결 | 없음 | 각 등급이 지급하는 역할 |

## 설정 방법

1. 대시보드에서 **Patreon**을 열고 연결 버튼을 눌러요. 캠페인 소유자의 계정으로 로그인하고 접근 권한을 승인하세요.
2. 첫 동기화가 끝나면 **후원자** 탭에 후원자가 보이는지 확인하세요.
3. **등급 연결**에서 각 등급을 역할과 연결하세요. 역할을 먼저 만들고 봇의 역할을 그 위에 두세요.
4. **역할 동기화 사용**을 체크한 다음 `patreonsyncall`을 실행해서 이미 연결된 모든 사람에게 역할을 적용하세요.
5. **설정**에서 **공지 채널**과 **공지 날짜**를 고르고, 자리 표시자를 넣은 메시지를 작성한 뒤 **공지 사용**을 체크하세요.
6. `patreonannounce`를 한 번 실행해서 채널에 결과가 어떻게 나오는지 확인하세요.

## 명령어

아래 명령어는 서버의 접두사로 실행하세요(변경하지 않았다면 `.`).

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `patreonsync` | `ptsync` | 봇 소유자 | OAuth 승인 링크 게시 |
| `patreonch [#channel]` | `ptch` | 관리자 | 공지 채널 보기 또는 설정 |
| `patreondisable` | `ptdisable` | 관리자 | 채널을 지워 공지를 비활성화 |
| `patreonmsg [text]` | `ptmsg` | 관리자 | 공지 메시지 보기 또는 설정. `-`로 초기화 |
| `patreonday [day]` | `ptday` | 관리자 | 매월 날짜 보기 또는 설정 |
| `patreontoggle` | `pttoggle` | 관리자 | 공지 켜기 또는 끄기 |
| `patreonconfig` | `ptconfig` | 관리자 | 상태, 채널, 날짜, 메시지, 마지막 게시 보기 |
| `patreonannounce` | `ptannounce` | 관리자 | 지금 바로 공지 보내기 |
| `patreonhelp` | `pthelp` | 누구나 | 자리 표시자 목록과 명령어 개요 |
| `patreonsupporters` | `ptsupporters` | 관리자 | 활성 후원자 목록 |
| `patreontop [count]` | `pttop` | 누구나 | 약정 금액 기준 상위 후원자 |
| `patreonstats` | `ptstats` | 관리자 | 후원자 및 수익 요약 |
| `patreonanalytics` | `ptanalytics` | 관리자 | 상세 분석 |
| `patreonlink <user> <patreonUserId>` | `ptlink` | 관리자 | 멤버를 Patreon 사용자와 연결 |
| `patreonrolesync` | `ptrolesync` | 역할 관리 | 자동 역할 동기화 켜기 또는 끄기 |
| `patreontiermap <tierId> <role>` | `pttiermap` | 역할 관리 | 등급을 역할과 연결 |
| `patreonroles` | `ptroles` | 관리자 | 등급과 ID, 역할 목록 보기 |
| `patreonsyncall` | `ptsyncall` | 역할 관리 | 연결된 모든 후원자에게 역할 적용 |
| `patreonrecognize [#channel]` | `ptrecognize` | 관리자 | 지난 7일 동안의 후원자 인사 |

## 팁과 주의 사항

- Patreon 프로필에서 Discord를 연결했거나 `patreonlink`로 연결된 후원자만 역할을 받을 수 있어요.
- 역할 동기화는 후원자마다 역할 하나만 골라요. 약정 금액이 감당하는 가장 좋은 등급이에요. 여러 등급 역할을 쌓는 기능은 지원하지 않아요.
- 공지는 달력상 한 달에 최대 한 번 게시돼요. 3일에 `patreonannounce`를 실행하면 그 달 15일의 예약 게시는 건너뛰어요.
- 공지 날짜는 UTC 기준이에요.
- 월간 공지는 캠페인 전체에 관한 내용이라서 `%patron.name%`, `%patron.tier%`, `%patron.amount%`는 후원자를 한 명씩 가리키지 않고 활성 후원자 중 약정 금액이 가장 높은 사람을 가리켜요. 후원자별 인사가 필요하면 `patreonrecognize`를 사용하세요.
- 다른 Patreon 계정으로 다시 연결하면 캠페인은 바뀌지만 이전 연결 설정은 남아요. 이후에 **등급 연결** 탭을 꼭 확인하세요.

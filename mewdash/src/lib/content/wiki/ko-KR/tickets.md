---
title: 티켓
slug: tickets
summary: 버튼과 선택 메뉴가 있는 지원 티켓 패널로 비공개 채널을 열고, 담당하기, 우선순위, 태그, 케이스, 기록 및 스태프 도구를 제공해요.
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, modmail, 티켓, 지원, 헬프 데스크, 패널, 티켓 패널, 기록, 케이스, 담당, 우선순위, 블랙리스트, 모드메일]
related: [administration, chat-triggers, auditlog]
---

## What it does

티켓을 사용하면 채널을 헬프 데스크로 바꿀 수 있어요. 임베드와 하나 이상의 버튼 또는 선택 메뉴가 있는 메시지인 패널을 게시해요. 멤버가 버튼을 누르거나 옵션을 고르면 봇이 해당 멤버를 위한 비공개 텍스트 채널을 만들고, 멤버와 지원 역할만 볼 수 있도록 권한을 설정한 뒤 **"Claim"** 및 **"Close"** 버튼이 있는 시작 메시지를 게시해요.

멤버 입장에서는 버튼을 누르고, 필요하면 짧은 양식을 작성하면 `ticket-username-1`처럼 이름이 붙은 채널이 나타나요. 그 채널에 문제를 설명하면 돼요. 티켓이 닫히면 채널 이름이 `closed-...`로 바뀌고 잠기며, 티켓 유형을 어떻게 설정했는지에 따라 보관 카테고리로 옮겨지거나 일정 시간 뒤에 삭제돼요.

스태프 입장에서는 티켓을 담당해서 누가 처리하는지 모두가 알 수 있게 하고, 우선순위를 정하고, 태그를 추가하고, 메모를 남기고, 관련 티켓을 케이스로 묶고, 티켓을 닫을 수 있어요. 닫을 때마다 기록을 채널과 대시보드에 저장할 수 있어요. 대시보드에서는 응답 시간과 해결 시간, 우선순위별 티켓, 스태프별 현황도 볼 수 있어요.

각 버튼과 각 선택 옵션은 고유한 카테고리, 역할, 제한, 양식, 시작 메시지, 닫기 동작을 가진 자체 티켓 유형이에요.

## Why you would use it

- 지원 서버에서 공개 도움 채널 대신 비공개 1:1 채널을 원할 때
- 여러 팀(결제, 모더레이션, 파트너십)이 있고, 적절한 팀으로 연결해 주는 선택 메뉴가 필요할 때
- 일반 지원과 분리된 양식이 필요한 모더레이터 지원서를 받을 때
- 기록, 스태프 메모, 관련 신고를 묶는 케이스처럼 감사 추적이 필요할 때
- 특정 멤버가 티켓을 아예 열지 못하게 막고 싶을 때

## Panels, buttons and select menus

패널은 한 채널의 메시지 하나예요. 패널 ID는 해당 메시지의 ID예요. 패널에는 버튼, 선택 메뉴, 또는 둘 다를 넣을 수 있어요.

- **버튼**: 버튼마다 티켓 유형 하나가 연결돼요. 각 버튼에는 라벨, 선택 사항인 이모지, 스타일(Primary, Secondary, Success, Danger 중 하나)이 있어요.
- **선택 메뉴**: 메뉴 하나에 자리 표시자와 옵션 목록이 있어요. 각 옵션은 라벨, 설명, 이모지를 가진 티켓 유형이에요. 메뉴에는 옵션이 최소 하나 있어야 해요.

패널 메시지가 삭제되면 `checkpanels`가 누락된 패널을 보여 주고, `recreatepanel` 또는 `recreateallpanels`가 패널을 다시 게시하면서 저장된 메시지 ID를 갱신해요. 봇은 패널 메시지 삭제도 감시해요.

`ticketduplicatepanel`은 패널과 모든 구성 요소를 다른 채널에 복사하고, `ticketmovepanel`은 옮겨요. `ticketupdatepanel`은 임베드를 새 임베드 JSON으로 바꿔요.

### Ticket type settings

이 설정은 모든 버튼과 선택 옵션에 있어요. 대시보드에서는 버튼이나 옵션을 추가하거나 편집할 때 나타나요.

| 설정 항목 | 기본값 | 역할 |
| --- | --- | --- |
| Channel Name Format | `ticket-{username}-{id}` | 만들어지는 채널 이름이에요. `{id}`는 멤버의 티켓 번호이고, 최대 100자예요 |
| Ticket Category | 없음 | 채널을 만들 카테고리예요 |
| Archive Category | 없음 | 닫히거나 보관될 때 채널을 옮길 카테고리예요 |
| Support Roles | 없음 | 티켓을 보고, 대화하고, 담당할 수 있는 역할이에요 |
| Viewer Roles | 없음 | 읽기만 할 수 있고 메시지는 보낼 수 없는 역할이에요 |
| Max Active Tickets | 1 | 멤버가 이 유형으로 동시에 열 수 있는 티켓 수예요 |
| Auto Close (hours) | 없음 | 유형별로 저장되며 `buttoninfo`에 표시돼요 |
| Required Response Time (minutes) | 없음 | 유형별로 저장되며 `buttoninfo`에 표시돼요 |
| Allowed Priorities | 전체 | 스태프가 이 유형에 설정할 수 있는 우선순위예요 |
| Default Priority | 없음 | 새 티켓이 처음 가지는 우선순위예요 |
| Save Transcript | 꺼짐 | 티켓이 닫힐 때 기록을 생성해요 |
| Lock on Close | 켜짐 | 지원 역할을 제외한 모두의 메시지 보내기를 막아요 |
| Rename on Close | 켜짐 | 채널 이름 앞에 `closed-`를 붙여요 |
| Remove Creator | 켜짐 | 닫힐 때 티켓을 연 사람의 권한을 제거해요 |
| Delete on Close | 꺼짐 | 유지하는 대신 지연 시간 뒤에 채널을 삭제해요 |
| Delete Delay | 5분 | Delete on Close가 켜져 있을 때 삭제 전까지 기다리는 시간이에요. 대시보드 필드는 초 단위이고, `ticketclosebehavior`는 분 단위예요 |
| Auto Archive on Close | 꺼짐 | 티켓을 닫는 과정에서 함께 보관해요 |
| Lock on Archive | 켜짐 | 보관될 때 채널을 읽기 전용으로 만들어요 |
| Rename on Archive | 켜짐 | 채널 이름 앞에 `archived-`를 붙여요 |
| Remove Creator (archive) | 꺼짐 | 보관될 때 티켓을 연 사람의 권한을 제거해요 |
| Modal | 없음 | 티켓이 만들어지기 전에 보여 주는 양식이에요 |
| Open message | 기본 임베드 | 자리 표시자를 사용할 수 있는 사용자 지정 시작 메시지예요 |

### Forms (modals)

티켓 유형은 채널을 만들기 전에 질문을 할 수 있어요. `setmodaltitle`로 제목을 정하고(기본값은 "Create Ticket"), `addmodalfield`로 필드를 추가해요. 필드는 기본적으로 짧은 입력이며 필수예요. 라벨 뒤의 옵션으로 이를 바꿀 수 있어요. `paragraph`는 여러 줄 입력, `optional`은 선택 입력, `min:X`와 `max:X`는 최대 4000까지의 길이 제한이에요. 필드 ID는 라벨을 소문자로 바꾸고 공백을 밑줄로 바꾼 값이에요.

답변은 티켓과 함께 저장되며, 시작 메시지에서 `%modal.<fieldId>%`로 사용할 수 있어요.

### The opening message

기본적으로 봇은 멤버를 환영하고, 티켓 ID와 생성 시간을 보여 주고, 문제를 설명해 달라고 요청하는 "Support Ticket" 제목의 임베드를 게시해요. 여기에는 "Claim" 및 "Close" 버튼이 붙어요.

티켓 유형마다 직접 쓴 텍스트나 임베드로 바꿀 수 있어요. 대시보드의 임베드 빌더에서 **티켓 열기 메시지 설정**을 사용하세요. 여기에서 사용할 수 있는 자리 표시자는 다음과 같아요.

| 자리 표시자 | 값 |
| --- | --- |
| `%ticket.id%` | 티켓 번호 |
| `%ticket.channel%` | 티켓 채널 멘션 |
| `%ticket.user%` | 티켓을 연 사람의 사용자 이름 |
| `%ticket.user.mention%` | 티켓을 연 사람의 멘션 |
| `%ticket.user.avatar%` | 티켓을 연 사람의 아바타 URL |
| `%ticket.user.id%` | 티켓을 연 사람의 사용자 ID |
| `%ticket.created%` | 티켓이 만들어진 시간 |
| `%modal.<fieldId>%` | 양식 필드의 답변 |

일반 자리 표시자 세트는 이 메시지에 적용되지 않아요. 위에 나온 자리 표시자만 적용돼요.

## What happens when a ticket opens

1. 블랙리스트에 등록된 멤버는 임시 메시지로 거부돼요.
2. 멤버가 이 유형으로 연 티켓 수를 **최대 활성 티켓 수**(기본값 1)에 대해 확인해요.
3. 티켓 카테고리에 채널을 만들어요. `@everyone`은 거부되고, 티켓을 연 사람은 보기, 메시지 보내기, 메시지 기록 보기, 파일 첨부, 링크 첨부가 허용돼요. 지원 역할은 같은 권한에 메시지 관리가 더해지고, 보기 가능 역할은 읽기만 허용돼요.
4. "Claim" 및 "Close" 버튼과 함께 시작 메시지를 게시해요.
5. 로그 채널이 설정되어 있으면 "new ticket" 항목을 게시해요.
6. **티켓이 열릴 때** 이벤트를 채팅 트리거에 게시해요.

## Claiming, notes, priorities and tags

**"Claim"**: 지원 역할 멤버나 관리자가 버튼 또는 `ticketclaim`으로 티켓을 담당해요. 채널에 "claimed by" 임베드가 게시돼요. 담당 해제는 담당자나 관리자만 할 수 있어요. 닫힌 티켓이나 이미 담당된 티켓은 담당할 수 없어요.

**메모**: `ticketnote`로 현재 티켓에 스태프 메모를 추가해요. 메모는 티켓과 함께 저장되고, 대시보드에 표시되며, 티켓 채널에 작성자가 바닥글에 표시된 파란색 "note added" 임베드로 게시돼요.

**우선순위**는 `ticketaddpriority`로 만들거나 **설정** 탭에서 만드는 서버 전체 정의예요. 각 우선순위에는 ID, 표시 이름, 이모지, 1부터 5까지의 단계, 색상, 응답 시간, **스태프에게 알림** 설정이 있어요. 티켓에 우선순위를 설정하면 해당 색상의 임베드가 게시되고, 이 설정이 켜져 있으면 지원 역할을 멘션해요. 티켓 유형별로 사용할 수 있는 우선순위를 제한할 수도 있어요.

**태그**는 ID, 이름, 설명, 색상을 가진 서버 전체 라벨이에요. `ticketaddtags`와 `ticketremovetags`로 태그 ID를 사용해 티켓에 추가하거나 제거해요. 대시보드는 각 티켓에 태그를 표시하고 태그로 검색할 수 있게 해요.

## Closing, archiving and transcripts

티켓을 닫으면 상태가 닫힘으로 바뀌고 빨간색 "ticket closed" 임베드가 게시돼요. 그다음 순서대로 실행돼요.

1. 해당 유형의 **기록 저장**가 켜져 있고 기록 채널이 설정되어 있으면, 최근 메시지 5000개를 저장하고 기록 채널에 **View Transcript** 링크가 있는 임베드를 게시해요. 링크는 대시보드에서 기록을 열어요.
2. 해당 유형에 자동 보관이 켜져 있거나 `ticketclose true`로 닫았다면 티켓을 보관해요(아래 참고).
3. 그렇지 않으면 닫기 동작을 실행해요. `closed-...`로 이름을 바꾸고, 티켓을 연 사람을 제거하고, 지원 역할은 유지한 채 채널을 잠근 뒤, 보관 카테고리로 옮기거나, **닫을 때 삭제**가 켜져 있으면 채널에 경고를 남기고 삭제 지연 시간 뒤의 삭제를 예약해요. 예약된 삭제는 1분마다 처리돼요.

보관하면 채널 이름이 `archived-...`로 바뀌고, 보관 카테고리로 옮겨지고, 모든 사람에게 읽기 전용이 되며, 티켓 상태가 보관됨으로 바뀌어요. `ticketarchive`는 열린 티켓에서 바로 보관해요. 채널이 이미 없으면 티켓은 보관됨으로만 표시돼요.

티켓을 닫으면 **티켓이 닫힐 때** 이벤트가 채팅 트리거에 게시돼요.

> [!NOTE]
> 기록은 유형에 **기록 저장**가 켜져 있고 서버에 기록 채널이 있을 때만 생성돼요. 기록 채널이 없으면 닫기는 성공하지만 아무것도 저장되지 않아요.

## Cases

케이스는 함께 속한 티켓을 묶어요. 예를 들어 같은 사람에 대한 여러 신고가 있을 때 사용해요. `ticketcreatecase <title> <description>`으로 만들거나 **케이스** 탭에서 만든 뒤, `ticketlinkcase <caseId>`로 현재 티켓을 연결하고 `ticketunlinkcase`로 연결을 해제해요. 케이스에는 자체 메모가 있고, 닫거나 다시 열 수 있으며, 대시보드나 `/tickets cases` 슬래시 명령어로 편집할 수 있어요.

## Blacklist

`ticketblock @user [reason]`은 멤버가 티켓을 열지 못하게 막아요. 로그 채널이 설정되어 있으면 사유가 기록돼요. `ticketunblock`으로 해제해요. 대시보드의 **고급** 탭에도 같은 **블랙리스트 관리** 섹션이 있으며, 사용자 ID를 입력해요.

## Bulk tools

- `ticketcloseinactive <hours>`는 지정한 시간 동안 활동이 없는 열린 티켓을 모두 닫아요. 각 티켓에 "auto closed" 임베드를 게시하고, 유형에 보관 카테고리가 있으면 보관해요. **고급** 탭의 **비활성 티켓 닫기**도 같은 작업을 해요.
- `ticketmoveall <source category> <target category>`는 카테고리 사이의 모든 티켓 채널을 옮겨요.

## Statistics

`ticketstats`는 전체 수, 열린 티켓과 닫힌 티켓 수, 평균 응답 시간(분), 평균 해결 시간(시간), 유형별 및 우선순위별 분류를 보여 줘요. `ticketuserstats [@user]`는 한 멤버의 같은 통계와 최근 티켓을 보여 줘요. **개요** 탭은 응답 시간, 우선순위별 티켓, 스태프 성과를 보여 줘요.

## Settings

티켓 페이지에는 **개요**, **티켓**, **티켓 패널**, **설정**, **케이스**, **고급** 탭이 있어요.

| 설정 항목 | 기본값 | 역할 |
| --- | --- | --- |
| Transcript Channel | 없음 | 링크가 포함된 기록 요약을 게시하는 곳이에요 (설정) |
| Log Channel | 없음 | 티켓 생성과 블랙리스트 항목을 기록하는 곳이에요 (설정) |
| Priorities | 없음 | 서버 전체 우선순위 정의예요 (설정) |
| Tags | 없음 | 서버 전체 태그 정의예요 (설정) |
| Panel Embed | 제목 "Support Tickets" | 임베드 편집기에서 만드는 패널 메시지예요 (티켓 패널) |
| Per-type settings | 위 표 참고 | 각 버튼이나 선택 옵션에서 설정해요 (티켓 패널) |
| Blacklist | 비어 있음 | 티켓을 열 수 없는 멤버예요 (고급) |

**티켓** 탭에는 열린 티켓과 닫힌 티켓이 나열되며, 티켓, 사용자, 채널 또는 태그로 검색할 수 있어요. 여기에서 스태프는 담당, 담당 해제, 우선순위 설정, 태그 추가 또는 제거, 스태프 메모 추가, 선택 사항인 사유와 함께 닫기, 보관, 기록 열기를 할 수 있어요.

> [!PERMISSION]
> 봇에는 티켓 채널을 만들고 누가 볼 수 있는지 설정하기 위해 채널 관리와 역할 관리 권한이 필요해요. 봇의 역할은 티켓 카테고리와 보관 카테고리를 볼 수 있어야 해요.

## Setup walkthrough

1. 열린 티켓용 카테고리와, 선택적으로 닫힌 티켓용 카테고리를 만드세요. 스태프만 볼 수 있는 기록 채널과 로그 채널도 만드세요.
2. 대시보드에서 **티켓**를 열고 **설정**으로 이동한 뒤 **기록 채널**과 **Log Channel**을 설정하세요.
3. 같은 **설정** 탭에서 우선순위를 최소 하나 만드세요(예: `urgent`, 단계 5, Notify staff 켜짐). 필요한 태그도 만드세요.
4. **티켓 패널**로 가서 **새 패널 만들기**을 누르세요. 채널을 고르고 **패널 임베드**를 설계하세요.
5. 패널을 선택하고 **새 버튼**을 추가하세요. 라벨, 스타일, **티켓 카테고리**, **보관 카테고리**, **지원 역할**를 설정하고 **기록 저장**를 켜세요. 닫힌 채널을 보관 카테고리에 둘지, 지연 시간을 두고 **닫을 때 삭제**를 사용할지 정하세요.
6. 선택 사항으로 모달 빌더를 열어 양식 필드를 추가하고, 시작 메시지 편집기를 열어 환영 메시지를 바꾸세요.
7. 한 드롭다운에 여러 티켓 유형을 넣으려면 **새 선택 메뉴**를 추가하고, 유형마다 같은 설정으로 옵션을 추가하세요.
8. 다른 계정에서 테스트 티켓을 열고, 담당하고, 우선순위를 설정하고, 닫은 뒤 기록 채널을 확인하세요.

Discord에서는 `/tickets setup wizard #channel`로 템플릿(Basic Support, Department Support, Gaming Server, Business, Mod Applications)을 사용해 같은 단계를 진행할 수 있어요.

## Commands

서버의 접두사로 명령어를 실행하세요(변경하지 않았다면 `.`). 패널 ID는 메시지 ID이고, 버튼, 메뉴, 옵션 ID는 `panelinfo` 또는 `ticketlistpanel`에서 확인할 수 있어요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `ticketpanel <#channel> [embedJson]` | `tpanel` | 관리자 | 미리보기 또는 생성 안내와 함께 패널을 만들어요 |
| `ticketpaneldelete <panelId> [force]` | `tpaneldelete` | 관리자 | 패널을 삭제해요. `true`를 쓰면 티켓이 연결되어 있어도 강제로 삭제해요 |
| `ticketupdatepanel <panelId> <embedJson>` | `tupdatepanel` | 관리자 | 패널 임베드를 바꿔요 |
| `ticketmovepanel <panelId> <#channel>` | `tmovepanel` | 관리자 | 패널을 다른 채널로 옮겨요 |
| `ticketduplicatepanel <panelId> <#channel>` | `tduplicatepanel` | 관리자 | 패널과 구성 요소를 복사해요 |
| `panellist` | `plist` | 관리자 | 구성 요소 수와 함께 패널을 나열해요 |
| `panelinfo <panelId>` | `pinfo` | 관리자 | 패널의 버튼과 메뉴를 ID와 함께 보여 줘요 |
| `ticketlistpanels` | `tlistpanels` | 채널 관리 | 모든 패널을 페이지 단위로 자세히 나열해요 |
| `ticketlistpanel <panelId>` | `tlistpanel` | 채널 관리 | 한 패널의 모든 구성 요소와 설정을 보여 줘요 |
| `checkpanels` | `tcheckpanels` | 관리자 | 메시지나 채널이 없는 패널을 알려 줘요 |
| `recreatepanel <panelId>` | `trecreate` | 관리자 | 없어진 패널을 다시 게시해요 |
| `recreateallpanels` | `trecreateall` | 관리자 | 없어진 모든 패널을 다시 게시해요 |
| `setpaneltranscripts <panelId> <true or false>` | `sptranscripts` | 관리자 | 패널의 모든 버튼에 대해 기록을 켜거나 꺼요 |
| `ticketaddbutton <panelId> <label> [style] [emoji]` | `taddbtn` | 관리자 | 버튼을 추가해요 |
| `buttoninfo <buttonId>` | `binfo` | 관리자 | 버튼의 설정을 보여 줘요 |
| `deletebutton <buttonId>` | `delbtn` | 관리자 | 버튼을 제거해요 |
| `ticketcategory <buttonId> [category]` | `tcat` | 관리자 | 티켓 카테고리를 설정하거나 지워요 |
| `ticketarchivecategory <buttonId> [category]` | `tarchivecat` | 관리자 | 보관 카테고리를 설정하거나 지워요 |
| `ticketautoarchive <buttonId> [true or false]` | `tautoarchive` | 관리자 | 닫을 때 자동으로 보관해요 |
| `ticketclosebehavior <buttonId> [autoArchive] [deleteOnClose] [lockOnClose] [renameOnClose] [deleteDelayMinutes]` | `tclosebehavior` | 관리자 | 여러 닫기 동작을 한 번에 설정해요 |
| `ticketautoclose <buttonId> [hours]` | `tautoclose` | 관리자 | 자동 닫기 시간을 설정하거나 지워요 |
| `setautoclose <buttonId> <hours>` | `sautoclose` | 관리자 | 위와 같아요 |
| `ticketresponsetime <buttonId> [minutes]` | `tresponsetime` | 관리자 | 필수 응답 시간을 설정하거나 지워요 |
| `setresponsetime <buttonId> <minutes>` | `sresponsetime` | 관리자 | 위와 같아요 |
| `setmodaltitle <buttonId> <title>` | `smodaltitle` | 관리자 | 티켓 양식의 제목이에요 |
| `addmodalfield <buttonId> <label> [options]` | `addmfield` | 관리자 | 양식 필드를 추가해요. 옵션 예시: `paragraph,optional,max:500` |
| `removemodalfield <buttonId> <fieldId>` | `removemfield` | 관리자 | 양식 필드를 제거해요 |
| `listmodalfields <buttonId>` | `listmfields` | 관리자 | 양식 필드를 나열해요 |
| `addselectmenu <panelId>` | `addsmenu` | 관리자 | 안내 프롬프트로 선택 메뉴를 추가해요 |
| `addoption <menuId> <label> [description] [emoji]` | `addopt` | 관리자 | 메뉴에 옵션을 추가해요 |
| `listoptions <menuId>` | `listopts` | 관리자 | 메뉴의 옵션을 나열해요 |
| `removeoption <menuId> <value>` | `removeopt` | 관리자 | 값으로 옵션을 확인해요(주의 사항 참고) |
| `deleteselectoption <optionId>` | `delselectoption` | 관리자 | 옵션을 제거해요. 마지막 옵션은 제거할 수 없어요 |
| `setplaceholder <menuId> <text>` | `splaceholder` | 관리자 | 메뉴의 자리 표시자를 바꿔요 |
| `deleteselectmenu <menuId>` | `delselectmenu` | 관리자 | 메뉴와 옵션을 제거해요 |
| `ticketclaim` | `tclaim` | 없음 | 현재 티켓을 담당해요(지원 역할 또는 관리자) |
| `ticketunclaim` | `tunclaim` | 없음 | 담당을 해제해요(담당자 또는 관리자) |
| `ticketclose [archive]` | `tclose` | 없음 | 현재 티켓을 닫아요. `true`를 쓰면 보관도 해요 |
| `ticketarchive` | `tarchive` | 채널 관리 | 현재 티켓을 보관해요 |
| `ticketnote <text>` | `tnote` | 없음 | 스태프 메모를 추가해요 |
| `ticketpriority <priorityId>` | `tpriority` | 없음 | 현재 티켓의 우선순위를 설정해요 |
| `ticketaddtags <tagId...>` | `taddtags` | 없음 | 현재 티켓에 태그를 추가해요 |
| `ticketremovetags <tagId...>` | `tremovetags` | 없음 | 현재 티켓에서 태그를 제거해요 |
| `ticketaddpriority <id> <name> <emoji> <level> <pingStaff> <responseTime> <color>` | `taddpriority` | 관리자 | 우선순위를 정의해요. 예: `taddpriority urgent Urgent :fire: 5 true 00:15:00 red` |
| `ticketremovepriority <id>` | `tremovepriority` | 관리자 | 우선순위 정의를 삭제해요 |
| `ticketaddtag <id> <name> <description> <color>` | `taddtag` | 관리자 | 태그를 정의해요 |
| `ticketremovetag <id>` | `tremovetag` | 관리자 | 태그 정의를 삭제해요 |
| `ticketcreatecase <title> <description>` | `tcreatecase` | 메시지 관리 | 케이스를 만들어요 |
| `ticketlinkcase <caseId>` | `tlinkcase` | 메시지 관리 | 현재 티켓을 케이스에 연결해요 |
| `ticketunlinkcase` | `tunlinkcase` | 메시지 관리 | 현재 티켓의 케이스 연결을 해제해요 |
| `ticketblock @user [reason]` | `tblock` | 관리자 | 멤버를 블랙리스트에 추가해요 |
| `ticketunblock @user` | `tunblock` | 관리자 | 블랙리스트에서 제거해요 |
| `tickettranscriptchannel [#channel]` | `ttranscriptch` | 관리자 | 기록 채널을 설정하거나 지워요 |
| `ticketlogchannel [#channel]` | `tlogch` | 관리자 | 로그 채널을 설정하거나 지워요 |
| `ticketcloseinactive <hours>` | `tcloseinactive` | 관리자 | 지정한 시간 동안 유휴 상태인 티켓을 닫아요 |
| `ticketmoveall <category> <category>` | `tmoveall` | 관리자 | 카테고리 사이의 모든 티켓을 옮겨요 |
| `ticketstats` | `tstats` | 없음 | 서버 티켓 통계를 보여 줘요 |
| `ticketuserstats [@user]` | `tuserstats` | 없음 | 멤버의 티켓 통계를 보여 줘요 |

슬래시 명령어는 `/tickets` 아래에 있어요(패널 생성, 패널 목록, 담당, 닫기, 메모, 보관, 우선순위, 패널 및 설정 그룹, 케이스 그룹). `/tickets setup` 아래에도 있어요(마법사, quick-button, quick-menu, from-template, templates).

## Tips and gotchas

- "현재 티켓"에 적용되는 명령어는 티켓 채널 안에서만 작동해요. 스태프 채널이 아니라 티켓 안에서 실행하세요.
- 모든 티켓 유형에는 지원 역할이 필요해요. 그렇지 않으면 관리자만 담당할 수 있고, 채널이 잠긴 뒤에는 티켓을 연 사람만 대화할 수 있어요.
- 기본 제한은 멤버당 유형별 열린 티켓 하나예요. 같은 유형의 반복 티켓이 흔하다면 **최대 활성 티켓 수**를 올리세요.
- **자동 닫기 (시간)**와 **Required Response Time**은 유형에 저장되고 `buttoninfo`에 표시되지만, 봇이 유휴 티켓을 닫는 방법은 `ticketcloseinactive`나 **비활성 티켓 닫기** 일괄 작업뿐이에요. 자동 정리를 원하면 직접 일정에 맞춰 실행하세요.
- `removeoption`은 현재 성공 메시지만 보여 줘요. 옵션을 실제로 제거하려면 옵션 ID와 함께 `deleteselectoption`을 사용하세요.
- **닫을 때 삭제**와 **닫을 때 잠금**는 서로 영향을 줘요. 삭제로 설정된 티켓은 먼저 잠기지 않고, 삭제 지연 시간이 지나기를 기다려요.
- 패널 임베드 JSON은 유효한 임베드 빌더 출력이어야 해요. 명령어 대신 대시보드 편집기를 사용해 JSON을 복사하는 편이 좋아요.
- 열린 티켓이 있는 패널은 `true`를 전달하지 않으면 삭제되지 않아요. 전달하면 티켓과 패널의 연결이 해제돼요.
- 기록은 최대 5000개의 메시지까지만 저장돼요. "View Transcript" 링크는 대시보드에서 기록을 열어요.

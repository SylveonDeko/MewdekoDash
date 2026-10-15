---
title: 유틸리티
slug: utility
summary: 명령어 별칭, 명언, 리마인더부터 자동 게시, 스트림 역할, AI 어시스턴트, 메시지 집계, 반복 메시지까지 일상적으로 쓰는 도구 모음이에요.
icon: fa-wrench
category: Actions
dashboard: /dashboard/utility
module: Utility
tags: [alias, quotes, auto publish, stream role, ai, chatbot, nsfw filter, role monitor, reminder, snipe, repeater, sticky, message count, invites, embed, calculator, userinfo, serverinfo, 별칭, 명언, 자동 게시, 스트림 역할, AI, 챗봇, NSFW 필터, 역할 모니터, 리마인더, 스나이프, 반복, 고정, 메시지 수, 초대, 임베드, 계산기, 사용자 정보, 서버 정보]
related: [repeaters, polls, invites, messagestats, embedbuilder, xp, administration, moderation]
---

## 기능 소개

유틸리티는 대부분의 서버가 필요로 하는 작은 기능들을 모아 둔 모듈이에요. 멤버는 리마인더, 명언, 주사위 굴리기, 계산기, 단위 변환, 사용자·역할·채널·서버 정보 명령어를 사용할 수 있어요. 스태프는 명령어 별칭, 반복 메시지, 공지 채널 자동 게시, 멤버가 방송하는 동안만 부여되는 역할, 삭제된 메시지 스나이프, 메시지 집계, 초대 추적을 설정할 수 있어요.

대시보드의 **유틸리티** 페이지에는 양식으로 설정하는 편이 나은 기능이 모여 있어요. 별칭, 명언, 자동 게시, 스트림 역할, AI 어시스턴트, NSFW 태그 필터, 역할 모니터가 여기에 있어요. 나머지 기능은 명령어로만 사용할 수 있어요.

모듈 범위가 넓기 때문에 아래의 각 하위 기능을 따로 설명해요. 문서 끝의 명령어 표에는 이 모듈의 모든 명령어가 나와 있어요.

## 사용하면 좋은 이유

- 별칭으로 `play youtube`를 `yt`로 줄여서 서버 전체에서 사용할 수 있어요.
- 멤버가 명언을 추가하고 무작위 문구를 꺼내 볼 수 있는 공용 명언집을 만들 수 있어요.
- 공지 채널에 올라오는 모든 게시물을 팔로워에게 자동으로 게시할 수 있어요.
- 멤버가 특정 게임을 방송하는 동안에만 "Live" 역할을 줄 수 있어요.
- 규칙이나 고정 공지를 몇 분마다 게시하거나, 채널이 활발할 때만 게시할 수 있어요.
- 멤버가 자신이나 채널을 위한 리마인더를 설정할 수 있어요.
- 직접 가진 API 키로 한 채널에서 AI 어시스턴트를 운영할 수 있어요.

## 별칭

별칭은 봇이 명령어를 실행하기 전에 다른 명령어로 바꿔 주는 트리거 단어예요. `alias yt play youtube`를 설정하면 `.yt lofi`는 `.play youtube lofi`로 실행돼요. 트리거는 메시지의 첫 단어여야 하며, 그 뒤에 오는 내용은 연결된 명령어 뒤에 붙어요. 긴 트리거가 먼저 매칭돼요. `alias <trigger>`를 매핑 없이 실행하면 해당 별칭이 제거되고, `aliasesclear`는 모든 별칭을 제거해요.

대시보드의 **별칭** 탭에는 **별칭 트리거**와 **별칭 매핑** 입력란, 검색 상자, 삭제할 수 있는 목록이 있어요. 

## 명언

명언은 키워드에 묶어 저장하는 짧은 글이에요. `quoteadd <keyword> <text>`로 명언을 저장하고, `quoteprint <keyword>`(또는 `..`)로 해당 키워드의 무작위 명언을 보고, `quoteshow <id>`로 특정 명언을 볼 수 있어요. `quotesearch`는 키워드와 텍스트로 검색하고, `quoteid`는 명언을 추가한 사람을 보여 주며, `listquotes`는 키워드 또는 추가 날짜순으로 명언을 넘겨 볼 수 있게 해요. 누구나 명언을 추가할 수 있어요. 명언은 추가한 멤버나 관리자가 삭제할 수 있어요. 키워드 아래의 명언을 모두 삭제하거나, JSON으로 내보내거나, JSON 첨부 파일에서 가져오려면 관리자 권한이 필요해요.

**명언** 탭에서 명언을 추가, 편집, 검색, 삭제할 수 있어요.

## 자동 게시

Discord 공지 채널에서는 각 메시지를 직접 게시해야 해요. `addautopublish #channel`을 실행하면 봇이 해당 채널의 새 메시지를 모두 자동으로 게시해요. 채널마다 메시지를 건너뛰는 차단 목록이 두 개 있어요. `addpublishblacklist @user #channel`은 사용자를 무시하고, `addpublishblacklist #channel word`는 해당 단어가 포함된 메시지를 무시해요(대소문자 구분 없음). `getautopublishes`는 모든 채널과 차단 목록을 보여 줘요.

**자동 게시** 탭에서 채널을 추가하고 **이 사용자들의 메시지 건너뛰기**와 **이 단어가 포함된 메시지 건너뛰기** 목록을 관리할 수 있어요.

## 스트림 역할

`streamrole <fromRole> <addRole>`을 실행하면 **fromRole**에 속한 멤버가 방송을 시작할 때 **addRole**이 부여되고, 방송을 마치면 역할이 회수돼요. `streamrolekeyword <keyword>`는 방송 제목에 키워드가 포함된 방송에만 적용하도록 제한하고, 키워드 없이 실행하면 제한을 해제해요. 화이트리스트에 있는 멤버는 키워드가 맞지 않아도 방송 중에 역할을 받고, 블랙리스트에 있는 멤버는 역할을 절대 받지 않아요. 인수 없이 `streamrole`을 실행하면 기능이 꺼져요. 봇이 역할을 관리할 권한을 잃거나 역할이 삭제되면 기능이 스스로 꺼져요.

**스트림 역할** 탭에는 **대상 역할**, **스트리밍 중 역할**, **방송 제목 키워드**가 있고, 사용자 ID로 관리하는 **화이트리스트**와 **블랙리스트** 목록이 있어요.

## AI 어시스턴트

어시스턴트는 선택한 한 채널의 모든 메시지에 답변하며, 멤버마다 최근 다섯 번의 대화를 문맥으로 기억해요. 해당 채널에서 `deletesession`을 입력하면 본인의 대화 기록이 지워져요.

| 설정 | 명령어 | 기능 |
| --- | --- | --- |
| 채널 | `aichannel [#channel] [enabled]` | 어시스턴트가 응답하는 단 하나의 채널 |
| 제공자와 모델 | `aimodel <OpenAi\|Groq\|Claude> [model]` | 호출할 API와 모델 |
| API 키 | `aikey` | 해당 제공자의 개인 키예요. 봇에 저장되며 다시 표시되지 않아요 |
| 시스템 프롬프트 | `aiprompt <text>` | 모델이 따를 지침 |
| 웹 검색 | `aiwebsearch <true\|false>` | 모델이 웹을 검색하도록 허용해요(Claude만 해당) |
| 웹후크 | `aiwebhook [name] [avatarUrl]` | 사용자 지정 이름과 아바타를 사용하는 웹후크로 답변을 게시해요 |
| 사용자 지정 임베드 | `aicustomembed [template]` | 답변을 임베드로 감싸요. `%airesponse%`는 답변이 들어갈 위치를 표시해요 |

`aiconfig`는 현재 설정을 보여 줘요. **AI 어시스턴트** 탭에는 **어시스턴트 켜기**, **채널**, **제공자**, **모델**, **API 키**, **시스템 프롬프트**, **웹 검색 허용**, **"웹 검색 중" 알림 숨기기**가 있어요.

> [!WARNING]
> 어시스턴트는 설정한 API 키를 사용하며 비용도 그 키의 주인에게 청구돼요. 키가 설정되지 않으면 채널의 메시지에 오류 답변이 와요.

## NSFW 필터

**NSFW 필터** 탭에는 NSFW 모듈의 이미지 검색에서 차단되는 태그 목록이 있어요. **차단할 태그**에 태그를 입력해 추가하거나, 목록의 태그를 클릭해 제거할 수 있어요. 해당하는 명령어는 NSFW 모듈의 `nsfwtagbl [tag]`이며, 태그 없이 실행하면 현재 차단 목록을 보여 줘요.

## 역할 모니터

**역할 모니터** 탭은 서버 관리 모듈의 역할 모니터를 설정해요. 역할 모니터는 보호 대상으로 지정한 역할이나 권한이 부여될 때 반응해요. **기본 제재**(변경만 되돌리기, 경고, 모든 역할 제거, 음소거, 타임아웃, 추방, 차단 중 선택)를 고르고, 보호할 역할과 권한을 추가하고, 예외로 둘 **신뢰하는 역할**과 **신뢰하는 멤버**를 등록할 수 있어요. 명령어(`addblacklistedrole`, `addblacklistedpermission`, `whitelistuser`, `whitelistrole`, `setdefaultpunishment`, `listblacklists`)는 서버 소유자만 사용할 수 있으며 서버 관리 모듈에 있어요.

## 리마인더

`remind me <time> <message>`는 나중에 DM으로 알려 주고, `remind here <time> <message>`는 현재 채널에 게시하며, `remind #channel <time> <message>`는 다른 채널을 지정하고 **메시지 관리** 권한이 필요해요. 시간은 `2h30m`, `3 days`, `1w`, `in 45 minutes`처럼 쓰며 최대 60일 뒤까지 설정할 수 있어요. `remindlist`는 번호와 함께 리마인더 목록을 보여 주고, `reminddelete <index>`는 리마인더 하나를 삭제해요. 메시지 안의 멘션은 해당 채널에서 모두 멘션할 수 있는 사람이 아니라면 무력화돼요.

## 스나이프

관리자가 `snipeset enable`을 실행하기 전까지 스나이프는 꺼져 있어요. 켜면 봇이 삭제되거나 수정된 메시지를 30일 동안 보관해요. `snipe [#channel] [@user]`는 가장 최근에 삭제된 메시지를, `editsnipe`는 가장 최근에 수정된 메시지를 보여 주고, `snipelist`와 `editsnipelist`는 최근 다섯 개(또는 지정한 개수)를 채널이나 사용자로 걸러서 보여 줘요.

## 반복 메시지

반복 메시지는 일정에 따라 메시지를 게시해요. `repeat <message>`는 5분 간격을 사용하고, `repeat <interval> <message>`는 5초에서 25000분 사이의 간격을 설정하며, `repeat <time of day> <message>`는 하루에 한 번 실행해요. 각 반복 메시지에는 `repeatlist`로 확인할 수 있는 번호가 있어요.

| 트리거 모드 | 동작 |
| --- | --- |
| `timeinterval` | 간격마다 게시(기본값) |
| `onactivity` | 설정한 시간 범위 안에 채널에 일정 개수의 메시지가 올라온 뒤 게시(`repeatactivity`) |
| `onnoactivity` | 설정한 시간 범위 동안 채널이 조용했을 때 게시 |
| `immediate` | 즉시 게시한 뒤 간격에 따라 반복 |
| `aftermessages` | 설정한 개수의 메시지가 올라온 뒤 게시 |

반복 메시지별 추가 설정: `repeatredun`은 반복 메시지가 이미 채널의 마지막 메시지라면 게시를 건너뛰고, `repeatschedule <business\|evening\|weekend\|custom>`은 실행 시간을 제한하며, `repeatconversation`은 대화 감지를 켜고 끄고, `repeatpriority`는 0에서 100 사이로 우선순위를 정하고, `repeatthreadonly`와 `repeatthreadautosticky`는 스레드를 대상으로 하며, `repeatforumtags`는 포럼 게시물을 태그로 제한하고, `repeatsuppressnotifications`는 알림 없이 보내며, `repeattoggle`은 일시 정지해요.

## 메시지 집계와 초대

`togglemsgcount`로 메시지 집계를 켤 수 있어요. `usermessages`, `channelmessages`, `servermessages`, `topusers`는 집계 결과를 보여 주고, `activitygraph`는 가장 바쁜 시간대나 요일을 그래프로 그리며, `minmsglength`는 지정한 길이보다 짧은 메시지를 무시해요. `resetmessagecounts`는 확인 후 사용자, 채널 또는 둘 다의 집계를 초기화해요.

초대 추적은 각 멤버를 누가 초대했는지 기록해요. `invites`, `whoinvited`, `invitedusers`, `inviteleaderboard`는 이 데이터를 조회해요. `toggleinvitetracking`, `toggleremoveinviteonleave`, `setminaccountage <days>`로 설정할 수 있어요. 최소 계정 기간보다 새로 만들어진 계정은 집계되지 않아요.

## 설정

대시보드 페이지는 **별칭**, **명언**, **자동 게시**, **스트림 역할**, **AI 어시스턴트**, **NSFW 필터**, **역할 모니터** 탭으로 나뉘어 있어요.

| 설정 | 기본값 | 제어 대상 |
| --- | --- | --- |
| 별칭 트리거와 매핑 | 없음 | 바꿀 단어와 그 단어가 되는 명령어 |
| 명언 키워드와 텍스트 | 없음 | 저장된 명언 |
| 자동 게시 채널 | 없음 | 봇이 게시할 공지 채널 |
| 이 사용자들의 메시지 / 이 단어가 포함된 메시지 건너뛰기 | 없음 | 채널별 게시 차단 목록 |
| 대상 역할 | 없음 | 스트림 역할을 받을 수 있는 멤버 |
| 스트리밍 중 역할 | 없음 | 부여되고 회수되는 역할 |
| 방송 제목 키워드 | 모든 방송 | 제목에 이 텍스트가 포함된 방송만 인정 |
| 어시스턴트 켜기 | 꺼짐 | AI 채널의 응답 여부 |
| 제공자, 모델, API 키, 시스템 프롬프트 | 없음 | AI 설정 |
| 웹 검색 허용 | 꺼짐 | Claude 웹 검색 |
| "웹 검색 중" 알림 숨기기 | 켜짐 | 모델의 웹 검색 상태 메시지 숨기기 |
| 차단 태그 | 없음 | 필터링되는 NSFW 검색 태그 |
| 기본 제재 | 기본값 사용 | 역할 모니터의 조치 |

스나이프, 메시지 집계, 초대 추적, 반복 메시지, 리마인더, 링크 미리보기에는 대시보드 설정이 없어요.

## 설정 단계

1. 대시보드에서 **유틸리티**를 열어요.
2. **별칭** 탭에서 `yt` 트리거를 `play youtube`에 연결하는 별칭을 추가하고, Discord에서 테스트해요.
3. **자동 게시** 탭에서 공지 채널을 추가해요. 봇이나 웹후크 사용자는 건너뛰기 목록에 추가해요.
4. **스트림 역할** 탭에서 대상 역할과 추가할 역할을 고르고, 필요하면 제목 키워드를 입력해요. 봇의 역할이 추가할 역할보다 위에 있는지 확인해요.
5. **AI 어시스턴트** 탭에서 채널, 제공자, 모델을 고르고, 키를 붙여 넣고, 시스템 프롬프트를 작성한 뒤 켜요.
6. Discord에서 삭제된 메시지 스나이프를 원하면 `snipeset enable`을, 메시지 통계를 원하면 `togglemsgcount`를 실행해요.

## 명령어

이 명령어들은 서버의 접두사(변경하지 않았다면 `.`)와 함께 실행해요.

| 명령어 | 별칭 | 필요 권한 | 용도 |
| --- | --- | --- | --- |
| `alias <trigger> [mapping]` | `cmdmap` | 관리자 | 별칭을 추가하거나, 매핑 없이 실행해 제거 |
| `aliaslist` | `cmdmaplist`, `aliases` | 없음 | 별칭 목록 보기 |
| `aliasesclear` | `aliasclear` | 관리자 | 모든 별칭 제거 |
| `quoteadd <keyword> <text>` | `.` | 없음 | 명언 추가 |
| `quoteprint <keyword>` | `..` | 없음 | 키워드의 무작위 명언 보기 |
| `quoteshow <id>` | | 없음 | ID로 명언 보기 |
| `quotesearch <keyword> <text>` | `qsearch` | 없음 | 키워드와 텍스트로 명언 찾기 |
| `quoteid <id>` | `qid` | 없음 | 명언을 추가한 사람 보기 |
| `listquotes [page] [order]` | `liqu` | 없음 | 명언 페이지 넘겨 보기 |
| `quotedelete <id>` | `qdel` | 없음(본인의 명언) 또는 관리자 | 명언 삭제 |
| `delallquotes <keyword>` | `daq`, `delallq` | 관리자 | 키워드 아래의 모든 명언 삭제 |
| `quoteexport` | `qexport` | 관리자 | 명언을 JSON으로 내보내기 |
| `quoteimport` | `qimport` | 관리자 | 첨부한 JSON 파일에서 명언 가져오기 |
| `addautopublish <#channel>` | `addautopub`, `aap` | 관리자 | 뉴스 채널 자동 게시 설정 |
| `removeautopublish <#channel>` | `removeautopub` | 관리자 | 자동 게시 중지 |
| `addpublishblacklist <@user> <#channel>` 또는 `<#channel> <word>` | `addpubbl` | 관리자 | 사용자 또는 단어 건너뛰기 |
| `removepublishblacklist <@user> <#channel>` 또는 `<#channel> <word>` | `removepubbl` | 관리자 | 건너뛰기 제거 |
| `getautopublishes` | `getaps` | 관리자 | 자동 게시 채널 목록 보기 |
| `streamrole [fromRole] [addRole]` | | 역할 관리 | 스트림 역할 설정, 역할 없이 실행하면 비활성화 |
| `streamrolekeyword [keyword]` | `srkw` | 역할 관리 | 방송 제목에 키워드 요구 |
| `streamroleblacklist <add\|remove> <@user>` | `srbl` | 역할 관리 | 이 멤버에게는 역할을 절대 부여하지 않음 |
| `streamrolewhitelist <add\|remove> <@user>` | `srwl` | 역할 관리 | 이 멤버는 방송 중 항상 역할 부여 |
| `aichannel [#channel] [enabled]` | `aic` | 서버 관리 | AI 채널 설정 |
| `aimodel <provider> [model]` | `aim` | 서버 관리 | 제공자와 모델 설정 |
| `aikey` | `ak` | 관리자 | API 키 설정 |
| `aiprompt <text>` | `aip` | 서버 관리 | 시스템 프롬프트 설정 |
| `aiwebsearch <true\|false>` | `aws` | 서버 관리 | Claude 웹 검색 설정 |
| `aiwebhook [name] [avatar]` | `aiw` | 관리자 | 웹후크로 답변, 이름 없이 실행하면 비활성화 |
| `aicustomembed [template]` | `aice` | 관리자 | 답변용 임베드 템플릿 |
| `aiconfig` | `ac` | 없음 | AI 설정 보기 |
| `remind <me\|here> <time> <message>` | | 없음 | 리마인더 설정 |
| `remind <#channel> <time> <message>` | | 메시지 관리 | 다른 채널에 리마인더 설정 |
| `remindlist` | `remindl`, `remindlst` | 없음 | 내 리마인더 목록 |
| `reminddelete <index>` | `remindrm`, `reminddel` | 없음 | 리마인더 삭제 |
| `snipeset <enable\|disable>` | `setsnipe` | 관리자 | 스나이프 켜기 또는 끄기 |
| `snipe [#channel] [@user]` | | 없음 | 마지막으로 삭제된 메시지 |
| `editsnipe [#channel] [@user]` | | 없음 | 마지막으로 수정된 메시지 |
| `snipelist [#channel] [@user] [amount]` | `slist` | 없음 | 최근 삭제된 메시지 |
| `editsnipelist [#channel] [@user] [amount]` | `esnipelist` | 없음 | 최근 수정된 메시지 |
| `repeat [time] [interval] <message>` | | 메시지 관리 | 반복 메시지 만들기 |
| `repeatlist` | `replst`, `replist`, `repli` | 메시지 관리 | 반복 메시지 목록 |
| `repeatremove <index>` | `reprm` | 메시지 관리 | 반복 메시지 삭제 |
| `repeatinvoke <index>` | `repinv` | 메시지 관리 | 지금 바로 게시 |
| `repeatmessage <index> <message>` | `repmsg` | 메시지 관리 | 텍스트 변경 |
| `repeatchannel <index> [#channel]` | `repchan` | 메시지 관리 | 다른 채널로 이동 |
| `repeatredun <index>` | `repred` | 메시지 관리 | 중복 확인 켜기 또는 끄기 |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | 메시지 관리 | 위 표의 트리거 모드 설정 |
| `repeatactivity <index> <messages> <window>` | `repactivity`, `repact` | 메시지 관리 | 활동 기준 설정 |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | 메시지 관리 | 우선순위 설정 |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | 메시지 관리 | 시간대 일정 설정 |
| `repeatconversation <index>` | `repconversation`, `repconv` | 메시지 관리 | 대화 감지 켜기 또는 끄기 |
| `repeattoggle <index>` | `reptoggle`, `reptog` | 메시지 관리 | 일시 정지 또는 재개 |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | 메시지 관리 | 새 스레드에 고정 |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | 메시지 관리 | 스레드에만 게시 |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | 메시지 관리 | 알림 없이 보내기 |
| `repeatforumtags <index> <action> [tagType] [tags]` | `repforumtags`, `repftags` | 메시지 관리 | 포럼 태그 규칙 |
| `togglemsgcount` | `togglemessagecount` | 관리자 | 메시지 집계 켜기 또는 끄기 |
| `minmsglength [length]` | `mmlength`, `minmlength` | 서버 관리 | 짧은 메시지 무시 |
| `usermessages [@user]` | `usermsg`, `umsg` | 없음 | 멤버의 메시지 통계 |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | 없음 | 채널의 메시지 통계 |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg`, `gmsg` | 없음 | 서버 전체 통계 |
| `topusers` | `topu` | 없음 | 메시지 수 상위 10명 |
| `activitygraph [days\|hours]` | `actgraph` | 없음 | 가장 바쁜 시간대 그래프 |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | 메시지 관리 | 집계 초기화 |
| `invites [@user]` | | 없음 | 초대 수 |
| `whoinvited [@user]` | `invitedby` | 없음 | 멤버를 초대한 사람 |
| `invitedusers [@user]` | `userinvites` | 없음 | 누군가가 초대한 멤버 |
| `inviteleaderboard` | `inviteslb` | 없음 | 상위 초대자 |
| `invitesettings` | `inviteconfig` | 서버 관리 | 초대 설정 보기 |
| `toggleinvitetracking` | | 서버 관리 | 추적 켜기 또는 끄기 |
| `toggleremoveinviteonleave` | `triol` | 서버 관리 | 초대받은 사람이 나가면 초대 수에서 제외 |
| `setminaccountage <days>` | `inviteminage` | 서버 관리 | 어린 계정 무시 |
| `joinstats` | `jstats` | 베타 플래그 (`dragon`) | 입장 그래프 |
| `leavestats` | `lstats` | 베타 플래그 (`dragon`) | 퇴장 그래프 |
| `joinstatscolor [r g b]` | `jstatscolor` | 베타 플래그 (`dragon`) | 입장 그래프 색상, 값이 없으면 금색 |
| `leavestatscolor [r g b]` | `lstatscolor` | 베타 플래그 (`dragon`) | 퇴장 그래프 색상, 값이 없으면 금색 |
| `userinfo [@user]` | `uinfo` | 없음 | 멤버 상세 정보 |
| `serverinfo [name]` | `sinfo` | 없음 | 서버 상세 정보 |
| `channelinfo [#channel]` | `cinfo` | 없음 | 텍스트 채널 상세 정보 |
| `vinfo [channel]` | `voiceinfo` | 없음 | 음성 채널 상세 정보 |
| `rinfo <role>` | `roleinfo` | 없음 | 역할 상세 정보 |
| `fetch <id>` | | 없음 | ID로 사용자 조회 |
| `avatar [@user]` | `av` | 없음 | 아바타, 서버 아바타 버튼 포함 |
| `banner [@user]` | `userbanner` | 없음 | 사용자 배너 |
| `userid [@user]` | `uid` | 없음 | 사용자 ID |
| `roleid <role>` | `rid` | 없음 | 역할 ID |
| `channelid` | `cid` | 없음 | 채널 ID |
| `serverid` | `sid` | 없음 | 서버 ID |
| `roles [@user]` | | 없음 | 서버 역할 또는 멤버의 역할 |
| `inrole <role>` | | 없음 | 해당 역할을 가진 멤버 |
| `inroles <role> <role>` | | 없음 | 두 역할을 모두 가진 멤버 |
| `rolepermlist [and\|or] <permissions...>` | `roleperms` | 없음 | 권한을 가진 역할 |
| `channeltopic [#channel]` | `ct` | 없음 | 채널 주제 |
| `whosplaying <game>` | `whpl` | 없음 | 해당 게임을 하고 있는 멤버 |
| `emotelist [type]` | | 없음 | 서버 이모트 |
| `showemojis <emojis>` | `se` | 없음 | 이모지 확대 |
| `say [#channel] <text or embed JSON>` | | 메시지 관리 | 봇 이름으로 말하기 |
| `getjson <messageId> [#channel]` | | 메시지 관리 | 메시지의 임베드 JSON 보기 |
| `embedsave <name> <json>` | `esave` | 없음 | 개인 임베드 템플릿 저장 |
| `guildembedsave <name> <json>` | `gesave`, `gembedsave` | 메시지 관리 | 서버 임베드 템플릿 저장 |
| `embedlist` / `guildembedlist` | `elist` / `gelist`, `gembedlist` | 없음 | 템플릿 목록 |
| `embeddelete <name>` / `guildembeddelete <name>` | `edel`, `edelete` / `gedel`, `gembeddelete` | 없음 / 메시지 관리 | 템플릿 삭제 |
| `embedpreview <name>` | `epreview`, `eprev` | 없음 | 템플릿 미리보기 |
| `debugembed <text>` | `embeddebug` | 관리자 | 임베드 파싱 테스트 |
| `savechat <time> [#channel]` | | 메시지 관리 | 채팅 기록을 저장하고 링크 받기 |
| `calculate <expression>` | `calc` | 없음 | 수식 계산 |
| `calcops` | | 없음 | 사용 가능한 수학 연산 |
| `plot <function> [start] [end]` | `graphfunction` | 없음 | 함수 그래프 그리기 |
| `sym <expression>` | `symbolicmath` | 없음 | 기호 수학 계산 |
| `convertunits <from> <to> <value>` | `unitconvert`, `units` | 없음 | 단위 변환 |
| `convertlist` | | 없음 | 지원되는 단위 |
| `convert <format>` | | 없음 | 첨부한 미디어 파일 변환 |
| `roll <dice>` | | 없음 | 주사위 굴리기, DnD 표기법 지원 |
| `owoify <text>` | `owo` | 없음 | 텍스트를 OwO 말투로 변환 |
| `vcheck [url]` | `viruscheck` | 없음 | 링크의 VirusTotal 검사 |
| `traceroute <host>` | `tracert`, `trcrt` | 없음 | 호스트까지의 경로 추적 |
| `pingip <ip> [count]` | | 없음 | 주소에 최대 10번 핑 |
| `previewlinks <yes\|no>` | `plinks` | 관리자 | 링크 미리보기 켜기 또는 끄기 |
| `verboseerror [true\|false]` | `ve` | 메시지 관리 | 상세 명령어 오류 켜기 또는 끄기 |
| `ping` | | 없음 | 봇 지연 시간 |
| `stats` | | 없음 | 봇 통계 |
| `invite` | | 없음 | 봇 초대 및 지원 링크 |
| `vote` | | 없음 | 투표 링크 |

## 팁과 주의 사항

- 별칭은 텍스트만 바꿔요. 연결된 명령어는 자체 권한 검사를 그대로 거쳐요.
- 자동 게시는 Discord 공지(뉴스) 채널에서만 작동해요.
- 스트림 역할은 봇의 역할이 추가할 역할보다 위에 있어야 해요. 역할을 관리할 수 없으면 모든 방송에서 조용히 실패하는 대신 기능이 스스로 꺼져요.
- 스나이프는 기본적으로 꺼져 있고, 30일이 지난 스나이프는 삭제돼요.
- 60일을 넘는 리마인더는 거부돼요.
- AI 어시스턴트는 설정된 한 채널에서만 응답하고 봇의 메시지는 무시해요. 기억은 멤버별 최근 다섯 개 메시지뿐이라서 긴 대화에서는 처음 문맥을 잃어요.
- 메시지 집계는 통계가 생기기 전에 켜 두어야 해요. 이전 메시지는 소급해서 집계되지 않아요.
- `joinstats`와 `leavestats`는 10초에 한 번만 실행할 수 있어요.

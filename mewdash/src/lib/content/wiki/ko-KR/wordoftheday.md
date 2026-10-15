---
title: 오늘의 단어
slug: wordoftheday
summary: 사전에서 주제와 난이도에 맞춰 고르거나 서버가 직접 작성한 목록에서 골라, 매일 단어 하나를 뜻, 발음, 예문과 함께 올려요.
icon: fa-book-open
category: Community
dashboard: /dashboard/wordoftheday
module: WordOfTheDay
tags: [word of the day, wotd, vocabulary, dictionary, definition, daily, datamuse, topic, schedule, 오늘의 단어, 어휘, 사전, 뜻, 매일, 주제, 일정]
related: [birthday, utility]
---

## 기능 소개

매일 서버가 정한 현지 시각에 봇이 선택한 채널에 단어 하나를 올려요. 게시물에는 단어, 발음, 품사, 뜻, 그리고 예문이 있으면 예문도 나와요. 게시물마다 특정 역할을 멘션할 수도 있어요.

단어는 Datamuse 사전에서 가져오고, 세 가지 설정으로 걸러요. 단어가 기울어야 할 **주제**, **품사**, 영어 글에서 얼마나 자주 나타나는지에 따른 **난이도**예요. 봇은 최근 90일 동안 올린 단어를 다시 올리지 않아요.

서버는 `wotdadd`로 **사용자 지정 목록**도 만들 수 있어요. 뜻을 생략하면 봇이 뜻을 찾아줘요. **출처 모드**는 게시물이 사전에서 오는지, 사용자 지정 목록에서 오는지, 아니면 사용자 지정 목록을 먼저 쓰고 떨어지면 사전을 쓰는지 정해요.

## 요일이나 월별 일정

규칙을 만들면 특정 요일이나 월에 대해 주제, 품사, 난이도를 덮어쓸 수 있어요. 규칙은 설정한 항목만 바꿔요. 예를 들어 월요일 규칙에 주제만 있으면 품사와 난이도는 기본 설정을 그대로 써요. 둘 다 적용되면 요일 규칙이 월 규칙보다 우선하고, 월 규칙은 기본 설정보다 우선해요.

예시:

- `wotdday monday science`는 월요일의 단어를 과학 주제로 만들어요.
- `wotddayfilter friday adjective rare`는 금요일에 희귀한 형용사를 올려요.
- `wotdmonth october spooky halloween`은 10월 전체를 할로윈 주제로 만들어요.
- `wotdschedule`은 모든 규칙과 오늘 적용 중인 필터를 보여줘요.

## 토론 스레드

켜면 봇은 매일 게시물 아래에 공개 스레드를 만들고, 그 단어를 문장에 써 보자고 권하는 시작 메시지를 남겨요. 스레드 이름은 템플릿에서 가져와요. 기본값은 `Word of the day: %wotd.word%`예요. 템플릿에는 `%wotd.word%`, `%wotd.date%`, `%wotd.pos%`와 일반적인 서버 자리표시자를 쓸 수 있어요. `wotdthread`는 스레드를 켜거나 끄고, `wotdthreadname`은 이름 템플릿을 설정하거나 보여주거나 지우고, `wotdthreadarchive`는 자동 보관되기 전까지 스레드가 열려 있는 시간(1시간, 1일, 3일, 1주일)을 정해요.

## 명령어

| 명령어 | 용도 |
| --- | --- |
| `wotd` | 오늘의 단어를 보여줘요. 아직 올라온 단어가 없으면 미리보기를 보여줘요. |
| `wotdchannel #channel` | 채널을 설정하고 게시를 켜요. |
| `wotdtime 9` | 게시할 현지 시각을 설정해요. |
| `wotdtimezone Europe/London` | 시간대를 설정해요. |
| `wotdtopic space` | 기본 주제를 설정해요. |
| `wotdpos noun` | 품사를 제한해요. |
| `wotddifficulty rare` | 난이도를 설정해요. |
| `wotdmode mixed` | 사전, 사용자 지정, 혼합 중에서 고를 수 있어요. |
| `wotdadd word [definition]` | 사용자 지정 단어를 추가해요. |
| `wotdmessage` | 자리표시자나 임베드 JSON으로 사용자 지정 메시지 템플릿을 설정해요. |
| `wotdthread` | 게시물마다 토론 스레드를 켜거나 꺼요. |
| `wotdthreadname [template\|clear]` | 스레드 이름 템플릿을 설정, 보기, 지우기를 해요. |
| `wotdthreadarchive 1h\|24h\|3d\|7d` | 자동 보관되기 전까지 스레드가 열려 있는 시간을 설정해요. |
| `wotdpost` | 지금 바로 새 단어를 올려요. |

## 메시지 자리표시자

사용자 지정 템플릿에서는 `%wotd.word%`, `%wotd.definition%`, `%wotd.pos%`, `%wotd.example%`, `%wotd.phonetic%`, `%wotd.date%`, `%wotd.ping%`을 쓸 수 있어요. 일반적인 서버 자리표시자도 함께 쓸 수 있어요.

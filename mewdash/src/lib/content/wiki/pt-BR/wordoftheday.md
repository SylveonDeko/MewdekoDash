---
title: Palavra do Dia
slug: wordoftheday
summary: Publica uma palavra de vocabulário por dia com sua definição, pronúncia e um exemplo, escolhida em um dicionário por tema e dificuldade ou em uma lista que o próprio servidor escreve.
icon: fa-book-open
category: Community
dashboard: /dashboard/wordoftheday
module: WordOfTheDay
tags: [word of the day, wotd, vocabulary, dictionary, definition, daily, datamuse, topic, schedule, palavra do dia, vocabulário, dicionário, definição, diário, tema, agendamento]
related: [birthday, utility]
---

## O que faz

Uma vez por dia, em um horário que o servidor escolhe no próprio fuso horário, o bot publica uma palavra em um canal escolhido. A publicação mostra a palavra, como ela é pronunciada, sua classe gramatical, uma definição e uma frase de exemplo, quando houver. Um cargo pode ser mencionado em cada publicação.

As palavras vêm do dicionário Datamuse e são filtradas por três configurações: um **tópico** para o qual as palavras devem se inclinar, uma **classe gramatical** e uma **dificuldade** baseada na frequência com que a palavra aparece no inglês escrito. O bot evita repetir qualquer coisa que tenha publicado nos últimos noventa dias.

Os servidores também podem montar uma **lista personalizada** com `wotdadd`. Se a definição for omitida, o bot a procura. O **modo de fonte** decide se as publicações vêm do dicionário, da lista personalizada, ou da lista personalizada primeiro e do dicionário quando ela acabar.

## Agendamento por dia da semana ou mês

As regras podem substituir o tópico, a classe gramatical e a dificuldade para um dia da semana ou um mês específico. Uma regra altera apenas os campos que define, então uma regra de segunda-feira com apenas um tópico ainda usa a classe gramatical e a dificuldade base. Quando as duas se aplicam, as regras de dia da semana têm prioridade sobre as de mês, e as de mês têm prioridade sobre as configurações base.

Exemplos:

- `wotdday monday science` faz a palavra de segunda-feira ser sobre ciência.
- `wotddayfilter friday adjective rare` faz as sextas-feiras terem adjetivos raros.
- `wotdmonth october spooky halloween` tematiza todo o mês de outubro.
- `wotdschedule` mostra todas as regras e quais filtros estão em vigor hoje.

## Thread de discussão

Quando ativada, o bot cria uma thread pública abaixo de cada publicação diária e deixa um texto inicial convidando as pessoas a usar a palavra em uma frase. O nome da thread vem de um modelo (padrão `Word of the day: %wotd.word%`) que aceita `%wotd.word%`, `%wotd.date%`, `%wotd.pos%` e os placeholders usuais do servidor. `wotdthread` ativa ou desativa a thread, `wotdthreadname` define, mostra ou limpa o modelo de nome, e `wotdthreadarchive` define por quanto tempo a thread fica aberta antes de ser arquivada automaticamente (1 hora, 1 dia, 3 dias ou 1 semana).

## Comandos

| Comando | O que faz |
| --- | --- |
| `wotd` | Mostra a palavra de hoje, ou uma prévia se nada foi publicado ainda. |
| `wotdchannel #channel` | Define o canal e ativa as publicações. |
| `wotdtime 9` | Define a hora local em que as publicações acontecem. |
| `wotdtimezone Europe/London` | Define o fuso horário. |
| `wotdtopic space` | Define o tópico base. |
| `wotdpos noun` | Restringe a classe gramatical. |
| `wotddifficulty rare` | Define a dificuldade. |
| `wotdmode mixed` | Escolhe dicionário, lista personalizada ou misto. |
| `wotdadd word [definition]` | Adiciona uma palavra personalizada. |
| `wotdmessage` | Define um modelo de mensagem personalizado com placeholders ou JSON de embed. |
| `wotdthread` | Ativa ou desativa a thread de discussão abaixo de cada publicação. |
| `wotdthreadname [template\|clear]` | Define, mostra ou limpa o modelo de nome da thread. |
| `wotdthreadarchive 1h\|24h\|3d\|7d` | Define por quanto tempo a thread fica aberta antes de ser arquivada automaticamente. |
| `wotdpost` | Publica uma nova palavra agora mesmo. |

## Placeholders de mensagem

`%wotd.word%`, `%wotd.definition%`, `%wotd.pos%`, `%wotd.example%`, `%wotd.phonetic%`, `%wotd.date%` e `%wotd.ping%` estão disponíveis dentro de um modelo personalizado, junto com os placeholders usuais do servidor.

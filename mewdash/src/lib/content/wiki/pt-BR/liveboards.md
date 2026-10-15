---
title: Live Boards
slug: liveboards
summary: Fixe um ranking, gráfico ou visão geral em um canal e faça o bot mantê-lo sempre atualizado, além de publicar um resumo do dia, da semana ou do mês em uma programação.
icon: fa-thumbtack
category: Community
dashboard: /dashboard/liveboards
module: ServerStats
tags: [live boards, pinned leaderboard, pin leaderboard, auto updating, server report, weekly report, monthly report, digest, growth report, quadros ao vivo, ranking fixado, atualização automática, relatório do servidor, relatório semanal, relatório mensal, resumo, relatório de crescimento]
related: [serverstats, invites, statchannels, statroles]
---

## O que faz

Um live board é uma mensagem que o bot publica uma vez, fixa e depois edita em intervalos para que sempre mostre números atuais. Um relatório do servidor é um embed único com um gráfico de crescimento, publicado diariamente, semanalmente ou mensalmente, que resume o que aconteceu desde o anterior.

## Boards

| Board | Mostra |
| --- | --- |
| Ranking de convites | Os principais convidadores com as contagens de convites normais, saídas e falsos |
| Ranking de mensagens | Os principais falantes |
| Ranking de voz | Membros com mais tempo em voz |
| Principais jogos | Os jogos e apps mais jogados com a quantidade de jogadores (exige rastreamento de jogos) |
| Gráfico de entradas, Gráfico de saídas, Gráfico de crescimento | Entradas e saídas por dia |
| Gráfico de membros | Quantidade de membros a partir dos snapshots de hora em hora |
| Gráfico de mensagens | Mensagens por dia |
| Visão geral do servidor | O mesmo resumo do `serveractivity` |
| Análise de convites | Entradas, saídas, retenção, entradas falsas e origens |

Cada board tem uma **janela** (último dia, semana, mês ou todo o período; os gráficos usam até 90 dias para todo o período), um intervalo de atualização de pelo menos 5 minutos, uma quantidade de linhas para os rankings e uma opção de fixar. Um servidor pode ter até 10 boards. Excluir um board apaga a sua mensagem. Se alguém apagar a mensagem manualmente, o bot publica uma nova na próxima atualização.

## Relatórios do servidor

Defina um canal e uma frequência, e o bot publica um relatório na primeira vez em que o agendamento chegar e depois todos os dias às 00:00 UTC, toda segunda-feira ou no primeiro dia de cada mês. Um relatório contém:

- Entradas, saídas, crescimento líquido e retenção do período
- Mensagens, tempo em voz e membros ativos
- Quantidade de membros e como ela mudou
- Principais convidadores, falantes, membros em voz e canais mais movimentados
- Principais códigos de convite com seus rótulos, e principais jogos quando o rastreamento de jogos está ativo
- Um gráfico de entradas e saídas

**Enviar relatório agora** publica um imediatamente, sem alterar o agendamento. Os relatórios se desativam sozinhos se o bot perder a permissão de publicar no canal.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a não ser que você tenha alterado). Os boards também ficam sob `/liveboard`, e os relatórios sob `/serverreport`.

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `liveboardadd <#channel> <board> [range] [rows] [minutes]` | `pinboard`, `pinleaderboard` | Gerenciar Servidor | Publica e fixa um board |
| `liveboardlist` | `liveboards` | Gerenciar Servidor | Todos os boards |
| `liveboardremove <id>` | `unpinboard` | Gerenciar Servidor | Exclui um board e sua mensagem |
| `liveboardrefresh` | | Gerenciar Servidor | Atualiza todos os boards agora |
| `serverreportchannel [#channel]` | `reportchannel` | Gerenciar Servidor | Define o canal de relatórios e ativa os relatórios, ou os desativa |
| `serverreportfrequency <Daily/Weekly/Monthly>` | `reportfrequency` | Gerenciar Servidor | Com que frequência os relatórios são publicados |
| `serverreportnow [frequency]` | `reportnow` | Gerenciar Servidor | Publica um relatório no canal atual |

## Dicas e pegadinhas

- Fixar exige a permissão Gerenciar Mensagens no canal. Sem ela, o board ainda é publicado, apenas sem ficar fixado.
- Os boards editam a mesma mensagem, então um board em um canal movimentado acaba saindo da tela; coloque-os em um canal de estatísticas dedicado ou confie no fixado.
- Os rankings respeitam as exclusões de convites e de atividade, então membros ocultos ou ignorados nunca aparecem em um board fixado.
- Os canais de estatísticas são a outra forma de mostrar números ao vivo: um contador no nome do canal em vez de uma mensagem.

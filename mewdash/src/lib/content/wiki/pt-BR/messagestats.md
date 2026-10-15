---
title: Estatísticas de Mensagens
slug: messagestats
summary: Conte quantas mensagens cada membro envia em cada canal e veja rankings, detalhamentos por usuário e por canal, e gráficos das horas e dos dias mais movimentados.
icon: fa-envelope
category: Analytics
dashboard: /dashboard/messagestats
module: Utility
tags: [message stats, message count, activity, leaderboard, top users, analytics, busiest hours, activity graph, estatísticas de mensagens, contagem de mensagens, atividade, ranking, principais usuários, análises, horas mais movimentadas, gráfico de atividade]
related: [xp, utility, statchannels]
---

## O que ele faz

Depois que a contagem de mensagens é ativada, o bot registra uma contagem por membro por canal sempre que um humano envia uma mensagem que atinge o tamanho mínimo. Nada é armazenado sobre o conteúdo, apenas quem postou, onde e quando. As contagens são enfileiradas e gravadas no banco de dados em lotes, para que servidores movimentados não deixem o bot lento.

Os membros podem pedir seus próprios totais com `usermessages`, ver qual canal é o mais movimentado com `channelmessages`, ou consultar o servidor inteiro com `servermessages`. `topusers` exibe um ranking dos dez primeiros com a participação de cada membro no total de mensagens. `activitygraph` gera uma imagem de gráfico de barras com os dias da semana ou as horas do dia mais movimentados.

O painel mostra os mesmos números com gráficos, e permite que a equipe ative ou desative a contagem, redefina contagens e exporte os dados em CSV ou JSON.

## Por que usar

- Encontre seus membros mais ativos para recompensas, cargos ou recrutamento de moderadores.
- Veja quais canais estão parados e quais estão movimentados antes de reorganizar o servidor.
- Escolha horários para eventos usando o gráfico de horas mais movimentadas no seu próprio fuso horário.
- Identifique bots e contas de spam comparando a contagem de mensagens com a qualidade delas.

## O que é contado

| Regra | Comportamento |
| --- | --- |
| Contagem ativada | Nada é registrado até que `togglemsgcount` ou a opção do painel seja ativada |
| Bots | Nunca contados |
| DMs | Nunca contadas; apenas canais do servidor |
| Tamanho mínimo | Mensagens mais curtas que **Tamanho mínimo da mensagem** caracteres são ignoradas; o padrão é 0, então tudo conta |
| Timestamps | Os horários das mensagens são mantidos por 90 dias para alimentar os gráficos de hora e dia; os totais são mantidos indefinidamente |

O tamanho mínimo aceita valores de até 4098. Executar `minmsglength` sem número mostra o valor atual.

## Gráficos de atividade

`activitygraph days` precisa de dados para todos os sete dias da semana e analisa as últimas quatro semanas. `activitygraph hours` precisa de dados para as 24 horas nos últimos sete dias. Para o gráfico por hora, o bot pede que você escolha um fuso horário primeiro, oferecendo uma lista de fusos comuns, aceitando qualquer nome de fuso IANA e cancelando se você não responder. O gráfico é publicado como PNG.

## Configurações

A página de Estatísticas de Mensagens tem duas abas principais, **Estatísticas** e **Gerenciamento**. Estatísticas contém **Visão geral**, **Principais usuários** e **Principais canais**. Gerenciamento contém **Configurações** e **Exportar dados**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Ativar contagem de mensagens | Desligado | Se novas mensagens são registradas |
| Tamanho mínimo da mensagem | 0 | Controle deslizante de 0 a 4098; a mensagem mais curta que conta |
| Redefinir contagens de mensagens | | **Redefinir todas as contagens do servidor** exclui todas as contagens armazenadas do servidor, após confirmação |
| Formato de exportação | CSV | Download em CSV ou JSON das estatísticas carregadas |
| Incluir estatísticas de usuários | Ligado | Adiciona as linhas dos principais usuários à exportação |
| Incluir estatísticas de canais | Ligado | Adiciona as linhas dos principais canais à exportação |
| Incluir detalhamento por hora | Desligado | Adiciona as linhas de horas mais movimentadas e dias mais movimentados à exportação |

A aba **Visão geral** mostra os cartões **Mensagens por dia**, **Total de mensagens**, **Última atualização** e **Status**, o usuário e o canal menos ativos, um gráfico de **Atividade em 24 horas** e um gráfico de **Tendência semanal**. **Principais usuários** lista **Quem mais envia mensagens** e **Principais canais** lista **Canais mais ativos**.

> [!NOTE]
> A exportação é gerada no seu navegador a partir das estatísticas já carregadas na página. As datas de início e fim que você digitar são gravadas no cabeçalho do arquivo, mas não filtram as linhas.

## Passo a passo

1. Abra **Estatísticas de Mensagens** no painel, vá para **Gerenciamento** e depois para **Configurações**.
2. Ative **Ativar contagem de mensagens**.
3. Opcionalmente, defina **Tamanho mínimo da mensagem** como 5, ou execute `minmsglength 5` no Discord, para que respostas de um caractere sejam ignoradas.
4. Deixe o servidor conversar por um dia e depois confira **Estatísticas** para ver os primeiros números.
5. Depois de uma semana, execute `activitygraph hours` e escolha seu fuso horário para ver quando o servidor está mais movimentado.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `usermessages [@user]` | `usermsg`, `umsg` | Ninguém | Total, canal mais ativo e menos ativo, para você ou outro membro |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Ninguém | Total, membro mais e menos ativo em um canal |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg` | Ninguém | Total do servidor, com o membro e o canal mais e menos ativos |
| `topusers` | `topu` | Ninguém | Os dez principais membros por contagem de mensagens, com porcentagens |
| `activitygraph [days or hours]` | `actgraph` | Ninguém | Gráfico de barras dos dias ou horas mais movimentados; o padrão são dias |
| `minmsglength [number]` | `mmlength`, `minmlength` | Gerenciar Servidor | Mostra ou define o tamanho mínimo para uma mensagem contar |
| `togglemsgcount` | `togglemessagecount` | Administrador | Liga ou desliga a contagem |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Gerenciar Mensagens | Redefine as contagens de todo o servidor, de um membro, de um canal ou de um membro em um canal, após confirmação |

## Dicas e armadilhas

- A contagem só começa a partir do momento em que é ativada. Mensagens enviadas antes disso nunca são preenchidas retroativamente.
- Todo comando de estatísticas e o painel informam "desativado" até que a contagem seja ligada, mesmo que existam dados antigos.
- As contagens são gravadas em lotes de até 100 eventos, então um total pode ficar alguns segundos atrás do chat ao vivo.
- Excluir um canal não exclui as contagens dele. Use `resetmessagecounts #channel` antes de remover o canal se quiser que elas sumam.
- O gráfico por hora é tão preciso quanto o fuso horário que você escolher. Armazene o fuso do servidor com o comando de fuso horário em Administração para manter a consistência entre a equipe.
- O sistema de XP tem seu próprio rastreamento de atividade e não usa essas contagens.

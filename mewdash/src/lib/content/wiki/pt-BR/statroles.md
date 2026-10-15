---
title: Cargos por Estatísticas
slug: statroles
summary: Cargos que os membros ganham por serem ativos em um período e perdem quando param, avaliados por limites, melhores ranks, melhores porcentagens ou sequências diárias de mensagens, voz, jogos, convites, tempo no servidor ou idade da conta.
icon: fa-trophy
category: Community
dashboard: /dashboard/statroles
module: StatRoles
tags: [stat roles, statroles, activity roles, active member role, inactive role, top chatter role, voice role, invite rewards, message rewards, streak, statbot, cargos por estatísticas, cargos de atividade, cargo de membro ativo, cargo de inativo, cargo de maior falante, cargo de voz, recompensas de convites, recompensas de mensagens, sequência, estatísticas]
related: [serverstats, xp, invites, liveboards]
---

## O que faz

Os cargos de nível de XP são de mão única: uma vez conquistados, ficam para sempre. Um cargo por estatística é reavaliado em um agendamento. Os membros que atendem à condição recebem o cargo, e os que deixam de atendê-la o perdem; assim, um cargo de "membro ativo" significa ativo *agora*. Torne-o permanente se quiser o comportamento antigo, ou inverta-o para marcar os membros inativos.

## Condições

Cada cargo por estatística mede uma coisa em um período e aplica um limite.

| Medida | O que é contado |
| --- | --- |
| Mensagens | Mensagens no período, opcionalmente apenas em canais escolhidos |
| Minutos de voz | Tempo em voz no período, respeitando os estados de voz excluídos em Estatísticas de atividade |
| Minutos em um jogo | Tempo em um jogo ou app específico, ou em qualquer um, no período. Exige que o rastreamento de jogos esteja ativado |
| Convites | O total líquido de convites do membro |
| Dias no servidor | Desde que o membro entrou |
| Idade da conta | Desde que a conta foi criada |

| Tipo de limite | Quem se qualifica |
| --- | --- |
| Limite | Entre um mínimo e um máximo opcional |
| Melhores ranks | Classificados entre duas posições, por exemplo os 10 primeiros |
| Melhor porcentagem | Entre os X por cento melhores membros classificados, por exemplo os 5% melhores |
| Sequência diária | Atingiu um mínimo por dia em pelo menos N dias dentro do período, por exemplo 5 mensagens em 7 dos últimos 7 dias |

O período vai de 1 a 90 dias, ou todo o histórico para qualquer limite que não seja sequência. Empates dividem o mesmo rank.

## Filtros e opções

| Opção | O que faz |
| --- | --- |
| Contar apenas nos canais | Limita mensagens ou voz a canais escolhidos |
| Cargos necessários | O membro precisa ter pelo menos um para ser considerado |
| Cargos excluídos | O membro que tiver qualquer um deles nunca é considerado |
| Membros ignorados | Nunca concedido ou removido para esses membros |
| Grupo | Cargos por estatística que compartilham um grupo mantêm apenas o nível mais alto para o qual o membro se qualifica, então Bronze, Prata e Ouro não se acumulam |
| Permanente | Nunca removido depois de conquistado |
| Inverter | Membros que *não* se qualificam recebem o cargo |
| Incluir bots | Considera contas de bots |
| Avaliar a cada | Com que frequência a regra é executada, no mínimo a cada 10 minutos, a cada 3 horas por padrão |
| Anunciar em / Enviar DM ao membro | Publica uma mensagem quando o cargo é concedido ou removido, usando `%user%`, `%role%`, `%action%` (ganho ou perdido), `%value%` e `%stat%` |

## Painel

A aba **Cargos por Estatísticas** lista cada regra com sua condição, agendamento e última execução, e permite ativar, desativar, editar, excluir, ver a **Prévia** ou **Executar** cada uma. A prévia mostra quem ganharia e quem perderia o cargo, sem alterar nada. Executar aplica a regra imediatamente; execuções manuais são limitadas a uma a cada dez minutos por servidor.

A aba **Criar / Editar** é o formulário para tudo o que está acima.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a não ser que você tenha alterado). Todo comando também existe sob `/statrole`.

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `statroleadd <@role> <stat> <minimum> [days] [name]` | `sradd` | Gerenciar Cargos | Uma regra de limite |
| `statroletop <@role> <stat> <topEnd> [days] [name]` | `srtop` | Gerenciar Cargos | Uma regra de melhores ranks para as posições de 1 a topEnd |
| `statrolepercent <@role> <stat> <percent> [days] [name]` | `srpercent` | Gerenciar Cargos | Uma regra de melhor porcentagem |
| `statrolestreak <@role> <stat> <perDay> <requiredDays> [days] [name]` | `srstreak` | Gerenciar Cargos | Uma regra de sequência diária |
| `statrolelist` | `statroles` | Ninguém | Todas as regras |
| `statroleinfo <id>` | `srinfo` | Ninguém | Uma regra completa |
| `statroleset <id> <setting> <value>` | `srset` | Gerenciar Cargos | Altera nome, min, max, lookback, topstart, topend, days, permanent, invert, bots, group, interval, notifychannel, notifydm, message ou activity |
| `statrolefilter <id> <#channel, @role [true], or @user>` | `srfilter` | Gerenciar Cargos | Alterna um filtro de canal, um cargo necessário (ou cargo excluído com `true`) ou um membro ignorado |
| `statroletoggle <id>` | `srtoggle` | Gerenciar Cargos | Ativa ou desativa |
| `statrolepreview <id>` | `srpreview` | Gerenciar Cargos | Quem ganharia e quem perderia |
| `statrolerun <id>` | `srrun` | Gerenciar Cargos | Aplica agora |
| `statroleremove <id>` | `srremove` | Gerenciar Cargos | Exclui a regra; os membros mantêm o que possuem |

## Dicas e pegadinhas

- O cargo mais alto do bot precisa estar acima do cargo gerenciado, e ele precisa da permissão Gerenciar Cargos.
- Cada cargo do Discord pode ser gerenciado por um único cargo por estatística. Exclua a regra antiga antes de apontar uma nova para o mesmo cargo.
- Uma regra com mínimo 0 e sem máximo se aplicaria a todos; defina um máximo ou use inverter de propósito.
- Membros que optaram por não participar das estatísticas de atividade não têm mensagens, tempo de voz ou tempo de jogo, então nunca se qualificam para essas medidas.
- Veja a prévia antes de ativar uma regra em um servidor grande. As alterações de cargo são espaçadas para respeitar os limites de requisições, então uma regra que afeta milhares de membros leva alguns minutos para ser aplicada.

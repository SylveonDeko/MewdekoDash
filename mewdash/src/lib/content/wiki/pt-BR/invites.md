---
title: Convites
slug: invites
summary: Atribua cada entrada a um código de convite, ao link personalizado ou a um aplicativo, conte convites regulares, saídas, falsos e bônus por membro, rotule códigos e acompanhe o crescimento, a retenção e as origens das entradas ao longo do tempo.
icon: fa-users
category: Community
dashboard: /dashboard/invites
module: Utility
tags: [invites, invite tracking, inviter, who invited, referrals, recruitment, leaderboard, fake invites, bonus invites, retention, vanity, labels, analytics, mass ban, convites, rastreamento de convites, convidador, quem convidou, indicações, recrutamento, ranking, convites falsos, convites bônus, retenção, url personalizada, rótulos, análises, banimento em massa]
related: [multigreets, statroles, liveboards, serverstats]
---

## O que faz

Quando alguém entra, o bot compara os links de convite do servidor antes e depois da entrada para descobrir qual foi usado, verifica a URL personalizada se nenhum tiver correspondido e registra como o membro chegou: por meio do convite de um membro, pela URL personalizada, como um bot adicionado via OAuth, ou de origem desconhecida. O convidador ganha um convite **regular**, a menos que a entrada seja marcada como **falsa**. Quando o membro convidado sai, a contagem de **saídas** do convidador aumenta. A equipe pode conceder convites **bônus**. O total de um membro é regulares menos saídas menos falsos, mais bônus.

Toda entrada observada é mantida, inclusive depois que o membro sai, então a página pode mostrar a retenção (quantos membros convidados ainda estão aqui), as reentradas e quais códigos trazem pessoas que permanecem.

## Por que usar

- Organize um concurso de recrutamento e pague com base em um ranking que não pode ser manipulado com contas alternativas ou ciclos de entrar e sair.
- Descubra se uma campanha no Twitter, um servidor parceiro ou um link do YouTube realmente traz membros que ficam, rotulando cada código.
- Mostre quem convidou e o código usado na mensagem de boas-vindas.
- Encontre e bana todos os que um convidador trouxe quando um raid chega por meio de um único link.

## Como as entradas são atribuídas

- O bot precisa de **Gerenciar Servidor** para ler a lista de convites. Sem ela, nada é registrado.
- As entradas são processadas uma de cada vez por servidor. Quando várias pessoas usam o mesmo código entre duas verificações, o excedente é guardado e creditado às próximas entradas, para que rajadas não se percam.
- Uma entrada pela URL personalizada é registrada como **Vanity**, sem convidador. Um bot adicionado via OAuth é registrado como **Bot**.
- Um código com rótulo e com dono credita o dono, e não quem criou o convite. É assim que funcionam os links pessoais do `invitelink`.

## Detecção de falsos

Uma entrada é marcada como falsa, e o convidador recebe um convite falso em vez de um regular, quando qualquer uma destas condições se aplica:

| Motivo | Quando |
| --- | --- |
| Próprio | O membro usou o próprio convite |
| Conta nova | A conta é mais nova que a **Idade mínima da conta** (0 desativa a verificação) |
| Reentrada | O membro já entrou antes e **Contar reentradas** está desativado |
| Sem avatar | O membro não tem avatar e **Sinalizar membros sem avatar** está ativado |

Convidadores na **lista negra**, ou que tenham um cargo da lista negra, continuam aparecendo como convidadores, mas nunca ganham crédito. Membros na lista de **ocultos** são rastreados, mas não aparecem nos rankings.

## Abas do painel

| Aba | O que mostra |
| --- | --- |
| Visão geral | Entradas, saídas, crescimento líquido, retenção, entradas falsas e origens das entradas do último dia, semana, mês ou de todo o período, um gráfico de entradas e saídas, os principais convidadores e os principais códigos |
| Ranking | Todos os convidadores com seus números de regulares, saídas, falsos, bônus e retenção, filtrados por período ou cargo, exportáveis em CSV. Clique em uma linha ou escolha um membro para ver o detalhamento, adicionar ou remover convites regulares, bônus ou falsos, ou zerá-los |
| Membros | Todas as entradas observadas, filtradas por convidador, código de convite ou rótulo, com a forma como chegaram, se foram marcadas e se ainda estão aqui. Exportável em CSV |
| Códigos e rótulos | Todos os códigos de convite do servidor, com o criador, o canal e os usos. Dê um rótulo a um código e, opcionalmente, um cargo que todos que entram por ele recebem, ou exclua o código |
| Configurações | Rastreamento, remoção ao sair, contagem de reentradas, sinalização de falta de avatar, idade mínima da conta, o canal para onde apontam os links pessoais, o canal de registro de entradas e saídas, listas negras, membros ocultos e as ferramentas de importação e redefinição |

## Configurações

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Rastrear convites | ativado | Se as entradas são atribuídas a alguém |
| Remover crédito quando membros saírem | ativado | Soma um à contagem de saídas do convidador, reduzindo o total dele, quando um membro convidado sai |
| Contar reentradas | ativado | Desativado marca como convite falso um membro que já entrou antes |
| Sinalizar membros sem avatar | desativado | Entradas de contas sem avatar contam como falsas |
| Idade mínima da conta | 0 dias | Contas mais novas que isso são marcadas como falsas |
| Canal do link pessoal | canal do sistema | Para onde apontam os convites criados por `invitelink` |
| Canal de registro de entradas e saídas | nenhum | Publica um embed em cada entrada e saída, dizendo quem convidou quem, com o código, a idade da conta e qualquer marcação de falso |

**Importar usos do Discord** eleva o total de regulares de cada convidador até a soma dos usos de seus códigos e nunca o reduz; por isso, é seguro executá-lo novamente após uma reinicialização ou uma instalação nova. **Redefinir convidadores que saíram** zera a contagem de todos que não estão mais no servidor. **Redefinir tudo** zera todas as contagens e o histórico de entradas.

## Placeholders de saudação

Qualquer saudação pode usar estes valores quando o rastreamento estiver ativo. Valores desconhecidos recorrem a `Unknown` ou `0`.

| Placeholder | Valor |
| --- | --- |
| `%inviter.mention%`, `%inviter.username%`, `%inviter.id%`, `%inviter.avatar%` | O convidador creditado |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | A contagem do convidador |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%`, `%invite.fake%` | O convite que foi usado |
| `%user.joincount%`, `%user.leavecount%` | Quantas vezes este membro entrou e saiu |
| `%server.members.ordinal%` | A contagem de membros como 1º, 2º, 1.204º |
| `%user.joined.R%`, `%user.created.F%` e os demais estilos de data do Discord t, T, d, D, f, F, R | Datas de entrada e criação da conta como carimbos de data ao vivo |

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado). Todos os comandos também existem em `/invites`.

| Comando | Atalhos | Requer | Função |
| --- | --- | --- | --- |
| `invites [@user]` | | Ninguém | O total de um membro com o detalhamento de regulares, saídas, falsos e bônus, e a posição no ranking |
| `whoinvited [@user]` | `invitedby` | Ninguém | Quem convidou um membro, o código, e se a entrada foi marcada |
| `invitedusers [@user]` | `userinvites` | Ninguém | Todos os convidados por um membro, com datas de entrada e marcações |
| `invitedbycode <code>` | | Ninguém | Todos que entraram por um código |
| `invitedbylabel <label>` | | Ninguém | Todos que entraram por um código com rótulo |
| `inviteleaderboard [AllTime/Daily/Weekly/Monthly] [@role]` | `inviteslb` | Ninguém | O ranking de um período, opcionalmente de um só cargo |
| `invitestats [range]` | `growthstats` | Ninguém | Entradas, saídas, saldo, retenção, entradas falsas, origens, principais convidadores e códigos |
| `invitecodes [@user]` | `mycodes` | Ninguém | Os códigos de convite de um membro e seus usos |
| `invitelink` | `findlink`, `mylink` | Ninguém | Seu link permanente pessoal, criado se você ainda não tiver um |
| `addinvites`, `removeinvites`, `addbonusinvites`, `removebonusinvites`, `addfakeinvites`, `removefakeinvites <@user> <amount>` | | Gerenciar Servidor | Ajusta a contagem de um membro |
| `resetinvites <@user>` ou `resetinvites Server` ou `resetinvites LeftMembers` | | Gerenciar Servidor; Administrador para redefinição em todo o servidor | Redefine contagens |
| `syncinvites [@user]` | | Gerenciar Servidor | Importa os usos do Discord |
| `deleteinvite <code>` | `delinvite` | Gerenciar Servidor | Exclui um código |
| `purgeinvites [maxUses] [#channel]` | | Gerenciar Servidor | Exclui todos os códigos sem rótulo usados no máximo essa quantidade de vezes |
| `inviteblacklist <@user or @role>` | `invbl` | Gerenciar Servidor | Ativa ou desativa se alguém pode ganhar crédito |
| `invitehide <@user>` | `invhide` | Gerenciar Servidor | Ativa ou desativa se alguém aparece nos rankings |
| `inviteexclusions` | | Gerenciar Servidor | Lista as listas negras e os membros ocultos |
| `invitelabelset <code> <label>`, `invitelabelrole <code> [@role]`, `invitelabelremove <code>`, `invitelabels` | | Gerenciar Servidor | Gerencia os rótulos |
| `inviteexport [range]`, `invitedexport [@user]` | | Gerenciar Servidor | Exportações em CSV |
| `invitemassban <@user> [reason]`, `invitemassbancode <code> [reason]` | | Banir Membros | Bana todos que ainda estão aqui e foram convidados por um membro ou por um código, após confirmação |
| `invitesettings`, `toggleinvitetracking`, `toggleremoveinviteonleave`, `togglecountrejoins`, `togglefakenoavatar`, `setminaccountage <days>`, `invitelinkchannel [#channel]`, `invitelogchannel [#channel]` | | Gerenciar Servidor | Configurações |

## Dicas e cuidados

- Membros que entraram antes de o rastreamento ser ativado, ou enquanto o bot estava offline, não têm registro de entrada. Execute **Importar usos do Discord** uma vez para semear os totais regulares com a contagem do próprio Discord.
- Entradas falsas nunca reduzem um total quando o membro sai; apenas as regulares viram convites de saída.
- Um membro que sai e volta recebe um novo registro de entrada. Com **Contar reentradas** ativado, o convidador ganha novamente um convite regular, o que anula o convite de saída anterior.
- A retenção no ranking conta apenas as entradas que o bot observou, então começa em 100% e se estabiliza conforme o histórico cresce.
- Cargos de estatísticas podem recompensar contagens de convites, e os painéis ao vivo podem fixar o ranking de convites em um canal.

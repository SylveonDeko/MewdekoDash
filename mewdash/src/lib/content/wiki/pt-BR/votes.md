---
title: Votos
slug: votes
summary: Recompense os membros que votam no seu servidor no top.gg com uma mensagem de agradecimento, uma contagem de votos e cargos temporários ou permanentes.
icon: fa-thumbs-up
category: Community
dashboard: /dashboard/votes
module: Votes
tags: [votes, top.gg, vote rewards, vote roles, webhook, vote password, leaderboard, votos, recompensas de voto, cargos de voto, senha de voto, ranking]
related: [administration, xp]
---

## O que ele faz

Este não é um recurso de enquetes. Votos acompanha os votos que o seu servidor recebe no top.gg e recompensa as pessoas que os fazem. Quando o top.gg informa ao Mewdeko que alguém votou, o bot registra o voto, publica um agradecimento no seu canal de votos com o total acumulado daquele membro e entrega os cargos que você configurou como recompensas de voto.

Do ponto de vista do membro: ele vota no servidor no top.gg, e então uma mensagem aparece no canal de votos mencionando-o e mostrando quantas vezes ele já votou. Se você configurou cargos de voto, ele os recebe ao mesmo tempo, permanentemente ou por um período definido.

Do ponto de vista da equipe: você define um canal de votos, uma senha do webhook, uma mensagem personalizada opcional e até dez cargos de recompensa. Depois disso, o bot trata cada voto sozinho. `votes` e `votesleaderboard` permitem que qualquer pessoa consulte as contagens.

A ligação entre o top.gg e o seu servidor é a senha de voto. O top.gg a envia no cabeçalho Authorization da chamada do webhook, e o Mewdeko compara esse cabeçalho com a senha armazenada para cada servidor, para descobrir a qual servidor o voto pertence.

## Por que você usaria

- Você lista seu servidor no top.gg e quer um agradecimento visível toda vez que alguém votar.
- Você quer dar aos votantes um cargo de "Votante", ou um cargo de benefício temporário que expira após doze horas.
- Você quer um ranking mensal de votantes para rodar uma recompensa de "maior votante".
- Você quer que os membros possam conferir a própria contagem de votos sem pedir à equipe.

## Como um voto é processado

1. O top.gg envia uma requisição ao endpoint de webhook `/votes/` do bot, com o ID do Discord do votante e a sua senha no cabeçalho Authorization.
2. O bot encontra o servidor cuja senha de voto armazenada corresponde. Se nenhum corresponder, o voto é descartado.
3. O voto é salvo com o ID do votante e a hora.
4. Se um canal de votos estiver definido, o bot publica a mensagem de agradecimento ali. Sem canal de votos, nada é publicado e nenhum cargo é dado.
5. Cada cargo de voto é adicionado ao membro. Cargos com temporizador são removidos quando o temporizador acaba, usando o mesmo sistema de cargos temporários dos silenciamentos.

> [!WARNING]
> A senha é a única coisa que liga um voto ao seu servidor. Quem a conhecer pode enviar votos falsos. Nunca a cole em um canal público; o bot a define por meio de um formulário privado por esse motivo.

## A mensagem de agradecimento

Por padrão, o bot envia uma menção ao votante mais um embed intitulado "Thanks for voting for <server>", uma linha com a contagem total de votos dele e o avatar dele como miniatura.

Você pode substituir isso pelo seu próprio texto ou embed usando `votemessage` ou a caixa **Anúncio de voto personalizado** no painel. O texto passa pelo interpretador de embeds, então tudo o que o criador de embeds gera funciona. Defina como `-` no comando, ou limpe a caixa no painel, para voltar ao padrão.

### Placeholders

A mensagem personalizada aceita o conjunto geral de placeholders (de usuário, servidor, canal, bot e tempo, da página de placeholders) mais dois específicos de votos.

| Placeholder | Valor |
| --- | --- |
| `%votestotalcount%` | Quantas vezes este membro votou no total |
| `%votesmonthcount%` | Quantas vezes ele votou no mês do calendário atual |
| `%user.mention%`, `%user.name%`, `%user.id%`, `%user.avatar%` | O votante |
| `%server.name%`, `%server.id%`, `%server.icon%`, `%server.members%` | O seu servidor |

> [!EXAMPLE]
> `Thanks %user.mention% for voting! That is vote number %votestotalcount% (%votesmonthcount% this month).`

Executar `votemessage` sem texto mostra uma prévia da mensagem atual como ficaria para você, usando as suas próprias contagens de votos.

## Cargos de voto

Um cargo de voto é dado a cada votante. Cada cargo tem uma duração opcional em segundos; `0` significa que o cargo é permanente.

- Até dez cargos de voto por servidor.
- O cargo `@everyone` não pode ser adicionado.
- Um cargo não pode ser adicionado duas vezes; use `voteroleedit` para mudar a duração dele.
- Cargos temporários são removidos automaticamente quando a duração passa.
- Se o bot não conseguir atribuir um cargo (por exemplo, o cargo está acima do cargo mais alto do bot), ele ignora esse cargo silenciosamente.

## Contagens de votos e ranking

`votes` mostra os votos de um membro no mês e no total, com o avatar dele. `votesleaderboard` classifica todos do servidor pelo total de votos, doze por página. Passe `true` para classificar apenas pelos votos deste mês. Os números de "mês" comparam o mês do calendário, não os últimos trinta dias.

## Configurações

A página Votos tem três abas: **Configuração**, **Cargos de voto** e **Estatísticas**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Canal de anúncio de votos | nenhum | Onde as mensagens de agradecimento são publicadas. Nada acontece sem ele |
| Senha da API (para webhooks) | nenhum | O segredo que o top.gg deve enviar no cabeçalho Authorization |
| Anúncio de voto personalizado | embed padrão | Sua própria mensagem, com os placeholders acima. Vazio significa o padrão |
| Cargo a conceder | nenhum | Um cargo adicionado a todos os votantes (aba Cargos de voto) |
| Duração (segundos, 0 para permanente) | 0 | Por quanto tempo um cargo de voto dura antes de ser removido |

A aba **Estatísticas** mostra o total de votos, o número de cargos de voto, a contagem do maior votante e um ranking dos dez primeiros.

## Passo a passo da configuração

1. Abra **Votos** no painel e permaneça em **Configuração**.
2. Escolha um **Canal de anúncio de votos**. Sem ele, os votos são registrados, mas nada é publicado e nenhum cargo é dado.
3. Digite uma **Senha da API**. Torne-a longa e aleatória; trate-a como uma chave de API.
4. Opcionalmente, escreva um **Anúncio de voto personalizado** usando os placeholders acima e depois clique em **Salvar configuração**.
5. Na página do seu servidor no top.gg, abra a seção de webhooks. Defina a URL do webhook como o endpoint `/votes/` do seu bot e o valor de Authorization como a mesma senha.
6. Em **Cargos de voto**, escolha um **Cargo a conceder** e uma **Duração**, depois clique em **Adicionar cargo de voto**. Repita para até dez cargos.
7. Garanta que o cargo do bot esteja acima de todos os cargos de voto na lista de cargos.
8. Use o botão de webhook de teste do top.gg, ou aguarde um voto real, e confira o canal de votos.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `votechannel <#channel>` | | Gerenciar Servidor | Define o canal das mensagens de agradecimento |
| `votemessage [text]` | `votemsg` | Gerenciar Servidor | Visualiza, define ou redefine (`-`) a mensagem personalizada |
| `votepassword` | `votepass` | Gerenciar Servidor | Define a senha do webhook por meio de um formulário privado |
| `voteroleadd <@role> [time]` | `vra` | Gerenciar Servidor | Adiciona um cargo de voto, opcionalmente com tempo, por exemplo `voteroleadd @Voter 12h` |
| `voteroleedit <@role> <time>` | `vre` | Gerenciar Servidor | Altera por quanto tempo um cargo de voto dura |
| `voteroleremove <@role>` | `vrr` | Gerenciar Servidor | Remove um cargo de voto |
| `voteroleslist` | `vrl` | Gerenciar Servidor | Lista os cargos de voto e suas durações |
| `voterolesclear` | `vrc` | Gerenciar Servidor | Remove todos os cargos de voto, após confirmação |
| `votes [@user]` | | Ninguém | Mostra os votos mensais e totais de um membro |
| `votesleaderboard [true]` | `voteslb` | Ninguém | Classifica os votantes pelo total, ou pelo mês com `true` |

Os mesmos comandos existem como comandos de barra em `/votes`.

## Dicas e armadilhas

- Só há suporte para votos de servidor no top.gg. Não há integração com outras listas de bots, e este recurso não cria enquetes.
- Sem canal de votos, não há mensagem nem cargos, embora o voto ainda seja contado.
- O bot precisa de Gerenciar Cargos, e o cargo dele deve estar acima de todos os cargos de voto, ou as recompensas de cargo falham silenciosamente.
- Cargos de voto temporários usam o mesmo sistema de cargos temporários dos silenciamentos temporários e aparecem no registro de auditoria com o motivo "Vote Role".
- `voteroleedit` procura o cargo apenas pelo ID, então use-o somente para cargos que você realmente adicionou neste servidor.
- Mudar a senha não invalida votos antigos, mas o top.gg deixará de corresponder até que você atualize o cabeçalho também do lado deles.

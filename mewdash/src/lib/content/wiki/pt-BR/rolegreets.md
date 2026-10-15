---
title: Boas-vindas por Cargo
slug: rolegreets
summary: Envie uma mensagem personalizada a um canal sempre que um membro receber um cargo específico, com placeholders, embeds, webhooks e exclusão automática.
icon: fa-user
category: Actions
dashboard: /dashboard/rolegreets
module: RoleGreets
tags: [role greet, role greets, welcome, role message, role announcement, verification welcome, webhook greet, boas-vindas por cargo, boas-vindas, mensagem de cargo, anúncio de cargo, boas-vindas de verificação, boas-vindas por webhook]
related: [multigreets, embedbuilder, administration]
---

## O que ele faz

Uma boas-vindas por cargo é uma mensagem que o bot publica quando um membro recebe um cargo. A equipe escolhe um cargo e um canal, escreve a mensagem, e a partir daí, toda vez que esse cargo for adicionado a alguém, o bot publica a mensagem ali. A mensagem padrão é `Welcome %user.mention%!`.

A mensagem passa pelo interpretador de embeds, então pode ser texto simples, um embed completo ou um embed com botões criado no editor do painel. Os placeholders preenchem o nome do membro, o avatar, a data de entrada e os detalhes do servidor. Cada boas-vindas pode ser publicada por meio de um webhook, com seu próprio nome e avatar, e pode se apagar sozinha após um número de segundos definido.

As boas-vindas são separadas por cargo e por canal. Um cargo pode ter até dez boas-vindas, cada uma em um canal diferente ou com uma mensagem diferente, e uma boas-vindas pode ser desativada sem ser excluída.

## Por que você usaria

- Dê as boas-vindas aos membros no chat principal somente depois que eles passarem na verificação e receberem o cargo Verificado.
- Anuncie novos boosters em um canal de agradecimento quando o cargo de booster aparecer.
- Avise alguém que acabou de escolher um cargo de jogo onde ficam os canais dele.
- Publique uma lista de integração da equipe no canal da equipe quando um cargo de moderador for dado.
- Dê as boas-vindas a membros adicionados a um cargo de sorteio ou evento com as regras daquele evento.

## Como uma boas-vindas é disparada

O bot observa as atualizações dos membros e compara os cargos antes e depois. Para cada cargo que foi adicionado, ele procura as boas-vindas desse cargo e publica cada uma delas. Cargos removidos nunca disparam nada. Bots são ignorados, a menos que **Dar boas-vindas a bots** esteja ativado naquela boas-vindas, e uma boas-vindas desativada é ignorada.

Se o canal não existir mais, a boas-vindas se apaga sozinha. Se uma boas-vindas com webhook falhar porque o webhook foi excluído ou o bot perdeu a permissão, ela é desativada, e não removida, para que você possa corrigi-la e reativá-la.

Com um webhook definido, a mensagem é enviada com o nome e o avatar do webhook. A exclusão automática continua funcionando: o bot busca a mensagem que acabou de enviar e a remove após o atraso.

## Placeholders

As boas-vindas por cargo aceitam os grupos de placeholders de usuário, servidor e bot. Placeholders de canal não estão disponíveis.

| Placeholder | Valor |
| --- | --- |
| `%user.mention%`, `%user%` | Menção ao membro que recebeu o cargo |
| `%user.name%`, `%username%` | O nome de usuário dele |
| `%user.fullname%` | Nome de usuário com tag |
| `%user.avatar%` | URL do avatar |
| `%user.banner%` | URL do banner |
| `%user.id%` | ID de usuário |
| `%user.created_date%`, `%user.created_time%` | Data e hora de criação da conta |
| `%user.joined_date%`, `%user.joined_time%` | Data e hora de entrada no servidor |
| `%server.name%`, `%server%` | Nome do servidor |
| `%server.members%` | Contagem de membros em cache |
| `%server.icon%`, `%server.banner%` | URLs do ícone e do banner do servidor |
| `%server.boostlevel%`, `%server.boostcount%` | Nível e quantidade de boosts |
| `%server.time%`, `%time.day%` | Hora do servidor e dia da semana |
| `%bot.name%`, `%bot.avatar%`, `%bot.id%` | Nome, avatar e ID do bot |

Quando o rastreamento de convites está ativado no servidor, os placeholders de quem convidou e de convite do MultiGreets (`%inviter.username%`, `%inviter.mention%`, `%inviter.count%`, `%invite.code%`, `%invite.label%` e os demais) também são preenchidos com base em quem convidou o membro. Se quem convidou não for conhecido, eles mostram `Unknown`.

> [!EXAMPLE]
> `Welcome to the team, %user.mention%! You are member number %server.members%. Check the pins in this channel first.`

## Configurações

A página Boas-vindas por Cargo tem um formulário **Adicionar Novas Boas-vindas por Cargo** no topo e um cartão para cada boas-vindas abaixo dele.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Cargo | nenhum | O cargo que dispara a boas-vindas |
| Canal | nenhum | Onde a mensagem é publicada |
| Mensagem | `Welcome %user.mention%!` | Abre o editor de embed |
| Tempo de Exclusão (segundos, 0 para nunca) | 0 | Atraso da exclusão automática |
| URL do webhook (opcional) | nenhum | Publica por meio de um webhook em vez do bot |
| Dar boas-vindas a bots | desligado | Também dá boas-vindas a contas de bots que recebem o cargo |
| Ativado | ligado | Alternância no cartão; boas-vindas desativadas não fazem nada |

## Passo a passo da configuração

1. Abra **Boas-vindas por Cargo** no painel.
2. Em **Adicionar Novas Boas-vindas por Cargo**, escolha o **Cargo** e o **Canal**, depois clique em **Adicionar Boas-vindas por Cargo**.
3. No novo cartão, clique na caixa da mensagem para abrir o editor e escreva sua saudação com os placeholders acima.
4. Defina o **Tempo de Exclusão** se o canal precisar se manter organizado, e cole uma **URL do webhook** se quiser um nome e avatar personalizados.
5. Salve o cartão, depois dê o cargo a uma conta de teste e confira o canal.
6. Use a alternância no cartão para pausar uma boas-vindas, ou o botão de excluir para removê-la.

> [!TIP]
> No Discord, `rolegreetmessage 1` sem texto mostra a mensagem atual e oferece um botão **Prévia** que a renderiza com os seus próprios dados.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado). As boas-vindas são numeradas pela posição em `rolegreetlist`.

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `rolegreetadd <@role> [#channel]` | `rgadd`, `rga` | Administrador | Adiciona uma boas-vindas para um cargo, no canal atual se nenhum for informado |
| `rolegreetlist` | `rglist`, `rgl` | Administrador | Percorre todas as boas-vindas com suas configurações |
| `rolegreetmessage <id> [message]` | `rgmsg`, `rgm` | Administrador | Define a mensagem, ou a mostra e visualiza sem texto |
| `rolegreetremove <id or @role>` | `rgrem`, `rgrm`, `rgr` | Administrador | Exclui uma boas-vindas pelo número, ou todas as boas-vindas de um cargo após confirmação |
| `rolegreetdelete <id> <time or seconds>` | `rgdel`, `rgd` | Administrador | Atraso da exclusão automática, por exemplo `30s` ou `30`; `0` desativa |
| `rolegreetdisable <id> <true/false>` | `rgdisable`, `rgdis` | Administrador | Desativa ou reativa uma boas-vindas |
| `rolegreetgreetbots <id> <true/false>` | `rolegreetbots`, `rggb` | Administrador | Define se bots disparam a boas-vindas |
| `rolegreetwebhook <id> [name] [avatar url]` | `rgwebhook`, `rghook`, `rgh` | Administrador | Cria um webhook no canal de boas-vindas com esse nome e avatar, ou o remove sem nome |

Os comandos de barra ficam em `/rolegreets` com as mesmas ações: `add`, `remove`, `removerole`, `message`, `delete`, `disable`, `greetbots`, `webhook` e `list`.

## Dicas e armadilhas

- O bot precisa de Enviar Mensagens e Incorporar Links no canal de boas-vindas, Gerenciar Mensagens nele para a exclusão automática, e Gerenciar Webhooks para criar um webhook com `rolegreetwebhook`.
- O limite é de dez boas-vindas por cargo, não por servidor. O comando de adicionar recusa a décima primeira.
- As boas-vindas disparam em qualquer adição de cargo, inclusive as de cargos por reação, recompensas de nível e de outros bots, então um cargo que é adicionado e removido com frequência vai lotar o canal.
- Se o interpretador de embeds não produzir nada, por exemplo uma mensagem composta só de espaços em branco, nada é enviado.
- `rolegreetremove` com um cargo remove todas as boas-vindas desse cargo após uma confirmação de sim ou não; com um número, remove apenas aquela, imediatamente.
- Os números mudam quando uma boas-vindas é removida. Execute `rolegreetlist` novamente antes de editar por número.
- As boas-vindas por cargo são separadas das boas-vindas de entrada da página MultiGreets. Use MultiGreets para quem entra no servidor e Boas-vindas por Cargo para os cargos recebidos depois.

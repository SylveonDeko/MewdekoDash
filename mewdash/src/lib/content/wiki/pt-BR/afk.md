---
title: Sistema AFK
slug: afk
summary: Permita que os membros se marquem como ausentes, expliquem a quem os menciona o motivo, e limpem o status automaticamente quando voltarem.
icon: fa-moon
category: Actions
dashboard: /dashboard/afk
module: Afk
tags: [afk, away, idle, status, brb, mention reply, timed afk, placeholders, ausente, inativo, volto já, resposta a menção, afk temporizado]
related: [utility, administration]
---

## O que ele faz

Um membro executa `afk` com uma mensagem opcional. A partir daí, sempre que alguém o menciona, o bot responde naquele canal com a mensagem e há quanto tempo ele está ausente. Quando o membro volta, o status é limpo, um breve aviso de "bem-vindo de volta" é publicado e apagado após cinco segundos, e o apelido é restaurado.

Enquanto um membro está ausente, o bot também tenta renomeá-lo para `[AFK] name`, cortado para caber no limite de apelido do Discord, para que o status fique visível na lista de membros.

Executar `afk` sem mensagem alterna o estado: se você não estiver ausente, ele ativa o AFK com uma mensagem em branco, e se estiver, ele desativa.

## Por que você usaria

- Membros em servidores movimentados deixam de ser mencionados repetidamente por pessoas que não viram quando eles disseram "volto já".
- A equipe consegue ver de relance quem está por perto e quem não está.
- O AFK temporizado cobre "volto em duas horas" sem que ninguém precise se lembrar de limpar o status.

## Como um status termina

O **Tipo de AFK** decide o que o bot considera como voltar. É a configuração mais importante da página.

| Tipo | O status é limpo quando |
| --- | --- |
| Autodesativar | Somente quando o membro executa `afk` novamente, ou a equipe o remove. Nada automático. |
| Ao enviar mensagem | O membro envia uma mensagem em qualquer lugar do servidor. |
| Ao digitar | O membro começa a digitar em qualquer canal. |
| Qualquer um | Uma mensagem ou digitação, o que acontecer primeiro. |

O **Tempo limite de AFK** é um período de tolerância contado a partir do momento em que o status foi definido. Dentro dessa janela, digitar ou enviar mensagens não limpa o status, o que impede que a própria mensagem "afk, volto já" encerre o AFK imediatamente. O padrão é 0, ou seja, sem período de tolerância; defina-o com `afktimeout` ou na aba **Configurações avançadas** do painel.

O AFK temporizado é diferente: ele dura até o cronômetro acabar, independentemente do tipo. Falar no meio do caminho não o encerra. Quando o tempo acaba, o status é limpo e o apelido restaurado, sem aviso no canal.

Editar uma mensagem em até cinco minutos após publicá-la conta como enviar uma nova.

## A resposta a uma menção

Quando alguém menciona um membro ausente, o bot verifica até cinco usuários mencionados por mensagem, ignora bots e automenções, ignora mensagens que começam com o prefixo de comando e pula os canais da lista de desativados. Para cada membro ausente que encontrar, publica uma resposta.

Por padrão, a resposta é um embed: a linha do autor diz "usuário está ausente no momento" com o avatar dele, a descrição é a mensagem de AFK e o rodapé mostra há quanto tempo ele está ausente. Se o bot estiver configurado para mostrar um botão de convite, ele é anexado.

Você pode substituir isso pela sua própria mensagem ou embed usando `customafkmessage`, ou o editor **Mensagem de AFK em embed personalizado** no painel. O texto passa pelo interpretador de embeds, então tudo o que o criador de embeds gera funciona. Defina como `-` para voltar ao padrão.

### Placeholders

Estes são substituídos dentro de uma mensagem de AFK personalizada. Os placeholders gerais da página de placeholders não estão disponíveis aqui; apenas este conjunto está.

| Placeholder | Valor |
| --- | --- |
| `%afk.message%` | A mensagem de AFK, com menções neutralizadas e cortada no tamanho máximo |
| `%afk.user%` | O nome de usuário do membro ausente |
| `%afk.user.mention%` | Uma menção ao membro ausente |
| `%afk.user.avatar%` | A URL do avatar do membro ausente |
| `%afk.user.id%` | O ID de usuário do membro ausente |
| `%afk.triggeruser%` | Nome de usuário de quem o mencionou |
| `%afk.triggeruser.mention%` | Uma menção a quem o mencionou |
| `%afk.triggeruser.avatar%` | URL do avatar de quem o mencionou |
| `%afk.triggeruser.id%` | ID de usuário de quem o mencionou |
| `%afk.time%` | Há quanto tempo ele está ausente, em palavras como "2 horas" |

> [!EXAMPLE]
> Uma resposta em texto simples: `%afk.user.mention% is away (%afk.time%): %afk.message%`

## Configurações

Todas estas ficam na página AFK, nas abas **Configurações básicas** e **Configurações avançadas**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Tempo de exclusão automática | 0 (nunca) | Segundos antes de a resposta do bot a uma menção se apagar sozinha |
| Tamanho máximo da mensagem | 128 | A mensagem de AFK mais longa que um membro pode definir, de 1 a 4096; mensagens maiores são rejeitadas |
| Tipo de remoção do AFK | Autodesativar | Um dos quatro tipos acima |
| Tempo limite de AFK | 0 (nenhum) | O período de tolerância após definir o AFK, até duas horas |
| Canais desativados | nenhum | Canais onde mencionar um membro ausente não gera resposta |
| Mensagem de AFK em embed personalizado | embed padrão | Sua própria resposta, com os placeholders acima |

> [!TIP]
> Defina a exclusão automática para cerca de trinta segundos. Quem mencionou vê a resposta, e o canal não fica cheio de avisos de AFK antigos.

A aba **Gerenciamento de usuários** lista todos os membros que estão ausentes no momento e permite que a equipe limpe o status de uma ou várias pessoas de uma vez.

## Passo a passo da configuração

1. Abra **Sistema AFK** no painel.
2. Escolha um **Tipo de remoção do AFK**. "Ao enviar mensagem" é o padrão mais seguro; "Qualquer um" é o mais prático.
3. Defina **Tempo de exclusão automática** como 30. Deixe **Tamanho máximo da mensagem** em 128, a menos que queira status mais longos.
4. Em **Configurações avançadas**, adicione canais de comandos do bot e canais de anúncios em **Canais desativados**.
5. Opcionalmente, crie uma resposta personalizada no editor de embed usando os placeholders acima.
6. Teste: execute `afk testing`, mencione a si mesmo a partir de outra conta, depois envie uma mensagem e observe o status ser limpo.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `afk [message]` | | Ninguém | Define sua mensagem de AFK, ou alterna o AFK ligado e desligado sem mensagem |
| `timedafk <time> <message>` | `tafk` | Ninguém | AFK que termina sozinho, por exemplo `timedafk 2h dinner` |
| `getactiveafks` | `activeafks` | Ninguém | Lista todos que estão em AFK agora |
| `afkview [@user]` | `viewafk` | Gerenciar Mensagens | Mostra a mensagem de AFK atual de alguém |
| `afkremove @user...` | `afkrm` | Gerenciar Mensagens | Limpa o status de um ou mais membros |
| `afkdel [seconds]` | `afkdelete` | Gerenciar Servidor | Mostra ou define a exclusão automática da resposta |
| `afklength <number>` | `maxafklength` | Administrador | Limita o tamanho da mensagem de AFK |
| `afktype <type>` | | Administrador | `selfdisable`, `onmessage`, `ontype` ou `either` |
| `afktimeout <time>` | | Administrador | Define o período de tolerância, por exemplo `30s` |
| `afkdisable #channel...` | | Gerenciar Canais | Adiciona canais à lista sem resposta |
| `afkundisable #channel...` | | Gerenciar Canais | Remove canais da lista sem resposta |
| `afkdisabledlist` | | Gerenciar Canais | Mostra a lista sem resposta |
| `customafkmessage <text>` | `afkmessage` | Administrador | Define a resposta personalizada, ou `-` para redefinir |

## Dicas e armadilhas

- Não há comando para limpar apenas o próprio status. Execute `afk` novamente sem mensagem, ou aguarde a regra do tipo limpá-lo.
- Alterar o apelido exige que o cargo do bot esteja acima do cargo mais alto do membro e a permissão Gerenciar Apelidos. O apelido do dono do servidor nunca pode ser alterado por um bot, então o dono mantém o nome, mas o status continua funcionando.
- O serviço de AFK carrega seu cache pouco depois que o bot inicia. Até lá, os comandos respondem que o AFK ainda está iniciando.
- Menções dentro da mensagem de AFK são neutralizadas na resposta, para que os membros não usem o status para mencionar cargos ou todos.

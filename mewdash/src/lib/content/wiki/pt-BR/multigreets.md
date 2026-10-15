---
title: Boas-vindas
slug: multigreets
summary: Poste mensagens de boas-vindas em até trinta canais quando alguém entrar, além de despedidas clássicas, mensagens de boost e boas-vindas por DM.
icon: fa-bell
category: Actions
dashboard: /dashboard/multigreets
module: MultiGreets
tags: [greets, multigreets, welcome, join message, goodbye, bye, leave message, boost message, greet dm, webhook, placeholders, boas-vindas, mensagem de entrada, despedida, mensagem de saída, mensagem de boost, DM de boas-vindas]
related: [rolegreets, invites, administration]
---

## O que faz

Quando um membro entra, o bot posta uma mensagem de boas-vindas em cada canal que você configurou como uma boas-vindas. Cada uma tem sua própria mensagem, seu próprio temporizador de exclusão, sua própria identidade de webhook e sua própria opção para bots. Você pode executar todas ao mesmo tempo ou escolher uma aleatória a cada entrada.

As mensagens passam pelo analisador de embeds, então uma mensagem de boas-vindas pode ser texto simples, um embed completo com botões ou uma postagem de webhook com nome e avatar personalizados. Os placeholders preenchem o nome do membro, o nome do servidor, a contagem de membros e, se o rastreamento de convites estiver ativado, quem o convidou.

O sistema mais antigo de mensagem única ainda existe junto com este. Ele cuida da mensagem de despedida quando alguém sai, do anúncio de boost quando alguém dá boost e de uma DM de boas-vindas privada. Eles ficam no módulo de Administração e são descritos mais adiante.

## Por que usar

- Uma boas-vindas pública em `#general` e uma linha de log discreta em `#staff-joins` a partir da mesma entrada.
- Estilos de boas-vindas diferentes por canal, por exemplo um embed em um e um "personagem" de webhook em outro.
- Um conjunto de mensagens de boas-vindas em que cada novo membro recebe uma escolhida aleatoriamente.
- Uma boas-vindas curta que se exclui sozinha após um minuto para o canal não encher.
- Uma mensagem de despedida ou de boost sem configurar mais nada.

## Tipos de boas-vindas

O **Tipo de boas-vindas** vale para o servidor todo e decide o que acontece em uma entrada.

| Tipo | Rótulo no painel | O que acontece |
| --- | --- | --- |
| MultiGreet | Todas as Boas-vindas | Todas as boas-vindas ativadas disparam, na ordem em que foram adicionadas. Padrão. |
| RandomGreet | Boas-vindas Aleatória | Uma boas-vindas é escolhida aleatoriamente da lista e dispara. Boas-vindas desativadas podem ser escolhidas e depois puladas. |
| Off | Desativado | Nenhuma boas-vindas dispara. |

## O que uma boas-vindas guarda

Cada boas-vindas está ligada a um canal. Um canal pode ter até cinco boas-vindas, e um servidor pode ter trinta no total. As boas-vindas são numeradas pela posição na lista, e esse número é o que os comandos usam.

| Campo | Padrão | Significado |
| --- | --- | --- |
| Canal | o canal que você adicionou | Onde esta boas-vindas é postada |
| Mensagem | vazia | Modelo de texto ou embed. Uma boas-vindas vazia não envia nada. |
| Excluir após | 0 (nunca) | Segundos até a mensagem se excluir sozinha |
| Dar boas-vindas a bots | desativado | Se a boas-vindas dispara quando uma conta de bot entra |
| Webhook | nenhum | Posta por um webhook com nome e avatar personalizados em vez de como o bot |
| Ativado | sim | Boas-vindas desativadas são puladas sem serem removidas |

Se o canal for excluído, a boas-vindas é removida na próxima vez que tentar disparar. Se um webhook for excluído ou o bot perder a permissão de postar, a boas-vindas é desativada em vez de gerar erro a cada entrada.

## Placeholders

As boas-vindas são construídas com os conjuntos de placeholders de usuário, servidor e bot. Os placeholders de quem convidou só funcionam enquanto o rastreamento de convites estiver ativado na página Convites.

| Placeholder | Valor |
| --- | --- |
| `%user%`, `%user.mention%` | Menção ao novo membro |
| `%user.name%`, `%username%` | Nome de usuário |
| `%user.fullname%`, `%userfull%` | Tag completa |
| `%user.id%`, `%id%` | ID do usuário |
| `%user.avatar%`, `%useravatar%` | URL do avatar |
| `%user.banner%` | URL do banner |
| `%user.created_date%`, `%user.created_time%` | Quando a conta foi criada |
| `%user.joined_date%`, `%user.joined_time%` | Quando entrou neste servidor |
| `%server%`, `%server.name%` | Nome do servidor |
| `%server.id%`, `%sid%` | ID do servidor |
| `%server.icon%`, `%server.banner%` | URLs do ícone e do banner |
| `%server.members%`, `%members%` | Contagem de membros |
| `%server.boostlevel%`, `%server.boostcount%` | Nível de boost e número de boosts |
| `%server.time%`, `%server.timestamp.longdatetime%` | Hora atual, simples ou como um timestamp do Discord |
| `%bot.name%`, `%bot.id%`, `%bot.avatar%` | Sobre o próprio bot |
| `%inviter.username%`, `%inviter.mention%`, `%inviter.id%`, `%inviter.avatar%` | A pessoa cujo convite foi usado, ou `Unknown` |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | A contagem de convites de quem convidou |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%` | O convite que foi usado, seu rótulo e se foi um convite, o link personalizado ou um app |
| `%user.joincount%`, `%user.leavecount%` | Quantas vezes este membro entrou e saiu |
| `%server.members.ordinal%` | Contagem de membros como 1º, 2º, 1.204º |
| `%user.joined.R%`, `%user.created.F%` (e os estilos t, T, d, D, f) | Horários de entrada e de criação da conta como timestamps do Discord |

> [!EXAMPLE]
> `Welcome %user.mention% to %server%! You are member #%server.members%.`

A lista completa de placeholders de servidor, canal e bot está na página de placeholders. Os placeholders de canal não são preenchidos nas boas-vindas.

## Os comandos clássicos de boas-vindas, despedida e boost

Estes são anteriores às boas-vindas múltiplas e ficam no módulo de Administração. Cada um é uma única mensagem, armazenada na configuração do servidor, e ativada ou desativada a partir do canal em que você executa o comando.

| Mensagem | Dispara quando | Placeholders |
| --- | --- | --- |
| Bye | Um membro sai | Conjuntos de usuário, servidor e bot, além de placeholders de canal. `%user%` menciona o membro que saiu. |
| Boost | Um membro começa a dar boost, ou dá boost de novo | Conjuntos de usuário, canal, servidor, bot e gif |
| Greet DM | Um membro entra, enviada como mensagem privada | Conjuntos de usuário, canal, servidor, bot e gif |

Executar `bye` ou `boost` ativa ou desativa aquela mensagem e define o canal como aquele em que você digitou. `byedel` e `boostdel` definem um temporizador de autoexclusão em segundos; `boostdel` é limitado a 600. Os comandos de mensagem sem texto mostram a mensagem atual. `leavehook` envolve a mensagem de despedida em um webhook com nome e avatar personalizados, e `leavehook disable` o remove.

As DMs de boas-vindas exigem cuidado. O bot pede que você confirme antes de ativá-las, a menos que seja um bot verificado, porque DMs em massa de bots não verificados podem fazer o bot ser sinalizado. Qualquer membro pode bloquear essas DMs para si mesmo com `greetdmoptout`, ou com a opção **Bloquear DMs de boas-vindas** na própria página de perfil dele no painel.

Não existe um comando clássico de boas-vindas em canal. Use uma boas-vindas múltipla para as boas-vindas em canais.

## Configurações

Tudo fica na página Boas-vindas do painel.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Tipo de boas-vindas | Todas as Boas-vindas | Todas as Boas-vindas, Boas-vindas Aleatória ou Desativado |
| Adicionar Novas Boas-vindas | | Escolha um canal e depois clique em **Adicionar Boas-vindas** |
| Mensagem de boas-vindas | vazia | O construtor de embeds de uma boas-vindas. Suporta conteúdo, até dez embeds e componentes. |
| Excluir após | Nunca | Informe um tempo como `1m30s` ou `45s` |
| Webhook | Não configurado | Nome do webhook e URL de avatar opcional |
| Dar boas-vindas a bots | desativado | Dispara também para contas de bot |
| Ativado | sim | Desativa uma boas-vindas sem excluí-la |

As mensagens de despedida, de boost e de DM de boas-vindas não estão nesta página. Defina-as com os comandos acima.

## Passo a passo de configuração

1. Abra **Boas-vindas** no painel e deixe o **Tipo de boas-vindas** em **Todas as Boas-vindas**.
2. Em **Adicionar Novas Boas-vindas**, escolha o canal de boas-vindas e clique em **Adicionar Boas-vindas**.
3. No novo card, abra **Mensagem de boas-vindas** e monte sua mensagem usando os placeholders acima. Salve.
4. Opcionalmente, defina **Excluir após**, adicione um nome e um avatar de **Webhook** e ative **Dar boas-vindas a bots** se quiser que as entradas de bots sejam anunciadas.
5. Repita para os outros canais. Mude para **Boas-vindas Aleatória** se você adicionou várias ao mesmo canal e quer variedade.
6. Para uma mensagem de despedida, execute `byemsg Goodbye %user%, we will miss you` no canal desejado e depois `bye` para ativá-la.
7. Para uma mensagem de boost, execute `boostmsg Thanks for boosting, %user%!` e depois `boost`.
8. Teste com `byetest` e `boosttest`. As boas-vindas múltiplas têm uma prévia: execute `multigreetmessage 1` e pressione **Prévia**.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você tenha alterado). Os comandos de boas-vindas múltiplas também estão disponíveis como `/multigreets add`, `/multigreets remove` e assim por diante.

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `multigreetadd [#channel]` | `mgadd`, `mga` | Administrador | Adiciona uma boas-vindas para um canal, usando o atual por padrão |
| `multigreetremove <number or #channel>` | `mgrem`, `mgrm`, `mgr` | Administrador | Remove uma boas-vindas pelo número, ou todas as de um canal após confirmar |
| `multigreetmessage <number> [message]` | `mgmsg`, `mgm` | Administrador | Define o texto ou embed da boas-vindas; sem mensagem, oferece uma prévia ou o modelo bruto |
| `multigreetdelete <number> <time or seconds>` | `mgdel`, `mgd` | Administrador | Temporizador de autoexclusão, por exemplo `1m` ou `60`; `0` desativa |
| `multigreetdisable <number> <true or false>` | `mgdisable`, `mgdis` | Administrador | `true` desativa a boas-vindas, `false` a ativa |
| `multigreetgreetbots <number> <true or false>` | `multigreetbots`, `mggb` | Administrador | Se esta boas-vindas dispara para bots |
| `multigreetwebhook <number> [name] [avatar url]` | `mgwebhook`, `mghook`, `mgh` | Administrador | Cria um webhook para a boas-vindas; sem nome, o remove |
| `multigreettype <multigreet, randomgreet or off>` | `mgtype`, `mgt` | Administrador | Altera o tipo de boas-vindas do servidor todo |
| `multigreetlist` | `mglist`, `mgl` | Administrador | Percorre todas as boas-vindas com suas configurações |
| `bye` | | Gerenciar servidor | Alterna a mensagem de despedida neste canal |
| `byemsg [text]` | | Gerenciar servidor | Mostra ou define a mensagem de despedida |
| `byedel [seconds]` | | Gerenciar servidor | Temporizador de autoexclusão da despedida, padrão 30 |
| `byetest [@user]` | | Gerenciar servidor | Envia a mensagem de despedida como teste |
| `leavehook [#channel] [name] [image url] [text]` | `byehook` | Gerenciar servidor | Envia as despedidas por um webhook, ou `leavehook disable` |
| `boost` | | Gerenciar servidor | Alterna a mensagem de boost neste canal |
| `boostmsg [text]` | `boostmessage` | Gerenciar servidor | Mostra ou define a mensagem de boost |
| `boostdel [seconds]` | `boostdelete` | Gerenciar servidor | Temporizador de autoexclusão do boost, de 0 a 600, padrão 30 |
| `boosttest [@user]` | `testboost` | Gerenciar servidor | Envia a mensagem de boost como teste |
| `greetdm` | | Gerenciar servidor | Alterna a DM de boas-vindas |
| `greetdmmsg [text]` | | Gerenciar servidor | Mostra ou define o texto da DM de boas-vindas |
| `greetdmtest [@user]` | | Gerenciar servidor | Envia a DM de boas-vindas como teste |
| `greetdmoptout` | `gdmoptout` | Ninguém | Para de receber DMs de boas-vindas deste bot em qualquer lugar |

## Dicas e armadilhas

- `multigreetdelete` exige que o bot tenha Gerenciar mensagens, e `multigreetwebhook` e `leavehook` exigem Gerenciar webhooks.
- Os números das boas-vindas são posições na lista, então remover uma desloca os números de tudo que vem depois. Execute `multigreetlist` antes de editar.
- A opção `off` de `multigreettype`, `/multigreets type` e o botão **Desativado** do painel definem o mesmo tipo de boas-vindas, então qualquer um deles desliga o sistema sem excluir suas boas-vindas.
- Os placeholders de convite esperam até cinco segundos para a entrada ser atribuída antes de a boas-vindas sair, então quem convidou está certo mesmo quando várias pessoas entram ao mesmo tempo.
- A DM de boas-vindas só funciona se o membro permitir DMs de membros do servidor. DMs que falham são ignoradas.
- As Boas-vindas de Cargo são um recurso separado que dispara quando um cargo é dado, e não na entrada.

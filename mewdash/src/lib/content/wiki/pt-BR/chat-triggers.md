---
title: Gatilhos
slug: chat-triggers
summary: Respostas automáticas a mensagens, reações, comandos de barra e eventos do bot, com condições, custos, contadores, concessão de cargos e um conjunto completo de placeholders.
icon: fa-comments
category: Actions
dashboard: /dashboard/chat-triggers
module: ChatTriggers
tags: [chat triggers, triggers, autoresponder, custom commands, auto reply, reaction roles, regex, counters, placeholders, event triggers, gatilhos, resposta automática, comandos personalizados, cargos por reação, contadores, gatilhos de evento]
related: [administration, xp, currency, tickets, giveaways]
---

## O que faz

Um gatilho é um texto que o bot observa e uma resposta que ele envia quando o vê. Na forma mais simples, um membro digita `hello` e o bot responde `hi there`. A partir daí, um gatilho pode corresponder em qualquer parte da mensagem ou por expressão regular, responder com um embed, reagir com emoji, enviar a resposta por DM, excluir a mensagem do membro, conceder ou remover cargos, publicar uma cópia em outro canal ou webhook e executar um segundo gatilho quando terminar.

Gatilhos não precisam ser mensagens. O mesmo gatilho pode ser registrado como um comando de barra, de mensagem ou de contexto de usuário, disparar quando alguém adiciona ou remove uma reação específica, ou disparar em um evento do bot, como subir de nível, a entrada de um membro, o início de um boost, a abertura de um ticket ou a vitória em um sorteio.

Cada gatilho tem as próprias condições: um cooldown por usuário, canal ou servidor, um nível de XP necessário, um custo ou recompensa em moeda, horários e dias ativos, uma data de expiração, um limite de usos, uma idade mínima da conta ou tempo no servidor, e um contador que precisa estar dentro de um intervalo. Se uma condição falhar, o gatilho fica quieto ou mostra uma mensagem escrita por você. O testador do painel diz exatamente qual regra bloquearia uma mensagem de exemplo.

As respostas podem ler valores do restante do bot: o nível, o saldo, a reputação ou a contagem de mensagens do membro, o texto depois do gatilho, as pessoas que ele mencionou, a mensagem que ele respondeu, grupos de captura de uma regex e contadores do servidor inteiro que uma resposta pode ler e incrementar.

## Por que usar

- Responder automaticamente a perguntas comuns: `!rules` publica o embed de regras.
- Comandos divertidos que os membros podem usar sem depender do conjunto de comandos nativo do bot.
- Um gatilho estilo `daily` que paga moeda uma vez por usuário por dia usando um cooldown e uma recompensa.
- Uma palavra de "verificação" que concede um cargo e exclui a mensagem.
- Cargos por reação que dão um cargo quando alguém reage com um determinado emoji.
- Anúncios personalizados de subida de nível, boas-vindas ou boost, formatados do seu jeito, acionados pelo evento em vez de uma mensagem.
- Contadores contínuos como "dias desde o último incidente" que qualquer pessoa pode incrementar com uma palavra.

## Tipos de gatilho

Um gatilho tem um conjunto de tipos ativados. Um tipo controla o que pode acioná-lo. Mensagem vem ativado por padrão; os demais são ativados por gatilho com `chattriggervalidtype` ou pelos controles no painel.

| Tipo | Aciona quando |
| --- | --- |
| Message | Uma mensagem corresponde ao texto do gatilho |
| Interaction | Alguém executa o comando de barra, de mensagem ou de usuário registrado para ele |
| Button | Um botão cujo ID corresponde ao gatilho é pressionado |
| Reactions | Alguém adiciona o emoji do gatilho a uma mensagem |
| ReactionsRemoved | Alguém remove o emoji do gatilho de uma mensagem |
| Event | Um dos eventos do bot abaixo acontece |

### Correspondência de mensagens

Por padrão, a mensagem inteira, em minúsculas, deve ser igual ao gatilho. Duas opções flexibilizam isso:

- **Corresponder em qualquer parte da mensagem** (`ctca`): o gatilho deve aparecer como uma palavra inteira em algum ponto da mensagem.
- **Permitir mencionar alguém** (`ctat`): a mensagem pode começar com o gatilho seguido de um espaço e mais texto, que vira `%target%`.

Gatilhos de **expressão regular** (`addchattriggerregex`) comparam a mensagem com o padrão. Cada padrão tem 100 milissegundos; um que estoura o tempo é ignorado. Grupos de captura nomeados ou numerados ficam disponíveis na resposta como `%regex.1%` ou `%regex.name%`.

Um **requisito de prefixo** decide se a mensagem precisa começar com um prefixo antes de corresponder:

| Opção | Comportamento |
| --- | --- |
| Nenhum prefixo necessário | Corresponde ao texto puro (padrão) |
| Prefixo global | Deve começar com o prefixo global do bot |
| Prefixo do servidor ou global | Deve começar com o prefixo do servidor, recorrendo ao global |
| Prefixo do servidor, se houver | Deve começar com o prefixo do servidor; nunca corresponde se o servidor não tiver um |
| Um prefixo personalizado | Deve começar com o prefixo definido por `ctprefix` |

Se vários gatilhos corresponderem a uma mensagem, um deles é escolhido aleatoriamente. Mensagens de bots e webhooks são ignoradas, a menos que um gatilho tenha **Somente bots** (`ctallowbots`) ativado, e esse gatilho passa a responder apenas a mensagens de bots. O bot nunca responde às próprias mensagens.

### Gatilhos de interação

`setctintertype` registra o gatilho como um comando de aplicativo do tipo Slash, Message ou User. `setctintername` e `setctinterdesc` definem seu nome e descrição; os nomes devem seguir as regras de nomenclatura de comandos do Discord. `ctinterephemeral` faz a resposta ficar visível apenas para quem a executou. `ctintererrors` lista por que o registro falhou, como nomes duplicados ou subcomandos demais.

### Gatilhos de reação

`addreactiontrigger <emoji> <response>` cria um gatilho cujo texto é o emoji. Ative **Reação adicionada** ou **Reação removida** como seus tipos. A resposta é publicada no canal da mensagem que recebeu a reação, e as concessões de cargo usam o membro que reagiu (ou, para **Pessoas mencionadas**, as menções na mensagem reagida). Reações de bots são ignoradas.

### Gatilhos de evento

`ctevent <id> <event>` faz um gatilho disparar em um evento em vez de uma mensagem e ativa o tipo Event para ele. Eventos:

| Evento | Dispara para |
| --- | --- |
| XpLevelUp | Um membro sobe de nível |
| XpLevelDown | Um membro perde um nível |
| MemberJoin | Um membro entra |
| MemberLeave | Um membro sai |
| VoiceJoin | Um membro entra em um canal de voz |
| VoiceLeave | Um membro sai de um canal de voz |
| Boost | Um membro começa a impulsionar |
| BoostEnd | Um membro para de impulsionar |
| TicketOpened | Um ticket é aberto |
| TicketClosed | Um ticket é fechado |
| GiveawayWon | Um membro vence um sorteio |

A resposta vai para o canal definido com `cteventchannel`, ou para o canal onde o evento aconteceu, se nenhum estiver definido. Entradas, saídas, voz e boosts não têm um canal próprio, então esses gatilhos precisam de um canal explícito ou não fazem nada. Gatilhos de evento passam pelas mesmas condições e verificações de economia que os gatilhos de mensagem, e o membro a quem o evento se refere é tratado como o usuário para placeholders e concessão de cargos.

## Respostas

A resposta principal é o texto informado quando o gatilho é criado. Ela passa pelo analisador de embeds, então pode ser texto simples, um embed, vários embeds ou componentes criados no editor de embeds do painel. Respostas extras podem ser adicionadas com `ctaddresponse`, e o **Modo de resposta** decide quais são enviadas:

| Modo | Comportamento |
| --- | --- |
| Single | Sempre a primeira resposta (padrão) |
| Random | Uma escolhida aleatoriamente; repita uma linha para dar mais peso a ela |
| RoundRobin | Em ordem, uma por uso, compartilhada em todo o servidor |
| All | Todas as respostas, em ordem |

Opções de entrega, todas desativadas por padrão:

- **Responder à mensagem** (`ctreply`): envia a resposta como um reply do Discord.
- **Enviar a resposta por DM** (`ctdm`): envia a resposta ao membro em particular.
- **Excluir a mensagem que acionou** (`ctad`): remove o que o membro digitou.
- **Reagir à mensagem em vez disso** (`rtt`): coloca o emoji do gatilho na mensagem do membro em vez de na resposta. Não pode ser combinado com excluir.
- **Não enviar nenhuma mensagem** (`ctnr`): útil para gatilhos que só mexem em cargos.
- **Excluir a resposta após** (`ctdeleteafter`): segundos antes de a resposta do bot ser excluída; 0 a mantém.
- **Emoji para reagir** (`ctreact`): até seis emoji, adicionados um por segundo. Sem nenhum emoji, a lista é limpa.

### Crosspost

`ctcpch` publica uma cópia de cada resposta em outro canal do servidor. `ctcpwh` a publica por meio de uma URL de webhook, que pode estar em outro servidor. O crosspost acontece mesmo com **Não enviar nenhuma mensagem** ativado.

### Cargos

**Cargos a conceder** e **Cargos a remover** (`ctrgranttoggle`, `ctrremovetoggle`) são aplicados quando o gatilho dispara. Executar a alternância novamente para o mesmo cargo o remove da lista. **Aplicar esses cargos a** (`chattriggerrolegranttype`) escolhe o alvo:

| Alvo | Quem é afetado |
| --- | --- |
| Sender | O membro que acionou o gatilho (padrão) |
| Mentioned | Até cinco membros mencionados na mensagem |
| Both | Quem enviou mais até quatro membros mencionados |

Quando o alvo inclui menções, elas são removidas da mensagem antes da correspondência, então `verify @someone` ainda corresponde a um gatilho `verify`.

### Encadeamento

`ctchain <id> <nextId>` executa um segundo gatilho depois que o primeiro termina. O segundo é avaliado por conta própria, incluindo suas condições e custos. Uma cadeia para após cinco passos e nunca revisita um gatilho que já executou.

## Condições

Todas estas são verificadas antes de qualquer cobrança, envio ou contagem. Uma condição que falha significa que o gatilho simplesmente não dispara, exceto nas verificações de nível e moeda, que mostram a **Mensagem quando não puder usar**, se você a definiu com `ctreqmsg`.

| Condição | Comando | Padrão | Comportamento |
| --- | --- | --- | --- |
| Cooldown | `ctcooldown <id> <seconds> [scope]` | nenhum | Bloqueia disparos repetidos por esse número de segundos. O escopo é `User`, `Channel` ou `Guild` |
| Nível necessário | `ctreqlevel <id> <level>` | 0 | O nível de XP do membro deve ser pelo menos este |
| Custo | `ctcost <id> <amount>` | 0 | Moeda cobrada do membro; não dispara se ele não puder pagar |
| Recompensa | `ctreward <id> <amount>` | 0 | Moeda paga ao membro quando dispara |
| Recompensa de XP | `ctxpreward <id> <amount>` | 0 | XP concedido quando dispara |
| Horário ativo | `cttime <id> <HH:mm> <HH:mm> [days...]` | sempre | Só dispara dentro da janela, no fuso horário do servidor. Um fim antes do início vale durante a madrugada. Os dias são nomes ou 0 a 6, com domingo sendo 0 |
| Expiração | `ctexpiry <id> [duration]` | nunca | Para de disparar após a duração a partir de agora, por exemplo `7d` |
| Limite de usos | `ctmaxuses <id> <uses>` | ilimitado | Para após essa quantidade de disparos; 0 remove o limite |
| Idade mínima da conta | `ctminage <id> [duration]` | nenhuma | A conta deve ter pelo menos essa idade |
| Tempo mínimo no servidor | `ctminmember <id> [duration]` | nenhum | O membro deve ter entrado há pelo menos esse tempo |
| Intervalo do contador | `ctrequirecounter <id> <name> [min] [max]` | nenhum | O contador informado deve estar dentro do intervalo; `clear` como nome o remove |

O cooldown só começa depois que todas as outras condições passam, então uma tentativa bloqueada não o consome. O custo é cobrado antes de a recompensa ser paga, então um gatilho que cobra e paga nunca paga a quem não podia arcar com o custo. Os cooldowns de comando do servidor inteiro definidos com `cmdcd` também valem para gatilhos, por usuário, além do cooldown do próprio gatilho.

## Contadores

Contadores são números nomeados armazenados por servidor. Eles são criados na primeira vez que uma resposta os usa e podem ser lidos ou alterados em qualquer resposta:

| Placeholder | Efeito |
| --- | --- |
| `%counter:name%` | Mostra o contador |
| `%counter:name+%` | Soma um e mostra o novo valor |
| `%counter:name-%` | Subtrai um e mostra o novo valor |
| `%usercounter:name%` | Mostra o valor do próprio membro que acionou para esse nome |
| `%usercounter:name+%` | Soma um ao valor do membro |
| `%usercounter:name-%` | Subtrai um do valor do membro |

Os nomes têm até 64 letras, dígitos, sublinhados ou hifens e não diferenciam maiúsculas de minúsculas. `ctcounters` os lista, `ctcounterset` define um com um valor exato e `ctcounterdelete` o remove junto com todos os valores por usuário sob esse nome. A barra lateral do painel tem um painel de **Contadores** para o mesmo fim.

## Placeholders

Uma resposta pode usar o conjunto geral de placeholders (placeholders de usuário, servidor, canal, bot e horário da página de placeholders), os placeholders de gatilho e os placeholders que outros módulos contribuem. `ctplaceholders` lista os contribuídos em tempo real.

| Placeholder | Valor |
| --- | --- |
| `%target%` | Tudo que foi digitado depois do gatilho (requer **Permitir mencionar alguém** ou correspondência em qualquer parte) |
| `%targetuser%` | Menção à primeira pessoa mencionada na mensagem |
| `%targetuser.id%`, `%targetuser.name%`, `%targetuser.avatar%` | ID, nome de usuário e avatar dessa pessoa |
| `%targetusers%`, `%targetusers.id%` | Todos os mencionados, como menções ou IDs |
| `%replied.content%` | Conteúdo da mensagem que o membro respondeu |
| `%replied.author%`, `%replied.author.id%` | Autor dessa mensagem |
| `%usecount%` | Quantas vezes este gatilho foi acionado |
| `%regex.1%`, `%regex.name%` | Grupos de captura de um gatilho regex |
| `%img:tag%` | Uma imagem aleatória do Imgur para essa tag |
| `%rng%` | Um número aleatório do conjunto geral de placeholders |
| `%xp.level%`, `%xp.rank%`, `%xp.total%`, `%xp.current%`, `%xp.required%`, `%xp.remaining%`, `%xp.bonus%` | Estatísticas de XP do membro |
| `%targetuser.xp.level%`, `%targetuser.xp.rank%`, `%targetuser.xp.total%` | Estatísticas de XP da pessoa mencionada |
| `%currency.balance%`, `%currency.bank%`, `%currency.total%`, `%currency.emote%` | A moeda do membro |
| `%targetuser.currency.balance%`, `%targetuser.currency.bank%` | A moeda da pessoa mencionada |
| `%rep%`, `%rep.rank%`, `%targetuser.rep%`, `%targetuser.rep.rank%` | Reputação |
| `%messages%`, `%messages.channel%`, `%messages.server%`, `%targetuser.messages%` | Contagens de mensagens |
| `%invites%`, `%targetuser.invites%`, `%inviter%` | Contagens de convites e quem convidou o membro |
| `%targetuser.afk%` | A mensagem de AFK da pessoa mencionada |
| `%counter:name%` e afins | Contadores, como acima |

As menções dentro de `%target%` são neutralizadas, a menos que o próprio membro pudesse marcar todos.

> [!EXAMPLE]
> Gatilho `daily`, resposta `%user.mention% claimed today's bonus. Balance: %currency.balance%`, com `ctreward 12 100`, `ctcooldown 12 86400 User` e `ctreqmsg 12 Come back tomorrow.`

## O testador

`cttest <id> <sample message>` ou a caixa **Testar este gatilho** em um cartão de gatilho verifica se essa mensagem acionaria o gatilho como você, sem enviar, cobrar nem contar nada. Ele informa se o texto correspondeu e, se o gatilho não disparasse, qual regra o impede: desativado, somente bots, sem correspondência, uma entrada de permissão, uma substituição de permissão, expiração, cooldown, contador, limite de usos, horário ativo, idade da conta, tempo como membro, nível, saldo ou o cooldown de comando do servidor.

## Categorias e organização

`ctcategory <id> <name>` coloca um gatilho em uma categoria. `ctcategorytoggle <name> <true or false>` ativa ou desativa todos os gatilhos dela de uma vez, e a barra lateral do painel filtra por categoria. `cttoggle` pausa um único gatilho sem excluí-lo. `ctstats` mostra com que frequência um gatilho foi acionado e quem o acionou recentemente.

`ctsexport` baixa todos os gatilhos como um arquivo YAML e `ctsimport` carrega um a partir de um anexo ou URL. `ctsclear` exclui todos os gatilhos após confirmação.

## Configurações

Tudo é por gatilho. A página de Gatilhos tem um **Modo simples** com um formulário de **Configuração rápida** (texto do gatilho mais resposta) e um **Modo avançado** com **Criação de gatilho avançado**, onde você escolhe o **Tipo de padrão** (Padrão de texto normal ou Padrão de expressão regular), os tipos de gatilho, e pode testar uma regex antes de salvar.

Cada cartão de gatilho se expande para mostrar o **Texto do gatilho**, o editor da **Mensagem de resposta**, o testador e um acordeão de configurações agrupadas por tema:

| Grupo | Configurações |
| --- | --- |
| Quando corresponde | Requisito de prefixo, Prefixo personalizado, Corresponder em qualquer parte da mensagem, Permitir mencionar alguém, Somente o dono do bot |
| Como responde | Responder à mensagem, Enviar a resposta por DM, Excluir a mensagem que acionou, Reagir à mensagem em vez disso, Não enviar nenhuma mensagem, Emoji para reagir, Excluir a resposta após, Respostas extras, Quando há várias respostas |
| Cargos | Cargos a conceder, Cargos a remover, Aplicar esses cargos a |
| Limites | Cooldown (segundos), O cooldown vale para, Parar após este número de usos, Parar de acionar após, Idade mínima da conta (minutos), Tempo mínimo no servidor (minutos), Ativo apenas em certos horários com De, Até e Nestes dias |
| Custos e recompensas | Custa ao usuário, Paga ao usuário, Concede XP, Exige nível, Mensagem quando não puder usar |
| Requisito de contador | Nome do contador, No mínimo, No máximo |
| Acionar em um evento | Acionar quando, Responder em |
| Organização | Categoria, Depois executar o gatilho, Responder a bots em vez de pessoas |

A barra lateral lista as categorias, os **Contadores** e a lista de **Marcadores** em tempo real, e tem uma caixa de busca para gatilhos e respostas.

## Passo a passo de configuração

1. Abra **Gatilhos** no painel. No **Modo simples**, digite a palavra do gatilho e monte a resposta no editor, depois crie-o.
2. Expanda o novo cartão. Em **Quando corresponde**, ative **Corresponder em qualquer parte da mensagem** se a palavra deve funcionar no meio de uma frase.
3. Em **Como responde**, escolha se deve responder, enviar por DM ou excluir a mensagem do membro.
4. Em **Limites**, defina um cooldown para que não possa ser usado em spam.
5. Digite uma mensagem de exemplo em **Testar este gatilho** e pressione **Testar**. Corrija o que ele disser que está bloqueando.
6. Para um anúncio de subida de nível, crie um gatilho com qualquer texto, defina **Acionar quando** como "Membro sobe de nível", deixe **Responder em** vazio para publicar onde o membro estava conversando e use `%user.mention%` e `%xp.level%` na resposta.
7. Dê uma **Categoria** aos gatilhos relacionados para poder pausá-los juntos.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado). Os IDs dos gatilhos são mostrados por `listchattriggers`.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `addchattrigger <trigger> <response>` | `act`, `acr` | Administrador | Criar um gatilho; use aspas em gatilhos com várias palavras |
| `addchattriggerregex <pattern> <response>` | `actr` | Administrador | Criar um gatilho regex |
| `addreactiontrigger <emoji> <response>` | `addrt` | Administrador | Criar um gatilho de reação |
| `editchattrigger <id> <response>` | `ect` | Administrador | Substituir a resposta principal |
| `deletechattrigger <id>` | `dct` | Administrador | Excluir um gatilho |
| `listchattriggers` | `lct` | Administrador | Listar gatilhos com IDs |
| `listchattriggersgroup` | `lctg` | Administrador | Listar gatilhos agrupados por texto |
| `showchattrigger <id>` | `sct` | Administrador | Mostrar as configurações de um gatilho |
| `cttoggle <id>` | `chattriggertoggle` | Administrador | Pausar ou retomar um gatilho |
| `ctca <id>` | | Administrador | Alternar corresponder em qualquer parte |
| `ctat <id>` | | Administrador | Alternar permitir mencionar alguém |
| `ctdm <id>` | | Administrador | Alternar resposta por DM |
| `ctad <id>` | | Administrador | Alternar exclusão da mensagem que acionou |
| `rtt <id>` | `reactottrigger` | Administrador | Alternar reagir à mensagem em vez da resposta |
| `ctnr <id>` | `chattriggernoresponse` | Administrador | Alternar não enviar mensagem |
| `ctreply <id>` | `chattriggerreply` | Administrador | Alternar responder à mensagem |
| `ctdeleteafter <id> <seconds>` | `chattriggerdeleteafter` | Administrador | Excluir a resposta após um atraso |
| `ctreact <id> [emoji...]` | `ctr` | Administrador | Definir até seis reações, ou limpá-las |
| `ctaddresponse <id> <response>` | `chattriggeraddresponse` | Administrador | Adicionar uma resposta extra |
| `ctclearresponses <id>` | `chattriggerclearresponses` | Administrador | Remover respostas extras |
| `ctresponsemode <id> <mode>` | `chattriggerresponsemode` | Administrador | `Single`, `Random`, `RoundRobin` ou `All` |
| `ctprefixtype <id> <type>` | `chattriggersprefixtype` | Administrador | `None`, `Global`, `GuildOrGlobal`, `GuildOrNone` ou `Custom` |
| `ctprefix <id> <prefix>` | `chattriggersprefix` | Administrador | Definir o prefixo personalizado |
| `chattriggervalidtype <id> <type> <true or false>` | `ctvalidtype`, `ctvt` | Administrador | Ativar ou desativar um tipo de gatilho |
| `ctallowbots <id>` | `chattriggerallowbots` | Administrador | Alternar responder apenas a mensagens de bots |
| `ctrgranttoggle <id> @role` | `ctgt`, `ctgranttoggle` | Administrador | Alternar um cargo a conceder |
| `ctrremovetoggle <id> @role` | `ctrt`, `ctremovetoggle` | Administrador | Alternar um cargo a remover |
| `chattriggerrolegranttype <id> <type>` | `ctrolegranttype`, `ctrgt` | Administrador | `Sender`, `Mentioned` ou `Both` |
| `chattriggerscrosspostchannel <id> <#channel>` | `ctcpch`, `ctcpchannel`, `ctcrosspostchannel`, `ctcrosspostch` | Administrador | Fazer crosspost para um canal |
| `chattriggerscrosspostwebhook <id> <url>` | `ctcpwh`, `ctcpwebhook`, `ctcrosspostwebhook`, `ctcrosspostwh` | Administrador | Fazer crosspost por um webhook |
| `setctintertype <id> <type>` | `ctitype`, `ctintertype` | Administrador | `None`, `Slash`, `Message` ou `User` |
| `setctintername <id> <name>` | `ctiname`, `ctrealname` | Administrador | Nome do comando de aplicativo |
| `setctinterdesc <id> <description>` | `ctidesc`, `ctinterdesc` | Administrador | Descrição do comando de aplicativo |
| `ctinterephemeral <id> <true or false>` | `ctieph` | Administrador | Resposta de interação efêmera |
| `ctintererrors` | `ctierrors`, `ctie` | Administrador | Mostrar erros de registro de comandos |
| `ctevent <id> <event>` | `chattriggerevent` | Administrador | Disparar em um evento, ou `None` para parar |
| `cteventchannel <id> [#channel]` | `chattriggereventchannel` | Administrador | Canal para respostas de evento |
| `ctcooldown <id> <seconds> [scope]` | `chattriggercooldown` | Administrador | Cooldown por gatilho |
| `ctreqlevel <id> <level>` | `chattriggerrequiredlevel` | Administrador | Nível de XP necessário |
| `ctcost <id> <amount>` | `chattriggercost` | Administrador | Custo em moeda |
| `ctreward <id> <amount>` | `chattriggerreward` | Administrador | Recompensa em moeda |
| `ctxpreward <id> <amount>` | `chattriggerxpreward` | Administrador | Recompensa de XP |
| `ctreqmsg <id> [message]` | `chattriggerrequirementmessage` | Administrador | Mensagem quando um requisito falha |
| `cttime <id> <start> <end> [days...]` | `chattriggertime` | Administrador | Horário ativo, ou `cttime <id> clear` |
| `ctexpiry <id> [duration]` | `chattriggerexpiry` | Administrador | Expiração, ou nenhuma para limpar |
| `ctmaxuses <id> <uses>` | `chattriggermaxuses` | Administrador | Limite de usos, 0 para nenhum |
| `ctminage <id> [duration]` | `chattriggerminimumage` | Administrador | Idade mínima da conta |
| `ctminmember <id> [duration]` | `chattriggerminimummembership` | Administrador | Tempo mínimo no servidor |
| `ctrequirecounter <id> <name> [min] [max]` | `chattriggerrequirecounter` | Administrador | Requisito de intervalo do contador |
| `ctcounters` | `chattriggercounters` | Ninguém | Listar contadores |
| `ctcounterset <name> <value>` | `chattriggercounterset` | Administrador | Definir um contador |
| `ctcounterdelete <name>` | `chattriggercounterdelete` | Administrador | Excluir um contador |
| `ctplaceholders` | `chattriggerplaceholders` | Ninguém | Listar placeholders contribuídos |
| `ctcategory <id> [name]` | `chattriggercategory` | Administrador | Definir ou limpar uma categoria |
| `ctcategorytoggle <name> <true or false>` | `chattriggercategorytoggle` | Administrador | Ativar ou desativar uma categoria |
| `ctchain <id> <nextId>` | `chattriggerchain` | Administrador | Encadear a outro gatilho, 0 para limpar |
| `cttest <id> <sample>` | `chattriggertest` | Administrador | Simular uma mensagem de exemplo |
| `ctstats <id>` | `chattriggerstats` | Administrador | Número de disparos e usuários recentes |
| `ctsexport` | | Administrador | Exportar gatilhos como YAML |
| `ctsimport [url]` | | Administrador | Importar de uma URL ou anexo |
| `ctsmigrate` | `ctsconvert` | Administrador | Converter o formato antigo de embed, com backup |
| `ctsclear` | | Administrador | Excluir todos os gatilhos |
| `ctsreload` | | Dono do bot | Recarregar gatilhos do banco de dados |

## Dicas e armadilhas

- Os gatilhos são comparados com a mensagem em minúsculas, então o texto do gatilho na prática não diferencia maiúsculas de minúsculas.
- Um gatilho com **Corresponder em qualquer parte** desativado precisa ser a mensagem inteira. `hello there` não aciona um gatilho `hello`, a menos que você ative essa opção ou habilite a menção a alguém.
- A concessão de cargos exige Gerenciar Cargos e que o cargo do bot esteja acima dos cargos envolvidos. O comando que adiciona um cargo à lista também verifica se você pode gerenciá-lo.
- Gatilhos somente de bots nunca respondem a humanos, e gatilhos de humanos nunca respondem a bots; um único gatilho não pode fazer os dois.
- Os cooldowns ficam na memória e são redefinidos quando o bot reinicia. Limites de uso e expiração são armazenados e sobrevivem a reinicializações.
- A ordem do round robin é compartilhada por todos no servidor, não rastreada por membro.
- As entradas do sistema de permissões para o módulo `ActualChatTriggers` e qualquer `permoverride` para o texto do gatilho são verificadas antes das condições do próprio gatilho.
- Gatilhos de interação registram comandos de aplicativo reais, então os limites do Discord para quantidade e nomes de comandos se aplicam. Verifique `ctintererrors` quando um não aparecer.
- As reações na resposta são espaçadas em uma por segundo, então seis emoji levam seis segundos para aparecer.
- Gatilhos de evento para entradas, saídas, voz e boosts não fazem nada, silenciosamente, até que você defina **Responder em**.

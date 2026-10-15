---
title: Bot da Twitch
slug: twitch
summary: Use o Mewdeko dentro do seu próprio chat da Twitch com comandos personalizados, timers, citações e contadores, e leve inscrições, raids, resgates de pontos do canal e eventos de início de live para o Discord.
icon: fa-brands fa-twitch
category: Community
dashboard: /dashboard/twitch
module: Twitch
tags: [twitch, chat bot, streamer, commands, timers, quotes, counters, channel points, redemptions, subs, raids, account link, role sync, eventsub, bot de chat, comandos, citações, contadores, pontos do canal, resgates, inscrições, vincular conta, sincronizar cargos]
related: [streams, administration]
---

## O que faz

O Bot da Twitch conecta um canal da Twitch ao seu servidor do Discord e permite que o Mewdeko atue como um bot de chat dentro desse canal. Os espectadores digitam `!ping`, `!quote`, `!counter deaths` ou seus próprios comandos personalizados no chat da Twitch, e o bot responde lá mesmo. Os timers publicam mensagens repetidas enquanto você está ao vivo, as citações e os contadores são armazenados por servidor, e as recompensas de pontos do canal podem acionar uma resposta no chat ou uma publicação no Discord.

Os eventos do canal fluem de volta para o Discord. Quando o canal entra ao vivo, uma publicação de início de live é enviada a um canal do Discord; inscrições, inscrições presenteadas e raids podem publicar cada uma em seu próprio canal com seu próprio modelo, e um resumo de fim de transmissão pode resumir duração, pico de espectadores, mensagens no chat, inscrições e raids.

Os espectadores podem vincular a conta da Twitch à conta do Discord. Depois de vinculada, o bot sabe qual membro do Discord está conversando na Twitch, e a sincronização de cargos pode dar cargos do Discord a inscritos, VIPs, mods ou ao streamer.

> [!NOTE]
> Isto não é o mesmo que os Alertas de transmissão. Os Alertas de transmissão apenas observam canais públicos em várias plataformas e anunciam quando eles entram ao vivo. O Bot da Twitch exige que você autorize sua própria conta da Twitch e dá ao bot uma presença no seu chat. Se ambos estiverem configurados para o mesmo canal da Twitch, a publicação de início de live do Bot da Twitch substitui a dos Alertas de transmissão, para que você não receba duplicatas.

## Por que usar

- Você transmite na Twitch e quer um bot para o Discord e o chat da Twitch, com os mesmos comandos personalizados e redes sociais nos dois lugares.
- Você quer que inscrições e raids sejam celebradas no Discord assim que acontecem.
- Você quer cargos de inscrito ou VIP no Discord sem precisar dá-los manualmente.
- Você quer que uma recompensa de pontos do canal de hidratar ou se alongar realmente diga algo no chat e registre no Discord.
- Seus mods precisam de um comando de shoutout, um seletor de alvo de raid e uma lista de citações que sobreviva entre as transmissões.

## Conexão

Duas autorizações da Twitch estão envolvidas, ambas feitas na aba **Configuração**, sub-aba **Conectar**.

| Autorização | Quem faz | O que concede |
| --- | --- | --- |
| Conta do bot | Somente o dono do bot | A conta da Twitch com a qual o bot conversa. Escopos `user:read:chat`, `user:write:chat`, `user:bot`. Uma identidade compartilhada por todos os servidores. |
| Canal do streamer | Você, o streamer | Acesso aos eventos do seu canal. Escopos `channel:bot`, inscrições, bits, resgates, enquetes, previsões, gerenciamento da transmissão, edição de clipes e moderação. |

A integração conta como configurada quando existe uma conta de bot, seu canal está autorizado e a configuração está ativada. O painel **Integridade** mostra o transporte (WebSocket do EventSub ou IRC legado), o último evento recebido, a expiração do token das duas contas e, em **Diagnósticos avançados**, quaisquer escopos ausentes e as assinaturas do EventSub armazenadas.

Desconectar o canal exclui sua autorização e desativa a integração. A conta do bot só pode ser desconectada por um dono do bot.

## Comandos de chat na Twitch

Todo canal conectado recebe estes comandos nativos. O prefixo é `!` por padrão e pode ser alterado, com até cinco caracteres. Os comandos personalizados só são procurados quando nenhum comando nativo corresponde ao nome.

| Comando | Quem pode usar | O que faz |
| --- | --- | --- |
| `!ping` | Todos | Responde com um pong |
| `!uptime` | Todos | Há quanto tempo o processo do bot está em execução |
| `!commands` | Todos | Lista os comandos nativos e os personalizados ativados |
| `!discord` | Todos | Mostra qual conta do Discord está vinculada a quem usou o comando |
| `!link` | Todos | Gera um código de resgate de seis dígitos para vincular a conta |
| `!rank` | Todos | Mostra o rank resolvido de quem usou o comando |
| `!stream` | Todos | Status ao vivo, título, categoria, espectadores e tempo no ar, ou "offline" |
| `!schedule` | Todos | Publica a mensagem de agenda definida pela equipe |
| `!socials` | Todos | Publica a mensagem de redes sociais definida pela equipe |
| `!quote [id]` | Todos | Uma citação aleatória, ou uma específica pelo número |
| `!quote add <text> [-- author]` | Mod | Salva uma citação, opcionalmente com um autor após `--` |
| `!quote remove <id>` | Mod | Exclui uma citação (`delete` também funciona) |
| `!counter <name>` | Todos | Mostra o valor de um contador |
| `!counter <name> +` | Mod | Soma um (`++` ou `add` também funcionam); `-`, `--` ou `sub` subtraem um; `reset` define como 0; um número define diretamente |
| `!so <user>` | Mod | Faz um shoutout para outro canal da Twitch |
| `!raidtarget` | Mod | Sugere um canal aleatório da lista de alvos de raid |

### Ranks

O rank de um usuário do chat vem de suas insígnias da Twitch. Streamer é o mais alto, depois Mod, VIP, Inscrito (insígnias de fundador contam como inscrito) e então Todos. Comandos, comandos personalizados e a sincronização de cargos comparam com essa ordem, então um Mod pode executar qualquer coisa definida para VIP, Inscrito ou Todos.

## Comandos personalizados

Os comandos personalizados são adicionados no painel em **Comandos**, **Comandos personalizados**, ou com `/twitch commands add`. Os nomes ficam em minúsculas, podem ter até 32 caracteres e podem conter letras, dígitos, hifens e sublinhados. Cada comando tem uma **Permissão** (Todos, Inscrito, VIP, Mod, Streamer), um valor de **Segundos de espera** de 0 a 86400, uma opção **Ativado** e uma **Resposta**. O cooldown é compartilhado por todo o canal, não por usuário. As contagens de uso são registradas e exibidas na lista.

O painel também tem um campo **Argumentos de teste** e uma pré-visualização para você ver a resposta renderizada antes de salvar.

### Placeholders nas respostas

| Placeholder | Valor |
| --- | --- |
| `%user%` | O login da Twitch de quem usou o comando |
| `%display%` | O nome de exibição de quem usou o comando |
| `%channel%` | O login do seu canal da Twitch |
| `%args%` | Tudo que foi digitado depois do nome do comando |
| `%target%` | A primeira palavra depois do nome do comando |
| `%discord%` | O ID de usuário do Discord vinculado a quem usou o comando, ou vazio |
| `%random:a\|b\|c%` | Uma opção escolhida aleatoriamente |
| `%count:name%` | Valor atual do contador informado |
| `%stream%` | O mesmo resumo que `!stream` fornece |

> [!EXAMPLE]
> `!hug` com a resposta `%display% hugs %target%! That is hug number %count:hugs%.`

## Timers

Os timers publicam uma mensagem no chat da Twitch em um intervalo. Gerencie-os em **Comandos**, **Timers**, ou com `/twitch timers`.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Nome do timer | | As mesmas regras de nomenclatura dos comandos |
| Intervalo em minutos | 10 | De 1 a 1440 minutos entre as publicações |
| Mín. de mensagens no chat | 5 | Mensagens de chat que precisam chegar desde a última publicação antes de publicar de novo; 0 desativa a verificação |
| Somente online | ativado | Só publica enquanto o canal está ao vivo |
| Rotação aleatória | desativado | Escolhe uma linha aleatória em vez de percorrer em ordem |
| Ativado | ativado | Se o timer está em execução |
| Mensagens | | Uma mensagem por linha |

O agendador verifica os timers a cada 30 segundos. As linhas dos timers aceitam `%channel%`, `%url%`, `%stream%`, `%count:name%` e `%random:a|b|c%`. `/twitch timers test` (ou o botão de teste no painel) publica um timer imediatamente.

## Citações e contadores

As citações são armazenadas com seu texto, autor opcional e quem as adicionou. A sub-aba **Citações** do painel permite que a equipe as adicione, pesquise e remova; os espectadores usam `!quote`. Os contadores são inteiros nomeados simples que os mods incrementam pelo chat; a equipe pode definir valores com `/twitch commands counter-set` e listá-los com `counter-list`.

## Eventos para o Discord

A aba **Eventos**, sub-aba **Alertas** contém as configurações de inscrição, raid e pontos do canal. A publicação de início de live fica em **Configuração**, **Configurações do bot**, **Roteamento de eventos**.

### Início de live e offline

Quando o canal entra ao vivo, o bot publica no **Canal do Discord para início de live**. Sem uma **Mensagem de início de live**, ele envia um embed padrão: o nome do streamer com link para o canal, o título como linha de autor, status, número de espectadores, categoria e uma imagem de prévia. Uma mensagem personalizada passa pelo construtor de embeds, então embeds completos e componentes funcionam. Quando o canal fica offline, um breve embed vermelho "Offline" é publicado no mesmo canal.

| Placeholder | Valor |
| --- | --- |
| `%streamer%` | O nome de exibição do streamer |
| `%title%` | Título da transmissão |
| `%game%` | Nome da categoria |
| `%url%` | `https://twitch.tv/<channel>` |
| `%viewers%` | Número atual de espectadores |

### Inscrições e raids

Estas são mensagens de texto simples. Mensagem de inscrição padrão: `%display% subscribed to %channel%!`, ou `%display% received a gifted sub on %channel%!` para presentes. Mensagem de raid padrão: `%raider% raided %channel% with %viewers% viewers!`.

| Evento | Placeholders |
| --- | --- |
| Inscrição | `%user%`, `%display%`, `%channel%`, `%tier%` |
| Raid | `%raider%`, `%channel%`, `%viewers%` |

Cada alerta tem um botão **Enviar teste** no painel, e a lista **Histórico de eventos** mostra os eventos recentes e os envios de teste.

### Ações de pontos do canal

Em **Ações de pontos do canal**, associe um **Título da recompensa** (comparado sem diferenciar maiúsculas de minúsculas) a uma **Resposta na Twitch**, a um **Canal do Discord** com uma **Mensagem do Discord**, ou a ambos. Placeholders: `%user%`, `%display%`, `%channel%`, `%reward%`, `%input%` (o que o espectador digitou) e `%url%`.

### Resumo da transmissão

`/twitch events recap-channel` define um canal que recebe um embed quando a transmissão termina: duração, pico de espectadores, mensagens no chat, inscrições, raids e o último título e categoria. Os resumos não estão no painel.

## Vinculação de contas e sincronização de cargos

Há duas formas de vincular um membro do Discord a um login da Twitch:

1. Por conta própria: o espectador digita `!link` no chat da Twitch, recebe um código de seis dígitos e executa `/twitch claim <code>` no Discord em até dez minutos.
2. Pela equipe: a aba **Vínculos de contas** ou `/twitch links add @user twitchlogin`.

Um login da Twitch por membro do Discord por servidor. Depois de vinculado, `%discord%` é preenchido para esse espectador e a sincronização de cargos passa a valer.

A sincronização de cargos associa um rank da Twitch a um cargo do Discord com `/twitch rolesync add`. Toda vez que um espectador vinculado envia uma mensagem no chat, o bot adiciona o cargo se o rank dele estiver no nível do mapeamento ou acima, e o remove se estiver abaixo. A sincronização de cargos só está disponível por comandos de barra.

## Ferramentas ao vivo

A aba **Eventos**, sub-aba **Ferramentas ao vivo** expõe ações de operador da transmissão que usam a autorização do seu canal: enviar uma mensagem no chat como o bot, criar um marcador na transmissão, criar um clipe, iniciar uma enquete (uma opção por linha, 60 segundos por padrão) e aplicar timeout (600 segundos por padrão), banir, desbanir ou excluir uma mensagem pelo ID. `/twitch stream-info` e `/twitch clip` cuidam das partes de título, categoria e clipe a partir do Discord.

## Configurações

Em **Configuração**, **Configurações do bot**:

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Prefixo de comando | `!` | Prefixo dos comandos de chat da Twitch, até 5 caracteres |
| Idioma personalizado | padrão do servidor | Tag BCP-47, como `de-DE`, usada nas respostas do bot no chat |
| Ativar o bot de chat da Twitch para este servidor | ativado | Chave geral; desativar mantém a configuração |
| Usar EventSub para eventos de chat | ativado | Recebe chat e eventos pelo EventSub; se desativado, os comandos de chat não funcionam |
| Canal do Discord para início de live | nenhum | Para onde vão as publicações de início de live e de offline |
| Mensagem de início de live | embed padrão | Modelo personalizado com os placeholders de início de live |

Em **Eventos**, **Alertas**: **Canal do Discord para inscrições**, **Mensagem de inscrição**, **Canal do Discord para raids**, **Mensagem de raid** e a lista de ações de pontos do canal.

## Passo a passo de configuração

1. Abra **Bot da Twitch** no painel. Um dono do bot deve ter conectado a **Conta do bot** antes; a sub-aba **Conectar** mostra se existe uma.
2. Clique em **Conectar canal** e autorize com sua própria conta da Twitch.
3. Em **Configurações do bot**, defina o prefixo, ative **Ativar o bot de chat da Twitch para este servidor**, escolha um **Canal do Discord para início de live** e salve.
4. Em **Comandos**, adicione alguns comandos personalizados e um timer de redes sociais. Use **Argumentos de teste** e a pré-visualização para conferir os placeholders.
5. Em **Eventos**, **Alertas**, escolha os canais de inscrição e raid e pressione **Enviar teste** para cada um.
6. Digite `!ping` no seu chat da Twitch para confirmar que o bot está ouvindo, depois `!link` e `/twitch claim` para vincular a si mesmo.
7. Opcionalmente, execute `/twitch rolesync add Subscriber @Subs` para que os inscritos vinculados recebam um cargo.

## Comandos

Este módulo usa apenas comandos de barra. Digite `/twitch` no Discord para vê-los. As respostas só são visíveis para você.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `/twitch set <channel> [prefix]` | | Gerenciar servidor | Definir o canal da Twitch e o prefixo, e ativar a integração |
| `/twitch remove` | | Gerenciar servidor | Desativar a integração e sair do canal |
| `/twitch enable` | | Gerenciar servidor | Reativar a integração |
| `/twitch disable` | | Gerenciar servidor | Desativá-la sem excluir as configurações |
| `/twitch config` | | Ninguém | Mostrar canal, prefixo, estado ativado, canal de início de live e idioma |
| `/twitch claim <code>` | | Ninguém | Resgatar um código de vínculo de `!link` |
| `/twitch stream-info [title] [category]` | | Gerenciar servidor | Atualizar o título ou a categoria da transmissão |
| `/twitch clip` | | Gerenciar servidor | Criar um clipe da transmissão atual |
| `/twitch status` | | Gerenciar servidor | Resumo de integridade: contas, tokens, estado do EventSub |
| `/twitch language <tag>` | | Gerenciar servidor | Idioma das respostas do chat; vazio redefine |
| `/twitch prefix <prefix>` | | Gerenciar servidor | Alterar o prefixo dos comandos de chat |
| `/twitch commands add <name> <response> [permission] [cooldown]` | | Gerenciar servidor | Adicionar ou atualizar um comando personalizado |
| `/twitch commands remove <name>` | | Gerenciar servidor | Excluir um comando personalizado |
| `/twitch commands list` | | Ninguém | Listar comandos personalizados com permissão, cooldown e contagem de uso |
| `/twitch commands counter-set <name> <value>` | | Gerenciar servidor | Definir um contador |
| `/twitch commands counter-list` | | Ninguém | Listar contadores |
| `/twitch commands schedule-set <message>` | | Gerenciar servidor | Definir a resposta de `!schedule` |
| `/twitch commands schedule-clear` | | Gerenciar servidor | Limpá-la |
| `/twitch commands socials-set <message>` | | Gerenciar servidor | Definir a resposta de `!socials` |
| `/twitch commands socials-clear` | | Gerenciar servidor | Limpá-la |
| `/twitch timers add <name> <messages> [interval] [minchat] [onlineonly] [randomize]` | | Gerenciar servidor | Adicionar ou atualizar um timer |
| `/twitch timers remove <name>` | | Gerenciar servidor | Excluir um timer |
| `/twitch timers list` | | Ninguém | Listar timers |
| `/twitch timers enable <name>` | | Gerenciar servidor | Ativar um timer |
| `/twitch timers disable <name>` | | Gerenciar servidor | Desativar um timer |
| `/twitch timers test <name>` | | Gerenciar servidor | Publicar um timer agora |
| `/twitch events golive-channel <channel> [message]` | | Gerenciar servidor | Definir o canal e o modelo de início de live |
| `/twitch events golive-clear` | | Gerenciar servidor | Limpar o canal de início de live |
| `/twitch events sub-channel <channel> [message]` | | Gerenciar servidor | Definir o canal e o modelo de inscrições |
| `/twitch events sub-clear` | | Gerenciar servidor | Desativar as publicações de inscrições |
| `/twitch events raid-channel <channel> [message]` | | Gerenciar servidor | Definir o canal e o modelo de raids |
| `/twitch events raid-clear` | | Gerenciar servidor | Desativar as publicações de raids |
| `/twitch events recap-channel <channel>` | | Gerenciar servidor | Definir o canal de resumo da transmissão |
| `/twitch events recap-clear` | | Gerenciar servidor | Desativar os resumos |
| `/twitch links add <@user> <twitchlogin>` | | Gerenciar servidor | Vincular um membro a um login da Twitch |
| `/twitch links remove <@user>` | | Gerenciar servidor | Remover o vínculo de um membro |
| `/twitch links list` | | Ninguém | Listar todos os vínculos |
| `/twitch rolesync add <rank> <@role>` | | Gerenciar servidor | Dar um cargo a espectadores vinculados de um rank para cima |
| `/twitch rolesync remove <rank> <@role>` | | Gerenciar servidor | Remover um mapeamento |
| `/twitch rolesync list` | | Ninguém | Listar mapeamentos |
| `/twitch redemptions add <reward> [twitchreply] [channel] [discordmessage]` | | Gerenciar servidor | Adicionar ou atualizar uma ação de pontos do canal |
| `/twitch redemptions remove <reward>` | | Gerenciar servidor | Remover uma |
| `/twitch redemptions list` | | Ninguém | Listar ações |
| `/twitch raidtargets add <twitchlogin> [note]` | | Gerenciar servidor | Adicionar um canal ao grupo de `!raidtarget` |
| `/twitch raidtargets remove <twitchlogin>` | | Gerenciar servidor | Remover um |
| `/twitch raidtargets list` | | Ninguém | Listar alvos de raid |

## Dicas e armadilhas

- A conta do bot é compartilhada por todos os servidores do bot. Se ninguém conectou uma, as respostas no chat não podem ser enviadas, não importa o que você configure.
- Os comandos de chat só funcionam enquanto **Usar EventSub para eventos de chat** está ativado. Se o painel Integridade mostrar IRC legado, ative-o novamente.
- O estado ao vivo também é consultado uma vez por minuto, então uma publicação de início de live pode atrasar até um minuto em relação ao início real.
- Os cooldowns dos comandos personalizados são por canal, não por espectador. Um cooldown de 30 segundos significa um uso a cada 30 segundos para todos.
- A sincronização de cargos roda quando um espectador vinculado conversa, não em um agendamento. Um inscrito que nunca digita no chat nunca recebe o cargo, e um inscrito que deixou de ser mantém o cargo até conversar novamente.
- As mudanças de cargo exigem que o cargo do bot esteja acima do cargo sincronizado e Gerenciar cargos.
- Ranks desconhecidos passados para `rolesync` caem para Subscriber, e permissões desconhecidas passadas para `commands add` caem para Everyone.
- Os códigos de vínculo expiram após dez minutos e gerar um novo invalida o antigo.
- Timeouts e banimentos das Ferramentas ao vivo usam os escopos de moderação do seu canal, então aparecem na Twitch como ações realizadas pela conta autorizada.
- O idioma personalizado altera apenas as respostas do chat da Twitch. As respostas no Discord mantêm o idioma do servidor.

---
title: Canais de Estatísticas
slug: statchannels
summary: Canais de voz cujos nomes se atualizam sozinhos para mostrar números ao vivo, como contagem de membros, boosts, tickets abertos ou espectadores da Twitch.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/statchannels
module: StatChannels
tags: [stat channels, counter, member count, live stats, voice channel stats, countdown, member goal, boost count, twitch viewers, canais de estatísticas, contador, contagem de membros, estatísticas ao vivo, contagem regressiva, meta de membros, boosts, espectadores da twitch]
related: [counting, twitch, suggestions, xp, afk, starboard]
---

## O que ele faz

Um canal de estatísticas é um canal de voz bloqueado, que fica no topo da lista de canais e mostra um número no nome, por exemplo "Members: 12,480". O bot reescreve o nome periodicamente para que o número se mantenha atualizado. Os membros não podem entrar no canal; ele existe apenas para ser lido.

Você escolhe um tipo de contador, um modelo para o nome, um estilo para o número e a frequência de atualização. O bot oferece várias dezenas de contadores que cobrem fatos do servidor, presença, boosts do Nitro, espaços de emojis, metas de membros e contagens regressivas, além de valores vindos de outros recursos da Mewdeko, como tickets, sugestões, sorteios, XP, contagem, o starboard e servidores de Twitch ou Minecraft vinculados.

O Discord só permite que um canal seja renomeado duas vezes a cada dez minutos. Os Canais de Estatísticas contornam isso com uma escolha de mecanismo de atualização, incluindo um que exclui e recria o canal para que ele possa ser atualizado a cada minuto.

## Por que usar

- Mostre as contagens de membros, humanos e bots no topo do servidor.
- Acompanhe o progresso até uma meta de membros com uma porcentagem ou uma barra de progresso.
- Faça uma contagem regressiva até um evento, um lançamento ou um aniversário.
- Mostre o status ao vivo da Twitch e o número de espectadores no servidor de um streamer.
- Dê à equipe uma visão ao vivo dos tickets abertos ou das sugestões pendentes sem abrir um painel.
- Exiba o status do servidor de Minecraft e o número de jogadores ao lado do link de convite.

## Tipos de contador

O catálogo completo abaixo é o que `statchanneltypes` e a seção **Contadores Disponíveis** do painel listam. Todo tipo aceita os marcadores comuns; alguns acrescentam os seus próprios. Os modelos padrão começam com um emoji correspondente, seguido do texto mostrado.

### Membros

| Tipo | Mostra | Modelo padrão | Marcadores extras |
| --- | --- | --- | --- |
| `TotalMembers` | Todos os membros, incluindo bots | `Members: %count%` | |
| `HumanMembers` | Membros que não são bots | `Humans: %count%` | |
| `BotCount` | Contas de bot | `Bots: %count%` | |
| `OnlineMembers` | Membros com qualquer presença diferente de offline | `Online: %count%` | |
| `IdleMembers` | Membros marcados como ausentes | `Idle: %count%` | |
| `DndMembers` | Membros marcados como não perturbe | `DND: %count%` | |
| `StreamingMembers` | Membros com uma atividade de transmissão | `Streaming: %count%` | |
| `InVoiceMembers` | Membros conectados a qualquer canal de voz | `In Voice: %count%` | |
| `RoleMembers` | Membros com um cargo escolhido | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.color%` |
| `NewestMember` | O membro que entrou mais recentemente | `Newest: %member.name%` | `%member.name%`, `%member.id%` |
| `MembersJoinedToday` | Entraram nas últimas 24 horas | `Joined Today: %count%` | |
| `MembersJoinedWeek` | Entraram nos últimos 7 dias | `This Week: %count%` | |
| `MemberGoal` | Progresso até uma contagem de membros-alvo | `%count% / %goal%` | `%goal%`, `%goal.raw%`, `%goal.percent%`, `%goal.remaining%`, `%goal.bar%` |
| `AfkCount` | Membros atualmente AFK pela Mewdeko | `AFK: %count%` | |

### Servidor

| Tipo | Mostra | Modelo padrão | Marcadores extras |
| --- | --- | --- | --- |
| `Countdown` | Tempo restante até uma data-alvo | `%days%d %hours%h left` | `%days%`, `%hours%`, `%minutes%`, `%total.hours%` |
| `ChannelCount` | Todos os canais | `Channels: %count%` | |
| `TextChannelCount` | Canais de texto | `Text: %count%` | |
| `VoiceChannelCount` | Canais de voz | `Voice: %count%` | |
| `CategoryCount` | Categorias | `Categories: %count%` | |
| `StageChannelCount` | Canais de palco | `Stages: %count%` | |
| `ForumChannelCount` | Canais de fórum | `Forums: %count%` | |
| `ThreadCount` | Tópicos atualmente em cache como ativos | `Threads: %count%` | |
| `RoleCount` | Cargos | `Roles: %count%` | |
| `BoostCount` | Boosts do Nitro ativos | `Boosts: %count%` | |
| `BoostLevel` | Nível de boost, de 0 a 3 | `Level %count%` | |
| `NextBoostGoal` | Boosts ainda necessários para o próximo nível | `%count% to Tier %tier.next%` | `%tier.next%`, `%tier.current%` |
| `EmojiCount` | Todos os emojis personalizados | `Emojis: %count%` | |
| `AnimatedEmojiCount` | Emojis personalizados animados | `Animated: %count%` | |
| `StaticEmojiCount` | Emojis personalizados estáticos | `Static: %count%` | |
| `StickerCount` | Stickers personalizados | `Stickers: %count%` | |
| `EmojiSlotsUsed` | Espaços de emojis usados em relação ao limite do nível | `Slots: %count%/%slots.max%` | `%slots.max%`, `%slots.free%` |
| `ServerAge` | Dias desde a criação do servidor | `Age: %count% days` | `%years%`, `%created%` |
| `EventCount` | Eventos agendados | `Events: %count%` | |
| `BotUptime` | Há quanto tempo a Mewdeko está em execução | `Uptime: %days%d %hours%h` | `%days%`, `%hours%`, `%minutes%` |
| `InviteCount` | Convites rastreados pelo rastreamento de convites | `Invites: %count%` | |

### Twitch

Estes leem do canal da Twitch vinculado pelo módulo Twitch.

| Tipo | Mostra | Modelo padrão | Marcadores extras |
| --- | --- | --- | --- |
| `TwitchLiveStatus` | Se o canal está ao vivo | `%twitch.name%: %status%` | `%status%`, `%twitch.name%` |
| `TwitchViewers` | Espectadores atuais | `Viewers: %count%` | `%twitch.name%` |
| `TwitchGame` | Categoria sendo transmitida | `%game%` | `%game%`, `%title%`, `%twitch.name%` |
| `TwitchUptime` | Há quanto tempo a transmissão está ao vivo | `Live %hours%h %minutes%m` | `%hours%`, `%minutes%` |
| `TwitchFollowers` | Total de seguidores | `Followers: %count%` | `%twitch.name%` |
| `TwitchSubs` | Total de inscritos | `Subs: %count%` | `%twitch.name%` |
| `TwitchCounter` | Um contador nomeado do chat da Twitch | `%counter.name%: %count%` | `%counter.name%` |
| `TwitchLastRaider` | O raider mais recente | `Last Raid: %raider%` | `%raider%`, `%raid.viewers%` |
| `TwitchRecentStreams` | Transmissões iniciadas nos últimos 14 dias | `Streams: %count%` | |

### Outros recursos da Mewdeko

| Tipo | Categoria | Mostra | Modelo padrão | Marcadores extras |
| --- | --- | --- | --- | --- |
| `MinecraftPlayers` | Minecraft | Jogadores online em um servidor monitorado | `Players: %count%/%players.max%` | `%players.max%`, `%server.version%` |
| `MinecraftStatus` | Minecraft | Se um servidor monitorado está acessível | `%status%` | `%status%`, `%latency%` |
| `CountingCurrent` | Contagem | Número atual em um canal de contagem | `Count: %count%` | |
| `CountingRecord` | Contagem | Maior número já alcançado | `Record: %count%` | |
| `OpenTickets` | Tickets | Tickets abertos e não arquivados | `Open Tickets: %count%` | |
| `TicketsToday` | Tickets | Tickets abertos nas últimas 24 horas | `Today: %count%` | |
| `PendingSuggestions` | Sugestões | Sugestões aguardando uma decisão | `Pending: %count%` | |
| `ActiveGiveaways` | Sorteios | Sorteios em andamento | `Giveaways: %count%` | |
| `StarboardPosts` | Starboard | Total de posts do starboard | `Starred: %count%` | |
| `TopXpUser` | XP | O membro com mais XP | `Top: %member.name%` | `%member.name%`, `%member.id%`, `%member.xp%` |
| `TotalGuildXp` | XP | Todo o XP ganho no servidor | `Total XP: %count%` | |
| `TotalCurrency` | Moeda | Moeda em posse dos membros | `In Circulation: %count%` | |
| `ActivePolls` | Enquetes | Enquetes que aceitam votos | `Polls: %count%` | |
| `Clock` | Servidor | A data e a hora no fuso horário do servidor | `%time% %tz%` | `%time%`, `%date%`, `%datetime%`, `%weekday%`, `%tz%` |
| `MessagesToday`, `MessagesWeek` | Atividade | Mensagens nas últimas 24 horas ou 7 dias | `Today: %count%` | |
| `VoiceHoursToday`, `VoiceHoursWeek` | Atividade | Horas de voz somadas de todos os membros nas últimas 24 horas ou 7 dias | `Today: %count%h` | |
| `TopChatter` | Atividade | O membro que mais conversou nos últimos 7 dias | `Chatter: %member.name%` | `%member.name%`, `%member.id%`, `%member.messages%` |
| `TopVoiceMember` | Atividade | O membro com mais tempo de voz nos últimos 7 dias | `Voice: %member.name%` | `%member.name%`, `%member.id%`, `%member.hours%` |
| `TopGame` | Atividade | O jogo mais jogado dos últimos 7 dias (exige rastreamento de jogos) | `%game%` | `%game%`, `%hours%`, `%players%` |
| `PlayingNow` | Atividade | Membros atualmente em um jogo rastreado (exige rastreamento de jogos) | `Playing: %count%` | |
| `RoleMembersOnline` | Membros | Membros com um cargo que não estão offline | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.total%` |
| `TopInviter` | Rastreamento de convites | O membro com mais convites | `Inviter: %member.name%` | `%member.name%`, `%member.id%`, `%member.invites%` |
| `InvitesWeek` | Rastreamento de convites | Entradas creditadas a quem convidou nos últimos 7 dias | `This Week: %count%` | |
| `MembersLeftToday`, `MembersLeftWeek` | Membros | Membros que saíram nas últimas 24 horas ou 7 dias | `Left Today: %count%` | |
| `NetGrowthWeek` | Membros | Entradas menos saídas nos últimos 7 dias | `Growth: %count%` | `%joins%`, `%leaves%` |

### Marcadores disponíveis para todos os tipos

| Marcador | Valor |
| --- | --- |
| `%count%` | O valor, renderizado com o estilo de exibição escolhido |
| `%count.raw%` | O valor em dígitos simples |
| `%server.name%` | Nome do servidor |
| `%server.id%` | ID do servidor |
| `%server.members%` | Contagem total de membros |
| `%server.boostcount%` | Contagem de boosts |
| `%server.boostlevel%` | Nível de boost |

Os nomes de canais são limitados ao máximo de 100 caracteres do Discord.

## Estilos de exibição

O **Estilo do Contador** decide como `%count%` é renderizado. Ele só se aplica a contadores numéricos; contadores de texto, como `NewestMember`, imprimem o texto como está, e contadores de verdadeiro ou falso, como `TwitchLiveStatus`, imprimem um texto no estilo "LIVE" ou "Offline".

| Estilo | Exemplo para 1234 | Observações |
| --- | --- | --- |
| `Plain` | `1234` | Dígitos simples |
| `Comma` | `1,234` | Separadores de milhar. O padrão. |
| `Compact` | `1.2K` | Sufixos K, M, B, T, com uma casa decimal por padrão |
| `Padded` | `1234` | Preenchido com zeros até uma largura fixa, quatro dígitos por padrão, então 42 vira `0042` |
| `Ordinal` | `1,234th` | Adiciona st, nd, rd ou th |
| `Percent` | `61.7%` | Valor como porcentagem da meta-alvo, com uma casa decimal por padrão |
| `ProgressBar` | uma barra de dez células | Células preenchidas e vazias em direção à meta-alvo, dez células por padrão |
| `EmojiDigits` | dígitos em teclas | Cada dígito como um emoji de tecla |
| `Roman` | `MCCXXXIV` | Algarismos romanos de 1 a 3999; fora disso, volta ao estilo com vírgula |

`Percent` e `ProgressBar` precisam de uma meta-alvo para comparar. Sem uma, mostram `0%` ou uma barra vazia.

## Mecanismos de atualização

| Mecanismo | Rótulo no painel | Como funciona |
| --- | --- | --- |
| `Rename` | Apenas renomear | Edita o nome do canal. O Discord permite duas renomeações a cada dez minutos por canal, então o intervalo de atualização é forçado a pelo menos 5 minutos. O ID do canal nunca muda. |
| `Recreate` | Excluir e recriar | Cria um novo canal com o mesmo nome, categoria, posição e sobrescritas de permissão, e então exclui o antigo. Pode ser atualizado a cada minuto, mas o ID do canal muda a cada atualização e cada atualização deixa duas entradas no registro de auditoria. |
| `Auto` | Automático (recomendado) | Renomeia enquanto o limite de duas a cada dez minutos permitir. Quando o limite se esgota e o intervalo é inferior a 5 minutos, ele recria o canal em vez disso. Quando o intervalo é de 5 minutos ou mais, apenas espera pela próxima vaga de renomeação. |

O padrão para novos canais de estatísticas é **Automático** a cada **5 minutos**. Os intervalos são limitados entre 1 minuto (5 para Rename) e 1440 minutos. O bot verifica a cada 30 segundos quais canais tiveram o intervalo vencido.

> [!WARNING]
> Recreate muda o ID do canal. Qualquer outra coisa que faça referência ao canal, como configurações de permissão em outros bots ou links fixados, quebra a cada atualização. Use-o apenas onde uma atualização rápida importa mais que um ID estável.

## Configurações

A página tem três abas, **Canais de Estatísticas**, **Adicionar** e **Padrões**, além de um botão **Atualizar** no cabeçalho. **Canais de Estatísticas** lista todos os canais configurados, com os botões **Editar** e **Remover**.

**Adicionar Canal de Estatísticas** oferece **Criar Novo Canal** ou **Usar Canal Existente**, com um seletor de **Canal de voz**, e depois:

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Categoria (opcional) | nenhuma | Onde um canal recém-criado é colocado |
| Contador | nenhum | O tipo de contador do catálogo |
| Modelo | o padrão do tipo | Nome do canal com marcadores; clique em um marcador para inseri-lo, e a prévia é atualizada conforme você digita |
| Estilo do Contador | Comma | Estilo de exibição da tabela acima |
| Mecanismo de Atualização | Automático | Renomear, recriar ou automático |
| Intervalo de Atualização (minutos) | 5 | Com que frequência o nome é atualizado |
| Cargo | nenhum | Exibido para `RoleMembers` |
| Data Alvo | nenhuma | Exibida para `Countdown` |
| Meta Alvo | nenhuma | Exibida para `MemberGoal` e usada pelos estilos de porcentagem e de barra de progresso |
| Nome do Contador da Twitch | nenhum | Exibido para `TwitchCounter` |
| Canal de Contagem | nenhum | Exibido para os tipos de contagem |
| Servidor de Minecraft | nenhum | Exibido para os tipos de Minecraft |

**Padrões para Novos Canais de Estatísticas** define **Mecanismo Padrão**, **Estilo de Contador Padrão** e **Intervalo Padrão (minutos)** para os canais adicionados depois. A aba **Padrões** também tem seções de referência para **Estilos de Contador** e **Contadores Disponíveis**.

Um canal recém-criado nega Conectar para `@everyone`, para funcionar como um rótulo. Um canal que você mesmo adicionar mantém as permissões que já tinha.

## Passo a passo de configuração

1. Abra **Canais de Estatísticas** no painel e vá para a aba **Padrões**. Deixe **Mecanismo Padrão** em Automático e defina um intervalo com o qual você se sinta confortável.
2. Vá para **Adicionar**, escolha **Criar Novo Canal** e selecione uma **Categoria** se quiser os contadores agrupados.
3. Escolha um **Contador**, por exemplo Total Members. Ajuste o **Modelo** e observe a prévia.
4. Escolha um **Estilo do Contador** e salve.
5. Repita para cada contador. Para uma meta de membros, escolha `MemberGoal`, defina a **Meta Alvo** e experimente o estilo `ProgressBar`.
6. Arraste os novos canais para o topo da lista de canais no Discord, caso não tenham ido parar lá.
7. Aguarde um intervalo de atualização e confirme que os nomes são atualizados.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado). Tipos, estilos e mecanismos são os nomes das tabelas acima, por exemplo `TotalMembers`, `Compact`, `Recreate`.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `statchannelcreate <type> [template]` | `scnew` | Gerenciar Canais | Cria um novo canal de voz bloqueado mostrando esse contador |
| `statchanneladd #voice <type> [template]` | `sca` | Gerenciar Canais | Transforma um canal de voz existente em um canal de estatísticas |
| `statchannelrole #voice @role [true] [template]` | `scr` | Gerenciar Canais | Adiciona um contador de membros de um cargo; `true` conta apenas os membros que não estão offline |
| `statchannelcountdown #voice <date> [template]` | `scc` | Gerenciar Canais | Adiciona uma contagem regressiva até uma data |
| `statchannelgoal #voice <number> [template]` | `scg` | Gerenciar Canais | Adiciona um contador de meta de membros |
| `statchanneltwitchcounter #voice <counter> [template]` | | Gerenciar Canais | Espelha um contador nomeado do chat da Twitch |
| `statchannelmechanism #voice <mechanism> [minutes]` | | Gerenciar Canais | Define rename, recreate ou auto, e opcionalmente o intervalo |
| `statchannelstyle #voice <style>` | | Gerenciar Canais | Define o estilo de exibição |
| `statchanneldefaults [mechanism] [minutes] [style]` | | Gerenciar Canais | Define os padrões para novos canais de estatísticas |
| `statchanneltypes [category]` | | Qualquer pessoa | Navega por todos os contadores com um exemplo, opcionalmente por categoria |
| `statchannellist` | `scl` | Qualquer pessoa | Lista os canais de estatísticas deste servidor com tipo, estilo, modo e modelo |
| `statchannelremove #voice` | `statchrm` | Gerenciar Canais | Deixa de acompanhar um canal |

`statchannelcreate` também exige que o bot tenha Gerenciar Canais. Os equivalentes de barra ficam em `/statchannel`.

## Dicas e armadilhas

- O bot precisa de Gerenciar Canais para renomear ou recriar um canal.
- Um canal de voz só pode ser um canal de estatísticas. Adicioná-lo duas vezes falha com "already a stat channel".
- Os contadores de Contagem, Minecraft e Twitch exigem que esses recursos estejam configurados antes. Os alvos de Contagem e Minecraft são escolhidos no painel; não há comando para eles.
- `statchannelremove` apenas deixa de acompanhar o canal. Exclua você mesmo o canal de voz se não o quiser mais.
- Valores ao vivo, como espectadores da Twitch ou tickets abertos, continuam seguindo o intervalo do próprio canal. Reduza o intervalo desses canais em vez de todos eles.
- Os estilos `Percent` e `ProgressBar` usam a meta-alvo do próprio canal. Defini-los em um contador sem meta sempre mostra zero.

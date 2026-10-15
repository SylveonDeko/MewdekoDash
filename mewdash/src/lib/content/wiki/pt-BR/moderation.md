---
title: Moderação
slug: moderation
summary: Advirta, silencie, aplique timeout, expulse e bana membros, escale punições automaticamente conforme as advertências se acumulam e controle quantos dias de mensagens um banimento exclui.
icon: fa-flag
category: Security
dashboard: /dashboard/moderation
module: Moderation
tags: [moderation, warn, warnings, warn punish, punishment ladder, mute, mute role, timeout, ban, softban, kick, ban purge, ban prune, purge, prune, dehoist, warnlog, moderação, advertência, advertências, aviso, avisos, punição, escada de punições, silenciar, cargo de mute, banir, expulsar, limpeza de banimento, limpar mensagens]
related: [administration, filter, logging, auditlog]
---

## O que faz

A Moderação é a caixa de ferramentas que a equipe usa com membros individuais. As advertências são o núcleo dela: um moderador executa `warn @user reason`, o membro recebe uma DM com o motivo e quem o advertiu, a advertência é armazenada e, se o servidor tiver um canal de logs de advertências, um embed chega lá com a contagem de advertências e qualquer punição que tenha sido disparada.

As advertências se acumulam. Você pode montar uma escada de punições para que atingir um certo número de advertências ativas dispare algo automaticamente: um mute, um timeout, uma expulsão, um banimento ou um cargo. A equipe não precisa lembrar das regras; o bot as aplica no momento em que a contagem é atingida. As advertências podem ser perdoadas depois ou configuradas para expirar sozinhas após um número de dias.

Ao redor disso ficam as ações diretas: mute (com um cargo de mute gerenciado), timeout, expulsão, softban, banimento, banimento temporário, expulsão em massa, limpeza de mensagens e limpeza de apelidos para membros que se colocam no topo da lista com caracteres especiais. Toda ação de banimento também tem uma limpeza configurável, que é quantos dias das mensagens do membro o Discord exclui junto com o banimento.

A página do painel cobre as advertências, a escada de punições, o canal de logs de advertências e as configurações de limpeza de banimento. Ações diretas como mute, expulsão e banimento são apenas por comando.

## Por que usar

- Você quer uma política consistente de "três avisos" que se aplique da mesma forma independentemente de qual moderador está de plantão.
- É preciso silenciar membros rapidamente sem mexer nas permissões de canal manualmente.
- Um spammer entrou e você quer o último dia de mensagens dele apagado com o banimento, mas um banimento temporário de um membro regular não deve apagar o histórico dele.
- A equipe precisa de um registro pesquisável de quem foi advertido, por quem e por quê, que sobreviva à troca de moderadores.
- Nomes como "!!! xXx" continuam flutuando para o topo da lista de membros e você quer limpá-los de uma vez.

## Advertências

`warn <user> [reason]` exige Banir membros. O bot primeiro tenta enviar por DM ao membro um embed com o nome do servidor, o moderador e o motivo. Se a DM falhar, a confirmação no canal recebe um rodapé informando isso. A advertência é então salva com o nome do moderador e o motivo, ou `-` se nenhum foi informado.

O membro precisa estar abaixo do moderador na hierarquia de cargos e abaixo do bot. Se não estiver, o comando recusa.

`warnlog <user>` mostra uma lista paginada, nove por página, com a data, o moderador e o motivo. As advertências perdoadas aparecem riscadas, com quem as limpou. `warnlogall` lista todos os membros com advertências como `active (total - forgiven)`.

`warnclear <user> [index]` marca advertências como perdoadas. Sem índice, ou com `0`, perdoa todas. Com um índice, perdoa apenas aquela, numerada como em `warnlog`. As advertências perdoadas permanecem no log, mas deixam de contar para as punições. O painel também pode excluir uma advertência de vez, o que a remove permanentemente.

### Expiração de advertências

`warnexpire <days> <clear|delete>` define por quanto tempo uma advertência vale. Os dias podem ir de 0 a 366; 0 desativa a expiração. A ação decide o que acontece quando uma advertência envelhece:

| Ação | O que acontece |
| --- | --- |
| Clear | A advertência é marcada como perdoada e permanece no log |
| Delete | A advertência é removida do banco de dados |

A expiração é verificada a cada doze horas e uma vez imediatamente quando você a define.

### O canal de logs de advertências

Defina-o com `setwarnchannel #channel` ou com o seletor **Canal de logs de avisos** na aba Punições do painel. Cada advertência posta ali um embed com o nome e o ID do membro, o número atual de advertências dele, a punição que foi disparada (ou "None"), o motivo e um link para a mensagem que emitiu a advertência.

## Punições por advertência

A escada é uma lista de regras do tipo "com N advertências ativas, faça X". Quando uma advertência é emitida, o bot conta as advertências ativas do membro, incluindo a nova, e procura uma regra com exatamente essa contagem. Somente uma correspondência exata dispara, então um membro com uma regra em 3 que de algum modo chegue a 4 sem uma regra em 4 não recebe nada extra.

Defina uma regra com `warnpunish <number> <punishment> [time]`, ou `warnpunish <number> addrole <role> [time]` para a variante de cargo. `warnpunish <number>` sem mais nada remove a regra. `warnpunishlist` mostra a escada.

| Punição | Com tempo? | O que faz |
| --- | --- | --- |
| Mute | Opcional | Aplica o cargo de mute, ou um mute temporário se um tempo for informado |
| ChatMute | Opcional | Somente o cargo de mute, sem mute de voz |
| VoiceMute | Opcional | Somente mute de voz pelo servidor |
| Timeout | Obrigatório, até 28 dias | Timeout do Discord |
| Kick | Não | Expulsa o membro |
| Softban | Não | Bane e desbane imediatamente para excluir mensagens |
| Ban | Opcional | Banimento permanente, ou temporário se um tempo for informado |
| AddRole | Opcional | Adiciona o cargo escolhido, removido de novo após o tempo, se definido |
| RemoveRoles | Não | Remove todos os cargos do membro |

Os tempos são armazenados em minutos e podem chegar a 49 dias. Softban, Kick e RemoveRoles recusam um tempo. Timeout se recusa a salvar sem um. As punições são executadas com o motivo "Warned too many times."

No painel, a mesma escada fica na aba **Punições**: escolha **Na advertência nº**, uma **Punição**, uma **Duração (minutos)** opcional e um **Cargo a adicionar** para a punição de cargo, depois **Adicionar à escada**. Salvar uma regra em uma contagem que já tem uma a substitui.

> [!EXAMPLE]
> `warnpunish 2 mute 1h`, `warnpunish 3 timeout 1d`, `warnpunish 5 ban`. Duas advertências dão mute por uma hora, três dão timeout por um dia, cinco banem.

## Mini advertências

Existe uma segunda trilha de advertências, independente, chamada mini advertências, pensada para infrações menores tratadas pela equipe júnior. `mwarn` exige apenas Silenciar membros em vez de Banir membros. Ela tem seu próprio log (`mwarnlog`, `mwarnlogall`), seu próprio comando de limpeza, sua própria expiração, sua própria escada de punições (`mwarnpunish`) e seu próprio canal de logs (`setmwarnchannel`). As mini advertências nunca contam para a escada principal e vice-versa. O painel não mostra mini advertências.

## Mutes e o cargo de mute

O bot gerencia um cargo de mute. Por padrão ele se chama `Mewdeko-mute`; mude-o com `muterole @role`, ou execute `muterole` sozinho para ver o atual. Na primeira vez que um mute é necessário, o bot cria o cargo se ele não existir e depois percorre todos os canais de texto adicionando uma sobreposição que nega Enviar mensagens, Adicionar reações, Anexar arquivos, Enviar mensagens em tópicos e Criar tópicos públicos. Tópicos são pulados. Isso pode levar um momento em servidores com muitos canais.

| Comando | Efeito |
| --- | --- |
| `mute` | Mute completo: adiciona o cargo de mute |
| `chatmute` | Adiciona somente o cargo de mute |
| `voicemute` | Silencia o membro somente na voz, pelo servidor |
| `stfu` | Nega Enviar mensagens a esse membro somente no canal atual, por meio de uma sobreposição de permissões |

Cada um tem uma forma com tempo. Mutes completos vão de um minuto até 90 dias; mutes de chat e de voz vão de um minuto até 49 dias. `stfu` com um tempo remove a sobreposição quando o tempo acaba. Membros silenciados recebem uma DM quando são silenciados e quando deixam de ser.

`removeonmute y` faz um mute completo também remover os outros cargos do membro e guardá-los, e `unmute` os devolve. `removeonmute n` desativa isso. `unmuteall` remove o cargo de mute de todos que o têm após uma confirmação, opcionalmente com um motivo.

## Timeouts

`timeout <time> <user> [reason]` usa o timeout nativo do Discord, até 28 dias. Tanto você quanto o bot precisam de Gerenciar membros (Moderate Members). `untimeout <user>` o remove. O motivo vai para o registro de auditoria como `moderator | reason`.

## Banimentos, expulsões e softbans

`ban <user> [reason]` envia uma DM ao membro primeiro e depois bane. `ban <time> <user> [reason]` é um banimento temporário que se encerra sozinho, até 49 dias. `ban <pruneTime> <time> <user>` define explicitamente a janela de limpeza e a duração do banimento. Banir por ID funciona para pessoas que não estão no servidor. `unban <user or id>` o reverte.

`softban <user> [reason]` bane e desbane imediatamente, o que é uma expulsão que também exclui mensagens recentes. `kick <user> [reason]` expulsa, e `masskick @a @b @c` expulsa várias pessoas de uma vez e informa quantas tiveram sucesso. `masskill` é exclusivo do dono do bot e bane em massa uma lista colada de IDs.

### A DM de banimento

A mensagem enviada a um membro banido pode ser personalizada com `banmessage <text or embed code>`. O texto passa pelo analisador de embeds, então qualquer coisa do construtor de embeds funciona. Defina como `-` para não enviar nenhuma DM e use `banmsgreset` para voltar ao padrão. `banmsgtest [duration] [reason]` envia o modelo atual para você ver como ficou.

| Placeholder | Valor |
| --- | --- |
| `%ban.mod%` | O nome completo do moderador |
| `%ban.mod.name%` | O nome de usuário do moderador |
| `%ban.user%` | O nome completo do membro banido |
| `%ban.user.name%` | O nome de usuário do membro banido |
| `%ban.reason%` ou `%reason%` | O motivo, ou `-` se não houver |
| `%ban.duration%` | A duração no formato `d.hh:mm`, ou `perma` |

Placeholders do servidor, como `%server.name%`, também funcionam aqui.

## Limpeza de banimento

Todo banimento carrega uma limpeza: o número de dias das mensagens do membro que o Discord exclui com ele, de 0 a 7. Em vez de um número global, cada tipo de banimento tem seu próprio padrão, e você pode substituir qualquer um deles para o servidor inteiro, para uma categoria ou para um único canal.

| Ação | Chave | Padrão integrado |
| --- | --- | --- |
| Ban | `ban` | 7 dias |
| Banimento por ID | `hackban` | 7 dias |
| Banimento temporário | `tempban` | nenhum |
| Softban | `softban` | 7 dias |
| Banimento em massa | `massban` | 7 dias |
| Banimento por hash de avatar | `banbyhash` | nenhum |
| Banimento em um cargo | `baninrole` | nenhum |
| Banimento por idade | `banunder` | nenhum |
| Punição por advertência | `warnpunish` | nenhum |
| Cargo de banimento automático | `autobanrole` | nenhum |
| Monitor de cargos | `rolemonitor` | nenhum |
| Filtro | `filter` | nenhum |
| Lockdown | `lockdown` | nenhum |
| Painel | `dashboard` | nenhum |

Quando um banimento acontece, o bot procura a configuração mais específica: o canal em que o comando foi executado, depois a categoria desse canal e depois o padrão do servidor. Dentro de cada nível, uma configuração para a ação exata vence uma definida para "todas as ações". Se nada corresponder, vale o padrão integrado.

`banprune` mostra o que um banimento a partir do canal atual limparia, além de todas as configurações definidas. `banpruneset <action|all> <days> [#channel or category]` define uma, `banpruneclear <action|all> [#channel or category]` remove uma e `banprunereset` apaga todas.

A aba **Limpeza de banimento** do painel lista todas as ações em **Padrões do servidor** com uma caixa de dias para cada, uma linha de reserva **Todas as ações** e uma seção **Exceções** em que você escolhe um **Escopo** (Canal ou Categoria), o alvo, uma **Ação** e a **Limpeza (dias)**.

## Limpeza de mensagens

`purge [count] [flags]` exclui até 1000 mensagens no canal atual. Sem contagem, exclui as últimas 100 mensagens do próprio bot. `purge @user [count]` exclui apenas as mensagens daquele membro das últimas duas semanas. As flags podem ser combinadas: `-s` pula mensagens fixadas, `-nb` pula bots, `-ob` apenas bots, `-he` apenas mensagens com embeds, `-ne` apenas sem, `-c text` apenas mensagens que contenham o texto, `-b date` antes de uma data e `-a date` depois de uma.

`purgeuser <user> <count>` pesquisa as últimas `count` mensagens (1 a 1000) de cada canal de texto e exclui as mensagens daquele usuário em cada um.

## Apelidos

`dehoist <user>` e `sanitize <user>` reescrevem o apelido de um membro para remover caracteres especiais ou incomuns no início. `dehoistall [nicksOnly]` e `sanitizeall` fazem isso para todos após uma confirmação, executando como uma tarefa em segundo plano; `massnickprogress` informa o progresso e `massnickstop` a cancela. Os comandos para um único membro exigem que o bot tenha Gerenciar apelidos; as variantes "all" exigem que o bot tenha Administrador. Em ambos os casos, o cargo do bot precisa estar acima dos membros afetados.

## Configurações

A página do painel tem cinco abas: **Visão geral** (contagens de advertências), **Avisos**, **Punições**, **Atividade recente** e **Limpeza de banimento**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Canal de logs de avisos | nenhum | Canal que recebe um embed para cada advertência |
| Escada de punições | vazia | O que dispara em cada contagem de advertências |
| Expiração de advertências | desativada | Dias até uma advertência ser limpa ou excluída, apenas por comando |
| Cargo de mute | `Mewdeko-mute` | O cargo aplicado pelos comandos de mute, apenas por comando |
| Remover cargos ao silenciar | desativado | Remove e restaura cargos em torno de um mute completo, apenas por comando |
| Modelo da DM de banimento | embed padrão | A DM que um membro banido recebe, apenas por comando |
| Padrões de limpeza de banimento | por ação | Dias de mensagens excluídas com cada tipo de banimento |
| Exceções de limpeza de banimento | nenhuma | Limpeza por canal ou por categoria |

Na aba **Avisos**, a equipe pode advertir um membro pelo ID de usuário com um motivo obrigatório, pesquisar por ID, motivo ou moderador, ocultar advertências perdoadas, perdoar uma advertência, perdoar todas de um membro ou excluir uma permanentemente.

> [!WARNING]
> Excluir uma advertência pelo painel a remove de vez e ela deixa de contar. Perdoar mantém o registro e também faz a advertência deixar de contar. Perdoe, a menos que você tenha um motivo para apagar o histórico.

## Passo a passo de configuração

1. Abra **Moderação** no painel e vá para **Punições**.
2. Escolha um **Canal de logs de avisos** que somente a equipe possa ler.
3. Adicione regras à escada. Um começo suave é Mute por 60 minutos em 2, Timeout por 1440 minutos em 3, Ban em 5.
4. Execute `muterole @Muted` se você já tiver um cargo de silenciado; caso contrário, deixe o bot criar `Mewdeko-mute` no primeiro uso.
5. Decida a expiração com `warnexpire 90 clear` para que advertências antigas deixem de contar após três meses.
6. Em **Limpeza de banimento**, defina **Banimento temporário** como 0 se você não quiser que banimentos temporários excluam o histórico, e adicione exceções de canal se um canal de spam de bots precisar limpar mais.
7. Teste com uma conta alternativa: `warn @alt test`, confira o canal de logs e depois `warnclear @alt`.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `warn <user> [reason]` | | Banir membros | Adverte um membro e aplica qualquer punição da escada |
| `warnlog <user or id>` | | Banir membros | Mostra as advertências de um membro |
| `warnlogall` | | Banir membros | Mostra a contagem de advertências de todos |
| `warnclear <user> [index]` | `warnc` | Banir membros | Perdoa todas as advertências, ou uma pelo número |
| `warnexpire <days> <clear|delete>` | `warne` | Administrador | Limpa ou exclui automaticamente as advertências após um número de dias |
| `warnpunish <number> <punishment> [time]` | `warnp` | Banir membros | Define uma regra da escada, ou a remove se houver apenas um número |
| `warnpunishlist` | `warnpl` | Ninguém | Mostra a escada de punições |
| `setwarnchannel <#channel>` | `warnchannel` | Administrador | Define o canal de logs de advertências |
| `mwarn <user> [reason]` | `miniwarn` | Silenciar membros | Emite uma mini advertência |
| `mwarnlog [page] [user or id]` | | Silenciar membros, ou Ninguém para o seu próprio | Mostra as mini advertências |
| `mwarnlogall` | `mwarnlogs` | Silenciar membros | Contagem de mini advertências de todos |
| `mwarnclear <user or id> [index]` | `mwarnc` | Administrador | Perdoa mini advertências |
| `mwarnexpire <days> [clear|delete]` | `mwarne` | Administrador | Expiração de mini advertências |
| `mwarnpunish <number> <punishment> [time]` | `mwarnp` | Administrador | Define ou remove uma regra da escada de mini advertências |
| `mwarnpunishlist` | `mwarnplist`, `mwarnpl` | Ninguém | Mostra a escada de mini advertências |
| `setmwarnchannel <#channel>` | `mwarnchannel` | Administrador | Define o canal de logs de mini advertências |
| `timeout <time> <user> [reason]` | | Gerenciar membros | Aplica timeout a um membro, até 28 dias |
| `untimeout <user>` | | Gerenciar membros | Remove um timeout |
| `mute <user> [time] [reason]` | | Gerenciar cargos ou Silenciar membros | Mute completo, opcionalmente com tempo |
| `unmute <user> [reason]` | | Gerenciar cargos ou Silenciar membros | Remove um mute completo |
| `chatmute [time] <user> [reason]` | | Gerenciar cargos | Somente o cargo de mute |
| `chatunmute <user> [reason]` | | Gerenciar cargos | Remove um mute de chat |
| `voicemute [time] <user> [reason]` | | Silenciar membros | Somente mute de voz |
| `voiceunmute <user> [reason]` | | Silenciar membros | Remove um mute de voz |
| `stfu [time] <user>` | `cmute`, `channelmute` | Silenciar membros | Nega o envio de mensagens somente no canal atual |
| `unstfu <user>` | `unchannelmute` | Silenciar membros | Desfaz `stfu` |
| `muterole [role]` | `setmuterole` | Gerenciar cargos | Mostra ou define o cargo de mute |
| `removeonmute <y|n>` | | Administrador | Remove e restaura cargos em torno de mutes completos |
| `unmuteall [reason]` | `umall` | Administrador | Remove o mute de todos que têm o cargo de mute |
| `kick <user or id> [reason]` | `k` | Expulsar membros | Expulsa um membro |
| `masskick <users...>` | `mkick` | Expulsar membros | Expulsa vários membros |
| `ban [time] <user or id> [reason]` | `b` | Banir membros | Bane, ou bane temporariamente por até 49 dias |
| `unban <user or id>` | | Banir membros | Remove um banimento |
| `softban <user or id> [reason]` | `sb` | Expulsar membros e Gerenciar mensagens | Bane e depois desbane para excluir mensagens |
| `banmessage [text]` | `banmsg`, `bantemplate`, `bantemp` | Banir membros | Mostra ou define a DM de banimento, `-` para desativar |
| `banmsgreset` | | Banir membros | Restaura a DM de banimento padrão |
| `banmsgtest [time] [reason]` | | Banir membros | Envia por DM a você o modelo de banimento |
| `masskill <ids and reasons>` | | Dono do bot | Bane em massa uma lista colada |
| `banprune` | `banpurge` | Banir membros | Mostra as configurações de limpeza efetivas e definidas |
| `banpruneset <action|all> <days> [channel]` | `banpurgeset` | Administrador | Define uma configuração de limpeza |
| `banpruneclear <action|all> [channel]` | `banpurgeclear` | Administrador | Remove uma configuração de limpeza |
| `banprunereset` | `banpurgereset` | Administrador | Remove todas as configurações de limpeza |
| `purge [count or user] [count] [flags]` | `clear`, `prune` | Gerenciar mensagens | Exclui mensagens em massa neste canal |
| `purgeuser <user> <count>` | `pruneuser` | Gerenciar mensagens | Exclui as mensagens de um usuário em todos os canais |
| `dehoist <user>` | | Gerenciar apelidos | Corrige um apelido que está no topo da lista |
| `dehoistall [nicksOnly]` | `dehoista` | Gerenciar apelidos | Corrige todos os apelidos que estão no topo da lista |
| `sanitize <user>` | | Gerenciar apelidos | Normaliza um apelido |
| `sanitizeall` | `sanitizea` | Gerenciar apelidos | Normaliza todos os apelidos |
| `massnickprogress` | `mnickprogress`, `mnp` | Administrador | Progresso de um dehoist ou sanitize em andamento |
| `massnickstop` | `mnstop`, `mns` | Administrador | Interrompe um dehoist ou sanitize em andamento |

## Dicas e armadilhas

- O cargo do bot precisa ficar acima de qualquer pessoa que ele silencie, expulse ou bana, e acima do próprio cargo de mute. A maioria dos erros de "não é possível aplicar a punição" são problemas de hierarquia.
- O bot precisa de Banir membros, Expulsar membros, Gerenciar membros (Moderate Members), Gerenciar cargos e Gerenciar mensagens para os comandos correspondentes; cada comando verifica a permissão do próprio bot antes de executar.
- A escada só dispara em uma contagem exata. Preencha cada etapa que lhe interessa em vez de supor "3 ou mais".
- Somente as advertências emitidas pelo bot contam. Os timeouts e banimentos nativos do Discord não adicionam advertências.
- O cargo de mute nega permissões por canal. Canais criados depois que o cargo existe recebem a sobreposição na próxima vez que alguém for silenciado, não imediatamente.
- O Discord só permite que a exclusão em massa alcance 14 dias atrás. Mensagens mais antigas são puladas pelos comandos de limpeza.
- A limpeza no banimento é limitada a 7 dias pelo Discord, não importa o que você configure.
- As advertências feitas pelo painel precisam de um motivo válido e usam a sua conta do painel como o nome do moderador.

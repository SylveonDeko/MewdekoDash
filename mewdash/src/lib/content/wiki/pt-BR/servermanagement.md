---
title: Gerenciamento do servidor
slug: servermanagement
summary: Ferramentas em massa para a estrutura do seu servidor: crie e exclua canais e cargos, dê cargos a centenas de membros em uma única tarefa, bloqueie o servidor, sincronize exceções de canal, roube emotes e vigie alterações perigosas de cargos.
icon: fa-server
category: Actions
module: ServerManagement
tags: [server management, roles, mass role, channels, lockdown, slowmode, lock channel, nuke, emotes, steal emotes, webhook, permcontrol, role monitor, role jobs, server icon, server banner, gerenciamento do servidor, cargos, cargo em massa, canais, bloqueio, modo lento, bloquear canal, emotes, roubar emotes, monitor de cargos, ícone do servidor, banner do servidor]
related: [administration, permissions, moderation]
---

## O que faz

O Gerenciamento do servidor reúne os comandos que alteram a estrutura de um servidor, e não as pessoas dentro dele. A equipe pode criar uma categoria e todos os seus canais em uma linha, renomear ou excluir canais, definir tópicos, alternar NSFW, definir modo lento, bloquear um canal ou excluir e recriar um para apagar seu histórico.

Os cargos recebem mais atenção. Comandos avulsos criam, renomeiam, recolorem, destacam e excluem cargos ou dão um cargo a um único membro, com um temporizador opcional. Comandos em massa adicionam ou removem um cargo para todos os membros, todos os humanos, todos os bots, todos de outro cargo ou todos que entraram antes ou depois de uma data de corte. Eles rodam como tarefas em segundo plano que você pode listar e interromper.

O módulo também cobre a aparência do próprio servidor (ícone, banner, splash, nome), o gerenciamento de emotes, incluindo roubar emotes de outros servidores, exceções de permissão por canal, movimentação em canais de voz, três tipos de bloqueio e um monitor de cargos que reverte e pune alterações perigosas de cargos.

Nada aqui é configurado no painel. Tudo é executado por comandos.

## Por que usar

- Configurar um servidor novo e querer dez canais sob uma categoria sem clicar dez vezes na interface do Discord.
- Dar um cargo de "Membro" a dois mil membros existentes depois de ativar o bloqueio por cargo.
- Bloquear o servidor durante um raid para que ninguém possa postar e depois restaurar exatamente as permissões antigas.
- Copiar emotes do servidor de um amigo com um único comando.
- Impedir que um moderador dê a si mesmo Administrador adicionando uma permissão proibida a um cargo.

## Canais

### Criação e edição

`creatxtchanl <name>` e `creatvoichanl <name>` criam um único canal de texto ou de voz. `deltxtchanl <#channel>` e `delvoichanl <channel>` excluem um.

A família `cc...` cria vários de uma vez:

| Comando | O que cria |
| --- | --- |
| `ccatc <category name> <channel names...>` | Uma nova categoria e canais de texto dentro dela |
| `ccavc <category name> <channel names...>` | Uma nova categoria e canais de voz dentro dela |
| `cctc <existing category> <channel names...>` | Canais de texto dentro de uma categoria que já existe |
| `ccvc <existing category> <channel names...>` | Canais de voz dentro de uma categoria que já existe |

`renamechannel <channel> <name>` renomeia qualquer canal, `setchanlname <name>` renomeia aquele em que você está, `settopic [text]` define ou limpa o tópico do canal atual e `nsfwtoggle` alterna o sinalizador NSFW do canal atual.

### Modo lento, bloqueio e nuke

`slowmode` sozinho alterna o canal atual entre um minuto e desligado. `slowmode <time>`, como `slowmode 30s`, define um intervalo específico, e ambas as formas aceitam um canal como argumento. Qualquer valor de 21600 segundos (seis horas) ou mais é recusado.

`lock [#channel]` adiciona uma negação de Enviar mensagens para o cargo `@everyone` nesse canal; `unlock [#channel]` a remove. Os bits de exceção existentes são mantidos.

`nuke [#channel]` pede confirmação, exclui o canal e cria um novo com o mesmo nome, posição, tópico, exceções de permissão, sinalizador NSFW, categoria e modo lento. Pins, webhooks e o histórico de mensagens são perdidos para sempre.

### Exceções de permissão

`permcontrol <channel> <allow|deny|inherit> <role or user> <permissions...>` edita a exceção de um alvo em um canal sem mexer nos outros bits. `permview [@user or role]` lista quais permissões você, um membro ou um cargo têm atualmente.

`syncroletoall <role>` copia a exceção do cargo do canal atual para todos os canais de texto e categorias. `syncroletoallchannels` e `syncroletoallcategories` fazem apenas canais ou apenas categorias. O cargo já precisa ter uma exceção no canal em que você executa o comando.

### Webhooks

`createwebhook <#channel> <name> [avatar url]` cria um webhook. Uma imagem anexada é usada como avatar se você não informar uma URL. O bot confirma no canal e envia a URL e o token do webhook para você por DM.

## Voz

- `moveto <voice channel>` move você.
- `moveuserto @user <voice channel>` move outra pessoa.
- `grab @user` puxa alguém para o canal de voz em que você está.

## Bloqueio

`lockdown [type] [action] [override]` e `liftlockdown [type]` exigem Administrador.

| Tipo | O que faz |
| --- | --- |
| `Joins` | Qualquer pessoa que entrar enquanto está ativo é expulsa ou banida. A ação é `Ban` por padrão; `Kick` é a única outra opção. |
| `Readonly` | O bot salva a exceção atual de `@everyone` de cada canal e depois nega Enviar mensagens, criação de threads e respostas em threads nos canais de texto, e Conectar e Falar nos canais de voz. Canais de fórum mantêm Enviar mensagens para que as threads existentes continuem legíveis. |
| `Full` | Ambos os anteriores. |

Antes de aplicar um bloqueio somente leitura, o bot verifica se consegue editar todos os canais. Se algum estiver faltando, ele os lista e para, a menos que você passe `true` como terceiro argumento para continuar mesmo assim. Encerrar o bloqueio restaura as exceções salvas. Bloqueios de entrada sobrevivem à reinicialização do bot.

`unlockdown` é uma ferramenta separada e mais antiga: ela reativa Enviar mensagens no próprio cargo `@everyone`, para servidores que bloquearam editando esse cargo.

> [!WARNING]
> `lockdown` sem argumentos é um bloqueio somente leitura, e `lockdown joins` bane quem entra por padrão. Passe `kick` se for isso que você quer.

## Cargos

### Comandos de um único cargo

| Comando | O que faz |
| --- | --- |
| `createrole [name]` | Cria um cargo, não mencionável |
| `deleterole <role>` | Exclui um cargo abaixo do seu cargo mais alto |
| `renamerole <role> <name>` | Renomeia um cargo |
| `rolecolor <role> [colour]` | Mostra a cor do cargo ou a define |
| `rolehoist <role>` | Alterna se o cargo é exibido separadamente na lista de membros |
| `setrole <role> @user [time]` | Dá um cargo, removendo-o novamente depois de `time`, como `2h`, se informado |
| `removerole <role> @user` | Retira um cargo |
| `removeallroles @user` | Remove todos os cargos não gerenciados de um membro |

Os argumentos de cargo e membro podem ser dados em qualquer ordem em `setrole` e `removerole`.

### Vários cargos ou membros de uma vez

- `createroles <names...>` cria um cargo por palavra depois de confirmar a lista.
- `deleteroles <roles...>` exclui vários cargos após confirmação; cargos gerenciados são ignorados.
- `setroles @user <roles...>` dá vários cargos a um membro; `setroles @user <time> <roles...>` os torna temporizados.
- `removeroles @user <roles...>` remove vários cargos de um membro.
- `adduserstorole <role> @user @user...` e `removeusersfromrole <role> @user @user...` funcionam com vários membros.

### Tarefas de cargo em massa

Elas percorrem toda a lista de membros e rodam como tarefas em segundo plano. Por causa dos limites de taxa do Discord, o bot faz uma breve pausa por membro e só permite cinco tarefas por servidor ao mesmo tempo. Cada tarefa informa quanto tempo espera levar.

| Comando | Quem é afetado |
| --- | --- |
| `addtoall <role>` | Todos os membros que não têm o cargo |
| `addtoallusers <role>` | Apenas humanos |
| `addtoallbots <role>` | Apenas bots |
| `addtousersover <time> <role>` | Membros que entraram há pelo menos `time`, por exemplo `30d` |
| `addtousersunder <time> <role>` | Membros que entraram há menos de `time` |
| `addroletorole <role> <role2>` | Dá `role` a todos em `role2` |
| `addthenremove <role> <role2>` | Dá `role` a todos em `role2` e depois remove `role2` |
| `removefromall <role>` | Todos que têm o cargo |
| `removefromallusers <role>` | Apenas humanos |
| `removefromallbots <role>` | Apenas bots |
| `removefromrole <role> <role2>` | Remove `role` de todos em `role2` |

`rolejobs` lista as tarefas em execução com tipo, quem as iniciou, progresso e cargos. `stopjob <number>` cancela uma e informa até onde ela chegou.

### Exportar e importar

`exportrolelist` envia um arquivo `rolelist.txt` com uma linha `roleId,userId,roleName` por associação, para cada cargo que o bot pode gerenciar. `importrolelist` lê um arquivo desse tipo anexado ao comando e reaplica os cargos; passe `true` para criar cargos pelo nome quando os IDs não existirem mais. `addroletolist <role>` lê uma lista anexada de IDs de usuário e dá o cargo a eles.

## Aparência do servidor e emotes

`seticon <url>`, `setbanner <url>`, `setsplash <url>` e `setservername <name>` alteram o próprio servidor e exigem Administrador. `setguildavatar`, `setguildbanner` e `setguildbio` mudam como o próprio bot aparece somente neste servidor e exigem Gerenciar servidor.

Os comandos de emote exigem Gerenciar expressões tanto de você quanto do bot:

- `addemote <name> [url]` envia um emote a partir de uma URL ou de uma imagem anexada.
- `removeemote <emote>` e `renameemote <emote> <name>` funcionam com emotes deste servidor.
- `stealemotes <emotes...>` copia para este servidor todos os emotes personalizados da sua mensagem. `sfr <role> <emotes...>` faz o mesmo, mas restringe os emotes a um cargo.
- Clicar com o botão direito em uma mensagem e escolher **Roubar emotes** ou **Roubar sticker** no menu Apps faz o mesmo sem digitar.

## Monitor de cargos

O monitor de cargos observa o registro de auditoria. Quando um membro recebe um cargo proibido, ou um cargo ganha uma permissão proibida, o bot reverte a alteração e pune quem a fez. Somente o dono do servidor pode configurá-lo.

- `addblacklistedrole <role> [punishment]` e `removeblacklistedrole <role>`.
- `addblacklistedpermission <permission> [punishment]` e `removeblacklistedpermission <permission>`, por exemplo `addblacklistedpermission Administrator Ban`.
- `setdefaultpunishment <punishment>` define o que acontece quando uma entrada proibida não tem punição própria. O padrão é `None`.
- `addwhitelisteduser @user`, `addwhitelistedrole <role>` e seus pares `remove...` isentam a equipe do monitor. Alterações feitas por ou em pessoas na lista de permitidos são ignoradas.
- `listblacklists` mostra tudo isso.

Os valores de punição são `None`, `Warn`, `Mute`, `ChatMute`, `VoiceMute`, `Timeout`, `Kick`, `Softban`, `Ban`, `RemoveRoles`, `AddRole` e `Delete`. Quando várias permissões proibidas são adicionadas de uma vez, vale a punição mais severa.

## Configurações

Não há página no painel. As únicas configurações armazenadas pertencem ao monitor de cargos e ao estado do bloqueio.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Punição padrão | None | Aplicada quando um cargo ou permissão proibida não tem punição definida |
| Cargos proibidos | nenhum | Cargos que são removidos quando dados, com uma punição opcional para cada |
| Permissões proibidas | nenhuma | Permissões revertidas quando adicionadas a um cargo, com uma punição opcional para cada |
| Usuários e cargos permitidos | nenhum | Isentos do monitor |
| Ação do bloqueio de entrada | Ban | O que acontece com membros que entram durante um bloqueio de entrada |

## Passo a passo de configuração

1. Verifique se o cargo do bot está acima de todos os cargos que você quer que ele gerencie e se ele tem Gerenciar cargos e Gerenciar canais.
2. Monte o layout: `ccatc Community general off-topic memes` cria a categoria e três canais.
3. Crie cargos de uma só vez: `createroles Member Regular Veteran`.
4. Distribua o cargo base: `addtoallusers Member` e acompanhe com `rolejobs`.
5. Como dono do servidor, proteja o servidor: `addblacklistedpermission Administrator Ban` e `addwhitelistedrole Admin`.
6. Tenha `lockdown full kick` em mente para emergências e teste `liftlockdown full` depois, em um dia tranquilo.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `permview [@user or role]` | `pview` | Ninguém | Listar permissões concedidas |
| `setsplash <url>` | `setserversplash`, `setsplashimage` | Administrador | Definir o splash do convite |
| `seticon <url>` | `setservericon`, `seticonimage` | Administrador | Definir o ícone do servidor |
| `setbanner <url>` | `setserverbanner` | Administrador | Definir o banner do servidor |
| `setservername <name>` | | Administrador | Renomear o servidor |
| `setguildavatar [url]` | `sgav`, `setgav` | Gerenciar servidor | Avatar do bot neste servidor |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Gerenciar servidor | Banner do bot neste servidor |
| `setguildbio <text>` | `sgbio`, `setgbio` | Gerenciar servidor | Bio do bot neste servidor |
| `addemote <name> [url]` | `emoteadd`, `ae`, `ea` | Gerenciar expressões | Enviar um emote |
| `removeemote <emote>` | `deleteemote`, `emoteremove`, `emotedelete` | Gerenciar expressões | Excluir um emote |
| `renameemote <emote> <name>` | `emoterename` | Gerenciar expressões | Renomear um emote |
| `stealemotes <emotes...>` | `steal` | Gerenciar expressões | Copiar emotes para este servidor |
| `sfr <role> <emotes...>` | | Gerenciar expressões | Copiar emotes, restritos a um cargo |
| `creatxtchanl <name>` | `ctch` | Gerenciar canais | Criar um canal de texto |
| `creatvoichanl <name>` | `cvch` | Gerenciar canais | Criar um canal de voz |
| `deltxtchanl <#channel>` | `dtch` | Gerenciar canais | Excluir um canal de texto |
| `delvoichanl <channel>` | `dvch` | Gerenciar canais | Excluir um canal de voz |
| `ccatc <category> <names...>` | | Gerenciar canais | Nova categoria com canais de texto |
| `ccavc <category> <names...>` | | Gerenciar canais | Nova categoria com canais de voz |
| `cctc <category> <names...>` | | Gerenciar canais | Canais de texto em uma categoria existente |
| `ccvc <category> <names...>` | | Gerenciar canais | Canais de voz em uma categoria existente |
| `renamechannel <channel> <name>` | `channelrename` | Gerenciar canais | Renomear um canal |
| `setchanlname <name>` | `schn` | Gerenciar canais | Renomear o canal atual |
| `settopic [text]` | `st` | Gerenciar canais | Definir ou limpar o tópico atual |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Gerenciar canais | Alternar o sinalizador NSFW |
| `slowmode [time] [#channel]` | | Gerenciar canais | Alternar ou definir o modo lento |
| `lock [#channel]` | `channellock`, `lockchannel` | Gerenciar mensagens | Negar Enviar mensagens para todos |
| `unlock [#channel]` | `channelunlock`, `unlockchannel` | Gerenciar mensagens | Desfazer `lock` |
| `nuke [#channel]` | `channelnuke`, `nukechannel` | Gerenciar canais | Excluir e recriar um canal |
| `permcontrol <channel> <allow|deny|inherit> <role or user> <perms...>` | `permc` | Gerenciar canais | Editar uma exceção de canal |
| `syncroletoall <role>` | `synctoall` | Gerenciar canais | Copiar uma exceção para todos os canais e categorias |
| `syncroletoallchannels <role>` | `srtch`, `srtach` | Gerenciar canais | Copiar uma exceção para os canais de texto |
| `syncroletoallcategories <role>` | `srtc`, `srtac` | Gerenciar canais | Copiar uma exceção para as categorias |
| `createwebhook <#channel> <name> [avatar]` | `cwh` | Administrador | Criar um webhook |
| `moveto <voice channel>` | | Ninguém | Mover você mesmo |
| `moveuserto @user <voice channel>` | `moveuto` | Gerenciar canais | Mover alguém |
| `grab @user` | `getoverhere` | Ninguém | Puxar alguém para o seu canal de voz |
| `lockdown [joins|readonly|full] [kick|ban] [true]` | `lockdownserver` | Administrador | Iniciar um bloqueio |
| `liftlockdown [type]` | `unlockserver` | Administrador | Encerrar um bloqueio |
| `unlockdown` | `endlockdown` | Gerenciar canais | Reativar Enviar mensagens em `@everyone` |
| `createrole [name]` | `cr` | Gerenciar cargos | Criar um cargo |
| `deleterole <role>` | `dr` | Gerenciar cargos | Excluir um cargo |
| `renamerole <role> <name>` | `renr` | Gerenciar cargos | Renomear um cargo |
| `rolecolor <role> [colour]` | `roleclr` | Gerenciar cargos para definir | Mostrar ou definir a cor de um cargo |
| `rolehoist <role>` | `rh` | Gerenciar cargos | Alternar o destaque |
| `setrole <role> @user [time]` | `sr`, `giverole` | Gerenciar cargos | Dar um cargo, opcionalmente temporizado |
| `removerole <role> @user` | `rr` | Gerenciar cargos | Remover um cargo |
| `removeallroles @user` | `rar` | Gerenciar cargos | Retirar todos os cargos |
| `createroles <names...>` | `croles`, `crs` | Gerenciar cargos | Criar vários cargos |
| `deleteroles <roles...>` | `drs` | Gerenciar cargos | Excluir vários cargos |
| `setroles @user [time] <roles...>` | `srs` | Gerenciar cargos | Dar vários cargos |
| `removeroles @user <roles...>` | `rrs` | Gerenciar cargos | Remover vários cargos |
| `adduserstorole <role> @users...` | `autr` | Gerenciar cargos | Dar um cargo a vários membros |
| `removeusersfromrole <role> @users...` | `rufr` | Gerenciar cargos | Remover um cargo de vários membros |
| `addtoall <role>` | `ata` | Gerenciar cargos | Cargo para todos os membros |
| `addtoallusers <role>` | `atau` | Gerenciar cargos | Cargo para todos os humanos |
| `addtoallbots <role>` | `atab` | Gerenciar cargos | Cargo para todos os bots |
| `addtousersover <time> <role>` | `atuo` | Gerenciar cargos | Cargo para membros que entraram há pelo menos esse tempo |
| `addtousersunder <time> <role>` | `atuu` | Gerenciar cargos | Cargo para membros que entraram mais recentemente |
| `addroletorole <role> <role2>` | `artr` | Gerenciar cargos | Cargo para todos de outro cargo |
| `addthenremove <role> <role2>` | `atr` | Gerenciar cargos | Trocar um cargo por outro |
| `removefromall <role>` | `rfa` | Gerenciar cargos | Remover de todos os membros |
| `removefromallusers <role>` | `rfau` | Gerenciar cargos | Remover de todos os humanos |
| `removefromallbots <role>` | `rfab` | Gerenciar cargos | Remover de todos os bots |
| `removefromrole <role> <role2>` | `rfr` | Gerenciar cargos | Remover de todos de outro cargo |
| `rolejobs` | `rj` | Gerenciar cargos | Listar tarefas de cargo em massa em execução |
| `stopjob <number>` | `sj` | Gerenciar cargos | Cancelar uma tarefa |
| `exportrolelist` | `exportroles`, `erl` | Gerenciar cargos | Baixar as associações de cargos |
| `importrolelist [true]` | `importroles`, `irl` | Gerenciar cargos | Reaplicar uma lista exportada |
| `addroletolist <role>` | `artl` | Gerenciar cargos | Dar um cargo a uma lista anexada de IDs de usuário |
| `setdefaultpunishment <action>` | `sdp`, `defaultpunishment`, `setdefpunishment` | Dono do servidor | Punição de reserva do monitor de cargos |
| `addblacklistedrole <role> [action]` | `abr`, `blacklistrole`, `addbrole` | Dono do servidor | Vigiar um cargo |
| `removeblacklistedrole <role>` | `rbr`, `unblacklistrole`, `removebrole` | Dono do servidor | Parar de vigiar um cargo |
| `addblacklistedpermission <permission> [action]` | `abp`, `blacklistpermission`, `addbpermission` | Dono do servidor | Vigiar uma permissão |
| `removeblacklistedpermission <permission>` | `rbp`, `unblacklistpermission`, `removebpermission` | Dono do servidor | Parar de vigiar uma permissão |
| `addwhitelisteduser @user` | `awu`, `whitelistuser`, `addwuser` | Dono do servidor | Isentar um membro |
| `removewhitelisteduser @user` | `rwu`, `unwhitelistuser`, `removewuser` | Dono do servidor | Remover uma isenção |
| `addwhitelistedrole <role>` | `awr`, `whitelistrole`, `addwrole` | Dono do servidor | Isentar um cargo |
| `removewhitelistedrole <role>` | `rwr`, `unwhitelistrole`, `removewrole` | Dono do servidor | Remover uma isenção |
| `listblacklists` | `lbl`, `blacklists`, `listbws` | Dono do servidor | Mostrar as listas do monitor |

## Dicas e armadilhas

- Os comandos de cargo verificam a hierarquia duas vezes: seu cargo mais alto e o cargo mais alto do bot devem estar ambos acima do cargo em questão. O dono do servidor ignora a verificação do próprio lado.
- As tarefas em massa levam cerca de um segundo por membro. Adicionar um cargo a cinco mil membros leva bem mais de uma hora, e o bot recusa uma sexta tarefa simultânea.
- `syncroletoall` e suas variantes exigem que o cargo já tenha uma exceção no canal em que você as executa; essa exceção é o que será copiado.
- `nuke` não pode ser desfeito e a confirmação é a única salvaguarda.
- O bloqueio somente leitura edita as exceções de todos os canais, o que são muitas chamadas de API em servidores grandes. Encerre-o com `liftlockdown`, e não manualmente, para que as exceções salvas sejam restauradas.
- O monitor de cargos depende do registro de auditoria, então o bot precisa de Ver registro de auditoria, e da permissão necessária para a punição que você escolher.
- Roubar emotes exige slots de emote livres; as falhas são listadas em "Errored Emotes".

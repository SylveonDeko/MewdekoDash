---
title: Permissões de comandos
slug: permissions
summary: Decida quem pode executar quais comandos e onde, com uma lista ordenada de regras de permitir e negar para comandos e módulos, aplicadas ao servidor inteiro, a um cargo, a um canal, a uma categoria ou a um único membro.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Permissions
tags: [permissions, command permissions, allow, deny, permission role, verbose, disable command, disable module, cooldown, dpo, permission override, blacklist, permissões, permissões de comandos, permitir, negar, cargo de permissões, desativar comando, desativar módulo, exceção de permissão, lista negra]
related: [administration, help, filter, moderation]
---

## O que faz

Por padrão, todo comando está disponível para todos que as permissões do Discord permitirem. As Permissões de comandos adicionam uma lista de regras específica do servidor por cima. Cada regra diz se um comando, um módulo ou todos os módulos estão permitidos ou negados para o servidor inteiro, um cargo, um canal, uma categoria ou um membro. Quando alguém executa um comando, o bot percorre a lista, aplica a primeira regra que corresponde e deixa o comando passar ou o impede.

Os comandos bloqueados falham em silêncio, a menos que o modo **detalhado** (verbose) esteja ativado; nesse caso, o bot responde com o número e o texto da regra que o bloqueou. Os comandos de barra sempre recebem uma explicação efêmera.

As regras podem ser gerenciadas por administradores ou por qualquer pessoa com o **cargo de permissões** que você escolher. A mesma lista está no painel em **Administração**, na seção **Automação e configurações**, como o cartão **Permissões de comandos**.

Duas ferramentas relacionadas ficam ao lado. Os cooldowns de comandos limitam a frequência com que um comando pode ser usado por membro em um servidor. As exceções de permissão do Discord, no módulo Administração, substituem a permissão do Discord que um comando normalmente exige, por exemplo permitindo que quem tem Gerenciar mensagens use um comando que normalmente exige Administrador.

## Por que usar

- Manter comandos divertidos e NSFW fora de canais sérios.
- Desativar o módulo de Música em todos os lugares, exceto em um canal de comandos do bot.
- Deixar um cargo de ajudante usar `warn` sem dar Gerenciar mensagens ou Administrador.
- Impedir que um membro disruptivo use o bot por completo.
- Limitar a taxa de um comando barulhento como `roll` a uma vez a cada dez segundos por membro.

## Como uma regra é escrita

Toda regra tem três partes.

| Parte | Opções |
| --- | --- |
| O quê | Um comando, um módulo ou todos os módulos |
| Para | O servidor inteiro, um cargo, um canal, uma categoria ou um usuário específico |
| Ação | Permitir ou negar |

Os nomes dos comandos na tabela abaixo codificam as duas primeiras partes. As primeiras letras escolhem o alvo (`s` servidor, `r` cargo, `c` canal, `ca` categoria, `u` usuário), as últimas escolhem o escopo (`cmd` comando, `mdl` módulo), e as formas `all...mdls` cobrem todos os módulos.

| Comando | Regra criada |
| --- | --- |
| `srvrcmd <command> <enable|disable>` | Um comando para o servidor inteiro |
| `srvrmdl <module> <enable|disable>` | Um módulo para o servidor inteiro |
| `allsrvrmdls <enable|disable>` | Todos os módulos para o servidor inteiro |
| `rolecmd <command> <enable|disable> <role>` | Um comando para um cargo |
| `rolemdl <module> <enable|disable> <role>` | Um módulo para um cargo |
| `allrolemdls <enable|disable> <role>` | Todos os módulos para um cargo |
| `chnlcmd <command> <enable|disable> <#channel>` | Um comando em um canal |
| `chnlmdl <module> <enable|disable> <#channel>` | Um módulo em um canal |
| `allchnlmdls <enable|disable> <#channel>` | Todos os módulos em um canal |
| `catcmd <command> <enable|disable> <category>` | Um comando em todos os canais de uma categoria |
| `catmdl <module> <enable|disable> <category>` | Um módulo em uma categoria |
| `allcatmdls <enable|disable> <category>` | Todos os módulos em uma categoria |
| `usrcmd <command> <enable|disable> @user` | Um comando para um membro |
| `usrmdl <module> <enable|disable> @user` | Um módulo para um membro |
| `allusrmdls <enable|disable> @user` | Todos os módulos para um membro |

Os gatilhos de chat contam como comandos: informe o número ou o texto do gatilho onde um nome de comando é esperado.

> [!EXAMPLE]
> `srvrmdl nsfw disable` e depois `chnlmdl nsfw enable #adult` bloqueia o módulo NSFW em todos os lugares, exceto em um canal.

## Ordem das regras

`listperms` mostra a lista numerada a partir de 1. A regra 1 é sempre "permitir todos os módulos para o servidor inteiro" e não pode ser editada nem removida; ela é o recurso final quando nada mais corresponde.

As novas regras são adicionadas ao final da lista. Quando um comando é executado, o bot verifica as regras começando pelo número mais alto e indo em direção à regra 1, e a primeira regra cujo alvo e escopo correspondem decide. Isso significa que a regra correspondente adicionada mais recentemente vence, e é por isso que o exemplo acima funciona: a permissão do canal foi adicionada depois da negação do servidor.

`moveperm <from> <to>` muda a posição de uma regra e renumera tudo, para que você possa colocar uma exceção acima ou abaixo de uma regra mais ampla sem recriá-la. `removeperm <number>` exclui uma regra. `resetperms` apaga a lista de volta à regra 1 e exige Administrador.

O painel lista as mesmas regras com setas para mover para cima e para baixo e um botão de excluir por regra.

## Modo detalhado

`verbose` alterna se um comando de texto bloqueado recebe uma mensagem de erro com o nome da regra que bloqueou, como "permission 4 (`.chnlmdl nsfw disable #general`) prevents this". Vem desativado por padrão. Desativado, os comandos bloqueados são ignorados em silêncio, o que é o certo para a maioria dos servidores e evita que os membros fiquem testando o que não podem executar. Os comandos de barra sempre respondem com o motivo, de forma efêmera, seja qual for essa configuração.

## Quem pode alterar regras

Todo comando deste módulo passa por uma verificação extra. Os administradores sempre podem usá-los. Qualquer outra pessoa precisa do **cargo de permissões** definido com `permrole <role>`. Sem um, os não administradores são avisados de que precisam de permissões de administrador (somente se o modo detalhado estiver ativado) e o comando é interrompido. `permrole` sem argumento mostra o cargo atual; `permrole reset` o limpa. O cargo `@everyone` não pode ser usado.

`resetperms` e o próprio `permrole` sempre exigem Administrador além disso.

## Cooldowns

`cmdcooldown <command> [time]` define um cooldown por membro para um comando neste servidor, de 1 segundo até 90000 segundos (25 horas). Sem tempo, ou com `0s`, ele é limpo. `allcmdcooldowns` lista os cooldowns atuais. Eles se somam a qualquer cooldown nativo que o comando já tenha.

## Exceções de permissão do Discord

O módulo Administração pode substituir a permissão do Discord que um comando exige. `dpo <command> <permissions...>` faz o comando exigir as permissões listadas em vez da nativa, por exemplo `dpo purge ManageMessages`. Execute `dpo <command>` sem permissões para remover a exceção, `dpol` para listá-las e `dpor` para limpar todas após uma confirmação. Os três exigem Administrador.

Uma exceção substitui apenas a exigência nativa do Discord. As regras de permissão de comandos acima continuam valendo, e a página do comando em `help <command>` mostra a exigência original riscada com a exceção ao lado.

## O menu rápido na ajuda

`help <command>` mostra aos administradores um botão de permissões. Ele abre um menu rápido para aquele comando que mostra as regras que o afetam, avisa sobre regras redundantes (duas regras com o mesmo alvo e escopo), oferece resolvê-las e permite adicionar regras de permitir e negar para o comando ou redefinir suas permissões sem sair da página de ajuda.

## Controles do dono do bot

Três grupos de comandos são restritos aos donos do bot e afetam todos os servidores: as permissões globais (`globalmodule`, `globalcommand`, `globalpermlist`, `resetglobalperms`) desativam um módulo ou comando em todos os lugares, e a lista negra (`userblacklist`, `channelblacklist`, `serverblacklist`, `manualblacklistcheck`) impede o bot de responder a um usuário, canal ou servidor por completo. Um módulo desativado globalmente mostra um globo e um X no menu de ajuda.

## Configurações

No painel, abra **Administração**, depois a seção **Automação e configurações**, depois o cartão **Permissões de comandos**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Permissões detalhadas | desativado | Avisar os usuários quando uma regra bloqueia um comando |
| Cargo de permissões | nenhum | Membros com este cargo podem editar regras por comandos |
| Regras | somente a regra 1 | A lista ordenada; adicione com **Ação**, **O quê** e **Para**, depois um módulo, comando, cargo, canal, categoria ou ID de usuário |

O cartão também mostra a contagem de regras personalizadas e se o modo detalhado está ativado. O cartão **Exceções de permissão** na mesma seção gerencia as exceções de permissão do Discord: escolha um comando do bot e a **Permissão do Discord necessária** que ele deve exigir no lugar da nativa.

## Passo a passo de configuração

1. Decida o formato: normalmente "tudo permitido, algumas coisas negadas" ou "tudo negado, depois permitido nos canais do bot".
2. Para o segundo formato, execute `allsrvrmdls disable` e depois `allchnlmdls enable #bot-commands`.
3. Mantenha a moderação funcionando para a equipe: `rolemdl moderation enable @Mods` e `rolemdl administration enable @Mods`.
4. Execute `listperms` e leia de baixo para cima, já que essa é a ordem que o bot usa. Use `moveperm` se uma exceção estiver abaixo da regra que ela deveria substituir.
5. Dê `permrole @Mods` à equipe de confiança para que ela possa ajustar regras sem Administrador.
6. Ative `verbose` durante os testes para ver qual regra dispara e depois desative de novo.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado). As versões de barra ficam em `/permissions`, por exemplo `/permissions servercommand`.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `listperms` | `lp` | Administrador ou cargo de permissões | Mostrar a lista numerada de regras |
| `verbose [true|false]` | `v` | Administrador ou cargo de permissões | Alternar as mensagens de comando bloqueado |
| `permrole [role|reset]` | `pr` | Administrador | Mostrar, definir ou redefinir o cargo de permissões |
| `removeperm <number>` | `rp` | Administrador ou cargo de permissões | Excluir uma regra |
| `moveperm <from> <to>` | `mp` | Administrador ou cargo de permissões | Reordenar regras |
| `resetperms` | | Administrador | Excluir todas as regras |
| `srvrcmd <command> <enable|disable>` | `sc` | Administrador ou cargo de permissões | Regra de comando, servidor inteiro |
| `srvrmdl <module> <enable|disable>` | `sm` | Administrador ou cargo de permissões | Regra de módulo, servidor inteiro |
| `allsrvrmdls <enable|disable>` | `asm` | Administrador ou cargo de permissões | Todos os módulos, servidor inteiro |
| `rolecmd <command> <enable|disable> <role>` | `rc` | Administrador ou cargo de permissões | Regra de comando para um cargo |
| `rolemdl <module> <enable|disable> <role>` | `rm` | Administrador ou cargo de permissões | Regra de módulo para um cargo |
| `allrolemdls <enable|disable> <role>` | `arm` | Administrador ou cargo de permissões | Todos os módulos para um cargo |
| `chnlcmd <command> <enable|disable> <#channel>` | `cc` | Administrador ou cargo de permissões | Regra de comando em um canal |
| `chnlmdl <module> <enable|disable> <#channel>` | `cm` | Administrador ou cargo de permissões | Regra de módulo em um canal |
| `allchnlmdls <enable|disable> <#channel>` | `acm` | Administrador ou cargo de permissões | Todos os módulos em um canal |
| `catcmd <command> <enable|disable> <category>` | `cac` | Administrador ou cargo de permissões | Regra de comando em uma categoria |
| `catmdl <module> <enable|disable> <category>` | `cam` | Administrador ou cargo de permissões | Regra de módulo em uma categoria |
| `allcatmdls <enable|disable> <category>` | `acamds` | Administrador ou cargo de permissões | Todos os módulos em uma categoria |
| `usrcmd <command> <enable|disable> @user` | `uc` | Administrador ou cargo de permissões | Regra de comando para um membro |
| `usrmdl <module> <enable|disable> @user` | `um` | Administrador ou cargo de permissões | Regra de módulo para um membro |
| `allusrmdls <enable|disable> @user` | `aum` | Administrador ou cargo de permissões | Todos os módulos para um membro |
| `cmdcooldown <command> [time]` | `cmdcd` | Administrador ou cargo de permissões | Definir ou limpar um cooldown |
| `allcmdcooldowns` | `acmdcds` | Administrador ou cargo de permissões | Listar cooldowns |
| `discordpermoverride <command> [permissions...]` | `dpo` | Administrador | Definir ou remover uma exceção de permissão do Discord |
| `discordpermoverridelist` | `dpol`, `dpoli` | Administrador | Listar exceções |
| `discordpermoverridereset` | `dpor` | Administrador | Limpar todas as exceções |
| `globalmodule <module>` | `gmod` | Dono do bot | Alternar um módulo em todos os lugares |
| `globalcommand <command>` | `gcmd` | Dono do bot | Alternar um comando em todos os lugares |
| `globalpermlist` | `gpl`, `lgp`, `globalperms`, `listglobalperms` | Dono do bot | Listar bloqueios globais |
| `resetglobalperms` | | Dono do bot | Limpar bloqueios globais |
| `userblacklist <add|remove> <user> [reason]` | `ubl` | Dono do bot | Colocar um usuário na lista negra |
| `channelblacklist <add|remove> <id> [reason]` | `cbl` | Dono do bot | Colocar um canal na lista negra |
| `serverblacklist <add|remove> <server> [reason]` | `sbl` | Dono do bot | Colocar um servidor na lista negra |
| `manualblacklistcheck` | `manualblcheck`, `mbc` | Dono do bot | Executar novamente a aplicação da lista negra |

## Dicas e armadilhas

- `resetperms` é isento da verificação de regras para que você sempre possa se recuperar de uma regra que bloqueou tudo, desde que seja administrador.
- As regras correspondem ao nome canônico do comando, então `srvrcmd clear disable` e `srvrcmd purge disable` são a mesma regra. Use o primeiro nome de `help <command>`.
- Uma regra para "todos os módulos" também cobre o módulo Permissões. Se você negar tudo para um cargo, os membros com apenas esse cargo também não podem executar `listperms`.
- As regras de categoria usam a categoria pai do canal no momento em que o comando é executado; os tópicos herdam do canal pai.
- As exceções de permissão do Discord mudam qual permissão do Discord é exigida, não quem as regras permitem. Use as duas juntas: uma exceção para baixar a exigência, depois uma regra para restringir onde.
- As regras de permissão nunca se aplicam em DMs.
- O painel rotula as opções de alvo como Servidor inteiro, Um cargo, Um canal, Uma categoria e Um usuário específico; a opção de usuário aceita um ID de usuário colado.

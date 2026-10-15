---
title: Configurações
slug: settings
summary: O básico do servidor inteiro: prefixo de comandos, idioma, fuso horário, canais de log, cargo de silenciado, expiração de advertências e alguns utilitários de chat.
icon: fa-cog
category: Settings
dashboard: /dashboard/settings
module: Administration
tags: [settings, prefix, language, locale, timezone, mute role, warn expire, command log, staff role, member role, snipe, link previews, delmsgoncmd, configurações, prefixo, idioma, fuso horário, cargo de silenciado, expiração de advertências, log de comandos, cargo da equipe, cargo de membro, prévia de links]
related: [administration, logging, filter, suggestions]
---

## O que faz

A página de Configurações reúne as poucas opções que afetam todos os módulos de uma vez, e não um único recurso. É onde você altera o prefixo que os membros digitam antes dos comandos, o idioma em que o bot responde, o fuso horário usado em lembretes e mensagens agendadas e os canais em que o uso de comandos e as advertências são registrados.

Ela também cobre o nome do cargo de silenciado, se um membro silenciado perde seus outros cargos, por quanto tempo as advertências duram e dois utilitários de chat: o snipe de mensagens e as prévias de links de mensagens.

A maioria dessas configurações tem um comando de texto correspondente, então a equipe também pode alterá-las pelo Discord. Alguns extras existem apenas em comandos: o cargo da equipe, o cargo de membro e a exclusão de mensagens de comando por canal.

## Por que usar

- Seu servidor já usa `.` para outro bot e você quer o Mewdeko em `!` ou `m!`.
- Sua comunidade fala um idioma diferente do inglês e você quer que as respostas correspondam.
- Lembretes e publicações agendadas devem cair no horário local certo, não em UTC.
- Os moderadores querem um canal que registre cada comando executado e cada advertência emitida.
- As advertências devem desaparecer após um número definido de dias em vez de se acumularem para sempre.
- Os membros devem poder usar `snipe` em uma mensagem excluída, ou as prévias de links devem ser desativadas em um chat movimentado.

## Prefixo

O prefixo é o texto que um membro digita antes de um comando. O padrão é `.`. Qualquer pessoa pode executar `prefix` sem argumento para ver o prefixo atual. Os administradores o alteram com `prefix <new>` ou, no painel, pela caixa **Prefixo de comandos**. Os comandos de barra não são afetados pelo prefixo.

## Idioma

Cada servidor pode escolher o próprio idioma de resposta com `languageset <code>`, por exemplo `languageset de`, ou com a lista suspensa **Idioma** no painel. `languageset default` limpa a substituição para que o servidor siga o idioma padrão do bot. `languageslist` mostra todos os códigos de idioma compatíveis. `langsetdefault` sem argumento mostra o padrão do bot; alterar esse padrão é uma ação do dono do bot.

## Fuso horário

O fuso horário do servidor determina os lembretes, as mensagens agendadas e qualquer exibição de horário. `timezone` sozinho mostra o valor atual (UTC se nenhum estiver definido). `timezone <id>` o define usando um identificador de fuso horário IANA ou do Windows, como `Europe/London`, e `timezones` pagina os identificadores que o bot aceita. No painel, o **Fuso horário do servidor** é salvo no momento em que você escolhe um valor; ele não espera por **Salvar alterações**.

## Canais de log

O **Canal de registro de comandos** registra o uso de comandos. Defina-o com `commandlogchannel #channel`; execute o comando sem canal para desativar o registro.

O **Canal de logs de avisos** registra as advertências emitidas pelos comandos de moderação. Ele é definido pelo painel.

## Advertências

A **Expiração de advertências** é armazenada em horas. Zero significa que as advertências nunca expiram. O comando `warnexpire` funciona em dias e recebe uma segunda palavra: `warnexpire 30 clear` marca como limpas as advertências com mais de 30 dias, `warnexpire 30 delete` as remove. O intervalo aceito é de 0 a 366 dias, e `warnexpire 0` desativa a expiração.

## Cargo de silenciado e remoção de cargos

O **Cargo de silenciado** é o nome do cargo que os comandos de silenciar e as punições aplicam. Se um cargo com esse nome não existir, o bot o cria. Pelo Discord, `muterole @role` aponta a configuração para um cargo existente; o cargo deve ficar abaixo do seu cargo mais alto, a menos que você seja o dono do servidor. `muterole` sem argumento mostra o cargo de silenciado atual.

**Remover todos os outros cargos enquanto silenciado** retira os outros cargos de um membro durante o silenciamento e os devolve depois. A forma em comando é `removeonmute y` ou `removeonmute n`.

## Utilitários de chat

| Configuração | Comando | Efeito |
| --- | --- | --- |
| Snipe de mensagens | `snipeset enable` ou `snipeset disable` | Permite que os membros usem os comandos de snipe para recuperar mensagens excluídas ou editadas recentemente. Desativado por padrão. |
| Pré-visualização de links de mensagens | `previewlinks y` ou `previewlinks n` | Quando alguém publica um link para uma mensagem do Discord, o bot mostra o conteúdo dessa mensagem. |

## Configurações apenas por comando

Elas fazem parte do mesmo módulo Administração, mas não têm controle no painel.

O **Cargo da equipe** (`staffrole @role`) marca um cargo cujos membros ficam isentos dos filtros de palavras, links e convites, e das verificações de spam de sugestões. Execute `staffrole` sem cargo para ver o atual e `staffroledisable` para limpá-lo.

O **Cargo de membro** (`memberrole @role`) armazena um cargo para o servidor. Ele é registrado, mas não é usado por nenhum recurso no momento.

**Excluir mensagem ao usar comando** (`delmsgoncmd`) remove a mensagem que acionou um comando depois que o comando é executado:

| Forma | Efeito |
| --- | --- |
| `delmsgoncmd` | Alterna a exclusão para o servidor inteiro |
| `delmsgoncmd list` | Mostra a configuração do servidor e todas as exceções de canal |
| `delmsgoncmd channel enable [#channel]` | Sempre excluir nesse canal (canal atual se omitido) |
| `delmsgoncmd channel disable [#channel]` | Nunca excluir nesse canal |
| `delmsgoncmd channel inherit [#channel]` | Seguir a configuração do servidor |

## Configurações

Tudo abaixo está na única página de **Configurações do bot**. Pressione **Salvar alterações** depois de editar; apenas o **Fuso horário do servidor** é salvo sozinho.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Prefixo de comandos | `.` | Texto digitado antes dos comandos |
| Canal de registro de comandos | nenhum | Canal onde o uso de comandos é registrado |
| Emoji da moeda | nenhum | Emoji exibido para a moeda do servidor |
| Canal de logs de avisos | nenhum | Canal onde as advertências são registradas |
| Expiração de advertências | 0 (nunca) | Horas até as advertências expirarem |
| Idioma | Padrão do bot | Idioma de resposta deste servidor |
| Fuso horário do servidor | UTC | Fuso horário para mensagens agendadas, lembretes e exibição de horários |
| Cargo de silenciado | Muted | Nome do cargo aplicado por silenciamentos e punições |
| Remover todos os outros cargos enquanto silenciado | Desativado | Retirar os outros cargos durante o silenciamento |
| Snipe de mensagens | Desativado | Permitir os comandos de snipe |
| Pré-visualização de links de mensagens | Desativado | Expandir links de mensagens do Discord |

> [!NOTE]
> A página cobre apenas o básico compartilhado. Registro de logs, moderação, starboard e outros recursos têm suas próprias páginas com suas próprias configurações.

## Passo a passo de configuração

1. Abra **Configurações** no painel.
2. Defina o **Prefixo de comandos** se `.` entrar em conflito com outro bot.
3. Escolha um **Idioma** e um **Fuso horário do servidor**.
4. Escolha um **Canal de registro de comandos** e um **Canal de logs de avisos** que só a equipe possa ler.
5. Defina a **Expiração de advertências** em horas, por exemplo `720` para trinta dias, ou deixe em 0.
6. Confira se o nome do **Cargo de silenciado** corresponde ao cargo que seus moderadores já usam, ou deixe como `Muted` e deixe o bot criar um.
7. Ative o **Snipe de mensagens** ou a **Pré-visualização de links de mensagens** se quiser.
8. Pressione **Salvar alterações**.
9. No Discord, execute `staffrole @YourStaffRole` para que os filtros e os limites de sugestões ignorem a sua equipe.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `prefix [new prefix]` | | Ninguém para ver, Administrador para alterar | Mostrar ou definir o prefixo de comandos |
| `languageset <code>` | `langset` | Administrador | Definir o idioma de resposta do servidor, ou `default` para limpá-lo |
| `langsetdefault` | `langsetd` | Ninguém para ver, Dono do bot para alterar | Mostrar ou definir o idioma padrão de todo o bot |
| `languageslist` | `langli` | Ninguém | Listar os códigos de idioma compatíveis |
| `timezone [id]` | | Ninguém para ver, Administrador para alterar | Mostrar ou definir o fuso horário do servidor |
| `timezones` | | Ninguém | Paginar os identificadores de fuso horário aceitos |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrador | Definir o canal de registro de comandos, ou desativar sem canal |
| `warnexpire <days> <clear or delete>` | `warne` | Administrador | Expirar advertências após um número de dias |
| `muterole [@role]` | `setmuterole` | Gerenciar cargos | Mostrar ou definir o cargo de silenciado |
| `removeonmute <y or n>` | | Administrador | Retirar os outros cargos enquanto silenciado |
| `snipeset <enable or disable>` | `setsnipe` | Administrador | Permitir ou bloquear os comandos de snipe |
| `previewlinks <y or n>` | `plinks` | Administrador | Expandir links de mensagens do Discord |
| `staffrole [@role]` | | Administrador | Mostrar ou definir o cargo da equipe |
| `staffroledisable` | | Administrador | Limpar o cargo da equipe |
| `memberrole [@role]` | | Administrador | Mostrar ou definir o cargo de membro |
| `delmsgoncmd [list or channel <state> [#channel]]` | `dmc` | Administrador | Excluir mensagens de comando em todo o servidor ou por canal |

## Dicas e armadilhas

- `delmsgoncmd` exige que o bot tenha Gerenciar mensagens; caso contrário, o comando se recusa a executar.
- O painel armazena a expiração de advertências em horas, enquanto `warnexpire` recebe dias. `warnexpire 1` e um valor de `24` no painel são a mesma coisa.
- `muterole` compara o cargo informado com o seu próprio cargo mais alto. Se der erro de permissões insuficientes, peça ao dono ou escolha um cargo mais baixo.
- Os comandos de barra ignoram o prefixo por completo, então uma mudança de prefixo afeta apenas os comandos de texto.
- A isenção do cargo da equipe cobre apenas os filtros e as verificações de spam de sugestões. Ela não concede permissões de comandos; use o módulo Permissões para isso.

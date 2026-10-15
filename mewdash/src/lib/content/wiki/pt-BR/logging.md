---
title: Logs
slug: logging
summary: Envie um registro de entradas, saídas, edições, exclusões, banimentos, alterações de cargos e canais e muito mais para os canais de log escolhidos, com roteamento por evento e exclusão de canais.
icon: fa-file
category: Security
dashboard: /dashboard/logging
module: Administration
tags: [logging, logs, audit, events, message deleted, message edited, join leave, mod log, ignored channels, registro, eventos, mensagem excluída, mensagem editada, entrada saída, log de moderação, canais ignorados]
related: [moderation, administration, filter]
---

## O que faz

O módulo de logs acompanha os eventos que o Discord envia ao bot e publica um resumo de cada um em um canal de texto que você escolher. Uma mensagem excluída mostra quem a escreveu e o que dizia. A entrada de um membro mostra a idade da conta dele. Uma alteração de cargo mostra quais cargos foram adicionados ou removidos. Quando o bot consegue ler o registro de auditoria, ele também informa o membro da equipe que fez a ação.

Cada tipo de evento tem sua própria configuração de canal, então você pode enviar as edições de mensagens para um canal, as ações de moderação para outro, e deixar o restante desativado. Nada é registrado até que você atribua um canal, e um tipo de evento sem canal é simplesmente ignorado.

Os canais também podem ser excluídos. Um canal ignorado não gera nenhum registro de mensagens, tópicos ou voz, o que mantém salas da equipe e canais de spam de bot fora do histórico.

## Por que usar

- Mantenha uma cópia das mensagens excluídas e editadas para que a moderação veja o que foi removido depois.
- Acompanhe quem entrou e saiu, incluindo as datas de criação das contas, para identificar raids e contas alternativas.
- Registre banimentos, desbanimentos e silenciamentos com o moderador responsável, para prestação de contas.
- Acompanhe alterações de cargos, canais e permissões feitas por outros administradores ou por contas comprometidas.
- Acompanhe a atividade de voz em servidores em que os canais de voz são o principal ponto de encontro.

## Tipos de evento de log

Cada tipo pode apontar para um canal diferente ou ficar desativado. Estes são os valores aceitos por `log` e exibidos no painel.

| Tipo | Rótulo no painel | Registrado quando |
| --- | --- | --- |
| `MessageUpdated` | Mensagem editada | O conteúdo de uma mensagem é editado (mensagens de bots e conteúdo sem alteração são ignorados) |
| `MessageDeleted` | Mensagem excluída | Uma mensagem é excluída |
| `MessagesBulkDeleted` | Mensagens excluídas em massa | Várias mensagens são apagadas de uma vez, com a contagem de quantas estavam em cache |
| `ReactionEvents` | Eventos de reação | Reações são adicionadas ou removidas, agrupadas por mensagem a cada cinco segundos |
| `ThreadCreated` | Tópico criado | Um tópico é criado |
| `ThreadDeleted` | Tópico excluído | Um tópico é excluído |
| `ThreadUpdated` | Tópico atualizado | O nome, o status de arquivamento ou algo semelhante de um tópico muda |
| `UsernameUpdated` | Nome de usuário alterado | O nome de usuário global de um membro muda |
| `NicknameUpdated` | Apelido alterado | O apelido de um membro no servidor muda |
| `UserUpdated` | Usuário atualizado | O perfil de um membro, como avatar ou nome global, muda |
| `UserJoined` | Usuário entrou | Um membro entra no servidor |
| `UserLeft` | Usuário saiu | Um membro sai ou é expulso |
| `UserRoleAdded` | Cargo adicionado ao usuário | Um ou mais cargos são dados a um membro |
| `UserRoleRemoved` | Cargo removido do usuário | Um ou mais cargos são retirados de um membro |
| `UserBanned` | Usuário banido | Um membro é banido |
| `UserUnbanned` | Usuário desbanido | Um banimento é revogado |
| `UserMuted` | Usuário silenciado | Um membro é silenciado em voz ou em texto |
| `VoicePresence` | Presença em voz | Um membro entra, sai, é movido, silenciado, ensurdecido ou transmite em um canal de voz |
| `VoicePresenceTts` | Presença em voz TTS | Um membro pode ter usado texto para fala em voz; a detecção é feita da melhor forma possível |
| `ServerUpdated` | Servidor atualizado | Configurações do servidor, como nome, ícone ou dono, são alteradas |
| `EventCreated` | Evento criado | Um evento agendado do servidor é criado |
| `InviteCreated` | Convite criado | Um convite é criado, com sua idade máxima e número de usos |
| `InviteDeleted` | Convite excluído | Um convite é excluído |
| `RoleCreated` | Cargo criado | Um cargo é criado |
| `RoleDeleted` | Cargo excluído | Um cargo é excluído |
| `RoleUpdated` | Cargo atualizado | O nome, a cor ou as permissões de um cargo mudam |
| `ChannelCreated` | Canal criado | Um canal é criado |
| `ChannelDestroyed` | Canal excluído | Um canal é excluído |
| `ChannelUpdated` | Canal atualizado | O nome, o tópico ou as permissões de um canal mudam |
| `Other` | Outros | Eventos diversos não cobertos acima |

O painel também mostra uma entrada **Avatar atualizado**. Ela é armazenada junto com as demais e é definida pelas categorias Usuários e Todos, mas não é um valor que você pode passar ao comando `log`.

## Categorias

`logcategory` define um grupo inteiro de tipos para um mesmo canal em uma única etapa. Executá-lo sem canal limpa todos os tipos desse grupo.

| Categoria | Tipos que define |
| --- | --- |
| `All` | Todos os tipos acima |
| `Users` | NicknameUpdated, AvatarUpdated, UsernameUpdated, UserRoleAdded, UserRoleRemoved, VoicePresence, UserJoined, UserLeft, UserUpdated |
| `Threads` | ThreadCreated, ThreadDeleted, ThreadUpdated |
| `Roles` | RoleCreated, RoleDeleted, RoleUpdated |
| `Server` | ServerUpdated, EventCreated, InviteCreated, InviteDeleted |
| `Channel` | ChannelCreated, ChannelDestroyed, ChannelUpdated |
| `Messages` | MessageDeleted, MessageUpdated, MessagesBulkDeleted, ReactionEvents |
| `Moderation` | UserMuted, UserBanned, UserUnbanned, Other |
| `None` | Limpa todos os tipos (usado pelo **Desativar tudo** do painel) |

## Canais ignorados

Qualquer canal da lista de ignorados é pulado nos eventos de mensagem, tópico, canal e voz que ocorrem dentro dele. Os tópicos herdam a configuração do canal pai, então ignorar um fórum ou um canal de texto também ignora os tópicos dele. Ignorar um canal de voz suprime os registros de presença em voz para entradas e saídas desse canal.

Ignorar um canal não impede eventos de membros, cargos ou servidor, já que eles não estão ligados a um canal.

## Configurações

A página de Logs tem duas abas, **Canais de logs** e **Canais ignorados**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Canais de logs | nenhum | Um seletor de canal por tipo de evento, agrupados em Populares, Usuários, Mensagens, Moderação, Servidor, Canais, Cargos, Tópicos, Voz e Todos os eventos |
| Limpar categoria | | Esvazia todos os seletores do grupo que você está vendo; tem efeito ao **Salvar configuração** |
| Limpar tudo | | Exibido no grupo **Todos os eventos**; esvazia todos os seletores, aplicado ao salvar |
| Desativar tudo | | Botão no cabeçalho exibido enquanto algum canal estiver definido; desvincula todos os tipos de evento imediatamente após a confirmação, mantendo os canais ignorados |
| Canais ignorados | nenhum | Canais excluídos do registro, movidos entre as listas **Canais ativos** e **Canais ignorados** |

> [!TIP]
> O grupo **Populares** inclui Usuário entrou, Usuário saiu, Mensagem excluída, Mensagem editada, Usuário banido, Usuário desbanido, Canal criado e Canal excluído. É um bom conjunto inicial para a maioria dos servidores.

## Passo a passo de configuração

1. Crie um ou mais canais de log privados, que só a equipe possa ler.
2. Abra **Logs** no painel e fique na aba **Canais de logs**.
3. No grupo **Populares**, escolha o seu canal de log para cada evento desejado e salve.
4. Passe para outros grupos, como **Moderação** ou **Voz**, e atribua canais para o que mais precisar.
5. Abra a aba **Canais ignorados** e mova salas da equipe e canais de comandos do bot para a lista de ignorados.
6. Exclua uma mensagem de teste e confirme que o registro aparece no canal certo.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado). As versões de barra ficam em `/log`.

| Comando | Atalhos | Requer | Função |
| --- | --- | --- | --- |
| `log <type> [#channel]` | | Administrador | Envia um tipo de evento para um canal; sem canal, usa o canal atual |
| `log #channel [types...]` | | Administrador | Envia vários tipos para um canal, ou abre um menu de seleção com todos os tipos, se nenhum for informado |
| `log "#channel:Type1,Type2" ...` | | Administrador | Define vários pares de canal e tipo em uma única mensagem |
| `logcategory <category> [#channel]` | `logcat` | Administrador | Direciona uma categoria inteira para um canal, ou a limpa sem canal |
| `logevents` | | Administrador | Lista todos os tipos de evento e o canal que cada um usa atualmente |
| `logignore [#channel]` | `lignore` | Administrador | Ativa ou desativa um canal na lista de ignorados; usa o canal atual por padrão |
| `logignorelist` | `lignorel` | Administrador | Mostra a lista de ignorados |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrador | Registra o uso de comandos do bot em um canal, ou desativa sem canal |

> [!EXAMPLE]
> `log "#mod-logs:UserBanned,UserUnbanned,UserMuted" "#message-logs:MessageDeleted,MessageUpdated"`

## Dicas e cuidados

- Dê ao bot a permissão **Ver registro de auditoria**. Sem ela, os logs ainda são publicados, mas não conseguem dizer qual moderador excluiu uma mensagem, baniu alguém ou alterou um cargo.
- O bot precisa poder ver e enviar mensagens em cada canal de log. Um canal de log que ele não consegue ver é ignorado sem nenhum erro.
- Os registros de mensagens excluídas e editadas dependem do cache de mensagens do bot. Mensagens enviadas antes da última reinicialização do bot, ou apagadas em limpezas em massa, podem aparecer como não armazenadas em cache.
- Os registros de reação são agrupados: todas as alterações de reação em uma mesma mensagem em cerca de cinco segundos chegam como uma única entrada, para evitar sobrecarregar servidores movimentados.
- O menu de seleção aberto por `log #channel` lista até 25 tipos por menu e pré-seleciona os que já são enviados para aquele canal.
- `logcategory` sobrescreve todos os tipos da categoria, inclusive os que você tinha direcionado para outro lugar. Use `log` para tipos individuais depois disso.

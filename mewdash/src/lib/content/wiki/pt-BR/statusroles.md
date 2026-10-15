---
title: Cargos por Status
slug: statusroles
summary: Dê ou remova cargos automaticamente quando o status personalizado do Discord de um membro contiver um trecho de texto, e opcionalmente anuncie isso em um canal.
icon: fa-user-circle
category: Actions
dashboard: /dashboard/statusroles
module: StatusRoles
tags: [status roles, custom status, vanity, auto role, presence, role automation, status text, cargos por status, status personalizado, cargo automático, presença, automação de cargos, texto de status]
related: [administration, afk]
---

## O que ele faz

A equipe adiciona um ou mais textos para observar, como `discord.gg/yourserver` ou `playing minecraft`. O bot acompanha as atualizações de presença. Quando o status personalizado de um membro passa a conter esse texto, o bot remove os cargos listados em **Cargos a Remover**, adiciona os cargos em **Cargos a Adicionar** e, se um canal e uma mensagem estiverem definidos, publica uma notificação ali.

Quando o texto desaparece do status novamente, duas opções decidem o que acontece. **Remover adicionados** tira os cargos que foram concedidos. **Readicionar removidos** devolve os cargos que foram retirados. Ambas vêm desativadas por padrão, então, sem alterações, o membro simplesmente mantém os cargos que tiver no fim.

Apenas o status personalizado é verificado, ou seja, o texto que você digita em "Definir status personalizado" no Discord. Atividades de jogo, Spotify e transmissão são ignoradas. Membros offline ou invisíveis são pulados, e a comparação é uma simples verificação de substring, então `mewdeko` corresponde a `I love mewdeko`, mas diferencia maiúsculas de minúsculas.

Cada servidor pode ter quantas entradas de cargo por status quiser, cada uma com seus próprios cargos, canal e mensagem. Os comandos se referem a uma entrada pelo índice, o número mostrado por `liststatusroles`.

## Por que você usaria

- Recompense os membros que colocam seu convite personalizado no status com um cargo de apoiador e seus benefícios.
- Dê um cargo de "transmitindo" ou "procurando jogadores" enquanto alguém divulga isso no status, e remova quando ele parar.
- Anuncie em um canal quando um membro começar a representar o servidor, para que a equipe possa agradecer.
- Troque um cargo por outro enquanto um status estiver ativo, por exemplo, tirar um membro do cargo "sem menções" enquanto ele exibe um determinado status.

## Correspondência e mudanças de cargo

| Situação | O que o bot faz |
| --- | --- |
| O status passa a conter o texto observado | Remove **Cargos a Remover**, adiciona **Cargos a Adicionar**, envia a notificação se configurada |
| O status continua contendo o texto observado | Nada, a mudança é processada apenas uma vez |
| O status deixa de conter o texto observado, com **Remover adicionados** ativado | Remove os **Cargos a Adicionar** que o membro ainda tiver |
| O status deixa de conter o texto observado, com **Readicionar removidos** ativado | Devolve os **Cargos a Remover** que o membro não tem mais |
| O membro fica offline ou invisível | Nada, os cargos são mantidos como estão |

O bot compara cada atualização de presença com o último status salvo em cache para aquele usuário, então um membro que edita uma parte não relacionada do status não é processado de novo. O texto observado precisa ser único por servidor; os comandos também limitam o texto a 128 caracteres, o painel não.

## A mensagem de notificação

Se uma entrada tiver um **Canal de notificações** e uma **Mensagem de Notificação**, o bot publica a mensagem ali toda vez que o status de um membro passa a corresponder. O texto passa pelo interpretador de embeds, então tudo o que o criador de embeds gera funciona, incluindo texto simples, até dez embeds e componentes. Nada é publicado quando o status deixa de corresponder.

### Placeholders

A mensagem passa pelo conjunto padrão de substituições para o membro, o canal de notificação e o servidor. Os mais úteis estão abaixo; a lista completa está na página de placeholders, em usuário, servidor, canal, bot e tempo.

| Placeholder | Valor |
| --- | --- |
| `%user.mention%` | Uma menção ao membro |
| `%user.name%` | O nome de usuário do membro |
| `%user.fullname%` | Nome de usuário com discriminador |
| `%user.avatar%` | A URL do avatar do membro |
| `%user.id%` | O ID de usuário do membro |
| `%server.name%` | Nome do servidor |
| `%server.icon%` | URL do ícone do servidor |
| `%channel.mention%` | Menção ao canal de notificação |
| `%server.time%` | Hora atual no fuso horário configurado do servidor |

> [!NOTE]
> O editor do painel lista um placeholder `%status%`, mas o bot não o substitui. Escreva o texto do status na mensagem você mesmo.

> [!EXAMPLE]
> `%user.mention% is now repping the server in their status, thank you!`

## Configurações

Tudo fica na página Cargos por Status, que tem três abas: **Cargos por Status**, **Adicionar Novo** e **Estatísticas**. Cada entrada da lista expande para mostrar suas configurações.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Texto do Status a Observar | nenhum | O texto que o status personalizado deve conter; sem limite de tamanho no painel, 128 caracteres pelos comandos |
| Cargos a Adicionar | nenhum | IDs de cargos separados por espaço concedidos quando o status corresponde; Salvar substitui a lista inteira |
| Cargos a Remover | nenhum | IDs de cargos separados por espaço removidos quando o status corresponde; Salvar substitui a lista inteira |
| Canal de notificações | nenhum | Canal que recebe a mensagem de notificação |
| Mensagem de Notificação | nenhum | Texto ou embed enviado ao canal, com placeholders |
| Remover adicionados | desligado | Retira os cargos adicionados quando o status deixa de corresponder |
| Readicionar removidos | desligado | Devolve os cargos removidos quando o status deixa de corresponder |

A aba **Estatísticas** mostra o número total de entradas, quantas alteram cargos e quantas têm um canal de notificação.

## Passo a passo da configuração

1. Abra **Cargos por Status** no painel e vá para a aba **Adicionar Novo**.
2. Digite o texto a observar e pressione **Adicionar Cargo por Status**.
3. Mude para a aba **Cargos por Status** e expanda a nova entrada.
4. Pressione **Editar Configurações**, cole os IDs dos cargos em **Cargos a Adicionar** e **Cargos a Remover**, escolha um **Canal de notificações** e escreva uma **Mensagem de Notificação** se quiser uma, depois clique em **Salvar**.
5. Use os dois botões de alternância da entrada para ativar **Remover adicionados** e, se precisar, **Readicionar removidos**.
6. Teste: defina seu próprio status personalizado com o texto e confirme se o cargo aparece; depois limpe o status e confirme se o cargo foi removido.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado). Todos os comandos exigem Gerenciar Servidor. O `<index>` é o número mostrado por `liststatusroles`, começando em 1. As versões de barra ficam em `/statusroles`.

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `addstatusrole <text>` | `asr` | Gerenciar Servidor | Adiciona um texto de status a observar |
| `removestatusrole <index>` | `rsr` | Gerenciar Servidor | Exclui uma entrada |
| `liststatusroles` | `lsr` | Gerenciar Servidor | Percorre todas as entradas com seu índice e configurações |
| `setaddroles <index> <@role...>` | `sar` | Gerenciar Servidor | Adiciona cargos à lista concedida quando o status corresponde |
| `setremoveroles <index> <@role...>` | `srr` | Gerenciar Servidor | Adiciona cargos à lista removida quando o status corresponde |
| `removeaddroles <index> <@role...>` | `remar` | Gerenciar Servidor | Tira cargos da lista de "cargos a adicionar" |
| `removeremoveroles <index> <@role...>` | `rmremoveroles` | Gerenciar Servidor | Tira cargos da lista de "cargos a remover" |
| `setstatusrolechannel <index> <#channel>` | `statusrolechannel`, `ssrc` | Gerenciar Servidor | Define o canal de notificação |
| `setstatusroleembed <index> [text]` | `statusroleembed`, `asre` | Gerenciar Servidor | Define a mensagem de notificação, ou, sem texto, mostra a atual |
| `toggleremoveadded <index>` | `togglerma` | Gerenciar Servidor | Alterna **Remover adicionados** |
| `togglereaddremoved <index>` | `togglermrm` | Gerenciar Servidor | Alterna **Readicionar removidos** |

`setaddroles` e `setremoveroles` acrescentam à lista existente em vez de substituí-la. Use os comandos `remove...` para tirar cargos novamente. O editor do painel funciona de outra forma: o que estiver na caixa ao salvar se torna a lista completa, mas uma caixa vazia é ignorada, então limpar uma lista por completo precisa ser feito com os comandos `remove...`.

## Dicas e armadilhas

- O bot precisa de Gerenciar Cargos, e o cargo mais alto dele deve estar acima de todos os cargos que ele adiciona ou remove. As falhas são apenas registradas, e o membro não vê nada.
- O bot precisa da intent de presença para ver status personalizados. Se nada acontecer quando você muda seu status, verifique isto primeiro.
- A correspondência diferencia maiúsculas de minúsculas e procura o texto em qualquer parte do status. Mantenha o texto observado curto e característico.
- O bot só analisa a primeira atividade na presença de um membro. O Discord normalmente lista o status personalizado primeiro, mas se outra atividade vier antes dele, o status não é visto.
- Os cargos só são alterados quando o status muda. Um membro que já tem o texto no status quando você cria a entrada não é processado até que o status mude.
- A notificação é enviada toda vez que o status passa a corresponder, então um membro que alterna o status repetidamente vai disparar mensagens repetidas.
- O painel aceita IDs de cargos, não nomes. Ative o Modo Desenvolvedor no Discord e clique com o botão direito em um cargo para copiar o ID.

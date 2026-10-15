---
title: Tickets
slug: tickets
summary: Painéis de tickets de suporte com botões e menus de seleção que abrem canais privados, além de assumir, prioridades, tags, casos, transcrições e ferramentas para a equipe.
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, modmail, suporte, central de ajuda, painel, transcrições, casos, assumir, prioridade, lista negra]
related: [administration, chat-triggers, auditlog]
---

## O que ele faz

Tickets transforma um canal em uma central de ajuda. Você posta um painel, que é uma mensagem com um embed e um ou mais botões ou um menu de seleção. Quando um membro clica em um botão ou escolhe uma opção, o bot cria um canal de texto privado para ele, define as permissões para que só ele e os seus cargos de suporte possam vê-lo e posta uma mensagem de abertura com os botões **Assumir** e **Fechar**.

Do lado do membro: ele clica, opcionalmente preenche um pequeno formulário, e aparece um canal com nome como `ticket-username-1`. Ele descreve o problema ali. Quando o ticket é fechado, o canal é renomeado para `closed-...`, bloqueado e então movido para uma categoria de arquivo ou excluído após um atraso, dependendo de como você configurou esse tipo de ticket.

Do lado da equipe: assumir um ticket para que todos saibam quem está cuidando dele, definir uma prioridade, adicionar tags, deixar notas, vincular tickets relacionados em um caso e fechá-lo. Cada fechamento pode salvar uma transcrição em um canal e no painel. O painel também mostra tempos de resposta e de resolução, tickets por prioridade e uma visão por membro da equipe.

Cada botão e cada opção de menu de seleção é um tipo de ticket próprio, com categoria, cargos, limites, formulário, mensagem de abertura e comportamento de fechamento próprios.

## Por que usar

- Um servidor de suporte quer canais privados individuais em vez de um canal de ajuda público.
- Você tem várias equipes (financeiro, moderação, parcerias) e quer um menu de seleção que direcione para a equipe certa.
- Você precisa de candidaturas a moderador com um formulário, separadas do suporte geral.
- Você quer uma trilha de auditoria: transcrições, notas da equipe e casos que agrupam denúncias relacionadas.
- Você quer impedir que determinados membros abram tickets.

## Painéis, botões e menus de seleção

Um painel é uma mensagem em um canal. O ID do painel é o ID dessa mensagem. Um painel pode conter botões, menus de seleção ou ambos.

- **Botões**: um tipo de ticket por botão. Cada um tem um rótulo, um emoji opcional e um estilo (Primário, Secundário, Sucesso ou Perigo).
- **Menus de seleção**: um menu com um marcador e uma lista de opções. Cada opção é um tipo de ticket com rótulo, descrição e emoji. Um menu precisa manter pelo menos uma opção.

Se a mensagem do painel for excluída, `checkpanels` lista quais painéis estão ausentes e `recreatepanel` ou `recreateallpanels` os posta novamente e atualiza o ID da mensagem armazenado. O bot também monitora a exclusão das mensagens de painel.

`ticketduplicatepanel` copia um painel e todos os componentes para outro canal. `ticketmovepanel` o move. `ticketupdatepanel` substitui o embed por um novo JSON de embed.

### Configurações do tipo de ticket

Elas existem em todo botão e toda opção de menu de seleção. No painel, aparecem quando você adiciona ou edita um botão ou uma opção.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Formato do nome do canal | `ticket-{username}-{id}` | Nome do canal criado; `{id}` é o número de ticket do membro, máx. 100 caracteres |
| Categoria de tickets | nenhuma | Categoria em que o canal é criado |
| Categoria de arquivo | nenhuma | Categoria para a qual o canal é movido quando fechado ou arquivado |
| Cargos de suporte | nenhum | Cargos que podem ver, falar e assumir o ticket |
| Cargos com acesso | nenhum | Cargos que podem ler, mas não enviar mensagens |
| Máx. de tickets ativos | 1 | Quantos tickets abertos deste tipo um membro pode ter |
| Fechamento automático (horas) | nenhum | Armazenado por tipo e exibido em `buttoninfo` |
| Tempo de resposta exigido (minutos) | nenhum | Armazenado por tipo e exibido em `buttoninfo` |
| Prioridades permitidas | todas | Quais prioridades a equipe pode definir neste tipo |
| Prioridade padrão | nenhuma | Prioridade com que um novo ticket começa |
| Salvar transcrição | desativado | Gera uma transcrição quando o ticket é fechado |
| Bloquear ao fechar | ativado | Nega o envio de mensagens para todos, exceto os cargos de suporte |
| Renomear ao fechar | ativado | Adiciona o prefixo `closed-` ao nome do canal |
| Remover o criador | ativado | Remove o acesso de quem abriu o ticket ao fechar |
| Excluir ao fechar | desativado | Exclui o canal após o atraso em vez de mantê-lo |
| Atraso para excluir | 5 minutos | Espera antes da exclusão quando Excluir ao fechar está ativado; o campo do painel usa segundos, `ticketclosebehavior` usa minutos |
| Arquivar automaticamente ao fechar | desativado | Arquiva o ticket como parte do fechamento |
| Bloquear ao arquivar | ativado | Deixa o canal somente leitura ao arquivar |
| Renomear ao arquivar | ativado | Adiciona o prefixo `archived-` ao nome do canal |
| Remover o criador (arquivar) | desativado | Remove o acesso de quem abriu o ticket ao arquivar |
| Modal | nenhum | Um formulário exibido antes de o ticket ser criado |
| Mensagem de abertura | embed padrão | Mensagem de abertura personalizada com marcadores |

### Formulários (modals)

Um tipo de ticket pode fazer perguntas antes de criar o canal. Defina um título com `setmodaltitle` (padrão "Create Ticket") e adicione campos com `addmodalfield`. Um campo é curto e obrigatório por padrão; as opções depois do rótulo mudam isso: `paragraph` para várias linhas, `optional`, e `min:X` ou `max:X` para limites de tamanho de até 4000. O ID do campo é o rótulo em minúsculas, com os espaços trocados por sublinhados.

As respostas são armazenadas com o ticket e podem ser usadas na mensagem de abertura como `%modal.<fieldId>%`.

### A mensagem de abertura

Por padrão, o bot posta um embed intitulado "Support Ticket" que dá as boas-vindas ao membro, mostra o ID do ticket e a hora de criação e pede que ele descreva o problema. Os botões Assumir e Fechar são anexados.

Você pode substituí-la, por tipo de ticket, pelo seu próprio texto ou embed. Use o construtor de embeds do painel (**Configure a mensagem de abertura do ticket**). Marcadores disponíveis aqui:

| Marcador | Valor |
| --- | --- |
| `%ticket.id%` | O número do ticket |
| `%ticket.channel%` | Menção ao canal do ticket |
| `%ticket.user%` | O nome de usuário de quem abriu |
| `%ticket.user.mention%` | Uma menção a quem abriu |
| `%ticket.user.avatar%` | A URL do avatar de quem abriu |
| `%ticket.user.id%` | O ID de usuário de quem abriu |
| `%ticket.created%` | Quando o ticket foi criado |
| `%modal.<fieldId>%` | A resposta a um campo do formulário |

O conjunto geral de marcadores não é aplicado a esta mensagem; apenas os acima.

## O que acontece quando um ticket é aberto

1. Membros na lista negra são recusados com uma mensagem efêmera.
2. Os tickets abertos do membro neste tipo são contados em relação ao **Máx. de tickets ativos** (padrão 1).
3. O canal é criado na categoria de tickets com `@everyone` negado, quem abriu o ticket autorizado a ver, enviar, ler o histórico, anexar arquivos e incorporar links, os cargos de suporte com as mesmas permissões mais Gerenciar Mensagens, e os cargos com acesso autorizados apenas a ler.
4. A mensagem de abertura é postada com os botões Assumir e Fechar.
5. Se houver um canal de logs definido, uma entrada de "novo ticket" é postada nele.
6. Um evento **Ticket aberto** é publicado para os chat triggers.

## Assumir, notas, prioridades e tags

**Assumir**: um membro de um cargo de suporte ou um administrador assume o ticket com o botão ou com `ticketclaim`. O canal recebe um embed de "assumido por". Somente quem assumiu ou um administrador pode liberar o ticket. Um ticket fechado ou já assumido não pode ser assumido.

**Notas**: `ticketnote` adiciona uma nota da equipe ao ticket atual. A nota é armazenada com o ticket, exibida no painel e postada no canal do ticket como um embed azul de "nota adicionada", com o autor no rodapé.

**Prioridades** são definições válidas em todo o servidor, criadas com `ticketaddpriority` ou na aba **Configuração**. Cada uma tem um ID, um nome de exibição, um emoji, um nível de 1 a 5, uma cor, um tempo de resposta e uma opção **Notificar a equipe**. Definir uma prioridade em um ticket posta um embed nessa cor e, quando a opção está ativada, menciona os cargos de suporte. Um tipo de ticket pode restringir quais prioridades são permitidas.

**Tags** são rótulos válidos em todo o servidor, com ID, nome, descrição e cor. Adicione ou remova-as em um ticket com `ticketaddtags` e `ticketremovetags`, usando os IDs das tags. O painel as mostra em cada ticket e permite buscar por tag.

## Fechar, arquivar e transcrições

Fechar marca o ticket como fechado e posta um embed vermelho de "ticket fechado". Em seguida, em ordem:

1. Se **Salvar transcrição** estiver ativado para o tipo e houver um canal de transcrições definido, as últimas 5000 mensagens são salvas e um embed com um link **Ver transcrição** é postado no canal de transcrições. O link abre a transcrição no painel.
2. Se o arquivamento automático estiver ativado para o tipo, ou se você fechou com `ticketclose true`, o ticket é arquivado (veja abaixo).
3. Caso contrário, os comportamentos de fechamento são executados: renomear para `closed-...`, remover quem abriu, bloquear o canal mantendo os cargos de suporte e então mover para a categoria de arquivo ou, com **Excluir ao fechar**, avisar no canal e agendar a exclusão após o atraso. As exclusões agendadas são processadas uma vez por minuto.

Arquivar renomeia o canal para `archived-...`, o move para a categoria de arquivo, o deixa somente leitura para todos e marca o ticket como arquivado. `ticketarchive` faz isso diretamente em um ticket aberto. Se o canal não existir mais, o ticket é simplesmente marcado como arquivado.

Fechar publica um evento **Ticket fechado** para os chat triggers.

> [!NOTE]
> Uma transcrição só é gerada quando o tipo tem **Salvar transcrição** ativado e o servidor tem um canal de transcrições. Sem um canal de transcrições, o fechamento ainda é concluído, mas nada é salvo.

## Casos

Um caso agrupa tickets que pertencem ao mesmo assunto, por exemplo várias denúncias sobre a mesma pessoa. Crie um com `ticketcreatecase <title> <description>` ou na aba **Casos**, depois vincule o ticket atual com `ticketlinkcase <caseId>` e desvincule com `ticketunlinkcase`. Os casos têm notas próprias, podem ser fechados e reabertos e podem ser editados pelo painel ou pelos comandos de barra `/tickets cases`.

## Lista negra

`ticketblock @user [reason]` impede que um membro abra tickets. O motivo é escrito no canal de logs, se houver um definido. `ticketunblock` remove o bloqueio. A aba **Avançado** do painel tem a mesma seção de **Gerenciamento da lista negra**, que recebe um ID de usuário.

## Ferramentas em lote

- `ticketcloseinactive <hours>` fecha todos os tickets abertos sem atividade por essa quantidade de horas, postando um embed de "fechado automaticamente" em cada um e arquivando-o se o tipo tiver uma categoria de arquivo. **Fechar tickets inativos**, na aba **Avançado**, faz o mesmo.
- `ticketmoveall <source category> <target category>` move todos os canais de ticket entre categorias.

## Estatísticas

`ticketstats` mostra totais, contagens de abertos e fechados, tempo médio de resposta em minutos, tempo médio de resolução em horas e detalhamentos por tipo e prioridade. `ticketuserstats [@user]` mostra o mesmo para um membro, além dos tickets recentes dele. A aba **Visão geral** mostra os tempos de resposta, os tickets por prioridade e o desempenho da equipe.

## Configurações

A página Tickets tem seis abas: **Visão geral**, **Tickets**, **Painéis de tickets**, **Configuração**, **Casos** e **Avançado**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Canal de transcrições | nenhum | Onde são postados os resumos de transcrições com links (Configuração) |
| Canal de logs | nenhum | Onde a criação de tickets e as entradas da lista negra são registradas (Configuração) |
| Prioridades | nenhuma | Definições de prioridade válidas em todo o servidor (Configuração) |
| Tags | nenhuma | Definições de tag válidas em todo o servidor (Configuração) |
| Embed do painel | título "Support Tickets" | A mensagem do painel, criada no editor de embeds (Painéis de tickets) |
| Configurações por tipo | veja a tabela acima | Definidas em cada botão ou opção de menu de seleção (Painéis de tickets) |
| Lista negra | vazia | Membros que não podem abrir tickets (Avançado) |

A aba **Tickets** lista os tickets abertos e fechados, com busca por ticket, usuário, canal ou tag. Dali, a equipe pode assumir, liberar, definir a prioridade, adicionar ou remover tags, adicionar uma nota da equipe, fechar com um motivo opcional, arquivar e abrir a transcrição.

> [!PERMISSION]
> O bot precisa de Gerenciar Canais e Gerenciar Cargos para criar os canais de ticket e definir quem pode vê-los. O cargo dele precisa conseguir ver as categorias de tickets e de arquivo.

## Passo a passo de configuração

1. Crie uma categoria para tickets abertos e, opcionalmente, uma para os fechados. Crie um canal de transcrições e um canal de logs que apenas a equipe possa ver.
2. Abra **Tickets** no painel, vá para **Configuração** e defina **Canal de transcrições** e **Canal de logs**.
3. Ainda em **Configuração**, crie pelo menos uma prioridade (por exemplo `urgent`, nível 5, Notificar a equipe ativado) e as tags que desejar.
4. Vá para **Painéis de tickets** e **Criar novo painel**. Escolha o canal e desenhe o **Embed do painel**.
5. Selecione o painel e adicione um **Novo botão**. Defina o rótulo, o estilo, a **Categoria de tickets**, a **Categoria de arquivo**, os **Cargos de suporte** e ative **Salvar transcrição**. Decida entre manter os canais fechados na categoria de arquivo ou **Excluir ao fechar** com um atraso.
6. Opcionalmente, abra o construtor de modal para adicionar campos de formulário e o editor da mensagem de abertura para personalizar as boas-vindas.
7. Para vários tipos de ticket em um mesmo menu suspenso, adicione um **Novo menu de seleção** e uma opção por tipo, com as mesmas configurações.
8. Abra um ticket de teste a partir de outra conta, assuma-o, defina uma prioridade, feche-o e verifique o canal de transcrições.

No Discord, `/tickets setup wizard #channel` percorre as mesmas etapas com modelos (Basic Support, Department Support, Gaming Server, Business, Mod Applications).

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado). Os IDs de painel são IDs de mensagem; os IDs de botão, menu e opção vêm de `panelinfo` ou `ticketlistpanel`.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `ticketpanel <#channel> [embedJson]` | `tpanel` | Administrador | Cria um painel, com uma pré-visualização ou solicitação de criação |
| `ticketpaneldelete <panelId> [force]` | `tpaneldelete` | Administrador | Exclui um painel; `true` força a exclusão mesmo com tickets vinculados |
| `ticketupdatepanel <panelId> <embedJson>` | `tupdatepanel` | Administrador | Substitui o embed do painel |
| `ticketmovepanel <panelId> <#channel>` | `tmovepanel` | Administrador | Move um painel para outro canal |
| `ticketduplicatepanel <panelId> <#channel>` | `tduplicatepanel` | Administrador | Copia um painel e seus componentes |
| `panellist` | `plist` | Administrador | Lista os painéis com a contagem de componentes |
| `panelinfo <panelId>` | `pinfo` | Administrador | Mostra os botões e menus de um painel com os IDs |
| `ticketlistpanels` | `tlistpanels` | Gerenciar Canais | Lista paginada e detalhada de todos os painéis |
| `ticketlistpanel <panelId>` | `tlistpanel` | Gerenciar Canais | Todos os componentes de um painel com as configurações |
| `checkpanels` | `tcheckpanels` | Administrador | Informa os painéis cuja mensagem ou canal está ausente |
| `recreatepanel <panelId>` | `trecreate` | Administrador | Reposta um painel ausente |
| `recreateallpanels` | `trecreateall` | Administrador | Reposta todos os painéis ausentes |
| `setpaneltranscripts <panelId> <true or false>` | `sptranscripts` | Administrador | Alterna as transcrições de todos os botões de um painel |
| `ticketaddbutton <panelId> <label> [style] [emoji]` | `taddbtn` | Administrador | Adiciona um botão |
| `buttoninfo <buttonId>` | `binfo` | Administrador | Mostra as configurações de um botão |
| `deletebutton <buttonId>` | `delbtn` | Administrador | Remove um botão |
| `ticketcategory <buttonId> [category]` | `tcat` | Administrador | Define ou limpa a categoria de tickets |
| `ticketarchivecategory <buttonId> [category]` | `tarchivecat` | Administrador | Define ou limpa a categoria de arquivo |
| `ticketautoarchive <buttonId> [true or false]` | `tautoarchive` | Administrador | Arquiva automaticamente ao fechar |
| `ticketclosebehavior <buttonId> [autoArchive] [deleteOnClose] [lockOnClose] [renameOnClose] [deleteDelayMinutes]` | `tclosebehavior` | Administrador | Define vários comportamentos de fechamento de uma só vez |
| `ticketautoclose <buttonId> [hours]` | `tautoclose` | Administrador | Define ou limpa as horas de fechamento automático |
| `setautoclose <buttonId> <hours>` | `sautoclose` | Administrador | Igual ao anterior |
| `ticketresponsetime <buttonId> [minutes]` | `tresponsetime` | Administrador | Define ou limpa o tempo de resposta exigido |
| `setresponsetime <buttonId> <minutes>` | `sresponsetime` | Administrador | Igual ao anterior |
| `setmodaltitle <buttonId> <title>` | `smodaltitle` | Administrador | Título do formulário do ticket |
| `addmodalfield <buttonId> <label> [options]` | `addmfield` | Administrador | Adiciona um campo de formulário, com opções como `paragraph,optional,max:500` |
| `removemodalfield <buttonId> <fieldId>` | `removemfield` | Administrador | Remove um campo de formulário |
| `listmodalfields <buttonId>` | `listmfields` | Administrador | Lista os campos do formulário |
| `addselectmenu <panelId>` | `addsmenu` | Administrador | Adiciona um menu de seleção por meio de uma solicitação guiada |
| `addoption <menuId> <label> [description] [emoji]` | `addopt` | Administrador | Adiciona uma opção a um menu |
| `listoptions <menuId>` | `listopts` | Administrador | Lista as opções de um menu |
| `removeoption <menuId> <value>` | `removeopt` | Administrador | Confirma uma opção pelo valor (veja as armadilhas) |
| `deleteselectoption <optionId>` | `delselectoption` | Administrador | Remove uma opção; a última não pode ser removida |
| `setplaceholder <menuId> <text>` | `splaceholder` | Administrador | Altera o marcador do menu |
| `deleteselectmenu <menuId>` | `delselectmenu` | Administrador | Remove um menu e suas opções |
| `ticketclaim` | `tclaim` | Qualquer pessoa | Assume o ticket atual (cargo de suporte ou administrador) |
| `ticketunclaim` | `tunclaim` | Qualquer pessoa | Libera o ticket que você assumiu (quem assumiu ou administrador) |
| `ticketclose [archive]` | `tclose` | Qualquer pessoa | Fecha o ticket atual; `true` também arquiva |
| `ticketarchive` | `tarchive` | Gerenciar Canais | Arquiva o ticket atual |
| `ticketnote <text>` | `tnote` | Qualquer pessoa | Adiciona uma nota da equipe |
| `ticketpriority <priorityId>` | `tpriority` | Qualquer pessoa | Define a prioridade do ticket atual |
| `ticketaddtags <tagId...>` | `taddtags` | Qualquer pessoa | Adiciona tags ao ticket atual |
| `ticketremovetags <tagId...>` | `tremovetags` | Qualquer pessoa | Remove tags do ticket atual |
| `ticketaddpriority <id> <name> <emoji> <level> <pingStaff> <responseTime> <color>` | `taddpriority` | Administrador | Define uma prioridade, por exemplo `taddpriority urgent Urgent :fire: 5 true 00:15:00 red` |
| `ticketremovepriority <id>` | `tremovepriority` | Administrador | Exclui uma definição de prioridade |
| `ticketaddtag <id> <name> <description> <color>` | `taddtag` | Administrador | Define uma tag |
| `ticketremovetag <id>` | `tremovetag` | Administrador | Exclui uma definição de tag |
| `ticketcreatecase <title> <description>` | `tcreatecase` | Gerenciar Mensagens | Cria um caso |
| `ticketlinkcase <caseId>` | `tlinkcase` | Gerenciar Mensagens | Vincula o ticket atual a um caso |
| `ticketunlinkcase` | `tunlinkcase` | Gerenciar Mensagens | Desvincula o ticket atual |
| `ticketblock @user [reason]` | `tblock` | Administrador | Coloca um membro na lista negra |
| `ticketunblock @user` | `tunblock` | Administrador | Remove da lista negra |
| `tickettranscriptchannel [#channel]` | `ttranscriptch` | Administrador | Define ou limpa o canal de transcrições |
| `ticketlogchannel [#channel]` | `tlogch` | Administrador | Define ou limpa o canal de logs |
| `ticketcloseinactive <hours>` | `tcloseinactive` | Administrador | Fecha tickets parados por esse tempo |
| `ticketmoveall <category> <category>` | `tmoveall` | Administrador | Move todos os tickets entre categorias |
| `ticketstats` | `tstats` | Qualquer pessoa | Estatísticas de tickets do servidor |
| `ticketuserstats [@user]` | `tuserstats` | Qualquer pessoa | Estatísticas de tickets de um membro |

Os comandos de barra ficam em `/tickets` (criar painel, listar painéis, assumir, fechar, nota, arquivar, prioridade, grupos de painel e de configurações, grupo de casos) e `/tickets setup` (wizard, quick-button, quick-menu, from-template, templates).

## Dicas e armadilhas

- Os comandos que agem sobre "o ticket atual" só funcionam dentro de um canal de ticket. Execute-os no ticket, não em um canal da equipe.
- Todo tipo de ticket precisa de cargos de suporte; do contrário, só administradores podem assumir e ninguém além de quem abriu pode falar quando o canal for bloqueado.
- O limite padrão é um ticket aberto por membro por tipo. Aumente **Máx. de tickets ativos** nos tipos em que tickets repetidos são normais.
- **Fechamento automático (horas)** e **Tempo de resposta exigido** são salvos no tipo e exibidos em `buttoninfo`, mas a única coisa no bot que fecha tickets inativos é `ticketcloseinactive` ou a ação em lote **Fechar tickets inativos**. Execute-a por conta própria, em uma programação, se quiser uma limpeza automática.
- `removeoption` atualmente só informa sucesso; use `deleteselectoption` com o ID da opção para realmente remover uma opção.
- **Excluir ao fechar** e **Bloquear ao fechar** interagem: um ticket configurado para ser excluído não é bloqueado antes, ele apenas espera o atraso da exclusão.
- O JSON do embed do painel precisa ser uma saída válida do construtor de embeds. Use o editor do painel e copie o JSON se preferir usar comandos.
- Excluir um painel com tickets abertos é recusado, a menos que você passe `true`, o que limpa o vínculo dos tickets com o painel.
- As transcrições capturam no máximo 5000 mensagens, e o link "Ver transcrição" abre a transcrição no painel.

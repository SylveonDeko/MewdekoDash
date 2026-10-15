---
title: Estados de Cargos
slug: rolestates
summary: Lembre os cargos que um membro tinha quando saiu do servidor e devolva-os automaticamente quando ele voltar.
icon: fa-tag
category: Actions
dashboard: /dashboard/rolestates
module: RoleStates
tags: [role states, role persistence, restore roles, rejoin, saved roles, role backup, transfer roles, estados de cargos, persistência de cargos, restaurar cargos, reentrada, cargos salvos, backup de cargos, transferir cargos]
related: [administration, statusroles]
---

## O que ele faz

Quando os Estados de Cargos estão ativados, o bot observa as saídas de membros. No momento em que alguém sai, ele registra a lista de cargos que a pessoa tinha naquele instante. Se ela voltar depois, o bot adiciona de volta todos os cargos salvos, para que ela não precise pedir à equipe para ser verificada ou receber os cargos novamente.

Do ponto de vista do membro, nada muda na saída. Na volta, os cargos simplesmente estão lá de novo, geralmente antes mesmo de ele terminar de ler o canal de boas-vindas.

A equipe tem uma lista de cargos salvos por membro, que pode ser consultada, editada ou excluída, uma lista de exclusão para cargos que nunca devem ser restaurados, e uma ação em massa "salvar todos agora", para que o recurso também cubra membros que já estavam no servidor antes de você ativá-lo.

## Por que você usaria

- Membros verificados que saem por engano, ou para silenciar notificações, voltam sem perder o acesso.
- Cargos de cor, de menções e de hobby escolhidos em um menu de cargos por reação continuam após uma reentrada.
- Servidores com um processo de verificação manual evitam verificar de novo pessoas que já foram aprovadas.
- Você pode escolher a dedo os cargos que nunca devem voltar, como um cargo de silenciado temporário ou um cargo da equipe.
- Mudança de uma comunidade para um novo servidor: os estados de cargos podem ser transferidos e associados a cargos com os mesmos nomes.

## Como um estado de cargos é salvo

Quando um membro sai, o bot verifica:

1. Os Estados de Cargos estão ativados no servidor.
2. **Ignorar bots** está desativado, ou o membro não é um bot.
3. O membro não está na lista de **Usuários negados**.

Se tudo isso passar, o bot pega os cargos atuais do membro, descarta o cargo `@everyone` e quaisquer cargos gerenciados (cargos de bots, cargo de booster, cargos de integrações) e então remove o que estiver na lista de **Cargos negados**. Se não sobrar nada, nada é salvo. Caso contrário, a lista substitui o que estava armazenado para aquele membro antes.

Banimentos são tratados separadamente. Com **Limpar ao banir** ativado, banir um membro apaga o estado salvo dele, então um desbanimento seguido de reentrada não restaura nada.

## Como um estado de cargos é restaurado

Na entrada, o bot verifica novamente se o recurso está ativado, se os bots não estão sendo ignorados (caso o membro seja um bot) e se o usuário não está na lista de negados. Em seguida, adiciona todos os cargos salvos em uma única requisição. Cargos que não existem mais, ou que estão acima do cargo mais alto do bot, fazem essa requisição falhar, e a falha é apenas registrada.

> [!PERMISSION]
> O bot precisa de Gerenciar Cargos, e o cargo mais alto dele deve estar acima de todos os cargos que deve devolver.

### Pulando cargos de atribuição automática

Se você também usa cargos de atribuição automática do módulo de Administração, um membro que volta receberia normalmente tanto os cargos salvos quanto os de atribuição automática. Ativar **pular atribuição automática** com `togglerolestatesskipautoassign` faz o bot ignorar os cargos de atribuição automática para quem tem um estado de cargos salvo, então os membros que voltam recebem apenas o que tinham antes. Esta opção é apenas por comando; ela não existe no painel.

## Gerenciando estados salvos manualmente

A equipe pode criar ou ajustar o estado de um membro sem esperar que ele saia:

- `setuserrolestate` substitui a lista salva de um membro pelos cargos que você informar. Cargos gerenciados e `@everyone` são descartados.
- `addrolestorolestate` e `removerolesfromrolestate` alteram uma lista salva existente.
- `deleteuserrolestate` esquece um membro por completo.
- `saveallrolestates` cria um instantâneo de todos os membros atuais de uma vez, aplicando os mesmos filtros de bots e de negados de um salvamento automático.

O painel tem uma coisa que os comandos não têm: **Copiar estado de cargos**, que pega os cargos salvos de um membro e os aplica diretamente a outro membro que esteja no servidor.

## Transferindo para outro servidor

`transferrolestates <serverId>` copia todos os estados salvos do servidor atual para outro servidor em que o bot esteja. Os cargos são associados pelo nome, sem diferenciar maiúsculas de minúsculas, e os cargos gerenciados são ignorados. Membros cujos cargos salvos não têm correspondência de nome no destino são pulados. O servidor de destino tem os Estados de Cargos ativados automaticamente, caso ainda não estivessem, herdando os valores de **Ignorar bots** e **Limpar ao banir** da origem quando ele não tiver configurações próprias.

## Configurações

A aba **Configurações** da página Estados de Cargos tem duas subabas, **Geral** e **Lista de negados**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Estados de cargos | Desligado | Chave geral para salvar e restaurar |
| Limpar ao banir | Desligado | Exclui o estado salvo de um membro quando ele é banido |
| Ignorar bots | Desligado | Não salva nem restaura cargos de contas de bots |
| Salvar estados atuais | botão | Cria um instantâneo dos cargos de todos os membros atuais agora |
| Cargos negados | nenhum | Cargos que nunca são salvos e, portanto, nunca são restaurados |
| Usuários negados | nenhum | Membros cujos cargos nunca são salvos ou restaurados |

A aba **Gerenciamento** tem **Gerenciar cargos do usuário** (adiciona ou remove cargos selecionados do estado salvo de um membro) e **Copiar estado de cargos**. A aba **Estados de Cargos** lista todos os estados salvos com o nome, o ID e os cargos de cada membro, e permite ver os detalhes ou excluir uma entrada.

## Passo a passo da configuração

1. Confirme que o cargo do bot está acima de todos os cargos que você quer que ele restaure.
2. Abra **Estados de Cargos** no painel e ative **Estados de cargos** em **Configurações**, **Geral**.
3. Ative **Ignorar bots**, a menos que você queira lembrar especificamente dos cargos de bots.
4. Decida sobre **Limpar ao banir**. Deixe desativado se quiser que os membros desbanidos recebam seus cargos de volta.
5. Em **Lista de negados**, adicione cargos da equipe, cargos de punição e qualquer cargo temporário em **Cargos negados**.
6. Pressione **Salvar todos** em **Salvar estados atuais** para que os membros existentes sejam cobertos a partir de hoje.
7. Confira a aba **Estados de Cargos** para confirmar que o instantâneo foi preenchido.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado). Todos os comandos deste módulo exigem Administrador.

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `togglerolestates` | `trs` | Administrador | Ativa ou desativa os Estados de Cargos |
| `viewrolestatessettings` | `vrss` | Administrador | Mostra as configurações atuais e as listas de negados |
| `viewuserrolestates` | `viewrolestates`, `vurs` | Administrador | Percorre todos os estados salvos |
| `saveallrolestates` | `saveserverstates`, `backuprolestates` | Administrador | Cria um instantâneo de todos os membros atuais |
| `transferrolestates <serverId>` | `copyrolestates`, `moverolestates` | Administrador | Copia os estados para outro servidor, associando cargos pelo nome |
| `togglerolestatesignorebots` | `trsib` | Administrador | Alterna ignorar contas de bots |
| `togglerolestatesclearonban` | `trscob` | Administrador | Alterna limpar o estado ao banir |
| `togglerolestatesskipautoassign` | `trssaa`, `rsskipautoassign` | Administrador | Alterna pular cargos de atribuição automática para membros com estado salvo |
| `rolestatesadddenyrole @role...` | `rsadr` | Administrador | Adiciona cargos à lista de negados |
| `rolestatesremovedenyrole @role...` | `rsrra` | Administrador | Remove cargos da lista de negados |
| `rolestatesadddenyuser @user...` | `rsadu` | Administrador | Adiciona membros à lista de negados |
| `rolestatesremovedenyuser @user...` | `rolestatesremoveadduser`, `rsrau` | Administrador | Remove membros da lista de negados |
| `setuserrolestate @user @role...` | `surs` | Administrador | Substitui os cargos salvos de um membro |
| `addrolestorolestate @user @role...` | `arsrs` | Administrador | Adiciona cargos ao estado salvo de um membro |
| `removerolesfromrolestate @user @role...` | `rrfrs` | Administrador | Remove cargos do estado salvo de um membro |
| `deleteuserrolestate @user` | `dur` | Administrador | Esquece o estado salvo de um membro |

As equivalentes de barra ficam em `/rolestates`.

## Dicas e armadilhas

- Nada é salvo para membros que já estavam no servidor quando você ativou o recurso, até que eles saiam ou até que você execute **Salvar todos**. Execute-o uma vez logo após a configuração.
- Apenas as saídas disparam um salvamento. Expulsões contam como saídas. Banimentos também contam como saídas, e o estado é então removido de novo se **Limpar ao banir** estiver ativado.
- A restauração usa uma única chamada de adicionar cargos. Um cargo ausente ou alto demais faz a restauração inteira falhar silenciosamente, então mantenha a lista de negados atualizada quando excluir ou reordenar cargos.
- Cargos gerenciados (cargos de integrações de bots, cargo de booster) nunca são salvos. O próprio Discord os atribui.
- `viewuserrolestates` mostra três membros por página.
- Tanto `setuserrolestate` quanto `deleteuserrolestate` aceitam um usuário que já saiu, então você pode corrigir um estado antes que a pessoa volte.
- Usuários negados afetam apenas os salvamentos e as restaurações automáticas. Os comandos manuais e **Copiar estado de cargos** continuam funcionando para esses membros.

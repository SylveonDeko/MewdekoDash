---
title: Listas de tarefas
slug: todo
summary: Listas de tarefas compartilhadas e pessoais dentro do Discord, com prioridades, datas de vencimento, tags, busca e permissões por pessoa.
icon: fa-check
category: Community
dashboard: /dashboard/todo
module: Todo
tags: [todo, tasks, task list, checklist, project, due date, priority, tags, permissions, tarefas, lista de tarefas, checklist, projeto, data de vencimento, prioridade, etiquetas, permissões]
related: [administration, tickets]
---

## O que faz

As Listas de tarefas oferecem ao seu servidor listas de tarefas que ficam no bot. Um membro cria uma lista, adiciona itens a ela, marca como concluídos e pode conceder acesso para que outras pessoas vejam ou trabalhem na mesma lista. A equipe com Gerenciar Servidor pode criar listas de servidor que todos os membros veem.

Cada item tem um título, uma descrição opcional, uma prioridade de 1 a 4, tags opcionais, uma data de vencimento opcional e um horário de lembrete opcional. Os itens mantêm uma posição, para que você possa reordená-los, e os itens concluídos são marcados com quem os concluiu e quando.

Há dois tipos de lista. Uma lista pessoal pertence a um só membro e fica invisível para todos os outros, a menos que o dono conceda acesso. Uma lista de servidor pertence ao servidor; ela é pública por padrão, para que qualquer pessoa possa vê-la, mas só quem tem permissão explícita pode adicionar ou alterar itens.

As listas aparecem como embeds no Discord e como cartões no painel. O painel também acompanha o progresso, a contagem de atrasos e a taxa de conclusão da lista que você tiver aberta.

## Por que usar

- Uma equipe de moderação acompanha as tarefas pendentes em uma única lista de servidor, em vez de uma mensagem fixada que fica desatualizada.
- Organizadores de eventos compartilham uma checklist e marcam os itens conforme avançam.
- Membros mantêm uma lista privada com coisas para acompanhar no servidor.
- Um canal de projeto precisa de tags e prioridades para que os itens "crítico" se destaquem dos de "baixa".

## Listas e permissões

Toda lista tem um dono, a pessoa que a criou. O dono pode fazer tudo nessa lista. Outras pessoas recebem acesso por meio de permissões, concedidas por usuário com `todogrant`.

| Permissão | O que permite |
| --- | --- |
| `view` | Ver a lista e os itens dela |
| `add` | Adicionar novos itens |
| `edit` | Editar, marcar com tags, reordenar e definir datas nos itens de outras pessoas |
| `complete` | Concluir itens de outras pessoas |
| `delete` | Excluir itens de outras pessoas |
| `manage` | Alterar configurações da lista, excluir a lista, conceder e revogar acesso |
| `all` | Todas as permissões acima |

Informe várias separadas por vírgula, por exemplo `todogrant 12 @user view,add,complete`. Conceder novamente substitui as permissões anteriores daquele usuário. `todorevoke` remove todas elas.

Duas regras se aplicam independentemente das permissões: quem criou um item sempre pode editar, concluir e excluir o próprio item, e o dono da lista sempre pode fazer qualquer coisa.

Quem pode ver uma lista:

| Tipo de lista | Pública | Quem pode ver |
| --- | --- | --- |
| Pessoal | qualquer | O dono, além de quem recebeu `view` |
| Servidor | sim (padrão) | Todos no servidor |
| Servidor | não | O dono, além de quem recebeu `view` |

`todotoggleprivacy` alterna uma lista entre pública e privada. Apenas o dono ou quem tem `manage` pode fazer isso.

## Itens

| Campo | Padrão | Observações |
| --- | --- | --- |
| Título | obrigatório | Exibido em negrito na lista |
| Descrição | nenhuma | Exibida em itálico abaixo do título |
| Prioridade | 1 (Baixa) pelos comandos, Médio no painel | 1 Baixa, 2 Médio, 3 Alto, 4 Crítico. Valores fora de 1 a 4 são ajustados para o limite mais próximo |
| Data de vencimento | nenhuma | Exibida como carimbo de data relativo do Discord ao lado do título |
| Horário de lembrete | nenhum | Armazenado no item e definido com `todosetreminder` |
| Tags | nenhuma | Não diferenciam maiúsculas de minúsculas; adicionar uma tag que já existe não faz nada |
| Posição | fim da lista | Altere com `todoreorder` |

`todoshow` lista os itens pendentes ordenados por posição, depois por prioridade e depois pela data de criação. Passe `true` como segundo argumento para também mostrar até cinco itens concluídos, com a data em que foram concluídos. As datas de `todosetdue` e `todosetreminder` são interpretadas de forma flexível, então `2026-10-01 18:00` e `October 1 2026` funcionam.

`todosearch` compara a consulta com os títulos, as descrições e as tags dos itens pendentes e mostra até dez resultados. `todofilter` restringe uma lista por uma única tag (`todofilter 12 tag bug`) ou por prioridade (`todofilter 12 priority 4`).

Cada lista pode ter uma cor hexadecimal, definida com `todosetcolor 12 #ff8800`, usada na borda do embed. O padrão é `#7289da`.

## Configurações

Não há configurações globais do servidor. Tudo é definido por lista ou por item.

A página de Listas de tarefas tem uma única visualização. No lado esquerdo estão todas as listas que você pode ver, com uma caixa **Buscar listas de tarefas**, uma alternância **Mostrar itens concluídos** e **Ordenar por** (Prioridade, Data de vencimento, Criado, Título), com um seletor de ordem. Ao selecionar uma lista, aparecem os itens com os botões **Adicionar item** e **Excluir lista**, um editor de item com **Prioridade** e **Data de vencimento**, e um botão **Gerenciar permissões** em cada lista.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Nome e descrição da lista | obrigatório, nenhuma | Definidos ao criar uma lista pelo botão **Criar lista** |
| Prioridade (item) | Médio | A prioridade do item; exibida como um chip colorido |
| Data de vencimento (item) | nenhuma | Prazo usado no contador de atrasos |
| Mostrar itens concluídos | desativado | Se os itens concluídos aparecem na visualização da lista |

> [!NOTE]
> As listas criadas pelo painel são sempre listas de servidor. Crie listas pessoais com `todocreatelist` no Discord.

## Passo a passo de configuração

1. Abra **Listas de tarefas** no painel e clique em **Criar lista**.
2. Informe um nome e uma descrição opcional. A lista é criada como uma lista pública de servidor.
3. Clique na lista e depois em **Adicionar item**. Preencha **O que precisa ser feito?**, uma descrição opcional e uma prioridade.
4. Use **Gerenciar permissões** no cartão da lista para ver quem tem acesso. Conceda acesso pelo Discord com `todogrant <listId> @user add,complete` para que essas pessoas possam trabalhar nela.
5. No Discord, execute `todolists` para obter o ID da lista e depois `todoshow <listId>` para conferir se ela é exibida.
6. Marque itens como concluídos com `todocomplete <itemId>`; o ID do item aparece entre crases em `todoshow`.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado). Os IDs de listas e itens vêm de `todolists` e `todoshow`.

| Comando | Atalhos | Requer | Função |
| --- | --- | --- | --- |
| `todocreatelist <name> [description]` | `tcl` | Ninguém | Cria uma lista pessoal |
| `todocreateserverlist <name> [description]` | `tcsl` | Gerenciar Servidor | Cria uma lista para o servidor inteiro |
| `todolists [includeServer]` | | Ninguém | Lista as listas que você pode ver; passe `false` para ver apenas as pessoais |
| `tododeletelist <listId>` | `tdl` | Ninguém | Exclui uma lista e todos os seus itens (dono ou `manage`) |
| `todoshow <listId> [includeCompleted]` | `ts` | Ninguém | Mostra os itens de uma lista |
| `todoadd <listId> <title> [description]` | `ta` | Ninguém | Adiciona um item com prioridade Baixa |
| `todoaddpriority <listId> <priority> <title> [description]` | `tap` | Ninguém | Adiciona um item com prioridade de 1 a 4 |
| `todoedit <itemId> <title> [description]` | `te` | Ninguém | Altera o título e a descrição de um item |
| `todocomplete <itemId>` | `tc` | Ninguém | Marca um item como concluído |
| `tododelete <itemId>` | `td` | Ninguém | Exclui um item |
| `todoreorder <itemId> <position>` | `tr` | Ninguém | Move um item para uma posição (começando em 1) |
| `todosetdue <itemId> <date>` | `tsd` | Ninguém | Define uma data de vencimento |
| `todocleardue <itemId>` | `tcd` | Ninguém | Remove a data de vencimento |
| `todosetreminder <itemId> <date>` | `tsr` | Ninguém | Define um horário de lembrete |
| `todoclearreminder <itemId>` | `tcr` | Ninguém | Remove o horário de lembrete |
| `todoaddtag <itemId> <tag>` | `tat` | Ninguém | Adiciona uma tag |
| `todoremovetag <itemId> <tag>` | `trt` | Ninguém | Remove uma tag |
| `todosearch <listId> <query>` | `tsearch` | Ninguém | Busca itens pendentes por título, descrição ou tag |
| `todofilter <listId> <tag or priority> <value>` | `tf` | Ninguém | Filtra itens pendentes por uma tag ou uma prioridade |
| `todosetcolor <listId> <#hex>` | `tsc` | Ninguém | Define a cor do embed |
| `todotoggleprivacy <listId>` | `ttp` | Ninguém | Alterna uma lista entre pública e privada |
| `todogrant <listId> @user <perms>` | `tg` | Ninguém | Concede permissões separadas por vírgula |
| `todorevoke <listId> @user` | `trv` | Ninguém | Remove todas as permissões de um usuário |
| `todopermissions <listId>` | `tp` | Ninguém | Mostra quem tem quais permissões |

"Ninguém" significa que não há verificação de permissão do Discord; as próprias permissões da lista decidem se o comando funciona. Os mesmos comandos existem como comandos de barra em `/todo`.

## Dicas e cuidados

- Os horários de lembrete são salvos no item, mas nada no bot envia um lembrete quando esse horário chega no momento. Por enquanto, trate-o como uma anotação.
- `todoshow` marca uma lista como não encontrada se você não tiver acesso de `view`, mesmo quando o ID está correto.
- O nome de uma lista precisa ser único por dono e tipo; então dois membros podem ter cada um uma lista pessoal "Compras", mas um mesmo membro não pode ter duas.
- `todoreorder` renumera todos os itens da lista, então as posições ficam contínuas.
- Listas públicas de servidor podem ser lidas por todos, mas ninguém além do dono pode adicionar itens a elas até que você conceda `add`.
- Use `todogrant` no Discord para o conjunto completo de permissões; a visualização **Gerenciar permissões** do painel serve para conferir quem tem acesso.
- Excluir uma lista remove suas permissões e itens de uma vez, e isso não pode ser desfeito.

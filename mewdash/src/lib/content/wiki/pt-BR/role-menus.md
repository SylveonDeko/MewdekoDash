---
title: Menus de cargos
slug: role-menus
summary: Publica uma mensagem com um menu suspenso ou botões que os membros usam para escolher os próprios cargos.
icon: fa-list-ul
category: Actions
dashboard: /dashboard/role-menus
module: RoleMenus
tags: [role menus, self roles, dropdown, buttons, pronouns, colors, menus de cargos, autoatribuição de cargos, menu suspenso, botões, pronomes, cores]
related: [administration, embedbuilder, rolestates]
---

## O que faz

Um menu de cargos é uma única mensagem em um canal com um **menu suspenso** ou uma fileira de **botões** abaixo dela. Cada opção do menu concede um cargo. Os membros escolhem uma opção para receber o cargo e a escolhem de novo para removê-lo, assim um servidor pode deixar as pessoas escolherem seus pronomes, cores, menções ou regiões sem pedir à equipe.

Cada menu tem um nome (só a equipe o vê, e ele dá título à mensagem padrão), um canal, uma mensagem e até 25 opções. Uma opção tem um cargo, o nome exibido no menu, um emoji opcional e uma descrição opcional. As descrições aparecem abaixo de cada opção do menu suspenso e na mensagem padrão. Os botões também têm uma cor: azul, cinza, verde ou vermelho.

A mensagem pode ser qualquer coisa que o criador de embeds permita: texto simples, um ou mais embeds, ou ambos. Se deixá-la vazia, o bot publica o nome do menu com uma linha para cada opção.

## Escolher vários ou escolher um

- **Escolher vários** permite que os membros ativem ou desativem cada cargo. Dois limites controlam quantos eles podem ter: **Deve manter pelo menos** impede que eles caiam abaixo de um número depois de escolherem, e **Pode ter no máximo** limita quantos cargos do menu podem ter (sem limite por padrão).
- **Escolher um** troca cargos: ao escolher uma nova opção, o cargo anterior é removido. Ative **Manter um depois de escolhido** para que os membros possam trocar, mas não possam limpar a escolha.

## Limites

| Limite | Valor |
| --- | --- |
| Menus por servidor | 50 |
| Opções por menu | 25 |
| Botões por linha | 5 |
| Nome do menu | 100 caracteres |
| Nome no menu | 80 caracteres |
| Descrição | 100 caracteres |
| Texto de dica do menu suspenso | 150 caracteres |
| Mensagem de texto simples | 2000 caracteres |

Cada cargo só pode estar em um menu uma vez. O bot só consegue conceder cargos abaixo do seu cargo mais alto que não sejam gerenciados por nenhuma integração, e a equipe só pode oferecer cargos abaixo do seu próprio cargo mais alto.

## Cargo necessário

Um menu pode exigir um cargo. Membros sem ele recebem uma nota privada informando que precisam desse cargo, e nada muda.

## Confirmação

Com **Informar aos membros o que mudou** ativado, os membros recebem uma nota privada que só eles podem ver, listando os cargos adicionados e removidos. Com essa opção desativada, o menu funciona silenciosamente, mas os membros ainda recebem uma nota privada se algo der errado, como atingir um limite ou um cargo que o bot não pode conceder.

## Editando, pausando e publicando novamente

Salvar uma edição reconstrói a mesma mensagem no lugar. Uma nova mensagem só é publicada quando o canal muda ou quando a mensagem antiga não existe mais.

**Pausar** deixa o menu suspenso ou os botões acinzentados no Discord até que o menu seja retomado. **Publicar novamente** publica uma cópia nova e apaga a mensagem antiga, o que ajuda quando o menu saiu da tela ou foi apagado manualmente. Se o canal de um menu for excluído, edite-o, escolha um novo canal e salve para publicá-lo novamente.

Excluir um menu também exclui sua mensagem. Os membros mantêm os cargos que já escolheram.

## Movendo configurações antigas

As configurações antigas de cargos por emoji faziam os membros adicionarem um emoji abaixo de uma mensagem para receber um cargo. A aba **Mover configurações antigas** lista essas configurações. Mover uma delas cria um menu de cargos com os mesmos cargos e emojis, como menu suspenso ou botões, no mesmo canal ou em outro. Ela pode copiar o texto e os embeds da mensagem antiga, e pode aposentar a configuração antiga, o que a interrompe e limpa seus emojis. Se o bot tiver publicado a mensagem original, aposentar a configuração a exclui. Uma configuração em que os membros só podiam ter um cargo se torna um menu de escolher um.

## Comandos

| Comando | O que faz |
| --- | --- |
| `rolemenus` | Lista todos os menus com canal, tipo, quantidade de opções e status. |
| `rolemenuinfo 3` | Mostra tudo sobre um menu. |
| `rolemenucreate #roles dropdown @Role @Role` | Publica um novo menu com uma opção por cargo. |
| `rolemenuadd 3 @Role [emoji] [name]` | Adiciona um cargo a um menu. |
| `rolemenuremove 3 @Role` | Remove um cargo de um menu. |
| `rolemenuname 3 Pronouns` | Renomeia um menu. |
| `rolemenumessage 3 [message\|clear]` | Mostra, define ou limpa a mensagem acima de um menu. |
| `rolemenustyle 3 dropdown\|buttons` | Alterna entre menu suspenso e botões. |
| `rolemenumode 3 multi\|exclusive` | Alterna entre escolher vários e escolher um. |
| `rolemenulimits 3 0 2` | Define quantos cargos os membros devem manter e podem ter. |
| `rolemenurequire 3 [@Role]` | Define ou limpa o cargo necessário. |
| `rolemenureply 3 private\|silent` | Ativa ou desativa a nota privada. |
| `rolemenupause 3` | Pausa um menu, ou o retoma se já estiver pausado. |
| `rolemenurepost 3 [#channel]` | Publica uma cópia nova e apaga a mensagem antiga. |
| `rolemenudelete 3` | Exclui um menu e sua mensagem. |
| `rolemenuimport messageId [dropdown\|buttons]` | Move uma configuração antiga de cargos por emoji para um novo menu. |

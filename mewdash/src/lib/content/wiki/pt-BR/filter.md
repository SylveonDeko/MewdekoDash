---
title: Filtros de Mensagem
slug: filter
summary: Exclua mensagens que contenham palavras bloqueadas, convites ou links do Discord, opcionalmente advirta quem enviou, e bana ao primeiro sinal para uma lista separada de palavras de banimento automático.
icon: fa-filter
category: Security
dashboard: /dashboard/filter
module: Permissions
tags: [filter, word filter, invite filter, link filter, automod, auto ban, blacklist, banned words, regex, filtro, filtro de palavras, filtro de convites, filtro de links, banimento automático, lista negra, palavras banidas, regex]
related: [moderation, logging, administration]
---

## O que ele faz

O filtro verifica cada mensagem que um membro envia ou edita antes que os outros módulos a vejam. Se a mensagem contiver uma palavra filtrada, um convite do Discord ou um link em um lugar onde aquele filtro está ativo, o bot a exclui. Você também pode fazer o bot emitir uma advertência pelo sistema de moderação e enviar ao membro uma DM explicando o que foi removido.

Uma segunda lista, as palavras de banimento automático, é mais rígida. Uma mensagem que corresponda a uma palavra de banimento automático é excluída, e o autor é banido imediatamente, com uma DM contendo o motivo quando o bot consegue enviá-la.

Administradores e quem tiver o cargo de equipe do servidor (definido com `staffrole`) nunca são filtrados. Mensagens de bots também não são verificadas.

## Por que você usaria

- Mantenha insultos e outros termos proibidos fora do chat, sem precisar de um moderador online.
- Impeça membros de divulgar outros servidores ao soltar links de convite.
- Deixe um canal somente com texto, removendo qualquer mensagem com uma URL, por exemplo, um chat de anúncios sem mídia.
- Bana instantaneamente contas que publicam frases conhecidas de golpe ou assinaturas de raid.

## Tipos de filtro

| Filtro | Onde se aplica | O que acontece |
| --- | --- | --- |
| Filtro de palavras | Somente nos canais da lista de canais do filtro de palavras | Mensagem excluída; advertência e DM se **Advertir por palavra filtrada** estiver ativado |
| Filtro de convites | Em todo lugar, quando a chave do servidor está ativada e a lista de canais está vazia, ou somente nos canais listados quando a lista tem entradas | Mensagem excluída; advertência e DM se **Advertir por link de convite** estiver ativado |
| Filtro de links | Em todo lugar, quando a chave do servidor está ativada, além de qualquer canal da sua lista | Mensagem excluída, sem advertência |
| Palavras de banimento automático | Em todo lugar | Mensagem excluída, autor recebe DM e é banido |

As três listas de canais são as **Exceções por canal** no painel. Observe que o filtro de palavras é controlado inteiramente pela sua lista de canais: um canal precisa estar nela para que as palavras sejam verificadas ali.

## Como as palavras são correspondidas

As palavras filtradas e as palavras de banimento automático são tratadas como expressões regulares e testadas contra o conteúdo da mensagem em minúsculas. Uma palavra simples, como `example`, funciona como correspondência de substring, então `examples` também é pego. Padrões que não compilam são removidos da lista automaticamente. Cada padrão tem um tempo limite de correspondência de 250 milissegundos.

As palavras filtradas são salvas em minúsculas e correspondidas sem diferenciar maiúsculas de minúsculas. Os padrões de banimento automático são salvos exatamente como digitados e comparados com o texto em minúsculas, então escreva-os em minúsculas.

> [!WARNING]
> Os padrões de banimento automático são poderosos. Um padrão curto como `ban` dentro de uma palavra maior vai banir pessoas que digitarem "banana". Teste os padrões como palavras filtradas antes.

## Advertências

Ao ativar **Advertir por palavra filtrada** ou **Advertir por link de convite**, o bot adiciona uma advertência pelo módulo de moderação, com o motivo "Warned for Filtered Word" (ou o motivo de advertência de convite) e depois envia uma DM ao membro. As punições por advertência configuradas na página de Moderação se aplicam normalmente, então três ocorrências do filtro podem escalar para um silenciamento ou expulsão, se as advertências estiverem configuradas assim.

Os banimentos automáticos usam as configurações de limpeza de banimento do módulo de moderação, na ação "Filter", para decidir quantos dias de mensagens apagar.

## Configurações

A página Filtros de Mensagem tem quatro abas: **Filtros**, **Palavras filtradas**, **Palavras de banimento automático** e **Exceções por canal**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Filtro de palavras | Desligado | Chave geral do servidor, exibida na aba Filtros |
| Filtro de convites | Desligado | Exclui links de convite do Discord; necessário para que a lista de canais de convites faça alguma coisa |
| Filtro de links | Desligado | Exclui qualquer mensagem com uma URL em todo o servidor |
| Advertir por palavra filtrada | Desligado | Adiciona uma advertência e envia DM ao membro quando uma palavra filtrada é removida |
| Advertir por link de convite | Desligado | Adiciona uma advertência e envia DM ao membro quando um convite é removido |
| Palavras filtradas | nenhuma | Lista na aba Palavras filtradas, com remoção por palavra, um botão **Limpar tudo** que faz o mesmo que `fwclear`, e uma caixa de busca quando há mais de dez palavras |
| Palavras de banimento automático | nenhuma | Lista na aba Palavras de banimento automático |
| Canais do filtro de palavras | nenhum | Canais onde a lista de palavras é aplicada |
| Canais do filtro de convites | nenhum | Restringe o filtro de convites a esses canais quando não estiver vazio |
| Canais do filtro de links | nenhum | Canais extras onde os links são removidos mesmo com a chave do servidor desativada |

No topo da página, aparecem as contagens de palavras filtradas, de palavras de banimento automático e de exceções por canal.

## Passo a passo da configuração

1. Abra **Filtros de Mensagem** no painel.
2. Na aba **Palavras filtradas**, adicione cada palavra ou frase e pressione adicionar.
3. Em **Exceções por canal**, adicione todos os canais onde a lista de palavras deve valer em **Canais do filtro de palavras**.
4. De volta em **Filtros**, ative o **Filtro de convites** se quiser que convites sejam removidos em todo lugar, e **Advertir por link de convite** se isso deve contar como advertência.
5. Opcionalmente, adicione alguns padrões de alta confiança na aba **Palavras de banimento automático**.
6. Execute `staffrole @Moderators` para que sua equipe fique isenta, depois publique uma palavra filtrada com uma conta normal para confirmar que ela é excluída.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `filterword <word>` | `fw` | Ninguém | Adiciona uma palavra à lista de filtros, ou a remove se já estiver presente |
| `lstfilterwords` | `lfw` | Ninguém | Percorre a lista de palavras filtradas |
| `fwclear` | | Administrador | Remove todas as palavras filtradas, limpa a lista de canais de palavras e desativa a chave do servidor |
| `srvrfilterwords` | `sfw` | Ninguém | Alterna a chave do filtro de palavras em todo o servidor |
| `chnlfilterwords` | `cfw` | Ninguém | Alterna o canal atual na lista de canais do filtro de palavras |
| `srvrfilterinv` | `sfi` | Ninguém | Alterna o filtro de convites em todo o servidor |
| `chnlfilterinv` | `cfi` | Ninguém | Alterna o canal atual na lista de canais do filtro de convites |
| `srvrfilterlin` | `sfl` | Ninguém | Alterna o filtro de links em todo o servidor |
| `chnlfilterlin` | `cfl` | Ninguém | Alterna o canal atual na lista de canais do filtro de links |
| `fwarn <y or n>` | `filteredwarn` | Administrador | Ativa ou desativa advertências por palavras filtradas |
| `invwarn <y or n>` | `invitewarn` | Administrador | Ativa ou desativa advertências por links de convite |
| `autobanword <pattern>` | `autobanw` | Administrador | Adiciona um padrão à lista de banimento automático, ou o remove se já estiver presente |
| `autobanwordlist` | `autobwlist` | Administrador | Percorre a lista de banimento automático |

> [!PERMISSION]
> As alternâncias de filtro e o `filterword` não têm verificação de permissão própria. Use o módulo de Permissões para restringi-los, ou gerencie os filtros pelo painel, onde as regras de acesso ao painel se aplicam.

## Dicas e armadilhas

- O bot precisa de **Gerenciar Mensagens** em todos os canais filtrados e de **Banir Membros** para as palavras de banimento automático.
- Mensagens editadas são verificadas de novo, então editar um link em uma mensagem antiga ainda faz com que ele seja excluído.
- Os filtros não se aplicam a administradores, ao cargo de equipe ou a bots. Não teste com uma conta de administrador.
- `fwclear` faz mais do que esvaziar a lista: ele também remove todas as exceções de canal do filtro de palavras.
- Expressões regulares inválidas são descartadas da lista silenciosamente. Se uma palavra desaparecer, verifique se ela não contém caracteres não escapados, como `(`, `[` ou `*`.
- Registre as exclusões de mensagens com o recurso de Logs se quiser um histórico do que o filtro removeu.

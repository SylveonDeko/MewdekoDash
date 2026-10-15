---
title: Destaques
slug: highlights
summary: Membros escolhem palavras para observar e recebem uma DM com contexto sempre que alguém disser uma delas no servidor.
icon: fa-bolt
category: Community
dashboard: /dashboard/highlights
module: Highlights
tags: [highlights, keywords, watch words, notifications, mentions, dm alerts, ignore channel, ignore user, destaques, palavras-chave, palavras de monitoramento, notificações, menções, alertas por DM, ignorar canal, ignorar usuário]
related: [afk, utility]
---

## O que faz

Um membro adiciona uma palavra ou frase com `highlight add`. A partir daí, sempre que uma mensagem no servidor contiver essa palavra, o bot envia uma DM para ele. A DM informa em qual servidor e canal aconteceu, mostra as cinco mensagens anteriores à correspondente, além da própria mensagem, e tem um botão **Ir para a mensagem**.

Os destaques são pessoais. Cada membro gerencia a própria lista, escolhe quais canais e pessoas ignorar e pode desativar os destaques sem apagá-los. A equipe não pode adicionar destaques para outra pessoa, mas o painel permite ver o que está sendo monitorado e remover entradas.

Os membros só recebem DMs de canais que realmente podem ver. Um membro que está digitando no servidor é considerado presente, então os destaques ficam pausados para ele por dois minutos.

## Por que usar

- Receber um aviso quando seu nome, apelido ou projeto for mencionado sem uma @menção de fato.
- Acompanhar um tema como "giveaway" ou "patch notes" em um servidor grande.
- A equipe pode monitorar palavras como "help" ou "report" sem ler todos os canais.
- Moderadores podem auditar o que os membros estão acompanhando e limpar entradas abusivas ou de spam.

## Como a correspondência funciona

O bot verifica cada mensagem não vazia contra todos os destaques daquele servidor.

- Um destaque corresponde a uma palavra ou frase inteira. `cat` não corresponde a "category", mas corresponde a "the cat sat".
- A correspondência diferencia maiúsculas de minúsculas. Adicione `Cat` e `cat` separadamente se quiser os dois.
- Cada membro recebe no máximo uma DM a cada dois minutos em um servidor, não importa quantas palavras correspondam.
- Digitar em qualquer lugar do servidor inicia essa mesma pausa de dois minutos, para que você não receba DM sobre uma conversa da qual já está participando.
- Mensagens de usuários ignorados e em canais ignorados são desconsideradas para aquele membro.
- A DM não é enviada quando o membro não pode ver o canal ou quando as DMs estão fechadas.
- As mensagens são verificadas por uma fila que processa uma mensagem a cada dois segundos. Em um shard muito movimentado, algumas mensagens podem ser descartadas dessa fila.

`highlight match some text` verifica sua lista contra uma frase de exemplo e informa quais das suas palavras teriam correspondido. Essa verificação ignora maiúsculas e minúsculas, então serve como um guia aproximado, não como uma cópia exata da regra em tempo real.

## Configurações por membro

Cada membro tem uma linha de configurações criada na primeira vez que ele altera algo.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Destaques ativados | ativado | `highlight toggle false` pausa todos os seus destaques neste servidor |
| Canais ignorados | nenhum | Canais onde suas palavras nunca disparam uma DM |
| Usuários ignorados | nenhum | Pessoas cujas mensagens nunca disparam seus destaques |

## Configurações

A página de Destaques no painel é para a equipe. Ela não adiciona destaques; ela mostra e remove.

| Aba | O que mostra |
| --- | --- |
| Todos os destaques | Todos os destaques do servidor agrupados por membro, com um botão de exclusão por palavra e um botão para remover todas as palavras de um membro |
| Buscar | Encontra destaques que contenham uma palavra em todos os membros; a busca ignora maiúsculas e minúsculas |
| Usuários desativados | Membros que desativaram seus destaques, com quantos canais e usuários eles ignoram |
| Estatísticas | Total de destaques, Usuários ativos, Palavra principal, Mais ativo, além de Palavras mais destacadas e Destaques recentes |

## Passo a passo de configuração

Não há nada para ativar. Os destaques funcionam assim que o bot estiver no servidor.

1. Como membro, execute `highlight add yourname` em qualquer canal.
2. Execute `highlight list` para confirmar que foi salvo.
3. Peça para alguém digitar seu nome em outro canal. Espere alguns segundos e verifique suas DMs.
4. Se receber avisos demais, execute `highlight toggleignore #busy-channel` ou `highlight toggleignore @user`.
5. Equipe: abra **Destaques** no painel para revisar a aba **Todos os destaques** e remover o que for indesejado.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a não ser que você tenha alterado). As mesmas ações existem no comando de barra único `/highlights manage`, cuja opção `action` aceita `Add`, `List`, `Delete`, `Match`, `ToggleUser`, `ToggleChannel` ou `ToggleGlobal`, com as opções `words`, `user` e `channel` separadas.

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `highlight add <word>` | `highlights`, `hl` | Ninguém | Monitora uma palavra ou frase |
| `highlight list` | `highlights`, `hl` | Ninguém | Navega pelos seus destaques, dez por página |
| `highlight delete <number or word>` | `highlights`, `hl` | Ninguém | Remove pelo número na lista ou pela palavra exata; `remove` faz o mesmo |
| `highlight match <text>` | `highlights`, `hl` | Ninguém | Mostra quais das suas palavras aparecem no texto |
| `highlight toggleignore <#channel or @user>` | `highlights`, `hl` | Ninguém | Adiciona ou remove um canal ou pessoa da sua lista de ignorados |
| `highlight toggle <true or false>` | `highlights`, `hl` | Ninguém | Ativa ou desativa todos os seus destaques neste servidor |

## Dicas e pegadinhas

- O bot precisa conseguir ler o canal para verificar mensagens nele, e você precisa ter as DMs abertas para receber os avisos dos membros do servidor.
- Adicionar uma palavra que você já tem é recusado. A verificação de duplicatas ignora maiúsculas e minúsculas, mas a correspondência em tempo real não.
- Excluir pelo número usa a posição mostrada em `highlight list`, que muda após cada remoção.
- A lista de destaques e as configurações ficam em cache por trinta minutos em cada servidor. Adicionar ou excluir palavras individuais pelos comandos ou pelo painel atualiza o cache imediatamente; remover todas as palavras de um membro pelo painel pode levar até trinta minutos para parar as DMs.
- Quando o bot sai de um servidor, seus destaques e configurações são limpos na próxima vez que o bot reiniciar.

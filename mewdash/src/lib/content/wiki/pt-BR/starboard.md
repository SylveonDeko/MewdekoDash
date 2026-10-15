---
title: Starboard
slug: starboard
summary: Deixe os membros votarem nas melhores mensagens com uma reação e republique tudo o que atingir o limite em um canal de destaques dedicado.
icon: fa-star
category: Community
dashboard: /dashboard/starboard
module: Starboard
tags: [starboard, stars, highlights, best of, reactions, pins, repost, threshold, estrelas, destaques, melhores, reações, repostagem, limite]
related: [settings, logging]
---

## O que faz

Um starboard é um canal em que o bot republica mensagens que receberam reações suficientes com um emoji escolhido. Os membros reagem a algo engraçado ou útil; quando a contagem de reações atinge o limite, o bot copia a mensagem para o canal do starboard com o nome do autor, o texto, quaisquer imagens ou vídeos, as contagens atuais de reações e um botão **Jump to Message**.

A publicação continua sendo atualizada conforme as reações vão e vêm. Se as reações caírem abaixo do limite, a publicação pode ser removida. Se a mensagem original for excluída ou suas reações forem limpas, a publicação também pode ser removida.

Um servidor pode ter vários starboards ao mesmo tempo, cada um com seu próprio canal, seu próprio emoji ou conjunto de emojis, seu próprio limite e suas próprias regras. Um quadro de "melhores memes" que observa um emoji e um de "respostas úteis" que observa outro podem funcionar lado a lado.

## Por que usar

- Dar à comunidade uma forma de destacar o melhor conteúdo sem que a equipe precise selecionar.
- Manter um canal de destaques duradouro por onde os novos membros possam rolar.
- Ter quadros separados para humor, arte ou respostas úteis, cada um com emojis diferentes.
- Limitar quais canais alimentam o quadro, para que spam de bots e canais fora de assunto fiquem de fora.

## Vários starboards e emojis

Cada starboard é identificado por um ID numérico mostrado por `liststarboards` e na lista do painel. Os comandos recebem esse ID como primeiro argumento.

Um starboard começa com um emoji e pode receber mais. Qualquer um dos seus emojis conta para o mesmo total, e a publicação mostra uma contagem separada por emoji. Um emoji só pode pertencer a um starboard no servidor; tentar reutilizá-lo falha com "emote already in use". Um starboard deve manter pelo menos um emoji, então o último não pode ser removido.

Emojis personalizados funcionam tão bem quanto os Unicode. O bot testa o emoji reagindo à mensagem do seu comando, então ele precisa ser um que o bot possa usar.

## Limites e contagem

O **limite de estrelas** é quantas reações uma mensagem precisa antes de ser publicada. O padrão do comando é 1; o painel exige pelo menos 1.

Ao contar, o bot:

- Ignora reações de contas de bots.
- Soma as reações de todos os emojis que pertencem àquele starboard.
- Conta a reação do próprio autor. Não há exclusão de autoestrela.
- Só reage a mensagens que tenham texto ou um anexo. Uma mensagem sem nenhum dos dois é ignorada.

Se o total estiver abaixo do limite e já existir uma publicação, a publicação é excluída quando **Remover abaixo do limite** está ativado. Caso contrário, a publicação é deixada como estava.

## Mensagens de bots

Por padrão, as mensagens escritas por bots nunca são publicadas. Ative **Permitir mensagens de bots** para incluí-las. Para uma mensagem de bot, o texto é tirado da descrição do primeiro embed, se houver embeds, ou do conteúdo simples, e a imagem vem do primeiro anexo ou da primeira imagem de embed. Quando as mensagens de bots são permitidas, as reações de bots também são contadas nos números por emoji exibidos na publicação.

## Limite de repostagem

Normalmente, o bot edita a publicação existente do starboard no lugar sempre que a contagem muda. Quando um quadro fica movimentado, essa publicação pode estar lá no alto do canal, onde ninguém vê a contagem atualizada.

O **limite de repostagem** resolve isso. Defina-o como um número N e, a cada atualização, o bot olha as últimas N mensagens do canal do starboard. Se a publicação existente estiver entre elas, ela é editada. Se tiver rolado para mais longe que isso, a publicação antiga é excluída e uma nova é enviada no final. Defina como 0 para desativar a repostagem e sempre editar no lugar.

## Filtragem de canais

Cada starboard tem uma lista de canais e um modo:

| Modo | Efeito |
| --- | --- |
| Lista branca (padrão) | Somente as mensagens dos canais listados são consideradas. Uma lista vazia significa todos os canais. |
| Lista negra | As mensagens dos canais listados são ignoradas. Todo o resto é considerado. |

`starboardchtoggle <id> #channel` adiciona ou remove um canal da lista. A ação **Gerenciar canais** do painel faz o mesmo.

## A publicação do starboard

A publicação é montada com componentes, e não com um embed clássico:

- Uma linha acima do contêiner com cada emoji e sua contagem.
- O nome do autor, com link para o perfil dele.
- O texto da mensagem.
- Uma galeria de mídia com os anexos de imagem e vídeo.
- Até três outros anexos, reenviados para o canal do starboard. Se um download falhar, o nome e o tamanho do arquivo são mostrados no lugar.
- Um botão de link **Jump to Message**.

As menções no texto republicado são suprimidas, então uma mensagem destacada não pode marcar ninguém uma segunda vez.

## Regras de remoção

| Regra | Padrão | Quando dispara |
| --- | --- | --- |
| Remover ao excluir | Ativado | A mensagem original é excluída. Exige que o bot tenha Gerenciar mensagens no canal de origem. |
| Remover ao limpar reações | Ativado | Um moderador limpa todas as reações da original. |
| Remover abaixo do limite | Ativado | O total cai abaixo do limite depois que uma reação é removida. |

## Estatísticas

`starboardstats` mostra os totais do servidor: número de mensagens destacadas, total de estrelas, o membro com mais estrelas, o canal mais ativo e quem mais dá estrelas. `starboarduserstats [@user]` mostra o número de mensagens destacadas de um membro, estrelas recebidas, estrelas dadas, suas melhores publicações, quem mais dá estrelas a ele e a quem ele mais dá estrelas. Ambos estão abertos a todos.

## Configurações

A página do Starboard tem duas seções: **Criar novo starboard** e **Gerenciar starboards**. Cada entrada da lista mostra seu canal, emoji, limite e limite de repostagem, com botões de **Configurações do starboard**, **Gerenciar canais** e **Excluir**.

Dentro de **Configurações do starboard**:

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Limite de estrelas | definido na criação | Reações necessárias antes de uma mensagem ser publicada |
| Limite de repostagem | 0 (desativado) | Quantas mensagens recentes pesquisar antes de republicar no final |
| Emojis de estrela | o emoji da criação | Adicionar ou remover emojis que contam para este quadro |
| Permitir mensagens de bots | Desativado | Incluir mensagens escritas por bots |
| Remover ao excluir | Ativado | Remover a publicação quando a original for excluída |
| Remover ao limpar reações | Ativado | Remover a publicação quando as reações forem limpas |
| Remover abaixo do limite | Ativado | Remover a publicação quando a contagem cair abaixo do limite |
| Modo de canais | Lista branca | Se a lista de canais é uma lista branca ou uma lista negra |

> [!TIP]
> Comece com um limite de 3 a 5 em um servidor ativo. Um limite de 1 transforma toda reação solta em uma publicação.

## Passo a passo de configuração

1. Crie um canal para os destaques e verifique se o bot pode enviar mensagens, inserir links e anexar arquivos nele.
2. Abra **Starboard** no painel.
3. Em **Criar novo starboard**, escolha o canal, escolha um emoji nas sugestões rápidas ou digite um personalizado, defina o **Limite (reações necessárias)** e pressione **Criar starboard**.
4. Abra **Configurações do starboard** na nova entrada. Adicione quaisquer emojis extras em **Emojis de estrela** e defina um **Limite de repostagem** como 20 se o quadro for ficar movimentado.
5. Use **Gerenciar canais** para colocar na lista branca os canais que devem alimentar o quadro, ou mude o **Modo de canais** para lista negra e liste os que devem ser excluídos.
6. Reaja a uma mensagem de teste com o emoji vezes suficientes para atingir o limite e confira se a publicação aparece.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado). `<id>` é o ID do starboard de `liststarboards`.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `createstarboard #channel <emote> [threshold]` | `addstarboard`, `newstarboard` | Gerenciar canais | Criar um starboard, o limite padrão é 1 |
| `deletestarboard <id>` | `removestarboard`, `delstarboard` | Gerenciar canais | Remover a configuração de um starboard |
| `liststarboards` | `starboardlist`, `starboards` | Ninguém | Percorrer todos os starboards e suas configurações |
| `setstarthreshold <id> <number>` | `starthreshold` | Gerenciar canais | Definir as reações necessárias |
| `setrepostthreshold <id> <number>` | `starboardrepost`, `repostthreshold` | Gerenciar canais | Definir a janela de repostagem, 0 desativa |
| `addstarboardemote <id> <emote>` | `addstaremote`, `starboardaddemote`, `asbe` | Gerenciar canais | Adicionar um emoji a um starboard |
| `removestarboardemote <id> <emote>` | `removestaremote`, `starboardremoveemote`, `rsbe` | Gerenciar canais | Remover um emoji, não é possível remover o último |
| `starboardallowbots <id> <true or false>` | `starbots`, `starbotsallow`, `starbab` | Gerenciar canais | Permitir mensagens escritas por bots |
| `starboardremoveondelete <id> <true or false>` | `starboarddelete`, `stardelete`, `srod` | Gerenciar canais | Remover a publicação quando a original for excluída |
| `starboardremoveonreactionsclear <id> <true or false>` | `starboardreactionclear`, `starclear` | Gerenciar canais | Remover a publicação quando as reações forem limpas |
| `starboardremoveonbelowthreshold <id> <true or false>` | `starboardbelowthreshold`, `starbelow`, `srobt` | Gerenciar canais | Remover a publicação quando cair abaixo do limite |
| `starboardwlmode <id> <whitelist or blacklist>` | `starboardmode`, `starboardwhitelist`, `swm` | Gerenciar canais | Definir como a lista de canais é tratada |
| `starboardchtoggle <id> #channel` | `starboardchannel`, `togglestarboardchannel`, `scht` | Gerenciar canais | Adicionar ou remover um canal da lista |
| `starboardstats` | `starstats`, `starboardstatistics`, `sbstats` | Ninguém | Estatísticas do starboard em todo o servidor |
| `starboarduserstats [@user]` | `staruserstats`, `userstarstats`, `sbuserstats` | Ninguém | Estatísticas de um membro |

Os equivalentes de barra ficam em `/starboard`.

## Dicas e armadilhas

- O bot não faz nada, em silêncio, se não puder enviar mensagens no canal do starboard. Verifique primeiro as permissões do canal.
- Remover ao excluir só funciona quando o bot tem Gerenciar mensagens no canal em que a mensagem original estava.
- As reações de bots nunca contam para o limite, então outro bot que reaja automaticamente não consegue colocar mensagens no quadro.
- Excluir um starboard remove apenas a configuração dele. As publicações existentes no canal permanecem.
- O mesmo emoji não pode ser compartilhado entre dois quadros. Escolha emojis distintos para cada um.
- Anexos muito grandes podem falhar ao ser reenviados; a publicação então lista o nome do arquivo.

---
title: Sugestões
slug: suggestions
summary: Dê aos membros um canal ou botão para enviar ideias, deixe o servidor votar nelas e faça a equipe aceitar, negar, considerar ou implementar cada uma com um motivo.
icon: fa-lightbulb
category: Community
dashboard: /dashboard/suggestions
module: Suggestions
tags: [suggestions, ideas, feedback, voting, accept, deny, consider, implement, threads, suggest button, placeholders, sugestões, ideias, votação, aceitar, negar, considerar, implementar, tópicos, botão de sugerir]
related: [administration, afk]
---

## O que faz

Um membro executa `suggest` com sua ideia, digita direto no canal de sugestões ou pressiona um botão **Suggest Here!** e preenche um formulário. O bot exclui a mensagem original, publica um embed de sugestão numerado no canal de sugestões e anexa emojis de voto como reações ou botões. Cada sugestão recebe um número que a equipe usa para se referir a ela depois.

A equipe então move a sugestão por quatro estados: aceitar, negar, considerar ou implementar, cada um com um motivo opcional. O bot edita a mensagem original da sugestão para um embed de status colorido, envia uma DM ao membro que a sugeriu com o resultado e pode republicar o embed de status em um canal separado para cada estado, de modo que as ideias aceitas fiquem em um lugar e as negadas em outro.

Opcionalmente, cada sugestão traz um botão **Join/Create Discussion** que abre um tópico público ou privado abaixo dela. Quando a equipe muda o estado, o tópico pode ser arquivado automaticamente.

## Por que usar

- Canais de feedback em que as ideias se perdem entre as respostas; cada sugestão se torna sua própria mensagem com uma contagem de votos.
- Comunidades que querem que os membros vejam o que foi aceito e o que foi rejeitado, e por quê, sem que a equipe escreva anúncios.
- Servidores que querem uma discussão por ideia em vez de brigas no canal principal, usando tópicos.
- Equipes que querem fazer a triagem pelo painel com uma caixa de motivo em vez de lembrar números de sugestões.

## Como uma sugestão é enviada

Há três formas de entrar, e todas passam pelas mesmas verificações de tamanho e acabam no canal de sugestões.

| Método | O que acontece |
| --- | --- |
| `suggest <text>` | A mensagem do comando é excluída e a sugestão é publicada. Funciona em qualquer canal. |
| Digitar no canal de sugestões | Qualquer mensagem que não seja de um bot e não comece com o prefixo é transformada em sugestão e a original é excluída. Membros com o cargo da equipe do servidor são ignorados, para que a equipe possa conversar normalmente no canal. |
| O botão de sugerir | Uma mensagem com um botão no **Canal do botão de sugerir**. Pressioná-lo abre um formulário cujos limites de tamanho correspondem às suas configurações. |

Se o texto for maior que o **Tamanho máximo** ou menor que o **Tamanho mínimo**, ele é rejeitado. Com o comando, o erro aparece no canal e é excluído após cinco segundos; no canal de sugestões, a mensagem é excluída e o membro recebe uma DM. As menções dentro da sugestão são neutralizadas no embed publicado, e o membro é informado de que a sugestão foi enviada.

O embed de sugestão padrão usa o membro como autor, o título "Suggestion #N" e o texto como descrição. Você pode substituí-lo pelo seu próprio embed (veja os placeholders abaixo).

### O botão de sugerir

A mensagem do botão é publicada no **Canal do botão de sugerir** e o bot a mantém no final: quando outras mensagens a empurram para cima, o bot a exclui e a publica novamente. O rótulo padrão é **Suggest Here!**, sem emoji e na cor blurple. A mensagem acima do botão pode ser texto simples ou código de embed, e por padrão é um breve convite para "fazer uma sugestão".

## Votação

Por padrão, cada sugestão recebe um polegar para cima e um polegar para baixo. Você pode definir até cinco emojis personalizados com `suggestmotes` ou com o seletor de **Emojis personalizados**; o bot precisa poder usá-los.

O **Modo de exibição de emojis** decide como os votos são dados.

| Modo | Comportamento |
| --- | --- |
| Reações (padrão) | O bot adiciona os emojis como reações. As contagens são acompanhadas pelas adições e remoções de reações. |
| Botões | Os emojis viram botões que mostram uma contagem em tempo real. Um membro pode ter um voto por sugestão: pressionar o mesmo botão de novo pede para removê-lo, pressionar um diferente pede para trocar. |

No modo de botões, cada um dos cinco botões de emoji tem sua própria cor (**Botão do emoji 1** a **Botão do emoji 5**). As cores são Azul, Cinza, Verde e Vermelho. Mudar uma cor também atualiza a mensagem do botão de sugerir.

`suggestinfo <number>` mostra o texto, quem sugeriu, o estado atual, quem o alterou por último, quantas vezes o estado mudou e a contagem por emoji, com botões Aceitar, Negar, Considerar e Implementar abaixo.

## Estados

Toda sugestão começa como Suggested (exibida como Pendente no painel). A equipe com Gerenciar mensagens pode movê-la para um dos quatro estados com `accept`, `deny`, `consider` ou `implemented`, pelos botões de `suggestinfo` ou pelo painel. Cada mudança de estado com um motivo exibe o motivo; sem um, o campo mostra "none".

| Estado | Cor do embed | Opções extras |
| --- | --- | --- |
| Aceita | Azul | Canal de aceitas, mensagem de aceitação, arquivar ao aceitar |
| Negada | Vermelho | Canal de negadas, mensagem de negação, arquivar ao negar |
| Considerada | Dourado | Canal de consideradas, mensagem de consideração, arquivar ao considerar |
| Implementada | Verde | Canal de implementadas, mensagem de implementação, arquivar ao implementar |

Quando um estado muda, o bot faz o seguinte, nesta ordem:

1. Arquiva o tópico de discussão se a opção de arquivar daquele estado estiver ativada.
2. Edita a mensagem original no canal de sugestões para o embed de status e remove todas as reações. Se a mensagem original não existir mais, uma nova é publicada.
3. Envia por DM ao autor da sugestão um embed com a sugestão, o motivo e quem a alterou. A confirmação para a equipe diz se a DM foi entregue ou se o membro estava com as DMs desativadas.
4. Registra o novo estado e quem o alterou.
5. Se um canal estiver definido para esse estado, publica o embed de status lá e exclui a mensagem de status anterior dessa sugestão, para que uma sugestão que passa de Considerada para Aceita não deixe uma cópia obsoleta para trás.

Uma sugestão pode mudar de estado quantas vezes você quiser. Não há comando para voltá-la a Pendente.

### A mensagem de status

O embed de status padrão tem o autor da sugestão como autor, um título como "Suggestion #12 Accepted", o texto da sugestão como descrição e um campo **Motivo**. Defina o seu com `acceptmessage`, `denymessage`, `considermessage` ou `implementmessage`, ou com os quatro editores na aba **Mensagens** do painel. Use `-` para voltar ao padrão. O texto personalizado passa pelo analisador de embeds; se não for um código de embed válido, é usado como descrição do embed.

## Placeholders

A mensagem de sugestão (publicada ao enviar) aceita estes, além dos placeholders gerais de servidor da página de placeholders.

| Placeholder | Valor |
| --- | --- |
| `%suggest.user%` | Nome de usuário completo de quem sugeriu |
| `%suggest.user.name%` | O nome de usuário de quem sugeriu |
| `%suggest.user.avatar%` | A URL do avatar de quem sugeriu |
| `%suggest.message%` | O texto da sugestão, com as menções neutralizadas |
| `%suggest.number%` | O número da sugestão |

As mensagens de aceitação, negação, consideração e implementação aceitam todos os acima, os placeholders gerais de servidor e estes extras.

| Placeholder | Valor |
| --- | --- |
| `%suggest.user.id%` | O ID de usuário de quem sugeriu |
| `%suggest.mod.user%` | Nome de usuário completo do membro da equipe que alterou o estado |
| `%suggest.mod.name%` | Nome de usuário desse membro da equipe |
| `%suggest.mod.avatar%` | A URL do avatar dele |
| `%suggest.mod.Id%` | O ID de usuário dele (note o I maiúsculo) |
| `%suggest.mod.message%` | O motivo informado, ou "none" |
| `%suggest.emote1count%` a `%suggest.emote5count%` | Contagem de votos de cada emoji no momento da alteração |

> [!EXAMPLE]
> Uma mensagem de negação simples: `Suggestion #%suggest.number% by %suggest.user% was denied by %suggest.mod.name%: %suggest.mod.message%`

## Tópicos

O **Tipo de tópico** adiciona uma segunda linha de botões a cada nova sugestão.

| Tipo | Botão | Resultado |
| --- | --- | --- |
| Sem tópicos (padrão) | nenhum | Sem botão de discussão |
| Tópicos comuns | Join/Create Public Discussion | Cria um tópico público chamado "Suggestion #N Discussion" na mensagem da sugestão |
| Tópicos privados | Join/Create Private Discussion | O mesmo, como um tópico privado |

O primeiro clique cria o tópico e adiciona tanto quem sugeriu quanto quem clicou. Os cliques seguintes respondem que já existe um tópico e enviam o link. Um tópico por sugestão é acompanhado, e as quatro opções **Arquivar ao** o arquivam quando o estado correspondente é definido. Alterar o tipo de tópico afeta apenas as sugestões publicadas depois.

## Configurações

A página do painel tem duas abas, **Sugestões** e **Configurações**. A aba Configurações é dividida em **Geral**, **Mensagens**, **Canais**, **Arquivar** e **Emojis**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Tamanho mínimo | não definido | Menor sugestão aceita, em caracteres (não pode ser 2048 ou mais; o campo do painel para em 2000) |
| Tamanho máximo | não definido | Maior sugestão aceita (deve ser maior que 0; o campo do painel para em 2000) |
| Tipo de tópico | Sem tópicos | Se as sugestões recebem um botão de discussão público ou privado |
| Mensagem de sugestão | embed padrão | O embed publicado quando uma sugestão é enviada |
| Mensagem de aceitação / negação / consideração / implementação | embed padrão | O embed de status de cada estado |
| Canal de sugestões | nenhum (recurso desativado) | Onde as sugestões são publicadas e onde as mensagens digitadas viram sugestões |
| Canal de aceitas / negadas / consideradas / implementadas | nenhum | Canal extra para o qual cada embed de status é copiado |
| Arquivar ao aceitar / negar / considerar / implementar | desativado | Arquiva o tópico de discussão nesse estado |
| Modo de exibição de emojis | Reações | Reações ou botões para votar |
| Emojis personalizados | polegar para cima e para baixo | Até cinco emojis usados na votação |
| Rótulo do botão | Suggest Here! | Texto do botão de sugerir |
| Emoji do botão | nenhum | Emoji do botão de sugerir |
| Mensagem do botão | convite padrão | Texto ou embed publicado acima do botão de sugerir |
| Cor do botão de sugerir | Blurple | Cor do botão de sugerir |
| Botão do emoji 1 a 5 | Blurple | Cor de cada botão de voto no modo de botões |

> [!WARNING]
> Nada funciona até que o **Canal de sugestões** seja definido. Até lá, `suggest` responde que nenhum canal foi definido e exclui o erro após três segundos.

A aba **Sugestões** lista todas as sugestões com status, contagem de votos e data, ordenáveis por data ou status. Cada cartão tem os botões **Aceitar**, **Negar**, **Considerar** e **Implementar** com uma caixa de motivo opcional, e um botão **Excluir** que remove o registro do banco de dados sem mexer na mensagem do Discord.

## Passo a passo de configuração

1. Abra **Sugestões** no painel e mude para a aba **Configurações**.
2. Em **Canais**, escolha um **Canal de sugestões**. Opcionalmente, escolha canais separados para sugestões aceitas, negadas, consideradas e implementadas.
3. Em **Geral**, defina o **Tamanho mínimo** e o **Tamanho máximo**, por exemplo 10 e 1000, e escolha um **Tipo de tópico** se quiser uma discussão por ideia.
4. Em **Emojis**, escolha **Reações** ou **Botões** e, opcionalmente, escolha até cinco **Emojis personalizados**. Se quiser um botão de sugerir, defina aqui seu rótulo, emoji e mensagem e execute `suggestbuttonchannel #channel` no Discord para publicá-lo.
5. Em **Arquivar**, ative as opções de arquivar para os estados que devem encerrar a discussão.
6. Em **Mensagens**, personalize os embeds de status se quiser, usando os placeholders acima.
7. Salve e teste: execute `suggest test idea`, vote nela e execute `accept 1 looks good` para ver o embed de status e a DM.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `suggest <text>` | `suggestion` | Ninguém | Enviar uma sugestão |
| `suggestinfo <number>` | `suginfo` | Gerenciar mensagens | Mostrar detalhes, contagem de votos e botões de estado de uma sugestão |
| `accept <number> [reason]` | `suggestaccept`, `acceptsuggest` | Gerenciar mensagens | Marcar uma sugestão como aceita |
| `deny <number> [reason]` | `suggestdeny`, `denysuggest` | Gerenciar mensagens | Marcar uma sugestão como negada |
| `consider <number> [reason]` | `suggestconsider`, `considersuggest` | Gerenciar mensagens | Marcar uma sugestão como em consideração |
| `implemented <number> [reason]` | `suggestimplement`, `implementsuggest` | Gerenciar mensagens | Marcar uma sugestão como implementada |
| `setsuggestchannel [#channel]` | `suggestchannel`, `suggestchan` | Gerenciar canais | Definir o canal de sugestões, ou desativar as sugestões sem canal |
| `suggestclear` | `suggestreset`, `resetsuggestions`, `clearsuggestions` | Administrador | Excluir todas as sugestões e redefinir o contador, após confirmação |
| `suggestmessage <text>` | `suggestmsg` | Administrador | Embed de sugestão personalizado, `-` para redefinir |
| `acceptmessage <text>` | `acceptmsg` | Administrador | Embed de aceitação personalizado, `-` para redefinir |
| `denymessage <text>` | `denymsg` | Administrador | Embed de negação personalizado, `-` para redefinir |
| `considermessage <text>` | `considermsg` | Administrador | Embed de consideração personalizado, `-` para redefinir |
| `implementmessage <text>` | `implementmsg` | Administrador | Embed de implementação personalizado, `-` para redefinir |
| `acceptchannel [#channel]` | | Administrador | Canal das sugestões aceitas, nenhum para desativar |
| `denychannel [#channel]` | | Administrador | Canal das sugestões negadas, nenhum para desativar |
| `considerchannel [#channel]` | | Administrador | Canal das sugestões consideradas, nenhum para desativar |
| `implementchannel [#channel]` | | Administrador | Canal das sugestões implementadas, nenhum para desativar |
| `minsuggestionlength <number>` | `minsuggestlength` | Administrador | Mínimo de caracteres, deve ser menor que 2048 |
| `maxsuggestionlength <number>` | `maxsuggestlength` | Administrador | Máximo de caracteres, deve ser maior que 0 |
| `suggestmotes <emotes>` | `smotes`, `suggestemotes` | Administrador | Até cinco emojis de voto, ou `disable` para polegar para cima e para baixo |
| `suggestmotesmode <reactions/buttons>` | | Administrador | Reações ou botões para votar |
| `suggestmotecolor <number> <colour>` | | Administrador | Cor do botão de voto 1 a 5: `blurple`, `grey`, `green` ou `red` |
| `suggestthreadstype <none/public/private>` | `suggestthreads` | Administrador | Tipo de tópico de discussão para novas sugestões |
| `archiveonaccept` | | Administrador | Alternar o arquivamento do tópico ao aceitar |
| `archiveondeny` | | Administrador | Alternar o arquivamento do tópico ao negar |
| `archiveonconsider` | | Administrador | Alternar o arquivamento do tópico ao considerar |
| `archiveonimplement` | | Administrador | Alternar o arquivamento do tópico ao implementar |
| `suggestbuttonchannel <#channel>` | | Administrador | Publicar o botão de sugerir em um canal |
| `suggestbuttonmessage <text>` | | Administrador | Texto ou embed acima do botão de sugerir, `-` para redefinir |
| `suggestbuttonlabel <text>` | | Administrador | Rótulo do botão com até 80 caracteres, `-` para redefinir |
| `suggestbuttonemote [emote]` | | Administrador | Emoji do botão, nenhum para redefinir |
| `suggestbuttoncolor <colour>` | | Administrador | Cor do botão de sugerir: `blurple`, `grey`, `green` ou `red` |

Os equivalentes de barra ficam em `/suggestions` e `/suggestions customize`.

## Dicas e armadilhas

- O bot precisa de Gerenciar mensagens no canal de sugestões para excluir as originais, Adicionar reações para o modo de reações e Criar tópicos públicos ou privados para as discussões. Os canais de status precisam de Inserir links, ou a cópia é ignorada silenciosamente.
- Defina os dois limites de tamanho antes de abrir o canal. O caminho das mensagens digitadas exclui tudo o que estiver fora dos limites, então um máximo não definido pode engolir todas as mensagens.
- Membros com o cargo da equipe definido em Administração podem conversar no canal de sugestões sem que as mensagens deles virem sugestões. As mensagens de todos os outros são convertidas e excluídas.
- O comando `suggest` respeita o sistema de permissões, então você pode bloqueá-lo em canais ou para cargos com os comandos de permissão habituais, e o caminho das mensagens digitadas respeita a mesma regra.
- Os emojis personalizados precisam ser emojis que o bot possa usar. O comando testa cada emoji reagindo com ele e recusa o conjunto se algum falhar.
- O **Excluir** do painel só remove o registro do banco de dados. A mensagem do Discord e qualquer tópico permanecem onde estão.
- `suggestclear` não pode ser desfeito e redefine a numeração para 1.

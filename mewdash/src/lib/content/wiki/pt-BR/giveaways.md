---
title: Sorteios
slug: giveaways
summary: Faça sorteios cronometrados em que os membros participam por reação, botão ou captcha na web, com requisitos de cargo e de quantidade de mensagens, escolha aleatória de vencedores, novos sorteios e DMs para os vencedores.
icon: fa-gift
category: Entertainment
dashboard: /dashboard/giveaways
module: Giveaways
tags: [giveaway, gstart, prize, raffle, winner, reroll, contest, entry, captcha, sorteio, prêmio, rifa, vencedor, novo sorteio, concurso, participação]
related: [embedbuilder, chat-triggers, xp]
---

## O que ele faz

A equipe inicia um sorteio com um prêmio, um canal, um número de vencedores e uma duração. O bot posta um embed nesse canal mostrando o prêmio, o anfitrião, quando termina e quaisquer requisitos. Os membros participam reagindo com o emote de sorteio do servidor, pressionando um botão **Enter** ou resolvendo um captcha no painel, dependendo de como o sorteio foi iniciado.

Quando o tempo acaba, o bot escolhe os vencedores aleatoriamente entre todos que participaram e ainda atendem aos requisitos. Ele edita a mensagem original para mostrar os vencedores, posta uma mensagem de parabéns no canal e, se ativado, envia uma DM a cada vencedor com um link para o sorteio. A equipe pode encerrar um sorteio mais cedo ou sortear de novo depois que ele terminou.

Os requisitos são verificados no fim, não na participação. Quem reagiu mas depois perdeu um cargo exigido é pulado quando os vencedores são escolhidos.

## Por que usar

- Sorteie chaves de jogos, Nitro ou brindes entre membros ativos sem escolher nomes manualmente.
- Recompense quem realmente tem conversado, exigindo uma quantidade mínima de mensagens.
- Restrinja um prêmio a boosters ou a um cargo de apoiador exigindo esses cargos.
- Impeça que contas alternativas e bots encham as participações usando a participação por captcha.

## Métodos de participação

Cada sorteio usa exatamente um destes. O assistente interativo `gstart` pergunta qual, o comando de barra tem as opções `use_button` e `use_captcha`, e o painel tem uma escolha de **Método de participação**.

| Método | Como os membros participam | Observações |
| --- | --- | --- |
| Reação | Reagir com o emote de sorteio do servidor | O padrão. O bot lê a lista de reações quando o sorteio termina, até 1000 usuários. |
| Botão | Pressionar o botão **Enter** sob o embed | As participações são armazenadas pelo bot. Participar duas vezes, depois que terminou ou sem estar no servidor é recusado. |
| Captcha | Pressionar **Enter (Web Captcha)**, entrar no painel e passar em uma verificação Cloudflare Turnstile | Mesmo armazenamento da participação por botão. A participação é creditada à conta do Discord conectada. |

O emote de sorteio é definido por servidor com `gemote`. O bot o valida reagindo com ele, então um emote personalizado de outro servidor só funciona se o bot também estiver nesse servidor. Os sorteios por reação também precisam das permissões Adicionar Reações e Usar Emojis Externos do bot, e `gstart` se recusa a iniciar sem elas.

## Requisitos

| Requisito | Definido por | Efeito no momento do sorteio |
| --- | --- | --- |
| Cargos necessários | Assistente, `required_roles` no comando de barra, **Cargos necessários** no painel | O membro precisa ter todos os cargos listados |
| Quantidade de mensagens | Assistente, `required_messages` no comando de barra, **Quantidade de mensagens exigida** no painel | As mensagens contadas do membro neste servidor devem ser pelo menos este número. Usa o serviço de contagem de mensagens, então só conhece as mensagens contadas desde que ele foi ativado. |

Bots são sempre excluídos, assim como qualquer pessoa que saiu do servidor. Os requisitos são listados no embed do sorteio como uma linha **Cargos necessários** e uma linha "N Messages Required".

## A mensagem do sorteio

O título do embed é o prêmio. A descrição diz "React with (emote) to enter!", cita o anfitrião e mostra o horário de término como um timestamp do Discord relativo e absoluto. O rodapé mostra o número de vencedores, o nome do servidor e a data de término. O conteúdo da mensagem é a menção ao cargo de ping, se houver um definido.

Configurações de aparência de todo o servidor:

| Configuração | Comando | Efeito |
| --- | --- | --- |
| Cor do embed | `gembedcolor` | Cor do embed do sorteio, como nome de cor ou `#hex` |
| Banner | `gbanner` | Imagem exibida em todo sorteio. O assistente e o comando de barra podem substituí-la por sorteio com uma URL ou um anexo. |
| Cargo de ping | nenhum, apenas substituição pelo assistente | O assistente oferece mencionar um cargo; se um cargo de ping do servidor estiver armazenado, ele pergunta se deseja substituí-lo |
| DM aos vencedores | `gdm` | Se os vencedores recebem uma DM. Ativado por padrão. |

### Quando termina

Se houver participantes elegíveis suficientes, o bot edita o embed para "Winner: @user" com o anfitrião, define o rodapé como "Ended at (time)", muda o conteúdo para "**Giveaway Ended!**" e posta uma mensagem de parabéns separada, com o link do sorteio e o comando de novo sorteio. Se ninguém participou, ou se participaram menos pessoas elegíveis do que o número de vencedores, o embed é substituído por "There were not enough participants!" e o sorteio é marcado como encerrado. Se houve participantes, mas nenhum atendeu aos requisitos, ele informa isso.

Um sorteio de um único vencedor também dispara o evento `GiveawayWon` para os chat triggers, para que um trigger possa reagir a uma vitória.

### DM ao vencedor

Com **DM aos vencedores** ativado, cada vencedor recebe uma DM. O padrão é um embed dizendo que ele ganhou, com um link para a mensagem do sorteio. Se uma mensagem final personalizada estiver armazenada, ela é enviada no lugar e pode usar estes marcadores, além dos marcadores gerais de servidor, usuário e canal.

| Marcador | Valor |
| --- | --- |
| `%messagelink%` | Link para a mensagem do sorteio |
| `%giveawayitem%` | O prêmio |
| `%giveawaywinners%` | O número de vencedores |

`gdmmessage` sem texto oferece pré-visualizar a mensagem armazenada com valores de exemplo, e recusar a pré-visualização a limpa. Executá-lo com texto também limpa a mensagem armazenada em vez de salvá-la.

## Configurações

A página **Sorteios** do painel tem três abas: **Sorteios ativos**, **Criar sorteio** e **Sorteios encerrados**. As configurações de todo o servidor acima (emote, cor, banner, chave de DM) são apenas por comando.

O formulário **Criar sorteio**:

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Item do sorteio | vazio | O prêmio, exibido como título do embed |
| Número de vencedores | 1 | Quantos vencedores sortear; deve ser pelo menos 1 |
| Canal | nenhum | Onde o embed é postado |
| Duração | 24 horas | Quando o sorteio termina |
| Cargos necessários | nenhum | Cargos que um membro precisa ter para ganhar |
| Quantidade de mensagens exigida | 0 | Mínimo de mensagens contadas |
| Emoji de reação | o confete de festa (🎉) | Emote para a participação por reação; um emote personalizado ou um código de emote colado funciona |
| Método de participação | Reação | Reação, Botão ou Captcha |

**Sorteios ativos** lista cada sorteio com o horário de término. Expandir um mostra vencedores, canal, cargos necessários, requisito de mensagens e método de participação, além de um botão **Encerrar sorteio**. Os novos sorteios são apenas por comando.

## Passo a passo de configuração

1. Execute `gemote` com o emote com o qual você quer que os membros reajam, por exemplo `gemote :tada:`.
2. Opcionalmente, defina `gembedcolor` e `gbanner` para que os sorteios combinem com o visual do seu servidor.
3. Abra **Sorteios** no painel e depois **Criar sorteio**.
4. Preencha **Item do sorteio**, **Número de vencedores**, **Canal** e **Duração**.
5. Adicione **Cargos necessários** ou uma **Quantidade de mensagens exigida** se o prêmio deve ir para membros estabelecidos.
6. Escolha um **Método de participação** e pressione **Criar sorteio**.
7. Quando terminar, verifique o canal. Se a pessoa errada ganhou ou ela não responder, execute `greroll <message id>`.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado). Os mesmos comandos existem como comandos de barra em `/giveaways`.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `gstart [#channel <time> <winners> <prize>]` | `giveawaystart` | Gerenciar Mensagens | Inicia um sorteio. Sem argumentos, executa um assistente que também pergunta o anfitrião, o requisito de mensagens, o banner, o cargo de ping, o método de participação e os cargos necessários. O tempo se parece com `2d3h`. |
| `gend <message id>` | `giveawayend` | Gerenciar Mensagens | Encerra um sorteio agora e sorteia os vencedores |
| `greroll <message id>` | `giveawayreroll`, `reroll` | Gerenciar Mensagens | Sorteia de novo entre os participantes de um sorteio encerrado |
| `glist` | `giveaways`, `giveawaylist` | Gerenciar Mensagens | Lista os sorteios ativos com IDs de mensagem, prêmios, números de vencedores e links |
| `gstats` | `giveawaystats` | Qualquer pessoa | Totais de sorteios ativos e encerrados, anfitriões e contagens por canal |
| `gemote <emote>` | `giveawayemote` | Gerenciar Mensagens | Define o emote de participação por reação |
| `gembedcolor <colour>` | `giveawayembedcolor` | Gerenciar Mensagens | Define a cor do embed do sorteio |
| `gwinembedcolor <colour>` | `giveawaywinembedcolor` | Gerenciar Mensagens | Define o mesmo valor de cor que `gembedcolor` |
| `gbanner <url>` | `giveawaybanner` | Gerenciar Mensagens | Define a imagem de banner padrão |
| `gdm` | `giveawaydm` | Gerenciar Mensagens | Alterna as DMs aos vencedores |
| `gdmmessage [text]` | `gdmmsg` | Gerenciar Mensagens | Pré-visualiza ou limpa a DM personalizada ao vencedor |

## Dicas e armadilhas

- O ID da mensagem para `gend` e `greroll` é o ID do embed do sorteio. Copie-o com o Modo Desenvolvedor, ou leia-o em `glist`.
- O novo sorteio escolhe de novo entre os participantes com os mesmos requisitos, então o vencedor anterior pode ganhar outra vez.
- Depois de uma reinicialização, o bot agenda imediatamente os sorteios que terminam nas próximas 24 horas; os que terminam depois são captados por uma verificação a cada hora, então um sorteio de longa duração ainda termina no horário.
- Se o bot não conseguir ler as reações em um sorteio por reação, ele recorre ao emote atual do servidor, mas, se o emote foi alterado para algo com que ninguém reagiu, o sorteio não encontra participantes.
- A lista **Sorteios ativos** do painel também mostra sorteios encerrados, e a aba **Sorteios encerrados** está atualmente vazia. Use o horário de término e a ausência do botão **Encerrar sorteio** para diferenciá-los.
- A participação por captcha exige que o painel esteja acessível e que o membro entre com o Discord; a participação fica vinculada a essa conta, não a algo digitado na página.
- As DMs aos vencedores falham silenciosamente se o vencedor estiver com as DMs fechadas. O anúncio no canal ainda é enviado.

---
title: Sistema de XP
slug: xp
summary: Recompense os membros por conversarem e falarem em voz com níveis, cartões de rank, recompensas de cargo e de moeda e eventos cronometrados.
icon: fa-star
category: Community
dashboard: /dashboard/xp
module: Xp
tags: [xp, experience, levels, level up, rank, rank card, leaderboard, role rewards, voice xp, xp boost, competition, xp curve, experiência, níveis, subir de nível, ranking, cartão de rank, recompensas de cargo, xp de voz, competição, curva de xp]
related: [currency, achievements, administration, utility]
---

## O que ele faz

Os membros ganham XP ao enviar mensagens e ao falar em canais de voz. O XP se acumula em níveis ao longo de uma curva que você escolhe. Qualquer pessoa pode executar `rank` para obter um cartão de rank renderizado com seu nível, barra de progresso, posição no servidor e avatar, ou `leaderboard` para ver quem está à frente.

Quando um membro sobe de nível, o bot pode postar um anúncio no canal, em um canal dedicado a subidas de nível ou por DM. Você pode escrever as suas próprias mensagens de subida de nível com marcadores, ou deixar o embed padrão cuidar disso. Alcançar um nível também pode entregar cargos e moeda do servidor automaticamente.

A equipe controla a velocidade com que o XP chega: XP por mensagem, cooldown, XP de voz por minuto, um multiplicador global e multiplicadores por canal e por cargo. Eventos de boost temporários multiplicam tudo por um tempo, e competições promovem uma corrida cronometrada com recompensas para os primeiros colocados. Usuários, cargos e canais podem ser excluídos para que canais de spam de bots e cargos silenciados não ganhem nada.

## Por que usar

- Dê aos membros ativos um progresso visível e um motivo para continuar conversando.
- Desbloqueie cargos em níveis definidos para que os membros antigos ganhem benefícios sem que a equipe precise fazê-lo manualmente.
- Promova um evento de XP em dobro no fim de semana ou uma corrida de "primeiro a chegar ao nível 20".
- Mantenha o XP justo excluindo canais de comandos, canais AFK e cargos de bots.
- Vincule o XP ao módulo de moeda para que subir de nível também renda pagamentos.

## Como o XP é ganho

### XP de texto

Cada mensagem de um membro que não seja bot concede **XP por mensagem** (padrão 3, limitado a 50) uma vez por janela de cooldown. O **Cooldown de XP por mensagem** tem padrão de 60 segundos; um membro que envia dez mensagens nessa janela recebe XP uma vez. Mensagens em canais excluídos, ou de usuários e cargos excluídos, não rendem nada. Se o servidor inteiro estiver excluído, nada é contado.

O valor é então multiplicado. Todos estes se acumulam:

| Multiplicador | Definido com | Observações |
| --- | --- | --- |
| Multiplicador global | `setxpmultiplier` ou **Multiplicador global de XP** | Aplica-se a todo ganho |
| Multiplicador de canal | `setchannelxp` | Aplica-se aos ganhos nesse canal |
| Multiplicador de cargo | `setrolexp` | Se um membro tiver vários cargos com multiplicadores, apenas o mais alto é usado |
| Eventos de boost | `xpboost` | Todos os eventos ativos são aplicados |

O resultado é arredondado para baixo, para um número inteiro.

O **bônus da primeira mensagem** é uma recompensa única e separada, concedida na primeira mensagem de um membro a cada dia UTC. Ele é armazenado nas configurações de XP, mas não aparece no painel.

### XP de voz

O XP de voz é rastreado por sessão. Um membro só o ganha enquanto está em um canal de voz com pelo menos duas pessoas participando (bots não contam) e não está silenciado nem ensurdecido, por conta própria ou pelo servidor. O tempo passado silenciado, ensurdecido ou sozinho não é contado.

Quando a sessão termina, os minutos elegíveis são multiplicados por **XP de voz por minuto** (padrão 2, limitado a 10). Sessões com menos de 15 segundos não rendem nada. O **Tempo limite de XP de voz** (padrão 60 minutos) é o número máximo de minutos pelos quais uma única sessão pode ser paga. Os multiplicadores só são aplicados ao XP de voz quando o valor base é de pelo menos 5. Definir o XP de voz por minuto ou o tempo limite como 0 desativa o XP de voz.

### Decaimento de XP

O decaimento é opcional e vem desativado por padrão. Quando ativado, a cada doze horas o bot encontra os membros cuja última atividade é mais antiga que **Dias de inatividade antes do decaimento** e remove a **Porcentagem diária de decaimento** do XP total deles. Essas três configurações existem no registro de configurações de XP, mas ainda não têm comando nem controle no painel.

## Níveis e curvas

O nível em que um membro está depende do **Tipo de curva de XP**. Toda curva é construída sobre uma base de 36 XP para o nível um.

| Curva | Nome no comando | Nome no painel | XP necessário para o nível n |
| --- | --- | --- | --- |
| Padrão | `Standard` | Padrão | 36 x n ao quadrado |
| Linear | `Linear` | Linear | 36 x n |
| Acelerada | `Accelerated` | Quadrático | 36 x n elevado a 1,25 |
| Desacelerada | `Decelerated` | Exponencial | 36 x n elevado a 2,5 |
| Personalizada | `Custom` | não oferecida | Igual à Padrão |
| Legado | `Legacy` | Legado | Cada nível custa 36 mais 9 por nível anterior, com os totais acumulados |

A Padrão é a curva predefinida. Alterar a curva com `setxpcurve` recalcula o nível de todos, a menos que você passe `false` como segundo argumento. Alterar a curva não muda o total de XP de ninguém, apenas a qual nível esse total corresponde.

## Notificações de subida de nível

Cada membro escolhe como é avisado sobre as subidas de nível com `levelnotif`: `None`, `Channel` ou `Dm`. Os membros também podem executar `leveluppings false` para impedir que o bot os mencione; o nome deles é exibido como texto simples.

As notificações de canal vão para o **canal de subida de nível**, se houver um definido com `levelupchannel`; caso contrário, vão para o canal onde o XP foi ganho. O bot precisa de Enviar Mensagens ali.

Se o servidor não tiver mensagens personalizadas, o padrão é um embed com título de subida de nível, o avatar do membro como miniatura e campos para XP total, posição no servidor e novo nível. Se você adicionou mensagens personalizadas com `addlevelupmessage`, uma mensagem ativada é escolhida aleatoriamente a cada vez. Uma mensagem personalizada pode ser texto simples ou JSON de embed do construtor de embeds. Teste qualquer modelo com `testlevelupmessage`.

### Marcadores

Eles funcionam dentro das mensagens personalizadas de subida de nível, junto com os marcadores gerais de usuário e servidor da página de marcadores. Como as notificações não acompanham o canal nem a pessoa que as originou, `%xp.channel.*%` resolve para "Unknown Channel", `%xp.triggeruser.*%` para "System" e `%xp.gained%` é sempre 0.

| Marcador | Valor |
| --- | --- |
| `%xp.user%` | Nome de usuário e tag, ou apenas o nome de usuário se as menções estiverem desativadas |
| `%xp.user.mention%` | Menção ao membro, ou apenas o nome de usuário se as menções estiverem desativadas |
| `%xp.user.name%` | Nome de usuário |
| `%xp.user.displayname%` | Nome de exibição |
| `%xp.user.nickname%` | Apelido, com o nome de usuário como alternativa |
| `%xp.user.avatar%` | URL do avatar |
| `%xp.user.id%` | ID do usuário |
| `%xp.user.created%` | Data de criação da conta |
| `%xp.user.joined%` | Data de entrada no servidor |
| `%xp.level.old%` | Nível antes da subida |
| `%xp.level.new%` | Novo nível (`%xp.level.current%` é o mesmo) |
| `%xp.level.next%` | Novo nível mais um |
| `%xp.level.difference%` | Quantos níveis foram ganhos |
| `%xp.total%` | XP total |
| `%xp.current%` | XP ganho dentro do nível atual |
| `%xp.needed%` | XP que o nível atual exige no total |
| `%xp.remaining%` | XP ainda necessário para o próximo nível |
| `%xp.progress%` | Progresso no nível, em porcentagem |
| `%xp.rank%` | Posição no servidor, como número |
| `%xp.rank.ordinal%` | Posição por extenso, como "third" |
| `%xp.rank.suffix%` | Apenas o sufixo: st, nd, rd ou th |
| `%xp.guild%`, `%xp.guild.name%` | Nome do servidor |
| `%xp.guild.id%` | ID do servidor |
| `%xp.guild.membercount%` | Contagem aproximada de membros |
| `%xp.guild.icon%`, `%xp.guild.banner%` | URLs do ícone e do banner do servidor |
| `%xp.time%`, `%xp.time.full%`, `%xp.date%` | Hora UTC atual, hora com data e data |
| `%xp.timestamp%`, `%xp.timestamp.relative%` | Tags de timestamp do Discord para agora |

> [!EXAMPLE]
> `addlevelupmessage %xp.user.mention% just hit level %xp.level.new% and is now %xp.rank.ordinal% on the leaderboard.`

Execute `levelupplaceholders` no Discord para ver a mesma lista.

## Recompensas de cargo

`rolereward <level> <role>` dá um cargo quando um membro alcança esse nível. Com **Recompensas de cargo exclusivas** desativado (o padrão), os membros mantêm todos os cargos de recompensa dos níveis iguais ou inferiores ao seu e perdem os dos níveis acima. Com ele ativado (`setxpexclusive true`), apenas a recompensa do nível mais alto que eles atingem é mantida, e todos os outros cargos de recompensa são removidos.

As recompensas são aplicadas quando um nível muda. Use `syncmyxproles`, `syncuserxproles` ou `syncallxproles` para acertar os cargos depois de adicionar recompensas ou importar XP. A sincronização de todos os usuários pode ser executada uma vez por hora, e o bot precisa de Gerenciar Cargos, com o cargo dele acima de todos os cargos de recompensa.

## Recompensas de moeda

`currencyreward <level> <amount>` paga moeda do servidor, do módulo de moeda, quando um membro alcança esse nível. Passar 0 remove a recompensa. Se o nível de um membro cair, por exemplo após `setxp` ou decaimento, a moeda dos níveis perdidos é recolhida de volta.

## Conquistas

[Conquistas](/wiki/achievements) são um sistema separado, com pontos e ranks próprios, então um rank de conquistas não é um nível de XP. Os dois se encontram em dois pontos: alcançar níveis de XP desbloqueia conquistas da categoria Community, e as conquistas podem devolver XP por meio de uma recompensa de XP por conquista ou de **XP por ponto** na aba Configurações das conquistas. Ambos ficam desativados até que você os defina.

## Eventos de boost

`xpboost <time> <multiplier> <name>` inicia um evento cronometrado, por exemplo `xpboost 2h 2.0 Weekend XP Event`. Cada boost ativo multiplica o XP de mensagens e de voz, além dos outros multiplicadores. `xpboosts` lista o que está em andamento e `cancelboost <id>` interrompe um mais cedo.

## Competições

`xpcompetition <time> <type> [targetLevel] [name]` inicia uma corrida cronometrada. Os membros são inscritos automaticamente na primeira vez que ganham XP enquanto ela está em andamento.

| Tipo | Vencedor |
| --- | --- |
| `MostGained` | Quem ganhou mais XP durante a competição |
| `ReachLevel` | Quem alcançar primeiro o nível-alvo |
| `HighestTotal` | Quem tiver o maior XP total quando ela terminar |

Adicione prêmios com `addcompetitionreward <id> <position> <type> <reward>`, em que o tipo é `Role`, `XP` ou `Currency`. As recompensas de cargo são concedidas, as de XP são adicionadas como XP bônus, e a moeda é paga pelo módulo de moeda. `competitionleaderboard <id>` mostra a classificação, e `endcompetition <id>` encerra mais cedo e distribui as recompensas.

## Exclusões

`xpexclude` e `xpinclude` aceitam um usuário, um cargo ou um canal de texto. Usuários excluídos e qualquer pessoa com um cargo excluído nunca ganham XP; canais excluídos não rendem nada para ninguém. Isso vale também para canais de voz. `xpexcludelist users|roles|channels` mostra as listas. As versões de barra são `/xp admin exclude`, `/xp admin include` (passe uma opção `user`, `role` ou `channel`) e `/xp exclude-list`. A opção **Exclusão de XP do servidor** do painel desativa o ganho de XP em todo o servidor de uma vez.

## Cartões de rank

`rank [@user]` renderiza um cartão PNG. `textrank [@user]` fornece as mesmas informações em texto, para leitores de tela. Bots não têm rank.

O cartão é construído a partir do modelo do servidor: uma imagem de plano de fundo (a sua própria, em **Plano de fundo personalizado do cartão de XP**, ou a integrada) e camadas para o avatar e o nome do usuário, a barra de progresso, o nível no servidor, a posição no servidor, o tempo no nível atual e o XP bônus concedido. Cada camada pode ser exibida ou ocultada, movida, redimensionada e recolorida, e a barra de progresso pode ser arredondada, segmentada ou radial e preencher em qualquer direção.

A aba **Modelo** abre um editor visual. Em telas com menos de 768 pixels de largura, o painel muda para um editor por toque, com as mesmas camadas, um painel inferior para as propriedades e controles simples de posição e tamanho. Em telas mais largas, você tem o editor completo, com lista de camadas, grade, alinhamento, réguas, desfazer e refazer e zoom.

## Ranking

`leaderboard [page]` mostra a classificação do servidor. Se o servidor também usa o módulo de moeda e há moeda em circulação, um `leaderboard` sem argumentos pergunta se você quis dizer XP ou moeda; informar uma página sempre significa XP. A aba **Ranking** do painel mostra a mesma classificação, com uma ação **Ajustar XP** que pode adicionar, definir ou redefinir o XP de um membro, limpando também o XP bônus, se desejado.

## Configurações

O painel tem seis abas: **Configurações**, **Estatísticas**, **Ranking**, **Recompensas**, **Modelo** e **Exclusões**. Estas configurações ficam na aba Configurações.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Exclusão de XP do servidor | desativado | Interrompe todo ganho de XP no servidor |
| XP por mensagem | 3 | XP base por mensagem, no máximo 50 |
| Cooldown de XP por mensagem | 60 segundos | Intervalo mínimo entre as concessões de XP por mensagem de cada membro |
| XP de voz por minuto | 2 | XP base por minuto de voz elegível, no máximo 10; 0 desativa o XP de voz |
| Tempo limite de XP de voz | 60 minutos | Máximo de minutos pelos quais uma sessão de voz pode ser paga |
| Multiplicador global de XP | 1 | Multiplica todo ganho |
| Tipo de curva de XP | Padrão | Qual curva associa o XP aos níveis |
| Plano de fundo personalizado do cartão de XP | nenhum | URL da imagem usada atrás dos cartões de rank |

A aba **Recompensas** gerencia as recompensas de cargo e de moeda, e **Exclusões** gerencia canais e cargos excluídos. **Estatísticas** mostra o total de usuários, o XP total, o nível médio, o nível mais alto e a atividade de XP recente.

Estes campos também existem no registro `GuildXpSetting`, mas são definidos apenas por comando: `FirstMessageBonus`, `ExclusiveRoleRewards` (`setxpexclusive`), `LevelUpChannel` (`levelupchannel`), `LevelUpMessage` e os campos de decaimento `EnableXpDecay`, `InactivityDaysBeforeDecay` e `DailyDecayPercentage`.

## Passo a passo de configuração

1. Abra **Sistema de XP** no painel e verifique se **Exclusão de XP do servidor** está desativada.
2. Em **Configurações**, deixe os valores de mensagem e voz nos padrões para começar, escolha uma curva e clique em **Salvar alterações**.
3. Em **Exclusões**, exclua os canais de comandos de bots e quaisquer cargos silenciados ou de bots.
4. Em **Recompensas**, adicione uma recompensa de cargo para alguns níveis marcantes. Verifique se o cargo do bot fica acima desses cargos.
5. No Discord, execute `levelupchannel #level-ups` e adicione um ou dois modelos com `addlevelupmessage`. Teste com `testlevelupmessage`.
6. Abra **Modelo**, envie um plano de fundo e monte o layout do cartão. Execute `rank` para ver o resultado.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `rank [@user]` | | Qualquer pessoa | Mostra um cartão de rank |
| `textrank [@user]` | | Qualquer pessoa | Informações de rank em texto |
| `leaderboard [page]` | `lb` | Qualquer pessoa | Classificação de XP do servidor |
| `levelnotif <None\|Channel\|Dm>` | `lvlnotif` | Qualquer pessoa | Escolhe como você é avisado sobre subidas de nível |
| `leveluppings <true\|false>` | `lvluppings` | Qualquer pessoa | Se as mensagens de subida de nível podem mencionar você |
| `xpsettings` | `xpconfig` | Gerenciar Servidor | Mostra as configurações de XP atuais |
| `setmessagexp <amount>` | `setmsgxp` | Gerenciar Servidor | XP por mensagem |
| `setxpcooldown <seconds>` | `xpcd` | Gerenciar Servidor | Cooldown de XP por mensagem |
| `setvoicexp <amount>` | | Gerenciar Servidor | XP de voz por minuto |
| `setvoicetimeout <minutes>` | | Gerenciar Servidor | Limite da sessão de voz |
| `setxpmultiplier <number>` | `xpmult` | Gerenciar Servidor | Multiplicador global |
| `setxpcurve <type> [recompute]` | | Gerenciar Servidor | Altera a curva de níveis |
| `setxpexclusive <true\|false>` | `xpexclusive`, `exclusivexp`, `setxpexcl`, `xpexcl` | Gerenciar Servidor | Mantém apenas o cargo de recompensa mais alto |
| `setchannelxp <#channel> <number>` | | Gerenciar Servidor | Multiplicador de canal |
| `setrolexp <role> <number>` | | Gerenciar Servidor | Multiplicador de cargo |
| `addxp <@user> <amount>` | | Gerenciar Servidor | Adiciona XP a um membro |
| `setxp <@user> <amount>` | | Gerenciar Servidor | Define o XP de um membro |
| `resetxp <@user> [resetBonus]` | | Gerenciar Servidor | Zera o XP de um membro |
| `resetxp` | | Administrador | Zera o XP de todo o servidor |
| `xpboost <time> <multiplier> <name>` | | Gerenciar Servidor | Inicia um evento de boost |
| `xpboosts` | | Qualquer pessoa | Lista os boosts ativos |
| `cancelboost <id>` | | Gerenciar Servidor | Encerra um boost mais cedo |
| `xpexclude <@user\|role\|#channel>` | | Gerenciar Servidor | Exclui do XP |
| `xpinclude <@user\|role\|#channel>` | | Gerenciar Servidor | Remove uma exclusão |
| `xpexcludelist [users\|roles\|channels]` | | Qualquer pessoa | Mostra as exclusões |
| `rolereward <level> <role>` | `rr` | Gerenciar Cargos | Adiciona uma recompensa de cargo |
| `removerolereward <level>` | `removerr` | Gerenciar Cargos | Remove uma recompensa de cargo |
| `rolerewards` | | Qualquer pessoa | Lista as recompensas de cargo |
| `currencyreward <level> <amount>` | `cr` | Gerenciar Servidor | Adiciona uma recompensa de moeda |
| `removecurrencyreward <level>` | `removecr` | Gerenciar Servidor | Remove uma recompensa de moeda |
| `currencyrewards` | | Qualquer pessoa | Lista as recompensas de moeda |
| `xpcompetition <time> <type> [targetLevel] [name]` | | Gerenciar Servidor | Inicia uma competição |
| `addcompetitionreward <id> <position> <Role\|XP\|Currency> <reward>` | | Gerenciar Servidor | Adiciona um prêmio por colocação |
| `xpcompetitions` | | Qualquer pessoa | Lista as competições ativas |
| `competitionleaderboard <id>` | `complb` | Qualquer pessoa | Classificação da competição |
| `endcompetition <id>` | | Gerenciar Servidor | Encerra uma competição e paga os prêmios |
| `syncallxproles` | | Administrador | Reaplica os cargos de recompensa a todos (uma vez por hora) |
| `syncmyxproles` | | Qualquer pessoa | Reaplica os seus próprios cargos de recompensa (uma vez a cada cinco minutos) |
| `syncuserxproles <@user>` | | Gerenciar Cargos | Reaplica os cargos de recompensa de um membro |
| `levelupchannel [#channel]` | `lvlupchan` | Gerenciar Servidor | Para onde vão as notificações de canal; sem canal, usa o atual |
| `addlevelupmessage <text or embed JSON>` | `addlvlupmsg` | Gerenciar Servidor | Adiciona uma mensagem personalizada de subida de nível |
| `levelupmessages` | `lvlupmsgs` | Gerenciar Servidor | Lista as mensagens personalizadas com IDs |
| `removelevelupmessage <id>` | `remlvlupmsg` | Gerenciar Servidor | Exclui uma mensagem personalizada |
| `togglelevelupmessage <id> <true\|false>` | `togglelvlupmsg` | Gerenciar Servidor | Ativa ou desativa uma mensagem |
| `testlevelupmessage [template]` | `testlvlupmsg` | Gerenciar Servidor | Pré-visualiza um modelo, ou um salvo aleatório |
| `levelupplaceholders` | `lvlupplaceholders` | Gerenciar Servidor | Lista os marcadores acima |

Os equivalentes de barra ficam em `/xp`, com os comandos da equipe agrupados como `/xp admin` (add, set, reset, exclude, include, sincronização de cargos), `/xp config` (taxas, multiplicadores, curva, exclusivo), `/xp rewards`, `/xp boost`, `/xp competition` e `/xp levelup`. `/xp admin reset` sem usuário zera o XP de todo o servidor; exige Administrador e `confirm: true`.

## Dicas e armadilhas

- As recompensas de cargo e as sincronizações de cargos exigem que o bot tenha Gerenciar Cargos, e o cargo mais alto dele precisa estar acima de todos os cargos de recompensa. `syncallxproles` e `syncuserxproles` se recusam a executar sem isso.
- O XP de voz exige pelo menos dois humanos sem silenciamento e sem ensurdecimento no canal. Um membro sozinho ou silenciado não ganha nada, por mais tempo que fique.
- Os ganhos de XP são agrupados e gravados em segundo plano, então `rank` pode atrasar alguns segundos em relação à última mensagem.
- Reduzir o XP de alguém com `setxp` ou `resetxp` pode fazer o nível dele cair, o que remove cargos de recompensa e recolhe de volta as recompensas de moeda dos níveis perdidos.
- A curva `Custom` se comporta exatamente como a Padrão e não é oferecida no painel. Escolha Legado apenas se estiver migrando de uma configuração mais antiga e quiser que os níveis existentes coincidam.
- As mensagens personalizadas de subida de nível substituem totalmente o embed padrão. Se todas as mensagens personalizadas estiverem desativadas, o embed padrão volta.
- Eventos de boost e competições são gerenciados apenas por comando; o painel não os mostra.

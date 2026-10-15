---
title: Reputação
slug: reputation
summary: Permita que os membros agradeçam uns aos outros com pontos de reputação, com cooldowns e limites antiabuso, recompensas de cargo por limites, concessão por reações e decaimento opcional para membros inativos.
icon: fa-trophy
category: Community
dashboard: /dashboard/reputation
module: Reputation
tags: [reputation, rep, karma, thanks, role rewards, leaderboard, reaction rep, decay, cooldown, reputação, agradecimento, recompensas de cargo, ranking, reputação por reação, decaimento]
related: [xp, administration]
---

## O que ele faz

Um membro executa `rep @user` para dar um ponto de reputação, opcionalmente com um motivo. O total de quem recebe sobe, a sequência diária de quem dá é acompanhada e o histórico guarda quem deu o quê e por quê. Qualquer pessoa pode consultar os totais com `repcheck`, ver o ranking do servidor com `repleaderboard` e ler as últimas dez entradas com `rephistory`.

A equipe configura com que liberdade a reputação circula: um cooldown por par de quem dá e quem recebe, limites diários e semanais e idade mínima da conta, tempo de servidor e quantidade de mensagens antes de alguém poder dar reputação. Os canais podem ser desativados para a reputação ou receber um multiplicador. A reputação também pode ser ganha por reações: um emoji configurado em uma mensagem dá pontos ao autor dela.

Em limites escolhidos, o bot entrega cargos, anuncia o marco em um canal e envia uma DM ao membro. O decaimento opcional remove aos poucos pontos de membros que não deram nem receberam reputação por um tempo, para que o ranking reflita a atividade atual.

## Por que usar

- Reconheça membros prestativos nos canais de suporte e dê a eles um cargo visível.
- Deixe uma reação de joinha no canal de vitrine conceder pontos ao artista.
- Condicione um comando ou um canal a um nível de reputação em vez de um cargo manual.
- Promova um evento de fim de semana em que a reputação em um canal vale em dobro.
- Mantenha honesto o ranking de suporte, com decaimento para quem para de ajudar.

## Dando reputação

Cada `rep` dá um ponto, multiplicado pelo multiplicador do canal, se houver um definido. Você não pode dar reputação a si mesmo nem a um bot. Cada tentativa passa por estas verificações, nesta ordem, e a primeira falha é informada a quem deu:

| Verificação | Padrão | O que acontece |
| --- | --- | --- |
| Sistema ativado | ativado | Tudo é recusado enquanto estiver desativado |
| Estado do canal | ativado | Um canal definido como `disabled` recusa a reputação dada nele |
| Quem recebe está congelado | não | Membros congelados não podem receber reputação |
| Cooldown | 60 minutos | Tempo até quem deu poder dar reputação ao mesmo membro de novo |
| Limite diário | 10 | Reputação que quem dá pode distribuir por dia UTC |
| Limite semanal | nenhum | Limite opcional por semana, contado a partir de domingo |
| Idade mín. da conta | 7 dias | Idade da conta do Discord de quem dá |
| Tempo mín. no servidor | 24 horas | Há quanto tempo quem dá está no servidor |
| Mín. de mensagens | 10 | Mensagens que quem dá enviou, segundo a contagem de mensagens |

A reputação anônima registra a entrada como anônima, mas só quando a concessão anônima está ativada na configuração. A reputação negativa é uma opção separada; a remoção de uma reação já devolve os pontos que ela deu.

### Sequências e estatísticas

Dar reputação em dias consecutivos constrói uma sequência; um intervalo de mais de um dia e meio a zera. `repstats` mostra total, posição, dados, recebidos, sequência atual e mais longa e os horários da última reputação dada e recebida.

### Tipos personalizados

`reptypeadd helpful Helpful` cria um tipo nomeado. Os membros então executam `rep @user helpful thanks for the fix`. A reputação padrão apenas soma ao total; um tipo personalizado também mantém a sua própria contagem por tipo, que os requisitos de comandos podem usar como alvo.

## Reações

`repreaction <emoji> [amount] [type]` faz uma reação dar reputação ao autor da mensagem. Quem reage não pode ser um bot, e remover a reação devolve os pontos. O comando usa por padrão um ponto de reputação padrão, e cada configuração de reação tem o seu próprio cooldown.

## Recompensas de cargo

`reprole @Role 100` dá o cargo quando um membro alcança 100 de reputação. Opções: remover o cargo de novo quando a reputação cai abaixo do limite (ativado por padrão), anunciar o marco em um canal e enviar uma DM. As recompensas são verificadas após cada mudança de reputação. XP de bônus pode ser armazenado em uma recompensa, mas ainda não é pago.

Independentemente das recompensas de cargo, o bot posta uma mensagem de marco no **canal de notificações** quando um membro cruza 50, 100, 250, 500, 1000, 2500, 5000 ou 10000 de reputação. Os membros também recebem uma DM quando recebem dez ou mais pontos de uma vez ou chegam a um múltiplo de dez.

## Decaimento

Quando ativado, a cada hora o bot verifica se é hora de aplicar o decaimento. `daily` é executado às 02:00 UTC, `weekly` aos domingos às 02:00 UTC e `monthly` no primeiro dia do mês. Membros que não deram nem receberam reputação durante o período de inatividade perdem o valor de decaimento, seja um número fixo de pontos ou uma porcentagem do total, nunca abaixo de zero. Membros congelados são pulados. Padrões: semanal, 1 ponto, 30 dias de inatividade.

## Requisitos de comandos

`repcommandreq <command> <minimum> [type] [#channels]` bloqueia um comando até que o membro tenha essa quantidade de reputação, opcionalmente de um tipo personalizado e opcionalmente apenas em certos canais. `repcommandbypass` isenta cargos, e `repcommandinfo` permite que qualquer pessoa veja o que um comando exige.

## Configurações

A página Reputação tem quatro abas: **Configuração**, **Recompensas de cargo**, **Ranking** e **Estatísticas**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Ativar o sistema de reputação | ativado | Chave geral |
| Cooldown (minutos) | 60 | Por par de quem dá e quem recebe |
| Limite diário | 10 | Reputação por pessoa que dá, por dia |
| Limite semanal (opcional) | nenhum | Reputação por pessoa que dá, por semana |
| Idade mínima da conta (dias) | 7 | Requisito de quem dá |
| Tempo mín. no servidor (horas) | 24 | Requisito de quem dá |
| Mín. de mensagens | 10 | Requisito de quem dá |
| Canal de notificações (opcional) | nenhum | Para onde vão as mensagens de marcos |
| Permitir reputação negativa | desativado | Ativa quantidades negativas |
| Ativar reputação anônima | desativado | Permite que `repanon` oculte quem dá |

O decaimento não está no painel; use os comandos `repdecay*` abaixo.

**Recompensas de cargo** tem um formulário com **Cargo**, **Reputação necessária**, **Canal de anúncios (opcional)**, **XP de bônus (opcional)**, **Remover o cargo se a reputação cair abaixo do limite** e **Enviar notificação por DM**. **Ranking** mostra a classificação e abre o histórico de um membro. **Estatísticas** mostra o total de usuários, o total de reputação dada, as transações e a reputação média.

## Passo a passo de configuração

1. Abra **Reputação** no painel. Em **Configuração**, ative a opção **Ativado**.
2. Defina **Intervalo**, **Limite diário** e os três requisitos mínimos de acordo com o tamanho do seu servidor.
3. Escolha um **Canal de notificações** para os marcos e salve.
4. Em **Recompensas de cargo**, adicione um cargo com a sua **Reputação necessária** e marque **Remover o cargo se a reputação cair abaixo do limite** se quiser que ele seja conquistado de forma contínua.
5. No Discord, execute `repreaction <emoji> 1` para ativar a reputação por reação e `repchannel #bot-spam disabled` para manter os canais de spam de fora.
6. Teste com uma segunda conta: `rep @you great help` e depois `repcheck @you`.

> [!WARNING]
> `represet all` apaga a reputação, o histórico e as insígnias de todos os membros do servidor após uma confirmação. Não há como desfazer.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `rep <@user> [type] [reason]` | `+rep`, `giverep`, `gr`, `repgive` | Qualquer pessoa | Dá um ponto |
| `repanon <@user> [type] [reason]` | `anongiverep` | Qualquer pessoa | Dá de forma anônima |
| `anonrep <@user> [type] [reason]` | | Qualquer pessoa | Igual a `repanon` |
| `repcheck [@user]` | `myrep`, `checkrep` | Qualquer pessoa | Mostra o total e a posição |
| `repleaderboard [page]` | `replb`, `reptop`, `toprep` | Qualquer pessoa | Ranking, 25 por página |
| `rephistory [@user]` | `rephist` | Qualquer pessoa | Últimas dez entradas de reputação |
| `repstats [@user]` | `repstat` | Qualquer pessoa | Estatísticas detalhadas e sequências |
| `repcommandinfo <command>` | `repcmdinfo`, `rci` | Qualquer pessoa | Mostra o requisito de reputação de um comando |
| `repstatus` | `repsettings` | Administrador | Mostra a configuração |
| `repconfig` | `repcfg` | Administrador | Menu de configuração interativo |
| `repenable [true/false]` | `repe` | Administrador | Ativa ou desativa o sistema |
| `repcooldown <minutes>` | `repcd` | Administrador | De 1 a 1440 |
| `repdailylimit <n>` | `repdl` | Administrador | De 1 a 100 |
| `repweeklylimit [n]` | `repwl` | Administrador | De 1 a 500, ou none para limpar |
| `repminage <days>` | `repma` | Administrador | De 0 a 365 |
| `repminmembership <hours>` | `repmm` | Administrador | De 0 a 720 |
| `repminmessages <n>` | `repminmsg` | Administrador | De 0 a 1000 |
| `repnegative <true/false>` | `repneg` | Administrador | Permite reputação negativa |
| `repanonymous <true/false>` | `repanonym` | Administrador | Permite reputação anônima |
| `repnotificationchannel [#channel]` | `repnotify` | Administrador | Define ou limpa o canal de marcos |
| `repchannel <#channel> [enabled/disabled/readonly] [multiplier]` | `repch` | Administrador | Estado e multiplicador por canal |
| `repdecay <true/false>` | `repd` | Administrador | Ativa o decaimento |
| `repdecaytype <daily/weekly/monthly/fixed/percentage>` | `repdt` | Administrador | Programação do decaimento ou tipo de valor |
| `repdecayamount <n>` | `repda` | Administrador | De 1 a 100 pontos ou por cento |
| `repdecayinactive <days>` | `repdi` | Administrador | De 1 a 365 dias antes do decaimento |
| `reptake <@user> [amount]` | `-rep`, `takerep` | Administrador | Remove pontos |
| `repset <@user> <amount>` | `setrep` | Administrador | Define um total |
| `represet <@user or all>` | `resetrep` | Administrador | Zera um membro ou todos |
| `repfreeze <@user>` | `freezerep` | Administrador | Impede um membro de receber reputação |
| `repunfreeze <@user>` | `unfreeze`, `unfreezerep` | Administrador | Desfaz um congelamento |
| `repreaction <emoji> [amount] [type]` | `repemoji`, `rre` | Administrador | Adiciona ou atualiza uma recompensa por reação |
| `repreactionremove <emoji>` | `repemojiremove`, `rrer` | Administrador | Remove uma recompensa por reação |
| `repreactionlist` | `repemojilist`, `rrel` | Administrador | Lista as recompensas por reação |
| `reprole [@role] [rep] [removeOnDrop] [#channel] [dm] [xp]` | | Gerenciar Cargos | Adiciona, atualiza ou lista recompensas de cargo |
| `reproleremove <@role>` | `reprr` | Gerenciar Cargos | Remove uma recompensa de cargo |
| `reprolechannel <@role> [#channel]` | `reprc` | Administrador | Define ou limpa o canal de anúncio de uma recompensa |
| `repcommandreq <command> <min> [type] [#channels]` | `repcmdreq`, `rcr` | Administrador | Exige reputação para um comando |
| `repcommandbypass <command> <@roles>` | `repcmdbypass`, `rcb` | Administrador | Cargos que ignoram o requisito |
| `repcommandreqremove <command>` | `repcmdreqremove`, `rcrr` | Administrador | Remove um requisito |
| `repcommandreqlist` | `repcmdreqlist`, `rcrl` | Administrador | Lista os requisitos |
| `reptypeadd <name> <display name>` | `repaddtype`, `rta` | Administrador | Adiciona um tipo personalizado |
| `reptyperemove <name>` | `repremovetype`, `rtr` | Administrador | Remove um tipo personalizado |
| `reptypelist` | `replisttypes`, `rtl` | Administrador | Lista os tipos personalizados |
| `repeventcreate <name> <multiplier> <hours>` | `repec` | Administrador | Registra um evento de multiplicador |
| `repeventend <name>` | `repee` | Administrador | Encerra um evento mais cedo |
| `repexport` | `repex` | Administrador | Exporta a configuração como JSON |
| `repimport` | `repim` | Administrador | Importa um arquivo de configuração anexado à mensagem |
| `repmilestonelost <@user> <@role> <threshold>` | | Administrador | Mensagem de teste para um marco perdido |

Os comandos de barra `/rep` cobrem `give`, `check`, `leaderboard`, `history` e `stats`, além dos grupos administrativos `/rep config`, `/rep decay`, `/rep manage`, `/rep reaction`, `/rep role`, `/rep type`, `/rep event` e `/rep require`, que espelham os comandos de configuração acima. `/rep role list` e `/rep role info` existem apenas como comandos de barra.

## Dicas e armadilhas

- As recompensas de cargo exigem que o cargo do bot esteja acima de todos os cargos de recompensa e a permissão Gerenciar Cargos, e `reprole` recusa cargos acima do bot.
- O mínimo de mensagens usa o recurso de contagem de mensagens. Se a contagem estiver desativada, os membros podem ser impedidos de dar reputação com uma contagem de zero.
- Apenas o estado de canal `disabled` bloqueia a concessão. `readonly` é aceito pelo comando, mas atualmente não impede a reputação nesse canal.
- Os eventos criados com `repeventcreate` são armazenados com o multiplicador e a hora de término, mas o multiplicador atualmente não é aplicado à reputação dada durante o evento.
- A reputação por reação usa o nome do emoji para emojis padrão e o ID para os personalizados, então um emoji personalizado de outro servidor não corresponderá depois de ser removido.
- As verificações de decaimento são executadas na hora cheia, então um decaimento `daily` acontece uma vez durante a hora das 02:00 UTC.
- O cooldown é por par. Um membro pode dar reputação a várias pessoas diferentes em sequência, até o limite diário.

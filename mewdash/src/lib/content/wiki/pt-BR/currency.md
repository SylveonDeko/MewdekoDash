---
title: Moeda
slug: currency
summary: Uma economia por servidor com carteiras e banco, recompensas diárias, trabalho e crime, uma loja de cargos e itens e mais de vinte jogos de aposta, tudo ajustável pelo painel.
icon: fa-money-bill
category: Entertainment
dashboard: /dashboard/currency
module: Currency
tags: [currency, economy, money, coins, shop, balance, bank, daily, work, crime, rob, pay, gambling, blackjack, roulette, slots, leaderboard, moeda, economia, dinheiro, moedas, loja, saldo, banco, diário, trabalho, crime, roubo, apostas, ranking]
related: [xp, administration]
---

## O que faz

Todo membro tem uma carteira e, se você deixar o banco ativado, um saldo no banco. Eles ganham moeda resgatando uma recompensa diária, executando `work` e `crime` com cooldowns, vencendo jogos ou recebendo pagamentos de outros membros. Eles gastam na sua loja com cargos, colecionáveis ou itens de texto, ou apostam em jogos como blackjack, roleta, caça-níqueis, crash e keno.

A equipe decide como a economia se comporta: se as apostas estão ativadas, limites de aposta, uma vantagem da casa, quanto work e crime pagam, se o roubo existe, taxa de transferência, juros do banco e bônus de sequência diária. Cada um desses itens é uma configuração na aba **Configuração** ou uma chave de `economyset`, então você pode ajustar a economia sem mexer nos jogos.

O bot registra todo crédito e débito como uma transação, de modo que os membros podem ver para onde o dinheiro deles foi e a aba **Análises** pode mostrar a quantidade de dinheiro em circulação, onde ela está e quais jogos estão pagando mais do que recebem.

## Por que usar

- Dê aos membros ativos algo em que gastar o engajamento: um cargo colorido, um título personalizado ou um pouco de diversão em um canal de jogos.
- Mantenha um canal de jogos justo, porque limites de aposta, um limite diário de perdas e uma vantagem da casa são aplicados por você.
- Recompense membros com `modifybalance` ou com a ferramenta **Ajustar um saldo** por ajudarem, e deixe que escolham na loja.
- Observe a tabela **Desempenho dos jogos** para ver o retorno real de cada jogo e ajustar `payoutmultiplier` com base em dados, e não em palpites.

## Saldos, banco e transferências

`cash` mostra sua carteira e, se você tiver algo no banco, seu banco e seu patrimônio líquido. `bank` mostra o mesmo para qualquer membro e também coleta os juros que você tem a receber. `deposit` e `withdraw` movem dinheiro entre os dois; `all` funciona como valor. O dinheiro no banco não pode ser roubado, e a **Capacidade do banco** limita quanto pode ser guardado (0 significa ilimitado).

Os juros são pagos quando um membro executa `bank`: se o intervalo desde o último pagamento de juros já passou, o saldo do banco rende **Juros (%)** uma vez. Não são pagos enquanto ninguém verifica.

`pay` envia moeda da carteira a outro membro, descontada a **Taxa de transferência (%)**, com uma **Transferência mínima** e um cooldown opcional. Bots não podem receber pagamentos.

`transactions` lista as últimas 250 entradas suas ou de outro membro, dez por página. `cashleaderboard` classifica os membros por carteira mais banco.

## Ganhos

| Comando | Padrão | O que acontece |
| --- | --- | --- |
| `dailyreward` | Não definido até a equipe executar `setdaily` | Credita o valor diário uma vez por cooldown. Com as sequências ativadas, cada resgate consecutivo soma **Bônus por dia** vezes os dias da sequência além do primeiro, limitado pelo **Bônus máximo**. Perder uma janela inteira de cooldown reinicia a sequência. |
| `work` | 50 a 250, a cada 30 minutos | Um pagamento aleatório dentro da faixa configurada, sempre tem sucesso. |
| `crime` | 200 a 800, 45% de sucesso, a cada hora | No sucesso, paga a faixa do crime. Na falha, cobra uma multa de 100 a 500, limitada ao que há na carteira. |
| `rob @user` | Desativado | Quando ativado: 35% de chance de levar até 20% da carteira do alvo. Alvos com menos de 100 são protegidos. A falha custa 15% da sua própria carteira. Uma tentativa por hora. |

## Jogos

Toda aposta passa pelas mesmas verificações: as apostas precisam estar ativadas, a aposta deve ficar entre a **Aposta mínima** e a **Aposta máxima**, o membro não pode ter atingido o **Limite diário de perdas** nas últimas 24 horas e o cooldown do jogo (se houver) precisa ter passado. O valor apostado é cobrado antecipadamente. Os ganhos são `stake plus profit`, e a parte do lucro é escalada pelo **Multiplicador de pagamento**, então um multiplicador de 0,9 reduz cada vitória em dez por cento, enquanto um empate ainda devolve o valor apostado inteiro.

| Jogo | Como paga |
| --- | --- |
| `coinflip <bet> heads/tails` | Pagamento 1:1 em um palpite correto |
| `highlow higher/lower [bet]` | Um número de 1 a 10 é mostrado; adivinhe o próximo. Pagamento 1:1, um número igual devolve a aposta. Aposta padrão 100 |
| `spinwheel [bet]` | Roda ponderada com segmentos de menos 10 por cento a mais 30 por cento da aposta. Aposta padrão 10 |
| `blackjack <bet>`, depois `hit` e `stand` | O dealer compra até 17. Pagamento 1:1 na vitória, empate devolve a aposta |
| `slot [bet]` | Dois símbolos iguais pagam 2x. Três iguais pagam 3x, uvas 5x, setes 7x, diamantes 10x. Aposta padrão 10 |
| `roulette <bet> <type>` | Um número de 0 a 36 paga 35 para 1. `red`, `black`, `even` ou `odd` pagam 1:1; o zero perde apostas de cor e de paridade |
| `rps <choice> [bet]` | Pedra, papel, tesoura, lagarto, Spock contra o bot. Pagamento 1:1, empates devolvem a aposta. A aposta é opcional |
| `war <bet>` | A carta mais alta vence e paga 1:1. Um empate cobra uma segunda aposta e joga mais uma carta pelo dobro |
| `craps <bet> [pass/dontpass/field/any]` | Pass e don't pass seguem as regras do ponto, pagando 1:1. Field paga 1:1, ou 2x em 2 ou 12. Any seven paga 4x |
| `scratchcard [bronze/silver/gold/diamond]` | Cartões de custo fixo de 10, 50, 200 ou 1000 com 30, 25, 20 e 15 por cento de chance de vitória e faixas de prêmio de até 50, 200, 1000 e 5000 |
| `russianroulette <bet> [bullets]` | De uma a cinco balas em seis câmaras. Sobreviver paga 1,2x, 1,5x, 2x, 3x ou 5x de lucro conforme o número de balas |
| `baccarat <bet> [player/banker/tie]` | Player ou banker pagam 1,95x, tie paga 8x |
| `minesweeper <bet> [small/medium/large]` | 70, 60 ou 50 por cento de sobrevivência por 1,5x, 2,5x ou 4x |
| `lottery [tickets]` | Os bilhetes custam 50 cada, até 10. Mais bilhetes aumentam a chance de vitória (máx. 40%) e o multiplicador do prêmio |
| `crash <bet> [target]` | Escolha uma meta de saque de 1,1x a 10x. Você ganha a meta se o ponto de crash for igual ou maior que ela |
| `keno <bet> <numbers>` | Escolha de 1 a 10 números de 1 a 80; 20 são sorteados. Os pagamentos vão de 3x para um acerto de um até 800x para cinco de cinco |
| `plinko <bet> [rows]` | 5 a 10 fileiras. Cair no centro paga 0,5x, as bordas pagam até 10x |
| `wheelfortune <bet> [classic/risky/balanced]` | Rodas de multiplicadores; a arriscada vai de 0,1x a 20x |
| `duckrace <bet>` | Cinco patos, o seu é aleatório. O primeiro paga 4x, o segundo 2x, o terceiro 1,2x |
| `bingo <bet> [small/large]` | 40% de chance de 2x, ou 25% de chance de 3,5x |
| `diceduel @user <bet>` | O oponente recebe botões de aceitar e recusar; ambos precisam poder cobrir a aposta |
| `memory <bet> [easy/medium/hard]` | Repita uma sequência de 4, 6 ou 8 por 1,5x, 2x ou 3x |
| `horserace <bet>` | Até dez membros entram em dez segundos; corredores de IA preenchem as vagas vazias. O prêmio paga 50, 30 e 20 por cento aos três primeiros |
| `triviachain <bet> [category]` | Responda perguntas do OpenTDB em sequência; cada resposta correta aumenta o multiplicador em 0,5x. Categorias: general, science, history, sports, entertainment |

> [!NOTE]
> `horserace` aceita qualquer aposta positiva: ele cobra o valor diretamente e não aplica os limites de aposta compartilhados nem o multiplicador de pagamento.

## Desafios diários

Cada membro recebe um desafio aleatório por dia: jogar cinco partidas, vencer três, gastar 500, ganhar 300 ou jogar um jogo específico três vezes. A recompensa é o valor base mais até 50 extras. `dailychallenge` o mostra, `claimchallenge` o paga e `challengeleaderboard` classifica os dez primeiros por desafios concluídos nos últimos 30 dias.

> [!WARNING]
> Atualmente os jogos não informam o progresso ao rastreador de desafios, então os desafios mostram progresso 0 e ainda não podem ser resgatados.

## A loja

Os itens ficam na aba **Loja** ou vêm de `shopadditem` e `shopaddrole`. Cada item tem um **Nome**, **Preço**, **Descrição**, **Tipo**, **Estoque** (em branco ou -1 para ilimitado), **Limite por usuário**, um **Cargo necessário** opcional que o comprador deve ter e uma **Ordem de exibição**.

| Tipo | Na compra |
| --- | --- |
| Cargo | O bot adiciona o cargo ao comprador. O padrão é um por membro. |
| Colecionável | Vai para o inventário do comprador; consumível, então `use` remove um. |
| Texto | O **Texto entregue** é enviado ao comprador por DM, e de novo em `use`. |

`buy <name>` verifica se o item está ativado, se o comprador tem o cargo necessário, se ainda há estoque, se ele pode pagar e se está abaixo do limite por usuário. Qualquer falha após o pagamento reembolsa automaticamente. `inventory` lista o que um membro possui. `shoptoggle` oculta um item sem excluir as cópias de ninguém; `shopremove` o exclui junto com todas as cópias.

## Placeholders

Estes placeholders de moeda estão disponíveis nas respostas de chat triggers e em outros lugares que usam placeholders de triggers.

| Placeholder | Valor |
| --- | --- |
| `%currency.balance%` | A carteira do usuário |
| `%currency.bank%` | O saldo do banco do usuário |
| `%currency.total%` | Carteira mais banco |
| `%targetuser.currency.balance%` | A carteira do usuário alvo |
| `%targetuser.currency.bank%` | O saldo do banco do usuário alvo |
| `%currency.emote%` | O emote de moeda do servidor |

## Configurações

O painel tem quatro abas: **Análises**, **Configuração**, **Loja** e **Ranking**. A aba **Ranking** também contém **Ajustar um saldo**, que credita ou debita um membro com um motivo registrado no livro-razão.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Ativar apostas | Ativado | Liga ou desliga todos os jogos de aposta |
| Aposta mínima | 1 | Menor valor apostado |
| Aposta máxima | 0 (ilimitado) | Maior valor apostado |
| Multiplicador de pagamento | 1.0 | Escala apenas os ganhos, de 0,1 a 5,0 |
| Limite diário de perdas | 0 (desativado) | Bloqueia um membro depois que ele perde esse valor em 24 horas |
| Cooldown dos jogos (segundos) | 0 | Segundos entre apostas por membro |
| Ativar trabalho | Ativado | O comando `work` |
| Mínimo / máximo do trabalho | 50 / 250 | Faixa de pagamento do trabalho |
| Cooldown do trabalho | 1800 segundos | `workcooldown`, apenas por comando |
| Ativar crime | Ativado | O comando `crime` |
| Mínimo / máximo do crime | 200 / 800 | Faixa de pagamento do crime |
| Chance de sucesso do crime (%) | 45 | Chance de um crime pagar |
| Multa mínima / máxima do crime | 100 / 500 | Multa na falha |
| Cooldown do crime | 3600 segundos | `crimecooldown`, apenas por comando |
| Ativar banco | Ativado | `bank`, `deposit`, `withdraw` |
| Capacidade do banco | 0 (ilimitada) | O máximo que um membro pode guardar no banco |
| Juros (%) | 0 | Pagos por intervalo sobre o saldo do banco |
| Intervalo dos juros (horas) | 24 | Com que frequência os juros podem ser coletados |
| Ativar transferências | Ativado | O comando `pay` |
| Taxa de transferência (%) | 0 | Descontada de cada pagamento |
| Transferência mínima | 1 | Menor pagamento |
| Cooldown do pagamento | 0 | `paycooldown`, apenas por comando |
| Ativar roubo | Desativado | O comando `rob` |
| Chance de sucesso (%) | 35 | Chance de um roubo funcionar |
| Roubo máximo (%) | 20 | Parte da carteira do alvo que um sucesso pode levar |
| Multa por falha (%) | 15 | Parte da carteira do ladrão perdida na falha |
| Protegido abaixo de | 100 | Alvos com menos do que isso não podem ser roubados |
| Cooldown do roubo | 3600 segundos | `robcooldown`, apenas por comando |
| Ativar sequências | Ativado | Resgates diários consecutivos rendem um bônus |
| Bônus por dia | 0 | Somado por dia consecutivo além do primeiro |
| Bônus máximo | 0 (sem limite) | Limite do bônus de sequência |

O valor da recompensa diária e o cooldown dela são definidos com `setdaily`, não no painel. `economyconfig` imprime todas as chaves com seus valores atuais, e `economyreset` restaura todos os padrões.

## Passo a passo de configuração

1. Execute `setdaily 500 24h` para que os membros tenham algo a resgatar.
2. Abra **Moeda** no painel e vá para **Configuração**. Defina a **Aposta máxima** e um **Limite diário de perdas** antes de abrir um canal de jogos.
3. Ative **Ativar roubo** somente se seus membros aceitarem perder dinheiro da carteira; deixe o banco ativado para que possam protegê-lo.
4. Em **Loja**, adicione alguns itens de cargo e um colecionável. Defina um **Cargo necessário** em qualquer coisa que deva ser exclusiva para membros.
5. Dê um saldo inicial a alguns membros com **Ajustar um saldo** ou `modifybalance`.
6. Depois de uma semana, confira as **Análises** e diminua o **Multiplicador de pagamento** se os jogos estiverem pagando mais do que recebem.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `cash` | `$`, `$$`, `$$$`, `currency`, `cur` | Ninguém | Sua carteira, banco e patrimônio líquido |
| `bank [@user]` | | Ninguém | Saldos de um membro, e coleta seus juros |
| `deposit <amount/all>` | | Ninguém | Da carteira para o banco |
| `withdraw <amount/all>` | | Ninguém | Do banco para a carteira |
| `pay @user <amount>` | | Ninguém | Envia moeda, descontada a taxa |
| `transactions [@user]` | `txs` | Ninguém | Últimas 250 entradas do livro-razão |
| `cashleaderboard` | `cashlb`, `richest` | Ninguém | Membros mais ricos por patrimônio líquido |
| `dailyreward` | `daily` | Ninguém | Resgata a recompensa diária |
| `work` | | Ninguém | Ganha um pagamento de trabalho |
| `crime` | | Ninguém | Pagamento arriscado ou uma multa |
| `rob @user` | | Ninguém | Tenta roubar de uma carteira |
| `dailychallenge` | `dc` | Ninguém | Mostra o desafio de hoje |
| `claimchallenge` | `claimch` | Ninguém | Resgata um desafio concluído |
| `challengeleaderboard` | `chlb` | Ninguém | Quem mais concluiu desafios |
| `shop` | | Ninguém | Navega pela loja, oito itens por página |
| `buy <item>` | | Ninguém | Compra um item |
| `inventory [@user]` | | Ninguém | Itens que um membro possui |
| `use <item>` | | Ninguém | Usa um consumível |
| `coinflip <bet> <heads/tails>` | `flip` | Ninguém | Veja Jogos |
| `highlow <higher/lower> [bet]` | | Ninguém | Veja Jogos |
| `spinwheel [bet]` | `wheel` | Ninguém | Veja Jogos |
| `blackjack <bet>` | `bj` | Ninguém | Inicia ou entra em um blackjack |
| `hit` | | Ninguém | Compra uma carta |
| `stand` | | Ninguém | Encerra seu turno |
| `slot [bet]` | `slots` | Ninguém | Veja Jogos |
| `roulette <bet> <type>` | | Ninguém | Veja Jogos |
| `rps <choice> [bet]` | | Ninguém | Veja Jogos |
| `war <bet>` | | Ninguém | Veja Jogos |
| `craps <bet> [type]` | | Ninguém | Veja Jogos |
| `scratchcard [type]` | `scratch` | Ninguém | Veja Jogos |
| `russianroulette <bet> [bullets]` | `rroulette` | Ninguém | Veja Jogos |
| `baccarat <bet> [type]` | | Ninguém | Veja Jogos |
| `minesweeper <bet> [size]` | `mines` | Ninguém | Veja Jogos |
| `lottery [tickets]` | | Ninguém | Veja Jogos |
| `crash <bet> [target]` | | Ninguém | Veja Jogos |
| `keno <bet> <numbers>` | | Ninguém | Veja Jogos |
| `plinko <bet> [rows]` | | Ninguém | Veja Jogos |
| `wheelfortune <bet> [wheel]` | `wof` | Ninguém | Veja Jogos |
| `duckrace <bet>` | `duck` | Ninguém | Veja Jogos |
| `bingo <bet> [card]` | | Ninguém | Veja Jogos |
| `diceduel @user <bet>` | `dd` | Ninguém | Desafia um membro |
| `memory <bet> [difficulty]` | | Ninguém | Veja Jogos |
| `horserace <bet>` | `hr` | Ninguém | Entra ou inicia uma corrida |
| `triviachain <bet> [category]` | `tchain` | Ninguém | Veja Jogos |
| `setdaily <amount> <time>` | | Administrador | Valor e cooldown da recompensa diária, por exemplo `setdaily 500 24h` |
| `modifybalance @user <amount> [reason]` | `modbal` | Dono do bot na moeda global; caso contrário, conforme definido por uma exceção de permissão de comando | Adiciona ou remove moeda; valores negativos debitam |
| `economyconfig` | | Administrador | Mostra todas as configurações da economia |
| `economyset <setting> <value>` | | Administrador | Altera uma configuração pela chave |
| `economyreset` | | Administrador | Restaura todos os padrões |
| `economystats` | | Ninguém | Tamanho e concentração da quantidade de dinheiro em circulação |
| `economyflow [days]` | | Ninguém | Por onde a moeda entrou e saiu de circulação, padrão 7 dias |
| `gamestats [days]` | | Ninguém | Retorno ao jogador por jogo, padrão 7 dias |
| `shopadditem <price> <name>` | | Administrador | Adiciona um colecionável consumível com estoque ilimitado |
| `shopaddrole <price> @role <name>` | | Administrador, o bot precisa de Gerenciar cargos | Adiciona um item de cargo, um por membro |
| `shopremove <name>` | | Administrador | Exclui um item e todas as cópias |
| `shopprice <price> <name>` | | Administrador | Altera um preço |
| `shopstock <stock> <name>` | | Administrador | Define o estoque restante |
| `shopdesc <name> \| <description>` | | Administrador | Define a descrição |
| `shoptoggle <name>` | | Administrador | Mostra ou oculta um item |

## Dicas e armadilhas

- Defina a **Aposta máxima** antes de qualquer outra coisa. Com ela em 0, um membro sortudo pode esgotar a economia em uma tarde.
- O limite diário de perdas conta as perdas líquidas das últimas 24 horas, então um membro que ganha cedo pode continuar jogando por mais tempo.
- Itens de cargo exigem que o cargo mais alto do bot esteja acima do cargo vendido e Gerenciar cargos, ou a compra falha após o pagamento com um erro de concessão de cargo.
- Itens de texto e `use` entregam por DM; membros com DMs fechadas veem um erro, mas ainda possuem o item.
- O blackjack mantém um jogo por membro na memória; `hit` e `stand` só funcionam depois de `blackjack`.
- As corridas de cavalos esperam dez segundos por outros membros, depois preenchem o grid com corredores de IA e começam.
- Os jogos de trivia chain expiram após dez minutos de inatividade, e um membro só pode ter um em andamento por vez.
- Quando o bot é hospedado com moeda global, os saldos são compartilhados entre todos os servidores e `modifybalance` é exclusivo do dono.

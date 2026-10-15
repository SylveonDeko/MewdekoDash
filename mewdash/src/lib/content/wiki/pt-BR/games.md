---
title: Jogos
slug: games
summary: Jogos de chat que os membros podem iniciar em qualquer canal, de trivia, forca e cadeias de palavras a corridas de digitação, acrophobia e enquetes.
icon: fa-gamepad-modern
category: Entertainment
module: Games
tags: [games, trivia, hangman, kaladont, nunchi, typing race, acrophobia, tic tac toe, poll, vote, 8ball, choose, jogos, forca, corrida de digitação, jogo da velha, enquete, votação, escolher]
related: [polls, currency, xp, searches, utility]
---

## O que faz

Os jogos são disputados no canal onde são iniciados. Um membro executa um comando, o bot publica o jogo, e todos no canal jogam digitando respostas ou pressionando botões. Só pode haver um jogo de cada tipo por canal (ou por servidor, no caso de Nunchi e Kaladont) ao mesmo tempo, e a maioria dos jogos pode ser interrompida antes do fim com um comando de parada correspondente.

Trivia, forca, Kaladont, Nunchi, a corrida de digitação, acrophobia e o jogo da velha são multijogador. As enquetes permitem que a equipe faça uma pergunta ao canal com botões ou um menu suspenso. `choose` e `8ball` são brincadeiras pontuais.

Este módulo não tem página no painel. Tudo é feito com comandos, e a maioria deles não exige nenhuma permissão.

## Por que usar

- Anime uma noite parada com uma rodada de trivia ou forca.
- Realize uma corrida de digitação ou um torneio de Kaladont como evento da comunidade.
- Faça uma pergunta rápida de sim ou não ao servidor, ou uma enquete com várias opções em um menu suspenso.
- Crie um canal Kaladont permanente para que a cadeia de palavras nunca pare.

## Trivia

`trivia` inicia um quiz. O bot publica uma pergunta, mostra uma dica na metade do tempo da pergunta, a menos que as dicas estejam desativadas, e o primeiro membro a digitar a resposta ganha um ponto. Quando um membro atinge a pontuação necessária para vencer, o jogo termina e ele ganha. Se um número suficiente de perguntas seguidas ficar sem resposta, o jogo para.

| Opção | Padrão | O que faz |
| --- | --- | --- |
| `-p`, `--pokemon` | desativado | Modo "Quem é esse Pokémon?" |
| `--nohint` | desativado | Nunca mostra dicas |
| `-w`, `--win-req` | 10 | Pontos necessários para vencer; 0 para um jogo sem fim |
| `-q`, `--question-timer` | 30 | Segundos por pergunta |
| `-t`, `--timeout` | 10 | Perguntas seguidas sem resposta antes de o jogo parar; 0 para nunca parar |

`tl` mostra a pontuação atual e `tq` para o jogo. A configuração global do bot pode definir uma pontuação mínima para vencer e um prêmio em moeda para o vencedor.

> [!EXAMPLE]
> `trivia -w 5 -q 20` executa um jogo curto até cinco pontos, com vinte segundos por pergunta.

## Forca

`hangman [type]` escolhe uma palavra de uma categoria e a mostra como espaços em branco. Os membros tentam adivinhar uma letra ou a palavra inteira, digitando-a no canal. Seis palpites errados fazem o jogador perder. As categorias são `countries`, `movies`, `animals`, `things` e `random`; `random` é o padrão. `hangmanlist` mostra os tipos disponíveis no seu servidor e `hangmanstop` encerra o jogo.

## Kaladont

Kaladont é uma cadeia de palavras. Cada palavra deve começar com as duas últimas letras da palavra anterior, e uma palavra só pode ser usada uma vez por jogo. Os jogadores se revezam, com um limite de tempo por vez. O dicionário pode ser em inglês ou em sérvio, e os dígrafos sérvios (como lj e nj) são tratados como letras únicas.

| Opção | Padrão | O que faz |
| --- | --- | --- |
| `-j`, `--join-time` | 15 | Segundos para os jogadores entrarem antes de o jogo começar |
| `-t`, `--turn-time` | 30 | Segundos por vez |
| `-m`, `--min-players` | 2 | Jogadores necessários para começar |
| `-l`, `--language` | en | `en` ou `sr` |
| `-e`, `--endless` | desativado | Rejeita palavras que não deixem nenhuma palavra válida para o próximo jogador |

`kaladontstop` encerra o jogo atual. `kaladontsetup` transforma o canal atual em um canal Kaladont permanente, que mantém a cadeia de palavras em andamento com os mesmos sinalizadores de idioma e de jogo sem fim, e `kaladontdisable` o remove. Ambos exigem Gerenciar Canais.

## Nunchi

`nunchi` cria um jogo, e outros membros executam `nunchi` para entrar enquanto ele está na fase de entrada. A cada rodada, o bot anuncia um número e todo jogador deve digitar o número seguinte. Quem digitar corretamente passa a vez; quando todos, exceto um, tiverem passado, a rodada termina e o jogador restante é eliminado. Se ninguém responder a tempo, a rodada recomeça com todos os que já passaram. O último jogador de pé vence.

## Corrida de digitação

`typestart` faz uma contagem regressiva (cinco segundos por padrão; `-s` ou `--start-time` define de 3 a 30) e depois publica uma frase. O primeiro membro a digitá-la de volta com precisão suficiente vence; alguns erros de digitação são tolerados, cerca de um a cada 25 caracteres. O resultado mostra palavras por minuto e o número de erros. `typestop` encerra uma corrida, `typelist` mostra o conjunto de frases, e os donos do bot podem adicionar ou excluir frases com `typeadd` e `typedel`.

## Acrophobia

`acrophobia` publica de três a cinco letras aleatórias. Os membros têm o tempo de envio (60 segundos por padrão, de 15 a 300) para enviar uma frase cujas palavras comecem com essas letras, na ordem, com um envio por pessoa. Depois, todos votam em seu favorito pelo número durante o tempo de votação (60 segundos por padrão, de 15 a 120). Você não pode votar na sua própria entrada. Defina os tempos com `-s` ou `--submission-time` e `-v` ou `--vote-time`.

## Jogo da velha

`tictactoe` abre um jogo; o próximo membro a executar o comando entra como segundo jogador. As jogadas são feitas no chat, e quem demorar mais que o tempo de cada jogada (15 segundos por padrão, `-t` ou `--turn-timer`, de 5 a 60) perde por desistência. O jogo informa um vencedor ou um empate.

## Enquetes

Para criar enquetes é preciso Gerenciar Mensagens. As opções são separadas por ponto e vírgula.

| Comando | Tipo | Comportamento |
| --- | --- | --- |
| `poll <question>` | Sim/Não | Dois botões |
| `pollc question;option1;option2;...` | Escolha única | Um voto por membro |
| `pollm question;option1;option2;...` | Múltipla escolha | Os membros podem escolher várias opções |
| `polla question;option1;option2;...` | Anônima | As identidades dos votantes ficam ocultas |

Enquetes com duas a cinco opções usam botões; as mais longas usam um menu suspenso com até 25 itens. Os membros podem alterar o voto. Os modelos salvam uma pergunta e suas opções para reutilização: `polltemplates` os lista e `polltemplate <name>` publica um deles. Criar e excluir modelos, encerrar uma enquete, listar enquetes ativas e ver as estatísticas de uma enquete são feitos com os comandos de barra `/poll` (`create-template`, `delete-template`, `close`, `list`, `stats`) ou na página de Enquetes do painel, que tem seu próprio artigo.

## Outros

- `choose a; b; c` escolhe uma opção aleatória de uma lista separada por ponto e vírgula.
- `8ball <question>` responde com uma das respostas da configuração de jogos do bot.
- `linux <word> <word>` publica o copypasta "I'd just like to interject" com os dois nomes trocados.
- `dragon` alterna sua marcação de testador beta, que alguns comandos experimentais verificam.
- `rategirl` existe apenas como um esboço com uma nota sobre o motivo de ter sido removido. Ele não faz nada útil.

## Configurações

Este módulo não tem página no painel nem configurações por servidor. O comportamento dos jogos é definido pelas opções de comando acima. O arquivo `games.yml` de configuração do dono do bot contém as respostas do 8ball e a pontuação mínima para vencer e a recompensa em moeda da trivia.

## Passo a passo de configuração

1. Escolha um canal para os jogos, ou crie um, para que as mensagens de jogo não tomem conta da conversa.
2. Se quiser uma cadeia de palavras permanente, execute `kaladontsetup -l en` nesse canal.
3. Execute `trivia` ou `hangman` para verificar se o bot consegue enviar mensagens e ler respostas ali.
4. Dê a Gerenciar Mensagens à equipe, se quiser que ela execute enquetes.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Atalhos | Requer | Função |
| --- | --- | --- | --- |
| `trivia [options]` | `t` | Ninguém | Inicia a trivia |
| `tl` | | Ninguém | Pontuação da trivia |
| `tq` | | Ninguém | Para a trivia |
| `hangman [type]` | | Ninguém | Inicia a forca |
| `hangmanlist` | | Ninguém | Lista os tipos de forca |
| `hangmanstop` | | Ninguém | Para a forca |
| `kaladont [options]` | `kal` | Ninguém | Inicia o Kaladont |
| `kaladontstop` | `kalstop` | Ninguém | Para o Kaladont |
| `kaladontsetup [options]` | `kalsetup` | Gerenciar Canais | Torna este um canal Kaladont permanente |
| `kaladontdisable` | `kaldisable` | Gerenciar Canais | Remove o canal permanente |
| `nunchi` | | Ninguém | Cria ou entra no Nunchi |
| `typestart [options]` | | Ninguém | Inicia uma corrida de digitação |
| `typestop` | | Ninguém | Para a corrida |
| `typelist [page]` | | Ninguém | Lista as frases da corrida |
| `typeadd <text>` | | Dono do bot | Adiciona uma frase |
| `typedel <index>` | | Dono do bot | Exclui uma frase |
| `acrophobia [options]` | `acro` | Ninguém | Inicia a acrophobia |
| `tictactoe [options]` | `ttt` | Ninguém | Inicia ou entra no jogo da velha |
| `poll <question>` | `ppoll` | Gerenciar Mensagens | Enquete de sim/não |
| `pollc <question;options>` | | Gerenciar Mensagens | Enquete de escolha única |
| `pollm <question;options>` | | Gerenciar Mensagens | Enquete de múltipla escolha |
| `polla <question;options>` | | Gerenciar Mensagens | Enquete anônima |
| `polltemplates` | `ptemplates` | Ninguém | Lista os modelos de enquete |
| `polltemplate <name>` | `ptemplate` | Gerenciar Mensagens | Publica uma enquete a partir de um modelo |
| `choose <a; b; c>` | | Ninguém | Escolhe uma ao acaso |
| `8ball [question]` | `eightball` | Ninguém | Bola 8 mágica |
| `linux <word> <word>` | | Ninguém | O copypasta de interjeição |
| `dragon` | | Ninguém | Alterna sua marcação beta |
| `rategirl` | | Ninguém | Esboço, não faz nada |

## Dicas e cuidados

- Os jogos leem as respostas do canal, então o bot precisa de Ler Histórico de Mensagens e Enviar Mensagens ali, e não pode estar bloqueado por uma regra de permissão do canal.
- As respostas de trivia, forca e Kaladont são mensagens comuns. Se você também usa contagem de mensagens ou XP, essas mensagens contam.
- Só pode haver um jogo de trivia, forca, corrida de digitação ou Kaladont por canal; o comando de início avisa se já houver um em andamento.
- Opções de enquete com mais de 100 caracteres são cortadas no menu suspenso.
- O Nunchi elimina o jogador mais lento a cada rodada, então um grupo grande pode levar um tempo para terminar.

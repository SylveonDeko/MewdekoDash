---
title: Contagem
slug: counting
summary: Transforme um canal em um jogo de contagem em que os membros se revezam postando o próximo número, com reações, sequências, rankings, pontos de salvamento e punições opcionais por quebrar a contagem.
icon: fa-list-numeric
category: Community
dashboard: /dashboard/counting
module: Counting
tags: [counting, count, numbers, game, channel, leaderboard, streak, milestones, save point, contagem, contar, números, jogo, canal, ranking, sequência, marcos, ponto de salvamento]
related: [administration, xp]
---

## O que ele faz

A equipe escolhe um canal e executa `countingsetup`. A partir daí, o bot passa a observar todas as mensagens nesse canal. Se uma mensagem for o próximo número esperado, o bot reage com uma marca de verificação e registra a contagem para esse membro. Se for o número errado, o bot reage com um X e, por padrão, exclui a mensagem dois segundos depois para manter o canal limpo.

O bot guarda um número atual, o maior número já alcançado, o total de contagens e quem contou por último. Por padrão, o mesmo membro não pode contar duas vezes seguidas, então o jogo precisa de pelo menos duas pessoas. Os membros podem consultar as próprias estatísticas, sequências e precisão, e há um ranking por canal.

Para a equipe, há pontos de salvamento que permitem voltar a contagem atrás depois de uma sequência ruim, uma camada de moderação que acompanha as contagens erradas de cada membro dentro de uma janela de tempo e aplica punições em níveis, banimentos e timeouts da contagem, e regras de cargos sobre quem pode participar. Vários canais podem executar a contagem ao mesmo tempo, cada um com suas próprias configurações.

## Por que usar

- Um jogo comunitário de baixo esforço, que roda sozinho e dá aos membros uma meta compartilhada.
- Servidores grandes podem adicionar um cooldown e a regra de não repetição para que uma pessoa não consiga turbinar a contagem sozinha.
- A equipe pode restaurar a contagem a partir de um ponto de salvamento em vez de discutir sobre quem a quebrou.
- Reincidentes que quebram a contagem de propósito podem ser silenciados ou banidos da contagem automaticamente.

## Como uma contagem é verificada

Quando um membro posta em um canal de contagem, o bot executa estas verificações em ordem:

1. Membros banidos da contagem são totalmente ignorados.
2. Membros com um cargo banido, sem um dos cargos necessários ou com um cargo ignorado são pulados. As mensagens de cargos ignorados são excluídas, se você pediu isso.
3. Se a mensagem parecer um número válido, o bot testa se consegue reagir a ela. Se a reação falhar, o bot entende que o membro bloqueou o bot, exclui a mensagem e posta um aviso curto que desaparece depois de cinco segundos.
4. Um membro ainda em **Intervalo** é rejeitado.
5. Se **Permitir usuários repetidos** estiver desativado e o mesmo membro tiver contado por último, a mensagem é rejeitada.
6. O texto é interpretado com o padrão do canal. Tudo o que não for um número é tratado pelas regras de não números abaixo.
7. O número precisa ser igual ao número atual mais o **Incremento**. Um número errado conta como erro para esse membro e, se **Zerar a contagem em caso de erro** estiver ativado, o canal volta ao número inicial.
8. Se **Número Máximo** estiver definido e o número o ultrapassar, a contagem para e a equipe é notificada.

Uma contagem correta atualiza o canal, as estatísticas e a sequência do membro, inicia o cooldown dele, verifica os marcos e registra o evento.

As contagens bem-sucedidas recebem a reação **Emote de Sucesso** (uma marca de verificação por padrão) e as falhas recebem o **Emote de Erro** (um X por padrão). Ambos podem ser um emoji padrão ou um emote personalizado.

## Padrões de contagem

O padrão decide como os membros devem escrever os números. O bot interpreta estes padrões:

| Padrão | Os membros digitam |
| --- | --- |
| Normal | Dígitos simples: `1`, `2`, `3`. Com uma **Base Numérica** diferente de 10, os dígitos são lidos nessa base. |
| Roman | Algarismos romanos: `I`, `II`, `III`, `IV` |
| Binary | `1`, `10`, `11`, `100` |
| Hexadecimal | `1` a `9`, depois `A`, `B`, `C` |
| Words | Palavras escritas, como `twenty-one` ou `one hundred and five` |
| Ordinal | `1st`, `2nd`, `3rd`, `4th` |
| Fibonacci | A sequência de Fibonacci: `1`, `1`, `2`, `3`, `5`, `8` |
| Primes | Apenas números primos: `2`, `3`, `5`, `7`, `11` |

Normal é o padrão. O padrão de contagem é definido no painel; não há comando para isso.

> [!WARNING]
> O menu suspenso **Padrão de Contagem** do painel atualmente lista Sequencial, Pular Múltiplos, Fibonacci, Primos e Potências de Dois, e seus valores não correspondem à lista de padrões do bot acima. Por enquanto, apenas Sequencial (Normal) é seguro de escolher no painel.

## Marcos

O bot registra um marco na primeira vez em que a contagem cai em um múltiplo de 100, 500, 1.000, 5.000 ou 10.000. Os marcos aparecem na aba **Estatísticas** e em `countingstatus`.

A aba **Gerenciamento** do painel e `countingmilestones` permitem armazenar uma lista personalizada de números de marcos por canal, a mesma aba e `countingmilestonemessage` armazenam uma mensagem de marco, e `countingmilestonechannel` armazena um canal de anúncio de marcos. Esses valores são armazenados, mas o bot ainda não posta um anúncio de marco, então trate-os como reservados para uma versão futura.

## Estatísticas e rankings

Cada membro tem estatísticas por canal: contribuições, sequência atual, maior sequência, precisão, erros, total de números contados e última contribuição. `countingstats` as mostra com a posição do membro.

`countingleaderboard` e a aba **Ranking** ordenam por um de quatro tipos:

| Tipo | Classificado por |
| --- | --- |
| `contributions` | Número de contagens corretas (padrão) |
| `streak` | Maior sequência |
| `accuracy` | Contagens corretas como porcentagem |
| `totalnumbers` | Total de números contados |

O comando mostra os 20 primeiros, dez por página.

## Pontos de salvamento

`countingsave` armazena o número atual com um motivo opcional e lhe dá um ID de salvamento. `countingrestore <id>` coloca o canal de volta nesse número após uma solicitação de confirmação. `countingreset` define a contagem diretamente para qualquer número, com confirmação, e usa 0 por padrão. Os três também estão na aba **Gerenciamento**.

## Moderação

A moderação da contagem fica desativada até que você a ative, seja por canal com `countmodenable true` ou em todo o servidor com `countmoddefaults true`. As configurações do canal têm prioridade sobre os padrões do servidor; `countmodreset` volta um canal aos padrões.

Quando ativada, cada número errado é registrado para o membro e somado ao total de contagens erradas dele durante a **janela de tempo** (padrão 24 horas, de 1 a 168). As punições em níveis são disparadas quando o total de um membro atinge um número exato: `countmodpunish 3 Mute 30` silencia por 30 minutos na terceira contagem errada. Os níveis definidos com um canal valem para esse canal; os níveis definidos sem canal são padrões do servidor, e os níveis do canal prevalecem. `Softban`, `Kick` e `RemoveRoles` não aceitam duração, e as durações são limitadas a 49 dias. `AddRole` exige um cargo.

Duas regras extras só valem quando a moderação está ativada:

- **Não números**: `countmodnonnumbers` decide se as mensagens de conversa no canal são excluídas (padrão sim) e se contam como violação (padrão não).
- **Edições**: `countmodedits` decide se editar uma mensagem no canal a exclui (padrão sim) e se isso conta como violação (padrão não).

Regras de cargos: **Cargos necessários** significa que um membro precisa de pelo menos um deles para contar, **Cargos Banidos** bloqueia membros que tenham qualquer um deles, e `countmodignore` pula os membros com os cargos listados e, opcionalmente, exclui as mensagens deles.

`countingban`, `countingtimeout` e `countingunban` bloqueiam um único membro de um canal, de forma permanente ou por uma duração. A aba **Gerenciamento** tem os mesmos controles por ID de usuário, além de um botão **Apagar tudo** que equivale a `countingdisable` com limpeza.

## Configurações

O painel tem cinco abas: **Canais**, **Configuração**, **Estatísticas**, **Ranking** e **Gerenciamento**. Escolha primeiro um canal em **Canais**; as outras abas agem sobre esse canal.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Número Inicial | 1 | O número em que a contagem começa, definido na configuração inicial |
| Incremento | 1 | Quanto cada contagem soma; deve ser positivo |
| Padrão de Contagem | Normal | Como os números são escritos, veja acima |
| Base Numérica | 10 | Base usada pelo padrão Normal |
| Cooldown (segundos) | 0 | Espera entre duas contagens do mesmo membro, de 0 a 300 |
| Número Máximo | 0 (ilimitado) | A contagem para quando este valor é ultrapassado |
| Emote de Sucesso | marca de verificação | Reação a uma contagem correta |
| Emote de Erro | X | Reação a uma contagem errada |
| Permitir usuários repetidos | Desativado | Deixa um membro contar duas vezes seguidas |
| Zerar a contagem em caso de erro | Desativado | Um número errado volta o canal ao início |
| Excluir mensagens erradas | Ativado | Exclui os números errados após dois segundos |
| Ativar conquistas | Ativado | Opção armazenada, exibida em `countingconfig` |
| Ativar competições | Ativado | Opção armazenada, exibida em `countingconfig` |
| Cargos necessários | nenhum | Os membros precisam de um destes para contar |
| Cargos Banidos | nenhum | Membros com estes não podem contar |

> [!NOTE]
> O comando `countingfailurethreshold` armazena um valor de 1 a 10 (padrão 3) e `countmodthreshold` armazena um limite de contagens erradas, mas as punições só são disparadas pelos níveis que você define com `countmodpunish`.

## Passo a passo de configuração

1. Crie um canal e dê ao bot Ver Canal, Enviar Mensagens, Adicionar Reações, Gerenciar Mensagens e Ler o Histórico de Mensagens nele.
2. Abra **Contagem** no painel, escolha o canal em **Configurar Novo Canal de Contagem**, defina o **Número Inicial** e o **Incremento** e salve.
3. Em **Configuração**, defina um **Intervalo** se quiser deixar o jogo mais lento, e escolha os emotes.
4. Opcionalmente, adicione **Cargos necessários** ou **Cargos Banidos**.
5. Se quiser punições automáticas, execute `countmodenable true` no canal e adicione níveis com `countmodpunish`.
6. Poste `1` de uma conta e `2` de outra para confirmar que as reações funcionam.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `countingsetup [#channel] [start] [increment]` | `csetup`, `countsetup` | Gerenciar Canais | Inicia a contagem em um canal |
| `countingstatus [#channel]` | `cstatus`, `countstatus` | Qualquer pessoa | Número atual, recorde, totais e regras ativas |
| `countingconfig [#channel]` | `cconfig`, `countconfig` | Gerenciar Canais | Mostra a configuração do canal |
| `countingreset [#channel] [number] [reason]` | `creset`, `countreset` | Gerenciar Mensagens | Zera a contagem, padrão 0, com confirmação |
| `countingstats [@user] [#channel]` | `countstats` | Qualquer pessoa | Estatísticas de contagem e posição de um membro |
| `countingleaderboard [type] [#channel]` | `cleaderboard`, `countleaderboard`, `clb` | Qualquer pessoa | Top 20 por contributions, streak, accuracy ou totalnumbers |
| `countingsave [#channel] [reason]` | `csave`, `countsave` | Gerenciar Mensagens | Cria um ponto de salvamento |
| `countingrestore <saveId> [#channel]` | `crestore`, `countrestore` | Gerenciar Mensagens | Volta a um ponto de salvamento |
| `countingdisable [#channel] [purge] [reason]` | `cdisable`, `countdisable` | Gerenciar Canais | Para a contagem; `true` também apaga todos os dados |
| `countinglist` | `clist`, `countlist` | Gerenciar Canais | Lista os canais de contagem ativos |
| `countingban <@user> [#channel] [duration] [reason]` | `cban`, `countban` | Gerenciar Mensagens | Bane um membro da contagem, de forma permanente, a menos que uma duração seja informada |
| `countingunban <@user> [#channel] [reason]` | `cunban`, `countunban` | Gerenciar Mensagens | Remove um banimento da contagem |
| `countingtimeout <@user> <duration> [#channel] [reason]` | `ctimeout`, `counttimeout` | Gerenciar Mensagens | Banimento temporário da contagem |
| `countingcooldown [#channel] [seconds]` | `ccooldown`, `countcooldown` | Gerenciar Canais | Mostra ou define o cooldown, de 0 a 300 |
| `countingmilestones [#channel] [50,100,...]` | `cmilestones`, `countmilestones` | Gerenciar Canais | Mostra, define ou, com `-`, redefine os números de marcos personalizados |
| `countingsuccessmessage [#channel] [text]` | `csuccessmessage`, `countsuccessmessage` | Gerenciar Canais | Armazena um modelo de sucesso, `-` redefine |
| `countingfailuremessage [#channel] [text]` | `cfailuremessage`, `countfailuremessage` | Gerenciar Canais | Armazena um modelo de falha, `-` redefine |
| `countingmilestonemessage [#channel] [text]` | `cmilestonemessage`, `countmilestonemessage` | Gerenciar Canais | Armazena um modelo de marco, `-` redefine |
| `countingmilestonechannel [#counting] [#target]` | `cmilestonechannel`, `countmilestonechannel` | Gerenciar Canais | Armazena um canal de marcos, nenhum para limpar |
| `countingfailurechannel [#counting] [#target]` | `cfailurechannel`, `countfailurechannel` | Gerenciar Canais | Armazena um canal de registro de falhas, nenhum para limpar |
| `countingfailurethreshold [#channel] [1-10]` | `cfailurethreshold`, `countfailurethreshold` | Gerenciar Canais | Mostra ou define o limite de falhas |
| `countmodshow [#channel]` | `cmshow`, `countmoderationshow` | Gerenciar Canais | Mostra a configuração de moderação e os padrões do servidor |
| `countmoddefaults <on/off> [threshold] [hours] [punishment] [minutes] [@role]` | `cmdefaults`, `countmoderationdefaults` | Administrador | Padrões de moderação de todo o servidor |
| `countmodenable <on/off> [#channel]` | `cmenable`, `countmoderationenable` | Gerenciar Canais | Ativa ou desativa a moderação de um canal |
| `countmodthreshold <1-100> [#channel]` | `cmthreshold`, `countmoderationthreshold` | Gerenciar Canais | Define o limite de contagens erradas do canal |
| `countmodwindow <1-168> [#channel]` | `cmwindow`, `countmoderationwindow` | Gerenciar Canais | Horas em que uma contagem errada permanece registrada |
| `countmodpunishment <action> [minutes] [@role] [#channel]` | `cmpunishment`, `countmoderationpunishment` | Gerenciar Canais | Define a punição padrão do canal |
| `countmodpunish <count> <action> [minutes] [@role] [#channel]` | `cmpunish`, `countmoderationpunish` | Gerenciar Canais | Punição em um número exato de contagens erradas; sem canal, vale como padrão do servidor |
| `countmodunpunish <count> [#channel]` | `cmunpunish`, `countmoderationunpunish` | Gerenciar Canais | Remove um nível |
| `countmodpunishlist [#channel]` | `cmpunishlist`, `countmoderationpunishlist` | Gerenciar Canais | Lista os níveis |
| `countmodignore <delete> [#channel] [@roles...]` | `cmignore`, `countmoderationignore` | Gerenciar Canais | Cargos que o bot ignora, opcionalmente excluindo as mensagens deles |
| `countmodrequired [#channel] [@roles...]` | `cmrequired`, `countmoderationrequired` | Gerenciar Canais | Cargos necessários para contar |
| `countmodbanned [#channel] [@roles...]` | `cmbanned`, `countmoderationbanned` | Gerenciar Canais | Cargos que não podem contar |
| `countmodnonnumbers <punish> [delete] [#channel]` | `cmnonnumbers`, `countmoderationnonnumbers` | Gerenciar Canais | Regras para conversas no canal |
| `countmodedits <punish> [delete] [#channel]` | `cmedits`, `countmoderationedits` | Gerenciar Canais | Regras para mensagens editadas |
| `countmodreset [#channel]` | `cmreset`, `countmoderationreset` | Gerenciar Canais | O canal volta aos padrões do servidor |
| `countmodclear <@user> [#channel]` | `cmclear`, `countmoderationclear` | Gerenciar Mensagens | Limpa as contagens erradas de um membro |
| `countmodclearall [#channel]` | `cmclearall`, `countmoderationclearall` | Gerenciar Mensagens | Limpa as contagens erradas de todos |

## Dicas e armadilhas

- O bot precisa de Adicionar Reações no canal. Sem isso, nada recebe a marca de verificação ou o X, e as contagens válidas são puladas pelo teste de bloqueio do bot.
- Excluir números errados e conversas que não sejam números exige Gerenciar Mensagens.
- Membros que bloquearam o bot não conseguem contar: o número deles é excluído e um aviso é postado.
- Com a regra padrão de não repetição, um membro que posta duas vezes seguidas é rejeitado antes mesmo de o número ser lido, e essa rejeição não conta como erro.
- **Zerar a contagem em caso de erro** volta ao número inicial, então, com início em 1, o próximo número esperado é 1 novamente.
- As punições de moderação usam as mesmas ações do sistema de avisos (Mute, Ban, Kick, AddRole e assim por diante), então o bot precisa das permissões do Discord correspondentes e de um cargo de silenciamento.
- `countingdisable` com limpeza remove estatísticas, banimentos e pontos de salvamento desse canal e não pode ser desfeito. Desativar sem limpeza mantém os dados.

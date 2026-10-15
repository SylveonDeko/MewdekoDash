---
title: Administração
slug: administration
summary: Proteção automática contra raid, spam, contas alternativas, golpes e honeypot, cargos entregues na entrada ou escolhidos pelos membros, exceções de permissões do Discord para comandos e as operações em massa que você usa nos dias ruins.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Administration
tags: [admin, anti-raid, anti-spam, anti-alt, anti-pattern, anti-mass-mention, anti-mass-post, honeypot, anti-image-hash, scam images, external apps, user apps, reaction roles, self-assignable roles, auto-assign roles, auto-ban roles, voice channel roles, permission overrides, dpo, mass ban, prune, server recovery, staff role, timezone, cooldowns, administração, proteção, anti-golpe, imagens de golpe, apps externos, cargos por reação, cargos autoatribuíveis, cargos automáticos, banimento automático, cargos de canal de voz, exceções de permissão, banimento em massa, limpeza, recuperação do servidor, cargo da equipe, fuso horário]
related: [moderation, permissions, logging, multigreets, settings, auditlog, rolestates]
---

## O que faz

A Administração é o módulo que mantém um servidor em ordem quando nenhum moderador está de olho. Os sistemas de proteção observam entradas e mensagens e punem automaticamente quando algo parece um raid, uma rajada de spam, uma conta alternativa descartável, uma menção em massa, um link de golpe colado em todos os canais, uma postagem em um canal armadilha ou uma imagem de golpe conhecida. Cada sistema é independente, tem sua própria punição e pode ser ativado e desativado separadamente.

O mesmo módulo cuida da automação de cargos: cargos dados na entrada, cargos que os membros pegam sozinhos com `iam`, cargos por reação, cargos ligados a estar em um canal de voz e cargos armadilha que banem quem os recebe. Ele também permite mudar qual permissão do Discord um comando exige, definir os cargos de equipe e de membro dos quais outros recursos dependem, limitar a frequência de uso de comandos e limpar mensagens de comando.

Para os dias ruins há as operações em massa: banir ou expulsar todos que entraram nos últimos minutos, banir por padrão de nome, por cargo ou por avatar, limpar membros inativos e um fluxo de recuperação do servidor que devolve um cargo de administrador a um dono verificado.

Tudo fica na página **Administração** do painel, em cinco abas: **Visão geral**, **Sistemas de proteção**, **Cargos e permissões**, **Automação e configurações** e **Operações avançadas**. Quase toda configuração também tem um comando.

## Por que usar

- Raids de entrada e ondas de bots chegam às 3h da manhã e você quer que sejam tratados antes de qualquer pessoa acordar.
- Uma conta comprometida está colando o mesmo link de phishing em dez canais.
- Os membros devem poder escolher seus próprios cargos de cor, região ou notificação sem ajuda da equipe.
- Você quer que `ban` funcione para quem tem Gerenciar mensagens em vez de Banir membros, sem mexer nas configurações de cargos do Discord.
- Um comando está sendo usado em excesso no geral e precisa de um cooldown.
- Um administrador desonesto removeu os cargos do dono e você precisa de um caminho de volta.

## Punições

Todo sistema de proteção recebe uma **ação de punição**. Algumas ações também recebem uma **duração** ou um **cargo**.

| Ação | O que acontece |
| --- | --- |
| Mute | Aplica o cargo de mute do servidor (texto e voz) |
| ChatMute | Cargo de mute apenas para texto |
| VoiceMute | Silencia o membro na voz pelo servidor |
| Kick | Remove o membro; ele pode entrar de novo |
| Softban | Bane e desbane imediatamente para apagar mensagens recentes |
| Ban | Bane, ou bane temporariamente se você informar uma duração |
| Timeout | Castigo nativo do Discord; exige uma duração, de no máximo 28 dias |
| AddRole | Adiciona o cargo que você escolher, por exemplo um cargo de quarentena |
| RemoveRoles | Remove todos os cargos |
| Warn | Adiciona um aviso por meio do módulo de Moderação |
| Delete | Exclui a mensagem infratora e nada mais |
| None | Registra a ocorrência e não toma nenhuma ação |

Somente Ban, Mute, ChatMute, VoiceMute, AddRole e Timeout aceitam uma duração; para qualquer outra ação a duração é ignorada. As durações são em minutos. O painel permite até 10080 (uma semana) para Anti-raid, Anti-spam, Anti-menção em massa e Anti-padrão, 1440 (um dia) para Anti-postagem em massa, Anti-postagem em canal e Anti-hash de imagem, e um ano para Anti-alt. As punições são aplicadas uma por segundo a partir de uma fila, e o motivo no registro de auditoria do Discord é algo como "Raiding Protection" ou "ImageHash Protection".

> [!WARNING]
> Anti-raid, Anti-alt e Anti-padrão rodam quando um membro entra e pulam a verificação por completo quando a ação é Warn. Escolha Kick, Ban, Timeout ou um cargo para esses três.

Membros com a permissão de Administrador estão isentos de todas as proteções baseadas em mensagens. Bots são ignorados pelas proteções baseadas em entrada e pelo Anti-spam; os demais têm uma opção **Ignorar bots**.

## Sistemas de proteção

A aba **Sistemas de proteção** mostra um card por sistema com um botão **Ativado** ou **Desativado** e, depois de ativado, um botão **Configurar** que abre as configurações dele. Ativar pelo painel aplica uma configuração inicial; abra **Configurar** e confira a ação antes de confiar nela. A aba **Visão geral** mostra quantos dos sete sistemas estão ativos e lista cada um.

### Anti-raid

Conta os membros que entram dentro de uma janela deslizante. Quando a contagem atinge o **limite de usuários** dentro da **janela** (segundos), todos os contados naquela rajada são punidos juntos. O comando aceita um limite de 2 a 30 e uma janela de 2 a 300 segundos; o painel aceita de 1 a 50 e de 1 a 300. AddRole não é suportado aqui. Bots que entram não são contados.

> [!EXAMPLE]
> `antiraid 10 10 Ban` bane todos quando dez contas entram em dez segundos. `antiraid 10 10 Timeout 1h` aplica um timeout de uma hora a eles.

### Anti-spam

Conta mensagens idênticas consecutivas de um membro, comparadas sem diferenciar maiúsculas de minúsculas. Quando a contagem atinge o **limite de mensagens** (de 2 a 10 pelo comando, de 1 a 20 no painel), o membro é punido e a contagem é zerada. Uma mensagem diferente zera a contagem; cada mensagem contada sai da conta após trinta minutos. Canais da lista de **canais ignorados** são pulados, o que serve para canais de comandos de bots. Use `antispam <count> <action> <role>` com AddRole para entregar um cargo em vez disso.

### Anti-alt

Verifica a idade de toda conta que entra. Contas mais novas que a **idade mínima** (em minutos; `antialt 3d Kick` também funciona) são punidas na hora. Só roda na entrada, então ativá-lo não varre os membros existentes. O valor inicial do painel é 1440 minutos, um dia.

### Anti-menção em massa

Conta menções de usuários e cargos. Uma única mensagem com pelo menos o **limite de menções** é punida imediatamente. Abaixo disso, as menções são somadas por membro durante a **janela de tempo** (segundos), e ultrapassar o **máximo de menções na janela** dispara a punição. **Ignorar bots** decide se as mensagens de bots contam.

### Anti-padrão

Dá uma pontuação a cada novo membro conforme sinais de ser uma conta descartável ou de bot e pune quando a pontuação atinge a **pontuação mínima**. Roda no momento da entrada e analisa a conta, não as mensagens.

| Sinal | Pontos | Configuração |
| --- | --- | --- |
| Conta criada dentro da idade máxima | 5 | **Verificar idade da conta**, **Idade máxima da conta (meses)** |
| Entrou logo após a criação da conta | 10 se menos de uma hora, 7 se menos de seis horas, caso contrário 3 | **Verificar horário de entrada**, **Máximo de horas desde a entrada** |
| Outros membros foram criados na mesma hora | 1 por conta, até 10 | **Verificar criação em lote** |
| A conta aparece como offline ao entrar | 2 | **Verificar status offline** |
| Conta mais nova que o limite de conta nova | 3 | **Verificar contas novas**, **Dias de conta nova** |
| O nome de usuário corresponde a um dos seus padrões regex | 15 | Padrão com **verificar nome de usuário** |
| O nome de exibição corresponde a um dos seus padrões | 12 | Padrão com **verificar nome de exibição** |

Uma correspondência de padrão pune assim que a pontuação acumulada está igual ou acima do mínimo; os outros sinais sozinhos também podem atingi-lo. Os padrões são expressões regulares, comparadas sem diferenciar maiúsculas de minúsculas com o nome em minúsculas. Os valores iniciais do painel são pontuação mínima 15, seis meses, 48 horas, sete dias, com todas as verificações ativadas. No painel, o botão **Padrões** no card abre a lista de padrões, em que cada padrão tem um nome, o regex e as duas caixas de seleção de nome.

Com comandos, `patternadd <regex> [name] [checkUsername] [checkDisplayName]` adiciona um e `patternconfig <setting> <value>` ajusta `accountage`, `maxaccountage`, `jointiming`, `maxjoinhours`, `batchcreation`, `offlinestatus`, `newaccounts`, `newaccountdays` ou `minimumscore`. `patternconfig` sozinho mostra os valores atuais e quantas vezes o sistema foi acionado.

### Anti-postagem em massa

Pega um membro postando o mesmo conteúdo, ou um conteúdo parecido, em vários canais em rápida sucessão, o clássico padrão de "colar o link de golpe em todo lugar" que o Anti-spam não percebe porque as mensagens estão espalhadas.

Para cada membro, o bot guarda as últimas cinquenta mensagens dentro da **janela de tempo** (10 a 600 segundos). Uma mensagem é comparada com as anteriores e conta como semelhante quando é pelo menos 80% parecida pela distância de edição, ignorando maiúsculas e minúsculas. Quando existem mensagens semelhantes em pelo menos o **limite de canais** (2 a 20) de canais distintos, o membro é punido. Mensagens com menos de vinte caracteres são ignoradas.

**Verificar apenas links** vem ativado por padrão: somente mensagens com um link são monitoradas. Usuários, cargos e canais ignorados são respeitados. Por padrão, a mensagem que disparou a proteção é excluída e o membro recebe uma DM explicando o motivo.

### Anti-postagem em canal

Configura **canais honeypot**. Marque um ou mais canais em que membros reais não têm motivo para postar, geralmente escondidos no fim da lista de canais com um nome de aviso. Qualquer pessoa que postar ali é tratada como um bot ou uma conta comprometida: a mensagem é excluída, o autor recebe uma DM e a punição é aplicada. Administradores estão isentos, e você pode adicionar **cargos ignorados** e **usuários ignorados** (por ID).

O bot também mantém um **embed de status** atualizado em um canal de status: o canal em que você executou `antipostchannel` ou, quando ativado pelo painel, o primeiro canal honeypot que pegar alguém. O embed mostra a ação, o número de canais honeypot, o total de capturas e os últimos dez membros pegos.

### Anti-hash de imagem

Bloqueia imagens específicas pela aparência, de modo que um reenvio redimensionado, recomprimido, com brilho alterado, espelhado ou envolto em uma borda ainda seja reconhecido. Cada imagem bloqueada é armazenada como um hash perceptual junto com sua imagem espelhada e, quando tem uma borda sólida, uma cópia sem a borda. Anexos postados (e embeds, se **verificar imagens incorporadas** estiver ativado) recebem o hash da mesma forma e são comparados.

- **Tolerância de correspondência** (0 a 64, padrão 31) é o quanto uma imagem postada pode ser diferente e ainda contar. Diminua se uma imagem inocente for detectada; aumente apenas se golpes passarem.
- **Detectar cópias com borda** remove uma borda sólida de uma imagem postada antes da comparação. Cópias espelhadas são sempre detectadas.
- Imagens simples demais para serem identificadas com segurança nunca são comparadas e nunca são aceitas como bloqueio, porque corresponderiam a imagens sem relação.
- Imagens maiores que 8 MB não são baixadas nem recebem hash. O limite pode ser definido entre 1 e 32 MB pela API, mas nem o card do painel nem um comando o expõem.
- Cada imagem bloqueada pode ter sua própria ação, duração e cargo, substituindo o padrão do sistema. **Apenas excluir** remove a imagem sem punir quem postou.
- Cargos e canais ignorados são pulados; quem postou recebe uma DM por padrão.

**Bloquear imagens de golpe conhecidas** ativa uma lista predefinida que acompanha o bot, atualmente as imagens falsas de cassino cripto e de sorteio do MrBeast que circulam no Discord. O card mostra quantas imagens há na lista e quantas postagens ela pegou no seu servidor.

Para bloquear sua própria imagem no painel, solte ou envie o arquivo, ou cole a URL dele, dê um rótulo, escolha opcionalmente uma ação por imagem e salve. Com comandos, execute `blockimage [action] [name]` anexando a imagem, respondendo a uma mensagem que a contenha ou colando o link. `blockedimages` lista tudo com a contagem de ocorrências, `unblockimage <id>` remove uma e `imagehash` mostra o hash de uma imagem sem bloqueá-la.

> [!TIP]
> Ative primeiro o Anti-postagem em canal e a lista de imagens de golpe conhecidas. Nenhum dos dois gera falsos positivos no chat normal e, juntos, pegam a maior parte da atividade automatizada de golpes.

### Anti-app externo

Os membros podem adicionar apps à própria conta do Discord e usá-los em qualquer servidor, mesmo naquele em que o app nunca foi adicionado. As mensagens desses apps são postadas com o nome do app, então as outras proteções, que olham quem enviou a mensagem, nunca veem o membro por trás. O Anti-app externo lê qual membro executou o app e age sobre ele.

Uma mensagem conta como infração quando:

- menciona pelo menos o **limite de menções** de usuários e cargos (padrão 5), ou menciona everyone ou here,
- contém um link de convite do Discord, enquanto **remover links de convite** estiver ativado,
- ou vem de um membro que executou apps mais vezes que **mensagens de apps permitidas** dentro da janela (padrão 5 em 10 segundos).

Definir um limite como 0 desativa aquela verificação. Quando uma mensagem quebra uma regra, ela é excluída e o membro que executou o app recebe a punição, por padrão um timeout de uma hora. **Apenas excluir** remove a mensagem sem punir ninguém. Apps que foram adicionados ao próprio servidor são deixados em paz, assim como os administradores do servidor.

> [!TIP]
> A permissão **Usar apps externos** do Discord é uma boa parceira disso. Membros sem ela ainda podem usar seus apps, mas só eles veem as respostas. Negue-a para `@everyone` e permita-a para um cargo confiável ou de nível, e contas novas ou descartáveis não conseguirão postar por meio de apps.

## Cargos

Estes cards ficam na aba **Cargos e permissões**.

### Cargos automáticos

Cargos dados a todo membro assim que ele entra, com uma lista separada para bots. Membros que ainda estão concluindo a triagem de membros recebem os cargos depois de aprovados. Se os Estados de Cargos estiverem configurados para pular a atribuição automática para membros com um estado de cargos salvo, os membros que voltam mantêm seus cargos antigos. `autoassignrole <role>` alterna um cargo na lista; execute sem argumentos para ver a lista.

### Cargos autoatribuíveis

Cargos que os membros podem dar a si mesmos com `iam <role>` e largar com `iamnot <role>`. Os cargos são organizados em **grupos** numerados (o grupo 0 é "Sem grupo"), e os grupos podem receber nomes. O **modo exclusivo** é uma opção para o servidor todo: quando está ativado, pegar um cargo de um grupo remove qualquer outro cargo que você tenha desse grupo, o que é ideal para cores ou regiões. Um cargo pode exigir um **nível** mínimo de XP. **Remove as mensagens do iam** exclui o comando e a resposta após três segundos para manter o canal limpo.

### Cargos por reação

Associe emojis a cargos em uma mensagem existente. Os membros clicam no emoji para receber o cargo e o removem para perdê-lo. Cada mensagem pode ser marcada como **Exclusivo**, de modo que um membro possa ter apenas um cargo dela. O Discord permite vinte reações por mensagem, e o painel as conta para você. Adicionar a uma mensagem que já tem cargos por reação amplia a configuração existente.

Com comandos, `reactionroles [messageId] [excl] <role> <emoji> ...` configura os pares; omita o ID da mensagem para usar a mensagem logo acima do seu comando. `reactionroleslist` mostra todas as configurações com um índice, e `reactionrolesremove <index>` exclui uma.

### Cargos de canal de voz

Vincule um cargo a um canal de voz. Os membros recebem o cargo ao entrar no canal e o perdem ao sair. Use para abrir um canal de texto apenas para quem está em uma chamada no momento.

### Cargos de banimento automático

Qualquer cargo desta lista é uma armadilha: no momento em que um membro o recebe, ele é banido. O motivo padrão é "Auto-ban role assigned", a menos que você defina um com `autobanrolereason`. Combine com um cargo por reação em uma mensagem oculta para pegar bots que se autoatribuem cargos. O número de dias de mensagens excluídas segue a configuração de limpeza de banimento do módulo de Moderação.

## Exceções de permissão e permissões de comandos

As **exceções de permissão** substituem a permissão do Discord que um comando normalmente verifica. Adicione uma exceção para `ban` exigindo Gerenciar mensagens e qualquer pessoa com Gerenciar mensagens poderá executá-lo; adicione uma exigindo Administrador e somente administradores poderão. Quando várias permissões são listadas, o usuário precisa de todas. Com comandos, `dpo <command> <permission> [permission...]` define uma, `dpo <command>` sem permissões a remove, `dpol` as lista e `dpor` limpa tudo após uma confirmação. Nomes de chat triggers personalizados também são aceitos.

O card **Permissões de comandos** na mesma aba é o sistema de permissões de comandos baseado em regras: permita ou negue um comando, um módulo ou tudo para um usuário, cargo, canal, categoria ou o servidor inteiro, avaliado de cima para baixo. Ele tem seu próprio artigo, veja `permissions`.

## Configurações do servidor

Estes cards ficam na aba **Automação e configurações**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| **Cargo da equipe** | nenhum | O cargo que os outros recursos tratam como equipe |
| **Cargo de membro** | nenhum | O cargo tratado como "membro"; `prunemembers` pode incluir quem o tem |
| **Fuso horário do servidor** | UTC | Fuso horário usado onde o bot exibe horários locais |
| **Cooldowns de comandos** | nenhum | Limite de frequência por comando em segundos, de 1 a 90.000 |
| **Exceções de permissão** | nenhum | Permissão do Discord que cada comando exige (veja acima) |
| **Canal de voz de jogos** | nenhum | Quando um membro neste canal de voz começa a jogar, o bot o move para o canal de voz cujo nome corresponde ao jogo |
| **Excluir mensagem ao usar comando** | desativado | Exclui a mensagem que invocou o comando depois que ele executa, com exceções por canal de Ativar, Desativar ou Herdar |
| **Estatísticas e privacidade** | participando | Interrompe as estatísticas de uso de comandos neste servidor; **Excluir estatísticas** apaga o que está armazenado |

## Operações avançadas

A aba **Operações avançadas** tem três cards. Toda operação em massa pede confirmação e depois executa sem mais verificações.

### Mensagem de banimento personalizada

A mensagem que um membro recebe por DM quando é banido, criada no editor de embeds. É o mesmo modelo usado pelo comando de banimento do módulo de Moderação.

### Recuperação do servidor

Uma forma de devolver um cargo de Administrador ao dono depois que um administrador comprometido o removeu. Dois segredos são armazenados para o servidor: uma **chave de recuperação** e uma **chave de dois fatores**.

- Executar `/serverrecovery server-recover` como dono do servidor quando nada está configurado gera ambas: uma chave de recuperação enviada a você por DM e um segredo de autenticador exibido como um QR code. Confirme com um código do seu app autenticador para concluir.
- Depois de configurado, qualquer pessoa que executar `/serverrecovery server-recover`, informar a chave de recuperação e em seguida um código válido do autenticador recebe um novo cargo chamado "Recovered Server Owner Role" com Administrador, posicionado logo abaixo do cargo mais alto do bot.
- `/serverrecovery clear-server-recover` exclui as chaves armazenadas após uma confirmação, assim como **Remover configuração de recuperação** no painel.

O card do painel também pode armazenar chaves diretamente: gere ou digite uma chave de recuperação de pelo menos dezesseis caracteres e uma chave de dois fatores. O bot verifica os códigos com essa chave de dois fatores como um segredo de autenticador (TOTP), então informe um segredo base32 que você adicionou a um app autenticador, não uma senha comum.

> [!PERMISSION]
> O próprio bot precisa ter Administrador para a recuperação funcionar, e o cargo mais alto dele deve estar alto o bastante para que um cargo logo abaixo ainda supere as pessoas das quais você está recuperando o servidor.

### Operações em massa

| Operação | O que faz |
| --- | --- |
| **Limpar usuários inativos** | Limpeza de membros do Discord para membros inativos há o número de dias informado (1 a 30) |
| **Banir usuários em massa** | Bane uma lista colada de IDs de usuário com um único motivo; a exclusão de mensagens segue a configuração de limpeza de banimento da Moderação |
| **Renomear usuários em massa** | Define o apelido de todos os membros com um padrão em que `{username}` é substituído pelo nome de usuário, por exemplo `[AFK] {username}`; membros que o bot não pode renomear são pulados |
| **Limpar até a mensagem** | Exclui todas as mensagens depois de um determinado ID de mensagem em um canal, uma por vez |

Os comandos adicionam formas de escolher quem é banido: `banunder 10m` bane todos que entraram nos últimos dez minutos (`-p` mostra a lista antes, `-accage 1d` também exige que a conta tenha menos de um dia), `kickunder` faz o mesmo com uma expulsão, `nameban <regex>` bane nomes de usuário que correspondem a um padrão depois de uma prévia, `baninrole <role>` bane todos que têm um cargo e `banbyhash <avatarHash>` bane todos os membros que usam um determinado avatar. Todos pedem sua confirmação.

## Passo a passo de configuração

1. Abra **Administração** no painel e vá para **Sistemas de proteção**.
2. Ative o **Anti-raid**, pressione **Configurar** e defina um limite e uma janela que combinem com a sua taxa normal de entradas. Escolha Kick ou Ban como ação.
3. Crie um canal oculto no qual só bots postariam, ative o **Anti-postagem em canal** e adicione-o em **Canais honeypot**.
4. Ative o **Anti-hash de imagem** e pressione **Bloquear imagens de golpe conhecidas**.
5. Ative o **Anti-postagem em massa** com os três canais padrão em sessenta segundos e somente links.
6. Em **Cargos e permissões**, adicione seu cargo de membro aos **Cargos automáticos** para usuários normais, configure um grupo de cores com **Adicionar cargo autoatribuível** e depois ative o **modo exclusivo**.
7. Em **Automação e configurações**, defina o **Cargo da equipe**, o **Cargo de membro** e o **Fuso horário do servidor**.
8. Em **Operações avançadas**, configure a **Recuperação do servidor** enquanto tudo está calmo.
9. Confira a **Visão geral**: ela lista todos os sistemas de proteção e se estão ativos.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você tenha alterado). Comandos de proteção executados sem argumentos desativam aquele sistema.

### Proteção

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `antiraid [threshold] [seconds] [action] [duration]` | | Administrador | Configura ou desativa o Anti-raid |
| `antispam [count] [action] [duration or role]` | | Administrador | Configura ou desativa o Anti-spam |
| `antialt [minAge] [action] [duration or role]` | | Administrador | Configura ou desativa o Anti-alt |
| `antimassmention [threshold] [window] [max] [ignoreBots] [action] [duration or role]` | `amm`, `massmention`, `stopmassmention` | Administrador | Configura ou desativa o Anti-menção em massa |
| `antipattern [action] [duration or role]` | `apattern` | Administrador | Configura ou desativa o Anti-padrão |
| `patternadd <regex> [name] [checkUsername] [checkDisplayName]` | `padd` | Administrador | Adiciona um padrão de nome |
| `patternremove <id>` | `premove`, `prem` | Administrador | Remove um padrão pelo ID |
| `patternlist` | `plist` | Administrador | Lista os padrões |
| `patternconfig [setting] [value]` | `pconfig` | Administrador | Mostra ou altera as configurações de pontuação do Anti-padrão |
| `antimasspost [channels] [seconds] [action] [duration]` | | Administrador | Configura ou desativa o Anti-postagem em massa |
| `antipostchannel [action] [duration]` | | Administrador | Configura ou desativa os canais honeypot; o canal atual vira o canal de status |
| `antipostchanneladd <#channel>` | | Administrador | Adiciona um canal honeypot |
| `antipostchannelremove <#channel>` | | Administrador | Remove um canal honeypot |
| `antiimagehash [action] [tolerance] [duration]` | `aih` | Administrador | Configura ou desativa o Anti-hash de imagem |
| `antiexternalapp [action] [mentions] [messages] [duration]` | `aea`, `antiuserapp` | Administrador | Configura ou desativa o Anti-app externo |
| `blockimage [action] [name]` | `banimage` | Administrador | Bloqueia a imagem anexada, respondida ou linkada |
| `unblockimage <id>` | `unbanimage` | Administrador | Remove uma imagem bloqueada |
| `blockedimages` | `blockedimagelist` | Administrador | Lista as imagens bloqueadas com a contagem de ocorrências |
| `imagehash [url]` | | Administrador | Mostra o hash de uma imagem |
| `antiimagehashpreset` | `aihpreset`, `blockcommonscams` | Administrador | Alterna a lista de imagens de golpe conhecidas |
| `antiimagehashignore <role or #channel>` | `aihignore` | Administrador | Alterna a isenção de um cargo ou canal |

### Cargos

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `autoassignrole [role]` | `aar` | Gerenciar cargos | Alterna um cargo na entrada, ou os lista |
| `autoassignbotrole [role]` | `aabr` | Gerenciar cargos | O mesmo para bots |
| `asar [group] <role>` | | Gerenciar cargos | Torna um cargo autoatribuível, opcionalmente em um grupo |
| `rsar <role>` | | Gerenciar cargos | Remove um cargo autoatribuível |
| `lsar` | | Ninguém | Lista os cargos autoatribuíveis por grupo |
| `sargn <group> [name]` | | Gerenciar cargos | Dá nome a um grupo, ou limpa o nome dele |
| `togglexclsar` | `tesar` | Gerenciar cargos | Alterna o modo exclusivo |
| `rolelevelreq <level> <role>` | `rlr` | Gerenciar cargos | Exige um nível de XP para um cargo |
| `adsarm` | | Gerenciar mensagens | Alterna a exclusão das mensagens do `iam` |
| `iam <role>` | | Ninguém | Dá a você um cargo autoatribuível |
| `iamnot <role>` | `iamn` | Ninguém | Remove um |
| `reactionroles [messageId] [excl] <role> <emoji>...` | `rero` | Gerenciar cargos | Configura cargos por reação em uma mensagem |
| `reactionroleslist` | `reroli` | Gerenciar cargos | Lista as configurações de cargos por reação |
| `reactionrolesremove <index>` | `rerorm` | Gerenciar cargos | Remove uma configuração pelo índice |
| `vcrole [voiceChannel] [role]` | | Gerenciar cargos | Vincula um cargo a um canal de voz (o seu atual, se omitido); sem cargo, remove o vínculo |
| `vcrolerm <channelId>` | | Gerenciar cargos | Remove um vínculo pelo ID do canal |
| `vcrolelist` | | Ninguém | Lista os cargos de canal de voz |
| `autobanroleadd <role>` | `abra` | Administrador | Adiciona um cargo armadilha |
| `autobanroleremove <role>` | `abrr` | Administrador | Remove um |
| `autobanrolelist` | `abrl` | Administrador | Lista os cargos armadilha e os motivos |
| `autobanrolereason <role> [reason]` | `abreason` | Administrador | Mostra, define ou limpa o motivo do banimento |
| `setrole <role> <user> [time]` | `sr`, `giverole` | Gerenciar cargos | Dá um cargo, opcionalmente por tempo limitado |
| `removerole <role> <user>` | `rr` | Gerenciar cargos | Remove um cargo |
| `removeallroles <user>` | `rar` | Gerenciar cargos | Remove todos os cargos |
| `createrole [name]` | `cr` | Gerenciar cargos | Cria um cargo |
| `deleterole <role>` | `dr` | Gerenciar cargos | Exclui um cargo |
| `renamerole <role> <name>` | `renr` | Gerenciar cargos | Renomeia um cargo |
| `rolehoist <role>` | `rh` | Gerenciar cargos | Alterna a exibição separada do cargo |
| `rolecolor <role> [color]` | `roleclr` | Ninguém para ver, Gerenciar cargos para definir | Mostra ou define a cor de um cargo |

Os comandos `autobanrole` também estão disponíveis como os comandos de barra `/autobanrole list`, `add`, `remove` e `reason`.

### Permissões e configurações

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `dpo <command> [permission...]` | | Administrador | Define ou remove uma exceção de permissão |
| `dpol` | `dpoli` | Administrador | Lista as exceções |
| `dpor` | | Administrador | Limpa todas as exceções |
| `staffrole [role]` | | Administrador | Mostra ou define o cargo da equipe |
| `staffroledisable` | | Administrador | Limpa o cargo da equipe |
| `memberrole <role>` | | Administrador | Mostra ou define o cargo de membro |
| `delmsgoncmd [list, server, or channel <enable, disable, inherit> [#channel]]` | `dmc` | Administrador | Mostra, alterna ou substitui a exclusão de mensagens de comando |
| `gamevoicechannel` | `gvc` | Administrador | Alterna seu canal de voz atual como o canal de voz de jogos |
| `timezone [id]` | | Ninguém para ver, Administrador para definir | Mostra ou define o fuso horário do servidor |
| `timezones` | | Ninguém | Lista os IDs de fuso horário disponíveis |
| `prefix [new]` | | Ninguém para ver, Administrador para definir | Mostra ou altera o prefixo de comandos |
| `languageset <name>` | `langset` | Administrador | Define o idioma do servidor, ou `default` |
| `langsetdefault [name]` | `langsetd` | Ninguém para ver, Dono do bot para definir | Mostra ou define o idioma padrão de todo o bot |
| `languageslist` | `langli` | Ninguém | Lista os idiomas suportados |
| `guildstatsoptout` | `gstatsoptout` | Administrador | Alterna as estatísticas de comandos para este servidor |
| `deleteguildstatsdata` | `delguildstatsdata` | Administrador | Exclui as estatísticas armazenadas, uma vez por hora |

### Operações em massa e utilitários

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `banunder <time> [-p or -accage <time>]` | | Administrador | Bane todos que entraram dentro do tempo informado |
| `kickunder <time> [-p]` | | Administrador | Expulsa todos que entraram dentro do tempo informado |
| `nameban <regex>` | `nban` | Administrador | Bane membros cujo nome de usuário corresponde, com prévia |
| `baninrole <role> [reason]` | | Administrador | Bane todos que têm um cargo |
| `banbyhash <avatarHash>` | `bbh` | Administrador | Bane todos com um determinado hash de avatar |
| `prunemembers <time> [yes]` | `memberprune` | Administrador | Limpa membros inativos há essa quantidade de dias; `yes` inclui o cargo de membro |
| `setnick [user] <nickname>` | | Gerenciar apelidos | Altera o apelido de um membro, ou o do próprio bot |
| `deafen <users...>` | `deaf` | Ensurdecer membros | Ensurdece pelo servidor |
| `undeafen <users...>` | `undef` | Ensurdecer membros | Desfaz isso |
| `creatxtchanl <name>` | `ctch` | Gerenciar canais | Cria um canal de texto |
| `deltxtchanl <#channel>` | `dtch` | Gerenciar canais | Exclui um canal de texto |
| `creatvoichanl <name>` | `cvch` | Gerenciar canais | Cria um canal de voz |
| `delvoichanl <channel>` | `dvch` | Gerenciar canais | Exclui um canal de voz |
| `settopic [topic]` | `st` | Gerenciar canais | Define o tópico do canal atual |
| `setchanlname <name>` | `schn` | Gerenciar canais | Renomeia o canal atual |
| `renamechannel <channel> <name>` | `channelrename` | Gerenciar canais | Renomeia qualquer canal |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Gerenciar canais | Alterna a marcação NSFW no canal atual |
| `edit [#channel] <messageId> <text>` | | Gerenciar mensagens naquele canal | Edita uma das mensagens do bot |
| `delete [#channel] <messageId> [time]` | `del` | Gerenciar mensagens naquele canal | Exclui uma mensagem agora ou após um atraso de até sete dias |
| `setguildavatar [url]` | `sgav`, `setgav` | Gerenciar servidor | Define o ícone do servidor a partir de uma URL ou anexo |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Gerenciar servidor | Define o banner do servidor |
| `setguildbio <text>` | `sgbio`, `setgbio` | Gerenciar servidor | Define a descrição do servidor |

A recuperação do servidor é somente por comando de barra: `/serverrecovery server-recover` e `/serverrecovery clear-server-recover`. A maioria dos outros comandos acima também tem equivalentes de barra em `/protection`, `/administration`, `/channel`, `/purge-members`, `/delmsgoncmd`, `/voice`, `/perm-override` e `/roles`.

### Comandos de logs e boas-vindas

O módulo também contém os comandos de logs (`log`, `logcategory`, `logevents`, `logignore`, `logignorelist`, `commandlogchannel`, todos de Administrador, além do grupo de barra `/log`) e os comandos clássicos de boas-vindas (`greetdm`, `greetdmmsg`, `greetdmtest`, `bye`, `byemsg`, `byedel`, `byetest`, `leavehook`, `boost`, `boostmsg`, `boostdel`, `boosttest`, todos de Gerenciar servidor). Eles estão documentados nos artigos `logging` e `multigreets`.

## Dicas e armadilhas

- O cargo do bot deve ficar acima de qualquer cargo que ele entrega, remove ou em cujos membros aplica banimentos, e ele precisa de Banir membros, Expulsar membros, Gerenciar cargos ou Gerenciar membros (Moderate Members) conforme as punições que você escolher. Ações de mute precisam de um cargo de mute, que o bot cria no primeiro uso.
- Os comandos só aceitam até um dia (`1d`) para as durações de Anti-raid e Anti-spam, e o Timeout nunca pode passar de 28 dias.
- O Anti-spam só conta repetições idênticas. Um membro que envia dez mensagens diferentes rapidamente não é spam para ele; é isso que o Anti-postagem em massa e o Anti-menção em massa cobrem.
- O Anti-postagem em massa com **Verificar apenas links** ativado ignora qualquer coisa sem um link. Desative para pegar copypasta, ao custo de mais falsos positivos em servidores movimentados.
- A verificação de criação em lote do Anti-padrão busca a lista inteira de membros a cada entrada, o que é lento em servidores muito grandes.
- Uma imagem bloqueada adicionada a partir de um hash em vez da imagem em si só pega cópias exatas; adicione-a de novo a partir da imagem para cobrir versões espelhadas e com borda.
- Ativar uma proteção pelo painel aplica valores iniciais. Abra **Configurar** e confirme a ação, principalmente antes de escolher Ban.
- Os comandos de atribuição automática, autoatribuição e cargos por reação recusam cargos iguais ou acima do seu cargo mais alto, a menos que você seja o dono.
- Os cargos por reação são perdidos se a mensagem for excluída; `reactionroleslist` mostra quais configurações apontam para uma mensagem excluída.
- A renomeação em massa atinge todos os membros que o bot pode renomear, incluindo a equipe abaixo do cargo dele. Tenha um plano para renomeá-los de volta.
- `delete` e `edit` só funcionam em mensagens que o bot consegue ver, e `edit` apenas nas mensagens do próprio bot.

---
title: Minecraft
slug: minecraft
summary: Registre seus servidores de Minecraft, publique embeds de status ao vivo que se atualizam sozinhos, receba alertas de online e offline, execute comandos RCON e conecte o chat do jogo, entradas, mortes e progressos ao Discord com o plugin complementar.
icon: fa-server
category: Entertainment
dashboard: /dashboard/minecraft
module: Minecraft
tags: [minecraft, mc, server status, bridge, rcon, whitelist, chat bridge, java, bedrock, geyser, player lookup, skin, status do servidor, ponte, ponte de chat, busca de jogador]
related: [statchannels, logging, utility]
---

## O que faz

A equipe registra um ou mais servidores de Minecraft por nome e endereço. Qualquer membro pode então executar `mcstatus` para ver se o servidor está no ar, seu MOTD, versão, latência e quem está online. Um servidor também pode ser monitorado: o bot publica um embed de status em um canal e o edita em um intervalo, ou escreve a contagem de jogadores no tópico do canal, e avisa quando o servidor cai ou volta.

Se o servidor tiver o RCON ativado, a equipe pode enviar comandos de console e gerenciar a whitelist pelo Discord ou pelo console do painel sem entrar no jogo.

O plugin complementar opcional transforma o vínculo em uma ponte de mão dupla. O chat dos jogadores, entradas, saídas, mortes e progressos são publicados em canais do Discord que você escolher, e as mensagens digitadas no canal da ponte são transmitidas aos jogadores no jogo.

## Por que usar

- Mostrar um embed ao vivo de "quem está online" para que os membros saibam quando vale a pena entrar.
- Avisar a comunidade no instante em que o servidor cai ou volta após uma manutenção.
- Colocar novos membros na whitelist pelo Discord sem abrir o console do servidor.
- Manter os membros que só usam o Discord a par do chat do jogo, mortes e progressos.
- Consultar o UUID ou a renderização da skin de um jogador ao tratar de uma candidatura ou denúncia.

## Tipos de servidor

| Tipo | Porta padrão | Como é consultado |
| --- | --- | --- |
| Java Edition | 25565 | Ping da lista de servidores; o protocolo de query também é usado quando a **Porta de Query** está definida e `enable-query=true` |
| Bedrock Edition | 19132 | Ping do Bedrock |
| Geyser (Java + Bedrock) | 25565 | Ping do Java, marcado como Geyser |

Cada servidor tem um nome que é armazenado em minúsculas, e o primeiro servidor que você adiciona se torna o padrão usado por `mcstatus` sem argumentos. Endereços privados, reservados e de loopback são rejeitados, a menos que o host do bot os tenha permitido.

## Monitorando um servidor

Defina um **Canal de Monitoramento** e o bot consulta o servidor a cada **Intervalo de Monitoramento** minutos (padrão 5, mínimo 1). O que ele faz com o resultado depende do **Modo de Monitoramento**.

| Modo | Comportamento |
| --- | --- |
| Embed (editado no lugar) | Publica um embed de status e o edita a cada ciclo; republica se a mensagem for excluída |
| Tópico do Canal | Escreve uma linha curta de status no tópico do canal, no máximo uma vez a cada cinco minutos |
| Ambos | Faz os dois acima |

Cada ciclo também registra um instantâneo do estado online, da contagem de jogadores, da latência e da versão. A aba **Histórico** do painel mostra esses dados em gráficos ao longo do tempo.

Quando o estado online muda, o bot publica um alerta no canal de monitoramento: por padrão, um embed verde de "ficou online" ou vermelho de "ficou offline", ou os seus próprios modelos de **Alerta de Servidor Online** e **Alerta de Servidor Offline**.

### Placeholders de status

O **Embed de Monitoramento Personalizado** e os dois modelos de alerta passam pelo analisador de embeds e aceitam estes placeholders.

| Placeholder | Valor |
| --- | --- |
| `%mc.server.name%` | O nome registrado |
| `%mc.server.address%` | Nome do host ou IP |
| `%mc.server.port%` | Porta |
| `%mc.online%` | `Online` ou `Offline` |
| `%mc.players.online%` | Contagem atual de jogadores |
| `%mc.players.max%` | Vagas de jogadores |
| `%mc.player.list%` | Nomes dos jogadores online |
| `%mc.motd%` | O MOTD sem os códigos de formatação |
| `%mc.version%` | Versão informada |
| `%mc.latency%` | Ping, por exemplo `42ms` |
| `%mc.favicon%` | URL do ícone do servidor |
| `%mc.map%` | Nome do mundo, somente protocolo de query |
| `%mc.gamemode%` | Modo de jogo, somente protocolo de query |
| `%mc.software%` | Software do servidor, somente protocolo de query |
| `%mc.plugins%` | Lista de plugins, somente protocolo de query |
| `%mc.query%` | `Yes` se a query estendida respondeu |
| `%mc.geyser%` | `Yes` se o Geyser foi detectado |

## RCON e a whitelist

Ative as **Configurações do RCON** de um servidor e informe a **Porta do RCON** e a **Senha do RCON** do `server.properties`. `mcrcon` então envia qualquer comando de console e retorna a saída. `mcwhitelist` envolve os comandos da whitelist com as ações `add`, `remove`, `list`, `on`, `off` e `reload`. O painel mostra a whitelist como uma lista com botões de adicionar e remover, e a aba **Console** oferece um prompt de comandos para servidores com RCON ativado.

> [!WARNING]
> O RCON dá acesso total ao console. Mantenha `mcrcon` limitado a administradores e trate a senha como qualquer outra credencial do servidor.

## A ponte do plugin complementar

A ponte precisa do plugin MewdekoMC no servidor do jogo: um plugin Paper para o Paper 1.21+ ou um mod NeoForge para o 21.1.x, ambos no Java 21. No painel, abra a seção **Plugin Complementar** do servidor e gere uma chave. Copie a **URL da API** e a **chave da API** para o `config.yml` do plugin (Paper) ou `config/mewdeko-server.toml` (NeoForge), depois reinicie ou execute `/mewdeko reconnect`. A chave só é exibida uma vez; gere uma nova para substituí-la.

Depois de conectado, o plugin transmite eventos por um WebSocket e o bot os direciona para os canais.

| Evento | Vai para | Aparência padrão |
| --- | --- | --- |
| Entrada de jogador | Canal **Entrada/Saída** | Embed verde com o nome e o avatar do jogador |
| Saída de jogador | Canal **Entrada/Saída** | Embed vermelho com o nome e o avatar do jogador |
| Chat | Canal **Ponte de Chat** | `**player**: message` |
| Morte | Canal **Mortes** | Embed cinza com a mensagem de morte |
| Progresso | Canal **Progressos** | Embed verde com o nome do progresso |
| Status do servidor | Lugar nenhum; armazenado como um instantâneo do histórico com TPS e memória | |

Qualquer canal de evento deixado vazio recorre ao **Canal de Monitoramento**. As mensagens enviadas por usuários que não são bots no canal da Ponte de Chat (ou no canal de monitoramento, se nenhum estiver definido) são encaminhadas ao jogo como `[Discord] user: message` por padrão. A configuração do próprio plugin pode desativar cada categoria de evento, e a transmissão do console vem desativada por padrão e não é exibida pelo bot.

### Modelos de eventos da ponte

Cada evento destinado ao Discord pode ter seu próprio modelo em **Modelos de Eventos da Ponte**. Eles aceitam a saída do construtor de embeds, as menções são neutralizadas e estes placeholders são substituídos.

| Modelo | Placeholders |
| --- | --- |
| Entrada de Jogador (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Saída de Jogador (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Mensagem de Chat (Discord) | `%mc.player%`, `%mc.message%`, `%mc.avatar%` |
| Mensagem de Morte (Discord) | `%mc.player%`, `%mc.death.message%`, `%mc.avatar%` |
| Progresso (Discord) | `%mc.player%`, `%mc.advancement%`, `%mc.avatar%` |
| Chat do Discord (formato no jogo) | `%user%`, `%message%`, `%channel%`; use os códigos de cor do Minecraft com o sinal de seção |

## Configurações

A página do Minecraft tem uma aba **Servidores**, uma aba **Adicionar Servidor**, **Histórico**, **Console** e uma aba com o nome do servidor selecionado para editá-lo.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Nome | | Identificador curto usado nos comandos, por exemplo `survival` |
| Endereço | | Nome do host ou IP |
| Porta | 25565 | Porta do jogo; 19132 para Bedrock |
| Tipo de Servidor | Java Edition | Java, Bedrock ou Geyser |
| Porta de Query (0 = porta do jogo) | 0 | Porta do protocolo de query estendido |
| Canal de Monitoramento | nenhum | Canal que recebe o embed de status e os alertas |
| Intervalo de Monitoramento (minutos) | 5 | Com que frequência o servidor é consultado |
| Modo de Monitoramento | Embed | Embed, Tópico do Canal ou Ambos |
| Embed de Monitoramento Personalizado | embed padrão | Seu próprio embed de status usando os placeholders acima |
| Alerta de Servidor Online | embed padrão | Publicado quando o servidor volta |
| Alerta de Servidor Offline | embed padrão | Publicado quando o servidor cai |
| Canais de Eventos | canal de monitoramento | Ponte de Chat, Entrada/Saída, Mortes, Progressos |
| Modelos de Eventos da Ponte | padrões | Modelos por evento listados acima |
| Configurações do RCON | desativado | Chave de ativação, Porta do RCON, Senha do RCON |
| Plugin Complementar | sem chave | Gerar ou revogar a chave da API do plugin e copiar a URL da API |

## Passo a passo de configuração

1. Abra **Minecraft** no painel e vá para **Adicionar Servidor**.
2. Informe um **Nome**, o **Endereço** e a **Porta**, escolha o **Tipo de Servidor** e escolha um **Canal de Monitoramento** e um **Modo de Monitoramento**. Salve.
3. Confira a aba **Servidores**: o cartão de status deve mostrar o servidor online em poucos segundos.
4. Edite o servidor para ativar as **Configurações do RCON** se quiser acesso ao console e à whitelist, e depois teste a aba **Console**.
5. Para a ponte de chat, defina os **Canais de Eventos**, gere uma chave em **Plugin Complementar**, instale o plugin no servidor do jogo e cole a URL e a chave na configuração dele.
6. Entre no jogo e diga algo: deve aparecer no canal da Ponte de Chat, e uma resposta lá deve aparecer no jogo.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado). As versões de barra ficam em `/minecraft`.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `mcstatus [name or address]` | `mcs` | Ninguém | Status do servidor padrão, de um servidor registrado ou de qualquer `host:port` que você digitar |
| `mcadd <name> <address[:port]>` | | Gerenciar servidor | Registrar um servidor; coloque `bedrock:` antes do endereço para Bedrock |
| `mcremove <name>` | `mcrm` | Gerenciar servidor | Excluir um servidor registrado |
| `mclist` | `mcl` | Ninguém | Listar os servidores registrados com tipo, marcador de padrão e canal de monitoramento |
| `mcdefault <name>` | `mcdef` | Gerenciar servidor | Escolher o servidor que `mcstatus` usa por padrão |
| `mcwatch <name> [#channel]` | `mcw` | Gerenciar servidor | Começar a publicar o status em um canal, ou parar sem canal |
| `mcwatchmode <name> <embed, channeltopic or both>` | `mcwm` | Gerenciar servidor | Escolher como o monitoramento mostra o status |
| `mcembed <name> [template]` | `mce` | Gerenciar servidor | Definir um embed de status personalizado, ou `-` para redefinir |
| `mcplayer <username>` | `mcp` | Ninguém | Mostrar o UUID, o avatar e a skin de um jogador |
| `mcskin <username>` | | Ninguém | Mostrar a renderização da skin de um jogador |
| `mcrcon <name> <command>` | | Administrador | Executar um comando de console por RCON |
| `mcwhitelist <name> <action> [player]` | `mcwl` | Gerenciar servidor | `add`, `remove`, `list`, `on`, `off` ou `reload` |

## Dicas e armadilhas

- `mcstatus` tem limite de dez consultas por minuto por servidor do Discord, compartilhado por todos os membros.
- Consultas diretas por endereço com `mcstatus play.example.com:25565` funcionam sem registrar, mas endereços privados e locais são bloqueados.
- O bot precisa de **Gerenciar canais** no canal de monitoramento para o modo Tópico do Canal, e o próprio Discord limita as edições de tópico, então o modo de tópico nunca atualiza com mais frequência que a cada cinco minutos.
- Detalhes estendidos, como mapa, modo de jogo e plugins, só aparecem quando `enable-query=true` está definido no `server.properties` e a **Porta de Query** corresponde.
- Se o embed de monitoramento for excluído, o próximo ciclo publica um novo em vez de falhar.
- As mensagens da ponte neutralizam `@everyone`, `@here` e menções de usuários, então os jogadores não conseguem marcar ninguém no Discord de dentro do jogo.

---
title: Estatísticas de Atividade
slug: serverstats
summary: Mensagens, tempo em voz, jogos e crescimento de membros de todo o servidor, de um membro ou de um canal em qualquer período de até noventa dias, com gráficos, rankings, exportações e opção de sair da coleta.
icon: fa-chart-simple
category: Analytics
dashboard: /dashboard/serverstats
module: ServerStats
tags: [activity, stats, statistics, statbot, voice time, games, presence, lookback, top chatters, charts, member growth, status, snapshots, privacy, opt out, atividade, estatísticas, tempo em voz, jogos, presença, período, principais falantes, gráficos, crescimento de membros, status, capturas, privacidade, sair]
related: [messagestats, statroles, liveboards, statchannels, invites]
---

## O que ele faz

O bot já contava mensagens. As Estatísticas de Atividade acrescentam tempo em voz, jogos e aplicativos, capturas horárias de membros e status, e uma forma de consultar qualquer um deles em um período: o último dia, a última semana, o último mês, até noventa dias, ou todo o período. Tudo está disponível no painel, como comandos, como gráficos, como CSV, e para cargos de estatísticas, quadros ao vivo, relatórios e canais de estatísticas.

## O que é registrado

| Dados | Como |
| --- | --- |
| Mensagens | Cada mensagem contada com um horário, mantida por noventa dias, mais os totais vitalícios por membro e canal |
| Tempo em voz | Um segmento por membro por canal, dividido sempre que a pessoa muda de canal, é silenciada, ensurdecida, começa a transmitir ou liga a câmera; mantido por noventa dias, mais os totais vitalícios |
| Jogos e aplicativos | Um segmento por membro por atividade (jogando, transmitindo, ouvindo, assistindo, competindo), mantido por noventa dias, mais os totais vitalícios. Desativado por padrão |
| Capturas | Contagens de membros, humanos, bots, online, ausentes, Não perturbe, offline e em voz, a cada hora; mantidas por noventa dias |
| Entradas e saídas | Cada entrada e saída com um horário |

Períodos de até noventa dias leem os dados com horário. **Todo o período** lê os totais vitalícios, então continua funcionando depois que os dados de noventa dias expiram.

## Jogos e aplicativos

O rastreamento de jogos fica desligado até você ativá-lo, pois é o rastreador mais pesado. Uma vez ativado, o bot observa a presença de cada membro e registra por quanto tempo dura cada jogo, transmissão, sessão do Spotify ou aplicativo assistido.

- **Verificar atividades** (ativado por padrão) conta apenas as atividades que o próprio Discord atesta: as que têm um ID de aplicativo registrado, o Spotify e as transmissões. Um cliente modificado pode alegar estar jogando qualquer coisa, então atividades com nome simples são ignoradas enquanto essa opção estiver ativa.
- O **filtro de atividades** é uma lista de nomes de jogos que funciona como uma **lista negra** (os jogos listados são ignorados) ou como uma **lista de permitidos** (apenas os jogos listados contam).
- Status personalizados nunca são contados.

## Abas do painel

| Aba | O que mostra |
| --- | --- |
| Visão geral | Mensagens, tempo em voz, falantes, entradas, saídas, crescimento líquido, membros agora, o principal falante, o membro com mais tempo em voz, o canal mais movimentado e o jogo mais jogado, além de gráficos de mensagens, horas em voz, membros, status dos membros e entradas e saídas |
| Rankings | Membros e canais ranqueados por mensagens, tempo em voz ou tempo de jogo, e os principais jogos com número de jogadores, exportáveis em CSV. Clique em um membro, canal ou jogo para abri-lo |
| Membro e Canal | As mensagens de um membro, tempo em voz, posições, totais vitalícios, canais e jogos favoritos; a atividade de um canal e seus principais membros; e **Quem joga** para qualquer jogo |
| Configurações | Cada rastreador, a janela padrão, o cooldown de mensagens, bots, estados de voz que não contam, canais ignorados, cargos e membros, e o filtro de atividades |

## Configurações

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Janela padrão | 14 dias | O que os comandos e a página usam quando nenhum período é informado |
| Cooldown de mensagens | 0 | Segundos entre mensagens contadas de um mesmo membro. Evita que spam infle as contagens |
| Rastrear tempo em voz | ligado | Se os segmentos de voz são registrados |
| Capturas horárias | ligado | Se as contagens de membros e status são coletadas a cada hora |
| Contar bots | desligado | Se as contas de bots são incluídas |
| Rastrear jogos e aplicativos | desligado | Se as atividades de presença são registradas |
| Verificar atividades | ligado | Contar apenas as atividades atestadas pelo Discord |
| Estados de voz que não contam | nenhum | Qualquer um de: auto-silenciado, auto-ensurdecido, silenciado pelo servidor, ensurdecido pelo servidor, canal AFK, sozinho, transmitindo, câmera ligada |
| Canais, cargos e membros ignorados | nenhum | Nada deles é contado |

## Privacidade

Qualquer membro pode executar `statsprivacy` (ou `/serverstats privacy`) para sair. As mensagens, o tempo em voz e o tempo de jogo registrados dessa pessoa são excluídos em todos os servidores que o bot compartilha com ela, e nada novo é registrado até que ela execute o comando novamente para voltar. Administradores do servidor não podem anular isso.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado). Todo comando também existe em `/serverstats`. `days` é o período; 0 significa todo o período, e deixá-lo de fora usa o padrão do servidor.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `serveractivity [days]` | `sstats` | Ninguém | A visão geral do servidor |
| `useractivity [@user] [days]` | `ustats`, `mystats` | Ninguém | As mensagens, o tempo em voz, os rankings, os totais vitalícios, os principais canais e jogos de um membro |
| `channelactivity [#channel] [days]` | `cstats` | Ninguém | A atividade de um canal e seus principais membros |
| `activitytop [Messages/Voice/Activity] [days] [@role]` | `topchatters`, `topvoice` | Ninguém | Ranqueia os membros |
| `activitytopchannels [Messages/Voice] [days]` | `topchannels` | Ninguém | Ranqueia os canais |
| `topgames [days]` | `games` | Ninguém | Os jogos e aplicativos mais jogados |
| `whoplays <game>` | | Ninguém | Quem está em um jogo agora e quem mais o jogou |
| `activitychart [Messages/Voice/Members/Status/Joins/Leaves/Growth/InVoice/Activities] [days]` | `graph` | Ninguém | Uma imagem de gráfico |
| `activityexport [Messages/Voice/Activity] [days]` | | Gerenciar Servidor | Um ranking em CSV |
| `statssettings` | | Gerenciar Servidor | Mostra as configurações |
| `statslookback <days>`, `statscooldown <seconds>` | `lookback` | Gerenciar Servidor | Janela padrão e cooldown de mensagens |
| `statstrackvoice`, `statstracksnapshots`, `statscountbots`, `statstrackactivities`, `statsverifyactivities` | `trackvoice`, `trackgames` | Gerenciar Servidor | Alterna cada rastreador |
| `statsignorevoicestate <state>` | | Gerenciar Servidor | Alterna se um estado de voz conta |
| `statsignore <#channel, @role or @user>`, `statsignored` | | Gerenciar Servidor | Exclusões |
| `statsactivityfiltermode <Whitelist/Blacklist>`, `statsactivityfilter <game>`, `statsactivityfilters` | `gamefilter` | Gerenciar Servidor | O filtro de atividades |
| `statsprivacy` | `optoutstats` | Ninguém | Sair, ou voltar a ser rastreado, em todos os lugares |

## Dicas e armadilhas

- Os gráficos de membros e de status começam a ser preenchidos uma hora depois que as capturas são ativadas; não há histórico anterior a isso.
- O tempo em voz só é contado enquanto o bot está em execução. Uma reinicialização fecha e reabre cada sessão, então nada se perde, mas os limites dos segmentos mudam.
- Excluir um canal oculta o histórico dele de todas as consultas, além de interromper novas contagens, então os números antigos também mudam.
- A contagem de mensagens em si ainda precisa estar ativada (a opção da página Estatísticas de Mensagens) para que os números de mensagens apareçam aqui.
- Nomes de jogos são comparados sem diferenciar maiúsculas de minúsculas no filtro e em `whoplays`.

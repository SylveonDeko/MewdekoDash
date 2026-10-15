---
title: Música
slug: music
summary: Toque músicas do YouTube, Spotify, SoundCloud e por busca em um canal de voz, com fila, playlists salvas, filtros de áudio, um cargo de DJ, texto para fala e scrobbling do Last.fm.
icon: fa-music
category: Entertainment
dashboard: /dashboard/music
module: Music
tags: [music, play, queue, playlist, spotify, youtube, soundcloud, volume, skip, loop, repeat, dj role, filters, bass boost, nightcore, tts, text to speech, lastfm, scrobble, music links, música, tocar, fila, playlists, pular, repetir, cargo de DJ, filtros, texto para fala, links de música]
related: [utility, administration]
---

## O que faz

Um membro entra em um canal de voz e executa `play` com um link ou uma busca. O bot entra, coloca a faixa na fila e começa a tocar. Links do YouTube, YouTube Music, SoundCloud e Spotify são resolvidos diretamente; faixas, álbuns e playlists do Spotify são correspondidos ao YouTube. Uma busca simples mostra até 25 resultados em um menu de seleção para que o membro escolha o que queria.

Todos no canal compartilham uma única fila. Os membros podem vê-la, pular para uma entrada, mover ou remover faixas, embaralhar, repetir uma faixa ou a fila inteira e salvar a fila como uma playlist com nome para carregar de novo depois. Pular é instantâneo para quem tem o cargo de DJ, ou por votação para todos os outros.

A equipe escolhe um canal de música onde vão os avisos de tocando agora e de fila vazia, define o cargo de DJ, o volume padrão e o modo de repetição, e pode ativar filtros de áudio como bass boost ou nightcore. O painel mostra o player ao vivo com uma fila, botões de repetição e alternadores de filtros, e o mesmo feed ao vivo alimenta o app mobile.

Dois extras ficam no mesmo módulo. O texto para fala lê mensagens do chat em voz alta em um canal de voz, com vozes por usuário e uma lista de bloqueio. O Last.fm permite que os membros façam scrobble do que o bot toca e executem comandos no estilo `fm` sobre o que ouvem.

## Por que usar

- Um canal de voz de convivência quer música de fundo à qual qualquer pessoa possa adicionar sem que uma pessoa faça de DJ a noite toda.
- A equipe quer um cargo de DJ para que apenas membros de confiança possam pular instantaneamente, enquanto todos os outros votam.
- Uma comunidade mantém algumas playlists da casa que são carregadas no início de todo evento.
- Um canal de voz tem membros que não podem falar e querem que suas mensagens sejam lidas em voz alta.
- Fãs de música querem um lugar compartilhado para comparar estatísticas do Last.fm e rankings de "quem conhece este artista".

## Tocando e a fila

Você precisa estar em um canal de voz para quase todos os comandos de música. Se o bot já estiver tocando em um canal diferente, os comandos vindos de outro canal são recusados.

`play <link or search>` aceita:

| Entrada | O que acontece |
| --- | --- |
| Link do YouTube ou YouTube Music | Carregado diretamente, incluindo playlists |
| Link do SoundCloud | Carregado diretamente |
| Link de faixa do Spotify | Correspondido a uma faixa do YouTube |
| Link de álbum ou playlist do Spotify | Cada entrada é correspondida ao YouTube e colocada na fila conforme é resolvida, com uma mensagem de progresso |
| Qualquer outra coisa | Pesquisada no YouTube, até 25 resultados em um menu de seleção |

`play <number>` pula para essa posição da fila. `search <query>` lista dez resultados sem colocar nada na fila. `queue` mostra uma visualização paginada, cinco por página, com um menu de seleção para opções por faixa. `nowplaying` mostra a faixa atual com quem a pediu e o provedor.

`songremove <number>` remove uma entrada, `movesong <from> <to>` reordena, `shuffle` embaralha tudo depois da faixa atual e `clearqueue` esvazia a fila e para. `seek mm:ss` pula dentro da faixa atual. `volume 0..100` define o volume e o salva como padrão do servidor.

`loop <type>` define a repetição: `none` (também `off`), `track` (também `song`) ou `queue` (também `all`). Quando a fila termina com a repetição desativada, o bot posta um aviso de fila vazia no canal de música.

### Pular e o cargo de DJ

`skip` encerra a faixa atual imediatamente para quem o executar. `voteskip` conta votos: um membro com o cargo de DJ ou Administrador pula na hora, todos os outros adicionam um voto, e a faixa é pulada quando os votos chegam a 70 por cento dos membros não bots no canal de voz.

Defina o cargo de DJ com `setdjrole @role` ou com o seletor **Cargo de DJ** do painel. Execute `setdjrole` sem cargo para removê-lo.

### Reprodução automática

`autoplay <0..5>` faz o bot adicionar essa quantidade de faixas relacionadas quando a fila acaba, usando recomendações do Spotify. 0 desativa. Isso depende de o bot ter credenciais do Spotify configuradas; se estiverem ausentes, a reprodução automática não faz nada.

## Playlists

`saveplaylist <name>` armazena a fila atual com um nome, por servidor, com você como autor. `loadplaylist <name> [true]` a adiciona à fila, ou substitui a fila se você passar `true`, e começa a tocar se nada estiver tocando. As faixas são resolvidas de novo no YouTube ao carregar, então entradas que não existem mais são puladas silenciosamente. `playlists` as lista com contagem de faixas e autores, e `deleteplaylist <name>` remove uma.

## Filtros de áudio

Os filtros se aplicam ao player em execução e são redefinidos quando ele se desconecta.

| Comando | Efeito |
| --- | --- |
| `bass <0..1>` | Reforça as frequências graves; 0 desativa |
| `nightcore [on/off]` | Mais rápido e mais agudo |
| `vaporwave [on/off]` | Mais lento e mais grave |
| `karaoke [on/off]` | Suprime os vocais centralizados |
| `tremolo [on/off]` | Oscilação de volume |
| `vibrato [on/off]` | Oscilação de tom |
| `eightd [on/off]` | Gira o som ao redor do ouvinte |
| `distortion [on/off]` | Distorção |
| `stereowiden [on/off]` | Alarga a imagem estéreo |

`activefilters` lista o que está ativado e `resetfilters` limpa todos. O card **Tocando agora** do painel tem botões alternadores para bass boost, nightcore, vaporwave, karaoke, tremolo, vibrato, rotação 8D e distorção.

## Conversão de links de música

Nos canais em que está ativada, postar um link do Apple Music, Spotify, YouTube Music, YouTube, Amazon Music, Deezer, Tidal, Pandora ou SoundCloud gera uma resposta com um embed com o título, o artista e a arte da faixa, além de links para a mesma faixa nos outros provedores. Alterne um canal com `musiclinkchannel [#channel]` (Gerenciar servidor) e liste-os com `musiclinkchannels`. No painel, esta é a seção **Conversão de links de música** na aba Configurações de música.

## Texto para fala

O TTS lê mensagens em voz alta em um canal de voz em que o bot está. A equipe o ativa por canal de voz; mensagens de membros nesse canal de voz, digitadas no chat de texto do canal de voz ou em um canal de texto vinculado, entram na fila e são faladas. A música baixa para 15 por cento enquanto uma linha é lida e volta depois. A fila comporta 10 mensagens por padrão.

Os membros escolhem a própria voz com `ttsvoice <name>` e navegam com `ttsvoices [search]`. A equipe define uma voz padrão, velocidade (0,5 a 3,0 no painel, 0,5 a 2,0 por comando), volume, um cargo necessário, anúncios de entrada e saída com formatos próprios e pode bloquear usuários individuais. A aba **Configurações de TTS** do painel tem os mesmos controles, divididos em **Configurações gerais de TTS**, **Comportamento do TTS**, **TTS do canal de voz** e **Usuários bloqueados do TTS**.

## Last.fm

Os membros vinculam uma conta do Last.fm pela página `/me` do painel (`lastfmlink` posta o botão). Depois de vinculada, as faixas que o bot toca por pelo menos 30 segundos recebem scrobble na conta; `lastfmtoggle` pausa isso e `lastfmstatus` mostra o estado. A família de comandos `fm` passa então a funcionar para qualquer pessoa com uma conta vinculada: faixas recentes, principais artistas, álbuns e faixas por período, consultas de artista e álbum, rankings de quem conhece em todo o servidor, coroas, comparação de gosto e colagens em gráficos.

## Configurações

A página do painel tem duas abas, **Configurações de música** e **Configurações de TTS**. A aba de Música também mostra um card **Tocando agora** com o tamanho da fila, botões de embaralhar e limpar, botões de modo de repetição e alternadores de filtros quando o bot está tocando.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Volume padrão | 100 | Volume inicial, de 0 a 100; `volume` também salva aqui |
| Canal de música | Todos os canais | Onde os avisos de tocando agora e de fila são postados |
| Cargo de DJ | Sem cargo de DJ | Cargo que pula instantaneamente e ignora a votação para pular |
| Modo de repetição | Nenhum | Nenhum, Faixa única ou Fila |
| Desconexão automática | Nunca | Nunca, Quando o canal de voz esvaziar, Quando a fila esvaziar ou Qualquer condição |
| Reprodução automática de similares | Desativado | Adiciona faixas relacionadas quando a fila esvazia; o comando permite uma quantidade de até 5 |
| Ativar votação para pular | desativado | Mostra o limite de votos para pular no rodapé do player |
| Limite de votos para pular | porcentagem, de 1 a 100 | Valor exibido; o próprio comando `voteskip` sempre exige 70 por cento |
| Canais de links de música | nenhum | Canais em que links de música recebem um embed entre provedores |
| Volume do TTS | 100 | Volume das linhas faladas |
| Velocidade do TTS | 1.0 | 0,5 a 3,0 |
| Tamanho máximo da fila | 10 | Mensagens de TTS pendentes, de 1 a 50 |
| Voz padrão | padrão do provedor | Voz usada quando um membro não escolheu uma |
| Cargo necessário | Nenhum cargo necessário | Somente membros com este cargo podem usar o TTS; administradores sempre podem |
| Contexto de resposta | desativado | Lê "respondendo a usuário" antes das respostas |
| Narração de anexos | desativado | Anuncia imagens, vídeos e arquivos enviados |
| Agrupamento consecutivo | desativado | Pula o nome quando o mesmo membro envia várias mensagens seguidas |
| TTS do canal de voz | nenhum | Por canal de voz: ativado, canal de texto vinculado, anúncios de entrada e saída e formatos |
| Usuários bloqueados do TTS | nenhum | Membros cujas mensagens nunca são lidas |

> [!NOTE]
> O modo de repetição definido no painel vale a partir do próximo player. `loop` altera o player em execução imediatamente.

## Passo a passo de configuração

1. Confirme que o bot tem Conectar e Falar nos canais de voz que você quer que ele use.
2. Abra **Música** no painel. Defina um **Canal de música** para que os embeds de tocando agora não caiam no chat geral.
3. Escolha um **Cargo de DJ** para as pessoas autorizadas a pular livremente.
4. Defina o **Volume padrão** em torno de 50; 100 é alto.
5. Entre em um canal de voz e execute `play never gonna give you up`, escolha um resultado e depois `queue` e `nowplaying`.
6. Monte uma playlist da casa colocando faixas na fila e executando `saveplaylist chill`.
7. Se quiser TTS, mude para **Configurações de TTS**, adicione o canal de voz em **TTS do canal de voz** e peça aos membros que escolham uma voz com `ttsvoice`.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `join` | `j`, `mv` | Ninguém | Entra no seu canal de voz |
| `leave` | `disconnect`, `d` | Ninguém | Sai e limpa a fila |
| `play <link or search>` | `p`, `start` | Ninguém | Coloca na fila e toca |
| `play <number>` | `p`, `start` | Ninguém | Pula para uma posição da fila |
| `search <query>` | `find` | Ninguém | Lista dez resultados sem tocar |
| `pause` | | Ninguém | Pausa ou retoma |
| `nowplaying` | `np` | Ninguém | Mostra a faixa atual |
| `queue` | `q`, `yq`, `enqueue` | Ninguém | Mostra a fila |
| `skip` | `next`, `n` | Ninguém | Pula a faixa atual |
| `voteskip` | `vskip` | Ninguém | Vota para pular, instantâneo com o cargo de DJ |
| `songremove <number>` | `trackremove`, `srm` | Ninguém | Remove uma entrada da fila |
| `movesong <from> <to>` | `ms`, `move` | Ninguém | Reordena a fila |
| `shuffle` | `playlistshuffle`, `sh`, `plsh` | Ninguém | Embaralha as próximas faixas |
| `clearqueue` | `cq` | Ninguém | Esvazia a fila e para |
| `volume <0..100>` | `vol` | Ninguém | Define e salva o volume |
| `seek <mm:ss>` | | Ninguém | Pula dentro da faixa atual |
| `loop <none|track|queue>` | `queuerepeat`, `qrp`, `rpl` | Ninguém | Define o modo de repetição |
| `autoplay <0..5>` | `ap` | Ninguém | Faixas relacionadas quando a fila esvazia |
| `setdjrole [role]` | `djrole` | Gerenciar servidor | Define ou limpa o cargo de DJ |
| `setmusicchannel [#channel]` | `smch` | Ninguém | Onde vão os avisos do player |
| `musicsettings` | `msettings` | Ninguém | Mostra reprodução automática, volume, repetição e canal |
| `musiclinkchannel [#channel]` | | Gerenciar servidor | Alterna a conversão de links em um canal |
| `musiclinkchannels` | | Ninguém | Lista os canais de conversão de links |
| `saveplaylist <name>` | `saveplist` | Ninguém | Salva a fila |
| `loadplaylist <name> [clear]` | `loadplist` | Ninguém | Carrega uma playlist, `true` para substituir a fila |
| `playlists` | `playlistshow`, `plshow` | Ninguém | Lista as playlists salvas |
| `deleteplaylist <name>` | `delplist` | Ninguém | Exclui uma playlist |
| `bass [0..1]` | | Ninguém | Bass boost |
| `nightcore [on/off]` | `nc` | Ninguém | Filtro nightcore |
| `vaporwave [on/off]` | `vw` | Ninguém | Filtro vaporwave |
| `karaoke [on/off]` | | Ninguém | Filtro karaoke |
| `tremolo [on/off]` | | Ninguém | Filtro tremolo |
| `vibrato [on/off]` | | Ninguém | Filtro vibrato |
| `eightd [on/off]` | `8d` | Ninguém | Filtro de rotação 8D |
| `distortion [on/off]` | | Ninguém | Filtro de distorção |
| `stereowiden [on/off]` | `swiden` | Ninguém | Alargamento estéreo |
| `resetfilters` | `resetfx` | Ninguém | Limpa todos os filtros |
| `activefilters` | `activefx` | Ninguém | Lista os filtros ativos |
| `lastfmlink` | `lflink` | Ninguém | Obtém o botão de vínculo do Last.fm |
| `lastfmunlink` | `lfunlink` | Ninguém | Remove seu vínculo com o Last.fm |
| `lastfmtoggle` | `lftoggle` | Ninguém | Pausa ou retoma o scrobbling |
| `lastfmstatus` | `lfstatus` | Ninguém | Mostra o estado do seu vínculo com o Last.fm |
| `fm [user]` | | Ninguém | Tocando agora ou último scrobble |
| `fmrecent [user]` | `fmr` | Ninguém | Scrobbles recentes |
| `fmtopartists [period] [user]` | `fmta` | Ninguém | Principais artistas |
| `fmtopalbums [period] [user]` | `fmtal` | Ninguém | Principais álbuns |
| `fmtoptracks [period] [user]` | `fmtt` | Ninguém | Principais faixas |
| `fmartist [artist]` | `fma` | Ninguém | Informações do artista e suas reproduções |
| `fmalbum [query]` | `fmal` | Ninguém | Informações do álbum |
| `fmwhoknows [artist]` | `whoknows`, `wk` | Ninguém | Ranking do servidor para um artista |
| `fmwhoknowsalbum <query>` | `whoknowsalbum`, `wka` | Ninguém | Ranking do servidor para um álbum |
| `fmwhoknowstrack <query>` | `whoknowstrack`, `wkt` | Ninguém | Ranking do servidor para uma faixa |
| `fmcrowns [artist]` | `crowns` | Ninguém | Coroas de artistas |
| `fmtaste <user>` | `taste` | Ninguém | Compara o gosto com o de alguém |
| `fmchart [size] [period] [user]` | `chart` | Ninguém | Colagem de capas de álbuns |
| `ttsenable` | `tts`, `ttson` | Gerenciar servidor | Ativa o TTS no seu canal de voz |
| `ttsremove` | `ttsoff` | Gerenciar servidor | Desativa o TTS no seu canal de voz |
| `ttslink [#channel]` | `ttschannel` | Gerenciar servidor | Vincula um canal de texto ao canal de voz |
| `ttsannounce` | `ttsjoinleave` | Gerenciar servidor | Alterna os anúncios de entrada e saída |
| `ttsjoinformat [text]` | `ttsjoin` | Gerenciar servidor | Texto do anúncio de entrada |
| `ttsleaveformat [text]` | `ttsleave` | Gerenciar servidor | Texto do anúncio de saída |
| `ttsvolume <0..100>` | `ttsvol` | Gerenciar servidor | Volume do TTS |
| `ttsspeed <0.5..2>` | | Gerenciar servidor | Velocidade do TTS |
| `ttsdefaultvoice [voice]` | `ttsdefvoice` | Gerenciar servidor | Voz padrão do servidor |
| `ttsvoice [voice]` | | Ninguém | Sua própria voz |
| `ttsvoices [search]` | `ttsvoicelist`, `ttsvoicesearch` | Ninguém | Navega pelas vozes |
| `ttsblock <user>` | `ttsban` | Gerenciar servidor | Alterna o bloqueio de TTS de um membro |
| `ttsblocklist` | `ttsbanlist`, `ttsblocked` | Gerenciar servidor | Lista os membros bloqueados |
| `ttsrole [role]` | | Gerenciar servidor | Exige um cargo para o TTS |
| `ttsreplycontext` | `ttsreply` | Gerenciar servidor | Alterna o contexto de resposta |
| `ttsattachmentnarration` | `ttsattach` | Gerenciar servidor | Alterna a narração de anexos |
| `ttsconsecutivegrouping` | `ttsgroup` | Gerenciar servidor | Alterna o salto de nome em mensagens consecutivas |
| `ttsmaxqueue <1..50>` | `ttsqueue` | Gerenciar servidor | Limite de mensagens de TTS pendentes |
| `ttssettings` | `ttsinfo` | Gerenciar servidor | Mostra as configurações de TTS |

## Dicas e armadilhas

- O bot precisa de Conectar e Falar no canal de voz, e de Enviar mensagens no canal de música para os avisos.
- A maioria dos comandos verifica primeiro se você está em um canal de voz e se é o mesmo em que o bot está.
- O volume de `volume` é salvo como padrão do servidor, então um 10 de madrugada vira o volume inicial de amanhã.
- As playlists do Spotify são convertidas faixa por faixa pela busca do YouTube, então playlists longas demoram e algumas correspondências podem estar erradas.
- As playlists salvas guardam links, não áudio. Se um vídeo for removido do YouTube, a entrada é pulada ao carregar.
- A votação para pular conta apenas humanos no canal. Em um canal com uma pessoa, o seu próprio voto basta.
- O TTS só lê mensagens de membros que estão no canal de voz, então quem está assistindo pelo texto não consegue acioná-lo.

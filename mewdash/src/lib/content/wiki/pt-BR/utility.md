---
title: Utilidades
slug: utility
summary: Uma caixa de ferramentas com ajudantes do dia a dia, de aliases de comandos, citações e lembretes a publicação automática, cargo de transmissão, assistente de IA, contagem de mensagens e repeaters.
icon: fa-wrench
category: Actions
dashboard: /dashboard/utility
module: Utility
tags: [alias, quotes, auto publish, stream role, ai, chatbot, nsfw filter, role monitor, reminder, snipe, repeater, sticky, message count, invites, embed, calculator, userinfo, serverinfo, citações, publicação automática, cargo de transmissão, ia, assistente, filtro nsfw, monitor de cargos, lembrete, contagem de mensagens, convites, calculadora]
related: [repeaters, polls, invites, messagestats, embedbuilder, xp, administration, moderation]
---

## O que ele faz

Utilidades é o módulo que reúne os pequenos recursos que quase todo servidor acaba querendo. Os membros ganham lembretes, citações, rolagem de dados, calculadora, conversão de unidades e comandos de informações sobre usuários, cargos, canais e o servidor. A equipe ganha aliases de comandos, mensagens repetidas, publicação automática para canais de anúncios, um cargo que acompanha os membros enquanto eles transmitem, snipe de mensagens apagadas, contagem de mensagens e rastreamento de convites.

A página **Utilidades** do painel reúne as partes que funcionam melhor em um formulário: aliases, citações, publicação automática, cargo de transmissão, o assistente de IA, o filtro de tags NSFW e o monitor de cargos. Todo o resto funciona apenas por comandos.

Como este módulo é amplo, cada subrecurso abaixo é descrito separadamente. A tabela de comandos no final lista todos os comandos do módulo.

## Por que usar

- Encurte `play youtube` para `yt` em todo o servidor com um alias.
- Mantenha um livro de citações compartilhado, ao qual os membros podem adicionar e do qual podem sortear frases.
- Publique automaticamente para os seguidores cada post do seu canal de anúncios.
- Dê aos membros um cargo "Ao vivo" apenas enquanto eles estiverem transmitindo um jogo específico.
- Poste regras ou um aviso fixo a cada poucos minutos, ou apenas quando o canal estiver ativo.
- Deixe os membros definirem lembretes para si mesmos ou para um canal.
- Execute um assistente de IA em um canal usando a sua própria chave de API.

## Aliases

Um alias é uma palavra-gatilho que o bot reescreve como outro comando antes de executá-lo. `alias yt play youtube` significa que `.yt lofi` é executado como `.play youtube lofi`. O gatilho precisa ser a primeira palavra da mensagem; tudo o que vier depois é anexado ao comando mapeado. Os gatilhos mais longos são verificados primeiro. Executar `alias <trigger>` sem mapeamento remove o alias, e `aliasesclear` remove todos.

No painel, a aba **Aliases** tem os campos **Gatilho do alias** e **Mapeamento do alias**, uma caixa de busca e uma lista da qual você pode excluir itens.

## Citações

Citações são textos curtos arquivados sob uma palavra-chave. `quoteadd <keyword> <text>` armazena uma, `quoteprint <keyword>` (ou `..`) mostra uma citação aleatória dessa palavra-chave, e `quoteshow <id>` mostra uma específica. `quotesearch` busca por palavra-chave e texto, `quoteid` mostra quem adicionou uma citação, e `listquotes` percorre as citações por página, ordenadas por palavra-chave ou data de adição. Qualquer pessoa pode adicionar citações. Uma citação pode ser excluída por quem a adicionou ou por um administrador; excluir todas as citações de uma palavra-chave, exportar para JSON e importar de um anexo JSON exigem Administrador.

A aba **Citações** permite adicionar, editar, buscar e excluir citações.

## Publicação automática

Os canais de anúncios do Discord exigem que cada mensagem seja publicada manualmente. `addautopublish #channel` faz o bot publicar toda nova mensagem nesse canal. Duas listas negras por canal ignoram mensagens: `addpublishblacklist @user #channel` ignora um usuário, e `addpublishblacklist #channel word` ignora qualquer mensagem que contenha essa palavra, sem diferenciar maiúsculas de minúsculas. `getautopublishes` mostra todos os canais com suas listas negras.

A aba **Publicação automática** adiciona canais e gerencia as listas **Ignorar mensagens destes usuários** e **Ignorar mensagens que contenham estas palavras**.

## Cargo de transmissão

`streamrole <fromRole> <addRole>` dá o cargo **addRole** a qualquer membro do cargo **fromRole** enquanto ele estiver transmitindo, e o retira quando ele para. `streamrolekeyword <keyword>` limita o recurso às transmissões cujo título contém a palavra-chave; execute sem palavra-chave para limpar. Membros na lista de permitidos recebem o cargo durante a transmissão mesmo que a palavra-chave não corresponda, e membros na lista negra nunca o recebem. `streamrole` sem argumentos desativa o recurso. Se o bot perder a permissão de gerenciar o cargo, ou se o cargo for excluído, o recurso se desativa sozinho.

A aba **Cargo de transmissão** tem **Cargo elegível**, **Cargo durante a transmissão**, **Palavra-chave no título da transmissão** e listas de **Lista de permitidos** e **Lista negra** por ID de usuário.

## Assistente de IA

O assistente responde a toda mensagem postada em um canal escolhido, mantendo as últimas cinco trocas de cada membro como contexto. Digitar `deletesession` nesse canal limpa a sua própria conversa.

| Configuração | Comando | O que faz |
| --- | --- | --- |
| Canal | `aichannel [#channel] [enabled]` | O único canal em que o assistente escuta |
| Provedor e modelo | `aimodel <OpenAi\|Groq\|Claude> [model]` | Qual API e qual modelo chamar |
| Chave de API | `aikey` | Sua própria chave para esse provedor; ela é armazenada pelo bot e não é exibida novamente |
| Prompt do sistema | `aiprompt <text>` | Instruções que o modelo segue |
| Pesquisa na web | `aiwebsearch <true\|false>` | Permite que o modelo pesquise na web (somente Claude) |
| Webhook | `aiwebhook [name] [avatarUrl]` | Envia as respostas por um webhook com nome e avatar personalizados |
| Embed personalizado | `aicustomembed [template]` | Envolve as respostas em um embed; `%airesponse%` marca onde a resposta entra |

`aiconfig` mostra a configuração atual. A aba **Assistente de IA** tem **Assistente ativado**, **Canal**, **Provedor**, **Modelo**, **Chave de API**, **Prompt do sistema**, **Permitir pesquisa na web** e **Ocultar avisos de "pesquisando na web"**.

> [!WARNING]
> O assistente usa a sua chave de API e a sua fatura. Sem uma chave definida, as mensagens no canal recebem uma resposta de erro.

## Filtro NSFW

A aba **Filtro NSFW** lista as tags bloqueadas nas buscas de imagens do módulo NSFW. Digite uma tag em **Tag a bloquear** para adicioná-la, ou clique em uma para removê-la. O comando correspondente é `nsfwtagbl [tag]`, do módulo NSFW; sem tag, ele lista a lista negra atual.

## Monitor de cargos

A aba **Monitor de cargos** configura o monitor de cargos do módulo Gerenciamento do Servidor, que reage quando um cargo ou permissão marcado como protegido é concedido. Escolha uma **Punição padrão** (apenas reverter a alteração, avisar, remover todos os cargos, silenciar, timeout, expulsar ou banir), adicione cargos e permissões a proteger e liste os **Cargos confiáveis** e **Membros confiáveis** que ficam isentos. Os comandos (`addblacklistedrole`, `addblacklistedpermission`, `whitelistuser`, `whitelistrole`, `setdefaultpunishment`, `listblacklists`) são exclusivos do dono do servidor e ficam em Gerenciamento do Servidor.

## Lembretes

`remind me <time> <message>` envia uma DM mais tarde; `remind here <time> <message>` posta no canal atual; `remind #channel <time> <message>` tem como alvo outro canal e exige Gerenciar Mensagens. O tempo é escrito como `2h30m`, `3 days`, `1w` ou `in 45 minutes`, e pode ser de no máximo 60 dias. `remindlist` mostra seus lembretes com números de índice e `reminddelete <index>` remove um. As menções na mensagem são neutralizadas, a menos que você possa mencionar everyone nesse canal.

## Snipe

O snipe fica desativado até que um administrador execute `snipeset enable`. Depois de ativado, o bot guarda as mensagens apagadas e editadas por 30 dias. `snipe [#channel] [@user]` mostra a mensagem apagada mais recente, `editsnipe` a edição mais recente, e `snipelist` e `editsnipelist` mostram as últimas cinco (ou a quantidade que você informar), filtradas por canal ou usuário.

## Repeaters

Um repeater posta uma mensagem de acordo com uma programação. `repeat <message>` usa um intervalo de cinco minutos; `repeat <interval> <message>` define um entre 5 segundos e 25000 minutos; `repeat <time of day> <message>` é executado uma vez por dia. Cada repeater tem um índice mostrado por `repeatlist`.

| Modo de gatilho | Comportamento |
| --- | --- |
| `timeinterval` | Posta a cada intervalo (padrão) |
| `onactivity` | Posta depois que o canal recebe um número definido de mensagens dentro de uma janela de tempo (`repeatactivity`) |
| `onnoactivity` | Posta quando o canal fica em silêncio durante a janela |
| `immediate` | Posta imediatamente e depois segue o intervalo |
| `aftermessages` | Posta depois de um número definido de mensagens |

Outras opções por repeater: `repeatredun` não posta se a mensagem do repeater já for a última do canal; `repeatschedule <business\|evening\|weekend\|custom>` limita quando ele é executado; `repeatconversation` alterna a detecção de conversa; `repeatpriority` ordena os repeaters de 0 a 100; `repeatthreadonly` e `repeatthreadautosticky` têm como alvo tópicos; `repeatforumtags` restringe posts de fórum por tag; `repeatsuppressnotifications` envia em silêncio; `repeattoggle` pausa.

## Contagem de mensagens e convites

`togglemsgcount` ativa a contagem de mensagens. `usermessages`, `channelmessages`, `servermessages` e `topusers` informam as contagens, `activitygraph` desenha os horários ou dias mais movimentados, e `minmsglength` ignora mensagens menores que um tamanho definido. `resetmessagecounts` limpa as contagens de um usuário, de um canal ou de ambos após confirmação.

O rastreamento de convites registra quem convidou cada membro. `invites`, `whoinvited`, `invitedusers` e `inviteleaderboard` leem os dados. `toggleinvitetracking`, `toggleremoveinviteonleave` e `setminaccountage <days>` os controlam; contas mais novas que a idade mínima não são contadas.

## Configurações

A página do painel é dividida em abas: **Aliases**, **Citações**, **Publicação automática**, **Cargo de transmissão**, **Assistente de IA**, **Filtro NSFW** e **Monitor de cargos**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Gatilho e mapeamento do alias | nenhum | A palavra a reescrever e o comando em que ela se transforma |
| Palavra-chave e texto da citação | nenhum | Uma citação armazenada |
| Canais de publicação automática | nenhum | Canais de anúncios em que o bot publica |
| Ignorar mensagens destes usuários / que contenham estas palavras | nenhum | Listas negras de publicação por canal |
| Cargo elegível | nenhum | Membros que podem receber o cargo de transmissão |
| Cargo durante a transmissão | nenhum | O cargo adicionado e removido |
| Palavra-chave no título da transmissão | qualquer transmissão | Só contam as transmissões cujo título contém este texto |
| Assistente ativado | desativado | Se o canal de IA responde |
| Provedor, Modelo, Chave de API, Prompt do sistema | nenhum | Configuração da IA |
| Permitir pesquisa na web | desativado | Pesquisa na web do Claude |
| Ocultar avisos de "pesquisando na web" | ativado | Suprime as mensagens de status de pesquisa na web do modelo |
| Tags bloqueadas | nenhum | Tags de busca NSFW que são filtradas |
| Punição padrão | usar o padrão | Ação do monitor de cargos |

Snipe, contagem de mensagens, rastreamento de convites, repeaters, lembretes e pré-visualização de links não têm controles no painel.

## Passo a passo de configuração

1. Abra **Utilidades** no painel.
2. Em **Aliases**, adicione um gatilho como `yt` mapeado para `play youtube`. Teste-o no Discord.
3. Em **Publicação automática**, adicione o seu canal de anúncios. Adicione quaisquer usuários de bot ou webhook à lista de ignorados.
4. Em **Cargo de transmissão**, escolha o cargo elegível e o cargo a adicionar, e opcionalmente uma palavra-chave de título. Verifique se o cargo do bot está acima do cargo que ele adiciona.
5. Em **Assistente de IA**, escolha um canal, um provedor e um modelo, cole a sua chave, escreva um prompt do sistema e ative.
6. No Discord, execute `snipeset enable` se quiser o snipe de mensagens apagadas e `togglemsgcount` para as estatísticas de mensagens.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `alias <trigger> [mapping]` | `cmdmap` | Administrador | Adiciona um alias, ou o remove sem mapeamento |
| `aliaslist` | `cmdmaplist`, `aliases` | Qualquer pessoa | Lista os aliases |
| `aliasesclear` | `aliasclear` | Administrador | Remove todos os aliases |
| `quoteadd <keyword> <text>` | `.` | Qualquer pessoa | Adiciona uma citação |
| `quoteprint <keyword>` | `..` | Qualquer pessoa | Citação aleatória de uma palavra-chave |
| `quoteshow <id>` | | Qualquer pessoa | Mostra uma citação pelo ID |
| `quotesearch <keyword> <text>` | `qsearch` | Qualquer pessoa | Encontra uma citação por palavra-chave e texto |
| `quoteid <id>` | `qid` | Qualquer pessoa | Quem adicionou uma citação |
| `listquotes [page] [order]` | `liqu` | Qualquer pessoa | Percorre as citações por páginas |
| `quotedelete <id>` | `qdel` | Qualquer pessoa (as próprias citações) ou Administrador | Exclui uma citação |
| `delallquotes <keyword>` | `daq`, `delallq` | Administrador | Exclui todas as citações de uma palavra-chave |
| `quoteexport` | `qexport` | Administrador | Exporta as citações como JSON |
| `quoteimport` | `qimport` | Administrador | Importa citações de um arquivo JSON anexado |
| `addautopublish <#channel>` | `addautopub`, `aap` | Administrador | Publica automaticamente um canal de notícias |
| `removeautopublish <#channel>` | `removeautopub` | Administrador | Para a publicação automática |
| `addpublishblacklist <@user> <#channel>` ou `<#channel> <word>` | `addpubbl` | Administrador | Ignora um usuário ou uma palavra |
| `removepublishblacklist <@user> <#channel>` ou `<#channel> <word>` | `removepubbl` | Administrador | Remove um item ignorado |
| `getautopublishes` | `getaps` | Administrador | Lista os canais de publicação automática |
| `streamrole [fromRole] [addRole]` | | Gerenciar Cargos | Define o cargo de transmissão, ou o desativa sem cargos |
| `streamrolekeyword [keyword]` | `srkw` | Gerenciar Cargos | Exige uma palavra-chave no título da transmissão |
| `streamroleblacklist <add\|remove> <@user>` | `srbl` | Gerenciar Cargos | Nunca dá o cargo a este membro |
| `streamrolewhitelist <add\|remove> <@user>` | `srwl` | Gerenciar Cargos | Sempre dá o cargo a este membro enquanto ele transmite |
| `aichannel [#channel] [enabled]` | `aic` | Gerenciar Servidor | Define o canal de IA |
| `aimodel <provider> [model]` | `aim` | Gerenciar Servidor | Provedor e modelo |
| `aikey` | `ak` | Administrador | Define a chave de API |
| `aiprompt <text>` | `aip` | Gerenciar Servidor | Prompt do sistema |
| `aiwebsearch <true\|false>` | `aws` | Gerenciar Servidor | Pesquisa na web do Claude |
| `aiwebhook [name] [avatar]` | `aiw` | Administrador | Responde por um webhook, ou desativa sem nome |
| `aicustomembed [template]` | `aice` | Administrador | Modelo de embed para as respostas |
| `aiconfig` | `ac` | Qualquer pessoa | Mostra as configurações de IA |
| `remind <me\|here> <time> <message>` | | Qualquer pessoa | Define um lembrete |
| `remind <#channel> <time> <message>` | | Gerenciar Mensagens | Lembrete em outro canal |
| `remindlist` | `remindl`, `remindlst` | Qualquer pessoa | Seus lembretes |
| `reminddelete <index>` | `remindrm`, `reminddel` | Qualquer pessoa | Exclui um lembrete |
| `snipeset <enable\|disable>` | `setsnipe` | Administrador | Ativa ou desativa o snipe |
| `snipe [#channel] [@user]` | | Qualquer pessoa | Última mensagem apagada |
| `editsnipe [#channel] [@user]` | | Qualquer pessoa | Última mensagem editada |
| `snipelist [#channel] [@user] [amount]` | `slist` | Qualquer pessoa | Mensagens apagadas recentes |
| `editsnipelist [#channel] [@user] [amount]` | `esnipelist` | Qualquer pessoa | Mensagens editadas recentes |
| `repeat [time] [interval] <message>` | | Gerenciar Mensagens | Cria um repeater |
| `repeatlist` | `replst`, `replist`, `repli` | Gerenciar Mensagens | Lista os repeaters |
| `repeatremove <index>` | `reprm` | Gerenciar Mensagens | Exclui um repeater |
| `repeatinvoke <index>` | `repinv` | Gerenciar Mensagens | Posta agora |
| `repeatmessage <index> <message>` | `repmsg` | Gerenciar Mensagens | Altera o texto |
| `repeatchannel <index> [#channel]` | `repchan` | Gerenciar Mensagens | Move-o |
| `repeatredun <index>` | `repred` | Gerenciar Mensagens | Alterna a verificação de redundância |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Gerenciar Mensagens | Modo de gatilho da tabela acima |
| `repeatactivity <index> <messages> <window>` | `repactivity`, `repact` | Gerenciar Mensagens | Limite de atividade |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Gerenciar Mensagens | Prioridade |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Gerenciar Mensagens | Programação por horário do dia |
| `repeatconversation <index>` | `repconversation`, `repconv` | Gerenciar Mensagens | Alterna a detecção de conversa |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Gerenciar Mensagens | Pausa ou retoma |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Gerenciar Mensagens | Fixo em novos tópicos |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Gerenciar Mensagens | Posta apenas em tópicos |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Gerenciar Mensagens | Envia em silêncio |
| `repeatforumtags <index> <action> [tagType] [tags]` | `repforumtags`, `repftags` | Gerenciar Mensagens | Regras de tags de fórum |
| `togglemsgcount` | `togglemessagecount` | Administrador | Ativa ou desativa a contagem de mensagens |
| `minmsglength [length]` | `mmlength`, `minmlength` | Gerenciar Servidor | Ignora mensagens curtas |
| `usermessages [@user]` | `usermsg`, `umsg` | Qualquer pessoa | Estatísticas de mensagens de um membro |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Qualquer pessoa | Estatísticas de mensagens de um canal |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg`, `gmsg` | Qualquer pessoa | Estatísticas de todo o servidor |
| `topusers` | `topu` | Qualquer pessoa | Os dez primeiros por contagem de mensagens |
| `activitygraph [days\|hours]` | `actgraph` | Qualquer pessoa | Gráfico dos horários mais movimentados |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Gerenciar Mensagens | Zera as contagens |
| `invites [@user]` | | Qualquer pessoa | Contagem de convites |
| `whoinvited [@user]` | `invitedby` | Qualquer pessoa | Quem convidou um membro |
| `invitedusers [@user]` | `userinvites` | Qualquer pessoa | Membros que alguém convidou |
| `inviteleaderboard` | `inviteslb` | Qualquer pessoa | Quem mais convida |
| `invitesettings` | `inviteconfig` | Gerenciar Servidor | Mostra as configurações de convites |
| `toggleinvitetracking` | | Gerenciar Servidor | Ativa ou desativa o rastreamento |
| `toggleremoveinviteonleave` | `triol` | Gerenciar Servidor | Desconta os convites quando o convidado sai |
| `setminaccountage <days>` | `inviteminage` | Gerenciar Servidor | Ignora contas novas |
| `joinstats` | `jstats` | Flag beta (`dragon`) | Gráfico de entradas |
| `leavestats` | `lstats` | Flag beta (`dragon`) | Gráfico de saídas |
| `joinstatscolor [r g b]` | `jstatscolor` | Flag beta (`dragon`) | Cor do gráfico de entradas, dourado sem valores |
| `leavestatscolor [r g b]` | `lstatscolor` | Flag beta (`dragon`) | Cor do gráfico de saídas, dourado sem valores |
| `userinfo [@user]` | `uinfo` | Qualquer pessoa | Detalhes do membro |
| `serverinfo [name]` | `sinfo` | Qualquer pessoa | Detalhes do servidor |
| `channelinfo [#channel]` | `cinfo` | Qualquer pessoa | Detalhes do canal de texto |
| `vinfo [channel]` | `voiceinfo` | Qualquer pessoa | Detalhes do canal de voz |
| `rinfo <role>` | `roleinfo` | Qualquer pessoa | Detalhes do cargo |
| `fetch <id>` | | Qualquer pessoa | Busca qualquer usuário pelo ID |
| `avatar [@user]` | `av` | Qualquer pessoa | Avatar, com um botão para o avatar do servidor |
| `banner [@user]` | `userbanner` | Qualquer pessoa | Banner do usuário |
| `userid [@user]` | `uid` | Qualquer pessoa | ID do usuário |
| `roleid <role>` | `rid` | Qualquer pessoa | ID do cargo |
| `channelid` | `cid` | Qualquer pessoa | ID do canal |
| `serverid` | `sid` | Qualquer pessoa | ID do servidor |
| `roles [@user]` | | Qualquer pessoa | Cargos do servidor, ou os cargos de um membro |
| `inrole <role>` | | Qualquer pessoa | Membros com um cargo |
| `inroles <role> <role>` | | Qualquer pessoa | Membros com ambos os cargos |
| `rolepermlist [and\|or] <permissions...>` | `roleperms` | Qualquer pessoa | Cargos que possuem as permissões |
| `channeltopic [#channel]` | `ct` | Qualquer pessoa | Tópico do canal |
| `whosplaying <game>` | `whpl` | Qualquer pessoa | Membros jogando um jogo |
| `emotelist [type]` | | Qualquer pessoa | Emotes do servidor |
| `showemojis <emojis>` | `se` | Qualquer pessoa | Amplia emojis |
| `say [#channel] <text or embed JSON>` | | Gerenciar Mensagens | Fala como o bot |
| `getjson <messageId> [#channel]` | | Gerenciar Mensagens | JSON do embed de uma mensagem |
| `embedsave <name> <json>` | `esave` | Qualquer pessoa | Salva um modelo de embed pessoal |
| `guildembedsave <name> <json>` | `gesave`, `gembedsave` | Gerenciar Mensagens | Salva um modelo de embed do servidor |
| `embedlist` / `guildembedlist` | `elist` / `gelist`, `gembedlist` | Qualquer pessoa | Lista os modelos |
| `embeddelete <name>` / `guildembeddelete <name>` | `edel`, `edelete` / `gedel`, `gembeddelete` | Qualquer pessoa / Gerenciar Mensagens | Exclui um modelo |
| `embedpreview <name>` | `epreview`, `eprev` | Qualquer pessoa | Pré-visualiza um modelo |
| `debugembed <text>` | `embeddebug` | Administrador | Testa a interpretação de embeds |
| `savechat <time> [#channel]` | | Gerenciar Mensagens | Salva um registro do chat e gera um link |
| `calculate <expression>` | `calc` | Qualquer pessoa | Resolve contas matemáticas |
| `calcops` | | Qualquer pessoa | Operações matemáticas disponíveis |
| `plot <function> [start] [end]` | `graphfunction` | Qualquer pessoa | Desenha o gráfico de uma função |
| `sym <expression>` | `symbolicmath` | Qualquer pessoa | Matemática simbólica |
| `convertunits <from> <to> <value>` | `unitconvert`, `units` | Qualquer pessoa | Conversão de unidades |
| `convertlist` | | Qualquer pessoa | Unidades suportadas |
| `convert <format>` | | Qualquer pessoa | Converte um arquivo de mídia anexado |
| `roll <dice>` | | Qualquer pessoa | Rola dados, com suporte à notação de DnD |
| `owoify <text>` | `owo` | Qualquer pessoa | OwOifica um texto |
| `vcheck [url]` | `viruscheck` | Qualquer pessoa | Análise de um link no VirusTotal |
| `traceroute <host>` | `tracert`, `trcrt` | Qualquer pessoa | Traça a rota até um host |
| `pingip <ip> [count]` | | Qualquer pessoa | Faz ping em um endereço, até 10 vezes |
| `previewlinks <yes\|no>` | `plinks` | Administrador | Alterna a pré-visualização de links |
| `verboseerror [true\|false]` | `ve` | Gerenciar Mensagens | Alterna os erros detalhados de comandos |
| `ping` | | Qualquer pessoa | Latência do bot |
| `stats` | | Qualquer pessoa | Estatísticas do bot |
| `invite` | | Qualquer pessoa | Convite do bot e links de suporte |
| `vote` | | Qualquer pessoa | Link de votação |

## Dicas e armadilhas

- Um alias apenas reescreve o texto; o comando mapeado continua sendo executado com as suas próprias verificações de permissão.
- A publicação automática só funciona em canais de anúncios (notícias) do Discord.
- O cargo de transmissão exige que o cargo do bot esteja acima do cargo que ele adiciona. Se ele não conseguir gerenciar o cargo, o recurso se desativa em vez de falhar silenciosamente a cada transmissão.
- O snipe vem desativado por padrão, e snipes com mais de 30 dias são descartados.
- Lembretes com mais de 60 dias são rejeitados.
- O assistente de IA só responde no único canal configurado e ignora bots. Sua memória são as últimas cinco mensagens de cada membro, então conversas longas perdem o contexto inicial.
- A contagem de mensagens precisa ser ativada antes que existam estatísticas; nada é contado retroativamente.
- `joinstats` e `leavestats` podem ser executados uma vez a cada dez segundos.

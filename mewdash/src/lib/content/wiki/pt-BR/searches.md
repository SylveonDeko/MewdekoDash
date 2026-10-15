---
title: Pesquisas
slug: searches
summary: Consulte informações sem sair do Discord, de clima, horário e definições de dicionário a animes, filmes, imagens, perfis do osu!, piadas e GIFs de reação.
icon: fa-magnifying-glass
category: Entertainment
module: Searches
tags: [search, weather, time, define, urban dictionary, wikipedia, google, image search, anime, manga, movie, osu, pokemon, translate, xkcd, meme, reddit, hug, pat, ship, pesquisa, clima, horário, dicionário, imagens, filme, traduzir, abraço, GIF de reação]
related: [streams, feeds, twitch, games, utility]
---

## O que faz

O módulo Pesquisas é um conjunto de comandos de consulta que buscam algo em um serviço externo e postam no canal. Os membros pedem o clima de uma cidade, a hora em algum lugar, a definição de uma palavra, um anime ou filme, um resumo da Wikipedia, um gato aleatório ou um GIF de reação para um abraço ou um tapa. A maioria dos resultados volta como um embed, e pesquisas com muitos resultados são paginadas.

Não há página no painel. Quase todos os comandos estão abertos a todos, e somente o modo automático de tradução precisa de permissão da equipe.

As notificações de streams e os feeds RSS ficam no mesmo módulo do bot, mas têm seus próprios artigos. Veja as páginas de notificações de streams e de feeds para `streamadd`, `feedadd` e afins.

## Por que usar

- Resolva o "que horas são aí para você?" com `time` em vez de fazer contas.
- Confira a previsão antes de um evento com um card interativo de `weather`.
- Consulte um anime, mangá ou personagem enquanto conversa sobre ele.
- Deixe os membros enviarem abraços, carinhos e "toca aqui" como GIFs.
- Traduza uma mensagem na hora, ou traduza automaticamente um canal para uma comunidade internacional.

## Clima e horário

`weather <place>` geocodifica o lugar com o Open-Meteo e mostra as condições atuais: temperatura, sensação térmica, umidade, velocidade do vento e rajadas, pressão, cobertura de nuvens, visibilidade e as máximas e mínimas do dia. Botões e um menu suspenso alternam para a previsão por hora, condições detalhadas por hora e uma visão diária com máxima, mínima e precipitação de hoje e de amanhã.

`time <place>` procura o lugar e mostra a hora atual e o fuso horário. Quando vários lugares correspondem, ele oferece os candidatos para você escolher.

## Palavras e conhecimento

| Comando | Fonte | Resultado |
| --- | --- | --- |
| `define <word>` | Dicionário Pearson | Definição, classe gramatical e uma frase de exemplo |
| `urbandict <term>` | Urban Dictionary | Definições, paginadas |
| `wiki <query>` | Wikipedia | Resumo da primeira página correspondente |
| `wikia <site> <query>` | Uma wiki do Fandom | Resumo dessa wiki |
| `google <query>` | Google, com DuckDuckGo como alternativa | Resultados da web |
| `bible <book> <chapter:verse>` | API da Bíblia | O texto do versículo |
| `resolvetonetags <text>` | integrado | Explica tone tags como `/j` ou `/s` encontradas no texto |
| `translate <langs> <text>` | API de tradução | Texto traduzido; langs é `from>to`, por exemplo `translate en>fr hello` |
| `translangs` | API de tradução | Idiomas que você pode usar |

### Tradução automática

`autotranslate` alterna a tradução automática para o canal atual e exige Administrador. Passe `del` para excluir a mensagem original depois de traduzi-la, ou `nodel` (o padrão) para mantê-la. Cada membro então executa `autotranslang en>fr` para definir o próprio par de idiomas naquele canal, ou `autotranslang` sem nada para removê-lo.

## Mídia e fandom

| Comando | O que você recebe |
| --- | --- |
| `anime <query>` | Resultados de busca de anime com detalhes |
| `manga <query>` | Resultados de busca de mangá |
| `charinfo <name>` | Nomes, descrição e imagem de um personagem |
| `findanime [image]` | Identifica um anime a partir de uma captura de tela pelo trace.moe; anexe uma imagem ou informe uma URL |
| `mal <username or @user>` | Um perfil do MyAnimeList com estatísticas de assistindo, concluídos e outras |
| `movie <title>` | Detalhes do IMDb pelo OMDb |
| `youtube <query>` | Resultados de busca do YouTube |
| `steam <game>` | Link para a página do jogo na loja da Steam |
| `pokemon <name>` | Detalhes de um Pokémon |
| `osu <user> [mode]`, `osu5 <user> [mode]` | Perfil do osu!, ou as cinco melhores jogadas; os modos são standard, taiko, catch e mania |
| `gatari <user> [mode]` | Perfil do osu!Gatari |
| `xkcd [number or latest]` | Uma tirinha do xkcd, aleatória por padrão |

## Imagens

`image <query>` pesquisa no Google e no DuckDuckGo com busca segura estrita e depois passa os resultados por uma verificação de segurança antes de mostrá-los em um embed paginado. Pode ser usado uma vez a cada vinte segundos por membro. `safebooru <tag>` busca uma imagem com a tag no Safebooru. `revimg <url>` e `revav [@user]` fornecem links de busca reversa de imagem no Google, TinEye e Yandex para uma imagem ou um avatar. `color <hex...>` gera amostras de uma ou mais cores hexadecimais.

Imagens aleatórias: `randomcat`, `randomdog`, `randomfood`, `randombird`, `randomneko`, `randomkitsune` e `randomwaifu`. `meme` posta um meme aleatório de um conjunto de subreddits, e `randomreddit <subreddit>` posta uma postagem aleatória de um subreddit depois de verificar que ele não está marcado como NSFW. `memelist` mostra os modelos do memegen e `memegen <template> [text]` monta um. `rip @user` cria uma imagem de lápide com o nome e o avatar da pessoa. `shorten <url>` encurta um link.

## Piadas

`randjoke`, `yomama`, `chucknorris`, `wowjoke` e `magicitem` buscam cada um uma piada ou descrição de item nas respectivas APIs. `catfact` posta um fato sobre gatos.

## Comandos de reação

Estes postam um GIF de anime para a ação. Os direcionados a alguém recebem uma menção: `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold` e `highfive`. Os sobre você mesmo recebem um texto opcional: `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave` e `wink`. Todos também estão disponíveis como comandos de barra.

`ship @user [@user2]` calcula a compatibilidade entre dois membros (ou entre você e um membro) e posta uma imagem de ship com um comentário.

## Configurações

Este módulo não tem página no painel nem configurações por servidor além da opção de tradução automática. Vários comandos dependem de chaves de API que o dono do bot configura; se uma chave estiver ausente, o comando responde com um erro em vez de resultados.

## Passo a passo de configuração

1. Nada precisa ser ativado. Execute `weather London` ou `define serendipity` para confirmar que o bot consegue responder no canal.
2. Se quiser um canal traduzido, execute `autotranslate` lá como administrador e peça aos membros que definam `autotranslang en>es` ou algo parecido.
3. Use o módulo de permissões se quiser restringir os comandos de reação ou de imagem a certos canais.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `weather <place>` | `we` | Ninguém | Card interativo de clima |
| `time <place>` | | Ninguém | Hora atual e fuso horário |
| `define <word>` | `def` | Ninguém | Definição de dicionário |
| `urbandict <term>` | `ud` | Ninguém | Urban Dictionary |
| `wiki <query>` | `wikipedia` | Ninguém | Resumo da Wikipedia |
| `wikia <site> <query>` | `fandom` | Ninguém | Consulta em uma wiki do Fandom |
| `google <query>` | `g` | Ninguém | Pesquisa na web |
| `bible <book> <chapter:verse>` | | Ninguém | Versículo da Bíblia |
| `resolvetonetags <text>` | `tonetag`, `resolvetonetag`, `tonetags` | Ninguém | Explica tone tags |
| `translate <langs> <text>` | `trans` | Ninguém | Traduz texto, por exemplo `translate en>fr hello` |
| `translangs` | | Ninguém | Idiomas suportados |
| `autotranslate [del\|nodel]` | `at`, `autotrans` | Administrador | Alterna a tradução automática do canal |
| `autotranslang [from>to]` | `atl` | Ninguém | Seu par de idiomas para a tradução automática |
| `anime <query>` | `ani`, `aq` | Ninguém | Busca de anime |
| `manga <query>` | `mang`, `mq` | Ninguém | Busca de mangá |
| `charinfo <name>` | `characterinfo` | Ninguém | Consulta de personagem |
| `findanime [image]` | `whatanime` | Ninguém | Identifica um anime a partir de uma captura de tela |
| `mal <username or @user>` | | Ninguém | Perfil do MyAnimeList |
| `movie <title>` | `omdb`, `imdb` | Ninguém | Detalhes de um filme |
| `youtube <query>` | `yt` | Ninguém | Busca no YouTube |
| `steam <game>` | | Ninguém | Link da loja da Steam |
| `pokemon <name>` | | Ninguém | Detalhes de um Pokémon |
| `osu <user> [mode]` | | Ninguém | Perfil do osu! |
| `osu5 <user> [mode]` | | Ninguém | Cinco melhores jogadas do osu! |
| `gatari <user> [mode]` | | Ninguém | Perfil do osu!Gatari |
| `xkcd [number\|latest]` | | Ninguém | Tirinha do xkcd |
| `image <query>` | `img`, `rimg` | Ninguém | Busca segura de imagens |
| `safebooru [tag]` | | Ninguém | Imagem do Safebooru |
| `revimg <url>` | | Ninguém | Links de busca reversa de imagem |
| `revav [@user]` | | Ninguém | Busca reversa de um avatar |
| `color <hex...>` | `clr` | Ninguém | Amostras de cor |
| `randomcat` | `meow` | Ninguém | Foto de gato |
| `randomdog` | `woof` | Ninguém | Foto de cachorro |
| `randomfood` | `yum` | Ninguém | Foto de comida |
| `randombird` | `birb`, `bird` | Ninguém | Foto de pássaro |
| `randomneko` | `neko` | Ninguém | Foto de neko |
| `randomkitsune` | `kitsune` | Ninguém | Foto de kitsune |
| `randomwaifu` | `waifu` | Ninguém | Foto de waifu |
| `meme` | `randommeme` | Ninguém | Meme aleatório do Reddit |
| `randomreddit <subreddit>` | `subreddit` | Ninguém | Postagem aleatória de um subreddit |
| `memelist` | | Ninguém | Modelos do memegen |
| `memegen <template> [text]` | | Ninguém | Monta um meme |
| `rip <@user>` | | Ninguém | Imagem de lápide |
| `shorten <url>` | | Ninguém | Encurta um link |
| `randjoke` | | Ninguém | Piada aleatória |
| `yomama` | `ym` | Ninguém | Piada de "sua mãe" |
| `chucknorris` | `cn` | Ninguém | Piada do Chuck Norris |
| `wowjoke` | | Ninguém | Piada de World of Warcraft |
| `magicitem` | `mi` | Ninguém | Item mágico do WoW |
| `catfact` | | Ninguém | Fato sobre gatos |
| `ship <@user> [@user2]` | | Ninguém | Imagem de índice de compatibilidade |
| `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold`, `highfive <@user>` | | Ninguém | GIF de reação direcionado a alguém |
| `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave`, `wink [text]` | | Ninguém | GIF de reação sobre você mesmo |

## Dicas e armadilhas

- Estes comandos chamam serviços externos, então os resultados dependem de esses serviços estarem no ar e de o dono do bot ter as chaves de API corretas.
- `image` tem limite de uma pesquisa a cada vinte segundos por membro, e os resultados são filtrados por segurança mesmo em canais NSFW.
- `randomreddit` recusa subreddits marcados como NSFW. Use o módulo NSFW para conteúdo adulto.
- A tradução automática é por canal e por membro: o canal precisa ser ativado por um administrador, e cada membro escolhe o próprio par.
- As notificações de streams (`streamadd`, `streamlist`, `streamtemplate`) e os feeds RSS (`feedadd`, `feedlist`) são documentados separadamente, embora compartilhem este módulo.

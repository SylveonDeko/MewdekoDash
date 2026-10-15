---
title: NSFW
slug: nsfw
summary: Comandos de imagens adultas que só funcionam em canais marcados como NSFW, com lista negra de tags por servidor e postagem automática temporizada opcional.
icon: fa-eye-slash
category: Entertainment
module: Nsfw
tags: [nsfw, hentai, booru, rule34, e621, danbooru, gelbooru, nhentai, reddit, tag blacklist, autohentai, nsfwtoggle, conteúdo adulto, lista negra de tags, postagem automática, canal nsfw]
related: [servermanagement, permissions, filter]
---

## O que ele faz

O módulo NSFW busca imagens adultas de galerias de imagens e do Reddit sob demanda. Todo comando do módulo exige a regra NSFW do Discord: ele só funciona em um canal com a marcação NSFW ativada, e a maioria dos comandos de galerias de imagens também funciona em DM com o bot. Em qualquer outro canal, o comando é recusado silenciosamente.

A equipe controla duas coisas. `nsfwtoggle` (no módulo de Administração) alterna a marcação NSFW do canal atual, que é o que libera esses comandos ali. `nsfwtagbl` mantém uma lista de tags que são removidas de todas as buscas em galerias de imagens neste servidor, para que o servidor possa permitir o módulo e ao mesmo tempo excluir conteúdo que não deseja.

Os membros executam um comando de fonte com tags opcionais e recebem uma imagem com sua classificação, fonte e as primeiras tags. As variantes "bomb" postam quatro de uma vez. Moderadores também podem iniciar um temporizador que posta uma nova imagem em um canal a cada certo número de segundos.

## Por que usar

- Um servidor +18 quer que os comandos de imagem fiquem restritos aos seus canais marcados.
- A equipe quer certas tags bloqueadas em todo o servidor sem desativar o módulo.
- Um canal dedicado deve receber uma imagem nova em um temporizador, sem que ninguém precise digitar nada.

## Requisito de canal

A marcação NSFW do Discord é definida por canal. Execute `nsfwtoggle` em um canal para ativá-la ou desativá-la; é preciso ter Gerenciar Canais, e o bot também. O bot responde para confirmar o novo estado. A mesma marcação pode ser definida nas configurações do canal no Discord.

Se um comando for usado em um canal que não é NSFW, nada acontece. Os membros às vezes acham que o bot está com defeito, então uma nota no canal de regras ajuda.

## Fontes

| Comando | Fonte | Observações |
| --- | --- | --- |
| `hentai [tags]` | Galerias combinadas, somente explícito | Cooldown de cinco segundos |
| `yandere`, `konachan`, `sankaku`, `e621`, `rule34`, `danbooru`, `gelbooru`, `derpibooru`, `safebooru`, `realbooru` | A galeria nomeada | Cada um aceita tags opcionais |
| `hentaibomb [tags]` | Yandere, Danbooru, Konachan e Gelbooru | Quatro imagens de uma vez |
| `pornbomb [tags]` | Realbooru | Quatro imagens de uma vez |
| `redditnsfw <subreddit>` | Um post aleatório do topo desse subreddit | Cooldown de dez segundos |
| `boobs`, `butts` | Subreddits fixos através de `redditnsfw` | |
| `pussy`, `anal`, `porn`, `bondage`, `hentaigif` | Endpoints de categoria | Somente canal NSFW, sem DM |
| `nhentai <id>` | Uma galeria específica pelo número | Recusa galerias marcadas como lolicon ou shotacon |
| `nhentaisearch <query> [page] [type] [blacklist]` | Busca de galerias | |

As tags são separadas por espaços. No e621 e no Derpibooru, a tag `yuri` é traduzida automaticamente para a equivalente de cada galeria. Apenas um `hentaibomb` e um `pornbomb` podem ser executados por vez em cada servidor.

## Lista negra de tags

`nsfwtagbl` sem argumento lista as tags da lista negra. `nsfwtagbl <tag>` adiciona a tag ou, se ela já estiver na lista, a remove. Resultados que contenham uma tag da lista negra são ignorados em todos os comandos de galerias de imagens do servidor. Exige Gerenciar Mensagens.

## Postagem automática

`autohentai <seconds> [tags]`, `autoboobs <seconds>` e `autobutts <seconds>` iniciam um temporizador no canal atual. O intervalo deve ser de pelo menos 20 segundos para `autohentai` e `autobutts`; `autoboobs` não impõe um mínimo. Executar o comando com `0`, ou sem intervalo, interrompe o temporizador daquele canal. Para `autohentai`, separe conjuntos alternativos de tags com `|` e o bot escolhe um deles aleatoriamente a cada vez; deixe as tags de fora para imagens aleatórias. Estes comandos exigem Gerenciar Mensagens, e o canal precisa ser NSFW. Os temporizadores não sobrevivem a uma reinicialização do bot.

## Configurações

Este módulo não tem página no painel.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Marcação NSFW do canal | desligado | Se algum desses comandos é executado em um canal |
| Lista negra de tags | vazia | Tags excluídas dos resultados de galerias de imagens neste servidor |
| Temporizadores de postagem automática | nenhum | Temporizadores por canal iniciados com os comandos `auto...` |

## Passo a passo

1. Escolha o canal e execute `nsfwtoggle` nele, ou defina a marcação nas configurações do canal no Discord.
2. Use as Permissões de Comandos para manter o módulo fora de todos os outros lugares, por exemplo `srvrmdl nsfw disable` seguido de `chnlmdl nsfw enable #adult`.
3. Adicione as tags que você não quer com `nsfwtagbl <tag>`, uma por comando.
4. Teste com `hentai` ou `rule34 <tag>` no canal.
5. Opcionalmente, inicie `autohentai 300 <tags>` e pare depois com `autohentai 0`.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Gerenciar Canais | Alterna a marcação NSFW do canal atual |
| `nsfwtagbl [tag]` | `nsfwtbl` | Gerenciar Mensagens | Lista, adiciona ou remove uma tag da lista negra |
| `hentai [tags]` | | Ninguém | Uma imagem explícita das galerias combinadas |
| `hentaibomb [tags]` | | Ninguém | Quatro imagens de quatro galerias |
| `pornbomb [tags]` | | Ninguém | Quatro imagens do Realbooru |
| `yandere [tags]` | | Ninguém | Yande.re |
| `konachan [tags]` | | Ninguém | Konachan |
| `sankaku [tags]` | | Ninguém | Sankaku |
| `e621 [tags]` | | Ninguém | e621 |
| `rule34 [tags]` | `r34` | Ninguém | Rule34 |
| `danbooru [tags]` | | Ninguém | Danbooru |
| `gelbooru [tags]` | | Ninguém | Gelbooru |
| `derpibooru [tags]` | `derpi` | Ninguém | Derpibooru |
| `safebooru [tags]` | | Ninguém | Safebooru |
| `realbooru [tags]` | `rb` | Ninguém | Realbooru |
| `redditnsfw <subreddit>` | `nsfwsubreddit` | Ninguém | Post aleatório de um subreddit |
| `boobs` | | Ninguém | Atalho do Reddit |
| `butts` | `ass`, `butt` | Ninguém | Atalho do Reddit |
| `pussy` | | Ninguém | Imagem de categoria |
| `anal` | | Ninguém | Imagem de categoria |
| `porn` | | Ninguém | Imagem de categoria |
| `bondage` | | Ninguém | Imagem de categoria |
| `hentaigif` | | Ninguém | GIF de categoria |
| `nhentai <id>` | `nh` | Ninguém | Navega por uma galeria pelo número |
| `nhentaisearch <query> [page] [type] [blacklist]` | `nhsearch`, `nhs` | Ninguém | Busca galerias |
| `autohentai [seconds] [tags]` | | Gerenciar Mensagens | Postagem temporizada; `0` para |
| `autoboobs [seconds]` | | Gerenciar Mensagens | Postagem temporizada; `0` para; sem intervalo mínimo |
| `autobutts [seconds]` | | Gerenciar Mensagens | Postagem temporizada; `0` para |

## Dicas e armadilhas

- A restrição por idade é a marcação de canal do Discord somada à lista negra de tags do bot. O bot não verifica a idade nem os cargos dos membros; use as Permissões de Comandos para isso.
- Os donos do bot também podem desativar o módulo globalmente, caso em que ele aparece como bloqueado no menu de ajuda.
- As galerias de imagens impõem limites de requisições e às vezes não retornam nada para combinações de tags muito específicas; o bot responde que nenhuma imagem foi encontrada.
- Os temporizadores são por canal e ficam na memória. Após uma reinicialização, inicie-os novamente.

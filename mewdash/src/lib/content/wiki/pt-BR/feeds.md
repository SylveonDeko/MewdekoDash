---
title: Feeds
slug: feeds
summary: Assine um canal a um feed RSS ou Atom e faça o bot publicar cada novo item, seja como um embed padrão, seja em uma mensagem que você mesmo desenha.
icon: fa-newspaper
category: Actions
dashboard: /dashboard/feeds
module: Searches
tags: [rss, atom, feed, news, blog, youtube, updates, subscriptions, feedadd, notícias, atualizações, assinaturas, feeds]
related: [embedbuilder, utility]
---

## O que ele faz

Você informa ao bot uma URL de feed e um canal. A partir daí, o bot verifica o feed regularmente e publica qualquer item publicado desde a última verificação. Os membros veem uma nova mensagem no canal toda vez que o site publica algo, com o título do item, um link e, quando o feed fornece, a descrição e uma imagem.

A equipe pode assinar até dez feeds por servidor e dar a cada um sua própria mensagem. A mensagem passa pelo interpretador de embeds, então uma atualização do feed pode ser texto simples, um embed ou um embed com botões, e pode usar placeholders que puxam o título, o link, o autor e outras informações do item.

Nada é exigido dos membros. Eles só precisam ler o canal.

## Por que usar

- Publique o blog, as notas de atualização ou o changelog da sua comunidade automaticamente em um canal de anúncios.
- Espelhe o feed de um site de notícias ou de um subreddit em um canal de discussão.
- Acompanhe um canal do YouTube ou um podcast pelo feed RSS.
- Mantenha um feed de status ou de lançamentos visível sem que ninguém precise copiar links manualmente.

## Como as atualizações são publicadas

O bot percorre cada URL de feed assinada, busca o conteúdo e espera cerca de dez segundos antes de iniciar a passada seguinte. Na primeira busca após a inicialização, ele registra a data do item mais recente e não publica nada. Depois disso, todo item com data de publicação mais recente que a última vista é publicado, do mais antigo para o mais novo, e a data registrada avança. Em feeds Atom, a data de atualização do item é usada quando não há data de publicação. Itens sem nenhuma das duas são ignorados.

Não há limite de quantos itens são enviados em uma passada, então um feed que despeja vinte entradas com datas antigas de uma vez vai gerar vinte mensagens.

Feeds que não carregam são ignorados silenciosamente até a próxima passada. Eles não são removidos, e o bot não informa a falha.

### A mensagem padrão

Se um feed não tiver mensagem personalizada, o bot envia um embed com:

| Parte | Valor |
| --- | --- |
| Título | O título do item, cortado em 256 caracteres |
| Descrição | A descrição do item com o HTML removido, cortada em 2048 caracteres |
| URL | O link do item, para que o título seja clicável |
| Imagem | Um anexo de imagem do feed, ou um elemento `preview` ou `thumbnail` do Atom, se houver |
| Rodapé | A URL do feed |

### Mensagens personalizadas e placeholders

Defina uma mensagem personalizada com `feedmessage` ou com o botão **Editar Mensagem** no painel. O texto passa pelo interpretador de embeds, então tudo o que funciona no [criador de embeds](/wiki/embedbuilder) também funciona aqui: texto simples, JSON de embed ou ambos. Menções de cargos e de usuários na parte de texto simples vão notificar as pessoas.

Estes placeholders são substituídos na mensagem personalizada, além dos placeholders gerais de servidor, canal e bot da página de placeholders.

| Placeholder | Valor |
| --- | --- |
| `%title%` | O título do item |
| `%author%` | O autor do item, ou "Desconhecido" |
| `%content%` | A descrição do item com o HTML removido |
| `%url%` | Link para o item |
| `%feedurl%` | A URL do próprio feed |
| `%image_url%` | A imagem do item, se o feed fornecer uma; caso contrário, a imagem do feed |
| `%categories%` | As categorias do item, separadas por vírgula |
| `%timestamp%` | A data de publicação como um timestamp do Discord |

> [!EXAMPLE]
> `feedmessage 1 New post: **%title%** by %author%
> %url%`

Defina a mensagem como `-` para voltar ao embed padrão.

## Configurações

Os feeds não têm configurações em nível de servidor. Cada assinatura tem um canal e uma URL, escolhidos ao ser adicionada, além de uma mensagem opcional. A página do painel se chama **Feeds RSS** e tem três abas.

| Aba | O que mostra |
| --- | --- |
| Feeds RSS | Cada assinatura com seu canal, URL e data de adição. **Editar Mensagem** ou **Adicionar Mensagem Personalizada** abre uma caixa de texto; uma prévia da mensagem aparece abaixo. **Excluir** remove o feed após uma confirmação. |
| Adicionar Feed | Um seletor de **Canal** e uma caixa **URL do Feed RSS**, com um botão **Adicionar Feed RSS** |
| Estatísticas | **Total de Feeds**, **Feeds Únicos**, **Canais** e um detalhamento de **Feeds por Canal** |

O canal e a URL de um feed existente não podem ser alterados. Remova o feed e adicione-o novamente.

## Passo a passo

1. Abra **Feeds** no painel e mude para **Adicionar Feed**.
2. Escolha o **Canal** para onde as atualizações devem ir.
3. Cole o endereço do feed em **URL do Feed RSS** e pressione **Adicionar Feed RSS**. Precisa ser um endereço completo `http` ou `https` para um documento RSS ou Atom, e não a página inicial do site.
4. De volta em **Feeds RSS**, pressione **Adicionar Mensagem Personalizada** se quiser sua própria redação, depois **Salvar**.
5. Execute `feedtest 1` no Discord para publicar o item mais recente e conferir o resultado. O número é a posição do feed em `feedlist`.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado). Todos os comandos de feed exigem Gerenciar Mensagens.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `feedadd <url> [#channel]` | `rss` | Gerenciar Mensagens | Assina um canal a um feed. Usa o canal atual por padrão. O bot busca o feed primeiro e o rejeita se ele não puder ser lido. |
| `feedlist` | `feeds` | Gerenciar Mensagens | Lista as assinaturas, numeradas, dez por página |
| `feedremove <number>` | `feedrm`, `feeddel` | Gerenciar Mensagens | Remove uma assinatura pelo número na lista |
| `feedmessage <number> <message>` | `rssmessage` | Gerenciar Mensagens | Define a mensagem personalizada de uma assinatura |
| `rsstest <number>` | `feedtest` | Gerenciar Mensagens | Publica o item mais recente do feed no canal atual |

## Dicas e armadilhas

- O limite é de dez feeds por servidor, e a mesma URL não pode ser adicionada duas vezes. `feedadd` mostra um único erro combinado para um link ilegível, uma duplicata e o limite; então confira `feedlist` se não tiver certeza de qual foi.
- Adicionar um feed pelo painel não testa a URL antes. Use `feedtest` depois para garantir que o bot consegue ler o feed.
- Os números usados em `feedremove`, `feedmessage` e `feedtest` vêm de `feedlist`, que ordena os feeds pela data em que foram adicionados.
- O bot precisa de Enviar Mensagens e Incorporar Links no canal de destino. Sem Incorporar Links, o embed padrão não aparece.
- Só são publicados itens com data de publicação (ou, no caso do Atom, data de atualização). Um feed cujas entradas não têm datas nunca gerará atualizações.
- O bot não publica nada na primeira passada após uma reinicialização. Ele começa a partir do item mais recente naquele momento, então itens publicados enquanto o bot estava offline não são recuperados.
- Como uma mensagem personalizada usa o interpretador de embeds, mantenha as mesmas regras do criador de embeds: JSON válido ou texto simples.

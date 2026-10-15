---
title: Embeds
slug: embedbuilder
summary: Crie mensagens ricas do Discord com embeds, botões e menus de seleção, salve-as como modelos, envie-as para um canal e reutilize o mesmo JSON em qualquer lugar em que o bot aceite uma mensagem personalizada.
icon: fa-link
category: Actions
dashboard: /dashboard/embedbuilder
module: Utility
tags: [embed, embed builder, json, say, template, webhook, persona, buttons, select menu, custom message, embeds, criador de embeds, modelo, botões, menu de seleção, mensagem personalizada]
related: [multigreets, chat-triggers, afk, feeds, giveaways, suggestions]
---

## O que faz

O criador de embeds é um editor visual para mensagens do Discord. Você preenche um título, uma descrição, uma cor, campos, imagens e, opcionalmente, botões ou menus de seleção, acompanha uma pré-visualização ao vivo e recebe, no final, um bloco de JSON. Esse JSON é o formato universal de mensagens do bot. Cole-o em `say` para publicá-lo, salve-o como um modelo com nome ou insira-o em qualquer recurso que aceite uma mensagem personalizada, como saudações, gatilhos de chat, respostas de AFK, atualizações de feeds ou a DM de vencedor de sorteios.

Os modelos podem ser pessoais, visíveis apenas para você em todos os servidores, ou compartilhados com um servidor, para que qualquer membro da equipe possa carregá-los. O painel também pode enviar uma mensagem finalizada diretamente para um canal, opcionalmente por meio de um webhook com nome e avatar personalizados, chamado de persona.

Os membros nunca interagem com o criador. Eles apenas veem as mensagens que ele produz.

## Por que usar

- Escreva um post de regras ou de informações com formatação adequada e atualize-o depois com `edit`.
- Crie uma mensagem de boas-vindas uma vez e cole o JSON nas saudações.
- Mantenha um conjunto de modelos de anúncios para que a equipe publique atualizações com aparência consistente.
- Adicione botões que executam gatilhos de chat, ou um menu de seleção que entrega cargos por meio de gatilhos.
- Publique como "Notícias do Servidor" com avatar próprio, sem dar a ninguém acesso a webhooks.

## O formato JSON

O interpretador procura a primeira `{` no texto e lê até a `}` correspondente. Se não houver um objeto JSON, ou se ele não puder ser interpretado, todo o texto é tratado como conteúdo simples. Os nomes de propriedades não diferenciam maiúsculas de minúsculas.

| Chave | Tipo | Significado |
| --- | --- | --- |
| `content` | string | Texto simples exibido acima dos embeds |
| `embed` | objeto | Um único embed. Se presente, `embeds` é ignorado. |
| `embeds` | array | Até dez objetos de embed |
| `components` | array | Botões e menus de seleção |

Um objeto de embed aceita `title`, `description`, `url`, `color`, `author` (`name`, `url`, `icon_url`), `footer` (`text`, `icon_url`), `thumbnail` (`url`), `image` (`url`) e `fields` (array de `name`, `value`, `inline`). `color` pode ser um número ou uma string como `#5865F2`. Os nomes de campos são cortados em 256 caracteres e os valores em 1024. Qualquer URL que não seja um endereço absoluto completo é descartada, em vez de fazer toda a mensagem falhar. A chave `timestamp` é aceita, mas não é exibida.

Um componente tem `row` (a linha em que fica), `displayName` e, além disso, `url` para um botão de link ou `id` para um botão vinculado a um gatilho de chat. `style` vai de 1 a 4 para os quatro estilos de botão do Discord, e `emoji` é opcional. Defina `isSelect` como true para um menu de seleção e depois informe `options` (cada um com `id`, `name`, `description`, `emoji`), além de `minOptions` e `maxOptions` entre 0 e 25. Um componente que quebre alguma regra é renderizado como um botão vermelho desativado cujo rótulo é o erro, para que você veja o que deu errado no Discord.

> [!EXAMPLE]
> `{"content": "Welcome %user.mention%!", "embeds": [{"title": "Read the rules", "description": "See %channel.mention%", "color": "#57F287"}]}`

### Placeholders

O botão **%** do criador insere placeholders da página de placeholders (usuário, servidor, canal, bot, horário e assim por diante). O painel não os substitui: uma mensagem enviada pela aba **Enviar** sai com o texto literal. O bot substitui os placeholders quando o JSON passa por um comando ou recurso, por exemplo `say`, `embedpreview`, saudações e gatilhos. Cada recurso adiciona seu próprio conjunto, como `%afk.message%` ou `%giveawayitem%`, além dos gerais.

## Modelos

Um modelo é um nome mais o JSON. Existem dois escopos.

| Escopo | Quem vê | Criado por |
| --- | --- | --- |
| Pessoal | Somente você, em qualquer servidor e em DMs | `embedsave`, ou **Salvar** no painel com o compartilhamento desmarcado |
| Compartilhado no servidor | Qualquer pessoa com acesso naquele servidor | `guildembedsave` (Gerenciar Mensagens), ou **Salvar** com **Compartilhar com todos em (servidor)** marcado |

Os nomes precisam ser únicos dentro de cada escopo. `embedpreview <name>` procura primeiro o seu modelo pessoal, depois o modelo compartilhado do servidor, substitui os placeholders e publica o resultado no canal atual.

Alguns comandos aceitam uma referência de modelo no lugar do JSON bruto: escreva `{template:name}` ou `{t:name}` como mensagem. `multigreetmessage` oferece suporte a isso. O JSON resolvido é que fica armazenado, e não a referência; por isso, edições posteriores no modelo não atualizam a saudação.

## A página do painel

A página se chama **Construtor de embeds do Discord** e tem seis abas, além de um painel de **Pré-visualização ao vivo** e de **Problemas** ao lado. **Desfazer**, **Refazer**, **Cancelar edições** e **Copiar JSON** ficam no cabeçalho.

| Aba | O que você faz ali |
| --- | --- |
| Modelos | Escolha entre uma galeria de pontos de partida ou **Começar do zero** |
| Editor | **Conteúdo da mensagem** mais até dez embeds. Cada embed tem título, descrição, URL, cor, autor, rodapé, até 25 campos, miniatura e imagem, com contadores de caracteres. |
| Componentes | Até cinco linhas e 25 componentes. Adicione botões (texto, estilo, emoji, URL ou gatilho) e menus de seleção (placeholder, opções com vínculos a gatilhos). |
| JSON | O payload bruto. **Atualizar a partir do construtor** o regenera; **Aplicar ao construtor** carrega JSON colado, seja um payload completo ou um único objeto de embed. |
| Salvos | **Salvar embed atual** com um nome e a caixa de compartilhamento, depois listas de **Compartilhados em (servidor)** e **Meus embeds**, com **Carregar** e **Excluir** |
| Enviar | Escolha um canal, revise suas permissões ali, opcionalmente envie por um webhook como uma persona ou com nome e URL de avatar personalizados, e depois **Enviar mensagem** |

### Envio e personas

A aba **Enviar** lista apenas os canais em que você e o bot podem postar. Enviar embeds exige Inserir Links para ambos. Se você não tiver Mencionar everyone, as menções a everyone, here e cargos são removidas e a aba exibe um aviso.

O envio por webhook exige Gerenciar Webhooks para você e para o bot. Uma **persona** é um nome e um avatar salvos, pessoais ou compartilhados com o servidor; **Gerenciar** abre a lista de personas. Personas com imagem enviada recebem um webhook próprio em cada canal, então um canal pode ter no máximo quinze delas. A opção **Personalizado** recebe um nome de exibição e um link de avatar. Cada envio é registrado no registro de auditoria do painel.

O mesmo criador abre como um pop-up dentro de outras páginas do painel (saudações, gatilhos e outras), com apenas as abas **Editor**, **Componentes**, **JSON** e **Salvos**.

## Configurações

O criador não tem configurações de servidor. Tudo é definido por mensagem ou por modelo.

## Passo a passo de configuração

1. Abra **Embeds** no painel e escolha um modelo ou **Começar do zero**.
2. Na aba **Editor**, escreva o conteúdo e preencha o embed. Fique de olho no painel **Problemas** para qualquer coisa que o Discord rejeitaria.
3. Adicione botões ou menus em **Componentes**, se precisar, vinculando cada um a um gatilho de chat ou a uma URL.
4. Vá para **Salvos**, dê um nome, marque **Compartilhar com todos em (servidor)** se a equipe deve usá-lo, e pressione **Salvar**.
5. Para publicar agora, abra **Enviar**, escolha um canal e pressione **Enviar mensagem**. Para usar em outro lugar, pressione **Copiar JSON** e cole na outra funcionalidade.
6. No Discord, `embedpreview <name>` publica um modelo salvo com os placeholders preenchidos.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Atalhos | Requer | Função |
| --- | --- | --- | --- |
| `say [#channel] <text or JSON>` | | Gerenciar Mensagens | Publica texto ou JSON de embed como o bot, com os placeholders substituídos. Um anexo `.txt` pode fornecer a mensagem. |
| `edit #channel <message id> <text or JSON>` | | Gerenciar Mensagens | Substitui o conteúdo de uma mensagem enviada pelo bot |
| `embedsave <name> <JSON>` | `esave` | Ninguém | Salva um modelo pessoal |
| `embedlist` | `elist` | Ninguém | Lista os seus modelos pessoais |
| `embeddelete <name>` | `edel`, `edelete` | Ninguém | Exclui um dos seus modelos pessoais |
| `guildembedsave <name> <JSON>` | `gesave`, `gembedsave` | Gerenciar Mensagens | Salva um modelo compartilhado com este servidor |
| `guildembedlist` | `gelist`, `gembedlist` | Ninguém | Lista os modelos compartilhados do servidor |
| `guildembeddelete <name>` | `gedel`, `gembeddelete` | Gerenciar Mensagens | Exclui um modelo compartilhado |
| `embedpreview <name>` | `epreview`, `eprev` | Ninguém | Publica um modelo salvo no canal atual |

## Dicas e cuidados

- O `say` respeita os seus próprios direitos de menção: sem Mencionar everyone, o bot não marcará todos nem cargos por você.
- Um embed com apenas um título e nada mais ainda é enviado, mas o painel não permitirá copiar nem enviar até que haja um título, descrição, campo ou conteúdo.
- Botões vinculados a gatilhos só funcionam no servidor cujo ID de gatilho eles referenciam. Carregar um modelo compartilhado em outro servidor deixa esses botões quebrados.
- URLs malformadas de imagem, miniatura, autor e rodapé são descartadas silenciosamente. Se uma imagem não aparecer, verifique se a URL começa com `https://`.
- O Discord limita uma mensagem a dez embeds, 25 campos por embed, cinco linhas de componentes e cinco botões por linha. O criador aplica os mesmos números.
- Excluir uma persona não remove os webhooks que ela criou nos canais. Limpe-os nas configurações de integrações do canal, se necessário.

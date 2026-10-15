---
title: Chat Saver
slug: chatsaver
summary: Traga o histórico recente de um canal para o painel, leia-o ali e guarde capturas nomeadas para depois, ou exporte uma transcrição HTML do Discord com um comando.
icon: fa-folder
category: Security
dashboard: /dashboard/chatsaver
module: Utility
tags: [chat saver, chat log, save chat, transcript, export, archive, history, evidence, ticket transcript, salvar chat, registro de chat, transcrição, exportar, arquivo, histórico, evidência, transcrição de ticket]
related: [tickets, logging, auditlog]
---

## O que faz

O Chat Saver tem duas partes. No painel, a equipe escolhe um canal e um período, e o bot busca todas as mensagens desse intervalo: texto, autor, anexos e embeds. Elas podem ser lidas na página e, se valerem a pena ser mantidas, salvas como um registro nomeado. Os registros salvos ficam no banco de dados do bot, então continuam existindo mesmo depois que as mensagens originais são apagadas.

No Discord, `savechat` executa uma exportação completa da transcrição de um canal dos últimos minutos, horas ou dias e envia um link para um arquivo HTML com aparência do Discord, incluindo mídia.

As transcrições de tickets também são armazenadas aqui. Quando um ticket é fechado em um servidor que tem um canal de transcrição de tickets definido, o sistema de tickets guarda a conversa como um registro salvo chamado `Ticket #<id> - <channel>`, que aparece em **Registros salvos** junto com os demais.

## Por que usar

- Guardar provas de uma discussão ou de uma quebra de regra antes que as pessoas apaguem suas mensagens.
- Arquivar um canal de evento ou uma thread de anúncios antes que sejam removidos.
- Revisar o que aconteceu em um canal durante a noite sem rolar o histórico no Discord.
- Ler transcrições antigas de tickets em um só lugar.

## Buscando mensagens

Na aba **Buscar mensagens**, escolha um **Canal**, uma **Quantidade de tempo** e uma **Unidade de tempo**, depois clique em **Carregar mensagens**. O bot lê o canal do mais novo para o mais antigo e para ao encontrar mensagens mais antigas que o seu período ou ao reunir 5000 mensagens, o que acontecer primeiro. As mensagens são exibidas da mais antiga para a mais nova na aba **Ver mensagens**.

| Unidade de tempo | Máximo |
| --- | --- |
| Minutos | 4320 |
| Horas | 72 |
| Dias | 3 |

Todos os três limites correspondem à mesma janela de três dias. A busca não armazena nada; se fechar a página, os dados somem.

## Salvando um registro

Com as mensagens carregadas, clique em **Salvar registro** na aba **Ver mensagens**. O registro recebe o nome `<channel> - <today's date>` e é guardado com o canal, quem o salvou e a quantidade de mensagens. Cada registro salvo guarda o texto das mensagens, o nome e o avatar do autor, o horário, os links dos anexos e os títulos, descrições e miniaturas dos embeds.

Os links de anexos e avatares apontam para a CDN do Discord. Se o Discord remover o arquivo, o link no registro salvo deixa de funcionar, mas o texto permanece.

**Exportar HTML**, ao lado de **Salvar registro**, baixa as mensagens carregadas como uma transcrição HTML independente, gerada no seu navegador. Nada é armazenado no bot.

## Registros salvos

A aba **Registros salvos** lista todos os registros do servidor, do mais novo para o mais antigo, com seu canal e a quantidade de mensagens. Cada item tem **Ver registro**, **Renomear registro** e **Excluir registro**. Renomear altera apenas o nome. Excluir é permanente e acontece assim que você clica; não há pedido de confirmação.

Renomeações e exclusões são registradas no log de auditoria do painel.

## O comando savechat

O `savechat` funciona de forma diferente do painel. Ele executa o DiscordChatExporter na máquina do bot, grava um arquivo HTML com mídia e responde com um link. No Mewdeko público, ele envia por DM um link `cdn.mewdeko.tech`; em um bot self-hosted, ele publica o caminho local no canal.

O período é limitado a três dias. Valores maiores são recusados. A exportação exige que o diretório configurado para salvar o chat do bot exista; caso contrário, o comando retorna um erro.

> [!NOTE]
> As exportações do `savechat` não aparecem em **Registros salvos**. São arquivos na máquina hospedeira, não entradas do banco de dados.

## Configurações

O Chat Saver não tem configuração. A página do painel tem três abas: **Buscar mensagens**, **Registros salvos** e **Ver mensagens**.

| Controle | Padrão | O que controla |
| --- | --- | --- |
| Canal | nenhum | O canal de texto a ser lido |
| Quantidade de tempo | 1 | Até onde voltar na busca |
| Unidade de tempo | Horas | Minutos, Horas ou Dias |

## Passo a passo de configuração

1. Abra **Chat Saver** no painel.
2. Em **Buscar mensagens**, selecione o **Canal** e defina a **Quantidade de tempo** e a **Unidade de tempo**, por exemplo 6 horas.
3. Clique em **Carregar mensagens** e aguarde a contagem de mensagens aparecer.
4. Mude para **Ver mensagens** para ler o que foi carregado.
5. Clique em **Salvar registro** para mantê-lo. Ele aparece em **Registros salvos**.
6. Use **Renomear registro** para dar um nome significativo, como o incidente ou a data.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a não ser que você tenha alterado).

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `savechat <time> [#channel]` | | Gerenciar Mensagens | Exporta o último `<time>` de um canal para HTML, por exemplo `savechat 2h #general` |

## Dicas e pegadinhas

- O bot precisa conseguir ler o canal e o histórico de mensagens. Canais que ele não consegue ver retornam "Channel not found".
- A busca para em 5000 mensagens. Para um canal muito movimentado, use um período menor.
- Edições e exclusões de mensagens que aconteceram antes da busca não são visíveis; o bot lê o que está no canal naquele momento. Use o recurso de logs para um registro em tempo real.
- Os registros salvos guardam os nomes dos autores como estavam no momento do salvamento. Uma mudança posterior de nome de usuário não é refletida.
- Qualquer pessoa com acesso ao painel do servidor pode ler os registros salvos, incluindo as transcrições de tickets. Restrinja o acesso ao painel de acordo.
- O `savechat` foi feito para a CDN do bot público. Quem hospeda o próprio bot precisa definir um caminho para salvar o chat nas credenciais e copiar os arquivos do DiscordChatExporter para junto do bot.

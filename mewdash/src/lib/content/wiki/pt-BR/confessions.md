---
title: Confissões
slug: confessions
summary: Membros enviam confissões anônimas que o bot publica como embeds numerados em um canal, com um log opcional, restrito à equipe, que revela quem enviou cada uma.
icon: fa-comment
category: Community
dashboard: /dashboard/confessions
module: Confessions
tags: [confessions, confess, anonymous, secrets, confession channel, confession log, blacklist, confissões, confessar, anônimo, segredos, canal de confissões, log de confissões, lista negra]
related: [administration, moderation]
---

## O que ele faz

Um membro executa `/confess` no servidor, ou envia uma DM ao bot com `.confess <server id> "text"`, e o bot publica a mensagem dele no canal de confissões como um embed com o título "Anonymous confession #N". O nome do remetente nunca aparece nesse canal. Ele recebe uma confirmação privada, e o número da confissão aumenta em um a cada vez.

A equipe pode definir um canal de log separado. Toda confissão é copiada para lá com a tag e o ID do remetente, o número da confissão e um link direto para a mensagem publicada. Os membros são informados, em todo rodapé de confissão, como confessar, e na confirmação de que podem denunciar um servidor que abuse do recurso.

A equipe também pode colocar membros individuais na lista negra, para que as confissões deles sejam recusadas, e excluir confissões pelo painel, o que também remove a mensagem no Discord.

## Por que usar

- Canais de desabafo ou de "chá" onde os membros querem falar sem um nome associado.
- Canais de elogios ou de agradecimento que permanecem anônimos.
- Qualquer canal anônimo em que a equipe ainda precise de uma forma de rastrear assédio.

## A publicação da confissão

Cada confissão é um embed no canal de confissões:

| Parte | Conteúdo |
| --- | --- |
| Linha do autor | `Anonymous confession #N` com o ícone do servidor |
| Descrição | O texto da confissão |
| Imagem | O anexo, se um tiver sido enviado |
| Rodapé | `Do /confess or dm me .confess <server id> yourconfession to send a confession!` |
| Timestamp | Quando foi publicada |

A numeração começa em 1 e continua a partir da última confissão armazenada. Excluir uma confissão não renumera as outras.

Anexos são aceitos nos dois casos: anexe um arquivo ao `/confess` com a opção `attachment`, ou anexe um à DM ao usar o comando de texto. Só o primeiro anexo é usado.

## O canal de log

Quando um **Canal de Log** é definido, cada confissão também gera ali um embed vermelho com **Usuário** (tag e ID), **Confissão N** (o texto), um **Link da Mensagem** e um aviso sobre uso indevido. Este é o único lugar onde o remetente é revelado, então restrinja-o a pessoas em quem você confie.

> [!WARNING]
> O canal de log existe para que a equipe possa lidar com assédio. Compartilhar quem enviou uma confissão é motivo para que os donos do bot coloquem o servidor na lista negra. Os membros podem denunciar abusos com `/confessions report`.

## Lista negra

`confessionblacklist` adiciona um membro à lista negra do servidor, e `confessionunblacklist` o remove. Membros na lista negra recebem "você está na lista negra" em vez de uma publicação. A verificação é feita pelo ID do usuário.

O painel mostra uma **Lista negra de cargos** e armazena IDs de cargos na mesma lista. O bot só compara o ID de usuário do remetente com a lista quando uma confissão chega, então os cargos selecionados no painel não impedem ninguém no momento. Use os comandos para bloquear membros específicos.

## Configurações

A página **Confissões** tem três abas: **Configuração**, **Confissões** e **Estatísticas**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Canal de confissões | nenhum | Onde as confissões anônimas são publicadas; as confissões ficam desativadas até que este canal seja definido |
| Canal de log (mostra IDs de usuário) | nenhum | Para onde vai a cópia identificadora de cada confissão |
| Lista negra de cargos | nenhum | Veja a seção de lista negra acima |

**Confissões** lista todas as confissões armazenadas, da mais recente para a mais antiga, com número e data. O conteúdo fica oculto até você expandi-lo, e **Excluir confissão** a remove do banco de dados e apaga a mensagem no Discord, caso ela ainda exista.

**Estatísticas** mostra **Total de confissões**, **Este mês**, **Hoje** e **Último número**.

## Passo a passo

1. Crie um canal onde o bot tenha Enviar Mensagens e Incorporar Links, e onde os membros possam ler, mas idealmente não postar.
2. Abra **Confissões** no painel e escolha esse canal como **Canal de confissões**.
3. Opcionalmente, escolha um canal privado da equipe como **Canal de log**.
4. Clique em **Salvar configuração**.
5. Execute `/confess` de uma conta de membro e confira se o embed aparece com `#1`.
6. Se alguém abusar do recurso, encontre-o no canal de log e execute `confessionblacklist @user`.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado). Os comandos de barra ficam em `/confessions`, exceto `/confess`, que fica no nível principal.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `confess <server id> <"text">` | | Ninguém | Somente DM. Publica uma confissão no servidor informado; coloque textos com mais de uma palavra entre aspas |
| `confessionchannel [#channel]` | `confesschannel` | Gerenciar Canais | Define o canal de confissões, ou desativa as confissões se nenhum canal for informado |
| `confessionlogchannel [#channel]` | `confesslogchannel`, `confessionlogchnl` | Administrador | Define o canal de log |
| `confessionblacklist <@user>` | `confessblacklist`, `confessbl` | Gerenciar Canais | Impede um membro de confessar |
| `confessionunblacklist <@user>` | `confessunblacklist`, `confessunbl` | Gerenciar Canais | Permite que um membro na lista negra volte a confessar |

`/confessions report <server id> <description>` envia aos donos do bot uma denúncia sobre um servidor que está abusando das confissões. Não tem equivalente em texto.

## Dicas e armadilhas

- O bot precisa de Enviar Mensagens e Incorporar Links tanto no canal de confissões quanto no canal de log. Os comandos de canal avisam se ele não tiver essas permissões, mas salvam a configuração mesmo assim.
- O comando de texto `confess` só funciona em DMs e recebe a confissão como um único argumento, então `confess 123456789 "I like pineapple on pizza"` funciona, e a versão sem aspas só publica a primeira palavra. Para os membros, `/confess` no servidor é mais simples.
- `confess` por DM só funciona para servidores que você compartilha com o bot; outros IDs de servidor são recusados.
- O comando de texto `confessionlogchannel` sem canal limpa o canal de confissões, e não o canal de log. Limpe o canal de log pelo painel.
- As confissões são armazenadas com o ID de usuário do remetente mesmo sem um canal de log, e o painel pode consultar o remetente de uma confissão específica. Trate o acesso ao painel como restrito à equipe.
- Excluir pelo painel remove o registro armazenado, então a cópia no canal de log é o seu único rastro restante.

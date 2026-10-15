---
title: Aniversários
slug: birthday
summary: Os membros definem um aniversário no perfil e aceitam participar, e o bot o anuncia em um canal, opcionalmente com um cargo de aniversário temporário e a menção a um cargo.
icon: fa-birthday-cake
category: Community
dashboard: /dashboard/birthday
module: Birthday
tags: [birthday, birthdays, bday, celebrate, birthday role, announcement, timezone, age, profile, aniversário, aniversários, comemorar, cargo de aniversário, anúncio, fuso horário, idade, perfil]
related: [utility, administration]
---

## O que faz

Um membro define seu aniversário uma única vez com `setbirthday` e depois executa `birthdayannouncements` em qualquer servidor que tenha o recurso ativado. Todo dia o bot verifica quem faz aniversário, publica uma mensagem no canal de anúncios e pode dar um cargo de aniversário por 24 horas. Se um cargo a mencionar estiver definido, ele é mencionado antes da mensagem.

Os aniversários são armazenados no perfil do membro no bot, e não por servidor, então um único `setbirthday` vale para todos os servidores que ele compartilha com o bot. Se um aniversário é anunciado em um determinado servidor depende de três coisas: o membro aceitou participar, o perfil dele não é privado e o modo de exibição do aniversário dele não está desativado.

Qualquer pessoa pode ver quem está comemorando com `birthdaytoday` e quem vem a seguir com `birthdaylist`. A idade é mostrada ao lado do nome, a menos que o membro tenha escolhido um modo de exibição que oculte o ano.

A equipe configura o canal, os cargos e a mensagem pela página de **Aniversários** no painel ou com os comandos `birthday*`.

## Por que usar

- Servidores de comunidade que querem uma publicação diária de "feliz aniversário" sem que ninguém acompanhe as datas manualmente.
- Dar aos membros um cargo de aniversário colorido pelo dia para que se destaquem no chat.
- Mencionar um cargo de "turma do aniversário" para que as pessoas realmente vejam o anúncio.
- Deixar os membros escolherem quanto do aniversário é público, até ocultá-lo por completo.

## Quem é anunciado

Um membro só é incluído nos anúncios e nas listas quando todas estas condições são verdadeiras:

| Requisito | Como o membro controla |
| --- | --- |
| Um aniversário está definido | `setbirthday <date>` |
| Aceitou participar dos anúncios | `birthdayannouncements` alterna; desativado por padrão |
| O perfil não é privado | `setprivacy public` no perfil |
| O modo de exibição não é Disabled | `setbirthdayprivacy <mode>` |

A verificação é feita entre os membros que estão atualmente no servidor, então quem sai não é anunciado.

### Modos de exibição do aniversário

`setbirthdayprivacy` recebe um destes valores. Ele afeta o que é mostrado nas listas, no perfil e em `birthdaytoday`.

| Modo | Efeito |
| --- | --- |
| `Default` | Data completa mostrada, a idade é exibida nas listas |
| `MonthOnly` | Somente o mês, idade oculta |
| `YearOnly` | Somente o ano, idade ainda exibida |
| `MonthAndDate` | Mês e dia, idade oculta |
| `Disabled` | Aniversário oculto e nunca anunciado |

## Como funciona a verificação diária

O serviço roda uma vez por hora e compara o mês e o dia do aniversário de cada membro com a data de hoje em UTC. A primeira hora de um novo dia UTC que encontrar aniversários os publica, e o servidor é marcado como concluído para aquele dia, para que nada seja publicado duas vezes.

Os anúncios só acontecem quando o recurso **Anúncios** está ativado e um canal está definido. Definir um canal com `birthdaychannel` ou no painel ativa o recurso para você.

Os fusos horários são armazenados, mas ainda não são usados pela verificação diária. `birthdaytimezone` e a configuração **Fuso horário do servidor** são aceitos e mostrados no embed de configuração, mas os anúncios saem no dia UTC.

## O cargo de aniversário

Quando o **Cargo de aniversário** está ativado e um cargo está definido, cada membro anunciado recebe o cargo no momento do anúncio e ele é removido 24 horas depois. O temporizador de remoção fica na memória, então, se o bot reiniciar durante o dia, o cargo permanece até que alguém o remova.

O bot precisa de Gerenciar cargos e o cargo mais alto dele deve ficar acima do cargo de aniversário.

## A mensagem de anúncio

A mensagem padrão é `Happy Birthday %user.mention%!` com emojis de festa ao redor. Substitua-a com `birthdaymessage` ou com o editor de **Mensagem de aniversário** no painel. O texto passa pelo analisador de embeds, então tudo o que o construtor de embeds produz funciona, e a menção ao cargo a mencionar é adicionada no início, se estiver ativada.

### Placeholders

A mensagem aceita os placeholders padrão de usuário, servidor, canal e bot da página de placeholders, além de um valor específico de aniversário.

| Placeholder | Valor |
| --- | --- |
| `%user.mention%` | Menciona o membro aniversariante |
| `%user.name%` | O nome de usuário dele |
| `%user.avatar%` | A URL do avatar dele |
| `%server.name%` | O nome do servidor |
| `%birthday.age%` | A idade que a pessoa está fazendo, ou `Unknown` |

> [!WARNING]
> Use `%user.mention%`, não `{user}`. A ajuda do comando de texto menciona `{user}`, mas somente a forma `%...%` é substituída no anúncio publicado.

## Configurações

Tudo está na página de **Aniversários**, em três abas: **Configuração**, **Usuários** e **Estatísticas**.

A **Configuração** tem as configurações básicas, o editor de mensagem e um painel de **Recursos de aniversário** com uma chave para cada recurso.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Canal | nenhum | Onde os anúncios são publicados |
| Cargo de aniversário | nenhum | Cargo dado por 24 horas em um aniversário |
| Cargo a mencionar | nenhum | Cargo mencionado antes de cada anúncio |
| Fuso horário do servidor | UTC | Armazenado para o servidor, mostrado no embed de configuração |
| Dias de lembrete antes do aniversário | 0 | De 0 a 30; armazenado, nenhum lembrete é enviado ainda |
| Mensagem de aniversário | embed padrão | O anúncio, com os placeholders acima |

| Chave de recurso | Padrão | O que controla |
| --- | --- | --- |
| Anúncios | desativado | Publica a mensagem diária no canal |
| Cargo de aniversário | desativado | Atribui o cargo temporário |
| Lembretes | desativado | Chave provisória; nada é enviado ainda |
| Cargo a mencionar | desativado | Menciona o cargo a mencionar com os anúncios |
| Suporte a fuso horário | desativado | Chave provisória; a verificação continua rodando em UTC |

**Usuários** mostra os **Próximos aniversários** dos próximos 7, 14 ou 30 dias e uma lista de **Todos os usuários** com cada membro que definiu um aniversário, com os aniversários de hoje destacados no topo da página. **Estatísticas** mostra **Total de usuários**, **Aniversários definidos**, **Aniversários públicos** e **Aniversários de hoje**.

> [!NOTE]
> Salvar o formulário do painel só grava os valores que você preencheu. Para limpar um cargo ou o canal, use `birthdayrole` ou `birthdaypingrole` sem cargo, ou redefina tudo com `/birthday config reset`.

## Passo a passo de configuração

1. Abra **Aniversários** no painel.
2. Em **Configuração**, escolha o **Canal** dos anúncios e clique em **Salvar configuração**.
3. Ative **Anúncios** no painel de **Recursos de aniversário**.
4. Opcionalmente, escolha um **Cargo de aniversário** e ative **Cargo de aniversário**, e um **Cargo a mencionar** com **Cargo a mencionar** ativado.
5. Opcionalmente, escreva sua própria **Mensagem de aniversário** usando `%user.mention%` e `%birthday.age%`.
6. Diga aos membros para executarem `setbirthday` e depois `birthdayannouncements` para aceitar participar.
7. Confira a aba **Usuários** para confirmar que eles aparecem em **Próximos aniversários**.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado). As versões de barra ficam em `/birthday` e `/birthday config`.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `setbirthday <date>` | | Ninguém | Definir seu aniversário no seu perfil, por exemplo `setbirthday 1998-04-12` |
| `setbirthdayprivacy <mode>` | | Ninguém | Escolher um dos modos de exibição acima |
| `birthdayannouncements` | `bdayann` | Ninguém | Aceitar ou recusar ser anunciado |
| `birthdaytimezone <zone>` | `bdaytz` | Ninguém | Armazenar seu fuso horário, por exemplo `Europe/London` |
| `birthdaytoday` | `todaysbirthdays` | Ninguém | Listar quem está comemorando hoje |
| `birthdaylist [days]` | `bdaylist`, `upcomingbirthdays` | Ninguém | Próximos aniversários, de 1 a 30 dias, padrão 7 |
| `birthdaychannel [#channel]` | `bdaychannel`, `bdaychan` | Administrador | Definir o canal de anúncios e ativar os anúncios |
| `birthdayrole [@role]` | `bdayrole` | Administrador | Definir o cargo de aniversário de 24 horas, ou limpá-lo sem cargo |
| `birthdaypingrole [@role]` | `bdayping` | Administrador | Definir o cargo a mencionar, ou limpá-lo sem cargo |
| `birthdaymessage [text]` | `bdaymsg` | Administrador | Definir o texto do anúncio, ou mostrar o atual |
| `birthdayconfig` | `bdaycfg` | Administrador | Mostrar a configuração atual |

`/birthday config reset` limpa todas as configurações e desativa todos os recursos. Ele não tem equivalente em comando de texto.

## Dicas e armadilhas

- Os membros não são anunciados até executarem `birthdayannouncements`. Avise-os, ou ninguém aparecerá.
- `setbirthday` aceita qualquer coisa que o bot consiga interpretar como data. Use um formato inequívoco como `1998-04-12`.
- `birthdaytimezone` só aceita uma pequena lista fixa de dezesseis fusos, como `UTC`, `GMT`, `America/New_York`, `Europe/London`, `Asia/Tokyo`, `Asia/Kolkata`, `Australia/Sydney` e `Pacific/Auckland`. A lista suspensa **Fuso horário do servidor** do painel tem uma lista parecida de treze.
- A verificação diária usa UTC. Membros longe do UTC podem ser anunciados algumas horas antes ou depois.
- O bot precisa de Gerenciar cargos para o cargo de aniversário, e de Enviar mensagens mais Inserir links no canal de anúncios.
- `birthdayconfig` mostra um campo "Reminder Days" e um recurso de Lembretes. Eles são armazenados, mas atualmente não enviam nada.
- Não há comando para excluir um aniversário armazenado. Os membros o ocultam executando `setbirthdayprivacy Disabled` ou recusando com `birthdayannouncements`.

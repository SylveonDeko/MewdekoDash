---
title: Perfil de usuário
slug: userprofile
summary: Dê a cada membro um cartão de perfil que o bot pode mostrar em qualquer lugar, com biografia, pronomes, signo, aniversário, cor, imagem e código de amigo do Switch, além de controles de privacidade sobre o que os outros veem.
icon: fa-user
category: Community
module: UserProfile
tags: [profile, bio, pronouns, pronoundb, zodiac, birthday, privacy, profile colour, profile image, switch friend code, stats opt out, greet dm opt out, perfil, biografia, pronomes, signo, aniversário, privacidade, cor do perfil, imagem do perfil, código de amigo do switch, desativar estatísticas, desativar dm de boas-vindas]
related: [birthday, switch, afk, help]
---

## O que faz

Todo membro tem um perfil que o acompanha em todos os servidores em que o bot está. Ao executar `profile`, o perfil é enviado como embed: o avatar do membro como miniatura, a biografia como descrição, e depois campos para pronomes, signo, aniversário, quantos servidores ele compartilha com o bot e o código de amigo do Nintendo Switch, caso tenha definido um. Uma cor personalizada e uma imagem grande na parte inferior completam o visual.

Os membros preenchem o perfil com alguns comandos `set...` ou pela página **Minhas configurações** do painel. Nada é específico de servidor: defina sua biografia uma vez e ela aparece igual em todos os lugares.

A privacidade fica sob controle do membro. Um perfil pode ser tornado privado, para que só o dono consiga abri-lo; o aniversário pode ser reduzido apenas ao mês ou ocultado por completo; e os membros podem optar por não participar da coleta de estatísticas de comandos e das DMs de boas-vindas.

Os pronomes são um caso um pouco especial. Se um membro não definiu nenhum com o bot, o bot consulta o PronounDB. Os membros podem substituir isso por texto próprio, e qualquer pessoa pode denunciar uma substituição abusiva aos donos do bot.

## Por que usar

- Os membros querem um cartão rápido de "sobre mim" sem precisar de um canal de apresentações dedicado.
- Uma comunidade que compartilha códigos de amigo do Switch pode mantê-los em um só lugar, em vez de fixar mensagens.
- Os pronomes podem ser exibidos automaticamente do PronounDB, então a maioria das pessoas nunca precisa digitá-los.
- A equipe pode verificar os pronomes de alguém com `pronouns @user` antes de responder.
- Membros que não querem DMs de boas-vindas ou coleta de estatísticas podem desativar isso por conta própria.

## O embed do perfil

`profile` sem argumento mostra o seu próprio perfil. `profile @user` mostra o de outra pessoa, a menos que ela o tenha definido como privado; nesse caso, o bot responde que o perfil é privado.

| Parte do embed | De onde vem |
| --- | --- |
| Título | "Perfil de" o usuário |
| Cor | `setprofilecolor`, senão a cor padrão do bot |
| Miniatura | O avatar do Discord do membro |
| Descrição | A biografia de `setbio` (exibida apenas se definida) |
| Pronomes | Sua substituição, senão PronounDB, senão "Não especificado" |
| Signo | `setzodiac`, senão "Não especificado" |
| Aniversário | `setbirthday`, exibido conforme o modo de privacidade do aniversário, senão "Não especificado" |
| Servidores em comum com o bot | Quantos servidores você e o bot têm em comum |
| Código de amigo do Switch | Exibido apenas se definido |
| Imagem | A URL de `setprofileimage` |

## Campos do perfil

### Biografia

`setbio <text>` aceita até 2048 caracteres. Textos mais longos são rejeitados. Não há comando para limpar; se quiser removê-la, defina uma biografia curta, como um único ponto.

### Signo

`setzodiac <sign>` aceita um dos doze signos ocidentais: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces (use os nomes em inglês). Maiúsculas e minúsculas não importam. Qualquer outro valor é rejeitado.

### Cor e imagem

`setprofilecolor <colour>` aceita uma cor em qualquer formato que o interpretador de cores do bot entenda, como um valor hexadecimal. `setprofileimage <url>` precisa de um link direto para um arquivo de imagem; o bot verifica se a URL parece uma imagem antes de salvar e a mostra de volta para você.

### Aniversário

`setbirthday <date>` armazena uma data. Os anúncios do módulo Aniversário usam o mesmo valor, então definir aqui também define lá. Como ele aparece no perfil depende de `setbirthdayprivacy <mode>`:

| Modo | O que o perfil mostra |
| --- | --- |
| `Default` | A data completa |
| `MonthOnly` | Apenas o nome do mês |
| `YearOnly` | Apenas o ano |
| `MonthAndDate` | Mês e dia, sem o ano |
| `Disabled` | "Privado" |

### Código de amigo do Switch

`setswitchfc <code>` deve seguir o formato `SW-XXXX-XXXX-XXXX` (quatro dígitos em cada grupo; o `SW` não diferencia maiúsculas de minúsculas). Execute sem código para removê-lo do seu perfil. O módulo do Nintendo Switch não tem relação com este campo; o código serve apenas para exibição.

### Privacidade

`setprivacy public` ou `setprivacy private`. Perfis privados só são visíveis para o dono. O padrão é público.

## Pronomes

`pronouns [@user]` mostra os pronomes seus ou de outra pessoa. A ordem de busca é:

1. Texto definido pelo membro com `setpronouns`.
2. O conjunto de pronomes em inglês do membro no PronounDB, se ele tiver vinculado a conta do Discord lá. Conjuntos padrão são exibidos na forma usual, por exemplo `he/him`, `Any pronouns` ou `Ask me my pronouns`.
3. "Não especificado".

`setpronouns <text>` armazena uma substituição. Execute sem texto para ver sua substituição atual, com dois botões: **Sobrescrever** abre um formulário para digitar novos pronomes, e **Limpar** remove a substituição para que o PronounDB volte a ser usado.

Quando os pronomes exibidos vêm da substituição do próprio membro (e não do PronounDB), a resposta traz um botão **Denunciar**. As denúncias vão para um canal que os donos do bot administram, onde eles podem limpar a substituição, desativar os pronomes desse usuário ou colocá-lo na lista negra. Um usuário com pronomes desativados vê o motivo sempre que tenta usar os comandos de pronomes.

> [!NOTE]
> O comando de dono do bot `pronounsforceclear` é como essas denúncias são tratadas. A equipe do servidor não pode limpar os pronomes de outro membro.

## Opt-outs

- `greetdmoptout` alterna se servidores que usam as saudações por DM do bot podem te enviar DMs. Afeta apenas as saudações enviadas por este bot.
- `userstatsoptout` alterna a coleta de estatísticas de comandos para a sua conta. Nunca coleta o conteúdo das mensagens.
- `deleteuserstatsdata` apaga as estatísticas de comandos já armazenadas para você, após confirmação. Pode ser executado uma vez por hora.

## Configurações

Não há configuração no servidor. Tudo fica com o membro. A página **Minhas configurações** do painel (`/me`) tem uma seção **Perfil** com um botão **Editar** e uma seção de privacidade com alternâncias.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Biografia | vazio | A descrição do seu perfil |
| Pronomes | vazio (o PronounDB é usado) | Sua substituição de pronomes |
| Signo | nenhum | Signo exibido no perfil |
| Aniversário | nenhum | A data exibida no perfil e usada nos anúncios de aniversário |
| Fuso horário | UTC | Fuso horário que o módulo Aniversário usa para o seu anúncio |
| Código de amigo do Switch | vazio | Campo de código de amigo no perfil |
| Cor do perfil | padrão do bot | Cor do embed |
| Imagem do perfil | nenhum | Imagem na parte inferior do embed |
| Privacidade do perfil | Público | Se outros podem abrir seu perfil |
| Modo de exibição do aniversário | Default | Quais partes do aniversário são exibidas |
| Bloquear DMs de boas-vindas | desativado | Igual a `greetdmoptout` |
| Bloquear rastreamento de mensagens | desativado | Igual a `userstatsoptout` |
| Anúncios de aniversário | desativado | Se o módulo Aniversário anuncia o seu aniversário |

A mesma página também tem uma alternância que desativa a busca de pronomes para a sua conta.

## Passo a passo de configuração

1. Execute `setbio Hi, I run the art channel.` para adicionar uma descrição.
2. Execute `setpronouns she/her`, ou pule esta etapa se a sua conta do PronounDB já estiver vinculada ao Discord.
3. Execute `setbirthday 1998-04-12` e depois `setbirthdayprivacy MonthAndDate` se não quiser que o ano apareça.
4. Execute `setprofilecolor #ff66aa` e `setprofileimage https://example.com/banner.png` para estilizar o embed.
5. Adicione `setswitchfc SW-1234-5678-9012` se quiser que as pessoas te encontrem no Switch.
6. Execute `profile` para conferir o resultado. Se preferir que ninguém mais veja, execute `setprivacy private`.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado). Existem versões de barra para a maioria deles, com nomes como `/profile`, `/setbio`, `/setcolor`, `/setbirthday`, `/setbirthdayprivacy`, `/setswitchfriendcode`, `/setprofileimage`, `/setprivacy`, `/setzodiac`, `/pronouns`, `/setpronouns`, `/statsoptout` e `/deletestatsdata`.

| Comando | Atalhos | Requer | Função |
| --- | --- | --- | --- |
| `profile [@user]` | `userprofile` | Ninguém | Mostra o seu perfil ou o de outra pessoa |
| `setbio <text>` | | Ninguém | Define sua biografia, até 2048 caracteres |
| `setpronouns [text]` | `pronounsset` | Ninguém | Define uma substituição de pronomes, ou a visualiza com os botões de limpar e sobrescrever |
| `pronouns [@user]` | `getpronouns` | Ninguém | Mostra os pronomes, com botão de denúncia nas substituições |
| `setzodiac <sign>` | | Ninguém | Define o seu signo |
| `setprofilecolor <colour>` | | Ninguém | Define a cor do embed |
| `setprofileimage <url>` | | Ninguém | Define a imagem exibida no perfil |
| `setbirthday <date>` | | Ninguém | Define o seu aniversário |
| `setbirthdayprivacy <mode>` | | Ninguém | `Default`, `MonthOnly`, `YearOnly`, `MonthAndDate` ou `Disabled` |
| `setprivacy <Public|Private>` | `profilepricvacy` | Ninguém | Torna o perfil público ou privado |
| `setswitchfc [code]` | `setfc`, `setswitchfriendcode`, `setfriendcode` | Ninguém | Define ou remove o seu código de amigo do Switch |
| `greetdmoptout` | `gdmoptout` | Ninguém | Alterna o recebimento de DMs de boas-vindas deste bot |
| `userstatsoptout` | `ustatsoptout` | Ninguém | Alterna a coleta de estatísticas de comandos |
| `deleteuserstatsdata` | `deluserstatsdata` | Ninguém | Apaga as suas estatísticas de comandos armazenadas (uma vez por hora) |
| `pronounsforceclear <@user or id> <true|false> <reason>` | `pnfc` | Dono do bot | Limpa os pronomes de um membro e, opcionalmente, os desativa |

## Dicas e cuidados

- O perfil é global. Alterá-lo em um servidor muda em todos.
- `setbirthday` lê a data com o interpretador de datas do bot, então um formato sem ambiguidade, como `1998-04-12`, é o mais seguro.
- Se a URL da imagem do perfil parar de funcionar, o embed ainda é enviado, mas o Discord não mostra imagem. Defina uma nova URL para corrigir.
- As consultas ao PronounDB exigem que o membro tenha vinculado a conta do Discord em pronoundb.org. Sem isso, o perfil mostra "Não especificado" até que ele execute `setpronouns`.
- Perfis privados ainda respondem a `profile @user`, mas com um erro informando que o perfil é privado, para que as pessoas saibam que ele existe.
- `deleteuserstatsdata` remove apenas estatísticas de comandos. Os campos do perfil são limpos sobrescrevendo-os.

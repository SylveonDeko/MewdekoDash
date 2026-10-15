---
title: Patreon
slug: patreon
summary: Conecte uma campanha do Patreon, dê aos apoiadores cargos do Discord que correspondam ao nível deles e poste um agradecimento mensal com números ao vivo de apoiadores e receita.
icon: fa-heart
category: Community
dashboard: /dashboard/patreon
module: Patreon
tags: [patreon, supporters, patrons, donations, premium, tier roles, role sync, announcement, oauth, apoiadores, doações, níveis, cargos por nível, sincronização de cargos, anúncio]
related: [administration, utility]
---

## O que faz

O dono de um servidor que mantém uma campanha no Patreon a vincula ao bot entrando com a conta de criador dele. A partir daí, o bot busca os níveis e os apoiadores da campanha, os mantém sincronizados e pode entregar cargos do Discord com base em quanto cada apoiador contribui. Quando a conta do Discord de um apoiador é conhecida pelo Patreon, o vínculo é automático; caso contrário, a equipe pode vincular um membro a um usuário do Patreon manualmente.

Uma vez por mês, em um dia que você escolher, o bot pode postar em um canal um anúncio agradecendo aos apoiadores. A mensagem pode ser texto simples ou um embed e pode incluir números ao vivo, como a contagem de apoiadores ativos, a receita mensal e quantas pessoas entraram neste mês. Também há um comando de reconhecimento que posta um destaque para quem se tornou apoiador na última semana.

O painel cuida de todo o fluxo: conectar, ver apoiadores e níveis, vincular níveis a cargos e editar as configurações do anúncio. Os comandos cobrem o mesmo terreno, além de estatísticas e rankings no chat.

## Por que usar

- Os apoiadores devem receber um cargo colorido e acesso a canais exclusivos para patronos sem que a equipe verifique o Patreon manualmente.
- Os níveis mudam os cargos automaticamente quando alguém faz upgrade, downgrade ou deixa de contribuir.
- Você quer uma postagem recorrente de "obrigado aos nossos 40 apoiadores" que continue precisa sem editar números.
- A equipe quer uma visão rápida de quem apoia e em que nível, de dentro do Discord.

## Conectando uma campanha

A conexão usa o fluxo OAuth do Patreon. O card **Conecte seu Patreon** do painel, ou o comando `patreonsync`, exclusivo do dono do bot, gera um link "Authorize with Patreon". Entre com a conta que é dona da campanha, aprove o acesso solicitado e o Patreon leva você de volta à página do Patreon no painel. O bot troca o código por tokens, armazena a primeira campanha que encontra e executa imediatamente uma sincronização completa de níveis e apoiadores.

A conta que você usar precisa ser dona de uma campanha. Se não tiver nenhuma, o callback falha com "No Patreon campaigns found for this user".

A aba **Visão geral** do painel mostra o status da conexão com o **ID da campanha**, a **Última sincronização** e **O token expira em**, além de cards de resumo de **Apoiadores** ativos, **Receita** mensal e **Criador da campanha**. Os tokens são renovados automaticamente quando expiram; as **Ações rápidas** na mesma aba são **Sincronizar todos os dados**, **Sincronizar cargos**, **Enviar anúncio** e **Entrar novamente**. Entrar novamente desconecta a campanha: limpa os tokens, mas mantém suas configurações de canal, mensagem e vínculos para que você possa reconectar. O cabeçalho da página também tem os botões **Atualizar dados** e **Sincronizar apoiadores**.

> [!NOTE]
> A integração com o Patreon precisa ser ativada pelo host do bot. Se o bot não tiver um client ID do Patreon configurado, o botão de conectar e `patreonsync` informam que a integração não está configurada.

## Apoiadores e sincronização

Uma sincronização busca todos os membros da campanha com o valor da contribuição, o status e, quando o apoiador conectou o Discord ao Patreon, o ID de usuário do Discord. Apoiadores ativos são aqueles que o Patreon informa como ativos ou com uma contribuição vigente. A aba **Apoiadores** os lista com **Nome** (e e-mail, quando o Patreon fornece um), **Contribuição**, **Entrou** e **Status**, e o botão **Sincronizar apoiadores** no topo da página atualiza a lista.

`patreonsupporters` mostra até 15 apoiadores ativos no chat com a contribuição e a menção do Discord, `patreontop [count]` classifica os 1 a 20 primeiros por contribuição, `patreonstats` resume a contagem de apoiadores, a contagem de vinculados, a receita total e média e a contagem de níveis, e `patreonanalytics` acrescenta ex-apoiadores, receita total acumulada, novos apoiadores neste mês e a distribuição por nível.

Se a conta do Discord de um apoiador não estiver associada do lado do Patreon, use `patreonlink @member <patreonUserId>` para vinculá-lo manualmente. O ID de usuário do Patreon é o ID numérico da conta do apoiador no Patreon; a lista de apoiadores do painel não o exibe.

## Vínculo de níveis com cargos

Cada nível do Patreon pode ser vinculado a um cargo do Discord. Na aba **Vínculo de níveis**, escolha um **Nível do Patreon** e um **Cargo do Discord** e salve. A lista **Níveis disponíveis** mostra todos os níveis publicados com o preço e se estão vinculados. No chat, `patreontiermap <tierId> @role` faz o mesmo; obtenha os IDs dos níveis em `patreonroles`.

A sincronização de cargos fica desativada até você ativá-la com `patreonrolesync` ou com a caixa de seleção **Ativar sincronização de cargos**. Quando ativada, o bot descobre qual cargo um apoiador deve ter: o nível vinculado de maior preço cujo valor seja igual ou menor que a contribuição dele. Quaisquer outros cargos vinculados do Patreon que ele tenha são removidos e o cargo de destino é adicionado. Um apoiador que deixa de contribuir perde todos os cargos vinculados.

A sincronização acontece quando um membro é vinculado e quando você executa `patreonsyncall` ou a ação de sincronizar cargos do painel. Somente apoiadores com um ID do Discord conhecido podem ser sincronizados.

> [!PERMISSION]
> O bot precisa de Gerenciar cargos e o próprio cargo dele deve ficar acima de todos os cargos vinculados. Cargos acima do bot são pulados.

## Anúncios mensais

Defina um canal com `patreonch #channel` ou com o seletor **Canal de anúncios**, e um dia com `patreonday <1..28>` ou **Dia do anúncio (1-28)**. O dia é limitado a 28 para que fevereiro nunca pule um mês. Os anúncios ficam desativados até você executar `patreontoggle` ou marcar **Ativar anúncios**.

O bot verifica a cada hora. No dia escolhido, se ainda não anunciou neste mês, ele posta e registra o horário. Se o bot estava offline no dia, ele recupera ao iniciar, desde que o dia já tenha passado neste mês. `patreonannounce` posta um imediatamente, o que também conta como a postagem deste mês.

Sem uma mensagem personalizada, o bot posta um agradecimento padrão que inclui a contagem de apoiadores ativos e a receita mensal. Defina a sua com `patreonmsg <text or embed code>` ou com o editor de mensagem do anúncio no painel. O texto passa pelo analisador de embeds. Use `-` para voltar ao padrão.

### Placeholders

Estes funcionam na mensagem do anúncio, junto com os placeholders usuais de servidor e canal.

| Placeholder | Valor |
| --- | --- |
| `%month%` | Nome do mês atual |
| `%year%` | Ano atual |
| `%patreon.link%` | `https://patreon.com` |
| `%supporter.count%` | Apoiadores ativos |
| `%supporter.total%` | Todos os apoiadores já registrados |
| `%supporter.new%` | Novos apoiadores neste mês |
| `%supporter.former%` | Ex-apoiadores |
| `%supporter.linked%` | Apoiadores com uma conta do Discord vinculada |
| `%revenue.monthly%` | Contribuições mensais atuais |
| `%revenue.average%` | Contribuição média |
| `%revenue.lifetime%` | Receita total acumulada |
| `%growth.new%` | Novos apoiadores neste mês |
| `%top.supporter.name%` | Apoiador com a maior contribuição |
| `%top.supporter.amount%` | A contribuição dele |
| `%patron.name%` | Apoiador com a maior contribuição, igual a `%top.supporter.name%` |
| `%patron.tier%` | O nível em que esse apoiador está, ou "Unknown" se o Patreon não informou um |
| `%patron.amount%` | A contribuição mensal dele, igual a `%top.supporter.amount%` |
| `%tiers.count%` | Número de níveis |
| `%tier.popular%` | Nível com mais apoiadores |
| `%tier.popular.count%` | Quantos estão nele |
| `%supporters.summary%` | Frase pronta sobre a contagem de apoiadores |
| `%revenue.summary%` | Frase pronta sobre a receita |
| `%growth.summary%` | Frase pronta sobre o crescimento |

> [!EXAMPLE]
> `It's %month%! Thanks to %supporters.summary%%revenue.summary%!%growth.summary%` é renderizado como "It's December! Thanks to our 25 incredible supporters who help us raise $150/month! We gained 3 new supporters this month!"

## Reconhecendo novos apoiadores

`patreonrecognize [#channel]` posta um embed de boas-vindas para apoiadores cuja contribuição começou nos últimos sete dias, até cinco por execução, no canal informado ou no atual. É um comando manual, não um agendamento, então execute-o depois de uma sincronização. Executá-lo duas vezes posta as mesmas pessoas duas vezes.

## Configurações

O painel tem quatro abas: **Visão geral**, **Apoiadores**, **Vínculo de níveis** e **Configuração**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Canal de anúncios | nenhum | Onde vai a postagem mensal; nenhum significa que os anúncios estão desativados |
| Dia do anúncio (1-28) | nenhum | Dia do mês para postar; os anúncios não disparam até que um seja definido |
| Mensagem do anúncio | agradecimento integrado | Texto ou embed personalizado com os placeholders acima |
| Ativar anúncios | desativado | Se a postagem mensal é enviada |
| Ativar sincronização de cargos | desativado | Se os cargos vinculados são aplicados aos apoiadores |
| Vínculos de níveis | nenhum | Qual cargo cada nível concede |

## Passo a passo de configuração

1. Abra **Patreon** no painel e clique no botão de conectar. Entre com a conta do dono da campanha e aprove o acesso.
2. Aguarde a primeira sincronização e depois confira se a aba **Apoiadores** mostra seus patronos.
3. Em **Vínculo de níveis**, vincule cada nível a um cargo. Crie os cargos primeiro e coloque o cargo do bot acima deles.
4. Marque **Ativar sincronização de cargos** e depois execute `patreonsyncall` para aplicar os cargos a todos que já estão vinculados.
5. Em **Configuração**, escolha o **Canal de anúncios** e o **Dia do anúncio**, escreva uma mensagem com os placeholders e marque **Ativar anúncios**.
6. Execute `patreonannounce` uma vez para ver o resultado no canal.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `patreonsync` | `ptsync` | Dono do bot | Posta o link de autorização OAuth |
| `patreonch [#channel]` | `ptch` | Administrador | Mostra ou define o canal de anúncios |
| `patreondisable` | `ptdisable` | Administrador | Limpa o canal, desativando os anúncios |
| `patreonmsg [text]` | `ptmsg` | Administrador | Mostra ou define a mensagem do anúncio, `-` para redefinir |
| `patreonday [day]` | `ptday` | Administrador | Mostra ou define o dia do mês |
| `patreontoggle` | `pttoggle` | Administrador | Ativa ou desativa os anúncios |
| `patreonconfig` | `ptconfig` | Administrador | Mostra o status, o canal, o dia, a mensagem e a última postagem |
| `patreonannounce` | `ptannounce` | Administrador | Envia o anúncio agora |
| `patreonhelp` | `pthelp` | Ninguém | Lista de placeholders e visão geral dos comandos |
| `patreonsupporters` | `ptsupporters` | Administrador | Lista os apoiadores ativos |
| `patreontop [count]` | `pttop` | Ninguém | Principais apoiadores por contribuição |
| `patreonstats` | `ptstats` | Administrador | Resumo de apoiadores e receita |
| `patreonanalytics` | `ptanalytics` | Administrador | Análises detalhadas |
| `patreonlink <user> <patreonUserId>` | `ptlink` | Administrador | Vincula um membro a um usuário do Patreon |
| `patreonrolesync` | `ptrolesync` | Gerenciar cargos | Alterna a sincronização automática de cargos |
| `patreontiermap <tierId> <role>` | `pttiermap` | Gerenciar cargos | Vincula um nível a um cargo |
| `patreonroles` | `ptroles` | Administrador | Lista os níveis com seus IDs e cargos |
| `patreonsyncall` | `ptsyncall` | Gerenciar cargos | Aplica os cargos a todos os apoiadores vinculados |
| `patreonrecognize [#channel]` | `ptrecognize` | Administrador | Dá destaque aos apoiadores dos últimos sete dias |

## Dicas e armadilhas

- Somente apoiadores que conectaram o Discord no perfil do Patreon, ou que foram vinculados com `patreonlink`, podem receber cargos.
- A sincronização de cargos escolhe um cargo por apoiador, o melhor nível que a contribuição dele cobre. Acumular vários cargos de nível não é suportado.
- Os anúncios são postados no máximo uma vez por mês do calendário. Executar `patreonannounce` no dia 3 significa que a postagem agendada do dia 15 é pulada naquele mês.
- O dia do anúncio é em UTC.
- O anúncio mensal é sobre a campanha inteira, então `%patron.name%`, `%patron.tier%` e `%patron.amount%` descrevem o apoiador ativo com a maior contribuição, e não cada patrono em sequência. Use `patreonrecognize` para destaques individuais.
- Reconectar com uma conta diferente do Patreon troca a campanha, mas mantém os vínculos antigos, então revise a aba **Vínculo de níveis** depois.

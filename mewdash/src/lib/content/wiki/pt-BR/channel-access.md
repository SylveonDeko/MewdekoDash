---
title: Acesso a Canais
slug: channel-access
summary: Proteja um canal privado com um formulário de candidatura e deixe os membros que já estão dentro votarem em quem entra.
icon: fa-lock
category: Security
dashboard: /dashboard/channel-access
module: ChannelAccess
tags: [channel access, gate, application, apply, vote, private channel, locked channel, inner circle, blacklist, review, acesso a canais, portão, candidatura, votação, canal privado, canal bloqueado, círculo interno, lista negra, análise]
related: [administration, tickets, forms]
---

## O que ele faz

A equipe coloca um "portão" em um canal que a maioria dos membros não consegue ver. Os membros clicam em um botão **Candidatar-se ao acesso**, ou executam `channelaccessapply`, e preenchem um pequeno formulário de até cinco perguntas. A candidatura é postada como um embed em um canal de análise, com os botões **Aprovar**, **Negar** e, opcionalmente, **Abster-se** e **Detalhamento**.

As pessoas que já podem ver o canal votam. Quando chegam aprovações suficientes, o candidato é admitido, seja recebendo um cargo, seja ganhando uma sobrescrita de permissão pessoal no canal. Recusas suficientes, ou o fim da janela de votação, o rejeitam. A equipe pode forçar qualquer um dos resultados a qualquer momento.

O candidato é informado do resultado por DM, se o portão permitir, e os candidatos negados precisam esperar um cooldown antes de se candidatar de novo. Tudo é registrado em um canal de logs opcional.

## Por que usar

- Um lounge exclusivo para membros ou "círculo interno" em que os membros atuais decidem quem entra.
- Um canal de adultos verificados em que um pequeno grupo de confiança dá o aval a quem chega.
- Canais de trocas ou de marketplace que querem uma verificação antes de alguém poder postar.
- Qualquer canal em que você queira uma candidatura por escrito sem que a equipe precise ler todas elas pessoalmente.

## Portões

Um portão é um canal mais as suas regras. Cada canal pode ter um portão. Criar um portão com um cargo o torna um **portão de cargo**; criar um sem cargo o torna um **portão direto**.

| Modo de concessão | Rótulo no painel | Como o acesso é dado | Quem conta como "dentro" |
| --- | --- | --- | --- |
| Cargo | Dar um cargo a eles | O cargo de acesso é adicionado ao candidato | Qualquer pessoa com o cargo de acesso |
| Permissão do canal | Adicioná-los diretamente ao canal | Uma sobrescrita que permite Ver Canal é gravada para esse membro | Qualquer pessoa que possa ver o canal no momento |

Os membros aprovados nunca são removidos automaticamente. Retire o cargo ou exclua a sobrescrita você mesmo.

## Candidaturas

Antes de uma candidatura ser aberta, o bot verifica, nesta ordem: o portão está aceitando candidaturas, o membro ainda não tem acesso, não está bloqueado, a conta e a entrada no servidor são antigas o bastante, não há uma candidatura aberta dele para este portão e o cooldown para se candidatar de novo já passou. Falhar em qualquer verificação retorna uma mensagem efêmera explicando o motivo.

Se o portão tiver perguntas, um modal é aberto com uma caixa por pergunta. As perguntas são limitadas a 45 caracteres por causa dos limites de modal do Discord. As caixas de resposta são de linha única (200 caracteres) ou de várias linhas (1000 caracteres) e podem ser marcadas como obrigatórias. Um portão sem perguntas envia a candidatura imediatamente.

A mensagem de análise vai para o **Canal de análise**, ou para o próprio canal restrito quando nenhum está definido. Ela mostra o candidato, quando a conta dele foi criada e quando ele entrou, cada pergunta e resposta, uma contagem de votos ao vivo e um rodapé com o momento em que a votação fecha. Se **Ocultar o candidato até o fim da votação** estiver ativado, o nome é substituído por "Oculto até o fim da votação" enquanto a candidatura estiver pendente.

### Status

| Status | Significado |
| --- | --- |
| Pendente | Aberta e em votação |
| Aprovada | Aprovada, o acesso foi concedido |
| Negada | Rejeitada por votação, expiração ou pela equipe |
| Retirada | O candidato a retirou com `channelaccesswithdraw` |
| Expirada | Não é usada pelas regras de expiração atuais; mantida para o histórico |

## Votação

Quem pode votar depende do portão. Se um **Cargo de votante** estiver definido, apenas membros com esse cargo podem votar. Caso contrário, qualquer pessoa que já tenha acesso ao canal, mais qualquer pessoa com Gerenciar Cargos, pode votar. Os candidatos nunca podem votar na própria candidatura.

Clicar em um botão registra um voto. Clicar em um botão diferente o altera. Clicar no mesmo botão de novo o remove. A contagem é atualizada na mensagem após cada mudança.

A candidatura é resolvida assim que as aprovações atingem **Aprovações necessárias** ou as recusas atingem **Recusas necessárias**. Definir qualquer um dos limites como 0 desativa esse lado, então um portão com **Recusas necessárias** em 0 só pode ser negado pela equipe ou por expiração.

**Detalhamento** mostra quem votou de cada lado, apenas para os votantes. Com **Ocultar quem votou em cada lado** ativado, apenas membros com Gerenciar Cargos podem vê-lo.

### Quando a janela fecha

Uma verificação em segundo plano é executada a cada minuto para as candidaturas que passaram da **Janela de votação**. O que acontece é definido por portão:

| Opção | Rótulo no painel | Resultado |
| --- | --- | --- |
| Deny | Negar a candidatura | A candidatura é negada. Padrão. |
| Majority | O lado com mais votos | Aprovada se as aprovações superarem as recusas; caso contrário, negada |
| StayOpen | Deixar aberta para a equipe | Nada acontece até que a equipe a resolva |

Defina a **Janela de votação** como 0 para não ter limite de tempo.

## Bloqueando candidatos

A equipe pode bloquear um usuário em um portão ou em todos os portões do servidor. Os usuários bloqueados recebem "Você está impedido de se candidatar a este canal" quando tentam. Os bloqueios têm um motivo opcional, que aparece na lista negra.

## Configurações

A página **Acesso a Canais** tem três abas: **Portões**, **Inscrições** e **Bloqueados**.

**Portões** lista todos os portões com uma chave **Aceitando candidaturas** e se expande para mostrar as configurações, as **Perguntas da candidatura** e um publicador do **Painel de candidatura**. Os padrões abaixo valem para novos portões.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Canal bloqueado | obrigatório | O canal protegido pelo portão |
| Como as pessoas entram | Dar um cargo a eles | Portão de cargo ou portão direto |
| Cargo concedido na aprovação | nenhum | O cargo de acesso, para portões de cargo |
| Aprovações necessárias | 3 | Aprovações que resolvem como aprovada; 0 desativa |
| Recusas necessárias | 3 | Recusas que resolvem como negada; 0 desativa |
| Janela de votação (horas) | 72 | Tempo antes de a regra de expiração ser executada; 0 para sem limite |
| Quando a janela fechar | Negar a candidatura | Uma das três opções de expiração |
| Canal de análise | o próprio canal restrito | Onde as candidaturas são postadas para votação |
| Canal de logs | sem registro | Onde as novas candidaturas e os resultados são registrados |
| Cargo de votante | todos com o cargo de acesso | Restringe a votação a um cargo |
| Mencionar cargo em novas candidaturas | sem menção | Cargo mencionado quando uma candidatura chega |
| Idade mínima da conta (dias) | 0 | Rejeita contas mais novas que isto |
| Tempo mínimo no servidor (dias) | 0 | Rejeita membros que entraram há menos tempo que isto |
| Cooldown para se candidatar novamente (horas) | 168 | Espera após uma negação ou expiração antes de se candidatar de novo |
| Oferecer um botão de abstenção | ativado | Adiciona um botão Abster-se à mensagem de análise |
| Ocultar o candidato até o fim da votação | desativado | Candidato anônimo enquanto pendente |
| Ocultar quem votou em cada lado | desativado | Detalhamento apenas para Gerenciar Cargos |
| Enviar DM ao candidato com a decisão | ativado | Envia o resultado por DM |

**Inscrições** lista as candidaturas filtradas por portão e status, com a contagem e os botões **Aprovar** e **Negar** para as pendentes. **Bloqueados** lista os usuários bloqueados por escopo e permite **Bloquear** alguém em um portão ou em **Cada portão**, com um motivo opcional.

## Passo a passo de configuração

1. Torne o canal privado no Discord e, para um portão de cargo, crie o cargo que pode vê-lo.
2. Abra **Acesso a Canais** no painel e use **Abrir candidaturas para um canal**. Escolha o **Canal bloqueado**, selecione **Como as pessoas entram** e escolha o cargo, se necessário.
3. Expanda o portão. Defina um **Canal de análise** para que as candidaturas não caiam no canal restrito e um **Canal de logs** se quiser um registro.
4. Ajuste **Aprovações necessárias**, **Recusas necessárias** e a **Janela de votação** de acordo com quantos votantes você espera.
5. Em **Perguntas da candidatura**, adicione até cinco perguntas. Marque **Obrigatório** e **Resposta com várias linhas** conforme necessário.
6. Em **Painel de candidatura**, escolha onde o botão deve ficar e clique em **Publicar painel**.
7. Candidate-se a partir de uma conta de teste, vote com um membro que tenha acesso e verifique se o candidato entra.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado). As versões de barra ficam em `/channelaccess`.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `channelaccesssetup <#channel> [@role]` | `casetup` | Gerenciar Cargos | Cria um portão; omita o cargo para um portão direto |
| `channelaccessremove <#channel>` | `caremove` | Gerenciar Cargos | Exclui um portão com suas perguntas e histórico |
| `channelaccesslist` | `calist` | Qualquer pessoa | Lista os portões com limites, janela e status |
| `channelaccessconfig <#channel> [setting] [value]` | `caconfig` | Gerenciar Cargos | Altera uma configuração; execute sem uma configuração para ver a lista |
| `channelaccesspanel <#channel> [#target]` | `capanel` | Gerenciar Cargos | Posta o botão de candidatura, no canal atual por padrão |
| `channelaccessquestionadd <#channel> <question>` | `caqadd` | Gerenciar Cargos | Adiciona uma pergunta obrigatória de várias linhas |
| `channelaccessquestionremove <#channel> <position>` | `caqremove` | Gerenciar Cargos | Remove uma pergunta pelo número listado |
| `channelaccessquestionlist <#channel>` | `caqlist` | Gerenciar Cargos | Mostra as perguntas em ordem |
| `channelaccessapply <#channel>` | `caapply` | Qualquer pessoa | Posta o botão de candidatura para você |
| `channelaccesswithdraw <id>` | `cawithdraw` | Qualquer pessoa | Retira a sua própria candidatura aberta |
| `channelaccesshistory [@user]` | `cahistory` | Qualquer pessoa | O seu histórico de candidaturas; outros usuários exigem Gerenciar Cargos |
| `channelaccesspending [#channel]` | `capending` | Qualquer pessoa | Lista as candidaturas abertas, opcionalmente de um portão |
| `channelaccessapprove <id> [reason]` | `caapprove` | Gerenciar Cargos | Aprova independentemente dos votos |
| `channelaccessdeny <id> [reason]` | `cadeny` | Gerenciar Cargos | Nega independentemente dos votos |
| `channelaccessblacklistadd <@user> [#channel]` | `cabladd` | Gerenciar Cargos | Bloqueia em um portão, ou em todos sem canal |
| `channelaccessblacklistremove <@user> [#channel]` | `cablremove` | Gerenciar Cargos | Remove um bloqueio; informe o mesmo canal em que ele foi definido |
| `channelaccessblacklist` | `cablacklist` | Gerenciar Cargos | Lista os usuários bloqueados |

As configurações aceitas por `channelaccessconfig` são `enabled`, `approvals`, `denials`, `votehours`, `onexpiry` (`deny`, `majority`, `stayopen`), `reviewchannel`, `logchannel`, `voterrole`, `pingrole`, `anonymousapplicant`, `anonymousvotes`, `allowabstain`, `minaccountage`, `minserverage`, `reapplycooldown` e `dmondecision`.

> [!EXAMPLE]
> `caconfig #inner-circle approvals 5` e depois `caconfig #inner-circle onexpiry majority`.

## Dicas e armadilhas

- O bot precisa de Gerenciar Cargos para portões de cargo e de Gerenciar Canais (com permissão para editar as sobrescritas desse canal) para portões diretos. O cargo mais alto dele deve estar acima do cargo de acesso.
- Se nenhum **Canal de análise** estiver definido, as candidaturas são postadas dentro do canal restrito. Isso funciona para "os membros votam nos recém-chegados", mas defina um canal separado se a equipe deve votar.
- As perguntas adicionadas por comando são sempre obrigatórias e de várias linhas. Use o painel para tornar uma pergunta opcional ou de linha única, ou para dar a ela um texto de exemplo.
- Excluir um portão remove permanentemente as suas perguntas, candidaturas e votos.
- Membros que saem do servidor antes de a votação terminar não recebem acesso, mesmo que aprovados.
- Os resultados de votação e expiração só geram DM para aprovações e recusas. Candidaturas retiradas não recebem DM.
- Um usuário bloqueado precisa ser desbloqueado com o mesmo escopo com que o bloqueio foi feito. Um bloqueio em todo o servidor não é removido por um desbloqueio que cita um canal.

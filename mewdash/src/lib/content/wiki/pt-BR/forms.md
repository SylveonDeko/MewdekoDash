---
title: Formulários
slug: forms
summary: Crie candidaturas, pesquisas, apelações de banimento e solicitações de entrada no painel, colete respostas por um link compartilhável e aprove ou rejeite pelo Discord ou pela fila de respostas.
icon: fa-clipboard
category: Community
dashboard: /dashboard/forms
module: Forms
tags: [forms, application, survey, questionnaire, ban appeal, join application, review, approve, reject, responses, csv, formulários, candidatura, pesquisa, questionário, apelação de banimento, solicitação de entrada, análise, aprovar, rejeitar, respostas]
related: [administration, moderation, rolestates]
---

## O que faz

A equipe cria um formulário no painel: um nome, um conjunto de perguntas e regras sobre quem pode responder e o que acontece depois. Publicá-lo gera um link de compartilhamento permanente. Um membro abre o link, entra com o Discord, preenche as perguntas página por página, revisa as respostas e envia. O progresso é salvo como rascunho enquanto ele digita, então ele pode voltar mais tarde.

Cada envio é publicado como um embed no canal que você escolher, com botões **Aprovar** e **Rejeitar** se o formulário precisar de uma decisão. Os revisores pressionam um botão no Discord ou usam a aba **Respostas** no painel. Quem enviou recebe uma DM com a decisão e quaisquer observações, e pode acompanhá-la em uma página de status a qualquer momento.

Os formulários têm três tipos. Um formulário comum é para membros. Um formulário de apelação de banimento é para pessoas atualmente banidas, e aprová-lo as desbane. Uma solicitação de entrada é para pessoas de fora do servidor, e aprová-la envia a elas um convite de uso único, com cargos esperando por elas quando entrarem.

Não há comandos para formulários. Tudo, exceto os dois botões de análise, acontece no painel.

## Por que usar

- Candidaturas para equipe, parceria ou eventos com uma fila de análise adequada em vez de uma pilha de DMs.
- Um processo de apelação de banimento com períodos de espera, limites de tentativas e desbanimento automático na aprovação.
- Uma comunidade fechada em que os candidatos são avaliados antes de receber um convite.
- Pesquisas de feedback com limite de respostas e exportação em CSV.

## Tipos de formulário

| Tipo | Quem pode enviar | Na aprovação |
| --- | --- | --- |
| Formulário comum | Membros, ou qualquer pessoa se **Permitir pessoas de fora do servidor** estiver ativado | Apenas mudanças de cargo, se configuradas |
| Apelação de banimento | Pessoas atualmente banidas do servidor | O banimento é removido |
| Solicitação de entrada | Pessoas que não estão no servidor | Um convite é criado e os **Cargos à espera ao entrar** são salvos como um estado de cargo, para serem aplicados quando a pessoa entrar |

O tipo é fixo depois que o formulário é criado. As apelações de banimento e as solicitações de entrada sempre passam por análise; os formulários comuns só passam se **Respostas precisam de aprovação** estiver ativado.

## Perguntas

As perguntas são adicionadas no construtor, em **Perguntas**. Os tipos são:

| Tipo | Resposta | Opções |
| --- | --- | --- |
| Texto curto | Uma linha | Tamanho mínimo e máximo, até 5000 |
| Texto longo | Várias linhas | Os mesmos limites de tamanho |
| Múltipla escolha | Uma das opções listadas | Até 25 opções |
| Caixas de seleção | Várias opções | Até 25 opções; **Valor mínimo** e **Valor máximo** limitam quantas podem ser marcadas |
| Lista suspensa | Uma opção de uma lista | Até 25 opções |
| Número | Um número | Valor mínimo e máximo |
| E-mail | Um endereço de e-mail válido | |
| URL | Um endereço `http` ou `https` | |
| Quebra de seção | Nada; inicia uma nova página e pode ter um título e uma introdução | |

O texto da pergunta é limitado a 500 caracteres, os textos de exemplo a 200 e qualquer resposta a 4000 caracteres. Cada pergunta pode ter uma URL de imagem e ser marcada como obrigatória. Uma pergunta também pode ser obrigatória somente quando uma resposta anterior atende a uma condição.

### Inserção de respostas

Ative a inserção de respostas em uma pergunta e escreva `{{Q12}}` no texto ou no texto de exemplo dela, em que 12 é o ID de uma pergunta anterior. A resposta anterior é inserida, cortada em 100 caracteres. Se ela não foi respondida, o texto da pergunta aparece entre colchetes no lugar. Uma pergunta só pode inserir respostas de perguntas acima dela.

### Condições

Cada pergunta pode ser exibida somente quando uma condição é verdadeira. As perguntas ocultas são puladas na página, e quaisquer respostas enviadas para elas são descartadas no servidor.

| Tipo de condição | Exibida quando |
| --- | --- |
| Baseada em resposta | Uma resposta anterior corresponde: **É igual a**, **É diferente de**, **Contém**, **Maior que** ou **Menor que** |
| Baseada em cargo | O membro tem **Qualquer um**, **Todos** ou **Nenhum** dos cargos escolhidos |
| Tempo no servidor | O membro está no servidor há pelo menos N dias, ou a conta dele tem pelo menos N dias |
| Boost/Nitro | O membro está impulsionando. A verificação de Nitro é uma estimativa a partir de dados de avatar e boost. |
| Baseada em permissão | O membro tem todas as permissões escolhidas |
| Várias condições | Várias linhas combinadas. As linhas do mesmo grupo devem ser todas verdadeiras (E); se qualquer grupo for verdadeiro, a pergunta é exibida (OU). |

As comparações de texto ignoram maiúsculas e minúsculas. Maior que e menor que comparam números.

## Quem pode enviar

O formulário recusa as pessoas, com um motivo, nesta ordem: ainda é um rascunho, não está aceitando respostas, ainda não chegou a **Abre em**, passou de **Encerra em**, a conta é mais nova que a **Idade mínima da conta do Discord**, o limite de **Total de respostas aceitas** está cheio, a pessoa já respondeu e as respostas múltiplas estão desativadas, ela não tem o **Cargo necessário para enviar** e, por fim, a regra do tipo acima.

**Deixar pessoas rejeitadas tentarem de novo** significa que uma resposta rejeitada deixa de contar como "já respondeu". Se **Exigir captcha** estiver ativado, uma verificação do Cloudflare Turnstile aparece na etapa de revisão.

As apelações de banimento adicionam seus próprios limites em **Limites de apelação**: uma espera após o banimento (medida a partir da entrada do banimento no registro de auditoria), um número máximo de apelações, um cooldown entre as apelações e **Uma rejeição é definitiva**. Uma apelação ainda pendente bloqueia uma nova.

## Preenchendo um formulário

A página pública exige login no Discord. As respostas são salvas como rascunho cerca de um segundo e meio depois da última tecla e ao passar para a próxima página. Voltar em até 30 dias restaura o rascunho com um aviso "We brought back what you had already written" ("Recuperamos o que você já tinha escrito") e um botão **Recomeçar**.

Uma barra de progresso mostra as perguntas respondidas. A última página termina com **Revisar e continuar**, que lista todas as respostas com um link **Editar**, e depois **Confirmar e enviar**. Em seguida, a página mostra sua **Mensagem após o envio** (ou uma padrão por tipo) e um link **Verifique seu status**. A página de status também leva a **Meus envios**, em `/forms/submissions`, que lista todas as respostas não anônimas que o usuário conectado fez em todos os servidores.

Quem enviou pode editar as respostas pela página de status enquanto a resposta ainda estiver pendente, desde que o formulário não seja anônimo e não tenha sido encerrado. As respostas anteriores são mantidas como revisões. Não há como quem enviou retirar uma resposta.

## O que acontece ao enviar

1. Os cargos em **Cargos dados ao enviar** e o **Cargo enquanto aguarda análise** são concedidos.
2. Se **Onde as respostas são publicadas** estiver definido, um embed é publicado lá mostrando o usuário (ou "Anonymous (login required)"), a hora e até 20 respostas, mencionando **Mencionar quando chegar uma resposta**. Os botões Aprovar e Rejeitar são anexados quando o formulário é analisado.
3. Se **Enviar para um webhook** estiver definido, o mesmo embed é publicado nesse webhook, sem os botões. Quando a resposta é aprovada ou rejeitada depois, uma segunda mensagem com o resultado, o revisor e o motivo também vai para o webhook. A URL deve ser de um webhook do Discord; qualquer outra coisa é ignorada com um aviso no log do bot, e um webhook que falha nunca bloqueia o envio.
4. A resposta aparece na aba **Respostas** com o status Aguardando análise.

Os formulários anônimos não armazenam ID de usuário, então não podem alterar cargos e suas respostas não podem ser editadas.

## O processo de análise

As respostas passam de Aguardando análise para Aprovado ou Rejeitado. **Quem pode aprovar ou rejeitar** indica um cargo; quem tem Gerenciar servidor ou Administrador sempre pode decidir. Se nenhum cargo de revisor estiver definido, quem tem os cargos de aprovação também pode decidir.

No Discord, **Aprovar** decide imediatamente. **Rejeitar** abre um modal pedindo um motivo, que é obrigatório porque é enviado a quem respondeu. Em ambos os casos, o embed muda de cor, ganha um campo **Aprovado** ou **Rejeitado** com o revisor e a hora, o motivo se houver, e perde seus botões. No painel, a mesma decisão é tomada pela fila com uma caixa de **Observações para quem enviou**.

Em uma decisão, o bot:

- Adiciona e remove os cargos em **Adicionar ao aprovar**, **Remover ao aprovar**, **Adicionar ao rejeitar** e **Remover ao rejeitar**, e sempre remove o cargo de aguardando análise. Um cargo listado dos dois lados é removido.
- Desbane o usuário em uma apelação de banimento aprovada, ou cria o convite em uma solicitação de entrada aprovada.
- Envia uma DM a quem respondeu com "Your response was approved" ou "Your response was not accepted" com as observações, sua **Mensagem após o envio** na aprovação e o convite. Se a DM falhar, o embed e a fila informam isso.

Os emojis dos botões de análise vêm do formulário, depois dos **Padrões do servidor** na aba **Configurações**, e por fim de um simples visto e um X.

## Versões

Cada salvamento de um formulário guarda uma versão, até as últimas 20. O **Histórico de versões** mostra cada uma com um comparativo de configurações e perguntas e um botão **Restaurar**. Restaurar recria as perguntas com novos IDs e reescreve as condições e inserções para corresponder.

## Configurações

A página de **Formulários** tem as abas **Formulários**, **Criar** e **Configurações**, além de **Editar** e **Respostas** quando um formulário está selecionado. As abas Criar e Editar compartilham um único painel de configurações.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Nome | vazio, obrigatório | Título do formulário, até 255 caracteres |
| Descrição | vazia | Exibida abaixo do título e nas prévias de link do Discord |
| Onde as respostas são publicadas | nenhum | Canal do embed de envio; vazio mantém as respostas apenas no painel |
| Mensagem após o envio | nenhuma | Texto na página de confirmação e na DM de aprovação |
| Rascunho | ativado em formulários novos | Não é possível enviar para rascunhos |
| Aceitando respostas | ativado | Desative para encerrar sem excluir |
| Cargo necessário para enviar | Qualquer pessoa no servidor | Restringe por cargo |
| Idade mínima da conta do Discord | Sem limite | Dias |
| Permitir pessoas de fora do servidor | desativado | Somente formulários comuns |
| Enviar anonimamente | desativado | Não registra quem enviou |
| Abre em, Encerra em | nenhum | Janela; um anúncio de lançamento precisa de um horário de abertura |
| Total de respostas aceitas | Sem limite | Limite somando todas as pessoas |
| Permitir mais de uma resposta por pessoa | desativado | |
| Deixar pessoas rejeitadas tentarem de novo | desativado | |
| Exigir captcha | desativado | Turnstile na etapa de revisão |
| Anunciar a abertura em, Mencionar com o anúncio, Texto do anúncio | nenhum | Embed de lançamento com contagem regressiva para o encerramento, enviado cerca de um minuto após **Abre em** ou ao publicar |
| Mencionar quando chegar uma resposta | nenhum | Cargo mencionado a cada envio |
| Cargos dados ao enviar | nenhum | Concedidos imediatamente |
| Cargo enquanto aguarda análise | nenhum | Removido na decisão |
| Enviar para um webhook | nenhum | URL de webhook do Discord que também recebe cada embed de envio e cada decisão de aprovar ou rejeitar |
| Respostas precisam de aprovação | desativado | Adiciona análise a um formulário comum |
| Quem pode aprovar ou rejeitar | Somente Gerenciar servidor | Cargo de revisor |
| Emoji do botão de aprovar, Emoji do botão de rejeitar | padrão do servidor | |
| Adicionar/Remover ao aprovar, Adicionar/Remover ao rejeitar | nenhum | Mudanças de cargo na decisão |
| Uma rejeição é definitiva, Espera após o banimento, Apelações permitidas, Espera entre apelações | desativado, Sem espera, Ilimitado, Sem espera | Somente apelações de banimento |
| Vezes que o convite pode ser usado, O convite expira após (segundos), Cargos à espera ao entrar | 1, 86400, nenhum | Somente solicitações de entrada |

As configurações que não se aplicam ao tipo do formulário são descartadas ao salvar.

## Passo a passo de configuração

1. Abra **Formulários** no painel e pressione **Criar**.
2. Escolha o **Tipo de formulário**. Isso não pode ser alterado depois.
3. Preencha **Nome** e **Descrição** e escolha **Onde as respostas são publicadas**.
4. Em **Perguntas**, adicione perguntas, marque as obrigatórias e use **Adicionar página** para dividir formulários longos.
5. Defina quem pode enviar e, se quiser uma etapa de análise, ative **Respostas precisam de aprovação** e escolha **Quem pode aprovar ou rejeitar**.
6. Pressione **Salvar formulário**. Use **Prévia** no cartão do formulário para percorrê-lo como administrador.
7. Pressione **Publicar** no cartão, depois **Copiar link** e publique o link onde os candidatos o encontrarão.
8. Acompanhe a aba **Respostas**, ou o canal de envio, e decida cada resposta.

## Comandos

Os formulários não têm comandos de texto nem de barra. A única interação no Discord são os botões **Aprovar** e **Rejeitar** em cada embed de envio.

## Dicas e armadilhas

- O bot precisa de Gerenciar cargos, e o cargo dele deve ficar acima de todos os cargos que um formulário dá ou remove. Cargos acima do bot, cargos gerenciados e o everyone são ignorados em silêncio.
- As apelações de banimento precisam de Ver registro de auditoria para a verificação de "espera após o banimento". Desbanir exige Banir membros, e os convites das solicitações de entrada exigem Criar convite em um canal visível para todos.
- O embed de envio mostra no máximo 20 respostas; a resposta completa está no painel.
- **Exportar CSV** na aba Respostas inclui uma coluna por pergunta, com as respostas de seleção múltipla separadas por ponto e vírgula.
- O filtro e a página de respostas fazem parte da URL, então você pode salvar "somente pendentes" nos favoritos e compartilhar com os revisores.
- Os rascunhos nunca são validados, então um rascunho restaurado ainda pode falhar na validação na hora do envio.
- Os formulários expirados são encerrados por uma verificação que roda a cada minuto; a elegibilidade também é verificada na hora do envio, então nada escapa nesse intervalo.

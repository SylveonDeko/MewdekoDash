---
title: Feedback de Saída
slug: leave-feedback
summary: Quando um servidor remove o bot, o dono recebe uma DM perguntando o motivo. As respostas são coletadas em uma página do painel exclusiva para donos.
icon: fa-comments
category: Analytics
dashboard: /owner/leave-feedback
tags: [leave feedback, kick feedback, why removed, churn, exit survey, owner only, bot owner, feedback de saída, feedback de expulsão, motivo da remoção, cancelamento, pesquisa de saída, somente dono, dono do bot]
related: [invites]
---

## O que faz

Sempre que o bot é expulso de um servidor ou sai dele, ele envia ao dono do servidor uma DM curta. A DM tem um menu suspenso com motivos comuns, um botão **Escrever algo** que abre uma caixa de texto e um botão **Não, obrigado**. Responder é opcional, e a DM informa isso.

Cada resposta é armazenada com o nome do servidor, sua quantidade de membros, seu dono e o tempo em que o bot esteve nele. Se um canal de relatórios estiver definido, um embed de resumo também é publicado ali, e é atualizado se o dono adicionar um comentário depois.

Este é um recurso no nível do bot. Não há configuração por servidor, e a página do painel só aparece para o dono do bot.

> [!NOTE]
> Somente o dono do bot pode ver a página de Feedback de Saída. Outros usuários do painel não a veem na barra lateral e não conseguem abri-la.

## Por que usar

- Descobrir se os servidores saem por falta de recursos, dificuldade de configuração ou problemas de confiabilidade.
- Identificar servidores que só adicionaram o bot para testá-lo, para que as saídas deles possam ser ignoradas.
- Entrar em contato com donos que escreveram um comentário e deixaram informações de contato.
- Acompanhar com que frequência os donos se dão ao trabalho de responder.

## A pergunta

A DM tem o título "Lamentamos sua saída!" e explica que o bot acabou de ser removido do servidor informado. O menu suspenso oferece estes motivos, nesta ordem:

| Chave do motivo | Mostrado ao dono |
| --- | --- |
| `not_needed` | Não precisamos mais dele |
| `confusing` | Muito confuso para configurar |
| `missing_features` | Faltam recursos que queríamos |
| `unreliable` | Estava quebrado ou não era confiável |
| `other_bot` | Passamos a usar outro bot |
| `temporary` | É temporário, vou adicioná-lo de volta |
| `testing` | Estava só testando algo |

Escolher um motivo salva imediatamente e oferece novamente a caixa de texto. A caixa de texto é um campo de parágrafo único, "O que poderíamos ter feito melhor?", limitado a 1000 caracteres. **Não, obrigado** marca o registro como dispensado e ele nunca é reportado.

Regras que evitam que isso seja incômodo:

- Um servidor é consultado no máximo uma vez a cada trinta dias, não importa quantas vezes adicione e remova o bot.
- Se as DMs do dono estiverem fechadas, nada é armazenado.
- Nada é enviado quando o recurso está desativado.

## Status

Cada registro acaba em um de três estados, pelos quais o painel filtra.

| Status | Significado |
| --- | --- |
| Respondido | O dono escolheu um motivo ou escreveu um comentário |
| Dispensado | O dono clicou em **Não, obrigado** |
| Sem resposta | A DM foi enviada e nada voltou ainda |

## Configurações

A página tem duas abas, **Respostas** e **Configurações**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Perguntar aos donos por que o bot foi removido | ativado | Se a DM é enviada |
| ID do canal de relatório | vazio | Canal que recebe um embed de resumo por resposta. Vazio usa como alternativa o canal de log de entrada/saída do bot. |

Abaixo do campo de canal, a página mostra a qual canal e servidor o ID corresponde e se o bot consegue acessá-lo.

A aba **Respostas** tem seis contadores, **Perguntas enviadas**, **Respondido**, **Com comentário**, **Dispensado**, **Sem resposta** e **Taxa de resposta**, um detalhamento de **Motivos informados** e uma tabela com as colunas **Saída**, **Servidor**, **Motivo** e **Status**. Você pode filtrar por motivo e status (o filtro de status também tem a opção **Deixou um comentário**), pesquisar pelo nome do servidor ou pelo texto do comentário, abrir uma linha para ler o comentário completo e excluir um registro. **Taxa de resposta** soma as perguntas respondidas e dispensadas.

## Passo a passo de configuração

1. Entre no painel com a conta do dono do bot e abra **Feedback de Saída**.
2. Na aba **Configurações**, confirme que **Perguntar aos donos por que o bot foi removido** está ativado. Ele vem ativado por padrão.
3. Cole um ID de canal em **ID do canal de relatório** e clique em **Salvar canal**, ou deixe-o vazio para usar o canal de entrada/saída.
4. Remova o bot de um servidor de teste que você possui e responda à DM.
5. Confira a aba **Respostas** e o canal de relatórios para ver o registro.

## Comandos

Este recurso é somente do painel. Não há comandos do bot; os donos respondem pelos botões e pelo menu suspenso na DM.

## Dicas e pegadinhas

- O bot só envia DM para a pessoa que o Discord lista como dono do servidor, não para quem o expulsou.
- O tempo de espera de trinta dias é por servidor, então um servidor que readiciona o bot e o remove de novo dentro desse período não é consultado duas vezes.
- O embed de resumo vai para o canal configurado ou, quando nenhum está definido, para o canal de log de entrada/saída das credenciais do bot. Se nenhum dos dois existir, as respostas continuam sendo armazenadas e visíveis na página.
- Excluir um registro pelo painel não apaga o embed já publicado no canal de relatórios.

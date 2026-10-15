---
title: Enquetes
slug: polls
summary: Publique enquetes com botões em um canal, restrinja quem pode votar, agende-as com antecedência, reutilize modelos e veja os resultados.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/polls
module: Games
tags: [poll, vote, survey, question, yes no, multiple choice, anonymous, scheduled poll, poll template, enquete, votação, pesquisa, pergunta, sim não, múltipla escolha, anônima, enquete agendada, modelo de enquete]
related: [votes, games]
---

## O que ele faz

A equipe publica uma pergunta com duas a vinte e cinco opções. O bot envia um embed com um botão por opção, ou um menu de seleção quando há mais de cinco, e os membros votam clicando. O embed mostra a contagem e a porcentagem ao vivo de cada opção. Abaixo das opções ficam três botões de gerenciamento: **Estatísticas**, **Encerrar** e **Excluir**.

Os membros podem mudar o voto clicando em outra opção, ou removê-lo clicando novamente na mesma opção, a menos que a troca de votos tenha sido desativada nessa enquete. Toda resposta do bot a um clique é privada para quem votou, para que o canal fique limpo.

As enquetes podem ser encerradas manualmente, podem expirar sozinhas após uma duração definida e podem ser agendadas para serem publicadas em uma data futura. Os modelos salvam uma pergunta e suas opções para que a mesma enquete possa ser publicada novamente com um único comando. O painel adiciona análises, exportação em CSV e JSON e comparação lado a lado de enquetes.

## Por que usar

- Escolha uma data ou um jogo para o próximo evento da comunidade.
- Faça uma verificação rápida de sim ou não antes de uma mudança nas regras.
- Faça uma pergunta sensível de forma anônima para que ninguém veja quem votou em quê.
- Deixe que apenas um cargo da equipe ou de booster vote em decisões que lhes dizem respeito.
- Publique a mesma enquete semanal toda segunda-feira a partir de um modelo, ou agende-a com antecedência.

## Tipos de enquete

| Tipo | Como vota |
| --- | --- |
| Sim / Não | Duas opções fixas, Sim e Não. Criada por `poll` e `/poll yesno`. |
| Escolha única | Uma opção por membro. O padrão para `pollc`, modelos e o painel. |
| Múltipla escolha | Os membros podem escolher várias opções. Com seis ou mais opções, o menu de seleção permite seleção múltipla. |
| Anônima | Os votos são armazenados sem mostrar o votante nas estatísticas ou exportações. |
| Restrita por cargo | Apenas membros com um dos cargos permitidos podem votar. Os demais recebem uma resposta privada de "não permitido". Somente no painel. |

Todas as enquetes também têm estas opções individuais, todas ativadas por padrão: **Permitir alterar votos**, **Mostrar resultados ao vivo** e **Mostrar barras de progresso**.

## Votação, encerramento e expiração

- Um voto em uma enquete encerrada ou expirada é rejeitado com uma mensagem privada.
- Se a troca de votos estiver desativada, um segundo clique é rejeitado como "já votou".
- Os botões **Encerrar** e **Excluir** funcionam para o criador da enquete e para quem tiver Gerenciar Mensagens. **Excluir** pede que você digite `DELETE` em um formulário de confirmação e então remove a enquete e a sua mensagem.
- **Estatísticas** mostra o total de votos, os votantes únicos e o detalhamento por opção, de forma privada, apenas para quem clicou.
- A expiração é verificada a cada cinco minutos. Quando uma enquete expira, seus botões são removidos e o rodapé muda para indicar que ela expirou.
- Enquetes agendadas são verificadas a cada minuto. Uma enquete agendada precisa estar no futuro e a no máximo trinta dias de distância. Ela pode ter uma duração em minutos, após a qual a enquete publicada expira.

## Modelos

Um modelo guarda um nome, uma pergunta e suas opções. `polltemplate <name>` publica o modelo como uma enquete de escolha única. Os modelos são listados com `polltemplates`, criados e excluídos com `/poll create-template` e `/poll delete-template`, ou gerenciados na aba **Modelos** do painel, que também permite exportá-los e importá-los como arquivo. Um modelo tem no máximo vinte e cinco opções.

## Configurações

A página de Enquetes tem cinco abas: **Enquetes**, **Criar**, **Agendadas**, **Modelos** e **Análises**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Pergunta | nenhum | O título da enquete |
| Tipo de enquete | Escolha única | Um dos cinco tipos acima |
| Canal | nenhum | Onde a enquete é publicada |
| Opções | duas em branco | Duas a vinte e cinco opções, cada uma com até 100 caracteres. Oculto para Sim / Não |
| Cargos que podem votar | nenhum | Exibido para enquetes Restritas por cargo |
| Duração (minutos) | aberta até ser encerrada | 1 a 20160 minutos. Aplicada quando a enquete é agendada |
| Agendar para depois | nenhum | Uma data e hora. Deixe vazio para publicar agora |
| Permitir alterar votos | ligado | Se um membro pode trocar ou remover o próprio voto |
| Mostrar resultados ao vivo | ligado | Se as contagens são mostradas enquanto a enquete está em andamento |
| Mostrar barras de progresso | ligado | Se barras são desenhadas ao lado das contagens |
| Salvar também como modelo | desligado | Salva a pergunta e as opções em **Nome do modelo** |

A aba **Enquetes** lista as enquetes com a caixa **Incluir enquetes encerradas**. Ao expandir uma enquete, são exibidos votantes únicos, participação, horário de pico e horário de criação, além da opção **Encerrar enquete**. **Agendadas** permite **Cancelar** uma enquete pendente. **Análises** mostra as enquetes deste mês, os votos registrados, a média de votos por enquete, o tipo favorito e um gráfico de enquetes por dia.

## Passo a passo

1. Abra **Enquetes** no painel e vá para a aba **Criar**.
2. Digite a **Pergunta**, escolha um **Tipo de enquete** e o **Canal**.
3. Preencha as **Opções**. Use o botão de remover para excluir as extras; pelo menos duas são obrigatórias.
4. Para uma enquete Restrita por cargo, escolha os **Cargos que podem votar**.
5. Opcionalmente, marque **Salvar também como modelo** e dê um nome a ele.
6. Clique no botão de envio. A enquete é publicada imediatamente, ou colocada na fila na aba **Agendadas** se você definir um horário.
7. Acompanhe os resultados na aba **Enquetes** e depois clique em **Encerrar enquete** quando terminar.

> [!TIP]
> Para uma votação rápida no canal você não precisa do painel. `poll Should we add a movie night?` publica uma enquete de Sim / Não em segundos.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `poll <question>` | `ppoll` | Gerenciar Mensagens | Publica uma enquete de Sim / Não |
| `pollc <question;option1;option2;...>` | | Gerenciar Mensagens | Publica uma enquete de escolha única com duas a vinte e cinco opções |
| `pollm <question;option1;option2;...>` | | Gerenciar Mensagens | Publica uma enquete de múltipla escolha |
| `polla <question;option1;option2;...>` | | Gerenciar Mensagens | Publica uma enquete anônima |
| `polltemplate <name>` | `ptemplate` | Gerenciar Mensagens | Publica uma enquete a partir de um modelo salvo |
| `polltemplates` | `ptemplates` | Ninguém | Lista os modelos do servidor |

Os comandos de barra em `/poll` adicionam `create` (até dez opções, com as opções de anônima e múltipla escolha), `close`, `stats`, `list`, `create-template` e `delete-template`. `close`, `create-template` e `delete-template` exigem Gerenciar Mensagens.

## Dicas e armadilhas

- O bot precisa de Enviar Mensagens e Incorporar Links no canal da enquete. Os comandos de texto também apagam sua mensagem de comando, o que exige Gerenciar Mensagens para o bot.
- As opções são separadas por ponto e vírgula, então uma opção não pode conter um.
- Os rótulos dos botões mostram o texto da opção somente quando ele tem doze caracteres ou menos; opções mais longas mostram apenas o número, com o texto completo no embed.
- A duração é aplicada pelo agendador. Uma enquete publicada imediatamente fica aberta até alguém encerrá-la, então agende-a para um minuto à frente se precisar de expiração automática.
- Uma enquete encerrada ainda pode ser visualizada e exportada pelo painel com **Incluir enquetes encerradas** marcada; uma enquete excluída some.
- Enquetes Restritas por cargo verificam os cargos no momento do voto, então membros que perderem o cargo não podem mais votar, mas o voto anterior permanece.

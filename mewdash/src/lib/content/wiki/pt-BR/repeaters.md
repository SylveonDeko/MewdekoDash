---
title: Repetidores
slug: repeaters
summary: Poste uma mensagem em um canal em uma programação, quando o canal estiver movimentado ou quieto, ou mantenha-a fixa no fim do canal como uma mensagem sticky.
icon: fa-sync
category: Actions
dashboard: /dashboard/repeaters
module: Utility
tags: [repeater, sticky, sticky message, recurring, scheduled message, auto post, reminder, forum sticky, repetidor, mensagem fixa, recorrente, mensagem agendada, postagem automática, lembrete]
related: [utility, embedbuilder]
---

## O que ele faz

Um repetidor é uma mensagem que o bot posta de novo e de novo em um canal. O uso clássico é um lembrete cronometrado: "Leia as regras" a cada seis horas. Cada vez que ele dispara, o bot primeiro exclui a cópia anterior, para que o canal nunca se encha de duplicatas e a mensagem fique sempre perto do fim.

Os repetidores têm cinco modos de disparo. Além de um intervalo fixo, eles podem disparar no instante em que outra pessoa posta (uma verdadeira mensagem sticky), depois de um número de mensagens, quando o canal estiver movimentado ou quando ele ficar quieto. Janelas de horário opcionais os limitam ao horário comercial, às noites ou aos fins de semana no fuso horário do seu servidor, e os repetidores de fórum podem postar automaticamente em todo novo tópico.

A mensagem aceita o construtor de embeds completo, texto simples, componentes e os marcadores gerais, então um repetidor pode ser um anúncio rico em vez de uma linha de texto. As menções só são mantidas se quem o criou tiver Mencionar Everyone; caso contrário, elas são neutralizadas.

## Por que usar

- Mantenha as regras ou um aviso de "como obter ajuda" fixo no fim de um canal movimentado.
- Poste um lembrete diário de evento às 18:00 no horário do servidor.
- Coloque as diretrizes de postagem em todo novo tópico de fórum, filtradas por tag.
- Cutuque um canal parado com um puxa-conversa quando ele ficar quieto por uma hora.
- Execute uma promoção apenas durante o horário comercial e apenas pelos próximos sete dias.

## Modos de disparo

| Modo | Quando posta |
| --- | --- |
| Intervalo de tempo | A cada intervalo, opcionalmente alinhado a um horário do dia de início. Modo padrão. |
| Imediato | Posta uma vez e depois reposta sempre que a mensagem dele deixa de ser a última do canal. |
| Após mensagens | Posta quando o limite de atividade de mensagens foi atingido desde a última vez que disparou. |
| Com atividade | Posta quando o canal está movimentado: o limite é comparado com o tráfego recente na janela de tempo. |
| Sem atividade | Posta quando nenhuma mensagem foi enviada no canal durante toda a janela de tempo. |

Os modos baseados em atividade são verificados uma vez por minuto e exigem que a contagem de mensagens esteja ativada no servidor. O intervalo deve estar entre cinco segundos e 25000 minutos. O padrão é cinco minutos, ou um dia quando você informa um horário do dia e nenhum intervalo. O **Limite de atividade** tem padrão de 5 mensagens e a **Janela de tempo** de cinco minutos, com a janela variando de trinta segundos a seis horas.

## Condições e limites

- **Não repetir se a mensagem já for a última do canal** (redundância): o bot pula uma execução se a última cópia dele ainda for a mensagem mais recente.
- **Detecção de conversa**: se três ou mais mensagens chegaram no último minuto, a execução é adiada e verificada de novo em trinta segundos.
- **Agendamento de horário**: `business` é das 09:00 às 17:00 de segunda a sexta, `evening` é das 18:00 às 23:00 todos os dias e `weekend` é o dia todo no sábado e no domingo. Os horários usam o fuso horário do servidor; defina um antes, ou o bot assume UTC e avisa você.
- **Excluir automaticamente após** e **Máx. de exibições**: o repetidor se remove após uma idade máxima ou um número de postagens.
- **Suprimir notificações**: a mensagem é enviada em silêncio, para não notificar o dispositivo de ninguém.
- **Prioridade** é armazenada por repetidor, de 0 a 100, padrão 50, e é exibida na lista.

## Tópicos e fóruns

- **Criar automaticamente em novos tópicos**: quando um tópico é criado sob o canal do repetidor, o bot posta a mensagem no tópico e a mantém no fim conforme os membros respondem.
- **Modo somente tópicos**: o repetidor nunca posta no canal pai, apenas em tópicos. Obrigatório quando o alvo é um canal de fórum.
- **Filtros de tags de fórum**: as tags obrigatórias e excluídas decidem quais posts de fórum recebem o sticky.

## Marcadores

A mensagem passa pelo conjunto geral de marcadores. Os marcadores de usuário se referem ao próprio bot, já que ninguém aciona um repetidor. Os mais úteis:

| Marcador | Valor |
| --- | --- |
| `%server%`, `%server.name%` | Nome do servidor |
| `%server.members%` | Contagem de membros em cache |
| `%server.id%`, `%server.icon%` | ID do servidor e URL do ícone |
| `%channel%`, `%channel.name%` | Menção e nome do canal do repetidor |
| `%bot.name%`, `%bot.avatar%` | Nome e avatar do bot |
| `%server.time%`, `%time.day%` | Hora do servidor e dia da semana atual |

Marcadores de GIFs de reação, como `%huggif%`, também são substituídos. Marcadores de gatilho como `%user%` resolvem para o bot.

## Configurações

A página Repetidores tem três abas: **Visão geral**, **Gerenciar repetidores** e **Criar novo**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Canal de destino | nenhum | Canal de texto ou de fórum em que postar |
| Filtros de tags de fórum | nenhum | Tags obrigatórias e excluídas, apenas para canais de fórum |
| Conteúdo da mensagem | nenhum | Abre o construtor de embeds |
| Modo de disparo | Intervalo de tempo | Um dos cinco modos |
| Repetir a cada | 5 minutos | Predefinições de 1 minuto a Diário, ou um `HH:MM:SS` personalizado |
| Não repetir se a mensagem já for a última do canal | desativado | Verificação de redundância |
| Permitir menções a @everyone e @here | desativado | Mantém as menções em massa na mensagem em vez de neutralizá-las |
| Prioridade (0-100) | 50 | O valor de prioridade exibido na lista |
| Posição na fila | 0 | Valor de ordenação armazenado |
| Horário de início (HH:MM) | nenhum | Horário do dia ao qual alinhar um repetidor de Intervalo de tempo |
| Detecção de conversa | desativado | Adia enquanto as pessoas estão conversando |
| Suprimir notificações | desativado | Envia em silêncio |
| Criar automaticamente em novos tópicos | desativado | Sticky em tópicos, apenas para canais de fórum |
| Modo somente tópicos | desativado | Pula o canal pai, apenas para canais de fórum |
| Excluir automaticamente após (dias) | nenhum | Idade máxima como `d.hh:mm:ss`, por exemplo `7.00:00:00` |
| Máx. de exibições | ilimitado | Número de postagens antes da remoção |
| Agendamento de horário | nenhum | Botões de predefinição ou um agendamento personalizado |
| Limite de atividade / Mensagens necessárias | 5 | Mensagens para os modos de atividade |
| Janela de tempo | 00:05:00 | Janela para os modos de atividade |

**Visão geral** mostra os totais, a contagem de ativos, o total de exibições, um detalhamento por modo de disparo e os repetidores mais ativos. **Gerenciar repetidores** lista cada um com **Editar**, **Disparar agora** e **Excluir**, além de uma edição rápida para intervalo, limite, idade máxima e máximo de disparos.

## Passo a passo de configuração

1. Abra **Repetidores** no painel e escolha **Criar novo**.
2. Escolha o **Canal de destino**. Para um fórum, marque **Modo somente tópicos** e defina quaisquer **Filtros de tags de fórum**.
3. Clique na caixa **Conteúdo da mensagem** e monte a mensagem no construtor de embeds.
4. Escolha um **Modo de disparo**. Para um sticky, escolha Imediato; para um lembrete, Intervalo de tempo com uma predefinição de **Repetir a cada**.
5. Abra **Opções avançadas** se quiser redundância, envio silencioso, um agendamento de horário ou uma expiração.
6. Clique em **Criar repetidor** e depois use **Disparar agora** na aba Gerenciar para testá-lo.

> [!NOTE]
> Os agendamentos de horário exigem um fuso horário do servidor. Defina-o com o comando de fuso horário antes de ativar as janelas comercial, noturna ou de fim de semana.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado). Todos exigem Gerenciar Mensagens. Os repetidores são identificados pelo número deles em `repeatlist`.

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `repeat [time] [interval] <message>` | | Gerenciar Mensagens | Cria um repetidor no canal atual, por exemplo `repeat 6h Read the rules` ou `repeat 18:00 Event tonight` |
| `repeatlist` | `replst`, `replist`, `repli` | Gerenciar Mensagens | Lista os repetidores com canal, modo, intervalo e próxima execução |
| `repeatinvoke <index>` | `repinv` | Gerenciar Mensagens | Dispara um repetidor agora e reinicia o temporizador dele |
| `repeatremove <index>` | `reprm` | Gerenciar Mensagens | Exclui um repetidor |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Gerenciar Mensagens | Ativa ou desativa sem excluir |
| `repeatmessage <index> <message>` | `repmsg` | Gerenciar Mensagens | Substitui a mensagem |
| `repeatchannel <index> [#channel]` | `repchan` | Gerenciar Mensagens | Move-o para um canal de texto ou de fórum |
| `repeatredundant <index>` | `repeatredun`, `repred` | Gerenciar Mensagens | Alterna a verificação de redundância |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Gerenciar Mensagens | `timeinterval`, `immediate`, `aftermessages`, `onactivity` ou `onnoactivity` |
| `repeatactivity <index> <threshold> <window>` | `repactivity`, `repact` | Gerenciar Mensagens | Define o limite e a janela de atividade, por exemplo `10 5m` |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Gerenciar Mensagens | Define o valor de prioridade |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Gerenciar Mensagens | `business`, `evening`, `weekend` ou `none` para limpar |
| `repeatconversation <index>` | `repconversation`, `repconv` | Gerenciar Mensagens | Alterna a detecção de conversa |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Gerenciar Mensagens | Alterna o envio silencioso |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Gerenciar Mensagens | Alterna a postagem em novos tópicos |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Gerenciar Mensagens | Alterna o modo somente tópicos |
| `repeatforumtags <index> <add/remove/clear/list> [required/excluded] [tags]` | `repforumtags`, `repftags` | Gerenciar Mensagens | Gerencia os filtros de tags de fórum pelo ID da tag |

## Dicas e armadilhas

- O bot precisa de Enviar Mensagens, Incorporar Links e Gerenciar Mensagens no canal, porque ele exclui a cópia anterior antes de postar de novo.
- Se o canal for excluído ou o bot perder o acesso, o repetidor se remove sozinho.
- Os repetidores são carregados pouco depois de o bot iniciar. Os comandos não fazem nada, silenciosamente, até que isso termine.
- O modo Imediato reposta a cada mensagem de outra pessoa, então evite-o em canais muito rápidos ou combine-o com a Detecção de conversa.
- Apenas um membro com Mencionar Everyone pode criar um repetidor que menciona todos ou um cargo; caso contrário, a menção é escapada.
- Os modos baseados em atividade dependem da contagem de mensagens. Ative-a antes de trocar de modo, ou o comando se recusa.
- A expiração por Máx. de exibições conta todas as postagens, inclusive as que você aciona manualmente.

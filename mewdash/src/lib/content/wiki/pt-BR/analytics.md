---
title: Análises
slug: analytics
summary: Uma página do painel exclusiva do dono do bot com o histórico armazenado de comandos, eventos do gateway, latência, erros, crescimento de servidores, adoção de recursos, uso de IA e música, tráfego do site e regras de alerta por webhook.
icon: fa-chart-simple
category: Analytics
dashboard: /owner/analytics
tags: [analytics, metrics, telemetry, commands, events, latency, errors, growth, alerts, shards, owner, análises, métricas, telemetria, comandos, eventos, latência, erros, crescimento, alertas, dono do bot]
related: [performance, leave-feedback, administration]
---

## O que faz

As Análises são a página de histórico para quem administra o bot. Ela só é visível para os donos do bot: a barra lateral a esconde de todos os outros, e abrir a URL diretamente envia quem não é dono de volta à página inicial do painel. Não há nada aqui para a equipe do servidor configurar.

Enquanto o [Desempenho](/wiki/performance) mostra o processo ao vivo e esquece tudo ao reiniciar, as Análises leem o que o bot gravou no próprio banco de dados. Cada instância em execução registra comandos, eventos do gateway, latência dos shards, chamadas REST, tempos do banco de dados, medidores do processo, exceções, uso de recursos, atividade de IA e música e visualizações de páginas do painel. Os números são agregados na memória por minuto, descarregados a cada minuto, consolidados em intervalos de 5 minutos e de uma hora e removidos em um cronograma fixo, então você pode olhar a semana passada, compará-la com a semana anterior e filtrar por instância, shard ou servidor.

Um resumo semanal pode ser postado em um webhook do Discord, e regras de alerta sobre qualquer métrica armazenada notificam um webhook quando um limite é ultrapassado.

## Por que usar

- Você quer saber se um pico de erros começou antes ou depois de um deploy, e não apenas o que está falhando agora.
- Um servidor relata que o bot está lento e você quer a latência de comandos, a atividade e os eventos de segurança dele em um intervalo de datas.
- Você quer ver quais recursos os servidores realmente configuram e usam, e como isso mudou ao longo dos meses.
- Você precisa de um aviso no Discord quando a latência dos shards, a taxa de erros ou os 429 do REST passarem de um limite, sem ficar olhando uma página.
- Você quer um resumo de segunda-feira sobre crescimento, comandos, erros e principais recursos em um canal.

## Abas

| Aba | O que mostra |
| --- | --- |
| Visão geral | Blocos de **Servidores**, **Usuários**, **Comandos / min**, **Eventos do gateway**, **Req REST / s**, **Erros não tratados** (detalha os grupos de exceções), **Pior latência de shard** e **Players de música**; latência dos shards com faixas de alerta; alertas disparando no momento; comandos e eventos do gateway por segundo por tipo e categoria; snapshots diários de servidores; taxa REST; memória do processo |
| Comandos | Seletores de tipo, módulo e resultado; **Invocações**, **Erros**, **Duração p95** e **p50**; invocações por módulo; erros por classe; duração p50, p95, p99; invocações por tipo; um mapa de calor de hora UTC por tamanho do servidor; **Principais comandos**, um **Registro de invocações** paginado, **Comandos que mais falham**, em que uma linha abre as amostras de erro recentes |
| Eventos | Eventos do gateway por segundo por tipo; contagem no período e uma tabela por tipo; eventos por shard; p95 dos handlers por tipo; erros dos handlers por módulo e por tipo de evento |
| Latência | **p95 REST**, **REST 5xx**, **REST 429**, **Atingimentos de ratelimit**, **p95 do BD**, **Erros do BD**, **Reconexões de shards**, **Erros não tratados**; latência e taxa REST por rota; atingimentos de rate limit por rota; p95 e erros do banco de dados por operação; CPU, RSS, threads e GCs de Gen 2; uma tabela por shard com estado, latência, pico, servidores e reconexões; grupos de exceções não tratadas em que uma linha abre suas ocorrências; erros por tipo |
| Servidores | **Servidores**, **Usuários**, **Entrou**, **Saídas**, **Saldo**; snapshots de servidores e usuários de 30 dias; entradas e saídas por dia; churn com taxa de retorno rápido e entradas e saídas por tamanho; retenção por dia de entrada; entradas por tamanho; tabelas **Servidores que voltaram atrás** e **Ficaram em silêncio**, em que uma linha abre o cartão do servidor |
| Servidores (atividade) | Seletor de tipo de evento e um mínimo de eventos por hora; um ID de servidor abre o **Cartão do servidor**, um mapa de calor de atividade por tipo e hora e um registro paginado e filtrável de **Eventos de segurança**; **Principais servidores por eventos**; **Atividade incomum** pontuada em relação à mesma hora dos 14 dias anteriores |
| Recursos | **Adoção de recursos** com contagens de configurados e ativados do censo noturno, servidores ativos, atividade e taxa de erros; recursos usados por servidor; tamanho do servidor em relação aos recursos usados; para o recurso selecionado, **Uso das configurações** do censo mais recente e uma série do censo de configurados ou ativados em 90, 180 ou 365 dias |
| IA | **Requisições**, **Tokens de entrada**, **Tokens de saída**, **Custo est.** a preços de tabela para modelos com preço; uma tabela por modelo com falhas, tokens, p95 e custo; requisições, tokens e p95 por modelo; principais servidores por uso do chat de IA |
| Música | **Jogadores**, **Faixas iniciadas**, **Erros**; players por nó; faixas iniciadas por origem; erros por tipo; estado do nó; faixas encerradas por motivo |
| Site | **Visualizações de página**, **Visitantes**, **p95 das requisições**, **5xx**; visualizações por rota; duração das requisições; uma tabela por rota com visitantes, p95 e 5xx; 4xx e 5xx por rota; um funil de login até o callback do OAuth e o painel com a taxa de abandono |
| Alertas | Grupos disparando; a tabela de regras com ativar, testar, silenciar por 1 hora e excluir; um registro paginado de eventos das transições de estado com o valor em relação ao limite e se um webhook foi enviado; **Nova regra** e **Enviar resumo agora** |
| Pipeline | Uma etiqueta de status; **Último flush**, **Último rollup**, **Última manutenção**, **Séries pendentes**, **Linhas pendentes**; o último erro de flush, se houver; contagem de linhas e a linha mais recente por tabela; instâncias registradas com heartbeat e a última contagem de servidores; duração do flush e linhas por flush |

O status do pipeline é `healthy` quando o último flush tem no máximo 60 segundos, o último rollup no máximo 10 minutos e não há erro de flush; `flush stale` e `rollup stale` caso contrário, `error` quando um flush falhou e `disabled` quando as análises estão desligadas na configuração do bot. Uma instância cuja última contagem de servidores tem mais de 3 minutos é marcada em amarelo, e com mais de 10 minutos, em vermelho.

> [!NOTE]
> Tudo é em UTC. Snapshots, linhas do censo e totais diários são gravados uma vez por noite, então as abas Servidores e Recursos ficam vazias até o bot ter ficado em execução além das 00:05 UTC pelo menos uma vez.

### Barra de filtros

A barra acima das abas se aplica a todas as abas e é mantida na URL, então trocar de aba, recarregar ou compartilhar o link mantém a mesma visualização.

| Controle | O que faz |
| --- | --- |
| Período | `15m`, `1h`, `6h`, `24h`, `7d`, `30d`, ou um início e um fim em UTC personalizados de até 31 dias |
| comparar | Sobrepõe a mesma largura um período antes nos gráficos e blocos que suportam isso |
| Bot | Uma instância, escolhida entre as instâncias que o pipeline conhece, ou todas |
| Shard | Um ID de shard ou todos |
| ID do servidor | Limita as tabelas brutas e as visualizações de servidor a um servidor; pressione Enter para aplicar |
| Atualizar | Tudo é recarregado a cada 30 segundos enquanto a aba está visível; o botão força isso |
| Copiar link | Copia a URL atual com todos os filtros |

Os blocos abrem um detalhamento com divisões da métrica. Os gráficos podem agrupar as séries menores em **Outro**, alternar um total acumulado, receber zoom com os controles deslizantes de período e isolar uma série com um clique direito na entrada da legenda dela.

## Configurações

A página em si não tem configurações. As regras de alerta e três chaves da configuração do bot são tudo o que há para configurar.

### Regras de alerta

Cada regra observa uma métrica. Os campos do editor são:

| Campo | Significado |
| --- | --- |
| Nome, Descrição, Gravidade, ativada | Rótulo e `info`, `warning` ou `critical`, que define a cor e o título do webhook |
| Métrica, Filtros, Agrupar por | Qualquer métrica armazenada, filtros opcionais por rótulo e um rótulo opcional para avaliar cada valor separadamente, por exemplo por `shard` |
| Agreg., Janela | `sum`, `avg`, `min`, `max`, `last`, `rate`, `count`, `p50`, `p95` ou `p99` em 1 minuto a 1 dia |
| Comparador, Limite, Alto | `gt`, `gte`, `lt`, `lte`, `outside` (abaixo do Limite ou acima de Alto), `pct_change` (porcentagem em relação à mesma janela uma linha de base antes), `deviates` (z score em relação à média dos últimos N dias), `nodata` (nada informado na janela) |
| Linha de base, Direção | Para `pct_change` e `deviates`: ontem ou semana passada, e `up`, `down` ou `both` |
| Para | Por quanto tempo a violação deve se manter antes de a regra disparar; `immediately` pula o estado pendente |
| Intervalo | Intervalo mínimo entre as notificações de disparo |
| Repetir | Notificar de novo enquanto ainda estiver disparando, ou uma vez |
| Mín. de amostras | Pula a avaliação quando a janela tem menos amostras do que isso |
| URL do webhook, ID do cargo a mencionar, ID do tópico | Um webhook do Discord, um cargo opcional mencionado ao disparar, um tópico opcional para postar |
| Silêncio de, Silêncio até | Uma janela em UTC, que pode atravessar a meia-noite, em que nada é enviado |
| notificar ao resolver | Também posta quando o grupo volta ao normal |

O gráfico de prévia à direita desenha o limite do rascunho como uma faixa tracejada para os comparadores absolutos.

As regras são avaliadas a cada minuto. Cada grupo vai de `ok` para `pending` (somente quando Para está definido) para `firing`, e de volta para `ok`; o registro de eventos grava a transição de `firing` para `ok` como `resolved`. Silenciar pela tabela silencia uma regra por 1 hora; a API permite até 30 dias. Regras silenciadas e janelas de silêncio ainda mudam de estado, só não postam. **Enviar teste** posta uma mensagem de teste no webhook da regra.

### Chaves de configuração do bot

Defina-as em `bot.yml` ou com o comando de dono `config`. Os padrões são ativado, 30 e vazio, respectivamente.

| Chave | Significado |
| --- | --- |
| `analyticsEnabled` | `false` faz o coletor não fazer nada; a aba Pipeline mostra `disabled` |
| `analyticsRetentionDays` | Dias em que as linhas brutas de comandos, as visualizações de página e o registro de eventos de servidores são mantidos |
| `analyticsDigestWebhook` | Webhook do Discord em que o resumo semanal é postado; vazio desativa o resumo |

### O que é mantido e por quanto tempo

| Dados | Mantido por |
| --- | --- |
| Intervalos de 1 minuto | 48 horas |
| Intervalos de 5 minutos | 14 dias |
| Intervalos de 1 hora | 400 dias |
| Invocações de comandos, visualizações de página, eventos de segurança de servidores | `analyticsRetentionDays` |
| Amostras de erro, atividade horária por servidor de recursos e eventos | 90 dias |
| Eventos de alerta | 180 dias |
| Snapshots diários, censo, totais diários | Não são removidos |

As linhas brutas são descarregadas a cada 15 segundos, os intervalos de minuto a cada minuto; os intervalos de 1 minuto são consolidados em intervalos de 5 minutos a cada 5 minutos e os de 5 minutos em intervalos de uma hora, e a remoção roda a cada 6 horas.

### O que nunca é armazenado

- Conteúdo de mensagens. As linhas de comandos guardam o nome do comando, módulo, tipo, resultado, tempos e, em caso de falha, a classe da exceção e até 200 caracteres da mensagem dela.
- IDs de usuário. Nada nas análises é indexado por quem executou um comando.
- IPs de clientes. As visualizações de página guardam um hash de visitante do IP e do user agent com um salt que muda diariamente, então um visitante não pode ser acompanhado entre dias. Requisições para `/api/`, `/cdn/`, arquivos estáticos e a própria página de Análises não são registradas.

Servidores e usuários que optaram por não participar das estatísticas são respeitados: o comando deles ainda conta no agregado, mas a linha bruta é gravada sem o ID do servidor e o tamanho do servidor.

## Passo a passo de configuração

1. Entre no painel com uma conta de dono do bot e abra **Análises** na barra lateral. Ela só aparece para os donos.
2. Abra **Pipeline** primeiro. A etiqueta deve mostrar `healthy` e toda instância deve ter um heartbeat recente; um flush atrasado significa que o bot não está gravando.
3. Escolha um período e, se você roda mais de uma instância, um bot na barra de filtros. Marque **comparar** para ver o período anterior.
4. Vá para **Alertas**, pressione **Nova regra**, escolha uma métrica como `shard.latency` com `max` em 5 minutos, `gt` o seu limite, agrupe por `shard`, cole um webhook e pressione **Enviar teste** na linha salva.
5. Defina `analyticsDigestWebhook` na configuração do bot e depois pressione **Enviar resumo agora** para ver como será a postagem de segunda-feira.
6. Volte depois de uma noite para ver **Servidores**, **Recursos** e as séries do censo.

## Comandos

A página de Análises existe somente no painel; não há um módulo do bot correspondente. O comando de dono `config` altera as três chaves acima, e alguns comandos de dono cobrem assuntos relacionados no chat. Execute-os com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `config bot analyticsEnabled false` | `conf` | Dono do bot | Para de registrar análises; `true` volta a registrar |
| `config bot analyticsRetentionDays 14` | `conf` | Dono do bot | Altera por quanto tempo as linhas brutas são mantidas |
| `config bot analyticsDigestWebhook <url>` | `conf` | Dono do bot | Para onde vai o resumo de segunda-feira |
| `stats` | | Ninguém | Versão do bot, comandos executados a cada cinco segundos, memória, contagens de cache, shard e tempo de atividade |
| `commandstats` | `cstats` | Dono do bot | Comando, módulo, servidor e usuário mais usados |
| `shardstats` | | Dono do bot | Status de cada shard |

## Dicas e armadilhas

- A página verifica a propriedade por meio do bot, então uma conta que é dona em uma instância do bot mas não em outra será redirecionada na segunda.
- O resumo sai às segundas-feiras a partir das 09:00 UTC e cobre os sete dias anteriores em relação aos sete antes deles: servidores, comandos, erros, eventos, servidores novos e perdidos, visualizações de página, tokens de IA, faixas de música, além dos cinco principais comandos, erros e recursos.
- As séries de períodos longos vêm de intervalos de uma hora, então os percentis são suavizados; reduza o período para ver o detalhe por minuto, que só existe para as últimas 48 horas.
- Se o buffer em memória do coletor encher antes de um flush, linhas brutas extras de comandos são descartadas naquele intervalo enquanto os agregados continuam contando; um valor crescente de **Linhas pendentes** no Pipeline é o sinal.
- As regras de alerta precisam de uma URL de webhook do Discord; qualquer outra coisa é rejeitada ao salvar.
- O custo estimado de IA só cobre modelos com preço de tabela conhecido, então o total é um piso.

---
title: Desempenho
slug: performance
summary: Página exclusiva para donos do bot que mostra CPU, memória, tempo online, os métodos mais lentos e quantos eventos do Discord cada módulo está processando e com quantas falhas.
icon: fa-clock
category: Analytics
dashboard: /owner/performance
tags: [performance, metrics, cpu, memory, latency, monitoring, uptime, events, modules, owner, desempenho, métricas, cpu, memória, latência, monitoramento, tempo online, eventos, módulos, dono]
related: [analytics, leave-feedback, administration]
---

## O que faz

Desempenho é uma página de monitoramento para quem executa o bot. Ela só é visível para os donos do bot: a barra lateral a esconde de todos os outros, e abrir a URL diretamente envia quem não é dono de volta à página inicial do painel. Não há nada aqui para a equipe do servidor configurar.

A página lê números ao vivo do processo do bot em execução. Uma aba mostra os recursos do sistema, outra lista os métodos que consomem mais tempo de CPU, e duas detalham o tratamento de eventos do Discord por tipo de evento e por módulo do bot, cada uma com contagens, tempo médio de execução e taxa de erro. Tudo se atualiza sozinho enquanto a página está aberta.

Os números de eventos e módulos vêm do manipulador interno de eventos do bot, que registra cada evento do gateway que ele despacha. Os tempos dos métodos vêm do monitor de desempenho que envolve os métodos rastreados. Ambos ficam apenas em memória, então são zerados quando o bot reinicia, e as métricas de eventos são zeradas sozinhas a cada hora. Para o histórico armazenado desses mesmos números, use [Análises](/wiki/analytics).

## Por que usar

- O bot parece lento e você quer ver se a causa é a CPU, a memória ou um método lento.
- Um módulo está gerando erros e você quer a taxa de erro por módulo sem ler logs.
- Você quer confirmar que a memória está estável após um deploy, observando-a por alguns minutos.
- Você precisa do tempo online e da quantidade de threads para responder a uma dúvida de suporte.

## Abas

| Aba | Seção | O que mostra | Atualização |
| --- | --- | --- | --- |
| Visão geral | Recursos do sistema | **Uso de CPU**, **Uso de memória** (usada e total), **Tempo online**, **Número de threads** e **Métodos que mais consomem CPU** com o tempo médio | A cada 5 segundos |
| Métodos | Desempenho dos métodos | Cada método rastreado com **Chamadas**, **Tempo médio**, **Tempo total** e **Última execução**; ordenável por qualquer coluna, com um botão que limpa os dados coletados | A cada 30 segundos |
| Eventos | Métricas de eventos | **Total de eventos**, **Total de erros**, **Tipos de evento** e **Taxa média de erro**, depois cada tipo de evento do Discord com a quantidade processada, erros, tempo de execução e taxa de erro | A cada 10 segundos |
| Módulos | Métricas de módulos | **Módulos ativos**, **Total de eventos**, **Total de erros** e **Taxa média de erro**, depois cada módulo com eventos processados, erros, tempo de execução e taxa de erro | A cada 10 segundos |

O uso de CPU é amostrado durante meio segundo a cada atualização da Visão geral e refere-se apenas ao processo do bot, não à máquina inteira. A memória é o working set do processo. A memória total é lida do host no Windows e no Linux e aparece como 0 nos demais sistemas.

> [!NOTE]
> A aba Métodos fica vazia até que os métodos rastreados tenham sido executados. Use o bot por um tempo e depois volte.

## Configurações

Não há configurações. A única ação é o botão de limpar na aba Métodos, que apaga os tempos dos métodos. As métricas de eventos e módulos não podem ser limpas manualmente; elas são zeradas a cada hora.

## Passo a passo de configuração

1. Entre no painel com uma conta de dono do bot.
2. Abra **Desempenho** na barra lateral. Ela só aparece para os donos.
3. Deixe a **Visão geral** aberta por um minuto para acompanhar a estabilização da CPU e da memória.
4. Mude para **Módulos** e ordene por erros para encontrar algo com mau comportamento, depois **Eventos** para ver quais tipos de evento são os mais movimentados.
5. Use **Métodos** para identificar métodos lentos, e limpe-a após uma correção para medir novamente.

## Comandos

A página Desempenho é somente do painel; não há um módulo correspondente no bot. Alguns comandos de dono cobrem assuntos relacionados no chat. Execute estes comandos com o prefixo do seu servidor (`.`, a não ser que você tenha alterado).

| Comando | Apelidos | Requer | Finalidade |
| --- | --- | --- | --- |
| `stats` | | Ninguém | Versão do bot, comandos executados a cada cinco segundos, memória, contagens de cache, shard e tempo online |
| `commandstats` | `cstats` | Dono do bot | Comando, módulo, servidor e usuário mais usados |
| `shardstats` | | Dono do bot | Status de cada shard |

## Dicas e pegadinhas

- A página verifica a propriedade através do bot, então uma conta que é dona em uma instância do bot mas não em outra será redirecionada na segunda.
- Os números são por processo. Em um bot com shards espalhados por vários processos, você vê o processo ao qual o painel está conectado.
- Nada nesta página é armazenado. Se precisar de histórico, anote os números ou tire capturas de tela.
- Uma taxa de erro alta em um tipo de evento geralmente indica um módulo que escuta esse evento; verifique a aba Módulos em seguida.

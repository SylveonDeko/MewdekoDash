---
title: Logs de Processo
slug: process-logs
summary: Página exclusiva para donos do bot que lista os processos que o pm2 executa no host do bot e permite ler, acompanhar, filtrar e baixar seus logs do console.
icon: fa-rectangle-code
category: Analytics
dashboard: /owner/process-logs
tags: [pm2, logs, console, stdout, stderr, tail, process, crash, stack trace, owner, logs de processo, console, rastreamento de pilha, falha, dono]
related: [performance, analytics, leave-feedback]
---

## O que faz

Os Logs de Processo mostram o que o bot escreve no console, diretamente dos arquivos de log que o pm2 mantém para ele, sem abrir um shell no servidor. Ela só é visível para os donos do bot: a barra lateral a esconde de todos os outros, abrir a URL diretamente envia quem não é dono de volta à página inicial do painel, e o próprio bot recusa as requisições a menos que a conta conectada seja um dono.

A página pede à instância do bot selecionada a tabela de processos do pm2. Cada processo que o pm2 gerencia naquele host é listado, não apenas o bot, com seu status, pid, tempo online, quantidade de reinícios, CPU e memória, além do tamanho dos seus dois arquivos de log. Ao escolher um, a página carrega as últimas centenas de linhas do log de saída (stdout) e continua acrescentando novas linhas a cada dois segundos enquanto **Seguindo** estiver ativado.

As linhas mantêm as cores que o Serilog imprime, e cada linha é marcada com seu nível para que você possa ocultar o ruído. Linhas de continuação, como rastreamentos de pilha, ficam presas à linha de cima, então ocultar as informações não deixa rastreamentos órfãos para trás.

## Por que usar

- O bot reiniciou ou caiu e você quer ver a última coisa que ele disse antes de cair, que fica no lado do stderr.
- Um membro relata que um comando falha e você quer acompanhar o log ao vivo enquanto ele tenta de novo.
- Você quer pesquisar milhares de linhas recentes por um ID de servidor ou uma mensagem sem usar SSH.
- Você precisa do arquivo de log completo para um relatório de bug e quer baixá-lo.

## Controles

| Controle | O que faz |
| --- | --- |
| Cartões de processo | Um por processo do pm2 no host. O cartão marcado como **este bot** é a instância que responde à requisição. Clique em um para ler seus logs. |
| **stdout** / **stderr** | Alterna entre o log de saída do processo, onde o log normal é escrito, e o log de erros, onde caem falhas e diagnósticos de execução. |
| **100** a **2k** | Quantas linhas carregar quando o log é aberto ou recarregado. O modo de acompanhamento mantém até 5.000 na página antes de começar a descartar as mais antigas. |
| Campo de filtro | Oculta toda linha cujo texto não contenha o que você digitou. Maiúsculas e minúsculas não importam. |
| **Seguindo** / **Seguir** | Ativa e desativa as atualizações ao vivo. Quando ativo, a página consulta novas linhas a cada dois segundos e rola junto com elas, a não ser que você tenha rolado para cima. |
| **Quebrar linhas** | Quebra linhas longas em vez de rolar para o lado. |
| **Copiar** | Copia as linhas visíveis, sem as cores, para a área de transferência. |
| **Recarregar** | Lê o final do arquivo novamente. |
| **Baixar** | Salva o arquivo de log inteiro como está no disco, incluindo os códigos de cor. O tamanho ao lado é o tamanho atual do arquivo. |
| Chips de nível | **VRB**, **DBG**, **INF**, **WRN**, **ERR** e **FTL**, cada um com a contagem de linhas marcadas carregadas. Clique em um para ocultar ou mostrar esse nível. |

Quando você rola para cima durante o acompanhamento, as novas linhas ficam retidas e um botão no canto inferior direito informa quantas estão esperando. Clique nele para voltar ao final e retomar a rolagem com o log.

> [!NOTE]
> Uma única leitura é limitada a 1 MB. Se as linhas solicitadas não couberem, a página informa que linhas mais antigas foram ignoradas; baixe o arquivo para ver tudo.

## Como o bot encontra os logs

O bot executa `pm2 jlist` no próprio host e lê os caminhos dos arquivos de log que o pm2 informa para cada processo. Ele só faz isso quando um daemon do pm2 já está em execução para o mesmo usuário, então nunca inicia um por acidente. Se o pm2 estiver instalado, mas não puder ser consultado, a página usa os arquivos do diretório de logs do pm2 como alternativa e informa isso. Se não houver pm2 nenhum, a página explica isso em vez de mostrar uma lista vazia.

Em um painel conectado a várias instâncias do bot, a lista de processos pertence à instância selecionada, já que cada instância só consegue ver o próprio host.

## Passo a passo de configuração

1. Execute o bot sob o pm2 no servidor dele, por exemplo `pm2 start dotnet --name mewdeko -- Mewdeko.dll`.
2. Entre no painel com uma conta de dono do bot e abra **Logs de Processo** na barra lateral.
3. Escolha o processo marcado como **este bot** ou qualquer outro processo do host.
4. Deixe **Seguindo** ativado para acompanhar o log ao vivo, ou desative-o e use o filtro e os chips de nível para vasculhar o que foi carregado.
5. Mude para **stderr** após uma falha para ler o que o runtime imprimiu antes de cair.

## Dicas e pegadinhas

- Os logs são lidos de arquivos, então um processo iniciado fora do pm2 não tem logs aqui. A saída do console do próprio bot só aparece se o bot rodar sob o pm2.
- O pm2 rotaciona ou trunca os arquivos quando você executa `pm2 flush` ou usa o `pm2-logrotate`. A página percebe que o arquivo encolheu e recarrega o final por conta própria.
- O filtro e os chips de nível se aplicam apenas às linhas já carregadas. Carregue mais linhas, ou baixe o arquivo, para pesquisar mais para trás.
- Nada nesta página altera o bot. Não há como reiniciar processos ou limpar logs daqui; o comando de dono `restartinstance` e o `pm2 flush` no servidor cobrem isso.

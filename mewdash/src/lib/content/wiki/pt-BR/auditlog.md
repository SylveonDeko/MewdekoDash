---
title: Registro de Auditoria
slug: auditlog
summary: Um registro de quem usou o painel do seu servidor, o que foi visualizado e o que foi alterado, mantido por noventa dias.
icon: fa-clipboard-check
category: Security
dashboard: /dashboard/auditlog
tags: [audit, history, accountability, dashboard access, who changed, log, changes, before and after, auditoria, histórico, responsabilidade, acesso ao painel, quem alterou, registro, alterações, antes e depois]
related: [logging, administration, channel-access]
---

## O que ele faz

Toda requisição que o painel envia ao bot para o seu servidor é registrada na conta do Discord que estava conectada. A página Registro de Auditoria transforma isso em uma linha do tempo: quem abriu as configurações de XP, quem editou a mensagem de boas-vindas, quem excluiu um gatilho de chat e quais eram os valores antes e depois.

Ele é separado do registro de auditoria do próprio Discord e do recurso Logs. O registro do Discord cobre ações feitas dentro do Discord. O recurso Logs do Mewdeko publica eventos do servidor, como entradas, edições e alterações de cargos, em canais que você escolher. O Registro de Auditoria do painel cobre apenas o painel.

Nada precisa ser ativado. As entradas são gravadas a partir do momento em que alguém faz login no painel e abre o seu servidor, e expiram após noventa dias.

## Por que usar

- Várias pessoas têm acesso ao painel e você quer saber quem desativou a Proteção Anti-Raid na semana passada.
- Uma configuração foi alterada e ninguém assume a responsabilidade.
- Você quer um histórico antes de dar acesso ao painel a uma equipe maior.
- Você precisa confirmar que uma alteração que pediu a alguém foi realmente feita, e o que ela substituiu.

## O que é registrado

Cada entrada contém:

- **Quando**: o horário da requisição, armazenado em UTC e exibido no seu próprio fuso horário na página.
- **Usuário**: o nome de usuário e o ID do Discord obtidos do login no painel, e não de qualquer coisa que o usuário tenha digitado.
- **Ação**: uma das ações da tabela abaixo.
- **Seção**: a área do painel, exibida com um nome amigável como "Sistema AFK", "Gatilhos" ou "Proteção".
- **Endpoint**: a requisição exata, por exemplo `PUT Afk/123/settings`, exibida em letras pequenas abaixo da seção.
- **Alterações**: para qualquer coisa que não seja uma visualização, os valores enviados ou alterados. Expanda a entrada com **Detalhes** para vê-los.

O bot também armazena a string de user agent do navegador com cada entrada.

### Ações

A ação é determinada pelo tipo de requisição feita pelo painel.

| Ação | Registrada quando |
| --- | --- |
| Visualizou | O painel leu dados (uma requisição GET). Todo carregamento de página gera essas entradas. |
| Criou | Algo foi adicionado (uma requisição POST). |
| Atualizou | Algo existente foi alterado (uma requisição PUT ou PATCH). |
| Excluiu | Algo foi removido (uma requisição DELETE). |
| Acessou | Reservada para o início de sessões do painel. O filtro a oferece, mas a versão atual nunca grava entradas com essa ação. |

### Conjuntos de alterações

Visualizações não armazenam dados de alteração. Para todo o resto, o bot armazena um de dois documentos:

- **Diferença antes e depois**: quando a seção do painel tira um instantâneo da configuração antes de alterá-la, a entrada lista apenas os campos que mudaram, cada um com seu valor antigo e novo. A maioria das páginas de configurações funciona assim.
- **Corpo da requisição**: quando nenhum instantâneo foi feito, a entrada armazena o que o painel enviou, sem um valor antigo.

Qualquer campo cujo nome contenha `token`, `secret`, `password`, `apikey`, `api_key`, `authorization` ou `clientsecret` é substituído por `[redacted]` antes de ser armazenado, para que credenciais nunca acabem no registro.

Na página, valores booleanos aparecem como Ligado e Desligado, listas como "3 itens", strings vazias como "vazio" e valores ausentes como "nenhum". Os nomes dos campos são convertidos em rótulos legíveis.

> [!NOTE]
> As entradas "Visualizou" são a maior parte do registro, porque cada página do painel lê as configurações ao ser aberta. Filtre por Criou, Atualizou ou Excluiu quando estiver procurando uma alteração.

### O que não é registrado

- Qualquer coisa feita com comandos no Discord. Essas ações aparecem no registro de auditoria do Discord onde o bot atuou, e em Logs se você o tiver configurado.
- Requisições que não estavam ligadas a um usuário conectado ao painel.
- Abrir a própria página do Registro de Auditoria, Deixar feedback e alguns endpoints de infraestrutura e de consulta periódica, como status do bot, desempenho, informações do sistema e gerenciamento de instâncias.
- Alguns endpoints explicitamente excluídos: a imagem de avatar da persona servida ao criador de embeds, a verificação "deve mostrar" do assistente de configuração e o sinal de visualização de página do painel.

## Como ler a página

Abra **Registro de Auditoria** em Segurança no painel. A lista mostra as entradas mais recentes primeiro, cinquenta por página, com os botões **Anterior** e **Próximo** e a contagem total de entradas.

Dois filtros ficam acima da lista:

| Filtro | O que faz |
| --- | --- |
| **Ação** | Mostra apenas entradas Visualizou, Criou, Atualizou, Excluiu ou Acessou. |
| **Seção** | Mostra apenas uma área do painel. As opções são criadas a partir das seções presentes nas entradas carregadas no momento. |

**Atualizar** recarrega a lista. Alterar um filtro volta para a primeira página.

No computador, cada entrada é uma linha com um botão **Detalhes** quando há dados de alteração. No celular, as entradas aparecem como cartões com um botão **Mostrar detalhes**.

> [!EXAMPLE]
> Filtre **Ação** para Atualizou e **Seção** para Proteção para ver cada vez que alguém alterou um sistema de proteção, depois expanda uma linha para ver quais campos mudaram, e de que valor para qual.

## Retenção

As entradas são mantidas por **noventa dias**. Uma tarefa de limpeza roda uma vez por dia, começando cinco minutos após o bot ficar online, e exclui tudo o que for mais antigo. Não há exportação, então, se você precisar de um registro além dessa janela, salve-o antes que ele expire.

## Quem pode ver

A página só fica disponível para pessoas que podem fazer login no painel e são membros do seu servidor. O dono do servidor e qualquer pessoa com a permissão Administrador sempre podem abri-la. Os demais precisam de pelo menos acesso **Ver** à seção **Registro de Auditoria** em Acesso ao Painel, concedido por usuário ou por cargo.

> [!PERMISSION]
> Como o usuário é obtido do token de login no painel, ninguém consegue fazer uma entrada aparecer em nome de outra pessoa.

## Dicas e armadilhas

- O filtro de seção só lista as seções que aparecem na página que você está vendo. Se uma seção não estiver no menu suspenso, ela pode existir em páginas posteriores; limpe o filtro de ação e navegue pelas páginas, ou restrinja primeiro pela ação.
- Os horários são exibidos no fuso horário do navegador de quem vê a página, e não no fuso horário do servidor definido nas configurações de Administração.
- Uma entrada "Criou" significa que uma requisição POST foi feita, algo que o painel também usa para alguns alternadores e atualizações. Leia a linha do endpoint e os detalhes para ver o que realmente aconteceu.
- Entradas cujos detalhes mostram valores sem um valor antigo vieram de uma seção que não tira instantâneos do estado anterior. Você verá o que foi enviado, mas não o que substituiu.
- O registro é por servidor. Trocar de servidor no painel troca o registro junto.

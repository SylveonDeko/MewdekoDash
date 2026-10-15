---
title: Nintendo Switch
slug: switch
summary: Consulte códigos de erro do Nintendo Switch, converta-os entre decimal e hexadecimal, pesquise na wiki switchbrew.org e obtenha uma análise legível de um arquivo de log do Ryujinx.
icon: fa-gamepad-modern
category: Entertainment
module: Switch
tags: [switch, nintendo, error code, ryujinx, emulator, log, switchbrew, homebrew, hex, código de erro, emulador, homebrew, hexadecimal, análise de log]
related: [userprofile, help]
---

## O que ele faz

O módulo Switch é um kit de suporte para servidores sobre homebrew e emulação do Nintendo Switch. Quando alguém posta um erro como `2168-0002`, um ajudante executa `err 2168-0002` e o bot responde com o módulo ao qual o erro pertence, o que se sabe sobre ele e um link para a página de suporte da Nintendo, quando ela existe.

Dois pequenos conversores transformam a forma `NNNN-NNNN` no valor hexadecimal bruto usado em código, e vice-versa. `switchbrew` pesquisa na wiki switchbrew.org para que as pessoas encontrem páginas de SVC, códigos de resultado ou hardware sem sair do Discord.

O recurso mais importante é o analisador de logs do Ryujinx. Um usuário anexa o `Ryujinx.log`, alguém executa `analyselog` nele ou como resposta a ele, e o bot produz um embed com o jogo, a versão do emulador, o hardware, todas as configurações relevantes, o último erro, os mods e cheats instalados e uma lista de notas apontando configurações incorretas comuns.

Nada precisa ser configurado e nada é armazenado. Todos os comandos estão abertos a todos.

## Por que usar

- Um canal de suporte recebe a mesma pergunta "o que significa 2811-5001" todo dia.
- A solução de problemas do Ryujinx começa pela leitura do log, e a maioria das pessoas não sabe o que procurar.
- Desenvolvedores querem a forma hexadecimal de um erro para pesquisar no código-fonte.
- Qualquer um pode abrir uma página do switchbrew.org a partir do Discord.

## Consultas de códigos de erro

`err <code>` aceita qualquer uma das formas:

- `NNNN-NNNN`, em que o primeiro grupo começa com 2 (por exemplo `2168-0002`). O número do módulo é o primeiro grupo menos 2000, e a descrição é o segundo grupo.
- Um valor hexadecimal com o prefixo `0x`, por exemplo `0x2A2`. Os nove bits mais baixos são o módulo, e o restante é a descrição.

A resposta mostra o código nas duas formas, o nome e o número do módulo, o número da descrição e uma explicação. A explicação é encontrada nesta ordem: uma descrição conhecida para o código exato, uma página de suporte da Nintendo para o código exato, uma descrição para a faixa à qual o código pertence dentro do seu módulo e, caso contrário, "desconhecido". Códigos conhecidos são exibidos na cor normal, e os desconhecidos, na cor de erro.

Alguns códigos não seguem o padrão, como `2-AAB6A-3400`. Esses são comparados exatamente com uma lista curta e informados com o jogo ao qual pertencem.

`err2hex <NNNN-NNNN>` mostra o valor hexadecimal. `hex2err <hex>` mostra a forma com hífen; o prefixo `0x` é opcional.

## Pesquisa no Switchbrew

`switchbrew <query>` consulta a API de busca da wiki e retorna as cinco principais correspondências, cada uma com um link e um trecho de até 200 caracteres. `svc` é um alias, então `svc SetThreadPriority` se lê naturalmente.

## Análise de logs do Ryujinx

`analyselog` procura um anexo `.log` ou `.txt` na sua mensagem. Se não houver, e a sua mensagem for uma resposta, ele usa o anexo da mensagem à qual você respondeu e credita esse autor no rodapé. O embed tem como título o nome do jogo e contém:

| Campo | Conteúdo |
| --- | --- |
| Informações gerais | Versão do Ryujinx, firmware, CPU, GPU, RAM, sistema operacional |
| Configurações do sistema | Backend de áudio, modo docked ou portátil, PPTC, cache de shaders, VSync, hypervisor (somente macOS) |
| Configurações de gráficos | Backend gráfico, escala de resolução, filtragem anisotrópica, proporção de tela, recompressão de texturas |
| Erros | O último bloco de erro do log, ou "nenhum erro" |
| Mods | Cada mod com ExeFS ou RomFS, truncado com uma contagem se houver muitos |
| Cheats | Cada cheat, truncado da mesma forma |
| Notas | Problemas detectados e conselhos |

As notas cobrem coisas como colisão ou corrupção do cache de shaders, hash de dump inválido, chaves desatualizadas, firmware ausente, erros de permissão de arquivo, save ausente, serviços ausentes, Vulkan sem memória, o perfil de usuário padrão, nenhum controle configurado, uma GPU Intel ou AMD que deveria usar Vulkan, Rosetta em Apple silicon, o backend de áudio dummy, PPTC ou cache de shaders desativados, RAM expandida, o gerenciador de memória por software, ignorar serviços ausentes, VSync desativado, verificações de integridade do sistema de arquivos desativadas, threading de backend desativado e builds personalizadas. Cada nota tem um marcador de severidade, de informativo a crítico.

Se o arquivo não puder ser baixado ou não for um log do Ryujinx, o bot informa que o log é inválido.

## Configurações

Este módulo não tem configurações nem página no painel.

## Passo a passo

1. Certifique-se de que o bot consegue ler o histórico de mensagens e anexar arquivos no seu canal de suporte.
2. Peça aos usuários que anexem o `Ryujinx.log` diretamente a uma mensagem.
3. Um ajudante responde a essa mensagem com `analyselog`.
4. Para códigos de erro, execute `err <code>` e compartilhe o link de suporte se um for exibido.
5. Opcionalmente, adicione um gatilho de chat ou uma mensagem fixada lembrando as pessoas desses dois comandos.

## Comandos

Execute estes comandos com o prefixo do seu servidor (`.`, a menos que você tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `err <code>` | `nxerr`, `serr` | Ninguém | Explica um código de erro do Switch na forma com hífen ou hexadecimal |
| `err2hex <NNNN-NNNN>` | `e2h` | Ninguém | Converte um código com hífen para hexadecimal |
| `hex2err <hex>` | `h2e` | Ninguém | Converte hexadecimal para a forma com hífen |
| `switchbrew <query>` | `sb`, `svc` | Ninguém | Pesquisa no switchbrew.org |
| `analyselog` | `analyzelog`, `analyselogs`, `analyzelogs`, `analyze`, `analyse` | Ninguém | Analisa um log anexado do Ryujinx |

## Dicas e armadilhas

- A forma com hífen precisa ter exatamente quatro dígitos, um hífen e quatro dígitos, começando com 2. Códigos com letras passam apenas pela lista de casos especiais.
- Os logs precisam ser anexados como `.log` ou `.txt`; um log colado em um bloco de código não é lido.
- O analisador lê o arquivo inteiro, então peça aos usuários o log da sessão em que o problema aconteceu, e não de uma execução nova.
- A pesquisa no switchbrew.org é uma requisição ao vivo; se o site estiver lento, o comando também estará.
- Os membros podem armazenar seu código de amigo do Switch no perfil com `setswitchfc`, que faz parte do módulo de Perfil de Usuário.

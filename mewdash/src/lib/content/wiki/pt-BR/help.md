---
title: Ajuda e Comandos
slug: help
summary: Como encontrar e entender os comandos do bot de dentro do Discord: o menu de ajuda por categorias, as visões gerais de módulos, as páginas de ajuda por comando, a busca de comandos e o assistente de configuração do painel para o qual o bot dá o link quando entra.
icon: fa-life-ring
category: General
module: Help
tags: [help, commands, modules, search command, slash commands, prefix, setup wizard, invite, guide, source, donate, vote, ajuda, comandos, módulos, buscar comando, comandos de barra, prefixo, assistente de configuração, convite, guia, código-fonte, doar, votar]
related: [permissions, administration, userprofile]
---

## O que ele faz

O módulo Help é como os membros descobrem o que o bot pode fazer. `help` (ou `cmds`) abre um menu que lista as categorias de comandos, com a contagem de módulos e de comandos de cada uma, além de um menu suspenso para abrir uma delas. Escolher uma categoria mostra os módulos dela; escolher um módulo mostra os comandos dele, dez por página, com descrições curtas ou, para módulos muito grandes, primeiro uma visão geral dividida em seções.

`help <command>` mostra um único comando: o nome e o primeiro alias, o que ele faz, as permissões do Discord que ele exige de você e do bot, um cooldown se houver, o comando de barra correspondente, cada parâmetro, formas alternativas, exemplos de uso e um link para a documentação. Um botão **Executar** permite executar o comando direto da página de ajuda, abrindo um formulário para os argumentos dele, se ele tiver algum.

`searchcommand <term>` encontra comandos cujo nome ou descrição contém o termo. Mencionar o bot sem texto responde com o prefixo atual e uma indicação para `cmds`.

Todo comando tem uma versão de texto, usada com o prefixo do servidor, e, na maioria dos casos, uma versão de barra. O menu de ajuda e as páginas de comandos são iguais nos dois casos; `/help`, `/search` e `/invite` são os pontos de entrada de barra.

## Por que usar

- Um novo membro digita `.help` e precisa de um lugar sensato para começar.
- A equipe quer saber exatamente qual permissão um comando exige antes de concedê-la.
- Alguém lembra metade do nome de um comando e quer buscá-lo.
- Você acabou de convidar o bot e quer uma configuração guiada em vez de ler a documentação de cada módulo.

## O menu de ajuda

`help`, `commands` ou `modules` sem argumentos abre o nível superior. A descrição do embed explica as duas formas de entrar: escolher uma categoria no menu suspenso ou usar `h commandname` para um comando. Ela também traz links para a documentação, o servidor de suporte, o convite e as páginas de doação.

| Categoria | Contém |
| --- | --- |
| Moderação e Administração | Administration, Moderation, Permissions, Server Management, Role States, Status Roles, Counting Moderation |
| Configuração do Servidor | MultiGreets, Role Greets, Starboard, Stat Channels, Suggestions, Tickets, Confessions, Channel Access, Custom Voice, Chat Triggers, Polls, Giveaways |
| Diversão e Jogos | Games, Counting, NSFW, Searches, Minecraft, Switch |
| Economia e Níveis | Currency, XP, Reputation, Vote, Patreon |
| Música | Music |
| Utilidades | Utility, Help, AFK, Todo, User Profile, Birthday, Highlights, Copr Monitoring |
| Dono do Bot | Módulos exclusivos do dono |
| Outros | Tudo o que não foi classificado acima |

Um botão **Alternar descrições** alterna entre a lista compacta e um layout mais longo que lista todos os módulos sob a categoria deles, com uma marca de verificação ou um X mostrando se o módulo está ativado para você no canal atual. Um globo e um X significam que os donos do bot desativaram o módulo em todos os lugares.

### Páginas de módulos

`commands <module>` vai direto a um módulo. O nome pode ser exato ou um prefixo único, então `cmds mod` abre Moderation, enquanto `cmds s` reclama que vários módulos correspondem. Adicione uma palavra depois do módulo para filtrar: `cmds utility remind` lista apenas os comandos de Utility cujo nome ou descrição mencione "remind".

Módulos com mais de 30 comandos e pelo menos três seções mostram primeiro uma visão geral: a descrição do módulo, um campo por seção com a contagem de comandos, um menu suspenso para abrir uma seção, um botão **Todos os comandos**, um botão **Buscar** que abre um formulário e **Voltar**. Módulos menores vão direto para a lista paginada. As páginas têm dez comandos agrupados por seção, com botões de primeira, anterior, ir para, próxima, última, voltar e fechar. O paginador permanece ativo por uma hora.

## Páginas de comandos

`help <command>` corresponde ao nome exato ou a qualquer alias. O embed contém:

- O comando com o prefixo e o primeiro alias, e a descrição dele.
- **Permissões do usuário**: o que você precisa. Quando uma substituição de permissão do Discord, do módulo Administration, troca o requisito integrado, o original é mostrado riscado e a substituição é listada depois dele.
- **Permissões do bot**: o que o bot precisa.
- **Documentação**: um link para a página do comando no site de documentação.
- **Intervalo**: exibido apenas quando o comando tem um.
- **Comando de barra**: uma menção clicável da versão de barra, quando existe uma.
- **Parâmetros**, **Sobrecargas** e **Uso**, da documentação do comando, listando cada argumento, se é opcional e qualquer valor padrão.
- Um rodapé com o módulo, o submódulo e o nome do método, útil ao relatar bugs.

O botão **Executar** executa o comando como se você o tivesse digitado. Se ele recebe argumentos, um formulário os pede primeiro. Os administradores também veem um botão **Permissões** que abre o menu rápido de Permissões de Comandos para esse comando, descrito no artigo Permissões de Comandos.

## Comandos de barra versus de texto

Os comandos de texto usam o prefixo do servidor, `.` por padrão, e os nomes exatos do menu de ajuda. Os comandos de barra são agrupados, então um comando de texto como `setprivacy` aparece como `/setprivacy`, enquanto os comandos de permissões ficam em `/permissions servercommand`. A página do comando mostra a menção de barra para que você possa clicar nela. Ambas as formas passam pelas mesmas regras de permissão.

## Quando o bot entra

Quando o bot é adicionado a um servidor, ele descobre quem o convidou pelo registro de auditoria (precisa de Ver Registro de Auditoria para isso) e envia uma DM. A mensagem tem um botão **Configurar a Mewdeko** com o link para o assistente do painel desse servidor, um lembrete em três passos de `cmds`, `cmds mod` e `h purge`, e o link do servidor de suporte. Se não for possível identificar quem convidou, ou se a pessoa estiver com as DMs fechadas, nada é enviado; não há anúncio em canal.

## O assistente de configuração

O assistente fica em `/wizard?guild=<id>` no painel. O link na DM de boas-vindas abre a versão de configuração rápida; o próprio painel pode oferecer a versão de primeira vez, que adiciona uma verificação de permissões no início.

| Etapa | O que faz |
| --- | --- |
| Boas-vindas | Explica o que está prestes a acontecer |
| Permissões | Apenas na primeira vez: verifica se o bot tem o que precisa |
| Básico do servidor | Prefixo, idioma do bot e fuso horário do servidor |
| Selecionar recursos | Escolha o que configurar; os recursos são marcados como configuração completa ou ativação rápida |
| Uma etapa por recurso de configuração completa | Configuração guiada para esse recurso |
| Configuração rápida | Ativa em massa os recursos restantes com seus padrões |
| Concluído | Resumo, incluindo qualquer coisa que falhou ao salvar |

O progresso é armazenado por servidor, então sair e voltar o retoma. Um servidor pode ser marcado como ignorado para que o assistente pare de se oferecer, e a página **Minhas configurações** tem uma chave para indicar se você prefere a configuração guiada e uma redefinição do estado do assistente de um servidor.

## Configurações

Não há nada a configurar na própria ajuda. O prefixo é definido com o módulo Administration e exibido em todo embed de ajuda.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Prefixo | `.` | O prefixo exibido no texto de ajuda e usado pelo botão Executar |
| Permissões detalhadas | desativado | Se um comando bloqueado explica qual regra de permissão o bloqueou (veja Permissões de Comandos) |

## Passo a passo de configuração

1. Execute `help` e abra uma categoria no menu suspenso para ver como os módulos são agrupados.
2. Execute `cmds mod` para ver o módulo Moderation e depois `h purge` para ver um comando por completo.
3. Experimente o botão **Executar** em um comando inofensivo, como `h ping`.
4. Execute `searchcommand role` para ver como a busca afunila os resultados.
5. Se você acabou de convidar o bot, siga o link **Configurar a Mewdeko** da DM de boas-vindas, ou abra `/wizard?guild=<your server id>` no painel.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `help [command]` | `h` | Qualquer pessoa | Menu de ajuda, ou ajuda para um comando |
| `commands [module] [term]` | `cmds` | Qualquer pessoa | Lista de módulos, comandos de um módulo ou uma lista filtrada |
| `modules` | `mdls` | Qualquer pessoa | O mesmo menu de nível superior de `help` |
| `searchcommand <term>` | | Qualquer pessoa | Busca nomes e descrições de comandos, até 20 resultados |
| `guide` | `readme` | Qualquer pessoa | Link para o guia de primeiros passos |
| `source` | `github`, `repo`, `gitlab`, `bitbucket` | Qualquer pessoa | Link para o código-fonte |
| `donate` | | Qualquer pessoa | Como apoiar o bot |
| `vote` | | Qualquer pessoa | Link para votar no bot |
| `exportcommandsjson` | `exportcommands`, `excj` | Qualquer pessoa | Exporta todos os comandos como um arquivo JSON (uma vez por minuto) |

Apenas de barra: `/search <command>` com preenchimento automático e `/invite`. `/help`, `/commands <module> [filter]`, `/donate`, `/guide`, `/source` e `/vote` espelham os comandos de texto.

## Dicas e armadilhas

- Se `help` mostrar um X ao lado de um módulo para você, uma regra de permissão ou os donos do bot o desativaram nesse canal. Peça à equipe para verificar `listperms`.
- As páginas de ajuda refletem as pré-condições reais do comando, então uma permissão listada ali é a que vale, mesmo que o site de documentação esteja desatualizado.
- O botão Executar usa as suas próprias permissões, não as do bot. É uma conveniência, não um atalho para burlar regras.
- A correspondência de módulos por prefixo significa que prefixos curtos costumam ser ambíguos; use pelo menos três ou quatro letras.
- O bot só envia DM a quem o convidou quando entra. Se você o convidou por um link compartilhado e não recebeu nada, abra o assistente pelo painel.

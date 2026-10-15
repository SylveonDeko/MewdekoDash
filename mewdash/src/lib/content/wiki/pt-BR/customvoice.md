---
title: Voz personalizada
slug: customvoice
summary: Um hub de entrar para criar que dá a cada membro seu próprio canal de voz temporário, com controles de renomear, limite de usuários, bitrate, bloqueio, permitir e negar, e limpeza automática quando ele esvazia.
icon: fa-microphone
category: Entertainment
dashboard: /dashboard/customvoice
module: CustomVoice
tags: [custom voice, temporary voice, join to create, voice hub, private voice, voice channels, lock, bitrate, user limit, voz personalizada, voz temporária, entrar para criar, hub de voz, voz privada, canais de voz, bloquear, limite de usuários]
related: [administration, statchannels]
---

## O que faz

A equipe define um canal de voz como o hub. Quando um membro entra nele, o bot cria um novo canal de voz para ele, com o nome gerado a partir de um modelo, coloca-o na categoria configurada e move o membro para dentro. Esse membro é o dono do canal: ele pode renomeá-lo, definir um limite de usuários e um bitrate, bloqueá-lo para que só membros permitidos possam entrar, permitir ou negar pessoas específicas, mantê-lo ativo ou passá-lo para outra pessoa.

Quando o último humano sai, o canal é excluído após um curto tempo, a menos que o dono tenha ativado a opção de manter ativo. Se o dono sai e outra pessoa continua lá dentro, ela pode assumi-lo.

Os membros podem salvar preferências para seus canais, de modo que todo canal que criarem comece com o nome, limite, bitrate, estado de bloqueio e configuração de manter ativo preferidos. A equipe decide quais dessas personalizações os membros podem usar, define limites máximos para o limite de usuários e o bitrate, e pode indicar um cargo de administrador que pode gerenciar qualquer canal personalizado.

## Por que usar

- Pare de manter uma parede de canais de "Gaming 1" a "Gaming 8"; os membros criam um quando precisam e ele desaparece depois.
- Membros que querem uma chamada privada bloqueiam o canal e permitem apenas os amigos.
- Streamers e anfitriões de eventos mantêm um canal ativo para que ele sobreviva enquanto se ausentam.
- Moderadores com o cargo de administrador podem renomear, bloquear ou transferir qualquer canal sem precisar de Gerenciar canais em todo o servidor.

## O hub

`setupvoicehub` cria um canal de voz chamado "Create Voice Channel" dentro de uma nova categoria "Custom Voice Channels", permite que todos se conectem mas não falem, e o registra como o hub. `setvoicehub #channel [category]` usa um canal que você já tem. A seção **Configuração básica** do painel faz o mesmo com um seletor de canal e categoria.

Se **Permitir vários canais por usuário** estiver desativado (o padrão), entrar no hub enquanto você já é dono de um canal exclui o antigo antes de criar o novo.

## Nome dos canais

O **Formato de nome padrão** é um modelo. O bot substitui `{0}` pelo nome de usuário do membro, `{1}` pelo discriminador dele e `{2}` pelo nome do servidor. O padrão é `{0}'s Channel`. O nome é cortado para caber nos limites do Discord.

> [!NOTE]
> O texto de exemplo do painel mostra `{username}'s Channel`, mas o bot só substitui `{0}`, `{1}` e `{2}`. Use a forma numerada.

## Controles do dono

`voicecontrols` publica um painel para o canal em que você está, mostrando o nome, o limite, o bitrate, o bloqueio e o estado de manter ativo atuais e quem está dentro, com botões de **Renomear**, **Limite**, **Bitrate**, **Bloquear**/**Desbloquear**, manter ativo, **Transferir** e um seletor de membros para gerenciar quem está dentro. Os botões das personalizações que o servidor desativou ficam desabilitados.

As mesmas ações existem como comandos, e cada um verifica se você está em um canal personalizado, se é o dono dele ou tem o cargo de administrador e se o servidor permite aquela personalização:

| Ação | Comando | O que faz |
| --- | --- | --- |
| Renomear | `voicerename <name>` | Renomeia o canal, se **Permitir personalizar o nome** estiver ativado |
| Limite de usuários | `voicelimit <n>` | Define o limite, restrito ao limite máximo de usuários do servidor |
| Bitrate | `voicebitrate <kbps>` | Define o bitrate, restrito ao bitrate máximo do servidor |
| Bloquear | `voicelock [true/false]`, `voiceunlock` | Bloqueado nega conectar a todos, exceto membros permitidos, o dono e o cargo de administrador |
| Permitir | `voiceallow @user` | Concede conectar a um membro mesmo com o canal bloqueado |
| Negar | `voicedeny @user` | Remove conectar de um membro e o desconecta se ele estiver dentro |
| Manter ativo | `voicekeepalive [true/false]` | Impede a limpeza de canal vazio para este canal |
| Transferir | `voicetransfer @user` | Torna outro membro o dono e move as exceções de gerenciamento para ele |
| Assumir | `voiceclaim` | Qualquer membro dentro pode assumir a posse quando o dono não está no canal |

Quando **Gerenciar permissões do canal automaticamente** está ativado, o dono recebe conectar, falar, Gerenciar canal, Mover membros, Silenciar membros e Ensurdecer membros no canal dele, os membros permitidos e negados recebem exceções correspondentes, e o cargo de administrador recebe acesso de gerenciamento.

## Limpeza

Com **Excluir canais quando vazios** ativado (o padrão), um canal sem nenhum humano dentro é agendado para exclusão após o tempo para canal vazio. Reentrar antes de o temporizador disparar o cancela. Os canais marcados como manter ativo nunca são removidos automaticamente. Uma varredura em segundo plano a cada cinco minutos também remove canais que estão vazios há mais tempo que o limite, e o botão **Limpar canais inativos** do painel remove canais inativos há um número de horas que você escolher.

## Preferências dos membros

`voicepreferences` mostra suas preferências salvas de formato de nome, limite de usuários, bitrate, bloqueio e manter ativo. Cada comando `voiceprefs...` define uma, executá-lo sem valor a limpa, e `voiceprefsreset` limpa todas. As preferências só são aplicadas quando **Lembrar as preferências do usuário** está ativado, e o limite e o bitrate continuam restritos aos máximos do servidor. A equipe pode ver e editar as preferências de qualquer membro na aba **Preferências do usuário**, pelo ID do usuário.

## Configurações

O painel tem três abas: **Configuração**, **Canais ativos** e **Preferências do usuário**. A aba **Configuração** é dividida em **Configuração básica**, **Padrões dos canais** e **Gerenciamento de canais**. `voiceconfig` sem argumentos mostra todos os valores; `voiceconfig <setting> <value>` altera um.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Canal hub | nenhum | O canal de entrar para criar |
| Categoria | nenhuma | Onde os novos canais são criados |
| Formato de nome padrão | `{0}'s Channel` | Modelo para os nomes dos novos canais (`nameformat`) |
| Limite de usuários padrão | 0 (ilimitado) | Limite de usuários inicial (`userlimit`) |
| Bitrate padrão | 64 kbps | Bitrate inicial (`bitrate`) |
| Excluir canais quando vazios | Ativado | Remove canais em que não há ninguém (`deleteempty`) |
| Tempo para canal vazio | 1 | Atraso antes de um canal vazio ser removido (`emptytimeout`); o painel o rotula em segundos e aceita de 5 a 300 |
| Permitir vários canais por usuário | Desativado | Permite que um membro seja dono de vários canais (`multiplechannels`) |
| Lembrar as preferências do usuário | Ativado | Aplica as preferências salvas dos membros (`persistpreferences`) |
| Gerenciar permissões do canal automaticamente | Ativado | Define as exceções de dono, permitir, negar e administrador (`autopermission`) |
| Permitir personalizar o nome | Ativado | `namechange` |
| Permitir personalizar o limite de usuários | Ativado | `limitchange` |
| Permitir personalizar o bitrate | Ativado | `bitratechange` |
| Permitir bloquear o canal | Ativado | `locking` |
| Permitir gerenciamento de usuários | Ativado | Comandos de permitir e negar (`usermanagement`) |
| Limite máximo de usuários | 99 | Teto para limites definidos por membros (`maxuserlimit`) |
| Bitrate máximo | 96 kbps | Teto para bitrates definidos por membros, também limitado pelo nível de boost do servidor (`maxbitrate`) |
| Cargo de administrador | nenhum | Cargo que pode gerenciar qualquer canal personalizado (`adminrole`) |

**Limite máximo de usuários**, **Bitrate máximo** e **Cargo de administrador** não têm controle no painel; defina-os com `voiceconfig`.

A aba **Canais ativos** lista todos os canais personalizados ativos com seu dono, estado de bloqueio e de manter ativo, permite bloquear, desbloquear ou excluir um e mostra totais de canais criados, ativos na última hora, bloqueados e mantidos ativos. Ela também contém o botão **Limpar canais inativos** e um botão **Desativar voz personalizada** que desliga o módulo para o servidor.

## Passo a passo de configuração

1. Dê ao bot Gerenciar canais, Mover membros e Gerenciar cargos (para as exceções de permissão) na categoria que você vai usar.
2. Execute `setupvoicehub`, ou abra **Voz personalizada** no painel e escolha um canal hub e uma categoria existentes em **Configuração básica**.
3. Defina o **Formato de nome padrão**, o **Limite de usuários padrão** e o **Bitrate padrão** em **Padrões dos canais**.
4. Em **Gerenciamento de canais**, desative as personalizações que você não quer que os membros tenham.
5. Defina um **Cargo de administrador** com `voiceconfig adminrole @Moderators` para que a equipe possa gerenciar canais dos quais não é dona.
6. Entre você mesmo no hub, execute `voicecontrols` e tente renomear e bloquear o canal.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `setupvoicehub` | `svh`, `createvoicehub`, `voicesetup` | Gerenciar canais | Criar um canal hub e uma categoria |
| `setvoicehub <#channel> [category]` | `sethub`, `voicehub` | Gerenciar canais | Usar um canal existente como hub |
| `voiceconfig [setting] [value]` | `vcconfig`, `voicesettings`, `vcsettings`, `customvoiceconfig` | Gerenciar canais | Mostrar ou alterar as configurações do servidor |
| `voicecontrols` | `vcontrols` | Dono ou cargo de administrador | Painel de controle interativo do seu canal |
| `voicechannels` | `vchannels`, `listvoice`, `customvoices`, `voicelist` | Ninguém | Listar os canais personalizados ativos |
| `voicerename <name>` | `vrename`, `renamevoice`, `vcname`, `vcrename` | Dono ou cargo de administrador | Renomear seu canal |
| `voicelimit <number>` | `vclimit`, `limitvoice`, `vlimit`, `setlimit` | Dono ou cargo de administrador | Definir o limite de usuários |
| `voicebitrate <kbps>` | `vcbitrate`, `vbitrate`, `setbitrate` | Dono ou cargo de administrador | Definir o bitrate |
| `voicelock [true/false]` | `vclock`, `lockvoice`, `vlock`, `lockvc` | Dono ou cargo de administrador | Bloquear ou desbloquear |
| `voiceunlock` | `vcunlock`, `unlockvoice`, `vunlock`, `unlockvc` | Dono ou cargo de administrador | Desbloquear |
| `voiceallow @user` | `vcallow`, `allowuser`, `vallow`, `adduser` | Dono ou cargo de administrador | Deixar um membro entrar em um canal bloqueado |
| `voicedeny @user` | `vcdeny`, `denyuser`, `vdeny`, `removeuser` | Dono ou cargo de administrador | Bloquear um membro e desconectá-lo |
| `voiceclaim` | `vcclaim`, `claimvoice`, `vclaim`, `takeover` | Ninguém | Assumir um canal cujo dono saiu |
| `voicetransfer @user` | `vctransfer`, `transfervoice`, `vtransfer`, `givevc` | Dono ou cargo de administrador | Dar o canal a outra pessoa |
| `voicekeepalive [true/false]` | `vckeepalive`, `keepvoice`, `vkeep`, `persist` | Dono ou cargo de administrador | Isentar o canal da limpeza |
| `voicepreferences` | `vcprefs`, `voiceprefs`, `vprefs`, `myvoice` | Ninguém | Mostrar suas preferências salvas |
| `voiceprefsname [format]` | `vcprefsname`, `vpname`, `prefname`, `namepref` | Ninguém | Formato de nome preferido, vazio limpa |
| `voiceprefslimit [number]` | `vcprefslimit`, `vplimit`, `preflimit`, `limitpref` | Ninguém | Limite de usuários preferido |
| `voiceprefsbitrate [kbps]` | `vcprefsbitrate`, `vpbitrate`, `prefbitrate`, `bitratepref` | Ninguém | Bitrate preferido |
| `voiceprefslock [true/false]` | `vprefslock` | Ninguém | Iniciar os canais bloqueados |
| `voiceprefskeepalive [true/false]` | `vcprefskeepalive`, `vpkeepalive`, `prefkeepalive`, `keeppref` | Ninguém | Iniciar os canais com manter ativo |
| `voiceprefsreset` | `vcprefsreset`, `vprefsreset`, `resetprefs`, `clearprefs` | Ninguém | Limpar todas as preferências |

## Dicas e armadilhas

- O bot precisa de Gerenciar canais na categoria, Mover membros para colocar quem criou no novo canal e Gerenciar cargos para escrever as exceções de permissão.
- O bitrate máximo é limitado ao que o nível de boost do servidor permite, então uma configuração de 384 em um servidor sem boosts é reduzida automaticamente.
- Bloquear nega conectar para o cargo everyone. Membros com Administrador ou um cargo que já tenha uma permissão explícita de conectar ainda podem entrar.
- O temporizador de canal vazio que roda quando o último membro sai trata o valor do tempo limite como segundos, enquanto a exibição da configuração e a varredura de cinco minutos o tratam como minutos. Com o padrão de 1, o canal desaparece quase imediatamente quando fica vazio.
- Os canais com manter ativo nunca são limpos automaticamente. Use a aba **Canais ativos** ou `voicechannels` para encontrar os esquecidos.
- Assumir só funciona enquanto o dono original não está conectado ao canal.

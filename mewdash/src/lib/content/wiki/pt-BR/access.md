---
title: Acesso ao Painel
slug: access
summary: Permita que membros ou cargos específicos abram o painel do seu servidor e vejam ou gerenciem apenas as seções que você escolher, sem torná-los administradores do Discord.
icon: fa-key
category: Security
dashboard: /dashboard/access
tags: [dashboard access, permissions, grant, staff, restrict, who can edit, view, manage, managers, delegation, acesso ao painel, permissões, conceder, equipe, restringir, quem pode editar, ver, gerenciar, gerentes, delegação]
related: [auditlog, administration]
---

## O que ele faz

Por padrão, apenas o dono do servidor e membros com a permissão Administrador podem abrir um servidor no painel. O Acesso ao Painel permite ampliar isso. Você escolhe um membro ou um cargo, define quais seções do painel ele recebe e se cada uma é **Ver** ou **Gerenciar**. A partir daí, esse servidor aparece na lista de servidores do painel dele e as seções concedidas funcionam para essa pessoa; todo o resto é recusado.

A verificação acontece na API do bot, e não apenas na página web. Toda requisição que menciona um servidor carrega a identidade do usuário conectado. Se ele for o dono ou um Administrador, a requisição passa. Caso contrário, o bot procura a seção à qual a requisição pertence, trata leituras como **Ver** e qualquer alteração como **Gerenciar**, e compara isso com o melhor nível que o usuário tem, diretamente ou por meio de qualquer um dos seus cargos.

O dono do servidor também decide quem pode editar a própria lista de acesso. Por padrão, só o dono pode. Ele pode nomear gerentes de acesso específicos, ou ativar uma opção para permitir que qualquer pessoa com Administrador ou Gerenciar Servidor faça isso.

## Por que usar

- Uma equipe da comunidade administra sorteios, sugestões e tickets pelo painel sem ter Administrador no Discord.
- Um cargo de moderação recebe **Gerenciar** em Moderação e Logs e **Ver** em todo o resto, para que possa observar sem alterar configurações que não lhe pertencem.
- Um ajudante do bot é confiável para editar XP e Moeda, mas nada relacionado à segurança.
- O dono delega a manutenção da lista de acesso a um cargo de co-dono sem entregar os controles exclusivos do dono.

## Níveis de acesso

| Nível | Permite |
| --- | --- |
| Nenhum | Nada para aquela seção; a seção não é concedida |
| Ver | Apenas requisições de leitura, como abrir a página e carregar seus dados |
| Gerenciar | Tudo o que Ver permite, além de criar, editar e excluir |

Quando um membro corresponde a mais de uma concessão, por exemplo uma concessão pessoal e uma de cargo, o nível mais alto de cada seção prevalece. Um membro com pelo menos uma seção concedida vê o servidor no seletor de servidores do painel; um membro sem nenhuma concessão não vê.

Donos e Administradores ignoram as concessões por completo e sempre têm acesso total.

## Seções

As seções correspondem à barra lateral do painel. Cada recurso no seletor corresponde a uma ou mais áreas da API do bot, então conceder "Administração" cobre os endpoints de Administração e de Proteção, e "Moderação" também cobre Proteção. O seletor agrupa as seções por categoria da barra lateral, e recursos que são infraestrutura global do bot, e não dados por servidor, como Desempenho, não podem ser concedidos.

Quando uma concessão cobre um recurso que se mapeia para várias áreas, o seletor mostra o nível mais baixo compartilhado entre elas; definir o grupo define todas as suas áreas de uma vez.

## Quem pode gerenciar a lista de acesso

| Quem | Pode fazer |
| --- | --- |
| Dono do servidor | Tudo: a opção de delegação, a lista de gerentes e todas as concessões |
| Gerentes de acesso nomeados | Adicionar, editar e remover concessões |
| Membros com Administrador ou Gerenciar Servidor | Adicionar, editar e remover concessões, apenas enquanto a opção de delegação estiver ativada |
| Todos os outros | Veem "Você não pode gerenciar o acesso ao painel aqui" |

Gerentes de acesso podem ser um membro ou um cargo. Apenas o dono pode ver ou alterar a lista de gerentes e a opção de delegação; a API recusa essas chamadas vindas de qualquer outra pessoa.

> [!WARNING]
> Conceder **Gerenciar** em Acesso ao Painel não é possível, porque o controlador de acesso é isento das verificações de seção. Use a lista de gerentes ou a opção de delegação para entregar o controle da lista.

## Configurações

Tudo fica na única página de Acesso ao Painel.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Permitir que Administradores e membros com Gerenciar servidor gerenciem o acesso ao painel | Desligado | Em **Configurações de delegação**. Quando ativada, membros com Administrador e Gerenciar Servidor podem editar as concessões. Somente dono. |
| Gerentes de acesso | nenhum | Membros ou cargos nomeados para editar concessões. Somente dono. |
| Concessões de acesso | nenhum | Uma entrada por membro ou cargo, listando um nível por seção. Gerentes e dono. |

O formulário **Conceder acesso restrito** recebe um tipo de alvo (usuário ou cargo), o alvo e um nível por grupo de recursos. Salvar uma segunda concessão para o mesmo alvo substitui a primeira. Editar uma concessão existente abre o mesmo formulário de **Editar concessão de acesso**.

## Passo a passo

1. Abra **Acesso ao Painel** no painel como dono do servidor.
2. Decida quem mantém a lista. Ative a opção de delegação em **Configurações de delegação**, ou adicione um membro ou cargo em **Gerentes de acesso**.
3. Em **Conceder acesso restrito**, escolha **Cargo** e selecione o cargo da sua equipe.
4. Defina **Gerenciar** nos recursos que eles usam no dia a dia e **Ver** nos que devem apenas inspecionar. Deixe o restante em **Nenhum**.
5. Clique em **Conceder acesso**. A concessão aparece em **Concessões de acesso**.
6. Peça a um membro com esse cargo que faça login no painel. O servidor deve aparecer agora na lista dele, com apenas as páginas concedidas funcionando.

## Comandos

O Acesso ao Painel é configurado somente pelo painel; não há comandos do bot para ele.

## Dicas e armadilhas

- As concessões são verificadas contra a lista de membros em cache do bot, então um membro precisa estar no servidor e ser visível para o bot para que a concessão funcione.
- Concessões de cargo seguem os cargos atuais do membro. Remover o cargo remove o acesso imediatamente.
- Uma concessão com todas as seções em **Nenhum** conta como nenhuma concessão e é descartada, e o membro perde o servidor no seletor.
- Administradores mantêm acesso total não importa o que as concessões digam. Para restringir alguém, remova o Administrador no Discord primeiro e depois conceda aqui o que a pessoa precisa.
- O proxy do painel anexa uma chave de API compartilhada a cada requisição, mas essa chave sozinha nunca concede acesso a um servidor; a identidade do usuário conectado é sempre necessária.
- Endpoints que não estão ligados a um servidor, como a lista global de comandos, não estão sujeitos às verificações de seção e continuam funcionando para usuários com acesso restrito.

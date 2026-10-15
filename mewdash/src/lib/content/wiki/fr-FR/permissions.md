---
title: Permissions des commandes
slug: permissions
summary: Décidez qui peut exécuter quelles commandes et où, grâce à une liste ordonnée de règles d'autorisation et de refus pour les commandes et les modules, applicables à l'ensemble du serveur, à un rôle, à un salon, à une catégorie ou à un membre unique.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Permissions
tags: [permissions, command permissions, allow, deny, permission role, verbose, disable command, disable module, cooldown, dpo, permission override, blacklist, permissions des commandes, autoriser, refuser, rôle de permission, détaillé, désactiver une commande, désactiver un module, délai, remplacement de permission, liste noire]
related: [administration, help, filter, moderation]
---

## Ce que ça fait

Par défaut, chaque commande est disponible pour tous ceux que les permissions Discord autorisent. Les permissions des commandes ajoutent par-dessus une liste de règles propre au serveur. Chaque règle indique si une commande, un module ou tous les modules sont autorisés ou refusés pour l'ensemble du serveur, un rôle, un salon, une catégorie ou un membre. Lorsqu'une personne exécute une commande, le bot parcourt la liste, applique la première règle qui correspond, puis laisse passer la commande ou l'arrête.

Les commandes bloquées échouent silencieusement, sauf si le mode **détaillé** est activé ; dans ce cas, le bot répond avec le numéro et le texte de la règle qui l'a bloquée. Les commandes slash reçoivent toujours une explication éphémère.

Les règles peuvent être gérées par les administrateurs, ou par toute personne disposant du **rôle de permission** que vous choisissez. La même liste se trouve sur le tableau de bord, sous **Administration**, dans la section **Automatisation et paramètres**, sous forme de carte **Permissions des commandes**.

Deux outils liés existent à côté. Les délais de commande limitent la fréquence à laquelle une commande peut être utilisée par membre sur un serveur. Les remplacements de permissions Discord, dans le module Administration, remplacent la permission Discord qu'une commande exige normalement, par exemple en permettant aux détenteurs de Gérer les messages d'utiliser une commande qui exige normalement Administrateur.

## Pourquoi l'utiliser

- Garder les commandes amusantes et NSFW hors des salons sérieux.
- Désactiver le module Musique partout, sauf dans un salon dédié aux commandes des bots.
- Permettre à un rôle d'aide d'utiliser `warn` sans leur donner Gérer les messages ou Administrateur.
- Empêcher un membre perturbateur d'utiliser le bot du tout.
- Limiter le débit d'une commande bruyante comme `roll` à une fois toutes les dix secondes par membre.

## Comment une règle est écrite

Chaque règle comporte trois parties.

| Partie | Options |
| --- | --- |
| Quoi | Une commande, un module ou tous les modules |
| Pour qui | Le serveur entier, un rôle, un salon, une catégorie ou un utilisateur précis |
| Action | Autoriser ou refuser |

Les noms de commandes du tableau ci-dessous encodent les deux premières parties. Les premières lettres choisissent la cible (`s` serveur, `r` rôle, `c` salon, `ca` catégorie, `u` utilisateur), la dernière choisit la portée (`cmd` commande, `mdl` module), et les formes `all...mdls` couvrent tous les modules.

| Commande | Règle créée |
| --- | --- |
| `srvrcmd <command> <enable|disable>` | Une commande pour l'ensemble du serveur |
| `srvrmdl <module> <enable|disable>` | Un module pour l'ensemble du serveur |
| `allsrvrmdls <enable|disable>` | Tous les modules pour l'ensemble du serveur |
| `rolecmd <command> <enable|disable> <role>` | Une commande pour un rôle |
| `rolemdl <module> <enable|disable> <role>` | Un module pour un rôle |
| `allrolemdls <enable|disable> <role>` | Tous les modules pour un rôle |
| `chnlcmd <command> <enable|disable> <#channel>` | Une commande dans un salon |
| `chnlmdl <module> <enable|disable> <#channel>` | Un module dans un salon |
| `allchnlmdls <enable|disable> <#channel>` | Tous les modules dans un salon |
| `catcmd <command> <enable|disable> <category>` | Une commande dans chaque salon d'une catégorie |
| `catmdl <module> <enable|disable> <category>` | Un module dans une catégorie |
| `allcatmdls <enable|disable> <category>` | Tous les modules dans une catégorie |
| `usrcmd <command> <enable|disable> @user` | Une commande pour un seul membre |
| `usrmdl <module> <enable|disable> @user` | Un module pour un seul membre |
| `allusrmdls <enable|disable> @user` | Tous les modules pour un seul membre |

Les déclencheurs de chat comptent comme des commandes : indiquez le numéro ou le texte du déclencheur là où un nom de commande est attendu.

> [!EXAMPLE]
> `srvrmdl nsfw disable` puis `chnlmdl nsfw enable #adult` bloque le module NSFW partout, sauf dans un seul salon.

## Ordre des règles

`listperms` affiche la liste numérotée à partir de 1. La règle 1 est toujours « autoriser tous les modules pour l'ensemble du serveur » et ne peut ni être modifiée ni supprimée ; c'est le repli lorsqu'aucune autre règle ne correspond.

Les nouvelles règles sont ajoutées à la fin de la liste. Lorsqu'une commande est exécutée, le bot vérifie les règles en partant du numéro le plus élevé vers la règle 1, et la première règle dont la cible et la portée correspondent décide. Cela signifie que la règle correspondante la plus récemment ajoutée l'emporte, ce qui explique pourquoi l'exemple ci-dessus fonctionne : l'autorisation du salon a été ajoutée après le refus du serveur.

`moveperm <from> <to>` change la position d'une règle et renumérote tout, afin de placer une exception au-dessus ou au-dessous d'une règle plus générale sans la recréer. `removeperm <number>` supprime une règle. `resetperms` remet la liste à la seule règle 1 et nécessite Administrateur.

Le tableau de bord affiche les mêmes règles avec des flèches monter et descendre, et un bouton de suppression pour chaque règle.

## Mode détaillé

`verbose` active ou désactive l'envoi d'un message d'erreur pour une commande textuelle bloquée, qui nomme la règle responsable, par exemple « la permission 4 (`.chnlmdl nsfw disable #general`) empêche cela ». Il est désactivé par défaut. Lorsqu'il est désactivé, les commandes bloquées sont ignorées silencieusement, ce qui convient à la plupart des serveurs et évite que les membres ne s'intéressent à ce qu'ils ne peuvent pas exécuter. Les commandes slash répondent toujours avec la raison, de façon éphémère, quel que soit ce paramètre.

## Qui peut modifier les règles

Chaque commande de ce module passe par une vérification supplémentaire. Les administrateurs peuvent toujours les utiliser. Toute autre personne a besoin du **rôle de permission** défini avec `permrole <role>`. Sans ce rôle, les non-administrateurs se voient indiquer qu'ils ont besoin de permissions d'administration (uniquement si le mode détaillé est activé) et la commande s'arrête. `permrole` sans argument affiche le rôle actuel ; `permrole reset` l'efface. Le rôle `@everyone` ne peut pas être utilisé.

`resetperms` et `permrole` eux-mêmes exigent toujours en plus Administrateur.

## Délais

`cmdcooldown <command> [time]` définit un délai par membre pour une commande sur ce serveur, de 1 seconde à 90000 secondes (25 heures). Ne donnez pas de durée, ou `0s`, pour l'effacer. `allcmdcooldowns` liste les délais actuels. Ils s'ajoutent à tout délai intégré dont une commande dispose déjà.

## Remplacements de permissions Discord

Le module Administration peut remplacer la permission Discord qu'une commande exige. `dpo <command> <permissions...>` fait en sorte que la commande exige les permissions listées au lieu de sa permission intégrée, par exemple `dpo purge ManageMessages`. Exécutez `dpo <command>` sans permission pour supprimer le remplacement, `dpol` pour les lister, et `dpor` pour tout effacer après confirmation. Les trois nécessitent Administrateur.

Un remplacement ne remplace que l'exigence intégrée de Discord. Les règles de permissions des commandes ci-dessus continuent de s'appliquer, et la page de commande issue de `help <command>` affiche l'exigence d'origine barrée, avec le remplacement à côté.

## Le menu rapide de l'aide

`help <command>` affiche aux administrateurs un bouton de permissions. Il ouvre un menu rapide pour cette seule commande, qui présente les règles qui la concernent, signale les règles redondantes (deux règles avec la même cible et la même portée), propose de les résoudre, et permet d'ajouter des règles d'autorisation et de refus pour la commande ou de réinitialiser ses permissions sans quitter la page d'aide.

## Contrôles du propriétaire du bot

Trois groupes de commandes sont réservés aux propriétaires du bot et affectent chaque serveur : les permissions globales (`globalmodule`, `globalcommand`, `globalpermlist`, `resetglobalperms`) désactivent un module ou une commande partout, et la liste noire (`userblacklist`, `channelblacklist`, `serverblacklist`, `manualblacklistcheck`) empêche le bot de répondre à un utilisateur, un salon ou un serveur. Un module désactivé globalement affiche un globe et une croix dans le menu d'aide.

## Paramètres

Sur le tableau de bord, ouvrez **Administration**, puis la section **Automatisation et paramètres**, puis la carte **Permissions des commandes**.

| Paramètre | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Permissions détaillées | désactivé | Indique aux utilisateurs quand une règle bloque une commande |
| Rôle de permission | aucun | Les membres disposant de ce rôle peuvent modifier les règles via les commandes |
| Règles | règle 1 uniquement | La liste ordonnée ; ajoutez-en avec **Action**, **Quoi** et **Pour qui**, puis un module, une commande, un rôle, un salon, une catégorie ou un identifiant d'utilisateur |

La carte affiche aussi le nombre de règles personnalisées et si le mode détaillé est activé. La carte **Remplacements de permissions** de la même section gère les remplacements de permissions Discord : choisissez une commande du bot et la **Permission Discord requise** qu'elle doit exiger à la place de sa permission intégrée.

## Guide de configuration

1. Décidez de la forme : en général « tout autorisé, quelques éléments refusés » ou « tout refusé, puis autorisé dans les salons des bots ».
2. Pour la seconde forme, exécutez `allsrvrmdls disable`, puis `allchnlmdls enable #bot-commands`.
3. Gardez la modération opérationnelle pour le staff : `rolemdl moderation enable @Mods` et `rolemdl administration enable @Mods`.
4. Exécutez `listperms` et lisez-la de bas en haut, car c'est l'ordre utilisé par le bot. Utilisez `moveperm` si une exception se trouve sous la règle qu'elle doit remplacer.
5. Donnez au staff de confiance `permrole @Mods` afin qu'il puisse ajuster les règles sans Administrateur.
6. Activez `verbose` pendant les tests pour voir quelle règle se déclenche, puis désactivez-le à nouveau.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les versions slash se trouvent sous `/permissions`, par exemple `/permissions servercommand`.

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `listperms` | `lp` | Administrateur ou rôle de permission | Afficher la liste numérotée des règles |
| `verbose [true|false]` | `v` | Administrateur ou rôle de permission | Activer ou désactiver les messages de commande bloquée |
| `permrole [role|reset]` | `pr` | Administrateur | Afficher, définir ou réinitialiser le rôle de permission |
| `removeperm <number>` | `rp` | Administrateur ou rôle de permission | Supprimer une règle |
| `moveperm <from> <to>` | `mp` | Administrateur ou rôle de permission | Réordonner les règles |
| `resetperms` | | Administrateur | Supprimer toutes les règles |
| `srvrcmd <command> <enable|disable>` | `sc` | Administrateur ou rôle de permission | Règle de commande, pour tout le serveur |
| `srvrmdl <module> <enable|disable>` | `sm` | Administrateur ou rôle de permission | Règle de module, pour tout le serveur |
| `allsrvrmdls <enable|disable>` | `asm` | Administrateur ou rôle de permission | Tous les modules, pour tout le serveur |
| `rolecmd <command> <enable|disable> <role>` | `rc` | Administrateur ou rôle de permission | Règle de commande pour un rôle |
| `rolemdl <module> <enable|disable> <role>` | `rm` | Administrateur ou rôle de permission | Règle de module pour un rôle |
| `allrolemdls <enable|disable> <role>` | `arm` | Administrateur ou rôle de permission | Tous les modules pour un rôle |
| `chnlcmd <command> <enable|disable> <#channel>` | `cc` | Administrateur ou rôle de permission | Règle de commande dans un salon |
| `chnlmdl <module> <enable|disable> <#channel>` | `cm` | Administrateur ou rôle de permission | Règle de module dans un salon |
| `allchnlmdls <enable|disable> <#channel>` | `acm` | Administrateur ou rôle de permission | Tous les modules dans un salon |
| `catcmd <command> <enable|disable> <category>` | `cac` | Administrateur ou rôle de permission | Règle de commande dans une catégorie |
| `catmdl <module> <enable|disable> <category>` | `cam` | Administrateur ou rôle de permission | Règle de module dans une catégorie |
| `allcatmdls <enable|disable> <category>` | `acamds` | Administrateur ou rôle de permission | Tous les modules dans une catégorie |
| `usrcmd <command> <enable|disable> @user` | `uc` | Administrateur ou rôle de permission | Règle de commande pour un membre |
| `usrmdl <module> <enable|disable> @user` | `um` | Administrateur ou rôle de permission | Règle de module pour un membre |
| `allusrmdls <enable|disable> @user` | `aum` | Administrateur ou rôle de permission | Tous les modules pour un membre |
| `cmdcooldown <command> [time]` | `cmdcd` | Administrateur ou rôle de permission | Définir ou effacer un délai |
| `allcmdcooldowns` | `acmdcds` | Administrateur ou rôle de permission | Lister les délais |
| `discordpermoverride <command> [permissions...]` | `dpo` | Administrateur | Définir ou supprimer un remplacement de permission Discord |
| `discordpermoverridelist` | `dpol`, `dpoli` | Administrateur | Lister les remplacements |
| `discordpermoverridereset` | `dpor` | Administrateur | Effacer tous les remplacements |
| `globalmodule <module>` | `gmod` | Propriétaire du bot | Activer ou désactiver un module partout |
| `globalcommand <command>` | `gcmd` | Propriétaire du bot | Activer ou désactiver une commande partout |
| `globalpermlist` | `gpl`, `lgp`, `globalperms`, `listglobalperms` | Propriétaire du bot | Lister les blocages globaux |
| `resetglobalperms` | | Propriétaire du bot | Effacer les blocages globaux |
| `userblacklist <add|remove> <user> [reason]` | `ubl` | Propriétaire du bot | Mettre un utilisateur sur liste noire |
| `channelblacklist <add|remove> <id> [reason]` | `cbl` | Propriétaire du bot | Mettre un salon sur liste noire |
| `serverblacklist <add|remove> <server> [reason]` | `sbl` | Propriétaire du bot | Mettre un serveur sur liste noire |
| `manualblacklistcheck` | `manualblcheck`, `mbc` | Propriétaire du bot | Relancer l'application de la liste noire |

## Astuces et pièges

- `resetperms` est exempté de la vérification des règles, afin que vous puissiez toujours vous remettre d'une règle qui a tout bloqué, tant que vous êtes administrateur.
- Les règles correspondent au nom canonique de la commande ; ainsi `srvrcmd clear disable` et `srvrcmd purge disable` désignent la même règle. Utilisez le premier nom indiqué par `help <command>`.
- Une règle pour « tous les modules » couvre aussi le module Permissions. Si vous refusez tout pour un rôle, les membres qui n'ont que ce rôle ne peuvent pas non plus exécuter `listperms`.
- Les règles de catégorie utilisent la catégorie parente du salon au moment où la commande est exécutée ; les fils héritent de leur salon parent.
- Les remplacements de permissions Discord modifient la permission Discord requise, pas les personnes autorisées par les règles. Utilisez les deux ensemble : un remplacement pour abaisser la barre, puis une règle pour restreindre le lieu.
- Les règles de permissions ne s'appliquent jamais dans les MP.
- Le tableau de bord nomme les choix de cible Serveur entier, Un rôle, Un salon, Une catégorie et Un utilisateur précis ; l'option utilisateur accepte un identifiant d'utilisateur collé.

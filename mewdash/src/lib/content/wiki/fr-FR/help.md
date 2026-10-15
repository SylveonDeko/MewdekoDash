---
title: Aide et commandes
slug: help
summary: Comment trouver et comprendre les commandes du bot depuis Discord : le menu d'aide par catégorie, les vues d'ensemble des modules, les pages d'aide par commande, la recherche de commandes, et l'assistant de configuration du tableau de bord vers lequel le bot renvoie lorsqu'il rejoint un serveur.
icon: fa-life-ring
category: General
module: Help
tags: [help, commands, modules, search command, slash commands, prefix, setup wizard, invite, guide, source, donate, vote, aide, commandes, modules, rechercher une commande, commandes slash, préfixe, assistant de configuration, invitation, guide, source, don, vote]
related: [permissions, administration, userprofile]
---

## Fonctionnement

Le module Help permet aux membres de découvrir ce que le bot peut faire. `help` (ou `cmds`) ouvre un menu qui répertorie les catégories de commandes, avec le nombre de modules et de commandes pour chacune, ainsi qu'une liste déroulante pour en ouvrir une. Choisir une catégorie affiche ses modules ; choisir un module affiche ses commandes, dix par page, avec de courtes descriptions, ou, pour les très grands modules, une vue d'ensemble répartie en sections.

`help <command>` affiche une seule commande : son nom et son premier alias, ce qu'elle fait, les permissions Discord dont elle a besoin de votre part et de celle du bot, un délai d'attente si elle en a un, la commande slash correspondante, chaque paramètre, les formes alternatives, des exemples d'utilisation et un lien vers la documentation. Un bouton **Lancer** permet d'exécuter la commande directement depuis la page d'aide, en ouvrant un formulaire pour ses arguments si elle en possède.

`searchcommand <term>` trouve les commandes dont le nom ou la description contient le terme recherché. Mentionner le bot sans texte répond avec le préfixe actuel et une indication vers `cmds`.

Chaque commande existe en version texte, utilisée avec le préfixe du serveur, et, dans la plupart des cas, en version slash. Le menu d'aide et les pages de commandes sont identiques dans les deux cas ; `/help`, `/search` et `/invite` sont les points d'entrée slash.

## Pourquoi l'utiliser

- Un nouveau membre tape `.help` et a besoin d'un point de départ clair.
- Le personnel veut savoir exactement quelle permission une commande requiert avant de l'accorder.
- Quelqu'un se souvient d'une partie du nom d'une commande et veut la rechercher.
- Vous venez d'inviter le bot et souhaitez une configuration guidée plutôt que de lire la documentation de chaque module.

## Le menu d'aide

`help`, `commands` ou `modules` sans argument ouvre le niveau supérieur. La description de l'embed explique les deux façons d'y accéder : choisir une catégorie dans la liste déroulante, ou utiliser `h commandname` pour une commande précise. Il contient également des liens vers la documentation, le serveur d'assistance, la page d'invitation et la page de dons.

| Catégorie | Contenu |
| --- | --- |
| Moderation & Admin | Administration, Moderation, Permissions, Server Management, Role States, Status Roles, Counting Moderation |
| Server Setup | MultiGreets, Role Greets, Starboard, Stat Channels, Suggestions, Tickets, Confessions, Channel Access, Custom Voice, Chat Triggers, Polls, Giveaways |
| Fun & Games | Games, Counting, NSFW, Searches, Minecraft, Switch |
| Economy & Levels | Currency, XP, Reputation, Vote, Patreon |
| Music | Music |
| Utility | Utility, Help, AFK, Todo, User Profile, Birthday, Highlights, Copr Monitoring |
| Bot Owner | Modules réservés au propriétaire du bot |
| Other | Tout ce qui n'est pas classé ci-dessus |

Un bouton **Toggle descriptions** permet de basculer entre la liste compacte et une présentation plus détaillée qui affiche chaque module sous sa catégorie, avec une coche ou une croix indiquant s'il est activé pour vous dans le salon actuel. Un globe et une croix signifient que les propriétaires du bot ont désactivé le module partout.

### Pages de modules

`commands <module>` ouvre directement un module. Le nom peut être exact ou un préfixe unique : `cmds mod` ouvre Moderation, tandis que `cmds s` signale que plusieurs modules correspondent. Ajoutez un mot après le module pour filtrer : `cmds utility remind` n'affiche que les commandes de Utility dont le nom ou la description mentionne « remind ».

Les modules comptant plus de 30 commandes et au moins trois sections affichent d'abord une vue d'ensemble : la description du module, un champ par section avec son nombre de commandes, une liste déroulante pour ouvrir une section, un bouton **All commands**, un bouton **Rechercher** qui ouvre un formulaire, et **Retour**. Les modules plus petits affichent directement la liste paginée. Les pages contiennent dix commandes regroupées par section, avec les boutons première, précédente, aller à, suivante, dernière, retour et fermer. La pagination reste active pendant une heure.

## Pages de commandes

`help <command>` correspond au nom exact ou à n'importe lequel de ses alias. L'embed contient :

- La commande avec son préfixe et son premier alias, ainsi que sa description.
- **User Permissions** : ce dont vous avez besoin. Lorsqu'une substitution de permission Discord définie dans le module Administration remplace l'exigence intégrée, l'exigence d'origine est affichée barrée, et la substitution est listée à la suite.
- **Bot Permissions** : ce dont le bot a besoin.
- **Documentation** : un lien vers la page de la commande sur le site de documentation.
- **Délai** : affiché uniquement si la commande en possède un.
- **Slash Command** : une mention cliquable de la version slash, lorsqu'elle existe.
- **Parameters**, **Overloads** et **Utilisation** issus de la documentation de la commande, listant chaque argument, indiquant s'il est facultatif et sa valeur par défaut éventuelle.
- Un pied de page avec le module, le sous-module et le nom de la méthode, utile pour signaler des bugs.

Le bouton **Lancer** exécute la commande comme si vous l'aviez tapée. Si elle prend des arguments, un formulaire les demande d'abord. Les administrateurs voient également un bouton **Permissions**, qui ouvre le menu rapide des permissions de commande pour cette commande, décrit dans l'article sur les permissions de commande.

## Commandes slash et commandes texte

Les commandes texte utilisent le préfixe du serveur, `.` par défaut, et les noms exacts du menu d'aide. Les commandes slash sont regroupées : une commande texte comme `setprivacy` apparaît donc sous la forme `/setprivacy`, tandis que les commandes de permissions se trouvent sous `/permissions servercommand`. La page de commande affiche la mention slash pour que vous puissiez cliquer dessus. Les deux formes respectent les mêmes règles de permission.

## Lorsque le bot rejoint un serveur

Lorsque le bot est ajouté à un serveur, il identifie la personne qui l'a invité grâce au journal d'audit (il a besoin de la permission Voir le journal d'audit pour cela) et lui envoie un message privé. Ce message contient un bouton **Set Up Mewdeko** qui mène à l'assistant du tableau de bord pour ce serveur, un rappel en trois étapes avec `cmds`, `cmds mod` et `h purge`, ainsi que le lien vers le serveur d'assistance. Si l'invitant ne peut pas être identifié ou si ses messages privés sont fermés, rien n'est envoyé ; il n'y a pas d'annonce dans un salon.

## L'assistant de configuration

L'assistant se trouve à l'adresse `/wizard?guild=<id>` sur le tableau de bord. Le lien du message de bienvenue ouvre la variante de configuration rapide ; le tableau de bord lui-même peut proposer la variante de première utilisation, qui ajoute une vérification des permissions au début.

| Étape | Ce qu'elle fait |
| --- | --- |
| Welcome | Explique ce qui va se passer |
| Permissions | Première utilisation uniquement : vérifie que le bot dispose de ce dont il a besoin |
| Server Basics | Préfixe, langue du bot et fuseau horaire du serveur |
| Select Features | Choisissez ce qu'il faut configurer ; les fonctionnalités sont marquées comme configuration complète ou activation rapide |
| Une étape par fonctionnalité en configuration complète | Configuration guidée de cette fonctionnalité |
| Quick Setup | Active en masse les fonctionnalités restantes avec leurs valeurs par défaut |
| Complete | Récapitulatif, y compris les éléments qui n'ont pas pu être enregistrés |

La progression est enregistrée par serveur, ce qui permet de reprendre là où vous vous êtes arrêté. Un serveur peut être marqué comme ignoré afin que l'assistant ne se propose plus, et la page **Mes paramètres** propose un interrupteur pour choisir si vous préférez une configuration guidée, ainsi qu'une réinitialisation de l'état de l'assistant pour un serveur.

## Paramètres

Il n'y a rien à configurer pour l'aide elle-même. Le préfixe se définit avec le module Administration et s'affiche dans chaque embed d'aide.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Prefix | `.` | Le préfixe affiché dans le texte d'aide et utilisé pour le bouton Run |
| Verbose permissions | désactivé | Si une commande bloquée indique la règle de permission qui l'a bloquée (voir Permissions de commande) |

## Guide de configuration

1. Exécutez `help` et ouvrez une catégorie depuis la liste déroulante pour voir comment les modules sont regroupés.
2. Exécutez `cmds mod` pour voir le module Moderation, puis `h purge` pour voir une commande en détail.
3. Essayez le bouton **Lancer** sur une commande inoffensive comme `h ping`.
4. Exécutez `searchcommand role` pour voir comment la recherche affine les résultats.
5. Si vous venez d'inviter le bot, suivez le lien **Set Up Mewdeko** du message de bienvenue, ou ouvrez `/wizard?guild=<your server id>` sur le tableau de bord.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `help [command]` | `h` | Aucune | Menu d'aide, ou aide pour une commande |
| `commands [module] [term]` | `cmds` | Aucune | Liste des modules, commandes d'un module, ou liste filtrée |
| `modules` | `mdls` | Aucune | Le même menu de niveau supérieur que `help` |
| `searchcommand <term>` | | Aucune | Recherche dans les noms et descriptions de commandes, jusqu'à 20 résultats |
| `guide` | `readme` | Aucune | Lien vers le guide de démarrage |
| `source` | `github`, `repo`, `gitlab`, `bitbucket` | Aucune | Lien vers le code source |
| `donate` | | Aucune | Comment soutenir le bot |
| `vote` | | Aucune | Lien pour voter pour le bot |
| `exportcommandsjson` | `exportcommands`, `excj` | Aucune | Exporte chaque commande dans un fichier JSON (une fois par minute) |

Slash uniquement : `/search <command>` avec autocomplétion, et `/invite`. `/help`, `/commands <module> [filter]`, `/donate`, `/guide`, `/source` et `/vote` reprennent les commandes texte.

## Conseils et pièges

- Si `help` affiche une croix à côté d'un module pour vous, une règle de permission ou les propriétaires du bot l'ont désactivé dans ce salon. Demandez au personnel de vérifier avec `listperms`.
- Les pages d'aide reflètent les conditions réelles de la commande ; une permission indiquée ici fait donc foi, même si le site de documentation est en retard.
- Le bouton Run utilise vos propres permissions, et non celles du bot. C'est un raccourci pratique, et non un contournement.
- La correspondance des modules par préfixe rend les préfixes courts souvent ambigus ; utilisez au moins trois ou quatre lettres.
- Le bot n'envoie de message privé à l'invitant qu'à l'arrivée sur le serveur. Si vous l'avez invité via un lien partagé et n'avez rien reçu, ouvrez plutôt l'assistant depuis le tableau de bord.

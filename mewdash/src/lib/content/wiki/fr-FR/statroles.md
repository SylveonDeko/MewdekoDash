---
title: Rôles de statistiques
slug: statroles
summary: Rôles que les membres gagnent grâce à leur activité sur une période et qu'ils perdent lorsqu'ils cessent, selon des seuils, les meilleurs classements, les meilleurs pourcentages ou les séries quotidiennes de messages, de vocal, de jeux, d'invitations, de temps passé sur le serveur ou d'ancienneté du compte.
icon: fa-trophy
category: Community
dashboard: /dashboard/statroles
module: StatRoles
tags: [stat roles, statroles, activity roles, active member role, inactive role, top chatter role, voice role, invite rewards, message rewards, streak, statbot, rôles de statistiques, rôles d'activité, rôle de membre actif, rôle inactif, rôle du plus bavard, rôle vocal, récompenses d'invitations, récompenses de messages, série]
related: [serverstats, xp, invites, liveboards]
---

## Ce que ça fait

Les rôles de niveau d'XP fonctionnent dans un seul sens : une fois obtenus, ils sont conservés à jamais. Un rôle de statistiques est réévalué selon un calendrier. Les membres qui remplissent la condition reçoivent le rôle, ceux qui ne la remplissent plus le perdent ; un rôle « membre actif » signifie donc actif *maintenant*. Rendez-le permanent si vous voulez l'ancien comportement, ou inversez-le pour marquer les membres inactifs.

## Conditions

Chaque rôle de statistiques mesure une seule chose sur une période et applique une seule limite.

| Mesure | Ce qui est compté |
| --- | --- |
| Messages | Messages sur la période, éventuellement uniquement dans certains salons |
| Minutes vocales | Temps passé en vocal sur la période, en respectant les états vocaux que vous avez exclus dans les Statistiques d'activité |
| Minutes de jeu | Temps passé sur un jeu ou une application nommés, ou sur n'importe lequel, sur la période. Nécessite le suivi des jeux activé |
| Invitations | Le total net d'invitations du membre |
| Jours sur le serveur | Depuis que le membre a rejoint le serveur |
| Ancienneté du compte | Depuis la création du compte |

| Limite | Qui est qualifié |
| --- | --- |
| Seuil | Compris entre un minimum et un maximum facultatif |
| Meilleur classement | Classé entre deux positions, par exemple le top 10 |
| Meilleur pourcentage | Dans les X % supérieurs des membres classés, par exemple le top 5 % |
| Série quotidienne | A atteint un minimum par jour sur au moins N jours dans la période, par exemple 5 messages sur 7 des 7 derniers jours |

La période va de 1 à 90 jours, ou sur tout le temps pour toute option sauf une série. Les égalités partagent un même rang.

## Filtres et options

| Option | Ce qu'elle fait |
| --- | --- |
| Compter uniquement dans les salons | Limite les messages ou le vocal à certains salons |
| Rôles requis | Un membre doit en posséder au moins un pour être pris en compte |
| Rôles exclus | Un membre qui en possède un n'est jamais pris en compte |
| Membres ignorés | Jamais attribué ni retiré à ces membres |
| Groupe | Les rôles de statistiques d'un même groupe ne conservent que le palier le plus élevé auquel un membre est qualifié, afin que Bronze, Argent et Or ne se cumulent pas |
| Permanent | Jamais retiré une fois obtenu |
| Inverser | Les membres qui ne sont *pas* qualifiés reçoivent le rôle |
| Inclure les bots | Prendre en compte les comptes bots |
| Évaluer toutes les | Fréquence d'exécution de la règle, au minimum toutes les 10 minutes, toutes les 3 heures par défaut |
| Annoncer dans / MP au membre | Publie un message lorsque le rôle est attribué ou retiré, en utilisant `%user%`, `%role%`, `%action%` (obtenu ou perdu), `%value%` et `%stat%` |

## Tableau de bord

L'onglet **Rôles de statistiques** liste chaque règle avec sa condition, son calendrier et sa dernière exécution, et permet d'activer, désactiver, modifier, supprimer, **prévisualiser** ou **exécuter** chacune d'elles. Un aperçu indique qui gagnerait et perdrait le rôle sans rien modifier. Exécuter applique la règle immédiatement ; les exécutions manuelles sont limitées à une toutes les dix minutes par serveur.

L'onglet **Créer / Modifier** contient le formulaire pour tout ce qui précède.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Chaque commande existe aussi sous `/statrole`.

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `statroleadd <@role> <stat> <minimum> [days] [name]` | `sradd` | Gérer les rôles | Une règle de seuil |
| `statroletop <@role> <stat> <topEnd> [days] [name]` | `srtop` | Gérer les rôles | Une règle de meilleur classement pour les places 1 à topEnd |
| `statrolepercent <@role> <stat> <percent> [days] [name]` | `srpercent` | Gérer les rôles | Une règle de meilleur pourcentage |
| `statrolestreak <@role> <stat> <perDay> <requiredDays> [days] [name]` | `srstreak` | Gérer les rôles | Une règle de série quotidienne |
| `statrolelist` | `statroles` | Personne | Toutes les règles |
| `statroleinfo <id>` | `srinfo` | Personne | Une règle en détail |
| `statroleset <id> <setting> <value>` | `srset` | Gérer les rôles | Modifier le nom, min, max, lookback, topstart, topend, days, permanent, invert, bots, group, interval, notifychannel, notifydm, message ou activity |
| `statrolefilter <id> <#channel, @role [true], or @user>` | `srfilter` | Gérer les rôles | Activer ou désactiver un filtre de salon, un rôle requis (ou un rôle exclu avec `true`), ou un membre ignoré |
| `statroletoggle <id>` | `srtoggle` | Gérer les rôles | Activer ou désactiver |
| `statrolepreview <id>` | `srpreview` | Gérer les rôles | Qui gagnerait et perdrait le rôle |
| `statrolerun <id>` | `srrun` | Gérer les rôles | Appliquer maintenant |
| `statroleremove <id>` | `srremove` | Gérer les rôles | Supprimer la règle ; les membres conservent ce qu'ils possèdent |

## Astuces et pièges

- Le rôle le plus élevé du bot doit être au-dessus du rôle géré, et il a besoin de Gérer les rôles.
- Chaque rôle Discord ne peut être géré que par un seul rôle de statistiques. Supprimez l'ancienne règle avant de pointer une nouvelle règle vers le même rôle.
- Une règle avec un minimum de 0 et sans maximum correspondrait à tout le monde ; donnez-lui un maximum ou utilisez l'inversion en connaissance de cause.
- Les membres qui ont refusé les statistiques d'activité n'ont ni messages, ni temps vocal, ni temps de jeu, donc ils ne sont jamais qualifiés pour ces mesures.
- Prévisualisez avant d'activer une règle sur un gros serveur. Les modifications de rôles sont espacées pour respecter les limites de débit, donc une règle touchant des milliers de membres prend quelques minutes à s'appliquer.

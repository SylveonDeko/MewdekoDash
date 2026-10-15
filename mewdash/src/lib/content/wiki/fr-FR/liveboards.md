---
title: Tableaux en direct
slug: liveboards
summary: Épinglez un classement, un graphique ou une vue d'ensemble dans un salon et laissez le bot le modifier en continu, et publiez un résumé du jour, de la semaine ou du mois selon un calendrier.
icon: fa-thumbtack
category: Community
dashboard: /dashboard/liveboards
module: ServerStats
tags: [live boards, pinned leaderboard, pin leaderboard, auto updating, server report, weekly report, monthly report, digest, growth report, tableaux en direct, classement épinglé, mise à jour automatique, rapport du serveur, rapport hebdomadaire, rapport mensuel, résumé, rapport de croissance]
related: [serverstats, invites, statchannels, statroles]
---

## Ce qu'il fait

Un tableau en direct est un message que le bot publie une fois, épingle, puis modifie à intervalles réguliers pour afficher toujours les chiffres actuels. Un rapport du serveur est un embed ponctuel, accompagné d'un graphique de croissance, publié chaque jour, chaque semaine ou chaque mois, qui résume ce qui s'est passé depuis le dernier rapport.

## Tableaux

| Tableau | Affiche |
| --- | --- |
| Classement des invitations | Les meilleurs invitants avec leurs compteurs réguliers, départs et faux |
| Classement des messages | Les membres les plus bavards |
| Classement vocal | Les membres ayant passé le plus de temps en vocal |
| Jeux les plus joués | Les jeux et applications les plus joués avec le nombre de joueurs (nécessite le suivi des jeux) |
| Graphique des arrivées, graphique des départs, graphique de croissance | Arrivées et départs par jour |
| Graphique des membres | Nombre de membres à partir des instantanés horaires |
| Graphique des messages | Messages par jour |
| Vue d'ensemble du serveur | Le même résumé que `serveractivity` |
| Analyses des invitations | Arrivées, départs, rétention, fausses arrivées et sources |

Chaque tableau dispose d'une **fenêtre** (dernier jour, semaine, mois ou depuis toujours ; les graphiques utilisent jusqu'à 90 jours pour « depuis toujours »), d'un intervalle de rafraîchissement d'au moins 5 minutes, d'un nombre de lignes pour les classements, et d'un interrupteur d'épinglage. Un serveur peut avoir jusqu'à 10 tableaux. Supprimer un tableau supprime son message. Si quelqu'un supprime le message à la main, le bot en publie un nouveau lors du rafraîchissement suivant.

## Rapports du serveur

Définissez un salon et une fréquence : le bot publie un rapport la première fois que le calendrier arrive à échéance, puis chaque jour à 00 h 00 UTC, chaque lundi, ou le premier jour de chaque mois. Un rapport contient :

- Arrivées, départs, croissance nette et rétention pour la période
- Messages, temps vocal et membres actifs
- Nombre de membres et son évolution
- Meilleurs invitants, bavards, membres vocaux et salons les plus actifs
- Meilleurs codes d'invitation avec leurs libellés, et jeux les plus joués lorsque le suivi des jeux est activé
- Un graphique des arrivées et des départs

**Envoyer un rapport maintenant** en publie un immédiatement sans modifier le calendrier. Les rapports se désactivent d'eux-mêmes si le bot perd la permission de publier dans le salon.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les tableaux sont aussi accessibles sous `/liveboard`, et les rapports sous `/serverreport`.

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `liveboardadd <#channel> <board> [range] [rows] [minutes]` | `pinboard`, `pinleaderboard` | Gérer le serveur | Publier et épingler un tableau |
| `liveboardlist` | `liveboards` | Gérer le serveur | Lister tous les tableaux |
| `liveboardremove <id>` | `unpinboard` | Gérer le serveur | Supprimer un tableau et son message |
| `liveboardrefresh` | | Gérer le serveur | Rafraîchir tous les tableaux maintenant |
| `serverreportchannel [#channel]` | `reportchannel` | Gérer le serveur | Définir le salon des rapports et les activer, ou les désactiver |
| `serverreportfrequency <Daily/Weekly/Monthly>` | `reportfrequency` | Gérer le serveur | Fréquence de publication des rapports |
| `serverreportnow [frequency]` | `reportnow` | Gérer le serveur | Publier un rapport dans le salon actuel |

## Astuces et pièges

- L'épinglage nécessite la permission Gérer les messages dans le salon. Sans elle, le tableau est tout de même publié, mais non épinglé.
- Les tableaux modifient le même message ; un tableau placé dans un salon très actif finit donc par disparaître du champ de vision. Placez-les dans un salon de statistiques dédié ou appuyez-vous sur l'épingle.
- Les classements respectent les exclusions d'invitations et d'activité : les membres masqués ou ignorés n'apparaissent jamais sur un tableau épinglé.
- Les salons de statistiques sont l'autre moyen d'afficher des chiffres en direct : un compteur dans le nom d'un salon, au lieu d'un message.

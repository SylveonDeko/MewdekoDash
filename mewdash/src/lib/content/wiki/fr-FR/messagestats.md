---
title: Statistiques des messages
slug: messagestats
summary: Comptez le nombre de messages envoyés par chaque membre dans chaque salon, puis consultez les classements, les répartitions par utilisateur et par salon, ainsi que les graphiques des heures et jours les plus actifs.
icon: fa-envelope
category: Analytics
dashboard: /dashboard/messagestats
module: Utility
tags: [message stats, message count, activity, leaderboard, top users, analytics, busiest hours, activity graph, statistiques des messages, comptage des messages, activité, classement, meilleurs utilisateurs, analyses, heures les plus actives, graphique d'activité]
related: [xp, utility, statchannels]
---

## Ce qu'il fait

Une fois le comptage des messages activé, le bot enregistre un compteur par membre et par salon chaque fois qu'un humain publie un message atteignant la longueur minimale. Rien n'est conservé sur le contenu, seulement qui a écrit, où et quand. Les compteurs sont mis en file d'attente puis écrits dans la base de données par lots, afin que les serveurs très actifs ne ralentissent pas le bot.

Les membres peuvent demander leurs propres totaux avec `usermessages`, voir quel salon est le plus actif avec `channelmessages`, ou consulter l'ensemble du serveur avec `servermessages`. `topusers` affiche un classement des dix meilleurs, avec la part de chaque membre dans le total des messages. `activitygraph` génère un graphique en barres des jours de la semaine ou des heures de la journée les plus actifs.

Le tableau de bord présente les mêmes chiffres sous forme de graphiques, et permet au personnel d'activer ou de désactiver le comptage, de réinitialiser les compteurs et d'exporter les données en CSV ou en JSON.

## Pourquoi l'utiliser

- Repérer vos membres les plus actifs pour des récompenses, des rôles ou le recrutement de modérateurs.
- Identifier les salons désertés et ceux qui prospèrent avant de réorganiser le serveur.
- Choisir les horaires d'événements grâce au graphique des heures les plus actives, dans votre propre fuseau horaire.
- Repérer les bots et les comptes de spam en comparant le nombre de messages à leur qualité.

## Ce qui est compté

| Règle | Comportement |
| --- | --- |
| Comptage activé | Rien n'est enregistré tant que `togglemsgcount` ou l'interrupteur du tableau de bord n'est pas activé |
| Bots | Jamais comptés |
| Messages privés | Jamais comptés ; seuls les salons du serveur le sont |
| Longueur minimale | Les messages plus courts que **la longueur minimale de message** en caractères sont ignorés ; la valeur par défaut est 0, donc tout est compté |
| Horodatages | Les heures des messages sont conservées 90 jours pour alimenter les graphiques horaires et journaliers ; les totaux sont conservés indéfiniment |

La longueur minimale accepte des valeurs allant jusqu'à 4098. Exécuter `minmsglength` sans nombre affiche la valeur actuelle.

## Graphiques d'activité

`activitygraph days` nécessite des données pour les sept jours de la semaine et analyse les quatre dernières semaines. `activitygraph hours` nécessite des données pour les 24 heures sur les sept derniers jours. Pour le graphique horaire, le bot vous demande d'abord de choisir un fuseau horaire, en proposant une liste de fuseaux courants, en acceptant tout nom de fuseau IANA, et en annulant si vous ne répondez pas. Le graphique est publié au format PNG.

## Paramètres

La page Statistiques des messages comporte deux onglets principaux, **Statistiques** et **Gestion**. Statistiques contient **Vue d'ensemble**, **Meilleurs utilisateurs** et **Meilleurs salons**. Gestion contient **Paramètres** et **Exporter les données**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Activer le comptage des messages | Désactivé | Indique si les nouveaux messages sont enregistrés |
| Longueur minimale de message | 0 | Curseur de 0 à 4098 ; le message le plus court à compter |
| Réinitialiser les compteurs de messages | | **Réinitialiser tous les compteurs du serveur** supprime, après confirmation, tous les compteurs enregistrés pour le serveur |
| Format d'export | CSV | Téléchargement CSV ou JSON des statistiques chargées |
| Inclure les statistiques des utilisateurs | Activé | Ajoute les lignes des meilleurs utilisateurs à l'export |
| Inclure les statistiques des salons | Activé | Ajoute les lignes des meilleurs salons à l'export |
| Inclure la répartition horaire | Désactivé | Ajoute les lignes des heures et jours les plus actifs à l'export |

L'onglet **Vue d'ensemble** affiche les tuiles **Messages quotidiens**, **Total des messages**, **Dernière mise à jour** et **Statut**, l'utilisateur et le salon les moins actifs, un graphique **Activité sur 24 heures** et un graphique **Tendance hebdomadaire**. **Meilleurs utilisateurs** liste les **Principaux expéditeurs de messages**, et **Meilleurs salons** liste les **Salons les plus actifs**.

> [!NOTE]
> L'export est généré dans votre navigateur à partir des statistiques déjà chargées sur la page. Les dates de début et de fin que vous saisissez sont inscrites dans l'en-tête du fichier, mais ne filtrent pas les lignes.

## Pas à pas de configuration

1. Ouvrez **Statistiques des messages** dans le tableau de bord, allez dans **Gestion**, puis **Paramètres**.
2. Activez **Activer le comptage des messages**.
3. Vous pouvez éventuellement régler **Longueur minimale de message** sur 5, ou exécuter `minmsglength 5` dans Discord, afin d'ignorer les réponses d'un seul caractère.
4. Laissez le serveur discuter pendant une journée, puis consultez **Statistiques** pour les premiers chiffres.
5. Après une semaine, exécutez `activitygraph hours` et choisissez votre fuseau horaire pour voir les moments les plus actifs du serveur.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `usermessages [@user]` | `usermsg`, `umsg` | Personne | Total, salon le plus actif et salon le moins actif pour vous ou un autre membre |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Personne | Total, membre le plus actif et membre le moins actif dans un salon |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg` | Personne | Total du serveur avec le membre et le salon les plus et les moins actifs |
| `topusers` | `topu` | Personne | Dix meilleurs membres par nombre de messages, avec les pourcentages |
| `activitygraph [days or hours]` | `actgraph` | Personne | Graphique en barres des jours ou heures les plus actifs ; jours par défaut |
| `minmsglength [number]` | `mmlength`, `minmlength` | Gérer le serveur | Afficher ou définir la longueur minimale pour qu'un message soit compté |
| `togglemsgcount` | `togglemessagecount` | Administrateur | Activer ou désactiver le comptage |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Gérer les messages | Réinitialiser les compteurs de tout le serveur, d'un membre, d'un salon, ou d'un membre dans un salon, après confirmation |

## Astuces et pièges

- Le comptage ne commence qu'à partir du moment où il est activé. Les messages envoyés auparavant ne sont jamais rétro-comptés.
- Toutes les commandes de statistiques et le tableau de bord affichent « désactivé » tant que le comptage n'est pas activé, même si d'anciennes données existent.
- Les compteurs sont écrits par lots de cent événements au maximum ; un total peut donc être en retard de quelques secondes par rapport au chat en direct.
- Supprimer un salon ne supprime pas ses compteurs. Utilisez `resetmessagecounts #channel` avant de supprimer le salon si vous voulez qu'ils disparaissent.
- Le graphique horaire n'est aussi précis que le fuseau horaire choisi. Enregistrez le fuseau du serveur avec la commande de fuseau horaire de l'Administration pour que l'ensemble du personnel dispose des mêmes repères.
- Le système d'XP dispose de son propre suivi d'activité et n'utilise pas ces compteurs.

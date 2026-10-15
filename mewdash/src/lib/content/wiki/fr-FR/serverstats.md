---
title: Statistiques d'activité
slug: serverstats
summary: Messages, temps en vocal, jeux et croissance des membres pour l'ensemble du serveur, un membre ou un salon sur n'importe quelle période allant jusqu'à quatre-vingt-dix jours, avec graphiques, classements, exports et option de retrait pour la confidentialité.
icon: fa-chart-simple
category: Analytics
dashboard: /dashboard/serverstats
module: ServerStats
tags: [activity, stats, statistics, statbot, voice time, games, presence, lookback, top chatters, charts, member growth, status, snapshots, privacy, opt out, activité, statistiques, temps vocal, jeux, présence, période, meilleurs bavards, graphiques, croissance des membres, statut, instantanés, confidentialité, retrait]
related: [messagestats, statroles, liveboards, statchannels, invites]
---

## Fonctionnement

Le bot comptait déjà les messages. Les statistiques d'activité ajoutent le temps passé en vocal, les jeux et applications, des instantanés horaires des membres et des statuts, et un moyen d'interroger toutes ces données sur une période : la dernière journée, la semaine, le mois, jusqu'à quatre-vingt-dix jours, ou depuis toujours. Tout est disponible sur le tableau de bord, sous forme de commandes, de graphiques, de CSV, et pour les rôles statistiques, les tableaux en direct, les rapports et les salons de statistiques.

## Ce qui est suivi

| Données | Méthode |
| --- | --- |
| Messages | Chaque message comptabilisé avec un horodatage, conservé pendant quatre-vingt-dix jours, ainsi que les totaux depuis le début par membre et par salon |
| Temps en vocal | Un segment par membre et par salon, découpé à chaque déplacement, mise en sourdine, passage en sourdine, début de diffusion ou activation de la caméra, conservé pendant quatre-vingt-dix jours, ainsi que les totaux depuis le début |
| Jeux et applications | Un segment par membre et par activité (en train de jouer, en diffusion, en écoute, en visionnage, en compétition), conservé pendant quatre-vingt-dix jours, ainsi que les totaux depuis le début. Désactivé par défaut |
| Instantanés | Nombre de membres, d'humains, de bots, en ligne, inactifs, ne pas déranger, hors ligne et en vocal, chaque heure, conservé pendant quatre-vingt-dix jours |
| Arrivées et départs | Chaque arrivée et chaque départ, avec un horodatage |

Les périodes allant jusqu'à quatre-vingt-dix jours lisent les données horodatées. **Depuis toujours** lit les totaux depuis le début, de sorte que la fonction continue de fonctionner une fois que les données de quatre-vingt-dix jours ont expiré.

## Jeux et applications

Le suivi des jeux est désactivé tant que vous ne l'activez pas, car c'est le suivi le plus lourd. Une fois activé, le bot observe la présence de chaque membre et enregistre la durée de chaque jeu, diffusion, session Spotify ou application regardée.

- **Vérifier les activités** (activé par défaut) ne comptabilise que les activités que Discord lui-même atteste : celles qui ont un identifiant d'application enregistré, Spotify et les diffusions. Un client modifié peut prétendre jouer à n'importe quoi ; les activités simplement nommées sont donc ignorées tant que cette option est active.
- Le **filtre d'activités** est une liste de noms de jeux qui agit soit comme une **liste noire** (les jeux listés sont ignorés), soit comme une **liste blanche** (seuls les jeux listés comptent).
- Les statuts personnalisés ne sont jamais comptabilisés.

## Onglets du tableau de bord

| Onglet | Ce qu'il affiche |
| --- | --- |
| Overview | Messages, temps en vocal, personnes ayant écrit, arrivées, départs, croissance nette, membres actuels, le meilleur bavard, le membre le plus actif en vocal, le salon le plus fréquenté et le jeu le plus joué, ainsi que des graphiques pour les messages, les heures en vocal, les membres, le statut des membres, et les arrivées et départs |
| Rankings | Membres et salons classés par messages, temps en vocal ou temps de jeu, et les jeux les plus populaires avec le nombre de joueurs, exportables en CSV. Cliquez sur un membre, un salon ou un jeu pour l'ouvrir |
| Member & Channel | Messages, temps en vocal, rangs, totaux depuis le début, salons et jeux favoris d'un membre ; activité d'un salon et ses membres les plus actifs ; et **Qui joue** pour n'importe quel jeu |
| Settings | Chaque suivi, la période par défaut, le délai entre messages, les bots, les états vocaux qui ne comptent pas, les salons, rôles et membres ignorés, et le filtre d'activités |

## Paramètres

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Default window | 14 jours | Période utilisée par les commandes et la page lorsqu'aucune n'est indiquée |
| Message cooldown | 0 | Secondes entre deux messages comptabilisés d'un même membre. Empêche le spam de gonfler les totaux |
| Track voice time | activé | Indique si les segments vocaux sont enregistrés |
| Hourly snapshots | activé | Indique si les effectifs des membres et des statuts sont relevés chaque heure |
| Count bots | désactivé | Indique si les comptes de bots sont inclus |
| Track games and apps | désactivé | Indique si les activités de présence sont enregistrées |
| Verify activities | activé | Ne comptabilise que les activités attestées par Discord |
| Voice states that do not count | aucun | L'un des états suivants : auto-mute, auto-sourdine, mute serveur, sourdine serveur, salon AFK, seul, diffusion, caméra activée |
| Ignored channels, roles, members | aucun | Rien de ces éléments n'est comptabilisé |

## Confidentialité

Tout membre peut exécuter `statsprivacy` (ou `/serverstats privacy`) pour se retirer. Ses messages, son temps en vocal et son temps de jeu enregistrés sont supprimés sur chaque serveur partagé avec le bot, et rien de nouveau n'est enregistré tant qu'il n'a pas exécuté à nouveau la commande pour revenir. Les administrateurs du serveur ne peuvent pas passer outre.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` si vous ne l'avez pas modifié). Chaque commande existe aussi sous `/serverstats`. `days` correspond à la période ; 0 signifie depuis toujours, et l'omettre utilise la valeur par défaut du serveur.

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `serveractivity [days]` | `sstats` | Aucune | Vue d'ensemble du serveur |
| `useractivity [@user] [days]` | `ustats`, `mystats` | Aucune | Messages, temps en vocal, rangs, totaux depuis le début, principaux salons et jeux d'un membre |
| `channelactivity [#channel] [days]` | `cstats` | Aucune | Activité d'un salon et ses membres les plus actifs |
| `activitytop [Messages/Voice/Activity] [days] [@role]` | `topchatters`, `topvoice` | Aucune | Classement des membres |
| `activitytopchannels [Messages/Voice] [days]` | `topchannels` | Aucune | Classement des salons |
| `topgames [days]` | `games` | Aucune | Les jeux et applications les plus joués |
| `whoplays <game>` | | Aucune | Qui joue actuellement à un jeu et qui y a le plus joué |
| `activitychart [Messages/Voice/Members/Status/Joins/Leaves/Growth/InVoice/Activities] [days]` | `graph` | Aucune | Une image de graphique |
| `activityexport [Messages/Voice/Activity] [days]` | | Gérer le serveur | Un classement en CSV |
| `statssettings` | | Gérer le serveur | Afficher les paramètres |
| `statslookback <days>`, `statscooldown <seconds>` | `lookback` | Gérer le serveur | Période par défaut et délai entre messages |
| `statstrackvoice`, `statstracksnapshots`, `statscountbots`, `statstrackactivities`, `statsverifyactivities` | `trackvoice`, `trackgames` | Gérer le serveur | Activer ou désactiver chaque suivi |
| `statsignorevoicestate <state>` | | Gérer le serveur | Déterminer si un état vocal est comptabilisé |
| `statsignore <#channel, @role or @user>`, `statsignored` | | Gérer le serveur | Exclusions |
| `statsactivityfiltermode <Whitelist/Blacklist>`, `statsactivityfilter <game>`, `statsactivityfilters` | `gamefilter` | Gérer le serveur | Le filtre d'activités |
| `statsprivacy` | `optoutstats` | Aucune | Se retirer du suivi partout, ou y revenir |

## Astuces et pièges

- Les graphiques des membres et des statuts commencent à se remplir une heure après l'activation des instantanés ; il n'existe aucun historique antérieur.
- Le temps en vocal ne se comptabilise que lorsque le bot tourne. Un redémarrage ferme puis rouvre chaque session ; rien n'est perdu, mais les limites des segments se déplacent.
- Exclure un salon masque son historique de toutes les requêtes, en plus d'arrêter les nouveaux comptages ; les anciens chiffres changent donc aussi.
- Le comptage des messages doit rester activé (interrupteur de la page Message Stats) pour que les chiffres de messages apparaissent ici.
- Les noms de jeux sont comparés sans tenir compte de la casse dans le filtre et dans `whoplays`.

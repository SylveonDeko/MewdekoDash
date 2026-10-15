---
title: Réputation
slug: reputation
summary: Permettez aux membres de se remercier mutuellement avec des points de réputation, avec des délais d'attente et des limites anti-abus, des récompenses de rôle à certains seuils, un don déclenché par réaction et une dégradation facultative pour les membres inactifs.
icon: fa-trophy
category: Community
dashboard: /dashboard/reputation
module: Reputation
tags: [reputation, rep, karma, thanks, role rewards, leaderboard, reaction rep, decay, cooldown, réputation, remerciements, récompenses de rôle, classement, réputation par réaction, dégradation, délai d'attente]
related: [xp, administration]
---

## Ce que cela fait

Un membre exécute `rep @user` pour donner un point de réputation, éventuellement accompagné d'une raison. Le total du destinataire augmente, la série de jours consécutifs de l'auteur est suivie, et l'historique conserve qui a donné quoi et pourquoi. Chacun peut consulter les totaux avec `repcheck`, voir le classement du serveur avec `repleaderboard` et lire les dix dernières entrées avec `rephistory`.

Le personnel configure la fluidité de la réputation : un délai d'attente par couple donneur-destinataire, des plafonds quotidiens et hebdomadaires, et un âge minimum du compte, un temps minimum sur le serveur et un nombre minimum de messages avant qu'une personne puisse donner quoi que ce soit. Des salons peuvent être désactivés pour la réputation ou recevoir un multiplicateur. La réputation peut aussi être gagnée par réaction : un émoji configuré sur un message accorde des points à son auteur.

À des seuils choisis, le bot attribue des rôles, annonce le palier dans un salon et envoie un message privé au membre. Une dégradation facultative retire lentement des points aux membres qui n'ont ni donné ni reçu de réputation depuis un moment, afin que le classement reflète l'activité actuelle.

## Pourquoi l'utiliser

- Reconnaître les membres serviables dans les salons d'assistance et leur donner un rôle visible.
- Laisser une réaction pouce levé dans le salon de présentation accorder des points à l'artiste.
- Réserver une commande ou un salon à un certain niveau de réputation au lieu d'un rôle attribué manuellement.
- Organiser un événement de week-end où la réputation dans un salon compte double.
- Garder un classement d'assistance juste grâce à la dégradation pour les personnes qui cessent d'aider.

## Donner de la réputation

Chaque `rep` donne un point, multiplié par le multiplicateur du salon s'il y en a un. Vous ne pouvez pas vous donner de réputation à vous-même ni à un bot. Chaque tentative passe ces vérifications, dans cet ordre, et le premier échec est signalé au donneur :

| Vérification | Valeur par défaut | Ce qui se passe |
| --- | --- | --- |
| Système activé | activé | Tout est refusé lorsqu'il est désactivé |
| État du salon | enabled | Un salon réglé sur `disabled` refuse la réputation donnée dedans |
| Destinataire gelé | non | Les membres gelés ne peuvent pas recevoir de réputation |
| Délai d'attente | 60 minutes | Temps à attendre avant que le même donneur puisse de nouveau donner de la réputation au même destinataire |
| Limite quotidienne | 10 | Réputation qu'un donneur peut distribuer par jour UTC |
| Limite hebdomadaire | aucune | Plafond facultatif par semaine, compté à partir du dimanche |
| Âge minimum du compte | 7 jours | Âge du compte Discord du donneur |
| Temps minimum sur le serveur | 24 heures | Durée de présence du donneur sur le serveur |
| Nombre minimum de messages | 10 | Messages envoyés par le donneur, issus du comptage des messages |

La réputation anonyme enregistre l'entrée comme anonyme, mais seulement si le don anonyme est activé dans la configuration. La réputation négative est un interrupteur distinct ; la suppression d'une réaction retire déjà les points qu'elle avait accordés.

### Séries et statistiques

Donner de la réputation des jours consécutifs construit une série ; un écart de plus d'un jour et demi la réinitialise. `repstats` affiche le total, le rang, les points donnés, les points reçus, la série actuelle et la plus longue série, ainsi que les dates du dernier don et de la dernière réception.

### Types personnalisés

`reptypeadd helpful Helpful` crée un type nommé. Les membres exécutent ensuite `rep @user helpful thanks for the fix`. La réputation standard n'ajoute qu'au total ; un type personnalisé conserve en plus son propre compteur, que les conditions de commande peuvent cibler.

## Réactions

`repreaction <emoji> [amount] [type]` fait en sorte qu'une réaction donne de la réputation à l'auteur du message. La personne qui réagit ne doit pas être un bot, et retirer la réaction reprend les points. La commande attribue par défaut un point de réputation standard, et chaque configuration de réaction possède son propre délai d'attente.

## Récompenses de rôle

`reprole @Role 100` attribue le rôle dès qu'un membre atteint 100 de réputation. Options : retirer à nouveau le rôle lorsque la réputation passe sous le seuil (activé par défaut), annoncer le palier dans un salon et envoyer un message privé. Les récompenses sont vérifiées après chaque modification de réputation. Des XP bonus peuvent être enregistrés sur une récompense, mais ils ne sont pas encore versés.

Indépendamment des récompenses de rôle, le bot publie un message de palier dans le **canal de notification** lorsqu'un membre franchit 50, 100, 250, 500, 1000, 2500, 5000 ou 10000 de réputation. Les membres reçoivent aussi un message privé lorsqu'ils gagnent dix points ou plus d'un coup, ou lorsqu'ils atteignent un multiple de dix.

## Dégradation

Lorsqu'elle est activée, le bot vérifie chaque heure s'il est temps d'appliquer la dégradation. `daily` s'exécute à 02:00 UTC, `weekly` le dimanche à 02:00 UTC, `monthly` le premier du mois. Les membres qui n'ont ni donné ni reçu de réputation pendant la période d'inactivité perdent le montant de la dégradation, soit un nombre fixe de points, soit un pourcentage de leur total, sans jamais descendre sous zéro. Les membres gelés sont ignorés. Valeurs par défaut : hebdomadaire, 1 point, 30 jours d'inactivité.

## Conditions des commandes

`repcommandreq <command> <minimum> [type] [#channels]` bloque une commande tant que le membre n'a pas atteint ce niveau de réputation, éventuellement dans un type personnalisé et éventuellement uniquement dans certains salons. `repcommandbypass` exempte des rôles, et `repcommandinfo` permet à chacun de voir ce qu'une commande exige.

## Paramètres

La page Réputation comporte quatre onglets : **Configuration**, **Récompenses de rôle**, **Classement** et **Statistiques**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Enable Reputation System | activé | Interrupteur général |
| Cooldown (minutes) | 60 | Par couple donneur et destinataire |
| Daily Limit | 10 | Réputation par donneur et par jour |
| Weekly Limit (optional) | aucune | Réputation par donneur et par semaine |
| Min Account Age (days) | 7 | Condition pour le donneur |
| Min Server Time (hours) | 24 | Condition pour le donneur |
| Min Message Count | 10 | Condition pour le donneur |
| Notification Channel (optional) | aucun | Destination des messages de palier |
| Allow Negative Reputation | désactivé | Active les montants négatifs |
| Enable Anonymous Reputation | désactivé | Permet à `repanon` de masquer le donneur |

La dégradation ne figure pas sur le tableau de bord ; utilisez les commandes `repdecay*` ci-dessous.

**Récompenses de rôle** comporte un formulaire avec **Rôle**, **Réputation requise**, **Salon d'annonces (facultatif)**, **XP bonus (facultatif)**, **Retirer le rôle si la réputation passe sous le seuil** et **Envoyer une notification en message privé**. **Classement** affiche le classement et ouvre l'historique d'un membre. **Statistiques** affiche le nombre total d'utilisateurs, la réputation totale donnée, les transactions et la réputation moyenne.

## Mise en place pas à pas

1. Ouvrez **Réputation** dans le tableau de bord. Dans **Configuration**, activez **Activé**.
2. Réglez **Délai**, **Daily Limit** et les trois conditions minimales selon la taille de votre serveur.
3. Choisissez un **Notification channel** pour les paliers, puis enregistrez.
4. Dans **Récompenses de rôle**, ajoutez un rôle avec sa **Réputation requise** et cochez **Retirer le rôle si la réputation passe sous le seuil** si vous voulez qu'il soit gagné en continu.
5. Dans Discord, exécutez `repreaction <emoji> 1` pour activer la réputation par réaction, et `repchannel #bot-spam disabled` pour écarter les salons de spam.
6. Testez avec un second compte : `rep @you great help`, puis `repcheck @you`.

> [!WARNING]
> `represet all` efface, après confirmation, toute la réputation, tout l'historique et tous les badges de chaque membre du serveur. Il n'existe aucun moyen de revenir en arrière.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Objet |
| --- | --- | --- | --- |
| `rep <@user> [type] [reason]` | `+rep`, `giverep`, `gr`, `repgive` | Personne | Donner un point |
| `repanon <@user> [type] [reason]` | `anongiverep` | Personne | Donner anonymement |
| `anonrep <@user> [type] [reason]` | | Personne | Identique à `repanon` |
| `repcheck [@user]` | `myrep`, `checkrep` | Personne | Afficher le total et le rang |
| `repleaderboard [page]` | `replb`, `reptop`, `toprep` | Personne | Classement, 25 par page |
| `rephistory [@user]` | `rephist` | Personne | Dix dernières entrées de réputation |
| `repstats [@user]` | `repstat` | Personne | Statistiques détaillées et séries |
| `repcommandinfo <command>` | `repcmdinfo`, `rci` | Personne | Afficher la condition de réputation d'une commande |
| `repstatus` | `repsettings` | Administrateur | Afficher la configuration |
| `repconfig` | `repcfg` | Administrateur | Menu de configuration interactif |
| `repenable [true/false]` | `repe` | Administrateur | Activer ou désactiver le système |
| `repcooldown <minutes>` | `repcd` | Administrateur | De 1 à 1440 |
| `repdailylimit <n>` | `repdl` | Administrateur | De 1 à 100 |
| `repweeklylimit [n]` | `repwl` | Administrateur | De 1 à 500, ou aucune pour effacer |
| `repminage <days>` | `repma` | Administrateur | De 0 à 365 |
| `repminmembership <hours>` | `repmm` | Administrateur | De 0 à 720 |
| `repminmessages <n>` | `repminmsg` | Administrateur | De 0 à 1000 |
| `repnegative <true/false>` | `repneg` | Administrateur | Autoriser la réputation négative |
| `repanonymous <true/false>` | `repanonym` | Administrateur | Autoriser la réputation anonyme |
| `repnotificationchannel [#channel]` | `repnotify` | Administrateur | Définir ou effacer le salon des paliers |
| `repchannel <#channel> [enabled/disabled/readonly] [multiplier]` | `repch` | Administrateur | État par salon et multiplicateur |
| `repdecay <true/false>` | `repd` | Administrateur | Activer la dégradation |
| `repdecaytype <daily/weekly/monthly/fixed/percentage>` | `repdt` | Administrateur | Calendrier de dégradation ou type de montant |
| `repdecayamount <n>` | `repda` | Administrateur | De 1 à 100 points ou pourcent |
| `repdecayinactive <days>` | `repdi` | Administrateur | De 1 à 365 jours avant la dégradation |
| `reptake <@user> [amount]` | `-rep`, `takerep` | Administrateur | Retirer des points |
| `repset <@user> <amount>` | `setrep` | Administrateur | Définir un total |
| `represet <@user or all>` | `resetrep` | Administrateur | Réinitialiser un membre ou tout le monde |
| `repfreeze <@user>` | `freezerep` | Administrateur | Empêcher un membre de recevoir de la réputation |
| `repunfreeze <@user>` | `unfreeze`, `unfreezerep` | Administrateur | Annuler un gel |
| `repreaction <emoji> [amount] [type]` | `repemoji`, `rre` | Administrateur | Ajouter ou mettre à jour une récompense par réaction |
| `repreactionremove <emoji>` | `repemojiremove`, `rrer` | Administrateur | Supprimer une récompense par réaction |
| `repreactionlist` | `repemojilist`, `rrel` | Administrateur | Lister les récompenses par réaction |
| `reprole [@role] [rep] [removeOnDrop] [#channel] [dm] [xp]` | | Gérer les rôles | Ajouter, mettre à jour ou lister les récompenses de rôle |
| `reproleremove <@role>` | `reprr` | Gérer les rôles | Supprimer une récompense de rôle |
| `reprolechannel <@role> [#channel]` | `reprc` | Administrateur | Définir ou effacer le salon d'annonce d'une récompense |
| `repcommandreq <command> <min> [type] [#channels]` | `repcmdreq`, `rcr` | Administrateur | Exiger de la réputation pour une commande |
| `repcommandbypass <command> <@roles>` | `repcmdbypass`, `rcb` | Administrateur | Rôles qui contournent la condition |
| `repcommandreqremove <command>` | `repcmdreqremove`, `rcrr` | Administrateur | Supprimer une condition |
| `repcommandreqlist` | `repcmdreqlist`, `rcrl` | Administrateur | Lister les conditions |
| `reptypeadd <name> <display name>` | `repaddtype`, `rta` | Administrateur | Ajouter un type personnalisé |
| `reptyperemove <name>` | `repremovetype`, `rtr` | Administrateur | Supprimer un type personnalisé |
| `reptypelist` | `replisttypes`, `rtl` | Administrateur | Lister les types personnalisés |
| `repeventcreate <name> <multiplier> <hours>` | `repec` | Administrateur | Enregistrer un événement à multiplicateur |
| `repeventend <name>` | `repee` | Administrateur | Terminer un événement plus tôt |
| `repexport` | `repex` | Administrateur | Exporter la configuration en JSON |
| `repimport` | `repim` | Administrateur | Importer un fichier de configuration joint au message |
| `repmilestonelost <@user> <@role> <threshold>` | | Administrateur | Message de test pour un palier perdu |

Les commandes slash `/rep` couvrent `give`, `check`, `leaderboard`, `history` et `stats`, ainsi que les groupes d'administration `/rep config`, `/rep decay`, `/rep manage`, `/rep reaction`, `/rep role`, `/rep type`, `/rep event` et `/rep require`, qui reproduisent les commandes de paramétrage ci-dessus. `/rep role list` et `/rep role info` n'existent qu'en commandes slash.

## Astuces et pièges

- Les récompenses de rôle nécessitent que le rôle du bot se situe au-dessus de chaque rôle récompensé et que la permission Gérer les rôles soit accordée ; `reprole` refuse les rôles situés au-dessus du bot.
- Le nombre minimum de messages utilise la fonctionnalité de comptage des messages. Si le comptage est désactivé, les membres peuvent être empêchés de donner de la réputation avec un compte de zéro.
- Seul l'état `disabled` d'un salon bloque les dons. `readonly` est accepté par la commande mais n'empêche pas actuellement la réputation dans ce salon.
- Les événements créés avec `repeventcreate` sont enregistrés avec leur multiplicateur et leur heure de fin, mais le multiplicateur n'est pas appliqué actuellement à la réputation donnée pendant l'événement.
- La réputation par réaction utilise le nom de l'émoji pour les émojis standard et son identifiant pour les émojis personnalisés ; un émoji personnalisé provenant d'un autre serveur ne correspondra donc plus une fois retiré.
- Les vérifications de dégradation s'exécutent à l'heure pleine ; une dégradation `daily` a donc lieu une seule fois pendant l'heure de 02:00 UTC.
- Le délai d'attente s'applique par couple. Un membre peut donner de la réputation à plusieurs personnes différentes les unes après les autres, dans la limite de la limite quotidienne.

---
title: Système d'XP
slug: xp
summary: Récompensez les membres qui discutent et parlent en vocal avec des niveaux, des cartes de rang, des récompenses de rôles et de monnaie, et des événements limités dans le temps.
icon: fa-star
category: Community
dashboard: /dashboard/xp
module: Xp
tags: [xp, experience, levels, level up, rank, rank card, leaderboard, role rewards, voice xp, xp boost, competition, xp curve, expérience, niveaux, passage de niveau, rang, carte de rang, classement, récompenses de rôles, xp vocal, boost xp, compétition, courbe xp]
related: [currency, achievements, administration, utility]
---

## Fonctionnement

Les membres gagnent de l'XP en envoyant des messages et en parlant dans les salons vocaux. L'XP s'accumule en niveaux selon une courbe que vous choisissez. N'importe qui peut utiliser `rank` pour obtenir une carte de rang affichant son niveau, sa barre de progression, son rang sur le serveur et son avatar, ou `leaderboard` pour voir qui est en tête.

Lorsqu'un membre passe au niveau supérieur, le bot peut publier une annonce dans le salon, dans un salon dédié aux passages de niveau, ou par MP. Vous pouvez écrire vos propres messages de passage de niveau avec des placeholders, ou laisser l'embed par défaut s'en charger. Atteindre un niveau peut aussi attribuer automatiquement des rôles et de la monnaie du serveur.

Le staff contrôle la vitesse à laquelle l'XP est gagnée : XP par message, délai de récupération, XP vocal par minute, multiplicateur global, et multiplicateurs par salon et par rôle. Des événements de boost temporaires multiplient tout pendant un certain temps, et les compétitions organisent une course chronométrée avec des récompenses pour les premières places. Des utilisateurs, rôles et salons peuvent être exclus afin que les salons dédiés aux commandes du bot et les rôles muets ne gagnent rien.

## Pourquoi l'utiliser

- Donnez aux membres actifs une progression visible et une raison de continuer à discuter.
- Débloquez des rôles à des niveaux définis pour que les membres de longue date reçoivent des avantages sans intervention manuelle du staff.
- Organisez un événement XP double le week-end ou une course « premier à atteindre le niveau 20 ».
- Gardez l'XP équitable en excluant les salons de commandes, les salons AFK et les rôles de bots.
- Reliez l'XP au module monnaie pour que le passage de niveau rapporte aussi de la monnaie.

## Comment l'XP est gagnée

### XP textuelle

Chaque message d'un membre qui n'est pas un bot rapporte de l'**XP par message** (3 par défaut, plafonnée à 50) une seule fois par délai de récupération. Le **délai de récupération de l'XP par message** est de 60 secondes par défaut ; un membre qui envoie dix messages pendant cette fenêtre ne reçoit de l'XP qu'une fois. Les messages envoyés dans les salons exclus, ou par des utilisateurs et des rôles exclus, ne rapportent rien. Si le serveur est exclu en entier, rien n'est comptabilisé.

Le montant est ensuite multiplié. Tous ces multiplicateurs se cumulent :

| Multiplicateur | Défini avec | Remarques |
| --- | --- | --- |
| Multiplicateur global | `setxpmultiplier` ou **Global XP Multiplier** | S'applique à tous les gains |
| Multiplicateur de salon | `setchannelxp` | S'applique aux gains dans ce salon |
| Multiplicateur de rôle | `setrolexp` | Si un membre possède plusieurs rôles avec un multiplicateur, seul le plus élevé est utilisé |
| Événements de boost | `xpboost` | Chaque événement actif est appliqué |

Le résultat est arrondi à l'entier inférieur.

**Bonus du premier message** est une récompense unique distincte, attribuée au premier message d'un membre chaque jour UTC. Elle est enregistrée dans les paramètres d'XP mais n'est pas affichée sur le tableau de bord.

### XP vocale

L'XP vocale est suivie par session. Un membre ne la gagne que lorsqu'il se trouve dans un salon vocal avec au moins deux participants (les bots ne comptent pas), et qu'il n'est ni muet ni sourd, ni de son propre fait ni par décision du serveur. Le temps passé en étant muet, sourd ou seul n'est pas comptabilisé.

Lorsque la session se termine, les minutes éligibles sont multipliées par l'**XP vocale par minute** (2 par défaut, plafonnée à 10). Les sessions de moins de 15 secondes ne rapportent rien. Le **délai maximal de l'XP vocale** (60 minutes par défaut) correspond au nombre maximal de minutes pour lesquelles une seule session peut être rémunérée. Les multiplicateurs ne s'appliquent à l'XP vocale que si le montant de base est d'au moins 5. Définir l'XP vocale par minute ou le délai maximal à 0 désactive l'XP vocale.

### Dégradation de l'XP

La dégradation est facultative et désactivée par défaut. Lorsqu'elle est activée, toutes les douze heures, le bot recherche les membres dont la dernière activité remonte à plus de **Jours d'inactivité avant dégradation** et retire **Pourcentage de dégradation quotidienne** de leur XP totale. Ces trois paramètres existent dans l'enregistrement des paramètres d'XP mais n'ont encore ni commande ni contrôle sur le tableau de bord.

## Niveaux et courbes

Le niveau d'un membre dépend du **type de courbe d'XP**. Chaque courbe repose sur une base de 36 XP pour le niveau un.

| Courbe | Nom de la commande | Nom sur le tableau de bord | XP nécessaire pour le niveau n |
| --- | --- | --- | --- |
| Standard | `Standard` | Default | 36 x n au carré |
| Linéaire | `Linear` | Linear | 36 x n |
| Accélérée | `Accelerated` | Quadratic | 36 x n à la puissance 1,25 |
| Décélérée | `Decelerated` | Exponential | 36 x n à la puissance 2,5 |
| Personnalisée | `Custom` | non proposée | Identique à Standard |
| Héritée | `Legacy` | Legacy | Chaque niveau coûte 36 plus 9 par niveau précédent ; les totaux s'accumulent |

Standard est la courbe par défaut. Modifier la courbe avec `setxpcurve` recalcule le niveau de tout le monde, sauf si vous passez `false` comme second argument. Modifier la courbe ne change pas le total d'XP de qui que ce soit, seulement le niveau auquel ce total correspond.

## Notifications de passage de niveau

Chaque membre choisit la manière dont il est informé des passages de niveau avec `levelnotif` : `None`, `Channel` ou `Dm`. Les membres peuvent aussi utiliser `leveluppings false` pour empêcher le bot de les mentionner ; leur nom s'affiche alors en texte simple.

Les notifications du salon sont envoyées dans le **salon des passages de niveau** s'il est défini avec `levelupchannel`, sinon dans le salon où l'XP a été gagnée. Le bot doit avoir la permission Envoyer des messages dans ce salon.

Si le serveur n'a pas de messages personnalisés, la valeur par défaut est un embed intitulé avec un message de passage de niveau, l'avatar du membre en miniature, et des champs pour l'XP totale, le rang sur le serveur et le nouveau niveau. Si vous avez ajouté des messages personnalisés avec `addlevelupmessage`, un message activé est choisi au hasard à chaque fois. Un message personnalisé peut être du texte simple ou du JSON d'embed provenant du créateur d'embeds. Testez n'importe quel modèle avec `testlevelupmessage`.

### Placeholders

Ils fonctionnent dans les messages de passage de niveau personnalisés, en complément des placeholders généraux d'utilisateur et de serveur de la page des placeholders. Comme les notifications ne suivent ni le salon ni la personne à l'origine de l'événement, `%xp.channel.*%` affiche « Unknown Channel » et `%xp.triggeruser.*%` affiche « System », et `%xp.gained%` vaut toujours 0.

| Placeholder | Valeur |
| --- | --- |
| `%xp.user%` | Nom d'utilisateur et tag, ou simple nom d'utilisateur si les mentions sont désactivées |
| `%xp.user.mention%` | Mention du membre, ou simple nom d'utilisateur si les mentions sont désactivées |
| `%xp.user.name%` | Nom d'utilisateur |
| `%xp.user.displayname%` | Nom d'affichage |
| `%xp.user.nickname%` | Pseudo, avec repli sur le nom d'utilisateur |
| `%xp.user.avatar%` | URL de l'avatar |
| `%xp.user.id%` | ID de l'utilisateur |
| `%xp.user.created%` | Date de création du compte |
| `%xp.user.joined%` | Date d'arrivée sur le serveur |
| `%xp.level.old%` | Niveau avant le passage de niveau |
| `%xp.level.new%` | Nouveau niveau (`%xp.level.current%` est identique) |
| `%xp.level.next%` | Nouveau niveau plus un |
| `%xp.level.difference%` | Nombre de niveaux gagnés |
| `%xp.total%` | XP totale |
| `%xp.current%` | XP gagnée dans le niveau actuel |
| `%xp.needed%` | XP totale requise pour le niveau actuel |
| `%xp.remaining%` | XP encore nécessaire pour le niveau suivant |
| `%xp.progress%` | Progression dans le niveau, en pourcentage |
| `%xp.rank%` | Rang sur le serveur sous forme de nombre |
| `%xp.rank.ordinal%` | Rang en toutes lettres, par exemple « troisième » |
| `%xp.rank.suffix%` | Uniquement le suffixe : st, nd, rd ou th |
| `%xp.guild%`, `%xp.guild.name%` | Nom du serveur |
| `%xp.guild.id%` | ID du serveur |
| `%xp.guild.membercount%` | Nombre approximatif de membres |
| `%xp.guild.icon%`, `%xp.guild.banner%` | URL de l'icône et de la bannière du serveur |
| `%xp.time%`, `%xp.time.full%`, `%xp.date%` | Heure UTC actuelle, heure avec la date, et date |
| `%xp.timestamp%`, `%xp.timestamp.relative%` | Balises d'horodatage Discord pour le moment présent |

> [!EXAMPLE]
> `addlevelupmessage %xp.user.mention% just hit level %xp.level.new% and is now %xp.rank.ordinal% on the leaderboard.`

Exécutez `levelupplaceholders` dans Discord pour obtenir la même liste.

## Récompenses de rôles

`rolereward <level> <role>` attribue un rôle lorsqu'un membre atteint ce niveau. Avec **Exclusive role rewards** désactivé (par défaut), les membres conservent tous les rôles de récompense pour les niveaux inférieurs ou égaux au leur et perdent ceux des niveaux supérieurs. Lorsqu'il est activé (`setxpexclusive true`), seule la récompense du niveau le plus élevé auquel ils ont droit est conservée, et tous les autres rôles de récompense sont retirés.

Les récompenses sont appliquées lorsque le niveau change. Utilisez `syncmyxproles`, `syncuserxproles` ou `syncallxproles` pour mettre les rôles à jour après l'ajout de récompenses ou l'importation d'XP. La synchronisation de tous les utilisateurs peut être exécutée une fois par heure, et le bot doit avoir la permission Gérer les rôles, avec son rôle placé au-dessus de tous les rôles de récompense.

## Récompenses de monnaie

`currencyreward <level> <amount>` verse de la monnaie du serveur, issue du module monnaie, lorsqu'un membre atteint ce niveau. Passer 0 supprime la récompense. Si le niveau d'un membre baisse, par exemple après `setxp` ou une dégradation, la monnaie correspondant aux niveaux perdus lui est retirée.

## Succès

[Les succès](/wiki/achievements) forment un système distinct, avec leurs propres points et rangs ; un rang de succès n'est donc pas un niveau d'XP. Les deux se rejoignent à deux endroits : atteindre des niveaux d'XP débloque des succès de la catégorie Community, et les succès peuvent rapporter de l'XP grâce à une récompense d'XP propre à chaque succès ou à **XP par point** dans l'onglet Settings des succès. Les deux sont désactivés tant que vous ne les configurez pas.

## Événements de boost

`xpboost <time> <multiplier> <name>` lance un événement limité dans le temps, par exemple `xpboost 2h 2.0 Weekend XP Event`. Chaque boost actif multiplie l'XP textuelle et vocale en plus des autres multiplicateurs. `xpboosts` affiche ceux en cours et `cancelboost <id>` en arrête un avant son terme.

## Compétitions

`xpcompetition <time> <type> [targetLevel] [name]` lance une course chronométrée. Les membres sont inscrits automatiquement dès qu'ils gagnent de l'XP pendant son déroulement.

| Type | Gagnant |
| --- | --- |
| `MostGained` | Celui qui a gagné le plus d'XP pendant la compétition |
| `ReachLevel` | Celui qui atteint le niveau cible en premier |
| `HighestTotal` | Celui qui a le total d'XP le plus élevé à la fin |

Ajoutez des lots avec `addcompetitionreward <id> <position> <type> <reward>`, où le type est `Role`, `XP` ou `Currency`. Les récompenses de rôle sont attribuées, les récompenses d'XP sont ajoutées sous forme d'XP bonus, et la monnaie est versée via le module monnaie. `competitionleaderboard <id>` affiche le classement, et `endcompetition <id>` termine la compétition par anticipation et distribue les récompenses.

## Exclusions

`xpexclude` et `xpinclude` acceptent un utilisateur, un rôle ou un salon textuel. Les utilisateurs exclus et toute personne détenant un rôle exclu ne gagnent jamais d'XP ; les salons exclus ne rapportent rien à personne. Cela vaut aussi pour les salons vocaux. `xpexcludelist users|roles|channels` affiche les listes. Les versions slash sont `/xp admin exclude`, `/xp admin include` (en passant une option `user`, `role` ou `channel`) et `/xp exclude-list`. L'interrupteur **Exclusion du serveur de l'XP** du tableau de bord désactive d'un seul coup le gain d'XP pour tout le serveur.

## Cartes de rang

`rank [@user]` génère une carte au format PNG. `textrank [@user]` donne les mêmes informations sous forme de texte, pour les lecteurs d'écran. Les bots n'ont pas de rang.

La carte est construite à partir du modèle du serveur : une image de fond (la vôtre, issue de **Arrière-plan personnalisé de la carte d'XP**, ou celle intégrée), et des calques pour l'avatar et le nom de l'utilisateur, la barre de progression, le niveau sur le serveur, le rang sur le serveur, le temps passé dans le niveau actuel et l'XP bonus attribuée. Chaque calque peut être affiché ou masqué, déplacé, redimensionné et recoloré, et la barre de progression peut être arrondie, segmentée ou radiale, et se remplir dans n'importe quelle direction.

L'onglet **Modèle** ouvre un éditeur visuel. Sur les écrans de moins de 768 pixels de large, le tableau de bord passe à un éditeur tactile avec les mêmes calques, une feuille inférieure pour les propriétés et des commandes simples de position et de taille. Sur les écrans plus larges, vous obtenez l'éditeur complet avec une liste de calques, une grille, l'accrochage, les règles, annuler et rétablir, et le zoom.

## Classement

`leaderboard [page]` affiche le classement du serveur. Si le serveur utilise aussi le module monnaie et que de la monnaie est en circulation, un `leaderboard` sans argument demande si vous vouliez dire XP ou monnaie ; indiquer une page désigne toujours l'XP. L'onglet **Classement** du tableau de bord affiche le même classement avec une action **Ajuster l'XP** qui permet d'ajouter, de définir ou de réinitialiser l'XP d'un membre, en effaçant éventuellement aussi l'XP bonus.

## Paramètres

Le tableau de bord comporte six onglets : **Paramètres**, **Statistiques**, **Classement**, **Récompenses**, **Modèle** et **Exclusions**. Ces paramètres se trouvent dans l'onglet Settings.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Server XP Exclusion | désactivé | Arrête tout gain d'XP sur le serveur |
| XP Per Message | 3 | XP de base par message, maximum 50 |
| Message XP Cooldown | 60 secondes | Intervalle minimal entre deux gains d'XP par message pour chaque membre |
| Voice XP Per Minute | 2 | XP de base par minute vocale éligible, maximum 10 ; 0 désactive l'XP vocale |
| Voice XP Timeout | 60 minutes | Nombre maximal de minutes rémunérées pour une session vocale |
| Global XP Multiplier | 1 | Multiplie tous les gains |
| XP Curve Type | Default | Courbe qui fait correspondre l'XP aux niveaux |
| Custom XP Card Background | aucun | URL d'image utilisée derrière les cartes de rang |

L'onglet **Récompenses** gère les récompenses de rôles et de monnaie, et **Exclusions** gère les salons et rôles exclus. **Statistiques** affiche le nombre total d'utilisateurs, l'XP totale, le niveau moyen, le niveau le plus élevé et l'activité d'XP récente.

Ces champs existent aussi dans l'enregistrement `GuildXpSetting`, mais ne se définissent que par commande : `FirstMessageBonus`, `ExclusiveRoleRewards` (`setxpexclusive`), `LevelUpChannel` (`levelupchannel`), `LevelUpMessage`, et les champs de dégradation `EnableXpDecay`, `InactivityDaysBeforeDecay` et `DailyDecayPercentage`.

## Pas à pas pour la configuration

1. Ouvrez **Système d'XP** dans le tableau de bord et vérifiez que **Exclusion du serveur de l'XP** est désactivé.
2. Dans **Paramètres**, laissez les valeurs de messages et de vocal par défaut pour commencer, choisissez une courbe, puis cliquez sur **Save Changes**.
3. Dans **Exclusions**, excluez les salons de commandes du bot ainsi que les rôles muets ou ceux des bots.
4. Dans **Récompenses**, ajoutez une récompense de rôle pour quelques niveaux clés. Vérifiez que le rôle du bot est placé au-dessus de ces rôles.
5. Dans Discord, exécutez `levelupchannel #level-ups` et ajoutez un ou deux modèles `addlevelupmessage`. Testez avec `testlevelupmessage`.
6. Ouvrez **Modèle**, importez un fond et disposez la carte. Exécutez `rank` pour voir le résultat.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` si vous ne l'avez pas modifié).

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `rank [@user]` | | Aucune | Afficher une carte de rang |
| `textrank [@user]` | | Aucune | Informations de rang sous forme de texte |
| `leaderboard [page]` | `lb` | Aucune | Classement XP du serveur |
| `levelnotif <None\|Channel\|Dm>` | `lvlnotif` | Aucune | Choisir la manière dont vous êtes informé des passages de niveau |
| `leveluppings <true\|false>` | `lvluppings` | Aucune | Indique si les messages de passage de niveau peuvent vous mentionner |
| `xpsettings` | `xpconfig` | Gérer le serveur | Afficher les paramètres d'XP actuels |
| `setmessagexp <amount>` | `setmsgxp` | Gérer le serveur | XP par message |
| `setxpcooldown <seconds>` | `xpcd` | Gérer le serveur | Délai de récupération de l'XP par message |
| `setvoicexp <amount>` | | Gérer le serveur | XP vocale par minute |
| `setvoicetimeout <minutes>` | | Gérer le serveur | Plafond d'une session vocale |
| `setxpmultiplier <number>` | `xpmult` | Gérer le serveur | Multiplicateur global |
| `setxpcurve <type> [recompute]` | | Gérer le serveur | Modifier la courbe de niveaux |
| `setxpexclusive <true\|false>` | `xpexclusive`, `exclusivexp`, `setxpexcl`, `xpexcl` | Gérer le serveur | Ne conserver que le rôle de récompense le plus élevé |
| `setchannelxp <#channel> <number>` | | Gérer le serveur | Multiplicateur de salon |
| `setrolexp <role> <number>` | | Gérer le serveur | Multiplicateur de rôle |
| `addxp <@user> <amount>` | | Gérer le serveur | Ajouter de l'XP à un membre |
| `setxp <@user> <amount>` | | Gérer le serveur | Définir l'XP d'un membre |
| `resetxp <@user> [resetBonus]` | | Gérer le serveur | Remettre l'XP d'un membre à zéro |
| `resetxp` | | Administrateur | Remettre à zéro l'XP de tout le serveur |
| `xpboost <time> <multiplier> <name>` | | Gérer le serveur | Lancer un événement de boost |
| `xpboosts` | | Aucune | Lister les boosts actifs |
| `cancelboost <id>` | | Gérer le serveur | Arrêter un boost avant son terme |
| `xpexclude <@user\|role\|#channel>` | | Gérer le serveur | Exclure de l'XP |
| `xpinclude <@user\|role\|#channel>` | | Gérer le serveur | Retirer une exclusion |
| `xpexcludelist [users\|roles\|channels]` | | Aucune | Afficher les exclusions |
| `rolereward <level> <role>` | `rr` | Gérer les rôles | Ajouter une récompense de rôle |
| `removerolereward <level>` | `removerr` | Gérer les rôles | Supprimer une récompense de rôle |
| `rolerewards` | | Aucune | Lister les récompenses de rôles |
| `currencyreward <level> <amount>` | `cr` | Gérer le serveur | Ajouter une récompense de monnaie |
| `removecurrencyreward <level>` | `removecr` | Gérer le serveur | Supprimer une récompense de monnaie |
| `currencyrewards` | | Aucune | Lister les récompenses de monnaie |
| `xpcompetition <time> <type> [targetLevel] [name]` | | Gérer le serveur | Lancer une compétition |
| `addcompetitionreward <id> <position> <Role\|XP\|Currency> <reward>` | | Gérer le serveur | Ajouter un prix de classement |
| `xpcompetitions` | | Aucune | Lister les compétitions actives |
| `competitionleaderboard <id>` | `complb` | Aucune | Classement d'une compétition |
| `endcompetition <id>` | | Gérer le serveur | Terminer une compétition et verser les gains |
| `syncallxproles` | | Administrateur | Réappliquer les rôles de récompense à tout le monde (une fois par heure) |
| `syncmyxproles` | | Aucune | Réappliquer vos propres rôles de récompense (une fois toutes les cinq minutes) |
| `syncuserxproles <@user>` | | Gérer les rôles | Réappliquer les rôles de récompense d'un membre |
| `levelupchannel [#channel]` | `lvlupchan` | Gérer le serveur | Salon où vont les notifications ; sans salon, c'est le salon actuel |
| `addlevelupmessage <text or embed JSON>` | `addlvlupmsg` | Gérer le serveur | Ajouter un message de passage de niveau personnalisé |
| `levelupmessages` | `lvlupmsgs` | Gérer le serveur | Lister les messages personnalisés avec leurs ID |
| `removelevelupmessage <id>` | `remlvlupmsg` | Gérer le serveur | Supprimer un message personnalisé |
| `togglelevelupmessage <id> <true\|false>` | `togglelvlupmsg` | Gérer le serveur | Activer ou désactiver un message |
| `testlevelupmessage [template]` | `testlvlupmsg` | Gérer le serveur | Prévisualiser un modèle, ou un modèle enregistré au hasard |
| `levelupplaceholders` | `lvlupplaceholders` | Gérer le serveur | Lister les placeholders ci-dessus |

Les équivalents slash se trouvent sous `/xp`, les commandes réservées au staff étant regroupées dans `/xp admin` (ajouter, définir, réinitialiser, exclure, inclure, synchronisations de rôles), `/xp config` (taux, multiplicateurs, courbe, exclusivité), `/xp rewards`, `/xp boost`, `/xp competition` et `/xp levelup`. `/xp admin reset` sans utilisateur réinitialise l'XP de tout le serveur ; cette action nécessite la permission Administrateur et `confirm: true`.

## Astuces et pièges

- Les récompenses de rôles et les synchronisations de rôles nécessitent que le bot ait la permission Gérer les rôles, et que son rôle le plus élevé soit au-dessus de chaque rôle de récompense. `syncallxproles` et `syncuserxproles` refusent de s'exécuter sans elle.
- L'XP vocale nécessite au moins deux humains non muets et non sourds dans le salon. Un membre seul ou muet ne gagne rien, quelle que soit la durée de sa présence.
- Les gains d'XP sont regroupés et enregistrés en arrière-plan, donc `rank` peut afficher quelques secondes de retard par rapport au dernier message.
- Diminuer l'XP de quelqu'un avec `setxp` ou `resetxp` peut faire baisser son niveau, ce qui retire les rôles de récompense et reprend la monnaie des niveaux perdus.
- La courbe `Custom` se comporte exactement comme Standard et n'est pas proposée sur le tableau de bord. Choisissez Legacy uniquement si vous migrez depuis une ancienne configuration et souhaitez que les niveaux existants correspondent.
- Les messages de passage de niveau personnalisés remplacent entièrement l'embed par défaut. Si tous les messages personnalisés sont désactivés, l'embed par défaut revient.
- Les événements de boost et les compétitions se gèrent uniquement par commande ; le tableau de bord ne les affiche pas.

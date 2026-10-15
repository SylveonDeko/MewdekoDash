---
title: Monnaie
slug: currency
summary: Une économie propre à chaque serveur, avec portefeuilles et banque, récompenses quotidiennes, travail et crime, une boutique de rôles et d'objets, et plus de vingt jeux de paris, le tout réglable depuis le tableau de bord.
icon: fa-money-bill
category: Entertainment
dashboard: /dashboard/currency
module: Currency
tags: [currency, economy, money, coins, shop, balance, bank, daily, work, crime, rob, pay, gambling, blackjack, roulette, slots, leaderboard, monnaie, économie, argent, pièces, boutique, solde, banque, quotidien, travail, crime, vol, payer, jeux d'argent, classement]
related: [xp, administration]
---

## Ce que cela fait

Chaque membre dispose d'un portefeuille et, si vous activez la banque, d'un solde bancaire. Ils gagnent de la monnaie en réclamant une récompense quotidienne, en exécutant `work` et `crime` selon des temps de recharge, en gagnant des parties ou en étant payés par d'autres membres. Ils la dépensent dans votre boutique pour des rôles, des objets de collection ou des objets textuels, ou la misent dans des jeux comme le blackjack, la roulette, les machines à sous, le crash et le keno.

Le personnel décide du fonctionnement de l'économie : si les jeux d'argent sont activés, les limites de mise, l'avantage de la maison, le montant rapporté par le travail et le crime, si le vol existe, la taxe sur les transferts, les intérêts bancaires et les bonus de série quotidiens. Chacun de ces éléments est un paramètre de l'onglet **Configuration** ou une clé `economyset`, ce qui vous permet d'ajuster l'économie sans toucher aux jeux.

Le bot enregistre chaque crédit et débit comme une transaction, afin que les membres puissent voir où est passé leur argent, et l'onglet **Analyses** peut vous montrer la masse monétaire, où elle se trouve, et quels jeux rapportent plus qu'ils ne coûtent.

## Pourquoi l'utiliser

- Donnez aux membres actifs quelque chose à dépenser : un rôle coloré, un titre personnalisé, ou un peu de divertissement dans un salon de jeux.
- Animez un salon de jeux équitable grâce aux limites de mise, à une limite de perte quotidienne et à un avantage de la maison appliqués automatiquement.
- Récompensez les membres avec `modifybalance` ou l'outil **Ajuster un solde** pour l'aide apportée, et laissez-les choisir dans la boutique.
- Consultez le tableau **Performance des jeux** pour voir le rendement réel de chaque jeu et ajustez `payoutmultiplier` à partir de données plutôt qu'à l'intuition.

## Soldes, banque et transferts

`cash` affiche votre portefeuille, ainsi que votre banque et votre valeur nette si vous avez des fonds en banque. `bank` affiche la même chose pour n'importe quel membre et perçoit aussi les intérêts qui vous sont dus. `deposit` et `withdraw` déplacent de l'argent entre les deux ; `all` fonctionne comme montant. L'argent en banque ne peut pas être volé, et une **Capacité de la banque** limite le montant pouvant y être stocké (0 signifie illimité).

Les intérêts sont versés lorsqu'un membre exécute `bank` : si l'intervalle depuis son dernier versement d'intérêts est écoulé, le solde bancaire rapporte une fois le **Interest (%)**. Rien n'est versé tant que personne ne consulte le compte.

`pay` envoie de la monnaie du portefeuille à un autre membre, moins la **Transfer tax (%)**, avec un **Transfert minimum** et un temps de recharge facultatif. Les bots ne peuvent pas être payés.

`transactions` liste les 250 dernières entrées pour vous ou un autre membre, dix par page. `cashleaderboard` classe les membres selon portefeuille plus banque.

## Gagner de l'argent

| Commande | Valeur par défaut | Ce qui se passe |
| --- | --- | --- |
| `dailyreward` | Non défini tant que le personnel n'exécute pas `setdaily` | Crédite le montant quotidien une fois par temps de recharge. Avec les séries activées, chaque réclamation consécutive ajoute **Bonus par jour** multiplié par le nombre de jours de la série au-delà du premier, plafonné par **Bonus maximum**. Manquer une fenêtre de recharge complète réinitialise la série. |
| `work` | 50 à 250, toutes les 30 minutes | Un gain aléatoire dans la plage configurée, réussit toujours. |
| `crime` | 200 à 800, 45 % de réussite, toutes les heures | En cas de réussite, verse la plage du crime. En cas d'échec, inflige une amende de 100 à 500, limitée à ce qui se trouve dans le portefeuille. |
| `rob @user` | Désactivé | Lorsqu'il est activé : 35 % de chances de prendre jusqu'à 20 % du portefeuille de la cible. Les cibles détenant moins de 100 sont protégées. En cas d'échec, vous perdez 15 % de votre propre portefeuille. Une tentative par heure. |

## Jeux

Chaque mise passe par les mêmes vérifications : les jeux d'argent doivent être activés, la mise doit se situer entre la **Mise minimale** et la **Mise maximale**, le membre ne doit pas avoir atteint la **Limite de perte quotidienne** au cours des 24 dernières heures, et le temps de recharge du jeu (s'il existe) doit être écoulé. La mise est prélevée d'avance. Les gains valent `stake plus profit`, et la part du profit est multipliée par le **Multiplicateur de gains** : un multiplicateur de 0,9 réduit chaque gain de dix pour cent, tandis qu'une égalité rembourse la mise en totalité.

| Jeu | Mode de paiement |
| --- | --- |
| `coinflip <bet> heads/tails` | Cote 1:1 pour un bon pronostic |
| `highlow higher/lower [bet]` | Un nombre de 1 à 10 est affiché ; devinez le suivant. Cote 1:1, un nombre identique rembourse la mise. Mise par défaut : 100 |
| `spinwheel [bet]` | Roue pondérée avec des segments allant de moins 10 pour cent à plus 30 pour cent de la mise. Mise par défaut : 10 |
| `blackjack <bet>`, puis `hit` et `stand` | Le croupier tire jusqu'à 17. Cote 1:1 en cas de victoire, égalité remboursée. |
| `slot [bet]` | Deux symboles identiques paient 2x. Trois identiques paient 3x, les raisins 5x, les sept 7x, les diamants 10x. Mise par défaut : 10 |
| `roulette <bet> <type>` | Un numéro de 0 à 36 paie 35 contre 1. `red`, `black`, `even` ou `odd` paient 1:1 ; le zéro fait perdre les paris de couleur et de parité |
| `rps <choice> [bet]` | Pierre, papier, ciseaux, lézard, Spock contre le bot. Cote 1:1, égalités remboursées. La mise est facultative |
| `war <bet>` | La carte la plus haute gagne 1:1. En cas d'égalité, une seconde mise est engagée et une carte supplémentaire est jouée pour le double |
| `craps <bet> [pass/dontpass/field/any]` | Pass et don't pass suivent les règles du point à 1:1. Field paie 1:1, ou 2x sur 2 ou 12. Any seven paie 4x |
| `scratchcard [bronze/silver/gold/diamond]` | Cartes à coût fixe de 10, 50, 200 ou 1000, avec des chances de gain de 30, 25, 20 et 15 pour cent et des lots allant jusqu'à 50, 200, 1000 et 5000 |
| `russianroulette <bet> [bullets]` | Une à cinq balles dans six chambres. Survivre paie 1,2x, 1,5x, 2x, 3x ou 5x de profit selon le nombre de balles |
| `baccarat <bet> [player/banker/tie]` | Joueur ou banquier paient 1,95x, l'égalité paie 8x |
| `minesweeper <bet> [small/medium/large]` | Survie de 70, 60 ou 50 pour cent pour 1,5x, 2,5x ou 4x |
| `lottery [tickets]` | Les billets coûtent 50 chacun, jusqu'à 10. Plus de billets augmentent la chance de gagner (40 % maximum) et le multiplicateur du lot |
| `crash <bet> [target]` | Choisissez un seuil d'encaissement entre 1,1x et 10x. Vous gagnez le seuil si le point de crash est égal ou supérieur |
| `keno <bet> <numbers>` | Choisissez de 1 à 10 numéros entre 1 et 80 ; 20 sont tirés. Les gains vont de 3x pour un numéro sur un jusqu'à 800x pour cinq sur cinq |
| `plinko <bet> [rows]` | 5 à 10 rangées. Tomber au centre paie 0,5x, les bords jusqu'à 10x |
| `wheelfortune <bet> [classic/risky/balanced]` | Roues de multiplicateurs ; la version risky va de 0,1x à 20x |
| `duckrace <bet>` | Cinq canards, le vôtre est tiré au hasard. Premier 4x, deuxième 2x, troisième 1,2x |
| `bingo <bet> [small/large]` | 40 % de chances pour 2x, ou 25 % de chances pour 3,5x |
| `diceduel @user <bet>` | L'adversaire reçoit des boutons accepter et refuser ; les deux doivent pouvoir couvrir la mise |
| `memory <bet> [easy/medium/hard]` | Répétez une séquence de 4, 6 ou 8 pour 1,5x, 2x ou 3x |
| `horserace <bet>` | Jusqu'à dix membres rejoignent dans les dix secondes ; des coureurs IA remplissent les places vides. La cagnotte rapporte 50, 30 et 20 pour cent aux trois premiers |
| `triviachain <bet> [category]` | Répondez à des questions OpenTDB à la suite ; chaque bonne réponse augmente le multiplicateur de 0,5x. Catégories : general, science, history, sports, entertainment |

> [!NOTE]
> `horserace` accepte toute mise positive : il prend directement la mise et n'applique ni les limites de mise communes ni le multiplicateur de paiement.

## Défis quotidiens

Chaque membre reçoit un défi aléatoire par jour : jouer cinq parties, en gagner trois, dépenser 500, gagner 300, ou jouer trois fois à un jeu précis. La récompense correspond au montant de base plus jusqu'à 50 en bonus. `dailychallenge` l'affiche, `claimchallenge` la verse, et `challengeleaderboard` classe les dix premiers selon les défis accomplis au cours des 30 derniers jours.

> [!WARNING]
> Les jeux ne transmettent actuellement pas leur progression au suivi des défis ; les défis affichent donc 0 de progression et ne peuvent pas encore être réclamés.

## La boutique

Les objets se trouvent dans l'onglet **Boutique** ou sont ajoutés avec `shopadditem` et `shopaddrole`. Chaque objet possède un **Nom**, un **Prix**, une **Description**, un **Type**, un **Stock** (vide ou -1 pour illimité), une **Limite par utilisateur**, un **Rôle requis** facultatif que l'acheteur doit posséder, et un **Ordre de tri**.

| Type | À l'achat |
| --- | --- |
| Role | Le bot ajoute le rôle à l'acheteur. Un par membre par défaut. |
| Collectible | Entre dans l'inventaire de l'acheteur ; consommable, donc `use` en retire un. |
| Text | Le **Texte envoyé** est envoyé à l'acheteur en MP, et à nouveau à chaque `use`. |

`buy <name>` vérifie que l'objet est activé, que l'acheteur possède le rôle requis, que le stock reste disponible, qu'il peut payer et qu'il n'a pas atteint la limite par utilisateur. Tout échec après le paiement entraîne un remboursement automatique. `inventory` liste ce qu'un membre possède. `shoptoggle` masque un objet sans supprimer les exemplaires des membres ; `shopremove` le supprime ainsi que chaque exemplaire.

## Espaces réservés

Ces espaces réservés de monnaie sont disponibles dans les réponses aux déclencheurs de discussion et dans les autres endroits qui utilisent les espaces réservés de déclencheurs.

| Espace réservé | Valeur |
| --- | --- |
| `%currency.balance%` | Le portefeuille de l'utilisateur |
| `%currency.bank%` | Le solde bancaire de l'utilisateur |
| `%currency.total%` | Portefeuille plus banque |
| `%targetuser.currency.balance%` | Le portefeuille de l'utilisateur ciblé |
| `%targetuser.currency.bank%` | Le solde bancaire de l'utilisateur ciblé |
| `%currency.emote%` | L'émoji de monnaie du serveur |

## Paramètres

Le tableau de bord comporte quatre onglets : **Analyses**, **Configuration**, **Boutique** et **Classement**. L'onglet **Classement** contient aussi **Ajuster un solde**, qui crédite ou débite un membre avec une raison enregistrée dans le registre.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Enable gambling | Activé | Active ou désactive tous les jeux de mise |
| Minimum bet | 1 | Mise minimale |
| Maximum bet | 0 (illimité) | Mise maximale |
| Payout multiplier | 1.0 | Ne réduit ou n'augmente que les gains, de 0,1 à 5,0 |
| Daily loss limit | 0 (désactivé) | Coupe un membre après avoir perdu ce montant en 24 heures |
| Game cooldown (seconds) | 0 | Secondes entre deux mises par membre |
| Enable work | Activé | La commande `work` |
| Work minimum / maximum | 50 / 250 | Plage de gains du travail |
| Work cooldown | 1800 secondes | `workcooldown`, commande uniquement |
| Enable crime | Activé | La commande `crime` |
| Crime minimum / maximum | 200 / 800 | Plage de gains du crime |
| Crime success chance (%) | 45 | Chance qu'un crime rapporte |
| Crime fine minimum / maximum | 100 / 500 | Amende en cas d'échec |
| Crime cooldown | 3600 secondes | `crimecooldown`, commande uniquement |
| Enable bank | Activé | `bank`, `deposit`, `withdraw` |
| Bank capacity | 0 (illimité) | Montant maximum qu'un membre peut mettre en banque |
| Interest (%) | 0 | Versé à chaque intervalle sur le solde bancaire |
| Interest interval (hours) | 24 | Fréquence à laquelle les intérêts peuvent être perçus |
| Enable transfers | Activé | La commande `pay` |
| Transfer tax (%) | 0 | Prélevée sur chaque paiement |
| Minimum transfer | 1 | Paiement minimal |
| Pay cooldown | 0 | `paycooldown`, commande uniquement |
| Enable robbery | Désactivé | La commande `rob` |
| Success chance (%) | 35 | Chance qu'un vol réussisse |
| Maximum steal (%) | 20 | Part du portefeuille de la cible qu'un succès peut prendre |
| Failure fine (%) | 15 | Part du portefeuille du voleur perdue en cas d'échec |
| Protected below | 100 | Les cibles ayant moins ne peuvent pas être volées |
| Rob cooldown | 3600 secondes | `robcooldown`, commande uniquement |
| Enable streaks | Activé | Les réclamations quotidiennes consécutives rapportent un bonus |
| Bonus per day | 0 | Ajouté par jour consécutif au-delà du premier |
| Maximum bonus | 0 (sans plafond) | Plafond du bonus de série |

Le montant de la récompense quotidienne et son temps de recharge se définissent avec `setdaily`, et non sur le tableau de bord. `economyconfig` affiche chaque clé avec sa valeur actuelle, et `economyreset` restaure toutes les valeurs par défaut.

## Guide de configuration

1. Exécutez `setdaily 500 24h` pour que les membres aient quelque chose à réclamer.
2. Ouvrez **Monnaie** dans le tableau de bord et allez dans **Configuration**. Définissez **Mise maximale** et une **Limite de perte quotidienne** avant d'ouvrir un salon de jeux.
3. Activez **Activer les vols** uniquement si vos membres acceptent de perdre de l'argent de leur portefeuille ; gardez la banque activée pour qu'ils puissent la protéger.
4. Dans **Boutique**, ajoutez quelques objets de rôle et un objet de collection. Définissez un **Rôle requis** sur tout ce qui doit être réservé aux membres.
5. Donnez à quelques membres un solde de départ avec **Ajuster un solde** ou `modifybalance`.
6. Après une semaine, consultez **Analyses** et baissez le **Multiplicateur de gains** si les jeux rapportent plus qu'ils ne coûtent.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Objectif |
| --- | --- | --- | --- |
| `cash` | `$`, `$$`, `$$$`, `currency`, `cur` | Personne | Votre portefeuille, banque et valeur nette |
| `bank [@user]` | | Personne | Soldes d'un membre, et perception de vos intérêts |
| `deposit <amount/all>` | | Personne | Portefeuille vers banque |
| `withdraw <amount/all>` | | Personne | Banque vers portefeuille |
| `pay @user <amount>` | | Personne | Envoyer de la monnaie, moins la taxe |
| `transactions [@user]` | `txs` | Personne | 250 dernières entrées du registre |
| `cashleaderboard` | `cashlb`, `richest` | Personne | Membres les plus riches selon la valeur nette |
| `dailyreward` | `daily` | Personne | Réclamer la récompense quotidienne |
| `work` | | Personne | Gagner un salaire de travail |
| `crime` | | Personne | Gain risqué ou amende |
| `rob @user` | | Personne | Tenter de voler un portefeuille |
| `dailychallenge` | `dc` | Personne | Afficher le défi du jour |
| `claimchallenge` | `claimch` | Personne | Réclamer un défi accompli |
| `challengeleaderboard` | `chlb` | Personne | Meilleurs accomplisseurs de défis |
| `shop` | | Personne | Parcourir la boutique, huit objets par page |
| `buy <item>` | | Personne | Acheter un objet |
| `inventory [@user]` | | Personne | Objets qu'un membre possède |
| `use <item>` | | Personne | Utiliser un consommable |
| `coinflip <bet> <heads/tails>` | `flip` | Personne | Voir les jeux |
| `highlow <higher/lower> [bet]` | | Personne | Voir les jeux |
| `spinwheel [bet]` | `wheel` | Personne | Voir les jeux |
| `blackjack <bet>` | `bj` | Personne | Démarrer ou rejoindre une partie de blackjack |
| `hit` | | Personne | Tirer une carte |
| `stand` | | Personne | Terminer votre tour |
| `slot [bet]` | `slots` | Personne | Voir les jeux |
| `roulette <bet> <type>` | | Personne | Voir les jeux |
| `rps <choice> [bet]` | | Personne | Voir les jeux |
| `war <bet>` | | Personne | Voir les jeux |
| `craps <bet> [type]` | | Personne | Voir les jeux |
| `scratchcard [type]` | `scratch` | Personne | Voir les jeux |
| `russianroulette <bet> [bullets]` | `rroulette` | Personne | Voir les jeux |
| `baccarat <bet> [type]` | | Personne | Voir les jeux |
| `minesweeper <bet> [size]` | `mines` | Personne | Voir les jeux |
| `lottery [tickets]` | | Personne | Voir les jeux |
| `crash <bet> [target]` | | Personne | Voir les jeux |
| `keno <bet> <numbers>` | | Personne | Voir les jeux |
| `plinko <bet> [rows]` | | Personne | Voir les jeux |
| `wheelfortune <bet> [wheel]` | `wof` | Personne | Voir les jeux |
| `duckrace <bet>` | `duck` | Personne | Voir les jeux |
| `bingo <bet> [card]` | | Personne | Voir les jeux |
| `diceduel @user <bet>` | `dd` | Personne | Défier un membre |
| `memory <bet> [difficulty]` | | Personne | Voir les jeux |
| `horserace <bet>` | `hr` | Personne | Rejoindre ou lancer une course |
| `triviachain <bet> [category]` | `tchain` | Personne | Voir les jeux |
| `setdaily <amount> <time>` | | Administrateur | Montant de la récompense quotidienne et temps de recharge, par exemple `setdaily 500 24h` |
| `modifybalance @user <amount> [reason]` | `modbal` | Propriétaire du bot pour la monnaie globale ; sinon selon une surcharge de permission de commande | Ajouter ou retirer de la monnaie ; les montants négatifs débitent |
| `economyconfig` | | Administrateur | Afficher chaque paramètre de l'économie |
| `economyset <setting> <value>` | | Administrateur | Modifier un paramètre par sa clé |
| `economyreset` | | Administrateur | Restaurer toutes les valeurs par défaut |
| `economystats` | | Personne | Taille et concentration de la masse monétaire |
| `economyflow [days]` | | Personne | D'où la monnaie est entrée et sortie de la circulation, 7 jours par défaut |
| `gamestats [days]` | | Personne | Retour aux joueurs par jeu, 7 jours par défaut |
| `shopadditem <price> <name>` | | Administrateur | Ajouter un objet de collection consommable à stock illimité |
| `shopaddrole <price> @role <name>` | | Administrateur, le bot a besoin de Gérer les rôles | Ajouter un objet de rôle, un par membre |
| `shopremove <name>` | | Administrateur | Supprimer un objet et chacun de ses exemplaires |
| `shopprice <price> <name>` | | Administrateur | Modifier un prix |
| `shopstock <stock> <name>` | | Administrateur | Définir le stock restant |
| `shopdesc <name> \| <description>` | | Administrateur | Définir la description |
| `shoptoggle <name>` | | Administrateur | Afficher ou masquer un objet |

## Astuces et pièges

- Définissez **Mise maximale** avant toute chose. Si elle reste à 0, un membre chanceux peut vider l'économie en un après-midi.
- La limite de perte quotidienne compte les pertes nettes des 24 dernières heures ; un membre qui gagne tôt peut donc continuer à jouer plus longtemps.
- Les objets de rôle nécessitent que le rôle le plus élevé du bot soit au-dessus du rôle vendu et la permission Gérer les rôles, sinon l'achat échoue après le paiement avec une erreur d'attribution de rôle.
- Les objets textuels et `use` livrent par MP ; les membres dont les MP sont fermés voient une erreur mais possèdent quand même l'objet.
- Le blackjack ne conserve qu'une partie par membre en mémoire ; `hit` et `stand` ne fonctionnent qu'après `blackjack`.
- Les courses de chevaux attendent dix secondes que d'autres membres rejoignent, puis remplissent la grille avec des coureurs IA et lancent la course.
- Les parties de trivia chain expirent après dix minutes d'inactivité, et un membre ne peut en avoir qu'une en cours à la fois.
- Lorsque le bot est hébergé avec une monnaie globale, les soldes sont partagés entre tous les serveurs et `modifybalance` est réservé au propriétaire.

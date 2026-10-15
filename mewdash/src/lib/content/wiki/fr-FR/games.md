---
title: Jeux
slug: games
summary: Des jeux de discussion que les membres peuvent lancer dans n'importe quel salon, du quiz, du pendu et des chaînes de mots aux courses de frappe, à l'acrophobie et aux sondages.
icon: fa-gamepad-modern
category: Entertainment
module: Games
tags: [games, trivia, hangman, kaladont, nunchi, typing race, acrophobia, tic tac toe, poll, vote, 8ball, choose, jeux, quiz, pendu, course de frappe, acrophobie, morpion, sondage, vote, boule magique, choisir]
related: [polls, currency, xp, searches, utility]
---

## Ce qu'il fait

Les jeux se jouent dans le salon où ils sont lancés. Un membre exécute une commande, le bot publie le jeu, et tout le monde joue en tapant ses réponses ou en appuyant sur des boutons. Un seul jeu de chaque type peut être en cours par salon (ou par serveur pour Nunchi et Kaladont) à la fois, et la plupart des jeux peuvent être arrêtés plus tôt avec la commande d'arrêt correspondante.

Le quiz, le pendu, Kaladont, Nunchi, la course de frappe, l'acrophobie et le morpion sont multijoueurs. Les sondages permettent au personnel de poser une question au salon avec des boutons ou une liste déroulante. `choose` et `8ball` sont de petits jeux ponctuels.

Ce module n'a pas de page dans le tableau de bord. Tout se fait par commandes, et la plupart ne nécessitent aucune permission.

## Pourquoi l'utiliser

- Animer une soirée calme avec une manche de quiz ou de pendu.
- Organiser une course de frappe ou un tournoi Kaladont comme événement communautaire.
- Poser au serveur une question rapide par oui ou non, ou un sondage à plusieurs options avec une liste déroulante.
- Créer un salon Kaladont permanent pour que la chaîne de mots ne s'arrête jamais.

## Quiz

`trivia` lance un quiz. Le bot publie une question, affiche un indice à mi-chemin du minuteur de la question, sauf si les indices sont désactivés, et le premier membre qui tape la bonne réponse gagne un point. Lorsqu'un membre atteint le nombre de points requis, la partie se termine et il gagne. Si un certain nombre de questions consécutives restent sans réponse, la partie s'arrête.

| Option | Par défaut | Ce qu'elle fait |
| --- | --- | --- |
| `-p`, `--pokemon` | désactivé | Mode « Qui est ce Pokemon ? » |
| `--nohint` | désactivé | Ne jamais afficher d'indices |
| `-w`, `--win-req` | 10 | Points nécessaires pour gagner ; 0 pour une partie sans fin |
| `-q`, `--question-timer` | 30 | Secondes par question |
| `-t`, `--timeout` | 10 | Questions sans réponse consécutives avant l'arrêt de la partie ; 0 pour jamais |

`tl` affiche les scores actuels et `tq` arrête la partie. La configuration globale du bot peut définir un minimum de points requis pour gagner et un gain en monnaie pour le vainqueur.

> [!EXAMPLE]
> `trivia -w 5 -q 20` lance une courte partie jusqu'à cinq points, avec vingt secondes par question.

## Pendu

`hangman [type]` choisit un mot dans une catégorie et l'affiche sous forme de tirets. Les membres devinent une lettre, ou le mot entier, en le tapant dans le salon. Six mauvaises réponses font perdre la partie. Les catégories sont `countries`, `movies`, `animals`, `things` et `random` ; `random` est la valeur par défaut. `hangmanlist` affiche les types disponibles sur votre serveur et `hangmanstop` termine la partie.

## Kaladont

Kaladont est une chaîne de mots. Chaque mot doit commencer par les deux dernières lettres du mot précédent, et un mot ne peut être utilisé qu'une seule fois par partie. Les joueurs jouent à tour de rôle, avec une limite de temps par tour. Le dictionnaire peut être en anglais ou en serbe, et les digrammes serbes (comme lj et nj) sont traités comme des lettres uniques.

| Option | Par défaut | Ce qu'elle fait |
| --- | --- | --- |
| `-j`, `--join-time` | 15 | Secondes accordées aux joueurs pour rejoindre avant le début de la partie |
| `-t`, `--turn-time` | 30 | Secondes par tour |
| `-m`, `--min-players` | 2 | Nombre de joueurs nécessaires pour démarrer |
| `-l`, `--language` | en | `en` ou `sr` |
| `-e`, `--endless` | désactivé | Refuse les mots qui ne laissent aucun mot valide au joueur suivant |

`kaladontstop` termine la partie en cours. `kaladontsetup` transforme le salon actuel en salon Kaladont permanent qui fait perdurer la chaîne, avec les mêmes options de langue et de partie sans fin, et `kaladontdisable` le supprime. Les deux nécessitent la permission Gérer les salons.

## Nunchi

`nunchi` crée une partie, et les autres membres exécutent `nunchi` pour la rejoindre pendant la phase d'inscription. À chaque manche, le bot annonce un nombre et chaque joueur doit taper le nombre suivant. Les joueurs qui le tapent correctement passent leur tour ; lorsque tous sauf un ont passé, la manche se termine et le joueur restant est éliminé. Si personne ne répond à temps, la manche redémarre avec tous ceux qui ont déjà passé. Le dernier joueur en lice gagne.

## Course de frappe

`typestart` lance un compte à rebours (cinq secondes par défaut ; `-s` ou `--start-time` le règle de 3 à 30) puis publie une phrase. Le premier membre qui la retape suffisamment fidèlement gagne ; quelques fautes de frappe sont tolérées, environ une par tranche de 25 caractères. Le résultat affiche le nombre de mots par minute et le nombre d'erreurs. `typestop` termine une course, `typelist` affiche le réservoir de phrases, et les propriétaires du bot peuvent ajouter ou supprimer des phrases avec `typeadd` et `typedel`.

## Acrophobie

`acrophobia` publie entre trois et cinq lettres aléatoires. Les membres disposent du temps de soumission (60 secondes par défaut, de 15 à 300) pour envoyer une expression dont les mots commencent par ces lettres dans l'ordre, une seule soumission par personne. Ensuite, tout le monde vote pour sa préférée en tapant son numéro pendant le temps de vote (60 secondes par défaut, de 15 à 120). Vous ne pouvez pas voter pour votre propre proposition. Réglez les minuteurs avec `-s` ou `--submission-time` et `-v` ou `--vote-time`.

## Morpion

`tictactoe` ouvre une partie ; le prochain membre qui l'exécute la rejoint comme second joueur. Les tours se jouent dans le chat, et un joueur qui prend plus de temps que le minuteur de tour (15 secondes par défaut, `-t` ou `--turn-timer`, de 5 à 60) déclare forfait. La partie annonce un vainqueur ou une égalité.

## Sondages

La création de sondages nécessite la permission Gérer les messages. Les options sont séparées par des points-virgules.

| Commande | Type | Comportement |
| --- | --- | --- |
| `poll <question>` | Oui/Non | Deux boutons |
| `pollc question;option1;option2;...` | Choix unique | Un vote par membre |
| `pollm question;option1;option2;...` | Choix multiple | Les membres peuvent choisir plusieurs options |
| `polla question;option1;option2;...` | Anonyme | L'identité des votants est masquée |

Les sondages de deux à cinq options utilisent des boutons ; les plus longs utilisent une liste déroulante pouvant contenir jusqu'à 25 entrées. Les membres peuvent modifier leur vote. Les modèles enregistrent une question et ses options pour les réutiliser : `polltemplates` les liste et `polltemplate <name>` en publie un. La création et la suppression de modèles, la clôture d'un sondage, la liste des sondages actifs et la consultation des statistiques d'un sondage se font avec les commandes slash `/poll` (`create-template`, `delete-template`, `close`, `list`, `stats`) ou sur la page Sondages du tableau de bord, qui dispose de son propre article.

## Autres

- `choose a; b; c` choisit une option au hasard dans une liste séparée par des points-virgules.
- `8ball <question>` répond à partir d'une liste de réponses définie dans la configuration des jeux du bot.
- `linux <word> <word>` publie le copypasta « I'd just like to interject » avec les deux noms échangés.
- `dragon` active ou désactive votre indicateur de bêta-testeur, que vérifient certaines commandes expérimentales.
- `rategirl` n'existe plus que sous forme de stub, avec une note expliquant pourquoi il a été retiré. Il ne fait rien d'utile.

## Paramètres

Ce module n'a pas de page dans le tableau de bord et aucun paramètre par serveur. Le comportement des jeux se règle avec les options de commande ci-dessus. Le fichier de configuration `games.yml` du propriétaire du bot contient les réponses de la boule magique 8ball ainsi que le minimum de points requis et la récompense en monnaie du quiz.

## Pas à pas de configuration

1. Choisissez un salon pour les jeux, ou créez-en un, afin que les messages de jeu ne noient pas la conversation.
2. Si vous voulez une chaîne de mots permanente, exécutez `kaladontsetup -l en` dans ce salon.
3. Exécutez `trivia` ou `hangman` pour vérifier que le bot peut envoyer des messages et lire les réponses dans ce salon.
4. Accordez la permission Gérer les messages au personnel si vous voulez qu'il lance des sondages.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `trivia [options]` | `t` | Personne | Lancer le quiz |
| `tl` | | Personne | Scores du quiz |
| `tq` | | Personne | Arrêter le quiz |
| `hangman [type]` | | Personne | Lancer le pendu |
| `hangmanlist` | | Personne | Lister les types de pendu |
| `hangmanstop` | | Personne | Arrêter le pendu |
| `kaladont [options]` | `kal` | Personne | Lancer Kaladont |
| `kaladontstop` | `kalstop` | Personne | Arrêter Kaladont |
| `kaladontsetup [options]` | `kalsetup` | Gérer les salons | Faire de ce salon un salon Kaladont permanent |
| `kaladontdisable` | `kaldisable` | Gérer les salons | Supprimer le salon permanent |
| `nunchi` | | Personne | Créer ou rejoindre Nunchi |
| `typestart [options]` | | Personne | Lancer une course de frappe |
| `typestop` | | Personne | Arrêter la course |
| `typelist [page]` | | Personne | Lister les phrases de la course |
| `typeadd <text>` | | Propriétaire du bot | Ajouter une phrase |
| `typedel <index>` | | Propriétaire du bot | Supprimer une phrase |
| `acrophobia [options]` | `acro` | Personne | Lancer l'acrophobie |
| `tictactoe [options]` | `ttt` | Personne | Lancer ou rejoindre le morpion |
| `poll <question>` | `ppoll` | Gérer les messages | Sondage oui/non |
| `pollc <question;options>` | | Gérer les messages | Sondage à choix unique |
| `pollm <question;options>` | | Gérer les messages | Sondage à choix multiple |
| `polla <question;options>` | | Gérer les messages | Sondage anonyme |
| `polltemplates` | `ptemplates` | Personne | Lister les modèles de sondage |
| `polltemplate <name>` | `ptemplate` | Gérer les messages | Publier un sondage à partir d'un modèle |
| `choose <a; b; c>` | | Personne | Choisir une option au hasard |
| `8ball [question]` | `eightball` | Personne | Boule magique |
| `linux <word> <word>` | | Personne | Le copypasta d'interjection |
| `dragon` | | Personne | Activer ou désactiver votre indicateur bêta |
| `rategirl` | | Personne | Stub, ne fait rien |

## Astuces et pièges

- Les jeux lisent les réponses du salon : le bot a donc besoin des permissions Lire l'historique des messages et Envoyer des messages dans ce salon, et ne doit pas être bloqué par une règle de permission du salon.
- Les réponses au quiz, au pendu et à Kaladont sont des messages ordinaires. Si vous utilisez aussi le comptage des messages ou l'XP, ces messages sont comptés.
- Une seule partie de quiz, de pendu, de frappe ou de Kaladont peut être en cours par salon ; la commande de lancement vous indique si une partie est déjà en cours.
- Les options de sondage de plus de 100 caractères sont tronquées dans la liste déroulante.
- Nunchi élimine le joueur le plus lent à chaque manche ; un grand groupe peut donc mettre un certain temps à terminer.

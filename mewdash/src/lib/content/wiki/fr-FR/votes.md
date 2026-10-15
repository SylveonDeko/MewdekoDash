---
title: Votes
slug: votes
summary: Récompensez les membres qui votent pour votre serveur sur top.gg avec un message de remerciement, un compteur de votes et des rôles temporaires ou permanents.
icon: fa-thumbs-up
category: Community
dashboard: /dashboard/votes
module: Votes
tags: [votes, top.gg, vote rewards, vote roles, webhook, vote password, leaderboard, récompenses de vote, rôles de vote, mot de passe de vote, classement]
related: [administration, xp]
---

## Ce que ça fait

Il ne s'agit pas d'une fonction de sondage. Votes suit les votes que reçoit votre serveur sur top.gg et récompense les personnes qui les ont émis. Lorsque top.gg indique à Mewdeko qu'une personne a voté, le bot enregistre le vote, publie un message de remerciement dans votre salon de votes avec le total cumulé de ce membre, et attribue les rôles configurés comme récompenses de vote.

Du point de vue d'un membre : il vote pour le serveur sur top.gg, puis un message apparaît dans le salon de votes en le mentionnant et en indiquant combien de fois il a voté. Si vous avez configuré des rôles de vote, il les reçoit en même temps, de façon permanente ou pour une durée déterminée.

Du point de vue du staff : vous définissez un salon de votes, un mot de passe de webhook, un message personnalisé facultatif et jusqu'à dix rôles de récompense. Ensuite, le bot gère seul chaque vote. Les commandes `votes` et `votesleaderboard` permettent à tout le monde de consulter les compteurs.

Le lien entre top.gg et votre serveur est le mot de passe de vote. top.gg l'envoie dans l'en-tête Authorization de son appel de webhook, et Mewdeko compare cet en-tête au mot de passe enregistré pour chaque serveur afin de déterminer à quel serveur appartient le vote.

## Pourquoi l'utiliser

- Vous référencez votre serveur sur top.gg et voulez un remerciement visible à chaque vote.
- Vous voulez donner un rôle « Voter » aux votants, ou un rôle d'avantage temporaire qui expire après douze heures.
- Vous voulez un classement mensuel des votants pour organiser une récompense du « meilleur votant ».
- Vous voulez que les membres puissent consulter leur nombre de votes sans demander au staff.

## Traitement d'un vote

1. top.gg envoie une requête au point de terminaison webhook `/votes/` du bot, avec l'identifiant Discord du votant et votre mot de passe dans l'en-tête Authorization.
2. Le bot trouve le serveur dont le mot de passe de vote enregistré correspond. Si aucun ne correspond, le vote est rejeté.
3. Le vote est enregistré avec l'identifiant du votant et l'heure.
4. Si un salon de votes est défini, le bot y publie le message de remerciement. Sans salon de votes, rien n'est publié et aucun rôle n'est attribué.
5. Chaque rôle de vote est ajouté au membre. Les rôles avec minuterie sont retirés à l'échéance, selon le même système de rôles temporaires que les mises en sourdine.

> [!WARNING]
> Le mot de passe est le seul élément qui relie un vote à votre serveur. Toute personne qui le connaît peut envoyer de faux votes. Ne le collez jamais dans un salon public ; le bot le définit via un formulaire privé pour cette raison.

## Le message de remerciement

Par défaut, le bot envoie une mention du votant et un embed intitulé « Thanks for voting for <server> », une ligne indiquant son nombre total de votes, et son avatar en vignette.

Vous pouvez remplacer ce message par votre propre texte ou embed avec `votemessage` ou la zone **Annonce de vote personnalisée** du tableau de bord. Le texte passe par l'analyseur d'embeds, donc tout ce que produit l'éditeur d'embeds fonctionne. Définissez-le sur `-` dans la commande, ou videz la zone du tableau de bord, pour revenir au message par défaut.

### Variables

Le message personnalisé prend en charge l'ensemble général de variables (utilisateur, serveur, salon, bot et heure, de la page des variables) ainsi que deux variables propres aux votes.

| Variable | Valeur |
| --- | --- |
| `%votestotalcount%` | Nombre de fois où ce membre a voté au total |
| `%votesmonthcount%` | Nombre de fois où il a voté pendant le mois civil en cours |
| `%user.mention%`, `%user.name%`, `%user.id%`, `%user.avatar%` | Le votant |
| `%server.name%`, `%server.id%`, `%server.icon%`, `%server.members%` | Votre serveur |

> [!EXAMPLE]
> `Thanks %user.mention% for voting! That is vote number %votestotalcount% (%votesmonthcount% this month).`

L'exécution de `votemessage` sans texte affiche un aperçu du message actuel tel qu'il apparaîtrait pour vous, avec vos propres compteurs de votes.

## Rôles de vote

Un rôle de vote est attribué à chaque votant. Chaque rôle a une durée facultative en secondes ; `0` signifie que le rôle est permanent.

- Jusqu'à dix rôles de vote par serveur.
- Le rôle `@everyone` ne peut pas être ajouté.
- Un rôle ne peut pas être ajouté deux fois ; utilisez `voteroleedit` pour modifier sa durée.
- Les rôles temporaires sont retirés automatiquement à l'échéance de leur durée.
- Si le bot ne peut pas attribuer un rôle (par exemple si le rôle est au-dessus du rôle le plus élevé du bot), il l'ignore silencieusement.

## Compteurs de votes et classement

`votes` affiche les votes d'un membre pour le mois en cours et au total, avec son avatar. `votesleaderboard` classe tout le serveur par nombre total de votes, douze par page. Passez `true` pour classer uniquement par votes du mois en cours. Les deux chiffres « mois » comparent le mois civil, et non les trente derniers jours.

## Paramètres

La page Votes comporte trois onglets : **Configuration**, **Rôles de vote** et **Statistiques**.

| Paramètre | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Vote Announcement Channel | aucun | Où sont publiés les messages de remerciement. Rien ne se passe sans lui |
| API Password (for webhooks) | aucun | Le secret que top.gg doit envoyer dans son en-tête Authorization |
| Custom Vote Announcement | embed par défaut | Votre propre message, avec les variables ci-dessus. Vide signifie le message par défaut |
| Role to Grant | aucun | Un rôle ajouté à chaque votant (onglet Vote Roles) |
| Duration (seconds, 0 for permanent) | 0 | Durée d'un rôle de vote avant son retrait |

L'onglet **Statistiques** affiche le total des votes, le nombre de rôles de vote, le nombre de votes du meilleur votant, et un classement des dix premiers.

## Pas à pas

1. Ouvrez **Votes** dans le tableau de bord et restez sur **Configuration**.
2. Choisissez un **Salon d'annonce des votes**. Sans lui, les votes sont enregistrés, mais rien n'est publié et aucun rôle n'est attribué.
3. Saisissez un **API Password**. Rendez-le long et aléatoire ; traitez-le comme une clé d'API.
4. Rédigez éventuellement un **Annonce de vote personnalisée** avec les variables ci-dessus, puis cliquez sur **Enregistrer la configuration**.
5. Sur la page top.gg de votre serveur, ouvrez la section des webhooks. Définissez l'URL du webhook sur le point de terminaison `/votes/` de votre bot, et la valeur Authorization sur le même mot de passe.
6. Sur **Rôles de vote**, choisissez un **Rôle à attribuer** et une **Durée**, puis cliquez sur **Ajouter un rôle de vote**. Répétez pour jusqu'à dix rôles.
7. Vérifiez que le rôle du bot se trouve au-dessus de chaque rôle de vote dans la liste des rôles.
8. Utilisez le bouton de test de webhook de top.gg, ou attendez un vote réel, et vérifiez le salon de votes.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Autorisation | Rôle |
| --- | --- | --- | --- |
| `votechannel <#channel>` | | Gérer le serveur | Définir le salon des messages de remerciement |
| `votemessage [text]` | `votemsg` | Gérer le serveur | Prévisualiser, définir ou réinitialiser (`-`) le message personnalisé |
| `votepassword` | `votepass` | Gérer le serveur | Définir le mot de passe du webhook via un formulaire privé |
| `voteroleadd <@role> [time]` | `vra` | Gérer le serveur | Ajouter un rôle de vote, avec une durée facultative, par exemple `voteroleadd @Voter 12h` |
| `voteroleedit <@role> <time>` | `vre` | Gérer le serveur | Modifier la durée d'un rôle de vote |
| `voteroleremove <@role>` | `vrr` | Gérer le serveur | Retirer un rôle de vote |
| `voteroleslist` | `vrl` | Gérer le serveur | Lister les rôles de vote et leurs durées |
| `voterolesclear` | `vrc` | Gérer le serveur | Retirer chaque rôle de vote, après confirmation |
| `votes [@user]` | | Personne | Afficher les votes mensuels et totaux d'un membre |
| `votesleaderboard [true]` | `voteslb` | Personne | Classer les votants par total, ou par mois avec `true` |

Les mêmes commandes existent sous forme de commandes slash sous `/votes`.

## Astuces et pièges

- Seuls les votes sur top.gg sont pris en charge. Il n'existe aucune intégration pour d'autres listes de bots, et cette fonction ne crée pas de sondages.
- Sans salon de votes, aucun message n'est publié et aucun rôle n'est attribué, même si le vote est tout de même compté.
- Le bot a besoin de la permission Gérer les rôles, et son rôle doit être au-dessus de chaque rôle de vote, sinon les récompenses échouent silencieusement.
- Les rôles de vote temporaires utilisent le même système de rôles temporaires que les mises en sourdine temporaires, et apparaissent dans le journal d'audit avec la raison « Vote Role ».
- `voteroleedit` recherche le rôle uniquement par son identifiant ; ne l'utilisez donc que pour des rôles que vous avez réellement ajoutés sur ce serveur.
- Modifier le mot de passe n'invalide pas les anciens votes, mais top.gg ne les associera plus tant que vous n'aurez pas mis à jour l'en-tête de son côté également.

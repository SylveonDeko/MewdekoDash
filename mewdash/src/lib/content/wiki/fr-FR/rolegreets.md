---
title: Messages d'attribution de rôle
slug: rolegreets
summary: Envoyez un message personnalisé dans un salon chaque fois qu'un membre obtient un rôle précis, avec des espaces réservés, des embeds, des webhooks et une suppression automatique.
icon: fa-user
category: Actions
dashboard: /dashboard/rolegreets
module: RoleGreets
tags: [role greet, role greets, welcome, role message, role announcement, verification welcome, webhook greet, message de rôle, accueil, bienvenue, annonce de rôle, vérification, webhook]
related: [multigreets, embedbuilder, administration]
---

## Ce que cela fait

Un message d'attribution de rôle est un message que le bot publie lorsqu'un membre reçoit un rôle. Le personnel choisit un rôle et un salon, rédige le message, et désormais, chaque fois que ce rôle est ajouté à quelqu'un, le bot y publie le message. Le message par défaut est `Welcome %user.mention%!`.

Le message passe par l'analyseur d'embeds, il peut donc être du texte brut, un embed complet, ou un embed avec des boutons créés dans l'éditeur du tableau de bord. Les espaces réservés remplissent le nom du membre, son avatar, sa date d'arrivée et les détails du serveur. Chaque message peut être publié via un webhook avec son propre nom et son propre avatar, et peut se supprimer automatiquement après un nombre de secondes défini.

Les messages sont propres à chaque rôle et à chaque salon. Un rôle peut avoir jusqu'à dix messages, chacun dans un salon différent ou avec un texte différent, et un message peut être désactivé sans être supprimé.

## Pourquoi l'utiliser

- Accueillir les membres dans le salon principal seulement après qu'ils ont réussi la vérification et reçu le rôle Verified.
- Annoncer les nouveaux boosters dans un salon de remerciements lorsque le rôle booster apparaît.
- Indiquer à quelqu'un qui vient de choisir un rôle de jeu où se trouvent ses salons.
- Publier une liste de contrôle d'intégration du personnel dans le salon du personnel lorsqu'un rôle de modérateur est attribué.
- Accueillir les membres ajoutés à un rôle de concours ou d'événement avec les règles de cet événement.

## Comment un message se déclenche

Le bot surveille les mises à jour des membres et compare les rôles avant et après. Pour chaque rôle ajouté, il recherche les messages liés à ce rôle et publie chacun d'eux. Les rôles retirés ne déclenchent jamais rien. Les bots sont ignorés, sauf si **Accueillir les bots** est activé pour ce message, et un message désactivé est ignoré.

Si le salon n'existe plus, le message se supprime lui-même. Si un message par webhook échoue parce que le webhook a été supprimé ou que le bot a perdu une permission, le message est désactivé plutôt que supprimé, afin que vous puissiez le corriger et le réactiver.

Avec un webhook défini, le message est envoyé sous le nom et l'avatar du webhook. La suppression automatique fonctionne toujours : le bot récupère le message qu'il vient d'envoyer et le supprime après le délai.

## Espaces réservés

Les messages d'attribution de rôle prennent en charge les groupes d'espaces réservés user, server et bot. Les espaces réservés de salon ne sont pas disponibles.

| Espace réservé | Valeur |
| --- | --- |
| `%user.mention%`, `%user%` | Mention du membre qui a obtenu le rôle |
| `%user.name%`, `%username%` | Son nom d'utilisateur |
| `%user.fullname%` | Nom d'utilisateur avec son tag |
| `%user.avatar%` | URL de l'avatar |
| `%user.banner%` | URL de la bannière |
| `%user.id%` | Identifiant utilisateur |
| `%user.created_date%`, `%user.created_time%` | Date et heure de création du compte |
| `%user.joined_date%`, `%user.joined_time%` | Date et heure d'arrivée sur le serveur |
| `%server.name%`, `%server%` | Nom du serveur |
| `%server.members%` | Nombre de membres en cache |
| `%server.icon%`, `%server.banner%` | URL de l'icône et de la bannière du serveur |
| `%server.boostlevel%`, `%server.boostcount%` | Niveau et nombre de boosts |
| `%server.time%`, `%time.day%` | Heure du serveur et jour de la semaine |
| `%bot.name%`, `%bot.avatar%`, `%bot.id%` | Nom, avatar et identifiant du bot |

Lorsque le suivi des invitations est activé sur le serveur, les espaces réservés d'invitant et d'invitation de Multi Greets (`%inviter.username%`, `%inviter.mention%`, `%inviter.count%`, `%invite.code%`, `%invite.label%` et les autres) sont aussi remplis à partir de la personne qui a invité le membre. Si l'invitant n'est pas connu, ces espaces affichent `Unknown`.

> [!EXAMPLE]
> `Welcome to the team, %user.mention%! You are member number %server.members%. Check the pins in this channel first.`

## Paramètres

La page Messages d'attribution de rôle comporte en haut un formulaire **Ajouter un nouveau message de rôle**, et une carte pour chaque message en dessous.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Role | aucun | Le rôle qui déclenche le message |
| Channel | aucun | Où le message est publié |
| Message | `Welcome %user.mention%!` | Ouvre l'éditeur d'embeds |
| Delete Time (seconds, 0 for never) | 0 | Délai de suppression automatique |
| Webhook URL (optional) | aucun | Publier via un webhook au lieu du bot |
| Greet Bots | désactivé | Accueillir aussi les comptes bots qui obtiennent le rôle |
| Enabled | activé | Bascule sur la carte ; les messages désactivés ne font rien |

## Guide de configuration

1. Ouvrez **Accueils par rôle** dans le tableau de bord.
2. Dans **Ajouter un nouveau message de rôle**, choisissez le **Rôle** et le **Salon**, puis cliquez sur **Ajouter un message de rôle**.
3. Sur la nouvelle carte, cliquez dans la zone de message pour ouvrir l'éditeur et rédigez votre message avec les espaces réservés ci-dessus.
4. Définissez **Delete Time** si le salon doit rester propre, et collez une **URL du webhook** si vous voulez un nom et un avatar personnalisés.
5. Enregistrez la carte, puis attribuez le rôle à un compte de test et vérifiez le salon.
6. Utilisez le bouton de bascule de la carte pour suspendre un message, ou le bouton de suppression pour le retirer.

> [!TIP]
> Dans Discord, `rolegreetmessage 1` sans texte affiche le message actuel et propose un bouton **Aperçu** qui le rend avec vos propres informations.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les messages sont numérotés selon leur position dans `rolegreetlist`.

| Commande | Alias | Nécessite | Objectif |
| --- | --- | --- | --- |
| `rolegreetadd <@role> [#channel]` | `rgadd`, `rga` | Administrateur | Ajouter un message pour un rôle, dans le salon actuel si aucun n'est donné |
| `rolegreetlist` | `rglist`, `rgl` | Administrateur | Parcourir chaque message avec ses paramètres |
| `rolegreetmessage <id> [message]` | `rgmsg`, `rgm` | Administrateur | Définir le message, ou l'afficher et le prévisualiser sans texte |
| `rolegreetremove <id or @role>` | `rgrem`, `rgrm`, `rgr` | Administrateur | Supprimer un message par numéro, ou tous les messages d'un rôle après confirmation |
| `rolegreetdelete <id> <time or seconds>` | `rgdel`, `rgd` | Administrateur | Délai de suppression automatique, par exemple `30s` ou `30` ; `0` désactive |
| `rolegreetdisable <id> <true/false>` | `rgdisable`, `rgdis` | Administrateur | Désactiver ou réactiver un message |
| `rolegreetgreetbots <id> <true/false>` | `rolegreetbots`, `rggb` | Administrateur | Indique si les bots déclenchent le message |
| `rolegreetwebhook <id> [name] [avatar url]` | `rgwebhook`, `rghook`, `rgh` | Administrateur | Créer un webhook dans le salon du message avec ce nom et cet avatar, ou le supprimer sans nom |

Les commandes slash se trouvent sous `/rolegreets` avec les mêmes actions : `add`, `remove`, `removerole`, `message`, `delete`, `disable`, `greetbots`, `webhook` et `list`.

## Astuces et pièges

- Le bot a besoin des permissions Envoyer des messages et Intégrer des liens dans le salon du message, Gérer les messages dans ce salon pour la suppression automatique, et Gérer les webhooks pour créer un webhook avec `rolegreetwebhook`.
- La limite est de dix messages par rôle, et non par serveur. La commande d'ajout refuse un onzième message.
- Les messages se déclenchent à chaque ajout de rôle, y compris ceux issus des rôles par réaction, des récompenses de niveau et d'autres bots ; un rôle souvent ajouté puis retiré inondera donc le salon.
- Si l'analyseur d'embeds ne produit rien, par exemple un message composé uniquement d'espaces, rien n'est envoyé.
- `rolegreetremove` avec un rôle supprime tous les messages de ce rôle après une question oui/non ; avec un numéro, il ne supprime que celui-ci immédiatement.
- Les numéros changent lorsqu'un message est supprimé. Relancez `rolegreetlist` avant de modifier un message par son numéro.
- Les messages d'attribution de rôle sont distincts des messages d'arrivée de la page MultiGreets. Utilisez MultiGreets pour les personnes qui rejoignent le serveur, et les messages d'attribution de rôle pour les rôles obtenus ensuite.

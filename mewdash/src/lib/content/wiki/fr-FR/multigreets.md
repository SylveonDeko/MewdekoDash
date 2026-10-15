---
title: Messages d'accueil
slug: multigreets
summary: Publiez des messages de bienvenue dans jusqu'à trente salons lorsqu'un membre rejoint, ainsi que les messages d'au revoir, de boost et d'accueil en MP classiques.
icon: fa-bell
category: Actions
dashboard: /dashboard/multigreets
module: MultiGreets
tags: [greets, multigreets, welcome, join message, goodbye, bye, leave message, boost message, greet dm, webhook, placeholders, accueil, bienvenue, message d'arrivée, au revoir, message de départ, message de boost, MP d'accueil, webhook, variables]
related: [rolegreets, invites, administration]
---

## Ce que ça fait

Lorsqu'un membre rejoint le serveur, le bot publie un message d'accueil dans chaque salon que vous avez configuré comme salon d'accueil. Chaque accueil possède son propre message, son propre minuteur de suppression, sa propre identité de webhook et son propre interrupteur de bot. Vous pouvez tous les exécuter en même temps, ou en choisir un au hasard à chaque arrivée.

Les messages passent par l'analyseur d'embeds ; un accueil peut donc être du texte simple, un embed complet avec des boutons, ou une publication par webhook avec un nom et un avatar personnalisés. Les variables remplissent le nom du membre, le nom du serveur, le nombre de membres et, si le suivi des invitations est activé, la personne qui l'a invité.

L'ancien système à message unique existe toujours à côté. Il gère le message d'au revoir lorsqu'une personne quitte le serveur, l'annonce de boost lorsqu'une personne booste, et un MP de bienvenue privé. Ils se trouvent dans le module Administration et sont décrits plus bas.

## Pourquoi l'utiliser

- Un message de bienvenue public dans `#general` et une ligne de journal discrète dans `#staff-joins` pour la même arrivée.
- Des styles d'accueil différents selon les salons, par exemple un embed dans l'un et un « personnage » webhook dans l'autre.
- Un ensemble d'accueils dans lequel chaque nouveau membre en reçoit un choisi au hasard.
- Un court message de bienvenue qui s'efface tout seul au bout d'une minute pour que le salon ne se remplisse pas.
- Un message d'au revoir ou de boost sans rien configurer d'autre.

## Types d'accueil

Le **type d'accueil** s'applique à tout le serveur et détermine ce qui se passe à l'arrivée d'un membre.

| Type | Libellé du tableau de bord | Ce qui se passe |
| --- | --- | --- |
| MultiGreet | Tous les accueils | Chaque accueil activé se déclenche, dans l'ordre où ils ont été ajoutés. Par défaut. |
| RandomGreet | Accueil aléatoire | Un accueil est choisi au hasard dans la liste et se déclenche. Les accueils désactivés peuvent être choisis puis ignorés. |
| Off | Désactivé | Aucun accueil ne se déclenche. |

## Contenu d'un accueil

Chaque accueil est lié à un salon. Un salon peut contenir jusqu'à cinq accueils, et un serveur peut en contenir trente au total. Les accueils sont numérotés selon leur position dans la liste, et ce numéro est celui qu'utilisent les commandes.

| Champ | Par défaut | Signification |
| --- | --- | --- |
| Salon | le salon que vous avez ajouté | Où cet accueil est publié |
| Message | vide | Modèle de texte ou d'embed. Un accueil vide n'envoie rien. |
| Supprimer après | 0 (jamais) | Nombre de secondes avant que le message d'accueil ne s'efface |
| Accueillir les bots | désactivé | Indique si l'accueil se déclenche lorsqu'un compte bot rejoint |
| Webhook | aucun | Publie via un webhook avec un nom et un avatar personnalisés au lieu d'en tant que bot |
| Activé | oui | Les accueils désactivés sont ignorés sans être supprimés |

Si le salon est supprimé, l'accueil est retiré la prochaine fois qu'il essaie de se déclencher. Si un webhook est supprimé ou si le bot perd la permission de publier, l'accueil est désactivé au lieu de générer une erreur à chaque arrivée.

## Variables

Les accueils sont construits avec les ensembles de variables utilisateur, serveur et bot. Les variables d'invitant ne fonctionnent que lorsque le suivi des invitations est activé sur la page Invitations.

| Variable | Valeur |
| --- | --- |
| `%user%`, `%user.mention%` | Mention du nouveau membre |
| `%user.name%`, `%username%` | Nom d'utilisateur |
| `%user.fullname%`, `%userfull%` | Tag complet |
| `%user.id%`, `%id%` | Identifiant de l'utilisateur |
| `%user.avatar%`, `%useravatar%` | URL de l'avatar |
| `%user.banner%` | URL de la bannière |
| `%user.created_date%`, `%user.created_time%` | Date de création du compte |
| `%user.joined_date%`, `%user.joined_time%` | Date d'arrivée sur ce serveur |
| `%server%`, `%server.name%` | Nom du serveur |
| `%server.id%`, `%sid%` | Identifiant du serveur |
| `%server.icon%`, `%server.banner%` | URL de l'icône et de la bannière |
| `%server.members%`, `%members%` | Nombre de membres |
| `%server.boostlevel%`, `%server.boostcount%` | Niveau de boost et nombre de boosts |
| `%server.time%`, `%server.timestamp.longdatetime%` | Heure actuelle, en clair ou sous forme d'horodatage Discord |
| `%bot.name%`, `%bot.id%`, `%bot.avatar%` | Informations sur le bot lui-même |
| `%inviter.username%`, `%inviter.mention%`, `%inviter.id%`, `%inviter.avatar%` | La personne dont l'invitation a été utilisée, ou `Unknown` |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | Le décompte d'invitations de l'invitant |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%` | L'invitation utilisée, son libellé, et s'il s'agissait d'une invitation, du lien personnalisé ou d'une application |
| `%user.joincount%`, `%user.leavecount%` | Nombre de fois où ce membre a rejoint et quitté le serveur |
| `%server.members.ordinal%` | Nombre de membres sous la forme 1er, 2e, 1 204e |
| `%user.joined.R%`, `%user.created.F%` (et les styles t, T, d, D, f) | Dates d'arrivée et de création du compte sous forme d'horodatages Discord |

> [!EXAMPLE]
> `Welcome %user.mention% to %server%! You are member #%server.members%.`

La liste complète des variables de serveur, de salon et de bot se trouve sur la page des variables. Les variables de salon ne sont pas remplies pour les accueils.

## Les commandes classiques d'accueil, d'au revoir et de boost

Elles sont antérieures aux accueils multiples et se trouvent dans le module Administration. Chacune ne contient qu'un seul message, stocké dans la configuration du serveur, et s'active ou se désactive depuis le salon où vous exécutez la commande.

| Message | Se déclenche quand | Variables |
| --- | --- | --- |
| Bye | Un membre quitte le serveur | Ensembles utilisateur, serveur et bot, plus les variables de salon. `%user%` mentionne le membre qui est parti. |
| Boost | Un membre commence à booster, ou booste à nouveau | Ensembles utilisateur, salon, serveur, bot et GIF |
| Greet DM | Un membre rejoint, envoyé en message privé | Ensembles utilisateur, salon, serveur, bot et GIF |

Exécuter `bye` ou `boost` active ou désactive ce message et définit le salon sur celui où vous avez tapé la commande. `byedel` et `boostdel` définissent un minuteur d'autosuppression en secondes ; `boostdel` est limité à 600. Les commandes de message sans texte affichent le message actuel. `leavehook` place le message d'au revoir dans un webhook avec un nom et un avatar personnalisés, et `leavehook disable` le retire.

Les MP d'accueil demandent de la prudence. Le bot vous demande de confirmer avant de les activer, sauf s'il s'agit d'un bot vérifié, car les envois massifs de MP par des bots non vérifiés peuvent faire signaler le bot. Chaque membre peut bloquer ces MP pour lui-même avec `greetdmoptout`, ou avec l'interrupteur **MP de bienvenue** sur sa propre page de profil dans le tableau de bord.

Il n'existe pas de commande classique d'accueil de salon. Utilisez un accueil multiple pour les messages de bienvenue dans les salons.

## Paramètres

Tout se trouve sur la page Accueils du tableau de bord.

| Paramètre | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Type d'accueil | Tous les accueils | Tous les accueils, Accueil aléatoire ou Désactivé |
| Ajouter un nouvel accueil | | Choisissez un salon, puis cliquez sur **Ajouter un accueil** |
| Message d'accueil | vide | L'éditeur d'embeds pour un accueil. Prend en charge le contenu, jusqu'à dix embeds et des composants. |
| Supprimer après | Jamais | Saisissez une durée comme `1m30s` ou `45s` |
| Webhook | Non configuré | Nom du webhook et URL facultative de l'avatar |
| Accueillir les bots | désactivé | Déclenche aussi pour les comptes bots |
| Activé | oui | Désactive un accueil sans le supprimer |

Les messages d'au revoir, de boost et les MP d'accueil ne se trouvent pas sur cette page. Configurez-les avec les commandes ci-dessus.

## Guide de configuration

1. Ouvrez **Accueils** dans le tableau de bord et laissez **Type d'accueil** sur **Tous les accueils**.
2. Sous **Ajouter un nouvel accueil**, choisissez le salon de bienvenue et cliquez sur **Ajouter un accueil**.
3. Sur la nouvelle carte, ouvrez **Message d'accueil** et rédigez votre message en utilisant les variables ci-dessus. Enregistrez-le.
4. Vous pouvez éventuellement définir **Supprimer après**, ajouter un nom et un avatar de **Webhook**, et activer **Accueillir les bots** si vous voulez annoncer l'arrivée des bots.
5. Répétez pour les autres salons. Passez sur **Accueil aléatoire** si vous en avez ajouté plusieurs au même salon et voulez de la variété.
6. Pour un message d'au revoir, exécutez `byemsg Goodbye %user%, we will miss you` dans le salon souhaité, puis `bye` pour l'activer.
7. Pour un message de boost, exécutez `boostmsg Thanks for boosting, %user%!` puis `boost`.
8. Testez avec `byetest` et `boosttest`. Les accueils multiples disposent d'un aperçu : exécutez `multigreetmessage 1` et cliquez sur **Aperçu**.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les commandes d'accueil multiple sont aussi disponibles sous `/multigreets add`, `/multigreets remove`, et ainsi de suite.

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `multigreetadd [#channel]` | `mgadd`, `mga` | Administrateur | Ajouter un accueil pour un salon, par défaut le salon actuel |
| `multigreetremove <number or #channel>` | `mgrem`, `mgrm`, `mgr` | Administrateur | Supprimer un accueil par numéro, ou tous les accueils d'un salon après confirmation |
| `multigreetmessage <number> [message]` | `mgmsg`, `mgm` | Administrateur | Définir le texte ou l'embed de l'accueil ; sans message, propose un aperçu ou le modèle brut |
| `multigreetdelete <number> <time or seconds>` | `mgdel`, `mgd` | Administrateur | Minuteur d'autosuppression, par exemple `1m` ou `60` ; `0` le désactive |
| `multigreetdisable <number> <true or false>` | `mgdisable`, `mgdis` | Administrateur | `true` désactive l'accueil, `false` l'active |
| `multigreetgreetbots <number> <true or false>` | `multigreetbots`, `mggb` | Administrateur | Indique si cet accueil se déclenche pour les bots |
| `multigreetwebhook <number> [name] [avatar url]` | `mgwebhook`, `mghook`, `mgh` | Administrateur | Créer un webhook pour l'accueil ; sans nom, le supprime |
| `multigreettype <multigreet, randomgreet or off>` | `mgtype`, `mgt` | Administrateur | Modifier le type d'accueil pour tout le serveur |
| `multigreetlist` | `mglist`, `mgl` | Administrateur | Parcourir tous les accueils avec leurs paramètres |
| `bye` | | Gérer le serveur | Activer ou désactiver le message d'au revoir dans ce salon |
| `byemsg [text]` | | Gérer le serveur | Afficher ou définir le message d'au revoir |
| `byedel [seconds]` | | Gérer le serveur | Minuteur d'autosuppression de l'au revoir, 30 par défaut |
| `byetest [@user]` | | Gérer le serveur | Envoyer le message d'au revoir en test |
| `leavehook [#channel] [name] [image url] [text]` | `byehook` | Gérer le serveur | Envoyer les au revoir via un webhook, ou `leavehook disable` |
| `boost` | | Gérer le serveur | Activer ou désactiver le message de boost dans ce salon |
| `boostmsg [text]` | `boostmessage` | Gérer le serveur | Afficher ou définir le message de boost |
| `boostdel [seconds]` | `boostdelete` | Gérer le serveur | Minuteur d'autosuppression du boost, de 0 à 600, 30 par défaut |
| `boosttest [@user]` | `testboost` | Gérer le serveur | Envoyer le message de boost en test |
| `greetdm` | | Gérer le serveur | Activer ou désactiver le MP d'accueil |
| `greetdmmsg [text]` | | Gérer le serveur | Afficher ou définir le texte du MP d'accueil |
| `greetdmtest [@user]` | | Gérer le serveur | Envoyer le MP d'accueil en test |
| `greetdmoptout` | `gdmoptout` | Personne | Ne plus recevoir les MP d'accueil de ce bot, où que ce soit |

## Astuces et pièges

- `multigreetdelete` nécessite que le bot ait Gérer les messages, et `multigreetwebhook` et `leavehook` nécessitent Gérer les webhooks.
- Les numéros d'accueil sont des positions dans la liste ; supprimer un accueil décale donc les numéros de tous ceux qui suivent. Exécutez `multigreetlist` avant de modifier.
- L'option `off` de `multigreettype`, `/multigreets type` et le bouton **Désactivé** du tableau de bord définissent tous le même type d'accueil ; l'un d'eux désactive donc le système sans supprimer vos accueils.
- Les variables d'invitation attendent jusqu'à cinq secondes que l'arrivée soit attribuée avant l'envoi de l'accueil, afin que l'invitant soit correct même lorsque plusieurs personnes rejoignent en même temps.
- Le MP de bienvenue ne fonctionne que si le membre autorise les MP des membres du serveur. Les MP non délivrés sont ignorés.
- Les accueils de rôles sont une fonctionnalité distincte qui se déclenche lorsqu'un rôle est donné, et non à l'arrivée.

---
title: Rôles de statut
slug: statusroles
summary: Attribuer ou retirer automatiquement des rôles lorsque le statut personnalisé Discord d'un membre contient un texte précis, et annoncer éventuellement l'événement dans un salon.
icon: fa-user-circle
category: Actions
dashboard: /dashboard/statusroles
module: StatusRoles
tags: [status roles, custom status, vanity, auto role, presence, role automation, status text, rôles de statut, statut personnalisé, vanity, rôle automatique, présence, automatisation des rôles, texte de statut]
related: [administration, afk]
---

## Ce qu'il fait

Le personnel ajoute un ou plusieurs textes à surveiller, par exemple `discord.gg/yourserver` ou `playing minecraft`. Le bot surveille les mises à jour de présence. Lorsque le statut personnalisé d'un membre commence à contenir ce texte, le bot retire les rôles listés dans **Rôles à retirer**, ajoute ceux de **Rôles à ajouter**, et, si un salon et un message sont définis, y publie une notification.

Lorsque le texte disparaît de leur statut, deux bascules déterminent la suite. **Retirer les rôles ajoutés** reprend les rôles attribués. **Restaurer les rôles retirés** rend les rôles qui avaient été retirés. Les deux sont désactivées par défaut : sans modification, le membre conserve simplement les rôles qu'il a au final.

Seul le statut personnalisé est vérifié, c'est-à-dire le texte saisi sous « Définir un statut personnalisé » dans Discord. Les activités de jeu, Spotify et de diffusion sont ignorées. Les membres hors ligne ou invisibles sont exclus, et la correspondance est une simple recherche de sous-chaîne : `mewdeko` correspond à `I love mewdeko`, mais la casse compte.

Chaque serveur peut contenir un nombre illimité d'entrées de rôles de statut, chacune avec ses propres rôles, son salon et son message. Les commandes désignent une entrée par son index, le numéro affiché par `liststatusroles`.

## Pourquoi l'utiliser

- Récompenser les membres qui mettent votre invitation personnalisée dans leur statut avec un rôle de soutien et ses avantages.
- Attribuer un rôle « en direct » ou « cherche à jouer » pendant qu'un membre en fait la promotion dans son statut, puis le retirer lorsqu'il arrête.
- Annoncer dans un salon lorsqu'un membre commence à afficher le serveur, afin que le personnel puisse le remercier.
- Échanger un rôle contre un autre pendant qu'un statut est actif, par exemple retirer un membre du rôle « sans mentions » pendant qu'il affiche un certain statut.

## Correspondance et changements de rôles

| Situation | Ce que fait le bot |
| --- | --- |
| Le statut obtient le texte surveillé | Retire les **Rôles à retirer**, ajoute les **Rôles à ajouter**, envoie la notification si elle est configurée |
| Le statut conserve le texte surveillé | Rien, le changement n'est traité qu'une seule fois |
| Le statut perd le texte surveillé, **Retirer les rôles ajoutés** activé | Retire les **Rôles à ajouter** que le membre possède encore |
| Le statut perd le texte surveillé, **Restaurer les rôles retirés** activé | Rend les **Rôles à retirer** que le membre ne possède plus |
| Le membre passe hors ligne ou invisible | Rien, les rôles restent inchangés |

Le bot compare chaque mise à jour de présence avec le dernier statut mis en cache pour cet utilisateur ; un membre qui modifie une partie sans rapport de son statut n'est donc pas traité à nouveau. Le texte surveillé doit être unique par serveur ; les commandes le limitent à 128 caractères, le tableau de bord ne le fait pas.

## Le message de notification

Si une entrée possède à la fois un **Salon de notification** et un **Message de notification**, le bot publie ce message dans ce salon à chaque fois que le statut d'un membre commence à correspondre. Le texte passe par l'analyseur d'embeds, donc tout ce que produit le créateur d'embeds fonctionne, y compris le texte brut, jusqu'à dix embeds et des composants. Rien n'est publié lorsque le statut cesse de correspondre.

### Espaces réservés

Le message est traité avec l'ensemble standard de remplacements pour le membre, le salon de notification et le serveur. Les plus utiles sont listés ci-dessous ; la liste complète se trouve sur la page des espaces réservés, sous utilisateur, serveur, salon, bot et heure.

| Espace réservé | Valeur |
| --- | --- |
| `%user.mention%` | Une mention du membre |
| `%user.name%` | Le nom d'utilisateur du membre |
| `%user.fullname%` | Nom d'utilisateur avec discriminant |
| `%user.avatar%` | L'URL de l'avatar du membre |
| `%user.id%` | L'identifiant d'utilisateur du membre |
| `%server.name%` | Nom du serveur |
| `%server.icon%` | URL de l'icône du serveur |
| `%channel.mention%` | Mention du salon de notification |
| `%server.time%` | Heure actuelle dans le fuseau horaire configuré du serveur |

> [!NOTE]
> L'éditeur du tableau de bord affiche un espace réservé `%status%`, mais le bot ne le remplace pas. Écrivez vous-même le texte du statut dans le message.

> [!EXAMPLE]
> `%user.mention% is now repping the server in their status, thank you!`

## Paramètres

Tout se trouve sur la page Rôles de statut, qui comporte trois onglets : **Rôles de statut**, **Ajouter** et **Statistiques**. Chaque entrée de la liste se déploie pour afficher ses paramètres.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Texte de statut à surveiller | aucun | Le texte que doit contenir un statut personnalisé ; pas de limite de longueur sur le tableau de bord, 128 caractères via les commandes |
| Rôles à ajouter | aucun | Identifiants de rôles séparés par des espaces, attribués lorsque le statut correspond ; Enregistrer remplace la liste entière |
| Rôles à retirer | aucun | Identifiants de rôles séparés par des espaces, retirés lorsque le statut correspond ; Enregistrer remplace la liste entière |
| Salon de notification | aucun | Salon qui reçoit le message de notification |
| Message de notification | aucun | Texte ou embed envoyé dans le salon, avec des espaces réservés |
| Retirer les rôles ajoutés | désactivé | Retire les rôles ajoutés lorsque le statut cesse de correspondre |
| Restaurer les rôles retirés | désactivé | Rend les rôles retirés lorsque le statut cesse de correspondre |

L'onglet **Statistiques** affiche le nombre total d'entrées, celles qui modifient des rôles, et celles qui disposent d'un salon de notification.

## Pas à pas de configuration

1. Ouvrez **Rôles de statut** dans le tableau de bord et allez à l'onglet **Ajouter**.
2. Saisissez le texte à surveiller et cliquez sur **Ajouter un rôle de statut**.
3. Passez à l'onglet **Rôles de statut** et déployez la nouvelle entrée.
4. Cliquez sur **Modifier les paramètres**, collez les identifiants de rôles dans **Rôles à ajouter** et **Rôles à retirer**, choisissez un **Salon de notification** et rédigez un **Message de notification** si vous le souhaitez, puis cliquez sur **Enregistrer**.
5. Utilisez les deux boutons à bascule de l'entrée pour activer **Retirer les rôles ajoutés** et, si besoin, **Restaurer les rôles retirés**.
6. Testez : définissez votre propre statut personnalisé avec le texte, vérifiez que le rôle apparaît, puis effacez-le et vérifiez que le rôle est retiré.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Chaque commande nécessite la permission Gérer le serveur. Le `<index>` est le numéro affiché par `liststatusroles`, en commençant à 1. Les versions slash se trouvent sous `/statusroles`.

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `addstatusrole <text>` | `asr` | Gérer le serveur | Ajouter un texte de statut à surveiller |
| `removestatusrole <index>` | `rsr` | Gérer le serveur | Supprimer une entrée |
| `liststatusroles` | `lsr` | Gérer le serveur | Parcourir toutes les entrées avec leur index et leurs paramètres |
| `setaddroles <index> <@role...>` | `sar` | Gérer le serveur | Ajouter des rôles à la liste attribuée lorsque le statut correspond |
| `setremoveroles <index> <@role...>` | `srr` | Gérer le serveur | Ajouter des rôles à la liste retirée lorsque le statut correspond |
| `removeaddroles <index> <@role...>` | `remar` | Gérer le serveur | Retirer des rôles de la liste « rôles à ajouter » |
| `removeremoveroles <index> <@role...>` | `rmremoveroles` | Gérer le serveur | Retirer des rôles de la liste « rôles à retirer » |
| `setstatusrolechannel <index> <#channel>` | `statusrolechannel`, `ssrc` | Gérer le serveur | Définir le salon de notification |
| `setstatusroleembed <index> [text]` | `statusroleembed`, `asre` | Gérer le serveur | Définir le message de notification, ou afficher l'aperçu du message actuel sans texte |
| `toggleremoveadded <index>` | `togglerma` | Gérer le serveur | Activer ou désactiver **Retirer les rôles ajoutés** |
| `togglereaddremoved <index>` | `togglermrm` | Gérer le serveur | Activer ou désactiver **Restaurer les rôles retirés** |

`setaddroles` et `setremoveroles` ajoutent à la liste existante au lieu de la remplacer. Utilisez les commandes `remove...` pour retirer à nouveau des rôles. L'éditeur du tableau de bord fonctionne à l'inverse : ce qui se trouve dans la zone au moment de l'enregistrement devient la liste complète, mais une zone vidée est ignorée ; vider entièrement une liste doit donc se faire avec les commandes `remove...`.

## Astuces et pièges

- Le bot a besoin de la permission Gérer les rôles, et son rôle le plus élevé doit être placé au-dessus de tous les rôles qu'il ajoute ou retire. Les échecs sont seulement consignés, et le membre ne voit rien.
- Le bot doit disposer de l'intent de présence pour voir les statuts personnalisés. Si rien ne se passe lorsque vous changez votre statut, c'est la première chose à vérifier.
- La correspondance tient compte de la casse et recherche le texte n'importe où dans le statut. Gardez le texte surveillé court et distinctif.
- Le bot ne regarde que la première activité dans la présence d'un membre. Discord place normalement le statut personnalisé en premier, mais si une autre activité est signalée avant lui, le statut n'est pas détecté.
- Les rôles ne sont modifiés que lors d'un changement de statut. Un membre qui a déjà le texte dans son statut au moment où vous créez l'entrée n'est pas traité tant que son statut ne change pas.
- La notification est envoyée à chaque fois que le statut commence à correspondre ; un membre qui active et désactive son statut à plusieurs reprises déclenchera donc des messages répétés.
- Le tableau de bord demande des identifiants de rôles, et non des noms. Activez le mode développeur dans Discord et faites un clic droit sur un rôle pour copier son identifiant.

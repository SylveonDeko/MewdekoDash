---
title: Bot Twitch
slug: twitch
summary: Faites fonctionner Mewdeko dans le chat de votre propre Twitch avec des commandes personnalisées, des minuteurs, des citations et des compteurs, et envoyez les abonnements, les raids, les récompenses de points de chaîne et les événements de mise en direct vers Discord.
icon: fa-brands fa-twitch
category: Community
dashboard: /dashboard/twitch
module: Twitch
tags: [twitch, chat bot, streamer, commands, timers, quotes, counters, channel points, redemptions, subs, raids, account link, role sync, eventsub, bot twitch, chat, streamer, commandes, minuteurs, citations, compteurs, points de chaîne, récompenses, abonnements, raids, liaison de compte, synchronisation des rôles]
related: [streams, administration]
---

## Fonctionnement

Le bot Twitch relie une chaîne Twitch à votre serveur Discord et permet à Mewdeko de faire office de bot de chat dans cette chaîne. Les spectateurs tapent `!ping`, `!quote`, `!counter deaths` ou vos propres commandes personnalisées dans le chat Twitch, et le bot y répond. Les minuteurs publient des messages répétitifs pendant que vous êtes en direct, les citations et les compteurs sont enregistrés par serveur, et les récompenses de points de chaîne peuvent déclencher une réponse dans le chat ou une publication sur Discord.

Les événements de la chaîne remontent vers Discord. Lorsque la chaîne passe en direct, une annonce de mise en direct est envoyée dans un salon Discord ; les abonnements, les abonnements offerts et les raids peuvent chacun être publiés dans leur propre salon avec votre modèle, et un bilan de fin de stream peut résumer la durée, le pic de spectateurs, les messages du chat, les abonnements et les raids.

Les spectateurs peuvent lier leur compte Twitch à leur compte Discord. Une fois le lien établi, le bot sait quel membre Discord écrit dans le chat Twitch, et la synchronisation des rôles peut attribuer des rôles Discord aux abonnés, aux VIP, aux modérateurs ou au diffuseur.

> [!NOTE]
> Ce n'est pas la même chose que les Stream Alerts. Les Stream Alerts surveillent uniquement les chaînes publiques de plusieurs plateformes et annoncent leur mise en direct. Le bot Twitch nécessite que vous autorisiez votre propre compte Twitch et donne au bot une présence dans votre chat. Si les deux sont configurés pour la même chaîne Twitch, l'annonce de mise en direct du bot Twitch remplace celle des Stream Alerts afin d'éviter les doublons.

## Pourquoi l'utiliser

- Vous streamez sur Twitch et vous voulez un seul bot pour votre Discord et votre chat Twitch, avec les mêmes commandes personnalisées et les mêmes liens réseaux aux deux endroits.
- Vous voulez que les abonnements et les raids soient célébrés sur Discord au moment où ils se produisent.
- Vous voulez attribuer des rôles d'abonné ou de VIP sur Discord sans les distribuer à la main.
- Vous voulez qu'une récompense de points de chaîne du type « hydratation » ou « étirements » dise réellement quelque chose dans le chat et soit consignée sur Discord.
- Vos modérateurs ont besoin d'une commande de shoutout, d'un sélecteur de cible de raid et d'une liste de citations qui persiste d'un stream à l'autre.

## Connexion

Deux autorisations Twitch sont nécessaires, toutes deux effectuées depuis l'onglet **Configuration**, sous-onglet **Connexion**.

| Autorisation | Qui la réalise | Ce qu'elle accorde |
| --- | --- | --- |
| Compte du bot | Propriétaire du bot uniquement | Le compte Twitch sous lequel le bot discute. Scopes `user:read:chat`, `user:write:chat`, `user:bot`. Une seule identité partagée pour tous les serveurs. |
| Chaîne du diffuseur | Vous, le streamer | Accès aux événements de votre chaîne. Scopes `channel:bot`, abonnements, bits, échanges de récompenses, sondages, prédictions, gestion des diffusions, montage de clips et modération. |

L'intégration est considérée comme configurée lorsqu'un compte de bot existe, que votre chaîne est autorisée et que la configuration est activée. Le panneau **État** affiche le transport (EventSub WebSocket ou IRC hérité), le dernier événement reçu, l'expiration des jetons pour les deux comptes et, sous **Diagnostics avancés**, les scopes manquants ainsi que les abonnements EventSub enregistrés.

Déconnecter la chaîne supprime votre autorisation et désactive l'intégration. Le compte du bot ne peut être déconnecté que par un propriétaire du bot.

## Commandes de chat sur Twitch

Chaque chaîne connectée reçoit ces commandes intégrées. Le préfixe est `!` par défaut et peut être modifié, jusqu'à cinq caractères. Les commandes personnalisées ne sont recherchées que si aucune commande intégrée ne correspond au nom.

| Commande | Qui peut l'utiliser | Ce qu'elle fait |
| --- | --- | --- |
| `!ping` | Tout le monde | Répond par un pong |
| `!uptime` | Tout le monde | Depuis combien de temps le processus du bot tourne |
| `!commands` | Tout le monde | Liste les commandes intégrées et les commandes personnalisées activées |
| `!discord` | Tout le monde | Affiche le compte Discord lié à la personne qui écrit |
| `!link` | Tout le monde | Génère un code de réclamation à six chiffres pour lier les comptes |
| `!rank` | Tout le monde | Affiche le rang résolu de la personne qui écrit |
| `!stream` | Tout le monde | Statut en direct, titre, catégorie, spectateurs et durée, ou « offline » |
| `!schedule` | Tout le monde | Publie le message de planning défini par le staff |
| `!socials` | Tout le monde | Publie le message des réseaux défini par le staff |
| `!quote [id]` | Tout le monde | Une citation au hasard, ou une citation précise par son numéro |
| `!quote add <text> [-- author]` | Modérateur | Enregistre une citation, avec éventuellement un auteur après `--` |
| `!quote remove <id>` | Modérateur | Supprime une citation (`delete` fonctionne aussi) |
| `!counter <name>` | Tout le monde | Affiche la valeur d'un compteur |
| `!counter <name> +` | Modérateur | Ajoute un (`++` ou `add` fonctionnent aussi) ; `-`, `--` ou `sub` en retire un ; `reset` le remet à 0 ; un nombre le définit directement |
| `!so <user>` | Modérateur | Fait un shoutout à une autre chaîne Twitch |
| `!raidtarget` | Modérateur | Suggère une chaîne au hasard dans la liste des cibles de raid |

### Rangs

Le rang d'un membre du chat provient de ses badges Twitch. Diffuseur est le plus élevé, puis Modérateur, VIP, Abonné (les badges de fondateur comptent comme abonnés), puis Tout le monde. Les commandes, les commandes personnalisées et la synchronisation des rôles se comparent tous à cet ordre : un modérateur peut donc exécuter tout ce qui est réservé aux VIP, aux abonnés ou à tout le monde.

## Commandes personnalisées

Les commandes personnalisées s'ajoutent sur le tableau de bord, dans **Commandes**, **Custom Commands**, ou avec `/twitch commands add`. Les noms sont mis en minuscules, peuvent faire jusqu'à 32 caractères et contenir des lettres, des chiffres, des tirets et des tirets bas. Chaque commande a une **Permission** (Everyone, Subscriber, Vip, Mod, Broadcaster), une valeur **Délai d'attente (secondes)** comprise entre 0 et 86400, un interrupteur **Activé** et une **Réponse**. Le délai de récupération est partagé par toute la chaîne, et non par utilisateur. Le nombre d'utilisations est suivi et affiché dans la liste.

Le tableau de bord propose aussi un champ **Arguments de test** et un aperçu pour voir la réponse générée avant de l'enregistrer.

### Placeholders dans les réponses

| Placeholder | Valeur |
| --- | --- |
| `%user%` | Le login Twitch de la personne qui écrit |
| `%display%` | Le nom d'affichage de la personne qui écrit |
| `%channel%` | Le login de votre chaîne Twitch |
| `%args%` | Tout ce qui est tapé après le nom de la commande |
| `%target%` | Le premier mot après le nom de la commande |
| `%discord%` | L'ID de l'utilisateur Discord lié à la personne qui écrit, ou vide |
| `%random:a\|b\|c%` | Une option choisie au hasard |
| `%count:name%` | Valeur actuelle du compteur indiqué |
| `%stream%` | Le même résumé que celui fourni par `!stream` |

> [!EXAMPLE]
> `!hug` with response `%display% hugs %target%! That is hug number %count:hugs%.`

## Minuteurs

Les minuteurs publient un message dans le chat Twitch selon un planning. Gérez-les dans **Commandes**, **Minuteurs**, ou avec `/twitch timers`.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Timer name | | Mêmes règles de nommage que pour les commandes |
| Interval minutes | 10 | De 1 à 1440 minutes entre deux publications |
| Minimum chat messages | 5 | Nombre de messages du chat qui doivent arriver depuis la dernière publication avant qu'il publie à nouveau ; 0 désactive la vérification |
| Online only | activé | Publie uniquement lorsque la chaîne est en direct |
| Random rotation | désactivé | Choisit une ligne au hasard au lieu de les parcourir dans l'ordre |
| Enabled | activé | Indique si le minuteur fonctionne |
| Messages | | Un message par ligne |

Le planificateur vérifie les minuteurs toutes les 30 secondes. Les lignes des minuteurs prennent en charge `%channel%`, `%url%`, `%stream%`, `%count:name%` et `%random:a|b|c%`. `/twitch timers test` (ou le bouton de test du tableau de bord) publie un minuteur immédiatement.

## Citations et compteurs

Les citations sont enregistrées avec leur texte, leur auteur facultatif et la personne qui les a ajoutées. Le sous-onglet **Citations** du tableau de bord permet au staff d'en ajouter, d'en rechercher et d'en supprimer ; les spectateurs utilisent `!quote`. Les compteurs sont de simples entiers nommés que les modérateurs incrémentent depuis le chat ; le staff peut définir des valeurs avec `/twitch commands counter-set` et les lister avec `counter-list`.

## Événements vers Discord

L'onglet **Événements**, sous-onglet **Alertes**, contient les paramètres des abonnements, des raids et des points de chaîne. L'annonce de mise en direct se trouve dans **Configuration**, **Paramètres du bot**, **Routage des événements**.

### Mise en direct et hors ligne

Lorsque la chaîne passe en direct, le bot publie dans le **salon Discord de mise en direct**. Sans **Message de mise en direct**, il envoie un embed par défaut : le nom du streamer lié à la chaîne, le titre comme ligne d'auteur, le statut, le nombre de spectateurs, la catégorie et une image d'aperçu. Un message personnalisé passe par le créateur d'embeds, ce qui permet d'utiliser des embeds complets et des composants. Lorsque la chaîne passe hors ligne, un court embed rouge « Offline » est publié dans le même salon.

| Placeholder | Valeur |
| --- | --- |
| `%streamer%` | Le nom d'affichage du diffuseur |
| `%title%` | Titre du stream |
| `%game%` | Nom de la catégorie |
| `%url%` | `https://twitch.tv/<channel>` |
| `%viewers%` | Nombre actuel de spectateurs |

### Abonnements et raids

Ce sont des messages en texte simple. Message d'abonnement par défaut : `%display% subscribed to %channel%!`, ou `%display% received a gifted sub on %channel%!` pour les cadeaux. Message de raid par défaut : `%raider% raided %channel% with %viewers% viewers!`.

| Événement | Placeholders |
| --- | --- |
| Abonnement | `%user%`, `%display%`, `%channel%`, `%tier%` |
| Raid | `%raider%`, `%channel%`, `%viewers%` |

Chaque alerte dispose d'un bouton **Envoyer un test** sur le tableau de bord, et la liste **Event history** affiche les événements récents ainsi que les envois de test.

### Actions liées aux points de chaîne

Sous **Actions des points de chaîne**, associez un **Titre de la récompense** (comparé sans tenir compte de la casse) à une **Réponse Twitch**, à un **Salon Discord** avec un **Message Discord**, ou aux deux. Placeholders : `%user%`, `%display%`, `%channel%`, `%reward%`, `%input%` (ce que le spectateur a tapé) et `%url%`.

### Bilan de stream

`/twitch events recap-channel` définit un salon qui reçoit un embed à la fin du stream : durée, pic de spectateurs, messages du chat, abonnements, raids, ainsi que le dernier titre et la dernière catégorie. Les bilans ne sont pas disponibles sur le tableau de bord.

## Liaison de compte et synchronisation des rôles

Il existe deux façons de lier un membre Discord à un login Twitch :

1. En autonomie : le spectateur tape `!link` dans le chat Twitch, reçoit un code à six chiffres, puis exécute `/twitch claim <code>` sur Discord dans les dix minutes.
2. Par le staff : l'onglet **Account Links** ou `/twitch links add @user twitchlogin`.

Un seul login Twitch par membre Discord et par serveur. Une fois le lien établi, `%discord%` se remplit pour ce spectateur et la synchronisation des rôles s'applique.

La synchronisation des rôles associe un rang Twitch à un rôle Discord avec `/twitch rolesync add`. Chaque fois qu'un spectateur lié envoie un message dans le chat, le bot ajoute le rôle si son rang est égal ou supérieur à celui de l'association, et le retire s'il est inférieur. La synchronisation des rôles n'est disponible que par commandes slash.

## Outils en direct

L'onglet **Événements**, sous-onglet **Outils en direct**, expose les actions d'exploitation du stream qui utilisent l'autorisation de votre chaîne : envoyer un message dans le chat en tant que bot, créer un marqueur de stream, créer un clip, lancer un sondage (un choix par ligne, 60 secondes par défaut), et exclure temporairement (600 secondes par défaut), bannir, débannir ou supprimer un message par son ID. `/twitch stream-info` et `/twitch clip` gèrent le titre, la catégorie et les clips depuis Discord.

## Paramètres

Sous **Configuration**, **Paramètres du bot** :

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Command prefix | `!` | Préfixe des commandes du chat Twitch, jusqu'à 5 caractères |
| Language override | valeur par défaut du serveur | Balise BCP-47 comme `de-DE` utilisée pour les réponses du bot dans le chat |
| Enable Twitch chat bot for this server | activé | Interrupteur général ; le désactiver conserve la configuration |
| Use EventSub for chat events | activé | Reçoit le chat et les événements via EventSub ; si désactivé, les commandes de chat ne s'exécutent pas |
| Go-live Discord channel | aucun | Où vont les annonces de mise en direct et hors ligne |
| Go-live message | embed par défaut | Modèle personnalisé avec les placeholders de mise en direct |

Sous **Événements**, **Alertes** : **Salon Discord des abonnements**, **Message d'abonnement**, **Salon Discord des raids**, **Message de raid**, et la liste des actions liées aux points de chaîne.

## Pas à pas pour la configuration

1. Ouvrez **Bot Twitch** dans le tableau de bord. Un propriétaire du bot doit d'abord avoir connecté le **Compte du bot** ; le sous-onglet **Connexion** indique si un compte existe.
2. Cliquez sur **Connecter la chaîne** et autorisez avec votre propre compte Twitch.
3. Dans **Paramètres du bot**, définissez le préfixe, activez **Activer le bot de chat Twitch pour ce serveur**, choisissez un **Salon Discord de mise en direct** et enregistrez.
4. Dans **Commandes**, ajoutez quelques commandes personnalisées et un minuteur pour les réseaux. Utilisez **Arguments de test** et l'aperçu pour vérifier les placeholders.
5. Dans **Événements**, **Alertes**, choisissez les salons pour les abonnements et les raids, puis appuyez sur **Envoyer un test** pour chacun.
6. Tapez `!ping` dans votre chat Twitch pour vérifier que le bot écoute, puis `!link` et `/twitch claim` pour vous lier vous-même.
7. Vous pouvez exécuter `/twitch rolesync add Subscriber @Subs` pour que les abonnés liés reçoivent un rôle.

## Commandes

Ce module ne fonctionne qu'avec des commandes slash. Tapez `/twitch` dans Discord pour les voir. Les réponses ne sont visibles que par vous.

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `/twitch set <channel> [prefix]` | | Gérer le serveur | Définir la chaîne Twitch et le préfixe, et activer l'intégration |
| `/twitch remove` | | Gérer le serveur | Désactiver l'intégration et quitter la chaîne |
| `/twitch enable` | | Gérer le serveur | Réactiver l'intégration |
| `/twitch disable` | | Gérer le serveur | La désactiver sans supprimer les paramètres |
| `/twitch config` | | Aucune | Afficher la chaîne, le préfixe, l'état d'activation, le salon de mise en direct et la langue |
| `/twitch claim <code>` | | Aucune | Réclamer un code de liaison obtenu avec `!link` |
| `/twitch stream-info [title] [category]` | | Gérer le serveur | Mettre à jour le titre ou la catégorie du stream |
| `/twitch clip` | | Gérer le serveur | Créer un clip du stream en cours |
| `/twitch status` | | Gérer le serveur | Résumé de l'état : comptes, jetons, état d'EventSub |
| `/twitch language <tag>` | | Gérer le serveur | Langue des réponses du chat ; vide pour réinitialiser |
| `/twitch prefix <prefix>` | | Gérer le serveur | Modifier le préfixe des commandes du chat |
| `/twitch commands add <name> <response> [permission] [cooldown]` | | Gérer le serveur | Ajouter ou mettre à jour une commande personnalisée |
| `/twitch commands remove <name>` | | Gérer le serveur | Supprimer une commande personnalisée |
| `/twitch commands list` | | Aucune | Lister les commandes personnalisées avec permission, délai et nombre d'utilisations |
| `/twitch commands counter-set <name> <value>` | | Gérer le serveur | Définir un compteur |
| `/twitch commands counter-list` | | Aucune | Lister les compteurs |
| `/twitch commands schedule-set <message>` | | Gérer le serveur | Définir la réponse de `!schedule` |
| `/twitch commands schedule-clear` | | Gérer le serveur | La effacer |
| `/twitch commands socials-set <message>` | | Gérer le serveur | Définir la réponse de `!socials` |
| `/twitch commands socials-clear` | | Gérer le serveur | La effacer |
| `/twitch timers add <name> <messages> [interval] [minchat] [onlineonly] [randomize]` | | Gérer le serveur | Ajouter ou mettre à jour un minuteur |
| `/twitch timers remove <name>` | | Gérer le serveur | Supprimer un minuteur |
| `/twitch timers list` | | Aucune | Lister les minuteurs |
| `/twitch timers enable <name>` | | Gérer le serveur | Activer un minuteur |
| `/twitch timers disable <name>` | | Gérer le serveur | Désactiver un minuteur |
| `/twitch timers test <name>` | | Gérer le serveur | Publier un minuteur maintenant |
| `/twitch events golive-channel <channel> [message]` | | Gérer le serveur | Définir le salon de mise en direct et le modèle |
| `/twitch events golive-clear` | | Gérer le serveur | Effacer le salon de mise en direct |
| `/twitch events sub-channel <channel> [message]` | | Gérer le serveur | Définir le salon des abonnements et le modèle |
| `/twitch events sub-clear` | | Gérer le serveur | Désactiver les publications d'abonnements |
| `/twitch events raid-channel <channel> [message]` | | Gérer le serveur | Définir le salon des raids et le modèle |
| `/twitch events raid-clear` | | Gérer le serveur | Désactiver les publications de raids |
| `/twitch events recap-channel <channel>` | | Gérer le serveur | Définir le salon des bilans de stream |
| `/twitch events recap-clear` | | Gérer le serveur | Désactiver les bilans |
| `/twitch links add <@user> <twitchlogin>` | | Gérer le serveur | Lier un membre à un login Twitch |
| `/twitch links remove <@user>` | | Gérer le serveur | Supprimer le lien d'un membre |
| `/twitch links list` | | Aucune | Lister tous les liens |
| `/twitch rolesync add <rank> <@role>` | | Gérer le serveur | Attribuer un rôle aux spectateurs liés d'un rang égal ou supérieur |
| `/twitch rolesync remove <rank> <@role>` | | Gérer le serveur | Supprimer une association |
| `/twitch rolesync list` | | Aucune | Lister les associations |
| `/twitch redemptions add <reward> [twitchreply] [channel] [discordmessage]` | | Gérer le serveur | Ajouter ou mettre à jour une action de points de chaîne |
| `/twitch redemptions remove <reward>` | | Gérer le serveur | Supprimer une action |
| `/twitch redemptions list` | | Aucune | Lister les actions |
| `/twitch raidtargets add <twitchlogin> [note]` | | Gérer le serveur | Ajouter une chaîne au pool de `!raidtarget` |
| `/twitch raidtargets remove <twitchlogin>` | | Gérer le serveur | Supprimer une chaîne |
| `/twitch raidtargets list` | | Aucune | Lister les cibles de raid |

## Astuces et pièges

- Le compte du bot est partagé par tous les serveurs qui utilisent le bot. Si personne n'en a connecté un, les réponses du chat ne peuvent pas être envoyées, quelle que soit la configuration.
- Les commandes du chat ne fonctionnent que si **Utiliser EventSub pour les événements de chat** est activé. Si le panneau Health affiche Legacy IRC, réactivez-le.
- L'état en direct est aussi interrogé une fois par minute ; une annonce de mise en direct peut donc accuser jusqu'à une minute de retard par rapport au début réel.
- Les délais de récupération des commandes personnalisées sont par chaîne, et non par spectateur. Un délai de 30 secondes signifie une utilisation toutes les 30 secondes pour tout le monde.
- La synchronisation des rôles s'exécute lorsqu'un spectateur lié écrit dans le chat, et non selon un planning. Un abonné qui n'écrit jamais dans le chat n'obtient jamais le rôle, et un abonné dont l'abonnement a expiré le conserve jusqu'à ce qu'il écrive à nouveau.
- Les changements de rôles nécessitent que le rôle du bot soit au-dessus du rôle synchronisé et que le bot ait la permission Gérer les rôles.
- Les rangs inconnus transmis à `rolesync` reviennent à Subscriber, et les permissions inconnues transmises à `commands add` reviennent à Everyone.
- Les codes de liaison expirent après dix minutes, et en générer un nouveau invalide l'ancien.
- Les exclusions temporaires et les bannissements effectués depuis les Outils en direct utilisent les scopes de modération de votre chaîne ; ils apparaissent donc dans Twitch comme des actions effectuées par le compte autorisé.
- La langue définie dans Language override ne modifie que les réponses du chat Twitch. Les réponses sur Discord conservent la langue du serveur.

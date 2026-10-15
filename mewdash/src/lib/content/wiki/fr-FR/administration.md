---
title: Administration
slug: administration
summary: Protection automatique contre les raids, le spam, les comptes alternatifs, les arnaques et les pots de miel, rôles attribués à l'arrivée ou choisis par les membres, remplacements des permissions Discord pour les commandes, et les opérations de masse à utiliser en cas de mauvaise journée.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Administration
tags: [admin, anti-raid, anti-spam, anti-alt, anti-pattern, anti-mass-mention, anti-mass-post, honeypot, anti-image-hash, scam images, external apps, user apps, reaction roles, self-assignable roles, auto-assign roles, auto-ban roles, voice channel roles, permission overrides, dpo, mass ban, prune, server recovery, staff role, timezone, cooldowns, administration, protection, rôles automatiques, rôles par réaction, permissions, bannissement de masse, purge, récupération du serveur, fuseau horaire, délais]
related: [moderation, permissions, logging, multigreets, settings, auditlog, rolestates]
---

## Ce que ça fait

Administration est le module qui garde un serveur en ordre lorsqu'aucun modérateur ne surveille. Ses systèmes de protection surveillent les arrivées et les messages, et sanctionnent automatiquement lorsque quelque chose ressemble à un raid, une rafale de spam, un compte alternatif jetable, une mention de masse, un lien d'arnaque collé dans chaque salon, une publication dans un salon piège ou une image d'arnaque connue. Chaque système est indépendant, possède sa propre sanction et peut être activé ou désactivé séparément.

Le même module gère l'automatisation des rôles : rôles donnés à l'arrivée, rôles que les membres s'attribuent eux-mêmes avec `iam`, rôles par réaction, rôles liés à la présence dans un salon vocal, et rôles pièges qui bannissent quiconque les reçoit. Il permet aussi de modifier la permission Discord requise par une commande, de définir les rôles de staff et de membre sur lesquels d'autres fonctionnalités s'appuient, de limiter le débit des commandes et de nettoyer les messages de commande.

Pour les mauvais jours, il existe des opérations de masse : bannir ou expulser tous ceux qui ont rejoint dans les dernières minutes, bannir selon un motif de nom, un rôle ou un avatar, purger les membres inactifs, et un flux de récupération du serveur qui rend un rôle administrateur à un propriétaire vérifié.

Tout se trouve sur la page **Administration** du tableau de bord, répartie en cinq onglets : **Vue d'ensemble**, **Systèmes de protection**, **Rôles et permissions**, **Automatisation et paramètres** et **Opérations avancées**. Presque chaque paramètre possède aussi une commande.

## Pourquoi l'utiliser

- Les raids d'arrivées et les vagues de bots frappent à 3 h du matin, et vous voulez qu'ils soient traités avant que quiconque se réveille.
- Un compte compromis colle le même lien d'hameçonnage dans dix salons.
- Les membres doivent pouvoir choisir eux-mêmes leur couleur, leur région ou leurs rôles de notification sans l'aide du staff.
- Vous voulez que `ban` fonctionne pour les personnes disposant de Gérer les messages au lieu de Bannir des membres, sans toucher aux paramètres de rôles de Discord.
- Une commande est spammée dans le salon général et a besoin d'un délai d'attente.
- Un administrateur malveillant a retiré les rôles du propriétaire, et vous avez besoin d'un moyen de reprendre la main.

## Sanctions

Chaque système de protection applique une **sanction**. Certaines sanctions acceptent aussi une **durée** ou un **rôle**.

| Action | Ce qui se passe |
| --- | --- |
| Mute | Applique le rôle muet du serveur (texte et vocal) |
| ChatMute | Rôle muet pour le texte uniquement |
| VoiceMute | Met le membre en sourdine côté serveur dans les salons vocaux |
| Kick | Expulse le membre ; il peut revenir |
| Softban | Bannit puis débannit immédiatement pour supprimer les messages récents |
| Ban | Bannit, ou bannit temporairement si vous indiquez une durée |
| Timeout | Délai d'attente natif de Discord ; nécessite une durée, 28 jours maximum |
| AddRole | Ajoute le rôle choisi, par exemple un rôle de quarantaine |
| RemoveRoles | Retire tous les rôles |
| Warn | Ajoute un avertissement via le module Modération |
| Delete | Supprime le message fautif et rien d'autre |
| None | Enregistre le déclenchement sans aucune action |

Seules les sanctions Ban, Mute, ChatMute, VoiceMute, AddRole et Timeout acceptent une durée ; pour les autres, la durée est ignorée. Les durées sont exprimées en minutes. Le tableau de bord permet jusqu'à 10080 (une semaine) pour Anti-Raid, Anti-Spam, Anti-Mention-Massive et Anti-Motif, 1440 (un jour) pour Anti-Publication-Massive, Anti-Salon-Piège et Anti-Hash-Image, et une année pour Anti-Alt. Les sanctions sont appliquées une par seconde depuis une file d'attente, et la raison dans le journal d'audit de Discord ressemble à « Raiding Protection » ou « ImageHash Protection ».

> [!WARNING]
> Anti-Raid, Anti-Alt et Anti-Pattern s'exécutent à l'arrivée d'un membre, et ils ignorent entièrement la vérification lorsque la sanction est Warn. Choisissez Kick, Ban, Timeout ou un rôle pour ces trois systèmes.

Les membres disposant de la permission Administrateur sont exemptés de toutes les protections basées sur les messages. Les bots sont ignorés par les protections basées sur l'arrivée et par Anti-Spam ; les autres systèmes disposent d'un interrupteur **Ignorer les bots**.

## Systèmes de protection

L'onglet **Systèmes de protection** affiche une carte par système, avec un bouton **Activé** ou **Désactivé** et, une fois activé, un bouton **Configurer** qui ouvre ses paramètres. Activer depuis le tableau de bord applique une configuration de départ ; ouvrez **Configurer** et vérifiez la sanction avant de vous y fier. L'onglet **Vue d'ensemble** indique combien des sept systèmes sont actifs et les liste un par un.

### Anti-Raid

Compte les membres qui rejoignent dans une fenêtre glissante. Lorsque le nombre atteint le **seuil d'utilisateurs** dans la **fenêtre** (en secondes), tous les membres comptés dans cette rafale sont sanctionnés ensemble. La commande accepte un seuil de 2 à 30 et une fenêtre de 2 à 300 secondes ; le tableau de bord accepte de 1 à 50 et de 1 à 300. AddRole n'est pas pris en charge ici. Les bots qui rejoignent ne sont pas comptés.

> [!EXAMPLE]
> `antiraid 10 10 Ban` bannit tout le monde lorsque dix comptes rejoignent en dix secondes. `antiraid 10 10 Timeout 1h` leur applique plutôt un délai d'attente d'une heure.

### Anti-Spam

Compte les messages identiques consécutifs d'un même membre, sans tenir compte de la casse. Lorsque le compte atteint le **seuil de messages** (de 2 à 10 avec la commande, de 1 à 20 sur le tableau de bord), le membre est sanctionné et le compte repart de zéro. Un message différent remet le compte à zéro ; chaque message compté sort du décompte au bout de trente minutes. Les salons de la liste des **salons ignorés** sont exclus, ce qui convient aux salons de commandes des bots. Utilisez `antispam <count> <action> <role>` avec AddRole pour attribuer un rôle à la place.

### Anti-Alt

Vérifie l'âge de chaque compte qui rejoint. Les comptes plus jeunes que l'**âge minimum** (en minutes ; `antialt 3d Kick` fonctionne aussi) sont sanctionnés sur-le-champ. Il ne s'exécute qu'à l'arrivée, donc l'activer ne analyse pas les membres déjà présents. La valeur de départ du tableau de bord est de 1440 minutes, soit un jour.

### Anti-Mention-Massive

Compte les mentions d'utilisateurs et de rôles. Un message unique contenant au moins le **seuil de mentions** est sanctionné immédiatement. En dessous, les mentions sont additionnées par membre sur la **fenêtre temporelle** (en secondes), et dépasser le **nombre maximal de mentions dans la fenêtre** déclenche la sanction. **Ignorer les bots** détermine si les messages des bots sont comptés.

### Anti-Motif

Attribue un score à chaque nouveau membre selon les signes d'un compte jetable ou d'un bot, et sanctionne lorsque le score atteint le **score minimum**. Il s'exécute au moment de l'arrivée et examine le compte, pas les messages.

| Signal | Points | Paramètre |
| --- | --- | --- |
| Compte créé dans l'âge maximal | 5 | **Vérifier l'âge du compte**, **Âge maximal du compte (mois)** |
| Arrivée peu après la création du compte | 10 si moins d'une heure, 7 si moins de six heures, sinon 3 | **Vérifier le délai d'arrivée**, **Heures maximales d'arrivée** |
| D'autres membres ont été créés dans la même heure | 1 par compte, jusqu'à 10 | **Vérifier la création par lot** |
| Compte affiché hors ligne pendant l'arrivée | 2 | **Vérifier le statut hors ligne** |
| Compte plus jeune que le seuil des nouveaux comptes | 3 | **Vérifier les nouveaux comptes**, **Jours pour un nouveau compte** |
| Nom d'utilisateur correspondant à l'un de vos motifs regex | 15 | Motif avec **vérifier le nom d'utilisateur** |
| Pseudo correspondant à l'un de vos motifs | 12 | Motif avec **vérifier le pseudo** |

Une correspondance de motif sanctionne dès que le score cumulé atteint au moins le minimum ; les autres signaux seuls peuvent aussi l'atteindre. Les motifs sont des expressions régulières, comparées sans tenir compte de la casse au nom en minuscules. Les valeurs de départ du tableau de bord sont : score minimum 15, six mois, 48 heures, sept jours, toutes les vérifications activées. Sur le tableau de bord, le bouton **Motifs** de la carte ouvre la liste des motifs, où chaque motif possède un nom, l'expression regex et les deux cases de vérification du nom.

Avec les commandes, `patternadd <regex> [name] [checkUsername] [checkDisplayName]` en ajoute un, et `patternconfig <setting> <value>` modifie `accountage`, `maxaccountage`, `jointiming`, `maxjoinhours`, `batchcreation`, `offlinestatus`, `newaccounts`, `newaccountdays` ou `minimumscore`. `patternconfig` seul affiche les valeurs actuelles et le nombre de fois où le système s'est déclenché.

### Anti-Publication-Massive

Détecte un membre qui publie le même contenu, ou un contenu similaire, dans plusieurs salons en peu de temps : le schéma classique du « collage du lien d'arnaque partout », que Anti-Spam manque parce que les messages sont répartis.

Pour chaque membre, le bot conserve les cinquante derniers messages dans la **fenêtre temporelle** (de 10 à 600 secondes). Un message est comparé aux précédents et compte comme similaire lorsqu'il est identique à 80 % au moins selon la distance d'édition, sans tenir compte de la casse. Lorsque des messages similaires existent dans au moins le **seuil de salons** (de 2 à 20) salons distincts, le membre est sanctionné. Les messages de moins de vingt caractères sont ignorés.

**Vérifier uniquement les liens** est activé par défaut : seuls les messages contenant un lien sont suivis. Les utilisateurs, rôles et salons ignorés sont respectés. Par défaut, le message déclencheur est supprimé et le membre reçoit un MP expliquant la raison.

### Anti-Salon-Piège

Met en place des **salons pièges** (honeypot). Marquez un ou plusieurs salons dans lesquels de vrais membres n'ont aucune raison de publier, généralement cachés en bas de la liste des salons avec un nom d'avertissement. Tout ce qui y est publié est traité comme un bot ou un compte compromis : le message est supprimé, l'auteur reçoit un MP, et la sanction est appliquée. Les administrateurs sont exemptés, et vous pouvez ajouter des **rôles ignorés** et des **utilisateurs ignorés** (par identifiant).

Le bot maintient aussi un **message de statut** à jour dans un salon de statut : le salon où vous avez exécuté `antipostchannel` ou, lorsqu'il est activé depuis le tableau de bord, le premier salon piège qui attrape quelqu'un. Le message affiche la sanction, le nombre de salons pièges, le total des captures et les dix derniers membres attrapés.

### Anti-Hash-Image

Bloque des images précises selon leur apparence, de sorte qu'un nouveau téléversement redimensionné, recompressé, éclairci, miroité ou encadré correspond toujours. Chaque image bloquée est enregistrée sous forme de hachage perceptuel, accompagné de son image miroir et, lorsqu'elle possède une bordure unie, d'une copie sans bordure. Les pièces jointes publiées (et les embeds, si **vérifier les embeds** est activé) sont hachées de la même manière et comparées.

- **Tolérance de correspondance** (de 0 à 64, 31 par défaut) indique à quel point une image publiée peut différer tout en comptant comme correspondante. Baissez-la si une image innocente est attrapée ; augmentez-la seulement si des arnaques passent entre les mailles.
- **Capturer les copies encadrées** retire une bordure unie d'une image publiée avant la comparaison. Les copies miroir sont toujours capturées.
- Les images trop unies pour être identifiées de manière fiable ne sont jamais comparées, ni acceptées comme blocage, car elles correspondraient à des images sans rapport.
- Les images de plus de 8 Mo ne sont ni téléchargées ni hachées. La limite peut être définie entre 1 et 32 Mo via l'API, mais ni la carte du tableau de bord ni une commande ne l'exposent.
- Chaque image bloquée peut avoir sa propre sanction, sa durée et son rôle, qui remplacent la valeur par défaut du système. **Supprimer uniquement** retire l'image sans sanctionner l'auteur.
- Les rôles et salons ignorés sont exclus ; l'auteur reçoit un MP par défaut.

**Bloquer les images d'arnaque connues** active une liste prédéfinie fournie avec le bot, qui contient actuellement les fausses images de casino crypto et de giveaway MrBeast qui circulent sur Discord. La carte indique combien d'images figurent sur la liste et combien de publications elle a interceptées sur votre serveur.

Pour bloquer votre propre image depuis le tableau de bord, déposez ou téléversez le fichier, ou collez son URL, donnez-lui un libellé, choisissez éventuellement une sanction propre à cette image, puis enregistrez. Avec les commandes, exécutez `blockimage [action] [name]` en joignant l'image, en répondant à un message qui la contient, ou en collant le lien. `blockedimages` affiche tout avec le nombre de déclenchements, `unblockimage <id>` en retire une, et `imagehash` affiche le hachage d'une image sans la bloquer.

> [!TIP]
> Activez d'abord Anti-Salon-Piège et la liste des images d'arnaque connues. Aucun de ces deux systèmes ne produit de faux positifs dans une discussion normale, et ensemble ils attrapent la plupart des activités d'arnaque automatisées.

### Anti-Application-Externe

Les membres peuvent ajouter des applications à leur propre compte Discord et les utiliser dans n'importe quel serveur, même un serveur auquel l'application n'a jamais été ajoutée. Les messages de ces applications sont publiés sous le nom de l'application, si bien que les autres protections, qui regardent qui a envoyé le message, ne voient jamais le membre derrière. Anti-Application-Externe lit quel membre a utilisé l'application et agit contre lui.

Un message compte comme infraction lorsqu'il :

- mentionne au moins la **limite de mentions** d'utilisateurs et de rôles (5 par défaut), ou mentionne everyone ou here,
- contient un lien d'invitation Discord, alors que **supprimer les liens d'invitation** est activé,
- ou provient d'un membre qui a utilisé des applications plus de **messages d'application autorisés** fois dans la fenêtre (5 par défaut en 10 secondes).

Fixer une limite à 0 désactive cette vérification. Lorsqu'un message enfreint une règle, il est supprimé, et le membre qui a utilisé l'application reçoit la sanction, un délai d'attente d'une heure par défaut. **Supprimer uniquement** retire le message sans sanctionner personne. Les applications ajoutées au serveur lui-même sont épargnées, de même que les administrateurs du serveur.

> [!TIP]
> La permission Discord **Utiliser des applications externes** est un bon complément. Les membres qui ne l'ont pas peuvent toujours utiliser leurs applications, mais seuls eux voient les réponses. Refusez-la pour `@everyone` et autorisez-la pour un rôle de confiance ou un rôle de niveau, et les nouveaux comptes ou comptes jetables ne pourront plus publier via des applications du tout.

## Rôles

Ces cartes se trouvent dans l'onglet **Rôles et permissions**.

### Rôles automatiques à l'arrivée

Rôles donnés à chaque membre dès son arrivée, avec une liste séparée pour les bots. Les membres qui passent encore le filtrage d'adhésion reçoivent leurs rôles une fois approuvés. Si les États de rôles sont configurés pour ignorer l'attribution automatique aux membres ayant un état de rôle enregistré, les membres de retour conservent leurs anciens rôles à la place. `autoassignrole <role>` active ou désactive un rôle dans la liste ; exécutez-la seule pour voir la liste.

### Rôles que l'on s'attribue soi-même

Rôles que les membres peuvent s'attribuer avec `iam <role>` et retirer avec `iamnot <role>`. Les rôles sont répartis en **groupes** numérotés (le groupe 0 est « Sans groupe »), et les groupes peuvent recevoir un nom. Le **mode exclusif** est un paramètre global au serveur : lorsqu'il est activé, prendre un rôle d'un groupe retire tout autre rôle que vous détenez dans ce groupe, ce qui est idéal pour les couleurs ou les régions. Un rôle peut exiger un **niveau** d'XP minimum. **Supprimer les messages iam** efface la commande et la réponse après trois secondes pour garder le salon propre.

### Rôles par réaction

Associez des émojis à des rôles sur un message existant. Les membres cliquent sur l'émoji pour obtenir le rôle, et le retirent pour le perdre. Chaque message peut être marqué **Exclusif** afin qu'un membre ne puisse détenir qu'un seul rôle de ce message. Discord autorise vingt réactions par message, et le tableau de bord les compte pour vous. Ajouter des rôles à un message qui en possède déjà étend la configuration existante.

Avec les commandes, `reactionroles [messageId] [excl] <role> <emoji> ...` configure les paires ; omettez l'identifiant du message pour utiliser le message situé juste au-dessus de votre commande. `reactionroleslist` affiche toutes les configurations avec un index, et `reactionrolesremove <index>` en supprime une.

### Rôles de salon vocal

Associez un rôle à un salon vocal. Les membres reçoivent le rôle lorsqu'ils rejoignent le salon et le perdent lorsqu'ils le quittent. Utilisez-le pour n'ouvrir un salon textuel qu'aux personnes actuellement en appel.

### Rôles de bannissement automatique

Tout rôle de cette liste est un piège : dès qu'un membre le reçoit, il est banni. La raison par défaut est « Auto-ban role assigned », sauf si vous en définissez une avec `autobanrolereason`. Combinez-le avec un rôle par réaction sur un message caché pour attraper les bots qui s'auto-attribuent des rôles. Le nombre de jours de messages supprimés suit le paramètre de purge lors du bannissement du module Modération.

## Remplacements de permissions et permissions des commandes

Les **remplacements de permissions** remplacent la permission Discord qu'une commande vérifie normalement. Ajoutez un remplacement pour `ban` exigeant Gérer les messages, et toute personne disposant de Gérer les messages peut l'utiliser ; ajoutez-en un exigeant Administrateur, et seuls les administrateurs le pourront. Lorsque plusieurs permissions sont listées, l'utilisateur doit toutes les avoir. Avec les commandes, `dpo <command> <permission> [permission...]` en définit un, `dpo <command>` sans permission le retire, `dpol` les liste et `dpor` efface tout après confirmation. Les noms de déclencheurs de chat personnalisés sont acceptés aussi.

La carte **Gestion des permissions** du même onglet est le système de permissions de commandes basé sur des règles : autoriser ou refuser une commande, un module ou tout pour un utilisateur, un rôle, un salon, une catégorie ou l'ensemble du serveur, évalués de haut en bas. Il possède son propre article, voir `permissions`.

## Paramètres du serveur

Ces cartes se trouvent dans l'onglet **Automatisation et paramètres**.

| Paramètre | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| **Rôle de staff** | aucun | Le rôle que les autres fonctionnalités considèrent comme staff |
| **Rôle de membre** | aucun | Le rôle considéré comme « membre » ; `prunemembers` peut inclure les personnes qui le possèdent |
| **Fuseau horaire du serveur** | UTC | Fuseau horaire utilisé partout où le bot affiche des heures locales |
| **Délais des commandes** | aucun | Limite de débit par commande en secondes, de 1 à 90 000 |
| **Remplacements de permissions** | aucun | Permission Discord requise par chaque commande (voir plus haut) |
| **Salon vocal de jeu** | aucun | Lorsqu'un membre de ce salon vocal commence à jouer à un jeu, le bot le déplace vers le salon vocal dont le nom correspond au jeu |
| **Supprimer le message de commande** | désactivé | Supprime le message qui a déclenché une commande après son exécution, avec des remplacements par salon Activer, Désactiver ou Hériter |
| **Désactivation des statistiques** | participation | Arrête les statistiques d'utilisation des commandes pour ce serveur ; **Supprimer les statistiques** efface ce qui est enregistré |

## Opérations avancées

L'onglet **Opérations avancées** contient trois cartes. Chaque opération de masse demande une confirmation, puis s'exécute sans autre vérification.

### Message de bannissement personnalisé

Le message qu'un membre reçoit par MP lorsqu'il est banni, construit dans l'éditeur d'embeds. C'est le même modèle que celui qu'utilise la commande de bannissement du module Modération.

### Récupération du serveur

Un moyen de rendre un rôle Administrateur au propriétaire après qu'un administrateur compromis l'a retiré. Deux secrets sont enregistrés pour le serveur : une **clé de récupération** et une **clé d'authentification à deux facteurs**.

- Exécuter `/serverrecovery server-recover` en tant que propriétaire du serveur lorsque rien n'est configuré génère les deux : une clé de récupération qui vous est envoyée par MP, et un secret d'authentification affiché sous forme de code QR. Confirmez avec un code de votre application d'authentification pour terminer.
- Une fois configuré, toute personne qui exécute `/serverrecovery server-recover`, saisit la clé de récupération puis un code d'authentification valide, reçoit un nouveau rôle nommé « Recovered Server Owner Role » avec la permission Administrateur, placé juste sous le rôle le plus élevé du bot.
- `/serverrecovery clear-server-recover` supprime les clés enregistrées après confirmation, de même que **Supprimer la configuration de récupération** sur le tableau de bord.

La carte du tableau de bord peut aussi enregistrer les clés directement : générez ou saisissez une clé de récupération d'au moins seize caractères, ainsi qu'une clé à deux facteurs. Le bot vérifie les codes avec cette clé à deux facteurs comme secret d'authentification (TOTP), donc saisissez un secret en base32 que vous avez ajouté à une application d'authentification, et non un mot de passe ordinaire.

> [!PERMISSION]
> Le bot lui-même doit disposer de la permission Administrateur pour que la récupération fonctionne, et son rôle le plus élevé doit être assez haut pour qu'un rôle juste en dessous dépasse encore les personnes que vous récupérez.

### Opérations de masse

| Opération | Ce qu'elle fait |
| --- | --- |
| **Purger les utilisateurs inactifs** | Purge de membres de Discord pour les membres inactifs depuis le nombre de jours indiqué (1 à 30) |
| **Bannir des utilisateurs en masse** | Bannit une liste d'identifiants d'utilisateurs collée, avec une seule raison ; la suppression des messages suit le paramètre de purge lors du bannissement du module Modération |
| **Renommer des utilisateurs en masse** | Définit le pseudo de chaque membre selon un modèle où `{username}` est remplacé par son nom d'utilisateur, par exemple `[AFK] {username}` ; les membres que le bot ne peut pas renommer sont ignorés |
| **Purger jusqu'au message** | Supprime, un par un, chaque message posté après un identifiant de message donné dans un salon |

Les commandes ajoutent des moyens de choisir qui sera banni : `banunder 10m` bannit tous ceux qui ont rejoint dans les dix dernières minutes (`-p` affiche d'abord un aperçu de la liste, `-accage 1d` exige en plus que le compte ait moins d'un jour), `kickunder` fait de même avec une expulsion, `nameban <regex>` bannit les noms d'utilisateur correspondant à un motif après un aperçu, `baninrole <role>` bannit tous ceux qui possèdent un rôle, et `banbyhash <avatarHash>` bannit tous les membres utilisant un avatar donné. Toutes ces commandes vous demandent une confirmation.

## Guide de configuration

1. Ouvrez **Administration** dans le tableau de bord et allez dans **Systèmes de protection**.
2. Activez **Anti-raid**, cliquez sur **Configurer**, et définissez un seuil et une fenêtre adaptés à votre rythme normal d'arrivées. Choisissez Kick ou Ban comme action.
3. Créez un salon caché que seuls des bots publieraient, activez **Anti-Salon-Piège**, et ajoutez-le sous **Salons pièges**.
4. Activez **Anti-Hash-Image** et cliquez sur **Bloquer les images d'arnaque connues**.
5. Activez **Anti-Publication-Massive** avec les trois salons par défaut en soixante secondes et les liens uniquement.
6. Dans **Rôles et permissions**, ajoutez votre rôle de membre à **Rôles automatiques** pour les utilisateurs normaux, configurez un groupe de couleurs avec **Ajouter un rôle que l'on s'attribue soi-même**, puis activez **Mode exclusif**.
7. Dans **Automatisation et paramètres**, définissez le **Rôle de staff**, le **Rôle de membre** et le **Fuseau horaire du serveur**.
8. Dans **Opérations avancées**, configurez la **Récupération du serveur** lorsque tout est calme.
9. Consultez **Vue d'ensemble** : elle liste chaque système de protection et indique s'il est actif.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les commandes de protection exécutées sans argument désactivent ce système.

### Protection

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `antiraid [threshold] [seconds] [action] [duration]` | | Administrateur | Configurer ou désactiver Anti-Raid |
| `antispam [count] [action] [duration or role]` | | Administrateur | Configurer ou désactiver Anti-Spam |
| `antialt [minAge] [action] [duration or role]` | | Administrateur | Configurer ou désactiver Anti-Alt |
| `antimassmention [threshold] [window] [max] [ignoreBots] [action] [duration or role]` | `amm`, `massmention`, `stopmassmention` | Administrateur | Configurer ou désactiver Anti-Mention-Massive |
| `antipattern [action] [duration or role]` | `apattern` | Administrateur | Configurer ou désactiver Anti-Motif |
| `patternadd <regex> [name] [checkUsername] [checkDisplayName]` | `padd` | Administrateur | Ajouter un motif de nom |
| `patternremove <id>` | `premove`, `prem` | Administrateur | Supprimer un motif par ID |
| `patternlist` | `plist` | Administrateur | Lister les motifs |
| `patternconfig [setting] [value]` | `pconfig` | Administrateur | Afficher ou modifier les paramètres de score d'Anti-Motif |
| `antimasspost [channels] [seconds] [action] [duration]` | | Administrateur | Configurer ou désactiver Anti-Publication-Massive |
| `antipostchannel [action] [duration]` | | Administrateur | Configurer ou désactiver les salons pièges ; le salon actuel devient le salon de statut |
| `antipostchanneladd <#channel>` | | Administrateur | Ajouter un salon piège |
| `antipostchannelremove <#channel>` | | Administrateur | Retirer un salon piège |
| `antiimagehash [action] [tolerance] [duration]` | `aih` | Administrateur | Configurer ou désactiver Anti-Hash-Image |
| `antiexternalapp [action] [mentions] [messages] [duration]` | `aea`, `antiuserapp` | Administrateur | Configurer ou désactiver Anti-Application-Externe |
| `blockimage [action] [name]` | `banimage` | Administrateur | Bloquer l'image jointe, à laquelle on répond ou qui est liée |
| `unblockimage <id>` | `unbanimage` | Administrateur | Retirer une image bloquée |
| `blockedimages` | `blockedimagelist` | Administrateur | Lister les images bloquées avec le nombre de déclenchements |
| `imagehash [url]` | | Administrateur | Afficher le hachage d'une image |
| `antiimagehashpreset` | `aihpreset`, `blockcommonscams` | Administrateur | Activer ou désactiver la liste des images d'arnaque connues |
| `antiimagehashignore <role or #channel>` | `aihignore` | Administrateur | Activer ou désactiver une exemption pour un rôle ou un salon |

### Rôles

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `autoassignrole [role]` | `aar` | Gérer les rôles | Activer ou désactiver un rôle à l'arrivée, ou les lister |
| `autoassignbotrole [role]` | `aabr` | Gérer les rôles | Identique, pour les bots |
| `asar [group] <role>` | | Gérer les rôles | Rendre un rôle auto-attribuable, éventuellement dans un groupe |
| `rsar <role>` | | Gérer les rôles | Retirer un rôle auto-attribuable |
| `lsar` | | Personne | Lister les rôles auto-attribuables par groupe |
| `sargn <group> [name]` | | Gérer les rôles | Nommer un groupe, ou effacer son nom |
| `togglexclsar` | `tesar` | Gérer les rôles | Activer ou désactiver le mode exclusif |
| `rolelevelreq <level> <role>` | `rlr` | Gérer les rôles | Exiger un niveau d'XP pour un rôle |
| `adsarm` | | Gérer les messages | Activer ou désactiver la suppression des messages `iam` |
| `iam <role>` | | Personne | Vous attribuer un rôle auto-attribuable |
| `iamnot <role>` | `iamn` | Personne | En retirer un |
| `reactionroles [messageId] [excl] <role> <emoji>...` | `rero` | Gérer les rôles | Configurer les rôles par réaction sur un message |
| `reactionroleslist` | `reroli` | Gérer les rôles | Lister les configurations de rôles par réaction |
| `reactionrolesremove <index>` | `rerorm` | Gérer les rôles | Supprimer une configuration par index |
| `vcrole [voiceChannel] [role]` | | Gérer les rôles | Lier un rôle à un salon vocal (le vôtre s'il est omis) ; sans rôle, supprime la liaison |
| `vcrolerm <channelId>` | | Gérer les rôles | Supprimer une liaison par ID de salon |
| `vcrolelist` | | Personne | Lister les rôles de salon vocal |
| `autobanroleadd <role>` | `abra` | Administrateur | Ajouter un rôle piège |
| `autobanroleremove <role>` | `abrr` | Administrateur | En retirer un |
| `autobanrolelist` | `abrl` | Administrateur | Lister les rôles pièges et leurs raisons |
| `autobanrolereason <role> [reason]` | `abreason` | Administrateur | Afficher, définir ou effacer la raison du bannissement |
| `setrole <role> <user> [time]` | `sr`, `giverole` | Gérer les rôles | Donner un rôle, éventuellement pour une durée limitée |
| `removerole <role> <user>` | `rr` | Gérer les rôles | Retirer un rôle |
| `removeallroles <user>` | `rar` | Gérer les rôles | Retirer tous les rôles |
| `createrole [name]` | `cr` | Gérer les rôles | Créer un rôle |
| `deleterole <role>` | `dr` | Gérer les rôles | Supprimer un rôle |
| `renamerole <role> <name>` | `renr` | Gérer les rôles | Renommer un rôle |
| `rolehoist <role>` | `rh` | Gérer les rôles | Activer ou désactiver l'affichage séparé du rôle |
| `rolecolor <role> [color]` | `roleclr` | Personne pour consulter, Gérer les rôles pour modifier | Afficher ou définir la couleur d'un rôle |

Les commandes `autobanrole` sont aussi disponibles sous forme de commandes slash `/autobanrole list`, `add`, `remove` et `reason`.

### Permissions et paramètres

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `dpo <command> [permission...]` | | Administrateur | Définir ou retirer un remplacement de permission |
| `dpol` | `dpoli` | Administrateur | Lister les remplacements |
| `dpor` | | Administrateur | Effacer tous les remplacements |
| `staffrole [role]` | | Administrateur | Afficher ou définir le rôle de staff |
| `staffroledisable` | | Administrateur | Effacer le rôle de staff |
| `memberrole <role>` | | Administrateur | Afficher ou définir le rôle de membre |
| `delmsgoncmd [list, server, or channel <enable, disable, inherit> [#channel]]` | `dmc` | Administrateur | Afficher, activer ou remplacer la suppression des messages de commande |
| `gamevoicechannel` | `gvc` | Administrateur | Activer ou désactiver votre salon vocal actuel comme salon vocal de jeu |
| `timezone [id]` | | Personne pour consulter, Administrateur pour modifier | Afficher ou définir le fuseau horaire du serveur |
| `timezones` | | Personne | Lister les identifiants de fuseaux horaires disponibles |
| `prefix [new]` | | Personne pour consulter, Administrateur pour modifier | Afficher ou modifier le préfixe des commandes |
| `languageset <name>` | `langset` | Administrateur | Définir la langue du serveur, ou `default` |
| `langsetdefault [name]` | `langsetd` | Personne pour consulter, propriétaire du bot pour modifier | Afficher ou définir la langue par défaut du bot |
| `languageslist` | `langli` | Personne | Lister les langues prises en charge |
| `guildstatsoptout` | `gstatsoptout` | Administrateur | Activer ou désactiver les statistiques de commandes pour ce serveur |
| `deleteguildstatsdata` | `delguildstatsdata` | Administrateur | Supprimer les statistiques enregistrées, une fois par heure |

### Opérations de masse et utilitaires

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `banunder <time> [-p or -accage <time>]` | | Administrateur | Bannir tous ceux qui ont rejoint dans ce délai |
| `kickunder <time> [-p]` | | Administrateur | Expulser tous ceux qui ont rejoint dans ce délai |
| `nameban <regex>` | `nban` | Administrateur | Bannir les membres dont le nom d'utilisateur correspond, avec aperçu |
| `baninrole <role> [reason]` | | Administrateur | Bannir tous ceux qui possèdent un rôle |
| `banbyhash <avatarHash>` | `bbh` | Administrateur | Bannir tous ceux qui ont un hachage d'avatar donné |
| `prunemembers <time> [yes]` | `memberprune` | Administrateur | Purger les membres inactifs depuis ce nombre de jours ; `yes` inclut le rôle de membre |
| `setnick [user] <nickname>` | | Gérer les pseudos | Modifier le pseudo d'un membre, ou celui du bot |
| `deafen <users...>` | `deaf` | Rendre les membres sourds | Rendre sourds côté serveur |
| `undeafen <users...>` | `undef` | Rendre les membres sourds | Annuler |
| `creatxtchanl <name>` | `ctch` | Gérer les salons | Créer un salon textuel |
| `deltxtchanl <#channel>` | `dtch` | Gérer les salons | Supprimer un salon textuel |
| `creatvoichanl <name>` | `cvch` | Gérer les salons | Créer un salon vocal |
| `delvoichanl <channel>` | `dvch` | Gérer les salons | Supprimer un salon vocal |
| `settopic [topic]` | `st` | Gérer les salons | Définir le sujet du salon actuel |
| `setchanlname <name>` | `schn` | Gérer les salons | Renommer le salon actuel |
| `renamechannel <channel> <name>` | `channelrename` | Gérer les salons | Renommer n'importe quel salon |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Gérer les salons | Activer ou désactiver le marqueur NSFW du salon actuel |
| `edit [#channel] <messageId> <text>` | | Gérer les messages dans ce salon | Modifier l'un des messages du bot |
| `delete [#channel] <messageId> [time]` | `del` | Gérer les messages dans ce salon | Supprimer un message maintenant ou après un délai allant jusqu'à sept jours |
| `setguildavatar [url]` | `sgav`, `setgav` | Gérer le serveur | Définir l'icône du serveur depuis une URL ou une pièce jointe |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Gérer le serveur | Définir la bannière du serveur |
| `setguildbio <text>` | `sgbio`, `setgbio` | Gérer le serveur | Définir la description du serveur |

La récupération du serveur est uniquement disponible en commande slash : `/serverrecovery server-recover` et `/serverrecovery clear-server-recover`. La plupart des autres commandes ci-dessus ont aussi des équivalents slash sous `/protection`, `/administration`, `/channel`, `/purge-members`, `/delmsgoncmd`, `/voice`, `/perm-override` et `/roles`.

### Commandes de journalisation et d'accueil

Le module contient aussi les commandes de journalisation (`log`, `logcategory`, `logevents`, `logignore`, `logignorelist`, `commandlogchannel`, toutes réservées aux administrateurs, ainsi que le groupe slash `/log`) et les commandes d'accueil classiques (`greetdm`, `greetdmmsg`, `greetdmtest`, `bye`, `byemsg`, `byedel`, `byetest`, `leavehook`, `boost`, `boostmsg`, `boostdel`, `boosttest`, toutes réservées à Gérer le serveur). Elles sont documentées dans les articles `logging` et `multigreets`.

## Astuces et pièges

- Le rôle du bot doit être placé au-dessus de tout rôle qu'il attribue, retire ou dont il bannit les membres, et il a besoin de Bannir des membres, Expulser des membres, Gérer les rôles ou Modérer des membres pour appliquer les sanctions que vous choisissez. Les sanctions de mute nécessitent un rôle muet, que le bot crée lors de la première utilisation.
- Les commandes n'acceptent qu'une durée d'un jour (`1d`) au maximum pour Anti-Raid et Anti-Spam, et Timeout ne peut jamais dépasser 28 jours.
- Anti-Spam ne compte que les répétitions identiques. Un membre qui envoie dix messages différents rapidement n'est pas du spam pour lui ; c'est ce que couvrent Anti-Publication-Massive et Anti-Mention-Massive.
- Anti-Publication-Massive avec **Vérifier uniquement les liens** activé ignore tout ce qui ne contient pas de lien. Désactivez-le pour détecter les copypastas, au prix de davantage de faux positifs sur les serveurs animés.
- La vérification de création par lot d'Anti-Motif récupère toute la liste des membres à chaque arrivée, ce qui est lent sur les très grands serveurs.
- Une image bloquée ajoutée à partir d'un hachage plutôt que de l'image elle-même ne détecte que les copies exactes ; ajoutez-la de nouveau à partir de l'image pour couvrir les versions miroir et encadrées.
- Activer une protection depuis le tableau de bord applique des valeurs de départ. Ouvrez **Configurer** et vérifiez la sanction, surtout avant de choisir Ban.
- Les commandes de rôles automatiques, d'auto-attribution et de rôles par réaction refusent les rôles égaux ou supérieurs à votre propre rôle le plus élevé, sauf si vous êtes le propriétaire.
- Les rôles par réaction sont perdus si le message est supprimé ; `reactionroleslist` indique quelles configurations pointent vers un message supprimé.
- Le renommage de masse touche chaque membre que le bot peut renommer, y compris le staff placé sous son rôle. Prévoyez un plan pour les renommer à nouveau.
- `delete` et `edit` ne fonctionnent que sur les messages que le bot peut voir, et `edit` uniquement sur les messages du bot.

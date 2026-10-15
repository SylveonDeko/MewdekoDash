---
title: Modération
slug: moderation
summary: Avertir, rendre muet, exclure temporairement, expulser et bannir des membres, appliquer automatiquement des sanctions à mesure que les avertissements s'accumulent, et contrôler le nombre de jours de messages supprimés lors d'un bannissement.
icon: fa-flag
category: Security
dashboard: /dashboard/moderation
module: Moderation
tags: [moderation, warn, warnings, warn punish, punishment ladder, mute, mute role, timeout, ban, softban, kick, ban purge, ban prune, purge, prune, dehoist, warnlog, modération, avertissement, avertissements, échelle de sanctions, sourdine, rôle sourdine, exclusion temporaire, bannissement, expulsion, purge bannissement, purge, nettoyage, journal avertissements]
related: [administration, filter, logging, auditlog]
---

## Ce que cela fait

La modération est la boîte à outils que le personnel utilise sur les membres individuels. Les avertissements en sont le cœur : un modérateur exécute `warn @user reason`, le membre reçoit un MP avec la raison et le nom de la personne qui l'a averti, l'avertissement est enregistré et, si le serveur dispose d'un salon de journal des avertissements, un embed y est publié avec le nombre d'avertissements et la sanction éventuellement déclenchée.

Les avertissements s'accumulent. Vous pouvez construire une échelle de sanctions afin qu'atteindre un nombre donné d'avertissements actifs déclenche automatiquement une action : un mute, une exclusion temporaire, une expulsion, un bannissement ou l'attribution d'un rôle. Le personnel n'a pas à se souvenir des règles ; le bot les applique dès que le seuil est atteint. Les avertissements peuvent être pardonnés plus tard, ou expirer automatiquement après un nombre de jours défini.

À côté, on trouve les actions directes : mute (avec un rôle de sourdine géré), exclusion temporaire, expulsion, bannissement léger (softban), bannissement, bannissement temporaire, expulsion en masse, suppression de messages et nettoyage des pseudos des membres qui se placent eux-mêmes en tête de liste avec des caractères spéciaux. Chaque action de bannissement dispose aussi d'une purge configurable, c'est-à-dire le nombre de jours de messages du membre que Discord supprime avec le bannissement.

La page du tableau de bord couvre les avertissements, l'échelle de sanctions, le salon de journal des avertissements et les paramètres de purge des bannissements. Les actions directes comme mute, expulsion et bannissement ne sont accessibles que par commandes.

## Pourquoi l'utiliser

- Vous voulez une politique cohérente du type « trois avertissements » qui s'applique de la même façon, quel que soit le modérateur de service.
- Des membres doivent être réduits au silence rapidement sans modifier les permissions des salons à la main.
- Un spammeur a rejoint le serveur et vous voulez supprimer ses messages de la dernière journée avec le bannissement, mais un bannissement temporaire pour un membre habituel ne doit pas effacer son historique.
- Le personnel a besoin d'un registre consultable indiquant qui a été averti, par qui et pour quelle raison, qui survit au renouvellement des modérateurs.
- Des pseudos comme « !!! xXx » remontent sans cesse en haut de la liste des membres et vous voulez les nettoyer en une seule fois.

## Avertissements

`warn <user> [reason]` nécessite la permission Bannir des membres. Le bot tente d'abord d'envoyer au membre un embed en MP avec le nom du serveur, le modérateur et la raison. Si l'envoi du MP échoue, la confirmation dans le salon le mentionne dans le pied de page. L'avertissement est ensuite enregistré avec le nom du modérateur et la raison, ou `-` si aucune raison n'a été donnée.

Le membre doit être placé sous le modérateur dans la hiérarchie des rôles, et sous le bot. Sinon, la commande est refusée.

`warnlog <user>` affiche une liste paginée, neuf par page, avec la date, le modérateur et la raison. Les avertissements pardonnés apparaissent barrés, avec le nom de la personne qui les a levés. `warnlogall` liste chaque membre ayant des avertissements sous la forme `active (total - forgiven)`.

`warnclear <user> [index]` marque des avertissements comme pardonnés. Sans index, ou avec `0`, il pardonne tous les avertissements. Avec un index, il ne pardonne que celui correspondant, numéroté comme dans `warnlog`. Les avertissements pardonnés restent dans le journal mais ne comptent plus pour les sanctions. Le tableau de bord permet aussi de supprimer définitivement un avertissement.

### Expiration des avertissements

`warnexpire <days> <clear|delete>` définit la durée pendant laquelle un avertissement compte. Le nombre de jours peut aller de 0 à 366 ; 0 désactive l'expiration. L'action détermine ce qui se passe lorsqu'un avertissement arrive à échéance :

| Action | Ce qui se passe |
| --- | --- |
| Clear | L'avertissement est marqué comme pardonné et reste dans le journal |
| Delete | L'avertissement est supprimé de la base de données |

L'expiration est vérifiée toutes les douze heures, et une fois immédiatement lorsque vous la définissez.

### Le salon de journal des avertissements

Définissez-le avec `setwarnchannel #channel` ou avec le sélecteur **Salon de journal des avertissements** de l'onglet Sanctions du tableau de bord. Chaque avertissement publie un embed dans ce salon avec le nom et l'identifiant du membre, son numéro d'avertissement actuel, la sanction déclenchée (ou « None »), la raison et un lien direct vers le message qui a émis l'avertissement.

## Sanctions liées aux avertissements

L'échelle est une liste de règles du type « à N avertissements actifs, faire X ». Lorsqu'un avertissement est émis, le bot compte les avertissements actifs du membre, y compris le nouveau, et recherche une règle correspondant exactement à ce nombre. Seule une correspondance exacte déclenche la sanction : un membre ayant une règle à 3 qui atteint 4 sans règle à 4 ne reçoit donc rien de plus.

Définissez une règle avec `warnpunish <number> <punishment> [time]`, ou `warnpunish <number> addrole <role> [time]` pour la variante avec rôle. `warnpunish <number>` seul supprime la règle. `warnpunishlist` affiche l'échelle.

| Sanction | Avec durée ? | Ce qu'elle fait |
| --- | --- | --- |
| Mute | Facultative | Applique le rôle de sourdine, ou un mute temporaire si une durée est donnée |
| ChatMute | Facultative | Rôle de sourdine uniquement, sans mute vocal |
| VoiceMute | Facultative | Mute vocal serveur uniquement |
| Timeout | Obligatoire, jusqu'à 28 jours | Exclusion temporaire Discord |
| Kick | Non | Expulse le membre |
| Softban | Non | Bannit puis débannit immédiatement pour supprimer des messages |
| Ban | Facultative | Bannissement permanent, ou temporaire si une durée est donnée |
| AddRole | Facultative | Ajoute le rôle choisi, retiré après la durée si elle est définie |
| RemoveRoles | Non | Retire les rôles du membre |

Les durées sont stockées en minutes et peuvent aller jusqu'à 49 jours. Softban, Kick et RemoveRoles refusent une durée. Timeout refuse d'être enregistré sans durée. Les sanctions sont appliquées avec la raison « Warned too many times. »

Sur le tableau de bord, la même échelle se trouve dans l'onglet **Sanctions** : choisissez **À l'avertissement n° **, une **Sanction**, une **Durée (minutes)** facultative et un **Rôle à ajouter** pour la sanction de rôle, puis cliquez sur **Ajouter à l'échelle**. Enregistrer une règle pour un nombre qui en a déjà une la remplace.

> [!EXAMPLE]
> `warnpunish 2 mute 1h`, `warnpunish 3 timeout 1d`, `warnpunish 5 ban`. Deux avertissements donnent un mute d'une heure, trois une exclusion d'un jour, cinq un bannissement.

## Mini-avertissements

Il existe une deuxième piste d'avertissements indépendante, appelée mini-avertissements, destinée aux infractions mineures traitées par le personnel junior. `mwarn` nécessite uniquement la permission Rendre les membres muets au lieu de Bannir des membres. Elle dispose de son propre journal (`mwarnlog`, `mwarnlogall`), de sa propre commande de suppression, de sa propre expiration, de sa propre échelle de sanctions (`mwarnpunish`) et de son propre salon de journal (`setmwarnchannel`). Les mini-avertissements ne comptent jamais dans l'échelle principale, et inversement. Le tableau de bord n'affiche pas les mini-avertissements.

## Mutes et rôle de sourdine

Le bot gère un rôle de sourdine. Par défaut, il s'appelle `Mewdeko-mute` ; modifiez-le avec `muterole @role`, ou exécutez `muterole` seul pour voir le rôle actuel. La première fois qu'un mute est nécessaire, le bot crée le rôle s'il n'existe pas, puis parcourt chaque salon textuel et ajoute une surcharge refusant Envoyer des messages, Ajouter des réactions, Joindre des fichiers, Envoyer des messages dans les fils et Créer des fils publics. Les fils sont ignorés. Cela peut prendre un moment dans les serveurs comportant beaucoup de salons.

| Commande | Effet |
| --- | --- |
| `mute` | Mute complet : ajoute le rôle de sourdine |
| `chatmute` | Ajoute uniquement le rôle de sourdine |
| `voicemute` | Met le membre en sourdine vocale serveur uniquement |
| `stfu` | Refuse Envoyer des messages à ce membre dans le salon actuel uniquement, via une surcharge de permission |

Chacune possède une forme temporaire. Les mutes complets vont d'une minute à 90 jours ; les mutes textuels et vocaux d'une minute à 49 jours. `stfu` avec une durée retire la surcharge à la fin du délai. Les membres réduits au silence reçoivent un MP lors de la mise en sourdine et de la levée.

`removeonmute y` fait en sorte qu'un mute complet retire aussi les autres rôles du membre et les mémorise, et `unmute` les lui rend. `removeonmute n` désactive cette option. `unmuteall` retire le rôle de sourdine à tous ceux qui le possèdent, après une demande de confirmation, avec une raison facultative.

## Exclusions temporaires

`timeout <time> <user> [reason]` utilise l'exclusion temporaire native de Discord, jusqu'à 28 jours. Vous et le bot devez disposer de la permission Modérer les membres. `untimeout <user>` la lève. La raison est inscrite dans le journal d'audit sous la forme `moderator | reason`.

## Bannissements, expulsions et bannissements légers

`ban <user> [reason]` envoie d'abord un MP au membre, puis le bannit. `ban <time> <user> [reason]` est un bannissement temporaire qui se lève automatiquement, jusqu'à 49 jours. `ban <pruneTime> <time> <user>` définit explicitement la fenêtre de purge et la durée du bannissement. Le bannissement par identifiant fonctionne pour les personnes qui ne sont pas sur le serveur. `unban <user or id>` l'annule.

`softban <user> [reason]` bannit puis débannit immédiatement, ce qui équivaut à une expulsion qui supprime aussi les messages récents. `kick <user> [reason]` expulse, et `masskick @a @b @c` expulse plusieurs personnes à la fois et indique combien ont réussi. `masskill` est réservé au propriétaire du bot et bannit en masse une liste d'identifiants collée.

### Le MP de bannissement

Le message envoyé à un membre banni peut être personnalisé avec `banmessage <text or embed code>`. Le texte passe par l'analyseur d'embeds, donc tout ce qui vient du créateur d'embeds fonctionne. Définissez-le sur `-` pour n'envoyer aucun MP, et utilisez `banmsgreset` pour revenir au modèle par défaut. `banmsgtest [duration] [reason]` vous envoie le modèle actuel afin que vous puissiez le voir.

| Espace réservé | Valeur |
| --- | --- |
| `%ban.mod%` | Le nom complet du modérateur |
| `%ban.mod.name%` | Le nom d'utilisateur du modérateur |
| `%ban.user%` | Le nom complet du membre banni |
| `%ban.user.name%` | Le nom d'utilisateur du membre banni |
| `%ban.reason%` ou `%reason%` | La raison, ou `-` s'il n'y en a pas |
| `%ban.duration%` | La durée au format `d.hh:mm`, ou `perma` |

Les espaces réservés du serveur, comme `%server.name%`, fonctionnent aussi ici.

## Purge lors d'un bannissement

Chaque bannissement comporte une purge : le nombre de jours de messages du membre que Discord supprime avec lui, de 0 à 7. Plutôt qu'un seul nombre global, chaque type de bannissement possède sa propre valeur par défaut, et vous pouvez remplacer n'importe laquelle d'entre elles pour l'ensemble du serveur, pour une catégorie ou pour un salon unique.

| Action | Clé | Valeur par défaut intégrée |
| --- | --- | --- |
| Ban | `ban` | 7 jours |
| Ban by ID | `hackban` | 7 jours |
| Temporary ban | `tempban` | aucune |
| Softban | `softban` | 7 jours |
| Mass ban | `massban` | 7 jours |
| Ban by avatar hash | `banbyhash` | aucune |
| Ban in role | `baninrole` | aucune |
| Ban under age | `banunder` | aucune |
| Warn punishment | `warnpunish` | aucune |
| Auto-ban role | `autobanrole` | aucune |
| Role monitor | `rolemonitor` | aucune |
| Filter | `filter` | aucune |
| Lockdown | `lockdown` | aucune |
| Dashboard | `dashboard` | aucune |

Lors d'un bannissement, le bot cherche le paramètre le plus spécifique : le salon dans lequel la commande a été exécutée, puis la catégorie de ce salon, puis la valeur par défaut du serveur. Au sein de chaque niveau, un paramètre pour l'action exacte l'emporte sur celui défini pour « toutes les actions ». Si rien ne correspond, la valeur par défaut intégrée s'applique.

`banprune` affiche ce qu'un bannissement depuis le salon actuel purgerait, ainsi que tous les paramètres configurés. `banpruneset <action|all> <days> [#channel or category]` en définit un, `banpruneclear <action|all> [#channel or category]` en supprime un, et `banprunereset` les efface tous.

L'onglet **Purge des bannissements** du tableau de bord liste chaque action sous **Server Defaults**, avec une case de jours pour chacune, une ligne de repli **Toutes les actions**, et une section **Exceptions** où vous choisissez un **Portée** (Channel ou Category), la cible, une **Action** et la **Purge (jours)**.

## Purger des messages

`purge [count] [flags]` supprime jusqu'à 1000 messages dans le salon actuel. Sans nombre, elle supprime les 100 derniers messages du bot lui-même. `purge @user [count]` ne supprime que les messages de ce membre des deux dernières semaines. Les options peuvent être combinées : `-s` ignore les messages épinglés, `-nb` ignore les bots, `-ob` ne retient que les bots, `-he` ne retient que les messages contenant des embeds, `-ne` ceux qui n'en contiennent pas, `-c text` seulement les messages contenant le texte, `-b date` les messages avant une date et `-a date` ceux après une date.

`purgeuser <user> <count>` recherche dans les `count` derniers messages (de 1 à 1000) de chaque salon textuel et supprime les messages de cet utilisateur dans chacun d'eux.

## Pseudos

`dehoist <user>` et `sanitize <user>` réécrivent le pseudo d'un membre pour retirer les caractères spéciaux en début de pseudo ou les caractères inhabituels. `dehoistall [nicksOnly]` et `sanitizeall` le font pour tout le monde, après confirmation, en tâche de fond ; `massnickprogress` indique où en est le traitement et `massnickstop` l'annule. Les commandes pour un seul membre nécessitent que le bot dispose de la permission Gérer les pseudos ; les variantes « all » nécessitent la permission Administrateur. Dans les deux cas, le rôle du bot doit être au-dessus des membres concernés.

## Paramètres

La page du tableau de bord comporte cinq onglets : **Vue d'ensemble** (nombre d'avertissements), **Avertissements**, **Sanctions**, **Activité récente** et **Purge des bannissements**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Warning Log Channel | aucun | Salon qui reçoit un embed pour chaque avertissement |
| Punishment ladder | vide | Ce qui se déclenche à chaque nombre d'avertissements |
| Warning expiry | désactivé | Jours avant qu'un avertissement soit pardonné ou supprimé, commandes uniquement |
| Mute role | `Mewdeko-mute` | Le rôle appliqué par les commandes de mute, commandes uniquement |
| Remove roles on mute | désactivé | Retire puis restaure les rôles autour d'un mute complet, commandes uniquement |
| Ban DM template | embed par défaut | Le MP reçu par un membre banni, commandes uniquement |
| Ban purge defaults | selon l'action | Jours de messages supprimés pour chaque type de bannissement |
| Ban purge overrides | aucun | Purge par salon ou par catégorie |

Dans l'onglet **Avertissements**, le personnel peut avertir un membre par identifiant utilisateur avec une raison obligatoire, rechercher par identifiant, raison ou modérateur, masquer les avertissements pardonnés, pardonner un avertissement, pardonner tous ceux d'un membre, ou en supprimer un définitivement.

> [!WARNING]
> Supprimer un avertissement depuis le tableau de bord le retire définitivement, et il ne compte plus. Pardonner conserve l'enregistrement et l'empêche aussi de compter. Pardonnez, sauf si vous avez une bonne raison d'effacer l'historique.

## Guide de configuration

1. Ouvrez **Modération** dans le tableau de bord et allez dans **Sanctions**.
2. Choisissez un **Salon de journal des avertissements** que seul le personnel peut lire.
3. Ajoutez des règles à l'échelle. Un début progressif consiste à mettre un Mute de 60 minutes à 2 avertissements, une exclusion de 1440 minutes à 3, et un Ban à 5.
4. Exécutez `muterole @Muted` si vous avez déjà un rôle de sourdine, sinon laissez le bot créer `Mewdeko-mute` lors de la première utilisation.
5. Décidez de l'expiration avec `warnexpire 90 clear` pour que les anciens avertissements cessent de compter après trois mois.
6. Dans **Purge des bannissements**, réglez **Temporary ban** sur 0 si vous ne voulez pas que les bannissements temporaires suppriment l'historique, et ajoutez des surcharges par salon si un salon de spam du bot doit purger davantage.
7. Testez avec un compte secondaire : `warn @alt test`, vérifiez le salon de journal, puis `warnclear @alt`.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Objectif |
| --- | --- | --- | --- |
| `warn <user> [reason]` | | Bannir des membres | Avertir un membre et appliquer toute sanction de l'échelle |
| `warnlog <user or id>` | | Bannir des membres | Afficher les avertissements d'un membre |
| `warnlogall` | | Bannir des membres | Afficher le nombre d'avertissements de chacun |
| `warnclear <user> [index]` | `warnc` | Bannir des membres | Pardonner tous les avertissements, ou un seul par numéro |
| `warnexpire <days> <clear|delete>` | `warne` | Administrateur | Effacer ou supprimer automatiquement les avertissements après un nombre de jours |
| `warnpunish <number> <punishment> [time]` | `warnp` | Bannir des membres | Définir une règle de l'échelle, ou la supprimer avec seulement un nombre |
| `warnpunishlist` | `warnpl` | Personne | Afficher l'échelle de sanctions |
| `setwarnchannel <#channel>` | `warnchannel` | Administrateur | Définir le salon de journal des avertissements |
| `mwarn <user> [reason]` | `miniwarn` | Rendre les membres muets | Émettre un mini-avertissement |
| `mwarnlog [page] [user or id]` | | Rendre les membres muets, ou Personne pour le vôtre | Afficher les mini-avertissements |
| `mwarnlogall` | `mwarnlogs` | Rendre les membres muets | Nombre de mini-avertissements pour chacun |
| `mwarnclear <user or id> [index]` | `mwarnc` | Administrateur | Pardonner des mini-avertissements |
| `mwarnexpire <days> [clear|delete]` | `mwarne` | Administrateur | Expiration des mini-avertissements |
| `mwarnpunish <number> <punishment> [time]` | `mwarnp` | Administrateur | Définir ou supprimer une règle de l'échelle des mini-avertissements |
| `mwarnpunishlist` | `mwarnplist`, `mwarnpl` | Personne | Afficher l'échelle des mini-avertissements |
| `setmwarnchannel <#channel>` | `mwarnchannel` | Administrateur | Définir le salon de journal des mini-avertissements |
| `timeout <time> <user> [reason]` | | Modérer les membres | Exclure temporairement un membre, jusqu'à 28 jours |
| `untimeout <user>` | | Modérer les membres | Retirer une exclusion temporaire |
| `mute <user> [time] [reason]` | | Gérer les rôles ou Rendre les membres muets | Mute complet, avec durée facultative |
| `unmute <user> [reason]` | | Gérer les rôles ou Rendre les membres muets | Retirer un mute complet |
| `chatmute [time] <user> [reason]` | | Gérer les rôles | Rôle de sourdine uniquement |
| `chatunmute <user> [reason]` | | Gérer les rôles | Retirer un mute textuel |
| `voicemute [time] <user> [reason]` | | Rendre les membres muets | Mute vocal uniquement |
| `voiceunmute <user> [reason]` | | Rendre les membres muets | Retirer un mute vocal |
| `stfu [time] <user>` | `cmute`, `channelmute` | Rendre les membres muets | Interdire l'envoi dans le salon actuel uniquement |
| `unstfu <user>` | `unchannelmute` | Rendre les membres muets | Annuler `stfu` |
| `muterole [role]` | `setmuterole` | Gérer les rôles | Afficher ou définir le rôle de sourdine |
| `removeonmute <y|n>` | | Administrateur | Retirer et restaurer les rôles autour des mutes complets |
| `unmuteall [reason]` | `umall` | Administrateur | Retirer la sourdine à tous ceux qui ont le rôle |
| `kick <user or id> [reason]` | `k` | Expulser des membres | Expulser un membre |
| `masskick <users...>` | `mkick` | Expulser des membres | Expulser plusieurs membres |
| `ban [time] <user or id> [reason]` | `b` | Bannir des membres | Bannir, ou bannissement temporaire jusqu'à 49 jours |
| `unban <user or id>` | | Bannir des membres | Lever un bannissement |
| `softban <user or id> [reason]` | `sb` | Expulser des membres et Gérer les messages | Bannir puis débannir pour supprimer des messages |
| `banmessage [text]` | `banmsg`, `bantemplate`, `bantemp` | Bannir des membres | Afficher ou définir le MP de bannissement, `-` pour le désactiver |
| `banmsgreset` | | Bannir des membres | Restaurer le MP de bannissement par défaut |
| `banmsgtest [time] [reason]` | | Bannir des membres | Vous envoyer en MP le modèle de bannissement |
| `masskill <ids and reasons>` | | Propriétaire du bot | Bannir en masse une liste collée |
| `banprune` | `banpurge` | Bannir des membres | Afficher les paramètres de purge effectifs et configurés |
| `banpruneset <action|all> <days> [channel]` | `banpurgeset` | Administrateur | Définir un paramètre de purge |
| `banpruneclear <action|all> [channel]` | `banpurgeclear` | Administrateur | Supprimer un paramètre de purge |
| `banprunereset` | `banpurgereset` | Administrateur | Supprimer tous les paramètres de purge |
| `purge [count or user] [count] [flags]` | `clear`, `prune` | Gérer les messages | Supprimer en masse des messages dans ce salon |
| `purgeuser <user> <count>` | `pruneuser` | Gérer les messages | Supprimer les messages d'un utilisateur dans tous les salons |
| `dehoist <user>` | | Gérer les pseudos | Corriger un pseudo en tête de liste |
| `dehoistall [nicksOnly]` | `dehoista` | Gérer les pseudos | Corriger tous les pseudos en tête de liste |
| `sanitize <user>` | | Gérer les pseudos | Normaliser un pseudo |
| `sanitizeall` | `sanitizea` | Gérer les pseudos | Normaliser tous les pseudos |
| `massnickprogress` | `mnickprogress`, `mnp` | Administrateur | Progression d'un dehoist ou sanitize en cours |
| `massnickstop` | `mnstop`, `mns` | Administrateur | Arrêter un dehoist ou sanitize en cours |

## Astuces et pièges

- Le rôle du bot doit être au-dessus de tous ceux qu'il met en sourdine, expulse ou bannit, et au-dessus du rôle de sourdine lui-même. La plupart des erreurs « cannot apply punishment » sont des problèmes de hiérarchie.
- Le bot a besoin des permissions Bannir des membres, Expulser des membres, Modérer les membres, Gérer les rôles et Gérer les messages pour les commandes correspondantes ; chaque commande vérifie la permission du bot avant de s'exécuter.
- L'échelle ne se déclenche que sur un nombre exact. Remplissez chaque étape qui vous importe plutôt que de supposer « 3 ou plus ».
- Seuls les avertissements émis par le bot comptent. Les exclusions et bannissements natifs de Discord n'ajoutent pas d'avertissements.
- Le rôle de sourdine refuse les permissions salon par salon. Les salons créés après l'existence du rôle reçoivent la surcharge à la prochaine mise en sourdine de quelqu'un, et non immédiatement.
- Discord ne permet la suppression en masse que sur 14 jours. Les messages plus anciens sont ignorés par les commandes de purge.
- La purge lors d'un bannissement est limitée à 7 jours par Discord, quelle que soit votre configuration.
- Les avertissements émis depuis le tableau de bord nécessitent une raison valide et utilisent le nom de votre compte du tableau de bord comme nom de modérateur.

---
title: Journalisation
slug: logging
summary: Envoyez un historique des arrivées, départs, modifications, suppressions, bannissements, changements de rôles et de salons, et plus encore, vers les salons de logs de votre choix, avec un routage par événement et des exclusions de salons.
icon: fa-file
category: Security
dashboard: /dashboard/logging
module: Administration
tags: [logging, logs, audit, events, message deleted, message edited, join leave, mod log, ignored channels, journalisation, journaux, audit, événements, message supprimé, message modifié, arrivée départ, journal de modération, salons ignorés]
related: [moderation, administration, filter]
---

## Ce que ça fait

La journalisation surveille les événements que Discord envoie au bot et publie un résumé de chacun dans un salon textuel que vous choisissez. Un message supprimé indique qui l'a écrit et ce qu'il contenait. L'arrivée d'un membre indique l'âge de son compte. Un changement de rôle indique les rôles ajoutés ou retirés. Lorsque le bot peut lire le journal d'audit, il indique aussi le membre du staff à l'origine de l'action.

Chaque type d'événement a son propre paramètre de salon : vous pouvez envoyer les modifications de messages dans un salon, les actions de modération dans un autre, et laisser le reste désactivé. Rien n'est journalisé tant que vous n'avez pas attribué un salon, et un type d'événement sans salon est simplement ignoré.

Les salons peuvent aussi être exclus. Un salon ignoré ne produit aucun log de message, de fil ou de vocal, ce qui garde les salons du staff et les salons de commandes des bots hors de l'historique.

## Pourquoi l'utiliser

- Conserver une copie des messages supprimés et modifiés afin que les modérateurs puissent voir ce qui a été retiré après coup.
- Suivre qui est arrivé et parti, y compris les dates de création des comptes, pour repérer les raids et les comptes alternatifs.
- Enregistrer les bannissements, les débannissements et les mises en sourdine avec le modérateur responsable, pour garantir la transparence.
- Surveiller les changements de rôles, de salons et de permissions effectués par d'autres administrateurs ou par des comptes compromis.
- Suivre l'activité vocale dans les serveurs où les salons vocaux sont le principal lieu de rencontre.

## Types d'événements de journal

Chaque type peut pointer vers un salon différent ou être désactivé. Voici les valeurs acceptées par `log` et affichées sur le tableau de bord.

| Type | Libellé du tableau de bord | Journalisé lorsque |
| --- | --- | --- |
| `MessageUpdated` | Message Updated | Le contenu d'un message est modifié (les messages de bots et les contenus inchangés sont ignorés) |
| `MessageDeleted` | Message Deleted | Un message est supprimé |
| `MessagesBulkDeleted` | Messages Bulk Deleted | Plusieurs messages sont purgés en une fois, avec le nombre de messages présents dans le cache |
| `ReactionEvents` | Reaction Events | Des réactions sont ajoutées ou retirées, regroupées par message toutes les cinq secondes |
| `ThreadCreated` | Thread Created | Un fil est créé |
| `ThreadDeleted` | Thread Deleted | Un fil est supprimé |
| `ThreadUpdated` | Thread Updated | Le nom, l'état d'archivage ou un élément similaire d'un fil change |
| `UsernameUpdated` | Username Updated | Le nom d'utilisateur global d'un membre change |
| `NicknameUpdated` | Nickname Updated | Le surnom d'un membre sur le serveur change |
| `UserUpdated` | User Updated | Le profil d'un membre, comme l'avatar ou le nom global, change |
| `UserJoined` | User Joined | Un membre rejoint le serveur |
| `UserLeft` | User Left | Un membre quitte le serveur ou est expulsé |
| `UserRoleAdded` | User Role Added | Un ou plusieurs rôles sont attribués à un membre |
| `UserRoleRemoved` | User Role Removed | Un ou plusieurs rôles sont retirés à un membre |
| `UserBanned` | User Banned | Un membre est banni |
| `UserUnbanned` | User Unbanned | Un bannissement est levé |
| `UserMuted` | User Muted | Un membre est rendu muet en vocal ou en écrit |
| `VoicePresence` | Voice Presence | Un membre rejoint, quitte, est déplacé, rendu muet, mis en sourdine ou diffuse en vocal |
| `VoicePresenceTts` | Voice Presence TTS | Un membre a peut-être utilisé la synthèse vocale en vocal ; la détection se fait au mieux |
| `ServerUpdated` | Server Updated | Des paramètres du serveur, comme le nom, l'icône ou le propriétaire, changent |
| `EventCreated` | Event Created | Un événement planifié du serveur est créé |
| `InviteCreated` | Invite Created | Une invitation est créée, avec sa durée de validité et son nombre d'utilisations |
| `InviteDeleted` | Invite Deleted | Une invitation est supprimée |
| `RoleCreated` | Role Created | Un rôle est créé |
| `RoleDeleted` | Role Deleted | Un rôle est supprimé |
| `RoleUpdated` | Role Updated | Le nom, la couleur ou les permissions d'un rôle changent |
| `ChannelCreated` | Channel Created | Un salon est créé |
| `ChannelDestroyed` | Channel Destroyed | Un salon est supprimé |
| `ChannelUpdated` | Channel Updated | Le nom, le sujet ou les permissions d'un salon changent |
| `Other` | Other | Événements divers non couverts ci-dessus |

Le tableau de bord affiche aussi une entrée **Avatar mis à jour**. Elle est stockée avec les autres et est définie par les catégories Users et All, mais ce n'est pas une valeur que vous pouvez transmettre à la commande `log`.

## Catégories

`logcategory` définit un groupe entier de types vers un même salon en une seule étape. Exécutée sans salon, elle efface tous les types de ce groupe.

| Catégorie | Types qu'elle définit |
| --- | --- |
| `All` | Tous les types ci-dessus |
| `Users` | NicknameUpdated, AvatarUpdated, UsernameUpdated, UserRoleAdded, UserRoleRemoved, VoicePresence, UserJoined, UserLeft, UserUpdated |
| `Threads` | ThreadCreated, ThreadDeleted, ThreadUpdated |
| `Roles` | RoleCreated, RoleDeleted, RoleUpdated |
| `Server` | ServerUpdated, EventCreated, InviteCreated, InviteDeleted |
| `Channel` | ChannelCreated, ChannelDestroyed, ChannelUpdated |
| `Messages` | MessageDeleted, MessageUpdated, MessagesBulkDeleted, ReactionEvents |
| `Moderation` | UserMuted, UserBanned, UserUnbanned, Other |
| `None` | Efface tous les types (utilisé par le bouton **Tout désactiver** du tableau de bord) |

## Salons ignorés

Tout salon de la liste d'exclusion est ignoré pour les événements de messages, de fils, de salons et de vocal qui s'y produisent. Les fils héritent du paramètre de leur salon parent : ignorer un forum ou un salon textuel ignore donc aussi ses fils. Ignorer un salon vocal supprime les logs de présence vocale pour les arrivées et départs de ce salon.

Ignorer un salon n'empêche pas la journalisation des événements liés aux membres, aux rôles ou au serveur, car ceux-ci ne sont pas rattachés à un salon.

## Paramètres

La page Journalisation comporte deux onglets, **Salons de journal** et **Ignored Channels**.

| Paramètre | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Log Channels | aucun | Un sélecteur de salon par type d'événement, regroupés en Popular, Users, Messages, Moderation, Server, Channels, Roles, Threads, Voice et All Events |
| Clear Category | | Vide tous les sélecteurs du groupe affiché ; effectif lors de l'enregistrement avec **Enregistrer la configuration** |
| Clear All | | Affiché dans le groupe **Tous les événements** ; vide tous les sélecteurs, effectif à l'enregistrement |
| Disable All | | Bouton d'en-tête affiché tant qu'un salon est défini ; retire immédiatement chaque type d'événement après confirmation, en conservant les salons ignorés |
| Ignored Channels | aucun | Salons exclus de la journalisation, déplacés entre les listes **Active Channels** et **Ignored Channels** |

> [!TIP]
> Le groupe **Populaires** regroupe User Joined, User Left, Message Deleted, Message Updated, User Banned, User Unbanned, Channel Created et Channel Destroyed. C'est un bon point de départ pour la plupart des serveurs.

## Pas à pas

1. Créez un ou plusieurs salons de logs privés, lisibles uniquement par le staff.
2. Ouvrez **Journalisation** dans le tableau de bord et restez sur l'onglet **Salons de journal**.
3. Dans le groupe **Populaires**, choisissez votre salon de logs pour chaque événement souhaité, puis enregistrez.
4. Passez aux autres groupes, comme **Modération** ou **Vocal**, et attribuez des salons à ce dont vous avez besoin.
5. Ouvrez l'onglet **Ignored Channels** et déplacez les salons du staff et les salons de commandes du bot dans la liste des salons ignorés.
6. Supprimez un message de test et vérifiez que le log apparaît dans le bon salon.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les versions slash se trouvent sous `/log`.

| Commande | Alias | Autorisation | Rôle |
| --- | --- | --- | --- |
| `log <type> [#channel]` | | Administrateur | Envoyer un type d'événement vers un salon ; sans salon, le salon actuel est utilisé |
| `log #channel [types...]` | | Administrateur | Envoyer plusieurs types vers un salon, ou ouvrir un menu de sélection de tous les types si aucun n'est donné |
| `log "#channel:Type1,Type2" ...` | | Administrateur | Définir plusieurs couples salon et types dans un seul message |
| `logcategory <category> [#channel]` | `logcat` | Administrateur | Diriger toute une catégorie vers un salon, ou l'effacer sans salon |
| `logevents` | | Administrateur | Lister chaque type d'événement et le salon qu'il utilise actuellement |
| `logignore [#channel]` | `lignore` | Administrateur | Ajouter ou retirer un salon de la liste d'exclusion ; par défaut, le salon actuel |
| `logignorelist` | `lignorel` | Administrateur | Afficher la liste d'exclusion |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrateur | Journaliser l'utilisation des commandes du bot dans un salon, ou la désactiver sans salon |

> [!EXAMPLE]
> `log "#mod-logs:UserBanned,UserUnbanned,UserMuted" "#message-logs:MessageDeleted,MessageUpdated"`

## Astuces et pièges

- Donnez au bot la permission Voir le journal d'audit. Sans elle, les logs sont toujours publiés, mais ne peuvent pas indiquer quel modérateur a supprimé un message, banni quelqu'un ou modifié un rôle.
- Le bot doit pouvoir voir et envoyer des messages dans chaque salon de logs. Un salon de logs qu'il ne voit pas est ignoré sans erreur.
- Les logs de messages supprimés et modifiés dépendent du cache de messages du bot. Les messages envoyés avant le dernier redémarrage du bot, ou ceux supprimés lors de purges en masse, peuvent apparaître comme non mis en cache.
- Les logs de réactions sont regroupés : tous les changements de réactions sur un message dans un délai d'environ cinq secondes forment une seule entrée, pour éviter de saturer les serveurs actifs.
- Le menu de sélection ouvert par `log #channel` affiche jusqu'à 25 types par menu et présélectionne ceux déjà envoyés vers ce salon.
- `logcategory` écrase chaque type de la catégorie, y compris ceux que vous aviez routés ailleurs. Utilisez ensuite `log` pour les types individuels.

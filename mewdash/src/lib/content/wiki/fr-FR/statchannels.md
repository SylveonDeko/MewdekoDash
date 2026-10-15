---
title: Salons de statistiques
slug: statchannels
summary: Salons vocaux dont le nom se met à jour automatiquement pour afficher des chiffres en direct, comme le nombre de membres, les boosts, les tickets ouverts ou le nombre de spectateurs Twitch.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/statchannels
module: StatChannels
tags: [stat channels, counter, member count, live stats, voice channel stats, countdown, member goal, boost count, twitch viewers, salons de statistiques, compteur, nombre de membres, statistiques en direct, statistiques des salons vocaux, compte à rebours, objectif de membres, nombre de boosts, spectateurs twitch]
related: [counting, twitch, suggestions, xp, afk, starboard]
---

## Ce que cela fait

Un salon de statistiques est un salon vocal verrouillé, placé en haut de la liste de vos salons, qui affiche un nombre dans son nom, par exemple « Members: 12,480 ». Le bot réécrit le nom selon un calendrier pour que le nombre reste à jour. Les membres ne peuvent pas rejoindre le salon : il n'existe que pour être lu.

Vous choisissez un type de compteur, un modèle pour le nom, un style d'affichage du nombre et la fréquence de rafraîchissement. Le bot prend en charge plusieurs dizaines de compteurs couvrant les informations du serveur, la présence, les boosts Nitro, les emplacements d'émojis, les objectifs de membres et les comptes à rebours, ainsi que des valeurs issues d'autres fonctionnalités de Mewdeko, comme les tickets, les suggestions, les concours, l'XP, le comptage, le tableau des favoris et les serveurs Twitch ou Minecraft liés.

Discord n'autorise qu'un renommage de salon deux fois toutes les dix minutes. Les salons de statistiques contournent cette limite grâce à un choix de mécanisme de mise à jour, dont un qui supprime puis recrée le salon afin qu'il puisse se rafraîchir chaque minute.

## Pourquoi l'utiliser

- Afficher le nombre de membres, d'humains et de bots en haut du serveur.
- Suivre la progression vers un objectif de membres, avec un pourcentage ou une barre de progression.
- Compter à rebours jusqu'à un événement, un lancement ou un anniversaire.
- Afficher le statut en direct et le nombre de spectateurs Twitch pour le serveur d'un streamer.
- Donner au personnel une vue en direct des tickets ouverts ou des suggestions en attente, sans ouvrir le tableau de bord.
- Afficher l'état et le nombre de joueurs d'un serveur Minecraft à côté du lien d'invitation.

## Types de compteurs

Le catalogue complet ci-dessous correspond à ce que listent `statchanneltypes` et la section **Compteurs disponibles** du tableau de bord. Chaque type accepte les marqueurs communs ; certains ajoutent les leurs. Les modèles par défaut commencent par un émoji correspondant, suivi du texte indiqué.

### Membres

| Type | Affiche | Modèle par défaut | Marqueurs supplémentaires |
| --- | --- | --- | --- |
| `TotalMembers` | Tous les membres, bots compris | `Members: %count%` | |
| `HumanMembers` | Membres qui ne sont pas des bots | `Humans: %count%` | |
| `BotCount` | Comptes de bots | `Bots: %count%` | |
| `OnlineMembers` | Membres avec une présence autre que hors ligne | `Online: %count%` | |
| `IdleMembers` | Membres marqués comme inactifs | `Idle: %count%` | |
| `DndMembers` | Membres marqués comme ne pas déranger | `DND: %count%` | |
| `StreamingMembers` | Membres avec une activité de diffusion | `Streaming: %count%` | |
| `InVoiceMembers` | Membres connectés à un salon vocal | `In Voice: %count%` | |
| `RoleMembers` | Membres possédant un rôle choisi | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.color%` |
| `NewestMember` | Le membre arrivé le plus récemment | `Newest: %member.name%` | `%member.name%`, `%member.id%` |
| `MembersJoinedToday` | Arrivés au cours des 24 dernières heures | `Joined Today: %count%` | |
| `MembersJoinedWeek` | Arrivés au cours des 7 derniers jours | `This Week: %count%` | |
| `MemberGoal` | Progression vers un nombre cible de membres | `%count% / %goal%` | `%goal%`, `%goal.raw%`, `%goal.percent%`, `%goal.remaining%`, `%goal.bar%` |
| `AfkCount` | Membres actuellement AFK via Mewdeko | `AFK: %count%` | |

### Serveur

| Type | Affiche | Modèle par défaut | Marqueurs supplémentaires |
| --- | --- | --- | --- |
| `Countdown` | Temps restant jusqu'à une date cible | `%days%d %hours%h left` | `%days%`, `%hours%`, `%minutes%`, `%total.hours%` |
| `ChannelCount` | Tous les salons | `Channels: %count%` | |
| `TextChannelCount` | Salons textuels | `Text: %count%` | |
| `VoiceChannelCount` | Salons vocaux | `Voice: %count%` | |
| `CategoryCount` | Catégories | `Categories: %count%` | |
| `StageChannelCount` | Salons de scène | `Stages: %count%` | |
| `ForumChannelCount` | Salons de forum | `Forums: %count%` | |
| `ThreadCount` | Fils actuellement enregistrés comme actifs | `Threads: %count%` | |
| `RoleCount` | Rôles | `Roles: %count%` | |
| `BoostCount` | Boosts Nitro actifs | `Boosts: %count%` | |
| `BoostLevel` | Niveau de boost, de 0 à 3 | `Level %count%` | |
| `NextBoostGoal` | Boosts encore nécessaires pour le niveau suivant | `%count% to Tier %tier.next%` | `%tier.next%`, `%tier.current%` |
| `EmojiCount` | Tous les émojis personnalisés | `Emojis: %count%` | |
| `AnimatedEmojiCount` | Émojis personnalisés animés | `Animated: %count%` | |
| `StaticEmojiCount` | Émojis personnalisés statiques | `Static: %count%` | |
| `StickerCount` | Autocollants personnalisés | `Stickers: %count%` | |
| `EmojiSlotsUsed` | Emplacements d'émojis utilisés par rapport à la limite du niveau | `Slots: %count%/%slots.max%` | `%slots.max%`, `%slots.free%` |
| `ServerAge` | Nombre de jours depuis la création du serveur | `Age: %count% days` | `%years%`, `%created%` |
| `EventCount` | Événements programmés | `Events: %count%` | |
| `BotUptime` | Durée de fonctionnement de Mewdeko | `Uptime: %days%d %hours%h` | `%days%`, `%hours%`, `%minutes%` |
| `InviteCount` | Invitations suivies par le suivi des invitations | `Invites: %count%` | |

### Twitch

Ces compteurs lisent les données de la chaîne Twitch liée via le module Twitch.

| Type | Affiche | Modèle par défaut | Marqueurs supplémentaires |
| --- | --- | --- | --- |
| `TwitchLiveStatus` | Si la chaîne est en direct | `%twitch.name%: %status%` | `%status%`, `%twitch.name%` |
| `TwitchViewers` | Spectateurs actuels | `Viewers: %count%` | `%twitch.name%` |
| `TwitchGame` | Catégorie diffusée | `%game%` | `%game%`, `%title%`, `%twitch.name%` |
| `TwitchUptime` | Durée de la diffusion en direct | `Live %hours%h %minutes%m` | `%hours%`, `%minutes%` |
| `TwitchFollowers` | Total des abonnés | `Followers: %count%` | `%twitch.name%` |
| `TwitchSubs` | Total des abonnés payants | `Subs: %count%` | `%twitch.name%` |
| `TwitchCounter` | Un compteur nommé du chat Twitch | `%counter.name%: %count%` | `%counter.name%` |
| `TwitchLastRaider` | Le raid le plus récent | `Last Raid: %raider%` | `%raider%`, `%raid.viewers%` |
| `TwitchRecentStreams` | Diffusions lancées au cours des 14 derniers jours | `Streams: %count%` | |

### Autres fonctionnalités de Mewdeko

| Type | Catégorie | Affiche | Modèle par défaut | Marqueurs supplémentaires |
| --- | --- | --- | --- | --- |
| `MinecraftPlayers` | Minecraft | Joueurs connectés sur un serveur surveillé | `Players: %count%/%players.max%` | `%players.max%`, `%server.version%` |
| `MinecraftStatus` | Minecraft | Si un serveur surveillé est joignable | `%status%` | `%status%`, `%latency%` |
| `CountingCurrent` | Comptage | Nombre actuel dans un salon de comptage | `Count: %count%` | |
| `CountingRecord` | Comptage | Plus haut nombre jamais atteint | `Record: %count%` | |
| `OpenTickets` | Tickets | Tickets ouverts et non archivés | `Open Tickets: %count%` | |
| `TicketsToday` | Tickets | Tickets ouverts au cours des 24 dernières heures | `Today: %count%` | |
| `PendingSuggestions` | Suggestions | Suggestions en attente d'une décision | `Pending: %count%` | |
| `ActiveGiveaways` | Concours | Concours actuellement en cours | `Giveaways: %count%` | |
| `StarboardPosts` | Tableau des favoris | Nombre total de messages du tableau des favoris | `Starred: %count%` | |
| `TopXpUser` | XP | Le membre ayant le plus d'XP | `Top: %member.name%` | `%member.name%`, `%member.id%`, `%member.xp%` |
| `TotalGuildXp` | XP | Toute l'XP gagnée sur le serveur | `Total XP: %count%` | |
| `TotalCurrency` | Monnaie | Monnaie détenue par les membres | `In Circulation: %count%` | |
| `ActivePolls` | Sondages | Sondages acceptant des votes | `Polls: %count%` | |
| `Clock` | Serveur | La date et l'heure dans le fuseau horaire du serveur | `%time% %tz%` | `%time%`, `%date%`, `%datetime%`, `%weekday%`, `%tz%` |
| `MessagesToday`, `MessagesWeek` | Activité | Messages des 24 dernières heures ou des 7 derniers jours | `Today: %count%` | |
| `VoiceHoursToday`, `VoiceHoursWeek` | Activité | Heures en vocal de tous les membres sur les 24 dernières heures ou les 7 derniers jours | `Today: %count%h` | |
| `TopChatter` | Activité | Le bavard le plus actif des 7 derniers jours | `Chatter: %member.name%` | `%member.name%`, `%member.id%`, `%member.messages%` |
| `TopVoiceMember` | Activité | Le membre ayant passé le plus de temps en vocal au cours des 7 derniers jours | `Voice: %member.name%` | `%member.name%`, `%member.id%`, `%member.hours%` |
| `TopGame` | Activité | Le jeu le plus joué des 7 derniers jours (nécessite le suivi des jeux) | `%game%` | `%game%`, `%hours%`, `%players%` |
| `PlayingNow` | Activité | Membres jouant actuellement à un jeu suivi (nécessite le suivi des jeux) | `Playing: %count%` | |
| `RoleMembersOnline` | Membres | Membres possédant un rôle et qui ne sont pas hors ligne | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.total%` |
| `TopInviter` | Suivi des invitations | Le membre ayant le plus d'invitations | `Inviter: %member.name%` | `%member.name%`, `%member.id%`, `%member.invites%` |
| `InvitesWeek` | Suivi des invitations | Arrivées attribuées aux inviteurs au cours des 7 derniers jours | `This Week: %count%` | |
| `MembersLeftToday`, `MembersLeftWeek` | Membres | Membres partis au cours des 24 dernières heures ou des 7 derniers jours | `Left Today: %count%` | |
| `NetGrowthWeek` | Membres | Arrivées moins départs sur les 7 derniers jours | `Growth: %count%` | `%joins%`, `%leaves%` |

### Marqueurs disponibles pour tous les types

| Marqueur | Valeur |
| --- | --- |
| `%count%` | La valeur, affichée avec le style d'affichage choisi |
| `%count.raw%` | La valeur sous forme de chiffres simples |
| `%server.name%` | Nom du serveur |
| `%server.id%` | Identifiant du serveur |
| `%server.members%` | Nombre total de membres |
| `%server.boostcount%` | Nombre de boosts |
| `%server.boostlevel%` | Niveau de boost |

Les noms de salons sont limités à 100 caractères, comme l'impose Discord.

## Styles d'affichage

Le **Style du compteur** détermine la manière dont `%count%` est affiché. Il ne s'applique qu'aux compteurs numériques ; les compteurs textuels comme `NewestMember` affichent le texte tel quel, et les compteurs vrai ou faux comme `TwitchLiveStatus` affichent un texte de type « LIVE » ou « Offline ».

| Style | Exemple pour 1234 | Remarques |
| --- | --- | --- |
| `Plain` | `1234` | Chiffres bruts |
| `Comma` | `1,234` | Séparateurs de milliers. Valeur par défaut. |
| `Compact` | `1.2K` | Suffixes K, M, B, T, une décimale par défaut |
| `Padded` | `1234` | Complété par des zéros à une largeur fixe, quatre chiffres par défaut, donc 42 devient `0042` |
| `Ordinal` | `1,234th` | Ajoute st, nd, rd ou th |
| `Percent` | `61.7%` | Valeur exprimée en pourcentage de l'objectif, une décimale par défaut |
| `ProgressBar` | une barre de dix cases | Cases remplies et vides vers l'objectif, dix cases par défaut |
| `EmojiDigits` | chiffres en émojis touches | Chaque chiffre sous forme d'émoji touche |
| `Roman` | `MCCXXXIV` | Chiffres romains de 1 à 3999, sinon retour au style avec virgules |

`Percent` et `ProgressBar` ont besoin d'un objectif à comparer. Sans objectif, ils affichent `0%` ou une barre vide.

## Mécanismes de mise à jour

| Mécanisme | Libellé du tableau de bord | Fonctionnement |
| --- | --- | --- |
| `Rename` | Rename only | Modifie le nom du salon. Discord autorise deux renommages par dix minutes et par salon, donc l'intervalle de rafraîchissement est forcé à au moins 5 minutes. L'identifiant du salon ne change jamais. |
| `Recreate` | Delete and recreate | Crée un nouveau salon avec le même nom, la même catégorie, la même position et les mêmes dérogations de permissions, puis supprime l'ancien. Peut se rafraîchir chaque minute, mais l'identifiant du salon change à chaque mise à jour et chaque mise à jour laisse deux entrées dans le journal d'audit. |
| `Auto` | Auto (recommended) | Renomme tant que le budget de deux par dix minutes le permet. Lorsque le budget est épuisé et que l'intervalle est inférieur à 5 minutes, il recrée le salon à la place. Lorsque l'intervalle est de 5 minutes ou plus, il attend simplement le prochain créneau de renommage. |

Le choix par défaut pour les nouveaux salons de statistiques est **Auto** toutes les **5 minutes**. Les intervalles sont bornés entre 1 minute (5 pour Rename) et 1440 minutes. Le bot vérifie toutes les 30 secondes les salons dont l'intervalle est écoulé.

> [!WARNING]
> Recreate modifie l'identifiant du salon. Tout ce qui référence le salon, comme les configurations de permissions dans d'autres bots ou les liens épinglés, cesse de fonctionner à chaque rafraîchissement. Utilisez-le uniquement lorsqu'un rafraîchissement rapide compte davantage qu'un identifiant stable.

## Paramètres

La page comporte trois onglets, **Salons de statistiques**, **Ajouter** et **Valeurs par défaut**, ainsi qu'un bouton **Actualiser** dans l'en-tête. **Salons de statistiques** liste chaque salon configuré avec les boutons **Modifier** et **Retirer**.

**Ajouter un salon de statistiques** propose **Créer un nouveau salon** ou **Utiliser un salon existant** avec un sélecteur **Salon vocal**, puis :

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Category (optional) | aucune | Emplacement du nouveau salon créé |
| Counter | aucun | Le type de compteur du catalogue |
| Template | le modèle par défaut du type | Nom du salon avec des marqueurs ; cliquez sur une puce de marqueur pour l'insérer, et l'aperçu se met à jour pendant la frappe |
| Counter Style | Comma | Style d'affichage du tableau ci-dessus |
| Update Mechanism | Auto | Rename, recreate ou auto |
| Refresh Interval (minutes) | 5 | Fréquence de rafraîchissement du nom |
| Role | aucun | Affiché pour `RoleMembers` |
| Target Date | aucune | Affiché pour `Countdown` |
| Goal Target | aucun | Affiché pour `MemberGoal`, et utilisé par les styles pourcentage et barre de progression |
| Twitch Counter Name | aucun | Affiché pour `TwitchCounter` |
| Counting Channel | aucun | Affiché pour les types de comptage |
| Minecraft Server | aucun | Affiché pour les types Minecraft |

**Valeurs par défaut des nouveaux salons de statistiques** définit **Mécanisme par défaut**, **Style de compteur par défaut** et **Intervalle par défaut (minutes)** pour les salons ajoutés ensuite. L'onglet **Valeurs par défaut** comporte aussi des sections de référence **Styles de compteur** et **Compteurs disponibles**.

Un nouveau salon créé refuse Se connecter à `@everyone` afin de servir d'étiquette. Un salon que vous ajoutez vous-même conserve les permissions qu'il possède déjà.

## Mise en place pas à pas

1. Ouvrez **Salons de statistiques** dans le tableau de bord et allez dans l'onglet **Valeurs par défaut**. Laissez **Mécanisme par défaut** sur Auto et réglez un intervalle qui vous convient.
2. Allez dans **Ajouter**, choisissez **Créer un nouveau salon**, puis sélectionnez une **Catégorie** si vous voulez regrouper les compteurs.
3. Choisissez un **Compteur**, par exemple Total Members. Ajustez le **Modèle** et observez l'aperçu.
4. Choisissez un **Style du compteur** et enregistrez.
5. Répétez pour chaque compteur. Pour un objectif de membres, choisissez `MemberGoal`, définissez **Objectif cible** et essayez le style `ProgressBar`.
6. Faites glisser les nouveaux salons en haut de la liste des salons dans Discord s'ils ne s'y sont pas placés tout seuls.
7. Attendez un intervalle de rafraîchissement et vérifiez que les noms se mettent à jour.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les types, styles et mécanismes sont les noms indiqués dans les tableaux ci-dessus, par exemple `TotalMembers`, `Compact`, `Recreate`.

| Commande | Alias | Nécessite | Objet |
| --- | --- | --- | --- |
| `statchannelcreate <type> [template]` | `scnew` | Gérer les salons | Créer un nouveau salon vocal verrouillé affichant ce compteur |
| `statchanneladd #voice <type> [template]` | `sca` | Gérer les salons | Transformer un salon vocal existant en salon de statistiques |
| `statchannelrole #voice @role [true] [template]` | `scr` | Gérer les salons | Ajouter un compteur de membres d'un rôle ; `true` ne compte que les membres qui ne sont pas hors ligne |
| `statchannelcountdown #voice <date> [template]` | `scc` | Gérer les salons | Ajouter un compte à rebours jusqu'à une date |
| `statchannelgoal #voice <number> [template]` | `scg` | Gérer les salons | Ajouter un compteur d'objectif de membres |
| `statchanneltwitchcounter #voice <counter> [template]` | | Gérer les salons | Reproduire un compteur nommé du chat Twitch |
| `statchannelmechanism #voice <mechanism> [minutes]` | | Gérer les salons | Définir rename, recreate ou auto, et éventuellement l'intervalle |
| `statchannelstyle #voice <style>` | | Gérer les salons | Définir le style d'affichage |
| `statchanneldefaults [mechanism] [minutes] [style]` | | Gérer les salons | Définir les valeurs par défaut des nouveaux salons de statistiques |
| `statchanneltypes [category]` | | Personne | Parcourir chaque compteur avec un exemple, éventuellement par catégorie |
| `statchannellist` | `scl` | Personne | Lister les salons de statistiques du serveur avec type, style, mode et modèle |
| `statchannelremove #voice` | `statchrm` | Gérer les salons | Arrêter le suivi d'un salon |

`statchannelcreate` nécessite aussi que le bot dispose de Gérer les salons. Les équivalents en commandes slash se trouvent sous `/statchannel`.

## Astuces et pièges

- Le bot a besoin de Gérer les salons pour renommer ou recréer un salon.
- Un salon vocal ne peut être qu'un seul salon de statistiques. L'ajouter deux fois échoue avec « already a stat channel ».
- Les compteurs de comptage, Minecraft et Twitch nécessitent que ces fonctionnalités soient configurées au préalable. Les cibles de comptage et de Minecraft se choisissent dans le tableau de bord ; aucune commande n'existe pour elles.
- `statchannelremove` arrête seulement le suivi. Supprimez vous-même le salon vocal si vous n'en voulez plus.
- Les valeurs en direct, comme les spectateurs Twitch ou les tickets ouverts, suivent toujours l'intervalle propre du salon. Réduisez l'intervalle de ces salons plutôt que de tous les salons.
- Les styles `Percent` et `ProgressBar` utilisent l'objectif propre au salon. Les définir sur un compteur sans objectif affiche toujours zéro.

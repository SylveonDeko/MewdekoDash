---
title: Gestion du serveur
slug: servermanagement
summary: Outils en masse pour la structure de votre serveur : créer et supprimer des salons et des rôles, attribuer des rôles à des centaines de membres en une seule tâche, verrouiller le serveur, synchroniser les dérogations de salon, voler des emojis et surveiller les modifications dangereuses de rôles.
icon: fa-server
category: Actions
module: ServerManagement
tags: [server management, roles, mass role, channels, lockdown, slowmode, lock channel, nuke, emotes, steal emotes, webhook, permcontrol, role monitor, role jobs, server icon, server banner, gestion du serveur, rôles, attribution de masse, salons, verrouillage, mode lent, verrouiller salon, nuke, émojis, voler émojis, surveillance des rôles, tâches de rôles, icône du serveur, bannière du serveur]
related: [administration, permissions, moderation]
---

## Ce que cela fait

La gestion du serveur regroupe les commandes qui modifient la structure d'un serveur plutôt que les personnes qui s'y trouvent. Le personnel peut créer une catégorie et tous ses salons en une seule ligne, renommer ou supprimer des salons, définir des sujets, activer ou désactiver le NSFW, régler le mode lent, verrouiller un salon, ou le supprimer puis le recréer pour effacer son historique.

Les rôles occupent la plus grande part. Les commandes ponctuelles créent, renomment, changent la couleur, affichent séparément et suppriment des rôles, ou attribuent un rôle à un seul membre, avec une minuterie facultative. Les commandes de masse ajoutent ou retirent un rôle pour chaque membre, chaque humain, chaque bot, chaque personne ayant un autre rôle, ou chaque personne arrivée avant ou après une date limite. Elles s'exécutent comme des tâches en arrière-plan que vous pouvez lister et arrêter.

Le module couvre aussi l'apparence du serveur (icône, bannière, splash, nom), la gestion des émojis, y compris le vol d'émojis d'autres serveurs, les dérogations de permissions par salon, les déplacements dans les salons vocaux, trois types de verrouillage, et une surveillance des rôles qui annule et sanctionne les modifications dangereuses de rôles.

Rien n'est configuré sur le tableau de bord. Tout s'exécute depuis des commandes.

## Pourquoi l'utiliser

- Mettre en place un nouveau serveur et vouloir dix salons sous une catégorie sans cliquer dix fois dans l'interface de Discord.
- Donner le rôle « Membre » à deux mille membres existants après avoir activé la restriction par rôle.
- Verrouiller le serveur pendant un raid pour que personne ne puisse écrire, puis restaurer exactement les anciennes permissions.
- Copier des émojis du serveur d'un ami en une seule commande.
- Empêcher un modérateur de s'accorder l'Administrateur en ajoutant une permission sur liste noire à un rôle.

## Salons

### Création et modification

`creatxtchanl <name>` et `creatvoichanl <name>` créent un seul salon textuel ou vocal. `deltxtchanl <#channel>` et `delvoichanl <channel>` en suppriment un.

La famille `cc...` en crée plusieurs à la fois :

| Commande | Ce qu'elle crée |
| --- | --- |
| `ccatc <category name> <channel names...>` | Une nouvelle catégorie et des salons textuels à l'intérieur |
| `ccavc <category name> <channel names...>` | Une nouvelle catégorie et des salons vocaux à l'intérieur |
| `cctc <existing category> <channel names...>` | Des salons textuels dans une catégorie existante |
| `ccvc <existing category> <channel names...>` | Des salons vocaux dans une catégorie existante |

`renamechannel <channel> <name>` renomme n'importe quel salon, `setchanlname <name>` renomme celui où vous vous trouvez, `settopic [text]` définit ou efface le sujet du salon actuel, et `nsfwtoggle` inverse l'indicateur NSFW du salon actuel.

### Mode lent, verrouillage et nuke

`slowmode` seul bascule le salon actuel entre une minute et désactivé. `slowmode <time>`, comme `slowmode 30s`, définit un intervalle précis, et les deux formes acceptent un argument de salon. Toute valeur égale ou supérieure à 21600 secondes (six heures) est refusée.

`lock [#channel]` ajoute un refus de Envoyer des messages pour le rôle `@everyone` sur ce salon ; `unlock [#channel]` le retire. Les bits de dérogation existants sont conservés.

`nuke [#channel]` demande une confirmation, supprime le salon et en crée un nouveau avec le même nom, la même position, le même sujet, les mêmes dérogations de permissions, le même indicateur NSFW, la même catégorie et le même mode lent. Les messages épinglés, les webhooks et l'historique des messages sont définitivement perdus.

### Dérogations de permissions

`permcontrol <channel> <allow|deny|inherit> <role or user> <permissions...>` modifie la dérogation d'une seule cible sur un salon sans toucher à ses autres bits. `permview [@user or role]` liste les permissions que vous, un membre ou un rôle possédez actuellement.

`syncroletoall <role>` copie la dérogation du rôle depuis le salon actuel vers chaque salon textuel et chaque catégorie. `syncroletoallchannels` et `syncroletoallcategories` ne traitent que les salons ou seulement les catégories. Le rôle doit déjà avoir une dérogation dans le salon où vous exécutez la commande.

### Webhooks

`createwebhook <#channel> <name> [avatar url]` crée un webhook. Une image jointe sert d'avatar si vous ne donnez pas d'URL. Le bot confirme dans le salon et vous envoie l'URL et le jeton du webhook en message privé.

## Vocal

- `moveto <voice channel>` vous déplace.
- `moveuserto @user <voice channel>` déplace quelqu'un d'autre.
- `grab @user` fait venir quelqu'un dans le salon vocal où vous vous trouvez.

## Verrouillage

`lockdown [type] [action] [override]` et `liftlockdown [type]` nécessitent l'Administrateur.

| Type | Ce qu'il fait |
| --- | --- |
| `Joins` | Toute personne qui rejoint pendant son activation est expulsée ou bannie. L'action est `Ban` par défaut ; `Kick` est la seule autre option. |
| `Readonly` | Le bot sauvegarde la dérogation actuelle de `@everyone` de chaque salon, puis refuse Envoyer des messages, la création de fils et les réponses dans les fils des salons textuels, ainsi que Se connecter et Parler dans les salons vocaux. Les salons de forum conservent Envoyer des messages pour que les fils existants restent lisibles. |
| `Full` | Les deux précédents à la fois. |

Avant d'appliquer un verrouillage en lecture seule, le bot vérifie qu'il peut modifier chaque salon. S'il en manque, il les liste et s'arrête, sauf si vous passez `true` comme troisième argument pour continuer quand même. Lever le verrouillage restaure les dérogations sauvegardées. Les verrouillages des arrivées survivent à un redémarrage du bot.

`unlockdown` est un outil distinct et plus ancien : il réactive Envoyer des messages pour le rôle `@everyone` lui-même, pour les serveurs verrouillés en modifiant ce rôle.

> [!WARNING]
> `lockdown` sans arguments est un verrouillage en lecture seule, et `lockdown joins` bannit les personnes qui arrivent par défaut. Passez `kick` si c'est ce que vous voulez.

## Rôles

### Commandes pour un seul rôle

| Commande | Ce qu'elle fait |
| --- | --- |
| `createrole [name]` | Crée un rôle, non mentionnable |
| `deleterole <role>` | Supprime un rôle situé sous votre propre rôle le plus élevé |
| `renamerole <role> <name>` | Renomme un rôle |
| `rolecolor <role> [colour]` | Affiche la couleur du rôle, ou la définit |
| `rolehoist <role>` | Active ou désactive l'affichage séparé du rôle dans la liste des membres |
| `setrole <role> @user [time]` | Attribue un rôle, en le retirant éventuellement après `time`, par exemple `2h` |
| `removerole <role> @user` | Retire un rôle |
| `removeallroles @user` | Retire à un membre tous les rôles non gérés |

Les arguments de rôle et de membre peuvent être donnés dans n'importe quel ordre pour `setrole` et `removerole`.

### Plusieurs rôles ou membres à la fois

- `createroles <names...>` crée un rôle par mot, après confirmation de la liste.
- `deleteroles <roles...>` supprime plusieurs rôles après confirmation ; les rôles gérés sont ignorés.
- `setroles @user <roles...>` attribue plusieurs rôles à un membre ; `setroles @user <time> <roles...>` les rend temporaires.
- `removeroles @user <roles...>` retire plusieurs rôles à un membre.
- `adduserstorole <role> @user @user...` et `removeusersfromrole <role> @user @user...` s'appliquent à plusieurs membres.

### Tâches de rôles en masse

Ces commandes parcourent toute la liste des membres et s'exécutent comme des tâches en arrière-plan. En raison des limites de débit de Discord, le bot marque une courte pause par membre et n'autorise que cinq tâches simultanées par serveur. Chaque tâche indique le temps qu'elle devrait prendre.

| Commande | Personnes concernées |
| --- | --- |
| `addtoall <role>` | Chaque membre qui n'a pas le rôle |
| `addtoallusers <role>` | Humains uniquement |
| `addtoallbots <role>` | Bots uniquement |
| `addtousersover <time> <role>` | Membres arrivés depuis au moins `time`, par exemple `30d` |
| `addtousersunder <time> <role>` | Membres arrivés plus récemment que `time` |
| `addroletorole <role> <role2>` | Donne `role` à toutes les personnes ayant `role2` |
| `addthenremove <role> <role2>` | Donne `role` à toutes les personnes ayant `role2`, puis retire `role2` |
| `removefromall <role>` | Toutes les personnes ayant le rôle |
| `removefromallusers <role>` | Humains uniquement |
| `removefromallbots <role>` | Bots uniquement |
| `removefromrole <role> <role2>` | Retire `role` à toutes les personnes ayant `role2` |

`rolejobs` liste les tâches en cours avec leur type, la personne qui les a lancées, leur progression et leurs rôles. `stopjob <number>` annule une tâche et indique jusqu'où elle est allée.

### Export et import

`exportrolelist` envoie un fichier `rolelist.txt` contenant une ligne `roleId,userId,roleName` par appartenance, pour chaque rôle que le bot peut gérer. `importrolelist` lit un tel fichier joint à la commande et réapplique les rôles ; passez `true` pour créer les rôles par leur nom lorsque les identifiants n'existent plus. `addroletolist <role>` lit une liste d'identifiants d'utilisateurs jointe et leur donne le rôle.

## Apparence et émojis du serveur

`seticon <url>`, `setbanner <url>`, `setsplash <url>` et `setservername <name>` modifient le serveur lui-même et nécessitent l'Administrateur. `setguildavatar`, `setguildbanner` et `setguildbio` modifient l'apparence du bot lui-même sur ce serveur uniquement, et nécessitent Gérer le serveur.

Les commandes d'émojis nécessitent Gérer les expressions, à la fois pour vous et pour le bot :

- `addemote <name> [url]` importe un émoji depuis une URL ou une image jointe.
- `removeemote <emote>` et `renameemote <emote> <name>` agissent sur les émojis de ce serveur.
- `stealemotes <emotes...>` copie tous les émojis personnalisés de votre message dans ce serveur. `sfr <role> <emotes...>` fait la même chose, mais limite les émojis à un seul rôle.
- Faire un clic droit sur un message puis choisir **Voler les émojis** ou **Voler l'autocollant** dans le menu Applications fait la même chose sans rien taper.

## Surveillance des rôles

La surveillance des rôles observe le journal d'audit. Lorsqu'un membre reçoit un rôle sur liste noire, ou qu'un rôle obtient une permission sur liste noire, le bot annule la modification et sanctionne son auteur. Seul le propriétaire du serveur peut la configurer.

- `addblacklistedrole <role> [punishment]` et `removeblacklistedrole <role>`.
- `addblacklistedpermission <permission> [punishment]` et `removeblacklistedpermission <permission>`, par exemple `addblacklistedpermission Administrator Ban`.
- `setdefaultpunishment <punishment>` définit la sanction appliquée lorsqu'une entrée sur liste noire n'en a pas de propre. La valeur par défaut est `None`.
- `addwhitelisteduser @user`, `addwhitelistedrole <role>` et leurs équivalents `remove...` exemptent le personnel de la surveillance. Les modifications faites par les personnes sur liste blanche, ou qui les concernent, sont ignorées.
- `listblacklists` affiche tout ce qui précède.

Les valeurs de sanction sont `None`, `Warn`, `Mute`, `ChatMute`, `VoiceMute`, `Timeout`, `Kick`, `Softban`, `Ban`, `RemoveRoles`, `AddRole` et `Delete`. Lorsque plusieurs permissions sur liste noire sont ajoutées en même temps, la sanction la plus sévère l'emporte.

## Paramètres

Il n'existe aucune page sur le tableau de bord. Les seuls paramètres enregistrés concernent la surveillance des rôles et l'état du verrouillage.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Sanction par défaut | None | Appliquée lorsqu'un rôle ou une permission sur liste noire n'a pas de sanction définie |
| Rôles sur liste noire | aucun | Rôles retirés dès qu'ils sont attribués, avec une sanction facultative pour chacun |
| Permissions sur liste noire | aucune | Permissions annulées lorsqu'elles sont ajoutées à un rôle, avec une sanction facultative pour chacune |
| Utilisateurs et rôles sur liste blanche | aucun | Exemptés de la surveillance |
| Action du verrouillage des arrivées | Ban | Ce qui arrive aux membres qui rejoignent pendant un verrouillage des arrivées |

## Procédure de mise en place

1. Vérifiez que le rôle du bot se situe au-dessus de chaque rôle qu'il doit gérer, et qu'il possède Gérer les rôles et Gérer les salons.
2. Construisez la structure : `ccatc Community general off-topic memes` crée la catégorie et trois salons.
3. Créez les rôles d'un seul coup : `createroles Member Regular Veteran`.
4. Distribuez le rôle de base : `addtoallusers Member`, puis suivez-le avec `rolejobs`.
5. En tant que propriétaire du serveur, protégez-le : `addblacklistedpermission Administrator Ban` et `addwhitelistedrole Admin`.
6. Gardez `lockdown full kick` en tête pour les urgences, et testez `liftlockdown full` ensuite un jour calme.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Objet |
| --- | --- | --- | --- |
| `permview [@user or role]` | `pview` | Personne | Lister les permissions accordées |
| `setsplash <url>` | `setserversplash`, `setsplashimage` | Administrateur | Définir le splash d'invitation |
| `seticon <url>` | `setservericon`, `seticonimage` | Administrateur | Définir l'icône du serveur |
| `setbanner <url>` | `setserverbanner` | Administrateur | Définir la bannière du serveur |
| `setservername <name>` | | Administrateur | Renommer le serveur |
| `setguildavatar [url]` | `sgav`, `setgav` | Gérer le serveur | Avatar du bot sur ce serveur |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Gérer le serveur | Bannière du bot sur ce serveur |
| `setguildbio <text>` | `sgbio`, `setgbio` | Gérer le serveur | Biographie du bot sur ce serveur |
| `addemote <name> [url]` | `emoteadd`, `ae`, `ea` | Gérer les expressions | Importer un émoji |
| `removeemote <emote>` | `deleteemote`, `emoteremove`, `emotedelete` | Gérer les expressions | Supprimer un émoji |
| `renameemote <emote> <name>` | `emoterename` | Gérer les expressions | Renommer un émoji |
| `stealemotes <emotes...>` | `steal` | Gérer les expressions | Copier des émojis dans ce serveur |
| `sfr <role> <emotes...>` | | Gérer les expressions | Copier des émojis, limités à un rôle |
| `creatxtchanl <name>` | `ctch` | Gérer les salons | Créer un salon textuel |
| `creatvoichanl <name>` | `cvch` | Gérer les salons | Créer un salon vocal |
| `deltxtchanl <#channel>` | `dtch` | Gérer les salons | Supprimer un salon textuel |
| `delvoichanl <channel>` | `dvch` | Gérer les salons | Supprimer un salon vocal |
| `ccatc <category> <names...>` | | Gérer les salons | Nouvelle catégorie avec des salons textuels |
| `ccavc <category> <names...>` | | Gérer les salons | Nouvelle catégorie avec des salons vocaux |
| `cctc <category> <names...>` | | Gérer les salons | Salons textuels dans une catégorie existante |
| `ccvc <category> <names...>` | | Gérer les salons | Salons vocaux dans une catégorie existante |
| `renamechannel <channel> <name>` | `channelrename` | Gérer les salons | Renommer un salon |
| `setchanlname <name>` | `schn` | Gérer les salons | Renommer le salon actuel |
| `settopic [text]` | `st` | Gérer les salons | Définir ou effacer le sujet actuel |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Gérer les salons | Activer ou désactiver l'indicateur NSFW |
| `slowmode [time] [#channel]` | | Gérer les salons | Activer ou définir le mode lent |
| `lock [#channel]` | `channellock`, `lockchannel` | Gérer les messages | Refuser Envoyer des messages à tout le monde |
| `unlock [#channel]` | `channelunlock`, `unlockchannel` | Gérer les messages | Annuler `lock` |
| `nuke [#channel]` | `channelnuke`, `nukechannel` | Gérer les salons | Supprimer et recréer un salon |
| `permcontrol <channel> <allow|deny|inherit> <role or user> <perms...>` | `permc` | Gérer les salons | Modifier une dérogation de salon |
| `syncroletoall <role>` | `synctoall` | Gérer les salons | Copier une dérogation vers tous les salons et catégories |
| `syncroletoallchannels <role>` | `srtch`, `srtach` | Gérer les salons | Copier une dérogation vers les salons textuels |
| `syncroletoallcategories <role>` | `srtc`, `srtac` | Gérer les salons | Copier une dérogation vers les catégories |
| `createwebhook <#channel> <name> [avatar]` | `cwh` | Administrateur | Créer un webhook |
| `moveto <voice channel>` | | Personne | Vous déplacer |
| `moveuserto @user <voice channel>` | `moveuto` | Gérer les salons | Déplacer quelqu'un |
| `grab @user` | `getoverhere` | Personne | Faire venir quelqu'un dans votre salon vocal |
| `lockdown [joins|readonly|full] [kick|ban] [true]` | `lockdownserver` | Administrateur | Démarrer un verrouillage |
| `liftlockdown [type]` | `unlockserver` | Administrateur | Mettre fin à un verrouillage |
| `unlockdown` | `endlockdown` | Gérer les salons | Réactiver Envoyer des messages pour `@everyone` |
| `createrole [name]` | `cr` | Gérer les rôles | Créer un rôle |
| `deleterole <role>` | `dr` | Gérer les rôles | Supprimer un rôle |
| `renamerole <role> <name>` | `renr` | Gérer les rôles | Renommer un rôle |
| `rolecolor <role> [colour]` | `roleclr` | Gérer les rôles pour modifier | Afficher ou définir la couleur d'un rôle |
| `rolehoist <role>` | `rh` | Gérer les rôles | Activer ou désactiver l'affichage séparé |
| `setrole <role> @user [time]` | `sr`, `giverole` | Gérer les rôles | Attribuer un rôle, éventuellement temporaire |
| `removerole <role> @user` | `rr` | Gérer les rôles | Retirer un rôle |
| `removeallroles @user` | `rar` | Gérer les rôles | Retirer tous les rôles |
| `createroles <names...>` | `croles`, `crs` | Gérer les rôles | Créer plusieurs rôles |
| `deleteroles <roles...>` | `drs` | Gérer les rôles | Supprimer plusieurs rôles |
| `setroles @user [time] <roles...>` | `srs` | Gérer les rôles | Attribuer plusieurs rôles |
| `removeroles @user <roles...>` | `rrs` | Gérer les rôles | Retirer plusieurs rôles |
| `adduserstorole <role> @users...` | `autr` | Gérer les rôles | Attribuer un rôle à plusieurs membres |
| `removeusersfromrole <role> @users...` | `rufr` | Gérer les rôles | Retirer un rôle à plusieurs membres |
| `addtoall <role>` | `ata` | Gérer les rôles | Rôle pour chaque membre |
| `addtoallusers <role>` | `atau` | Gérer les rôles | Rôle pour chaque humain |
| `addtoallbots <role>` | `atab` | Gérer les rôles | Rôle pour chaque bot |
| `addtousersover <time> <role>` | `atuo` | Gérer les rôles | Rôle pour les membres arrivés il y a au moins ce délai |
| `addtousersunder <time> <role>` | `atuu` | Gérer les rôles | Rôle pour les membres arrivés plus récemment |
| `addroletorole <role> <role2>` | `artr` | Gérer les rôles | Rôle pour toutes les personnes ayant un autre rôle |
| `addthenremove <role> <role2>` | `atr` | Gérer les rôles | Remplacer un rôle par un autre |
| `removefromall <role>` | `rfa` | Gérer les rôles | Retirer à chaque membre |
| `removefromallusers <role>` | `rfau` | Gérer les rôles | Retirer à chaque humain |
| `removefromallbots <role>` | `rfab` | Gérer les rôles | Retirer à chaque bot |
| `removefromrole <role> <role2>` | `rfr` | Gérer les rôles | Retirer à toutes les personnes ayant un autre rôle |
| `rolejobs` | `rj` | Gérer les rôles | Lister les tâches de rôles en cours |
| `stopjob <number>` | `sj` | Gérer les rôles | Annuler une tâche |
| `exportrolelist` | `exportroles`, `erl` | Gérer les rôles | Télécharger les appartenances aux rôles |
| `importrolelist [true]` | `importroles`, `irl` | Gérer les rôles | Réappliquer une liste exportée |
| `addroletolist <role>` | `artl` | Gérer les rôles | Donner un rôle à une liste jointe d'identifiants d'utilisateurs |
| `setdefaultpunishment <action>` | `sdp`, `defaultpunishment`, `setdefpunishment` | Propriétaire du serveur | Sanction de repli de la surveillance des rôles |
| `addblacklistedrole <role> [action]` | `abr`, `blacklistrole`, `addbrole` | Propriétaire du serveur | Surveiller un rôle |
| `removeblacklistedrole <role>` | `rbr`, `unblacklistrole`, `removebrole` | Propriétaire du serveur | Arrêter de surveiller un rôle |
| `addblacklistedpermission <permission> [action]` | `abp`, `blacklistpermission`, `addbpermission` | Propriétaire du serveur | Surveiller une permission |
| `removeblacklistedpermission <permission>` | `rbp`, `unblacklistpermission`, `removebpermission` | Propriétaire du serveur | Arrêter de surveiller une permission |
| `addwhitelisteduser @user` | `awu`, `whitelistuser`, `addwuser` | Propriétaire du serveur | Exempter un membre |
| `removewhitelisteduser @user` | `rwu`, `unwhitelistuser`, `removewuser` | Propriétaire du serveur | Retirer une exemption |
| `addwhitelistedrole <role>` | `awr`, `whitelistrole`, `addwrole` | Propriétaire du serveur | Exempter un rôle |
| `removewhitelistedrole <role>` | `rwr`, `unwhitelistrole`, `removewrole` | Propriétaire du serveur | Retirer une exemption |
| `listblacklists` | `lbl`, `blacklists`, `listbws` | Propriétaire du serveur | Afficher les listes de la surveillance |

## Astuces et pièges

- Les commandes de rôles vérifient la hiérarchie deux fois : votre rôle le plus élevé et le rôle le plus élevé du bot doivent tous deux se situer au-dessus du rôle concerné. Le propriétaire du serveur ignore la vérification de son côté.
- Les tâches de masse prennent environ une seconde par membre. Ajouter un rôle à cinq mille membres prend bien plus d'une heure, et le bot refuse une sixième tâche simultanée.
- `syncroletoall` et ses variantes nécessitent que le rôle ait déjà une dérogation sur le salon où vous les exécutez ; c'est cette dérogation qui est copiée.
- `nuke` est irréversible, et la demande de confirmation est la seule protection.
- Un verrouillage en lecture seule modifie les dérogations de chaque salon, ce qui représente beaucoup d'appels à l'API sur les grands serveurs. Levez-le avec `liftlockdown`, et non à la main, afin que les dérogations sauvegardées soient restaurées.
- La surveillance des rôles repose sur le journal d'audit : le bot a donc besoin de Voir le journal d'audit, ainsi que de la permission nécessaire à la sanction que vous choisissez.
- Le vol d'émojis nécessite des emplacements d'émojis libres ; les échecs sont listés sous « Errored Emotes ».

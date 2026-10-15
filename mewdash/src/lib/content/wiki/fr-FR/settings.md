---
title: Paramètres
slug: settings
summary: Les bases à l'échelle du serveur : préfixe des commandes, langue, fuseau horaire, salons de journalisation, rôle muet, expiration des avertissements et quelques utilitaires de discussion.
icon: fa-cog
category: Settings
dashboard: /dashboard/settings
module: Administration
tags: [settings, prefix, language, locale, timezone, mute role, warn expire, command log, staff role, member role, snipe, link previews, delmsgoncmd, paramètres, préfixe, langue, paramètres régionaux, fuseau horaire, rôle muet, expiration avertissement, journal des commandes, rôle staff, rôle membre, snipe, aperçus de liens, delmsgoncmd]
related: [administration, logging, filter, suggestions]
---

## Fonctionnement

La page Paramètres regroupe les quelques options qui affectent tous les modules à la fois, plutôt qu'une seule fonctionnalité. C'est là que vous modifiez le préfixe que les membres tapent avant les commandes, la langue dans laquelle le bot répond, le fuseau horaire utilisé pour les rappels et les messages programmés, et les salons où sont journalisées l'utilisation des commandes et les avertissements.

Elle couvre aussi le nom du rôle muet, la question de savoir si un membre muet perd ses autres rôles, la durée de validité des avertissements, et deux utilitaires de discussion : la récupération des messages supprimés (sniping) et les aperçus des liens de messages.

La plupart de ces paramètres ont une commande textuelle correspondante, si bien que le staff peut aussi les modifier depuis Discord. Quelques options supplémentaires n'existent que sous forme de commandes : le rôle staff, le rôle membre et la suppression des messages de commande par salon.

## Pourquoi l'utiliser

- Votre serveur utilise déjà `.` pour un autre bot, et vous voulez que Mewdeko réponde sur `!` ou `m!`.
- Votre communauté parle une autre langue que l'anglais, et vous voulez que les réponses correspondent.
- Les rappels et les publications programmées doivent tomber à la bonne heure locale, et non en UTC.
- Les modérateurs veulent un salon qui enregistre chaque commande exécutée et chaque avertissement délivré.
- Les avertissements doivent disparaître après un nombre de jours défini, au lieu de s'accumuler indéfiniment.
- Les membres doivent pouvoir utiliser `snipe` pour récupérer un message supprimé, ou les aperçus de liens doivent être désactivés dans un salon très actif.

## Préfixe

Le préfixe est le texte qu'un membre tape avant une commande. Il vaut `.` par défaut. Chacun peut exécuter `prefix` sans argument pour voir le préfixe actuel. Les administrateurs le modifient avec `prefix <new>` ou, depuis le tableau de bord, avec la case **Préfixe de commande**. Les commandes slash ne sont pas affectées par le préfixe.

## Langue

Chaque serveur peut choisir sa propre langue de réponse avec `languageset <code>`, par exemple `languageset de`, ou avec la liste déroulante **Langue** du tableau de bord. `languageset default` supprime le paramètre spécifique pour que le serveur suive la langue par défaut du bot. `languageslist` affiche tous les codes de paramètres régionaux pris en charge. `langsetdefault` sans argument affiche la langue par défaut du bot ; la modifier relève du propriétaire du bot.

## Fuseau horaire

Le fuseau horaire du serveur régit les rappels, les messages programmés et tout affichage d'heure. `timezone` seul affiche la valeur actuelle (UTC si aucune n'est définie). `timezone <id>` la définit à l'aide d'un identifiant de fuseau IANA ou Windows, comme `Europe/London`, et `timezones` parcourt les identifiants acceptés par le bot. Sur le tableau de bord, **Fuseau horaire du serveur** enregistre la valeur dès que vous la choisissez ; il n'attend pas **Save Changes**.

## Salons de journalisation

**Salon du journal des commandes** enregistre l'utilisation des commandes. Définissez-le avec `commandlogchannel #channel` ; exécutez la commande sans salon pour désactiver la journalisation.

**Salon de journal des avertissements** enregistre les avertissements délivrés par les commandes de modération. Ce paramètre se définit depuis le tableau de bord.

## Avertissements

**Expiration des avertissements** est enregistré en heures. Zéro signifie que les avertissements n'expirent jamais. La commande `warnexpire` fonctionne en jours et prend un second mot : `warnexpire 30 clear` marque comme effacés les avertissements de plus de 30 jours, `warnexpire 30 delete` les supprime. La plage acceptée va de 0 à 366 jours, et `warnexpire 0` désactive l'expiration.

## Rôle muet et retrait des rôles

**Rôle de mise en sourdine** est le nom du rôle appliqué par les commandes de mute et les sanctions. Si aucun rôle portant ce nom n'existe, le bot le crée. Depuis Discord, `muterole @role` associe le paramètre à un rôle existant ; ce rôle doit être placé sous votre propre rôle le plus élevé, sauf si vous êtes propriétaire du serveur. `muterole` sans argument affiche le rôle muet actuel.

**Retirer tous les autres rôles pendant la mise en sourdine** retire les autres rôles d'un membre pendant toute la durée d'un mute, puis les lui rend. La forme de la commande est `removeonmute y` ou `removeonmute n`.

## Utilitaires de discussion

| Paramètre | Commande | Effet |
| --- | --- | --- |
| Message sniping | `snipeset enable` ou `snipeset disable` | Permet aux membres d'utiliser les commandes snipe pour récupérer les messages supprimés ou modifiés récemment. Désactivé par défaut. |
| Message link previews | `previewlinks y` ou `previewlinks n` | Lorsqu'une personne poste un lien vers un message Discord, le bot affiche le contenu de ce message. |

## Paramètres réservés aux commandes

Ces paramètres font partie du même module Administration, mais ne disposent d'aucun contrôle sur le tableau de bord.

**Staff role** (`staffrole @role`) désigne un rôle dont les membres sont exemptés des filtres de mots, de liens et d'invitations, ainsi que des contrôles anti-spam des suggestions. Exécutez `staffrole` sans rôle pour voir le rôle actuel, et `staffroledisable` pour le retirer.

**Member role** (`memberrole @role`) enregistre un rôle pour le serveur. Il est enregistré mais n'est utilisé par aucune fonctionnalité pour le moment.

**Delete message on command** (`delmsgoncmd`) supprime le message qui a déclenché une commande une fois la commande exécutée :

| Forme | Effet |
| --- | --- |
| `delmsgoncmd` | Active ou désactive la suppression pour tout le serveur |
| `delmsgoncmd list` | Affiche le paramètre du serveur et chaque exception par salon |
| `delmsgoncmd channel enable [#channel]` | Supprime toujours dans ce salon (salon actuel si omis) |
| `delmsgoncmd channel disable [#channel]` | Ne supprime jamais dans ce salon |
| `delmsgoncmd channel inherit [#channel]` | Suit le paramètre du serveur |

## Paramètres

Tout ce qui suit se trouve sur la page unique **Paramètres du bot**. Cliquez sur **Save Changes** après une modification ; seul **Fuseau horaire du serveur** s'enregistre seul.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Command Prefix | `.` | Texte tapé avant les commandes |
| Command Log Channel | aucun | Salon où est journalisée l'utilisation des commandes |
| Currency Emoji | aucun | Émoji affiché pour la monnaie du serveur |
| Warning Log Channel | aucun | Salon où sont journalisés les avertissements |
| Warning Expiry | 0 (jamais) | Nombre d'heures avant l'expiration des avertissements |
| Language | Langue par défaut du bot | Langue de réponse pour ce serveur |
| Server Timezone | UTC | Fuseau horaire des messages programmés, des rappels et des affichages d'heure |
| Mute Role | Muted | Nom du rôle appliqué par les mutes et les sanctions |
| Remove all other roles while muted | Désactivé | Retire les autres rôles pendant toute la durée d'un mute |
| Message sniping | Désactivé | Autorise les commandes snipe |
| Message link previews | Désactivé | Développe les liens de messages Discord |

> [!NOTE]
> La page ne couvre que les bases communes. La journalisation, la modération, le starboard et les autres fonctionnalités ont leurs propres pages et leurs propres paramètres.

## Pas à pas pour la configuration

1. Ouvrez **Paramètres** dans le tableau de bord.
2. Modifiez **Préfixe de commande** si `.` entre en conflit avec un autre bot.
3. Choisissez une **Langue** et un **Fuseau horaire du serveur**.
4. Choisissez un **Salon du journal des commandes** et un **Salon de journal des avertissements** que seul le staff peut lire.
5. Définissez **Expiration des avertissements** en heures, par exemple `720` pour trente jours, ou laissez 0.
6. Vérifiez que le nom du **Rôle de mise en sourdine** correspond au rôle que vos modérateurs utilisent déjà, ou laissez `Muted` et laissez le bot en créer un.
7. Activez **Snipe de messages** ou **Aperçus des liens de messages** si vous le souhaitez.
8. Cliquez sur **Save Changes**.
9. Dans Discord, exécutez `staffrole @YourStaffRole` pour que les filtres et les limites de suggestions ignorent votre équipe.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` si vous ne l'avez pas modifié).

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `prefix [new prefix]` | | Aucune pour consulter, Administrateur pour modifier | Afficher ou définir le préfixe des commandes |
| `languageset <code>` | `langset` | Administrateur | Définir la langue de réponse du serveur, ou `default` pour la supprimer |
| `langsetdefault` | `langsetd` | Aucune pour consulter, propriétaire du bot pour modifier | Afficher ou définir la langue par défaut à l'échelle du bot |
| `languageslist` | `langli` | Aucune | Lister les codes de paramètres régionaux pris en charge |
| `timezone [id]` | | Aucune pour consulter, Administrateur pour modifier | Afficher ou définir le fuseau horaire du serveur |
| `timezones` | | Aucune | Parcourir les identifiants de fuseaux horaires acceptés |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrateur | Définir le salon de journalisation des commandes, ou le désactiver sans salon |
| `warnexpire <days> <clear or delete>` | `warne` | Administrateur | Faire expirer les avertissements après un nombre de jours |
| `muterole [@role]` | `setmuterole` | Gérer les rôles | Afficher ou définir le rôle muet |
| `removeonmute <y or n>` | | Administrateur | Retirer les autres rôles pendant un mute |
| `snipeset <enable or disable>` | `setsnipe` | Administrateur | Autoriser ou bloquer les commandes snipe |
| `previewlinks <y or n>` | `plinks` | Administrateur | Développer les liens de messages Discord |
| `staffrole [@role]` | | Administrateur | Afficher ou définir le rôle staff |
| `staffroledisable` | | Administrateur | Supprimer le rôle staff |
| `memberrole [@role]` | | Administrateur | Afficher ou définir le rôle membre |
| `delmsgoncmd [list or channel <state> [#channel]]` | `dmc` | Administrateur | Supprimer les messages de commande à l'échelle du serveur ou par salon |

## Astuces et pièges

- `delmsgoncmd` nécessite que le bot ait la permission Gérer les messages, sinon la commande refuse de s'exécuter.
- Le tableau de bord enregistre l'expiration des avertissements en heures, alors que `warnexpire` utilise des jours. `warnexpire 1` et une valeur de `24` sur le tableau de bord correspondent à la même chose.
- `muterole` compare le rôle que vous indiquez à votre propre rôle le plus élevé. Si une erreur de permissions insuffisantes apparaît, demandez au propriétaire ou choisissez un rôle plus bas.
- Les commandes slash ignorent totalement le préfixe ; une modification du préfixe n'affecte donc que les commandes textuelles.
- L'exemption du rôle staff ne couvre que les filtres et les contrôles anti-spam des suggestions. Elle n'accorde pas de permissions de commandes ; utilisez le module Permissions pour cela.

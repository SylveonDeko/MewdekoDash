---
title: Succès
slug: achievements
summary: Les membres débloquent des succès pour leurs messages, leur activité vocale, leurs réactions, leurs invitations, leurs commandes, leurs niveaux et leur temps sur le serveur, gagnent des points qui font monter un rang qui leur est propre, et portent des badges sur leur profil. Distincts de l'XP, avec un lien facultatif entre les deux.
icon: fa-trophy
category: Community
dashboard: /dashboard/achievements
module: Achievements
tags: [achievements, badges, points, ranks, grades, unlocks, milestones, achievement cards, xp per point, achievements bot, succès, badges, points, rangs, grades, déblocages, jalons, cartes de succès, xp par point, bot de succès]
related: [xp, currency, reputation, statroles]
---

## Ce que cela fait

Les succès sont des objectifs que les membres atteignent en utilisant votre serveur : envoyer leur premier message, atteindre 250 messages, rejoindre un salon vocal, réagir avec de nombreux émojis différents, rester pendant des mois, booster le serveur. Chacun a un grade, chaque grade vaut des points, et les points déterminent le rang de succès d'un membre. Les membres exhibent ce qu'ils ont gagné grâce à jusqu'à quatre badges sur leur carte de profil.

Activer les succès comptabilise immédiatement l'historique. Les membres débloquent discrètement tout ce que leurs messages enregistrés, leur temps en vocal, leurs réactions, leurs invitations, leurs niveaux et leur temps sur le serveur leur ont déjà permis de gagner, sans la moindre annonce.

## Articulation avec l'XP

Les succès et l'XP sont deux systèmes distincts qui fonctionnent côte à côte. Aucun ne dépend de l'autre, et désactiver l'un ne touche pas à l'autre.

| | XP | Succès |
| --- | --- | --- |
| Gagnée par | Chaque message et chaque minute en vocal | Atteindre un objectif, une seule fois |
| Monte à travers | Les niveaux, selon la courbe d'XP | Un rang de succès, de Nouveau venu à Champion |
| Mesurée en | XP | Points issus du grade de chaque déblocage |
| Récompenses | Rôles de niveau et monnaie | Rôles, monnaie et XP propres à chaque succès |

Ils se connectent à exactement deux endroits :

1. **Les niveaux débloquent des succès.** La catégorie Community contient des succès pour atteindre des niveaux d'XP, de sorte que monter de niveau peut les débloquer.
2. **Les succès peuvent donner de l'XP, si vous le souhaitez.** Rien n'est donné par défaut. Attribuez à un seul succès une récompense d'XP, ou définissez **XP par point** dans l'onglet Settings pour que chaque déblocage rapporte de l'XP en fonction de ses points. Un déblocage Or vaut 50 points ; à 2 XP par point, il rapporte donc 100 XP.

Le rang de succès n'est pas votre niveau d'XP. Un membre peut être niveau 40 et de rang Bronze, ou niveau 3 et Or, parce que l'un mesure combien il discute et l'autre combien de choses différentes il a accomplies.

## Grades, points et rangs

| Grade | Points |
| --- | --- |
| Bronze | 10 |
| Argent | 25 |
| Or | 50 |
| Émeraude | 100 |
| Améthyste | 250 |
| Champion | 500 |

Les points s'additionnent pour former un rang :

| Rang | Points nécessaires |
| --- | --- |
| Nouveau venu | 0 |
| Bronze | 100 |
| Argent | 500 |
| Or | 1500 |
| Émeraude | 3500 |
| Améthyste | 7000 |
| Champion | 12000 |

Les succès personnalisés peuvent utiliser n'importe quel grade et remplacer les points.

## Catégories

Les succès intégrés sont regroupés en Messages, Voice, Reactions, Invites, Commands, Loyalty, Boosts et Community. Vous pouvez désactiver une catégorie entière, ou ajouter vos propres catégories avec leur nom, leur description et leur icône. Faites glisser les catégories dans l'onglet Categories pour modifier leur ordre partout où les membres les voient.

## Succès personnalisés

| Type | Se débloque lorsque |
| --- | --- |
| Goal | Un compteur atteint un nombre, par exemple 1000 messages ou 30 jours sur le serveur |
| Phrase | Un membre dit une phrase |
| Reaction | Un membre réagit avec un émoji |
| Manual | Le personnel l'attribue |

Chacun reçoit un nom, une description, un grade, une icône (un émoji, un émoji du serveur, une icône Font Awesome ou une image importée) et des récompenses facultatives : un rôle, de la monnaie et de l'XP. Marquez-en un comme secret pour masquer son nom et son objectif jusqu'à son déblocage.

## Annonces

| Mode | Où les déblocages sont publiés |
| --- | --- |
| Auto | Le salon de journal s'il est défini, sinon le salon où cela s'est produit |
| Here | Le salon où cela s'est produit |
| Log channel | Uniquement le salon de journal |
| DM only | Les messages privés du membre |
| Silent | Nulle part |

Plusieurs déblocages simultanés partagent un seul message. Les annonces comportent une carte image aux couleurs de votre serveur. Dans les salons, elles se suppriment d'elles-mêmes après 5 secondes, sauf si vous choisissez une durée plus longue ou Never. Les messages privés ne sont jamais supprimés. Les membres peuvent désactiver pour eux-mêmes les messages privés de déblocage, les messages du serveur et les mentions.

Deux règles empêchent les déblocages d'apparaître dans des salons où ils n'ont pas leur place :

| Règle | Ce qu'elle fait |
| --- | --- |
| Quiet channels | Salons que vous choisissez, comme un salon d'annonces. Les membres y gagnent toujours des succès, mais le déblocage n'y est jamais publié |
| Only post where the member can talk | Activé par défaut. Un déblocage n'est pas publié dans un salon où le membre ne peut pas envoyer de messages, comme un salon en lecture seule où il a réagi |

Lorsqu'une de ces règles empêche une publication, le déblocage est envoyé dans le salon de journal si vous en avez défini un, et ignoré sinon. Le salon de journal lui-même n'est jamais ignoré. Pour qu'un salon ne compte pas du tout, utilisez plutôt les salons exclus de l'onglet Settings.

## Cartes

L'onglet **Cartes** est un créateur pour l'image de déblocage. Faites glisser et redimensionnez le titre, l'icône, le grade, la progression, l'avatar et le reste, ajoutez des formes, du texte, des images et des icônes, et utilisez les couleurs de votre serveur comme jetons afin qu'une carte suive une nouvelle icône. Enregistrez jusqu'à vingt modèles, choisissez-en un par défaut, et assignez les autres à une catégorie ou à un seul succès. Le plus précis l'emporte.

## Paramètres des membres

Les membres choisissent qui peut voir leur carte de profil, leur liste de succès débloqués, leurs badges et leur place au classement, quels badges porter et comment ils souhaitent être notifiés. Tout cela se trouve aussi dans l'onglet **Me** des applications iOS et Android.

## Tableau de bord

| Onglet | À quoi il sert |
| --- | --- |
| Overview | Démarrer ou suspendre la progression, totaux des déblocages et déblocages récents |
| Achievements | Parcourir, rechercher, activer, modifier et créer des succès |
| Categories | Ordonner, renommer, activer et créer des catégories |
| Announcements | Où et comment les déblocages sont publiés, le message et la suppression automatique |
| Cards | Le créateur de cartes et les assignations |
| Members | Rechercher un membre, accorder, révoquer ou réinitialiser |
| Settings | Rôles et salons exclus, XP par point et succès secrets |

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les mêmes commandes existent sous `/achievements`.

| Commande | Alias | Nécessite | Objet |
| --- | --- | --- | --- |
| `achievements [@user]` | `achoverview`, `achs` | Personne | Rang, points et déblocages récents |
| `achcard [@user]` | `achprofile` | Personne | La carte de profil |
| `achlist [@user]` | `achall` | Personne | Chaque succès et sa progression |
| `achcategory <category> [@user]` | `achcat` | Personne | Une catégorie |
| `achview [@user] <achievement>` | `achimage` | Personne | Un succès sous forme de carte de déblocage |
| `achsearch <query>` | | Personne | Trouver un succès |
| `achleaderboard [sort]` | `achlb` | Personne | Le classement du serveur |
| `badges [@user]` | `badgeinv` | Personne | Badges possédés |
| `badgeequip <slot> <badge>` | `equipbadge` | Personne | Porter un badge dans l'emplacement 1 à 4 |
| `achprivacy <area> <everyone or onlyme>` | | Personne | Visibilité du profil, des succès, des badges ou du classement |
| `achnotify <dm, message or mention> <true or false>` | | Personne | Vos notifications de déblocage |
| `achtoggle` | | Gérer le serveur | Démarrer ou suspendre la progression |
| `achannounce <mode>` | | Gérer le serveur | Où les déblocages sont publiés |
| `achlogchannel [#channel]` | `achlog` | Gérer le serveur | Le salon de journal |
| `achxpperpoint <amount>` | | Gérer le serveur | XP par point de succès, 0 pour désactiver |
| `achcreate <metric> <goal> <grade> <name>` | | Gérer le serveur | Un succès à objectif |
| `achcreatephrase <phrase> <grade> <name>` | | Gérer le serveur | Un succès de phrase |
| `achcreatereaction <emoji> <grade> <name>` | | Gérer le serveur | Un succès de réaction |
| `achcreatemanual <grade> <name>` | | Gérer le serveur | Un succès manuel |
| `achrewardrole`, `achrewardcurrency`, `achrewardxp` | | Gérer le serveur | Ajouter une récompense à un succès |
| `achgrant <@user> <achievement>` | | Gérer le serveur | Attribuer un succès |
| `achrevoke <@user> <achievement>` | | Gérer le serveur | Retirer un succès |
| `achreset <@user>` | | Gérer le serveur | Effacer les succès d'un membre |

## Astuces et pièges

- Les récompenses sont aussi attribuées pour l'historique. Si vous définissez l'XP par point ou ajoutez des récompenses avant d'activer les succès, le premier balayage les verse pour tout ce que les membres ont déjà gagné. Définissez-les après si vous ne voulez récompenser que les nouveaux déblocages.
- L'XP issue des succès peut faire monter un membre de niveau, et un nouveau niveau peut débloquer un succès de niveau, qui peut lui-même rapporter davantage d'XP. Cela finit toujours par s'arrêter, car chaque succès ne se débloque qu'une fois.
- Les membres ayant un rôle exclu, ou dont l'activité se trouve dans un salon exclu, n'en tirent rien.

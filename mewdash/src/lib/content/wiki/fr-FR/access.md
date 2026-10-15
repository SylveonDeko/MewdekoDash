---
title: Accès au tableau de bord
slug: access
summary: Permettez à des membres ou rôles précis d'ouvrir le tableau de bord de votre serveur et de consulter ou gérer uniquement les sections que vous choisissez, sans en faire des administrateurs Discord.
icon: fa-key
category: Security
dashboard: /dashboard/access
tags: [dashboard access, permissions, grant, staff, restrict, who can edit, view, manage, managers, delegation, accès au tableau de bord, permissions, accorder, personnel, restreindre, qui peut modifier, consulter, gérer, gestionnaires, délégation]
related: [auditlog, administration]
---

## Ce que cela fait

Par défaut, seul le propriétaire du serveur et les membres disposant de la permission Administrateur peuvent ouvrir un serveur dans le tableau de bord. L'accès au tableau de bord vous permet d'élargir cela. Vous choisissez un membre ou un rôle, vous sélectionnez les sections du tableau de bord auxquelles il a droit, et vous définissez si chacune est en **Voir** (consultation) ou **Gérer** (gestion). Dès lors, ce serveur apparaît dans leur liste de serveurs du tableau de bord, et les sections que vous leur avez accordées fonctionnent pour eux ; tout le reste est refusé.

La vérification se fait sur l'API du bot, et non uniquement dans la page web. Chaque requête qui mentionne un serveur transporte l'identité de l'utilisateur connecté. S'il est propriétaire ou Administrateur, la requête passe. Sinon, le bot identifie la section à laquelle appartient la requête, considère les lectures comme **Voir** et toute modification comme **Gérer**, puis compare cela avec le meilleur niveau que l'utilisateur détient directement ou via l'un de ses rôles.

Le propriétaire du serveur décide aussi qui peut modifier la liste des accès elle-même. Par défaut, seul le propriétaire le peut. Il peut désigner des gestionnaires d'accès précis, ou activer un seul interrupteur pour permettre à quiconque disposant de la permission Administrateur ou Gérer le serveur de le faire.

## Pourquoi l'utiliser

- Une équipe communautaire gère les concours, les suggestions et les tickets depuis le tableau de bord sans avoir l'Administrateur sur Discord.
- Un rôle de modérateur reçoit **Gérer** sur Moderation et Logging, et **Voir** sur tout le reste, afin qu'il puisse consulter sans modifier les paramètres qui ne lui appartiennent pas.
- Un assistant du bot est autorisé à modifier l'XP et la monnaie, mais rien de lié à la sécurité.
- Le propriétaire délègue la maintenance de la liste des accès à un rôle de co-propriétaire, sans céder les contrôles réservés au propriétaire.

## Niveaux d'accès

| Niveau | Autorise |
| --- | --- |
| None | Rien pour cette section ; la section n'est pas accordée |
| View | Uniquement les requêtes de lecture, comme l'ouverture de la page et le chargement de ses données |
| Manage | Tout ce que View autorise, plus la création, la modification et la suppression |

Lorsqu'un membre correspond à plusieurs accès, par exemple un accès personnel et un accès par rôle, le niveau le plus élevé de chaque section l'emporte. Un membre qui a au moins une section accordée voit le serveur dans son sélecteur de serveurs du tableau de bord ; un membre sans aucun accès ne le voit pas.

Les propriétaires et les Administrateurs contournent entièrement les accès et disposent toujours d'un accès complet.

## Sections

Les sections correspondent à la barre latérale du tableau de bord. Chaque fonctionnalité du sélecteur correspond à une ou plusieurs zones de l'API du bot ; accorder « Administration » couvre donc à la fois les points d'accès Administration et Protection, et « Moderation » couvre aussi Protection. Le sélecteur regroupe les sections par catégorie de barre latérale, et les fonctionnalités qui relèvent de l'infrastructure globale du bot plutôt que des données propres à chaque serveur, comme Performance, ne peuvent pas être accordées.

Lorsqu'un accès couvre une fonctionnalité qui correspond à plusieurs zones, le sélecteur affiche le niveau le plus bas partagé entre elles ; définir le groupe définit toutes ses zones en même temps.

## Qui peut gérer la liste des accès

| Qui | Peut faire |
| --- | --- |
| Propriétaire du serveur | Tout : l'interrupteur de délégation, la liste des gestionnaires et tous les accès |
| Gestionnaires d'accès désignés | Ajouter, modifier et supprimer des accès |
| Membres disposant de Administrateur ou Gérer le serveur | Ajouter, modifier et supprimer des accès, uniquement lorsque l'interrupteur de délégation est activé |
| Tous les autres | Voient « You can't manage dashboard access here » |

Les gestionnaires d'accès peuvent être un membre ou un rôle. Seul le propriétaire peut voir ou modifier la liste des gestionnaires et l'interrupteur de délégation ; l'API refuse ces appels à toute autre personne.

> [!WARNING]
> Il est impossible d'accorder **Gérer** sur Dashboard Access, car le contrôleur d'accès est exempté des vérifications de section. Utilisez plutôt la liste des gestionnaires ou l'interrupteur de délégation pour déléguer le contrôle de la liste.

## Paramètres

Tout se trouve sur la page unique Dashboard Access.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Allow Administrators and Manage Guild members to manage dashboard access | Off | Sous **Paramètres de délégation**. Lorsqu'il est activé, les membres Administrateur et Gérer le serveur peuvent modifier les accès. Propriétaire uniquement. |
| Access Managers | aucun | Membres ou rôles désignés pour modifier les accès. Propriétaire uniquement. |
| Access Grants | aucun | Une entrée par membre ou rôle, listant un niveau par section. Gestionnaires et propriétaire. |

Le formulaire **Accorder un accès restreint** demande un type de cible (utilisateur ou rôle), la cible, et un niveau par groupe de fonctionnalités. Enregistrer un second accès pour la même cible remplace le premier. Modifier un accès existant ouvre le même formulaire, intitulé **Modifier l'accès**.

## Mise en place pas à pas

1. Ouvrez **Accès au tableau de bord** dans le tableau de bord en tant que propriétaire du serveur.
2. Décidez qui entretient la liste. Soit activez l'interrupteur de délégation sous **Paramètres de délégation**, soit ajoutez un membre ou un rôle sous **Access Managers**.
3. Sous **Accorder un accès restreint**, choisissez **Rôle** et sélectionnez le rôle de votre personnel.
4. Définissez **Gérer** sur les fonctionnalités qu'ils utilisent au quotidien et **Voir** sur celles qu'ils doivent seulement consulter. Laissez le reste sur **Aucun**.
5. Cliquez sur **Accorder l'accès**. L'accès apparaît sous **Access Grants**.
6. Demandez à un membre disposant de ce rôle de se connecter au tableau de bord. Le serveur devrait maintenant apparaître dans sa liste, avec seulement les pages accordées qui fonctionnent.

## Commandes

L'accès au tableau de bord se configure uniquement depuis le tableau de bord ; il n'existe aucune commande du bot pour cela.

## Astuces et pièges

- Les accès sont vérifiés par rapport à la liste des membres en cache du bot ; un membre doit donc être présent sur le serveur et visible par le bot pour que son accès fonctionne.
- Les accès par rôle suivent les rôles actuels du membre. Retirer le rôle supprime immédiatement l'accès.
- Un accès dont toutes les sections sont sur **Aucun** est considéré comme inexistant et supprimé ; le membre perd alors le serveur dans son sélecteur.
- Les Administrateurs conservent un accès complet quoi que disent les accès. Pour restreindre quelqu'un, retirez d'abord l'Administrateur sur Discord, puis accordez ici ce dont il a besoin.
- Le proxy du tableau de bord ajoute une clé API partagée à chaque requête, mais cette clé seule n'accorde jamais l'accès à un serveur ; l'identité de l'utilisateur connecté est toujours requise.
- Les points d'accès non liés à un serveur, comme la liste globale des commandes, ne sont pas soumis aux vérifications de section et continuent de fonctionner pour les utilisateurs restreints.

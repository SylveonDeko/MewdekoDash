---
title: Filtres de messages
slug: filter
summary: Supprimez les messages contenant des mots interdits, des invitations Discord ou des liens, avertissez éventuellement l'expéditeur, et bannissez immédiatement pour une liste distincte de mots à bannissement automatique.
icon: fa-filter
category: Security
dashboard: /dashboard/filter
module: Permissions
tags: [filter, word filter, invite filter, link filter, automod, auto ban, blacklist, banned words, regex, filtre, filtre de mots, filtre d'invitations, filtre de liens, modération automatique, bannissement automatique, liste noire, mots interdits, expression régulière]
related: [moderation, logging, administration]
---

## Ce que ça fait

Le filtre vérifie chaque message qu'un membre envoie ou modifie avant que les autres modules ne le voient. Si le message contient un mot filtré, une invitation Discord ou un lien à un endroit où ce filtre est actif, le bot le supprime. Vous pouvez aussi faire en sorte que le bot émette un avertissement via le système de modération et envoie au membre un MP expliquant ce qui a été retiré.

Une seconde liste, les mots à bannissement automatique, est plus stricte. Un message qui correspond à un mot à bannissement automatique est supprimé et son auteur est immédiatement banni, avec un MP contenant la raison lorsque le bot peut en envoyer un.

Les administrateurs et toute personne disposant du rôle de staff du serveur (défini avec `staffrole`) ne sont jamais filtrés. Les messages des bots ne sont pas vérifiés non plus.

## Pourquoi l'utiliser

- Empêcher les insultes et autres termes interdits d'apparaître dans le chat sans modérateur en ligne.
- Empêcher les membres de faire la publicité d'autres serveurs en postant des liens d'invitation.
- Rendre un salon uniquement textuel en supprimant tout message contenant une URL, par exemple un salon d'annonces sans média.
- Bannir instantanément les comptes qui publient des phrases d'arnaque connues ou des signatures de raid.

## Types de filtres

| Filtre | Où il s'applique | Ce qui se passe |
| --- | --- | --- |
| Filtre de mots | Uniquement dans les salons de la liste des salons du filtre de mots | Message supprimé ; avertissement et MP si **Avertir pour un mot filtré** est activé |
| Filtre d'invitations | Partout lorsque l'interrupteur du serveur est activé et que la liste des salons est vide, ou uniquement dans les salons listés lorsque la liste contient des entrées | Message supprimé ; avertissement et MP si **Avertir pour un lien d'invitation** est activé |
| Filtre de liens | Partout lorsque l'interrupteur du serveur est activé, plus tout salon de sa liste | Message supprimé, sans avertissement |
| Mots à bannissement automatique | Partout | Message supprimé, auteur averti par MP et banni |

Les trois listes de salons correspondent aux **Remplacements par salon** du tableau de bord. Notez que le filtre de mots est entièrement piloté par sa liste de salons : un salon doit y figurer pour que les mots y soient vérifiés.

## Comment les mots sont reconnus

Les mots filtrés et les mots à bannissement automatique sont traités comme des expressions régulières et testés sur le contenu du message en minuscules. Un mot simple comme `example` fonctionne comme une correspondance de sous-chaîne, de sorte que `examples` est aussi détecté. Les motifs qui ne se compilent pas sont retirés automatiquement de la liste. Chaque motif dispose d'un délai de correspondance de 250 millisecondes.

Les mots filtrés sont enregistrés en minuscules et comparés sans tenir compte de la casse. Les motifs de bannissement automatique sont enregistrés tels qu'ils ont été saisis et comparés au texte en minuscules ; écrivez-les donc en minuscules.

> [!WARNING]
> Les motifs de bannissement automatique sont puissants. Un motif court comme `ban` à l'intérieur d'un mot plus long bannira les personnes qui tapent « banana ». Testez d'abord les motifs comme mots filtrés.

## Avertissements

Activer **Avertir pour un mot filtré** ou **Avertir pour un lien d'invitation** fait en sorte que le bot ajoute un avertissement via le module de modération, avec la raison « Warned for Filtered Word » ou la raison d'avertissement d'invitation, puis envoie un MP au membre. Les sanctions d'avertissement configurées sur la page Modération s'appliquent normalement ; trois passages du filtre peuvent donc aboutir à un mute ou à une expulsion si c'est ainsi que les avertissements sont configurés.

Les bannissements automatiques utilisent les paramètres de purge de bannissement du module de modération pour l'action « Filter » afin de déterminer le nombre de jours de messages à supprimer.

## Paramètres

La page Filtres de messages comporte quatre onglets : **Filtres**, **Mots filtrés**, **Mots à bannissement automatique** et **Remplacements par salon**.

| Paramètre | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Filtre de mots | Désactivé | Interrupteur global au serveur affiché dans l'onglet Filtres |
| Filtre d'invitations | Désactivé | Supprime les liens d'invitation Discord ; nécessaire pour que la liste de salons du filtre d'invitations ait un effet |
| Filtre de liens | Désactivé | Supprime tout message contenant une URL sur l'ensemble du serveur |
| Avertir pour un mot filtré | Désactivé | Ajoute un avertissement et envoie un MP au membre lorsqu'un mot filtré est retiré |
| Avertir pour un lien d'invitation | Désactivé | Ajoute un avertissement et envoie un MP au membre lorsqu'une invitation est retirée |
| Mots filtrés | aucun | Liste dans l'onglet Mots filtrés, avec suppression par mot, un bouton **Tout effacer** qui fait la même chose que `fwclear`, et une zone de recherche dès que la liste dépasse dix mots |
| Mots à bannissement automatique | aucun | Liste dans l'onglet Mots à bannissement automatique |
| Salons du filtre de mots | aucun | Salons où la liste de mots est appliquée |
| Salons du filtre d'invitations | aucun | Restreint le filtre d'invitations à ces salons lorsqu'il n'est pas vide |
| Salons du filtre de liens | aucun | Salons supplémentaires où les liens sont supprimés même si l'interrupteur du serveur est désactivé |

En haut de la page, des compteurs indiquent le nombre de mots filtrés, de mots à bannissement automatique et de remplacements par salon.

## Guide de configuration

1. Ouvrez **Filtres de messages** dans le tableau de bord.
2. Dans l'onglet **Mots filtrés**, ajoutez chaque mot ou expression et cliquez sur ajouter.
3. Dans **Remplacements par salon**, ajoutez chaque salon où la liste de mots doit s'appliquer sous **Salons du filtre de mots**.
4. Revenez sur **Filtres**, activez **Filtre d'invitations** si vous voulez que les invitations soient supprimées partout, et **Avertir pour un lien d'invitation** si cela doit compter comme un avertissement.
5. Vous pouvez éventuellement ajouter quelques motifs très fiables dans l'onglet **Mots à bannissement automatique**.
6. Exécutez `staffrole @Moderators` pour exempter votre équipe, puis publiez un mot filtré depuis un compte normal pour vérifier qu'il est supprimé.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `filterword <word>` | `fw` | Personne | Ajouter un mot à la liste de filtrage, ou le retirer s'il est déjà présent |
| `lstfilterwords` | `lfw` | Personne | Parcourir la liste des mots filtrés |
| `fwclear` | | Administrateur | Retirer tous les mots filtrés, vider la liste des salons de mots et désactiver l'interrupteur du serveur |
| `srvrfilterwords` | `sfw` | Personne | Activer ou désactiver l'interrupteur global du filtre de mots |
| `chnlfilterwords` | `cfw` | Personne | Ajouter ou retirer le salon actuel de la liste des salons du filtre de mots |
| `srvrfilterinv` | `sfi` | Personne | Activer ou désactiver le filtre d'invitations global |
| `chnlfilterinv` | `cfi` | Personne | Ajouter ou retirer le salon actuel de la liste des salons du filtre d'invitations |
| `srvrfilterlin` | `sfl` | Personne | Activer ou désactiver le filtre de liens global |
| `chnlfilterlin` | `cfl` | Personne | Ajouter ou retirer le salon actuel de la liste des salons du filtre de liens |
| `fwarn <y or n>` | `filteredwarn` | Administrateur | Activer ou désactiver les avertissements pour les mots filtrés |
| `invwarn <y or n>` | `invitewarn` | Administrateur | Activer ou désactiver les avertissements pour les liens d'invitation |
| `autobanword <pattern>` | `autobanw` | Administrateur | Ajouter un motif à la liste de bannissement automatique, ou le retirer s'il est déjà présent |
| `autobanwordlist` | `autobwlist` | Administrateur | Parcourir la liste de bannissement automatique |

> [!PERMISSION]
> Les interrupteurs de filtre et `filterword` n'ont aucune vérification de permission propre. Utilisez le module Permissions pour les restreindre, ou gérez les filtres depuis le tableau de bord où les règles d'accès au tableau de bord s'appliquent.

## Astuces et pièges

- Le bot a besoin de la permission **Gérer les messages** dans chaque salon filtré, et de **Bannir des membres** pour les mots à bannissement automatique.
- Les messages modifiés sont revérifiés ; modifier un message ancien pour y ajouter un lien entraîne donc tout de même sa suppression.
- Les filtres ne s'appliquent pas aux administrateurs, au rôle de staff ni aux bots. Ne testez pas avec un compte administrateur.
- `fwclear` fait plus que vider la liste : il supprime aussi tous les remplacements de salons du filtre de mots.
- Une expression régulière invalide est silencieusement retirée de la liste. Si un mot disparaît, vérifiez qu'il ne contient pas de caractères non échappés comme `(`, `[` ou `*`.
- Journalisez les suppressions de messages avec la fonctionnalité Journalisation si vous voulez un registre de ce que le filtre a retiré.

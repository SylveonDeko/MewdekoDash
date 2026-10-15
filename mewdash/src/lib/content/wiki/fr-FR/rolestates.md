---
title: États des rôles
slug: rolestates
summary: Mémorisez les rôles qu'un membre avait lorsqu'il a quitté le serveur, et rendez-les-lui automatiquement lorsqu'il revient.
icon: fa-tag
category: Actions
dashboard: /dashboard/rolestates
module: RoleStates
tags: [role states, role persistence, restore roles, rejoin, saved roles, role backup, transfer roles, états des rôles, persistance des rôles, restaurer les rôles, retour, rôles sauvegardés, sauvegarde des rôles, transfert de rôles]
related: [administration, statusroles]
---

## Ce que cela fait

Lorsque les États des rôles sont activés, le bot surveille les départs de membres. Au moment où quelqu'un quitte le serveur, il enregistre la liste des rôles qu'il possédait à ce moment-là. Si cette personne revient plus tard, le bot lui rend chaque rôle enregistré, afin qu'elle n'ait pas à demander au personnel d'être à nouveau vérifiée ou réattribuée.

Du point de vue du membre, rien ne change au départ. Au retour, ses rôles sont simplement de nouveau là, généralement avant qu'il ait fini de lire le salon de bienvenue.

Le personnel dispose, pour chaque membre, d'une liste de rôles enregistrés qu'il peut consulter, modifier ou supprimer, d'une liste d'exclusion pour les rôles qui ne doivent jamais être restaurés, et d'une action groupée « enregistrer tout le monde maintenant ». Cela permet à la fonctionnalité de couvrir aussi les membres qui étaient déjà sur le serveur avant son activation.

## Pourquoi l'utiliser

- Les membres vérifiés qui partent par accident, ou pour couper les notifications, reviennent sans perdre leurs accès.
- Les rôles de couleur, de mention et de loisirs choisis dans un menu de rôles par réaction survivent à un retour.
- Les serveurs dotés d'un processus de vérification manuelle évitent de revérifier des personnes déjà approuvées.
- Vous pouvez choisir précisément les rôles qui ne doivent jamais revenir, comme un rôle de sourdine temporaire ou un rôle du personnel.
- Déménager une communauté vers un nouveau serveur : les états des rôles peuvent être transférés et associés aux rôles de même nom.

## Comment un état de rôles est enregistré

Lorsqu'un membre part, le bot vérifie :

1. Que les États des rôles sont activés pour le serveur.
2. Que **Ignore Bots** est désactivé, ou que le membre n'est pas un bot.
3. Que le membre ne figure pas dans la liste **Utilisateurs refusés**.

Si tout cela est validé, il prend les rôles actuels du membre, retire le rôle `@everyone` et les rôles gérés (rôles de bots, rôle booster, rôles d'intégrations), puis retire tout ce qui figure dans la liste **Rôles refusés**. S'il ne reste rien, rien n'est enregistré. Sinon, la liste remplace ce qui était stocké auparavant pour ce membre.

Les bannissements sont traités à part. Avec **Clear on Ban** activé, bannir un membre supprime son état enregistré, de sorte qu'un débannissement suivi d'un retour ne restaure rien.

## Comment un état de rôles est restauré

Lors de l'arrivée, le bot vérifie à nouveau que la fonctionnalité est activée, que les bots ne sont pas ignorés (si le membre est un bot), et que l'utilisateur ne figure pas dans la liste d'exclusion. Il ajoute ensuite chaque rôle enregistré en une seule requête. Les rôles qui n'existent plus, ou qui sont au-dessus du rôle le plus élevé du bot, font échouer cette requête, et l'échec est seulement consigné.

> [!PERMISSION]
> Le bot a besoin de la permission Gérer les rôles, et son rôle le plus élevé doit être au-dessus de chaque rôle qu'il est censé rendre.

### Ignorer les rôles d'attribution automatique

Si vous utilisez aussi les rôles d'attribution automatique du module Administration, un membre qui revient recevrait normalement à la fois les rôles enregistrés et les rôles d'attribution automatique. Activer **skip auto-assign** avec `togglerolestatesskipautoassign` fait en sorte que le bot ignore les rôles d'attribution automatique pour toute personne ayant un état de rôles enregistré, de sorte que les membres qui reviennent ne reçoivent que ce qu'ils avaient auparavant. Cette option n'existe qu'en commande ; elle ne figure pas sur le tableau de bord.

## Gérer les états enregistrés à la main

Le personnel peut créer ou ajuster l'état d'un membre sans attendre qu'il parte :

- `setuserrolestate` remplace la liste enregistrée d'un membre par les rôles que vous indiquez. Les rôles gérés et `@everyone` sont retirés.
- `addrolestorolestate` et `removerolesfromrolestate` modifient une liste enregistrée existante.
- `deleteuserrolestate` oublie entièrement un membre.
- `saveallrolestates` prend un instantané de chaque membre actuel d'un coup, en appliquant les mêmes filtres de bots et d'exclusion qu'un enregistrement automatique.

Le tableau de bord ajoute une chose que les commandes n'ont pas : **Copier l'état des rôles**, qui prend les rôles enregistrés d'un membre et les applique directement à un autre membre actuellement présent sur le serveur.

## Transfert vers un autre serveur

`transferrolestates <serverId>` copie chaque état enregistré du serveur actuel vers un autre serveur où se trouve le bot. Les rôles sont associés par leur nom, sans tenir compte de la casse, et les rôles gérés sont ignorés. Les membres dont les rôles enregistrés n'ont pas de correspondance par nom sur le serveur cible sont ignorés. Le serveur cible a automatiquement les États des rôles activés s'ils ne l'étaient pas, et hérite des valeurs **Ignore Bots** et **Clear on Ban** de la source lorsqu'il n'a pas ses propres paramètres.

## Paramètres

L'onglet **Paramètres** de la page États des rôles comporte deux sous-onglets, **Général** et **Refusée**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Role States | Désactivé | Interrupteur principal pour l'enregistrement et la restauration |
| Clear on Ban | Désactivé | Supprime l'état enregistré d'un membre lorsqu'il est banni |
| Ignore Bots | Désactivé | N'enregistre ni ne restaure les rôles des comptes bots |
| Save Current States | bouton | Prend immédiatement un instantané des rôles de chaque membre actuel |
| Denied Roles | aucun | Rôles qui ne sont jamais enregistrés, et donc jamais restaurés |
| Denied Users | aucun | Membres dont les rôles ne sont jamais enregistrés ni restaurés |

L'onglet **Gestion** contient **Gérer les rôles des utilisateurs** (ajouter ou retirer des rôles sélectionnés de l'état enregistré d'un membre) et **Copier l'état des rôles**. L'onglet **États de rôles** liste chaque état enregistré avec le nom, l'identifiant et les rôles du membre, et permet d'afficher les détails ou de supprimer une entrée.

## Guide de configuration

1. Assurez-vous que le rôle du bot est au-dessus de chaque rôle que vous voulez qu'il restaure.
2. Ouvrez **États de rôles** dans le tableau de bord et activez **États de rôles** sous **Paramètres**, **Général**.
3. Activez **Ignore Bots**, sauf si vous voulez spécifiquement que les rôles des bots soient mémorisés.
4. Décidez de **Clear on Ban**. Laissez-le désactivé si vous voulez que les membres débannis récupèrent leurs rôles.
5. Dans **Refusée**, ajoutez aux **Rôles refusés** les rôles du personnel, les rôles de sanction et tout rôle temporaire.
6. Cliquez sur **Tout enregistrer** sous **Enregistrer les états actuels** pour que les membres existants soient couverts à partir d'aujourd'hui.
7. Consultez l'onglet **États de rôles** pour confirmer que l'instantané s'est bien rempli.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Chaque commande de ce module nécessite la permission Administrateur.

| Commande | Alias | Nécessite | Objectif |
| --- | --- | --- | --- |
| `togglerolestates` | `trs` | Administrateur | Activer ou désactiver les États des rôles |
| `viewrolestatessettings` | `vrss` | Administrateur | Afficher les paramètres actuels et les listes d'exclusion |
| `viewuserrolestates` | `viewrolestates`, `vurs` | Administrateur | Parcourir chaque état enregistré |
| `saveallrolestates` | `saveserverstates`, `backuprolestates` | Administrateur | Prendre un instantané de chaque membre actuel |
| `transferrolestates <serverId>` | `copyrolestates`, `moverolestates` | Administrateur | Copier les états vers un autre serveur, en associant les rôles par nom |
| `togglerolestatesignorebots` | `trsib` | Administrateur | Activer ou désactiver l'exclusion des comptes bots |
| `togglerolestatesclearonban` | `trscob` | Administrateur | Activer ou désactiver la suppression d'un état lors d'un bannissement |
| `togglerolestatesskipautoassign` | `trssaa`, `rsskipautoassign` | Administrateur | Activer ou désactiver l'ignorance des rôles d'attribution automatique pour les membres ayant un état enregistré |
| `rolestatesadddenyrole @role...` | `rsadr` | Administrateur | Ajouter des rôles à la liste d'exclusion |
| `rolestatesremovedenyrole @role...` | `rsrra` | Administrateur | Retirer des rôles de la liste d'exclusion |
| `rolestatesadddenyuser @user...` | `rsadu` | Administrateur | Ajouter des membres à la liste d'exclusion |
| `rolestatesremovedenyuser @user...` | `rolestatesremoveadduser`, `rsrau` | Administrateur | Retirer des membres de la liste d'exclusion |
| `setuserrolestate @user @role...` | `surs` | Administrateur | Remplacer les rôles enregistrés d'un membre |
| `addrolestorolestate @user @role...` | `arsrs` | Administrateur | Ajouter des rôles à l'état enregistré d'un membre |
| `removerolesfromrolestate @user @role...` | `rrfrs` | Administrateur | Retirer des rôles de l'état enregistré d'un membre |
| `deleteuserrolestate @user` | `dur` | Administrateur | Oublier l'état enregistré d'un membre |

Les équivalents slash se trouvent sous `/rolestates`.

## Astuces et pièges

- Rien n'est enregistré pour les membres déjà présents lorsque vous avez activé la fonctionnalité, tant qu'ils ne partent pas ou que vous n'exécutez pas **Tout enregistrer**. Lancez-le une fois juste après la configuration.
- Seuls les départs déclenchent un enregistrement. Les expulsions comptent comme des départs. Les bannissements comptent aussi comme des départs, et l'état est ensuite supprimé à nouveau si **Clear on Ban** est activé.
- La restauration utilise un seul appel d'ajout de rôles. Un rôle manquant ou trop élevé fait échouer silencieusement toute la restauration ; gardez donc la liste d'exclusion à jour lorsque vous supprimez ou réordonnez des rôles.
- Les rôles gérés (rôles d'intégration des bots, rôle booster) ne sont jamais enregistrés. Discord les attribue lui-même.
- `viewuserrolestates` affiche trois membres par page.
- `setuserrolestate` et `deleteuserrolestate` acceptent tous deux un utilisateur qui a déjà quitté le serveur, ce qui permet de corriger un état avant que la personne ne revienne.
- Denied Users n'affecte que les enregistrements et restaurations automatiques. Les commandes manuelles et **Copier l'état des rôles** fonctionnent toujours sur ces membres.

---
title: Listes de tâches
slug: todo
summary: Listes de tâches partagées et personnelles dans Discord, avec priorités, échéances, étiquettes, recherche et permissions par personne.
icon: fa-check
category: Community
dashboard: /dashboard/todo
module: Todo
tags: [todo, tasks, task list, checklist, project, due date, priority, tags, permissions, todo, tâches, liste de tâches, liste de contrôle, projet, échéance, priorité, étiquettes, permissions]
related: [administration, tickets]
---

## Fonctionnement

Les listes de tâches donnent à votre serveur des listes de tâches gérées par le bot. Un membre crée une liste, y ajoute des éléments, les marque comme terminés, et peut accorder l'accès à d'autres personnes pour qu'elles puissent consulter ou travailler sur la même liste. Le staff disposant de la permission Gérer le serveur peut créer des listes à l'échelle du serveur que tous les membres peuvent voir.

Chaque élément possède un titre, une description facultative, une priorité de 1 à 4, des étiquettes facultatives, une date d'échéance facultative et une heure de rappel facultative. Les éléments conservent une position, ce qui permet de les réordonner, et les éléments terminés sont marqués avec la personne qui les a achevés et la date.

Il existe deux types de listes. Une liste personnelle appartient à un membre et reste invisible pour les autres, sauf si le propriétaire accorde un accès. Une liste de serveur appartient au serveur ; elle est publique par défaut, donc tout le monde peut la consulter, mais seules les personnes disposant d'une permission explicite peuvent ajouter ou modifier des éléments.

Les listes s'affichent sous forme d'embeds dans Discord et de cartes sur le tableau de bord. Le tableau de bord suit aussi la progression, le nombre d'échéances dépassées et le taux d'achèvement de la liste ouverte.

## Pourquoi l'utiliser

- Une équipe de modération suit les tâches en attente dans une seule liste de serveur, au lieu d'un message épinglé qui devient obsolète.
- Les organisateurs d'événements partagent une liste de contrôle et cochent les éléments au fil de l'avancement.
- Les membres gardent une liste privée des choses à suivre sur le serveur.
- Un salon de projet a besoin d'étiquettes et de priorités pour que les éléments « critique » se distinguent des éléments « faible ».

## Listes et permissions

Chaque liste a un propriétaire, la personne qui l'a créée. Le propriétaire peut tout faire sur cette liste. Les autres personnes obtiennent un accès via des permissions, accordées par utilisateur avec `todogrant`.

| Permission | Ce qu'elle autorise |
| --- | --- |
| `view` | Voir la liste et ses éléments |
| `add` | Ajouter de nouveaux éléments |
| `edit` | Modifier, étiqueter, réordonner et définir des dates sur les éléments d'autres personnes |
| `complete` | Terminer les éléments d'autres personnes |
| `delete` | Supprimer les éléments d'autres personnes |
| `manage` | Modifier les paramètres de la liste, la supprimer, accorder et retirer des accès |
| `all` | Toutes les permissions ci-dessus |

Passez plusieurs permissions sous forme de chaîne séparée par des virgules, par exemple `todogrant 12 @user view,add,complete`. Accorder à nouveau remplace les permissions précédentes de cet utilisateur. `todorevoke` les retire toutes.

Deux règles s'appliquent quelles que soient les permissions : la personne qui a créé un élément peut toujours modifier, terminer et supprimer son propre élément, et le propriétaire de la liste peut toujours tout faire.

Qui peut voir une liste :

| Type de liste | Publique | Qui peut la consulter |
| --- | --- | --- |
| Personnelle | peu importe | Le propriétaire, et toute personne ayant reçu `view` |
| Serveur | oui (par défaut) | Tous les membres du serveur |
| Serveur | non | Le propriétaire, et toute personne ayant reçu `view` |

`todotoggleprivacy` fait basculer une liste entre publique et privée. Seul le propriétaire ou une personne disposant de `manage` peut le faire.

## Éléments

| Champ | Valeur par défaut | Remarques |
| --- | --- | --- |
| Titre | obligatoire | Affiché en gras dans la liste |
| Description | aucune | Affichée en italique sous le titre |
| Priorité | 1 (Faible) via les commandes, Moyenne sur le tableau de bord | 1 Faible, 2 Moyenne, 3 Élevée, 4 Critique. Toute valeur en dehors de 1 à 4 est ramenée dans cette plage |
| Échéance | aucune | Affichée sous forme d'horodatage Discord relatif à côté du titre |
| Heure de rappel | aucune | Enregistrée sur l'élément et définie avec `todosetreminder` |
| Étiquettes | aucune | Insensibles à la casse ; ajouter une étiquette déjà présente ne change rien |
| Position | fin de liste | Modifiable avec `todoreorder` |

`todoshow` affiche les éléments en attente triés par position, puis par priorité, puis par date de création. Passez `true` en second argument pour afficher aussi jusqu'à cinq éléments terminés, avec la date de leur achèvement. Les dates pour `todosetdue` et `todosetreminder` sont interprétées de façon souple : `2026-10-01 18:00` et `October 1 2026` fonctionnent tous les deux.

`todosearch` recherche la requête dans les titres, descriptions et étiquettes des éléments en attente, et affiche jusqu'à dix résultats. `todofilter` restreint une liste à une seule étiquette (`todofilter 12 tag bug`) ou à une priorité (`todofilter 12 priority 4`).

Chaque liste peut avoir une couleur hexadécimale, définie avec `todosetcolor 12 #ff8800`, utilisée pour la bordure de l'embed. La valeur par défaut est `#7289da`.

## Paramètres

Il n'existe aucun paramètre à l'échelle du serveur. Tout se règle par liste ou par élément.

La page Listes de tâches n'a qu'une seule vue. Sur la gauche, elle affiche chaque liste que vous pouvez voir, avec une zone **Search todo lists**, un interrupteur **Afficher les tâches terminées** et **Trier par** (Priority, Due Date, Created, Title) accompagné d'un sélecteur d'ordre. Sélectionner une liste affiche ses éléments avec les boutons **Add Item** et **Delete List**, un éditeur d'élément avec **Priorité** et **Échéance**, et un bouton **Gérer les permissions** pour chaque liste.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Nom et description de la liste | obligatoire, aucune | Définis lors de la création d'une liste via le bouton **Créer une liste** |
| Priority (élément) | Medium | La priorité de l'élément ; affichée sous forme de pastille colorée |
| Due date (élément) | aucune | Échéance utilisée pour le compteur des retards |
| Show completed items | désactivé | Indique si les éléments terminés apparaissent dans la vue de la liste |

> [!NOTE]
> Les listes créées depuis le tableau de bord sont toujours des listes de serveur. Créez les listes personnelles avec `todocreatelist` dans Discord.

## Pas à pas pour la configuration

1. Ouvrez **Listes de tâches** dans le tableau de bord et cliquez sur **Créer une liste**.
2. Saisissez un nom et une description facultative. La liste est créée comme liste publique de serveur.
3. Cliquez sur la liste, puis sur **Add Item**. Renseignez **Que faut-il faire ?**, une description facultative et une priorité.
4. Utilisez **Gérer les permissions** sur la carte de la liste pour voir qui y a accès. Accordez l'accès depuis Discord avec `todogrant <listId> @user add,complete` pour que ces personnes puissent travailler dessus.
5. Dans Discord, exécutez `todolists` pour obtenir l'ID de la liste, puis `todoshow <listId>` pour vérifier l'affichage.
6. Marquez les éléments comme terminés avec `todocomplete <itemId>` ; l'ID de l'élément est affiché entre accents graves dans `todoshow`.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` si vous ne l'avez pas modifié). Les ID des listes et des éléments proviennent de `todolists` et `todoshow`.

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `todocreatelist <name> [description]` | `tcl` | Aucune | Créer une liste personnelle |
| `todocreateserverlist <name> [description]` | `tcsl` | Gérer le serveur | Créer une liste à l'échelle du serveur |
| `todolists [includeServer]` | | Aucune | Lister les listes que vous pouvez voir ; passez `false` pour les listes personnelles uniquement |
| `tododeletelist <listId>` | `tdl` | Aucune | Supprimer une liste et tous ses éléments (propriétaire ou `manage`) |
| `todoshow <listId> [includeCompleted]` | `ts` | Aucune | Afficher les éléments d'une liste |
| `todoadd <listId> <title> [description]` | `ta` | Aucune | Ajouter un élément de priorité Faible |
| `todoaddpriority <listId> <priority> <title> [description]` | `tap` | Aucune | Ajouter un élément avec une priorité de 1 à 4 |
| `todoedit <itemId> <title> [description]` | `te` | Aucune | Modifier le titre et la description d'un élément |
| `todocomplete <itemId>` | `tc` | Aucune | Marquer un élément comme terminé |
| `tododelete <itemId>` | `td` | Aucune | Supprimer un élément |
| `todoreorder <itemId> <position>` | `tr` | Aucune | Déplacer un élément à une position à partir de 1 |
| `todosetdue <itemId> <date>` | `tsd` | Aucune | Définir une échéance |
| `todocleardue <itemId>` | `tcd` | Aucune | Supprimer l'échéance |
| `todosetreminder <itemId> <date>` | `tsr` | Aucune | Définir une heure de rappel |
| `todoclearreminder <itemId>` | `tcr` | Aucune | Supprimer l'heure de rappel |
| `todoaddtag <itemId> <tag>` | `tat` | Aucune | Ajouter une étiquette |
| `todoremovetag <itemId> <tag>` | `trt` | Aucune | Retirer une étiquette |
| `todosearch <listId> <query>` | `tsearch` | Aucune | Rechercher les éléments en attente par titre, description ou étiquette |
| `todofilter <listId> <tag or priority> <value>` | `tf` | Aucune | Filtrer les éléments en attente par une seule étiquette ou une seule priorité |
| `todosetcolor <listId> <#hex>` | `tsc` | Aucune | Définir la couleur de l'embed |
| `todotoggleprivacy <listId>` | `ttp` | Aucune | Basculer une liste entre publique et privée |
| `todogrant <listId> @user <perms>` | `tg` | Aucune | Accorder des permissions séparées par des virgules |
| `todorevoke <listId> @user` | `trv` | Aucune | Retirer toutes les permissions d'un utilisateur |
| `todopermissions <listId>` | `tp` | Aucune | Afficher qui possède quelles permissions |

« Aucune » signifie qu'il n'y a pas de vérification de permission Discord ; ce sont les permissions de la liste elle-même qui décident si la commande réussit. Les mêmes commandes existent sous forme de commandes slash sous `/todo`.

## Astuces et pièges

- Les heures de rappel sont enregistrées sur l'élément, mais le bot n'envoie actuellement aucun rappel à l'heure prévue. Considérez-les comme de simples notes pour le moment.
- `todoshow` indique qu'une liste est introuvable si vous n'avez pas l'accès `view`, même si l'ID est correct.
- Le nom d'une liste doit être unique par propriétaire et par type : deux membres peuvent chacun avoir une liste personnelle « Courses », mais un même membre ne peut pas en avoir deux.
- `todoreorder` renumérote tous les éléments de la liste, de sorte que les positions restent continues.
- Les listes publiques de serveur sont lisibles par tous, mais seul le propriétaire peut y ajouter des éléments tant que vous n'avez pas accordé `add`.
- Utilisez `todogrant` dans Discord pour l'ensemble complet des permissions ; la vue **Gérer les permissions** du tableau de bord sert à vérifier qui a accès.
- Supprimer une liste efface en une fois ses permissions et ses éléments, et cette action est irréversible.

---
title: Tickets
slug: tickets
summary: Panneaux de tickets d'assistance avec boutons et menus déroulants qui ouvrent des salons privés, ainsi que la prise en charge, les priorités, les tags, les dossiers, les transcriptions et les outils du personnel.
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, modmail, billets, assistance, bureau d aide, panneau, panneau de tickets, transcriptions, dossiers, prise en charge, priorité, liste noire]
related: [administration, chat-triggers, auditlog]
---

## Fonctionnement

Tickets transforme un salon en bureau d'assistance. Vous publiez un panneau, c'est-à-dire un message contenant un embed et un ou plusieurs boutons ou un menu déroulant. Lorsqu'un membre clique sur un bouton ou choisit une option, le bot crée pour lui un salon textuel privé, configure les permissions afin que seuls lui et vos rôles de support puissent le voir, puis publie un message d'ouverture avec les boutons **Prendre en charge** et **Fermer**.

Côté membre : il clique, remplit éventuellement un court formulaire, et un salon nommé par exemple `ticket-username-1` apparaît. Il y décrit son problème. Une fois fermé, le salon est renommé en `closed-...`, verrouillé, puis soit déplacé vers une catégorie d'archives, soit supprimé après un délai, selon la configuration de ce type de ticket.

Côté personnel : le membre du personnel prend en charge un ticket pour que tout le monde sache qui s'en occupe, définit une priorité, ajoute des tags, rédige des notes, relie des tickets connexes à un dossier, puis ferme le ticket. Chaque fermeture peut enregistrer une transcription dans un salon et sur le tableau de bord. Le tableau de bord affiche également les délais de réponse et de résolution, les tickets par priorité et une vue par membre du personnel.

Chaque bouton et chaque option de menu déroulant constitue son propre type de ticket, avec sa propre catégorie, ses propres rôles, ses limites, son formulaire, son message d'ouverture et son comportement à la fermeture.

## Pourquoi l'utiliser

- Un serveur d'assistance souhaite des salons privés individuels plutôt qu'un salon d'aide public.
- Vous avez plusieurs équipes (facturation, modération, partenariats) et voulez un menu déroulant qui oriente vers la bonne équipe.
- Vous avez besoin de candidatures de modérateurs avec un formulaire, séparées de l'assistance générale.
- Vous voulez un historique de suivi : transcriptions, notes du personnel et dossiers qui regroupent les signalements liés.
- Vous voulez empêcher certains membres d'ouvrir des tickets.

## Panneaux, boutons et menus déroulants

Un panneau est un message unique dans un salon unique. L'identifiant du panneau correspond à l'identifiant de ce message. Un panneau peut contenir des boutons, des menus déroulants, ou les deux.

- **Boutons** : un type de ticket par bouton. Chacun possède un libellé, un emoji facultatif et un style (Primary, Secondary, Success ou Danger).
- **Menus déroulants** : un menu avec un texte indicatif et une liste d'options. Chaque option est un type de ticket avec un libellé, une description et un emoji. Un menu doit conserver au moins une option.

Si le message du panneau est supprimé, `checkpanels` indique les panneaux manquants, et `recreatepanel` ou `recreateallpanels` les republient en mettant à jour l'identifiant de message enregistré. Le bot surveille aussi les suppressions de messages de panneaux.

`ticketduplicatepanel` copie un panneau et tous ses composants vers un autre salon. `ticketmovepanel` le déplace. `ticketupdatepanel` remplace l'embed par un nouveau JSON d'embed.

### Paramètres des types de ticket

Ces paramètres existent sur chaque bouton et chaque option de menu. Dans le tableau de bord, ils apparaissent lorsque vous ajoutez ou modifiez un bouton ou une option.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Format du nom de salon | `ticket-{username}-{id}` | Nom du salon créé ; `{id}` est le numéro de ticket du membre, 100 caractères maximum |
| Catégorie des tickets | aucune | Catégorie dans laquelle le salon est créé |
| Catégorie d'archives | aucune | Catégorie vers laquelle le salon est déplacé lorsqu'il est fermé ou archivé |
| Rôles de support | aucun | Rôles qui peuvent voir, écrire dans et prendre en charge le ticket |
| Rôles spectateurs | aucun | Rôles qui peuvent lire sans envoyer de messages |
| Tickets actifs maximum | 1 | Nombre de tickets ouverts de ce type qu'un membre peut avoir |
| Fermeture automatique (heures) | aucune | Enregistrée par type et affichée dans `buttoninfo` |
| Délai de réponse requis (minutes) | aucun | Enregistré par type et affiché dans `buttoninfo` |
| Priorités autorisées | toutes | Priorités que le personnel peut définir pour ce type |
| Priorité par défaut | aucune | Priorité avec laquelle un nouveau ticket démarre |
| Enregistrer la transcription | désactivé | Génère une transcription à la fermeture du ticket |
| Verrouiller à la fermeture | activé | Interdit l'envoi de messages à tous sauf aux rôles de support |
| Renommer à la fermeture | activé | Ajoute le préfixe `closed-` au nom du salon |
| Retirer le créateur | activé | Retire l'accès de la personne qui a ouvert le ticket lors de la fermeture |
| Supprimer à la fermeture | désactivé | Supprime le salon après le délai au lieu de le conserver |
| Délai de suppression | 5 minutes | Délai avant suppression lorsque Supprimer à la fermeture est activé ; le champ du tableau de bord attend des secondes, `ticketclosebehavior` attend des minutes |
| Archiver automatiquement à la fermeture | désactivé | Archive le ticket dans le cadre de sa fermeture |
| Verrouiller à l'archivage | activé | Rend le salon en lecture seule lorsqu'il est archivé |
| Renommer à l'archivage | activé | Ajoute le préfixe `archived-` au nom du salon |
| Retirer le créateur (archivage) | désactivé | Retire l'accès de la personne qui a ouvert le ticket lors de l'archivage |
| Formulaire | aucun | Un formulaire affiché avant la création du ticket |
| Message d'ouverture | embed par défaut | Message d'ouverture personnalisé avec des placeholders |

### Formulaires (modals)

Un type de ticket peut poser des questions avant de créer le salon. Définissez un titre avec `setmodaltitle` (par défaut « Create Ticket ») et ajoutez des champs avec `addmodalfield`. Un champ est court et obligatoire par défaut ; les options placées après le libellé modifient ce comportement : `paragraph` pour plusieurs lignes, `optional`, et `min:X` ou `max:X` pour limiter la longueur, jusqu'à 4000. L'identifiant du champ correspond au libellé en minuscules, les espaces étant remplacés par des tirets bas.

Les réponses sont enregistrées avec le ticket et peuvent être utilisées dans le message d'ouverture sous la forme `%modal.<fieldId>%`.

### Le message d'ouverture

Par défaut, le bot publie un embed intitulé « Support Ticket », qui accueille le membre, affiche l'identifiant du ticket et l'heure de création, et lui demande de décrire son problème. Les boutons Claim et Close y sont attachés.

Vous pouvez remplacer ce message pour chaque type de ticket, par votre propre texte ou embed. Utilisez l'éditeur d'embed du tableau de bord (**Configurer le message d'ouverture du ticket**). Placeholders disponibles :

| Placeholder | Valeur |
| --- | --- |
| `%ticket.id%` | Le numéro du ticket |
| `%ticket.channel%` | Mention du salon du ticket |
| `%ticket.user%` | Le nom d'utilisateur de la personne qui a ouvert le ticket |
| `%ticket.user.mention%` | Une mention de la personne qui a ouvert le ticket |
| `%ticket.user.avatar%` | L'URL de l'avatar de la personne qui a ouvert le ticket |
| `%ticket.user.id%` | L'identifiant utilisateur de la personne qui a ouvert le ticket |
| `%ticket.created%` | Date et heure de création du ticket |
| `%modal.<fieldId>%` | La réponse à un champ de formulaire |

Le jeu général de placeholders n'est pas appliqué à ce message ; seuls ceux ci-dessus le sont.

## Ce qui se passe à l'ouverture d'un ticket

1. Les membres figurant sur la liste noire se voient refuser l'accès par un message éphémère.
2. Les tickets ouverts du membre pour ce type sont comptés par rapport à **Tickets actifs maximum** (1 par défaut).
3. Le salon est créé dans la catégorie des tickets avec `@everyone` refusé, la personne qui a ouvert le ticket autorisée à voir, envoyer des messages, lire l'historique, joindre des fichiers et intégrer des liens, les rôles de support recevant les mêmes droits plus Gérer les messages, et les rôles spectateurs autorisés à lire uniquement.
4. Le message d'ouverture est publié avec les boutons Claim et Close.
5. Si un salon de journal est défini, une entrée « new ticket » y est publiée.
6. Un événement **Ticket ouvert** est publié vers les déclencheurs de chat.

## Prise en charge, notes, priorités et tags

**Prendre en charge** : un membre d'un rôle de support ou un administrateur prend en charge le ticket avec le bouton ou `ticketclaim`. Le salon reçoit un embed « claimed by ». Seule la personne qui a pris en charge le ticket ou un administrateur peut le libérer. Un ticket fermé ou déjà pris en charge ne peut pas être pris en charge.

**Notes** : `ticketnote` ajoute une note du personnel au ticket en cours. La note est enregistrée avec le ticket, affichée sur le tableau de bord et publiée dans le salon du ticket sous la forme d'un embed bleu « note added », avec l'auteur dans le pied de page.

**Priorités** : ce sont des définitions à l'échelle du serveur, créées avec `ticketaddpriority` ou dans l'onglet **Configuration**. Chacune possède un identifiant, un nom affiché, un emoji, un niveau de 1 à 5, une couleur, un délai de réponse et un indicateur **Notifier le staff**. Définir une priorité sur un ticket publie un embed dans cette couleur et, si l'indicateur est activé, mentionne les rôles de support. Un type de ticket peut restreindre les priorités autorisées.

**Tags** : ce sont des étiquettes à l'échelle du serveur, avec un identifiant, un nom, une description et une couleur. Ajoutez-les ou retirez-les d'un ticket avec `ticketaddtags` et `ticketremovetags`, en utilisant les identifiants des tags. Le tableau de bord les affiche sur chaque ticket et permet de rechercher par tag.

## Fermeture, archivage et transcriptions

La fermeture marque le ticket comme fermé et publie un embed rouge « ticket closed ». Ensuite, dans l'ordre :

1. Si **Enregistrer la transcription** est activé pour le type et qu'un salon de transcriptions est défini, les 5000 derniers messages sont enregistrés et un embed contenant un lien **View Transcript** est publié dans le salon de transcriptions. Le lien ouvre la transcription sur le tableau de bord.
2. Si l'archivage automatique est activé pour le type, ou si vous avez fermé avec `ticketclose true`, le ticket est archivé (voir ci-dessous).
3. Sinon, les comportements de fermeture s'appliquent : renommage en `closed-...`, retrait de la personne qui a ouvert le ticket, verrouillage du salon tout en conservant les rôles de support, puis soit déplacement vers la catégorie d'archives, soit, avec **Supprimer à la fermeture**, avertissement dans le salon et suppression programmée après le délai de suppression. Les suppressions programmées sont traitées une fois par minute.

L'archivage renomme le salon en `archived-...`, le déplace vers la catégorie d'archives, le rend en lecture seule pour tout le monde et marque le ticket comme archivé. `ticketarchive` effectue cette action directement sur un ticket ouvert. Si le salon n'existe plus, le ticket est simplement marqué comme archivé.

La fermeture publie un événement **Ticket fermé** vers les déclencheurs de chat.

> [!NOTE]
> Une transcription n'est produite que si le type a **Enregistrer la transcription** activé et si le serveur dispose d'un salon de transcriptions. Sans salon de transcriptions, la fermeture réussit mais rien n'est enregistré.

## Dossiers

Un dossier regroupe les tickets liés entre eux, par exemple plusieurs signalements concernant la même personne. Créez-en un avec `ticketcreatecase <title> <description>` ou dans l'onglet **Dossiers**, puis reliez le ticket en cours avec `ticketlinkcase <caseId>` et dissociez-le avec `ticketunlinkcase`. Les dossiers ont leurs propres notes, peuvent être fermés puis rouverts, et peuvent être modifiés depuis le tableau de bord ou avec les commandes slash `/tickets cases`.

## Liste noire

`ticketblock @user [reason]` empêche un membre d'ouvrir des tickets. Le motif est écrit dans le salon de journal s'il est défini. `ticketunblock` lève la restriction. La section **Gestion de la liste noire** de l'onglet **Avancé** du tableau de bord propose la même fonction, en demandant un identifiant utilisateur.

## Outils groupés

- `ticketcloseinactive <hours>` ferme chaque ticket ouvert sans activité depuis ce nombre d'heures, publie dans chacun un embed « auto closed », et l'archive si le type dispose d'une catégorie d'archives. L'action **Fermer les tickets inactifs** de l'onglet **Avancé** fait de même.
- `ticketmoveall <source category> <target category>` déplace tous les salons de tickets d'une catégorie à une autre.

## Statistiques

`ticketstats` affiche les totaux, le nombre de tickets ouverts et fermés, le délai moyen de réponse en minutes, le délai moyen de résolution en heures, ainsi que la répartition par type et par priorité. `ticketuserstats [@user]` affiche les mêmes informations pour un membre, ainsi que ses tickets récents. L'onglet **Vue d'ensemble** affiche les délais de réponse, les tickets par priorité et les performances du personnel.

## Paramètres

La page Tickets comporte six onglets : **Vue d'ensemble**, **Tickets**, **Panneaux de tickets**, **Configuration**, **Dossiers** et **Avancé**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Salon de transcriptions | aucun | Où les résumés de transcriptions avec leurs liens sont publiés (Configuration) |
| Salon de journal | aucun | Où sont consignées les créations de tickets et les entrées de la liste noire (Configuration) |
| Priorités | aucune | Définitions de priorités à l'échelle du serveur (Configuration) |
| Tags | aucun | Définitions de tags à l'échelle du serveur (Configuration) |
| Embed du panneau | titre « Support Tickets » | Le message du panneau, créé dans l'éditeur d'embed (Ticket Panels) |
| Paramètres par type | voir le tableau ci-dessus | Définis sur chaque bouton ou option de menu (Ticket Panels) |
| Liste noire | vide | Membres qui ne peuvent pas ouvrir de tickets (Advanced) |

L'onglet **Tickets** répertorie les tickets ouverts et fermés, avec une recherche par ticket, utilisateur, salon ou tag. Depuis cet onglet, le personnel peut prendre en charge ou libérer un ticket, définir une priorité, ajouter ou retirer des tags, ajouter une note du personnel, fermer le ticket avec un motif facultatif, l'archiver et ouvrir la transcription.

> [!PERMISSION]
> Le bot a besoin des permissions Gérer les salons et Gérer les rôles afin de créer les salons de tickets et de définir qui peut les voir. Son rôle doit pouvoir voir les catégories de tickets et d'archives.

## Guide de configuration

1. Créez une catégorie pour les tickets ouverts et, si vous le souhaitez, une catégorie pour les tickets fermés. Créez un salon de transcriptions et un salon de journal visibles uniquement par le personnel.
2. Ouvrez **Tickets** dans le tableau de bord, allez dans **Configuration**, puis définissez **Salon de transcriptions** et **Salon de journal**.
3. Toujours dans **Configuration**, créez au moins une priorité (par exemple `urgent`, niveau 5, Notify staff activé) ainsi que les tags souhaités.
4. Allez dans **Panneaux de tickets** puis **Créer un nouveau panneau**. Choisissez le salon et concevez l'**Embed du panneau**.
5. Sélectionnez le panneau et ajoutez un **Nouveau bouton**. Définissez le libellé, le style, la **Catégorie des tickets**, la **Catégorie d'archives**, les **Rôles de support**, et activez **Enregistrer la transcription**. Choisissez entre conserver les salons fermés dans la catégorie d'archives ou **Supprimer à la fermeture** avec un délai.
6. Vous pouvez éventuellement ouvrir le créateur de formulaires pour ajouter des champs, et l'éditeur de message d'ouverture pour personnaliser l'accueil.
7. Pour plusieurs types de tickets dans un même menu déroulant, ajoutez plutôt un **Nouveau menu de sélection** et une option par type, avec les mêmes paramètres.
8. Ouvrez un ticket de test depuis un autre compte, prenez-le en charge, définissez une priorité, fermez-le, puis vérifiez le salon de transcriptions.

Sur Discord, `/tickets setup wizard #channel` vous guide à travers les mêmes étapes à l'aide de modèles (Basic Support, Department Support, Gaming Server, Business, Mod Applications).

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les identifiants de panneaux sont des identifiants de messages ; les identifiants des boutons, menus et options proviennent de `panelinfo` ou `ticketlistpanel`.

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `ticketpanel <#channel> [embedJson]` | `tpanel` | Administrateur | Crée un panneau, avec un aperçu ou une invite de création |
| `ticketpaneldelete <panelId> [force]` | `tpaneldelete` | Administrateur | Supprime un panneau ; `true` le force même si des tickets y sont liés |
| `ticketupdatepanel <panelId> <embedJson>` | `tupdatepanel` | Administrateur | Remplace l'embed du panneau |
| `ticketmovepanel <panelId> <#channel>` | `tmovepanel` | Administrateur | Déplace un panneau vers un autre salon |
| `ticketduplicatepanel <panelId> <#channel>` | `tduplicatepanel` | Administrateur | Copie un panneau et ses composants |
| `panellist` | `plist` | Administrateur | Liste les panneaux avec le nombre de composants |
| `panelinfo <panelId>` | `pinfo` | Administrateur | Affiche les boutons et menus d'un panneau avec leurs identifiants |
| `ticketlistpanels` | `tlistpanels` | Gérer les salons | Liste détaillée et paginée de chaque panneau |
| `ticketlistpanel <panelId>` | `tlistpanel` | Gérer les salons | Chaque composant d'un panneau avec ses paramètres |
| `checkpanels` | `tcheckpanels` | Administrateur | Signale les panneaux dont le message ou le salon est manquant |
| `recreatepanel <panelId>` | `trecreate` | Administrateur | Republie un panneau manquant |
| `recreateallpanels` | `trecreateall` | Administrateur | Republie chaque panneau manquant |
| `setpaneltranscripts <panelId> <true or false>` | `sptranscripts` | Administrateur | Active ou désactive les transcriptions pour chaque bouton d'un panneau |
| `ticketaddbutton <panelId> <label> [style] [emoji]` | `taddbtn` | Administrateur | Ajoute un bouton |
| `buttoninfo <buttonId>` | `binfo` | Administrateur | Affiche les paramètres d'un bouton |
| `deletebutton <buttonId>` | `delbtn` | Administrateur | Supprime un bouton |
| `ticketcategory <buttonId> [category]` | `tcat` | Administrateur | Définit ou retire la catégorie des tickets |
| `ticketarchivecategory <buttonId> [category]` | `tarchivecat` | Administrateur | Définit ou retire la catégorie d'archives |
| `ticketautoarchive <buttonId> [true or false]` | `tautoarchive` | Administrateur | Archive automatiquement à la fermeture |
| `ticketclosebehavior <buttonId> [autoArchive] [deleteOnClose] [lockOnClose] [renameOnClose] [deleteDelayMinutes]` | `tclosebehavior` | Administrateur | Définit plusieurs comportements de fermeture en une seule fois |
| `ticketautoclose <buttonId> [hours]` | `tautoclose` | Administrateur | Définit ou retire le nombre d'heures de fermeture automatique |
| `setautoclose <buttonId> <hours>` | `sautoclose` | Administrateur | Identique à la commande ci-dessus |
| `ticketresponsetime <buttonId> [minutes]` | `tresponsetime` | Administrateur | Définit ou retire le délai de réponse requis |
| `setresponsetime <buttonId> <minutes>` | `sresponsetime` | Administrateur | Identique à la commande ci-dessus |
| `setmodaltitle <buttonId> <title>` | `smodaltitle` | Administrateur | Titre du formulaire du ticket |
| `addmodalfield <buttonId> <label> [options]` | `addmfield` | Administrateur | Ajoute un champ de formulaire, options comme `paragraph,optional,max:500` |
| `removemodalfield <buttonId> <fieldId>` | `removemfield` | Administrateur | Supprime un champ de formulaire |
| `listmodalfields <buttonId>` | `listmfields` | Administrateur | Liste les champs de formulaire |
| `addselectmenu <panelId>` | `addsmenu` | Administrateur | Ajoute un menu déroulant via une invite guidée |
| `addoption <menuId> <label> [description] [emoji]` | `addopt` | Administrateur | Ajoute une option à un menu |
| `listoptions <menuId>` | `listopts` | Administrateur | Liste les options d'un menu |
| `removeoption <menuId> <value>` | `removeopt` | Administrateur | Confirme une option par sa valeur (voir les pièges) |
| `deleteselectoption <optionId>` | `delselectoption` | Administrateur | Supprime une option ; la dernière ne peut pas être supprimée |
| `setplaceholder <menuId> <text>` | `splaceholder` | Administrateur | Modifie le texte indicatif du menu |
| `deleteselectmenu <menuId>` | `delselectmenu` | Administrateur | Supprime un menu et ses options |
| `ticketclaim` | `tclaim` | Aucune | Prend en charge le ticket en cours (rôle de support ou administrateur) |
| `ticketunclaim` | `tunclaim` | Aucune | Libère votre prise en charge (personne qui a pris en charge le ticket ou administrateur) |
| `ticketclose [archive]` | `tclose` | Aucune | Ferme le ticket en cours ; `true` l'archive également |
| `ticketarchive` | `tarchive` | Gérer les salons | Archive le ticket en cours |
| `ticketnote <text>` | `tnote` | Aucune | Ajoute une note du personnel |
| `ticketpriority <priorityId>` | `tpriority` | Aucune | Définit la priorité du ticket en cours |
| `ticketaddtags <tagId...>` | `taddtags` | Aucune | Ajoute des tags au ticket en cours |
| `ticketremovetags <tagId...>` | `tremovetags` | Aucune | Retire des tags du ticket en cours |
| `ticketaddpriority <id> <name> <emoji> <level> <pingStaff> <responseTime> <color>` | `taddpriority` | Administrateur | Définit une priorité, par exemple `taddpriority urgent Urgent :fire: 5 true 00:15:00 red` |
| `ticketremovepriority <id>` | `tremovepriority` | Administrateur | Supprime une définition de priorité |
| `ticketaddtag <id> <name> <description> <color>` | `taddtag` | Administrateur | Définit un tag |
| `ticketremovetag <id>` | `tremovetag` | Administrateur | Supprime une définition de tag |
| `ticketcreatecase <title> <description>` | `tcreatecase` | Gérer les messages | Crée un dossier |
| `ticketlinkcase <caseId>` | `tlinkcase` | Gérer les messages | Relie le ticket en cours à un dossier |
| `ticketunlinkcase` | `tunlinkcase` | Gérer les messages | Dissocie le ticket en cours d'un dossier |
| `ticketblock @user [reason]` | `tblock` | Administrateur | Place un membre sur la liste noire |
| `ticketunblock @user` | `tunblock` | Administrateur | Retire un membre de la liste noire |
| `tickettranscriptchannel [#channel]` | `ttranscriptch` | Administrateur | Définit ou retire le salon de transcriptions |
| `ticketlogchannel [#channel]` | `tlogch` | Administrateur | Définit ou retire le salon de journal |
| `ticketcloseinactive <hours>` | `tcloseinactive` | Administrateur | Ferme les tickets inactifs depuis ce nombre d'heures |
| `ticketmoveall <category> <category>` | `tmoveall` | Administrateur | Déplace tous les tickets d'une catégorie à une autre |
| `ticketstats` | `tstats` | Aucune | Statistiques de tickets du serveur |
| `ticketuserstats [@user]` | `tuserstats` | Aucune | Statistiques de tickets d'un membre |

Les commandes slash se trouvent sous `/tickets` (créer un panneau, lister les panneaux, prendre en charge, fermer, note, archiver, priorité, groupes panneaux et paramètres, groupe dossiers) et `/tickets setup` (assistant, quick-button, quick-menu, from-template, templates).

## Conseils et pièges

- Les commandes qui agissent sur « le ticket en cours » ne fonctionnent que dans un salon de ticket. Exécutez-les dans le ticket, et non dans un salon du personnel.
- Chaque type de ticket a besoin de rôles de support ; sinon, seuls les administrateurs peuvent prendre en charge un ticket, et une fois le salon verrouillé, seule la personne qui a ouvert le ticket peut écrire.
- La limite par défaut est d'un ticket ouvert par membre et par type. Augmentez **Tickets actifs maximum** pour les types pour lesquels les tickets répétés sont normaux.
- **Fermeture automatique (heures)** et **Délai de réponse requis** sont enregistrés sur le type et affichés dans `buttoninfo`, mais la seule chose qui ferme les tickets inactifs dans le bot est `ticketcloseinactive` ou l'action groupée **Fermer les tickets inactifs**. Planifiez son exécution vous-même si vous souhaitez un nettoyage automatique.
- `removeoption` ne fait actuellement que confirmer le succès ; utilisez `deleteselectoption` avec l'identifiant de l'option pour la supprimer réellement.
- **Supprimer à la fermeture** et **Verrouiller à la fermeture** interagissent : un ticket configuré pour être supprimé n'est pas verrouillé au préalable, il attend simplement la fin du délai de suppression.
- Le JSON de l'embed du panneau doit être une sortie valide du créateur d'embed. Utilisez l'éditeur du tableau de bord et copiez le JSON si vous préférez les commandes.
- La suppression d'un panneau comportant des tickets ouverts est refusée, sauf si vous passez `true`, ce qui supprime le lien entre les tickets et le panneau.
- Les transcriptions enregistrent au maximum 5000 messages, et le lien « View Transcript » ouvre la transcription sur le tableau de bord.

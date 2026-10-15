---
title: Menus de rôles
slug: role-menus
summary: Publie un message avec une liste déroulante ou des boutons que les membres utilisent pour choisir eux-mêmes leurs rôles.
icon: fa-list-ul
category: Actions
dashboard: /dashboard/role-menus
module: RoleMenus
tags: [role menus, self roles, dropdown, buttons, pronouns, colors, menus de rôles, rôles libres, liste déroulante, boutons, pronoms, couleurs]
related: [administration, embedbuilder, rolestates]
---

## Fonctionnement

Un menu de rôles est un message unique dans un salon, accompagné d'une **liste déroulante** ou d'une rangée de **boutons** en dessous. Chaque option du menu attribue un rôle. Les membres choisissent une option pour obtenir le rôle, et la sélectionnent à nouveau pour le retirer. Un serveur peut ainsi permettre à chacun de choisir ses pronoms, ses couleurs, ses notifications ou ses régions sans passer par le personnel.

Chaque menu possède un nom (visible uniquement par le personnel, qui sert de titre au message par défaut), un salon, un message et jusqu'à 25 options. Une option comporte un rôle, le libellé affiché dans le menu, un emoji facultatif et une description facultative. Les descriptions s'affichent sous chaque option de la liste déroulante et dans le message par défaut. Les boutons ont également une couleur : blurple, grey, green ou red.

Le message peut être tout ce que permet le créateur d'embed : du texte brut, un ou plusieurs embeds, ou les deux. Si vous le laissez vide, le bot publie le nom du menu avec une ligne pour chaque option.

## Choisir plusieurs ou un seul

- **Plusieurs choix** permet aux membres d'activer ou de désactiver chaque rôle. Deux limites contrôlent le nombre qu'ils peuvent détenir : **Doit conserver au moins** les empêche de descendre en dessous d'un certain nombre une fois qu'ils ont fait leur choix, et **Peut contenir au maximum** plafonne le nombre de rôles du menu qu'ils peuvent avoir (aucune limite par défaut).
- **Choix unique** remplace les rôles : choisir une nouvelle option retire celle qu'ils avaient. Activez **Garder un rôle une fois choisi** pour que les membres puissent changer de choix sans pouvoir l'effacer.

## Limites

| Limite | Valeur |
| --- | --- |
| Menus par serveur | 50 |
| Options par menu | 25 |
| Boutons par rangée | 5 |
| Nom du menu | 100 caractères |
| Nom affiché dans le menu | 80 caractères |
| Description | 100 caractères |
| Texte d'indication de la liste déroulante | 150 caractères |
| Message en texte brut | 2000 caractères |

Chaque rôle ne peut figurer qu'une seule fois dans un menu. Le bot ne peut attribuer que les rôles situés sous son propre rôle le plus élevé et qui ne sont gérés par aucune intégration, et le personnel ne peut proposer que les rôles situés sous son propre rôle le plus élevé.

## Rôle requis

Un menu peut exiger un rôle. Les membres qui ne le possèdent pas reçoivent une note privée leur indiquant qu'ils ont besoin de ce rôle, et rien ne change.

## Confirmation

Lorsque **Informer les membres des changements** est activé, les membres reçoivent une note privée, visible par eux seuls, qui liste les rôles ajoutés et retirés. Lorsqu'il est désactivé, le menu fonctionne discrètement ; les membres reçoivent tout de même une note privée si quelque chose ne va pas, par exemple lorsqu'ils atteignent une limite ou qu'un rôle ne peut pas être attribué par le bot.

## Modifier, suspendre et republier

Enregistrer une modification reconstruit le même message sur place. Un nouveau message n'est publié que si le salon change ou si l'ancien message a disparu.

**Pause** grise la liste déroulante ou les boutons dans Discord jusqu'à ce que le menu soit réactivé. **Publier à nouveau** publie une nouvelle copie et supprime l'ancien message, ce qui est utile lorsqu'un menu est sorti de l'écran ou a été supprimé à la main. Si le salon d'un menu est supprimé, modifiez-le, choisissez un nouveau salon et enregistrez pour le publier à nouveau.

La suppression d'un menu supprime aussi son message. Les membres conservent les rôles qu'ils ont déjà choisis.

## Reprendre les anciennes configurations

Les anciennes configurations de rôles par emoji demandaient aux membres d'ajouter un emoji sous un message pour obtenir un rôle. L'onglet **Transférer les anciennes configurations** les répertorie. En déplaçant l'une d'elles, vous créez un menu de rôles avec les mêmes rôles et les mêmes emojis, sous forme de liste déroulante ou de boutons, dans le même salon ou dans un autre. Il peut copier le texte et les embeds de l'ancien message, et il peut retirer l'ancienne configuration, ce qui l'arrête et efface ses emojis. Si le bot a publié le message d'origine, le retrait le supprime. Une configuration où les membres ne pouvaient détenir qu'un seul rôle devient un menu « Pick one ».

## Commandes

| Commande | Rôle |
| --- | --- |
| `rolemenus` | Liste chaque menu avec son salon, son type, son nombre d'options et son statut. |
| `rolemenuinfo 3` | Affiche tous les détails d'un menu. |
| `rolemenucreate #roles dropdown @Role @Role` | Publie un nouveau menu avec une option par rôle. |
| `rolemenuadd 3 @Role [emoji] [name]` | Ajoute un rôle à un menu. |
| `rolemenuremove 3 @Role` | Retire un rôle d'un menu. |
| `rolemenuname 3 Pronouns` | Renomme un menu. |
| `rolemenumessage 3 [message\|clear]` | Affiche, définit ou efface le message au-dessus d'un menu. |
| `rolemenustyle 3 dropdown\|buttons` | Bascule entre une liste déroulante et des boutons. |
| `rolemenumode 3 multi\|exclusive` | Bascule entre Pick any et Pick one. |
| `rolemenulimits 3 0 2` | Définit le nombre de rôles que les membres doivent conserver et peuvent détenir. |
| `rolemenurequire 3 [@Role]` | Définit ou efface le rôle requis. |
| `rolemenureply 3 private\|silent` | Active ou désactive la note privée. |
| `rolemenupause 3` | Suspend un menu, ou le réactive s'il est suspendu. |
| `rolemenurepost 3 [#channel]` | Publie une nouvelle copie et supprime l'ancien message. |
| `rolemenudelete 3` | Supprime un menu et son message. |
| `rolemenuimport messageId [dropdown\|buttons]` | Transfère une ancienne configuration de rôles par emoji dans un nouveau menu. |

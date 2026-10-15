---
title: Invitations
slug: invites
summary: Attribuez chaque arrivée à un code d'invitation, au lien personnalisé ou à une application, comptez par membre les invitations régulières, quittées, frauduleuses et bonus, étiquetez les codes, et suivez la croissance, la rétention et les sources d'arrivée dans le temps.
icon: fa-users
category: Community
dashboard: /dashboard/invites
module: Utility
tags: [invites, invite tracking, inviter, who invited, referrals, recruitment, leaderboard, fake invites, bonus invites, retention, vanity, labels, analytics, mass ban, invitations, suivi des invitations, parrain, qui a invité, parrainages, recrutement, classement, fausses invitations, invitations bonus, rétention, lien personnalisé, étiquettes, analyses, bannissement de masse]
related: [multigreets, statroles, liveboards, serverstats]
---

## Fonctionnement

Lorsqu'une personne rejoint le serveur, le bot compare les liens d'invitation du serveur avant et après l'arrivée pour déterminer celui qui a été utilisé, vérifie l'URL personnalisée si aucun lien ne correspond, et enregistre la manière dont le membre est arrivé : par l'invitation d'un membre, par le lien personnalisé, par un bot ajouté via OAuth, ou de manière inconnue. La personne qui a invité reçoit une invitation **regular**, sauf si l'arrivée est signalée comme **fake**. Lorsque le membre invité quitte le serveur, le compteur **parti** de l'invitant augmente. Le personnel peut attribuer des invitations **bonus**. Le total d'un membre correspond aux invitations regular moins les left, moins les fake, plus les bonus.

Chaque arrivée constatée est conservée, y compris après le départ du membre. La page peut ainsi afficher la rétention (combien de membres invités sont toujours présents), les retours, et quels codes font venir des personnes qui restent.

## Pourquoi l'utiliser

- Organiser un concours de recrutement et récompenser un classement qui ne peut pas être contourné avec des comptes secondaires ou des arrivées et départs répétés.
- Vérifier si une campagne Twitter, un serveur partenaire ou un lien YouTube amène réellement des membres qui restent, en étiquetant chaque code.
- Afficher l'invitant et le code dans le message de bienvenue.
- Retrouver et bannir toutes les personnes qu'un même invitant a amenées lorsqu'un raid arrive via un seul lien.

## Comment les arrivées sont attribuées

- Le bot a besoin de la permission **Gérer le serveur** pour lire la liste des invitations. Sans elle, rien n'est enregistré.
- Les arrivées sont traitées une à une par serveur. Lorsque plusieurs personnes utilisent le même code entre deux vérifications, l'excédent est mémorisé et attribué aux arrivées suivantes, afin que les pics d'arrivées ne soient pas perdus.
- Une arrivée via l'URL personnalisée est enregistrée comme **Vanity** sans invitant. Un bot ajouté via OAuth est enregistré comme **Bot**.
- Un code étiqueté qui a un propriétaire crédite ce propriétaire plutôt que la personne qui a créé l'invitation. C'est ainsi que fonctionnent les liens personnels créés par `invitelink`.

## Détection des fausses invitations

Une arrivée est signalée comme fausse, et l'invitant reçoit une fausse invitation au lieu d'une invitation régulière, lorsque l'une de ces conditions est remplie :

| Raison | Quand |
| --- | --- |
| Self | Le membre a utilisé sa propre invitation |
| New account | Le compte est plus jeune que l'**Minimum account age** (0 désactive la vérification) |
| Rejoin | Le membre était déjà venu auparavant et **Compter les retours** est désactivé |
| No avatar | Le membre n'a pas d'avatar et **Signaler les membres sans avatar** est activé |

Les invitants figurant sur la **liste noire**, ou détenant un rôle figurant sur la liste noire, apparaissent toujours comme invitants mais ne gagnent jamais de crédit. Les membres de la liste **masquée** sont suivis, mais ne figurent pas dans les classements.

## Onglets du tableau de bord

| Onglet | Ce qu'il affiche |
| --- | --- |
| Overview | Arrivées, départs, croissance nette, rétention, fausses arrivées et sources d'arrivée pour le dernier jour, la semaine, le mois ou depuis toujours ; un graphique des arrivées et départs, les meilleurs invitants et les meilleurs codes |
| Leaderboard | Chaque invitant avec ses chiffres regular, left, fake, bonus et rétention, filtrables par période ou par rôle, exportables en CSV. Cliquez sur une ligne ou choisissez un membre pour voir sa répartition, ajouter ou retirer des invitations regular, bonus ou fake, ou les réinitialiser |
| Members | Chaque arrivée constatée, filtrable par invitant, code d'invitation ou étiquette, avec le mode d'arrivée, l'indication de signalement et la présence actuelle. Exportable en CSV |
| Codes & Labels | Chaque code d'invitation du serveur avec son créateur, son salon et ses utilisations. Attribuez une étiquette à un code, et éventuellement un rôle que reçoit chaque personne arrivant par ce code, ou supprimez le code |
| Settings | Suivi, suppression au départ, comptage des retours, signalement des membres sans avatar, âge minimum du compte, le salon vers lequel pointent les liens personnels, le salon de journal des arrivées et départs, les listes noires, les membres masqués, ainsi que les outils d'importation et de réinitialisation |

## Paramètres

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Track invites | activé | Si les arrivées sont attribuées |
| Remove credit when members leave | activé | Ajoute un au compteur left de l'invitant, ce qui réduit son total, lorsqu'un membre invité quitte le serveur |
| Count rejoins | activé | Lorsqu'il est désactivé, un membre déjà venu auparavant est signalé comme fausse invitation |
| Flag members without an avatar | désactivé | Les arrivées de comptes sans avatar comptent comme fausses |
| Minimum account age | 0 jour | Les comptes plus jeunes que cette durée sont signalés comme faux |
| Personal link channel | salon système | Là où pointent les invitations créées par `invitelink` |
| Join and leave log channel | aucun | Publie un embed à chaque arrivée et départ indiquant qui a invité qui, avec le code, l'âge du compte et l'éventuel signalement de fausse invitation |

**Importer les utilisations depuis Discord** porte le total régulier de chaque invitant à la somme des utilisations de ses codes, sans jamais le réduire ; vous pouvez donc le relancer sans risque après un redémarrage ou une nouvelle installation. **Réinitialiser les invitants partis** efface le décompte de toutes les personnes qui ne sont plus sur le serveur. **Tout réinitialiser** efface tous les décomptes et l'historique des arrivées.

## Placeholders d'accueil

Tous les messages d'accueil peuvent utiliser ces placeholders une fois le suivi activé. Les valeurs inconnues reviennent à `Unknown` ou `0`.

| Placeholder | Valeur |
| --- | --- |
| `%inviter.mention%`, `%inviter.username%`, `%inviter.id%`, `%inviter.avatar%` | L'invitant crédité |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | Le décompte de l'invitant |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%`, `%invite.fake%` | L'invitation utilisée |
| `%user.joincount%`, `%user.leavecount%` | Nombre de fois où ce membre est arrivé et est parti |
| `%server.members.ordinal%` | Le nombre de membres sous la forme 1er, 2e, 1 204e |
| `%user.joined.R%`, `%user.created.F%` et les autres styles d'horodatage Discord t, T, d, D, f, F, R | Dates d'arrivée et de création du compte sous forme d'horodatages dynamiques |

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Chaque commande existe aussi sous `/invites`.

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `invites [@user]` | | Aucune | Le total d'un membre avec la répartition regular, left, fake et bonus, ainsi que son rang |
| `whoinvited [@user]` | `invitedby` | Aucune | Qui a invité un membre, le code, et si l'arrivée a été signalée |
| `invitedusers [@user]` | `userinvites` | Aucune | Toutes les personnes invitées par un membre, avec leurs dates d'arrivée et leurs signalements |
| `invitedbycode <code>` | | Aucune | Toutes les personnes arrivées grâce à un code |
| `invitedbylabel <label>` | | Aucune | Toutes les personnes arrivées grâce à un code étiqueté |
| `inviteleaderboard [AllTime/Daily/Weekly/Monthly] [@role]` | `inviteslb` | Aucune | Le classement pour une période, éventuellement pour un seul rôle |
| `invitestats [range]` | `growthstats` | Aucune | Arrivées, départs, solde net, rétention, fausses arrivées, sources, meilleurs invitants et codes |
| `invitecodes [@user]` | `mycodes` | Aucune | Les codes d'invitation d'un membre et leurs utilisations |
| `invitelink` | `findlink`, `mylink` | Aucune | Votre lien permanent personnel, créé si vous n'en avez pas |
| `addinvites`, `removeinvites`, `addbonusinvites`, `removebonusinvites`, `addfakeinvites`, `removefakeinvites <@user> <amount>` | | Gérer le serveur | Ajuste le décompte d'un membre |
| `resetinvites <@user>` ou `resetinvites Server` ou `resetinvites LeftMembers` | | Gérer le serveur ; Administrateur pour une réinitialisation à l'échelle du serveur | Réinitialise les décomptes |
| `syncinvites [@user]` | | Gérer le serveur | Importe les utilisations depuis Discord |
| `deleteinvite <code>` | `delinvite` | Gérer le serveur | Supprime un code |
| `purgeinvites [maxUses] [#channel]` | | Gérer le serveur | Supprime chaque code non étiqueté utilisé au maximum ce nombre de fois |
| `inviteblacklist <@user or @role>` | `invbl` | Gérer le serveur | Active ou désactive la possibilité pour une personne de gagner du crédit |
| `invitehide <@user>` | `invhide` | Gérer le serveur | Active ou désactive l'affichage d'une personne dans les classements |
| `inviteexclusions` | | Gérer le serveur | Liste les listes noires et les membres masqués |
| `invitelabelset <code> <label>`, `invitelabelrole <code> [@role]`, `invitelabelremove <code>`, `invitelabels` | | Gérer le serveur | Gère les étiquettes |
| `inviteexport [range]`, `invitedexport [@user]` | | Gérer le serveur | Exports CSV |
| `invitemassban <@user> [reason]`, `invitemassbancode <code> [reason]` | | Bannir des membres | Bannit toutes les personnes encore présentes qui ont été invitées par un membre ou via un code, après confirmation |
| `invitesettings`, `toggleinvitetracking`, `toggleremoveinviteonleave`, `togglecountrejoins`, `togglefakenoavatar`, `setminaccountage <days>`, `invitelinkchannel [#channel]`, `invitelogchannel [#channel]` | | Gérer le serveur | Paramètres |

## Conseils et pièges

- Les membres arrivés avant l'activation du suivi, ou pendant que le bot était hors ligne, n'ont pas d'enregistrement d'arrivée. Exécutez une fois **Importer les utilisations depuis Discord** pour initialiser les totaux réguliers à partir des décomptes de Discord.
- Les fausses arrivées ne réduisent jamais un total lorsque le membre part ; seules les invitations régulières deviennent des invitations left.
- Un membre qui part puis revient reçoit un nouvel enregistrement d'arrivée. Avec **Compter les retours** activé, l'invitant gagne à nouveau une invitation régulière, ce qui annule l'invitation left précédente.
- La rétention du classement ne compte que les arrivées constatées par le bot ; elle commence donc à 100 % et se stabilise à mesure que l'historique se constitue.
- Les rôles de statistiques peuvent récompenser le nombre d'invitations, et les tableaux en direct peuvent épingler le classement des invitations dans un salon.

---
title: Compter
slug: counting
summary: Transformez un salon en jeu de comptage où les membres postent à tour de rôle le nombre suivant, avec réactions, séries, classements, points de sauvegarde et sanctions facultatives en cas de rupture du décompte.
icon: fa-list-numeric
category: Community
dashboard: /dashboard/counting
module: Counting
tags: [counting, count, numbers, game, channel, leaderboard, streak, milestones, save point, comptage, compter, nombres, jeu, salon, classement, série, jalons, point de sauvegarde]
related: [administration, xp]
---

## Ce que ça fait

Le staff choisit un salon et exécute `countingsetup`. Dès lors, le bot surveille chaque message de ce salon. Si un message est le prochain nombre attendu, le bot réagit avec une coche et enregistre le compte pour ce membre. Si le nombre est erroné, le bot réagit avec une croix et, par défaut, supprime le message deux secondes plus tard pour garder le salon propre.

Le bot conserve le nombre actuel, le plus grand nombre jamais atteint, le nombre total de comptages et la dernière personne ayant compté. Par défaut, un même membre ne peut pas compter deux fois de suite : le jeu nécessite donc au moins deux personnes. Les membres peuvent consulter leurs propres statistiques, leurs séries et leur précision, et un classement existe pour chaque salon.

Pour le staff, des points de sauvegarde permettent de revenir en arrière après un mauvais enchaînement, une couche de modération suit les mauvais comptages par membre dans une fenêtre de temps et applique des sanctions graduées, des bannissements et des exclusions temporaires du comptage, et des règles de rôles déterminent qui peut participer. Plusieurs salons peuvent faire du comptage en même temps, chacun avec ses propres paramètres.

## Pourquoi l'utiliser

- Un jeu communautaire peu exigeant qui tourne tout seul et donne aux membres un objectif commun.
- Les gros serveurs peuvent ajouter un délai de recharge et la règle anti-répétition pour empêcher une personne d'accaparer le compte.
- Le staff peut restaurer le compte depuis un point de sauvegarde plutôt que de débattre de qui a fait l'erreur.
- Les récidivistes qui brisent délibérément le compte peuvent être rendus muets ou bannis du comptage automatiquement.

## Comment un comptage est vérifié

Lorsqu'un membre poste dans un salon de comptage, le bot effectue ces vérifications dans l'ordre :

1. Les membres bannis du comptage sont totalement ignorés.
2. Les membres possédant un rôle interdit, ou ne possédant pas l'un des rôles requis, ou possédant un rôle ignoré, sont passés. Les messages des rôles ignorés sont supprimés si vous l'avez demandé.
3. Si le message ressemble à un nombre valide, le bot vérifie qu'il peut y réagir. Si la réaction échoue, il considère que le membre a bloqué le bot, supprime le message et publie un bref avertissement qui disparaît après cinq secondes.
4. Un membre encore en **Délai** est refusé.
5. Si **Autoriser les utilisateurs à compter plusieurs fois de suite** est désactivé et que le même membre a compté en dernier, le message est refusé.
6. Le texte est analysé selon le motif du salon. Tout ce qui n'est pas un nombre est traité selon les règles de non-nombres ci-dessous.
7. Le nombre doit être égal au nombre actuel plus l'**Incrément**. Un mauvais nombre compte comme une erreur pour ce membre, et si **Réinitialiser le compteur en cas d'erreur** est activé, le salon revient au nombre de départ.
8. Si **Nombre maximum** est défini et que le nombre le dépasse, le comptage s'arrête et le staff est notifié.

Un comptage correct met à jour le salon, les statistiques et la série du membre, démarre son délai de recharge, vérifie les jalons et journalise l'événement.

Les comptages réussis reçoivent la réaction **Émoji de réussite** (une coche par défaut) et les échecs reçoivent la réaction **Émoji d'erreur** (une croix par défaut). Les deux peuvent être un emoji standard ou un emote personnalisé.

## Motifs de comptage

Le motif détermine la manière dont les membres doivent écrire les nombres. Le bot reconnaît ces motifs :

| Motif | Ce que tapent les membres |
| --- | --- |
| Normal | Chiffres simples : `1`, `2`, `3`. Avec une **Base numérique** différente de 10, les chiffres sont lus dans cette base. |
| Roman | Chiffres romains : `I`, `II`, `III`, `IV` |
| Binary | `1`, `10`, `11`, `100` |
| Hexadecimal | `1` à `9`, puis `A`, `B`, `C` |
| Words | Nombres écrits en toutes lettres, comme `twenty-one` ou `one hundred and five` |
| Ordinal | `1st`, `2nd`, `3rd`, `4th` |
| Fibonacci | La suite de Fibonacci : `1`, `1`, `2`, `3`, `5`, `8` |
| Primes | Nombres premiers uniquement : `2`, `3`, `5`, `7`, `11` |

Normal est le motif par défaut. Le motif se définit depuis le tableau de bord ; il n'existe pas de commande pour cela.

> [!WARNING]
> La liste déroulante **Motif de comptage** du tableau de bord propose actuellement Sequential, Skip Multiples, Fibonacci, Primes et Powers of Two, et ses valeurs ne correspondent pas à la liste des motifs du bot ci-dessus. Seul Sequential (Normal) peut être choisi sans risque depuis le tableau de bord pour le moment.

## Jalons

Le bot enregistre un jalon la première fois que le compte atteint un multiple de 100, 500, 1 000, 5 000 ou 10 000. Les jalons apparaissent dans l'onglet **Statistiques** et dans `countingstatus`.

L'onglet **Gestion** du tableau de bord et `countingmilestones` permettent de stocker une liste personnalisée de nombres jalons par salon. Le même onglet et `countingmilestonemessage` stockent un message de jalon, et `countingmilestonechannel` stocke un salon d'annonce des jalons. Ces valeurs sont enregistrées, mais le bot ne publie pas encore d'annonce de jalon : considérez-les comme réservées à une version future.

## Statistiques et classements

Chaque membre dispose de statistiques par salon : contributions, série actuelle, série la plus longue, précision, erreurs, nombre total de nombres comptés et dernière contribution. `countingstats` les affiche avec le rang du membre.

`countingleaderboard` et l'onglet **Classement** trient selon l'un de quatre types :

| Type | Classement selon |
| --- | --- |
| `contributions` | Nombre de comptages corrects (par défaut) |
| `streak` | Série la plus longue |
| `accuracy` | Comptages corrects en pourcentage |
| `totalnumbers` | Nombre total de nombres comptés |

La commande affiche les 20 premiers, par pages de dix.

## Points de sauvegarde

`countingsave` enregistre le nombre actuel avec une raison facultative et vous donne un identifiant de sauvegarde. `countingrestore <id>` remet le salon à ce nombre après une demande de confirmation. `countingreset` définit directement le compte à n'importe quel nombre, avec confirmation, et vaut 0 par défaut. Ces trois commandes sont aussi présentes dans l'onglet **Gestion**.

## Modération

La modération du comptage est désactivée tant que vous ne l'activez pas, soit par salon avec `countmodenable true`, soit à l'échelle du serveur avec `countmoddefaults true`. Les paramètres du salon remplacent ceux par défaut du serveur ; `countmodreset` remet un salon sur les valeurs par défaut.

Lorsqu'elle est active, chaque mauvais nombre est enregistré contre le membre et ajouté à son compteur d'erreurs pour la **time window** (24 heures par défaut, de 1 à 168). Des sanctions graduées se déclenchent lorsque le compteur d'un membre atteint un nombre exact : `countmodpunish 3 Mute 30` le rend muet pendant 30 minutes au troisième mauvais comptage. Les paliers définis avec un salon s'appliquent à ce salon ; ceux définis sans salon sont les valeurs par défaut du serveur, et les paliers du salon l'emportent. `Softban`, `Kick` et `RemoveRoles` ne peuvent pas avoir de durée, et les durées sont plafonnées à 49 jours. `AddRole` nécessite un rôle.

Deux règles supplémentaires ne s'appliquent que lorsque la modération est active :

- **Non-nombres** : `countmodnonnumbers` détermine si les messages de discussion du salon sont supprimés (oui par défaut) et s'ils comptent comme une infraction (non par défaut).
- **Modifications** : `countmodedits` détermine si la modification d'un message du salon le supprime (oui par défaut) et si elle compte comme une infraction (non par défaut).

Règles de rôles : **Rôles requis** signifie qu'un membre doit en posséder au moins un pour compter, **Rôles bannis** bloque les membres qui en possèdent un, et `countmodignore` ignore les membres ayant les rôles indiqués et supprime éventuellement leurs messages.

`countingban`, `countingtimeout` et `countingunban` bloquent un seul membre dans un salon, de façon permanente ou pour une durée. L'onglet **Gestion** propose les mêmes contrôles par identifiant d'utilisateur, ainsi qu'un bouton **Purger les données du salon** qui correspond à `countingdisable` avec purge.

## Paramètres

Le tableau de bord comporte cinq onglets : **Salons**, **Configuration**, **Statistiques**, **Classement** et **Gestion**. Choisissez d'abord un salon dans **Salons** : les autres onglets agissent sur ce salon.

| Paramètre | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Start Number | 1 | Le nombre de départ du comptage, défini lors de la configuration |
| Increment | 1 | Valeur ajoutée à chaque comptage ; doit être positive |
| Counting Pattern | Normal | Manière d'écrire les nombres, voir ci-dessus |
| Number Base | 10 | Base utilisée par le motif Normal |
| Cooldown (seconds) | 0 | Attente entre deux comptages du même membre, de 0 à 300 |
| Max Number | 0 (illimité) | Le comptage s'arrête lorsque ce nombre est dépassé |
| Success Emote | coche | Réaction sur un comptage correct |
| Error Emote | croix | Réaction sur un mauvais comptage |
| Allow repeated users | Désactivé | Permet à un membre de compter deux fois de suite |
| Reset count on error | Désactivé | Un mauvais nombre remet le salon au nombre de départ |
| Delete wrong messages | Activé | Supprime les mauvais nombres après deux secondes |
| Enable achievements | Activé | Indicateur enregistré, affiché dans `countingconfig` |
| Enable competitions | Activé | Indicateur enregistré, affiché dans `countingconfig` |
| Required Roles | aucun | Les membres en ont besoin d'un pour compter |
| Banned Roles | aucun | Les membres qui en possèdent un ne peuvent pas compter |

> [!NOTE]
> La commande `countingfailurethreshold` enregistre une valeur de 1 à 10 (3 par défaut) et `countmodthreshold` enregistre un seuil de mauvais comptages, mais les sanctions ne se déclenchent que depuis les paliers définis avec `countmodpunish`.

## Pas à pas

1. Créez un salon et donnez au bot les permissions Voir le salon, Envoyer des messages, Ajouter des réactions, Gérer les messages et Voir l'historique des messages dans ce salon.
2. Ouvrez **Comptage** dans le tableau de bord, choisissez le salon sous **Configurer un nouveau salon de comptage**, définissez **Nombre de départ** et **Incrément**, puis enregistrez.
3. Dans **Configuration**, définissez un **Délai** si vous voulez ralentir le jeu, et choisissez les emotes.
4. Ajoutez éventuellement des **Rôles requis** ou des **Rôles bannis**.
5. Si vous voulez des sanctions automatiques, exécutez `countmodenable true` dans le salon et ajoutez des paliers avec `countmodpunish`.
6. Postez `1` depuis un compte et `2` depuis un autre pour vérifier que les réactions fonctionnent.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Autorisation | Rôle |
| --- | --- | --- | --- |
| `countingsetup [#channel] [start] [increment]` | `csetup`, `countsetup` | Gérer les salons | Démarrer le comptage dans un salon |
| `countingstatus [#channel]` | `cstatus`, `countstatus` | Personne | Nombre actuel, record, totaux et règles actives |
| `countingconfig [#channel]` | `cconfig`, `countconfig` | Gérer les salons | Afficher la configuration du salon |
| `countingreset [#channel] [number] [reason]` | `creset`, `countreset` | Gérer les messages | Réinitialiser le compte, 0 par défaut, avec confirmation |
| `countingstats [@user] [#channel]` | `countstats` | Personne | Statistiques de comptage d'un membre et son rang |
| `countingleaderboard [type] [#channel]` | `cleaderboard`, `countleaderboard`, `clb` | Personne | Top 20 par contributions, série, précision ou totalnumbers |
| `countingsave [#channel] [reason]` | `csave`, `countsave` | Gérer les messages | Créer un point de sauvegarde |
| `countingrestore <saveId> [#channel]` | `crestore`, `countrestore` | Gérer les messages | Revenir à un point de sauvegarde |
| `countingdisable [#channel] [purge] [reason]` | `cdisable`, `countdisable` | Gérer les salons | Arrêter le comptage ; `true` supprime aussi toutes les données |
| `countinglist` | `clist`, `countlist` | Gérer les salons | Lister les salons de comptage actifs |
| `countingban <@user> [#channel] [duration] [reason]` | `cban`, `countban` | Gérer les messages | Bannir un membre du comptage, de façon permanente sauf si une durée est donnée |
| `countingunban <@user> [#channel] [reason]` | `cunban`, `countunban` | Gérer les messages | Lever un bannissement du comptage |
| `countingtimeout <@user> <duration> [#channel] [reason]` | `ctimeout`, `counttimeout` | Gérer les messages | Bannissement temporaire du comptage |
| `countingcooldown [#channel] [seconds]` | `ccooldown`, `countcooldown` | Gérer les salons | Afficher ou définir le délai de recharge, de 0 à 300 |
| `countingmilestones [#channel] [50,100,...]` | `cmilestones`, `countmilestones` | Gérer les salons | Afficher, définir, ou `-` pour réinitialiser les nombres jalons personnalisés |
| `countingsuccessmessage [#channel] [text]` | `csuccessmessage`, `countsuccessmessage` | Gérer les salons | Enregistrer un modèle de succès, `-` le réinitialise |
| `countingfailuremessage [#channel] [text]` | `cfailuremessage`, `countfailuremessage` | Gérer les salons | Enregistrer un modèle d'échec, `-` le réinitialise |
| `countingmilestonemessage [#channel] [text]` | `cmilestonemessage`, `countmilestonemessage` | Gérer les salons | Enregistrer un modèle de jalon, `-` le réinitialise |
| `countingmilestonechannel [#counting] [#target]` | `cmilestonechannel`, `countmilestonechannel` | Gérer les salons | Enregistrer un salon de jalons, aucun pour effacer |
| `countingfailurechannel [#counting] [#target]` | `cfailurechannel`, `countfailurechannel` | Gérer les salons | Enregistrer un salon de journal des échecs, aucun pour effacer |
| `countingfailurethreshold [#channel] [1-10]` | `cfailurethreshold`, `countfailurethreshold` | Gérer les salons | Afficher ou définir le seuil d'échec |
| `countmodshow [#channel]` | `cmshow`, `countmoderationshow` | Gérer les salons | Afficher la configuration de modération et les valeurs par défaut du serveur |
| `countmoddefaults <on/off> [threshold] [hours] [punishment] [minutes] [@role]` | `cmdefaults`, `countmoderationdefaults` | Administrateur | Valeurs de modération par défaut à l'échelle du serveur |
| `countmodenable <on/off> [#channel]` | `cmenable`, `countmoderationenable` | Gérer les salons | Activer ou désactiver la modération pour un salon |
| `countmodthreshold <1-100> [#channel]` | `cmthreshold`, `countmoderationthreshold` | Gérer les salons | Définir le seuil de mauvais comptages du salon |
| `countmodwindow <1-168> [#channel]` | `cmwindow`, `countmoderationwindow` | Gérer les salons | Heures pendant lesquelles un mauvais comptage reste enregistré |
| `countmodpunishment <action> [minutes] [@role] [#channel]` | `cmpunishment`, `countmoderationpunishment` | Gérer les salons | Définir la sanction par défaut du salon |
| `countmodpunish <count> <action> [minutes] [@role] [#channel]` | `cmpunish`, `countmoderationpunish` | Gérer les salons | Sanction à un nombre exact de mauvais comptages ; sans salon, il s'agit de la valeur par défaut du serveur |
| `countmodunpunish <count> [#channel]` | `cmunpunish`, `countmoderationunpunish` | Gérer les salons | Supprimer un palier |
| `countmodpunishlist [#channel]` | `cmpunishlist`, `countmoderationpunishlist` | Gérer les salons | Lister les paliers |
| `countmodignore <delete> [#channel] [@roles...]` | `cmignore`, `countmoderationignore` | Gérer les salons | Rôles ignorés par le bot, avec suppression facultative de leurs messages |
| `countmodrequired [#channel] [@roles...]` | `cmrequired`, `countmoderationrequired` | Gérer les salons | Rôles nécessaires pour compter |
| `countmodbanned [#channel] [@roles...]` | `cmbanned`, `countmoderationbanned` | Gérer les salons | Rôles qui ne peuvent pas compter |
| `countmodnonnumbers <punish> [delete] [#channel]` | `cmnonnumbers`, `countmoderationnonnumbers` | Gérer les salons | Règles pour les discussions du salon |
| `countmodedits <punish> [delete] [#channel]` | `cmedits`, `countmoderationedits` | Gérer les salons | Règles pour les messages modifiés |
| `countmodreset [#channel]` | `cmreset`, `countmoderationreset` | Gérer les salons | Le salon revient aux valeurs par défaut du serveur |
| `countmodclear <@user> [#channel]` | `cmclear`, `countmoderationclear` | Gérer les messages | Effacer les mauvais comptages d'un membre |
| `countmodclearall [#channel]` | `cmclearall`, `countmoderationclearall` | Gérer les messages | Effacer les mauvais comptages de tout le monde |

## Astuces et pièges

- Le bot a besoin de la permission Ajouter des réactions dans le salon. Sans elle, rien ne reçoit de coche ni de croix, et les comptages valides sont ignorés par le test de blocage du bot.
- Supprimer les mauvais nombres et les discussions sans nombre nécessite la permission Gérer les messages.
- Les membres qui ont bloqué le bot ne peuvent pas compter : leur nombre est supprimé et un avertissement est publié.
- Avec la règle anti-répétition par défaut, un membre qui poste deux fois de suite est refusé avant même que le nombre ne soit lu, et ce refus ne compte pas comme une erreur.
- **Réinitialiser le compteur en cas d'erreur** remet le compte au nombre de départ ; avec un départ à 1, le prochain nombre attendu est donc de nouveau 1.
- Les sanctions de modération utilisent les mêmes actions que le système d'avertissements (Mute, Ban, Kick, AddRole, etc.), donc le bot a besoin des permissions Discord correspondantes et d'un rôle de mise en sourdine.
- `countingdisable` avec purge supprime les statistiques, bannissements et points de sauvegarde de ce salon, et cette action est irréversible. Désactiver sans purge conserve les données.

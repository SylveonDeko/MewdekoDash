---
title: Patreon
slug: patreon
summary: Connectez une campagne Patreon, attribuez aux contributeurs des rôles Discord correspondant à leur palier, et publiez un message de remerciement mensuel avec les chiffres en direct des contributeurs et des revenus.
icon: fa-heart
category: Community
dashboard: /dashboard/patreon
module: Patreon
tags: [patreon, supporters, patrons, donations, premium, tier roles, role sync, announcement, oauth, contributeurs, mécènes, dons, premium, rôles de palier, synchronisation des rôles, annonce, oauth]
related: [administration, utility]
---

## Fonctionnement

Le propriétaire d'un serveur qui gère une campagne Patreon relie celle-ci au bot en se connectant avec son compte de créateur. À partir de là, le bot récupère les paliers et les contributeurs de la campagne, les maintient synchronisés et peut attribuer des rôles Discord selon le montant que chaque contributeur s'est engagé à verser. Lorsque Patreon connaît le compte Discord d'un contributeur, le lien est automatique ; sinon, le personnel peut lier manuellement un membre à un utilisateur Patreon.

Une fois par mois, à un jour de votre choix, le bot peut publier dans un salon une annonce remerciant les contributeurs. Le message peut être du texte brut ou un embed, et peut inclure des chiffres en direct, comme le nombre de contributeurs actifs, les revenus mensuels et le nombre de personnes ayant rejoint ce mois-ci. Une commande de reconnaissance publie également un message de remerciement pour toute personne devenue contributrice au cours de la dernière semaine.

Le tableau de bord gère l'ensemble du processus : connexion, consultation des contributeurs et des paliers, association des paliers aux rôles, et modification des paramètres d'annonce. Les commandes couvrent les mêmes aspects, ainsi que les statistiques et les classements dans le chat.

## Pourquoi l'utiliser

- Les contributeurs doivent recevoir un rôle coloré et accéder aux salons réservés aux mécènes, sans que le personnel vérifie manuellement Patreon.
- Les paliers modifient automatiquement les rôles lorsqu'une personne passe à un palier supérieur, à un palier inférieur, ou arrête de contribuer.
- Vous souhaitez un message récurrent du type « merci à nos 40 contributeurs » qui reste exact sans que vous ayez à modifier les chiffres.
- Le personnel veut pouvoir consulter rapidement, depuis Discord, qui soutient le serveur et à quel niveau.

## Connecter une campagne

La connexion utilise le flux OAuth de Patreon. La carte **Connectez votre Patreon** du tableau de bord, ou la commande `patreonsync` réservée au propriétaire du bot, génère un lien « Authorize with Patreon ». Connectez-vous avec le compte propriétaire de la campagne, approuvez l'accès demandé, et Patreon vous renvoie vers la page Patreon du tableau de bord. Le bot échange le code contre des jetons d'accès, enregistre la première campagne trouvée, et lance immédiatement une synchronisation complète des paliers et des contributeurs.

Le compte utilisé doit posséder une campagne. S'il n'en possède aucune, le rappel échoue avec le message « No Patreon campaigns found for this user ».

L'onglet **Vue d'ensemble** du tableau de bord affiche l'état de la connexion avec le **ID de la campagne**, la **Dernière synchronisation** et la **Expiration du jeton**, ainsi que des cartes récapitulatives des **Soutiens** actifs, des **Revenus** mensuels et du **Créateur de la campagne**. Les jetons sont renouvelés automatiquement à expiration ; les **Actions rapides** de ce même onglet sont **Synchroniser toutes les données**, **Synchroniser les rôles**, **Envoyer l'annonce** et **Se reconnecter**. La reconnexion déconnecte la campagne : elle efface les jetons mais conserve vos paramètres de salon, de message et d'association, afin que vous puissiez vous reconnecter. L'en-tête de la page comporte également les boutons **Actualiser les données** et **Synchroniser les soutiens**.

> [!NOTE]
> L'intégration Patreon doit être activée par l'hébergeur du bot. Si le bot ne dispose pas d'un identifiant client Patreon configuré, le bouton de connexion et `patreonsync` indiquent que l'intégration n'est pas configurée.

## Contributeurs et synchronisation

Une synchronisation récupère chaque membre de la campagne avec le montant de son engagement, son statut et, lorsque le contributeur a relié son compte Discord à Patreon, son identifiant utilisateur Discord. Les contributeurs actifs sont ceux que Patreon signale comme actifs ou dont l'engagement est en cours. L'onglet **Soutiens** les répertorie avec leur **Nom** (et leur e-mail lorsque Patreon le fournit), leur **Contribution**, leur **Arrivé** et leur **Statut**. Le bouton **Synchroniser les soutiens** en haut de la page actualise la liste.

`patreonsupporters` affiche jusqu'à 15 contributeurs actifs dans le chat avec leur engagement et leur mention Discord, `patreontop [count]` classe les 1 à 20 premiers par engagement, `patreonstats` résume le nombre de contributeurs, le nombre de comptes liés, le revenu total et moyen ainsi que le nombre de paliers, et `patreonanalytics` ajoute les anciens contributeurs, le revenu à vie, les nouveaux contributeurs du mois et la répartition par palier.

Si le compte Discord d'un contributeur n'est pas rattaché côté Patreon, utilisez `patreonlink @member <patreonUserId>` pour le lier manuellement. L'identifiant utilisateur Patreon est l'identifiant numérique du compte Patreon du contributeur ; la liste des contributeurs du tableau de bord ne l'affiche pas.

## Association paliers et rôles

Chaque palier Patreon peut être associé à un rôle Discord. Dans l'onglet **Association des paliers**, choisissez un **Palier Patreon** et un **Rôle Discord**, puis enregistrez. La liste **Paliers disponibles** affiche chaque palier publié avec son prix et indique s'il est associé. Dans le chat, `patreontiermap <tierId> @role` fait la même chose ; récupérez les identifiants des paliers avec `patreonroles`.

La synchronisation des rôles est désactivée tant que vous ne l'activez pas avec `patreonrolesync` ou la case **Activer la synchronisation des rôles**. Lorsqu'elle est activée, le bot détermine le rôle qu'un contributeur doit avoir : le palier associé le plus cher dont le montant est inférieur ou égal à son engagement. Les autres rôles Patreon associés qu'il possède sont retirés, et le rôle cible est ajouté. Un contributeur qui cesse de contribuer perd tous les rôles associés.

La synchronisation a lieu lorsqu'un membre est lié, lorsque vous exécutez `patreonsyncall`, ou lorsque vous utilisez l'action de synchronisation des rôles du tableau de bord. Seuls les contributeurs dont l'identifiant Discord est connu peuvent être synchronisés.

> [!PERMISSION]
> Le bot a besoin de la permission Gérer les rôles, et son propre rôle doit se situer au-dessus de chaque rôle associé. Les rôles situés au-dessus du bot sont ignorés.

## Annonces mensuelles

Définissez un salon avec `patreonch #channel` ou le sélecteur **Salon des annonces**, puis un jour avec `patreonday <1..28>` ou **Jour de l'annonce (1-28)**. Le jour est limité à 28 afin que février ne soit jamais sauté. Les annonces sont désactivées tant que vous n'exécutez pas `patreontoggle` ou que vous ne cochez pas **Activer les annonces**.

Le bot vérifie toutes les heures. Le jour choisi, s'il n'a pas encore publié d'annonce ce mois-ci, il publie le message et enregistre l'heure. Si le bot était hors ligne ce jour-là, il rattrape l'annonce au démarrage, tant que le jour est déjà passé ce mois-ci. `patreonannounce` publie une annonce immédiatement, ce qui compte également comme la publication du mois.

Sans message personnalisé, le bot publie un remerciement par défaut incluant le nombre de contributeurs actifs et les revenus mensuels. Définissez le vôtre avec `patreonmsg <text or embed code>` ou avec l'éditeur de message d'annonce du tableau de bord. Le texte est traité par l'analyseur d'embed. Utilisez `-` pour revenir au texte par défaut.

### Placeholders

Ces placeholders fonctionnent dans le message d'annonce, en plus des placeholders habituels du serveur et des salons.

| Placeholder | Valeur |
| --- | --- |
| `%month%` | Nom du mois en cours |
| `%year%` | Année en cours |
| `%patreon.link%` | `https://patreon.com` |
| `%supporter.count%` | Contributeurs actifs |
| `%supporter.total%` | Tous les contributeurs enregistrés à ce jour |
| `%supporter.new%` | Nouveaux contributeurs ce mois-ci |
| `%supporter.former%` | Anciens contributeurs |
| `%supporter.linked%` | Contributeurs dont le compte Discord est lié |
| `%revenue.monthly%` | Engagements mensuels actuels |
| `%revenue.average%` | Engagement moyen |
| `%revenue.lifetime%` | Revenus à vie |
| `%growth.new%` | Nouveaux contributeurs ce mois-ci |
| `%top.supporter.name%` | Contributeur ayant le plus fort engagement |
| `%top.supporter.amount%` | Son engagement |
| `%patron.name%` | Contributeur ayant le plus fort engagement, identique à `%top.supporter.name%` |
| `%patron.tier%` | Le palier de ce contributeur, ou « Unknown » si Patreon n'en a pas signalé |
| `%patron.amount%` | Son engagement mensuel, identique à `%top.supporter.amount%` |
| `%tiers.count%` | Nombre de paliers |
| `%tier.popular%` | Palier comptant le plus de contributeurs |
| `%tier.popular.count%` | Nombre de contributeurs sur ce palier |
| `%supporters.summary%` | Phrase toute faite sur le nombre de contributeurs |
| `%revenue.summary%` | Phrase toute faite sur les revenus |
| `%growth.summary%` | Phrase toute faite sur la croissance |

> [!EXAMPLE]
> `It's %month%! Thanks to %supporters.summary%%revenue.summary%!%growth.summary%` donne « It's December! Thanks to our 25 incredible supporters who help us raise $150/month! We gained 3 new supporters this month! »

## Reconnaître les nouveaux contributeurs

`patreonrecognize [#channel]` publie un embed de bienvenue pour les contributeurs dont l'engagement a commencé au cours des sept derniers jours, jusqu'à cinq par exécution, dans le salon indiqué ou dans le salon actuel. C'est une commande manuelle, et non une planification ; exécutez-la donc après une synchronisation. L'exécuter deux fois publie deux fois les mêmes personnes.

## Paramètres

Le tableau de bord comporte quatre onglets : **Vue d'ensemble**, **Soutiens**, **Association des paliers** et **Configuration**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Announcement Channel | aucun | Où publier le message mensuel ; aucun signifie que les annonces sont désactivées |
| Announcement Day (1-28) | aucun | Jour du mois pour la publication ; les annonces ne se déclenchent qu'une fois un jour défini |
| Announcement message | remerciement intégré | Texte ou embed personnalisé utilisant les placeholders ci-dessus |
| Enable Announcements | désactivé | Si le message mensuel est envoyé |
| Enable Role Sync | désactivé | Si les rôles associés sont appliqués aux contributeurs |
| Tier mappings | aucun | Le rôle accordé par chaque palier |

## Guide de configuration

1. Ouvrez **Patreon** dans le tableau de bord et cliquez sur le bouton de connexion. Connectez-vous avec le compte propriétaire de la campagne et approuvez l'accès.
2. Attendez la première synchronisation, puis vérifiez que l'onglet **Soutiens** affiche vos mécènes.
3. Dans **Association des paliers**, associez chaque palier à un rôle. Créez d'abord les rôles et placez le rôle du bot au-dessus.
4. Cochez **Activer la synchronisation des rôles**, puis exécutez `patreonsyncall` pour appliquer les rôles à toutes les personnes déjà liées.
5. Dans **Configuration**, choisissez le **Salon des annonces** et l'**Announcement Day**, rédigez un message avec les placeholders, et cochez **Activer les annonces**.
6. Exécutez une fois `patreonannounce` pour voir le résultat dans le salon.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `patreonsync` | `ptsync` | Propriétaire du bot | Publie le lien d'autorisation OAuth |
| `patreonch [#channel]` | `ptch` | Administrateur | Affiche ou définit le salon des annonces |
| `patreondisable` | `ptdisable` | Administrateur | Efface le salon, ce qui désactive les annonces |
| `patreonmsg [text]` | `ptmsg` | Administrateur | Affiche ou définit le message d'annonce, `-` pour réinitialiser |
| `patreonday [day]` | `ptday` | Administrateur | Affiche ou définit le jour du mois |
| `patreontoggle` | `pttoggle` | Administrateur | Active ou désactive les annonces |
| `patreonconfig` | `ptconfig` | Administrateur | Affiche le statut, le salon, le jour, le message et la dernière publication |
| `patreonannounce` | `ptannounce` | Administrateur | Envoie l'annonce immédiatement |
| `patreonhelp` | `pthelp` | Aucune | Liste des placeholders et vue d'ensemble des commandes |
| `patreonsupporters` | `ptsupporters` | Administrateur | Liste les contributeurs actifs |
| `patreontop [count]` | `pttop` | Aucune | Meilleurs contributeurs par engagement |
| `patreonstats` | `ptstats` | Administrateur | Récapitulatif des contributeurs et des revenus |
| `patreonanalytics` | `ptanalytics` | Administrateur | Analyses détaillées |
| `patreonlink <user> <patreonUserId>` | `ptlink` | Administrateur | Lie un membre à un utilisateur Patreon |
| `patreonrolesync` | `ptrolesync` | Gérer les rôles | Active ou désactive la synchronisation automatique des rôles |
| `patreontiermap <tierId> <role>` | `pttiermap` | Gérer les rôles | Associe un palier à un rôle |
| `patreonroles` | `ptroles` | Administrateur | Liste les paliers avec leurs identifiants et leurs rôles |
| `patreonsyncall` | `ptsyncall` | Gérer les rôles | Applique les rôles à chaque contributeur lié |
| `patreonrecognize [#channel]` | `ptrecognize` | Administrateur | Remercie publiquement les contributeurs des sept derniers jours |

## Conseils et pièges

- Seuls les contributeurs ayant relié Discord dans leur profil Patreon, ou liés avec `patreonlink`, peuvent recevoir des rôles.
- La synchronisation des rôles attribue un seul rôle par contributeur, le meilleur palier couvert par son engagement. Le cumul de plusieurs rôles de palier n'est pas pris en charge.
- Les annonces ne sont publiées qu'une fois par mois civil au maximum. Exécuter `patreonannounce` le 3 signifie que la publication programmée du 15 est ignorée pour ce mois-ci.
- Le jour de l'annonce est exprimé en UTC.
- L'annonce mensuelle concerne l'ensemble de la campagne : `%patron.name%`, `%patron.tier%` et `%patron.amount%` décrivent donc le contributeur actif ayant le plus fort engagement, et non chaque mécène à tour de rôle. Utilisez `patreonrecognize` pour des remerciements individuels.
- Se reconnecter avec un autre compte Patreon change de campagne, mais conserve les anciennes associations ; vérifiez donc ensuite l'onglet **Association des paliers**.

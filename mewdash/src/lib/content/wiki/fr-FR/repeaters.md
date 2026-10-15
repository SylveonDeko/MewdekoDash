---
title: Répétiteurs
slug: repeaters
summary: Publiez un message dans un salon selon un calendrier, lorsque le salon est animé ou silencieux, ou gardez-le épinglé en bas du salon sous forme de message épinglé.
icon: fa-sync
category: Actions
dashboard: /dashboard/repeaters
module: Utility
tags: [repeater, sticky, sticky message, recurring, scheduled message, auto post, reminder, forum sticky, répétiteur, message épinglé, récurrent, message programmé, publication automatique, rappel, épingle de forum]
related: [utility, embedbuilder]
---

## Ce qu'il fait

Un répétiteur est un message que le bot publie à plusieurs reprises dans un même salon. L'usage classique est un rappel programmé : « Lisez le règlement » toutes les six heures. À chaque déclenchement, le bot supprime d'abord sa copie précédente ; le salon ne se remplit donc jamais de doublons, et le message reste toujours près du bas du salon.

Les répétiteurs disposent de cinq modes de déclenchement. Outre un intervalle fixe, ils peuvent se déclencher au moment où quelqu'un d'autre publie un message (un véritable message épinglé), après un certain nombre de messages, lorsque le salon est animé, ou lorsqu'il devient silencieux. Des plages horaires facultatives les limitent aux heures de bureau, aux soirées ou aux week-ends, selon le fuseau horaire de votre serveur, et les répétiteurs de forum peuvent publier automatiquement dans chaque nouveau fil.

Le message prend en charge l'ensemble du créateur d'embed, le texte brut, les composants et les espaces réservés généraux. Un répétiteur peut donc être une annonce riche plutôt qu'une simple ligne de texte. Les mentions ne sont conservées que si la personne qui le crée dispose de la permission Mentionner everyone ; sinon, elles sont neutralisées.

## Pourquoi l'utiliser

- Garder le règlement ou un avis « comment obtenir de l'aide » épinglé en bas d'un salon très actif.
- Publier un rappel d'événement quotidien à 18 h, à l'heure du serveur.
- Placer les consignes de publication dans chaque nouveau fil de forum, filtrées par tag.
- Relancer un salon mort avec une amorce de conversation lorsqu'il est resté silencieux pendant une heure.
- Diffuser une promotion uniquement pendant les heures de bureau et seulement pendant les sept prochains jours.

## Modes de déclenchement

| Mode | Moment de publication |
| --- | --- |
| Intervalle de temps | À chaque intervalle, éventuellement aligné sur une heure de début. Mode par défaut. |
| Immédiat | Publie une fois, puis republie chaque fois que son message n'est plus le dernier du salon. |
| Après des messages | Publie une fois que le seuil de messages envoyés depuis le dernier déclenchement est atteint. |
| Sur activité | Publie lorsque le salon est animé : le seuil est comparé au trafic récent dans la fenêtre de temps. |
| Sans activité | Publie lorsqu'aucun message n'a été envoyé dans le salon pendant toute la fenêtre de temps. |

Les modes basés sur l'activité sont vérifiés une fois par minute et nécessitent que le comptage des messages soit activé sur le serveur. L'intervalle doit être compris entre cinq secondes et 25000 minutes. La valeur par défaut est de cinq minutes, ou d'un jour lorsque vous indiquez une heure sans intervalle. **Seuil d'activité** est fixé par défaut à 5 messages et **Fenêtre de temps** à cinq minutes, avec une plage de fenêtre allant de trente secondes à six heures.

## Conditions et limites

- **Ne pas répéter si le message est déjà le dernier du salon** (redondance) : le bot ignore une exécution si sa dernière copie est toujours le message le plus récent.
- **Détection de conversation** : si trois messages ou plus ont été envoyés au cours de la dernière minute, l'exécution est retardée et revérifiée dans trente secondes.
- **Calendrier** : `business` correspond du lundi au vendredi de 9 h à 17 h, `evening` tous les jours de 18 h à 23 h, `weekend` toute la journée du samedi et du dimanche. Les heures utilisent le fuseau horaire du serveur ; définissez-le d'abord, sinon le bot utilise UTC et vous le rappelle.
- **Suppression automatique après** et **Nombre maximal d'affichages** : le répétiteur se supprime lui-même après une durée maximale ou un nombre de publications.
- **Supprimer les notifications** : le message est envoyé silencieusement afin de ne notifier personne sur son appareil.
- **Priorité** est enregistrée pour chaque répétiteur sous forme de valeur de 0 à 100, par défaut 50, et s'affiche dans la liste.

## Fils et forums

- **Création automatique dans les nouveaux fils** : lorsqu'un fil est créé sous le salon du répétiteur, le bot y publie le message et le maintient en bas à mesure que les membres répondent.
- **Mode fil uniquement** : le répétiteur ne publie jamais dans le salon parent, uniquement dans les fils. Ce mode est obligatoire lorsque la cible est un salon de forum.
- **Filtres de tags de forum** : les tags requis et exclus déterminent les publications de forum qui reçoivent le message épinglé.

## Espaces réservés

Le message est traité avec l'ensemble général d'espaces réservés. Les espaces réservés utilisateur désignent le bot lui-même, puisque personne ne déclenche un répétiteur. Les plus utiles :

| Espace réservé | Valeur |
| --- | --- |
| `%server%`, `%server.name%` | Nom du serveur |
| `%server.members%` | Nombre de membres en cache |
| `%server.id%`, `%server.icon%` | Identifiant du serveur et URL de l'icône |
| `%channel%`, `%channel.name%` | Mention et nom du salon du répétiteur |
| `%bot.name%`, `%bot.avatar%` | Nom et avatar du bot |
| `%server.time%`, `%time.day%` | Heure du serveur et jour de la semaine actuel |

Les espaces réservés de GIF de réaction, comme `%huggif%`, sont également remplacés. Les espaces réservés de déclenchement comme `%user%` désignent le bot.

## Paramètres

La page Répétiteurs comporte trois onglets : **Vue d'ensemble**, **Gérer les répétiteurs** et **Créer**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Salon cible | aucun | Salon textuel ou de forum dans lequel publier |
| Filtres de tags de forum | aucun | Tags requis et exclus, salons de forum uniquement |
| Contenu du message | aucun | Ouvre le créateur d'embed |
| Mode de déclenchement | Intervalle de temps | L'un des cinq modes |
| Répéter toutes les | 5 minutes | Préréglages de 1 minute à Quotidien, ou un `HH:MM:SS` personnalisé |
| Ne pas répéter si le message est déjà le dernier du salon | désactivé | Vérification de redondance |
| Autoriser les mentions @everyone et @here | désactivé | Conserver les mentions de masse dans le message au lieu de les neutraliser |
| Priorité (0-100) | 50 | Valeur de priorité affichée dans la liste |
| Position dans la file | 0 | Valeur d'ordre enregistrée |
| Heure de début (HH:MM) | aucune | Heure du jour à laquelle aligner un répétiteur à intervalle de temps |
| Détection de conversation | désactivé | Retard lorsque les gens discutent |
| Supprimer les notifications | désactivé | Envoi silencieux |
| Création automatique dans les nouveaux fils | désactivé | Épingle de fil, salons de forum uniquement |
| Mode fil uniquement | désactivé | Ignore le salon parent, salons de forum uniquement |
| Suppression automatique après (jours) | aucun | Âge maximal au format `d.hh:mm:ss`, par exemple `7.00:00:00` |
| Nombre maximal d'affichages | illimité | Nombre de publications avant suppression |
| Calendrier | aucun | Boutons de préréglage ou calendrier personnalisé |
| Seuil d'activité / Messages requis | 5 | Messages pour les modes basés sur l'activité |
| Fenêtre de temps | 00:05:00 | Fenêtre pour les modes basés sur l'activité |

**Vue d'ensemble** affiche les totaux, le nombre de répétiteurs actifs, le total des affichages, la répartition par mode de déclenchement et les répétiteurs les plus actifs. **Gérer les répétiteurs** liste chacun d'eux avec **Modifier**, **Déclencher maintenant** et **Supprimer**, ainsi qu'une modification rapide de l'intervalle, du seuil, de l'âge maximal et du nombre maximal de déclenchements.

## Pas à pas de configuration

1. Ouvrez **Répétiteurs** dans le tableau de bord et choisissez **Créer**.
2. Choisissez le **Salon cible**. Pour un forum, cochez **Mode fil uniquement** et définissez les **Filtres de tags de forum** souhaités.
3. Cliquez sur la zone **Contenu du message** et composez le message dans le créateur d'embed.
4. Choisissez un **Mode de déclenchement**. Pour un message épinglé, choisissez Immédiat ; pour un rappel, Intervalle de temps avec un préréglage de **Répéter toutes les**.
5. Ouvrez **Options avancées** si vous voulez la redondance, l'envoi silencieux, un calendrier ou une expiration.
6. Cliquez sur **Créer le répétiteur**, puis utilisez **Déclencher maintenant** dans l'onglet Gérer pour le tester.

> [!NOTE]
> Les calendriers nécessitent un fuseau horaire pour le serveur. Définissez-le avec la commande de fuseau horaire avant d'activer les plages heures de bureau, soirée ou week-end.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Toutes nécessitent la permission Gérer les messages. Les répétiteurs sont désignés par leur numéro issu de `repeatlist`.

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `repeat [time] [interval] <message>` | | Gérer les messages | Créer un répétiteur dans le salon actuel, par exemple `repeat 6h Read the rules` ou `repeat 18:00 Event tonight` |
| `repeatlist` | `replst`, `replist`, `repli` | Gérer les messages | Lister les répétiteurs avec salon, mode, intervalle et prochaine exécution |
| `repeatinvoke <index>` | `repinv` | Gérer les messages | Déclencher un répétiteur maintenant et redémarrer son minuteur |
| `repeatremove <index>` | `reprm` | Gérer les messages | Supprimer un répétiteur |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Gérer les messages | Activer ou désactiver sans supprimer |
| `repeatmessage <index> <message>` | `repmsg` | Gérer les messages | Remplacer le message |
| `repeatchannel <index> [#channel]` | `repchan` | Gérer les messages | Déplacer vers un salon textuel ou de forum |
| `repeatredundant <index>` | `repeatredun`, `repred` | Gérer les messages | Activer ou désactiver la vérification de redondance |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Gérer les messages | `timeinterval`, `immediate`, `aftermessages`, `onactivity` ou `onnoactivity` |
| `repeatactivity <index> <threshold> <window>` | `repactivity`, `repact` | Gérer les messages | Définir le seuil d'activité et la fenêtre, par exemple `10 5m` |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Gérer les messages | Définir la valeur de priorité |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Gérer les messages | `business`, `evening`, `weekend`, ou `none` pour effacer |
| `repeatconversation <index>` | `repconversation`, `repconv` | Gérer les messages | Activer ou désactiver la détection de conversation |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Gérer les messages | Activer ou désactiver l'envoi silencieux |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Gérer les messages | Activer ou désactiver la publication dans les nouveaux fils |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Gérer les messages | Activer ou désactiver le mode fil uniquement |
| `repeatforumtags <index> <add/remove/clear/list> [required/excluded] [tags]` | `repforumtags`, `repftags` | Gérer les messages | Gérer les filtres de tags de forum par identifiant de tag |

## Astuces et pièges

- Le bot a besoin des permissions Envoyer des messages, Intégrer des liens et Gérer les messages dans le salon, car il supprime sa copie précédente avant de republier.
- Si le salon est supprimé ou si le bot perd l'accès, le répétiteur se supprime lui-même.
- Les répétiteurs sont chargés peu de temps après le démarrage du bot. Les commandes ne font rien, sans message d'erreur, tant que ce chargement n'est pas terminé.
- Le mode immédiat republie à chaque message d'une autre personne ; évitez-le donc dans les salons très rapides, ou associez-le à la détection de conversation.
- Seul un membre disposant de la permission Mentionner everyone peut créer un répétiteur qui mentionne everyone ou un rôle ; sinon, la mention est échappée.
- Les modes basés sur l'activité dépendent du comptage des messages. Activez-le avant de changer de mode, sinon la commande est refusée.
- L'expiration par Nombre maximal d'affichages compte chaque publication, y compris celles que vous déclenchez manuellement.

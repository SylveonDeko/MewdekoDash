---
title: Alertes de diffusion
slug: streams
summary: Suivez des streamers sur Twitch, YouTube, Kick et Picarto, et publiez une annonce dans le salon de votre choix lorsqu'ils passent en direct ou hors ligne.
icon: fa-video
category: Community
dashboard: /dashboard/streams
module: Searches
tags: [streams, stream alerts, go live, live notifications, twitch, youtube, kick, picarto, trovo, streamadd, streamtemplate, alertes de diffusion, passage en direct, notifications en direct, modèle de diffusion]
related: [twitch, utility, administration]
---

## Ce que cela fait

Le personnel colle l'URL d'une diffusion et choisit un salon Discord. Le bot interroge ensuite la plateforme de ce streamer et, lorsque la diffusion passe de hors ligne à en ligne, publie un message de passage en direct dans le salon choisi. Par défaut, il s'agit d'un embed avec le nom du streamer lié à la diffusion, le titre de la diffusion, le jeu ou la catégorie, le nombre de spectateurs, l'avatar du streamer et une image d'aperçu.

Vous pouvez remplacer l'embed par défaut par votre propre message. Un modèle à l'échelle du serveur s'applique à chaque diffusion suivie, et chaque diffusion peut aussi avoir son propre message de passage en ligne et son propre message de fin. Tous acceptent les marqueurs `%stream.*%` listés ci-dessous, et peuvent être du texte simple ou un embed complet créé dans l'éditeur d'embeds du tableau de bord.

Les avis de fin sont désactivés par défaut. Si vous les activez, le bot publie aussi un message lorsqu'une diffusion suivie se termine, en utilisant le message hors ligne de la diffusion s'il existe, sinon le modèle du serveur, sinon l'embed par défaut affichant « Offline ».

> [!NOTE]
> Les alertes de diffusion annoncent les diffusions d'autres personnes sur votre Discord. La fonctionnalité distincte Twitch Bot relie le bot à votre propre chat Twitch pour les commandes, les minuteurs et les événements. Consultez l'article Twitch Bot pour cela.

## Pourquoi l'utiliser

- Un serveur communautaire veut un salon « en direct maintenant » qui s'allume dès qu'un de ses créateurs commence à diffuser.
- Le Discord d'un streamer veut une notification automatique avec le titre et la catégorie, pour que personne n'ait à la publier à la main.
- Un serveur d'esport ou d'événement suit plusieurs chaînes de tournoi sur Twitch et Kick au même endroit.
- Un serveur veut un avis « diffusion terminée » propre, pour que le message de passage en direct ne paraisse pas périmé.

## Plateformes prises en charge

Le bot détermine la plateforme à partir de l'URL que vous lui donnez. Seules les URL correspondant à l'un de ces modèles peuvent être suivies.

| Plateforme | Format d'URL | Remarques |
| --- | --- | --- |
| Twitch | `twitch.tv/username` | Utilise l'API Helix de Twitch. Le titre, le jeu, les spectateurs, l'avatar et l'aperçu sont tous renseignés. |
| YouTube | `youtube.com/@handle` ou `youtube.com/channel/ID` | Lu en extrayant les données de la page de diffusion en direct de la chaîne ; les données peuvent donc être moins complètes que sur Twitch. Une URL avec un identifiant de chaîne est convertie en identifiant d'utilisateur. |
| Kick | `kick.com/slug` | Utilise l'API publique de Kick. Le marqueur d'avatar est rempli avec l'image de bannière de la chaîne. |
| Picarto | `picarto.tv/name` | Utilise l'API de Picarto. |

Trovo et Facebook apparaissent dans la liste des plateformes du tableau de bord et dans les données enregistrées, mais il n'existe ni détecteur d'URL fonctionnel pour Trovo ni fournisseur pour Facebook dans le code actuel ; ces URL sont donc refusées lorsque vous essayez de les suivre.

## Fonctionnement de la vérification

Le bot tient un suivi par plateforme et demande à chaque plateforme l'état de chaque chaîne suivie, en boucle, avec une pause de trois secondes entre les cycles. Une diffusion est annoncée comme en ligne la première fois qu'elle est vue en direct après avoir été hors ligne.

Le passage hors ligne est traité avec plus de prudence, car Twitch signale parfois une brève coupure pendant une diffusion en direct. Une diffusion doit être vue hors ligne lors de deux vérifications consécutives avant que l'avis de fin soit envoyé. Si elle revient en ligne entre-temps, rien n'est publié.

Toutes les trente minutes, le bot recherche les diffusions dont les requêtes vers la plateforme échouent depuis plus de douze heures, par exemple une chaîne supprimée ou renommée, et les retire de chaque serveur qui les suivait.

Si le salon de notification d'une diffusion suivie a été supprimé, la diffusion est abandonnée la prochaine fois que quelqu'un exécute `streamlist`.

## Le message envoyé

Lorsqu'une diffusion change d'état, le bot choisit un message dans cet ordre :

1. Le **Message en ligne** ou le **Message hors ligne** propre à la diffusion, selon le nouvel état.
2. Le modèle **Message global de direct** à l'échelle du serveur.
3. L'embed intégré.

Un message propre à une diffusion qui n'est pas du JSON d'embed valide est publié en texte simple au-dessus de l'embed intégré. Un modèle global qui n'est pas du JSON d'embed est publié en texte simple seul. Les messages qui sont du JSON d'embed valide, ce que produit l'éditeur d'embeds du tableau de bord, sont envoyés exactement comme conçus, y compris les boutons.

L'embed intégré affiche le nom du streamer comme titre lié, le titre de la diffusion comme ligne d'auteur, un champ **Statut** indiquant Online ou Offline, un champ **Viewers**, un champ **Diffusion** pour le jeu ou la catégorie, l'avatar en miniature et l'aperçu en grande image. Il est vert pendant la diffusion et rouge hors ligne.

### Marqueurs

Seul cet ensemble est remplacé dans les messages de diffusion. Les marqueurs généraux du serveur et de l'utilisateur de la page des marqueurs ne sont pas disponibles ici.

| Marqueur | Valeur |
| --- | --- |
| `%stream.name%` | Nom d'affichage du streamer, ou `Unknown` |
| `%stream.username%` | Nom de connexion ou identifiant d'utilisateur du streamer |
| `%stream.url%` | Lien direct vers la diffusion, toujours avec `https://` |
| `%stream.title%` | Titre actuel de la diffusion, ou `No title` |
| `%stream.game%` | Jeu ou catégorie, ou `No category` |
| `%stream.viewers%` | Nombre de spectateurs avec séparateurs de milliers, ou `-` hors ligne |
| `%stream.platform%` | Nom de la plateforme, comme `Twitch` ou `Youtube` |
| `%stream.avatar%` | URL de l'avatar du streamer |
| `%stream.preview%` | URL de l'aperçu ou de la miniature de la diffusion |
| `%stream.status%` | `Online` ou `Offline`, chacun précédé d'un cercle coloré |
| `%stream.channelid%` | Identifiant de chaîne propre à la plateforme, lorsque celle-ci en fournit un |

> [!EXAMPLE]
> Un modèle global simple : `%stream.name% is live on %stream.platform% playing %stream.game%: %stream.title% %stream.url%`

## Paramètres

La page Notifications de diffusion comporte quatre onglets : **Directs**, **Suivre un direct**, **Paramètres** et **Statistiques**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Notification Channel | aucun | Le salon où vont les alertes d'une nouvelle diffusion, choisi dans **Suivre un direct** |
| Stream URL | aucune | Le lien à suivre, dans **Suivre un direct** |
| Online Message | aucun | Message propre à la diffusion lors du passage en direct, modifié depuis la carte de la diffusion dans **Directs** |
| Offline Message | aucun | Message propre à la diffusion lors de sa fin, modifié depuis la même carte |
| Global Stream Message | aucun | Modèle à l'échelle du serveur utilisé lorsqu'une diffusion n'a pas de message propre, dans **Paramètres** |
| Offline Notifications | désactivé | Indique si le bot publie lorsque les diffusions suivies se terminent, dans **Paramètres** |

**Directs** liste chaque diffusion suivie avec sa plateforme, sa chaîne et la date de son ajout, avec un bouton de suppression sur chaque carte et un bouton **Clear All**. **Statistiques** affiche le nombre total de diffusions, de streamers uniques, de salons avec notifications, de plateformes utilisées et une répartition par plateforme.

Un serveur peut suivre au maximum dix diffusions. Ajouter une onzième échoue.

## Mise en place pas à pas

1. Ouvrez **Alertes de stream** dans le tableau de bord et allez dans l'onglet **Suivre un direct**.
2. Choisissez le **Salon de notification**, collez le **URL du direct**, puis cliquez sur **Suivre un direct**.
3. Dans **Paramètres**, créez un **Message global de direct** dans l'éditeur d'embeds à l'aide des marqueurs ci-dessus, puis cliquez sur **Enregistrer le message**. Ignorez cette étape pour conserver l'embed intégré.
4. Activez **Notifications hors ligne** si vous voulez aussi les publications « diffusion terminée ».
5. De retour dans **Directs**, ouvrez la carte d'une diffusion pour lui donner son propre **Message en ligne** ou **Message hors ligne** si elle a besoin de quelque chose de différent du modèle global.
6. Testez avec `streamcheck <url>` pour vérifier que le bot peut lire la diffusion, puis attendez le prochain passage en direct.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Objet |
| --- | --- | --- | --- |
| `streamadd <url>` | `sta`, `stadd` | Gérer les messages | Suivre une diffusion et envoyer ses alertes dans le salon actuel |
| `streamremove <index>` | `strm` | Gérer les messages | Ne plus suivre la diffusion à cette position dans `streamlist` |
| `streamsclear` | `stclear` | Administrateur | Ne plus suivre aucune diffusion du serveur |
| `streamlist` | `stl`, `streamslist` | Personne | Liste paginée des diffusions suivies avec leurs numéros, plateformes et salons |
| `streamoffline` | `sto`, `stoff` | Gérer les messages | Activer ou désactiver les notifications de fin |
| `streammessage <index> <message>` | `stm`, `stmsg` | Gérer les messages | Définir le message de passage en direct d'une diffusion ; un message vide la réinitialise |
| `streamofflinemessage <index> <message>` | `stofmsg`, `stoffline` | Gérer les messages | Définir le message de fin d'une diffusion ; un message vide la réinitialise |
| `streamtemplate [template]` | `stt`, `sttemplate` | Gérer les messages | Afficher le modèle global et ses marqueurs, en définir un nouveau, ou `reset` pour l'effacer |
| `streamcheck <url>` | `stc` | Personne | Indiquer si une diffusion est en direct maintenant et son nombre de spectateurs |

## Astuces et pièges

- `streamadd` utilise le salon dans lequel vous l'exécutez. Utilisez le tableau de bord si vous voulez choisir un autre salon.
- Les numéros de diffusion proviennent de `streamlist` et commencent à 1. Ils se décalent lorsqu'une diffusion est retirée ; vérifiez donc la liste avant de supprimer par numéro.
- Le bot a besoin de Envoyer des messages et de Intégrer des liens dans le salon de notification. Les alertes envoyées vers un salon qu'il ne voit pas sont ignorées et consignées dans le journal.
- Si votre serveur a le Twitch Bot connecté avec un salon de passage en direct défini pour la même chaîne Twitch, cette intégration prend le relais et les alertes de diffusion restent silencieuses pour celle-ci, afin que vous ne receviez pas deux publications.
- Les données YouTube sont extraites de la page plutôt que lues depuis une API. Les titres, les catégories et les nombres de spectateurs peuvent être absents ou apparaître comme `Live Stream`.
- Les diffusions dont les requêtes échouent pendant douze heures sont supprimées automatiquement. Si un streamer renomme sa chaîne, suivez la nouvelle URL.

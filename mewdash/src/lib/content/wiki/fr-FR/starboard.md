---
title: Starboard
slug: starboard
summary: Permettez aux membres de voter pour les meilleurs messages avec une réaction, et republiez dans un salon de mise en avant dédié tout message qui atteint le seuil.
icon: fa-star
category: Community
dashboard: /dashboard/starboard
module: Starboard
tags: [starboard, stars, highlights, best of, reactions, pins, repost, threshold, étoiles, mise en avant, meilleurs messages, réactions, épingles, republication, seuil]
related: [settings, logging]
---

## Fonctionnement

Un starboard est un salon dans lequel le bot republie les messages ayant reçu suffisamment de réactions avec un émoji choisi. Les membres réagissent à ce qui est drôle ou utile ; une fois le nombre de réactions atteint le seuil, le bot copie le message dans le salon starboard avec le nom de l'auteur, le texte, les images ou vidéos éventuelles, le nombre actuel de réactions et un bouton **Jump to Message**.

La publication se met à jour au fil des réactions ajoutées ou retirées. Si les réactions tombent sous le seuil, la publication peut être supprimée. Si le message d'origine est supprimé ou si ses réactions sont effacées, la publication peut aussi être supprimée.

Un serveur peut faire fonctionner plusieurs starboards en même temps, chacun avec son propre salon, son propre émoji ou ses propres émojis, son propre seuil et ses propres règles. Un tableau « meilleurs mèmes » surveillant un émoji et un tableau « réponses utiles » surveillant un autre peuvent coexister.

## Pourquoi l'utiliser

- Donner à la communauté un moyen de mettre en avant les meilleurs contenus sans qu'un membre du staff ait à les sélectionner.
- Garder un salon de mise en avant durable que les nouveaux membres peuvent parcourir.
- Faire fonctionner des tableaux séparés pour l'humour, l'art ou les réponses utiles, chacun avec des émojis différents.
- Limiter les salons qui alimentent le tableau, pour que le spam de bots et les discussions hors sujet n'y apparaissent pas.

## Plusieurs starboards et émojis

Chaque starboard est identifié par un ID numérique affiché par `liststarboards` et dans la liste du tableau de bord. Les commandes prennent cet ID comme premier argument.

Un starboard démarre avec un émoji et peut en recevoir d'autres. Chacun de ses émojis compte dans le même total, et la publication affiche un compteur distinct pour chaque émoji. Un émoji ne peut appartenir qu'à un seul starboard sur le serveur ; tenter de le réutiliser échoue avec « emote already in use ». Un starboard doit conserver au moins un émoji, le dernier ne peut donc pas être retiré.

Les émojis personnalisés fonctionnent comme les émojis Unicode. Le bot teste l'émoji en réagissant à votre message de commande ; il doit donc s'agir d'un émoji que le bot peut utiliser.

## Seuils et comptage

Le **star threshold** correspond au nombre de réactions qu'un message doit recevoir avant d'être publié. La valeur par défaut, depuis la commande, est 1 ; le tableau de bord exige au minimum 1.

Lors du comptage, le bot :

- Ignore les réactions des comptes de bots.
- Additionne les réactions de tous les émojis appartenant à ce starboard.
- Compte la réaction de l'auteur lui-même. Il n'existe aucune exclusion pour l'auto-étoilage.
- Ne réagit qu'aux messages contenant du texte ou une pièce jointe. Un message qui n'a ni l'un ni l'autre est ignoré.

Si le total est inférieur au seuil et qu'une publication existe déjà, la publication est supprimée lorsque **Retirer sous le seuil** est activé. Sinon, elle reste telle quelle.

## Messages de bots

Par défaut, les messages écrits par des bots ne sont jamais publiés. Activez **Autoriser les messages des bots** pour les inclure. Pour un message de bot, le texte est pris dans la description du premier embed s'il en contient, sinon dans le contenu brut ; l'image provient de la première pièce jointe ou de l'image du premier embed. Lorsque les messages de bots sont autorisés, les réactions des bots sont aussi comptées dans les totaux par émoji affichés sur la publication.

## Seuil de republication

Normalement, le bot modifie la publication existante du starboard à chaque changement du compteur. Lorsqu'un tableau est très actif, cette publication peut se retrouver loin en arrière dans le salon, où personne ne voit le compteur mis à jour.

Le **repost threshold** règle ce problème. Définissez-le à un nombre N : à chaque mise à jour, le bot examine les N derniers messages du salon starboard. Si la publication existante s'y trouve, elle est modifiée. Si elle est remontée plus loin que cela, l'ancienne publication est supprimée et une nouvelle est envoyée en bas. Définissez la valeur à 0 pour désactiver la republication et toujours modifier sur place.

## Filtrage des salons

Chaque starboard a une liste de salons et un mode :

| Mode | Effet |
| --- | --- |
| Whitelist (par défaut) | Seuls les messages des salons listés sont pris en compte. Une liste vide signifie tous les salons. |
| Blacklist | Les messages des salons listés sont ignorés. Tout le reste est pris en compte. |

`starboardchtoggle <id> #channel` ajoute ou retire un salon de la liste. L'action **Gérer les salons** du tableau de bord fait la même chose.

## La publication du starboard

La publication est construite à partir de composants plutôt que d'un embed classique :

- Une ligne au-dessus du conteneur avec chaque émoji et son compteur.
- Le nom de l'auteur, lié à son profil.
- Le texte du message.
- Une galerie média pour les pièces jointes images et vidéos.
- Jusqu'à trois autres pièces jointes, réenvoyées dans le salon starboard. Si un téléchargement échoue, le nom et la taille du fichier sont affichés à la place.
- Un bouton lien **Jump to Message**.

Les mentions dans le texte republié sont supprimées, afin qu'un message mis en avant ne puisse pas notifier quelqu'un une seconde fois.

## Règles de suppression

| Règle | Par défaut | Quand elle s'applique |
| --- | --- | --- |
| Remove on Delete | Activé | Le message d'origine est supprimé. Nécessite que le bot ait la permission Gérer les messages dans le salon source. |
| Remove on Reactions Clear | Activé | Un modérateur efface toutes les réactions du message d'origine. |
| Remove Below Threshold | Activé | Le total passe sous le seuil après le retrait d'une réaction. |

## Statistiques

`starboardstats` affiche les totaux du serveur : nombre de messages mis en avant, total d'étoiles, membre le plus étoilé, salon le plus actif et étoileur le plus actif. `starboarduserstats [@user]` affiche le nombre de messages mis en avant d'un membre, les étoiles reçues, les étoiles données, ses publications les plus populaires, qui l'étoile le plus, et qu'il étoile le plus. Ces deux commandes sont accessibles à tout le monde.

## Paramètres

La page Starboard comporte deux sections : **Créer un nouveau Starboard** et **Gérer les Starboards**. Chaque entrée de la liste affiche son salon, son émoji, son seuil et son seuil de republication, avec les boutons **Starboard Settings**, **Gérer les salons** et **Supprimer**.

Dans **Starboard Settings** :

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Star Threshold | défini à la création | Nombre de réactions nécessaires avant la publication d'un message |
| Repost Threshold | 0 (désactivé) | Nombre de messages récents à examiner avant une republication en bas |
| Star Emotes | l'émoji de création | Ajoute ou retire les émojis comptabilisés pour ce tableau |
| Allow Bot Messages | Désactivé | Inclut les messages écrits par des bots |
| Remove on Delete | Activé | Supprime la publication lorsque l'original est supprimé |
| Remove on Reactions Clear | Activé | Supprime la publication lorsque les réactions sont effacées |
| Remove Below Threshold | Activé | Supprime la publication lorsque le compteur passe sous le seuil |
| Channel Mode | Whitelist | Indique si la liste de salons est une liste blanche ou une liste noire |

> [!TIP]
> Commencez avec un seuil de 3 à 5 sur un serveur actif. Un seuil de 1 transforme chaque réaction isolée en publication.

## Pas à pas pour la configuration

1. Créez un salon pour les mises en avant et vérifiez que le bot peut y envoyer des messages, intégrer des liens et joindre des fichiers.
2. Ouvrez **Tableau d'honneur** dans le tableau de bord.
3. Sous **Créer un nouveau Starboard**, choisissez le salon, sélectionnez un émoji parmi les choix rapides ou saisissez un émoji personnalisé, définissez **Seuil (réactions nécessaires)** et cliquez sur **Créer un Starboard**.
4. Ouvrez **Starboard Settings** sur la nouvelle entrée. Ajoutez d'éventuels émojis supplémentaires sous **Émotes étoiles** et définissez un **Repost Threshold**, par exemple 20, si le tableau sera très actif.
5. Utilisez **Gérer les salons** pour mettre en liste blanche les salons qui doivent alimenter le tableau, ou passez **Mode des salons** en blacklist et listez les salons à exclure.
6. Réagissez à un message de test avec l'émoji suffisamment de fois pour atteindre le seuil, et vérifiez que la publication apparaît.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` si vous ne l'avez pas modifié). `<id>` est l'ID du starboard obtenu avec `liststarboards`.

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `createstarboard #channel <emote> [threshold]` | `addstarboard`, `newstarboard` | Gérer les salons | Créer un starboard ; le seuil vaut 1 par défaut |
| `deletestarboard <id>` | `removestarboard`, `delstarboard` | Gérer les salons | Supprimer la configuration d'un starboard |
| `liststarboards` | `starboardlist`, `starboards` | Aucune | Parcourir chaque starboard et ses paramètres |
| `setstarthreshold <id> <number>` | `starthreshold` | Gérer les salons | Définir le nombre de réactions nécessaires |
| `setrepostthreshold <id> <number>` | `starboardrepost`, `repostthreshold` | Gérer les salons | Définir la fenêtre de republication ; 0 la désactive |
| `addstarboardemote <id> <emote>` | `addstaremote`, `starboardaddemote`, `asbe` | Gérer les salons | Ajouter un émoji à un starboard |
| `removestarboardemote <id> <emote>` | `removestaremote`, `starboardremoveemote`, `rsbe` | Gérer les salons | Retirer un émoji ; le dernier ne peut pas être retiré |
| `starboardallowbots <id> <true or false>` | `starbots`, `starbotsallow`, `starbab` | Gérer les salons | Autoriser les messages écrits par des bots |
| `starboardremoveondelete <id> <true or false>` | `starboarddelete`, `stardelete`, `srod` | Gérer les salons | Supprimer la publication lorsque l'original est supprimé |
| `starboardremoveonreactionsclear <id> <true or false>` | `starboardreactionclear`, `starclear` | Gérer les salons | Supprimer la publication lorsque les réactions sont effacées |
| `starboardremoveonbelowthreshold <id> <true or false>` | `starboardbelowthreshold`, `starbelow`, `srobt` | Gérer les salons | Supprimer la publication lorsqu'elle passe sous le seuil |
| `starboardwlmode <id> <whitelist or blacklist>` | `starboardmode`, `starboardwhitelist`, `swm` | Gérer les salons | Définir le traitement de la liste de salons |
| `starboardchtoggle <id> #channel` | `starboardchannel`, `togglestarboardchannel`, `scht` | Gérer les salons | Ajouter ou retirer un salon de la liste |
| `starboardstats` | `starstats`, `starboardstatistics`, `sbstats` | Aucune | Statistiques du starboard à l'échelle du serveur |
| `starboarduserstats [@user]` | `staruserstats`, `userstarstats`, `sbuserstats` | Aucune | Statistiques d'un membre |

Les équivalents slash se trouvent sous `/starboard`.

## Astuces et pièges

- Le bot ne fait rien, sans signaler d'erreur, s'il ne peut pas envoyer de messages dans le salon starboard. Vérifiez d'abord les permissions du salon.
- Remove on Delete ne fonctionne que si le bot a la permission Gérer les messages dans le salon où se trouvait le message d'origine.
- Les réactions des bots ne comptent jamais dans le seuil ; un autre bot qui réagit automatiquement ne peut donc pas pousser des messages sur le tableau.
- Supprimer un starboard n'efface que sa configuration. Les publications existantes dans le salon restent en place.
- Un même émoji ne peut pas être partagé entre deux tableaux. Choisissez des émojis distincts pour chacun.
- Les très grosses pièces jointes peuvent échouer lors de la réupload ; la publication affiche alors le nom du fichier à la place.

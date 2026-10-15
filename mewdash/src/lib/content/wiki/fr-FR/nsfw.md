---
title: NSFW
slug: nsfw
summary: Commandes d'images pour adultes qui ne fonctionnent que dans les salons marqués NSFW, avec une liste noire de tags par serveur et une publication automatique programmée facultative.
icon: fa-eye-slash
category: Entertainment
module: Nsfw
tags: [nsfw, hentai, booru, rule34, e621, danbooru, gelbooru, nhentai, reddit, tag blacklist, autohentai, nsfwtoggle, liste noire de tags, publication automatique, salon nsfw]
related: [servermanagement, permissions, filter]
---

## Fonctionnement

Le module NSFW récupère sur demande des images pour adultes depuis des sites d'images et Reddit. Chaque commande du module est soumise à l'exigence NSFW de Discord : elle ne fonctionne que dans un salon dont l'indicateur NSFW est activé, et la plupart des commandes de sites d'images fonctionnent aussi en message privé avec le bot. Dans tout autre salon, la commande est refusée silencieusement.

Le personnel contrôle deux éléments. `nsfwtoggle` (dans le module Administration) inverse l'indicateur NSFW du salon actuel, ce qui débloque ces commandes dans ce salon. `nsfwtagbl` tient une liste de tags retirés de toutes les recherches sur les sites d'images de ce serveur ; un serveur peut ainsi autoriser le module tout en excluant les contenus qu'il ne souhaite pas.

Les membres exécutent une commande de source, avec des tags facultatifs, et reçoivent une image accompagnée de sa cote, de sa source et de ses premiers tags. Les variantes « bomb » publient quatre images à la fois. Les modérateurs peuvent aussi lancer un minuteur qui publie une nouvelle image dans un salon toutes les X secondes.

## Pourquoi l'utiliser

- Un serveur réservé aux 18 ans et plus souhaite confiner les commandes d'images à ses salons marqués.
- Le personnel veut bloquer certains tags à l'échelle du serveur sans désactiver le module.
- Un salon dédié doit recevoir une nouvelle image à intervalles réguliers, sans que personne n'ait à taper de commande.

## Exigence de salon

L'indicateur NSFW de Discord se définit salon par salon. Exécutez `nsfwtoggle` dans un salon pour l'activer ou le désactiver ; cette action nécessite la permission Gérer les salons pour vous et pour le bot. Le bot répond pour confirmer le nouvel état. Le même indicateur peut être défini dans les paramètres du salon sur Discord.

Si une commande est utilisée dans un salon non NSFW, rien ne se passe. Les membres pensent parfois que le bot est défaillant ; une note dans votre salon de règles peut éviter ce malentendu.

## Sources

| Commande | Source | Remarques |
| --- | --- | --- |
| `hentai [tags]` | Sites combinés, contenu explicite uniquement | Délai de cinq secondes |
| `yandere`, `konachan`, `sankaku`, `e621`, `rule34`, `danbooru`, `gelbooru`, `derpibooru`, `safebooru`, `realbooru` | Le site indiqué | Chacune accepte des tags facultatifs |
| `hentaibomb [tags]` | Yandere, Danbooru, Konachan et Gelbooru | Quatre images à la fois |
| `pornbomb [tags]` | Realbooru | Quatre images à la fois |
| `redditnsfw <subreddit>` | Un message populaire aléatoire de ce subreddit | Délai de dix secondes |
| `boobs`, `butts` | Subreddits fixes via `redditnsfw` | |
| `pussy`, `anal`, `porn`, `bondage`, `hentaigif` | Points d'accès par catégorie | Salon NSFW uniquement, pas de message privé |
| `nhentai <id>` | Une galerie précise par son numéro | Refuse les galeries marquées lolicon ou shotacon |
| `nhentaisearch <query> [page] [type] [blacklist]` | Recherche de galeries | |

Les tags sont séparés par des espaces. Sur e621 et Derpibooru, le tag `yuri` est automatiquement traduit en équivalent du site. Une seule commande `hentaibomb` et une seule commande `pornbomb` peuvent s'exécuter en même temps par serveur.

## Liste noire de tags

`nsfwtagbl` sans argument affiche les tags figurant sur la liste noire. `nsfwtagbl <tag>` ajoute le tag, ou le retire s'il figure déjà dans la liste. Les résultats contenant un tag de la liste noire sont ignorés par toutes les commandes de sites d'images du serveur. Cette commande nécessite la permission Gérer les messages.

## Publication automatique

`autohentai <seconds> [tags]`, `autoboobs <seconds>` et `autobutts <seconds>` lancent un minuteur dans le salon actuel. L'intervalle doit être d'au moins 20 secondes pour `autohentai` et `autobutts` ; `autoboobs` n'impose pas de minimum. Exécuter la commande avec `0`, ou sans intervalle, arrête le minuteur de ce salon. Pour `autohentai`, séparez les jeux de tags alternatifs par `|` ; le bot en choisit un au hasard à chaque fois. Laissez les tags de côté pour obtenir des images aléatoires. Ces commandes nécessitent la permission Gérer les messages, et le salon doit être NSFW. Les minuteurs ne survivent pas à un redémarrage du bot.

## Paramètres

Ce module n'a pas de page dans le tableau de bord.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Indicateur NSFW du salon | désactivé | Si l'une de ces commandes s'exécute dans un salon |
| Liste noire de tags | vide | Tags exclus des résultats des sites d'images sur ce serveur |
| Minuteurs de publication automatique | aucun | Minuteurs par salon lancés avec les commandes `auto...` |

## Guide de configuration

1. Choisissez le salon et exécutez `nsfwtoggle` dedans, ou définissez l'indicateur dans les paramètres du salon sur Discord.
2. Utilisez les permissions de commande pour empêcher le module d'être actif ailleurs, par exemple `srvrmdl nsfw disable` suivi de `chnlmdl nsfw enable #adult`.
3. Ajoutez les tags que vous ne voulez pas avec `nsfwtagbl <tag>`, un par commande.
4. Testez avec `hentai` ou `rule34 <tag>` dans le salon.
5. Vous pouvez éventuellement lancer `autohentai 300 <tags>` et l'arrêter plus tard avec `autohentai 0`.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Gérer les salons | Active ou désactive l'indicateur NSFW du salon actuel |
| `nsfwtagbl [tag]` | `nsfwtbl` | Gérer les messages | Liste, ajoute ou retire un tag de la liste noire |
| `hentai [tags]` | | Aucune | Une image explicite issue des sites combinés |
| `hentaibomb [tags]` | | Aucune | Quatre images provenant de quatre sites |
| `pornbomb [tags]` | | Aucune | Quatre images Realbooru |
| `yandere [tags]` | | Aucune | Yande.re |
| `konachan [tags]` | | Aucune | Konachan |
| `sankaku [tags]` | | Aucune | Sankaku |
| `e621 [tags]` | | Aucune | e621 |
| `rule34 [tags]` | `r34` | Aucune | Rule34 |
| `danbooru [tags]` | | Aucune | Danbooru |
| `gelbooru [tags]` | | Aucune | Gelbooru |
| `derpibooru [tags]` | `derpi` | Aucune | Derpibooru |
| `safebooru [tags]` | | Aucune | Safebooru |
| `realbooru [tags]` | `rb` | Aucune | Realbooru |
| `redditnsfw <subreddit>` | `nsfwsubreddit` | Aucune | Message aléatoire d'un subreddit |
| `boobs` | | Aucune | Raccourci Reddit |
| `butts` | `ass`, `butt` | Aucune | Raccourci Reddit |
| `pussy` | | Aucune | Image par catégorie |
| `anal` | | Aucune | Image par catégorie |
| `porn` | | Aucune | Image par catégorie |
| `bondage` | | Aucune | Image par catégorie |
| `hentaigif` | | Aucune | GIF par catégorie |
| `nhentai <id>` | `nh` | Aucune | Parcourir une galerie par son numéro |
| `nhentaisearch <query> [page] [type] [blacklist]` | `nhsearch`, `nhs` | Aucune | Rechercher des galeries |
| `autohentai [seconds] [tags]` | | Gérer les messages | Publication programmée ; `0` arrête |
| `autoboobs [seconds]` | | Gérer les messages | Publication programmée ; `0` arrête ; pas d'intervalle minimum |
| `autobutts [seconds]` | | Gérer les messages | Publication programmée ; `0` arrête |

## Conseils et pièges

- Le contrôle d'âge repose sur l'indicateur de salon de Discord et sur la liste noire de tags du bot. Le bot ne vérifie ni l'âge ni les rôles des membres ; utilisez les permissions de commande pour cela.
- Les propriétaires du bot peuvent aussi désactiver le module globalement ; il apparaît alors comme bloqué dans le menu d'aide.
- Les sites d'images limitent le débit et renvoient parfois un résultat vide pour des combinaisons de tags trop précises ; le bot répond alors qu'aucune image n'a été trouvée.
- Les minuteurs sont propres à chaque salon et conservés en mémoire. Après un redémarrage, relancez-les.

---
title: Recherches
slug: searches
summary: Faites des recherches sans quitter Discord, de la météo, de l'heure et des définitions de dictionnaire aux animes, films, images, profils osu!, blagues et GIF de réaction.
icon: fa-magnifying-glass
category: Entertainment
module: Searches
tags: [search, weather, time, define, urban dictionary, wikipedia, google, image search, anime, manga, movie, osu, pokemon, translate, xkcd, meme, reddit, hug, pat, ship, recherche, météo, heure, définition, dictionnaire, wikipédia, image, film, profil, blague, GIF, traduction]
related: [streams, feeds, twitch, games, utility]
---

## Ce que cela fait

Le module Recherches est un ensemble de commandes de recherche qui récupèrent quelque chose auprès d'un service externe et le publient dans le salon. Les membres demandent la météo d'une ville, l'heure dans un endroit, la définition d'un mot, un anime ou un film, un résumé Wikipédia, un chat au hasard, ou un GIF de réaction pour un câlin ou une gifle. La plupart des résultats sont renvoyés sous forme d'embed, et les recherches comportant beaucoup de résultats sont paginées.

Il n'existe aucune page de tableau de bord. Presque toutes les commandes sont accessibles à tous, et seul le mode de traduction automatique nécessite les permissions du personnel.

Les notifications de streams et les flux RSS font partie du même module du bot, mais ont leurs propres articles. Consultez les pages sur les notifications de streams et les flux pour `streamadd`, `feedadd` et leurs équivalents.

## Pourquoi l'utiliser

- Réglez la question « quelle heure est-il chez toi ? » avec `time` au lieu de faire le calcul.
- Consultez les prévisions avant un événement grâce à une carte `weather` interactive.
- Recherchez un anime, un manga ou un personnage pendant que vous en discutez.
- Laissez les membres envoyer des câlins, des tapes sur la tête et des high-fives sous forme de GIF.
- Traduisez un message sur-le-champ, ou traduisez automatiquement un salon pour une communauté internationale.

## Météo et heure

`weather <place>` géocode le lieu avec Open-Meteo et affiche les conditions actuelles : température, ressenti, humidité, vitesse du vent et rafales, pression, couverture nuageuse, visibilité, ainsi que les maximales et minimales du jour. Des boutons et une liste déroulante permettent de passer aux prévisions horaires, aux conditions horaires détaillées, et à une vue quotidienne avec les maximales, minimales et précipitations d'aujourd'hui et de demain.

`time <place>` recherche le lieu et affiche l'heure actuelle et le fuseau horaire. Lorsque plusieurs lieux correspondent, il propose les candidats parmi lesquels choisir.

## Mots et connaissances

| Commande | Source | Résultat |
| --- | --- | --- |
| `define <word>` | Dictionnaire Pearson | Définition, nature grammaticale et une phrase d'exemple |
| `urbandict <term>` | Urban Dictionary | Définitions, paginées |
| `wiki <query>` | Wikipédia | Résumé de la première page correspondante |
| `wikia <site> <query>` | Un wiki Fandom | Résumé provenant de ce wiki |
| `google <query>` | Google, avec repli sur DuckDuckGo | Résultats web |
| `bible <book> <chapter:verse>` | API Bible | Le texte du verset |
| `resolvetonetags <text>` | intégré | Explique les balises de ton comme `/j` ou `/s` trouvées dans le texte |
| `translate <langs> <text>` | API de traduction | Texte traduit ; langs est `from>to`, par exemple `translate en>fr hello` |
| `translangs` | API de traduction | Langues utilisables |

### Traduction automatique

`autotranslate` active ou désactive la traduction automatique pour le salon actuel et nécessite la permission Administrateur. Passez `del` pour supprimer le message original après l'avoir traduit, ou `nodel` (par défaut) pour le conserver. Chaque membre exécute ensuite `autotranslang en>fr` pour définir sa propre paire de langues dans ce salon, ou `autotranslang` sans rien pour la retirer.

## Médias et fandom

| Commande | Ce que vous obtenez |
| --- | --- |
| `anime <query>` | Résultats de recherche d'animes avec détails |
| `manga <query>` | Résultats de recherche de mangas |
| `charinfo <name>` | Les noms, la description et l'image d'un personnage |
| `findanime [image]` | Identifie un anime à partir d'une capture d'écran via trace.moe ; joignez une image ou donnez une URL |
| `mal <username or @user>` | Un profil MyAnimeList avec les statistiques de visionnage, de séries terminées et autres |
| `movie <title>` | Détails IMDb via OMDb |
| `youtube <query>` | Résultats de recherche YouTube |
| `steam <game>` | Lien vers la page du jeu sur le magasin Steam |
| `pokemon <name>` | Détails sur un Pokémon |
| `osu <user> [mode]`, `osu5 <user> [mode]` | Profil osu!, ou cinq meilleures parties ; les modes sont standard, taiko, catch et mania |
| `gatari <user> [mode]` | Profil osu!Gatari |
| `xkcd [number or latest]` | Une bande dessinée xkcd, au hasard par défaut |

## Images

`image <query>` recherche sur Google et DuckDuckGo avec la recherche sécurisée stricte, puis passe les résultats par une vérification de sécurité avant de les afficher dans un embed paginé. Elle peut être utilisée une fois toutes les vingt secondes par membre. `safebooru <tag>` récupère une image étiquetée sur Safebooru. `revimg <url>` et `revav [@user]` donnent des liens de recherche d'image inversée sur Google, TinEye et Yandex pour une image ou un avatar. `color <hex...>` affiche des pastilles pour une ou plusieurs couleurs hexadécimales.

Images aléatoires : `randomcat`, `randomdog`, `randomfood`, `randombird`, `randomneko`, `randomkitsune` et `randomwaifu`. `meme` publie un mème au hasard issu d'un ensemble de subreddits, et `randomreddit <subreddit>` publie une publication au hasard d'un subreddit après avoir vérifié qu'il n'est pas marqué NSFW. `memelist` affiche les modèles memegen et `memegen <template> [text]` en crée un. `rip @user` crée une image de pierre tombale avec leur nom et leur avatar. `shorten <url>` raccourcit un lien.

## Blagues

`randjoke`, `yomama`, `chucknorris`, `wowjoke` et `magicitem` récupèrent chacun une blague ou la description d'un objet depuis leurs API respectives. `catfact` publie un fait sur les chats.

## Commandes de réaction

Elles publient un GIF d'anime pour l'action. Celles qui visent quelqu'un prennent une mention : `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold` et `highfive`. Celles qui concernent votre propre personne acceptent un texte facultatif : `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave` et `wink`. Toutes sont aussi disponibles en commandes slash.

`ship @user [@user2]` évalue la compatibilité de deux membres (ou de vous et d'un membre) et publie une image de couple accompagnée d'un commentaire.

## Paramètres

Ce module n'a pas de page de tableau de bord ni de paramètres par serveur, à part l'interrupteur de traduction automatique. Plusieurs commandes reposent sur des clés d'API configurées par le propriétaire du bot ; si une clé manque, la commande répond par une erreur au lieu de renvoyer des résultats.

## Guide de configuration

1. Rien à activer. Exécutez `weather London` ou `define serendipity` pour vérifier que le bot peut répondre dans le salon.
2. Si vous voulez un salon traduit, exécutez `autotranslate` dans ce salon en tant qu'administrateur, puis demandez aux membres de définir `autotranslang en>es` ou similaire.
3. Utilisez le module des permissions si vous voulez restreindre les commandes de réaction ou d'images à certains salons.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Objectif |
| --- | --- | --- | --- |
| `weather <place>` | `we` | Personne | Carte météo interactive |
| `time <place>` | | Personne | Heure actuelle et fuseau horaire |
| `define <word>` | `def` | Personne | Définition du dictionnaire |
| `urbandict <term>` | `ud` | Personne | Urban Dictionary |
| `wiki <query>` | `wikipedia` | Personne | Résumé Wikipédia |
| `wikia <site> <query>` | `fandom` | Personne | Recherche dans un wiki Fandom |
| `google <query>` | `g` | Personne | Recherche web |
| `bible <book> <chapter:verse>` | | Personne | Verset biblique |
| `resolvetonetags <text>` | `tonetag`, `resolvetonetag`, `tonetags` | Personne | Explique les balises de ton |
| `translate <langs> <text>` | `trans` | Personne | Traduire un texte, par exemple `translate en>fr hello` |
| `translangs` | | Personne | Langues prises en charge |
| `autotranslate [del\|nodel]` | `at`, `autotrans` | Administrateur | Activer ou désactiver la traduction automatique du salon |
| `autotranslang [from>to]` | `atl` | Personne | Votre paire de langues pour la traduction automatique |
| `anime <query>` | `ani`, `aq` | Personne | Recherche d'anime |
| `manga <query>` | `mang`, `mq` | Personne | Recherche de manga |
| `charinfo <name>` | `characterinfo` | Personne | Recherche de personnage |
| `findanime [image]` | `whatanime` | Personne | Identifier un anime à partir d'une capture d'écran |
| `mal <username or @user>` | | Personne | Profil MyAnimeList |
| `movie <title>` | `omdb`, `imdb` | Personne | Détails d'un film |
| `youtube <query>` | `yt` | Personne | Recherche YouTube |
| `steam <game>` | | Personne | Lien vers le magasin Steam |
| `pokemon <name>` | | Personne | Détails sur un Pokémon |
| `osu <user> [mode]` | | Personne | Profil osu! |
| `osu5 <user> [mode]` | | Personne | Cinq meilleures parties osu! |
| `gatari <user> [mode]` | | Personne | Profil osu!Gatari |
| `xkcd [number\|latest]` | | Personne | Bande dessinée xkcd |
| `image <query>` | `img`, `rimg` | Personne | Recherche d'images sécurisée |
| `safebooru [tag]` | | Personne | Image Safebooru |
| `revimg <url>` | | Personne | Liens de recherche d'image inversée |
| `revav [@user]` | | Personne | Recherche inversée d'un avatar |
| `color <hex...>` | `clr` | Personne | Pastilles de couleur |
| `randomcat` | `meow` | Personne | Image de chat |
| `randomdog` | `woof` | Personne | Image de chien |
| `randomfood` | `yum` | Personne | Image de nourriture |
| `randombird` | `birb`, `bird` | Personne | Image d'oiseau |
| `randomneko` | `neko` | Personne | Image neko |
| `randomkitsune` | `kitsune` | Personne | Image kitsune |
| `randomwaifu` | `waifu` | Personne | Image waifu |
| `meme` | `randommeme` | Personne | Mème Reddit au hasard |
| `randomreddit <subreddit>` | `subreddit` | Personne | Publication au hasard d'un subreddit |
| `memelist` | | Personne | Modèles memegen |
| `memegen <template> [text]` | | Personne | Créer un mème |
| `rip <@user>` | | Personne | Image de pierre tombale |
| `shorten <url>` | | Personne | Raccourcir un lien |
| `randjoke` | | Personne | Blague au hasard |
| `yomama` | `ym` | Personne | Blague « yo mama » |
| `chucknorris` | `cn` | Personne | Blague Chuck Norris |
| `wowjoke` | | Personne | Blague World of Warcraft |
| `magicitem` | `mi` | Personne | Objet magique WoW |
| `catfact` | | Personne | Fait sur les chats |
| `ship <@user> [@user2]` | | Personne | Image du score de compatibilité |
| `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold`, `highfive <@user>` | | Personne | GIF de réaction dirigé vers quelqu'un |
| `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave`, `wink [text]` | | Personne | GIF de réaction sur vous-même |

## Astuces et pièges

- Ces commandes appellent des services externes, donc les résultats dépendent du bon fonctionnement de ces services et de la présence des bonnes clés d'API configurées par le propriétaire du bot.
- `image` est limitée à une recherche toutes les vingt secondes par membre, et les résultats sont filtrés pour des raisons de sécurité, même dans les salons NSFW.
- `randomreddit` refuse les subreddits signalés NSFW. Utilisez le module NSFW pour le contenu pour adultes.
- La traduction automatique se fait par salon et par membre : le salon doit être activé par un administrateur, et chaque membre choisit sa propre paire de langues.
- Les notifications de streams (`streamadd`, `streamlist`, `streamtemplate`) et les flux RSS (`feedadd`, `feedlist`) sont documentés séparément, même s'ils partagent ce module.

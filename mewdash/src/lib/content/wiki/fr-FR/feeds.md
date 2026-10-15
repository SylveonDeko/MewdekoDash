---
title: Flux
slug: feeds
summary: Abonnez un salon à un flux RSS ou Atom et le bot publie chaque nouvel élément, soit sous un embed par défaut, soit dans un message que vous concevez vous-même.
icon: fa-newspaper
category: Actions
dashboard: /dashboard/feeds
module: Searches
tags: [rss, atom, feed, news, blog, youtube, updates, subscriptions, feedadd, flux, actualités, mises à jour, abonnements]
related: [embedbuilder, utility]
---

## Ce que ça fait

Vous donnez au bot une URL de flux et un salon. À partir de là, le bot vérifie le flux régulièrement et publie tout ce qui a été publié depuis la dernière vérification. Les membres voient un nouveau message dans le salon à chaque fois que le site publie quelque chose, avec le titre de l'élément, un lien et, lorsque le flux en fournit un, la description et une image.

Le staff peut abonner jusqu'à dix flux par serveur et donner à chacun son propre message. Le message passe par l'analyseur d'embeds ; une mise à jour de flux peut donc être du texte simple, un embed, ou un embed avec des boutons, et elle peut utiliser des variables qui récupèrent le titre, le lien, l'auteur, etc. de l'élément.

Rien n'est demandé aux membres. Ils lisent simplement le salon.

## Pourquoi l'utiliser

- Publier automatiquement le blog, les notes de mise à jour ou le journal des modifications de votre communauté dans un salon d'annonces.
- Reprendre le flux d'un site d'actualités ou d'un subreddit dans un salon de discussion.
- Suivre une chaîne YouTube ou un podcast via son flux RSS.
- Garder visible un flux de statut ou de sorties sans que personne ne copie les liens à la main.

## Comment les mises à jour sont publiées

Le bot parcourt chaque URL de flux abonné, la récupère, puis attend environ dix secondes avant de passer au suivant. Lors de la première récupération après le démarrage, il enregistre la date du plus récent élément et ne publie rien. Ensuite, chaque élément dont la date de publication est postérieure à la dernière vue est publié, du plus ancien au plus récent, et la date enregistrée avance. Pour les flux Atom, la date de mise à jour de l'élément est utilisée lorsqu'il n'y a pas de date de publication. Les éléments sans aucune des deux sont ignorés.

Il n'existe aucune limite au nombre d'éléments publiés en un seul passage ; un flux qui envoie vingt entrées datées dans le passé d'un coup produira donc vingt messages.

Les flux qui ne se chargent pas sont ignorés silencieusement jusqu'au passage suivant. Ils ne sont pas supprimés et le bot ne signale pas l'échec.

### Le message par défaut

Si un flux n'a pas de message personnalisé, le bot envoie un embed contenant :

| Élément | Valeur |
| --- | --- |
| Titre | Le titre de l'élément, tronqué à 256 caractères |
| Description | La description de l'élément sans HTML, tronquée à 2048 caractères |
| URL | Le lien de l'élément, pour que le titre soit cliquable |
| Image | Une pièce jointe image du flux, ou un élément Atom `preview` ou `thumbnail` s'il est présent |
| Pied de page | L'URL du flux |

### Messages personnalisés et variables

Définissez un message personnalisé avec `feedmessage` ou le bouton **Modifier le message** du tableau de bord. Le texte passe par l'analyseur d'embeds ; tout ce qui vient de l'[éditeur d'embeds](/wiki/embedbuilder) fonctionne donc : texte simple, JSON d'embed, ou les deux. Les mentions de rôles et d'utilisateurs dans la partie texte simple notifient.

Ces variables sont remplacées dans le message personnalisé, en plus des variables générales de serveur, de salon et de bot de la page des variables.

| Variable | Valeur |
| --- | --- |
| `%title%` | Le titre de l'élément |
| `%author%` | L'auteur de l'élément, ou « Unknown » |
| `%content%` | La description de l'élément sans HTML |
| `%url%` | Lien vers l'élément |
| `%feedurl%` | L'URL propre du flux |
| `%image_url%` | L'image de l'élément si le flux en fournit une, sinon l'image du flux |
| `%categories%` | Les catégories de l'élément, séparées par des virgules |
| `%timestamp%` | La date de publication sous forme d'horodatage Discord |

> [!EXAMPLE]
> `feedmessage 1 New post: **%title%** by %author%
> %url%`

Définissez le message sur `-` pour revenir à l'embed par défaut.

## Paramètres

Les flux n'ont pas de paramètres à l'échelle du serveur. Chaque abonnement a un salon et une URL, choisis lors de l'ajout, ainsi qu'un message facultatif. La page du tableau de bord s'appelle **Flux RSS** et comporte trois onglets.

| Onglet | Ce qu'il affiche |
| --- | --- |
| Flux RSS | Chaque abonnement avec son salon, son URL et sa date d'ajout. **Modifier le message** ou **Ajouter un message personnalisé** ouvre une zone de texte ; un aperçu du message s'affiche en dessous. **Supprimer** retire le flux après confirmation. |
| Ajouter un flux | Un sélecteur **Salon** et une zone **URL du flux RSS**, avec un bouton **Ajouter le flux RSS** |
| Statistiques | **Total des flux**, **Flux uniques**, **Salons** et une répartition **Flux par salon** |

Le salon et l'URL d'un flux existant ne peuvent pas être modifiés. Supprimez le flux et ajoutez-le de nouveau.

## Guide de configuration

1. Ouvrez **Flux** dans le tableau de bord et passez sur **Ajouter un flux**.
2. Choisissez le **Salon** où les mises à jour doivent être envoyées.
3. Collez l'adresse du flux dans **URL du flux RSS** et cliquez sur **Ajouter le flux RSS**. Il doit s'agir d'une adresse complète `http` ou `https` pointant vers un document RSS ou Atom, et non vers la page d'accueil du site.
4. De retour sur **Flux RSS**, cliquez sur **Ajouter un message personnalisé** si vous voulez votre propre formulation, puis sur **Enregistrer**.
5. Exécutez `feedtest 1` dans Discord pour publier le dernier élément et vérifier le résultat. Le numéro correspond à la position du flux dans `feedlist`.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Toutes les commandes de flux nécessitent Gérer les messages.

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `feedadd <url> [#channel]` | `rss` | Gérer les messages | Abonner un salon à un flux. Par défaut, le salon actuel. Le bot récupère d'abord le flux et le rejette s'il est illisible. |
| `feedlist` | `feeds` | Gérer les messages | Lister les abonnements, numérotés, dix par page |
| `feedremove <number>` | `feedrm`, `feeddel` | Gérer les messages | Supprimer un abonnement par son numéro dans la liste |
| `feedmessage <number> <message>` | `rssmessage` | Gérer les messages | Définir le message personnalisé d'un abonnement |
| `rsstest <number>` | `feedtest` | Gérer les messages | Publier le dernier élément du flux dans le salon actuel |

## Astuces et pièges

- La limite est de dix flux par serveur, et une même URL ne peut pas être ajoutée deux fois. `feedadd` signale une seule erreur regroupée pour un lien illisible, un doublon et la limite ; vérifiez donc `feedlist` si vous ne savez plus laquelle s'est produite.
- Ajouter un flux depuis le tableau de bord ne teste pas d'abord l'URL. Utilisez ensuite `feedtest` pour vous assurer que le bot peut le lire.
- Les numéros utilisés dans `feedremove`, `feedmessage` et `feedtest` proviennent de `feedlist`, qui trie les flux par date d'ajout.
- Le bot a besoin de Envoyer des messages et Intégrer des liens dans le salon cible. Sans Intégrer des liens, l'embed par défaut n'apparaîtra pas.
- Seuls les éléments ayant une date de publication (ou, pour Atom, une date de mise à jour) sont publiés. Un flux dont les entrées n'ont pas de dates ne produira jamais de mises à jour.
- Le bot ne publie rien lors de son premier passage après un redémarrage. Il part du dernier élément à ce moment-là, donc les éléments publiés pendant que le bot était hors ligne ne sont pas rattrapés.
- Comme un message personnalisé utilise l'analyseur d'embeds, respectez les mêmes règles que l'éditeur d'embeds : JSON valide, ou texte simple.

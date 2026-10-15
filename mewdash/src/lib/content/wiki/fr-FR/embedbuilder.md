---
title: Embeds
slug: embedbuilder
summary: Créez des messages Discord riches avec des embeds, des boutons et des menus déroulants, enregistrez-les comme modèles, envoyez-les dans un salon et réutilisez le même JSON partout où le bot accepte un message personnalisé.
icon: fa-link
category: Actions
dashboard: /dashboard/embedbuilder
module: Utility
tags: [embed, embed builder, json, say, template, webhook, persona, buttons, select menu, custom message, embed, créateur d'embeds, JSON, modèle, webhook, persona, boutons, menu déroulant, message personnalisé]
related: [multigreets, chat-triggers, afk, feeds, giveaways, suggestions]
---

## Ce que cela fait

Le créateur d'embeds est un éditeur visuel pour les messages Discord. Vous renseignez un titre, une description, une couleur, des champs, des images, et éventuellement des boutons ou des menus déroulants, vous voyez un aperçu en direct, et vous obtenez à la fin un bloc de JSON. Ce JSON est le format universel de message du bot. Collez-le dans `say` pour le publier, enregistrez-le comme modèle nommé, ou insérez-le dans n'importe quelle fonctionnalité qui accepte un message personnalisé, comme les messages de bienvenue, les déclencheurs de discussion, les réponses AFK, les mises à jour de flux ou le MP destiné au gagnant d'un concours.

Les modèles peuvent être personnels, visibles uniquement par vous sur tous les serveurs, ou partagés avec un serveur afin que tout membre du personnel puisse les charger. Le tableau de bord peut aussi envoyer un message terminé directement dans un salon, éventuellement via un webhook avec un nom et un avatar personnalisés, appelé persona.

Les membres n'interagissent jamais avec le créateur. Ils ne voient que les messages qu'il produit.

## Pourquoi l'utiliser

- Rédigez un message de règles ou d'informations avec une mise en forme soignée, puis mettez-le à jour plus tard avec `edit`.
- Concevez un message de bienvenue une seule fois, puis collez le JSON dans les messages de bienvenue.
- Gardez un ensemble de modèles d'annonces pour que le personnel publie des mises à jour à l'apparence cohérente.
- Ajoutez des boutons qui déclenchent des déclencheurs de discussion, ou un menu déroulant qui attribue des rôles via des déclencheurs.
- Publiez en tant que « Server News » avec son propre avatar sans donner d'accès webhook à qui que ce soit.

## Le format JSON

L'analyseur cherche le premier `{` dans le texte et lit jusqu'au `}` correspondant. S'il n'y a pas d'objet JSON, ou s'il ne peut pas être analysé, tout le texte est traité comme du contenu brut. Les noms de propriétés ne sont pas sensibles à la casse.

| Clé | Type | Signification |
| --- | --- | --- |
| `content` | chaîne | Texte brut affiché au-dessus des embeds |
| `embed` | objet | Un seul embed. S'il est présent, `embeds` est ignoré. |
| `embeds` | tableau | Jusqu'à dix objets embed |
| `components` | tableau | Boutons et menus déroulants |

Un objet embed accepte `title`, `description`, `url`, `color`, `author` (`name`, `url`, `icon_url`), `footer` (`text`, `icon_url`), `thumbnail` (`url`), `image` (`url`) et `fields` (tableau de `name`, `value`, `inline`). `color` peut être un nombre ou une chaîne comme `#5865F2`. Les noms de champs sont tronqués à 256 caractères et les valeurs à 1024. Toute URL qui n'est pas une adresse absolue complète est supprimée au lieu de faire échouer tout le message. La clé `timestamp` est acceptée mais non affichée.

Un composant possède `row` (la ligne où il se trouve), `displayName`, et soit `url` pour un bouton de lien, soit `id` pour un bouton lié à un déclencheur de discussion. `style` vaut de 1 à 4 pour les quatre styles de boutons Discord, et `emoji` est facultatif. Définissez `isSelect` sur true pour un menu déroulant, puis fournissez `options` (chacune avec `id`, `name`, `description`, `emoji`) ainsi que `minOptions` et `maxOptions` entre 0 et 25. Un composant qui enfreint une règle s'affiche comme un bouton rouge désactivé dont le libellé est l'erreur, afin que vous puissiez voir ce qui ne va pas dans Discord.

> [!EXAMPLE]
> `{"content": "Welcome %user.mention%!", "embeds": [{"title": "Read the rules", "description": "See %channel.mention%", "color": "#57F287"}]}`

### Espaces réservés

Le bouton **%** du créateur insère des espaces réservés depuis la page des espaces réservés (utilisateur, serveur, salon, bot, heure, etc.). Le tableau de bord ne les remplace pas : un message envoyé depuis l'onglet **Envoyer** part avec le texte littéral. Le bot remplace les espaces réservés lorsque du JSON transite par une commande ou une fonctionnalité, par exemple `say`, `embedpreview`, les messages de bienvenue et les déclencheurs. Chaque fonctionnalité ajoute son propre ensemble, comme `%afk.message%` ou `%giveawayitem%`, en plus des espaces réservés généraux.

## Modèles

Un modèle est un nom accompagné du JSON. Il existe deux portées.

| Portée | Qui le voit | Créé par |
| --- | --- | --- |
| Personnelle | Vous seul, sur n'importe quel serveur et en MP | `embedsave`, ou **Enregistrer** sur le tableau de bord avec le partage décoché |
| Partagée sur le serveur | Toute personne ayant accès sur ce serveur | `guildembedsave` (Gérer les messages), ou **Enregistrer** avec **Share with everyone in (server)** coché |

Les noms doivent être uniques au sein d'une portée. `embedpreview <name>` recherche d'abord votre modèle personnel, puis celui partagé du serveur, remplace les espaces réservés et le publie dans le salon actuel.

Certaines commandes acceptent une référence de modèle à la place du JSON brut : écrivez `{template:name}` ou `{t:name}` comme message. `multigreetmessage` le prend en charge. Le JSON résolu est enregistré, et non la référence ; les modifications ultérieures du modèle ne mettent donc pas à jour le message de bienvenue.

## La page du tableau de bord

La page s'intitule **Créateur d'embeds Discord** et comporte six onglets, avec un **Aperçu en direct** et un panneau **Problèmes** à côté. **Annuler**, **Rétablir**, **Annuler les modifications** et **Copier le JSON** se trouvent dans l'en-tête.

| Onglet | Ce que vous y faites |
| --- | --- |
| Templates | Choisir dans une galerie de points de départ ou **Partir de zéro** |
| Editor | **Contenu du message** plus jusqu'à dix embeds. Chaque embed possède un titre, une description, une URL, une couleur, un auteur, un pied de page, jusqu'à 25 champs, une miniature et une image, avec des compteurs de caractères. |
| Components | Jusqu'à cinq lignes et 25 composants. Ajoutez des boutons (texte, style, emoji, URL ou déclencheur) et des menus déroulants (espace réservé, options avec liaisons de déclencheurs). |
| JSON | La charge utile brute. **Actualiser depuis le créateur** la régénère ; **Appliquer au créateur** charge le JSON collé, qu'il s'agisse d'une charge utile complète ou d'un seul objet embed. |
| Saved | **Enregistrer l'embed actuel** avec un nom et la case de partage, puis les listes **Shared in (server)** et **My Embeds** avec **Charger** et **Supprimer** |
| Send | Choisissez un salon, vérifiez vos permissions dans ce salon, envoyez éventuellement via un webhook en tant que persona ou avec un nom et une URL d'avatar personnalisés, puis **Envoyer le message** |

### Envoi et personas

L'onglet **Envoyer** ne liste que les salons où vous et le bot pouvez publier. L'envoi d'embeds nécessite la permission Intégrer des liens pour les deux. Si vous n'avez pas la permission Mentionner @everyone, les mentions de tous, de here et des rôles sont retirées et l'onglet vous en avertit.

L'envoi par webhook nécessite la permission Gérer les webhooks pour vous et pour le bot. Un **persona** est un nom et un avatar enregistrés, personnels ou partagés avec le serveur ; **Gérer** ouvre la liste des personas. Les personas dotés d'une image importée obtiennent leur propre webhook dans chaque salon, donc un salon peut en contenir quinze au maximum. L'option **Personnalisé** prend à la place un nom d'affichage et un lien d'avatar. Chaque envoi est consigné dans le journal d'audit du tableau de bord.

Le même créateur s'ouvre en fenêtre contextuelle dans d'autres pages du tableau de bord (messages de bienvenue, déclencheurs et autres), avec uniquement les onglets **Éditeur**, **Composants**, **JSON** et **Enregistré**.

## Paramètres

Le créateur n'a aucun paramètre de serveur. Tout se règle par message ou par modèle.

## Guide de configuration

1. Ouvrez **Embeds** dans le tableau de bord et choisissez un modèle ou **Partir de zéro**.
2. Dans **Éditeur**, rédigez le contenu et renseignez l'embed. Surveillez le panneau **Problèmes** pour tout ce que Discord refuserait.
3. Ajoutez des boutons ou des menus dans **Composants** si nécessaire, en liant chacun à un déclencheur de discussion ou à une URL.
4. Allez dans **Enregistré**, donnez-lui un nom, cochez **Share with everyone in (server)** si le personnel doit l'utiliser, et cliquez sur **Enregistrer**.
5. Pour le publier maintenant, ouvrez **Envoyer**, choisissez un salon et cliquez sur **Envoyer le message**. Pour l'utiliser ailleurs, cliquez sur **Copier le JSON** et collez-le dans l'autre fonctionnalité.
6. Dans Discord, `embedpreview <name>` publie un modèle enregistré avec les espaces réservés remplis.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Objectif |
| --- | --- | --- | --- |
| `say [#channel] <text or JSON>` | | Gérer les messages | Publier du texte ou du JSON d'embed en tant que bot, avec les espaces réservés remplacés. Une pièce jointe `.txt` peut fournir le message. |
| `edit #channel <message id> <text or JSON>` | | Gérer les messages | Remplacer le contenu d'un message envoyé par le bot |
| `embedsave <name> <JSON>` | `esave` | Personne | Enregistrer un modèle personnel |
| `embedlist` | `elist` | Personne | Lister vos modèles personnels |
| `embeddelete <name>` | `edel`, `edelete` | Personne | Supprimer un de vos modèles personnels |
| `guildembedsave <name> <JSON>` | `gesave`, `gembedsave` | Gérer les messages | Enregistrer un modèle partagé avec ce serveur |
| `guildembedlist` | `gelist`, `gembedlist` | Personne | Lister les modèles partagés du serveur |
| `guildembeddelete <name>` | `gedel`, `gembeddelete` | Gérer les messages | Supprimer un modèle partagé |
| `embedpreview <name>` | `epreview`, `eprev` | Personne | Publier un modèle enregistré dans le salon actuel |

## Astuces et pièges

- `say` reprend vos propres droits de mention : sans la permission Mentionner @everyone, le bot ne mentionnera pas tout le monde ni des rôles à votre place.
- Un embed avec seulement un titre et rien d'autre est tout de même envoyé, mais le tableau de bord ne vous laissera pas copier ou envoyer tant qu'il n'y a pas un titre, une description, un champ ou du contenu.
- Les boutons liés à un déclencheur ne fonctionnent que sur le serveur dont l'identifiant de déclencheur est référencé. Charger un modèle partagé sur un autre serveur laisse ces boutons cassés.
- Les URL malformées d'images, de miniatures, d'auteurs et de pieds de page sont supprimées silencieusement. Si une image manque, vérifiez que l'URL commence par `https://`.
- Discord limite un message à dix embeds, 25 champs par embed, cinq lignes de composants et cinq boutons par ligne. Le créateur applique les mêmes limites.
- Supprimer un persona ne retire pas les webhooks qu'il a créés dans les salons. Nettoyez-les dans les paramètres d'intégrations du salon si nécessaire.

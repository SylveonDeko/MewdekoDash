---
title: Suggestions
slug: suggestions
summary: Permettez aux membres de soumettre des idées via un salon ou un bouton, laissez le serveur voter, et laissez le personnel accepter, refuser, étudier ou mettre en œuvre chacune d'elles avec un motif.
icon: fa-lightbulb
category: Community
dashboard: /dashboard/suggestions
module: Suggestions
tags: [suggestions, ideas, feedback, voting, accept, deny, consider, implement, threads, suggest button, placeholders, idées, retours, vote, accepter, refuser, étudier, mise en œuvre, fils, bouton de suggestion, placeholders]
related: [administration, afk]
---

## Fonctionnement

Un membre utilise `suggest` avec son idée, la tape directement dans le salon des suggestions, ou appuie sur un bouton **Suggest Here!** et remplit un formulaire. Le bot supprime le message d'origine, publie un embed de suggestion numéroté dans le salon des suggestions, et ajoute les émotes de vote sous forme de réactions ou de boutons. Chaque suggestion reçoit un numéro que le personnel utilise pour la désigner ensuite.

Le personnel fait ensuite passer la suggestion par quatre états : accepter, refuser, étudier ou mettre en œuvre, chacun accompagné d'un motif facultatif. Le bot modifie le message de suggestion d'origine en embed de statut coloré, envoie un message privé au membre qui a fait la suggestion avec le résultat, et peut republier l'embed de statut dans un salon distinct pour chaque état, afin que les idées acceptées soient regroupées au même endroit et les idées refusées ailleurs.

Facultativement, chaque suggestion peut comporter un bouton **Join/Create Discussion** qui ouvre un fil public ou privé sous celle-ci. Lorsque le personnel change l'état, le fil peut être archivé automatiquement.

## Pourquoi l'utiliser

- Des salons de retours où les idées se perdent parmi les réponses ; chaque suggestion devient son propre message avec un nombre de votes.
- Des communautés qui souhaitent que les membres voient ce qui a été accepté et ce qui a été rejeté, et pourquoi, sans que le personnel rédige des annonces.
- Des serveurs qui veulent une discussion par idée plutôt que des débats dans le salon principal, grâce aux fils.
- Un personnel qui souhaite trier depuis le tableau de bord avec une zone de motif, sans avoir à retenir les numéros de suggestions.

## Comment une suggestion est soumise

Il existe trois façons de soumettre une suggestion, toutes soumises aux mêmes vérifications de longueur et aboutissant dans le salon des suggestions.

| Méthode | Ce qui se passe |
| --- | --- |
| `suggest <text>` | Le message de la commande est supprimé et la suggestion est publiée. Fonctionne depuis n'importe quel salon. |
| Saisie dans le salon des suggestions | Tout message non envoyé par un bot et ne commençant pas par le préfixe est transformé en suggestion, et le message d'origine est supprimé. Les membres disposant du rôle du personnel du serveur sont ignorés, afin que le personnel puisse discuter normalement dans le salon. |
| Le bouton de suggestion | Un message avec un bouton dans le **Suggest Button Channel**. En appuyant dessus, un formulaire s'ouvre, dont les limites de longueur correspondent à vos paramètres. |

Si le texte dépasse la **Maximum Length** ou est plus court que la **Minimum Length**, il est rejeté. Avec la commande, l'erreur s'affiche dans le salon et disparaît après cinq secondes ; dans le salon des suggestions, le message est supprimé et le membre reçoit un message privé. Les mentions présentes dans la suggestion sont neutralisées dans l'embed publié, et le membre est informé que sa suggestion a bien été envoyée.

L'embed de suggestion par défaut utilise le membre comme auteur, le titre « Suggestion #N » et le texte comme description. Vous pouvez le remplacer par votre propre embed (voir les placeholders ci-dessous).

### Le bouton de suggestion

Le message du bouton est publié dans le **Suggest Button Channel**, et le bot le maintient en bas du salon : lorsque d'autres messages le font remonter, le bot le supprime et le republie. Le libellé par défaut est **Suggest Here!**, sans émote, avec une couleur bleu blurple. Le message situé au-dessus du bouton peut être du texte brut ou du code d'embed, et correspond par défaut à une courte invitation à « faire une suggestion ».

## Vote

Par défaut, chaque suggestion reçoit un pouce levé et un pouce baissé. Vous pouvez configurer jusqu'à cinq émotes personnalisées à la place avec `suggestmotes` ou le sélecteur **Émotes personnalisées** ; le bot doit pouvoir les utiliser.

Le **Mode d'affichage des émotes** détermine la manière dont les votes sont exprimés.

| Mode | Comportement |
| --- | --- |
| Reactions (par défaut) | Le bot ajoute les émotes comme réactions. Les compteurs sont mis à jour à partir des ajouts et suppressions de réactions. |
| Buttons | Les émotes deviennent des boutons qui affichent un compteur en temps réel. Un membre ne peut avoir qu'un seul vote par suggestion : appuyer à nouveau sur le même bouton demande de le retirer, appuyer sur un autre demande de changer de vote. |

En mode boutons, chacun des cinq boutons d'émotes possède sa propre couleur (**Emote 1 Button** à **Emote 5 Button**). Les couleurs disponibles sont Blue, Grey, Green et Red. Modifier une couleur actualise également le message du bouton de suggestion.

`suggestinfo <number>` affiche le texte, l'auteur de la suggestion, l'état actuel, la personne qui a modifié l'état en dernier, le nombre de changements d'état, et le nombre de votes par émote, avec les boutons Accept, Deny, Consider et Implement en dessous.

## États

Chaque suggestion commence à l'état Suggested (affiché comme Pending sur le tableau de bord). Le personnel disposant de la permission Gérer les messages peut la faire passer à l'un des quatre états avec `accept`, `deny`, `consider` ou `implemented`, depuis les boutons de `suggestinfo`, ou depuis le tableau de bord. Chaque changement d'état accompagné d'un motif affiche ce motif ; sans motif, le champ indique « none ».

| État | Couleur de l'embed | Options supplémentaires |
| --- | --- | --- |
| Accepted | Bleu | Salon d'acceptation, message d'acceptation, archivage à l'acceptation |
| Denied | Rouge | Salon de refus, message de refus, archivage au refus |
| Considered | Or | Salon d'étude, message d'étude, archivage à l'étude |
| Implemented | Vert | Salon de mise en œuvre, message de mise en œuvre, archivage à la mise en œuvre |

Lorsqu'un état change, le bot effectue les opérations suivantes, dans cet ordre :

1. Archive le fil de discussion si l'option d'archivage de cet état est activée.
2. Modifie le message d'origine dans le salon des suggestions en embed de statut et supprime toutes les réactions. Si le message d'origine n'existe plus, un nouveau message est publié.
3. Envoie à l'auteur de la suggestion un message privé contenant un embed avec la suggestion, le motif et la personne qui a modifié l'état. La confirmation du personnel indique si le message privé a été livré ou si le membre a désactivé les messages privés.
4. Enregistre le nouvel état et la personne qui l'a modifié.
5. Si un salon est défini pour cet état, publie l'embed de statut dans ce salon et supprime le message de statut précédent de cette suggestion, afin qu'une suggestion passant de Considered à Accepted ne laisse pas une copie obsolète derrière elle.

Une suggestion peut changer d'état autant de fois que vous le souhaitez. Aucune commande ne permet de la remettre à l'état Pending.

### Le message de statut

L'embed de statut par défaut a pour auteur la personne qui a fait la suggestion, un titre tel que « Suggestion #12 Accepted », le texte de la suggestion comme description et un champ **Motif**. Définissez le vôtre avec `acceptmessage`, `denymessage`, `considermessage` ou `implementmessage`, ou avec les quatre éditeurs de l'onglet **Messages** du tableau de bord. Utilisez `-` pour revenir au texte par défaut. Le texte personnalisé est traité par l'analyseur d'embed ; s'il ne s'agit pas d'un code d'embed valide, il est utilisé comme description de l'embed.

## Placeholders

Le message de suggestion (publié à la soumission) accepte les placeholders suivants, ainsi que les placeholders généraux du serveur présentés sur la page des placeholders.

| Placeholder | Valeur |
| --- | --- |
| `%suggest.user%` | Nom d'utilisateur complet de la personne qui a fait la suggestion |
| `%suggest.user.name%` | Le nom d'utilisateur de la personne qui a fait la suggestion |
| `%suggest.user.avatar%` | L'URL de l'avatar de la personne qui a fait la suggestion |
| `%suggest.message%` | Le texte de la suggestion, mentions neutralisées |
| `%suggest.number%` | Le numéro de la suggestion |

Les messages d'acceptation, de refus, d'étude et de mise en œuvre acceptent tous les placeholders ci-dessus, les placeholders généraux du serveur, ainsi que les placeholders supplémentaires suivants.

| Placeholder | Valeur |
| --- | --- |
| `%suggest.user.id%` | L'identifiant utilisateur de la personne qui a fait la suggestion |
| `%suggest.mod.user%` | Nom d'utilisateur complet du membre du personnel qui a modifié l'état |
| `%suggest.mod.name%` | Nom d'utilisateur de ce membre du personnel |
| `%suggest.mod.avatar%` | L'URL de son avatar |
| `%suggest.mod.Id%` | Son identifiant utilisateur (attention à la majuscule du I) |
| `%suggest.mod.message%` | Le motif indiqué, ou « none » |
| `%suggest.emote1count%` à `%suggest.emote5count%` | Nombre de votes pour chaque émote au moment du changement |

> [!EXAMPLE]
> Un message de refus simple : `Suggestion #%suggest.number% by %suggest.user% was denied by %suggest.mod.name%: %suggest.mod.message%`

## Fils

**Type de fil** ajoute une deuxième rangée de boutons à chaque nouvelle suggestion.

| Type | Bouton | Résultat |
| --- | --- | --- |
| No Threads (par défaut) | aucun | Pas de bouton de discussion |
| Regular Threads | Join/Create Public Discussion | Crée un fil public nommé « Suggestion #N Discussion » sur le message de suggestion |
| Private Threads | Join/Create Private Discussion | Identique, sous forme de fil privé |

La première pression crée le fil et y ajoute à la fois l'auteur de la suggestion et la personne qui a appuyé. Les pressions suivantes répondent qu'un fil existe déjà et le signalent. Un seul fil par suggestion est suivi, et les quatre options **Archive on** l'archivent lorsque l'état correspondant est défini. La modification du type de fil n'affecte que les suggestions publiées ultérieurement.

## Paramètres

La page du tableau de bord comporte deux onglets, **Suggestions** et **Paramètres**. L'onglet Settings est divisé en **Général**, **Messages**, **Salons**, **Archiver** et **Émotes**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Minimum Length | non défini | Longueur minimale acceptée pour une suggestion, en caractères (ne peut pas être supérieure ou égale à 2048 ; le champ du tableau de bord s'arrête à 2000) |
| Maximum Length | non défini | Longueur maximale acceptée pour une suggestion (doit être supérieure à 0 ; le champ du tableau de bord s'arrête à 2000) |
| Thread Type | No Threads | Si les suggestions reçoivent un bouton de discussion public ou privé |
| Suggestion message | embed par défaut | L'embed publié lorsqu'une suggestion est soumise |
| Accept / Deny / Consider / Implement message | embed par défaut | L'embed de statut de chaque état |
| Suggest Channel | aucun (fonctionnalité désactivée) | Où les suggestions sont publiées et où les messages saisis deviennent des suggestions |
| Accept / Deny / Consider / Implement Channel | aucun | Salon supplémentaire où chaque embed de statut est copié |
| Archive on Accept / Deny / Consider / Implement | désactivé | Archive le fil de discussion lors de cet état |
| Emote Display Mode | Reactions | Réactions ou boutons pour voter |
| Custom Emotes | pouce levé et baissé | Jusqu'à cinq émotes utilisées pour voter |
| Button Label | Suggest Here! | Texte du bouton de suggestion |
| Button Emote | aucune | Émote du bouton de suggestion |
| Button Message | invitation par défaut | Texte ou embed publié au-dessus du bouton de suggestion |
| Suggest Button Color | Blurple | Couleur du bouton de suggestion |
| Emote 1 to 5 Button | Blurple | Couleur de chaque bouton de vote en mode boutons |

> [!WARNING]
> Rien ne fonctionne tant que le **Salon des suggestions** n'est pas défini. Jusque-là, `suggest` répond qu'aucun salon n'est défini et supprime l'erreur après trois secondes.

L'onglet **Suggestions** répertorie chaque suggestion avec son statut, ses comptes de votes et sa date, triable par date ou par statut. Chaque carte comporte les boutons **Accepter**, **Refuser**, **Étudier** et **Mettre en œuvre**, avec une zone de motif facultative, ainsi qu'un bouton **Supprimer** qui supprime l'enregistrement de la base de données sans toucher au message Discord.

## Guide de configuration

1. Ouvrez **Suggestions** dans le tableau de bord et passez à l'onglet **Paramètres**.
2. Dans **Salons**, choisissez un **Salon des suggestions**. Vous pouvez éventuellement choisir des salons distincts pour les suggestions acceptées, refusées, étudiées et mises en œuvre.
3. Dans **Général**, définissez **Minimum Length** et **Maximum Length**, par exemple 10 et 1000, et choisissez un **Type de fil** si vous souhaitez une discussion par idée.
4. Dans **Émotes**, choisissez **Réactions** ou **Boutons** et, si vous le souhaitez, sélectionnez jusqu'à cinq **Émotes personnalisées**. Si vous voulez un bouton de suggestion, définissez son libellé, son émote et son message ici, puis exécutez `suggestbuttonchannel #channel` sur Discord pour le publier.
5. Dans **Archiver**, activez les options d'archivage pour les états qui doivent clore la discussion.
6. Dans **Messages**, personnalisez les embeds de statut si vous le souhaitez, en utilisant les placeholders ci-dessus.
7. Enregistrez, puis testez : exécutez `suggest test idea`, votez pour cette suggestion, et exécutez `accept 1 looks good` pour voir l'embed de statut et le message privé.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `suggest <text>` | `suggestion` | Aucune | Soumet une suggestion |
| `suggestinfo <number>` | `suginfo` | Gérer les messages | Affiche les détails, les comptes de votes et les boutons d'état d'une suggestion |
| `accept <number> [reason]` | `suggestaccept`, `acceptsuggest` | Gérer les messages | Marque une suggestion comme acceptée |
| `deny <number> [reason]` | `suggestdeny`, `denysuggest` | Gérer les messages | Marque une suggestion comme refusée |
| `consider <number> [reason]` | `suggestconsider`, `considersuggest` | Gérer les messages | Marque une suggestion comme étant à l'étude |
| `implemented <number> [reason]` | `suggestimplement`, `implementsuggest` | Gérer les messages | Marque une suggestion comme mise en œuvre |
| `setsuggestchannel [#channel]` | `suggestchannel`, `suggestchan` | Gérer les salons | Définit le salon des suggestions, ou désactive les suggestions sans salon |
| `suggestclear` | `suggestreset`, `resetsuggestions`, `clearsuggestions` | Administrateur | Supprime toutes les suggestions et réinitialise le compteur, après confirmation |
| `suggestmessage <text>` | `suggestmsg` | Administrateur | Embed de suggestion personnalisé, `-` pour réinitialiser |
| `acceptmessage <text>` | `acceptmsg` | Administrateur | Embed d'acceptation personnalisé, `-` pour réinitialiser |
| `denymessage <text>` | `denymsg` | Administrateur | Embed de refus personnalisé, `-` pour réinitialiser |
| `considermessage <text>` | `considermsg` | Administrateur | Embed d'étude personnalisé, `-` pour réinitialiser |
| `implementmessage <text>` | `implementmsg` | Administrateur | Embed de mise en œuvre personnalisé, `-` pour réinitialiser |
| `acceptchannel [#channel]` | | Administrateur | Salon des suggestions acceptées, aucun pour désactiver |
| `denychannel [#channel]` | | Administrateur | Salon des suggestions refusées, aucun pour désactiver |
| `considerchannel [#channel]` | | Administrateur | Salon des suggestions à l'étude, aucun pour désactiver |
| `implementchannel [#channel]` | | Administrateur | Salon des suggestions mises en œuvre, aucun pour désactiver |
| `minsuggestionlength <number>` | `minsuggestlength` | Administrateur | Nombre minimum de caractères, doit être inférieur à 2048 |
| `maxsuggestionlength <number>` | `maxsuggestlength` | Administrateur | Nombre maximum de caractères, doit être supérieur à 0 |
| `suggestmotes <emotes>` | `smotes`, `suggestemotes` | Administrateur | Jusqu'à cinq émotes de vote, ou `disable` pour revenir au pouce levé et baissé |
| `suggestmotesmode <reactions/buttons>` | | Administrateur | Réactions ou boutons pour voter |
| `suggestmotecolor <number> <colour>` | | Administrateur | Couleur du bouton de vote 1 à 5 : `blurple`, `grey`, `green` ou `red` |
| `suggestthreadstype <none/public/private>` | `suggestthreads` | Administrateur | Type de fil de discussion pour les nouvelles suggestions |
| `archiveonaccept` | | Administrateur | Active ou désactive l'archivage des fils à l'acceptation |
| `archiveondeny` | | Administrateur | Active ou désactive l'archivage des fils au refus |
| `archiveonconsider` | | Administrateur | Active ou désactive l'archivage des fils à l'étude |
| `archiveonimplement` | | Administrateur | Active ou désactive l'archivage des fils à la mise en œuvre |
| `suggestbuttonchannel <#channel>` | | Administrateur | Publie le bouton de suggestion dans un salon |
| `suggestbuttonmessage <text>` | | Administrateur | Texte ou embed au-dessus du bouton de suggestion, `-` pour réinitialiser |
| `suggestbuttonlabel <text>` | | Administrateur | Libellé du bouton, jusqu'à 80 caractères, `-` pour réinitialiser |
| `suggestbuttonemote [emote]` | | Administrateur | Émote du bouton, aucune pour réinitialiser |
| `suggestbuttoncolor <colour>` | | Administrateur | Couleur du bouton de suggestion : `blurple`, `grey`, `green` ou `red` |

Les équivalents en commandes slash se trouvent sous `/suggestions` et `/suggestions customize`.

## Conseils et pièges

- Le bot a besoin de la permission Gérer les messages dans le salon des suggestions pour supprimer les messages d'origine, de la permission Ajouter des réactions pour le mode réactions, et de la permission Créer des fils publics ou privés pour les discussions. Les salons de statut ont besoin de la permission Intégrer des liens, sans quoi la copie est ignorée silencieusement.
- Définissez les deux limites de longueur avant d'ouvrir le salon. Le chemin des messages saisis supprime tout ce qui dépasse les limites ; un maximum non défini peut donc supprimer tous les messages.
- Les membres disposant du rôle du personnel défini dans Administration peuvent discuter dans le salon des suggestions sans que leurs messages deviennent des suggestions. Les messages de tous les autres sont convertis et supprimés.
- La commande `suggest` respecte le système de permissions : vous pouvez la bloquer dans certains salons ou pour certains rôles avec les commandes de permissions habituelles, et le chemin des messages saisis respecte la même règle.
- Les émotes personnalisées doivent être utilisables par le bot. La commande teste chaque émote en réagissant avec elle et refuse l'ensemble si l'une d'elles échoue.
- Le bouton **Supprimer** du tableau de bord supprime uniquement l'enregistrement de la base de données. Le message Discord et le fil éventuel restent en place.
- `suggestclear` est irréversible et remet la numérotation à 1.

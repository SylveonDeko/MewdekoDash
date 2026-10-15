---
title: Sondages
slug: polls
summary: Publiez des sondages à boutons dans un salon, limitez qui peut voter, programmez-les à l'avance, réutilisez des modèles et consultez les résultats.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/polls
module: Games
tags: [poll, vote, survey, question, yes no, multiple choice, anonymous, scheduled poll, poll template, sondage, vote, enquête, question, oui non, choix multiple, anonyme, sondage programmé, modèle de sondage]
related: [votes, games]
---

## Ce qu'il fait

Le personnel publie une question avec deux à vingt-cinq options. Le bot envoie un embed avec un bouton par option, ou un menu de sélection lorsqu'il y a plus de cinq options, et les membres votent en cliquant. L'embed affiche le nombre et le pourcentage en direct pour chaque option. Sous les options figurent trois boutons de gestion : **Statistiques**, **Clôturer** et **Supprimer**.

Les membres peuvent modifier leur vote en cliquant sur une autre option, ou le retirer en cliquant à nouveau sur la même, sauf si les changements de vote sont désactivés pour ce sondage. Toutes les réponses du bot à un clic sont privées pour la personne qui a voté, afin que le salon reste propre.

Les sondages peuvent être clôturés manuellement, expirer automatiquement après une durée définie, ou être programmés pour être publiés à une date ultérieure. Les modèles enregistrent une question et ses options afin de republier le même sondage avec une seule commande. Le tableau de bord ajoute des analyses, l'export CSV et JSON, ainsi que la comparaison côte à côte de sondages.

## Pourquoi l'utiliser

- Choisir une date ou un jeu pour le prochain événement communautaire.
- Faire un rapide sondage oui/non avant un changement de règlement.
- Poser une question sensible de manière anonyme pour que personne ne voie qui a voté pour quoi.
- Ne laisser voter sur les décisions qui les concernent que les membres d'un rôle du personnel ou d'un rôle de booster.
- Publier le même sondage hebdomadaire chaque lundi à partir d'un modèle, ou le programmer à l'avance.

## Types de sondages

| Type | Mode de vote |
| --- | --- |
| Oui / Non | Deux options fixes, Oui et Non. Créé avec `poll` et `/poll yesno`. |
| Choix unique | Une option par membre. Valeur par défaut pour `pollc`, les modèles et le tableau de bord. |
| Choix multiple | Les membres peuvent choisir plusieurs options. À partir de six options, le menu de sélection autorise la sélection multiple. |
| Anonyme | Les votes sont enregistrés sans afficher le votant dans les statistiques ni dans les exports. |
| Restreint par rôle | Seuls les membres possédant l'un des rôles autorisés peuvent voter. Les autres reçoivent une réponse privée « non autorisé ». Tableau de bord uniquement. |

Chaque sondage dispose aussi de ces interrupteurs propres, tous activés par défaut : **Autoriser la modification des votes**, **Afficher les résultats en direct** et **Afficher les barres de progression**.

## Vote, clôture et expiration

- Un vote sur un sondage clôturé ou expiré est rejeté par un message privé.
- Si la modification des votes est désactivée, un second clic est rejeté avec la mention « déjà voté ».
- Les boutons **Clôturer** et **Supprimer** fonctionnent pour le créateur du sondage et pour toute personne disposant de la permission Gérer les messages. Supprimer vous demande de taper `DELETE` dans un formulaire de confirmation, puis supprime le sondage et son message.
- **Statistiques** affiche le total des votes, le nombre de votants uniques et la répartition par option, en privé pour la personne qui a cliqué.
- L'expiration est vérifiée toutes les cinq minutes. Lorsqu'un sondage expire, ses boutons sont retirés et le pied de l'embed indique qu'il a expiré.
- Les sondages programmés sont vérifiés chaque minute. Un sondage programmé doit être dans le futur et à trente jours au maximum. Il peut avoir une durée en minutes, à l'issue de laquelle le sondage publié expire.

## Modèles

Un modèle enregistre un nom, une question et ses options. `polltemplate <name>` le publie sous forme de sondage à choix unique. Les modèles sont listés avec `polltemplates`, créés et supprimés avec `/poll create-template` et `/poll delete-template`, ou gérés dans l'onglet **Modèles** du tableau de bord, qui permet aussi de les exporter et de les importer sous forme de fichier. Un modèle contient au maximum vingt-cinq options.

## Paramètres

La page Sondages comporte cinq onglets : **Sondages**, **Créer**, **Programmés**, **Modèles** et **Analyses**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Question | aucune | Le titre du sondage |
| Type de sondage | Choix unique | L'un des cinq types ci-dessus |
| Salon | aucun | Où le sondage est publié |
| Options | deux vides | Deux à vingt-cinq options, chacune jusqu'à 100 caractères. Masqué pour Oui / Non |
| Rôles autorisés à voter | aucun | Affiché pour les sondages restreints par rôle |
| Durée (minutes) | ouvert jusqu'à clôture | 1 à 20160 minutes. Appliqué lorsque le sondage est programmé |
| Programmer pour plus tard | aucun | Une date et une heure. Laissez vide pour publier immédiatement |
| Autoriser la modification des votes | activé | Indique si un membre peut changer ou retirer son vote |
| Afficher les résultats en direct | activé | Indique si les décomptes sont affichés pendant le sondage |
| Afficher les barres de progression | activé | Indique si des barres sont dessinées à côté des décomptes |
| Enregistrer aussi comme modèle | désactivé | Enregistre la question et les options sous **Nom du modèle** |

L'onglet **Sondages** liste les sondages avec une case **Inclure les inactifs**. Déployer un sondage affiche les votants uniques, la participation, l'heure de pointe et la date de création, et propose **Clôturer le sondage**. **Programmés** vous permet d'**Annuler** un sondage en attente. **Analyses** affiche les sondages de ce mois, les votes exprimés, la moyenne de votes par sondage, le type favori et un graphique du nombre de sondages par jour.

## Pas à pas de configuration

1. Ouvrez **Sondages** dans le tableau de bord et allez à l'onglet **Créer**.
2. Saisissez la **Question**, choisissez un **Type de sondage** et le **Salon**.
3. Remplissez les **Options**. Utilisez le bouton de suppression pour retirer les options en trop ; au moins deux sont obligatoires.
4. Pour un sondage restreint par rôle, choisissez les **Rôles autorisés à voter**.
5. Cochez éventuellement **Enregistrer aussi comme modèle** et donnez-lui un nom.
6. Cliquez sur le bouton d'envoi. Le sondage est publié immédiatement, ou placé dans l'onglet **Programmés** si vous avez défini une heure.
7. Suivez les résultats dans l'onglet **Sondages**, puis cliquez sur **Clôturer le sondage** lorsque vous avez terminé.

> [!TIP]
> Pour un vote rapide dans un salon, vous n'avez pas besoin du tableau de bord. `poll Should we add a movie night?` publie un sondage Oui / Non en quelques secondes.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `poll <question>` | `ppoll` | Gérer les messages | Publier un sondage Oui / Non |
| `pollc <question;option1;option2;...>` | | Gérer les messages | Publier un sondage à choix unique avec deux à vingt-cinq options |
| `pollm <question;option1;option2;...>` | | Gérer les messages | Publier un sondage à choix multiple |
| `polla <question;option1;option2;...>` | | Gérer les messages | Publier un sondage anonyme |
| `polltemplate <name>` | `ptemplate` | Gérer les messages | Publier un sondage à partir d'un modèle enregistré |
| `polltemplates` | `ptemplates` | Personne | Lister les modèles du serveur |

Les commandes slash sous `/poll` ajoutent `create` (jusqu'à dix options, avec les interrupteurs anonyme et choix multiple), `close`, `stats`, `list`, `create-template` et `delete-template`. `close`, `create-template` et `delete-template` nécessitent la permission Gérer les messages.

## Astuces et pièges

- Le bot a besoin des permissions Envoyer des messages et Intégrer des liens dans le salon du sondage. Les commandes textuelles suppriment aussi votre message de commande, ce qui nécessite la permission Gérer les messages pour le bot.
- Les options sont séparées par des points-virgules ; une option ne peut donc pas en contenir un.
- Les libellés des boutons n'affichent le texte de l'option que lorsqu'il fait douze caractères ou moins ; les options plus longues n'affichent que leur numéro, le texte complet figurant dans l'embed.
- La durée est appliquée par le planificateur. Un sondage publié immédiatement reste ouvert jusqu'à ce que quelqu'un le clôture ; programmez-le donc une minute à l'avance si vous avez besoin d'une expiration automatique.
- Un sondage clôturé peut encore être consulté et exporté depuis le tableau de bord lorsque **Inclure les inactifs** est coché ; un sondage supprimé, lui, a disparu.
- Les sondages restreints par rôle vérifient les rôles au moment du vote : les membres qui perdent le rôle ne peuvent plus voter, mais leur vote précédent reste enregistré.

---
title: Avis de départ
slug: leave-feedback
summary: Lorsqu'un serveur retire le bot, son propriétaire reçoit un MP lui demandant pourquoi. Les réponses sont collectées sur une page du tableau de bord réservée au propriétaire.
icon: fa-comments
category: Analytics
dashboard: /owner/leave-feedback
tags: [leave feedback, kick feedback, why removed, churn, exit survey, owner only, bot owner, avis de départ, avis d'expulsion, pourquoi retiré, attrition, sondage de sortie, propriétaire uniquement, propriétaire du bot]
related: [invites]
---

## Ce que ça fait

Chaque fois que le bot est expulsé d'un serveur ou quitte un serveur, le propriétaire du serveur reçoit un bref MP. Ce MP contient une liste déroulante de raisons courantes, un bouton **Write something** qui ouvre une zone de texte, et un bouton **No thanks**. Répondre est facultatif, et le MP l'indique.

Chaque réponse est enregistrée avec le nom du serveur, son nombre de membres, son propriétaire et la durée de présence du bot. Si un salon de rapport est défini, un embed récapitulatif y est publié, et mis à jour si le propriétaire ajoute un commentaire plus tard.

Il s'agit d'une fonction au niveau du bot. Il n'existe aucun paramètre par serveur, et la page du tableau de bord n'apparaît que pour le propriétaire du bot.

> [!NOTE]
> Seul le propriétaire du bot peut voir la page Avis de départ. Les autres utilisateurs du tableau de bord ne la voient pas dans la barre latérale et ne peuvent pas l'ouvrir.

## Pourquoi l'utiliser

- Comprendre si les serveurs partent à cause de fonctionnalités manquantes, d'une configuration confuse ou de problèmes de fiabilité.
- Repérer les serveurs qui n'ont ajouté le bot que pour le tester, afin d'ignorer leurs départs.
- Contacter les propriétaires qui ont écrit un commentaire et laissé leurs coordonnées.
- Suivre la fréquence à laquelle les propriétaires prennent la peine de répondre.

## Le message

Le MP s'intitule « Sorry to see me go! » et explique que le bot vient d'être retiré du serveur indiqué. La liste déroulante propose ces raisons, dans cet ordre :

| Clé de raison | Affiché au propriétaire |
| --- | --- |
| `not_needed` | Nous n'en avions plus besoin |
| `confusing` | Trop compliqué à configurer |
| `missing_features` | Fonctionnalités manquantes que nous voulions |
| `unreliable` | Il était cassé ou peu fiable |
| `other_bot` | Nous sommes passés à un autre bot |
| `temporary` | Temporaire, je le réajoute |
| `testing` | Simple test |

Choisir une raison l'enregistre immédiatement et propose de nouveau la zone de texte. La zone de texte est un champ en un seul paragraphe, « What could we have done better? », limité à 1000 caractères. **No thanks** marque l'enregistrement comme rejeté, et il n'est jamais signalé.

Règles qui évitent que cela ne devienne pénible :

- Un serveur n'est interrogé qu'au plus une fois tous les trente jours, quel que soit le nombre de fois où il ajoute et retire le bot.
- Si les MP du propriétaire sont fermés, rien n'est enregistré.
- Rien n'est envoyé lorsque la fonction est désactivée.

## Statuts

Chaque enregistrement se trouve dans l'un de trois états, que le tableau de bord permet de filtrer.

| Statut | Signification |
| --- | --- |
| Answered | Le propriétaire a choisi une raison ou écrit un commentaire |
| Dismissed | Le propriétaire a cliqué sur **No thanks** |
| No response | Le MP a été envoyé et aucune réponse n'est revenue pour l'instant |

## Paramètres

La page comporte deux onglets, **Réponses** et **Paramètres**.

| Paramètre | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Ask owners why the bot was removed | activé | Indique si le MP est envoyé |
| Report channel ID | vide | Salon qui reçoit un embed récapitulatif par réponse. Si vide, le salon de logs d'arrivée et de départ du bot est utilisé. |

Sous le champ du salon, la page indique à quel salon et serveur l'identifiant correspond, et si le bot peut y accéder.

L'onglet **Réponses** comporte six compteurs, **Demandes envoyées**, **Répondu**, **Avec un commentaire**, **Ignoré**, **Aucune réponse** et **Taux de réponse**, une répartition **Motifs indiqués**, et un tableau avec les colonnes **Parti**, **Serveur**, **Motif** et **Statut**. Vous pouvez filtrer par raison et par statut (le filtre de statut propose aussi l'option **Commentaire laissé**), rechercher par nom de serveur ou par texte de commentaire, ouvrir une ligne pour lire le commentaire complet, et supprimer un enregistrement. **Taux de réponse** compte ensemble les demandes répondues et rejetées.

## Pas à pas

1. Connectez-vous au tableau de bord avec le compte du propriétaire du bot et ouvrez **Avis de départ**.
2. Dans l'onglet **Paramètres**, vérifiez que **Demander aux propriétaires pourquoi le bot a été retiré** est activé. Il l'est par défaut.
3. Collez un identifiant de salon dans **ID du salon de signalement** et cliquez sur **Enregistrer le salon**, ou laissez-le vide pour utiliser le salon d'arrivée et de départ.
4. Retirez le bot d'un serveur de test que vous possédez et répondez au MP.
5. Consultez l'onglet **Réponses** et le salon de rapport pour retrouver l'entrée.

## Commandes

Cette fonction n'est disponible que sur le tableau de bord. Il n'existe aucune commande du bot ; les propriétaires répondent via les boutons et la liste déroulante du MP.

## Astuces et pièges

- Le bot n'envoie de MP qu'à la personne que Discord désigne comme propriétaire du serveur, et non à celle qui a expulsé le bot.
- Le délai de trente jours est propre à chaque serveur : un serveur qui réajoute le bot puis le retire dans cette période n'est pas interrogé deux fois.
- Le récapitulatif est publié dans le salon configuré, ou dans le salon de logs d'arrivée et de départ défini dans les identifiants du bot à défaut. Si aucun des deux n'existe, les réponses sont tout de même stockées et visibles sur la page.
- Supprimer un enregistrement depuis le tableau de bord ne supprime pas l'embed déjà publié dans le salon de rapport.

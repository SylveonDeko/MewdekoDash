---
title: Système AFK
slug: afk
summary: Permettez aux membres de signaler leur absence, d'indiquer à quiconque les mentionne la raison de cette absence, et de retirer automatiquement leur statut à leur retour.
icon: fa-moon
category: Actions
dashboard: /dashboard/afk
module: Afk
tags: [afk, away, idle, status, brb, mention reply, timed afk, placeholders, absent, inactif, statut, réponse à une mention, afk minuté, marqueurs]
related: [utility, administration]
---

## Ce que cela fait

Un membre exécute `afk` avec un message facultatif. Dès lors, chaque fois que quelqu'un le mentionne, le bot répond dans ce salon avec le message et le temps écoulé depuis son départ. Lorsque le membre revient, le statut est effacé, un bref avis « bon retour » est publié puis supprimé après cinq secondes, et le pseudo est restauré.

Pendant l'absence d'un membre, le bot essaie aussi de le renommer en `[AFK] name`, tronqué pour respecter la limite de pseudo de Discord, afin que le statut soit visible dans la liste des membres.

Exécuter `afk` sans message fonctionne comme un interrupteur : il active l'AFK avec un message vide si vous n'êtes pas absent, et le désactive si vous l'êtes.

## Pourquoi l'utiliser

- Dans les serveurs très animés, les membres cessent d'être sollicités sans cesse par des personnes qui n'ont pas vu leur message « brb ».
- Le personnel peut voir d'un coup d'œil qui est présent et qui ne l'est pas.
- L'AFK minuté couvre le cas « de retour dans deux heures » sans que personne ait besoin de penser à le retirer.

## Comment un statut prend fin

Le **AFK type** détermine ce que le bot considère comme un retour. C'est le paramètre le plus important de la page.

| Type | Le statut est effacé lorsque |
| --- | --- |
| Self disable | Uniquement lorsque le membre exécute de nouveau `afk`, ou que le personnel le retire. Rien d'automatique. |
| On message | Le membre envoie un message n'importe où sur le serveur. |
| On type | Le membre commence à taper dans n'importe quel salon. |
| Either | Un message ou une saisie, selon ce qui arrive en premier. |

Le **AFK timeout** est une période de grâce mesurée à partir du moment où le statut a été défini. Pendant cette fenêtre, taper ou envoyer un message n'efface pas le statut, ce qui évite que le message « afk, brb » lui-même mette fin immédiatement à l'AFK. La valeur par défaut est 0, c'est-à-dire aucune période de grâce ; définissez-la avec `afktimeout` ou dans l'onglet **Paramètres avancés** du tableau de bord.

L'AFK minuté fonctionne différemment : il dure jusqu'à l'expiration de son minuteur, quel que soit le type. Parler entre-temps n'y met pas fin. Lorsque le minuteur arrive à terme, le statut est effacé et le pseudo restauré, sans avis dans le salon.

Modifier un message dans les cinq minutes suivant sa publication compte comme l'envoi d'un nouveau message.

## La réponse à une mention

Lorsqu'une personne mentionne un membre absent, le bot vérifie jusqu'à cinq utilisateurs mentionnés par message, ignore les bots et les auto-mentions, ignore les messages commençant par le préfixe de commande, et passe les salons de la liste des désactivés. Pour chaque membre absent trouvé, il publie une réponse.

Par défaut, la réponse est un embed : la ligne d'auteur indique « user is currently away » avec leur avatar, la description est leur message d'AFK, et le pied de page indique depuis combien de temps ils sont absents. Si le bot est configuré pour afficher un bouton d'invitation, celui-ci est joint.

Vous pouvez remplacer cela par votre propre message ou embed à l'aide de `customafkmessage`, ou de l'éditeur **Message AFK personnalisé (embed)** du tableau de bord. Le texte passe par l'analyseur d'embeds, donc tout ce que produit l'éditeur d'embeds fonctionne. Définissez-le sur `-` pour revenir à la valeur par défaut.

### Marqueurs

Ils sont remplacés à l'intérieur d'un message AFK personnalisé. Les marqueurs généraux de la page des marqueurs ne sont pas disponibles ici ; seul cet ensemble l'est.

| Marqueur | Valeur |
| --- | --- |
| `%afk.message%` | Le message d'AFK, avec les mentions neutralisées et tronqué à la longueur maximale |
| `%afk.user%` | Le nom d'utilisateur du membre absent |
| `%afk.user.mention%` | Une mention du membre absent |
| `%afk.user.avatar%` | L'URL de l'avatar du membre absent |
| `%afk.user.id%` | L'identifiant utilisateur du membre absent |
| `%afk.triggeruser%` | Le nom d'utilisateur de la personne qui l'a mentionné |
| `%afk.triggeruser.mention%` | Une mention de la personne qui l'a mentionné |
| `%afk.triggeruser.avatar%` | L'URL de l'avatar de la personne qui l'a mentionné |
| `%afk.triggeruser.id%` | L'identifiant utilisateur de la personne qui l'a mentionné |
| `%afk.time%` | Durée de l'absence, en mots comme « 2 hours » |

> [!EXAMPLE]
> Une réponse en texte simple : `%afk.user.mention% is away (%afk.time%): %afk.message%`

## Paramètres

Tous ces paramètres se trouvent sur la page AFK, sous les onglets **Paramètres de base** et **Paramètres avancés**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Auto-deletion time | 0 (jamais) | Secondes avant que la réponse du bot à une mention ne se supprime d'elle-même |
| Max message length | 128 | Message AFK le plus long qu'un membre peut définir, de 1 à 4096 ; les messages plus longs sont refusés |
| AFK removal type | Self disable | L'un des quatre types ci-dessus |
| AFK timeout | 0 (aucun) | La période de grâce après la définition de l'AFK, jusqu'à deux heures |
| Disabled channels | aucun | Salons où mentionner un membre absent ne reçoit aucune réponse |
| Custom AFK embed | embed par défaut | Votre propre réponse, avec les marqueurs ci-dessus |

> [!TIP]
> Réglez la suppression automatique sur une trentaine de secondes. La personne qui a mentionné voit la réponse, et le salon ne se remplit pas d'avis AFK périmés.

L'onglet **Gestion des utilisateurs** liste chaque membre actuellement absent et permet au personnel d'effacer le statut d'une ou de plusieurs personnes à la fois.

## Mise en place pas à pas

1. Ouvrez **Système AFK** dans le tableau de bord.
2. Choisissez un **AFK removal type**. « On message » est la valeur par défaut la plus sûre ; « Either » est la plus pratique.
3. Réglez **Auto-deletion time** sur 30. Laissez **Max message length** à 128, sauf si vous voulez des statuts plus longs.
4. Dans **Paramètres avancés**, ajoutez les salons de commandes du bot et les salons d'annonces à **Disabled channels**.
5. Facultativement, créez une réponse personnalisée dans l'éditeur d'embeds à l'aide des marqueurs ci-dessus.
6. Testez : exécutez `afk testing`, mentionnez-vous depuis un autre compte, puis envoyez un message et regardez le statut s'effacer.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Objet |
| --- | --- | --- | --- |
| `afk [message]` | | Personne | Définir votre message d'AFK, ou activer et désactiver l'AFK sans message |
| `timedafk <time> <message>` | `tafk` | Personne | AFK qui se termine tout seul, par exemple `timedafk 2h dinner` |
| `getactiveafks` | `activeafks` | Personne | Lister toutes les personnes actuellement en AFK |
| `afkview [@user]` | `viewafk` | Gérer les messages | Afficher le message d'AFK actuel de quelqu'un |
| `afkremove @user...` | `afkrm` | Gérer les messages | Effacer le statut d'un ou plusieurs membres |
| `afkdel [seconds]` | `afkdelete` | Gérer le serveur | Afficher ou définir la suppression automatique de la réponse |
| `afklength <number>` | `maxafklength` | Administrateur | Limiter la longueur du message d'AFK |
| `afktype <type>` | | Administrateur | `selfdisable`, `onmessage`, `ontype` ou `either` |
| `afktimeout <time>` | | Administrateur | Définir la période de grâce, par exemple `30s` |
| `afkdisable #channel...` | | Gérer les salons | Ajouter des salons à la liste sans réponse |
| `afkundisable #channel...` | | Gérer les salons | Retirer des salons de la liste sans réponse |
| `afkdisabledlist` | | Gérer les salons | Afficher la liste sans réponse |
| `customafkmessage <text>` | `afkmessage` | Administrateur | Définir la réponse personnalisée, ou `-` pour réinitialiser |

## Astuces et pièges

- Il n'existe aucune commande pour effacer uniquement votre propre statut. Exécutez de nouveau `afk` sans message, ou attendez que la règle du type l'efface.
- Les changements de pseudo nécessitent que le rôle du bot soit au-dessus du rôle le plus élevé du membre et la permission Gérer les pseudos. Le pseudo du propriétaire du serveur ne peut jamais être modifié par un bot ; les propriétaires gardent donc leur nom, mais le statut fonctionne toujours.
- Le service AFK charge son cache peu après le démarrage du bot. Jusque-là, les commandes répondent que l'AFK est encore en cours de démarrage.
- Les mentions présentes dans le message d'AFK sont neutralisées dans la réponse, de sorte que les membres ne peuvent pas utiliser leur statut pour faire un ping à des rôles ou à everyone.

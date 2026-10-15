---
title: Sauvegarde de discussion
slug: chatsaver
summary: Récupérez l'historique récent d'un salon dans le tableau de bord, lisez-le sur place, conservez des instantanés nommés pour plus tard, ou exportez une transcription HTML depuis Discord avec une commande.
icon: fa-folder
category: Security
dashboard: /dashboard/chatsaver
module: Utility
tags: [chat saver, chat log, save chat, transcript, export, archive, history, evidence, ticket transcript, sauvegarde de discussion, journal de discussion, sauvegarder, transcription, exportation, historique, preuve, transcription de ticket]
related: [tickets, logging, auditlog]
---

## Ce que ça fait

La Sauvegarde de discussion comporte deux volets. Sur le tableau de bord, le staff choisit un salon et une période, et le bot récupère chaque message de cette période : texte, auteur, pièces jointes et embeds. On peut les lire sur la page et, s'ils méritent d'être conservés, les enregistrer sous un nom de journal. Les journaux enregistrés sont stockés dans la base de données du bot, ils survivent donc à la suppression des messages d'origine.

Dans Discord, `savechat` exporte une transcription complète d'un salon pour les dernières minutes, heures ou jours, et vous donne un lien vers un fichier HTML qui ressemble à Discord, médias compris.

Les transcriptions de tickets arrivent aussi ici. Lorsqu'un ticket est fermé dans un serveur où un salon de transcriptions de tickets est défini, le système de tickets enregistre la conversation comme journal sous le nom `Ticket #<id> - <channel>`, qui apparaît alors sous **Journaux enregistrés** avec le reste.

## Pourquoi l'utiliser

- Conserver une preuve d'une dispute ou d'une infraction aux règles avant que les personnes ne suppriment leurs messages.
- Archiver un salon d'événement ou un fil d'annonces avant leur suppression.
- Relire ce qui s'est passé dans un salon pendant la nuit, sans faire défiler Discord.
- Consulter les anciennes transcriptions de tickets au même endroit.

## Récupérer les messages

Dans l'onglet **Récupérer les messages**, choisissez un **Salon**, un **Durée** et une **Unité de temps**, puis cliquez sur **Charger les messages**. Le bot lit le salon du plus récent au plus ancien et s'arrête lorsqu'il atteint des messages plus anciens que votre fenêtre, ou lorsqu'il a collecté 5000 messages, selon la première éventualité. Les messages sont affichés du plus ancien au plus récent dans l'onglet **Consulter les messages**.

| Unité de temps | Maximum |
| --- | --- |
| Minutes | 4320 |
| Hours | 72 |
| Days | 3 |

Les trois plafonds correspondent à la même fenêtre de trois jours. La récupération ne stocke rien ; fermez la page et tout disparaît.

## Enregistrer un journal

Lorsque des messages sont chargés, cliquez sur **Enregistrer le journal** dans l'onglet **Consulter les messages**. Le journal est nommé `<channel> - <today's date>` et enregistré avec le salon, la personne qui l'a sauvegardé et le nombre de messages. Chaque journal enregistré conserve le texte des messages, le nom et l'avatar de l'auteur, l'horodatage, les liens des pièces jointes et les titres, descriptions et vignettes des embeds.

Les liens des pièces jointes et des avatars pointent vers le CDN de Discord. Si Discord supprime le fichier, le lien du journal enregistré ne fonctionne plus, même si le texte reste.

**Exporter en HTML**, à côté de **Enregistrer le journal**, télécharge les messages chargés sous forme de transcription HTML autonome, générée dans votre navigateur. Rien n'est stocké sur le bot.

## Journaux enregistrés

L'onglet **Journaux enregistrés** liste tous les journaux du serveur, du plus récent au plus ancien, avec leur salon et leur nombre de messages. Chaque entrée propose **Voir le journal**, **Renommer le journal** et **Supprimer le journal**. Renommer ne modifie que le libellé. La suppression est définitive et s'exécute dès que vous cliquez ; il n'y a pas de demande de confirmation.

Les renommages et suppressions sont consignés dans le journal d'audit du tableau de bord.

## La commande savechat

`savechat` fonctionne différemment du tableau de bord. Elle exécute DiscordChatExporter sur l'hôte du bot, écrit un fichier HTML avec les médias, et répond avec un lien. Sur le Mewdeko public, elle vous envoie un lien `cdn.mewdeko.tech` en MP ; sur un bot auto-hébergé, elle publie le chemin local dans le salon.

La fenêtre est limitée à trois jours. Les valeurs supérieures sont refusées. L'export nécessite que le répertoire de sauvegarde de discussions configuré du bot existe, sinon la commande renvoie une erreur.

> [!NOTE]
> Les exports `savechat` n'apparaissent pas sous **Journaux enregistrés**. Ce sont des fichiers sur l'hôte, et non des entrées de la base de données.

## Paramètres

La Sauvegarde de discussion n'a aucune configuration. La page du tableau de bord comporte trois onglets : **Récupérer les messages**, **Journaux enregistrés** et **Consulter les messages**.

| Contrôle | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Channel | aucun | Le salon textuel à lire |
| Time Amount | 1 | Durée de la récupération dans le passé |
| Time Unit | Hours | Minutes, Hours ou Days |

## Pas à pas

1. Ouvrez **Sauvegarde du chat** dans le tableau de bord.
2. Dans **Récupérer les messages**, sélectionnez le **Salon**, puis réglez **Durée** et **Unité de temps**, par exemple 6 heures.
3. Cliquez sur **Charger les messages** et attendez que le nombre de messages s'affiche.
4. Passez à **Consulter les messages** pour lire ce qui a été récupéré.
5. Cliquez sur **Enregistrer le journal** pour le conserver. Il apparaît dans **Journaux enregistrés**.
6. Utilisez **Renommer le journal** pour lui donner un nom significatif, comme l'incident ou la date.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Autorisation | Rôle |
| --- | --- | --- | --- |
| `savechat <time> [#channel]` | | Gérer les messages | Exporter les dernières `<time>` d'un salon en HTML, par exemple `savechat 2h #general` |

## Astuces et pièges

- Le bot doit pouvoir lire le salon et son historique des messages. Les salons qu'il ne voit pas renvoient « Channel not found ».
- La récupération s'arrête à 5000 messages. Pour un salon très actif, utilisez une fenêtre plus courte.
- Les modifications et suppressions de messages survenues avant la récupération ne sont pas visibles ; le bot lit ce qui se trouve dans le salon à cet instant. Utilisez la fonction Journalisation pour un historique en direct.
- Les journaux enregistrés conservent les noms des auteurs tels qu'ils étaient au moment de la sauvegarde. Un changement ultérieur de nom d'utilisateur n'est pas reflété.
- Toute personne ayant accès au tableau de bord du serveur peut lire les journaux enregistrés, y compris les transcriptions de tickets. Restreignez l'accès au tableau de bord en conséquence.
- `savechat` est conçu pour le CDN du bot public. Les auto-hébergeurs doivent définir un chemin de sauvegarde de discussions dans les identifiants et copier les fichiers de DiscordChatExporter à côté du bot.

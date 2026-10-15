---
title: Mises en évidence
slug: highlights
summary: Les membres choisissent des mots à surveiller et reçoivent un MP avec le contexte chaque fois que quelqu'un en dit un sur le serveur.
icon: fa-bolt
category: Community
dashboard: /dashboard/highlights
module: Highlights
tags: [highlights, keywords, watch words, notifications, mentions, dm alerts, ignore channel, ignore user, mises en évidence, mots-clés, mots surveillés, notifications, mentions, alertes MP, ignorer salon, ignorer utilisateur]
related: [afk, utility]
---

## Ce que cela fait

Un membre ajoute un mot ou une expression avec `highlight add`. Dès lors, chaque fois qu'un message du serveur contient ce mot, le bot lui envoie un MP. Le MP indique sur quel serveur et dans quel salon cela s'est produit, affiche les cinq messages précédant celui qui correspond ainsi que celui-ci, et comporte un bouton **Aller au message**.

Les mises en évidence sont personnelles. Chaque membre gère sa propre liste, choisit les salons et les personnes à ignorer, et peut désactiver ses mises en évidence sans les supprimer. Le personnel ne peut pas en ajouter pour quelqu'un d'autre, mais le tableau de bord lui permet de voir ce qui est surveillé et de retirer des entrées.

Les membres ne reçoivent de MP que pour les salons qu'ils peuvent réellement voir. Un membre qui tape un message sur le serveur est considéré comme présent, et les mises en évidence sont donc suspendues pour lui pendant deux minutes.

## Pourquoi l'utiliser

- Être notifié lorsque votre nom, votre pseudo ou votre projet est mentionné sans véritable @mention.
- Suivre un sujet comme « giveaway » ou « patch notes » sur un grand serveur.
- Le personnel peut surveiller des mots comme « help » ou « report » sans lire chaque salon.
- Les modérateurs peuvent vérifier ce que les membres suivent et nettoyer les entrées abusives ou de spam.

## Fonctionnement de la correspondance

Le bot vérifie chaque message non vide par rapport à chaque mise en évidence du serveur.

- Une mise en évidence correspond à un mot entier ou à une expression entière. `cat` ne correspond pas à « category », mais « the cat sat » correspond.
- La correspondance tient compte de la casse. Ajoutez `Cat` et `cat` séparément si vous voulez les deux.
- Chaque membre reçoit au maximum un MP toutes les deux minutes sur un serveur, quel que soit le nombre de mots correspondants.
- Écrire n'importe où sur le serveur déclenche la même pause de deux minutes, afin de ne pas recevoir de MP au sujet d'une conversation dans laquelle vous êtes déjà.
- Les messages des utilisateurs ignorés et des salons ignorés sont ignorés pour ce membre.
- Le MP n'est pas envoyé lorsque le membre ne peut pas voir le salon ou a fermé ses MP.
- Les messages sont vérifiés via une file d'attente qui traite un message toutes les deux secondes. Sur un shard très chargé, certains messages peuvent être abandonnés de cette file.

`highlight match some text` compare votre propre liste à une phrase d'exemple et vous indique lesquels de vos mots auraient correspondu. Cette vérification ignore la casse ; c'est donc un guide approximatif et non une copie exacte de la règle en direct.

## Paramètres par membre

Chaque membre possède une ligne de paramètres créée la première fois qu'il change quelque chose.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Highlights on | activé | `highlight toggle false` suspend toutes vos mises en évidence sur ce serveur |
| Ignored channels | aucun | Salons où vos mots ne déclenchent jamais de MP |
| Ignored users | aucun | Personnes dont les messages ne déclenchent jamais vos mises en évidence |

## Paramètres

La page Highlights du tableau de bord est destinée au personnel. Elle n'ajoute pas de mises en évidence ; elle les affiche et les supprime.

| Onglet | Ce qu'il affiche |
| --- | --- |
| All Highlights | Chaque mise en évidence du serveur regroupée par membre, avec un bouton de suppression par mot et un bouton pour retirer tous les mots d'un membre |
| Search | Trouver les mises en évidence contenant un mot, pour tous les membres ; la recherche ignore la casse |
| Disabled Users | Membres qui ont désactivé leurs mises en évidence, avec le nombre de salons et d'utilisateurs ignorés |
| Statistics | Total Highlights, Active Users, Top Word, Most Active, ainsi que Top Highlighted Words et Recent Highlights |

## Guide de configuration

Il n'y a rien à activer. Les mises en évidence fonctionnent dès que le bot est sur le serveur.

1. En tant que membre, exécutez `highlight add yourname` dans n'importe quel salon.
2. Exécutez `highlight list` pour vérifier que c'est bien enregistré.
3. Demandez à quelqu'un d'écrire votre nom dans un autre salon. Attendez quelques secondes et vérifiez vos MP.
4. Si vous en recevez trop, exécutez `highlight toggleignore #busy-channel` ou `highlight toggleignore @user`.
5. Personnel : ouvrez **Mises en évidence** dans le tableau de bord pour examiner l'onglet **Toutes les mises en évidence** et supprimer ce qui n'est pas souhaité.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les mêmes actions existent sous la forme de la commande slash unique `/highlights manage`, dont l'option `action` peut valoir `Add`, `List`, `Delete`, `Match`, `ToggleUser`, `ToggleChannel` ou `ToggleGlobal`, avec les options séparées `words`, `user` et `channel`.

| Commande | Alias | Nécessite | Objectif |
| --- | --- | --- | --- |
| `highlight add <word>` | `highlights`, `hl` | Personne | Surveiller un mot ou une expression |
| `highlight list` | `highlights`, `hl` | Personne | Parcourir vos mises en évidence, dix par page |
| `highlight delete <number or word>` | `highlights`, `hl` | Personne | Supprimer par son numéro dans la liste ou par mot exact ; `remove` fait la même chose |
| `highlight match <text>` | `highlights`, `hl` | Personne | Afficher lesquels de vos mots apparaissent dans le texte |
| `highlight toggleignore <#channel or @user>` | `highlights`, `hl` | Personne | Ajouter ou retirer un salon ou une personne de votre liste d'ignorés |
| `highlight toggle <true or false>` | `highlights`, `hl` | Personne | Activer ou désactiver toutes vos mises en évidence sur ce serveur |

## Astuces et pièges

- Le bot doit pouvoir lire le salon pour y détecter des correspondances, et vous devez avoir les MP ouverts pour recevoir les alertes des membres du serveur.
- Ajouter un mot que vous avez déjà est refusé. La vérification des doublons ignore la casse, mais la correspondance en direct, elle, ne l'ignore pas.
- Supprimer par numéro utilise la position affichée dans `highlight list`, qui change après chaque suppression.
- La liste des mises en évidence et les paramètres sont mis en cache pendant trente minutes par serveur. Ajouter ou supprimer un mot isolé via les commandes ou le tableau de bord met à jour le cache immédiatement ; retirer tous les mots d'un membre depuis le tableau de bord peut prendre jusqu'à trente minutes avant que les MP cessent.
- Lorsque le bot quitte un serveur, ses mises en évidence et paramètres sont nettoyés au prochain redémarrage du bot.

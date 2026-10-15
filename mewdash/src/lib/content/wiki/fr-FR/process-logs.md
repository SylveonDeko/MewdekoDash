---
title: Journaux de processus
slug: process-logs
summary: Une page du tableau de bord réservée aux propriétaires du bot, qui liste les processus gérés par pm2 sur l'hôte du bot et permet de lire, suivre, filtrer et télécharger leurs journaux de console.
icon: fa-rectangle-code
category: Analytics
dashboard: /owner/process-logs
tags: [pm2, logs, console, stdout, stderr, tail, process, crash, stack trace, owner, journaux, console, processus, plantage, trace de pile, propriétaire]
related: [performance, analytics, leave-feedback]
---

## Ce que cela fait

Les journaux de processus affichent ce que le bot écrit dans sa console, directement depuis les fichiers journaux que pm2 conserve pour lui, sans ouvrir de shell sur le serveur. Elle n'est visible que pour les propriétaires du bot : la barre latérale la masque à tous les autres, l'ouverture directe de l'URL renvoie les non-propriétaires à l'accueil du tableau de bord, et le bot refuse lui-même les requêtes à moins que le compte connecté ne soit propriétaire.

La page demande à l'instance du bot que vous avez sélectionnée la table de ses processus pm2. Chaque processus géré par pm2 sur cet hôte est listé, et pas seulement le bot, avec son statut, son pid, sa durée de fonctionnement, son nombre de redémarrages, son CPU et sa mémoire, ainsi que la taille de ses deux fichiers journaux. Sélectionnez-en un et la page charge les dernières centaines de lignes de son journal stdout, puis ajoute les nouvelles lignes toutes les deux secondes tant que **Suivi** est activé.

Les lignes conservent les couleurs que Serilog affiche, et chaque ligne est marquée de son niveau afin que vous puissiez masquer le bruit. Les lignes de continuation, comme les traces de pile, restent attachées à la ligne qui les précède, de sorte que masquer les infos ne laisse pas de traces orphelines.

## Pourquoi l'utiliser

- Le bot a redémarré ou planté et vous voulez le dernier message qu'il a écrit avant de tomber, qui se trouve côté stderr.
- Un membre signale qu'une commande échoue et vous voulez suivre le journal en direct pendant qu'il réessaie.
- Vous voulez chercher dans quelques milliers de lignes récentes un identifiant de serveur ou un message sans vous connecter en SSH.
- Vous avez besoin du fichier journal complet pour un rapport de bug et voulez le télécharger.

## Contrôles

| Contrôle | Ce qu'il fait |
| --- | --- |
| Cartes de processus | Une par processus pm2 sur l'hôte. La carte marquée **ce bot** est l'instance qui répond à la requête. Cliquez sur une carte pour lire ses journaux. |
| **stdout** / **stderr** | Bascule entre le journal de sortie du processus, où va la journalisation normale, et son journal d'erreurs, où arrivent les plantages et les diagnostics d'exécution. |
| **100** à **2k** | Nombre de lignes à charger à l'ouverture ou au rechargement du journal. Le mode de suivi conserve jusqu'à 5 000 lignes dans la page avant de commencer à supprimer les plus anciennes. |
| Zone de filtre | Masque chaque ligne dont le texte ne contient pas ce que vous avez saisi. La casse n'a pas d'importance. |
| **Suivi** / **Suivre** | Active ou désactive les mises à jour en direct. Lorsqu'elles sont actives, la page interroge les nouvelles lignes toutes les deux secondes et défile avec elles, sauf si vous êtes remonté. |
| **Retour à la ligne** | Retour à la ligne des lignes longues au lieu de défiler horizontalement. |
| **Copier** | Copie les lignes visibles, couleurs retirées, dans le presse-papiers. |
| **Recharger** | Relit la fin du fichier. |
| **Download** | Enregistre le fichier journal complet tel qu'il est sur le disque, codes couleur inclus. La taille affichée à côté est la taille actuelle du fichier. |
| Puces de niveau | **VRB**, **DBG**, **INF**, **WRN**, **ERR** et **FTL**, chacune avec le nombre de lignes marquées chargées. Cliquez sur l'une pour masquer ou afficher ce niveau. |

Lorsque vous remontez pendant un suivi, les nouvelles lignes sont retenues et un bouton en bas à droite indique combien attendent. Cliquez dessus pour redescendre et reprendre le défilement avec le journal.

> [!NOTE]
> Une seule lecture est limitée à 1 Mo. Si les lignes demandées ne tiennent pas, la page indique que les lignes plus anciennes ont été ignorées ; téléchargez le fichier pour tout voir.

## Comment le bot trouve les journaux

Le bot exécute `pm2 jlist` sur son propre hôte et lit les chemins de fichiers journaux que pm2 indique pour chaque processus. Il ne le fait que si un démon pm2 est déjà en cours d'exécution pour le même utilisateur, de sorte qu'il n'en démarre jamais un par accident. Si pm2 est installé mais ne peut pas être interrogé, la page se rabat sur les fichiers du répertoire de journaux de pm2 et le signale. S'il n'existe aucun pm2, la page l'explique au lieu d'afficher une liste vide.

Sur un tableau de bord connecté à plusieurs instances du bot, la liste des processus appartient à l'instance sélectionnée, puisque chaque instance ne peut voir que son propre hôte.

## Guide de configuration

1. Exécutez le bot sous pm2 sur son serveur, par exemple `pm2 start dotnet --name mewdeko -- Mewdeko.dll`.
2. Connectez-vous au tableau de bord avec un compte propriétaire du bot et ouvrez **Journaux de processus** depuis la barre latérale.
3. Choisissez le processus marqué **ce bot**, ou tout autre processus de l'hôte.
4. Laissez **Suivi** activé pour suivre le journal en direct, ou désactivez-le et utilisez le filtre et les puces de niveau pour explorer ce qui est chargé.
5. Passez sur **stderr** après un plantage pour lire ce que l'exécution a affiché en tombant.

## Astuces et pièges

- Les journaux sont lus depuis des fichiers ; un processus lancé en dehors de pm2 n'a donc aucun journal ici. La sortie console du bot n'apparaît que si le bot lui-même tourne sous pm2.
- pm2 fait tourner ou tronque les fichiers lorsque vous exécutez `pm2 flush` ou utilisez `pm2-logrotate`. La page remarque la réduction de taille du fichier et recharge la fin du fichier d'elle-même.
- Les filtres et les puces de niveau ne s'appliquent qu'aux lignes déjà chargées. Chargez davantage de lignes, ou téléchargez le fichier, pour chercher plus loin dans le passé.
- Rien sur cette page ne modifie le bot. Il n'est pas possible de redémarrer des processus ni de vider des journaux depuis ici ; la commande propriétaire `restartinstance` et `pm2 flush` sur le serveur s'en chargent.

---
title: Performance
slug: performance
summary: Page du tableau de bord réservée aux propriétaires du bot, affichant le processeur, la mémoire, la durée de fonctionnement, les méthodes les plus lentes, et le nombre d'événements Discord que chaque module traite et ceux qui échouent.
icon: fa-clock
category: Analytics
dashboard: /owner/performance
tags: [performance, metrics, cpu, memory, latency, monitoring, uptime, events, modules, owner, performance, métriques, processeur, mémoire, latence, surveillance, durée de fonctionnement, événements, modules, propriétaire]
related: [analytics, leave-feedback, administration]
---

## Ce que cela fait

Performance est une page de surveillance destinée à la personne qui exploite le bot. Elle n'est visible que pour les propriétaires du bot : la barre latérale la masque à tous les autres, et ouvrir directement l'URL renvoie les non-propriétaires à l'accueil du tableau de bord. Rien n'y est configurable pour le personnel du serveur.

La page lit les chiffres en direct du processus du bot en cours d'exécution. Un onglet affiche les ressources système, un autre liste les méthodes qui consomment le plus de temps de processeur, et deux autres détaillent le traitement des événements Discord par type d'événement et par module du bot, chacun avec les nombres, le temps d'exécution moyen et le taux d'erreur. Tout se rafraîchit automatiquement tant que la page est ouverte.

Les chiffres des événements et des modules proviennent du gestionnaire d'événements interne du bot, qui enregistre chaque événement de passerelle qu'il distribue. Les temps des méthodes proviennent du moniteur de performances qui encapsule les méthodes suivies. Les deux ne sont conservés qu'en mémoire : ils sont donc réinitialisés au redémarrage du bot, et les métriques d'événements se réinitialisent d'elles-mêmes toutes les heures. Pour l'historique enregistré de ces mêmes chiffres, utilisez [Analytiques](/wiki/analytics).

## Pourquoi l'utiliser

- Le bot semble lent et vous voulez savoir si le processeur, la mémoire ou une seule méthode lente en est la cause.
- Un module génère des erreurs et vous voulez le taux d'erreur par module sans lire les journaux.
- Vous voulez vérifier que la mémoire reste stable après un déploiement en la surveillant pendant quelques minutes.
- Vous avez besoin de la durée de fonctionnement et du nombre de threads pour répondre à une question de support.

## Onglets

| Onglet | Section | Ce qu'il affiche | Rafraîchissement |
| --- | --- | --- | --- |
| Overview | System Resources | **Utilisation du CPU**, **Utilisation de la mémoire** (utilisée et totale), **Temps de fonctionnement**, **Nombre de threads**, et **Méthodes les plus gourmandes en CPU** avec leur temps moyen | Toutes les 5 secondes |
| Methods | Method Performance | Chaque méthode suivie avec **Appels**, **Temps moyen**, **Temps total** et **Dernière exécution** ; triable par n'importe quelle colonne, avec un bouton qui efface les données collectées | Toutes les 30 secondes |
| Events | Event Metrics | **Événements au total**, **Erreurs totales**, **Types d'événements** et **Taux d'erreur moyen**, puis chaque type d'événement Discord avec le nombre traité, les erreurs, le temps d'exécution et le taux d'erreur | Toutes les 10 secondes |
| Modules | Module Metrics | **Modules actifs**, **Événements au total**, **Erreurs totales** et **Taux d'erreur moyen**, puis chaque module avec les événements traités, les erreurs, le temps d'exécution et le taux d'erreur | Toutes les 10 secondes |

L'utilisation du processeur est mesurée sur une demi-seconde à chaque rafraîchissement de l'onglet Overview, et ne concerne que le processus du bot, et non toute la machine. La mémoire correspond à l'ensemble de travail du processus. La mémoire totale est lue sur l'hôte sous Windows et Linux, et affiche 0 ailleurs.

> [!NOTE]
> L'onglet Methods est vide tant que les méthodes suivies n'ont pas été exécutées. Utilisez le bot un moment, puis revenez.

## Paramètres

Il n'existe aucun paramètre. Seule action disponible : le bouton d'effacement de l'onglet Methods, qui supprime les temps des méthodes. Les métriques d'événements et de modules ne peuvent pas être effacées manuellement ; elles se réinitialisent toutes les heures.

## Mise en place pas à pas

1. Connectez-vous au tableau de bord avec un compte propriétaire du bot.
2. Ouvrez **Performance** depuis la barre latérale. Elle n'apparaît que pour les propriétaires.
3. Laissez **Vue d'ensemble** ouvert une minute pour observer la stabilisation du processeur et de la mémoire.
4. Passez à **Modules** et triez par erreurs pour repérer tout module qui se comporte mal, puis **Événements** pour voir quels types d'événements sont les plus sollicités.
5. Utilisez **Méthodes** pour repérer les méthodes lentes, et effacez-le après une correction pour mesurer à nouveau.

## Commandes

La page Performance est uniquement accessible depuis le tableau de bord ; il n'existe pas de module du bot correspondant. Quelques commandes réservées au propriétaire couvrent des sujets proches dans le chat. Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Objet |
| --- | --- | --- | --- |
| `stats` | | Personne | Version du bot, commandes exécutées par cinq secondes, mémoire, nombre de caches, shard et durée de fonctionnement |
| `commandstats` | `cstats` | Propriétaire du bot | Commande, module, serveur et utilisateur les plus utilisés |
| `shardstats` | | Propriétaire du bot | État de chaque shard |

## Astuces et pièges

- La page vérifie la propriété via le bot ; un compte propriétaire sur une instance du bot mais pas sur une autre sera donc redirigé sur la seconde.
- Les chiffres sont propres à chaque processus. Sur un bot shardé réparti sur plusieurs processus, vous ne voyez que le processus auquel le tableau de bord est connecté.
- Rien de cette page n'est enregistré. Si vous avez besoin d'un historique, notez les chiffres ou faites des captures d'écran.
- Un taux d'erreur élevé sur un type d'événement indique généralement un module qui écoute cet événement ; consultez ensuite l'onglet Modules.

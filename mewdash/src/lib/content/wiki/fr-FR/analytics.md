---
title: Analytics
slug: analytics
summary: Une page du tableau de bord réservée aux propriétaires du bot, avec l'historique enregistré des commandes, événements de passerelle, latences, erreurs, croissance des serveurs, adoption des fonctionnalités, usage de l'IA et de la musique, trafic du site web et règles d'alerte par webhook.
icon: fa-chart-simple
category: Analytics
dashboard: /owner/analytics
tags: [analytics, metrics, telemetry, commands, events, latency, errors, growth, alerts, shards, owner, analyses, métriques, télémétrie, commandes, événements, latence, erreurs, croissance, alertes, shards, propriétaire]
related: [performance, leave-feedback, administration]
---

## Ce que cela fait

Analytics est la page d'historique pour la personne qui gère le bot. Elle n'est visible que pour les propriétaires du bot : la barre latérale la masque à tous les autres, et l'ouverture directe de l'URL renvoie les non-propriétaires à l'accueil du tableau de bord. Rien ici n'est à configurer pour le personnel des serveurs.

Alors que [Performance](/wiki/performance) affiche le processus en direct et oublie tout au redémarrage, Analytics lit ce que le bot a écrit dans sa propre base de données. Chaque instance en cours d'exécution enregistre les commandes, les événements de passerelle, la latence des shards, les appels REST, les temps de la base de données, les jauges du processus, les exceptions, l'usage des fonctionnalités, l'activité IA et musique, et les consultations de pages du tableau de bord. Les chiffres sont agrégés en mémoire par minute, vidés chaque minute, regroupés dans des tranches de 5 minutes et d'une heure, puis purgés selon un calendrier fixe. Vous pouvez donc consulter la semaine dernière, la comparer à la précédente, et filtrer par instance, shard ou serveur.

Un récapitulatif hebdomadaire peut être publié dans un webhook Discord, et des règles d'alerte sur n'importe quelle métrique enregistrée envoient une notification vers un webhook lorsqu'un seuil est franchi.

## Pourquoi l'utiliser

- Vous voulez savoir si une hausse d'erreurs a commencé avant ou après un déploiement, et pas seulement ce qui échoue actuellement.
- Un serveur signale que le bot est lent et vous voulez sa latence de commandes, son activité et ses événements de sécurité sur une plage de dates.
- Vous voulez voir quelles fonctionnalités les serveurs configurent et utilisent réellement, et comment cela a évolué sur plusieurs mois.
- Vous avez besoin d'une notification Discord lorsque la latence des shards, le taux d'erreurs ou les 429 REST dépassent une limite, sans surveiller une page.
- Vous voulez un résumé du lundi sur la croissance, les commandes, les erreurs et les fonctionnalités les plus utilisées, publié dans un salon.

## Onglets

| Onglet | Ce qu'il affiche |
| --- | --- |
| Overview | Tuiles pour **Serveurs**, **Utilisateurs**, **Commandes / min**, **Événements de passerelle**, **Requêtes REST / s**, **Erreurs non gérées** (ouvre les groupes d'exceptions), **Pire latence de shard** et **Lecteurs de musique** ; latence des shards avec bandes d'alerte ; alertes actuellement déclenchées ; commandes et événements de passerelle par seconde, par type ; instantanés quotidiens des serveurs ; débit REST ; mémoire du processus |
| Commands | Listes de sélection par type, module et résultat ; **Exécutions**, **Erreurs**, **Durée p95** et **p50** ; invocations par module ; erreurs par classe ; durées p50, p95, p99 ; invocations par type ; carte de chaleur des heures UTC par taille de serveur ; **Commandes les plus utilisées**, un **Journal des exécutions** paginé, **Commandes en échec les plus fréquentes** où une ligne ouvre ses exemples d'erreurs récentes |
| Events | Événements de passerelle par seconde, par type ; nombre sur la plage et tableau par type ; événements par shard ; p95 des gestionnaires par type ; erreurs des gestionnaires par module et par type d'événement |
| Latency | **REST p95**, **REST 5xx**, **REST 429**, **Limitations de débit**, **BDD p95**, **Erreurs BDD**, **Reconnexions des shards**, **Erreurs non gérées** ; latence et débit REST par route ; hits de limitation par route ; p95 et erreurs de la base de données par opération ; CPU, RSS, threads et GC de génération 2 ; un tableau par shard avec état, latence, pic, serveurs et reconnexions ; groupes d'exceptions non gérées où une ligne ouvre les occurrences ; erreurs par type |
| Servers | **Serveurs**, **Utilisateurs**, **Arrivé**, **Parti**, **Solde** ; instantanés des serveurs et utilisateurs sur 30 jours ; arrivées et départs par jour ; churn avec taux de rebond et arrivées et départs par taille ; rétention par jour d'arrivée ; arrivées par taille ; tableaux **Serveurs ayant rebondi** et **Devenus silencieux** où une ligne ouvre la fiche du serveur |
| Guilds | Sélecteur de type d'événement et minimum d'événements par heure ; un identifiant de serveur ouvre la **Fiche du serveur**, une carte de chaleur d'activité par type et heure, un journal paginé et filtrable des **Événements de sécurité** ; **Serveurs les plus actifs** ; **Activité inhabituelle** notée par rapport à la même heure des 14 jours précédents |
| Features | **Adoption des fonctionnalités** avec les nombres configurés et activés issus du recensement nocturne, les serveurs actifs, l'activité et le taux d'erreurs ; fonctionnalités utilisées par serveur ; taille du serveur par rapport aux fonctionnalités utilisées ; pour la fonctionnalité sélectionnée, **Utilisation des paramètres** issu du dernier recensement et une série de recensement configurée ou activée sur 90, 180 ou 365 jours |
| AI | **Requêtes**, **Tokens entrants**, **Tokens sortants**, **Coût estimé** aux tarifs publics pour les modèles tarifés ; un tableau par modèle avec échecs, tokens, p95 et coût ; requêtes, tokens et p95 par modèle ; serveurs les plus actifs avec le chat IA |
| Music | **Joueurs**, **Pistes lancées**, **Erreurs** ; lecteurs par nœud ; pistes lancées par source ; erreurs par type ; état des nœuds ; pistes terminées par raison |
| Website | **Vues de pages**, **Visiteurs**, **Requêtes p95**, **5xx** ; vues par route ; durée des requêtes ; un tableau par route avec visiteurs, p95 et 5xx ; 4xx et 5xx par route ; un entonnoir connexion, callback OAuth, tableau de bord avec les abandons |
| Alerts | Groupes en alerte ; le tableau des règles avec activation, test, mise en sourdine pendant 1 heure et suppression ; un journal paginé des transitions d'état avec la valeur par rapport au seuil et indiquant si un webhook a été envoyé ; **Nouvelle règle** et **Envoyer le récapitulatif maintenant** |
| Pipeline | Une pastille d'état ; **Dernier vidage**, **Dernière agrégation**, **Dernière maintenance**, **Séries en attente**, **Lignes en attente** ; la dernière erreur d'écriture le cas échéant ; nombre de lignes et dernière ligne par table ; instances enregistrées avec leur heartbeat et leur dernier nombre de serveurs ; durée des écritures et lignes par écriture |

L'état du pipeline est `healthy` lorsque la dernière écriture a au plus 60 secondes, le dernier regroupement au plus 10 minutes et qu'il n'y a aucune erreur d'écriture ; `flush stale` et `rollup stale` sinon, `error` lorsqu'une écriture a échoué, et `disabled` lorsque Analytics est désactivé dans la configuration du bot. Une instance dont le dernier nombre de serveurs date de plus de 3 minutes est signalée en jaune, et au-delà de 10 minutes en rouge.

> [!NOTE]
> Tout est en UTC. Les instantanés, les lignes de recensement et les totaux quotidiens sont écrits une fois par nuit ; les onglets Servers et Features restent donc vides tant que le bot n'a pas fonctionné au moins une fois après 00h05 UTC.

### Barre de filtres

La barre au-dessus des onglets s'applique à tous les onglets et est conservée dans l'URL : changer d'onglet, recharger la page ou partager le lien conserve la même vue.

| Contrôle | Ce qu'il fait |
| --- | --- |
| Range | `15m`, `1h`, `6h`, `24h`, `7d`, `30d`, ou un début et une fin UTC personnalisés sur 31 jours au maximum |
| compare | Superpose la même durée, une période plus tôt, sur les graphiques et tuiles qui le supportent |
| Bot | Une instance, choisie parmi celles connues du pipeline, ou toutes |
| Shard | Un identifiant de shard ou tous |
| guild id | Limite les tables brutes et les vues de serveur à un seul serveur ; appuyez sur Entrée pour appliquer |
| Refresh | Tout se recharge toutes les 30 secondes lorsque l'onglet est visible ; le bouton force le rechargement |
| Copy link | Copie l'URL actuelle avec tous les filtres |

Les tuiles ouvrent une vue détaillée avec la répartition de leur métrique. Les graphiques peuvent regrouper les petites séries dans **Autre**, afficher un total cumulé, être zoomés avec les curseurs de plage, et isoler une série par clic droit sur son entrée de légende.

## Paramètres

La page elle-même n'a aucun paramètre. Les règles d'alerte et trois clés de configuration du bot sont tout ce qui est à configurer.

### Règles d'alerte

Chaque règle surveille une métrique. Les champs de l'éditeur sont :

| Champ | Signification |
| --- | --- |
| Name, Description, Severity, enabled | Libellé, et `info`, `warning` ou `critical`, qui définit la couleur et le titre du webhook |
| Metric, Filters, Group by | Toute métrique enregistrée, filtres d'étiquettes facultatifs, et étiquette facultative pour évaluer chaque valeur séparément, par exemple par `shard` |
| Agg, Window | `sum`, `avg`, `min`, `max`, `last`, `rate`, `count`, `p50`, `p95` ou `p99` sur 1 minute à 1 jour |
| Comparator, Threshold, High | `gt`, `gte`, `lt`, `lte`, `outside` (en dessous de Threshold ou au-dessus de High), `pct_change` (pourcentage par rapport à la même fenêtre une référence plus tôt), `deviates` (score z par rapport à la moyenne des N derniers jours), `nodata` (aucune donnée sur la fenêtre) |
| Baseline, Direction | Pour `pct_change` et `deviates` : hier ou la semaine dernière, et `up`, `down` ou `both` |
| For | Durée pendant laquelle le dépassement doit persister avant que la règle se déclenche ; `immediately` ignore l'état en attente |
| Cooldown | Intervalle minimum entre deux notifications de déclenchement |
| Repeat | Renotifier tant que la règle reste déclenchée, ou une seule fois |
| Min samples | Ignorer l'évaluation lorsque la fenêtre contient moins d'échantillons que ce nombre |
| Webhook URL, Mention role id, Thread id | Un webhook Discord, un rôle facultatif mentionné au déclenchement, un fil facultatif où publier |
| Quiet from, Quiet to | Une plage UTC, pouvant chevaucher minuit, pendant laquelle rien n'est envoyé |
| notify on resolve | Publier aussi lorsque le groupe revient à la normale |

L'aperçu à droite dessine le seuil brouillon sous forme de bande en pointillés pour les comparateurs absolus.

Les règles sont évaluées chaque minute. Chaque groupe passe de `ok` à `pending` (uniquement si For est défini), puis à `firing`, puis revient à `ok` ; le journal d'événements enregistre la transition `firing` vers `ok` comme `resolved`. Mettre en sourdine depuis le tableau réduit une règle au silence pendant 1 heure ; l'API autorise jusqu'à 30 jours. Les règles mises en sourdine et les plages silencieuses changent toujours d'état, elles n'envoient simplement rien. **Envoyer un test** envoie un message de test au webhook de la règle.

### Clés de configuration du bot

Définissez-les dans `bot.yml` ou avec la commande propriétaire `config`. Toutes sont activées par défaut, avec 30 et vide.

| Clé | Signification |
| --- | --- |
| `analyticsEnabled` | `false` transforme le collecteur en opération nulle ; l'onglet Pipeline affiche `disabled` |
| `analyticsRetentionDays` | Nombre de jours pendant lesquels les lignes brutes de commandes, les vues de pages et le journal d'événements des serveurs sont conservés |
| `analyticsDigestWebhook` | Webhook Discord où publier le récapitulatif hebdomadaire ; vide désactive le récapitulatif |

### Ce qui est conservé et pendant combien de temps

| Données | Conservées |
| --- | --- |
| Tranches d'1 minute | 48 heures |
| Tranches de 5 minutes | 14 jours |
| Tranches d'1 heure | 400 jours |
| Invocations de commandes, vues de pages, événements de sécurité des serveurs | `analyticsRetentionDays` |
| Exemples d'erreurs, activité horaire par serveur pour les fonctionnalités et événements | 90 jours |
| Événements d'alerte | 180 jours |
| Instantanés quotidiens, recensements, totaux quotidiens | Non purgés |

Les lignes brutes sont écrites toutes les 15 secondes, les tranches d'une minute chaque minute ; les tranches d'une minute se regroupent en tranches de 5 minutes toutes les 5 minutes, et celles de 5 minutes en tranches horaires ; la purge s'exécute toutes les 6 heures.

### Ce qui n'est jamais stocké

- Le contenu des messages. Les lignes de commandes contiennent le nom de la commande, le module, le type, le résultat, les durées et, en cas d'échec, la classe de l'exception et jusqu'à 200 caractères de son message.
- Les identifiants d'utilisateurs. Rien dans Analytics n'est indexé par la personne qui a exécuté une commande.
- Les adresses IP des clients. Les vues de pages conservent un hachage du visiteur à partir de l'IP et du user agent, avec un sel qui change chaque jour, de sorte qu'un visiteur ne peut pas être suivi d'un jour à l'autre. Les requêtes vers `/api/`, `/cdn/`, les ressources statiques et la page Analytics elle-même ne sont pas enregistrées.

Les serveurs et utilisateurs ayant refusé les statistiques sont respectés : leur commande compte toujours dans l'agrégat, mais la ligne brute est écrite sans l'identifiant du serveur ni sa taille.

## Guide de configuration

1. Connectez-vous au tableau de bord avec un compte propriétaire du bot et ouvrez **Analyses** depuis la barre latérale. Elle n'apparaît que pour les propriétaires.
2. Ouvrez d'abord **Pipeline**. La pastille doit indiquer `healthy` et chaque instance doit avoir un heartbeat récent ; une écriture obsolète signifie que le bot n'écrit pas.
3. Choisissez une plage et, si vous exécutez plusieurs instances, un bot dans la barre de filtres. Cochez **comparer** pour voir la période précédente.
4. Allez dans **Alertes**, cliquez sur **Nouvelle règle**, choisissez une métrique comme `shard.latency` avec `max` sur 5 minutes, `gt` avec votre limite, groupée par `shard`, collez un webhook et cliquez sur **Envoyer un test** sur la ligne enregistrée.
5. Définissez `analyticsDigestWebhook` dans la configuration du bot, puis cliquez sur **Envoyer le récapitulatif maintenant** pour voir à quoi ressemblera la publication du lundi.
6. Revenez après une nuit pour **Serveurs**, **Fonctionnalités** et la série de recensement.

## Commandes

La page Analytics n'existe que dans le tableau de bord ; il n'y a pas de module correspondant dans le bot. La commande propriétaire `config` modifie les trois clés ci-dessus, et quelques commandes propriétaire couvrent les mêmes sujets dans le chat. Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Objectif |
| --- | --- | --- | --- |
| `config bot analyticsEnabled false` | `conf` | Propriétaire du bot | Arrêter d'enregistrer les analyses ; `true` les relance |
| `config bot analyticsRetentionDays 14` | `conf` | Propriétaire du bot | Modifier la durée de conservation des lignes brutes |
| `config bot analyticsDigestWebhook <url>` | `conf` | Propriétaire du bot | Destination du récapitulatif du lundi |
| `stats` | | Personne | Version du bot, commandes exécutées par cinq secondes, mémoire, nombre d'éléments en cache, shard et temps de fonctionnement |
| `commandstats` | `cstats` | Propriétaire du bot | Commande, module, serveur et utilisateur les plus utilisés |
| `shardstats` | | Propriétaire du bot | État de chaque shard |

## Astuces et pièges

- La page vérifie la propriété via le bot ; un compte propriétaire sur une instance du bot mais pas sur une autre sera redirigé sur la seconde.
- Le récapitulatif est envoyé le lundi à partir de 09h00 UTC et couvre les sept derniers jours par rapport aux sept précédents : serveurs, commandes, erreurs, événements, nouveaux serveurs et serveurs perdus, vues de pages, tokens IA, pistes musicales, ainsi que les cinq commandes, erreurs et fonctionnalités principales.
- Les séries sur une longue plage proviennent des tranches horaires, donc les percentiles sont lissés ; réduisez la plage pour voir le détail à la minute, qui n'existe que pour les 48 dernières heures.
- Si le tampon en mémoire du collecteur se remplit avant une écriture, les lignes brutes de commandes supplémentaires sont abandonnées pour cet intervalle, tandis que les agrégats continuent de compter ; un chiffre **Lignes en attente** qui augmente sur Pipeline en est le signe.
- Les règles d'alerte nécessitent une URL de webhook Discord ; toute autre valeur est rejetée à l'enregistrement.
- Le coût IA estimé ne couvre que les modèles dont le prix public est connu, le total est donc un minimum.

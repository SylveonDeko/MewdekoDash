---
title: Minecraft
slug: minecraft
summary: Enregistrez vos serveurs Minecraft, publiez des embeds d'état en direct qui se mettent à jour seuls, recevez des alertes de connexion et de déconnexion, exécutez des commandes RCON et reliez le chat en jeu, les connexions, les morts et les progrès à Discord grâce au plugin compagnon.
icon: fa-server
category: Entertainment
dashboard: /dashboard/minecraft
module: Minecraft
tags: [minecraft, mc, server status, bridge, rcon, whitelist, chat bridge, java, bedrock, geyser, player lookup, skin, état du serveur, pont, liste blanche, pont de chat, recherche de joueur, skin]
related: [statchannels, logging, utility]
---

## Ce que cela fait

Le personnel enregistre un ou plusieurs serveurs Minecraft par leur nom et leur adresse. Chaque membre peut ensuite exécuter `mcstatus` pour voir si le serveur est en ligne, son MOTD, sa version, sa latence et la liste des joueurs connectés. Un serveur peut aussi être surveillé : le bot publie un embed d'état dans un salon et le modifie selon un minuteur, ou écrit le nombre de joueurs dans le sujet du salon, et annonce quand le serveur tombe ou revient.

Si le serveur a RCON activé, le personnel peut envoyer des commandes de console et gérer la liste blanche depuis Discord ou la console du tableau de bord, sans rejoindre la partie.

Le plugin compagnon facultatif transforme ce lien en pont bidirectionnel. Le chat des joueurs, les connexions, les déconnexions, les morts et les progrès sont publiés dans les salons Discord de votre choix, et les messages tapés dans le salon du pont sont diffusés aux joueurs en jeu.

## Pourquoi l'utiliser

- Afficher un embed en direct « qui est en ligne » pour que les membres sachent quand il vaut la peine de se connecter.
- Alerter la communauté dès que le serveur plante ou revient après une maintenance.
- Ajouter à la liste blanche de nouveaux membres depuis Discord sans ouvrir la console du serveur.
- Tenir les membres qui ne jouent que sur Discord informés grâce au chat en jeu, aux morts et aux progrès.
- Rechercher l'UUID ou le rendu de skin d'un joueur pendant le traitement d'une candidature ou d'un signalement.

## Types de serveurs

| Type | Port par défaut | Comment il est interrogé |
| --- | --- | --- |
| Java Edition | 25565 | Ping de la liste des serveurs ; le protocole de requête est aussi utilisé lorsque **Query Port** est défini et que `enable-query=true` |
| Bedrock Edition | 19132 | Ping Bedrock |
| Geyser (Java + Bedrock) | 25565 | Ping Java, signalé comme Geyser |

Chaque serveur possède un nom stocké en minuscules, et le premier serveur ajouté devient celui utilisé par défaut par `mcstatus` sans argument. Les adresses privées, réservées et de bouclage sont refusées, sauf si l'hôte du bot les a autorisées.

## Surveiller un serveur

Définissez un **Salon de surveillance** et le bot interroge le serveur toutes les **Watch Interval** minutes (5 par défaut, 1 au minimum). Ce qu'il fait du résultat dépend du **Mode de surveillance**.

| Mode | Comportement |
| --- | --- |
| Embed (edit in place) | Publie un seul embed d'état et le modifie à chaque cycle ; le republie si le message est supprimé |
| Channel Topic | Écrit une courte ligne d'état dans le sujet du salon, au plus une fois toutes les cinq minutes |
| Both | Fait les deux à la fois |

À chaque cycle, le bot enregistre aussi un instantané de l'état en ligne, du nombre de joueurs, de la latence et de la version. L'onglet **Historique** du tableau de bord les représente dans le temps.

Lorsque l'état en ligne bascule, le bot publie une alerte dans le salon de surveillance : un embed vert « came online » ou rouge « went offline » par défaut, ou vos propres modèles **Alerte de serveur en ligne** et **Alerte de serveur hors ligne**.

### Marqueurs d'état

Le **Embed de surveillance personnalisé** et les deux modèles d'alerte passent par l'analyseur d'embeds et acceptent les marqueurs suivants.

| Marqueur | Valeur |
| --- | --- |
| `%mc.server.name%` | Le nom enregistré |
| `%mc.server.address%` | Nom d'hôte ou IP |
| `%mc.server.port%` | Port |
| `%mc.online%` | `Online` ou `Offline` |
| `%mc.players.online%` | Nombre actuel de joueurs |
| `%mc.players.max%` | Nombre de places |
| `%mc.player.list%` | Noms des joueurs connectés |
| `%mc.motd%` | Le MOTD sans les codes de mise en forme |
| `%mc.version%` | Version signalée |
| `%mc.latency%` | Ping, par exemple `42ms` |
| `%mc.favicon%` | URL de l'icône du serveur |
| `%mc.map%` | Nom du monde, protocole de requête uniquement |
| `%mc.gamemode%` | Mode de jeu, protocole de requête uniquement |
| `%mc.software%` | Logiciel du serveur, protocole de requête uniquement |
| `%mc.plugins%` | Liste des plugins, protocole de requête uniquement |
| `%mc.query%` | `Yes` si la requête étendue a répondu |
| `%mc.geyser%` | `Yes` si Geyser a été détecté |

## RCON et liste blanche

Activez **Paramètres RCON** pour un serveur, puis saisissez le **Port RCON** et le **Mot de passe RCON** issus de `server.properties`. `mcrcon` envoie alors n'importe quelle commande de console et renvoie le résultat. `mcwhitelist` regroupe les commandes de liste blanche avec les actions `add`, `remove`, `list`, `on`, `off` et `reload`. Le tableau de bord affiche la liste blanche sous forme de liste avec des boutons d'ajout et de suppression, et l'onglet **Console** offre une invite de commande pour les serveurs dont RCON est activé.

> [!WARNING]
> RCON donne un accès complet à la console. Réservez `mcrcon` aux administrateurs et traitez le mot de passe comme n'importe quel autre identifiant de serveur.

## Le pont du plugin compagnon

Le pont nécessite le plugin MewdekoMC sur le serveur de jeu : un plugin Paper pour Paper 1.21+ ou un mod NeoForge pour 21.1.x, tous deux sur Java 21. Sur le tableau de bord, ouvrez la section **Plugin compagnon** du serveur et générez une clé. Copiez l'**API URL** et l'**Clé d'API** dans le `config.yml` du plugin (Paper) ou dans `config/mewdeko-server.toml` (NeoForge), puis redémarrez ou exécutez `/mewdeko reconnect`. La clé n'est affichée qu'une seule fois ; générez-en une nouvelle pour la remplacer.

Une fois connecté, le plugin diffuse les événements par WebSocket et le bot les achemine vers les salons.

| Événement | Destination | Apparence par défaut |
| --- | --- | --- |
| Connexion d'un joueur | Salon **Arrivées/Départs** | Embed vert avec le nom et l'avatar du joueur |
| Déconnexion d'un joueur | Salon **Arrivées/Départs** | Embed rouge avec le nom et l'avatar du joueur |
| Chat | Salon **Pont de chat** | `**player**: message` |
| Mort | Salon **Morts** | Embed gris avec le message de mort |
| Progrès | Salon **Progrès** | Embed vert avec le nom du progrès |
| État du serveur | Nulle part ; enregistré comme instantané d'historique avec TPS et mémoire | |

Tout salon d'événement laissé vide se rabat sur le **Salon de surveillance**. Les messages envoyés par des utilisateurs non-bots dans le salon Chat Bridge (ou dans le salon de surveillance si aucun n'est défini) sont transmis au jeu sous la forme `[Discord] user: message` par défaut. La configuration du plugin peut désactiver chaque catégorie d'événements ; la diffusion de la console est désactivée par défaut et n'est pas affichée par le bot.

### Modèles d'événements du pont

Chaque événement envoyé vers Discord peut avoir son propre modèle sous **Modèles d'événements du pont**. Ils acceptent la sortie du créateur d'embeds, les mentions sont neutralisées, et les marqueurs suivants sont remplacés.

| Modèle | Marqueurs |
| --- | --- |
| Player Join (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Player Leave (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Chat Message (Discord) | `%mc.player%`, `%mc.message%`, `%mc.avatar%` |
| Death Message (Discord) | `%mc.player%`, `%mc.death.message%`, `%mc.avatar%` |
| Advancement (Discord) | `%mc.player%`, `%mc.advancement%`, `%mc.avatar%` |
| Chat from Discord (In-game format) | `%user%`, `%message%`, `%channel%` ; utilisez les codes couleur de section Minecraft |

## Paramètres

La page Minecraft comporte un onglet **Serveurs**, un onglet **Ajouter le serveur**, **Historique**, **Console**, et un onglet portant le nom du serveur sélectionné pour le modifier.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Name | | Identifiant court utilisé dans les commandes, par exemple `survival` |
| Address | | Nom d'hôte ou IP |
| Port | 25565 | Port de jeu ; 19132 pour Bedrock |
| Type | Java Edition | Java, Bedrock ou Geyser |
| Query Port (0 = game port) | 0 | Port du protocole de requête étendu |
| Watch Channel | aucun | Salon qui reçoit l'embed d'état et les alertes |
| Watch Interval (minutes) | 5 | Fréquence d'interrogation du serveur |
| Watch Mode | Embed | Embed, Channel Topic ou Both |
| Custom Watch Embed | embed par défaut | Votre propre embed d'état utilisant les marqueurs ci-dessus |
| Server Online Alert | embed par défaut | Publié lorsque le serveur revient |
| Server Offline Alert | embed par défaut | Publié lorsque le serveur tombe |
| Event Channels | salon de surveillance | Chat Bridge, Join/Leave, Deaths, Advancements |
| Bridge Event Templates | valeurs par défaut | Modèles par événement listés ci-dessus |
| RCON Settings | désactivé | Interrupteur, RCON Port, RCON Password |
| Companion Plugin | aucune clé | Générer ou révoquer la clé API du plugin et copier l'API URL |

## Mise en place pas à pas

1. Ouvrez **Minecraft** dans le tableau de bord et allez dans **Ajouter le serveur**.
2. Saisissez un **Nom**, l'**Adresse** et le **Port**, choisissez le **Type**, puis un **Salon de surveillance** et un **Mode de surveillance**. Enregistrez.
3. Vérifiez l'onglet **Serveurs** : la carte d'état devrait afficher le serveur en ligne en quelques secondes.
4. Modifiez le serveur pour activer **Paramètres RCON** si vous voulez un accès à la console et à la liste blanche, puis essayez l'onglet **Console**.
5. Pour relier le chat, définissez les **Event Channels**, générez une clé sous **Plugin compagnon**, installez le plugin sur le serveur de jeu et collez l'URL et la clé dans sa configuration.
6. Rejoignez la partie et écrivez quelque chose : cela doit apparaître dans le salon Chat Bridge, et une réponse dans ce salon doit apparaître en jeu.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les versions slash se trouvent sous `/minecraft`.

| Commande | Alias | Nécessite | Objet |
| --- | --- | --- | --- |
| `mcstatus [name or address]` | `mcs` | Personne | État du serveur par défaut, d'un serveur enregistré, ou de tout `host:port` saisi |
| `mcadd <name> <address[:port]>` | | Gérer le serveur | Enregistrer un serveur ; préfixez l'adresse par `bedrock:` pour Bedrock |
| `mcremove <name>` | `mcrm` | Gérer le serveur | Supprimer un serveur enregistré |
| `mclist` | `mcl` | Personne | Lister les serveurs enregistrés avec leur type, le marqueur par défaut et le salon de surveillance |
| `mcdefault <name>` | `mcdef` | Gérer le serveur | Choisir le serveur utilisé par défaut par `mcstatus` |
| `mcwatch <name> [#channel]` | `mcw` | Gérer le serveur | Commencer à publier l'état dans un salon, ou arrêter sans salon |
| `mcwatchmode <name> <embed, channeltopic or both>` | `mcwm` | Gérer le serveur | Choisir l'affichage de l'état pour la surveillance |
| `mcembed <name> [template]` | `mce` | Gérer le serveur | Définir un embed d'état personnalisé, ou `-` pour le réinitialiser |
| `mcplayer <username>` | `mcp` | Personne | Afficher l'UUID, l'avatar et le skin d'un joueur |
| `mcskin <username>` | | Personne | Afficher le rendu du skin d'un joueur |
| `mcrcon <name> <command>` | | Administrateur | Exécuter une commande de console via RCON |
| `mcwhitelist <name> <action> [player]` | `mcwl` | Gérer le serveur | `add`, `remove`, `list`, `on`, `off` ou `reload` |

## Astuces et pièges

- `mcstatus` est limité à dix requêtes par minute et par serveur Discord, partagées entre tous les membres.
- Les recherches directes d'adresse avec `mcstatus play.example.com:25565` fonctionnent sans enregistrement, mais les adresses privées et locales sont bloquées.
- Le bot a besoin de Gérer les salons dans le salon de surveillance pour le mode Channel Topic, et Discord limite lui-même les modifications de sujet : le mode sujet ne se met donc jamais à jour plus d'une fois toutes les cinq minutes.
- Les détails étendus comme la carte, le mode de jeu et les plugins n'apparaissent que si `enable-query=true` est défini dans `server.properties` et que le **Query Port** correspond.
- Si l'embed de surveillance est supprimé, le cycle suivant en publie un nouveau au lieu d'échouer.
- Les messages du pont neutralisent `@everyone`, `@here` et les mentions d'utilisateurs, afin que les joueurs ne puissent pas faire de ping sur Discord depuis le jeu.

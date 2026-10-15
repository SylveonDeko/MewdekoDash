---
title: Déclencheurs
slug: chat-triggers
summary: Réponses automatiques aux messages, réactions, commandes slash et événements du bot, avec conditions, coûts, compteurs, attribution de rôles et un jeu complet de variables.
icon: fa-comments
category: Actions
dashboard: /dashboard/chat-triggers
module: ChatTriggers
tags: [chat triggers, triggers, autoresponder, custom commands, auto reply, reaction roles, regex, counters, placeholders, event triggers, déclencheurs, réponse automatique, commandes personnalisées, rôles par réaction, expression régulière, compteurs, variables, déclencheurs d'événements]
related: [administration, xp, currency, tickets, giveaways]
---

## Ce que ça fait

Un déclencheur est un texte que le bot surveille, accompagné d'une réponse qu'il envoie lorsqu'il le repère. Dans sa forme la plus simple, un membre tape `hello` et le bot répond `hi there`. À partir de là, un déclencheur peut correspondre à n'importe quel endroit d'un message ou à une expression régulière, répondre avec un embed, ajouter des réactions emoji, envoyer la réponse en MP, supprimer le message du membre, attribuer ou retirer des rôles, publier une copie dans un autre salon ou webhook, et lancer un second déclencheur à la fin.

Un déclencheur ne se limite pas aux messages. Le même déclencheur peut être enregistré comme commande contextuelle slash, de message ou d'utilisateur, se lancer lorsqu'une personne ajoute ou retire une réaction précise, ou se déclencher sur un événement du bot, comme une montée de niveau, l'arrivée d'un membre, le début d'un boost, l'ouverture d'un ticket ou la victoire à un concours.

Chaque déclencheur possède ses propres conditions : un délai de recharge par utilisateur, salon ou serveur, un niveau XP minimum, un coût ou une récompense en monnaie, des horaires et jours d'activité, une date d'expiration, un nombre maximal d'utilisations, un âge minimum de compte ou une durée minimale sur le serveur, et un compteur qui doit se situer dans une plage donnée. Si une condition échoue, le déclencheur reste silencieux, ou affiche un message que vous avez rédigé. Le testeur du tableau de bord indique précisément quelle règle bloquerait un message d'exemple.

Les réponses peuvent lire des valeurs provenant du reste du bot : le niveau, le solde, la réputation ou le nombre de messages du membre, le texte qui suit le déclencheur, les personnes mentionnées, le message auquel il répond, les groupes de capture d'une expression régulière, ainsi que des compteurs partagés par le serveur que la réponse peut lire et incrémenter.

## Pourquoi l'utiliser

- Répondre automatiquement aux questions fréquentes : `!rules` affiche l'embed des règles.
- Des commandes amusantes que les membres peuvent utiliser gratuitement, en dehors du jeu de commandes intégré du bot.
- Un déclencheur de type `daily` qui verse de la monnaie une fois par jour et par utilisateur, grâce à un délai de recharge et une récompense.
- Un mot « verify » qui attribue un rôle et supprime le message.
- Des rôles par réaction qui donnent un rôle lorsqu'un membre réagit avec un emoji donné.
- Des annonces personnalisées de montée de niveau, de bienvenue ou de boost, mises en forme à votre goût et déclenchées par l'événement plutôt que par un message.
- Des compteurs en cours, comme « jours depuis le dernier incident », que chacun peut incrémenter avec un mot.

## Types de déclencheurs

Un déclencheur possède un ensemble de types activés. Un type détermine ce qui peut le déclencher. Message est activé par défaut ; les autres s'activent pour chaque déclencheur avec `chattriggervalidtype` ou les interrupteurs du tableau de bord.

| Type | Se déclenche lorsque |
| --- | --- |
| Message | Un message correspond au texte du déclencheur |
| Interaction | Quelqu'un exécute la commande slash, de message ou d'utilisateur enregistrée pour ce déclencheur |
| Button | Un bouton dont l'identifiant correspond au déclencheur est pressé |
| Reactions | Quelqu'un ajoute l'emoji du déclencheur à un message |
| ReactionsRemoved | Quelqu'un retire l'emoji du déclencheur d'un message |
| Event | L'un des événements du bot ci-dessous se produit |

### Correspondance des messages

Par défaut, le message complet, en minuscules, doit être identique au déclencheur. Deux options assouplissent cette règle :

- **Correspondre n'importe où dans le message** (`ctca`) : le déclencheur doit apparaître comme mot entier quelque part dans le message.
- **Autoriser le ciblage d'une personne** (`ctat`) : le message peut commencer par le déclencheur suivi d'un espace et d'autres textes, qui deviennent `%target%`.

Les déclencheurs de type **expression régulière** (`addchattriggerregex`) comparent le message au motif. Chaque motif dispose de 100 millisecondes ; un motif qui dépasse ce délai est ignoré. Les groupes de capture nommés ou numérotés sont disponibles dans la réponse sous la forme `%regex.1%` ou `%regex.name%`.

Une **exigence de préfixe** détermine si le message doit commencer par un préfixe avant la comparaison :

| Option | Comportement |
| --- | --- |
| Aucun préfixe requis | Compare le texte brut (par défaut) |
| Préfixe global | Doit commencer par le préfixe global du bot |
| Préfixe du serveur, ou global | Doit commencer par le préfixe du serveur, à défaut par le préfixe global |
| Préfixe du serveur s'il existe | Doit commencer par le préfixe du serveur ; ne correspond jamais si le serveur n'en a pas |
| Un préfixe personnalisé | Doit commencer par le préfixe défini par `ctprefix` |

Si plusieurs déclencheurs correspondent à un même message, l'un d'eux est choisi au hasard. Les messages des bots et des webhooks sont ignorés, sauf si un déclencheur a l'option **Bots uniquement** (`ctallowbots`) activée ; un tel déclencheur ne répond alors qu'aux messages de bots. Le bot ne répond jamais à ses propres messages.

### Déclencheurs d'interaction

`setctintertype` enregistre le déclencheur comme commande d'application Slash, Message ou User. `setctintername` et `setctinterdesc` définissent son nom et sa description ; les noms doivent respecter les règles de nommage des commandes Discord. `ctinterephemeral` rend la réponse visible uniquement par la personne qui a exécuté la commande. `ctintererrors` indique pourquoi l'enregistrement a échoué, par exemple des noms en double ou un nombre de sous-commandes trop élevé.

### Déclencheurs de réaction

`addreactiontrigger <emoji> <response>` crée un déclencheur dont le texte est l'emoji. Activez **Réaction ajoutée** ou **Réaction retirée** comme types. La réponse est publiée dans le salon du message réagi, et l'attribution des rôles concerne le membre qui a réagi (ou, pour **Les personnes mentionnées**, les personnes mentionnées dans le message réagi). Les réactions des bots sont ignorées.

### Déclencheurs d'événement

`ctevent <id> <event>` fait en sorte que le déclencheur se lance sur un événement au lieu d'un message, et active le type Event pour lui. Événements :

| Événement | Se déclenche pour |
| --- | --- |
| XpLevelUp | Un membre gagne un niveau |
| XpLevelDown | Un membre perd un niveau |
| MemberJoin | Un membre rejoint le serveur |
| MemberLeave | Un membre quitte le serveur |
| VoiceJoin | Un membre rejoint un salon vocal |
| VoiceLeave | Un membre quitte un salon vocal |
| Boost | Un membre commence à booster le serveur |
| BoostEnd | Un membre cesse de booster le serveur |
| TicketOpened | Un ticket est ouvert |
| TicketClosed | Un ticket est fermé |
| GiveawayWon | Un membre remporte un concours |

La réponse est envoyée dans le salon défini avec `cteventchannel`, ou dans le salon où l'événement a eu lieu si aucun n'est défini. Les événements d'arrivée, de départ, vocaux et de boost n'ont pas de salon propre : leurs déclencheurs ont donc besoin d'un salon explicite, sinon ils ne font rien. Les déclencheurs d'événement passent par les mêmes conditions et contrôles économiques que les déclencheurs de message, et le membre concerné par l'événement est traité comme l'utilisateur pour les variables et l'attribution des rôles.

## Réponses

La réponse principale est le texte donné lors de la création du déclencheur. Elle passe par l'analyseur d'embeds, elle peut donc être du texte brut, un embed, plusieurs embeds ou des composants créés dans l'éditeur d'embeds du tableau de bord. Des réponses supplémentaires peuvent être ajoutées avec `ctaddresponse`, et le **Mode de réponse** détermine celles qui sont envoyées :

| Mode | Comportement |
| --- | --- |
| Single | Toujours la première réponse (par défaut) |
| Random | Une réponse choisie au hasard ; répétez une ligne pour lui donner plus de poids |
| RoundRobin | Dans l'ordre, une par utilisation, partagée à l'échelle du serveur |
| All | Toutes les réponses, dans l'ordre |

Options de livraison, toutes désactivées par défaut :

- **Répondre au message** (`ctreply`) : envoie la réponse comme réponse Discord.
- **Envoyer la réponse en MP** (`ctdm`) : l'envoie au membre en privé.
- **Supprimer le message déclencheur** (`ctad`) : supprime ce que le membre a tapé.
- **Réagir au message à la place** (`rtt`) : place l'emoji du déclencheur sur le message du membre plutôt que sur la réponse. Ne peut pas être combiné avec la suppression.
- **N'envoyer aucun message** (`ctnr`) : utile pour les déclencheurs qui n'attribuent que des rôles.
- **Supprimer la réponse après** (`ctdeleteafter`) : nombre de secondes avant la suppression de la réponse du bot ; 0 la conserve.
- **Emoji de réaction** (`ctreact`) : jusqu'à six emoji, ajoutés un par seconde. Sans emoji, la liste est vidée.

### Publication croisée

`ctcpch` publie une copie de chaque réponse dans un autre salon du serveur. `ctcpwh` la publie plutôt via une URL de webhook, qui peut se trouver sur un autre serveur. La publication croisée a lieu même lorsque **N'envoyer aucun message** est activé.

### Rôles

**Rôles à attribuer** et **Rôles à retirer** (`ctrgranttoggle`, `ctrremovetoggle`) sont appliqués lorsque le déclencheur se lance. Relancer la commande pour le même rôle le retire de la liste. **Appliquer ces rôles à** (`chattriggerrolegranttype`) choisit la cible :

| Cible | Personnes concernées |
| --- | --- |
| Sender | Le membre qui a déclenché le déclencheur (par défaut) |
| Mentioned | Jusqu'à cinq membres mentionnés dans le message |
| Both | L'auteur plus jusqu'à quatre membres mentionnés |

Lorsque la cible comprend les mentions, celles-ci sont retirées du message avant la comparaison ; ainsi `verify @someone` correspond toujours à un déclencheur `verify`.

### Enchaînement

`ctchain <id> <nextId>` lance un second déclencheur une fois le premier terminé. Le second est évalué selon ses propres règles, y compris ses conditions et ses coûts. Une chaîne s'arrête après cinq étapes et ne repasse jamais par un déclencheur déjà exécuté.

## Conditions

Toutes ces conditions sont vérifiées avant tout débit, envoi ou comptage. Une condition non remplie signifie que le déclencheur ne se lance pas, sans bruit, sauf pour les vérifications de niveau et de monnaie, qui affichent le **Message lorsqu'ils ne peuvent pas l'utiliser** si vous en avez défini un avec `ctreqmsg`.

| Condition | Commande | Par défaut | Comportement |
| --- | --- | --- | --- |
| Délai de recharge | `ctcooldown <id> <seconds> [scope]` | aucun | Bloque les déclenchements répétés pendant ce nombre de secondes. La portée est `User`, `Channel` ou `Guild` |
| Niveau requis | `ctreqlevel <id> <level>` | 0 | Le niveau XP du membre doit être au moins égal à cette valeur |
| Coût | `ctcost <id> <amount>` | 0 | Monnaie prélevée au membre ; pas de déclenchement s'il ne peut pas payer |
| Récompense | `ctreward <id> <amount>` | 0 | Monnaie versée au membre lorsque le déclencheur se lance |
| Récompense d'XP | `ctxpreward <id> <amount>` | 0 | XP accordée lorsque le déclencheur se lance |
| Horaires d'activité | `cttime <id> <HH:mm> <HH:mm> [days...]` | toujours | Ne se lance que dans la plage horaire, selon le fuseau horaire du serveur. Une fin antérieure au début couvre la nuit. Les jours sont des noms ou des nombres de 0 à 6, dimanche étant 0 |
| Expiration | `ctexpiry <id> [duration]` | jamais | Cesse de se lancer après la durée indiquée à partir de maintenant, par exemple `7d` |
| Nombre d'utilisations | `ctmaxuses <id> <uses>` | illimité | S'arrête après ce nombre de déclenchements ; 0 supprime la limite |
| Âge minimum du compte | `ctminage <id> [duration]` | aucun | Le compte doit avoir au moins cet âge |
| Ancienneté minimale sur le serveur | `ctminmember <id> [duration]` | aucun | Le membre doit avoir rejoint le serveur depuis au moins cette durée |
| Plage de compteur | `ctrequirecounter <id> <name> [min] [max]` | aucun | Le compteur nommé doit se situer dans la plage ; `clear` comme nom le supprime |

Le délai de recharge ne démarre qu'après la réussite de toutes les autres conditions : une tentative bloquée ne le consomme donc pas. Le coût est prélevé avant le versement de la récompense ; un déclencheur qui à la fois coûte et rapporte ne verse donc jamais à une personne qui ne pouvait pas payer. Les délais de recharge globaux des commandes définis avec `cmdcd` s'appliquent aussi aux déclencheurs, par utilisateur, en plus du délai propre au déclencheur.

## Compteurs

Les compteurs sont des nombres nommés, stockés par serveur. Ils sont créés la première fois qu'une réponse les utilise et peuvent être lus ou modifiés depuis n'importe quelle réponse :

| Variable | Effet |
| --- | --- |
| `%counter:name%` | Affiche le compteur |
| `%counter:name+%` | Ajoute un et affiche la nouvelle valeur |
| `%counter:name-%` | Retire un et affiche la nouvelle valeur |
| `%usercounter:name%` | Affiche la valeur propre au membre qui a déclenché le déclencheur pour ce nom |
| `%usercounter:name+%` | Ajoute un à la valeur du membre |
| `%usercounter:name-%` | Retire un à la valeur du membre |

Les noms comportent jusqu'à 64 lettres, chiffres, tirets bas ou tirets, et ne sont pas sensibles à la casse. `ctcounters` les liste, `ctcounterset` définit l'un d'eux à une valeur exacte, et `ctcounterdelete` le supprime ainsi que toutes les valeurs par utilisateur sous ce nom. Le panneau **Compteurs** de la barre latérale du tableau de bord permet de faire la même chose.

## Variables

Une réponse peut utiliser l'ensemble général de variables (utilisateur, serveur, salon, bot et heure, de la page des variables), les variables propres aux déclencheurs, et celles fournies par d'autres modules. `ctplaceholders` liste en direct celles fournies par les modules.

| Variable | Valeur |
| --- | --- |
| `%target%` | Tout ce qui est tapé après le déclencheur (nécessite **Autoriser le ciblage d'une personne** ou la correspondance n'importe où) |
| `%targetuser%` | Mention de la première personne mentionnée dans le message |
| `%targetuser.id%`, `%targetuser.name%`, `%targetuser.avatar%` | L'identifiant, le nom d'utilisateur et l'avatar de cette personne |
| `%targetusers%`, `%targetusers.id%` | Toutes les personnes mentionnées, sous forme de mentions ou d'identifiants |
| `%replied.content%` | Contenu du message auquel le membre a répondu |
| `%replied.author%`, `%replied.author.id%` | Auteur de ce message |
| `%usecount%` | Nombre de fois où ce déclencheur a été déclenché |
| `%regex.1%`, `%regex.name%` | Groupes de capture d'un déclencheur à expression régulière |
| `%img:tag%` | Une image Imgur aléatoire pour ce tag |
| `%rng%` | Un nombre aléatoire issu de l'ensemble général de variables |
| `%xp.level%`, `%xp.rank%`, `%xp.total%`, `%xp.current%`, `%xp.required%`, `%xp.remaining%`, `%xp.bonus%` | Les statistiques d'XP du membre |
| `%targetuser.xp.level%`, `%targetuser.xp.rank%`, `%targetuser.xp.total%` | Les statistiques d'XP de la personne mentionnée |
| `%currency.balance%`, `%currency.bank%`, `%currency.total%`, `%currency.emote%` | La monnaie du membre |
| `%targetuser.currency.balance%`, `%targetuser.currency.bank%` | La monnaie de la personne mentionnée |
| `%rep%`, `%rep.rank%`, `%targetuser.rep%`, `%targetuser.rep.rank%` | Réputation |
| `%messages%`, `%messages.channel%`, `%messages.server%`, `%targetuser.messages%` | Nombre de messages |
| `%invites%`, `%targetuser.invites%`, `%inviter%` | Nombre d'invitations et personne ayant invité le membre |
| `%targetuser.afk%` | Le message AFK de la personne mentionnée |
| `%counter:name%` et variantes | Compteurs, comme ci-dessus |

Les mentions à l'intérieur de `%target%` sont neutralisées, sauf si le membre pourrait lui-même mentionner tout le monde.

> [!EXAMPLE]
> Déclencheur `daily`, réponse `%user.mention% claimed today's bonus. Balance: %currency.balance%`, avec `ctreward 12 100`, `ctcooldown 12 86400 User` et `ctreqmsg 12 Come back tomorrow.`

## Le testeur

`cttest <id> <sample message>` ou la zone **Tester ce déclencheur** sur la carte d'un déclencheur vérifie si ce message lancerait le déclencheur en tant que vous, sans rien envoyer, débiter ni compter. Il indique si le texte correspond et, si le déclencheur ne se lancerait pas, quelle règle le bloque : désactivé, bots uniquement, pas de correspondance, une entrée de permission, une surcharge de permission, expiration, délai de recharge, compteur, nombre d'utilisations, horaires d'activité, âge du compte, appartenance, niveau, solde ou délai de recharge global de la commande.

## Catégories et organisation

`ctcategory <id> <name>` place un déclencheur dans une catégorie. `ctcategorytoggle <name> <true or false>` active ou désactive tous les déclencheurs d'une catégorie d'un coup, et la barre latérale du tableau de bord permet de filtrer par catégorie. `cttoggle` met en pause un seul déclencheur sans le supprimer. `ctstats` indique combien de fois un déclencheur a été déclenché et par qui récemment.

`ctsexport` télécharge tous les déclencheurs sous forme de fichier YAML, et `ctsimport` en charge depuis une pièce jointe ou une URL. `ctsclear` supprime tous les déclencheurs après confirmation.

## Paramètres

Tout se règle par déclencheur. La page Déclencheurs propose un **Mode simple** avec un formulaire **Configuration rapide** (texte du déclencheur plus réponse) et un **Mode avancé** avec **Création avancée de déclencheur**, où vous choisissez le **Type de motif** (Motif de texte normal ou Motif d'expression régulière), les types de déclencheurs, et pouvez tester une expression régulière avant l'enregistrement.

Chaque carte de déclencheur se déplie pour afficher le **Texte du déclencheur**, l'éditeur de **Message de réponse**, le testeur et un accordéon de paramètres regroupés par thème :

| Groupe | Paramètres |
| --- | --- |
| Quand il correspond | Exigence de préfixe, Préfixe personnalisé, Correspondre n'importe où dans le message, Autoriser le ciblage d'une personne, Réservé au propriétaire du bot |
| Comment il répond | Répondre au message, Envoyer la réponse en MP, Supprimer le message déclencheur, Réagir au message à la place, N'envoyer aucun message, Emoji de réaction, Supprimer la réponse après, Réponses supplémentaires, Lorsqu'il y a plusieurs réponses |
| Rôles | Rôles à attribuer, Rôles à retirer, Appliquer ces rôles à |
| Limites | Délai de recharge (secondes), Le délai de recharge s'applique à, Arrêter après ce nombre d'utilisations, Arrêter de se lancer après, Âge minimum du compte (minutes), Ancienneté minimale sur le serveur (minutes), N'être actif qu'à certaines heures avec De, Jusqu'à et Ces jours-ci |
| Coûts et récompenses | Coûte à l'utilisateur, Verse à l'utilisateur, Accorde de l'XP, Niveau requis, Message lorsqu'il ne peut pas l'utiliser |
| Exigence de compteur | Nom du compteur, Au moins, Au plus |
| Déclenchement sur un événement | Se déclenche lorsque, Répond dans |
| Organisation | Catégorie, Puis lancer le déclencheur, Répondre aux bots au lieu des personnes |

La barre latérale liste les catégories, **Compteurs** et la liste **Variables** en direct, et propose une zone de recherche pour les déclencheurs et les réponses.

## Pas à pas

1. Ouvrez **Déclencheurs** dans le tableau de bord. En **Mode simple**, tapez le mot déclencheur et composez la réponse dans l'éditeur, puis créez-le.
2. Dépliez la nouvelle carte. Sous **Quand il correspond**, activez **Correspondre n'importe où dans le message** si le mot doit fonctionner au milieu d'une phrase.
3. Sous **Comment il répond**, choisissez s'il doit répondre, envoyer un MP ou supprimer le message du membre.
4. Sous **Limites**, définissez un délai de recharge pour éviter le spam.
5. Tapez un message d'exemple dans **Tester ce déclencheur** et cliquez sur **Tester**. Corrigez ce qui est signalé comme bloquant.
6. Pour une annonce de montée de niveau, créez un déclencheur avec n'importe quel texte, réglez **Se déclenche lorsque** sur « Le membre monte de niveau », laissez **Répond dans** vide pour publier là où le membre discutait, et utilisez `%user.mention%` et `%xp.level%` dans la réponse.
7. Donnez aux déclencheurs liés une **Catégorie** afin de pouvoir les mettre en pause ensemble.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les identifiants de déclencheurs sont affichés par `listchattriggers`.

| Commande | Alias | Autorisation | Rôle |
| --- | --- | --- | --- |
| `addchattrigger <trigger> <response>` | `act`, `acr` | Administrateur | Créer un déclencheur ; mettez entre guillemets les déclencheurs de plusieurs mots |
| `addchattriggerregex <pattern> <response>` | `actr` | Administrateur | Créer un déclencheur à expression régulière |
| `addreactiontrigger <emoji> <response>` | `addrt` | Administrateur | Créer un déclencheur de réaction |
| `editchattrigger <id> <response>` | `ect` | Administrateur | Remplacer la réponse principale |
| `deletechattrigger <id>` | `dct` | Administrateur | Supprimer un déclencheur |
| `listchattriggers` | `lct` | Administrateur | Lister les déclencheurs avec leurs identifiants |
| `listchattriggersgroup` | `lctg` | Administrateur | Lister les déclencheurs regroupés par texte |
| `showchattrigger <id>` | `sct` | Administrateur | Afficher les paramètres d'un déclencheur |
| `cttoggle <id>` | `chattriggertoggle` | Administrateur | Mettre en pause ou reprendre un déclencheur |
| `ctca <id>` | | Administrateur | Activer ou désactiver la correspondance n'importe où |
| `ctat <id>` | | Administrateur | Activer ou désactiver le ciblage |
| `ctdm <id>` | | Administrateur | Activer ou désactiver la réponse en MP |
| `ctad <id>` | | Administrateur | Activer ou désactiver la suppression du message déclencheur |
| `rtt <id>` | `reactottrigger` | Administrateur | Activer ou désactiver la réaction au message plutôt qu'à la réponse |
| `ctnr <id>` | `chattriggernoresponse` | Administrateur | Activer ou désactiver l'envoi d'aucun message |
| `ctreply <id>` | `chattriggerreply` | Administrateur | Activer ou désactiver la réponse au message |
| `ctdeleteafter <id> <seconds>` | `chattriggerdeleteafter` | Administrateur | Supprimer la réponse après un délai |
| `ctreact <id> [emoji...]` | `ctr` | Administrateur | Définir jusqu'à six réactions, ou les effacer |
| `ctaddresponse <id> <response>` | `chattriggeraddresponse` | Administrateur | Ajouter une réponse supplémentaire |
| `ctclearresponses <id>` | `chattriggerclearresponses` | Administrateur | Supprimer les réponses supplémentaires |
| `ctresponsemode <id> <mode>` | `chattriggerresponsemode` | Administrateur | `Single`, `Random`, `RoundRobin` ou `All` |
| `ctprefixtype <id> <type>` | `chattriggersprefixtype` | Administrateur | `None`, `Global`, `GuildOrGlobal`, `GuildOrNone` ou `Custom` |
| `ctprefix <id> <prefix>` | `chattriggersprefix` | Administrateur | Définir le préfixe personnalisé |
| `chattriggervalidtype <id> <type> <true or false>` | `ctvalidtype`, `ctvt` | Administrateur | Activer ou désactiver un type de déclencheur |
| `ctallowbots <id>` | `chattriggerallowbots` | Administrateur | Activer ou désactiver la réponse uniquement aux messages de bots |
| `ctrgranttoggle <id> @role` | `ctgt`, `ctgranttoggle` | Administrateur | Activer ou désactiver un rôle à attribuer |
| `ctrremovetoggle <id> @role` | `ctrt`, `ctremovetoggle` | Administrateur | Activer ou désactiver un rôle à retirer |
| `chattriggerrolegranttype <id> <type>` | `ctrolegranttype`, `ctrgt` | Administrateur | `Sender`, `Mentioned` ou `Both` |
| `chattriggerscrosspostchannel <id> <#channel>` | `ctcpch`, `ctcpchannel`, `ctcrosspostchannel`, `ctcrosspostch` | Administrateur | Publication croisée dans un salon |
| `chattriggerscrosspostwebhook <id> <url>` | `ctcpwh`, `ctcpwebhook`, `ctcrosspostwebhook`, `ctcrosspostwh` | Administrateur | Publication croisée via un webhook |
| `setctintertype <id> <type>` | `ctitype`, `ctintertype` | Administrateur | `None`, `Slash`, `Message` ou `User` |
| `setctintername <id> <name>` | `ctiname`, `ctrealname` | Administrateur | Nom de la commande d'application |
| `setctinterdesc <id> <description>` | `ctidesc`, `ctinterdesc` | Administrateur | Description de la commande d'application |
| `ctinterephemeral <id> <true or false>` | `ctieph` | Administrateur | Réponse d'interaction éphémère |
| `ctintererrors` | `ctierrors`, `ctie` | Administrateur | Afficher les erreurs d'enregistrement des commandes |
| `ctevent <id> <event>` | `chattriggerevent` | Administrateur | Se déclencher sur un événement, ou `None` pour arrêter |
| `cteventchannel <id> [#channel]` | `chattriggereventchannel` | Administrateur | Salon des réponses aux événements |
| `ctcooldown <id> <seconds> [scope]` | `chattriggercooldown` | Administrateur | Délai de recharge propre au déclencheur |
| `ctreqlevel <id> <level>` | `chattriggerrequiredlevel` | Administrateur | Niveau XP requis |
| `ctcost <id> <amount>` | `chattriggercost` | Administrateur | Coût en monnaie |
| `ctreward <id> <amount>` | `chattriggerreward` | Administrateur | Récompense en monnaie |
| `ctxpreward <id> <amount>` | `chattriggerxpreward` | Administrateur | Récompense en XP |
| `ctreqmsg <id> [message]` | `chattriggerrequirementmessage` | Administrateur | Message affiché lorsqu'une exigence n'est pas remplie |
| `cttime <id> <start> <end> [days...]` | `chattriggertime` | Administrateur | Horaires d'activité, ou `cttime <id> clear` |
| `ctexpiry <id> [duration]` | `chattriggerexpiry` | Administrateur | Expiration, ou aucune pour l'effacer |
| `ctmaxuses <id> <uses>` | `chattriggermaxuses` | Administrateur | Limite d'utilisations, 0 pour aucune |
| `ctminage <id> [duration]` | `chattriggerminimumage` | Administrateur | Âge minimum du compte |
| `ctminmember <id> [duration]` | `chattriggerminimummembership` | Administrateur | Ancienneté minimale sur le serveur |
| `ctrequirecounter <id> <name> [min] [max]` | `chattriggerrequirecounter` | Administrateur | Exigence de plage de compteur |
| `ctcounters` | `chattriggercounters` | Personne | Lister les compteurs |
| `ctcounterset <name> <value>` | `chattriggercounterset` | Administrateur | Définir un compteur |
| `ctcounterdelete <name>` | `chattriggercounterdelete` | Administrateur | Supprimer un compteur |
| `ctplaceholders` | `chattriggerplaceholders` | Personne | Lister les variables fournies par les modules |
| `ctcategory <id> [name]` | `chattriggercategory` | Administrateur | Définir ou effacer une catégorie |
| `ctcategorytoggle <name> <true or false>` | `chattriggercategorytoggle` | Administrateur | Activer ou désactiver une catégorie |
| `ctchain <id> <nextId>` | `chattriggerchain` | Administrateur | Enchaîner vers un autre déclencheur, 0 pour effacer |
| `cttest <id> <sample>` | `chattriggertest` | Administrateur | Simuler un message d'exemple |
| `ctstats <id>` | `chattriggerstats` | Administrateur | Nombre de déclenchements et utilisateurs récents |
| `ctsexport` | | Administrateur | Exporter les déclencheurs en YAML |
| `ctsimport [url]` | | Administrateur | Importer depuis une URL ou une pièce jointe |
| `ctsmigrate` | `ctsconvert` | Administrateur | Convertir l'ancien format d'embed, avec une sauvegarde |
| `ctsclear` | | Administrateur | Supprimer tous les déclencheurs |
| `ctsreload` | | Propriétaire du bot | Recharger les déclencheurs depuis la base de données |

## Astuces et pièges

- Les déclencheurs sont comparés au message en minuscules ; le texte du déclencheur est donc effectivement insensible à la casse.
- Un déclencheur dont **Correspondre n'importe où** est désactivé doit correspondre à tout le message. `hello there` ne déclenchera pas un déclencheur `hello` sauf si vous activez l'option ou le ciblage.
- Les attributions de rôles nécessitent la permission Gérer les rôles, et le rôle du bot doit être au-dessus des rôles concernés. La commande qui ajoute un rôle à la liste vérifie aussi que vous pouvez gérer ce rôle.
- Les déclencheurs réservés aux bots ne répondent jamais aux humains, et les déclencheurs pour humains ne répondent jamais aux bots ; un même déclencheur ne peut pas faire les deux.
- Les délais de recharge sont stockés en mémoire et sont réinitialisés au redémarrage du bot. Les limites d'utilisation et les expirations sont enregistrées et survivent aux redémarrages.
- L'ordre du tour de rôle est partagé par tous les membres du serveur, il n'est pas suivi par membre.
- Les entrées de permission du module `ActualChatTriggers` et tout `permoverride` pour le texte du déclencheur sont vérifiés avant les conditions propres au déclencheur.
- Les déclencheurs d'interaction enregistrent de vraies commandes d'application ; les limites de Discord sur le nombre et les noms de commandes s'appliquent. Vérifiez `ctintererrors` lorsqu'une commande n'apparaît pas.
- Les réactions sur la réponse sont espacées d'une par seconde ; six emoji prennent donc six secondes pour apparaître.
- Les déclencheurs d'événement pour les arrivées, départs, vocaux et boosts ne font rien tant que vous n'avez pas défini **Répond dans**.

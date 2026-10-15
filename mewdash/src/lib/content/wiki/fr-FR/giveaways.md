---
title: Concours
slug: giveaways
summary: Organisez des concours chronométrés auxquels les membres participent par réaction, bouton ou captcha web, avec des conditions de rôle et de nombre de messages, tirage aléatoire des gagnants, relances et MP aux gagnants.
icon: fa-gift
category: Entertainment
dashboard: /dashboard/giveaways
module: Giveaways
tags: [giveaway, gstart, prize, raffle, winner, reroll, contest, entry, captcha, concours, tirage au sort, lot, gagnant, relance, participation]
related: [embedbuilder, chat-triggers, xp]
---

## Ce que ça fait

Le staff lance un concours en indiquant un lot, un salon, un nombre de gagnants et une durée. Le bot publie un embed dans ce salon indiquant le lot, l'organisateur, la date de fin et les conditions éventuelles. Les membres participent en réagissant avec l'émoji de concours du serveur, en appuyant sur un bouton **Participer**, ou en résolvant un captcha sur le tableau de bord, selon la manière dont le concours a été lancé.

Lorsque le minuteur arrive à zéro, le bot tire au sort les gagnants parmi toutes les personnes qui ont participé et remplissent toujours les conditions. Il modifie le message d'origine pour afficher les gagnants, publie un message de félicitations dans le salon et, si cette option est activée, envoie un MP à chaque gagnant avec un lien vers le concours. Le staff peut terminer un concours plus tôt, ou le relancer une fois terminé.

Les conditions sont vérifiées à la fin, et non lors de la participation. Une personne qui a réagi mais a perdu entre-temps un rôle requis est ignorée lors du choix des gagnants.

## Pourquoi l'utiliser

- Offrir des clés de jeu, du Nitro ou du merch aux membres actifs sans choisir les noms à la main.
- Récompenser les personnes qui discutent réellement, en exigeant un nombre minimum de messages.
- Réserver un lot aux boosters ou à un rôle de soutien en exigeant ces rôles.
- Empêcher les comptes alternatifs et les bots de gonfler les participations grâce à une participation par captcha.

## Modes de participation

Chaque concours utilise exactement l'un de ces modes. L'assistant interactif `gstart` demande lequel, la commande slash propose les options `use_button` et `use_captcha`, et le tableau de bord propose un choix **Mode de participation**.

| Mode | Comment les membres participent | Remarques |
| --- | --- | --- |
| Réaction | Réagir avec l'émoji de concours du serveur | Par défaut. Le bot lit la liste des réactions à la fin du concours, jusqu'à 1000 utilisateurs. |
| Bouton | Appuyer sur le bouton **Participer** sous l'embed | Les participations sont enregistrées par le bot. Participer deux fois, après la fin, ou sans être sur le serveur est refusé. |
| Captcha | Appuyer sur **Participer (Captcha web)**, se connecter au tableau de bord et réussir la vérification Cloudflare Turnstile | Même stockage que la participation par bouton. La participation est attribuée au compte Discord connecté. |

L'émoji de concours est défini par serveur avec `gemote`. Le bot le valide en réagissant avec lui ; un émoji personnalisé provenant d'un autre serveur ne fonctionne donc que si le bot est aussi présent sur ce serveur. Les concours par réaction nécessitent aussi les permissions du bot Ajouter des réactions et Utiliser des émojis externes, et `gstart` refuse de démarrer sans elles.

## Conditions

| Condition | Définie par | Effet au moment du tirage |
| --- | --- | --- |
| Rôles requis | Assistant, `required_roles` en slash, **Rôles requis** sur le tableau de bord | Le membre doit posséder tous les rôles listés |
| Nombre de messages | Assistant, `required_messages` en slash, **Nombre de messages requis** sur le tableau de bord | Le nombre de messages comptés du membre sur ce serveur doit être au moins égal à ce nombre. Utilise le service de comptage des messages, qui ne connaît que les messages comptés depuis son activation. |

Les bots sont toujours exclus, de même que quiconque a quitté le serveur. Les conditions sont listées dans l'embed du concours sous forme d'une ligne **Rôles requis** et d'une ligne « N Messages Required ».

## Le message du concours

Le titre de l'embed est le lot. La description indique « React with (emote) to enter! », nomme l'organisateur et affiche la date de fin sous forme d'horodatage Discord relatif et absolu. Le pied de page affiche le nombre de gagnants, le nom du serveur et la date de fin. Le contenu du message est la mention du rôle à notifier, si l'un est défini.

Paramètres d'apparence à l'échelle du serveur :

| Paramètre | Commande | Effet |
| --- | --- | --- |
| Couleur de l'embed | `gembedcolor` | Couleur de l'embed du concours, sous forme de nom de couleur ou de `#hex` |
| Bannière | `gbanner` | Image affichée sur chaque concours. L'assistant et la commande slash peuvent la remplacer pour chaque concours avec une URL ou une pièce jointe. |
| Rôle à notifier | aucun, remplacement uniquement dans l'assistant | L'assistant propose de notifier un rôle ; si un rôle de notification est enregistré pour le serveur, il demande s'il faut le remplacer |
| MP aux gagnants | `gdm` | Indique si les gagnants reçoivent un MP. Activé par défaut. |

### À la fin

Si suffisamment de participants éligibles existent, le bot modifie l'embed pour afficher « Winner: @user » avec l'organisateur, définit le pied de page sur « Ended at (time) », remplace le contenu par « **Giveaway Ended!** », et publie un message de félicitations distinct qui relie le concours et affiche la commande de relance. Si personne n'a participé, ou si moins de personnes éligibles ont participé qu'il n'y a de gagnants, l'embed est remplacé par « There were not enough participants! » et le concours est marqué comme terminé. Si des personnes ont participé mais qu'aucune ne remplit les conditions, le message l'indique.

Un concours à gagnant unique déclenche aussi l'événement `GiveawayWon` pour les déclencheurs de chat, afin qu'un déclencheur puisse réagir à une victoire.

### MP au gagnant

Lorsque **MP aux gagnants** est activé, chaque gagnant reçoit un MP. Par défaut, il s'agit d'un embed annonçant la victoire, avec un lien vers le message du concours. Si un message de fin personnalisé est enregistré, il est envoyé à la place et peut utiliser ces variables en plus des variables générales de serveur, d'utilisateur et de salon.

| Variable | Valeur |
| --- | --- |
| `%messagelink%` | Lien vers le message du concours |
| `%giveawayitem%` | Le lot |
| `%giveawaywinners%` | Le nombre de gagnants |

`gdmmessage` sans texte propose un aperçu du message enregistré avec des valeurs d'exemple ; refuser l'aperçu l'efface. L'exécuter avec du texte efface également le message enregistré au lieu de l'enregistrer.

## Paramètres

La page **Concours** du tableau de bord comporte trois onglets : **Concours actifs**, **Créer un concours** et **Concours terminés**. Les paramètres à l'échelle du serveur ci-dessus (émoji, couleur, bannière, interrupteur MP) ne sont disponibles que par commande.

Le formulaire **Créer un concours** :

| Paramètre | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Lot du concours | vide | Le lot, affiché comme titre de l'embed |
| Nombre de gagnants | 1 | Combien de gagnants tirer ; doit être au moins 1 |
| Salon | aucun | Où l'embed est publié |
| Durée | 24 heures | Quand le concours se termine |
| Rôles requis | aucun | Rôles qu'un membre doit posséder pour gagner |
| Nombre de messages requis | 0 | Nombre minimum de messages comptés |
| Émoji de réaction | le cornet de fête | Émoji pour la participation par réaction ; un émoji personnalisé ou un code d'émoji collé fonctionne |
| Mode de participation | Réaction | Réaction, Bouton ou Captcha |

**Concours actifs** liste chaque concours avec sa date de fin. Le développer affiche les gagnants, le salon, les rôles requis, la condition de messages et le mode de participation, ainsi qu'un bouton **Terminer le concours**. Les relances ne sont disponibles que par commande.

## Guide de configuration

1. Exécutez `gemote` avec l'émoji avec lequel vous voulez que les membres réagissent, par exemple `gemote :tada:`.
2. Vous pouvez éventuellement définir `gembedcolor` et `gbanner` pour que les concours correspondent à l'apparence de votre serveur.
3. Ouvrez **Concours** dans le tableau de bord, puis **Créer un concours**.
4. Remplissez **Lot du concours**, **Nombre de gagnants**, **Salon** et **Durée**.
5. Ajoutez **Rôles requis** ou un **Nombre de messages requis** si le lot doit revenir à des membres établis.
6. Choisissez un **Mode de participation** et cliquez sur **Créer un concours**.
7. Une fois terminé, vérifiez le salon. Si la mauvaise personne a gagné ou ne répond pas, exécutez `greroll <message id>`.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les mêmes commandes existent sous forme de commandes slash sous `/giveaways`.

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `gstart [#channel <time> <winners> <prize>]` | `giveawaystart` | Gérer les messages | Démarrer un concours. Sans argument, lance un assistant qui demande aussi l'organisateur, la condition de messages, la bannière, le rôle à notifier, le mode de participation et les rôles requis. La durée s'écrit comme `2d3h`. |
| `gend <message id>` | `giveawayend` | Gérer les messages | Terminer un concours immédiatement et tirer les gagnants |
| `greroll <message id>` | `giveawayreroll`, `reroll` | Gérer les messages | Tirer à nouveau parmi les participants d'un concours terminé |
| `glist` | `giveaways`, `giveawaylist` | Gérer les messages | Lister les concours actifs avec les identifiants de message, les lots, le nombre de gagnants et les liens |
| `gstats` | `giveawaystats` | Personne | Totaux des concours actifs et terminés, organisateurs et nombre par salon |
| `gemote <emote>` | `giveawayemote` | Gérer les messages | Définir l'émoji de participation par réaction |
| `gembedcolor <colour>` | `giveawayembedcolor` | Gérer les messages | Définir la couleur de l'embed du concours |
| `gwinembedcolor <colour>` | `giveawaywinembedcolor` | Gérer les messages | Définit la même valeur de couleur que `gembedcolor` |
| `gbanner <url>` | `giveawaybanner` | Gérer les messages | Définir l'image de bannière par défaut |
| `gdm` | `giveawaydm` | Gérer les messages | Activer ou désactiver les MP aux gagnants |
| `gdmmessage [text]` | `gdmmsg` | Gérer les messages | Prévisualiser ou effacer le MP personnalisé aux gagnants |

## Astuces et pièges

- L'identifiant de message pour `gend` et `greroll` est celui de l'embed du concours. Copiez-le avec le mode développeur, ou lisez-le depuis `glist`.
- La relance tire de nouveau parmi les participants avec les mêmes conditions ; le gagnant précédent peut donc gagner à nouveau.
- Après un redémarrage, le bot planifie immédiatement les concours qui se terminent dans les 24 prochaines heures ; ceux qui se terminent plus tard sont pris en charge par une vérification horaire, si bien qu'un concours de longue durée se termine tout de même à l'heure.
- Si le bot ne peut pas lire les réactions d'un concours par réaction, il revient à l'émoji actuel du serveur ; mais si l'émoji a été changé pour un qui personne n'a utilisé, le tirage ne trouve aucun participant.
- La liste **Concours actifs** du tableau de bord affiche aussi les concours terminés, et l'onglet **Concours terminés** est actuellement vide. Utilisez la date de fin et l'absence du bouton **Terminer le concours** pour les distinguer.
- La participation par captcha nécessite que le tableau de bord soit accessible et que le membre se connecte avec Discord ; la participation est liée à ce compte, et non à quoi que ce soit saisi sur la page.
- Les MP aux gagnants échouent silencieusement si le gagnant a fermé ses MP. L'annonce dans le salon est tout de même envoyée.

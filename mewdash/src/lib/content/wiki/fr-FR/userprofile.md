---
title: Profil utilisateur
slug: userprofile
summary: Donnez à chaque membre une carte de profil que le bot peut afficher partout, avec une bio, des pronoms, un signe astrologique, une date d'anniversaire, une couleur, une image et un code ami Switch, ainsi que des contrôles de confidentialité sur ce que les autres voient.
icon: fa-user
category: Community
module: UserProfile
tags: [profile, bio, pronouns, pronoundb, zodiac, birthday, privacy, profile colour, profile image, switch friend code, stats opt out, greet dm opt out, profil, biographie, pronoms, signe astrologique, anniversaire, confidentialité, couleur du profil, image de profil, code ami switch, désinscription aux statistiques, désinscription aux MP de bienvenue]
related: [birthday, switch, afk, help]
---

## Ce que ça fait

Chaque membre possède un profil qui le suit sur tous les serveurs où se trouve le bot. La commande `profile` publie ce profil sous forme d'embed : l'avatar du membre en vignette, sa bio en description, puis des champs pour les pronoms, le signe astrologique, la date d'anniversaire, le nombre de serveurs partagés avec le bot, et son code ami Nintendo Switch s'il en a défini un. Une couleur personnalisée et une grande image en bas complètent l'ensemble.

Les membres remplissent leur profil avec quelques commandes `set...`, ou depuis la page **Mes paramètres** du tableau de bord. Rien n'est propre à un serveur : définissez votre bio une seule fois, elle s'affichera partout de la même manière.

La confidentialité reste sous le contrôle du membre. Un profil peut être rendu privé afin que seul son propriétaire puisse l'ouvrir, la date d'anniversaire peut être réduite au seul mois ou totalement masquée, et les membres peuvent refuser la collecte de statistiques de commandes et les MP de bienvenue.

Les pronoms sont un cas particulier. Si un membre n'en a défini aucun avec le bot, celui-ci les recherche sur PronounDB. Les membres peuvent remplacer cela par leur propre texte, et quiconque peut signaler au propriétaire du bot une valeur de remplacement abusive.

## Pourquoi l'utiliser

- Les membres veulent une petite carte « à propos de moi » sans avoir besoin d'un salon de présentations dédié.
- Une communauté qui partage des codes amis Switch peut les regrouper au même endroit plutôt que de les épingler dans des messages.
- Les pronoms peuvent s'afficher automatiquement depuis PronounDB, si bien que la plupart des gens n'ont jamais à les taper.
- Le staff peut vérifier les pronoms de quelqu'un avec `pronouns @user` avant de répondre.
- Les membres qui ne veulent pas de MP de bienvenue ou de collecte de statistiques peuvent le désactiver eux-mêmes.

## L'embed de profil

`profile` sans argument affiche votre propre profil. `profile @user` affiche celui d'une autre personne, sauf si elle l'a rendu privé ; dans ce cas, le bot répond que le profil est privé.

| Partie de l'embed | D'où elle provient |
| --- | --- |
| Titre | « Profile for » suivi de l'utilisateur |
| Couleur | `setprofilecolor`, sinon la couleur par défaut du bot |
| Vignette | L'avatar Discord du membre |
| Description | La bio définie avec `setbio` (affichée seulement si elle existe) |
| Pronouns | Votre remplacement, sinon PronounDB, sinon « Unspecified » |
| Zodiac Sign | `setzodiac`, sinon « Unspecified » |
| Birthday | `setbirthday`, affichée selon le mode de confidentialité de l'anniversaire, sinon « Unspecified » |
| Mutual Bot Servers | Nombre de serveurs que vous partagez avec le bot |
| Switch Friend Code | Affiché seulement s'il est défini |
| Image | L'URL définie avec `setprofileimage` |

## Champs du profil

### Bio

`setbio <text>` accepte jusqu'à 2048 caractères. Un texte plus long est refusé. Il n'existe pas de commande pour l'effacer ; pour la supprimer, définissez une bio courte, par exemple un simple point.

### Signe astrologique

`setzodiac <sign>` accepte l'un des douze signes occidentaux : Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces. La casse n'a pas d'importance. Tout autre texte est refusé.

### Couleur et image

`setprofilecolor <colour>` accepte une couleur dans n'importe quel format compris par l'analyseur de couleurs du bot, par exemple une valeur hexadécimale. `setprofileimage <url>` nécessite un lien direct vers un fichier image ; le bot vérifie que l'URL ressemble à une image avant de l'enregistrer et vous la montre en retour.

### Anniversaire

`setbirthday <date>` enregistre une date. Les annonces du module Anniversaire utilisent la même valeur : la définir ici la définit aussi là-bas. Son affichage sur le profil dépend de `setbirthdayprivacy <mode>` :

| Mode | Ce qu'affiche le profil |
| --- | --- |
| `Default` | La date complète |
| `MonthOnly` | Uniquement le nom du mois |
| `YearOnly` | Uniquement l'année |
| `MonthAndDate` | Mois et jour, sans l'année |
| `Disabled` | « Private » |

### Code ami Switch

`setswitchfc <code>` doit respecter le format `SW-XXXX-XXXX-XXXX` (quatre chiffres dans chaque groupe ; le `SW` n'est pas sensible à la casse). Exécutez-la sans code pour le retirer de votre profil. Le module Nintendo Switch n'a aucun rapport avec ce champ ; le code sert uniquement à l'affichage.

### Confidentialité

`setprivacy public` ou `setprivacy private`. Les profils privés ne sont visibles que par leur propriétaire. Par défaut, le profil est public.

## Pronoms

`pronouns [@user]` affiche les pronoms de vous-même ou d'une autre personne. Ordre de recherche :

1. Le texte défini par le membre avec `setpronouns`.
2. L'ensemble de pronoms anglais du membre sur PronounDB, s'il a lié son compte Discord sur ce site. Les ensembles standard s'affichent sous leur forme habituelle, par exemple `he/him`, `Any pronouns` ou `Ask me my pronouns`.
3. « Unspecified ».

`setpronouns <text>` enregistre un remplacement. Exécutée sans texte, la commande affiche votre remplacement actuel avec deux boutons : **Overwrite** ouvre un formulaire pour saisir de nouveaux pronoms, et **Effacer** supprime le remplacement pour utiliser de nouveau PronounDB.

Lorsque les pronoms affichés proviennent du remplacement d'un membre (et non de PronounDB), la réponse comporte un bouton **Report**. Les signalements sont envoyés dans un salon géré par les propriétaires du bot, qui peuvent effacer le remplacement, désactiver les pronoms de cet utilisateur ou le mettre sur liste noire. Un utilisateur dont les pronoms ont été désactivés voit la raison chaque fois qu'il tente d'utiliser les commandes de pronoms.

> [!NOTE]
> La commande réservée au propriétaire du bot `pronounsforceclear` sert à traiter ces signalements. Le staff du serveur ne peut pas effacer les pronoms d'un autre membre.

## Désinscriptions

- `greetdmoptout` active ou désactive la réception, par les serveurs utilisant les messages de bienvenue en MP du bot, de ces MP. Cela ne concerne que les messages de bienvenue envoyés par ce bot.
- `userstatsoptout` active ou désactive la collecte des statistiques de commandes pour votre compte. Le contenu des messages n'est jamais collecté.
- `deleteuserstatsdata` supprime les statistiques de commandes déjà stockées pour vous, après confirmation. Elle peut être exécutée une fois par heure.

## Paramètres

Il n'existe aucune configuration côté serveur. Tout se trouve sur le membre. La page **Mes paramètres** du tableau de bord (`/me`) contient une section **Profil** avec un bouton **Modifier** et une section de confidentialité avec des interrupteurs.

| Paramètre | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Bio | vide | La description de votre profil |
| Pronouns | vide (PronounDB est utilisé) | Votre remplacement de pronoms |
| Zodiac | aucun | Signe astrologique affiché sur le profil |
| Birthday | aucun | La date affichée sur le profil et utilisée pour les annonces d'anniversaire |
| Timezone | UTC | Fuseau horaire utilisé par le module Anniversaire pour votre annonce |
| Switch Friend Code | vide | Champ du code ami sur le profil |
| Profile Color | couleur par défaut du bot | Couleur de l'embed |
| Profile image | aucune | Image en bas de l'embed |
| Profile privacy | Public | Indique si d'autres peuvent ouvrir votre profil |
| Birthday display mode | Default | Quelles parties de la date d'anniversaire sont affichées |
| Block Welcome DMs | désactivé | Identique à `greetdmoptout` |
| Block Message Tracking | désactivé | Identique à `userstatsoptout` |
| Birthday Announcements | désactivé | Indique si le module Anniversaire annonce votre anniversaire |

La même page comporte aussi un interrupteur qui désactive la récupération des pronoms pour votre compte.

## Pas à pas

1. Exécutez `setbio Hi, I run the art channel.` pour ajouter une description.
2. Exécutez `setpronouns she/her`, ou passez cette étape si votre compte PronounDB est déjà lié à Discord.
3. Exécutez `setbirthday 1998-04-12` puis `setbirthdayprivacy MonthAndDate` si vous ne voulez pas que l'année soit affichée.
4. Exécutez `setprofilecolor #ff66aa` et `setprofileimage https://example.com/banner.png` pour styliser l'embed.
5. Ajoutez `setswitchfc SW-1234-5678-9012` si vous voulez être trouvé sur Switch.
6. Exécutez `profile` pour vérifier le résultat. Si vous préférez que personne d'autre ne le voie, exécutez `setprivacy private`.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Des versions slash existent pour la plupart d'entre elles, sous des noms tels que `/profile`, `/setbio`, `/setcolor`, `/setbirthday`, `/setbirthdayprivacy`, `/setswitchfriendcode`, `/setprofileimage`, `/setprivacy`, `/setzodiac`, `/pronouns`, `/setpronouns`, `/statsoptout` et `/deletestatsdata`.

| Commande | Alias | Autorisation | Rôle |
| --- | --- | --- | --- |
| `profile [@user]` | `userprofile` | Personne | Afficher votre profil ou celui d'une autre personne |
| `setbio <text>` | | Personne | Définir votre bio, jusqu'à 2048 caractères |
| `setpronouns [text]` | `pronounsset` | Personne | Définir un remplacement de pronoms, ou le consulter avec les boutons effacer et écraser |
| `pronouns [@user]` | `getpronouns` | Personne | Afficher les pronoms, avec un bouton de signalement pour les remplacements |
| `setzodiac <sign>` | | Personne | Définir votre signe astrologique |
| `setprofilecolor <colour>` | | Personne | Définir la couleur de l'embed |
| `setprofileimage <url>` | | Personne | Définir l'image affichée sur le profil |
| `setbirthday <date>` | | Personne | Définir votre date d'anniversaire |
| `setbirthdayprivacy <mode>` | | Personne | `Default`, `MonthOnly`, `YearOnly`, `MonthAndDate` ou `Disabled` |
| `setprivacy <Public|Private>` | `profilepricvacy` | Personne | Rendre le profil public ou privé |
| `setswitchfc [code]` | `setfc`, `setswitchfriendcode`, `setfriendcode` | Personne | Définir ou effacer votre code ami Switch |
| `greetdmoptout` | `gdmoptout` | Personne | Activer ou désactiver la réception des MP de bienvenue de ce bot |
| `userstatsoptout` | `ustatsoptout` | Personne | Activer ou désactiver la collecte des statistiques de commandes |
| `deleteuserstatsdata` | `deluserstatsdata` | Personne | Supprimer vos statistiques de commandes stockées (une fois par heure) |
| `pronounsforceclear <@user or id> <true|false> <reason>` | `pnfc` | Propriétaire du bot | Effacer les pronoms d'un membre et, éventuellement, les désactiver |

## Astuces et pièges

- Le profil est global. Le modifier sur un serveur le modifie partout.
- `setbirthday` lit la date avec l'analyseur de dates du bot ; un format non ambigu comme `1998-04-12` est le plus sûr.
- Si l'URL de l'image de profil ne fonctionne plus, l'embed est toujours envoyé, mais Discord n'affiche aucune image. Définissez une nouvelle URL pour corriger cela.
- Les recherches PronounDB nécessitent que le membre ait lié son compte Discord sur pronoundb.org. Sans cela, le profil indique « Unspecified » tant que la personne n'a pas exécuté `setpronouns`.
- Les profils privés répondent toujours à `profile @user`, mais avec une erreur indiquant qu'ils sont privés, afin que les gens sachent qu'ils existent.
- `deleteuserstatsdata` ne supprime que les statistiques de commandes. Les champs du profil sont effacés en les écrasant.

---
title: Anniversaires
slug: birthday
summary: Les membres indiquent une date d'anniversaire sur leur profil et y consentent, et le bot l'annonce dans un salon, éventuellement avec un rôle d'anniversaire temporaire et une mention de rôle.
icon: fa-birthday-cake
category: Community
dashboard: /dashboard/birthday
module: Birthday
tags: [birthday, birthdays, bday, celebrate, birthday role, announcement, timezone, age, profile, anniversaire, anniversaires, fête, rôle d'anniversaire, annonce, fuseau horaire, âge, profil]
related: [utility, administration]
---

## Ce que ça fait

Un membre indique sa date d'anniversaire une seule fois avec `setbirthday`, puis exécute `birthdayannouncements` sur tout serveur où la fonctionnalité est activée. Chaque jour, le bot vérifie qui a son anniversaire, publie un message dans le salon d'annonces et peut attribuer un rôle d'anniversaire pendant 24 heures. Si un rôle à notifier est défini, il est mentionné avant le message.

Les anniversaires sont stockés dans le profil bot du membre, et non par serveur ; un seul `setbirthday` couvre donc chaque serveur que le membre partage avec le bot. Qu'un anniversaire soit annoncé sur un serveur donné dépend de trois éléments : le membre a donné son consentement, son profil n'est pas privé, et son mode d'affichage de l'anniversaire n'est pas désactivé.

Chacun peut voir qui fête son anniversaire avec `birthdaytoday`, et qui approche avec `birthdaylist`. L'âge est affiché à côté du nom, sauf si le membre a choisi un mode d'affichage qui masque l'année.

Le staff configure le salon, les rôles et le message depuis la page **Anniversaires** du tableau de bord ou avec les commandes `birthday*`.

## Pourquoi l'utiliser

- Les communautés qui souhaitent une publication quotidienne de « joyeux anniversaire » sans que personne ne suive les dates à la main.
- Offrir aux membres un rôle d'anniversaire coloré pour la journée afin qu'ils se démarquent dans le chat.
- Notifier un rôle « escouade d'anniversaire » pour que les gens voient vraiment l'annonce.
- Permettre aux membres de choisir la part de leur anniversaire rendue publique, jusqu'à le masquer entièrement.

## Qui est annoncé

Un membre est inclus dans les annonces et les listes uniquement lorsque toutes ces conditions sont réunies :

| Condition | Comment le membre la contrôle |
| --- | --- |
| Un anniversaire est défini | `setbirthday <date>` |
| Consentement aux annonces | `birthdayannouncements` l'active ou le désactive ; désactivé par défaut |
| Le profil n'est pas privé | `setprivacy public` sur le profil |
| Le mode d'affichage n'est pas Désactivé | `setbirthdayprivacy <mode>` |

La vérification porte sur les membres actuellement présents sur le serveur ; une personne qui le quitte n'est donc pas annoncée.

### Modes d'affichage de l'anniversaire

`setbirthdayprivacy` accepte l'une de ces valeurs. Elle affecte ce qui est affiché dans les listes, sur le profil et dans `birthdaytoday`.

| Mode | Effet |
| --- | --- |
| `Default` | Date complète affichée, l'âge est affiché dans les listes |
| `MonthOnly` | Mois uniquement, âge masqué |
| `YearOnly` | Année uniquement, âge toujours affiché |
| `MonthAndDate` | Mois et jour, âge masqué |
| `Disabled` | Anniversaire masqué et jamais annoncé |

## Fonctionnement de la vérification quotidienne

Le service s'exécute une fois par heure et compare le mois et le jour d'anniversaire de chaque membre avec la date du jour en UTC. La première heure d'un nouveau jour UTC qui trouve des anniversaires les publie, et le serveur est marqué comme traité pour ce jour afin que rien ne soit publié deux fois.

Les annonces n'ont lieu que lorsque la fonctionnalité **Annonces** est activée et qu'un salon est défini. Définir un salon avec `birthdaychannel` ou sur le tableau de bord active la fonctionnalité pour vous.

Les fuseaux horaires sont enregistrés mais ne sont pas encore utilisés par la vérification quotidienne. `birthdaytimezone` et le paramètre **Fuseau horaire du serveur** sont acceptés et affichés dans l'embed de configuration, mais les annonces sont envoyées selon le jour UTC.

## Le rôle d'anniversaire

Lorsque **Rôle d'anniversaire** est activé et qu'un rôle est défini, chaque membre annoncé reçoit le rôle au moment de l'annonce, et il est retiré 24 heures plus tard. Le minuteur de retrait est conservé en mémoire ; si le bot redémarre dans la journée, le rôle reste donc jusqu'à ce que quelqu'un le retire.

Le bot a besoin de la permission Gérer les rôles, et son rôle le plus élevé doit être placé au-dessus du rôle d'anniversaire.

## Le message d'annonce

Le message par défaut est `Happy Birthday %user.mention%!` entouré d'émojis de fête. Remplacez-le avec `birthdaymessage` ou avec l'éditeur **Message d'anniversaire** du tableau de bord. Le texte passe par l'analyseur d'embeds ; tout ce que produit l'éditeur d'embeds fonctionne donc, et la mention du rôle à notifier est ajoutée au début si elle est activée.

### Variables

Le message prend en charge les variables standard d'utilisateur, de serveur, de salon et de bot de la page des variables, ainsi qu'une valeur propre aux anniversaires.

| Variable | Valeur |
| --- | --- |
| `%user.mention%` | Mentionne le membre qui fête son anniversaire |
| `%user.name%` | Son nom d'utilisateur |
| `%user.avatar%` | L'URL de son avatar |
| `%server.name%` | Le nom du serveur |
| `%birthday.age%` | L'âge qu'il atteint, ou `Unknown` |

> [!WARNING]
> Utilisez `%user.mention%`, et non `{user}`. L'aide de la commande texte mentionne `{user}`, mais seule la forme `%...%` est remplacée dans l'annonce publiée.

## Paramètres

Tout se trouve sur la page **Anniversaires**, répartie en trois onglets : **Configuration**, **Utilisateurs** et **Statistiques**.

**Configuration** contient les paramètres de base, l'éditeur de message et un panneau **Fonctionnalités d'anniversaire** avec un interrupteur par fonctionnalité.

| Paramètre | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Salon | aucun | Où les annonces sont publiées |
| Rôle d'anniversaire | aucun | Rôle attribué pendant 24 heures le jour de l'anniversaire |
| Rôle à notifier | aucun | Rôle mentionné avant chaque annonce |
| Fuseau horaire du serveur | UTC | Enregistré pour le serveur, affiché dans l'embed de configuration |
| Jours de rappel avant l'anniversaire | 0 | De 0 à 30 ; enregistré, aucun rappel n'est encore envoyé |
| Message d'anniversaire | embed par défaut | L'annonce, avec les variables ci-dessus |

| Interrupteur de fonctionnalité | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Annonces | désactivé | Publie le message quotidien dans le salon |
| Rôle d'anniversaire | désactivé | Attribue le rôle temporaire |
| Rappels | désactivé | Interrupteur réservé ; rien n'est encore envoyé |
| Rôle à notifier | désactivé | Mentionne le rôle à notifier avec les annonces |
| Prise en charge des fuseaux horaires | désactivé | Interrupteur réservé ; la vérification s'exécute toujours en UTC |

**Utilisateurs** affiche les **Anniversaires à venir** pour les 7, 14 ou 30 prochains jours et une liste **Tous les utilisateurs** de chaque membre ayant un anniversaire enregistré, les anniversaires du jour étant mis en évidence en haut de la page. **Statistiques** affiche **Nombre total d'utilisateurs**, **Anniversaires enregistrés**, **Anniversaires publics** et **Anniversaires du jour**.

> [!NOTE]
> Enregistrer le formulaire du tableau de bord n'écrit que les valeurs que vous avez remplies. Pour effacer un rôle ou le salon, utilisez `birthdayrole` ou `birthdaypingrole` sans rôle, ou réinitialisez tout avec `/birthday config reset`.

## Guide de configuration

1. Ouvrez **Anniversaires** dans le tableau de bord.
2. Sous **Configuration**, choisissez le **Salon** des annonces et cliquez sur **Enregistrer la configuration**.
3. Activez **Annonces** dans le panneau **Fonctionnalités d'anniversaire**.
4. Vous pouvez éventuellement choisir un **Rôle d'anniversaire** et activer **Rôle d'anniversaire**, ainsi qu'un **Rôle à notifier** avec **Rôle à notifier** activé.
5. Vous pouvez éventuellement rédiger votre propre **Message d'anniversaire** en utilisant `%user.mention%` et `%birthday.age%`.
6. Demandez aux membres d'exécuter `setbirthday`, puis `birthdayannouncements` pour donner leur consentement.
7. Vérifiez l'onglet **Utilisateurs** pour confirmer qu'ils apparaissent sous **Anniversaires à venir**.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les versions slash se trouvent sous `/birthday` et `/birthday config`.

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `setbirthday <date>` | | Personne | Définir votre anniversaire sur votre profil, par exemple `setbirthday 1998-04-12` |
| `setbirthdayprivacy <mode>` | | Personne | Choisir l'un des modes d'affichage ci-dessus |
| `birthdayannouncements` | `bdayann` | Personne | Consentir ou refuser d'être annoncé |
| `birthdaytimezone <zone>` | `bdaytz` | Personne | Enregistrer votre fuseau horaire, par exemple `Europe/London` |
| `birthdaytoday` | `todaysbirthdays` | Personne | Lister qui fête son anniversaire aujourd'hui |
| `birthdaylist [days]` | `bdaylist`, `upcomingbirthdays` | Personne | Anniversaires à venir, de 1 à 30 jours, 7 par défaut |
| `birthdaychannel [#channel]` | `bdaychannel`, `bdaychan` | Administrateur | Définir le salon des annonces et activer les annonces |
| `birthdayrole [@role]` | `bdayrole` | Administrateur | Définir le rôle d'anniversaire de 24 heures, ou l'effacer sans rôle |
| `birthdaypingrole [@role]` | `bdayping` | Administrateur | Définir le rôle à mentionner, ou l'effacer sans rôle |
| `birthdaymessage [text]` | `bdaymsg` | Administrateur | Définir le texte de l'annonce, ou afficher le texte actuel |
| `birthdayconfig` | `bdaycfg` | Administrateur | Afficher la configuration actuelle |

`/birthday config reset` efface tous les paramètres et désactive toutes les fonctionnalités. Il n'a pas d'équivalent en commande texte.

## Astuces et pièges

- Les membres ne sont pas annoncés tant qu'ils n'ont pas exécuté `birthdayannouncements`. Prévenez-les, sinon personne ne sera annoncé.
- `setbirthday` accepte tout ce que le bot peut interpréter comme une date. Utilisez un format sans ambiguïté, comme `1998-04-12`.
- `birthdaytimezone` n'accepte qu'une courte liste fixe de seize fuseaux, comme `UTC`, `GMT`, `America/New_York`, `Europe/London`, `Asia/Tokyo`, `Asia/Kolkata`, `Australia/Sydney` et `Pacific/Auckland`. La liste déroulante **Fuseau horaire du serveur** du tableau de bord en propose une similaire, de treize.
- La vérification quotidienne utilise l'UTC. Les membres très éloignés de l'UTC peuvent être annoncés avec quelques heures d'avance ou de retard.
- Le bot a besoin de la permission Gérer les rôles pour le rôle d'anniversaire, et de Envoyer des messages ainsi que Intégrer des liens dans le salon d'annonces.
- `birthdayconfig` affiche un champ « Reminder Days » et une fonctionnalité Reminders. Ils sont enregistrés mais n'envoient rien pour le moment.
- Il n'existe pas de commande pour supprimer un anniversaire enregistré. Les membres peuvent le masquer en exécutant `setbirthdayprivacy Disabled` ou en refusant les annonces avec `birthdayannouncements`.

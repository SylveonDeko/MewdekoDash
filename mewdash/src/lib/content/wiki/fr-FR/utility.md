---
title: Utilitaires
slug: utility
summary: Une boîte à outils d'aides du quotidien, des alias de commandes, citations et rappels à la publication automatique, en passant par le rôle de diffusion, un assistant IA, le comptage des messages et les répétiteurs.
icon: fa-wrench
category: Actions
dashboard: /dashboard/utility
module: Utility
tags: [alias, quotes, auto publish, stream role, ai, chatbot, nsfw filter, role monitor, reminder, snipe, repeater, sticky, message count, invites, embed, calculator, userinfo, serverinfo, alias, citations, publication automatique, rôle de diffusion, ia, chatbot, filtre nsfw, surveillance des rôles, rappel, snipe, répétiteur, épingle, comptage des messages, invitations, embed, calculatrice, infos utilisateur, infos serveur]
related: [repeaters, polls, invites, messagestats, embedbuilder, xp, administration, moderation]
---

## Ce qu'il fait

Utility est le module fourre-tout regroupant les petites fonctionnalités dont la plupart des serveurs ont besoin. Les membres y trouvent des rappels, des citations, des lancers de dés, une calculatrice, la conversion d'unités et des commandes d'information sur les utilisateurs, les rôles, les salons et le serveur. Le personnel dispose des alias de commandes, des messages répétés, de la publication automatique pour les salons d'annonces, d'un rôle qui suit les membres pendant leur diffusion en direct, de la capture des messages supprimés, du comptage des messages et du suivi des invitations.

La page **Utilitaires** du tableau de bord regroupe les parties qui gagnent à disposer d'un formulaire : alias, citations, publication automatique, rôle de diffusion, assistant IA, filtre de tags NSFW et surveillance des rôles. Tout le reste ne s'utilise que par commande.

Comme ce module est vaste, chaque sous-fonctionnalité est décrite séparément ci-dessous. Le tableau des commandes en fin de page répertorie toutes les commandes du module.

## Pourquoi l'utiliser

- Raccourcir `play youtube` en `yt` pour tout le serveur grâce à un alias.
- Tenir un carnet de citations partagé auquel les membres peuvent ajouter des entrées et dans lequel ils peuvent piocher une ligne au hasard.
- Publier automatiquement à vos abonnés chaque message de votre salon d'annonces.
- Donner un rôle « En direct » aux membres uniquement pendant qu'ils diffusent un jeu précis.
- Publier un règlement ou un avis épinglé toutes les quelques minutes, ou seulement lorsque le salon est actif.
- Permettre aux membres de programmer des rappels pour eux-mêmes ou pour un salon.
- Faire fonctionner un assistant IA dans un salon, avec votre propre clé d'API.

## Alias

Un alias est un mot déclencheur que le bot réécrit en une autre commande avant de l'exécuter. `alias yt play youtube` signifie que `.yt lofi` exécute `.play youtube lofi`. Le déclencheur doit être le premier mot du message ; tout ce qui suit est ajouté à la commande associée. Les déclencheurs les plus longs sont testés en premier. Exécuter `alias <trigger>` sans association supprime l'alias, et `aliasesclear` les supprime tous.

Sur le tableau de bord, l'onglet **Alias** comporte les champs **Déclencheur d'alias** et **Correspondance d'alias**, une zone de recherche et une liste dans laquelle vous pouvez supprimer des entrées.

## Citations

Les citations sont de courts textes classés sous un mot-clé. `quoteadd <keyword> <text>` en enregistre une, `quoteprint <keyword>` (ou `..`) affiche une citation au hasard pour ce mot-clé, et `quoteshow <id>` affiche une citation précise. `quotesearch` effectue une recherche sur le mot-clé et le texte, `quoteid` indique qui a ajouté une citation, et `listquotes` parcourt les citations triées par mot-clé ou par date d'ajout. N'importe qui peut ajouter une citation. Une citation peut être supprimée par le membre qui l'a ajoutée ou par un administrateur ; supprimer toutes les citations d'un mot-clé, exporter en JSON et importer depuis une pièce jointe JSON nécessitent la permission Administrateur.

L'onglet **Citations** permet d'ajouter, de modifier, de rechercher et de supprimer des citations.

## Publication automatique

Les salons d'annonces de Discord exigent que chaque message soit publié manuellement. `addautopublish #channel` fait en sorte que le bot publie chaque nouveau message de ce salon. Deux listes noires par salon permettent d'ignorer certains messages : `addpublishblacklist @user #channel` ignore un utilisateur, et `addpublishblacklist #channel word` ignore tout message contenant ce mot, sans tenir compte de la casse. `getautopublishes` affiche tous les salons avec leurs listes noires.

L'onglet **Publication automatique** ajoute des salons et gère les listes **Ignorer les messages de ces utilisateurs** et **Ignorer les messages contenant ces mots**.

## Rôle de diffusion

`streamrole <fromRole> <addRole>` attribue **addRole** à tout membre ayant **fromRole** pendant qu'il diffuse en direct, et le lui retire lorsqu'il arrête. `streamrolekeyword <keyword>` limite cette attribution aux diffusions dont le titre contient le mot-clé ; exécutée sans mot-clé, la commande le supprime. Les membres de la liste blanche reçoivent le rôle pendant la diffusion même si le mot-clé ne correspond pas, et les membres de la liste noire ne le reçoivent jamais. `streamrole` sans argument désactive la fonctionnalité. Si le bot perd la permission de gérer le rôle, ou si le rôle est supprimé, la fonctionnalité se désactive d'elle-même.

L'onglet **Rôle de diffusion** comporte **Rôle éligible**, **Rôle pendant la diffusion**, **Mot-clé du titre de diffusion** ainsi qu'une liste **Liste blanche** et une liste **Liste noire** par identifiant d'utilisateur.

## Assistant IA

L'assistant répond à chaque message publié dans un salon choisi et conserve les cinq derniers échanges de chaque membre comme contexte. Taper `deletesession` dans ce salon efface votre propre conversation.

| Paramètre | Commande | Ce qu'il fait |
| --- | --- | --- |
| Salon | `aichannel [#channel] [enabled]` | Le seul salon dans lequel l'assistant écoute |
| Fournisseur et modèle | `aimodel <OpenAi\|Groq\|Claude> [model]` | Quelle API et quel modèle appeler |
| Clé d'API | `aikey` | Votre propre clé pour ce fournisseur ; elle est stockée par le bot et n'est plus affichée ensuite |
| Prompt système | `aiprompt <text>` | Instructions que le modèle suit |
| Recherche web | `aiwebsearch <true\|false>` | Autorise le modèle à effectuer une recherche web (Claude uniquement) |
| Webhook | `aiwebhook [name] [avatarUrl]` | Publie les réponses via un webhook avec un nom et un avatar personnalisés |
| Embed personnalisé | `aicustomembed [template]` | Place les réponses dans un embed ; `%airesponse%` indique où figure la réponse |

`aiconfig` affiche la configuration actuelle. L'onglet **Assistant IA** comporte **Assistant activé**, **Salon**, **Fournisseur**, **Modèle**, **Clé d'API**, **Prompt système**, **Autoriser la recherche web** et **Masquer les avis « recherche sur le web »**.

> [!WARNING]
> L'assistant utilise votre clé d'API et vous est facturé. Sans clé définie, les messages du salon reçoivent une réponse d'erreur.

## Filtre NSFW

L'onglet **Filtre NSFW** répertorie les tags bloqués pour les recherches d'images du module NSFW. Saisissez un tag dans **Tag à bloquer** pour l'ajouter, ou cliquez sur un tag pour le retirer. La commande correspondante est `nsfwtagbl [tag]` du module NSFW ; sans tag, elle affiche la liste noire actuelle.

## Surveillance des rôles

L'onglet **Surveillance des rôles** configure la surveillance des rôles du module Gestion du serveur, qui réagit lorsqu'un rôle ou une permission que vous avez marqué comme protégé est attribué. Choisissez une **Sanction par défaut** (uniquement annuler la modification, avertir, retirer tous les rôles, rendre muet, mettre en timeout, expulser ou bannir), ajoutez les rôles et permissions à protéger, et listez les **Rôles de confiance** et **Membres de confiance** qui sont exemptés. Les commandes (`addblacklistedrole`, `addblacklistedpermission`, `whitelistuser`, `whitelistrole`, `setdefaultpunishment`, `listblacklists`) sont réservées au propriétaire du serveur et se trouvent dans Gestion du serveur.

## Rappels

`remind me <time> <message>` vous envoie un message privé plus tard ; `remind here <time> <message>` publie dans le salon actuel ; `remind #channel <time> <message>` cible un autre salon et nécessite la permission Gérer les messages. Le délai s'écrit par exemple `2h30m`, `3 days`, `1w` ou `in 45 minutes`, et ne peut pas dépasser 60 jours. `remindlist` affiche vos rappels avec leur numéro d'index, et `reminddelete <index>` en supprime un. Les mentions du message sont neutralisées, sauf si vous pouvez mentionner everyone dans ce salon.

## Snipe

La capture des messages est désactivée tant qu'un administrateur n'exécute pas `snipeset enable`. Une fois activée, le bot conserve les messages supprimés et modifiés pendant 30 jours. `snipe [#channel] [@user]` affiche le dernier message supprimé, `editsnipe` la dernière modification, et `snipelist` et `editsnipelist` affichent les cinq derniers (ou un nombre que vous indiquez), filtrés par salon ou par utilisateur.

## Répétiteurs

Un répétiteur publie un message selon un calendrier. `repeat <message>` utilise un intervalle de cinq minutes ; `repeat <interval> <message>` en définit un entre 5 secondes et 25000 minutes ; `repeat <time of day> <message>` s'exécute une fois par jour. Chaque répétiteur a un index affiché par `repeatlist`.

| Mode de déclenchement | Comportement |
| --- | --- |
| `timeinterval` | Publie à chaque intervalle (par défaut) |
| `onactivity` | Publie lorsque le salon voit un nombre défini de messages dans une fenêtre de temps (`repeatactivity`) |
| `onnoactivity` | Publie lorsque le salon est resté silencieux pendant la fenêtre |
| `immediate` | Publie immédiatement, puis suit l'intervalle |
| `aftermessages` | Publie après un nombre défini de messages |

Autres options par répétiteur : `repeatredun` évite la publication si le message du répétiteur est déjà le dernier du salon ; `repeatschedule <business\|evening\|weekend\|custom>` limite les moments d'exécution ; `repeatconversation` active ou désactive la détection de conversation ; `repeatpriority` ordonne les répétiteurs de 0 à 100 ; `repeatthreadonly` et `repeatthreadautosticky` ciblent les fils ; `repeatforumtags` restreint les publications des forums par tag ; `repeatsuppressnotifications` envoie en silence ; `repeattoggle` met en pause.

## Comptage des messages et invitations

`togglemsgcount` active le comptage des messages. `usermessages`, `channelmessages`, `servermessages` et `topusers` affichent les totaux, `activitygraph` dessine les heures ou jours les plus actifs, et `minmsglength` ignore les messages plus courts qu'une longueur donnée. `resetmessagecounts` remet à zéro les compteurs d'un utilisateur, d'un salon ou des deux, après confirmation.

Le suivi des invitations enregistre qui a invité chaque membre. `invites`, `whoinvited`, `invitedusers` et `inviteleaderboard` lisent ces données. `toggleinvitetracking`, `toggleremoveinviteonleave` et `setminaccountage <days>` le contrôlent ; les comptes plus récents que l'âge minimum ne sont pas comptabilisés.

## Paramètres

La page du tableau de bord est répartie en onglets : **Alias**, **Citations**, **Publication automatique**, **Rôle de diffusion**, **Assistant IA**, **Filtre NSFW** et **Surveillance des rôles**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Déclencheur et correspondance d'alias | aucun | Mot à réécrire et commande qu'il devient |
| Mot-clé et texte de citation | aucun | Une citation enregistrée |
| Salons de publication automatique | aucun | Salons d'annonces dans lesquels le bot publie |
| Ignorer les messages de ces utilisateurs / contenant ces mots | aucun | Listes noires de publication par salon |
| Rôle éligible | aucun | Membres pouvant recevoir le rôle de diffusion |
| Rôle pendant la diffusion | aucun | Le rôle ajouté puis retiré |
| Mot-clé du titre de diffusion | toute diffusion | Seules les diffusions dont le titre contient ce texte sont prises en compte |
| Assistant activé | désactivé | Indique si le salon IA répond |
| Fournisseur, modèle, clé d'API, prompt système | aucun | Configuration de l'IA |
| Autoriser la recherche web | désactivé | Recherche web de Claude |
| Masquer les avis « recherche sur le web » | activé | Supprime les messages d'état de recherche web du modèle |
| Tags bloqués | aucun | Tags de recherche NSFW filtrés |
| Sanction par défaut | valeur par défaut | Action de la surveillance des rôles |

Le snipe, le comptage des messages, le suivi des invitations, les répétiteurs, les rappels et les aperçus de liens n'ont pas de commandes dans le tableau de bord.

## Pas à pas de configuration

1. Ouvrez **Utilitaires** dans le tableau de bord.
2. Dans **Alias**, ajoutez un déclencheur tel que `yt` associé à `play youtube`. Testez-le dans Discord.
3. Dans **Publication automatique**, ajoutez votre salon d'annonces. Ajoutez les bots ou utilisateurs de webhook à la liste d'exclusion.
4. Dans **Rôle de diffusion**, choisissez le rôle éligible et le rôle à ajouter, et éventuellement un mot-clé de titre. Vérifiez que le rôle du bot est placé au-dessus du rôle qu'il ajoute.
5. Dans **Assistant IA**, choisissez un salon, un fournisseur et un modèle, collez votre clé, rédigez un prompt système et activez l'assistant.
6. Dans Discord, exécutez `snipeset enable` si vous voulez la capture des messages supprimés, et `togglemsgcount` pour les statistiques de messages.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `alias <trigger> [mapping]` | `cmdmap` | Administrateur | Ajouter un alias, ou le supprimer sans association |
| `aliaslist` | `cmdmaplist`, `aliases` | Personne | Lister les alias |
| `aliasesclear` | `aliasclear` | Administrateur | Supprimer tous les alias |
| `quoteadd <keyword> <text>` | `.` | Personne | Ajouter une citation |
| `quoteprint <keyword>` | `..` | Personne | Citation au hasard pour un mot-clé |
| `quoteshow <id>` | | Personne | Afficher une citation par son ID |
| `quotesearch <keyword> <text>` | `qsearch` | Personne | Trouver une citation par mot-clé et texte |
| `quoteid <id>` | `qid` | Personne | Qui a ajouté une citation |
| `listquotes [page] [order]` | `liqu` | Personne | Parcourir les citations |
| `quotedelete <id>` | `qdel` | Personne (ses propres citations) ou Administrateur | Supprimer une citation |
| `delallquotes <keyword>` | `daq`, `delallq` | Administrateur | Supprimer toutes les citations d'un mot-clé |
| `quoteexport` | `qexport` | Administrateur | Exporter les citations en JSON |
| `quoteimport` | `qimport` | Administrateur | Importer les citations depuis un fichier JSON joint |
| `addautopublish <#channel>` | `addautopub`, `aap` | Administrateur | Publication automatique d'un salon d'actualités |
| `removeautopublish <#channel>` | `removeautopub` | Administrateur | Arrêter la publication automatique |
| `addpublishblacklist <@user> <#channel>` ou `<#channel> <word>` | `addpubbl` | Administrateur | Ignorer un utilisateur ou un mot |
| `removepublishblacklist <@user> <#channel>` ou `<#channel> <word>` | `removepubbl` | Administrateur | Retirer une exclusion |
| `getautopublishes` | `getaps` | Administrateur | Lister les salons en publication automatique |
| `streamrole [fromRole] [addRole]` | | Gérer les rôles | Définir le rôle de diffusion, ou le désactiver sans rôle |
| `streamrolekeyword [keyword]` | `srkw` | Gérer les rôles | Exiger un mot-clé dans le titre de diffusion |
| `streamroleblacklist <add\|remove> <@user>` | `srbl` | Gérer les rôles | Ne jamais attribuer le rôle à ce membre |
| `streamrolewhitelist <add\|remove> <@user>` | `srwl` | Gérer les rôles | Toujours attribuer le rôle à ce membre pendant sa diffusion |
| `aichannel [#channel] [enabled]` | `aic` | Gérer le serveur | Définir le salon IA |
| `aimodel <provider> [model]` | `aim` | Gérer le serveur | Fournisseur et modèle |
| `aikey` | `ak` | Administrateur | Définir la clé d'API |
| `aiprompt <text>` | `aip` | Gérer le serveur | Prompt système |
| `aiwebsearch <true\|false>` | `aws` | Gérer le serveur | Recherche web de Claude |
| `aiwebhook [name] [avatar]` | `aiw` | Administrateur | Répondre via un webhook, ou le désactiver sans nom |
| `aicustomembed [template]` | `aice` | Administrateur | Modèle d'embed pour les réponses |
| `aiconfig` | `ac` | Personne | Afficher les paramètres IA |
| `remind <me\|here> <time> <message>` | | Personne | Définir un rappel |
| `remind <#channel> <time> <message>` | | Gérer les messages | Rappel dans un autre salon |
| `remindlist` | `remindl`, `remindlst` | Personne | Vos rappels |
| `reminddelete <index>` | `remindrm`, `reminddel` | Personne | Supprimer un rappel |
| `snipeset <enable\|disable>` | `setsnipe` | Administrateur | Activer ou désactiver la capture |
| `snipe [#channel] [@user]` | | Personne | Dernier message supprimé |
| `editsnipe [#channel] [@user]` | | Personne | Dernier message modifié |
| `snipelist [#channel] [@user] [amount]` | `slist` | Personne | Messages supprimés récents |
| `editsnipelist [#channel] [@user] [amount]` | `esnipelist` | Personne | Messages modifiés récents |
| `repeat [time] [interval] <message>` | | Gérer les messages | Créer un répétiteur |
| `repeatlist` | `replst`, `replist`, `repli` | Gérer les messages | Lister les répétiteurs |
| `repeatremove <index>` | `reprm` | Gérer les messages | Supprimer un répétiteur |
| `repeatinvoke <index>` | `repinv` | Gérer les messages | Publier maintenant |
| `repeatmessage <index> <message>` | `repmsg` | Gérer les messages | Modifier le texte |
| `repeatchannel <index> [#channel]` | `repchan` | Gérer les messages | Déplacer le répétiteur |
| `repeatredun <index>` | `repred` | Gérer les messages | Activer ou désactiver la vérification de redondance |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Gérer les messages | Mode de déclenchement du tableau ci-dessus |
| `repeatactivity <index> <messages> <window>` | `repactivity`, `repact` | Gérer les messages | Seuil d'activité |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Gérer les messages | Priorité |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Gérer les messages | Calendrier horaire |
| `repeatconversation <index>` | `repconversation`, `repconv` | Gérer les messages | Activer ou désactiver la détection de conversation |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Gérer les messages | Mettre en pause ou reprendre |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Gérer les messages | Épingler dans les nouveaux fils |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Gérer les messages | Publier uniquement dans les fils |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Gérer les messages | Envoyer en silence |
| `repeatforumtags <index> <action> [tagType] [tags]` | `repforumtags`, `repftags` | Gérer les messages | Règles de tags de forum |
| `togglemsgcount` | `togglemessagecount` | Administrateur | Activer ou désactiver le comptage des messages |
| `minmsglength [length]` | `mmlength`, `minmlength` | Gérer le serveur | Ignorer les messages courts |
| `usermessages [@user]` | `usermsg`, `umsg` | Personne | Statistiques de messages d'un membre |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Personne | Statistiques de messages d'un salon |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg`, `gmsg` | Personne | Statistiques à l'échelle du serveur |
| `topusers` | `topu` | Personne | Top dix par nombre de messages |
| `activitygraph [days\|hours]` | `actgraph` | Personne | Graphique des heures les plus actives |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Gérer les messages | Réinitialiser les compteurs |
| `invites [@user]` | | Personne | Nombre d'invitations |
| `whoinvited [@user]` | `invitedby` | Personne | Qui a invité un membre |
| `invitedusers [@user]` | `userinvites` | Personne | Membres invités par quelqu'un |
| `inviteleaderboard` | `inviteslb` | Personne | Meilleurs invitants |
| `invitesettings` | `inviteconfig` | Gérer le serveur | Afficher les paramètres d'invitation |
| `toggleinvitetracking` | | Gérer le serveur | Activer ou désactiver le suivi |
| `toggleremoveinviteonleave` | `triol` | Gérer le serveur | Ne plus compter les invitations lorsque l'invité quitte |
| `setminaccountage <days>` | `inviteminage` | Gérer le serveur | Ignorer les comptes récents |
| `joinstats` | `jstats` | Indicateur bêta (`dragon`) | Graphique des arrivées |
| `leavestats` | `lstats` | Indicateur bêta (`dragon`) | Graphique des départs |
| `joinstatscolor [r g b]` | `jstatscolor` | Indicateur bêta (`dragon`) | Couleur du graphique des arrivées, or sans valeurs |
| `leavestatscolor [r g b]` | `lstatscolor` | Indicateur bêta (`dragon`) | Couleur du graphique des départs, or sans valeurs |
| `userinfo [@user]` | `uinfo` | Personne | Détails sur un membre |
| `serverinfo [name]` | `sinfo` | Personne | Détails sur le serveur |
| `channelinfo [#channel]` | `cinfo` | Personne | Détails sur un salon textuel |
| `vinfo [channel]` | `voiceinfo` | Personne | Détails sur un salon vocal |
| `rinfo <role>` | `roleinfo` | Personne | Détails sur un rôle |
| `fetch <id>` | | Personne | Rechercher n'importe quel utilisateur par ID |
| `avatar [@user]` | `av` | Personne | Avatar, avec un bouton pour l'avatar du serveur |
| `banner [@user]` | `userbanner` | Personne | Bannière d'un utilisateur |
| `userid [@user]` | `uid` | Personne | ID d'utilisateur |
| `roleid <role>` | `rid` | Personne | ID de rôle |
| `channelid` | `cid` | Personne | ID de salon |
| `serverid` | `sid` | Personne | ID du serveur |
| `roles [@user]` | | Personne | Rôles du serveur, ou les rôles d'un membre |
| `inrole <role>` | | Personne | Membres ayant un rôle |
| `inroles <role> <role>` | | Personne | Membres ayant les deux rôles |
| `rolepermlist [and\|or] <permissions...>` | `roleperms` | Personne | Rôles détenant des permissions |
| `channeltopic [#channel]` | `ct` | Personne | Sujet du salon |
| `whosplaying <game>` | `whpl` | Personne | Membres qui jouent à un jeu |
| `emotelist [type]` | | Personne | Émotes du serveur |
| `showemojis <emojis>` | `se` | Personne | Agrandir des émojis |
| `say [#channel] <text or embed JSON>` | | Gérer les messages | Parler en tant que le bot |
| `getjson <messageId> [#channel]` | | Gérer les messages | JSON d'embed d'un message |
| `embedsave <name> <json>` | `esave` | Personne | Enregistrer un modèle d'embed personnel |
| `guildembedsave <name> <json>` | `gesave`, `gembedsave` | Gérer les messages | Enregistrer un modèle d'embed du serveur |
| `embedlist` / `guildembedlist` | `elist` / `gelist`, `gembedlist` | Personne | Lister les modèles |
| `embeddelete <name>` / `guildembeddelete <name>` | `edel`, `edelete` / `gedel`, `gembeddelete` | Personne / Gérer les messages | Supprimer un modèle |
| `embedpreview <name>` | `epreview`, `eprev` | Personne | Prévisualiser un modèle |
| `debugembed <text>` | `embeddebug` | Administrateur | Tester l'analyse d'un embed |
| `savechat <time> [#channel]` | | Gérer les messages | Enregistrer un journal de discussion et obtenir un lien |
| `calculate <expression>` | `calc` | Personne | Évaluer un calcul |
| `calcops` | | Personne | Opérations mathématiques disponibles |
| `plot <function> [start] [end]` | `graphfunction` | Personne | Tracer une fonction |
| `sym <expression>` | `symbolicmath` | Personne | Calcul formel |
| `convertunits <from> <to> <value>` | `unitconvert`, `units` | Personne | Conversion d'unités |
| `convertlist` | | Personne | Unités prises en charge |
| `convert <format>` | | Personne | Convertir un fichier multimédia joint |
| `roll <dice>` | | Personne | Lancer des dés, notation DnD prise en charge |
| `owoify <text>` | `owo` | Personne | Transformer le texte en OwO |
| `vcheck [url]` | `viruscheck` | Personne | Analyse VirusTotal d'un lien |
| `traceroute <host>` | `tracert`, `trcrt` | Personne | Tracer la route vers un hôte |
| `pingip <ip> [count]` | | Personne | Ping d'une adresse, jusqu'à 10 fois |
| `previewlinks <yes\|no>` | `plinks` | Administrateur | Activer ou désactiver les aperçus de liens |
| `verboseerror [true\|false]` | `ve` | Gérer les messages | Activer ou désactiver les erreurs de commande détaillées |
| `ping` | | Personne | Latence du bot |
| `stats` | | Personne | Statistiques du bot |
| `invite` | | Personne | Liens d'invitation et de support du bot |
| `vote` | | Personne | Lien de vote |

## Astuces et pièges

- Un alias ne fait que réécrire le texte ; la commande associée s'exécute toujours avec ses propres vérifications de permissions.
- La publication automatique ne fonctionne que dans les salons d'annonces (actualités) de Discord.
- Le rôle de diffusion nécessite que le rôle du bot soit placé au-dessus du rôle qu'il ajoute. S'il ne peut pas gérer le rôle, la fonctionnalité se désactive d'elle-même au lieu d'échouer silencieusement à chaque diffusion.
- La capture des messages est désactivée par défaut, et les messages capturés depuis plus de 30 jours sont supprimés.
- Les rappels dépassant 60 jours sont refusés.
- L'assistant IA ne répond que dans le seul salon configuré et ignore les bots. Sa mémoire se limite aux cinq derniers messages de chaque membre ; les longues conversations perdent donc le contexte initial.
- Le comptage des messages doit être activé avant qu'il existe des statistiques ; rien n'est compté rétroactivement.
- `joinstats` et `leavestats` ne peuvent être exécutées qu'une fois toutes les dix secondes.

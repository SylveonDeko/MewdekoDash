---
title: Accès au salon
slug: channel-access
summary: Protégez un salon privé derrière un formulaire de candidature, et laissez les membres déjà présents voter sur les personnes admises.
icon: fa-lock
category: Security
dashboard: /dashboard/channel-access
module: ChannelAccess
tags: [channel access, gate, application, apply, vote, private channel, locked channel, inner circle, blacklist, review, accès au salon, porte, candidature, postuler, vote, salon privé, salon verrouillé, cercle restreint, liste noire, examen]
related: [administration, tickets, forms]
---

## Ce que ça fait

Le staff installe une « porte » sur un salon que la plupart des membres ne peuvent pas voir. Les membres cliquent sur le bouton **Apply for access** ou exécutent `channelaccessapply`, puis remplissent un court formulaire de cinq questions au maximum. La candidature est publiée sous forme d'embed dans un salon d'examen, avec les boutons **Approuver**, **Refuser**, **Abstain** (facultatif) et **Détail**.

Les personnes qui peuvent déjà voir le salon votent. Dès que suffisamment d'approbations arrivent, le candidat est admis, soit en recevant un rôle, soit par une surcharge de permission personnelle sur le salon. Suffisamment de refus, ou la fin de la période de vote, aboutissent à un rejet. Le staff peut forcer l'un ou l'autre résultat à tout moment.

Le candidat est informé du résultat par MP si la porte le permet, et les candidats refusés doivent attendre la fin d'un délai de recharge avant de postuler à nouveau. Tout est journalisé dans un salon de logs facultatif.

## Pourquoi l'utiliser

- Un salon réservé aux membres, ou « cercle restreint », où les membres existants décident qui entre.
- Un salon réservé aux adultes vérifiés, où un petit groupe de confiance se porte garant des nouveaux venus.
- Des salons d'échange ou de marché qui veulent une vérification avant qu'une personne puisse publier.
- Tout salon où vous voulez une candidature écrite sans que le staff doive tout lire lui-même.

## Portes

Une porte se compose d'un salon et de ses règles. Chaque salon peut avoir une seule porte. Créer une porte avec un rôle en fait une **porte à rôle** ; la créer sans rôle en fait une **porte directe**.

| Mode d'accès | Libellé du tableau de bord | Comment l'accès est accordé | Qui est considéré comme « à l'intérieur » |
| --- | --- | --- | --- |
| Role | Give them a role | Le rôle d'accès est ajouté au candidat | Toute personne possédant le rôle d'accès |
| Channel permission | Add them to the channel directly | Une surcharge d'autorisation Voir le salon est écrite pour ce membre | Toute personne qui peut actuellement voir le salon |

Les membres approuvés ne sont jamais retirés automatiquement. Retirez vous-même le rôle ou supprimez la surcharge.

## Candidatures

Avant l'ouverture d'une candidature, le bot vérifie dans cet ordre : la porte accepte les candidatures, le membre n'a pas déjà l'accès, il n'est pas bloqué, son compte et son arrivée sur le serveur sont suffisamment anciens, il n'a pas de candidature en cours pour cette porte, et son délai avant nouvelle candidature est écoulé. Tout échec renvoie un message éphémère expliquant la raison.

Si la porte comporte des questions, un formulaire s'ouvre avec une case par question. Les questions sont limitées à 45 caractères à cause des limites des formulaires Discord. Les champs de réponse sont soit sur une ligne (200 caractères), soit sur plusieurs lignes (1000 caractères), et peuvent être marqués comme obligatoires. Une porte sans question se soumet immédiatement.

Le message d'examen est envoyé dans le **Salon d'examen**, ou dans le salon verrouillé lui-même si aucun n'est défini. Il indique le candidat, la date de création de son compte et celle de son arrivée sur le serveur, chaque question et sa réponse, un décompte des votes en direct, et un pied de page indiquant quand le vote se termine. Si **Masquer le candidat jusqu'à la clôture du vote** est activé, le nom est remplacé par « Hidden until the vote closes » tant que la candidature est en attente.

### Statuts

| Statut | Signification |
| --- | --- |
| Pending | Ouverte et soumise au vote |
| Approved | Adoptée, l'accès a été accordé |
| Denied | Rejetée par vote, expiration ou par le staff |
| Withdrawn | Le candidat l'a retirée avec `channelaccesswithdraw` |
| Expired | Non utilisé par les règles d'expiration actuelles ; conservé pour l'historique |

## Vote

Les personnes autorisées à voter dépendent de la porte. Si un **Rôle des votants** est défini, seules les personnes possédant ce rôle peuvent voter. Sinon, toute personne ayant déjà accès au salon, ainsi que toute personne disposant de la permission Gérer les rôles, peut voter. Les candidats ne peuvent jamais voter sur leur propre candidature.

Cliquer sur un bouton enregistre un vote. Cliquer sur un autre bouton change le vote. Recliquer sur le même bouton le retire. Le décompte est mis à jour sur le message après chaque modification.

La candidature se résout dès que les approbations atteignent **Approbations nécessaires** ou que les refus atteignent **Refus nécessaires**. Fixer l'un de ces seuils à 0 désactive ce côté, de sorte qu'une porte dont **Refus nécessaires** vaut 0 ne peut être refusée que par le staff ou par expiration.

**Détail** indique qui a voté quoi, réservé aux votants. Si **Masquer qui a voté dans quel sens** est activé, seuls les membres disposant de la permission Gérer les rôles peuvent le voir.

### Lorsque la période se termine

Une vérification en arrière-plan s'effectue chaque minute pour les candidatures dont la **Voting window** est écoulée. Le comportement est défini par porte :

| Option | Libellé du tableau de bord | Résultat |
| --- | --- | --- |
| Deny | Deny the application | La candidature est refusée. Par défaut. |
| Majority | Whichever side has more votes | Approuvée si les approbations dépassent les refus, sinon refusée |
| StayOpen | Leave it open for staff | Rien ne se passe tant que le staff ne tranche pas |

Réglez **Voting window** sur 0 pour ne pas limiter la durée.

## Blocage des candidats

Le staff peut bloquer un utilisateur sur une seule porte ou sur toutes les portes du serveur. Les utilisateurs bloqués reçoivent « You are blocked from applying for this channel » lorsqu'ils essaient. Les blocages peuvent avoir une raison facultative, affichée dans la liste noire.

## Paramètres

La page **Accès aux salons** comporte trois onglets : **Accès**, **Candidatures** et **Bloqués**.

**Accès** liste toutes les portes avec un interrupteur **Accepte les candidatures** et se déplie pour afficher leurs paramètres, les **Questions de candidature** et un affichage **Panneau de candidature**. Les valeurs par défaut ci-dessous s'appliquent aux nouvelles portes.

| Paramètre | Par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Locked channel | requis | Le salon protégé |
| How people get in | Give them a role | Porte à rôle ou porte directe |
| Role granted on approval | aucun | Le rôle d'accès, pour les portes à rôle |
| Approvals needed | 3 | Approbations qui valident la candidature ; 0 désactive |
| Denials needed | 3 | Refus qui rejettent la candidature ; 0 désactive |
| Voting window (hours) | 72 | Délai avant l'application de la règle d'expiration ; 0 pour aucune limite |
| When the window closes | Deny the application | L'une des trois options d'expiration |
| Review channel | le salon protégé lui-même | Où les candidatures sont publiées pour le vote |
| Log channel | aucune journalisation | Où les nouvelles candidatures et les résultats sont journalisés |
| Voter role | toute personne ayant le rôle d'accès | Limite le vote à un rôle |
| Ping role on new applications | aucune mention | Rôle mentionné à l'arrivée d'une candidature |
| Min account age (days) | 0 | Refuse les comptes plus récents que ce délai |
| Min time in server (days) | 0 | Refuse les membres arrivés plus récemment que ce délai |
| Reapply cooldown (hours) | 168 | Délai d'attente après un refus ou une expiration avant de postuler à nouveau |
| Offer an abstain button | activé | Ajoute un bouton Abstain au message d'examen |
| Hide the applicant until the vote closes | désactivé | Candidat anonyme pendant l'attente |
| Hide who voted which way | désactivé | Détail des votes réservé à Gérer les rôles |
| DM the applicant on a decision | activé | Envoie le résultat par MP |

**Candidatures** liste les candidatures filtrées par porte et par statut, avec le décompte et les boutons **Approuver** et **Refuser** pour celles en attente. **Bloqués** liste les utilisateurs bloqués par portée et permet de **Bloquer** quelqu'un sur une porte ou sur **Tous les accès**, avec une raison facultative.

## Pas à pas

1. Rendez le salon privé dans Discord et, pour une porte à rôle, créez le rôle qui peut le voir.
2. Ouvrez **Accès aux salons** dans le tableau de bord et utilisez **Ouvrir les candidatures pour un salon**. Choisissez le **Salon verrouillé**, sélectionnez **Comment les personnes entrent**, puis le rôle si nécessaire.
3. Dépliez la porte. Définissez un **Salon d'examen** pour que les candidatures n'atterrissent pas dans le salon verrouillé, et un **Salon de journal** si vous voulez un historique.
4. Ajustez **Approbations nécessaires**, **Refus nécessaires** et la **Voting window** selon le nombre de votants attendus.
5. Sous **Questions de candidature**, ajoutez jusqu'à cinq questions. Cochez **Requis** et **Réponse sur plusieurs lignes** si besoin.
6. Sous **Panneau de candidature**, choisissez où placer le bouton et cliquez sur **Publier le panneau**.
7. Postulez depuis un compte de test, votez depuis un membre qui a accès, et vérifiez que le candidat est bien admis.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié). Les versions slash se trouvent sous `/channelaccess`.

| Commande | Alias | Autorisation | Rôle |
| --- | --- | --- | --- |
| `channelaccesssetup <#channel> [@role]` | `casetup` | Gérer les rôles | Créer une porte ; omettez le rôle pour une porte directe |
| `channelaccessremove <#channel>` | `caremove` | Gérer les rôles | Supprimer une porte avec ses questions et son historique |
| `channelaccesslist` | `calist` | Personne | Lister les portes avec leurs seuils, leur période et leur statut |
| `channelaccessconfig <#channel> [setting] [value]` | `caconfig` | Gérer les rôles | Modifier un paramètre ; sans paramètre, affiche la liste |
| `channelaccesspanel <#channel> [#target]` | `capanel` | Gérer les rôles | Publier le bouton de candidature, dans le salon actuel par défaut |
| `channelaccessquestionadd <#channel> <question>` | `caqadd` | Gérer les rôles | Ajouter une question obligatoire sur plusieurs lignes |
| `channelaccessquestionremove <#channel> <position>` | `caqremove` | Gérer les rôles | Supprimer une question par son numéro affiché |
| `channelaccessquestionlist <#channel>` | `caqlist` | Gérer les rôles | Afficher les questions dans l'ordre |
| `channelaccessapply <#channel>` | `caapply` | Personne | Publier le bouton de candidature pour vous-même |
| `channelaccesswithdraw <id>` | `cawithdraw` | Personne | Retirer votre propre candidature en cours |
| `channelaccesshistory [@user]` | `cahistory` | Personne | Votre historique de candidatures ; pour les autres, il faut Gérer les rôles |
| `channelaccesspending [#channel]` | `capending` | Personne | Lister les candidatures ouvertes, éventuellement pour une seule porte |
| `channelaccessapprove <id> [reason]` | `caapprove` | Gérer les rôles | Approuver indépendamment des votes |
| `channelaccessdeny <id> [reason]` | `cadeny` | Gérer les rôles | Refuser indépendamment des votes |
| `channelaccessblacklistadd <@user> [#channel]` | `cabladd` | Gérer les rôles | Bloquer sur une seule porte, ou partout sans salon |
| `channelaccessblacklistremove <@user> [#channel]` | `cablremove` | Gérer les rôles | Lever un blocage ; indiquez le même salon que celui du blocage |
| `channelaccessblacklist` | `cablacklist` | Gérer les rôles | Lister les utilisateurs bloqués |

Les paramètres acceptés par `channelaccessconfig` sont `enabled`, `approvals`, `denials`, `votehours`, `onexpiry` (`deny`, `majority`, `stayopen`), `reviewchannel`, `logchannel`, `voterrole`, `pingrole`, `anonymousapplicant`, `anonymousvotes`, `allowabstain`, `minaccountage`, `minserverage`, `reapplycooldown` et `dmondecision`.

> [!EXAMPLE]
> `caconfig #inner-circle approvals 5` puis `caconfig #inner-circle onexpiry majority`.

## Astuces et pièges

- Le bot a besoin de la permission Gérer les rôles pour les portes à rôle, et de la permission Gérer les salons (avec le droit de modifier les surcharges de ce salon) pour les portes directes. Son rôle le plus élevé doit être au-dessus du rôle d'accès.
- Si aucun **Salon d'examen** n'est défini, les candidatures sont publiées dans le salon verrouillé. C'est adapté au cas « les membres votent sur les nouveaux venus », mais définissez un salon séparé si c'est au staff de voter.
- Les questions ajoutées par commande sont toujours obligatoires et sur plusieurs lignes. Utilisez le tableau de bord pour rendre une question facultative ou sur une seule ligne, ou pour lui donner un texte d'exemple.
- Supprimer une porte supprime définitivement ses questions, candidatures et votes.
- Les membres qui quittent le serveur avant la fin du vote ne reçoivent pas l'accès, même s'ils ont été approuvés.
- Seules les approbations et les refus donnent lieu à un MP concernant le vote ou l'expiration. Les candidatures retirées ne reçoivent aucun MP.
- Un utilisateur bloqué doit être débloqué avec la même portée que celle du blocage. Un blocage à l'échelle du serveur n'est pas levé par un déblocage qui nomme un salon.

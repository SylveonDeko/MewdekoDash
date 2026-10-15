---
title: Confessions
slug: confessions
summary: Les membres envoient des confessions anonymes que le bot publie sous forme d'embeds numérotés dans un salon, avec un journal facultatif réservé au staff qui révèle qui a envoyé chacune d'elles.
icon: fa-comment
category: Community
dashboard: /dashboard/confessions
module: Confessions
tags: [confessions, confess, anonymous, secrets, confession channel, confession log, blacklist, confessions, confession, anonyme, secrets, salon des confessions, journal des confessions, liste noire]
related: [administration, moderation]
---

## Fonctionnement

Un membre exécute `/confess` sur le serveur, ou envoie en MP au bot `.confess <server id> "text"`, et le bot publie son message dans le salon des confessions sous forme d'embed intitulé « Anonymous confession #N ». Le nom de l'expéditeur n'apparaît jamais dans ce salon. Il reçoit une confirmation privée, et le numéro de la confession augmente de un à chaque envoi.

Le staff peut définir un salon journal distinct. Chaque confession y est copiée avec le tag et l'ID de l'expéditeur, le numéro de la confession et un lien vers le message publié. Les membres sont informés, dans le pied de page de chaque confession, de la façon d'envoyer une confession, et dans la confirmation qu'ils peuvent signaler un serveur qui abuse de la fonction.

Le staff peut aussi mettre sur liste noire certains membres, afin que leurs confessions soient refusées, et supprimer des confessions depuis le tableau de bord, ce qui supprime aussi le message Discord.

## Pourquoi l'utiliser

- Des salons de défoulement ou de « potins » où les membres veulent s'exprimer sans nom associé.
- Des salons de compliments ou de remerciements qui restent anonymes.
- Tout salon anonyme où le staff doit tout de même pouvoir retrouver l'auteur d'un harcèlement.

## La publication de confession

Chaque confession est un embed dans le salon des confessions :

| Élément | Contenu |
| --- | --- |
| Ligne d'auteur | `Anonymous confession #N` avec l'icône du serveur |
| Description | Le texte de la confession |
| Image | La pièce jointe, si une a été envoyée |
| Pied de page | `Do /confess or dm me .confess <server id> yourconfession to send a confession!` |
| Horodatage | Date de publication |

La numérotation commence à 1 et se poursuit à partir de la dernière confession enregistrée. Supprimer une confession ne renumérote pas les autres.

Les pièces jointes sont prises en charge dans les deux cas : joignez un fichier à `/confess` avec l'option `attachment`, ou joignez-le au MP lorsque vous utilisez la commande textuelle. Seule la première pièce jointe est utilisée.

## Le salon journal

Lorsqu'un **Log Channel** est défini, chaque confession produit aussi un embed rouge dans ce salon, avec **Utilisateur** (tag et ID), **Confession N** (le texte), un **Message Link** et un avertissement sur l'utilisation abusive. C'est le seul endroit où l'expéditeur est révélé ; réservez-en l'accès aux personnes de confiance.

> [!WARNING]
> Le salon journal existe pour que le staff puisse traiter les cas de harcèlement. Révéler qui a envoyé une confession peut entraîner la mise sur liste noire du serveur par les propriétaires du bot. Les membres peuvent signaler les abus avec `/confessions report`.

## Liste noire

`confessionblacklist` ajoute un membre à la liste noire du serveur, et `confessionunblacklist` l'en retire. Les membres sur liste noire reçoivent le message « you are blacklisted » au lieu d'une publication. La vérification se fait par ID utilisateur.

Le tableau de bord affiche une **Liste noire des rôles** et enregistre les ID de rôles dans la même liste. Le bot compare uniquement l'ID utilisateur de l'expéditeur à la liste lorsqu'une confession arrive ; les rôles sélectionnés sur le tableau de bord n'empêchent donc actuellement personne d'envoyer. Utilisez les commandes pour bloquer des membres précis.

## Paramètres

La page **Confessions** comporte trois onglets : **Configuration**, **Confessions** et **Statistiques**.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Confession Channel | aucun | Où sont publiées les confessions anonymes ; les confessions sont désactivées tant que ce paramètre n'est pas défini |
| Log Channel (shows user IDs) | aucun | Où est envoyée la copie identifiante de chaque confession |
| Role Blacklist | aucun | Voir la section Liste noire ci-dessus |

**Confessions** liste chaque confession enregistrée, de la plus récente à la plus ancienne, avec son numéro et sa date. Le contenu reste masqué jusqu'à ce que vous le développiez, et **Supprimer la confession** la supprime de la base de données et supprime le message sur Discord s'il existe encore.

**Statistiques** affiche **Total des confessions**, **Ce mois-ci**, **Aujourd'hui** et **Dernier numéro**.

## Pas à pas pour la configuration

1. Créez un salon où le bot peut envoyer des messages et intégrer des liens, et où les membres peuvent lire sans pouvoir écrire, idéalement.
2. Ouvrez **Confessions** dans le tableau de bord et choisissez ce salon comme **Salon des confessions**.
3. Choisissez éventuellement un salon privé pour le staff comme **Log Channel**.
4. Cliquez sur **Enregistrer la configuration**.
5. Exécutez `/confess` depuis un compte membre et vérifiez que l'embed apparaît avec `#1`.
6. Si quelqu'un en abuse, retrouvez-le dans le salon journal et exécutez `confessionblacklist @user`.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` si vous ne l'avez pas modifié). Les versions slash se trouvent sous `/confessions`, sauf `/confess`, qui est au niveau supérieur.

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `confess <server id> <"text">` | | Aucune | MP uniquement. Publier une confession sur le serveur indiqué ; entourez de guillemets un texte de plusieurs mots |
| `confessionchannel [#channel]` | `confesschannel` | Gérer les salons | Définir le salon des confessions, ou désactiver les confessions sans salon |
| `confessionlogchannel [#channel]` | `confesslogchannel`, `confessionlogchnl` | Administrateur | Définir le salon journal |
| `confessionblacklist <@user>` | `confessblacklist`, `confessbl` | Gérer les salons | Empêcher un membre d'envoyer des confessions |
| `confessionunblacklist <@user>` | `confessunblacklist`, `confessunbl` | Gérer les salons | Permettre à un membre sur liste noire d'envoyer à nouveau des confessions |

`/confessions report <server id> <description>` envoie aux propriétaires du bot un signalement concernant un serveur qui abuse des confessions. Il n'existe pas d'équivalent textuel.

## Astuces et pièges

- Le bot a besoin des permissions Envoyer des messages et Intégrer des liens dans le salon des confessions comme dans le salon journal. Les commandes de salon avertissent s'il ne les a pas, mais enregistrent quand même le paramètre.
- La commande textuelle `confess` ne fonctionne qu'en MP et prend la confession comme un seul argument ; `confess 123456789 "I like pineapple on pizza"` fonctionne donc, alors que la version sans guillemets ne publie que le premier mot. `/confess` sur le serveur est plus simple pour les membres.
- `confess` par MP ne fonctionne que pour les serveurs que vous partagez avec le bot ; les autres ID de serveur sont refusés.
- La commande textuelle `confessionlogchannel` sans salon efface le salon des confessions et non le salon journal. Pour effacer le salon journal, passez par le tableau de bord.
- Les confessions sont enregistrées avec l'ID utilisateur de l'expéditeur même sans salon journal, et le tableau de bord peut retrouver l'expéditeur d'une confession précise. Considérez l'accès au tableau de bord comme réservé au staff.
- Une suppression depuis le tableau de bord efface l'enregistrement stocké ; la copie dans le salon journal est alors votre seule trace restante.

---
title: Journal d'audit
slug: auditlog
summary: Un registre de qui a utilisé le tableau de bord pour votre serveur, ce qu'il a consulté et ce qu'il a modifié, conservé pendant quatre-vingt-dix jours.
icon: fa-clipboard-check
category: Security
dashboard: /dashboard/auditlog
tags: [audit, history, accountability, dashboard access, who changed, log, changes, before and after, audit, historique, responsabilité, accès au tableau de bord, qui a modifié, journal, modifications, avant et après]
related: [logging, administration, channel-access]
---

## Ce que ça fait

Chaque requête envoyée au bot par le tableau de bord pour votre serveur est enregistrée au nom du compte Discord connecté. La page Journal d'audit transforme cela en une chronologie : qui a ouvert les paramètres d'XP, qui a modifié le message de bienvenue, qui a supprimé un déclencheur de chat, et quelles étaient les valeurs avant et après.

Il est distinct du journal d'audit de Discord et de la fonction Journalisation. Le journal de Discord couvre les actions effectuées dans Discord. La Journalisation de Mewdeko publie dans les salons de votre choix les événements du serveur, comme les arrivées, les modifications et les changements de rôles. Le journal d'audit du tableau de bord ne couvre que le tableau de bord.

Rien n'est à activer. Les entrées sont écrites dès qu'une personne se connecte au tableau de bord et ouvre votre serveur, et elles expirent après quatre-vingt-dix jours.

## Pourquoi l'utiliser

- Plusieurs personnes ont accès au tableau de bord et vous voulez savoir qui a désactivé l'Anti-Raid la semaine dernière.
- Un paramètre a été modifié et personne ne l'admet.
- Vous voulez une trace avant d'ouvrir l'accès au tableau de bord à une équipe de staff plus large.
- Vous devez confirmer qu'une modification que vous avez demandée à quelqu'un a bien été faite, et ce qu'elle a remplacé.

## Ce qui est enregistré

Chaque entrée contient :

- **Quand** : l'heure de la requête, stockée en UTC et affichée dans votre propre fuseau horaire sur la page.
- **Utilisateur** : le nom d'utilisateur et l'identifiant Discord, tirés de la connexion au tableau de bord, et non de ce que l'utilisateur a saisi.
- **Action** : l'une des actions du tableau ci-dessous.
- **Section** : la zone du tableau de bord, affichée avec un nom convivial comme « AFK System », « Triggers » ou « Protection ».
- **Endpoint** : la requête exacte, par exemple `PUT Afk/123/settings`, affichée en petits caractères sous la section.
- **Changes** : pour tout ce qui n'est pas une simple consultation, les valeurs envoyées ou modifiées. Développez l'entrée avec **Détails** pour les voir.

Le bot enregistre aussi la chaîne d'agent utilisateur du navigateur avec chaque entrée.

### Actions

L'action dépend du type de requête émise par le tableau de bord.

| Action | Enregistrée lorsque |
| --- | --- |
| Viewed | Le tableau de bord a lu des données (une requête GET). Chaque chargement de page produit ces entrées. |
| Created | Quelque chose a été ajouté (une requête POST). |
| Updated | Quelque chose d'existant a été modifié (une requête PUT ou PATCH). |
| Deleted | Quelque chose a été supprimé (une requête DELETE). |
| Accessed | Réservé aux débuts de session du tableau de bord. Le filtre le propose, mais la version actuelle n'écrit jamais d'entrée avec cette action. |

### Ensembles de modifications

Les consultations ne stockent aucune donnée de modification. Pour tout le reste, le bot stocke l'un de deux documents :

- **Diff avant et après** : lorsque la section du tableau de bord enregistre l'état précédent du paramètre avant de le modifier, l'entrée ne liste que les champs modifiés, chacun avec son ancienne et sa nouvelle valeur. La plupart des pages de paramètres fonctionnent ainsi.
- **Corps de la requête** : lorsqu'aucune copie n'a été faite, l'entrée stocke ce que le tableau de bord a envoyé, sans ancienne valeur.

Tout champ dont le nom contient `token`, `secret`, `password`, `apikey`, `api_key`, `authorization` ou `clientsecret` est remplacé par `[redacted]` avant d'être stocké, afin que les identifiants n'apparaissent jamais dans le journal.

Sur la page, les booléens s'affichent Oui et Non (On et Off), les listes « 3 items », les chaînes vides « empty » et les valeurs absentes « none ». Les noms de champs sont transformés en libellés lisibles.

> [!NOTE]
> Les entrées « Viewed » constituent la majeure partie du journal, car chaque page du tableau de bord lit les paramètres à son ouverture. Filtrez sur Created, Updated ou Deleted lorsque vous cherchez une modification.

### Ce qui n'est pas enregistré

- Les actions effectuées avec des commandes dans Discord. Elles apparaissent dans le journal d'audit de Discord à l'endroit où le bot a agi, et dans la Journalisation si vous l'avez configurée.
- Les requêtes non liées à un utilisateur connecté au tableau de bord.
- L'ouverture de la page Journal d'audit elle-même, Leave Feedback, et quelques points de terminaison d'infrastructure et d'interrogation, comme l'état du bot, les performances, les informations système et la gestion des instances.
- Quelques points de terminaison explicitement exclus : l'image d'avatar de persona servie à l'éditeur d'embeds, la vérification « should show » de l'assistant de configuration, et le signal de consultation de page du tableau de bord.

## Lire la page

Ouvrez **Journal d'audit** sous Security dans le tableau de bord. La liste affiche les entrées les plus récentes en premier, cinquante par page, avec les boutons **Précédent** et **Suivant** et le nombre total d'entrées.

Deux filtres se trouvent au-dessus de la liste :

| Filtre | Ce qu'il fait |
| --- | --- |
| **Action** | N'affiche que les entrées Viewed, Created, Updated, Deleted ou Accessed. |
| **Section** | N'affiche qu'une zone du tableau de bord. Les choix sont construits à partir des sections présentes dans les entrées actuellement chargées. |

**Actualiser** recharge la liste. Modifier un filtre renvoie à la première page.

Sur ordinateur, chaque entrée est une ligne avec un bouton **Détails** lorsqu'elle contient des données de modification. Sur téléphone, les entrées s'affichent sous forme de cartes avec un bouton **Afficher les détails**.

> [!EXAMPLE]
> Réglez le filtre **Action** sur Updated et **Section** sur Protection pour voir chaque fois qu'une personne a modifié un système de protection, puis développez une ligne pour voir quels champs ont changé et de quelle valeur à quelle valeur.

## Conservation

Les entrées sont conservées pendant **quatre-vingt-dix jours**. Une tâche de nettoyage s'exécute une fois par jour, cinq minutes après le démarrage du bot, et supprime tout ce qui est plus ancien. Il n'existe aucune exportation ; si vous avez besoin d'un historique au-delà de cette période, sauvegardez-le avant qu'il n'expire.

## Qui peut le consulter

La page n'est accessible qu'aux personnes qui peuvent se connecter au tableau de bord et sont membres de votre serveur. Le propriétaire du serveur et toute personne disposant de la permission Administrateur peuvent toujours l'ouvrir. Les autres ont besoin au minimum de l'accès **Voir** à la section **Journal d'audit** sous Dashboard Access, accordé par utilisateur ou par rôle.

> [!PERMISSION]
> Comme l'utilisateur est tiré du jeton de connexion au tableau de bord, personne ne peut faire apparaître une entrée au nom d'une autre personne.

## Astuces et pièges

- Le filtre de section ne liste que les sections présentes sur la page que vous consultez. Si une section manque dans la liste déroulante, elle existe peut-être sur les pages suivantes : effacez le filtre d'action et parcourez les pages, ou filtrez d'abord par action.
- Les horodatages s'affichent dans le fuseau horaire du navigateur qui consulte la page, et non dans le fuseau horaire du serveur défini dans les paramètres d'administration.
- Une entrée « Created » signifie qu'une requête POST a été envoyée, ce que le tableau de bord utilise aussi pour certains interrupteurs et mises à jour. Lisez la ligne d'endpoint et les détails pour savoir ce qui s'est réellement passé.
- Les entrées dont les détails n'affichent que des valeurs sans ancienne valeur proviennent d'une section qui n'enregistre pas son état précédent. Vous voyez ce qui a été envoyé, mais pas ce que cela a remplacé.
- Le journal est propre à chaque serveur. Changer de serveur dans le tableau de bord change aussi de journal.

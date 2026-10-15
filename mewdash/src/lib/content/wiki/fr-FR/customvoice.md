---
title: Salon vocal personnalisé
slug: customvoice
summary: Un hub « rejoindre pour créer » qui donne à chaque membre son propre salon vocal temporaire, avec des contrôles de renommage, de limite d'utilisateurs, de débit, de verrouillage, d'autorisation et de refus, et un nettoyage automatique lorsqu'il se vide.
icon: fa-microphone
category: Entertainment
dashboard: /dashboard/customvoice
module: CustomVoice
tags: [custom voice, temporary voice, join to create, voice hub, private voice, voice channels, lock, bitrate, user limit, salon vocal personnalisé, salon vocal temporaire, rejoindre pour créer, hub vocal, salon vocal privé, salons vocaux, verrouillage, débit, limite d'utilisateurs]
related: [administration, statchannels]
---

## Ce qu'il fait

Le personnel définit un salon vocal comme hub. Lorsqu'un membre le rejoint, le bot crée pour lui un nouveau salon vocal, nommé d'après un modèle, le place dans la catégorie configurée et l'y déplace. Ce membre en est le propriétaire : il peut le renommer, définir une limite d'utilisateurs et un débit, le verrouiller pour que seuls les membres autorisés puissent le rejoindre, autoriser ou refuser des personnes précises, le maintenir en vie ou le transmettre à quelqu'un d'autre.

Lorsque le dernier humain quitte le salon, celui-ci est supprimé après un court délai, sauf si le propriétaire a activé le maintien en vie. Si le propriétaire part et qu'une autre personne est toujours présente, celle-ci peut le revendiquer.

Les membres peuvent enregistrer des préférences pour leurs salons : chaque salon qu'ils créent démarre ainsi avec le nom, la limite, le débit, l'état de verrouillage et le réglage de maintien en vie qu'ils ont choisis. Le personnel décide des personnalisations que les membres peuvent utiliser, fixe des plafonds pour la limite et le débit, et peut désigner un rôle administrateur autorisé à gérer n'importe quel salon personnalisé.

## Pourquoi l'utiliser

- Plus besoin de maintenir une série de salons « Gaming 1 » à « Gaming 8 » : les membres en créent un lorsqu'ils en ont besoin, et il disparaît ensuite.
- Les membres qui veulent un appel privé verrouillent leur salon et n'autorisent que leurs amis.
- Les streamers et les organisateurs d'événements maintiennent un salon en vie afin qu'il subsiste pendant leur absence.
- Les modérateurs disposant du rôle administrateur peuvent renommer, verrouiller ou transmettre n'importe quel salon sans avoir la permission Gérer les salons sur tout le serveur.

## Le hub

`setupvoicehub` crée un salon vocal nommé « Create Voice Channel » dans une nouvelle catégorie « Custom Voice Channels », permet à tout le monde de s'y connecter sans parler, et l'enregistre comme hub. `setvoicehub #channel [category]` utilise un salon existant. La section **Configuration de base** du tableau de bord fait la même chose avec un sélecteur de salon et de catégorie.

Si **Autoriser plusieurs salons par utilisateur** est désactivé (par défaut), rejoindre le hub alors que vous possédez déjà un salon supprime l'ancien avant de créer le nouveau.

## Nommage des salons

Le **Format de nom par défaut** est un modèle. Le bot remplace `{0}` par le nom d'utilisateur du membre, `{1}` par son discriminant et `{2}` par le nom du serveur. La valeur par défaut est `{0}'s Channel`. Le nom est tronqué pour respecter les limites de Discord.

> [!NOTE]
> Le texte indicatif du tableau de bord affiche `{username}'s Channel`, mais le bot ne remplace que `{0}`, `{1}` et `{2}`. Utilisez la forme numérotée.

## Contrôles du propriétaire

`voicecontrols` publie un panneau pour le salon dans lequel vous vous trouvez. Il affiche le nom actuel, la limite, le débit, l'état de verrouillage et de maintien en vie, ainsi que les personnes présentes, avec les boutons **Renommer**, **Limite**, **Débit**, **Verrouiller**/**Déverrouiller**, le maintien en vie, **Transférer** et un sélecteur de membres pour gérer les personnes présentes. Les boutons correspondant à des personnalisations désactivées sur le serveur sont grisés.

Les mêmes actions existent sous forme de commandes. Chacune vérifie que vous êtes dans un salon personnalisé, que vous en êtes le propriétaire ou que vous disposez du rôle administrateur, et que le serveur autorise cette personnalisation :

| Action | Commande | Ce qu'elle fait |
| --- | --- | --- |
| Renommer | `voicerename <name>` | Renomme le salon, si **Autoriser la personnalisation du nom** est activé |
| Limite d'utilisateurs | `voicelimit <n>` | Définit la limite, plafonnée par la limite maximale du serveur |
| Débit | `voicebitrate <kbps>` | Définit le débit, plafonné par le débit maximal du serveur |
| Verrouillage | `voicelock [true/false]`, `voiceunlock` | Verrouiller interdit la connexion à tous sauf aux membres autorisés, au propriétaire et au rôle administrateur |
| Autoriser | `voiceallow @user` | Accorde la connexion à un membre même lorsque le salon est verrouillé |
| Refuser | `voicedeny @user` | Retire la connexion à un membre et le déconnecte s'il est présent |
| Maintien en vie | `voicekeepalive [true/false]` | Empêche le nettoyage des salons vides pour ce salon |
| Transfert | `voicetransfer @user` | Fait d'un autre membre le propriétaire et lui transfère les autorisations de gestion |
| Revendication | `voiceclaim` | Tout membre présent peut prendre la propriété lorsque le propriétaire n'est pas dans le salon |

Lorsque **Gérer automatiquement les autorisations du salon** est activé, le propriétaire obtient les permissions Se connecter, Parler, Gérer le salon, Déplacer des membres, Couper le micro des membres et Assourdir les membres sur son salon ; les membres autorisés et refusés reçoivent les surcharges correspondantes, et le rôle administrateur obtient un accès de gestion.

## Nettoyage

Lorsque **Supprimer les salons vides** est activé (par défaut), un salon sans humain est programmé pour suppression après le délai de salon vide. Rejoindre à nouveau avant la fin du délai annule la suppression. Les salons marqués en maintien en vie ne sont jamais supprimés automatiquement. Un balayage en arrière-plan toutes les cinq minutes supprime aussi les salons vides depuis plus longtemps que le délai, et le bouton **Nettoyer les salons inactifs** du tableau de bord supprime les salons inactifs depuis un nombre d'heures que vous choisissez.

## Préférences des membres

`voicepreferences` affiche vos préférences enregistrées de format de nom, de limite d'utilisateurs, de débit, de verrouillage et de maintien en vie. Chaque commande `voiceprefs...` en définit une ; l'exécuter sans valeur la vide, et `voiceprefsreset` les vide toutes. Les préférences ne s'appliquent que lorsque **Mémoriser les préférences des utilisateurs** est activé, et la limite et le débit restent plafonnés par les maximums du serveur. Le personnel peut consulter et modifier les préférences de n'importe quel membre depuis l'onglet **Préférences utilisateur**, à partir de son identifiant d'utilisateur.

## Paramètres

Le tableau de bord comporte trois onglets : **Configuration**, **Salons actifs** et **Préférences utilisateur**. **Configuration** est divisée en **Configuration de base**, **Valeurs par défaut des salons** et **Gestion des salons**. `voiceconfig` sans argument affiche toutes les valeurs ; `voiceconfig <setting> <value>` en modifie une.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Salon hub | aucun | Le salon « rejoindre pour créer » |
| Catégorie | aucune | Où les nouveaux salons sont créés |
| Format de nom par défaut | `{0}'s Channel` | Modèle des noms des nouveaux salons (`nameformat`) |
| Limite d'utilisateurs par défaut | 0 (illimité) | Limite initiale d'utilisateurs (`userlimit`) |
| Débit par défaut | 64 kbps | Débit initial (`bitrate`) |
| Supprimer les salons vides | Activé | Supprime les salons sans personne (`deleteempty`) |
| Délai de salon vide | 1 | Délai avant suppression d'un salon vide (`emptytimeout`) ; le tableau de bord l'affiche en secondes et accepte de 5 à 300 |
| Autoriser plusieurs salons par utilisateur | Désactivé | Permet à un membre de posséder plusieurs salons (`multiplechannels`) |
| Mémoriser les préférences des utilisateurs | Activé | Applique les préférences enregistrées des membres (`persistpreferences`) |
| Gérer automatiquement les autorisations du salon | Activé | Définit les surcharges pour le propriétaire, les membres autorisés, refusés et l'administrateur (`autopermission`) |
| Autoriser la personnalisation du nom | Activé | `namechange` |
| Autoriser la personnalisation de la limite d'utilisateurs | Activé | `limitchange` |
| Autoriser la personnalisation du débit | Activé | `bitratechange` |
| Autoriser le verrouillage des salons | Activé | `locking` |
| Autoriser la gestion des utilisateurs | Activé | Commandes d'autorisation et de refus (`usermanagement`) |
| Limite maximale d'utilisateurs | 99 | Plafond des limites définies par les membres (`maxuserlimit`) |
| Débit maximal | 96 kbps | Plafond des débits définis par les membres, également limité par le palier de boost du serveur (`maxbitrate`) |
| Rôle administrateur | aucun | Rôle autorisé à gérer n'importe quel salon personnalisé (`adminrole`) |

**Limite maximale d'utilisateurs**, **Débit maximal** et **Rôle administrateur** n'ont pas de contrôle dans le tableau de bord ; définissez-les avec `voiceconfig`.

L'onglet **Salons actifs** liste chaque salon personnalisé en cours avec son propriétaire, son état de verrouillage et de maintien en vie, permet de verrouiller, déverrouiller ou supprimer un salon, et affiche les totaux des salons créés, actifs dans la dernière heure, verrouillés et maintenus en vie. Il contient également le bouton **Nettoyer les salons inactifs** et un bouton **Désactiver le salon vocal personnalisé** qui désactive le module pour le serveur.

## Pas à pas de configuration

1. Donnez au bot les permissions Gérer les salons, Déplacer des membres et Gérer les rôles (pour écrire les surcharges de permissions) dans la catégorie que vous utiliserez.
2. Exécutez `setupvoicehub`, ou ouvrez **Salon vocal personnalisé** dans le tableau de bord et choisissez un salon hub et une catégorie existants dans **Configuration de base**.
3. Définissez **Format de nom par défaut**, **Limite d'utilisateurs par défaut** et **Débit par défaut** dans **Valeurs par défaut des salons**.
4. Dans **Gestion des salons**, désactivez les personnalisations que vous ne voulez pas accorder aux membres.
5. Définissez un **Rôle administrateur** avec `voiceconfig adminrole @Moderators` pour que le personnel puisse gérer les salons qu'il ne possède pas.
6. Rejoignez vous-même le hub, exécutez `voicecontrols`, et essayez de renommer et verrouiller le salon.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `setupvoicehub` | `svh`, `createvoicehub`, `voicesetup` | Gérer les salons | Créer un salon hub et une catégorie |
| `setvoicehub <#channel> [category]` | `sethub`, `voicehub` | Gérer les salons | Utiliser un salon existant comme hub |
| `voiceconfig [setting] [value]` | `vcconfig`, `voicesettings`, `vcsettings`, `customvoiceconfig` | Gérer les salons | Afficher ou modifier les paramètres du serveur |
| `voicecontrols` | `vcontrols` | Propriétaire ou rôle administrateur | Panneau de contrôle interactif de votre salon |
| `voicechannels` | `vchannels`, `listvoice`, `customvoices`, `voicelist` | Personne | Lister les salons personnalisés actifs |
| `voicerename <name>` | `vrename`, `renamevoice`, `vcname`, `vcrename` | Propriétaire ou rôle administrateur | Renommer votre salon |
| `voicelimit <number>` | `vclimit`, `limitvoice`, `vlimit`, `setlimit` | Propriétaire ou rôle administrateur | Définir la limite d'utilisateurs |
| `voicebitrate <kbps>` | `vcbitrate`, `vbitrate`, `setbitrate` | Propriétaire ou rôle administrateur | Définir le débit |
| `voicelock [true/false]` | `vclock`, `lockvoice`, `vlock`, `lockvc` | Propriétaire ou rôle administrateur | Verrouiller ou déverrouiller |
| `voiceunlock` | `vcunlock`, `unlockvoice`, `vunlock`, `unlockvc` | Propriétaire ou rôle administrateur | Déverrouiller |
| `voiceallow @user` | `vcallow`, `allowuser`, `vallow`, `adduser` | Propriétaire ou rôle administrateur | Permettre à un membre de rejoindre un salon verrouillé |
| `voicedeny @user` | `vcdeny`, `denyuser`, `vdeny`, `removeuser` | Propriétaire ou rôle administrateur | Bloquer un membre et le déconnecter |
| `voiceclaim` | `vcclaim`, `claimvoice`, `vclaim`, `takeover` | Personne | Prendre un salon dont le propriétaire est parti |
| `voicetransfer @user` | `vctransfer`, `transfervoice`, `vtransfer`, `givevc` | Propriétaire ou rôle administrateur | Donner le salon à quelqu'un d'autre |
| `voicekeepalive [true/false]` | `vckeepalive`, `keepvoice`, `vkeep`, `persist` | Propriétaire ou rôle administrateur | Exclure le salon du nettoyage |
| `voicepreferences` | `vcprefs`, `voiceprefs`, `vprefs`, `myvoice` | Personne | Afficher vos préférences enregistrées |
| `voiceprefsname [format]` | `vcprefsname`, `vpname`, `prefname`, `namepref` | Personne | Format de nom préféré ; vide pour effacer |
| `voiceprefslimit [number]` | `vcprefslimit`, `vplimit`, `preflimit`, `limitpref` | Personne | Limite d'utilisateurs préférée |
| `voiceprefsbitrate [kbps]` | `vcprefsbitrate`, `vpbitrate`, `prefbitrate`, `bitratepref` | Personne | Débit préféré |
| `voiceprefslock [true/false]` | `vprefslock` | Personne | Créer les salons verrouillés |
| `voiceprefskeepalive [true/false]` | `vcprefskeepalive`, `vpkeepalive`, `prefkeepalive`, `keeppref` | Personne | Créer les salons avec maintien en vie |
| `voiceprefsreset` | `vcprefsreset`, `vprefsreset`, `resetprefs`, `clearprefs` | Personne | Effacer toutes les préférences |

## Astuces et pièges

- Le bot a besoin de la permission Gérer les salons dans la catégorie, de Déplacer des membres pour placer le créateur dans le nouveau salon, et de Gérer les rôles pour écrire les surcharges de permissions.
- Le débit maximal est limité par ce que le palier de boost du serveur autorise : un réglage à 384 sur un serveur sans boost est donc réduit automatiquement.
- Le verrouillage interdit la connexion pour le rôle everyone. Les membres disposant de la permission Administrateur, ou d'un rôle ayant déjà une autorisation de connexion explicite, peuvent toujours rejoindre le salon.
- Le minuteur de salon vide, qui se déclenche lorsque le dernier membre part, traite la valeur du délai en secondes, alors que l'affichage de la configuration et le balayage de cinq minutes la traitent en minutes. Avec la valeur par défaut de 1, le salon disparaît presque immédiatement une fois vide.
- Les salons en maintien en vie ne sont jamais nettoyés automatiquement. Utilisez l'onglet **Salons actifs** ou `voicechannels` pour retrouver ceux qui ont été oubliés.
- La revendication ne fonctionne que lorsque le propriétaire d'origine n'est pas connecté au salon.

---
title: Nintendo Switch
slug: switch
summary: Consultez les codes d'erreur de la Nintendo Switch, convertissez-les entre décimal et hexadécimal, recherchez dans le wiki switchbrew.org, et obtenez une analyse lisible d'un fichier journal Ryujinx.
icon: fa-gamepad-modern
category: Entertainment
module: Switch
tags: [switch, nintendo, error code, ryujinx, emulator, log, switchbrew, homebrew, hex, code d'erreur, émulateur, journal, hexadécimal]
related: [userprofile, help]
---

## Fonctionnement

Le module Switch est une boîte à outils d'assistance pour les serveurs consacrés au homebrew et à l'émulation sur Nintendo Switch. Lorsqu'une personne publie une erreur comme `2168-0002`, un bénévole exécute `err 2168-0002` et le bot répond en indiquant le module auquel appartient l'erreur, ce qu'on sait à son sujet, ainsi qu'un lien vers la page d'assistance de Nintendo lorsqu'elle existe.

Deux petits convertisseurs transforment la forme `NNNN-NNNN` en valeur hexadécimale brute utilisée dans le code, et inversement. `switchbrew` recherche dans le wiki switchbrew.org afin que les membres puissent trouver les pages sur les SVC, les codes de résultat ou le matériel sans quitter Discord.

La fonctionnalité principale est l'analyseur de journaux Ryujinx. Un utilisateur joint son fichier `Ryujinx.log`, quelqu'un exécute `analyselog` dessus ou en réponse à ce message, et le bot produit un embed indiquant le jeu, la version de l'émulateur, le matériel, chaque paramètre pertinent, la dernière erreur, les mods et les cheats installés, ainsi qu'une liste de remarques signalant les erreurs de configuration courantes.

Rien ne nécessite de configuration et rien n'est stocké. Toutes les commandes sont accessibles à tous.

## Pourquoi l'utiliser

- Un salon d'assistance reçoit chaque jour la même question sur la signification de 2811-5001.
- Le dépannage de Ryujinx commence par la lecture du journal, et la plupart des utilisateurs ne savent pas quoi y chercher.
- Les développeurs ont besoin de la forme hexadécimale d'une erreur pour la rechercher dans le code source.
- Chacun peut afficher une page de switchbrew.org depuis Discord.

## Recherche de codes d'erreur

`err <code>` accepte l'une ou l'autre des formes suivantes :

- `NNNN-NNNN`, où le premier groupe commence par 2 (par exemple `2168-0002`). Le numéro de module correspond au premier groupe moins 2000, et la description correspond au second groupe.
- Une valeur hexadécimale avec le préfixe `0x`, par exemple `0x2A2`. Les neuf bits de poids faible désignent le module, et le reste correspond à la description.

La réponse affiche le code sous ses deux formes, le nom et le numéro du module, le numéro de description et une explication. L'explication est recherchée dans cet ordre : une description connue pour ce code exact, une page d'assistance Nintendo pour ce code exact, une description pour la plage à laquelle appartient le code dans son module, et sinon « unknown ». Les codes connus s'affichent avec la couleur normale, les codes inconnus avec la couleur d'erreur.

Certains codes ne suivent pas le modèle, comme `2-AAB6A-3400`. Ceux-ci sont comparés exactement à une courte liste et signalés avec le jeu auquel ils appartiennent.

`err2hex <NNNN-NNNN>` affiche la valeur hexadécimale. `hex2err <hex>` affiche la forme avec tiret ; le préfixe `0x` est facultatif.

## Recherche sur Switchbrew

`switchbrew <query>` interroge l'API de recherche du wiki et renvoie les cinq premiers résultats, chacun avec un lien et un extrait de 200 caractères au maximum. `svc` est un alias, de sorte que `svc SetThreadPriority` se lit naturellement.

## Analyse des journaux Ryujinx

`analyselog` recherche une pièce jointe `.log` ou `.txt` dans votre message. S'il n'y en a aucune et que votre message est une réponse, la commande utilise la pièce jointe du message auquel vous répondez, et crédite cet auteur dans le pied de page. L'embed porte pour titre le nom du jeu et contient :

| Champ | Contenu |
| --- | --- |
| General Info | Version de Ryujinx, firmware, CPU, GPU, RAM, système d'exploitation |
| System Settings | Backend audio, mode docké ou portable, PPTC, cache de shaders, VSync, hyperviseur (macOS uniquement) |
| Graphics Settings | Backend graphique, échelle de résolution, filtrage anisotrope, ratio d'aspect, recompression des textures |
| Errors | Le dernier bloc d'erreur du journal, ou « no errors » |
| Mods | Chaque mod avec ExeFS ou RomFS, tronqué avec un décompte s'il y en a beaucoup |
| Cheats | Chaque cheat, tronqué de la même manière |
| Notes | Problèmes détectés et conseils |

Les notes couvrent notamment une collision ou une corruption du cache de shaders, un mauvais hash de dump, des clés obsolètes, un firmware manquant, des erreurs de permissions de fichiers, une sauvegarde absente, des services manquants, Vulkan à court de mémoire, le profil utilisateur par défaut, l'absence de manette configurée, un GPU Intel ou AMD qui devrait utiliser Vulkan, Rosetta sur Apple silicon, le backend audio factice, le PPTC ou le cache de shaders désactivés, la RAM étendue, le gestionnaire de mémoire logiciel, l'option ignorer les services manquants, VSync désactivé, les vérifications d'intégrité du système de fichiers désactivées, le threading du backend désactivé, et les builds personnalisés. Chaque note comporte un marqueur de gravité, de l'information jusqu'au critique.

Si le fichier ne peut pas être téléchargé ou n'est pas un journal Ryujinx, le bot indique que le journal est invalide.

## Paramètres

Ce module n'a ni paramètres ni page dans le tableau de bord.

## Guide de configuration

1. Assurez-vous que le bot peut lire l'historique des messages et joindre des fichiers dans votre salon d'assistance.
2. Demandez aux utilisateurs de joindre directement leur `Ryujinx.log` à un message.
3. Un bénévole répond à ce message avec `analyselog`.
4. Pour les codes d'erreur, exécutez `err <code>` et partagez le lien d'assistance s'il est affiché.
5. Vous pouvez éventuellement ajouter un déclencheur de chat ou un message épinglé rappelant ces deux commandes.

## Commandes

Exécutez ces commandes avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Permission requise | Rôle |
| --- | --- | --- | --- |
| `err <code>` | `nxerr`, `serr` | Aucune | Explique un code d'erreur Switch, sous forme avec tiret ou hexadécimale |
| `err2hex <NNNN-NNNN>` | `e2h` | Aucune | Convertit un code avec tiret en hexadécimal |
| `hex2err <hex>` | `h2e` | Aucune | Convertit un hexadécimal en forme avec tiret |
| `switchbrew <query>` | `sb`, `svc` | Aucune | Recherche sur switchbrew.org |
| `analyselog` | `analyzelog`, `analyselogs`, `analyzelogs`, `analyze`, `analyse` | Aucune | Analyse un journal Ryujinx joint |

## Conseils et pièges

- La forme avec tiret doit comporter exactement quatre chiffres, un tiret, quatre chiffres, et commencer par 2. Les codes contenant des lettres passent uniquement par la liste des cas particuliers.
- Les journaux doivent être joints en tant que `.log` ou `.txt` ; un journal collé dans un bloc de code n'est pas lu.
- L'analyseur lit le fichier en entier ; demandez donc aux utilisateurs le journal de la session où le problème est survenu, et non celui d'un lancement récent.
- La recherche sur switchbrew.org est une requête en direct ; si le site est lent, la commande le sera aussi.
- Les membres peuvent enregistrer leur code ami Switch sur leur profil avec `setswitchfc`, fonctionnalité du module User Profile.

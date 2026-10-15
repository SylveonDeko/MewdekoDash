---
title: Musique
slug: music
summary: Lisez de la musique depuis YouTube, Spotify et SoundCloud, ou recherchez-la, dans un salon vocal, avec une file d'attente, des playlists enregistrées, des filtres audio, un rôle DJ, la synthèse vocale et la synchronisation Last.fm.
icon: fa-music
category: Entertainment
dashboard: /dashboard/music
module: Music
tags: [music, play, queue, playlist, spotify, youtube, soundcloud, volume, skip, loop, repeat, dj role, filters, bass boost, nightcore, tts, text to speech, lastfm, scrobble, music links, musique, lecture, file d'attente, playlist, volume, passer, boucle, répétition, rôle dj, filtres, booster les basses, nightcore, tts, synthèse vocale, lastfm, scrobble, liens musicaux]
related: [utility, administration]
---

## Ce qu'il fait

Un membre rejoint un salon vocal et exécute `play` avec un lien ou une recherche. Le bot rejoint le salon, ajoute le titre à la file d'attente et lance la lecture. Les liens YouTube, YouTube Music, SoundCloud et Spotify sont résolus directement ; les titres, albums et playlists Spotify sont associés à leur équivalent sur YouTube. Une recherche simple affiche jusqu'à 25 résultats dans un menu de sélection, pour que le membre choisisse celui qu'il voulait.

Tous les membres du salon partagent une seule file d'attente. Ils peuvent la consulter, aller directement à une entrée, déplacer ou retirer des titres, mélanger, répéter un titre ou toute la file, et enregistrer la file sous forme de playlist nommée pour la recharger plus tard. Le passage au titre suivant est instantané pour les membres ayant le rôle DJ, et soumis à un vote pour les autres.

Le personnel choisit un salon musical où s'affichent les notifications de lecture en cours et de file vide, définit le rôle DJ, le volume par défaut et le mode de répétition, et peut activer des filtres audio comme le boost de basses ou le nightcore. Le tableau de bord affiche le lecteur en direct avec la file, les boutons de répétition et les interrupteurs de filtres, et ce même flux en direct alimente l'application mobile.

Deux fonctionnalités supplémentaires se trouvent dans le même module. La synthèse vocale lit à voix haute les messages du chat dans un salon vocal, avec une voix par utilisateur et une liste de blocage. Last.fm permet aux membres d'envoyer à leur compte (scrobbling) ce que le bot joue et d'utiliser des commandes de type `fm` sur leur écoute.

## Pourquoi l'utiliser

- Un salon vocal de détente a besoin d'une musique de fond à laquelle chacun peut ajouter des titres, sans qu'une seule personne ne fasse le DJ toute la soirée.
- Le personnel veut un rôle DJ pour que seuls les membres de confiance puissent passer un titre immédiatement, tandis que les autres votent.
- Une communauté conserve quelques playlists maison chargées au début de chaque événement.
- Un salon vocal compte des membres qui ne peuvent pas parler et souhaitent que leurs messages soient lus à voix haute.
- Les passionnés de musique veulent un espace commun pour comparer leurs statistiques Last.fm et consulter les classements « qui connaît cet artiste ».

## Lecture et file d'attente

Vous devez être dans un salon vocal pour presque toutes les commandes musicales. Si le bot joue déjà dans un autre salon, les commandes envoyées depuis un autre salon sont refusées.

`play <link or search>` accepte :

| Entrée | Ce qui se passe |
| --- | --- |
| Lien YouTube ou YouTube Music | Chargé directement, playlists comprises |
| Lien SoundCloud | Chargé directement |
| Lien de titre Spotify | Associé à un titre YouTube |
| Lien d'album ou de playlist Spotify | Chaque entrée est associée à YouTube et ajoutée à la file au fur et à mesure, avec un message de progression |
| Tout le reste | Recherche sur YouTube, jusqu'à 25 résultats dans un menu de sélection |

`play <number>` passe directement à cette position de la file. `search <query>` affiche dix résultats sans rien ajouter à la file. `queue` affiche une vue paginée, cinq éléments par page, avec un menu de sélection pour les options de chaque titre. `nowplaying` affiche le titre en cours avec son demandeur et son fournisseur.

`songremove <number>` retire une entrée, `movesong <from> <to>` la réordonne, `shuffle` mélange tout ce qui suit le titre en cours, et `clearqueue` vide la file et arrête la lecture. `seek mm:ss` se déplace dans le titre en cours. `volume 0..100` règle le volume et l'enregistre comme valeur par défaut du serveur.

`loop <type>` définit la répétition : `none` (aussi `off`), `track` (aussi `song`) ou `queue` (aussi `all`). Lorsque la file se termine sans répétition, le bot publie une notification de file vide dans le salon musical.

### Passer un titre et rôle DJ

`skip` termine immédiatement le titre en cours, pour la personne qui l'exécute. `voteskip` comptabilise les votes : un membre ayant le rôle DJ ou la permission Administrateur passe le titre tout de suite, tous les autres ajoutent une voix, et le titre est passé lorsque les votes atteignent 70 % des membres non-bots présents dans le salon vocal.

Définissez le rôle DJ avec `setdjrole @role` ou avec le sélecteur **Rôle DJ** du tableau de bord. Exécutez `setdjrole` sans rôle pour le retirer.

### Lecture automatique

`autoplay <0..5>` fait ajouter au bot ce nombre de titres similaires lorsque la file se vide, à partir des recommandations Spotify. 0 la désactive. Cette fonction dépend de l'existence d'identifiants Spotify configurés ; sans eux, la lecture automatique ne fait rien.

## Playlists

`saveplaylist <name>` enregistre la file d'attente actuelle sous un nom, par serveur, avec vous comme auteur. `loadplaylist <name> [true]` ajoute la playlist à la file, ou remplace la file si vous passez `true`, et démarre la lecture si rien ne joue. Les titres sont à nouveau résolus sur YouTube au chargement, donc les entrées qui n'existent plus sont ignorées silencieusement. `playlists` les affiche avec le nombre de titres et leurs auteurs, et `deleteplaylist <name>` en supprime une.

## Filtres audio

Les filtres s'appliquent au lecteur en cours et sont réinitialisés lorsque celui-ci se déconnecte.

| Commande | Effet |
| --- | --- |
| `bass <0..1>` | Renforce les basses fréquences ; 0 le désactive |
| `nightcore [on/off]` | Plus rapide et à hauteur plus aiguë |
| `vaporwave [on/off]` | Plus lent et à hauteur plus grave |
| `karaoke [on/off]` | Atténue les voix centrées |
| `tremolo [on/off]` | Oscillation du volume |
| `vibrato [on/off]` | Oscillation de la hauteur |
| `eightd [on/off]` | Fait tourner le son autour de l'auditeur |
| `distortion [on/off]` | Distorsion |
| `stereowiden [on/off]` | Élargit l'image stéréo |

`activefilters` liste les filtres actifs et `resetfilters` les désactive tous. La carte **Lecture en cours** du tableau de bord comporte des boutons à bascule pour le boost de basses, le nightcore, le vaporwave, le karaoké, le trémolo, le vibrato, la rotation 8D et la distorsion.

## Conversion des liens musicaux

Dans les salons où elle est activée, lorsqu'un lien Apple Music, Spotify, YouTube Music, YouTube, Amazon Music, Deezer, Tidal, Pandora ou SoundCloud est publié, le bot répond par un embed contenant le titre, l'artiste et la pochette, ainsi que des liens vers le même titre chez les autres fournisseurs. Activez ou désactivez un salon avec `musiclinkchannel [#channel]` (Gérer le serveur) et listez-les avec `musiclinkchannels`. Sur le tableau de bord, cette option se trouve dans la section **Conversion des liens musicaux** de l'onglet Paramètres musicaux.

## Synthèse vocale

La synthèse vocale lit les messages à voix haute dans un salon vocal où se trouve le bot. Le personnel l'active salon par salon ; les messages des membres de ce salon vocal, écrits dans son chat textuel ou dans un salon textuel lié, sont mis en file d'attente puis lus. La musique baisse à 15 % pendant la lecture d'un message, puis remonte. La file contient 10 messages par défaut.

Les membres choisissent leur propre voix avec `ttsvoice <name>` et la parcourent avec `ttsvoices [search]`. Le personnel définit une voix par défaut, la vitesse (0,5 à 3,0 sur le tableau de bord, 0,5 à 2,0 par commande), le volume, un rôle requis, des annonces d'arrivée et de départ avec leurs propres formats, et peut bloquer des utilisateurs individuellement. L'onglet **Paramètres TTS** du tableau de bord propose les mêmes réglages, répartis entre **Paramètres TTS généraux**, **Comportement TTS**, **TTS des salons vocaux** et **Utilisateurs TTS bloqués**.

## Last.fm

Les membres lient un compte Last.fm depuis la page `/me` du tableau de bord (`lastfmlink` affiche le bouton). Une fois lié, chaque titre joué par le bot pendant au moins 30 secondes est envoyé à leur compte ; `lastfmtoggle` met cette synchronisation en pause et `lastfmstatus` affiche son état. La famille de commandes `fm` fonctionne ensuite pour tous les membres disposant d'un compte lié : titres récents, artistes et albums et titres les plus écoutés par période, recherches d'artiste et d'album, classements « qui connaît » à l'échelle du serveur, couronnes, comparaison de goûts et graphiques en mosaïque de pochettes.

## Paramètres

La page du tableau de bord comporte deux onglets, **Paramètres musicaux** et **Paramètres TTS**. L'onglet Musique affiche aussi une carte **Lecture en cours** avec la taille de la file, les boutons mélanger et vider, les boutons de mode de répétition et les interrupteurs de filtres lorsque le bot joue.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Volume par défaut | 100 | Volume initial, de 0 à 100 ; `volume` l'enregistre aussi ici |
| Salon musical | Tous les salons | Où sont publiées les notifications de lecture et de file |
| Rôle DJ | Aucun rôle DJ | Rôle qui passe les titres immédiatement et contourne le vote |
| Mode de répétition | Aucun | Aucun, Titre unique ou File d'attente |
| Déconnexion automatique | Jamais | Jamais, Quand le salon vocal est vide, Quand la file est vide ou L'une des deux conditions |
| Lecture automatique de titres similaires | Désactivé | Ajoute des titres similaires lorsque la file se vide ; la commande accepte un nombre allant jusqu'à 5 |
| Activer le vote pour passer | désactivé | Affiche le seuil de vote dans le pied du lecteur |
| Seuil de vote pour passer | pourcentage, de 1 à 100 | Valeur affichée ; la commande `voteskip` exige toujours 70 % |
| Salons de liens musicaux | aucun | Salons où les liens musicaux reçoivent un embed multi-fournisseurs |
| Volume TTS | 100 | Intensité des messages lus |
| Vitesse TTS | 1.0 | De 0,5 à 3,0 |
| Taille maximale de la file | 10 | Messages TTS en attente, de 1 à 50 |
| Voix par défaut | celle du fournisseur | Voix utilisée lorsqu'un membre n'en a pas choisi |
| Rôle requis | Aucun rôle requis | Seuls les membres ayant ce rôle peuvent utiliser le TTS ; les administrateurs le peuvent toujours |
| Contexte de réponse | désactivé | Lit « en réponse à l'utilisateur » avant les réponses |
| Narration des pièces jointes | désactivé | Annonce les images, vidéos et fichiers envoyés |
| Regroupement des messages consécutifs | désactivé | Omet le nom lorsque le même membre envoie plusieurs messages à la suite |
| TTS des salons vocaux | aucun | Par salon vocal : activé, salon textuel lié, annonces d'arrivée et de départ et leurs formats |
| Utilisateurs TTS bloqués | aucun | Membres dont les messages ne sont jamais lus |

> [!NOTE]
> Le mode de répétition défini sur le tableau de bord s'applique à partir du lecteur suivant. `loop` modifie immédiatement le lecteur en cours.

## Pas à pas de configuration

1. Assurez-vous que le bot dispose des permissions Se connecter et Parler dans les salons vocaux qu'il doit utiliser.
2. Ouvrez **Musique** dans le tableau de bord. Définissez un **Salon musical** pour que les embeds de lecture en cours n'arrivent pas dans le chat général.
3. Choisissez un **Rôle DJ** pour les personnes autorisées à passer les titres librement.
4. Réglez le **Volume par défaut** autour de 50 ; 100 est très fort.
5. Rejoignez un salon vocal et exécutez `play never gonna give you up`, choisissez un résultat, puis `queue` et `nowplaying`.
6. Constituez une playlist maison en ajoutant des titres à la file, puis exécutez `saveplaylist chill`.
7. Si vous voulez la synthèse vocale, passez sur **Paramètres TTS**, ajoutez le salon vocal dans **TTS des salons vocaux**, et demandez aux membres de choisir une voix avec `ttsvoice`.

## Commandes

Exécutez-les avec le préfixe de votre serveur (`.` sauf si vous l'avez modifié).

| Commande | Alias | Nécessite | Rôle |
| --- | --- | --- | --- |
| `join` | `j`, `mv` | Personne | Rejoindre votre salon vocal |
| `leave` | `disconnect`, `d` | Personne | Quitter et vider la file |
| `play <link or search>` | `p`, `start` | Personne | Ajouter à la file et lire |
| `play <number>` | `p`, `start` | Personne | Passer à une position de la file |
| `search <query>` | `find` | Personne | Lister dix résultats sans lancer la lecture |
| `pause` | | Personne | Mettre en pause ou reprendre |
| `nowplaying` | `np` | Personne | Afficher le titre en cours |
| `queue` | `q`, `yq`, `enqueue` | Personne | Afficher la file |
| `skip` | `next`, `n` | Personne | Passer le titre en cours |
| `voteskip` | `vskip` | Personne | Voter pour passer, instantané avec le rôle DJ |
| `songremove <number>` | `trackremove`, `srm` | Personne | Retirer une entrée de la file |
| `movesong <from> <to>` | `ms`, `move` | Personne | Réordonner la file |
| `shuffle` | `playlistshuffle`, `sh`, `plsh` | Personne | Mélanger les titres à venir |
| `clearqueue` | `cq` | Personne | Vider la file et arrêter |
| `volume <0..100>` | `vol` | Personne | Régler et enregistrer le volume |
| `seek <mm:ss>` | | Personne | Se déplacer dans le titre en cours |
| `loop <none|track|queue>` | `queuerepeat`, `qrp`, `rpl` | Personne | Définir le mode de répétition |
| `autoplay <0..5>` | `ap` | Personne | Titres similaires lorsque la file se vide |
| `setdjrole [role]` | `djrole` | Gérer le serveur | Définir ou retirer le rôle DJ |
| `setmusicchannel [#channel]` | `smch` | Personne | Salon où sont publiées les notifications du lecteur |
| `musicsettings` | `msettings` | Personne | Afficher la lecture automatique, le volume, la répétition et le salon |
| `musiclinkchannel [#channel]` | | Gérer le serveur | Activer ou désactiver la conversion des liens dans un salon |
| `musiclinkchannels` | | Personne | Lister les salons de conversion de liens |
| `saveplaylist <name>` | `saveplist` | Personne | Enregistrer la file |
| `loadplaylist <name> [clear]` | `loadplist` | Personne | Charger une playlist, `true` pour remplacer la file |
| `playlists` | `playlistshow`, `plshow` | Personne | Lister les playlists enregistrées |
| `deleteplaylist <name>` | `delplist` | Personne | Supprimer une playlist |
| `bass [0..1]` | | Personne | Boost de basses |
| `nightcore [on/off]` | `nc` | Personne | Filtre nightcore |
| `vaporwave [on/off]` | `vw` | Personne | Filtre vaporwave |
| `karaoke [on/off]` | | Personne | Filtre karaoké |
| `tremolo [on/off]` | | Personne | Filtre trémolo |
| `vibrato [on/off]` | | Personne | Filtre vibrato |
| `eightd [on/off]` | `8d` | Personne | Filtre de rotation 8D |
| `distortion [on/off]` | | Personne | Filtre de distorsion |
| `stereowiden [on/off]` | `swiden` | Personne | Élargissement stéréo |
| `resetfilters` | `resetfx` | Personne | Désactiver tous les filtres |
| `activefilters` | `activefx` | Personne | Lister les filtres actifs |
| `lastfmlink` | `lflink` | Personne | Obtenir le bouton de liaison Last.fm |
| `lastfmunlink` | `lfunlink` | Personne | Supprimer votre liaison Last.fm |
| `lastfmtoggle` | `lftoggle` | Personne | Mettre en pause ou reprendre la synchronisation |
| `lastfmstatus` | `lfstatus` | Personne | Afficher l'état de votre liaison Last.fm |
| `fm [user]` | | Personne | Lecture en cours ou dernière écoute synchronisée |
| `fmrecent [user]` | `fmr` | Personne | Écoutes récentes |
| `fmtopartists [period] [user]` | `fmta` | Personne | Artistes les plus écoutés |
| `fmtopalbums [period] [user]` | `fmtal` | Personne | Albums les plus écoutés |
| `fmtoptracks [period] [user]` | `fmtt` | Personne | Titres les plus écoutés |
| `fmartist [artist]` | `fma` | Personne | Infos sur un artiste et vos écoutes |
| `fmalbum [query]` | `fmal` | Personne | Infos sur un album |
| `fmwhoknows [artist]` | `whoknows`, `wk` | Personne | Classement du serveur pour un artiste |
| `fmwhoknowsalbum <query>` | `whoknowsalbum`, `wka` | Personne | Classement du serveur pour un album |
| `fmwhoknowstrack <query>` | `whoknowstrack`, `wkt` | Personne | Classement du serveur pour un titre |
| `fmcrowns [artist]` | `crowns` | Personne | Couronnes d'un artiste |
| `fmtaste <user>` | `taste` | Personne | Comparer ses goûts avec quelqu'un |
| `fmchart [size] [period] [user]` | `chart` | Personne | Mosaïque de pochettes d'albums |
| `ttsenable` | `tts`, `ttson` | Gérer le serveur | Activer le TTS dans votre salon vocal |
| `ttsremove` | `ttsoff` | Gérer le serveur | Désactiver le TTS dans votre salon vocal |
| `ttslink [#channel]` | `ttschannel` | Gérer le serveur | Lier un salon textuel au salon vocal |
| `ttsannounce` | `ttsjoinleave` | Gérer le serveur | Activer ou désactiver les annonces d'arrivée et de départ |
| `ttsjoinformat [text]` | `ttsjoin` | Gérer le serveur | Texte de l'annonce d'arrivée |
| `ttsleaveformat [text]` | `ttsleave` | Gérer le serveur | Texte de l'annonce de départ |
| `ttsvolume <0..100>` | `ttsvol` | Gérer le serveur | Intensité du TTS |
| `ttsspeed <0.5..2>` | | Gérer le serveur | Vitesse du TTS |
| `ttsdefaultvoice [voice]` | `ttsdefvoice` | Gérer le serveur | Voix par défaut du serveur |
| `ttsvoice [voice]` | | Personne | Votre propre voix |
| `ttsvoices [search]` | `ttsvoicelist`, `ttsvoicesearch` | Personne | Parcourir les voix |
| `ttsblock <user>` | `ttsban` | Gérer le serveur | Activer ou désactiver le blocage TTS d'un membre |
| `ttsblocklist` | `ttsbanlist`, `ttsblocked` | Gérer le serveur | Lister les membres bloqués |
| `ttsrole [role]` | | Gérer le serveur | Exiger un rôle pour le TTS |
| `ttsreplycontext` | `ttsreply` | Gérer le serveur | Activer ou désactiver le contexte de réponse |
| `ttsattachmentnarration` | `ttsattach` | Gérer le serveur | Activer ou désactiver la narration des pièces jointes |
| `ttsconsecutivegrouping` | `ttsgroup` | Gérer le serveur | Activer ou désactiver l'omission du nom pour les messages consécutifs |
| `ttsmaxqueue <1..50>` | `ttsqueue` | Gérer le serveur | Limite de messages TTS en attente |
| `ttssettings` | `ttsinfo` | Gérer le serveur | Afficher les paramètres TTS |

## Astuces et pièges

- Le bot a besoin des permissions Se connecter et Parler dans le salon vocal, et Envoyer des messages dans le salon musical pour les notifications.
- La plupart des commandes vérifient d'abord que vous êtes dans un salon vocal, et que c'est bien celui où se trouve le bot.
- Le volume défini avec `volume` est enregistré comme valeur par défaut du serveur : un 10 réglé tard le soir devient donc le volume de départ du lendemain.
- Les playlists Spotify sont converties titre par titre via une recherche YouTube ; les longues playlists prennent donc du temps, et quelques correspondances peuvent être erronées.
- Les playlists enregistrées conservent des liens, et non de l'audio. Si une vidéo est supprimée de YouTube, son entrée est ignorée au chargement.
- Le vote pour passer ne compte que les humains présents dans le salon. Dans un salon où vous êtes seul, votre propre vote suffit.
- La synthèse vocale ne lit que les messages des membres présents dans le salon vocal ; les personnes qui suivent depuis le chat textuel ne peuvent donc pas la déclencher.

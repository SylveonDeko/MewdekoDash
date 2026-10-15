---
title: Mot du jour
slug: wordoftheday
summary: Publie chaque jour un mot de vocabulaire avec sa définition, sa prononciation et un exemple, choisi dans un dictionnaire selon le thème et la difficulté, ou dans une liste rédigée par le serveur lui-même.
icon: fa-book-open
category: Community
dashboard: /dashboard/wordoftheday
module: WordOfTheDay
tags: [word of the day, wotd, vocabulary, dictionary, definition, daily, datamuse, topic, schedule, mot du jour, vocabulaire, dictionnaire, définition, quotidien, thème, planification]
related: [birthday, utility]
---

## Fonctionnement

Une fois par jour, à une heure que le serveur choisit dans son propre fuseau horaire, le bot publie un mot dans un salon choisi. La publication affiche le mot, sa prononciation, sa classe grammaticale, une définition et, lorsqu'il en existe une, une phrase d'exemple. Un rôle peut être mentionné à chaque publication.

Les mots proviennent du dictionnaire Datamuse et sont filtrés par trois paramètres : un **topic** vers lequel les mots doivent pencher, une **part of speech** (classe grammaticale), et une **difficulty** (difficulté) fondée sur la fréquence du mot dans l'anglais écrit. Le bot évite de répéter tout mot publié au cours des quatre-vingt-dix derniers jours.

Les serveurs peuvent aussi constituer une **liste personnalisée** avec `wotdadd`. Si la définition est omise, le bot en recherche une. Le **source mode** détermine si les publications proviennent du dictionnaire, de la liste personnalisée, ou de la liste personnalisée d'abord puis du dictionnaire une fois celle-ci épuisée.

## Planification par jour de la semaine ou par mois

Des règles peuvent remplacer le thème, la classe grammaticale et la difficulté pour un jour précis de la semaine ou un mois précis. Une règle ne modifie que les champs qu'elle définit ; une règle du lundi qui ne fixe qu'un thème utilise donc toujours la classe grammaticale et la difficulté de base. Lorsque les deux s'appliquent, les règles par jour de la semaine l'emportent sur les règles par mois, et les règles par mois l'emportent sur les paramètres de base.

Exemples :

- `wotdday monday science` fait du mot du lundi un mot à thème scientifique.
- `wotddayfilter friday adjective rare` fait des vendredis des adjectifs rares.
- `wotdmonth october spooky halloween` donne un thème à tout le mois d'octobre.
- `wotdschedule` affiche chaque règle et les filtres actuellement en vigueur.

## Fil de discussion

Lorsqu'il est activé, le bot crée un fil public sous chaque publication quotidienne et y dépose une question d'amorce invitant à utiliser le mot dans une phrase. Le nom du fil provient d'un modèle (par défaut `Word of the day: %wotd.word%`) qui prend en charge `%wotd.word%`, `%wotd.date%`, `%wotd.pos%` et les placeholders habituels du serveur. `wotdthread` active ou désactive la fonction, `wotdthreadname` définit, affiche ou efface le modèle de nom, et `wotdthreadarchive` définit la durée pendant laquelle le fil reste ouvert avant d'être archivé automatiquement (1 heure, 1 jour, 3 jours ou 1 semaine).

## Commandes

| Commande | Ce qu'elle fait |
| --- | --- |
| `wotd` | Affiche le mot du jour, ou un aperçu si rien n'a encore été publié. |
| `wotdchannel #channel` | Définit le salon et active les publications. |
| `wotdtime 9` | Définit l'heure locale de publication. |
| `wotdtimezone Europe/London` | Définit le fuseau horaire. |
| `wotdtopic space` | Définit le thème de base. |
| `wotdpos noun` | Restreint la classe grammaticale. |
| `wotddifficulty rare` | Définit la difficulté. |
| `wotdmode mixed` | Choisit dictionnaire, personnalisé ou mixte. |
| `wotdadd word [definition]` | Ajoute un mot personnalisé. |
| `wotdmessage` | Définit un modèle de message personnalisé avec des placeholders ou du JSON d'embed. |
| `wotdthread` | Active ou désactive le fil de discussion sous chaque publication. |
| `wotdthreadname [template\|clear]` | Définit, affiche ou efface le modèle de nom du fil. |
| `wotdthreadarchive 1h\|24h\|3d\|7d` | Définit la durée pendant laquelle le fil reste ouvert avant l'archivage automatique. |
| `wotdpost` | Publie immédiatement un nouveau mot. |

## Placeholders des messages

`%wotd.word%`, `%wotd.definition%`, `%wotd.pos%`, `%wotd.example%`, `%wotd.phonetic%`, `%wotd.date%` et `%wotd.ping%` sont disponibles dans un modèle personnalisé, en complément des placeholders habituels du serveur.

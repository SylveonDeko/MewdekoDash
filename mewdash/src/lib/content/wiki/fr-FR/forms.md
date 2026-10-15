---
title: Formulaires
slug: forms
summary: Créez des candidatures, des sondages, des demandes de levée de bannissement et des candidatures d'adhésion sur le tableau de bord, recueillez les réponses via un lien partageable, et approuvez ou rejetez-les depuis Discord ou la file des réponses.
icon: fa-clipboard
category: Community
dashboard: /dashboard/forms
module: Forms
tags: [forms, application, survey, questionnaire, ban appeal, join application, review, approve, reject, responses, csv, formulaires, candidature, sondage, questionnaire, demande de levée de bannissement, candidature d'adhésion, examen, approuver, rejeter, réponses, csv]
related: [administration, moderation, rolestates]
---

## Fonctionnement

Le staff crée un formulaire sur le tableau de bord : un nom, une série de questions et des règles sur qui peut répondre et ce qui se passe ensuite. La publication génère un lien de partage permanent. Un membre ouvre le lien, se connecte avec Discord, remplit les questions page par page, relit ses réponses et les envoie. Sa progression est enregistrée en brouillon pendant qu'il écrit, afin qu'il puisse revenir plus tard.

Chaque envoi est publié sous forme d'embed dans le salon de votre choix, avec les boutons **Approuver** et **Refuser** si le formulaire nécessite une décision. Les relecteurs appuient sur un bouton dans Discord ou utilisent l'onglet **Réponses** du tableau de bord. La personne qui a répondu reçoit un MP avec la décision et les éventuelles notes, et peut suivre son statut à tout moment sur une page dédiée.

Il existe trois types de formulaires. Un formulaire classique est destiné aux membres. Un formulaire de demande de levée de bannissement s'adresse aux personnes actuellement bannies, et son approbation les débannit. Une candidature d'adhésion concerne les personnes qui ne sont pas sur le serveur ; son approbation leur envoie une invitation à usage unique, et les rôles qui les attendent sont enregistrés pour leur être attribués lorsqu'elles rejoignent le serveur.

Il n'existe aucune commande pour les formulaires. Tout se passe sur le tableau de bord, à l'exception des deux boutons de relecture.

## Pourquoi l'utiliser

- Candidatures pour le staff, les partenaires ou les événements, avec une véritable file de relecture plutôt qu'une avalanche de MP.
- Un processus de demande de levée de bannissement avec délais d'attente, limites de tentatives et débannissement automatique à l'approbation.
- Une communauté à accès contrôlé, où les candidats sont vérifiés avant de recevoir une invitation.
- Sondages de satisfaction avec un plafond de réponses et un export CSV.

## Types de formulaires

| Type | Qui peut répondre | À l'approbation |
| --- | --- | --- |
| Regular Form | Les membres, ou toute personne si **Autoriser les personnes extérieures au serveur** est activé | Modifications de rôles uniquement, si configurées |
| Ban Appeal | Les personnes actuellement bannies du serveur | Le bannissement est levé |
| Join Application | Les personnes qui ne sont pas sur le serveur | Une invitation est créée et les **Rôles qui les attendent à l'arrivée** sont enregistrés comme état de rôle, afin d'être appliqués lorsque la personne rejoint le serveur |

Le type est fixé une fois le formulaire créé. Les demandes de levée de bannissement et les candidatures d'adhésion passent toujours par une relecture ; les formulaires classiques n'y passent que si **Les réponses doivent être approuvées** est activé.

## Questions

Les questions s'ajoutent dans le créateur, sous **Questions**. Les types disponibles sont :

| Type | Réponse | Options |
| --- | --- | --- |
| Short Text | Une ligne | Longueur minimale et maximale, jusqu'à 5000 |
| Long Text | Plusieurs lignes | Mêmes limites de longueur |
| Multiple Choice | Une seule des options proposées | Jusqu'à 25 options |
| Checkboxes | Plusieurs options | Jusqu'à 25 options ; **Valeur minimale** et **Valeur maximale** limitent le nombre de cases cochables |
| Dropdown | Une option dans une liste | Jusqu'à 25 options |
| Number | Un nombre | Valeur minimale et maximale |
| Email | Une adresse e-mail valide | |
| URL | Une adresse `http` ou `https` | |
| Section Break | Rien ; démarre une nouvelle page et peut porter un titre et une introduction | |

Le texte d'une question est limité à 500 caractères, les placeholders à 200, et toute réponse à 4000 caractères. Chaque question peut avoir une URL d'image et être marquée comme obligatoire. Une question peut aussi n'être obligatoire que lorsqu'une réponse précédente correspond à une condition.

### Insertion de réponses

Activez l'insertion de réponses pour une question et écrivez `{{Q12}}` dans son texte ou son placeholder, où 12 est l'ID d'une question précédente. La réponse antérieure est insérée, tronquée à 100 caractères. Si elle n'a pas été renseignée, le texte de la question apparaît entre crochets à la place. Une question ne peut insérer que les réponses des questions situées au-dessus d'elle.

### Conditions

Chaque question ne peut être affichée que si une condition est remplie. Les questions masquées sont ignorées sur la page, et les réponses envoyées pour elles sont supprimées côté serveur.

| Type de condition | Affichée lorsque |
| --- | --- |
| Answer-Based | Une réponse précédente correspond : **Est égal à**, **N'est pas égal à**, **Contient**, **Supérieur à** ou **Inférieur à** |
| Role-Based | Le membre possède **Au moins un**, **Tous** ou **Aucun** les rôles choisis |
| Server Tenure | Le membre est sur le serveur depuis au moins N jours, ou son compte a au moins N jours |
| Boost/Nitro | Le membre booste le serveur. La vérification Nitro est une estimation à partir de l'avatar et des données de boost. |
| Permission-Based | Le membre possède toutes les permissions choisies |
| Multiple Conditions | Plusieurs lignes combinées. Les lignes d'un même groupe doivent être toutes vraies (ET) ; si un groupe est vrai, la question s'affiche (OU). |

Les comparaisons de texte ne tiennent pas compte de la casse. Greater than et less than comparent des nombres.

## Qui peut répondre

Le formulaire refuse l'accès, avec une raison, dans cet ordre : il est encore en brouillon, il n'accepte plus de réponses, la date **Ouvre à** n'est pas encore atteinte, la date **Ferme à** est dépassée, le compte est plus récent que l'âge minimal défini dans **Ancienneté minimale du compte Discord**, le plafond **Nombre total de réponses acceptées** est atteint, la personne a déjà répondu et les réponses multiples sont désactivées, elle ne possède pas le rôle **Rôle requis pour envoyer**, et enfin la règle propre au type ci-dessus.

**Permettre aux personnes refusées de réessayer** signifie qu'une réponse rejetée ne compte plus comme « déjà répondu ». Si **Exiger un captcha** est activé, une vérification Cloudflare Turnstile apparaît à l'étape de relecture.

Les demandes de levée de bannissement ajoutent leurs propres limites sous **Limites des recours** : un délai d'attente après le bannissement (mesuré à partir de l'entrée du journal d'audit), un nombre maximal de demandes, un temps de recharge entre deux demandes, et **Un refus est définitif**. Une demande encore en attente bloque toute nouvelle demande.

## Remplir un formulaire

La page publique exige une connexion Discord. Les réponses sont enregistrées en brouillon environ une seconde et demie après la dernière frappe, et lors du passage à la page suivante. Revenir dans les 30 jours restaure le brouillon avec la bannière « We brought back what you had already written » et un bouton **Recommencer**.

Une barre de progression indique les questions auxquelles vous avez répondu. La dernière page se termine par **Vérifier et continuer**, qui liste chaque réponse avec un lien **Modifier**, puis par **Confirmer et envoyer**. Ensuite, la page affiche votre **Message après l'envoi** (ou un message par défaut selon le type) ainsi qu'un lien **Vérifier votre statut**. La page de statut renvoie aussi vers **Mes envois**, à l'adresse `/forms/submissions`, qui liste chaque réponse non anonyme envoyée par l'utilisateur connecté, sur tous les serveurs.

Les personnes ayant répondu peuvent modifier leurs réponses depuis la page de statut tant que la réponse est en attente, à condition que le formulaire ne soit pas anonyme et n'ait pas été fermé. Les réponses précédentes sont conservées sous forme de révisions. Aucun moyen n'est prévu pour retirer une réponse.

## Ce qui se passe à l'envoi

1. Les rôles listés dans **Rôles attribués à l'envoi** et le **Rôle pendant l'examen** sont attribués.
2. Si **Où publier les réponses** est défini, un embed y est publié, indiquant l'utilisateur (ou « Anonymous (login required) »), l'heure et jusqu'à 20 réponses, avec une mention du rôle **Mentionner à l'arrivée d'une réponse**. Les boutons Approve et Reject sont ajoutés lors de la relecture.
3. Si **Envoyer vers un webhook** est défini, le même embed est publié sur ce webhook, sans les boutons. Lorsque la réponse est ensuite approuvée ou rejetée, un second message contenant le résultat, le relecteur et la raison est également envoyé au webhook. L'URL doit être un webhook Discord ; toute autre valeur est ignorée avec un avertissement dans le journal du bot, et un webhook en échec ne bloque jamais l'envoi.
4. La réponse apparaît dans l'onglet **Réponses** avec le statut Pending Review.

Les formulaires anonymes n'enregistrent aucun identifiant d'utilisateur ; ils ne peuvent donc pas modifier de rôles et leurs réponses ne peuvent pas être modifiées.

## Processus de relecture

Les réponses passent de Pending Review à Approved ou Rejected. **Qui peut approuver ou refuser** désigne un rôle ; toute personne disposant de Gérer le serveur ou de l'Administrateur peut toujours décider. Si aucun rôle relecteur n'est défini, les détenteurs des rôles d'approbation peuvent aussi décider.

Dans Discord, **Approuver** décide immédiatement. **Refuser** ouvre une fenêtre demandant une raison, obligatoire car elle est transmise à la personne ayant répondu. Dans les deux cas, l'embed change de couleur, reçoit un champ **Approuvée** ou **Refusée** avec le relecteur et l'heure, la raison éventuelle, et perd ses boutons. Sur le tableau de bord, la même décision se prend depuis la file, avec une zone **Notes pour l'auteur**.

Lors d'une décision, le bot :

- Ajoute et retire les rôles listés dans **Ajouter à l'approbation**, **Retirer à l'approbation**, **Ajouter au refus** et **Retirer au refus**, et retire toujours le rôle d'attente de relecture. Un rôle présent des deux côtés est retiré.
- Débannit l'utilisateur pour une demande de levée de bannissement approuvée, ou crée l'invitation pour une candidature d'adhésion approuvée.
- Envoie un MP à la personne ayant répondu : « Your response was approved » ou « Your response was not accepted », avec les notes, votre **Message après l'envoi** en cas d'approbation, et l'invitation. Si le MP échoue, l'embed et la file l'indiquent.

Les émojis des boutons de relecture proviennent du formulaire, puis des **Valeurs par défaut du serveur** de l'onglet **Paramètres**, puis d'une simple coche et d'une croix.

## Versions

Chaque enregistrement d'un formulaire conserve une version, dans la limite des 20 dernières. **Historique des versions** affiche chacune d'elles avec une comparaison des paramètres et des questions, ainsi qu'un bouton **Restaurer**. La restauration recrée les questions avec de nouveaux ID et réécrit les conditions et l'insertion de réponses en conséquence.

## Paramètres

La page **Formulaires** comporte les onglets **Formulaires**, **Créer** et **Paramètres**, ainsi que **Modifier** et **Réponses** lorsqu'un formulaire est sélectionné. Les onglets Create et Edit partagent le même panneau de paramètres.

| Paramètre | Valeur par défaut | Ce qu'il contrôle |
| --- | --- | --- |
| Name | vide, obligatoire | Titre du formulaire, jusqu'à 255 caractères |
| Description | vide | Affichée sous le titre et dans les aperçus de liens Discord |
| Where answers are posted | aucun | Salon de l'embed d'envoi ; vide conserve les réponses uniquement sur le tableau de bord |
| Message after submitting | aucun | Texte de la page de confirmation et du MP d'approbation |
| Draft | activé pour les nouveaux formulaires | Impossible de répondre à un brouillon |
| Accepting responses | activé | À désactiver pour fermer sans supprimer |
| Role required to submit | Toute personne du serveur | Restreindre par rôle |
| Minimum Discord account age | Aucune limite | En jours |
| Allow people outside the server | désactivé | Formulaires classiques uniquement |
| Submit anonymously | désactivé | N'enregistre aucun auteur |
| Opens at, Closes at | aucun | Période ; une annonce de lancement nécessite une date d'ouverture |
| Total responses accepted | Aucune limite | Plafond global, toutes personnes confondues |
| Allow more than one answer per person | désactivé | |
| Let rejected people try again | désactivé | |
| Require a captcha | désactivé | Turnstile à l'étape de relecture |
| Announce the opening in, Ping with the announcement, Announcement text | aucun | Embed de lancement avec un compte à rebours de fermeture, envoyé dans la minute qui suit **Ouvre à** ou à la publication |
| Ping when a response arrives | aucun | Rôle mentionné à chaque envoi |
| Roles given on submitting | aucun | Attribués immédiatement |
| Role while awaiting review | aucun | Retiré à la décision |
| Send to a webhook | aucun | URL de webhook Discord qui reçoit aussi chaque embed d'envoi et chaque décision d'approbation ou de rejet |
| Answers need approving | désactivé | Ajoute une relecture à un formulaire classique |
| Who may approve or reject | Gérer le serveur uniquement | Rôle relecteur |
| Approve button emote, Reject button emote | valeur par défaut du serveur | |
| Add/Remove on approval, Add/Remove on rejection | aucun | Modifications de rôles lors de la décision |
| One rejection is final, Wait after the ban, Appeals allowed, Wait between appeals | désactivé, Aucune attente, Illimité, Aucune attente | Demandes de levée de bannissement uniquement |
| Times the invite can be used, Invite expires after (seconds), Roles waiting for them on join | 1, 86400, aucun | Candidatures d'adhésion uniquement |

Les paramètres qui ne s'appliquent pas au type du formulaire sont supprimés à l'enregistrement.

## Pas à pas pour la configuration

1. Ouvrez **Formulaires** dans le tableau de bord et cliquez sur **Créer**.
2. Choisissez le **Type de formulaire**. Ce choix ne pourra plus être modifié ensuite.
3. Renseignez **Nom** et **Description**, puis choisissez **Où publier les réponses**.
4. Sous **Questions**, ajoutez des questions, marquez les obligatoires, et utilisez **Ajouter une page** pour découper les longs formulaires.
5. Définissez qui peut répondre et, si vous voulez une étape de relecture, activez **Les réponses doivent être approuvées** et choisissez **Qui peut approuver ou refuser**.
6. Cliquez sur **Enregistrer le formulaire**. Utilisez **Aperçu** sur la carte du formulaire pour le parcourir en tant qu'administrateur.
7. Cliquez sur **Publier** sur la carte, puis sur **Copier le lien**, et publiez le lien là où les candidats le trouveront.
8. Surveillez l'onglet **Réponses** ou le salon d'envoi, et décidez de chaque réponse.

## Commandes

Les formulaires n'ont ni commandes textuelles ni commandes slash. La seule interaction Discord est constituée des boutons **Approuver** et **Refuser** de chaque embed d'envoi.

## Astuces et pièges

- Le bot a besoin de la permission Gérer les rôles, et son rôle doit être placé au-dessus de tous les rôles qu'un formulaire attribue ou retire. Les rôles au-dessus du bot, les rôles gérés et le rôle everyone sont ignorés silencieusement.
- Les demandes de levée de bannissement nécessitent la permission Voir le journal d'audit pour la vérification « wait after the ban ». Le débannissement nécessite la permission Bannir des membres, et les invitations des candidatures d'adhésion nécessitent la permission Créer une invitation dans un salon visible par tous.
- L'embed d'envoi affiche au maximum 20 réponses ; la réponse complète se trouve sur le tableau de bord.
- **Exporter en CSV** dans l'onglet Responses inclut une colonne par question, les réponses à choix multiples étant séparées par des points-virgules.
- Le filtre et la page des réponses font partie de l'URL ; vous pouvez donc mettre en favori « pending only » et le partager avec les relecteurs.
- Les brouillons ne sont jamais validés ; un brouillon restauré peut donc encore échouer à la validation lors de l'envoi.
- Les formulaires expirés sont fermés par une vérification qui s'exécute chaque minute ; l'éligibilité est aussi vérifiée à l'envoi, rien ne peut donc passer entre-temps.

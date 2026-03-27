# Les APIs — Application Programming Interface

> **Cours de 1ère année — BTS CIEL-IR**  
> Saint-Gabriel, Saint-Laurent-sur-Sèvre  
> Référent pédagogique : Marc VOISIN  
> Mis à jour : mars 2026

---

## Table des matières

1. [Introduction — Pourquoi les APIs ?](#1-introduction--pourquoi-les-apis-)
2. [Définition et principes fondamentaux](#2-définition-et-principes-fondamentaux)
3. [Les types d'APIs](#3-les-types-dapis)
4. [Le protocole HTTP — base des APIs Web](#4-le-protocole-http--base-des-apis-web)
5. [Les APIs REST — architecture dominante](#5-les-apis-rest--architecture-dominante)
6. [Le format JSON — échanger des données structurées](#6-le-format-json--échanger-des-données-structurées)
7. [Créer sa propre API](#7-créer-sa-propre-api)
8. [Authentification et sécurité](#8-authentification-et-sécurité)
9. [Tester une API](#9-tester-une-api)
10. [Les APIs dans le monde professionnel](#10-les-apis-dans-le-monde-professionnel)
11. [Ressources et pour aller plus loin](#11-ressources-et-pour-aller-plus-loin)

---

## 1. Introduction — Pourquoi les APIs ?

Le développement informatique moderne ne consiste plus à tout construire de zéro. Quand une application a besoin d'afficher la météo, elle ne déploie pas ses propres satellites. Quand un site e-commerce encaisse un paiement, il ne développe pas son propre système bancaire. Quand tu te connectes à une application tierce avec ton compte Google, Google ne te demande pas ton mot de passe à transmettre à cette application. Dans tous ces cas, c'est une **API** qui entre en jeu.

Une API est le mécanisme qui permet à deux logiciels de se parler, d'échanger des informations, de demander et de fournir des services — sans que l'un ait besoin de connaître les détails internes de l'autre. C'est un concept fondamental du développement contemporain, et il est difficile aujourd'hui d'imaginer une application web ou mobile qui n'en consomme pas au moins une.

Pour mieux comprendre l'omniprésence des APIs, prenons quelques exemples tirés de la vie quotidienne. Lorsque tu consultes les horaires de train sur une application mobile, cette application n'a pas de base de données propre avec tous les horaires SNCF : elle interroge l'API de la SNCF. Lorsqu'un lycée publie les bulletins scolaires sur un portail en ligne, ce portail interroge l'API du logiciel de vie scolaire. Lorsque tu reçois un SMS de confirmation après une commande en ligne, c'est une API de messagerie (comme Twilio) qui a été appelée automatiquement par le serveur de la boutique. Les APIs sont partout, et les maîtriser est une compétence clé pour tout technicien en informatique et réseaux.

> *« Une API est un contrat entre deux logiciels : l'un fournit un service, l'autre le consomme, selon des règles définies à l'avance. »*  
> — MDN Web Docs, Mozilla

---

## 2. Définition et principes fondamentaux

### 2.1 Définition formelle

**API** est l'acronyme d'**Application Programming Interface**, que l'on traduit en français par **Interface de Programmation d'Application**.

Il s'agit d'un ensemble de règles, de conventions et de points d'accès qu'un logiciel met à disposition pour que d'autres logiciels puissent interagir avec lui. Ces règles définissent précisément : quelles données peuvent être demandées, sous quelle forme elles doivent l'être, et sous quelle forme elles seront renvoyées en retour. Une API est donc une **interface contractuelle** : tant que les deux parties respectent le contrat, peu importe comment chacune est implémentée en interne.

Cette notion d'encapsulation est importante. Quand tu appelles l'API météo d'un fournisseur, tu ne sais pas — et tu n'as pas besoin de savoir — si les données sont stockées dans une base MySQL, dans un cloud AWS ou dans un datacenter en Islande. Tu envoies une requête dans le bon format, tu reçois une réponse dans le bon format. Ce principe fondamental s'appelle **l'abstraction**.

### 2.2 Les trois acteurs d'une interaction API

Dans toute communication via une API, on retrouve systématiquement trois acteurs distincts.

**Le client** est l'application ou le script qui fait la demande. C'est lui qui initie la communication. Dans la vie de tous les jours, ce peut être une application mobile, un navigateur web, ou un script Python lancé sur un serveur.

**L'API** est l'interface exposée par le fournisseur de service. Elle reçoit la requête du client, la valide selon les règles définies, puis la transmet au système interne approprié.

**Le serveur ou la base de données** est le système qui détient réellement l'information ou effectue le traitement demandé. Le client ne communique jamais directement avec lui ; c'est l'API qui sert d'intermédiaire et de filtre.

```
[Client]  ──── requête ────▶  [API]  ──────▶  [Serveur / BDD]
          ◀─── réponse ────         ◀──────
```

### 2.3 L'analogie du restaurant

Pour rendre ce fonctionnement plus concret, une métaphore très répandue dans l'industrie est celle du restaurant. Dans un restaurant, le client ne va pas directement en cuisine chercher son plat : ce serait chaotique et dangereux. Il communique avec un serveur, qui prend la commande, la transmet en cuisine, attend que le plat soit préparé, et le rapporte à table. Le serveur joue ici le rôle de l'API : il fait l'interface entre le client et la cuisine, selon un protocole précis — la carte du menu, le langage de la commande, le format de livraison du plat.

De la même façon, l'API expose ce qu'il est possible de demander (les "endpoints"), dans quel format (les "paramètres"), et garantit un format de réponse cohérent. L'application cliente n'a jamais accès direct à la "cuisine", c'est-à-dire à la base de données ou aux traitements internes.

> 📚 Source : *Red Hat — What is an API?*, [redhat.com/en/topics/api/what-are-application-programming-interfaces](https://www.redhat.com/en/topics/api/what-are-application-programming-interfaces)

---

## 3. Les types d'APIs

Il existe plusieurs façons de classifier les APIs. La première distinction porte sur **qui peut y accéder** (la visibilité), et la seconde sur **comment elles sont architecturées techniquement** (le style).

### 3.1 Classification par accès

**Les APIs publiques** (ou Open APIs) sont accessibles à n'importe quel développeur, parfois sans restriction, parfois après inscription pour obtenir une clé d'accès. L'objectif est souvent d'encourager l'adoption du service ou de valoriser des données ouvertes. L'API de la plateforme météo OpenWeatherMap, l'API de Google Maps ou les APIs du portail Open Data du gouvernement français (data.gouv.fr) sont des exemples d'APIs publiques.

**Les APIs privées** sont réservées à l'usage interne d'une organisation. Elles servent à faire communiquer les différents modules d'un système d'information entre eux, sans jamais être exposées à l'extérieur. Une grande entreprise peut ainsi disposer d'une API interne pour synchroniser son ERP, son CRM et son outil RH, sans que ces échanges transitent par l'internet public.

**Les APIs partenaires** se situent entre les deux : elles sont partagées uniquement avec des partenaires commerciaux sélectionnés, via des accords contractuels. La passerelle de paiement Stripe, par exemple, propose une API partenaire que seuls les e-commerces ayant souscrit à ses services peuvent utiliser.

**Les APIs composites** combinent plusieurs APIs en une seule pour répondre à un besoin plus complexe. Un agrégateur de voyages qui interroge simultanément les APIs de plusieurs compagnies aériennes et hôtelières pour proposer un résultat unifié en est un bon exemple.

### 3.2 Classification par architecture technique

#### REST (Representational State Transfer)

REST est aujourd'hui **l'architecture la plus utilisée** pour les APIs web. Elle repose sur le protocole HTTP et utilise principalement le format JSON pour l'échange de données. REST est apprécié pour sa simplicité, sa lisibilité et sa scalabilité. Nous lui consacrons une section entière plus loin dans ce cours.

> 📚 Source : Fielding, R.T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Thèse de doctorat, Université de Californie, Irvine.

#### SOAP (Simple Object Access Protocol)

SOAP est un protocole plus ancien et beaucoup plus strict que REST. Il utilise exclusivement le format **XML** pour les messages, et s'appuie sur une définition formelle du service appelée WSDL (Web Services Description Language). SOAP est encore largement utilisé dans les systèmes d'information d'entreprise, les systèmes bancaires et les services publics, pour sa robustesse et ses capacités de gestion des transactions. Il est cependant beaucoup plus verbeux que REST, et donc moins adapté aux applications web légères ou mobiles.

#### GraphQL

GraphQL est un langage de requête pour les APIs, inventé par Facebook en 2012 et rendu open-source en 2015. Sa particularité est de permettre au client de spécifier **exactement** les données dont il a besoin, ni plus ni moins. Avec une API REST classique, c'est le serveur qui détermine ce qu'il renvoie ; avec GraphQL, c'est le client qui le décide. Cela évite les problèmes de sur-fetching (recevoir plus de données que nécessaire) et de sous-fetching (devoir faire plusieurs requêtes pour obtenir toutes les données voulues). GitHub, Shopify et Twitter (désormais X) utilisent GraphQL pour leurs APIs publiques.

```graphql
# Exemple : demander uniquement le nom et l'email d'un utilisateur
query {
  utilisateur(id: "42") {
    nom
    email
  }
}
```

> 📚 Source : [graphql.org/learn](https://graphql.org/learn/)

#### WebSocket

Contrairement à HTTP qui fonctionne en mode requête-réponse (le client demande, le serveur répond, la connexion se ferme), WebSocket établit une **connexion persistante et bidirectionnelle** entre le client et le serveur. Les deux parties peuvent s'envoyer des messages à tout moment, sans qu'une nouvelle requête soit nécessaire. C'est la technologie derrière les applications de messagerie instantanée, les jeux multijoueurs en ligne, les cours de bourse en temps réel, ou encore les outils collaboratifs comme Figma.

#### gRPC

Développé par Google et rendu open-source en 2016, gRPC est un protocole de communication haute performance qui utilise **Protocol Buffers** (Protobuf) comme format de sérialisation des données. Contrairement au JSON qui est un format texte lisible par un humain, Protobuf est un format binaire compact et très rapide à traiter. gRPC est principalement utilisé pour la communication entre **microservices** au sein d'un système distribué, là où la performance est critique.

### 3.3 Tableau comparatif

| Critère | REST | SOAP | GraphQL | WebSocket | gRPC |
|---|---|---|---|---|---|
| **Format de données** | JSON / XML | XML uniquement | JSON | Binaire / JSON | Protobuf (binaire) |
| **Complexité** | Faible | Élevée | Moyenne | Moyenne | Élevée |
| **Temps réel** | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Flexibilité des requêtes** | Moyenne | Faible | Très élevée | N/A | Moyenne |
| **Lisibilité humaine** | Élevée | Moyenne | Élevée | Faible | Très faible |
| **Cas d'usage typique** | Web / Mobile | Systèmes entreprise | APIs flexibles | Temps réel | Microservices |

---

## 4. Le protocole HTTP — base des APIs Web

La grande majorité des APIs modernes (REST, GraphQL, WebSocket lors de la phase d'initialisation) repose sur **HTTP** (HyperText Transfer Protocol), le protocole de communication du web. Pour comprendre comment fonctionnent ces APIs, il est donc indispensable de maîtriser les bases d'HTTP.

### 4.1 Le modèle Requête / Réponse

HTTP est un protocole **sans état** (stateless) et **asymétrique** : c'est toujours le client qui initie la communication en envoyant une **requête**, et le serveur qui y répond avec une **réponse**. Le serveur ne garde aucune mémoire des échanges précédents : chaque requête est traitée de façon totalement indépendante. Si l'on veut maintenir une notion de "session" (par exemple, un utilisateur connecté), c'est au client de transmettre à chaque requête un token d'identification, et non au serveur de mémoriser l'état.

### 4.2 Les méthodes HTTP (verbes)

Une requête HTTP commence toujours par un **verbe** qui indique l'intention du client. Dans le contexte des APIs REST, ces verbes correspondent aux opérations **CRUD** (Create, Read, Update, Delete) sur les ressources exposées.

| Méthode | Intention | Opération CRUD | Idempotent ? |
|---|---|---|---|
| `GET` | Lire une ressource | Read | ✓ Oui |
| `POST` | Créer une ressource | Create | ✗ Non |
| `PUT` | Remplacer entièrement une ressource | Update (total) | ✓ Oui |
| `PATCH` | Modifier partiellement une ressource | Update (partiel) | Variable |
| `DELETE` | Supprimer une ressource | Delete | ✓ Oui |

> Une opération est dite **idempotente** si l'exécuter plusieurs fois donne le même résultat que de l'exécuter une seule fois. Envoyer dix fois la même requête `GET` ne change rien à l'état du serveur. En revanche, envoyer dix fois la même requête `POST` crée dix ressources distinctes.

### 4.3 Les codes de statut HTTP

Chaque réponse HTTP contient un **code de statut numérique** qui indique si la requête s'est bien déroulée, et si ce n'est pas le cas, quelle catégorie d'erreur s'est produite. Ces codes sont regroupés en cinq familles selon leur premier chiffre, et il est essentiel de les connaître car une API bien conçue les utilise systématiquement.

Les codes **2xx** indiquent un succès. Le code `200 OK` est la réponse standard à une requête réussie. Le code `201 Created` indique qu'une nouvelle ressource a bien été créée à la suite d'un `POST`. Le code `204 No Content` signifie que la requête a réussi mais qu'il n'y a rien à renvoyer (typiquement après un `DELETE`).

Les codes **4xx** indiquent une erreur du côté client, c'est-à-dire que c'est le client qui a fait quelque chose de mal. Le code `400 Bad Request` signifie que la requête est mal formée ou contient des données invalides. Le code `401 Unauthorized` indique que le client n'est pas authentifié. Le code `403 Forbidden` signifie que le client est authentifié mais ne dispose pas des droits suffisants pour accéder à la ressource. Le code `404 Not Found` est probablement le plus connu : la ressource demandée n'existe pas.

Les codes **5xx** indiquent une erreur du côté serveur, c'est-à-dire que le serveur a rencontré un problème indépendant de la requête du client. Le code `500 Internal Server Error` signifie qu'une erreur inattendue s'est produite côté serveur. Le code `503 Service Unavailable` indique que le service est temporairement indisponible.

> 📚 Source : [developer.mozilla.org/fr/docs/Web/HTTP/Status](https://developer.mozilla.org/fr/docs/Web/HTTP/Status)

### 4.4 Structure d'une requête HTTP

Une requête HTTP est composée de trois parties : la **ligne de requête** (méthode + URL + version HTTP), les **en-têtes** (headers) qui transmettent des métadonnées telles que le type de contenu ou le token d'authentification, et optionnellement un **corps** (body) qui contient les données envoyées (lors d'un `POST` ou `PUT` par exemple).

```http
POST /api/v1/utilisateurs HTTP/1.1
Host: api.exemple.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
Accept: application/json

{
  "nom": "Dupont",
  "email": "j.dupont@ecole.fr"
}
```

### 4.5 Structure d'une réponse HTTP

La réponse suit une structure similaire : la **ligne de statut** (version HTTP + code + message), les **en-têtes** de réponse (type de contenu, informations de cache, etc.), et le **corps** de la réponse contenant les données renvoyées au client.

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/utilisateurs/87

{
  "id": 87,
  "nom": "Dupont",
  "email": "j.dupont@ecole.fr",
  "created_at": "2026-03-27T08:00:00Z"
}
```

---

## 5. Les APIs REST — architecture dominante

REST (Representational State Transfer) n'est pas un protocole ni un standard rigide : c'est un **style d'architecture** défini par un ensemble de contraintes. Un système qui respecte ces contraintes est qualifié de « RESTful ».

### 5.1 Les six principes REST

Roy Fielding a défini en 2000, dans sa thèse de doctorat fondatrice, six contraintes qui caractérisent une architecture REST.

La première contrainte est la **séparation client-serveur**. Le client et le serveur sont deux entités indépendantes qui n'ont de connaissance l'une de l'autre qu'à travers l'interface de l'API. Le client peut évoluer sans impacter le serveur, et inversement. Cette séparation favorise la modularité et la maintenabilité.

La deuxième contrainte est l'**absence d'état** (statelessness). Chaque requête envoyée au serveur doit contenir toutes les informations nécessaires à son traitement. Le serveur ne conserve aucune information sur les requêtes précédentes. Si une authentification est nécessaire, le token d'identification doit être inclus dans chaque requête.

La troisième contrainte est la **mise en cache** (cacheability). Les réponses doivent indiquer explicitement si elles peuvent être mises en cache ou non. Une réponse mise en cache par le client ou par un proxy intermédiaire améliore significativement les performances globales du système.

La quatrième contrainte est l'**interface uniforme**. C'est la contrainte centrale de REST : les URLs doivent suivre des conventions cohérentes et prévisibles, les ressources sont identifiées de façon stable par leur URL, et les représentations des données sont séparées des ressources elles-mêmes.

La cinquième contrainte est le **système en couches**. Le client ne sait pas s'il communique directement avec le serveur final ou avec un intermédiaire (proxy, gateway, load balancer). Cela permet d'ajouter des couches de sécurité, de cache ou d'équilibrage de charge de façon totalement transparente pour le client.

La sixième contrainte, optionnelle, est le **code à la demande** : le serveur peut transmettre du code exécutable au client, comme du JavaScript.

> 📚 Source : Fielding, R.T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*, chapitre 5. [ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)

### 5.2 Conception des endpoints

Un **endpoint** est une URL précise qui correspond à une ressource exposée par l'API. La conception des endpoints suit des conventions largement adoptées dans l'industrie. Les ressources sont nommées au pluriel et en minuscules. La hiérarchie entre ressources se reflète dans la hiérarchie de l'URL. On évite systématiquement les verbes dans les URLs, car c'est la méthode HTTP qui porte déjà l'action — écrire `/api/supprimer-utilisateur/42` est une mauvaise pratique ; `DELETE /api/utilisateurs/42` est la forme correcte.

```
# Exemple : gestion des articles d'un blog

GET    /api/v1/articles                  → Lister tous les articles
POST   /api/v1/articles                  → Créer un nouvel article
GET    /api/v1/articles/15               → Lire l'article n°15
PUT    /api/v1/articles/15               → Remplacer entièrement l'article n°15
PATCH  /api/v1/articles/15               → Modifier partiellement l'article n°15
DELETE /api/v1/articles/15               → Supprimer l'article n°15

GET    /api/v1/articles/15/commentaires  → Lister les commentaires de l'article n°15
POST   /api/v1/articles/15/commentaires  → Ajouter un commentaire à l'article n°15
```

Le préfixe `/api/v1/` est une bonne pratique pour deux raisons : il distingue les routes API des routes web classiques du même serveur, et le numéro de version permet de faire évoluer l'API dans le temps sans casser les applications clientes qui s'appuient sur l'ancienne version.

---

## 6. Le format JSON — échanger des données structurées

### 6.1 Présentation générale

**JSON** (JavaScript Object Notation) est le format d'échange de données le plus utilisé dans les APIs modernes. Il a été conçu pour être à la fois **lisible par les humains** et **facilement analysable par les machines**. Bien qu'issu du langage JavaScript, JSON est aujourd'hui un standard universel supporté nativement par tous les langages de programmation courants — Python, PHP, Java, C#, Go, Ruby, etc.

JSON représente des données sous forme de **paires clé-valeur** organisées hiérarchiquement. Sa syntaxe est concise et stricte : les chaînes de caractères sont toujours entourées de guillemets doubles, les virgules séparent les éléments, les accolades `{}` délimitent les objets et les crochets `[]` délimitent les tableaux.

> 📚 Source : ECMA International, *ECMA-404 — The JSON Data Interchange Syntax*, 2e édition. [json.org/json-fr.html](https://www.json.org/json-fr.html)

### 6.2 Les six types de données JSON

JSON ne reconnaît que **six types de données**. Il est fondamental de tous les connaître, car toute valeur échangée via une API JSON appartient nécessairement à l'un de ces types. Contrairement à des langages comme Python ou Java, JSON n'a pas de type entier séparé du flottant, ni de type date natif, ni de type binaire — tout passe par ces six types de base.

---

#### Type `string` — Chaîne de caractères

Une `string` est une séquence de zéro ou plusieurs caractères Unicode. En JSON, elle est **obligatoirement délimitée par des guillemets doubles**. L'utilisation de guillemets simples n'est pas valide et provoquera une erreur d'analyse. Pour inclure des caractères spéciaux à l'intérieur d'une chaîne, on utilise des **séquences d'échappement** précédées d'un antislash (`\`).

Les séquences d'échappement les plus courantes sont : `\"` pour un guillemet double à l'intérieur de la chaîne, `\\` pour un antislash littéral, `\n` pour un saut de ligne, `\t` pour une tabulation horizontale, et `\uXXXX` pour un caractère Unicode spécifié par son code hexadécimal.

```json
"nom": "Dupont"
"description": "Cours d'informatique \"avancé\""
"chemin_windows": "C:\\Users\\Public\\Documents"
"multilignes": "Ligne 1\nLigne 2\nLigne 3"
"emoji": "\u2764"
```

---

#### Type `number` — Nombre

JSON ne distingue pas les entiers (integers) des décimaux (flottants) : il n'existe qu'un seul type `number` pour toutes les valeurs numériques. Les nombres ne sont **jamais entourés de guillemets** — s'ils l'étaient, ils deviendraient des chaînes de caractères. JSON accepte les entiers, les décimaux avec un point comme séparateur décimal (et non une virgule), les nombres négatifs, et la notation scientifique avec `e` ou `E`.

Il est important de noter que JSON ne supporte pas les valeurs spéciales `Infinity`, `-Infinity` ou `NaN` (Not a Number) issues de certains langages de programmation. Si une telle valeur doit être représentée, on utilisera `null` à la place, accompagné d'une documentation claire.

```json
"age": 17
"moyenne": 13.5
"temperature": -3.2
"distance_km": 384400
"constante": 6.674e-11
```

---

#### Type `boolean` — Booléen

Un booléen est une valeur logique qui ne peut prendre que deux états : `true` (vrai) ou `false` (faux). Ces mots-clés sont écrits **entièrement en minuscules et sans guillemets**. `True`, `False`, `TRUE`, `"true"` sont tous invalides en JSON ou représentent un autre type (une chaîne de caractères dans le dernier cas).

Les booléens servent à représenter des états binaires : une case cochée, un compte activé, une option activée, une condition vérifiée.

```json
"compte_actif": true
"majeur": false
"newsletter_ok": true
"banni": false
```

---

#### Type `array` — Tableau

Un tableau est une **collection ordonnée de valeurs**, délimitée par des crochets `[` et `]`, dont les éléments sont séparés par des virgules. L'ordre des éléments dans un tableau est significatif et garanti : le premier élément reste le premier lors de la lecture. Un tableau peut être vide (`[]`).

La particularité importante des tableaux JSON est qu'ils peuvent contenir des éléments de **types différents**, y compris d'autres tableaux (on parle alors de tableaux imbriqués) ou des objets. En pratique, dans la grande majorité des cas, les tableaux d'une API contiennent des éléments d'un seul et même type pour des raisons de cohérence.

```json
"matieres": ["Mathématiques", "Physique", "Informatique"]
"notes": [12, 15, 9, 18, 14]
"vide": []
"mixte_possible": ["texte", 42, true, null]
"scores_par_manche": [[10, 8, 12], [9, 11, 7]]
```

---

#### Type `object` — Objet

Un objet est une **collection non ordonnée de paires clé-valeur**, délimitée par des accolades `{` et `}`. Chaque paire est constituée d'une clé — qui est obligatoirement une `string` entre guillemets doubles — suivie de deux-points `:`, puis de sa valeur. Les paires sont séparées par des virgules.

Il est fondamental de comprendre que les clés d'un objet JSON sont **uniques** : si deux paires ont la même clé, le comportement est indéfini selon la spécification (en pratique, la plupart des parseurs gardent la dernière valeur). Les valeurs des clés peuvent être de n'importe quel type JSON, ce qui permet d'imbriquer des objets dans d'autres objets et de représenter des structures de données arbitrairement complexes.

```json
"adresse": {
  "numero": 12,
  "rue": "Rue de la Liberté",
  "code_postal": "75011",
  "ville": "Paris",
  "pays": "France"
}

"auteur": {
  "id": 3,
  "nom": "Dupont",
  "roles": ["auteur", "moderateur"]
}
```

---

#### Type `null` — Valeur nulle

`null` est une valeur spéciale qui représente l'**absence intentionnelle de valeur**. Il se distingue sémantiquement d'une clé absente du JSON : écrire `"telephone": null` signifie que le champ existe dans la structure de données, mais que sa valeur n'a pas encore été renseignée ou n'est pas applicable. Ne pas inclure le champ `"telephone"` du tout signifie que l'information est inconnue ou non pertinente. Cette distinction est sémantiquement importante dans de nombreux systèmes. `null` s'écrit toujours en minuscules et sans guillemets.

```json
"date_naissance": null
"telephone_pro": null
"dernier_achat": null
```

---

### 6.3 Exemple complet et commenté

Voici un exemple de réponse JSON réaliste, telle qu'une API pourrait la renvoyer pour représenter la fiche détaillée d'un article de blog avec ses métadonnées et ses commentaires.

```json
{
  "id": 15,
  "titre": "Introduction aux APIs REST",
  "publie": true,
  "vues": 1420,
  "note_moyenne": 4.7,
  "contenu": "Une API REST est une interface qui...",
  "image_principale": null,
  "tags": ["informatique", "web", "développement"],
  "auteur": {
    "id": 3,
    "nom": "Dupont",
    "prenom": "Julien",
    "email": "j.dupont@blog.fr"
  },
  "commentaires": [
    {
      "id": 101,
      "texte": "Très clair, merci !",
      "approuve": true,
      "note": 5
    },
    {
      "id": 102,
      "texte": "Un peu court sur la partie sécurité.",
      "approuve": true,
      "note": 3
    }
  ]
}
```

En analysant ce JSON, on identifie tous les types en jeu. `"id"`, `"vues"` et `"note"` sont de type `number`. `"titre"`, `"contenu"` et `"email"` sont de type `string`. `"publie"` et `"approuve"` sont de type `boolean`. `"image_principale"` est de type `null`, ce qui signifie qu'aucune image n'a été définie pour cet article. `"tags"` et `"commentaires"` sont des tableaux (`array`) — l'un contient des chaînes, l'autre des objets. `"auteur"` est un objet (`object`) imbriqué directement dans l'objet principal.

### 6.4 Règles syntaxiques et erreurs courantes

JSON est un format particulièrement strict : **une seule erreur de syntaxe** rend l'intégralité du document invalide et impossible à analyser. Voici les erreurs les plus fréquentes à éviter.

**Les virgules de fin** (trailing commas) ne sont pas autorisées en JSON. On ne peut pas mettre de virgule après le dernier élément d'un objet ou d'un tableau — contrairement à ce que JavaScript tolère depuis ES5.

```json
// ❌ JSON invalide — virgule traînante après le dernier élément
{
  "nom": "Dupont",
  "age": 17,
}

// ✓ JSON valide
{
  "nom": "Dupont",
  "age": 17
}
```

**Les commentaires ne sont pas supportés** dans la spécification JSON. Si un fichier de configuration JSON doit être documenté, on utilise une convention propre à l'outil (comme des clés `"_comment"`) ou un format alternatif tel que YAML ou TOML.

**Les clés doivent toujours être des chaînes entre guillemets doubles**. Des clés sans guillemets ou avec des guillemets simples sont syntaxiquement invalides.

```json
// ❌ Invalide : clés sans guillemets, guillemets simples
{ nom: "Dupont", 'age': 17 }

// ✓ Valide
{ "nom": "Dupont", "age": 17 }
```

---

## 7. Créer sa propre API

### 7.1 Choisir un langage et un framework

La création d'une API peut se faire dans pratiquement n'importe quel langage de programmation. En pratique, certains langages et frameworks se sont imposés comme des standards dans l'industrie pour cette tâche. Le choix dépend du contexte du projet, des compétences de l'équipe et des contraintes techniques.

| Langage | Framework(s) | Points forts |
|---|---|---|
| **JavaScript / Node.js** | Express.js, Fastify, Hono | Écosystème npm immense, full-stack JS |
| **Python** | FastAPI, Flask, Django REST Framework | Syntaxe claire, idéal pour prototypage et data science |
| **PHP** | Laravel (Sanctum), Slim | Hébergement partagé simple, très répandu dans le web |
| **Java** | Spring Boot | Robuste, performant, standard dans les grandes entreprises |
| **Go** | Gin, Fiber | Très haute performance, faible consommation mémoire |

Dans le cadre de ce cours, les exemples sont illustrés avec **Express.js (Node.js)** et **FastAPI (Python)**, deux frameworks pédagogiquement accessibles, très populaires dans l'industrie et bien documentés.

### 7.2 Exemple complet avec Express.js (Node.js)

Express.js est un framework minimaliste pour Node.js qui permet de créer une API REST en quelques dizaines de lignes. C'est le framework web Node.js le plus téléchargé au monde, et sa simplicité en fait un excellent point de départ.

#### Installation du projet

```bash
# Créer le dossier du projet et initialiser npm
mkdir mon-api && cd mon-api
npm init -y

# Installer Express.js
npm install express
```

#### Code de l'API (`index.js`)

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware : permet à Express de lire le corps des requêtes en JSON
app.use(express.json());

// Données simulées (en production, ce serait une vraie base de données)
let articles = [
  { id: 1, titre: "Introduction aux APIs", publie: true, vues: 250 },
  { id: 2, titre: "Le format JSON en détail", publie: true, vues: 180 },
  { id: 3, titre: "Sécurité des APIs", publie: false, vues: 0 }
];

// GET /api/v1/articles — Lister tous les articles
app.get('/api/v1/articles', (req, res) => {
  res.status(200).json(articles);
});

// GET /api/v1/articles/:id — Obtenir un article par son ID
app.get('/api/v1/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const article = articles.find(a => a.id === id);

  if (!article) {
    return res.status(404).json({
      erreur: "Article introuvable",
      id_demande: id
    });
  }

  res.status(200).json(article);
});

// POST /api/v1/articles — Créer un nouvel article
app.post('/api/v1/articles', (req, res) => {
  const { titre, publie } = req.body;

  // Validation des données d'entrée
  if (!titre) {
    return res.status(400).json({
      erreur: "Le champ 'titre' est obligatoire"
    });
  }

  const nouvelArticle = {
    id: articles.length + 1,
    titre,
    publie: publie ?? false,
    vues: 0
  };

  articles.push(nouvelArticle);
  res.status(201).json(nouvelArticle);
});

// PATCH /api/v1/articles/:id — Modifier partiellement un article
app.patch('/api/v1/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = articles.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ erreur: "Article introuvable" });
  }

  // Fusion des données existantes avec les nouvelles
  articles[index] = { ...articles[index], ...req.body };
  res.status(200).json(articles[index]);
});

// DELETE /api/v1/articles/:id — Supprimer un article
app.delete('/api/v1/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = articles.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ erreur: "Article introuvable" });
  }

  articles.splice(index, 1);
  res.status(204).send(); // 204 : succès sans contenu à renvoyer
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`API démarrée → http://localhost:${PORT}`);
});
```

#### Lancer le serveur

```bash
node index.js
# → API démarrée → http://localhost:3000
```

### 7.3 Exemple avec FastAPI (Python)

FastAPI est un framework Python moderne conçu spécifiquement pour créer des APIs performantes. Il utilise les annotations de type Python pour valider automatiquement les données d'entrée et il génère sans configuration supplémentaire une **documentation interactive Swagger UI** accessible directement dans le navigateur à l'adresse `/docs`.

```bash
pip install fastapi uvicorn
```

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="API Blog",
    description="Gestion des articles d'un blog",
    version="1.0.0"
)

# Modèle de données : Pydantic valide automatiquement les types
class ArticleInput(BaseModel):
    titre: str
    publie: Optional[bool] = False

# Données simulées
articles = [
    {"id": 1, "titre": "Introduction aux APIs", "publie": True, "vues": 250},
    {"id": 2, "titre": "Le format JSON en détail", "publie": True, "vues": 180},
]

@app.get("/api/v1/articles", summary="Lister tous les articles")
def lister_articles():
    return articles

@app.get("/api/v1/articles/{article_id}", summary="Obtenir un article par ID")
def obtenir_article(article_id: int):
    article = next((a for a in articles if a["id"] == article_id), None)
    if not article:
        raise HTTPException(status_code=404, detail="Article introuvable")
    return article

@app.post("/api/v1/articles", status_code=201, summary="Créer un article")
def creer_article(article: ArticleInput):
    nouvel_article = {"id": len(articles) + 1, "vues": 0, **article.dict()}
    articles.append(nouvel_article)
    return nouvel_article

@app.delete("/api/v1/articles/{article_id}", status_code=204, summary="Supprimer un article")
def supprimer_article(article_id: int):
    global articles
    if not any(a["id"] == article_id for a in articles):
        raise HTTPException(status_code=404, detail="Article introuvable")
    articles = [a for a in articles if a["id"] != article_id]
```

```bash
uvicorn main:app --reload
# Documentation interactive → http://localhost:8000/docs
```

> 📚 Sources : [expressjs.com](https://expressjs.com/) | [fastapi.tiangolo.com](https://fastapi.tiangolo.com/)

### 7.4 Bonnes pratiques de conception

Concevoir une bonne API ne se limite pas à faire fonctionner les endpoints. Il faut également penser à la maintenabilité à long terme, à la sécurité et à l'expérience des développeurs qui utiliseront cette API.

**Versionner son API dès le départ** est une pratique incontournable. Le préfixe `/api/v1/` permet de faire évoluer l'API — changer des formats, renommer des champs, supprimer des endpoints obsolètes — sans casser les applications clientes qui s'appuient sur l'ancienne version. Il suffit de déployer `/api/v2/` en parallèle et de laisser les clients migrer à leur rythme.

**Valider rigoureusement toutes les données en entrée** est une règle de sécurité absolue. On ne fait jamais confiance aux données envoyées par le client : elles peuvent être malformées, incomplètes, ou délibérément malveillantes. Chaque champ doit être validé en type, longueur, format et valeur avant tout traitement.

**Retourner des messages d'erreur cohérents et utiles** aide les développeurs qui consomment l'API à comprendre rapidement ce qui s'est passé. Un bon message d'erreur contient le code HTTP approprié et un message lisible en français ou en anglais selon la convention choisie.

**Documenter l'API** avec le standard **OpenAPI** (anciennement Swagger) est devenu une norme dans l'industrie. FastAPI le génère automatiquement ; pour Express.js, on peut utiliser la librairie `swagger-jsdoc`.

**Ne jamais exposer les détails internes en production** : les stack traces, les noms de fichiers ou les messages d'erreur de base de données ne doivent jamais être renvoyés à un client externe, car ils constituent un vecteur d'information pour un attaquant potentiel.

---

## 8. Authentification et sécurité

### 8.1 Pourquoi sécuriser une API ?

Une API non sécurisée est une porte d'entrée directe vers les données et les fonctionnalités d'un système. Sans authentification, n'importe quelle personne connaissant l'URL d'un endpoint pourrait lire, modifier ou supprimer des données. En 2019, une fuite de données massive chez Capital One (plus de 100 millions de clients exposés) a été causée en partie par une mauvaise configuration de sécurité sur des services cloud exposant des APIs internes. La sécurité des APIs n'est absolument pas une option.

### 8.2 Les méthodes d'authentification

#### API Key (clé d'API)

C'est la méthode la plus simple. Le fournisseur de l'API délivre une clé unique à chaque client autorisé. Cette clé est transmise dans chaque requête, soit dans le header `Authorization`, soit en paramètre d'URL. Elle est facile à implémenter mais présente un inconvénient majeur : si la clé est compromise — exposée par erreur dans du code versionné sur GitHub, interceptée sur un réseau non sécurisé — elle donne un accès illimité jusqu'à sa révocation manuelle.

```http
GET /api/v1/articles
Authorization: ApiKey a8f3b2c1-d9e4-f5g6-h7i8-j9k0l1m2n3o4
```

#### JWT (JSON Web Token)

Le JWT est le standard moderne pour l'authentification dans les APIs REST. Un JWT est un token signé numériquement, composé de trois parties encodées en Base64url et séparées par des points : le **header** (type de token et algorithme de signature), le **payload** (les données, appelées *claims* : identifiant de l'utilisateur, ses rôles, la date d'expiration), et la **signature** (calculée à partir des deux premières parties et d'une clé secrète connue uniquement du serveur). Cette signature garantit que le token n'a pas été modifié en transit.

Le flux d'authentification JWT fonctionne ainsi : le client envoie ses identifiants au serveur ; le serveur les vérifie et génère un JWT signé avec une durée de vie limitée (par exemple, 1 heure) ; le client inclut ce token dans le header `Authorization` de chaque requête suivante ; le serveur vérifie la signature du token à chaque requête, sans avoir besoin de consulter une base de données, ce qui le rend très scalable.

```http
GET /api/v1/articles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> 📚 Source : [jwt.io/introduction](https://jwt.io/introduction/)

#### OAuth 2.0

OAuth 2.0 est un protocole de délégation d'autorisation. Il permet à un utilisateur d'autoriser une application tierce à accéder à ses données sur un service, **sans lui communiquer son mot de passe**. C'est le mécanisme derrière tous les boutons "Se connecter avec Google", "Continuer avec GitHub" ou "FranceConnect". L'utilisateur s'authentifie auprès du service de confiance, qui délivre un token d'accès à portée limitée à l'application tierce.

### 8.3 Les risques de sécurité courants (OWASP Top 10 API)

L'OWASP (Open Worldwide Application Security Project) publie régulièrement une liste des dix risques de sécurité les plus critiques pour les APIs. En voici les principaux, que tout développeur d'API doit connaître.

L'**authentification brisée** survient quand les mécanismes d'authentification sont mal implémentés : mots de passe stockés en clair, tokens sans expiration, algorithmes de signature obsolètes. La prévention passe par l'utilisation de bibliothèques éprouvées et du HTTPS obligatoire.

L'**exposition excessive de données** est un risque fréquent : l'API renvoie plus d'informations que nécessaire, exposant des données personnelles sensibles ou des informations techniques internes. La règle est de toujours filtrer explicitement les champs renvoyés au client.

L'**injection** (SQL, NoSQL, de commandes shell) survient quand des données non validées provenant de la requête sont utilisées directement dans des requêtes internes sans être assainies. La prévention passe par la validation systématique des entrées et l'utilisation de requêtes préparées.

L'**absence de rate limiting** expose l'API aux attaques par force brute (essayer des milliers de mots de passe) ou par déni de service. Il est indispensable de limiter le nombre de requêtes acceptées par adresse IP sur une période donnée.

> 📚 Source : OWASP API Security Top 10, [owasp.org/www-project-api-security](https://owasp.org/www-project-api-security/)

---

## 9. Tester une API

Tester une API est une étape incontournable du développement. Cela permet de vérifier que les endpoints répondent correctement, que les codes de statut HTTP sont appropriés, que les données renvoyées sont conformes au format attendu, et que les erreurs sont gérées gracieusement.

### 9.1 Postman

Postman est l'outil graphique de référence pour tester des APIs. Il permet d'envoyer des requêtes HTTP de tous types, d'organiser les requêtes en collections réutilisables, de gérer différents environnements (développement, staging, production), d'écrire des tests automatisés en JavaScript, et de générer automatiquement une documentation à partir des collections. C'est l'outil que l'on retrouve dans la très grande majorité des équipes de développement.

> 📥 [postman.com](https://www.postman.com/) — disponible sur Windows, macOS et Linux

### 9.2 curl — l'outil en ligne de commande

`curl` est un outil en ligne de commande disponible nativement sur tous les systèmes Unix (Linux, macOS) et sur Windows depuis la version 10. Il permet d'envoyer des requêtes HTTP directement depuis le terminal, ce qui est très utile pour des tests rapides ou pour automatiser des appels d'API dans des scripts shell.

```bash
# Lister tous les articles (GET)
curl http://localhost:3000/api/v1/articles

# Créer un article (POST)
curl -X POST http://localhost:3000/api/v1/articles \
  -H "Content-Type: application/json" \
  -d '{"titre": "Mon nouvel article", "publie": false}'

# Modifier partiellement un article (PATCH)
curl -X PATCH http://localhost:3000/api/v1/articles/1 \
  -H "Content-Type: application/json" \
  -d '{"publie": true}'

# Supprimer un article (DELETE)
curl -X DELETE http://localhost:3000/api/v1/articles/3
```

### 9.3 REST Client — extension VS Code

L'extension **REST Client** pour Visual Studio Code permet d'écrire et d'exécuter des requêtes HTTP directement dans l'éditeur, dans un fichier `.http`. C'est une alternative légère et pratique à Postman pour des tests rapides sans quitter l'environnement de développement.

```http
@BASE_URL = http://localhost:3000/api/v1

### Lister tous les articles
GET {{BASE_URL}}/articles
Accept: application/json

### Créer un article
POST {{BASE_URL}}/articles
Content-Type: application/json

{
  "titre": "Mon nouvel article",
  "publie": false
}

### Supprimer l'article n°3
DELETE {{BASE_URL}}/articles/3
```

---

## 10. Les APIs dans le monde professionnel

### 10.1 Exemples d'APIs célèbres

Pour prendre la mesure de l'omniprésence des APIs dans le monde réel, voici quelques exemples significatifs issus de domaines variés.

**Stripe** propose une API de paiement utilisée par des millions de sites e-commerce dans le monde. En quelques lignes de code, un développeur peut intégrer un formulaire de paiement sécurisé dans n'importe quelle application web ou mobile, sans avoir à manipuler directement des données bancaires.

**Twilio** est une API de communication qui permet d'envoyer des SMS, de passer des appels téléphoniques automatisés ou d'envoyer des messages via WhatsApp depuis n'importe quelle application. C'est l'API utilisée par de nombreuses startups et grandes entreprises pour envoyer des codes de vérification à deux facteurs ou des alertes.

**OpenAI** expose ses modèles d'intelligence artificielle (GPT-4, Whisper, DALL-E) via une API REST. N'importe quel développeur peut ainsi intégrer des capacités d'IA générative dans ses applications sans avoir à entraîner ses propres modèles — c'est exactement ce que font la plupart des assistants IA que l'on rencontre sur les sites web.

**data.gouv.fr** est le portail Open Data du gouvernement français. Il expose des centaines d'APIs publiques et gratuites donnant accès à des données officielles : adresses postales (API Adresse), établissements scolaires, données de santé, résultats électoraux, qualité de l'air, etc.

### 10.2 APIs publiques gratuites pour s'exercer

Ces APIs gratuites sont idéales pour les travaux pratiques.

| API | Données | URL |
|---|---|---|
| **JSONPlaceholder** | Fausse API de test (articles, users…) | jsonplaceholder.typicode.com |
| **OpenWeatherMap** | Météo en temps réel et prévisions | openweathermap.org/api |
| **PokéAPI** | Données sur tous les Pokémon | pokeapi.co |
| **GitHub REST API** | Dépôts, utilisateurs, commits | docs.github.com/en/rest |
| **API Adresse (gouv.fr)** | Geocodage d'adresses françaises | api.gouv.fr/les-api/base-adresse-nationale |

---

## 11. Ressources et pour aller plus loin

### 📚 Références officielles et fiables

| Ressource | URL |
|---|---|
| MDN Web Docs — HTTP (français) | [developer.mozilla.org/fr/docs/Web/HTTP](https://developer.mozilla.org/fr/docs/Web/HTTP) |
| ECMA-404 — Standard JSON | [json.org/json-fr.html](https://www.json.org/json-fr.html) |
| OpenAPI Specification | [spec.openapis.org](https://spec.openapis.org/oas/latest.html) |
| FastAPI — Documentation officielle | [fastapi.tiangolo.com](https://fastapi.tiangolo.com/) |
| Express.js — Guide officiel | [expressjs.com/fr/guide](https://expressjs.com/fr/guide/routing.html) |
| OWASP API Security Top 10 | [owasp.org/www-project-api-security](https://owasp.org/www-project-api-security/) |
| JWT.io — Introduction | [jwt.io/introduction](https://jwt.io/introduction/) |
| REST API Tutorial | [restapitutorial.com](https://restapitutorial.com/) |
| Grafikart (français) | [grafikart.fr](https://grafikart.fr) |

### 🛠️ Outils à installer

```
Node.js (LTS)   → nodejs.org
Python 3.x      → python.org
Postman         → postman.com
VS Code         → code.visualstudio.com
  Extensions :
    - REST Client (Huachao Mao)
    - Thunder Client (alternative Postman intégrée à VS Code)
    - Prettier (formatage automatique du JSON et du code)
```

---

## Résumé — Ce qu'il faut retenir

| Concept | À retenir |
|---|---|
| **API** | Interface contractuelle permettant à deux applications de communiquer |
| **REST** | Style d'architecture dominant, basé sur HTTP et JSON |
| **Endpoint** | URL précise identifiant une ressource (`/api/v1/articles/15`) |
| **Méthodes HTTP** | GET (lire), POST (créer), PUT/PATCH (modifier), DELETE (supprimer) |
| **Codes HTTP** | 2xx succès · 4xx erreur client · 5xx erreur serveur |
| **JSON** | Format texte d'échange avec 6 types : `string`, `number`, `boolean`, `array`, `object`, `null` |
| **JWT** | Token signé pour l'authentification stateless |
| **OAuth 2.0** | Délégation d'autorisation sans partager son mot de passe |
| **Stateless** | Chaque requête est indépendante, le serveur ne conserve aucun état |
| **Idempotence** | Appeler la même opération plusieurs fois = même résultat qu'une seule fois |

---

> ➡️ **Complément indispensable :** Ce cours s'articule directement avec le cours [Workflow.md](Workflow.md), qui explique comment orchestrer et automatiser des enchaînements d'appels APIs pour construire des processus métier complets.

---

*Cours rédigé dans le cadre de la formation BTS CIEL-IR — Saint-Gabriel, Saint-Laurent-sur-Sèvre.*

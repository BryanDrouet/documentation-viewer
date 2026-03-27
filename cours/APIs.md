# Les APIs — Application Programming Interface

> **Cours de 1ère année — BTS CIEL-IR**  
> Saint-Gabriel, Saint-Laurent-sur-Sèvre  
> Référent pédagogique : Marc VOISIN | Maître de stage : Jocelin THURET (Pixiel)  
> Mis à jour : mars 2026

---

## Table des matières

1. [Introduction — Pourquoi les APIs ?](#1-introduction--pourquoi-les-apis-)
2. [Définition et principes fondamentaux](#2-définition-et-principes-fondamentaux)
3. [Les types d'APIs](#3-les-types-dapis)
4. [Le protocole HTTP — base des APIs Web](#4-le-protocole-http--base-des-apis-web)
5. [Les APIs REST — architecture dominante](#5-les-apis-rest--architecture-dominante)
6. [Créer sa propre API](#6-créer-sa-propre-api)
7. [Authentification et sécurité](#7-authentification-et-sécurité)
8. [Tester une API](#8-tester-une-api)
9. [Les APIs dans le monde professionnel](#9-les-apis-dans-le-monde-professionnel)
10. [Ressources et pour aller plus loin](#10-ressources-et-pour-aller-plus-loin)

---

## 1. Introduction — Pourquoi les APIs ?

Imagine que tu veuilles afficher la météo de Saint-Laurent-sur-Sèvre sur une application. Tu ne vas pas reconstruire tout un système de satellites et de stations météo. Tu vas simplement **demander l'information à un service qui la possède déjà** — c'est exactement ce que fait une API.

> *"Une API est un contrat entre deux logiciels : l'un fournit un service, l'autre le consomme, selon des règles définies à l'avance."*  
> — MDN Web Docs, Mozilla

Les APIs sont omniprésentes dans le développement moderne. Quand tu te connectes avec Google sur une app, quand tu paies en ligne, quand tu reçois une notification push — **une API est en jeu**.

---

## 2. Définition et principes fondamentaux

### 2.1 Définition

**API** signifie **Application Programming Interface** (Interface de Programmation d'Application).

C'est un ensemble de **règles et de conventions** qui permet à deux applications de **communiquer entre elles**, sans avoir besoin de connaître les détails internes de l'une ou de l'autre.

```
[Ton Application]  ──(requête)──▶  [API]  ──▶  [Service / Base de données]
                   ◀──(réponse)──          ◀──
```

### 2.2 Les trois acteurs

| Acteur | Rôle | Exemple |
|---|---|---|
| **Client** | Fait la demande | Ton appli mobile |
| **API** | Interface, point d'entrée | L'endpoint `/api/meteo` |
| **Serveur / BDD** | Fournit la donnée | La base météorologique |

### 2.3 Analogie du restaurant

L'API, c'est comme un **serveur au restaurant** :
- **Toi** = le client (tu ne vas pas en cuisine toi-même)
- **Le serveur** = l'API (il prend ta commande, la transmet, ramène le plat)
- **La cuisine** = le serveur/base de données (traitement interne, invisible pour toi)

> 📚 Source : *Red Hat — What is an API?*, [redhat.com/en/topics/api/what-are-application-programming-interfaces](https://www.redhat.com/en/topics/api/what-are-application-programming-interfaces)

---

## 3. Les types d'APIs

### 3.1 Selon l'accès (visibilité)

| Type | Description | Exemple |
|---|---|---|
| **API Publique (Open API)** | Accessible à tous, parfois avec clé | API OpenWeather, API Google Maps |
| **API Privée** | Réservée en interne à l'entreprise | API interne d'une banque |
| **API Partenaire** | Partagée avec des partenaires sélectionnés | API Stripe pour les e-commerces |
| **API Composite** | Combine plusieurs APIs en une | Agrégateurs de voyage |

### 3.2 Selon l'architecture (style technique)

#### 3.2.1 REST (Representational State Transfer)
- Standard **le plus répandu** aujourd'hui
- Utilise HTTP (GET, POST, PUT, DELETE…)
- Données échangées en **JSON** principalement
- Simple, stateless (sans état), scalable

> 📚 Source : Fielding, R.T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Thèse de doctorat, UC Irvine.

#### 3.2.2 SOAP (Simple Object Access Protocol)
- Protocole plus ancien et plus strict
- Utilise **XML** exclusivement
- Encore présent dans les systèmes bancaires et d'entreprise
- Plus verbeux mais très normé

#### 3.2.3 GraphQL
- Inventé par **Facebook en 2015**, open-sourcé
- Le client demande **exactement** les champs dont il a besoin
- Évite le sur-fetching (récupérer trop de données inutiles)
- Utilisé par GitHub, Shopify, Twitter

```graphql
# Exemple : demander uniquement le nom et l'email d'un utilisateur
query {
  user(id: "42") {
    name
    email
  }
}
```

> 📚 Source : [graphql.org/learn](https://graphql.org/learn/)

#### 3.2.4 WebSocket
- Communication **bidirectionnelle et en temps réel**
- La connexion reste ouverte (contrairement à HTTP)
- Utilisé pour les chats, les jeux en ligne, les cours de bourse en direct

#### 3.2.5 gRPC
- Développé par **Google**
- Très performant, utilise **Protocol Buffers** (binaire, compact)
- Utilisé pour la communication entre **microservices**

### 3.3 Tableau comparatif

| Critère | REST | SOAP | GraphQL | WebSocket |
|---|---|---|---|---|
| Format | JSON / XML | XML | JSON | Binaire / JSON |
| Complexité | Faible | Élevée | Moyenne | Moyenne |
| Temps réel | ✗ | ✗ | ✗ | ✓ |
| Flexibilité | Moyenne | Faible | Élevée | Moyenne |
| Cas d'usage | Web / Mobile | Entreprise | APIs flexibles | Temps réel |

---

## 4. Le protocole HTTP — base des APIs Web

La majorité des APIs modernes reposent sur **HTTP** (HyperText Transfer Protocol).

### 4.1 Les méthodes HTTP (verbes)

| Méthode | Action | Analogie |
|---|---|---|
| `GET` | Lire une ressource | Consulter un dossier |
| `POST` | Créer une ressource | Déposer un nouveau dossier |
| `PUT` | Remplacer une ressource | Remplacer tout un dossier |
| `PATCH` | Modifier partiellement | Modifier une page du dossier |
| `DELETE` | Supprimer une ressource | Détruire le dossier |

### 4.2 Les codes de statut HTTP

| Code | Signification | Catégorie |
|---|---|---|
| `200 OK` | Succès | ✅ Succès |
| `201 Created` | Ressource créée | ✅ Succès |
| `400 Bad Request` | Requête mal formée | ⚠️ Erreur client |
| `401 Unauthorized` | Non authentifié | ⚠️ Erreur client |
| `403 Forbidden` | Accès refusé | ⚠️ Erreur client |
| `404 Not Found` | Ressource introuvable | ⚠️ Erreur client |
| `500 Internal Server Error` | Erreur côté serveur | ❌ Erreur serveur |

> 📚 Source : [developer.mozilla.org/fr/docs/Web/HTTP/Status](https://developer.mozilla.org/fr/docs/Web/HTTP/Status)

### 4.3 Structure d'une requête HTTP

```
GET /api/users/42 HTTP/1.1
Host: api.exemple.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Accept: application/json
```

### 4.4 Structure d'une réponse HTTP

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 42,
  "nom": "DROUET",
  "prenom": "Bryan",
  "email": "bryan@exemple.com"
}
```

---

## 5. Les APIs REST — architecture dominante

### 5.1 Les 6 principes REST

Définis par Roy Fielding dans sa thèse (2000), une API REST respecte :

1. **Client-Serveur** : séparation claire entre interface et logique métier
2. **Sans état (Stateless)** : chaque requête est indépendante, le serveur ne "mémorise" pas
3. **Mise en cache (Cacheable)** : les réponses peuvent être mises en cache
4. **Interface uniforme** : des URLs cohérentes et prévisibles
5. **Système en couches** : le client ne sait pas s'il parle au serveur final ou à un proxy
6. **Code à la demande** (optionnel) : le serveur peut envoyer du code exécutable

### 5.2 Conception des endpoints (URLs)

```
# Bonne pratique : noms au pluriel, hiérarchie logique

GET    /api/projets              → Lister tous les projets
POST   /api/projets              → Créer un projet
GET    /api/projets/5            → Obtenir le projet n°5
PUT    /api/projets/5            → Modifier entièrement le projet n°5
PATCH  /api/projets/5            → Modifier partiellement le projet n°5
DELETE /api/projets/5            → Supprimer le projet n°5

GET    /api/projets/5/photos     → Photos du projet n°5
```

### 5.3 Le format JSON

**JSON** (JavaScript Object Notation) est le format d'échange standard des APIs REST.

```json
{
  "projet": {
    "id": 1,
    "titre": "Site Pixiel",
    "client": "Jocelin THURET",
    "tags": ["photographie", "web", "vitrine"],
    "actif": true,
    "budget": 2500.00,
    "contact": null
  }
}
```

**Types de données JSON :**
- `string` → `"texte"`
- `number` → `42` ou `3.14`
- `boolean` → `true` / `false`
- `array` → `[1, 2, 3]`
- `object` → `{ "clé": "valeur" }`
- `null` → absence de valeur

> 📚 Source : [json.org/json-fr.html](https://www.json.org/json-fr.html)

---

## 6. Créer sa propre API

> ⭐ **Point clé de la réunion du 27 mars** — Focus sur la création d'API.

### 6.1 Choisir un langage / framework

| Langage | Framework | Points forts |
|---|---|---|
| **JavaScript** | Express.js, Fastify | Rapide à démarrer, npm, full-stack |
| **Python** | FastAPI, Flask, Django REST | Lisible, communauté énorme |
| **PHP** | Laravel (Sanctum), Slim | Hébergement simple, répandu |
| **Java** | Spring Boot | Robuste, entreprise |
| **Go** | Gin, Fiber | Très performant |

Pour un BTS CIEL-IR, **Express.js (Node.js)** ou **FastAPI (Python)** sont des choix pédagogiques idéaux.

### 6.2 Exemple concret — API REST avec Express.js

#### Installation

```bash
mkdir mon-api && cd mon-api
npm init -y
npm install express
```

#### Code de base (`index.js`)

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware pour lire le JSON dans les requêtes
app.use(express.json());

// Données simulées (en production : base de données)
let projets = [
  { id: 1, titre: "Site vitrine Pixiel", client: "Jocelin THURET" },
  { id: 2, titre: "App mobile photos", client: "Client B" }
];

// GET /api/projets — Lister tous les projets
app.get('/api/projets', (req, res) => {
  res.status(200).json(projets);
});

// GET /api/projets/:id — Obtenir un projet par ID
app.get('/api/projets/:id', (req, res) => {
  const projet = projets.find(p => p.id === parseInt(req.params.id));
  if (!projet) {
    return res.status(404).json({ erreur: "Projet introuvable" });
  }
  res.status(200).json(projet);
});

// POST /api/projets — Créer un nouveau projet
app.post('/api/projets', (req, res) => {
  const { titre, client } = req.body;
  if (!titre || !client) {
    return res.status(400).json({ erreur: "Titre et client sont requis" });
  }
  const nouveauProjet = {
    id: projets.length + 1,
    titre,
    client
  };
  projets.push(nouveauProjet);
  res.status(201).json(nouveauProjet);
});

// DELETE /api/projets/:id — Supprimer un projet
app.delete('/api/projets/:id', (req, res) => {
  const index = projets.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ erreur: "Projet introuvable" });
  }
  projets.splice(index, 1);
  res.status(200).json({ message: "Projet supprimé" });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`API démarrée sur http://localhost:${PORT}`);
});
```

#### Lancer l'API

```bash
node index.js
# → API démarrée sur http://localhost:3000
```

### 6.3 Exemple avec FastAPI (Python)

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="API Projets Pixiel", version="1.0.0")

# Modèle de données
class Projet(BaseModel):
    titre: str
    client: str

# Données simulées
projets = [
    {"id": 1, "titre": "Site vitrine Pixiel", "client": "Jocelin THURET"},
]

@app.get("/api/projets")
def lister_projets():
    return projets

@app.get("/api/projets/{projet_id}")
def obtenir_projet(projet_id: int):
    projet = next((p for p in projets if p["id"] == projet_id), None)
    if not projet:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    return projet

@app.post("/api/projets", status_code=201)
def creer_projet(projet: Projet):
    nouveau = {"id": len(projets) + 1, **projet.dict()}
    projets.append(nouveau)
    return nouveau
```

> FastAPI génère automatiquement une documentation interactive à `http://localhost:8000/docs` (Swagger UI). 🔥

> 📚 Sources :  
> - [expressjs.com](https://expressjs.com/)  
> - [fastapi.tiangolo.com](https://fastapi.tiangolo.com/)

### 6.4 Bonnes pratiques de conception

1. **Versionner son API** : `/api/v1/projets` pour pouvoir évoluer sans casser les clients existants
2. **Toujours retourner du JSON** cohérent, même pour les erreurs
3. **Valider les données** en entrée (ne jamais faire confiance au client)
4. **Utiliser les bons codes HTTP** (ne pas tout renvoyer en 200)
5. **Documenter** avec Swagger/OpenAPI
6. **Ne jamais exposer les détails d'erreur en production** (pas de stack trace !)

---

## 7. Authentification et sécurité

### 7.1 Les méthodes d'authentification

#### API Key (clé API)
- La méthode la plus simple
- Clé unique transmise dans le header ou l'URL
- Facile à implémenter, mais si la clé est volée = accès total

```http
GET /api/projets
Authorization: ApiKey sk-a8f3b2c1d9e4f5g6
```

#### JWT (JSON Web Token)
- Standard moderne, très répandu
- Token signé contenant les informations de l'utilisateur
- Composé de 3 parties : `Header.Payload.Signature` (encodées en Base64)
- Durée de vie limitée (ex : 1 heure)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQyLCJleHAiOjE3NDMyMTI4MDB9.xT9rM2kP...
```

> 📚 Source : [jwt.io/introduction](https://jwt.io/introduction/)

#### OAuth 2.0
- Standard pour **déléguer l'accès** sans partager son mot de passe
- "Se connecter avec Google / GitHub" = OAuth 2.0
- Flux d'autorisation complexe mais très sécurisé

### 7.2 Les risques de sécurité courants (OWASP Top 10 API)

| Risque | Description | Prévention |
|---|---|---|
| **Broken Authentication** | Auth mal implémentée | JWT bien configuré, HTTPS obligatoire |
| **Excessive Data Exposure** | Retourner trop de données | Filtrer les champs retournés |
| **Injection** | SQL/NoSQL injection via l'API | Valider et échapper les entrées |
| **Rate Limiting absent** | Attaque par force brute | Limiter le nombre de requêtes par IP |
| **CORS mal configuré** | Accès depuis n'importe quel domaine | Whitelist des origines autorisées |

> 📚 Source : OWASP API Security Top 10, [owasp.org/API-Security](https://owasp.org/www-project-api-security/)

---

## 8. Tester une API

### 8.1 Postman

**Postman** est l'outil de référence pour tester des APIs.

- Interface graphique intuitive
- Gestion des environnements (dev, prod)
- Tests automatisés
- Génération de documentation

> 📥 [postman.com](https://www.postman.com/)

### 8.2 curl (ligne de commande)

```bash
# GET — Lister les projets
curl http://localhost:3000/api/projets

# POST — Créer un projet
curl -X POST http://localhost:3000/api/projets \
  -H "Content-Type: application/json" \
  -d '{"titre": "Nouveau projet", "client": "Bryan DROUET"}'

# DELETE — Supprimer le projet n°1
curl -X DELETE http://localhost:3000/api/projets/1
```

### 8.3 REST Client (extension VS Code)

Fichier `.http` dans VS Code avec l'extension **REST Client** :

```http
### Lister les projets
GET http://localhost:3000/api/projets
Accept: application/json

### Créer un projet
POST http://localhost:3000/api/projets
Content-Type: application/json

{
  "titre": "Site Pixiel v2",
  "client": "Jocelin THURET"
}
```

---

## 9. Les APIs dans le monde professionnel

### 9.1 Chez Pixiel (contexte de stage)

Dans le contexte du stage chez **Pixiel** (studio photo/web de Jocelin THURET), les APIs peuvent intervenir pour :

- Récupérer et afficher un catalogue photo depuis un CMS headless (ex : Strapi, Contentful)
- Intégrer un système de paiement (API Stripe)
- Envoyer des e-mails automatisés (API SendGrid, Mailgun)
- Connecter un formulaire de contact à un CRM
- Automatiser des publications sur les réseaux sociaux (API Instagram Graph, LinkedIn)
- Recevoir des notifications via Slack (API Slack Webhooks)

### 9.2 APIs publiques utiles pour s'exercer

| API | Utilité | Documentation |
|---|---|---|
| [JSONPlaceholder](https://jsonplaceholder.typicode.com/) | Fausse API pour tests | jsonplaceholder.typicode.com |
| [OpenWeatherMap](https://openweathermap.org/api) | Météo en temps réel | openweathermap.org/api |
| [The Cat API](https://thecatapi.com/) | Images de chats | thecatapi.com |
| [PokéAPI](https://pokeapi.co/) | Données Pokémon | pokeapi.co |
| [GitHub API](https://docs.github.com/en/rest) | Données GitHub | docs.github.com/en/rest |

---

## 10. Ressources et pour aller plus loin

### 📚 Références officielles

| Ressource | URL |
|---|---|
| MDN Web Docs — HTTP | [developer.mozilla.org/fr/docs/Web/HTTP](https://developer.mozilla.org/fr/docs/Web/HTTP) |
| REST API Tutorial | [restapitutorial.com](https://restapitutorial.com/) |
| OpenAPI Specification | [spec.openapis.org](https://spec.openapis.org/oas/latest.html) |
| FastAPI Documentation | [fastapi.tiangolo.com](https://fastapi.tiangolo.com/) |
| Express.js Guide | [expressjs.com/fr/guide](https://expressjs.com/fr/guide/routing.html) |
| OWASP API Security | [owasp.org/API-Security](https://owasp.org/www-project-api-security/) |
| JWT.io | [jwt.io](https://jwt.io/) |

### 🎥 Vidéos recommandées

- **Grafikart** — *Les bases des APIs REST* (français) : [grafikart.fr](https://grafikart.fr)
- **Fireship** — *APIs Explained* (anglais, sous-titré) : YouTube
- **Traversy Media** — *Express.js Crash Course* : YouTube

### 🛠️ Outils à installer

```
✓ Node.js          → nodejs.org
✓ Postman          → postman.com
✓ VS Code          → code.visualstudio.com
  + Extension : REST Client (Huachao Mao)
✓ Python + pip     → python.org (pour FastAPI)
```

---

## Résumé — Ce qu'il faut retenir

| Concept | Définition rapide |
|---|---|
| **API** | Interface permettant à deux apps de communiquer |
| **REST** | Style d'architecture API dominant, basé sur HTTP/JSON |
| **Endpoint** | Une URL précise de l'API (`/api/projets/5`) |
| **HTTP Verbs** | GET (lire), POST (créer), PUT/PATCH (modifier), DELETE (supprimer) |
| **JSON** | Format d'échange de données standard |
| **JWT** | Token sécurisé pour l'authentification |
| **Status Code** | Code de réponse HTTP (200 OK, 404 Not Found, 500 Error…) |

---

*Cours rédigé dans le cadre de la formation BTS CIEL-IR — Saint-Gabriel, Saint-Laurent-sur-Sèvre.*  
*Contexte de stage : Pixiel — Contact via Slack.*

# Les Workflows — Automatisation et orchestration des processus

> **Cours de 1ère année — BTS CIEL-IR**  
> Saint-Gabriel, Saint-Laurent-sur-Sèvre  
> Référent pédagogique : Marc VOISIN | Maître de stage : Jocelin THURET (Pixiel)  
> Mis à jour : mars 2026

---

## Table des matières

1. [Introduction — Qu'est-ce qu'un workflow ?](#1-introduction--quest-ce-quun-workflow-)
2. [Vocabulaire et concepts fondamentaux](#2-vocabulaire-et-concepts-fondamentaux)
3. [Les types de workflows](#3-les-types-de-workflows)
4. [Workflows et APIs — une combinaison puissante](#4-workflows-et-apis--une-combinaison-puissante)
5. [Outils No-Code / Low-Code de workflow](#5-outils-no-code--low-code-de-workflow)
6. [Workflows de développement (CI/CD)](#6-workflows-de-développement-cicd)
7. [Créer un workflow soi-même](#7-créer-un-workflow-soi-même)
8. [Les workflows dans le monde professionnel](#8-les-workflows-dans-le-monde-professionnel)
9. [Bonnes pratiques](#9-bonnes-pratiques)
10. [Ressources et pour aller plus loin](#10-ressources-et-pour-aller-plus-loin)

---

## 1. Introduction — Qu'est-ce qu'un workflow ?

**Workflow** vient de l'anglais : *work* (travail) + *flow* (flux). On peut le traduire par **flux de travail** ou **processus automatisé**.

Un workflow, c'est une **suite d'étapes ordonnées et automatisées** qui permettent d'accomplir une tâche ou un processus métier — souvent en réponse à un événement déclencheur.

### Exemple concret du quotidien

> Quelqu'un remplit un formulaire de contact sur le site de **Pixiel** →  
> → Un e-mail de confirmation lui est envoyé automatiquement  
> → Jocelin reçoit une notification sur **Slack**  
> → Le contact est ajouté au CRM  
> → Une tâche de suivi est créée dans l'outil de gestion de projets  

Tout cela sans intervention humaine : **c'est un workflow.**

> *"L'automatisation n'est pas de la paresse, c'est de l'intelligence organisationnelle."*  
> — Réflexion courante dans les équipes DevOps

---

## 2. Vocabulaire et concepts fondamentaux

### 2.1 Les éléments d'un workflow

| Terme | Définition | Exemple |
|---|---|---|
| **Trigger / Déclencheur** | L'événement qui démarre le workflow | Formulaire soumis, e-mail reçu, heure fixe |
| **Action** | Une tâche exécutée automatiquement | Envoyer un e-mail, créer une ligne en BDD |
| **Condition** | Une règle qui oriente le flux | "Si le client est premium, alors…" |
| **Branche** | Un chemin alternatif selon une condition | Si/Sinon (If/Else) |
| **Loop / Boucle** | Répétition d'une action | Traiter chaque photo d'un dossier |
| **Étape (Step/Node)** | Un maillon du workflow | Chaque bloc dans n8n ou Make |

### 2.2 Représentation visuelle

Un workflow peut être représenté sous forme de **diagramme de flux** :

```
[Déclencheur]
      │
      ▼
[Action 1] ──── Erreur ? ──▶ [Gérer l'erreur]
      │
      ▼
[Condition]
   /       \
 Oui       Non
  │         │
  ▼         ▼
[Action 2] [Action 3]
      │
      ▼
  [Fin / Succès]
```

### 2.3 Synchrone vs Asynchrone

| Type | Description | Exemple |
|---|---|---|
| **Synchrone** | L'étape suivante attend la fin de la précédente | Valider le paiement AVANT de confirmer la commande |
| **Asynchrone** | Les étapes peuvent tourner en parallèle | Envoyer un e-mail ET notifier Slack en même temps |

> 📚 Source : *IBM — What is a workflow?*, [ibm.com/topics/workflow](https://www.ibm.com/topics/workflow)

---

## 3. Les types de workflows

### 3.1 Workflow Séquentiel

Les étapes s'enchaînent dans un ordre fixe, l'une après l'autre.

```
[Étape 1] → [Étape 2] → [Étape 3] → [Fin]
```

**Exemples :** Processus de validation d'une commande, chaîne de compilation d'un code.

### 3.2 Workflow Parallèle

Plusieurs branches s'exécutent simultanément, puis convergent.

```
           ┌─▶ [Branche A] ─┐
[Départ] ──┤                ├──▶ [Jonction] → [Fin]
           └─▶ [Branche B] ─┘
```

**Exemples :** Traitement d'images en batch, tests automatisés en parallèle.

### 3.3 Workflow Conditionnel (Basé sur des règles)

Des conditions déterminent quel chemin emprunter.

```
[Commande reçue]
        │
   ─────┴─────
  Stock dispo ?
   Oui │   │ Non
       ▼   ▼
 [Préparer] [Commander au fournisseur]
```

### 3.4 Workflow Événementiel

Déclenché par des événements externes : webhook, message dans une file d'attente, etc.

**Exemples :** Un push sur GitHub déclenche les tests → déploiement en production.

### 3.5 Workflow BPMN (Business Process Model and Notation)

Standard international pour **modéliser graphiquement les processus métier**.

- Utilisé en entreprise pour documenter des processus complexes
- Logiciels : Camunda, Bizagi, draw.io

> 📚 Source : OMG — *Business Process Model and Notation (BPMN) 2.0*, [omg.org/spec/BPMN](https://www.omg.org/spec/BPMN/2.0/)

---

## 4. Workflows et APIs — une combinaison puissante

Les workflows modernes **s'appuient massivement sur les APIs** pour connecter des services entre eux.

### 4.1 Le principe : event → API call → action

```
[Événement déclencheur]
         │
         ▼
[Appel API vers Service A]
         │
         ▼
[Traitement / Condition]
         │
         ▼
[Appel API vers Service B]
```

### 4.2 Exemples concrets liés à Pixiel

| Déclencheur | Action via API | Service appelé |
|---|---|---|
| Nouveau message sur le site | Notification Slack | API Slack Webhooks |
| Photo uploadée | Resize automatique | API Cloudinary |
| Facture créée | E-mail au client | API SendGrid / Mailgun |
| Nouveau follower Instagram | Ajout au CRM | API Instagram Graph |
| Tâche complétée dans Notion | Message d'avancement sur Slack | API Notion + Slack |

### 4.3 Les Webhooks

Un **webhook** est une façon pour un service de **notifier activement** un autre dès qu'un événement se produit — à l'inverse d'une API classique où c'est le client qui interroge en boucle (polling).

```
Approche Polling (inefficace) :        Approche Webhook (efficace) :
                                        
Mon app → "Rien de nouveau ?"          [Événement se produit]
Service → "Non"                              │
Mon app → "Et maintenant ?"                  ▼
Service → "Non"                         Service → [Notifie mon app]
Mon app → "Et là ?"                          │
Service → "OUI, voilà l'événement"           ▼
                                        Mon app traite l'événement
```

> 📚 Source : [webhook.site](https://webhook.site/) — outil pour tester ses webhooks

---

## 5. Outils No-Code / Low-Code de workflow

Ces outils permettent de créer des workflows **visuellement, sans écrire de code** (ou très peu).

### 5.1 n8n (open-source ⭐ recommandé)

- **Open-source**, auto-hébergeable (contrôle total)
- Interface visuelle avec des nœuds (nodes) à connecter
- +400 intégrations disponibles (Slack, Gmail, GitHub, HTTP Request…)
- Peut exécuter du code JavaScript dans les nœuds
- Gratuit si hébergé soi-même

```
[Webhook] → [HTTP Request API] → [Condition] → [Slack] → [Gmail]
```

> 📚 [n8n.io](https://n8n.io/) | [docs.n8n.io](https://docs.n8n.io/)

### 5.2 Make (anciennement Integromat)

- Interface très visuelle et intuitive
- Version gratuite disponible
- Idéal pour connecter des services SaaS rapidement

> 📚 [make.com](https://www.make.com/)

### 5.3 Zapier

- Le plus populaire commercialement
- Très simple d'utilisation
- Moins flexible que n8n, mais très rapide à déployer
- Principalement payant

> 📚 [zapier.com](https://zapier.com/)

### 5.4 Comparatif des outils

| Critère | n8n | Make | Zapier |
|---|---|---|---|
| Prix | Gratuit (self-hosted) | Freemium | Freemium |
| Open-source | ✓ | ✗ | ✗ |
| Complexité | Moyenne | Faible | Très faible |
| Flexibilité | Très élevée | Élevée | Moyenne |
| Auto-hébergement | ✓ | ✗ | ✗ |
| Intégrations | +400 | +1500 | +6000 |

> 📚 Source : Comparatif [n8n.io/vs/zapier](https://n8n.io/vs/zapier/), [n8n.io/vs/make](https://n8n.io/vs/make/)

---

## 6. Workflows de développement (CI/CD)

Dans le monde du développement logiciel, un **pipeline CI/CD** est un workflow automatisé qui permet de livrer du code en production de façon fiable et rapide.

### 6.1 Définitions

| Terme | Signification | Description |
|---|---|---|
| **CI** | Continuous Integration | Intégration continue : tester le code automatiquement à chaque commit |
| **CD** | Continuous Delivery/Deployment | Livraison/déploiement continu : déployer automatiquement en production |

### 6.2 Le pipeline type

```
[Dev écrit du code]
        │
        ▼ Git push
[Déclencheur CI/CD]
        │
        ├──▶ [Lint] (vérification syntaxe)
        │
        ├──▶ [Tests unitaires]
        │
        ├──▶ [Build] (compilation)
        │
        └──▶ [Déploiement] (si tout est vert ✓)
                │
                ▼
          [Production 🚀]
```

### 6.3 GitHub Actions — Exemple concret

**GitHub Actions** est l'outil CI/CD intégré à GitHub. Les workflows sont définis en **YAML**.

```yaml
# .github/workflows/deploy.yml

name: CI/CD Pipeline

on:
  push:
    branches: [ main ]  # Déclencheur : push sur la branche main

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # 1. Récupérer le code
      - name: Checkout du code
        uses: actions/checkout@v4

      # 2. Installer Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      # 3. Installer les dépendances
      - name: Installation des dépendances
        run: npm install

      # 4. Lancer les tests
      - name: Lancer les tests
        run: npm test

      # 5. Déployer si les tests passent
      - name: Déploiement
        run: npm run deploy
        env:
          API_KEY: ${{ secrets.DEPLOY_API_KEY }}
```

> 📚 Source : [docs.github.com/fr/actions](https://docs.github.com/fr/actions)

### 6.4 Autres outils CI/CD

| Outil | Particularité |
|---|---|
| **GitHub Actions** | Intégré à GitHub, gratuit pour les projets publics |
| **GitLab CI/CD** | Intégré à GitLab, très puissant |
| **Jenkins** | Open-source, auto-hébergeable, très configurable |
| **CircleCI** | Cloud, rapide, bonne ergonomie |

---

## 7. Créer un workflow soi-même

### 7.1 Avec n8n — Exemple pratique

**Scénario :** Quand quelqu'un soumet un formulaire de contact sur le site Pixiel, envoyer une notification Slack.

**Étapes dans n8n :**

```
1. [Webhook Node]
   → Reçoit les données du formulaire (déclencheur)

2. [Set Node]
   → Formater le message : "Nouveau contact : {{nom}} - {{email}}"

3. [Slack Node]
   → Envoyer le message dans #nouveaux-contacts

4. [Gmail Node] (optionnel)
   → Envoyer un e-mail de confirmation à l'expéditeur
```

### 7.2 En code — Exemple avec Node.js

Parfois, il faut créer un workflow personnalisé directement en code. Voici un script qui traite un dossier d'images et envoie un rapport :

```javascript
const fs = require('fs');
const path = require('path');

// Configuration
const DOSSIER_IMAGES = './images';
const WEBHOOK_SLACK = 'https://hooks.slack.com/services/TON_WEBHOOK';

// Étape 1 : Lire le dossier d'images
async function listerImages(dossier) {
  const fichiers = fs.readdirSync(dossier);
  return fichiers.filter(f => ['.jpg', '.jpeg', '.png'].includes(
    path.extname(f).toLowerCase()
  ));
}

// Étape 2 : Traiter chaque image (simulé)
async function traiterImage(image) {
  console.log(`Traitement de : ${image}`);
  // Ici : resize, compression, watermark, etc.
  return { fichier: image, statut: 'traité', taille: '1.2 MB → 340 KB' };
}

// Étape 3 : Notifier sur Slack
async function notifierSlack(rapport) {
  const message = {
    text: `✅ Traitement terminé : ${rapport.length} images traitées`
  };
  
  await fetch(WEBHOOK_SLACK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
}

// Workflow principal
async function runWorkflow() {
  console.log('🚀 Démarrage du workflow...');
  
  // Étape 1
  const images = await listerImages(DOSSIER_IMAGES);
  console.log(`📁 ${images.length} images trouvées`);
  
  // Étape 2 — Traitement en parallèle
  const rapports = await Promise.all(images.map(traiterImage));
  
  // Étape 3
  await notifierSlack(rapports);
  console.log('✅ Workflow terminé !');
}

runWorkflow().catch(console.error);
```

### 7.3 Gestion des erreurs dans un workflow

Un workflow robuste **anticipe les échecs** :

```javascript
async function runWorkflowAvecGestionErreurs() {
  try {
    // Étape 1
    const images = await listerImages(DOSSIER_IMAGES);
    
    // Étape 2 — Avec retry en cas d'échec
    const rapports = [];
    for (const image of images) {
      let tentatives = 0;
      while (tentatives < 3) {
        try {
          const rapport = await traiterImage(image);
          rapports.push(rapport);
          break; // Succès → on sort de la boucle
        } catch (err) {
          tentatives++;
          console.warn(`⚠️ Échec tentative ${tentatives}/3 pour ${image}`);
          if (tentatives === 3) {
            rapports.push({ fichier: image, statut: 'ERREUR', erreur: err.message });
          }
        }
      }
    }
    
    // Étape 3
    await notifierSlack(rapports);
    
  } catch (erreurCritique) {
    // Alerter en cas d'erreur majeure
    console.error('❌ Erreur critique dans le workflow :', erreurCritique);
    // Notifier les admins, enregistrer dans les logs…
  }
}
```

---

## 8. Les workflows dans le monde professionnel

### 8.1 Chez Pixiel — cas d'usage concrets

| Workflow | Déclencheur | Actions automatisées |
|---|---|---|
| **Onboarding client** | Signature de devis | E-mail de bienvenue + création dossier Drive + invitation Slack |
| **Livraison de photos** | Upload terminé | Notification client + génération lien téléchargement + archivage |
| **Facturation** | Projet marqué "terminé" | Génération facture PDF + envoi par mail + relance J+30 si impayé |
| **Publication réseaux** | Photo validée | Post Instagram + LinkedIn + archivage |
| **Rapport hebdomadaire** | Chaque lundi 8h | Synthèse des projets en cours envoyée sur Slack |

### 8.2 Slack comme hub central

Comme évoqué lors de la réunion du 27 mars, **Slack** sera l'outil de communication principal pendant le stage. Slack dispose d'une API puissante pour intégrer des workflows :

- **Incoming Webhooks** : envoyer des messages automatisés dans un canal
- **Slash Commands** : créer des commandes personnalisées (`/statut-projet`)
- **Bot Slack** : créer un assistant conversationnel dans Slack
- **Slack Workflow Builder** : outil no-code intégré à Slack

```javascript
// Exemple : envoyer un message dans Slack via Webhook
const payload = {
  blocks: [
    {
      type: "header",
      text: { type: "plain_text", text: "📸 Nouveau projet Pixiel" }
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: "*Client:*\nJocelin THURET" },
        { type: "mrkdwn", text: "*Statut:*\nEn cours ✅" }
      ]
    }
  ]
};

await fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

> 📚 Source : [api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks)

### 8.3 Les workflows dans le développement web moderne

| Type | Outil | Rôle |
|---|---|---|
| **CI/CD** | GitHub Actions | Tester + déployer automatiquement |
| **Linting** | ESLint + Husky | Vérifier le code avant chaque commit |
| **Formatage** | Prettier | Formater le code automatiquement |
| **Dépendances** | Dependabot | Mettre à jour les librairies automatiquement |
| **Monitoring** | UptimeRobot | Alerter si le site tombe |

---

## 9. Bonnes pratiques

### 9.1 Concevoir un workflow

1. **Commencer par le papier** : dessiner le flux avant de coder
2. **Identifier clairement le déclencheur** : qu'est-ce qui lance le processus ?
3. **Décomposer en étapes atomiques** : chaque étape = une seule responsabilité
4. **Prévoir les cas d'erreur** : que se passe-t-il si une étape échoue ?
5. **Documenter** : un workflow non documenté devient une boîte noire

### 9.2 Rendre un workflow robuste

| Bonne pratique | Description |
|---|---|
| **Idempotence** | Exécuter le workflow 2 fois = même résultat que 1 fois |
| **Retry logic** | Réessayer en cas d'échec (max 3 tentatives) |
| **Timeout** | Définir un délai max pour chaque étape |
| **Logging** | Enregistrer chaque étape pour le débogage |
| **Alerting** | Être notifié en cas d'échec critique |
| **Dry run** | Tester le workflow sans effectuer d'actions réelles |

### 9.3 Sécurité des workflows

- **Ne jamais hard-coder** des clés API ou mots de passe dans le code → utiliser des **variables d'environnement** (`.env`)
- **Valider les données d'entrée** des webhooks (vérifier la signature)
- **Limiter les permissions** : un workflow ne doit avoir accès qu'à ce dont il a besoin
- **Chiffrer les secrets** dans les outils CI/CD (GitHub Secrets, etc.)

```bash
# Mauvaise pratique ❌
const API_KEY = "sk-abc123def456";

# Bonne pratique ✓
const API_KEY = process.env.API_KEY;
```

```
# Fichier .env (jamais commité sur Git !)
API_KEY=sk-abc123def456
SLACK_WEBHOOK=https://hooks.slack.com/services/...
```

---

## 10. Ressources et pour aller plus loin

### 📚 Références officielles

| Ressource | URL |
|---|---|
| n8n Documentation | [docs.n8n.io](https://docs.n8n.io/) |
| GitHub Actions | [docs.github.com/fr/actions](https://docs.github.com/fr/actions) |
| Slack API | [api.slack.com](https://api.slack.com/) |
| Make (Integromat) | [make.com/en/help](https://www.make.com/en/help) |
| BPMN 2.0 Spec | [omg.org/spec/BPMN/2.0](https://www.omg.org/spec/BPMN/2.0/) |
| Webhook.site (test) | [webhook.site](https://webhook.site/) |

### 🎥 Vidéos recommandées

- **Grafikart** — Automatisation avec n8n (français)
- **NetworkChuck** — GitHub Actions CI/CD (anglais, sous-titré)
- **Traversy Media** — Webhooks Explained (anglais)

### 🛠️ Outils à explorer

```
✓ n8n               → n8n.io (installer en local avec Docker ou npm)
✓ Webhook.site      → tester ses webhooks en ligne
✓ GitHub Actions    → intégré à GitHub (aucune installation)
✓ draw.io           → dessiner ses diagrammes de workflow
✓ Postman           → simuler des webhooks entrants
```

### 📖 Pour aller plus loin

- **Automatiser avec Python** : librairie `schedule` pour les tâches planifiées
- **Files de messages** : RabbitMQ, Apache Kafka pour les workflows à grande échelle
- **Orchestration de conteneurs** : Kubernetes pour orchestrer des microservices
- **Serverless** : AWS Lambda, Vercel Functions pour déclencher des workflows sans serveur

---

## Résumé — Ce qu'il faut retenir

| Concept | Définition rapide |
|---|---|
| **Workflow** | Suite d'étapes automatisées déclenchées par un événement |
| **Trigger** | L'événement qui lance le workflow (formulaire, heure, push Git…) |
| **Action** | Une tâche automatique (envoyer un e-mail, appeler une API…) |
| **Condition** | Une règle qui oriente le flux (Si/Sinon) |
| **Webhook** | Notification instantanée d'un service vers un autre |
| **CI/CD** | Pipeline de test et déploiement automatique du code |
| **n8n** | Outil open-source de création de workflows visuels |
| **GitHub Actions** | CI/CD intégré à GitHub, configuré en YAML |

---

## Lien avec le cours APIs

Les workflows et les APIs sont **complémentaires** :
- Les **APIs** exposent des fonctionnalités et des données
- Les **workflows** orchestrent et automatisent l'appel de ces APIs

> ➡️ Voir le cours [APIs.md](APIs.md) pour les bases des APIs REST, HTTP et la création d'API.

---

*Cours rédigé dans le cadre de la formation BTS CIEL-IR — Saint-Gabriel, Saint-Laurent-sur-Sèvre.*  
*Contexte de stage : Pixiel — Contact et suivi via Slack.*

# Les Workflows — Automatisation et orchestration des processus

> **Cours de 1ère année — BTS CIEL-IR**  
> Saint-Gabriel, Saint-Laurent-sur-Sèvre  
> Référent pédagogique : Marc VOISIN  
> Mis à jour : mars 2026

---

## Table des matières

1. [Introduction — Qu'est-ce qu'un workflow ?](#1-introduction--quest-ce-quun-workflow-)
2. [Vocabulaire et concepts fondamentaux](#2-vocabulaire-et-concepts-fondamentaux)
3. [Les types de workflows](#3-les-types-de-workflows)
4. [Workflows et APIs — une combinaison puissante](#4-workflows-et-apis--une-combinaison-puissante)
5. [Les webhooks](#5-les-webhooks)
6. [Outils No-Code / Low-Code de workflow](#6-outils-no-code--low-code-de-workflow)
7. [Workflows de développement — CI/CD](#7-workflows-de-développement--cicd)
8. [Créer un workflow en code](#8-créer-un-workflow-en-code)
9. [Bonnes pratiques](#9-bonnes-pratiques)
10. [Ressources et pour aller plus loin](#10-ressources-et-pour-aller-plus-loin)

---

## 1. Introduction — Qu'est-ce qu'un workflow ?

**Workflow** vient de l'anglais : *work* (travail) et *flow* (flux). On le traduit généralement par **flux de travail** ou **processus automatisé**. Dans le domaine de l'informatique et du développement logiciel, un workflow désigne une **suite d'étapes ordonnées et automatisées** qui s'enchaînent pour accomplir une tâche ou un processus métier, généralement en réponse à un événement déclencheur.

L'idée centrale derrière un workflow est simple : si une série d'actions doit être répétée régulièrement de la même façon, alors il faut l'automatiser. Non pas par paresse, mais parce que l'automatisation élimine les erreurs humaines, garantit la cohérence du traitement et libère du temps pour des tâches à plus grande valeur ajoutée.

Pour illustrer cela avec un exemple concret tiré du monde scolaire : quand un élève soumet un devoir sur une plateforme en ligne, plusieurs actions peuvent se déclencher automatiquement. L'élève reçoit un e-mail de confirmation, le professeur reçoit une notification, le fichier est enregistré dans un répertoire horodaté, et si le délai est dépassé, un flag "rendu en retard" est automatiquement ajouté à la fiche. Tout cela se passe sans intervention humaine — c'est un workflow.

Dans le monde professionnel, les workflows sont présents dans tous les domaines : la gestion des commandes e-commerce, la validation des demandes de congés, le déploiement de logiciels, la modération de contenus, la facturation automatique, la surveillance des serveurs. Maîtriser les workflows est une compétence transversale que l'on retrouve aussi bien chez les développeurs que chez les administrateurs systèmes et les intégrateurs.

> 📚 Source : *IBM — What is a workflow?*, [ibm.com/topics/workflow](https://www.ibm.com/topics/workflow)

---

## 2. Vocabulaire et concepts fondamentaux

Avant d'aller plus loin, il est indispensable de maîtriser le vocabulaire qui structure la description et la conception des workflows. Ces termes sont universels et se retrouvent dans tous les outils, qu'ils soient graphiques ou basés sur du code.

### 2.1 Les éléments d'un workflow

Le **déclencheur** (trigger en anglais) est l'événement qui démarre le workflow. Sans déclencheur, un workflow reste inactif. Le déclencheur peut être un événement technique (une requête HTTP reçue, un fichier déposé dans un dossier, un message dans une file d'attente), un événement temporel (tous les jours à 8h, chaque lundi matin), ou une action utilisateur (un formulaire soumis, un bouton cliqué).

Une **action** est une tâche concrète exécutée automatiquement par le workflow. Chaque action représente une opération élémentaire : envoyer un e-mail, faire un appel API, écrire dans une base de données, créer un fichier, notifier un canal de communication. Un workflow est composé d'une suite d'actions.

Une **condition** est une règle logique qui oriente le flux selon qu'elle est vraie ou fausse. Elle permet de créer des chemins alternatifs dans le workflow : si une commande dépasse 500€, envoyer une notification au responsable ; sinon, valider automatiquement. Les conditions sont le mécanisme qui rend un workflow intelligent.

Une **branche** (ou chemin) est le résultat d'une condition : le flux peut prendre plusieurs directions selon les valeurs évaluées. On parle de flux conditionnel ou de branchement.

Une **boucle** (loop) permet de répéter une action un certain nombre de fois ou pour chaque élément d'une liste. Traiter toutes les commandes non traitées d'une journée, envoyer un rapport à chaque membre d'une équipe, redimensionner toutes les images d'un dossier — voilà des cas d'usage typiques de boucles dans un workflow.

Un **nœud** (node ou step) désigne une étape individuelle du workflow dans les outils visuels comme n8n ou Make. Chaque nœud représente soit un déclencheur, soit une action, soit une condition. Les nœuds sont reliés entre eux par des connecteurs qui matérialisent le flux.

### 2.2 Représentation schématique

Un workflow se représente naturellement sous forme de diagramme de flux, avec des formes géométriques standardisées : les rectangles pour les actions, les losanges pour les conditions, les ovales pour le début et la fin, les flèches pour le flux.

```
         [Début / Déclencheur]
                  │
                  ▼
            [Action 1]
                  │
         ─────────┴─────────
        Condition vérifiée ?
         Oui │         │ Non
             ▼         ▼
        [Action 2]  [Action 3]
             │         │
         ────┴─────────┘
                  │
                  ▼
            [Action 4]
                  │
                  ▼
              [Fin]
```

### 2.3 Synchrone vs Asynchrone

Un workflow **synchrone** est un workflow dans lequel chaque étape attend la fin de la précédente avant de démarrer. Le flux est bloquant : si l'étape 2 prend 5 secondes, l'étape 3 ne démarrera pas avant. Ce modèle est simple à comprendre et à déboguer, mais peut devenir lent si certaines étapes sont longues.

Un workflow **asynchrone** permet à plusieurs étapes indépendantes de s'exécuter en parallèle, sans attendre que les autres soient terminées. On parle de traitement concurrent. Ce modèle est plus complexe à mettre en œuvre, mais beaucoup plus performant pour les tâches qui peuvent être parallélisées. Par exemple, envoyer un e-mail et notifier un canal Slack sont deux actions indépendantes qui peuvent s'exécuter en même temps plutôt qu'à la suite l'une de l'autre.

---

## 3. Les types de workflows

Les workflows peuvent prendre des formes très différentes selon leur structure et leur logique interne. On en distingue plusieurs grands types.

### 3.1 Workflow séquentiel

C'est la forme la plus simple : les étapes s'enchaînent dans un ordre fixe et linéaire, l'une après l'autre, sans condition ni branchement. C'est le modèle d'une chaîne de production : chaque maillon attend le précédent.

```
[Déclencheur] → [Étape 1] → [Étape 2] → [Étape 3] → [Fin]
```

On retrouve ce type de workflow dans les pipelines de traitement de données simples, les chaînes de compilation d'un programme, ou encore les processus de validation linéaires comme la relecture d'un article avant publication.

### 3.2 Workflow parallèle

Plusieurs branches du workflow s'exécutent simultanément, puis convergent vers une étape commune. Ce modèle est utilisé quand des tâches indépendantes peuvent être traitées en même temps pour gagner du temps.

```
                ┌──▶ [Branche A : E-mail]      ──┐
[Déclencheur] ──┤                                 ├──▶ [Jonction] → [Fin]
                └──▶ [Branche B : Notification] ──┘
```

Les tests automatisés dans un pipeline CI/CD utilisent souvent ce modèle : les tests unitaires, les tests d'intégration et l'analyse de sécurité s'exécutent tous en parallèle pour réduire le temps total du pipeline.

### 3.3 Workflow conditionnel (basé sur des règles)

Des conditions logiques déterminent quel chemin le flux doit emprunter. C'est le modèle le plus courant dans les processus métier réels, car les décisions à prendre dépendent des données.

```
[Nouvelle commande reçue]
           │
    ───────┴───────
   Montant > 500€ ?
    Oui │     │ Non
        ▼     ▼
[Validation] [Validation
 manuelle]    automatique]
        │     │
    ────┴─────┘
        │
[Préparer l'expédition]
```

Ce type de workflow est omniprésent dans la gestion des commandes, la modération de contenus, les processus RH (validation des demandes de congés selon le solde disponible) ou la détection de fraude bancaire.

### 3.4 Workflow événementiel

Ce type de workflow est entièrement piloté par des **événements externes**. Il reste dormant jusqu'à ce qu'un événement le déclenche — et peut être déclenché plusieurs fois de façon indépendante par différents événements.

Dans le développement logiciel, le modèle événementiel est central : un push de code sur GitHub déclenche automatiquement un pipeline de tests ; si les tests passent, un déploiement en production est lancé automatiquement ; si un test échoue, une alerte est envoyée à l'équipe.

### 3.5 Le standard BPMN

Pour les organisations qui souhaitent modéliser et documenter formellement leurs processus métier, il existe un standard international : **BPMN** (Business Process Model and Notation), version 2.0. BPMN définit une notation graphique précise avec des symboles standardisés pour représenter les flux de travail complexes : événements, tâches, passerelles, messages, minuteries, etc. Il est utilisé dans les grandes entreprises pour documenter les processus avant de les implémenter techniquement, et sert de langage commun entre les équipes métier et les équipes techniques.

> 📚 Source : OMG — *Business Process Model and Notation (BPMN) 2.0*, [omg.org/spec/BPMN/2.0](https://www.omg.org/spec/BPMN/2.0/)

---

## 4. Workflows et APIs — une combinaison puissante

Les workflows et les APIs sont des technologies complémentaires et indissociables dans le développement moderne. Les APIs exposent des fonctionnalités et des données ; les workflows orchestrent et séquencent les appels à ces APIs pour construire des processus automatisés complexes.

### 4.1 Principe général

Un workflow peut appeler une ou plusieurs APIs à chaque étape de son exécution. L'idée est de composer plusieurs services spécialisés pour créer un processus plus riche qu'aucun service ne pourrait fournir seul.

```
[Événement déclencheur]
         │
         ▼
[Appel API Service A] ──▶ Récupérer des données
         │
         ▼
[Traitement / Condition] ──▶ Analyser les données
         │
         ▼
[Appel API Service B] ──▶ Agir en conséquence
         │
         ▼
[Appel API Service C] ──▶ Notifier les parties prenantes
```

### 4.2 Exemples concrets par secteur d'activité

**Dans le secteur de l'éducation :** Quand un élève s'inscrit sur une plateforme scolaire, un workflow peut appeler l'API de l'outil de gestion scolaire pour créer son compte, l'API de messagerie pour lui envoyer un e-mail de bienvenue avec ses identifiants, l'API de la plateforme e-learning pour lui attribuer les cours de sa classe, et l'API de Slack ou Teams pour l'inviter dans les canaux de communication appropriés.

**Dans le secteur du commerce :** Quand une commande est passée sur un site e-commerce, un workflow appelle successivement l'API de Stripe pour valider le paiement, l'API du prestataire logistique pour créer le bon d'expédition, l'API de SendGrid pour envoyer la confirmation par e-mail, et l'API de l'outil CRM pour mettre à jour l'historique d'achat du client.

**Dans le secteur de la santé :** Quand un patient prend rendez-vous en ligne, un workflow peut confirmer le créneau via l'API du calendrier du médecin, envoyer un rappel par SMS via Twilio la veille du rendez-vous, et envoyer un questionnaire de satisfaction via e-mail après la consultation.

**Dans le monde du développement :** Quand un développeur pousse du code sur la branche principale d'un dépôt, un workflow CI/CD appelle les APIs de test pour exécuter la suite de tests automatisés, puis si tout est vert, l'API du service d'hébergement pour déployer la nouvelle version, et enfin l'API de Slack pour notifier l'équipe du succès du déploiement.

---

## 5. Les webhooks

### 5.1 Définition

Un **webhook** est un mécanisme par lequel un service externe **notifie proactivement** votre application dès qu'un événement précis se produit de son côté, sans que vous ayez à le demander en permanence. Techniquement, c'est une simple requête HTTP POST que le service externe envoie vers une URL que vous lui avez fournie lors de la configuration.

Le webhook est la clé de voûte des architectures événementielles modernes, car il permet à des services tiers de déclencher des workflows sans polling continu.

### 5.2 Polling vs Webhook

Pour bien comprendre l'intérêt des webhooks, il faut les comparer à l'approche alternative : le **polling**. Le polling consiste à interroger régulièrement un service pour savoir si quelque chose de nouveau s'est produit. C'est l'équivalent de quelqu'un qui vérifie sa boîte mail toutes les 5 minutes en espérant avoir reçu un message. L'approche par webhook est l'équivalent d'une notification push : le service vous prévient lui-même dès que l'événement se produit.

```
Polling (inefficace) :                Webhook (efficace) :

Votre app → "Rien de nouveau ?"       [Événement se produit chez le service]
Service → "Non, rien"                             │
Votre app → "Et maintenant ?"                     ▼
Service → "Non, toujours rien"        Service → POST vers votre URL
Votre app → "Et là ?"                             │
Service → "OUI ! Voici l'événement"               ▼
                                      Votre app traite l'événement
```

Le polling consomme inutilement de la bande passante, des ressources serveur et introduit une latence (on ne sait pas exactement quand l'événement s'est produit, seulement au prochain cycle de vérification). Le webhook est instantané et ne consomme des ressources que quand il y a réellement quelque chose à traiter.

### 5.3 Exemples d'utilisation des webhooks

**Stripe** utilise des webhooks pour notifier votre application des événements de paiement : `payment_intent.succeeded` (paiement réussi), `payment_intent.payment_failed` (paiement échoué), `customer.subscription.deleted` (abonnement annulé). Sans webhook, vous devriez interroger Stripe en permanence pour savoir si un paiement a abouti.

**GitHub** envoie des webhooks lors de chaque push, pull request, ou création d'issue, permettant aux outils CI/CD de se déclencher instantanément.

**Slack** permet de configurer des webhooks entrants pour recevoir des messages dans un canal directement depuis vos applications.

### 5.4 Sécuriser un webhook

Un endpoint webhook est une URL publiquement accessible, ce qui signifie que n'importe qui pourrait théoriquement lui envoyer de fausses données. Pour s'en protéger, les services sérieux comme Stripe ou GitHub signent leurs requêtes webhook avec une clé secrète partagée (HMAC-SHA256). À réception, votre application recalcule la signature attendue et la compare à celle reçue dans les headers. Si elles ne correspondent pas, la requête est rejetée.

> 📚 Source : [webhook.site](https://webhook.site/) — outil pour inspecter et déboguer les webhooks entrants

---

## 6. Outils No-Code / Low-Code de workflow

Ces outils permettent de créer des workflows automatisés **visuellement**, en reliant des blocs fonctionnels par des connexions graphiques, sans écrire de code ou avec très peu de code. Ils ont démocratisé l'automatisation en la rendant accessible à des profils non-développeurs.

### 6.1 n8n (open-source — recommandé)

n8n est un outil d'automatisation open-source qui peut être **auto-hébergé sur son propre serveur**, donnant un contrôle total sur les données et sur l'infrastructure. Il propose une interface visuelle dans laquelle on construit les workflows en connectant des nœuds (nodes) entre eux. Chaque nœud représente soit un déclencheur, soit une action sur un service tiers. n8n propose plus de 400 intégrations natives couvrant les outils les plus courants (Slack, Gmail, GitHub, bases de données, HTTP Request générique, etc.) et permet d'exécuter du code JavaScript directement dans les nœuds pour les traitements personnalisés.

Son positionnement open-source le distingue des concurrents : il peut être installé gratuitement sur n'importe quel serveur Linux en quelques minutes avec Docker, et aucune donnée ne transite par les serveurs d'un éditeur tiers.

> 📚 [n8n.io](https://n8n.io/) | [docs.n8n.io](https://docs.n8n.io/)

### 6.2 Make (anciennement Integromat)

Make est une plateforme SaaS (Software as a Service) d'automatisation avec une interface particulièrement soignée et intuitive. Les workflows y sont appelés "scénarios" et se construisent en reliant visuellement des modules. Make se distingue par son traitement de données très flexible et sa capacité à manipuler des structures de données complexes sans écrire de code. Une version gratuite est disponible avec un quota mensuel d'opérations. Étant une solution hébergée dans le cloud, les données transitent par les serveurs de Make.

> 📚 [make.com](https://www.make.com/)

### 6.3 Zapier

Zapier est la solution commerciale la plus populaire du marché. Elle est pensée pour la simplicité maximale : créer un "Zap" (le nom de leurs workflows) se fait en quelques clics selon un modèle déclencheur-action très direct. Zapier propose plus de 6 000 intégrations, ce qui en fait la solution avec la couverture applicative la plus large. En contrepartie, elle est moins flexible que n8n ou Make pour les logiques complexes, et son positionnement tarifaire est essentiellement payant.

> 📚 [zapier.com](https://zapier.com/)

### 6.4 Tableau comparatif

| Critère | n8n | Make | Zapier |
|---|---|---|---|
| **Modèle** | Open-source / SaaS | SaaS | SaaS |
| **Prix (entrée)** | Gratuit (self-hosted) | Freemium | Freemium |
| **Auto-hébergement** | ✓ | ✗ | ✗ |
| **Nombre d'intégrations** | +400 | +1 500 | +6 000 |
| **Flexibilité technique** | Très élevée | Élevée | Moyenne |
| **Complexité de prise en main** | Moyenne | Faible | Très faible |
| **Exécution de code custom** | ✓ (JavaScript) | Limité | ✗ |

> 📚 Source : Comparatifs officiels [n8n.io/vs/zapier](https://n8n.io/vs/zapier/) et [n8n.io/vs/make](https://n8n.io/vs/make/)

---

## 7. Workflows de développement — CI/CD

Dans le monde du développement logiciel, les workflows automatisés ont pris une importance capitale sous la forme des **pipelines CI/CD**. Ce sont des workflows déclenchés automatiquement à chaque modification du code source, dont l'objectif est de vérifier la qualité du code et de le livrer en production de façon fiable et rapide.

### 7.1 Les concepts CI et CD

**L'intégration continue** (CI — Continuous Integration) est la pratique consistant à fusionner régulièrement les modifications de code de tous les développeurs d'une équipe dans une branche commune, et à vérifier automatiquement la qualité de ce code à chaque fusion. Cette vérification comprend généralement l'exécution des tests automatisés, l'analyse statique du code (linting), et la compilation ou le build du projet. L'objectif est de détecter les régressions et les bugs au plus tôt, dès qu'ils sont introduits dans le code.

**La livraison ou le déploiement continus** (CD — Continuous Delivery ou Continuous Deployment) est l'extension logique de la CI. Une fois que le code a passé avec succès toutes les vérifications de la CI, le pipeline peut déclencher automatiquement le déploiement du logiciel dans un environnement de staging (préproduction) ou directement en production. La différence entre Continuous Delivery et Continuous Deployment est subtile : la livraison continue requiert une validation humaine avant le déploiement final en production, tandis que le déploiement continu est entièrement automatisé de bout en bout.

### 7.2 Le pipeline type

Un pipeline CI/CD standard suit une séquence d'étapes logiques qui se déroulent automatiquement après chaque push de code.

```
[Développeur → git push]
         │
         ▼
   [CI/CD se déclenche]
         │
         ├──▶ [Lint] ─── Analyse syntaxique et qualité du code
         │
         ├──▶ [Tests unitaires] ─── Tester les fonctions individuelles
         │
         ├──▶ [Tests d'intégration] ─── Tester les interactions entre composants
         │
         ├──▶ [Build] ─── Compilation / transpilation / création des artefacts
         │
    ─────┴─────
  Tout est vert ?
    Oui │     │ Non
        ▼     ▼
[Déploiement] [Alerte équipe]
   en prod     sur Slack
```

### 7.3 GitHub Actions — Exemple détaillé

**GitHub Actions** est le système CI/CD intégré directement à GitHub. Les workflows y sont définis dans des fichiers **YAML** stockés dans le répertoire `.github/workflows/` du dépôt. Ils sont versionnés avec le code, ce qui signifie que l'historique du pipeline est traçable au même titre que le code source.

Voici un exemple complet et commenté d'un workflow GitHub Actions pour une application Node.js.

```yaml
# .github/workflows/ci-cd.yml

# Nom du workflow (affiché dans l'interface GitHub)
name: Pipeline CI/CD

# Déclencheurs : ce workflow se lance lors d'un push sur 'main'
# ou lors de l'ouverture/mise à jour d'une pull request
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

# Définition des jobs (tâches) à exécuter
jobs:

  # ── Job 1 : Tests et vérification de la qualité ──────────────────
  tests:
    name: Tests et qualité du code
    runs-on: ubuntu-latest  # Machine virtuelle Ubuntu fournie par GitHub

    steps:
      # Étape 1 : Récupérer le code du dépôt
      - name: Récupération du code source
        uses: actions/checkout@v4

      # Étape 2 : Installer Node.js version 20
      - name: Installation de Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # Mise en cache des dépendances pour accélérer

      # Étape 3 : Installer les dépendances du projet
      - name: Installation des dépendances npm
        run: npm ci  # 'npm ci' est préféré à 'npm install' en CI

      # Étape 4 : Vérification du style et de la qualité du code
      - name: Analyse du code (ESLint)
        run: npm run lint

      # Étape 5 : Exécution des tests automatisés
      - name: Exécution des tests unitaires
        run: npm test

  # ── Job 2 : Déploiement (seulement si les tests passent) ─────────
  deploy:
    name: Déploiement en production
    runs-on: ubuntu-latest
    needs: tests  # Ce job ne démarre QUE si le job 'tests' réussit
    if: github.ref == 'refs/heads/main'  # Seulement sur la branche main

    steps:
      - name: Récupération du code source
        uses: actions/checkout@v4

      - name: Installation de Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Installation des dépendances
        run: npm ci --production

      - name: Déploiement sur le serveur de production
        run: npm run deploy
        env:
          # Les secrets sont stockés dans les paramètres du dépôt GitHub
          # Ils ne sont jamais exposés dans les logs
          DEPLOY_API_KEY: ${{ secrets.DEPLOY_API_KEY }}
          SERVER_HOST: ${{ secrets.SERVER_HOST }}

      - name: Notification Slack du déploiement
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text": "✅ Déploiement réussi sur production !"}'
```

Plusieurs éléments méritent d'être soulignés dans cet exemple. Le mot-clé `needs` au niveau du job `deploy` crée une dépendance explicite : si les tests échouent, le déploiement ne se lance jamais. La condition `if: github.ref == 'refs/heads/main'` garantit que le déploiement n'est déclenché que sur la branche principale, et pas pour chaque pull request. Enfin, la notation `${{ secrets.NOM_DU_SECRET }}` permet d'utiliser des valeurs secrètes (clés API, mots de passe, URLs de production) sans jamais les écrire en clair dans le fichier YAML versionné.

> 📚 Source : [docs.github.com/fr/actions](https://docs.github.com/fr/actions)

### 7.4 Autres outils CI/CD notables

L'écosystème des outils CI/CD est riche. **GitLab CI/CD** est le système intégré à GitLab, très complet et particulièrement apprécié dans les environnements auto-hébergés. **Jenkins** est l'outil open-source historique de l'intégration continue, extrêmement configurable mais plus complexe à maintenir. **CircleCI** est une solution cloud performante avec une bonne ergonomie. **Woodpecker CI** est une alternative open-source légère à GitHub Actions, compatible avec Gitea et Forgejo.

---

## 8. Créer un workflow en code

Si les outils no-code comme n8n sont très pratiques pour les workflows standard, il arrive fréquemment qu'un besoin spécifique nécessite de créer un workflow directement en code. C'est notamment le cas pour des traitements de données complexes, des intégrations avec des systèmes propriétaires, ou des performances critiques.

### 8.1 Structure générale d'un workflow en Node.js

Un workflow codé suit toujours la même structure : une fonction principale qui orchestre les étapes dans l'ordre, avec une gestion des erreurs à chaque niveau.

```javascript
// workflow-traitement-commandes.js

// Configuration centralisée
const CONFIG = {
  API_COMMANDES: 'https://api.boutique.fr/v1',
  API_LOGISTIQUE: 'https://api.livreur.fr/v1',
  WEBHOOK_SLACK: process.env.SLACK_WEBHOOK_URL,  // Jamais en dur dans le code
  BATCH_SIZE: 50  // Nombre de commandes à traiter par lot
};

// ─── Étape 1 : Récupérer les commandes à traiter ──────────────────
async function recupererCommandesEnAttente() {
  console.log('🔍 Récupération des commandes en attente...');
  
  const response = await fetch(`${CONFIG.API_COMMANDES}/commandes?statut=en_attente`, {
    headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
  });

  if (!response.ok) {
    throw new Error(`Erreur API commandes : ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`   → ${data.commandes.length} commandes trouvées`);
  return data.commandes;
}

// ─── Étape 2 : Traiter une commande individuelle ──────────────────
async function traiterCommande(commande) {
  // Appel à l'API du prestataire logistique pour créer le bon d'expédition
  const response = await fetch(`${CONFIG.API_LOGISTIQUE}/expeditions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reference: commande.id,
      destinataire: commande.client,
      adresse: commande.adresse_livraison,
      poids_kg: commande.poids_total
    })
  });

  if (!response.ok) {
    throw new Error(`Échec expédition commande ${commande.id} : ${response.status}`);
  }

  const expedition = await response.json();
  return { commande_id: commande.id, numero_suivi: expedition.tracking_number };
}

// ─── Étape 3 : Notifier sur Slack ─────────────────────────────────
async function notifierSlack(rapport) {
  const succes = rapport.filter(r => r.statut === 'ok').length;
  const echecs = rapport.filter(r => r.statut === 'erreur').length;

  const message = {
    text: `📦 Rapport traitement commandes`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Rapport du ${new Date().toLocaleDateString('fr-FR')}*\n✅ Réussies : ${succes}\n❌ Échouées : ${echecs}`
        }
      }
    ]
  };

  await fetch(CONFIG.WEBHOOK_SLACK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
}

// ─── Workflow principal ────────────────────────────────────────────
async function lancerWorkflow() {
  console.log('🚀 Démarrage du workflow de traitement des commandes');
  const rapport = [];

  try {
    // Étape 1 : Récupération
    const commandes = await recupererCommandesEnAttente();

    if (commandes.length === 0) {
      console.log('ℹ️ Aucune commande à traiter, workflow terminé.');
      return;
    }

    // Étape 2 : Traitement de chaque commande (séquentiel pour éviter la surcharge)
    for (const commande of commandes) {
      try {
        const resultat = await traiterCommande(commande);
        rapport.push({ commande_id: commande.id, statut: 'ok', ...resultat });
        console.log(`   ✅ Commande #${commande.id} → suivi ${resultat.numero_suivi}`);
      } catch (erreurCommande) {
        // On capture l'erreur pour une commande sans arrêter tout le workflow
        rapport.push({ commande_id: commande.id, statut: 'erreur', erreur: erreurCommande.message });
        console.error(`   ❌ Commande #${commande.id} → ${erreurCommande.message}`);
      }
    }

    // Étape 3 : Rapport
    await notifierSlack(rapport);
    console.log('✅ Workflow terminé avec succès');

  } catch (erreurCritique) {
    // Erreur critique : on arrête tout et on alerte
    console.error('🆘 Erreur critique dans le workflow :', erreurCritique.message);
    process.exit(1);  // Code de sortie non-zéro pour signaler l'échec au système
  }
}

// Point d'entrée
lancerWorkflow();
```

### 8.2 Les tâches planifiées (cron jobs)

Beaucoup de workflows doivent s'exécuter automatiquement selon un planning : tous les jours à une heure précise, toutes les heures, tous les lundis matins. C'est le rôle des **tâches planifiées**, aussi appelées **cron jobs** sur les systèmes Unix.

La syntaxe `cron` est un standard pour exprimer une planification temporelle avec cinq champs : minutes, heures, jours du mois, mois, jours de la semaine.

```
# Syntaxe : minute heure jour_du_mois mois jour_de_la_semaine
# Chaque champ accepte : une valeur, une liste (,), un intervalle (-), ou * (tous)

# Exemples :
0 8 * * 1       # Tous les lundis à 8h00
0 */2 * * *     # Toutes les 2 heures
30 23 * * *     # Tous les jours à 23h30
0 9 1 * *       # Le 1er de chaque mois à 9h00
0 0 * * 0       # Tous les dimanches à minuit
```

En Node.js, la librairie `node-cron` permet d'intégrer cette fonctionnalité directement dans une application :

```javascript
const cron = require('node-cron');

// Lancer le workflow tous les matins à 7h30
cron.schedule('30 7 * * *', () => {
  console.log('⏰ Lancement automatique du workflow...');
  lancerWorkflow();
}, {
  timezone: 'Europe/Paris'
});
```

---

## 9. Bonnes pratiques

### 9.1 Conception d'un workflow

Avant d'écrire la moindre ligne de code ou de configurer le moindre nœud dans un outil graphique, il est indispensable de prendre le temps de **concevoir le workflow sur papier** (ou sur un outil de diagramme comme draw.io). Cette étape force à réfléchir à tous les chemins possibles, y compris les cas d'erreur, et permet de partager facilement la conception avec d'autres personnes sans entrer dans les détails d'implémentation.

La règle fondamentale de conception est de décomposer le workflow en **étapes atomiques** : chaque étape ne doit avoir qu'une seule et unique responsabilité. Cette approche facilite le test, le débogage et la réutilisation des étapes.

Il faut également identifier dès le départ toutes les situations d'erreur possibles. Que se passe-t-il si l'API externe est indisponible ? Si une donnée est manquante ou invalide ? Si une étape prend trop de temps ? Un workflow qui ne gère pas ses erreurs est un workflow qui échouera silencieusement en production.

### 9.2 Rendre un workflow robuste

Un workflow de production doit être conçu pour résister aux aléas. Voici les pratiques essentielles.

**L'idempotence** est une propriété fondamentale : un workflow idempotent peut être exécuté plusieurs fois avec le même résultat qu'une seule exécution. Concrètement, si un workflow est relancé après un échec partiel, il ne doit pas dupliquer les actions déjà effectuées ni créer d'incohérences dans les données.

**La logique de retry** consiste à réessayer automatiquement une étape qui a échoué, avec un délai entre les tentatives, avant de déclarer un échec définitif. Une bonne stratégie de retry utilise un délai exponentiel (1s, 2s, 4s, 8s…) pour ne pas surcharger un service temporairement indisponible.

**Le timeout** définit un délai maximum pour chaque étape. Une étape qui ne répond pas au bout d'un certain temps doit être considérée comme échouée, plutôt que de bloquer indéfiniment le workflow.

**Le logging** (journalisation) consiste à enregistrer chaque étape du workflow avec un timestamp, son résultat et les données pertinentes. Un workflow sans logs est impossible à déboguer en production.

**L'alerting** est le mécanisme qui notifie les équipes en cas d'échec critique, par e-mail, SMS ou message dans un outil de communication. Un workflow qui échoue silencieusement est dangereux.

### 9.3 Sécurité des workflows

La sécurité des workflows est souvent négligée alors qu'elle est cruciale. Un workflow manipule souvent des données sensibles et des clés d'accès à des services tiers.

La règle la plus importante est de **ne jamais écrire de valeurs secrètes en dur dans le code ou dans les fichiers de configuration versionnés**. Une clé API écrite directement dans un fichier JavaScript qui sera poussé sur GitHub est une faute de sécurité grave. Toutes les valeurs sensibles doivent être stockées dans des **variables d'environnement**, dans un coffre-fort de secrets (HashiCorp Vault, AWS Secrets Manager) ou dans le système de secrets de l'outil CI/CD utilisé.

```bash
# Dans un fichier .env (jamais commité sur Git, listé dans .gitignore)
API_KEY=sk-a8f3b2c1d9e4f5g6
SLACK_WEBHOOK=https://hooks.slack.com/services/XXXX/YYYY/ZZZZ
DATABASE_URL=postgresql://user:password@localhost:5432/mabase
```

```javascript
// Dans le code, on lit les variables d'environnement
const API_KEY = process.env.API_KEY;  // ✓ Correct
// const API_KEY = "sk-a8f3b2c1d9e4f5g6"; // ❌ Ne jamais faire ça
```

Il faut également **vérifier l'authenticité des webhooks entrants** avant de les traiter, pour s'assurer qu'ils proviennent bien du service attendu et non d'un acteur malveillant.

---

## 10. Ressources et pour aller plus loin

### 📚 Références officielles et fiables

| Ressource | URL |
|---|---|
| n8n — Documentation officielle | [docs.n8n.io](https://docs.n8n.io/) |
| GitHub Actions — Documentation | [docs.github.com/fr/actions](https://docs.github.com/fr/actions) |
| Slack — API et Webhooks | [api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks) |
| Make — Centre d'aide | [make.com/en/help](https://www.make.com/en/help) |
| BPMN 2.0 — Standard officiel | [omg.org/spec/BPMN/2.0](https://www.omg.org/spec/BPMN/2.0/) |
| Webhook.site — Outil de test | [webhook.site](https://webhook.site/) |
| IBM — What is a workflow? | [ibm.com/topics/workflow](https://www.ibm.com/topics/workflow) |
| Crontab.guru — Syntaxe cron | [crontab.guru](https://crontab.guru/) |

### 🛠️ Outils à installer et explorer

```
n8n (auto-hébergé)   → npm install n8n -g  OU  docker run -it --rm n8nio/n8n
draw.io              → app.diagrams.net (en ligne, gratuit)
Webhook.site         → Aucune installation, utilisation directe dans le navigateur
node-cron            → npm install node-cron (pour les tâches planifiées Node.js)
GitHub Actions       → Intégré à GitHub, aucune installation nécessaire
```

### 📖 Concepts à explorer ensuite

Une fois les bases maîtrisées, plusieurs sujets constituent des approfondissements naturels. Les **files de messages** (Message Queues) telles que RabbitMQ ou Apache Kafka permettent de créer des workflows asynchrones très robustes et scalables, en découplant les producteurs d'événements des consommateurs. La notion de **microservices** est directement liée aux workflows, puisque l'orchestration de microservices constitue en elle-même un workflow distribué. Les **fonctions serverless** (AWS Lambda, Vercel Functions, Cloudflare Workers) permettent d'exécuter des étapes de workflow sans gérer de serveur. Enfin, **Apache Airflow** est l'outil de référence pour l'orchestration de workflows de traitement de données (data engineering) à grande échelle.

---

## Résumé — Ce qu'il faut retenir

| Concept | À retenir |
|---|---|
| **Workflow** | Suite d'étapes automatisées déclenchées par un événement |
| **Trigger / Déclencheur** | L'événement qui lance le workflow (formulaire, heure planifiée, push Git…) |
| **Action** | Une tâche automatique exécutée par une étape du workflow |
| **Condition** | Une règle logique (Si/Sinon) qui oriente le flux vers une branche |
| **Webhook** | Notification instantanée d'un service externe vers votre application |
| **Polling** | Interrogation répétée d'un service (moins efficace que le webhook) |
| **CI/CD** | Pipeline de test et de déploiement automatique déclenché par chaque push de code |
| **n8n** | Outil open-source de création de workflows visuels, auto-hébergeable |
| **GitHub Actions** | Système CI/CD intégré à GitHub, défini en YAML dans le dépôt |
| **Cron job** | Tâche planifiée exécutée automatiquement selon une expression temporelle |
| **Idempotence** | Propriété d'un workflow qui peut être rejoué sans créer d'effets de bord |

---

## Articulation avec le cours sur les APIs

Les workflows et les APIs forment un binôme indissociable du développement moderne. Les APIs définissent **comment accéder à un service** (les routes, les méthodes, les formats de données), tandis que les workflows définissent **quand et dans quel ordre** ces APIs sont appelées pour orchestrer un processus complet. Un workflow sans API ne peut que traiter des données locales ; une API sans workflow doit être appelée manuellement à chaque fois. Ensemble, ils permettent de construire des systèmes automatisés, réactifs et fiables.

> ➡️ Voir le cours [APIs.md](APIs.md) pour les bases du protocole HTTP, des APIs REST et de la création d'API.

---

*Cours rédigé dans le cadre de la formation BTS CIEL-IR — Saint-Gabriel, Saint-Laurent-sur-Sèvre.*

# Web Proxy API

## Description

Projet éducatif de proxy web utilisant Puppeteer pour exposer les fonctionnalités d'un site web sous forme d'API REST. Ce projet est un proof of concept à des fins exclusivement éducatives.

## Fonctionnalités

- Automatisation web avec Puppeteer
- API REST avec Express.js
- Support Docker pour le déploiement
- Architecture modulaire et extensible
- Gestion des erreurs et logs structurés
- Protection contre la détection (stealth mode)

## Prérequis

- Node.js 18+
- Docker et Docker Compose
- npm ou yarn

## Installation

### Installation locale

```bash
# Cloner le repository
git clone [repository-url]
cd web-proxy-api

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Lancer en mode développement
npm run dev
```

### Installation avec Docker

```bash
# Construire l'image Docker
docker-compose build

# Lancer le conteneur
docker-compose up -d

# Arrêter le conteneur
docker-compose down
```

## Structure du projet

```
.
├── src/
│   ├── controllers/    # Contrôleurs API
│   ├── services/       # Services métier (Puppeteer)
│   ├── middleware/     # Middlewares Express
│   ├── routes/         # Routes API
│   ├── utils/          # Utilitaires
│   ├── config/         # Configuration
│   └── index.ts        # Point d'entrée
├── tests/              # Tests unitaires et d'intégration
├── docker/             # Fichiers Docker additionnels
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### Health Check
```
GET /health
```

### Proxy Operations
```
POST /api/proxy/navigate
Body: { url: string }

POST /api/proxy/screenshot
Body: { url: string, fullPage?: boolean }

POST /api/proxy/extract
Body: { url: string, selector: string }

POST /api/proxy/interact
Body: { url: string, actions: Array<Action> }
```

## Développement

```bash
# Lancer les tests
npm test

# Lancer le linter
npm run lint

# Vérifier les types TypeScript
npm run typecheck

# Build pour production
npm run build
```

## Configuration

Variables d'environnement disponibles :

- `PORT` : Port de l'API (défaut: 3000)
- `NODE_ENV` : Environnement (development, production)
- `LOG_LEVEL` : Niveau de log (error, warn, info, debug)
- `PUPPETEER_HEADLESS` : Mode headless pour Puppeteer (true/false)
- `MAX_CONCURRENT_SESSIONS` : Nombre max de sessions Puppeteer simultanées
- `SESSION_TIMEOUT` : Timeout des sessions en ms

## Sécurité

- Rate limiting sur les endpoints
- Validation des entrées avec Joi
- Headers de sécurité avec Helmet
- Mode stealth pour éviter la détection
- Exécution dans un conteneur isolé

## Limitations

Ce projet est un proof of concept éducatif :
- Ne pas utiliser en production
- Respecter les conditions d'utilisation des sites web
- Implémenter des mécanismes de cache appropriés
- Gérer les ressources Puppeteer avec précaution

## Licence

MIT - Usage éducatif uniquement

## Contribution

Les contributions sont les bienvenues pour améliorer ce projet éducatif. Merci de créer une issue avant de soumettre une PR.
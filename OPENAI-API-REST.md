# OpenAI API REST Documentation

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [Modèles disponibles](#modèles-disponibles)
4. [Endpoints principaux](#endpoints-principaux)
5. [Formats de requête/réponse](#formats-de-requêteréponse)
6. [Limites de taux](#limites-de-taux)
7. [Gestion des erreurs](#gestion-des-erreurs)
8. [Bonnes pratiques](#bonnes-pratiques)
9. [Tarification](#tarification)

## Vue d'ensemble

L'API REST d'OpenAI permet d'accéder aux modèles d'IA les plus avancés incluant GPT-4, GPT-3.5, DALL-E, Whisper et plus. L'API utilise une architecture RESTful avec authentification par clé API et répond en JSON.

**Base URL**: `https://api.openai.com/v1`

## Authentification

### Méthode standard
Toutes les requêtes doivent inclure votre clé API dans l'en-tête HTTP :

```http
Authorization: Bearer YOUR_API_KEY
```

### Obtention de la clé
1. Créer un compte sur [platform.openai.com](https://platform.openai.com)
2. Naviguer vers la page API Keys
3. Générer une nouvelle clé secrète

### Sécurité
- Ne jamais exposer la clé côté client
- Utiliser des variables d'environnement
- Régénérer les clés compromises immédiatement

## Modèles disponibles

### GPT-4 (2024)
- **gpt-4**: Modèle le plus capable, 8K tokens de contexte
- **gpt-4-32k**: Version étendue avec 32K tokens
- **gpt-4-turbo**: Version optimisée pour la vitesse
- Disponible pour tous les clients payants avec historique de paiement

### GPT-3.5
- **gpt-3.5-turbo**: Modèle utilisé par ChatGPT
- **gpt-3.5-turbo-16k**: Version avec contexte étendu
- Tarif : $0.002 par 1000 tokens
- 97% de l'utilisation API actuelle

### DALL-E
- **dall-e-3**: Génération d'images haute qualité (GA)
- **dall-e-2**: Version précédente (preview avec SDKs)

### Whisper
- **whisper-large-v2**: Transcription audio/vidéo
- Plus rapide et économique via l'API

### Embeddings
- **text-embedding-ada-002**: Modèle d'embeddings actuel
- **text-embedding-3-small**: Nouveau modèle compact
- **text-embedding-3-large**: Version haute performance

## Endpoints principaux

### 1. Chat Completions
**Endpoint**: `POST /chat/completions`

Le principal endpoint représentant 97% de l'utilisation API.

#### Requête
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 150,
  "top_p": 1,
  "frequency_penalty": 0,
  "presence_penalty": 0,
  "stream": false,
  "n": 1,
  "stop": null,
  "seed": null
}
```

#### Réponse
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-4",
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 17,
    "total_tokens": 30
  },
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "I'm doing well, thank you! How can I assist you today?"
      },
      "finish_reason": "stop",
      "index": 0
    }
  ]
}
```

### 2. Images (DALL-E)
**Endpoint**: `POST /images/generations`

#### Requête
```json
{
  "model": "dall-e-3",
  "prompt": "A white siamese cat in a forest",
  "n": 1,
  "size": "1024x1024",
  "quality": "standard",
  "response_format": "url"
}
```

#### Réponse
```json
{
  "created": 1677858242,
  "data": [
    {
      "url": "https://..."
    }
  ]
}
```

### 3. Audio (Whisper)
**Endpoint**: `POST /audio/transcriptions`

#### Requête (multipart/form-data)
```
file: audio_file.mp3
model: whisper-1
language: en
response_format: json
temperature: 0
```

#### Réponse
```json
{
  "text": "Transcribed text from audio..."
}
```

### 4. Embeddings
**Endpoint**: `POST /embeddings`

#### Requête
```json
{
  "model": "text-embedding-ada-002",
  "input": "The quick brown fox jumps over the lazy dog",
  "encoding_format": "float"
}
```

#### Réponse
```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.0023064255, -0.009327292, ...]
    }
  ],
  "model": "text-embedding-ada-002",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}
```

### 5. Fine-tuning
**Endpoint**: `POST /fine_tuning/jobs`

Permet d'entraîner des modèles personnalisés sur vos données.

### 6. Files
**Endpoint**: `POST /files`

Upload de fichiers pour fine-tuning ou assistants.

### 7. Assistants API
**Endpoint**: `POST /assistants`

API pour créer des assistants persistants avec outils et connaissances.

## Formats de requête/réponse

### Headers requis
```http
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

### Headers personnalisés
- Maximum 10 headers personnalisés supportés
- Passés à travers le pipeline et retournés

### Paramètres communs

#### Rôles des messages
- **system**: Instructions pour le modèle
- **user**: Input de l'utilisateur
- **assistant**: Réponses du modèle
- **function**: Résultats d'appels de fonction

#### Paramètres de génération
- **temperature** (0-2): Contrôle la créativité
- **max_tokens**: Limite de tokens en sortie
- **top_p** (0-1): Alternative à temperature
- **frequency_penalty** (-2 à 2): Pénalise la répétition
- **presence_penalty** (-2 à 2): Encourage la nouveauté
- **stream**: Active le streaming de réponse
- **seed**: Pour des réponses déterministes

### Format JSON structuré
```json
{
  "response_format": {
    "type": "json_object"
  }
}
```

## Limites de taux

### Limites par défaut

#### Comptes gratuits (Trial)
- **Requêtes**: 3 RPM (requests per minute)
- **Tokens**: 40,000 TPM (tokens per minute)

#### Comptes payants
- **GPT-4**: Variable selon tier
  - Tier 1: 500 RPM, 10,000 TPM
  - Tier 2: 5,000 RPM, 450,000 TPM
  - Tier 3: 10,000 RPM, 1,500,000 TPM
  
- **GPT-3.5-turbo**: 
  - Tier 1: 3,500 RPM, 90,000 TPM
  - Tier 2: 5,000 RPM, 2,000,000 TPM

### Headers de rate limit
```http
x-ratelimit-limit-requests: 3500
x-ratelimit-limit-tokens: 90000
x-ratelimit-remaining-requests: 3499
x-ratelimit-remaining-tokens: 89900
x-ratelimit-reset-requests: 1s
x-ratelimit-reset-tokens: 6s
retry-after: 60
```

### Gestion des limites
- Les limites se réinitialisent chaque minute
- Utiliser le header `retry-after` pour les délais
- Implémenter exponential backoff
- Diviser les requêtes volumineuses

## Gestion des erreurs

### Codes d'erreur HTTP

| Code | Description | Action recommandée |
|------|-------------|-------------------|
| 400 | Bad Request | Vérifier la syntaxe JSON |
| 401 | Unauthorized | Vérifier la clé API |
| 403 | Forbidden | Vérifier les permissions |
| 404 | Not Found | Vérifier l'endpoint |
| 429 | Too Many Requests | Implémenter retry avec backoff |
| 500 | Internal Server Error | Réessayer après délai |
| 503 | Service Unavailable | Service temporairement indisponible |

### Format d'erreur
```json
{
  "error": {
    "message": "Invalid API key provided",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

### Finish reasons
- **stop**: Génération complétée normalement
- **length**: Limite de tokens atteinte
- **function_call**: Appel de fonction requis
- **content_filter**: Contenu filtré
- **null**: Génération en cours (streaming)

## Bonnes pratiques

### 1. Optimisation des coûts
- Utiliser `max_tokens` pour limiter la sortie
- Préférer GPT-3.5 pour les tâches simples
- Mettre en cache les réponses fréquentes
- Utiliser le batching pour les requêtes multiples

### 2. Performance
- Implémenter le streaming pour l'UX
- Utiliser des prompts concis et clairs
- Paralléliser les requêtes indépendantes
- Monitorer l'utilisation des tokens

### 3. Fiabilité
```python
import time
import random

def retry_with_exponential_backoff(
    func,
    initial_delay: float = 1,
    exponential_base: float = 2,
    max_retries: int = 10,
):
    """Retry avec exponential backoff"""
    for i in range(max_retries):
        try:
            return func()
        except Exception as e:
            if i == max_retries - 1:
                raise
            delay = initial_delay * (exponential_base ** i)
            delay = delay * (0.5 + random.random())
            time.sleep(delay)
```

### 4. Sécurité
- Ne jamais logger les clés API
- Valider et sanitizer les inputs
- Implémenter rate limiting côté client
- Utiliser HTTPS exclusivement
- Rotation régulière des clés

### 5. Prompt Engineering
- Être spécifique et clair
- Fournir des exemples (few-shot)
- Utiliser le rôle system efficacement
- Tester différentes temperatures

## Tarification

### Modèles de chat (par 1M tokens)

| Modèle | Input | Output |
|--------|-------|--------|
| GPT-4 | $30.00 | $60.00 |
| GPT-4-32k | $60.00 | $120.00 |
| GPT-3.5-turbo | $0.50 | $1.50 |
| GPT-3.5-turbo-16k | $3.00 | $4.00 |

### Images (DALL-E 3)

| Résolution | Prix par image |
|------------|---------------|
| 1024×1024 | $0.040 |
| 1024×1792 | $0.080 |
| 1792×1024 | $0.080 |

### Audio (Whisper)
- $0.006 par minute

### Embeddings
- text-embedding-ada-002: $0.10 par 1M tokens
- text-embedding-3-small: $0.02 par 1M tokens
- text-embedding-3-large: $0.13 par 1M tokens

## Migration et dépréciation

### Dates importantes 2024
- **4 janvier 2024**: Fin de support pour text-davinci-003
- **Migration requise**: 
  - Completions API → Chat Completions API
  - Anciens modèles embeddings → text-embedding-ada-002

### Azure OpenAI
Version GA actuelle: `2024-10-21`
- Endpoint: `https://{resource}.openai.azure.com/`
- Authentification: API Key ou Microsoft Entra ID
- Versions preview mensuelles disponibles

## Ressources

- [Documentation officielle](https://platform.openai.com/docs)
- [API Reference](https://platform.openai.com/docs/api-reference)
- [Playground](https://platform.openai.com/playground)
- [Status](https://status.openai.com)
- [Community Forum](https://community.openai.com)
- [Cookbook](https://cookbook.openai.com)

## Exemple d'implémentation Node.js

```javascript
const axios = require('axios');

async function callOpenAI(prompt) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 150
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.choices[0].message.content;
}
```

## Notes pour le proxy

Pour implémenter un proxy de l'API OpenAI avec Puppeteer :
1. Les endpoints REST peuvent être appelés directement sans browser
2. Puppeteer serait utile uniquement pour automatiser l'interface web ChatGPT
3. Considérer les limites de taux lors du proxying
4. Implémenter caching pour réduire les coûts
5. Gérer les tokens et streaming appropriés
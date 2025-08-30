#!/bin/bash

# Script de test pour l'API OpenAI Proxy
# Usage: ./test-api.sh

API_URL="http://localhost:3001"

echo "========================================="
echo "  Test du Proxy OpenAI"
echo "========================================="
echo ""

# 1. Test de l'endpoint racine
echo "1. Test endpoint racine (/)"
echo "----------------------------"
curl -s $API_URL/ | jq
echo ""

# 2. Test liste des modèles
echo "2. Test liste des modèles (/v1/models)"
echo "---------------------------------------"
curl -s $API_URL/v1/models | jq '.data[] | {id: .id, owned_by: .owned_by}'
echo ""

# 3. Test Chat Completion (nécessite auth)
echo "3. Test Chat Completion (/v1/chat/completions)"
echo "-----------------------------------------------"
curl -s -X POST $API_URL/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-key-for-testing" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Say hello in French"}
    ],
    "temperature": 0.7,
    "max_tokens": 50
  }' | jq
echo ""

# 4. Test Embeddings
echo "4. Test Embeddings (/v1/embeddings)"
echo "------------------------------------"
curl -s -X POST $API_URL/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-ada-002",
    "input": "Hello world"
  }' | jq '.data[0] | {index: .index, embedding: (.embedding | length)}'
echo ""

# 5. Test Image Generation
echo "5. Test Image Generation (/v1/images/generations)"
echo "--------------------------------------------------"
curl -s -X POST $API_URL/v1/images/generations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cute cat",
    "n": 1,
    "size": "1024x1024"
  }' | jq
echo ""

# 6. Test Moderation
echo "6. Test Moderation (/v1/moderations)"
echo "-------------------------------------"
curl -s -X POST $API_URL/v1/moderations \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello world"
  }' | jq '.results[0] | {flagged: .flagged}'
echo ""

# 7. Test Health Check
echo "7. Test Health Check (/health)"
echo "-------------------------------"
curl -s $API_URL/health | jq
echo ""

echo "========================================="
echo "  Tests terminés"
echo "========================================="
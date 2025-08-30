#!/usr/bin/env python3
"""
Test du proxy OpenAI avec le SDK Python officiel
Installation: pip install openai
"""

from openai import OpenAI

# Configuration du client pour utiliser votre proxy
client = OpenAI(
    api_key="sk-fake-key-for-testing",  # Clé factice car on utilise ChatGPT
    base_url="http://localhost:3001/v1"  # Votre proxy au lieu de https://api.openai.com/v1
)

print("=" * 50)
print("  Test du Proxy OpenAI avec Python SDK")
print("=" * 50)
print()

# 1. Lister les modèles
print("1. Liste des modèles disponibles:")
print("-" * 30)
try:
    models = client.models.list()
    for model in models.data:
        print(f"  - {model.id}")
except Exception as e:
    print(f"  Erreur: {e}")
print()

# 2. Chat Completion
print("2. Test Chat Completion:")
print("-" * 30)
try:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Hello from the proxy!' in French"}
        ],
        temperature=0.7,
        max_tokens=50
    )
    print(f"  Réponse: {response.choices[0].message.content}")
except Exception as e:
    print(f"  Erreur: {e}")
    print("  (Normal si pas authentifié avec ChatGPT)")
print()

# 3. Embeddings
print("3. Test Embeddings:")
print("-" * 30)
try:
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input="Hello world"
    )
    print(f"  Embedding créé: {len(response.data[0].embedding)} dimensions")
except Exception as e:
    print(f"  Erreur: {e}")
print()

# 4. Test Streaming
print("4. Test Streaming Chat:")
print("-" * 30)
try:
    stream = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Count to 5"}],
        stream=True
    )
    
    print("  Streaming: ", end="")
    for chunk in stream:
        if chunk.choices[0].delta.content:
            print(chunk.choices[0].delta.content, end="")
    print()
except Exception as e:
    print(f"  Erreur: {e}")
print()

print("=" * 50)
print("  Tests terminés")
print("=" * 50)
#!/usr/bin/env node
/**
 * Test du proxy OpenAI avec Node.js
 * Installation: npm install openai
 */

const OpenAI = require('openai');

// Configuration du client pour utiliser votre proxy
const openai = new OpenAI({
  apiKey: 'sk-fake-key-for-testing', // Clé factice
  baseURL: 'http://localhost:3001/v1' // Votre proxy
});

console.log('='.repeat(50));
console.log('  Test du Proxy OpenAI avec Node.js');
console.log('='.repeat(50));
console.log();

async function runTests() {
  // 1. Lister les modèles
  console.log('1. Liste des modèles:');
  console.log('-'.repeat(30));
  try {
    const models = await openai.models.list();
    models.data.forEach(model => {
      console.log(`  - ${model.id}`);
    });
  } catch (error) {
    console.log(`  Erreur: ${error.message}`);
  }
  console.log();

  // 2. Chat Completion
  console.log('2. Test Chat Completion:');
  console.log('-'.repeat(30));
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello!' }
      ],
      max_tokens: 50
    });
    console.log(`  Réponse: ${completion.choices[0].message.content}`);
  } catch (error) {
    console.log(`  Erreur: ${error.message}`);
    console.log('  (Normal si pas authentifié avec ChatGPT)');
  }
  console.log();

  // 3. Embeddings
  console.log('3. Test Embeddings:');
  console.log('-'.repeat(30));
  try {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: 'Hello world'
    });
    console.log(`  Embedding créé: ${embedding.data[0].embedding.length} dimensions`);
  } catch (error) {
    console.log(`  Erreur: ${error.message}`);
  }
  console.log();

  // 4. Streaming
  console.log('4. Test Streaming:');
  console.log('-'.repeat(30));
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Count to 3' }],
      stream: true
    });
    
    process.stdout.write('  Streaming: ');
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }
    console.log();
  } catch (error) {
    console.log(`  Erreur: ${error.message}`);
  }
  console.log();

  console.log('='.repeat(50));
  console.log('  Tests terminés');
  console.log('='.repeat(50));
}

runTests().catch(console.error);
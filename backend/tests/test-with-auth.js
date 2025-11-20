#!/usr/bin/env node

/**
 * Script de test avec authentification Firebase
 * 
 * Ce script teste les routes authentifiées en utilisant un token Firebase réel.
 * 
 * Usage: 
 *   1. Connectez-vous via l'application frontend
 *   2. Récupérez votre token Firebase depuis la console du navigateur
 *   3. Lancez: FIREBASE_TOKEN=your_token node tests/test-with-auth.js
 */

import http from 'http';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const FIREBASE_TOKEN = process.env.FIREBASE_TOKEN;

if (!FIREBASE_TOKEN) {
  console.error('❌ Variable FIREBASE_TOKEN manquante');
  console.error('\n💡 Pour obtenir votre token:');
  console.error('   1. Connectez-vous via l\'application frontend');
  console.error('   2. Ouvrez la console du navigateur (F12)');
  console.error('   3. Exécutez: const token = await firebase.auth().currentUser.getIdToken()');
  console.error('   4. Copiez le token');
  console.error('\n   Puis lancez: FIREBASE_TOKEN=your_token node tests/test-with-auth.js\n');
  process.exit(1);
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Tests d\'intégration avec authentification Firebase\n');
  console.log(`📍 Backend URL: ${BACKEND_URL}\n`);
  console.log('─'.repeat(50));

  const url = new URL(BACKEND_URL);
  let passed = 0;
  let failed = 0;

  // Test 1: GET /api/v1/ideas
  try {
    console.log('\n1️⃣  Test: GET /api/v1/ideas');
    const response = await makeRequest({
      hostname: url.hostname,
      port: url.port || 3000,
      path: '/api/v1/ideas',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FIREBASE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      console.log('   ✅ Status: 200 OK');
      console.log(`   ✅ Réponse: ${JSON.stringify(response.body).substring(0, 100)}...`);
      passed++;
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   ❌ Réponse: ${JSON.stringify(response.body)}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
    failed++;
  }

  // Test 2: POST /api/v1/ideas
  try {
    console.log('\n2️⃣  Test: POST /api/v1/ideas (création idée)');
    const testIdea = {
      title: 'Test Idea - ' + Date.now(),
      brainDump: 'Ceci est une idée de test créée par le script de test automatisé',
      status: 'DRAFT'
    };

    const response = await makeRequest({
      hostname: url.hostname,
      port: url.port || 3000,
      path: '/api/v1/ideas',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIREBASE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }, testIdea);

    if (response.status === 201) {
      console.log('   ✅ Status: 201 Created');
      console.log(`   ✅ Idée créée: ${response.body.id || 'N/A'}`);
      passed++;
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   ❌ Réponse: ${JSON.stringify(response.body)}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
    failed++;
  }

  // Test 3: POST /api/v1/analysis/analyze
  try {
    console.log('\n3️⃣  Test: POST /api/v1/analysis/analyze');
    const testBrainDump = 'Je veux créer une application web pour gérer mes projets personnels avec un système de prioritisation intelligent.';

    const response = await makeRequest({
      hostname: url.hostname,
      port: url.port || 3000,
      path: '/api/v1/analysis/analyze',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIREBASE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }, {
      brainDump: testBrainDump
    });

    if (response.status === 200) {
      console.log('   ✅ Status: 200 OK');
      if (response.body.analysis) {
        console.log('   ✅ Analyse reçue:');
        console.log(`      - Summary: ${response.body.analysis.summary?.substring(0, 80)}...`);
        console.log(`      - Questions: ${response.body.analysis.clarifyingQuestions?.length || 0}`);
        console.log(`      - Risques: ${response.body.analysis.potentialRisks?.length || 0}`);
      }
      passed++;
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   ❌ Réponse: ${JSON.stringify(response.body)}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
    failed++;
  }

  // Résumé
  console.log('\n' + '─'.repeat(50));
  console.log(`\n📊 Résultats: ${passed} réussis, ${failed} échoués`);

  if (failed > 0) {
    console.log('\n⚠️  Certains tests ont échoué.');
    process.exit(1);
  } else {
    console.log('\n🎉 Tous les tests sont passés !');
    process.exit(0);
  }
}

// Vérifier que le backend est accessible
const healthUrl = new URL(`${BACKEND_URL}/health`);
makeRequest({
  hostname: healthUrl.hostname,
  port: healthUrl.port || 3001,
  path: healthUrl.pathname,
  method: 'GET',
})
  .then(() => {
    console.log('✅ Backend accessible\n');
    return runTests();
  })
  .catch((error) => {
    console.error('\n❌ Le backend n\'est pas accessible !');
    console.error(`   URL: ${BACKEND_URL}`);
    console.error(`   Erreur: ${error.message}`);
    console.error('\n💡 Assurez-vous que le backend est démarré :');
    console.error('   cd backend && npm run dev\n');
    process.exit(1);
  });


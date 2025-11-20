#!/usr/bin/env node

/**
 * Script de test automatisé pour le backend AXIOM
 * 
 * Usage: node tests/test-backend.js
 */

import http from 'http';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const TESTS = [];
let PASSED = 0;
let FAILED = 0;

// Fonction utilitaire pour faire des requêtes HTTP
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

// Fonction de test
function test(name, fn) {
  TESTS.push({ name, fn });
}

// Exécuter tous les tests
async function runTests() {
  console.log('🧪 Tests d\'intégration Backend AXIOM\n');
  console.log(`📍 Backend URL: ${BACKEND_URL}\n`);
  console.log('─'.repeat(50));

  for (const { name, fn } of TESTS) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      PASSED++;
    } catch (error) {
      console.error(`❌ ${name}`);
      console.error(`   Erreur: ${error.message}`);
      FAILED++;
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`\n📊 Résultats: ${PASSED} réussis, ${FAILED} échoués`);
  
  if (FAILED > 0) {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez la configuration.');
    process.exit(1);
  } else {
    console.log('\n🎉 Tous les tests sont passés !');
    process.exit(0);
  }
}

// ============================================================================
// TESTS
// ============================================================================

// Test 1: Health Check
test('Health Check - Backend accessible', async () => {
  const url = new URL(`${BACKEND_URL}/health`);
  const response = await makeRequest({
    hostname: url.hostname,
    port: url.port || 3001,
    path: url.pathname,
    method: 'GET',
  });

  if (response.status !== 200) {
    throw new Error(`Status attendu: 200, reçu: ${response.status}`);
  }

  if (!response.body.status || response.body.status !== 'ok') {
    throw new Error(`Body attendu: {status: "ok"}, reçu: ${JSON.stringify(response.body)}`);
  }

  if (!response.body.timestamp) {
    throw new Error('Timestamp manquant dans la réponse');
  }
});

// Test 2: CORS Headers
test('CORS - Headers présents', async () => {
  const url = new URL(`${BACKEND_URL}/health`);
  const response = await makeRequest({
    hostname: url.hostname,
    port: url.port || 3001,
    path: url.pathname,
    method: 'GET',
    headers: {
      'Origin': 'http://localhost:5173'
    }
  });

  // Vérifier que Access-Control-Allow-Origin est présent
  const corsHeader = response.headers['access-control-allow-origin'];
  if (!corsHeader) {
    throw new Error('Header CORS Access-Control-Allow-Origin manquant');
  }
});

// Test 3: Route non existante - 404
test('404 - Route inexistante', async () => {
  const url = new URL(`${BACKEND_URL}/api/v1/nonexistent`);
  const response = await makeRequest({
    hostname: url.hostname,
    port: url.port || 3001,
    path: url.pathname,
    method: 'GET',
  });

  // Le backend devrait retourner 404 ou une erreur gérée
  if (response.status < 400 || response.status >= 500) {
    throw new Error(`Status attendu: 4xx, reçu: ${response.status}`);
  }
});

// Test 4: Route authentifiée sans token - 401
test('401 - Route authentifiée sans token', async () => {
  const url = new URL(`${BACKEND_URL}/api/v1/ideas`);
  const response = await makeRequest({
    hostname: url.hostname,
    port: url.port || 3001,
    path: url.pathname,
    method: 'GET',
  });

  if (response.status !== 401) {
    throw new Error(`Status attendu: 401 (Unauthorized), reçu: ${response.status}`);
  }

  // Vérifier que le message d'erreur est présent
  if (!response.body.error && !response.body.message) {
    throw new Error('Message d\'erreur manquant dans la réponse');
  }
});

// Test 5: Route authentifiée avec token invalide - 401
test('401 - Route authentifiée avec token invalide', async () => {
  const url = new URL(`${BACKEND_URL}/api/v1/ideas`);
  const response = await makeRequest({
    hostname: url.hostname,
    port: url.port || 3001,
    path: url.pathname,
    method: 'GET',
    headers: {
      'Authorization': 'Bearer invalid_token_12345',
      'Content-Type': 'application/json'
    }
  });

  if (response.status !== 401) {
    throw new Error(`Status attendu: 401 (Unauthorized), reçu: ${response.status}`);
  }
});

// Test 6: POST sans body requis - 400
test('400 - POST /api/v1/analysis/analyze sans body', async () => {
  const url = new URL(`${BACKEND_URL}/api/v1/analysis/analyze`);
  const response = await makeRequest({
    hostname: url.hostname,
    port: url.port || 3001,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer invalid_token',
      'Content-Type': 'application/json'
    }
  });

  // Devrait retourner 400 ou 401 selon l'ordre de validation
  if (response.status < 400 || response.status >= 500) {
    throw new Error(`Status attendu: 4xx, reçu: ${response.status}`);
  }
});

// Test 7: Content-Type JSON
test('Content-Type - Application JSON accepté', async () => {
  const url = new URL(`${BACKEND_URL}/health`);
  const response = await makeRequest({
    hostname: url.hostname,
    port: url.port || 3001,
    path: url.pathname,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  if (response.status !== 200) {
    throw new Error(`Status attendu: 200, reçu: ${response.status}`);
  }
});

// ============================================================================
// EXÉCUTION
// ============================================================================

console.log('Démarrage des tests...\n');

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


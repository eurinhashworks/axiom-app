/**
 * API Client simplifié pour communiquer avec Firebase Functions
 */

// En mode développement, on pointe vers l'URL locale de l'émulateur Firebase Functions
// En production, on utilise l'URL du projet Firebase
const API_BASE_URL = '';

class ApiClient {
  // Ideas endpoints
  async getIdeas(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/ideas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  async createIdea(idea: { title: string; brainDump: string; status?: string }, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/ideas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(idea),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  // Analysis endpoints
  async analyzeBrainDump(brainDump: string, ideaId?: string, token?: string) {
    if (!token) throw new Error('Token requis pour l\'analyse');

    const response = await fetch(`${API_BASE_URL}/api/v1/analysis/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ideaId, brainDump }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  async evaluateIdea(idea: any, ideaId?: string, token?: string) {
    if (!token) throw new Error('Token requis pour l\'évaluation');

    const response = await fetch(`${API_BASE_URL}/api/v1/analysis/evaluate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ideaId, idea }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  // Roadmap endpoint
  async generateRoadmap(idea: any, ideaId?: string, token?: string) {
    if (!token) throw new Error('Token requis pour générer la roadmap');

    const response = await fetch(`${API_BASE_URL}/api/v1/analysis/generate-roadmap`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ideaId, idea }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  // Prioritize endpoint
  async prioritizeIdeas(ideas: any[], token?: string) {
    if (!token) throw new Error('Token requis pour prioriser les idées');

    const response = await fetch(`${API_BASE_URL}/api/v1/analysis/prioritize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ideas }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
export default apiClient;

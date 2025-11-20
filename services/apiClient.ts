/**
 * API Client pour communiquer avec le backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: {
            code: 'UNKNOWN_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        }));
        throw new Error(error.error?.message || 'Erreur API');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur de connexion au serveur');
    }
  }

  // Ideas endpoints
  async getIdeas(token: string) {
    return this.request<{ ideas: any[] }>('/api/v1/ideas', {
      method: 'GET',
      token,
    });
  }

  async getIdea(id: string, token: string) {
    return this.request(`/api/v1/ideas/${id}`, {
      method: 'GET',
      token,
    });
  }

  async createIdea(idea: { title: string; brainDump: string; status?: string }, token: string) {
    return this.request('/api/v1/ideas', {
      method: 'POST',
      body: JSON.stringify(idea),
      token,
    });
  }

  async updateIdea(id: string, updates: any, token: string) {
    return this.request(`/api/v1/ideas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      token,
    });
  }

  async deleteIdea(id: string, token: string) {
    return this.request(`/api/v1/ideas/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  // Analysis endpoints
  async analyzeBrainDump(brainDump: string, ideaId?: string, token?: string) {
    if (!token) throw new Error('Token requis pour l\'analyse');
    
    return this.request<{ analysis: any }>('/api/v1/analysis/analyze', {
      method: 'POST',
      body: JSON.stringify({ ideaId, brainDump }),
      token,
    });
  }

  async evaluateIdea(idea: any, ideaId?: string, token?: string) {
    if (!token) throw new Error('Token requis pour l\'évaluation');
    
    return this.request<{ evaluation: any }>('/api/v1/analysis/evaluate', {
      method: 'POST',
      body: JSON.stringify({ ideaId, idea }),
      token,
    });
  }

  // Roadmap endpoint
  async generateRoadmap(idea: any, ideaId?: string, token?: string) {
    if (!token) throw new Error('Token requis pour générer la roadmap');
    
    return this.request<{ roadmapSteps: string[] }>('/api/v1/analysis/generate-roadmap', {
      method: 'POST',
      body: JSON.stringify({ ideaId, idea }),
      token,
    });
  }

  // Prioritize endpoint
  async prioritizeIdeas(ideas: any[], token?: string) {
    if (!token) throw new Error('Token requis pour prioriser les idées');
    
    return this.request<{ prioritization: string }>('/api/v1/analysis/prioritize', {
      method: 'POST',
      body: JSON.stringify({ ideas }),
      token,
    });
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: number }>('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;

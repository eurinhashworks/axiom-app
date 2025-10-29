/**
 * Service SERPER pour recherche web et analyse de marché
 * Optionnel : nécessite VITE_SERPER_API_KEY dans les variables d'environnement
 */

import { MarketAnalysis, Competitor, MarketTrend, SentimentAnalysis, NewsArticle } from '../types/advanced';

export interface SerperSearchResult {
  organic: Array<{
    title: string;
    link: string;
    snippet: string;
    position: number;
  }>;
  news?: Array<{
    title: string;
    link: string;
    snippet: string;
    date: string;
    source: string;
  }>;
  answerBox?: {
    title: string;
    answer: string;
  };
}

export class SerperService {
  private apiKey: string | null = null;
  private isAvailable: boolean = false;

  constructor() {
    // Vérifier si la clé API SERPER est disponible
    this.apiKey = import.meta.env.VITE_SERPER_API_KEY || null;
    this.isAvailable = !!this.apiKey;

    if (!this.isAvailable) {
      console.info('SERPER API key not found. Market analysis will be limited.');
    }
  }

  /**
   * Vérifie si le service SERPER est disponible
   */
  isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Recherche web avec SERPER API
   */
  async searchWeb(query: string, options?: {
    num?: number;
    type?: 'search' | 'news';
    location?: string;
  }): Promise<SerperSearchResult> {
    if (!this.isAvailable || !this.apiKey) {
      throw new Error('SERPER API key not configured');
    }

    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: options?.num || 10,
          type: options?.type || 'search',
        }),
      });

      if (!response.ok) {
        throw new Error(`SERPER API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling SERPER API:', error);
      throw error;
    }
  }

  /**
   * Analyse le marché pour une idée donnée
   */
  async analyzeMarket(ideaTitle: string, ideaSummary: string): Promise<Partial<MarketAnalysis>> {
    if (!this.isAvailable) {
      // Retourner une analyse basique si SERPER n'est pas disponible
      return this.getBasicMarketAnalysis(ideaTitle, ideaSummary);
    }

    try {
      // Extraire les mots-clés de l'idée
      const keywords = this.extractKeywords(ideaTitle, ideaSummary);
      
      // Rechercher les concurrents
      const competitorsQuery = `${keywords.join(' ')} competitors alternatives`;
      const competitorsSearch = await this.searchWeb(competitorsQuery, { num: 5 });
      
      // Rechercher les tendances du marché
      const trendsQuery = `${keywords.join(' ')} market trends 2024`;
      const trendsSearch = await this.searchWeb(trendsQuery, { num: 5, type: 'news' });
      
      // Analyser le sentiment
      const sentiment = this.analyzeSentiment(competitorsSearch, trendsSearch);

      return {
        keywords,
        competitors: this.extractCompetitors(competitorsSearch),
        marketTrends: this.extractTrends(trendsSearch),
        sentimentAnalysis: sentiment,
        newsArticles: this.extractNewsArticles(trendsSearch),
      };
    } catch (error) {
      console.error('Error analyzing market with SERPER:', error);
      return this.getBasicMarketAnalysis(ideaTitle, ideaSummary);
    }
  }

  /**
   * Extrait les mots-clés d'une idée
   */
  private extractKeywords(title: string, summary: string): string[] {
    const text = `${title} ${summary}`.toLowerCase();
    // Mots vides à ignorer
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'pour', 'dans', 'avec', 'sur'];
    const words = text.split(/\W+/).filter(w => w.length > 3 && !stopWords.includes(w));
    
    // Prendre les mots les plus fréquents
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Extrait les concurrents des résultats de recherche
   */
  private extractCompetitors(searchResult: SerperSearchResult): Competitor[] {
    if (!searchResult.organic) return [];

    return searchResult.organic.slice(0, 5).map((result, index) => ({
      name: result.title,
      url: result.link,
      description: result.snippet,
      strengths: [],
      weaknesses: [],
    }));
  }

  /**
   * Extrait les tendances du marché
   */
  private extractTrends(searchResult: SerperSearchResult): MarketTrend[] {
    if (!searchResult.news) return [];

    return searchResult.news.slice(0, 5).map(article => ({
      name: article.title,
      description: article.snippet,
      impact: 'neutral' as const,
    }));
  }

  /**
   * Extrait les articles de presse
   */
  private extractNewsArticles(searchResult: SerperSearchResult): NewsArticle[] {
    if (!searchResult.news) return [];

    return searchResult.news.slice(0, 5).map(article => ({
      title: article.title,
      url: article.link,
      summary: article.snippet,
      date: new Date(article.date || Date.now()),
    }));
  }

  /**
   * Analyse le sentiment basé sur les résultats de recherche
   */
  private analyzeSentiment(
    competitorsSearch: SerperSearchResult,
    trendsSearch: SerperSearchResult
  ): SentimentAnalysis {
    // Analyse simple basée sur les mots-clés positifs/négatifs
    const positiveWords = ['croissance', 'succès', 'opportunité', 'innovation', 'avenir'];
    const negativeWords = ['déclin', 'échec', 'risque', 'problème', 'difficulté'];

    let positiveCount = 0;
    let negativeCount = 0;

    const allText = [
      ...(competitorsSearch.organic || []).map(r => r.snippet),
      ...(trendsSearch.news || []).map(n => n.snippet),
    ].join(' ').toLowerCase();

    positiveWords.forEach(word => {
      if (allText.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (allText.includes(word)) negativeCount++;
    });

    const overallSentiment =
      positiveCount > negativeCount ? 'positive' :
      negativeCount > positiveCount ? 'negative' : 'neutral';

    return {
      overallSentiment,
      score: (positiveCount - negativeCount) / (positiveCount + negativeCount + 1),
      mentions: positiveCount + negativeCount,
    };
  }

  /**
   * Retourne une analyse de marché basique si SERPER n'est pas disponible
   */
  private getBasicMarketAnalysis(title: string, summary: string): Partial<MarketAnalysis> {
    return {
      keywords: this.extractKeywords(title, summary),
      competitors: [],
      marketTrends: [],
      sentimentAnalysis: {
        overallSentiment: 'neutral',
        score: 0,
        mentions: 0,
      },
      newsArticles: [],
    };
  }
}

export const serperService = new SerperService();


/**
 * Service Serper pour recherche web active
 * Documentation: https://serper.dev/api
 */

import axios from 'axios';

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_API_URL = 'https://google.serper.dev';

if (!SERPER_API_KEY) {
  console.warn('⚠️ SERPER_API_KEY non configurée. La recherche web sera désactivée.');
}

interface SerperSearchResponse {
  searchParameters: {
    q: string;
    type: string;
    engine: string;
  };
  organic: Array<{
    title: string;
    link: string;
    snippet: string;
    date?: string;
    position: number;
  }>;
  knowledgeGraph?: {
    title: string;
    type: string;
    description: string;
    website?: string;
  };
  answerBox?: {
    answer?: string;
    title?: string;
  };
  relatedSearches?: Array<{
    query: string;
  }>;
  peopleAlsoAsk?: Array<{
    question: string;
    snippet: string;
    title: string;
    link: string;
  }>;
}

interface SerperNewsResponse {
  news: Array<{
    title: string;
    link: string;
    snippet: string;
    date: string;
    source: string;
  }>;
}

/**
 * Recherche web générale via Serper API
 */
export async function searchMarket(keywords: string): Promise<SerperSearchResponse | null> {
  if (!SERPER_API_KEY) {
    return null;
  }

  try {
    const response = await axios.post<SerperSearchResponse>(
      `${SERPER_API_URL}/search`,
      {
        q: keywords,
        num: 10,
      },
      {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Erreur recherche Serper:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return null;
  }
}

/**
 * Recherche de concurrents pour une idée
 */
export async function findCompetitors(
  ideaTitle: string,
  summary: string
): Promise<{ competitors: any[]; news: any[] }> {
  if (!SERPER_API_KEY) {
    return { competitors: [], news: [] };
  }

  try {
    // Recherche concurrents directs
    const competitorQuery = `competitors of ${ideaTitle} ${summary}`;
    const competitorResults = await searchMarket(competitorQuery);

    // Recherche actualités récentes
    const newsQuery = `${ideaTitle} ${summary} startup news`;
    const newsResponse = await axios.post<SerperNewsResponse>(
      `${SERPER_API_URL}/news`,
      {
        q: newsQuery,
        num: 5,
      },
      {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const competitors = competitorResults?.organic?.slice(0, 10).map((result, index) => ({
      name: result.title,
      url: result.link,
      type: index < 5 ? 'direct' as const : 'indirect' as const,
      description: result.snippet,
    })) || [];

    const news = newsResponse.data.news?.map(article => ({
      title: article.title,
      url: article.link,
      snippet: article.snippet,
      date: article.date,
      source: article.source,
    })) || [];

    return { competitors, news };
  } catch (error: any) {
    console.error('Erreur recherche concurrents:', error.message);
    return { competitors: [], news: [] };
  }
}

/**
 * Analyse tendances marché
 */
export async function analyzeTrends(keywords: string[]): Promise<any[]> {
  if (!SERPER_API_KEY || keywords.length === 0) {
    return [];
  }

  try {
    const trends: any[] = [];

    for (const keyword of keywords.slice(0, 5)) {
      const trendQuery = `${keyword} market trends 2024`;
      const results = await searchMarket(trendQuery);

      if (results?.organic) {
        trends.push({
          trend: keyword,
          description: results.organic[0]?.snippet || '',
          relevance: 'medium' as const,
          source: results.organic[0]?.link,
          date: new Date().toISOString().split('T')[0],
        });
      }

      // Rate limiting: attendre 500ms entre requêtes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return trends;
  } catch (error: any) {
    console.error('Erreur analyse tendances:', error.message);
    return [];
  }
}

/**
 * Recherche web complète pour une idée
 */
export async function researchIdea(ideaTitle: string, summary: string): Promise<{
  competitors: any[];
  marketTrends: any[];
  newsArticles: any[];
  searchQueries: string[];
}> {
  const searchQueries = [
    `${ideaTitle} competitors`,
    `${ideaTitle} market`,
    `${summary} trends`,
  ];

  // Recherche concurrents et actualités
  const { competitors, news } = await findCompetitors(ideaTitle, summary);

  // Analyse tendances
  const keywords = [ideaTitle, ...summary.split(' ').slice(0, 3)];
  const marketTrends = await analyzeTrends(keywords);

  return {
    competitors,
    marketTrends,
    newsArticles: news,
    searchQueries,
  };
}


"use strict";
/**
 * Service Serper pour recherche web active
 * Documentation: https://serper.dev/api
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMarket = searchMarket;
exports.findCompetitors = findCompetitors;
exports.analyzeTrends = analyzeTrends;
exports.researchIdea = researchIdea;
const axios_1 = __importDefault(require("axios"));
const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_API_URL = 'https://google.serper.dev';
if (!SERPER_API_KEY) {
    console.warn('⚠️ SERPER_API_KEY non configurée. La recherche web sera désactivée.');
}
/**
 * Recherche web générale via Serper API
 */
async function searchMarket(keywords) {
    if (!SERPER_API_KEY) {
        return null;
    }
    try {
        const response = await axios_1.default.post(`${SERPER_API_URL}/search`, {
            q: keywords,
            num: 10,
        }, {
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    catch (error) {
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
async function findCompetitors(ideaTitle, summary) {
    var _a, _b;
    if (!SERPER_API_KEY) {
        return { competitors: [], news: [] };
    }
    try {
        // Recherche concurrents directs
        const competitorQuery = `competitors of ${ideaTitle} ${summary}`;
        const competitorResults = await searchMarket(competitorQuery);
        // Recherche actualités récentes
        const newsQuery = `${ideaTitle} ${summary} startup news`;
        const newsResponse = await axios_1.default.post(`${SERPER_API_URL}/news`, {
            q: newsQuery,
            num: 5,
        }, {
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json',
            },
        });
        const competitors = ((_a = competitorResults === null || competitorResults === void 0 ? void 0 : competitorResults.organic) === null || _a === void 0 ? void 0 : _a.slice(0, 10).map((result, index) => ({
            name: result.title,
            url: result.link,
            type: index < 5 ? 'direct' : 'indirect',
            description: result.snippet,
        }))) || [];
        const news = ((_b = newsResponse.data.news) === null || _b === void 0 ? void 0 : _b.map(article => ({
            title: article.title,
            url: article.link,
            snippet: article.snippet,
            date: article.date,
            source: article.source,
        }))) || [];
        return { competitors, news };
    }
    catch (error) {
        console.error('Erreur recherche concurrents:', error.message);
        return { competitors: [], news: [] };
    }
}
/**
 * Analyse tendances marché
 */
async function analyzeTrends(keywords) {
    var _a, _b;
    if (!SERPER_API_KEY || keywords.length === 0) {
        return [];
    }
    try {
        const trends = [];
        for (const keyword of keywords.slice(0, 5)) {
            const trendQuery = `${keyword} market trends 2024`;
            const results = await searchMarket(trendQuery);
            if (results === null || results === void 0 ? void 0 : results.organic) {
                trends.push({
                    trend: keyword,
                    description: ((_a = results.organic[0]) === null || _a === void 0 ? void 0 : _a.snippet) || '',
                    relevance: 'medium',
                    source: (_b = results.organic[0]) === null || _b === void 0 ? void 0 : _b.link,
                    date: new Date().toISOString().split('T')[0],
                });
            }
            // Rate limiting: attendre 500ms entre requêtes
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return trends;
    }
    catch (error) {
        console.error('Erreur analyse tendances:', error.message);
        return [];
    }
}
/**
 * Recherche web complète pour une idée
 */
async function researchIdea(ideaTitle, summary) {
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
//# sourceMappingURL=serper.service.js.map
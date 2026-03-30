require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = "gemini-2.5-flash"; // Modèle rapide et équilibré (2026)
    
    // Initialisation différée pour gérer l'absence de clé au démarrage
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    
    // Limites du plan gratuit
    this.limits = {
      requestsPerMinute: 15,
      requestsPerDay: 1500
    };
    
    // Cache pour éviter les requêtes répétitives
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Vérifie si une réponse est en cache
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Met en cache une réponse
   */
  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Appel sécurisé à l'API Gemini avec le SDK stable @google/generative-ai
   */
  async _generate(prompt, retryCount = 0) {
    if (!this.apiKey) {
      throw new Error("Clé API Gemini manquante (GEMINI_API_KEY non configurée)");
    }

    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }

    try {
      console.log(`[Gemini] Génération avec ${this.modelName} (essai ${retryCount + 1})...`);
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error("Réponse vide reçue de Gemini");
      }
      
      return text.trim();
    } catch (error) {
      const isQuotaError = error.message?.includes("429") || error.message?.includes("Quota");
      
      if (isQuotaError && retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 2000;
        console.warn(`[Gemini Quota] Rate limit atteint. Nouvel essai dans ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._generate(prompt, retryCount + 1);
      }

      console.error("[Gemini SDK Error]:", error.message);
      if (error.response?.data) {
        console.error("[Details]:", JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * Analyse ULTRA-RAPIDE du stock
   */
  async analyzeStock(stockData) {
    const cacheKey = `stock_${JSON.stringify(stockData).substring(0, 50)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const criticalProducts = (stockData.products || [])
      .filter(p => 
        p.quantity <= (p.reorderPoint || 10) || 
        (p.batches && p.batches.some(b => {
          const daysToExpiry = b.expirationDate 
            ? Math.floor((new Date(b.expirationDate) - new Date()) / 86400000)
            : 999;
          return daysToExpiry < 30;
        }))
      )
      .slice(0, 15)
      .map(p => ({
        n: p.name,
        q: p.quantity,
        r: p.reorderPoint,
        exp: p.batches?.[0]?.expirationDate
      }));

    const prompt = `Stock: ${JSON.stringify(criticalProducts)}
Analyse rapide: Ruptures, Expirations < 30j, Actions. Format court.`;

    try {
      const result = await this._generate(prompt);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Erreur analyse stock: ${error.message}`);
    }
  }

  /**
   * Prédiction de demande
   */
  async predictDemand(productHistory) {
    const cacheKey = `demand_${productHistory.productName}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const prompt = `Produit: ${productHistory.productName}
Ventes 7j: ${JSON.stringify(productHistory.lastWeek || [])}
Prédis les 7 prochains jours. Format: J1:X, J2:Y...`;

    try {
      const result = await this._generate(prompt);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Erreur prédiction: ${error.message}`);
    }
  }

  /**
   * ANALYSE COMBINÉE (1 seul appel)
   */
  async analyzeCombined(data) {
    const cacheKey = `combined_${Date.now().toString().substring(0, 10)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const critical = {
      lowStock: (data.products || []).filter(p => p.quantity <= (p.reorderPoint || 5)).slice(0, 5).map(p => p.name),
      expiring: (data.products || []).filter(p => {
        const days = p.batches?.[0]?.expirationDate 
          ? Math.floor((new Date(p.batches[0].expirationDate) - new Date()) / 86400000)
          : 999;
        return days < 15;
      }).slice(0, 5).map(p => p.name),
      topSales: (data.topProducts || []).slice(0, 3).map(p => p.name)
    };

    const prompt = `Stock faible: ${critical.lowStock.join(', ')}
Expire <15j: ${critical.expiring.join(', ')}
Top ventes: ${critical.topSales.join(', ')}
Résumé en 3 points + 1 action prioritaire.`;

    try {
      const result = await this._generate(prompt);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Erreur analyse combinée: ${error.message}`);
    }
  }

  /**
   * Détection d'anomalies
   */
  async detectAnomalies(stockData) {
    const anomalies = [];
    (stockData.products || []).forEach(p => {
      if (p.quantity < 0) anomalies.push(`${p.name}: stock négatif`);
      if (p.maxStockLevel && p.quantity > p.maxStockLevel * 2) anomalies.push(`${p.name}: surstock`);
    });

    if (anomalies.length === 0) return "✅ Aucune anomalie majeure détectée.";

    const prompt = `Anomalies: ${anomalies.join('; ')}
Analyse par priorité (critique/moyen/faible).`;

    try {
      return await this._generate(prompt);
    } catch (error) {
      return `Anomalies détectées: ${anomalies.join(', ')}`;
    }
  }

  /**
   * Optimisation des commandes
   */
  async optimizeOrders(data) {
    const recommendations = (data.lowStockProducts || [])
      .slice(0, 8)
      .map(p => ({
        n: p.name,
        q: p.currentQuantity,
        target: p.maxStockLevel || (p.reorderPoint * 3)
      }));

    const prompt = `Produits en rupture: ${JSON.stringify(recommendations)}
Propose des quantités à commander en priorité.`;

    try {
      return await this._generate(prompt);
    } catch (error) {
      throw new Error(`Erreur optimisation: ${error.message}`);
    }
  }

  /**
   * Analyse du gaspillage
   */
  async analyzeWaste(wasteData) {
    const prompt = `Gaspillage estimé: ${wasteData.totalEstimatedLoss}€
Produits: ${JSON.stringify((wasteData.items || []).slice(0, 5))}
Donne 3 conseils pour réduire ce gaspillage.`;

    try {
      return await this._generate(prompt);
    } catch (error) {
      return `Gaspillage total: ${wasteData.totalEstimatedLoss}€`;
    }
  }

  /**
   * Génération de rapport global
   */
  async generateReport(data) {
    const prompt = `Période: ${data.period || '30j'}
Stats: ${JSON.stringify(data.summary || {})}
Génère un rapport de gestion de stock synthétique (Executive Summary, Points Clés).`;

    try {
      return await this._generate(prompt);
    } catch (error) {
      throw new Error(`Erreur rapport: ${error.message}`);
    }
  }

  /**
   * Prompt personnalisé
   */
  async customPrompt(userPrompt, context = {}) {
    const prompt = `Contexte: ${JSON.stringify(context).substring(0, 200)}
Question: ${userPrompt}
Réponse courte et précise.`;

    try {
      return await this._generate(prompt);
    } catch (error) {
      throw new Error(`Erreur IA: ${error.message}`);
    }
  }

  /**
   * Nettoyer le cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Test de connexion
   */
  async testConnection() {
    try {
      const text = await this._generate("test");
      return text.length > 0;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new GeminiService();
module.exports.GeminiService = GeminiService;
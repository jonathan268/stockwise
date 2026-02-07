require("dotenv").config();
const { GoogleGenAI } = require('@google/genai');

class GeminiService {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.model = "gemini-2.0-flash"; // Modèle gratuit le plus performant
    
    // Limites du plan gratuit
    this.limits = {
      maxTokensPerRequest: 8000, // Limite conservative
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
   * Réduit les données pour optimiser les tokens
   */
  optimizeData(data, maxItems = 10) {
    if (Array.isArray(data)) {
      return data.slice(0, maxItems);
    }
    return data;
  }

  /**
   * Analyse ULTRA-RAPIDE du stock (prompt minimal)
   * Optimisé pour plan gratuit - Analyse seulement les données critiques
   */
  async analyzeStock(stockData) {
    const cacheKey = `stock_${JSON.stringify(stockData).substring(0, 50)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Filtrer UNIQUEMENT les produits critiques pour économiser les tokens
    const criticalProducts = stockData.products
      ?.filter(p => 
        p.quantity <= (p.reorderPoint || 10) || // Stock faible
        (p.batches && p.batches.some(b => {
          const daysToExpiry = b.expirationDate 
            ? Math.floor((new Date(b.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))
            : 999;
          return daysToExpiry < 30; // Expire bientôt
        }))
      )
      .slice(0, 15) // MAX 15 produits pour économiser
      .map(p => ({
        n: p.name,
        q: p.quantity,
        r: p.reorderPoint,
        exp: p.batches?.[0]?.expirationDate
      }));

    // Prompt ULTRA-COURT (< 200 tokens)
    const prompt = `Stock: ${JSON.stringify(criticalProducts)}

Analyse rapide:
1. Produits < seuil
2. Expire < 30j
3. Actions urgentes

Format court.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt
      });

      const result = response.text.trim();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Gemini erreur: ${error.message}`);
    }
  }

  /**
   * Prédiction de demande SIMPLIFIÉE
   * Analyse seulement les 3 produits les plus vendus
   */
  async predictDemand(productHistory) {
    const cacheKey = `demand_${productHistory.productName}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Simplifier les données historiques
    const simplified = {
      p: productHistory.productName,
      d: productHistory.lastWeek || productHistory.movements?.slice(-7).map(m => m.quantity)
    };

    const prompt = `Produit: ${simplified.p}
Ventes 7j: ${JSON.stringify(simplified.d)}

Prédis 7 prochains jours (format: J1:X, J2:Y...).`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt
      });

      const result = response.text.trim();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Gemini erreur: ${error.message}`);
    }
  }

  /**
   * ANALYSE COMBINÉE - 1 seul appel pour tout
   * C'est la méthode la PLUS OPTIMISÉE pour le plan gratuit
   */
  async analyzeCombined(data) {
    const cacheKey = `combined_${Date.now().toString().substring(0, 10)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Extraire SEULEMENT les données critiques
    const critical = {
      lowStock: data.products?.filter(p => p.quantity <= (p.reorderPoint || 5)).slice(0, 5).map(p => p.name),
      expiring: data.products?.filter(p => {
        const days = p.batches?.[0]?.expirationDate 
          ? Math.floor((new Date(p.batches[0].expirationDate) - new Date()) / 86400000)
          : 999;
        return days < 15;
      }).slice(0, 5).map(p => ({ n: p.name, d: Math.floor((new Date(p.batches[0].expirationDate) - new Date()) / 86400000) })),
      topSales: data.topProducts?.slice(0, 3).map(p => ({ n: p.name, q: p.totalQuantity }))
    };

    // PROMPT ULTRA-COMPACT (économise 80% de tokens)
    const prompt = `Analyse stock:
Stock faible: ${critical.lowStock?.join(', ') || 'aucun'}
Expire <15j: ${JSON.stringify(critical.expiring || [])}
Top ventes: ${JSON.stringify(critical.topSales || [])}

Résumé en 3 points max + 1 action prioritaire.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt
      });

      const result = response.text.trim();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Gemini erreur: ${error.message}`);
    }
  }

  /**
   * Détection d'anomalies RAPIDE
   */
  async detectAnomalies(stockData) {
    const cacheKey = `anomalies_${Date.now().toString().substring(0, 10)}`;
    
    // Détecter automatiquement les anomalies AVANT l'appel IA
    const anomalies = [];
    
    stockData.products?.forEach(p => {
      // Stock négatif
      if (p.quantity < 0) {
        anomalies.push(`${p.name}: stock négatif (${p.quantity})`);
      }
      
      // Surstock extrême (>200% du max)
      if (p.maxStockLevel && p.quantity > p.maxStockLevel * 2) {
        anomalies.push(`${p.name}: surstock (${p.quantity}/${p.maxStockLevel})`);
      }
      
      // Produit dormant (pas de mouvement depuis 90j)
      const daysSinceMovement = p.lastMovement 
        ? Math.floor((Date.now() - new Date(p.lastMovement)) / 86400000)
        : 0;
      if (daysSinceMovement > 90) {
        anomalies.push(`${p.name}: dormant ${daysSinceMovement}j`);
      }
    });

    // Si peu d'anomalies, retourner direct sans appel IA
    if (anomalies.length <= 3) {
      return anomalies.length > 0 
        ? `Anomalies détectées:\n- ${anomalies.join('\n- ')}`
        : "✅ Aucune anomalie détectée";
    }

    // Sinon, utiliser l'IA seulement pour analyser
    const prompt = `Anomalies: ${anomalies.slice(0, 10).join('; ')}

Classe par priorité (critique/moyen/faible).`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt
      });

      return response.text.trim();
    } catch (error) {
      // Fallback : retourner les anomalies sans analyse IA
      return `Anomalies (${anomalies.length}):\n- ${anomalies.slice(0, 10).join('\n- ')}`;
    }
  }

  /**
   * Optimisation des commandes SIMPLIFIÉE
   */
  async optimizeOrders(data) {
    const cacheKey = `orders_${Date.now().toString().substring(0, 10)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Calculer directement les quantités recommandées
    const recommendations = data.lowStockProducts
      ?.slice(0, 8) // Max 8 produits
      .map(p => {
        const toOrder = (p.maxStockLevel || p.reorderPoint * 3) - p.currentQuantity;
        return {
          n: p.name,
          actuel: p.currentQuantity,
          commander: Math.max(0, toOrder)
        };
      })
      .filter(r => r.commander > 0);

    const prompt = `Commander: ${JSON.stringify(recommendations)}

Budget: ${data.budgetConstraint || 'illimité'}

Priorise + conseils courts.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt
      });

      const result = response.text.trim();
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      // Fallback : retourner les recommandations calculées
      return `Commandes recommandées:\n${recommendations.map(r => 
        `- ${r.n}: ${r.commander} unités (actuel: ${r.actuel})`
      ).join('\n')}`;
    }
  }

  /**
   * Analyse du gaspillage ULTRA-COMPACTE
   */
  async analyzeWaste(wasteData) {
    const cacheKey = `waste_${Date.now().toString().substring(0, 10)}`;
    
    // Calculer automatiquement les statistiques
    const stats = {
      total: wasteData.totalEstimatedLoss || 0,
      items: wasteData.items?.length || 0,
      topWaste: wasteData.items
        ?.reduce((acc, item) => {
          acc[item.product] = (acc[item.product] || 0) + (item.estimatedValue || 0);
          return acc;
        }, {})
    };

    const topProducts = Object.entries(stats.topWaste || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ n: name, v: value.toFixed(2) }));

    const prompt = `Gaspillage total: ${stats.total.toFixed(2)}€
Top produits: ${JSON.stringify(topProducts)}

3 conseils pour réduire.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt
      });

      return response.text.trim();
    } catch (error) {
      return `Gaspillage: ${stats.total.toFixed(2)}€ sur ${stats.items} items\nTop: ${topProducts.map(p => `${p.n} (${p.v}€)`).join(', ')}`;
    }
  }

  /**
   * Prompt personnalisé COURT
   */
  async customPrompt(userPrompt, context = {}) {
    // Limiter le contexte à 100 caractères max
    const shortContext = JSON.stringify(context).substring(0, 100);
    
    const prompt = `${userPrompt}${shortContext ? `\nCtx: ${shortContext}` : ''}

Réponse courte et actionnable.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt
      });

      return response.text.trim();
    } catch (error) {
      throw new Error(`Gemini erreur: ${error.message}`);
    }
  }

  /**
   * Nettoyer le cache périodiquement
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Test de connexion
   */
  async testConnection() {
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: "Test"
      });
      return response.text.trim().length > 0;
    } catch (error) {
      console.error("Erreur Gemini:", error.message);
      return false;
    }
  }
}

// Export singleton
module.exports = new GeminiService();
module.exports.GeminiService = GeminiService;
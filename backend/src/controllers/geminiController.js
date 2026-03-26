const geminiService = require("../services/gemini");
const Stock = require("../models/Stock");
const Product = require("../models/Product");
const StockMovement = require("../models/stockMovement");

/**
 * ANALYSE COMPLÈTE OPTIMISÉE
 * Utilise 1 SEUL appel API au lieu de 6 pour économiser les quotas
 */
exports.runCompleteAnalysis = async (req, res) => {
  try {
    console.log(" Analyse IA optimisée démarrée...");

    // 1. Récupérer UNIQUEMENT les données nécessaires
    const [stocks, recentMovements] = await Promise.all([
      Stock.find()
        .populate(
          "product",
          "name unit reorderPoint minStockLevel maxStockLevel purchasePrice",
        )
        .select("product quantity availableQuantity batches")
        .limit(100), // Limiter pour éviter surcharge

      StockMovement.aggregate([
        {
          $match: {
            type: "exit",
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: "$product",
            totalQuantity: { $sum: "$quantity" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productInfo",
          },
        },
      ]),
    ]);

    // 2. Préparer les données MINIMALES pour l'IA
    const productsData = stocks.map((stock) => ({
      name: stock.product?.name,
      quantity: stock.quantity,
      reorderPoint: stock.product?.reorderPoint,
      maxStockLevel: stock.product?.maxStockLevel,
      batches: stock.batches?.map((b) => ({
        expirationDate: b.expirationDate,
        quantity: b.quantity,
      })),
    }));

    const topProducts = recentMovements.map((m) => ({
      name: m.productInfo[0]?.name,
      totalQuantity: m.totalQuantity,
    }));

    // 3. UN SEUL APPEL IA pour tout analyser
    const combinedAnalysis = await geminiService.analyzeCombined({
      products: productsData,
      topProducts: topProducts,
    });

    // 4. Ajouter des statistiques calculées localement (sans IA)
    const stats = {
      totalProducts: stocks.length,
      lowStockCount: productsData.filter(
        (p) => p.quantity <= (p.reorderPoint || 5),
      ).length,
      expiringCount: productsData.filter((p) => {
        const days = p.batches?.[0]?.expirationDate
          ? Math.floor(
              (new Date(p.batches[0].expirationDate) - new Date()) / 86400000,
            )
          : 999;
        return days < 30;
      }).length,
      totalValue: stocks
        .reduce(
          (sum, s) => sum + s.quantity * (s.product?.purchasePrice || 0),
          0,
        )
        .toFixed(2),
    };

    res.json({
      success: true,
      message: "Analyse optimisée effectuée (1 appel IA)",
      data: {
        timestamp: new Date(),
        stats,
        aiAnalysis: combinedAnalysis,
        apiCalls: 1, // Important : tracker les appels
      },
    });
  } catch (error) {
    console.error("❌ Erreur analyse:", error);
    const isQuotaError = error.message && error.message.includes('429');
    
    res.status(isQuotaError ? 429 : 500).json({
      success: false,
      message: isQuotaError 
        ? "Quota d'intelligence artificielle dépassé. Veuillez réessayer plus tard ou vérifier votre clé API Gemini." 
        : error.message,
    });
  }
};

/**
 * ANALYSE SÉLECTIVE OPTIMISÉE
 * Maximum 2 appels API même avec toutes les options
 */
exports.runSelectiveAnalysis = async (req, res) => {
  try {
    const { analyses = [] } = req.body;

    if (!analyses.length) {
      return res.status(400).json({
        success: false,
        message: "Sélectionnez au moins une analyse",
      });
    }

    const results = {
      timestamp: new Date(),
      requestedAnalyses: analyses,
      analyses: {},
      apiCalls: 0,
    };

    // Récupérer les données une seule fois
    const stocks = await Stock.find()
      .populate("product")
      .select("product quantity availableQuantity batches")
      .limit(50);

    const productsData = stocks.map((s) => ({
      name: s.product?.name,
      quantity: s.quantity,
      reorderPoint: s.product?.reorderPoint,
      maxStockLevel: s.product?.maxStockLevel,
      batches: s.batches,
    }));

    // STRATÉGIE : Combiner plusieurs analyses en 1 appel si possible
    const needsAI = analyses.filter((a) =>
      ["stock", "demand", "waste"].includes(a),
    );
    const needsLocal = analyses.filter((a) =>
      ["anomalies", "orders"].includes(a),
    );

    // Traiter les analyses locales (SANS appel IA)
    if (needsLocal.includes("anomalies")) {
      results.analyses.anomalies = await geminiService.detectAnomalies({
        products: productsData,
      });
      results.apiCalls += 0.5; // Peut utiliser ou non l'IA selon le cas
    }

    if (needsLocal.includes("orders")) {
      const lowStock = productsData.filter(
        (p) => p.quantity <= (p.reorderPoint || 5),
      );
      results.analyses.orders = await geminiService.optimizeOrders({
        lowStockProducts: lowStock.map((p) => ({
          name: p.name,
          currentQuantity: p.quantity,
          reorderPoint: p.reorderPoint,
          maxStockLevel: p.maxStockLevel,
        })),
      });
      results.apiCalls += 0.5;
    }

    // Traiter les analyses IA (1 seul appel combiné)
    if (needsAI.length > 0) {
      const combined = await geminiService.analyzeCombined({
        products: productsData,
        analysisTypes: needsAI,
      });

      results.analyses.combined = combined;
      results.apiCalls += 1;
    }

    res.json({
      success: true,
      message: `Analyses effectuées avec ${results.apiCalls} appel(s) API`,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ANALYSE RAPIDE (Version ultra-light)
 * Utilise principalement des calculs locaux + 1 micro-appel IA
 */
exports.quickAnalysis = async (req, res) => {
  try {
    const stocks = await Stock.find()
      .populate("product", "name reorderPoint")
      .select("product quantity batches")
      .limit(30);

    // Calculs locaux (0 appel IA)
    const lowStock = stocks.filter(
      (s) => s.quantity <= (s.product?.reorderPoint || 5),
    );
    const expiringSoon = stocks.filter((s) => {
      const days = s.batches?.[0]?.expirationDate
        ? Math.floor(
            (new Date(s.batches[0].expirationDate) - new Date()) / 86400000,
          )
        : 999;
      return days < 15;
    });

    // 1 micro-appel IA pour le conseil
    const quickAdvice = await geminiService.customPrompt(
      `${lowStock.length} produits en rupture, ${expiringSoon.length} expirent <15j. Conseil prioritaire?`,
      {},
    );

    res.json({
      success: true,
      data: {
        lowStock: lowStock.map((s) => s.product?.name),
        expiringSoon: expiringSoon.map((s) => s.product?.name),
        advice: quickAdvice,
        apiCalls: 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Analyses individuelles (gardées mais optimisées)
 */
exports.analyzeStock = async (req, res) => {
  try {
    const stocks = await Stock.find().populate("product").limit(20);

    const analysis = await geminiService.analyzeStock({
      products: stocks.map((s) => ({
        name: s.product?.name,
        quantity: s.quantity,
        reorderPoint: s.product?.reorderPoint,
        batches: s.batches?.slice(0, 2), // Max 2 lots par produit
      })),
    });

    res.json({ success: true, data: { analysis }, apiCalls: 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.predictDemand = async (req, res) => {
  try {
    const { productId } = req.body;

    const movements = await StockMovement.find({
      product: productId,
      type: "exit",
    })
      .sort({ createdAt: -1 })
      .limit(7);

    const product = await Product.findById(productId);

    const prediction = await geminiService.predictDemand({
      productName: product.name,
      lastWeek: movements.map((m) => m.quantity),
    });

    res.json({ success: true, data: { prediction }, apiCalls: 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.detectAnomalies = async (req, res) => {
  try {
    const stocks = await Stock.find().populate("product").limit(30);

    const anomalies = await geminiService.detectAnomalies({
      products: stocks.map((s) => ({
        name: s.product?.name,
        quantity: s.quantity,
        maxStockLevel: s.product?.maxStockLevel,
      })),
    });

    res.json({ success: true, data: { anomalies }, apiCalls: 0.5 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.customQuery = async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt || prompt.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Prompt requis (max 200 caractères)",
      });
    }

    const response = await geminiService.customPrompt(prompt, context || {});

    res.json({ success: true, data: { response }, apiCalls: 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.optimizeOrders = async (req, res) => {
  try {
    const { budgetConstraint } = req.body;

    const stocks = await Stock.find()
      .populate("product", "name reorderPoint maxStockLevel")
      .select("product quantity")
      .limit(50);

    const lowStockProducts = stocks
      .filter(s => s.quantity <= (s.product?.reorderPoint || 5))
      .map(s => ({
        name: s.product?.name,
        currentQuantity: s.quantity,
        reorderPoint: s.product?.reorderPoint,
        maxStockLevel: s.product?.maxStockLevel,
      }));

    const result = await geminiService.optimizeOrders({ lowStockProducts, budgetConstraint });

    res.json({ success: true, data: { result }, apiCalls: 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.analyzeWaste = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const query = { type: "exit" };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const movements = await StockMovement.find(query)
      .populate("product", "name purchasePrice")
      .limit(100);

    const items = movements.map(m => ({
      product: m.product?.name || "Inconnu",
      quantity: m.quantity,
      estimatedValue: m.quantity * (m.product?.purchasePrice || 0),
    }));

    const totalEstimatedLoss = items.reduce((sum, i) => sum + i.estimatedValue, 0);

    const result = await geminiService.analyzeWaste({ items, totalEstimatedLoss });

    res.json({ success: true, data: { result, totalEstimatedLoss }, apiCalls: 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { period = "30d" } = req.body;

    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    const days = daysMap[period] || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [stocks, movements] = await Promise.all([
      Stock.find().populate("product", "name purchasePrice").select("product quantity").limit(50),
      StockMovement.find({ createdAt: { $gte: since } }).limit(200),
    ]);

    const summary = {
      totalProducts: stocks.length,
      totalStockValue: stocks
        .reduce((sum, s) => sum + s.quantity * (s.product?.purchasePrice || 0), 0)
        .toFixed(2),
      totalMovements: movements.length,
      period,
    };

    const result = await geminiService.generateReport({ period, summary });

    res.json({ success: true, data: { report: result, summary }, apiCalls: 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



/**
 * Nettoyer le cache (à appeler périodiquement)
 */
exports.clearCache = async (req, res) => {
  try {
    geminiService.clearCache();
    res.json({
      success: true,
      message: "Cache nettoyé",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Statistiques d'utilisation de l'API
 */
exports.getApiUsage = async (req, res) => {
  try {
    // Vous pouvez stocker ces stats dans une DB
    res.json({
      success: true,
      data: {
        plan: "Gratuit",
        limits: {
          requestsPerMinute: 15,
          requestsPerDay: 1500,
        },
        tips: [
          "Utilisez quickAnalysis pour économiser",
          "Le cache réduit les appels répétitifs",
          "Analyses combinées = moins d'appels",
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

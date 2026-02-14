const Prediction = require("../models/Prediction");
const Stock = require("../models/Stock");
const Product = require("../models/Product");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");
const { callClaudeAPI } = require("../services/aiService");

class AIController {
  // POST /api/v1/ai/predict-demand
  async predictDemand(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const userId = req.user._id;
      const { productId, timeframe = "7days" } = req.body;

      // Vérifier limites abonnement
      const subscription = req.subscription;
      const org = req.organization;

      if (!org.canUseAI()) {
        throw new AppError(
          `Limite mensuelle de ${subscription.features.aiPredictionsPerMonth} prédictions IA atteinte. Passez à un plan supérieur`,
          403,
        );
      }

      // Récupérer produit et historique
      const product = await Product.findOne({
        _id: productId,
        organization: organizationId,
      });

      if (!product) {
        throw new AppError("Produit introuvable", 404);
      }

      const stock = await Stock.findOne({
        organization: organizationId,
        product: productId,
      });

      // Récupérer historique transactions
      const transactions = await Transaction.find({
        organization: organizationId,
        product: productId,
        type: "sale",
        transactionDate: {
          $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      }).sort({ transactionDate: -1 });

      // Construire prompt pour IA
      const prompt = this.buildDemandForecastPrompt(
        product,
        stock,
        transactions,
        timeframe,
      );

      // Créer prédiction en DB
      const prediction = await Prediction.create({
        organization: organizationId,
        type: "demand_forecast",
        product: productId,
        input: {
          prompt,
          context: {
            productName: product.name,
            currentStock: stock?.quantity,
            historicalSales: transactions.length,
          },
          timeframe,
        },
        createdBy: userId,
        status: "processing",
      });

      try {
        // Appeler IA
        const aiResponse = await callClaudeAPI(prompt);

        // Parser réponse
        const parsedPredictions = this.parseDemandForecast(aiResponse);

        // Mettre à jour prédiction
        prediction.output = {
          rawResponse: aiResponse,
          parsedData: parsedPredictions,
          confidence: parsedPredictions.confidence || 0.7,
        };

        prediction.predictions = parsedPredictions;
        prediction.status = "completed";
        prediction.aiMetadata.tokensUsed = aiResponse.usage?.total_tokens;

        await prediction.save();

        // Incrémenter usage
        await org.updateOne({
          $inc: { "usage.aiPredictionsUsed": 1 },
        });

        return successResponse(
          res,
          prediction,
          "Prévision générée avec succès",
        );
      } catch (error) {
        prediction.status = "failed";
        prediction.error = {
          message: error.message,
          code: error.code,
        };
        await prediction.save();

        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  // Construire prompt prévision demande
  buildDemandForecastPrompt(product, stock, transactions, timeframe) {
    const salesData = transactions.map((t) => ({
      date: t.transactionDate.toISOString().split("T")[0],
      quantity: t.quantity,
    }));

    return `Tu es un expert en prévision de la demande pour la gestion de stock.

Produit: ${product.name}
Catégorie: ${product.category}
Stock actuel: ${stock?.quantity || 0} ${product.unit}
Seuil minimum: ${stock?.minThreshold || "non défini"}

Historique des ventes (90 derniers jours):
${JSON.stringify(salesData, null, 2)}

Caractéristiques du produit:
- Périssable: ${product.metadata.perishable ? "Oui" : "Non"}
- Saisonnier: ${product.metadata.seasonal ? "Oui" : "Non"}
${product.metadata.shelfLife ? `- Durée de conservation: ${product.metadata.shelfLife} jours` : ""}

Analyse demandée:
1. Prévoir la demande pour les ${timeframe}
2. Recommander une quantité de réapprovisionnement
3. Identifier les tendances et patterns
4. Donner des insights actionnables

Format de réponse (JSON strict):
{
  "nextWeekDemand": <nombre>,
  "nextMonthDemand": <nombre>,
  "recommendedOrderQty": <nombre>,
  "confidence": <0-1>,
  "insights": ["insight1", "insight2"],
  "warnings": ["warning1"],
  "seasonality": "<detected pattern>"
}`;
  }

  // Parser réponse IA
  parseDemandForecast(aiResponse) {
    try {
      // Extraire JSON de la réponse
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Format de réponse invalide");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        nextWeekDemand: parsed.nextWeekDemand || 0,
        nextMonthDemand: parsed.nextMonthDemand || 0,
        recommendedOrderQty: parsed.recommendedOrderQty || 0,
        confidence: parsed.confidence || 0.7,
        insights: parsed.insights || [],
        warnings: parsed.warnings || [],
      };
    } catch (error) {
      console.error("Erreur parsing IA:", error);
      return {
        nextWeekDemand: 0,
        confidence: 0,
        insights: ["Erreur de parsing de la réponse IA"],
      };
    }
  }

  // POST /api/v1/ai/optimize-stock
  async optimizeStock(req, res, next) {
    try {
      // TODO: Implémenter optimisation stock
      throw new AppError("Optimisation en développement", 501);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/ai/detect-anomalies
  async detectAnomalies(req, res, next) {
    try {
      // TODO: Implémenter détection anomalies
      throw new AppError("Détection anomalies en développement", 501);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/ai/ask
  async askQuestion(req, res, next) {
    try {
      const { question } = req.body;
      const organizationId = req.user.organization;

      if (!question) {
        throw new AppError("Question requise", 400);
      }

      // TODO: Implémenter Q&A général avec contexte organisation
      throw new AppError("Q&A IA en développement", 501);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/ai/insights
  async generateInsights(req, res, next) {
    try {
      // TODO: Générer insights généraux sur le business
      throw new AppError("Insights IA en développement", 501);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/ai/predictions
  async getPredictions(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const { type, status, limit = 20 } = req.query;

      const query = { organization: organizationId };

      if (type) query.type = type;
      if (status) query.status = status;

      const predictions = await Prediction.find(query)
        .populate("product", "name sku")
        .populate("createdBy", "firstName lastName")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      return successResponse(res, predictions, "Prédictions récupérées");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/ai/predictions/:id
  async getPrediction(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const prediction = await Prediction.findOne({
        _id: id,
        organization: organizationId,
      })
        .populate("product")
        .populate("createdBy", "firstName lastName");

      if (!prediction) {
        throw new AppError("Prédiction introuvable", 404);
      }

      return successResponse(res, prediction, "Prédiction récupérée");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/ai/predictions/:id/feedback
  async submitFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const { helpful, accuracy, actualOutcome, comment } = req.body;
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const prediction = await Prediction.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!prediction) {
        throw new AppError("Prédiction introuvable", 404);
      }

      prediction.feedback = {
        helpful,
        accuracy,
        actualOutcome,
        comment,
        submittedAt: new Date(),
        submittedBy: userId,
      };

      await prediction.save();

      return successResponse(res, prediction, "Feedback enregistré");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AIController();

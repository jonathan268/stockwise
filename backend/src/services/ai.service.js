import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Recommendation from "../models/Recommendation.js";
import Organization from "../models/Organization.js";
import logger from "../utils/logger.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

const saveRecommendation = async (orgId, rec) => {
  await Recommendation.create({ organizationId: orgId, ...rec });
};

const callGemini = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(prompt);
  let text = result.response.text();
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(text);
};

/**
 * Analyse principale : stock, tendances, pricing, dead stock
 */
export const generateInsightsForOrg = async (organizationId) => {
  try {
    const org = await Organization.findById(organizationId);
    if (!org?.hasProAccess) {
      logger.info(`Org ${organizationId} n'a pas accès aux features IA.`);
      return;
    }

    const products = await Product.find({ organizationId, isDeleted: false })
      .sort({ salesVelocity: -1, currentStock: 1 })
      .limit(100)
      .select("name sku currentStock minimumStock sellingPrice costPrice salesVelocity lastSoldAt");

    if (products.length === 0) return;

    // Analyse tendances saisonnières
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentSales = await Sale.aggregate([
      { $match: { organizationId: org._id, createdAt: { $gte: threeMonthsAgo }, status: "completed" } },
      { $unwind: "$items" },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, total: { $sum: "$items.quantity" }, revenue: { $sum: "$items.totalPrice" } } },
      { $sort: { _id: 1 } },
    ]);

    const prompt = `
      Tu es un expert Supply Chain avec 15 ans d'expérience. Voici les données d'une PME :

      PRODUITS (JSON):
      ${JSON.stringify(products)}

      VENTES MENSUELLES (3 derniers mois):
      ${JSON.stringify(recentSales)}

      Génère 5 recommandations variées. 
      Pour chaque recommandation, précise le type parmi: "stock" (réapprovisionnement), "trend" (tendance), "pricing" (prix), "dead_stock" (stock dormant), "bundle" (lot).
      
      Réponds UNIQUEMENT avec un tableau JSON valide :
      [
        {
          "title": "Titre court (max 60 chars)",
          "description": "Explication détaillée actionnable",
          "type": "stock" | "trend" | "pricing" | "dead_stock" | "bundle",
          "priority": "high" | "medium" | "low",
          "relatedProductIds": ["id_produit"]  // IDs pertinents ou []
        }
      ]
    `;

    const insights = await callGemini(prompt);
    const typeMap = { stock: "restock", trend: "popular", pricing: "bundle", dead_stock: "dead_stock", bundle: "bundle" };

    for (const insight of insights) {
      await saveRecommendation(organizationId, {
        title: insight.title,
        description: insight.description,
        type: typeMap[insight.type] || "restock",
        priority: insight.priority,
        actionLabel: insight.type === "pricing" ? "adjust_price" : insight.type === "dead_stock" ? "clearance" : "reorder",
        relatedProducts: insight.relatedProductIds || [],
      });
    }

    // Analyse dead stock locale (complément IA)
    const deadStockProducts = products.filter(
      (p) => p.lastSoldAt && (Date.now() - p.lastSoldAt.getTime()) > 90 * 24 * 60 * 60 * 1000 && p.currentStock > 0,
    );
    for (const p of deadStockProducts.slice(0, 5)) {
      await saveRecommendation(organizationId, {
        title: `📦 Stock dormant : ${p.name}`,
        description: `Pas de vente depuis 90+ jours. Stock actuel: ${p.currentStock}. Envisagez une promotion ou un retour fournisseur.`,
        type: "dead_stock",
        priority: "medium",
        actionLabel: "clearance",
        relatedProducts: [p._id],
      });
    }

    // Analyse marge faible
    for (const p of products) {
      if (p.costPrice > 0 && p.sellingPrice > 0) {
        const margin = ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100;
        if (margin < 15) {
          await saveRecommendation(organizationId, {
            title: `📉 Marge faible : ${p.name}`,
            description: `Marge actuelle: ${Math.round(margin)}%. Prix de revient: ${p.costPrice} XAF, Prix vente: ${p.sellingPrice} XAF. Envisagez une révision du prix.`,
            type: "bundle",
            priority: "low",
            actionLabel: "adjust_price",
            relatedProducts: [p._id],
          });
        }
      }
    }

    logger.info(`Analyse IA complète pour org ${organizationId}`);
  } catch (error) {
    logger.error(`Erreur IA pour org ${organizationId}:`, error);
    try {
      await saveRecommendation(organizationId, {
        title: "✨ Assistant IA en pause",
        description: "Notre assistant IA traite un volume exceptionnel de données. Réessayez dans quelques instants.",
        type: "system",
        priority: "low",
        actionLabel: "audit",
      });
    } catch (_) {}
  }
};

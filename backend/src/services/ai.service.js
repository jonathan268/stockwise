import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/Product.js";
import Recommendation from "../models/Recommendation.js";
import Organization from "../models/Organization.js";
import logger from "../utils/logger.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-1.5-flash"; // Modèle stable et rapide

/**
 * Service IA asynchrone : Analyse le stock et génère des insights métier
 */
export const generateInsightsForOrg = async (organizationId) => {
  try {
    // 1. Récupérer l'organisation & vérifier éligibilité (Starter non éligible)
    const org = await Organization.findById(organizationId);
    if (!org?.hasProAccess) {
      logger.info(`Org ${organizationId} n'a pas accès aux features IA.`);
      return;
    }

    // 2. Extraire les données pertinentes (limité aux 100 produits les plus critiques)
    const products = await Product.find({ organizationId, isDeleted: false })
      .sort({ salesVelocity: -1, currentStock: 1 }) // Forte rotation ou stock faible
      .limit(100)
      .select("name sku currentStock minimumStock sellingPrice costPrice salesVelocity status");

    if (products.length === 0) return;

    // 3. Préparer le prompt
    const prompt = `
      Tu es un expert en gestion de chaîne d'approvisionnement (Supply Chain) avec 15 ans d'expérience.
      Voici un extrait de l'inventaire d'une PME (format JSON) :
      ${JSON.stringify(products)}

      Génère 3 recommandations actionnables pour optimiser ce stock. 
      Réponds UNIQUEMENT avec un tableau JSON valide contenant des objets avec ces clés strictes :
      [
        {
          "title": "Titre court (max 50 chars)",
          "description": "Explication détaillée de la recommandation",
          "actionType": "reorder" | "discount" | "audit",
          "priority": "high" | "medium" | "low"
        }
      ]
    `;

    // 4. Appel Gemini
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    let textResponse = result.response.text();
    
    // Nettoyer les balises Markdown éventuelles renvoyées par l'IA (```json)
    textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsedInsights = JSON.parse(textResponse);

    // 5. Sauvegarder en DB
    const typeMap = { reorder: "restock", discount: "dead_stock", audit: "bundle" };
    for (const insight of parsedInsights) {
      await Recommendation.create({
        organizationId,
        title: insight.title,
        description: insight.description,
        type: typeMap[insight.actionType] || "restock",
        priority: insight.priority,
        actionLabel: insight.actionType,
      });
    }

    logger.info(`Insights IA générés avec succès pour org ${organizationId}`);
  } catch (error) {
    logger.error(`Erreur Gemini AI pour org ${organizationId}:`, error);
  }
};

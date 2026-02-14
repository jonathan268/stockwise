const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['demand_forecast', 'stock_optimization', 'anomaly_detection', 'general_insight', 'price_recommendation'],
    required: true
  },
  
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  
  // Prompt envoyé à l'IA
  input: {
    prompt: {
      type: String,
      required: true
    },
    context: {
      type: mongoose.Schema.Types.Mixed
    },
    timeframe: String,
    parameters: mongoose.Schema.Types.Mixed
  },
  
  // Réponse IA brute
  output: {
    rawResponse: {
      type: String,
      required: true
    },
    parsedData: mongoose.Schema.Types.Mixed,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  
  // Résultats structurés
  predictions: {
    nextWeekDemand: Number,
    nextMonthDemand: Number,
    nextQuarterDemand: Number,
    recommendedOrderQty: Number,
    recommendedReorderPoint: Number,
    insights: [String],
    warnings: [String],
    opportunities: [String]
  },
  
  // Métadonnées IA
  aiMetadata: {
    model: {
      type: String,
      default: 'claude-sonnet-4'
    },
    tokensUsed: Number,
    processingTime: Number, // ms
    version: String
  },
  
  // Feedback utilisateur
  feedback: {
    helpful: Boolean,
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    actualOutcome: mongoose.Schema.Types.Mixed,
    comment: String,
    submittedAt: Date,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Statut
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  
  error: {
    message: String,
    code: String
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  
}, { timestamps: true });

// Index
predictionSchema.index({ organization: 1, type: 1, createdAt: -1 });
predictionSchema.index({ product: 1, createdAt: -1 });
predictionSchema.index({ organization: 1, status: 1 });

// Méthode: Calculer accuracy
predictionSchema.methods.calculateAccuracy = function() {
  if (!this.feedback.actualOutcome || !this.predictions.nextWeekDemand) {
    return null;
  }
  
  const predicted = this.predictions.nextWeekDemand;
  const actual = this.feedback.actualOutcome.actualDemand;
  
  const error = Math.abs(predicted - actual);
  const accuracy = 1 - (error / Math.max(predicted, actual));
  
  return Math.max(0, accuracy * 100);
};

module.exports = mongoose.model('Prediction', predictionSchema);
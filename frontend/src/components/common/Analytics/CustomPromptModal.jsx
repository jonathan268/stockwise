import React, { useState } from 'react';
import { Brain, Send, X, Loader2, Sparkles } from 'lucide-react';
import Modal from '../Modal';
import { PredictionService } from '../../../services/predictionService';
import toast from 'react-hot-toast';

const CustomPromptModal = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const suggestions = [
    "Quels produits devrais-je commander cette semaine ?",
    "Analyse mes ventes des 30 derniers jours",
    "Détecte les anomalies dans mon inventaire",
    "Quels sont mes produits les plus rentables ?",
    "Comment réduire mon gaspillage ?",
    "Optimise mes commandes avec un budget de 500 000 FCFA"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast.error('Veuillez entrer une question');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const result = await PredictionService.customPrompt(prompt);

      if (result.success && result.data) {
        setResponse(result.data);
      }
    } catch (err) {
      console.error('Erreur prompt IA:', err);
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion);
  };

  const handleReset = () => {
    setPrompt('');
    setResponse(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assistant IA Personnalisé"
      size="lg"
    >
      <div className="space-y-6">
        {/* Description */}
        <div className="alert alert-info">
          <Brain size={20} />
          <span className="text-sm">
            Posez n'importe quelle question sur votre inventaire. L'IA analysera vos données et vous donnera des recommandations personnalisées.
          </span>
        </div>

        {/* Suggestions */}
        {!response && (
          <div className="space-y-3">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <Sparkles size={16} />
                Suggestions
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="btn btn-sm btn-outline"
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Votre question</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows="4"
              placeholder="Ex: Quels sont mes produits les plus rentables ce mois-ci ?"
              className="textarea textarea-bordered w-full"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            {response && (
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-ghost flex-1"
                disabled={loading}
              >
                <X size={20} />
                Nouvelle question
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Analyser
                </>
              )}
            </button>
          </div>
        </form>

        {/* Response */}
        {response && (
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="card-body">
              <h3 className="card-title text-lg flex items-center gap-2">
                <Brain size={20} className="text-primary" />
                Réponse de l'IA
              </h3>
              
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-base-content/80">
                  {response.output?.rawResponse || response.response || 'Analyse en cours...'}
                </div>
              </div>

              {response.output?.confidence && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-base-content/60">Confiance :</span>
                    <span className="font-semibold">{(response.output.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={response.output.confidence * 100}
                    max="100"
                  ></progress>
                </div>
              )}

              {response.predictions?.insights && response.predictions.insights.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Points clés :</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {response.predictions.insights.map((insight, index) => (
                      <li key={index} className="text-sm text-base-content/70">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CustomPromptModal;
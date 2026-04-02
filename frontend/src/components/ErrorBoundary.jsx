import React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Error Boundary - Capture les erreurs des composants enfants
 * Affiche une UI de secours élégante en cas d'erreur
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log l'erreur en console en développement
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Optionnel: Envoyer l'erreur à un service de monitoring
    this.reportErrorToService(error, errorInfo);
  }

  reportErrorToService = (error, errorInfo) => {
    // À implémenter avec votre service de monitoring (Sentry, LogRocket, etc.)
    // fetch('/api/logs/error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     message: error.toString(),
    //     stack: errorInfo.componentStack,
    //     timestamp: new Date().toISOString(),
    //   }),
    // });
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
              {/* Icône d'erreur */}
              <div className="mb-4 flex justify-center">
                <div className="bg-red-100 rounded-full p-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Titre et message */}
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Oups ! Une erreur s'est produite
              </h1>
              <p className="text-gray-600 mb-6">
                Nous nous excusons pour ce désagrément. Notre équipe a été
                notifiée et travaille à la résolution du problème.
              </p>

              {/* Détails en développement */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mb-6 text-left bg-gray-100 rounded p-4 text-sm">
                  <summary className="cursor-pointer font-semibold text-gray-900 mb-2">
                    Détails technique (Dev)
                  </summary>
                  <pre className="text-xs text-gray-700 overflow-auto max-h-48 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    {"\n\n"}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Réessayer
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Accueil
                </button>
              </div>

              {/* Compteur d'erreurs */}
              {this.state.errorCount > 1 && (
                <p className="mt-4 text-xs text-gray-500">
                  Nombre d'erreurs: {this.state.errorCount}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

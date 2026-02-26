import React, { useState } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AIInsightCard = ({ insight, onDismiss, onApply }) => {
  const [applying, setApplying] = useState(false);

  const getIcon = (type) => {
    const icons = {
      opportunity: TrendingUp,
      warning: AlertTriangle,
      info: Info,
      danger: TrendingDown
    };
    return icons[type] || Brain;
  };

  const getColors = (type) => {
    const colors = {
      opportunity: {
        bg: 'bg-success/10 border-success/20',
        icon: 'text-success',
        badge: 'badge-success'
      },
      warning: {
        bg: 'bg-warning/10 border-warning/20',
        icon: 'text-warning',
        badge: 'badge-warning'
      },
      info: {
        bg: 'bg-info/10 border-info/20',
        icon: 'text-info',
        badge: 'badge-info'
      },
      danger: {
        bg: 'bg-error/10 border-error/20',
        icon: 'text-error',
        badge: 'badge-error'
      }
    };
    return colors[type] || colors.info;
  };

  const Icon = getIcon(insight.type);
  const colors = getColors(insight.type);

  const handleApply = async () => {
    if (!onApply) return;

    setApplying(true);
    try {
      await onApply(insight);
      toast.success('Recommandation appliquée');
    } catch (err) {
      toast.error('Erreur lors de l\'application');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className={`card ${colors.bg} border relative`}>
      <div className="card-body">
        {onDismiss && (
          <button
            onClick={() => onDismiss(insight.id)}
            className="btn btn-ghost btn-xs btn-circle absolute top-2 right-2"
          >
            <X size={14} />
          </button>
        )}

        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon size={20} className={colors.icon} />
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold">{insight.title}</h3>
              {insight.confidence && (
                <div className={`badge badge-sm ${colors.badge}`}>
                  {insight.confidence}%
                </div>
              )}
            </div>

            <p className="text-sm text-base-content/70 mb-3">
              {insight.message}
            </p>

            {insight.confidence && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-base-content/60 mb-1">
                  <span>Confiance IA</span>
                  <span className="font-semibold">{insight.confidence}%</span>
                </div>
                <progress
                  className="progress progress-primary w-full h-1"
                  value={insight.confidence}
                  max="100"
                ></progress>
              </div>
            )}

            {insight.action && (
              <button
                onClick={handleApply}
                className={`btn btn-sm btn-outline w-full ${applying ? 'loading' : ''}`}
                disabled={applying}
              >
                {!applying && <CheckCircle size={16} />}
                {insight.action}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightCard;
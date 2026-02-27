import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, change, trend, icon: Icon, color, loading = false }) => {
  if (loading) {
    return (
      <div className="card bg-base-100 shadow-lg animate-pulse">
        <div className="card-body">
          <div className="h-4 bg-base-300 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-base-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-base-300 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-base-content/60 font-medium">{title}</p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
            {change && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <TrendingUp size={16} className="text-success" />
                ) : (
                  <TrendingDown size={16} className="text-error" />
                )}
                <span className={`text-sm font-semibold ${trend === 'up' ? 'text-success' : 'text-error'}`}>
                  {change}
                </span>
                <span className="text-sm text-base-content/60">vs mois dernier</span>
              </div>
            )}
          </div>
          <div className={`${color} p-3 rounded-lg`}>
            <Icon size={24} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

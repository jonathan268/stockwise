import React from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

const SalesChart = ({ data, period = '7d' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">
            <BarChart3 size={24} />
            Évolution des ventes
          </h2>
          <div className="text-center py-12 text-base-content/60">
            Aucune donnée disponible
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.sales || 0));
  const totalSales = data.reduce((sum, d) => sum + (d.sales || 0), 0);
  const avgSales = totalSales / data.length;
  const totalOrders = data.reduce((sum, d) => sum + (d.orders || 0), 0);

  // Calculer la tendance
  const firstHalf = data.slice(0, Math.ceil(data.length / 2));
  const secondHalf = data.slice(Math.ceil(data.length / 2));
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.sales, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.sales, 0) / secondHalf.length;
  const trend = secondAvg > firstAvg ? 'up' : 'down';
  const trendPercent = Math.abs(((secondAvg - firstAvg) / firstAvg) * 100).toFixed(1);

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">
            <BarChart3 size={24} />
            Évolution des ventes
          </h2>
          <div className={`badge gap-2 ${trend === 'up' ? 'badge-success' : 'badge-error'}`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trendPercent}%
          </div>
        </div>

        <div className="space-y-3">
          {data.map((day, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-sm font-semibold">{day.period}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-base-content/60">
                    {day.orders || 0} commandes
                  </span>
                  <span className="text-sm font-semibold">
                    {(day.sales || 0).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="relative">
                  <progress
                    className="progress progress-primary w-full"
                    value={day.sales || 0}
                    max={maxValue}
                  ></progress>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="divider"></div>

        <div className="stats stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title text-xs">Total</div>
            <div className="stat-value text-lg">
              {totalSales.toLocaleString('fr-FR')} FCFA
            </div>
            <div className="stat-desc">{totalOrders} commandes</div>
          </div>
          <div className="stat">
            <div className="stat-title text-xs">Moyenne/jour</div>
            <div className="stat-value text-lg">
              {Math.round(avgSales).toLocaleString('fr-FR')} FCFA
            </div>
            <div className="stat-desc">{Math.round(totalOrders / data.length)} commandes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
import { motion } from "framer-motion";

export function CardSkeleton({ className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`card bg-base-100 shadow-sm border border-base-content/5 ${className}`}
    >
      <div className="card-body p-5 space-y-3">
        <div className="h-3 w-1/3 rounded bg-base-content/5 animate-pulse" />
        <div className="h-8 w-2/3 rounded bg-base-content/5 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-base-content/5 animate-pulse" />
      </div>
    </motion.div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-content/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i}>
                  <div className="h-4 w-16 rounded bg-base-content/10 animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c}>
                    <div
                      className="h-4 rounded bg-base-content/5 animate-pulse"
                      style={{ width: `${40 + Math.random() * 40}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-content/5">
      <div className="card-body">
        <div className="h-5 w-48 rounded bg-base-content/10 animate-pulse mb-4" />
        <div className="h-[220px] rounded-xl bg-base-content/5 animate-pulse" />
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50"
        >
          <div className="w-10 h-10 rounded-xl bg-base-content/10 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-base-content/10 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-base-content/5 animate-pulse" />
          </div>
          <div className="text-right space-y-2">
            <div className="h-4 w-20 rounded bg-base-content/10 animate-pulse" />
            <div className="h-3 w-16 rounded bg-base-content/5 animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="h-8 w-64 rounded bg-base-content/10 animate-pulse" />
        <div className="h-4 w-48 rounded bg-base-content/5 animate-pulse mt-2" />
      </div>
      <KPISkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-sm border border-base-content/5">
          <div className="card-body">
            <div className="h-5 w-36 rounded bg-base-content/10 animate-pulse mb-4" />
            <ListSkeleton />
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-content/5">
          <div className="card-body">
            <div className="h-5 w-36 rounded bg-base-content/10 animate-pulse mb-4" />
            <ListSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

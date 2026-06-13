import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "../store/toastStore";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: "bg-success/10 text-success border-success/20",
  error: "bg-error/10 text-error border-error/20",
  info: "bg-info/10 text-info border-info/20",
  warning: "bg-warning/10 text-warning border-warning/20",
};

const bgColors = {
  success: "bg-success",
  error: "bg-error",
  info: "bg-info",
  warning: "bg-warning",
};

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl border shadow-lg backdrop-blur-md max-w-sm ${colors[toast.type]} bg-base-100/90`}
            >
              <div className={`p-1 rounded-full shrink-0 ${bgColors[toast.type]}`}>
                <Icon size={14} className="text-base-100" />
              </div>
              <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
              <button
                onClick={() => remove(toast.id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
              <ToastProgress duration={toast.duration} toastId={toast.id} type={toast.type} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function ToastProgress({ duration, toastId, type }) {
  const [progress, setProgress] = useState(100);
  const toasts = useToastStore((s) => s.toasts);
  const exists = toasts.some((t) => t.id === toastId);

  useEffect(() => {
    if (!exists || duration <= 0) return;
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [duration, toastId, exists]);

  if (duration <= 0) return null;

  return (
    <span
      className="absolute bottom-0 left-0 h-0.5 rounded-full"
      style={{
        width: `${progress}%`,
        backgroundColor: `oklch(var(--${type === "error" ? "er" : type === "success" ? "su" : type === "warning" ? "wa" : "in"}) / 0.5)`,
        transition: "width 0.05s linear",
      }}
    />
  );
}

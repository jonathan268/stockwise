import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "../store/toastStore";

const actions = [
  { key: "G D", label: "Dashboard", path: "/dashboard" },
  { key: "G P", label: "Produits", path: "/products" },
  { key: "G V", label: "Ventes", path: "/sales" },
  { key: "G F", label: "Fournisseurs", path: "/suppliers" },
  { key: "G M", label: "Mouvements", path: "/movements" },
  { key: "G A", label: "Alertes", path: "/alerts" },
  { key: "G I", label: "Analyses IA", path: "/insights" },
  { key: "G S", label: "Paramètres", path: "/settings" },
  { key: "N", label: "Nouveau produit", action: "new-product" },
  { key: "C", label: "Nouvelle vente", action: "new-sale" },
];

export default function KeyboardShortcuts() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const filtered = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(search.toLowerCase()) ||
      a.key.toLowerCase().includes(search.toLowerCase()),
  );

  const execute = useCallback(
    (action) => {
      setOpen(false);
      setSearch("");
      if (action.path) {
        navigate(action.path);
        toast.success(`Navigation vers ${action.label}`);
      } else if (action.action === "new-product") {
        toast.info("Ouvrez la page Produits pour créer");
        navigate("/products");
      } else if (action.action === "new-sale") {
        toast.info("Ouvrez la page Ventes pour créer");
        navigate("/sales");
      }
    },
    [navigate, toast],
  );

  useEffect(() => {
    const down = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setSearch("");
        setSelectedIdx(0);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && filtered[selectedIdx]) {
        e.preventDefault();
        execute(filtered[selectedIdx]);
        return;
      }
      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        // Will be handled by g + key combos
        return;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, filtered, selectedIdx, execute]);

  // Global G+key navigation
  useEffect(() => {
    let gPressed = false;
    let gTimer;

    const down = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        gPressed = true;
        gTimer = setTimeout(() => {
          gPressed = false;
        }, 500);
        return;
      }
      if (gPressed) {
        clearTimeout(gTimer);
        gPressed = false;
        const key = e.key.toUpperCase();
        const match = actions.find((a) => a.key === `G ${key}`);
        if (match && match.path) {
          e.preventDefault();
          navigate(match.path);
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => {
      document.removeEventListener("keydown", down);
      clearTimeout(gTimer);
    };
  }, [navigate]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh]"
        >
          <div className="fixed inset-0 bg-base-content/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-lg bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-base-content/10">
              <input
                autoFocus
                type="text"
                placeholder="Rechercher une action..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0); }}
                className="input input-ghost w-full text-base bg-transparent outline-none border-none focus:outline-none"
              />
              <kbd className="text-[10px] font-mono px-2 py-1 rounded bg-base-content/10 text-base-content/40 font-bold">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-base-content/40 font-medium">Aucun résultat</div>
              ) : (
                filtered.map((action, idx) => (
                  <button
                    key={action.key}
                    onClick={() => execute(action)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-left transition-colors ${
                      idx === selectedIdx ? "bg-primary/10 text-primary" : "hover:bg-base-content/5"
                    }`}
                  >
                    <span className="font-medium">{action.label}</span>
                    <kbd className="text-[10px] font-mono px-2 py-1 rounded bg-base-content/10 text-base-content/50 font-bold">
                      {action.key}
                    </kbd>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

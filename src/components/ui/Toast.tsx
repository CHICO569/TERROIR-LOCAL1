import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 bg-natural-primary text-white px-8 py-4 rounded-2xl shadow-2xl shadow-natural-primary/30 min-w-[320px]"
        >
          <div className="bg-white/20 p-2 rounded-xl">
             <ShoppingBag size={20} />
          </div>
          <p className="flex-1 text-sm font-black uppercase tracking-widest break-words">{message}</p>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { Product } from '../../types';
import { X, ShoppingBag, Leaf, ShieldCheck, Clock, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, cn } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();

  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-natural-primary/40 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-3 bg-white/80 backdrop-blur rounded-2xl hover:rotate-90 transition-transform shadow-lg"
          >
            <X size={24} className="text-natural-primary" />
          </button>

          {/* Image Section */}
          <div className="w-full md:w-1/2 h-[300px] md:h-auto relative bg-natural-bg">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-6 left-6 flex flex-col gap-3">
              <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm text-natural-primary border border-natural-border">
                {product.category}
              </span>
              {product.stock < 10 && (
                <span className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Rare : {product.stock} restants
                </span>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 p-8 md:p-12 space-y-8 flex flex-col">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-natural-accent">
                <Leaf size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Provenance : Regionale</span>
              </div>
              <h2 className="text-4xl font-black font-serif text-natural-primary leading-tight">{product.name}</h2>
              <p className="text-natural-secondary leading-relaxed font-medium">
                {product.description || "Un produit d'exception issu de nos coopératives locales. Récolté à la main et traité sans pesticides chimiques pour préserver toute sa saveur et ses vertus nutritives."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[
                 { icon: <ShieldCheck size={18} />, label: '100% Bio' },
                 { icon: <Clock size={18} />, label: 'Récolte Fraîche' },
                 { icon: <Truck size={18} />, label: 'Livré en 24h' },
                 { icon: <ShoppingBag size={18} />, label: 'Vendu au kilo' }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3 p-4 bg-natural-bg rounded-2xl border border-natural-border/50">
                    <div className="text-natural-primary">{item.icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-natural-secondary">{item.label}</span>
                 </div>
               ))}
            </div>

            <div className="pt-8 mt-auto border-t border-natural-border flex items-center justify-between gap-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-natural-secondary mb-1">Prix Unitaire</p>
                <p className="text-3xl font-black text-natural-primary">{formatPrice(product.price)}</p>
              </div>
              <button 
                onClick={() => {
                  addItem(product);
                  onClose();
                }}
                className="flex-1 bg-natural-primary text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-natural-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Ajouter au Panier
                <ShoppingBag size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

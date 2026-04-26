/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../../types';
import { ShoppingCart, Plus, Minus, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: () => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="bg-white border border-natural-border rounded-[32px] overflow-hidden group hover:shadow-2xl hover:shadow-natural-primary/5 transition-all duration-500"
    >
      <div 
        className="relative aspect-[4/5] overflow-hidden bg-natural-bg flex items-center justify-center p-8 cursor-pointer"
        onClick={onSelect}
      >
        <img 
          src={product.imageUrl || `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400`} 
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        {product.stock < 5 && (
          <div className="absolute top-4 right-4 bg-natural-accent text-white text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest animate-pulse shadow-lg">
            Stock Limité
          </div>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-natural-border text-natural-primary text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest">
          {product.category}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-natural-text mb-1 font-serif leading-tight">{product.name}</h3>
            <p className="text-[10px] text-natural-secondary font-black uppercase tracking-widest flex items-center gap-1">
              {product.producer}
            </p>
          </div>
          <p className="text-xl font-black text-natural-primary">{formatPrice(product.price)}</p>
        </div>
        
        <p className="text-sm text-natural-secondary line-clamp-2 mb-6 min-h-[40px] font-medium leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => addItem(product)}
             disabled={product.stock <= 0}
             className="flex-1 bg-natural-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-natural-primary/20"
           >
             {product.stock > 0 ? (
               <>
                 <ShoppingCart size={16} />
                 Acheter
               </>
             ) : 'Épuisé'}
           </button>
           <div className="bg-natural-bg px-3 py-4 rounded-2xl border border-natural-border text-[10px] font-black text-natural-primary">
             ST:{product.stock}
           </div>
        </div>
      </div>
    </motion.div>
  );
}

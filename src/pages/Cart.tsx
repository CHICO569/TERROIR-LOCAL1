/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CartPageProps {
  onCheckout: () => void;
  onGoBack: () => void;
}

export function Cart({ onCheckout, onGoBack }: CartPageProps) {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="bg-white p-16 rounded-[60px] border border-natural-border mb-8 shadow-sm">
          <ShoppingBag size={80} className="text-natural-secondary/20" />
        </div>
        <h2 className="text-4xl font-bold font-serif mb-4 text-natural-primary">Votre panier est vide</h2>
        <p className="text-natural-secondary mb-12 max-w-sm font-medium">L'aventure commence par un bon produit du terroir.</p>
        <button 
          onClick={onGoBack}
          className="bg-natural-primary text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-natural-primary/20 active:scale-95 transition-all"
        >
          Découvrir les produits
        </button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-12 items-start">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between mb-4 border-b border-natural-border pb-8">
          <h1 className="text-4xl font-black font-serif text-natural-primary">Panier Récolte</h1>
          <button 
            onClick={onGoBack}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-primary flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft size={14} />
            Retour Boutique
          </button>
        </div>

        {items.map((item) => (
          <motion.div 
            key={item.productId}
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-natural-border p-8 rounded-[32px] flex flex-col sm:flex-row items-center gap-8 group hover:shadow-xl hover:shadow-natural-primary/5 transition-all"
          >
            <div className="w-24 h-24 bg-natural-bg rounded-2xl overflow-hidden shrink-0 border border-natural-border p-4">
               <img src={`https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            
            <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-natural-text font-serif">{item.name}</h3>
                <p className="text-[10px] font-black text-natural-primary uppercase tracking-widest">{formatPrice(item.unitPrice)} / unité</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-10">
                 <div className="flex items-center bg-natural-bg rounded-xl p-1.5 border border-natural-border">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors text-natural-primary"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors text-natural-primary"
                    >
                      <Plus size={14} />
                    </button>
                 </div>

                 <p className="text-lg font-black text-natural-primary min-w-[100px] text-right">
                   {formatPrice(item.unitPrice * item.quantity)}
                 </p>

                 <button 
                   onClick={() => removeItem(item.productId)}
                   className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                 >
                   <Trash2 size={18} />
                 </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Résumé */}
      <div className="bg-white border border-natural-border p-10 rounded-[40px] sticky top-32 shadow-2xl shadow-natural-primary/5">
         <h3 className="text-xl font-bold mb-8 font-serif text-natural-primary border-b border-natural-bg pb-4">Résumé de Commande</h3>
         
         <div className="space-y-5 mb-10">
            <div className="flex justify-between text-natural-secondary font-medium text-sm">
               <span>Sous-total terroir</span>
               <span className="font-black text-natural-text">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-natural-secondary font-medium text-sm">
               <span>Livraison coopérative</span>
               <span className="text-natural-primary font-black uppercase tracking-widest text-[10px] bg-natural-primary/5 px-3 py-1 rounded-full">Offerte</span>
            </div>
            <div className="border-t border-natural-bg pt-6 flex justify-between items-center">
               <span className="text-lg font-bold font-serif">Total à payer</span>
               <span className="text-3xl font-black text-natural-primary tracking-tighter">{formatPrice(total)}</span>
            </div>
         </div>

         <div className="bg-natural-bg p-6 rounded-2xl border border-natural-border mb-10">
            <div className="flex items-center gap-4 text-[10px] text-natural-secondary font-bold uppercase tracking-[0.1em] leading-relaxed">
               <Truck size={20} className="text-natural-accent shrink-0" />
               <p>Livraison estimée sous <span className="text-natural-primary font-black">24H</span> à votre domicile.</p>
            </div>
         </div>

         <button 
           onClick={onCheckout}
           className="w-full bg-natural-accent text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 shadow-xl shadow-natural-accent/20 transition-all active:scale-95"
         >
           Finaliser ma commande
           <ArrowRight size={16} />
         </button>

         <p className="mt-8 text-center text-[9px] text-natural-secondary font-black uppercase tracking-widest leading-relaxed">
           Paiement 100% sécurisé via Wave • Soutien local Garanti
         </p>
      </div>
    </div>
  );
}
